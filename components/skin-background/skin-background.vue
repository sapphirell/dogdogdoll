<template>
  <view class="skin-background" :style="backgroundStyle">
    <view v-if="showStarFall" class="star-layer">
      <view
        v-for="(star, index) in stars"
        :key="index"
        class="star-item"
        :style="{
          left: star.left,
          top: star.top,
          fontSize: star.size,
          animationDuration: star.duration,
          animationDelay: star.delay,
          opacity: star.opacity,
          '--fall-dist': star.fallDist
        }"
      >
        ★
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  backgroundColor: { type: String, default: '' },
  backgroundImage: { type: String, default: '' },
  animationType: { type: String, default: '' },
  animationConfig: {
    type: Object,
    default: () => ({})
  }
})

const stars = ref([])

const backgroundStyle = computed(() => {
  const style = {
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
    backgroundSize: 'cover'
  }

  const color = String(props.backgroundColor || '').trim()
  if (color) {
    if (color.includes('gradient(')) {
      style.background = color
    } else {
      style.backgroundColor = color
    }
  }

  const image = String(props.backgroundImage || '').trim()
  if (image) {
    style.backgroundImage = `url('${image}')`
  }
  return style
})

const showStarFall = computed(() => {
  return String(props.animationType || '').toLowerCase() === 'star_fall'
})

function numCfg (key, fallback) {
  const raw = Number(props.animationConfig?.[key])
  if (!Number.isFinite(raw)) return fallback
  return raw
}

function generateStars () {
  if (!showStarFall.value) {
    stars.value = []
    return
  }

  // 对齐最初 mine 页面“星雪”实现的参数范围
  const count = Math.max(10, Math.floor(numCfg('count', 50)))
  const minSize = Math.max(8, numCfg('min_size_rpx', 20))
  const maxSize = Math.max(minSize, numCfg('max_size_rpx', 50))
  const minDuration = Math.max(4, numCfg('min_duration_s', 15))
  const maxDuration = Math.max(minDuration, numCfg('max_duration_s', 30))
  const minOpacity = Math.min(1, Math.max(0.05, numCfg('min_opacity', 0.2)))
  const maxOpacity = Math.min(1, Math.max(minOpacity, numCfg('max_opacity', 0.6)))
  const minFall = Math.max(120, numCfg('min_fall_px', 500))
  const maxFall = Math.max(minFall, numCfg('max_fall_px', 800))
  const maxDelay = Math.max(1, numCfg('max_delay_s', 10))
  const sizeScale = Math.max(0.1, numCfg('size_scale', 1.5))

  const next = []
  for (let i = 0; i < count; i++) {
    const size = (minSize + Math.random() * (maxSize - minSize)) * sizeScale
    const duration = minDuration + Math.random() * (maxDuration - minDuration)
    const delay = Math.random() * maxDelay
    const opacity = minOpacity + Math.random() * (maxOpacity - minOpacity)
    const dist = minFall + Math.random() * (maxFall - minFall)
    next.push({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: `${size.toFixed(2)}rpx`,
      duration: `${duration.toFixed(2)}s`,
      delay: `-${delay.toFixed(2)}s`,
      opacity: Number(opacity.toFixed(2)),
      fallDist: `${Math.round(dist)}px`
    })
  }
  stars.value = next
}

watch(
  () => [props.animationType, JSON.stringify(props.animationConfig || {})],
  generateStars,
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.skin-background {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.star-layer {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.star-item {
  position: absolute;
  color: #d1d5db;
  line-height: 1;
  animation-name: star-fall-rotate;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  --fall-dist: 360px;
}

@keyframes star-fall-rotate {
  0% {
    transform: translateY(-20px) rotate(0deg);
  }
  100% {
    transform: translateY(var(--fall-dist)) rotate(360deg);
  }
}
</style>
