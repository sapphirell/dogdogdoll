<template>
  <view v-if="show" class="scroll-hint" :style="cssVars">
    <view class="scroll-hint-track">
      <view class="scroll-touch-dot">
        <view class="scroll-touch-inner"></view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  active: {
    type: Boolean,
    default: true
  },
  duration: {
    type: Number,
    default: 2400
  },
  delay: {
    type: Number,
    default: 160
  },
  cycleDuration: {
    type: Number,
    default: 1100
  },
  size: {
    type: Number,
    default: 1
  },
  borderColor: {
    type: String,
    default: 'rgba(95, 103, 113, 0.66)'
  },
  outerFillColor: {
    type: String,
    default: 'rgba(171, 178, 187, 0.22)'
  },
  innerFillColor: {
    type: String,
    default: 'rgba(138, 146, 156, 0.34)'
  },
  trackColor: {
    type: String,
    default: 'rgba(161, 170, 180, 0.18)'
  }
})

const show = ref(false)
let showTimer = null
let hideTimer = null

const cssVars = computed(() => ({
  '--hint-width': `${86 * clampSize(props.size)}rpx`,
  '--hint-track-width': `${58 * clampSize(props.size)}rpx`,
  '--hint-track-height': `${170 * clampSize(props.size)}rpx`,
  '--hint-dot-size': `${52 * clampSize(props.size)}rpx`,
  '--hint-dot-offset': `${10 * clampSize(props.size)}rpx`,
  '--hint-dot-fall': `${98 * clampSize(props.size)}rpx`,
  '--hint-dot-border': `${Math.max(2.5, 3.6 * clampSize(props.size))}rpx`,
  '--hint-inner-size': `${22 * clampSize(props.size)}rpx`,
  '--hint-shadow': `${14 * clampSize(props.size)}rpx`,
  '--hint-border-color': props.borderColor,
  '--hint-outer-fill': props.outerFillColor,
  '--hint-inner-fill': props.innerFillColor,
  '--hint-track-color': props.trackColor,
  '--hint-cycle-duration': `${Math.max(800, Number(props.cycleDuration) || 1100)}ms`
}))

function clampSize(val) {
  const n = Number(val)
  if (!Number.isFinite(n)) return 1
  return Math.min(5, Math.max(0.8, n))
}

function clearTimers() {
  if (showTimer) {
    clearTimeout(showTimer)
    showTimer = null
  }
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
}

function start() {
  clearTimers()
  show.value = false
  if (!props.active) return

  const delay = Math.max(0, Number(props.delay) || 0)
  const duration = Math.max(600, Number(props.duration) || 2400)

  showTimer = setTimeout(() => {
    show.value = true
    hideTimer = setTimeout(() => {
      show.value = false
    }, duration)
  }, delay)
}

watch(
  () => props.active,
  (val) => {
    if (val) {
      start()
    } else {
      clearTimers()
      show.value = false
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  clearTimers()
})
</script>

<style scoped>
.scroll-hint {
  width: var(--hint-width);
  height: var(--hint-track-height);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  opacity: 0.95;
}

.scroll-hint-track {
  width: var(--hint-track-width);
  height: var(--hint-track-height);
  border-radius: 999rpx;
  background: var(--hint-track-color);
  position: relative;
  overflow: visible;
}

.scroll-touch-dot {
  width: var(--hint-dot-size);
  height: var(--hint-dot-size);
  border-radius: 999rpx;
  background: var(--hint-outer-fill);
  border: var(--hint-dot-border) solid var(--hint-border-color);
  box-sizing: border-box;
  box-shadow: 0 0 var(--hint-shadow) rgba(93, 101, 112, 0.18);
  position: absolute;
  left: 50%;
  bottom: var(--hint-dot-offset);
  transform: translateX(-50%) scale(0.96);
  animation: hint-dot-rise var(--hint-cycle-duration) cubic-bezier(0.24, 0.68, 0.31, 1) infinite;
}

.scroll-touch-inner {
  width: var(--hint-inner-size);
  height: var(--hint-inner-size);
  border-radius: 999rpx;
  background: var(--hint-inner-fill);
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  animation: hint-inner-pulse var(--hint-cycle-duration) ease-in-out infinite;
}

@keyframes hint-dot-rise {
  0% {
    transform: translateX(-50%) translateY(0) scale(0.92);
    opacity: 0;
  }
  12% {
    opacity: 1;
  }
  74% {
    opacity: 0.98;
  }
  100% {
    transform: translateX(-50%) translateY(calc(var(--hint-dot-fall) * -1)) scale(1);
    opacity: 0;
  }
}

@keyframes hint-inner-pulse {
  0%, 100% {
    opacity: 0.45;
    transform: translate(-50%, -50%) scale(0.92);
  }
  50% {
    opacity: 0.88;
    transform: translate(-50%, -50%) scale(1.08);
  }
}
</style>
