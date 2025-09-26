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
      <image class="brand-logo" :src="brand.logo_image" mode="aspectFill" @tap="jump2brand(brand.id)" />
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
import { ref, onMounted, computed } from 'vue'
import { onLoad, onShow, onPageScroll } from '@dcloudio/uni-app'
import { websiteUrl, global, asyncGetUserInfo /* 如需占位条再解注以下两个 */,
// getStatusBarHeight, getNavBarHeight, toPx
} from '@/common/config.js'

/* ===== 导航滚动联动 ===== */
const scrollTop = ref(0)
onPageScroll(e => { scrollTop.value = e?.scrollTop || 0 })

// 如需使用“占位条”，请取消下面三行注释，并在上方 template 打开 <view class="nav-spacer".../>
// const headerPadPx = computed(() => toPx(getStatusBarHeight() + getNavBarHeight()))

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

const onShareAppMessage = () => ({
  title: 'BJD娃圈你想知道的这里都有~',
  path: '/pages/news/news',
  success(res){}, fail(err){}, mp:{ wxpath:'/pages/index/index.html' }
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
    } else {
      handleError(res.data.msg || '数据加载失败')
    }
  } catch (err) {
    handleError('网络请求失败')
  } finally { loading.value = false }
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
  const d = new Date(ts * 1000)
  const y = d.getFullYear()
  const m = String(d.getMonth()+1).padStart(2,'0')
  const da = String(d.getDate()).padStart(2,'0')
  const h = String(d.getHours()).padStart(2,'0')
  const mi = String(d.getMinutes()).padStart(2,'0')
  return `${y}-${m}-${da} ${h}:${mi}`
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

/* 内容 */
.content-box{ padding:30rpx;
  .title{ font-size:28rpx; font-weight:bold; margin-bottom:20rpx; }
  .content{ font-size:24rpx; color:#666; line-height:1.6; }
}

/* 状态 */
.loading,.error{ text-align:center; padding:40rpx; font-size:28rpx; color:#999; }

text{ font-size:22rpx; }
</style>
