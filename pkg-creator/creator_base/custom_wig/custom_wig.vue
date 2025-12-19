<template>
  <view-logs />

  <!-- 顶部导航栏：透明 + 标题 + 返回 + 喜欢 + 分享 -->
  <zhouWei-navBar
    type="transparentFixed"
    :backState="2000"
    :homeState="2000"
    :scrollTop="scrollTop"
    fontColor="#000"
    transparentFixedFontColor="#000"
    :titleCenter="true"
  >
    <!-- 左侧 -->
    <template #left>
      <view class="nav-left">
        <view class="nav-back-pill" @click="goBack" aria-label="返回">
          <image
            src="/static/artist/left.png"
            mode="aspectFill"
            style="width: 18rpx;height: 18rpx;"
          ></image>
        </view>
        <text class="nav-back-text font-title" @click="goBack">返回</text>
      </view>
    </template>

    <!-- 滚动后固定态左侧 -->
    <template #transparentFixedLeft>
      <view class="nav-left">
        <view class="nav-back-pill" @click="goBack" aria-label="返回">
          <image
            src="/static/artist/left.png"
            mode="aspectFill"
            style="width: 18rpx;height: 18rpx;"
          ></image>
        </view>
        <text class="nav-back-text font-title" @click="goBack">返回</text>
      </view>
    </template>

    <!-- 中间标题 -->
    <template #default>
      <view class="nav-title-wrap">
        <text class="nav-title-ellipsis">
          {{ detail.wig_name || '手改毛详情' }}
        </text>
      </view>
    </template>

    <!-- 右侧：喜欢 + 分享 -->
    <template #right>
      <view class="nav-right">
        <!-- 喜欢按钮（缩小尺寸） -->
        <view class="nav-like-pill" @click="likeFn" aria-label="喜欢">
          <uni-icons
            :type="hasLike ? 'heart-filled' : 'heart'"
            size="20"
            color="#ff4d4f"
          />
        </view>
        <!-- 分享按钮 -->
        <view class="nav-share-pill" @click="onShare" aria-label="分享">
          <uni-icons type="redo" size="20" color="#000" />
        </view>
      </view>
    </template>

    <template #transparentFixedRight>
      <view class="nav-right">
        <view class="nav-like-pill" @click="likeFn" aria-label="喜欢">
          <uni-icons
            :type="hasLike ? 'heart-filled' : 'heart'"
            size="20"
            color="#ff4d4f"
          />
        </view>
        <view class="nav-share-pill" @click="onShare" aria-label="分享">
          <uni-icons type="redo" size="20" color="#000" />
        </view>
      </view>
    </template>
  </zhouWei-navBar>

  <view>
    <!-- 顶部图片轮播（已经不再放点赞按钮） -->
    <view v-if="detail.images && detail.images.length" style="position: relative;">
      <swiper class="swiper-box" :indicator-dots="true" :autoplay="false">
        <swiper-item
          v-for="(img, index) in detail.images"
          :key="index"
        >
          <image
            :src="img"
            mode="aspectFill"
            class="swiper-image"
            @tap="viewFullImage(index)"
          />
        </swiper-item>
      </swiper>
    </view>

    <!-- 作者/品牌信息 -->
    <view
      class="author-info"
      v-if="brandInfo"
      @click="navigateToBrand(detail.brand_id)"
    >
      <image
        :src="brandInfo.logo_image"
        mode="aspectFill"
        class="author-avatar"
      />
      <view class="author-details">
        <text class="author-name">{{ brandInfo.brand_name }}</text>
        <text class="publish-time">发布于 {{ formatTimestamp(detail.created_at) }}</text>
      </view>
    </view>

    <!-- 手改毛详情主体 -->
    <view class="content-box">
      <!-- 标题 -->
      <text class="title">
        {{ detail.wig_name || '手改毛详情' }}
      </text>

      <!-- 基本信息 -->
      <view class="meta-info">
        <view class="meta-item">
          材质：{{ detail.wig_material || '未填写' }}
        </view>
        <view class="meta-item">
          颜色：{{ detail.wig_color || '未填写' }}
        </view>
      </view>

      <!-- 风格标签 -->
      <view
        class="tags-container"
        v-if="detail.style_tags && detail.style_tags.length"
      >
        <text class="tags-title">风格：</text>
        <view class="tags-list">
          <view
            class="tag-item"
            v-for="(tag, index) in detail.style_tags"
            :key="index"
          >
            {{ tag }}
          </view>
        </view>
      </view>
    </view>


    <!-- 占位 -->
    <view style="width: 100%;height: 120rpx;"></view>

    <!-- 加载 / 错误状态 -->
    <view v-if="loading" class="loading">加载中...</view>
    <view v-if="error" class="error">{{ errorMsg }}</view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import {
  websiteUrl,
  global,
} from '@/common/config.js'
import {
  onLoad,
  onPageScroll,
  onShareAppMessage,
  onShareTimeline,
} from '@dcloudio/uni-app'

// ====== 页面状态 ======
const detail = ref({
  id: 0,
  brand_id: 0,
  wig_name: '',
  wig_material: '',
  wig_color: '',
  style_tags: [],
  created_at: 0,
  images: [],      // 处理后的图片数组
  like_count: 0,   // 点赞数（后端无该字段时默认为 0）
})
const brandInfo = ref(null)

const loading = ref(true)
const error = ref(false)
const errorMsg = ref('')
const pageId = ref(0)

const scrollTop = ref(0)
const hasLike = ref(false) // 当前用户是否已点赞

// 手改毛点赞 type：8
const LIKE_TYPE_CUSTOM_WIG = 8

// ====== 滚动驱动透明导航 ======
onPageScroll(e => {
  scrollTop.value = e?.scrollTop || 0
})

// ====== 返回 ======
const goBack = () => {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack({ delta: 1 })
  } else {
    // 没有上一页时，兜底回首页
    uni.switchTab({ url: '/pages/index/index' })
  }
}

// ====== 分享按钮（手动触发） ======
const onShare = () => {
  // #ifdef MP-WEIXIN
  wx.showShareMenu({ withShareTicket: true })
  uni.showToast({ title: '请使用右上角菜单分享', icon: 'none' })
  // #endif

  // #ifndef MP-WEIXIN
  const url = `/pages/custom_wig/detail?id=${pageId.value}`
  uni.setClipboardData({
    data: url,
    success: () => {
      uni.showToast({ title: '链接已复制', icon: 'none' })
    },
  })
  // #endif
}

// ====== 原生分享配置（微信小程序） ======
onShareAppMessage(() => ({
  title:
    detail.value.wig_name ||
    (brandInfo.value?.brand_name
      ? `${brandInfo.value.brand_name} · 手改毛`
      : '手改毛详情'),
  path: `/pages/custom_wig/detail?id=${pageId.value}`,
  imageUrl: detail.value.images?.[0] || '',
}))
onShareTimeline?.(() => ({
  title: detail.value.wig_name || '手改毛详情',
  imageUrl: detail.value.images?.[0] || '',
}))

// ====== 工具函数 ======
function formatTimestamp(ts) {
  if (!ts) return ''
  const d = new Date(ts * 1000)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatNumber(num) {
  if (!num) return '0'
  if (num < 1000) return num.toString()
  return `${Math.floor(num / 1000)}k+`
}

// 预览大图
function viewFullImage(index) {
  if (!detail.value.images || !detail.value.images.length) return
  uni.previewImage({
    current: detail.value.images[index],
    urls: detail.value.images,
  })
}

// ====== 拉取品牌信息 ======
const fetchBrandInfo = async brandId => {
  if (!brandId) return
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/brand-info?id=${brandId}`,
      method: 'GET',
    })
    if (res.data.status === 'success') {
      brandInfo.value = res.data.data
    }
  } catch (e) {
    console.error('获取品牌信息失败', e)
  }
}

// ====== 拉取手改毛详情 ======
const fetchData = async id => {
  try {
    loading.value = true
    const res = await uni.request({
      url: `${websiteUrl.value}/custom-wig/detail?id=${id}`,
      method: 'GET',
    })

    if (res.data.status !== 'success') {
      handleError(res.data.msg || '数据加载失败')
      return
    }

    const data = res.data.data || {}

    // 基础字段
    detail.value.id = data.id || 0
    detail.value.brand_id = data.brand_id || 0
    detail.value.wig_name = data.wig_name || ''
    detail.value.wig_material = data.wig_material || ''
    detail.value.wig_color = data.wig_color || ''
    detail.value.style_tags = Array.isArray(data.style_tags)
      ? data.style_tags
      : []
    detail.value.created_at = data.created_at || 0
    detail.value.like_count = Number(data.like_count || 0)

    // 处理图片字段（兼容多种返回）
    let imgs = []

    if (Array.isArray(data.custom_wig_images)) {
      imgs = data.custom_wig_images
    } else if (Array.isArray(data.images)) {
      imgs = data.images
    } else if (typeof data.custom_wig_image_urls === 'string') {
      imgs = data.custom_wig_image_urls
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
    }

    detail.value.images = imgs

    // 拉品牌信息
    if (detail.value.brand_id) {
      fetchBrandInfo(detail.value.brand_id)
    }
  } catch (e) {
    console.error('获取手改毛详情失败', e)
    handleError('数据加载失败')
  } finally {
    loading.value = false
  }
}

// ====== 错误处理 ======
const handleError = msg => {
  error.value = true
  errorMsg.value = msg
  uni.showToast({
    title: msg,
    icon: 'none',
  })
}

// ====== 跳转到品牌主页 ======
const navigateToBrand = brandId => {
  if (!brandId) return
  uni.navigateTo({
    url: `/pkg-creator/creator_base/bjd_faceup_artist/bjd_faceup_artist?brand_id=${brandId}`,
  })
}

// ====== 跳转到该品牌更多手改毛列表 ======
const navigateToBrandCustomWigList = brandId => {
  if (!brandId) return
  uni.navigateTo({
    url: `/pages/custom_wig/list?brand_id=${brandId}`,
  })
}

// ====== 点赞相关（type=8 手改毛喜欢） ======
const likeFn = () => {
  const token = uni.getStorageSync('token')
  if (!global.isLogin) {
    uni.showToast({
      title: '请先登录',
      icon: 'none',
    })
    return
  }

  const requestData = {
    id: parseInt(pageId.value),
    type: LIKE_TYPE_CUSTOM_WIG,
  }

  const url = hasLike.value
    ? '/with-state/unlike'
    : '/with-state/add-like'

  uni.request({
    url: websiteUrl.value + url,
    method: 'POST',
    header: {
      Authorization: token,
    },
    data: requestData,
    success: res => {
      if (res.data.status === 'success') {
        uni.showToast({
          title: hasLike.value ? '取消喜欢' : '已喜欢',
          icon: 'success',
        })
        hasLike.value = !hasLike.value

        if (hasLike.value) {
          detail.value.like_count += 1
        } else {
          detail.value.like_count = Math.max(
            0,
            detail.value.like_count - 1,
          )
        }
      } else {
        uni.showToast({
          title: res.data.msg || '操作失败',
          icon: 'none',
        })
      }
    },
    fail: err => {
      console.error(err)
      uni.showToast({
        title: '网络请求失败',
        icon: 'none',
      })
    },
  })
}

const getHasLike = () => {
  const token = uni.getStorageSync('token')
  if (!token) return

  uni.request({
    url:
      websiteUrl.value +
      `/with-state/hasLike?id=${pageId.value}&type=${LIKE_TYPE_CUSTOM_WIG}`,
    method: 'POST',
    header: {
      Authorization: token,
    },
    success: res => {
      if (res.data.status === 'success') {
        hasLike.value = res.data.data.id > 0
      }
    },
  })
}

// ====== 页面加载：接收 ?id=xxx ======
onLoad(options => {
  if (!options.id) {
    handleError('缺少必要参数')
    return
  }

  pageId.value = Number(options.id)

  // 拉详情
  fetchData(pageId.value)

  // 已登录则拉取点赞状态
  if (global.isLogin) {
    getHasLike()
  }
})
</script>

<style lang="less" scoped>
.swiper-box {
  height: 750rpx;
}
.swiper-image {
  width: 100%;
  height: 100%;
}

/* 作者信息区域 */
.author-info {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
  .author-avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    margin-right: 20rpx;
  }
  .author-details {
    display: flex;
    flex-direction: column;
  }
  .author-name {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }
  .publish-time {
    font-size: 26rpx;
    color: #999;
    margin-top: 8rpx;
  }
}

/* 主体内容容器：保持下半圆角、左右露出底色风格 */
.content-box {
  margin: 0 20rpx 20rpx;
  padding: 30rpx;
  background: #fff;
  border-radius: 0 0 24rpx 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.title {
  font-size: 36rpx;
  font-weight: 800;
  margin-bottom: 20rpx;
  display: block;
  color: #333;
}

/* 元信息 */
.meta-info {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
  margin-bottom: 20rpx;
}
.meta-item {
  font-size: 28rpx;
  color: #666;
  padding: 8rpx 20rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
}

/* 风格标签 */
.tags-container {
  display: flex;
  margin-top: 20rpx;
  .tags-title {
    font-size: 28rpx;
    color: #666;
    margin-right: 20rpx;
    line-height: 50rpx;
  }
  .tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 15rpx;
    flex: 1;
  }
  .tag-item {
    font-size: 26rpx;
    color: #1ed1e1;
    padding: 8rpx 20rpx;
    background: #e8f7ff;
    border-radius: 8rpx;
    border: 1rpx solid #b3e5fc;
  }
}

/* 更多该品牌手改毛 */
.more-section {
  margin: 10rpx 20rpx 0;
  padding: 20rpx 30rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
}
.more-text {
  font-size: 28rpx;
  color: #1ed1e1;
}

/* 状态文案 */
.loading,
.error {
  text-align: center;
  padding: 40rpx;
  font-size: 28rpx;
  color: #999;
}

/* 顶部导航左右容器 */
.nav-left,
.nav-right {
  height: 88rpx;
  display: flex;
  align-items: center;
}
.nav-left {
  padding-left: 24rpx;
  padding-left: calc(24rpx + constant(safe-area-inset-left));
  padding-left: calc(24rpx + env(safe-area-inset-left));
  gap: 16rpx;
}
.nav-right {
  padding-right: 24rpx;
  padding-right: calc(24rpx + constant(safe-area-inset-right));
  padding-right: calc(24rpx + env(safe-area-inset-right));
  gap: 16rpx;
}

/* 返回/分享/喜欢 胶囊 */
.nav-back-pill,
.nav-share-pill,
.nav-like-pill {
  width: 56rpx;
  height: 56rpx;
  border-radius: 9999rpx;
  background: rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}
.nav-back-text {
  font-size: 28rpx;
  color: #000;
}

/* 中间标题样式 */
.nav-title-wrap {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.nav-title-ellipsis {
  max-width: 420rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #000;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
