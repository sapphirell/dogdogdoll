<!-- pkg-common/search/search.vue -->
<template>
  <view-logs />
<!-- 顶部：淡紫色固定导航（中间 Tabs，左侧 uni-icons 返回） -->
  <uni-nav-bar
    fixed
    :statusBar="true"
    :border="false"
    backgroundColor="#def9ff"
    color="#111"
  >
    <!-- 中间槽：Tabs（等分四栏，完全显示） -->
    <view class="nav-center">
      <view class="nav-tabs">
        <view
          v-for="t in tabs"
          :key="t.key"
          class="nav-tab"
          :class="{ active: t.key === activeKey }"
          @tap="switchTab(t.key)"
        >
          <text class="nav-tab-text">{{ t.label }}</text>
        </view>
      </view>
    </view>

    <!-- 左侧返回 -->
    <template #left>
      <view class="nav-left" @tap="goBack" aria-label="返回">
        <uni-icons type="left" size="22" color="#111" />
      </view>
    </template>
    <!-- 右侧删除：不渲染 -->
  </uni-nav-bar>

  <view class="page">
    <!-- 吸顶搜索框 -->
    <view class="sticky-search">
      <view class="search-box">
        <image class="icon" src="/static/search.png" />
        <input
          class="input"
          :placeholder="placeholder"
          v-model="kw"
          confirm-type="search"
          :focus="inputFocused"
          @input="onInput"
          @confirm="onSubmit"
          @focus="onFocus"
        />
        <image
          v-if="kw"
          class="icon"
          src="/static/cancel.png"
          @tap="clearInput"
        />
      </view>

      <!-- 联想结果 -->
      <view v-if="showResults" class="mask" @tap="closeResults" />
      <scroll-view
        v-if="results.length"
        class="results"
        scroll-y
      >
        <view
          v-if="activeType === 'goods' && (structuredHint || structuredCategories.length || structuredBrandCandidates.length)"
          class="intent-panel"
        >
          <text v-if="structuredHint" class="intent-hint">{{ structuredHint }}</text>
          <view v-if="structuredCategories.length || structuredBrandName" class="intent-tags">
            <text
              v-if="structuredBrandName"
              class="intent-chip brand"
              @tap="clearStructuredBrandLimit"
            >
              品牌：{{ structuredBrandName }} ×
            </text>
            <text
              v-for="cate in structuredCategories"
              :key="`cate-${cate}`"
              class="intent-chip"
            >
              {{ cate }}
            </text>
          </view>
          <view v-if="structuredBrandCandidates.length" class="intent-brand-candidates">
            <text class="intent-candidates-title">品牌候选：</text>
            <view class="intent-candidates-list">
              <text
                v-for="item in structuredBrandCandidates"
                :key="`candidate-${item.id}`"
                class="intent-candidate"
                @tap="applyStructuredBrand(item)"
              >
                {{ item.name }}
              </text>
            </view>
          </view>
        </view>
        <view
          class="result"
          v-for="item in results"
          :key="item.id"
          @tap="choose(item)"
        >
          <view
            v-if="activeType === 'goods' && item.brand_name"
            class="tag"
          >
            {{ item.brand_name }}
          </view>
          <text class="name">{{ item.name }}</text>
        </view>
        <view class="result close" @tap="closeResults">关闭联想</view>
      </scroll-view>
    </view>

    <!-- 历史（最多50，超五行折叠） -->
    <view class="history" v-if="historyList.length">
      <view class="history-head">
        <text class="title">历史搜索</text>
        <text class="clear" @tap="clearAll">清空</text>
      </view>

      <view class="chips" :class="{ collapsed }" ref="chipsRef">
        <view
          class="chip"
          v-for="(w, i) in historyList"
          :key="w.key"
          @tap="tapHistory(w)"
          @longpress="removeOne(i)"
        >
          {{ w.name }}
        </view>
        <view v-if="needMask" class="chips-mask" />
      </view>

      <view v-if="needFoldBtn" class="fold">
        <text class="btn" @tap="toggleFold">
          {{ collapsed ? '展开' : '收起' }}
        </text>
      </view>
    </view>

    <view style="height: 40rpx" />
  </view>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { websiteUrl } from '@/common/config.js'

/** Tab 映射：1=娃物 2=店铺 3=妆师 4=毛娘 */
const TAB_MAP = {
  1: { key: 1, label: '娃物', type: 'goods', index: '' },
  2: { key: 2, label: '店铺', type: 'brand', index: '' },
  3: { key: 3, label: '妆师', type: 'artist', index: 'bjd_artist' },
  4: { key: 4, label: '毛娘', type: 'hair', index: 'hairstylist' },
}

// 导航高度（状态栏 + 44px）
const statusBar = uni.getSystemInfoSync()?.statusBarHeight || 0
const NAV_BAR_BODY = 44
const navHeight = statusBar + NAV_BAR_BODY

/* 路由参数 */
const routeMode = ref('jump')
const orderedKeys = ref([1, 2, 3, 4])

/* Tabs 渲染与状态 */
const tabs = computed(() =>
  orderedKeys.value.map(k => TAB_MAP[k]).filter(Boolean)
)
const activeKey = ref(orderedKeys.value[0])
const activeType = computed(() => TAB_MAP[activeKey.value].type)
const activeLabel = computed(() => TAB_MAP[activeKey.value].label)
const activeIndexParam = computed(() => TAB_MAP[activeKey.value].index)

/* 搜索与联想 */
const kw = ref('')
const results = ref([])
const showResults = ref(false)
const inputFocused = ref(false) // 搜索框焦点控制
const structuredHint = ref('')
const structuredCategories = ref([])
const structuredBrandName = ref('')
const structuredBrandCandidates = ref([])
const manualStructuredBrand = ref(null) // { id, name, queryKey }
const skipAutoBrandResolveQueryKey = ref('')
let reqLock = false

const placeholder = computed(() =>
  activeType.value === 'goods'
    ? '搜索娃物 / 品牌 空格 品类 / 品类'
    : `搜索${activeLabel.value}（可拼音/别名）`
)

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
  aliases.concat([item.value]).forEach(alias => {
    const key = String(alias || '').trim().toLowerCase()
    if (!key) return
    acc[key] = item.value
  })
  return acc
}, {})

/* 历史 */
const chipsRef = ref(null)
const MAX_HISTORY = 50
const collapsed = ref(true)
const needMask = ref(false)
const needFoldBtn = ref(false)
const historyList = ref([])
const STORAGE_KEY = computed(() => `search_history_${activeKey.value}`)

function loadHistory() {
  try {
    const raw = uni.getStorageSync(STORAGE_KEY.value)
    historyList.value = Array.isArray(raw) ? raw.slice(0, MAX_HISTORY) : []
  } catch {
    historyList.value = []
  }
  nextTick(measureFold)
}
function saveHistory() {
  try {
    uni.setStorageSync(
      STORAGE_KEY.value,
      historyList.value.slice(0, MAX_HISTORY)
    )
  } catch {}
}
function pushHistory(name, payload) {
  const key = String(payload?.id || name || '')
  historyList.value = [
    { key, name, payload },
    ...historyList.value.filter(x => x.key !== key),
  ].slice(0, MAX_HISTORY)
  saveHistory()
  nextTick(measureFold)
}
function clearAll() {
  historyList.value = []
  saveHistory()
  nextTick(measureFold)
}
function removeOne(i) {
  historyList.value.splice(i, 1)
  saveHistory()
  nextTick(measureFold)
}

/**
 * 点击历史：
 * - jump 模式：填充关键词 + 聚焦输入框 + 触发联想弹出
 * - return 模式：保持原有行为，直接回传/跳转
 */
function tapHistory(w) {
  kw.value = w.name || ''
  if (routeMode.value === 'return') {
    // 保持原逻辑：直接使用
    choose(w.payload || { id: w.key, name: w.name })
    return
  }
  // 普通搜索页：弹出搜索框
  inputFocused.value = true
  onInput() // 主动触发一次联想请求
}

/* 五行折叠测量 */
const rpx2px = r =>
  ((uni.getSystemInfoSync().windowWidth || 375) / 750) * r
async function measureFold() {
  await nextTick()
  uni
    .createSelectorQuery()
    .select('.chips')
    .boundingClientRect(rect => {
      // 大约 44rpx 一行，5 行 ≈ 220rpx
      const fiveLines = rpx2px(220)
      needFoldBtn.value = !!rect && rect.height > fiveLines
      needMask.value = collapsed.value && needFoldBtn.value
    })
    .exec()
}
function toggleFold() {
  collapsed.value = !collapsed.value
  needMask.value = collapsed.value && needFoldBtn.value
}

/* 搜索行为 */
function onFocus() {
  inputFocused.value = true
  if (results.value.length) showResults.value = true
}
function clearInput() {
  kw.value = ''
  results.value = []
  showResults.value = false
  clearStructuredState()
  manualStructuredBrand.value = null
  skipAutoBrandResolveQueryKey.value = ''
}
function closeResults() {
  showResults.value = false
  // 不强制失焦，方便用户继续编辑
}

async function onInput() {
  const q = kw.value.trim()
  if (!q) {
    results.value = []
    showResults.value = false
    return
  }
  showResults.value = true
  if (reqLock) return
  reqLock = true
  try {
    if (activeType.value === 'goods') {
      await fetchGoods(q)
    } else {
      await fetchIndex(q, activeIndexParam.value)
    }
  } finally {
    reqLock = false
  }
}

async function onSubmit() {
  const q = String(kw.value || '').trim()
  if (!q) return

  if (routeMode.value === 'return') {
    if (results.value[0]) choose(results.value[0])
    return
  }

  if (activeType.value === 'goods') {
    const token = uni.getStorageSync('token')
    if (!token) {
      uni.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    const query = [`q=${encodeURIComponent(q)}`]
    const parsed = parseGoodsQuery(q)
    if (parsed.categories.length > 0) {
      query.push(`categories=${encodeURIComponent(parsed.categories.join(','))}`)
    }
    const queryKey = normalizeQueryKey(q)
    const hasManualBrand = !!(
      manualStructuredBrand.value &&
      manualStructuredBrand.value.queryKey === queryKey &&
      +manualStructuredBrand.value.id > 0
    )
    if (hasManualBrand) {
      query.push(`brand_id=${encodeURIComponent(String(+manualStructuredBrand.value.id))}`)
      query.push(`brand_name=${encodeURIComponent(String(manualStructuredBrand.value.name || ''))}`)
    }
    uni.navigateTo({
      url: `/pkg-common/search/result?${query.join('&')}`,
    })
    return
  }

  if (results.value[0]) {
    choose(results.value[0])
  }
}

async function fetchGoods(q) {
  const parsed = parseGoodsQuery(q)
  const queryKey = normalizeQueryKey(q)
  const hasManualBrand = !!(
    manualStructuredBrand.value &&
    manualStructuredBrand.value.queryKey === queryKey &&
    +manualStructuredBrand.value.id > 0
  )

  let brandId = hasManualBrand ? +manualStructuredBrand.value.id : 0
  let brandName = hasManualBrand ? String(manualStructuredBrand.value.name || '') : ''
  let brandCandidates = []
  let keywordForGoods = parsed.brandAndKeywordText
  const shouldTryAutoBrand =
    !hasManualBrand &&
    keywordForGoods &&
    skipAutoBrandResolveQueryKey.value !== queryKey

  // 手动选择了品牌时，默认把首个词作为品牌词，其余作为商品词，避免“品牌词+商品词”整体参与商品名搜索。
  if (hasManualBrand && parsed.nonCategoryTokens.length >= 2) {
    keywordForGoods = parsed.nonCategoryTokens.slice(1).join(' ').trim()
  }

  if (shouldTryAutoBrand) {
    if (parsed.nonCategoryTokens.length >= 2) {
      const resolved = await resolveBrandAndKeywordFromTokens(parsed.nonCategoryTokens)
      if (resolved.matched) {
        brandId = +resolved.matched.id
        brandName = resolved.matched.name || ''
        keywordForGoods = resolved.keyword
      }
      if (resolved.candidates.length > 0) {
        brandCandidates = resolved.candidates
      }
    }

    // 兜底：如果多词未命中高置信品牌，或单词输入，仍尝试按整体词识别品牌。
    if (brandId <= 0 && keywordForGoods) {
      const fallbackCandidates = await fetchBrandCandidates(keywordForGoods)
      if (fallbackCandidates.length > 0) {
        brandCandidates = fallbackCandidates
      }
      const matched = pickHighConfidenceBrand(fallbackCandidates, keywordForGoods)
      if (matched) {
        brandId = +matched.id
        brandName = matched.name || ''
        if (!keywordForGoods || normalizeQueryKey(keywordForGoods) === normalizeQueryKey(brandName)) {
          keywordForGoods = ''
        }
      }
    }
  } else if (!hasManualBrand && keywordForGoods && parsed.nonCategoryTokens.length >= 2) {
    const resolved = await resolveBrandAndKeywordFromTokens(parsed.nonCategoryTokens)
    if (resolved.candidates.length > 0) {
      brandCandidates = resolved.candidates
    }
  }

  if (parsed.categories.length > 0) {

    if (brandId > 0) {
      structuredHint.value = `已按品牌 + 品类限定`
    } else if (keywordForGoods) {
      structuredHint.value = `已按品类限定；品牌未锁定`
    } else {
      structuredHint.value = `已按品类限定`
    }

    structuredCategories.value = parsed.categories.slice(0, 4)
    structuredBrandName.value = brandName
    structuredBrandCandidates.value = brandCandidates.slice(0, 3).filter(item => item && +item.id > 0)

    const data = await fetchGoodsByParams({
      search: keywordForGoods,
      brandId,
      categories: parsed.categories,
    })
    results.value = data
    return
  }

  // 无品类：支持“品牌 + 关键词”限定搜索
  if (brandId > 0) {
    structuredHint.value = `已按品牌限定`
    structuredCategories.value = []
    structuredBrandName.value = brandName
    structuredBrandCandidates.value = []
    const data = await fetchGoodsByParams({
      search: keywordForGoods,
      brandId,
      categories: [],
    })
    results.value = data
    return
  }

  // 无品类且未锁定品牌：展示候选品牌，允许用户手动点选后再限定
  if (parsed.nonCategoryTokens.length >= 2 && brandCandidates.length > 0) {
    structuredHint.value = `未锁定品牌，可点选候选`
    structuredCategories.value = []
    structuredBrandName.value = ''
    structuredBrandCandidates.value = brandCandidates.slice(0, 3).filter(item => item && +item.id > 0)
    const data = await fetchGoodsByParams({ search: q, brandId: 0, categories: [] })
    results.value = data
    return
  }

  clearStructuredState()
  manualStructuredBrand.value = null
  skipAutoBrandResolveQueryKey.value = ''
  const data = await fetchGoodsByParams({ search: q, brandId: 0, categories: [] })
  results.value = data
}

async function fetchIndex(q, indexVal) {
  let url = `${websiteUrl.value}/search-brand?search=${encodeURIComponent(
    q
  )}`
  if (indexVal) url += `&index=${indexVal}`
  const res = await uni.request({ url, method: 'GET' })
  results.value =
    res.data?.status === 'success' ? res.data.data || [] : []
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
    const keyword = nonEmpty.slice(split).join(' ').trim()
    const probeKey = normalizeQueryKey(brandProbe)
    if (!brandProbe || !keyword || !probeKey || tried.has(probeKey)) {
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
        keyword,
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

  // 候选多个时：若第一名是明显前缀命中，且第二名不是同等级前缀命中，则默认锁定第一名。
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

async function fetchBrandCandidates(keyword) {
  const q = String(keyword || '').trim()
  if (!q) return []
  const url = `${websiteUrl.value}/search-brand?search=${encodeURIComponent(q)}`
  const res = await uni.request({ url, method: 'GET' })
  const list = res.data?.status === 'success' ? res.data.data || [] : []
  return Array.isArray(list) ? list : []
}

async function fetchGoodsByParams({ search = '', brandId = 0, categories = [] } = {}) {
  const params = []
  const searchText = String(search || '').trim()
  if (searchText) {
    params.push(`search=${encodeURIComponent(searchText)}`)
  }
  if (+brandId > 0) {
    params.push(`brand_id=${encodeURIComponent(String(brandId))}`)
  }
  if (Array.isArray(categories) && categories.length > 0) {
    params.push(`category=${encodeURIComponent(categories.join(','))}`)
  }

  const url = `${websiteUrl.value}/search-goods${params.length ? `?${params.join('&')}` : ''}`
  const res = await uni.request({ url, method: 'GET' })
  const list = res.data?.status === 'success' ? res.data.data || [] : []
  return Array.isArray(list) ? list : []
}

function clearStructuredState() {
  structuredHint.value = ''
  structuredCategories.value = []
  structuredBrandName.value = ''
  structuredBrandCandidates.value = []
}

function applyStructuredBrand(item) {
  const queryKey = normalizeQueryKey(kw.value)
  if (!queryKey || !item || +item.id <= 0) return
  manualStructuredBrand.value = {
    id: +item.id,
    name: item.name || '',
    queryKey,
  }
  skipAutoBrandResolveQueryKey.value = ''
  onInput()
}

function clearStructuredBrandLimit() {
  const queryKey = normalizeQueryKey(kw.value)
  manualStructuredBrand.value = null
  if (queryKey) {
    skipAutoBrandResolveQueryKey.value = queryKey
  }
  onInput()
}

/* 选择一个结果 */
function choose(item) {
  pushHistory(item.name, {
    id: item.id,
    name: item.name,
    brand_name: item.brand_name,
  })

  if (routeMode.value === 'jump') {
    if (activeType.value === 'goods') {
      // 娃物
      uni.navigateTo({
        url: `/pages/goods/goods?goods_id=${item.id}`,
      })
    } else if (activeType.value === 'brand') {
      // 品牌主页
      uni.navigateTo({
        url: `/pages/brand/brand?brand_id=${item.id}`,
      })
    } else if (activeType.value === 'artist') {
      // 妆师：跳妆师主页
      const url = `/pkg-creator/creator_base/bjd_faceup_artist/bjd_faceup_artist?brand_id=${item.id}`
	   uni.navigateTo({
		 url: url,
	   })
    } else if (activeType.value === 'hair') {
      // 毛娘：跳毛娘主页
      const url = `/pkg-creator/creator_base/hair_artist/hair_artist?brand_id=${item.id}`
      uni.navigateTo({ url })
    }
  } else {
    const payload = {
      tabKey: activeKey.value,
      tabLabel: activeLabel.value,
      id: item.id,
      name: item.name,
      brand_name: item.brand_name || '',
    }
    const eventChannel = typeof getOpenerEventChannel === 'function'
      ? getOpenerEventChannel()
      : null
    if (eventChannel && eventChannel.emit) {
      eventChannel.emit('search-selected', payload)
    } else {
      uni.$emit('search-selected', payload)
    }
    uni.navigateBack()
  }
  results.value = []
  showResults.value = false
  clearStructuredState()
  manualStructuredBrand.value = null
  skipAutoBrandResolveQueryKey.value = ''
}

function switchTab(k) {
  if (activeKey.value === k) return
  activeKey.value = k
  kw.value = ''
  results.value = []
  showResults.value = false
  clearStructuredState()
  manualStructuredBrand.value = null
  skipAutoBrandResolveQueryKey.value = ''
  collapsed.value = true
  loadHistory()
}

function goBack() {
  uni.navigateBack({ delta: 1 })
}

/* 生命周期：读路由、初始化 */
onLoad(opt => {
  const m = (opt?.mode || '').toLowerCase()
  if (m === 'return') routeMode.value = 'return'

  const raw = opt?.tabs
  if (typeof raw === 'string' && raw.trim()) {
    const keys = raw
      .split(',')
      .map(s => parseInt(s.trim(), 10))
      .filter(k => TAB_MAP[k])
    if (keys.length) orderedKeys.value = keys
  }
  activeKey.value = orderedKeys.value[0] || 1
  loadHistory()
})

onMounted(() => {
  nextTick(measureFold)
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #fff;
}

/* ===== 导航中间 Tabs（等分四栏） ===== */
.nav-center {
  width: 100vw;
  box-sizing: border-box;
}
.nav-tabs {
  height: 65rpx;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 15rpx;
}
.nav-tab {
  flex: 1 1 0%;
  min-width: 0;
  text-align: center;
  padding: 6rpx 6rpx 12rpx;
  position: relative;
}
.nav-tab-text {
  display: block;
  max-width: 100%;
  font-size: 26rpx;
  line-height: 1.2;
  color: #8f94a6;
  font-weight: 600;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.nav-tab.active .nav-tab-text {
  color: #4b5160;
}
/* 选中下划线 */
.nav-tab.active::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -6rpx;
  transform: translateX(-50%);
  width: 60rpx;
  height: 6rpx;
  background: #ffb98c;
  border-radius: 6rpx;
}

/* 左侧返回触控区 */
.nav-left {
  padding: 0 16rpx;
  height: 44px;
  display: flex;
  align-items: center;
}

/* ===== 搜索 & 联想 ===== */
.sticky-search {
  position: sticky;
  z-index: 9;
  background: #fff;
  padding: 18rpx 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);
  background: linear-gradient(180deg, #def9ff, #d6e4f2);
}
.search-box {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 12rpx;
  height: 72rpx;
  padding: 0 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.03);
}
.icon {
  width: 36rpx;
  height: 36rpx;
}
.input {
  flex: 1;
  padding: 0 14rpx;
  font-size: 23rpx;
}

.mask {
  position: fixed;
  inset: 0;
  z-index: 19;
  background: rgba(0, 0, 0, 0);
}
.results {
  position: absolute;
  left: 24rpx;
  right: 24rpx;
  margin-top: 8rpx;
  background: #fff;
  border-radius: 12rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
  max-height: 60vh;
  z-index: 20;
  width: calc(100vw - 48rpx);
}
.intent-panel {
  padding: 18rpx 20rpx 10rpx;
  border-bottom: 1rpx solid #f0f3f8;
  background: #f8fbff;
}
.intent-hint {
  display: block;
  color: #6b7895;
  font-size: 22rpx;
  margin-bottom: 8rpx;
}
.intent-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-bottom: 8rpx;
}
.intent-chip {
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  color: #576380;
  background: #e9eff8;
}
.intent-chip.brand {
  color: #2f6fa0;
  background: #dff0ff;
}
.intent-brand-candidates {
  display: flex;
  align-items: flex-start;
  gap: 8rpx;
}
.intent-candidates-title {
  font-size: 20rpx;
  color: #8a92a6;
  line-height: 1.8;
}
.intent-candidates-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  flex: 1;
}
.intent-candidate {
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  color: #2b6cb0;
  background: #eaf4ff;
}
.result {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}
.result:last-child {
  border-bottom: none;
}
.result:active {
  background: #f8f8f8;
}
.result .tag {
  background: #f0f2f5;
  color: #666;
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
  margin-right: 16rpx;
  max-width: 200rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.result .name {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.result.close {
  justify-content: center;
  color: #aaa;
}

/* 历史 */
.history {
  padding: 20rpx 24rpx 0;
}
.history-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12rpx;
}
.history-head .title {
  font-size: 26rpx;
  color: #6b7280;
}
.history-head .clear {
  font-size: 24rpx;
  color: #a3a3a3;
}
.chips {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx 16rpx;
  overflow: hidden;
  transition: max-height 0.2s ease;
}
/* 折叠时最多显示约 5 行 */
.chips.collapsed {
  max-height: 220rpx;
}
.chip {
  padding: 12rpx 18rpx;
  background: #f3f4f6;
  border-radius: 999px;
  color: #4b5563;
  font-size: 24rpx;
}
.chips-mask {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 36rpx;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0), #f7f8fa);
}
.fold {
  display: flex;
  justify-content: center;
  margin-top: 8rpx;
}
.fold .btn {
  font-size: 24rpx;
  color: #7c91b8;
}
</style>
