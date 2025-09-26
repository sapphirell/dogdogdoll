<template>
  <uni-popup
    ref="popup"
    type="bottom"
    :mask-click="true"
    @change="onPopupChange"
  >
    <view class="sheet" :style="{ paddingBottom: safeBottom + 'px' }">
      <view class="sheet-header">
        <text class="btn-cancel" @tap="onCancel">取消</text>
        <text class="sheet-title">{{ title }}</text>
      </view>

      <!-- 仅在弹出后挂载，避免初次 0 高度导致白板 -->
      <picker-view
        v-if="mountedInPopup"
        class="picker"
        :indicator-style="indicatorStyle"
        :value="pickerIndex"
        @change="onPickerChange"
      >
        <picker-view-column>
          <view v-for="y in years" :key="y" class="picker-item">{{ y }}年</view>
        </picker-view-column>
        <picker-view-column>
          <view v-for="m in months" :key="m" class="picker-item">{{ m }}月</view>
        </picker-view-column>
        <picker-view-column>
          <view v-for="d in days" :key="d" class="picker-item">{{ d }}日</view>
        </picker-view-column>
      </picker-view>

      <view class="sheet-footer">
        <button class="btn-confirm" @tap="onConfirm">选择</button>
      </view>
    </view>
  </uni-popup>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  show:        { type: Boolean, default: false },              // v-model:show
  modelValue:  { type: [String, Number, Date], default: '' },  // v-model => 'YYYY-MM-DD'
  title:       { type: String, default: '选择日期' },
  minDate:     { type: [String, Number, Date], default: '2000-01-01' },
  maxDate:     { type: [String, Number, Date], default: '2035-12-31' },
  themeColor:  { type: String, default: '#FFD84D' }            // 按钮主色（淡黄）
})
const emit = defineEmits(['update:modelValue','update:show','confirm','cancel'])

const popup = ref(null)
const mountedInPopup = ref(false)   // 打开后一帧再渲染 picker
const safeBottom = ref(0)

// 视觉：与最初版一致（大号刻度）
const PICKER_HEIGHT = 420  // px
const INDICATOR_PX  = 64   // px
const indicatorStyle = `height:${INDICATOR_PX}px;`

// 数据
const years  = ref([])
const months = ref([])
const days   = ref([])

const selY = ref(2024)
const selM = ref(9)
const selD = ref(1)

const pickerIndex = computed(() => {
  return [
    Math.max(0, years.value.indexOf(selY.value)),
    Math.max(0, months.value.indexOf(selM.value)),
    Math.max(0, days.value.indexOf(selD.value))
  ]
})

/* ===== 工具 ===== */
function toDate(v) {
  if (v instanceof Date) return isNaN(v.getTime()) ? new Date() : v
  if (typeof v === 'number') { const d = new Date(v); return isNaN(d.getTime()) ? new Date() : d }
  if (!v) return new Date()
  const m = String(v).match(/(\d{4})\D?(\d{1,2})\D?(\d{1,2})/)
  if (m) { const d = new Date(+m[1], +m[2]-1, +m[3]); return isNaN(d.getTime()) ? new Date() : d }
  return new Date()
}
const fmt = (n) => (n<10 ? '0'+n : ''+n)
function clamp(date, min, max) {
  const t = toDate(date).getTime(), mi = toDate(min).getTime(), ma = toDate(max).getTime()
  return new Date(Math.min(Math.max(t, mi), ma))
}
function lastDay(y, m) { return new Date(y, m, 0).getDate() }

const minYMD = computed(() => {
  const d = toDate(props.minDate); return { y: d.getFullYear(), m: d.getMonth()+1, d: d.getDate() }
})
const maxYMD = computed(() => {
  const d = toDate(props.maxDate); return { y: d.getFullYear(), m: d.getMonth()+1, d: d.getDate() }
})

/* ===== 构建列 ===== */
function buildYears() {
  const arr = []
  for (let y=minYMD.value.y; y<=maxYMD.value.y; y++) arr.push(y)
  years.value = arr
}
function buildMonths() {
  const arr = []
  const minM = selY.value === minYMD.value.y ? minYMD.value.m : 1
  const maxM = selY.value === maxYMD.value.y ? maxYMD.value.m : 12
  for (let m=1; m<=12; m++) if (m>=minM && m<=maxM) arr.push(m)
  months.value = arr
  if (!arr.includes(selM.value)) selM.value = arr[0]
}
function buildDays() {
  const dim  = lastDay(selY.value, selM.value)
  const minD = (selY.value===minYMD.value.y && selM.value===minYMD.value.m) ? minYMD.value.d : 1
  const maxD = (selY.value===maxYMD.value.y && selM.value===maxYMD.value.m) ? maxYMD.value.d : dim
  const arr = []
  for (let d=minD; d<=maxD; d++) arr.push(d)
  days.value = arr
  if (!arr.includes(selD.value)) selD.value = arr[0]
}

/* ===== 事件 ===== */
function onPickerChange(e) {
  const [yi, mi, di] = e.detail.value
  selY.value = years.value[yi] || selY.value
  selM.value = months.value[mi] || selM.value
  buildMonths()
  buildDays()
  selD.value = days.value[di] || selD.value
}
function onCancel() {
  emit('cancel')
  emit('update:show', false)
}
function onConfirm() {
  const dt = clamp(new Date(selY.value, selM.value-1, selD.value), props.minDate, props.maxDate)
  const out = `${dt.getFullYear()}-${fmt(dt.getMonth()+1)}-${fmt(dt.getDate())}`
  emit('update:modelValue', out)
  emit('confirm', out)
  emit('update:show', false)
}

/* ===== 打开/关闭 ===== */
function initByModel() {
  const base = clamp(props.modelValue || new Date(), props.minDate, props.maxDate)
  selY.value = base.getFullYear()
  selM.value = base.getMonth() + 1
  selD.value = base.getDate()
  buildYears(); buildMonths(); buildDays()
}
function onPopupChange(e) {
  // e.show: true/false
  if (e.show) {
    nextTick(() => { mountedInPopup.value = true })
  } else {
    mountedInPopup.value = false
	// 关键：mask 点击导致的关闭需要同步回父级的 v-model:show
	emit('update:show', false)
  }
}

watch(() => props.show, async (val) => {
  if (val) {
    try {
      const wi = uni.getWindowInfo && uni.getWindowInfo()
      safeBottom.value = wi?.safeAreaInsets?.bottom || 0
    } catch(e){ safeBottom.value = 0 }
    initByModel()
    await nextTick()
    popup.value?.open?.()
  } else {
    popup.value?.close?.()
  }
}, { immediate: true })
</script>

<style scoped>
/* —— 回归最初清爽风格 —— */
.sheet{
  width: 100vw;
  background: #fff;
  border-top-left-radius: 20rpx;
  border-top-right-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 -8rpx 24rpx rgba(0,0,0,0.04);
}
.sheet-header{
  height: 88rpx;
  display: flex; align-items: center; justify-content: center;
  position: relative;
  border-bottom: 1rpx solid #f0f0f0;
}
.btn-cancel{
  position: absolute; left: 24rpx;
  font-size: 28rpx; color: #999;
}
.sheet-title{
  font-size: 30rpx; font-weight: 700; color: #333;
}

/* 关键：picker-view 的实际高度使用 px，指示线也用 px */
.picker{
  height: 420px;             /* 与最初版一致的大高度 */
  background: #fff;
  padding: 20rpx 0;
}
.picker-item{
  height: 64px;              /* 与指示线一致，刻度更大 */
  line-height: 64px;
  text-align: center;
  font-size: 30rpx; color: #222;
}

/* 底部大号确认按钮（柔和圆角） */
.sheet-footer{
  padding: 16rpx 24rpx 24rpx;
  background: #fff;
}
.btn-confirm{
  width: 100%; height: 88rpx; line-height: 88rpx;
  border-radius: 44rpx;
  background: #FFD84D;       /* 与 props.themeColor 同色系 */
  font-weight: 700; font-size: 30rpx; border: none;
  background: #4df0ff;
  color: #090a0f;
}
.btn-confirm::after{ border: none; }

/* 兼容性：确保原生端渲染 */
uni-picker-view{ display:block; }
.uni-picker-view-wrapper{ height:100%; }
</style>
