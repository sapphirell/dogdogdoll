<template>
  <view class="chat-page">
    <!-- 顶部：固定半透明导航条（不随滚动渐变） -->
    <view id="navWrapper" class="nav-wrapper">
      <zhouWei-navBar
        type="fixed"
        :backState="1000"
        :homeState="2000"
        bgColor="rgba(255,255,255,0.8)"
        fontColor="#000000"
        :shadow="false"
      >
        <!-- 左侧返回胶囊 -->
        <template #left>
          <view class="nav-back-pill nav-back-pill--offset" @click="goBack" aria-label="返回">
            <uni-icons type="left" size="22" color="#000" />
          </view>
        </template>

        <!-- 中间：会话名 + 在线状态 -->
        <template #default>
          <view class="nav-center">
            <text class="nav-title-ellipsis">{{ peerInfo.user_name || '私信' }}</text>
            <text class="nav-sub">{{ onlineText }}</text>
          </view>
        </template>
      </zhouWei-navBar>
    </view>

    <!-- 中间区域：使用 z-paging 聊天模式替代 scroll-view -->
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
      bottom-bg-color="#e0f0fb"
      :default-page-size="pageSize"
      :auto-show-system-loading="false"
      @query="onPagingQuery"
    >
      <!-- 单条消息渲染（必须加 scaleY(-1) 包一层，否则内容会倒置） -->
      <template #cell="{ item }">
        <view style="transform: scaleY(-1)">
          <view class="msg-item" :class="{ self: item.from_uid === selfUid }">
            <image
              class="avatar"
              :src="item.from_uid === selfUid ? selfInfo.avatar : peerInfo.avatar"
            />

            <!-- 包裹：气泡 + meta 垂直排列 -->
            <view class="content">
              <view class="bubble">
                <!-- 文本 -->
                <template v-if="item.kind === 'text'">
                  <rich-text :nodes="safeText(item.text)"></rich-text>
                </template>

                <!-- 兼容旧数据：emoji 文本表情（不再发送新的，只展示历史） -->
                <template v-else-if="item.kind === 'emoji'">
                  <text class="emoji">{{ item.emoji }}</text>
                </template>

                <!-- 图片（包括普通图片 + 贴纸） -->
                <template v-else-if="item.kind === 'image'">
                 <image
                   class="img-msg"
                   :class="{ 'is-sticker': isStickerUrl(item.url) }" 
                   :src="item.url"
                   mode="widthFix"
                   @click="previewImage(item.url)"
                 />
                </template>

                <!-- ===== 带 MessageCard 的 other 消息 ===== -->
                <template v-else-if="item.kind === 'other' && (item.card || (item.payload && item.payload.card))">
                  <view class="msg-card" @click="handleCardClick(item)">
                    <view class="msg-card-header">
                      <text class="msg-card-tag" :class="getCardTagClass(item)">{{ cardTag(item) }}</text>
                      <text class="msg-card-title">{{ cardTitle(item) }}</text>
                    </view>
                
                    <view v-if="hasAmount(item)" class="msg-card-price-box">
                      <text class="price-label">{{ getPriceLabel(item) }}</text>
                      <view class="price-val">
                        <text class="currency">¥</text>
                        <text class="amount font-alimamashuhei">{{ formatAmount(item) }}</text>
                      </view>
                    </view>
                
                    <view v-if="cardImage(item)" class="msg-card-image-wrap">
                      <image
                        class="msg-card-image"
                        :src="cardImage(item)"
                        mode="aspectFill"
                        @click.stop="previewImage(cardImage(item))"
                      />
                    </view>
                
                    <view class="msg-card-body" v-if="cardDescription(item)">
                      <text class="msg-card-desc">{{ cardDescription(item) }}</text>
                    </view>
                
                    <view class="msg-card-footer">
                      <text class="msg-card-action font-alimamashuhei">{{ cardActionText(item) }}</text>
                      <uni-icons type="right" size="12" color="#a2b7c0" />
                    </view>
                  </view>
                </template>

                <!-- 兼容旧版 other：没有 card 的结构 -->
                <template v-else-if="item.kind === 'other'">
                  <view class="other-card">
                    <text class="title">[{{ item.sub_type || '其它' }}]</text>
                    <text class="desc">{{ briefOther(item) }}</text>
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
                <text class="time">{{ fmtTime(item.ts) }}</text>
                <text class="status" v-if="item.from_uid === selfUid">{{ statusText(item) }}</text>
              </view>
            </view>
          </view>
        </view>
      </template>

      <!-- 底部聊天输入条：放在 z-paging 的 bottom 插槽里 -->
      <template #bottom>
        <view class="chat-inputbar" :class="{ 'with-sticker': showStickerPanel }">
          <view class="inputbar-wrap">
            <view class="tools">
              <!-- 发送图片：只允许单张 -->
              <uni-icons type="image" size="24" color="#666" @click="pickAndSendImage" />
              <!-- 现在的纸飞机按钮：打开贴纸面板 -->
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

            <!-- 贴纸面板：展示缩略图，发送时使用完整图片 -->
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

/** 当前组件实例（用于 selectorQuery.in） */
const _ins = getCurrentInstance()

/** z-paging 引用 */
const pagingRef = ref(null)

/** 路由与会话 */
const peerId = ref(0)
const sessionKey = ref('')
const numericSid = ref(0)

/** 基础信息（selfUid 用 ref） */
const selfUid = ref(0)
const selfInfo = ref({ id: 0, avatar: '' })
const peerInfo = ref({ user_name: '', avatar: '' })
const onlineText = ref('')

/** 列表与分页（z-paging v-model 绑定的就是 messages） */
const messages = ref([])
const pageSize = 20

/** 输入与工具 */
const draft = ref('')

/** 新：贴纸面板 & 贴纸数据 */
const showStickerPanel = ref(false)
const stickers = ref([])
const stickerLoading = ref(false)

/** 屏蔽/已读 */
const isBlocked = ref(false)
const myReadPts = ref(0)
const peerReadPts = ref(0)

/** 订阅取消 */
let offIM = null

/** 是否已经做过首屏初始化 */
const hasInitOnce = ref(false)

/** 顶部 / 底部安全区域计算 */
const windowTopPxRaw = ref(0)
const footerSafeRaw = ref(0)

/** 关键：实际测出来的 nav-bar bottom（px） */
const navBarBottomPxRaw = ref(0)

/** z-paging 的 top：优先用 navBarBottom；测不到则回退 windowTop */
const pagingTopPx = computed(() => {
  const n = Number(navBarBottomPxRaw.value || 0)
  if (n > 0) return toPx(n)
  return toPx(windowTopPxRaw.value || 0)
})

/** ====== 消息提示音 ====== */
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

/** 等待 WS 连接就绪 */
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

/** 工具：初始化本端 uid */
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

/** 工具：测量 nav-bar 实际高度（避免被遮挡） */
function measureNavBar () {
  return new Promise((resolve) => {
    // 为了兼容不同端：优先 in(this component)，失败就退化到全局 query
    const q1 = (() => {
      try {
        return uni.createSelectorQuery().in(_ins)
      } catch (_) {
        return null
      }
    })()

    const query = q1 || uni.createSelectorQuery()
    query
      .select('#navWrapper')
      .boundingClientRect((rect) => {
        const bottom = Number(rect?.bottom || 0)
        const height = Number(rect?.height || 0)
        // fixed 顶部一般 bottom=height，但少数端 bottom 取不到，兜底 height
        const v = bottom > 0 ? bottom : height
        if (v > 0) navBarBottomPxRaw.value = v
        resolve(v)
      })
      .exec()
  })
}
// [辅助] 智能获取金额数值 (核心修复)
function getSafeAmount(m) {
  const p = m.payload || {};
  
  // 1. 第一优先级：优先读 payload.amount (后端直传字段)
  if (p.amount !== undefined && p.amount !== null) {
    return Number(p.amount);
  }
  
  // 2. 第二优先级：从 extra 中深挖 (适配 JSON 数据结构)
  // 你的 JSON 示例显示数据在: extra.submission_item.price_total
  const extra = p.card?.extra || {};
  
  if (extra.submission_item && extra.submission_item.price_total !== undefined) {
    return Number(extra.submission_item.price_total);
  }
  
  // 如果未来有 submission.price_total 这种结构，也可以加在这里
  if (extra.submission && extra.submission.price_total !== undefined) {
    return Number(extra.submission.price_total);
  }

  return null; // 没找到金额
}
// 判断是否显示金额框
function hasAmount(m) {
  const p = m.payload || {};
  const cardType = p.card?.card_type || '';
  
  // 1. 扩充允许显示的卡片类型
  const allowedTypes = [
    'artist_order_change_price',       // 改价
    'artist_order_submission_create',  // 创建订单
    'artist_order_buyer_confirm',      // 确认订单
    'artist_order_change_item'         // [新增] 投递内容变更 (对应消息ID 293)
  ];
  
  if (!allowedTypes.includes(cardType)) return false;
  
  // 2. 检查能不能取到有效数值
  const val = getSafeAmount(m);
  return val !== null && val >= 0;
}

//获取金额显示的标签文案
function getPriceLabel(m) {
  const type = m.payload?.card?.card_type || '';
  if (type === 'artist_order_change_price') return '调整后价格';
  if (type === 'artist_order_submission_create') return '订单金额';
  if (type === 'artist_order_change_item') return '当前总价'; // [新增]
  return '涉及金额';
}

// 格式化金额
function formatAmount(m) {
  const val = Number(m.payload?.amount || 0);
  return val.toFixed(2); // 保留两位小数
}
// [优化] 根据卡片类型返回不同的 Tag 样式类（可选）
function getCardTagClass(m) {
  const type = m.payload?.card?.card_type || '';
  // 涉及金额变动或订单状态流转的，用醒目的橙色
  if (['artist_order_change_price', 'artist_order_change_item', 'artist_order_submission_create'].includes(type)) {
    return 'tag-orange';
  }
  if (type === 'artist_order_step_request') return 'tag-blue';
  return 'tag-default';
}

/** 刷新布局参数（首屏 & 返回页面都做一次） */
async function refreshLayoutOffsets () {
  windowTopPxRaw.value = getWindowTop()
  footerSafeRaw.value = getFooterPlaceholderHeight()
  await nextTick()
  await measureNavBar()
}

/* ---------- 工具：从 read 事件里识别“读者是谁” ---------- */
function pickReaderId (d) {
  return Number(
    d?.reader_id ??
    d?.reader ??
    d?.user_id ??
    d?.uid ??
    d?.from_uid ??
    0
  )
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
  console.log('[CHAT-DBG]', 'layout:', {
    windowTopPxRaw: windowTopPxRaw.value,
    navBarBottomPxRaw: navBarBottomPxRaw.value
  })
})

onShow(async () => {
  console.log('[CHAT-DBG]', 'onShow: enter, hasInitOnce =', hasInitOnce.value)

  // 每次进来都刷新一次，避免机型/旋转/安全区变化导致遮挡
  await refreshLayoutOffsets()

  if (!hasInitOnce.value) {
    await Promise.all([fetchPeerInfo(), fetchSelfInfo()])

    connectIM()
    if (offIM) { offIM = null }
    offIM = onIMEvent(handleIMEvent)

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

        const peerPtsFromStart = Number(
          data?.peer_read_pts ?? data?.peerReadPts ?? data?.read_pts_peer ?? 0
        )
        if (peerPtsFromStart > 0) applyPeerReadPts(peerPtsFromStart)
      } else {
        console.warn('[CHAT] start-session failed', res?.data)
        uni.showToast({ title: '会话初始化失败，请稍后重试', icon: 'none' })
        return
      }
    } catch (e) {
      console.error('[CHAT] start-session error', e)
      uni.showToast({ title: '会话初始化异常', icon: 'none' })
      return
    }

    messages.value = []
    hasInitOnce.value = true

    const key = numericSid.value > 0 ? numericSid.value : sessionKey.value
    if (key) setActiveSession(key)

    nextTick(() => {
      console.log('[CHAT-DBG]', 'call paging.reload()')
      if (pagingRef.value && typeof pagingRef.value.reload === 'function') {
        pagingRef.value.reload()
      }
    })
    return
  }

  connectIM()
  if (offIM) { offIM = null }
  offIM = onIMEvent(handleIMEvent)
  const key = numericSid.value > 0 ? numericSid.value : sessionKey.value
  if (key) setActiveSession(key)

  markReadToBottom()
})

onHide(() => {
  if (offIM) {
    offIM()
    offIM = null
  }
})

onUnload(() => {
  if (offIM) {
    offIM()
    offIM = null
  }
  if (clickAudio) {
    try { clickAudio.destroy() } catch (e) {}
    clickAudio = null
  }
  leaveActiveSession()
})

function leaveActiveSession () {
  const key = numericSid.value > 0 ? numericSid.value : sessionKey.value
  if (key) clearActiveSession(key)
}

/** HTTP 基础信息 */
async function fetchPeerInfo () {
  const t0 = Date.now()
  try {
    const res = await uni.request({ url: `${websiteUrl.value}/user-info?uid=${peerId.value}` })
    if (res?.data?.status === 'success') peerInfo.value = res.data.data || {}
    console.log('[CHAT-DBG]', 'fetchPeerInfo: cost=', Date.now() - t0, 'ms, status=success')
  } catch (e) {
    console.warn('[CHAT-DBG]', 'fetchPeerInfo error=', e)
  }
}
async function fetchSelfInfo () {
  const t0 = Date.now()
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
    console.log('[CHAT-DBG]', 'fetchSelfInfo: cost=', Date.now() - t0, 'ms, status=success')
  } catch (e) {
    console.warn('[CHAT-DBG]', 'fetchSelfInfo error=', e)
  }
}

/** z-paging 的查询回调：首屏 + 上拉加载历史统一走这里 */
async function onPagingQuery (pageNo, sizeFromPaging) {
  console.log('[CHAT-DBG]', 'onPagingQuery pageNo=', pageNo, ' pageSize=', sizeFromPaging)

  const isFirstPage = pageNo === 1 && messages.value.length === 0

  try {
    if (numericSid.value <= 0) {
      console.warn('[CHAT] numericSid missing, cannot sync history via WS')
      if (pagingRef.value && typeof pagingRef.value.complete === 'function') {
        pagingRef.value.complete(false)
      }
      return
    }

    let socket = getWS()
    if (!socket || socket.readyState !== 1) {
      if (isFirstPage) {
        socket = await waitWsReady(5000)
        if (!socket || socket.readyState !== 1) {
          console.warn('[CHAT] waitWsReady timeout (z-paging first page)')
          uni.showToast({ title: '连接超时，请稍后重试', icon: 'none' })
          if (pagingRef.value && typeof pagingRef.value.complete === 'function') {
            pagingRef.value.complete(false)
          }
          return
        }
      } else {
        console.warn('[CHAT] WS not ready when loading more history')
        if (pagingRef.value && typeof pagingRef.value.complete === 'function') {
          pagingRef.value.complete(false)
        }
        return
      }
    }

    let beforePTS = 0
    let afterPTS = 0
    if (messages.value.length === 0) {
      afterPTS = 0
    } else {
      beforePTS = Math.min(...messages.value.map((m) => Number(m.pts || 0)))
    }

    const reqId = 'sync_' + Date.now()
    const data = {
      session_id: Number(numericSid.value),
      limit: sizeFromPaging || pageSize
    }
    if (beforePTS > 0) {
      data.before_pts = Number(beforePTS)
    } else {
      data.after_pts = Number(afterPTS)
    }

    const pkt = {
      type: 'im.req',
      action: 'sync',
      req_id: reqId,
      data
    }

    const resp = await waitWsResponseOnce(socket, 'sync', reqId, 8000, () => {
      socket.send(JSON.stringify(pkt))
    })
    if (!resp || resp.status !== 'success') {
      console.warn('[CHAT] sync history failed', resp)
      if (isFirstPage) {
        uni.showToast({ title: '加载聊天记录失败', icon: 'none' })
      }
      if (pagingRef.value && typeof pagingRef.value.complete === 'function') {
        pagingRef.value.complete(false)
      }
      return
    }

    const rawArr = (resp.data?.messages || []).map(wsToUiMessage)

    const existIds = new Set(messages.value.map((m) => m.id))
    const dedupArr = rawArr.filter((m) => !existIds.has(m.id))

    const segmentDesc = dedupArr.sort((a, b) => {
      const pa = Number(a.pts || 0)
      const pb = Number(b.pts || 0)
      if (pb !== pa) return pb - pa
      return Number(b.id || 0) - Number(a.id || 0)
    })

    if (pagingRef.value && typeof pagingRef.value.complete === 'function') {
      pagingRef.value.complete(segmentDesc)
    } else {
      if (messages.value.length === 0 || beforePTS === 0) {
        messages.value = [...messages.value, ...segmentDesc]
      } else {
        messages.value = [...segmentDesc, ...messages.value]
      }
    }

    const peerPtsFromSync = Number(
      resp?.data?.peer_read_pts ??
      resp?.data?.peerReadPts ??
      resp?.data?.read_pts_peer ??
      0
    )
    if (peerPtsFromSync > 0) applyPeerReadPts(peerPtsFromSync)

    await nextTick()
    if (isFirstPage) {
      scrollToBottomSoon()
      markReadToBottom()
    }
  } catch (e) {
    console.error('[CHAT] loadHistory error', e)
    if (pagingRef.value && typeof pagingRef.value.complete === 'function') {
      pagingRef.value.complete(false)
    }
  }
}

/** 发送：文本/图片/其它（贴纸也是 image） */
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
      data: {
        category: '',
        page: 1,
        pageSize: 200
      }
    })
    const data = res?.data || {}
    if (data.status === 'success' || data.code === 0) {
      const list = data.data || data.list || []
      stickers.value = Array.isArray(list) ? list : []
    } else {
      uni.showToast({ title: '加载表情失败', icon: 'none' })
    }
  } catch (e) {
    console.warn('[CHAT-DBG]', 'loadStickers error=', e)
    uni.showToast({ title: '加载表情失败', icon: 'none' })
  } finally {
    stickerLoading.value = false
  }
}

function toggleStickerPanel () {
  showStickerPanel.value = !showStickerPanel.value
  if (showStickerPanel.value) {
    loadStickers()
  }
}

function sendSticker (s) {
  if (!s || !s.image_url) return
  showStickerPanel.value = false
  sendPayload({
    kind: 'image',
    url: s.image_url
  })
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
      uni.showToast({ title: '上传凭证失败', icon: 'none' })
      return
    }

    const data = tkRes.data.data || {}
    const token = data.token
    const key = data.key || data.path
    const uploadUrl = data.upload_url || 'https://up-cn-east-2.qiniup.com'
    const domain = data.domain || image1Url

    if (!token || !key) {
      uni.showToast({ title: '上传参数错误', icon: 'none' })
      return
    }

    const upRes = await uni.uploadFile({
      url: uploadUrl,
      filePath,
      name: 'file',
      formData: {
        token,
        key
      }
    })

    let body = {}
    try {
      body = JSON.parse(upRes.data || '{}')
    } catch (_) {}

    const finalKey = body.key || key
    const prefix = domain ? String(domain).replace(/\/$/, '') + '/' : ''
    const url = prefix + finalKey

    if (!url) {
      uni.showToast({ title: '上传失败', icon: 'none' })
      return
    }

    sendPayload({ kind: 'image', url })
  } catch (e) {
    console.warn('[CHAT-DBG]', 'pickAndSendImage error=', e)
    uni.showToast({ title: '发送图片失败', icon: 'none' })
  }
}

/** 将一条“新消息”（本地 or 实时推送）追加到底部 */
function appendNewMessage (uiMsg) {
  if (pagingRef.value && typeof pagingRef.value.addChatRecordData === 'function') {
    pagingRef.value.addChatRecordData([uiMsg])
  } else {
    messages.value = [...messages.value, uiMsg]
  }
  playClickSound()
}

/** 发送统一实现 —— ACK 通过 local_key 更新数组，并强制替换 messages 引用 */
function sendPayload (msgPart) {
  const socket = getWS()
  if (!socket || socket.readyState !== 1) {
    uni.showToast({ title: '连接未就绪', icon: 'none' })
    return
  }

  const client_mid = genClientMID()
  const local = buildLocalMsg({ ...msgPart, client_mid })

  appendNewMessage(local)
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

/** 已读（拿到 numericSid 后再发） */
function markReadToBottom () {
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

function isStickerUrl(url) {
  if (!url) return false;
  // 示例：如果你的贴纸 URL 里包含 'stickers' 关键字，或者特定的域名
  // 你也可以在发送贴纸时，在消息体里加一个 extra: { is_sticker: true } 字段来判断，那样更准确
  return url.includes('box/admin'); 
}

/** 事件处理 */
function handleIMEvent (payload) {
  if (!payload || typeof payload !== 'object') return

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
        const list = messages.value
        const old = list[idx]
        const merged = {
          ...old,
          id: ui.id || old.id,
          pts: ui.pts || old.pts,
          ts: ui.ts || old.ts,
          status: 'sent'
        }
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
    timer = setTimeout(() => {
      off()
      resolve(null)
    }, timeout)
    sender && sender()
  })
}

/** 发送内容 -> WS content */
function toWsContent (part) {
  if (part.kind === 'text') {
    return { type: 'text', text: part.text }
  }
  if (part.kind === 'image') {
    return { type: 'image', images: [{ url: part.url }] }
  }
  if (part.kind === 'other') {
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

function wsToUiMessage (m) {
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
      const img = Array.isArray(c.images) && c.images[0] ? c.images[0] : {}
      const url = img.url || ''
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
  const hh = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${m}`
}

function briefOther (m) {
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
  } catch (_) {}
  return '[点击查看]'
}

function safeText (t) {
  return (t || '').replace(/\n/g, '<br/>')
}
function previewImage (url) {
  uni.previewImage({ urls: [url] })
}
function scrollToBottomSoon () {
  nextTick(() => {
    if (pagingRef.value && typeof pagingRef.value.scrollToBottom === 'function') {
      pagingRef.value.scrollToBottom()
    }
  })
}
function goBack () {
  uni.navigateBack()
}

function authHeader () {
  const token = uni.getStorageSync('token') || ''
  return token ? { Authorization: token } : {}
}
function genClientMID () {
  return (
    'm_' +
    Date.now().toString(36) +
    '_' +
    Math.random().toString(36).slice(2, 8)
  )
}

/* ===================== 消息卡片相关工具 ===================== */
function mapCardTypeLabel (cardType) {
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
    case 'artist_order_submission_create':
      return '投递创建'
    default:
      return '系统通知'
  }
}
function pickCard (m) {
  return m?.card || m?.payload?.card || null
}
function cardTag (m) {
  const card = pickCard(m) || {}
  return mapCardTypeLabel(card.card_type || '')
}
function cardTitle (m) {
  const card = pickCard(m) || {}
  return card.title || '消息通知'
}
function cardDescription (m) {
  const card = pickCard(m) || {}
  return card.description || ''
}
function cardImage (m) {
  const card = pickCard(m) || {}
  const url = card.image_url || card.imageUrl || card.img_url || ''
  return typeof url === 'string' ? url : ''
}
function cardActionText (m) {
  const card = pickCard(m) || {}
  return card.action_text || '查看详情'
}

/** 从 card.app_page 中按当前 uid 选出正确跳转 URL（兼容旧 string） */
function pickCardAppPageUrl (card, uid) {
  if (!card) return ''

  const ap =
    card.app_page ??
    card.appPage ??
    card.app_pages ??
    card.appPages ??
    null

  if (typeof ap === 'string') return ap

  if (Array.isArray(ap)) {
    const myUid = Number(uid || 0)
    const hit = ap.find((x) => Number(x?.uid || 0) === myUid && typeof x?.url === 'string' && x.url)
    if (hit && hit.url) return hit.url

    const first = ap.find((x) => x && typeof x.url === 'string' && x.url)
    if (first && first.url) return first.url
  }

  if (ap && typeof ap === 'object' && typeof ap.url === 'string') {
    return ap.url
  }

  return ''
}

/** 跳转 */
function goToCardUrl (url) {
  if (!url) return

  uni.navigateTo({
    url,
    fail: (err) => {
      // #ifdef H5
      try {
        window.location.href = url
        return
      } catch (_) {}
      // #endif

      console.warn('[CHAT] navigateTo failed:', err, 'url=', url)
      uni.showToast({ title: '跳转失败', icon: 'none' })
    }
  })
}

/** 点击消息卡片 */
function handleCardClick (m) {
  const card = pickCard(m)
  if (!card) return

  const url = pickCardAppPageUrl(card, selfUid.value)
  if (url) {
    goToCardUrl(url)
    return
  }

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

  uni.showToast({
    title: card.action_text || '暂不支持的卡片操作',
    icon: 'none'
  })
}
</script>

<style lang="less" scoped>
.chat-page {
  height: 100vh;
  background: #ffffff;
}

/* nav 外层只是用于测量，不改变 zhouWei-navBar 的 fixed 行为 */
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
  padding: 20rpx;
  padding-bottom: 0;
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
/* 原来是 500rpx，改为 280rpx 左右会让表情看起来更精致 */
  max-width: 280rpx; 
  /* 可选：如果你希望图片不要太长，也可以限制最大高度 */
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
  color: #4a92af;
  background: #99f2ff;
  margin-right: 10rpx;
  &.tag-orange { background: #FFF3E0; color: #EF6C00; }
    &.tag-blue { background: #E3F2FD; color: #1565C0; }
    &.tag-default { background: #E0F2F1; color: #00695C; }
}
.msg-card-title {
  flex: 1;
  font-size: 26rpx;
  font-weight: 600;
  color: #111827;
}
/* [新增] 价格区域样式 */
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
    color: #EF4444; /* 价格用红色 */
    font-weight: bold;
    display: flex;
    align-items: baseline;

    .currency {
      font-size: 24rpx;
      margin-right: 2rpx;
    }
    .amount {
      font-size: 36rpx;
      font-family: DIN, -apple-system, Helvetica, sans-serif; /* 推荐用数字字体 */
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

/* ====== 输入条与贴纸面板（仅样式调整，JS 不变） ====== */
.chat-inputbar {
  position: relative;
  background: transparent;
  padding-top: 14rpx;
  padding-bottom: calc(14rpx + env(safe-area-inset-bottom));
  padding-bottom: calc(14rpx + constant(safe-area-inset-bottom));
}

/* 输入条主体：圆角浮层 */
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

/* 贴纸面板：锚定在输入条上方，避免与输入框重叠 */
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
