<template>
  <view class="submission-page">
    <!-- 主体滚动区 -->
    <scroll-view
      class="scroll-body"
      scroll-y
      :show-scrollbar="false"
    >
      <!-- 未登录 -->
      <view v-if="!isLogin" class="state-box">
        <text class="state-title">请先登录</text>
        <text class="state-desc">登录后可以查看本次投递详情。</text>
      </view>

      <!-- 缺少 submission_id -->
      <view v-else-if="!submissionId" class="state-box state-error">
        <text class="state-title">缺少必要参数</text>
        <text class="state-desc">需要提供 submission_id 才能查看详情。</text>
      </view>

      <!-- 加载中 -->
      <view v-else-if="loading && !hasFirstLoaded" class="state-box">
        <text class="state-title">加载中…</text>
        <text class="state-desc">正在加载投递详情</text>
      </view>

      <!-- 加载错误 -->
      <view v-else-if="errorMsg" class="state-box state-error">
        <text class="state-title">加载失败</text>
        <text class="state-desc">{{ errorMsg }}</text>
        <button class="primary-btn" type="default" @click="reloadDetail">重试</button>
      </view>

      <!-- 正常内容 -->
      <view v-else class="content">

        <!-- 概览卡片：投递基本信息 + 档期信息 -->
        <view class="card">
          <view class="card-header">
            <text class="card-title">投递详情</text>
            <text class="card-sub" v-if="planBasicText">
              {{ planBasicText }}
            </text>
          </view>

          <view class="info-row">
            <text class="info-label">投递编号</text>
            <text class="info-val">#{{ submission.submission_id }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">投递状态</text>
            <text class="info-val">{{ submission.status_text || '—' }}</text>
          </view>

          <view class="info-row" v-if="maxSubmissionsPerUser > 0">
            <text class="info-label">本次可投递头数上限</text>
            <text class="info-val">
              {{ maxSubmissionsPerUser }} 颗
              <text class="info-extra">
                （当前已填：{{ currentItemCount }} 颗）
              </text>
            </text>
          </view>
        </view>

        <!-- 排队信息卡片（严格使用 ahead_count / status_text） -->
        <view class="card">
          <view class="card-header">
            <text class="card-title">排队进度</text>
          </view>

          <view class="queue-summary">
            <view class="q-item">
              <text class="q-label">当前状态</text>
              <text class="q-value">
                {{ submission.status_text || '—' }}
              </text>
            </view>
            <view class="q-item">
              <text class="q-label">前面还有</text>
              <text class="q-value">
                <text v-if="typeof submission.ahead_count === 'number'">
                  {{ submission.ahead_count }} 人
                </text>
                <text v-else>--</text>
              </text>
            </view>
          </view>
        </view>

        <!-- 作品列表卡片（items） -->
        <view class="card">
          <view class="card-header card-header-with-action">
            <view>
              <text class="card-title">本次投递的娃头</text>
              <text class="card-sub">
                已填 {{ currentItemCount }} 颗
                <text v-if="maxSubmissionsPerUser > 0">
                  / 最多 {{ maxSubmissionsPerUser }} 颗
                </text>
              </text>
            </view>

            <!-- 新增作品按钮：达上限则隐藏 -->
            <view v-if="canAddItem" class="card-action">
              <button
                class="mini-add-btn"
                type="default"
                @click="goCreateItem"
              >
                <text class="mini-add-text">新增作品</text>
              </button>
            </view>
          </view>

          <!-- 没有作品 -->
          <view v-if="!submission.items || !submission.items.length" class="empty-box">
            <text class="empty-text">还没有填写任何娃头信息。</text>
            <text v-if="canAddItem" class="empty-tip">
              点右上角「新增作品」开始填写。
            </text>
          </view>

          <!-- 作品列表（直接用后端返回的 items 字段） -->
          <view
            v-for="item in submission.items"
            :key="item.id"
            class="item-row"
          >
            <view class="item-main" @click="goEditItem(item)">
              <view class="item-title-row">
                <text class="item-title">
                  {{ item.work_subject || '未命名作品' }}
                </text>
              </view>
              <view class="item-tags">
                <text
                  v-if="item.size"
                  class="item-tag"
                >
                  尺寸：{{ item.size }}
                </text>
                <text
                  v-if="item.tier_title"
                  class="item-tag"
                >
                  档位：{{ item.tier_title }}
                </text>
                <text
                  v-if="item.price_total !== undefined && item.price_total !== null"
                  class="item-tag"
                >
                  总价：¥{{ Number(item.price_total) }}
                </text>
              </view>
              <!-- 后端如果后续补 remark，这里会自动展示；没给就不显示 -->
              <view v-if="item.remark" class="item-remark">
                {{ item.remark }}
              </view>
            </view>

            <!-- 编辑按钮 -->
            <view class="item-right">
              <button
                class="edit-btn"
                type="default"
                size="mini"
                @click.stop="goEditItem(item)"
              >
                <text class="edit-text">编辑</text>
              </button>
            </view>
          </view>
        </view>

        <!-- 说明 -->
        <view class="hint-box">
          <text class="hint-text">
            提示：本页展示你在当前档期下的本次投递信息和排队进度。如需修改作品内容，可点击每一条作品右侧的「编辑」按钮。
          </text>
        </view>

        <view style="height: 160rpx;"></view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { onLoad, onShow, onUnload } from '@dcloudio/uni-app'
import { websiteUrl, global } from '@/common/config.js'

/** ====== 路由参数 ====== */
const submissionId = ref(0)

/** ====== 状态 ====== */
const loading = ref(false)
const hasFirstLoaded = ref(false)
const errorMsg = ref('')

const pollingTimer = ref(null)

/**
 * submission 排队信息（严格按照后端 SubmissionQueueInfoResp 映射）
 * type SubmissionQueueInfoResp struct {
 *   SubmissionID int64  `json:"submission_id"`
 *   PlanID       int    `json:"plan_id"`
 *   Mode         int64  `json:"mode"`
 *   AheadCount   int64  `json:"ahead_count"`
 *   Status       int64  `json:"status"`
 *   StatusText   string `json:"status_text"`
 *   Items        []model.OrderArtistSubmissionItem `json:"items"`
 * }
 */
const submission = reactive({
  submission_id: 0,
  plan_id: 0,
  mode: 0,
  ahead_count: 0,
  status: 0,
  status_text: '',
  items: []
})

/** 单独缓存 plan 信息（只请求一次，不跟着 3 秒轮询） */
const plan = reactive({
  id: 0,
  order_type: 0,
  max_submissions_per_user: 0,
  open_time: 0,
  close_time: 0
})
const hasLoadedPlan = ref(false)

/** 登录状态 */
const isLogin = computed(() => {
  const token = uni.getStorageSync('token') || ''
  return !!token || !!global.isLogin
})

/** 当前 submission 的作品数量 */
const currentItemCount = computed(() =>
  submission.items && submission.items.length ? submission.items.length : 0
)

/** plan 限制人数 */
const maxSubmissionsPerUser = computed(() =>
  Number(plan.max_submissions_per_user || 0)
)

/** 是否还能新增作品 */
const canAddItem = computed(() => {
  if (!isLogin.value) return false
  if (!submission.submission_id) return false
  const max = maxSubmissionsPerUser.value
  if (!max || max <= 0) {
    // 0 或未设置：视为不限
    return true
  }
  return currentItemCount.value < max
})

/** 顶部 plan 文本（没拿到就不显示，不再用“加载中”这种 placeholder） */
const planBasicText = computed(() => {
  if (!plan.id) return ''
  const typeMap = { 1: '常驻投递', 2: '限时手速', 3: '限时抽选', 4: '限时黑箱' }
  const mode = typeMap[Number(plan.order_type) || 0] || '档期'
  const open = fmtTime(plan.open_time)
  const close = fmtTime(plan.close_time)
  if (plan.open_time && plan.close_time) {
    return `${mode} · ${open} ~ ${close}`
  }
  return mode
})

/** 时间格式化（秒） */
function fmtTime (ts) {
  if (!ts) return '--'
  const d = new Date(Number(ts) * 1000)
  if (Number.isNaN(d.getTime())) return '--'
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${dd} ${hh}:${mi}`
}

/** 按 SubmissionQueueInfoResp 直接填充 submission */
function fillSubmissionFromQueueInfo (raw) {
  if (!raw) return

  submission.submission_id = Number(
    raw.submission_id || submission.submission_id || submissionId.value || 0
  )
  submission.plan_id = Number(raw.plan_id || submission.plan_id || 0)
  submission.mode = Number(raw.mode || 0)

  if (typeof raw.ahead_count === 'number') {
    submission.ahead_count = raw.ahead_count
  }
  if (typeof raw.status === 'number') {
    submission.status = raw.status
  }
  submission.status_text = raw.status_text || ''

  if (Array.isArray(raw.items)) {
    submission.items = raw.items
  } else {
    submission.items = []
  }
}

/** queue-info 接口：每 3 秒轮询一次 */
async function fetchDetail () {
  if (!isLogin.value || !submissionId.value) return

  if (!hasFirstLoaded.value) {
    loading.value = true
    errorMsg.value = ''
  }

  try {
    const token = uni.getStorageSync('token') || ''
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/submission/queue-info`,
      method: 'GET',
      header: { Authorization: token },
      data: { submission_id: submissionId.value }
    })

    const body = res.data || {}
    if (String(body.status).toLowerCase() !== 'success') {
      if (!hasFirstLoaded.value) {
        throw new Error(body.msg || '加载失败')
      }
      // 首次之后的错误只打印，不打断轮询
      console.warn('轮询 submission queue-info 失败：', body.msg)
      return
    }

    const raw = body.data || {}
    fillSubmissionFromQueueInfo(raw)

    // 首次拿到 queue-info 后，如果还没加载过 plan，则单独请求一次 plan 详情
    if (!hasLoadedPlan.value && submission.plan_id) {
      fetchPlan(submission.plan_id)
    }

    hasFirstLoaded.value = true
  } catch (e) {
    console.error('加载 submission queue-info 失败', e)
    if (!hasFirstLoaded.value) {
      errorMsg.value = e?.message || '加载失败，请稍后重试'
    }
  } finally {
    loading.value = false
  }
}

/** 单独请求 plan 详情（只请求一次，不参与 3 秒轮询） */
async function fetchPlan (planId) {
  if (!planId) return
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/brand-artist/order-plan-info`,
      method: 'GET',
      data: { id: planId }
    })
    const body = res.data || {}
    if (String(body.status).toLowerCase() !== 'success') {
      console.warn('加载 plan 详情失败：', body.msg)
      return
    }
    const d = body.data || {}
    plan.id = d.id || planId
    plan.order_type = d.order_type || 0
    plan.max_submissions_per_user = d.max_submissions_per_user ?? 0
    plan.open_time = Number(d.open_time || 0)
    plan.close_time = Number(d.close_time || 0)
    hasLoadedPlan.value = true
  } catch (e) {
    console.error('请求 plan 详情异常', e)
  }
}

/** 手动重试 detail（包括首轮和出错时的按钮） */
function reloadDetail () {
  hasFirstLoaded.value = false
  errorMsg.value = ''
  fetchDetail()
}

/** 跳转：新增作品（需要 submission_id + plan_id） */
function goCreateItem () {
  if (!submission.submission_id || !submission.plan_id) return
  const url =
    `/pkg-creator/creator_order/submission_item_form/submission_item_form?submission_id=${submission.submission_id}&plan_id=${submission.plan_id}`

  // #ifdef H5
  window.location.hash = url
  // #endif
  // #ifndef H5
  uni.navigateTo({ url })
  // #endif
}

/** 跳转：编辑作品（带 submission_item_id） */
function goEditItem (item) {
  if (!item || !item.id) return
  const url =
    `/pkg-creator/creator_order/submission_item_form/submission_item_form?submission_item_id=${item.id}`

  // #ifdef H5
  window.location.hash = url
  // #endif
  // #ifndef H5
  uni.navigateTo({ url })
  // #endif
}

/** 启动 / 停止轮询 */
function startPolling () {
  stopPolling()
  // 立即拉一次
  fetchDetail()
  // 每 3 秒刷新 queue-info
  pollingTimer.value = setInterval(fetchDetail, 5000)
}
function stopPolling () {
  if (pollingTimer.value) {
    clearInterval(pollingTimer.value)
    pollingTimer.value = null
  }
}

/** ====== 生命周期 ====== */
onLoad((q = {}) => {
  // URL: /#/pkg-creator/creator_order/submission_detail/submission_detail?submission_id=7
  submissionId.value = Number(q.submission_id || 0)

  // 使用系统导航条，设置一个固定标题即可
  uni.setNavigationBarTitle({ title: '投递详情' })
})

onShow(() => {
  if (!isLogin.value || !submissionId.value) return
  startPolling()
})

onUnload(() => {
  stopPolling()
})
</script>

<style scoped>
.submission-page {
  min-height: 100vh;
  background: #f6f7fb;
}

/* 滚动容器 */
.scroll-body {
  height: 100vh;
}

/* 主体内容 */
.content {
  padding-bottom: 40rpx;
}

/* ====== 通用卡片 ====== */
.card {
  margin: 24rpx 24rpx 0;
  padding: 24rpx;
  background: #ffffff;
  border-radius: 20rpx;
  box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.06);
}

.card-header {
  margin-bottom: 16rpx;
}
.card-header-with-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card-title {
  font-size: 28rpx;
  color: #222;
  font-weight: 600;
}
.card-sub {
  font-size: 24rpx;
  color: #999;
  margin-top: 4rpx;
}
.card-action {
  margin-left: 16rpx;
}

/* 信息行 */
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10rpx 0;
}
.info-label {
  font-size: 26rpx;
  color: #555;
}
.info-val {
  font-size: 26rpx;
  color: #111827;
}
.info-extra {
  font-size: 22rpx;
  color: #9ca3af;
}

/* mini 新增按钮 */
.mini-add-btn {
  padding: 0 26rpx;
  height: 60rpx;
  border-radius: 999rpx;
  border: none;
  margin: 0;
  background: linear-gradient(90deg, #89d4ff 0%, #64c7ff 45%, #2fb1ff 75%, #1499f0 100%);
  box-shadow: 0 4rpx 12rpx rgba(24, 144, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
}
.mini-add-text {
  font-size: 24rpx;
  color: #ffffff;
  font-weight: 600;
}

/* 排队信息 */
.queue-summary {
  margin-top: 4rpx;
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
}
.q-item {
  flex: 1;
  padding: 16rpx;
  border-radius: 16rpx;
  background: #f7f8fc;
}
.q-label {
  font-size: 24rpx;
  color: #6b7280;
}
.q-value {
  margin-top: 6rpx;
  font-size: 28rpx;
  color: #111827;
  font-weight: 600;
}

/* 作品列表 */
.empty-box {
  padding: 10rpx 4rpx 4rpx;
}
.empty-text {
  font-size: 26rpx;
  color: #777;
}
.empty-tip {
  display: block;
  margin-top: 4rpx;
  font-size: 24rpx;
  color: #9ca3af;
}

.item-row {
  margin-top: 16rpx;
  padding: 16rpx;
  border-radius: 16rpx;
  background: #f7f8fc;
  display: flex;
  align-items: stretch;
  gap: 12rpx;
}
.item-main {
  flex: 1;
}
.item-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.item-title {
  font-size: 28rpx;
  color: #111827;
  font-weight: 600;
}
.item-tags {
  margin-top: 6rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}
.item-tag {
  padding: 4rpx 10rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  color: #111827;
  background: #e0efff;
}
.item-remark {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #6b7280;
  line-height: 1.6;
}
.item-right {
  display: flex;
  align-items: center;
}
.edit-btn {
  border-radius: 999rpx;
  height: 60rpx;
  padding: 0 20rpx;
  border: 1rpx solid #9ca3af;
  background: #ffffff;
  margin: 0;
}
.edit-text {
  font-size: 24rpx;
  color: #374151;
}

/* 提示 */
.hint-box {
  margin: 18rpx 24rpx 0;
}
.hint-text {
  font-size: 24rpx;
  color: #888;
  line-height: 1.7;
}

/* ====== 通用状态视图 ====== */
.state-box {
  margin: 120rpx 24rpx 0;
  padding: 24rpx;
  text-align: center;
  color: #555;
}
.state-title {
  font-size: 30rpx;
  font-weight: 600;
  margin-bottom: 8rpx;
}
.state-desc {
  font-size: 24rpx;
  color: #888;
}
.state-error .state-title {
  color: #f43f5e;
}
.primary-btn {
  margin-top: 20rpx;
  border-radius: 999rpx;
  padding: 10rpx 40rpx;
  font-size: 26rpx;
  background: linear-gradient(90deg, #89d4ff 0%, #64c7ff 45%, #2fb1ff 75%, #1499f0 100%);
  color: #ffffff;
}

/* 隐藏 H5 滚动条 */
::-webkit-scrollbar {
  width: 0 !important;
  height: 0 !important;
  background: transparent !important;
  display: none !important;
}
</style>
