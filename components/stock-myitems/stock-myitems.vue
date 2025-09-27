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

        <!-- 🔎 搜索：跳转独立页面 -->
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

    <!-- 内容 -->
    <view class="content" v-if="baseList.length > 0">
		<shmily-drag-image
		  v-model="props.accountBookData.account_books"
		  border-radius="20"
		  @sort-change="handleSortChange"
		  :show-payment-tag="true"
		  payment-field="payment_status"
		/>

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
import { ref, computed, watch } from 'vue'
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

/* ===== 跳转搜索页 ===== */
function openSearch(){
  const list = baseList.value || []
  try { history.replaceState({ ...(history.state||{}), __stockList: list }, '') } catch {}
  try { localStorage.setItem('__stockList', JSON.stringify(list)) } catch {}
  uni.navigateTo({
    url: '/pages/stock-myitems-search/stock-myitems-search',
    success(res){
      const ec = res.eventChannel
      ec && ec.emit && ec.emit('initList', { list })
    }
  })
}

/* 顶部安全距离 */
const safeTop = ref(0)

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

/* 🔎 放大镜按钮 */
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

/* 空态 */
.empty-state {
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  min-height:50vh; padding:40rpx; text-align:center;
}
.empty-icon { width:300rpx; height:300rpx; opacity:.8; margin-bottom:40rpx; }
.empty-text { font-size:32rpx; color:#747EE5; margin-bottom:15rpx; font-weight:600; }
.empty-tip { font-size:26rpx; color:#999; line-height:1.6; }
</style>
