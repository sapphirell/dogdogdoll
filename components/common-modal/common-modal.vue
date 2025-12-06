<!-- components/common-modal.vue -->
<template>
  <view
    class="modal-mask"
    v-if="visible"
    @tap.stop="closeModal"
    @touchmove.stop.prevent="moveHandle"
    :style="maskStyle"
  >
    <uni-transition :mode-class="modeClass" :show="visible">
      <view class="modal-container" :style="containerStyle" @tap.stop>
        <view class="modal-content">
          <slot></slot>
        </view>
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
  onMounted
} from 'vue'

import { getScene } from '../../common/config.js'

const isApp = ref(false)

const props = defineProps({
  visible: Boolean,
  top: {
    type: [String, Number],
    default: '30%'
  },
  width: {
    type: [String, Number],
    default: '80%'
  },
  height: {
    type: [String, Number],
    default: 'auto'
  },
  closeable: {
    type: Boolean,
    default: true
  }
})

// 保留 zoom-in 动画
const modeClass = ref(['fade', 'zoom-in'])

const emit = defineEmits(['update:visible'])

/** 遮罩层样式：App 内透明，其它端半透明 */
const maskStyle = computed(() => {
  return {
    backgroundColor: isApp.value
      ? 'rgba(0, 0, 0, 0)'
      : 'rgba(0, 0, 0, 0.5)'
  }
})

/** 弹窗容器样式：支持 top / width / height 传参 */
const containerStyle = computed(() => ({
  top: formatValue(props.top),
  width: formatValue(props.width),
  height: formatValue(props.height)
}))

const moveHandle = () => false

function formatValue(val) {
  if (typeof val === 'number') return `${val}px`
  // 纯数字字符串自动补 px
  if (typeof val === 'string' && /^\d+(\.\d+)?$/.test(val)) {
    return `${val}px`
  }
  // 其它情况（rpx / % / auto 等）原样返回
  return val
}

const closeModal = () => {
  if (props.closeable) {
    emit('update:visible', false)
  }
}

// 检测运行场景
onMounted(() => {
  const scene = getScene()
  isApp.value = scene === 2 || scene === 3 // 2 / 3 表示 App 环境
})
</script>

<style scoped>
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  z-index: 1001;
}

.modal-container {
  position: absolute;
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  min-width: 200px;
  min-height: 100px;
  max-width: 100vw;
  left: 50%;
  transform: translateX(-50%);
  box-sizing: border-box;
}

.modal-content {
  /* 按需扩展 */
}
</style>
