<template>
  <view class="pick-page">
    <view-logs />

    <view class="search-row">
      <input
        v-model.trim="keyword"
        class="search-input"
        placeholder="搜索毛坯名称 / 头围"
        confirm-type="search"
        @confirm="onSearch"
      />
      <view class="search-btn" @tap="onSearch">搜索</view>
    </view>

    <scroll-view
      class="list-scroll"
      scroll-y
      :show-scrollbar="false"
      @scrolltolower="loadMore"
    >
      <view v-if="loading && !list.length" class="state-box">
        <loading-jump-text />
      </view>

      <view v-else-if="!list.length" class="state-box">
        <text class="state-title">暂无可选毛坯</text>
        <text class="state-desc">毛娘还没有上架可选毛坯，稍后再来看看。</text>
      </view>

      <view v-else class="list-wrap">
        <view
          v-for="item in list"
          :key="item.id"
          class="blank-card"
          :class="{ selected: Number(item.id) === selectedId }"
          @tap="handlePick(item)"
        >
          <common-image
            class="blank-cover"
            :src="item.cover_image || '/static/default-goods.png'"
            width="118"
            height="118"
            radius="14"
            mode="aspectFill"
          />
          <view class="blank-main">
            <view class="name-row">
              <text class="blank-name font-alimamashuhei">{{ item.blank_name || '未命名毛坯' }}</text>
              <text v-if="Number(item.id) === selectedId" class="selected-tag">已选</text>
            </view>
            <text class="blank-meta">头围：{{ item.head_circumference || '未填写' }}</text>
            <text class="blank-meta">库存：{{ item.quantity || 0 }}</text>
            <text class="blank-price font-title">¥{{ formatPrice(item.price) }}</text>
          </view>
        </view>
      </view>

      <view v-if="loading && list.length" class="load-more">加载中...</view>
      <view v-else-if="!hasMore && list.length" class="load-more">没有更多了</view>
    </scroll-view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { websiteUrl } from '@/common/config.js'

const planId = ref(0)
const selectedId = ref(0)
const keyword = ref('')
const page = ref(1)
const size = 20
const total = ref(0)
const list = ref([])
const loading = ref(false)

const hasMore = computed(() => list.value.length < total.value)

function tokenHeader () {
  return { Authorization: uni.getStorageSync('token') || '' }
}

function formatPrice (v) {
  const n = Number(v || 0)
  if (!Number.isFinite(n)) return '0.00'
  return n.toFixed(2)
}

async function fetchList (reset = false) {
  if (loading.value) return
  if (!planId.value) return
  if (reset) {
    page.value = 1
    list.value = []
    total.value = 0
  }
  loading.value = true
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/blank-stock/options`,
      method: 'GET',
      header: tokenHeader(),
      data: {
        plan_id: planId.value,
        page: page.value,
        size,
        search: keyword.value || ''
      }
    })
    const body = res?.data || {}
    if (String(body.status || '').toLowerCase() !== 'success') {
      uni.showToast({ title: body.msg || '加载失败', icon: 'none' })
      return
    }
    const data = body.data || {}
    const rows = Array.isArray(data.list) ? data.list : []
    total.value = Number(data.total || 0)
    if (reset) {
      list.value = rows
    } else {
      list.value = list.value.concat(rows)
    }
  } catch (e) {
    uni.showToast({ title: '网络开小差了…', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function onSearch () {
  fetchList(true)
}

function loadMore () {
  if (loading.value || !hasMore.value) return
  page.value += 1
  fetchList(false)
}

function handlePick (item) {
  if (!item || !item.id) return
  const payload = {
    id: Number(item.id),
    blank_name: String(item.blank_name || '').trim(),
    price: Number(item.price || 0),
    head_circumference: String(item.head_circumference || '').trim(),
    quantity: Number(item.quantity || 0),
    cover_image: String(item.cover_image || '').trim(),
    image_urls: Array.isArray(item.image_urls) ? item.image_urls : []
  }
  selectedId.value = payload.id
  try {
    const eventChannel = getOpenerEventChannel && getOpenerEventChannel()
    if (eventChannel && eventChannel.emit) {
      eventChannel.emit('pickBlankStock', payload)
    }
  } catch (e) {}
  try {
    uni.setStorageSync('__pickedBlankStockFromOrder', payload)
  } catch (e) {}
  uni.$emit('artist-order:pick-blank-stock', payload)
  uni.navigateBack({ delta: 1 })
}

onLoad((q = {}) => {
  planId.value = Number(q.plan_id || 0)
  selectedId.value = Number(q.selected_id || 0)
  fetchList(true)
})
</script>

<style scoped>
.pick-page {
  min-height: 100vh;
  background: #f6f8fc;
  padding: 18rpx 20rpx 0;
  box-sizing: border-box;
}

.search-row {
  display: flex;
  gap: 12rpx;
  align-items: center;
}

.search-input {
  flex: 1;
  height: 78rpx;
  padding: 0 22rpx;
  border-radius: 14rpx;
  background: #edf1f6;
  font-size: 26rpx;
  color: #2d3b55;
}

.search-btn {
  min-width: 120rpx;
  height: 78rpx;
  border-radius: 14rpx;
  background: #78daf5;
  color: #ffffff;
  font-size: 26rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.list-scroll {
  height: calc(100vh - 116rpx - env(safe-area-inset-bottom));
  margin-top: 14rpx;
}

.state-box {
  margin-top: 40rpx;
  text-align: center;
  padding: 24rpx 18rpx;
}

.state-title {
  display: block;
  font-size: 30rpx;
  color: #2e3b54;
}

.state-desc {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #74839a;
  line-height: 1.7;
}

.list-wrap {
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
}

.blank-card {
  display: flex;
  gap: 14rpx;
  align-items: center;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 14rpx;
  margin-top: 14rpx;
}

.blank-card.selected {
  background: #ecf9ff;
}

.blank-main {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.blank-name {
  min-width: 0;
  flex: 1;
  color: #1f2e49;
  font-size: 28rpx;
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selected-tag {
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
  background: #78daf5;
  color: #ffffff;
  font-size: 22rpx;
}

.blank-meta {
  color: #70809a;
  font-size: 22rpx;
}

.blank-price {
  margin-top: 2rpx;
  color: #2d3b55;
  font-size: 30rpx;
}

.load-more {
  text-align: center;
  padding: 20rpx 0 24rpx;
  color: #8a97ae;
  font-size: 23rpx;
}
</style>
