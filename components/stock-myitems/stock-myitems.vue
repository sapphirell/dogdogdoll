<!-- stock-myitems.vue -->
<template>
  <view class="tab_body_1st" :style="{ '--safe-top': safeTop + 'px' }">
    <!-- 顶部：分类选择 + 管理 + 搜索按钮 -->
    <view class="type-header">
      <view class="selector-container">
        <picker
          class="type-picker"
          mode="selector"
          :value="selectedType"
          :range="typeOptions"
          @change="updateSelectedType"
        >
          <view class="selector-content">
            <text class="selector-label">分类:</text>
            <text class="selector-value">{{ typeOptions[selectedType] }}</text>
            <uni-icons type="arrowdown" size="14" color="#747EE5" class="selector-icon" />
          </view>
        </picker>

        <text class="manage-btn" @tap="openTypeManager">
          <uni-icons type="gear" size="16" color="#fff" />
          <text>管理分类</text>
        </text>

        <!-- 🔎 搜索按钮（对齐修正） -->
        <button class="search-icon-btn" @click="openSearch">
          <uni-icons type="search" size="18" color="#fff" />
        </button>
      </view>
    </view>

    <!-- 合计（不受搜索影响） -->
    <view class="summary-container">
      <view class="summary-content">
        <uni-icons type="money" size="18" color="#74c9e5"></uni-icons>
        <text class="total-text">
          当前分类合计：
          <text v-if="isPriceVisible">¥{{ totalPrice }}</text>
          <text v-else>******</text>
        </text>
        <uni-icons
          :type="isPriceVisible ? 'eye' : 'eye-slash'"
          size="18"
          color="#74c9e5"
          class="toggle-eye"
          @tap="isPriceVisible = !isPriceVisible"
        />
        <text style="position:absolute;right:30px;">长按排序</text>
      </view>
    </view>

    <!-- 搜索条：聚焦吸顶 + 蒙版 -->
    <view
      v-if="showSearch"
      class="search-bar"
      :class="{ 'search-fixed': isSearchFocused }"
      :style="isSearchFocused ? { paddingTop: safePadPx } : {}"
    >
      <view class="search-input-wrap">
        <uni-icons type="search" size="18" color="#999" />
        <input
          class="search-input"
          type="text"
          v-model.trim="searchQuery"
          :focus="searchAutoFocus"
          placeholder="搜索名称/备注/品牌/尺寸等"
          @focus="onSearchFocus"
          @blur="onSearchBlur"
          confirm-type="search"
          @confirm="onSearchConfirm"
        />
        <view v-if="searchQuery" class="clear-btn" @click="clearSearch">
          <uni-icons type="closeempty" size="18" color="#bbb" />
        </view>
        <view class="cancel-btn" @click="closeSearch">取消</view>
      </view>
    </view>

    <!-- 蒙版（仅聚焦时） -->
    <view v-if="isSearchFocused" class="search-mask" @click="closeSearch"></view>

    <!-- 内容：有搜索词 -> 只读网格；无搜索词 -> 原拖拽组件 -->
    <view class="content" v-if="baseList.length > 0">
      <!-- 搜索结果模式 -->
      <view v-if="isSearching" class="grid-list">
        <view
          class="grid-card"
          v-for="item in filteredList"
          :key="item.id || item.__key || JSON.stringify(item)"
          @click="emit('go2editor', item)"
        >
          <view class="thumb">
            <!-- 带错误兜底 + 逗号多图只取首图 + 过滤 default.png -->
            <image
              v-if="getDisplayImg(item)"
              :src="getDisplayImg(item)"
              mode="aspectFill"
              class="thumb-img"
              @error="onImgError(item)"
            />
            <view v-else class="thumb-noimg">No Image</view>
          </view>
          <view class="grid-info">
            <text class="grid-title ellipsis2">{{ getItemTitle(item) }}</text>
            <text class="grid-sub ellipsis1">{{ getItemSub(item) }}</text>
          </view>
        </view>

        <view v-if="filteredList.length === 0" class="search-empty">
          <image class="empty-icon" src="/static/empty.jpg" />
          <text class="empty-text">没有匹配的物品</text>
          <text class="empty-tip">换个关键词试试～</text>
        </view>
      </view>

      <!-- 拖拽模式（无搜索词） -->
      <view v-else>
        <shmily-drag-image
          v-model="props.accountBookData.account_books"
          border-radius="20"
          @sort-change="handleSortChange"
        />
      </view>
    </view>

    <!-- 空态 -->
    <view class="empty-state" v-else>
      <image class="empty-icon" src="/static/empty.jpg" />
      <text class="empty-text">空空如也～</text>
      <text class="empty-tip">点击下方按钮添加第一个物品吧！</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { websiteUrl } from '@/common/config.js'

const props = defineProps({
  accountBookData: Object,
  activeTab: { type: Number, default: 1 }
})
const emit = defineEmits(['go2editor','update-type','init-request','update:accountBookData','open-type-manager'])

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

/* ===== 列表数据（当前分类） ===== */
const baseList = computed(() => props.accountBookData?.account_books || [])

/* ===== 合计：不受搜索影响 ===== */
const totalPrice = computed(() => {
  if (!props.accountBookData?.account_books) return '0.00'
  return props.accountBookData.account_books
    .reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0)
    .toFixed(2)
})

/* 拉取分类（父组件也会调） */
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

function updateSelectedType(e){
  selectedType.value = e.detail.value
  selectedTypeName.value = typeOptions.value[selectedType.value]
  uni.setStorageSync(SELECTED_TYPE_KEY, selectedTypeName.value)
  emit('update-type', selectedTypeName.value === '全部' ? '' : selectedTypeName.value)
}
watch([customTypes, selectedTypeName], () => {
  const list = typeOptions.value
  const want = selectedTypeName.value || '全部'
  const idx = list.findIndex(n => n === want)
  selectedType.value = idx >= 0 ? idx : 0
})
function openTypeManager(){ emit('open-type-manager') }

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

/* ===== 搜索 ===== */
const showSearch = ref(false)
const searchQuery = ref('')
const searchAutoFocus = ref(false)
const isSearchFocused = ref(false)
const closing = ref(false) // ✅ 防止取消时落回文档流闪一下

/* 顶部安全距离（吸顶留白） */
const safeTop = ref(0)
const safePadPx = computed(() => `${Math.max(0, safeTop.value) + 8}px`)

function openSearch(){
  showSearch.value = true
  nextTick(() => { searchAutoFocus.value = true })
}
function closeSearch(){
  closing.value = true
  searchAutoFocus.value = false
  uni.hideKeyboard && uni.hideKeyboard()
  // 保持 fixed 一帧，避免掉到合计下方
  setTimeout(() => {
    showSearch.value = false
    isSearchFocused.value = false
    closing.value = false
    searchQuery.value = ''
  }, 10)
}
function clearSearch(){ searchQuery.value = '' }
function onSearchFocus(){ isSearchFocused.value = true }
function onSearchBlur(){ if (!closing.value) isSearchFocused.value = false }
function onSearchConfirm(){}

/* 是否处于搜索过滤状态 */
const isSearching = computed(() => showSearch.value && searchQuery.value.trim().length > 0)

/* 匹配逻辑 */
function matchOne(val, q){
  if (!val) return false
  return String(val).toLowerCase().includes(q)
}
function matchesItem(item, q){
  if (!q) return true
  const s = q.toLowerCase()
  return (
    matchOne(item.name, s) ||
    matchOne(item.title, s) ||
    matchOne(item.remark, s) ||
    matchOne(item.brand_name, s) ||
    matchOne(item.type, s) ||
    matchOne(item.size, s) ||
    matchOne(item.size_detail, s) ||
    matchOne(item.tags, s) ||
    matchOne(item.goods_name, s)
  )
}
const filteredList = computed(() => {
  const q = searchQuery.value.trim()
  if (!q) return baseList.value
  return baseList.value.filter(it => matchesItem(it, q))
})

/* ===== NoImage 兜底 ===== */

/** 只取第一张有效图片；把 default.png 这类站位图视为无图 */
function normalizeFirstImage(s) {
  if (!s) return ''
  const first = String(s).split(',')[0].trim()
  if (!first) return ''
  const low = first.toLowerCase()
  // 识别常见站位图
  if (low.includes('/default') || low.endsWith('default.png') || low.includes('noimage')) return ''
  return first
}

/** 获取 item 原始图片字段 */
function rawItemImg(it){
  if (it.image) return it.image
  if (it.image_url) return it.image_url
  if (it.cover) return it.cover
  if (Array.isArray(it.images) && it.images.length) {
    return it.images[0]?.url || it.images[0]?.image_url || it.images[0]
  }
  return ''
}

/** 网格里用于展示的图片（带错误标记） */
function getDisplayImg(it){
  if (it.__imgBroken) return ''
  const src = normalizeFirstImage(rawItemImg(it))
  return src || ''
}

/** 图片加载失败后，标记为坏图，下一轮渲染显示 No Image */
function onImgError(it){ it.__imgBroken = true }

/** 给拖拽组件也补图（避免空白） */
const NO_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
      <rect width="100%" height="100%" fill="#e9ebef"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        fill="#9aa0a6" font-size="40" font-family="Arial">No Image</text>
    </svg>`
  )
function ensureImageFields(it){
  const first = normalizeFirstImage(rawItemImg(it))
  if (first) {
    it.image = first
    it.image_url = first
  } else {
    it.image = NO_IMG
    it.image_url = NO_IMG
  }
}
/* 首次 & 列表变化时补齐 */
watch(baseList, (list)=>{ (list||[]).forEach(ensureImageFields) }, { immediate:true, deep:true })

/* 网格模式所用的展示文案 */
function getItemTitle(it){ return it.name || it.title || it.goods_name || '未命名物品' }
function getItemSub(it){
  const brand = it.brand_name ? `@${it.brand_name}` : ''
  const size = [it.size, it.size_detail].filter(Boolean).join(' / ')
  const type = it.type || ''
  return [type, size, brand].filter(Boolean).join(' · ')
}

/* 生命周期 */
onShow(async ()=>{
  const saved = uni.getStorageSync(PRICE_VISIBLE_KEY)
  if (saved !== '') isPriceVisible.value = (saved === 'true')

  selectedTypeName.value = uni.getStorageSync(SELECTED_TYPE_KEY) || '全部'
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
.content { padding: 0 20rpx; }

/* 顶部选择与按钮 */
.type-header {
  padding: 15rpx 30rpx;
  background: linear-gradient(135deg, #f8f9ff, #eef2ff);
  border-radius: 16rpx;
  margin: 20rpx 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(116, 126, 229, 0.15);
}
.selector-container { display: flex; align-items: center; gap: 16rpx; }
.type-picker { flex: 1; }
.selector-content {
  display: flex; align-items: center;
  height: 76rpx;
  padding: 0 25rpx; background: #fff; border-radius: 12rpx;
  box-shadow: 0 2rpx 10rpx rgba(116, 126, 229, 0.1); transition: all .3s;
}
.selector-content:active { transform: translateY(2rpx); box-shadow: 0 1rpx 5rpx rgba(116,126,229,.15); }
.selector-label { font-size: 26rpx; color: #747EE5; font-weight: 600; margin-right: 15rpx; }
.selector-value { font-size: 28rpx; color: #464646; font-weight: 600; flex: 1; }
.selector-icon { margin-left: 10rpx; }

.manage-btn {
  display: inline-flex; align-items: center; justify-content:center; gap: 8rpx;
  height: 76rpx; padding: 0 30rpx;
  font-size: 26rpx; color: #fff; border-radius: 12rpx;
  background: linear-gradient(135deg, #97e7f7, #d5acd6);
  box-shadow: 0 2rpx 10rpx rgba(116,126,229,.15); white-space: nowrap;
}

/* 🔎 放大镜对齐修正：跟“管理分类”同高 */
.search-icon-btn {
  margin: 0; padding: 0 26rpx; height: 76rpx; line-height: 76rpx;
  border: none; border-radius: 12rpx;
  background: linear-gradient(135deg, #74c9e5, #86a7ff);
  color: #fff; display: inline-flex; align-items: center; justify-content: center;
  box-shadow: 0 2rpx 10rpx rgba(116,126,229,.15);
}
.search-icon-btn::after { border: none; }

/* 合计卡片 */
.summary-container { margin: 0 30rpx 20rpx; }
.summary-content {
  position: relative; display: flex; align-items: center;
  padding: 20rpx 25rpx; background: linear-gradient(135deg, #f0f9ff, #e6f7ff);
  border-radius: 12rpx; box-shadow: 0 2rpx 10rpx rgba(116, 202, 229, 0.15);
}
.total-text { font-size: 28rpx; color: #74c9e5; font-weight: bold; margin-left: 12rpx; display:flex; align-items:center; gap:8rpx; }
.toggle-eye { margin-left: 15rpx; padding: 8rpx; border-radius: 50%; background-color: rgba(116,201,229,.1); }
.toggle-eye:active { transform: scale(.9); background-color: rgba(116,201,229,.2); }

/* 搜索条 */
.search-bar { padding: 16rpx 24rpx; transition: transform .2s ease; }
.search-fixed { position: fixed; left: 0; right: 0; top: 0; z-index: 9999; background: #fff; box-shadow: 0 6rpx 18rpx rgba(0,0,0,.08); }
.search-input-wrap {
  height: 76rpx; border-radius: 38rpx; padding: 0 18rpx;
  background: #f5f6f8; display: flex; align-items: center; gap: 12rpx;
  border: 1rpx solid #eee;
}
.search-input { flex: 1; font-size: 28rpx; color: #333; }
.clear-btn { width: 40rpx; height: 40rpx; display:flex; align-items:center; justify-content:center; border-radius: 50%; }
.cancel-btn { margin-left: 6rpx; color: #74c9e5; font-size: 28rpx; padding: 8rpx 8rpx; }

/* 搜索蒙版（盖住内容，但不挡住吸顶搜索条） */
.search-mask {
  position: fixed; left: 0; right: 0; top: 0; bottom: 0; z-index: 9998;
  background: rgba(0,0,0,.35);
}

/* 搜索结果网格 */
.grid-list {
  padding: 10rpx 20rpx 30rpx;
  display: grid; grid-template-columns: 1fr 1fr; gap: 20rpx;
}
.grid-card { border-radius: 16rpx; overflow: hidden; background: #fff; box-shadow: 0 4rpx 12rpx rgba(0,0,0,.06); }
.thumb { width: 100%; height: 240rpx; background: #f2f2f2; position: relative; }
.thumb-img { width: 100%; height: 100%; display: block; }
.thumb-noimg {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  background: #e9ebef; color: #9aa0a6; font-size: 26rpx; font-weight: 600;
}
.grid-info { padding: 16rpx; }
.grid-title { font-size: 26rpx; color: #333; font-weight: 600; }
.grid-sub { font-size: 22rpx; color: #888; margin-top: 6rpx; display:block; }

/* 空态（共用） */
.empty-state,
.search-empty {
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  min-height:50vh; padding:40rpx; text-align:center;
}
.empty-icon { width:300rpx; height:300rpx; opacity:.8; margin-bottom:40rpx; }
.empty-text { font-size:32rpx; color:#747EE5; margin-bottom:15rpx; font-weight:600; }
.empty-tip { font-size:26rpx; color:#999; line-height:1.6; }

/* 文本省略 */
.ellipsis1 {
  overflow: hidden; text-overflow: ellipsis; display: -webkit-box;
  -webkit-line-clamp: 1; -webkit-box-orient: vertical;
}
.ellipsis2 {
  overflow: hidden; text-overflow: ellipsis; display: -webkit-box;
  -webkit-line-clamp: 2; -webkit-box-orient: vertical;
}
</style>
