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
  ws = new WebSocket(url)
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
