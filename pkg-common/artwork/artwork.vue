<template>
  <view-logs />
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

    <!-- 透明层左侧 -->
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

    <!-- 右侧：分享 -->
    <template #right>
      <view class="nav-right">
        <!-- 分享 -->
        <view class="nav-share-pill" @click="onShare" aria-label="分享">
          <uni-icons type="redo" size="20" color="#000" />
        </view>
      </view>
    </template>

    <template #transparentFixedRight>
      <view class="nav-right">
        <view class="nav-share-pill" @click="onShare" aria-label="分享">
          <uni-icons type="redo" size="20" color="#000" />
        </view>
      </view>
    </template>
  </zhouWei-navBar>

  <view class="artwork-page">
    <view class="hero-wrap">
      <swiper
        v-if="detailData.images && detailData.images.length"
        class="swiper-box"
        :indicator-dots="false"
        :autoplay="false"
        :current="heroCurrent"
        @change="onHeroChange"
      >
        <swiper-item v-for="(img, index) in detailData.images" :key="index">
          <image
            :src="img"
            mode="aspectFill"
            class="swiper-image"
            @tap="viewFullImage(index)"
          />
        </swiper-item>
      </swiper>
      <view v-else class="hero-empty">
        <text class="hero-empty-text font-title">暂无作品图</text>
      </view>

      <view class="hero-mask"></view>

      <view class="hero-info-row">
        <view
          v-if="detailData.brand_id"
          class="hero-author"
          @click="navigateToBrand(detailData.brand_id)"
        >
          <image
            :src="brandInfo?.logo_image || 'https://images1.fantuanpu.com/home/default_avatar.jpg'"
            mode="aspectFill"
            class="hero-author-avatar"
          />
          <view class="hero-author-main">
            <text class="hero-author-name font-alimamashuhei">{{ brandInfo?.brand_name || '作者主页' }}</text>
            <text class="hero-author-time font-alimamashuhei">发布于 {{ formatTimestamp(detailData.created_at) || '未知时间' }}</text>
          </view>
        </view>
        <view class="hero-right-tools">
          <view class="hero-like-btn" @click="likeFn" aria-label="喜欢">
            <image
              v-if="!hasLike"
              src="/static/new-icon/like.png"
              mode="aspectFill"
              class="hero-like-icon"
            />
            <image
              v-else
              src="/static/new-icon/like-fill.png"
              mode="aspectFill"
              class="hero-like-icon"
            />
          </view>
          <view v-if="detailData.images && detailData.images.length > 1" class="hero-dots">
            <view
              v-for="(img, index) in detailData.images"
              :key="`hero-dot-${index}`"
              class="hero-dot"
              :class="{ active: index === heroCurrent }"
            />
          </view>
        </view>
      </view>
    </view>

    <view v-if="!loading && !error" class="content-wrap">
      <view class="section-card intro-card">
        <view v-if="detailData.head_name" class="head-row">
          <text class="head-label">头名</text>
          <text class="head-value font-title">{{ detailData.head_name }}</text>
        </view>

        <view class="meta-grid">
          <view class="meta-chip">
            <text class="meta-key">性别</text>
            <text class="meta-value">{{ getSexText(detailData.sex) }}</text>
          </view>
          <view class="meta-chip">
            <text class="meta-key">类型</text>
            <text class="meta-value">{{ getArtTypeText(detailData.art_type) }}</text>
          </view>
        </view>

        <view
          v-if="detailData.faceup_tag_content && detailData.faceup_tag_content.length"
          class="tags-wrap"
        >
          <text class="card-title font-title">风格标签</text>
          <view class="tags-list">
            <view
              v-for="(tag, index) in detailData.faceup_tag_content"
              :key="index"
              class="tag-item"
            >
              <text class="tag-text">{{ tag }}</text>
            </view>
          </view>
        </view>
      </view>

      <view v-if="detailData.goods_id && goodsInfo" class="section-card goods-section">
        <view class="section-head">
          <text class="card-title font-title">关联商品</text>
          <text class="section-tip">点击查看详情</text>
        </view>
        <view class="goods-item" @click="navigateToGoods(detailData.goods_id)">
          <view class="goods-cover-wrap">
            <image
              :src="goodsInfo.goods_images?.[0] || '/static/goods-default.png'"
              mode="aspectFill"
              class="goods-image"
            />
          </view>
          <view class="goods-info">
            <text class="goods-name font-alimamashuhei">{{ goodsInfo.name || '未命名商品' }}</text>
            <text class="goods-brand">{{ goodsInfo.brand_name || '未知品牌' }}</text>
            <view class="goods-meta">
              <view class="goods-meta-line">
                <text class="goods-meta-label">尺寸</text>
                <text class="goods-meta-text">{{ getGoodsSizeText(goodsInfo) }}</text>
              </view>
              <view class="goods-meta-line goods-meta-line--heat">
                <uni-icons type="eye" size="16" color="#4a5a72" />
                <text class="goods-meta-text goods-meta-text--heat">{{ getGoodsViewsText(goodsInfo) }}</text>
              </view>
            </view>
            <view class="goods-enter">
              <text class="goods-enter-text">去看看</text>
              <uni-icons type="right" size="14" color="#41526b" />
            </view>
          </view>
        </view>
      </view>

      <view class="section-card comments-section">
        <view class="section-head comments-head">
          <text class="card-title font-title">评论区</text>
        </view>
        <comment-list
          ref="commentListRef"
          :type="commentType"
          :relation-id="parseInt(pageId)"
          @reply="handleReplyComment"
        />
      </view>
    </view>

    <view v-if="!loading && error" class="error-state">
      <text class="error-title font-title">页面加载失败</text>
      <text class="error-msg">{{ errorMsg || '请稍后重试' }}</text>
      <view class="retry-btn" @click="retryFetch">重新加载</view>
    </view>

    <comment-input
      v-if="!loading && !error"
      ref="commentInputRef"
      :reply-info="replyForItem"
      :target-id="pageId"
      @submit="handleCommentSubmit"
      @update:reply-info="val => replyForItem = val"
    />

    <view class="bottom-safe-space"></view>
    <loading-toast :show="loading" text="作品加载中..." />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import {
  websiteUrl,
  asyncGetUserInfo,
  global,
} from '../../common/config.js'
import {
  onLoad,
  onPageScroll,
  onShareAppMessage,
  onShareTimeline,
} from '@dcloudio/uni-app'

// 页面数据
const detailData = ref({
  id: 0,
  title: '',
  head_name: '',
  faceup_tag_content: [],
  sex: 0,
  created_at: 0,
  brand_id: 0,
  art_type: 1,
  goods_id: 0,
  images: [],
  like_count: 0,
})

// 商品和品牌信息
const goodsInfo = ref(null)
const brandInfo = ref(null)

// 页面状态
const loading = ref(true)
const error = ref(false)
const errorMsg = ref('')
const hasLike = ref(false)
const pageId = ref(0)
const commentType = ref(8) // 妆师作品的评论类型为8

// 评论相关
const commentListRef = ref(null)
const commentInputRef = ref(null)
const replyForItem = ref({})

const scrollTop = ref(0)
const heroCurrent = ref(0)
const artworkPath = '/pkg-common/artwork/artwork'

// transparentFixed 导航滚动
onPageScroll(e => {
  scrollTop.value = e?.scrollTop || 0
})

// 返回
const goBack = () => {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack({ delta: 1 })
  } else {
    uni.switchTab({ url: '/pages/index/index' })
  }
}

// 分享按钮（各端兜底）
const onShare = () => {
  // #ifdef MP-WEIXIN
  wx.showShareMenu({ withShareTicket: true })
  uni.showToast({ title: '请用右上角分享', icon: 'none' })
  // #endif

  // #ifndef MP-WEIXIN
  const url = `${artworkPath}?id=${pageId.value}`
  uni.setClipboardData({
    data: url,
    success: () => uni.showToast({ title: '链接已复制', icon: 'none' }),
  })
  // #endif
}

// 原生分享内容
onShareAppMessage(() => ({
  title:
    detailData.value.title ||
    (brandInfo.value?.brand_name
      ? `${brandInfo.value.brand_name} · 作品`
      : 'BJD作品'),
  path: `${artworkPath}?id=${pageId.value}`,
  imageUrl: detailData.value.images?.[0] || '',
}))
onShareTimeline?.(() => ({
  title: detailData.value.title || 'BJD作品',
  query: `id=${pageId.value}`,
  imageUrl: detailData.value.images?.[0] || '',
}))

// 获取性别文本
function getSexText(sex) {
  const sexMap = {
    0: '未知',
    1: '男',
    2: '女',
  }
  return sexMap[sex] || '未知'
}

// 获取艺术类型文本
function getArtTypeText(type) {
  const typeMap = {
    1: '二次元妆面',
    3: '三次元妆面',
  }
  return typeMap[type] || '未知类型'
}

// 格式化时间戳
function formatTimestamp(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp * 1000)
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${date
    .getDate()
    .toString()
    .padStart(2, '0')}`
}

function getGoodsSizeText(goods) {
  if (!goods) return '未知'

  const sizes = Array.isArray(goods.sizes) ? goods.sizes : []
  if (sizes.length) {
    const groups = {}
    sizes.forEach(item => {
      const category = String(item?.goods_size || '').trim()
      const detail = String(item?.size_detail || '').trim()
      if (!category && !detail) return
      const key = category || '其它'
      if (!groups[key]) groups[key] = []
      if (detail) groups[key].push(detail)
    })

    const text = Object.keys(groups).map(category => {
      const details = groups[category].filter(Boolean)
      return details.length ? `${category}（${details.join('、')}）` : category
    }).join(' / ')

    if (text) return text
  }

  const size = String(goods.size || '').trim()
  const sizeDetail = String(goods.size_detail || '').trim()
  if (size && sizeDetail) return `${size} / ${sizeDetail}`
  return size || sizeDetail || '未知'
}

function getGoodsViewsText(goods) {
  const views = Number(goods?.views || 0)
  if (!Number.isFinite(views) || views < 0) return '0'
  return String(Math.floor(views))
}

// 查看大图
function viewFullImage(index) {
  uni.previewImage({
    current: detailData.value.images[index],
    urls: detailData.value.images,
  })
}
function onHeroChange(e) {
  heroCurrent.value = Number(e?.detail?.current || 0)
}
function retryFetch() {
  if (!pageId.value) return
  fetchData(pageId.value)
}

// 获取作品详情
const fetchData = async id => {
  try {
    loading.value = true
    error.value = false
    errorMsg.value = ''
    heroCurrent.value = 0
    goodsInfo.value = null
    brandInfo.value = null

    const res = await uni.request({
      url: websiteUrl.value + `/faceup/detail?id=${id}`,
    })

    if (res.data.status !== 'success') {
      handleError(res.data.msg || '数据加载失败')
      return
    }

    // 使用返回的数据
    detailData.value = res.data.data

    // 确保 images 是数组
    if (!Array.isArray(detailData.value.images)) {
      detailData.value.images = detailData.value.face_up_image_urls
        ? detailData.value.face_up_image_urls.split(',')
        : []
    }
    detailData.value.images = detailData.value.images
      .map(img => String(img || '').trim())
      .filter(Boolean)

    // 获取关联商品信息
    if (detailData.value.goods_id) {
      fetchGoodsInfo(detailData.value.goods_id)
    }

    // 获取关联品牌信息
    if (detailData.value.brand_id) {
      fetchBrandInfo(detailData.value.brand_id)
    }
  } catch (err) {
    console.error('获取作品详情失败:', err)
    handleError('数据加载失败')
  } finally {
    loading.value = false
  }
}

// 获取商品信息
const fetchGoodsInfo = async goodsId => {
  try {
    const res = await uni.request({
      url: websiteUrl.value + `/goods?id=${goodsId}`,
      method: 'GET',
    })

    if (res.data.status === 'success') {
      goodsInfo.value = res.data.data
    }
  } catch (e) {
    console.error('获取商品信息失败:', e)
  }
}

// 获取品牌信息
const fetchBrandInfo = async brandId => {
  try {
    const res = await uni.request({
      url: websiteUrl.value + `/brand-info?id=${brandId}`,
      method: 'GET',
    })

    if (res.data.status === 'success') {
      brandInfo.value = res.data.data
    }
  } catch (e) {
    console.error('获取品牌信息失败:', e)
  }
}

// 错误处理
const handleError = msg => {
  error.value = true
  errorMsg.value = msg
  uni.showToast({
    title: msg,
    icon: 'none',
  })
}

// 跳转到商品
function navigateToGoods(goodsId) {
  uni.navigateTo({
    url: `/pages/goods/goods?goods_id=${goodsId}`,
  })
}

// 跳转到品牌
function navigateToBrand(brandId) {
  uni.navigateTo({
    url: `/pkg-creator/creator_base/bjd_faceup_artist/bjd_faceup_artist?brand_id=${brandId}`,
  })
}

// 点赞功能 - 妆师作品点赞类型为 7（保持你原来的约定）
function likeFn() {
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
    type: 7, // 妆师作品点赞类型为7
  }

  const url = hasLike.value ? '/with-state/unlike' : '/with-state/add-like'
  uni.request({
    url: websiteUrl.value + url,
    method: 'POST',
    header: {
      Authorization: token,
    },
    data: requestData,
    success: res => {
      if (res.data.status == 'success') {
        uni.showToast({
          title: hasLike.value ? '取消点赞' : '点赞成功',
          icon: 'success',
        })
        hasLike.value = !hasLike.value

        // 更新点赞数
        if (hasLike.value) {
          detailData.value.like_count += 1
        } else {
          detailData.value.like_count -= 1
        }
      } else {
        uni.showToast({
          title: res.data.msg || '操作失败',
          icon: 'none',
        })
      }
    },
    fail: err => {
      console.log(err)
      uni.showToast({
        title: '网络请求失败',
        icon: 'none',
      })
    },
  })
}

// 获取是否点赞
function getHasLike() {
  const token = uni.getStorageSync('token')
  if (!token) {
    return
  }

  uni.request({
    url:
      websiteUrl.value +
      '/with-state/hasLike?id=' +
      pageId.value +
      '&type=7', // 类型7
    method: 'POST',
    header: {
      Authorization: token,
    },
    success: res => {
      if (res.data.status == 'success') {
        hasLike.value = res.data.data.id > 0
      }
    },
  })
}

// 评论相关函数
const handleReplyComment = ({ parent, target }) => {
  let item = parent
  if (target != null) {
    item = target
  }

  if (replyForItem.value.id == item.id) {
    replyForItem.value = {}
    return
  }

  replyForItem.value = item
  commentInputRef.value?.focusInput()
}

// 评论提交处理 - 妆师作品评论类型为8
const handleCommentSubmit = submitData => {
  const token = uni.getStorageSync('token')
  if (!global.isLogin) {
    uni.showToast({
      title: '请先登录',
      icon: 'none',
    })
    return
  }

  const requestData = {
    content: submitData.content,
    origin: submitData.origin,
    target_id: parseInt(pageId.value),
    type: 8, // 妆师作品评论类型为8
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
          : replyForItem.value.id,
    }),
  }

  // 临时评论
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
          is_anonymous: 1,
        }
      : {
          avatar: global.userInfo.avatar,
          username: global.userInfo.nickname,
          is_anonymous: 0,
        }),
    ...(submitData.image_url && {
      image_url: submitData.image_url,
    }),
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
        : replyForItem.value.username,
    }),
  }

  // 添加临时评论到列表
  if (!replyForItem.value.id) {
    commentListRef.value?.addNewComment(tempComment)
  } else if (replyForItem.value.parent_id === 0) {
    commentListRef.value?.addReplyComment({
      ...tempComment,
      parent_id: replyForItem.value.id,
    })
  } else {
    commentListRef.value?.addReplyComment({
      ...tempComment,
      parent_id: replyForItem.value.parent_id,
    })
  }

  uni.request({
    url: websiteUrl.value + '/with-state/add-comment',
    method: 'POST',
    header: {
      Authorization: token,
    },
    data: requestData,
    success: res => {
      if (res.data.status == 'success') {
        const newComment = res.data.data
        const finalComment = {
          ...newComment,
          ...(submitData.is_anonymous
            ? {
                avatar:
                  'https://images1.fantuanpu.com/home/default_avatar.jpg',
                username: '匿名用户',
                is_anonymous: 1,
              }
            : {
                avatar: global.userInfo.avatar,
                username: global.userInfo.nickname,
                is_anonymous: 0,
              }),
        }

        if (newComment.reply_uid && replyForItem.value.is_anonymous) {
          finalComment.reply_username = '匿名用户'
        }

        // 更新临时评论为真实评论
        commentListRef.value?.updateTempComment(tempComment.id, finalComment)

        uni.showToast({
          title: '评论成功',
          icon: 'success',
        })
      } else {
        commentListRef.value?.removeTempComment(tempComment.id)
        uni.showToast({
          title: res.data.msg,
          icon: 'none',
        })
      }
    },
    fail: err => {
      commentListRef.value?.removeTempComment(tempComment.id)
      uni.showToast({
        title: '网络请求失败',
        icon: 'none',
      })
    },
  })
}

// 页面加载
onLoad(options => {
  if (!options.id) {
    handleError('缺少必要参数')
    return
  }

  pageId.value = options.id
  fetchData(options.id)

  // 检查登录状态后获取点赞状态
  asyncGetUserInfo().then(() => {
    getHasLike()
  })
})
</script>

<style lang="less" scoped>
.artwork-page {
  --bg-start: #f4eee7;
  --bg-end: #edf3ff;
  --card-bg: #ffffff;
  --ink-strong: #1f2836;
  --ink-main: #34465e;
  --ink-soft: #7f8da2;

  min-height: 100vh;
  background: linear-gradient(180deg, var(--bg-start) 0%, var(--bg-end) 45%, #f8fbff 100%);
}

.hero-wrap {
  position: relative;
  overflow: hidden;
}

.swiper-box {
  height: 920rpx;
}

.swiper-image {
  width: 100%;
  height: 100%;
  display: block;
}

.hero-empty {
  height: 920rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(160deg, #f8f4ec 0%, #e7eefb 100%);
}

.hero-empty-text {
  font-size: 32rpx;
  letter-spacing: 2rpx;
  color: #5e6d84;
}

.hero-mask {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.72) 0%, rgba(0, 0, 0, 0.34) 42%, rgba(0, 0, 0, 0) 100%);
}

.hero-info-row {
  position: absolute;
  left: 24rpx;
  right: 24rpx;
  bottom: 24rpx;
  z-index: 2;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.hero-author {
  max-width: calc(100% - 120rpx);
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.hero-author-avatar {
  width: 84rpx;
  height: 84rpx;
  border-radius: 50%;
  box-shadow: 0 8rpx 22rpx rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
}

.hero-author-main {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.hero-author-name {
  font-size: 30rpx;
  color: #fff;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hero-author-time {
  margin-top: 8rpx;
  font-size: 23rpx;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hero-right-tools {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 8rpx;
}

.hero-like-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}

.hero-like-icon {
  width: 52rpx;
  height: 52rpx;
}

.hero-dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  min-height: 14rpx;
}

.hero-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.45);
}

.hero-dot.active {
  width: 38rpx;
  background: rgba(255, 255, 255, 0.92);
}

.content-wrap {
  position: relative;
  z-index: 3;
  margin-top: 20rpx;
  padding: 0 20rpx 188rpx;
}

.section-card {
  background: var(--card-bg);
  border-radius: 24rpx;
  box-shadow: 0 16rpx 40rpx rgba(36, 49, 71, 0.08);
}

.intro-card {
  padding: 24rpx;
  margin-bottom: 18rpx;
}

.head-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.head-label {
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  color: #4f5f78;
  background: #eaf0ff;
}

.head-value {
  font-size: 30rpx;
  color: var(--ink-strong);
}

.meta-grid {
  margin-top: 18rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.meta-chip {
  padding: 12rpx 16rpx;
  border-radius: 14rpx;
  background: #f4f7ff;
  display: inline-flex;
  align-items: center;
  gap: 10rpx;
}

.meta-key {
  font-size: 22rpx;
  color: var(--ink-soft);
}

.meta-value {
  font-size: 25rpx;
  color: var(--ink-main);
  font-weight: 700;
}

.tags-wrap {
  margin-top: 24rpx;
  padding-top: 20rpx;
}

.card-title {
  display: block;
  font-size: 30rpx;
  color: var(--ink-strong);
}

.tags-list {
  margin-top: 14rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.tag-item {
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #e8f1ff 0%, #edf8ff 100%);
}

.tag-text {
  font-size: 24rpx;
  color: #3f5e82;
}

.goods-section {
  margin-bottom: 18rpx;
  padding: 24rpx;
}

.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.section-tip {
  font-size: 22rpx;
  color: var(--ink-soft);
}

.goods-item {
  padding: 18rpx;
  border-radius: 18rpx;
  background: #f7faff;
  display: flex;
  align-items: center;
  gap: 18rpx;
}

.goods-cover-wrap {
  width: 198rpx;
  height: 264rpx;
  border-radius: 14rpx;
  overflow: hidden;
  flex-shrink: 0;
  background: #e9effb;
}

.goods-image {
  width: 100%;
  height: 100%;
  display: block;
}

.goods-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.goods-name {
  font-size: 30rpx;
  color: var(--ink-strong);
  line-height: 1.28;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.goods-brand {
  margin-top: 10rpx;
  font-size: 24rpx;
  color: var(--ink-soft);
}

.goods-meta {
  margin-top: 10rpx;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.goods-meta-line {
  display: flex;
  align-items: flex-start;
  gap: 8rpx;
}

.goods-meta-line--heat {
  align-items: center;
  gap: 6rpx;
}

.goods-meta-label {
  font-size: 22rpx;
  color: #7a889b;
  flex-shrink: 0;
}

.goods-meta-text {
  font-size: 22rpx;
  color: #4a5a72;
  line-height: 1.4;
  word-break: break-word;
}

.goods-meta-text--heat {
  line-height: 1;
  font-weight: 600;
}

.goods-enter {
  margin-top: 20rpx;
  align-self: flex-start;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: #e9f0ff;
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.goods-enter-text {
  font-size: 23rpx;
  color: #41526b;
  font-weight: 700;
}

.comments-section {
  padding: 24rpx 20rpx 6rpx;
}

.comments-head {
  margin-bottom: 10rpx;
}

.error-state {
  margin: 34rpx 20rpx 0;
  padding: 46rpx 32rpx;
  border-radius: 24rpx;
  background: var(--card-bg);
  box-shadow: 0 16rpx 40rpx rgba(36, 49, 71, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.error-title {
  font-size: 32rpx;
  color: var(--ink-strong);
}

.error-msg {
  margin-top: 12rpx;
  font-size: 26rpx;
  color: var(--ink-soft);
}

.retry-btn {
  margin-top: 28rpx;
  padding: 14rpx 32rpx;
  border-radius: 999rpx;
  color: #2f4260;
  font-size: 26rpx;
  font-weight: 700;
  background: #e8f0ff;
}

.bottom-safe-space {
  width: 100%;
  height: 160rpx;
}

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

.nav-back-pill,
.nav-share-pill {
  width: 56rpx;
  height: 56rpx;
  border-radius: 9999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
}

.nav-back-text {
  font-size: 28rpx;
  color: #1f2836;
}
</style>
