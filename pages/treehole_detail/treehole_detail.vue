<template>
  <view class="container" v-if="detailData">
    <meta name="theme-color" content="#F8F8F8"></meta>
    <view-logs />

    <!-- 头部作者信息（独立卡片） -->
    <view class="header">
      <view class="author-info card">
        <image :src="detailData.avatar || '/static/noname.png'" class="avatar" mode="aspectFill" />
        <view class="author-meta">
          <text class="author-name">{{ detailData.author_name }}</text>
          <view class="time chip">{{ formatTime(detailData.created_at) }}</view>
        </view>
        <view class="report-wrap">
          <report-button
            report-type="3"
            :relation-id="parseInt(props.id)"
            button-text="举报"
            icon-type="flag"
            icon-size="24"
            icon-color="#666"
          />
        </view>
      </view>
    </view>

    <!-- 内容部分：一个完整的框框（正文+图片+操作栏） -->
    <view class="post-card card">
      <!-- 正文 -->
      <view class="post-section post-content">
        {{ detailData.content }}
      </view>

      <!-- 分割线 -->
      <view class="divider" v-if="(detailData.images?.length || 0) > 0"></view>

      <!-- 图片宫格 -->
      <view class="post-section image-container" :class="layoutClass" v-if="(detailData.images?.length || 0) > 0">
        <view
          v-for="(img, index) in displayImages"
          :key="index"
          class="image-wrapper"
          hover-class="press"
          hover-stay-time="80"
        >
          <image :src="img" mode="aspectFill" class="image-item" @click="previewImage(index)" />
          <view v-if="showOverlay && index === 8" class="image-overlay">+{{ remainingCount }}</view>
        </view>
      </view>

      <!-- 分割线 -->
      <view class="divider"></view>

      <!-- 操作栏 -->
      <view class="post-section action-bar">
        <view class="action-group">
          <view class="action-item" @tap="handleLike" hover-class="press" hover-stay-time="80">
            <uni-icons :type="hasLiked ? 'hand-up-filled' : 'hand-up'" size="24" :color="hasLiked ? 'var(--brand)' : '#666'" />
            <text class="action-text" :class="{ active: hasLiked }">{{ detailData.like_count || 0 }}</text>
          </view>
          <view class="action-item" @tap="copyUrl(detailData)" hover-class="press" hover-stay-time="80">
            <uni-icons type="redo" size="24" color="#666" />
            <text class="action-text">分享</text>
          </view>
        </view>
        <text class="time-text" v-if="detailData.approve_time > 0">审核于 {{ formatTime(detailData.approve_time) }}</text>
      </view>
    </view>

  </view>

  <!-- 加载状态 -->
  <view v-else class="loading">加载中...</view>

  <!-- 评论区（独立区域，可按需也包一层 card） -->
  <view class="comments card">
    <comment-list ref="commentListRef" :type="5" :relation-id="parseInt(props.id)" @reply="handleReplyComment" />
  </view>

  <!-- 输入框 -->
  <comment-input
    ref="commentInputRef"
    :reply-info="replyForItem"
    :target-id="pageId"
    @submit="handleCommentSubmit"
    @update:reply-info="val => replyForItem = val"
  />
  <view style="width: 100%; height: 120rpx;"></view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { websiteUrl, global, asyncGetUserInfo } from '../../common/config.js'

const loading = ref(true)
const error = ref(false)
const errorMsg = ref('')
const pageId = ref(0)
const detailData = ref(null)

// 回复
const commentListRef = ref(null)
const commentInputRef = ref(null)
let commentsPage = ref(1)
let replyForItem = ref({})

const selectedAssociation = ref({})

// 点赞
const hasLiked = ref(false)

const props = defineProps({
  id: {
    type: String,
    required: true
  }
})

// —— 回复事件 —— //
const handleReplyComment = ({ parent, target }) => {
  const item = target || parent
  replyForItem.value = item
  commentInputRef.value?.focusInput()
}

// —— 提交评论 —— //
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
    type: 5,
    image_url: submitData.image_url || '',
    association_id: submitData.association_id || 0,
    association_type: submitData.association_type || 0,
    is_anonymous: submitData.is_anonymous || 0,
    ...(replyForItem.value.id && {
      reply_id: replyForItem.value.id,
      reply_for: replyForItem.value.comment,
      reply_uid: replyForItem.value.user_id,
      parent_id: replyForItem.value.parent_id > 0 ? replyForItem.value.parent_id : replyForItem.value.id
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
      ? { avatar: 'https://images1.fantuanpu.com/home/default_avatar.jpg', username: '匿名用户', is_anonymous: 1 }
      : { avatar: global.userInfo.avatar, username: global.userInfo.nickname, is_anonymous: 0 }),
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

  if (!replyForItem.value.id) {
    commentListRef.value?.addNewComment(tempComment)
  } else if (replyForItem.value.parent_id === 0) {
    commentListRef.value?.addReplyComment({ ...tempComment, parent_id: replyForItem.value.id })
  } else {
    commentListRef.value?.addReplyComment({ ...tempComment, parent_id: replyForItem.value.parent_id })
  }

  uni.request({
    url: websiteUrl.value + '/with-state/add-comment',
    method: 'POST',
    header: { Authorization: token },
    data: requestData,
    success: (res) => {
      if (res.data.status == 'success') {
        const newComment = res.data.data
        const finalComment = {
          ...newComment,
          ...(submitData.is_anonymous
            ? { avatar: 'https://images1.fantuanpu.com/home/default_avatar.jpg', username: '匿名用户', is_anonymous: 1 }
            : { avatar: global.userInfo.avatar, username: global.userInfo.nickname, is_anonymous: 0 })
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

// —— 复制分享 —— //
function copyUrl(item) {
  const url = 'http://m.dogdogdoll.com/#/' + 'pages/treehole_detail/treehole_detail?id=' + item.id
  uni.setClipboardData({
    data: url,
    success: function () {
      uni.showToast({ title: '复制链接成功', icon: 'none' })
    }
  })
}

// —— 点赞 —— //
const handleLike = () => {
  if (!global.isLogin) {
    uni.showModal({
      title: '提示',
      content: '需要登录后才能点赞',
      success: (res) => {
        if (res.confirm) uni.navigateTo({ url: '/pages/login/login' })
      }
    })
    return
  }
  const token = uni.getStorageSync('token')
  const url = websiteUrl.value + (hasLiked.value ? '/with-state/unlike' : '/with-state/add-like')
  uni.request({
    url,
    method: 'POST',
    header: { Authorization: token },
    data: { id: parseInt(props.id), type: 5 },
    success: (res) => {
      if (res.data.status === 'success') {
        hasLiked.value = !hasLiked.value
        detailData.value.like_count += hasLiked.value ? 1 : -1
      }
    }
  })
}

// —— 是否已点赞 —— //
function getHasLike() {
  let token = uni.getStorageSync('token')
  if (!token) return
  uni.request({
    url: websiteUrl.value + '/with-state/hasLike?id=' + props.id + '&type=5',
    method: 'POST',
    header: { Authorization: token },
    success: (res) => {
      if (res.data.status == 'success') {
        hasLiked.value = res.data.data.id > 0
      } else {
        uni.showToast({ title: res.data.msg, icon: 'none' })
      }
    },
    fail: () => uni.showToast({ title: '网络请求失败', icon: 'none' })
  })
}

// —— 图片显示逻辑 —— //
const displayImages = computed(() => detailData.value?.images?.slice(0, 9) || [])
const remainingCount = computed(() => (detailData.value?.images?.length || 0) - 9)
const showOverlay = computed(() => (detailData.value?.images?.length || 0) > 9)

uni.setNavigationBarTitle({ title: '投稿详情' })

const layoutClass = computed(() => {
  const count = displayImages.value.length
  if (count === 1) return 'single'
  if (count === 2) return 'double'
  return 'multi'
})

// —— 时间格式化 —— //
function formatTime(timestamp) {
  const date = new Date(timestamp * 1000)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(
    date.getHours()
  ).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// —— 预览图片 —— //
function previewImage(index) {
  uni.previewImage({ current: index, urls: detailData.value.images })
}

// —— 获取数据 —— //
onMounted(async () => {
  pageId.value = props.id
  try {
    const res = await uni.request({ url: `${websiteUrl.value}/treehole-detail?id=${props.id}` })
    if (res.data.status === 'success') detailData.value = res.data.data
  } catch (e) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
  asyncGetUserInfo()
  getHasLike()
})
</script>

<style lang="less">
/* ========= 浅色主题 ========= */
:root {
  --brand: #3b82f6;   /* 品牌蓝 */
  --bg: #f7f8fa;      /* 页面背景 */
  --card: #ffffff;    /* 卡片背景 */
  --text: #1f2937;    /* 主文本 */
  --muted: #6b7280;   /* 次要文本 */
  --line: #eef0f3;    /* 分割线 */
  --shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.06);
}

/* ========= 基础布局 ========= */
.container {
  padding: 24rpx;
  background: var(--bg);
  color: var(--text);
  font-size: 26rpx;
  line-height: 1.5;
}

.loading {
  text-align: center;
  padding: 48rpx 0;
  color: var(--muted);
}

/* ========= 统一卡片 ========= */
.card {
  background: var(--card);
  border-radius: 20rpx;
  box-shadow: var(--shadow);
  padding: 24rpx;
  margin-bottom: 24rpx;
}

/* ========= 头部作者信息 ========= */
.header { margin-bottom: 0; }

.author-info {
  display: flex; align-items: center; gap: 16rpx;

  .avatar {
    width: 96rpx; height: 96rpx; border-radius: 50%;
    box-shadow: 0 0 0 4rpx rgba(59,130,246,.12);
    background: #f2f3f5;
  }

  .author-meta {
    flex: 1; min-width: 0;
    display: flex; flex-direction: column; gap: 6rpx;
  }

  .author-name {
    font-size: 28rpx; font-weight: 700; color: var(--text);
    max-width: 520rpx; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  .time { font-size: 24rpx; color: var(--muted); }

  .report-wrap { margin-left: auto; }
}

/* 小芯片 */
.chip {
  display: inline-flex; align-items: center;
  padding: 6rpx 12rpx; border-radius: 999rpx;
  background: rgba(59,130,246,.08); color: var(--muted);
}

/* ========= 内容框（完整的框框） ========= */
.post-card { padding: 0; }           /* 外层卡片不再重复内边距，由内部 section 控制 */
.post-section { padding: 24rpx; }    /* 统一 24rpx 内边距，8pt 栅格 */

.post-content {
  font-size: 26rpx; color: var(--text);
  letter-spacing: 0.2rpx;
  word-break: break-word; white-space: pre-wrap;
}

/* 分割线：让整块更完整但层次清晰 */
.divider {
  height: 1rpx; background: var(--line);
  margin: 0;      /* 紧贴两个 section，视觉上是一体的 */
}

/* ========= 图片宫格（放在 post-section 内） ========= */
.image-container { padding: 16rpx 24rpx; } /* 与文字左右对齐，顶部留 16rpx 更轻盈 */
.image-container.single .image-wrapper { width: 100%; padding-bottom: 56.25%; } /* 16:9 */
.image-container.double,
.image-container.multi {
  display: flex; flex-wrap: wrap; gap: 12rpx;
}
.image-container.double .image-wrapper { width: calc(50% - 6rpx); padding-bottom: 66.666%; }
.image-container.multi  .image-wrapper { width: calc(33.333% - 8rpx); padding-bottom: 33.333%; position: relative; }

.image-wrapper {
  position: relative; border-radius: 16rpx; overflow: hidden; background: #f5f5f7;
  transition: transform .12s ease-out;
}
.press { transform: scale(0.98); }
.image-item { position: absolute; inset: 0; width: 100%; height: 100%; }
.image-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,.45);
  color: #fff; font-size: 32rpx; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  letter-spacing: 2rpx;
}

/* ========= 操作栏（放在 post-section 内） ========= */
.action-bar {
  display: flex; justify-content: space-between; align-items: center;

  .action-group { display: flex; align-items: center; gap: 16rpx; }

  .action-item {
    display: inline-flex; align-items: center; gap: 10rpx;
    padding: 14rpx 20rpx; border-radius: 999rpx;
    background: #f3f4f6;
    transition: transform .12s ease-out, background .12s ease-out;
    min-height: 58rpx; /* 触控热区 */

    &:active { transform: scale(0.96); background: #edeef2; }

    .action-text {
      font-size: 26rpx; color: #666; font-weight: 600;
      &.active { color: var(--brand); }
    }
  }

  .time-text { font-size: 24rpx; color: var(--muted); }
}

/* ========= 评论区容器 ========= */
.comments { padding: 0; }
</style>
