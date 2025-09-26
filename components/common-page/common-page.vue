<template>
  <!-- 页面容器 -->
  <view class="page-container">
    <!-- 顶部安全区域占位 -->
    <view class="header-placeholder"></view>

    <!-- 页面内容区域（不滚动，把滚动权交给子内容的 scroll-view） -->
    <view class="content-container">
      <view class="main-content">
        <slot></slot>
      </view>
    </view>

    <!-- 底部安全区域占位 -->
    <view class="footer-placeholder"></view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const emit = defineEmits(['scroll'])

const systemInfo = uni.getSystemInfoSync()

// 小程序导航栏高度
const navBarHeight = computed(() => {
  // #ifdef MP-WEIXIN
  const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
  const statusBarHeight = systemInfo.statusBarHeight || 32
  return menuButtonInfo.bottom + menuButtonInfo.top - 2 * statusBarHeight
  // #endif
  return 0
})

const props = defineProps({
  head_color: {
    type: String,
    default: '#ffffff',
  }
})

// 顶部占位
const headerHeight = computed(() => {
  // #ifdef MP-WEIXIN
  return navBarHeight.value + 'px'
  // #endif
  // #ifdef H5 || APP
  const statusBarHeight = systemInfo.statusBarHeight || 0
  return `${statusBarHeight}px`
  // #endif
})

// 底部安全区
const footerHeight = computed(() => {
  const safeBottom = systemInfo.safeAreaInsets?.bottom || 0
  return `${safeBottom + 20}px`
})
</script>

<style lang="less" scoped>
.page-container{
  display:flex; flex-direction:column; min-height:100vh;
  padding-left: constant(safe-area-inset-left);
  padding-left: env(safe-area-inset-left);
  padding-right: constant(safe-area-inset-right);
  padding-right: env(safe-area-inset-right);
}
.header-placeholder{
  height: v-bind(headerHeight);
  background: v-bind('head_color');
  background-size: cover;
  background-position: 0 50rpx;
}
.content-container{ flex:1; display:flex; flex-direction:column; overflow:hidden; }
.main-content{
  flex:1;
  /* 关键：不让外壳滚动，把滚动权交给子 slot 里的 scroll-view */
  overflow: visible;
}
.footer-placeholder{
  height: v-bind(footerHeight);
  background:#fff;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
@supports (bottom: constant(safe-area-inset-bottom)) {
  .page-container{
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
  }
}
</style>
