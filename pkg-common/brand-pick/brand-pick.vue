<template>
	<view-logs />
  <view class="page" :style="{ transform: `translateY(-${liftPx}px)` }">
    <!-- 圆形占位图 / logo -->
    <view class="avatar-wrap"  @tap="focusInput">
      <image
        v-if="brand.logo_image"
        :src="brand.logo_image"
        class="avatar"
        mode="aspectFill"
        :lazy-load="true"
      />
      <view v-else class="avatar ph">
        <text class="ph-text">待选择</text>
      </view>
      <!-- <view class="edit-flag"></view> -->
    </view>

    <!-- 输入与联想（同一容器，确保对齐同宽） -->
    <view class="field">
      <view class="input-row">
        <input
          v-model="keyword"
		  :focus="inputFocus"
          placeholder="请输入品牌名称"
          :maxlength="20"
          confirm-type="search"
          @confirm="doSearch"
          @input="onInput"
          @focus="onFocus"
          @blur="onBlur"
          :adjust-position="false"
          :cursor-spacing="0"
        />
        <text class="count">{{ (keyword || '').length }}/20</text>
      </view>
      <view class="hint">（请输入品牌名称）</view>

      <!-- 联想列表，与输入框同宽 -->
      <scroll-view v-if="results.length" class="assoc" scroll-y>
        <view
          class="item"
          v-for="it in results"
          :key="it.id"
          @tap="pickBrand(it)"
        >
          {{ it.name }}
        </view>
      </scroll-view>
    </view>

    <!-- 下一步 -->
    <button class="primary" :disabled="!brand.id" @tap="goNext">下一步</button>
  </view>
</template>

<script setup>
import { ref, getCurrentInstance, onUnmounted, nextTick } from 'vue'
import { searchBrands, getBrandInfo } from '@/api/associate.js'

const brand = ref({
  id: 0,
  brand_name: '',
  logo_image: ''
})
const keyword = ref('')
const results = ref([])
const focusing = ref(false) // 仅做状态记录
const liftPx = ref(0)       // JS 计算的抬起像素（px）
const inputFocus = ref(false)  

// 父级 eventChannel（用于完成时回传）
const parentEC = getCurrentInstance()?.proxy?.getOpenerEventChannel?.()


function focusInput() {
  // 保险写法：先关再开，确保各端都能重新触发一次 focus
  inputFocus.value = false
  nextTick(() => { inputFocus.value = true })
}

function onFocus() {
  focusing.value = true
  // 目标：上移 300rpx
  try {
    // uni.upx2px 在各端可用，把 rpx 转成 px
    const px = typeof uni?.upx2px === 'function' ? uni.upx2px(200) : 200
    liftPx.value = px
  } catch (e) {
    // 兜底：没有 upx2px 时近似处理
    liftPx.value = 200
  }
}
function onBlur() {
  focusing.value = false
  liftPx.value = 0
  inputFocus.value = false 
}

function doSearch() {
  fetchList()
}

function onInput(e) {
  keyword.value = typeof e === 'string' ? e : (e?.detail?.value || '')
  if (!keyword.value.trim()) {
    results.value = []
    brand.value = { id: 0, brand_name: '', logo_image: '' }
    return
  }
  fetchList()
}

let timer = null
function fetchList() {
  clearTimeout(timer)
  timer = setTimeout(async () => {
    const { data } = await searchBrands(keyword.value.trim())
    results.value = data?.status === 'success' ? (data?.data || []) : []
  }, 150)
}
onUnmounted(() => clearTimeout(timer))

async function pickBrand(item) {
  keyword.value = item.name
  results.value = []
  const { data } = await getBrandInfo(item.id)
  const b = data?.data || {}
  brand.value = {
    id: b.id,
    brand_name: b.brand_name || item.name,
    logo_image: b.logo_image || ''
  }
}

function goNext() {
  uni.navigateTo({
    url: `/pkg-common/goods-pick/goods-pick?brand_id=${brand.value.id}&brand_name=${encodeURIComponent(brand.value.brand_name)}&brand_logo=${encodeURIComponent(brand.value.logo_image || '')}`,
    'associate:done': (payload) => {
      parentEC && parentEC.emit('associate:done', payload)
      uni.navigateBack()
    }
  })
}
</script>

<style lang="less" scoped>
.page {
  min-height: 100vh;
  padding: 40rpx 40rpx calc(120rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
  transition: transform .22s ease;  /* JS 抬起的过渡 */
  will-change: transform;
}

.avatar-wrap {
  position: relative;
  width: 180rpx;
  height: 180rpx;
  margin: 80rpx auto 40rpx;
}
.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #f2f3f5;
  display: block;
}
.ph {
  border-radius: 50%;
  background: #f6f7f9;
  border: 4rpx dashed #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ph-text {
  font-size: 26rpx;
  color: #9aa0a6;
}

.edit-flag {
  position: absolute;
  right: 6rpx;
  bottom: 6rpx;
  width: 44rpx;
  height: 44rpx;
  background: #ffd84d;
  border-radius: 50%;
}

.field {
  margin: 0 auto;
  max-width: 640rpx;
  position: relative;
}

.input-row {
  position: relative;
  display: flex;
  align-items: center;
  background: #f1f1f1;
  border-radius: 16rpx;
  padding: 22rpx;
}
.input-row input {
  flex: 1;
  font-size: 28rpx;
}
.input-row .count {
  color: #c0c4cc;
  margin-left: 8rpx;
  font-size: 24rpx;
}

.hint {
  text-align: center;
  color: #c0c4cc;
  font-size: 24rpx;
  margin-top: 12rpx;
}

/* 联想列表与输入框同宽 */
.assoc {
  width: 100%;
  max-height: 50vh;
  margin-top: 12rpx;
  background: #fff;
  border-radius: 12rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, .06);
  overflow: hidden;
  z-index: 10;
}
.assoc .item {
  padding: 24rpx;
  border-bottom: 1rpx solid #f2f3f5;
  font-size: 28rpx;
}
.assoc .item:last-child {
  border-bottom: none;
}

.primary {
  margin: 80rpx auto 0;
  width: 80%;
  height: 88rpx;
  line-height: 88rpx;
  background: #a0e8ff; color: #fff;     box-shadow: 0 0 30px #00c1ff40;
  border-radius: 999rpx;
  font-weight: 600;
}
.primary:disabled {
  background: #f0f0f0;
  color: #bbb;
}
uni-button::after { border: none; }
</style>
