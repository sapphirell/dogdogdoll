<!-- components/login-panel/login-panel.vue -->
<template>
  <view class="unlogin-container">
    <image
      src="https://images1.fantuanpu.com/home/jpt.gif"
      mode="aspectFit"
      class="welcome-img"
    />
    <text class="welcome-text">欢迎使用娃圈狗狗助手</text>

    <view class="input-group">
      <view class="input-with-icon">
        <image class="icon" src="/static/user.png" />
        <input
          type="text"
          placeholder="请输入手机号"
          class="inputer"
          v-model="inputPhone"
        />
      </view>
      <view class="input-with-icon">
        <image class="icon" src="/static/key.png" />
        <input
          type="password"
          placeholder="请输入密码"
          class="inputer"
          v-model="inputPassword"
        />
      </view>
    </view>

    <view class="action-links">
      <text class="float-left" @tap="jump2register">注册账号</text>
      <text class="float-right" @tap="jump2forgetPassword">忘记密码</text>
      <view class="clearfix" />
    </view>

    <button class="submit-btn" @click="login">立即登录</button>
    <button
      class="submit-btn"
      v-if="scene === 4"
      @click="wechatSignLogin"
    >
      微信登录
    </button>
    <button
      class="submit-btn"
      @click="jump2index"
      style="background: linear-gradient(135deg, #cdcdcd, #b1b1b1);"
    >
      随便看看→
    </button>

    <!-- 协议勾选 -->
    <view class="agreement-container">
      <checkbox-group @change="handleAgreeChange">
        <label class="agreement-label">
          <checkbox :checked="agree" color="#65C3D6" style="transform:scale(0.8)" />
          <text class="agreement-text">我已阅读并同意</text>
        </label>
      </checkbox-group>

      <view class="agreement-links">
        <text class="agreement-link" @tap="goToPrivacy">《隐私政策》</text>
        <text class="agreement-link" @tap="goToPermissions">《用户协议》</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import {
  websiteUrl,
  wechatSignLogin,
  getUserInfo,
  getScene
} from '@/common/config.js'

const emit = defineEmits(['success'])

const inputPhone = ref('')
const inputPassword = ref('')
const agree = ref(false)
const scene = getScene()

function handleAgreeChange(e) {
  agree.value = e.detail.value.length > 0
}

function goToPrivacy() {
  uni.navigateTo({
    url: '/pages/private/private'
  })
}

function goToPermissions() {
  uni.navigateTo({
    url: '/pages/permission/permission'
  })
}

function jump2register() {
  uni.navigateTo({
    url: '/pages/register/register'
  })
}

function jump2forgetPassword() {
  uni.navigateTo({
    url: '/pages/reset_password/reset_password'
  })
}

function jump2index() {
  uni.showTabBar({ animation: false })
  uni.switchTab({
    url: '/pages/index/index'
  })
}

// 手机号 + 密码登录
function login() {
  if (!agree.value) {
    uni.showToast({
      title: '请先阅读并同意协议',
      icon: 'none'
    })
    return
  }

  if (!inputPhone.value || !inputPassword.value) {
    uni.showToast({
      title: '请输入手机号和密码',
      icon: 'none'
    })
    return
  }

  if (!/^1[3456789]\d{9}$/.test(inputPhone.value)) {
    uni.showToast({
      title: '手机号格式错误',
      icon: 'none'
    })
    return
  }

  if (inputPassword.value.length < 6) {
    uni.showToast({
      title: '密码必须大于6位',
      icon: 'none'
    })
    return
  }

  const phone = inputPhone.value
  const password = inputPassword.value

  uni.request({
    url: websiteUrl.value + '/login',
    method: 'POST',
    data: {
      account: phone,
      password
    },
    success: res => {
      const data = res.data.data
      const status = res.data.status
      if (status !== 'success') {
        uni.showToast({
          title: res.data.msg || '登录失败',
          icon: 'none'
        })
        return
      }

      uni.setStorageSync('token', data.jwt_token)
      uni.setStorageSync('openid', data.open_id)
      uni.setStorageSync('session_key', data.session_key)

      if (data.jwt_token) {
        // 更新用户信息
        getUserInfo()
        // 通知父组件
        emit('success')
      }
    },
    fail: () => {
      uni.showToast({
        title: '登录失败',
        icon: 'none'
      })
    }
  })
}
</script>

<style lang="scss" scoped>
.unlogin-container {
  padding: 40rpx 60rpx 60rpx;
  background: linear-gradient(135deg, #e0f3ff 0%, #fff9fb 100%);
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.welcome-img {
  width: 360rpx;
  height: 380rpx;
  position: relative;
  right: 20rpx;
}

.welcome-text {
  font-size: 34rpx;
  font-weight: 600;
  color: #2c3e50;
  text-align: center;
  position: relative;
  margin-top: 10rpx;
}
.welcome-text::after {
  content: '';
  display: block;
  width: 80rpx;
  height: 6rpx;
  background: #65c3d6;
  margin: 20rpx auto;
  border-radius: 3rpx;
}

.input-group {
  width: 100%;
  margin: 40rpx 0;
}

.inputer {
  height: 80rpx;
  padding: 0 20rpx;
  margin: 30rpx 0;
  border-radius: 16rpx;
  background: #ffffff;
  font-size: 26rpx;
  transition: all 0.3s;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}
.inputer::placeholder {
  color: #bdc3c7;
}

.action-links {
  width: 100%;
  margin: 30rpx 0;
}
.float-left {
  float: left;
}
.float-right {
  float: right;
}
.clearfix {
  clear: both;
}

.input-with-icon {
  position: relative;
}
.input-with-icon .icon {
  position: absolute;
  left: 30rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 40rpx;
  height: 40rpx;
  z-index: 2;
}
.input-with-icon input {
  padding-left: 80rpx !important;
}

.submit-btn {
  margin-top: 40rpx;
  background: linear-gradient(135deg, #a6e9f7, #1ed1e1);
  color: #ffffff;
  border: none;
  border-radius: 50rpx;
  font-size: 26rpx;
  height: 70rpx;
  line-height: 66rpx;
  box-shadow: 0 6rpx 20rpx rgba(166, 233, 247, 0.3);
  transition: all 0.3s;
  width: 100%;
}
.submit-btn::after {
  border: none;
}
.submit-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 12rpx rgba(166, 233, 247, 0.3);
}

/* 协议样式 */
.agreement-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin: 60rpx 0 40rpx;
  font-size: 24rpx;
  color: #666;
}
.agreement-label {
  display: flex;
  align-items: center;
  margin-right: 10rpx;
}
.agreement-text {
  margin-left: 5rpx;
}
.agreement-links {
  display: flex;
}
.agreement-link {
  color: #65c3d6;
  margin-left: 10rpx;
}
.agreement-link:active {
  color: #1ed1e1;
}
</style>
