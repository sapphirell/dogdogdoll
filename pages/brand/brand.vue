<template>
  <view>
    <meta name="theme-color" content="#F8F8F8"></meta>
    <view-logs></view-logs>

    <image :src="brand.logo_image" mode="aspectFit" class="brand_logo"></image>

    <view class="body">
      <!-- 顶部信息：一排（左：品牌名图+地区作者类型上下；右：关注按钮） -->
      <view class="brand-head-row">
        <view class="brand-title-col">
          <image
            v-if="brand.brand_name_image"
            :src="brand.brand_name_image"
            mode="heightFix"
            class="brand-name-img"
          ></image>
          <text class="brand-title-sub font-title">
            {{ brand.country_name }} / {{ brand.type }}
          </text>
        </view>

        <text
          class="follow alimama-shuhei"
          @click="likeBrand"
          :style="{ background: hasLikeBrand ? '#ff6a6c' : '#65C3D6' }"
        >
          {{ hasLikeBrand ? '已关注' : '+ 关注品牌' }}
        </text>
      </view>

      <!-- 基本信息 -->
      <view class="info-block">
        <view class="info-line alimama-shuhei">
          <text class="info-k">别名：</text>
          <text class="info-v">{{ brand.nickname_list || '暂无设置' }}</text>
        </view>
        <view class="info-line alimama-shuhei">
          <text class="info-k">简介：</text>
          <text class="info-v">{{ brand.description || '暂未设置' }}</text>
        </view>
      </view>

      <!-- 链接按钮：统一复制（官网/淘宝/微店/小红书/微博） -->
      <view v-if="linkButtons.length" class="link-actions">
        <view
          v-for="btn in linkButtons"
          :key="btn.key"
          class="link-btn alimama-shuhei"
          @tap="handleLinkTap(btn)"
        >
          {{ btn.label }}
        </view>
      </view>

      <!-- Tab（滑动 indicator） -->
      <view class="tabs-container">
        <view class="tab-indicator" :style="indicatorStyle"></view>

        <view
          v-for="(tab, index) in tabs"
          :key="tab.key"
          class="tab-item"
          :class="{ 'active-tab': activeTab === index }"
          @click="switchTab(index)"
        >
          <text class="alimama-shuhei">{{ tab.label }}</text>
        </view>
      </view>

      <!-- 贩售作品 -->
      <view v-show="activeTabKey === 'goods'">
        <view class="brand_goods">
          <view class="brand_goods_item" v-for="item in goods.goods_list" :key="item.id">
            <navigator @click="jumpGoods(item.id)" style="width: 100%;height: 100%;">
              <view class="goods-media">
                <image
                  class="brand_goods_image"
                  :src="item.goods_images[0]"
                  mode="aspectFill"
                ></image>

                <!-- 待开售角标：waiting_sale == 1 时展示 -->
                <view v-if="Number(item.waiting_sale) === 1" class="goods-badge alimama-shuhei">
                  待开售
                </view>
              </view>

              <text class="goods-title alimama-shuhei">{{ item.name }}</text>
            </navigator>
          </view>
        </view>
        <button class="load_more" @click="getBrandGoods(true)">加载更多</button>
      </view>

      <!-- 消息动态：卡片（图片 + 标题一行 + 时间） -->
      <view v-show="activeTabKey === 'news'">
        <view class="news-list">
          <view
            class="news-card"
            v-for="item in newsList"
            :key="item.id"
            @click="jump2saleNews(item)"
          >
            <view class="news-media" v-if="item.image_list && item.image_list.length > 0">
              <swiper class="image-swiper" :autoplay="true" :circular="true" indicator-dots>
                <swiper-item v-for="(img, imgIndex) in item.image_list" :key="imgIndex">
                  <image :src="img" mode="aspectFill" class="swiper-image"></image>
                </swiper-item>
              </swiper>
            </view>

            <view class="news-meta">
              <text class="news-title alimama-shuhei">{{ item.title }}</text>
              <text class="news-time font-title">{{ formatTimestamp(item.created_at) }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 接单主页（存在才显示） -->
      <view v-show="activeTabKey === 'artist'">
        <view style="text-align: center; padding: 50rpx 0;">
          <button class="artist-button" @click="jumpToArtistPage">
            <text class="alimama-shuhei">前往接单主页</text>
            <uni-icons type="arrow-right" size="20" color="#65C3D6"></uni-icons>
          </button>
        </view>
      </view>

      <!-- 评论列表：仅在评论 Tab 渲染 -->
      <view v-if="activeTabKey === 'comment'">
        <comment-list
          ref="commentListRef"
          :type="1"
          :relation-id="numericBrandId"
          @reply="handleReplyComment"
        />
      </view>
    </view>

    <view style="height: 80px;"></view>

    <!-- 评论输入框：仅切到评论 Tab 时显示 -->
    <comment-input
      v-if="showCommentInput"
      ref="commentInputRef"
      :reply-info="replyForItem"
      :target-id="String(currentBrandId)"
      @submit="handleCommentSubmit"
      @update:reply-info="val => (replyForItem = val)"
    />
  </view>
</template>

<script setup>
import { ref, computed, onActivated, onDeactivated } from 'vue'
import { websiteUrl, getUserInfo, global } from '../../common/config.js'
import { onShow } from '@dcloudio/uni-app'

const props = defineProps(['brand_id'])

/** ====== brand_id 热切换 ====== */
const currentBrandId = ref(String(props.brand_id || ''))
const lastBrandId = ref(currentBrandId.value)
const numericBrandId = computed(() => parseInt(currentBrandId.value || '0'))

function parseBrandIdFromRoute() {
  try {
    const pages = getCurrentPages?.() || []
    const top = pages[pages.length - 1]
    if (top?.options?.brand_id) return String(top.options.brand_id)
  } catch {}
  if (typeof location !== 'undefined' && location.hash) {
    const m = location.hash.match(/[?&]brand_id=(\d+)/)
    if (m && m[1]) return m[1]
  }
  return ''
}

/** ====== Tab（带 key，避免动态插入导致 index 混乱） ====== */
const activeTab = ref(0)
const hasAddedArtistTab = ref(false)
const tabs = ref([
  { label: '贩售作品', key: 'goods' },
  { label: '消息动态', key: 'news' },
  { label: '评论', key: 'comment' }
])

const activeTabKey = computed(() => tabs.value[activeTab.value]?.key || 'goods')

const switchTab = i => {
  const nextKey = tabs.value[i]?.key
  activeTab.value = i

  // 离开评论 tab：收起键盘、清理回复态
  if (nextKey !== 'comment') {
    replyForItem.value = {}
    try { uni.hideKeyboard?.() } catch {}
  }
}

// indicator：宽度=100/tabs.length，位移=activeTab*100%
const indicatorStyle = computed(() => {
  const n = Math.max(1, tabs.value.length || 1)
  return {
    width: `${100 / n}%`,
    transform: `translateX(${activeTab.value * 100}%)`
  }
})

/** ====== 链接按钮：统一复制 ====== */
function normalizeUrl(u) {
  const s = String(u || '').trim()
  if (!s) return ''
  if (/^https?:\/\//i.test(s)) return s
  return `https://${s}`
}

let brand = ref({})

const linkButtons = computed(() => {
  const list = []
  const w = normalizeUrl(brand.value.website_url)
  const tb = normalizeUrl(brand.value.tb_url)
  const vd = normalizeUrl(brand.value.vd_url)
  const red = normalizeUrl(brand.value.rednote_url)
  const wb = normalizeUrl(brand.value.weibo_url)

  if (w) list.push({ key: 'website', label: '官网', url: w })
  if (tb) list.push({ key: 'taobao', label: '淘宝店铺', url: tb })
  if (vd) list.push({ key: 'weidian', label: '微店店铺', url: vd })
  if (red) list.push({ key: 'rednote', label: '小红书', url: red })
  if (wb) list.push({ key: 'weibo', label: '微博', url: wb })

  return list
})

function handleLinkTap(btn) {
  const url = btn?.url
  if (!url) return
  uni.setClipboardData({
    data: url,
    success: () => uni.showToast({ title: `已复制${btn.label}链接`, icon: 'none' }),
    fail: () => uni.showToast({ title: '复制失败', icon: 'none' })
  })
}

/** ====== 关注 ====== */
const hasLikeBrand = ref(false)

/** ====== 评论引用/输入：仅评论Tab显示 ====== */
const commentListRef = ref(null)
const commentInputRef = ref(null)
let replyForItem = ref({})

const pageActive = ref(true)
onActivated(() => (pageActive.value = true))
onDeactivated(() => (pageActive.value = false))

const showCommentInput = computed(() => pageActive.value && activeTabKey.value === 'comment')

const handleReplyComment = ({ parent, target }) => {
  const item = target ?? parent
  if (replyForItem.value.id === item.id) {
    replyForItem.value = {}
    return
  }
  replyForItem.value = item
  commentInputRef.value?.focusInput()
}

const handleCommentSubmit = submitData => {
  let token = uni.getStorageSync('token')
  if (!global.isLogin) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }

  const requestData = {
    content: submitData.content,
    origin: submitData.origin,
    target_id: numericBrandId.value,
    type: 1,
    image_url: submitData.image_url || '',
    association_id: submitData.association_id || 0,
    association_type: submitData.association_type || 0,
    is_anonymous: submitData.is_anonymous || 0,
    ...(replyForItem.value.id && {
      reply_id: replyForItem.value.id,
      reply_for: replyForItem.value.comment,
      reply_uid: replyForItem.value.user_id,
      parent_id:
        replyForItem.value.parent_id > 0
          ? replyForItem.value.parent_id
          : replyForItem.value.id
    })
  }

  const tempComment = {
    id: Date.now(),
    content: submitData.content,
    created_at: Math.floor(Date.now() / 1000),
    like_count: 0,
    reply_count: 0,
    is_liked: false,
    floor: 0,
    ...(submitData.is_anonymous
      ? {
          avatar: 'https://images1.fantuanpu.com/home/default_avatar.jpg',
          username: '匿名用户',
          is_anonymous: 1
        }
      : {
          avatar: global.userInfo.avatar,
          username: global.userInfo.nickname,
          is_anonymous: 0
        }),
    ...(submitData.association_id && {
      association_id: submitData.association_id,
      association_type: submitData.association_type
    }),
    ...(submitData.image_url && { image_url: submitData.image_url }),
    ...(replyForItem.value.id && {
      reply_id: replyForItem.value.id,
      reply_for: replyForItem.value.comment,
      reply_uid: replyForItem.value.user_id,
      parent_id:
        replyForItem.value.parent_id > 0
          ? replyForItem.value.parent_id
          : replyForItem.value.id,
      reply_username: replyForItem.value.is_anonymous
        ? '匿名用户'
        : replyForItem.value.username
    })
  }

  if (!replyForItem.value.id) commentListRef.value?.addNewComment(tempComment)
  else if (replyForItem.value.parent_id === 0)
    commentListRef.value?.addReplyComment({ ...tempComment, parent_id: replyForItem.value.id })
  else
    commentListRef.value?.addReplyComment({ ...tempComment, parent_id: replyForItem.value.parent_id })

  uni.request({
    url: websiteUrl.value + '/with-state/add-comment',
    method: 'POST',
    header: { Authorization: token },
    data: requestData,
    success: res => {
      if (res.data.status === 'success') {
        const newComment = res.data.data
        const finalComment = {
          ...newComment,
          ...(submitData.is_anonymous
            ? {
                avatar: 'https://images1.fantuanpu.com/home/default_avatar.jpg',
                username: '匿名用户',
                is_anonymous: 1
              }
            : {
                avatar: global.userInfo.avatar,
                username: global.userInfo.nickname,
                is_anonymous: 0
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

/** ====== 数据拉取 ====== */
let goods = ref({})
let page = ref(1)
let newsList = ref([])
let newsPage = ref({ page_index: 1, page_size: 10, total: 0 })

async function reloadByBrandId(newId, source = 'unknown') {
  console.log(`【品牌】reloadByBrandId 来源=${source} id=${newId}`)
  currentBrandId.value = String(newId)
  lastBrandId.value = String(newId)

  // 重置
  page.value = 1
  goods.value = { goods_list: [], page_index: 1, total: 0 }
  newsList.value = []
  newsPage.value = { page_index: 1, page_size: 10, total: 0 }
  hasLikeBrand.value = false
  replyForItem.value = {}

  // 重置 Tab：固定包含评论
  activeTab.value = 0
  tabs.value = [
    { label: '贩售作品', key: 'goods' },
    { label: '消息动态', key: 'news' },
    { label: '评论', key: 'comment' }
  ]
  hasAddedArtistTab.value = false

  uni.showLoading({ title: '加载中' })
  try {
    await Promise.all([
      getBrandsInfo(currentBrandId.value),
      getBrandGoods(false, currentBrandId.value),
      getBrandNews(currentBrandId.value)
    ])
  } finally {
    uni.hideLoading()
  }
}

function getBrandNews(brandId = currentBrandId.value) {
  return new Promise(resolve => {
    uni.request({
      url: `${websiteUrl.value}/brand-news-list?brand_id=${brandId}&page=${newsPage.value.page_index}&page_size=${newsPage.value.page_size}`,
      method: 'GET',
      success: res => {
        if (res.data.status === 'success') {
          const data = res.data.data
          newsList.value = [...newsList.value, ...(data.news_list || [])]
          newsPage.value.total = data.total || 0
          if (data.news_list && data.news_list.length > 0) newsPage.value.page_index += 1
        } else {
          uni.showToast({ title: res.data.msg || '获取图透失败', icon: 'none' })
        }
      },
      fail: () => uni.showToast({ title: '网络请求失败', icon: 'none' }),
      complete: () => resolve()
    })
  })
}

function getBrandsInfo(brandId = currentBrandId.value) {
  return new Promise(resolve => {
    uni.request({
      url: websiteUrl.value + '/brand-info?id=' + brandId,
      method: 'GET',
      timeout: 5000,
      success: res => {
        brand.value = res.data.data || {}
        uni.setNavigationBarTitle({ title: brand.value.brand_name || '品牌' })
        getHasLikeBrand(brandId)

        // 动态追加“接单主页”tab：插入到“评论”之前
        if (
          !hasAddedArtistTab.value &&
          (brand.value.is_bjd_artist == 1 || brand.value.is_bjd_hairstylist == 1)
        ) {
          const idx = tabs.value.findIndex(t => t.key === 'comment')
          const insertAt = idx >= 0 ? idx : tabs.value.length
          tabs.value.splice(insertAt, 0, { label: '接单主页', key: 'artist' })
          hasAddedArtistTab.value = true
        }
      },
      fail: () => uni.showToast({ title: '网络请求失败', icon: 'none' }),
      complete: () => resolve()
    })
  })
}

function getBrandGoods(isLoadMore = false, brandId = currentBrandId.value) {
  return new Promise(resolve => {
    uni.request({
      url: websiteUrl.value + '/brand-goods?brand_id=' + brandId + '&page=' + page.value,
      method: 'GET',
      timeout: 5000,
      success: res => {
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
      fail: () => uni.showToast({ title: '网络请求失败', icon: 'none' }),
      complete: () => resolve()
    })
  })
}

const jumpToArtistPage = () => {
  uni.navigateTo({ url: `/pages/artist_info/bjd_faceup_artist?brand_id=${currentBrandId.value}` })
}

const likeBrand = async () => {
  let token = uni.getStorageSync('token')
  if (!global.isLogin) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  try {
    const url = `${websiteUrl.value}/with-state/${hasLikeBrand.value ? 'unlike' : 'add-like'}`
    const res = await uni.request({
      url,
      method: 'POST',
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
      header: { Authorization: uni.getStorageSync('token') || '' }
    })
    hasLikeBrand.value = !!(res.data?.data?.id > 0)
  } catch {}
}

/** ====== 工具 ====== */
function formatTimestamp(ts) {
  if (!ts) return ''
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

/** ====== 生命周期 ====== */
onShow(async () => {
  getUserInfo()
  const idFromRoute = parseBrandIdFromRoute()
  const newId = String(idFromRoute || currentBrandId.value || '')
  console.log('[品牌] 当前 URL/路由 brand_id =', newId)

  if (newId && newId !== lastBrandId.value) {
    console.log('【品牌】onShow 检测到ID变化：', lastBrandId.value, '→', newId)
    await reloadByBrandId(newId, 'onShow')
    return
  }

  if (!brand.value.id) {
    uni.showLoading({ title: '加载中' })
    try {
      await getBrandsInfo(currentBrandId.value)
      await Promise.all([getBrandNews(currentBrandId.value), getBrandGoods(false, currentBrandId.value)])
    } finally {
      uni.hideLoading()
    }
  } else {
    if (newsList.value.length === 0) getBrandNews(currentBrandId.value)
    if (!goods.value.goods_list || goods.value.goods_list.length === 0) getBrandGoods(false, currentBrandId.value)
  }
})
</script>

<style lang="less" scoped>
.brand_logo {
  width: calc(100vw - 10px);
  display: block;
  margin: 5px;
  float: left;
}

.body {
  width: 100vw;
  opacity: 1;
  border-radius: 25px;
  background: white;
  box-shadow: 0px -10px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  padding: 20px;
  box-sizing: border-box;
}

.font-title {
  font-weight: 800;
}

.alimama-shuhei {
  font-weight: 600;
}

/* 顶部一排 */
.brand-head-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

/* 左侧上下布局 */
.brand-title-col {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  min-width: 0;
}

.brand-name-img {
  height: 60rpx;
  max-width: 520rpx;
}

.brand-title-sub {
  color: #7a7a7a;
  font-size: 24rpx;
  line-height: 1.2;
}

/* 关注按钮（同一排） */
.follow {
  padding: 12rpx 30rpx;
  border-radius: 20rpx;
  overflow: hidden;
  display: inline-block;
  color: #ffffff;
  font-size: 11px;
  flex-shrink: 0;
}

/* 基本信息 */
.info-block {
  margin-top: 12px;
}
.info-line {
  margin-top: 10px;
  display: flex;
  gap: 8rpx;
  line-height: 1.6;
}
.info-k {
  color: #8c8c8c;
  flex-shrink: 0;
}
.info-v {
  color: #333;
  flex: 1;
}

/* 链接按钮 */
.link-actions {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}
.link-btn {
  padding: 12rpx 18rpx;
  border-radius: 14rpx;
  background: #f4fbfd;
  color: #2b7f8f;
  font-size: 26rpx;
  border: 1px solid rgba(101, 195, 214, 0.25);
}

/* Tab + indicator */
.tabs-container {
  position: relative;
  display: flex;
  margin: 20rpx 0;
  border-bottom: 1px solid #eee;
}
.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  font-size: 32rpx;
  color: #666;
  position: relative;
  z-index: 2;
}
.tab-item.active-tab {
  color: #65c3d6;
  font-weight: bold;
}
.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 4rpx;
  background-color: #65c3d6;
  border-radius: 2rpx;
  transition: transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1);
  will-change: transform;
  z-index: 1;
}

/* 贩售作品 */
.brand_goods {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;

  .brand_goods_item {
    flex: 1 1 calc(33.33% - 12px);
    width: calc(33.33% - 12px);
    max-width: calc(33.33% - 12px);
    height: 140px;
    aspect-ratio: 1;
    border-radius: 8px;
    overflow: hidden;
  }
}

.goods-media {
  width: 100%;
  height: calc(100% - 20px);
  position: relative;
}

.brand_goods_image {
  width: 100%;
  height: 100%;
}

/* 待开售角标（圆角 tag） */
.goods-badge {
  position: absolute;
  top: 10rpx;
  left: 10rpx;
  z-index: 5;
  padding: 6rpx 12rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  color: #ffffff;
  background: rgba(0, 0, 0, 0.55);
  /* 轻微描边，提升不同图片上的可读性 */
  border: 1px solid rgba(255, 255, 255, 0.35);
}

.goods-title {
  display: block;
  width: 100%;
  text-align: center;
  font-weight: 900;
  color: #586f88;
}

.load_more {
  background: #fff;
  color: #d6d6d6;
  font-size: 13px;
  margin-top: 15px;
}
.load_more::after {
  border: none;
}

/* 消息动态 */
.news-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}
.news-card {
  width: calc(50% - 10px);
  margin-bottom: 20px;
  border-radius: 12rpx;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.08);
}
.news-media {
  height: 400rpx;
}
.image-swiper {
  height: 100%;
}
.swiper-image {
  width: 100%;
  height: 100%;
}
.news-meta {
  padding: 14rpx 12rpx 16rpx 12rpx;
}
/* 标题只显示一行 */
.news-title {
  display: block;
  font-size: 28rpx;
  color: #111;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.news-time {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #9aa0a6;
}

/* 接单按钮 */
.artist-button {
  background: none;
  border-radius: 40rpx;
  color: #65c3d6;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10rpx 30rpx;
  margin: 0 auto;
}
.artist-button::after {
  border: none;
}
</style>
