<template>
  <view class="page">
    <view class="hero-card">
      <text class="hero-title">支付宝拉起测试</text>
      <text class="hero-desc">这个页面不绑定投稿单，只验证下单、拉起和查单。</text>
      <view class="hero-meta">
        <text class="meta-pill">当前端：{{ runtimeChannelLabel }}</text>
        <text class="meta-pill">接口：{{ websiteUrl.value }}</text>
      </view>
    </view>

    <view class="panel">
      <view class="field">
        <text class="field-label">支付金额（元）</text>
        <input
          v-model="form.amountYuan"
          class="field-input"
          type="digit"
          placeholder="例如 0.01"
        />
      </view>

      <view class="field">
        <text class="field-label">支付标题</text>
        <input
          v-model.trim="form.subject"
          class="field-input"
          type="text"
          placeholder="例如 支付联调测试"
        />
      </view>

      <view class="field">
        <text class="field-label">支付说明</text>
        <textarea
          v-model.trim="form.description"
          class="field-textarea"
          maxlength="120"
          placeholder="用于区分这次测试单"
        />
      </view>

      <view class="field">
        <text class="field-label">支付渠道</text>
        <view class="segmented">
          <view
            class="segment"
            :class="{ active: form.provider === 'alipay' }"
            @tap="form.provider = 'alipay'"
          >
            支付宝
          </view>
        </view>
      </view>

      <view class="field">
        <text class="field-label">拉起方式</text>
        <view class="segmented">
          <view
            v-for="item in channelOptions"
            :key="item.value"
            class="segment"
            :class="{ active: form.channel === item.value }"
            @tap="selectChannel(item.value)"
          >
            {{ item.label }}
          </view>
        </view>
      </view>

      <view class="action-row">
        <view class="primary-btn" :class="{ disabled: submitting }" @tap="createAndPay">
          {{ submitting ? '处理中...' : '创建订单并拉起支付' }}
        </view>
      </view>

      <view class="action-row split">
        <view class="ghost-btn" :class="{ disabled: querying }" @tap="queryCurrentOrder">
          {{ querying ? '查询中...' : '查询当前订单状态' }}
        </view>
        <view class="ghost-btn" @tap="fillDemoAmount">填充 0.01</view>
      </view>
    </view>

    <view class="panel">
      <view class="section-head">
        <text class="section-title">当前订单</text>
        <text class="section-action" @tap="copyBizOrderNo">复制单号</text>
      </view>

      <view class="info-grid">
        <view class="info-item">
          <text class="info-key">业务单号</text>
          <text class="info-val">{{ order.bizOrderNo || '未生成' }}</text>
        </view>
        <view class="info-item">
          <text class="info-key">订单状态</text>
          <text class="info-val">{{ order.status || '未查询' }}</text>
        </view>
        <view class="info-item">
          <text class="info-key">支付链接</text>
          <text class="info-val multiline">{{ order.payURL || '暂无' }}</text>
        </view>
      </view>

      <view class="action-row split">
        <view class="ghost-btn" :class="{ disabled: !order.payURL }" @tap="copyPayURL">复制支付链接</view>
        <view class="ghost-btn" :class="{ disabled: !canOpenH5URL }" @tap="openPayURLInH5">H5 打开链接</view>
      </view>
    </view>

    <view class="panel">
      <view class="section-head">
        <text class="section-title">调试日志</text>
        <text class="section-action" @tap="clearLogs">清空</text>
      </view>
      <view v-if="logs.length" class="log-list">
        <view v-for="item in logs" :key="item.id" class="log-item">
          <text class="log-time">{{ item.time }}</text>
          <text class="log-text">{{ item.text }}</text>
        </view>
      </view>
      <view v-else class="log-empty">还没有日志，先发起一次测试。</view>
    </view>
  </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { websiteUrl } from '@/common/config.js'

const H5_PENDING_KEY = 'paymentDebugPendingOrder'

const form = reactive({
  provider: 'alipay',
  channel: 'app',
  amountYuan: '0.01',
  subject: '支付联调测试',
  description: '独立页面拉起测试'
})

const order = reactive({
  bizOrderNo: '',
  payURL: '',
  status: ''
})

const logs = ref([])
const submitting = ref(false)
const querying = ref(false)

// #ifdef H5
form.channel = 'h5'
// #endif

const runtimeChannelLabel = computed(() => {
  if (form.channel === 'h5') return 'H5'
  if (form.channel === 'app') return 'App'
  return form.channel || '-'
})

const channelOptions = computed(() => {
  const list = []
  // #ifdef H5
  list.push({ value: 'h5', label: 'H5' })
  // #endif
  // #ifdef APP-PLUS
  list.push({ value: 'app', label: 'App' })
  // #endif
  if (!list.length) {
    list.push({ value: form.channel || 'h5', label: runtimeChannelLabel.value })
  }
  return list
})

const canOpenH5URL = computed(() => form.channel === 'h5' && !!order.payURL)

function appendLog(text, payload = null) {
  const suffix = payload ? ` ${JSON.stringify(payload)}` : ''
  logs.value.unshift({
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
    text: `${text}${suffix}`
  })
}

function clearLogs() {
  logs.value = []
}

function fillDemoAmount() {
  form.amountYuan = '0.01'
  appendLog('已填充测试金额', { amountYuan: form.amountYuan })
}

function selectChannel(channel) {
  form.channel = channel
  appendLog('切换拉起方式', { channel })
}

function normalizeAmount() {
  const amount = Number(String(form.amountYuan || '').trim())
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('请输入大于 0 的金额')
  }
  return Number(amount.toFixed(2))
}

function ensureToken() {
  const token = String(uni.getStorageSync('token') || '').trim()
  if (!token) {
    throw new Error('当前未登录，无法创建测试支付单')
  }
  return token
}

async function createDebugOrder() {
  const token = ensureToken()
  const amountYuan = normalizeAmount()
  const res = await uni.request({
    url: `${websiteUrl.value}/with-state/artist-order/platform-payment/debug/create`,
    method: 'POST',
    header: { Authorization: token },
    data: {
      provider: form.provider,
      channel: form.channel,
      amount_yuan: amountYuan,
      subject: String(form.subject || '').trim(),
      description: String(form.description || '').trim()
    }
  })
  const body = res.data || {}
  appendLog('创建测试订单返回', {
    status: body.status,
    msg: body.msg,
    data: body.data || null
  })
  if (String(body.status).toLowerCase() !== 'success') {
    throw new Error(body.msg || '创建测试订单失败')
  }
  const data = body.data || {}
  order.bizOrderNo = String(data.biz_order_no || '').trim()
  order.payURL = String(data.pay_url || data.order_string || '').trim()
  order.status = String(data.status || '').trim()
  return data
}

function savePendingH5Order() {
  // #ifdef H5
  uni.setStorageSync(H5_PENDING_KEY, {
    bizOrderNo: order.bizOrderNo,
    createdAt: Date.now()
  })
  // #endif
}

function clearPendingH5Order() {
  // #ifdef H5
  uni.removeStorageSync(H5_PENDING_KEY)
  // #endif
}

function getPendingH5Order() {
  // #ifdef H5
  const raw = uni.getStorageSync(H5_PENDING_KEY)
  if (!raw || typeof raw !== 'object') return null
  const bizOrderNo = String(raw.bizOrderNo || '').trim()
  if (!bizOrderNo) return null
  return {
    bizOrderNo,
    createdAt: Number(raw.createdAt || 0)
  }
  // #endif
  return null
}

function parseAlipayAppResult(err, result) {
  const status = String(result?.resultStatus || err?.resultStatus || '').trim()
  if (status === '9000') return 'success'
  if (status === '8000' || status === '6004') return 'pending'
  return 'failed'
}

async function invokeAppPay(orderString) {
  // #ifndef APP-PLUS
  throw new Error('当前运行端不是 App，不能走 App 支付')
  // #endif

  // #ifdef APP-PLUS
  return await new Promise((resolve, reject) => {
    uni.requestPayment({
      provider: 'alipay',
      orderInfo: String(orderString || ''),
      success: (res) => resolve(res || {}),
      fail: (err) => reject(err || new Error('支付宝拉起失败'))
    })
  })
  // #endif
}

async function invokeH5Pay(url) {
  // #ifndef H5
  throw new Error('当前运行端不是 H5，不能走 H5 支付')
  // #endif

  // #ifdef H5
  if (!url) throw new Error('支付链接为空')
  savePendingH5Order()
  window.location.href = url
  return true
  // #endif
}

async function queryOrderStatus(bizOrderNo) {
  const token = ensureToken()
  const res = await uni.request({
    url: `${websiteUrl.value}/with-state/artist-order/platform-payment/status`,
    method: 'GET',
    header: { Authorization: token },
    data: { biz_order_no: bizOrderNo }
  })
  const body = res.data || {}
  appendLog('查询订单状态返回', {
    bizOrderNo,
    status: body.status,
    msg: body.msg,
    data: body.data || null
  })
  if (String(body.status).toLowerCase() !== 'success') {
    throw new Error(body.msg || '查询支付状态失败')
  }
  const data = body.data || {}
  order.status = String(data.status || '').trim()
  if (!order.payURL) {
    order.payURL = String(data.pay_url || data.order_string || '').trim()
  }
  return data
}

async function createAndPay() {
  if (submitting.value) return
  submitting.value = true
  uni.showLoading({ title: '准备支付中' })
  try {
    const data = await createDebugOrder()
    if (form.channel === 'h5') {
      await invokeH5Pay(String(data.pay_url || data.order_string || '').trim())
      return
    }

    const payResult = await invokeAppPay(String(data.order_string || data.pay_url || '').trim())
    const localStatus = parseAlipayAppResult(null, payResult)
    appendLog('App 支付返回', {
      localStatus,
      resultStatus: payResult?.resultStatus || '',
      memo: payResult?.memo || ''
    })

    if (localStatus === 'failed') {
      throw new Error(String(payResult?.memo || '支付未完成').trim() || '支付未完成')
    }

    await pollOrderUntilStable(order.bizOrderNo)
  } catch (err) {
    appendLog('创建并拉起失败', {
      message: err?.message || err?.errMsg || String(err)
    })
    uni.showToast({ title: err?.message || err?.errMsg || '支付失败', icon: 'none' })
  } finally {
    submitting.value = false
    uni.hideLoading()
  }
}

async function pollOrderUntilStable(bizOrderNo) {
  let latest = null
  for (let i = 0; i < 4; i++) {
    latest = await queryOrderStatus(bizOrderNo)
    const status = String(latest?.status || '').toLowerCase()
    if (status === 'succeeded' || status === 'failed' || status === 'closed') {
      break
    }
    if (i < 3) {
      await new Promise((resolve) => setTimeout(resolve, 1500))
    }
  }
  const finalStatus = String(latest?.status || '').toLowerCase()
  if (finalStatus === 'succeeded') {
    uni.showToast({ title: '支付成功', icon: 'success' })
    return
  }
  if (finalStatus === 'pending') {
    uni.showToast({ title: '结果确认中，请稍后再查', icon: 'none' })
    return
  }
  throw new Error(`支付未完成，当前状态：${finalStatus || 'unknown'}`)
}

async function queryCurrentOrder() {
  if (querying.value) return
  if (!order.bizOrderNo) {
    uni.showToast({ title: '请先创建订单', icon: 'none' })
    return
  }
  querying.value = true
  try {
    await queryOrderStatus(order.bizOrderNo)
    uni.showToast({ title: '查询完成', icon: 'success' })
  } catch (err) {
    uni.showToast({ title: err?.message || '查询失败', icon: 'none' })
  } finally {
    querying.value = false
  }
}

async function tryResumeH5Order() {
  // #ifndef H5
  return
  // #endif

  // #ifdef H5
  const pending = getPendingH5Order()
  if (!pending) return
  order.bizOrderNo = pending.bizOrderNo
  appendLog('检测到 H5 待恢复订单', pending)
  try {
    const data = await queryOrderStatus(pending.bizOrderNo)
    const status = String(data.status || '').toLowerCase()
    if (status === 'succeeded' || status === 'failed' || status === 'closed') {
      clearPendingH5Order()
    }
    if (status === 'succeeded') {
      uni.showToast({ title: '支付成功', icon: 'success' })
    }
  } catch (err) {
    appendLog('恢复 H5 订单失败', {
      message: err?.message || err?.errMsg || String(err)
    })
  }
  // #endif
}

function copyBizOrderNo() {
  if (!order.bizOrderNo) {
    uni.showToast({ title: '暂无订单号', icon: 'none' })
    return
  }
  uni.setClipboardData({ data: order.bizOrderNo })
}

function copyPayURL() {
  if (!order.payURL) {
    uni.showToast({ title: '暂无支付链接', icon: 'none' })
    return
  }
  uni.setClipboardData({ data: order.payURL })
}

function openPayURLInH5() {
  if (!canOpenH5URL.value) {
    uni.showToast({ title: '当前端不支持直接打开', icon: 'none' })
    return
  }
  invokeH5Pay(order.payURL)
}

onLoad(() => {
  appendLog('测试页已加载', {
    apiBase: websiteUrl.value,
    channel: form.channel
  })
})

onShow(() => {
  tryResumeH5Order()
})
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  padding: 32rpx 24rpx 48rpx;
  background:
    radial-gradient(circle at top right, rgba(120, 218, 245, 0.28), transparent 32%),
    linear-gradient(180deg, #f5fbff 0%, #eef2f6 100%);
  box-sizing: border-box;
}

.hero-card,
.panel {
  padding: 28rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 20rpx 60rpx rgba(32, 61, 86, 0.08);
}

.hero-card {
  margin-bottom: 24rpx;
}

.hero-title {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: #1b2b34;
}

.hero-desc {
  display: block;
  margin-top: 12rpx;
  font-size: 26rpx;
  line-height: 1.6;
  color: #60717f;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 20rpx;
}

.meta-pill {
  padding: 10rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(120, 218, 245, 0.16);
  color: #2c6a7b;
  font-size: 22rpx;
}

.panel {
  margin-bottom: 24rpx;
}

.field + .field {
  margin-top: 24rpx;
}

.field-label {
  display: block;
  margin-bottom: 12rpx;
  font-size: 24rpx;
  color: #5f6f7b;
}

.field-input,
.field-textarea {
  width: 100%;
  padding: 22rpx 24rpx;
  border-radius: 22rpx;
  background: #f3f7fa;
  box-sizing: border-box;
  font-size: 28rpx;
  color: #20313d;
}

.field-textarea {
  min-height: 180rpx;
}

.segmented {
  display: flex;
  gap: 14rpx;
}

.segment {
  min-width: 160rpx;
  padding: 20rpx 24rpx;
  border-radius: 22rpx;
  background: #f3f7fa;
  text-align: center;
  font-size: 26rpx;
  color: #5f6f7b;
}

.segment.active {
  background: linear-gradient(135deg, #78daf5 0%, #55c4e3 100%);
  color: #083847;
  font-weight: 700;
}

.action-row {
  margin-top: 28rpx;
}

.action-row.split {
  display: flex;
  gap: 16rpx;
}

.primary-btn,
.ghost-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 92rpx;
  border-radius: 24rpx;
  font-size: 28rpx;
}

.primary-btn {
  background: linear-gradient(135deg, #78daf5 0%, #55c4e3 100%);
  color: #083847;
  font-weight: 700;
  box-shadow: 0 18rpx 36rpx rgba(120, 218, 245, 0.28);
}

.ghost-btn {
  flex: 1;
  background: #eef4f7;
  color: #3f5562;
}

.disabled {
  opacity: 0.45;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #1b2b34;
}

.section-action {
  font-size: 24rpx;
  color: #3b92ac;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.info-item {
  padding: 20rpx 22rpx;
  border-radius: 22rpx;
  background: #f4f8fb;
}

.info-key {
  display: block;
  font-size: 22rpx;
  color: #728390;
}

.info-val {
  display: block;
  margin-top: 10rpx;
  font-size: 26rpx;
  line-height: 1.5;
  color: #20313d;
  word-break: break-all;
}

.info-val.multiline {
  font-size: 24rpx;
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.log-item {
  padding: 18rpx 20rpx;
  border-radius: 22rpx;
  background: #111c24;
}

.log-time {
  display: block;
  font-size: 22rpx;
  color: #78daf5;
}

.log-text {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  line-height: 1.6;
  color: #dfe9ef;
  word-break: break-all;
}

.log-empty {
  padding: 24rpx 0 8rpx;
  font-size: 24rpx;
  color: #728390;
}
</style>
