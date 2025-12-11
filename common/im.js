// /common/im.js
import { ref, computed } from 'vue'
import { websiteUrl } from '@/common/config.js'

let ws = null
let hbTimer = 0
let reconnectTimer = 0
let reconnectDelay = 2500 // 初始重连间隔
let manualClose = false   // 区分“手动关闭”和“异常断线”
const listeners = new Set()

// 全局未读数
export const unreadTotal = ref(0)

// 全局 WS 状态（所有页面共享）
/**
 * wsStatus 取值：
 * - 'idle'         初始/未连接
 * - 'connecting'   首次连接中
 * - 'open'         已连接
 * - 'closing'      正在手动关闭
 * - 'closed'       已关闭（等待重连）
 * - 'reconnecting' 自动重连中
 * - 'error'        出错
 */
export const wsStatus = ref('idle')
export const wsReady = computed(() => wsStatus.value === 'open')

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
function parseBaseForWS () {
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
function buildWSUrl () {
  const token = uni.getStorageSync('token') || ''
  const { scheme, hostPort } = parseBaseForWS()
  return `${scheme}://${hostPort}/v1/websocket?token=${encodeURIComponent(token)}`
}

/**
 * 跨端创建 WebSocket：
 * - H5：使用原生 new WebSocket
 * - App / 小程序：使用 uni.connectSocket 包一层，模拟 WebSocket 接口
 */
function createWS (url) {
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
      success () {},
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

function startHeartbeat () {
  stopHeartbeat()
  hbTimer = setInterval(() => {
    try {
      if (ws && ws.readyState === 1) ws.send(JSON.stringify({ type: 'ping' }))
    } catch (_) {}
  }, 30000)
}
function stopHeartbeat () {
  if (hbTimer) {
    clearInterval(hbTimer)
    hbTimer = 0
  }
}

/**
 * 自动重连（带简单退避）
 */
function scheduleReconnect () {
  if (reconnectTimer) return

  // 如果是手动关闭，不再自动重连
  if (manualClose) return

  wsStatus.value = 'reconnecting'
  const delay = reconnectDelay
  reconnectDelay = Math.min(reconnectDelay * 1.5, 15000) // 逐步放大，最大 15 秒

  reconnectTimer = setTimeout(() => {
    reconnectTimer = 0
    connectIM(true)
  }, delay)
}

/** 修正：未读角标改用 IM 的专用接口 */
let _ruInflight = null
export async function refreshUnread () {
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

export function connectIM (force = false) {
  log('connectIM called, force =', force, ' wsStatus =', wsStatus.value, ' ws =', ws)

  // 已经在连/已连且不是强制重连，则直接复用
  if (!force && ws && (ws.readyState === 0 || ws.readyState === 1)) {
    log('connectIM: reuse existing ws, readyState =', ws.readyState)
    return ws
  }

  const token = uni.getStorageSync('token') || ''
  log('connectIM: current token =', token ? '[NON-EMPTY]' : '[EMPTY]')
  if (!token) {
    log('connectIM: no token, skip connect')
    wsStatus.value = 'idle'
    return null
  }

  const url = buildWSUrl()
  log('connectIM: connecting to', url)
  manualClose = false
  wsStatus.value = force ? 'reconnecting' : 'connecting'
  log('connectIM: wsStatus =>', wsStatus.value)

  const socket = createWS(url)
  if (!socket) {
    log('connectIM: createWS failed')
    wsStatus.value = 'error'
    scheduleReconnect()
    return null
  }
  ws = socket

  try { if (typeof window !== 'undefined') window.__IM_WS__ = ws } catch (_) {}

  ws.onopen = async () => {
    log('ws.onopen')
    wsStatus.value = 'open'
    log('wsStatus => open')
    reconnectDelay = 2500
    startHeartbeat()
    await refreshUnread()
  }

  ws.onmessage = (evt) => {
    let payload = null
    try {
      payload = JSON.parse(evt.data)
    } catch (_) {
      payload = evt.data
    }
    log('onmessage', payload)

    // 小工具：把消息广播给所有监听者（chat.vue 的 waitWsResponseOnce / handleIMEvent 就靠这个）
    const broadcast = (data) => {
      if (!listeners.size) return
      listeners.forEach((cb) => {
        try {
          cb(data)
        } catch (e) {
          console.error('[IM] listener error', e)
        }
      })
    }

    // 非对象（比如字符串 pong），直接原样丢给监听者
    if (!payload || typeof payload !== 'object') {
      broadcast(payload)
      return
    }

    // ===== 这里处理 im.event 的一些全局副作用（去重 + 未读），不动具体页面逻辑 =====
    if (payload.type === 'im.event') {
      const ev = payload.event
      const d  = payload.data || {}

      if (ev === 'message') {
        const msg    = d.message || {}
        const mid    = Number(msg.id ?? d.message_id ?? d.id ?? 0)
        const sessId = d.session_id ?? msg.session_id ?? d.sid
        const selfId = getSelfId()
        const toUid  = Number(
          msg.to_uid ??
          d.to_uid ??
          d.receiver_id ??
          d.recver_id ??
          0
        )

        // ===== 去重：同一条 message_id 只处理一次 =====
        if (mid) {
          if (seenSet.has(mid)) {
            log('onmessage: skip duplicate message id =', mid)
            // 这里直接 return，是为了避免重复触发全局副作用和页面事件
            return
          }
          rememberSeen(mid)
        }

        // ===== 未读数：别人给我发消息，且该会话当前不在激活集合里 => 刷新一次未读 =====
        if (selfId && toUid && selfId === toUid && !isActiveSession(sessId)) {
          // 用后端接口刷一遍，防止计数跑偏
          refreshUnread()
        }
      } else if (ev === 'unread' || ev === 'session_unread') {
        // 如果服务端推未读汇总事件，就直接覆盖即可
        const n = Number(payload?.data?.count ?? 0)
        if (Number.isFinite(n)) {
          unreadTotal.value = n
        }
      }
      // 其它 ev（如 read）不在这里做处理，只透传给监听者
    }

    // ===== 最关键：把 payload（包括 im.res 和 im.event）统一分发给所有监听者 =====
    broadcast(payload)
  }


  ws.onclose = (evt) => {
    console.log(evt)
    log('close', evt.code, evt.reason)
    stopHeartbeat()

    // 手动关闭：标记 closed，但不重连
    if (manualClose) {
      wsStatus.value = 'closed'
      manualClose = false
      return
    }

    wsStatus.value = 'closed'
    scheduleReconnect()
  }

  ws.onerror = (err) => {
    log('ws.onerror', err)
    wsStatus.value = 'error'
  }

  return ws
}


export function disconnectIM () {
  try { stopHeartbeat() } catch (_) {}
  try {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = 0
    }
  } catch (_) {}

  manualClose = true
  wsStatus.value = 'closing'
  try {
    if (ws) {
      const s = ws.readyState
      if (s === 0 || s === 1) ws.close(1000, 'client close')
    }
  } catch (_) {}
  ws = null
  wsStatus.value = 'closed'
}
export function closeIM () { return disconnectIM() }

export function onceConnected (timeout = 8000) {
  if (ws && ws.readyState === 1) return Promise.resolve(true)
  connectIM()
  return new Promise((resolve) => {
    let timer = setTimeout(() => resolve(false), Math.max(1000, timeout))
    const check = () => {
      if (ws && ws.readyState === 1) {
        clearTimeout(timer)
        resolve(true)
      } else {
        setTimeout(check, 100)
      }
    }
    check()
  })
}

export function onIMEvent (cb) {
  if (typeof cb === 'function') listeners.add(cb)
  return () => { listeners.delete(cb) }
}
export function offIMEvent (cbOrUnsubscribe) {
  if (typeof cbOrUnsubscribe === 'function') {
    try { cbOrUnsubscribe() } catch (_) { listeners.delete(cbOrUnsubscribe) }
  }
}

export function sendIM (data) {
  try {
    if (!ws || ws.readyState !== 1) {
      log('sendIM skipped: ws not ready')
      return false
    }
    const payload = (typeof data === 'string') ? data : JSON.stringify(data)
    ws.send(payload)
    return true
  } catch (e) {
    console.error('[IM] sendIM error', e)
    return false
  }
}
export function getWS () { return ws }

export function setActiveSession (sessionId) {
  if (sessionId === undefined || sessionId === null) return
  activeSessions.add(String(sessionId))
}
export function clearActiveSession (sessionId) {
  if (sessionId === undefined || sessionId === null) return
  activeSessions.delete(String(sessionId))
}

/** 会话列表 HTTP 封装保持不变 **/
export async function listSessions ({ page = 1, page_size = 20 } = {}) {
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
