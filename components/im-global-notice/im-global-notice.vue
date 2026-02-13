<template>
  <view class="im-global-notice-layer" :style="{ top: `${topPx}px` }">
    <transition name="im-notice-slide">
      <view v-if="visible" class="im-global-notice" @tap.stop="handleTap">
        <view class="im-notice-avatar-zone" :class="{ 'has-stack': showStack }">
          <view v-if="showStack" class="avatar-stack">
            <view
              v-for="(sender, idx) in stackSenders"
              :key="`${sender.fromUid}-${idx}`"
              class="avatar-wrap"
              :class="`avatar-idx-${idx}`"
            >
              <image class="avatar-img" :src="sender.avatar || defaultAvatar" mode="aspectFill" />
            </view>
            <view v-if="extraCount > 0" class="avatar-more">+{{ extraCount }}</view>
          </view>
          <view v-else class="avatar-wrap avatar-idx-0">
            <image class="avatar-img" :src="latestSender?.avatar || defaultAvatar" mode="aspectFill" />
          </view>
        </view>

        <view class="im-notice-content font-alimamashuhei">
          <text class="notice-title font-alimamashuhei">{{ titleText }}</text>
          <text class="notice-desc font-alimamashuhei">{{ descText }}</text>
        </view>
      </view>
    </transition>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onIMEvent } from '@/common/im.js'
import { websiteUrl } from '@/common/config.js'

const defaultAvatar = '/static/user.png'
const BATCH_DELAY_MS = 160
const DISPLAY_MS = 3200
const MAX_EVENTS = 40

const visible = ref(false)
const topPx = ref(12)
const latestUid = ref(0)
const noticeEvents = ref([])

const pendingEvents = []
const profileCache = new Map()
const profileRequestMap = new Map()

let hideTimer = 0
let flushTimer = 0
let offIM = null

const latestEvent = computed(() => {
  const list = noticeEvents.value
  return list.length ? list[list.length - 1] : null
})

const uniqueSenders = computed(() => {
  const out = []
  const seen = new Set()
  for (let i = noticeEvents.value.length - 1; i >= 0; i -= 1) {
    const item = noticeEvents.value[i]
    if (!item || !item.fromUid || seen.has(item.fromUid)) continue
    seen.add(item.fromUid)
    out.push(item)
  }
  return out
})

const latestSender = computed(() => uniqueSenders.value[0] || latestEvent.value || null)
const showStack = computed(() => noticeEvents.value.length > 1 || uniqueSenders.value.length > 1)
const stackSenders = computed(() => uniqueSenders.value.slice(0, 3))
const extraCount = computed(() => Math.max(uniqueSenders.value.length - 3, 0))

const titleText = computed(() => {
  const latest = latestSender.value
  if (!latest) return '新消息'
  const senderCount = uniqueSenders.value.length
  const msgCount = noticeEvents.value.length
  if (msgCount <= 1) return latest.name || `UID:${latest.fromUid}`
  if (senderCount <= 1) return `${latest.name || `UID:${latest.fromUid}`} 发来 ${msgCount} 条新消息`
  return `${latest.name || `UID:${latest.fromUid}`} 等 ${senderCount} 人发来消息`
})

const descText = computed(() => {
  const latest = latestEvent.value
  if (!latest) return '你收到一条新消息'
  if (noticeEvents.value.length <= 1) return latest.preview || '你收到一条新消息'
  const msgCount = noticeEvents.value.length
  const preview = latest.preview || '你收到一条新消息'
  return `共 ${msgCount} 条新消息，最新：${preview}`
})

function getSelfUid () {
  try {
    const u = uni.getStorageSync('userInfo') || {}
    const id = Number(u?.id || u?.Id || 0)
    if (id) return id
  } catch (_) {}
  try {
    const legacy = Number(uni.getStorageSync('uid') || 0)
    if (legacy) return legacy
  } catch (_) {}
  return 0
}

function getCurrentRouteInfo () {
  try {
    const pages = getCurrentPages()
    if (!Array.isArray(pages) || pages.length === 0) return { route: '', options: {} }
    const cur = pages[pages.length - 1] || {}
    return {
      route: String(cur?.route || cur?.$page?.route || cur?.$page?.fullPath || ''),
      options: cur?.options || cur?.$page?.options || {}
    }
  } catch (_) {
    return { route: '', options: {} }
  }
}

function parsePeerIdFromRoute (route) {
  if (!route || route.indexOf('?') < 0) return 0
  const queryStr = route.slice(route.indexOf('?') + 1)
  const params = queryStr.split('&')
  for (let i = 0; i < params.length; i += 1) {
    const pair = params[i].split('=')
    if (pair[0] === 'peer_id') return Number(decodeURIComponent(pair[1] || '0')) || 0
  }
  return 0
}

function isCurrentPeerChat (uid) {
  if (!uid) return false
  const info = getCurrentRouteInfo()
  const route = info.route || ''
  if (route.indexOf('pkg-im/chat/chat') < 0) return false
  const options = info.options || {}
  const peer = Number(options.peer_id || options.peerId || parsePeerIdFromRoute(route) || 0)
  return peer > 0 && peer === Number(uid)
}

function mapBizToPreview (biz) {
  const key = String(biz || '').trim().toLowerCase().replace(/[\s\-:]+/g, '_')
  const map = {
    artist_order_submission_create: '我拍下了你的开单',
    artist_order_change_item: '投递内容已更新',
    artist_order_adjust_request: '订单价格调整申请',
    artist_order_change_price: '子订单金额调整',
    artist_order_step_request: '节点确认请求',
    artist_order_step_confirm: '节点已确认',
    artist_order_step_approve: '节点已确认',
    artist_order_step_reject: '节点已驳回',
    artist_order_buyer_confirm: '买家已确认订单内容',
    artist_order_seller_confirm: '卖家已确认，请付款',
    artist_order_payment_submitted: '买家已提交付款凭证',
    artist_order_operate: '订单状态更新'
  }
  if (map[key]) return map[key]
  if (key.startsWith('artist_order_')) return '订单消息'
  return ''
}

function previewFromContent (content) {
  if (!content || !content.type) return '你收到一条新消息'
  const t = String(content.type || '')
  if (t === 'text') return String(content.text || '').trim() || '你收到一条新消息'
  if (t === 'image') return '[图片]'
  if (t === 'emoji') return '[表情]'
  if (t === 'other') {
    const other = content.other || {}
    const card = other.card || {}
    const title = String(card.title || other.title || '').trim()
    if (title) return title
    const mapped = mapBizToPreview(other.biz || '')
    if (mapped) return mapped
    return '[系统通知]'
  }
  return '你收到一条新消息'
}

function normalizeIncomingEvent (payload) {
  if (!payload || typeof payload !== 'object') return null
  if (payload.type !== 'im.event') return null
  const ev = String(payload.event || '').toLowerCase()
  if (!['message', 'msg', 'new_message'].includes(ev)) return null

  const data = payload.data || {}
  const msg = data.message || data.msg || {}
  const senderObj = msg.sender || data.sender || {}
  const fromUid = Number(
    msg.sender_id ||
    msg.from_uid ||
    msg.fromUid ||
    senderObj.id ||
    senderObj.uid ||
    data.sender_id ||
    data.from_uid ||
    data.fromUid ||
    data.peer_id ||
    data.uid ||
    0
  )
  const toUid = Number(
    msg.to_uid ||
    msg.receiver_id ||
    msg.toUid ||
    data.to_uid ||
    data.receiver_id ||
    data.recver_id ||
    0
  )
  const selfUid = getSelfUid()
  if (!fromUid) return null
  if (selfUid && fromUid === selfUid) return null
  if (selfUid && toUid && toUid !== selfUid) return null
  if (isCurrentPeerChat(fromUid)) return null

  const name = String(
    msg.sender_name ||
    senderObj.name ||
    senderObj.username ||
    data.sender_name ||
    ''
  ).trim() || `UID:${fromUid}`
  const avatar = String(
    msg.sender_avatar ||
    senderObj.avatar ||
    data.sender_avatar ||
    ''
  ).trim()
  const preview = previewFromContent(msg.content || data.content)

  return {
    fromUid,
    name,
    avatar,
    preview,
    at: Date.now()
  }
}

function applySenderSnapshot (uid, snap) {
  if (!uid || !snap) return
  if (pendingEvents.length) {
    for (let i = 0; i < pendingEvents.length; i += 1) {
      if (pendingEvents[i].fromUid !== uid) continue
      pendingEvents[i] = {
        ...pendingEvents[i],
        name: pendingEvents[i].name && !pendingEvents[i].name.startsWith('UID:')
          ? pendingEvents[i].name
          : (snap.name || pendingEvents[i].name),
        avatar: pendingEvents[i].avatar || snap.avatar || ''
      }
    }
  }
  const list = noticeEvents.value
  let changed = false
  const next = list.map((item) => {
    if (item.fromUid !== uid) return item
    const name = item.name && !item.name.startsWith('UID:') ? item.name : (snap.name || item.name)
    const avatar = item.avatar || snap.avatar || ''
    if (name === item.name && avatar === item.avatar) return item
    changed = true
    return { ...item, name, avatar }
  })
  if (changed) noticeEvents.value = next
}

function fetchUserSnapshot (uid) {
  if (!uid || profileCache.has(uid)) return Promise.resolve(profileCache.get(uid) || null)
  if (profileRequestMap.has(uid)) return profileRequestMap.get(uid)

  const req = new Promise((resolve) => {
    uni.request({
      url: `${websiteUrl.value}/user-info?uid=${uid}`,
      method: 'GET',
      timeout: 5000,
      success: (res) => {
        const data = res?.data?.data || {}
        const name = String(data?.username || data?.user_name || '').trim()
        const avatar = String(data?.avatar || '').trim()
        const snap = { name, avatar }
        profileCache.set(uid, snap)
        resolve(snap)
      },
      fail: () => resolve(null),
      complete: () => { profileRequestMap.delete(uid) }
    })
  })
  profileRequestMap.set(uid, req)
  return req
}

function showNotice () {
  visible.value = true
  if (hideTimer) clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    visible.value = false
    noticeEvents.value = []
    latestUid.value = 0
  }, DISPLAY_MS)
}

function flushPendingEvents () {
  flushTimer = 0
  if (!pendingEvents.length) return
  const merged = [...noticeEvents.value, ...pendingEvents.splice(0)]
  noticeEvents.value = merged.slice(-MAX_EVENTS)
  const latest = noticeEvents.value[noticeEvents.value.length - 1]
  latestUid.value = Number(latest?.fromUid || 0)
  showNotice()
}

function enqueueNotice (evt) {
  pendingEvents.push(evt)
  if (!flushTimer) {
    flushTimer = setTimeout(flushPendingEvents, BATCH_DELAY_MS)
  }
  if (evt.fromUid > 0) {
    fetchUserSnapshot(evt.fromUid).then((snap) => {
      if (!snap) return
      applySenderSnapshot(evt.fromUid, snap)
    })
  }
}

function handlePayload (payload) {
  const evt = normalizeIncomingEvent(payload)
  if (!evt) return
  console.log('[IM-NOTICE] enqueue', evt)
  enqueueNotice(evt)
}

function handleTap () {
  const uid = Number(latestUid.value || latestSender.value?.fromUid || 0)
  if (!uid) return
  visible.value = false
  noticeEvents.value = []
  latestUid.value = 0
  uni.navigateTo({
    url: `/pkg-im/chat/chat?peer_id=${uid}`
  })
}

onMounted(() => {
  console.log('[IM-NOTICE] mounted')
  try {
    const sys = uni.getSystemInfoSync()
    topPx.value = Number(sys?.statusBarHeight || 0) + 12
  } catch (_) {
    topPx.value = 12
  }
  offIM = onIMEvent(handlePayload)
})

onUnmounted(() => {
  if (offIM) {
    offIM()
    offIM = null
  }
  if (flushTimer) {
    clearTimeout(flushTimer)
    flushTimer = 0
  }
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = 0
  }
})
</script>

<style scoped>
.im-global-notice-layer {
  position: fixed;
  left: 0;
  right: 0;
  z-index: 99999;
  pointer-events: none;
}

.im-global-notice {
  margin: 0 20rpx;
  padding: 16rpx 20rpx;
  border-radius: 22rpx;
  background: rgba(28, 32, 39, 0.92);
  box-shadow: 0 16rpx 40rpx rgba(0, 0, 0, 0.22);
  display: flex;
  align-items: center;
  pointer-events: auto;
}

.im-notice-avatar-zone {
  width: 132rpx;
  min-width: 132rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.im-notice-avatar-zone.has-stack {
  width: 170rpx;
  min-width: 170rpx;
}

.avatar-stack {
  display: flex;
  align-items: center;
}

.avatar-wrap {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  overflow: hidden;
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.08);
}

.avatar-wrap + .avatar-wrap {
  margin-left: -14rpx;
}

.avatar-idx-0 { opacity: 1; z-index: 3; }
.avatar-idx-1 { opacity: 0.72; z-index: 2; }
.avatar-idx-2 { opacity: 0.5; z-index: 1; }

.avatar-img {
  width: 100%;
  height: 100%;
}

.avatar-more {
  min-width: 56rpx;
  height: 48rpx;
  margin-left: 12rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.92);
  font-size: 24rpx;
  text-align: center;
  line-height: 48rpx;
  padding: 0 10rpx;
}

.im-notice-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.notice-title {
  color: rgba(255, 255, 255, 0.98);
  font-size: 26rpx;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notice-desc {
  color: rgba(255, 255, 255, 0.74);
  font-size: 22rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.im-notice-slide-enter-active,
.im-notice-slide-leave-active {
  transition: all 0.22s ease;
}

.im-notice-slide-enter-from,
.im-notice-slide-leave-to {
  transform: translateY(-24rpx);
  opacity: 0;
}
</style>
