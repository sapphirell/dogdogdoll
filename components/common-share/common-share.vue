<!-- src/components/common-share.vue -->
<template>
  <!-- 仅 APP/H5 渲染，小程序不显示（使用原生转发） -->
  <!-- #ifdef APP-PLUS || H5 -->
  <view class="nav-right" @click="$emit('click')">
    <slot>
      <!-- 默认样式（你也可以在 slot 放自定义图标） -->
      <view class="nav-share-pill">
        <uni-icons type="redo" size="22" color="#000" />
      </view>
    </slot>
  </view>
  <!-- #endif -->
</template>

<script setup>
defineEmits(['click'])
</script>

<style scoped lang="less">
.nav-right {
  height: 88rpx;
  display: flex;
  align-items: center;
  /* 右侧安全区 + 页边距 */
  padding-right: calc(24rpx + env(safe-area-inset-right));
}

.nav-share-pill {
  width: 56rpx;
  height: 56rpx;
  border-radius: 9999rpx;
  background: rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
