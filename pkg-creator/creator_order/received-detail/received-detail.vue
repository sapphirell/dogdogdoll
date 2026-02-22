<template>
  <view-logs />
  <view class="submission-page">

    <scroll-view
      class="scroll-body"
      scroll-y
      :show-scrollbar="false"
    >
      <view v-if="loading" class="state-box">
        <text class="state-title">加载中…</text>
        <text class="state-desc">正在获取投递详情</text>
      </view>

      <view v-else-if="!queueInfo" class="state-box state-error">
        <text class="state-title">获取失败</text>
        <text class="state-desc">{{ errorMsg || '暂时无法获取投递信息' }}</text>
        <button class="btn-retry" @tap="reload">重试</button>
      </view>

	      <view v-else class="content">
	        <view class="card status-card">
	          <view class="status-row">
	            <view class="status-left-group">
	                <order-status
	                  :status="queueInfo.status"
	                  :text="queueInfo.status_text || '未知状态'"
	                  size="small"
	                />
	                <view v-if="queueInfo.premium_queue_status === 1" class="tag-premium">
	                    <text class="tag-text">钞能力</text>
	                </view>
	            </view>
	          </view>

          <view class="status-row">
            <text class="status-label">排队位置</text>
            <view class="status-value-group">
              <text v-if="queueInfo.ahead_count > 0" class="font-title">
                {{ queueInfo.ahead_count }}
              </text>
              <text v-else-if="queueInfo.status === 0" class="font-title">0</text>
              <text v-else class="status-normal-text">不在队列中</text>
              <text v-if="queueInfo.ahead_count > 0" class="status-unit">位</text>
            </view>
          </view>

          <view class="status-row">
            <text class="status-label">ID</text>
            <text class="font-title">#{{ queueInfo.submission_id }}</text>
          </view>

          <view
            class="status-row payment-status-row"
            :class="{ clickable: isQrPayment }"
	            @tap="openPaymentStatusModal"
	          >
	            <text class="status-label">付款状态</text>
	            <view class="payment-status-right">
	              <text class="status-normal-text">{{ paymentStatusText }}</text>
	              <view v-if="paymentMethodTagText" class="payment-method-tag">
	                <text class="payment-method-tag-text">{{ paymentMethodTagText }}</text>
	              </view>
	              <uni-icons v-if="isQrPayment" type="right" size="16" color="#98a2b3" />
	            </view>
	          </view>
          
          <view class="status-actions">
            <view 
              class="user-info-group" 
              v-if="targetUserInfo"
              @tap="goUserPage"
            >
              <image 
                class="user-avatar" 
                :src="targetUserInfo.avatar || 'https://images1.fantuanpu.com/home/default_avatar.jpg'" 
                mode="aspectFill"
              />
              <text class="user-name">{{ targetUserInfo.user_name || '未知用户' }}</text>
            </view>
            <view v-else class="user-info-placeholder"></view>

            <button
              class="btn-chat-inline"
              @tap="handleChatWithSeller"
            >
              <uni-icons type="chatbubble" size="16" color="#4a3131" style="margin-right: 4rpx;"/>
              {{ isBuyer ? '联系卖家' : '联系买家' }}
            </button>
          </view>
        </view>

        <view class="card items-card">
          <view class="card-header">
            <text class="card-title">投递内容（{{ items.length }}）</text>
          </view>

          <view
            v-if="!items.length"
            class="state-box"
            style="margin-top: 0;"
          >
            <text class="state-title">还没有作品</text>
            <text class="state-desc">可以稍后再为本次投递添加作品</text>
          </view>

          <view v-else>
            <scroll-view
              v-if="items.length > 1"
              class="item-tabs-scroll"
              scroll-x
              :show-scrollbar="false"
            >
              <view class="item-tabs-wrap">
                <view
                  v-for="(item, idx) in items"
                  :key="`tab-${getItemID(item) || idx}`"
                  class="item-tab"
                  :class="{ active: isActiveItem(item) }"
                  @tap="setActiveItem(item)"
                >
                  <text class="item-tab-title">{{ getItemTabTitle(item, idx) }}</text>
                  <text class="item-tab-sub font-title">No.{{ String(idx + 1).padStart(3, '0') }}</text>
                </view>
              </view>
            </scroll-view>

            <view
              v-if="activeItem"
              :key="`active-item-${getItemID(activeItem)}`"
              class="item-row item-row-active"
            >
              <view class="item-main">
                <view class="item-cover-wrap" v-if="getFirstImage(activeItem)">
                  <image
                    class="item-cover"
                    :src="getFirstImage(activeItem)"
                    mode="aspectFill"
                  />
                </view>

                <view class="item-body">
                  <view class="item-title-row">
                    <text class="item-title">
                      {{ getItemTitle(activeItem) }}
                    </text>
                  </view>

                  <view class="item-meta-row">
                    <text v-if="activeItem.size" class="item-meta">尺寸：{{ activeItem.size }}</text>
                    <text v-if="activeItem.tier_title" class="item-meta">档位：{{ activeItem.tier_title }}</text>
                    <text v-if="getAddonsTitles(activeItem)" class="item-meta">
                      加购：{{ getAddonsTitles(activeItem) }}
                    </text>
                  </view>

                  <view class="item-meta-row">
                    <text class="item-meta">
                      订单状态：{{ formatItemStatus(activeItem.status) }}
                    </text>
                  </view>

                  <view class="item-meta-row">
                    <text class="item-meta">
                      当前金额：¥ {{ formatPrice(calcItemTotal(activeItem)) }}
                    </text>
                    <text v-if="Number(activeItem.adjust_price) !== 0" class="item-meta adjust">
                      调价差额：{{ activeItem.adjust_price > 0 ? '+' : '' }}{{ formatPrice(activeItem.adjust_price) }}
                    </text>
                  </view>
                </view>
              </view>

	              <view class="item-actions">
	                <button
	                  class="btn-mini"
	                  @tap="openChangePricePanel(activeItem)"
	                >
	                  修改金额
	                </button>
	                <button
	                  class="btn-mini step-submit"
	                  :class="{ disabled: !canSubmitStep(activeItem) }"
	                  :disabled="!canSubmitStep(activeItem)"
	                  @tap="handleSubmitStep(activeItem)"
	                >
	                  提交节点状态
	                </button>
	                <button
	                  class="btn-mini mark-finished"
	                  :class="{ disabled: !canMarkFinished(activeItem) }"
	                  :disabled="!canMarkFinished(activeItem)"
	                  @tap="handleMarkItemFinished(activeItem)"
	                >
	                  我已画完
	                </button>
	              </view>
	              <view
	                v-if="getItemFinalState(activeItem).final_confirmed"
	                class="item-final-state done"
	              >
	                买家已确认最终状态
	              </view>
	              <view
	                v-else-if="getItemFinalState(activeItem).final_request_pending"
	                class="item-final-state pending"
	              >
	                已提交最终状态，等待买家确认
	              </view>
	            </view>
	          </view>
	        </view>

	        <view v-if="showDeliveryFlowCard" class="card delivery-card">
	          <view class="card-header">
	            <text class="card-title">订单收尾</text>
	          </view>
	          <view class="delivery-state-line" v-if="returnAddressRequested && !returnAddressReady">
	            <text class="delivery-state-text">已发起结单，等待买家填写寄回地址</text>
	          </view>
	          <view class="delivery-address-block" v-if="returnAddressInfo">
	            <text class="delivery-label">寄回地址</text>
	            <text class="delivery-address-name">
	              {{ returnAddressInfo.receiver_name || '' }} {{ returnAddressInfo.receiver_phone || '' }}
	            </text>
	            <text class="delivery-address-line">{{ returnAddressInfo.full_address || '' }}</text>
	          </view>
	          <view class="delivery-state-line" v-if="returnShipped">
	            <text class="delivery-state-text">已寄回：{{ returnExpressNoText || '-' }}</text>
	          </view>
	          <view class="delivery-actions">
	            <button
	              v-if="canCloseSubmissionAction"
	              class="delivery-action-btn close"
	              @tap="handleCloseSubmission"
	            >
	              结单
	            </button>
	            <button
	              v-if="canShipBackAction"
	              class="delivery-action-btn ship"
	              @tap="openShipBackPanel"
	            >
	              寄回
	            </button>
	          </view>
	        </view>

	        <view class="card history-card">
	          <view class="card-header">
	            <text class="card-title">创作历史</text>
            <text v-if="activeItemName" class="history-current-item">{{ activeItemName }}</text>
          </view>

          <view v-if="visibleCreativeHistoryEvents.length" class="history-list">
            <view
              v-for="(event, idx) in visibleCreativeHistoryEvents"
              :key="event.key"
              class="history-row"
            >
              <view class="history-axis">
                <view class="history-dot" :class="event.dotClass"></view>
                <view v-if="idx < visibleCreativeHistoryEvents.length - 1" class="history-line"></view>
              </view>

              <view class="history-main">
                <view class="history-head">
                  <text class="history-title">{{ event.title }}</text>
                  <text class="history-time font-title">{{ event.timeText }}</text>
                </view>
                <text v-if="event.desc" class="history-desc">{{ event.desc }}</text>
                <view v-if="event.images && event.images.length" class="history-image-list">
                  <image
                    v-for="(img, imgIdx) in event.images.slice(0, 3)"
                    :key="`${event.key}-img-${imgIdx}`"
                    class="history-image"
                    :src="img"
                    mode="aspectFill"
                    @tap="previewHistoryImages(event.images, imgIdx)"
                  />
                  <view
                    v-if="event.images.length > 3"
                    class="history-image-more"
                    @tap="previewHistoryImages(event.images, 0)"
                  >
                    +{{ event.images.length - 3 }}
                  </view>
                </view>
              </view>
            </view>
          </view>
          <view v-else class="history-empty">
            <text class="state-desc">暂无创作历史动态</text>
          </view>
        </view>

        <view
          v-if="draftItems.length"
          class="card draft-card"
        >
          <view class="card-header">
            <text class="card-title">草稿作品（未挂到投递）</text>
          </view>

          <view
            v-for="d in draftItems"
            :key="d.id"
            class="item-row draft-item"
          >
            <view class="item-main">
              <view class="item-body">
                <text class="item-title">
                  {{ (d.work_subject || '').trim() || '未命名作品' }}
                </text>
                <view class="item-meta-row">
                  <text v-if="d.size" class="item-meta">尺寸：{{ d.size }}</text>
                  <text v-if="d.tier_title" class="item-meta">档位：{{ d.tier_title }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view v-if="showBottomBar" :style="{ height: footerPlaceholderHeight }"></view>
      </view>
    </scroll-view>

    <view v-if="showBottomBar" class="bottom-bar" :style="{ paddingBottom: bottomBarPadding }">
      <view
        class="bottom-actions-row"
        :class="{
          'only-cancel': canOnlyCancel,
          'three-actions': canArtistCancel && canArtistReturn && canArtistConfirm
        }"
      >
        <view class="left-text-actions">
            <view
              v-if="canArtistCancel"
              class="text-btn-item danger"
              :class="{ 'solo-cancel-box': canOnlyCancel }"
              @tap="handleAuditSubmission('cancel_order')"
            >
                取消订单
            </view>
            <view
              v-if="canArtistReturn"
              class="text-btn-item"
              @tap="handleAuditSubmission('return_pending')"
            >
                退回修改
            </view>
        </view>
        
        <button v-if="canArtistConfirm" class="action-btn-large" @tap="handleConfirmSubmission">
            确认订单
        </button>
      </view>
    </view>

	    <uni-popup
	      ref="pricePopupRef"
	      type="bottom"
	      :mask-click="true"
	      @change="onPricePopupChange"
    >
      <view class="price-sheet" :style="{ paddingBottom: footerPadding }">
        <view class="price-header">
          <text class="price-title">修改金额</text>
          <text class="price-close" @tap="closePricePanel">关闭</text>
        </view>

        <view class="price-body" v-if="editingItem">
          <view class="price-row">
            <text class="price-label">作品</text>
            <text class="price-value">
              {{ (editingItem.work_subject || '').trim() || '未命名作品' }}
            </text>
          </view>

          <view class="price-row">
            <text class="price-label">当前金额</text>
            <text class="price-value">
              ¥ {{ formatPrice(calcItemTotal(editingItem)) }}
            </text>
          </view>

          <view class="price-row">
            <text class="price-label">新总金额</text>
            <input
              type="digit"
              class="price-input"
              v-model="priceInput"
              placeholder="请输入新的总金额（整数或小数）"
            />
          </view>

          <view class="price-row-column">
            <text class="price-label">调价说明（选填）</text>
            <textarea
              class="price-textarea"
              v-model="reasonInput"
              placeholder="该说明会发送给对方，建议简单说明调价原因"
              auto-height
              maxlength="200"
            />
          </view>
        </view>

        <view class="price-footer">
          <button class="price-btn" @tap="submitChangePrice">
            提交修改金额
          </button>
        </view>
	      </view>
	    </uni-popup>

	    <uni-popup
	      ref="shipPopupRef"
	      type="bottom"
	      :mask-click="true"
	      @change="onShipPopupChange"
	    >
	      <view class="ship-sheet" :style="{ paddingBottom: footerPadding }">
	        <view class="ship-header">
	          <text class="ship-title">填写寄回单号</text>
	          <text class="ship-close" @tap="closeShipBackPanel">关闭</text>
	        </view>
	        <view class="ship-body">
	          <input
	            v-model="shipExpressNo"
	            class="ship-input"
	            placeholder="请输入快递单号"
	          />
	        </view>
	        <view class="ship-footer">
	          <button
	            class="ship-submit-btn"
	            :disabled="shipSubmitting"
	            @tap="submitShipBack"
	          >
	            {{ shipSubmitting ? '提交中...' : '提交寄回' }}
	          </button>
	        </view>
	      </view>
	    </uni-popup>

	    <common-modal v-model:visible="auditModalVisible" width="600rpx">
	      <view class="custom-modal-content" style="padding-bottom: 40rpx;">
        <text class="custom-modal-title">{{ auditModalTitle }}</text>
        <text class="custom-modal-desc">{{ auditModalDesc }}</text>
        <view class="custom-modal-actions">
          <button class="custom-modal-btn cancel" @tap="auditModalVisible = false">取消</button>
          <button class="custom-modal-btn confirm" @tap="onModalConfirm">确定</button>
        </view>
      </view>
    </common-modal>

	    <common-modal v-model:visible="markFinishModalVisible" width="620rpx" :closeable="!markFinishSubmitting">
	      <view class="custom-modal-content" style="padding-bottom: 40rpx;">
	        <text class="custom-modal-title">我已画完</text>
	        <text class="custom-modal-desc">提交后将向买家发起最终状态确认，是否继续？</text>
	        <view class="custom-modal-actions">
	          <button
	            class="custom-modal-btn cancel"
	            :disabled="markFinishSubmitting"
	            @tap="markFinishModalVisible = false"
	          >
	            取消
	          </button>
	          <button
	            class="custom-modal-btn confirm"
	            :class="{ disabled: markFinishSubmitting }"
	            :disabled="markFinishSubmitting"
	            @tap="confirmMarkItemFinished"
	          >
	            {{ markFinishSubmitting ? '提交中...' : '确认提交' }}
	          </button>
	        </view>
	      </view>
	    </common-modal>

	    <common-modal v-model:visible="paymentStatusModalVisible" width="660rpx">
	      <view class="payment-modal-content" style="padding-bottom: 40rpx;">
	        <text class="payment-modal-title">扫码付款状态</text>

        <view v-if="paymentStatusLoading" class="payment-modal-state">
          <text class="state-desc">正在加载付款凭证...</text>
        </view>
        <view v-else-if="paymentStatusError" class="payment-modal-state">
          <text class="state-desc">{{ paymentStatusError }}</text>
          <view class="payment-modal-refresh" @tap="fetchPaymentStatusInfo">重试</view>
        </view>
        <scroll-view v-else class="payment-modal-scroll" scroll-y>
          <view class="payment-section">
            <view class="payment-info-row">
              <text class="payment-info-label">状态</text>
              <text class="payment-info-val">{{ paymentStatusInfo && paymentStatusInfo.payment_status_text ? paymentStatusInfo.payment_status_text : paymentStatusText }}</text>
            </view>
            <view class="payment-info-row" v-if="latestPaymentTransferNo">
              <text class="payment-info-label">转账单号</text>
              <text class="payment-info-val">{{ latestPaymentTransferNo }}</text>
            </view>
            <view class="payment-info-row" v-if="latestPaymentMessage">
              <text class="payment-info-label">买家留言</text>
              <text class="payment-info-val">{{ latestPaymentMessage }}</text>
            </view>
            <view class="payment-info-row" v-if="latestPaymentCreatedAt > 0">
              <text class="payment-info-label">提交时间</text>
              <text class="payment-info-val">{{ formatHistoryTime(latestPaymentCreatedAt) }}</text>
            </view>
          </view>

          <view class="payment-section" v-if="latestProofImages.length">
            <text class="payment-section-title">转账截图</text>
            <view class="proof-list">
              <image
                v-for="(img, idx) in latestProofImages"
                :key="`${img}-${idx}`"
                class="proof-image"
                :src="img"
                mode="aspectFill"
                @tap="previewPaymentProof(idx)"
              />
            </view>
          </view>

          <view class="payment-section" v-if="latestDispute">
            <text class="payment-section-title">异议处理状态</text>
            <text class="payment-dispute-state">{{ latestDisputeStatusText }}</text>
            <text v-if="latestDispute.reason" class="payment-dispute-desc">异议原因：{{ latestDispute.reason }}</text>
            <text v-if="latestDispute.result_note" class="payment-dispute-desc">处理说明：{{ latestDispute.result_note }}</text>
          </view>

          <view class="payment-section" v-if="canApplyDispute">
            <button class="payment-unreceived-btn" @tap="toggleUnreceivedActions">
              我未收到款
            </button>

            <view v-if="showUnreceivedActions" class="payment-unreceived-actions">
              <view class="payment-unreceived-action" @tap="contactOrderOwner">
                与单主沟通
              </view>
              <view class="payment-unreceived-action danger" @tap="openPlatformDisputeForm">
                提交异议申请到平台
              </view>
            </view>

            <view v-if="showDisputeForm" class="payment-dispute-form">
              <text class="payment-section-title">提交异议申请</text>
              <textarea
                class="payment-dispute-textarea"
                v-model="disputeReason"
                maxlength="200"
                auto-height
                placeholder="请描述争议原因（至少2个字）"
              />

              <view class="payment-evidence-list">
                <view
                  v-for="(img, idx) in disputeEvidenceImages"
                  :key="`${img}-${idx}`"
                  class="payment-evidence-item"
                >
                  <image class="payment-evidence-image" :src="img" mode="aspectFill" />
                  <view class="payment-evidence-remove" @tap.stop="removeDisputeImage(idx)">×</view>
                </view>
                <view
                  v-if="disputeEvidenceImages.length < 3 && !disputeUploading"
                  class="payment-evidence-add"
                  @tap="pickDisputeImages"
                >
                  <text class="payment-evidence-add-icon">+</text>
                  <text class="payment-evidence-add-text">上传举证</text>
                </view>
              </view>
              <text v-if="disputeUploading" class="payment-uploading-text">{{ disputeUploadText || '上传中...' }}</text>
              <text class="payment-evidence-help">最多3张，选填</text>

              <button
                class="payment-dispute-btn"
                :class="{ disabled: disputeSubmitting }"
                :disabled="disputeSubmitting"
                @tap="submitPaymentDispute"
              >
                {{ disputeSubmitting ? '提交中...' : '提交异议申请' }}
              </button>
            </view>
          </view>
        </scroll-view>
      </view>
    </common-modal>

  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import CommonModal from '@/components/common-modal/common-modal.vue' 
import OrderStatus from '@/components/order_status/order_status.vue'
import {
  websiteUrl,
  global,
  initLoginState,
  getFooterPlaceholderHeight,
  getSafeBottom,
  toPx,
} from '@/common/config.js'
import { chooseImageList, getQiniuToken, uploadImageToQiniu } from '@/common/image.js'

// ================== 响应式状态 ==================

const loading = ref(true)
const errorMsg = ref('')

const submissionId = ref(0)
const queueInfo = ref(null) 
const targetUserInfo = ref(null) // 新增：投递者用户信息

const items = computed(() => (queueInfo.value?.items || []))
const draftItems = computed(() => (queueInfo.value?.draft_items || []))
const activeItemId = ref(0)

function getItemID(item) {
  return Number(item?.id || item?.ID || 0)
}

function getItemTitle(item) {
  return String(item?.work_subject || '').trim() || '未命名作品'
}

function getItemTabTitle(item, idx) {
  const title = getItemTitle(item)
  if (title === '未命名作品') return `投递内容 ${idx + 1}`
  return title
}

function setActiveItem(item) {
  const id = getItemID(item)
  if (id > 0) {
    activeItemId.value = id
  }
}

function isActiveItem(item) {
  return getItemID(item) > 0 && getItemID(item) === Number(activeItemId.value)
}

const activeItem = computed(() => {
  const list = items.value
  if (!list.length) return null
  const id = Number(activeItemId.value || 0)
  if (id > 0) {
    const found = list.find((item) => getItemID(item) === id)
    if (found) return found
  }
  return list[0] || null
})

const activeItemName = computed(() => {
  if (!activeItem.value) return ''
  return getItemTitle(activeItem.value)
})

watch(
  () => items.value.map((item) => getItemID(item)).join(','),
  () => {
    const list = items.value
    if (!list.length) {
      activeItemId.value = 0
      return
    }
    const id = Number(activeItemId.value || 0)
    const exists = list.some((item) => getItemID(item) === id)
    if (!exists) {
      activeItemId.value = getItemID(list[0]) || 0
    }
  },
  { immediate: true }
)

const currentUid = computed(() => {
  const u = global.userInfo || {}
  return u.id || u.Id || 0
})

const isBuyer = computed(() => {
  const q = queueInfo.value || {}
  if (typeof q.viewer_is_buyer === 'boolean') {
    return q.viewer_is_buyer
  }

  const submissionUserID = Number(q.submission_user_id || q.user_id || q.userId || 0)
  if (submissionUserID > 0 && Number(currentUid.value) > 0) {
    return Number(submissionUserID) === Number(currentUid.value)
  }

  const list = items.value
  if (!list.length || !currentUid.value) {
    const brandId = Number(global.userInfo?.brand_id || global.userInfo?.brandId || 0)
    return brandId <= 0
  }
  const first = list[0]
  const uid = first.user_id || first.userId
  return Number(uid) === Number(currentUid.value)
})

const SUBMISSION_STATUS_SELECTED_CONFIRM = 1
const SUBMISSION_STATUS_BUYER_CONFIRMED = 2
const SUBMISSION_STATUS_SELECTED_PAY = 3
const SUBMISSION_STATUS_PAID = 4
const PAYMENT_METHOD_PLATFORM = 1
const PAYMENT_METHOD_QRCODE = 2
const PAY_STATUS_PENDING = 0
const PAY_STATUS_DEPOSIT_CONFIRMING = 1
const PAY_STATUS_DEPOSIT_PAID = 2
const PAY_STATUS_BALANCE_CONFIRMING = 3
const PAY_STATUS_PAID = 4

const submissionStatus = computed(() => Number(queueInfo.value?.status || 0))

const canArtistCancel = computed(() => {
  if (isBuyer.value) return false
  return (
    submissionStatus.value === SUBMISSION_STATUS_SELECTED_CONFIRM ||
    submissionStatus.value === SUBMISSION_STATUS_BUYER_CONFIRMED
  )
})

const canArtistReturn = computed(() => {
  if (isBuyer.value) return false
  return submissionStatus.value === SUBMISSION_STATUS_BUYER_CONFIRMED
})

const canArtistConfirm = computed(() => {
  if (isBuyer.value) return false
  return submissionStatus.value === SUBMISSION_STATUS_BUYER_CONFIRMED
})

const canOnlyCancel = computed(() => canArtistCancel.value && !canArtistConfirm.value && !canArtistReturn.value)

const showBottomBar = computed(() => {
  return !!queueInfo.value && (canArtistCancel.value || canArtistReturn.value || canArtistConfirm.value)
})

const paymentMethod = computed(() => Number(queueInfo.value?.payment_method || queueInfo.value?.paymentMethod || 0))
const payStatus = computed(() => Number(queueInfo.value?.pay_status || queueInfo.value?.payStatus || 0))
const isQrPayment = computed(() => paymentMethod.value === PAYMENT_METHOD_QRCODE)
const paymentStatusText = computed(() => {
  if (submissionStatus.value === SUBMISSION_STATUS_PAID) {
    return '已付款'
  }
  if (submissionStatus.value === SUBMISSION_STATUS_SELECTED_PAY) return '待付款'
  switch (payStatus.value) {
    case PAY_STATUS_PENDING: return '待支付'
    case PAY_STATUS_DEPOSIT_CONFIRMING: return '定金待确认'
    case PAY_STATUS_DEPOSIT_PAID: return '定金已付'
    case PAY_STATUS_BALANCE_CONFIRMING: return '尾款待确认'
    case PAY_STATUS_PAID: return '已结清'
    default: return '未支付'
  }
})
const paymentMethodTagText = computed(() => {
  if (paymentMethod.value === PAYMENT_METHOD_QRCODE) return '扫码转账'
  if (paymentMethod.value === PAYMENT_METHOD_PLATFORM) return '在线支付'
  return ''
})

const itemFinalStateMap = computed(() => {
  const list = Array.isArray(queueInfo.value?.item_final_states) ? queueInfo.value.item_final_states : []
  const out = {}
  list.forEach((row) => {
    const itemID = Number(row?.item_id || 0)
    if (itemID > 0) out[itemID] = row
  })
  return out
})

function getItemFinalState(item) {
  const itemID = Number(item?.id || item?.ID || 0)
  if (!itemID) return {}
  return itemFinalStateMap.value[itemID] || {}
}

function canMarkFinished(item) {
  return !!getItemFinalState(item).can_mark_finished
}

const allItemsFinalConfirmed = computed(() => !!queueInfo.value?.all_items_final_confirmed)
const canCloseSubmissionAction = computed(() => !!queueInfo.value?.can_close_submission && !isBuyer.value)
const returnAddressRequested = computed(() => !!queueInfo.value?.return_address_requested)
const returnAddressReady = computed(() => !!queueInfo.value?.return_address_ready)
const canShipBackAction = computed(() => !!queueInfo.value?.can_ship_back && !isBuyer.value)
const returnShipped = computed(() => !!queueInfo.value?.return_shipped)
const returnExpressNoText = computed(() => String(queueInfo.value?.return_express_no || '').trim())
const returnAddressInfo = computed(() => queueInfo.value?.return_address_info || null)
const showDeliveryFlowCard = computed(() => {
  if (isBuyer.value) return false
  if (submissionStatus.value !== SUBMISSION_STATUS_PAID) return false
  return (
    canCloseSubmissionAction.value ||
    canShipBackAction.value ||
    returnAddressRequested.value ||
    returnAddressReady.value ||
    returnShipped.value ||
    allItemsFinalConfirmed.value
  )
})

const progressLogs = computed(() => {
  const q = queueInfo.value || {}
  if (Array.isArray(q.progress_logs)) return q.progress_logs
  if (Array.isArray(q.progressLogs)) return q.progressLogs
  return []
})

function getStepLogItemID(row) {
  return Number(row?.submission_item_id || row?.submissionItemID || row?.submissionItemId || 0)
}

function isSubmissionScopeLog(row, submissionItemId) {
  // 明确有子单ID的，永远视为子单事件
  if (submissionItemId > 0) return false

  const logType = Number(row?.log_type || 0)
  const eventCode = String(row?.event_code || '').trim()

  // 明确属于父订单维度的事件
  if (
    logType === 6 || // 买家拍下订单
    logType === 2 || // 买家确认投递内容
    logType === 3 || // 付款完成
    logType === 4 || // 卖家确认订单
    eventCode === 'submission_created' ||
    eventCode === 'buyer_confirm_content' ||
    eventCode === 'payment_completed' ||
    eventCode === 'seller_confirm_submission'
  ) {
    return true
  }

  // 其余 item_id=0 的事件默认不展示，防止把其他子单动态误判为父订单事件
  return false
}

const creativeHistoryEvents = computed(() => {
  return progressLogs.value
    .slice()
    .sort((a, b) => {
      const ta = Number(a?.created_at || 0)
      const tb = Number(b?.created_at || 0)
      if (tb !== ta) return tb - ta
      return Number(b?.id || 0) - Number(a?.id || 0)
    })
    .map((row, idx) => {
      const logType = Number(row?.log_type || 0)
      const status = Number(row?.status || 0)
      const dotClass = status === 2 ? 'reject' : (status === 0 ? (idx === 0 ? 'latest' : 'pending') : (idx === 0 ? 'latest' : 'done'))
      const submissionItemId = getStepLogItemID(row)
      const isSubmissionScope = isSubmissionScopeLog(row, submissionItemId)
      return {
        key: `${row?.id || idx}-${row?.event_code || ''}`,
        title: historyTitle(row),
        desc: historyDesc(row),
        images: parseHistoryImages(row),
        timeText: formatHistoryTime(row?.created_at),
        dotClass,
        logType,
        submissionItemId,
        isSubmissionScope,
      }
    })
})

const visibleCreativeHistoryEvents = computed(() => {
  const list = creativeHistoryEvents.value
  const itemId = Number(activeItem.value?.id || activeItem.value?.ID || 0)
  if (itemId <= 0) return list
  return list.filter((event) => event.isSubmissionScope || Number(event.submissionItemId) === itemId)
})

const footerPlaceholderHeight = computed(() => {
  return toPx(getFooterPlaceholderHeight())
})
const footerPadding = computed(() => {
  return toPx(getSafeBottom())
})
const bottomBarPadding = computed(() => {
  return toPx(getSafeBottom() + 14)
})

const pricePopupRef = ref(null)
const editingItem = ref(null)
const priceInput = ref('')
const reasonInput = ref('')
const shipPopupRef = ref(null)
const shipExpressNo = ref('')
const shipSubmitting = ref(false)
const skipFirstOnShowRefresh = ref(true)
const paymentStatusModalVisible = ref(false)
const paymentStatusLoading = ref(false)
const paymentStatusError = ref('')
const paymentStatusInfo = ref(null)
const disputeReason = ref('')
const disputeEvidenceImages = ref([])
const disputeUploading = ref(false)
const disputeUploadText = ref('')
const disputeSubmitting = ref(false)
const showUnreceivedActions = ref(false)
const showDisputeForm = ref(false)

// ================== 确认/审核弹窗状态 ==================
const auditModalVisible = ref(false)
const auditModalTitle = ref('')
const auditModalDesc = ref('')
const currentActionType = ref('')
const markFinishModalVisible = ref(false)
const markFinishTargetItemID = ref(0)
const markFinishSubmitting = ref(false)

watch(markFinishModalVisible, (show) => {
  if (!show && !markFinishSubmitting.value) {
    markFinishTargetItemID.value = 0
  }
})

const latestPayment = computed(() => paymentStatusInfo.value?.latest_payment || null)
const latestDispute = computed(() => paymentStatusInfo.value?.latest_dispute || null)
const latestProofImages = computed(() => {
  const list = latestPayment.value?.proof_images
  return Array.isArray(list) ? list : []
})
const latestPaymentTransferNo = computed(() => String(latestPayment.value?.transfer_no || '').trim())
const latestPaymentMessage = computed(() => String(latestPayment.value?.message || '').trim())
const latestPaymentCreatedAt = computed(() => Number(latestPayment.value?.created_at || 0))
const canApplyDispute = computed(() => {
  if (!isQrPayment.value) return false
  return !!paymentStatusInfo.value?.can_apply_dispute
})
const latestDisputeStatusText = computed(() => {
  const d = latestDispute.value
  if (!d) return ''
  const status = Number(d.status || 0)
  const resultCode = Number(d.result_code || 0)
  if (status === 0) return '待审核'
  if (status === 1) return '处理中'
  if (status === 2) {
    if (resultCode === 1) return '已结案：争议成立'
    if (resultCode === 2) return '已结案：争议驳回'
    if (resultCode === 3) return '已结案：协商解决'
    return '已结案'
  }
  return '处理中'
})

// ================== 工具函数 ==================

function getFirstImage(item) {
  const src = item.ref_images || item.refImages
  if (!src) return ''
  const arr = String(src)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return arr[0] || ''
}

function parseAddons(addonsJson) {
  if (!addonsJson) return []
  try {
    const v = JSON.parse(addonsJson)
    if (Array.isArray(v)) return v
    return []
  } catch (e) {
    console.warn('[submission-queue] parseAddons failed', e)
    return []
  }
}

function getAddonsTitles(item) {
  const addonsJson = item.addons_json || item.addonsJson || ''
  const addons = parseAddons(addonsJson)
  if (!addons.length) return ''
  return addons
    .map((a) => (a.title || a.Title || '').trim())
    .filter(Boolean)
    .join(' / ')
}

function calcItemTotal(item) {
  const base = Number(item.price_total || 0)
  const adjust = Number(item.adjust_price || 0)
  return base + adjust
}

function formatPrice(v) {
  const n = Number(v || 0)
  if (!Number.isFinite(n)) return '0.00'
  return n.toFixed(2)
}

function formatItemStatus(st) {
  const s = Number(st)
  switch (s) {
    case 0: return '待处理/排队中'
    case 1: return '已抢到，待确认'
    case 2: return '等待妆师/毛娘确认'
    case 3: return '待付款'
    case 4: return '已下单/进行中'
    case 5: return '未中选'
    case 6: return '已放弃/取消'
    case 7: return '保留过期'
    default: return '未知'
  }
}

function historyTitle(row) {
  const logType = Number(row?.log_type || 0)
  const status = Number(row?.status || 0)
  const stepName = String(row?.step_name || '').trim()
  const stepID = Number(row?.step_id || 0)
  const eventCode = String(row?.event_code || '').trim()

  if (logType === 1) {
    const nodeName = stepName || (stepID > 0 ? `节点#${stepID}` : '创作节点')
    if (status === 0) return `节点：${nodeName}（待确认）`
    if (status === 2) return `节点：${nodeName}（未通过）`
    return `节点：${nodeName}（已通过）`
  }

  if (logType === 7) return '进度图片更新'
  if (stepName) return stepName
  if (eventCode === 'submission_created') return '买家拍下订单'
  if (eventCode === 'buyer_confirm_content') return '买家确认投递内容'
  if (eventCode === 'seller_confirm_submission') return '创作者确认订单'
  if (eventCode === 'payment_completed') return '付款完成'
  if (eventCode === 'final_product_confirmed') return '成品确认'
  return '进度更新'
}

function historyDesc(row) {
  const content = String(row?.content || '').trim()
  if (content) return content
  const eventCode = String(row?.event_code || '').trim()
  if (eventCode === 'step_request') return '创作者上传了进度图片。'
  return ''
}

function formatHistoryTime(ts) {
  const sec = Number(ts || 0)
  if (!sec) return '--'
  const d = new Date(sec * 1000)
  if (Number.isNaN(d.getTime())) return '--'
  const M = `${d.getMonth() + 1}`.padStart(2, '0')
  const D = `${d.getDate()}`.padStart(2, '0')
  const h = `${d.getHours()}`.padStart(2, '0')
  const m = `${d.getMinutes()}`.padStart(2, '0')
  return `${M}-${D} ${h}:${m}`
}

function normalizeImageArray(input) {
  if (Array.isArray(input)) {
    return input
      .map((v) => String(v || '').trim())
      .filter(Boolean)
  }
  const raw = String(input || '').trim()
  if (!raw) return []
  if (raw.startsWith('[')) {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed
          .map((v) => String(v || '').trim())
          .filter(Boolean)
      }
    } catch (_) {}
  }
  return raw
    .split(',')
    .map((v) => String(v || '').trim())
    .filter(Boolean)
}

function parseHistoryImages(row) {
  const direct = normalizeImageArray(row?.images)
  if (direct.length) return Array.from(new Set(direct))
  const fromRaw = normalizeImageArray(row?.images_urls || row?.images_json)
  return Array.from(new Set(fromRaw))
}

function previewHistoryImages(images, index = 0) {
  const list = Array.isArray(images) ? images.filter(Boolean) : []
  if (!list.length) return
  uni.previewImage({
    current: list[index] || list[0],
    urls: list
  })
}

// ================== 登录 & 请求 ==================

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
    errorMsg.value = '未登录'
    return
  }

  const token = uni.getStorageSync('token') || ''
  if (!submissionId.value) {
    loading.value = false
    errorMsg.value = '缺少 submission_id'
    return
  }

  loading.value = true
  errorMsg.value = ''

  uni.request({
    url: `${websiteUrl.value}/with-state/artist-order/submission/queue-info`,
    method: 'GET',
    header: { Authorization: token },
    data: { submission_id: submissionId.value },
    success: (res) => {
      const body = res.data || {}
      if (body.status !== 'success') {
        errorMsg.value = body.msg || '获取排队信息失败'
        queueInfo.value = null
        return
      }
      queueInfo.value = body.data || null
      // 获取成功后，优先用 submission_user_id 定位买家
      if (queueInfo.value) {
          const first = queueInfo.value.items && queueInfo.value.items.length > 0
            ? queueInfo.value.items[0]
            : null
          const uid = Number(
            queueInfo.value.submission_user_id ||
            first?.user_id ||
            first?.userId ||
            0
          )
          if (uid > 0) {
            fetchTargetUserInfo(uid)
          } else {
            targetUserInfo.value = null
          }
      }
    },
    fail: (err) => {
      errorMsg.value = '网络错误，请稍后重试'
      queueInfo.value = null
    },
    complete: () => {
      loading.value = false
    },
  })
}

// 新增：获取用户信息接口
function fetchTargetUserInfo(uid) {
    // 接口文档给的是完整地址，这里为了保险起见，如果 websiteUrl 已经是域名则拼接，或者直接使用全路径
    // 假设 websiteUrl 是 https://api.fantuanpu.com
    uni.request({
        url: `${websiteUrl.value}/user-info`, 
        method: 'GET',
        data: { uid: uid },
        success: (res) => {
            const body = res.data || {}
            if (body.status === 'success') {
                targetUserInfo.value = body.data
            }
        }
    })
}

// 新增：跳转用户主页
function goUserPage() {
    if (!queueInfo.value) return
    const first = queueInfo.value.items && queueInfo.value.items.length ? queueInfo.value.items[0] : null
    const uid = Number(
      queueInfo.value.submission_user_id ||
      first?.user_id ||
      first?.userId ||
      0
    )
    if (uid > 0) {
        // H5 或 uni-app 页面跳转
        uni.navigateTo({
            url: `/pages/user_page/user_page?uid=${uid}`
        })
    }
}

function reload() {
  fetchQueueInfo()
}

function openPaymentStatusModal() {
  if (!isQrPayment.value) return
  paymentStatusModalVisible.value = true
  showUnreceivedActions.value = false
  showDisputeForm.value = false
  fetchPaymentStatusInfo()
}

async function fetchPaymentStatusInfo() {
  if (paymentStatusLoading.value) return
  const ok = await ensureLogin()
  if (!ok) return
  if (!submissionId.value) return
  paymentStatusLoading.value = true
  paymentStatusError.value = ''
  const token = uni.getStorageSync('token') || ''
  uni.request({
    url: `${websiteUrl.value}/with-state/artist-order/submission/payment-status`,
    method: 'GET',
    header: { Authorization: token },
    data: { submission_id: submissionId.value },
    success: (res) => {
      const body = res.data || {}
      if (body.status !== 'success') {
        paymentStatusError.value = body.msg || '获取付款信息失败'
        return
      }
      paymentStatusInfo.value = body.data || null
    },
    fail: () => {
      paymentStatusError.value = '网络异常，请稍后重试'
    },
    complete: () => {
      paymentStatusLoading.value = false
    }
  })
}

function previewPaymentProof(index) {
  const list = latestProofImages.value
  if (!list.length) return
  uni.previewImage({
    current: list[index] || list[0],
    urls: list,
  })
}

async function pickDisputeImages() {
  if (disputeUploading.value) return
  const remain = 3 - disputeEvidenceImages.value.length
  if (remain <= 0) {
    uni.showToast({ title: '最多上传3张', icon: 'none' })
    return
  }
  try {
    const files = await chooseImageList(remain)
    if (!files || !files.length) return
    disputeUploading.value = true
    disputeUploadText.value = '准备上传...'
    const tk = await getQiniuToken()
    if (!tk?.token || !tk?.path) {
      throw new Error('获取上传凭证失败')
    }
    for (let i = 0; i < files.length; i++) {
      disputeUploadText.value = `上传中 (${i + 1}/${files.length})`
      const ret = await uploadImageToQiniu(files[i], tk.token, tk.path)
      const url = String(ret?.imageUrl || '').trim()
      if (url) {
        disputeEvidenceImages.value.push(url)
      }
      if (disputeEvidenceImages.value.length >= 3) break
    }
  } catch (e) {
    uni.showToast({ title: e?.message || '上传失败', icon: 'none' })
  } finally {
    disputeUploading.value = false
    disputeUploadText.value = ''
  }
}

function removeDisputeImage(index) {
  if (index < 0 || index >= disputeEvidenceImages.value.length) return
  disputeEvidenceImages.value.splice(index, 1)
}

function toggleUnreceivedActions() {
  const next = !showUnreceivedActions.value
  showUnreceivedActions.value = next
  if (!next) {
    showDisputeForm.value = false
  }
}

function openPlatformDisputeForm() {
  showUnreceivedActions.value = true
  showDisputeForm.value = true
}

async function contactOrderOwner() {
  paymentStatusModalVisible.value = false
  showUnreceivedActions.value = false
  showDisputeForm.value = false
  await handleChatWithSeller()
}

function submitPaymentDispute() {
  if (disputeSubmitting.value) return
  if (!canApplyDispute.value) {
    uni.showToast({ title: '当前不可重复提交异议', icon: 'none' })
    return
  }
  const reason = String(disputeReason.value || '').trim()
  if (reason.length < 2) {
    uni.showToast({ title: '请至少填写2个字的异议说明', icon: 'none' })
    return
  }
  const paymentID = Number(latestPayment.value?.id || 0)
  if (!paymentID) {
    uni.showToast({ title: '未找到付款凭证', icon: 'none' })
    return
  }
  ensureLogin().then((ok) => {
    if (!ok) return
    disputeSubmitting.value = true
    const token = uni.getStorageSync('token') || ''
    uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/payment-dispute/create`,
      method: 'POST',
      header: { Authorization: token, 'Content-Type': 'application/json' },
      data: {
        submission_id: submissionId.value,
        payment_id: paymentID,
        reason,
        evidence_images: disputeEvidenceImages.value.slice(),
      },
      success: (res) => {
        const body = res.data || {}
        if (body.status !== 'success') {
          uni.showToast({ title: body.msg || '提交异议失败', icon: 'none' })
          return
        }
        uni.showToast({ title: '异议已提交', icon: 'success' })
        disputeReason.value = ''
        disputeEvidenceImages.value = []
        showDisputeForm.value = false
        showUnreceivedActions.value = false
        fetchPaymentStatusInfo()
      },
      fail: () => {
        uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
      },
      complete: () => {
        disputeSubmitting.value = false
      }
    })
  })
}

// ================== 业务逻辑 ==================

async function resolvePeerId() {
  const list = items.value
  const first = list.length ? list[0] : null
  const buyerUid = Number(
    queueInfo.value?.submission_user_id ||
    first?.user_id ||
    first?.userId ||
    0
  )
  const brandId = Number(first?.brand_id || first?.brandId || 0)
  const brandOwnerUid = Number(queueInfo.value?.brand_owner_uid || 0)

  if (!isBuyer.value) {
    // 如果我是卖家/妆师，我要找买家
    if (!buyerUid) {
      uni.showToast({ title: '找不到买家ID', icon: 'none' })
      return null
    }
    return buyerUid
  }

  // 如果我是买家，我要找品牌/妆师
  if (brandOwnerUid > 0) {
    return brandOwnerUid
  }

  if (!brandId) {
    uni.showToast({ title: '缺少品牌信息', icon: 'none' })
    return null
  }

  return new Promise((resolve) => {
    uni.request({
      url: `${websiteUrl.value}/brand-info`,
      method: 'GET',
      data: { id: brandId },
      success: (res) => {
        const body = res.data || {}
        const ownerUid = body.data?.user_id || body.data?.userId || 0
        if (!ownerUid) {
          uni.showToast({ title: '品牌未绑定账号', icon: 'none' })
          resolve(null)
        } else {
          resolve(ownerUid)
        }
      },
      fail: () => {
        uni.showToast({ title: '获取品牌信息失败', icon: 'none' })
        resolve(null)
      },
    })
  })
}

async function handleChatWithSeller() {
  if (!queueInfo.value) return
  const ok = await ensureLogin()
  if (!ok) return
  const peer = await resolvePeerId()
  if (!peer) return
  uni.navigateTo({
    url: `/pkg-im/chat/chat?peer_id=${peer}`,
  })
}

function openChangePricePanel(item) {
  editingItem.value = item
  priceInput.value = String(calcItemTotal(item))
  reasonInput.value = ''
  nextTickOpenPricePopup()
}

function nextTickOpenPricePopup() {
  setTimeout(() => {
    try {
      pricePopupRef.value?.open?.()
    } catch (e) {}
  }, 0)
}

function closePricePanel() {
  try {
    pricePopupRef.value?.close?.()
  } catch (e) {}
}

function onPricePopupChange(e) {
  if (!e.show) {
    editingItem.value = null
    priceInput.value = ''
    reasonInput.value = ''
  }
}

function submitChangePrice() {
  if (!editingItem.value) return
  const raw = priceInput.value.trim()
  const n = Number(raw)
  if (!raw || Number.isNaN(n) || n <= 0) {
    uni.showToast({ title: '请填写正确的金额', icon: 'none' })
    return
  }

  ensureLogin().then((ok) => {
    if (!ok) return
    const token = uni.getStorageSync('token') || ''
    const payload = {
      item_id: editingItem.value.id || editingItem.value.ID,
      new_price: n,
      reason: reasonInput.value.trim(),
    }

    uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/item/change-price`,
      method: 'POST',
      header: { Authorization: token, 'Content-Type': 'application/json' },
      data: payload,
      success: (res) => {
        const body = res.data || {}
        if (body.status !== 'success') {
          uni.showToast({ title: body.msg || '失败', icon: 'none' })
          return
        }
        uni.showToast({ title: '成功', icon: 'success' })
        closePricePanel()
        fetchQueueInfo()
      },
    })
  })
}

function handleConfirmSubmission() {
  if (!canArtistConfirm.value) {
    uni.showToast({ title: '当前状态不可确认订单', icon: 'none' })
    return
  }
  currentActionType.value = 'confirm'
  auditModalTitle.value = '确认订单'
  auditModalDesc.value = '确认后将进入待付款状态，是否继续？'
  auditModalVisible.value = true
}

function doConfirmSubmission() {
  ensureLogin().then((ok) => {
    if (!ok) return
    const token = uni.getStorageSync('token') || ''
    uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/submission/confirm`,
      method: 'POST',
      header: { Authorization: token, 'Content-Type': 'application/json' },
      data: { submission_id: submissionId.value },
      success: (res) => {
        if (res.data?.status === 'success') {
          uni.showToast({ title: '已确认', icon: 'success' })
          fetchQueueInfo()
        } else {
          uni.showToast({ title: res.data?.msg || '失败', icon: 'none' })
        }
      },
    })
  })
}

function handleAuditSubmission(action) {
  if (!queueInfo.value) return
  if (action === 'cancel_order' && !canArtistCancel.value) {
    uni.showToast({ title: '当前状态不可取消订单', icon: 'none' })
    return
  }
  if (action === 'return_pending' && !canArtistReturn.value) {
    uni.showToast({ title: '当前状态不可退回修改', icon: 'none' })
    return
  }
  currentActionType.value = action
  if (action === 'return_pending') {
      auditModalTitle.value = '退回待确认'
      auditModalDesc.value = '确定要将此订单退回至“待确认”状态吗？买家需要重新确认。'
  } else if (action === 'cancel_order') {
      auditModalTitle.value = '取消订单'
      auditModalDesc.value = '确定要取消此订单吗？操作不可撤销。'
  } else {
      return
  }
  auditModalVisible.value = true
}

function doAuditSubmission(action) {
    ensureLogin().then((ok) => {
      if (!ok) return
      const token = uni.getStorageSync('token') || ''
      const url = `${websiteUrl.value}/with-state/artist-order/submission/operate`
      const payload = {
          submission_id: submissionId.value,
          action: action 
      }
      uni.showLoading({ title: '处理中' })
      uni.request({
        url: url,
        method: 'POST',
        header: { Authorization: token, 'Content-Type': 'application/json' },
        data: payload,
        success: (res) => {
          if (res.data?.status === 'success') {
            uni.showToast({ title: '操作成功', icon: 'success' })
            fetchQueueInfo()
          } else {
            uni.showToast({ title: res.data?.msg || '操作失败', icon: 'none' })
          }
        },
        fail: () => {
              uni.showToast({ title: '网络请求失败', icon: 'none' })
        },
        complete: () => {
            uni.hideLoading()
        }
      })
    })
}

function onModalConfirm() {
  auditModalVisible.value = false
  if (currentActionType.value === 'confirm') {
    doConfirmSubmission()
  } else if (['return_pending', 'cancel_order'].includes(currentActionType.value)) {
    doAuditSubmission(currentActionType.value)
  }
}

function getStepDisabledReason(item) {
  if (!queueInfo.value) return '订单信息加载中'
  if (isBuyer.value) return '仅妆师/毛娘可提交节点状态'

  const status = Number(queueInfo.value.status || 0)
  if (status !== SUBMISSION_STATUS_PAID) {
    return '买家付款后才可提交节点状态'
  }

  const itemId = Number(item?.id || item?.ID || 0)
  if (!itemId) return '缺少子项ID'
  return ''
}

function canSubmitStep(item) {
  return !getStepDisabledReason(item)
}

function handleSubmitStep(item) {
  const reason = getStepDisabledReason(item)
  if (reason) {
    uni.showToast({ title: reason, icon: 'none' })
    return
  }

  const itemId = Number(item?.id || item?.ID || 0)
  if (!itemId) {
    uni.showToast({ title: '缺少子项ID', icon: 'none' })
    return
  }

  uni.navigateTo({
    url: `/pkg-creator/creator_order/step_submit/step_submit?submission_id=${submissionId.value}&item_id=${itemId}`
  })
}

function handleMarkItemFinished(item) {
  const state = getItemFinalState(item)
  if (!canMarkFinished(item)) {
    if (state?.final_confirmed) {
      uni.showToast({ title: '该子单已完成最终确认', icon: 'none' })
      return
    }
    if (state?.final_request_pending) {
      uni.showToast({ title: '已提交确认，等待买家处理', icon: 'none' })
      return
    }
    uni.showToast({ title: '请先提交一次节点状态', icon: 'none' })
    return
  }
  const itemID = Number(item?.id || item?.ID || 0)
  if (!itemID) {
    uni.showToast({ title: '缺少子项ID', icon: 'none' })
    return
  }
  markFinishTargetItemID.value = itemID
  markFinishModalVisible.value = true
}

function confirmMarkItemFinished() {
  if (markFinishSubmitting.value) return
  const itemID = Number(markFinishTargetItemID.value || 0)
  if (!itemID) {
    uni.showToast({ title: '缺少子项ID', icon: 'none' })
    return
  }
  markFinishSubmitting.value = true
  ensureLogin().then((ok) => {
    if (!ok) {
      markFinishSubmitting.value = false
      return
    }
    const token = uni.getStorageSync('token') || ''
    uni.showLoading({ title: '提交中' })
    uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/item/mark-finished`,
      method: 'POST',
      header: { Authorization: token, 'Content-Type': 'application/json' },
      data: { item_id: itemID },
      success: (res) => {
        const body = res.data || {}
        if (body.status !== 'success') {
          uni.showToast({ title: body.msg || '提交失败', icon: 'none' })
          return
        }
        markFinishModalVisible.value = false
        markFinishTargetItemID.value = 0
        uni.showToast({ title: '已发送确认请求', icon: 'success' })
        fetchQueueInfo()
      },
      fail: () => {
        uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
      },
      complete: () => {
        markFinishSubmitting.value = false
        uni.hideLoading()
      },
    })
  })
}

function handleCloseSubmission() {
  if (!canCloseSubmissionAction.value) {
    uni.showToast({ title: '当前不可结单', icon: 'none' })
    return
  }
  uni.showModal({
    title: '结单',
    content: '将提醒买家填写寄回地址，确认继续吗？',
    confirmText: '确认结单',
    success: ({ confirm }) => {
      if (!confirm) return
      ensureLogin().then((ok) => {
        if (!ok) return
        const token = uni.getStorageSync('token') || ''
        uni.showLoading({ title: '处理中' })
        uni.request({
          url: `${websiteUrl.value}/with-state/artist-order/submission/close`,
          method: 'POST',
          header: { Authorization: token, 'Content-Type': 'application/json' },
          data: { submission_id: submissionId.value },
          success: (res) => {
            const body = res.data || {}
            if (body.status !== 'success') {
              uni.showToast({ title: body.msg || '结单失败', icon: 'none' })
              return
            }
            uni.showToast({ title: '已提醒买家填写地址', icon: 'success' })
            fetchQueueInfo()
          },
          fail: () => {
            uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
          },
          complete: () => uni.hideLoading(),
        })
      })
    }
  })
}

function openShipBackPanel() {
  if (!canShipBackAction.value) {
    uni.showToast({ title: '买家尚未填写寄回地址', icon: 'none' })
    return
  }
  shipExpressNo.value = ''
  setTimeout(() => {
    try {
      shipPopupRef.value?.open?.()
    } catch (_) {}
  }, 0)
}

function closeShipBackPanel() {
  try {
    shipPopupRef.value?.close?.()
  } catch (_) {}
}

function onShipPopupChange(e) {
  if (!e?.show) {
    shipExpressNo.value = ''
    shipSubmitting.value = false
  }
}

function submitShipBack() {
  if (shipSubmitting.value) return
  const expressNo = String(shipExpressNo.value || '').trim()
  if (!expressNo) {
    uni.showToast({ title: '请填写快递单号', icon: 'none' })
    return
  }
  ensureLogin().then((ok) => {
    if (!ok) return
    shipSubmitting.value = true
    const token = uni.getStorageSync('token') || ''
    uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/submission/ship-back`,
      method: 'POST',
      header: { Authorization: token, 'Content-Type': 'application/json' },
      data: {
        submission_id: submissionId.value,
        express_no: expressNo,
      },
      success: (res) => {
        const body = res.data || {}
        if (body.status !== 'success') {
          uni.showToast({ title: body.msg || '提交失败', icon: 'none' })
          return
        }
        uni.showToast({ title: '已提交寄回单号', icon: 'success' })
        closeShipBackPanel()
        fetchQueueInfo()
      },
      fail: () => {
        uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
      },
      complete: () => {
        shipSubmitting.value = false
      }
    })
  })
}

onLoad((options) => {
  uni.setNavigationBarTitle({ title: '投递订单详情' })
  
  const sid = Number(options?.submission_id || options?.submissionId || 0)
  if (!Number.isNaN(sid) && sid > 0) {
    submissionId.value = sid
  }
  if (!submissionId.value) {
    loading.value = false
    errorMsg.value = '缺少 submission_id 参数'
    return
  }
  fetchQueueInfo()
})

onShow(() => {
  if (skipFirstOnShowRefresh.value) {
    skipFirstOnShowRefresh.value = false
    return
  }
  if (submissionId.value > 0) {
    fetchQueueInfo()
  }
})
</script>

<style lang="scss" scoped>
.submission-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f7f9fc 0%, #f3f5f9 48%, #f6f7fb 100%);
  display: flex;
  flex-direction: column;
}

/* 滚动主体 */
.scroll-body {
  flex: 1;
  min-height: 0;
}

.content {
  padding: 8rpx 0 24rpx;
}

/* 通用卡片 */
.card {
  margin: 18rpx 20rpx 0;
  padding: 24rpx;
  border-radius: 22rpx;
  background-color: #ffffff;
  border: 1rpx solid #edf1f6;
  box-shadow: 0 8rpx 24rpx rgba(16, 30, 54, 0.04);
}

.status-card {
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
}

/* 状态卡片 */
.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8rpx 0;
}
.status-row + .status-row {
  margin-top: 8rpx;
  padding-top: 18rpx;
  border-top: 1rpx dashed #edf1f6;
}
.status-left-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12rpx;
}
.status-label {
  width: 132rpx;
  flex-shrink: 0;
  font-size: 24rpx;
  color: #8692a6;
}

/* 通用大字体标题样式 */
.font-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #273043;
  line-height: 1.2;
  font-family: DIN, 'Helvetica Neue', Helvetica, sans-serif;
}

.status-value-group {
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  min-width: 0;
}
.status-unit {
  font-size: 24rpx;
  color: #98a1b2;
  margin-left: 4rpx;
}
.status-normal-text {
  font-size: 26rpx;
  color: #5f6775;
}
.payment-status-row.clickable:active {
  opacity: 0.68;
}
.payment-status-right {
  display: flex;
  align-items: center;
  gap: 6rpx;
}
.payment-method-tag {
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
  background: #eaf2ff;
}
.payment-method-tag-text {
  font-size: 20rpx;
  color: #4a6fa8;
  line-height: 1.2;
}


.status-chip {
  padding: 7rpx 18rpx;
  border-radius: 999rpx;
  background-color: #f2f4f8;
  border: 1rpx solid #e7ebf2;
}
.status-text {
  font-size: 24rpx;
  font-weight: 600;
  color: #4f5a6b;
}

/* 钞单标签样式 */
.tag-premium {
  background: linear-gradient(135deg, #ffd667, #f7ad2f);
  padding: 5rpx 12rpx;
  border-radius: 10rpx;
  box-shadow: 0 4rpx 10rpx rgba(231, 177, 58, 0.32);
}
.tag-text {
  font-size: 20rpx;
  color: #fff;
  font-weight: 700;
  text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1);
}

/* 状态 Chip 颜色 */
.status-chip.s-0 { background: rgba(145, 213, 255, 0.14); border: 1rpx solid rgba(63, 169, 245, 0.5); }
.status-chip.s-0 .status-text { color: #3fa9f5; }

/* s-2 状态特殊处理 */
.status-chip.s-2 { 
  background: transparent; 
  border: none; 
  padding: 0;
}
.status-chip.s-2 .status-text { color: #333; } 
.status-chip.font-title .status-text {
  font-size: 40rpx;
  font-weight: 700;
  color: #273043;
}

.status-chip.s-3 { background: rgba(140, 235, 195, 0.16); border: 1rpx solid rgba(64, 192, 135, 0.65); }
.status-chip.s-3 .status-text { color: #36b67a; }
.status-chip.s-4 { background: rgba(110, 218, 151, 0.16); border: 1rpx solid rgba(27, 176, 102, 0.65); }
.status-chip.s-4 .status-text { color: #1bb066; }
.status-chip.s-5 { background: rgba(230, 170, 170, 0.16); border: 1rpx solid rgba(210, 110, 110, 0.7); }
.status-chip.s-5 .status-text { color: #d46b6b; }
.status-chip.s-6 { background: rgba(210, 210, 210, 0.18); border: 1rpx solid rgba(170, 170, 170, 0.78); }
.status-chip.s-6 .status-text { color: #999; }
.status-chip.s-7 { background: rgba(220, 200, 200, 0.18); border: 1rpx solid rgba(190, 140, 140, 0.8); }
.status-chip.s-7 .status-text { color: #c25b5b; }

.status-actions {
  margin-top: 24rpx;
  padding-top: 20rpx;
  border-top: 1rpx dashed #edf1f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16rpx;
}

/* 用户信息组样式 */
.user-info-group {
  flex: 1;
  min-width: 0;
  max-width: 65%;
  display: flex;
  align-items: center;
  gap: 16rpx;
  background-color: #f7f9fd;
  padding: 8rpx 20rpx 8rpx 8rpx;
  border-radius: 999rpx;
  border: 1rpx solid #ebeff6;
}
.user-info-group:active {
  opacity: 0.72;
}
.user-avatar {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background-color: #eceff5;
}
.user-name {
  font-size: 26rpx;
  color: #2d3442;
  font-weight: 500;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.user-info-placeholder {
  flex: 1;
}


.btn-chat-inline {
  height: 64rpx;
  line-height: 64rpx;
  padding: 0 30rpx;
  border-radius: 999rpx;
  background-color: #ffffff;
  color: #455064;
  font-size: 26rpx;
  font-weight: 600;
  border: none;
  display: flex;
  align-items: center;
  margin: 0;
  white-space: nowrap;
}
.btn-chat-inline::after { border: none; }


/* items 卡片 */
.card-header {
  margin-bottom: 14rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card-title {
  font-size: 31rpx;
  font-weight: 600;
  color: #20293a;
}
.history-current-item {
  max-width: 56%;
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  font-size: 21rpx;
  color: #5f6f84;
  background: #eef3fb;
  border: 1rpx solid #e2eaf6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-tabs-scroll {
  width: 100%;
  margin-top: 2rpx;
}

.item-tabs-wrap {
  display: inline-flex;
  gap: 12rpx;
  padding-bottom: 4rpx;
}

.item-tab {
  min-width: 188rpx;
  max-width: 260rpx;
  padding: 12rpx 16rpx;
  border-radius: 14rpx;
  border: 1rpx solid #e8edf6;
  background: #f5f8fc;
  box-sizing: border-box;
}

.item-tab.active {
  border-color: #c7ddf6;
  background: linear-gradient(180deg, #edf6ff 0%, #f4f9ff 100%);
  box-shadow: 0 6rpx 14rpx rgba(118, 153, 196, 0.14);
}

.item-tab-title {
  display: block;
  font-size: 23rpx;
  color: #3a475d;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-tab-sub {
  display: block;
  margin-top: 5rpx;
  font-size: 18rpx;
  line-height: 1.2;
  color: #95a2b5;
}

/* item 行 */
.item-row {
  margin-top: 14rpx;
  padding: 20rpx;
  border-radius: 18rpx;
  border: 1rpx solid #eef2f8;
  background: #fafbff;
}
.item-row:first-of-type {
  margin-top: 10rpx;
}
.item-row-active {
  margin-top: 12rpx;
}

.item-main {
  display: flex;
  align-items: flex-start;
}

.item-cover-wrap {
  width: 132rpx;
  height: 132rpx;
  margin-right: 18rpx;
  border-radius: 16rpx;
  overflow: hidden;
  background-color: #eef2f8;
  flex-shrink: 0;
}
.item-cover {
  width: 100%;
  height: 100%;
}

.item-body {
  flex: 1;
  min-width: 0;
}
.item-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.item-title {
  flex: 1;
  margin-right: 12rpx;
  font-size: 29rpx;
  color: #1f2735;
  font-weight: 600;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.item-meta-row {
  margin-top: 10rpx;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
.item-meta {
  margin-right: 12rpx;
  margin-bottom: 8rpx;
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  background: #f0f3f9;
  font-size: 22rpx;
  color: #5e6a7d;
  line-height: 1.6;
}
.item-meta.adjust {
  color: #b66232;
  background: #fff2e9;
}

/* item 操作按钮 */
.item-actions {
  margin-top: 14rpx;
  display: flex;
  justify-content: flex-end;
}
.btn-mini {
  flex: 1;
  min-width: 0;
  height: 64rpx;
  line-height: 64rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  background-color: #ffe9cf;
  color: #6a4622;
  font-size: 23rpx;
  font-weight: 600;
  border: none;
  margin: 0;
}
.btn-mini + .btn-mini { margin-left: 12rpx; }
.btn-mini::after { border: none; }
.btn-mini.outline {
  background-color: #ffffff;
  border: none;
  color: #4f5c70;
}
.btn-mini.step-submit {
  background: linear-gradient(135deg, #8fdcf8 0%, #72c7ec 100%);
  color: #ffffff;
}
.btn-mini.mark-finished {
  background: linear-gradient(135deg, #b39ddb 0%, #8f7fd9 100%);
  color: #ffffff;
}
.btn-mini.disabled {
  background-color: #e9edf3 !important;
  color: #a2acbb !important;
  box-shadow: none;
}

.item-final-state {
  margin-top: 10rpx;
  font-size: 22rpx;
  line-height: 1.5;
}
.item-final-state.pending {
  color: #6b5a97;
}
.item-final-state.done {
  color: #3d8d6e;
}

.delivery-card {
  padding-top: 20rpx;
}
.delivery-state-line {
  padding: 8rpx 0;
}
.delivery-state-text {
  font-size: 24rpx;
  color: #5f6c81;
}
.delivery-address-block {
  margin-top: 10rpx;
  padding: 14rpx;
  border-radius: 14rpx;
  background: #f6f9ff;
}
.delivery-label {
  display: block;
  font-size: 22rpx;
  color: #8793a8;
}
.delivery-address-name {
  display: block;
  margin-top: 6rpx;
  font-size: 24rpx;
  color: #2f3a4d;
}
.delivery-address-line {
  display: block;
  margin-top: 4rpx;
  font-size: 23rpx;
  line-height: 1.5;
  color: #5f6c81;
}
.delivery-actions {
  margin-top: 14rpx;
  display: flex;
  gap: 12rpx;
}
.delivery-action-btn {
  height: 66rpx;
  line-height: 66rpx;
  border-radius: 999rpx;
  border: none;
  margin: 0;
  flex: 1;
  font-size: 24rpx;
  font-weight: 600;
}
.delivery-action-btn::after {
  border: none;
}
.delivery-action-btn.close {
  background: linear-gradient(135deg, #7ec8eb 0%, #6db5df 100%);
  color: #fff;
}
.delivery-action-btn.ship {
  background: linear-gradient(135deg, #9fd5b3 0%, #74bb95 100%);
  color: #fff;
}

.ship-sheet {
  width: 100%;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 24rpx;
  box-sizing: border-box;
}
.ship-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.ship-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #263247;
}
.ship-close {
  font-size: 24rpx;
  color: #8a95a8;
}
.ship-body {
  margin-top: 18rpx;
}
.ship-input {
  width: 100%;
  height: 78rpx;
  border-radius: 14rpx;
  background: #f4f7fb;
  padding: 0 20rpx;
  font-size: 26rpx;
  color: #2d3748;
  box-sizing: border-box;
}
.ship-footer {
  margin-top: 18rpx;
}
.ship-submit-btn {
  width: 100%;
  height: 72rpx;
  line-height: 72rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #9fd5b3 0%, #74bb95 100%);
  color: #fff;
  font-size: 25rpx;
  font-weight: 600;
  border: none;
}
.ship-submit-btn::after {
  border: none;
}

.history-card {
  padding-bottom: 18rpx;
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
  width: 106rpx;
  height: 106rpx;
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
  padding: 12rpx 0 6rpx;
}

.payment-modal-content {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.payment-modal-title {
  display: block;
  text-align: center;
  font-size: 34rpx;
  font-weight: 700;
  color: #1f2735;
  margin-bottom: 20rpx;
}

.payment-modal-state {
  padding: 20rpx 0;
  text-align: center;
}

.payment-modal-refresh {
  margin: 12rpx auto 0;
  width: 120rpx;
  height: 52rpx;
  line-height: 52rpx;
  border-radius: 999rpx;
  background: #eef3fb;
  color: #5e6b82;
  font-size: 23rpx;
}

.payment-modal-scroll {
  height: 68vh;
  max-height: 68vh;
}

.payment-section {
  margin-top: 16rpx;
  border-radius: 18rpx;
  border: 1rpx solid #ebeff6;
  background: #f9fbff;
  padding: 18rpx;
}

.payment-section-title {
  display: block;
  font-size: 27rpx;
  color: #273043;
  font-weight: 700;
}

.payment-unreceived-btn {
  height: 72rpx;
  line-height: 72rpx;
  border-radius: 999rpx;
  border: 1rpx solid #f3cfd4;
  background: #fff4f6;
  color: #b96572;
  font-size: 25rpx;
  font-weight: 700;
}

.payment-unreceived-btn::after {
  border: none;
}

.payment-unreceived-actions {
  margin-top: 14rpx;
  display: flex;
  gap: 12rpx;
}

.payment-unreceived-action {
  flex: 1;
  height: 66rpx;
  line-height: 66rpx;
  border-radius: 14rpx;
  text-align: center;
  font-size: 24rpx;
  font-weight: 600;
  color: #586379;
  background: #edf2fa;
}

.payment-unreceived-action:active {
  opacity: 0.74;
}

.payment-unreceived-action.danger {
  color: #b96572;
  background: #fff0f3;
}

.payment-dispute-form {
  margin-top: 16rpx;
}

.payment-info-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.payment-info-row + .payment-info-row {
  margin-top: 10rpx;
}

.payment-info-label {
  font-size: 23rpx;
  color: #8c97a9;
}

.payment-info-val {
  flex: 1;
  min-width: 0;
  text-align: right;
  font-size: 24rpx;
  line-height: 1.5;
  color: #38455a;
}

.proof-list {
  margin-top: 14rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.proof-image {
  width: 172rpx;
  height: 172rpx;
  border-radius: 14rpx;
  background: #eef3fb;
}

.payment-dispute-state {
  margin-top: 8rpx;
  display: block;
  font-size: 25rpx;
  color: #3a465b;
  font-weight: 600;
}

.payment-dispute-desc {
  margin-top: 8rpx;
  display: block;
  font-size: 23rpx;
  color: #6f7a8f;
  line-height: 1.6;
}

.payment-dispute-textarea {
  margin-top: 12rpx;
  width: 100%;
  min-height: 130rpx;
  border-radius: 14rpx;
  border: 1rpx solid #e4eaf4;
  background: #fff;
  padding: 14rpx 16rpx;
  box-sizing: border-box;
  font-size: 24rpx;
}

.payment-evidence-list {
  margin-top: 14rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.payment-evidence-item,
.payment-evidence-add {
  width: 148rpx;
  height: 148rpx;
  border-radius: 14rpx;
  position: relative;
}

.payment-evidence-item {
  overflow: hidden;
  background: #edf2fa;
}

.payment-evidence-image {
  width: 100%;
  height: 100%;
}

.payment-evidence-remove {
  position: absolute;
  right: 6rpx;
  top: 6rpx;
  width: 30rpx;
  height: 30rpx;
  line-height: 30rpx;
  border-radius: 50%;
  text-align: center;
  font-size: 20rpx;
  color: #fff;
  background: rgba(0, 0, 0, 0.45);
}

.payment-evidence-add {
  border: 1rpx dashed #cfdaea;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.payment-evidence-add-icon {
  font-size: 40rpx;
  color: #9aa5b8;
  line-height: 1;
}

.payment-evidence-add-text {
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #8d98ac;
}

.payment-uploading-text {
  margin-top: 8rpx;
  display: block;
  font-size: 22rpx;
  color: #6d7b93;
}

.payment-evidence-help {
  margin-top: 8rpx;
  display: block;
  font-size: 22rpx;
  color: #97a2b5;
}

.payment-dispute-btn {
  margin-top: 16rpx;
  height: 72rpx;
  line-height: 72rpx;
  border-radius: 999rpx;
  border: none;
  background: linear-gradient(135deg, #8fdcf8 0%, #72c7ec 100%);
  color: #fff;
  font-size: 26rpx;
  font-weight: 700;
}

.payment-dispute-btn::after {
  border: none;
}

.payment-dispute-btn.disabled {
  background: #e7ecf4;
  color: #a5afbe;
}

/* 草稿 */
.draft-item {
  opacity: 1;
  border-style: dashed;
  background: #f7f9fc;
}

/* 通用状态展示 */
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
  background-color: #ffe7c8;
  color: #63411d;
  font-size: 26rpx;
  font-weight: 600;
}
.btn-retry::after { border: none; }

/* 底部操作条 */
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.93);
  backdrop-filter: blur(12rpx);
  border-top: 1rpx solid #e9edf4;
  z-index: 100;
  padding: 14rpx 20rpx 0;
}
.bottom-actions-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  min-height: 96rpx;
  gap: 22rpx;
}
.bottom-actions-row.only-cancel {
  justify-content: flex-end;
}
.bottom-actions-row.only-cancel .left-text-actions {
  margin-left: auto;
  justify-content: flex-end;
}

.left-text-actions {
  display: flex;
  gap: 26rpx;
  flex-shrink: 0;
}

.bottom-actions-row.three-actions .left-text-actions {
  flex: 1;
  gap: 14rpx;
}

.text-btn-item {
  font-size: 27rpx;
  color: #7a6670;
  padding: 18rpx 0;
  font-weight: 500;
}

.bottom-actions-row.three-actions .text-btn-item {
  min-width: 148rpx;
  height: 68rpx;
  line-height: 68rpx;
  padding: 0 22rpx;
  border-radius: 999rpx;
  text-align: center;
  font-size: 24rpx;
  font-weight: 650;
  color: #6a7588;
  background: #f8fbff;
  border: none;
  box-shadow: 0 8rpx 18rpx rgba(142, 160, 188, 0.2);
}

.bottom-actions-row.three-actions .text-btn-item.danger {
  color: #b35f5f;
  background: #fff2f4;
  border: none;
  box-shadow: 0 8rpx 18rpx rgba(215, 155, 165, 0.22);
}

.text-btn-item.danger {
  color: #b35f5f;
}
.text-btn-item.solo-cancel-box {
  min-width: 188rpx;
  height: 72rpx;
  line-height: 72rpx;
  border-radius: 16rpx;
  border: none;
  background: #fdecef;
  box-shadow: 0 8rpx 18rpx rgba(215, 155, 165, 0.2);
  text-align: center;
  padding: 0 24rpx;
  font-size: 26rpx;
  font-weight: 700;
}
.text-btn-item:active {
  opacity: 0.6;
}

.action-btn-large {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 999rpx;
  font-size: 30rpx;
  font-weight: 700;
  margin: 0;
  border: none;
  background: linear-gradient(135deg, #ffd8e8, #ffe3bd);
  color: #4a3131;
  box-shadow: 0 6rpx 14rpx rgba(253, 212, 170, 0.35);
}

.bottom-actions-row.three-actions .action-btn-large {
  flex: 0 0 272rpx;
  width: 272rpx;
  height: 78rpx;
  line-height: 78rpx;
  font-size: 30rpx;
  box-shadow: 0 10rpx 22rpx rgba(253, 212, 170, 0.34);
}

.action-btn-large::after { border: none; }


/* 修改金额弹层 */
.price-sheet {
  background-color: #ffffff;
  border-top-left-radius: 28rpx;
  border-top-right-radius: 28rpx;
  padding: 18rpx 24rpx 24rpx;
  box-shadow: 0 -8rpx 28rpx rgba(20, 33, 52, 0.12);
}
.price-header {
  height: 84rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-bottom: 1rpx solid #edf1f6;
}
.price-title {
  font-size: 31rpx;
  font-weight: 600;
  color: #1f2735;
}
.price-close {
  position: absolute;
  right: 6rpx;
  font-size: 26rpx;
  color: #8d97aa;
}
.price-body {
  padding-top: 14rpx;
}
.price-row {
  margin-top: 12rpx;
  padding: 14rpx 16rpx;
  border-radius: 14rpx;
  background: #f6f8fc;
  display: flex;
  align-items: center;
}
.price-row-column {
  margin-top: 16rpx;
  display: flex;
  flex-direction: column;
}
.price-label {
  font-size: 26rpx;
  color: #5f6778;
  min-width: 150rpx;
}
.price-value {
  flex: 1;
  font-size: 26rpx;
  color: #253044;
  text-align: right;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.price-input {
  flex: 1;
  height: 72rpx;
  line-height: 72rpx;
  padding: 0 16rpx;
  border-radius: 16rpx;
  background-color: #ffffff;
  border: 1rpx solid #e4eaf4;
  font-size: 26rpx;
}
.price-textarea {
  margin-top: 8rpx;
  padding: 12rpx 16rpx;
  border-radius: 16rpx;
  background-color: #ffffff;
  border: 1rpx solid #e4eaf4;
  font-size: 24rpx;
  min-height: 120rpx;
}
.price-footer {
  margin-top: 20rpx;
}
.price-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #8fe8ff, #72d8ff);
  color: #143043;
  font-size: 29rpx;
  font-weight: 700;
  border: none;
}
.price-btn::after { border: none; }

/* ================= Custom Modal Styles ================= */
.custom-modal-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.custom-modal-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #1f2735;
  margin-bottom: 24rpx;
}

.custom-modal-desc {
  font-size: 28rpx;
  color: #5f6878;
  text-align: center;
  line-height: 1.5;
  margin-bottom: 40rpx;
  padding: 0 20rpx;
}

.custom-modal-actions {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
}

.custom-modal-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  text-align: center;
  border: none;
}
.custom-modal-btn::after { border: none; }

.custom-modal-btn.cancel {
  background-color: #f4f6fa;
  color: #6d7484;
}

.custom-modal-btn.confirm {
  background: linear-gradient(135deg, #ffd9e9, #ffe8c6);
  color: #4a3131;
  font-weight: 600;
}

.custom-modal-btn.confirm.disabled {
  background: #f2d6dc;
  color: #8f7277;
}

@media screen and (max-width: 370px) {
  .status-actions {
    flex-wrap: wrap;
  }
  .user-info-group {
    max-width: 100%;
    width: 100%;
  }
  .btn-chat-inline {
    width: 100%;
    justify-content: center;
  }
  .bottom-actions-row {
    flex-wrap: wrap;
    gap: 12rpx;
  }
  .left-text-actions {
    width: 100%;
    justify-content: space-between;
  }
  .bottom-actions-row.only-cancel .left-text-actions {
    width: auto;
    margin-left: auto;
    justify-content: flex-end;
  }
  .bottom-actions-row.three-actions {
    flex-wrap: nowrap;
  }
  .bottom-actions-row.three-actions .left-text-actions {
    width: auto;
    flex: 1;
    justify-content: flex-start;
    gap: 12rpx;
  }
  .bottom-actions-row.three-actions .text-btn-item {
    min-width: 138rpx;
  }
  .action-btn-large {
    width: 100%;
    flex: none;
  }
  .bottom-actions-row.three-actions .action-btn-large {
    width: 238rpx;
    flex: 0 0 238rpx;
  }
}
</style>
