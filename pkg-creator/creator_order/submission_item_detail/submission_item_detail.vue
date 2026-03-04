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

      <view v-else class="content" :class="{ 'with-bottom-actions': hasBottomActions }">
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

    <view v-if="hasBottomActions" class="bottom-action-bar">
      <view v-if="showBuyerDecisionActions" class="bottom-action-row buyer-triple">
        <button
          class="bottom-action-btn secondary ghost"
          :class="{ disabled: buyerActionBusy }"
          :disabled="buyerActionBusy"
          @tap="openBuyerActionModal('cancel')"
        >
          取消订单
        </button>
        <button
          class="bottom-action-btn secondary"
          :class="{ disabled: buyerActionBusy }"
          :disabled="buyerActionBusy"
          @tap="openBuyerActionModal('reject')"
        >
          拒绝状态
        </button>
        <button
          class="bottom-action-btn primary"
          :class="{ disabled: buyerActionBusy }"
          :disabled="buyerActionBusy"
          @tap="openBuyerActionModal('confirm')"
        >
          {{ buyerConfirmButtonText }}
        </button>
      </view>

      <view v-else-if="showArtistNegotiationActions" class="bottom-action-row dual">
        <button
          class="bottom-action-btn secondary"
          :class="{ disabled: artistNegotiationBusy }"
          :disabled="artistNegotiationBusy"
          @tap="openArtistNegotiationModal('agree')"
        >
          同意修改
        </button>
        <button
          class="bottom-action-btn primary danger"
          :class="{ disabled: artistNegotiationBusy }"
          :disabled="artistNegotiationBusy"
          @tap="openArtistNegotiationModal('reject')"
        >
          拒绝修改
        </button>
      </view>

      <view
        v-else-if="showArtistActionBar"
        class="bottom-action-row"
        :class="showArtistSubmitStep && showArtistMarkFinished ? 'dual' : 'single'"
      >
        <button
          v-if="showArtistSubmitStep"
          class="bottom-action-btn secondary"
          @tap="goStepSubmit"
        >
          提交节点状态
        </button>
        <button
          v-if="showArtistMarkFinished"
          class="bottom-action-btn primary"
          :class="{ disabled: markFinishedSubmitting }"
          :disabled="markFinishedSubmitting"
          @tap="handleArtistMarkFinished"
        >
          {{ markFinishedSubmitting ? '提交中...' : '我已画完' }}
        </button>
      </view>
    </view>

    <common-modal
      v-model:visible="buyerActionModalVisible"
      width="620rpx"
      :closeable="!buyerActionBusy"
      :center="true"
    >
      <view class="custom-modal-content" style="padding-bottom: 40rpx;">
        <text class="custom-modal-title">{{ buyerActionModalTitle }}</text>
        <text class="custom-modal-desc">{{ buyerActionModalDesc }}</text>
        <view class="custom-modal-actions">
          <button
            class="custom-modal-btn cancel"
            :disabled="buyerActionBusy"
            @tap="buyerActionModalVisible = false"
          >
            取消
          </button>
          <button
            class="custom-modal-btn confirm"
            :class="{ disabled: buyerActionBusy }"
            :disabled="buyerActionBusy"
            @tap="confirmBuyerActionModal"
          >
            {{ buyerActionBusy ? '提交中...' : buyerActionModalConfirmText }}
          </button>
        </view>
      </view>
    </common-modal>

    <common-modal
      v-model:visible="artistNegotiationModalVisible"
      width="620rpx"
      :closeable="!artistNegotiationBusy"
      :center="true"
    >
      <view class="custom-modal-content" style="padding-bottom: 40rpx;">
        <text class="custom-modal-title">{{ artistNegotiationModalTitle }}</text>
        <text class="custom-modal-desc">{{ artistNegotiationModalDesc }}</text>
        <view class="custom-modal-actions">
          <button
            class="custom-modal-btn cancel"
            :disabled="artistNegotiationBusy"
            @tap="artistNegotiationModalVisible = false"
          >
            取消
          </button>
          <button
            class="custom-modal-btn confirm"
            :class="{ disabled: artistNegotiationBusy }"
            :disabled="artistNegotiationBusy"
            @tap="confirmArtistNegotiationModal"
          >
            {{ artistNegotiationBusy ? '提交中...' : artistNegotiationModalConfirmText }}
          </button>
        </view>
      </view>
    </common-modal>

    <common-modal
      v-model:visible="finalPayModalVisible"
      width="660rpx"
      :closeable="!finalPaySubmitting && !finalPayUploading"
      :center="true"
    >
      <view class="final-pay-modal">
        <text class="final-pay-title">支付尾款并确认最终状态</text>
        <text class="final-pay-desc">请先扫码支付尾款，再上传凭证后提交确认。</text>

        <view v-if="finalSelectedMethodCodeOptions.length > 1" class="final-pay-tabs">
          <view
            v-for="code in finalSelectedMethodCodeOptions"
            :key="code.channel"
            class="final-pay-tab"
            :class="{ active: finalSelectedPayCodeChannel === code.channel }"
            @tap="selectFinalPayCodeChannel(code.channel)"
          >
            {{ code.name || code.channel }}
          </view>
        </view>

        <view class="final-pay-qr-card">
          <image
            v-if="finalSelectedPayCodeUrl"
            class="final-pay-qr-image"
            :src="finalSelectedPayCodeUrl"
            mode="aspectFit"
          />
          <text v-else class="final-pay-qr-empty">当前暂无可用收款码</text>
        </view>

        <view class="final-pay-proof-block">
          <view class="final-pay-proof-title-row">
            <text class="final-pay-proof-title">转账截图</text>
            <text class="final-pay-proof-required">*</text>
          </view>
          <view class="final-pay-proof-list">
            <view
              v-for="(img, idx) in finalPayProofImages"
              :key="`final-pay-proof-${idx}`"
              class="final-pay-proof-item"
            >
              <image
                class="final-pay-proof-image"
                :src="img"
                mode="aspectFill"
                @tap="previewImages(finalPayProofImages, idx)"
              />
              <view class="final-pay-proof-remove" @tap.stop="removeFinalPayProof(idx)">×</view>
            </view>
            <view
              v-if="finalPayProofImages.length < 3 && !finalPayUploading"
              class="final-pay-proof-add"
              @tap="chooseFinalPayProofImages"
            >
              <text class="final-pay-proof-add-icon">+</text>
              <text class="final-pay-proof-add-text">上传截图</text>
            </view>
          </view>
          <text class="final-pay-proof-help">最多3张，至少1张</text>
          <text v-if="finalPayUploading" class="final-pay-proof-uploading">{{ finalPayUploadText }}</text>
        </view>

        <view class="final-pay-message-block">
          <view class="final-pay-proof-title-row">
            <text class="final-pay-proof-title">付款留言</text>
            <text class="final-pay-proof-required">*</text>
          </view>
          <textarea
            v-model.trim="finalPayMessage"
            class="final-pay-message-input"
            maxlength="200"
            placeholder="请填写付款说明（至少2个字）"
          />
          <text class="final-pay-message-count">{{ finalPayMessageLength }}/200</text>
        </view>

        <view class="final-pay-actions">
          <button
            class="final-pay-btn cancel"
            :disabled="finalPaySubmitting || finalPayUploading"
            @tap="closeFinalPayModal"
          >
            取消
          </button>
          <button
            class="final-pay-btn confirm"
            :class="{ disabled: !canSubmitFinalBalancePay }"
            :disabled="!canSubmitFinalBalancePay"
            @tap="submitFinalBalancePayAndConfirm"
          >
            {{ finalPaySubmitting ? '提交中...' : '提交尾款并确认' }}
          </button>
        </view>
      </view>
    </common-modal>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { websiteUrl, initLoginState } from '@/common/config.js'
import { chooseImageList, getQiniuToken, uploadImageToQiniu } from '@/common/image.js'
import CommonModal from '@/components/common-modal/common-modal.vue'

const SubmissionStatusSelectedPay = 3
const SubmissionStatusPaid = 4
const PaymentMethodPlatform = 1
const PaymentMethodQRCode = 2
const PlanPaymentMethodQRCode = 1

const PayStatusPending = 0
const PayStatusDepositConfirming = 1
const PayStatusDepositPaid = 2
const PayStatusBalanceConfirming = 3
const PayStatusPaid = 4

const StepLogEventStepRequest = 'step_request'
const StepLogEventFinalConfirmRequest = 'final_confirm_request'
const StepLogEventStepRejectNegotiating = 'step_reject_negotiating'
const StepLogEventFinalRejectNegotiating = 'final_confirm_reject_negotiating'
const NegotiationStatePendingArtist = 'pending_artist_decision'

const submissionId = ref(0)
const itemId = ref(0)
const loading = ref(false)
const errorMsg = ref('')
const queueInfo = ref(null)
const paymentStatusInfo = ref(null)
const stepActioning = ref(false)
const finalConfirmSubmitting = ref(false)
const markFinishedSubmitting = ref(false)
const cancelSubmitting = ref(false)
const buyerActionModalVisible = ref(false)
const buyerActionType = ref('')
const artistNegotiationModalVisible = ref(false)
const artistNegotiationAction = ref('')
const artistNegotiationSubmitting = ref(false)
const finalPayModalVisible = ref(false)
const finalPayMethodOptions = ref([])
const finalSelectedPayMethodId = ref(0)
const finalSelectedPayCodeChannel = ref('')
const finalPayProofImages = ref([])
const finalPayMessage = ref('')
const finalPayUploading = ref(false)
const finalPayUploadText = ref('')
const finalPaySubmitting = ref(false)
const finalPayPendingConfirm = ref(false)

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

const needBalancePayBeforeFinal = computed(() => {
  return paymentMethod.value === PaymentMethodQRCode && payStatus.value !== PayStatusPaid
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

const viewerIsBuyer = computed(() => {
  const v = queueInfo.value?.viewer_is_buyer
  if (typeof v === 'boolean') return v
  return true
})

const viewerIsArtist = computed(() => {
  const v = queueInfo.value?.viewer_is_artist
  if (typeof v === 'boolean') return v
  return false
})

const finalStepID = computed(() => {
  const steps = Array.isArray(queueInfo.value?.step_configs) ? queueInfo.value.step_configs : []
  let maxID = 0
  steps.forEach((row) => {
    const id = Number(row?.id || row?.ID || 0)
    if (id > maxID) maxID = id
  })
  return maxID
})

const itemFinalStateMap = computed(() => {
  const list = Array.isArray(queueInfo.value?.item_final_states) ? queueInfo.value.item_final_states : []
  const out = {}
  list.forEach((row) => {
    const id = Number(row?.item_id || 0)
    if (id > 0) out[id] = row
  })
  return out
})

const currentItemFinalState = computed(() => {
  const id = currentItemId.value
  if (!id) return {}
  return itemFinalStateMap.value[id] || {}
})

const submissionStatus = computed(() => Number(queueInfo.value?.status || 0))
const progressLogs = computed(() => {
  const logs = queueInfo.value?.progress_logs
  return Array.isArray(logs) ? logs : []
})

function parseLogExtra(row) {
  if (!row) return {}
  const raw = row?.extra_json ?? row?.extra
  if (!raw) return {}
  if (typeof raw === 'object') return raw || {}
  const txt = String(raw).trim()
  if (!txt) return {}
  try {
    const parsed = JSON.parse(txt)
    return (parsed && typeof parsed === 'object') ? parsed : {}
  } catch (_) {
    return {}
  }
}

function isRejectNegotiatingLog(row) {
  if (!row) return false
  const status = Number(row?.status || 0)
  if (status !== 0) return false
  const eventCode = String(row?.event_code || '').trim()
  if (
    eventCode === StepLogEventStepRejectNegotiating ||
    eventCode === StepLogEventFinalRejectNegotiating
  ) return true
  const extra = parseLogExtra(row)
  return String(extra?.negotiation_state || '').trim() === NegotiationStatePendingArtist
}

const pendingStepLog = computed(() => {
  const logs = progressLogs.value
  const itemID = currentItemId.value
  if (!itemID) return null
  let picked = null
  logs.forEach((row) => {
    const logType = Number(row?.log_type || 0)
    const status = Number(row?.status || 0)
    const logItemID = Number(row?.submission_item_id || 0)
    const eventCode = String(row?.event_code || '').trim()
    if (logType !== 1 || status !== 0 || logItemID !== itemID) return
    if (eventCode && eventCode !== StepLogEventStepRequest) return
    if (isRejectNegotiatingLog(row)) return
    if (!picked) {
      picked = row
      return
    }
    const ts = Number(row?.created_at || 0)
    const pts = Number(picked?.created_at || 0)
    const id = Number(row?.id || 0)
    const pid = Number(picked?.id || 0)
    if (ts > pts || (ts === pts && id > pid)) picked = row
  })
  return picked
})

const pendingFinalRequestLog = computed(() => {
  const logs = progressLogs.value
  const itemID = currentItemId.value
  if (!itemID) return null
  let picked = null
  logs.forEach((row) => {
    const status = Number(row?.status || 0)
    const logItemID = Number(row?.submission_item_id || 0)
    const eventCode = String(row?.event_code || '').trim()
    if (status !== 0 || logItemID !== itemID || eventCode !== StepLogEventFinalConfirmRequest) return
    if (isRejectNegotiatingLog(row)) return
    if (!picked) {
      picked = row
      return
    }
    const ts = Number(row?.created_at || 0)
    const pts = Number(picked?.created_at || 0)
    const id = Number(row?.id || 0)
    const pid = Number(picked?.id || 0)
    if (ts > pts || (ts === pts && id > pid)) picked = row
  })
  return picked
})

const artistPendingNegotiationLog = computed(() => {
  const logs = progressLogs.value
  const itemID = currentItemId.value
  if (!itemID) return null
  let picked = null
  logs.forEach((row) => {
    const logItemID = Number(row?.submission_item_id || 0)
    if (logItemID !== itemID || !isRejectNegotiatingLog(row)) return
    if (!picked) {
      picked = row
      return
    }
    const ts = Number(row?.created_at || 0)
    const pts = Number(picked?.created_at || 0)
    const id = Number(row?.id || 0)
    const pid = Number(picked?.id || 0)
    if (ts > pts || (ts === pts && id > pid)) picked = row
  })
  return picked
})

const pendingStepIsFinal = computed(() => {
  const row = pendingStepLog.value
  if (!row) return false
  const stepID = Number(row?.step_id || 0)
  if (stepID > 0 && finalStepID.value > 0 && stepID === finalStepID.value) return true
  const stepName = String(row?.step_name || '').trim()
  return stepName.includes('成品')
})

const pendingStepConfirmText = computed(() => (pendingStepIsFinal.value ? '确认成品' : '确认节点'))

const showBuyerStepActions = computed(() => viewerIsBuyer.value && !!pendingStepLog.value)
const showBuyerFinalConfirm = computed(() => {
  if (!viewerIsBuyer.value) return false
  if (showBuyerStepActions.value) return false
  return !!currentItemFinalState.value?.can_confirm_final
})
const showBuyerDecisionActions = computed(() => showBuyerStepActions.value || showBuyerFinalConfirm.value)
const showArtistNegotiationActions = computed(() => {
  return viewerIsArtist.value && submissionStatus.value === SubmissionStatusPaid && !!artistPendingNegotiationLog.value
})
const showArtistActionBar = computed(() => viewerIsArtist.value && submissionStatus.value === SubmissionStatusPaid)
const showArtistSubmitStep = computed(() => showArtistActionBar.value && currentItemId.value > 0)
const showArtistMarkFinished = computed(() => showArtistActionBar.value && !!currentItemFinalState.value?.can_mark_finished)
const hasBottomActions = computed(() => {
  return (
    showBuyerDecisionActions.value ||
    showArtistNegotiationActions.value ||
    showArtistSubmitStep.value ||
    showArtistMarkFinished.value
  )
})

const buyerConfirmIsFinal = computed(() => {
  if (showBuyerStepActions.value) return pendingStepIsFinal.value
  return showBuyerFinalConfirm.value
})

const buyerActionBusy = computed(() => (
  stepActioning.value ||
  finalConfirmSubmitting.value ||
  cancelSubmitting.value
))

const buyerConfirmButtonText = computed(() => {
  if (buyerActionBusy.value) return '提交中...'
  return buyerConfirmIsFinal.value ? '确认最终状态' : pendingStepConfirmText.value
})

const buyerActionModalTitle = computed(() => {
  if (buyerActionType.value === 'cancel') return '取消订单'
  if (buyerActionType.value === 'reject') return '拒绝状态'
  if (buyerConfirmIsFinal.value) return '确认最终状态'
  return '确认节点状态'
})

const buyerActionModalDesc = computed(() => {
  if (buyerActionType.value === 'cancel') {
    return '取消此订单，会扣除订单定金并擦除部分妆面寄回；'
  }
  if (buyerActionType.value === 'reject') {
    return '拒绝后会进入协商状态，等待创作者选择同意修改或拒绝修改。'
  }
  if (buyerConfirmIsFinal.value) {
    if (needBalancePayBeforeFinal.value) {
      return '该订单为扫码转账，确认最终状态前需先支付尾款，系统将弹出收款二维码。'
    }
    return '确认当前已达到最终状态，确认后将进入结单流程。'
  }
  return '确认该节点通过后，创作者将继续推进下一节点。'
})

const buyerActionModalConfirmText = computed(() => {
  if (buyerActionType.value === 'cancel') return '确认取消'
  if (buyerActionType.value === 'reject') return '确认拒绝'
  return buyerConfirmIsFinal.value ? '确认最终状态' : '确认节点'
})

const artistNegotiationBusy = computed(() => artistNegotiationSubmitting.value)

const artistNegotiationIsFinal = computed(() => {
  const row = artistPendingNegotiationLog.value
  if (!row) return false
  const eventCode = String(row?.event_code || '').trim()
  if (eventCode === StepLogEventFinalRejectNegotiating) return true
  return Number(row?.log_type || 0) === 8
})

const artistNegotiationModalTitle = computed(() => {
  if (artistNegotiationAction.value === 'reject') return '拒绝修改'
  return '同意修改'
})

const artistNegotiationModalDesc = computed(() => {
  if (artistNegotiationAction.value === 'reject') {
    if (artistNegotiationIsFinal.value) {
      return '确认拒绝修改最终状态吗？确认后将进入擦花寄回并扣定金流程。'
    }
    return '确认拒绝本次修改请求吗？确认后将按已确认节点比例扣除并进入节点拒绝流程。'
  }
  if (artistNegotiationIsFinal.value) {
    return '确认同意修改最终状态吗？后续可重新提交最终状态让买家确认。'
  }
  return '确认同意按买家意见修改吗？后续可重新提交节点状态。'
})

const artistNegotiationModalConfirmText = computed(() => {
  if (artistNegotiationAction.value === 'reject') return '确认拒绝'
  return '确认同意'
})

const finalSelectedMethod = computed(() => {
  const target = Number(finalSelectedPayMethodId.value || 0)
  if (!target) return null
  return finalPayMethodOptions.value.find((item) => Number(item?.id || 0) === target) || null
})

const finalSelectedMethodCodeOptions = computed(() => {
  const list = finalSelectedMethod.value?.code_options
  if (!Array.isArray(list)) return []
  return list
    .map((row) => ({
      channel: String(row?.channel || '').trim().toLowerCase(),
      name: String(row?.name || '').trim(),
      url: String(row?.url || '').trim()
    }))
    .filter((row) => row.channel && row.url)
})

const finalSelectedMethodIsQRCode = computed(() => {
  return Number(finalSelectedPayMethodId.value || 0) === PlanPaymentMethodQRCode
})

const finalSelectedPayCodeUrl = computed(() => {
  if (!finalSelectedMethodIsQRCode.value) return ''
  const codes = finalSelectedMethodCodeOptions.value
  if (!codes.length) return ''
  const channel = String(finalSelectedPayCodeChannel.value || '').toLowerCase()
  const picked = codes.find((row) => row.channel === channel)
  return (picked || codes[0])?.url || ''
})

const finalPayMessageLength = computed(() => {
  return Array.from(String(finalPayMessage.value || '').trim()).length
})

const canSubmitFinalBalancePay = computed(() => {
  if (finalPaySubmitting.value || finalPayUploading.value) return false
  if (!finalSelectedMethodIsQRCode.value) return false
  if (!finalSelectedPayCodeUrl.value) return false
  if (!finalPayProofImages.value.length) return false
  return finalPayMessageLength.value >= 2
})

const historyEvents = computed(() => {
  const logs = progressLogs.value
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
      if (isRejectNegotiatingLog(row)) dotClass = idx === 0 ? 'latest' : 'pending'
      if (status === 0) dotClass = idx === 0 ? 'latest' : 'pending'
      if (status === 2) dotClass = 'reject'
      const eventCode = String(row?.event_code || '').trim()
      if (eventCode === 'step_reject_agree_modify' || eventCode === 'final_confirm_reject_agree_modify') {
        dotClass = 'done'
      }
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
  if (eventCode === 'step_reject_negotiating') return '节点协商中'
  if (eventCode === 'final_confirm_reject_negotiating') return '最终状态协商中'
  if (eventCode === 'step_reject_agree_modify') return '创作者同意修改'
  if (eventCode === 'final_confirm_reject_agree_modify') return '创作者同意修改最终状态'
  if (eventCode === 'final_confirm_request_rejected') return '最终状态已拒绝'
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
  if (eventCode === 'step_reject_negotiating') return '买家已驳回节点，等待创作者处理协商。'
  if (eventCode === 'final_confirm_reject_negotiating') return '买家已拒绝最终状态，等待创作者处理协商。'
  if (eventCode === 'step_reject_agree_modify' || eventCode === 'final_confirm_reject_agree_modify') {
    return '创作者已同意修改，后续将重新提交状态。'
  }
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

function resetFinalPayState() {
  finalPayMethodOptions.value = []
  finalSelectedPayMethodId.value = 0
  finalSelectedPayCodeChannel.value = ''
  finalPayProofImages.value = []
  finalPayMessage.value = ''
  finalPayUploading.value = false
  finalPayUploadText.value = ''
  finalPaySubmitting.value = false
}

function closeFinalPayModal() {
  if (finalPaySubmitting.value || finalPayUploading.value) return
  finalPayModalVisible.value = false
  finalPayPendingConfirm.value = false
  resetFinalPayState()
}

watch(finalPayModalVisible, (visible) => {
  if (visible) return
  if (finalPaySubmitting.value || finalPayUploading.value) return
  finalPayPendingConfirm.value = false
  resetFinalPayState()
})

watch(artistNegotiationModalVisible, (visible) => {
  if (visible) return
  if (artistNegotiationSubmitting.value) return
  artistNegotiationAction.value = ''
})

function syncFinalPayCodeChannel() {
  if (!finalSelectedMethodIsQRCode.value) {
    finalSelectedPayCodeChannel.value = ''
    return
  }
  const options = finalSelectedMethodCodeOptions.value
  if (!options.length) {
    finalSelectedPayCodeChannel.value = ''
    return
  }
  const current = String(finalSelectedPayCodeChannel.value || '').toLowerCase()
  const exists = options.some((row) => row.channel === current)
  if (!exists) {
    finalSelectedPayCodeChannel.value = options[0].channel
  }
}

function selectFinalPayCodeChannel(channel) {
  finalSelectedPayCodeChannel.value = String(channel || '').toLowerCase()
  syncFinalPayCodeChannel()
}

async function fetchFinalPayOptions() {
  const token = uni.getStorageSync('token') || ''
  if (!token) {
    throw new Error('请先登录')
  }
  const res = await uni.request({
    url: `${websiteUrl.value}/with-state/artist-order/submission/pay-options`,
    method: 'GET',
    header: { Authorization: token },
    data: { submission_id: submissionId.value }
  })
  const body = res?.data || {}
  if (String(body.status).toLowerCase() !== 'success') {
    throw new Error(body.msg || '获取付款方式失败')
  }
  return body.data || {}
}

async function openFinalBalancePayModal() {
  try {
    uni.showLoading({ title: '加载收款码' })
    const data = await fetchFinalPayOptions()
    const methods = Array.isArray(data?.payment_methods) ? data.payment_methods : []
    const qrMethods = methods.filter((row) => Number(row?.id || 0) === PlanPaymentMethodQRCode)
    if (!qrMethods.length) {
      finalPayPendingConfirm.value = false
      uni.showToast({ title: '当前暂无可用收款码', icon: 'none' })
      return false
    }
    finalPayMethodOptions.value = qrMethods
    finalSelectedPayMethodId.value = Number(qrMethods[0]?.id || PlanPaymentMethodQRCode)
    syncFinalPayCodeChannel()
    if (!finalSelectedPayCodeUrl.value) {
      finalPayPendingConfirm.value = false
      uni.showToast({ title: '当前暂无可用收款码', icon: 'none' })
      return false
    }
    finalPayModalVisible.value = true
    return true
  } catch (e) {
    finalPayPendingConfirm.value = false
    uni.showToast({ title: e?.message || '获取收款码失败', icon: 'none' })
    return false
  } finally {
    uni.hideLoading()
  }
}

function removeFinalPayProof(index) {
  const list = finalPayProofImages.value.slice()
  if (index < 0 || index >= list.length) return
  list.splice(index, 1)
  finalPayProofImages.value = list
}

async function chooseFinalPayProofImages() {
  const remain = 3 - finalPayProofImages.value.length
  if (remain <= 0) {
    uni.showToast({ title: '最多上传3张截图', icon: 'none' })
    return
  }
  try {
    const files = await chooseImageList(remain)
    if (!Array.isArray(files) || !files.length) return
    finalPayUploading.value = true
    finalPayUploadText.value = '准备上传...'
    for (let i = 0; i < files.length; i++) {
      finalPayUploadText.value = `上传中 (${i + 1}/${files.length})`
      const tk = await getQiniuToken()
      if (!tk?.token || !tk?.path) {
        throw new Error('获取上传凭证失败')
      }
      const ret = await uploadImageToQiniu(files[i], tk.token, tk.path)
      const url = String(ret?.imageUrl || '').trim()
      if (!url) {
        throw new Error('上传失败，请重试')
      }
      finalPayProofImages.value.push(url)
      if (finalPayProofImages.value.length >= 3) break
    }
    finalPayUploadText.value = ''
  } catch (e) {
    uni.showToast({ title: e?.message || '上传失败', icon: 'none' })
  } finally {
    finalPayUploading.value = false
  }
}

async function submitFinalBalancePayRequest() {
  if (!canSubmitFinalBalancePay.value) {
    uni.showToast({ title: '请先完成尾款凭证填写', icon: 'none' })
    return false
  }
  const token = uni.getStorageSync('token') || ''
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return false
  }
  finalPaySubmitting.value = true
  uni.showLoading({ title: '提交尾款中' })
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/pay`,
      method: 'POST',
      header: {
        Authorization: token,
        'Content-Type': 'application/json'
      },
      data: {
        submission_id: submissionId.value,
        payment_method: Number(finalSelectedPayMethodId.value || PlanPaymentMethodQRCode),
        payment_code_channel: String(finalSelectedPayCodeChannel.value || ''),
        payment_proof_images: finalPayProofImages.value.slice(),
        payment_message: String(finalPayMessage.value || '').trim()
      }
    })
    const body = res?.data || {}
    if (String(body.status).toLowerCase() !== 'success') {
      uni.showToast({ title: body.msg || '尾款提交失败', icon: 'none' })
      return false
    }
    uni.showToast({ title: '尾款凭证已提交', icon: 'success' })
    finalPayModalVisible.value = false
    resetFinalPayState()
    await fetchAll()
    return true
  } catch (_) {
    uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
    return false
  } finally {
    finalPaySubmitting.value = false
    uni.hideLoading()
  }
}

async function submitFinalBalancePayAndConfirm() {
  const shouldAutoConfirm = !!finalPayPendingConfirm.value
  const paid = await submitFinalBalancePayRequest()
  if (!paid) return
  if (!shouldAutoConfirm) return
  finalPayPendingConfirm.value = false
  await doConfirmItemFinalRequest()
}

function goStepSubmit() {
  const id = currentItemId.value
  if (!id) {
    uni.showToast({ title: '缺少子单ID', icon: 'none' })
    return
  }
  uni.navigateTo({
    url: `/pkg-creator/creator_order/step_submit/step_submit?submission_id=${submissionId.value}&item_id=${id}`
  })
}

async function submitStepDecision(action) {
  const row = pendingStepLog.value || pendingFinalRequestLog.value
  const logID = Number(row?.id || 0)
  if (!logID || stepActioning.value) return
  const token = uni.getStorageSync('token') || ''
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  stepActioning.value = true
  uni.showLoading({ title: '提交中' })
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/step/${action === 'confirm' ? 'confirm' : 'reject'}`,
      method: 'POST',
      header: {
        Authorization: token,
        'Content-Type': 'application/json'
      },
      data: action === 'confirm'
        ? { log_id: logID }
        : { log_id: logID, reason: '' }
    })
    const body = res?.data || {}
    if (String(body.status).toLowerCase() !== 'success') {
      uni.showToast({ title: body.msg || '提交失败', icon: 'none' })
      return
    }
    uni.showToast({ title: action === 'confirm' ? '已确认' : '已进入协商', icon: 'success' })
    await fetchAll()
  } catch (_) {
    uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
  } finally {
    stepActioning.value = false
    uni.hideLoading()
  }
}

function openArtistNegotiationModal(action) {
  if (!showArtistNegotiationActions.value) return
  if (artistNegotiationBusy.value) return
  if (!artistPendingNegotiationLog.value) {
    uni.showToast({ title: '当前无待处理协商', icon: 'none' })
    return
  }
  artistNegotiationAction.value = action
  artistNegotiationModalVisible.value = true
}

async function submitArtistNegotiationDecision() {
  const row = artistPendingNegotiationLog.value
  const logID = Number(row?.id || 0)
  if (!logID) {
    uni.showToast({ title: '缺少协商记录', icon: 'none' })
    return
  }
  if (artistNegotiationBusy.value) return
  const token = uni.getStorageSync('token') || ''
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  const isReject = artistNegotiationAction.value === 'reject'
  const action = isReject ? 'reject_modify' : 'agree_modify'
  artistNegotiationSubmitting.value = true
  uni.showLoading({ title: '提交中' })
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/step/reject-decision`,
      method: 'POST',
      header: {
        Authorization: token,
        'Content-Type': 'application/json'
      },
      data: {
        log_id: logID,
        action
      }
    })
    const body = res?.data || {}
    if (String(body.status).toLowerCase() !== 'success') {
      uni.showToast({ title: body.msg || '处理失败', icon: 'none' })
      return
    }
    uni.showToast({ title: isReject ? '已拒绝修改' : '已同意修改', icon: 'success' })
    artistNegotiationModalVisible.value = false
    artistNegotiationAction.value = ''
    await fetchAll()
  } catch (_) {
    uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
  } finally {
    artistNegotiationSubmitting.value = false
    uni.hideLoading()
  }
}

function confirmArtistNegotiationModal() {
  if (artistNegotiationBusy.value) return
  submitArtistNegotiationDecision()
}

async function doConfirmItemFinalRequest() {
  const state = currentItemFinalState.value || {}
  if (!state?.can_confirm_final) {
    uni.showToast({ title: '当前不可确认', icon: 'none' })
    return false
  }
  const id = currentItemId.value
  if (!id) {
    uni.showToast({ title: '缺少子单ID', icon: 'none' })
    return false
  }
  if (finalConfirmSubmitting.value) return false
  const token = uni.getStorageSync('token') || ''
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return false
  }
  finalConfirmSubmitting.value = true
  uni.showLoading({ title: '确认中' })
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/item/confirm-final`,
      method: 'POST',
      header: {
        Authorization: token,
        'Content-Type': 'application/json'
      },
      data: { item_id: id }
    })
    const body = res?.data || {}
    if (String(body.status).toLowerCase() !== 'success') {
      uni.showToast({ title: body.msg || '确认失败', icon: 'none' })
      return false
    }
    uni.showToast({ title: '已确认', icon: 'success' })
    await fetchAll()
    return true
  } catch (_) {
    uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
    return false
  } finally {
    finalConfirmSubmitting.value = false
    uni.hideLoading()
  }
}

async function handleConfirmItemFinal() {
  if (needBalancePayBeforeFinal.value) {
    finalPayPendingConfirm.value = true
    await openFinalBalancePayModal()
    return false
  }
  return doConfirmItemFinalRequest()
}

async function submitCancelOrder() {
  if (cancelSubmitting.value) return
  const token = uni.getStorageSync('token') || ''
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  if (!submissionId.value) {
    uni.showToast({ title: '缺少 submission_id', icon: 'none' })
    return
  }

  const isArtist = !!viewerIsArtist.value
  cancelSubmitting.value = true
  uni.showLoading({ title: '提交中' })
  try {
    const res = await uni.request({
      url: isArtist
        ? `${websiteUrl.value}/with-state/artist-order/submission/operate`
        : `${websiteUrl.value}/with-state/artist-order/cancel`,
      method: 'POST',
      header: {
        Authorization: token,
        'Content-Type': 'application/json'
      },
      data: isArtist
        ? { submission_id: submissionId.value, action: 'cancel_order' }
        : { submission_id: submissionId.value }
    })
    const body = res?.data || {}
    if (String(body.status).toLowerCase() !== 'success') {
      uni.showToast({ title: body.msg || '取消失败', icon: 'none' })
      return
    }
    uni.showToast({ title: '订单已取消', icon: 'success' })
    await fetchAll()
  } catch (_) {
    uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
  } finally {
    cancelSubmitting.value = false
    uni.hideLoading()
  }
}

function openBuyerActionModal(action) {
  if (!showBuyerDecisionActions.value) return
  if (buyerActionBusy.value) return
  if (action === 'reject' && !pendingStepLog.value && !pendingFinalRequestLog.value) {
    uni.showToast({ title: '当前不可拒绝', icon: 'none' })
    return
  }
  if (action === 'confirm') {
    if (showBuyerStepActions.value && !pendingStepLog.value) {
      uni.showToast({ title: '当前不可确认', icon: 'none' })
      return
    }
    if (!showBuyerStepActions.value && !showBuyerFinalConfirm.value) {
      uni.showToast({ title: '当前不可确认', icon: 'none' })
      return
    }
  }
  buyerActionType.value = action
  buyerActionModalVisible.value = true
}

async function confirmBuyerActionModal() {
  if (buyerActionBusy.value) return
  const action = buyerActionType.value
  if (!action) return
  if (action === 'confirm') {
    if (showBuyerStepActions.value) {
      await submitStepDecision('confirm')
    } else {
      await handleConfirmItemFinal()
    }
  } else if (action === 'reject') {
    await submitStepDecision('reject')
  } else if (action === 'cancel') {
    await submitCancelOrder()
  }
  if (!buyerActionBusy.value) {
    buyerActionModalVisible.value = false
    buyerActionType.value = ''
  }
}

function handleArtistMarkFinished() {
  const state = currentItemFinalState.value || {}
  if (!state?.can_mark_finished) {
    uni.showToast({ title: '请先提交一次节点状态', icon: 'none' })
    return
  }
  const id = currentItemId.value
  if (!id) {
    uni.showToast({ title: '缺少子单ID', icon: 'none' })
    return
  }
  uni.showModal({
    title: '我已画完',
    content: '提交后将向买家发起最终状态确认，是否继续？',
    confirmText: '确认提交',
    success: async ({ confirm }) => {
      if (!confirm || markFinishedSubmitting.value) return
      const token = uni.getStorageSync('token') || ''
      if (!token) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        return
      }
      markFinishedSubmitting.value = true
      uni.showLoading({ title: '提交中' })
      try {
        const res = await uni.request({
          url: `${websiteUrl.value}/with-state/artist-order/item/mark-finished`,
          method: 'POST',
          header: {
            Authorization: token,
            'Content-Type': 'application/json'
          },
          data: { item_id: id }
        })
        const body = res?.data || {}
        if (String(body.status).toLowerCase() !== 'success') {
          uni.showToast({ title: body.msg || '提交失败', icon: 'none' })
          return
        }
        uni.showToast({ title: '已发送确认请求', icon: 'success' })
        await fetchAll()
      } catch (_) {
        uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
      } finally {
        markFinishedSubmitting.value = false
        uni.hideLoading()
      }
    }
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

.content.with-bottom-actions {
  padding-bottom: 190rpx;
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

.bottom-action-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 -8rpx 24rpx rgba(23, 34, 53, 0.08);
  padding: 14rpx 20rpx calc(14rpx + constant(safe-area-inset-bottom));
  padding: 14rpx 20rpx calc(14rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.bottom-action-row {
  display: flex;
  gap: 14rpx;
}

.bottom-action-row.single .bottom-action-btn {
  width: 100%;
}

.bottom-action-row.dual .bottom-action-btn {
  flex: 1;
}

.bottom-action-row.buyer-triple {
  gap: 10rpx;
}

.bottom-action-row.buyer-triple .bottom-action-btn {
  flex: 1;
  min-width: 0;
  font-size: 23rpx;
}

.bottom-action-btn {
  height: 78rpx;
  line-height: 78rpx;
  border-radius: 999rpx;
  border: none;
  text-align: center;
  font-size: 25rpx;
  font-weight: 600;
}

.bottom-action-btn::after {
  border: none;
}

.bottom-action-btn.primary {
  background: linear-gradient(135deg, #9ab8ff 0%, #7ea0ef 100%);
  color: #fff;
}

.bottom-action-btn.primary.danger {
  background: linear-gradient(135deg, #f2a9a9 0%, #e18f8f 100%);
}

.bottom-action-btn.secondary {
  background: #ebeff6;
  color: #5c6c83;
}

.bottom-action-btn.secondary.ghost {
  background: #f3f4f8;
  color: #7a859a;
}

.bottom-action-btn.disabled {
  background: #d9e1ef;
  color: #96a5bf;
}

.custom-modal-title {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  color: #2b3445;
  text-align: center;
}

.custom-modal-desc {
  display: block;
  margin-top: 16rpx;
  font-size: 26rpx;
  line-height: 1.68;
  color: #58657a;
  text-align: center;
}

.custom-modal-actions {
  margin-top: 28rpx;
  display: flex;
  gap: 16rpx;
}

.custom-modal-btn {
  flex: 1;
  height: 76rpx;
  line-height: 76rpx;
  border-radius: 999rpx;
  border: none;
  font-size: 26rpx;
  font-weight: 600;
}

.custom-modal-btn::after {
  border: none;
}

.custom-modal-btn.cancel {
  background: #eef2f8;
  color: #6b7890;
}

.custom-modal-btn.confirm {
  background: linear-gradient(135deg, #9ab8ff 0%, #7ea0ef 100%);
  color: #fff;
}

.custom-modal-btn.confirm.disabled {
  background: #d9e1ef;
  color: #96a5bf;
}

.final-pay-modal {
  padding: 6rpx 2rpx 10rpx;
}

.final-pay-title {
  display: block;
  text-align: center;
  font-size: 32rpx;
  font-weight: 700;
  color: #243146;
}

.final-pay-desc {
  display: block;
  margin-top: 10rpx;
  text-align: center;
  font-size: 23rpx;
  color: #6a778f;
  line-height: 1.55;
}

.final-pay-tabs {
  margin-top: 18rpx;
  display: flex;
  gap: 10rpx;
  justify-content: center;
}

.final-pay-tab {
  min-width: 152rpx;
  height: 58rpx;
  padding: 0 20rpx;
  border-radius: 999rpx;
  background: #edf2f8;
  color: #5f6f86;
  font-size: 23rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.final-pay-tab.active {
  background: #d8eaff;
  color: #2e4d85;
  font-weight: 600;
}

.final-pay-qr-card {
  margin: 18rpx auto 0;
  width: 360rpx;
  height: 360rpx;
  border-radius: 20rpx;
  background: #f5f8fd;
  display: flex;
  align-items: center;
  justify-content: center;
}

.final-pay-qr-image {
  width: 320rpx;
  height: 320rpx;
}

.final-pay-qr-empty {
  font-size: 24rpx;
  color: #8a95a8;
}

.final-pay-proof-block {
  margin-top: 18rpx;
}

.final-pay-proof-title-row {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.final-pay-proof-title {
  font-size: 24rpx;
  color: #36455f;
  font-weight: 600;
}

.final-pay-proof-required {
  font-size: 24rpx;
  color: #e27a7a;
}

.final-pay-proof-list {
  margin-top: 10rpx;
  display: flex;
  gap: 10rpx;
  flex-wrap: wrap;
}

.final-pay-proof-item {
  width: 124rpx;
  height: 124rpx;
  border-radius: 12rpx;
  position: relative;
  overflow: hidden;
  background: #edf3fa;
}

.final-pay-proof-image {
  width: 124rpx;
  height: 124rpx;
}

.final-pay-proof-remove {
  position: absolute;
  right: 6rpx;
  top: 6rpx;
  width: 34rpx;
  height: 34rpx;
  border-radius: 50%;
  background: rgba(32, 41, 58, 0.62);
  color: #fff;
  font-size: 24rpx;
  line-height: 34rpx;
  text-align: center;
}

.final-pay-proof-add {
  width: 124rpx;
  height: 124rpx;
  border-radius: 12rpx;
  border: 2rpx dashed #d2dceb;
  background: #f8fbff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
}

.final-pay-proof-add-icon {
  font-size: 34rpx;
  color: #8192ad;
  line-height: 1;
}

.final-pay-proof-add-text {
  font-size: 21rpx;
  color: #7d8ca5;
}

.final-pay-proof-help {
  display: block;
  margin-top: 8rpx;
  font-size: 21rpx;
  color: #8a95a8;
}

.final-pay-proof-uploading {
  display: block;
  margin-top: 6rpx;
  font-size: 21rpx;
  color: #5f7db3;
}

.final-pay-message-block {
  margin-top: 14rpx;
}

.final-pay-message-input {
  margin-top: 10rpx;
  width: 100%;
  min-height: 132rpx;
  padding: 16rpx 18rpx;
  border-radius: 14rpx;
  background: #f5f8fd;
  font-size: 23rpx;
  line-height: 1.58;
  color: #2f3d54;
  box-sizing: border-box;
}

.final-pay-message-count {
  display: block;
  margin-top: 8rpx;
  text-align: right;
  font-size: 21rpx;
  color: #8d98ab;
}

.final-pay-actions {
  margin-top: 18rpx;
  display: flex;
  gap: 12rpx;
}

.final-pay-btn {
  flex: 1;
  height: 74rpx;
  line-height: 74rpx;
  border-radius: 999rpx;
  border: none;
  font-size: 24rpx;
  font-weight: 600;
}

.final-pay-btn::after {
  border: none;
}

.final-pay-btn.cancel {
  background: #eef2f8;
  color: #6b7890;
}

.final-pay-btn.confirm {
  background: linear-gradient(135deg, #8bb0ff 0%, #749ae8 100%);
  color: #fff;
}

.final-pay-btn.confirm.disabled {
  background: #d9e1ef;
  color: #96a5bf;
}
</style>
