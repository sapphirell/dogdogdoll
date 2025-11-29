<!-- info-hub-panel.vue -->
<template>
  <view class="info-hub-panel">
    <!-- 统计卡片 = 二级 Tab（关注 / 站内信） -->
    <view class="stats-card">
      <!-- 关注 -->
      <view
        class="stat-item"
        :class="{ 'stat-item-active': activeSecondTab === 'follow' }"
        @click="changeSecondTab('follow')"
      >
        <text class="stat-number font-alimamashuhei">
          {{ followCount }}
        </text>
        <text class="stat-label font-alimamashuhei">
          关注
        </text>
      </view>

      <view class="stat-divider"></view>

      <!-- 站内信（这里显示未读数） -->
      <view
        class="stat-item"
        :class="{ 'stat-item-active': activeSecondTab === 'message' }"
        @click="changeSecondTab('message')"
      >
        <text class="stat-number font-alimamashuhei">
          {{ messageCount }}
        </text>
        <text class="stat-label font-alimamashuhei">
          站内信
        </text>
      </view>
    </view>

    <!-- 二级 Tab 对应内容 -->
    <view class="info-content">
      <info-follow-tab
        v-if="activeSecondTab === 'follow'"
        @update-stats="handleStatsUpdate"
      />

      <info-message-list
        v-else
        @update-stats="handleStatsUpdate"
      />
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  active: {
    type: Boolean,
    default: true
  }
})

// 二级 Tab：关注 / 站内信
const activeSecondTab = ref('follow')

// 顶部统计数字
const followCount = ref(0)   // 关注总数
const messageCount = ref(0)  // 未读站内信数量

function changeSecondTab(key) {
  activeSecondTab.value = key
}

// 子组件上报统计：
// - info-follow-tab: { followTotal }
// - info-message-list: { messageTotal }
function handleStatsUpdate(payload) {
  if (!payload) return
  if (typeof payload.followTotal === 'number') {
    followCount.value = payload.followTotal
  }
  if (typeof payload.messageTotal === 'number') {
    messageCount.value = payload.messageTotal
  }
}
</script>

<style lang="scss" scoped>
.info-hub-panel {
  padding: 0 40rpx 40rpx;
  box-sizing: border-box;
}

/* 顶部统计 + 二级 Tab */
.stats-card {
  box-sizing: border-box; /* 宽度包含 padding，避免超出 */
  width: 100%;
  max-width: 100%;
  background: #ffffff;
  border-radius: 32rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.04);
  padding: 24rpx 40rpx;
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  margin-bottom: 32rpx;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 默认灰色 */
.stat-number {
  font-size: 40rpx;
  font-weight: 700;
  color: #d0d0d0;
}

.stat-label {
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #d0d0d0;
}

/* 选中态 */
.stat-item-active .stat-number,
.stat-item-active .stat-label {
  color: #222222;
}

/* 中间分割线 */
.stat-divider {
  width: 2rpx;
  height: 60rpx;
  background: #f2f2f2;
}

/* 内容区域 */
.info-content {
  margin-top: 16rpx;
}
</style>
