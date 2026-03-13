<!-- stock-myitems.vue -->
<template>
  <view class="tab_body_1st" :style="{ '--safe-top': safeTop + 'px' }">
    <!-- 顶部：分类选择 + 管理 + 搜索按钮 -->
    <view class="type-header">
      <view v-if="viewMode === VIEW_MODE_ITEM" class="selector-container">
        <view class="type-picker" @tap="openTypeSelectPopup">
          <view class="selector-content">
            <view class="selector-main">
              <text class="selector-label font-title">分类</text>
              <text class="selector-value font-alimamashuhei">{{ typeOptions[selectedType] }}</text>
            </view>
            <uni-icons type="arrowdown" size="14" color="#6b84a3" class="selector-icon" />
          </view>
        </view>

        <text class="manage-btn" @tap="openTypeToolsPopup">
          <uni-icons type="more-filled" size="18" color="#fff" />
          <text class="font-title">分类工具</text>
        </text>

        <view class="setting-icon-btn" @click="openDisplaySettingPage">
          <uni-icons type="gear-filled" size="18" color="#fff" />
        </view>

        <!-- 🔎 搜索：跳转独立页面 -->
        <view class="search-icon-btn" @click="openSearch">
          <uni-icons type="search" size="18" color="#fff" />
        </view>
      </view>

      <view v-else class="selector-container selector-container-cabinet">
        <view class="cabinet-mode-banner">
          <text class="cabinet-mode-title font-alimamashuhei">柜子视图</text>
          <text class="cabinet-mode-desc">已展示全部分类，每类最多显示 5 条</text>
        </view>

        <text class="manage-btn" @tap="openTypeToolsPopup">
          <uni-icons type="more-filled" size="18" color="#fff" />
          <text class="font-title">分类工具</text>
        </text>

        <view class="setting-icon-btn" @click="openDisplaySettingPage">
          <uni-icons type="gear-filled" size="18" color="#fff" />
        </view>

        <view class="search-icon-btn" @click="openSearch">
          <uni-icons type="search" size="18" color="#fff" />
        </view>
      </view>
    </view>

    <!-- 合计（仅物品视图，不受搜索影响） -->
    <view v-if="viewMode === VIEW_MODE_ITEM" class="summary-container">
      <view class="summary-content">
        <view class="summary-main">
          <text class="summary-label font-alimamashuhei">当前分类合计</text>
          <view class="summary-price-row">
            <text class="summary-currency font-title">¥</text>
            <text v-if="isPriceVisible" class="summary-price font-title">{{ totalPrice }}</text>
            <text v-else class="summary-mask font-title">******</text>
          </view>
        </view>
        <view class="summary-side">
          <view class="toggle-eye" @tap="isPriceVisible = !isPriceVisible">
            <uni-icons :type="isPriceVisible ? 'eye' : 'eye-slash'" size="18" color="#6b84a3" />
          </view>
          <text class="sort-tip font-title">长按排序</text>
        </view>
      </view>
    </view>

    <!-- 内容 -->
    <view v-if="viewMode === VIEW_MODE_ITEM && baseList.length > 0" class="content">
		<shmily-drag-image
		  :modelValue="displayList"
		  :padding="0"
		  :item-margin="10"
		  border-radius="20"
		  @sort-change="handleSortChange"
		  :show-payment-tag="displaySetting.show_payment_tag"
		  :show-size-tag="displaySetting.show_size_tag"
		  :show-type-tag="displaySetting.show_type_tag"
		  :show-price-tag="displaySetting.show_price_tag"
		  :show-item-info="displaySetting.show_item_info"
		  payment-field="payment_status"
		/>

    </view>
    <view v-else-if="viewMode === VIEW_MODE_CABINET && cabinetTypeCards.length > 0" class="content cabinet-content">
      <view
        v-for="group in cabinetTypeCards"
        :key="`cabinet-${group.type}`"
        class="cabinet-card"
      >
        <view class="cabinet-card-head">
          <text class="cabinet-card-title font-alimamashuhei">{{ group.type }}</text>
          <text class="cabinet-card-count">已收录 {{ group.total }}</text>
        </view>
        <view class="cabinet-item-row">
          <view
            v-for="item in group.previewItems"
            :key="`cabinet-item-${group.type}-${item.id}`"
            class="cabinet-item"
            @tap="emit('go2editor', item.id)"
          >
            <image
              v-if="item.cabinetImage"
              class="cabinet-item-img"
              :src="item.cabinetImage"
              mode="aspectFill"
            />
            <view v-else class="cabinet-item-fallback">
              <uni-icons type="image" size="30" color="#a7b8cb" />
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 空态 -->
    <view class="empty-state" v-else>
      <image class="empty-icon" src="/static/empty.jpg" />
      <text class="empty-text">{{ viewMode === VIEW_MODE_CABINET ? (cabinetLoading ? '正在整理柜子…' : '还没有可展示的分类') : '空空如也～' }}</text>
      <text class="empty-tip">{{ viewMode === VIEW_MODE_CABINET ? (cabinetLoading ? '正在汇总分类和物品，请稍候' : '先添加分类或物品后，这里会自动整理展示') : '点击下方按钮添加第一个物品吧！' }}</text>
    </view>

    <!-- 分类切换弹窗 -->
    <bottom-popup :show="showTypeSelectPopup" @close="closeTypeSelectPopup">
      <view class="type-popup">
        <view class="popup-head">
          <text class="popup-title font-alimamashuhei">切换分类</text>
          <text class="popup-close font-title" @tap="closeTypeSelectPopup">关闭</text>
        </view>
        <scroll-view scroll-y class="popup-scroll">
          <view
            v-for="(typeName, idx) in typeOptions"
            :key="typeName + '-' + idx"
            class="popup-item"
            :class="{ active: selectedType === idx }"
            @tap="selectTypeByIndex(idx)"
          >
            <text class="popup-item-name font-alimamashuhei">{{ typeName }}</text>
            <uni-icons v-if="selectedType === idx" type="checkmarkempty" size="18" color="#6b84a3" />
          </view>
        </scroll-view>
      </view>
    </bottom-popup>

    <!-- 分类工具弹窗 -->
    <bottom-popup :show="showTypeToolsPopup" @close="closeTypeToolsPopup">
      <view class="type-popup">
        <view class="popup-head">
          <text class="popup-title font-alimamashuhei">分类工具</text>
          <text class="popup-close font-title" @tap="closeTypeToolsPopup">关闭</text>
        </view>
        <view class="popup-tools">
          <view class="popup-item" @tap="handleTypeToolAction('manage')">
            <view class="popup-item-texts">
              <text class="popup-item-name font-alimamashuhei">管理分类</text>
              <text class="popup-item-desc font-title">新增、编辑、删除分类</text>
            </view>
            <uni-icons type="right" size="16" color="#9aabbd" />
          </view>
          <view class="popup-item" @tap="handleTypeToolAction('refresh')">
            <view class="popup-item-texts">
              <text class="popup-item-name font-alimamashuhei">刷新分类</text>
              <text class="popup-item-desc font-title">重新获取最新分类列表</text>
            </view>
            <uni-icons type="reload" size="16" color="#9aabbd" />
          </view>
          <view
            class="popup-item"
            :class="{ disabled: selectedTypeName === '全部' }"
            @tap="handleTypeToolAction('all')"
          >
            <view class="popup-item-texts">
              <text class="popup-item-name font-alimamashuhei">切换到全部</text>
              <text class="popup-item-desc font-title">清空当前分类筛选</text>
            </view>
            <uni-icons type="undo" size="16" color="#9aabbd" />
          </view>
        </view>
      </view>
    </bottom-popup>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { websiteUrl } from '@/common/config.js'

const props = defineProps({
  accountBookData: Object,
  activeTab: { type: Number, default: 1 },
  currentType: { type: String, default: '' }
})
const emit = defineEmits(['go2editor','update-type','init-request','update:accountBookData'])
const ACCOUNT_BOOK_VIEW_MODE_KEY = 'accountBookViewMode'
const VIEW_MODE_ITEM = 'item'
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
  include_count_in_total: false
})
const displaySetting = ref({ ...DEFAULT_DISPLAY_SETTING })
const viewMode = ref(loadStoredViewMode())
const cabinetAllList = ref([])
const cabinetLoading = ref(false)

/* ===== 显示金额 ===== */
const isPriceVisible = ref(true)
const PRICE_VISIBLE_KEY = 'accountBookPriceVisible'
watch(isPriceVisible, v => uni.setStorageSync(PRICE_VISIBLE_KEY, String(v)))

/* ===== 分类 ===== */
const customTypes = ref([])
const defaultTypes = ['全部']
const SELECTED_TYPE_KEY = 'accountBookSelectedType'
function getStoredTypeName() {
  return uni.getStorageSync(SELECTED_TYPE_KEY) || '全部'
}
const selectedType = ref(0)
const selectedTypeName = ref(getStoredTypeName())
const typeOptions = computed(() => [...defaultTypes, ...customTypes.value.map(t => t.name)])
const showTypeSelectPopup = ref(false)
const showTypeToolsPopup = ref(false)

/* ===== 列表数据（当前分类） ===== */
const baseList = computed(() => props.accountBookData?.account_books || [])
const cabinetTypeCards = computed(() => {
  const sourceList = Array.isArray(cabinetAllList.value) ? cabinetAllList.value : []
  const groupedMap = new Map()
  sourceList.forEach((item) => {
    const typeName = String(item?.type || '').trim() || '未分类'
    if (!groupedMap.has(typeName)) {
      groupedMap.set(typeName, [])
    }
    groupedMap.get(typeName).push(item)
  })

  const orderedNames = []
  const pushName = (name) => {
    const safeName = String(name || '').trim()
    if (!safeName || orderedNames.includes(safeName)) return
    orderedNames.push(safeName)
  }

  customTypes.value.forEach(t => pushName(t?.name))
  groupedMap.forEach((_, name) => pushName(name))

  return orderedNames.map((name) => {
    const rows = groupedMap.get(name) || []
    const previewItems = rows
      .slice(0, 5)
      .map(item => ({
        ...item,
        cabinetImage: getCabinetItemImage(item)
      }))
    return {
      type: name,
      total: rows.length,
      previewItems
    }
  })
})

function normalizeViewMode(raw) {
  const txt = String(raw || '').trim().toLowerCase()
  if (txt === VIEW_MODE_CABINET) return VIEW_MODE_CABINET
  return VIEW_MODE_ITEM
}

function loadStoredViewMode() {
  return normalizeViewMode(uni.getStorageSync(ACCOUNT_BOOK_VIEW_MODE_KEY))
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

function resolveItemCount(item) {
  const raw = Number(item?.count ?? item?.quantity ?? item?.num)
  if (!Number.isFinite(raw)) return 1
  if (raw <= 0) return 0
  return raw
}

const displayList = computed(() => {
  const includeAdditional = !!displaySetting.value.include_additional_in_item_price
  const includeCount = !!displaySetting.value.include_count_in_item_price || !!displaySetting.value.include_count_in_total
  return (baseList.value || []).map((item) => {
    const basePrice = Number(item?.price || 0)
    const count = resolveItemCount(item)
    const additional = includeAdditional ? parseAdditionalNumeric(item?.additional_value) : 0
    const mergedBase = includeCount ? (basePrice * count) : basePrice
    const merged = mergedBase + additional
    return {
      ...item,
      display_price: normalizePriceText(merged),
      size: item?.size || item?.size_detail || ''
    }
  })
})

/* ===== 合计：不受搜索影响 ===== */
const totalPrice = computed(() => {
  if (!props.accountBookData?.account_books) return '0.00'
  const includeAdditional = !!displaySetting.value.include_additional_in_total
  const includeCount = !!displaySetting.value.include_count_in_total
  return props.accountBookData.account_books.reduce((sum, item) => {
    const basePrice = Number(item?.price || 0)
    const count = resolveItemCount(item)
    const additional = includeAdditional ? parseAdditionalNumeric(item?.additional_value) : 0
    const mergedBase = includeCount ? (basePrice * count) : basePrice
    return sum + mergedBase + additional
  }, 0).toFixed(2)
})

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
    include_count_in_total: boolOf(p.include_count_in_total, false)
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
      header: { Authorization: token }
    })
    if (String(res?.data?.status || '').toLowerCase() !== 'success') {
      return
    }
    displaySetting.value = normalizeDisplaySetting(res?.data?.data || {})
  } catch (e) {
    console.error('[stock-myitems] get display setting fail:', e)
  }
}

async function fetchCabinetAllList() {
  const token = uni.getStorageSync('token')
  if (!token) {
    cabinetAllList.value = []
    return
  }
  cabinetLoading.value = true
  try {
    const res = await uni.request({
      url: websiteUrl.value + '/with-state/account-book',
      method: 'GET',
      header: { Authorization: token }
    })
    const list = Array.isArray(res?.data?.data?.account_books) ? res.data.data.account_books : []
    cabinetAllList.value = list
  } catch (e) {
    console.error('[stock-myitems] get cabinet list fail:', e)
    cabinetAllList.value = []
  } finally {
    cabinetLoading.value = false
  }
}

/* 拉取分类 */
async function getAccountTypes() {
  const token = uni.getStorageSync('token')
  try {
    const res = await uni.request({
      url: websiteUrl.value + '/with-state/account-types',
      method: 'GET',
      header: { 'Authorization': token }
    })
    const list = res.data?.data || []
    customTypes.value = list
    const names = list.map(t => t.name)
    if (selectedTypeName.value !== '全部' && !names.includes(selectedTypeName.value)) {
      selectedTypeName.value = '全部'
      emit('update-type', '')
    }
  } catch (e) { console.error('获取分类失败:', e) }
}
defineExpose({ getAccountTypes })

watch([customTypes, selectedTypeName], () => {
  const list = typeOptions.value
  const want = selectedTypeName.value || '全部'
  const idx = list.findIndex(n => n === want)
  selectedType.value = idx >= 0 ? idx : 0
})
watch(() => props.currentType, (value) => {
  selectedTypeName.value = value || '全部'
})
function openTypeManagerPage() {
  uni.navigateTo({
    url: '/pkg-stock/stock-type-manager/stock-type-manager'
  })
}

function openDisplaySettingPage() {
  uni.navigateTo({
    url: '/pkg-stock/stock-myitems-setting/stock-myitems-setting'
  })
}
function closeTypeSelectPopup() { showTypeSelectPopup.value = false }
function openTypeSelectPopup() {
  closeTypeToolsPopup()
  showTypeSelectPopup.value = true
}
function closeTypeToolsPopup() { showTypeToolsPopup.value = false }
function openTypeToolsPopup() {
  closeTypeSelectPopup()
  showTypeToolsPopup.value = true
}
function selectTypeByIndex(idx) {
  if (idx < 0 || idx >= typeOptions.value.length) return
  selectedType.value = idx
  selectedTypeName.value = typeOptions.value[idx]
  uni.setStorageSync(SELECTED_TYPE_KEY, selectedTypeName.value)
  emit('update-type', selectedTypeName.value === '全部' ? '' : selectedTypeName.value)
  closeTypeSelectPopup()
}
function switchTypeToAll(showToast = false) {
  selectedTypeName.value = '全部'
  selectedType.value = 0
  uni.setStorageSync(SELECTED_TYPE_KEY, selectedTypeName.value)
  emit('update-type', '')
  if (showToast) uni.showToast({ title: '已切换到全部', icon: 'none' })
}
async function refreshTypeOptions(showToast = true) {
  await getAccountTypes()
  if (showToast) uni.showToast({ title: '分类已刷新', icon: 'none' })
}
async function handleTypeToolAction(action) {
  if (action === 'all' && selectedTypeName.value === '全部') {
    uni.showToast({ title: '当前已是全部', icon: 'none' })
    return
  }
  closeTypeToolsPopup()
  if (action === 'manage') {
    openTypeManagerPage()
    return
  }
  if (action === 'refresh') {
    await refreshTypeOptions(true)
    return
  }
  if (action === 'all') {
    switchTypeToAll(true)
  }
}

/* ===== 排序保存 ===== */
function handleSortChange(sortedIds){
  const token = uni.getStorageSync('token')
  uni.request({
    url: websiteUrl.value + '/with-state/sort-account-book',
    method: 'POST',
    header: { 'Authorization': token, 'Content-Type':'application/json' },
    data: { sorted_ids: sortedIds }
  })
}

/* ===== 跳转搜索页 ===== */
function openSearch(){
  // 1) 深拷贝成普通对象，避免把 Proxy 直接塞进通道/存储
  const source = viewMode.value === VIEW_MODE_CABINET ? cabinetAllList.value : baseList.value
  const list = JSON.parse(JSON.stringify(source || []))
  // 2) 全端兜底：写入 uniStorage（小程序/H5/App 都可用）
  try { uni.setStorageSync('__stockList', list) } catch (e) {}
  // 3) H5 旧兜底（保留）
  try { history.replaceState({ ...(history.state||{}), __stockList: list }, '') } catch {}
  try { localStorage.setItem('__stockList', JSON.stringify(list)) } catch {}
  uni.navigateTo({
    url: '/pkg-stock/stock-myitems-search/stock-myitems-search',
    success(res){
      const ec = res.eventChannel
    
		// 延后一帧发送，避免目标页还没完成 onLoad 里的绑定
	  const push = () => ec && ec.emit && ec.emit('initList', { list })
	  setTimeout(push, 0)
    }
  })
}

/* 顶部安全距离 */
const safeTop = ref(0)

/* 生命周期 */
onShow(async ()=>{
  viewMode.value = loadStoredViewMode()
  closeTypeSelectPopup()
  closeTypeToolsPopup()
  const saved = uni.getStorageSync(PRICE_VISIBLE_KEY)
  if (saved !== '') isPriceVisible.value = (saved === 'true')

  selectedTypeName.value = getStoredTypeName()
  await fetchDisplaySetting()
  await getAccountTypes()
  if (viewMode.value === VIEW_MODE_CABINET) {
    await fetchCabinetAllList()
  }
  const targetType = selectedTypeName.value === '全部' ? '' : selectedTypeName.value
  if (targetType !== (props.currentType || '')) {
    emit('update-type', targetType)
  }

  try {
    const wi = (uni.getWindowInfo && uni.getWindowInfo()) || uni.getSystemInfoSync()
    safeTop.value = wi?.safeAreaInsets?.top ?? wi?.statusBarHeight ?? 0
  } catch { safeTop.value = 20 }
})

watch(
  () => props.activeTab,
  async (tab) => {
    if (tab !== 1) return
    viewMode.value = loadStoredViewMode()
    if (viewMode.value === VIEW_MODE_CABINET) {
      await fetchCabinetAllList()
    }
  }
)

function getCabinetItemImage(item) {
  const src = String(item?.image_url || item?.image || '').split(',')[0].trim()
  if (!src) return ''
  const low = src.toLowerCase()
  if (low.includes('/default') || low.endsWith('default.png') || low.includes('noimage')) return ''
  return src
}
</script>

<style lang="scss" scoped>
:root { --safe-top: 0px; }
.tab_body_1st {
  width: 100%;
}

.content {
  padding: 12rpx 0 calc(148rpx + constant(safe-area-inset-bottom));
  padding: 12rpx 0 calc(148rpx + env(safe-area-inset-bottom));
}

.cabinet-content {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.cabinet-card {
  border-radius: 24rpx;
  background: linear-gradient(160deg, #ffffff 0%, #f7fbff 100%);
  box-shadow: 0 10rpx 24rpx rgba(84, 112, 137, 0.13);
  padding: 24rpx;
}

.cabinet-card-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12rpx;
}

.cabinet-card-title {
  font-size: 40rpx;
  color: #1f344a;
  line-height: 1.2;
}

.cabinet-card-count {
  font-size: 24rpx;
  color: #7d92a8;
  line-height: 1;
}

.cabinet-item-row {
  margin-top: 18rpx;
  display: flex;
  align-items: center;
  gap: 14rpx;
  flex-wrap: wrap;
}

.cabinet-item {
  width: calc((100% - 56rpx) / 5);
  aspect-ratio: 1 / 1;
  border-radius: 16rpx;
  overflow: hidden;
  background: #edf4fb;
  box-shadow: 0 8rpx 16rpx rgba(83, 113, 138, 0.14);
}

.cabinet-item-img {
  width: 100%;
  height: 100%;
  display: block;
}

.cabinet-item-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #f6f9fc 0%, #edf3f9 100%);
}

/* 顶部选择与按钮 */
.type-header {
  padding: 20rpx 20rpx 14rpx;
  background: transparent;
  margin: 0;
  border-bottom: none;
}

.selector-container {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.selector-container-cabinet {
  align-items: stretch;
}

.cabinet-mode-banner {
  flex: 1;
  min-width: 0;
  border-radius: 14rpx;
  padding: 10rpx 16rpx;
  background: transparent;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4rpx;
}

.cabinet-mode-title {
  font-size: 28rpx;
  color: #2f475f;
  line-height: 1.2;
}

.cabinet-mode-desc {
  font-size: 20rpx;
  color: #7f95ab;
  line-height: 1.3;
}

.type-picker { flex: 1; }
.selector-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80rpx;
  padding: 0 22rpx;
  background: #ffffff;
  border: 1rpx solid #dde7f3;
  border-radius: 14rpx;
  box-shadow: 0 4rpx 12rpx rgba(84, 108, 132, 0.08);
  transition: all .25s;
}
.selector-content:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 8rpx rgba(84, 108, 132, 0.12);
}

.selector-main {
  min-width: 0;
  display: flex;
  align-items: baseline;
  gap: 10rpx;
}

.selector-label {
  font-size: 21rpx;
  color: #8ea0b6;
  letter-spacing: 0.6rpx;
}

.selector-value {
  max-width: 300rpx;
  font-size: 28rpx;
  color: #35485f;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.selector-icon {
  margin-left: 10rpx;
}

.manage-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  height: 80rpx;
  padding: 0 16rpx;
  font-size: 22rpx;
  color: #fff;
  border-radius: 14rpx;
  border: none;
  background: var(--app-recommend-color);
  box-shadow: 0 4rpx 10rpx rgba(73, 202, 238, 0.24);
  white-space: nowrap;
  transition: all .25s;
  text {
	  color: #fff;
    letter-spacing: 0.4rpx;
  }

  &:active {
    transform: translateY(1rpx);
    background: var(--app-recommend-color-press);
    box-shadow: 0 2rpx 6rpx rgba(73, 202, 238, 0.3);
  }
}

/* 🔎 放大镜按钮 */
.search-icon-btn {
  margin: 0;
  padding: 0 24rpx;
  height: 80rpx;
  line-height: 80rpx;
  border: none;
  border-radius: 14rpx;
  background: var(--app-recommend-color);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 10rpx rgba(73, 202, 238, 0.24);
  transition: all .25s;

  &:active {
    transform: translateY(1rpx);
    background: var(--app-recommend-color-press);
    box-shadow: 0 2rpx 6rpx rgba(73, 202, 238, 0.3);
  }
}
.search-icon-btn::after { border: none; }

.setting-icon-btn {
  margin: 0;
  padding: 0 22rpx;
  height: 80rpx;
  line-height: 80rpx;
  border: none;
  border-radius: 14rpx;
  background: var(--app-recommend-color);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 10rpx rgba(73, 202, 238, 0.24);
  transition: all .25s;
}
.setting-icon-btn:active {
  transform: translateY(1rpx);
  background: var(--app-recommend-color-press);
  box-shadow: 0 2rpx 6rpx rgba(73, 202, 238, 0.3);
}
.setting-icon-btn::after { border: none; }

/* 合计卡片 */
.summary-container {
  margin: 0;
  padding: 0 20rpx 20rpx;
  background: transparent;
}

.summary-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
  padding: 20rpx 20rpx;
  background: #ffffff;
  border: 1rpx solid #dde8f4;
  border-radius: 16rpx;
  box-shadow: 0 6rpx 14rpx rgba(84, 108, 132, 0.08);
}

.summary-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.summary-label {
  font-size: 24rpx;
  color: #6d8097;
  line-height: 1.3;
}

.summary-price-row {
  display: flex;
  align-items: baseline;
  gap: 4rpx;
  color: #35485f;
}

.summary-currency {
  font-size: 24rpx;
  color: #6b84a3;
}

.summary-price {
  font-size: 46rpx;
  line-height: 1;
  color: #2f435c;
  letter-spacing: 0.2rpx;
}

.summary-mask {
  font-size: 36rpx;
  line-height: 1;
  color: #8ea0b6;
  letter-spacing: 1rpx;
}

.summary-side {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.toggle-eye {
  width: 56rpx;
  height: 56rpx;
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f2f7fc;
  border: 1rpx solid #dce7f3;
}

.toggle-eye:active {
  transform: scale(.94);
  background-color: #e9f1f9;
}

.sort-tip {
  font-size: 20rpx;
  color: #95a5b8;
  letter-spacing: 0.4rpx;
  white-space: nowrap;
  line-height: 1;
}

/* 底部 popup：分类切换 / 分类工具 */
.type-popup {
  background: #fff;
  border-top-left-radius: 24rpx;
  border-top-right-radius: 24rpx;
  padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
}

.popup-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10rpx 8rpx 18rpx;
}

.popup-title {
  font-size: 32rpx;
  color: #2f425a;
  letter-spacing: 0.4rpx;
}

.popup-close {
  font-size: 22rpx;
  color: #8ea0b6;
  padding: 8rpx 10rpx;
}

.popup-scroll {
  max-height: 58vh;
}

.popup-tools {
  max-height: 58vh;
  overflow-y: auto;
}

.popup-item {
  min-height: 92rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding: 0 8rpx;
  border-bottom: 1rpx solid #edf2f8;
}

.popup-item:last-child {
  border-bottom: none;
}

.popup-item.active {
  background: #f5f9ff;
}

.popup-item.disabled {
  opacity: 0.45;
}

.popup-item-texts {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  padding: 16rpx 0;
}

.popup-item-name {
  font-size: 28rpx;
  color: #35485f;
  line-height: 1.3;
}

.popup-item-desc {
  font-size: 20rpx;
  color: #97a8ba;
  line-height: 1.2;
}

/* 空态 */
.empty-state {
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  min-height:50vh; padding:40rpx; text-align:center;
}
.empty-icon { width:300rpx; height:300rpx; opacity:.8; margin-bottom:40rpx; }
.empty-text { font-size:32rpx; color:#747EE5; margin-bottom:15rpx; font-weight:600; }
.empty-tip { font-size:26rpx; color:#999; line-height:1.6; }
</style>
