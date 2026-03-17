<template>
  <view
    class="modal-mask"
    :class="{ 'is-center': props.center }"
    v-if="visible"
    @tap.stop="closeModal"
    @touchmove.stop.prevent="onMaskTouchMove"
    @wheel.stop.prevent="onMaskWheel"
  >
    <uni-transition :mode-class="modeClass" :show="visible">
      <view
        class="modal-container safe-bottom"
        :style="containerStyle"
        @tap.stop
        @touchmove.stop
        @wheel.stop
      >
        <!--
          使用提示：
          1) common-modal 只负责通用容器与滚动能力；
          2) 组件已内置底部安全留白（基础留白 + safe-area-inset-bottom）；
          3) 若业务弹窗按钮较多，仍可在插槽根节点追加额外下边距。
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
      count: 0
    }
  }
  return globalThis[BODY_SCROLL_LOCK_KEY]
}

const localLocked = ref(false)

function resolvePageScrollContainer() {
  if (typeof document === 'undefined') return null
  const pageBodies = document.querySelectorAll('uni-page-body')
  if (pageBodies && pageBodies.length > 0) {
    return pageBodies[pageBodies.length - 1]
  }
  const pageWrappers = document.querySelectorAll('uni-page-wrapper')
  if (pageWrappers && pageWrappers.length > 0) {
    return pageWrappers[pageWrappers.length - 1]
  }
  return document.scrollingElement || document.documentElement
}

function lockBodyScroll() {
  if (localLocked.value) return
  const store = getScrollLockStore()
  if (!store) return

  // 记录锁计数；在 H5 锁定滚动但保持背景可见（不再挪动 body）。
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const body = document.body
    const pageEl = resolvePageScrollContainer()
    if (store.count === 0) {
      // 兼容旧实现遗留：若 body 被固定并上移，先恢复，避免“背景消失”。
      if (body.style.position === 'fixed' && body.style.top) {
        body.style.position = ''
        body.style.top = ''
        body.style.left = ''
        body.style.right = ''
        body.style.width = ''
      }

      store.pageEl = pageEl || null
      store.pageOverscrollBehavior = pageEl?.style?.overscrollBehavior || ''
      store.pageTouchAction = pageEl?.style?.touchAction || ''

      // 文档级兜底拦截：防止 iOS 下惯性滚动穿透到父级页面。
      store.docTouchMoveHandler = (e) => {
        if (isFromModalContainer(e)) return true
        if (e && typeof e.preventDefault === 'function' && e.cancelable) {
          e.preventDefault()
        }
        return false
      }
      store.docWheelHandler = (e) => {
        if (isFromModalContainer(e)) return true
        if (e && typeof e.preventDefault === 'function' && e.cancelable) {
          e.preventDefault()
        }
        return false
      }
      document.addEventListener('touchmove', store.docTouchMoveHandler, { passive: false })
      document.addEventListener('wheel', store.docWheelHandler, { passive: false })
    }
    if (pageEl && pageEl.style) {
      pageEl.style.overscrollBehavior = 'none'
      pageEl.style.touchAction = 'none'
    }
  }

  store.count += 1
  localLocked.value = true
}

function unlockBodyScroll(force = false) {
  const store = getScrollLockStore()
  if (!store) return

  if (localLocked.value) {
    store.count = Math.max(0, store.count - 1)
    localLocked.value = false
  } else if (!force) {
    return
  }

  if (store.count > 0) return

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const pageEl = store.pageEl && store.pageEl.style ? store.pageEl : null

    if (pageEl) {
      pageEl.style.overscrollBehavior = store.pageOverscrollBehavior || ''
      pageEl.style.touchAction = store.pageTouchAction || ''
    }

    if (store.docTouchMoveHandler) {
      document.removeEventListener('touchmove', store.docTouchMoveHandler)
      store.docTouchMoveHandler = null
    }
    if (store.docWheelHandler) {
      document.removeEventListener('wheel', store.docWheelHandler)
      store.docWheelHandler = null
    }
  }
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
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  /* 只有遮罩层级足够高，才能拦截点击和滚动 */
  z-index: 999; 
  
  /* 全透明遮罩，仅拦截事件，不做变暗 */
  background-color: transparent;
  
  /* Flex 布局实现水平居中 */
  display: flex;
  flex-direction: column;
  align-items: center; /* 确保子元素（弹窗）水平居中 */
  justify-content: flex-start;
  overscroll-behavior: contain;
  touch-action: none;
}

.modal-mask.is-center {
  justify-content: center;
  padding: 24rpx 0;
  box-sizing: border-box;
}

.modal-container {
  --modal-base-pad: 40rpx;
  --modal-bottom-extra: 18rpx;
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
  touch-action: pan-y;
  
  padding: var(--modal-base-pad);
  align-items: center;
}

/* 底部安全区适配 */
.safe-bottom {
  /* 不能只写 safe-area，否则会覆盖 modal-container 的基础底部内边距 */
  padding-bottom: calc(var(--modal-base-pad) + var(--modal-bottom-extra));
  padding-bottom: calc(var(--modal-base-pad) + var(--modal-bottom-extra) + constant(safe-area-inset-bottom));
  padding-bottom: calc(var(--modal-base-pad) + var(--modal-bottom-extra) + env(safe-area-inset-bottom));
}
</style>
