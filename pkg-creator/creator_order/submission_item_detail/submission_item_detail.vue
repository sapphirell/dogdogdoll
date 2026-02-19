<template>
  <view class="item-detail-page">
    <scroll-view class="scroll-body" scroll-y>
      <view v-if="loading" class="state-box">
        <text class="state-title">加载中…</text>
        <text class="state-desc">正在获取作品详情</text>
      </view>

      <view v-else-if="errorMsg" class="state-box state-error">
        <text class="state-title">获取失败</text>
        <text class="state-desc">{{ errorMsg }}</text>
        <button class="btn-retry" @tap="fetchAll">重试</button>
      </view>

      <view v-else-if="!currentItem" class="state-box state-error">
        <text class="state-title">作品不存在</text>
        <text class="state-desc">未找到对应的投递内容</text>
      </view>

      <view v-else class="content">
        <view class="card status-card">
          <view class="status-row">
            <text class="status-label">投递编号</text>
            <text class="status-value font-title">#{{ queueInfo?.submission_id || submissionId }}</text>
          </view>
          <view class="status-row">
            <text class="status-label">订单状态</text>
            <text class="status-value">{{ queueInfo?.status_text || '--' }}</text>
          </view>
          <view class="status-row">
            <text class="status-label">付款状态</text>
            <text class="status-value">{{ paymentStatusText }}</text>
          </view>
        </view>

        <view class="card item-card">
          <view class="card-title">投递内容</view>
          <view class="item-main">
            <image
              class="item-cover"
              :src="getFirstImage(currentItem.ref_images)"
              mode="aspectFill"
            />
            <view class="item-body">
              <text class="item-title">{{ currentItem.work_subject || '未命名作品' }}</text>
              <text v-if="currentItem.size" class="item-meta">尺寸：{{ currentItem.size }}</text>
              <text v-if="currentItem.tier_title" class="item-meta">档位：{{ currentItem.tier_title }}</text>
              <text v-if="addonsText" class="item-meta">加购：{{ addonsText }}</text>
              <view class="item-price-row">
                <text class="price-symbol">¥</text>
                <text class="price-value font-title">{{ formatAmount(currentItem.price_total) }}</text>
              </view>
            </view>
          </view>
        </view>

        <view class="card requirement-card">
          <view class="card-title">投递要求</view>
          <text class="requirement-text">{{ itemRequirementText }}</text>
        </view>

        <view class="card payment-card">
          <view class="card-title">付款信息</view>
          <view class="payment-row">
            <text class="payment-label">付款方式</text>
            <text class="payment-value">{{ paymentMethodText }}</text>
          </view>
          <view class="payment-row">
            <text class="payment-label">付款状态</text>
            <text class="payment-value">{{ paymentStatusText }}</text>
          </view>
          <view class="payment-row" v-if="latestPaymentAmount > 0">
            <text class="payment-label">付款金额</text>
            <text class="payment-value">¥ {{ formatAmount(latestPaymentAmount) }}</text>
          </view>
          <view class="payment-row" v-if="latestPaymentTransferNo">
            <text class="payment-label">转账单号</text>
            <text class="payment-value">{{ latestPaymentTransferNo }}</text>
          </view>
          <view class="payment-row" v-if="latestPaymentMessage">
            <text class="payment-label">买家留言</text>
            <text class="payment-value">{{ latestPaymentMessage }}</text>
          </view>
          <view class="payment-row" v-if="latestPaymentCreatedAt > 0">
            <text class="payment-label">提交时间</text>
            <text class="payment-value font-title payment-time">{{ formatTime(latestPaymentCreatedAt) }}</text>
          </view>

          <view v-if="latestPaymentProofs.length" class="payment-proof-wrap">
            <text class="payment-proof-title">付款截图</text>
            <view class="payment-proof-list">
              <image
                v-for="(img, idx) in latestPaymentProofs"
                :key="`proof-${idx}`"
                class="payment-proof-image"
                :src="img"
                mode="aspectFill"
                @tap="previewImages(latestPaymentProofs, idx)"
              />
            </view>
          </view>
        </view>

        <view class="card history-card">
          <view class="card-title">创作历史</view>
          <view v-if="historyEvents.length" class="history-list">
            <view
              v-for="(event, idx) in historyEvents"
              :key="event.key"
              class="history-row"
            >
              <view class="history-axis">
                <view class="history-dot" :class="event.dotClass"></view>
                <view v-if="idx < historyEvents.length - 1" class="history-line"></view>
              </view>
              <view class="history-main">
                <view class="history-head">
                  <text class="history-title">{{ event.title }}</text>
                  <text class="history-time font-title">{{ event.timeText }}</text>
                </view>
                <text v-if="event.desc" class="history-desc">{{ event.desc }}</text>

                <view v-if="event.images.length" class="history-image-list">
                  <image
                    v-for="(img, imgIdx) in event.images.slice(0, 3)"
                    :key="`${event.key}-img-${imgIdx}`"
                    class="history-image"
                    :src="img"
                    mode="aspectFill"
                    @tap="previewImages(event.images, imgIdx)"
                  />
                  <view
                    v-if="event.images.length > 3"
                    class="history-image-more"
                    @tap="previewImages(event.images, 0)"
                  >
                    +{{ event.images.length - 3 }}
                  </view>
                </view>
              </view>
            </view>
          </view>
          <view v-else class="history-empty">
            <text class="state-desc">暂无创作历史</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { websiteUrl, initLoginState } from '@/common/config.js'

const SubmissionStatusSelectedPay = 3
const SubmissionStatusPaid = 4
const PaymentMethodPlatform = 1
const PaymentMethodQRCode = 2

const PayStatusPending = 0
const PayStatusDepositConfirming = 1
const PayStatusDepositPaid = 2
const PayStatusBalanceConfirming = 3
const PayStatusPaid = 4

const submissionId = ref(0)
const itemId = ref(0)
const loading = ref(false)
const errorMsg = ref('')
const queueInfo = ref(null)
const paymentStatusInfo = ref(null)

const items = computed(() => {
  const list = queueInfo.value?.items
  return Array.isArray(list) ? list : []
})

const currentItem = computed(() => {
  const id = Number(itemId.value || 0)
  if (!id) return items.value[0] || null
  return items.value.find((item) => Number(item?.id || 0) === id) || null
})

const currentItemId = computed(() => Number(currentItem.value?.id || 0))

const addonsText = computed(() => {
  const raw = currentItem.value?.addons_json
  if (!raw) return ''
  try {
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr)) return ''
    return arr
      .map((v) => String(v?.title || '').trim())
      .filter(Boolean)
      .join(' / ')
  } catch (_) {
    return ''
  }
})

const itemRequirementText = computed(() => {
  const remark = String(currentItem.value?.remark || '').trim()
  if (remark) return remark
  return '未填写投递要求'
})

const paymentMethod = computed(() => {
  return Number(queueInfo.value?.payment_method || 0)
})

const payStatus = computed(() => {
  return Number(queueInfo.value?.pay_status || 0)
})

const paymentMethodText = computed(() => {
  if (paymentMethod.value === PaymentMethodQRCode) return '扫码转账'
  if (paymentMethod.value === PaymentMethodPlatform) return '在线支付'
  return '--'
})

const paymentStatusText = computed(() => {
  const status = Number(queueInfo.value?.status || 0)
  if (status === SubmissionStatusPaid) {
    return paymentMethod.value === PaymentMethodQRCode ? '已付款（扫码转账）' : '已付款（在线支付）'
  }
  if (status === SubmissionStatusSelectedPay) return '待付款'

  switch (payStatus.value) {
    case PayStatusPending: return '待支付'
    case PayStatusDepositConfirming: return '定金待确认'
    case PayStatusDepositPaid: return '定金已付'
    case PayStatusBalanceConfirming: return '尾款待确认'
    case PayStatusPaid: return '已结清'
    default: return '未支付'
  }
})

const latestPayment = computed(() => paymentStatusInfo.value?.latest_payment || null)
const latestPaymentProofs = computed(() => {
  const list = latestPayment.value?.proof_images
  return Array.isArray(list) ? list.filter(Boolean) : []
})
const latestPaymentTransferNo = computed(() => String(latestPayment.value?.transfer_no || '').trim())
const latestPaymentMessage = computed(() => String(latestPayment.value?.message || '').trim())
const latestPaymentCreatedAt = computed(() => Number(latestPayment.value?.created_at || 0))
const latestPaymentAmount = computed(() => Number(latestPayment.value?.amount || 0))

const historyEvents = computed(() => {
  const logs = Array.isArray(queueInfo.value?.progress_logs) ? queueInfo.value.progress_logs : []
  const id = currentItemId.value
  const filtered = logs.filter((row) => {
    const logItemId = Number(row?.submission_item_id || 0)
    return id > 0 ? (logItemId === 0 || logItemId === id) : logItemId === 0
  })

  return filtered
    .slice()
    .sort((a, b) => {
      const ta = Number(a?.created_at || 0)
      const tb = Number(b?.created_at || 0)
      if (tb !== ta) return tb - ta
      return Number(b?.id || 0) - Number(a?.id || 0)
    })
    .map((row, idx) => {
      const status = Number(row?.status || 0)
      let dotClass = 'done'
      if (status === 0) dotClass = idx === 0 ? 'latest' : 'pending'
      if (status === 2) dotClass = 'reject'
      return {
        key: `${row?.id || idx}-${row?.event_code || ''}`,
        title: timelineTitle(row),
        desc: timelineDesc(row),
        timeText: formatTime(row?.created_at),
        images: parseLogImages(row),
        dotClass
      }
    })
})

function timelineTitle(row) {
  const logType = Number(row?.log_type || 0)
  const status = Number(row?.status || 0)
  const stepName = String(row?.step_name || '').trim()
  const eventCode = String(row?.event_code || '').trim()
  if (logType === 1) {
    const name = stepName || `节点#${Number(row?.step_id || 0)}`
    if (status === 1) return `${name}（已通过）`
    if (status === 2) return `${name}（未通过）`
    return `${name}（待确认）`
  }
  if (eventCode === 'submission_created') return '买家拍下订单'
  if (eventCode === 'buyer_confirm_content') return '买家确认投递内容'
  if (eventCode === 'seller_confirm_submission') return '创作者确认订单'
  if (eventCode === 'payment_completed') return '付款完成'
  if (eventCode === 'final_product_confirmed') return '成品确认'
  return stepName || '进度更新'
}

function timelineDesc(row) {
  const content = String(row?.content || '').trim()
  if (content) return content
  const eventCode = String(row?.event_code || '').trim()
  if (eventCode === 'step_request') return '创作者上传了进度图片。'
  return ''
}

function normalizeImageList(input) {
  if (Array.isArray(input)) {
    return input.map((v) => String(v || '').trim()).filter(Boolean)
  }
  const raw = String(input || '').trim()
  if (!raw) return []
  if (raw.startsWith('[')) {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed.map((v) => String(v || '').trim()).filter(Boolean)
      }
    } catch (_) {}
  }
  return raw.split(',').map((v) => String(v || '').trim()).filter(Boolean)
}

function parseLogImages(row) {
  const direct = normalizeImageList(row?.images)
  if (direct.length) return Array.from(new Set(direct))
  const fromRaw = normalizeImageList(row?.images_urls || row?.images_json)
  return Array.from(new Set(fromRaw))
}

function getFirstImage(raw) {
  const arr = normalizeImageList(raw)
  return arr[0] || ''
}

function formatTime(ts) {
  const sec = Number(ts || 0)
  if (!sec) return '--'
  const d = new Date(sec * 1000)
  if (Number.isNaN(d.getTime())) return '--'
  const MM = String(d.getMonth() + 1).padStart(2, '0')
  const DD = String(d.getDate()).padStart(2, '0')
  const HH = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${MM}-${DD} ${HH}:${mm}`
}

function formatAmount(val) {
  const num = Number(val || 0)
  if (!Number.isFinite(num)) return '0.00'
  return num.toFixed(2)
}

function previewImages(list, index = 0) {
  const urls = Array.isArray(list) ? list.filter(Boolean) : []
  if (!urls.length) return
  uni.previewImage({
    current: urls[index] || urls[0],
    urls
  })
}

async function ensureLogin() {
  await initLoginState()
  const token = uni.getStorageSync('token') || ''
  if (!token) {
    errorMsg.value = '请先登录'
    return false
  }
  return true
}

async function fetchQueueInfo() {
  const token = uni.getStorageSync('token') || ''
  const res = await uni.request({
    url: `${websiteUrl.value}/with-state/artist-order/submission/queue-info`,
    method: 'GET',
    header: { Authorization: token },
    data: { submission_id: submissionId.value }
  })
  const body = res?.data || {}
  if (String(body.status).toLowerCase() !== 'success') {
    throw new Error(body.msg || '获取详情失败')
  }
  queueInfo.value = body.data || null
}

async function fetchPaymentInfo() {
  const token = uni.getStorageSync('token') || ''
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/submission/payment-status`,
      method: 'GET',
      header: { Authorization: token },
      data: { submission_id: submissionId.value }
    })
    const body = res?.data || {}
    if (String(body.status).toLowerCase() === 'success') {
      paymentStatusInfo.value = body.data || null
    }
  } catch (_) {}
}

async function fetchAll() {
  if (loading.value) return
  const ok = await ensureLogin()
  if (!ok) return
  if (!submissionId.value) {
    errorMsg.value = '缺少 submission_id'
    return
  }
  loading.value = true
  errorMsg.value = ''
  try {
    await fetchQueueInfo()
    await fetchPaymentInfo()
  } catch (e) {
    errorMsg.value = e?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

onLoad((options) => {
  uni.setNavigationBarTitle({ title: '作品详情' })
  submissionId.value = Number(options?.submission_id || 0)
  itemId.value = Number(options?.item_id || 0)
  fetchAll()
})

onShow(() => {
  if (submissionId.value > 0) fetchAll()
})
</script>

<style scoped lang="scss">
.item-detail-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f7f9fc 0%, #f3f5f9 45%, #f7f9fc 100%);
}

.scroll-body {
  height: 100vh;
}

.content {
  padding: 12rpx 0 26rpx;
}

.card {
  margin: 18rpx 20rpx 0;
  padding: 24rpx;
  border-radius: 22rpx;
  background: #fff;
  border: 1rpx solid #edf1f6;
  box-shadow: 0 8rpx 24rpx rgba(16, 30, 54, 0.04);
}

.card-title {
  font-size: 31rpx;
  font-weight: 700;
  color: #20293a;
  margin-bottom: 14rpx;
}

.status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8rpx 0;
}

.status-row + .status-row {
  margin-top: 10rpx;
  border-top: 1rpx dashed #edf1f6;
  padding-top: 18rpx;
}

.status-label {
  font-size: 24rpx;
  color: #8692a6;
}

.status-value {
  font-size: 26rpx;
  color: #3a4659;
}

.item-main {
  display: flex;
  gap: 18rpx;
}

.item-cover {
  width: 150rpx;
  height: 150rpx;
  border-radius: 16rpx;
  background: #eef3fb;
  flex-shrink: 0;
}

.item-body {
  flex: 1;
  min-width: 0;
}

.item-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #1f2735;
  line-height: 1.35;
}

.item-meta {
  display: block;
  margin-top: 8rpx;
  font-size: 23rpx;
  color: #748096;
  line-height: 1.5;
}

.item-price-row {
  margin-top: 10rpx;
  display: flex;
  align-items: baseline;
  gap: 4rpx;
}

.price-symbol {
  font-size: 23rpx;
  color: #273043;
}

.price-value {
  font-size: 40rpx;
  color: #273043;
  line-height: 1.1;
}

.requirement-text {
  display: block;
  font-size: 25rpx;
  line-height: 1.72;
  color: #566276;
  word-break: break-word;
}

.payment-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12rpx;
}

.payment-row + .payment-row {
  margin-top: 10rpx;
}

.payment-label {
  font-size: 23rpx;
  color: #8a95a8;
}

.payment-value {
  flex: 1;
  min-width: 0;
  text-align: right;
  font-size: 24rpx;
  color: #3b475a;
  line-height: 1.45;
  word-break: break-word;
}

.payment-time {
  font-size: 22rpx;
  color: #8f9aac;
}

.payment-proof-wrap {
  margin-top: 16rpx;
}

.payment-proof-title {
  font-size: 24rpx;
  color: #4f5d72;
}

.payment-proof-list {
  margin-top: 10rpx;
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
}

.payment-proof-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  background: #eef3fb;
}

.history-list {
  padding-top: 4rpx;
}

.history-row {
  display: flex;
  align-items: flex-start;
}

.history-row + .history-row {
  margin-top: 10rpx;
}

.history-axis {
  width: 34rpx;
  position: relative;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

.history-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  margin-top: 12rpx;
  background: #cfd7e5;
}

.history-dot.latest {
  background: #7bc8e8;
}

.history-dot.pending {
  background: #f0ca7b;
}

.history-dot.reject {
  background: #e08f8f;
}

.history-dot.done {
  background: #b7c3d6;
}

.history-line {
  position: absolute;
  top: 30rpx;
  bottom: -10rpx;
  width: 2rpx;
  background: #e8edf5;
}

.history-main {
  flex: 1;
  min-width: 0;
  padding: 8rpx 0 12rpx;
  border-bottom: 1rpx solid #f2f5fa;
}

.history-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10rpx;
}

.history-title {
  flex: 1;
  min-width: 0;
  font-size: 26rpx;
  font-weight: 600;
  color: #2b3445;
  line-height: 1.5;
}

.history-time.font-title {
  flex-shrink: 0;
  font-size: 23rpx;
  line-height: 1.4;
  color: #8e99aa;
}

.history-desc {
  margin-top: 6rpx;
  display: block;
  font-size: 23rpx;
  line-height: 1.6;
  color: #758096;
}

.history-image-list {
  margin-top: 10rpx;
  display: flex;
  gap: 10rpx;
  flex-wrap: wrap;
}

.history-image,
.history-image-more {
  width: 108rpx;
  height: 108rpx;
  border-radius: 12rpx;
  background: #edf2f8;
}

.history-image-more {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #657081;
  font-size: 24rpx;
  font-weight: 600;
}

.history-empty {
  padding: 8rpx 0;
}

.state-box {
  margin: 72rpx 20rpx 0;
  padding: 24rpx;
  border-radius: 24rpx;
  background-color: #ffffff;
  text-align: center;
  border: 1rpx solid #edf1f6;
}

.state-box.state-error {
  border-color: #ffd8d8;
  background: #fffdfd;
}

.state-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #20293a;
  display: block;
}

.state-desc {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #768193;
}

.btn-retry {
  margin-top: 20rpx;
  height: 72rpx;
  line-height: 72rpx;
  padding: 0 40rpx;
  border-radius: 999rpx;
  border: none;
  background-color: #eaf3ff;
  color: #47618a;
  font-size: 26rpx;
  font-weight: 600;
}

.btn-retry::after {
  border: none;
}
</style>
