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

      <picker-view
        v-if="mountedInPopup"
        class="picker"
        :indicator-style="indicatorStyle"
        :value="pickerIndex"
        @change="onPickerChange"
      >
        <picker-view-column>
          <view v-for="h in hours" :key="'h-'+h" class="picker-item">{{ two(h) }} 时</view>
        </picker-view-column>
        <picker-view-column>
          <view v-for="m in minutes" :key="'m-'+m" class="picker-item">{{ two(m) }} 分</view>
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
  show:       { type: Boolean, default: false },          // v-model:show
  modelValue: { type: [String, Number, Date], default: '' }, // v-model => 'HH:mm'
  title:      { type: String, default: '选择时间' },
  themeColor: { type: String, default: '#4df0ff' }        // 与日期组件色系一致
})
const emit = defineEmits(['update:modelValue','update:show','confirm','cancel'])

const popup = ref(null)
const mountedInPopup = ref(false)
const safeBottom = ref(0)

const INDICATOR_PX = 64
const indicatorStyle = `height:${INDICATOR_PX}px;`

const hours   = ref(Array.from({length:24}, (_,i)=>i))
const minutes = ref(Array.from({length:60}, (_,i)=>i))

const selH = ref(12)
const selM = ref(0)

const pickerIndex = computed(() => [
  Math.max(0, hours.value.indexOf(selH.value)),
  Math.max(0, minutes.value.indexOf(selM.value))
])

const two = (n) => (n < 10 ? '0' + n : '' + n)

function parseTime(v){
  if (v instanceof Date) return { h: v.getHours(), m: v.getMinutes() }
  if (typeof v === 'string'){
    const m = v.match(/(\d{1,2}):(\d{1,2})/)
    if (m) {
      return { h: Math.min(23, Math.max(0, +m[1])), m: Math.min(59, Math.max(0, +m[2])) }
    }
  }
  if (typeof v === 'number') {
    const d = new Date(v)
    if (!isNaN(d.getTime())) return { h: d.getHours(), m: d.getMinutes() }
  }
  return { h: 12, m: 0 }
}

function onPickerChange(e){
  const [hi, mi] = e.detail.value
  selH.value = hours.value[hi] ?? selH.value
  selM.value = minutes.value[mi] ?? selM.value
}

function onCancel(){
  emit('cancel')
  emit('update:show', false)
}
function onConfirm(){
  const out = `${two(selH.value)}:${two(selM.value)}`
  emit('update:modelValue', out)
  emit('confirm', out)
  emit('update:show', false)
}

function initByModel(){
  const t = parseTime(props.modelValue)
  selH.value = t.h
  selM.value = t.m
}

function onPopupChange(e){
  if (e.show){
    nextTick(()=>{ mountedInPopup.value = true })
  }else{
    mountedInPopup.value = false
    emit('update:show', false)
  }
}

watch(()=>props.show, async (val)=>{
  if (val){
    try {
      const wi = uni.getWindowInfo && uni.getWindowInfo()
      safeBottom.value = wi?.safeAreaInsets?.bottom || 0
    } catch { safeBottom.value = 0 }
    initByModel()
    await nextTick()
    popup.value?.open?.()
  }else{
    popup.value?.close?.()
  }
},{ immediate:true })
</script>

<style scoped>
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

.picker{
  height: 420px;
  background: #fff;
  padding: 20rpx 0;
}
.picker-item{
  height: 64px;
  line-height: 64px;
  text-align: center;
  font-size: 30rpx; color: #222;
}

.sheet-footer{
  padding: 16rpx 24rpx 24rpx;
  background: #fff;
}
.btn-confirm{
  width: 100%; height: 88rpx; line-height: 88rpx;
  border-radius: 44rpx;
  background: #4df0ff;
  color: #090a0f; font-weight: 700; font-size: 30rpx; border: none;
}
.btn-confirm::after{ border: none; }

uni-picker-view{ display:block; }
.uni-picker-view-wrapper{ height:100%; }
</style>
