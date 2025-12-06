<!-- loading-jump-text -->
<template>
  <view class="loading-jump font-alimamashuhei">
    <text
      v-for="(ch, index) in chars"
      :key="index"
      class="loading-char"
      :style="{ animationDelay: index * 120 + 'ms' }"
    >
      {{ ch }}
    </text>
    <text class="loading-dots">...</text>
  </view>
</template>

<script setup>
const chars = ['加', '载', '中']
</script>

<style lang="scss" scoped>
.loading-jump {
  display: inline-flex;
  align-items: flex-end;
  justify-content: center;
  font-size: 24rpx;
  color: #888888;
}

/* 逐个跳起的字 */
.loading-char {
  margin: 0 2rpx;
  animation-name: loadingJump;
  animation-duration: 0.6s;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  animation-direction: alternate;
}

.loading-dots {
  margin-left: 4rpx;
}

/* 上下跳动动画 */
@keyframes loadingJump {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10rpx);
  }
  100% {
    transform: translateY(0);
  }
}
</style>
