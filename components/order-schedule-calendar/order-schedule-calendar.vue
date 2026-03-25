<template>
  <view
    class="schedule-calendar"
    :style="calendarRootStyle"
    @touchmove.stop="onRootTouchMove"
    @touchend.stop="onRootTouchEnd"
    @touchcancel.stop="onRootTouchCancel"
  >
    <view class="month-header">
      <view class="month-btn" @tap="shiftMonth(-1)">
        <uni-icons type="left" size="16" color="#5f6b7c" />
      </view>
      <text class="month-title font-title">{{ monthLabel }}</text>
      <view class="month-btn" @tap="shiftMonth(1)">
        <uni-icons type="right" size="16" color="#5f6b7c" />
      </view>
    </view>

    <scroll-view
      class="calendar-scroll"
      scroll-y
      scroll-with-animation
      :scroll-into-view="calendarIntoView"
      :upper-threshold="120"
      :lower-threshold="180"
      @touchmove.stop="onRootTouchMove"
      @touchend.stop="onRootTouchEnd"
      @touchcancel.stop="onRootTouchCancel"
      @scroll="handleCalendarScroll"
      @scrolltoupper="handleCalendarScrollToUpper"
      @scrolltolower="handleCalendarScrollToLower"
    >
      <view class="calendar-month-stack">
        <view
          v-for="month in visibleMonthBlocks"
          :key="month.monthKey"
          :id="monthAnchorId(month.monthKey)"
          class="month-block"
        >
          <view class="month-block-title-row">
            <text class="month-block-title font-title">{{ formatMonthLabel(month.monthKey) }}</text>
          </view>

          <view class="weekday-row">
            <text v-for="name in weekNames" :key="`${month.monthKey}-${name}`" class="weekday-text">{{ name }}</text>
          </view>

          <view class="month-grid">
            <view class="month-grid-base">
              <view
                v-for="(day, idx) in month.days"
                :key="`base-${month.monthKey}-${day.date}-${idx}`"
                class="schedule-day-cell"
                :style="getDayCellStyle(month, idx)"
                :class="{
                  today: day.date === todayText,
                  past: day.date < todayText,
                  hover: dragState.active && dragState.mode === 'place' && dragState.hoverDate === day.date,
                  flash: isDayFlashing(day.date)
                }"
                @tap="handleDayTap(day)"
              >
                <text class="day-num">{{ day.day }}</text>
              </view>
            </view>

            <view class="month-grid-overlay">
              <view
                v-for="segment in resizePreviewSegmentsMap[month.monthKey] || []"
                :key="segment.key"
                class="floating-segment preview"
                :class="[
                  segment.tone,
                  {
                    single: segment.single,
                    'has-start': segment.showStartAvatar,
                    'has-end': segment.showEndAvatar,
                    invalid: segment.invalid,
                  }
                ]"
                :style="getFloatingSegmentStyle(segment)"
              >
                <view class="floating-segment-line"></view>
                <view
                  v-if="segment.showStartAvatar"
                  class="floating-avatar-wrap start"
                >
                  <image
                    v-if="getOrderCover(segment.order)"
                    class="floating-avatar"
                    :src="getOrderCover(segment.order)"
                    mode="aspectFill"
                  />
                  <view v-else class="floating-avatar placeholder"></view>
                </view>
                <view
                  v-if="segment.showEndAvatar"
                  class="floating-avatar-wrap end"
                >
                  <image
                    v-if="getOrderCover(segment.order)"
                    class="floating-avatar"
                    :src="getOrderCover(segment.order)"
                    mode="aspectFill"
                  />
                  <view v-else class="floating-avatar placeholder"></view>
                </view>
              </view>
              <view
                v-for="segment in floatingSegmentsMap[month.monthKey] || []"
                :key="segment.key"
                class="floating-segment"
                :class="[
                  segment.tone,
                  {
                    selected: segment.selected,
                    single: segment.single,
                    'has-start': segment.showStartAvatar,
                    'has-end': segment.showEndAvatar,
                    'previewing-origin': isResizePreviewingOrder(segment.orderId),
                  }
                ]"
                :style="getFloatingSegmentStyle(segment)"
                @tap.stop="selectOrder(segment.orderId)"
              >
                <view
                  class="floating-segment-line"
                  @tap.stop="selectOrder(segment.orderId)"
                ></view>
                <view
                  v-if="segment.showStartAvatar"
                  class="floating-avatar-wrap start"
                  @tap.stop="selectOrder(segment.orderId)"
                  @touchstart.stop.prevent="startResizeDrag(segment.order, 'start', $event)"
                  @touchmove.stop="onRootTouchMove"
                  @touchend.stop="onRootTouchEnd"
                  @touchcancel.stop="onRootTouchCancel"
                >
                  <image
                    v-if="getOrderCover(segment.order)"
                    class="floating-avatar"
                    :src="getOrderCover(segment.order)"
                    mode="aspectFill"
                  />
                  <view v-else class="floating-avatar placeholder"></view>
                </view>
                <view
                  v-if="segment.showEndAvatar"
                  class="floating-avatar-wrap end"
                  @tap.stop="selectOrder(segment.orderId)"
                  @touchstart.stop.prevent="startResizeDrag(segment.order, 'end', $event)"
                  @touchmove.stop="onRootTouchMove"
                  @touchend.stop="onRootTouchEnd"
                  @touchcancel.stop="onRootTouchCancel"
                >
                  <image
                    v-if="getOrderCover(segment.order)"
                    class="floating-avatar"
                    :src="getOrderCover(segment.order)"
                    mode="aspectFill"
                  />
                  <view v-else class="floating-avatar placeholder"></view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <view
      v-if="dragState.active"
      class="drag-float"
      :style="{
        transform: `translate(${dragState.touchX + 8}px, ${dragState.touchY + 8}px)`
      }"
    >
      {{ dragHintText }}
    </view>
  </view>
</template>

<script setup>
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

const props = defineProps({
  orders: {
    type: Array,
    default: () => [],
  },
  selectedOrderId: {
    type: [Number, String],
    default: 0,
  },
  defaultDurationDays: {
    type: Number,
    default: 7,
  },
  maxPerDay: {
    type: Number,
    default: 2,
  },
  today: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['change', 'update:selectedOrderId', 'invalid', 'calendar-scroll'])

const weekNames = ['一', '二', '三', '四', '五', '六', '日']
const submissionStatusTextMap = {
  0: '排队中',
  1: '已抢到待买家确认',
  2: '买家已确认，待卖家确认',
  3: '已确认待付款',
  4: '已付款',
  8: '已寄回',
  9: '已完结',
  5: '排队失败',
  6: '已撤销',
  7: '支付超时',
}
const localOrders = ref([])
const currentMonth = ref('')
const monthKeys = ref([])
const calendarIntoView = ref('')
const loadingMoreTop = ref(false)
const loadingMoreBottom = ref(false)
const dayCellRects = ref([])
const dayCellHeightPx = ref(0)
const dayCellGapXPx = ref(0)
const dayCellGapYPx = ref(0)
const flashingDates = ref([])
const orderStripIntoView = ref('')
const quickPlaceOrderId = ref(0)
const instance = getCurrentInstance()
const monthWindowRadius = 2
const monthLoadBatchSize = 2
let flashResetTimer = 0
let updatingFromSelf = false
let dragGlobalBound = false
let dragGlobalMoveHandler = null
let dragGlobalEndHandler = null

const dragState = reactive({
  active: false,
  mode: '',
  orderId: 0,
  hoverDate: '',
  resizeAnchor: '',
  touchX: 0,
  touchY: 0,
})

function getNowDateText() {
  return formatDate(new Date())
}

function normalizeMonth(raw) {
  const text = String(raw || '').trim()
  const m = text.match(/^(\d{4})-(\d{1,2})$/)
  if (!m) {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }
  const year = Number(m[1])
  const month = Number(m[2])
  if (!year || month < 1 || month > 12) {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }
  return `${year}-${String(month).padStart(2, '0')}`
}

function shiftMonthKey(monthKey, offset) {
  const normalized = normalizeMonth(monthKey)
  const [yText, mText] = normalized.split('-')
  const date = new Date(Number(yText), Number(mText) - 1, 1)
  date.setMonth(date.getMonth() + Number(offset || 0))
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function formatMonthLabel(monthKey) {
  const normalized = normalizeMonth(monthKey)
  const [yText, mText] = normalized.split('-')
  return `${yText}年${Number(mText)}月`
}

function monthAnchorId(monthKey) {
  return `calendar-month-${String(monthKey || '').replace('-', '')}`
}

function buildMonthDays(monthKey) {
  const [yearText, monthText] = normalizeMonth(monthKey).split('-')
  const year = Number(yearText)
  const month = Number(monthText)
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const offset = (firstDay.getDay() + 6) % 7
  const dayCount = Number(lastDay.getDate() || 0)
  const out = []
  for (let i = 0; i < dayCount; i++) {
    const d = new Date(year, month - 1, i + 1)
    out.push({
      date: formatDate(d),
      day: i + 1,
    })
  }
  return {
    days: out,
    firstWeekday: offset,
    dayCount,
  }
}

function getDayCellStyle(monthBlock, dayIndex) {
  if (Number(dayIndex || 0) !== 0) return {}
  const start = Number(monthBlock?.firstWeekday || 0) + 1
  if (start <= 1) return {}
  return { gridColumnStart: String(start) }
}

function initMonthWindow(centerMonthKey) {
  const center = normalizeMonth(centerMonthKey)
  const months = []
  for (let i = monthWindowRadius; i > 0; i--) {
    months.push(shiftMonthKey(center, -i))
  }
  months.push(center)
  for (let i = 1; i <= monthWindowRadius; i++) {
    months.push(shiftMonthKey(center, i))
  }
  monthKeys.value = months
}

function ensureMonthVisible(monthKey) {
  const target = normalizeMonth(monthKey)
  if (!monthKeys.value.length) {
    initMonthWindow(target)
    return
  }
  const first = monthKeys.value[0]
  const last = monthKeys.value[monthKeys.value.length - 1]
  if (target < first) {
    const prepend = []
    let cursor = first
    while (target < cursor) {
      cursor = shiftMonthKey(cursor, -1)
      prepend.push(cursor)
    }
    monthKeys.value = [...prepend.reverse(), ...monthKeys.value]
    return
  }
  if (target > last) {
    const append = []
    let cursor = last
    while (target > cursor) {
      cursor = shiftMonthKey(cursor, 1)
      append.push(cursor)
    }
    monthKeys.value = [...monthKeys.value, ...append]
  }
}

const todayText = computed(() => {
  const t = normalizeDateText(props.today || '')
  return t || getNowDateText()
})
const selectedOrderId = computed(() => Number(props.selectedOrderId || 0))
const calendarRootStyle = computed(() => {
  if (dayCellHeightPx.value <= 0) return {}
  return {
    '--day-cell-height': `${dayCellHeightPx.value}px`,
  }
})

const monthLabel = computed(() => {
  return formatMonthLabel(currentMonth.value || todayText.value.slice(0, 7))
})

function parseDate(raw) {
  const txt = String(raw || '').trim()
  const m = txt.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return null
  const y = Number(m[1])
  const mm = Number(m[2])
  const d = Number(m[3])
  if (!y || mm < 1 || mm > 12 || d < 1 || d > 31) return null
  const dt = new Date(y, mm - 1, d)
  if (
    dt.getFullYear() !== y ||
    dt.getMonth() !== mm - 1 ||
    dt.getDate() !== d
  ) return null
  return dt
}

function formatDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function normalizeDateText(raw) {
  if (!raw) return ''
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) {
    return formatDate(raw)
  }
  const txt = String(raw).trim()
  if (!txt) return ''
  const head = txt.slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(head) && parseDate(head)) return head

  const parsed = new Date(txt)
  if (!Number.isNaN(parsed.getTime())) {
    return formatDate(parsed)
  }
  const m = txt.match(/(\d{4})[\/.-](\d{1,2})[\/.-](\d{1,2})/)
  if (!m) return ''
  const y = Number(m[1])
  const mm = String(Number(m[2])).padStart(2, '0')
  const dd = String(Number(m[3])).padStart(2, '0')
  const normalized = `${y}-${mm}-${dd}`
  return parseDate(normalized) ? normalized : ''
}

function parseRefImages(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) {
    return raw.map((v) => String(v || '').trim()).filter(Boolean)
  }
  const txt = String(raw).trim()
  if (!txt) return []
  if (txt.startsWith('[') && txt.endsWith(']')) {
    try {
      const arr = JSON.parse(txt)
      if (Array.isArray(arr)) {
        return arr.map((v) => String(v || '').trim()).filter(Boolean)
      }
    } catch (_) {}
  }
  return txt
    .split(',')
    .map((s) => s.trim().replace(/^"+|"+$/g, ''))
    .filter(Boolean)
}

function getOrderCover(order) {
  const direct = String(order?.cover_image || order?.coverImage || '').trim()
  if (direct) return direct
  const fromRef = parseRefImages(order?.ref_images || order?.refImages || '')
  return fromRef[0] || ''
}

function formatHumanDate(dateText, withYear = true) {
  const dt = parseDate(dateText)
  if (!dt) return dateText || '-'
  const y = dt.getFullYear()
  const m = dt.getMonth() + 1
  const d = dt.getDate()
  if (withYear) return `${y}年${m}月${d}日`
  return `${m}月${d}日`
}

function formatHumanRange(startDate, endDate, durationDays = 0) {
  const s = normalizeDateText(startDate)
  const e = normalizeDateText(endDate)
  if (!s || !e) return ''
  const sd = parseDate(s)
  const ed = parseDate(e)
  if (!sd || !ed) {
    return `${s} - ${e}${durationDays > 0 ? `（${durationDays}天）` : ''}`
  }
  const sameYear = sd.getFullYear() === ed.getFullYear()
  const left = formatHumanDate(s, true)
  const right = formatHumanDate(e, !sameYear)
  const days = Number(durationDays || daysBetweenInclusive(s, e) || 0)
  return `${left} - ${right}${days > 0 ? `（${days}天）` : ''}`
}

function addDays(dateText, days) {
  const dt = parseDate(dateText)
  if (!dt) return ''
  dt.setDate(dt.getDate() + Number(days || 0))
  return formatDate(dt)
}

function daysBetweenInclusive(startDate, endDate) {
  const s = parseDate(startDate)
  const e = parseDate(endDate)
  if (!s || !e) return 0
  const diff = Math.floor((e.getTime() - s.getTime()) / 86400000)
  return diff + 1
}

function isDateInRange(dateText, startDate, endDate) {
  if (!dateText || !startDate || !endDate) return false
  return dateText >= startDate && dateText <= endDate
}

function eachDate(startDate, endDate, cb) {
  const s = parseDate(startDate)
  const e = parseDate(endDate)
  if (!s || !e || e < s) return
  const cursor = new Date(s)
  while (cursor <= e) {
    cb(formatDate(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
}

function normalizeOrderList(list) {
  if (!Array.isArray(list)) return []
  return list.map((raw) => {
    const itemID = Number(raw?.submission_item_id || 0)
    const startDate = normalizeDateText(raw?.start_date || raw?.startDate || '')
    const endDate = normalizeDateText(raw?.end_date || raw?.endDate || '')
    const refImagesRaw = raw?.ref_images || raw?.refImages || ''
    const coverImage = String(raw?.cover_image || raw?.coverImage || '').trim()
    let durationDays = Number(raw?.duration_days || 0)
    if (startDate && endDate) {
      const calc = daysBetweenInclusive(startDate, endDate)
      if (calc > 0) durationDays = calc
    }
    if (durationDays <= 0) durationDays = Number(props.defaultDurationDays || 7)
    if (durationDays <= 0) durationDays = 7
    return {
      ...raw,
      submission_item_id: itemID,
      start_date: startDate,
      end_date: endDate,
      ref_images: refImagesRaw,
      cover_image: coverImage || (parseRefImages(refImagesRaw)[0] || ''),
      duration_days: durationDays,
    }
  })
}

watch(
  () => props.orders,
  (v) => {
    const shouldScrollToUnscheduled = !updatingFromSelf
    updatingFromSelf = false
    localOrders.value = normalizeOrderList(v)
    ensureValidSelection()
    if (shouldScrollToUnscheduled) {
      nextTick(scrollToFirstUnscheduled)
    }
  },
  { deep: true, immediate: true },
)

watch(
  () => todayText.value,
  (v) => {
    if (!currentMonth.value) {
      currentMonth.value = normalizeMonth(String(v || '').slice(0, 7))
      initMonthWindow(currentMonth.value)
      nextTick(() => {
        scrollToMonth(currentMonth.value, false)
        refreshDayRects()
      })
      return
    }
    ensureMonthVisible(currentMonth.value)
    nextTick(refreshDayRects)
  },
  { immediate: true },
)

const selectedOrder = computed(() => {
  const id = Number(selectedOrderId.value || 0)
  return localOrders.value.find((o) => Number(o.submission_item_id) === id) || null
})

const selectedRangeText = computed(() => {
  const row = selectedOrder.value
  if (!row) return '未选择'
  if (!row.start_date || !row.end_date) return `未排期 · 默认${row.duration_days || props.defaultDurationDays}天`
  return formatHumanRange(row.start_date, row.end_date, row.duration_days || 1)
})

const selectedStatusText = computed(() => {
  const row = selectedOrder.value
  if (!row) return '未知状态'
  const text = String(row?.submission_status_text || '').trim()
  if (text) return text
  const code = Number(row?.submission_status || 0)
  return submissionStatusTextMap[code] || `状态${code}`
})

const dragHintText = computed(() => {
  if (!dragState.active) return ''
  const name = selectedOrder.value?.work_subject || `创作#${dragState.orderId}`
  if (dragState.mode === 'place') return `放置 ${name}`
  if (dragState.mode === 'resize') return `调整区间 ${name}`
  return '拖拽中'
})

const visibleMonthBlocks = computed(() =>
  monthKeys.value.map((monthKey) => {
    const block = buildMonthDays(monthKey)
    return {
      monthKey,
      ...block,
    }
  })
)

const flatCalendarDays = computed(() =>
  visibleMonthBlocks.value.flatMap((block) =>
    block.days.map((day) => ({
      ...day,
      monthKey: block.monthKey,
    }))
  )
)

const dayOrderMap = computed(() => {
  const map = {}
  localOrders.value.forEach((order) => {
    const start = String(order?.start_date || '').trim()
    const end = String(order?.end_date || '').trim()
    if (!start || !end) return
    eachDate(start, end, (dateText) => {
      if (!map[dateText]) map[dateText] = []
      map[dateText].push(order)
    })
  })
  Object.keys(map).forEach((dateText) => {
    map[dateText].sort((a, b) => Number(a.submission_item_id || 0) - Number(b.submission_item_id || 0))
  })
  return map
})

const orderLaneMap = computed(() => {
  const laneMap = {}
  const maxPerDay = Math.max(1, Number(props.maxPerDay || 2))
  const scheduledOrders = localOrders.value
    .filter((order) => {
      const start = String(order?.start_date || '').trim()
      const end = String(order?.end_date || '').trim()
      return !!start && !!end
    })
    .sort((a, b) => {
      const aStart = String(a?.start_date || '')
      const bStart = String(b?.start_date || '')
      if (aStart !== bStart) return aStart.localeCompare(bStart)
      const aId = Number(a?.submission_item_id || 0)
      const bId = Number(b?.submission_item_id || 0)
      return aId - bId
    })

  const laneEndDates = Array.from({ length: maxPerDay }).map(() => '')
  scheduledOrders.forEach((order) => {
    const orderId = Number(order?.submission_item_id || 0)
    if (!orderId) return
    const start = String(order?.start_date || '').trim()
    const end = String(order?.end_date || '').trim()
    let lane = -1
    for (let i = 0; i < maxPerDay; i++) {
      // 允许首尾无重叠地衔接（前一单结束日 < 当前单开始日）
      if (!laneEndDates[i] || laneEndDates[i] < start) {
        lane = i
        break
      }
    }
    if (lane < 0) {
      // 超过并发上限时兜底到最后一轨，避免渲染丢失
      lane = maxPerDay - 1
    }
    laneMap[orderId] = lane
    laneEndDates[lane] = end
  })
  return laneMap
})

function getDayOrders(dateText) {
  const list = dayOrderMap.value[dateText] || []
  const maxPerDay = Math.max(1, Number(props.maxPerDay || 2))
  return list.slice(0, maxPerDay)
}

function getOrderTone(order) {
  const itemID = Number(order?.submission_item_id || 0)
  const idx = Math.abs(itemID) % 6
  return `tone-${idx}`
}

function buildRangeSegmentsForMonth({
  monthKey,
  monthDays,
  firstWeekday,
  orderID,
  order = null,
  lane,
  tone,
  startDate,
  endDate,
  boundaryStartDate = '',
  boundaryEndDate = '',
  invalid = false,
  keyPrefix = 'segment',
}) {
  const segments = []
  const dayCount = Number(monthDays?.length || 0)
  const offset = Number(firstWeekday || 0)
  const monthStartDate = String(monthDays?.[0]?.date || '')
  const monthEndDate = String(monthDays?.[monthDays.length - 1]?.date || '')
  if (!monthStartDate || !monthEndDate) return segments
  const orderStartDate = normalizeDateText(startDate || '')
  const orderEndDate = normalizeDateText(endDate || '')
  const avatarStartDate = normalizeDateText(boundaryStartDate || orderStartDate)
  const avatarEndDate = normalizeDateText(boundaryEndDate || orderEndDate)
  if (!orderStartDate || !orderEndDate) return segments
  if (orderEndDate < monthStartDate || orderStartDate > monthEndDate) return segments
  const visibleStart = orderStartDate < monthStartDate ? monthStartDate : orderStartDate
  const visibleEnd = orderEndDate > monthEndDate ? monthEndDate : orderEndDate
  const startDay = Number(String(visibleStart).slice(8, 10) || 0)
  const endDay = Number(String(visibleEnd).slice(8, 10) || 0)
  if (startDay <= 0 || endDay <= 0 || startDay > endDay || endDay > dayCount) return segments
  let startIndex = offset + startDay - 1
  const endIndex = offset + endDay - 1
  if (endIndex < startIndex) return segments
  while (startIndex <= endIndex) {
    const row = Math.floor(startIndex / 7)
    const rowStartIndex = row * 7
    const rowEndIndex = rowStartIndex + 6
    const segmentEndIndex = Math.min(endIndex, rowEndIndex)
    const startCol = startIndex - rowStartIndex
    const endCol = segmentEndIndex - rowStartIndex
    const segmentStartDay = startIndex - offset + 1
    const segmentEndDay = segmentEndIndex - offset + 1
    const segmentStartDate = segmentStartDay >= 1 && segmentStartDay <= dayCount
      ? `${monthKey}-${String(segmentStartDay).padStart(2, '0')}`
      : ''
    const segmentEndDate = segmentEndDay >= 1 && segmentEndDay <= dayCount
      ? `${monthKey}-${String(segmentEndDay).padStart(2, '0')}`
      : ''
    segments.push({
      key: `${keyPrefix}-${monthKey}-r${row}-l${Number(lane || 0)}-s${startCol}-e${endCol}-i${Number(orderID || 0)}`,
      row,
      lane: Number(lane || 0),
      startCol,
      endCol,
      single: endCol === startCol,
      order,
      orderId: Number(orderID || 0),
      selected: false,
      tone: String(tone || 'tone-0'),
      showStartAvatar: !!segmentStartDate && segmentStartDate === avatarStartDate,
      showEndAvatar: !!segmentEndDate && segmentEndDate === avatarEndDate,
      invalid: !!invalid,
    })
    startIndex = segmentEndIndex + 1
  }
  return segments
}

function buildFloatingSegmentsForMonth(monthKey, monthDays, firstWeekday) {
  const segments = []
  const dayCount = Number(monthDays?.length || 0)
  const offset = Number(firstWeekday || 0)
  const monthStartDate = String(monthDays?.[0]?.date || '')
  const monthEndDate = String(monthDays?.[monthDays.length - 1]?.date || '')
  if (!monthStartDate || !monthEndDate) return segments

  localOrders.value.forEach((order) => {
    const itemID = Number(order?.submission_item_id || 0)
    if (!itemID) return
    const orderStartDate = normalizeDateText(order?.start_date || '')
    const orderEndDate = normalizeDateText(order?.end_date || '')
    if (!orderStartDate || !orderEndDate) return
    if (orderEndDate < monthStartDate || orderStartDate > monthEndDate) return

    const lane = Number(orderLaneMap.value[itemID] ?? -1)
    if (lane < 0) return

    const baseSegments = buildRangeSegmentsForMonth({
      monthKey,
      monthDays,
      firstWeekday: offset,
      orderID: itemID,
      order,
      lane,
      tone: getOrderTone(order),
      startDate: orderStartDate,
      endDate: orderEndDate,
      boundaryStartDate: orderStartDate,
      boundaryEndDate: orderEndDate,
      keyPrefix: 'segment',
    })
    baseSegments.forEach((segment) => {
      segments.push({
        ...segment,
        selected: itemID === Number(selectedOrderId.value || 0),
      })
    })
  })

  segments.sort((a, b) => {
    if (a.row !== b.row) return a.row - b.row
    if (a.lane !== b.lane) return a.lane - b.lane
    return a.startCol - b.startCol
  })
  return segments
}

const floatingSegmentsMap = computed(() => {
  const map = {}
  visibleMonthBlocks.value.forEach((block) => {
    map[block.monthKey] = buildFloatingSegmentsForMonth(
      block.monthKey,
      block.days || [],
      Number(block.firstWeekday || 0),
    )
  })
  return map
})

const resizePreviewRange = computed(() => {
  if (!dragState.active || dragState.mode !== 'resize') return null
  const orderID = Number(dragState.orderId || 0)
  if (!orderID) return null
  const row = localOrders.value.find((order) => Number(order?.submission_item_id || 0) === orderID)
  if (!row) return null
  const targetDate = normalizeDateText(dragState.hoverDate || '')
  if (!targetDate) return null
  const start = normalizeDateText(row?.start_date || '')
  const end = normalizeDateText(row?.end_date || '')
  if (!start || !end) return null
  const edge = resolveResizeEdgeByAnchor(row, targetDate, dragState.resizeAnchor)
  let nextStart = start
  let nextEnd = end
  if (edge === 'start') {
    nextStart = targetDate > end ? end : targetDate
  } else {
    nextEnd = targetDate < start ? start : targetDate
  }
  const lane = Number(orderLaneMap.value[orderID] ?? 0)
  const valid = canApplyRange(orderID, nextStart, nextEnd)
  return {
    orderID,
    order: row,
    lane: lane >= 0 ? lane : 0,
    tone: getOrderTone(row),
    startDate: nextStart,
    endDate: nextEnd,
    valid,
  }
})

const resizePreviewSegmentsMap = computed(() => {
  const map = {}
  const preview = resizePreviewRange.value
  if (!preview) return map
  visibleMonthBlocks.value.forEach((block) => {
    map[block.monthKey] = buildRangeSegmentsForMonth({
      monthKey: block.monthKey,
      monthDays: block.days || [],
      firstWeekday: Number(block.firstWeekday || 0),
      orderID: preview.orderID,
      order: preview.order,
      lane: preview.lane,
      tone: preview.tone,
      startDate: preview.startDate,
      endDate: preview.endDate,
      boundaryStartDate: preview.startDate,
      boundaryEndDate: preview.endDate,
      invalid: !preview.valid,
      keyPrefix: 'preview',
    })
  })
  return map
})

function isResizePreviewingOrder(orderID) {
  if (!dragState.active || dragState.mode !== 'resize') return false
  return Number(orderID || 0) > 0 && Number(orderID || 0) === Number(resizePreviewRange.value?.orderID || 0)
}

function getFloatingSegmentStyle(segment) {
  const cellHeight = Number(dayCellHeightPx.value || 0)
  const firstRect = Array.isArray(dayCellRects.value) ? dayCellRects.value[0] : null
  const cellWidth = Number(firstRect?.width || 0)
  const gapX = Number(dayCellGapXPx.value || 0)
  const gapY = Number(dayCellGapYPx.value || 0)
  if (cellHeight <= 0 || cellWidth <= 0) {
    return {}
  }
  const rowTop = Number(segment.row || 0) * (cellHeight + gapY)
  const laneTopBase = cellHeight * 0.66
  const laneStep = Math.max(8, Math.min(14, cellHeight * 0.18))
  const laneOffset = Number(segment.lane || 0) * laneStep
  const segmentHeight = Math.max(18, Math.min(28, cellHeight * 0.28))
  const avatarSize = Math.max(segmentHeight + 8, 26)
  const trackHeight = Math.max(8, Math.min(12, segmentHeight * 0.46))
  const top = rowTop + laneTopBase + laneOffset - segmentHeight / 2
  const left = Number(segment.startCol || 0) * (cellWidth + gapX)
  const span = Number(segment.endCol || 0) - Number(segment.startCol || 0) + 1
  const width = span * cellWidth + Math.max(0, span - 1) * gapX
  return {
    top: `${Math.round(top * 100) / 100}px`,
    left: `${Math.round(left * 100) / 100}px`,
    width: `${Math.round(width * 100) / 100}px`,
    '--segment-height': `${Math.round(segmentHeight * 100) / 100}px`,
    '--segment-avatar-size': `${Math.round(avatarSize * 100) / 100}px`,
    '--segment-track-height': `${Math.round(trackHeight * 100) / 100}px`,
  }
}

function shortOrderTitle(order) {
  const txt = String(order?.work_subject || '').trim()
  if (!txt) return `#${order?.submission_item_id || ''}`
  return txt.length > 8 ? `${txt.slice(0, 8)}…` : txt
}

function isOrderScheduled(order) {
  const start = normalizeDateText(order?.start_date || '')
  const end = normalizeDateText(order?.end_date || '')
  return !!start && !!end
}

function orderAnchorId(itemID) {
  const id = Number(itemID || 0)
  if (!id) return ''
  return `order-item-${id}`
}

function scrollToFirstUnscheduled() {
  if (!localOrders.value.length) {
    orderStripIntoView.value = ''
    return
  }
  const idx = localOrders.value.findIndex((row) => !isOrderScheduled(row))
  const target = localOrders.value[idx >= 0 ? idx : 0]
  const anchor = orderAnchorId(target?.submission_item_id)
  if (!anchor) return
  orderStripIntoView.value = ''
  nextTick(() => {
    orderStripIntoView.value = anchor
  })
}

function collectOrderRangeDates(order) {
  const start = normalizeDateText(order?.start_date || '')
  const end = normalizeDateText(order?.end_date || '')
  if (start && end) {
    const dates = []
    eachDate(start, end, (d) => dates.push(d))
    return dates
  }
  if (start) return [start]
  if (end) return [end]
  return []
}

function isDayFlashing(dateText) {
  if (!dateText) return false
  return flashingDates.value.includes(dateText)
}

function triggerOrderFlash(order) {
  if (!order) return
  const dates = collectOrderRangeDates(order)
  if (!dates.length) return
  if (flashResetTimer) {
    clearTimeout(flashResetTimer)
    flashResetTimer = 0
  }
  flashingDates.value = []
  nextTick(() => {
    flashingDates.value = dates
    flashResetTimer = setTimeout(() => {
      flashingDates.value = []
      flashResetTimer = 0
    }, 1200)
  })
}

async function focusSelectedOrderCalendar() {
  const row = selectedOrder.value
  if (!row) return
  const anchorDate = normalizeDateText(row?.start_date || row?.end_date || '')
  if (!anchorDate) {
    emitInvalid('该订单还未排期')
    return
  }
  const targetMonth = normalizeMonth(anchorDate.slice(0, 7))
  ensureMonthVisible(targetMonth)
  currentMonth.value = targetMonth
  await nextTick()
  scrollToMonth(targetMonth)
  refreshDayRects()
  triggerOrderFlash(row)
}

function goSelectedOrderDetail() {
  const row = selectedOrder.value
  if (!row) {
    emitInvalid('请先选择订单')
    return
  }
  const submissionID = Number(row?.submission_id || 0)
  const itemID = Number(row?.submission_item_id || 0)
  if (!submissionID || !itemID) {
    emitInvalid('缺少订单详情参数')
    return
  }
  uni.navigateTo({
    url: `/pkg-creator/creator_order/submission_item_detail/submission_item_detail?submission_id=${submissionID}&item_id=${itemID}`,
  })
}

function ensureValidSelection() {
  const id = Number(props.selectedOrderId || 0)
  if (id > 0 && localOrders.value.some((o) => Number(o.submission_item_id) === id)) return
  const first = localOrders.value[0]
  if (first && Number(first.submission_item_id) > 0) {
    emit('update:selectedOrderId', Number(first.submission_item_id))
  }
}

function selectOrder(itemID) {
  const id = Number(itemID || 0)
  if (!id) return
  emit('update:selectedOrderId', id)
}

function beginQuickPlace(orderID) {
  const id = Number(orderID || 0)
  if (!id) {
    emitInvalid('缺少可放置的订单')
    return false
  }
  const row = localOrders.value.find((order) => Number(order?.submission_item_id || 0) === id)
  if (!row) {
    emitInvalid('订单不存在')
    return false
  }
  quickPlaceOrderId.value = id
  selectOrder(id)
  return true
}

function startExternalPlaceDrag(orderID, event) {
  const id = Number(orderID || 0)
  if (!id) {
    emitInvalid('缺少可拖拽的订单')
    return false
  }
  const row = localOrders.value.find((order) => Number(order?.submission_item_id || 0) === id)
  if (!row) {
    emitInvalid('订单不存在')
    return false
  }
  if (typeof window === 'undefined') {
    // 非 H5 环境回退为“点日历放置”模式，避免拖拽状态悬挂
    return beginQuickPlace(id)
  }
  startDrag('place', id, event)
  return true
}

function shiftMonth(offset) {
  const targetMonth = shiftMonthKey(currentMonth.value || todayText.value.slice(0, 7), Number(offset || 0))
  ensureMonthVisible(targetMonth)
  currentMonth.value = targetMonth
  nextTick(() => {
    scrollToMonth(targetMonth)
    refreshDayRects()
  })
}

function scrollToMonth(monthKey, animate = true) {
  const anchor = monthAnchorId(monthKey)
  calendarIntoView.value = ''
  if (!animate) {
    calendarIntoView.value = anchor
    return
  }
  nextTick(() => {
    calendarIntoView.value = anchor
  })
}

function appendMonths(batch = monthLoadBatchSize) {
  if (!monthKeys.value.length) {
    initMonthWindow(currentMonth.value || todayText.value.slice(0, 7))
    return
  }
  const append = []
  let cursor = monthKeys.value[monthKeys.value.length - 1]
  for (let i = 0; i < Number(batch || 0); i++) {
    cursor = shiftMonthKey(cursor, 1)
    append.push(cursor)
  }
  monthKeys.value = [...monthKeys.value, ...append]
}

function prependMonths(batch = monthLoadBatchSize) {
  if (!monthKeys.value.length) {
    initMonthWindow(currentMonth.value || todayText.value.slice(0, 7))
    return
  }
  const prepend = []
  let cursor = monthKeys.value[0]
  for (let i = 0; i < Number(batch || 0); i++) {
    cursor = shiftMonthKey(cursor, -1)
    prepend.push(cursor)
  }
  const oldFirst = monthKeys.value[0]
  monthKeys.value = [...prepend.reverse(), ...monthKeys.value]
  nextTick(() => {
    scrollToMonth(oldFirst)
    refreshDayRects()
  })
}

function handleCalendarScrollToUpper() {
  if (loadingMoreTop.value) return
  loadingMoreTop.value = true
  prependMonths()
  nextTick(() => {
    loadingMoreTop.value = false
  })
}

function handleCalendarScrollToLower() {
  if (loadingMoreBottom.value) return
  loadingMoreBottom.value = true
  appendMonths()
  nextTick(() => {
    refreshDayRects()
    loadingMoreBottom.value = false
  })
}

function handleCalendarScroll(e) {
  emit('calendar-scroll', Number(e?.detail?.scrollTop || 0))
}

function emitInvalid(msg) {
  emit('invalid', msg || '操作失败')
}

function emitChangeOrders() {
  updatingFromSelf = true
  emit('change', localOrders.value.map((o) => ({ ...o })))
}

function orderRangeText(order) {
  const start = String(order?.start_date || '').trim()
  const end = String(order?.end_date || '').trim()
  if (!start || !end) return `未排期 · ${order?.duration_days || props.defaultDurationDays}天`
  return formatHumanRange(start, end, order?.duration_days || 0)
}

function canApplyRange(orderID, startDate, endDate) {
  const maxPerDay = Math.max(1, Number(props.maxPerDay || 2))
  const dayCounter = {}
  localOrders.value.forEach((order) => {
    const id = Number(order.submission_item_id || 0)
    if (!id || id === Number(orderID || 0)) return
    const start = String(order.start_date || '').trim()
    const end = String(order.end_date || '').trim()
    if (!start || !end) return
    eachDate(start, end, (d) => {
      dayCounter[d] = (dayCounter[d] || 0) + 1
    })
  })
  let ok = true
  eachDate(startDate, endDate, (d) => {
    const count = Number(dayCounter[d] || 0)
    if (count >= maxPerDay) ok = false
  })
  return ok
}

function applyRange(orderID, startDate, endDate) {
  const idx = localOrders.value.findIndex((o) => Number(o.submission_item_id) === Number(orderID))
  if (idx < 0) return false
  const s = parseDate(startDate)
  const e = parseDate(endDate)
  if (!s || !e || e < s) {
    emitInvalid('日期区间无效')
    return false
  }
  const start = formatDate(s)
  const end = formatDate(e)
  if (!canApplyRange(orderID, start, end)) {
    const maxPerDay = Math.max(1, Number(props.maxPerDay || 2))
    emitInvalid(`该日期已达到重叠上限（最多同时${maxPerDay}单）`)
    return false
  }
  const days = daysBetweenInclusive(start, end)
  const cur = localOrders.value[idx]
  localOrders.value[idx] = {
    ...cur,
    start_date: start,
    end_date: end,
    duration_days: days > 0 ? days : Number(cur.duration_days || props.defaultDurationDays || 1),
  }
  emitChangeOrders()
  return true
}

function handleDayTap(day) {
  if (!day?.date) return
  const monthOfDay = normalizeMonth(String(day.date).slice(0, 7))
  if (monthOfDay) {
    currentMonth.value = monthOfDay
  }
  if (dragState.active && dragState.mode) return
  if (Number(quickPlaceOrderId.value || 0) > 0) {
    const itemID = Number(quickPlaceOrderId.value || 0)
    const row = localOrders.value.find((order) => Number(order?.submission_item_id || 0) === itemID)
    if (!row) {
      quickPlaceOrderId.value = 0
      emitInvalid('当前订单不可用，请重新选择')
      return
    }
    const duration = Number(row.duration_days || props.defaultDurationDays || 1)
    const end = addDays(day.date, Math.max(0, duration - 1))
    const placed = applyRange(itemID, day.date, end)
    if (placed) {
      quickPlaceOrderId.value = 0
      triggerOrderFlash(row)
    }
    return
  }
  const list = getDayOrders(day.date)
  if (!list.length) return
  selectOrder(list[0].submission_item_id)
}

function startDrag(mode, orderID, event) {
  const id = Number(orderID || 0)
  if (!id) {
    emitInvalid('缺少创作ID')
    return
  }
  quickPlaceOrderId.value = 0
  const touch = getTouchPoint(event)
  dragState.active = true
  dragState.mode = mode
  dragState.orderId = id
  dragState.hoverDate = ''
  dragState.resizeAnchor = ''
  dragState.touchX = touch?.clientX || 0
  dragState.touchY = touch?.clientY || 0
  selectOrder(id)
  bindGlobalDragListeners()
  nextTick(refreshDayRects)
}

function startPlaceDrag(order, event) {
  const id = Number(order?.submission_item_id || 0)
  if (!id) return
  startDrag('place', id, event)
}

function startResizeDrag(order, anchor, event) {
  const id = Number(order?.submission_item_id || 0)
  if (!id) return
  if (!order?.start_date || !order?.end_date) {
    startDrag('place', id, event)
    return
  }
  startDrag('resize', id, event)
  dragState.resizeAnchor = String(anchor || 'line')
}

function getTouchPoint(e) {
  const t = e?.touches?.[0] || e?.changedTouches?.[0]
  return t || null
}

function bindGlobalDragListeners() {
  if (dragGlobalBound) return
  if (typeof window === 'undefined') return
  dragGlobalMoveHandler = (e) => {
    onRootTouchMove(e)
  }
  dragGlobalEndHandler = (e) => {
    if (dragState.active) {
      onRootTouchMove(e)
    }
    onRootTouchEnd()
  }
  window.addEventListener('touchmove', dragGlobalMoveHandler, { passive: false })
  window.addEventListener('touchend', dragGlobalEndHandler, { passive: false })
  window.addEventListener('touchcancel', dragGlobalEndHandler, { passive: false })
  dragGlobalBound = true
}

function unbindGlobalDragListeners() {
  if (!dragGlobalBound || typeof window === 'undefined') return
  if (dragGlobalMoveHandler) {
    window.removeEventListener('touchmove', dragGlobalMoveHandler)
  }
  if (dragGlobalEndHandler) {
    window.removeEventListener('touchend', dragGlobalEndHandler)
    window.removeEventListener('touchcancel', dragGlobalEndHandler)
  }
  dragGlobalBound = false
  dragGlobalMoveHandler = null
  dragGlobalEndHandler = null
}

function findDateByPoint(x, y) {
  const rects = Array.isArray(dayCellRects.value) ? dayCellRects.value : []
  if (!rects.length) return ''
  for (let i = 0; i < rects.length; i++) {
    const r = rects[i]
    if (!r) continue
    if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
      return flatCalendarDays.value[i]?.date || ''
    }
  }
  return ''
}

function resolveDropDateFromCurrentTouch() {
  const x = Number(dragState.touchX || 0)
  const y = Number(dragState.touchY || 0)
  if (!x && !y) return ''
  return findDateByPoint(x, y)
}

function onRootTouchMove(e) {
  if (!dragState.active) return
  const touch = getTouchPoint(e)
  if (!touch) return
  if (typeof e.preventDefault === 'function' && e.cancelable) e.preventDefault()
  dragState.touchX = touch.clientX
  dragState.touchY = touch.clientY
  const hitDate = findDateByPoint(touch.clientX, touch.clientY)
  if (hitDate) {
    dragState.hoverDate = hitDate
  } else if (!dragState.hoverDate && dragState.mode === 'place') {
    dragState.hoverDate = ''
  }
}

function resolveResizeEdgeByAnchor(order, targetDate, anchor) {
  const fixedAnchor = String(anchor || '')
  if (fixedAnchor === 'start' || fixedAnchor === 'end') return fixedAnchor
  const start = normalizeDateText(order?.start_date || '')
  const end = normalizeDateText(order?.end_date || '')
  const total = daysBetweenInclusive(start, end)
  if (!start || !end || total <= 1) return 'end'
  const middleDate = addDays(start, Math.floor((total - 1) / 2))
  return targetDate <= middleDate ? 'start' : 'end'
}

function resizeOrderRange(orderID, targetDate, anchor) {
  const idx = localOrders.value.findIndex((o) => Number(o.submission_item_id) === Number(orderID))
  if (idx < 0) return false
  const row = localOrders.value[idx]
  const start = normalizeDateText(row?.start_date || '')
  const end = normalizeDateText(row?.end_date || '')
  if (!start || !end) return false

  const edge = resolveResizeEdgeByAnchor(row, targetDate, anchor)
  let nextStart = start
  let nextEnd = end
  if (edge === 'start') {
    nextStart = targetDate > end ? end : targetDate
  } else {
    nextEnd = targetDate < start ? start : targetDate
  }
  return applyRange(orderID, nextStart, nextEnd)
}

function finishDrag() {
  if (!dragState.active) return
  const targetDate = normalizeDateText(resolveDropDateFromCurrentTouch() || '')
  const mode = dragState.mode
  const orderID = Number(dragState.orderId || 0)
  const resizeAnchor = String(dragState.resizeAnchor || '')

  if (targetDate && orderID > 0) {
    const targetMonth = normalizeMonth(String(targetDate).slice(0, 7))
    if (targetMonth) {
      currentMonth.value = targetMonth
    }
    const row = localOrders.value.find((o) => Number(o.submission_item_id) === orderID)
    if (row) {
      if (mode === 'place') {
        const dur = Number(row.duration_days || props.defaultDurationDays || 1)
        const end = addDays(targetDate, Math.max(0, dur - 1))
        applyRange(orderID, targetDate, end)
      } else if (mode === 'resize') {
        resizeOrderRange(orderID, targetDate, resizeAnchor)
      }
    }
  }

  dragState.active = false
  dragState.mode = ''
  dragState.orderId = 0
  dragState.hoverDate = ''
  dragState.resizeAnchor = ''
}

function onRootTouchEnd() {
  finishDrag()
  unbindGlobalDragListeners()
}

function onRootTouchCancel() {
  finishDrag()
  unbindGlobalDragListeners()
}

function refreshDayRects() {
  nextTick(() => {
    const query = uni.createSelectorQuery().in(instance?.proxy)
    query.selectAll('.schedule-day-cell').boundingClientRect((rects) => {
      const list = Array.isArray(rects) ? rects : []
      dayCellRects.value = list
      const firstWidth = Number(list?.[0]?.width || 0)
      if (firstWidth <= 0) return
      if (list.length > 1) {
        const nextGapX = Number((list[1]?.left || 0) - (list[0]?.left || 0) - firstWidth)
        dayCellGapXPx.value = nextGapX > 0 ? nextGapX : 0
      }
      if (list.length > 7) {
        const nextGapY = Number((list[7]?.top || 0) - (list[0]?.top || 0) - Number(list?.[0]?.height || 0))
        dayCellGapYPx.value = nextGapY > 0 ? nextGapY : 0
      }
      const nextHeight = Math.round(firstWidth * 1.2 * 100) / 100
      if (Math.abs(nextHeight - Number(dayCellHeightPx.value || 0)) > 0.5) {
        dayCellHeightPx.value = nextHeight
        nextTick(() => {
          const nextQuery = uni.createSelectorQuery().in(instance?.proxy)
          nextQuery.selectAll('.schedule-day-cell').boundingClientRect((nextRects) => {
            dayCellRects.value = Array.isArray(nextRects) ? nextRects : []
          })
          nextQuery.exec()
        })
      }
    })
    query.exec()
  })
}

onMounted(() => {
  if (!currentMonth.value) {
    currentMonth.value = normalizeMonth(todayText.value.slice(0, 7))
  }
  if (!monthKeys.value.length) {
    initMonthWindow(currentMonth.value)
  }
  nextTick(() => {
    scrollToMonth(currentMonth.value, false)
    refreshDayRects()
  })
})

onBeforeUnmount(() => {
  if (flashResetTimer) {
    clearTimeout(flashResetTimer)
    flashResetTimer = 0
  }
  unbindGlobalDragListeners()
})

watch(
  () => currentMonth.value,
  () => {
    ensureMonthVisible(currentMonth.value)
    nextTick(refreshDayRects)
  },
)

watch(
  () => monthKeys.value,
  () => {
    nextTick(refreshDayRects)
  },
  { deep: true },
)

defineExpose({
  focusSelectedOrderCalendar,
  beginQuickPlace,
  startExternalPlaceDrag,
})
</script>

<style scoped lang="scss">
.schedule-calendar {
  position: relative;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: visible;
  --status-c0: #cdefff;
  --status-c1: #ffeabf;
  --status-c2: #d6f6e8;
  --status-c3: #efe2ff;
  --status-c4: #ffddea;
  --status-c5: #dbe8ff;
  --status-c6: #ffe7d4;
  --day-cell-height: 124rpx;
  --day-cell-gap: 8rpx;
  --bridge-width: 10rpx;
}

.month-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12rpx;
}

.month-title {
  font-size: 30rpx;
  color: #384353;
  font-weight: 700;
}

.month-btn {
  width: 52rpx;
  height: 52rpx;
  border-radius: 14rpx;
  background: #ecf3f9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-scroll {
  height: 68vh;
  min-height: 760rpx;
  max-height: 980rpx;
}

.calendar-month-stack {
  width: 100%;
  box-sizing: border-box;
  padding-bottom: 8rpx;
}

.month-block {
  margin-bottom: 18rpx;
}

.month-block-title-row {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8rpx;
}

.month-block-title {
  font-size: 28rpx;
  color: #445068;
}

.weekday-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8rpx;
  margin-bottom: 10rpx;
}

.weekday-text {
  text-align: center;
  font-size: 20rpx;
  color: #6e7f95;
}

.month-grid {
  position: relative;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: visible;
  border-radius: 14rpx;
  padding: 0;
  margin: 0;
}

.month-grid-base {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  grid-auto-rows: var(--day-cell-height);
  gap: var(--day-cell-gap);
  position: relative;
  z-index: 1;
}

.month-grid-overlay {
  position: absolute;
  inset: 0;
  z-index: 8;
  pointer-events: none;
  overflow: visible;
}

.floating-segment {
  position: absolute;
  height: var(--segment-height, 24px);
  min-height: var(--segment-height, 24px);
  pointer-events: auto;
  z-index: 12;
}

.floating-segment.preview {
  pointer-events: none;
  z-index: 26;
}

.floating-segment.previewing-origin {
  opacity: 0;
  pointer-events: none;
}

.floating-segment.selected {
  z-index: 24;
}

.floating-segment-line {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  height: var(--segment-track-height, 10px);
  border-radius: 999px;
  background: var(--segment-bg, #dce6ef);
}

.floating-segment.preview .floating-segment-line {
  height: 6px;
  background:
    repeating-linear-gradient(
      -28deg,
      rgba(144, 154, 168, 0.78) 0 2px,
      rgba(144, 154, 168, 0.16) 2px 6px
    );
  box-shadow: inset 0 0 0 1px rgba(129, 139, 153, 0.34);
}

.floating-segment.preview.invalid .floating-segment-line {
  height: 6px;
  background:
    repeating-linear-gradient(
      -28deg,
      rgba(124, 134, 149, 0.84) 0 2px,
      rgba(124, 134, 149, 0.2) 2px 6px
    );
  box-shadow: inset 0 0 0 1px rgba(116, 126, 140, 0.4);
}

.floating-segment.preview .floating-avatar-wrap {
  box-shadow: 0 3px 10px rgba(90, 112, 144, 0.18);
}

.floating-segment.preview .floating-avatar {
  opacity: 0.96;
}

.floating-segment.has-start .floating-segment-line {
  left: calc(var(--segment-avatar-size, 30px) / 2);
}

.floating-segment.has-end .floating-segment-line {
  right: calc(var(--segment-avatar-size, 30px) / 2);
}

.floating-avatar-wrap {
  position: absolute;
  top: 50%;
  width: var(--segment-avatar-size, 30px);
  height: var(--segment-avatar-size, 30px);
  transform: translateY(-50%);
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--segment-bg, #dce6ef);
  box-shadow: 0 4px 10px rgba(120, 141, 170, 0.16);
}

.floating-avatar-wrap.start {
  left: 0;
}

.floating-avatar-wrap.end {
  right: 0;
}

.floating-avatar {
  width: calc(var(--segment-avatar-size, 30px) - 6px);
  height: calc(var(--segment-avatar-size, 30px) - 6px);
  border-radius: 999px;
  background: #d2dbeb;
}

.floating-segment.single .floating-segment-line {
  display: none;
}

.floating-segment.single .floating-avatar-wrap.start,
.floating-segment.single .floating-avatar-wrap.end {
  left: 50%;
  right: auto;
  transform: translate(-50%, -50%);
}

.floating-segment.single.has-start:not(.has-end) .floating-avatar-wrap.end {
  display: none;
}

.floating-segment.single.has-end:not(.has-start) .floating-avatar-wrap.start {
  display: none;
}

.floating-segment.single.has-start.has-end .floating-avatar-wrap.end {
  display: none;
}

.floating-segment.single:not(.has-start):not(.has-end) .floating-segment-line {
  display: block;
  left: 16%;
  right: 16%;
}

.floating-segment.tone-0 {
  --segment-bg: var(--status-c0);
}

.floating-segment.tone-1 {
  --segment-bg: var(--status-c1);
}

.floating-segment.tone-2 {
  --segment-bg: var(--status-c2);
}

.floating-segment.tone-3 {
  --segment-bg: var(--status-c3);
}

.floating-segment.tone-4 {
  --segment-bg: var(--status-c4);
}

.floating-segment.tone-5 {
  --segment-bg: var(--status-c5);
}

.floating-segment.tone-6 {
  --segment-bg: var(--status-c6);
}

.floating-segment.selected .floating-segment-line,
.floating-segment.selected .floating-avatar-wrap {
  box-shadow: 0 0 0 2px rgba(90, 107, 132, 0.24), 0 5px 12px rgba(120, 141, 170, 0.2);
}

.schedule-day-cell {
  position: relative;
  width: 100%;
  min-width: 0;
  height: var(--day-cell-height);
  min-height: var(--day-cell-height);
  max-height: var(--day-cell-height);
  border-radius: 14rpx;
  background: #f8fbfe;
  padding: 8rpx 8rpx;
  box-sizing: border-box;
  border: none;
  box-shadow: none;
  overflow: hidden;
}

.schedule-day-cell.flash {
  animation: day-cell-flash 360ms ease-in-out 3;
}

.schedule-day-cell.today {
  background: #f2f7fb;
}

.schedule-day-cell.past {
  background: #eef2f6;
}

.schedule-day-cell.past .day-num {
  color: #90a0b5;
}

.schedule-day-cell.hover {
  background: #edf5fb;
}

.schedule-day-cell.outside {
  background: transparent;
  box-shadow: none;
}

.day-num {
  display: block;
  font-size: 20rpx;
  color: #5f6e83;
  text-align: right;
}

.day-order-list {
  margin-top: 0;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  overflow: visible;
  padding: 0 1rpx;
  position: relative;
  z-index: 10;
}

.day-order-pill {
  position: relative;
  border-radius: 999rpx;
  padding: 2rpx 10rpx;
  min-height: 32rpx;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  overflow: visible;
  z-index: 24;
  pointer-events: auto;
}

.day-order-pill > image,
.day-order-pill > view,
.day-order-pill > text {
  position: relative;
  z-index: 2;
}

.day-order-pill.link-left {
  border-top-left-radius: 8rpx;
  border-bottom-left-radius: 8rpx;
}

.day-order-pill.link-right {
  border-top-right-radius: 8rpx;
  border-bottom-right-radius: 8rpx;
}

.day-order-pill.segment-middle {
  padding: 0;
  min-height: 20rpx;
  margin-top: 6rpx;
  margin-bottom: 6rpx;
  border-radius: 999rpx;
}

.day-order-pill.segment-end {
  justify-content: flex-end;
}

.day-order-pill.segment-start,
.day-order-pill.segment-end {
  width: 34rpx;
  min-width: 34rpx;
  min-height: 34rpx;
  padding: 0;
  border-radius: 999rpx;
  justify-content: center;
}

.day-order-pill.segment-start.link-right::after,
.day-order-pill.segment-end.link-left::before {
  top: 7rpx;
  height: 20rpx;
  border-radius: 999rpx;
}

.day-order-pill.link-left::before,
.day-order-pill.link-right::after {
  content: '';
  position: absolute;
  top: 0;
  width: var(--bridge-width);
  height: 100%;
  background: inherit;
  pointer-events: none;
  z-index: 1;
}

.day-order-pill.link-left::before {
  left: calc(var(--bridge-width) * -1);
}

.day-order-pill.link-right::after {
  right: calc(var(--bridge-width) * -1);
}

.day-order-pill.tone-0 {
  background: var(--status-c0);
}

.day-order-pill.tone-1 {
  background: var(--status-c1);
}

.day-order-pill.tone-2 {
  background: var(--status-c2);
}

.day-order-pill.tone-3 {
  background: var(--status-c3);
}

.day-order-pill.tone-4 {
  background: var(--status-c4);
}

.day-order-pill.tone-5 {
  background: var(--status-c5);
}

.pill-avatar {
  width: 26rpx;
  height: 26rpx;
  border-radius: 50%;
  margin-right: 6rpx;
  flex-shrink: 0;
  background: #d2dbeb;
}

.day-order-pill.segment-start .pill-avatar,
.day-order-pill.segment-end .pill-avatar {
  margin-right: 0;
}

.placeholder {
  background: linear-gradient(135deg, #cfd9e3 0%, #b7c4d1 100%);
}

.pill-text {
  font-size: 19rpx;
  color: #384353;
  max-width: calc(100% - 34rpx);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.selected-panel {
  margin-bottom: 16rpx;
  border-radius: 16rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 20rpx rgba(15, 23, 42, 0.06);
  padding: 16rpx;
}

.selected-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10rpx;
  margin-bottom: 10rpx;
}

.selected-title {
  display: block;
  font-size: 24rpx;
  color: #1f2937;
}

.selected-tip-bubble {
  flex-shrink: 0;
  border-radius: 999rpx;
  padding: 6rpx 14rpx;
  font-size: 18rpx;
  color: #253246;
  background: #e6f3fa;
  box-shadow: 0 4rpx 10rpx rgba(120, 145, 173, 0.12);
}

.selected-head {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.selected-head-text {
  min-width: 0;
  flex: 1;
}

.selected-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  flex-shrink: 0;
  background: #d2dbeb;
}

.selected-name {
  display: block;
  font-size: 26rpx;
  color: #202938;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.selected-meta {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #6d7788;
  line-height: 1.45;
}

.selected-status {
  display: block;
  margin-top: 4rpx;
  font-size: 20rpx;
  color: #8c98aa;
}

.selected-actions {
  margin-top: 14rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  align-items: center;
}

.selected-action-chip {
  border-radius: 999rpx;
  padding: 0 16rpx;
  min-height: 56rpx;
  line-height: 56rpx;
  font-size: 22rpx;
  color: #253246;
  background: #eaf2f8;
  font-weight: 500;
  box-sizing: border-box;
  white-space: nowrap;
  box-shadow: 0 4rpx 10rpx rgba(120, 145, 173, 0.1);
}

.selected-action-chip.drag-chip {
  background: #d9f2fb;
  color: #253246;
}

.selected-action-chip.detail-chip {
  background: #e6eef7;
  color: #253246;
}

.selected-action-desc {
  display: block;
  margin-top: 8rpx;
  font-size: 20rpx;
  color: #7d889a;
  line-height: 1.4;
}

.selected-empty {
  font-size: 22rpx;
  color: #8d97a8;
}

.order-strip {
  margin-bottom: 16rpx;
  white-space: nowrap;
}

.order-strip-inner {
  display: inline-flex;
  gap: 10rpx;
  padding-bottom: 4rpx;
}

.order-item {
  width: 260rpx;
  border-radius: 14rpx;
  background: #ffffff;
  border: 1rpx solid #e5e9f0;
  padding: 12rpx;
  box-sizing: border-box;
}

.order-item.selected {
  background: #f6f8fb;
}

.order-item.tone-0 {
  background: #f8f9fb;
}

.order-item.tone-1 {
  background: #f6f8fa;
}

.order-item.tone-2 {
  background: #f4f6f9;
}

.order-item.tone-3 {
  background: #f3f5f8;
}

.order-item.tone-4 {
  background: #f1f4f7;
}

.order-item.tone-5 {
  background: #edf2f6;
}

.order-item.scheduled {
  background: #eef7f1 !important;
  border-color: #cfe1d7;
}

.order-item.scheduled .order-item-meta {
  color: #5e6f65;
}

.order-item-head {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.order-item-avatar {
  width: 50rpx;
  height: 50rpx;
  border-radius: 50%;
  flex-shrink: 0;
  background: #d2dbeb;
}

.order-item-title {
  display: block;
  font-size: 23rpx;
  color: #384353;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.order-item-meta {
  display: block;
  margin-top: 6rpx;
  font-size: 20rpx;
  color: #6f7f92;
  line-height: 1.45;
}

.order-item-drag {
  margin-top: 8rpx;
  border-radius: 999rpx;
  min-height: 46rpx;
  line-height: 46rpx;
  text-align: center;
  font-size: 21rpx;
  color: #1f5b73;
  background: rgba(120, 218, 245, 0.2);
  font-weight: 500;
}

.drag-float {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 999;
  pointer-events: none;
  min-height: 48rpx;
  line-height: 48rpx;
  padding: 0 14rpx;
  border-radius: 999rpx;
  background: rgba(95, 110, 131, 0.92);
  color: #fff;
  font-size: 22rpx;
}

.order-item.selected {
  box-shadow: inset 0 0 0 2rpx rgba(136, 164, 186, 0.28);
}

@keyframes day-cell-flash {
  0%,
  100% {
    box-shadow: inset 0 0 0 2rpx rgba(135, 149, 168, 0.06);
  }
  50% {
    box-shadow: inset 0 0 0 2rpx rgba(86, 106, 133, 0.42);
  }
}
</style>
