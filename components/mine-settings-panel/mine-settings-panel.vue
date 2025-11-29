<!-- components/mine-settings-panel/mine-settings-panel.vue -->
<template>
  <view class="settings-panel font-alimamashuhei">
    <view
      v-for="(item, index) in items"
      :key="item.key"
      class="settings-item"
      :style="itemStyle(index)"
      @click="handleClick(item.key)"
    >
      <text class="settings-label">{{ item.label }}</text>
      <!-- 箭头：uni-icons -->
      <uni-icons
        class="settings-arrow-icon"
        type="arrow-right"
        size="18"
        color="#666"
      />
    </view>

    <!-- 退出确认弹窗 -->
    <common-modal v-model:visible="showLogoutConfirm" top="32%"  width="80vw">
      <view class="logout-modal font-alimamashuhei">
        <view class="logout-title">确认退出账号？</view>
        <view class="logout-desc">
          退出后将返回未登录状态，下次使用需要重新登录。
        </view>

        <view class="logout-actions">
          <view class="logout-btn logout-btn-cancel" @tap="onCancelLogout">
            再想想
          </view>
          <view class="logout-btn logout-btn-confirm" @tap="onConfirmLogout">
            退出登录
          </view>
        </view>
      </view>
    </common-modal>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import {
  websiteUrl,
  global,
  asyncGetUserInfo,
  getUserInfo
} from '@/common/config.js'

const emit = defineEmits(['action'])

const items = [
  { key: 'profile', label: '基本信息设置' },
  { key: 'address', label: '地址设置' },
  { key: 'logout', label: '退出账号' }
]

// 控制退出确认弹窗
const showLogoutConfirm = ref(false)

function handleClick(key) {
  if (key === 'logout') {
    showLogoutConfirm.value = true
  } else {
    emit('action', key)
  }
}

// 确认退出
function onConfirmLogout() {
  showLogoutConfirm.value = false
  // 清理本地登录态 
  uni.removeStorageSync('token') 
  global.isLogin = false 
  global.userInfo = {} 
  uni.showToast({ title: '已退出', icon: 'none' })
}

// 取消退出
function onCancelLogout() {
  showLogoutConfirm.value = false
}

// 逐个滑入动画延迟
const itemStyle = index => {
  const delay = index * 80 // 每个 item 相差 80ms
  return {
    animationDelay: `${delay}ms`
  }
}
</script>

<style lang="scss" scoped>
.settings-panel {
  padding: 32rpx 40rpx 40rpx;
  box-sizing: border-box;
}

/* 进入动画：从左侧滑入 + 淡入 */
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-40rpx);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 每一行是一个“无边框按钮” */
.settings-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 26rpx 32rpx;
  margin-bottom: 20rpx;
  border-radius: 999rpx;
  background-image: linear-gradient(90deg, #e1e1e1 0%, #ffffff 100%);
  color: #666666;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.03);
  transition: background 0.18s ease, transform 0.12s ease;

  opacity: 0;
  transform: translateX(-40rpx);
  animation-name: slideInLeft;
  animation-duration: 0.3s;
  animation-timing-function: ease-out;
  animation-fill-mode: forwards;
}

/* 点击时稍微有点反馈 */
.settings-item:active {
  background: #eef5ff;
  transform: translateY(2rpx);
}

.settings-label {
  font-size: 28rpx;
}

/* 箭头 icon */
.settings-arrow-icon {
  margin-left: 12rpx;
  transform: translateX(4rpx);
}

/* ==== 退出确认弹窗 UI ==== */
.logout-modal {
  padding: 32rpx 24rpx 24rpx;
  box-sizing: border-box;
   width: calc(80vw - 70rpx);
}

.logout-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #222222;
  text-align: center;
}

.logout-desc {
  margin-top: 16rpx;
  font-size: 26rpx;
  color: #777777;
  line-height: 1.6;
  text-align: center;
}

.logout-actions {
  margin-top: 32rpx;
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
}

.logout-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 999rpx;
  font-size: 28rpx;
}

/* 取消按钮：浅灰 */
.logout-btn-cancel {
  background: #f5f5f5;
  color: #666666;
}

/* 确认按钮：渐变高亮 */
.logout-btn-confirm {
  background-image: linear-gradient(90deg, #ffa0a0 0%, #ffacac 100%);
  color: #ffffff;
}
</style>
