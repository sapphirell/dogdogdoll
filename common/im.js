// 极简未读策略：仅在 WS open/重连时拉一次未读；其余靠本地累积
// 导出：unreadTotal、refreshUnread、connectIM、disconnectIM、onceConnected、sendIM、onIMEvent、offIMEvent、getWS
// 以及：listSessions、closeIM、setActiveSession、clearActiveSession

import { ref } from 'vue'
import { websiteUrl } from '@/common/config.js'

let ws = null
let hbTimer = 0
let reconnectTimer = 0
let reconnectDelay = 2500
const listeners = new Set()

/** 角标未读数（响应式） */
export const unreadTotal = ref(0)

/** 当前激活的会话（进入 chat 页面时设置，离开时清除） */
const activeSessions = new Set()

/** 用于未读本地累加的去重：记住最近 N 条已处理的 message.id */
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

/** 从本地存储获取自己的 uid（需在登录时把 userInfo 或 uid 持久化） */
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

/* -------------------- WS URL & 心跳 & 重连 -------------------- */

function buildWSUrl() {
  const token = uni.getStorageSync('token') || ''
  let host = ''
  let port = ''
  let scheme = 'ws'

  try {
    host = location.hostname
    port = location.port || (location.protocol === 'https:' ? '443' : '80')
    scheme = location.protocol === 'https:' ? 'wss' : 'ws'
  } catch (_) {}

  const base = websiteUrl?.value || ''
  if (base) {
    try {
      const u = new URL(base)
      host = u.hostname
      port = u.port || (u.protocol === 'https:' ? '443' : '80')
      scheme = (u.protocol === 'https:') ? 'wss' : 'ws'
    } catch (_) {}
  }

  return `${scheme}://${host}:${port}/v1/websocket?token=${encodeURIComponent(token)}`
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

/* -------------------- 未读数：仅在连接/重连时同步 -------------------- */

/** 显式拉取未读（提供给会话列表下拉刷新等场景） */
let _ruInflight = null
export async function refreshUnread() {
  const token = uni.getStorageSync('token') || ''
  if (!token) { unreadTotal.value = 0; return 0 }
  if (_ruInflight) return _ruInflight

  _ruInflight = new Promise((resolve) => {
    uni.request({
      url: `${websiteUrl.value}/with-state/unread-message-count`,
      method: 'GET',
      header: { Authorization: token },
      timeout: 5000,
      success: (res) => {
        const data = res?.data?.data
        const n = Number(data?.count ?? data?.total ?? 0)
        unreadTotal.value = Number.isFinite(n) ? n : 0
        resolve(unreadTotal.value)
      },
      fail: () => resolve(unreadTotal.value),
      complete: () => { setTimeout(() => { _ruInflight = null }, 100) }
    })
  })
  return _ruInflight
}

/* -------------------- 连接管理 -------------------- */

export function connectIM(force = false) {
  if (!force && ws && (ws.readyState === 0 || ws.readyState === 1)) return ws
  const token = uni.getStorageSync('token') || ''
  if (!token) { log('no token, skip ws connect'); return null }

  const url = buildWSUrl()
  log('connecting...', url)
  ws = new WebSocket(url)
  try { if (typeof window !== 'undefined') window.__IM_WS__ = ws } catch(_) {}

  ws.onopen = async () => {
    log('open')
    startHeartbeat()
    // 仅在连接/重连成功时，拉一次服务端未读，作为“权威基线”
    await refreshUnread()
  }

  ws.onmessage = (evt) => {
    let payload = null
    try { payload = JSON.parse(evt.data) } catch { payload = evt.data }
    log('onmessage', payload)

    // 先分发给业务监听者（聊天页/列表等）
    listeners.forEach(fn => { try { fn(payload) } catch (e) { console.error('[IM] listener error', e) } })

    // —— 本地未读累加逻辑 —— //
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

      // 去重
      if (mid) {
        if (seenSet.has(mid)) return
        rememberSeen(mid)
      }

      // 仅对“别人给我”的消息计入未读；且当前会话未激活时才累加
      if (from && self && from !== self) {
        if (!isActiveSession(sess)) {
          unreadTotal.value = Math.max(0, Number(unreadTotal.value || 0) + 1)
        }
      }
    } catch (_) {}
  }

  ws.onclose = (evt) => { log('close', evt.code, evt.reason); stopHeartbeat(); scheduleReconnect() }
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

/** 别名，兼容旧代码 */
export function closeIM() { return disconnectIM() }

/** 等待 WS 就绪（页面初始化可用） */
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

/* -------------------- 事件订阅 -------------------- */

export function onIMEvent(cb) {
  if (typeof cb === 'function') listeners.add(cb)
  return () => { listeners.delete(cb) }
}
export function offIMEvent(cbOrUnsubscribe) {
  if (typeof cbOrUnsubscribe === 'function') {
    try { cbOrUnsubscribe() } catch (_) { listeners.delete(cbOrUnsubscribe) }
  }
}

/* -------------------- 发送统一入口 -------------------- */

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

/** 取原始 WS（低层能力） */
export function getWS() { return ws }

/* -------------------- 会话激活上报（用于未读累加的排除） -------------------- */

export function setActiveSession(sessionId) {
  if (sessionId === undefined || sessionId === null) return
  activeSessions.add(String(sessionId))
}
export function clearActiveSession(sessionId) {
  if (sessionId === undefined || sessionId === null) return
  activeSessions.delete(String(sessionId))
}

/* -------------------- 会话列表（message_list 依赖） -------------------- */

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
