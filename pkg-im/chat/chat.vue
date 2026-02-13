<template>
  <view class="chat-page">
    <view id="navWrapper" class="nav-wrapper">
      <zhouWei-navBar
        type="fixed"
        :backState="1000"
        :homeState="2000"
        bgColor="rgba(255,255,255,0.8)"
        fontColor="#000000"
        :shadow="false"
      >
        <template #left>
          <view class="nav-back-pill nav-back-pill--offset" @click="goBack" aria-label="返回">
            <uni-icons type="left" size="22" color="#000" />
          </view>
        </template>
        <template #default>
          <view class="nav-center">
            <text class="nav-title-ellipsis">{{ peerInfo.user_name || '私信' }}</text>
            <text class="nav-sub">{{ onlineText }}</text>
          </view>
        </template>
      </zhouWei-navBar>
    </view>

    <z-paging
      ref="pagingRef"
      v-model="messages"
      class="chat-body"
      :style="{ top: pagingTopPx }"
      :auto="false"
      use-chat-record-mode
      use-virtual-list
      cell-height-mode="dynamic"
      safe-area-inset-bottom
      :default-page-size="pageSize"
      :auto-show-system-loading="false"
      @query="onPagingQuery"
    >
      <template #cell="{ item }">
        <view style="transform: scaleY(-1)">
          <view class="msg-item" :class="{ self: item.from_uid === selfUid }">
            <image
              class="avatar"
              :src="item.from_uid === selfUid ? selfInfo.avatar : peerInfo.avatar"
            />

            <view class="content">
              <view class="bubble">
                <template v-if="item.kind === 'text'">
                  <rich-text :nodes="safeText(item.text)"></rich-text>
                </template>

                <template v-else-if="item.kind === 'emoji'">
                  <text class="emoji">{{ item.emoji }}</text>
                </template>

                <template v-else-if="item.kind === 'image'">
                  <image
                    class="img-msg"
                    :class="{ 'is-sticker': isStickerUrl(item.url) }" 
                    :src="item.url"
                    mode="widthFix"
                    @click="previewImage(item.url)"
                  />
                </template>

                <template v-else-if="item.kind === 'other' && (item.card || (item.payload && item.payload.card))">
                  <view class="msg-card" @click="handleCardClick(item)">
                    
                    <view class="msg-card-header">
                      <text 
                        v-if="computedCard(item).tagText"
                        class="msg-card-tag" 
                        :style="computedCard(item).tagStyle"
                      >
                        {{ computedCard(item).tagText }}
                      </text>
                      <text class="msg-card-title">{{ computedCard(item).title }}</text>
                    </view>
                  
                    <view v-if="computedCard(item).priceDisplay" class="msg-card-price-box">
                      <text class="price-label">{{ computedCard(item).priceLabel }}</text>
                      <view class="price-val">
                        <text class="amount font-alimamashuhei">{{ computedCard(item).priceDisplay }}</text>
                      </view>
                    </view>
                  
                    <view v-if="computedCard(item).image" class="msg-card-image-wrap">
                      <image
                        class="msg-card-image"
                        :src="computedCard(item).image"
                        mode="aspectFill"
                        @click.stop="previewImage(computedCard(item).image)"
                      />
                    </view>
                  
                    <view class="msg-card-body" v-if="computedCard(item).desc">
                      <text class="msg-card-desc">{{ computedCard(item).desc }}</text>
                    </view>
                  
                    <view class="msg-card-footer">
                      <text class="msg-card-action font-alimamashuhei">{{ computedCard(item).actionText }}</text>
                      <uni-icons type="right" size="12" color="#a2b7c0" />
                    </view>
                  </view>
                </template>

                <template v-else-if="item.kind === 'other'">
                  <view class="other-card">
                    <text class="title">[{{ item.sub_type || '其它' }}]</text>
                    <text class="desc">点击查看详情</text>
                  </view>
                </template>

                <template v-else>
                  <view class="other-card">
                    <text class="title">[未知消息]</text>
                  </view>
                </template>
              </view>

              <view class="meta font-alimamashuhei">
                <text class="time">{{ fmtTime(item.ts) }}</text>
                <text class="status" v-if="item.from_uid === selfUid">{{ statusText(item) }}</text>
              </view>
            </view>
          </view>
        </view>
      </template>

      <template #bottom>
        <view class="chat-inputbar" :class="{ 'with-sticker': showStickerPanel }">
          <view class="inputbar-wrap">
            <view class="tools">
              <uni-icons type="image" size="24" color="#666" @click="pickAndSendImage" />
              <uni-icons type="paperplane" size="24" color="#666" @click="toggleStickerPanel" />
            </view>

            <input
              class="text-input"
              type="text"
              v-model.trim="draft"
              confirm-type="send"
              :disabled="isBlocked"
              :adjust-position="false"
              @confirm="sendText"
              @focus="handleInputFocus"
            />

            <view class="sticker-panel" v-if="showStickerPanel">
              <scroll-view scroll-y class="sticker-scroll">
                <view class="sticker-grid">
                  <view
                    v-for="s in stickers"
                    :key="s.id"
                    class="sticker-item"
                    @click="sendSticker(s)"
                  >
                    <image
                      class="sticker-thumb"
                      :src="s.thumb_url || s.image_url"
                      mode="aspectFit"
                    />
                  </view>
                </view>
              </scroll-view>
            </view>
          </view>
        </view>
      </template>
    </z-paging>
  </view>
</template>

<script setup>
import { ref, nextTick, computed, getCurrentInstance } from 'vue'
import { onLoad, onUnload, onShow, onHide } from '@dcloudio/uni-app'
import {
  websiteUrl,
  getWindowTop,
  getFooterPlaceholderHeight,
  toPx,
  image1Url,
} from '@/common/config.js'
import {
  connectIM,
  onIMEvent,
  getWS,
  setActiveSession,
  clearActiveSession
} from '@/common/im.js'

const _ins = getCurrentInstance()
const pagingRef = ref(null)

const peerId = ref(0)
const sessionKey = ref('')
const numericSid = ref(0)

const selfUid = ref(0)
const selfInfo = ref({ id: 0, avatar: '' })
const peerInfo = ref({ user_name: '', avatar: '' })
const onlineText = ref('')

const messages = ref([])
const pageSize = 20
const draft = ref('')

// Sticker logic
const showStickerPanel = ref(false)
const stickers = ref([])
const stickerLoading = ref(false)

const isBlocked = ref(false)
const myReadPts = ref(0)
const peerReadPts = ref(0)
const pendingReadPts = ref(0)

let offIM = null
const hasInitOnce = ref(false)
let readFlushTask = null
let readRepairTimer = null

// Layout
const windowTopPxRaw = ref(0)
const footerSafeRaw = ref(0)
const navBarBottomPxRaw = ref(0)

const pagingTopPx = computed(() => {
  const n = Number(navBarBottomPxRaw.value || 0)
  if (n > 0) return toPx(n)
  return toPx(windowTopPxRaw.value || 0)
})

let clickAudio = null
function playClickSound () {
  try {
    if (!clickAudio) {
      clickAudio = uni.createInnerAudioContext()
      clickAudio.src = '/static/click.mp3'
      clickAudio.loop = false
      clickAudio.startTime = 0
    } else {
      try { clickAudio.stop() } catch (e) {}
    }
    clickAudio.play()
  } catch (e) {
    console.warn('[CHAT-DBG] playClickSound error', e)
  }
}

function waitWsReady (timeout = 5000) {
  return new Promise((resolve) => {
    const start = Date.now()
    function check () {
      const socket = getWS()
      if (socket && socket.readyState === 1) {
        resolve(socket)
        return
      }
      if (Date.now() - start >= timeout) {
        resolve(null)
        return
      }
      setTimeout(check, 150)
    }
    check()
  })
}

async function scheduleMarkReadWhenReady () {
  if (readFlushTask) return readFlushTask
  if (numericSid.value <= 0) return
  readFlushTask = (async () => {
    const socket = await waitWsReady(5000)
    if (!socket || socket.readyState !== 1) return
    markReadToBottom(true)
  })().finally(() => {
    readFlushTask = null
  })
  return readFlushTask
}

function startReadRepairTimer () {
  stopReadRepairTimer()
  readRepairTimer = setInterval(() => {
    markReadToBottom()
  }, 1500)
}

function stopReadRepairTimer () {
  if (readRepairTimer) {
    clearInterval(readRepairTimer)
    readRepairTimer = null
  }
}

function initSelfUidFromStorage () {
  try {
    const u = uni.getStorageSync('userInfo') || {}
    const id = Number(u?.id || u?.Id || 0)
    if (id) selfUid.value = id
    else {
      const legacy = Number(uni.getStorageSync('uid') || 0)
      if (legacy) selfUid.value = legacy
    }
  } catch (_) {}
}

function measureNavBar () {
  return new Promise((resolve) => {
    const q1 = (() => {
      try { return uni.createSelectorQuery().in(_ins) } catch (_) { return null }
    })()
    const query = q1 || uni.createSelectorQuery()
    query
      .select('#navWrapper')
      .boundingClientRect((rect) => {
        const bottom = Number(rect?.bottom || 0)
        const height = Number(rect?.height || 0)
        const v = bottom > 0 ? bottom : height
        if (v > 0) navBarBottomPxRaw.value = v
        resolve(v)
      })
      .exec()
  })
}

async function refreshLayoutOffsets () {
  windowTopPxRaw.value = getWindowTop()
  footerSafeRaw.value = getFooterPlaceholderHeight()
  await nextTick()
  await measureNavBar()
}

function pickReaderId (d) {
  return Number(d?.reader_id ?? d?.reader ?? d?.user_id ?? d?.uid ?? d?.from_uid ?? 0)
}
function applyPeerReadPts (newPts) {
  const n = Number(newPts || 0)
  if (n <= 0 || n <= peerReadPts.value) return
  peerReadPts.value = n
}

/* ---------- 生命周期 ---------- */
onLoad(async (query) => {
  peerId.value = Number(query.peer_id || 0)
  initSelfUidFromStorage()
  await refreshLayoutOffsets()
})

onShow(async () => {
  startReadRepairTimer()
  await refreshLayoutOffsets()
  if (!hasInitOnce.value) {
    await Promise.all([fetchPeerInfo(), fetchSelfInfo()])
    connectIM()
    if (offIM) { offIM = null }
    offIM = onIMEvent(handleIMEvent)
    
    // 初始化会话
    const token = uni.getStorageSync('token')
    try {
      const res = await uni.request({
        url: `${websiteUrl.value}/with-state/im/start-session?peer_id=${encodeURIComponent(peerId.value)}`,
        method: 'POST',
        header: token ? { Authorization: token } : {}
      })
      if (res?.data?.status === 'success' && res.data?.data?.session_id) {
        const data = res.data.data
        sessionKey.value = String(data.session_id)
        const nId = Number(data?.numeric_id || 0)
        if (nId > 0) numericSid.value = nId
        const peerPtsFromStart = Number(data?.peer_read_pts ?? data?.peerReadPts ?? data?.read_pts_peer ?? 0)
        if (peerPtsFromStart > 0) applyPeerReadPts(peerPtsFromStart)
      } else {
        uni.showToast({ title: '会话初始化失败', icon: 'none' })
        return
      }
    } catch (e) {
      uni.showToast({ title: '会话初始化异常', icon: 'none' })
      return
    }

    messages.value = []
    hasInitOnce.value = true
    const key = numericSid.value > 0 ? numericSid.value : sessionKey.value
    if (key) setActiveSession(key)

    nextTick(() => {
      if (pagingRef.value && typeof pagingRef.value.reload === 'function') {
        pagingRef.value.reload()
      }
    })
    scheduleMarkReadWhenReady()
    return
  }
  
  // Re-enter
  connectIM()
  if (offIM) { offIM = null }
  offIM = onIMEvent(handleIMEvent)
  const key = numericSid.value > 0 ? numericSid.value : sessionKey.value
  if (key) setActiveSession(key)
  markReadToBottom()
  scheduleMarkReadWhenReady()
})

onHide(() => {
  stopReadRepairTimer()
  if (offIM) { offIM(); offIM = null }
})
onUnload(() => {
  stopReadRepairTimer()
  if (offIM) { offIM(); offIM = null }
  if (clickAudio) { try { clickAudio.destroy() } catch (e) {} }
  leaveActiveSession()
})

function leaveActiveSession () {
  const key = numericSid.value > 0 ? numericSid.value : sessionKey.value
  if (key) clearActiveSession(key)
}

async function fetchPeerInfo () {
  try {
    const res = await uni.request({ url: `${websiteUrl.value}/user-info?uid=${peerId.value}` })
    if (res?.data?.status === 'success') peerInfo.value = res.data.data || {}
  } catch (e) {}
}
async function fetchSelfInfo () {
  try {
    const token = uni.getStorageSync('token')
    if (!token) return
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/mine`,
      method: 'GET',
      header: { Authorization: token }
    })
    if (res?.data?.status === 'success') {
      selfInfo.value = res.data.data || {}
      const id = Number(selfInfo.value?.id || 0)
      if (id) selfUid.value = id
    }
  } catch (e) {}
}

async function onPagingQuery (pageNo, sizeFromPaging) {
  const isFirstPage = pageNo === 1 && messages.value.length === 0
  try {
    if (numericSid.value <= 0) {
      if (pagingRef.value) pagingRef.value.complete(false)
      return
    }
    let socket = getWS()
    if (!socket || socket.readyState !== 1) {
      if (isFirstPage) {
        socket = await waitWsReady(5000)
        if (!socket || socket.readyState !== 1) {
          if (pagingRef.value) pagingRef.value.complete(false)
          return
        }
      } else {
        if (pagingRef.value) pagingRef.value.complete(false)
        return
      }
    }

    let beforePTS = 0
    let afterPTS = 0
    if (messages.value.length === 0) afterPTS = 0
    else beforePTS = Math.min(...messages.value.map((m) => Number(m.pts || 0)))

    const reqId = 'sync_' + Date.now()
    const data = { session_id: Number(numericSid.value), limit: sizeFromPaging || pageSize }
    if (beforePTS > 0) data.before_pts = Number(beforePTS)
    else data.after_pts = Number(afterPTS)

    const pkt = { type: 'im.req', action: 'sync', req_id: reqId, data }
    const resp = await waitWsResponseOnce(socket, 'sync', reqId, 8000, () => {
      socket.send(JSON.stringify(pkt))
    })
    if (!resp || resp.status !== 'success') {
      if (pagingRef.value) pagingRef.value.complete(false)
      return
    }

    const syncMessagesRaw = Array.isArray(resp.data?.messages) ? resp.data.messages : []
    const syncMaxPts = syncMessagesRaw.reduce((mx, m) => Math.max(mx, Number(m?.pts || 0)), 0)
    const rawArr = syncMessagesRaw.map(wsToUiMessage)
    const existIds = new Set(messages.value.map((m) => m.id))
    const dedupArr = rawArr.filter((m) => !existIds.has(m.id))
    const segmentDesc = dedupArr.sort((a, b) => {
      const pa = Number(a.pts || 0)
      const pb = Number(b.pts || 0)
      if (pb !== pa) return pb - pa
      return Number(b.id || 0) - Number(a.id || 0)
    })

    if (pagingRef.value) pagingRef.value.complete(segmentDesc)
    else {
      if (messages.value.length === 0 || beforePTS === 0) messages.value = [...messages.value, ...segmentDesc]
      else messages.value = [...segmentDesc, ...messages.value]
    }

    const peerPtsFromSync = Number(resp?.data?.peer_read_pts ?? resp?.data?.peerReadPts ?? 0)
    if (peerPtsFromSync > 0) applyPeerReadPts(peerPtsFromSync)

    await nextTick()
    if (isFirstPage) {
      scrollToBottomSoon()
    }
    markReadToBottom(false, syncMaxPts)
  } catch (e) {
    if (pagingRef.value) pagingRef.value.complete(false)
  }
}

function sendText () {
  if (!draft.value) return
  const text = draft.value
  draft.value = ''
  showStickerPanel.value = false
  sendPayload({ kind: 'text', text })
}
function handleInputFocus () {
  showStickerPanel.value = false
  scrollToBottomSoon()
}
async function loadStickers () {
  if (stickerLoading.value || stickers.value.length > 0) return
  stickerLoading.value = true
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/stickers`,
      method: 'GET',
      data: { category: '', page: 1, pageSize: 200 }
    })
    const data = res?.data || {}
    if (data.status === 'success' || data.code === 0) {
      const list = data.data || data.list || []
      stickers.value = Array.isArray(list) ? list : []
    }
  } catch (e) {
  } finally {
    stickerLoading.value = false
  }
}
function toggleStickerPanel () {
  showStickerPanel.value = !showStickerPanel.value
  if (showStickerPanel.value) loadStickers()
}
function sendSticker (s) {
  if (!s || !s.image_url) return
  showStickerPanel.value = false
  sendPayload({ kind: 'image', url: s.image_url })
}
async function pickAndSendImage () {
  try {
    const chooseRes = await uni.chooseImage({ count: 1, sizeType: ['compressed'] })
    if (!chooseRes || !chooseRes.tempFilePaths || !chooseRes.tempFilePaths.length) return
    const filePath = chooseRes.tempFilePaths[0]
    const tkRes = await uni.request({
      url: `${websiteUrl.value}/with-state/qiniu-token`,
      method: 'POST',
      header: authHeader()
    })
    if (tkRes?.data?.status !== 'success') {
      uni.showToast({ title: '上传凭证失败', icon: 'none' }); return
    }
    const data = tkRes.data.data || {}
    const token = data.token
    const key = data.key || data.path
    const uploadUrl = data.upload_url || 'https://up-cn-east-2.qiniup.com'
    const domain = data.domain || image1Url
    const upRes = await uni.uploadFile({
      url: uploadUrl, filePath, name: 'file', formData: { token, key }
    })
    let body = {}
    try { body = JSON.parse(upRes.data || '{}') } catch (_) {}
    const finalKey = body.key || key
    const prefix = domain ? String(domain).replace(/\/$/, '') + '/' : ''
    const url = prefix + finalKey
    sendPayload({ kind: 'image', url })
  } catch (e) {
    uni.showToast({ title: '发送图片失败', icon: 'none' })
  }
}

function appendNewMessage (uiMsg) {
  if (pagingRef.value && typeof pagingRef.value.addChatRecordData === 'function') {
    pagingRef.value.addChatRecordData([uiMsg])
  } else {
    messages.value = [...messages.value, uiMsg]
  }
  playClickSound()
}

function sendPayload (msgPart) {
  const socket = getWS()
  if (!socket || socket.readyState !== 1) {
    uni.showToast({ title: '连接未就绪', icon: 'none' }); return
  }
  const client_mid = genClientMID()
  const local = buildLocalMsg({ ...msgPart, client_mid })
  appendNewMessage(local)
  scrollToBottomSoon()
  const pkt = {
    type: 'im.req', action: 'send', req_id: client_mid,
    data: { peer_id: Number(peerId.value), client_msg_id: client_mid, content: toWsContent(msgPart) }
  }
  waitWsResponseOnce(socket, 'send', client_mid, 8000, () => {
    socket.send(JSON.stringify(pkt))
  }).then((resp) => {
    if (!resp || resp.status !== 'success') {
      setMessageStatusByLocalKey(local.local_key, 'failed'); return
    }
    const d = resp.data || {}
    updateMessageByLocalKey(local.local_key, (old) => ({
      ...old,
      id: Number(d.message_id || old.id || 0),
      pts: Number(d.pts || old.pts || 0),
      ts: d.msg_time ? Math.floor(Number(d.msg_time) / 1000) : old.ts,
      status: 'sent'
    }))
    if (Number(d.session_id || 0) > 0 && numericSid.value === 0) numericSid.value = Number(d.session_id)
    const peerPtsFromAck = Number(d?.peer_read_pts ?? 0)
    if (peerPtsFromAck > 0) applyPeerReadPts(peerPtsFromAck)
  }).catch(() => {
    setMessageStatusByLocalKey(local.local_key, 'failed')
  })
}

function updateMessageByLocalKey (localKey, updater) {
  const list = messages.value
  const idx = list.findIndex((x) => x.local_key === localKey)
  if (idx >= 0) {
    const old = list[idx]
    const next = typeof updater === 'function' ? updater(old) : updater
    const newList = list.slice()
    newList.splice(idx, 1, next)
    messages.value = newList
  }
}
function setMessageStatusByLocalKey (localKey, status) {
  updateMessageByLocalKey(localKey, (old) => ({ ...old, status }))
}
function markReadToBottom (force = false, externalMaxPts = 0) {
  if (numericSid.value <= 0) return
  const maxPtsInList = messages.value.reduce((mx, m) => Math.max(mx, Number(m.pts || 0)), 0)
  const maxPts = Math.max(Number(externalMaxPts || 0), Number(maxPtsInList || 0))
  const targetPts = Math.max(Number(maxPts || 0), Number(pendingReadPts.value || 0))
  if (!force && targetPts <= myReadPts.value) return

  const socket = getWS()
  if (!socket || socket.readyState !== 1) {
    pendingReadPts.value = Math.max(Number(pendingReadPts.value || 0), Number(maxPts || 0))
    scheduleMarkReadWhenReady()
    return
  }

  if (targetPts <= myReadPts.value) {
    pendingReadPts.value = 0
    return
  }

  const sendPts = Number(targetPts)
  const reqId = 'read_' + Date.now()
  const pkt = {
    type: 'im.req', action: 'read_ack', req_id: reqId,
    data: { session_id: Number(numericSid.value), read_pts: sendPts }
  }
  console.log('[CHAT-READ] send read_ack', { session_id: Number(numericSid.value), read_pts: sendPts, req_id: reqId })
  waitWsResponseOnce(socket, 'read_ack', reqId, 5000, () => {
    socket.send(JSON.stringify(pkt))
  }).then((resp) => {
    console.log('[CHAT-READ] read_ack response', resp)
    if (resp && resp.status === 'success') {
      myReadPts.value = Math.max(Number(myReadPts.value || 0), sendPts)
      pendingReadPts.value = 0
      return
    }
    pendingReadPts.value = Math.max(Number(pendingReadPts.value || 0), sendPts)
  }).catch(() => {
    pendingReadPts.value = Math.max(Number(pendingReadPts.value || 0), sendPts)
  })
}
function isStickerUrl(url) {
  if (!url) return false
  return url.includes('box/admin')
}
function handleIMEvent (payload) {
  if (!payload || typeof payload !== 'object') return
  if (payload.type === 'im.event' && payload.event === 'message') {
    const d = payload.data || {}
    if (Number(d.session_id || 0) > 0 && numericSid.value === 0) numericSid.value = Number(d.session_id)
    if (typeof d.session_id === 'string' && d.session_id !== sessionKey.value) return
    if (numericSid.value > 0 && Number(d.session_id || 0) !== Number(numericSid.value)) return
    const ui = wsToUiMessage(d.message || {})
    const isSelf = ui.from_uid === selfUid.value
    if (isSelf) {
      let idx = ui.pts > 0 ? messages.value.findIndex((x) => x.from_uid === selfUid.value && Number(x.pts || 0) === ui.pts) : -1
      if (idx < 0) {
        const sig = buildSig(ui)
        idx = messages.value.findIndex((x) => x.from_uid === selfUid.value && x.status === 'sending' && x.sig === sig && Math.abs(Number(x.ts) - Number(ui.ts)) <= 5)
      }
      if (idx >= 0) {
        const list = messages.value
        const old = list[idx]
        const merged = { ...old, id: ui.id || old.id, pts: ui.pts || old.pts, ts: ui.ts || old.ts, status: 'sent' }
        const newList = list.slice()
        newList.splice(idx, 1, merged)
        messages.value = newList
        return
      }
    }
    appendNewMessage(ui)
    scrollToBottomSoon()
    markReadToBottom()
    return
  }
  if (payload.type === 'im.event' && payload.event === 'read') {
    const d = payload.data || {}
    if (numericSid.value > 0 && Number(d.session_id || 0) !== Number(numericSid.value)) return
    const reader = pickReaderId(d)
    if (reader && reader === selfUid.value) return
    if (reader && Number(peerId.value || 0) > 0 && reader !== Number(peerId.value)) return
    const peerPts = Number(d?.read_pts ?? 0)
    if (peerPts > 0) applyPeerReadPts(peerPts)
  }
}
function waitWsResponseOnce (socket, action, reqId, timeout = 8000, sender) {
  return new Promise((resolve) => {
    let timer = null
    const off = onIMEvent((payload) => {
      if (!payload || payload.type !== 'im.res') return
      if (payload.action !== action) return
      if (payload.req_id !== reqId) return
      clearTimeout(timer)
      off()
      resolve(payload)
    })
    timer = setTimeout(() => { off(); resolve(null) }, timeout)
    sender && sender()
  })
}
function toWsContent (part) {
  if (part.kind === 'text') return { type: 'text', text: part.text }
  if (part.kind === 'image') return { type: 'image', images: [{ url: part.url }] }
  if (part.kind === 'other') {
    return { type: 'other', other: { biz: part.sub_type || 'other', ...(part.payload || {}) } }
  }
  return { type: 'text', text: '[未知类型]' }
}
function buildSig (m) {
  const kind = m.kind || (m.content?.type) || ''
  if (kind === 'text') return `t|${(m.text || '').slice(0, 200)}`
  if (kind === 'emoji') return `e|${m.emoji || ''}`
  if (kind === 'image') return `i|${m.url || (m.images?.[0]?.url || '')}`
  if (kind === 'other') {
    const payload = m.payload || m.content?.other || {}
    return `o|${m.sub_type || payload.biz || 'other'}|${JSON.stringify(payload)}`
  }
  return 'u|'
}
function buildLocalMsg (part) {
  const now = Date.now()
  const base = {
    local_key: 'local-' + now + '-' + Math.random().toString(36).slice(2),
    id: 0, pts: 0, session_id: sessionKey.value || '',
    from_uid: selfUid.value, to_uid: Number(peerId.value),
    ts: Math.floor(now / 1000), status: 'sending', client_mid: part.client_mid
  }
  let ui
  if (part.kind === 'text') {
    ui = { ...base, kind: 'text', text: part.text }
  } else if (part.kind === 'image') {
    ui = { ...base, kind: 'image', url: part.url }
  } else {
    const payload = part.payload || {}
    ui = { ...base, kind: 'other', sub_type: part.sub_type, payload, card: payload.card || null }
  }
  ui.sig = buildSig(ui)
  return ui
}
function wsToUiMessage (m) {
  const base = {
    id: Number(m.id || 0), pts: Number(m.pts || 0),
    session_id: numericSid.value > 0 ? Number(numericSid.value) : sessionKey.value,
    from_uid: Number(m.sender_id || 0),
    to_uid: Number(m.sender_id || 0) === selfUid.value ? Number(peerId.value) : selfUid.value,
    ts: Math.floor((m.msg_time || Date.now()) / 1000), status: 'sent', client_mid: m.client_msg_id
  }
  const c = m.content || {}
  let ui
  switch (c.type) {
    case 'text': ui = { ...base, kind: 'text', text: c.text }; break
    case 'emoji': ui = { ...base, kind: 'emoji', emoji: c.emoji }; break
    case 'image': {
      const img = Array.isArray(c.images) && c.images[0] ? c.images[0] : {}
      ui = { ...base, kind: 'image', url: img.url || '' }; break
    }
    case 'other': {
      const other = c.other || {}
      ui = { ...base, kind: 'other', sub_type: other.biz || 'other', payload: other, card: other.card || null }; break
    }
    default: ui = { ...base, kind: 'text', text: '[未知类型]' }
  }
  ui.sig = buildSig(ui)
  return ui
}
function statusText (m) {
  if (!m || m.from_uid !== selfUid.value) return ''
  const pts = Number(m.pts || 0)
  const peerPts = Number(peerReadPts.value || 0)
  if (m.status === 'failed') return '发送失败'
  if (pts > 0 && peerPts >= pts) return '已读'
  if (pts === 0 && m.status === 'sending') return '发送中…'
  return '已发送'
}
function fmtTime (ts) {
  const d = new Date(Number(ts) * 1000)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
function safeText (t) { return (t || '').replace(/\n/g, '<br/>') }
function previewImage (url) { uni.previewImage({ urls: [url] }) }
function scrollToBottomSoon () {
  nextTick(() => { if (pagingRef.value) pagingRef.value.scrollToBottom() })
}
function goBack () { uni.navigateBack() }
function authHeader () {
  const token = uni.getStorageSync('token') || ''
  return token ? { Authorization: token } : {}
}
function genClientMID () {
  return 'm_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8)
}

/* ===================== 核心改造：Universal Card Computed Logic ===================== */

// 计算属性生成器：将不同结构（新版/旧版）统一转换为视图模型
function computedCard(item) {
  const card = item.card || item.payload?.card || {};
  
  // 1. 尝试直接获取后端下发的视觉属性
  let tagText = card.tag_text || '';
  let tagColor = card.tag_color || '#00695C';
  let tagBgColor = card.tag_bg_color || '#E0F2F1';
  let title = card.title || '消息通知';
  let desc = card.description || '';
  let image = card.image_url || card.imageUrl || card.img_url || '';
  let actionText = card.action_text || '查看详情';
  let priceLabel = card.price_label || '';
  let priceDisplay = card.price_display || '';

  // 2. 兼容层：如果后端没有传视觉属性（旧历史消息），则使用硬编码逻辑补全
  if (!tagText) {
    const type = card.card_type || '';
    switch (type) {
      case 'artist_order_step_request':
        tagText = '节点确认请求'; tagColor = '#1565C0'; tagBgColor = '#E3F2FD'; break;
      case 'artist_order_step_approve':
        tagText = '节点已确认'; break;
      case 'artist_order_step_reject':
        tagText = '节点已驳回'; break;
      case 'artist_order_change_price':
        tagText = '价格调整'; tagColor = '#EF6C00'; tagBgColor = '#FFF3E0'; break;
      case 'artist_order_change_item':
        tagText = '投递内容更新'; tagColor = '#EF6C00'; tagBgColor = '#FFF3E0'; break;
      case 'artist_order_submission_create':
        tagText = '投递创建'; tagColor = '#EF6C00'; tagBgColor = '#FFF3E0'; break;
      case 'artist_order_seller_confirm':
        tagText = '待付款'; tagColor = '#EF6C00'; tagBgColor = '#FFF3E0'; break;
      case 'artist_order_payment_submitted':
        tagText = '已付款'; tagColor = '#2E7D32'; tagBgColor = '#E8F5E9'; break;
      default:
        tagText = '系统通知';
    }
  }

  // 3. 价格兼容逻辑
  if (!priceDisplay) {
     const type = card.card_type || '';
     // 旧逻辑提取
     const amount = getSafeAmountLegacy(item);
     if (amount !== null && amount >= 0) {
       priceDisplay = '¥ ' + amount.toFixed(2);
       if (type === 'artist_order_change_price') priceLabel = '调整后价格';
       else if (type === 'artist_order_submission_create') priceLabel = '订单金额';
       else if (type === 'artist_order_change_item') priceLabel = '当前总价';
       else if (type === 'artist_order_seller_confirm') priceLabel = '待付金额';
       else if (type === 'artist_order_payment_submitted') priceLabel = '付款金额';
       else priceLabel = '涉及金额';
     }
  }

  return {
    tagText,
    tagStyle: { color: tagColor, backgroundColor: tagBgColor },
    title,
    desc,
    image,
    actionText,
    priceLabel,
    priceDisplay
  };
}

// 旧版金额提取器（仅用于兼容历史消息）
function getSafeAmountLegacy(m) {
  const p = m.payload || {};
  if (p.amount !== undefined && p.amount !== null) return Number(p.amount);
  const extra = p.card?.extra || {};
  if (extra.submission_item?.price_total !== undefined) return Number(extra.submission_item.price_total);
  if (extra.submission?.price_total !== undefined) return Number(extra.submission.price_total);
  return null;
}

/* ===================== [关键修复] 恢复老版本的健壮跳转逻辑 ===================== */

/** * 提取卡片跳转 URL - 健壮版
 * 修复了新版代码因为未判断对象类型/未判断 app_pages 复数形式而导致的跳转失败
 */
function pickCardAppPageUrl (card, uid) {
  if (!card) return ''
  
  // 1. 获取可能存在的各种字段 (兼容 app_page, appPage, app_pages 等)
  const ap = 
    card.app_page ?? 
    card.appPage ?? 
    card.app_pages ?? 
    card.appPages ?? 
    null

  // 2. 字符串直接返回
  if (typeof ap === 'string') return ap

  // 3. 数组查找 (uid 匹配)
  if (Array.isArray(ap)) {
    const myUid = Number(uid || 0)
    const hit = ap.find((x) => Number(x?.uid || 0) === myUid && typeof x?.url === 'string' && x.url)
    if (hit && hit.url) return hit.url

    const first = ap.find((x) => x && typeof x.url === 'string' && x.url)
    if (first && first.url) return first.url
  }

  // 4. [修复核心] 对象直接取 url (新版漏了这里)
  // 很多时候 app_page 是一个对象 { url: '...' } 而不是字符串
  if (ap && typeof ap === 'object' && typeof ap.url === 'string') {
    return ap.url
  }

  return ''
}

/** 安全跳转 helper (带错误处理) */
function goToCardUrl (url) {
  if (!url) return
  uni.navigateTo({
    url,
    fail: (err) => {
      // #ifdef H5
      try { window.location.href = url; return } catch (_) {}
      // #endif
      console.warn('[CHAT] navigateTo failed:', err, 'url=', url)
      uni.showToast({ title: '跳转失败', icon: 'none' })
    }
  })
}

function handleCardClick (m) {
  const card = m.card || m.payload?.card
  if (!card) return
  
  // 1. 尝试获取小程序/APP内页地址
  const url = pickCardAppPageUrl(card, selfUid.value)
  if (url) {
    goToCardUrl(url)
    return
  }
  
  // 2. 尝试 H5 外链 (复制或打开)
  if (card.h5_url) {
    uni.setClipboardData({ 
      data: card.h5_url, 
      success: () => uni.showToast({ title: '链接已复制', icon: 'none' }) 
    })
    return
  }
  
  uni.showToast({ title: card.action_text || '暂不支持的操作', icon: 'none' })
}
</script>

<style lang="less" scoped>
.chat-page {
  height: 100vh;
  background: #ffffff;
}

.nav-wrapper {
  position: relative;
  z-index: 1000;
}

.nav-back-pill {
  height: 56rpx;
  padding: 0 18rpx;
  border-radius: 33rpx;
  background: rgba(255, 255, 255, 0.85);
  border: 2rpx solid rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}
.nav-back-pill--offset {
  margin-left: 24rpx;
}

.nav-center {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.nav-title-ellipsis {
  max-width: 60vw;
  font-size: 30rpx;
  font-weight: 600;
  color: #000;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.nav-sub {
  font-size: 22rpx;
  color: #9aa0a6;
  margin-top: 4rpx;
}

.chat-body {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0 20rpx 20rpx;
  box-sizing: border-box;
  background: #f5f5f5;
}

.msg-item {
  display: flex;
  align-items: flex-start;
  gap: 24rpx;
  margin-bottom: 26rpx;
  &.self {
    flex-direction: row-reverse;
  }
}
.msg-item .avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: #eee;
}

.content {
  max-width: 78%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.msg-item.self .content {
  align-items: flex-end;
}

.bubble {
  position: relative;
  max-width: 100%;
  background: #fff;
  border-radius: 18rpx;
  padding: 16rpx 18rpx;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
  word-break: break-word;
}
.msg-item.self .bubble {
  background: #e0f0fb;
  border-top-right-radius: 8rpx;
  border-top-left-radius: 18rpx;
}

.bubble::after {
  content: '';
  position: absolute;
  width: 18rpx;
  height: 18rpx;
  border-radius: 5rpx;
  background: #fff;
  transform: rotate(45deg);
  left: -8rpx;
  top: 22rpx;
}
.msg-item.self .bubble::after {
  background: #e0f0fb;
  left: auto;
  right: -8rpx;
}

.bubble .emoji {
  font-size: 40rpx;
  line-height: 1.2;
}
.bubble .img-msg {
  max-width: 280rpx;
  max-height: 350rpx;
  border-radius: 12rpx;
  
  &.is-sticker {
      max-width:160rpx;
    }
}

.bubble .other-card {
  min-width: 300rpx;
  background: #f7fafc;
  border: 1rpx solid #e5e7eb;
  border-radius: 12rpx;
  padding: 12rpx;
  .title {
    font-weight: 600;
    color: #374151;
  }
  .desc {
    display: block;
    color: #6b7280;
    margin-top: 8rpx;
    font-size: 24rpx;
  }
}

.msg-card {
  min-width: 320rpx;
  max-width: 520rpx;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 16rpx 18rpx;
}
.msg-card-header {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}
.msg-card-tag {
  padding: 2rpx 10rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  margin-right: 10rpx;
  /* 默认兜底 */
  background: #E0F2F1;
  color: #00695C;
}
.msg-card-title {
  flex: 1;
  font-size: 26rpx;
  font-weight: 600;
  color: #111827;
}

.msg-card-price-box {
  margin: 16rpx 0;
  padding: 20rpx;
  background: #F9FAFB;
  border-radius: 12rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .price-label {
    font-size: 24rpx;
    color: #6B7280;
  }

  .price-val {
    color: #EF4444;
    font-weight: bold;
    display: flex;
    align-items: baseline;
    .amount {
      font-size: 36rpx;
    }
  }
}
.msg-card-image-wrap {
  margin-bottom: 12rpx;
  border-radius: 12rpx;
  overflow: hidden;
}
.msg-card-image {
  width: 100%;
  max-height: 320rpx;
  display: block;
}

.msg-card-body {
  margin-bottom: 12rpx;
}
.msg-card-desc {
  font-size: 24rpx;
  color: #6b7280;
  line-height: 1.5;
}
.msg-card-footer {
  display: flex;
  justify-content: flex-end;
}
.msg-card-action {
  font-size: 24rpx;
  color: #a2b7c0;
}

.meta {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 10rpx;
  color: #9aa0a6 !important;
  font-size: 20rpx;
  line-height: 1;
}
.meta .time,
.meta .status {
  opacity: 0.95;
  color: #9aa0a6 !important;
  font-size: 20rpx;
}

.chat-inputbar {
  position: relative;
  background: transparent;
  padding-top: 14rpx;
  padding-bottom: calc(14rpx + env(safe-area-inset-bottom));
  padding-bottom: calc(14rpx + constant(safe-area-inset-bottom));
}

.inputbar-wrap {
  position: relative;
  margin: 0 12rpx;
  padding: 12rpx 14rpx;
  display: flex;
  align-items: center;
  gap: 14rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.92);
  border: 1rpx solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 10rpx 26rpx rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
}

.inputbar-wrap .tools {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding-left: 6rpx;
  flex-shrink: 0;
}

.inputbar-wrap .text-input {
  flex: 1;
  height: 72rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 999rpx;
  padding: 0 24rpx;
  font-size: 26rpx;
  border: 1rpx solid rgba(0, 0, 0, 0.06);
  box-sizing: border-box;
}

.sticker-panel {
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(100% + 14rpx);
  background: #ffffff;
  border: 1rpx solid rgba(0, 0, 0, 0.06);
  border-radius: 24rpx;
  padding: 14rpx 0 8rpx;
  box-shadow: 0 18rpx 40rpx rgba(0, 0, 0, 0.10);
  z-index: 30;
  overflow: hidden;
}

.sticker-scroll {
  max-height: 520rpx;
  max-height: 56vh;
}

.sticker-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 0 20rpx;
  gap: 16rpx;
}

.sticker-item {
  width: 110rpx;
  height: 110rpx;
  border-radius: 14rpx;
  background: #f3f4f6;
  border: 1rpx solid rgba(0, 0, 0, 0.04);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sticker-thumb {
  width: 100%;
  height: 100%;
}

::-webkit-scrollbar {
  width: 0 !important;
  height: 0 !important;
  background: transparent !important;
  display: none !important;
}
</style>
