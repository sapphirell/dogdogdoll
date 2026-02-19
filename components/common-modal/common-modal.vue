<template>
  <view
    class="modal-mask"
    :class="{ 'is-center': props.center }"
    v-if="visible"
    @tap.stop="closeModal"
    @touchmove.stop="onMaskTouchMove"
    @wheel.stop.prevent="onMaskWheel"
  >
    <uni-transition :mode-class="modeClass" :show="visible">
      <view
        class="modal-container safe-bottom"
        :style="containerStyle"
        @tap.stop
      >
        <!--
          使用提示：
          1) common-modal 只负责通用容器与滚动能力；
          2) 业务侧请在插槽根节点自行预留下边距（建议 >= 24rpx + safe-area-inset-bottom），
             避免底部按钮贴边或被手势区域挤压。
        -->
        <slot></slot>
      </view>
    </uni-transition>
  </view>
</template>

<script setup>
import {
  defineProps,
  defineEmits,
  computed,
  ref,
  watch,
  onBeforeUnmount
} from 'vue'

const BODY_SCROLL_LOCK_KEY = '__dogdogdoll_common_modal_scroll_lock__'

const props = defineProps({
  visible: Boolean,
  // 距离顶部的距离，控制垂直位置
  top: {
    type: [String, Number],
    default: '15vh'
  },
  // 宽度通常由内容撑开，设为 auto 即可
  width: {
    type: [String, Number],
    default: 'auto'
  },
  center: {
    type: Boolean,
    default: false
  },
  closeable: {
    type: Boolean,
    default: true
  }
})

// 动画效果：渐变 + 缩放
const modeClass = ref(['fade', 'zoom-in'])

const emit = defineEmits(['update:visible'])

/** * 容器样式计算
 * 重点：使用 marginTop 控制垂直位置，Flex 控制水平居中 
 */
const containerStyle = computed(() => ({
  width: formatValue(props.width),
  marginTop: props.center ? '0' : formatValue(props.top)
}))

function getScrollLockStore() {
  if (typeof globalThis === 'undefined') return null
  if (!globalThis[BODY_SCROLL_LOCK_KEY]) {
    globalThis[BODY_SCROLL_LOCK_KEY] = {
      count: 0,
      scrollTop: 0,
      bodyStyle: null,
      htmlStyle: null
    }
  }
  return globalThis[BODY_SCROLL_LOCK_KEY]
}

const localLocked = ref(false)

function lockBodyScroll() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  if (localLocked.value) return
  const store = getScrollLockStore()
  if (!store) return

  if (store.count === 0) {
    const body = document.body
    const html = document.documentElement
    store.scrollTop = window.pageYOffset || html.scrollTop || body.scrollTop || 0
    store.bodyStyle = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width
    }
    store.htmlStyle = {
      overflow: html.style.overflow
    }

    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = `-${store.scrollTop}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'
    html.style.overflow = 'hidden'
  }

  store.count += 1
  localLocked.value = true
}

function unlockBodyScroll(force = false) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  const store = getScrollLockStore()
  if (!store) return

  if (localLocked.value) {
    store.count = Math.max(0, store.count - 1)
    localLocked.value = false
  } else if (!force) {
    return
  }

  if (store.count > 0) return

  const body = document.body
  const html = document.documentElement
  const bodyStyle = store.bodyStyle || {}
  const htmlStyle = store.htmlStyle || {}
  const top = Number(store.scrollTop || 0)

  body.style.overflow = bodyStyle.overflow || ''
  body.style.position = bodyStyle.position || ''
  body.style.top = bodyStyle.top || ''
  body.style.left = bodyStyle.left || ''
  body.style.right = bodyStyle.right || ''
  body.style.width = bodyStyle.width || ''
  html.style.overflow = htmlStyle.overflow || ''

  window.scrollTo(0, top)
}

// 阻止遮罩层下页面滚动（避免滑动穿透）
function isFromModalContainer(e) {
  const rawTarget = e?.target
  if (!rawTarget) return false
  const target = rawTarget.nodeType === 3 ? rawTarget.parentElement : rawTarget
  if (target && typeof target.closest === 'function') {
    return !!target.closest('.modal-container')
  }
  return false
}

const onMaskTouchMove = (e) => {
  // 允许弹窗容器内滚动；只拦截遮罩层区域的滑动，防止穿透到下层页面。
  if (isFromModalContainer(e)) return true
  if (e && typeof e.preventDefault === 'function' && e.cancelable) {
    e.preventDefault()
  }
  return false
}
const onMaskWheel = (e) => {
  if (isFromModalContainer(e)) return true
  if (e && typeof e.preventDefault === 'function' && e.cancelable) {
    e.preventDefault()
  }
  return false
}
// 格式化单位
function formatValue(val) {
  if (val === 'auto') return 'auto'
  if (typeof val === 'number') return `${val}px`
  if (typeof val === 'string' && /^\d+(\.\d+)?$/.test(val)) {
    return `${val}px`
  }
  return val
}

const closeModal = () => {
  if (props.closeable) {
    emit('update:visible', false)
  }
}

watch(
  () => props.visible,
  (show) => {
    if (show) {
      lockBodyScroll()
    } else {
      unlockBodyScroll()
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  unlockBodyScroll(true)
})
</script>

<style scoped>
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* 只有遮罩层级足够高，才能拦截点击和滚动 */
  z-index: 999; 
  
  /* 【核心修改】透明背景，但保留 DOM 以拦截事件 */
  background-color: rgba(0, 0, 0, 0); 
  
  /* Flex 布局实现水平居中 */
  display: flex;
  flex-direction: column;
  align-items: center; /* 确保子元素（弹窗）水平居中 */
  justify-content: flex-start;
  overscroll-behavior: contain;
}

.modal-mask.is-center {
  justify-content: center;
  padding: 24rpx 0;
  box-sizing: border-box;
}

.modal-container {
  position: relative;
  background-color: #fff;
  border-radius: 24rpx;
  
  /* 【核心修改】增强阴影 */
  /* 因为背景是透明的，需要更强的阴影来区分弹窗和底部内容 */
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.2), 0 0 10rpx rgba(0, 0, 0, 0.05);
  border: 1rpx solid rgba(0,0,0,0.05); /* 微弱描边增加质感 */

  /* 限制最大宽度，保证左右留出间距，不会贴死屏幕边缘 */
  max-width: 90vw; 
  max-height: calc(100vh - 80rpx);
  min-width: 100rpx;
  min-height: 50rpx;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  
  padding: 40rpx;
  align-items: center;
}

/* 底部安全区适配 */
.safe-bottom {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
