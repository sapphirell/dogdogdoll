<template>
  <view-logs />
  <view class="cabinet-list-page">
    <zhouWei-navBar
      type="transparentFixed"
      :backState="2000"
      :homeState="2000"
      :scrollTop="scrollTop"
      :shadow="false"
      :titleCenter="true"
      :title="pageTitle"
      fontColor="#1f2f43"
      transparentFixedFontColor="#1f2f43"
      bgColor="rgba(255,255,255,0.94)"
    >
      <template #left>
        <view class="nav-back" @tap="goBack">
          <uni-icons type="arrow-left" size="21" color="#1f2f43" />
        </view>
      </template>
      <template #transparentFixedLeft>
        <view class="nav-back" @tap="goBack">
          <uni-icons type="arrow-left" size="21" color="#1f2f43" />
        </view>
      </template>
    </zhouWei-navBar>

    <loading-toast :show="loading" text="正在整理该分类物品..." />

    <view class="page-body" :style="{ paddingTop: headerPadPx }">
      <view class="hero-card">
        <view class="hero-row">
          <text class="hero-title font-alimamashuhei">{{ typeName || '分类物品' }}</text>
          <text class="hero-count font-title">{{ displayList.length }} 件</text>
        </view>
        <text class="hero-desc">长按拖拽排序，点击卡片可查看物品详情</text>
      </view>

      <view v-if="!loading && displayList.length" class="drag-wrap">
        <shmily-drag-image
          :modelValue="displayList"
          :padding="0"
          :item-margin="10"
          border-radius="20"
          :show-payment-tag="displaySetting.show_payment_tag"
          :show-size-tag="displaySetting.show_size_tag"
          :show-type-tag="displaySetting.show_type_tag"
          :show-price-tag="displaySetting.show_price_tag"
          :show-item-info="displaySetting.show_item_info"
          payment-field="payment_status"
          @sort-change="handleSortChange"
        />
      </view>

      <view v-else-if="!loading" class="empty-wrap">
        <image class="empty-icon" src="/static/empty.jpg" mode="aspectFit" />
        <text class="empty-text">该分类还没有物品</text>
        <text class="empty-tip">返回上一页去添加物品试试</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad, onPageScroll, onShow } from '@dcloudio/uni-app'
import { getNavBarHeight, getStatusBarHeight, toPx, websiteUrl } from '@/common/config.js'

const ACCOUNT_BOOK_VIEW_MODE_KEY = 'accountBookViewMode'
const VIEW_MODE_CABINET = 'cabinet'

const DEFAULT_DISPLAY_SETTING = Object.freeze({
  show_size_tag: true,
  show_type_tag: true,
  show_price_tag: true,
  show_item_info: true,
  show_payment_tag: true,
  include_additional_in_item_price: false,
  include_additional_in_total: false,
  include_count_in_item_price: false,
  include_count_in_total: false,
})

const typeName = ref('')
const loading = ref(false)
const scrollTop = ref(0)
const rawList = ref([])
const displaySetting = ref({ ...DEFAULT_DISPLAY_SETTING })

const headerPadPx = computed(() => toPx(getStatusBarHeight() + getNavBarHeight()))
const pageTitle = computed(() => {
  const name = String(typeName.value || '').trim()
  if (!name) return '分类物品'
  return `${name} · 柜子`
})

function toDisplayItem(item) {
  const includeAdditional = !!displaySetting.value.include_additional_in_item_price
  const includeCount = !!displaySetting.value.include_count_in_item_price || !!displaySetting.value.include_count_in_total
  const basePrice = Number(item?.price || 0)
  const count = resolveItemCount(item)
  const additional = includeAdditional ? parseAdditionalNumeric(item?.additional_value) : 0
  const mergedBase = includeCount ? (basePrice * count) : basePrice
  const merged = mergedBase + additional
  return {
    ...item,
    display_price: normalizePriceText(merged),
    size: item?.size || item?.size_detail || '',
  }
}

const displayList = computed(() => {
  return (rawList.value || []).map((item) => toDisplayItem(item))
})

function goBack() {
  try {
    uni.navigateBack()
  } catch (e) {
    uni.switchTab({ url: '/pages/stock/stock' })
  }
}

function resolveItemCount(item) {
  const raw = Number(item?.count ?? item?.quantity ?? item?.num)
  if (!Number.isFinite(raw)) return 1
  if (raw <= 0) return 0
  return raw
}

function parseAdditionalNumeric(raw) {
  if (raw === null || raw === undefined) return 0
  const matches = String(raw).match(/-?\d+(?:\.\d+)?/g)
  if (!matches || !matches.length) return 0
  return matches.reduce((sum, txt) => {
    const n = Number(txt)
    return Number.isFinite(n) ? sum + n : sum
  }, 0)
}

function normalizePriceText(n) {
  const safe = Number.isFinite(n) ? Math.round(n * 100) / 100 : 0
  return Number.isInteger(safe) ? String(safe) : safe.toFixed(2)
}

function normalizeDisplaySetting(payload) {
  const p = payload || {}
  const boolOf = (v, fallback) => {
    if (typeof v === 'boolean') return v
    if (typeof v === 'number') return v === 1
    if (typeof v === 'string') {
      const txt = v.trim().toLowerCase()
      if (txt === '1' || txt === 'true' || txt === 'yes' || txt === 'on') return true
      if (txt === '0' || txt === 'false' || txt === 'no' || txt === 'off' || txt === '') return false
    }
    return fallback
  }
  return {
    show_size_tag: boolOf(p.show_size_tag, true),
    show_type_tag: boolOf(p.show_type_tag, true),
    show_price_tag: boolOf(p.show_price_tag, true),
    show_item_info: boolOf(p.show_item_info, true),
    show_payment_tag: boolOf(p.show_payment_tag, true),
    include_additional_in_item_price: boolOf(p.include_additional_in_item_price, false),
    include_additional_in_total: boolOf(p.include_additional_in_total, false),
    include_count_in_item_price: boolOf(p.include_count_in_item_price, false),
    include_count_in_total: boolOf(p.include_count_in_total, false),
  }
}

async function fetchDisplaySetting() {
  const token = uni.getStorageSync('token')
  if (!token) {
    displaySetting.value = { ...DEFAULT_DISPLAY_SETTING }
    return
  }
  try {
    const res = await uni.request({
      url: websiteUrl.value + '/with-state/account-book-display-setting',
      method: 'GET',
      header: { Authorization: token },
    })
    if (String(res?.data?.status || '').toLowerCase() !== 'success') return
    displaySetting.value = normalizeDisplaySetting(res?.data?.data || {})
  } catch (e) {
    console.error('[stock-cabinet-list] get display setting fail:', e)
  }
}

async function fetchTypeItems() {
  const token = uni.getStorageSync('token')
  if (!token) {
    rawList.value = []
    return
  }
  const safeType = String(typeName.value || '').trim()
  if (!safeType) {
    rawList.value = []
    return
  }
  loading.value = true
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/account-book?type=${encodeURIComponent(safeType)}`,
      method: 'GET',
      header: { Authorization: token },
    })
    rawList.value = Array.isArray(res?.data?.data?.account_books) ? res.data.data.account_books : []
  } catch (e) {
    console.error('[stock-cabinet-list] fetch type items fail:', e)
    rawList.value = []
    uni.showToast({ title: '加载失败，请稍后再试', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function sanitizeSortedIds(rawIds) {
  if (!Array.isArray(rawIds)) return []
  return rawIds
    .map((id) => Number(id || 0))
    .filter((id) => Number.isInteger(id) && id > 0)
}

async function handleSortChange(sortedIds) {
  const cleanIds = sanitizeSortedIds(sortedIds)
  if (!cleanIds.length) return
  const token = uni.getStorageSync('token')
  if (!token) return
  try {
    const res = await uni.request({
      url: websiteUrl.value + '/with-state/sort-account-book',
      method: 'POST',
      header: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      data: { sorted_ids: cleanIds },
    })
    if (String(res?.data?.status || '').toLowerCase() !== 'success') {
      uni.showToast({ title: res?.data?.msg || '排序保存失败', icon: 'none' })
    }
  } catch (e) {
    console.error('[stock-cabinet-list] sort save fail:', e)
    uni.showToast({ title: '排序保存失败', icon: 'none' })
  }
}

onLoad(async (options) => {
  const raw = String(options?.type || '').trim()
  if (raw) {
    try {
      typeName.value = decodeURIComponent(raw)
    } catch (e) {
      typeName.value = raw
    }
  } else {
    typeName.value = ''
  }
  try { uni.setStorageSync(ACCOUNT_BOOK_VIEW_MODE_KEY, VIEW_MODE_CABINET) } catch (e) {}
  if (!typeName.value) {
    uni.showToast({ title: '分类参数缺失', icon: 'none' })
    return
  }
  await fetchDisplaySetting()
  await fetchTypeItems()
})

onShow(async () => {
  if (!typeName.value) return
  await fetchDisplaySetting()
  await fetchTypeItems()
})

onPageScroll((e) => {
  scrollTop.value = Number(e?.scrollTop || 0)
})
</script>

<style scoped lang="scss">
.cabinet-list-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0f7ff 0%, #f8fbff 58%, #ffffff 100%);
}

.nav-back {
  width: 64rpx;
  height: 64rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.page-body {
  min-height: 100vh;
  box-sizing: border-box;
  padding-left: 20rpx;
  padding-right: 20rpx;
  padding-bottom: calc(44rpx + env(safe-area-inset-bottom));
}

.hero-card {
  margin-top: 12rpx;
  padding: 22rpx 22rpx 20rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 10rpx 24rpx rgba(94, 117, 146, 0.14);
}

.hero-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12rpx;
}

.hero-title {
  font-size: 38rpx;
  color: #21344b;
}

.hero-count {
  font-size: 28rpx;
  color: #5a6f89;
}

.hero-desc {
  margin-top: 8rpx;
  display: block;
  font-size: 23rpx;
  color: #7c90a8;
}

.drag-wrap {
  margin-top: 18rpx;
}

.empty-wrap {
  margin-top: 26vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
}

.empty-icon {
  width: 180rpx;
  height: 180rpx;
  opacity: 0.82;
}

.empty-text {
  font-size: 28rpx;
  color: #5f748c;
}

.empty-tip {
  font-size: 23rpx;
  color: #94a6b9;
}
</style>
