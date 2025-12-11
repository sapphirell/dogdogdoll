<template>
  <view>
    <meta name="theme-color" content="#F8F8F8"></meta>
    <view-logs></view-logs>

    <image :src="brand.logo_image" mode="aspectFit" class="brand_logo"></image>

    <view class="body">
      <view>
        <image :src="brand.brand_name_image" mode="heightFix" style="height: 60rpx;"></image>
        <text style="float: right;margin: 5px 0px;">{{brand.country_name}} / {{brand.type}}</text>
        <view style="clear: both;"></view>
      </view>

      <!-- 评分 + 关注 -->
      <view style="margin: 20rpx 0rpx;display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;">
        <view style="display: flex; align-items: center; flex-grow: 1;">
          <uni-rate style="margin-top: 5px;" :value="brand.score" allow-half="true" activeColor="#65C3D6"
            @change="onRateChange" is-fill="false" />
          <text style="margin-left: 8rpx; position: relative; top: 5px;">
            {{brand.score}}（{{brand.vote_number}}次评分)
          </text>
        </view>
        <text class="follow" @click="likeBrand" :style="{ background: hasLikeBrand ? '#ff6a6c' : '#65C3D6' }">
          {{ hasLikeBrand ? '已关注' : '+ 关注品牌' }}
        </text>
      </view>

      <view style="margin-top: 15px;">
        <text>别名：{{brand.nickname_list || "暂无设置"}}</text>
      </view>
      <view style="margin-top: 10px;">
        <text>简介：{{brand.description || "暂未设置"}}</text>
      </view>
      <view style="margin-top: 10px;">
        <text @tap="copyUrl(brand.website_url)">贩售地址：点击复制</text>
      </view>

      <!-- Tab -->
      <view class="tabs-container">
        <view v-for="(tab, index) in tabs" :key="index" class="tab-item"
          :class="{ 'active-tab': activeTab === index }" @click="switchTab(index)">
          <text>{{ tab.label }}</text>
        </view>
      </view>

      <!-- 贩售作品 -->
      <view v-show="activeTab === 0">
        <view class="brand_goods">
          <view class="brand_goods_item" v-for="(item, index) in goods.goods_list" :key="item.id">
            <navigator @click="jumpGoods(item.id)" style="width: 100%;height: 100%;">
              <view style="width: 100%;height: calc(100% - 20px)">
                <image style="width: 100%;height: 100%;" :src="item.goods_images[0]" mode="aspectFill" class="brand_goods_image"></image>
              </view>
              <text style="display: block;width: 100%;text-align: center;font-weight: 900;color: #586f88">{{item.name}}</text>
            </navigator>
          </view>
        </view>
        <button class="load_more" @click="getBrandGoods(true)">加载更多</button>
      </view>

      <!-- 消息动态 -->
      <view v-show="activeTab === 1">
        <view class="news-list" style="display: flex; flex-wrap: wrap; justify-content: space-between;">
          <view class="news-item" style="position: relative; width: calc(50% - 10px); margin-bottom: 20px;"
            v-for="(item, index) in newsList" :key="item.id">
            <view class="news-header">
              <text class="news-header-title">{{item.title}}</text>
            </view>

            <view class="news-images" v-if="item.image_list && item.image_list.length > 0">
              <swiper class="image-swiper" :autoplay="true" :circular="true" indicator-dots>
                <swiper-item v-for="(img, imgIndex) in item.image_list" :key="imgIndex">
                  <image :src="img" mode="aspectFill" class="swiper-image" @click="jump2saleNews(item)" />
                </swiper-item>
              </swiper>
            </view>

            <view class="news-content">{{item.content}}</view>

            <view class="news-footer">
              <text class="news-time">{{formatTimestamp(item.created_at)}}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 接单主页（存在才显示这个 Tab） -->
      <view v-show="activeTab === 2">
        <view style="text-align: center; padding: 50rpx 0;">
          <button class="artist-button" @click="jumpToArtistPage">
            <text>前往接单主页</text>
            <uni-icons type="arrow-right" size="20" color="#65C3D6"></uni-icons>
          </button>
        </view>
      </view>

      <!-- 评论区 -->
      <view>
        <comment-list ref="commentListRef" :type="1" :relation-id="numericBrandId" @reply="handleReplyComment" />
      </view>
    </view>

    <view style="height: 80px;"></view>

    <!-- 输入框（激活时再挂载） -->
    <comment-input
      v-if="showCommentInput"
      ref="commentInputRef"
      :reply-info="replyForItem"
      :target-id="String(currentBrandId)"
      @submit="handleCommentSubmit"
      @update:reply-info="val => replyForItem = val"
    />
  </view>
</template>

<script setup>
import { ref, computed, watch, onActivated, onDeactivated } from 'vue'
import { websiteUrl, getUserInfo, global } from '../../common/config.js'
import { onShow } from '@dcloudio/uni-app'

const props = defineProps(['brand_id'])

/** ====== 兼容 KeepAlive 的 brand_id 热切换 ====== */
const currentBrandId = ref(String(props.brand_id || ''))
const lastBrandId = ref(currentBrandId.value)
const numericBrandId = computed(()=> parseInt(currentBrandId.value || '0'))

function parseBrandIdFromRoute () {
  // 1) 小程序/APP/H5-uni-router
  try {
    const pages = getCurrentPages?.() || []
    const top = pages[pages.length - 1]
    if (top?.options?.brand_id) return String(top.options.brand_id)
  } catch {}

  // 2) H5 回退兜底：从 hash 解析
  if (typeof location !== 'undefined' && location.hash) {
    const m = location.hash.match(/[?&]brand_id=(\d+)/)
    if (m && m[1]) return m[1]
  }
  return ''
}

async function reloadByBrandId (newId, source='unknown') {
  console.log(`【品牌】reloadByBrandId 来源=${source} id=${newId}`)
  currentBrandId.value = String(newId)
  lastBrandId.value = String(newId)

  // 重置本页状态
  page.value = 1
  goods.value = { goods_list: [], page_index: 1, total: 0 }
  newsList.value = []
  newsPage.value = { page_index: 1, page_size: 10, total: 0 }
  rateValue.value = 0
  myRateValue.value = 0
  hasLikeBrand.value = false

  // 重新拉取
  getBrandsInfo(currentBrandId.value)
  getBrandGoods(false, currentBrandId.value)
  getBrandNews(currentBrandId.value)
  if (global.isLogin) {
    getMyScore(1, currentBrandId.value)
    getHasLikeBrand(currentBrandId.value)
  } else {
    hasLikeBrand.value = false
  }
}

/** ====== Tab & 评分/关注 ====== */
const activeTab = ref(0)
const hasAddedArtistTab = ref(false)
const tabs = ref([{ label: '贩售作品' }, { label: '消息动态' }])
const switchTab = (i)=> { activeTab.value = i }

const hasLikeBrand = ref(false)
let newsList = ref([])
let newsPage = ref({ page_index: 1, page_size: 10, total: 0 })

uni.showLoading({ title: '加载中' })

const rateValue = ref(0)
const myRateValue = ref(0)

/** ====== 评论引用/输入 ====== */
const commentListRef = ref(null)
const commentInputRef = ref(null)
let replyForItem = ref({})
const showCommentInput = ref(false)
onActivated(() => { showCommentInput.value = true })
onDeactivated(() => { showCommentInput.value = false })

const handleReplyComment = ({ parent, target }) => {
  const item = target ?? parent
  if (replyForItem.value.id === item.id) { replyForItem.value = {}; return }
  replyForItem.value = item
  commentInputRef.value?.focusInput()
}

const handleCommentSubmit = (submitData) => {
  let token = uni.getStorageSync('token')
  if (!global.isLogin) { uni.showToast({ title: '请先登录', icon: 'none' }); return }

  const requestData = {
    content: submitData.content, origin: submitData.origin,
    target_id: numericBrandId.value, type: 1,
    image_url: submitData.image_url || "",
    association_id: submitData.association_id || 0,
    association_type: submitData.association_type || 0,
    is_anonymous: submitData.is_anonymous || 0,
    ...(replyForItem.value.id && {
      reply_id: replyForItem.value.id,
      reply_for: replyForItem.value.comment,
      reply_uid: replyForItem.value.user_id,
      parent_id: replyForItem.value.parent_id > 0 ? replyForItem.value.parent_id : replyForItem.value.id,
    })
  }

  // 临时评论
  const tempComment = {
    id: Date.now(), content: submitData.content, created_at: Math.floor(Date.now()/1000),
    like_count: 0, reply_count: 0, is_liked: false, floor: 0,
    ...(submitData.is_anonymous ? {
      avatar: "https://images1.fantuanpu.com/home/default_avatar.jpg", username: "匿名用户", is_anonymous: 1
    } : {
      avatar: global.userInfo.avatar, username: global.userInfo.nickname, is_anonymous: 0
    }),
    ...(submitData.association_id && { association_id: submitData.association_id, association_type: submitData.association_type }),
    ...(submitData.image_url && { image_url: submitData.image_url }),
    ...(replyForItem.value.id && {
      reply_id: replyForItem.value.id,
      reply_for: replyForItem.value.comment,
      reply_uid: replyForItem.value.user_id,
      parent_id: replyForItem.value.parent_id > 0 ? replyForItem.value.parent_id : replyForItem.value.id,
      reply_username: replyForItem.value.is_anonymous ? '匿名用户' : replyForItem.value.username
    })
  }

  if (!replyForItem.value.id) commentListRef.value?.addNewComment(tempComment)
  else if (replyForItem.value.parent_id === 0) commentListRef.value?.addReplyComment({ ...tempComment, parent_id: replyForItem.value.id })
  else commentListRef.value?.addReplyComment({ ...tempComment, parent_id: replyForItem.value.parent_id })

  uni.request({
    url: websiteUrl.value + '/with-state/add-comment', method: 'POST',
    header: { 'Authorization': token }, data: requestData,
    success: (res) => {
      if (res.data.status === 'success') {
        const newComment = res.data.data
        const finalComment = {
          ...newComment,
          ...(submitData.is_anonymous ? {
            avatar: "https://images1.fantuanpu.com/home/default_avatar.jpg", username: "匿名用户", is_anonymous: 1
          } : {
            avatar: global.userInfo.avatar, username: global.userInfo.nickname, is_anonymous: 0
          })
        }
        if (newComment.reply_uid && replyForItem.value.is_anonymous) finalComment.reply_username = '匿名用户'
        commentListRef.value?.updateTempComment(tempComment.id, finalComment)
        uni.showToast({ title: '评论成功', icon: 'success' })
      } else {
        commentListRef.value?.removeTempComment(tempComment.id)
        uni.showToast({ title: res.data.msg, icon: 'none' })
      }
    },
    fail: () => {
      commentListRef.value?.removeTempComment(tempComment.id)
      uni.showToast({ title: '网络请求失败', icon: 'none' })
    }
  })
}

/** ====== 评分 ====== */
const onRateChange = (e) => {
  if (!global.isLogin) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    rateValue.value = 0
    return
  }
  rateValue.value = e.value
  myRateValue.value = e.value
  voteScoreProxy()
}

async function voteScoreProxy () {
  if (rateValue.value == 0) { uni.showToast({ title: '请先评分', icon: 'none' }); return }
  let token = uni.getStorageSync('token'); if (!token) { uni.showToast({ title: '请先登录', icon: 'none' }); return }

  try {
    uni.showLoading({ title: '提交中...' })
    const res = await uni.request({
      url: websiteUrl.value + '/with-state/add-vote-score',
      method: 'POST',
      header: { 'Authorization': token, 'Content-Type': 'application/json' },
      data: { type: 1, score: rateValue.value, target_id: numericBrandId.value }
    })
    uni.hideLoading()
    if (res.data.status === 'success') {
      getBrandsInfo(currentBrandId.value)
      uni.showToast({ title: '评分成功', icon: 'success' })
    } else {
      uni.showToast({ title: res.data.msg || '评分失败', icon: 'none' })
    }
  } catch (err) {
    uni.hideLoading()
    uni.showToast({ title: '评分失败，请重试', icon: 'none' })
  }
}

/** ====== 数据拉取 ====== */
let goods = ref({})
let page = ref(1)
let brand = ref({})

function getBrandNews (brandId = currentBrandId.value) {
  uni.request({
    url: `${websiteUrl.value}/brand-news-list?brand_id=${brandId}&page=${newsPage.value.page_index}&page_size=${newsPage.value.page_size}`,
    method: 'GET',
    success: (res) => {
      if (res.data.status === 'success') {
        const data = res.data.data
        newsList.value = [...newsList.value, ...(data.news_list || [])]
        newsPage.value.total = data.total || 0
        if (data.news_list && data.news_list.length > 0) newsPage.value.page_index += 1
      } else {
        uni.showToast({ title: res.data.msg || '获取图透失败', icon: 'none' })
      }
    },
    fail: () => uni.showToast({ title: '网络请求失败', icon: 'none' })
  })
}

function getBrandsInfo (brandId = currentBrandId.value) {
  uni.request({
    url: websiteUrl.value + '/brand-info?id=' + brandId,
    method: 'GET',
    timeout: 5000,
    success: (res) => {
      brand.value = res.data.data || {}
      uni.setNavigationBarTitle({ title: brand.value.brand_name || '品牌' })
      getHasLikeBrand(brandId)

      // 动态追加“接单主页”tab
      if (!hasAddedArtistTab.value && (brand.value.is_bjd_artist == 1 || brand.value.is_bjd_hairstylist == 1)) {
        tabs.value.push({ label: '接单主页' })
        hasAddedArtistTab.value = true
      }
    },
    fail: () => uni.showToast({ title: '网络请求失败', icon: 'none' }),
    complete: () => uni.hideLoading()
  })
}

function getBrandGoods (isLoadMore = false, brandId = currentBrandId.value) {
  uni.request({
    url: websiteUrl.value + '/brand-goods?brand_id=' + brandId + "&page=" + page.value,
    method: 'GET',
    timeout: 5000,
    success: (res) => {
      const data = res.data.data || { goods_list: [], total: 0, page_index: 1 }
      goods.value.page_index = data.page_index
      goods.value.total = data.total
      if (isLoadMore) goods.value.goods_list = (goods.value.goods_list || []).concat(data.goods_list || [])
      else goods.value.goods_list = data.goods_list || []

      if (data.goods_list && data.goods_list.length > 0) page.value += 1
      if (isLoadMore && (!data.goods_list || data.goods_list.length === 0) && page.value > 1) {
        uni.showToast({ title: '没有更多数据了', icon: 'none' })
      }
    },
    fail: () => uni.showToast({ title: '网络请求失败', icon: 'none' })
  })
}

const jumpToArtistPage = () => {
  uni.navigateTo({ url: `/pages/artist_info/bjd_faceup_artist?brand_id=${currentBrandId.value}` })
}

const likeBrand = async () => {
  let token = uni.getStorageSync('token')
  if (!global.isLogin) { uni.showToast({ title: '请先登录', icon: 'none' }); return }

  try {
    const url = `${websiteUrl.value}/with-state/${hasLikeBrand.value ? 'unlike' : 'add-like'}`
    const res = await uni.request({
      url, method: 'POST',
      header: { Authorization: token },
      data: { id: numericBrandId.value, type: 2 }
    })
    if (res.data.status === 'success') {
      hasLikeBrand.value = !hasLikeBrand.value
      uni.showToast({ title: hasLikeBrand.value ? '关注成功' : '已取消关注', icon: 'none' })
      getBrandsInfo(currentBrandId.value)
    } else {
      uni.showToast({ title: res.data.msg || '操作失败', icon: 'none' })
    }
  } catch {
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

const getHasLikeBrand = async (brandId = currentBrandId.value) => {
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/hasLike?id=${parseInt(brandId)}&type=2`,
      method: 'POST',
      header: { Authorization: uni.getStorageSync('token') || '' },
    })
    hasLikeBrand.value = !!(res.data?.data?.id > 0)
  } catch (err) {}
}

/** ====== 工具 ====== */
function formatTimestamp(ts) {
  const d = new Date(ts * 1000)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${h}:${mm}`
}

function jumpGoods(id) {
  uni.navigateTo({ url: '/pages/goods/goods?goods_id=' + id })
}

function jump2saleNews(item) {
  uni.navigateTo({ url: `/pages/sale_news/sale_news?id=${item.id}&brand_id=${item.brand_id}` })
}

const copyUrl = (url) => {
  if (!url) { uni.showToast({ title: '暂无贩售地址', icon: 'none' }); return }
  if (myRateValue.value === 0) { uni.showToast({ title: '请先评分后再复制', icon: 'none' }); return }
  uni.setClipboardData({
    data: url,
    success: () => uni.showToast({ title: '已复制贩售地址', icon: 'success' }),
    fail: () => uni.showToast({ title: '复制失败', icon: 'none' })
  })
}

function getMyScore(type, targetId) {
  let token = uni.getStorageSync('token')
  if (!token || !global.isLogin) return
  uni.request({
    url: websiteUrl.value + '/with-state/my-vote-record',
    method: 'GET',
    header: { 'Authorization': token, 'Content-Type': 'application/json' },
    data: { target_id: parseInt(targetId), type },
    success: (res) => { if (res.data.status === 'success') myRateValue.value = res.data.data.score || 0 },
  })
}

/** ====== 生命周期 ====== */
onShow(() => {
  getUserInfo()

  const idFromRoute = parseBrandIdFromRoute()
  const newId = String(idFromRoute || currentBrandId.value || '')
  console.log('[品牌] 当前 URL/路由 brand_id =', newId)

  if (newId && newId !== lastBrandId.value) {
    console.log('【品牌】onShow 检测到ID变化：', lastBrandId.value, '→', newId)
    reloadByBrandId(newId, 'onShow')
  } else {
    console.log('【品牌】onShow 无ID变化，轻刷新。')
    if (!brand.value.id) getBrandsInfo(currentBrandId.value)
    if (newsList.value.length === 0) getBrandNews(currentBrandId.value)
    if (!goods.value.goods_list || goods.value.goods_list.length === 0) getBrandGoods(false, currentBrandId.value)
    if (global.isLogin && myRateValue.value === 0) getMyScore(1, currentBrandId.value)
  }
})
</script>

<style lang="less" scoped>
/* —— 样式保持你原来的（下面为原样式拷贝） —— */
.brand_logo { width: calc(100vw - 10px); display: block; margin: 5px; float: left; }
.body { width: 100vw; opacity: 1; border-radius: 25px; background: white; box-shadow: 0px -10px 12px rgba(0, 0, 0, 0.05); overflow: hidden; padding: 20px; box-sizing: border-box; }
.brand_goods { display: flex; flex-wrap: wrap; gap: 16px;
  .brand_goods_item { flex: 1 1 calc(33.33% - 12px); width: calc(33.33% - 12px); max-width: calc(33.33% - 12px); height: 140px; aspect-ratio: 1; color: white; display: flex; align-items: center; justify-content: center; font-size: 20px; border-radius: 8px; overflow: hidden; }
}
.follow { padding: 12rpx 30rpx; border-radius: 20rpx; overflow: hidden; display: inline-block; color: #ffffff; font-size: 11px; margin-left: 80rpx; }
.load_more { background: #fff; color: #d6d6d6; font-size: 13px; margin-top: 15px; }
.load_more::after { border: none; }
/* Tab */
.tabs-container { display: flex; margin: 20rpx 0; border-bottom: 1px solid #eee; }
.tab-item { flex: 1; text-align: center; padding: 20rpx 0; font-size: 32rpx; color: #666; position: relative;
  &.active-tab { color: #65C3D6; font-weight: bold;
    &::after { content: ''; position: absolute; bottom: 0; left: 20%; right: 20%; height: 4rpx; background-color: #65C3D6; border-radius: 2rpx; }
  }
}
/* 新闻卡 */
.news-list { display: flex; flex-wrap: wrap; justify-content: space-between; }
.news-item { width: calc(50% - 10px); margin-bottom: 20px; border-radius: 12rpx; overflow: hidden; box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  .news-header { position: absolute; z-index: 9; width: 100%; }
  .news-header-title { color: #fff; font-size: 30rpx; font-weight: bold; margin: 10rpx 20rpx; display: inline-block; background: #000000c4; padding: 5px 10px; border-radius: 10px 0 10px 0; }
  .news-images { height: 400rpx; .image-swiper { height: 100%; } .swiper-image { width: 100%; height: 100%; } }
  .news-content { font-size: 26rpx; padding: 10rpx; height: 80rpx; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
  .news-footer { padding: 10rpx; font-size: 24rpx; color: #999; display: flex; justify-content: space-between; }
}
.artist-button { background: none; border-radius: 40rpx; color: #65C3D6; display: flex; align-items: center; justify-content: center; padding: 10rpx 30rpx; margin: 0 auto; }
.artist-button::after { border: none; }
</style>
