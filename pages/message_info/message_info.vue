<template>
  <view class="page">
    <view-logs />

    <!-- 顶部渐变背景装饰（不影响滚动） -->
    <view class="bg-deco"></view>

    <!-- 加载态 -->
    <view v-if="loading" class="state-wrap">
      <view class="card skeleton">
        <view class="sk-cover"></view>
        <view class="sk-title"></view>
        <view class="sk-sub"></view>
        <view class="sk-line" v-for="i in 6" :key="i"></view>
      </view>
    </view>

    <!-- 错误态 -->
    <view v-else-if="error" class="state-wrap">
      <view class="card error-card">
        <view class="error-icon">
          <uni-icons type="info" size="22" color="#ff4d4f"></uni-icons>
        </view>
        <text class="error-title">加载失败</text>
        <text class="error-desc">{{ error }}</text>

        <button class="btn-primary" @tap="fetchMessageDetail">重试</button>
      </view>
    </view>

    <!-- 内容 -->
    <scroll-view v-else class="scroll" scroll-y>
      <view class="container">
        <!-- 封面（可无） -->
        <view v-if="coverUrl" class="cover-wrap">
          <image class="cover" :src="coverUrl" mode="aspectFill" lazy-load />
          <view class="cover-mask"></view>

          <view class="cover-meta">
            <text class="cover-title">{{ safeTitle }}</text>
            <view class="cover-row">
              <text class="badge" :class="{ 'badge--unread': !isRead }">
                {{ isRead ? '已读' : '未读' }}
              </text>
              <text class="cover-time">{{ safeTime }}</text>
            </view>
          </view>
        </view>

        <!-- 主卡片 -->
        <view class="card content-card">
          <!-- 没封面时：标题区放卡片里 -->
          <view v-if="!coverUrl" class="header">
            <text class="title">{{ safeTitle }}</text>
            <view class="sub-row">
              <text class="badge" :class="{ 'badge--unread': !isRead }">
                {{ isRead ? '已读' : '未读' }}
              </text>
              <text class="time">{{ safeTime }}</text>
            </view>
          </view>

          <!-- 正文 -->
          <view class="body">
            <text class="msg">
              {{ safeMsg }}
            </text>
          </view>

          <!-- 轻提示：自动已读 -->
          <view class="hint" v-if="didAutoMarkRead">
            <uni-icons type="checkbox-filled" size="16" color="#10b981"></uni-icons>
            <text class="hint-text">已自动标记为已读</text>
          </view>
        </view>

        <view class="bottom-safe"></view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { websiteUrl, asyncGetUserInfo } from '@/common/config.js'

const props = defineProps({
  message_id: {
    type: [String, Number],
    default: ''
  }
})

const loading = ref(true)
const error = ref('')
const messageId = ref('')
const messageDetail = ref(null)

// 已读调用去重
const markReadInFlight = ref(false)
const didAutoMarkRead = ref(false)

// websiteUrl 兼容 string/ref
const baseURL = computed(() => {
  if (typeof websiteUrl === 'string') return websiteUrl
  if (websiteUrl && typeof websiteUrl === 'object' && 'value' in websiteUrl) return websiteUrl.value
  return ''
})

// 安全展示字段
const coverUrl = computed(() => messageDetail.value?.cover_image || '')
const safeTitle = computed(() => messageDetail.value?.title || '消息详情')
const safeMsg = computed(() => messageDetail.value?.msg || '')
const isRead = computed(() => Number(messageDetail.value?.is_read || 0) === 1)

const safeTime = computed(() => {
  const ts = Number(messageDetail.value?.created_at || 0)
  if (!ts) return '--'
  return formatTime(ts)
})

function requestWithAuth ({ url, method = 'GET', data }) {
  const token = uni.getStorageSync('token')
  if (!token) return Promise.resolve({ ok: false, data: null })

  return new Promise((resolve) => {
    uni.request({
      url,
      method,
      data,
      timeout: 15000,
      header: { Authorization: token },
      success: (res) => resolve({ ok: true, data: res?.data }),
      fail: () => resolve({ ok: false, data: null })
    })
  })
}

function parseQueryFromFullPath (fullPath) {
  // fullPath 可能形如：
  // 1) /pages/message_info/message_info?message_id=123
  // 2) /#/pages/message_info/message_info?message_id=123
  // 3) ...?id=123
  if (!fullPath) return {}
  const idx = fullPath.indexOf('?')
  if (idx < 0) return {}
  const qs = fullPath.slice(idx + 1)
  const obj = {}
  qs.split('&').forEach(kv => {
    const [k, v] = kv.split('=')
    if (!k) return
    obj[decodeURIComponent(k)] = decodeURIComponent(v || '')
  })
  return obj
}

function resolveMessageId () {
  // 1) props 优先
  const p = String(props.message_id || '').trim()
  if (p) return p

  // 2) 再从 fullPath 取（避免 getCurrentPages().options 的滞后问题）
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const fullPath = currentPage?.$page?.fullPath || ''

  const q = parseQueryFromFullPath(fullPath)
  return String(q.message_id || q.id || '').trim()
}

// 获取消息详情 + 自动已读
async function fetchMessageDetail () {
  try {
    loading.value = true
    error.value = ''
    didAutoMarkRead.value = false

    if (!messageId.value) {
      error.value = '无效的消息ID'
      return
    }

    const userInfo = await asyncGetUserInfo()
    if (!userInfo) {
      error.value = '请先登录'
      return
    }

    if (!baseURL.value) {
      error.value = '接口地址未配置'
      return
    }

    const res = await requestWithAuth({
      url: `${baseURL.value}/with-state/message-detail`,
      method: 'GET',
      data: { id: messageId.value }
    })

    const resp = res.data || {}
    if (!res.ok || resp.status !== 'success') {
      error.value = resp.msg || '获取详情失败'
      return
    }

    messageDetail.value = resp.data || null

    // 通知列表页：先本地更新（即使已读接口稍后失败，列表也能即时反应）
    uni.$emit('message-status-update', {
      id: messageId.value,
      is_read: 1
    })

    // 自动已读：仅当 is_read==0 才调用
    if (messageDetail.value && Number(messageDetail.value.is_read || 0) === 0) {
      await markMessageAsRead()
    }
  } catch (e) {
    error.value = '请求失败，请检查网络'
    // eslint-disable-next-line no-console
    console.error('message_detail error:', e)
  } finally {
    loading.value = false
  }
}

// 调用已读接口
async function markMessageAsRead () {
  if (markReadInFlight.value) return
  if (!messageId.value) return
  if (!baseURL.value) return

  markReadInFlight.value = true
  try {
    // 该接口为 POST /with-state/mark-message-read，请求体 { message_id: int } :contentReference[oaicite:1]{index=1}
    const res = await requestWithAuth({
      url: `${baseURL.value}/with-state/mark-message-read`,
      method: 'POST',
      data: { message_id: Number(messageId.value) }
    })

    const resp = res.data || {}
    if (res.ok && resp.status === 'success') {
      // 本地更新
      if (messageDetail.value) messageDetail.value.is_read = 1
      didAutoMarkRead.value = true

      // 你如果还有“未读数量”全局刷新，这里也可额外 emit
      // uni.$emit('message-unread-refresh')
    }
  } finally {
    markReadInFlight.value = false
  }
}

// 时间格式化
function formatTime (timestamp) {
  const date = new Date(timestamp * 1000)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}`
}

// 进入/返回该页面时刷新（符合你偏好：onShow 拉最新）
onShow(() => {
  uni.setNavigationBarTitle({ title: '消息详情' })

  const id = resolveMessageId()
  if (!id) {
    messageId.value = ''
    messageDetail.value = null
    loading.value = false
    error.value = '无效的消息ID'
    return
  }

  // 若切换不同消息，重置状态
  if (messageId.value !== id) {
    messageDetail.value = null
    didAutoMarkRead.value = false
  }

  messageId.value = id
  fetchMessageDetail()
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #ffffff;
  position: relative;
}

.bg-deco {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  height: 380rpx;
  background: linear-gradient(135deg, #e0f3ff 0%, #fff9fb 55%, #ffffff 100%);
  z-index: 0;
}

.scroll {
  position: relative;
  z-index: 1;
  height: 100vh;
}

.container {
  padding: 24rpx 24rpx 0;
  box-sizing: border-box;
}

.state-wrap {
  position: relative;
  z-index: 1;
  padding: 28rpx 24rpx;
}

.card {
  background: #ffffff;
  border-radius: 28rpx;
  box-shadow: 0 18rpx 60rpx rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.cover-wrap {
  position: relative;
  border-radius: 28rpx;
  overflow: hidden;
  box-shadow: 0 18rpx 60rpx rgba(0, 0, 0, 0.08);
}

.cover {
  width: 100%;
  height: 620rpx;
  background: #f3f4f6;
}

.cover-mask {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 220rpx;
  background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 100%);
}

.cover-meta {
  position: absolute;
  left: 24rpx;
  right: 24rpx;
  bottom: 22rpx;
  display: flex;
  flex-direction: column;
}

.cover-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.35;
  text-shadow: 0 2rpx 10rpx rgba(0,0,0,0.25);
}

.cover-row {
  margin-top: 14rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cover-time {
  font-size: 24rpx;
  color: rgba(255,255,255,0.85);
}

.content-card {
  margin-top: 20rpx;
  padding: 28rpx 28rpx 22rpx;
}

.header {
  padding-bottom: 18rpx;
  border-bottom: 2rpx solid rgba(0,0,0,0.04);
}

.title {
  font-size: 36rpx;
  font-weight: 700;
  color: #111827;
  line-height: 1.35;
}

.sub-row {
  margin-top: 12rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.time {
  font-size: 24rpx;
  color: #9ca3af;
}

.badge {
  font-size: 22rpx;
  color: #6b7280;
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  background: rgba(17, 24, 39, 0.06);
}

.badge--unread {
  color: #b45309;
  background: rgba(245, 158, 11, 0.18);
}

.body {
  padding-top: 22rpx;
}

.msg {
  font-size: 30rpx;
  line-height: 1.75;
  color: #374151;
  white-space: pre-wrap;
  word-break: break-word;
}

.hint {
  margin-top: 22rpx;
  padding: 14rpx 16rpx;
  border-radius: 18rpx;
  background: rgba(16, 185, 129, 0.08);
  display: flex;
  align-items: center;
}

.hint-text {
  margin-left: 10rpx;
  font-size: 24rpx;
  color: #059669;
}

/* 错误卡片 */
.error-card {
  padding: 40rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.error-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 999rpx;
  background: rgba(255, 77, 79, 0.10);
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-title {
  margin-top: 18rpx;
  font-size: 30rpx;
  font-weight: 700;
  color: #111827;
}

.error-desc {
  margin-top: 10rpx;
  font-size: 26rpx;
  color: #6b7280;
  text-align: center;
  line-height: 1.6;
}

.btn-primary {
  margin-top: 22rpx;
  width: 280rpx;
  height: 78rpx;
  line-height: 78rpx;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #89d4ff 0%, #f8d478 100%);
  color: #ffffff;
  font-size: 28rpx;
  border: none;
}

/* skeleton */
.skeleton {
  padding: 22rpx;
}
.sk-cover {
  height: 360rpx;
  border-radius: 22rpx;
  background: linear-gradient(90deg, #f3f4f6 0%, #eef2f7 50%, #f3f4f6 100%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
}
.sk-title {
  margin-top: 22rpx;
  height: 34rpx;
  border-radius: 12rpx;
  background: linear-gradient(90deg, #f3f4f6 0%, #eef2f7 50%, #f3f4f6 100%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
}
.sk-sub {
  margin-top: 14rpx;
  width: 55%;
  height: 24rpx;
  border-radius: 12rpx;
  background: linear-gradient(90deg, #f3f4f6 0%, #eef2f7 50%, #f3f4f6 100%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
}
.sk-line {
  margin-top: 16rpx;
  height: 22rpx;
  border-radius: 12rpx;
  background: linear-gradient(90deg, #f3f4f6 0%, #eef2f7 50%, #f3f4f6 100%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
}
@keyframes shimmer {
  0% { background-position: 0% 0; }
  100% { background-position: -200% 0; }
}

.bottom-safe {
  height: 40rpx;
}
</style>
