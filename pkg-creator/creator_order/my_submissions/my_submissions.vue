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
      <!-- 空状态 -->
      <view v-if="!loading && submissionList.length === 0" class="empty-wrap">
        <view class="empty-card">
          <text class="empty-title">还没有投递记录</text>
          <text class="empty-desc">去找喜欢的妆师 / 毛娘，投递你的第一个方案吧。</text>
        </view>
      </view>

      <!-- 列表 -->
      <view
        v-for="row in submissionList"
        :key="row.submission?.id || row.submission?.ID"
        class="sub-card"
        @click="goSubmissionDetail(row)"
      >
        <!-- 顶部：标题 + 模式 + 状态 -->
        <view class="sub-header">
          <view class="sub-title-box">
            <text class="sub-artist">
              {{ displayArtistName(row) }}
            </text>
            <text
              class="sub-mode-chip"
              :class="modeClass(row.submission?.mode || row.submission?.Mode)"
            >
              {{ modeName(row.submission?.mode || row.submission?.Mode) }}
            </text>
          </view>
          <view class="sub-status-tag">{{ summaryStatus(row) }}</view>
        </view>

        <!-- 元信息：编号 + 时间 -->
        <view class="sub-meta">
          <text class="meta-text">
            投递编号 #{{ row.submission?.id || row.submission?.ID }}
          </text>
          <text class="meta-text">
            {{ formatTime(row.submission?.created_at || row.submission?.CreatedAt) }}
          </text>
        </view>

        <!-- 子项摘要 -->
        <view class="sub-items">
          <view
            class="sub-item-line"
            v-for="(it, idx) in (row.items || []).slice(0, 2)"
            :key="it.id || it.ID || idx"
          >
            <view class="item-left">
              <text class="item-main">
                {{ it.work_subject || it.WorkSubject || '作品' }}
              </text>
              <text v-if="(it.size || it.Size)" class="item-size">
                · {{ it.size || it.Size }}
              </text>
            </view>

            <!-- 右侧：价格 + 编辑按钮 -->
            <view class="item-right">
              <text class="item-price">
                ¥{{ displayPrice(it) }}
              </text>
              <text
                class="item-edit"
                @click.stop="goEditItem(row, it)"
              >
                编辑
              </text>
            </view>
          </view>

          <view
            v-if="(row.items || []).length > 2"
            class="sub-more"
          >
            <text>共 {{ (row.items || []).length }} 个子项</text>
          </view>
        </view>

        <!-- 底部：说明 + 操作按钮 -->
        <view class="sub-footer">
          <text class="sub-footer-text">
            点击卡片可查看该投递下的所有子项和排队情况。
          </text>
        </view>

        <!-- 新增作品按钮（达到 max_submissions_per_user 后隐藏） -->
        <view class="sub-actions">
          <button
            v-if="canAddItem(row)"
            class="sub-btn sub-btn-add"
            type="default"
            @click.stop="goAddItem(row)"
          >
            新增作品
          </button>
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
const finished = computed(() => total.value > 0 && submissionList.value.length >= total.value)

/** plan -> 每人可投递头数 映射：{ [planId]: max_submissions_per_user } */
const planLimitMap = ref({})

/** 返回 */
const goBack = () => {
  uni.navigateBack({ delta: 1 })
}

/** 去登录：这里简单提示，保持原逻辑 */
const goLogin = () => {
  uni.showToast({ title: '请在「我的」里登录账号', icon: 'none' })
}

/** 确保登录状态（有 token 时尝试刷新 userInfo） */
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

/** 从 submission 里取 plan_id（兼容几种命名） */
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

/** 预拉取本页涉及到的 plan 限制，不轮询，只拉一次并做缓存 */
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
    // 某些失败没关系，后端也会做校验
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
      // 接口失败时默认视为不限，避免前端锁死
      planLimitMap.value = {
        ...planLimitMap.value,
        [planId]: 0
      }
      return
    }

    const d = body.data || {}
    const limit = Number(d.max_submissions_per_user || 0) // 0 或未设置视为不限
    planLimitMap.value = {
      ...planLimitMap.value,
      [planId]: limit
    }
  } catch (e) {
    console.error('fetchPlanLimit error', e)
    // 网络错误同样记为不限
    planLimitMap.value = {
      ...planLimitMap.value,
      [planId]: 0
    }
  }
}

/** 判断当前投递是否还可以新增作品 */
function canAddItem(row) {
  const sub = row?.submission || {}
  const planId = getPlanIdFromSubmission(sub)
  const items = row?.items || []

  // 没有 planId 时，不做限制（交给后端兜底）
  if (!planId) return true

  const limit = planLimitMap.value[planId]

  // 还没拉到 plan 详情时，默认允许显示新增按钮，避免用户完全无法操作
  if (typeof limit === 'undefined') return true

  // limit <= 0 视为不限
  if (!limit || limit <= 0) return true

  // 达到上限则不显示新增按钮
  return items.length < limit
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

    // 拉完列表后，按本页涉及的 plan_id 请求一次 plan 详情（只取 max_submissions_per_user）
    prefetchPlanLimits(rows)
  } catch (e) {
    console.error('加载投递列表失败', e)
    uni.showToast({ title: '网络异常，加载失败', icon: 'none' })
  } finally {
    loading.value = false
    uni.stopPullDownRefresh()
  }
}

/** 模式名称 */
function modeName(mode) {
  const m = Number(mode || 0)
  if (m === 1) return '常驻投递'
  if (m === 2) return '限时手速'
  if (m === 3) return '限时抽选'
  if (m === 4) return '限时黑箱'
  return '投递'
}

/** 模式样式 */
function modeClass(mode) {
  const m = Number(mode || 0)
  return {
    'mode-direct': m === 1,
    'mode-speed': m === 2,
    'mode-lottery': m === 3,
    'mode-black': m === 4
  }
}

/** 顶部作者名字 */
function displayArtistName(row) {
  const sub = row?.submission || {}
  return (
    sub.artist_name ||
    sub.brand_name ||
    sub.plan_title ||
    '我的投递'
  )
}

/** 聚合状态文案（可以后面再按 status 细化） */
function summaryStatus(row) {
  const items = row?.items || []
  if (!items.length) return '草稿'
  return '已投递'
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

/** 点击卡片：投递详情（你后面可以换成 submission_detail 页面） */
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

/** 新增作品：跳 submission_item_form（无 item_id） */
function goAddItem(row) {
  const sub = row?.submission || {}
  const submissionId = sub.id || sub.ID
  if (!submissionId) return
  const url = `/pkg-creator/creator_order/submission_item_form/submission_item_form?submission_id=${submissionId}`
  // #ifdef H5
  window.location.hash = url
  // #endif
  // #ifndef H5
  uni.navigateTo({ url })
  // #endif
}

/** 编辑单个作品：跳 submission_item_form（带 item_id） */
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
  background: linear-gradient(180deg, #f5f8ff 0%, #ffffff 40%, #ffffff 100%);
}

/* 顶部栏 */
.topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  height: 88rpx;
  padding: 0 24rpx;
  display: grid;
  grid-template-columns: 180rpx 1fr 120rpx;
  align-items: center;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: saturate(160%) blur(10px);
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
}
.topbar-left {
  display: flex;
  align-items: center;
}
.back-icon {
  width: 15rpx;
  height: 28rpx;
  margin-right: 12rpx;
}
.back-text {
  font-size: 28rpx;
  color: #111;
}
.topbar-title {
  text-align: center;
  font-size: 30rpx;
  font-weight: 600;
  color: #111;
}
.topbar-right {
  justify-self: flex-end;
}
.topbar-placeholder {
  height: 88rpx;
}

/* 列表容器 */
.list-wrap {
  padding: 20rpx 24rpx 40rpx;
}

/* 空状态 */
.empty-wrap {
  padding: 40rpx 24rpx;
}
.empty-card {
  border-radius: 24rpx;
  padding: 32rpx 28rpx;
  background: #ffffff;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.06);
}
.empty-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #222;
}
.empty-desc {
  margin-top: 10rpx;
  font-size: 26rpx;
  color: #777;
  line-height: 1.7;
}
.login-btn {
  margin-top: 24rpx;
  height: 72rpx;
  line-height: 72rpx;
  border-radius: 999rpx;
  border: none;
  background: linear-gradient(90deg, #89d4ff 0%, #64c7ff 45%, #2fb1ff 75%, #1499f0 100%);
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
}

/* 每一条投递卡片 */
.sub-card {
  margin-bottom: 20rpx;
  padding: 24rpx 22rpx 20rpx;
  border-radius: 20rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
}

/* 头部：标题 + 状态 */
.sub-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}
.sub-title-box {
  display: flex;
  align-items: center;
  gap: 12rpx;
  min-width: 0;
}
.sub-artist {
  max-width: 60vw;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 28rpx;
  color: #222;
  font-weight: 600;
}
.sub-mode-chip {
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
}
.mode-direct {
  background: #f0faf4;
  color: #19a15f;
}
.mode-speed {
  background: #ffc8a4;
  color: #525252;
}
.mode-lottery {
  background: #f4f0ff;
  color: #6e4bd6;
}
.mode-black {
  background: #f5f5f5;
  color: #333;
}
.sub-status-tag {
  font-size: 24rpx;
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #89d4ff 0%, #64c7ff 60%, #2fb1ff 100%);
  color: #fff;
}

/* 元信息 */
.sub-meta {
  margin-top: 10rpx;
  display: flex;
  justify-content: space-between;
  font-size: 22rpx;
  color: #999;
}

/* 子项列表 */
.sub-items {
  margin-top: 18rpx;
  border-radius: 16rpx;
  background: #f7f9fc;
  padding: 12rpx 14rpx;
}
.sub-item-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6rpx 4rpx;
}
.item-left {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  min-width: 0;
}
.item-main {
  max-width: 52vw;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 26rpx;
  color: #333;
}
.item-size {
  font-size: 24rpx;
  color: #777;
}

/* 右侧区域：价格 + 编辑 */
.item-right {
  display: flex;
  align-items: center;
  gap: 10rpx;
}
.item-price {
  font-size: 26rpx;
  color: #111;
  font-weight: 600;
}
.item-edit {
  font-size: 24rpx;
  color: #409eff;
}

/* 更多 */
.sub-more {
  margin-top: 4rpx;
  font-size: 22rpx;
  color: #888;
}

/* 底部小字 */
.sub-footer {
  margin-top: 8rpx;
}
.sub-footer-text {
  font-size: 22rpx;
  color: #a1a9b3;
}

/* 操作按钮区域 */
.sub-actions {
  margin-top: 12rpx;
  display: flex;
  justify-content: flex-end;
}
.sub-btn {
  margin: 0;
  padding: 0 26rpx;
  height: 64rpx;
  line-height: 64rpx;
  border-radius: 999rpx;
  border: none;
  font-size: 24rpx;
}
.sub-btn-add {
  background: linear-gradient(90deg, #89d4ff 0%, #64c7ff 45%, #2fb1ff 75%, #1499f0 100%);
  color: #ffffff;
  box-shadow: 0 6rpx 18rpx rgba(24, 144, 255, 0.22);
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
