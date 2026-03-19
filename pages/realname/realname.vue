<template>
  <view class="realname-page">
    <view class="hero-card">
      <text class="hero-badge">账户安全升级</text>
      <text class="hero-title">实名认证</text>
      <text class="hero-desc">
        认证分两步：先做手机号三要素校验，再跳转支付宝完成人脸核验。
      </text>
    </view>

    <view class="section-card">
      <view class="section-head">
        <text class="section-title">当前状态</text>
        <text class="status-pill" :class="statusClass">{{ statusText }}</text>
      </view>

      <view class="stage-banner">
        <text class="stage-label">当前阶段</text>
        <text class="stage-value">{{ statusData.current_stage_text || '待发起实名认证' }}</text>
      </view>

      <view class="status-grid">
        <view class="status-cell">
          <text class="cell-label">认证姓名</text>
          <text class="cell-value">{{ statusData.real_name_masked || '暂无' }}</text>
        </view>
        <view class="status-cell">
          <text class="cell-label">身份证号</text>
          <text class="cell-value">{{ statusData.id_card_no_masked || '暂无' }}</text>
        </view>
        <view class="status-cell">
          <text class="cell-label">手机号</text>
          <text class="cell-value">{{ statusData.mobile_masked || '暂无' }}</text>
        </view>
        <view class="status-cell">
          <text class="cell-label">认证通道</text>
          <text class="cell-value">支付宝实名认证</text>
        </view>
        <view class="status-cell">
          <text class="cell-label">三要素通过时间</text>
          <text class="cell-value">{{ formatTime(statusData.three_factor_passed_at) }}</text>
        </view>
        <view class="status-cell">
          <text class="cell-label">实名完成时间</text>
          <text class="cell-value">{{ formatTime(statusData.verified_at || statusData.finished_at) }}</text>
        </view>
      </view>

      <view class="substage-item">
        <view class="substage-head">
          <text class="substage-title">三要素预校验</text>
          <text class="substage-state" :class="{ success: statusData.three_factor_passed, danger: statusData.status === 'three_factor_failed' }">
            {{ threeFactorStatusText }}
          </text>
        </view>
        <text class="substage-desc">{{ statusData.three_factor_message || '提交姓名、身份证号、手机号后开始校验。' }}</text>
        <text v-if="statusData.three_factor_passed_at" class="substage-time">
          通过时间：{{ formatTime(statusData.three_factor_passed_at) }}
        </text>
      </view>

      <view class="substage-item">
        <view class="substage-head">
          <text class="substage-title">支付宝活体核验</text>
          <text class="substage-state" :class="{ success: statusData.liveness_passed, danger: statusData.status === 'liveness_failed' }">
            {{ livenessStatusText }}
          </text>
        </view>
        <text class="substage-desc">{{ statusData.liveness_message || '三要素通过后进入支付宝活体核验。' }}</text>
        <text v-if="statusData.liveness_finished_at || statusData.finished_at" class="substage-time">
          完成时间：{{ formatTime(statusData.liveness_finished_at || statusData.finished_at) }}
        </text>
      </view>

      <view v-if="statusData.fail_reason" class="alert-box">
        <text class="alert-title">失败原因</text>
        <text class="alert-text">{{ statusData.fail_reason }}</text>
      </view>
    </view>

    <view class="section-card">
      <view class="section-head">
        <text class="section-title">填写认证信息</text>
      </view>

      <view class="field-block">
        <text class="field-label">真实姓名</text>
        <input
          v-model.trim="form.real_name"
          class="field-input"
          placeholder="请输入与身份证一致的真实姓名"
          placeholder-class="field-placeholder"
        />
      </view>

      <view class="field-block">
        <text class="field-label">身份证号</text>
        <input
          v-model.trim="form.id_card_no"
          class="field-input"
          placeholder="请输入本人身份证号"
          placeholder-class="field-placeholder"
        />
      </view>

      <view class="field-block">
        <text class="field-label">手机号</text>
        <input
          v-model.trim="form.mobile"
          class="field-input"
          type="number"
          placeholder="请输入本人常用手机号"
          placeholder-class="field-placeholder"
        />
      </view>

      <label class="agree-row" @tap="form.agree_protocol = !form.agree_protocol">
        <checkbox :checked="form.agree_protocol" color="#ff8c42" />
        <text class="agree-text">我已阅读并同意发起实名认证校验</text>
      </label>
    </view>

    <view class="footer-bar">
      <text class="footer-tip">{{ footerTipText }}</text>
      <view class="submit-btn" :class="{ disabled: submitting || buttonDisabled }" @tap="submitVerify">
        {{ submitButtonText }}
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
  current_stage: 'draft',
  current_stage_text: '',
  real_name_masked: '',
  id_card_no_masked: '',
  mobile_masked: '',
  provider_launch_url: '',
  launch_ready: false,
  started_at: 0,
  finished_at: 0,
  verified_at: 0,
  fail_reason: '',
  three_factor_passed: false,
  three_factor_message: '',
  three_factor_vendor: '',
  three_factor_passed_at: 0,
  liveness_required: true,
  liveness_passed: false,
  liveness_message: '',
  liveness_vendor: '',
  liveness_finished_at: 0,
  next_action: 'submit_info'
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
  if (statusData.value.status === 'three_factor_failed') return '三要素未通过'
  if (statusData.value.status === 'liveness_failed') return '活体未通过'
  if (statusData.value.status === 'processing') return '认证进行中'
  return '未认证'
})

const statusClass = computed(() => {
  if (statusData.value.verified) return 'is-success'
  if (statusData.value.status === 'three_factor_failed' || statusData.value.status === 'liveness_failed') return 'is-danger'
  if (statusData.value.status === 'processing') return 'is-processing'
  return 'is-default'
})

const threeFactorStatusText = computed(() => {
  if (statusData.value.three_factor_passed) return '已通过'
  if (statusData.value.status === 'three_factor_failed') return '未通过'
  if (statusData.value.current_stage === 'draft') return '待校验'
  return '校验中'
})

const livenessStatusText = computed(() => {
  if (statusData.value.liveness_passed) return '已完成'
  if (statusData.value.status === 'liveness_failed') return '未通过'
  if (statusData.value.three_factor_passed) return '待完成'
  return '未开始'
})

const buttonDisabled = computed(() => {
  return statusData.value.verified || (statusData.value.three_factor_passed && !statusData.value.launch_ready)
})

const submitButtonText = computed(() => {
  if (submitting.value) return '提交中...'
  if (statusData.value.verified) return '已完成实名认证'
  if (statusData.value.next_action === 'go_liveness' && statusData.value.provider_launch_url) return '继续前往支付宝认证'
  if (statusData.value.status === 'three_factor_failed') return '重新提交认证信息'
  if (statusData.value.three_factor_passed && !statusData.value.launch_ready) return '等待活体链接配置'
  return '开始认证'
})

const footerTipText = computed(() => {
  if (statusData.value.verified) return '实名认证已完成，无需重复发起。'
  if (statusData.value.three_factor_passed && !statusData.value.launch_ready) return '三要素已经通过，当前只差支付宝活体链接配置。'
  if (statusData.value.next_action === 'go_liveness') return '当前已有实名任务，继续拉起支付宝即可，不会重复创建新任务。'
  return '同一份实名资料在任务未结束前会复用当前任务，不再重复建单。'
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

function formatTime (timestamp) {
  if (!timestamp) return '暂无'
  const date = new Date(Number(timestamp) * 1000)
  if (Number.isNaN(date.getTime())) return '暂无'
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
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

function validateForm () {
  if (!form.value.real_name) {
    uni.showToast({ title: '请输入真实姓名', icon: 'none' })
    return false
  }
  if (!form.value.id_card_no) {
    uni.showToast({ title: '请输入身份证号', icon: 'none' })
    return false
  }
  if (!form.value.mobile) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return false
  }
  if (!form.value.agree_protocol) {
    uni.showToast({ title: '请先勾选认证声明', icon: 'none' })
    return false
  }
  return true
}

async function submitVerify () {
  if (submitting.value) return

  if (statusData.value.verified) {
    uni.showToast({ title: '当前账号已完成实名认证', icon: 'none' })
    return
  }

  if (statusData.value.next_action === 'go_liveness' && statusData.value.provider_launch_url) {
    openLaunchURL(statusData.value.provider_launch_url)
    return
  }

  if (statusData.value.three_factor_passed && !statusData.value.launch_ready) {
    uni.showModal({
      title: '等待活体配置',
      content: '三要素已经通过，但支付宝活体链接还没配置好，暂时不能继续。',
      showCancel: false
    })
    return
  }

  const token = uni.getStorageSync('token')
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  if (!validateForm()) return

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
      title: '实名任务已更新',
      content: data.message || '当前任务已创建，请稍后继续。',
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
  padding: 24rpx 24rpx 280rpx;
  background: linear-gradient(180deg, #eaf7fb 0%, #f8fbfc 100%);
  box-sizing: border-box;
}

.hero-card,
.section-card {
  margin-bottom: 24rpx;
  padding: 28rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 12rpx 28rpx rgba(67, 145, 166, 0.08);
}

.hero-badge,
.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10rpx 20rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  font-weight: 700;
}

.hero-badge {
  background: rgba(255, 140, 66, 0.12);
  color: #ce6f2e;
}

.hero-title {
  display: block;
  margin-top: 20rpx;
  color: #21313a;
  font-size: 60rpx;
  font-weight: 800;
}

.hero-desc {
  display: block;
  margin-top: 16rpx;
  color: #667d86;
  font-size: 26rpx;
  line-height: 1.7;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.section-title {
  color: #22323a;
  font-size: 34rpx;
  font-weight: 800;
}

.status-pill.is-success {
  background: rgba(47, 158, 111, 0.12);
  color: #2f9e6f;
}

.status-pill.is-processing {
  background: rgba(255, 140, 66, 0.12);
  color: #ce6f2e;
}

.status-pill.is-danger {
  background: rgba(216, 95, 95, 0.12);
  color: #d85f5f;
}

.status-pill.is-default {
  background: rgba(109, 132, 141, 0.12);
  color: #6d848d;
}

.stage-banner,
.substage-item,
.alert-box {
  margin-top: 22rpx;
  padding: 22rpx;
  border-radius: 22rpx;
  background: #f6fbfd;
}

.stage-label,
.cell-label,
.alert-title {
  display: block;
  color: #6d848d;
  font-size: 22rpx;
}

.stage-value,
.cell-value,
.substage-title,
.alert-text {
  display: block;
  margin-top: 10rpx;
  color: #22323a;
  font-size: 28rpx;
  line-height: 1.6;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18rpx;
  margin-top: 22rpx;
}

.status-cell {
  padding: 20rpx;
  border-radius: 20rpx;
  background: #fbfefe;
  border: 1rpx solid rgba(100, 184, 207, 0.14);
}

.substage-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.substage-state {
  font-size: 24rpx;
  font-weight: 700;
  color: #6d848d;
}

.substage-state.success {
  color: #2f9e6f;
}

.substage-state.danger {
  color: #d85f5f;
}

.substage-desc,
.substage-time {
  display: block;
  margin-top: 10rpx;
  color: #6d848d;
  font-size: 24rpx;
  line-height: 1.7;
}

.field-block + .field-block {
  margin-top: 22rpx;
}

.field-label {
  display: block;
  margin-bottom: 12rpx;
  color: #22323a;
  font-size: 26rpx;
  font-weight: 700;
}

.field-input {
  height: 92rpx;
  padding: 0 24rpx;
  border-radius: 18rpx;
  background: #fbf8f2;
  border: 1rpx solid rgba(192, 160, 130, 0.18);
  font-size: 28rpx;
  color: #22323a;
}

.field-placeholder {
  color: #b6a392;
}

.agree-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 24rpx;
}

.agree-text {
  flex: 1;
  color: #6d848d;
  font-size: 24rpx;
  line-height: 1.6;
}

.footer-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  padding: 20rpx 24rpx calc(env(safe-area-inset-bottom) + 20rpx);
  background: rgba(250, 254, 255, 0.96);
  box-shadow: 0 -8rpx 24rpx rgba(65, 126, 145, 0.08);
}

.footer-tip {
  display: block;
  margin-bottom: 18rpx;
  color: #6d848d;
  font-size: 24rpx;
  line-height: 1.7;
}

.submit-btn {
  height: 96rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #8bd7ea 0%, #57bfd6 48%, #3da7c0 100%);
  color: #fff;
  font-size: 30rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-btn.disabled {
  opacity: 0.6;
}
</style>
