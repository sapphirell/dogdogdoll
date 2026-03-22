<template>
  <view class="schedule-board-page">
    <zhouWei-navBar
      type="transparentFixed"
      :scrollTop="scrollTop"
      :backState="2000"
      :homeState="2000"
      bgColor="rgba(255,255,255,0.94)"
      fontColor="#1a202b"
      transparentFixedFontColor="#1a202b"
      :shadow="false"
      :titleCenter="true"
      title="日历排期"
    >
      <template #left>
        <view class="nav-back-pill" @click="goBack" aria-label="返回">
          <uni-icons type="arrow-left" size="22" color="#1a202b" />
        </view>
      </template>
      <template #transparentFixedLeft>
        <view class="nav-back-pill" @click="goBack" aria-label="返回">
          <uni-icons type="arrow-left" size="22" color="#1a202b" />
        </view>
      </template>
    </zhouWei-navBar>

    <loading-toast :show="loading" text="排期加载中..." />

    <view class="schedule-board-body" :style="{ paddingTop: headerPadPx }">
      <view v-if="!loading && errorMsg" class="state-box state-error">
        <text class="state-title">加载失败</text>
        <text class="state-desc">{{ errorMsg }}</text>
        <view class="retry-btn" @tap="fetchBoard">重试</view>
      </view>

      <view v-else-if="!loading" class="board-content">
        <view class="hero-card" :class="{ collapsed: heroCollapsed, animating: heroAnimating }">
          <transition name="hero-fold-morph" mode="out-in">
            <view v-if="heroCollapsed" key="collapsed" class="hero-fold-row">
            <view class="hero-fold-cover-wrap">
              <image
                v-if="selectedOrderCover"
                class="hero-fold-cover"
                :class="{ 'is-drag-pressing': selectedDragPressing }"
                :src="selectedOrderCover"
                mode="aspectFill"
                @touchstart.stop.prevent="startSelectedDrag"
              />
              <view
                v-else
                class="hero-fold-cover hero-fold-cover-placeholder"
                :class="{ 'is-drag-pressing': selectedDragPressing }"
                @touchstart.stop.prevent="startSelectedDrag"
              ></view>
            </view>
            <view class="hero-fold-actions">
              <view class="hero-fold-btn period font-title" @tap="openPeriodPopup">{{ foldPeriodButtonLabel }}</view>
              <view class="hero-fold-btn menu font-title" @tap="openActionPopup">功能菜单</view>
              <view
                class="hero-fold-save"
                :class="{
                  disabled: saving,
                  pending: !saving && hasPendingChanges,
                  idle: !saving && !hasPendingChanges,
                }"
                @tap="saveBoard"
              >
                <text class="hero-fold-save-text font-title">{{ saving ? '保存中...' : (hasPendingChanges ? '保存' : '已保存') }}</text>
                <text v-if="!saving && hasPendingChanges" class="save-btn-attention-mark">!</text>
              </view>
              <view class="hero-fold-btn nav font-title" @tap="selectPrevHeroOrder">上个</view>
              <view class="hero-fold-btn nav font-title" @tap="selectNextHeroOrder">下个</view>
            </view>
            </view>
            <view v-else key="expanded" class="hero-focus-row">
            <view class="hero-focus-cover-wrap">
              <image
                v-if="selectedOrderCover"
                class="hero-focus-cover"
                :class="{ 'is-drag-pressing': selectedDragPressing }"
                :src="selectedOrderCover"
                mode="aspectFill"
                @touchstart.stop.prevent="startSelectedDrag"
              />
              <view
                v-else
                class="hero-focus-cover hero-focus-cover-placeholder"
                :class="{ 'is-drag-pressing': selectedDragPressing }"
                @touchstart.stop.prevent="startSelectedDrag"
              ></view>
              <view class="hero-drop-btn" @tap="startSelectedDropDown" @touchstart.stop.prevent="startSelectedDrag">
                <image class="hero-drop-btn-icon" src="/static/new-icon/hand.png" mode="aspectFit" />
                <text class="hero-drop-btn-text font-alimamashuhei">拖下来</text>
              </view>
            </view>
            <view class="hero-focus-main">
              <view class="hero-actions">
                <view class="hero-action-btns">
                  <button
                    class="ghost-btn menu-btn"
                    @tap="openActionPopup"
                  >
                    功能菜单
                  </button>
                  <button
                    class="save-btn"
                    :class="{
                      disabled: saving,
                      pending: !saving && hasPendingChanges,
                      idle: !saving && !hasPendingChanges,
                    }"
                    :disabled="saving"
                    @tap="saveBoard"
                  >
                    <text class="save-btn-text">{{ saving ? '保存中...' : (hasPendingChanges ? '保存' : '已保存') }}</text>
                    <text v-if="!saving && hasPendingChanges" class="save-btn-attention-mark">!</text>
                  </button>
                </view>
                <view class="hero-period-trigger hero-period-trigger-compact" @tap="openPeriodPopup">
                  <view class="hero-period-trigger-main">
                    <uni-icons type="calendar" size="16" color="#1a202b" />
                    <text class="hero-period-trigger-text">{{ selectedPeriodLabel }}</text>
                  </view>
                  <view class="hero-period-trigger-arrow">
                    <uni-icons type="redo" size="14" color="#ffffff" />
                  </view>
                </view>
              </view>
              <text class="hero-focus-range font-title">{{ selectedOrderRangeLabel }}</text>
              <view class="hero-order-strip-row">
                <scroll-view class="hero-order-strip-scroll" scroll-x show-scrollbar="false" @scroll="onHeroOrderStripScroll">
                  <view class="hero-order-strip-inner">
                    <view
                      v-for="order in heroOrderStripOrders"
                      :key="order.submission_item_id"
                      class="hero-order-avatar-item"
                      :class="{ active: Number(order.submission_item_id || 0) === Number(selectedOrderId || 0) }"
                      @tap="selectHeroOrder(order.submission_item_id)"
                    >
                      <image
                        v-if="getOrderCover(order)"
                        class="hero-order-avatar"
                        :src="getOrderCover(order)"
                        mode="aspectFill"
                      />
                      <view v-else class="hero-order-avatar hero-order-avatar-placeholder"></view>
                      <view class="hero-order-tags">
                        <text v-if="!isOrderScheduled(order)" class="hero-order-tag hero-order-tag-unscheduled font-title">未排</text>
                        <text v-else-if="isOrderWaitingMaterialShip(order)" class="hero-order-tag hero-order-tag-wait-ship font-title">待寄</text>
                        <text v-else-if="isOrderWaitingMaterialReceive(order)" class="hero-order-tag hero-order-tag-wait-ship font-title">待收</text>
                      </view>
                    </view>
                  </view>
                </scroll-view>
                <view v-if="heroOrderOverflowCount > 0" class="hero-overflow-tip">
                  <image class="hero-overflow-ellipsis" src="/static/new-icon/ellipsis.png" mode="aspectFit" />
                  <text class="hero-overflow-count font-title">+{{ heroOrderOverflowCount }}</text>
                </view>
              </view>
              <view class="hero-summary-row">
                <view class="hero-summary-item">
                  <text class="metric-label">待创作数</text>
                  <text class="metric-value font-title">{{ visibleOrders.length }}</text>
                </view>
                <view class="hero-summary-item">
                  <text class="metric-label">已排期</text>
                  <text class="metric-value font-title">{{ scheduledCount }}</text>
                </view>
                <view class="hero-summary-item">
                  <text class="metric-label">加急单</text>
                  <text class="metric-value font-title">{{ urgentCount }}</text>
                </view>
              </view>
            </view>
            </view>
          </transition>
        </view>

        <view class="calendar-card">
          <order-schedule-calendar
            ref="scheduleCalendarRef"
            :orders="visibleOrders"
            :selected-order-id="selectedOrderId"
            :default-duration-days="defaultDurationDays"
            :max-per-day="maxPerDay"
            :today="today"
            @update:selectedOrderId="onUpdateSelectedOrder"
            @change="onCalendarChange"
            @invalid="onCalendarInvalid"
            @calendar-scroll="onCalendarInnerScroll"
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

      <uni-popup
        ref="actionPopupRef"
        type="bottom"
        :mask-click="true"
      >
        <view class="period-popup-sheet">
          <view class="period-popup-head">
            <text class="period-popup-title font-alimamashuhei">功能菜单</text>
            <text class="period-popup-close font-title" @tap="closeActionPopup">关闭</text>
          </view>
          <view class="action-menu-list">
            <view class="action-menu-item" @tap="handleMenuAction('auto')">
              <view class="action-menu-main">
                <text class="action-menu-title font-alimamashuhei">{{ autoArrangeButtonText }}</text>
                <text class="action-menu-desc font-title">{{ autoArrangeButtonDesc }}</text>
              </view>
              <uni-icons type="arrow-right" size="16" color="#78daf5" />
            </view>
            <view class="action-menu-item" @tap="handleMenuAction('toggleUrgent')">
              <view class="action-menu-main">
                <text class="action-menu-title font-alimamashuhei">切换加急</text>
                <text class="action-menu-desc font-title">
                  {{ selectedOrder ? (selectedOrder.is_urgent ? '当前为加急，点击可取消' : '当前为普通，点击改为加急') : '请先选择一个订单' }}
                </text>
              </view>
              <uni-icons type="arrow-right" size="16" color="#78daf5" />
            </view>
            <view class="action-menu-grid">
              <view class="action-menu-chip" @tap="handleMenuAction('movePrev')">前移一位</view>
              <view class="action-menu-chip" @tap="handleMenuAction('moveNext')">后移一位</view>
              <view class="action-menu-chip" @tap="handleMenuAction('clear')">清空排期</view>
            </view>
          </view>
        </view>
      </uni-popup>

      <uni-popup
        ref="autoArrangePopupRef"
        type="bottom"
        :mask-click="true"
      >
        <view class="period-popup-sheet auto-arrange-popup-sheet">
          <view class="period-popup-head">
            <text class="period-popup-title font-alimamashuhei">一键排单</text>
            <text class="period-popup-close font-title" @tap="closeAutoArrangePopup">关闭</text>
          </view>
          <view class="auto-arrange-panel">
            <view class="auto-arrange-option">
              <view class="auto-arrange-option-head">
                <text class="auto-arrange-option-title font-alimamashuhei">按每个头/毛工期排单</text>
                <text class="auto-arrange-option-sub font-title">默认 7 天</text>
              </view>
              <view class="auto-arrange-days-row">
                <text class="auto-arrange-days-label font-title">工期</text>
                <input
                  class="auto-arrange-days-input font-title"
                  type="number"
                  :value="fixedArrangeDaysInput"
                  @input="onFixedArrangeDaysInput"
                />
                <text class="auto-arrange-days-unit font-title">天</text>
                <view class="auto-arrange-submit" @tap="triggerFixedDurationAutoArrange">立即排单</view>
              </view>
            </view>
            <view class="auto-arrange-option">
              <view class="auto-arrange-option-head">
                <text class="auto-arrange-option-title font-alimamashuhei">平均分自由模式工期</text>
                <text class="auto-arrange-option-sub font-title">按本期开单总工期平均分配</text>
              </view>
              <view class="auto-arrange-submit auto-arrange-submit-secondary" @tap="triggerAverageAutoArrange">
                使用平均分排单
              </view>
            </view>
          </view>
        </view>
      </uni-popup>

        <view class="foot-tip">
          <uni-icons type="info" size="16" color="#8a96a8" />
          <text>规则：单日最多同时{{ maxPerDay }}单（允许最多重叠{{ maxPerDay - 1 }}个订单）。</text>
        </view>

        <view
          v-if="selectedDragGhostVisible"
          class="selected-drag-ghost"
          :class="{ morphing: selectedDragGhostMorphing }"
          :style="selectedDragGhostStyle"
        >
          <image
            v-if="selectedOrderCover"
            class="selected-drag-ghost-image"
            :src="selectedOrderCover"
            mode="aspectFill"
          />
          <view v-else class="selected-drag-ghost-image selected-drag-ghost-placeholder"></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { onLoad, onPageScroll, onShow } from '@dcloudio/uni-app'
import { getNavBarHeight, getStatusBarHeight, toPx, websiteUrl } from '@/common/config.js'
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
const scheduleCalendarRef = ref(null)
const periodPopupRef = ref(null)
const actionPopupRef = ref(null)
const autoArrangePopupRef = ref(null)
const selectedPeriodValue = ref('all')
const periodOptionRows = ref([])
const fixedArrangeDaysInput = ref('7')
const heroOrderStripScrollLeft = ref(0)
const heroOrderStripViewportWidth = ref(0)
const heroOrderItemWidth = ref(0)
const heroOrderItemGap = ref(0)
const scrollTop = ref(0)
const savedBoardSignature = ref('[]')
const heroCollapsed = ref(false)
const heroAnimating = ref(false)
const selectedDragPressing = ref(false)
const selectedDragGhostVisible = ref(false)
const selectedDragGhostMorphing = ref(false)
const selectedDragGhostLeft = ref(-9999)
const selectedDragGhostTop = ref(-9999)
const selectedDragGhostWidth = ref(0)
const selectedDragGhostHeight = ref(0)
const selectedDragGhostCircleSize = ref(0)
const instance = getCurrentInstance()
const headerPadPx = computed(() => toPx(getStatusBarHeight() + getNavBarHeight()))

let selectedDragSession = 0
let selectedDragMorphTimer = 0
let selectedDragGlobalBound = false
let selectedDragMoveHandler = null
let selectedDragEndHandler = null
let selectedDragLastMoveLogAt = 0
let foldTrackDirection = ''
let foldTrackStartAt = 0
let lastPageScrollTop = 0
let lastCalendarScrollTop = 0
let heroAnimTimer = 0
const selectedDragTouchOffsetX = 0
const selectedDragTouchOffsetY = 0

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
  const source = periodOptionRows.value.length
    ? periodOptionRows.value
    : (() => {
      const map = new Map()
      allOrders.value.forEach((row) => {
        const sid = Number(row?.submission_id || 0)
        if (sid <= 0) return
        if (!map.has(sid)) {
          map.set(sid, { submissionId: sid, itemCount: 0, createdAt: 0 })
        }
        map.get(sid).itemCount += 1
      })
      return Array.from(map.values()).sort((a, b) => a.submissionId - b.submissionId)
    })()
  const issueOptions = source.map((item) => ({
    value: `submission:${item.submissionId}`,
    label: formatPeriodOpenDateLabel(item.createdAt, item.submissionId),
    desc: `${item.itemCount} 个投递内容`,
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

const foldPeriodButtonLabel = computed(() => {
  const raw = String(selectedPeriodLabel.value || '').trim()
  if (!raw) return '开单'
  if (raw === '全部开单') return raw
  return raw.includes('开单') ? raw : `${raw}开单`
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

const autoArrangeButtonText = computed(() => {
  if (Number(orderType.value || 0) === 2) return '按手速自动排单'
  if (Number(orderType.value || 0) === 5) return '一键顺序排单'
  return '自动排到日历'
})

const autoArrangeButtonDesc = computed(() => {
  if (Number(orderType.value || 0) === 5) return '先选工期方式，再生成排单'
  return '按当前顺序与工期自动生成排单'
})

const selectedOrder = computed(() =>
  visibleOrders.value.find((row) => Number(row.submission_item_id || 0) === Number(selectedOrderId.value || 0)) || null
)

const heroOrderStripOrders = computed(() => {
  return [...visibleOrders.value].sort((left, right) => {
    const leftSeq = effectiveSequenceNo(left)
    const rightSeq = effectiveSequenceNo(right)
    if (leftSeq !== rightSeq) return leftSeq - rightSeq
    return Number(left?.submission_item_id || 0) - Number(right?.submission_item_id || 0)
  })
})

const selectedOrderCover = computed(() => getOrderCover(selectedOrder.value))

const selectedOrderRangeLabel = computed(() => {
  const row = selectedOrder.value
  if (!row) return '工期：请先选择订单'
  const start = normalizeDateText(row?.start_date || '')
  const end = normalizeDateText(row?.end_date || '')
  const duration = Number(row?.duration_days || defaultDurationDays.value || 7)
  if (!start || !end) return `工期：待排期（预计${duration}天）`
  return `工期：${formatHumanRange(start, end, duration)}`
})

const heroOrderVisibleCount = computed(() => {
  const viewport = Number(heroOrderStripViewportWidth.value || 0)
  const unit = getHeroOrderUnitPx()
  if (viewport <= 0 || unit <= 0) return 3
  const gap = getHeroOrderGapPx()
  return Math.max(1, Math.floor((viewport + gap) / unit))
})

const heroOrderFirstIndex = computed(() => {
  const unit = getHeroOrderUnitPx()
  if (unit <= 0) return 0
  return Math.max(0, Math.floor(Number(heroOrderStripScrollLeft.value || 0) / unit))
})

const heroOrderOverflowCount = computed(() => {
  const total = heroOrderStripOrders.value.length
  const remain = total - heroOrderFirstIndex.value - heroOrderVisibleCount.value
  return remain > 0 ? remain : 0
})

const selectedDragGhostStyle = computed(() => ({
  left: `${Math.round(Number(selectedDragGhostLeft.value || 0))}px`,
  top: `${Math.round(Number(selectedDragGhostTop.value || 0))}px`,
  width: `${Math.max(0, Number(selectedDragGhostWidth.value || 0))}px`,
  height: `${Math.max(0, Number(selectedDragGhostHeight.value || 0))}px`,
  borderRadius: selectedDragGhostMorphing.value ? '999px' : `${Math.max(12, upxToPx(44))}px`,
}))

const hasPendingChanges = computed(() => buildScheduleBoardSignature(allOrders.value) !== savedBoardSignature.value)

function formatDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function normalizeScheduleCompareText(raw) {
  return String(raw || '').trim()
}

function buildScheduleCompareRow(row) {
  return {
    submission_item_id: Number(row?.submission_item_id || 0),
    start_date: normalizeDateText(row?.start_date || ''),
    end_date: normalizeDateText(row?.end_date || ''),
    duration_days: Number(row?.duration_days || 0),
    sequence_no: Number(row?.sequence_no || 0),
    priority_level: Number(row?.priority_level || 0),
    is_urgent: !!row?.is_urgent,
    urgent_mode: normalizeUrgentMode(row?.urgent_mode),
    urgent_reduce_days: Number(row?.urgent_reduce_days || 0),
    is_locked: !!row?.is_locked,
    lock_reason: normalizeScheduleCompareText(row?.lock_reason),
    earliest_start_date: normalizeDateText(row?.earliest_start_date || ''),
    latest_end_date: normalizeDateText(row?.latest_end_date || ''),
    material_ready_date: normalizeDateText(row?.material_ready_date || ''),
    schedule_note: normalizeScheduleCompareText(row?.schedule_note),
    schedule_source: normalizeScheduleSource(row?.schedule_source),
  }
}

function buildScheduleBoardSignature(list) {
  if (!Array.isArray(list) || !list.length) return '[]'
  const rows = list
    .map((row) => buildScheduleCompareRow(row))
    .filter((row) => Number(row.submission_item_id || 0) > 0)
    .sort((a, b) => Number(a.submission_item_id || 0) - Number(b.submission_item_id || 0))
  return JSON.stringify(rows)
}

function formatPeriodOpenDateLabel(createdAt, submissionId) {
  const ts = Number(createdAt || 0)
  if (ts > 0) {
    const ms = ts > 1e12 ? ts : ts * 1000
    const dt = new Date(ms)
    if (!Number.isNaN(dt.getTime())) {
      return formatDate(dt)
    }
  }
  return `开单#${Number(submissionId || 0)}`
}

function parseDate(raw) {
  const txt = String(raw || '').trim()
  const m = txt.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return null
  const y = Number(m[1])
  const mm = Number(m[2])
  const d = Number(m[3])
  if (!y || mm < 1 || mm > 12 || d < 1 || d > 31) return null
  const dt = new Date(y, mm - 1, d)
  if (dt.getFullYear() !== y || dt.getMonth() !== mm - 1 || dt.getDate() !== d) return null
  return dt
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
      if (Array.isArray(arr)) return arr.map((v) => String(v || '').trim()).filter(Boolean)
    } catch (_) {}
  }
  return txt.split(',').map((part) => String(part || '').trim().replace(/^"+|"+$/g, '')).filter(Boolean)
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
  if (withYear) return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function daysBetweenInclusive(startDate, endDate) {
  const start = parseDate(startDate)
  const end = parseDate(endDate)
  if (!start || !end) return 0
  return Math.floor((end.getTime() - start.getTime()) / 86400000) + 1
}

function formatHumanRange(startDate, endDate, durationDays = 0) {
  const start = normalizeDateText(startDate)
  const end = normalizeDateText(endDate)
  if (!start || !end) return ''
  const startDateObj = parseDate(start)
  const endDateObj = parseDate(end)
  const sameYear = !!startDateObj && !!endDateObj && startDateObj.getFullYear() === endDateObj.getFullYear()
  const left = formatHumanDate(start, true)
  const right = formatHumanDate(end, !sameYear)
  const days = Number(durationDays || daysBetweenInclusive(start, end) || 0)
  return `${left} ~ ${right}${days > 0 ? `（${days}天）` : ''}`
}

function isOrderScheduled(order) {
  const start = normalizeDateText(order?.start_date || '')
  const end = normalizeDateText(order?.end_date || '')
  return !!start && !!end
}

function isOrderWaitingMaterialShip(order) {
  const status = Number(order?.submission_item_status || 0)
  if (status === 7) return true
  const statusText = String(order?.material_status_text || '').trim()
  if (!statusText) return false
  return statusText.includes('待寄送') || statusText.includes('待寄')
}

function isOrderWaitingMaterialReceive(order) {
  const status = Number(order?.submission_item_status || 0)
  if (status === 8) return true
  const statusText = String(order?.material_status_text || '').trim()
  if (!statusText) return false
  return statusText.includes('寄送中') || statusText.includes('待收到') || statusText.includes('待收')
}

function upxToPx(value) {
  const n = Number(value || 0)
  if (!Number.isFinite(n) || n <= 0) return 0
  try {
    if (typeof uni !== 'undefined' && typeof uni.upx2px === 'function') {
      return Number(uni.upx2px(n) || 0)
    }
  } catch (_) {}
  return n / 2
}

function getHeroOrderGapPx() {
  const measured = Number(heroOrderItemGap.value || 0)
  if (measured > 0) return measured
  return upxToPx(14)
}

function getHeroOrderUnitPx() {
  const width = Number(heroOrderItemWidth.value || 0)
  if (width > 0) return width + getHeroOrderGapPx()
  return upxToPx(84) + getHeroOrderGapPx()
}

function measureHeroOrderStripViewport() {
  nextTick(() => {
    const query = uni.createSelectorQuery().in(instance?.proxy)
    query.select('.hero-order-strip-scroll').boundingClientRect()
    query.selectAll('.hero-order-avatar-item').boundingClientRect()
    query.exec((res) => {
      const viewportRect = Array.isArray(res) ? res[0] : null
      const itemRects = Array.isArray(res?.[1]) ? res[1] : []
      heroOrderStripViewportWidth.value = Number(viewportRect?.width || 0)
      const first = itemRects[0]
      const second = itemRects[1]
      heroOrderItemWidth.value = Number(first?.width || 0)
      if (first && second) {
        const gap = Number((second.left || 0) - (first.left || 0) - (first.width || 0))
        heroOrderItemGap.value = gap > 0 ? gap : 0
      } else {
        heroOrderItemGap.value = 0
      }
    })
  })
}

function onHeroOrderStripScroll(e) {
  heroOrderStripScrollLeft.value = Number(e?.detail?.scrollLeft || 0)
}

function selectHeroOrder(itemID) {
  const id = Number(itemID || 0)
  if (!id) return
  selectedOrderId.value = id
}

function shiftSelectedHeroOrder(offset) {
  const orders = heroOrderStripOrders.value || []
  if (!orders.length) return
  const currentId = Number(selectedOrderId.value || 0)
  const currentIndex = orders.findIndex((row) => Number(row?.submission_item_id || 0) === currentId)
  const baseIndex = currentIndex >= 0 ? currentIndex : 0
  const targetIndex = baseIndex + Number(offset || 0)
  if (targetIndex < 0 || targetIndex >= orders.length) return
  selectedOrderId.value = Number(orders[targetIndex]?.submission_item_id || 0)
}

function selectPrevHeroOrder() {
  shiftSelectedHeroOrder(-1)
}

function selectNextHeroOrder() {
  shiftSelectedHeroOrder(1)
}

function resetFoldScrollTrack() {
  foldTrackDirection = ''
  foldTrackStartAt = 0
}

function clearHeroAnimTimer() {
  if (!heroAnimTimer) return
  clearTimeout(heroAnimTimer)
  heroAnimTimer = 0
}

function setHeroCollapsed(nextValue) {
  const target = !!nextValue
  if (heroCollapsed.value === target) return true
  if (heroAnimating.value) return false
  heroAnimating.value = true
  heroCollapsed.value = target
  clearHeroAnimTimer()
  heroAnimTimer = setTimeout(() => {
    heroAnimating.value = false
    heroAnimTimer = 0
  }, 340)
  return true
}

function updateHeroCollapseByScroll(nextTop, source = 'page') {
  if (heroAnimating.value) return
  const top = Number(nextTop || 0)
  const isCalendar = source === 'calendar'
  const prev = isCalendar ? Number(lastCalendarScrollTop || 0) : Number(lastPageScrollTop || 0)
  if (isCalendar) {
    lastCalendarScrollTop = top
  } else {
    lastPageScrollTop = top
  }
  const delta = top - prev
  if (Math.abs(delta) < 0.5) return
  const direction = delta > 0 ? 'up' : 'down'
  const now = Date.now()
  if (direction !== foldTrackDirection) {
    foldTrackDirection = direction
    foldTrackStartAt = now
    return
  }
  const holdMs = now - Number(foldTrackStartAt || 0)
  if (direction === 'up' && !heroCollapsed.value && holdMs >= 800) {
    if (setHeroCollapsed(true)) resetFoldScrollTrack()
    return
  }
  if (direction === 'down' && heroCollapsed.value && holdMs >= 1200) {
    if (setHeroCollapsed(false)) resetFoldScrollTrack()
  }
}

function onCalendarInnerScroll(scrollValue) {
  updateHeroCollapseByScroll(scrollValue, 'calendar')
}

function getTouchPoint(event) {
  return event?.touches?.[0] || event?.changedTouches?.[0] || null
}

function resolveTouchXY(event) {
  const touch = getTouchPoint(event)
  const detail = event?.detail || {}
  const rawClientX = Number(
    touch?.clientX ??
    touch?.x ??
    detail?.clientX ??
    detail?.x ??
    NaN
  )
  const rawClientY = Number(
    touch?.clientY ??
    touch?.y ??
    detail?.clientY ??
    detail?.y ??
    NaN
  )
  const rawPageX = Number(
    touch?.pageX ??
    detail?.pageX ??
    NaN
  )
  const rawPageY = Number(
    touch?.pageY ??
    detail?.pageY ??
    NaN
  )
  const pageOffsetX = (typeof window !== 'undefined' && Number.isFinite(Number(window.pageXOffset))) ? Number(window.pageXOffset) : 0
  const pageOffsetY = (typeof window !== 'undefined' && Number.isFinite(Number(window.pageYOffset))) ? Number(window.pageYOffset) : 0
  const x = Number.isFinite(rawClientX)
    ? rawClientX
    : (Number.isFinite(rawPageX) ? rawPageX - pageOffsetX : 0)
  const y = Number.isFinite(rawClientY)
    ? rawClientY
    : (Number.isFinite(rawPageY) ? rawPageY - pageOffsetY : 0)
  return {
    x: Number.isFinite(x) ? x : 0,
    y: Number.isFinite(y) ? y : 0,
    touch,
  }
}

function clearSelectedDragMorphTimer() {
  if (!selectedDragMorphTimer) return
  clearTimeout(selectedDragMorphTimer)
  selectedDragMorphTimer = 0
}

function unbindSelectedDragGlobal() {
  if (!selectedDragGlobalBound || typeof window === 'undefined') return
  if (selectedDragMoveHandler) {
    window.removeEventListener('touchmove', selectedDragMoveHandler)
  }
  if (selectedDragEndHandler) {
    window.removeEventListener('touchend', selectedDragEndHandler)
    window.removeEventListener('touchcancel', selectedDragEndHandler)
  }
  selectedDragGlobalBound = false
  selectedDragMoveHandler = null
  selectedDragEndHandler = null
}

function moveSelectedDragGhostToTouch(point) {
  const x = Number(point?.x || 0)
  const y = Number(point?.y || 0)
  if (!x && !y) return
  const defaultSize = Number(selectedDragGhostCircleSize.value || 0)
  const width = selectedDragGhostMorphing.value
    ? defaultSize
    : Number(selectedDragGhostWidth.value || defaultSize)
  const height = selectedDragGhostMorphing.value
    ? defaultSize
    : Number(selectedDragGhostHeight.value || defaultSize)
  selectedDragGhostLeft.value = x - width / 2 + selectedDragTouchOffsetX
  selectedDragGhostTop.value = y - height / 2 + selectedDragTouchOffsetY
}

function bindSelectedDragGlobal() {
  if (selectedDragGlobalBound || typeof window === 'undefined') return
  selectedDragMoveHandler = (e) => {
    const point = resolveTouchXY(e)
    if ((!point.x && !point.y) || !selectedDragGhostVisible.value) return
    selectedDragGhostMorphing.value = true
    const size = Number(selectedDragGhostCircleSize.value || 0)
    selectedDragGhostWidth.value = size
    selectedDragGhostHeight.value = size
    moveSelectedDragGhostToTouch(point)
    const now = Date.now()
    if (now - selectedDragLastMoveLogAt > 180) {
      selectedDragLastMoveLogAt = now
      console.log('[schedule-drag] move', {
        x: Math.round(point.x),
        y: Math.round(point.y),
        left: Math.round(selectedDragGhostLeft.value),
        top: Math.round(selectedDragGhostTop.value),
      })
    }
    if (typeof e.preventDefault === 'function') e.preventDefault()
  }
  selectedDragEndHandler = () => {
    if (!selectedDragGhostVisible.value && !selectedDragPressing.value) return
    finishSelectedDragVisual()
  }
  window.addEventListener('touchmove', selectedDragMoveHandler, { passive: false })
  window.addEventListener('touchend', selectedDragEndHandler, { passive: false })
  window.addEventListener('touchcancel', selectedDragEndHandler, { passive: false })
  selectedDragGlobalBound = true
}

function finishSelectedDragVisual() {
  selectedDragSession += 1
  selectedDragPressing.value = false
  selectedDragGhostVisible.value = false
  selectedDragGhostMorphing.value = false
  selectedDragGhostWidth.value = 0
  selectedDragGhostHeight.value = 0
  selectedDragGhostLeft.value = -9999
  selectedDragGhostTop.value = -9999
  clearSelectedDragMorphTimer()
  unbindSelectedDragGlobal()
}

function startSelectedDragVisual(event) {
  const startPoint = resolveTouchXY(event)
  const startTouchX = Number(startPoint.x || 0)
  const startTouchY = Number(startPoint.y || 0)
  const hasStartTouch = startTouchX > 0 || startTouchY > 0
  const circleSize = Math.max(40, Math.round(upxToPx(100) || 52))
  const startWidth = Math.round(circleSize * 1.75)
  const startHeight = Math.round(circleSize * 1.3)
  selectedDragSession += 1
  const session = selectedDragSession
  selectedDragLastMoveLogAt = 0
  console.log('[schedule-drag] start', {
    hasStartTouch,
    startTouchX: Math.round(startTouchX),
    startTouchY: Math.round(startTouchY),
    rawTouch: startPoint.touch || null,
    rawDetail: event?.detail || null,
  })
  selectedDragGhostCircleSize.value = circleSize
  selectedDragPressing.value = true
  selectedDragGhostVisible.value = true
  selectedDragGhostMorphing.value = false
  selectedDragGhostWidth.value = startWidth
  selectedDragGhostHeight.value = startHeight
  if (hasStartTouch) {
    selectedDragGhostLeft.value = startTouchX - startWidth / 2 + selectedDragTouchOffsetX
    selectedDragGhostTop.value = startTouchY - startHeight / 2 + selectedDragTouchOffsetY
  }
  bindSelectedDragGlobal()
  clearSelectedDragMorphTimer()
  selectedDragMorphTimer = setTimeout(() => {
    if (session !== selectedDragSession || !selectedDragGhostVisible.value) return
    selectedDragGhostMorphing.value = true
    selectedDragGhostWidth.value = circleSize
    selectedDragGhostHeight.value = circleSize
    if (hasStartTouch) {
      selectedDragGhostLeft.value = startTouchX - circleSize / 2 + selectedDragTouchOffsetX
      selectedDragGhostTop.value = startTouchY - circleSize / 2 + selectedDragTouchOffsetY
    }
    console.log('[schedule-drag] morph', {
      left: Math.round(selectedDragGhostLeft.value),
      top: Math.round(selectedDragGhostTop.value),
      width: Math.round(selectedDragGhostWidth.value),
      height: Math.round(selectedDragGhostHeight.value),
    })
  }, 24)
}

function startSelectedDrag(event) {
  const row = selectedOrder.value
  if (!row) {
    uni.showToast({ title: '请先选择订单', icon: 'none' })
    return
  }
  const itemID = Number(row?.submission_item_id || 0)
  if (!itemID) {
    uni.showToast({ title: '订单参数异常', icon: 'none' })
    return
  }
  const ok = scheduleCalendarRef.value?.startExternalPlaceDrag?.(itemID, event)
  if (!ok) {
    uni.showToast({ title: '拖拽未启动，请重试', icon: 'none' })
    finishSelectedDragVisual()
    return
  }
  startSelectedDragVisual(event)
}

function startSelectedDropDown() {
  const row = selectedOrder.value
  if (!row) {
    uni.showToast({ title: '请先选择订单', icon: 'none' })
    return
  }
  const itemID = Number(row?.submission_item_id || 0)
  if (!itemID) {
    uni.showToast({ title: '订单参数异常', icon: 'none' })
    return
  }
  scheduleCalendarRef.value?.beginQuickPlace?.(itemID)
  scheduleCalendarRef.value?.focusSelectedOrderCalendar?.()
  uni.showToast({ title: '点日历日期可放置该订单', icon: 'none' })
}

function goBack() {
  uni.navigateBack({ delta: 1 })
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

function normalizePeriodOptionRows(list) {
  if (!Array.isArray(list)) return []
  const rows = list.map((row) => ({
    submissionId: Number(row?.submission_id || row?.submissionId || 0),
    itemCount: Number(row?.item_count || row?.itemCount || 0),
    createdAt: Number(row?.created_at || row?.createdAt || 0),
  })).filter((row) => row.submissionId > 0 && row.itemCount > 0)
  return rows.sort((a, b) => {
    const aTime = Number(a?.createdAt || 0)
    const bTime = Number(b?.createdAt || 0)
    if (aTime && bTime && aTime !== bTime) return bTime - aTime
    return Number(b?.submissionId || 0) - Number(a?.submissionId || 0)
  })
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
    const scopeSubmissionID = Number(selectedSubmissionIdFilter.value || 0)
    const requestData = {
      plan_id: planId.value,
    }
    if (scopeSubmissionID > 0) {
      requestData.submission_id = scopeSubmissionID
    }
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/schedule/board`,
      method: 'GET',
      header: { Authorization: token },
      data: requestData,
    })
    const body = res?.data || {}
    if (String(body.status).toLowerCase() !== 'success') {
      throw new Error(body.msg || '加载失败')
    }
    const data = body?.data || {}
    orderType.value = Number(data?.order_type || 0)
    defaultDurationDays.value = Number(data?.default_duration_days || 7) || 7
    today.value = String(data?.today || '').trim()
    periodOptionRows.value = normalizePeriodOptionRows(data?.period_options || data?.periodOptions || [])
    allOrders.value = normalizeOrders(data?.items || [])
    savedBoardSignature.value = buildScheduleBoardSignature(allOrders.value)
    const hasSelected = allOrders.value.some((row) => Number(row?.submission_item_id || 0) === Number(selectedOrderId.value || 0))
    if ((!selectedOrderId.value || !hasSelected) && allOrders.value.length) {
      selectedOrderId.value = Number(allOrders.value[0]?.submission_item_id || 0)
    }
    measureHeroOrderStripViewport()
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

function setSelectedUrgent(checked) {
  const hasSelected = !!selectedOrder.value
  if (!hasSelected) {
    uni.showToast({ title: '请先选择一个订单', icon: 'none' })
    return
  }
  updateSelectedOrderField('is_urgent', checked)
  if (!checked) {
    updateSelectedOrderField('urgent_mode', 'normal')
    updateSelectedOrderField('urgent_reduce_days', 0)
    return uni.showToast({ title: '已切换为普通订单', icon: 'none' })
  }
  const type = Number(orderType.value || 0)
  if (type === 2) {
    updateSelectedOrderField('urgent_mode', 'advance')
    updateSelectedOrderField('urgent_reduce_days', 0)
    return uni.showToast({ title: '已切换为加急订单', icon: 'none' })
  }
  updateSelectedOrderField('urgent_mode', 'advance_compress')
  const prevReduce = Number(selectedOrder.value?.urgent_reduce_days || 0)
  updateSelectedOrderField('urgent_reduce_days', prevReduce > 0 ? prevReduce : 1)
  uni.showToast({ title: '已切换为加急订单', icon: 'none' })
}

function moveSelectedSequence(offset) {
  const current = selectedOrder.value
  if (!current) return
  const currentId = Number(current.submission_item_id || 0)
  const ordered = [...heroOrderStripOrders.value]
  if (ordered.length <= 1) {
    uni.showToast({ title: '当前范围只有1个订单', icon: 'none' })
    return
  }
  const index = ordered.findIndex((row) => Number(row.submission_item_id || 0) === currentId)
  const targetIndex = index + Number(offset || 0)
  if (index < 0 || targetIndex < 0 || targetIndex >= ordered.length) {
    uni.showToast({ title: '已经到头了', icon: 'none' })
    return
  }
  const target = ordered[targetIndex]
  const currentStart = normalizeDateText(current?.start_date || '')
  const currentEnd = normalizeDateText(current?.end_date || '')
  const currentDuration = Number(current?.duration_days || 0)
  const targetStart = normalizeDateText(target?.start_date || '')
  const targetEnd = normalizeDateText(target?.end_date || '')
  const targetDuration = Number(target?.duration_days || 0)

  if (!currentStart && !currentEnd && !targetStart && !targetEnd) {
    uni.showToast({ title: '这两单都还未排期', icon: 'none' })
    return
  }

  allOrders.value = sortOrdersForBoard(allOrders.value.map((row) => {
    const rowId = Number(row.submission_item_id || 0)
    if (rowId === currentId) {
      return {
        ...row,
        start_date: targetStart,
        end_date: targetEnd,
        duration_days: targetDuration,
        schedule_source: 'manual',
      }
    }
    if (rowId === Number(target.submission_item_id || 0)) {
      return {
        ...row,
        start_date: currentStart,
        end_date: currentEnd,
        duration_days: currentDuration,
        schedule_source: 'manual',
      }
    }
    return row
  }))
  uni.showToast({ title: Number(offset || 0) < 0 ? '已与前一单对调日期' : '已与后一单对调日期', icon: 'none' })
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

function normalizeFixedArrangeDays(raw) {
  const n = Number(String(raw ?? '').replace(/[^\d]/g, ''))
  if (!Number.isFinite(n) || n <= 0) return 7
  if (n > 365) return 365
  return Math.floor(n)
}

function onFixedArrangeDaysInput(e) {
  const value = String(e?.detail?.value || '').replace(/[^\d]/g, '').slice(0, 3)
  fixedArrangeDaysInput.value = value || ''
}

function openAutoArrangePopup() {
  fixedArrangeDaysInput.value = String(normalizeFixedArrangeDays(fixedArrangeDaysInput.value))
  autoArrangePopupRef.value?.open?.()
}

function closeAutoArrangePopup() {
  autoArrangePopupRef.value?.close?.()
}

async function triggerFixedDurationAutoArrange() {
  const days = normalizeFixedArrangeDays(fixedArrangeDaysInput.value)
  fixedArrangeDaysInput.value = String(days)
  closeAutoArrangePopup()
  await autoArrangeBoard({
    mode: 'fixed_duration',
    duration_days: days,
  })
}

async function triggerAverageAutoArrange() {
  closeAutoArrangePopup()
  await autoArrangeBoard({
    mode: 'average_free_cycle',
  })
}

async function autoArrangeBoard(options = {}) {
  if (autoArranging.value) return
  const token = ensureLoginToken()
  if (!token) return
  autoArranging.value = true
  uni.showLoading({ title: '自动排单中' })
  try {
    const payload = {
      plan_id: planId.value,
      anchor_date: today.value || todayLabel.value,
    }
    const scopeSubmissionID = Number(selectedSubmissionIdFilter.value || 0)
    if (scopeSubmissionID > 0) {
      payload.submission_id = scopeSubmissionID
    }
    const mode = String(options?.mode || '').trim()
    if (mode) payload.mode = mode
    const durationDays = Number(options?.duration_days || 0)
    if (durationDays > 0) payload.duration_days = durationDays
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/schedule/board/auto-arrange`,
      method: 'POST',
      header: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      data: payload,
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
  if (!silent && !hasPendingChanges.value) {
    uni.showToast({ title: '当前没有待保存内容', icon: 'none' })
    return
  }
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
    savedBoardSignature.value = buildScheduleBoardSignature(allOrders.value)
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

async function selectPeriodOption(value) {
  selectedPeriodValue.value = String(value || 'all')
  closePeriodPopup()
  await fetchBoard()
}

function openActionPopup() {
  actionPopupRef.value?.open?.()
}

function closeActionPopup() {
  actionPopupRef.value?.close?.()
}

function ensureSelectedForMenuAction() {
  if (selectedOrder.value) return true
  uni.showToast({ title: '请先选择一个订单', icon: 'none' })
  return false
}

async function handleMenuAction(type) {
  closeActionPopup()
  try {
    if (type === 'auto') {
      if (!visibleOrders.value.length) {
        uni.showToast({ title: '当前范围没有可排订单', icon: 'none' })
        return
      }
      if (Number(orderType.value || 0) === 5) {
        setTimeout(() => {
          openAutoArrangePopup()
        }, 120)
        return
      }
      await autoArrangeBoard()
      return
    }
    if (type === 'toggleUrgent') {
      if (!ensureSelectedForMenuAction()) return
      setSelectedUrgent(!selectedOrder.value?.is_urgent)
      return
    }
    if (type === 'movePrev') {
      if (!ensureSelectedForMenuAction()) return
      moveSelectedSequence(-1)
      return
    }
    if (type === 'moveNext') {
      if (!ensureSelectedForMenuAction()) return
      moveSelectedSequence(1)
      return
    }
    if (type === 'clear') {
      if (!ensureSelectedForMenuAction()) return
      clearSelectedSchedule()
    }
  } catch (e) {
    const msg = String(e?.message || '').trim()
    if (msg) {
      uni.showToast({ title: msg, icon: 'none' })
      return
    }
    uni.showToast({ title: '操作失败，请稍后重试', icon: 'none' })
  }
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

watch(
  () => heroOrderStripOrders.value.length,
  () => {
    heroOrderStripScrollLeft.value = 0
    measureHeroOrderStripViewport()
  },
  { immediate: true }
)

onLoad((options) => {
  planId.value = Number(options?.plan_id || 0)
  fetchBoard()
})

onShow(() => {
  resetFoldScrollTrack()
  lastPageScrollTop = 0
  lastCalendarScrollTop = 0
  if (planId.value > 0) fetchBoard()
})

onPageScroll((e) => {
  const top = Number(e?.scrollTop || 0)
  scrollTop.value = top
  updateHeroCollapseByScroll(top, 'page')
})

onMounted(() => {
  measureHeroOrderStripViewport()
})

onBeforeUnmount(() => {
  resetFoldScrollTrack()
  clearHeroAnimTimer()
  heroAnimating.value = false
  finishSelectedDragVisual()
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
  --btn-pastel-blue: #bfefff;
  --btn-pastel-yellow: #f8eeb7;
  --btn-pastel-purple: #e7dcff;
  --btn-pastel-green: #bef2dc;
  --btn-pastel-text: #253246;
  min-height: 100vh;
  width: 100%;
  max-width: 100vw;
  background: linear-gradient(180deg, #f8f8f8 0%, #f4f7fb 42%, #f6f8fb 100%);
  padding: 22rpx;
  box-sizing: border-box;
  overflow-x: hidden;
}

.schedule-board-body {
  min-height: 100vh;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

.nav-back-pill {
  margin-left: 14rpx;
  width: 68rpx;
  height: 68rpx;
  border-radius: 999rpx;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: none;
}

.board-content {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  width: 100%;
  max-width: 100%;
  overflow: visible;
  overflow-x: hidden;
}

.hero-card {
  border-radius: 22rpx;
  background: linear-gradient(160deg, #ffffff 0%, #f9fdff 100%);
  box-shadow: 0 12rpx 30rpx rgba(76, 104, 140, 0.08);
  padding: 24rpx;
  max-width: 100%;
  box-sizing: border-box;
  transition: padding 0.22s ease;
}

.hero-card.collapsed {
  padding: 16rpx;
}

.hero-card.animating {
  overflow: hidden;
}

.hero-fold-morph-enter-active,
.hero-fold-morph-leave-active {
  transition:
    opacity 0.34s cubic-bezier(0.28, 0.11, 0.32, 1),
    transform 0.34s cubic-bezier(0.22, 1, 0.36, 1),
    filter 0.34s ease;
  transform-origin: 50% 0%;
}

.hero-fold-morph-leave-from {
  opacity: 1;
  transform: translate3d(0, 0, 0) scale(1);
  filter: blur(0) saturate(1);
}

.hero-fold-morph-leave-to {
  opacity: 0;
  transform: translate3d(-10rpx, -6rpx, 0) scale(0.72);
  filter: blur(3px) saturate(0.92);
}

.hero-fold-morph-enter-from {
  opacity: 0;
  transform: translate3d(-10rpx, -6rpx, 0) scale(0.72);
  filter: blur(3px) saturate(0.92);
}

.hero-fold-morph-enter-to {
  opacity: 1;
  transform: translate3d(0, 0, 0) scale(1);
  filter: blur(0) saturate(1);
}

.hero-fold-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.hero-fold-cover-wrap {
  width: 92rpx;
  height: 138rpx;
  flex-shrink: 0;
  border-radius: 20rpx;
  overflow: hidden;
  background: #dee5ef;
}

.hero-fold-cover {
  width: 100%;
  height: 100%;
  display: block;
  background: #dce5ef;
}

.hero-fold-cover.is-drag-pressing {
  box-shadow: inset 0 0 0 4rpx #ffa4ce;
}

.hero-fold-cover-placeholder {
  background: linear-gradient(145deg, #d8dee8 0%, #edf2f8 100%);
}

.hero-fold-actions {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8rpx;
  overflow-x: auto;
  overflow-y: visible;
  white-space: nowrap;
  padding-top: 16rpx;
  margin-top: -16rpx;
  padding-bottom: 4rpx;
}

.hero-fold-btn,
.hero-fold-save {
  flex-shrink: 0;
  min-width: 82rpx;
  height: 58rpx;
  border-radius: 999rpx;
  padding: 0 14rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  line-height: 1;
  color: #2a374a;
  background: #e8edf5;
  box-sizing: border-box;
}

.hero-fold-btn.period {
  min-width: 170rpx;
  background: #dff4ff;
}

.hero-fold-btn.menu {
  background: #cdeefe;
}

.hero-fold-btn.nav {
  background: #ebeff5;
}

.hero-fold-save {
  min-width: 96rpx;
  position: relative;
  overflow: visible;
  padding-right: 20rpx;
}

.hero-fold-save.pending {
  background: var(--btn-pastel-yellow);
  color: var(--btn-pastel-text);
}

.hero-fold-save.idle {
  background: #e2e6ee;
  color: #7e8899;
}

.hero-fold-save.disabled {
  background: #ecf0f5;
  color: #a1acbd;
}

.hero-fold-save-text {
  font-size: 22rpx;
  font-weight: 700;
  line-height: 1;
}

.hero-actions {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 14rpx;
  width: 100%;
  flex-shrink: 1;
}

.hero-action-btns {
  display: flex;
  align-items: center;
  gap: 10rpx;
  width: 100%;
}

.hero-action-btns .ghost-btn,
.hero-action-btns .save-btn {
  flex: 1;
  width: auto;
  min-width: 0;
}

.hero-period-trigger {
  min-height: 74rpx;
  padding: 8rpx 10rpx 8rpx 16rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
  background: #dff4ff;
  box-shadow:
    inset 0 0 0 3rpx rgba(33, 42, 54, 0.92),
    0 6rpx 14rpx rgba(114, 128, 154, 0.14);
  box-sizing: border-box;
}

.hero-period-trigger-main {
  display: inline-flex;
  align-items: center;
  gap: 10rpx;
  min-width: 0;
}

.hero-period-trigger-text {
  font-size: 26rpx;
  color: #1f2c3d;
  font-weight: 600;
}

.hero-period-trigger-compact {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  margin-top: 2rpx;
}

.hero-period-trigger-arrow {
  width: 46rpx;
  height: 46rpx;
  border-radius: 999rpx;
  background: #111721;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.hero-focus-row {
  margin-top: 0;
  display: flex;
  align-items: flex-start;
  gap: 18rpx;
}

.hero-focus-cover-wrap {
  width: 246rpx;
  position: relative;
  flex-shrink: 0;
}

.hero-focus-cover {
  width: 100%;
  height: 369rpx;
  border-radius: 44rpx;
  background: #dce5ef;
  box-shadow: none;
}

.hero-focus-cover.is-drag-pressing {
  box-shadow: inset 0 0 0 4rpx #ffa4ce;
  transform: scale(0.99);
}

.hero-focus-cover-placeholder {
  background: linear-gradient(145deg, #d8dee8 0%, #edf2f8 100%);
}

.hero-drop-btn {
  position: absolute;
  left: 50%;
  bottom: -18rpx;
  transform: translateX(-50%);
  min-width: 154rpx;
  height: 46rpx;
  border-radius: 999rpx;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  box-shadow: none;
  padding: 0 12rpx;
  z-index: 3;
}

.hero-drop-btn-text {
  font-size: 28rpx;
  color: #111722;
  line-height: 1;
}

.hero-drop-btn-icon {
  width: 24rpx;
  height: 24rpx;
  flex-shrink: 0;
}

.hero-focus-cover,
.hero-drop-btn {
  transition: transform 0.16s ease;
}

.hero-focus-cover:active {
  transform: translateY(2rpx) scale(0.99);
}

.hero-drop-btn:active {
  transform: translateX(-50%) translateY(2rpx) scale(0.99);
}

.selected-drag-ghost {
  position: fixed;
  left: 0;
  top: 0;
  pointer-events: none;
  z-index: 9998;
  overflow: hidden;
  background: #e2ebf5;
  box-shadow:
    inset 0 0 0 4rpx #ffa4ce,
    0 10rpx 24rpx rgba(44, 59, 80, 0.24);
  transition:
    left 0.05s linear,
    top 0.05s linear,
    width 0.2s cubic-bezier(0.2, 0.8, 0.2, 1),
    height 0.2s cubic-bezier(0.2, 0.8, 0.2, 1),
    border-radius 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
  will-change: left, top, width, height, border-radius;
}

.selected-drag-ghost.morphing {
  box-shadow:
    inset 0 0 0 4rpx #ffa4ce,
    0 8rpx 18rpx rgba(255, 132, 190, 0.28);
}

.selected-drag-ghost-image {
  width: 100%;
  height: 100%;
  display: block;
  filter: blur(16px) saturate(0.88) brightness(1.04);
  transition: filter 0.22s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.selected-drag-ghost-placeholder {
  background: linear-gradient(145deg, #d7dce8 0%, #ecf2f8 100%);
}

.selected-drag-ghost.morphing .selected-drag-ghost-image {
  filter: blur(0) saturate(1) brightness(1);
}

.hero-focus-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  padding-top: 4rpx;
}

.hero-focus-range {
  font-size: 24rpx;
  color: #1f2937;
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.2rpx;
}

.hero-order-strip-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
  min-width: 0;
}

.hero-order-strip-scroll {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
}

:deep(.hero-order-strip-scroll .uni-scroll-view-content) {
  padding: 10rpx 0 18rpx;
  padding-left: 10rpx;
  box-sizing: border-box;
}

.hero-order-strip-inner {
  display: inline-flex;
  align-items: center;
  gap: 14rpx;
  padding-right: 10rpx;
}

.hero-order-avatar-item {
  width: 84rpx;
  height: 84rpx;
  flex-shrink: 0;
  position: relative;
}

.hero-order-avatar {
  width: 84rpx;
  height: 84rpx;
  border-radius: 50%;
  background: #dce4ee;
  box-shadow: 0 4rpx 12rpx rgba(60, 74, 95, 0.12);
}

.hero-order-avatar-placeholder {
  background: linear-gradient(145deg, #d7dce8 0%, #eef3f8 100%);
}

.hero-order-avatar-item.active .hero-order-avatar {
  box-shadow: 0 0 0 5rpx rgba(120, 218, 245, 0.42), 0 4rpx 12rpx rgba(45, 80, 110, 0.2);
}

.hero-order-tags {
  position: absolute;
  left: 50%;
  bottom: -14rpx;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.hero-order-tag {
  min-width: 48rpx;
  height: 26rpx;
  border-radius: 999rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18rpx;
  padding: 0 8rpx;
  line-height: 1;
}

.hero-order-tag-wait-ship {
  background: #c6ccd8;
  color: #ffffff;
  box-shadow: 0 3rpx 8rpx rgba(121, 131, 148, 0.22);
}

.hero-order-tag-unscheduled {
  background: #ff7878;
  color: #000000;
  box-shadow: 0 3rpx 8rpx rgba(255, 120, 120, 0.26);
}

.hero-overflow-tip {
  flex-shrink: 0;
  min-width: 72rpx;
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4rpx;
}

.hero-overflow-ellipsis {
  width: 32rpx;
  height: 14rpx;
}

.hero-overflow-count {
  font-size: 34rpx;
  color: #4a5366;
  line-height: 1;
}

.hero-summary-row {
  margin-top: 2rpx;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12rpx;
}

.hero-summary-item {
  border-radius: 16rpx;
  padding: 14rpx 12rpx;
  background: rgba(255, 255, 255, 0.8);
}

.save-btn {
  margin: 0;
  width: 164rpx;
  height: 70rpx;
  line-height: 70rpx;
  border-radius: 999rpx;
  border: none;
  background: #e2e6ee;
  color: #7e8899;
  font-size: 24rpx;
  font-weight: 600;
  box-shadow: none;
  position: relative;
  overflow: visible;
}

.save-btn::after {
  border: none;
}

.save-btn-text {
  font-size: 24rpx;
  font-weight: 700;
  line-height: 1;
}

.save-btn.pending {
  background: var(--btn-pastel-yellow);
  color: var(--btn-pastel-text);
  box-shadow: 0 6rpx 14rpx rgba(151, 161, 180, 0.18);
}

.save-btn.idle {
  background: #e2e6ee;
  color: #7e8899;
  box-shadow: none;
}

.save-btn-attention-mark {
  position: absolute;
  right: -5rpx;
  top: -20rpx;
  display: inline-block;
  font-size: 52rpx;
  font-weight: 900;
  line-height: 1;
  color: #ffa4ce;
  -webkit-text-fill-color: #ffa4ce;
  text-shadow: 0 0 10rpx rgba(255, 164, 206, 0.45);
  transform-origin: 50% 82%;
  animation: save-btn-attention-wobble 1s ease-in-out infinite;
}

.hero-fold-save .save-btn-attention-mark {
  right: 4rpx;
  top: 2rpx;
  font-size: 38rpx;
}

@keyframes save-btn-attention-wobble {
  0% {
    transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
  }
  10% {
    transform: translate3d(-1rpx, 0, 0) rotate(-18deg) scale(1.02);
  }
  20% {
    transform: translate3d(1rpx, 0, 0) rotate(14deg) scale(1.02);
  }
  30% {
    transform: translate3d(-1rpx, 0, 0) rotate(-11deg) scale(1.01);
  }
  40% {
    transform: translate3d(1rpx, 0, 0) rotate(8deg) scale(1.01);
  }
  50% {
    transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
  }
  100% {
    transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
  }
}

.ghost-btn {
  margin: 0;
  min-width: 188rpx;
  height: 70rpx;
  line-height: 70rpx;
  border-radius: 999rpx;
  border: none;
  background: var(--btn-pastel-blue);
  color: var(--btn-pastel-text);
  font-size: 24rpx;
  font-weight: 600;
  box-shadow: 0 6rpx 14rpx rgba(151, 161, 180, 0.14);
}

.menu-btn {
  min-width: 0;
}

.ghost-btn::after {
  border: none;
}

.save-btn.disabled {
  background: #ecf0f5;
  color: #a1acbd;
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
  font-size: 26rpx;
  font-weight: 700;
  color: #1f2937;
}

.calendar-card {
  border-radius: 22rpx;
  background: var(--surface);
  box-shadow: 0 10rpx 24rpx rgba(15, 23, 42, 0.05);
  padding: 20rpx;
  max-width: 100%;
  box-sizing: border-box;
  overflow: visible;
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

.period-popup-sheet {
  width: 100%;
  max-width: 100vw;
  border-radius: 24rpx 24rpx 0 0;
  background: #ffffff;
  padding: 18rpx 20rpx calc(24rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -12rpx 24rpx rgba(15, 23, 42, 0.08);
  box-sizing: border-box;
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
  background: var(--btn-pastel-blue);
  box-shadow: inset 0 0 0 2rpx rgba(80, 140, 170, 0.12);
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

.action-menu-list {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.action-menu-item {
  border-radius: 16rpx;
  padding: 16rpx;
  background: #ffffff;
  box-shadow: 0 6rpx 14rpx rgba(96, 110, 131, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10rpx;
}

.action-menu-main {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  min-width: 0;
}

.action-menu-title {
  font-size: 28rpx;
  color: #1f2937;
}

.action-menu-desc {
  font-size: 20rpx;
  color: #8a94a5;
}

.action-menu-grid {
  margin-top: 4rpx;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10rpx;
}

.action-menu-chip {
  height: 64rpx;
  border-radius: 999rpx;
  background: #f4f6f8;
  color: #1f2937;
  font-size: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auto-arrange-popup-sheet {
  padding-bottom: calc(28rpx + env(safe-area-inset-bottom));
}

.auto-arrange-panel {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.auto-arrange-option {
  border-radius: 18rpx;
  background: #f7f9fc;
  padding: 16rpx;
  box-shadow: inset 0 0 0 2rpx rgba(120, 218, 245, 0.08);
}

.auto-arrange-option-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.auto-arrange-option-title {
  font-size: 28rpx;
  color: #1f2937;
}

.auto-arrange-option-sub {
  font-size: 21rpx;
  color: #7d8898;
}

.auto-arrange-days-row {
  margin-top: 14rpx;
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.auto-arrange-days-label,
.auto-arrange-days-unit {
  font-size: 23rpx;
  color: #667487;
}

.auto-arrange-days-input {
  width: 128rpx;
  height: 62rpx;
  border-radius: 14rpx;
  background: #eef2f6;
  text-align: center;
  font-size: 26rpx;
  color: #1f2937;
}

.auto-arrange-submit {
  margin-left: auto;
  min-width: 142rpx;
  height: 62rpx;
  border-radius: 999rpx;
  background: #78daf5;
  color: #1f2937;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20rpx;
  font-weight: 600;
}

.auto-arrange-submit-secondary {
  margin-top: 14rpx;
  margin-left: 0;
  width: 100%;
  background: #ecf0f5;
  color: #2a3545;
}

.foot-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  border-radius: 14rpx;
  background: #ffffff;
  padding: 14rpx 16rpx;
  max-width: 100%;
  box-sizing: border-box;
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
  max-width: 100%;
  box-sizing: border-box;
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
  --status-c0: #cdefff;
  --status-c1: #ffeabf;
  --status-c2: #d6f6e8;
  --status-c3: #efe2ff;
  --status-c4: #ffddea;
  --status-c5: #dbe8ff;
  --status-c6: #ffe7d4;
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
  border: none;
  box-shadow: none;
}

:deep(.schedule-calendar .schedule-day-cell.past) {
  background: #edf1f6;
}

:deep(.schedule-calendar .schedule-day-cell.past .day-num) {
  color: #8e9aab;
}

:deep(.schedule-calendar .schedule-day-cell.today) {
  background: #f1f9fc;
  box-shadow: none;
}

:deep(.schedule-calendar .schedule-day-cell.hover) {
  background: #edf5fb;
  box-shadow: none;
}

:deep(.schedule-calendar .selected-panel) {
  background: #ffffff;
}

:deep(.schedule-calendar .order-item.selected) {
  box-shadow: inset 0 0 0 2rpx rgba(139, 151, 168, 0.34);
}

:deep(.schedule-calendar .selected-action-chip.drag-chip) {
  background: #d9f2fb;
  color: #253246;
}

:deep(.schedule-calendar .selected-action-chip.detail-chip) {
  background: #e6eef7;
  color: #253246;
}

:deep(.schedule-calendar .selected-tip-bubble) {
  color: #253246;
  background: #e6f3fa;
}

:deep(.schedule-calendar .order-item-drag) {
  background: #e6f3fa;
  color: #253246;
}

:deep(.schedule-calendar .drag-float) {
  background: rgba(55, 65, 81, 0.92);
}

@media (max-width: 780rpx) {
  .hero-card {
    padding: 22rpx 20rpx;
  }
  .hero-actions {
    width: 100%;
  }

  .hero-action-btns {
    width: 100%;
  }

  .hero-action-btns .save-btn,
  .hero-action-btns .ghost-btn {
    width: auto;
  }
  .hero-focus-row {
    gap: 14rpx;
  }

  .hero-focus-cover-wrap {
    width: 218rpx;
  }

  .hero-focus-cover {
    height: 327rpx;
  }

  .hero-drop-btn {
    min-width: 170rpx;
    height: 42rpx;
  }

  .hero-drop-btn-text {
    font-size: 32rpx;
  }

  .hero-focus-range {
    font-size: 22rpx;
  }

  .hero-order-avatar-item,
  .hero-order-avatar {
    width: 76rpx;
    height: 76rpx;
  }

  .hero-order-strip-inner {
    gap: 12rpx;
  }

  .hero-summary-row {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8rpx;
  }

  .hero-summary-item {
    padding: 12rpx 10rpx;
  }
}
</style>
