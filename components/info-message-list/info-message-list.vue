<!-- info-message-list.vue -->
<template>
  <view class="message-tab">
    <!-- 空状态 -->
    <view
      v-if="!loading && messageList.length === 0"
      class="empty-box"
    >
      <text class="empty-text font-alimamashuhei">
        还没有收到任何站内信哦
      </text>
    </view>

    <!-- 列表 -->
    <view v-else class="list-wrap">
      <uni-swipe-action>
        <uni-swipe-action-item
          v-for="(item, index) in messageList"
          :key="item.id"
          :right-options="swipeOptions(item)"
          :threshold="0.4"
          @click="handleSwipeClick"
        >
          <view
            class="message-item"
            :style="itemStyle(index)"
            @tap="gotoDetail(item)"
          >
            <!-- 头图 -->
            <image
              class="cover-image"
              :src="item.cover_image"
              mode="aspectFill"
            />

            <!-- 中间内容 -->
            <view class="content">
              <text class="title font-alimamashuhei">
                {{ item.title }}
              </text>
              <text
                class="msg font-alimamashuhei"
                :class="{ unread: !item.is_read }"
              >
                {{ item.msg }}
              </text>
            </view>

            <!-- 右上时间 -->
            <text class="time font-alimamashuhei">
              {{ formatTime(item.created_at) }}
            </text>
          </view>
        </uni-swipe-action-item>
      </uni-swipe-action>

      <!-- 加载 / 加载更多 -->
      <view v-if="loading" class="loading-box">
        <loading-jump-text />
      </view>

      <view
        v-else-if="!finished && messageList.length > 0"
        class="load-more-box"
        @click="loadMore"
      >
        <text class="load-more-text font-alimamashuhei">
          点击加载更多
        </text>
      </view>

      <view
        v-else-if="finished && messageList.length > 0"
        class="load-more-box"
      >
        <text class="load-more-text font-alimamashuhei">
          已经到底啦
        </text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { websiteUrl, asyncGetUserInfo } from '@/common/config.js'

const emit = defineEmits(['update-stats'])

defineProps({
  // 预留，如果以后需要根据 active 决定是否刷新
  active: {
    type: Boolean,
    default: true
  }
})

const messageList = ref([])
const unreadCount = ref(0)

const page = ref(1)
const pageSize = 10
const loading = ref(false)
const finished = ref(false)

// 滑动按钮配置
const swipeOptions = item => {
  return [
    {
      text: '删除',
      style: {
        backgroundColor: '#dd524d'
      },
      data: {
        type: 'delete',
        id: item.id
      }
    },
    {
      text: item.is_read ? '已读' : '标记已读',
      style: {
        backgroundColor: '#6fd0d4'
      },
      data: {
        type: 'read',
        id: item.id
      }
    }
  ]
}

// 逐条淡入动画
function itemStyle(index) {
  const delay = index * 80
  return {
    animationDelay: delay + 'ms'
  }
}

// 初始化
onMounted(async () => {
  await asyncGetUserInfo()
  loadMessages(true)
  fetchUnreadCount()
})

// 拉取消息列表
function loadMessages(reset) {
  const token = uni.getStorageSync('token')
  if (!token) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    return
  }

  if (loading.value) return
  if (!reset && finished.value) return

  if (reset) {
    page.value = 1
    finished.value = false
    messageList.value = []
  }

  loading.value = true

  uni.request({
    url: `${websiteUrl.value}/with-state/user-messages`,
    method: 'GET',
    header: {
      Authorization: token
    },
    data: {
      page: page.value
    },
    success: res => {
      const resp = res.data || {}
      if (resp.status !== 'success') {
        uni.showToast({
          title: resp.msg || '消息加载失败',
          icon: 'none'
        })
        return
      }

      const data = resp.data || {}
      const list = data.message_list || []

      if (reset) {
        messageList.value = list
      } else {
        messageList.value = messageList.value.concat(list)
      }

      // 判定是否还有更多（按 pageSize 粗略判断）
      if (list.length < pageSize) {
        finished.value = true
      } else {
        page.value = page.value + 1
      }
    },
    fail: () => {
      uni.showToast({
        title: '网络错误，消息加载失败',
        icon: 'none'
      })
    },
    complete: () => {
      loading.value = false
    }
  })
}

function loadMore() {
  loadMessages(false)
}

// 获取未读数量，并把结果上报给父组件，用于顶部“站内信”数字
function fetchUnreadCount() {
  const token = uni.getStorageSync('token')
  if (!token) return

  uni.request({
    url: `${websiteUrl.value}/with-state/unread-message-count`,
    method: 'GET',
    header: {
      Authorization: token
    },
    success: res => {
      const resp = res.data || {}
      if (resp.status !== 'success') return

      const count = (resp.data && resp.data.count) || 0
      unreadCount.value = Number(count) || 0

      emit('update-stats', {
        messageTotal: unreadCount.value
      })
    }
  })
}

// 滑动按钮点击
function handleSwipeClick(e) {
  const { type, id } = e.content.data || {}
  if (!id) return

  if (type === 'delete') {
    showDeleteConfirm(id)
  } else if (type === 'read') {
    markAsRead(id)
  }
}

// 删除确认
function showDeleteConfirm(messageId) {
  uni.showModal({
    title: '删除确认',
    content: '确定要删除这条消息吗？',
    success: res => {
      if (res.confirm) {
        deleteMessage(messageId)
      }
    }
  })
}

// 删除消息
function deleteMessage(messageId) {
  const token = uni.getStorageSync('token')
  if (!token) return

  uni.request({
    url: `${websiteUrl.value}/with-state/delete-message`,
    method: 'POST',
    header: {
      Authorization: token,
      'Content-Type': 'application/json'
    },
    data: {
      message_id: messageId
    },
    success: () => {
      messageList.value = messageList.value.filter(item => item.id !== messageId)
      fetchUnreadCount()
      uni.showToast({
        title: '删除成功'
      })
    },
    fail: () => {
      uni.showToast({
        title: '删除失败',
        icon: 'none'
      })
    }
  })
}

// 标记已读
function markAsRead(messageId) {
  const token = uni.getStorageSync('token')
  if (!token) return

  uni.request({
    url: `${websiteUrl.value}/with-state/mark-message-read`,
    method: 'POST',
    header: {
      Authorization: token,
      'Content-Type': 'application/json'
    },
    data: {
      message_id: messageId
    },
    success: () => {
      const item = messageList.value.find(i => i.id === messageId)
      if (item && !item.is_read) {
        item.is_read = 1
        unreadCount.value = Math.max(0, unreadCount.value - 1)
        emit('update-stats', {
          messageTotal: unreadCount.value
        })
      }
    },
    fail: () => {
      uni.showToast({
        title: '标记失败',
        icon: 'none'
      })
    }
  })
}

// 跳转详情
function gotoDetail(item) {
  if (!item || !item.id) return
  uni.navigateTo({
    url: `/pages/message_info/message_info?message_id=${item.id}`
  })
}

// 时间格式化（沿用原页面逻辑）
function formatTime(timestamp) {
  if (!timestamp) return '--'
  const date = new Date(timestamp * 1000)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}`
}
</script>

<style lang="scss" scoped>
.message-tab {
  padding-top: 12rpx;
}

/* 列表容器 */
.list-wrap {
  margin-top: 4rpx;
}

/* 与关注 tab 共用的淡入动画风格 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(16rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 单条消息卡片样式，沿用原页面风格，并和品牌卡片统一圆角与阴影 */
.message-item {
  position: relative;
  margin-top: 24rpx;
  padding: 24rpx 24rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.04);
  display: flex;

  opacity: 0;
  transform: translateY(16rpx);
  animation-name: fadeInUp;
  animation-duration: 0.32s;
  animation-timing-function: ease;
  animation-fill-mode: forwards;

  &:active {
    transform: scale(0.98);
  }
}

.cover-image {
  width: 96rpx;
  height: 96rpx;
  border-radius: 16rpx;
  margin-right: 24rpx;
  flex-shrink: 0;
  background: #f3f3f3;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-right: 24rpx;
}

.title {
  font-size: 28rpx;
  color: #1a1a1a;
  font-weight: 600;
  margin-bottom: 8rpx;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.msg {
  font-size: 26rpx;
  line-height: 1.4;
  color: #666666;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  &.unread {
    color: #ff6a00;
    position: relative;
    padding-left: 30rpx;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 12rpx;
      height: 12rpx;
      background: #ff6a00;
      border-radius: 50%;
    }
  }
}

.time {
  position: absolute;
  right: 24rpx;
  top: 24rpx;
  font-size: 22rpx;
  color: #999999;
}

/* 空状态、加载更多，与 follow-tab 保持一致风格 */
.empty-box {
  margin-top: 80rpx;
  text-align: center;
}

.empty-text {
  font-size: 26rpx;
  color: #aaaaaa;
}

.loading-box,
.load-more-box {
  margin: 24rpx 0 12rpx;
  text-align: center;
}

.load-more-text {
  font-size: 24rpx;
  color: #888888;
}

/* uni-swipe-action 按钮样式微调，使其贴合圆角卡片 */
.uni-swipe-action {
  margin-bottom: 24rpx;
}

.uni-swipe_button-group {
  border-radius: 0 24rpx 24rpx 0;
  overflow: hidden;
}
</style>
