<!-- stock-myitems.vue -->
<template>
  <view class="tab_body_1st" :style="{ '--safe-top': safeTop + 'px' }">
    <!-- 顶部：分类选择 + 管理 + 搜索按钮 -->
    <view class="type-header">
      <view class="selector-container">
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
    </view>

    <!-- 合计（不受搜索影响） -->
    <view class="summary-container">
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
    <view class="content" v-if="baseList.length > 0">
		<shmily-drag-image
		  :modelValue="displayList"
		  :padding="0"
		  :item-margin="10"
		  border-radius="20"
		  @sort-change="handleSortChange"
		  :show-payment-tag="displaySetting.show_payment_tag"
      :show-size-tag="displaySetting.show_size_tag"
      :show-price-tag="displaySetting.show_price_tag"
		  payment-field="payment_status"
		/>

    </view>

    <!-- 空态 -->
    <view class="empty-state" v-else>
      <image class="empty-icon" src="/static/empty.jpg" />
      <text class="empty-text">空空如也～</text>
      <text class="empty-tip">点击下方按钮添加第一个物品吧！</text>
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
  activeTab: { type: Number, default: 1 }
})
const emit = defineEmits(['go2editor','update-type','init-request','update:accountBookData'])

const DEFAULT_DISPLAY_SETTING = Object.freeze({
  show_size_tag: true,
  show_price_tag: true,
  show_payment_tag: true,
  include_additional_in_item_price: false,
  include_additional_in_total: false
})
const displaySetting = ref({ ...DEFAULT_DISPLAY_SETTING })

/* ===== 显示金额 ===== */
const isPriceVisible = ref(true)
const PRICE_VISIBLE_KEY = 'accountBookPriceVisible'
watch(isPriceVisible, v => uni.setStorageSync(PRICE_VISIBLE_KEY, String(v)))

/* ===== 分类 ===== */
const customTypes = ref([])
const defaultTypes = ['全部']
const selectedType = ref(0)
const selectedTypeName = ref('全部')
const SELECTED_TYPE_KEY = 'accountBookSelectedType'
const typeOptions = computed(() => [...defaultTypes, ...customTypes.value.map(t => t.name)])
const showTypeSelectPopup = ref(false)
const showTypeToolsPopup = ref(false)

/* ===== 列表数据（当前分类） ===== */
const baseList = computed(() => props.accountBookData?.account_books || [])

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

const displayList = computed(() => {
  const includeAdditional = !!displaySetting.value.include_additional_in_item_price
  return (baseList.value || []).map((item) => {
    const basePrice = Number(item?.price || 0)
    const additional = includeAdditional ? parseAdditionalNumeric(item?.additional_value) : 0
    const merged = basePrice + additional
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
  return props.accountBookData.account_books.reduce((sum, item) => {
    const basePrice = Number(item?.price || 0)
    const additional = includeAdditional ? parseAdditionalNumeric(item?.additional_value) : 0
    return sum + basePrice + additional
  }, 0).toFixed(2)
})

function normalizeDisplaySetting(payload) {
  const p = payload || {}
  return {
    show_size_tag: p.show_size_tag !== false,
    show_price_tag: p.show_price_tag !== false,
    show_payment_tag: p.show_payment_tag !== false,
    include_additional_in_item_price: !!p.include_additional_in_item_price,
    include_additional_in_total: !!p.include_additional_in_total
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
  const list = JSON.parse(JSON.stringify(baseList.value || []))
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
  closeTypeSelectPopup()
  closeTypeToolsPopup()
  const saved = uni.getStorageSync(PRICE_VISIBLE_KEY)
  if (saved !== '') isPriceVisible.value = (saved === 'true')

  selectedTypeName.value = uni.getStorageSync(SELECTED_TYPE_KEY) || '全部'
  await fetchDisplaySetting()
  await getAccountTypes()
  emit('update-type', selectedTypeName.value === '全部' ? '' : selectedTypeName.value)

  try {
    const wi = (uni.getWindowInfo && uni.getWindowInfo()) || uni.getSystemInfoSync()
    safeTop.value = wi?.safeAreaInsets?.top ?? wi?.statusBarHeight ?? 0
  } catch { safeTop.value = 20 }
})
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
