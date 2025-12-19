<template>
  <view class="artist-page">
    <view class="head-container">
      <zhouWei-navBar
        type="transparentFixed"
        :backState="2000"
        :homeState="2000"
        :scrollTop="scrollTop"
        fontColor="#000"
        transparentFixedFontColor="#000"
        :titleCenter="true"
      >
        <!-- 左侧：返回按钮 + “BJD毛娘”文字 -->
        <template #left>
          <view class="nav-left">
            <view class="nav-back-pill" @click="goBack" aria-label="返回">
              <image
                src="/static/artist/left.png"
                mode="aspectFill"
                style="width: 14rpx;height: 14rpx;position: relative;top: 3rpx;"
              ></image>
            </view>
            <text class="nav-back-text font-title" @click="goBack">BJD毛娘</text>
          </view>
        </template>

        <!-- 右侧：分享按钮 -->
        <template #right>
          <common-share v-if="shareBtnVisible" @click="shareClick" />
        </template>

        <!-- 顶部透明层左侧（吸顶时显示） -->
        <template #transparentFixedLeft>
          <view class="nav-left">
            <view class="nav-back-pill" @click="goBack" aria-label="返回">
              <image
                src="/static/artist/left.png"
                mode="aspectFill"
                style="width: 14rpx;height: 14rpx;position: relative;top: 3rpx; "
              ></image>
            </view>
            <text class="nav-back-text font-title" @click="goBack">BJD毛娘</text>
          </view>
        </template>
        <template #transparentFixedRight>
          <common-share v-if="shareBtnVisible" @click="shareClick" />
        </template>

        <!-- 默认槽：中间吸顶标题（随滚动淡入） -->
        <template #default>
          <view class="nav-center">
            <image class="nav-center-avatar" :src="info.logo_image || defaultAvatar" mode="aspectFill" />
            <text class="nav-center-name font-alimamashuhei">{{ info.brand_name || '—' }}</text>
          </view>
        </template>

        <!-- 透明层中间（可留空） -->
        <template #transparentFixed>
          <!-- 可按需放内容，这里留空 -->
        </template>
      </zhouWei-navBar>

      <common-placeholder></common-placeholder>

      <!-- 头像 + 信息卡片 -->
      <view class="header">
        <view class="avatar-wrap">
          <image class="avatar" :src="info.logo_image || defaultAvatar" mode="aspectFill" />
        </view>

        <view class="info-card">
          <view class="row-1">
            <text class="brand-name font-alimamashuhei">{{ info.brand_name || '—' }}</text>
            <text class="last-time">{{ lastLoginText }}</text>
          </view>

          <view class="row-2">
            <view class="stat">
              <text class="label font-title">完成单数</text>
              <text class="val">{{ info.artist_stats?.finished_count ?? 0 }}</text>
            </view>
            <view class="stat">
              <text class="label font-title">平均工期</text>
              <text class="val">{{ avgCycleDaysText }}</text>
            </view>
            <view class="stat">
              <text class="label font-title">准时率</text>
              <text class="val">{{ punctualityRateText }}</text>
            </view>
          </view>

          <view v-if="info.description" class="desc">{{ info.description }}</view>
        </view>
      </view>

      <!-- 档期（横向滚动） -->
      <view class="calendar-card">
        <view class="cal-title font-title">档期</view>
        <scroll-view scroll-x class="month-row-scroll" :show-scrollbar="false">
          <view class="month-row">
            <view
              v-for="m in monthBusyList"
              :key="m.key"
              class="month-pill"
              :class="{ current: m.isCurrent }"
            >
              <view class="m1 font-title">{{ m.label }}</view>
              <view class="m2 font-title">{{ m.busy_days }}/{{ m.total_days }}</view>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 其它身份 -->
    <view class="identity-card">
      <view class="id-title font-title">其它身份</view>
      <view class="id-row">
        <!-- 贩售 -->
        <view
          class="id-pill"
          :class="{ 'id-pill--disabled': !identity.is_brand }"
          @click="identity.is_brand && goRole('shop')"
        >
          <image class="id-img" src="/static/artist/iconify-uil_shop.png"></image>
          <text class="font-title">贩售</text>
        </view>
        <!-- 毛娘（当前页） -->
        <view
          class="id-pill"
          :class="{ 'id-pill--disabled': !identity.is_bjd_hairstylist }"
          @click="identity.is_bjd_hairstylist && goRole('hair')"
        >
          <image class="id-img" src="/static/artist/wig.png"></image>
          <text class="font-title">手改毛</text>
        </view>
        <!-- 妆师 -->
        <view
          class="id-pill"
          :class="{ 'id-pill--disabled': !identity.is_bjd_artist }"
          @click="identity.is_bjd_artist && goRole('artist')"
        >
          <image class="id-img" src="/static/artist/pen.png"></image>
          <text class="font-title">妆师</text>
        </view>
      </view>
    </view>

    <view style="margin: 20rpx;">
      <!-- 展示图片 / 开单记录 - 顶部 Tab -->
      <view style="margin-left: 01rpx;">
        <view
          :class="['tab-btn', 'font-title', { active: listTab === 'images' }]"
          @click="switchListTab('images')"
        >
          <text class="label">展示图片</text>
          <view class="ink-ellipse"></view>
        </view>

        <view
          :class="['tab-btn', 'font-title', { active: listTab === 'orders' }]"
          @click="switchListTab('orders')"
        >
          <view v-if="hasOrderDot" class="red-dot"></view>
          <text class="label">开单记录</text>
          <view class="ink-ellipse"></view>
        </view>
      </view>

      <!-- 毛图网格（仅首图） -->
      <view v-if="listTab === 'images'" class="grid">
        <view
          v-for="item in wigs"
          :key="item.id"
          class="grid-item"
          @click="navigateToWig(item.id)"
        >
          <image class="grid-img" :src="item.previewUrl" mode="aspectFill" />
        </view>

        <view v-if="loadingMore" class="grid-tip">
          <uni-load-more status="loading" />
        </view>
        <view v-else-if="!hasMore && wigs.length" class="grid-tip">— 已到底 —</view>
      </view>

      <!-- 开单记录列表 -->
      <view v-else class="order-list">
        <view
          v-for="p in orderPlans"
          :key="p.id"
          class="order-card"
          @click="openOrder(p.id)"
        >
          <image
            class="order-cover"
            :src="p.images?.[0] || info.logo_image"
            mode="aspectFill"
          />
          <view class="order-body">
            <view class="order-title font-title">{{ p.brand_name }} · 开单</view>
            <view class="order-meta">
              <text class="chip font-alimamashuhei" :class="statusClass(p)">
                {{ statusText(p) }}
              </text>
              <text class="time">开：{{ formatTime(p.open_time) }}</text>
              <text class="time">截：{{ formatTime(p.close_time) }}</text>
            </view>
            <view class="tier-line font-alimamashuhei">{{ tierRange(p) }}</view>
          </view>
        </view>

        <view v-if="orderLoadingMore" class="grid-tip">
          <uni-load-more status="loading" />
        </view>
        <view
          v-else-if="!orderHasMore && orderPlans.length"
          class="grid-tip"
        >— 没有更多记录 —</view>
        <view
          v-else-if="!orderPlans.length && !orderLoadingMore"
          class="grid-tip"
        >暂无记录</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { onLoad, onReachBottom, onPageScroll, onShow } from '@dcloudio/uni-app'
import { websiteUrl } from '@/common/config.js'
import { useCrossShare } from '@/common/share.js'

/** 路由 & 导航滚动 */
const brandId = ref(0)
const scrollTop = ref(0)
onPageScroll(e => (scrollTop.value = e.scrollTop || 0))
const goBack = () => uni.navigateBack({ delta: 1 })

// 分享逻辑（这里仍示例单个作品分享，可按需扩展）
const pageId = ref('1')
const detail = ref({
  title: '超好看的作品',
  images: ['https://images1.fantuanpu.com/artist/demo-cover.jpg']
})

const { setupMpShare, shareBtnVisible, shareClick } = useCrossShare(() => ({
  title: `BJD毛娘 · ${detail.value.title || '精选'}`,
  summary: '看看这个作品，超好看～',
  imageUrl: detail.value.images?.[0],
  // 这里示例跳转到毛娘作品详情页（按你的实际页面改）
  path: `/pages/custom_wig/detail?id=${pageId.value}`
}))
setupMpShare()

/** 顶部信息 + 身份标记 */
const info = reactive({
  brand_id: 0,
  brand_name: '',
  description: '',
  logo_image: '',
  last_login_time: 0,
  artist_stats: null
})

const identity = reactive({
  is_brand: 0,
  is_bjd_artist: 0,
  is_bjd_hairstylist: 0
})

const defaultAvatar = 'https://images1.fantuanpu.com/brand-avatar/default'

const lastLoginText = computed(() => {
  const ts = Number(info.last_login_time || 0)
  if (!ts) return '未入驻'
  return timeAgo(ts * 1000)
})
const avgCycleDaysText = computed(() => {
  const d = Number(info.artist_stats?.avg_cycle_days || 0)
  return d ? `${toFixed2(d)}天` : '—'
})
const punctualityRateText = computed(() => {
  const r = Number(info.artist_stats?.punctuality_rate || 0)
  return `${Math.round(r * 100)}%`
})

/** 列表 Tab（图片 / 订单） */
const listTab = ref('images')
const switchListTab = async tab => {
  listTab.value = tab
  if (tab === 'orders' && orderPlans.value.length === 0) {
    await fetchOrderPlans()
  }
}

/** 毛图列表（仅首图） */
const wigs = ref([]) // { id, previewUrl }
const page = ref(1)
const size = ref(30)
const hasMore = ref(true)
const loadingMore = ref(false)

function mapWigs(list = []) {
  return list
    .map(it => {
      const first =
        it.cover_image ||
        (it.custom_wig_images && it.custom_wig_images[0]) ||
        ''
      return first
        ? {
            id: it.id,
            previewUrl: first
          }
        : null
    })
    .filter(Boolean)
}

/** 档期（月度忙碌天数） */
const monthBusyList = ref([]) // [{key,label,isCurrent,busy_days,total_days}]
const MONTH_NAMES = [
  '一月',
  '二月',
  '三月',
  '四月',
  '五月',
  '六月',
  '七月',
  '八月',
  '九月',
  '十月',
  '十一月',
  '十二月'
]

/** 工具函数 */
function toFixed2(v) {
  const n = parseFloat(v)
  return Number.isNaN(n) ? 0 : Math.round(n * 100) / 100
}

function timeAgo(ms) {
  const diff = Date.now() - ms
  if (diff < 0) return '刚刚'
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s} 秒前`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m} 分钟前`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} 小时前`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d} 天前`
  const mo = Math.floor(d / 30)
  if (mo < 12) return `${mo} 月前`
  return `${Math.floor(mo / 12)} 年前`
}

function formatTime(ts) {
  if (!ts) return '--'
  const d = new Date(ts * 1000)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${mm}/${dd} ${hh}:${mi}`
}

/** === 请求：info（带身份标记） === */
async function fetchInfo() {
  const res = await uni.request({
    url: `${websiteUrl.value}/brand-artist/info`,
    method: 'GET',
    data: {
      brand_id: brandId.value
    }
  })
  if (String(res.data?.status).toLowerCase() !== 'success') {
    uni.showToast({
      title: res.data?.msg || '加载失败',
      icon: 'none'
    })
    return
  }
  const d = res.data.data || {}

  info.brand_id = d.brand_id || d.brand?.id || 0
  info.brand_name = d.brand_name || d.brand?.brand_name || ''
  info.description = d.description || d.brand?.description || ''
  info.logo_image = d.logo_image || d.brand?.logo_image || ''
  info.last_login_time = Number(d.last_login_time || 0)
  info.artist_stats = d.artist_stats || null

  // 身份字段：优先顶层，没有则读 brand 内部
  identity.is_brand = Number(
    d.is_brand ?? (d.brand && d.brand.is_brand) ?? 0
  )
  identity.is_bjd_artist = Number(
    d.is_bjd_artist ?? (d.brand && d.brand.is_bjd_artist) ?? 0
  )
  identity.is_bjd_hairstylist = Number(
    d.is_bjd_hairstylist ??
      (d.brand && d.brand.is_bjd_hairstylist) ??
      0
  )
}

/** 毛图列表：/brand-artist/custom-wig */
async function fetchWigs() {
  if (!hasMore.value || loadingMore.value) return
  loadingMore.value = true
  const res = await uni.request({
    url: `${websiteUrl.value}/brand-artist/custom-wig`,
    method: 'GET',
    data: {
      brand_id: brandId.value,
      page: page.value,
      size: size.value
    }
  })
  loadingMore.value = false
  if (String(res.data?.status).toLowerCase() !== 'success') {
    uni.showToast({
      title: res.data?.msg || '加载失败',
      icon: 'none'
    })
    return
  }
  const list = mapWigs(res.data?.data?.list || [])
  wigs.value = [...wigs.value, ...list]
  const total = Number(res.data?.data?.total || wigs.value.length)
  hasMore.value = wigs.value.length < total
  if (hasMore.value) page.value += 1
}

/** 档期接口（横向数据） */
async function fetchMonthlyBusy() {
  const now = new Date()
  const startMonth = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, '0')}`
  const months = 6
  const res = await uni.request({
    url: `${websiteUrl.value}/brand-artist/monthly-busy`,
    method: 'GET',
    data: {
      brand_id: brandId.value,
      start_month: startMonth,
      months
    }
  })

  let rows = []
  if (String(res.data?.status).toLowerCase() === 'success') {
    rows = res.data?.data?.list || []
  }
  if (!rows.length) {
    for (let i = 0; i < months; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i + 1, 0)
      rows.push({
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        busy_days: 0,
        total_days: d.getDate()
      })
    }
  }
  monthBusyList.value = rows.map((r, idx) => {
    const isCurrent = idx === 0
    const label = isCurrent
      ? '本月'
      : MONTH_NAMES[(Number(r.month) - 1 + 12) % 12]
    return {
      key: `${r.year}-${r.month}`,
      label,
      isCurrent,
      busy_days: Number(r.busy_days || 0),
      total_days: Number(r.total_days || 30)
    }
  })
}

/** 开单记录（毛娘：artist_type = 2） */
const orderPlans = ref([])
const orderPage = ref(1)
const orderSize = ref(5)
const orderHasMore = ref(true)
const orderLoadingMore = ref(false)
const hasOrderDot = ref(false)

function statusText(p) {
  const now = Math.floor(Date.now() / 1000)
  if (now >= p.open_time && now <= p.close_time) return '进行中'
  if (now < p.open_time) return '即将开始'
  return '已结束'
}

function statusClass(p) {
  const t = statusText(p)
  return {
    ongoing: t === '进行中',
    upcoming: t === '即将开始',
    ended: t === '已结束'
  }
}

function tierRange(p) {
  const prices = (p.tiers || [])
    .map(t => Number(t.price || 0))
    .filter(n => !Number.isNaN(n))
  if (!prices.length) return '未设置档位'
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return `¥${min}${min !== max ? `~${max}` : ''} · ${prices.length}档`
}

async function fetchOrderPlans() {
  if (!orderHasMore.value || orderLoadingMore.value) return
  orderLoadingMore.value = true
  const res = await uni.request({
    url: `${websiteUrl.value}/brand-artist/order-plans`,
    method: 'GET',
    data: {
      brand_id: brandId.value,
      artist_type: 2, // 2 = 毛娘
      page: orderPage.value,
      size: orderSize.value
    }
  })
  orderLoadingMore.value = false
  if (String(res.data?.status).toLowerCase() !== 'success') {
    uni.showToast({
      title: res.data?.msg || '加载失败',
      icon: 'none'
    })
    return
  }
  const list = res.data?.data || []
  orderPlans.value = [...orderPlans.value, ...list]

  const now = Math.floor(Date.now() / 1000)
  const soon = 7 * 24 * 3600
  hasOrderDot.value = orderPlans.value.some(
    p =>
      (now >= p.open_time && now <= p.close_time) ||
      (p.open_time > now && p.open_time - now <= soon)
  )

  if (list.length < orderSize.value) {
    orderHasMore.value = false
  } else {
    orderPage.value += 1
  }
}

function openOrder(id) {
  uni.navigateTo({
    url: `/pkg-creator/creator_order/plan_detail/plan_detail?id=${id}`
  })
}

/** 图片预览 */
function preview(url) {
  const urls = wigs.value.map(i => i.previewUrl)
  const current = urls.indexOf(url)
  uni.previewImage({
    urls,
    current: current >= 0 ? current : 0
  })
}

/** 其它身份跳转 */
function goRole(type) {
  if (!info.brand_id) return
  const urlMap = {
    // H5 对应：/#/pages/brand/brand?brand_id=1
    shop: `/pages/brand/brand?brand_id=${info.brand_id}`,
    // H5 对应：/#/pages/artist_info/bjd_faceup_artist?brand_id=1
    artist: `/pages/artist_info/bjd_faceup_artist?brand_id=${info.brand_id}`,
    // H5 对应：/#/pages/artist_info/custom_wig_artist?brand_id=1
    hair: `/pages/artist_info/custom_wig_artist?brand_id=${info.brand_id}`
  }
  const url = urlMap[type]
  if (!url) return
  // 当前已经在毛娘页，再点“手改毛”就不再重复跳转
  if (type === 'hair') return
  uni.navigateTo({ url })
}

/** 毛图点击跳转到详情 */
const navigateToWig = id => {
  uni.navigateTo({
    // 按你的实际路由来，这里用 custom_wig 详情示例
    url: `/pages/custom_wig/detail?id=${id}`
  })
}
// 记录是否已经通过路由参数完成初始化
const inited = ref(false)

// 首次进入页面时，从路由参数中读取 brand_id
onLoad(async (options) => {
  const bid = Number(options?.brand_id || 0)
  if (!bid) {
    uni.showToast({
      title: '缺少 brand_id',
      icon: 'none'
    })
    // 看你需求要不要直接返回上一页
    // uni.navigateBack()
    return
  }
  brandId.value = bid
  inited.value = true

  uni.showLoading({ title: '加载中...' })
  try {
    await fetchInfo()
    await Promise.all([fetchMonthlyBusy(), fetchWigs(), fetchOrderPlans()])
  } finally {
    uni.hideLoading()
  }
})

onShow(async () => {
  uni.showLoading({ title: '加载中...' })
  try {
    await fetchInfo()
    await Promise.all([fetchMonthlyBusy(), fetchWigs(), fetchOrderPlans()])
  } finally {
    uni.hideLoading()
  }
})

onReachBottom(() => {
  if (listTab.value === 'images') fetchWigs()
  else fetchOrderPlans()
})
</script>

<style lang="less" scoped>
.artist-page {
  min-height: 100vh;
  padding-bottom: env(safe-area-inset-bottom);
}

.head-container {
  background: url('/static/bg.png');
  background-size: cover;
  background-repeat: no-repeat;
}

.font-title {
  font-weight: 200;
  color: #3f3f3f;
}

.nav-back-pill {
  width: 64rpx;
  height: 64rpx;
  border-radius: 9999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

/* 头部 */
.header {
  padding: 120rpx 24rpx 0;
  position: relative;
}

.avatar-wrap {
  position: absolute;
  left: 68rpx;
  top: 10rpx;
  transform: translateY(72rpx);
  z-index: 2;
}

.avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 100%;
  background: #f3f5f7;
  box-shadow: 0 0 0 !important;
}

.info-card {
  position: relative;
  background: #fff;
  border-radius: 15rpx;
  padding: 12rpx 24rpx 24rpx 220rpx;
  box-shadow: 0 0rpx 5rpx rgba(0, 0, 0, 0.06);
  min-height: 120rpx;
}

.row-1 {
  display: flex;
  align-items: baseline;
  gap: 16rpx;
  flex-wrap: wrap;
}

.brand-name {
  margin-left: 20rpx;
  font-size: 32rpx;
  font-weight: 800;
  color: #666;
}

.last-time {
  font-size: 26rpx;
  color: #7a7a7a;
}

.row-2 {
  margin-top: 18rpx;
  display: flex;
  gap: 28rpx;
  flex-wrap: wrap;
}

.stat {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.label {
  font-size: 24rpx;
  color: #8c8c8c;
  translation: all 0.3s;
}

.val {
  font-size: 20rpx;
  color: #333;
  font-weight: 600;
}

.desc {
  margin-top: 18rpx;
  font-size: 26rpx;
  color: #3f3f3f;
  line-height: 1.7;
}

/* 身份 */
.identity-card {
  margin: 20rpx 24rpx 0;
  border-radius: 15rpx;
  padding: 24rpx;
}

.id-title {
  font-size: 32rpx;
  color: #333;
  margin-bottom: 16rpx;
}

.id-row {
  display: flex;
  gap: 24rpx;
}

.id-pill {
  background: #fff;
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 16rpx 22rpx;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #333;
}

.id-pill--disabled {
  opacity: 0.4;
}

/* 图标 */
.id-img {
  width: 34rpx;
  height: 34rpx;
  flex-shrink: 0;
  display: block;
  object-fit: contain;
  border-radius: 8rpx;
  background: transparent;
  image-rendering: -webkit-optimize-contrast;
  pointer-events: none;
}

.calendar-card {
  margin: 20rpx 24rpx 0;
  border-radius: 15rpx;
  padding: 24rpx 0 24rpx 24rpx;
}

.cal-title {
  font-size: 32rpx;
  color: #333;
  margin-bottom: 16rpx;
  padding-right: 24rpx;
}

.month-row-scroll {
  white-space: nowrap;
}

.month-row {
  display: flex;
  gap: 20rpx;
  padding-right: 24rpx;
}

.month-pill {
  width: 100rpx;
  border-radius: 0rpx;
  background: #fff;
  padding: 12rpx 8rpx;
  text-align: center;
}

.month-pill.current {
  background: #fff;
}

.m1 {
  font-size: 24rpx;
  color: #333;
}

.m2 {
  font-size: 20rpx;
  color: #666;
  margin-top: 6rpx;
}

/* Tab */
.list-tabs {
  margin: 20rpx 24rpx 0 20rpx;
  display: flex;
  gap: 40rpx;
  position: relative;
}

.tab-btn {
  margin-left: 20rpx;
  position: relative;
  padding: 8rpx 6rpx 24rpx;
  transition: all 0.3s;
  display: inline-block;
}

.tab-btn .label {
  font-size: 32rpx;
  color: #a0a7af;
  position: relative;
  z-index: 2;
  transition: color 0.22s ease;
}

.tab-btn.active .label {
  color: #000;
}

/* ink 椭圆 */
.tab-btn .ink-ellipse {
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 32rpx;
  height: 82rpx;
  background: rgba(168, 255, 252, 1);
  border-radius: 50%;
  transform: translateX(-50%) rotate(60deg) scale(0.7);
  opacity: 0;
  transition:
    transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 0.22s ease;
  will-change: transform, opacity;
}

.tab-btn.active .ink-ellipse {
  transform: translateX(-50%) rotate(60deg) scale(1);
  opacity: 1;
}

/* 红点 */
.red-dot {
  position: absolute;
  right: -6rpx;
  top: 0;
  width: 12rpx;
  height: 12rpx;
  border-radius: 9999rpx;
  background: #ff4d4f;
  box-shadow: 0 0 0 2rpx #fff;
}

/* 毛图网格 */
.grid {
  padding: 24rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.grid-item {
  width: calc((100% - 20rpx) / 3);
  aspect-ratio: 4 / 5;
  border-radius: 0rpx;
  overflow: hidden;
  background: #f3f5f7;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.04);
}

.grid-img {
  width: 100%;
  height: 100%;
}

.grid-tip {
  width: 100%;
  text-align: center;
  color: #909399;
  font-size: 24rpx;
  padding: 20rpx 0;
}

/* 开单记录 */
.order-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.order-card {
  display: flex;
  gap: 16rpx;
  background: #fff;
  border-radius: 14rpx;
  overflow: hidden;
  box-shadow: 0 10rpx 24rpx rgba(0, 0, 0, 0.04);
  padding: 10px;
}

.order-cover {
  width: 240rpx;
  height: 180rpx;
  object-fit: cover;
  border-radius: 10rpx;
}

.order-body {
  flex: 1;
  padding: 0rpx 16rpx 0rpx 0;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.order-title {
  font-size: 30rpx;
  color: #111;
}

.order-meta {
  display: flex;
  align-items: center;
  gap: 14rpx;
  flex-wrap: wrap;
}

.chip {
  padding: 6rpx 12rpx;
  border-radius: 9999rpx;
  font-size: 22rpx;
}

.chip.ongoing {
  background: #ccffcf;
  color: #577454;
}

.chip.upcoming {
  background: #cce4ff;
  color: #86b4ff;
}

.chip.ended {
  background: #f5f5f5;
  color: #888;
}

.time {
  font-size: 24rpx;
  color: #666;
}

.tier-line {
  font-size: 24rpx;
  color: #333;
}

.nav-left {
  display: flex;
  align-items: center;
}

.nav-back-text {
  font-size: 24rpx;
  font-weight: 700;
  color: #000;
}

/* 吸顶标题 */
.nav-center {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.nav-center-avatar {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #f3f5f7;
}

.nav-center-name {
  font-size: 28rpx;
  font-weight: 700;
  color: #111;
}

.nav-share-pill {
  margin: 30rpx;
}
</style>
