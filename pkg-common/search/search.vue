<!-- pkg-common/search/search.vue -->
<template>
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
let reqLock = false

const placeholder = computed(() =>
  activeType.value === 'goods'
    ? '搜索娃物...'
    : `搜索${activeLabel.value}（可拼音/别名）`
)

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
  if (results.value[0]) choose(results.value[0])
}

async function fetchGoods(q) {
  const url = `${websiteUrl.value}/search-goods?search=${encodeURIComponent(
    q
  )}`
  const res = await uni.request({ url, method: 'GET' })
  results.value =
    res.data?.status === 'success' ? res.data.data || [] : []
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
      const url = `/pages/artist_info/custom_wig_artist?brand_id=${item.id}`
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
}

function switchTab(k) {
  if (activeKey.value === k) return
  activeKey.value = k
  kw.value = ''
  results.value = []
  showResults.value = false
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
