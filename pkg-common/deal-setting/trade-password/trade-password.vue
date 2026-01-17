<template>
  <view-logs />
  <view class="password-container">
    <view class="form-wrapper">
      
      <view class="input-group">
        <view class="input-item">
          <input 
            class="input" 
            type="number" 
            :password="!showPassword"
            placeholder=" " 
            v-model="tradePassword" 
            maxlength="6"
          />
          <label class="floating-label">6位数字交易密码</label>
          <view class="input-icon-wrapper" @click="showPassword = !showPassword">
            <uni-icons 
              :type="showPassword ? 'eye-filled' : 'eye-slash-filled'" 
              size="20" 
              color="#999" 
            />
          </view>
        </view>
      </view>

      <view class="input-group">
        <view class="input-item">
          <input 
            class="input verify-input" 
            type="number" 
            placeholder=" " 
            v-model="verifyCode" 
            maxlength="6"
          />
          <label class="floating-label">短信验证码</label>
          
          <view class="verify-btn-wrapper">
            <text 
              class="verify-btn" 
              :class="{ disabled: isCounting }" 
              @click="getVerifyCode"
            >
              {{ isCounting ? `${countdown}s后重发` : '获取验证码' }}
            </text>
          </view>
        </view>
      </view>

      <button 
        class="submit-btn" 
        :class="{active: isFormValid}" 
        @click="handleSubmit"
        :disabled="!isFormValid || isLoading"
      >
        {{ isLoading ? '提交中...' : '确认设置' }}
        <view class="loading" v-if="isLoading"></view>
      </button>
    </view>

<!--    <view class="security-tips">
      <view class="tips-icon">
        <uni-icons type="info" size="18" color="#666" />
      </view>
      <text class="tips-text">为了您的资产安全，交易密码必须为6位纯数字。</text>
    </view> -->
  </view>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { websiteUrl, global } from "../../../common/config.js"

uni.setNavigationBarTitle({
  title: '设置交易密码'
})

// 表单数据
const tradePassword = ref('')
const verifyCode = ref('')
const showPassword = ref(false)
const isLoading = ref(false)

// 验证码倒计时相关
const isCounting = ref(false)
const countdown = ref(60)
let timer = null

// 表单验证逻辑
const isFormValid = computed(() => {
  // 密码必须是6位数字，验证码不为空
  const pwdRegex = /^\d{6}$/
  return pwdRegex.test(tradePassword.value) && verifyCode.value.length >= 4
})

// 获取验证码
async function getVerifyCode() {
  if (isCounting.value) return
  
  const phone = global.userInfo.tel_phone
  if (!phone) {
    uni.showToast({ title: '无法获取绑定手机号，请先绑定手机', icon: 'none' })
    return
  }

  try {
    uni.showLoading({ title: '发送中...' })
    const res = await uni.request({
      url: websiteUrl.value + '/send-sms-code',
      method: 'POST',
      data: {
        tel_phone: phone,
        type: 'change_trade_password'
      }
    })
    uni.hideLoading()

    if (res.data.status === "success") {
      uni.showToast({ title: '验证码已发送', icon: 'success' })
      startCountdown()
    } else {
      uni.showToast({ title: res.data.msg || '发送失败', icon: 'none' })
    }
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: '网络请求失败', icon: 'none' })
  }
}

// 倒计时逻辑
function startCountdown() {
  isCounting.value = true
  countdown.value = 60
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
      isCounting.value = false
      countdown.value = 60
    }
  }, 1000)
}

// 提交设置
async function handleSubmit() {
  if (!isFormValid.value || isLoading.value) return

  try {
    isLoading.value = true
    const res = await uni.request({
      url: websiteUrl.value + '/with-state/setting-trade-password',
      method: 'POST',
      header: {
        'Authorization': uni.getStorageSync('token')
      },
      data: {
        code: verifyCode.value,
        trade_password: tradePassword.value
      }
    })

    if (res.data.status === "success") {
      uni.showToast({ title: '设置成功', icon: 'success' })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    } else {
      uni.showToast({ title: res.data.msg || '设置失败', icon: 'none' })
    }
  } catch (error) {
    uni.showToast({ title: '请求失败，请稍后重试', icon: 'none' })
  } finally {
    isLoading.value = false
  }
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style lang="less" scoped>
@primary-color: #65C3D6;
@primary-dark: #4CA1AF;
@bg-color: #f5f7fa;

.password-container {
  padding: 40rpx;
  background: @bg-color;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.form-wrapper {
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);
}

.input-group {
  margin-bottom: 40rpx;
}

.input-item {
  margin-bottom: 48rpx;
  position: relative;

  &:last-child {
    margin-bottom: 0;
  }
}

.input {
  height: 100rpx;
  padding: 0 80rpx 0 40rpx;
  font-size: 32rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 16rpx;
  transition: all 0.3s ease;
  letter-spacing: 2rpx;

  &:focus {
    border-color: @primary-color;
    box-shadow: 0 4rpx 12rpx rgba(101, 195, 214, 0.2);

    &+.floating-label {
      transform: translateY(-220%);
      font-size: 26rpx;
      color: @primary-color;
    }
  }
  
  &.verify-input {
    padding-right: 200rpx;
  }
}

.floating-label {
  position: absolute;
  left: 40rpx;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 32rpx;
  pointer-events: none;
  transition: all 0.3s ease;
  background: #fff;
  padding: 0 8rpx;

  .input:not(:placeholder-shown)+&,
  .input:focus+& {
    transform: translateY(-220%);
    font-size: 26rpx;
  }
}

.input-icon-wrapper {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

/* 验证码按钮 */
.verify-btn-wrapper {
  position: absolute;
  right: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
}

.verify-btn {
  font-size: 28rpx;
  color: @primary-color;
  padding: 10rpx 20rpx;
  border-left: 2rpx solid #eee;
  
  &:active {
    opacity: 0.7;
  }
  
  &.disabled {
    color: #ccc;
    pointer-events: none;
  }
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, @primary-color 0%, @primary-dark 100%);
  color: #fff;
  font-size: 32rpx;
  border-radius: 16rpx;
  // 【修复】移除边框的核心代码
  border: none;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  line-height: 96rpx;
  margin-top: 60rpx;

  // 【修复】必须处理伪元素才能真正去除小程序/UniApp按钮边框
  &::after {
    border: none;
  }

  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }

  &.active {
    box-shadow: 0 8rpx 24rpx rgba(101, 195, 214, 0.3);
  }
  
  &[disabled] {
    background: #e0e0e0;
    color: #fff;
    box-shadow: none;
  }

  .loading {
    position: absolute;
    right: 30rpx;
    top: 50%;
    transform: translateY(-50%);
    width: 32rpx;
    height: 32rpx;
    border: 3rpx solid #fff;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
}

/* 底部提示优化 */
.security-tips {
  margin-top: 40rpx;
  padding: 24rpx 30rpx;
  background: #fff;
  border-radius: 16rpx;
  display: flex;
  // 【修复】垂直居中对齐，解决图标文字错位
  align-items: center; 
  gap: 16rpx;
  font-size: 26rpx;
  color: #666;
  
  .tips-icon {
    display: flex;
    align-items: center;
    // 【修复】防止图标被文字挤压
    flex-shrink: 0; 
  }
  
  .tips-text {
    flex: 1;
    line-height: 1.5;
    text-align: justify;
  }
}

@keyframes spin {
  to {
    transform: translateY(-50%) rotate(360deg);
  }
}
</style>