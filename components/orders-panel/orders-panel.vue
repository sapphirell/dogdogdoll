<!-- components/orders-panel.vue -->
<template>
  <view class="orders-panel">
    <!-- 顶部统计卡片（BJD约妆 / 手改毛投递数量，可切换列表） -->
    <view class="summary-card">
      <view
        class="summary-item"
        :class="{ 'summary-item-active': activeOrderTypeTab === 'bjd' }"
        @click="changeOrderTypeTab('bjd')"
      >
        <text class="summary-number font-title">
          {{ totalBjd }}
        </text>
        <text class="summary-label font-alimamashuhei">BJD约妆</text>
      </view>

      <view class="summary-divider"></view>

      <view
        class="summary-item"
        :class="{ 'summary-item-active': activeOrderTypeTab === 'hair' }"
        @click="changeOrderTypeTab('hair')"
      >
        <text class="summary-number font-title">
          {{ totalHair }}
        </text>
        <text class="summary-label font-alimamashuhei">手改毛投递</text>
      </view>
    </view>

    <!-- 二级 Tab：全部 / 交易中 / 交易结束 -->
    <view class="second-tabs">
      <view
        v-for="tab in statusTabs"
        :key="tab.key"
        class="second-tab"
        :class="{ 'second-tab-active': activeStatusTab === tab.key }"
        @click="changeStatusTab(tab.key)"
      >
        <text class="second-tab-text font-alimama">
          {{ tab.label }}
        </text>
      </view>
    </view>

    <!-- 投递列表 / 空态 -->
    <view class="orders-list-wrap">
      <!-- 完全空状态 -->
      <view
        v-if="!loading && filteredList.length === 0 && submissionList.length === 0"
        class="empty-wrap"
      >
        <view class="empty-card">
          <text class="empty-title">还没有投递记录</text>
          <text class="empty-desc">
            去找喜欢的妆师 / 毛娘，投递你的第一个方案吧。
          </text>
        </view>
      </view>

      <!-- 当前筛选下暂无数据 -->
      <view
        v-else-if="!loading && filteredList.length === 0"
        class="empty-wrap status-empty"
      >
        <view class="empty-card">
          <text class="empty-title">当前状态暂无投递</text>
          <text class="empty-desc">换个筛选看看其他投递记录。</text>
        </view>
      </view>

      <!-- 列表卡片（按设计图样式） -->
      <view v-else>
        <view
          v-for="(row, index) in filteredList"
          :key="row.submission?.id || row.submission?.ID"
          class="sub-card"
          :style="subCardStyle(index)"
          @click="goSubmissionDetail(row)"
        >
          <!-- 左侧缩略图 -->
          <view class="sub-card-left">
            <image
              class="sub-thumb"
              :src="cardCover(row)"
              mode="aspectFill"
            />
          </view>

          <!-- 中间文本：与图片等高 -->
          <view class="sub-card-middle">
            <view class="sub-title-row">
              <text class="status-pill font-alimama">
                {{ statusPillText(row) }}
              </text>
              <text class="sub-main-title">
                {{ mainTitle(row) }}
              </text>
            </view>

            <view class="sub-subtitle-row">
              <text class="sub-meta-text">
                {{ itemsCount(row) }}个投递项
              </text>
              <text class="sub-meta-text price-text">
                {{ cardAmount(row) }}¥
              </text>
            </view>
          </view>

          <!-- 右侧：只有箭头 -->
          <view class="sub-card-right">
            <uni-icons type="right" size="26" color="#444444" />
          </view>
        </view>
      </view>

      <!-- 底部加载 / 提示 -->
      <view class="list-footer">
        <view v-if="loading" class="footer-loading">
          <loading-jump-text></loading-jump-text>
        </view>
        <text
          v-else-if="finished && submissionList.length > 0"
          class="footer-text"
        >
          已经到底了
        </text>
      </view>
    </view>

    <!-- 平台公告横幅 -->
    <view class="platform-announcement" @click="jumpToAnnouncement">
      <text class="announcement-text">平台公告</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import {
  onShow,
  onPullDownRefresh,
  onReachBottom
} from '@dcloudio/uni-app'
import { websiteUrl, global, asyncGetUserInfo } from '@/common/config.js'

const props = defineProps({
  active: {
    type: Boolean,
    default: true
  }
})

/** 顶部统计的类型切换：BJD / 手改毛 */
const activeOrderTypeTab = ref('bjd') // 'bjd' | 'hair'
function changeOrderTypeTab(type) {
  activeOrderTypeTab.value = type
}

/** 二级 Tab（状态筛选） */
const statusTabs = [
  { key: 'all', label: '全部' },
  { key: 'ongoing', label: '交易中' },
  { key: 'finished', label: '交易结束' }
]
const activeStatusTab = ref('all')

/** 列表数据 */
const submissionList = ref([]) // [{ submission, items }]
const page = ref(1)
const pageSize = 20
const total = ref(0)
const loading = ref(false)

const finished = computed(
  () => total.value > 0 && submissionList.value.length >= total.value
)

/** 统计：按 order_type / mode 粗略统计 BJD / 手改毛数量
 * 注意：当前接口是“约妆列表”，样例数据 mode = 2 表示约妆
 * 这里约定：2 = BJD约妆，1 = 手改毛
 */
function getOrderType(sub) {
  if (!sub) return 0
  let t =
    sub.order_type ??
    sub.OrderType ??
    sub.orderType ??
    null
  if (t == null) {
    t = sub.mode ?? sub.Mode ?? 0
  }
  return Number(t) || 0
}

const totalBjd = computed(() =>
  submissionList.value.filter(row => getOrderType(row.submission) === 2)
    .length
)
const totalHair = computed(() =>
  submissionList.value.filter(row => getOrderType(row.submission) === 1)
    .length
)

/** 确保登录状态 */
async function ensureLogin() {
  const token = uni.getStorageSync('token') || ''
  if (!token) {
    global.isLogin = false
    return false
  }
  if (!global.isLogin && typeof asyncGetUserInfo === 'function') {
    await asyncGetUserInfo()
  }
  return !!global.isLogin
}

/** 提交状态数值 */
function getSubmissionStatus(sub) {
  if (!sub) return 0
  return Number(sub.status ?? sub.Status ?? 0)
}

/** 交易中：0排队中 / 1已抢到待付款 / 2已付款 */
function isOngoing(sub) {
  const st = getSubmissionStatus(sub)
  return st === 0 || st === 1 || st === 2
}

/** 交易结束：3排队失败 / 4取消 / 5支付超时 */
function isFinishedStatus(sub) {
  const st = getSubmissionStatus(sub)
  return st === 3 || st === 4 || st === 5
}

/** 过滤列表：根据 顶部类型(BJD/毛) + 二级 Tab(状态) */
const filteredList = computed(() => {
  let list = submissionList.value

  // 顶部 BJD / 手改毛 过滤
  if (activeOrderTypeTab.value === 'bjd') {
    list = list.filter(row => getOrderType(row.submission) === 2)
  } else if (activeOrderTypeTab.value === 'hair') {
    list = list.filter(row => getOrderType(row.submission) === 1)
  }

  // 状态二级tab过滤
  if (activeStatusTab.value === 'ongoing') {
    list = list.filter(row => isOngoing(row.submission))
  } else if (activeStatusTab.value === 'finished') {
    list = list.filter(row => isFinishedStatus(row.submission))
  }
  return list
})

/** Tab 切换 */
function changeStatusTab(key) {
  activeStatusTab.value = key
}

/** 列表 item 的动画样式：按 index 递增 delay */
function subCardStyle(index) {
  const delay = index * 80 // ms，与 info-follow-tab 保持一致节奏
  return {
    animationDelay: delay + 'ms'
  }
}

/** 拉取列表 */
async function fetchList(reset = false) {
  if (loading.value) return

  const ok = await ensureLogin()
  if (!ok) {
    if (reset) {
      submissionList.value = []
      page.value = 1
      total.value = 0
    }
    uni.stopPullDownRefresh()
    return
  }

  if (reset) {
    page.value = 1
    submissionList.value = []
    total.value = 0
  }

  loading.value = true
  try {
    const token = uni.getStorageSync('token') || ''
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/my-submissions`,
      method: 'GET',
      header: {
        Authorization: token
      },
      data: {
        page: page.value,
        page_size: pageSize,
        size: pageSize
      }
    })

    if (String(res.data?.status).toLowerCase() !== 'success') {
      uni.showToast({ title: res.data?.msg || '加载失败', icon: 'none' })
      return
    }

    const data = res.data.data || {}
    const rows = data.list || []
    const p = data.page || {}

    if (reset) {
      submissionList.value = rows
    } else {
      submissionList.value = submissionList.value.concat(rows)
    }

    total.value = Number(p.total || total.value || rows.length || 0)
    const currentPage = Number(p.page || page.value)
    page.value = currentPage + 1
  } catch (e) {
    console.error('加载投递列表失败', e)
    uni.showToast({ title: '网络异常，加载失败', icon: 'none' })
  } finally {
    loading.value = false
    uni.stopPullDownRefresh()
  }
}

/** 品牌对象 */
function getBrandObj(row) {
  const sub = row?.submission || {}
  return sub.brand || sub.Brand || {}
}

/** 品牌名称 */
function brandName(row) {
  const b = getBrandObj(row)
  return b.brand_name || b.BrandName || '未知品牌'
}

/** 品牌 Logo */
function brandLogo(row) {
  const b = getBrandObj(row)
  return b.logo_image || b.LogoImage || ''
}

/** 作品首图 */
function firstRefImage(it) {
  const raw = it.ref_images || it.RefImages || ''
  if (!raw) return ''
  const arr = String(raw).split(',')
  return arr[0].trim()
}

/** 状态文案 */
function statusText(row) {
  const st = getSubmissionStatus(row?.submission)
  switch (st) {
    case 0:
      return '排队中'
    case 1:
      return '已抢到名额'
    case 2:
      return '投递成功'
    case 3:
      return '未抢到名额'
    case 4:
      return '已取消'
    case 5:
      return '支付超时'
    default:
      return '未知状态'
  }
}

/** 卡片左侧封面 */
function cardCover(row) {
  const items = row.items || []
  if (items.length > 0) {
    const img = firstRefImage(items[0])
    if (img) return img
  }
  const logo = brandLogo(row)
  if (logo) return logo
  return ''
}

/** 卡片主标题 */
function mainTitle(row) {
  const sub = row?.submission || {}
  return (
    sub.title ||
    sub.Title ||
    sub.plan_title ||
    sub.PlanTitle ||
    brandName(row)
  )
}

/** 投递项数量 */
function itemsCount(row) {
  const items = row.items || []
  return items.length || 0
}

/** 计算一个 submission 下所有子项的总价：sum(price_total + adjust_price) */
function calcRowTotalAmount(row) {
  const items = row.items || []
  let sum = 0
  let hasItemPrice = false

  items.forEach(it => {
    if (!it) return
    const priceTotalRaw =
      it.price_total ??
      it.PriceTotal ??
      it.priceTotal ??
      null
    const adjustPriceRaw =
      it.adjust_price ??
      it.AdjustPrice ??
      it.adjustPrice ??
      null

    const priceTotal = Number(priceTotalRaw || 0)
    const adjustPrice = Number(adjustPriceRaw || 0)

    if (
      (!isNaN(priceTotal) && priceTotalRaw != null) ||
      (!isNaN(adjustPrice) && adjustPriceRaw != null)
    ) {
      hasItemPrice = true
      sum += (isNaN(priceTotal) ? 0 : priceTotal) +
        (isNaN(adjustPrice) ? 0 : adjustPrice)
    }
  })

  if (hasItemPrice) {
    return sum
  }

  const sub = row?.submission || {}
  const totalVal =
    sub.price_total ??
    sub.PriceTotal ??
    sub.total_price ??
    sub.TotalPrice ??
    0
  const n = Number(totalVal) || 0
  return n
}

/** 卡片金额 */
function cardAmount(row) {
  const total = calcRowTotalAmount(row)
  const n = Number(total) || 0
  const fixed = n.toFixed(2)
  return fixed.replace(/\.00$/, '')
}

/** 状态 pill 文案 */
function statusPillText(row) {
  const txt = statusText(row)
  if (txt === '已抢到名额') return '已中选'
  return txt
}

/** 打开详情页 */
function goSubmissionDetail(row) {
  const sub = row?.submission || {}
  const id = sub.id || sub.ID
  if (!id) return
  const url = `/pkg-creator/creator_order/submission_detail/submission_detail?submission_id=${id}`
  // #ifdef H5
  window.location.hash = url
  // #endif
  // #ifndef H5
  uni.navigateTo({ url })
  // #endif
}

/** 平台公告 */
function jumpToAnnouncement() {
  uni.navigateTo({
    url: '/pages/article_detail/article_detail?id=3'
  })
}

/** 生命周期 */
onMounted(() => {
  if (props.active) {
    fetchList(true)
  }
})

onShow(() => {
  if (props.active) {
    fetchList(true)
  }
})

watch(
  () => props.active,
  val => {
    if (val) {
      fetchList(true)
    }
  }
)

onPullDownRefresh(() => {
  if (!props.active) {
    uni.stopPullDownRefresh()
    return
  }
  fetchList(true)
})

onReachBottom(() => {
  if (!props.active || finished.value) return
  fetchList(false)
})
</script>

<style lang="scss" scoped>
/* 订单集整体容器 */
.orders-panel {
  padding: 0 40rpx 40rpx;
}

/* 顶部统计卡片 */
.summary-card {
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  background: #ffffff;
  border-radius: 32rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.04);
  padding: 24rpx 40rpx;
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  margin-top: 6rpx;
  margin-bottom: 32rpx;
}

.summary-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 默认灰色 */
.summary-number {
  font-size: 40rpx;
  font-weight: 700;
  color: #d0d0d0;
}

.summary-label {
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #d0d0d0;
}

/* 选中态 */
.summary-item-active .summary-number,
.summary-item-active .summary-label {
  color: #222222;
}

/* 中间分割线 */
.summary-divider {
  width: 2rpx;
  height: 60rpx;
  background: #f2f2f2;
}

/* 二级 Tab：全部 / 交易中 / 交易结束 */
.second-tabs {
  margin: 12rpx 0 20rpx;
  display: flex;
  align-items: center;
}

.second-tab {
  padding: 10rpx 24rpx;
  border-radius: 999rpx;
  margin-right: 16rpx;
  background: #f5f6fa;
}

.second-tab-text {
  font-size: 24rpx;
  color: #b3b3b3;
}

.second-tab-active {
  background: #ffffff;
  box-shadow: 0 4rpx 12rpx rgba(15, 35, 95, 0.06);
}

.second-tab-active .second-tab-text {
  color: #333333;
}

/* 列表容器 */
.orders-list-wrap {
  padding-bottom: 10rpx;
}

/* 空态 */
.empty-wrap {
  padding: 30rpx 0;
}

.status-empty {
  padding-top: 10rpx;
}

.empty-card {
  border-radius: 24rpx;
  padding: 32rpx 28rpx;
  background: #ffffff;
  box-shadow: 0 12rpx 30rpx rgba(15, 35, 95, 0.06);
  align-items: center;
}

.empty-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #505050;
  display: block;
  text-align: center;
}

.empty-desc {
  margin-top: 10rpx;
  font-size: 26rpx;
  color: #999999;
  line-height: 1.7;
  display: block;
  text-align: center;
}

/* 淡入动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(16rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 每一条投递卡片 */
.sub-card {
  margin-bottom: 24rpx;
  padding: 0; /* 去掉上下内边距，图片和文字严格等高 */
  display: flex;
  align-items: center;

  /* 动画初始状态 + 通用配置 */
  opacity: 0;
  transform: translateY(16rpx);
  animation-name: fadeInUp;
  animation-duration: 0.32s;
  animation-timing-function: ease;
  animation-fill-mode: forwards;
}

/* 左侧缩略图 */
.sub-card-left {
  width: 140rpx;
  height: 140rpx;
  margin-right: 32rpx;
  border-radius: 12rpx;
  border: 4rpx solid #6b8cff;
  background: #d9d9d9;
  overflow: hidden;
  flex-shrink: 0;
}
.sub-thumb {
  width: 100%;
  height: 100%;
}

/* 中间文案区域：与图片等高，无额外上下间距 */
.sub-card-middle {
  flex: 1;
  height: 140rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  min-width: 0;
  margin: 0;
  padding: 0;
}

/* 第一行：状态+标题 */
.sub-title-row {
  display: flex;
  align-items: center;
  margin: 0 0 8rpx 0;
}

/* 状态 pill */
.status-pill {
  padding: 4rpx 16rpx;
  border-radius: 999rpx;
  background: #8fd7ff;
  color: #ffffff;
  font-size: 22rpx;
  margin-right: 16rpx;
}

/* 主标题 */
.sub-main-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #000000;
  max-width: 420rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 第二行：1个投递项  120¥ */
.sub-subtitle-row {
  display: flex;
  align-items: baseline;
  margin: 0;
}
.sub-meta-text {
  font-size: 28rpx;
  color: #000000;
}
.sub-meta-text + .sub-meta-text {
  margin-left: 26rpx;
}
.price-text {
  font-weight: 700;
}

/* 右侧：只有箭头 */
.sub-card-right {
  flex-shrink: 0;
  width: 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-left: 8rpx;
}

/* 列表底部提示 */
.list-footer {
  padding: 12rpx 0 10rpx;
  text-align: center;
}

.footer-loading {
  display: flex;
  justify-content: center;
  align-items: center;
}

.footer-text {
  font-size: 22rpx;
  color: #a1a9b3;
}

/* 平台公告横幅 */
.platform-announcement {
  width: 650rpx;
  height: 180rpx;
  margin: 30rpx auto 0;
  background-image: url('https://images1.fantuanpu.com/box/admin/c73541842fb9d9d2e1a6bef376ef784c');
  background-size: contain;
  background-position: center;
  border-radius: 20rpx;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding-bottom: 25rpx;
  position: relative;
  overflow: hidden;
}
.platform-announcement::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  z-index: 1;
}
.announcement-text {
  font-size: 34rpx;
  font-weight: 900;
  color: #7d7d7d;
  letter-spacing: 4rpx;
  position: relative;
  z-index: 2;
  text-align: right;
}
</style>
