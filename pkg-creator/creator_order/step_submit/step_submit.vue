<template>
  <view-logs />
  <view class="step-page">
    <scroll-view class="step-scroll" scroll-y :show-scrollbar="false">
      <view v-if="loading" class="state-card">
        <text class="state-title">加载中…</text>
        <text class="state-desc">正在读取订单节点配置</text>
      </view>

      <view v-else-if="errorMsg" class="state-card state-error">
        <text class="state-title">无法提交节点</text>
        <text class="state-desc">{{ errorMsg }}</text>
        <button class="retry-btn" @tap="fetchQueueInfo">重试</button>
      </view>

      <view v-else class="content">
        <view class="card">
          <view class="row">
            <text class="label">投递编号</text>
            <text class="value">#{{ submissionId }}</text>
          </view>
          <view class="row">
            <text class="label">子项名称</text>
            <text class="value text-truncate">{{ currentItem?.work_subject || '未命名作品' }}</text>
          </view>
          <view class="row">
            <text class="label">付款方式</text>
            <text class="value">{{ paymentMethodText }}</text>
          </view>
          <view class="row">
            <text class="label">订单状态</text>
            <text class="value">{{ queueInfo?.status_text || '-' }}</text>
          </view>
        </view>

        <view class="card" v-if="isOnlinePayment">
          <view class="step-header">
            <text class="card-title">节点配置</text>
            <text class="step-tip">{{ currentStepHint }}</text>
          </view>

          <view v-if="stepConfigs.length" class="step-list">
            <view
              v-for="step in stepConfigs"
              :key="step.id"
              class="step-item"
              :class="stepStateClass(step)"
            >
              <view class="step-left">
                <text class="step-index">{{ step.id }}</text>
                <text class="step-name">{{ step.name }}</text>
              </view>
              <text class="step-state">{{ stepStateText(step) }}</text>
            </view>
          </view>
          <view v-else class="empty-tip">
            当前订单未配置创作节点，暂不可提交。
          </view>

          <view v-if="targetStep" class="target-step-box">
            <text class="target-label">本次应提交</text>
            <text class="target-value">{{ targetStep.name }}</text>
          </view>
        </view>

        <view class="card" v-else>
          <text class="card-title">进度更新</text>
          <text class="transfer-tip">
            当前为转账订单，无固定节点限制。妆师可按进度不限次上传图片，双方确认后走尾款与结束流程。
          </text>
        </view>

        <view class="card">
          <view class="step-header">
            <text class="card-title">上传图片</text>
            <text class="step-tip">{{ uploadImages.length }}/{{ maxImages }}</text>
          </view>

          <view class="upload-grid">
            <view
              v-for="(img, index) in uploadImages"
              :key="`${img}-${index}`"
              class="img-cell"
            >
              <image class="img-preview" :src="img" mode="aspectFill" />
              <view class="img-remove" @tap="removeImage(index)">
                <uni-icons type="closeempty" size="15" color="#fff" />
              </view>
            </view>

            <view
              v-if="uploadImages.length < maxImages && !uploading"
              class="img-cell add-cell"
              @tap="pickAndUploadImages"
            >
              <uni-icons type="plusempty" size="24" color="#8f9ab0" />
              <text class="add-text">添加图片</text>
            </view>
          </view>

          <text v-if="uploading" class="uploading-text">{{ uploadText || '上传中…' }}</text>
          <text class="upload-tip">支持最多 {{ maxImages }} 张图片，建议优先上传清晰过程图。</text>
        </view>

        <view :style="{ height: footerSpace }"></view>
      </view>
    </scroll-view>

    <view class="bottom-bar" :style="{ paddingBottom: safeBottomPadding }">
      <button
        class="submit-btn"
        :class="{ disabled: !canSubmit }"
        :disabled="!canSubmit"
        @tap="submitStep"
      >
        {{ submitButtonText }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { websiteUrl, initLoginState, getSafeBottom, toPx, global } from '@/common/config.js'
import { chooseImageList, getQiniuToken, uploadImageToQiniu } from '@/common/image.js'

const SUBMISSION_STATUS_PAID = 4
const PAYMENT_METHOD_PLATFORM = 1
const PAYMENT_METHOD_QRCODE = 2
const maxImages = 9

const loading = ref(true)
const errorMsg = ref('')
const submitting = ref(false)
const uploading = ref(false)
const uploadText = ref('')

const submissionId = ref(0)
const itemId = ref(0)
const queueInfo = ref(null)
const currentItem = ref(null)
const uploadImages = ref([])

const safeBottomPadding = computed(() => toPx(getSafeBottom() + 14))
const footerSpace = computed(() => toPx(getSafeBottom() + 120))

const paymentMethod = computed(() => Number(queueInfo.value?.payment_method || queueInfo.value?.paymentMethod || 0))
const isOnlinePayment = computed(() => paymentMethod.value === PAYMENT_METHOD_PLATFORM)
const isTransferPayment = computed(() => paymentMethod.value === PAYMENT_METHOD_QRCODE)
const isPaid = computed(() => Number(queueInfo.value?.status || 0) === SUBMISSION_STATUS_PAID)

const paymentMethodText = computed(() => {
  if (isOnlinePayment.value) return '在线支付'
  if (isTransferPayment.value) return '扫码转账'
  return '未设置'
})

const stepConfigs = computed(() => {
  const q = queueInfo.value || {}
  let raw = []
  if (Array.isArray(q.step_configs)) {
    raw = q.step_configs
  } else if (Array.isArray(q.stepConfig)) {
    raw = q.stepConfig
  } else {
    const txt = String(q.step_config_json || q.stepConfigJSON || '').trim()
    if (txt) {
      try {
        const parsed = JSON.parse(txt)
        if (Array.isArray(parsed)) raw = parsed
      } catch (_) {}
    }
  }
  const list = raw.map((row, idx) => {
    const id = Number(row?.id || row?.ID || idx + 1)
    const safeID = Number.isFinite(id) && id > 0 ? id : idx + 1
    const name = String(row?.name || row?.Name || '').trim() || `节点${safeID}`
    return { id: safeID, name }
  })
  return list
    .filter((x, idx) => x.id > 0 && list.findIndex((y) => y.id === x.id) === idx)
    .sort((a, b) => a.id - b.id)
})

const currentStepID = computed(() => Number(currentItem.value?.current_step_id || currentItem.value?.currentStepID || 0))

const targetStep = computed(() => {
  if (!isOnlinePayment.value) return { id: 0, name: '进度更新' }
  if (!stepConfigs.value.length) return null
  const cur = currentStepID.value
  const next = stepConfigs.value.find((step) => step.id > cur)
  return next || stepConfigs.value[stepConfigs.value.length - 1]
})

const currentStepHint = computed(() => {
  if (!isOnlinePayment.value) return ''
  if (!stepConfigs.value.length) return '未配置节点'
  const cur = currentStepID.value
  const max = stepConfigs.value[stepConfigs.value.length - 1]?.id || 0
  if (cur <= 0) return '当前进度：未提交节点'
  if (max > 0 && cur >= max) return '当前进度：已达最后节点，可继续补充修改图'
  return `当前进度：已完成第 ${cur} 节点`
})

const canSubmit = computed(() => {
  if (loading.value || uploading.value || submitting.value) return false
  if (!isPaid.value) return false
  if (!uploadImages.value.length) return false
  if (isOnlinePayment.value) return !!targetStep.value?.id
  return true
})

const submitButtonText = computed(() => {
  if (submitting.value) return '提交中…'
  if (!isPaid.value) return '买家付款后可提交'
  return '提交节点状态'
})

function ensureItemExists() {
  const list = Array.isArray(queueInfo.value?.items) ? queueInfo.value.items : []
  const target = list.find((row) => Number(row?.id || row?.ID || 0) === Number(itemId.value))
  if (!target) {
    errorMsg.value = '未找到对应子项，请返回重试'
    return false
  }
  currentItem.value = target
  return true
}

async function ensureLogin() {
  await initLoginState()
  const token = uni.getStorageSync('token')
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return false
  }
  return true
}

async function fetchQueueInfo() {
  const ok = await ensureLogin()
  if (!ok) {
    loading.value = false
    errorMsg.value = '请先登录后提交节点'
    return
  }

  if (!submissionId.value || !itemId.value) {
    loading.value = false
    errorMsg.value = '参数缺失'
    return
  }

  loading.value = true
  errorMsg.value = ''
  const token = uni.getStorageSync('token') || ''
  uni.request({
    url: `${websiteUrl.value}/with-state/artist-order/submission/queue-info`,
    method: 'GET',
    header: { Authorization: token },
    data: { submission_id: submissionId.value },
    success: (res) => {
      const body = res.data || {}
      if (body.status !== 'success') {
        errorMsg.value = body.msg || '读取订单失败'
        return
      }
      queueInfo.value = body.data || null
      if (!queueInfo.value || !ensureItemExists()) return
      if (typeof queueInfo.value.viewer_is_artist === 'boolean' && !queueInfo.value.viewer_is_artist) {
        errorMsg.value = '仅妆师/毛娘可提交节点状态'
        return
      }
      if (!isPaid.value) {
        errorMsg.value = '当前订单未付款，暂不可提交节点状态'
      }
    },
    fail: () => {
      errorMsg.value = '网络异常，请稍后重试'
    },
    complete: () => {
      loading.value = false
    }
  })
}

async function pickAndUploadImages() {
  if (uploading.value) return
  const remain = maxImages - uploadImages.value.length
  if (remain <= 0) {
    uni.showToast({ title: `最多上传${maxImages}张`, icon: 'none' })
    return
  }

  try {
    const files = await chooseImageList(remain)
    if (!files || !files.length) return
    uploading.value = true
    uploadText.value = '获取上传凭证...'
    const tk = await getQiniuToken()
    if (!tk?.token || !tk?.path) {
      throw new Error('获取上传凭证失败')
    }

    for (let i = 0; i < files.length; i++) {
      uploadText.value = `上传中 (${i + 1}/${files.length})`
      const ret = await uploadImageToQiniu(files[i], tk.token, tk.path)
      const url = String(ret?.imageUrl || '').trim()
      if (url) {
        uploadImages.value.push(url)
      }
    }

    uni.showToast({ title: '图片上传成功', icon: 'success' })
  } catch (e) {
    uni.showToast({ title: e?.message || '上传失败', icon: 'none' })
  } finally {
    uploading.value = false
    uploadText.value = ''
  }
}

function removeImage(index) {
  if (index < 0 || index >= uploadImages.value.length) return
  uploadImages.value.splice(index, 1)
}

function stepStateText(step) {
  const cur = currentStepID.value
  if (step.id <= cur) return '已完成'
  if (targetStep.value?.id === step.id) return '本次提交'
  return '待提交'
}

function stepStateClass(step) {
  const cur = currentStepID.value
  if (step.id <= cur) return 'done'
  if (targetStep.value?.id === step.id) return 'current'
  return 'todo'
}

function submitStep() {
  if (!canSubmit.value) {
    uni.showToast({ title: '请先完成必填项', icon: 'none' })
    return
  }
  submitting.value = true

  const token = uni.getStorageSync('token') || ''
  const payload = {
    item_id: itemId.value,
    step_id: isOnlinePayment.value ? Number(targetStep.value?.id || 0) : 0,
    images: uploadImages.value.slice()
  }

  uni.showLoading({ title: '提交中' })
  uni.request({
    url: `${websiteUrl.value}/with-state/artist-order/step/request`,
    method: 'POST',
    header: { Authorization: token, 'Content-Type': 'application/json' },
    data: payload,
    success: (res) => {
      const body = res.data || {}
      if (body.status !== 'success') {
        uni.showToast({ title: body.msg || '提交失败', icon: 'none' })
        return
      }
      if (global.lastRefresh) global.lastRefresh.time = 0
      uni.showToast({ title: '节点提交成功', icon: 'success' })
      setTimeout(() => {
        uni.navigateBack({ delta: 1 })
      }, 380)
    },
    fail: () => {
      uni.showToast({ title: '网络请求失败', icon: 'none' })
    },
    complete: () => {
      submitting.value = false
      uni.hideLoading()
    }
  })
}

onLoad((options) => {
  uni.setNavigationBarTitle({ title: '提交节点状态' })
  submissionId.value = Number(options?.submission_id || options?.submissionId || 0)
  itemId.value = Number(options?.item_id || options?.itemId || 0)
  fetchQueueInfo()
})
</script>

<style scoped lang="scss">
.step-page {
  min-height: 100vh;
  background: #f5f7fb;
  display: flex;
  flex-direction: column;
}

.step-scroll {
  flex: 1;
  min-height: 0;
}

.content {
  padding: 18rpx 0 0;
}

.card {
  margin: 0 20rpx 18rpx;
  border-radius: 22rpx;
  background: #ffffff;
  padding: 24rpx;
  border: 1rpx solid #ebeff6;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding: 6rpx 0;
}

.row + .row {
  margin-top: 8rpx;
  border-top: 1rpx dashed #edf1f6;
  padding-top: 16rpx;
}

.label {
  color: #7f8ba1;
  font-size: 24rpx;
  flex-shrink: 0;
}

.value {
  color: #273043;
  font-size: 28rpx;
  font-weight: 600;
}

.text-truncate {
  max-width: 420rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.step-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 30rpx;
  color: #1f2735;
  font-weight: 700;
}

.step-tip {
  color: #8b96aa;
  font-size: 22rpx;
}

.step-list {
  margin-top: 16rpx;
}

.step-item {
  border-radius: 16rpx;
  padding: 16rpx 18rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.step-item + .step-item {
  margin-top: 12rpx;
}

.step-item.todo {
  background: #f5f7fb;
  color: #738097;
}

.step-item.current {
  background: #e8f5ff;
  color: #2e6ea6;
  border: 1rpx solid #c8e6ff;
}

.step-item.done {
  background: #eef8f2;
  color: #2e8a63;
}

.step-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.step-index {
  width: 36rpx;
  height: 36rpx;
  border-radius: 18rpx;
  text-align: center;
  line-height: 36rpx;
  font-size: 22rpx;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.72);
}

.step-name {
  font-size: 26rpx;
  font-weight: 600;
}

.step-state {
  font-size: 22rpx;
}

.target-step-box {
  margin-top: 16rpx;
  border-radius: 14rpx;
  background: #f8fbff;
  border: 1rpx solid #e6edf8;
  padding: 12rpx 16rpx;
}

.target-label {
  font-size: 22rpx;
  color: #90a0b7;
}

.target-value {
  margin-left: 10rpx;
  color: #2c3a50;
  font-size: 26rpx;
  font-weight: 700;
}

.transfer-tip {
  margin-top: 12rpx;
  color: #5f6c81;
  font-size: 25rpx;
  line-height: 1.6;
}

.empty-tip {
  margin-top: 16rpx;
  color: #9aa4b8;
  font-size: 24rpx;
}

.upload-grid {
  margin-top: 18rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.img-cell {
  width: 156rpx;
  height: 156rpx;
  border-radius: 16rpx;
  overflow: hidden;
  position: relative;
  background: #eef2f9;
}

.img-preview {
  width: 100%;
  height: 100%;
}

.img-remove {
  position: absolute;
  right: 8rpx;
  top: 8rpx;
  width: 32rpx;
  height: 32rpx;
  border-radius: 16rpx;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-cell {
  border: 1rpx dashed #cfd8e6;
  background: #f9fbff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.add-text {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #8a96ad;
}

.uploading-text {
  margin-top: 16rpx;
  display: block;
  color: #5f738f;
  font-size: 23rpx;
}

.upload-tip {
  margin-top: 10rpx;
  display: block;
  color: #95a0b3;
  font-size: 22rpx;
}

.state-card {
  margin: 90rpx 20rpx 0;
  border-radius: 22rpx;
  background: #ffffff;
  border: 1rpx solid #edf1f6;
  text-align: center;
  padding: 28rpx;
}

.state-error {
  border-color: #f5d4d8;
  background: #fffdfd;
}

.state-title {
  display: block;
  font-size: 30rpx;
  color: #243046;
  font-weight: 700;
}

.state-desc {
  display: block;
  margin-top: 10rpx;
  color: #7f8ba0;
  font-size: 24rpx;
}

.retry-btn {
  margin-top: 20rpx;
  height: 72rpx;
  line-height: 72rpx;
  border-radius: 999rpx;
  border: none;
  background: #dff2ff;
  color: #2f6f9d;
  font-size: 26rpx;
  font-weight: 600;
}

.retry-btn::after {
  border: none;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10rpx);
  border-top: 1rpx solid #eaf0f8;
  padding: 14rpx 20rpx 0;
}

.submit-btn {
  height: 82rpx;
  line-height: 82rpx;
  border-radius: 999rpx;
  border: none;
  background: linear-gradient(135deg, #9adff8, #79cbec);
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 700;
}

.submit-btn::after {
  border: none;
}

.submit-btn.disabled {
  background: #e6ebf3;
  color: #a3adbc;
}
</style>
