<template>
  <view class="page-container" v-if="detailData">
    <view class="bg-layer"></view>
    <view-logs />

    <view class="section-card author-card">
      <view class="author-left">
        <image 
          :src="detailData.avatar || '/static/noname.png'" 
          class="avatar" 
          mode="aspectFill" 
          @click.stop
        />
        <view class="author-meta">
          <text class="author-name font-alimamashuhei">{{ detailData.author_name || '匿名用户' }}</text>
          <view class="meta-sub">
            <text class="time">{{ formatTime(detailData.created_at) }}</text>
            <text class="location" v-if="detailData.ip_location">· {{ detailData.ip_location }}</text>
          </view>
        </view>
      </view>
      
      <view class="report-wrap">
        <report-button
          report-type="3"
          :relation-id="parseInt(props.id)"
          button-text="举报"
          icon-type="flag"
          icon-size="20"
          icon-color="#999"
          class="custom-report-btn"
        />
      </view>
    </view>

    <view class="section-card post-card">
      <view class="post-content">
        <text user-select>{{ detailData.content }}</text>
      </view>

      <view 
        class="image-grid" 
        :class="layoutClass" 
        v-if="(detailData.images?.length || 0) > 0"
      >
        <view
          v-for="(img, index) in displayImages"
          :key="index"
          class="image-wrapper"
          hover-class="img-press"
        >
          <image 
            :src="img" 
            mode="aspectFill" 
            class="image-item" 
            @click.stop="previewImage(index)" 
          />
          <view v-if="showOverlay && index === 8" class="image-overlay" @click.stop="previewImage(index)">
            <text class="overlay-text">+{{ remainingCount }}</text>
          </view>
        </view>
      </view>

      <view class="divider"></view>

      <view class="action-bar">
        <view class="action-left">
          <view class="action-btn" @tap="handleLike" hover-class="btn-press">
            <uni-icons 
              :type="hasLiked ? 'hand-up-filled' : 'hand-up'" 
              size="26" 
              :color="hasLiked ? 'var(--brand)' : '#666'" 
              class="anim-icon"
              :class="{ 'liked-anim': hasLiked }"
            />
            <text class="action-num" :class="{ 'active-text': hasLiked }">
              {{ detailData.like_count > 0 ? detailData.like_count : '点赞' }}
            </text>
          </view>
          
          <view class="action-btn share-btn" @tap="copyUrl(detailData)" hover-class="btn-press">
            <uni-icons type="redo" size="24" color="#666" />
            <text class="action-text font-doll">分享</text>
          </view>
        </view>
        
        <view class="action-right">
          <text class="audit-time" v-if="detailData.approve_time > 0">
            已审核
          </text>
        </view>
      </view>
    </view>

    <view class="section-card comments-card">
      <view class="card-title">评论</view>
      <comment-list 
        ref="commentListRef" 
        :type="5" 
        :relation-id="parseInt(props.id)" 
        @reply="handleReplyComment" 
      />
    </view>
    
    <view class="bottom-spacer"></view>
  </view>

  <view v-else class="loading-state">
    <uni-load-more status="loading" />
  </view>

  <comment-input
    ref="commentInputRef"
    :reply-info="replyForItem"
    :target-id="pageId"
    @submit="handleCommentSubmit"
    @update:reply-info="val => replyForItem = val"
    class="fixed-input"
  />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { websiteUrl, global, asyncGetUserInfo } from '../../common/config.js'

const loading = ref(true)
const pageId = ref(0)
const detailData = ref(null)

// 回复相关
const commentListRef = ref(null)
const commentInputRef = ref(null)
let replyForItem = ref({})

// 点赞
const hasLiked = ref(false)

const props = defineProps({
  id: {
    type: String,
    required: true
  }
})

// —— 计算属性：图片布局逻辑 ——
const displayImages = computed(() => detailData.value?.images?.slice(0, 9) || [])
const remainingCount = computed(() => (detailData.value?.images?.length || 0) - 9)
const showOverlay = computed(() => (detailData.value?.images?.length || 0) > 9)

const layoutClass = computed(() => {
  const count = displayImages.value.length
  if (count === 1) return 'single'
  if (count === 2 || count === 4) return 'double' 
  return 'multi'
})

// —— 时间格式化 ——
function formatTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp * 1000)
  const now = new Date()
  
  // 简单的当天判断
  if (date.toDateString() === now.toDateString()) {
     return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

// —— 交互逻辑 (保持原有功能) ——
const handleReplyComment = ({ parent, target }) => {
  const item = target || parent
  replyForItem.value = item
  commentInputRef.value?.focusInput()
}

// 提交评论
const handleCommentSubmit = (submitData) => {
  let token = uni.getStorageSync('token')
  if (!global.isLogin) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  
  // 构造请求数据
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

  // 乐观更新UI逻辑 (模拟添加)
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

  // 发送请求
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

// 点赞
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

// 复制链接
function copyUrl(item) {
  // 这里假设了路径，根据你的实际情况调整
  const url = 'http://m.dogdogdoll.com/#/' + 'pages/treehole_detail/treehole_detail?id=' + item.id
  uni.setClipboardData({
    data: url,
    success: function () {
      uni.showToast({ title: '复制链接成功', icon: 'none' })
    }
  })
}

// 预览图片
function previewImage(index) {
  uni.previewImage({ current: index, urls: detailData.value.images })
}

// 获取点赞状态
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
      }
    }
  })
}

onMounted(async () => {
  pageId.value = props.id
  try {
    const res = await uni.request({ url: `${websiteUrl.value}/treehole-detail?id=${props.id}` })
    if (res.data.status === 'success') {
        detailData.value = res.data.data
        getHasLike() // 获取详情后再查点赞
    }
  } catch (e) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
  asyncGetUserInfo()
})
</script>

<style lang="scss" scoped>
/* —— 主题变量 —— */
$brand-color: #FF8F9C;
$bg-color: #F7F8FA;
$card-bg: #FFFFFF;
$text-main: #333333;
$text-sub: #999999;
$border-color: #EEEEEE;
$radius-card: 24rpx;
$radius-img: 12rpx;

.page-container {
  min-height: 100vh;
  background-color: $bg-color;
  padding: 24rpx;
  box-sizing: border-box;
  --brand: #{$brand-color};
}

/* —— 通用卡片 —— */
.section-card {
  background-color: $card-bg;
  border-radius: $radius-card;
  padding: 30rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.02);
}

/* 1. 头部样式 */
.author-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 30rpx;

  .author-left {
    display: flex;
    align-items: center;
    
    .avatar {
      width: 88rpx;
      height: 88rpx;
      border-radius: 50%;
      margin-right: 20rpx;
      border: 2rpx solid #f0f0f0;
      flex-shrink: 0;
    }

    .author-meta {
      display: flex;
      flex-direction: column;
      justify-content: center;

      .author-name {
        font-size: 32rpx;
        font-weight: 600;
        color: $text-main;
        margin-bottom: 6rpx;
      }

      .meta-sub {
        font-size: 24rpx;
        color: $text-sub;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
      }
    }
  }
  
  .report-wrap {
      opacity: 0.6;
      flex-shrink: 0;
  }
}

/* 2. 内容区域 */
.post-card {
  .post-content {
    font-size: 32rpx;
    color: #333;
    line-height: 1.7;
    margin-bottom: 24rpx;
    letter-spacing: 0.5rpx;
    word-break: break-all;
  }

  .divider {
    height: 1rpx;
    background-color: #F5F5F5;
    margin: 30rpx 0 20rpx 0;
  }
}

/* 3. 图片宫格 (核心修复) */
.image-grid {
  display: grid;
  gap: 12rpx;
  width: 100%;
  box-sizing: border-box; /* 确保 padding 不会撑大宽度 */
  
  // 所有图片的通用包裹层
  .image-wrapper {
    position: relative;
    overflow: hidden;
    border-radius: $radius-img;
    background-color: #f5f5f5; /* 占位背景色 */
    
    // 多图默认逻辑：正方形占位
    width: 100%;
    padding-bottom: 100%; // 利用 padding 实现正方形
    height: 0;

    .image-item {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: block;
      opacity: 1;
    }
  }
  
  .img-press {
    opacity: 0.8;
  }

  /* --- 单图特殊处理 (修复宽度为0) --- */
  &.single {
    grid-template-columns: 1fr;
    display: block; /* 单图时取消 grid，直接用 block 更好控制 */
    
    .image-wrapper {
      // 取消正方形 padding-bottom hack
      padding-bottom: 0; 
      
      // 强制给宽高，防止塌陷
      width: 65%;       /* 单张图显示宽度，约屏幕2/3 */
      height: 450rpx;   /* 固定高度 */
      max-width: 500rpx;
      
      .image-item {
        position: static; /* 恢复正常流 */
        width: 100%;
        height: 100%;     /* 跟随父容器高度 */
      }
    }
  }

  /* --- 双图/四图 --- */
  &.double {
    grid-template-columns: repeat(2, 1fr);
  }

  /* --- 多图 (3,5-9) --- */
  &.multi {
    grid-template-columns: repeat(3, 1fr);
  }

  // 遮罩层
  .image-overlay {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    
    .overlay-text {
      color: #fff;
      font-size: 36rpx;
      font-weight: 500;
    }
  }
}

/* 4. 操作栏 */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10rpx;

  .action-left {
    display: flex;
    gap: 30rpx;
  }

  .action-btn {
    display: flex;
    align-items: center;
    background: #f9f9f9;
    padding: 12rpx 24rpx;
    border-radius: 40rpx;
    transition: all 0.2s;

    .action-num, .action-text {
      font-size: 26rpx;
      color: #666;
      margin-left: 8rpx;
      font-weight: 500;
    }

    .active-text {
      color: $brand-color;
    }
    
    .anim-icon {
        transition: transform 0.2s;
    }
    .liked-anim {
        transform: scale(1.1);
    }

    &.btn-press {
      background: #eee;
      transform: scale(0.98);
    }
  }

  .action-right {
    .audit-time {
      font-size: 24rpx;
      color: #ccc;
    }
  }
}

/* 5. 评论区 */
.comments-card {
  padding-bottom: 20rpx;
  .card-title {
    font-size: 30rpx;
    font-weight: 600;
    margin-bottom: 20rpx;
    padding-left: 10rpx;
    border-left: 6rpx solid $brand-color;
    line-height: 1;
  }
}

/* 6. 辅助 */
.loading-state {
  padding-top: 200rpx;
  display: flex;
  justify-content: center;
}

.bottom-spacer {
  height: calc(140rpx + constant(safe-area-inset-bottom));
  height: calc(140rpx + env(safe-area-inset-bottom));
}

.fixed-input {
  /* 如组件未内置固定定位，可取消注释如下代码 */
  /* position: fixed; bottom: 0; left: 0; width: 100%; z-index: 999; */
}
</style>