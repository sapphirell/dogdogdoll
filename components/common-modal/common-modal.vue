<template>
  <view
    class="modal-mask"
    v-if="visible"
    @tap.stop="closeModal"
    @touchmove.stop.prevent="moveHandle"
  >
    <uni-transition :mode-class="modeClass" :show="visible">
      <view class="modal-container safe-bottom" :style="containerStyle" @tap.stop>
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
  ref
} from 'vue'

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
  marginTop: formatValue(props.top),
  width: formatValue(props.width)
}))

// 阻止遮罩层下的页面滚动
const moveHandle = () => false

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
  min-width: 100rpx;
  min-height: 50rpx;
  box-sizing: border-box;
  overflow: scroll;
  
  padding: 40rpx;
  align-items: center;
}

/* 底部安全区适配 */
.safe-bottom {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
</style>