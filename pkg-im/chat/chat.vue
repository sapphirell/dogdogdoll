<template>
  <view class="chat-page">
    <!-- 顶部固定 -->
    <view class="chat-header">
      <view class="left" @click="goBack">
        <uni-icons type="back" size="22" color="#333" />
      </view>
      <view class="center">
        <text class="peer-name">{{ peerInfo.user_name || '私信' }}</text>
        <text class="sub">{{ onlineText }}</text>
      </view>
      <view class="right"></view>
    </view>

    <!-- 中间滚动区 -->
    <scroll-view
      class="chat-body"
      :scroll-y="true"
      :scroll-with-animation="true"
      :scroll-into-view="scrollIntoId"
      :upper-threshold="100"
      @scrolltoupper="loadMore"
    >
      <view class="load-more" v-if="hasMore && !loadingMore" @click="loadMore">点击加载更多</view>
      <view class="load-more" v-if="loadingMore">加载中...</view>

      <view class="msg-list">
        <view
          v-for="(m, idx) in messages"
          :key="m.local_key || m.id || idx"
          class="msg-item"
          :class="{ self: m.from_uid === selfUid }"
          :id="'msg-' + (m.local_key || m.id || idx)"
        >
          <image class="avatar" :src="m.from_uid === selfUid ? selfInfo.avatar : peerInfo.avatar" />

          <!-- 包裹：气泡 + meta 垂直排列 -->
          <view class="content">
            <view class="bubble">
              <!-- 文本 -->
              <template v-if="m.kind === 'text'">
                <rich-text :nodes="safeText(m.text)"></rich-text>
              </template>

              <!-- 表情 -->
              <template v-else-if="m.kind === 'emoji'">
                <text class="emoji">{{ m.emoji }}</text>
              </template>

              <!-- 图片 -->
              <template v-else-if="m.kind === 'image'">
                <image class="img-msg" :src="m.url" mode="widthFix" @click="previewImage(m.url)" />
              </template>

              <!-- ===== 带 MessageCard 的 other 消息 ===== -->
              <template v-else-if="m.kind === 'other' && (m.card || (m.payload && m.payload.card))">
                <view class="msg-card" @click="handleCardClick(m)">
                  <view class="msg-card-header">
                    <text class="msg-card-tag">{{ cardTag(m) }}</text>
                    <text class="msg-card-title">{{ cardTitle(m) }}</text>
                  </view>

                  <!-- 新增：卡片封面图 -->
                  <view v-if="cardImage(m)" class="msg-card-image-wrap">
                    <image
                      class="msg-card-image"
                      :src="cardImage(m)"
                      mode="aspectFill"
                      @click.stop="previewImage(cardImage(m))"
                    />
                  </view>

                  <view class="msg-card-body" v-if="cardDescription(m)">
                    <text class="msg-card-desc">{{ cardDescription(m) }}</text>
                  </view>

                  <view class="msg-card-footer">
                    <text class="msg-card-action font-alimamashuhei">{{ cardActionText(m) }}</text>
                  </view>
                </view>
              </template>

              <!-- 兼容旧版 other：没有 card 的结构 -->
              <template v-else-if="m.kind === 'other'">
                <view class="other-card">
                  <text class="title">[{{ m.sub_type || '其它' }}]</text>
                  <text class="desc">{{ briefOther(m) }}</text>
                </view>
              </template>

              <!-- 兜底：未知类型 -->
              <template v-else>
                <view class="other-card">
                  <text class="title">[未知]</text>
                  <text class="desc">[暂不支持的消息类型]</text>
                </view>
              </template>
            </view>

            <!-- meta 挪到气泡下方 -->
            <view class="meta font-alimamashuhei">
              <text class="time">{{ fmtTime(m.ts) }}</text>
              <text class="status" v-if="m.from_uid === selfUid">{{ statusText(m) }}</text>
            </view>
          </view>
        </view>
      </view>

      <view :id="bottomAnchorId" class="bottom-anchor" />
    </scroll-view>

    <!-- 底部固定输入条 -->
    <view class="chat-inputbar" :class="{ 'with-emoji': showEmoji }">
      <view class="tools">
        <uni-icons type="image" size="24" color="#666" @click="pickAndSendImage" />
        <uni-icons type="smile" size="24" color="#666" @click="toggleEmoji" />
        <uni-icons type="paperplane" size="24" color="#666" @click="sendSampleOther" />
      </view>
      <input
        class="text-input"
        type="text"
        v-model.trim="draft"
        confirm-type="send"
        :disabled="isBlocked"
        @confirm="sendText"
        @focus="scrollToBottomSoon"
      />
      <!-- <button class="send-btn font-alimamashuhei" :disabled="!draft || isBlocked" @click="sendText">发送</button> -->

      <view class="emoji-panel" v-if="showEmoji">
        <view class="emoji-row">
          <text v-for="e in emojis" :key="e" class="emoji-item" @click="sendEmoji(e)">{{ e }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { onLoad, onUnload, onShow, onHide } from '@dcloudio/uni-app'
import { websiteUrl } from '@/common/config.js'
import { connectIM, onIMEvent, getWS, setActiveSession, clearActiveSession } from '@/common/im.js'

/** 路由与会话 */
const peerId = ref(0)
const sessionKey = ref('')
const numericSid = ref(0)

/** 基础信息（selfUid 用 ref） */
const selfUid = ref(0)
const selfInfo = ref({ id: 0, avatar: '' })
const peerInfo = ref({ user_name: '', avatar: '' })
const onlineText = ref('')

/** 列表与分页 */
const messages = ref([]) // 升序
const page = ref(1)
const pageSize = 20
const hasMore = ref(true)
const loadingMore = ref(false)
const bottomAnchorId = 'bottom-anchor'
const scrollIntoId = ref('')

/** 输入与工具 */
const draft = ref('')
const showEmoji = ref(false)
const emojis = ['😀','😁','😂','🤣','😊','😍','😘','😎','😡','👍','👏','🎉']

/** 屏蔽/已读 */
const isBlocked = ref(false)
const myReadPts = ref(0)     // 我读到的最大 pts（用于发 read_ack）
const peerReadPts = ref(0)   // 对方读到的最大 pts（用于展示“已读”）

/** 订阅取消 */
let offIM = null

/* ---------- 工具：初始化本端 uid ---------- */
function initSelfUidFromStorage() {
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

/* ---------- 工具：从 read 事件里识别“读者是谁” ---------- */
function pickReaderId(d) {
  return Number(
    d?.reader_id ??
    d?.reader ??
    d?.user_id ??
    d?.uid ??
    d?.from_uid ??
    0
  )
}

/* ---------- 工具：应用对方已读进度（幂等） ---------- */
function applyPeerReadPts(newPts) {
  const n = Number(newPts || 0)
  if (n <= 0 || n <= peerReadPts.value) return
  peerReadPts.value = n
}

/* ---------- 生命周期 ---------- */
onLoad((query) => {
  peerId.value = Number(query.peer_id || 0)
  initSelfUidFromStorage()
})

onShow(async () => {
  await Promise.all([fetchPeerInfo(), fetchSelfInfo()])

  connectIM()
  if (offIM) { offIM(); offIM = null }
  offIM = onIMEvent(handleIMEvent)

  // 1) 获取/建立会话（首屏拿到 numeric_id + 对方已读游标）
  const token = uni.getStorageSync('token')
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/im/start-session?peer_id=${encodeURIComponent(peerId.value)}`,
      method: 'POST',
      header: token ? { Authorization: token } : {}
    })
    if (res?.data?.status === 'success' && res.data?.data?.session_id) {
      const data = res.data.data
      sessionKey.value = String(data.session_id) // "dm-xxx-yyy"
      const nId = Number(data?.numeric_id || 0)
      if (nId > 0) numericSid.value = nId

      const peerPtsFromStart = Number(
        data?.peer_read_pts ?? data?.peerReadPts ?? data?.read_pts_peer ?? 0
      )
      if (peerPtsFromStart > 0) applyPeerReadPts(peerPtsFromStart)
    } else {
      console.warn('[CHAT] start-session failed', res?.data)
      return
    }
  } catch (e) {
    console.error('[CHAT] start-session error', e)
    return
  }

  // 2) 首屏加载 20 条
  page.value = 1
  messages.value = []
  hasMore.value = true
  await loadHistory()

  // 历史加载完成后，立刻通过 WS 发送 read_ack
  markReadToBottom()

  // 告知 IM：当前会话激活（未读角标排除）
  setActiveSession(numericSid.value > 0 ? numericSid.value : sessionKey.value)
})

onHide(() => { if (offIM) { offIM(); offIM = null } })
onUnload(() => {
  if (offIM) { offIM(); offIM = null }
  leaveActiveSession()
})

/** 本地封装：离开页面时取消激活 */
function leaveActiveSession() {
  const key = numericSid.value > 0 ? numericSid.value : sessionKey.value
  if (key) clearActiveSession(key)
}

/** HTTP 基础信息 */
async function fetchPeerInfo() {
  try {
    const res = await uni.request({ url: `${websiteUrl.value}/user-info?uid=${peerId.value}` })
    if (res?.data?.status === 'success') peerInfo.value = res.data.data || {}
  } catch (_) {}
}
async function fetchSelfInfo() {
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
  } catch (_) {}
}

/** 历史优先 WS sync；否则 HTTP */
async function loadHistory() {
  if (!hasMore.value || loadingMore.value) return
  loadingMore.value = true

  let keepAnchor = ''
  if (messages.value.length > 0) {
    const top = messages.value[0]
    keepAnchor = 'msg-' + (top.local_key || top.id || 0)
  }

  try {
    if (numericSid.value > 0) {
      const socket = getWS()
      if (socket && socket.readyState === 1) {
        let afterPTS = 0
        if (messages.value.length > 0) {
          afterPTS = Math.min(...messages.value.map(m => Number(m.pts || 0))) - 1
          if (afterPTS < 0) afterPTS = 0
        }
        const reqId = 'sync_' + Date.now()
        const pkt = {
          type: 'im.req',
          action: 'sync',
          req_id: reqId,
          data: { session_id: Number(numericSid.value), after_pts: Number(afterPTS), limit: pageSize }
        }
        const resp = await waitWsResponseOnce(socket, 'sync', reqId, 8000, () => {
          socket.send(JSON.stringify(pkt))
        })
        if (resp?.status === 'success') {
          const arr = (resp.data?.messages || []).map(wsToUiMessage)
          messages.value = [...arr, ...messages.value]
          hasMore.value = !!resp.data?.has_more
          page.value += 1

          const peerPtsFromSync = Number(
            resp?.data?.peer_read_pts ?? resp?.data?.peerReadPts ?? resp?.data?.read_pts_peer ?? 0
          )
          if (peerPtsFromSync > 0) applyPeerReadPts(peerPtsFromSync)

          await nextTick()
          if (page.value === 2) {
            scrollToBottomSoon()
          } else if (keepAnchor) {
            scrollIntoId.value = keepAnchor
            setTimeout(() => { scrollIntoId.value = '' }, 50)
          }
          return
        }
      }
    }

    // fallback：HTTP
    if (!sessionKey.value) return
    const token = uni.getStorageSync('token') || ''
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/im/history`,
      method: 'GET',
      data: { session_id: sessionKey.value, page: page.value, page_size: pageSize },
      header: token ? { Authorization: token } : {}
    })
    if (res?.data?.status === 'success') {
      const d = res.data.data || {}
      const list = (d.list || []).map(httpToUiMessage)
      messages.value = [...list, ...messages.value]
      const total = Number(d.total || 0)
      hasMore.value = total > 0 ? (messages.value.length < total) : list.length === pageSize
      page.value += 1

      const peerPtsFromHttp = Number(
        d?.peer_read_pts ?? d?.peerReadPts ?? d?.peer_read ?? d?.read_pts_peer ?? 0
      )
      if (peerPtsFromHttp > 0) applyPeerReadPts(peerPtsFromHttp)

      await nextTick()
      if (page.value === 2) {
        scrollToBottomSoon()
      } else if (keepAnchor) {
        scrollIntoId.value = keepAnchor
        setTimeout(() => { scrollIntoId.value = '' }, 50)
      }
    }
  } catch (e) {
    console.error('[CHAT] loadHistory error', e)
  } finally {
    loadingMore.value = false
  }
}
function loadMore() {
  if (hasMore.value && !loadingMore.value) loadHistory()
}

/** 发送：文本/表情/图片/其它 */
function sendText() {
  if (!draft.value) return
  const text = draft.value
  draft.value = ''
  sendPayload({ kind: 'text', text })
}
function sendEmoji(e) {
  showEmoji.value = false
  sendPayload({ kind: 'emoji', emoji: e })
}
function toggleEmoji() { showEmoji.value = !showEmoji.value }

async function pickAndSendImage() {
  try {
    const chooseRes = await uni.chooseImage({ count: 1, sizeType: ['compressed'] })
    const filePath = chooseRes.tempFilePaths[0]
    const tkRes = await uni.request({
      url: `${websiteUrl.value}/with-state/qiniu-token`,
      method: 'POST',
      header: authHeader()
    })
    if (tkRes?.data?.status !== 'success') {
      return uni.showToast({ title: '上传凭证失败', icon: 'none' })
    }
    const { upload_url, token, key, domain } = tkRes.data.data
    const upRes = await uni.uploadFile({
      url: upload_url,
      filePath,
      name: 'file',
      formData: { token, key }
    })
    const body = JSON.parse(upRes.data || '{}')
    const url = (domain ? domain.replace(/\/$/, '') + '/' : '') + (body.key || key)
    sendPayload({ kind: 'image', url })
  } catch (e) {}
}

/** 示例的 other 消息（老结构），保留 */
function sendSampleOther() {
  sendPayload({
    kind: 'other',
    sub_type: 'order',
    payload: { order_id: 'D1234567', price: 199.0, title: '示例订单' }
  })
}

/** 发送统一实现（ACK 用 splice 替换） */
function sendPayload(msgPart) {
  const socket = getWS()
  if (!socket || socket.readyState !== 1) {
    uni.showToast({ title: '连接未就绪', icon: 'none' })
    return
  }

  const client_mid = genClientMID()
  const local = buildLocalMsg({ ...msgPart, client_mid })
  messages.value.push(local)
  scrollToBottomSoon()

  const pkt = {
    type: 'im.req',
    action: 'send',
    req_id: client_mid,
    data: {
      peer_id: Number(peerId.value),
      client_msg_id: client_mid,
      content: toWsContent(msgPart)
    }
  }

  waitWsResponseOnce(socket, 'send', client_mid, 8000, () => {
    socket.send(JSON.stringify(pkt))
  })
    .then((resp) => {
      if (!resp || resp.status !== 'success') {
        setMessageStatusByLocalKey(local.local_key, 'failed')
        return
      }
      const d = resp.data || {}
      updateMessageByLocalKey(local.local_key, (old) => ({
        ...old,
        id: Number(d.message_id || old.id || 0),
        pts: Number(d.pts || old.pts || 0),
        ts: d.msg_time ? Math.floor(Number(d.msg_time) / 1000) : old.ts,
        status: 'sent'
      }))
      if (Number(d.session_id || 0) > 0 && numericSid.value === 0) {
        numericSid.value = Number(d.session_id)
      }
      const peerPtsFromAck = Number(
        d?.peer_read_pts ?? d?.peerReadPts ?? d?.read_pts_peer ?? 0
      )
      if (peerPtsFromAck > 0) applyPeerReadPts(peerPtsFromAck)
    })
    .catch(() => {
      setMessageStatusByLocalKey(local.local_key, 'failed')
    })
}

/** 工具：用 splice 替换某条消息 */
function updateMessageByLocalKey(localKey, updater) {
  const idx = messages.value.findIndex((x) => x.local_key === localKey)
  if (idx >= 0) {
    const next = typeof updater === 'function' ? updater(messages.value[idx]) : updater
    messages.value.splice(idx, 1, next)
  }
}
function setMessageStatusByLocalKey(localKey, status) {
  updateMessageByLocalKey(localKey, (old) => ({ ...old, status }))
}

/** 已读（拿到 numericSid 后再发） */
function markReadToBottom() {
  if (numericSid.value <= 0) return
  const maxPts = messages.value.reduce(
    (mx, m) => Math.max(mx, Number(m.pts || 0)),
    0
  )
  if (maxPts <= myReadPts.value) return
  myReadPts.value = maxPts

  const socket = getWS()
  if (!socket || socket.readyState !== 1) return

  const reqId = 'read_' + Date.now()
  const pkt = {
    type: 'im.req',
    action: 'read_ack',
    req_id: reqId,
    data: { session_id: Number(numericSid.value), read_pts: Number(myReadPts.value) }
  }
  socket.send(JSON.stringify(pkt))
}

/** 事件处理 */
function handleIMEvent(payload) {
  if (!payload || typeof payload !== 'object') return

  // 收到 message 事件
  if (payload.type === 'im.event' && payload.event === 'message') {
    const d = payload.data || {}
    if (Number(d.session_id || 0) > 0 && numericSid.value === 0) {
      numericSid.value = Number(d.session_id)
    }
    if (typeof d.session_id === 'string' && d.session_id !== sessionKey.value) return
    if (numericSid.value > 0 && Number(d.session_id || 0) !== Number(numericSid.value)) {
      return
    }

    const ui = wsToUiMessage(d.message || {})
    const isSelf = ui.from_uid === selfUid.value

    if (isSelf) {
      let idx =
        ui.pts > 0
          ? messages.value.findIndex(
              (x) =>
                x.from_uid === selfUid.value &&
                Number(x.pts || 0) === ui.pts
            )
          : -1
      if (idx < 0) {
        const sig = buildSig(ui)
        idx = messages.value.findIndex(
          (x) =>
            x.from_uid === selfUid.value &&
            x.status === 'sending' &&
            x.sig &&
            x.sig === sig &&
            Math.abs(Number(x.ts) - Number(ui.ts)) <= 5
        )
      }
      if (idx >= 0) {
        const old = messages.value[idx]
        const merged = {
          ...old,
          id: ui.id || old.id,
          pts: ui.pts || old.pts,
          ts: ui.ts || old.ts,
          status: 'sent'
        }
        messages.value.splice(idx, 1, merged)
        return
      }
    }

    messages.value.push(ui)
    scrollToBottomSoon()
    markReadToBottom()
    return
  }

  // read 事件：更新对方已读游标
  if (payload.type === 'im.event' && payload.event === 'read') {
    const d = payload.data || {}
    if (numericSid.value > 0 && Number(d.session_id || 0) !== Number(numericSid.value)) {
      return
    }

    const reader = pickReaderId(d)
    if (reader && reader === selfUid.value) return
    if (reader && Number(peerId.value || 0) > 0 && reader !== Number(peerId.value)) {
      return
    }

    const peerPts = Number(
      d?.read_pts ?? d?.peer_read_pts ?? d?.readPts ?? 0
    )
    if (peerPts > 0) applyPeerReadPts(peerPts)
  }
}

/** 等待一次 WS ACK */
function waitWsResponseOnce(socket, action, reqId, timeout = 8000, sender) {
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
    timer = setTimeout(() => {
      off()
      resolve(null)
    }, timeout)
    sender && sender()
  })
}

/** 转换与工具：发送内容 -> WS content */
function toWsContent(part) {
  if (part.kind === 'text') {
    return { type: 'text', text: part.text }
  }
  if (part.kind === 'emoji') {
    return { type: 'emoji', emoji: part.emoji }
  }
  if (part.kind === 'image') {
    return { type: 'image', images: [{ url: part.url }] }
  }
  if (part.kind === 'other') {
    // 这里对应后端 OtherPayload：biz + 其它字段
    return {
      type: 'other',
      other: {
        biz: part.sub_type || 'other',
        ...(part.payload || {})
      }
    }
  }
  return { type: 'text', text: '[未知类型]' }
}

/** 构建消息唯一签名，用于本地“发送中 -> 已发送”的合并 */
function buildSig(m) {
  const kind = m.kind || (m.content?.type) || ''
  if (kind === 'text') return `t|${(m.text || '').slice(0, 200)}`
  if (kind === 'emoji') return `e|${m.emoji || ''}`
  if (kind === 'image') return `i|${m.url || (m.images?.[0]?.url || '')}`
  if (kind === 'other') {
    const payload = m.payload || m.content?.other || {}
    return `o|${m.sub_type || payload.biz || 'other'}|${JSON.stringify(payload)}`
  }
  return `u|`
}

/** 本地临时消息（发送中） */
function buildLocalMsg(part) {
  const now = Date.now()
  const base = {
    local_key:
      'local-' + now + '-' + Math.random().toString(36).slice(2),
    id: 0,
    pts: 0,
    session_id: sessionKey.value || '',
    from_uid: selfUid.value,
    to_uid: Number(peerId.value),
    ts: Math.floor(now / 1000),
    status: 'sending',
    client_mid: part.client_mid
  }
  let ui
  if (part.kind === 'text') {
    ui = { ...base, kind: 'text', text: part.text }
  } else if (part.kind === 'emoji') {
    ui = { ...base, kind: 'emoji', emoji: part.emoji }
  } else if (part.kind === 'image') {
    ui = { ...base, kind: 'image', url: part.url }
  } else {
    const payload = part.payload || {}
    ui = {
      ...base,
      kind: 'other',
      sub_type: part.sub_type,
      payload,
      card: payload.card || null
    }
  }
  ui.sig = buildSig(ui)
  return ui
}

/** HTTP -> UI 消息结构（含 card） */
function httpToUiMessage(n) {
  const payload = n.payload || {}
  const ui = {
    id: Number(n.id || 0),
    pts: Number(n.pts || 0),
    session_id: sessionKey.value,
    from_uid: Number(n.from_uid || 0),
    to_uid: Number(n.to_uid || 0),
    kind: n.kind || 'text',
    text: n.text,
    emoji: n.emoji,
    url: n.url,
    sub_type: n.sub_type,
    payload,
    card: payload.card || null,
    ts: Number(n.ts || Math.floor(Date.now() / 1000)),
    status: 'sent',
    client_mid: n.client_mid
  }
  ui.sig = buildSig(ui)
  return ui
}

/** WS 消息 -> UI 消息结构（含 card） */
function wsToUiMessage(m) {
  const base = {
    id: Number(m.id || 0),
    pts: Number(m.pts || 0),
    session_id:
      numericSid.value > 0 ? Number(numericSid.value) : sessionKey.value,
    from_uid: Number(m.sender_id || 0),
    to_uid:
      Number(m.sender_id || 0) === selfUid.value
        ? Number(peerId.value)
        : selfUid.value,
    ts: Math.floor((m.msg_time || Date.now()) / 1000),
    status: 'sent',
    client_mid: m.client_msg_id
  }
  const c = m.content || {}
  let ui
  switch (c.type) {
    case 'text':
      ui = { ...base, kind: 'text', text: c.text }
      break
    case 'emoji':
      ui = { ...base, kind: 'emoji', emoji: c.emoji }
      break
    case 'image': {
      const url =
        Array.isArray(c.images) && c.images[0]?.url
          ? c.images[0].url
          : ''
      ui = { ...base, kind: 'image', url }
      break
    }
    case 'other': {
      const other = c.other || {}
      ui = {
        ...base,
        kind: 'other',
        sub_type: other.biz || 'other',
        payload: other,
        card: other.card || null
      }
      break
    }
    default:
      ui = { ...base, kind: 'text', text: '[未知类型]' }
  }
  ui.sig = buildSig(ui)
  return ui
}

/** 发送状态文案 */
function statusText(m) {
  if (!m || m.from_uid !== selfUid.value) return ''
  if (m.status === 'failed') return '发送失败'
  if (
    Number(m.pts || 0) > 0 &&
    Number(peerReadPts.value || 0) >= Number(m.pts)
  ) {
    return '已读'
  }
  if (m.status === 'sending') return '发送中…'
  return '已发送'
}

/** 时间格式：HH:mm */
function fmtTime(ts) {
  const d = new Date(Number(ts) * 1000)
  const hh = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${m}`
}

/** 旧版 other 消息的简要描述 + 卡片兜底描述 */
function briefOther(m) {
  try {
    const card = m.card || m.payload?.card
    if (card) {
      if (card.description) return card.description
      if (card.title) return card.title
      if (card.card_type) {
        return `[${mapCardTypeLabel(card.card_type)}]`
      }
      return '[卡片消息]'
    }

    if (m.sub_type === 'order') {
      return `订单：${m.payload?.title || ''} ￥${m.payload?.price ?? ''}`
    }
    if (m.sub_type === 'transfer') {
      return `转账：￥${m.payload?.amount ?? ''}`
    }
    if (m.sub_type === 'goods') {
      return `商品：${m.payload?.name || ''} ￥${m.payload?.price ?? ''}`
    }
  } catch (_) {}
  return '[点击查看]'
}

/** 文本安全显示 */
function safeText(t) {
  return (t || '').replace(/\n/g, '<br/>')
}
function previewImage(url) {
  uni.previewImage({ urls: [url] })
}
function scrollToBottomSoon() {
  nextTick(() => {
    scrollIntoId.value = bottomAnchorId
    setTimeout(() => {
      scrollIntoId.value = ''
    }, 50)
  })
}
function goBack() {
  uni.navigateBack()
}

/** 鉴权头 + client_msg_id 工具 */
function authHeader() {
  const token = uni.getStorageSync('token') || ''
  return token ? { Authorization: token } : {}
}
function genClientMID() {
  return (
    'm_' +
    Date.now().toString(36) +
    '_' +
    Math.random().toString(36).slice(2, 8)
  )
}

/* ===================== 消息卡片相关工具 ===================== */

/** card_type -> 显示标签 */
function mapCardTypeLabel(cardType) {
  switch (cardType) {
    case 'artist_order_step_request':
      return '节点确认请求'
    case 'artist_order_step_approve':
      return '节点已确认'
    case 'artist_order_step_reject':
      return '节点已驳回'
    case 'artist_order_change_price':
      return '价格调整'
    case 'artist_order_change_item':
      return '投递内容更新'
    default:
      return '系统通知'
  }
}

/** 取卡片对象 */
function pickCard(m) {
  return m?.card || m?.payload?.card || null
}

function cardTag(m) {
  const card = pickCard(m) || {}
  return mapCardTypeLabel(card.card_type || '')
}
function cardTitle(m) {
  const card = pickCard(m) || {}
  return card.title || '消息通知'
}
function cardDescription(m) {
  const card = pickCard(m) || {}
  return card.description || ''
}
/** 新增：取卡片图片 URL（兼容多种命名） */
function cardImage(m) {
  const card = pickCard(m) || {}
  const url = card.image_url || card.imageUrl || card.img_url || ''
  return typeof url === 'string' ? url : ''
}
function cardActionText(m) {
  const card = pickCard(m) || {}
  return card.action_text || '查看详情'
}

/** 点击消息卡片：优先走 app_page，其次 h5_url，最后 Toast 提示 */
function handleCardClick(m) {
  const card = pickCard(m)
  if (!card) return

  // 1. 优先 app_page：由后端给出完整前端路径时直接跳转
  if (card.app_page) {
    try {
      uni.navigateTo({ url: card.app_page })
      return
    } catch (e) {
      // 路径不存在等问题，继续走下方逻辑
    }
  }

  // 2. H5 链接：先复制到剪贴板，让用户自己在浏览器打开
  if (card.h5_url) {
    try {
      uni.setClipboardData({
        data: card.h5_url,
        success: () => {
          uni.showToast({
            title: '链接已复制，可在浏览器打开',
            icon: 'none'
          })
        }
      })
      return
    } catch (_) {}
  }

  // 3. 兜底提示
  uni.showToast({
    title: card.action_text || '暂不支持的卡片操作',
    icon: 'none'
  })
}
</script>

<style lang="less" scoped>
.chat-page {
  height: 100vh;
  background: #f5f7fa;
}

/* 顶部固定 */
.chat-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9;
  height: 88rpx;
  padding: 0 20rpx;
  display: flex;
  align-items: center;
  background: #fff;
  .left,
  .right {
    width: 80rpx;
    display: flex;
    align-items: center;
  }
  .center {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    .peer-name {
      font-size: 30rpx;
      color: #222;
      font-weight: 600;
    }
    .sub {
      font-size: 22rpx;
      color: #9aa0a6;
      margin-top: 6rpx;
    }
  }
}

/* 中间滚动区固定在 header 与输入条之间 */
.chat-body {
  position: fixed;
  left: 0;
  right: 0;
  top: 88rpx; /* header 高度 */
  bottom: 104rpx; /* 输入条高度 */
  padding: 20rpx;
  padding-bottom: 0;
  box-sizing: border-box;
  background: #fff;
}
.load-more {
  width: 100%;
  text-align: center;
  color: #6b7280;
  font-size: 24rpx;
  padding: 16rpx 0;
}

/* 列表与气泡布局 */
.msg-list {
  display: flex;
  flex-direction: column;
  gap: 26rpx;
}
.msg-item {
  display: flex;
  align-items: flex-start;
  gap: 24rpx;
  &.self {
    flex-direction: row-reverse;
  }
}
.msg-item .avatar {
  width: 68rpx;
  height: 68rpx;
  border-radius: 50%;
  background: #eee;
}

/* 垂直内容：气泡 + meta */
.content {
  max-width: 78%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.msg-item.self .content {
  align-items: flex-end;
}

/* 气泡 */
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
  background: #E0F0FB;
  border-top-right-radius: 8rpx;
  border-top-left-radius: 18rpx;
}

/* 气泡小三角 */
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
  background: #E0F0FB;
  left: auto;
  right: -8rpx;
}

/* 文本/图片/卡片细节 */
.bubble .emoji {
  font-size: 40rpx;
  line-height: 1.2;
}
.bubble .img-msg {
  max-width: 500rpx;
  border-radius: 12rpx;
}

/* 旧版其它消息块 */
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

/* ===== 消息卡片样式 ===== */
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
  color: #4a92af;
  background: #99f2ff;
  margin-right: 10rpx;
}
.msg-card-title {
  flex: 1;
  font-size: 26rpx;
  font-weight: 600;
  color: #111827;
}

/* 新增：卡片图片区域 */
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

/* 卡片描述 & 底部 */
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

/* meta 在气泡下方 + 灰色 + 小字号 */
.meta {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 10rpx;
  color: #9aa0a6 !important;
  font-size: 20rpx;
  line-height: 1;
}
.meta .time {
  opacity: 0.95;
  color: #9aa0a6 !important;
  font-size: 20rpx;
}
.meta .status {
  opacity: 0.95;
  color: #9aa0a6 !important;
  font-size: 20rpx;
}

/* 锚点 */
.bottom-anchor {
  height: 1rpx;
}

/* 底部输入条固定 */
.chat-inputbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  background: #e0f0fb;
  padding: 18rpx 16rpx 16rpx;
  display: grid;
  grid-template-columns: 120rpx 1fr 20rpx;
  gap: 22rpx;
  .tools {
    display: flex;
    align-items: center;
    gap: 18rpx;
    padding-left: 8rpx;
  }
  .text-input {
    height: 68rpx;
    background: #fff;
    border-radius: 34rpx;
    padding: 0 22rpx;
    font-size: 26rpx;
  }
  .send-btn {
    height: 68rpx;
    line-height: 68rpx;
    border-radius: 34rpx;
    background: #e1f0fb;
    color: #fff;
    font-size: 26rpx;
  }
  .send-btn::after {
	  border: none;
  }
}
.emoji-panel {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 104rpx;
  background: #fff;
  border-top: 1rpx solid #eee;
  padding: 12rpx;
  .emoji-row {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
  }
  .emoji-item {
    font-size: 40rpx;
  }
}
</style>
