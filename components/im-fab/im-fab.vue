<template>
  <view class="im-fab" @click="goMessageList" hover-class="im-fab--hover">
    <uni-icons type="chatboxes" :size="28" color="#006a57" />
    <view v-if="badge > 0" class="dot">{{ badge > 99 ? '99+' : badge }}</view>
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
 * 防重复连接/重复订阅：
 * - 组件可能在多个页面使用，为避免多次加载导致重复请求 unread 或重复订阅 WS 事件，
 *   这里用全局标记保证只在首个挂载时做一次“兜底连接 + 订阅占位”。
 * - 你的 im.js 应该已经对 connectIM 做了幂等处理；这里是双保险。
 */
const FLAG = '__IM_FAB_BOUND__'

onMounted(() => {
  // 兜底：确保已连接（connectIM 内部应做幂等）
  connectIM()

  // 只绑定一次（轻量 no-op 订阅，保证 unreadTotal 能被 WS 触发更新的场景下正常联动）
  if (!globalThis[FLAG]) {
    // 如果 onIMEvent 有返回取消订阅方法，可按需保存；此处为 no-op 监听，不必解绑
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
  border-radius: 28px;
  background: #ffb400;
  box-shadow: 0 6px 12px rgba(0,0,0,0.18);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.im-fab--hover { opacity: 0.9; }

/* 角标 */
.dot {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: #ff4d4f;
  color: #fff;
  border-radius: 10px;
  font-size: 12px;
  line-height: 20px;
  text-align: center;
  box-shadow: 0 0 0 2px #fff; /* 贴深色底更清晰，可移除 */
}
</style>
