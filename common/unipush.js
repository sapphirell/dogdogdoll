const CID_CACHE_KEY = 'unipush_cid'
const PUSH_CHANNEL = 'unipush2'
const CID_REFRESH_DELAY = 2800
const CLICK_DEDUP_WINDOW = 1600

const TAB_BAR_ROUTES = new Set([
  '/pages/index/index',
  '/pages/collocation_square/collocation_square',
  '/pages/summary/summary',
  '/pages/stock/stock',
  '/pages/mine/mine'
])

let pushInited = false
let pushMessageBound = false
let plusFallbackBound = false
let cidInFlight = null
let cidRefreshTimer = null
let lastClickKey = ''
let lastClickAt = 0

// 支持的通知点击字段（后端 payload 中任选其一）：
// 1) message_id / messageId / id -> 进入消息详情页
// 2) path / page_path / route / page / target_path -> App 内路由
// 3) url / target_url / jump_url / navigate_to -> 内链或外链

function asText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function tryParseJSON(raw) {
  if (typeof raw !== 'string') return raw
  const text = raw.trim()
  if (!text) return raw
  if (!(text.startsWith('{') || text.startsWith('['))) return raw
  try {
    return JSON.parse(text)
  } catch (e) {
    return raw
  }
}

function normalizePayload(rawData) {
  let payload = rawData
  if (payload && typeof payload === 'object' && 'payload' in payload) {
    payload = payload.payload
  }
  payload = tryParseJSON(payload)

  if (!payload || typeof payload !== 'object') {
    return {}
  }

  if ('payload' in payload) {
    const nested = tryParseJSON(payload.payload)
    if (nested && typeof nested === 'object') {
      payload = { ...payload, ...nested }
    }
  }
  return payload
}

function normalizeRoutePath(input) {
  let route = asText(input)
  if (!route) return ''

  const hashIndex = route.indexOf('#/')
  if (hashIndex >= 0) {
    route = route.slice(hashIndex + 2)
  }

  if (/^https?:\/\//i.test(route)) return ''

  route = route.replace(/^\/+/, '')
  if (!route) return ''

  const isAppRoute = route.startsWith('pages/') || route.startsWith('pkg-')
  if (!isAppRoute) return ''

  return `/${route}`
}

function normalizeOpenType(value) {
  const v = asText(value).toLowerCase()
  if (!v) return ''
  if (v === 'switchtab' || v === 'switch_tab') return 'switchTab'
  if (v === 'relaunch' || v === 're_launch') return 'reLaunch'
  if (v === 'redirectto' || v === 'redirect_to') return 'redirectTo'
  return 'navigateTo'
}

function buildClickTarget(payload) {
  const messageId = asText(payload.message_id || payload.messageId || payload.id)
  if (messageId) {
    return { route: `/pages/message_info/message_info?message_id=${encodeURIComponent(messageId)}`, openType: 'navigateTo' }
  }

  const routeKeys = ['path', 'page_path', 'route', 'page', 'target_path', 'targetPath']
  for (const key of routeKeys) {
    const route = normalizeRoutePath(payload[key])
    if (route) {
      return { route, openType: normalizeOpenType(payload.open_type || payload.openType || payload.jump_type || payload.jumpType) }
    }
  }

  const urlKeys = ['url', 'target_url', 'targetUrl', 'jump_url', 'jumpUrl', 'navigate_to', 'navigateTo']
  for (const key of urlKeys) {
    const rawUrl = asText(payload[key])
    if (!rawUrl) continue
    const route = normalizeRoutePath(rawUrl)
    if (route) {
      return { route, openType: normalizeOpenType(payload.open_type || payload.openType || payload.jump_type || payload.jumpType) }
    }
    if (/^https?:\/\//i.test(rawUrl)) {
      return { externalUrl: rawUrl }
    }
  }

  return { route: '/pages/message_list/message_list', openType: 'navigateTo' }
}

function emitPushEvent(eventName, payload) {
  if (typeof uni === 'undefined' || typeof uni.$emit !== 'function') return
  uni.$emit(eventName, payload)
}

function cacheCid(cid) {
  const value = asText(cid)
  if (!value) return ''
  if (typeof uni !== 'undefined' && typeof uni.setStorageSync === 'function') {
    uni.setStorageSync(CID_CACHE_KEY, value)
  }
  emitPushEvent('unipush-cid-ready', {
    cid: value,
    channel: PUSH_CHANNEL,
    ts: Date.now()
  })
  return value
}

function getPlusClientId() {
  try {
    if (typeof plus === 'undefined' || !plus.push || typeof plus.push.getClientInfo !== 'function') return ''
    const info = plus.push.getClientInfo()
    return asText(info?.clientid)
  } catch (e) {
    return ''
  }
}

function isDuplicateClick(payload, msg) {
  const clickKey = [
    asText(payload.message_id || payload.messageId || payload.id),
    asText(payload.path || payload.route || payload.url || payload.target_url),
    asText(msg?.title),
    asText(msg?.content)
  ].filter(Boolean).join('|')

  if (!clickKey) return false

  const now = Date.now()
  if (clickKey === lastClickKey && (now - lastClickAt) < CLICK_DEDUP_WINDOW) {
    return true
  }
  lastClickKey = clickKey
  lastClickAt = now
  return false
}

function openExternalUrl(url) {
  const target = asText(url)
  if (!target) return
  // #ifdef APP-PLUS
  try {
    plus.runtime.openURL(target)
    return
  } catch (e) {
    // fallback below
  }
  // #endif
  uni.showToast({ title: '无法打开链接', icon: 'none' })
}

function navigateToRoute(route, openType = '') {
  const target = normalizeRoutePath(route)
  if (!target) return

  const finalOpenType = openType || (TAB_BAR_ROUTES.has(target) ? 'switchTab' : 'navigateTo')
  if (finalOpenType === 'switchTab') {
    uni.switchTab({ url: target })
    return
  }
  if (finalOpenType === 'reLaunch') {
    uni.reLaunch({ url: target })
    return
  }
  if (finalOpenType === 'redirectTo') {
    uni.redirectTo({ url: target })
    return
  }
  uni.navigateTo({ url: target })
}

function handlePushClick(msg, payload) {
  if (isDuplicateClick(payload, msg)) return

  const target = buildClickTarget(payload)
  if (target.externalUrl) {
    openExternalUrl(target.externalUrl)
  } else {
    navigateToRoute(target.route, target.openType)
  }

  emitPushEvent('unipush-message-click', {
    channel: PUSH_CHANNEL,
    payload,
    raw: msg,
    ts: Date.now()
  })
}

function handlePushReceive(msg, payload) {
  emitPushEvent('unipush-message-receive', {
    channel: PUSH_CHANNEL,
    payload,
    raw: msg,
    ts: Date.now()
  })
}

function handlePushMessage(msg, fallbackType = '') {
  const type = asText(msg?.type || fallbackType).toLowerCase()
  const rawData = msg && Object.prototype.hasOwnProperty.call(msg, 'data') ? msg.data : msg
  const payload = normalizePayload(rawData)

  if (type === 'click') {
    handlePushClick(msg, payload)
    return
  }
  handlePushReceive(msg, payload)
}

function bindPushListeners() {
  // #ifdef APP-PLUS
  if (typeof uni !== 'undefined' && typeof uni.onPushMessage === 'function' && !pushMessageBound) {
    uni.onPushMessage((msg) => handlePushMessage(msg))
    pushMessageBound = true
    return
  }

  if (!plusFallbackBound && typeof plus !== 'undefined' && plus.push) {
    plus.push.addEventListener('receive', (msg) => handlePushMessage(msg, 'receive'))
    plus.push.addEventListener('click', (msg) => handlePushMessage(msg, 'click'))
    plusFallbackBound = true
  }
  // #endif
}

export function getCachedPushClientId() {
  if (typeof uni === 'undefined' || typeof uni.getStorageSync !== 'function') return ''
  return asText(uni.getStorageSync(CID_CACHE_KEY))
}

export function getPushClientIdSafe(options = {}) {
  const forceRefresh = !!options.forceRefresh
  if (!forceRefresh) {
    const cached = getCachedPushClientId()
    if (cached) return Promise.resolve(cached)
  }

  // #ifndef APP-PLUS
  return Promise.resolve('')
  // #endif

  // #ifdef APP-PLUS
  if (cidInFlight && !forceRefresh) return cidInFlight

  cidInFlight = new Promise((resolve) => {
    const done = (cid) => resolve(cacheCid(cid) || '')

    if (typeof uni !== 'undefined' && typeof uni.getPushClientId === 'function') {
      let settled = false
      const finish = (cid) => {
        if (settled) return
        settled = true
        done(cid)
      }

      const timer = setTimeout(() => {
        finish(getPlusClientId())
      }, 8000)

      uni.getPushClientId({
        success: (res) => {
          clearTimeout(timer)
          finish(asText(res?.cid))
        },
        fail: () => {
          clearTimeout(timer)
          finish(getPlusClientId())
        }
      })
      return
    }

    done(getPlusClientId())
  }).finally(() => {
    cidInFlight = null
  })

  return cidInFlight
  // #endif
}

function scheduleCidRefresh() {
  if (cidRefreshTimer) return
  cidRefreshTimer = setTimeout(async () => {
    cidRefreshTimer = null
    await getPushClientIdSafe({ forceRefresh: true })
  }, CID_REFRESH_DELAY)
}

export async function initUniPush2() {
  if (pushInited) {
    return getCachedPushClientId()
  }
  pushInited = true

  // #ifndef APP-PLUS
  return ''
  // #endif

  // #ifdef APP-PLUS
  bindPushListeners()
  const cid = await getPushClientIdSafe()
  scheduleCidRefresh()
  return cid
  // #endif
}
