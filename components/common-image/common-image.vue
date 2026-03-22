<template>
  <view 
    class="common-image-wrapper" 
    :class="customClass"
    :style="{ 
      width: formatSize(width), 
      height: formatSize(height), 
      borderRadius: formatSize(radius) 
    }"
    @click="onClick"
  >
    <image
      v-if="showImg"
      class="real-image"
      :class="{ 'loaded': isLoaded }"
      :src="showSrc"
      :mode="mode"
      :lazy-load="false" 
      @load="handleLoad"
      @error="handleError"
    ></image>

    <view 
      v-if="!isLoaded && !isError" 
      class="loading-placeholder"
    ></view>

    <view 
      v-if="isError" 
      class="error-placeholder"
    >
      <uni-icons type="image" size="24" color="#ccc"></uni-icons>
    </view>
  </view>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, getCurrentInstance, nextTick } from 'vue'
import { image1Url } from '@/common/config.js'

const props = defineProps({
  src: { type: String, default: '' },
  width: { type: [String, Number], default: '100%' },
  height: { type: [String, Number], default: '100%' },
  radius: { type: [String, Number], default: 0 },
  mode: { type: String, default: 'aspectFill' },
  // 是否开启懒加载，默认开启
  lazy: { type: Boolean, default: true },
  // 预加载阈值：距离屏幕底部多少px时开始加载
  threshold: { type: Number, default: 100 },
  customClass: { type: String, default: '' }
})

const emit = defineEmits(['click', 'load', 'error'])

// 状态管理
const showImg = ref(false) // 是否渲染 image 标签
const showSrc = ref('')    // 实际传给 image 的 src
const isLoaded = ref(false)
const isError = ref(false)
const fallbackTried = ref(false) // 是否已尝试过兼容地址回退

// 获取当前组件实例，用于 IntersectionObserver 的作用域绑定
const instance = getCurrentInstance()
let observer = null
let appShowHandler = null

const ensureVisibleLoad = () => {
  if (!props.lazy || !props.src || showImg.value) return
  const query = uni.createSelectorQuery().in(instance?.proxy)
  query.select('.common-image-wrapper').boundingClientRect((rect) => {
    if (!rect) return
    const winH = Number(uni.getSystemInfoSync()?.windowHeight || 0)
    const extra = Number(props.threshold || 0)
    const inViewport = rect.top <= winH + extra && rect.bottom >= -extra
    if (inViewport) {
      loadImmediately()
      disconnectObserver()
    }
  }).exec()
}

// 核心逻辑：初始化观察器
const initObserver = () => {
  // 如果不开启懒加载，或者没有 src，直接显示
  if (!props.lazy || !props.src) {
    loadImmediately()
    return
  }

  // 防止重复创建
  disconnectObserver()

  nextTick(() => {
    // 创建交叉观察器
    // 注意：在组件中使用需要传入 instance
    observer = uni.createIntersectionObserver(instance)
    
    // relativeToViewport: 相对于屏幕视口
    // bottom: props.threshold -> 距离底部一定距离就开始加载
    observer.relativeToViewport({ bottom: props.threshold }).observe('.common-image-wrapper', (res) => {
      // intersectionRatio > 0 说明进入了视口（或者进入了阈值区域）
      if (res.intersectionRatio > 0) {
        loadImmediately()
        // 图片只要加载一次，后续无需再观察，直接断开节省性能
        disconnectObserver()
      }
    })
    // 兜底：某些端从后台恢复后 observer 回调不触发，这里主动检测一次可视区域。
    ensureVisibleLoad()
  })
}

// 图片地址工具：统一裁剪空白
const normalizeSource = (value) => {
  if (value === undefined || value === null) return ''
  const src = String(value).trim()
  if (!src) return ''
  if (/^\/\//.test(src)) return `https:${src}`
  if (/^(https?:|blob:|data:|file:|wxfile:)/i.test(src)) return src
  if (/^(\/)?static\//i.test(src)) return src

  // 兼容后端仅返回七牛 key（如 box/xxx 或 /box/xxx）
  const key = src.replace(/^\/+/, '')
  const qiniuDirs = [
    'box/',
    'home/',
    'goods/',
    'spd/',
    'brand-avatar/',
    'admin/',
    'wgt/',
    'apk/',
    'artist/'
  ]
  if (qiniuDirs.some((dir) => key.startsWith(dir))) {
    return `${String(image1Url || 'https://images1.fantuanpu.com/').replace(/\/+$/, '')}/${key}`
  }
  return src
}

// 是否可走七牛图片处理参数（当前只对主图片域名启用）
const canUseQiniuProcess = (url) => {
  if (!/^https?:\/\//i.test(url)) return false
  try {
    const parsed = new URL(url)
    const host = (parsed.hostname || '').toLowerCase()
    return host === 'images1.fantuanpu.com' || host.endsWith('.images1.fantuanpu.com')
  } catch (err) {
    return false
  }
}

// 是否是 heic/heif 扩展名
const isHeicLike = (url) => {
  try {
    const parsed = new URL(url)
    return /\.(heic|heif)$/i.test(parsed.pathname || '')
  } catch (err) {
    return /\.(heic|heif)(\?|$)/i.test(url)
  }
}

// 给地址附加七牛转码参数（转成 jpg，兼容无扩展名与 HEIC）
const appendQiniuProcess = (url) => {
  if (!url || /imageMogr2\/auto-orient\/format\/jpg/i.test(url)) return url
  const join = url.includes('?') ? '&' : '?'
  return `${url}${join}imageMogr2/auto-orient/format/jpg`
}

// 是否允许在加载失败后走兼容回退
const canFallbackToCompatible = (url) => {
  if (!url) return false
  if (!canUseQiniuProcess(url)) return false
  if (/^(blob:|data:|file:|wxfile:)/i.test(url)) return false
  return true
}

// 计算首选加载地址：heic/heif 直接优先转码，其它先走原图
const resolvePreferredSrc = (raw) => {
  const src = normalizeSource(raw)
  if (!src) return ''
  if (isHeicLike(src) && canUseQiniuProcess(src)) {
    return appendQiniuProcess(src)
  }
  return src
}

// 立即加载图片
const loadImmediately = () => {
  fallbackTried.value = false
  showImg.value = true
  showSrc.value = resolvePreferredSrc(props.src)
}

// 断开观察器
const disconnectObserver = () => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
}

// 监听 src 变化 (例如列表复用或动态切换图片)
watch(() => props.src, (newVal) => {
  // 重置状态
  isLoaded.value = false
  isError.value = false
  fallbackTried.value = false
  
  if (props.lazy) {
    // 如果是懒加载，重置显示状态并重新观察
    showImg.value = false
    showSrc.value = ''
    initObserver()
  } else {
    // 非懒加载直接更新
    showSrc.value = resolvePreferredSrc(newVal)
  }
})

// 生命周期
onMounted(() => {
  initObserver()
  appShowHandler = () => {
    if (!props.lazy || !props.src) return
    if (!showImg.value) {
      initObserver()
      return
    }
    if (showImg.value && !isLoaded.value && !isError.value) {
      ensureVisibleLoad()
    }
  }
  if (typeof uni.onAppShow === 'function') {
    uni.onAppShow(appShowHandler)
  }
})

onUnmounted(() => {
  disconnectObserver()
  if (appShowHandler && typeof uni.offAppShow === 'function') {
    uni.offAppShow(appShowHandler)
  }
  appShowHandler = null
})

// 事件处理
const handleLoad = (e) => {
  isLoaded.value = true
  emit('load', e)
}

const handleError = (e) => {
  const raw = normalizeSource(props.src)
  // 首次加载失败时，自动回退到兼容地址重试一次
  if (!fallbackTried.value && canFallbackToCompatible(raw)) {
    fallbackTried.value = true
    const retrySrc = appendQiniuProcess(raw)
    if (retrySrc && retrySrc !== showSrc.value) {
      isError.value = false
      isLoaded.value = false
      showSrc.value = retrySrc
      return
    }
  }
  isError.value = true
  emit('error', e)
}

const onClick = () => {
  emit('click')
}

// 格式化工具
const formatSize = (value) => {
  if (value === undefined || value === null) return 'auto'
  if (typeof value === 'number' || /^\d+$/.test(value)) {
    return value + 'rpx'
  }
  return value
}
</script>

<style lang="less" scoped>
.common-image-wrapper {
  position: relative;
  overflow: hidden;
  background-color: #f7f8fa; /* 占位背景色 */
  /* 硬件加速，防止圆角在某些机型失效 */
  transform: translateZ(0); 
  /* 确保组件有基础尺寸，否则 Observer 可能无法检测 */
  display: inline-block; 
  vertical-align: middle;

  .real-image {
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity 0.4s ease-in-out;
    display: block;
    
    &.loaded {
      opacity: 1;
    }
  }

  .loading-placeholder {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    background-color: #f0f0f0;
    animation: breathe 2.5s infinite ease-in-out;
  }

  .error-placeholder {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
    background-color: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

@keyframes breathe {
  0% { background-color: #f0f0f0; }
  50% { background-color: #ffffff; }
  100% { background-color: #f0f0f0; }
}
</style>
