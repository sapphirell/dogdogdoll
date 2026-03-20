<template>
  <view class="realname-page">
    <view class="hero-section">
      <view class="hero-orb orb-left"></view>
      <view class="hero-orb orb-right"></view>
      <view class="hero-card">
        <view class="hero-copy">
          <text class="hero-badge">账户安全升级</text>
          <view class="hero-title-group">
            <text class="hero-title">实名认证</text>
            <text class="hero-subtitle">提升信任展示，解锁更完整的交易能力</text>
          </view>
          <view class="hero-tags">
            <text class="hero-tag">支付宝通道</text>
            <text class="hero-tag">实名核验</text>
            <text class="hero-tag">信息加密</text>
          </view>
        </view>

        <view class="hero-visual">
          <view class="hero-halo"></view>
          <view class="hero-logo-wrap">
            <image class="hero-logo" src="/static/main/320x320.png" mode="aspectFit" />
          </view>
        </view>
      </view>
    </view>

    <view class="content-shell">
      <view class="section-card">
        <view class="section-header">
          <text class="section-title">实名认证说明</text>
          <text class="section-mark">说明</text>
        </view>
        <text class="section-desc">
          实名认证需要由本人操作完成，请提前准备好本人身份证与常用手机号。整个流程预计 1 分钟左右，
          提交的信息仅用于当前账号实名认证与交易安全校验，我们会按平台规则进行加密保护。
        </text>
        <text class="section-desc section-desc-strong">
          同一身份信息仅可绑定一个平台账号，认证通过后将同步更新账号实名状态展示。
        </text>

        <view class="flow-row">
          <view class="flow-item">
            <view class="flow-icon">1</view>
            <text class="flow-title">填写信息</text>
            <text class="flow-text">姓名、身份证、手机号</text>
          </view>
          <view class="flow-line"></view>
          <view class="flow-item">
            <view class="flow-icon">2</view>
            <text class="flow-title">授权校验</text>
            <text class="flow-text">跳转支付宝完成实名核验</text>
          </view>
          <view class="flow-line"></view>
          <view class="flow-item">
            <view class="flow-icon">3</view>
            <text class="flow-title">完成认证</text>
            <text class="flow-text">返回查看认证结果</text>
          </view>
        </view>
      </view>

      <view class="section-card">
        <view class="section-header">
          <text class="section-title">认证完成后可获得</text>
          <text class="section-mark">权益</text>
        </view>
        <view class="benefit-list">
          <view class="benefit-item">
            <view class="benefit-dot"></view>
            <text class="benefit-text">个人主页与交易场景可显示实名认证标识，增强合作信任感。</text>
          </view>
          <view class="benefit-item">
            <view class="benefit-dot"></view>
            <text class="benefit-text">涉及交易、收款、提现等关键动作时，账号安全等级更高。</text>
          </view>
          <view class="benefit-item">
            <view class="benefit-dot"></view>
            <text class="benefit-text">后续如接入更多保障能力，可优先复用当前实名结果。</text>
          </view>
        </view>
      </view>

      <view class="section-card status-card">
        <view class="section-header">
          <text class="section-title">当前认证状态</text>
          <text class="status-pill" :class="statusClass">{{ statusText }}</text>
        </view>

        <view class="stage-banner">
          <text class="stage-banner-label">当前阶段</text>
          <text class="stage-banner-text">{{ statusData.current_stage_text || '待发起实名认证' }}</text>
        </view>

        <view class="status-grid">
          <view class="status-cell">
            <text class="status-label">认证姓名</text>
            <text class="status-content">{{ statusData.real_name_masked || '暂未认证' }}</text>
          </view>
          <view class="status-cell">
            <text class="status-label">身份证号</text>
            <text class="status-content">{{ statusData.id_card_no_masked || '暂未认证' }}</text>
          </view>
          <view class="status-cell">
            <text class="status-label">手机号</text>
            <text class="status-content">{{ statusData.mobile_masked || '暂未认证' }}</text>
          </view>
          <view class="status-cell">
            <text class="status-label">认证通道</text>
            <text class="status-content">支付宝实名核验</text>
          </view>
        </view>

        <view class="substage-list">
          <view class="substage-item">
            <view class="substage-head">
              <text class="substage-title">身份信息核验</text>
              <text class="substage-value" :class="{ success: statusData.three_factor_passed, muted: !statusData.three_factor_passed }">
                {{ statusData.three_factor_passed ? '已通过' : '待校验' }}
              </text>
            </view>
            <text class="substage-desc">
              {{ threeFactorDisplayMessage }}
            </text>
          </view>

          <view class="substage-item">
            <view class="substage-head">
              <text class="substage-title">刷脸认证</text>
              <text class="substage-value" :class="{ success: statusData.liveness_passed, muted: !statusData.liveness_passed }">
                {{ statusData.liveness_passed ? '已完成' : '待完成' }}
              </text>
            </view>
            <text class="substage-desc">
              {{ livenessDisplayMessage }}
            </text>
          </view>
        </view>

        <view v-if="statusData.fail_reason" class="status-alert">
          <text class="status-alert-label">失败原因</text>
          <text class="status-alert-text">{{ statusData.fail_reason }}</text>
        </view>
      </view>

      <view class="section-card form-card">
        <view class="section-header">
          <text class="section-title">填写认证信息</text>
          <text class="section-mark">表单</text>
        </view>

        <view class="field-block">
          <text class="field-label">真实姓名</text>
          <input
            v-model.trim="form.real_name"
            class="field-input"
            :class="{ 'field-input-disabled': threeFactorInfoLocked }"
            :disabled="threeFactorInfoLocked"
            :placeholder="threeFactorInfoLocked ? '已提交认证信息' : '请输入与身份证一致的真实姓名'"
            placeholder-class="field-placeholder"
          />
        </view>

        <view class="field-block">
          <text class="field-label">身份证号</text>
          <input
            v-model.trim="form.id_card_no"
            class="field-input"
            :class="{ 'field-input-disabled': threeFactorInfoLocked }"
            :disabled="threeFactorInfoLocked"
            :placeholder="threeFactorInfoLocked ? '已提交认证信息' : '请输入本人身份证号码'"
            placeholder-class="field-placeholder"
          />
        </view>

        <view class="field-block">
          <text class="field-label">手机号</text>
          <input
            v-model.trim="form.mobile"
            class="field-input"
            :class="{ 'field-input-disabled': threeFactorInfoLocked }"
            :disabled="threeFactorInfoLocked"
            :type="threeFactorInfoLocked ? 'text' : 'number'"
            :placeholder="threeFactorInfoLocked ? '已提交认证信息' : '请输入本人常用手机号'"
            placeholder-class="field-placeholder"
          />
        </view>

        <text v-if="threeFactorInfoLocked" class="field-lock-tip">
          你已提交过认证信息，当前仅展示脱敏内容，暂不支持重复填写。
        </text>

        <view class="declare-card">
          <text class="declare-title">认证声明</text>
          <text class="declare-text">
            继续操作即表示你确认提交的信息真实有效，并授权平台通过合作方完成实名与安全校验。我们不会将你的身份信息用于与实名认证无关的用途。
          </text>
        </view>

        <label class="agree-row" @tap="form.agree_protocol = !form.agree_protocol">
          <checkbox :checked="form.agree_protocol" color="#ff8c42" />
          <text class="agree-text">我已阅读并同意发起实名认证校验</text>
        </label>
      </view>
    </view>

    <view class="footer-bar">
      <view class="footer-tip">
        <text class="footer-tip-title">认证方式</text>
        <text class="footer-tip-text">当前将跳转支付宝完成实名核验，认证结束后自动返回结果页。</text>
      </view>
      <view class="submit-btn" :class="{ disabled: submitting }" @tap="submitVerify">
        {{ submitButtonText }}
      </view>
      <text class="footer-note">港澳台及海外用户通道将在后续版本开放</text>
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
  fail_reason: '',
  three_factor_passed: false,
  three_factor_message: '',
  three_factor_vendor: '',
  liveness_required: true,
  liveness_passed: false,
  liveness_message: '',
  liveness_vendor: '',
  next_action: 'submit_info'
})

const form = ref({
  real_name: '',
  id_card_no: '',
  mobile: '',
  agree_protocol: true
})

const submitting = ref(false)

const threeFactorInfoLocked = computed(() => {
  return Boolean(
    statusData.value.real_name_masked ||
    statusData.value.id_card_no_masked ||
    statusData.value.mobile_masked ||
    statusData.value.current_stage !== 'draft' ||
    statusData.value.next_action === 'go_liveness'
  )
})

const statusText = computed(() => {
  if (statusData.value.verified) return '已认证'
  if (statusData.value.status === 'processing') return '认证进行中'
  if (statusData.value.status === 'rejected') return '认证未通过'
  if (statusData.value.status === 'cancelled') return '已取消'
  return '未认证'
})

const statusClass = computed(() => {
  if (statusData.value.verified) return 'is-success'
  if (statusData.value.status === 'processing') return 'is-processing'
  if (statusData.value.status === 'rejected') return 'is-danger'
  return 'is-default'
})

const submitButtonText = computed(() => {
  if (submitting.value) return '提交中...'
  if (statusData.value.verified) return '已完成实名认证'
  if (statusData.value.next_action === 'go_liveness') return '继续前往支付宝认证'
  if (threeFactorInfoLocked.value) return '认证信息已提交'
  return '开始认证'
})

function isMeaninglessStageMessage (message) {
  const text = String(message || '').trim()
  if (!text) return true
  const normalized = text.toLowerCase()
  return [
    '1000',
    'true',
    'false',
    'success',
    'passed',
    'pass',
    'ok'
  ].includes(normalized)
}

const threeFactorDisplayMessage = computed(() => {
  const message = String(statusData.value.three_factor_message || '').trim()
  if (!isMeaninglessStageMessage(message)) return message
  if (statusData.value.three_factor_passed) return '已完成身份信息核验。'
  return '填写个人信息后开始核验。'
})

const livenessDisplayMessage = computed(() => {
  const message = String(statusData.value.liveness_message || '').trim()
  if (!isMeaninglessStageMessage(message)) return message
  if (statusData.value.liveness_passed) return '已完成支付宝刷脸认证。'
  if (statusData.value.three_factor_passed || statusData.value.next_action === 'go_liveness') {
    return '前往支付宝完成刷脸认证。'
  }
  return '身份信息核验通过后，前往支付宝完成刷脸认证。'
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
      if (threeFactorInfoLocked.value) {
        form.value.real_name = statusData.value.real_name_masked || ''
        form.value.id_card_no = statusData.value.id_card_no_masked || ''
        form.value.mobile = statusData.value.mobile_masked || ''
      }
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

  if (threeFactorInfoLocked.value) {
    uni.showToast({ title: '认证信息已提交，请按当前状态继续', icon: 'none' })
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
      title: '认证任务已创建',
      content: data.message || '支付宝认证链接暂未配置，请稍后重试。',
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
  --bg: #eef8fb;
  --surface: #ffffff;
  --surface-soft: rgba(247, 252, 253, 0.92);
  --primary: #64b8cf;
  --primary-strong: #3a9bb6;
  --primary-soft: #ecf8fb;
  --accent: #9eddec;
  --text: #22323a;
  --muted: #6d848d;
  --line: rgba(100, 184, 207, 0.16);
  --success: #2f9e6f;
  --danger: #d85f5f;
  min-height: 100vh;
  padding-bottom: 340rpx;
  background:
    radial-gradient(circle at top right, rgba(166, 233, 247, 0.42), transparent 32%),
    linear-gradient(180deg, #dff5fb 0%, #eef8fb 22%, #f7fbfc 100%);
  box-sizing: border-box;
}

.hero-section {
  position: relative;
  overflow: hidden;
  padding: 28rpx 24rpx 0;
}

.hero-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(8rpx);
}

.orb-left {
  left: -44rpx;
  top: 62rpx;
  width: 180rpx;
  height: 180rpx;
  background: rgba(166, 233, 247, 0.34);
}

.orb-right {
  right: -30rpx;
  top: 18rpx;
  width: 220rpx;
  height: 220rpx;
  background: rgba(124, 193, 210, 0.18);
}

.hero-card {
  position: relative;
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  padding: 36rpx 32rpx 44rpx;
  border-radius: 32rpx;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(237, 248, 251, 0.95));
  box-shadow: 0 24rpx 50rpx rgba(49, 121, 140, 0.12);
}

.hero-copy {
  flex: 1;
  min-width: 0;
  max-width: 410rpx;
  position: relative;
  z-index: 2;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  height: 52rpx;
  padding: 0 24rpx;
  border-radius: 999rpx;
  background: rgba(217, 112, 46, 0.12);
  color: var(--primary-strong);
  font-size: 22rpx;
  font-weight: 700;
  letter-spacing: 1rpx;
}

.hero-title-group {
  margin-top: 24rpx;
}

.hero-title {
  display: block;
  color: var(--text);
  font-size: 68rpx;
  line-height: 1.04;
  font-weight: 800;
  letter-spacing: 2rpx;
}

.hero-subtitle {
  display: block;
  margin-top: 16rpx;
  color: var(--muted);
  font-size: 25rpx;
  line-height: 1.7;
}

.hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
  margin-top: 28rpx;
}

.hero-tag {
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.72);
  border: 1rpx solid rgba(217, 112, 46, 0.12);
  color: #9d5b2f;
  font-size: 22rpx;
}

.hero-visual {
  position: relative;
  width: 210rpx;
  flex: 0 0 210rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.hero-halo {
  position: absolute;
  width: 212rpx;
  height: 212rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(158, 221, 236, 0.9), rgba(158, 221, 236, 0.08));
}

.hero-logo-wrap {
  position: relative;
  width: 188rpx;
  height: 188rpx;
  border-radius: 42rpx;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(236, 248, 251, 0.84));
  border: 1rpx solid rgba(124, 193, 210, 0.22);
  box-shadow: 0 20rpx 36rpx rgba(67, 145, 166, 0.16);
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateY(10rpx);
}

.hero-logo {
  width: 150rpx;
  height: 150rpx;
  opacity: 0.98;
}

.content-shell {
  padding: 24rpx;
}

.section-card {
  margin-bottom: 24rpx;
  padding: 30rpx 28rpx;
  border-radius: 28rpx;
  background: var(--surface);
  box-shadow: 0 12rpx 34rpx rgba(65, 126, 145, 0.08);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.section-title {
  color: var(--text);
  font-size: 40rpx;
  font-weight: 800;
  line-height: 1.2;
}

.section-mark {
  flex: 0 0 auto;
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  background: var(--primary-soft);
  color: var(--primary-strong);
  font-size: 20rpx;
  font-weight: 700;
}

.section-desc {
  display: block;
  margin-top: 24rpx;
  color: #5f554d;
  font-size: 28rpx;
  line-height: 1.85;
}

.section-desc-strong {
  color: #493d33;
  font-weight: 700;
}

.flow-row {
  display: flex;
  align-items: flex-start;
  margin-top: 34rpx;
}

.flow-item {
  flex: 1;
  text-align: center;
}

.flow-icon {
  width: 76rpx;
  height: 76rpx;
  margin: 0 auto;
  border-radius: 50%;
  background: linear-gradient(180deg, #9adced, #63bcd4);
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 800;
  line-height: 76rpx;
  box-shadow: inset 0 0 0 1rpx rgba(217, 112, 46, 0.1);
  box-shadow:
    inset 0 0 0 1rpx rgba(255, 255, 255, 0.22),
    0 10rpx 22rpx rgba(58, 155, 182, 0.22);
}

.flow-title {
  display: block;
  margin-top: 18rpx;
  color: var(--text);
  font-size: 28rpx;
  font-weight: 700;
}

.flow-text {
  display: block;
  margin-top: 10rpx;
  color: var(--muted);
  font-size: 22rpx;
  line-height: 1.55;
}

.flow-line {
  flex: 0 0 44rpx;
  height: 2rpx;
  margin-top: 38rpx;
  background: linear-gradient(90deg, rgba(217, 112, 46, 0.18), rgba(217, 112, 46, 0.62), rgba(217, 112, 46, 0.18));
}

.benefit-list {
  margin-top: 26rpx;
}

.benefit-item {
  display: flex;
  align-items: flex-start;
  gap: 18rpx;
}

.benefit-item + .benefit-item {
  margin-top: 24rpx;
}

.benefit-dot {
  width: 12rpx;
  height: 12rpx;
  margin-top: 14rpx;
  border-radius: 50%;
  background: linear-gradient(180deg, #8fd4e6, #4baec7);
  box-shadow: 0 0 0 10rpx rgba(124, 193, 210, 0.14);
  flex: 0 0 auto;
}

.benefit-text {
  flex: 1;
  color: #544940;
  font-size: 28rpx;
  line-height: 1.8;
}

.status-card {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(239, 249, 252, 0.94));
}

.status-pill {
  flex: 0 0 auto;
  padding: 10rpx 20rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  font-weight: 700;
}

.status-pill.is-success {
  background: rgba(47, 158, 111, 0.12);
  color: var(--success);
}

.status-pill.is-processing {
  background: rgba(217, 112, 46, 0.12);
  color: var(--primary-strong);
}

.status-pill.is-danger {
  background: rgba(216, 95, 95, 0.12);
  color: var(--danger);
}

.status-pill.is-default {
  background: rgba(125, 115, 104, 0.12);
  color: var(--muted);
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18rpx;
  margin-top: 26rpx;
}

.stage-banner {
  margin-top: 24rpx;
  padding: 20rpx 22rpx;
  border-radius: 20rpx;
  background: rgba(236, 248, 251, 0.92);
}

.stage-banner-label {
  display: block;
  color: var(--primary-strong);
  font-size: 22rpx;
  font-weight: 700;
}

.stage-banner-text {
  display: block;
  margin-top: 10rpx;
  color: var(--text);
  font-size: 28rpx;
  font-weight: 700;
}

.status-cell {
  padding: 22rpx 20rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.76);
  border: 1rpx solid var(--line);
}

.substage-list {
  margin-top: 22rpx;
}

.substage-item + .substage-item {
  margin-top: 16rpx;
}

.substage-item {
  padding: 20rpx 22rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.76);
  border: 1rpx solid var(--line);
}

.substage-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.substage-title {
  color: var(--text);
  font-size: 25rpx;
  font-weight: 700;
}

.substage-value {
  font-size: 22rpx;
  font-weight: 700;
}

.substage-value.success {
  color: var(--success);
}

.substage-value.muted {
  color: var(--muted);
}

.substage-desc {
  display: block;
  margin-top: 10rpx;
  color: var(--muted);
  font-size: 23rpx;
  line-height: 1.65;
}

.status-label {
  display: block;
  color: var(--muted);
  font-size: 22rpx;
}

.status-content {
  display: block;
  margin-top: 12rpx;
  color: var(--text);
  font-size: 28rpx;
  font-weight: 700;
  line-height: 1.5;
  word-break: break-all;
}

.status-alert {
  margin-top: 24rpx;
  padding: 20rpx 22rpx;
  border-radius: 20rpx;
  background: rgba(216, 95, 95, 0.08);
}

.status-alert-label {
  display: block;
  color: var(--danger);
  font-size: 22rpx;
  font-weight: 700;
}

.status-alert-text {
  display: block;
  margin-top: 10rpx;
  color: #8b4b4b;
  font-size: 25rpx;
  line-height: 1.7;
}

.field-block + .field-block {
  margin-top: 24rpx;
}

.field-label {
  display: block;
  margin-bottom: 14rpx;
  color: var(--text);
  font-size: 26rpx;
  font-weight: 700;
}

.field-input {
  height: 92rpx;
  padding: 0 24rpx;
  border-radius: 20rpx;
  background: #fbf8f2;
  border: 1rpx solid rgba(192, 160, 130, 0.18);
  color: var(--text);
  font-size: 28rpx;
}

.field-input-disabled {
  color: #7a8f97;
  background: #f3f8fa;
}

.field-placeholder {
  color: #b6a392;
}

.field-lock-tip {
  display: block;
  margin-top: 18rpx;
  color: var(--muted);
  font-size: 23rpx;
  line-height: 1.6;
}

.declare-card {
  margin-top: 30rpx;
  padding: 24rpx;
  border-radius: 22rpx;
  background: linear-gradient(180deg, #f7fcfd, #eef8fb);
  border: 1rpx solid rgba(100, 184, 207, 0.14);
}

.declare-title {
  display: block;
  color: var(--primary-strong);
  font-size: 26rpx;
  font-weight: 800;
}

.declare-text {
  display: block;
  margin-top: 14rpx;
  color: #6a5b50;
  font-size: 25rpx;
  line-height: 1.8;
}

.agree-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 24rpx;
}

.agree-text {
  flex: 1;
  color: #6e6359;
  font-size: 24rpx;
  line-height: 1.6;
}

.footer-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  padding: 22rpx 24rpx calc(env(safe-area-inset-bottom) + 22rpx);
  background: rgba(250, 254, 255, 0.95);
  backdrop-filter: blur(18rpx);
  box-shadow: 0 -10rpx 24rpx rgba(65, 126, 145, 0.08);
}

.footer-tip {
  margin-bottom: 18rpx;
  padding: 18rpx 22rpx;
  border-radius: 20rpx;
  background: rgba(236, 248, 251, 0.92);
}

.footer-tip-title {
  display: block;
  color: var(--primary-strong);
  font-size: 22rpx;
  font-weight: 700;
}

.footer-tip-text {
  display: block;
  margin-top: 8rpx;
  color: #7b6b60;
  font-size: 22rpx;
  line-height: 1.6;
}

.submit-btn {
  height: 96rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #8bd7ea 0%, #57bfd6 48%, #3da7c0 100%);
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 16rpx 32rpx rgba(75, 174, 199, 0.28);
}

.submit-btn.disabled {
  opacity: 0.7;
}

.footer-note {
  display: block;
  margin-top: 18rpx;
  color: #9a8c7f;
  font-size: 22rpx;
  text-align: center;
}
</style>
