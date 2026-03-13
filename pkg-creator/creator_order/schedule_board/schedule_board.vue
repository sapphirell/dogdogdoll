<template>
  <view class="schedule-board-page">
    <view v-if="loading" class="state-box">
      <text class="state-title">加载中…</text>
      <text class="state-desc">正在获取排期数据</text>
    </view>

    <view v-else-if="errorMsg" class="state-box state-error">
      <text class="state-title">加载失败</text>
      <text class="state-desc">{{ errorMsg }}</text>
      <view class="retry-btn" @tap="fetchBoard">重试</view>
    </view>

    <view v-else class="board-content">
      <view class="hero-card">
        <view class="hero-top">
          <view class="hero-main">
            <text class="hero-title font-alimamashuhei">日历排期</text>
            <text class="hero-sub">拖拽子单到日期格，快速安排工期</text>
            <view class="hero-meta-row">
              <text class="hero-meta-chip">Plan #{{ planId }}</text>
              <text class="hero-meta-chip">今日 {{ todayLabel }}</text>
            </view>
          </view>
          <button
            class="save-btn"
            :class="{ disabled: saving }"
            :disabled="saving"
            @tap="saveBoard"
          >
            {{ saving ? '保存中...' : '保存排期' }}
          </button>
        </view>

        <view class="metrics-row">
          <view class="metric-item">
            <text class="metric-label">子单总数</text>
            <text class="metric-value font-title">{{ orders.length }}</text>
          </view>
          <view class="metric-item">
            <text class="metric-label">已排期</text>
            <text class="metric-value">{{ scheduledCount }}</text>
          </view>
          <view class="metric-item">
            <text class="metric-label">默认工期</text>
            <text class="metric-value">{{ defaultDurationDays }}天</text>
          </view>
        </view>
      </view>

      <view class="calendar-card">
        <view class="calendar-head">
          <view class="calendar-head-main">
            <text class="calendar-title font-alimamashuhei">排期面板</text>
            <text class="calendar-sub">拖拽订单到日期格可快速安排工期</text>
          </view>
          <view class="rule-chip">单日上限 {{ maxPerDay }} 单</view>
        </view>

        <order-schedule-calendar
          :orders="orders"
          :selected-order-id="selectedOrderId"
          :default-duration-days="defaultDurationDays"
          :max-per-day="maxPerDay"
          :today="today"
          @update:selectedOrderId="onUpdateSelectedOrder"
          @change="onCalendarChange"
          @invalid="onCalendarInvalid"
        />
      </view>

      <view class="foot-tip">
        <uni-icons type="info" size="16" color="#8a96a8" />
        <text>规则：单日最多同时{{ maxPerDay }}单（允许最多重叠{{ maxPerDay - 1 }}个订单）。</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { websiteUrl } from '@/common/config.js'
import OrderScheduleCalendar from '@/components/order-schedule-calendar/order-schedule-calendar.vue'

const planId = ref(0)
const loading = ref(false)
const saving = ref(false)
const errorMsg = ref('')
const orders = ref([])
const selectedOrderId = ref(0)
const defaultDurationDays = ref(7)
const today = ref('')
const maxPerDay = 3

const todayLabel = computed(() => {
  const normalized = normalizeDateText(today.value || '')
  return normalized || formatDate(new Date())
})

const scheduledCount = computed(() =>
  orders.value.filter((row) => row.start_date && row.end_date).length
)

function formatDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function normalizeDateText(raw) {
  if (!raw) return ''
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) return formatDate(raw)
  const txt = String(raw).trim()
  if (!txt) return ''
  const head = txt.slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(head)) return head
  const parsed = new Date(txt)
  if (!Number.isNaN(parsed.getTime())) return formatDate(parsed)
  const m = txt.match(/(\d{4})[\/.-](\d{1,2})[\/.-](\d{1,2})/)
  if (!m) return ''
  return `${m[1]}-${String(Number(m[2])).padStart(2, '0')}-${String(Number(m[3])).padStart(2, '0')}`
}

function getToken() {
  return uni.getStorageSync('token') || ''
}

function ensureLoginToken() {
  const token = getToken()
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return ''
  }
  return token
}

async function resolvePlanIdIfMissing() {
  if (planId.value > 0) return true
  const token = ensureLoginToken()
  if (!token) return false
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/received-submissions`,
      method: 'GET',
      header: { Authorization: token },
      data: { page: 1, size: 1 },
    })
    const body = res?.data || {}
    if (String(body.status).toLowerCase() !== 'success') return false
    const list = body?.data?.list || []
    const first = Array.isArray(list) && list.length ? list[0] : null
    const pid = Number(first?.submission?.plan_id || first?.submission?.PlanID || 0)
    if (pid > 0) {
      planId.value = pid
      return true
    }
  } catch (_) {}
  return false
}

function normalizeOrders(items) {
  if (!Array.isArray(items)) return []
  return items.map((row) => ({
    submission_id: Number(row?.submission_id || 0),
    submission_item_id: Number(row?.submission_item_id || 0),
    submission_status: Number(row?.submission_status || 0),
    submission_status_text: String(row?.submission_status_text || ''),
    user_id: Number(row?.user_id || 0),
    queue_no: Number(row?.queue_no || 0),
    work_subject: String(row?.work_subject || '').trim(),
    size: String(row?.size || '').trim(),
    tier_title: String(row?.tier_title || '').trim(),
    price_total: Number(row?.price_total || 0),
    adjust_price: Number(row?.adjust_price || 0),
    cover_image: String(row?.cover_image || row?.coverImage || '').trim(),
    ref_images: row?.ref_images || row?.refImages || '',
    duration_days: Number(row?.duration_days || 0),
    start_date: normalizeDateText(row?.start_date || ''),
    end_date: normalizeDateText(row?.end_date || ''),
  }))
}

async function fetchBoard() {
  if (loading.value) return
  errorMsg.value = ''
  const ok = await resolvePlanIdIfMissing()
  if (!ok || planId.value <= 0) {
    errorMsg.value = '缺少 plan_id，无法加载排期'
    return
  }
  const token = ensureLoginToken()
  if (!token) return

  loading.value = true
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/schedule/board`,
      method: 'GET',
      header: { Authorization: token },
      data: { plan_id: planId.value },
    })
    const body = res?.data || {}
    if (String(body.status).toLowerCase() !== 'success') {
      throw new Error(body.msg || '加载失败')
    }
    const data = body?.data || {}
    defaultDurationDays.value = Number(data?.default_duration_days || 7) || 7
    today.value = String(data?.today || '').trim()
    orders.value = normalizeOrders(data?.items || [])
    if (!selectedOrderId.value && orders.value.length) {
      selectedOrderId.value = Number(orders.value[0]?.submission_item_id || 0)
    }
  } catch (e) {
    errorMsg.value = e?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

function onCalendarChange(nextOrders) {
  orders.value = normalizeOrders(nextOrders || [])
}

function onUpdateSelectedOrder(id) {
  selectedOrderId.value = Number(id || 0)
}

function onCalendarInvalid(message) {
  if (!message) return
  uni.showToast({ title: String(message), icon: 'none' })
}

async function saveBoard() {
  if (saving.value) return
  const token = ensureLoginToken()
  if (!token) return
  if (planId.value <= 0) {
    uni.showToast({ title: '缺少 plan_id', icon: 'none' })
    return
  }
  saving.value = true
  uni.showLoading({ title: '保存中' })
  try {
    const items = orders.value
      .filter((row) => row.start_date && row.end_date)
      .map((row) => ({
        submission_item_id: Number(row.submission_item_id || 0),
        start_date: String(row.start_date || '').trim(),
        end_date: String(row.end_date || '').trim(),
        duration_days: Number(row.duration_days || 0),
      }))
      .filter((row) => row.submission_item_id > 0 && row.start_date && row.end_date)

    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/schedule/board/save`,
      method: 'POST',
      header: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      data: {
        plan_id: planId.value,
        items,
      },
    })
    const body = res?.data || {}
    if (String(body.status).toLowerCase() !== 'success') {
      throw new Error(body.msg || '保存失败')
    }
    uni.showToast({ title: '保存成功', icon: 'success' })
    await fetchBoard()
  } catch (e) {
    uni.showToast({ title: e?.message || '保存失败', icon: 'none' })
  } finally {
    saving.value = false
    uni.hideLoading()
  }
}

onLoad((options) => {
  uni.setNavigationBarTitle({ title: '日历排期' })
  planId.value = Number(options?.plan_id || 0)
  fetchBoard()
})

onShow(() => {
  if (planId.value > 0) fetchBoard()
})
</script>

<style scoped lang="scss">
.schedule-board-page {
  --ink: #1f2937;
  --muted: #6b7280;
  --line: #e5e7eb;
  --line-strong: #d9dee7;
  --surface: #ffffff;
  --surface-subtle: #f7f8fa;
  --primary: #78daf5;
  --primary-press: #2db5dc;
  --primary-soft: rgba(73, 202, 238, 0.15);
  min-height: 100vh;
  background:
    radial-gradient(108% 76% at 3% -14%, rgba(255, 255, 255, 0.86) 0%, rgba(255, 255, 255, 0) 58%),
    linear-gradient(180deg, #f9fafc 0%, #f3f5f8 56%, #f6f7fa 100%);
  padding: 22rpx;
  box-sizing: border-box;
}

.board-content {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  overflow: visible;
}

.hero-main {
  flex: 1;
  min-width: 0;
}

.hero-card {
  border-radius: 22rpx;
  background: var(--surface);
  border: 1rpx solid var(--line);
  box-shadow: 0 10rpx 24rpx rgba(15, 23, 42, 0.05);
  padding: 24rpx;
}

.hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.hero-title {
  display: block;
  font-size: 40rpx;
  color: #131a27;
  font-weight: 700;
  letter-spacing: 0.4rpx;
}

.hero-sub {
  display: block;
  margin-top: 8rpx;
  font-size: 23rpx;
  color: #6d7788;
}

.hero-meta-row {
  margin-top: 12rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.hero-meta-chip {
  border-radius: 999rpx;
  padding: 4rpx 14rpx;
  font-size: 20rpx;
  color: #4b5563;
  border: 1rpx solid #e2e7ef;
  background: #f5f8fb;
}

.save-btn {
  margin: 0;
  width: 188rpx;
  height: 70rpx;
  line-height: 70rpx;
  border-radius: 999rpx;
  border: none;
  background: linear-gradient(180deg, #78daf5 0%, #2eb9df 100%);
  color: #ffffff;
  font-size: 24rpx;
  font-weight: 600;
  box-shadow: 0 8rpx 18rpx rgba(73, 202, 238, 0.36);
}

.save-btn::after {
  border: none;
}

.save-btn.disabled {
  background: linear-gradient(180deg, #b8e9f7 0%, #a4e2f4 100%);
  color: rgba(255, 255, 255, 0.84);
  box-shadow: none;
}

.metrics-row {
  margin-top: 16rpx;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12rpx;
}

.metric-item {
  border-radius: 16rpx;
  padding: 14rpx 12rpx;
  background: var(--surface-subtle);
  border: 1rpx solid var(--line);
}

.metric-label {
  display: block;
  font-size: 20rpx;
  color: #8792a5;
}

.metric-value {
  display: block;
  margin-top: 6rpx;
  font-size: 32rpx;
  font-weight: 700;
  color: #1f2937;
}

.metric-item:nth-child(2) .metric-value {
  color: #1f2937;
}

.metric-item:nth-child(3) .metric-value {
  color: #445167;
}

.calendar-card {
  border-radius: 22rpx;
  background: var(--surface);
  border: 1rpx solid var(--line);
  box-shadow: 0 10rpx 24rpx rgba(15, 23, 42, 0.05);
  padding: 20rpx;
  overflow: visible;
}

.calendar-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12rpx;
  padding: 8rpx 6rpx 14rpx;
}

.calendar-head-main {
  flex: 1;
  min-width: 0;
}

.calendar-title {
  display: block;
  font-size: 32rpx;
  color: var(--ink);
}

.calendar-sub {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #7b8494;
}

.rule-chip {
  padding: 10rpx 16rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  color: #4b5563;
  background: #f3f4f6;
  border: 1rpx solid #e2e7ef;
  font-weight: 600;
}

.foot-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  border-radius: 14rpx;
  border: 1rpx solid var(--line);
  background: #ffffff;
  padding: 14rpx 16rpx;

  text {
    font-size: 22rpx;
    color: #687384;
  }
}

.state-box {
  margin-top: 56rpx;
  padding: 34rpx 28rpx;
  text-align: center;
  border-radius: 24rpx;
  background: #ffffff;
  border: 1rpx solid var(--line);
  box-shadow: 0 12rpx 24rpx rgba(15, 23, 42, 0.06);
}

.state-box.state-error {
  background: linear-gradient(180deg, #fff7f7 0%, #fff2f2 100%);
  border-color: #f6d7d7;
}

.state-title {
  display: block;
  font-size: 32rpx;
  color: var(--ink);
  font-weight: 700;
}

.state-desc {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: var(--muted);
}

.retry-btn {
  margin: 24rpx auto 0;
  width: 180rpx;
  height: 66rpx;
  line-height: 66rpx;
  border-radius: 999rpx;
  background: linear-gradient(180deg, #78daf5 0%, #2eb9df 100%);
  color: #ffffff;
  font-size: 24rpx;
  font-weight: 600;
  box-shadow: 0 8rpx 18rpx rgba(73, 202, 238, 0.32);
}

:deep(.schedule-calendar) {
  --status-c0: #eef1f4;
  --status-c1: #e8edf1;
  --status-c2: #e3e8ee;
  --status-c3: #dde4eb;
  --status-c4: #d8e0e8;
  --status-c5: #d1dae4;
  --status-c6: #b7c3d1;
}

:deep(.schedule-calendar .month-btn) {
  background: #f5f6f8;
  border: 1rpx solid #e5e8ee;
}

:deep(.schedule-calendar .month-title) {
  color: #243041;
}

:deep(.schedule-calendar .weekday-text) {
  color: #8591a4;
}

:deep(.schedule-calendar .schedule-day-cell) {
  background: #fafbfc;
  border-color: #e6eaf0;
}

:deep(.schedule-calendar .schedule-day-cell.today) {
  background: #f2f4f7;
  border-color: #d7dce4;
}

:deep(.schedule-calendar .schedule-day-cell.hover) {
  border-color: #b7c0ce;
  box-shadow: inset 0 0 0 2rpx rgba(129, 145, 166, 0.18);
}

:deep(.schedule-calendar .selected-panel) {
  background: #ffffff;
  border: 1rpx solid #e4e8ef;
}

:deep(.schedule-calendar .order-item.selected) {
  box-shadow: inset 0 0 0 2rpx rgba(139, 151, 168, 0.34);
}

:deep(.schedule-calendar .selected-action-chip.drag-chip) {
  background: #ffffff;
  color: #1f2937;
  border-color: #d7dde6;
}

:deep(.schedule-calendar .selected-action-chip.resize-chip) {
  background: #ffffff;
  color: #1f2937;
  border-color: #d7dde6;
}

:deep(.schedule-calendar .selected-action-chip.clear-chip) {
  background: #ffffff;
  color: #1f2937;
  border-color: #d7dde6;
}

:deep(.schedule-calendar .order-item-drag) {
  background: #ffffff;
  color: #1f2937;
  border: 1rpx solid #d7dde6;
}

:deep(.schedule-calendar .drag-float) {
  background: rgba(55, 65, 81, 0.92);
}

@media (max-width: 780rpx) {
  .hero-card {
    padding: 22rpx 20rpx;
  }

  .hero-top {
    flex-direction: column;
  }

  .save-btn {
    width: 100%;
  }

  .hero-title {
    font-size: 36rpx;
  }

  .metrics-row {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .calendar-head {
    flex-direction: column;
    gap: 8rpx;
  }

  .rule-chip {
    align-self: flex-start;
  }
}
</style>
