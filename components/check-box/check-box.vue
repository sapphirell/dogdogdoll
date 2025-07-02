<template>
  <view class="slide-radio-container">

    <!-- 单选器主体 -->
    <view 
      class="slide-radio" 
      :style="{ 
        backgroundColor: inactiveColor,
        height: height + 'px'
      }"
      @tap="toggle"
    >
      <!-- 滑动指示器 -->
      <view 
        class="slider" 
        :style="{
          transform: `translateX(${isActive ? sliderActivePosition : sliderInactivePosition}px)`,
          background: sliderColor
        }"
      >
        <view class="slider-content">
          <text class="slider-text">{{ isActive ? activeText : inactiveText }}</text>
        </view>
      </view>
      
      <!-- 背景文本 -->
      <view class="background-text">
        <text class="inactive-text" :style="{ color: inactiveTextColor }">{{ inactiveText }}</text>
        <text class="active-text" :style="{ color: activeTextColor }">{{ activeText }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const props = defineProps({
  // 默认状态
  modelValue: {
    type: Boolean,
    default: false
  },
  // 组件高度
  height: {
    type: Number,
    default: 50
  },
  // 激活颜色
  activeColor: {
    type: String,
    default: '#5e7bf0'
  },
  // 非激活颜色
  inactiveColor: {
    type: String,
    default: '#f0f2f7'
  },
  // 滑块颜色
  sliderColor: {
    type: String,
    default: 'linear-gradient(135deg, #a6e9f7, #1ed1e1);'
  },
  // 激活文本颜色
  activeTextColor: {
    type: String,
    default: '#ffffff'
  },
  // 非激活文本颜色
  inactiveTextColor: {
    type: String,
    default: '#666666'
  },
  // 激活状态文本
  activeText: {
    type: String,
    default: '是'
  },
  // 非激活状态文本
  inactiveText: {
    type: String,
    default: '否'
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

// 当前状态
const isActive = ref(props.modelValue)

// 容器宽度
const containerWidth = ref(200)
// 滑块宽度
const sliderWidth = ref(0)

// 计算滑块位置
const sliderActivePosition = computed(() => {
  return containerWidth.value - sliderWidth.value - 4
})

const sliderInactivePosition = computed(() => {
  return 4
})

// 切换状态
const toggle = () => {
  isActive.value = !isActive.value
  emit('update:modelValue', isActive.value)
  emit('change', isActive.value)
}

// 监听默认值变化
watch(() => props.modelValue, (newVal) => {
  isActive.value = newVal
})

// 组件挂载时获取容器尺寸
onMounted(() => {
  setTimeout(() => {
    const query = uni.createSelectorQuery()
    query.select('.slide-radio').boundingClientRect(data => {
      if (data) {
        containerWidth.value = data.width
        // 滑块宽度为容器宽度的一半减去边距
        sliderWidth.value = data.width / 2 - 8
      }
    }).exec()
  }, 100)
})
</script>

<style lang="scss" scoped>
.slide-radio-container {
  width: 100%;
  padding: 20rpx 0;
  
  .title {
    display: block;
    font-size: 28rpx;
    color: #333;
    font-weight: bold;
    margin-bottom: 20rpx;
    padding-left: 20rpx;
  }
}

.slide-radio {
  position: relative;
  width: 100%;
  border-radius: 50rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  transition: background-color 0.3s ease;
  
  // 滑块样式
  .slider {
    position: absolute;
    top: 4px;
    left: 0;
    width: calc(50% - 8px);
    height: calc(100% - 8px);
    border-radius: 50rpx;
    transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
    z-index: 2;
    
    .slider-content {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      
      .slider-text {
        font-size: 28rpx;
        font-weight: 500;
        color: #5e7bf0;
      }
    }
  }
  
  // 背景文本样式
  .background-text {
    position: relative;
    display: flex;
    height: 100%;
    z-index: 1;
    
    .inactive-text, .active-text {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 50%;
      height: 100%;
      font-size: 28rpx;
      font-weight: 500;
      transition: color 0.3s ease;
    }
  }
}
</style>
