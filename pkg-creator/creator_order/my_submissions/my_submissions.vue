<template>
  <view class="my-sub-page">
    <!-- 未登录提示 -->
    <view v-if="!isLogin && !loading" class="empty-wrap">
      <view class="empty-card">
        <text class="empty-title">登录后查看你的投递记录</text>
        <text class="empty-desc">可在这里统一管理你约妆 / 约毛的所有投递。</text>
        <button class="login-btn" @click="goLogin">去登录</button>
      </view>
    </view>

    <!-- 已登录：投递列表 -->
    <view v-else class="list-wrap">
      <!-- 完全空状态 -->
      <view v-if="!loading && submissionList.length === 0" class="empty-wrap">
        <view class="empty-card">
          <text class="empty-title">还没有投递记录</text>
          <text class="empty-desc">去找喜欢的妆师 / 毛娘，投递你的第一个方案吧。</text>
        </view>
      </view>

      <!-- 有数据：筛选 + 列表 -->
      <view v-else>
        <!-- 顶部状态筛选：全部 / 交易中 / 交易结束 -->
        <view class="status-tabs">
          <view
            v-for="tab in tabs"
            :key="tab.key"
            class="status-tab"
            :class="{ 'status-tab-active': activeTab === tab.key }"
            @click="changeTab(tab.key)"
          >
            <text class="status-tab-text">{{ tab.label }}</text>
          </view>
        </view>

        <!-- 当前筛选下暂无数据 -->
        <view v-if="!loading && filteredList.length === 0" class="empty-wrap status-empty">
          <view class="empty-card">
            <text class="empty-title">当前状态暂无投递</text>
            <text class="empty-desc">换个筛选看看其他投递记录。</text>
          </view>
        </view>

        <!-- 列表卡片 -->
        <view
          v-for="row in filteredList"
          :key="row.submission?.id || row.submission?.ID"
          class="sub-card"
          @click="goSubmissionDetail(row)"
        >
          <!-- 顶部：品牌信息 + 时间 + 状态 -->
          <view class="sub-header">
            <view class="sub-brand">
              <view class="brand-logo-box">
                <image
                  v-if="brandLogo(row)"
                  class="brand-logo"
                  :src="brandLogo(row)"
                  mode="aspectFill"
                />
                <view v-else class="brand-logo-placeholder">
                  <text class="brand-logo-text">
                    {{ brandName(row).slice(0, 1) }}
                  </text>
                </view>
              </view>
              <view class="brand-info">
                <text class="brand-name">{{ brandName(row) }}</text>
                <text class="brand-time">
                  {{ formatTime(row.submission?.created_at || row.submission?.CreatedAt) }}
                </text>
              </view>
            </view>

            <view class="sub-status-tag" :class="statusClass(row)">
              {{ statusText(row) }}
            </view>
          </view>

          <!-- 中部：作品缩略图（最多两个） -->
          <view class="sub-body">
            <view
              v-if="(row.items || []).length > 0"
              class="sub-items-row"
            >
              <view
                class="sub-item-card"
                v-for="(it, idx) in (row.items || []).slice(0, 2)"
                :key="it.id || it.ID || idx"
                @click.stop="goEditItem(row, it)"
              >
                <image
                  class="item-image"
                  :src="firstRefImage(it)"
                  mode="aspectFill"
                />
                <view class="item-info">
                  <text class="item-title">
                    {{ it.work_subject || it.WorkSubject || '作品' }}
                  </text>
                  <text class="item-price">
                    ¥{{ displayPrice(it) }}
                  </text>
                </view>
              </view>
            </view>

            <!-- 无作品提示 -->
            <view v-else class="sub-no-items">
              <text class="no-items-text">暂未绑定作品，建议尽快补充作品信息。</text>
            </view>
          </view>

          <!-- 底部操作：联系妆师 / 修改投递 -->
          <view class="sub-footer-actions">
            <text class="footer-link" @click.stop="contactArtist(row)">联系妆师</text>
            <text class="footer-link" @click.stop="editSubmission(row)">修改投递</text>
          </view>
        </view>
      </view>

      <!-- 底部加载 / 提示 -->
      <view class="list-footer">
        <text v-if="loading" class="footer-text">加载中...</text>
        <text v-else-if="finished && submissionList.length > 0" class="footer-text">已经到底了</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { websiteUrl, global, asyncGetUserInfo } from '@/common/config.js'

/** 列表数据 */
const submissionList = ref([]) // [{ submission, items }]
const page = ref(1)
const pageSize = 20
const total = ref(0)
const loading = ref(false)

const isLogin = computed(() => !!global.isLogin)
const finished = computed(
  () => total.value > 0 && submissionList.value.length >= total.value
)

/** plan -> 每人可投递头数 映射：{ [planId]: max_submissions_per_user } */
const planLimitMap = ref({})

/** 顶部状态筛选 */
const tabs = [
  { key: 'all', label: '全部' },
  { key: 'ongoing', label: '交易中' },
  { key: 'finished', label: '交易结束' }
]
const activeTab = ref('all')

const filteredList = computed(() => {
  if (activeTab.value === 'ongoing') {
    return submissionList.value.filter(row => isOngoing(row.submission))
  }
  if (activeTab.value === 'finished') {
    return submissionList.value.filter(row => isFinished(row.submission))
  }
  return submissionList.value
})

const changeTab = key => {
  activeTab.value = key
}

/** 去登录 */
const goLogin = () => {
  uni.showToast({ title: '请在「我的」里登录账号', icon: 'none' })
}

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

/** 从 submission 里取 plan_id */
function getPlanIdFromSubmission(sub) {
  if (!sub) return 0
  return Number(
    sub.plan_id ||
      sub.PlanId ||
      sub.order_plan_id ||
      sub.OrderPlanId ||
      0
  )
}

/** 预拉取本页 plan 限制 */
async function prefetchPlanLimits(rows) {
  const ids = Array.from(
    new Set(
      (rows || [])
        .map(r => getPlanIdFromSubmission(r.submission))
        .filter(id => id && typeof planLimitMap.value[id] === 'undefined')
    )
  )

  if (!ids.length) return

  const tasks = ids.map(id => fetchPlanLimit(id))
  try {
    await Promise.all(tasks)
  } catch (e) {
    console.warn('prefetchPlanLimits error', e)
  }
}

/** 单个 plan 的详情，只取 max_submissions_per_user */
async function fetchPlanLimit(planId) {
  if (!planId) return
  if (typeof planLimitMap.value[planId] !== 'undefined') return

  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/brand-artist/order-plan-info`,
      method: 'GET',
      data: { id: planId }
    })

    const body = res.data || {}
    if (String(body.status).toLowerCase() !== 'success') {
      planLimitMap.value = {
        ...planLimitMap.value,
        [planId]: 0
      }
      return
    }

    const d = body.data || {}
    const limit = Number(d.max_submissions_per_user || 0)
    planLimitMap.value = {
      ...planLimitMap.value,
      [planId]: limit
    }
  } catch (e) {
    console.error('fetchPlanLimit error', e)
    planLimitMap.value = {
      ...planLimitMap.value,
      [planId]: 0
    }
  }
}

/** 提交状态数值 */
function getSubmissionStatus(sub) {
  if (!sub) return 0
  return Number(sub.status ?? sub.Status ?? 0)
}

/** 交易中 */
function isOngoing(sub) {
  const st = getSubmissionStatus(sub)
  // 0排队中 / 1已抢到待付款 / 2已付款 -> 交易中
  return st === 0 || st === 1 || st === 2
}

/** 交易结束 */
function isFinished(sub) {
  const st = getSubmissionStatus(sub)
  // 3排队失败 / 4取消 / 5支付超时 -> 交易结束
  return st === 3 || st === 4 || st === 5
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

    prefetchPlanLimits(rows)
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
  return (
    b.brand_name ||
    b.BrandName ||
    '未知品牌'
  )
}

/** 品牌 Logo */
function brandLogo(row) {
  const b = getBrandObj(row)
  return (
    b.logo_image ||
    b.LogoImage ||
    ''
  )
}

/** 显示价格 */
function displayPrice(it) {
  const total =
    it.price_total ??
    it.PriceTotal ??
    it.tier_price ??
    it.TierPrice ??
    0
  const n = Number(total) || 0
  return n.toFixed(2).replace(/\.00$/, '')
}

/** 作品首图 */
function firstRefImage(it) {
  const raw = it.ref_images || it.RefImages || ''
  if (!raw) return ''
  const arr = String(raw).split(',')
  return arr[0].trim()
}

/** 时间格式化 */
function formatTime(raw) {
  if (!raw) return ''
  let d
  if (typeof raw === 'number') {
    if (raw > 1e12) d = new Date(raw)
    else d = new Date(raw * 1000)
  } else if (typeof raw === 'string') {
    d = new Date(raw.replace(' ', 'T'))
  } else {
    return ''
  }
  if (Number.isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${hh}:${mm}`
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

/** 状态样式 */
function statusClass(row) {
  const st = getSubmissionStatus(row?.submission)
  return {
    'status-running': st === 0 || st === 1,
    'status-success': st === 2,
    'status-failed': st === 3 || st === 4 || st === 5
  }
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

/** 修改投递：先跳详情页，由详情再进编辑 */
function editSubmission(row) {
  goSubmissionDetail(row)
}

/** 联系妆师：预留 */
function contactArtist(row) {
  uni.showToast({
    title: '联系妆师功能待接入',
    icon: 'none'
  })
}

/** 编辑单个作品：点击缩略卡片 */
function goEditItem(row, it) {
  const sub = row?.submission || {}
  const submissionId = sub.id || sub.ID
  const itemId = it.id || it.ID
  if (!submissionId || !itemId) return
  const url = `/pkg-creator/creator_order/submission_item_form/submission_item_form?submission_id=${submissionId}&item_id=${itemId}`
  // #ifdef H5
  window.location.hash = url
  // #endif
  // #ifndef H5
  uni.navigateTo({ url })
  // #endif
}

/** 生命周期 */
onLoad(() => {
  fetchList(true)
})

onPullDownRefresh(() => {
  fetchList(true)
})

onReachBottom(() => {
  if (!finished.value) {
    fetchList(false)
  }
})
</script>

<style scoped>
.my-sub-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f7f8fc 0%, #ffffff 40%, #ffffff 100%);
}

/* 列表容器 */
.list-wrap {
  padding: 20rpx 24rpx 40rpx;
}

/* 顶部状态筛选 */
.status-tabs {
  margin-bottom: 20rpx;
  padding: 8rpx;
  border-radius: 999rpx;
  background: #f5f6fa;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.status-tab {
  flex: 1;
  height: 60rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.status-tab-text {
  font-size: 26rpx;
  color: #666666;
}
.status-tab-active {
  background: linear-gradient(
    90deg,
    #89d4ff 0%,
    #64c7ff 45%,
    #2fb1ff 75%,
    #1499f0 100%
  );
}
.status-tab-active .status-tab-text {
  color: #ffffff;
}

/* 空状态 */
.empty-wrap {
  padding: 40rpx 0;
}
.status-empty {
  padding-top: 20rpx;
}
.empty-card {
  margin: 0 10rpx;
  border-radius: 24rpx;
  padding: 32rpx 28rpx;
  background: #ffffff;
  box-shadow: 0 12rpx 30rpx rgba(15, 35, 95, 0.06);
}
.empty-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
}
.empty-desc {
  margin-top: 10rpx;
  font-size: 26rpx;
  color: #999999;
  line-height: 1.7;
}
.login-btn {
  margin-top: 24rpx;
  height: 72rpx;
  line-height: 72rpx;
  border-radius: 999rpx;
  border: none;
  background: linear-gradient(
    90deg,
    #89d4ff 0%,
    #64c7ff 45%,
    #2fb1ff 75%,
    #1499f0 100%
  );
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
}

/* 每一条投递卡片 */
.sub-card {
  margin-bottom: 24rpx;
  padding: 20rpx 22rpx 18rpx;
  border-radius: 20rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 24rpx rgba(15, 35, 95, 0.05);
}

/* 头部：品牌 + 状态 */
.sub-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}
.sub-brand {
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.brand-logo-box {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  display: flex;
  background: #f5f6fa;
  box-shadow: 0 4rpx 12rpx rgba(15, 35, 95, 0.12);
}
.brand-logo {
  width: 100%;
  height: 100%;
}
.brand-logo-placeholder {
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  display: flex;
}
.brand-logo-text {
  font-size: 30rpx;
  color: #1499f0;
}
.brand-info {
  display: flex;
  flex-direction: column;
}
.brand-name {
  max-width: 360rpx;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 28rpx;
  color: #222222;
  font-weight: 600;
}
.brand-time {
  margin-top: 4rpx;
  font-size: 22rpx;
  color: #999999;
}

/* 状态标签 */
.sub-status-tag {
  padding: 4rpx 18rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  background: #f5f7fb;
  color: #52627a;
}
.status-running {
  background: #fff7e6;
  color: #fa8c16;
}
.status-success {
  background: #e6fffb;
  color: #13c2c2;
}
.status-failed {
  background: #fff0f0;
  color: #ff6a6c; /* 参照 booking 页关注心形颜色 */
}

/* 中部：作品缩略卡片 */
.sub-body {
  margin-top: 18rpx;
}
.sub-items-row {
  display: flex;
  flex-direction: row;
  gap: 18rpx;
}
.sub-item-card {
  flex: 1;
  border-radius: 12rpx;
  padding: 10rpx 10rpx 12rpx;
  box-sizing: border-box;
  background: #f7f9fc;
  box-shadow: 0 4rpx 12rpx rgba(15, 35, 95, 0.04);
}
.item-image {
  width: 100%;
  height: 180rpx;
  border-radius: 8rpx;
  background: #f0f2f5;
}
.item-info {
  margin-top: 8rpx;
}
.item-title {
  font-size: 24rpx;
  color: #333333;
  line-height: 1.4;
}
.item-price {
  margin-top: 4rpx;
  font-size: 24rpx;
  color: #1499f0;
  font-weight: 600;
}

/* 无作品时提示 */
.sub-no-items {
  padding: 16rpx 6rpx;
}
.no-items-text {
  font-size: 24rpx;
  color: #999999;
}

/* 底部操作 */
.sub-footer-actions {
  margin-top: 18rpx;
  display: flex;
  justify-content: space-between;
}
.footer-link {
  font-size: 26rpx;
  color: #1499f0;
}

/* 底部提示 */
.list-footer {
  padding: 12rpx 0 40rpx;
  text-align: center;
}
.footer-text {
  font-size: 22rpx;
  color: #a1a9b3;
}

/* 隐藏滚动条 */
::-webkit-scrollbar {
  width: 0 !important;
  height: 0 !important;
  background: transparent !important;
  display: none !important;
}
</style>
