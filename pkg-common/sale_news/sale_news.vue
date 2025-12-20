<template>
  <!-- 透明固定导航 -->
  <zhouWei-navBar
    type="transparentFixed"
    :backState="2000"
    :homeState="2000"
    fontColor="#000"
    transparentFixedFontColor="#000"
    :scrollTop="scrollTop"
    :titleCenter="true"
  >
    <!-- 不透明层（下滑后出现）左侧按钮 -->
    <template #left>
      <view class="nav-back-pill" @click="goBack" aria-label="返回">
        <uni-icons type="left" size="22" color="#000" />
      </view>
    </template>

    <!-- 透明层（页面顶部时显示）左侧按钮 -->
    <template #transparentFixedLeft>
      <view class="nav-back-pill" @click="goBack" aria-label="返回">
        <uni-icons type="left" size="22" color="#000" />
      </view>
    </template>
  </zhouWei-navBar>

  <!-- 如需整体下移避免被遮挡，可打开这一行（见 script 中 headerPadPx 的计算） -->
  <!-- <view class="nav-spacer" :style="{ height: headerPadPx }" /> -->

  <view-logs />

  <view class="page">
    <meta name="theme-color" content="#F8F8F8"></meta>

    <!-- 顶部图片轮播（导航浮在其上） -->
    <view style="position: relative;">
      <swiper class="swiper-box" :indicator-dots="true" :autoplay="false">
        <swiper-item v-for="(img, index) in detailData.image_list" :key="index">
          <image :src="img" mode="aspectFill" class="swiper-image" @tap="viewFullImage(index)" />
        </swiper-item>
      </swiper>
    </view>

    <!-- 品牌信息 -->
    <view class="brand-info">
      <image
        class="brand-logo"
        :src="brand.logo_image"
        mode="aspectFill"
        @tap="jump2brand(brand.id)"
      />
      <view class="brand-details" @tap="jump2brand(brand.id)">
        <text class="brand-name">{{ brand.brand_name }}</text>
        <text class="publish-time">{{ formatTimestamp(detailData.created_at) }}</text>
      </view>
      <text
        class="follow"
        @click="likeBrand"
        :style="{ background: hasLikeBrand ? '#ff6a6c' : '#65C3D6' }"
      >
        {{ hasLikeBrand ? '已关注' : '+ 关注品牌' }}
      </text>
    </view>

    <!-- 图文内容 -->
    <view class="content-box">
      <view><text class="title">{{ detailData.title }}</text></view>
      <view style="margin: 20rpx 0rpx;">
        <text class="content">{{ detailData.content }}</text>
      </view>
    </view>

    <!-- 品牌贩售信息卡片：预售商品 & 上一次贩售（正文下方） -->
    <view
      v-if="brandSaleInfo.presale || brandSaleInfo.lastSale"
      class="brand-sale-section "
    >
      <!-- 预售商品（waiting_goods[0]） -->
      <view
        v-if="brandSaleInfo.presale"
        class="sale-card"
        @tap="goGoodsDetail(getGoodsId(brandSaleInfo.presale))"
      >
        <view class="sale-card-body">
          <image
            v-if="getGoodsCover(brandSaleInfo.presale)"
            class="sale-cover"
            :src="getGoodsCover(brandSaleInfo.presale)"
            mode="aspectFill"
          />
          <view class="sale-text">
            <text class="sale-title">
              {{ getGoodsName(brandSaleInfo.presale) }}
            </text>
            <!-- 蓝底 tag 作为副标题 -->
            <text class="sale-sub sale-sub-tag font-alimamashuhei">预售商品</text>
            <text v-if="getGoodsTime(brandSaleInfo.presale)" class="sale-sub">
              预计开始：{{ getGoodsTime(brandSaleInfo.presale) }}
            </text>
          </view>
          <!-- 右侧箭头 -->
          <uni-icons type="arrow-right" size="18" color="#C0C4CC" />
        </view>
      </view>

      <!-- 上一次贩售（latest_sale） -->
      <view
        v-if="brandSaleInfo.lastSale"
        class="sale-card"
        @tap="goGoodsDetail(getGoodsId(brandSaleInfo.lastSale))"
      >
        <view class="sale-card-body">
          <image
            v-if="getGoodsCover(brandSaleInfo.lastSale)"
            class="sale-cover"
            :src="getGoodsCover(brandSaleInfo.lastSale)"
            mode="aspectFill"
          />
          <view class="sale-text">
            <text class="sale-title">
              {{ getGoodsName(brandSaleInfo.lastSale) }}
            </text>
            <!-- 蓝底 tag 作为副标题 -->
            <text class="sale-sub sale-sub-tag font-alimamashuhei">上次贩售</text>
            <text v-if="getGoodsTime(brandSaleInfo.lastSale)" class="sale-sub">
              贩售时间：{{ getGoodsTime(brandSaleInfo.lastSale) }}
            </text>
          </view>
          <!-- 右侧箭头 -->
          <uni-icons type="arrow-right" size="18" color="#C0C4CC" />
        </view>
      </view>
    </view>

    <!-- 评论 -->
    <view style="padding:10px;">
      <comment-list
        ref="commentListRef"
        :type="4"
        :relation-id="parseInt(pageId)"
        @reply="handleReplyComment"
      />
    </view>

    <view v-if="loading" class="loading">加载中...</view>
    <view v-if="error" class="error">{{ errorMsg }}</view>

    <!-- 评论输入框 -->
    <comment-input
      ref="commentInputRef"
      :reply-info="replyForItem"
      :target-id="pageId"
      @submit="handleCommentSubmit"
      @update:reply-info="val => replyForItem = val"
    />

    <view style="width:100%;height:120rpx;"></view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onPageScroll, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'

import {
  websiteUrl,
  global,
  asyncGetUserInfo /* 如需占位条再解注以下两个 */,
  // getStatusBarHeight, getNavBarHeight, toPx
} from '@/common/config.js'

/* ===== 导航滚动联动 ===== */
const scrollTop = ref(0)
onPageScroll(e => { scrollTop.value = e?.scrollTop || 0 })

function goBack () {
  const pages = getCurrentPages?.() || []
  if (pages.length > 1) uni.navigateBack({ delta: 1 })
  else uni.switchTab({ url: '/pages/index/index' })
}

/* ===== 页面原有逻辑（保持不动） ===== */
const detailData = ref({ title: '', content: '', image_list: [], created_at: 0 })
const brand = ref({ brand_name: '', logo: '' })
const loading = ref(true)
const error = ref(false)
const errorMsg = ref('')
const pageId = ref(0)
const brandId = ref(0)
const hasLikeBrand = ref(false)
const commentListRef = ref(null)
const commentInputRef = ref(null)
let commentsPage = ref(1)
let replyForItem = ref({})
const systemInfo = uni.getSystemInfoSync()

// 品牌贩售信息：预售(waiting_goods[0]) + 上次贩售(latest_sale)
const brandSaleInfo = ref({
  presale: null,   // waiting_goods[0]
  lastSale: null   // latest_sale
})

const handleReplyComment = ({ parent, target }) => {
  let item = target ?? parent
  if (replyForItem.value.id === item.id) {
    replyForItem.value = {}
    return
  }
  replyForItem.value = item
  commentInputRef.value?.focusInput()
}

function viewFullImage(index) {
  uni.previewImage({
    current: detailData.value.image_list[index],
    urls: detailData.value.image_list
  })
}

uni.setNavigationBarTitle({ title: '图透详情' })

function jump2brand(id) {
  uni.navigateTo({ url: '/pages/brand/brand?brand_id=' + id })
}

const shareTitle = () => {
  const brandName = brand.value?.brand_name || ''
  const t = detailData.value?.title || ''
  if (brandName && t) return `【${brandName}】${t}`
  return t || 'DogDogDoll 图透详情'
}

const sharePath = () => {
  const id = pageId.value
  // brandId 可能在接口返回后才有；因此保留 query 传入的 brand_id 作为兜底
  const bid = brandId.value || 0
  let path = `/pkg-common/sale_news/sale_news?id=${id}`
  if (bid) path += `&brand_id=${bid}`
  return path
}

onShareAppMessage(() => ({
  title: shareTitle(),
  path: sharePath(),
  imageUrl: (detailData.value?.image_list || [])[0] || ''
}))

onShareTimeline(() => {
  const path = sharePath()
  const query = path.includes('?') ? path.split('?')[1] : ''
  return {
    title: shareTitle(),
    query,
    imageUrl: (detailData.value?.image_list || [])[0] || ''
  }
  
})


const jump2user = (uid) => {
  uni.navigateTo({ url: '/pages/user_page/user_page?uid=' + uid })
}

const fetchNewsDetail = async (id) => {
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/sale-news-detail?id=${id}`,
      timeout: 5000
    })
    if (res.data.status === 'success') {
      detailData.value = { ...res.data.data, image_list: res.data.data.image_list || [] }
      brandId.value = res.data.data.brand_id
      getBrandsInfo()
      // 这里在拿到 brandId 后，同时请求品牌贩售相关信息
      fetchBrandSaleInfo()
    } else {
      handleError(res.data.msg || '数据加载失败')
    }
  } catch (err) {
    handleError('网络请求失败')
  } finally { loading.value = false }
}

/**
 * 请求“该品牌预售商品 & 上一次贩售”的接口
 * 当前真实返回结构：
 * data.latest_sale: 对象
 * data.waiting_goods: 数组
 */
const fetchBrandSaleInfo = () => {
  if (!brandId.value) return
  uni.request({
    url: `${websiteUrl.value}/brand-goods-summary?brand_id=${brandId.value}`,
    method: 'GET',
    timeout: 5000,
    success: (res) => {
      if (res.data && res.data.status === 'success' && res.data.data) {
        const data = res.data.data || {}
        // 上一次贩售
        brandSaleInfo.value.lastSale = data.latest_sale || null
        // 预售商品：取 waiting_goods[0] 即可
        if (Array.isArray(data.waiting_goods) && data.waiting_goods.length > 0) {
          brandSaleInfo.value.presale = data.waiting_goods[0]
        } else {
          brandSaleInfo.value.presale = null
        }
      }
      // 如果不是 success 或者没有数据，就保持为 null，不做“无数据”提示
    },
    fail: () => {
      // 静默失败，不影响页面其它部分
    }
  })
}

const handleCommentSubmit = (submitData) => {
  let token = uni.getStorageSync('token')
  if (!global.isLogin) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  const requestData = {
    content: submitData.content,
    origin: submitData.origin,
    target_id: parseInt(pageId.value),
    type: 4,
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

  const tempComment = {
    id: Date.now(),
    content: submitData.content,
    created_at: Math.floor(Date.now()/1000),
    like_count: 0, reply_count: 0, is_liked: false, floor: 0,
    ...(submitData.is_anonymous ? {
      avatar: "https://images1.fantuanpu.com/home/default_avatar.jpg",
      username: "匿名用户", is_anonymous: 1
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
      reply_username: replyForItem.value.is_anonymous ? "匿名用户" : replyForItem.value.username
    })
  }

  if (!replyForItem.value.id) commentListRef.value?.addNewComment(tempComment)
  else if (replyForItem.value.parent_id === 0)
    commentListRef.value?.addReplyComment({ ...tempComment, parent_id: replyForItem.value.id })
  else commentListRef.value?.addReplyComment({ ...tempComment, parent_id: replyForItem.value.parent_id })

  uni.request({
    url: websiteUrl.value + '/with-state/add-comment',
    method: 'POST',
    header: { 'Authorization': token },
    data: requestData,
    success: (res) => {
      if (res.data.status == "success") {
        const newComment = res.data.data
        const finalComment = {
          ...newComment,
          ...(submitData.is_anonymous ? {
            avatar: "https://images1.fantuanpu.com/home/default_avatar.jpg",
            username: "匿名用户", is_anonymous: 1
          } : {
            avatar: global.userInfo.avatar, username: global.userInfo.nickname, is_anonymous: 0
          })
        }
        if (newComment.reply_uid && replyForItem.value.is_anonymous) finalComment.reply_username = "匿名用户"
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

function formatTimestamp(ts) {
  if (!ts) return ''
  const d = new Date(ts * 1000)
  const y = d.getFullYear()
  const m = String(d.getMonth()+1).padStart(2,'0')
  const da = String(d.getDate()).padStart(2,'0')
  const h = String(d.getHours()).padStart(2,'0')
  const mi = String(d.getMinutes()).padStart(2,'0')
  return `${y}-${m}-${da} ${h}:${mi}`
}

// 商品卡片：统一处理商品名
function getGoodsName(item) {
  if (!item) return ''
  // latest_sale: goods_name
  // waiting_goods: name
  return item.goods_name || item.name || item.title || ''
}

// 商品卡片：统一处理时间字段
// latest_sale: sub_time / sub_time_end 为主
// waiting_goods: 当前接口没有时间，且 waiting_sale=1，直接不显示
function getGoodsTime(item) {
  if (!item) return ''
  // waiting_goods 带 waiting_sale=1，不显示时间
  if (item.waiting_sale) return ''
  // latest_sale 的预定时间段
  if (item.sub_time && item.sub_time_end) {
    return `${formatTimestamp(item.sub_time)} ~ ${formatTimestamp(item.sub_time_end)}`
  }
  const ts = item.sub_time || item.fin_time || item.create_time || item.created_at
  return ts ? formatTimestamp(ts) : ''
}

// 商品卡片：统一处理封面图字段
// latest_sale: goods_image
// waiting_goods: goods_images[0]
function getGoodsCover(item) {
  if (!item) return ''
  if (Array.isArray(item.goods_images) && item.goods_images.length > 0) {
    return item.goods_images[0]
  }
  return item.goods_image || item.cover_image || item.image || item.thumb || item.pic || ''
}

// 商品卡片：统一处理 goodsId（latest_sale 用 goods_id，waiting_goods 用 id）
function getGoodsId(item) {
  if (!item) return 0
  return item.goods_id || item.id || 0
}

// 跳转到商品详情页
function goGoodsDetail (goodsId) {
  if (!goodsId) return
  uni.navigateTo({
    url: `/pages/goods/goods?goods_id=${goodsId}`
  })
}

const getBrandsInfo = () => {
  uni.request({
    url: websiteUrl.value + '/brand-info?id=' + brandId.value,
    success: (res) => {
      if (res.data.status === 'success') {
        brand.value = res.data.data
        uni.setNavigationBarTitle({ title: res.data.data.brand_name })
        getHasLikeBrand()
      }
    },
    fail: () => handleError('品牌信息加载失败')
  })
}

const likeBrand = async () => {
  if (!global.isLogin) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  const url = `/with-state/${hasLikeBrand.value ? 'unlike' : 'add-like'}`
  uni.request({
    url: websiteUrl.value + url,
    method: 'POST',
    header: { Authorization: uni.getStorageSync('token') },
    data: { id: parseInt(brandId.value), type: 2 },
    success: (res) => {
      if (res.data.status === 'success') {
        hasLikeBrand.value = !hasLikeBrand.value
        uni.showToast({ title: hasLikeBrand.value ? '关注成功' : '已取消关注', icon: 'none' })
      }
    }
  })
}

const getHasLikeBrand = () => {
  if (!global.isLogin) return
  uni.request({
    url: `${websiteUrl.value}/with-state/hasLike?id=${brandId.value}&type=2`,
    method: 'POST',
    header: { Authorization: uni.getStorageSync('token') },
    success: (res) => { hasLikeBrand.value = res.data.data?.id > 0 }
  })
}

function handleError(msg) {
  error.value = true
  errorMsg.value = msg || '出错了'
}

onLoad((options) => {
  if (!options.id) { handleError('缺少必要参数'); return }
  pageId.value = options.id
  if (options.brand_id) brandId.value = parseInt(options.brand_id) || 0
  fetchNewsDetail(options.id)
  asyncGetUserInfo().then(getHasLikeBrand)
})
</script>

<style lang="less" scoped>
.page { background: #F8F8F8; min-height: 100vh; }

/* 顶部返回胶囊 */
.nav-back-pill{
  margin-left: 15rpx;
}
/* 如启用占位条 */
.nav-spacer { width: 100%; }

/* 轮播 */
.swiper-box { height: 750rpx; }
.swiper-image { width: 100%; height: 100%; }

/* 品牌信息 */
.brand-info{
  display:flex; align-items:center; padding:28rpx; background:#fff; border-bottom:1px solid #eee;
  .brand-logo{ width:80rpx; height:80rpx; border-radius:50%; margin-right:20rpx; }
  .brand-details{ flex:1;
    .brand-name{ font-size:28rpx; font-weight:bold; display:block; }
    .publish-time{ font-size:22rpx; color:#888; }
  }
}
.follow{
  padding:12rpx 30rpx; border-radius:20rpx; color:#fff; font-size:22rpx; margin-left:80rpx; display:inline-block;
}

/* 图文内容 */
.content-box{ padding:30rpx;
  .title{ font-size:28rpx; font-weight:bold; margin-bottom:20rpx; }
  .content{ font-size:24rpx; color:#666; line-height:1.6; }
}

/* 品牌贩售信息卡片区域（正文下方） */
.brand-sale-section {
  padding: 0 28rpx 20rpx;
  background: #F8F8F8;
}

.sale-card {
  margin-top: 20rpx;
  padding: 24rpx;
  border-radius: 20rpx;
  background: #ffffff;
  box-shadow: 0 6rpx 18rpx rgba(0, 0, 0, 0.03);
}

.sale-card-body {
  display: flex;
  align-items: center;
}

.sale-cover {
  width: 110rpx;
  height: 110rpx;
  border-radius: 18rpx;
  margin-right: 20rpx;
  background: #f5f5f5;
}

.sale-text {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.sale-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 6rpx;
}

.sale-sub {
  font-size: 22rpx;
  color: #888;
  line-height: 1.4;
}

/* tag 抽成副标题 + 蓝色底色 */
.sale-sub-tag {
  align-self: flex-start;
  margin-bottom: 4rpx;
  padding: 4rpx 16rpx;
  border-radius: 999rpx;
  background: #65C3D6;
  color: #ffffff;
  font-weight: 500;
}

/* 状态 */
.loading,.error{ text-align:center; padding:40rpx; font-size:28rpx; color:#999; }

text{ font-size:22rpx; }
</style>
