<template>
  <view-logs />
  <view :class="['artist-page', `artist-page--${activeRole}`]">
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
        <template #left>
          <view class="nav-left">
            <view class="nav-back-pill" @click="goBack" aria-label="返回">
              <image
                src="/static/artist/left.png"
                mode="aspectFill"
                style="width: 14rpx;height: 14rpx;position: relative;top: 3rpx;"
              ></image>
            </view>
            <text class="nav-back-text font-title" @click="goBack">返回</text>
          </view>
        </template>

        <template #right>
          <common-share v-if="shareBtnVisible" @click="shareClick" />
        </template>

        <template #transparentFixedLeft>
          <view class="nav-left">
            <view class="nav-back-pill" @click="goBack" aria-label="返回">
              <image
                src="/static/artist/left.png"
                mode="aspectFill"
                style="width: 14rpx;height: 14rpx;position: relative;top: 3rpx;"
              ></image>
            </view>
            <text class="nav-back-text font-title" @click="goBack">{{ currentRoleConfig.navText }}</text>
          </view>
        </template>
        <template #transparentFixedRight>
          <common-share v-if="shareBtnVisible" @click="shareClick" />
        </template>

        <template #default>
          <view class="nav-center">
            <image class="nav-center-avatar" :src="info.logo_image || defaultAvatar" mode="aspectFill" />
            <text class="nav-center-name font-alimamashuhei">{{ info.brand_name || '—' }}</text>
          </view>
        </template>
        <template #transparentFixed></template>
      </zhouWei-navBar>

      <common-placeholder></common-placeholder>

      <view class="header">
        <view class="avatar-wrap">
          <image class="avatar" :src="info.logo_image || defaultAvatar" mode="aspectFill" />
        </view>

        <view class="info-card">
          <view class="row-1">
            <text class="brand-name font-alimamashuhei">{{ info.brand_name || '—' }}</text>
            <text class="last-time">{{ lastLoginText }}</text>
          </view>

          <view v-if="isSettled" class="row-2">
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

          <view v-if="linkTags.length" class="link-tags">
            <view
              v-for="item in linkTags"
              :key="item.key"
              class="link-tag"
              @click="copyText(item.url, item.label)"
            >
              <image class="link-tag-icon" :src="item.icon" mode="aspectFit" />
              <text class="link-tag-text font-title">{{ item.label }}</text>
            </view>
          </view>

          <view v-if="info.description" class="desc">{{ info.description }}</view>
        </view>
      </view>

      <view class="calendar-card">
        <view class="cal-title font-title">档期</view>
        <scroll-view scroll-x class="month-row-scroll" :show-scrollbar="false">
          <view class="month-row">
            <view
              v-for="month in monthBusyList"
              :key="month.key"
              class="month-pill"
              :class="{ current: month.isCurrent }"
            >
              <view class="m1 font-title">{{ month.label }}</view>
              <view class="m2 font-title">{{ month.busy_days }}/{{ month.total_days }}</view>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <view class="identity-card">
      <view class="id-title font-title">她的身份</view>
      <view class="id-row">
        <view
          v-for="tab in identityTabs"
          :key="tab.key"
          class="id-pill"
          :class="{
            'id-pill--disabled': tab.disabled,
            'id-pill--active': activeRole === tab.key
          }"
          @click="switchRole(tab.key)"
        >
          <image class="id-img" :src="tab.icon"></image>
          <text class="font-title">{{ tab.label }}</text>
          <image
            v-if="activeRole === tab.key"
            class="ink-wave"
            src="/static/select.png"
            mode="scaleToFill"
          />
        </view>

        <view
          class="id-pill"
          :class="{ 'id-pill--disabled': !identity.is_brand }"
          @click="identity.is_brand && openBrandHome()"
        >
          <image class="id-img" src="/static/artist/iconify-uil_shop.png"></image>
          <text class="font-title">{{ brandIdentityLabel }}</text>
        </view>
      </view>
    </view>

    <view class="content-wrap">
      <view class="list-tab-row">
        <view
          :class="['tab-btn', 'font-title', { active: currentRoleState.listTab === 'images' }]"
          @click="switchListTab('images')"
        >
          <text class="label">{{ currentRoleConfig.imageTabLabel }}</text>
        </view>

        <view
          :class="['tab-btn', 'font-title', { active: currentRoleState.listTab === 'orders' }]"
          @click="switchListTab('orders')"
        >
          <view v-if="currentRoleState.hasOrderDot" class="red-dot"></view>
          <text class="label">开单记录</text>
        </view>
      </view>

      <view class="role-content-wrap">
        <transition :name="roleTransitionName" mode="out-in">
          <view :key="activeRole" class="role-stage">
            <view v-if="currentRoleState.listTab === 'images'" class="grid">
              <view
                v-for="(item, index) in currentRoleState.items"
                :key="item.render_key"
                class="grid-item fade-in-item"
                :style="itemFadeStyle(item, index)"
                @click="openRoleItem(activeRole, item.id)"
              >
                <image class="grid-img" :src="item.previewUrl" mode="aspectFill" />
              </view>

              <view v-if="currentRoleState.itemLoading" class="grid-tip">
                <uni-load-more status="loading" />
              </view>
              <view v-else-if="!currentRoleState.itemHasMore && currentRoleState.items.length" class="grid-tip">— 已到底 —</view>
              <view v-else-if="!currentRoleState.items.length" class="grid-tip">{{ currentRoleConfig.emptyImageText }}</view>
            </view>

            <view v-else class="order-list">
              <view
                v-for="(plan, index) in currentRoleState.orderPlans"
                :key="plan.render_key"
                class="order-card fade-in-item"
                :style="itemFadeStyle(plan, index)"
                @click="openOrder(plan.id)"
              >
                <image class="order-cover" :src="plan.images?.[0] || info.logo_image || defaultAvatar" mode="aspectFill" />
                <view class="order-body">
                  <view class="order-title font-title">{{ plan.brand_name }} · 开单</view>
                  <view class="order-meta">
                    <text :class="['chip', { 'font-alimamashuhei': activeRole !== 'hair' }, statusClass(plan)]">{{ statusText(plan) }}</text>
                    <text class="time">开：{{ formatTime(plan.open_time) }}</text>
                    <text class="time">截：{{ formatTime(plan.close_time) }}</text>
                  </view>
                  <view :class="['tier-line', { 'font-alimamashuhei': activeRole !== 'hair' }]">{{ tierRange(plan) }}</view>
                </view>
              </view>

              <view v-if="currentRoleState.orderLoading" class="grid-tip">
                <uni-load-more status="loading" />
              </view>
              <view v-else-if="!currentRoleState.orderHasMore && currentRoleState.orderPlans.length" class="grid-tip">— 没有更多记录 —</view>
              <view v-else-if="!currentRoleState.orderPlans.length" class="grid-tip">暂无记录</view>
            </view>
          </view>
        </transition>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { onLoad, onPageScroll, onReachBottom, onShow } from '@dcloudio/uni-app'
import { websiteUrl } from '@/common/config.js'
import { buildCreatorProfileUrl, normalizeCreatorRole } from '@/common/creator-profile.js'
import { useCrossShare } from '@/common/share.js'

const ROLE_CONFIGS = {
  artist: {
    key: 'artist',
    label: '妆师',
    navText: 'BJD妆师',
    shareTitle: 'BJD妆师',
    shareSummary: '看看这位妆师的主页～',
    icon: '/static/artist/pen.png',
    imageTabLabel: '展示图片',
    emptyImageText: '暂无妆图',
    imageEndpoint: '/brand-artist/bjd-faceup',
    orderArtistType: 1
  },
  hair: {
    key: 'hair',
    label: '毛娘',
    navText: '毛娘',
    shareTitle: '毛娘',
    shareSummary: '看看这个毛娘主页～',
    icon: '/static/artist/wig.png',
    imageTabLabel: '展示图片',
    emptyImageText: '暂无毛娘作品',
    imageEndpoint: '/brand-artist/custom-wig',
    orderArtistType: 2
  }
}
const ROLE_ORDER = ['artist', 'hair']
const MONTH_NAMES = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']

const defaultAvatar = 'https://images1.fantuanpu.com/brand-avatar/default'
const brandId = ref(0)
const routeRole = ref('artist')
const activeRole = ref('artist')
const activeRoleIndex = computed(() => ROLE_ORDER.indexOf(activeRole.value))
const roleTransitionName = ref('role-slide-left')
const scrollTop = ref(0)
const routeKey = ref('')
const pageLoading = ref(false)

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

const brandLinks = reactive({
  website_url: '',
  rednote_url: '',
  tb_url: '',
  vd_url: '',
  weibo_url: ''
})

const LINK_ICON = {
  tb: '/static/app-icon/tb.png',
  vd: '/static/app-icon/vd.png',
  xhs: '/static/app-icon/xhs.png',
  wb: '/static/app-icon/wb.png',
  website: '/static/app-icon/website.png'
}

const roleStates = reactive({
  artist: createRoleState(),
  hair: createRoleState()
})

const monthBusyList = ref([])
const isSettled = computed(() => Number(info.last_login_time || 0) > 0)
const currentRoleConfig = computed(() => ROLE_CONFIGS[activeRole.value] || ROLE_CONFIGS.artist)
const currentRoleState = computed(() => roleStates[activeRole.value])
const brandIdentityLabel = computed(() => '贩售')
const roleTabs = computed(() => {
  return ROLE_ORDER.map((key) => {
    const config = ROLE_CONFIGS[key]
    const disabled = key === 'artist'
      ? Number(identity.is_bjd_artist || 0) <= 0
      : Number(identity.is_bjd_hairstylist || 0) <= 0

    return {
      ...config,
      disabled,
      statusText: disabled ? '暂未开通' : '可查看'
    }
  })
})
const identityTabs = computed(() => {
  const artistTab = roleTabs.value.find((item) => item.key === 'artist')
  const hairTab = roleTabs.value.find((item) => item.key === 'hair')
  return [
    artistTab ? { ...artistTab, label: '妆师' } : null,
    hairTab ? { ...hairTab, label: '毛娘' } : null
  ].filter(Boolean)
})

const linkTags = computed(() => {
  const tags = []
  if (brandLinks.rednote_url) tags.push({ key: 'xhs', label: '小红书', url: brandLinks.rednote_url, icon: LINK_ICON.xhs })
  if (brandLinks.tb_url) tags.push({ key: 'tb', label: '淘宝', url: brandLinks.tb_url, icon: LINK_ICON.tb })
  if (brandLinks.vd_url) tags.push({ key: 'vd', label: '微店', url: brandLinks.vd_url, icon: LINK_ICON.vd })
  if (brandLinks.weibo_url) tags.push({ key: 'wb', label: '微博', url: brandLinks.weibo_url, icon: LINK_ICON.wb })
  if (brandLinks.website_url) tags.push({ key: 'website', label: '官网', url: brandLinks.website_url, icon: LINK_ICON.website })
  return tags
})

const lastLoginText = computed(() => {
  const ts = Number(info.last_login_time || 0)
  if (!ts) return '未入驻'
  return timeAgo(ts * 1000)
})
const avgCycleDaysText = computed(() => {
  const days = Number(info.artist_stats?.avg_cycle_days || 0)
  return days ? `${toFixed2(days)}天` : '—'
})
const punctualityRateText = computed(() => {
  const rate = Number(info.artist_stats?.punctuality_rate || 0)
  return `${Math.round(rate * 100)}%`
})

const { setupMpShare, shareBtnVisible, shareClick } = useCrossShare(() => ({
  title: `${currentRoleConfig.value.shareTitle} · ${info.brand_name || '精选'}`,
  summary: info.description || currentRoleConfig.value.shareSummary,
  imageUrl: currentRoleState.value.items?.[0]?.previewUrl || info.logo_image || defaultAvatar,
  path: buildCreatorProfileUrl(brandId.value, activeRole.value)
}))
setupMpShare()

onPageScroll((event) => {
  scrollTop.value = event.scrollTop || 0
})

onLoad((options = {}) => {
  syncRouteContext(options, true)
})

onShow(() => {
  syncRouteContext(getCurrentRouteParams(), false)
})

onReachBottom(() => {
  loadMoreForActiveRole()
})

function createRoleState() {
  return {
    listTab: 'images',
    items: [],
    itemPage: 1,
    itemSize: 30,
    itemHasMore: true,
    itemLoading: false,
    orderPlans: [],
    orderPage: 1,
    orderSize: 5,
    orderHasMore: true,
    orderLoading: false,
    hasOrderDot: false
  }
}

function getCurrentRouteParams() {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] || {}
  return currentPage.$route?.query || currentPage.options || currentPage.$page?.options || {}
}

function resolveBrandIdFromRouteParams(raw = {}) {
  return Number(raw.brand_id || raw.id || raw.brandId || 0)
}

function resolveRoleFromRouteParams(raw = {}) {
  return normalizeCreatorRole(raw.type || raw.role || raw.creator_type)
}

function copyText(text, label = '') {
  const value = String(text || '').trim()
  if (!value) return
  uni.setClipboardData({
    data: value,
    success() {
      uni.showToast({ title: label ? `已复制${label}` : '已复制', icon: 'none' })
    }
  })
}

function goBack() {
  uni.navigateBack({ delta: 1 })
}

function openBrandHome() {
  const id = Number(info.brand_id || brandId.value || 0)
  if (!id) return
  uni.navigateTo({ url: `/pages/brand/brand?brand_id=${id}` })
}

async function syncRouteContext(raw = {}, forceRefresh = false) {
  const nextBrandId = resolveBrandIdFromRouteParams(raw)
  if (!nextBrandId) return

  const nextRole = resolveRoleFromRouteParams(raw)
  const nextKey = `${nextBrandId}-${nextRole}`
  if (pageLoading.value && routeKey.value === nextKey) {
    return
  }
  if (!forceRefresh && routeKey.value === nextKey && Number(info.brand_id || 0) === nextBrandId) {
    return
  }

  routeKey.value = nextKey
  brandId.value = nextBrandId
  routeRole.value = nextRole
  activeRole.value = nextRole
  resetAllRoleStates()
  await initializePage()
}

async function initializePage() {
  pageLoading.value = true
  uni.showLoading({ title: '加载中...' })
  try {
    await fetchInfo()
    await fetchMonthlyBusy()
    const preferredRole = resolvePreferredRole(routeRole.value)
    if (preferredRole !== activeRole.value) {
      activeRole.value = preferredRole
    }
    await Promise.all([
      fetchRoleItems(activeRole.value),
      fetchRoleOrders(activeRole.value)
    ])
  } finally {
    uni.hideLoading()
    pageLoading.value = false
  }
}

function resetAllRoleStates() {
  ROLE_ORDER.forEach((key) => {
    const state = roleStates[key]
    state.listTab = 'images'
    state.items = []
    state.itemPage = 1
    state.itemHasMore = true
    state.itemLoading = false
    state.orderPlans = []
    state.orderPage = 1
    state.orderHasMore = true
    state.orderLoading = false
    state.hasOrderDot = false
  })
}

function resolvePreferredRole(preferredRole) {
  const preferred = normalizeCreatorRole(preferredRole)
  const hasArtist = Number(identity.is_bjd_artist || 0) > 0
  const hasHair = Number(identity.is_bjd_hairstylist || 0) > 0

  if (preferred === 'hair' && hasHair) return 'hair'
  if (preferred === 'artist' && hasArtist) return 'artist'
  if (hasArtist) return 'artist'
  if (hasHair) return 'hair'
  return preferred
}

async function fetchInfo() {
  const response = await uni.request({
    url: `${websiteUrl.value}/brand-artist/info`,
    method: 'GET',
    data: { brand_id: brandId.value }
  })

  if (String(response.data?.status).toLowerCase() !== 'success') {
    uni.showToast({ title: response.data?.msg || '加载失败', icon: 'none' })
    return
  }

  const data = response.data?.data || {}
  const brand = data.brand || {}

  info.brand_id = Number(data.brand_id || brand.id || brandId.value || 0)
  info.brand_name = data.brand_name || brand.brand_name || ''
  info.description = data.description || brand.description || ''
  info.logo_image = data.logo_image || brand.logo_image || ''
  info.last_login_time = Number(data.last_login_time || 0)
  info.artist_stats = data.artist_stats || null

  identity.is_brand = Number(data.is_brand ?? brand.is_brand ?? 0)
  identity.is_bjd_artist = Number(data.is_bjd_artist ?? brand.is_bjd_artist ?? 0)
  identity.is_bjd_hairstylist = Number(data.is_bjd_hairstylist ?? brand.is_bjd_hairstylist ?? 0)

  brandLinks.website_url = brand.website_url || ''
  brandLinks.rednote_url = brand.rednote_url || ''
  brandLinks.tb_url = brand.tb_url || ''
  brandLinks.vd_url = brand.vd_url || ''
  brandLinks.weibo_url = brand.weibo_url || ''
}

async function fetchMonthlyBusy() {
  const now = new Date()
  const startMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const months = 6
  const response = await uni.request({
    url: `${websiteUrl.value}/brand-artist/monthly-busy`,
    method: 'GET',
    data: {
      brand_id: brandId.value,
      start_month: startMonth,
      months
    }
  })

  let rows = []
  if (String(response.data?.status).toLowerCase() === 'success') {
    rows = response.data?.data?.list || []
  }

  if (!rows.length) {
    for (let index = 0; index < months; index += 1) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() + index + 1, 0)
      rows.push({
        year: monthDate.getFullYear(),
        month: monthDate.getMonth() + 1,
        busy_days: 0,
        total_days: monthDate.getDate()
      })
    }
  }

  monthBusyList.value = rows.map((item, index) => ({
    key: `${item.year}-${item.month}`,
    label: index === 0 ? '本月' : MONTH_NAMES[(Number(item.month) - 1 + 12) % 12],
    isCurrent: index === 0,
    busy_days: Number(item.busy_days || 0),
    total_days: Number(item.total_days || 30)
  }))
}

async function switchRole(roleKey) {
  if (!ROLE_CONFIGS[roleKey]) return
  if (roleKey === activeRole.value) return

  const tab = roleTabs.value.find((item) => item.key === roleKey)
  if (tab?.disabled) {
    uni.showToast({ title: '这个身份还没有开通', icon: 'none' })
    return
  }

  const nextIndex = ROLE_ORDER.indexOf(roleKey)
  roleTransitionName.value = nextIndex > activeRoleIndex.value ? 'role-slide-left' : 'role-slide-right'
  activeRole.value = roleKey
  await Promise.all([
    fetchRoleItems(roleKey),
    fetchRoleOrders(roleKey)
  ])
}

async function switchListTab(tabKey) {
  const state = currentRoleState.value
  state.listTab = tabKey
  if (tabKey === 'images' && state.items.length === 0) {
    await fetchRoleItems(activeRole.value)
  }
  if (tabKey === 'orders' && state.orderPlans.length === 0) {
    await fetchRoleOrders(activeRole.value)
  }
}

function loadMoreForActiveRole() {
  const state = currentRoleState.value
  if (state.listTab === 'images') {
    fetchRoleItems(activeRole.value)
    return
  }
  fetchRoleOrders(activeRole.value)
}

async function fetchRoleItems(roleKey) {
  const config = ROLE_CONFIGS[roleKey]
  const state = roleStates[roleKey]
  if (!config || !state.itemHasMore || state.itemLoading) return

  state.itemLoading = true
  const response = await uni.request({
    url: `${websiteUrl.value}${config.imageEndpoint}`,
    method: 'GET',
    data: {
      brand_id: brandId.value,
      page: state.itemPage,
      size: state.itemSize
    }
  })
  state.itemLoading = false

  if (String(response.data?.status).toLowerCase() !== 'success') {
    uni.showToast({ title: response.data?.msg || '加载失败', icon: 'none' })
    return
  }

  const rawList = response.data?.data?.list || []
  const list = attachFadeMeta(mapRoleItems(roleKey, rawList), state.items.length)
  state.items = [...state.items, ...list]

  const total = Number(response.data?.data?.total || state.items.length)
  state.itemHasMore = state.items.length < total
  if (state.itemHasMore) {
    state.itemPage += 1
  }
}

async function fetchRoleOrders(roleKey) {
  const config = ROLE_CONFIGS[roleKey]
  const state = roleStates[roleKey]
  if (!config || !state.orderHasMore || state.orderLoading) return

  state.orderLoading = true
  const response = await uni.request({
    url: `${websiteUrl.value}/brand-artist/order-plans`,
    method: 'GET',
    data: {
      brand_id: brandId.value,
      artist_type: config.orderArtistType,
      page: state.orderPage,
      size: state.orderSize
    }
  })
  state.orderLoading = false

  if (String(response.data?.status).toLowerCase() !== 'success') {
    uni.showToast({ title: response.data?.msg || '加载失败', icon: 'none' })
    return
  }

  const list = attachFadeMeta(response.data?.data || [], state.orderPlans.length)
  state.orderPlans = [...state.orderPlans, ...list]
  syncOrderDot(state)

  if (list.length < state.orderSize) {
    state.orderHasMore = false
  } else {
    state.orderPage += 1
  }
}

function syncOrderDot(state) {
  const now = Math.floor(Date.now() / 1000)
  const soon = 7 * 24 * 3600
  state.hasOrderDot = state.orderPlans.some((plan) => {
    return (
      (now >= Number(plan.open_time || 0) && now <= Number(plan.close_time || 0)) ||
      (Number(plan.open_time || 0) > now && Number(plan.open_time || 0) - now <= soon)
    )
  })
}

function mapRoleItems(roleKey, list = []) {
  if (roleKey === 'hair') {
    return list
      .map((item) => {
        const previewUrl = item.cover_image || item.custom_wig_images?.[0] || ''
        return previewUrl ? { id: item.id, previewUrl } : null
      })
      .filter(Boolean)
  }

  return list
    .map((item) => {
      const previewUrl = item.image_urls?.[0] || ''
      return previewUrl ? { id: item.id, previewUrl } : null
    })
    .filter(Boolean)
}

function attachFadeMeta(list = [], startIndex = 0) {
  const stamp = Date.now()
  return list.map((item, index) => ({
    ...item,
    render_key: `${item.id || 'item'}-${stamp}-${startIndex + index}`,
    render_delay: `${Math.min(index, 8) * 60}ms`
  }))
}

function itemFadeStyle(item, index) {
  return `animation-delay:${item.render_delay || `${Math.min(index, 8) * 60}ms`}`
}

function openRoleItem(roleKey, id) {
  if (roleKey === 'hair') {
    uni.navigateTo({ url: `/pkg-creator/creator_base/custom_wig/custom_wig?id=${id}` })
    return
  }
  uni.navigateTo({ url: `/pkg-common/artwork/artwork?id=${id}` })
}

function openOrder(id) {
  uni.navigateTo({ url: `/pkg-creator/creator_order/plan_detail/plan_detail?id=${id}` })
}

function statusText(plan) {
  const now = Math.floor(Date.now() / 1000)
  const openTime = Number(plan.open_time || 0)
  const closeTime = Number(plan.close_time || 0)
  if (now >= openTime && now <= closeTime) return '进行中'
  if (now < openTime) return '即将开始'
  return '已结束'
}

function statusClass(plan) {
  const text = statusText(plan)
  return {
    ongoing: text === '进行中',
    upcoming: text === '即将开始',
    ended: text === '已结束'
  }
}

function tierRange(plan) {
  const prices = (plan.tiers || []).map((item) => Number(item.price || 0)).filter((item) => !Number.isNaN(item))
  if (!prices.length) return '未设置档位'
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return `¥${min}${min !== max ? `~${max}` : ''} · ${prices.length}档`
}

function formatTime(timestamp) {
  if (!timestamp) return '--'
  const date = new Date(Number(timestamp) * 1000)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${month}/${day} ${hour}:${minute}`
}

function toFixed2(value) {
  const number = parseFloat(value)
  if (Number.isNaN(number)) return 0
  return Math.round(number * 100) / 100
}

function timeAgo(milliseconds) {
  const diff = Date.now() - milliseconds
  if (diff < 0) return '刚刚'
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return `${seconds} 秒前`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} 分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} 天前`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} 月前`
  return `${Math.floor(months / 12)} 年前`
}
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
  font-weight: 800;
  z-index: 2;
}

.nav-left {
  display: flex;
  align-items: center;
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

.nav-back-text {
  font-size: 24rpx;
  font-weight: 700;
  color: #000;
}

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
  max-width: 320rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

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
  min-height: 120rpx;
  padding: 12rpx 24rpx 24rpx 220rpx;
  background: #fff;
  border-radius: 15rpx;
  box-shadow: 0 0rpx 5rpx rgba(0, 0, 0, 0.06);
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
  transition: all 0.3s;
}

.val {
  font-size: 20rpx;
  color: #333;
  font-weight: 600;
}

.link-tags {
  margin-top: 16rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.link-tag {
  padding: 10rpx 18rpx;
  border-radius: 9999rpx;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.link-tag-icon {
  width: 28rpx;
  height: 28rpx;
  flex-shrink: 0;
}

.link-tag-text {
  font-size: 22rpx;
  color: #333;
}

.desc {
  margin-top: 18rpx;
  font-size: 26rpx;
  color: #3f3f3f;
  line-height: 1.7;
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
  position: relative;
  overflow: visible;
  width: 140rpx;
}

.id-pill--disabled {
  opacity: 0.4;
}

.id-pill--active {
  color: #222;
}

.id-pill .ink-wave {
  position: absolute;
  left: 40%;
  top: 8px;
  width: 95rpx;
  height: 50rpx;
  transform: translateX(-50%) rotate(0deg);
  z-index: 1;
  pointer-events: none;
}

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
  z-index: 3;
}

.id-pill .font-title {
  position: relative;
  z-index: 3;
}

.content-wrap {
  margin: 20rpx;
}

.list-tab-row {
  margin-left: 1rpx;
}

.tab-btn {
  margin-left: 20rpx;
  position: relative;
  padding: 8rpx 6rpx 24rpx;
  transition: all 0.3s;
  display: inline-block;
}

.tab-btn .label {
  position: relative;
  z-index: 2;
  font-size: 32rpx;
  color: #a0a7af;
  transition: color .22s ease;
}

.tab-btn.active .label {
  color: #000;
}

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

.role-content-wrap {
  overflow: hidden;
}

.role-stage {
  width: 100%;
}

.grid {
  padding: 24rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.grid-item {
  width: calc((100% - 20rpx) / 3);
  aspect-ratio: 4 / 5;
  overflow: hidden;
  border-radius: 0rpx;
  background: #f3f5f7;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.04);
}

.grid-img {
  width: 100%;
  height: 100%;
}

.order-list {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.order-card {
  display: flex;
  gap: 16rpx;
  padding: 10px;
  border-radius: 14rpx;
  background: #fff;
  overflow: hidden;
  box-shadow: 0 10rpx 24rpx rgba(0, 0, 0, 0.04);
}

.order-cover {
  width: 240rpx;
  height: 180rpx;
  object-fit: cover;
  border-radius: 10rpx;
  flex-shrink: 0;
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
  flex-wrap: wrap;
  align-items: center;
  gap: 14rpx;
}

.chip {
  padding: 6rpx 12rpx;
  border-radius: 9999rpx;
  font-size: 22rpx;
}

.artist-page--artist .chip.ongoing {
  background: #ccffcf;
  color: #577454;
}

.artist-page--artist .chip.upcoming {
  background: #cce4ff;
  color: #86b4ff;
}

.artist-page--artist .chip.ended {
  background: #f5f5f5;
  color: #888;
}

.artist-page--hair .chip.ongoing {
  background: #e8f7ee;
  color: #17a05d;
}

.artist-page--hair .chip.upcoming {
  background: #e8f3ff;
  color: #2376ff;
}

.artist-page--hair .chip.ended {
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

.grid-tip {
  width: 100%;
  text-align: center;
  font-size: 24rpx;
  color: #909399;
  padding: 20rpx 0;
}

.fade-in-item {
  animation: creatorFadeIn 0.32s ease both;
}

.role-slide-left-enter-active,
.role-slide-left-leave-active,
.role-slide-right-enter-active,
.role-slide-right-leave-active {
  transition: transform 0.28s ease, opacity 0.28s ease;
}

.role-slide-left-enter-from,
.role-slide-right-leave-to {
  opacity: 0;
  transform: translateX(36rpx);
}

.role-slide-left-leave-to,
.role-slide-right-enter-from {
  opacity: 0;
  transform: translateX(-36rpx);
}

@keyframes creatorFadeIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
