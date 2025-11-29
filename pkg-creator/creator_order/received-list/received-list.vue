<!-- pkg-creator/creator_order/received-list/received-list.vue -->
<template>
  <view class="booking-page received-page">
    <!-- 吸顶标题栏（滚动后出现） -->
    <view
      class="sticky-titlebar"
      v-show="showStickyTitle"
      :style="{ paddingTop: safeTop + 'px' }"
    >
      <view class="nav-left" @click="goBack" aria-label="返回">
        <image class="back-icon" src="/static/artist/left.png" mode="aspectFit" />
        <text class="back-text font-alimamashuhei" style="color:#000;">返回</text>
      </view>
      <view class="st-center">
        <text class="st-name">收到的投递</text>
      </view>
      <view class="st-right"></view>
    </view>

    <!-- 渐变透明自定义导航 -->
    <zhouWei-navBar
      type="transparentFixed"
      :backState="2000"
      :homeState="2000"
      :scrollTop="scrollTop"
      :titleCenter="true"
      fontColor="#fff"
      transparentFixedFontColor="#000"
    >
      <template #left>
        <view class="nav-left" @click="goBack" aria-label="返回">
          <image class="back-icon" src="/static/artist/left.png" mode="aspectFit" />
          <text class="back-text font-alimamashuhei">返回</text>
        </view>
      </template>
      <template #transparentFixedLeft>
        <view class="nav-left" @click="goBack" aria-label="返回">
          <image class="back-icon" src="/static/artist/left.png" mode="aspectFit" />
          <text class="back-text">返回</text>
        </view>
      </template>
    </zhouWei-navBar>

    <!-- 顶部小 Hero 区：标题 + 副标题 -->
    <view class="hero hero-small">
      <view class="hero-bg"></view>
      <view class="hero-footer hero-small-footer">
        <view class="hero-title">
          <text class="brand-name font-title">收到的投递</text>
          <text class="plan-title font-alimamashuhei">作者视角</text>
        </view>
        <text class="hero-desc">按订单状态查看谁投递了你</text>
      </view>
    </view>

    <!-- 状态 Tab -->
    <view class="card status-tabs">
      <scroll-view class="tabs-scroll" scroll-x :show-scrollbar="false">
        <view class="tabs-row">
          <view
            v-for="tab in statusTabs"
            :key="tab.key"
            class="tab-chip"
            :class="{ active: currentTab === tab.key }"
            @click="changeTab(tab.key)"
          >
            <text class="tab-text">{{ tab.label }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 列表 -->
    <scroll-view
      class="list-scroll"
      scroll-y
      :show-scrollbar="false"
      @scroll="handleInnerScroll"
    >
      <!-- 空状态 -->
      <view
        v-if="!loading && filteredItems.length === 0"
        class="empty-box"
      >
        <image class="empty-icon" src="/static/empty.png" mode="aspectFit" />
        <text class="empty-text">还没有收到相关投递</text>
      </view>

      <!-- 列表卡片 -->
      <view v-else class="list-wrapper">
        <view
          v-for="item in filteredItems"
          :key="item.id"
          class="card item-card"
          @click="goSubmissionDetail(item)"
        >
          <!-- 标题行：作品摘要 + 状态 -->
          <view class="item-header">
            <text class="item-title">
              {{ buildSubject(item) || '未填写作品标题' }}
            </text>
            <view class="status-chip" :class="'s-' + (item.status ?? -1)">
              <text class="status-text">{{ itemStatusText(item.status) }}</text>
            </view>
          </view>

          <!-- 第二行：投递用户 -->
          <view class="item-row">
            <text class="item-label">投递用户</text>
            <text class="item-value">UID {{ item.user_id }}</text>
          </view>

          <!-- 价格 -->
          <view class="item-row" v-if="Number(item.price_total) > 0">
            <text class="item-label">报价</text>
            <text class="item-value price">¥ {{ formatPrice(item.price_total) }}</text>
          </view>

          <!-- 创建时间 -->
          <view class="item-row">
            <text class="item-label">投递时间</text>
            <text class="item-value">
              {{ formatTime(item.created_at) }}
            </text>
          </view>

          <!-- 备注（截断） -->
          <view class="item-row remark-row" v-if="item.remark">
            <text class="item-label">备注</text>
            <text class="item-value remark-text">
              {{ item.remark }}
            </text>
          </view>
        </view>

        <!-- 加载/没有更多 -->
        <view class="load-more">
          <text v-if="loading" class="load-text">加载中...</text>
          <text
            v-else-if="finished && filteredItems.length > 0"
            class="load-text muted"
          >
            没有更多了
          </text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  onLoad,
  onPageScroll,
  onPullDownRefresh,
  onReachBottom,
} from '@dcloudio/uni-app'

// 安全区域 / 滚动
const safeTop = ref(0)
const scrollTop = ref(0)
const showStickyTitle = ref(false)

// 传入的 plan_id（可选，用于只看某个开单计划）
const planId = ref(0)

// 状态 Tab（按子项状态分类）
const statusTabs = ref([
  { key: 'all', label: '全部', value: null },
  { key: 'pending', label: '待处理', value: 0 },
  { key: 'queued', label: '排队中', value: 1 },
  { key: 'selected_pay', label: '已抢到待付款', value: 2 },
  { key: 'ordered', label: '已下单', value: 3 },
  { key: 'not_selected', label: '未中选', value: 4 },
  { key: 'abandoned', label: '已放弃', value: 5 },
  { key: 'expired', label: '保留过期', value: 6 },
])
const currentTab = ref('all')

// 列表 & 分页
const rawList = ref([]) // 后端返回的 row（一般是 { item: {...} }）
const total = ref(0)
const page = ref(1)
const pageSize = 20
const loading = ref(false)
const finished = ref(false)

// 把 { item: {...} } 扁平成真正的 item
const allItems = computed(() =>
  rawList.value.map((row) => row.item || row || {})
)

// 当前 Tab 的过滤结果
const filteredItems = computed(() => {
  if (currentTab.value === 'all') return allItems.value
  const tab = statusTabs.value.find((t) => t.key === currentTab.value)
  if (!tab || tab.value === null || tab.value === undefined) {
    return allItems.value
  }
  const statusValue = tab.value
  return allItems.value.filter((it) => Number(it.status) === statusValue)
})

// ---- 工具函数 ----

function itemStatusText(status) {
  const s = Number(status)
  switch (s) {
    case 0:
      return '待处理'
    case 1:
      return '排队中'
    case 2:
      return '已抢到待付款'
    case 3:
      return '已下单'
    case 4:
      return '未中选'
    case 5:
      return '已放弃'
    case 6:
      return '保留过期'
    default:
      return '未知状态'
  }
}

// 作品摘要：娃头 / 尺寸 / 档位
function buildSubject(item) {
  if (!item) return ''
  const parts = []
  const subject = (item.work_subject || '').trim()
  const size = (item.size || '').trim()
  const tier = (item.tier_title || '').trim()

  if (subject) parts.push(subject)
  if (size) parts.push(size)
  if (tier) parts.push(tier)

  return parts.join(' / ')
}

function formatPrice(price) {
  const n = Number(price || 0)
  return n.toFixed(2)
}

function pad2(n) {
  return n < 10 ? '0' + n : '' + n
}

// created_at 为 Unix 秒
function formatTime(ts) {
  const n = Number(ts || 0)
  if (!n) return '-'
  const d = new Date(n * 1000)
  const y = d.getFullYear()
  const m = pad2(d.getMonth() + 1)
  const day = pad2(d.getDate())
  const h = pad2(d.getHours())
  const mi = pad2(d.getMinutes())
  return `${y}-${m}-${day} ${h}:${mi}`
}

// ---- 交互 ----

function changeTab(key) {
  if (currentTab.value === key) return
  currentTab.value = key
}

function goBack() {
  uni.navigateBack({ delta: 1 })
}

// 从作者视角进入投递详情
function goSubmissionDetail(item) {
  const submissionId = item.submission_id || item.submissionId
  const itemId = item.id
  if (!submissionId) {
    // 没有挂 submission_id，就只跳到子项详情页（如果有的话）
    // 这里先走 submission/detail，实际路径按你项目的来改
    uni.showToast({
      title: '当前子项尚未挂载到投递',
      icon: 'none',
    })
    return
  }

  uni.navigateTo({
    // 按你小程序里实际的路由改
    url: `/pages/artist-order/submission-detail?submission_id=${submissionId}&item_id=${itemId}`,
  })
}

// ---- 请求后端：/with-state/artist-order/received ----
async function fetchList(reset = false) {
  if (loading.value) return
  loading.value = true

  if (reset) {
    page.value = 1
    finished.value = false
    rawList.value = []
  }

  try {
    const res = await uni.request({
      url: '/with-state/artist-order/received',
      method: 'GET',
      data: {
        page: page.value,
        page_size: pageSize,
        // plan_id 可选，传 0 就是全部计划
        plan_id: planId.value || undefined,
      },
    })

    const body = res.data || {}
    // 兼容后端 Base.Success：可能是 { code, data: { list, page } }
    const payload = body.data || body
    const list = payload.list || []
    const pageInfo = payload.page || {}

    total.value = Number(pageInfo.total || 0)

    if (reset) {
      rawList.value = list
    } else {
      rawList.value = rawList.value.concat(list)
    }

    const loadedCount = rawList.value.length
    if (loadedCount >= total.value || list.length < pageSize) {
      finished.value = true
    } else {
      page.value = page.value + 1
    }
  } catch (err) {
    console.error('fetch received submissions failed', err)
    uni.showToast({
      title: '加载失败，请稍后重试',
      icon: 'none',
    })
  } finally {
    loading.value = false
    // 防止下拉刷新卡住
    uni.stopPullDownRefresh()
  }
}

// ---- 生命周期 ----

onLoad((options) => {
  const sys = uni.getSystemInfoSync()
  safeTop.value =
    (sys.safeAreaInsets && sys.safeAreaInsets.top) || sys.statusBarHeight || 0

  if (options && options.plan_id) {
    const pid = Number(options.plan_id)
    if (!Number.isNaN(pid)) {
      planId.value = pid
    }
  }

  fetchList(true)
})

onPageScroll((e) => {
  scrollTop.value = e.scrollTop
  showStickyTitle.value = e.scrollTop > 80
})

onPullDownRefresh(() => {
  fetchList(true)
})

onReachBottom(() => {
  if (!finished.value) {
    fetchList(false)
  }
})

// 内部 scroll（主要是为了兼容一些端的滚动表现，可以不用动）
function handleInnerScroll(e) {
  // 如果你希望根据内部 scroll 控制 showStickyTitle，可以在这里处理
}
</script>

<style lang="scss" scoped>
.received-page {
  min-height: 100vh;
  background-color: #f5f5f7;
  box-sizing: border-box;
}

/* 吸顶标题栏 */
.sticky-titlebar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
  height: 44px;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(12px);
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.06);
}

.nav-left {
  display: flex;
  align-items: center;
}

.back-icon {
  width: 36rpx;
  height: 36rpx;
}

.back-text {
  margin-left: 8rpx;
  font-size: 28rpx;
}

.st-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.st-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #000;
}

.st-right {
  width: 72rpx;
}

/* Hero */
.hero {
  position: relative;
  margin-bottom: 16rpx;
}

.hero-small {
  height: 220rpx;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #ffd2e4 0%, #ffe9c8 50%, #daf2ff 100%);
}

.hero-footer {
  position: absolute;
  left: 32rpx;
  right: 32rpx;
  bottom: 40rpx;
  display: flex;
  flex-direction: column;
}

.hero-small-footer {
  bottom: 32rpx;
}

.hero-title {
  display: flex;
  align-items: baseline;
}

.brand-name {
  font-size: 36rpx;
  font-weight: 600;
  color: #222;
}

.plan-title {
  margin-left: 12rpx;
  font-size: 26rpx;
  color: #444;
}

.hero-desc {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #555;
}

/* 卡片通用 */
.card {
  margin: 0 24rpx 24rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background-color: #fff;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
}

/* 状态 Tab */
.status-tabs {
  margin-top: -40rpx;
}

.tabs-scroll {
  white-space: nowrap;
}

.tabs-row {
  display: flex;
  align-items: center;
}

.tab-chip {
  margin-right: 16rpx;
  padding: 8rpx 20rpx;
  border-radius: 999rpx;
  background-color: #f4f4f6;
}

.tab-chip:last-child {
  margin-right: 0;
}

.tab-chip.active {
  background: linear-gradient(135deg, #ff9ebf, #ffb46e);
  box-shadow: 0 4rpx 12rpx rgba(255, 158, 191, 0.5);
}

.tab-chip .tab-text {
  font-size: 24rpx;
  color: #666;
}

.tab-chip.active .tab-text {
  color: #fff;
}

/* 列表 */
.list-scroll {
  height: calc(100vh - 220rpx - 120rpx);
}

.list-wrapper {
  padding-bottom: 40rpx;
}

/* 空状态 */
.empty-box {
  margin: 80rpx auto 0;
  width: 60%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon {
  width: 220rpx;
  height: 220rpx;
  opacity: 0.8;
}

.empty-text {
  margin-top: 12rpx;
  font-size: 26rpx;
  color: #999;
}

/* Item 卡片 */
.item-card {
  margin-bottom: 20rpx;
}

.item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12rpx;
}

.item-title {
  flex: 1;
  margin-right: 16rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #222;
}

/* 状态标签 */
.status-chip {
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
  background-color: #f0f0f0;
}

.status-text {
  font-size: 22rpx;
}

/* 不同状态颜色 */
.status-chip.s-0 {
  background: rgba(255, 194, 150, 0.14);
  border: 1rpx solid rgba(255, 156, 85, 0.6);
}

.status-chip.s-0 .status-text {
  color: #ff8a3d;
}

.status-chip.s-1 {
  background: rgba(145, 213, 255, 0.14);
  border: 1rpx solid rgba(63, 169, 245, 0.6);
}

.status-chip.s-1 .status-text {
  color: #3fa9f5;
}

.status-chip.s-2 {
  background: rgba(140, 235, 195, 0.16);
  border: 1rpx solid rgba(64, 192, 135, 0.65);
}

.status-chip.s-2 .status-text {
  color: #36b67a;
}

.status-chip.s-3 {
  background: rgba(110, 218, 151, 0.16);
  border: 1rpx solid rgba(27, 167, 92, 0.65);
}

.status-chip.s-3 .status-text {
  color: #1ba75c;
}

.status-chip.s-4 {
  background: rgba(217, 217, 217, 0.24);
  border: 1rpx solid rgba(175, 175, 175, 0.8);
}

.status-chip.s-4 .status-text {
  color: #7b7b7b;
}

.status-chip.s-5,
.status-chip.s-6 {
  background: rgba(255, 160, 160, 0.16);
  border: 1rpx solid rgba(233, 88, 88, 0.7);
}

.status-chip.s-5 .status-text,
.status-chip.s-6 .status-text {
  color: #e95858;
}

/* 字段行 */
.item-row {
  display: flex;
  align-items: flex-start;
  margin-top: 6rpx;
}

.item-label {
  width: 140rpx;
  flex-shrink: 0;
  font-size: 24rpx;
  color: #999;
}

.item-value {
  flex: 1;
  font-size: 24rpx;
  color: #333;
}

.item-value.price {
  color: #ff6b4b;
  font-weight: 600;
}

.remark-row {
  margin-top: 8rpx;
}

.remark-text {
  max-height: 72rpx;
  line-height: 36rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

/* 加载更多 */
.load-more {
  padding: 16rpx 24rpx 0;
  text-align: center;
}

.load-text {
  font-size: 24rpx;
  color: #666;
}

.load-text.muted {
  color: #aaa;
}
</style>
