<template>
  <view class="schedule-board-page">
    <loading-toast :show="loading" text="排期加载中..." />

    <view v-if="!loading && errorMsg" class="state-box state-error">
      <text class="state-title">加载失败</text>
      <text class="state-desc">{{ errorMsg }}</text>
      <view class="retry-btn" @tap="fetchBoard">重试</view>
    </view>

    <view v-else-if="!loading" class="board-content">
      <view class="hero-card">
        <view class="hero-top">
          <view class="hero-main">
            <text class="hero-title font-alimamashuhei">日历排期</text>
            <text class="hero-sub">{{ heroSubtitle }}</text>
            <view class="hero-meta-row">
              <text class="hero-meta-chip">Plan #{{ planId }}</text>
              <text class="hero-meta-chip">今日 {{ todayLabel }}</text>
              <text class="hero-meta-chip">{{ orderTypeText }}</text>
            </view>
            <view class="hero-period-row">
              <text class="hero-period-label font-title">排期范围</text>
              <view class="hero-period-trigger" @tap="openPeriodPopup">
                <text class="hero-period-trigger-text">{{ selectedPeriodLabel }}</text>
                <uni-icons type="bottom" size="14" color="#4b5a71" />
              </view>
            </view>
          </view>
          <view class="hero-actions">
            <button
              class="ghost-btn"
              :class="{ disabled: autoArranging || !visibleOrders.length }"
              :disabled="autoArranging || !visibleOrders.length"
              @tap="autoArrangeBoard"
            >
              {{ autoArranging ? '排单中...' : autoArrangeButtonText }}
            </button>
            <button
              class="save-btn"
              :class="{ disabled: saving }"
              :disabled="saving"
              @tap="saveBoard"
            >
              {{ saving ? '保存中...' : '保存排期' }}
            </button>
          </view>
        </view>
        <view class="hero-summary-row">
          <view class="hero-summary-item">
            <text class="metric-label">子单总数</text>
            <text class="metric-value font-title">{{ visibleOrders.length }}</text>
          </view>
          <view class="hero-summary-item">
            <text class="metric-label">已排期</text>
            <text class="metric-value">{{ scheduledCount }}</text>
          </view>
          <view class="hero-summary-item">
            <text class="metric-label">加急单</text>
            <text class="metric-value">{{ urgentCount }}</text>
          </view>
        </view>
      </view>

      <view class="quick-card">
        <view class="quick-head">
          <text class="quick-title font-alimamashuhei">当前订单快捷操作</text>
          <text v-if="selectedOrder" class="quick-order-name">
            {{ selectedOrder.work_subject || `子单#${selectedOrder.submission_item_id}` }}
          </text>
        </view>
        <view v-if="selectedOrder" class="quick-body">
          <view class="quick-summary-row">
            <text class="summary-chip">顺序 {{ effectiveSequenceNo(selectedOrder) }}</text>
            <text class="summary-chip">状态 {{ selectedOrder.material_status_text || '待确认' }}</text>
            <text class="summary-chip">{{ selectedOrderRangeText }}</text>
          </view>
          <view class="quick-urgent-row">
            <text class="quick-label">加急订单</text>
            <switch :checked="!!selectedOrder.is_urgent" color="#78daf5" @change="onUrgentSwitchChange" />
          </view>
          <view class="quick-actions">
            <view class="quick-btn" @tap="moveSelectedSequence(-1)">前移一位</view>
            <view class="quick-btn" @tap="moveSelectedSequence(1)">后移一位</view>
            <view class="quick-btn" @tap="clearSelectedSchedule">清空排期</view>
          </view>
          <text class="quick-tip">{{ quickActionTip }}</text>
        </view>
        <view v-else class="quick-empty">
          <text>请先在下方列表点选一个订单，再进行排期调整。</text>
        </view>
      </view>

      <view class="calendar-card">
        <view class="calendar-head">
          <view class="calendar-head-main">
            <text class="calendar-title font-alimamashuhei">排期面板</text>
            <text class="calendar-sub">先选订单，再拖拽到日期格；支持前移、后移和清空排期</text>
            <text class="calendar-sub-note">建议先用自动排单生成初稿，再对重点订单做微调。</text>
          </view>
          <view class="rule-chip">单日上限 {{ maxPerDay }} 单</view>
        </view>

        <order-schedule-calendar
          :orders="visibleOrders"
          :selected-order-id="selectedOrderId"
          :default-duration-days="defaultDurationDays"
          :max-per-day="maxPerDay"
          :today="today"
          @update:selectedOrderId="onUpdateSelectedOrder"
          @change="onCalendarChange"
          @invalid="onCalendarInvalid"
        />
      </view>

      <uni-popup
        ref="periodPopupRef"
        type="bottom"
        :mask-click="true"
      >
        <view class="period-popup-sheet">
          <view class="period-popup-head">
            <text class="period-popup-title font-alimamashuhei">选择排期范围</text>
            <text class="period-popup-close font-title" @tap="closePeriodPopup">关闭</text>
          </view>
          <view class="period-popup-list">
            <view
              v-for="option in periodOptions"
              :key="option.value"
              class="period-popup-item"
              :class="{ active: selectedPeriodValue === option.value }"
              @tap="selectPeriodOption(option.value)"
            >
              <view class="period-popup-item-main">
                <text class="period-popup-item-title font-alimamashuhei">{{ option.label }}</text>
                <text v-if="option.desc" class="period-popup-item-desc font-title">{{ option.desc }}</text>
              </view>
              <uni-icons
                v-if="selectedPeriodValue === option.value"
                type="checkmarkempty"
                size="18"
                color="#31a7c8"
              />
            </view>
          </view>
        </view>
      </uni-popup>

      <view class="foot-tip">
        <uni-icons type="info" size="16" color="#8a96a8" />
        <text>规则：单日最多同时{{ maxPerDay }}单（允许最多重叠{{ maxPerDay - 1 }}个订单）。</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { websiteUrl } from '@/common/config.js'
import OrderScheduleCalendar from '@/components/order-schedule-calendar/order-schedule-calendar.vue'

const planId = ref(0)
const loading = ref(false)
const saving = ref(false)
const autoArranging = ref(false)
const errorMsg = ref('')
const allOrders = ref([])
const selectedOrderId = ref(0)
const defaultDurationDays = ref(7)
const today = ref('')
const orderType = ref(0)
const maxPerDay = 3
const periodPopupRef = ref(null)
const selectedPeriodValue = ref('all')

const orderTypeTextMap = {
  1: '长期接单',
  2: '限时手速投递-手速排单',
  5: '限时手速投递-自由排单',
}

const todayLabel = computed(() => {
  const normalized = normalizeDateText(today.value || '')
  return normalized || formatDate(new Date())
})

const periodOptions = computed(() => {
  const map = new Map()
  allOrders.value.forEach((row) => {
    const sid = Number(row?.submission_id || 0)
    if (sid <= 0) return
    if (!map.has(sid)) {
      map.set(sid, { submissionId: sid, count: 0 })
    }
    map.get(sid).count += 1
  })
  const sorted = Array.from(map.values()).sort((a, b) => a.submissionId - b.submissionId)
  const issueOptions = sorted.map((item, idx) => ({
    value: `submission:${item.submissionId}`,
    label: `第${idx + 1}期开单`,
    desc: `${item.count} 个投递内容`,
    submissionId: item.submissionId,
  }))
  return [
    {
      value: 'all',
      label: '全部开单',
      desc: `${allOrders.value.length} 个投递内容`,
      submissionId: 0,
    },
    ...issueOptions,
  ]
})

const selectedPeriodLabel = computed(() => {
  const target = periodOptions.value.find((item) => item.value === selectedPeriodValue.value)
  return target?.label || '全部开单'
})

const selectedSubmissionIdFilter = computed(() => {
  const current = periodOptions.value.find((item) => item.value === selectedPeriodValue.value)
  if (!current || !current.submissionId) return 0
  return Number(current.submissionId || 0)
})

const visibleOrders = computed(() => {
  const sid = selectedSubmissionIdFilter.value
  if (!sid) return allOrders.value
  return allOrders.value.filter((row) => Number(row?.submission_id || 0) === sid)
})

const scheduledCount = computed(() =>
  visibleOrders.value.filter((row) => row.start_date && row.end_date).length
)

const urgentCount = computed(() =>
  visibleOrders.value.filter((row) => !!row.is_urgent).length
)

const orderTypeText = computed(() => orderTypeTextMap[Number(orderType.value || 0)] || '排单计划')

const heroSubtitle = computed(() => {
  if (Number(orderType.value || 0) === 2) {
    return '手速模式优先按顺序出结果，可对重点订单做加急和调序'
  }
  if (Number(orderType.value || 0) === 5) {
    return '自由模式可手动拖拽排期，也支持一键按顺序自动铺排'
  }
  return '长期接单支持滚动排期，建议先自动生成再按实际微调'
})

const autoArrangeButtonText = computed(() => {
  if (Number(orderType.value || 0) === 2) return '按手速自动排单'
  if (Number(orderType.value || 0) === 5) return '一键顺序排单'
  return '自动排到日历'
})

const quickActionTip = computed(() => {
  const type = Number(orderType.value || 0)
  if (type === 2) {
    return '手速模式建议优先使用“前移一位”处理加急，避免频繁改动整体顺序。'
  }
  if (type === 5) {
    return '自由模式可先一键排单，再根据寄送/沟通情况做少量微调。'
  }
  return '长期接单建议每次只调整少量订单，保存后再继续修改。'
})

const selectedOrder = computed(() =>
  visibleOrders.value.find((row) => Number(row.submission_item_id || 0) === Number(selectedOrderId.value || 0)) || null
)

const selectedOrderRangeText = computed(() => {
  const row = selectedOrder.value
  if (!row) return '未排期'
  if (!row.start_date || !row.end_date) {
    return `未排期 · ${Number(row.duration_days || defaultDurationDays.value || 1)}天`
  }
  return `${row.start_date} 至 ${row.end_date}`
})

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

function normalizeScheduleSource(raw) {
  return String(raw || '').trim() === 'auto' ? 'auto' : 'manual'
}

function normalizeUrgentMode(raw) {
  const value = String(raw || '').trim()
  if (['normal', 'advance', 'compress', 'advance_compress'].includes(value)) return value
  return 'normal'
}

function resolvePriorityScore(row) {
  const base = Number(row?.priority_level || 0)
  if (!row?.is_urgent) return base
  const mode = normalizeUrgentMode(row?.urgent_mode)
  if (mode === 'advance' || mode === 'advance_compress') return base + 1000
  if (mode === 'compress') return base + 500
  return base + 200
}

function effectiveSequenceNo(row) {
  const value = Number(row?.sequence_no || 0)
  if (value > 0) return value
  const queueNo = Number(row?.queue_no || 0)
  if (queueNo > 0) return queueNo
  return Number(row?.submission_item_id || 0)
}

function sortOrdersForBoard(list) {
  return [...(list || [])].sort((left, right) => {
    const leftStart = String(left?.start_date || '').trim()
    const rightStart = String(right?.start_date || '').trim()
    if (leftStart && rightStart && leftStart !== rightStart) return leftStart.localeCompare(rightStart)
    if (leftStart && !rightStart) return -1
    if (!leftStart && rightStart) return 1
    const leftPriority = resolvePriorityScore(left)
    const rightPriority = resolvePriorityScore(right)
    if (leftPriority !== rightPriority) return rightPriority - leftPriority
    const leftSeq = effectiveSequenceNo(left)
    const rightSeq = effectiveSequenceNo(right)
    if (leftSeq !== rightSeq) return leftSeq - rightSeq
    return Number(left?.submission_item_id || 0) - Number(right?.submission_item_id || 0)
  })
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
  return sortOrdersForBoard(items.map((row) => ({
    submission_id: Number(row?.submission_id || 0),
    submission_item_id: Number(row?.submission_item_id || 0),
    submission_status: Number(row?.submission_status || 0),
    submission_status_text: String(row?.submission_status_text || ''),
    user_id: Number(row?.user_id || 0),
    queue_no: Number(row?.queue_no || 0),
    sequence_no: Number(row?.sequence_no || 0),
    priority_level: Number(row?.priority_level || 0),
    is_urgent: !!row?.is_urgent,
    urgent_mode: normalizeUrgentMode(row?.urgent_mode),
    urgent_reduce_days: Number(row?.urgent_reduce_days || 0),
    is_locked: !!row?.is_locked,
    lock_reason: String(row?.lock_reason || '').trim(),
    earliest_start_date: normalizeDateText(row?.earliest_start_date || ''),
    latest_end_date: normalizeDateText(row?.latest_end_date || ''),
    material_ready_date: normalizeDateText(row?.material_ready_date || ''),
    schedule_note: String(row?.schedule_note || '').trim(),
    schedule_source: normalizeScheduleSource(row?.schedule_source),
    material_status_text: String(row?.material_status_text || '').trim(),
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
  })))
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
    orderType.value = Number(data?.order_type || 0)
    defaultDurationDays.value = Number(data?.default_duration_days || 7) || 7
    today.value = String(data?.today || '').trim()
    allOrders.value = normalizeOrders(data?.items || [])
    const hasSelected = allOrders.value.some((row) => Number(row?.submission_item_id || 0) === Number(selectedOrderId.value || 0))
    if ((!selectedOrderId.value || !hasSelected) && allOrders.value.length) {
      selectedOrderId.value = Number(allOrders.value[0]?.submission_item_id || 0)
    }
  } catch (e) {
    errorMsg.value = e?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

function onCalendarChange(nextOrders) {
  const previousMap = {}
  allOrders.value.forEach((row) => {
    previousMap[Number(row.submission_item_id || 0)] = row
  })
  const normalizedPatch = normalizeOrders(nextOrders || []).map((row) => {
    const previous = previousMap[Number(row.submission_item_id || 0)]
    if (!previous) return row
    const changed = previous.start_date !== row.start_date || previous.end_date !== row.end_date
    if (!changed) return row
    return {
      ...row,
      schedule_source: 'manual',
    }
  })
  const patchMap = {}
  normalizedPatch.forEach((row) => {
    patchMap[Number(row.submission_item_id || 0)] = row
  })
  allOrders.value = sortOrdersForBoard(allOrders.value.map((row) => {
    const itemId = Number(row.submission_item_id || 0)
    if (!patchMap[itemId]) return row
    return patchMap[itemId]
  }))
}

function onUpdateSelectedOrder(id) {
  selectedOrderId.value = Number(id || 0)
}

function onCalendarInvalid(message) {
  if (!message) return
  uni.showToast({ title: String(message), icon: 'none' })
}

function updateSelectedOrderField(field, value) {
  const itemId = Number(selectedOrderId.value || 0)
  if (!itemId) return
  allOrders.value = sortOrdersForBoard(allOrders.value.map((row) => {
    if (Number(row.submission_item_id || 0) !== itemId) return row
    return {
      ...row,
      [field]: value,
    }
  }))
}

function onUrgentSwitchChange(event) {
  const checked = !!event?.detail?.value
  updateSelectedOrderField('is_urgent', checked)
  if (!checked) {
    updateSelectedOrderField('urgent_mode', 'normal')
    updateSelectedOrderField('urgent_reduce_days', 0)
    return
  }
  const type = Number(orderType.value || 0)
  if (type === 2) {
    updateSelectedOrderField('urgent_mode', 'advance')
    updateSelectedOrderField('urgent_reduce_days', 0)
    return
  }
  updateSelectedOrderField('urgent_mode', 'advance_compress')
  const prevReduce = Number(selectedOrder.value?.urgent_reduce_days || 0)
  updateSelectedOrderField('urgent_reduce_days', prevReduce > 0 ? prevReduce : 1)
}

function moveSelectedSequence(offset) {
  const current = selectedOrder.value
  if (!current) return
  const currentId = Number(current.submission_item_id || 0)
  const sorted = sortOrdersForBoard(visibleOrders.value)
  const index = sorted.findIndex((row) => Number(row.submission_item_id || 0) === currentId)
  const targetIndex = index + Number(offset || 0)
  if (index < 0 || targetIndex < 0 || targetIndex >= sorted.length) {
    uni.showToast({ title: '已经到头了', icon: 'none' })
    return
  }
  const target = sorted[targetIndex]
  const currentSeq = effectiveSequenceNo(current)
  const targetSeq = effectiveSequenceNo(target)
  allOrders.value = sortOrdersForBoard(allOrders.value.map((row) => {
    const rowId = Number(row.submission_item_id || 0)
    if (rowId === currentId) {
      return { ...row, sequence_no: targetSeq, schedule_source: 'manual' }
    }
    if (rowId === Number(target.submission_item_id || 0)) {
      return { ...row, sequence_no: currentSeq, schedule_source: 'manual' }
    }
    return row
  }))
}

function clearSelectedSchedule() {
  const row = selectedOrder.value
  if (!row) return
  const itemId = Number(row.submission_item_id || 0)
  allOrders.value = sortOrdersForBoard(allOrders.value.map((item) => {
    if (Number(item.submission_item_id || 0) !== itemId) return item
    return {
      ...item,
      start_date: '',
      end_date: '',
      schedule_source: 'manual',
    }
  }))
}

async function autoArrangeBoard() {
  if (autoArranging.value) return
  const token = ensureLoginToken()
  if (!token) return
  autoArranging.value = true
  uni.showLoading({ title: '自动排单中' })
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/schedule/board/auto-arrange`,
      method: 'POST',
      header: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      data: {
        plan_id: planId.value,
        anchor_date: today.value || todayLabel.value,
      },
    })
    const body = res?.data || {}
    if (String(body.status).toLowerCase() !== 'success') {
      throw new Error(body.msg || '自动排单失败')
    }
    const data = body?.data || {}
    orderType.value = Number(data?.order_type || orderType.value || 0)
    defaultDurationDays.value = Number(data?.default_duration_days || defaultDurationDays.value || 7) || 7
    today.value = String(data?.today || today.value || '').trim()
    allOrders.value = normalizeOrders(data?.items || [])
    if (!allOrders.value.some((row) => Number(row?.submission_item_id || 0) === Number(selectedOrderId.value || 0)) && allOrders.value.length) {
      selectedOrderId.value = Number(allOrders.value[0]?.submission_item_id || 0)
    }
    uni.showToast({ title: '已生成一版排期', icon: 'success' })
  } catch (e) {
    uni.showToast({ title: e?.message || '自动排单失败', icon: 'none' })
  } finally {
    autoArranging.value = false
    uni.hideLoading()
  }
}

async function saveBoard(silent = false) {
  if (saving.value) return
  const token = ensureLoginToken()
  if (!token) return
  if (planId.value <= 0) {
    uni.showToast({ title: '缺少 plan_id', icon: 'none' })
    return
  }
  saving.value = true
  if (!silent) uni.showLoading({ title: '保存中' })
  try {
    const items = allOrders.value
      .map((row) => ({
        submission_item_id: Number(row.submission_item_id || 0),
        start_date: String(row.start_date || '').trim(),
        end_date: String(row.end_date || '').trim(),
        duration_days: Number(row.duration_days || 0),
        sequence_no: Number(row.sequence_no || 0),
        priority_level: Number(row.priority_level || 0),
        is_urgent: !!row.is_urgent,
        urgent_mode: normalizeUrgentMode(row.urgent_mode),
        urgent_reduce_days: Number(row.urgent_reduce_days || 0),
        is_locked: !!row.is_locked,
        lock_reason: String(row.lock_reason || '').trim(),
        earliest_start_date: String(row.earliest_start_date || '').trim(),
        latest_end_date: String(row.latest_end_date || '').trim(),
        material_ready_date: String(row.material_ready_date || '').trim(),
        schedule_note: String(row.schedule_note || '').trim(),
        schedule_source: normalizeScheduleSource(row.schedule_source),
      }))
      .filter((row) => row.submission_item_id > 0)

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
    if (!silent) {
      uni.showToast({ title: '保存成功', icon: 'success' })
      await fetchBoard()
    }
  } catch (e) {
    if (!silent) {
      uni.showToast({ title: e?.message || '保存失败', icon: 'none' })
    }
    throw e
  } finally {
    saving.value = false
    if (!silent) uni.hideLoading()
  }
}

function openPeriodPopup() {
  periodPopupRef.value?.open?.()
}

function closePeriodPopup() {
  periodPopupRef.value?.close?.()
}

function selectPeriodOption(value) {
  selectedPeriodValue.value = String(value || 'all')
  closePeriodPopup()
}

watch(
  () => periodOptions.value.map((item) => item.value).join(','),
  (keys) => {
    if (!keys) {
      selectedPeriodValue.value = 'all'
      return
    }
    const exists = periodOptions.value.some((item) => item.value === selectedPeriodValue.value)
    if (!exists) {
      selectedPeriodValue.value = 'all'
    }
  },
  { immediate: true }
)

watch(
  visibleOrders,
  (list) => {
    const current = Number(selectedOrderId.value || 0)
    const exists = list.some((row) => Number(row?.submission_item_id || 0) === current)
    if (exists) return
    selectedOrderId.value = Number(list[0]?.submission_item_id || 0)
  },
  { immediate: true }
)

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
  --primary-soft: rgba(120, 218, 245, 0.18);
  min-height: 100vh;
  background: #f6f8fb;
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
  box-shadow: 0 10rpx 24rpx rgba(15, 23, 42, 0.05);
  padding: 24rpx;
}

.hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 10rpx;
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
  background: #f3f6fa;
}

.hero-period-row {
  margin-top: 14rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.hero-period-label {
  font-size: 22rpx;
  color: #7a8798;
}

.hero-period-trigger {
  min-height: 52rpx;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  background: #f2f8fc;
  box-shadow: inset 0 0 0 2rpx rgba(120, 218, 245, 0.22);
}

.hero-period-trigger-text {
  font-size: 22rpx;
  color: #2c4f63;
}

.hero-summary-row {
  margin-top: 16rpx;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12rpx;
}

.hero-summary-item {
  border-radius: 16rpx;
  padding: 14rpx 12rpx;
  background: var(--surface-subtle);
}

.save-btn {
  margin: 0;
  width: 188rpx;
  height: 70rpx;
  line-height: 70rpx;
  border-radius: 999rpx;
  border: none;
  background: #78daf5;
  color: #ffffff;
  font-size: 24rpx;
  font-weight: 600;
  box-shadow: 0 8rpx 18rpx rgba(120, 218, 245, 0.36);
}

.save-btn::after {
  border: none;
}

.ghost-btn {
  margin: 0;
  min-width: 210rpx;
  height: 70rpx;
  line-height: 70rpx;
  border-radius: 999rpx;
  border: none;
  background: #ffffff;
  color: #2f6c86;
  font-size: 24rpx;
  font-weight: 600;
  box-shadow: inset 0 0 0 2rpx rgba(120, 218, 245, 0.28);
}

.ghost-btn::after {
  border: none;
}

.save-btn.disabled {
  background: linear-gradient(180deg, #b8e9f7 0%, #a4e2f4 100%);
  color: rgba(255, 255, 255, 0.84);
  box-shadow: none;
}

.ghost-btn.disabled {
  background: #f1f4f7;
  color: #9eabbc;
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

.quick-card {
  border-radius: 22rpx;
  background: #ffffff;
  box-shadow: 0 10rpx 24rpx rgba(15, 23, 42, 0.05);
  padding: 22rpx;
}

.quick-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.quick-title {
  display: block;
  font-size: 32rpx;
  color: #1f2937;
}

.quick-order-name {
  border-radius: 999rpx;
  padding: 8rpx 16rpx;
  background: rgba(120, 218, 245, 0.2);
  color: #2a6f89;
  font-size: 21rpx;
}

.quick-body {
  margin-top: 18rpx;
}

.quick-summary-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.summary-chip {
  border-radius: 999rpx;
  padding: 6rpx 14rpx;
  background: #f3f6fa;
  color: #516173;
  font-size: 21rpx;
}

.quick-urgent-row {
  margin-top: 16rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.quick-label {
  font-size: 24rpx;
  color: #3f4d62;
}

.quick-actions {
  margin-top: 16rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.quick-btn {
  min-width: 150rpx;
  height: 58rpx;
  line-height: 58rpx;
  text-align: center;
  border-radius: 999rpx;
  background: #ffffff;
  color: #2f5f77;
  font-size: 22rpx;
  box-shadow: inset 0 0 0 2rpx rgba(120, 218, 245, 0.24);
}

.quick-empty {
  margin-top: 18rpx;
  border-radius: 16rpx;
  background: #f7f9fc;
  padding: 18rpx;
}

.quick-empty text {
  font-size: 23rpx;
  color: #7b8494;
}

.quick-tip {
  margin-top: 12rpx;
  display: block;
  font-size: 22rpx;
  color: #7b8494;
  line-height: 1.5;
}

.calendar-card {
  border-radius: 22rpx;
  background: var(--surface);
  box-shadow: 0 10rpx 24rpx rgba(15, 23, 42, 0.05);
  padding: 20rpx;
  overflow: hidden;
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

.calendar-sub-note {
  display: block;
  margin-top: 4rpx;
  font-size: 20rpx;
  color: #93a0b2;
}

.rule-chip {
  padding: 10rpx 16rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  color: #2b6580;
  background: rgba(120, 218, 245, 0.2);
  font-weight: 600;
}

.period-popup-sheet {
  width: 100vw;
  border-radius: 24rpx 24rpx 0 0;
  background: #ffffff;
  padding: 18rpx 20rpx calc(24rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -12rpx 24rpx rgba(15, 23, 42, 0.08);
}

.period-popup-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
  padding: 4rpx 8rpx 14rpx;
}

.period-popup-title {
  font-size: 31rpx;
  color: #1f2b3a;
}

.period-popup-close {
  font-size: 24rpx;
  color: #8b98aa;
}

.period-popup-list {
  max-height: 58vh;
  overflow-y: auto;
}

.period-popup-item {
  min-height: 92rpx;
  border-radius: 16rpx;
  padding: 14rpx 16rpx;
  background: #f8fafd;
  box-shadow: inset 0 0 0 2rpx rgba(120, 218, 245, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.period-popup-item + .period-popup-item {
  margin-top: 10rpx;
}

.period-popup-item.active {
  background: #edf8fc;
  box-shadow: inset 0 0 0 2rpx rgba(120, 218, 245, 0.32);
}

.period-popup-item-main {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  min-width: 0;
}

.period-popup-item-title {
  font-size: 27rpx;
  color: #1f2d3d;
}

.period-popup-item-desc {
  font-size: 20rpx;
  color: #8b97a9;
}

.foot-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  border-radius: 14rpx;
  background: #ffffff;
  padding: 14rpx 16rpx;
  box-shadow: 0 6rpx 16rpx rgba(15, 23, 42, 0.04);

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
  background: #78daf5;
  color: #ffffff;
  font-size: 24rpx;
  font-weight: 600;
  box-shadow: 0 8rpx 18rpx rgba(120, 218, 245, 0.32);
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
}

:deep(.schedule-calendar .month-title) {
  color: #243041;
}

:deep(.schedule-calendar .weekday-text) {
  color: #8591a4;
}

:deep(.schedule-calendar .schedule-day-cell) {
  background: #fafbfc;
  box-shadow: inset 0 0 0 1rpx #e6eaf0;
}

:deep(.schedule-calendar .schedule-day-cell.today) {
  background: #f1f9fc;
  box-shadow: inset 0 0 0 1rpx rgba(120, 218, 245, 0.5);
}

:deep(.schedule-calendar .schedule-day-cell.hover) {
  box-shadow: inset 0 0 0 2rpx rgba(120, 218, 245, 0.42);
}

:deep(.schedule-calendar .selected-panel) {
  background: #ffffff;
}

:deep(.schedule-calendar .order-item.selected) {
  box-shadow: inset 0 0 0 2rpx rgba(139, 151, 168, 0.34);
}

:deep(.schedule-calendar .selected-action-chip.drag-chip) {
  background: #78daf5;
  color: #ffffff;
}

:deep(.schedule-calendar .selected-action-chip.resize-chip) {
  background: #eef3f9;
  color: #1f2937;
}

:deep(.schedule-calendar .selected-action-chip.clear-chip) {
  background: #f4f7fb;
  color: #1f2937;
}

:deep(.schedule-calendar .order-item-drag) {
  background: rgba(120, 218, 245, 0.2);
  color: #1f5b73;
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

  .hero-actions {
    width: 100%;
    flex-direction: column;
  }

  .save-btn {
    width: 100%;
  }

  .ghost-btn {
    width: 100%;
  }

  .hero-title {
    font-size: 36rpx;
  }

  .hero-summary-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .calendar-head {
    flex-direction: column;
    gap: 8rpx;
  }

  .quick-head {
    flex-direction: column;
  }

  .quick-actions {
    gap: 8rpx;
  }

  .quick-btn {
    min-width: 0;
    flex: 1;
  }

  .rule-chip {
    align-self: flex-start;
  }
}
</style>
