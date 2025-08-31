<template>
  <view class="tab_body_1st">
    <!-- 分类选择器区域 -->
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
            <uni-icons type="arrowdown" size="14" color="#747EE5" class="selector-icon"></uni-icons>
          </view>
        </picker>

        <!-- 打开分类管理（新组件） -->
        <text class="manage-btn" @tap="openTypeManager">
          <uni-icons type="gear" size="16" color="#fff"></uni-icons>
          <text>管理分类</text>
        </text>
      </view>
    </view>

    <!-- 合计金额 -->
    <view class="summary-container">
      <view class="summary-content">
        <uni-icons type="money" size="18" color="#74c9e5"></uni-icons>
        <text class="total-text">当前分类合计：
          <text v-if="isPriceVisible">¥{{ totalPrice }}</text>
          <text v-else>******</text>
        </text>
        <uni-icons
          :type="isPriceVisible ? 'eye' : 'eye-slash'"
          size="18"
          color="#74c9e5"
          class="toggle-eye"
          @tap="isPriceVisible = !isPriceVisible"
        ></uni-icons>
        <text style="position: absolute;right: 30px;">长按排序</text>
      </view>
    </view>

    <!-- 内容区域 -->
    <view class="content" v-if="accountBookData.account_books?.length > 0">
      <shmily-drag-image
        v-model="accountBookData.account_books"
        border-radius="20"
        @sort-change="handleSortChange"
      ></shmily-drag-image>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-else>
      <image class="empty-icon" src="/static/empty.jpg"></image>
      <text class="empty-text">空空如也～</text>
      <text class="empty-tip">点击下方按钮添加第一个物品吧！</text>
	  
    </view>
  </view>

  <!-- 抽离后的分类管理组件 -->
  <item-category-manager v-model="showTypeMgr"
    :list="customTypes"
	@refresh="getAccountTypes()" 
    @updated="onTypesUpdated">
	  
	</item-category-manager>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { websiteUrl } from '@/common/config.js'

const props = defineProps({
  accountBookData: Object
})
const emits = defineEmits(['go2editor', 'update-type', 'init-request', 'update:accountBookData'])

/** ===== 金额显示 ===== */
const isPriceVisible = ref(true)
const PRICE_VISIBLE_KEY = 'accountBookPriceVisible'

/** ===== 分类（父级仍维护给 picker 用） ===== */
const customTypes = ref([])
const defaultTypes = ['全部']
const selectedType = ref(0)
const selectedTypeName = ref('全部')
const SELECTED_TYPE_KEY = 'accountBookSelectedType'

const typeOptions = computed(() => [...defaultTypes, ...customTypes.value.map(t => t.name)])
watch([customTypes, selectedTypeName], () => {
  const list = typeOptions.value
  const want = selectedTypeName.value || '全部'
  const idx = list.findIndex(n => n === want)
  selectedType.value = idx >= 0 ? idx : 0
})

/** ===== 合计金额 ===== */
const totalPrice = computed(() => {
  if (!props.accountBookData.account_books) return 0
  return props.accountBookData.account_books
    .reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0)
    .toFixed(2)
})

/** ===== 拉取分类（用于父级 picker） ===== */
const getAccountTypes = async () => {
  const token = uni.getStorageSync('token')
  try {
    const res = await uni.request({
      url: websiteUrl.value + '/with-state/account-types',
      method: 'GET',
      header: { 'Authorization': token }
    })
    customTypes.value = res.data.data || []
  } catch (err) {
    console.error('获取分类失败:', err)
  }
}

/** ===== 本地存储选中分类 ===== */
const saveSelectedType = () => {
  uni.setStorageSync(SELECTED_TYPE_KEY, selectedTypeName.value)
}
const loadSelectedType = () => {
  const saved = uni.getStorageSync(SELECTED_TYPE_KEY)
  selectedTypeName.value = saved || '全部'
}

/** ===== 打开分类管理（新组件） ===== */
const showTypeMgr = ref(false)
const openTypeManager = async () => {
  // 父级保持已有列表，组件会在打开时自行拉取并 @updated 回传
  showTypeMgr.value = true
}
/** 接收子组件回传的最新列表 */
const onTypesUpdated = (list) => {
  customTypes.value = list || []
  // 如果当前选中的分类在更新后不存在了，回退到“全部”
  const names = customTypes.value.map(t => t.name)
  if (selectedTypeName.value !== '全部' && !names.includes(selectedTypeName.value)) {
    selectedTypeName.value = '全部'
    emits('update-type', '')
  }
}

/** ===== 列表内“物品”排序（与你原逻辑一致） ===== */
const handleSortChange = (sortedIds) => {
  const token = uni.getStorageSync('token')
  uni.request({
    url: websiteUrl.value + '/with-state/sort-account-book',
    method: 'POST',
    header: {
      'Authorization': token,
      'Content-Type': 'application/json'
    },
    data: { sorted_ids: sortedIds }
  })
}

/** ===== 分类选择切换 ===== */
const updateSelectedType = (e) => {
  selectedType.value = e.detail.value
  selectedTypeName.value = typeOptions.value[selectedType.value]
  saveSelectedType()
  emits('update-type', selectedTypeName.value === '全部' ? '' : selectedTypeName.value)
}

/** ===== 生命周期 ===== */
watch(isPriceVisible, (v) => uni.setStorageSync(PRICE_VISIBLE_KEY, String(v)))
onShow(async () => {
  const saved = uni.getStorageSync(PRICE_VISIBLE_KEY)
  if (saved !== '') isPriceVisible.value = (saved === 'true')

  loadSelectedType()
  await getAccountTypes()
  emits('update-type', selectedTypeName.value === '全部' ? '' : selectedTypeName.value)
})
</script>

<style lang="scss" scoped>
.content { padding: 0 20rpx; }

/* 顶部选择与按钮 */
.type-header {
  padding: 15rpx 30rpx;
  background: linear-gradient(135deg, #f8f9ff, #eef2ff);
  border-radius: 16rpx;
  margin: 20rpx 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(116, 126, 229, 0.15);
}
.selector-container { display: flex; align-items: center; justify-content: space-between; }
.type-picker { flex: 1; }
.selector-content {
  display: flex; align-items: center;
  padding: 20rpx 25rpx; background: #fff; border-radius: 12rpx;
  box-shadow: 0 2rpx 10rpx rgba(116, 126, 229, 0.1); transition: all 0.3s ease;
}
.selector-content:active { transform: translateY(2rpx); box-shadow: 0 1rpx 5rpx rgba(116,126,229,.15); }
.selector-label { font-size: 26rpx; color: #747EE5; font-weight: 600; margin-right: 15rpx; }
.selector-value { font-size: 28rpx; color: #464646; font-weight: 600; flex: 1; }
.selector-icon { margin-left: 10rpx; }

.manage-btn {
  display: flex; align-items: center;
  font-size: 26rpx; color: #fff;
  background: linear-gradient(135deg, #97e7f7, #d5acd6);
  padding: 20rpx 30rpx; border-radius: 12rpx; margin-left: 20rpx; transition: all .3s;
}
.manage-btn:active { transform: translateY(2rpx); box-shadow: 0 2rpx 8rpx rgba(116,126,229,.3); }
.manage-btn text { color: #fff; margin-left: 10rpx; }

/* 合计卡片 */
.summary-container { margin: 0 30rpx 20rpx; }
.summary-content {
  position: relative; display: flex; align-items: center;
  padding: 20rpx 25rpx; background: linear-gradient(135deg, #f0f9ff, #e6f7ff);
  border-radius: 12rpx; box-shadow: 0 2rpx 10rpx rgba(116, 202, 229, 0.15);
}
.total-text { font-size: 28rpx; color: #74c9e5; font-weight: bold; margin-left: 12rpx; display:flex; align-items:center; gap:8rpx; }
.toggle-eye {
  margin-left: 15rpx; padding: 8rpx; border-radius: 50%; background-color: rgba(116, 201, 229, 0.1); transition: all .3s;
}
.toggle-eye:active { transform: scale(.9); background-color: rgba(116, 201, 229, 0.2); }

/* 空态 */
.empty-state {
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  min-height:50vh; padding:40rpx; text-align:center;
}
.empty-icon { width:300rpx; height:300rpx; opacity:.8; margin-bottom:40rpx; }
.empty-text { font-size:32rpx; color:#747EE5; margin-bottom:15rpx; font-weight:600; }
.empty-tip { font-size:26rpx; color:#999; line-height:1.6; }
</style>
