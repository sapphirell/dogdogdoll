<template>
  <view class="order-status" :class="[statusClass, `size-${sizeClass}`]">
    <text class="order-status-text font-alimamashuhei">{{ displayText }}</text>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: [Number, String],
    default: -1
  },
  text: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'normal'
  },
  // 视角：
  // - buyer: 买家视角（订单集）
  // - seller: 接单者/创作者视角（接单列表）
  perspective: {
    type: String,
    default: 'seller'
  }
})

const statusLabelSellerMap = Object.freeze({
  0: '排队中',
  1: '待买家确认',
  2: '待你确认',
  3: '待付款',
  4: '已付款',
  5: '排队失败',
  6: '已取消',
  7: '已超时'
})

const statusLabelBuyerMap = Object.freeze({
  0: '排队中',
  1: '待你确认',
  2: '待卖家确认',
  3: '待付款',
  4: '已付款',
  5: '排队失败',
  6: '已取消',
  7: '已超时'
})

const statusClass = computed(() => {
  const key = Number(props.status)
  return Number.isInteger(key) ? `s-${key}` : 's-default'
})

const displayText = computed(() => {
  if ((props.text || '').trim()) return props.text.trim()
  const st = Number(props.status)
  if (props.perspective === 'buyer') {
    return statusLabelBuyerMap[st] || '未知状态'
  }
  return statusLabelSellerMap[st] || '未知状态'
})

const sizeClass = computed(() => (props.size === 'small' ? 'small' : 'normal'))
</script>

<style lang="scss" scoped>
.order-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 999rpx;
  background: #4a4492;
}

.order-status-text {
  color: #ffffff;
  white-space: nowrap;
  text-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.22);
}

.size-normal {
  padding: 8rpx 20rpx;
}

.size-normal .order-status-text {
  font-size: 22rpx;
  line-height: 1.2;
}

.size-small {
  padding: 4rpx 14rpx;
}

.size-small .order-status-text {
  font-size: 20rpx;
  line-height: 1.1;
}

.order-status.s-0 {
  background: #ddf1fc;
}

.order-status.s-1 {
  background: #fed887;
}

.order-status.s-2 {
  background: #fd5c32;
}

.order-status.s-3 {
  background: #ffb3be;
}

.order-status.s-4 {
  background: #99ded6;
}

.order-status.s-5 {
  background: #160923;
}

.order-status.s-6 {
  background: #b084e0;
}

.order-status.s-7 {
  background: #4a4492;
}

.order-status.s-default {
  background: #4a4492;
}
</style>
