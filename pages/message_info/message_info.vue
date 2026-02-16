<template>
  <view class="page">
    <view-logs />

    <view class="bg-gradient"></view>

    <view v-if="loading" class="state-wrap">
      <view class="card skeleton">
        <view class="sk-line sk-hero"></view>
        <view class="sk-line sk-title"></view>
        <view class="sk-line sk-sub"></view>
        <view class="sk-line" v-for="i in 5" :key="i"></view>
      </view>
    </view>

    <view v-else-if="error" class="state-wrap">
      <view class="card error-card">
        <view class="error-icon">
          <uni-icons type="info" size="20" color="#ff5a5f"></uni-icons>
        </view>
        <text class="error-title font-title">加载失败</text>
        <text class="error-desc font-alimamashuhei">{{ error }}</text>
        <button class="retry-btn font-title" @tap="fetchMessageDetail">重试</button>
      </view>
    </view>

    <scroll-view v-else class="scroll" scroll-y>
      <view class="container">
        <view class="card hero-card">
          <common-image
            class="hero-cover"
            :src="coverUrl"
            width="100%"
            height="100%"
            radius="44"
            mode="aspectFill"
            :lazy="true"
          />
          <view class="hero-mask"></view>

          <view class="hero-top">
            <view class="hero-chip system-chip font-title">
              <view class="chip-dot"></view>
              <text class="chip-text">{{ sourceChipText }}</text>
            </view>

            <view class="hero-right">
              <text class="hero-time font-title">{{ displayTime }}</text>
              <text class="hero-chip read-chip font-title" :class="{ unread: !isRead }">
                {{ isRead ? 'READ' : 'UNREAD' }}
              </text>
            </view>
          </view>

          <view class="hero-bottom">
            <text class="hero-title font-alimamashuhei">{{ safeTitle }}</text>
            <text v-if="heroSubtitle" class="hero-subtitle">{{ heroSubtitle }}</text>
          </view>
        </view>

        <view class="card detail-card">
          <view class="section-head">
            <view class="section-mark"></view>
            <text class="section-title font-alimamashuhei">消息内容</text>
          </view>
          <text class="detail-msg">{{ safeMsg }}</text>
        </view>

        <view v-if="hasGiftList" class="card gift-card">
          <view class="gift-head">
            <view class="gift-head-left">
              <uni-icons type="gift" size="21" color="#38acec"></uni-icons>
              <text class="gift-title font-alimamashuhei">虚拟礼物</text>
            </view>
            <text class="gift-head-tag font-title">Rewards</text>
          </view>

          <view
            v-for="(gift, idx) in giftList"
            :key="`gift_${idx}_${gift.code || gift.name || idx}`"
            class="gift-item"
          >
            <view class="gift-icon-wrap">
              <common-image
                v-if="gift.icon"
                :src="gift.icon"
                width="100%"
                height="100%"
                radius="40"
                mode="aspectFill"
                :lazy="true"
              />
              <view v-else class="gift-icon-fallback">
                <text class="gift-icon-text font-title">{{ giftInitial(gift.name) }}</text>
              </view>
            </view>

            <view class="gift-main">
              <text class="gift-name font-alimamashuhei">{{ giftPrimaryText(gift) }}</text>
              <text class="gift-desc">{{ giftSecondaryText(gift) }}</text>
            </view>

            <text class="gift-amount font-title" :class="{ points: gift.code === 'points' }">
              {{ giftBadgeText(gift) }}
            </text>
          </view>
        </view>

        <view class="read-tip" v-if="didAutoMarkRead">
          <uni-icons type="checkbox-filled" size="15" color="#39b980"></uni-icons>
          <text class="read-tip-text font-alimamashuhei">已自动标记为已读</text>
        </view>

        <view v-if="hasJumpAction" class="action-wrap">
          <button class="action-btn font-title" :disabled="jumping" @tap="handleJumpTap">
            {{ jumpButtonText }}
            <text class="action-arrow">→</text>
          </button>
          <text class="action-type font-title">{{ jumpTypeFootText }}</text>
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

const markReadInFlight = ref(false)
const didAutoMarkRead = ref(false)
const jumping = ref(false)

const baseURL = computed(() => {
  if (typeof websiteUrl === 'string') return websiteUrl
  if (websiteUrl && typeof websiteUrl === 'object' && 'value' in websiteUrl) return websiteUrl.value
  return ''
})

const coverUrl = computed(() => asText(messageDetail.value?.cover_image))
const safeTitle = computed(() => asText(messageDetail.value?.title) || '消息详情')
const sourceChipText = computed(() => Number(messageDetail.value?.from || 0) === 0 ? 'SYSTEM' : 'MESSAGE')
const isRead = computed(() => Number(messageDetail.value?.is_read || 0) === 1)
const displayTime = computed(() => {
  const ts = Number(messageDetail.value?.created_at || 0)
  if (!ts) return '--'
  return formatRelativeTime(ts)
})

const safeMsg = computed(() => {
  const text = resolveDisplayMessage(messageDetail.value)
  return text || '暂无消息内容'
})
const giftList = computed(() => resolveGiftList(messageDetail.value))
const hasGiftList = computed(() => giftList.value.length > 0)
const heroSubtitle = computed(() => resolveHeroSubtitle(messageDetail.value))

const jumpAction = computed(() => resolveJumpAction(messageDetail.value))
const hasJumpAction = computed(() => !!jumpAction.value)
const jumpButtonText = computed(() => {
  if (!jumpAction.value) return ''
  const custom = asText(jumpAction.value.text)
  if (custom) return custom
  return jumpAction.value.type === 'web' ? '打开网页' : '前往页面'
})
const jumpTypeFootText = computed(() => {
  if (!jumpAction.value) return ''
  return jumpAction.value.type === 'web' ? '网页链接 ↗' : '应用页面 ⤴'
})

function requestWithAuth({ url, method = 'GET', data }) {
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

function parseQueryFromFullPath(fullPath) {
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

function resolveMessageId() {
  const p = String(props.message_id || '').trim()
  if (p) return p

  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const fullPath = currentPage?.$page?.fullPath || ''

  const q = parseQueryFromFullPath(fullPath)
  return String(q.message_id || q.id || '').trim()
}

async function fetchMessageDetail() {
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

    uni.$emit('message-status-update', {
      id: messageId.value,
      is_read: 1
    })

    if (messageDetail.value && Number(messageDetail.value.is_read || 0) === 0) {
      await markMessageAsRead()
    }
  } catch (e) {
    error.value = '请求失败，请检查网络'
    console.error('message_detail error:', e)
  } finally {
    loading.value = false
  }
}

async function markMessageAsRead() {
  if (markReadInFlight.value) return
  if (!messageId.value) return
  if (!baseURL.value) return

  markReadInFlight.value = true
  try {
    const res = await requestWithAuth({
      url: `${baseURL.value}/with-state/mark-message-read`,
      method: 'POST',
      data: { message_id: Number(messageId.value) }
    })

    const resp = res.data || {}
    if (res.ok && resp.status === 'success') {
      if (messageDetail.value) messageDetail.value.is_read = 1
      didAutoMarkRead.value = true
    }
  } finally {
    markReadInFlight.value = false
  }
}

function formatTime(timestamp) {
  const date = new Date(timestamp * 1000)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}`
}

function formatRelativeTime(timestamp) {
  const now = Date.now()
  const target = timestamp * 1000
  const diff = Math.max(0, now - target)
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) return 'just now'
  if (diff < hour) return `${Math.floor(diff / minute)} min ago`
  if (diff < day) return `${Math.floor(diff / hour)} h ago`
  if (diff < 2 * day) return 'yesterday'
  return formatTime(timestamp)
}

function asText(value) {
  if (typeof value === 'string') return value.trim()
  if (value === null || value === undefined) return ''
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return ''
}

function tryParseJson(text) {
  const raw = asText(text)
  if (!raw) return null
  if (raw[0] !== '{') return null
  try {
    return JSON.parse(raw)
  } catch (e) {
    return null
  }
}

function toObject(value) {
  if (!value) return null
  if (typeof value === 'object' && !Array.isArray(value)) return value
  if (typeof value === 'string') {
    const parsed = tryParseJson(value)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed
  }
  return null
}

function pickText(obj, keys) {
  if (!obj) return ''
  for (let i = 0; i < keys.length; i++) {
    const value = asText(obj[keys[i]])
    if (value) return value
  }
  return ''
}

function pickObject(obj, keys) {
  if (!obj) return null
  for (let i = 0; i < keys.length; i++) {
    const found = toObject(obj[keys[i]])
    if (found) return found
  }
  return null
}

function normalizeJumpType(rawType, value = '') {
  const t = asText(rawType).toLowerCase()
  if (['app', 'page', 'path', 'route', 'in_app', 'miniapp'].includes(t)) return 'app'
  if (['web', 'h5', 'url', 'link', 'http', 'https'].includes(t)) return 'web'

  const v = asText(value).toLowerCase()
  if (v.startsWith('http://') || v.startsWith('https://')) return 'web'
  if (v) return 'app'
  return ''
}

function resolveDisplayMessage(detail) {
  if (!detail) return ''
  const direct = asText(detail.msg)
  if (direct && direct[0] !== '{') return direct

  const payload = tryParseJson(direct || asText(detail.msg_raw))
  if (!payload) return direct

  return pickText(payload, ['content', 'msg', 'text', 'body', 'description', 'desc']) || direct
}

function resolveHeroSubtitle(detail) {
  if (!detail) return ''

  const direct = asText(detail.sub_title || detail.subtitle || detail.subTitle || detail.description_en)
  if (direct) return direct

  const payload = tryParseJson(asText(detail.msg_raw) || asText(detail.msg))
  if (payload) {
    const sub = pickText(payload, [
      'subtitle', 'sub_title', 'subTitle', 'sub',
      'description_en', 'desc_en', 'en_subtitle'
    ])
    if (sub) return sub
  }

  return ''
}

function resolveJumpAction(detail) {
  if (!detail) return null

  let type = normalizeJumpType(detail.jump_type, detail.jump_value)
  let value = asText(detail.jump_value)
  let text = asText(detail.jump_text)
  let params = toObject(detail.jump_params) || null

  const readFromObj = (obj) => {
    if (!obj) return

    if (!type) {
      type = normalizeJumpType(
        pickText(obj, ['type', 'jump_type', 'open_type', 'target_type']),
        pickText(obj, ['value', 'jump_value', 'path', 'jump_path', 'url', 'jump_url', 'target'])
      )
    }
    if (!value) {
      value = pickText(obj, [
        'value', 'jump_value', 'path', 'jump_path',
        'url', 'jump_url', 'target', 'target_url'
      ])
    }
    if (!text) {
      text = pickText(obj, ['text', 'jump_text', 'button_text', 'cta_text', 'action_text'])
    }
    if (!params) {
      params = pickObject(obj, ['params', 'jump_params', 'query'])
    }
  }

  const payload = tryParseJson(asText(detail.msg_raw) || asText(detail.msg))
  if (payload) {
    readFromObj(payload)
    readFromObj(toObject(payload.jump))
    readFromObj(toObject(payload.action))
  }

  type = normalizeJumpType(type, value)
  if (!type || !value) return null

  return { type, value, text, params }
}

function normalizeGiftItem(raw = {}) {
  const code = asText(raw.code || raw.type || raw.key || raw.gift_type).toLowerCase()
  const name = asText(raw.name || raw.title || raw.label || raw.gift_name)
  const amount = asText(raw.amount || raw.value || raw.count || raw.num || raw.points || raw.score)
  const unit = asText(raw.unit)
  const desc = asText(raw.desc || raw.description || raw.text || raw.sub_title || raw.subtitle)
  const icon = asText(raw.icon || raw.icon_url || raw.image || raw.image_url || raw.cover || raw.cover_image)

  const fixed = {
    code,
    name: name || (code === 'points' ? '积分' : (code === 'avatar_frame' ? '头像框' : '虚拟礼物')),
    amount: amount || (code === 'avatar_frame' ? '1' : ''),
    unit: unit || (code === 'points' ? '积分' : (code === 'avatar_frame' ? '个' : '')),
    desc,
    icon
  }

  if (!fixed.name && !fixed.code && !fixed.amount) return null
  return fixed
}

function parseGiftArray(raw) {
  if (!Array.isArray(raw)) return []
  const list = []
  for (let i = 0; i < raw.length; i++) {
    const item = toObject(raw[i])
    if (!item) continue
    const normalized = normalizeGiftItem(item)
    if (normalized) list.push(normalized)
  }
  return list
}

function resolveGiftList(detail) {
  if (!detail) return []
  const fromServer = parseGiftArray(detail.gift_list)
  if (fromServer.length) return fromServer

  const payload = tryParseJson(asText(detail.msg_raw) || asText(detail.msg))
  if (!payload) return []

  let list = []
  list = list.concat(parseGiftArray(payload.gifts || payload.gift_list || payload.virtual_gifts || payload.rewards))

  const singleGift = toObject(payload.gift || payload.virtual_gift || payload.reward)
  if (singleGift) {
    const normalized = normalizeGiftItem(singleGift)
    if (normalized) list.push(normalized)
  }

  // 兼容旧字段：积分
  const points = asText(payload.points || payload.point || payload.integral || payload.score || payload.credit)
  if (points) {
    list.push({
      code: 'points',
      name: '积分',
      amount: points,
      unit: '积分',
      desc: '',
      icon: ''
    })
  }

  // 兼容旧字段：头像框
  const frameName = asText(payload.avatar_frame || payload.avatar_frame_name || payload.frame_name)
  const frameID = asText(payload.avatar_frame_id || payload.frame_id)
  if (frameName || frameID) {
    list.push({
      code: 'avatar_frame',
      name: '头像框',
      amount: '1',
      unit: '个',
      desc: frameName || frameID,
      icon: ''
    })
  }

  // 去重
  const seen = new Set()
  return list.filter((item) => {
    const key = `${item.code}|${item.name}|${item.amount}|${item.unit}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function giftInitial(name) {
  const text = asText(name)
  if (!text) return '礼'
  return text.slice(0, 1)
}

function giftPrimaryText(gift) {
  if (!gift) return '虚拟礼物'
  const amount = asText(gift.amount)
  if (gift.code === 'points' && amount) {
    return `${amount} 积分`
  }
  return asText(gift.name) || '虚拟礼物'
}

function giftSecondaryText(gift) {
  if (!gift) return 'System Rewards'
  const desc = asText(gift.desc)
  if (desc) return desc
  if (gift.code === 'points') return 'Community Points'
  if (gift.code === 'avatar_frame') return 'Avatar Frame'
  return 'System Rewards'
}

function giftBadgeText(gift) {
  if (!gift) return 'x1'
  const amount = asText(gift.amount) || '1'
  if (gift.code === 'points') {
    return `+${amount}`
  }
  return `x${amount}`
}

function normalizeAppPath(rawPath) {
  let path = asText(rawPath)
  if (!path) return ''

  if (/^https?:\/\//i.test(path)) {
    const hashIndex = path.indexOf('#/')
    if (hashIndex >= 0) {
      path = path.slice(hashIndex + 1)
    } else {
      try {
        const parsed = new URL(path)
        path = `${parsed.pathname || ''}${parsed.search || ''}`
      } catch (e) {
        return ''
      }
    }
  }

  if (path.startsWith('#/')) {
    path = path.slice(1)
  }
  if (!path.startsWith('/')) {
    path = `/${path}`
  }
  return path
}

function withQuery(url, params) {
  if (!params || typeof params !== 'object') return url

  const entries = Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
  if (!entries.length) return url

  const joined = entries
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&')

  return url.includes('?') ? `${url}&${joined}` : `${url}?${joined}`
}

function openAppPath(path, params) {
  const normalizedPath = normalizeAppPath(path)
  if (!normalizedPath) {
    uni.showToast({ title: '跳转路径无效', icon: 'none' })
    return
  }
  const finalUrl = withQuery(normalizedPath, params)
  const tabUrl = normalizedPath.split('?')[0]

  uni.navigateTo({
    url: finalUrl,
    fail: () => {
      uni.switchTab({
        url: tabUrl,
        fail: () => {
          uni.reLaunch({
            url: finalUrl,
            fail: () => uni.showToast({ title: '页面跳转失败', icon: 'none' })
          })
        }
      })
    }
  })
}

function openWebUrl(rawUrl) {
  const url = asText(rawUrl)
  if (!/^https?:\/\//i.test(url)) {
    uni.showToast({ title: '网页链接无效', icon: 'none' })
    return
  }

  // #ifdef APP-PLUS
  if (typeof plus !== 'undefined' && plus.runtime) {
    plus.runtime.openURL(url)
    return
  }
  // #endif

  // #ifdef H5
  window.open(url, '_blank')
  return
  // #endif

  uni.setClipboardData({
    data: url,
    success: () => uni.showToast({ title: '链接已复制', icon: 'none' })
  })
}

async function handleJumpTap() {
  if (jumping.value || !jumpAction.value) return
  jumping.value = true

  try {
    const { type, value, params } = jumpAction.value
    if (type === 'web') {
      openWebUrl(value)
      return
    }
    openAppPath(value, params)
  } finally {
    setTimeout(() => {
      jumping.value = false
    }, 300)
  }
}

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
  position: relative;
  background: #f3f5f8;
  overflow: hidden;
}

.bg-gradient {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  height: 320rpx;
  background: linear-gradient(180deg, #f8fbff 0%, #f3f5f8 100%);
  z-index: 0;
}

.scroll {
  position: relative;
  z-index: 1;
  height: 100vh;
}

.container {
  padding: 28rpx 24rpx 0;
  box-sizing: border-box;
}

.state-wrap {
  position: relative;
  z-index: 1;
  padding: 28rpx 24rpx;
}

.card {
  border-radius: 34rpx;
  background: #ffffff;
  box-shadow: 0 14rpx 40rpx rgba(17, 32, 58, 0.06);
}

.hero-card {
  width: 100%;
  padding-top: 133.3333%;
  position: relative;
  border-radius: 44rpx;
  overflow: hidden;
}

.hero-cover {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
}

.hero-mask {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.16) 0%, rgba(0, 0, 0, 0.22) 46%, rgba(0, 0, 0, 0.58) 100%);
}

.hero-top {
  position: absolute;
  left: 22rpx;
  right: 22rpx;
  top: 22rpx;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.hero-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10rpx;
}

.hero-time {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.92);
}

.hero-chip {
  height: 52rpx;
  border-radius: 26rpx;
  padding: 0 18rpx;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.18);
  border: 1rpx solid rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(2rpx);
}

.system-chip .chip-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: #33b6ff;
  margin-right: 10rpx;
}

.chip-text {
  color: #ffffff;
  font-size: 24rpx;
  letter-spacing: 1rpx;
}

.read-chip {
  height: 48rpx;
  color: #ccf0ff;
  border: none;
  background: rgba(63, 174, 255, 0.52);
  font-size: 20rpx;
}

.read-chip.unread {
  color: #ffffff;
  background: rgba(43, 170, 255, 0.82);
}

.hero-bottom {
  position: absolute;
  left: 22rpx;
  right: 22rpx;
  bottom: 26rpx;
}

.hero-title {
  font-size: 52rpx;
  color: #ffffff;
  line-height: 1.12;
  text-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.25);
}

.hero-subtitle {
  margin-top: 10rpx;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.38;
}

.detail-card {
  margin-top: 26rpx;
  padding: 30rpx;
}

.section-head {
  display: flex;
  align-items: center;
  margin-bottom: 22rpx;
}

.section-mark {
  width: 8rpx;
  height: 42rpx;
  border-radius: 8rpx;
  background: linear-gradient(180deg, #2db5ff 0%, #35a6f3 100%);
  margin-right: 16rpx;
}

.section-title {
  font-size: 38rpx;
  color: #1f2d44;
}

.detail-msg {
  font-size: 30rpx;
  line-height: 1.8;
  color: #2f3c50;
  white-space: pre-wrap;
  word-break: break-word;
}

.gift-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18rpx;
}

.gift-head-left {
  display: flex;
  align-items: center;
}

.gift-title {
  margin-left: 10rpx;
  font-size: 34rpx;
  color: #1f2e45;
}

.gift-head-tag {
  font-size: 22rpx;
  color: #9eb0c7;
  background: #f0f4f9;
  border-radius: 999rpx;
  padding: 8rpx 20rpx;
}

.gift-card {
  margin-top: 22rpx;
  padding: 30rpx;
}

.gift-item {
  display: flex;
  align-items: center;
  border-radius: 24rpx;
  background: #f7f9fc;
  padding: 18rpx;
}

.gift-item + .gift-item {
  margin-top: 14rpx;
}

.gift-icon-wrap {
  width: 90rpx;
  height: 90rpx;
  border-radius: 45rpx;
  overflow: hidden;
  flex-shrink: 0;
  background: #edf3fc;
}

.gift-icon-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(150deg, #e0edff 0%, #f0f6ff 100%);
}

.gift-icon-text {
  font-size: 30rpx;
  color: #4e6790;
}

.gift-main {
  margin-left: 16rpx;
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.gift-name {
  font-size: 30rpx;
  color: #1f2f49;
  line-height: 1.3;
}

.gift-desc {
  margin-top: 4rpx;
  font-size: 24rpx;
  color: #70839d;
  line-height: 1.35;
}

.gift-amount {
  margin-left: 18rpx;
  min-width: 110rpx;
  height: 52rpx;
  border-radius: 26rpx;
  text-align: center;
  line-height: 52rpx;
  font-size: 26rpx;
  color: #f55ea6;
  background: #ffe6f1;
  white-space: nowrap;
}

.gift-amount.points {
  color: #2ea9ef;
  background: #e1f3ff;
}

.read-tip {
  margin-top: 18rpx;
  padding: 12rpx 14rpx;
  border-radius: 14rpx;
  background: rgba(57, 185, 128, 0.12);
  display: flex;
  align-items: center;
}

.read-tip-text {
  margin-left: 8rpx;
  font-size: 23rpx;
  color: #249b67;
}

.jump-panel {
  display: none;
}

.action-wrap {
  margin-top: 24rpx;
}

.action-btn {
  width: 100%;
  height: 108rpx;
  line-height: 108rpx;
  border: none;
  border-radius: 999rpx;
  font-size: 34rpx;
  color: #ffffff;
  background: linear-gradient(90deg, #33a9ea 0%, #2caef0 55%, #1f9fe9 100%);
  box-shadow: 0 10rpx 28rpx rgba(41, 161, 232, 0.34);
}

.action-arrow {
  margin-left: 14rpx;
  font-size: 38rpx;
}

.action-btn::after,
.retry-btn::after {
  border: none;
}

.action-btn[disabled] {
  opacity: 0.55;
}

.action-type {
  margin-top: 16rpx;
  text-align: center;
  font-size: 24rpx;
  color: #9aa9be;
}

.error-card {
  padding: 40rpx 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.error-icon {
  width: 70rpx;
  height: 70rpx;
  border-radius: 999rpx;
  background: rgba(255, 90, 95, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-title {
  margin-top: 18rpx;
  font-size: 38rpx;
  color: #1f2937;
}

.error-desc {
  margin-top: 10rpx;
  text-align: center;
  font-size: 32rpx;
  line-height: 1.5;
  color: #667085;
}

.retry-btn {
  margin-top: 22rpx;
  width: 280rpx;
  height: 76rpx;
  line-height: 76rpx;
  border-radius: 999rpx;
  border: none;
  background: linear-gradient(90deg, #79c9f0 0%, #9bb7f8 100%);
  color: #fff;
  font-size: 28rpx;
}

.skeleton {
  padding: 26rpx;
}

.sk-line {
  height: 24rpx;
  border-radius: 14rpx;
  margin-top: 14rpx;
  background: linear-gradient(90deg, #f2f4f7 0%, #e9eef6 48%, #f2f4f7 100%);
  background-size: 220% 100%;
  animation: shimmer 1.3s linear infinite;
}

.sk-hero {
  margin-top: 0;
  height: 660rpx;
  border-radius: 34rpx;
}

.sk-title {
  margin-top: 20rpx;
  height: 48rpx;
  width: 72%;
}

.sk-sub {
  height: 34rpx;
  width: 40%;
}

.bottom-safe {
  height: calc(40rpx + env(safe-area-inset-bottom));
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
