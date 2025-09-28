<template>
  <view class="summary-wrap">
    <!-- 顶部渐变 + 搜索 -->
    <view class="header">
      <view class="search-box">
        <view class="fake-search" @tap="goSearchPage">
          <image class="icon" src="/static/search.png" mode="widthFix" />
          <text class="placeholder">搜索娃物 / 店铺 / 妆师 / 毛娘</text>
          <view class="action">搜 索</view>
        </view>
      </view>
    </view>

    <!-- 今日上新（新增，显示在热榜上方） -->
    <view class="section s-today" :class="[{ 'is-inview': secInView.today }, { 'is-active': activeSection==='today' }]">
      <view class="section-hd">
        <text class="title">今日</text>
        <view class="sub sub-row">
          <text v-if="todayLoading" class="loading-mini">加载中…</text>
          <text class="link-calendar" @tap="goCalendar">查看全部</text>
        </view>
      </view>

      <view v-if="todayList.length === 0 && !todayLoading" class="empty">
        <image src="/static/empty-box.png" mode="aspectFit"></image>
        <text>今天暂无开售</text>
      </view>

      <scroll-view v-else scroll-x class="theme-scroll" :show-scrollbar="false">
        <view
          class="goods-mini"
          v-for="it in todayList"
          :key="'today-' + it.goodsId + '-' + it.recordId"
          @tap="goGoods(it.goodsId, it.recordId)"
        >
          <image :src="it.cover" mode="aspectFill"></image>
          <text class="type-badge" v-if="it.type">{{ it.type }}</text>
          <view class="gname ellipsis-2">{{ it.goods_name }}</view>
          <scroll-view class="meta" scroll-y="true">
            <text class="size" v-if="it.sizeText">{{ it.sizeText }}</text>
          </scroll-view>
        </view>
      </scroll-view>
    </view>

    <!-- 热榜：今日 / 近7日（总榜）切换 -->
    <view class="section s-hot" :class="[{ 'is-inview': secInView.hot }, { 'is-active': activeSection==='hot' }]">
      <view class="section-hd">
        <text class="title">热榜</text>
        <view class="sub sub-row">
          <text
            :class="['tab-mini', { active: hotMode==='today' }]"
            @tap="hotMode='today'"
          >今日</text>
          <text
            :class="['tab-mini', { active: hotMode==='7days' }]"
            @tap="hotMode='7days'"
          >近7日</text>
          <text v-if="hotLoading" class="loading-mini">加载中…</text>
          <text class="link-calendar" @tap="goCalendar">查看日历</text>
        </view>
      </view>

      <!-- 今日热榜 -->
      <view v-if="hotMode==='today'">
        <view v-if="hotList.length === 0 && !hotLoading" class="empty">
          <image src="/static/empty-box.png" mode="aspectFit"></image>
          <text>今天还没有上榜商品</text>
        </view>

        <scroll-view v-else scroll-x class="hot-scroll" :show-scrollbar="false">
          <view
            class="hot-card"
            v-for="(it, idx) in hotList"
            :key="it.goodsId + '-' + idx"
            @tap="goGoods(it.goodsId, it.recordId)"
          >
            <view class="rank" :class="'r' + (idx + 1)">{{ idx + 1 }}</view>
            <image class="cover" :src="it.cover" mode="aspectFill"></image>
            <view class="info">
              <view class="brand-tag">{{ it.brand_name }}</view>
              <view class="name ellipsis-2">{{ it.goods_name }}</view>
              <view class="meta">
                <view class="hotness">
                  <uni-icons type="fire" size="22" color="#ff5a6e"></uni-icons>
                  <text class="views" v-if="it.views">{{ formatViews(it.views) }}</text>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 近7日热榜（总榜） -->
      <view v-else>
        <view v-if="hot7List.length === 0 && !hotLoading" class="empty">
          <image src="/static/empty-box.png" mode="aspectFit"></image>
          <text>最近7日暂无上榜商品</text>
        </view>

        <scroll-view v-else scroll-x class="hot-scroll" :show-scrollbar="false">
          <view
            class="hot-card"
            v-for="(it, idx) in hot7List"
            :key="it.goodsId + '-' + idx"
            @tap="goGoods(it.goodsId, it.recordId)"
          >
            <view class="rank" :class="'r' + (idx + 1)">{{ idx + 1 }}</view>
            <image class="cover" :src="it.cover" mode="aspectFill"></image>
            <view class="info">
              <view class="brand-tag">{{ it.brand_name }}</view>
              <view class="name ellipsis-2">{{ it.goods_name }}</view>
              <view class="meta">
                <view class="hotness">
                  <uni-icons type="fire" size="22" color="#ff5a6e"></uni-icons>
                  <text class="views" v-if="it.views">{{ formatViews(it.views) }}</text>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 主题合集（按后端分组） -->
    <view class="section s-themes" :class="[{ 'is-inview': secInView.themes }, { 'is-active': activeSection==='themes' }]">
      <view class="section-hd">
        <text class="title">主题合集</text>
        <scroll-view v-if="themeChips.length" scroll-x class="chips-scroll" :show-scrollbar="false">
          <view class="chips">
            <view
              v-for="c in themeChips"
              :key="c.key"
              :class="['chip', { active: activeThemeKey === c.key }]"
              @tap="activeThemeKey = c.key"
            >
              {{ c.title }}
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="themes">
        <scroll-view v-if="filteredThemeItems.length" scroll-x class="theme-scroll" :show-scrollbar="false">
          <view
            class="goods-mini"
            v-for="it in filteredThemeItems"
            :key="it.key"
            @tap="goGoods(it.goodsId, it.recordId)"
          >
            <image :src="it.cover" mode="aspectFill"></image>
            <text class="type-badge" v-if="it.type">{{ it.type }}</text>
            <view class="gname ellipsis-2">{{ it.goods_name }}</view>
            <scroll-view class="meta" scroll-y="true">
              <text class="size" v-if="it.sizeText">{{ it.sizeText }}</text>
            </scroll-view>
          </view>
        </scroll-view>
        <view v-else-if="!themeLoading" class="empty-slim">该主题暂无在售</view>
      </view>
    </view>

    <!-- 最近入库（Ops Feed） -->
    <view class="section s-ops" :class="[{ 'is-inview': secInView.ops }, { 'is-active': activeSection==='ops' }]">
      <view class="section-hd">
        <text class="title">最近入库</text>
        <view class="sub" style="display:flex; gap: 12rpx; align-items:center;">
          <text v-if="opsLoading">加载中…</text>
          <text class="link-more" @tap="go2recentFeed">查看更多 ></text>
        </view>
      </view>

      <view v-if="opsList.length === 0 && !opsLoading" class="empty">
        <image src="/static/empty-box.png" mode="aspectFit"></image>
        <text>最近暂无入库动态</text>
      </view>

      <scroll-view v-else scroll-x class="hot-scroll" :show-scrollbar="false">
        <view
          class="hot-card"
          v-for="(op, idx) in opsList"
          :key="op.id + '-' + idx"
          @tap="goOpsItem(op)"
        >
          <image class="cover" :src="op.image_url" mode="aspectFill"></image>
          <view class="info">
            <view class="brand-tag">{{ op.brand_name }}</view>
            <view class="name ellipsis-2">{{ op.summary }}</view>
            <view class="meta">
              <text style="color:#9aa4b2; font-size:22rpx;">{{ op.time_ago }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 订阅品牌 -->
    <view class="section s-likes" :class="[{ 'is-inview': secInView.likes }, { 'is-active': activeSection==='likes' }]">
      <view class="section-hd">
        <text class="title">订阅品牌</text>
        <text class="sub" v-if="likesLoading">加载中…</text>
      </view>

      <view v-if="!hasToken" class="login-tip">
        <text>登录后可查看你的订阅品牌</text>
      </view>

      <scroll-view v-else class="brand-scroll" scroll-x :show-scrollbar="false">
        <view class="brand-item" v-for="it in likeBrands" :key="it.id" @tap="goBrand(it.brand.id)">
          <image :src="it.brand.logo_image" mode="aspectFill" class="brand-logo"></image>
          <text class="brand-name ellipsis-1">{{ it.brand.brand_name }}</text>
        </view>
        <view v-if="likeBrands.length === 0 && !likesLoading" class="brand-empty">还没有订阅品牌~</view>
      </scroll-view>
    </view>

    <!-- 即将上新 时间线 -->
    <view class="section s-timeline" :class="[{ 'is-inview': secInView.timeline }, { 'is-active': activeSection==='timeline' }]">
      <view class="section-hd">
        <text class="title">即将上新</text>
        <view class="sub sub-row">
          <text v-if="timelineLoading" class="loading-mini">加载中…</text>
          <text class="link-calendar" @tap="goCalendar">查看日历</text>
        </view>
      </view>

      <view v-if="timeline.length === 0 && !timelineLoading" class="empty">
        <image src="/static/empty-box.png" mode="aspectFit"></image>
        <text>暂无即将开始的上新</text>
      </view>

      <view class="timeline" v-else>
        <view class="timeline-connector"></view>
        <view
          class="tl-item"
          v-for="(r, index) in timeline"
          :key="r.key"
          :class="{ 'is-visible': index < visibleCount }"
          @tap="goGoods(r.goodsId, r.recordId)"
        >
          <view class="tl-left">
            <view class="tl-time">{{ fmtHM(r.time) }}</view>
            <view class="tl-date">{{ fmtMD(r.time) }}</view>
          </view>
          <view class="tl-middle"><view class="dot"></view></view>
          <view class="tl-card">
            <view class="tl-card-grid">
              <image :src="r.cover" mode="aspectFill" class="thumb" />
              <view class="tl-info">
                <view class="row-1">
                  <text class="brand-tag">{{ r.brand_name }}</text>
                  <text class="gname ellipsis-1">{{ r.goods_name }}</text>
                </view>
                <view class="row-2">
                  <text class="type-badge" v-if="r.type">{{ r.type }}</text>
                  <view class="hotness">
                    <uni-icons type="fire" size="22" color="#ff5a6e"></uni-icons>
                    <text class="views" v-if="r.views">{{ formatViews(r.views) }}</text>
                  </view>
                </view>
                <view class="sizes" v-if="r.sizeChips && r.sizeChips.length">
                  <text class="size-chip" v-for="(s, i) in r.sizeChips" :key="i">{{ s }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, getCurrentInstance, watch } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { websiteUrl, asyncGetUserInfo } from '@/common/config.js'

/** ----------------- 状态 ----------------- */
const todayList = ref([])     // 今日上新（新增）
const todayLoading = ref(true)

const hotList = ref([])       // 今日热榜
const hot7List = ref([])      // 近7日热榜（总榜）
const hotMode = ref('today')  // 'today' | '7days'
const hotLoading = ref(true)

// 防抖：避免并发刷新
const isRefreshing = ref(false)

const themeGroups = ref([])
const themeLoading = ref(true)
const activeThemeKey = ref('')

const likeBrands = ref([])
const likesLoading = ref(true)
const hasToken = ref(false)

const timeline = ref([])
const timelineLoading = ref(true)

/** 最近入库（ops-feed） */
const opsList = ref([])
const opsLoading = ref(true)

/** ▼▼▼ 时间轴显隐控制（逐条显现） ▼▼▼ */
const visibleCount = ref(0)
const staggerStarted = ref(false)
let revealTimer = null
const STEP_MS = 700
const instance = getCurrentInstance()
let tlObserver = null

function startStaggerReveal () {
  if (staggerStarted.value) return
  staggerStarted.value = true
  visibleCount.value = 0
  const total = timeline.value.length || 0
  if (total === 0) return
  const tick = () => {
    if (visibleCount.value < total) {
      visibleCount.value += 1
      revealTimer = setTimeout(tick, STEP_MS)
    } else {
      stopStaggerReveal()
    }
  }
  tick()
}
function stopStaggerReveal () {
  if (revealTimer) {
    clearTimeout(revealTimer)
    revealTimer = null
  }
}
function initTlObserver () {
  destroyTlObserver()
  tlObserver = uni.createIntersectionObserver(instance)
  tlObserver.relativeToViewport({ top: 160 })
  tlObserver.observe('.timeline', (res) => {
    if (!res) return
    const ratio = res?.intersectionRatio || 0
    if (ratio > 0) {
      startStaggerReveal()
      destroyTlObserver()
    }
  })
}
function destroyTlObserver () {
  if (tlObserver && typeof tlObserver.disconnect === 'function') {
    tlObserver.disconnect()
  }
  tlObserver = null
}

/** ----------------- Section In-View & Active（只允许一个旋转） ----------------- */
const sectionMap = [
  { sel: '.s-today', key: 'today' },
  { sel: '.s-hot', key: 'hot' },
  { sel: '.s-themes', key: 'themes' },
  { sel: '.s-ops', key: 'ops' },
  { sel: '.s-likes', key: 'likes' },
  { sel: '.s-timeline', key: 'timeline' }
]
const secInView = ref({
  today: false, hot: false, themes: false,
  ops: false, likes: false, timeline: false
})
const lastRatios = ref({})
const activeSection = ref('')
let secObservers = []
let activeSetTimer = null

function pickActiveByMaxRatio () {
  let bestKey = ''
  let bestRatio = 0
  for (const { key } of sectionMap) {
    const r = lastRatios.value[key] || 0
    if (r > bestRatio) { bestRatio = r; bestKey = key }
  }
  activeSection.value = bestRatio > 0.02 ? bestKey : ''
}
function schedulePickActive () {
  if (activeSetTimer) clearTimeout(activeSetTimer)
  activeSetTimer = setTimeout(() => {
    pickActiveByMaxRatio()
    activeSetTimer = null
  }, 80)
}
function initSectionInViewObservers () {
  destroySectionInViewObservers()
  sectionMap.forEach(({ sel, key }) => {
    const ob = uni.createIntersectionObserver(instance)
    ob.relativeToViewport({ top: 120, bottom: 120 })
    ob.observe(sel, (res) => {
      const ratio = res?.intersectionRatio || 0
      secInView.value[key] = ratio > 0
      lastRatios.value[key] = ratio
      schedulePickActive()
    })
    secObservers.push(ob)
  })
}
function destroySectionInViewObservers () {
  secObservers.forEach(o => { try { o.disconnect() } catch(_){} })
  secObservers = []
}

/** ----------------- Token / Auth ----------------- */
function readToken() {
  return uni.getStorageSync('Authorization') || uni.getStorageSync('token') || ''
}
function refreshAuthFlag() {
  hasToken.value = !!readToken()
}
async function ensureAuth() {
  try {
    if (typeof asyncGetUserInfo === 'function') {
      await asyncGetUserInfo()
    }
  } catch (_) {}
  refreshAuthFlag()
}
function getAuthHeader() {
  const t = readToken()
  return t ? { Authorization: t } : {}
}

/** ----------------- 跨天自动刷新：日期记录 ----------------- */
const STORAGE_DATE_KEY = 'summary_page_date_key'
function todayKey () {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

/** 统一刷新当前页需要的数据 */
async function refreshAll (isInit = false) {
  try {
    await Promise.all([
      fetchTodaySales(),    // 今日上新
      fetchHotToday(),      // 今日热榜
      fetchThemes(),        // 主题合集
      fetchLikes(),         // 订阅品牌
      fetchTimeline(),      // 即将上新时间线
      fetchOpsFeedRecent()  // 最近入库
    ])
  } finally {
    uni.setStorageSync(STORAGE_DATE_KEY, todayKey())
  }
}

/** ----------------- API ----------------- */
function normalizeGoodsList(list) {
  return (list || []).map(it => {
    const cover = it.goods_image || (Array.isArray(it.goods_images) ? it.goods_images[0] : '')
    const sizes = Array.isArray(it.sizes) ? it.sizes : []
    return {
      recordId: it.id,
      goodsId: it.goods_id || it.id,
      cover,
      brand_name: it.brand_name || it.brand?.brand_name || '',
      goods_name: it.goods_name || it.name || '',
      type: it.type || '',
      views: it.views || it.click_count || 0,
      sizeText: sizeText(sizes)
    }
  })
}

/** 今日上新（新增） */
function fetchTodaySales() {
  todayLoading.value = true
  return uni.request({
    url: websiteUrl.value + '/sales-start-today',
    method: 'GET',
    data: { limit: 12 },
    timeout: 5000
  }).then(res => {
    const list = res?.data?.data?.list || res?.data?.data || []
    todayList.value = normalizeGoodsList(list)
  }).finally(() => { todayLoading.value = false })
}

function fetchHotToday() {
  hotLoading.value = true
  return uni.request({
    url: websiteUrl.value + '/goods-hot-today',
    method: 'GET',
    data: { limit: 6 },
    timeout: 5000
  }).then(res => {
    const list = res?.data?.data?.list || []
    hotList.value = normalizeGoodsList(list)
  }).finally(() => { hotLoading.value = false })
}

function fetchHot7Days() {
  hotLoading.value = true
  return uni.request({
    url: websiteUrl.value + '/goods-hot-7days',
    method: 'GET',
    data: { limit: 6 },
    timeout: 5000
  }).then(res => {
    const list = res?.data?.data?.list || []
    hot7List.value = normalizeGoodsList(list)
  }).finally(() => { hotLoading.value = false })
}

/** 主题合集：按后端分组渲染 */
function fetchThemes() {
  themeLoading.value = true
  return uni.request({
    url: websiteUrl.value + '/goods-themes',
    method: 'GET',
    timeout: 5000
  }).then(res => {
    const groups = res?.data?.data || []
    themeGroups.value = Array.isArray(groups) ? groups : []
    if (!activeThemeKey.value && themeGroups.value.length) {
      activeThemeKey.value = themeGroups.value[0].key
    }
  }).finally(() => { themeLoading.value = false })
}

/** 订阅品牌（需要 Authorization） */
function fetchLikes() {
  likesLoading.value = true
  refreshAuthFlag()
  if (!hasToken.value) {
    likesLoading.value = false
    likeBrands.value = []
    return Promise.resolve()
  }
  return uni.request({
    url: websiteUrl.value + '/with-state/user-likes',
    method: 'GET',
    data: { type: 2, page: 1, page_size: 8 },
    header: getAuthHeader(),
    timeout: 5000
  }).then(res => {
    likeBrands.value = res?.data?.data?.list || []
  }).finally(() => { likesLoading.value = false })
}

/** 最近24小时时间线 */
function fetchTimeline() {
  timelineLoading.value = true
  return uni.request({
    url: websiteUrl.value + '/goods-timeline',
    method: 'GET',
    timeout: 5000
  }).then(res => {
    const raw = res?.data?.data
    const list = Array.isArray(raw) ? raw : raw?.list || []
    const now = Math.floor(Date.now() / 1000)
    const from = now - 3600
    const to = now + 86400

    const norm = list.map(it => {
      const time = deriveTime(it)
      const cover = it.goods_image || (Array.isArray(it.goods_images) ? it.goods_images[0] : '')
      const sizes = Array.isArray(it.sizes) ? it.sizes : []
      return {
        key: `${it.id}-${time || 0}`,
        recordId: it.id,
        goodsId: it.goods_id || it.id,
        time: time || 0,
        cover,
        brand_name: it.brand_name || it.brand?.brand_name || '',
        goods_name: it.goods_name || it.name || '',
        type: it.type || '',
        views: it.views || it.click_count || 0,
        sizeText: sizeText(sizes),
        sizeChips: sizeChips(sizes)
      }
    }).filter(x => x.time >= from && x.time <= to)

    norm.sort((a, b) => a.time - b.time)
    timeline.value = norm

    setTimeout(() => {
      if (!staggerStarted.value) {
        uni.createSelectorQuery().in(instance).select('.timeline').boundingClientRect(rect => {
          try {
            const vh = uni.getSystemInfoSync().windowHeight || 0
            if (rect && typeof rect.top === 'number' && rect.top < vh - 160) {
              startStaggerReveal()
            }
          } catch (_) {}
        }).exec()
      }
    }, 0)
  }).finally(() => { timelineLoading.value = false })
}

/** 最近入库（Ops Feed） */
function fetchOpsFeedRecent() {
  opsLoading.value = true
  return uni.request({
    url: websiteUrl.value + '/ops-feed/recent',
    method: 'GET',
    data: { hours: 24, page: 1, page_size: 12 },
    timeout: 5000
  }).then(res => {
    const rows = res?.data?.data?.list || []
    opsList.value = rows.map(r => ({
      id: r.id,
      op_type: r.op_type,
      target_id: r.target_id,
      brand_id: r.brand_id,
      brand_name: r.brand_name || '',
      goods_id: r.goods_id,
      goods_name: r.goods_name || '',
      summary: r.summary || '',
      image_url: r.image_url || '',
      time_ago: r.time_ago || ''
    }))
  }).finally(() => { opsLoading.value = false })
}

/** ----------------- 主题合集：归一化与筛选 ----------------- */
const themeChips = computed(() =>
  (themeGroups.value || []).map(g => ({ key: g.key, title: g.title }))
)
const filteredThemeItems = computed(() => {
  const g = (themeGroups.value || []).find(x => x.key === activeThemeKey.value)
  if (!g || !Array.isArray(g.items)) return []
  return g.items.map(it => {
    const info = it.goods_info || {}
    const sizes = it.sizes || info.sizes || []
    const cover = it.goods_image
      || (Array.isArray(info.goods_images) ? info.goods_images[0] : '')
      || (Array.isArray(it.goods_images) ? it.goods_images[0] : '')
      || ''
    return {
      key: `${it.id}-${it.goods_id || info.id || ''}`,
      recordId: it.id,
      goodsId: it.goods_id || info.id || it.id,
      cover,
      goods_name: it.goods_name || it.name || info.name || '',
      brand_name: it.brand_name || info.brand_name || '',
      type: it.type || info.type || '',
      sizeText: sizeText(sizes)
    }
  })
})

/** ----------------- helpers ----------------- */
function onSearchSubmit() {}
function sizeText(sizes) {
  if (!Array.isArray(sizes) || sizes.length === 0) return ''
  const groups = {}
  sizes.forEach(s => { (groups[s.goods_size] ||= new Set()).add((s.size_detail || '').trim()) })
  return Object.keys(groups).map(k => {
    const arr = Array.from(groups[k]).filter(Boolean)
    return arr.length ? `${k}(${arr.join('、')})` : k
  }).join('，')
}
function sizeChips(sizes) {
  if (!Array.isArray(sizes) || sizes.length === 0) return []
  const groups = {}
  sizes.forEach(s => {
    const key = (s.goods_size || '').trim()
    const detail = (s.size_detail || '').trim()
    if (!key) return
    (groups[key] ||= new Set())
    if (detail) groups[key].add(detail)
  })
  return Object.keys(groups).map(k => {
    const arr = Array.from(groups[k])
    return arr.length ? `${k}（${arr.join('、')}）` : k
  })
}
function go2recentFeed() {
  uni.navigateTo({ url: "/pages/recent-feed/recent-feed" })
}
/** 旧方法（保留） */
function goOpsFeed () {
  if (process.env.UNI_PLATFORM === 'h5') {
    location.href = '/#/pages/ops_feed/ops_feed'
    return
  }
  uni.navigateTo({ url: '/pages/ops_feed/ops_feed' })
}
/** 查看日历/全部（恢复） */
function goCalendar () {
  if (process.env.UNI_PLATFORM === 'h5') {
    location.href = '/#/pages/calendar/calendar'
    return
  }
  uni.navigateTo({ url: '/pages/calendar/calendar' })
}

function deriveTime(it) {
  const cands = []
  if (it.sub_time) cands.push(+it.sub_time)
  for (let i = 1; i <= 5; i++) {
    const v = it[`sub_time${i}`]
    if (v) cands.push(+v)
  }
  if (it.start_time) cands.push(+it.start_time)
  return cands.filter(x => x > 0).sort((a, b) => a - b)[0] || 0
}
function fmtHM(ts) {
  const d = new Date(ts * 1000)
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}
function fmtMD(ts) {
  const d = new Date(ts * 1000)
  const M = String(d.getMonth() + 1).padStart(2, '0')
  const D = String(d.getDate()).padStart(2, '0')
  return `${M}/${D}`
}
function formatViews(views) {
  if (views >= 10000) return (views / 10000).toFixed(1) + 'w'
  if (views >= 1000) return (views / 1000).toFixed(1) + 'k'
  return views
}

/** ----------------- 跳转 ----------------- */
function goGoods(goodsId, recordId) {
  if (recordId) {
    uni.request({
      url: websiteUrl.value + '/sale-record-click?id=' + recordId,
      method: 'POST',
      header: { 'Content-Type': 'application/json' }
    })
  }
  if (!goodsId) return
  uni.navigateTo({ url: `/pages/goods/goods?goods_id=${goodsId}` })
}
function goBrand(brandId) {
  uni.navigateTo({ url: `/pages/brand/brand?brand_id=${brandId}` })
}
function goOpsItem (op) {
  if (!op) return
  // 优先跳商品
  if (op.goods_id && Number(op.goods_id) > 0) {
    goGoods(op.goods_id)
    return
  }
  // 其后跳品牌
  if (op.brand_id && Number(op.brand_id) > 0) {
    goBrand(op.brand_id)
    return
  }
  // 兜底：添加品牌类（op_type===1）一般 target_id 即品牌ID
  if (op.op_type === 1 && op.target_id && Number(op.target_id) > 0) {
    goBrand(op.target_id)
    return
  }
}

function goSearchPage () {
  // 配置：1234；模式：跳转模式
  const tabs = '1,2,3,4'
  const mode = 'jump'
  uni.navigateTo({
    url: `/pages/search/search?mode=${mode}&tabs=${tabs}`
  })
}

/** ----------------- 下拉刷新 ----------------- */
async function handlePullDownRefresh () {
  if (isRefreshing.value) return
  isRefreshing.value = true
  try {
    uni.showNavigationBarLoading()
    await refreshAll(false)
  } catch (e) {
  } finally {
    uni.stopPullDownRefresh()
    uni.hideNavigationBarLoading()
    isRefreshing.value = false
  }
}
onPullDownRefresh(handlePullDownRefresh)

/** ----------------- 生命周期 ----------------- */
onMounted(async () => {
  await ensureAuth()
  await refreshAll(true)   // 统一刷新并记录今天
  initTlObserver()
  initSectionInViewObservers()
})

onShow(() => {
  try {
    const last = uni.getStorageSync(STORAGE_DATE_KEY)
    const now = todayKey()
    if (last && last !== now) {
      // 隔天自动刷新数据
      refreshAll(false)
    }
  } catch (_) {}
})

watch(hotMode, (m) => {
  if (m === '7days' && hot7List.value.length === 0) {
    fetchHot7Days()
  }
})

onBeforeUnmount(() => {
  stopStaggerReveal()
  destroyTlObserver()
  destroySectionInViewObservers()
})
</script>

<style lang="less" scoped>
/* =========================================================
   统一主题变量（header 渐变除外）
   ========================================================= */
.summary-wrap {
  --c-primary: #63cce7;
  --c-primary-700: #63cce7;
  --c-primary-500: #63cce7;

  --c-grad-start: #63cce7;
  --c-grad-end:   #63cce7;
  --g-primary: linear-gradient(135deg, var(--c-grad-start), var(--c-grad-end));

  --c-accent-start: #63cce7;
  --c-accent-end:   #63cce7;
  --g-accent: linear-gradient(135deg, var(--c-accent-start), var(--c-accent-end));

  --c-soft-rgb: 125,195,211;
  --c-primary-r: 99;
  --c-primary-g: 204;
  --c-primary-b: 231;

  /* 星星旋转速度（调大变慢） */
  --star-rot-speed: 3.2s;
}

.summary-wrap{
  padding-bottom: 40rpx;
  background-color: #f5f7fa;
}

/* 顶部渐变 + 搜索（header 保持原样） */
.header{
  padding: 24rpx 24rpx 10rpx;
  background: linear-gradient(180deg, #def9ff, #e1ebf2);
  border-radius: 0 0 20rpx 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(93, 168, 192, 0.2);

  .search-box{
    // background: rgba(255, 255, 255, 0.9);
    // border-radius: 36rpx;
    // padding: 8rpx 24rpx;
    // box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.08);
  }
}

/* 区块外框 */
.section{
  padding: 24rpx 24rpx 20rpx;
  margin: 24rpx 24rpx 30rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 6rpx 24rpx rgba(0,0,0,0.04);
  &:last-child { margin-bottom: 0; }
}

/* 区块标题（星星替代左边框） */
.section-hd{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  margin-bottom: 24rpx;
  flex-wrap: wrap;

  .title{
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 12rpx;

    font-size: 32rpx;
    font-weight: 700;
    color:#38374c;

    padding-left: 0;
    border-left: none;

    &::before{
      content: '';
      width: 28rpx;
      height: 28rpx;
      background: url('/static/new-icon/flower.png') no-repeat center / contain;
      display: inline-block;
      transform-origin: 50% 50%;
    }
  }
  .sub{ font-size: 24rpx; color:#999; }
}

/* 旋转动画（只给唯一激活的 section） */
@keyframes star-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
.section.is-active .section-hd .title::before{
  animation: star-spin var(--star-rot-speed) linear infinite;
}

/* 迷你切换按钮 */
.tab-mini{
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  color:#666;
  background: rgba(var(--c-soft-rgb), .12);
  border: 1rpx solid rgba(var(--c-soft-rgb), .30);
  margin-left: 12rpx;
  transition: all .2s ease;

  &.active{
    background: var(--g-primary);
    color:#fff;
    border-color: var(--c-grad-start);
    font-weight: 600;
  }
}

/* 热榜/上新右侧：查看日历按钮 + loading 微样式 */
.sub-row{
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.loading-mini{ color:#999; }
.link-calendar{
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  color: var(--c-primary-700);
  background: rgba(var(--c-soft-rgb), .12);
  border: 1rpx solid rgba(var(--c-soft-rgb), .35);
  transition: all .2s ease;
}
.link-calendar:active{ opacity:.85; }

/* 查看更多 */
.link-more{
  font-size: 24rpx;
  color: var(--c-primary);
  padding: 6rpx 10rpx;
  border-radius: 8rpx;
  background: rgba(var(--c-soft-rgb), .10);
}

/* ---- 热榜：横向滚动 ---- */
.hot-scroll{ white-space: nowrap; padding-bottom: 10rpx; }
.hot-card{
  display:inline-flex;
  flex-direction: column;
  vertical-align: top;
  width: 300rpx;
  height: 640rpx;
  margin-right: 24rpx;
  background:#fff;
  border-radius: 24rpx;
  overflow: hidden;
  position:relative;
  transition: all 0.3s ease;

  &:active{ transform: scale(0.98); box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.1); }

  .rank{
    position:absolute; top: 16rpx; left: 16rpx;
    width: 48rpx; height: 48rpx; border-radius: 50%;
    color:#fff; font-weight: 800; font-size: 28rpx;
    display:flex; align-items:center; justify-content:center;
    background:#9aa4b2; z-index: 2;

    &.r1{ background: linear-gradient(135deg, #ff7b8a, #ff5a6e); box-shadow: 0 4rpx 8rpx rgba(255, 123, 138, 0.4); }
    &.r2{ background: linear-gradient(135deg, #ff9e66, #ff7f40); box-shadow: 0 4rpx 8rpx rgba(255, 158, 102, 0.4); }
    &.r3{ background: linear-gradient(135deg, #f7c948, #f5b400); color:#5b4c00; box-shadow: 0 4rpx 8rpx rgba(247, 201, 72, 0.4); }
  }

  .cover{ width:100%; display:block; background: linear-gradient(135deg, #f0f4f8, #e2e8f0); }

  .info{
    padding: 20rpx 16rpx; flex: 1; display: flex; flex-direction: column;

    .brand-tag{
      background: var(--g-accent);
      color:#fff; font-size: 22rpx; border-radius: 8rpx; padding: 4rpx 12rpx;
      display:inline-block; font-weight: 500; margin-bottom: 10rpx; align-self: flex-start;
    }
    .name{ font-size: 26rpx; color:#333; min-height: 72rpx; font-weight: 500; margin-bottom: auto; }
    .meta{
      display:flex; justify-content:flex-end; align-items: center;
      font-size: 22rpx; color:#777; margin-top: 10rpx;

      .hotness{ display: flex; align-items: center;
        .views{ color:#ff5a6e; font-weight: 500; margin-left: 4rpx; }
      }
    }
  }
}

/* 主题合集 & 今日上新卡片复用 */
.chips-scroll{ width: 100%; margin-top: 16rpx;
  .chips{ display:flex; gap: 12rpx; flex-wrap: nowrap; padding-left: 14rpx; padding-bottom: 6rpx; width: max-content; }
}
.chip{
  padding: 12rpx 24rpx; font-size: 24rpx; color:#666;
  background: rgba(var(--c-soft-rgb), .12);
  transition: all 0.3s ease; white-space: nowrap; height: 36rpx; line-height: 32rpx; display: flex; align-items: center;
  &.active{
    background: var(--c-primary);
    color:#fff; border-color: var(--c-grad-start); border-radius:20px 0 20px 0 ; 
    box-shadow: 0 4rpx 8rpx rgba(var(--c-primary-r), var(--c-primary-g), var(--c-primary-b), 0.30);
    font-weight: 500;
  }
}
.theme-scroll{ white-space: nowrap; padding-top: 10rpx; }
.goods-mini{
  display:inline-flex; flex-direction:column; width: 220rpx; height: 400rpx;margin-bottom: 20rpx;
  margin-right: 20rpx; background: #fff; border-radius: 20rpx; overflow: hidden;
  transition: all 0.3s ease; position: relative;

  &:active { transform: scale(0.96); box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.1); }

  image{ width: 220rpx; height: 220rpx; background: linear-gradient(135deg, #f0f4f8, #e2e8f0); }

  .type-badge{
    position: absolute; left: 12rpx; top: 12rpx;
    padding: 6rpx 12rpx; border-radius: 999rpx; font-size: 20rpx; font-weight: 600;
    background: rgba(0,0,0,.55); color:#fff; backdrop-filter: blur(2rpx);
  }

  .gname{ font-size: 24rpx; margin: 14rpx 12rpx 0; color:#333; font-weight: 500; }

  .meta{
    display:flex; justify-content:space-between; align-items:center; margin: 8rpx 12rpx 16rpx; height: 80rpx;
    .size{ font-size: 22rpx; color: #949494; font-weight: 500; margin-left: 10rpx; }
  }
}
.empty-slim{ text-align:center; color:#999; padding: 16rpx 0; font-size: 26rpx; }

/* 订阅品牌 */
.login-tip{ padding: 16rpx 0 0; color:#999; font-size: 26rpx; text-align: center; }
.brand-scroll{ white-space: nowrap; padding: 8rpx 0; }
.brand-item{
  display:inline-flex; width: 160rpx; flex-direction:column; align-items:center; margin-right: 24rpx;
  background: #fff; border-radius: 20rpx; padding: 20rpx 0; 
  transition: all 0.3s ease;

  &:active { transform: scale(0.95); box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.1); }

  .brand-logo{ width: 100rpx; height: 100rpx; border-radius: 50%; background:#f2f2f2; box-shadow: 0 4rpx 12rpx rgba(0,0,0,.1); border: 2rpx solid #fff; }
  .brand-name{ margin-top: 16rpx; font-size: 24rpx; color:#333; width: 100%; text-align:center; padding: 0 10rpx; font-weight: 500; }
}
.brand-empty{ padding: 30rpx; color:#999; text-align: center; font-size: 26rpx; }

/* ---- 空态 ---- */
.empty{
  display:flex; flex-direction:column; align-items:center; color:#999; padding: 40rpx 0;
  image{ width: 160rpx; height:160rpx; margin-bottom: 20rpx; opacity:.7; }
}

/* ---- 时间轴 ---- */
.timeline{ position: relative; padding: 20rpx 0; }
.timeline-connector {
  position: absolute; left: 115rpx; top: 40rpx; bottom: 40rpx; width: 4rpx;
  background: linear-gradient(to bottom,
    rgba(var(--c-soft-rgb), .55),
    rgba(var(--c-primary-r), var(--c-primary-g), var(--c-primary-b), .15)
  );
  z-index: 1;
}

.tl-item{
  display: flex;
  margin-bottom: 40rpx;
  position: relative;
  align-items: flex-start;
  z-index: 2;

  opacity: 0.01;
  transform: translateY(16rpx);
  transition: opacity .34s ease, transform .4s ease;
  will-change: opacity, transform;

  &:last-child { margin-bottom: 0; }

  &.is-visible{
    opacity: 1;
    transform: translateY(0);
  }
}

.tl-left{
  width: 78rpx; text-align: right; padding-right: 24rpx; padding-top: 6rpx;
  .tl-time{ font-size: 32rpx; color: var(--c-primary-700); font-weight: 700; line-height: 1.2; }
  .tl-date{ font-size: 24rpx; color:#9aa4b2; margin-top: 6rpx; }
}
.tl-middle{ position: relative; width: 30rpx; height: 100%; display: flex; justify-content: center;
  .dot{
    width: 24rpx; height:24rpx; border-radius:50%; background:#fff;
    border: 4rpx solid var(--c-grad-start);
    box-shadow: 0 0 0 4rpx rgba(var(--c-soft-rgb), .20);
    z-index: 3; margin-top: 10rpx;
  }
}

.tl-card{
  flex:1; background:#fff; border-radius: 20rpx; padding: 20rpx;
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.08); transition: box-shadow .3s ease; margin-left: 10rpx; min-height: 160rpx;
  &:active { box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1); }

  .tl-card-grid{
    display: grid;
    grid-template-columns: 140rpx 1fr;
    column-gap: 20rpx;
    align-items: start;
  }

  .thumb{ width: 140rpx; height: 200rpx; border-radius: 16rpx; background: linear-gradient(135deg, #f0f4f8, #e2e8f0); object-fit: cover; }

  .tl-info{
    display: flex; flex-direction: column; min-width: 0;

    .row-1{
      display:flex; align-items:center; gap:12rpx; margin-bottom: 10rpx; min-width: 0;
      .brand-tag{
        background: var(--c-primary);
        color:#fff; padding: 4rpx 12rpx; font-size: 22rpx; border-radius: 8rpx; font-weight: 500; flex-shrink: 0;
      }
      .gname{ font-size: 28rpx; color:#333; flex:1; font-weight: 500; min-width: 0; }
    }

    .row-2{
      display:flex; justify-content:space-between; gap: 12rpx; align-items:center; font-size: 24rpx; color:#777; min-height: 40rpx;

      .type-badge{
        padding: 6rpx 14rpx; border-radius: 999rpx; font-size: 22rpx; font-weight: 600;
        background: rgba(var(--c-soft-rgb), .12);
        color: var(--c-primary-700);
        border: 1rpx solid rgba(var(--c-soft-rgb), .35);
        max-width: 70%; overflow:hidden; white-space:nowrap; text-overflow:ellipsis;
      }
      .hotness{ display: flex; align-items: center;
        .views{ color:#ff5a6e; font-weight: 500; margin-left: 4rpx; }
      }
    }

    .sizes{
      display: flex; flex-wrap: wrap; gap: 8rpx 10rpx; margin-top: 12rpx; max-height: none;
      .size-chip{
        padding: 6rpx 12rpx; border-radius: 999rpx;
        font-size: 22rpx; line-height: 1.4; color: var(--c-primary-700);
        background: rgba(var(--c-soft-rgb), .08);
        border: 1rpx solid rgba(var(--c-soft-rgb), .35);
        max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
    }
  }
}

/* 文字截断 */
.ellipsis-1{ overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
.ellipsis-2{ display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }

/* 假搜索框样式 */
.fake-search{
  height: 72rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 0 16rpx;
  border-radius: 36rpx;
  background: #fff;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.06);

  .icon{
    width: 36rpx;
    height: 36rpx;
    opacity: .85;
    flex-shrink: 0;
  }

  .placeholder{
    flex: 1;
    color: #9aa4b2;
    font-size: 24rpx;
  }

  .action{
    padding: 6rpx 14rpx;
    border-radius: 999rpx;
    font-size: 22rpx;
    color: #fff;
    background: linear-gradient(135deg, #63cce7, #63cce7);
    box-shadow: 0 4rpx 10rpx rgba(99,204,231,.25);
    flex-shrink: 0;
  }

  &:active { opacity: .9; }
}

</style>
