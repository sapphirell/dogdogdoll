<!-- components/orders-panel.vue -->
<template>
  <view class="orders-panel">
    <!-- 顶部统计卡片（BJD约妆 / 手改毛投递数量，可切换列表） -->
    <view class="summary-card">
      <view
        class="summary-item"
        :class="{ 'summary-item-active': activeOrderTypeTab === 'bjd' }"
        @click="changeOrderTypeTab('bjd')"
      >
        <text class="summary-number font-title">{{ totalBjd }}</text>
        <text class="summary-label font-alimamashuhei">BJD约妆</text>
      </view>

      <view class="summary-divider"></view>

      <view
        class="summary-item"
        :class="{ 'summary-item-active': activeOrderTypeTab === 'hair' }"
        @click="changeOrderTypeTab('hair')"
      >
        <text class="summary-number font-title">{{ totalHair }}</text>
        <text class="summary-label font-alimamashuhei">手改毛投递</text>
      </view>
    </view>

    <!-- 二级 Tab：全部 / 交易中 / 交易结束 -->
    <view class="second-tabs">
      <view
        v-for="tab in statusTabs"
        :key="tab.key"
        class="second-tab"
        :class="{ 'second-tab-active': activeStatusTab === tab.key }"
        @click="changeStatusTab(tab.key)"
      >
        <text class="second-tab-text font-alimama">{{ tab.label }}</text>
      </view>
    </view>

    <!-- 投递列表 / 空态 -->
    <view class="orders-list-wrap">
      <!-- 完全空状态 -->
      <view
        v-if="!loading && filteredList.length === 0 && submissionList.length === 0"
        class="empty-wrap"
      >
        <view class="empty-card">
          <text class="empty-title">还没有投递记录</text>
          <text class="empty-desc">去找喜欢的妆师 / 毛娘，投递你的第一个方案吧。</text>
        </view>
      </view>

      <!-- 当前筛选下暂无数据 -->
      <view
        v-else-if="!loading && filteredList.length === 0"
        class="empty-wrap status-empty"
      >
        <view class="empty-card">
          <text class="empty-title">当前状态暂无投递</text>
          <text class="empty-desc">换个筛选看看其他投递记录。</text>
        </view>
      </view>

      <!-- 列表卡片 -->
      <view v-else>
        <view
          v-for="(row, index) in filteredList"
          :key="rowKey(row, index)"
          class="sub-card"
          :style="subCardStyle(index)"
          @click="goSubmissionDetail(row)"
        >
          <!-- 左侧缩略图 -->
          <view class="sub-card-left">
            <image class="sub-thumb" :src="cardCover(row)" mode="aspectFill" />
          </view>

          <!-- 中间文本 -->
          <view class="sub-card-middle">
            <view class="sub-title-row">
              <text class="status-pill font-alimama">
                {{ statusPillText(row) }}
              </text>
              <text class="sub-main-title">
                {{ mainTitle(row) }}
              </text>
            </view>

            <view class="sub-subtitle-row">
              <text class="sub-meta-text">{{ itemsCount(row) }}个投递项</text>
              <text class="sub-meta-text price-text">{{ cardAmount(row) }}</text>
            </view>
          </view>

          <!-- 右侧箭头 -->
          <view class="sub-card-right">
            <uni-icons type="right" size="26" color="#444444" />
          </view>
        </view>
      </view>

      <!-- 底部加载 / 提示 -->
      <view class="list-footer">
        <view v-if="loading" class="footer-loading">
          <loading-jump-text></loading-jump-text>
        </view>
        <text v-else-if="finished && submissionList.length > 0" class="footer-text">已经到底了</text>
      </view>
    </view>

  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { onShow, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { websiteUrl, global, asyncGetUserInfo } from '@/common/config.js'

const props = defineProps({
  active: { type: Boolean, default: true }
})

const API_PATH = '/with-state/artist-order/my-submissions'

/** 顶部统计的类型切换：BJD / 手改毛 */
const activeOrderTypeTab = ref('bjd') // 'bjd' | 'hair'
function changeOrderTypeTab(type) {
  if (activeOrderTypeTab.value === type) return
  activeOrderTypeTab.value = type
}

/** 二级 Tab（状态筛选） */
const statusTabs = [
  { key: 'all', label: '全部' },
  { key: 'ongoing', label: '交易中' },
  { key: 'finished', label: '交易结束' }
]
const activeStatusTab = ref('all')

/** 列表数据：统一为 [{ submission, items, queue_stat }] */
const submissionList = ref([])
const page = ref(1)
const pageSize = 20
const total = ref(0)
const loading = ref(false)

const finished = computed(() => total.value > 0 && submissionList.value.length >= total.value)

/**
 * 顶部统计：分别缓存妆师/毛娘 total
 * 注意：total 可能为 0 也代表“已加载”，因此要用 loaded 标记避免重复请求
 */
const typeTotals = ref({ bjd: 0, hair: 0 })
const typeTotalsLoaded = ref({ bjd: false, hair: false })
const typeTotalsLoading = ref({ bjd: false, hair: false })

const totalBjd = computed(() => Number(typeTotals.value.bjd || 0))
const totalHair = computed(() => Number(typeTotals.value.hair || 0))

function tabToArtistType(tab) {
  if (tab === 'bjd') return 1
  if (tab === 'hair') return 2
  return 0
}
function otherTab(tab) {
  return tab === 'bjd' ? 'hair' : 'bjd'
}

/** ============ 适配新后端返回结构 ============ */
/**
 * 兼容：
 * - 新：{ submission, items }
 * - 旧：{ submission, items, queue_stat }
 * - 更旧：submission 直出（兜底）
 */
function normalizeRow(raw) {
  if (!raw) return { submission: {}, items: [], queue_stat: null }
  if (raw.submission || raw.Submission) {
    return {
      submission: raw.submission || raw.Submission || {},
      items: raw.items || raw.Items || [],
      queue_stat: raw.queue_stat || raw.QueueStat || raw.queueStat || null
    }
  }
  return {
    submission: raw,
    items: raw.items || raw.Items || [],
    queue_stat: raw.queue_stat || raw.QueueStat || raw.queueStat || null
  }
}

function rowKey(row, index) {
  const sub = row?.submission || {}
  return sub.id || sub.ID || `${sub.plan_id || sub.PlanID || 'p'}-${sub.created_at || sub.CreatedAt || index}`
}

/** 确保登录状态 */
async function ensureLogin() {
  const token = uni.getStorageSync('token') || ''
  if (!token) {
    global.isLogin = false
    return false
  }
  if (!global.isLogin && typeof asyncGetUserInfo === 'function') {
    await asyncGetUserInfo()
  }
  return !!global.isLogin
}

/** 状态读取 */
function getSubmissionStatus(sub) {
  if (!sub) return 0
  return Number(sub.status ?? sub.Status ?? 0)
}
function isOngoing(sub) {
  const st = getSubmissionStatus(sub)
  return st === 0 || st === 1 || st === 2 || st === 3
}
function isFinishedStatus(sub) {
  const st = getSubmissionStatus(sub)
  return st === 4 || st === 5 || st === 6 || st === 7
}

/** 二级 tab 过滤（接口已按 artist_type 过滤；这里仅按状态过滤） */
const filteredList = computed(() => {
  let list = submissionList.value
  if (activeStatusTab.value === 'ongoing') {
    list = list.filter(row => isOngoing(row.submission))
  } else if (activeStatusTab.value === 'finished') {
    list = list.filter(row => isFinishedStatus(row.submission))
  }
  return list
})
function changeStatusTab(key) {
  activeStatusTab.value = key
}

/** 动画延迟 */
function subCardStyle(index) {
  const delay = index * 80
  return { animationDelay: delay + 'ms' }
}

/** 请求封装 */
async function requestMySubmissions(params) {
  const token = uni.getStorageSync('token') || ''
  return await uni.request({
    url: `${websiteUrl.value}${API_PATH}`,
    method: 'GET',
    header: { Authorization: token },
    data: params
  })
}

function parsePageIndex(p, fallback) {
  const v = Number(p.page ?? p.pageIndex ?? p.Page ?? p.PageIndex ?? fallback ?? 1)
  return v > 0 ? v : 1
}
function parseTotal(p, fallback) {
  const v = Number(p.total ?? p.Total ?? fallback ?? 0)
  return v >= 0 ? v : 0
}

/** 拉取某类型 total（只拉一次，total=0 也算已加载） */
async function fetchTotalForType(tab) {
  if (typeTotalsLoaded.value[tab] || typeTotalsLoading.value[tab]) return

  const ok = await ensureLogin()
  if (!ok) return

  typeTotalsLoading.value = { ...typeTotalsLoading.value, [tab]: true }

  const artistType = tabToArtistType(tab)
  try {
    const res = await requestMySubmissions({
      page: 1,
      pageIndex: 1,
      page_size: 1,
      pageSize: 1,
      size: 1,
      artist_type: artistType
    })
    if (String(res.data?.status).toLowerCase() !== 'success') return
    const p = res.data?.data?.page || {}
    const t = parseTotal(p, 0)

    typeTotals.value = { ...typeTotals.value, [tab]: t }
    typeTotalsLoaded.value = { ...typeTotalsLoaded.value, [tab]: true }
  } catch (e) {
    console.warn('[orders-panel] fetchTotalForType failed:', e)
  } finally {
    typeTotalsLoading.value = { ...typeTotalsLoading.value, [tab]: false }
  }
}

/** 拉取列表（只负责当前 tab 列表 + 当前 tab total 回填） */
async function fetchList(reset = false) {
  if (loading.value) return

  const ok = await ensureLogin()
  if (!ok) {
    if (reset) {
      submissionList.value = []
      page.value = 1
      total.value = 0
      typeTotals.value = { bjd: 0, hair: 0 }
      typeTotalsLoaded.value = { bjd: false, hair: false }
    }
    uni.stopPullDownRefresh()
    return
  }

  if (reset) {
    page.value = 1
    submissionList.value = []
    total.value = 0
  }

  loading.value = true

  const currentTab = activeOrderTypeTab.value
  const artistType = tabToArtistType(currentTab)

  try {
    const res = await requestMySubmissions({
      page: page.value,
      pageIndex: page.value,
      page_size: pageSize,
      pageSize: pageSize,
      size: pageSize,
      artist_type: artistType
    })

    if (String(res.data?.status).toLowerCase() !== 'success') {
      uni.showToast({ title: res.data?.msg || '加载失败', icon: 'none' })
      return
    }

    const data = res.data?.data || {}
    const rawRows = Array.isArray(data.list) ? data.list : []
    const rows = rawRows.map(normalizeRow)
    const p = data.page || {}

    if (reset) {
      submissionList.value = rows
    } else {
      submissionList.value = submissionList.value.concat(rows)
    }

    const newTotal = parseTotal(p, rows.length)
    total.value = newTotal

    // 当前 tab 的 total 直接用 page.total 回填，并标记已加载（即便为 0）
    typeTotals.value = { ...typeTotals.value, [currentTab]: newTotal }
    typeTotalsLoaded.value = { ...typeTotalsLoaded.value, [currentTab]: true }

    const currentPage = parsePageIndex(p, page.value)
    page.value = currentPage + 1
  } catch (e) {
    console.error('[orders-panel] fetchList failed:', e)
    uni.showToast({ title: '网络异常，加载失败', icon: 'none' })
  } finally {
    loading.value = false
    uni.stopPullDownRefresh()
  }
}

/**
 * 统一刷新入口：避免 onMounted/onShow/watch 重复触发导致多次请求
 * - 同一个 tab + reset 在短时间内重复触发会被去重
 */
const lastRefreshKey = ref('')
const lastRefreshAt = ref(0)
let refreshPromise = null

function buildRefreshKey(reset) {
  return `${activeOrderTypeTab.value}|${reset ? 'reset' : 'more'}`
}

async function refresh(reset = true, reason = '') {
  if (!props.active) return
  if (refreshPromise) return refreshPromise

  const key = buildRefreshKey(reset)
  const now = Date.now()

  // 去重窗口：避免 mounted + show 这种紧挨着触发
  if (key === lastRefreshKey.value && now - lastRefreshAt.value < 800) {
    return
  }
  lastRefreshKey.value = key
  lastRefreshAt.value = now

  refreshPromise = (async () => {
    await fetchList(reset)

    // 确保另一种类型的 total 也拿到（只拉一次，避免 total=0 时不断拉）
    const ot = otherTab(activeOrderTypeTab.value)
    await fetchTotalForType(ot)
  })().finally(() => {
    refreshPromise = null
  })

  return refreshPromise
}

/** plan 对象（新结构：submission.plan） */
function getPlanObj(row) {
  const sub = row?.submission || {}
  return sub.plan || sub.Plan || {}
}

function mainTitle(row) {
  const plan = getPlanObj(row)
  return plan.artist_name || plan.ArtistName || plan.plan_title || plan.PlanTitle || '未命名计划'
}

function firstRefImage(it) {
  const raw = it?.ref_images || it?.RefImages || ''
  if (!raw) return ''
  return String(raw).split(',')[0].trim()
}
function firstPlanImage(plan) {
  const raw = plan?.images || plan?.Images || ''
  if (!raw) return ''
  return String(raw).split(',')[0].trim()
}

function cardCover(row) {
  const items = row?.items || []
  if (items.length > 0) {
    const img = firstRefImage(items[0])
    if (img) return img
  }
  const plan = getPlanObj(row)
  const pImg = firstPlanImage(plan)
  return pImg || ''
}

function itemsCount(row) {
  const items = row?.items || []
  return items.length || 0
}

/** 状态 pill：统一短文案，避免折行 */
function statusPillText(row) {
  const st = getSubmissionStatus(row?.submission)
  switch (st) {
    case 0: return '排队中'
    case 1: return '已中选'
    case 2: return '待确认'
    case 3: return '待付款'
    case 4: return '已付款'
    case 5: return '失败'
    case 6: return '已取消'
    case 7: return '超时'
    default: return '未知'
  }
}

/** 金额：无价格时显示 0￥（不再显示横杠） */
function calcRowTotalAmount(row) {
  const items = row?.items || []
  if (items.length === 0) return 0

  let sum = 0
  items.forEach(it => {
    const priceTotal = Number(it?.price_total ?? it?.PriceTotal ?? it?.priceTotal ?? 0)
    const adjustPrice = Number(it?.adjust_price ?? it?.AdjustPrice ?? it?.adjustPrice ?? 0)
    sum += (isNaN(priceTotal) ? 0 : priceTotal) + (isNaN(adjustPrice) ? 0 : adjustPrice)
  })
  return sum
}

function formatMoney(n) {
  const num = Number(n || 0)
  if (!isFinite(num)) return '0￥'
  // 规则：整数不显示 .00；否则保留两位并去掉末尾 0
  const s = num.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1')
  return `${s}￥`
}

function cardAmount(row) {
  return formatMoney(calcRowTotalAmount(row))
}

/** 详情页跳转 */
function goSubmissionDetail(row) {
  const sub = row?.submission || {}
  const id = sub.id || sub.ID
  if (!id) return
  const url = `/pkg-creator/creator_order/submission_detail/submission_detail?submission_id=${id}`
  // #ifdef H5
  window.location.hash = url
  // #endif
  // #ifndef H5
  uni.navigateTo({ url })
  // #endif
}

function jumpToAnnouncement() {
  uni.navigateTo({ url: '/pages/article_detail/article_detail?id=3' })
}

/** 生命周期：只触发 refresh()，由 refresh 内部去重，避免首屏 4 次请求 */
onMounted(() => {
  if (props.active) refresh(true, 'mounted')
})

onShow(() => {
  if (props.active) refresh(true, 'show')
})

watch(
  () => props.active,
  val => {
    if (val) refresh(true, 'active')
  }
)

watch(
  () => activeOrderTypeTab.value,
  () => {
    if (!props.active) return
    refresh(true, 'tab')
  }
)

onPullDownRefresh(() => {
  if (!props.active) {
    uni.stopPullDownRefresh()
    return
  }
  refresh(true, 'pull')
})

onReachBottom(() => {
  if (!props.active || finished.value) return
  fetchList(false)
})
</script>

<style lang="scss" scoped>
.orders-panel { padding: 0 40rpx 40rpx; }

/* 顶部统计卡片 */
.summary-card {
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  background: #ffffff;
  border-radius: 32rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.04);
  padding: 24rpx 40rpx;
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  margin-top: 6rpx;
  margin-bottom: 32rpx;
}

.summary-item { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.summary-number { font-size: 40rpx; font-weight: 700; color: #d0d0d0; }
.summary-label { margin-top: 10rpx; font-size: 24rpx; color: #d0d0d0; }

.summary-item-active .summary-number,
.summary-item-active .summary-label { color: #222222; }

.summary-divider { width: 2rpx; height: 60rpx; background: #f2f2f2; }

/* 二级 Tab */
.second-tabs { margin: 12rpx 0 20rpx; display: flex; align-items: center; }
.second-tab { padding: 10rpx 24rpx; border-radius: 999rpx; margin-right: 16rpx; background: #f5f6fa; }
.second-tab-text { font-size: 24rpx; color: #b3b3b3; }
.second-tab-active { background: #ffffff; box-shadow: 0 4rpx 12rpx rgba(15, 35, 95, 0.06); }
.second-tab-active .second-tab-text { color: #333333; }

.orders-list-wrap { padding-bottom: 10rpx; }

.empty-wrap { padding: 30rpx 0; }
.status-empty { padding-top: 10rpx; }

.empty-card {
  border-radius: 24rpx;
  padding: 32rpx 28rpx;
  background: #ffffff;
  box-shadow: 0 12rpx 30rpx rgba(15, 35, 95, 0.06);
  align-items: center;
}

.empty-title { font-size: 30rpx; font-weight: 600; color: #505050; display: block; text-align: center; }
.empty-desc { margin-top: 10rpx; font-size: 26rpx; color: #999999; line-height: 1.7; display: block; text-align: center; }

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.sub-card {
  margin-bottom: 24rpx;
  padding: 0;
  display: flex;
  align-items: center;

  opacity: 0;
  transform: translateY(16rpx);
  animation-name: fadeInUp;
  animation-duration: 0.32s;
  animation-timing-function: ease;
  animation-fill-mode: forwards;
}

.sub-card-left {
  width: 140rpx;
  height: 140rpx;
  margin-right: 32rpx;
  border-radius: 12rpx;
  border: 4rpx solid #6b8cff;
  background: #d9d9d9;
  overflow: hidden;
  flex-shrink: 0;
}
.sub-thumb { width: 100%; height: 100%; }

.sub-card-middle {
  flex: 1;
  height: 140rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  min-width: 0;
  margin: 0;
  padding: 0;
}

/* 第一行：状态 + 标题 */
.sub-title-row {
  display: flex;
  align-items: center;
  min-width: 0;
  margin: 0 0 8rpx 0;
}

/* 关键修复：pill 不折行、不基线错位 */
.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40rpx;
  padding: 0 16rpx;
  border-radius: 999rpx;
  background: #8fd7ff;
  color: #ffffff;
  font-size: 22rpx;
  line-height: 40rpx;
  white-space: nowrap;
  flex-shrink: 0;
  margin-right: 16rpx;
  box-sizing: border-box;
}

/* 标题：调小字号，避免“太大” */
.sub-main-title {
  flex: 1;
  min-width: 0;
  font-size: 28rpx;
  font-weight: 700;
  color: #000000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sub-subtitle-row { display: flex; align-items: baseline; margin: 0; }
.sub-meta-text { font-size: 28rpx; color: #000000; }
.sub-meta-text + .sub-meta-text { margin-left: 26rpx; }
.price-text { font-weight: 700; }

.sub-card-right {
  flex-shrink: 0;
  width: 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-left: 8rpx;
}

.list-footer { padding: 12rpx 0 10rpx; text-align: center; }
.footer-loading { display: flex; justify-content: center; align-items: center; }
.footer-text { font-size: 22rpx; color: #a1a9b3; }


.announcement-text {
  font-size: 34rpx;
  font-weight: 900;
  color: #7d7d7d;
  letter-spacing: 4rpx;
  position: relative;
  z-index: 2;
  text-align: right;
}
</style>
