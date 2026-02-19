<template>
  <view-logs />
<view class="page-container">
    <zhouWei-navBar
      type="fixed"
      :backState="2000"
      :homeState="2000"
      bgColor="rgba(255,255,255,0.88)"
      fontColor="#000000"
      :shadow="false"
    >
      <template #left>
        <view class="nav-back-pill nav-back-pill--offset" @click="goBack" aria-label="返回">
          <uni-icons type="left" size="22" color="#000" />
        </view>
      </template>
      <template #default>
        <view class="nav-center">
          <text class="nav-title-ellipsis">投递详情</text>
        </view>
      </template>
    </zhouWei-navBar>

    <view v-if="loading && !hasFirstLoaded" class="loading-mask">
      <loading-toast :show="true" />
    </view>

    <view v-else class="main-body">
      <view class="header-banner-box">
        <image 
          class="header-banner" 
          :src="planCoverImage" 
          mode="aspectFill"
        />
        <view class="banner-overlay"></view>
        
        <view class="banner-blur-left"></view>
        <view class="banner-blur-right"></view>
      </view>

      <view class="content-wrapper">
        
        <view class="section-artist">
          <image 
            class="artist-avatar" 
            :src="artistLogo || '/static/default-avatar.png'" 
            mode="aspectFill" 
            @click.stop="handleBrandClick"
          />
          
          <view class="artist-info-group">
            <view class="artist-texts" @click.stop="handlePlanClick">
              <text class="brand-name text-truncate font-alimamashuhei">{{ artistBrandName }} {{ planBasicText }}</text>
            </view>
            
            <view class="chat-btn-row" >
              <view class="chat-pill" @click="handleStartChat">
                <image src="/static/new-icon/chat.png" style="width: 50rpx;height: 50rpx;"></image>
                
                <view class="cyber-text-box">
                  <text class="cyber-text layer-1 font-alimamashuhei">发起会话</text>
                  <text class="cyber-text layer-2 font-alimamashuhei">发起会话</text>
                </view>

                <uni-icons type="arrow-right" size="12" color="#222" style="opacity: 0.8; margin-left: 4rpx;" />
              </view>
            </view>
          </view>
        </view>

        <view class="section-info-list">
          <view class="info-row-item">
            <text class="info-label font-alimamashuhei">投递编号</text>
            <text class="info-val font-title">#{{ submission.submission_id }}</text>
          </view>
          
          <view class="info-row-item">
            <text class="info-label font-alimamashuhei">订单状态</text>
            <view class="status-badge-sm">
              <text class="status-text font-alimamashuhei">{{ submission.status_text || '—' }}</text>
            </view>
          </view>

          <view class="info-row-item">
            <text class="info-label font-alimamashuhei">当前顺序</text>
            <text class="info-val font-title">{{ queuePositionText }}</text>
          </view>

          <view class="info-row-item info-row-link" @tap="openProgressOverview">
            <text class="info-label font-alimamashuhei">前方订单动态</text>
            <view class="info-link-right">
              <text class="info-link-text font-title">查看</text>
              <uni-icons type="right" size="16" color="#969696" />
            </view>
          </view>
        </view>

        <view class="tab-header-wrapper">
          <view class="custom-tab-bar">
            <view 
              class="tab-slider"
              :style="{
                width: `calc(${100 / tabList.length}% - 8rpx)`, 
                left: `calc(${currentTabIndex * (100 / tabList.length)}% + 4rpx)`
              }"
            ></view>
            
            <view 
              v-for="(tab, index) in tabList" 
              :key="index"
              class="tab-item"
              :class="{ 'active': currentTabIndex === index }"
              :style="{ width: `${100 / tabList.length}%` }"
              @click="switchTab(index)"
            >
              <text class="tab-text text-truncate font-alimamashuhei">{{ tab.label }}</text>
            </view>
          </view>
          
          <view v-if="canEditSubmissionItems" class="tab-tip-text">
            <text class="font-title" v-if="remainingCount > 0">还可以创建 {{ remainingCount }} 个投递</text>
            <text class="font-title" v-else>数量已达上限</text>
          </view>
        </view>

        <view class="tab-content-wrapper">
          
          <view v-if="currentItem" class="content-item-view anim-fade-up" :key="currentTabIndex">
            <view
              class="item-detail-card"
              :class="{ editable: canEditSubmissionItems, viewable: canViewItemDetail }"
              @click="goEditItem(currentItem)"
            >
              <image 
                :src="getFirstRefImage(currentItem.ref_images)" 
                class="item-img" 
                mode="aspectFill"
              />
              
              <view class="item-info-col">
                <view class="info-section-title">
                  <text class="item-title text-truncate">{{ currentItem.work_subject || '未命名作品' }}</text>
                </view>
                
                <view class="info-section-tags">
                  <view class="item-tags-row">
                    <view class="spec-tag tag-primary font-alimamashuhei">
                        {{ currentItem.tier_title || '默认档' }}
                    </view>
                    
                    <block v-if="currentItem.size">
                        <view class="font-alimamashuhei divider-dash"> - </view>
                        <view class="spec-tag font-alimamashuhei">{{ currentItem.size }}</view>
                    </block>

                    <block v-if="getAddonsText(currentItem.addons_json)">
                        <view class="font-alimamashuhei divider-dash"> - </view>
                        <view class="spec-tag font-alimamashuhei text-truncate" style="max-width: 160rpx;">
                            {{ getAddonsText(currentItem.addons_json) }}
                        </view>
                    </block>
                  </view>
                </view>
                
                <view class="info-section-price">
                  <view class="item-price-row font-din">
                    <text class="currency">¥</text>
                    <text class="amount font-title">{{ Number(currentItem.price_total || 0) }}</text>
                  </view>
                  <text v-if="canViewItemDetail" class="item-view-detail">查看详情</text>
                </view>
              </view>
            </view>

            <view class="timeline-area">
              <view class="timeline-header">进度详情</view>
              <view v-if="timelineEvents.length" class="timeline-list">
                <view
                  v-for="(event, idx) in timelineEvents"
                  :key="event.key"
                  class="timeline-row"
                >
                  <view class="timeline-dot" :class="event.dotClass"></view>
                  <view v-if="idx < timelineEvents.length - 1" class="timeline-line"></view>
                  <view class="timeline-text-box">
                    <view class="timeline-title-row">
                      <text class="t-title">{{ event.title }}</text>
                      <text class="t-time">{{ event.timeText }}</text>
                    </view>
                    <text v-if="event.desc" class="t-desc">{{ event.desc }}</text>
                    <view v-if="event.images && event.images.length" class="timeline-image-list">
                      <image
                        v-for="(img, imageIdx) in event.images.slice(0, 3)"
                        :key="`${event.key}-img-${imageIdx}`"
                        class="timeline-image"
                        :src="img"
                        mode="aspectFill"
                        @tap.stop="previewTimelineImages(event.images, imageIdx)"
                      />
                      <view
                        v-if="event.images.length > 3"
                        class="timeline-image-more"
                        @tap.stop="previewTimelineImages(event.images, 0)"
                      >
                        +{{ event.images.length - 3 }}
                      </view>
                    </view>
                    <view v-if="event.canOperate" class="timeline-action-row">
                      <view
                        class="timeline-action-btn reject"
                        :class="{ disabled: stepActioningLogID === event.logId }"
                        @tap="handleStepReject(event)"
                      >
                        驳回
                      </view>
                      <view
                        class="timeline-action-btn approve"
                        :class="{ disabled: stepActioningLogID === event.logId }"
                        @tap="handleStepApprove(event)"
                      >
                        {{ event.confirmLabel }}
                      </view>
                    </view>
                  </view>
                </view>
              </view>
              <view v-else class="timeline-empty-box">
                <view class="timeline-dot active"></view>
                <view class="timeline-text-box">
                  <text class="t-title">暂无进度动态</text>
                  <text class="t-desc">买家确认内容、付款与节点更新后会展示在这里</text>
                </view>
              </view>
            </view>
          </view>

          <view v-else class="content-empty-view anim-fade-up" :key="'empty'">
              <template v-if="canEditSubmissionItems">
              <view class="add-new-card" @click="goCreateItem">
                <view class="add-icon-circle">
                  <uni-icons type="plus-filled" size="24" color="#2B2B2B" />
                </view>
                <text class="add-text font-alimamashuhei">点击新建投递内容</text>
              </view>

              <view v-if="draftItems.length" class="draft-picker-area">
                <view class="draft-title font-title">或从草稿箱选择</view>
                <scroll-view scroll-x class="draft-scroll-view">
                  <view class="draft-list">
                    <view 
                      v-for="draft in draftItems" 
                      :key="draft.id" 
                      class="draft-item"
                      @click="useDraft(draft)"
                    >
                      <image :src="getFirstRefImage(draft.ref_images)" class="draft-thumb" mode="aspectFill" />
                      <view class="draft-mask">
                        <text class="draft-use-btn">使用</text>
                      </view>
                      <text class="draft-name text-truncate font-title">{{ draft.work_subject }}</text>
                    </view>
                  </view>
                </scroll-view>
              </view>
              </template>
              <view v-else class="plain-empty-tip font-title">暂无投递内容</view>
          </view>

        </view>

      </view>

      <view class="safe-area-bottom"></view>
    </view>

    <view class="fixed-bottom-bar" v-if="isLogin && submission.submission_id && bottomAction && !payPopupVisible && !payCodeModalVisible">
       <button 
         class="action-btn" 
         :class="{ 'disabled': !isContentReady }"
         :hover-class="isContentReady ? 'btn-hover' : ''"
         @click="handleBottomAction"
       >
         <view class="btn-content">
           <text class="btn-price font-din">¥ {{ Number(totalPrice) }}</text>
           <view class="btn-divider"></view>
           <text class="btn-label">{{ bottomActionText }}</text>
         </view>
       </button>
    </view>

    <common-modal
      v-model:visible="progressOverviewVisible"
      width="680rpx"
      top="50%"
      :center="true"
    >
      <view class="overview-modal" @tap.stop @touchmove.stop>
        <view class="overview-modal-header">
          <text class="overview-modal-title">前方订单动态</text>
          <text class="overview-modal-refresh" @tap="reloadProgressOverview">刷新</text>
        </view>

        <scroll-view class="overview-modal-scroll" scroll-y @touchmove.stop>
          <view v-if="progressOverviewLoading" class="overview-loading-wrap">
            <loading-jump-text />
          </view>
          <view v-else-if="progressOverviewError" class="overview-error-box">
            <text class="overview-state-text">{{ progressOverviewError }}</text>
            <view class="overview-retry-btn" @tap="reloadProgressOverview">重试</view>
          </view>
          <view v-else class="overview-sections">
            <view v-if="!overviewCurrentPlanItems.length" class="overview-empty-row">暂无记录</view>
            <view
              v-for="(entry, idx) in overviewCurrentPlanItems"
              :key="`plan-${overviewEntryKey(entry)}`"
              class="overview-item-row"
            >
              <view class="overview-item-main">
                <text class="overview-item-order-id">顺序ID {{ overviewEntrySequence(entry, idx) }}</text>
                <text class="overview-item-title text-truncate">{{ overviewEntryTitle(entry) }}</text>
                <text class="overview-item-status">{{ overviewEntryStatus(entry) }}</text>
                <text v-if="overviewEntryProgress(entry)" class="overview-item-progress text-truncate">
                  {{ overviewEntryProgress(entry) }}
                </text>
              </view>
              <view class="overview-item-side">
                <text class="overview-item-time">{{ overviewEntryTime(entry) }}</text>
                <view v-if="isOverviewCurrentSubmission(entry)" class="overview-current-marker">
                  <text class="overview-current-label">您的位置</text>
                  <text class="overview-current-arrow">→</text>
                </view>
              </view>
            </view>
            <view class="overview-tail-tip">您后方的不展示</view>
          </view>
        </scroll-view>
      </view>
    </common-modal>

    <uni-popup
      ref="payPopupRef"
      type="bottom"
      :mask-click="true"
      @change="onPayPopupChange"
    >
      <view class="pay-sheet" @tap.stop @click.stop>
        <view class="pay-sheet-header">
          <text class="pay-sheet-title">选择付款方式</text>
          <text class="pay-sheet-close" @tap="closePayPopup">关闭</text>
        </view>

        <view class="pay-method-list">
          <view
            v-for="method in popupPaymentMethods"
            :key="method.id"
            class="pay-method-item"
            :class="{ active: Number(selectedPayMethodId) === Number(method.id) }"
            @tap="selectPayMethod(method.id)"
          >
            <view class="pay-method-main">
              <text class="pay-method-name">{{ formatPaymentMethodName(method) }}</text>
              <text class="pay-method-desc">{{ method.description_2_user || '' }}</text>
            </view>
            <text class="pay-method-check">{{ Number(selectedPayMethodId) === Number(method.id) ? '已选' : '选择' }}</text>
          </view>
        </view>

        <view class="pay-method-tip">
          <text v-if="selectedMethodIsQRCode">已选择扫码转账，点击“去付款”后查看并保存收款码。</text>
          <text v-else>已选择支付宝，点击“去付款”继续。</text>
        </view>

        <view class="pay-action-row">
          <view
            class="pay-go-btn"
            :class="{ disabled: !canSubmitPayFromPopup }"
            @tap.stop.prevent="onPayGoButtonTap('tap')"
            @click.stop.prevent="onPayGoButtonTap('click')"
          >
            去付款
          </view>
        </view>
      </view>
    </uni-popup>

    <common-modal
      v-model:visible="payCodeModalVisible"
      width="640rpx"
      top="50%"
      :center="true"
    >
      <view class="pay-code-modal">
        <view class="pay-code-modal-header">
          <view class="pay-code-modal-title">{{ selectedMethodIsQRCode ? '扫码转账' : '支付宝支付' }}</view>
          <view class="pay-uid-tip">转账时请备注您在APP内的UID：{{ currentUserUIDText }}</view>
        </view>

        <view class="pay-code-scroll-wrap">
          <view class="pay-scroll-hint-layer">
            <scroll-hint
              class="pay-scroll-hint"
              :active="payCodeModalVisible"
              :duration="2600"
              :delay="220"
              :cycle-duration="1450"
              :size="4.6"
            />
          </view>
          <scroll-view class="pay-code-scroll-area" scroll-y>
            <view class="pay-code-scroll-inner">
              <view v-if="selectedMethodCodeOptions.length > 1" class="pay-code-tabs">
                <view
                  v-for="code in selectedMethodCodeOptions"
                  :key="code.channel"
                  class="pay-code-tab"
                  :class="{ active: selectedPayCodeChannel === code.channel }"
                  @tap="selectPayCodeChannel(code.channel)"
                >
                  {{ code.name || code.channel }}
                </view>
              </view>

              <view v-if="selectedMethodIsQRCode" class="pay-code-image-card">
                <view class="pay-code-image-box">
                  <image
                    v-if="selectedPayCodeUrl"
                    class="pay-code-image"
                    :src="selectedPayCodeUrl"
                    mode="aspectFit"
                  />
                  <text v-else class="pay-code-empty">当前付款方式暂无可用二维码</text>
                </view>
              </view>
              <view v-else class="pay-online-tip">
                请先在支付宝完成转账，再上传转账截图并填写留言。
              </view>

              <view class="pay-proof-card">
                <view class="pay-proof-label-row">
                  <text class="pay-proof-label">转账截图</text>
                  <text class="pay-proof-required">*</text>
                </view>
                <view class="pay-proof-list">
                  <view
                    v-for="(img, idx) in payProofImages"
                    :key="`${img}-${idx}`"
                    class="pay-proof-item"
                  >
                    <image class="pay-proof-image" :src="img" mode="aspectFill" @tap="previewPayProof(idx)" />
                    <view class="pay-proof-remove" @tap.stop="removePayProof(idx)">×</view>
                  </view>
                  <view
                    v-if="payProofImages.length < 3 && !payProofUploading"
                    class="pay-proof-add"
                    @tap="choosePayProofImages"
                  >
                    <text class="pay-proof-add-icon">+</text>
                    <text class="pay-proof-add-text">上传截图</text>
                  </view>
                </view>
                <text class="pay-proof-help">最多3张，至少1张</text>
                <text v-if="payProofUploading" class="pay-proof-uploading">{{ payProofUploadText }}</text>
              </view>

              <view class="pay-message-card">
                <view class="pay-proof-label-row">
                  <text class="pay-proof-label">付款留言</text>
                  <text class="pay-proof-required">*</text>
                </view>
                <textarea
                  v-model.trim="payMessage"
                  class="pay-message-input"
                  maxlength="200"
                  placeholder="请填写转账说明（至少2个字）"
                />
                <text class="pay-message-count">{{ payMessageLength }}/200</text>
              </view>
            </view>
          </scroll-view>
        </view>

        <view class="pay-code-modal-actions" :class="{ single: !selectedMethodIsQRCode }">
          <button
            v-if="selectedMethodIsQRCode"
            class="pay-modal-save-btn"
            :disabled="!selectedPayCodeUrl"
            @tap.stop.prevent="onPayCodeSaveTap('tap')"
            @click.stop.prevent="onPayCodeSaveTap('click')"
          >
            保存二维码
          </button>
          <button
            class="pay-modal-done-btn"
            :disabled="!canSubmitPayFromCodeModal"
            @tap.stop.prevent="onPayCodeDoneTap('tap')"
            @click.stop.prevent="onPayCodeDoneTap('click')"
          >
            我已付款
          </button>
        </view>

        <view class="pay-code-bottom-gap"></view>
      </view>
    </common-modal>
  </view>
</template>

<script setup>
import { ref, reactive, computed, nextTick, watch } from 'vue'
import { onLoad, onShow, onHide, onUnload } from '@dcloudio/uni-app'
import { websiteUrl, global, asyncGetUserInfo } from '@/common/config.js'
import { chooseImageList, getQiniuToken, uploadImageToQiniu } from '@/common/image.js'
import CommonModal from '@/components/common-modal/common-modal.vue'
import ScrollHint from '@/components/scroll-hint/scroll-hint.vue'
import LoadingJumpText from '@/components/loading-jump-text/loading-jump-text.vue'

// ====== 常量 ======
const SubmissionStatusQueued = 0
const SubmissionStatusSelectedConfirm = 1
const SubmissionStatusSelectedPay = 3
const SubmissionStatusPaid = 4
const PlanPaymentMethodQRCode = 1
const PlanPaymentMethodAlipay = 2

// ====== 状态数据 ======
const submissionId = ref(0)
const loading = ref(false)
const hasFirstLoaded = ref(false)
const fetchSeq = ref(0)
// 修改点：移除 ref 包装，使用普通变量作为共享变量控制定时器
let pollingTimer = null 

const currentTabIndex = ref(0) // 控制 Tab

const submission = reactive({
  submission_id: 0,
  plan_id: 0,
  status: 0,
  status_text: '',
  ahead_count: 0,
  artist_type: 0, // 修改点：新增 artist_type
  step_configs: [],
  progress_logs: [],
  items: []
})
const draftItems = ref([])
const plan = reactive({
  id: 0,
  artist_name: '',
  brand_admin_id: 0,
  max_submissions_per_user: 0,
  artist_info: null,
  brand: null,
  images: '',
  order_type: 0
})

const payPopupRef = ref(null)
const payPopupData = ref(null)
const selectedPayMethodId = ref(0)
const selectedPayCodeChannel = ref('')
const payCodeModalVisible = ref(false)
const payPopupVisible = ref(false)
const openingPayCodeModal = ref(false)
const payGoLastTriggerTs = ref(0)
const payCodeActionLastTriggerTs = ref(0)
const currentUserUID = ref(Number(global.userInfo?.id || uni.getStorageSync('userInfo')?.id || 0))
const payProofImages = ref([])
const payMessage = ref('')
const payProofUploading = ref(false)
const payProofUploadText = ref('')
const stepActioningLogID = ref(0)
const progressOverviewVisible = ref(false)
const progressOverviewLoading = ref(false)
const progressOverviewLoaded = ref(false)
const progressOverviewError = ref('')
const overviewCurrentPlanItems = ref([])
const lastRouteKey = ref('')

let h5ScrollLockApplied = false
let h5BodyOverflowBackup = ''
let h5HtmlOverflowBackup = ''
let h5BodyPositionBackup = ''
let h5BodyTopBackup = ''
let h5BodyWidthBackup = ''
let h5ScrollTopBackup = 0

const PAY_DEBUG_TAG = '[submission-pay]'
function payDebug(step, payload = {}) {
  try {
    console.log(PAY_DEBUG_TAG, step, payload)
  } catch (_) {}
}

// ====== Computed ======
const isLogin = computed(() => !!(uni.getStorageSync('token') || global.isLogin))
const planCoverImage = computed(() => plan.images ? plan.images.split(',')[0] : '')

// 品牌信息
const artistLogo = computed(() => {
  if (plan.artist_info?.LogoImage) return plan.artist_info.LogoImage
  if (plan.brand?.logo_image) return plan.brand.logo_image
  return ''
})
const artistBrandName = computed(() => {
  if (plan.artist_info?.BrandName) return plan.artist_info.BrandName
  if (plan.brand?.brand_name) return plan.brand.brand_name
  return '未知作者'
})
const planBasicText = computed(() => {
  const types = { 1: '常驻', 2: '手速', 3: '抽选', 4: '黑箱' }
  const t = types[plan.order_type] || '活动'
  return `${t} · ${plan.artist_name}`
})

// 队列/状态显示
const queuePositionText = computed(() => {
  const count = (submission.ahead_count || 0) + 1
  return `No.${String(count).padStart(3, '0')}`
})

const statusColorClass = computed(() => {
  const s = submission.status
  if (s === SubmissionStatusQueued) return 'bg-blue'
  if (s === SubmissionStatusSelectedConfirm) return 'bg-orange'
  if (s === SubmissionStatusSelectedPay) return 'bg-red'
  return 'bg-green'
})

// === Tab 计算逻辑 ===
const canEditSubmissionItems = computed(() => {
  const s = Number(submission.status || 0)
  return s === SubmissionStatusQueued || s === SubmissionStatusSelectedConfirm
})

const canViewItemDetail = computed(() => {
  return Number(submission.status || 0) >= SubmissionStatusPaid
})

const tabList = computed(() => {
  const canEdit = canEditSubmissionItems.value
  if (!canEdit) {
    if (!submission.items.length) {
      return [{ label: '暂无', type: 'empty-readonly', index: 0 }]
    }
    return submission.items.map((item, idx) => ({
      label: item.work_subject || `作品${idx + 1}`,
      type: 'item',
      index: idx
    }))
  }

  const list = []
  const max = plan.max_submissions_per_user > 0
    ? plan.max_submissions_per_user
    : (submission.items.length + 1)
  const targetCount = Math.max(max, 1)
   
  for (let i = 0; i < targetCount; i++) {
    if (i < submission.items.length) {
      list.push({
        label: submission.items[i].work_subject || `作品${i+1}`,
        type: 'item',
        index: i
      })
    } else {
      list.push({ label: '+', type: 'empty', index: i })
    }
  }
  return list
})

const currentItem = computed(() => {
  if (currentTabIndex.value < submission.items.length) {
    return submission.items[currentTabIndex.value]
  }
  return null
})

const finalStepID = computed(() => {
  // 基于节点配置推导“最后节点ID”，用于区分普通通过与成品确认。
  const list = Array.isArray(submission.step_configs) ? submission.step_configs : []
  let maxID = 0
  for (const row of list) {
    const id = Number(row?.id || row?.ID || 0)
    if (id > maxID) maxID = id
  }
  return maxID
})

function isFinalStepLog(row) {
  // 先按 step_id 命中最后节点；兼容旧数据再按名称兜底。
  const stepID = Number(row?.step_id || 0)
  if (stepID > 0 && finalStepID.value > 0 && stepID === finalStepID.value) return true
  const stepName = String(row?.step_name || '').trim()
  return stepName.includes('成品')
}

const timelineEvents = computed(() => {
  // 时间线只显示当前子项相关动态（全局事件 + 当前 item 事件）。
  const logs = Array.isArray(submission.progress_logs) ? submission.progress_logs : []
  const currentItemID = Number(currentItem.value?.id || 0)
  const filtered = logs.filter((row) => {
    const itemID = Number(row?.submission_item_id || 0)
    if (currentItemID > 0) {
      return itemID === 0 || itemID === currentItemID
    }
    return itemID === 0
  })

  return filtered
    .slice()
    .sort((a, b) => {
      const ta = Number(a?.created_at || 0)
      const tb = Number(b?.created_at || 0)
      if (ta !== tb) return tb - ta
      return Number(b?.id || 0) - Number(a?.id || 0)
    })
    .map((row, idx) => {
      const logID = Number(row?.id || 0)
      const status = Number(row?.status || 0)
      const logType = Number(row?.log_type || 0)
      const itemID = Number(row?.submission_item_id || 0)
      const isFinalStep = isFinalStepLog(row)
      let dotClass = 'done'
      if (status === 0) dotClass = idx === 0 ? 'active' : 'pending'
      if (status === 2) dotClass = 'rejected'
      const canOperate = logType === 1 && status === 0 && currentItemID > 0 && itemID === currentItemID
      return {
        key: `${row?.id || idx}-${row?.event_code || ''}`,
        logId: logID,
        logType,
        status,
        itemID,
        canOperate,
        confirmLabel: isFinalStep ? '确认成品' : '通过',
        finalStep: isFinalStep,
        title: timelineTitle(row),
        desc: timelineDesc(row),
        images: parseTimelineImages(row),
        timeText: formatTimelineTime(row?.created_at),
        dotClass
      }
    })
})

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

function parseTimelineImages(row) {
  const direct = normalizeImageArray(row?.images)
  if (direct.length) return Array.from(new Set(direct))
  const byField = normalizeImageArray(row?.images_urls || row?.images_json)
  return Array.from(new Set(byField))
}

function previewTimelineImages(images, index = 0) {
  const list = Array.isArray(images) ? images.filter(Boolean) : []
  if (!list.length) return
  uni.previewImage({
    current: list[index] || list[0],
    urls: list
  })
}

const remainingCount = computed(() => {
  if (!canEditSubmissionItems.value) return 0
  const max = plan.max_submissions_per_user || 99
  const used = submission.items.length
  return Math.max(0, max - used)
})

const totalPrice = computed(() => {
  return submission.items.reduce((sum, item) => sum + Number(item.price_total || 0), 0)
})

// 底部按钮
const bottomAction = computed(() => {
  const txt = submission.status_text || ''
  if (txt.includes('待买家确认') || submission.status === SubmissionStatusSelectedConfirm) return 'confirm'
  if (txt.includes('待付款') || submission.status === SubmissionStatusSelectedPay) return 'pay'
  return ''
})
const bottomActionText = computed(() => {
  if (bottomAction.value === 'confirm') return '确认订单'
  if (bottomAction.value === 'pay') return '去付款'
  return ''
})

// 修改点：新增判断内容是否准备就绪
const isContentReady = computed(() => {
  // 如果是去付款阶段，意味着订单已经生成，内容已锁定，直接视为Ready
  if (bottomAction.value === 'pay') return true
  
  // 如果是确认订单阶段，必须保证用户填写了至少一项内容
  if (bottomAction.value === 'confirm') {
    return submission.items && submission.items.length > 0
  }
  
  return false
})

const popupPaymentMethods = computed(() => {
  const list = payPopupData.value?.payment_methods
  return Array.isArray(list) ? list : []
})

const selectedPayMethod = computed(() => {
  const target = Number(selectedPayMethodId.value || 0)
  return popupPaymentMethods.value.find(item => Number(item.id || 0) === target) || null
})

const selectedMethodIsQRCode = computed(() => {
  return Number(selectedPayMethod.value?.id || 0) === PlanPaymentMethodQRCode
})

const selectedMethodCodeOptions = computed(() => {
  const list = selectedPayMethod.value?.code_options
  return Array.isArray(list) ? list : []
})

const selectedPayCode = computed(() => {
  if (!selectedMethodIsQRCode.value) return null
  const channel = String(selectedPayCodeChannel.value || '').toLowerCase()
  return selectedMethodCodeOptions.value.find(item => String(item.channel || '').toLowerCase() === channel) || null
})

const selectedPayCodeUrl = computed(() => {
  return selectedPayCode.value?.url || ''
})

const currentUserUIDText = computed(() => {
  const uid = Number(currentUserUID.value || 0)
  return uid > 0 ? String(uid) : '-'
})

const payMessageLength = computed(() => {
  return Array.from(String(payMessage.value || '')).length
})

const canSubmitPayFromPopup = computed(() => {
  const methodID = Number(selectedPayMethodId.value || 0)
  if (!methodID) return false
  if (methodID === PlanPaymentMethodQRCode) {
    return selectedMethodCodeOptions.value.length > 0
  }
  return true
})

const canSubmitPayFromCodeModal = computed(() => {
  const methodID = Number(selectedPayMethodId.value || 0)
  if (!methodID) return false
  if (selectedMethodIsQRCode.value && !selectedPayCodeUrl.value) return false
  if (payProofUploading.value) return false
  if (!payProofImages.value.length) return false
  return payMessageLength.value >= 2
})

// ====== Methods ======
function goBack() {
  uni.navigateBack({ delta: 1 })
}

function buildStableQueryString(opts) {
  const row = opts || {}
  const keys = Object.keys(row).sort()
  return keys.map((k) => `${String(k)}=${String(row[k])}`).join('&')
}

function safeGetH5Hash() {
  try {
    if (typeof window !== 'undefined' && window.location) return window.location.hash || ''
    if (typeof location !== 'undefined') return location.hash || ''
  } catch (_) {}
  return ''
}

function parseQueryStringToObj(qs) {
  const out = {}
  if (!qs) return out
  const raw = String(qs).replace(/^\?/, '')
  if (!raw) return out
  raw.split('&').forEach((pair) => {
    if (!pair) return
    const idx = pair.indexOf('=')
    const k = idx >= 0 ? pair.slice(0, idx) : pair
    const v = idx >= 0 ? pair.slice(idx + 1) : ''
    const key = decodeURIComponent((k || '').trim())
    if (!key) return
    out[key] = decodeURIComponent(String(v || '').replace(/\+/g, ' '))
  })
  return out
}

function extractQueryFromUrl(urlLike) {
  const s = String(urlLike || '')
  const qIdx = s.indexOf('?')
  if (qIdx < 0) return { base: s, query: {} }
  const base = s.slice(0, qIdx)
  const tail = s.slice(qIdx + 1)
  const qs = tail.split('#')[0]
  return { base, query: parseQueryStringToObj(qs) }
}

function getCurrentPageSnapshot() {
  let pages = []
  try {
    pages = getCurrentPages && getCurrentPages()
  } catch (_) {}
  const cur = pages && pages.length ? pages[pages.length - 1] : null
  const rawOpts = (cur && cur.options) || (cur && cur.$page && cur.$page.options) || {}
  const route = (cur && (cur.route || (cur.$page && cur.$page.route))) || ''
  const fullPath = (cur && cur.$page && cur.$page.fullPath) ? cur.$page.fullPath : ''

  const h5Hash = safeGetH5Hash()
  const hashParsed = h5Hash ? extractQueryFromUrl(h5Hash) : null
  const fullParsed = fullPath ? extractQueryFromUrl(fullPath) : null

  const mergedOpts = Object.assign(
    {},
    rawOpts || {},
    fullParsed?.query || {},
    hashParsed?.query || {}
  )

  const key = h5Hash
    ? String(h5Hash)
    : (fullPath
      ? String(fullPath)
      : `${String(route)}?${buildStableQueryString(mergedOpts)}`)
  return { opts: mergedOpts, route, fullPath, key }
}

function resetSubmissionRuntimeState() {
  Object.assign(submission, {
    submission_id: 0,
    plan_id: 0,
    status: 0,
    status_text: '',
    ahead_count: 0,
    artist_type: 0,
    step_configs: [],
    progress_logs: [],
    items: []
  })
  draftItems.value = []
  currentTabIndex.value = 0
  stepActioningLogID.value = 0
  Object.assign(plan, {
    id: 0,
    artist_name: '',
    brand_admin_id: 0,
    max_submissions_per_user: 0,
    artist_info: null,
    brand: null,
    images: '',
    order_type: 0
  })
  resetProgressOverviewState()
  resetPayState()
}

function applyRouteOptionsAndRefresh(opts = {}, reason = '') {
  const nextSubmissionID = Number(opts.submission_id || 0)
  if (!nextSubmissionID) return false

  const changed = nextSubmissionID !== submissionId.value
  if (changed) {
    submissionId.value = nextSubmissionID
    hasFirstLoaded.value = false
    fetchSeq.value = 0
    resetSubmissionRuntimeState()
    if (global.lastRefresh) global.lastRefresh.time = 0
  }

  if (isLogin.value && submissionId.value) {
    ensureCurrentUserUID()
    startPolling(true)
  }

  payDebug('applyRouteOptionsAndRefresh', {
    reason,
    nextSubmissionID,
    changed
  })
  return changed
}

function onH5HashRouteChange() {
  const snap = getCurrentPageSnapshot()
  const newKey = String(snap?.key || '')
  if (newKey && newKey === lastRouteKey.value) return
  lastRouteKey.value = newKey || lastRouteKey.value
  applyRouteOptionsAndRefresh(snap?.opts || {}, 'h5-hashchange')
}

function bindH5HashChangeListener() {
  // #ifdef H5
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.removeEventListener('hashchange', onH5HashRouteChange)
    window.addEventListener('hashchange', onH5HashRouteChange)
  }
  // #endif
}

function unbindH5HashChangeListener() {
  // #ifdef H5
  if (typeof window !== 'undefined' && window.removeEventListener) {
    window.removeEventListener('hashchange', onH5HashRouteChange)
  }
  // #endif
}

function setH5PageScrollLock(locked) {
  // #ifdef H5
  try {
    if (typeof document === 'undefined') return
    const body = document.body
    const html = document.documentElement
    if (!body || !html) return

    if (locked) {
      if (h5ScrollLockApplied) return
      h5ScrollLockApplied = true
      h5ScrollTopBackup = window.pageYOffset || html.scrollTop || body.scrollTop || 0
      h5BodyOverflowBackup = body.style.overflow || ''
      h5HtmlOverflowBackup = html.style.overflow || ''
      h5BodyPositionBackup = body.style.position || ''
      h5BodyTopBackup = body.style.top || ''
      h5BodyWidthBackup = body.style.width || ''

      html.style.overflow = 'hidden'
      body.style.overflow = 'hidden'
      body.style.position = 'fixed'
      body.style.top = `-${h5ScrollTopBackup}px`
      body.style.width = '100%'
      return
    }

    if (!h5ScrollLockApplied) return
    h5ScrollLockApplied = false
    html.style.overflow = h5HtmlOverflowBackup
    body.style.overflow = h5BodyOverflowBackup
    body.style.position = h5BodyPositionBackup
    body.style.top = h5BodyTopBackup
    body.style.width = h5BodyWidthBackup
    window.scrollTo(0, h5ScrollTopBackup)
  } catch (_) {}
  // #endif
}

function formatTimelineTime(ts) {
  const t = Number(ts || 0)
  if (!t) return '--'
  const d = new Date(t * 1000)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${mm}-${dd} ${hh}:${mi}`
}

function overviewEntryKey(entry) {
  const itemID = Number(entry?.item?.id || entry?.item?.ID || 0)
  const subID = Number(entry?.submission?.id || entry?.submission?.ID || 0)
  return `${subID}-${itemID}`
}

function overviewEntryTitle(entry) {
  const subject = String(entry?.item?.work_subject || '').trim()
  if (subject) return subject
  const subID = Number(entry?.submission?.id || entry?.submission?.ID || 0)
  return subID ? `投递 #${subID}` : '未命名投递'
}

function overviewEntryStatus(entry) {
  const itemText = String(entry?.item_status_text || '').trim()
  const subText = String(entry?.submission_status_text || '').trim()
  if (itemText && subText) return `${itemText} · ${subText}`
  return itemText || subText || '状态未知'
}

function overviewEntryProgress(entry) {
  const latest = entry?.latest_progress
  if (!latest) return ''
  const stepName = String(latest?.step_name || '').trim()
  const content = String(latest?.content || '').trim()
  return content || stepName || ''
}

function overviewEntryTime(entry) {
  const latestTs = Number(entry?.latest_progress?.created_at || 0)
  if (latestTs > 0) return formatTimelineTime(latestTs)
  const updated = Number(entry?.item?.updated_at || 0)
  if (updated > 0) return formatTimelineTime(updated)
  return '--'
}

function isOverviewCurrentSubmission(entry) {
  const entrySubmissionID = Number(entry?.submission?.id || entry?.submission?.ID || 0)
  const currentSubmissionID = Number(submission.submission_id || submissionId.value || 0)
  return entrySubmissionID > 0 && currentSubmissionID > 0 && entrySubmissionID === currentSubmissionID
}

function overviewEntrySequence(entry, idx) {
  const queueNo = Number(entry?.item?.queue_no || 0)
  const orderNo = queueNo > 0 ? queueNo : (Number(idx) + 1)
  return `No.${String(orderNo).padStart(3, '0')}`
}

function resetProgressOverviewState() {
  progressOverviewError.value = ''
  progressOverviewLoaded.value = false
  overviewCurrentPlanItems.value = []
}

async function fetchProgressOverview(force = false) {
  if (progressOverviewLoading.value) return
  if (progressOverviewLoaded.value && !force) return
  if (!isLogin.value) {
    progressOverviewError.value = '请先登录'
    return
  }

  progressOverviewLoading.value = true
  progressOverviewError.value = ''
  try {
    const token = uni.getStorageSync('token') || ''
    const currentSubmissionID = Number(submission.submission_id || submissionId.value || 0)
    if (!currentSubmissionID) {
      throw new Error('投递ID无效，请稍后重试')
    }
    const planID = Number(submission.plan_id || plan.id || 0)
    if (!planID) {
      throw new Error('投递详情仍在加载，请稍后重试')
    }
    const itemBrandID = Number(submission.items?.[0]?.brand_id || 0)
    const brandID = Number(plan.brand?.id || itemBrandID || 0)
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/item-progress-overview`,
      method: 'GET',
      header: { Authorization: token },
      data: {
        submission_id: currentSubmissionID,
        plan_id: planID,
        brand_id: brandID,
        size: 20
      }
    })
    const body = res?.data || {}
    if (String(body.status).toLowerCase() !== 'success') {
      throw new Error(body.msg || '加载订单动态失败')
    }
    const d = body.data || {}
    const rows = Array.isArray(d.current_plan_items) ? d.current_plan_items.slice() : []
    const currentQueueNo = Number(submission.ahead_count || 0) + 1
    const filteredRows = rows.filter((row) => {
      const queueNo = Number(row?.item?.queue_no || 0)
      if (queueNo <= 0) return true
      if (currentQueueNo <= 0) return true
      return queueNo <= currentQueueNo
    })
    filteredRows.sort((a, b) => {
      const qa = Number(a?.item?.queue_no || 0)
      const qb = Number(b?.item?.queue_no || 0)
      if (qa > 0 && qb > 0 && qa !== qb) return qa - qb
      return Number(b?.item?.updated_at || 0) - Number(a?.item?.updated_at || 0)
    })
    overviewCurrentPlanItems.value = filteredRows
    progressOverviewLoaded.value = true
  } catch (e) {
    progressOverviewError.value = e?.message || '加载订单动态失败'
  } finally {
    progressOverviewLoading.value = false
  }
}

async function openProgressOverview() {
  progressOverviewVisible.value = true
  await fetchProgressOverview(false)
}

function reloadProgressOverview() {
  fetchProgressOverview(true)
}

function timelineTitle(row) {
  const logType = Number(row?.log_type || 0)
  const status = Number(row?.status || 0)
  const stepName = String(row?.step_name || '').trim()
  const eventCode = String(row?.event_code || '').trim()
  if (eventCode === 'final_product_confirmed') return '成品确认（已通过）'
  if (logType === 1) {
    const name = stepName || `节点#${Number(row?.step_id || 0)}`
    if (status === 1) return `${name}（已确认）`
    if (status === 2) return `${name}（未通过）`
    return `${name}（待确认）`
  }
  return stepName || '进度更新'
}

function timelineDesc(row) {
  const content = String(row?.content || '').trim()
  if (content) return content
  const eventCode = String(row?.event_code || '').trim()
  if (eventCode === 'submission_created') return '买家已拍下订单，等待补充投递内容。'
  if (eventCode === 'buyer_confirm_content') return '买家已确认投递内容，等待卖家确认订单。'
  if (eventCode === 'seller_confirm_submission') return '创作者已确认订单，订单进入待付款状态。'
  if (eventCode === 'payment_completed') return '买家已完成付款。'
  if (eventCode === 'step_request') return '创作者已上传节点内容，等待买家确认。'
  if (eventCode === 'final_product_confirmed') return '买家已确认最终成品。'
  return ''
}

async function submitStepDecision(logID, action, reason = '') {
  // 买家节点动作统一提交入口：confirm/reject 两条接口共用同一套请求与防重逻辑。
  const id = Number(logID || 0)
  if (!id) return
  if (stepActioningLogID.value === id) return
  if (!isLogin.value) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  const token = uni.getStorageSync('token') || ''
  const isConfirm = action === 'confirm'
  stepActioningLogID.value = id
  uni.showLoading({ title: isConfirm ? '确认中' : '驳回中' })
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/step/${isConfirm ? 'confirm' : 'reject'}`,
      method: 'POST',
      header: {
        Authorization: token,
        'Content-Type': 'application/json'
      },
      data: isConfirm
        ? { log_id: id }
        : { log_id: id, reason: String(reason || '').trim() }
    })
    const body = res?.data || {}
    if (String(body.status).toLowerCase() !== 'success') {
      uni.showToast({ title: body.msg || (isConfirm ? '确认失败' : '驳回失败'), icon: 'none' })
      return
    }
    uni.showToast({ title: isConfirm ? '已确认' : '已驳回', icon: 'success' })
    if (global.lastRefresh) global.lastRefresh.time = 0
    fetchDetail()
  } catch (e) {
    uni.showToast({ title: isConfirm ? '确认失败' : '驳回失败', icon: 'none' })
  } finally {
    uni.hideLoading()
    if (stepActioningLogID.value === id) {
      stepActioningLogID.value = 0
    }
  }
}

function handleStepApprove(event) {
  // 最终节点展示“确认成品”，其余节点展示“通过”。
  if (!event?.canOperate || !event?.logId) return
  const title = event.finalStep ? '确认成品' : '确认节点'
  const content = event.finalStep ? '确认该最终成品已通过吗？' : '确认该创作节点通过吗？'
  uni.showModal({
    title,
    content,
    confirmText: event.finalStep ? '确认成品' : '通过',
    cancelText: '取消',
    success: ({ confirm }) => {
      if (!confirm) return
      submitStepDecision(event.logId, 'confirm')
    }
  })
}

function handleStepReject(event) {
  // 驳回后卖家可重新上传同节点，后端会将旧待确认记录标记为覆盖/驳回。
  if (!event?.canOperate || !event?.logId) return
  uni.showModal({
    title: '驳回节点',
    content: '确认驳回该节点吗？妆师可修改后再次上传。',
    confirmText: '确认驳回',
    cancelText: '取消',
    success: ({ confirm }) => {
      if (!confirm) return
      submitStepDecision(event.logId, 'reject')
    }
  })
}

function switchTab(index) {
  currentTabIndex.value = index
}

watch(
  () => tabList.value.length,
  (len) => {
    const safeLen = Number(len || 0)
    if (safeLen <= 0) {
      currentTabIndex.value = 0
      return
    }
    if (currentTabIndex.value > safeLen - 1) {
      currentTabIndex.value = safeLen - 1
    }
  }
)

function getFirstRefImage(str) {
  if (!str) return ''
  return str.split(',')[0]
}

// 解析加购项
function getAddonsText(jsonStr) {
  if (!jsonStr) return ''
  try {
    const list = JSON.parse(jsonStr)
    if (Array.isArray(list) && list.length > 0) {
      // 提取 title 并用 & 连接
      return list.map(item => item.title).filter(t => t).join(' & ')
    }
  } catch(e) {
    console.error('Addons parse error:', e)
  }
  return ''
}

// 修改点：跳转到 Plan 详情
function handlePlanClick() {
  if (submission.plan_id) {
    uni.navigateTo({
      url: `/pkg-creator/creator_order/plan_detail/plan_detail?id=${submission.plan_id}`
    })
  }
}

// 修改点：跳转到店铺主页 (根据 artist_type)
function handleBrandClick() {
  // 尝试从 items[0] 中获取 brand_id，或者从 plan 信息中获取
  const brandId = submission.items.length > 0 ? submission.items[0].brand_id : (plan.brand?.id || 0)
   
  if (!brandId) return

  if (submission.artist_type === 1) {
    // 妆师
    uni.navigateTo({
      url: `/pkg-creator/creator_base/bjd_faceup_artist/bjd_faceup_artist?brand_id=${brandId}`
    })
  } else if (submission.artist_type === 2) {
    // 毛娘
    uni.navigateTo({
      url: `/pkg-creator/creator_base/hair_artist/hair_artist?brand_id=${brandId}`
    })
  }
}


// 数据请求
async function fetchDetail(force = false) {
  const sid = submissionId.value
  if (!sid) return

  if (!force) {
    const currentUrlKey = `submission/queue-info?submission_id=${sid}`
    const now = Date.now()
    if (global.lastRefresh &&
      global.lastRefresh.url === currentUrlKey &&
      (now - global.lastRefresh.time < 3000)) {
      console.log('[Throttle] Skip fetchDetail due to global timer constraint.')
      return
    }
    if (!global.lastRefresh) global.lastRefresh = {}
    global.lastRefresh.url = currentUrlKey
    global.lastRefresh.time = now
  }
   
  const seq = ++fetchSeq.value
  if (!hasFirstLoaded.value) loading.value = true
   
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/submission/queue-info`,
      header: { Authorization: uni.getStorageSync('token') },
      data: { submission_id: sid }
    })
    
    if (seq !== fetchSeq.value) return 

    const body = res.data
    if (body.status === 'success') {
      const d = body.data
      Object.assign(submission, {
        submission_id: d.submission_id,
        plan_id: d.plan_id,
        status: d.status,
        status_text: d.status_text,
        ahead_count: d.ahead_count,
        artist_type: d.artist_type, // 修改点：赋值 artist_type
        step_configs: Array.isArray(d.step_configs) ? d.step_configs : [],
        progress_logs: Array.isArray(d.progress_logs) ? d.progress_logs : [],
        items: d.items || []
      })
      draftItems.value = d.draft_items || []
      
      if (d.plan_id && (!plan.id || plan.id !== d.plan_id)) {
        fetchPlanInfo(d.plan_id)
      }
    }
    hasFirstLoaded.value = true
  } catch(e) {
  } finally {
    loading.value = false
  }
}

async function fetchPlanInfo(pid) {
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/brand-artist/order-plan-info`,
      data: { id: pid }
    })
    if (res.data.status === 'success') {
      const d = res.data.data
      Object.assign(plan, {
        id: d.id,
        artist_name: d.artist_name,
        brand_admin_id: d.brand_admin_id,
        max_submissions_per_user: d.max_submissions_per_user,
        artist_info: d.artist_info,
        brand: d.brand,
        images: d.images,
        order_type: d.order_type
      })
    }
  } catch(e) {}
}

function handleStartChat() {
  if (plan.brand_admin_id) {
    const url = `/pkg-im/chat/chat?peer_id=${plan.brand_admin_id}`
    // #ifdef H5
    window.location.hash = url
    // #endif
    // #ifndef H5
    uni.navigateTo({ url })
    // #endif
  }
}

function goCreateItem() {
  if (!canEditSubmissionItems.value) {
    uni.showToast({ title: '当前阶段已锁定，无法新增', icon: 'none' })
    return
  }
  const url = `/pkg-creator/creator_order/submission_item_form/submission_item_form?submission_id=${submission.submission_id}&plan_id=${submission.plan_id}`
  uni.navigateTo({ url })
}
function goEditItem(item) {
  if (!item || !item.id) return
  if (canEditSubmissionItems.value) {
    const editUrl = `/pkg-creator/creator_order/submission_item_form/submission_item_form?submission_item_id=${item.id}`
    uni.navigateTo({ url: editUrl })
    return
  }
  if (!canViewItemDetail.value) return
  const detailUrl = `/pkg-creator/creator_order/submission_item_detail/submission_item_detail?submission_id=${submission.submission_id}&item_id=${item.id}`
  uni.navigateTo({ url: detailUrl })
}

async function useDraft(draft) {
  if (!canEditSubmissionItems.value) {
    uni.showToast({ title: '当前阶段已锁定，无法新增', icon: 'none' })
    return
  }
  uni.showLoading({ title: '绑定中' })
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/item/attach`,
      method: 'POST',
      header: { Authorization: uni.getStorageSync('token') },
      data: { submission_id: submission.submission_id, item_ids: [draft.id] }
    })
    
    // 修改点：增加对业务状态码的判断
    if (res.data && res.data.status === 'success') {
      uni.showToast({ title: '成功' })
      fetchDetail()
    } else {
      // 失败时显示后端返回的 msg
      uni.showToast({ 
        title: res.data?.msg || '绑定失败', 
        icon: 'none',
        duration: 2500
      })
    }
  } catch(e) {
    uni.showToast({ title: '请求失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

async function handleBottomAction() {
  // 修改点：如果内容没准备好，直接拦截点击
  if (!isContentReady.value) {
    return
  }

  if (bottomAction.value === 'pay') {
    await handlePayAction()
    return
  }

  const urlMap = {
    'confirm': `${websiteUrl.value}/with-state/artist-order/submission/confirm-content`
  }
  if (!urlMap[bottomAction.value]) return
   
  uni.showLoading({ title: '请求中' })
  try {
    const res = await uni.request({
      url: urlMap[bottomAction.value],
      method: 'POST',
      header: { Authorization: uni.getStorageSync('token') },
      data: { submission_id: submission.submission_id }
    })
    if (res.data.status === 'success') {
      uni.showToast({ title: '成功', icon: 'success' })
      fetchDetail()
    } else {
      uni.showToast({ title: res.data.msg || '失败', icon: 'none' })
    }
  } finally {
    uni.hideLoading()
  }
}

async function fetchSubmissionPayOptions() {
  payDebug('fetchSubmissionPayOptions:request', {
    submission_id: submission.submission_id
  })
  const res = await uni.request({
    url: `${websiteUrl.value}/with-state/artist-order/submission/pay-options`,
    method: 'GET',
    header: { Authorization: uni.getStorageSync('token') },
    data: { submission_id: submission.submission_id }
  })
  const body = res.data || {}
  payDebug('fetchSubmissionPayOptions:response', {
    status: body.status,
    msg: body.msg,
    selected_payment_method_id: body?.data?.selected_payment_method_id,
    payment_methods_count: Array.isArray(body?.data?.payment_methods) ? body.data.payment_methods.length : 0,
    raw: body
  })
  if (String(body.status).toLowerCase() !== 'success') {
    payDebug('fetchSubmissionPayOptions:failed', body)
    throw new Error(body.msg || '获取付款方式失败')
  }
  return body.data || {}
}

function openPayPopup() {
  const opener = payPopupRef.value?.open
  payDebug('openPayPopup:try', {
    hasRef: !!payPopupRef.value,
    openerType: typeof opener
  })
  if (typeof opener !== 'function') {
    uni.showToast({ title: '付款弹窗初始化失败', icon: 'none' })
    payDebug('openPayPopup:blocked_no_open_method')
    return
  }
  try {
    opener.call(payPopupRef.value)
    payDebug('openPayPopup:opened')
  } catch (_) {
    uni.showToast({ title: '付款弹窗打开失败', icon: 'none' })
    payDebug('openPayPopup:open_error')
  }
}

function closePayPopup() {
  payDebug('closePayPopup:try')
  try {
    payPopupRef.value?.close?.()
    payDebug('closePayPopup:closed')
  } catch (_) {}
}

function onPayPopupChange(e) {
  payPopupVisible.value = !!e?.show
  payDebug('onPayPopupChange', {
    show: !!e?.show,
    payPopupVisible: payPopupVisible.value,
    payCodeModalVisible: payCodeModalVisible.value,
    openingPayCodeModal: openingPayCodeModal.value
  })
  if (e?.show) return
  if (payCodeModalVisible.value || openingPayCodeModal.value) return
  resetPayState()
}

function syncSelectedPayCodeChannel() {
  if (!selectedMethodIsQRCode.value) {
    selectedPayCodeChannel.value = ''
    payDebug('syncSelectedPayCodeChannel:clear_not_qrcode')
    return
  }
  const codes = selectedMethodCodeOptions.value
  if (!codes.length) {
    selectedPayCodeChannel.value = ''
    payDebug('syncSelectedPayCodeChannel:clear_no_codes')
    return
  }
  const current = String(selectedPayCodeChannel.value || '').toLowerCase()
  const exists = codes.some(item => String(item.channel || '').toLowerCase() === current)
  if (!exists) {
    selectedPayCodeChannel.value = String(codes[0].channel || '').toLowerCase()
    payDebug('syncSelectedPayCodeChannel:auto_select_first', {
      channel: selectedPayCodeChannel.value
    })
  }
}

function applyPayPopupDefaultSelection() {
  const methods = popupPaymentMethods.value
  payDebug('applyPayPopupDefaultSelection:before', {
    methods_count: methods.length,
    selected_payment_method_id: payPopupData.value?.selected_payment_method_id
  })
  if (!methods.length) {
    selectedPayMethodId.value = 0
    selectedPayCodeChannel.value = ''
    payDebug('applyPayPopupDefaultSelection:empty')
    return
  }

  const recommendedID = Number(payPopupData.value?.selected_payment_method_id || 0)
  const hasRecommended = methods.some(item => Number(item.id || 0) === recommendedID)
  selectedPayMethodId.value = hasRecommended ? recommendedID : Number(methods[0].id || 0)
  syncSelectedPayCodeChannel()
  payDebug('applyPayPopupDefaultSelection:after', {
    selectedPayMethodId: selectedPayMethodId.value,
    selectedPayCodeChannel: selectedPayCodeChannel.value
  })
}

function selectPayMethod(methodID) {
  selectedPayMethodId.value = Number(methodID || 0)
  syncSelectedPayCodeChannel()
  payDebug('selectPayMethod', {
    methodID: selectedPayMethodId.value,
    selectedMethodIsQRCode: selectedMethodIsQRCode.value,
    code_options_count: selectedMethodCodeOptions.value.length,
    selectedPayCodeChannel: selectedPayCodeChannel.value,
    selectedPayCodeUrl: selectedPayCodeUrl.value
  })
}

function selectPayCodeChannel(channel) {
  selectedPayCodeChannel.value = String(channel || '').toLowerCase()
  syncSelectedPayCodeChannel()
  payDebug('selectPayCodeChannel', {
    channel: selectedPayCodeChannel.value,
    selectedPayCodeUrl: selectedPayCodeUrl.value
  })
}

function formatPaymentMethodName(method) {
  const id = Number(method?.id || 0)
  if (id === PlanPaymentMethodAlipay) return '支付宝'
  if (id === PlanPaymentMethodQRCode) return '扫码转账'
  const name = String(method?.name || '').trim()
  if (!name) return `方式${id || ''}`
  return name
    .replace(/支付宝收款/g, '支付宝')
    .replace(/收款码收款/g, '扫码转账')
}

async function ensureCurrentUserUID() {
  const uid = Number(currentUserUID.value || global.userInfo?.id || uni.getStorageSync('userInfo')?.id || 0)
  if (uid > 0) {
    currentUserUID.value = uid
    return uid
  }
  const user = await asyncGetUserInfo()
  const fetchedUID = Number(user?.id || 0)
  if (fetchedUID > 0) {
    currentUserUID.value = fetchedUID
  }
  return fetchedUID
}

function resetPayProofForm() {
  payProofImages.value = []
  payMessage.value = ''
  payProofUploading.value = false
  payProofUploadText.value = ''
}

function previewPayProof(index) {
  const list = payProofImages.value
  if (!Array.isArray(list) || !list.length) return
  uni.previewImage({
    current: list[index] || list[0],
    urls: list
  })
}

function removePayProof(index) {
  const list = payProofImages.value.slice()
  if (index < 0 || index >= list.length) return
  list.splice(index, 1)
  payProofImages.value = list
}

async function choosePayProofImages() {
  const remain = 3 - payProofImages.value.length
  if (remain <= 0) {
    uni.showToast({ title: '最多上传3张截图', icon: 'none' })
    return
  }
  try {
    const files = await chooseImageList(remain)
    if (!Array.isArray(files) || !files.length) return
    payProofUploading.value = true
    payProofUploadText.value = '准备上传...'
    for (let i = 0; i < files.length; i++) {
      payProofUploadText.value = `上传中 (${i + 1}/${files.length})`
      const tk = await getQiniuToken()
      if (!tk?.token || !tk?.path) {
        throw new Error('获取上传凭证失败')
      }
      const ret = await uploadImageToQiniu(files[i], tk.token, tk.path)
      const url = ret?.imageUrl || ''
      if (!url) {
        throw new Error('上传失败，请重试')
      }
      payProofImages.value.push(url)
      if (payProofImages.value.length >= 3) break
    }
    payProofUploadText.value = ''
  } catch (e) {
    uni.showToast({ title: e?.message || '上传失败', icon: 'none' })
  } finally {
    payProofUploading.value = false
  }
}

function resetPayState() {
  payDebug('resetPayState:before', {
    selectedPayMethodId: selectedPayMethodId.value,
    selectedPayCodeChannel: selectedPayCodeChannel.value,
    payPopupVisible: payPopupVisible.value,
    payCodeModalVisible: payCodeModalVisible.value,
    openingPayCodeModal: openingPayCodeModal.value
  })
  payPopupData.value = null
  selectedPayMethodId.value = 0
  selectedPayCodeChannel.value = ''
  payPopupVisible.value = false
  openingPayCodeModal.value = false
  payCodeModalVisible.value = false
  resetPayProofForm()
  payDebug('resetPayState:after')
}

function saveCurrentPayCode() {
  const url = selectedPayCodeUrl.value
  if (!url) {
    uni.showToast({ title: '暂无可保存的二维码', icon: 'none' })
    return
  }

  // #ifdef H5
  window.open(url, '_blank')
  uni.showToast({ title: '已打开二维码图片', icon: 'none' })
  return
  // #endif

  uni.showLoading({ title: '保存中' })
  uni.getImageInfo({
    src: url,
    success: (info) => {
      uni.saveImageToPhotosAlbum({
        filePath: info.path,
        success: () => {
          uni.showToast({ title: '已保存到相册', icon: 'success' })
        },
        fail: () => {
          uni.showToast({ title: '保存失败，请检查相册权限', icon: 'none' })
        },
        complete: () => {
          uni.hideLoading()
        }
      })
    },
    fail: () => {
      uni.hideLoading()
      uni.showToast({ title: '二维码下载失败', icon: 'none' })
    }
  })
}

async function submitPayRequest(paymentMethod, paymentCodeChannel = '') {
  const proofImages = payProofImages.value.slice()
  const paymentMessage = String(payMessage.value || '').trim()
  payDebug('submitPayRequest:start', {
    submission_id: submission.submission_id,
    payment_method: Number(paymentMethod || 0),
    payment_code_channel: paymentCodeChannel || '',
    payment_proof_images_count: proofImages.length,
    payment_message_length: Array.from(paymentMessage).length
  })
  uni.showLoading({ title: '支付处理中' })
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/pay`,
      method: 'POST',
      header: { Authorization: uni.getStorageSync('token') },
      data: {
        submission_id: submission.submission_id,
        payment_method: Number(paymentMethod || 0),
        payment_code_channel: paymentCodeChannel || '',
        payment_proof_images: proofImages,
        payment_message: paymentMessage
      }
    })
    const body = res.data || {}
    payDebug('submitPayRequest:response', body)
    if (String(body.status).toLowerCase() !== 'success') {
      uni.showToast({ title: body.msg || '支付失败', icon: 'none' })
      payDebug('submitPayRequest:failed', body)
      return
    }
    closePayPopup()
    payCodeModalVisible.value = false
    uni.showToast({ title: '支付成功', icon: 'success' })
    if (global.lastRefresh) {
      global.lastRefresh.time = 0
    }
    fetchDetail()
    resetPayState()
  } catch (e) {
    payDebug('submitPayRequest:error', {
      message: e?.message || String(e)
    })
    uni.showToast({ title: '支付请求失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

function onPayGoButtonTap(source = 'tap') {
  const now = Date.now()
  if (now - payGoLastTriggerTs.value < 350) {
    payDebug('onPayGoButtonTap:dedupe', { source })
    return
  }
  payGoLastTriggerTs.value = now
  payDebug('onPayGoButtonTap', {
    source,
    payPopupVisible: payPopupVisible.value,
    disabled: !canSubmitPayFromPopup.value,
    selectedPayMethodId: selectedPayMethodId.value
  })
  confirmPayFromPopup()
}

function onPayCodeSaveTap(source = 'tap') {
  const now = Date.now()
  if (now - payCodeActionLastTriggerTs.value < 350) {
    payDebug('onPayCodeSaveTap:dedupe', { source })
    return
  }
  payCodeActionLastTriggerTs.value = now
  payDebug('onPayCodeSaveTap', {
    source,
    selectedPayCodeUrl: selectedPayCodeUrl.value
  })
  saveCurrentPayCode()
}

function onPayCodeDoneTap(source = 'tap') {
  const now = Date.now()
  if (now - payCodeActionLastTriggerTs.value < 350) {
    payDebug('onPayCodeDoneTap:dedupe', { source })
    return
  }
  payCodeActionLastTriggerTs.value = now
  payDebug('onPayCodeDoneTap', {
    source,
    selectedPayCodeChannel: selectedPayCodeChannel.value,
    selectedPayCodeUrl: selectedPayCodeUrl.value
  })
  confirmPayFromCodeModal()
}

async function confirmPayFromPopup() {
  payDebug('confirmPayFromPopup:clicked', {
    canSubmitPayFromPopup: canSubmitPayFromPopup.value,
    selectedPayMethodId: selectedPayMethodId.value,
    selectedMethodIsQRCode: selectedMethodIsQRCode.value,
    code_options_count: selectedMethodCodeOptions.value.length,
    selectedPayCodeChannel: selectedPayCodeChannel.value,
    selectedPayCodeUrl: selectedPayCodeUrl.value
  })
  if (!canSubmitPayFromPopup.value) {
    uni.showToast({ title: '请先完成付款方式选择', icon: 'none' })
    payDebug('confirmPayFromPopup:blocked_not_ready')
    return
  }

  if (selectedMethodIsQRCode.value) {
    if (!selectedMethodCodeOptions.value.length) {
      uni.showToast({ title: '当前付款方式暂无可用二维码', icon: 'none' })
      payDebug('confirmPayFromPopup:blocked_no_codes')
      return
    }
    resetPayProofForm()
    openingPayCodeModal.value = true
    payDebug('confirmPayFromPopup:qr_flow_start')
    closePayPopup()
    await new Promise(resolve => setTimeout(resolve, 180))
    syncSelectedPayCodeChannel()
    if (!selectedMethodCodeOptions.value.length) {
      openingPayCodeModal.value = false
      uni.showToast({ title: '当前付款方式暂无可用二维码', icon: 'none' })
      payDebug('confirmPayFromPopup:blocked_after_close_no_codes')
      return
    }
    payCodeModalVisible.value = true
    openingPayCodeModal.value = false
    payDebug('confirmPayFromPopup:qr_modal_opened', {
      selectedPayCodeChannel: selectedPayCodeChannel.value,
      selectedPayCodeUrl: selectedPayCodeUrl.value
    })
    return
  }

  resetPayProofForm()
  openingPayCodeModal.value = true
  payDebug('confirmPayFromPopup:online_flow_start')
  closePayPopup()
  await new Promise(resolve => setTimeout(resolve, 180))
  payCodeModalVisible.value = true
  openingPayCodeModal.value = false
  payDebug('confirmPayFromPopup:online_modal_opened')
}

async function confirmPayFromCodeModal() {
  syncSelectedPayCodeChannel()
  payDebug('confirmPayFromCodeModal:clicked', {
    selectedPayMethodId: selectedPayMethodId.value,
    selectedPayCodeChannel: selectedPayCodeChannel.value,
    selectedPayCodeUrl: selectedPayCodeUrl.value,
    payProofImagesCount: payProofImages.value.length,
    payMessageLength: payMessageLength.value
  })

  if (selectedMethodIsQRCode.value && !selectedPayCodeUrl.value) {
    uni.showToast({ title: '当前二维码不可用', icon: 'none' })
    payDebug('confirmPayFromCodeModal:blocked_no_url')
    return
  }
  if (!payProofImages.value.length) {
    uni.showToast({ title: '请上传转账截图（至少1张）', icon: 'none' })
    payDebug('confirmPayFromCodeModal:blocked_no_proof')
    return
  }
  if (payMessageLength.value < 2) {
    uni.showToast({ title: '请填写付款留言（至少2个字）', icon: 'none' })
    payDebug('confirmPayFromCodeModal:blocked_short_message')
    return
  }
  await submitPayRequest(
    Number(selectedPayMethodId.value || 0),
    String(selectedPayCodeChannel.value || '')
  )
}

async function handlePayAction() {
  payDebug('handlePayAction:start', {
    submission_id: submission.submission_id,
    status: submission.status,
    status_text: submission.status_text
  })
  uni.showLoading({ title: '加载付款方式' })
  try {
    await ensureCurrentUserUID()
    const payOptions = await fetchSubmissionPayOptions()
    const methods = Array.isArray(payOptions.payment_methods) ? payOptions.payment_methods : []
    payDebug('handlePayAction:methods_loaded', {
      methods_count: methods.length,
      methods: methods.map(item => ({
        id: item.id,
        name: item.name,
        code_options_count: Array.isArray(item.code_options) ? item.code_options.length : 0
      }))
    })
    if (!methods.length) {
      uni.showToast({ title: '卖家暂未配置可用付款方式', icon: 'none' })
      payDebug('handlePayAction:blocked_empty_methods')
      return
    }

    payPopupData.value = payOptions
    payCodeModalVisible.value = false
    resetPayProofForm()
    applyPayPopupDefaultSelection()
    await nextTick()
    openPayPopup()
  } catch (e) {
    payDebug('handlePayAction:error', {
      message: e?.message || String(e)
    })
    uni.showToast({ title: e?.message || '获取付款方式失败', icon: 'none' })
  } finally {
    uni.hideLoading()
    payDebug('handlePayAction:end')
  }
}

watch(payCodeModalVisible, (val) => {
  payDebug('watch:payCodeModalVisible', { value: val })
})

watch(payPopupVisible, (val) => {
  payDebug('watch:payPopupVisible', { value: val })
})

watch(selectedPayMethodId, (val) => {
  payDebug('watch:selectedPayMethodId', { value: val })
})

watch(selectedPayCodeChannel, (val) => {
  payDebug('watch:selectedPayCodeChannel', { value: val })
})

watch(canSubmitPayFromPopup, (val) => {
  payDebug('watch:canSubmitPayFromPopup', { value: val })
})

watch(
  () => payPopupVisible.value,
  (visible) => {
    setH5PageScrollLock(!!visible)
  },
  { immediate: true }
)

// 修改点：优化轮询逻辑
function startPolling(forceFirst = false) {
  fetchDetail(forceFirst)
   
  // 2. 如果定时器已存在，直接返回，避免创建多个定时器
  if (pollingTimer) return
   
  // 3. 启动新的定时器
  pollingTimer = setInterval(fetchDetail, 5000)
}

function stopPolling() {
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
  }
}

onLoad((opt) => {
  const snap = getCurrentPageSnapshot()
  const merged = Object.assign({}, opt || {}, snap?.opts || {})
  lastRouteKey.value = String(snap?.key || buildStableQueryString(merged) || '')
  applyRouteOptionsAndRefresh(merged, 'onLoad')
})
onShow(() => {
  bindH5HashChangeListener()
  const snap = getCurrentPageSnapshot()
  const newKey = String(snap?.key || '')
  const snapSubmissionID = Number(snap?.opts?.submission_id || 0)

  if (!lastRouteKey.value) {
    lastRouteKey.value = newKey
  } else if (newKey && newKey !== lastRouteKey.value) {
    lastRouteKey.value = newKey
    applyRouteOptionsAndRefresh(snap?.opts || {}, 'onShow-url-changed')
    return
  }

  if (snapSubmissionID > 0 && snapSubmissionID !== submissionId.value) {
    lastRouteKey.value = newKey || lastRouteKey.value
    applyRouteOptionsAndRefresh(snap?.opts || {}, 'onShow-id-mismatch')
    return
  }

  if (isLogin.value && submissionId.value) {
    ensureCurrentUserUID()
    startPolling(true)
  }
})
onHide(() => {
  unbindH5HashChangeListener()
  setH5PageScrollLock(false)
  stopPolling()
})
onUnload(() => {
  unbindH5HashChangeListener()
  setH5PageScrollLock(false)
  stopPolling()
})
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@500;700&display=swap');

/* --- 动画定义 --- */
@keyframes fadeSlideUp {
  0% {
    opacity: 0;
    transform: translateY(20rpx);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.anim-fade-up {
  animation: fadeSlideUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

.font-din {
  font-family: 'Roboto', 'Helvetica Neue', Helvetica, sans-serif;
  font-weight: 700;
  letter-spacing: 0.5px;
}
.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mt-20 { margin-top: 20rpx; }

$color-bg-grey: #f8f8f8;
$color-dark: #2B2B2B;
// 修改点：颜色改为 #8afdff
$color-accent: #c8feff; 
$spacing-page: 30rpx;

.page-container {
  min-height: 100vh;
  background-color: #fff;
}

.nav-back-pill {
  width: 58rpx;
  height: 58rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.88);
}

.nav-back-pill--offset {
  margin-left: 10rpx;
}

.nav-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-title-ellipsis {
  max-width: 360rpx;
  font-size: 30rpx;
  font-weight: 700;
  color: #1f1f1f;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ====== Header Banner (含模糊效果) ====== */
.header-banner-box {
  width: 100%;
  height: 520rpx;
  position: relative;
  border-bottom: none;
  box-sizing: border-box;
  overflow: hidden; // 确保模糊不溢出
}
.header-banner {
  width: 100%;
  height: 100%;
  display: block; 
  border: none;
}
/* 底部阴影渐变 */
.banner-overlay {
  position: absolute;
  top: 0; 
  left: 0; 
  right: 0; 
  bottom: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 60%);
  pointer-events: none;
  z-index: 1;
}

/* 左右两侧模糊效果 */
/* 使用 backdrop-filter 产生毛玻璃，配合 mask-image 实现渐变消失 */
// 修改点：宽度改为 120rpx
.banner-blur-left, .banner-blur-right {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 120rpx; 
  z-index: 2;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  pointer-events: none;
}
.banner-blur-left {
  left: 0;
  /* 从左侧完全可见渐变到右侧不可见 */
  -webkit-mask-image: linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%);
  mask-image: linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%);
}
.banner-blur-right {
  right: 0;
  /* 从右侧完全可见渐变到左侧不可见 */
  -webkit-mask-image: linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%);
  mask-image: linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%);
}

/* ====== 内容区域 ====== */
.content-wrapper {
  position: relative;
  margin-top: 20rpx; 
  padding: 0 $spacing-page;
  z-index: 10;
}

/* ====== 作者栏 ====== */
.section-artist {
  display: flex;
  align-items: center; 
  margin-bottom: 50rpx; /* 增大留白 */
  gap: 24rpx;
}

.artist-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 16rpx;
  background: #f0f0f0;
  flex-shrink: 0;
}

.artist-info-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}

.artist-texts {
  display: flex;
  flex-direction: column;
  margin-bottom: 12rpx;
}
.brand-name {
  font-size: 25rpx;
  font-weight: bold;
  color: #464646; 
  margin-bottom: 4rpx;
}
.plan-name {
  font-size: 24rpx;
  color: #999;
}

.chat-btn-row {
  display: flex;
}
.chat-pill {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

/* 修改点：赛博朋克文字容器 */
.cyber-text-box {
  position: relative;
  display: inline-block;
  /* 增加：行高防止高度异常 */
  line-height: 1;
  width: 100rpx;
  height: 22rpx;
}
.cyber-text {
  font-size: 24rpx;
  font-weight: bold;
  /* 增加：强制不换行 */
  white-space: nowrap;
}
.layer-1 {
  color: #ff0050; /* 红色底层 */
  z-index: 1;
  position: absolute;
  top: 0;
  left: 1rpx; /* 偏移 */
}
.layer-2 {
  color: #00f0ff; /* 蓝色顶层 */
  position: absolute;
  top: 0;
  left: -2rpx; /* 偏移 */
  z-index: 2;
  mix-blend-mode: multiply; /* 正片叠底，实现交错变色 */
  opacity: 0.8;
}

/* ====== 信息栏 (垂直列表布局) ====== */
.section-info-list {
  margin-top: 70rpx; /* 增大留白 */
  display: flex;
  flex-direction: column;
  gap: 54rpx; /* 增大行间距 */
}

.info-row-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.info-row-link {
  cursor: pointer;
}
.info-link-right {
  display: flex;
  align-items: center;
  gap: 8rpx;
}
.info-link-text {
  font-size: 22rpx;
  color: #6f7f88;
}

.info-label {
  font-size: 22rpx;
  color: #737373;
}

.info-val {
  font-size: 22rpx; /* 缩小字号 (24->22) */
  color: #464646;
  font-weight: bold;
}

/* 状态小标签 */
.status-badge-sm {
  display: flex;
  align-items: center;
  background: $color-accent;
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
  text {
    font-size: 22rpx; /* 这里也可以跟随缩小一点 */
    color: #262626;
  }
}
.status-text {
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
}

/* ====== Tab Bar (圆角30) ====== */
.tab-header-wrapper {
  margin-top: 70rpx; /* 增大留白 */
  display:flex;
  justify-content: space-between;
}
.custom-tab-bar {
  width: 300rpx;
  position: relative;
  height: 60rpx; 
  background-color: $color-dark;
  border-radius: 40rpx; 
  padding: 4rpx;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}
.tab-slider {
  position: absolute;
  top: 4rpx;
  bottom: 4rpx;
  background-color: $color-accent;
  border-radius: 28rpx; 
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  z-index: 1;
}
.tab-item {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s;
  cursor: pointer;
  text {
    color: #fff; /* 未选中时白色 */
  }
}
.tab-item.active {
  font-weight: 600;
  text {
    color: $color-dark; /* 选中时深色 */
  }
   
}
.tab-text {
  font-size: 24rpx;
  padding: 0 10rpx;
}

.tab-tip-text {
  text-align: right;
  font-size: 22rpx;
  color: #999;
  margin-top: 12rpx;
}

/* ====== Tab 内容 ====== */
.tab-content-wrapper {
  margin-top: 50rpx; /* 增大留白 */
  min-height: 400rpx;
}
.item-detail-card {
  display: flex;
  gap: 24rpx;
  background: #fff;
  border-radius: 24rpx;
  /* 去除原来的 padding 或保持简洁，这里使用 flex gap 控制间距 */
}
.item-detail-card.editable {
  cursor: pointer;
}
.item-detail-card.viewable {
  cursor: pointer;
}
.item-img {
  width: 180rpx;
  height: 180rpx;
  border-radius: 24rpx; 
  background: #f7f7f7;
  flex-shrink: 0;
}

/* 修改：垂直布局 Flex */
.item-info-col {
  flex: 1;
  height: 180rpx; /* 强制与图片等高 */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* 1:1:2 比例划分 */
.info-section-title {
  flex: 1; /* 1 */
  display: flex;
  align-items: flex-start; /* 顶部对齐 */
}
.info-section-tags {
  flex: 1; /* 1 */
  display: flex;
  align-items: center; /* 居中 */
}
.info-section-price {
  flex: 2; /* 2 - 占比最大 */
  display: flex;
  align-items: flex-end; /* 底部对齐 */
  justify-content: space-between; /* 价格在左，箭头在右 */
}

.item-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  max-width: 360rpx;
  /* 限制行数 */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}

.item-tags-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.spec-tag {
  font-size: 22rpx;
  color: #666;
  padding: 2rpx 0;
}
/* 修改点：第一个Tag的样式 */
.spec-tag.tag-primary {
  background-color: $color-accent;
  color: #262626;
  padding: 6rpx 16rpx; /* 合理的 Padding */
  border-radius: 8rpx;
}

.divider-dash {
  color: #ccc;
  font-size: 20rpx;
}

.item-price-row {
  color: #464646;
  font-weight: bold;
  .currency { font-size: 24rpx; margin-right: 4rpx; margin-bottom: 4rpx;}
  .amount { font-size: 40rpx; line-height: 1; }
}

.item-view-detail {
  font-size: 22rpx;
  color: #7f8a97;
  line-height: 1.2;
  margin-bottom: 8rpx;
}

/* 进度 */
.timeline-area {
  margin-top: 60rpx; /* 增大留白 */
  padding-left: 10rpx;
}
.timeline-header {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 30rpx; /* 增大留白 */
  color: #333;
}
.timeline-list,
.timeline-empty-box {
  position: relative;
  padding-left: 0;
}
.timeline-row {
  position: relative;
  padding: 4rpx 0 44rpx 40rpx;
}
.timeline-dot {
  position: absolute;
  left: 0;
  top: 22rpx;
  transform: translateY(-50%);
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  background: #b7c3cc;
  z-index: 2;
  &.active {
    background: $color-accent;
    box-shadow: 0 0 0 6rpx rgba(138, 253, 255, 0.4);
  }
  &.pending {
    background: #9ac7d4;
  }
  &.done {
    background: #7fdbe7;
  }
  &.rejected {
    background: #b9bec4;
  }
}
.timeline-line {
  position: absolute;
  left: 9rpx;
  top: 30rpx;
  bottom: 0;
  width: 2rpx;
  background: #eee;
  z-index: 1;
}
.timeline-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  min-height: 40rpx;
}
.timeline-text-box {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  padding-top: 2rpx;
}
.t-title {
  font-size: 28rpx;
  color: #30353a;
  font-weight: 500;
  line-height: 1.35;
}
.t-desc {
  font-size: 24rpx;
  color: #86909c;
  line-height: 1.5;
}
.timeline-image-list {
  margin-top: 10rpx;
  display: flex;
  gap: 10rpx;
  flex-wrap: wrap;
}
.timeline-image,
.timeline-image-more {
  width: 108rpx;
  height: 108rpx;
  border-radius: 12rpx;
  background: #edf2f8;
}
.timeline-image-more {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #657081;
  font-size: 24rpx;
  font-weight: 600;
}
.t-time {
  font-size: 22rpx;
  color: #a0a7af;
  flex-shrink: 0;
}
.timeline-action-row {
  margin-top: 14rpx;
  display: flex;
  gap: 14rpx;
}
.timeline-action-btn {
  min-width: 120rpx;
  height: 54rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  &.reject {
    color: #7a8790;
    background: #f2f4f6;
  }
  &.approve {
    color: #2e3338;
    background: #dffbfe;
  }
  &.disabled {
    opacity: 0.6;
  }
}
.timeline-empty-box {
  padding: 0 0 12rpx 40rpx;
}
.timeline-empty-box .timeline-dot {
  top: 22rpx;
  transform: translateY(-50%);
}

/* 新增 & 草稿 */
.add-new-card {
  height: 240rpx;
  border: 2rpx dashed #d1d5db;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 40rpx;
}
// 修改点：缩小圆圈到 64rpx
.add-icon-circle {
  width: 44rpx;
  height: 44rpx;
  background: $color-accent;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
}
.add-text {
  font-size: 26rpx;
  color: #666;
}
.locked-empty-tip {
  text-align: center;
  font-size: 26rpx;
  color: #98a1a8;
  padding: 80rpx 0 30rpx;
}
.plain-empty-tip {
  text-align: center;
  font-size: 26rpx;
  color: #98a1a8;
  padding: 80rpx 0 30rpx;
}
.draft-picker-area .draft-title {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 20rpx;
}
.draft-scroll-view {
  white-space: nowrap;
  width: 100%;
}
.draft-list {
  display: flex;
  gap: 20rpx;
  padding-bottom: 20rpx;
}
.draft-item {
  width: 200rpx;
  height: 260rpx;
  position: relative;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.08);
  display: inline-block;
}
.draft-thumb {
  width: 100%;
  height: 100%;
  background: #eee;
}
.draft-mask {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}
.draft-item:active .draft-mask { opacity: 1; }
.draft-use-btn {
  color: #fff;
  border: 2rpx solid #fff;
  padding: 4rpx 16rpx;
  border-radius: 99rpx;
  font-size: 24rpx;
}
.draft-name {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  background: #fff;
  padding: 10rpx;
  font-size: 22rpx;
  text-align: center;
  color: #333;
}

.safe-area-bottom {
  height: 200rpx;
}
.fixed-bottom-bar {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  background: #fff;
  padding: 20rpx 30rpx calc(20rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 16rpx rgba(0,0,0,0.05);
  z-index: 100;
}

.overview-modal {
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  padding: 30rpx 28rpx 28rpx;
  box-sizing: border-box;
  overscroll-behavior: contain;
}

.overview-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18rpx;
}

.overview-modal-title {
  font-size: 32rpx;
  color: #2b2b2b;
  font-weight: 700;
}

.overview-modal-refresh {
  font-size: 24rpx;
  color: #7c8a91;
  padding: 6rpx 10rpx;
}

.overview-modal-scroll {
  max-height: 62vh;
  overscroll-behavior: contain;
}

.overview-loading-wrap {
  padding: 40rpx 0;
  display: flex;
  justify-content: center;
}

.overview-state-text {
  font-size: 24rpx;
  color: #87929a;
  text-align: center;
  padding: 40rpx 0;
}

.overview-error-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.overview-retry-btn {
  min-width: 132rpx;
  height: 56rpx;
  line-height: 56rpx;
  text-align: center;
  border-radius: 999rpx;
  border: 2rpx solid #d6dee4;
  font-size: 24rpx;
  color: #59656d;
}

.overview-sections {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
}

.overview-empty-row {
  font-size: 22rpx;
  color: #98a1a8;
  padding: 16rpx 0;
}

.overview-item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14rpx;
  padding: 16rpx 0;
  border-top: 1rpx solid #eef2f5;
}

.overview-item-row:first-of-type {
  border-top: none;
}

.overview-item-main {
  flex: 1;
  min-width: 0;
}

.overview-item-title {
  display: block;
  font-size: 24rpx;
  color: #2f353a;
  font-weight: 600;
}

.overview-item-order-id {
  display: inline-block;
  margin-bottom: 6rpx;
  padding: 2rpx 12rpx;
  border-radius: 999rpx;
  background: #eef3f5;
  font-size: 20rpx;
  color: #66757f;
}

.overview-item-status {
  display: block;
  margin-top: 6rpx;
  font-size: 21rpx;
  color: #7d888f;
}

.overview-item-progress {
  display: block;
  margin-top: 4rpx;
  font-size: 21rpx;
  color: #9aa4ab;
}

.overview-item-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 6rpx;
  flex-shrink: 0;
}

.overview-item-time {
  font-size: 20rpx;
  color: #a3adb4;
}

.overview-current-marker {
  display: inline-flex;
  align-items: center;
  gap: 4rpx;
}

.overview-current-label {
  font-size: 20rpx;
  color: #7b8792;
}

.overview-current-arrow {
  font-size: 24rpx;
  color: #5d6b77;
  animation: overviewArrowMove 1.1s ease-in-out infinite;
}

.overview-tail-tip {
  margin-top: 16rpx;
  text-align: center;
  font-size: 21rpx;
  color: #9aa4ab;
}

@keyframes overviewArrowMove {
  0% {
    transform: translateX(0);
    opacity: 0.65;
  }
  50% {
    transform: translateX(8rpx);
    opacity: 1;
  }
  100% {
    transform: translateX(0);
    opacity: 0.65;
  }
}

.pay-sheet {
  background: #fff;
  border-radius: 28rpx 28rpx 0 0;
  padding: 28rpx 28rpx calc(28rpx + env(safe-area-inset-bottom));
}

.pay-sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.pay-sheet-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #2b2b2b;
}

.pay-sheet-close {
  font-size: 24rpx;
  color: #8a8a8a;
  padding: 8rpx 0 8rpx 12rpx;
}

.pay-method-list {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.pay-method-item {
  border-radius: 18rpx;
  border: 2rpx solid #ececec;
  padding: 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pay-method-item.active {
  border-color: #84f6ff;
  background: #f5feff;
}

.pay-method-main {
  flex: 1;
  min-width: 0;
}

.pay-method-name {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #2f2f2f;
}

.pay-method-desc {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #858585;
  line-height: 1.5;
  white-space: pre-wrap;
}

.pay-method-check {
  margin-left: 18rpx;
  font-size: 22rpx;
  color: #39b8c4;
}

.pay-code-tabs {
  display: flex;
  gap: 12rpx;
  margin-bottom: 24rpx;
  flex-wrap: wrap;
}

.pay-code-tab {
  min-width: 120rpx;
  text-align: center;
  padding: 10rpx 16rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  color: #6e6e6e;
  background: #eceff1;
}

.pay-code-tab.active {
  background: #d6fcff;
  color: #2b2b2b;
  font-weight: 600;
}

.pay-code-image-card {
  border: 2rpx solid #e8edf1;
  border-radius: 20rpx;
  background: #f9fbfc;
  padding: 24rpx;
}

.pay-code-image-box {
  width: 100%;
  min-height: 400rpx;
  border-radius: 14rpx;
  background: #fff;
  border: 2rpx solid #e6ecf1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx;
  box-sizing: border-box;
}

.pay-code-image {
  width: 340rpx;
  height: 340rpx;
}

.pay-code-empty {
  color: #9b9b9b;
  font-size: 24rpx;
}

.pay-method-tip {
  margin-top: 20rpx;
  padding: 20rpx;
  border-radius: 16rpx;
  background: #f8fbfc;
  color: #666;
  font-size: 24rpx;
  line-height: 1.6;
}

.pay-action-row {
  margin-top: 24rpx;
}

.pay-go-btn {
  width: 100%;
  border-radius: 999rpx;
  height: 84rpx;
  line-height: 84rpx;
  font-size: 28rpx;
  border: none;
  background: #2b2b2b;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pay-go-btn::after {
  border: none;
}

.pay-go-btn.disabled {
  opacity: 0.5;
}

.pay-code-modal {
  width: 100%;
  height: 78vh;
  max-height: 78vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.pay-scroll-hint-layer {
  position: absolute;
  inset: 0;
  z-index: 8;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.pay-scroll-hint {
  pointer-events: none;
}

.pay-code-modal-header {
  flex-shrink: 0;
}

.pay-code-scroll-wrap {
  position: relative;
  flex: 1;
  min-height: 0;
  margin-top: 22rpx;
}

.pay-code-modal-title {
  text-align: center;
  font-size: 32rpx;
  font-weight: 700;
  color: #2b2b2b;
  margin-bottom: 10rpx;
}

.pay-uid-tip {
  text-align: center;
  font-size: 24rpx;
  color: #65727a;
}

.pay-code-scroll-area {
  width: 100%;
  height: 100%;
}

.pay-code-scroll-inner {
  padding-right: 4rpx;
  padding-bottom: 18rpx;
}

.pay-online-tip {
  border-radius: 14rpx;
  background: #f5f8fa;
  color: #5f6870;
  font-size: 24rpx;
  line-height: 1.6;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.pay-code-modal-actions {
  flex-shrink: 0;
  margin-top: 20rpx;
  display: flex;
  gap: 20rpx;
}

.pay-code-modal-actions.single .pay-modal-done-btn {
  width: 100%;
}

.pay-modal-save-btn,
.pay-modal-done-btn {
  flex: 1;
  border-radius: 999rpx;
  height: 92rpx;
  line-height: 92rpx;
  font-size: 30rpx;
  border: none;
}

.pay-modal-save-btn::after,
.pay-modal-done-btn::after {
  border: none;
}

.pay-modal-save-btn {
  background: #eef6f8;
  color: #3f646d;
}

.pay-modal-save-btn[disabled] {
  opacity: 0.45;
  color: #8d9aa0;
}

.pay-modal-done-btn {
  background: #2b2b2b;
  color: #fff;
}

.pay-modal-done-btn[disabled] {
  opacity: 0.5;
}

.pay-code-bottom-gap {
  flex-shrink: 0;
  height: calc(20rpx + env(safe-area-inset-bottom));
}

.pay-proof-card,
.pay-message-card {
  margin-top: 20rpx;
  border-radius: 18rpx;
  border: 2rpx solid #e8edf1;
  background: #f9fbfc;
  padding: 20rpx;
}

.pay-proof-label-row {
  display: flex;
  align-items: center;
  gap: 6rpx;
  margin-bottom: 14rpx;
}

.pay-proof-label {
  font-size: 24rpx;
  color: #2e3940;
  font-weight: 600;
}

.pay-proof-required {
  color: #d06262;
  font-size: 24rpx;
}

.pay-proof-list {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
}

.pay-proof-item,
.pay-proof-add {
  width: 140rpx;
  height: 140rpx;
  border-radius: 12rpx;
  overflow: hidden;
  position: relative;
}

.pay-proof-item {
  border: 2rpx solid #e2e9ef;
  background: #fff;
}

.pay-proof-image {
  width: 100%;
  height: 100%;
}

.pay-proof-remove {
  position: absolute;
  right: 6rpx;
  top: 6rpx;
  width: 32rpx;
  height: 32rpx;
  border-radius: 999rpx;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  text-align: center;
  line-height: 30rpx;
  font-size: 24rpx;
}

.pay-proof-add {
  border: 2rpx dashed #c7d4df;
  background: #f4f8fb;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.pay-proof-add-icon {
  font-size: 34rpx;
  line-height: 1;
  color: #5f7a8d;
}

.pay-proof-add-text {
  margin-top: 8rpx;
  font-size: 20rpx;
  color: #6d808f;
}

.pay-proof-help {
  margin-top: 10rpx;
  font-size: 20rpx;
  color: #8a959d;
}

.pay-proof-uploading {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #4d6676;
}

.pay-message-input {
  width: 100%;
  min-height: 130rpx;
  background: #fff;
  border: 2rpx solid #e2e9ef;
  border-radius: 12rpx;
  font-size: 24rpx;
  color: #2d2d2d;
  line-height: 1.6;
  padding: 16rpx;
  box-sizing: border-box;
}

.pay-message-count {
  margin-top: 8rpx;
  display: block;
  text-align: right;
  font-size: 20rpx;
  color: #8a959d;
}

.action-btn {
  background: $color-dark;
  /* 1. 正常状态下显式定义文字颜色为白色 */
  color: #fff; 
  border-radius: 99rpx;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  transition: all 0.3s;
  
  /* 2. 核心修复：强制内部的特定类名继承父级颜色 */
  /* 这样无论父级是白色还是灰色，它们都会跟随 */
  .btn-price, .btn-label, .font-din {
    color: inherit !important;
  }

  /* 禁用状态样式 */
  &.disabled {
    background: #E0E0E0; /* 灰色背景 */
    /* 3. 禁用状态下显式定义文字颜色为灰色 */
    color: #999 !important; 
    box-shadow: none;
    
    /* 移除点击态效果 */
    &::after { display: none; }
  }
}
.btn-content {
  display: flex;
  align-items: center;
}
.btn-price {
  font-size: 32rpx;
}
.btn-divider {
  width: 2rpx;
  height: 24rpx;
  background: rgba(255,255,255,0.4);
  margin: 0 20rpx;
}
.btn-label {
  font-size: 30rpx;
  font-weight: 500;
}
.loading-mask {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  background: #fff; z-index: 999;
}
</style>
