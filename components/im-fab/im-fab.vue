<template>
  <view class="im-fab" @click="goMessageList" hover-class="im-fab--hover">
    <!-- 彩虹光晕：永远在按钮下方 -->
    <view class="im-fab-glow"></view>

    <!-- 按钮主体 -->
    <view class="im-fab-inner">
      <uni-icons type="chat-filled" :size="28" color="#141a23" />
      <view v-if="badge > 0" class="dot">
        {{ badge > 99 ? '99+' : badge }}
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { unreadTotal, connectIM, onIMEvent } from '@/common/im.js'

// 仅做展示，通过全局 unreadTotal 响应角标
const badge = computed(() => Number(unreadTotal.value || 0))

function goMessageList () {
  uni.navigateTo({ url: '/pkg-im/message_list/message_list' })
}

/**
 * 防重复连接/重复订阅
 */
const FLAG = '__IM_FAB_BOUND__'

onMounted(() => {
  connectIM()

  if (!globalThis[FLAG]) {
    onIMEvent(() => {})
    globalThis[FLAG] = true
  }
})
</script>

<style scoped>
.im-fab {
  position: fixed;
  right: 16px;
  bottom: calc(16px + constant(safe-area-inset-bottom));
  bottom: calc(86px + env(safe-area-inset-bottom));
  width: 56px;
  height: 56px;
  z-index: 9999;
  overflow: visible;              /* 允许光晕溢出 */
}

/* 按钮主体：真正的圆角白色按钮 */
.im-fab-inner {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 28px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;                     /* 永远在光晕之上 */
}

/* 悬浮态轻微缩放 */
.im-fab--hover .im-fab-inner {
  transform: scale(0.96);
  opacity: 0.95;
}

/* 彩虹投影：单独一个子 view，位于按钮底部 */
.im-fab-glow {
  position: absolute;
  left: 50%;
  bottom: 0px;                  /* 控制光晕离按钮的距离 */
  transform: translateX(-50%);
  width: 100%;
  height: 50px;
  pointer-events: none;
  z-index: 0;

  /* 用径向渐变模拟一团光 */
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

  /* 通过 hue-rotate 做彩虹循环，0° 和 360° 完全一致 => 无缝循环 */
  animation: rainbow-hue 6s linear infinite;
}

@keyframes rainbow-hue {
  0% {
    filter: hue-rotate(0deg) blur(14px);
  }
  100% {
    filter: hue-rotate(360deg) blur(14px);
  }
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
  box-shadow: 0 0 0 2px #fff;
}
</style>
