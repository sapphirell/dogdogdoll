// /common/im.js
import { ref } from 'vue'
import { websiteUrl } from '@/common/config.js'

let ws = null
let hbTimer = 0
let reconnectTimer = 0
let reconnectDelay = 2500
const listeners = new Set()

export const unreadTotal = ref(0)

const activeSessions = new Set()
const SEEN_MAX = 500
const seenMsgIds = []
const seenSet = new Set()

function rememberSeen(id) {
  if (!id) return
  if (seenSet.has(id)) return
  seenSet.add(id)
  seenMsgIds.push(id)
  if (seenMsgIds.length > SEEN_MAX) {
    const old = seenMsgIds.shift()
    seenSet.delete(old)
  }
}
function isActiveSession(sess) {
  if (sess === undefined || sess === null) return false
  return activeSessions.has(String(sess))
}
function getSelfId() {
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
function log(...args) { console.log('[IM]', ...args) }

/**
 * 安全解析 websiteUrl，生成 host:port + 协议
 * 只依赖 websiteUrl.value，兼容 App / 小程序 无 location / URL 的环境
 */
function parseBaseForWS() {
  let base = (websiteUrl && websiteUrl.value) ? String(websiteUrl.value).trim() : ''
  // 如果没配置就直接给一个兜底域名（你现在就是 api.fantuanpu.com）
  if (!base) {
    return { scheme: 'wss', hostPort: 'api.fantuanpu.com' }
  }

  // 如果没有协议，默认 https -> wss
  let scheme = 'wss'
  if (/^https:\/\//i.test(base)) {
    scheme = 'wss'
    base = base.replace(/^https:\/\//i, '')
  } else if (/^http:\/\//i.test(base)) {
    scheme = 'ws'
    base = base.replace(/^http:\/\//i, '')
  } else {
    // 没写协议，按 https 处理
    scheme = 'wss'
  }

  // 去掉后面的 path，只保留 host[:port]
  const slashIndex = base.indexOf('/')
  let hostPort = slashIndex >= 0 ? base.slice(0, slashIndex) : base
  hostPort = hostPort.replace(/\/+$/, '')

  if (!hostPort) hostPort = 'api.fantuanpu.com'
  return { scheme, hostPort }
}

/**
 * 构建 WebSocket URL（统一走 https -> wss）
 * 例如： websiteUrl = https://api.fantuanpu.com
 *       => wss://api.fantuanpu.com/v1/websocket?token=...
 */
function buildWSUrl() {
  const token = uni.getStorageSync('token') || ''
  const { scheme, hostPort } = parseBaseForWS()
  return `${scheme}://${hostPort}/v1/websocket?token=${encodeURIComponent(token)}`
}

/**
 * 跨端创建 WebSocket：
 * - H5：使用原生 new WebSocket
 * - App / 小程序：使用 uni.connectSocket 包一层，模拟 WebSocket 接口
 */
function createWS(url) {
  // 1️⃣ H5：有原生 WebSocket 就直接用
  if (typeof WebSocket === 'function') {
    try {
      return new WebSocket(url)
    } catch (e) {
      console.error('[IM] new WebSocket failed:', e)
    }
  }

  // 2️⃣ 非 H5（App、小程序）：走 uni.connectSocket
  if (typeof uni !== 'undefined' && typeof uni.connectSocket === 'function') {
    // 关键点：一定要传 success 回调，否则返回的是 Promise
    const socketTask = uni.connectSocket({
      url,
      success () {},      // 👈 这一行非常重要
      fail (err) {
        console.error('[IM] connectSocket fail', err)
      }
    })

    // 2.1 小程序端：SocketTask 风格（有 onOpen / onMessage / onClose / onError 方法）
    if (socketTask && typeof socketTask.onOpen === 'function') {
      const wrapper = {
        _task: socketTask,
        readyState: 0, // 0-连接中, 1-已打开, 2-关闭中, 3-已关闭

        send (data) {
          try {
            if (this.readyState !== 1) {
              console.warn('[IM] send skipped, ws not open')
              return
            }
            // 小程序的 send 需要 { data }
            this._task.send({ data })
          } catch (e) {
            console.error('[IM] send error', e)
          }
        },

        close (code = 1000, reason = 'client close') {
          try {
            this.readyState = 2
            this._task.close({ code, reason })
          } catch (e) {
            console.error('[IM] close error', e)
          }
        },

        // 供外部赋值的回调（connectIM 那边会写 ws.onopen / ws.onmessage 等）
        onopen: null,
        onmessage: null,
        onclose: null,
        onerror: null
      }

      socketTask.onOpen((res) => {
        wrapper.readyState = 1
        wrapper.onopen && wrapper.onopen(res)
      })
      socketTask.onMessage((res) => {
        wrapper.onmessage && wrapper.onmessage({ data: res.data })
      })
      socketTask.onClose((res) => {
        wrapper.readyState = 3
        wrapper.onclose && wrapper.onclose(res)
      })
      socketTask.onError((err) => {
        wrapper.onerror && wrapper.onerror(err)
      })

      return wrapper
    }

    // 2.2 App 端：多数情况下 connectSocket 返回的就是“类 WebSocket”对象
    // 没有 onOpen 方法，就当作标准 WebSocket 用，让外面直接 ws.onopen = ... 即可
    return socketTask
  }

  console.error('[IM] 当前环境不支持 WebSocket / uni.connectSocket')
  return null
}


function startHeartbeat() {
  stopHeartbeat()
  hbTimer = setInterval(() => {
    try {
      if (ws && ws.readyState === 1) ws.send(JSON.stringify({ type: 'ping' }))
    } catch (_) {}
  }, 30000)
}
function stopHeartbeat() { if (hbTimer) { clearInterval(hbTimer); hbTimer = 0 } }
function scheduleReconnect() {
  if (reconnectTimer) return
  reconnectTimer = setTimeout(() => {
    reconnectTimer = 0
    connectIM(true)
  }, reconnectDelay)
}

/** 修正：未读角标改用 IM 的专用接口 */
let _ruInflight = null
export async function refreshUnread() {
  const token = uni.getStorageSync('token') || ''
  if (!token) { unreadTotal.value = 0; return 0 }
  if (_ruInflight) return _ruInflight

  _ruInflight = new Promise((resolve) => {
    uni.request({
      url: `${websiteUrl.value}/with-state/im/unread-count`,
      method: 'GET',
      header: { Authorization: token },
      timeout: 5000,
      success: (res) => {
        const data = res?.data?.data
        const n = Number(data?.count ?? 0)
        unreadTotal.value = Number.isFinite(n) ? n : 0
        resolve(unreadTotal.value)
      },
      fail: () => resolve(unreadTotal.value),
      complete: () => { setTimeout(() => { _ruInflight = null }, 100) }
    })
  })
  return _ruInflight
}

export function connectIM(force = false) {
  if (!force && ws && (ws.readyState === 0 || ws.readyState === 1)) return ws
  const token = uni.getStorageSync('token') || ''
  if (!token) { log('no token, skip ws connect'); return null }

  const url = buildWSUrl()
  log('connecting...', url)

  const socket = createWS(url)
  if (!socket) {
    log('createWS failed')
    return null
  }
  ws = socket

  try { if (typeof window !== 'undefined') window.__IM_WS__ = ws } catch(_) {}

  ws.onopen = async () => {
    log('open')
    startHeartbeat()
    await refreshUnread()
  }

  ws.onmessage = (evt) => {
    let payload = null
    try { payload = JSON.parse(evt.data) } catch { payload = evt.data }
    log('onmessage', payload)

    listeners.forEach(fn => { try { fn(payload) } catch (e) { console.error('[IM] listener error', e) } })

    try {
      if (!payload || typeof payload !== 'object') return
      if ((payload.type || '').toLowerCase() !== 'im.event') return

      const evtName = (payload.event || '').toLowerCase()
      if (evtName !== 'message' && evtName !== 'notify') return

      const data = payload.data || {}
      const sess = (data.session_id !== undefined && data.session_id !== null) ? String(data.session_id) : ''
      const msg  = data.message || {}
      const mid  = Number(msg.id || 0)
      const from = Number(msg.sender_id || 0)
      const self = getSelfId()

      if (mid) {
        if (seenSet.has(mid)) return
        rememberSeen(mid)
      }

      if (from && self && from !== self) {
        if (!isActiveSession(sess)) {
          unreadTotal.value = Math.max(0, Number(unreadTotal.value || 0) + 1)
        }
      }
    } catch (_) {}
  }

  ws.onclose = (evt) => { 
    console.log(evt)
    log('close', evt.code, evt.reason)
    stopHeartbeat()
    scheduleReconnect()
  }
  ws.onerror = (err) => { log('error', err) }

  return ws
}

export function disconnectIM() {
  try { stopHeartbeat() } catch(_) {}
  try { if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = 0 } } catch(_) {}
  try {
    if (ws) {
      const s = ws.readyState
      if (s === 0 || s === 1) ws.close(1000, 'client close')
    }
  } catch(_) {}
  ws = null
}
export function closeIM() { return disconnectIM() }

export function onceConnected(timeout = 8000) {
  if (ws && ws.readyState === 1) return Promise.resolve(true)
  connectIM()
  return new Promise((resolve) => {
    let timer = setTimeout(() => resolve(false), Math.max(1000, timeout))
    const check = () => {
      if (ws && ws.readyState === 1) { clearTimeout(timer); resolve(true) }
      else { setTimeout(check, 100) }
    }
    check()
  })
}

export function onIMEvent(cb) {
  if (typeof cb === 'function') listeners.add(cb)
  return () => { listeners.delete(cb) }
}
export function offIMEvent(cbOrUnsubscribe) {
  if (typeof cbOrUnsubscribe === 'function') {
    try { cbOrUnsubscribe() } catch (_) { listeners.delete(cbOrUnsubscribe) }
  }
}

export function sendIM(data) {
  try {
    if (!ws || ws.readyState !== 1) { log('sendIM skipped: ws not ready'); return false }
    const payload = (typeof data === 'string') ? data : JSON.stringify(data)
    ws.send(payload)
    return true
  } catch (e) {
    console.error('[IM] sendIM error', e)
    return false
  }
}
export function getWS() { return ws }

export function setActiveSession(sessionId) {
  if (sessionId === undefined || sessionId === null) return
  activeSessions.add(String(sessionId))
}
export function clearActiveSession(sessionId) {
  if (sessionId === undefined || sessionId === null) return
  activeSessions.delete(String(sessionId))
}

/** 下面保持你原来的实现不变：listSessions 等等 **/

export async function listSessions({ page = 1, page_size = 20 } = {}) {
  const token = uni.getStorageSync('token') || ''
  if (!token) return { list: [], has_more: false }

  const url = `${websiteUrl.value}/with-state/im/session-list?page=${page}&page_size=${page_size}`

  return new Promise((resolve, reject) => {
    uni.request({
      url,
      method: 'GET',
      header: { Authorization: token },
      timeout: 8000,
      success: (res) => {
        const data  = res?.data?.data ?? {}
        const list  = Array.isArray(data.sessions) ? data.sessions : []
        const total = Number(data.total ?? 0)
        const pg    = Number(data.page ?? page)
        const ps    = Number(data.page_size ?? page_size)
        const has_more = pg * ps < total
        resolve({ list, has_more })
      },
      fail: (err) => reject(err)
    })
  })
}
