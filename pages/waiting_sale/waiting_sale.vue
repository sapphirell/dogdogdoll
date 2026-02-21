<template>
  <view-logs />
  <view class="waiting-sale-page">
    <zhouWei-navBar
      type="transparentFixed"
      :backState="2000"
      :homeState="2000"
      fontColor="#1f2f46"
      transparentFixedFontColor="#1f2f46"
      :scrollTop="scrollTop"
      :titleCenter="true"
      title="待售列表"
    >
      <template #left>
        <view class="nav-back-pill" @click="goBack">
          <uni-icons type="left" size="22" color="#1f2f46" />
        </view>
      </template>
      <template #transparentFixedLeft>
        <view class="nav-back-pill" @click="goBack">
          <uni-icons type="left" size="22" color="#1f2f46" />
        </view>
      </template>
      <template #right>
        <view class="nav-help-pill" @tap="showDisclaimerModal = true">
          <uni-icons type="help" size="18" color="#1f2f46" />
        </view>
      </template>
      <template #transparentFixedRight>
        <view class="nav-help-pill" @tap="showDisclaimerModal = true">
          <uni-icons type="help" size="18" color="#1f2f46" />
        </view>
      </template>
    </zhouWei-navBar>

    <view class="page-body" :style="{ paddingTop: headerPadPx }">
      <view class="board">
        <view class="left-panel">
          <scroll-view scroll-y class="type-scroll" :show-scrollbar="false">
            <view
              v-for="item in typeList"
              :key="`type-${item.key || 'all'}`"
              :class="['type-item', { active: item.key === activeType }]"
              @tap="onSelectType(item)"
            >
              <text class="type-name font-alimamashuhei">{{ item.label }}</text>
              <text class="type-count font-title">{{ item.count }}</text>
            </view>
            <view v-if="loadingTypes" class="type-loading">加载中…</view>
          </scroll-view>
        </view>

        <view class="right-panel">
          <z-paging
            ref="pagingRef"
            v-model="goodsList"
            class="goods-paging"
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
          >
            <view class="goods-list" v-if="goodsList.length > 0">
              <view
                v-for="item in goodsList"
                :key="`goods-${item.id}`"
                class="goods-card"
                @tap="goGoods(item.id)"
              >
                <common-image
                  class="goods-cover"
                  :src="item.cover"
                  width="144"
                  height="144"
                  radius="18"
                  mode="aspectFill"
                />
                <view class="goods-main">
                  <text class="goods-name font-alimamashuhei">{{ item.name }}</text>
                  <text class="goods-type">{{ item.typeText }}</text>
                  <text class="goods-time font-title">收录日期：{{ formatDateTime(item.createTime) }}</text>
                </view>
              </view>
            </view>

            <template #empty>
              <view class="state-box">
                <text class="state-text">当前类型暂无商品</text>
              </view>
            </template>
          </z-paging>
        </view>
      </view>
    </view>

    <common-modal v-model:visible="showDisclaimerModal" width="680rpx" top="18vh">
      <view class="disclaimer-modal">
        <view class="disclaimer-title font-alimamashuhei">请知悉</view>
        <view class="disclaimer-content">
          <text>
            本页面中的待售/待贩售信息主要由人工收集与整理，可能存在延迟、遗漏或误差。
          </text>
          <text>
            部分商品即使已发售，若我们尚未收录到对应发售消息，仍可能暂时停留在本页面。
          </text>
          <text>
            页面内容仅供参考，实际发售状态请以品牌或商家最新公告为准。
          </text>
        </view>
        <view class="disclaimer-actions">
          <button class="disclaimer-btn" @tap="showDisclaimerModal = false">我知道了</button>
        </view>
      </view>
    </common-modal>
  </view>
</template>

<script setup>
import { computed, nextTick, ref } from 'vue'
import { onLoad, onPageScroll } from '@dcloudio/uni-app'
import { websiteUrl, getStatusBarHeight, getNavBarHeight, toPx } from '@/common/config.js'

const scrollTop = ref(0)
onPageScroll((e) => {
  scrollTop.value = e?.scrollTop || 0
})

const headerPadPx = computed(() => toPx(getStatusBarHeight() + getNavBarHeight()))

const typeList = ref([])
const activeType = ref('__all__')
const goodsList = ref([])
const pagingRef = ref(null)
const loadingTypes = ref(false)
const showDisclaimerModal = ref(false)

const pageSize = 20
let pendingType = ''

function goBack() {
  const pages = getCurrentPages?.() || []
  if (pages.length > 1) {
    uni.navigateBack({ delta: 1 })
    return
  }
  uni.switchTab({ url: '/pages/summary/summary' })
}

function normalizeTypeItem(item) {
  const rawType = (item?.type || '').trim()
  const key = rawType || '__empty__'
  const label = (item?.label || key || '未分类').trim()
  return {
    key,
    label,
    count: Number(item?.count || 0)
  }
}

function normalizeGoods(item) {
  const cover = item?.goods_image || (Array.isArray(item?.goods_images) ? item.goods_images[0] : '') || ''
  return {
    id: Number(item?.id || item?.goods_id || 0),
    name: item?.name || item?.goods_name || '未命名商品',
    typeText: item?.type || '未分类',
    createTime: Number(item?.create_time || 0),
    cover
  }
}

function formatDateTime(ts) {
  if (!ts) return '--'
  const d = new Date(ts * 1000)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function applyPendingType() {
  if (!pendingType) return
  const normalizedPending = pendingType === '未分类' ? '__empty__' : pendingType
  const match = typeList.value.find((t) => t.key === normalizedPending || t.label === pendingType)
  if (match) {
    activeType.value = match.key
  }
  pendingType = ''
}

async function fetchTypes() {
  loadingTypes.value = true
  try {
    const res = await uni.request({
      url: websiteUrl.value + '/goods/waiting-sale-types',
      method: 'GET'
    })

    const list = res?.data?.data?.types || []
    const mapped = Array.isArray(list) ? list.map(normalizeTypeItem) : []
    const totalFromApi = Number(res?.data?.data?.total || 0)
    const total = totalFromApi > 0 ? totalFromApi : mapped.reduce((sum, it) => sum + Number(it.count || 0), 0)
    typeList.value = [
      { key: '__all__', label: '全部', count: total },
      ...mapped
    ]

    if (!typeList.value.some((it) => it.key === activeType.value)) {
      activeType.value = '__all__'
    }
    applyPendingType()
  } catch (err) {
    console.error('[waiting-sale] fetchTypes fail:', err)
    if (typeList.value.length === 0) {
      typeList.value = [{ key: '__all__', label: '全部', count: 0 }]
    }
  } finally {
    loadingTypes.value = false
  }
}

async function fetchGoodsPage(pageNo, sizeFromPaging) {
  const size = sizeFromPaging || pageSize
  const query = {
    page: pageNo,
    page_size: size,
    sort: 'time_desc',
    watermark: 1
  }
  if (activeType.value && activeType.value !== '__all__') {
    query.type = activeType.value
  }

  const res = await uni.request({
    url: websiteUrl.value + '/goods/waiting-sale',
    method: 'GET',
    data: query
  })

  const list = res?.data?.data?.goods_list || []
  const mapped = Array.isArray(list) ? list.map(normalizeGoods) : []
  const apiTotal = Number(res?.data?.data?.total || res?.data?.data?.page?.total || 0)
  const total = apiTotal > 0 ? apiTotal : (pageNo * size + (mapped.length >= size ? 1 : 0))
  return { list: mapped, total }
}

async function onPagingQuery(pageNo, sizeFromPaging) {
  try {
    if (pageNo === 1) {
      await fetchTypes()
    }
    const { list, total } = await fetchGoodsPage(pageNo, sizeFromPaging)
    if (pagingRef.value) {
      pagingRef.value.complete(list, total)
    }
  } catch (err) {
    console.error('[waiting-sale] onPagingQuery fail:', err)
    uni.showToast({ title: '加载失败', icon: 'none' })
    if (pagingRef.value) {
      pagingRef.value.complete(false)
    }
  }
}

function reloadList() {
  if (pagingRef.value && typeof pagingRef.value.reload === 'function') {
    pagingRef.value.reload()
  }
}

function onSelectType(item) {
  if (!item) return
  if (item.key === activeType.value) return
  activeType.value = item.key
  reloadList()
}

function goGoods(goodsId) {
  if (!goodsId) return
  uni.navigateTo({ url: `/pages/goods/goods?goods_id=${goodsId}` })
}

onLoad(async (options) => {
  pendingType = decodeURIComponent(options?.type || '').trim()
  await fetchTypes()
  await nextTick()
  reloadList()
})
</script>

<style scoped lang="less">
.waiting-sale-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #eef7ff 0%, #f6f8fb 24%, #f7f8fa 100%);
}

.nav-back-pill {
  width: 64rpx;
  height: 64rpx;
  border-radius: 32rpx;
  background: rgba(255, 255, 255, 0.86);
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-help-pill {
  width: 56rpx;
  height: 56rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.86);
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-body {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  box-sizing: border-box;
}

.board {
  height: 100%;
  display: flex;
  gap: 18rpx;
  padding: 18rpx 16rpx 20rpx;
  box-sizing: border-box;
}

.left-panel {
  width: 196rpx;
  flex-shrink: 0;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 10rpx 30rpx rgba(40, 62, 102, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.type-scroll {
  flex: 1;
}

.type-item {
  padding: 22rpx 16rpx;
  border-bottom: 1rpx solid #f2f5f8;
}

.type-item.active {
  background: linear-gradient(135deg, #dff1ff 0%, #edf7ff 100%);
}

.type-name {
  display: block;
  font-size: 28rpx;
  color: #334155;
  line-height: 1.35;
}

.type-count {
  display: inline-block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #7d8da6;
}

.type-loading {
  padding: 20rpx 0;
  text-align: center;
  color: #9ca8bb;
  font-size: 22rpx;
}

.right-panel {
  flex: 1;
  min-width: 0;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 10rpx 30rpx rgba(40, 62, 102, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.goods-scroll {
  flex: 1;
}

.goods-paging {
  flex: 1;
  min-width: 0;
  width: 100%;
}

.goods-list {
  padding: 18rpx 18rpx 24rpx;
}

.goods-card {
  display: flex;
  gap: 16rpx;
  padding: 12rpx;
  border-radius: 20rpx;
  background: #f9fbff;
  margin-bottom: 14rpx;
}

.goods-cover {
  flex-shrink: 0;
  background: #eef2f8;
}

.goods-main {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.goods-name {
  font-size: 30rpx;
  line-height: 1.35;
  color: #1f2f46;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.goods-type {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #7e8ba0;
}

.goods-time {
  margin-top: 12rpx;
  font-size: 22rpx;
  color: #8aa0ba;
}

.disclaimer-modal {
  padding-bottom: 28rpx;
}

.disclaimer-title {
  font-size: 36rpx;
  color: #1f2f46;
  text-align: center;
  margin-bottom: 22rpx;
}

.disclaimer-content {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  color: #4d5c74;
  font-size: 26rpx;
  line-height: 1.72;
}

.disclaimer-actions {
  margin-top: 28rpx;
  display: flex;
  justify-content: center;
}

.disclaimer-btn {
  width: 260rpx;
  height: 78rpx;
  line-height: 78rpx;
  border-radius: 999rpx;
  border: none;
  background: linear-gradient(135deg, #a8d8f8 0%, #86c7ee 100%);
  color: #17324b;
  font-size: 28rpx;
  font-family: inherit;
}

.disclaimer-btn::after {
  border: none;
}

.state-box {
  padding: 56rpx 0;
  text-align: center;
}

.state-text {
  font-size: 24rpx;
  color: #95a0b3;
}

.load-more {
  text-align: center;
  padding: 10rpx 0 24rpx;
  color: #9aa5b8;
  font-size: 22rpx;
}
</style>
