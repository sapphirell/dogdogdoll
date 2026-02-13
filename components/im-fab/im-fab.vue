<template>
  <view 
    class="im-fab" 
    :style="{ left: position.left + 'px', top: position.top + 'px' }"
    @click.stop="handleFabClick"
    @touchstart="onTouchStart"
    @touchmove.stop.prevent="onTouchMove"
    @touchend="onTouchEnd"
    hover-class="im-fab--hover"
    :hover-stay-time="100"
  >
    <view v-if="isWsReady" class="im-fab-glow"></view>

    <view class="im-fab-inner">
      <image
        v-if="!isWsReady"
        class="im-fab-icon"
        src="/static/new-icon/loading.gif"
        mode="widthFix"
        :draggable="false" 
      />

      <uni-icons
        v-else
        type="chat-filled"
        :size="28"
        color="#141a23"
      />

      <view v-if="badge > 0" class="dot font-title">
        {{ badge > 99 ? '99+' : badge }}
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, watch, ref } from 'vue'
import { unreadTotal, wsReady } from '@/common/im.js'

// --- 核心业务逻辑 ---

// 仅做展示，通过全局 unreadTotal 响应角标
const badge = computed(() => Number(unreadTotal.value || 0))

// WebSocket 是否就绪（共享状态）
const isWsReady = computed(() => {
  const token = uni.getStorageSync('token') || ''
  const ready = !!wsReady.value
  if (!token) return false
  return ready
})

function goMessageList () {
  uni.navigateTo({ url: '/pkg-im/message_list/message_list' })
}

// --- 拖拽逻辑实现 ---

const position = ref({ left: 0, top: 0 }) // 按钮的实时位置
const isDragging = ref(false)             // 标记是否正在发生拖拽行为
let startX = 0, startY = 0                // 手指按下的坐标
let startLeft = 0, startTop = 0           // 按钮原本的位置
let windowWidth = 0, windowHeight = 0     // 屏幕宽高

// 初始化位置（模拟之前的 CSS position: fixed; right: 16px; bottom: 86px...）
const initPosition = () => {
  try {
    const sys = uni.getSystemInfoSync()
    windowWidth = sys.windowWidth
    windowHeight = sys.windowHeight
    
    // 按钮宽高约为 56px
    const btnSize = 56
    // 初始位置：右边距 16px
    position.value.left = windowWidth - btnSize - 16
    // 初始位置：底边距约 100px (避开 tabbar)
    position.value.top = windowHeight - btnSize - 100
  } catch (e) {
    // 兜底
    position.value = { left: 300, top: 500 }
  }
}

const onTouchStart = (e) => {
  // 记录开始触摸的数据
  isDragging.value = false
  if (e.touches && e.touches[0]) {
    startX = e.touches[0].clientX
    startY = e.touches[0].clientY
    startLeft = position.value.left
    startTop = position.value.top
  }
}

const onTouchMove = (e) => {
  if (e.touches && e.touches[0]) {
    const clientX = e.touches[0].clientX
    const clientY = e.touches[0].clientY

    // 计算偏移量
    const deltaX = clientX - startX
    const deltaY = clientY - startY

    // 如果移动距离非常小，不视为拖拽（防止点击时手指微颤导致无法跳转）
    if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
      isDragging.value = true
    }

    // 更新位置
    let newLeft = startLeft + deltaX
    let newTop = startTop + deltaY

    // 边界检查：不让按钮完全跑出屏幕
    const btnSize = 56
    if (newLeft < 0) newLeft = 0
    if (newLeft > windowWidth - btnSize) newLeft = windowWidth - btnSize
    if (newTop < 0) newTop = 0
    if (newTop > windowHeight - btnSize) newTop = windowHeight - btnSize

    position.value.left = newLeft
    position.value.top = newTop
  }
}

const onTouchEnd = () => {
  // 可以在这里添加“吸边”效果代码，如果需要的话
}

// 处理点击事件
const handleFabClick = () => {
  // 只有在没有发生拖拽行为时，才执行跳转
  if (!isDragging.value) {
    goMessageList()
  }
}


// --- 生命周期管理 ---

onMounted(() => {
  // 1. 初始化按钮位置
  initPosition()
})

watch(wsReady, (v) => {
  console.log('[IM-FAB] wsReady changed =>', v)
})
</script>

<style scoped>
.im-fab {
  position: fixed;
  /* 移除 CSS 中的 bottom/right，完全由 JS 的 style 控制 top/left */
  width: 56px;
  height: 56px;
  z-index: 9999;
  overflow: visible;
  /* 防止拖拽时触发浏览器的默认滚动行为 */
  touch-action: none; 
}

/* 按钮主体：磨玻璃效果 */
.im-fab-inner {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 28px;
  
  /* 核心修改：背景半透明 + 模糊滤镜 
     注意：backdrop-filter 在部分旧安卓机型可能不支持，会降级为单纯的半透明
  */
  background: rgba(255, 255, 255, 0.65); 
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  /* 移除边框，添加轻微的内阴影增加质感（可选） */
  border: none;
  box-shadow: inset 0 0 2px rgba(255, 255, 255, 0.6), 0 4px 10px rgba(0,0,0,0.1);

  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

/* 悬浮态轻微缩放 */
.im-fab--hover .im-fab-inner {
  transform: scale(0.96);
  background: rgba(255, 255, 255, 0.75); /* 按下时稍微不透明一点 */
}

/* 彩虹投影 */
.im-fab-glow {
  position: absolute;
  left: 50%;
  bottom: 0px;
  transform: translateX(-50%);
  width: 100%;
  height: 50px;
  pointer-events: none;
  z-index: 0;
  background: radial-gradient(
    ellipse at center,
    #ff6b8b 0%,
    #ffd36b 25%,
    #6bffb4 50%,
    #6b8bff 75%,
    transparent 100%
  );
  filter: blur(14px);
  opacity: 0.95;
  animation: rainbow-hue 6s linear infinite;
}

@keyframes rainbow-hue {
  0% { filter: hue-rotate(0deg) blur(14px); }
  100% { filter: hue-rotate(360deg) blur(14px); }
}

.im-fab-icon {
  width: 96rpx!important;
  height: 96rpx!important;
}

/* 角标 */
.dot {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: #ff7072;
  color: #fff;
  border-radius: 10px;
  font-size: 12px;
  line-height: 20px;
  text-align: center;
}
</style>
