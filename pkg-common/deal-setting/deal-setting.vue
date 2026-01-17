<template>
  <view-logs />
  <view class="settings-container font-alimamashuhei">
    <view
      v-for="(item, index) in menuItems"
      :key="index"
      class="menu-item"
      @click="item.action"
    >
      <text class="menu-label">{{ item.label }}</text>
      <view class="menu-value">
        <text :class="item.isSet ? 'active' : 'inactive'">{{ item.displayValue }}</text>
        <uni-icons type="right" size="16" color="#ccc" style="margin-left: 10rpx;"></uni-icons>
      </view>
    </view>

    <common-modal :visible="showAuthModal" width="600rpx" @update:visible="showAuthModal = $event">
      <view class="modal-content-box">
        <view class="modal-title">提示</view>
        <view class="modal-desc">为了您的账户安全，进行此操作前必须先设置交易密码。</view>
        
        <view class="modal-actions">
          <view class="modal-btn single-gray-btn" @click="showAuthModal = false">
            知道了
          </view>
        </view>
      </view>
    </common-modal>

  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app' // 引入 onShow
import {
  websiteUrl,
  asyncGetUserInfo,
  global,
} from "@/common/config.js";

uni.setNavigationBarTitle({ title: '交易设置' });

const showAuthModal = ref(false)

// 判断是否设置了交易密码
const hasTradePassword = computed(() => {
  return !!(global.userInfo && global.userInfo.trade_password);
})

// 判断是否设置了收款码 (只要设置了微信或支付宝其中一个即视为已设置)
const hasPaymentCode = computed(() => {
  return !!(global.userInfo && (global.userInfo.wechat_payment_code || global.userInfo.alipay_payment_code));
})

const menuItems = computed(() => [
  {
    label: '设置地址',
    isSet: false, // 地址一般不做强制已设置校验，常驻入口
    displayValue: '去设置',
    action: jump2Address
  },
  {
    label: '设置交易密码',
    isSet: hasTradePassword.value,
    displayValue: hasTradePassword.value ? '修改密码' : '去设置',
    action: jump2TradePassword
  },
  {
    label: '设置收款码',
    isSet: hasPaymentCode.value, 
    displayValue: hasPaymentCode.value ? '已设置' : '去设置',
    action: () => handleGuardedAction(jump2PaymentCode)
  },
  {
    label: '实名认证',
    isSet: !!global.userInfo.is_real_name,
    displayValue: global.userInfo.is_real_name ? '已认证' : '去认证',
    action: () => handleGuardedAction(jump2RealName)
  }
])

// 守卫逻辑：检查交易密码
function handleGuardedAction(callback) {
  if (!hasTradePassword.value) {
    showAuthModal.value = true;
    return;
  }
  callback();
}

// ===== 跳转方法 =====

function jump2Address() {
  uni.navigateTo({ url: '/pkg-common/address/address-list' }) 
}

function jump2TradePassword() {
  // 注意：确保此路径在 pages.json 中已注册
  uni.navigateTo({ url: '/pkg-common/deal-setting/trade-password/trade-password' }) 
}

function jump2PaymentCode() {
  // 跳转到刚才做好的收款码设置页
  uni.navigateTo({ url: '/pkg-common/deal-setting/payment-code/payment-code' }) 
}

function jump2RealName() {
  if (global.userInfo.is_real_name) {
     uni.showToast({ title: '您已完成实名认证', icon: 'none' });
     return;
  }
  uni.navigateTo({ url: '/pages/setting/real_name/real_name' }) 
}

// 使用 onShow 替代 onMounted
// 这样当用户从“设置密码”页面返回时，会自动刷新用户信息，更新列表状态
onShow(() => {
  asyncGetUserInfo()
})
</script>

<style lang="less" scoped>
@primary-color: #4cbbd0;
@text-color: #333;
@secondary-text: #999;

.settings-container {
  padding: 24rpx;
  background: #f8f8f8;
  min-height: 100vh;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  margin-bottom: 24rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;

  &:active {
    background: #fafafa;
    transform: scale(0.98);
  }
}

.menu-label {
  font-size: 30rpx;
  color: @text-color;
  font-weight: 500;
}

.menu-value {
  display: flex;
  align-items: center;
  gap: 8rpx;

  text {
    font-size: 28rpx;

    &.active {
      color: @secondary-text;
    }

    &.inactive {
      color: @primary-color;
      font-weight: 500;
    }
  }
}

/* === 弹窗内容样式 === */
.modal-content-box {
  padding: 20rpx 30rpx 10rpx 30rpx;
}

.modal-title {
  font-size: 34rpx;
  font-weight: bold;
  text-align: center;
  color: #333;
  margin-bottom: 30rpx;
}

.modal-desc {
  font-size: 28rpx;
  color: #666;
  text-align: center;
  line-height: 1.6;
  margin-bottom: 60rpx; 
  padding: 0 10rpx;
}

.modal-actions {
  display: flex;
  justify-content: center;
  margin-bottom: 40rpx;
  
  .modal-btn.single-gray-btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    text-align: center;
    border-radius: 44rpx;
    font-size: 30rpx;
    font-weight: 500;
    background-color: #f5f6f8; 
    color: #666;
    border: none;
    
    &:active {
      background-color: #ebedf0;
      opacity: 0.9;
    }
  }
}
</style>