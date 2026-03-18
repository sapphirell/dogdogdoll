<template>
  <view class="realname-page">
    <view class="hero-card">
      <view class="hero-title">支付宝实名认证</view>
      <view class="hero-desc">
        通过支付宝完成实名与人脸核验，提升账号信任度。初版先走支付宝跳转链路。
      </view>
      <view class="hero-tags">
        <text class="hero-tag">支付宝背书</text>
        <text class="hero-tag">人脸核验</text>
        <text class="hero-tag">平台留痕</text>
      </view>
    </view>

    <view class="status-card">
      <view class="card-title">当前状态</view>
      <view class="status-row">
        <text class="status-label">认证状态</text>
        <text class="status-value" :class="{ success: statusData.verified }">
          {{ statusText }}
        </text>
      </view>
      <view v-if="statusData.real_name_masked" class="status-row">
        <text class="status-label">认证姓名</text>
        <text class="status-value">{{ statusData.real_name_masked }}</text>
      </view>
      <view v-if="statusData.id_card_no_masked" class="status-row">
        <text class="status-label">身份证号</text>
        <text class="status-value">{{ statusData.id_card_no_masked }}</text>
      </view>
      <view v-if="statusData.mobile_masked" class="status-row">
        <text class="status-label">手机号</text>
        <text class="status-value">{{ statusData.mobile_masked }}</text>
      </view>
      <view v-if="statusData.fail_reason" class="status-error">
        {{ statusData.fail_reason }}
      </view>
    </view>

    <view class="form-card">
      <view class="card-title">填写认证信息</view>
      <input v-model.trim="form.real_name" class="field-input" placeholder="请输入真实姓名" />
      <input v-model.trim="form.id_card_no" class="field-input" placeholder="请输入身份证号" />
      <input v-model.trim="form.mobile" class="field-input" type="number" placeholder="请输入手机号" />

      <label class="agree-row" @tap="form.agree_protocol = !form.agree_protocol">
        <checkbox :checked="form.agree_protocol" color="#5bbad5" />
        <text class="agree-text">我已知晓并同意发起支付宝实名认证</text>
      </label>

      <view class="submit-btn" :class="{ disabled: submitting }" @tap="submitVerify">
        {{ submitting ? '提交中...' : (statusData.verified ? '重新发起认证' : '去支付宝认证') }}
      </view>
      <view class="tip-text">
        若后端尚未配置支付宝正式链接，系统会先保存实名任务，后续可直接补齐接入。
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { websiteUrl } from '@/common/config.js'

const statusData = ref({
  verified: false,
  status: 'draft',
  real_name_masked: '',
  id_card_no_masked: '',
  mobile_masked: '',
  provider_launch_url: '',
  fail_reason: ''
})

const form = ref({
  real_name: '',
  id_card_no: '',
  mobile: '',
  agree_protocol: true
})

const submitting = ref(false)

const statusText = computed(() => {
  if (statusData.value.verified) return '已认证'
  if (statusData.value.status === 'processing') return '认证进行中'
  if (statusData.value.status === 'rejected') return '认证未通过'
  if (statusData.value.status === 'cancelled') return '已取消'
  return '未认证'
})

async function fetchStatus () {
  const token = uni.getStorageSync('token')
  if (!token) return
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/realname/status`,
      method: 'GET',
      header: { Authorization: token }
    })
    if (String(res?.data?.status || '').toLowerCase() === 'success' && res?.data?.data) {
      statusData.value = { ...statusData.value, ...res.data.data }
    }
  } catch (e) {}
}

function openLaunchURL (launchURL) {
  if (!launchURL) return false
  // #ifdef APP-PLUS
  if (typeof plus !== 'undefined' && plus.runtime && plus.runtime.openURL) {
    plus.runtime.openURL(launchURL)
    return true
  }
  // #endif
  // #ifdef H5
  window.location.href = launchURL
  return true
  // #endif
  return false
}

async function submitVerify () {
  if (submitting.value) return
  const token = uni.getStorageSync('token')
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  submitting.value = true
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/realname/start`,
      method: 'POST',
      header: {
        Authorization: token,
        'Content-Type': 'application/json'
      },
      data: form.value
    })
    const body = res?.data || {}
    if (String(body.status || '').toLowerCase() !== 'success') {
      uni.showToast({ title: body.msg || '发起认证失败', icon: 'none' })
      return
    }

    const data = body.data || {}
    await fetchStatus()

    if (openLaunchURL(data.provider_launch_url)) {
      uni.showToast({ title: '正在打开支付宝', icon: 'none' })
      return
    }

    uni.showModal({
      title: '实名认证任务已创建',
      content: data.message || '支付宝跳转链接暂未配置，请稍后重试。',
      showCancel: false
    })
  } catch (e) {
    uni.showToast({ title: '发起认证失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchStatus()
})
</script>

<style lang="scss" scoped>
.realname-page {
  min-height: 100vh;
  padding: 24rpx;
  background: linear-gradient(180deg, #f7fbff 0%, #f5f5f5 100%);
  box-sizing: border-box;
}

.hero-card,
.status-card,
.form-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx;
  box-shadow: 0 10rpx 30rpx rgba(31, 56, 88, 0.06);
  margin-bottom: 24rpx;
}

.hero-title,
.card-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #222;
}

.hero-desc {
  margin-top: 14rpx;
  font-size: 26rpx;
  line-height: 1.7;
  color: #666;
}

.hero-tags {
  margin-top: 18rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
}

.hero-tag {
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  background: #eef7ff;
  color: #4086c9;
  font-size: 22rpx;
}

.status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20rpx;
}

.status-label {
  color: #666;
  font-size: 26rpx;
}

.status-value {
  color: #222;
  font-size: 26rpx;
}

.status-value.success {
  color: #26a269;
  font-weight: 700;
}

.status-error {
  margin-top: 20rpx;
  color: #d95050;
  font-size: 24rpx;
  line-height: 1.6;
}

.field-input {
  height: 88rpx;
  margin-top: 20rpx;
  padding: 0 24rpx;
  border-radius: 18rpx;
  background: #f7f9fc;
  font-size: 28rpx;
  color: #222;
}

.agree-row {
  margin-top: 24rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.agree-text {
  font-size: 24rpx;
  color: #666;
}

.submit-btn {
  margin-top: 28rpx;
  height: 92rpx;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #57b5d9 0%, #79c8ab 100%);
  color: #fff;
  font-size: 30rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-btn.disabled {
  opacity: 0.6;
}

.tip-text {
  margin-top: 18rpx;
  font-size: 23rpx;
  line-height: 1.7;
  color: #8a8a8a;
}
</style>
