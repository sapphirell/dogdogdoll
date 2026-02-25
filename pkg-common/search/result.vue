<template>
  <view-logs />
  <view class="search-result-page">
    <view class="nav-shell" :style="navShellStyle">
      <zhouWei-navBar
        type="transparentFixed"
        :backState="2000"
        :homeState="2000"
        fontColor="#1d2c3f"
        transparentFixedFontColor="#1d2c3f"
        :scrollTop="scrollTop"
        :titleCenter="true"
      >
        <template #default>
          <view class="nav-search-box">
            <uni-icons type="search" size="16" color="#7f93a9" />
            <input
              v-model="keyword"
              class="nav-search-input"
              placeholder="搜索娃物 / 品牌 空格 品类"
              confirm-type="search"
              @confirm="handleSubmitSearch"
            />
            <uni-icons
              v-if="keyword"
              type="clear"
              size="16"
              color="#9eb0c3"
              @tap="clearKeyword"
            />
          </view>
        </template>
        <template #transparentFixed>
          <view class="nav-search-box">
            <uni-icons type="search" size="16" color="#7f93a9" />
            <input
              v-model="keyword"
              class="nav-search-input"
              placeholder="搜索娃物 / 品牌 空格 品类"
              confirm-type="search"
              @confirm="handleSubmitSearch"
            />
            <uni-icons
              v-if="keyword"
              type="clear"
              size="16"
              color="#9eb0c3"
              @tap="clearKeyword"
            />
          </view>
        </template>
        <template #left>
          <view class="nav-back-pill" @tap="goBack">
            <uni-icons type="left" size="22" color="#1d2c3f" />
          </view>
        </template>
        <template #transparentFixedLeft>
          <view class="nav-back-pill" @tap="goBack">
            <uni-icons type="left" size="22" color="#1d2c3f" />
          </view>
        </template>
        <template #right>
          <view class="nav-filter-pill font-title" @tap="openFilterModal">
            <uni-icons type="bars" size="14" color="#3f5e79" />
            <text>筛选</text>
          </view>
        </template>
        <template #transparentFixedRight>
          <view class="nav-filter-pill font-title" @tap="openFilterModal">
            <uni-icons type="bars" size="14" color="#3f5e79" />
            <text>筛选</text>
          </view>
        </template>
      </zhouWei-navBar>
    </view>

    <view class="page-body" :style="{ paddingTop: pageBodyTopPad }">
      <view class="search-panel">
        <view class="sort-row">
          <view
            :class="['sort-pill font-title', { active: sortMode === 'relevance' }]"
            @tap="changeSort('relevance')"
          >
            综合
          </view>
          <view
            :class="['sort-pill font-title', { active: sortMode === 'latest' }]"
            @tap="changeSort('latest')"
          >
            最新
          </view>
          <scroll-view class="active-tags" scroll-x :show-scrollbar="false">
            <view class="active-tags-inner">
              <text v-if="searchPlan.brandName" class="active-tag">品牌：{{ searchPlan.brandName }}</text>
              <text
                v-for="c in effectiveCategories"
                :key="`active-${c}`"
                class="active-tag"
              >
                {{ c }}
              </text>
            </view>
          </scroll-view>
        </view>
      </view>

      <z-paging
        ref="pagingRef"
        v-model="goodsList"
        class="result-paging"
        :fixed="false"
        :auto="false"
        :refresher-enabled="true"
        :loading-more-enabled="true"
        :to-bottom-loading-more-enabled="true"
        :inside-more="true"
        :default-page-size="pageSize"
        :lower-threshold="120"
        :auto-show-system-loading="false"
        @query="onPagingQuery"
        @scroll="onPagingScroll"
      >
        <view class="goods-grid" v-if="goodsList.length > 0">
          <view
            v-for="item in goodsList"
            :key="`goods-${item.id}`"
            class="goods-card"
            @tap="goGoods(item.id)"
          >
            <common-image
              class="goods-cover"
              :src="item.cover"
              width="100%"
              height="300rpx"
              radius="22"
              mode="aspectFill"
            />
            <view class="goods-body">
              <text class="goods-name font-alimamashuhei">{{ item.name }}</text>
              <text class="goods-brand">{{ item.brandName || '未识别品牌' }}</text>
              <view class="goods-meta">
                <text class="goods-price font-title">
                  <text v-if="item.priceSign" class="goods-price-sign">{{ item.priceSign }}</text>
                  <text class="goods-price-value">{{ item.priceValue }}</text>
                </text>
                <text class="goods-type">{{ item.type || '未分类' }}</text>
              </view>
              <view class="goods-size-row">
                <text class="goods-size-label font-title">尺寸</text>
                <text class="goods-size-text">{{ item.sizeSummary }}</text>
              </view>
            </view>
          </view>
        </view>

        <template #empty>
          <view class="empty-wrap">
            <text class="empty-text">暂无匹配商品</text>
          </view>
        </template>
      </z-paging>
    </view>

    <common-modal v-model:visible="showFilterModal" width="680rpx" top="18vh">
      <view class="filter-modal">
        <view class="filter-title font-alimamashuhei">筛选分类</view>
        <view class="filter-sub">可多选，结果会叠加到搜索条件</view>
        <view class="filter-chip-wrap">
          <view
            v-for="item in GOODS_CATEGORY_DEFS"
            :key="`filter-${item.value}`"
            :class="['filter-chip', { active: filterDraftCategories.includes(item.value) }]"
            @tap="toggleFilterDraft(item.value)"
          >
            {{ item.value }}
          </view>
        </view>
        <view class="filter-actions">
          <button class="btn-ghost" @tap="clearFilterDraft">清空</button>
          <button class="btn-primary" @tap="applyFilterDraft">应用筛选</button>
        </view>
      </view>
    </common-modal>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad, onPageScroll } from '@dcloudio/uni-app'
import { websiteUrl, getStatusBarHeight, getNavBarHeight, toPx } from '@/common/config.js'

const pageSize = 20
const pagingRef = ref(null)
const goodsList = ref([])
const keyword = ref('')
const sortMode = ref('relevance')
const scrollTop = ref(0)
const navOffsetPx = ref(0)
const lastScrollTopPx = ref(0)
const scrollInited = ref(false)
const showFilterModal = ref(false)
const filterCategories = ref([])
const filterDraftCategories = ref([])
const manualBrandId = ref(0)
const manualBrandName = ref('')
const token = ref('')

const searchPlan = ref({
  raw: '',
  search: '',
  brandId: 0,
  brandName: '',
  categories: [],
})

const navBaseHeight = computed(() => {
  return Math.max(0, Math.round(Number(getStatusBarHeight()) + Number(getNavBarHeight())))
})
const navHideProgress = computed(() => {
  if (navBaseHeight.value <= 0) return 0
  return Math.max(0, Math.min(1, navOffsetPx.value / navBaseHeight.value))
})
const navShellStyle = computed(() => {
  const opacity = Math.max(0.08, 1 - navHideProgress.value * 1.08)
  return {
    transform: `translateY(-${Math.round(navOffsetPx.value)}px)`,
    opacity: `${opacity.toFixed(3)}`,
  }
})
const pageBodyTopPad = computed(() => {
  const pad = Math.max(0, navBaseHeight.value - navOffsetPx.value)
  return toPx(pad)
})
const effectiveCategories = computed(() => {
  const merged = [...(searchPlan.value.categories || []), ...(filterCategories.value || [])]
  return Array.from(new Set(merged.filter(Boolean)))
})

const GOODS_CATEGORY_DEFS = [
  { value: '整体', aliases: ['整体', '整娃', '全娃'] },
  { value: '单体', aliases: ['单体', '身体'] },
  { value: '单头', aliases: ['单头', '头', '娃头'] },
  { value: '手型', aliases: ['手型', '手'] },
  { value: '脚型', aliases: ['脚型', '脚'] },
  { value: '胸型', aliases: ['胸型', '胸'] },
  { value: '胸台', aliases: ['胸台'] },
  { value: '眼珠', aliases: ['眼珠', '眼'] },
  { value: '假发', aliases: ['假发', '毛', '毛件'] },
  { value: '娃衣', aliases: ['娃衣', '衣服', '服装'] },
  { value: '娃鞋', aliases: ['娃鞋', '鞋子', '鞋'] },
  { value: '袜子', aliases: ['袜子', '袜'] },
  { value: '配饰', aliases: ['配饰', '饰品', '配件'] },
  { value: '支架', aliases: ['支架'] },
  { value: '耳朵', aliases: ['耳朵', '耳'] },
  { value: '背饰', aliases: ['背饰', '背件'] },
  { value: 'BJD家具', aliases: ['bjd家具', '家具'] },
  { value: '娃包痛包', aliases: ['娃包痛包', '娃包', '痛包'] },
]

const GOODS_CATEGORY_ALIAS_MAP = GOODS_CATEGORY_DEFS.reduce((acc, item) => {
  const aliases = Array.isArray(item.aliases) ? item.aliases : []
  aliases.concat([item.value]).forEach((alias) => {
    const key = String(alias || '').trim().toLowerCase()
    if (!key) return
    acc[key] = item.value
  })
  return acc
}, {})

function updateNavByScrollTop(nextTop) {
  const top = Math.max(0, Number(nextTop || 0))
  scrollTop.value = top
  if (!scrollInited.value) {
    scrollInited.value = true
    lastScrollTopPx.value = top
    return
  }

  const delta = top - lastScrollTopPx.value
  lastScrollTopPx.value = top

  if (top <= 0) {
    navOffsetPx.value = 0
    return
  }
  if (Math.abs(delta) < 0.4) return

  const maxOffset = Math.max(0, navBaseHeight.value)
  const nextOffset = navOffsetPx.value + delta
  navOffsetPx.value = Math.max(0, Math.min(maxOffset, nextOffset))
}

onPageScroll((e) => {
  updateNavByScrollTop(e?.scrollTop || 0)
})

function onPagingScroll(e) {
  updateNavByScrollTop(e?.detail?.scrollTop || 0)
}

function goBack() {
  uni.navigateBack({ delta: 1 })
}

function normalizeQueryKey(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function splitGoodsTokens(text) {
  return String(text || '')
    .split(/[\s,，、/|]+/g)
    .map(v => v.trim())
    .filter(Boolean)
}

function parseGoodsQuery(text) {
  const tokens = splitGoodsTokens(text)
  const categories = []
  const categorySeen = new Set()
  const others = []

  tokens.forEach(token => {
    const canonical = GOODS_CATEGORY_ALIAS_MAP[String(token || '').toLowerCase()]
    if (canonical) {
      if (!categorySeen.has(canonical)) {
        categorySeen.add(canonical)
        categories.push(canonical)
      }
    } else {
      others.push(token)
    }
  })

  return {
    categories,
    brandAndKeywordText: others.join(' ').trim(),
    nonCategoryTokens: others,
  }
}

async function fetchBrandCandidates(keywordInput) {
  const q = String(keywordInput || '').trim()
  if (!q) return []
  const url = `${websiteUrl.value}/search-brand?search=${encodeURIComponent(q)}`
  const res = await uni.request({ url, method: 'GET' })
  const list = res.data?.status === 'success' ? res.data.data || [] : []
  return Array.isArray(list) ? list : []
}

function pickHighConfidenceBrand(candidates, brandKeyword) {
  if (!Array.isArray(candidates) || !candidates.length) return null
  const kwNorm = normalizeQueryKey(brandKeyword)
  if (!kwNorm) return null

  const exact = candidates.find(item => normalizeQueryKey(item?.name) === kwNorm)
  if (exact) return exact

  if (candidates.length === 1) {
    const only = candidates[0]
    const nameNorm = normalizeQueryKey(only?.name)
    if (nameNorm && (nameNorm.includes(kwNorm) || kwNorm.includes(nameNorm))) {
      return only
    }
  }

  const top = candidates[0]
  const second = candidates[1]
  const topNorm = normalizeQueryKey(top?.name)
  const secondNorm = normalizeQueryKey(second?.name)
  const topStrong = topNorm && (topNorm === kwNorm || topNorm.startsWith(kwNorm))
  const secondStrong = secondNorm && (secondNorm === kwNorm || secondNorm.startsWith(kwNorm))
  if (topStrong && !secondStrong) {
    return top
  }
  return null
}

async function resolveBrandAndKeywordFromTokens(tokens) {
  const nonEmpty = Array.isArray(tokens)
    ? tokens.map(v => String(v || '').trim()).filter(Boolean)
    : []
  if (nonEmpty.length < 2) {
    return {
      matched: null,
      keyword: nonEmpty.join(' ').trim(),
      candidates: [],
    }
  }

  const tried = new Set()
  let fallbackCandidates = []

  for (let split = nonEmpty.length - 1; split >= 1; split--) {
    const brandProbe = nonEmpty.slice(0, split).join(' ').trim()
    const keywordText = nonEmpty.slice(split).join(' ').trim()
    const probeKey = normalizeQueryKey(brandProbe)
    if (!brandProbe || !keywordText || !probeKey || tried.has(probeKey)) {
      continue
    }
    tried.add(probeKey)

    const candidates = await fetchBrandCandidates(brandProbe)
    if (split === 1 && candidates.length > 0) {
      fallbackCandidates = candidates
    }
    const matched = pickHighConfidenceBrand(candidates, brandProbe)
    if (matched) {
      return {
        matched,
        keyword: keywordText,
        candidates,
      }
    }
  }

  return {
    matched: null,
    keyword: nonEmpty.join(' ').trim(),
    candidates: fallbackCandidates,
  }
}

async function buildGoodsSearchPlan(rawKeyword) {
  const raw = String(rawKeyword || '').trim()
  const parsed = parseGoodsQuery(raw)
  const queryKey = normalizeQueryKey(raw)

  const hasManualBrand = manualBrandId.value > 0 && normalizeQueryKey(raw) === queryKey
  let brandId = hasManualBrand ? manualBrandId.value : 0
  let brandName = hasManualBrand ? String(manualBrandName.value || '') : ''
  let keywordForGoods = parsed.brandAndKeywordText

  if (brandId > 0 && parsed.nonCategoryTokens.length >= 2) {
    keywordForGoods = parsed.nonCategoryTokens.slice(1).join(' ').trim()
  } else if (keywordForGoods) {
    if (parsed.nonCategoryTokens.length >= 2) {
      const resolved = await resolveBrandAndKeywordFromTokens(parsed.nonCategoryTokens)
      if (resolved.matched) {
        brandId = Number(resolved.matched.id || 0)
        brandName = resolved.matched.name || ''
        keywordForGoods = resolved.keyword
      }
    }

    if (brandId <= 0 && keywordForGoods) {
      const fallbackCandidates = await fetchBrandCandidates(keywordForGoods)
      const matched = pickHighConfidenceBrand(fallbackCandidates, keywordForGoods)
      if (matched) {
        brandId = Number(matched.id || 0)
        brandName = matched.name || ''
        if (!keywordForGoods || normalizeQueryKey(keywordForGoods) === normalizeQueryKey(brandName)) {
          keywordForGoods = ''
        }
      }
    }
  }

  const searchText = brandId > 0
    ? keywordForGoods
    : (parsed.categories.length > 0 ? keywordForGoods : raw)

  return {
    raw,
    search: String(searchText || '').trim(),
    brandId,
    brandName,
    categories: parsed.categories || [],
  }
}

function uniqTrimmed(values) {
  const list = Array.isArray(values) ? values : []
  const out = []
  const seen = new Set()
  list.forEach((v) => {
    const text = String(v || '').trim()
    if (!text || seen.has(text)) return
    seen.add(text)
    out.push(text)
  })
  return out
}

function normalizeCurrencySymbol(currency) {
  const key = String(currency || 'CNY').trim().toUpperCase()
  if (key === 'USD') return '$'
  if (key === 'EUR') return '€'
  if (key === 'JPY') return 'JPY '
  return '¥'
}

function buildPriceDisplay(item) {
  const totalAmount = Number(item?.total_amount ?? item?.totalAmount ?? 0)
  const fuzzyPrice = String(item?.fuzzy_price || item?.fuzzyPrice || '').trim()
  if (Number.isFinite(totalAmount) && totalAmount > 0) {
    return {
      priceSign: normalizeCurrencySymbol(item?.currency),
      priceValue: String(totalAmount),
    }
  }
  if (fuzzyPrice) {
    return {
      priceSign: '',
      priceValue: fuzzyPrice,
    }
  }
  return {
    priceSign: '',
    priceValue: '待补充',
  }
}

function buildSizeSummary(item) {
  const categories = uniqTrimmed(item?.size_categories || item?.sizeCategories || [])
  const details = uniqTrimmed(item?.size_details || item?.sizeDetails || [])
  const merged = uniqTrimmed(item?.sizes || [])
  const fallback = uniqTrimmed([item?.size, item?.size_detail, item?.sizeDetail])
  const allTerms = uniqTrimmed([...details, ...merged, ...fallback])

  const categoryHints = [
    '一分', '二分', '三分', '四分', '五分', '六分', '八分', '十二分',
    '其它大尺寸', '棉花娃', 'YoSD', 'YOSD', '幼SD', 'SD', 'MDD', 'DD',
  ]
  const detectCategory = (text) => {
    const raw = String(text || '').trim()
    if (!raw) return ''
    const lower = raw.toLowerCase()
    const found = categoryHints.find((c) => {
      const key = String(c || '').trim()
      if (!key) return false
      return raw.includes(key) || lower.includes(key.toLowerCase())
    })
    return found || ''
  }

  let normalizedCategories = [...categories]
  if (normalizedCategories.length === 0) {
    normalizedCategories = uniqTrimmed(
      allTerms.map(v => detectCategory(v)).filter(Boolean)
    )
  }

  if (normalizedCategories.length === 0) {
    return allTerms.length > 0 ? allTerms.slice(0, 2).join(' / ') : '未标注'
  }

  const counts = {}
  normalizedCategories.forEach((c) => {
    counts[c] = 0
  })

  allTerms.forEach((term) => {
    const matched = normalizedCategories.find(c => term.includes(c) || c.includes(term))
    if (matched) {
      if (term === matched) return
      counts[matched] += 1
      return
    }
    const detected = detectCategory(term)
    if (detected && Object.prototype.hasOwnProperty.call(counts, detected)) {
      counts[detected] += 1
    }
  })

  const labels = normalizedCategories.map((c) => {
    const count = Number(counts[c] || 0)
    if (count <= 1) return c
    return `${c}+${count - 1}`
  })

  return labels.join('、')
}

function normalizeGoods(item) {
  const cover = item?.goods_images?.[0] || item?.goods_image || ''
  const price = buildPriceDisplay(item)
  return {
    id: Number(item?.id || 0),
    name: item?.name || '未命名商品',
    brandName: item?.brand_name || '',
    type: item?.type || '',
    priceSign: price.priceSign,
    priceValue: price.priceValue,
    sizeSummary: buildSizeSummary(item),
    cover,
  }
}

function openFilterModal() {
  filterDraftCategories.value = [...filterCategories.value]
  showFilterModal.value = true
}

function toggleFilterDraft(value) {
  const v = String(value || '').trim()
  if (!v) return
  const idx = filterDraftCategories.value.indexOf(v)
  if (idx >= 0) {
    filterDraftCategories.value.splice(idx, 1)
  } else {
    filterDraftCategories.value.push(v)
  }
}

function clearFilterDraft() {
  filterDraftCategories.value = []
}

function applyFilterDraft() {
  filterCategories.value = [...filterDraftCategories.value]
  showFilterModal.value = false
  reloadList()
}

function changeSort(nextSort) {
  if (sortMode.value === nextSort) return
  sortMode.value = nextSort
  reloadList()
}

function clearKeyword() {
  keyword.value = ''
}

async function handleSubmitSearch() {
  const q = String(keyword.value || '').trim()
  if (!q) {
    uni.showToast({ title: '请输入关键词', icon: 'none' })
    return
  }
  manualBrandId.value = 0
  manualBrandName.value = ''
  await prepareSearchPlan()
  reloadList()
}

async function prepareSearchPlan() {
  searchPlan.value = await buildGoodsSearchPlan(keyword.value)
}

function reloadList() {
  if (pagingRef.value && typeof pagingRef.value.reload === 'function') {
    pagingRef.value.reload()
  }
}

async function onPagingQuery(pageNo, sizeFromPaging) {
  try {
    if (!token.value) {
      if (pagingRef.value) pagingRef.value.complete([], 0)
      return
    }
    const query = {
      page: pageNo,
      page_size: sizeFromPaging || pageSize,
      sort: sortMode.value === 'latest' ? 'latest' : 'relevance',
      search: searchPlan.value.search || '',
    }
    if (Number(searchPlan.value.brandId) > 0) {
      query.brand_id = Number(searchPlan.value.brandId)
    }
    if (effectiveCategories.value.length > 0) {
      query.category = effectiveCategories.value.join(',')
    }

    const res = await uni.request({
      url: websiteUrl.value + '/with-state/search-goods-result',
      method: 'GET',
      header: { Authorization: token.value },
      data: query,
    })

    if (res?.data?.status !== 'success') {
      if (pagingRef.value) pagingRef.value.complete(false)
      uni.showToast({ title: res?.data?.msg || '加载失败', icon: 'none' })
      return
    }

    const payload = res?.data?.data || {}
    const list = Array.isArray(payload?.list) ? payload.list.map(normalizeGoods) : []
    const total = Number(payload?.pagination?.total || 0)
    const safeTotal = total > 0 ? total : (pageNo * (sizeFromPaging || pageSize) + (list.length >= (sizeFromPaging || pageSize) ? 1 : 0))

    if (pagingRef.value) {
      pagingRef.value.complete(list, safeTotal)
    }
  } catch (err) {
    console.error('[search-result] onPagingQuery fail:', err)
    if (pagingRef.value) pagingRef.value.complete(false)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

function goGoods(goodsId) {
  if (!goodsId) return
  uni.navigateTo({ url: `/pages/goods/goods?goods_id=${goodsId}` })
}

onLoad(async (options) => {
  navOffsetPx.value = 0
  lastScrollTopPx.value = 0
  scrollInited.value = false
  token.value = String(uni.getStorageSync('token') || '')
  if (!token.value) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => {
      uni.navigateTo({ url: '/pages/login/login' })
    }, 300)
    return
  }

  keyword.value = decodeURIComponent(options?.q || '').trim()
  manualBrandId.value = Number(options?.brand_id || 0)
  manualBrandName.value = decodeURIComponent(options?.brand_name || '').trim()
  filterCategories.value = decodeURIComponent(options?.categories || '')
    .split(/[\s,，、/|]+/g)
    .map(v => v.trim())
    .filter(Boolean)

  await prepareSearchPlan()
  reloadList()
})
</script>

<style scoped lang="less">
.search-result-page {
  --c-bg: #f0f2f5;
  --c-panel: #eef4f8;
  --c-card: #ffffff;
  --c-line: #e3ebf3;
  --c-chip: #e9f1f7;
  --c-accent-soft: #dce8f2;
  --c-accent: #6d8093;
  --c-accent-strong: #36475b;
  --c-text-main: #1f2736;
  --c-text-sub: #667488;
  --c-text-muted: #94a3b5;
  min-height: 100vh;
  background: var(--c-bg);
}

.nav-shell {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 30;
  will-change: transform, opacity;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.nav-back-pill {
  width: 64rpx;
  height: 64rpx;
  border-radius: 32rpx;
  background: var(--c-chip);
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-search-box {
  width: 470rpx;
  max-width: 470rpx;
  height: 66rpx;
  border-radius: 33rpx;
  background: var(--c-card);
  border: 2rpx solid var(--c-line);
  box-shadow: 0 6rpx 16rpx rgba(74, 112, 146, 0.09);
  box-sizing: border-box;
  padding: 0 20rpx;
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.nav-search-input {
  flex: 1;
  min-width: 0;
  font-size: 24rpx;
  color: var(--c-text-main);
}

.nav-filter-pill {
  height: 60rpx;
  padding: 0 20rpx;
  border-radius: 30rpx;
  background: #ffffff;
  color: var(--c-accent-strong);
  border: 1rpx solid var(--c-line);
  font-size: 22rpx;
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  margin-right: 12rpx;
}

.page-body {
  position: fixed;
  inset: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.search-panel {
  padding: 8rpx 16rpx 12rpx;
  background: linear-gradient(180deg, #eef9ff 0%, #e9f3fb 42%, #edf2f7 100%);
}

.sort-row {
  margin-top: 2rpx;
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.sort-pill {
  height: 56rpx;
  padding: 0 18rpx;
  border-radius: 28rpx;
  background: var(--c-chip);
  color: var(--c-text-sub);
  font-size: 22rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.sort-pill.active {
  background: #d4e6f5;
  color: #2d4b66;
}

.active-tags {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
}

.active-tags-inner {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
}

.active-tag {
  height: 44rpx;
  line-height: 44rpx;
  padding: 0 14rpx;
  border-radius: 22rpx;
  background: #e5edf4;
  color: #4b6077;
  font-size: 21rpx;
}

.result-paging {
  flex: 1;
  min-width: 0;
  width: 100%;
}

.goods-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
  padding: 8rpx 16rpx 24rpx;
  box-sizing: border-box;
}

.goods-card {
  min-width: 0;
  width: auto;
  border-radius: 24rpx;
  overflow: hidden;
  background: var(--c-card);
  box-shadow: 0 10rpx 24rpx rgba(74, 112, 146, 0.10);
}

.goods-cover {
  display: block;
  width: 100%;
  background: #ecf1f6;
}

.goods-body {
  padding: 14rpx 14rpx 16rpx;
}

.goods-name {
  font-size: 28rpx;
  color: var(--c-text-main);
  line-height: 1.35;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.goods-brand {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: var(--c-text-sub);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.goods-meta {
  margin-top: 10rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10rpx;
}

.goods-type {
  font-size: 22rpx;
  color: var(--c-text-sub);
  max-width: 40%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.goods-price {
  display: inline-flex;
  align-items: baseline;
  gap: 4rpx;
  color: var(--c-accent-strong);
}

.goods-price-sign {
  font-size: 20rpx;
}

.goods-price-value {
  font-size: 34rpx;
  line-height: 1;
}

.goods-size-row {
  margin-top: 8rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  min-width: 0;
}

.goods-size-label {
  flex-shrink: 0;
  font-size: 20rpx;
  color: var(--c-text-muted);
}

.goods-size-text {
  min-width: 0;
  font-size: 22rpx;
  color: var(--c-text-sub);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-wrap {
  padding: 140rpx 0;
  text-align: center;
}

.empty-text {
  font-size: 24rpx;
  color: var(--c-text-muted);
}

.filter-modal {
  padding-bottom: 20rpx;
}

.filter-title {
  font-size: 34rpx;
  color: var(--c-text-main);
  text-align: center;
}

.filter-sub {
  margin-top: 10rpx;
  text-align: center;
  font-size: 23rpx;
  color: var(--c-text-muted);
}

.filter-chip-wrap {
  margin-top: 20rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.filter-chip {
  height: 54rpx;
  padding: 0 16rpx;
  border-radius: 27rpx;
  background: var(--c-chip);
  color: var(--c-text-sub);
  font-size: 23rpx;
  display: inline-flex;
  align-items: center;
}

.filter-chip.active {
  background: var(--c-accent-soft);
  color: var(--c-accent-strong);
}

.filter-actions {
  margin-top: 26rpx;
  display: flex;
  gap: 14rpx;
}

.btn-ghost,
.btn-primary {
  flex: 1;
  height: 76rpx;
  line-height: 76rpx;
  border-radius: 38rpx;
  border: none;
  font-size: 28rpx;
}

.btn-ghost {
  background: var(--c-card);
  color: var(--c-text-main);
  border: 1rpx solid var(--c-line);
}

.btn-primary {
  background: var(--c-accent);
  color: #fff;
}

.btn-ghost::after,
.btn-primary::after {
  border: none;
}
</style>
