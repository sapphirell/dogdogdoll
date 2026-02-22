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
      <view class="head-card">
        <view class="head-main">
          <text class="head-title font-alimamashuhei">订单日历排期</text>
          <text class="head-sub">
            Plan #{{ planId }} · 共 <text class="font-title">{{ orders.length }}</text> 个子单
          </text>
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

      <view class="calendar-card">
        <order-schedule-calendar
          :orders="orders"
          :selected-order-id="selectedOrderId"
          :default-duration-days="defaultDurationDays"
          :today="today"
          @update:selectedOrderId="onUpdateSelectedOrder"
          @change="onCalendarChange"
          @invalid="onCalendarInvalid"
        />
      </view>

      <view class="foot-tip">
        <text>规则：单日最多同时2单（允许最多重叠1个订单）。</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
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
  min-height: 100vh;
  background: linear-gradient(180deg, #eef9ff 0%, #e9f3fb 44%, #f0f2f5 100%);
  padding: 20rpx;
  box-sizing: border-box;
}

.board-content {
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  overflow: visible;
}

.head-card,
.calendar-card,
.state-box {
  border-radius: 22rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 20rpx rgba(74, 112, 146, 0.1);
  overflow: visible;
}

.head-card {
  padding: 22rpx 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.head-main {
  flex: 1;
  min-width: 0;
}

.head-title {
  display: block;
  font-size: 30rpx;
  color: #384353;
  font-weight: 700;
}

.head-sub {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #6f7f92;
}

.save-btn {
  margin: 0;
  width: 172rpx;
  height: 70rpx;
  line-height: 70rpx;
  border-radius: 999rpx;
  border: none;
  background: linear-gradient(135deg, #8da5ba 0%, #7a8fa3 100%);
  color: #fff;
  font-size: 24rpx;
  font-weight: 600;
}

.save-btn::after {
  border: none;
}

.save-btn.disabled {
  background: #cfd9e3;
  color: #eef2f6;
}

.calendar-card {
  padding: 18rpx;
}

.foot-tip {
  margin-top: 16rpx;
  text-align: center;
  font-size: 22rpx;
  color: #6f7f92;
}

.state-box {
  margin-top: 48rpx;
  padding: 30rpx 24rpx;
  text-align: center;
}

.state-box.state-error {
  background: #fdf8f8;
}

.state-title {
  display: block;
  font-size: 30rpx;
  color: #384353;
  font-weight: 700;
}

.state-desc {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #6f7f92;
}

.retry-btn {
  margin: 20rpx auto 0;
  width: 160rpx;
  height: 62rpx;
  line-height: 62rpx;
  border-radius: 999rpx;
  background: #ecf3f9;
  color: #5f6e83;
  font-size: 24rpx;
}
</style>
