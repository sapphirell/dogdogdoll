<template>
  <view
    class="schedule-calendar"
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

    <view class="weekday-row">
      <text v-for="name in weekNames" :key="name" class="weekday-text">{{ name }}</text>
    </view>

    <view class="month-grid">
      <view
        v-for="(day, idx) in calendarDays"
        :key="`${day.date}-${idx}`"
        class="schedule-day-cell"
        :class="{
          muted: !day.inMonth,
          today: day.date === todayText,
          hover: dragState.active && dragState.hoverDate === day.date
        }"
        @tap="handleDayTap(day)"
      >
        <text class="day-num" :class="{ muted: !day.inMonth }">{{ day.day }}</text>
        <view class="day-order-list">
          <view
            v-for="(order, laneIndex) in getDayOrders(day.date)"
            :key="`${day.date}-${order.submission_item_id}`"
            class="day-order-pill"
            :class="getDayOrderPillClass(order, day, idx, laneIndex)"
            @tap.stop="selectOrder(order.submission_item_id)"
            @touchstart.stop.prevent="startMoveDrag(order, $event)"
          >
            <image
              v-if="getOrderCover(order)"
              class="pill-avatar"
              :src="getOrderCover(order)"
              mode="aspectFill"
            />
            <view v-else class="pill-avatar placeholder"></view>
            <text class="pill-text">{{ shortOrderTitle(order) }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="selected-panel">
      <text class="selected-title font-alimamashuhei">当前选择订单</text>
      <view v-if="selectedOrder" class="selected-main">
        <view class="selected-head">
          <image
            v-if="getOrderCover(selectedOrder)"
            class="selected-avatar"
            :src="getOrderCover(selectedOrder)"
            mode="aspectFill"
          />
          <view v-else class="selected-avatar placeholder"></view>
          <view class="selected-head-text">
            <text class="selected-name">{{ selectedOrder.work_subject || `子单#${selectedOrder.submission_item_id}` }}</text>
            <text class="selected-meta">
              {{ selectedRangeText }}
            </text>
          </view>
        </view>
        <view class="selected-actions">
          <view class="selected-action-chip drag-chip" @touchstart.stop.prevent="startPlaceDrag(selectedOrder, $event)">
            拖拽放置
          </view>
          <view
            class="selected-action-chip resize-chip"
            :class="{ disabled: !selectedHasRange }"
            @touchstart.stop.prevent="startResizeDrag('resize-start', $event)"
          >
            拖拽起始
          </view>
          <view
            class="selected-action-chip resize-chip"
            :class="{ disabled: !selectedHasRange }"
            @touchstart.stop.prevent="startResizeDrag('resize-end', $event)"
          >
            拖拽结束
          </view>
          <view
            class="selected-action-chip clear-chip"
            :class="{ disabled: !selectedHasRange }"
            @tap="clearOrderRange(selectedOrder.submission_item_id)"
          >
            清空区间
          </view>
        </view>
      </view>
      <view v-else class="selected-empty">
        <text>请先在下方点选一个订单</text>
      </view>
    </view>

    <scroll-view class="order-strip" scroll-x>
      <view class="order-strip-inner">
        <view
          v-for="order in localOrders"
          :key="order.submission_item_id"
          class="order-item"
          :class="[getOrderTone(order), { selected: Number(order.submission_item_id) === Number(selectedOrderId) }]"
          @tap="selectOrder(order.submission_item_id)"
        >
          <view class="order-item-head">
            <image
              v-if="getOrderCover(order)"
              class="order-item-avatar"
              :src="getOrderCover(order)"
              mode="aspectFill"
            />
            <view v-else class="order-item-avatar placeholder"></view>
            <text class="order-item-title">{{ order.work_subject || `子单#${order.submission_item_id}` }}</text>
          </view>
          <text class="order-item-meta">{{ orderRangeText(order) }}</text>
          <view class="order-item-drag" @touchstart.stop.prevent="startPlaceDrag(order, $event)">
            拖拽到日历
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
import { computed, getCurrentInstance, nextTick, onMounted, reactive, ref, watch } from 'vue'

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
  today: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['change', 'update:selectedOrderId', 'invalid'])

const weekNames = ['一', '二', '三', '四', '五', '六', '日']
const localOrders = ref([])
const currentMonth = ref('')
const dayCellRects = ref([])
const instance = getCurrentInstance()

const dragState = reactive({
  active: false,
  mode: '',
  orderId: 0,
  hoverDate: '',
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

const todayText = computed(() => {
  const t = normalizeDateText(props.today || '')
  return t || getNowDateText()
})

const monthLabel = computed(() => {
  const [y, m] = currentMonth.value.split('-')
  return `${y}年${Number(m)}月`
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
    localOrders.value = normalizeOrderList(v)
    ensureValidSelection()
  },
  { deep: true, immediate: true },
)

watch(
  () => todayText.value,
  (v) => {
    if (!currentMonth.value) {
      currentMonth.value = normalizeMonth(String(v || '').slice(0, 7))
      nextTick(refreshDayRects)
    }
  },
  { immediate: true },
)

const selectedOrder = computed(() => {
  const id = Number(selectedOrderId.value || 0)
  return localOrders.value.find((o) => Number(o.submission_item_id) === id) || null
})

const selectedOrderId = computed(() => Number(props.selectedOrderId || 0))

const selectedHasRange = computed(() => {
  const row = selectedOrder.value
  return !!row && !!row.start_date && !!row.end_date
})

const selectedRangeText = computed(() => {
  const row = selectedOrder.value
  if (!row) return '未选择'
  if (!row.start_date || !row.end_date) return `未排期 · 默认${row.duration_days || props.defaultDurationDays}天`
  return formatHumanRange(row.start_date, row.end_date, row.duration_days || 1)
})

const dragHintText = computed(() => {
  if (!dragState.active) return ''
  const name = selectedOrder.value?.work_subject || `子单#${dragState.orderId}`
  if (dragState.mode === 'place') return `放置 ${name}`
  if (dragState.mode === 'move') return `移动 ${name}`
  if (dragState.mode === 'resize-start') return `调整起始`
  if (dragState.mode === 'resize-end') return `调整结束`
  return '拖拽中'
})

const calendarDays = computed(() => {
  const [yearText, monthText] = normalizeMonth(currentMonth.value || todayText.value.slice(0, 7)).split('-')
  const year = Number(yearText)
  const month = Number(monthText)
  const firstDay = new Date(year, month - 1, 1)
  const offset = (firstDay.getDay() + 6) % 7
  const start = new Date(firstDay)
  start.setDate(firstDay.getDate() - offset)

  const out = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    out.push({
      date: formatDate(d),
      day: d.getDate(),
      inMonth: d.getMonth() === month - 1,
    })
  }
  return out
})

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

function getDayOrders(dateText) {
  const list = dayOrderMap.value[dateText] || []
  return list.slice(0, 2)
}

function getOrderTone(order) {
  const itemID = Number(order?.submission_item_id || 0)
  const idx = Math.abs(itemID) % 6
  return `tone-${idx}`
}

function hasSameOrderOnLane(dateText, laneIndex, itemID) {
  const list = getDayOrders(dateText)
  return Number(list?.[laneIndex]?.submission_item_id || 0) === Number(itemID || 0)
}

function getDayOrderPillClass(order, day, dayIndex, laneIndex) {
  const itemID = Number(order?.submission_item_id || 0)
  const tone = getOrderTone(order)
  if (!itemID || !day?.date) {
    return {
      [tone]: true,
      selected: Number(order?.submission_item_id || 0) === Number(selectedOrderId.value),
    }
  }
  const prevIndex = Number(dayIndex) - 1
  const nextIndex = Number(dayIndex) + 1
  const sameRowPrev = prevIndex >= 0 && Math.floor(prevIndex / 7) === Math.floor(Number(dayIndex) / 7)
  const sameRowNext = nextIndex < calendarDays.value.length && Math.floor(nextIndex / 7) === Math.floor(Number(dayIndex) / 7)
  const connectLeft = sameRowPrev && hasSameOrderOnLane(addDays(day.date, -1), laneIndex, itemID)
  const connectRight = sameRowNext && hasSameOrderOnLane(addDays(day.date, 1), laneIndex, itemID)
  return {
    [tone]: true,
    selected: itemID === Number(selectedOrderId.value),
    'link-left': connectLeft,
    'link-right': connectRight,
  }
}

function shortOrderTitle(order) {
  const txt = String(order?.work_subject || '').trim()
  if (!txt) return `#${order?.submission_item_id || ''}`
  return txt.length > 8 ? `${txt.slice(0, 8)}…` : txt
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

function shiftMonth(offset) {
  const [yText, mText] = normalizeMonth(currentMonth.value || todayText.value.slice(0, 7)).split('-')
  const date = new Date(Number(yText), Number(mText) - 1, 1)
  date.setMonth(date.getMonth() + Number(offset || 0))
  currentMonth.value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  nextTick(refreshDayRects)
}

function emitInvalid(msg) {
  emit('invalid', msg || '操作失败')
}

function emitChangeOrders() {
  emit('change', localOrders.value.map((o) => ({ ...o })))
}

function orderRangeText(order) {
  const start = String(order?.start_date || '').trim()
  const end = String(order?.end_date || '').trim()
  if (!start || !end) return `未排期 · ${order?.duration_days || props.defaultDurationDays}天`
  return formatHumanRange(start, end, order?.duration_days || 0)
}

function clearOrderRange(itemID) {
  const id = Number(itemID || 0)
  if (!id) return
  const idx = localOrders.value.findIndex((o) => Number(o.submission_item_id) === id)
  if (idx < 0) return
  const cur = localOrders.value[idx]
  localOrders.value[idx] = {
    ...cur,
    start_date: '',
    end_date: '',
  }
  emitChangeOrders()
}

function canApplyRange(orderID, startDate, endDate) {
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
    if (count >= 2) ok = false
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
    emitInvalid('该日期已达到重叠上限（最多同时2单）')
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
  if (dragState.active && dragState.mode) return
  const row = selectedOrder.value
  if (!row) return
  const dur = Number(row.duration_days || props.defaultDurationDays || 1)
  const end = addDays(day.date, Math.max(0, dur - 1))
  applyRange(row.submission_item_id, day.date, end)
}

function startDrag(mode, orderID, event) {
  const id = Number(orderID || 0)
  if (!id) {
    emitInvalid('缺少子单ID')
    return
  }
  const touch = getTouchPoint(event)
  dragState.active = true
  dragState.mode = mode
  dragState.orderId = id
  dragState.hoverDate = ''
  dragState.touchX = touch?.clientX || 0
  dragState.touchY = touch?.clientY || 0
  selectOrder(id)
  nextTick(refreshDayRects)
}

function startPlaceDrag(order, event) {
  const id = Number(order?.submission_item_id || 0)
  if (!id) return
  startDrag('place', id, event)
}

function startMoveDrag(order, event) {
  const id = Number(order?.submission_item_id || 0)
  if (!id) return
  if (!order?.start_date || !order?.end_date) {
    startDrag('place', id, event)
    return
  }
  startDrag('move', id, event)
}

function startResizeDrag(mode, event) {
  const row = selectedOrder.value
  if (!row) {
    emitInvalid('请先选择订单')
    return
  }
  if (!row.start_date || !row.end_date) {
    emitInvalid('请先给该订单放置日期')
    return
  }
  startDrag(mode, row.submission_item_id, event)
}

function getTouchPoint(e) {
  const t = e?.touches?.[0] || e?.changedTouches?.[0]
  return t || null
}

function findDateByPoint(x, y) {
  const rects = Array.isArray(dayCellRects.value) ? dayCellRects.value : []
  if (!rects.length) return ''
  for (let i = 0; i < rects.length; i++) {
    const r = rects[i]
    if (!r) continue
    if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
      return calendarDays.value[i]?.date || ''
    }
  }
  return ''
}

function onRootTouchMove(e) {
  if (!dragState.active) return
  const touch = getTouchPoint(e)
  if (!touch) return
  if (typeof e.preventDefault === 'function') e.preventDefault()
  dragState.touchX = touch.clientX
  dragState.touchY = touch.clientY
  dragState.hoverDate = findDateByPoint(touch.clientX, touch.clientY)
}

function finishDrag() {
  if (!dragState.active) return
  const targetDate = dragState.hoverDate
  const mode = dragState.mode
  const orderID = Number(dragState.orderId || 0)

  if (targetDate && orderID > 0) {
    const row = localOrders.value.find((o) => Number(o.submission_item_id) === orderID)
    if (row) {
      if (mode === 'place' || mode === 'move') {
        const dur = Number(row.duration_days || props.defaultDurationDays || 1)
        const end = addDays(targetDate, Math.max(0, dur - 1))
        applyRange(orderID, targetDate, end)
      } else if (mode === 'resize-start') {
        const end = row.end_date
        if (end && targetDate <= end) {
          applyRange(orderID, targetDate, end)
        } else {
          emitInvalid('开始日期不能晚于结束日期')
        }
      } else if (mode === 'resize-end') {
        const start = row.start_date
        if (start && targetDate >= start) {
          applyRange(orderID, start, targetDate)
        } else {
          emitInvalid('结束日期不能早于开始日期')
        }
      }
    }
  }

  dragState.active = false
  dragState.mode = ''
  dragState.orderId = 0
  dragState.hoverDate = ''
}

function onRootTouchEnd() {
  finishDrag()
}

function onRootTouchCancel() {
  finishDrag()
}

function refreshDayRects() {
  nextTick(() => {
    const query = uni.createSelectorQuery().in(instance?.proxy)
    query.selectAll('.schedule-day-cell').boundingClientRect((rects) => {
      dayCellRects.value = Array.isArray(rects) ? rects : []
    })
    query.exec()
  })
}

onMounted(() => {
  if (!currentMonth.value) {
    currentMonth.value = normalizeMonth(todayText.value.slice(0, 7))
  }
  nextTick(refreshDayRects)
})

watch(
  () => currentMonth.value,
  () => {
    nextTick(refreshDayRects)
  },
)
</script>

<style scoped lang="scss">
.schedule-calendar {
  position: relative;
  --status-c0: #dce6ef;
  --status-c1: #d2deea;
  --status-c2: #c8d6e4;
  --status-c3: #becfdf;
  --status-c4: #b3c7d8;
  --status-c5: #a8bfd1;
  --status-c6: #88a4ba;
  --bridge-width: 20rpx;
}

.month-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
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
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8rpx;
  overflow: visible;
  padding: 0 calc(var(--bridge-width) + 2rpx);
  margin: 0 calc((var(--bridge-width) + 2rpx) * -1);
}

.schedule-day-cell {
  position: relative;
  z-index: 1;
  min-height: 136rpx;
  border-radius: 14rpx;
  background: #f8fbfe;
  padding: 8rpx 6rpx;
  box-sizing: border-box;
  border: 1rpx solid #e2e8f0;
  overflow: visible;
}

.schedule-day-cell.today {
  background: #f2f7fb;
  border-color: #cdd9e6;
}

.schedule-day-cell.hover {
  border-color: #8da5ba;
  box-shadow: inset 0 0 0 2rpx rgba(136, 164, 186, 0.2);
}

.schedule-day-cell.muted {
  opacity: 0.55;
}

.day-num {
  display: block;
  font-size: 20rpx;
  color: #5f6e83;
  text-align: right;
}

.day-num.muted {
  color: #9aa5b6;
}

.day-order-list {
  margin-top: 6rpx;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  overflow: visible;
  padding: 0 1rpx;
}

.day-order-pill {
  position: relative;
  border-radius: 10rpx;
  padding: 2rpx 10rpx;
  min-height: 34rpx;
  display: flex;
  align-items: center;
  z-index: 20;
}

.day-order-pill > image,
.day-order-pill > view,
.day-order-pill > text {
  position: relative;
  z-index: 2;
}

.day-order-pill.selected {
  box-shadow: inset 0 0 0 2rpx rgba(95, 110, 131, 0.26);
}

.day-order-pill.link-left {
  border-top-left-radius: 4rpx;
  border-bottom-left-radius: 4rpx;
}

.day-order-pill.link-right {
  border-top-right-radius: 4rpx;
  border-bottom-right-radius: 4rpx;
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
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  margin-right: 6rpx;
  flex-shrink: 0;
  background: #d2dbeb;
}

.placeholder {
  background: linear-gradient(135deg, #cfd9e3 0%, #b7c4d1 100%);
}

.pill-text {
  font-size: 19rpx;
  color: #384353;
  max-width: calc(100% - 30rpx);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.selected-panel {
  margin-top: 18rpx;
  border-radius: 16rpx;
  background: linear-gradient(180deg, rgba(236, 243, 249, 0.95) 0%, rgba(241, 244, 247, 0.95) 100%);
  padding: 16rpx;
}

.selected-title {
  display: block;
  font-size: 24rpx;
  color: #5f6e83;
  margin-bottom: 10rpx;
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
  color: #384353;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.selected-meta {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #6f7f92;
  line-height: 1.45;
}

.selected-actions {
  margin-top: 12rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.selected-action-chip {
  border-radius: 999rpx;
  padding: 0 14rpx;
  min-height: 54rpx;
  line-height: 54rpx;
  font-size: 22rpx;
  color: #fff;
}

.selected-action-chip.drag-chip {
  background: var(--status-c6);
}

.selected-action-chip.resize-chip {
  background: #8da0b4;
}

.selected-action-chip.clear-chip {
  background: #9aa4b2;
}

.selected-action-chip.disabled {
  opacity: 0.42;
}

.selected-empty {
  font-size: 22rpx;
  color: #8f9caf;
}

.order-strip {
  margin-top: 16rpx;
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
  background: #f5f8fb;
  padding: 12rpx;
  box-sizing: border-box;
}

.order-item.selected {
  background: #ecf3f9;
}

.order-item.tone-0 {
  background: rgba(216, 232, 247, 0.75);
}

.order-item.tone-1 {
  background: rgba(200, 219, 239, 0.74);
}

.order-item.tone-2 {
  background: rgba(185, 208, 231, 0.74);
}

.order-item.tone-3 {
  background: rgba(171, 197, 223, 0.74);
}

.order-item.tone-4 {
  background: rgba(158, 187, 216, 0.74);
}

.order-item.tone-5 {
  background: rgba(146, 177, 208, 0.72);
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
  color: #5f6e83;
  background: rgba(157, 176, 195, 0.22);
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
</style>
