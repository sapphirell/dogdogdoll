<template>
  <view-logs />
  <view class="submission-page">

    <scroll-view
      class="scroll-body"
      scroll-y
      :show-scrollbar="false"
    >
      <view v-if="!loading && !queueInfo" class="state-box state-error">
        <text class="state-title">获取失败</text>
        <text class="state-desc">{{ errorMsg || '暂时无法获取投递信息' }}</text>
        <button class="btn-retry" @tap="reload">重试</button>
      </view>

	      <view v-else-if="!loading" class="content">
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
            <text class="status-label">订单号</text>
            <text class="font-title">{{ submissionOrderNoText }}</text>
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
                  <text v-if="itemTabNeedAttention(item)" class="item-tab-attention-mark font-title">!</text>
                </view>
              </view>
            </scroll-view>

            <view
              v-if="activeItem"
              :key="`active-item-${getItemID(activeItem)}`"
              class="item-row item-row-active"
              @tap="goSubmissionItemDetail(activeItem)"
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
                    <text class="item-title font-alimamashuhei">
                      {{ getItemTitle(activeItem) }}
                    </text>
                    <view v-if="activeItemFinalConfirmed" class="item-title-tag item-title-tag-done font-alimamashuhei">
                      买家已确认
                    </view>
                  </view>

                  <view class="item-meta-row">
                    <view v-if="activeItem.size" class="item-meta">
                      <text class="item-meta-label font-title">尺寸</text>
                      <text class="item-meta-value">{{ activeItem.size }}</text>
                    </view>
                    <view v-if="activeItem.tier_title" class="item-meta">
                      <text class="item-meta-label font-title">档位</text>
                      <text class="item-meta-value">{{ activeItem.tier_title }}</text>
                    </view>
                    <view v-if="getAddonsTitles(activeItem)" class="item-meta">
                      <text class="item-meta-label font-title">加购</text>
                      <text class="item-meta-value">{{ getAddonsTitles(activeItem) }}</text>
                    </view>
                  </view>

                  <view class="item-meta-row">
                    <view class="item-meta">
                      <text class="item-meta-label font-title">状态</text>
                      <text class="item-meta-value">{{ formatItemStatus(activeItem.status) }}</text>
                    </view>
                  </view>

                  <view class="item-meta-row item-price-row">
                    <view class="item-meta item-meta-price">
                      <text class="item-meta-label font-title">金额</text>
                      <text class="item-price">
                        <text class="item-price-currency">¥</text>
                        <text class="item-price-number font-title">{{ formatPrice(calcItemTotal(activeItem)) }}</text>
                      </text>
                    </view>
                    <view v-if="Number(activeItem.adjust_price) !== 0" class="item-meta item-meta-price adjust">
                      <text class="item-meta-label font-title">调价</text>
                      <text class="item-price item-price-adjust">
                        <text class="item-price-sign">{{ activeItem.adjust_price > 0 ? '+' : '' }}</text>
                        <text class="item-price-number font-title">{{ formatPrice(activeItem.adjust_price) }}</text>
                      </text>
                    </view>
                  </view>

                  <view v-if="showBlankInfoCard(activeItem)" class="item-blank-card">
                    <view class="item-blank-head">
                      <text class="item-blank-title font-alimamashuhei">毛坯方案</text>
                      <view
                        v-if="Number(activeItem.blank_check_status || 0) > 0"
                        class="item-blank-check-tag font-alimamashuhei"
                        :class="{ replace: Number(activeItem.blank_check_status || 0) === 2 }"
                      >
                        {{ Number(activeItem.blank_check_status || 0) === 1 ? '毛坯可用' : '需要更换' }}
                      </view>
                    </view>
                    <text class="item-blank-mode">{{ blankSupplyModeText(activeItem.blank_supply_mode) }}</text>
                    <view v-if="activeItemBlankSnapshot" class="item-blank-picked">
                      <image
                        v-if="activeItemBlankSnapshot.cover_image"
                        class="item-blank-picked-cover"
                        :src="activeItemBlankSnapshot.cover_image"
                        mode="aspectFill"
                      />
                      <view class="item-blank-picked-main">
                        <text class="item-blank-picked-name font-alimamashuhei">{{ activeItemBlankSnapshot.blank_name || '已选毛坯' }}</text>
                        <text class="item-blank-picked-meta">
                          ¥{{ formatPrice(activeItemBlankSnapshot.price) }} · {{ activeItemBlankSnapshot.head_circumference || '头围待补充' }}
                        </text>
                      </view>
                    </view>
                    <text v-else-if="activeItemBlankIntroText" class="item-blank-fallback">
                      已选毛坯：{{ activeItemBlankIntroText }}
                    </text>
                    <text v-if="activeItem.blank_check_note" class="item-blank-note">说明：{{ activeItem.blank_check_note }}</text>
                    <text v-if="activeItem.blank_purchase_link" class="item-blank-link" @tap.stop="openPurchaseLink(activeItem.blank_purchase_link)">
                      购买链接：{{ activeItem.blank_purchase_link }}
                    </text>
                  </view>

                  <view v-if="showMaterialFlowInfo(activeItem)" class="item-material-card">
                    <view class="item-material-row" v-if="activeItem.buyer_express_no">
                      <text class="item-material-label font-title">寄送物流</text>
                      <text class="item-material-value">
                        {{ activeItem.buyer_express_company || '快递' }} {{ activeItem.buyer_express_no }}
                      </text>
                    </view>
                    <view class="item-material-row" v-if="Number(activeItem.artist_received_at || 0) > 0">
                      <text class="item-material-label font-title">签收状态</text>
                      <text class="item-material-value">已签收素材</text>
                    </view>
                  </view>
                </view>
              </view>

	              <view v-if="!activeItemFinalConfirmed" class="item-actions" @tap.stop>
                  <template v-if="showBlankReviewActions">
                    <button
                      class="btn-mini blank-replace"
                      :class="{ disabled: blankReviewSubmitting }"
                      :disabled="blankReviewSubmitting"
                      @tap="openBlankReviewModal"
                    >
                      需要更换
                    </button>
                  </template>
                  <button
                    v-if="canConfirmMaterialReceived(activeItem)"
                    class="btn-mini material-received"
                    :class="{
                      disabled: confirmMaterialSubmitting,
                      'with-attention-dot': materialConfirmButtonNeedAttention(activeItem)
                    }"
                    :disabled="confirmMaterialSubmitting"
                    @tap="handleConfirmMaterialReceived(activeItem)"
                  >
                    确认收到素材
                  </button>
	                <button
	                  class="btn-mini"
	                  @tap="openChangePricePanel(activeItem)"
	                >
	                  修改金额
	                </button>
	                <template v-if="showItemNegotiationActions">
	                  <button
	                    class="btn-mini negotiation-agree"
	                    :class="{ disabled: negotiationSubmitting }"
	                    :disabled="negotiationSubmitting"
	                    @tap="openNegotiationModal('agree')"
	                  >
	                    同意修改
	                  </button>
	                  <button
	                    class="btn-mini negotiation-reject"
	                    :class="{ disabled: negotiationSubmitting }"
	                    :disabled="negotiationSubmitting"
	                    @tap="openNegotiationModal('reject')"
	                  >
	                    拒绝修改
	                  </button>
	                </template>
	                <template v-else-if="submissionStatus === SUBMISSION_STATUS_PAID">
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
	                    {{ markFinishedBtnText }}
	                  </button>
	                </template>
	              </view>
	              <view
	                v-if="showItemNegotiationActions"
	                class="item-final-state pending"
	              >
	                买家已发起协商，请先处理协商请求
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
	          <view class="delivery-state-line" v-if="returnAddressRequested && !effectiveReturnAddressReady">
	            <text class="delivery-state-text">已发起结单，等待买家填写寄回地址</text>
	          </view>
	          <view class="delivery-address-block" v-if="effectiveReturnAddressInfo">
	            <text class="delivery-copy-btn" @tap="copyReturnAddress">复制地址</text>
	            <view class="delivery-address-main">
	              <view class="delivery-address-badge">寄</view>
	              <view class="delivery-address-content">
	                <view class="delivery-address-top">
	                  <text class="delivery-address-name">{{ effectiveReturnAddressInfo.receiver_name || '-' }}</text>
	                  <text class="delivery-address-phone">{{ effectiveReturnAddressInfo.receiver_phone || '-' }}</text>
	                </view>
	                <text class="delivery-address-line">{{ effectiveReturnAddressInfo.full_address || '' }}</text>
	              </view>
	            </view>
	          </view>
	          <view class="delivery-state-line" v-if="returnShipped">
	            <text class="delivery-state-text">已寄回：{{ returnExpressNoText || '-' }}</text>
	          </view>
	          <view class="delivery-state-line" v-if="returnReceived">
	            <text class="delivery-state-text">买家已确认结束</text>
	          </view>
	          <view class="delivery-state-line" v-if="reviewSubmitted">
	            <text class="delivery-state-text">买家已完成评价</text>
	          </view>
	          <view v-if="reviewInfo" class="delivery-review-block">
	            <view class="delivery-review-head">
	              <text class="delivery-review-title">订单评价</text>
	              <text v-if="reviewInfo.score > 0" class="delivery-review-score">{{ reviewInfo.score }} 星</text>
	            </view>
	            <text v-if="reviewInfo.content" class="delivery-review-content">{{ reviewInfo.content }}</text>
	            <view v-if="reviewInfo.images.length" class="delivery-review-images">
	              <image
	                v-for="(img, idx) in reviewInfo.images"
	                :key="`review-${idx}`"
	                class="delivery-review-image"
	                :src="img"
	                mode="aspectFill"
	                @tap="previewHistoryImages(reviewInfo.images, idx)"
	              />
	            </view>
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
	              订单收尾
	            </button>
	          </view>
	        </view>

          <view v-if="showReturnShipmentCard" class="card return-card">
            <view class="return-card-head">
              <view class="return-card-head-main">
                <text class="return-card-title font-alimamashuhei">寄回信息</text>
                <text class="return-card-desc">{{ returnShipmentHeadline }}</text>
              </view>
              <view class="return-status-pill">
                <text class="return-status-pill-text">{{ returnShipmentStatusText }}</text>
              </view>
            </view>

            <view class="return-express-panel">
              <view class="return-express-top">
                <text class="return-express-label font-title">快递单号</text>
                <text class="return-express-copy" @tap="copyReturnExpressNo">复制单号</text>
              </view>
              <view class="return-express-main">
                <text class="return-express-no font-title">{{ returnExpressNoText || '-' }}</text>
              </view>
            </view>

            <view class="return-progress-row">
              <view class="return-progress-item done">
                <view class="return-progress-dot"></view>
                <text class="return-progress-label">已寄回</text>
              </view>
              <view class="return-progress-line" :class="{ done: returnReceived }"></view>
              <view class="return-progress-item" :class="{ done: returnReceived }">
                <view class="return-progress-dot"></view>
                <text class="return-progress-label">{{ returnReceived ? '已完结' : '待确认结束' }}</text>
              </view>
              <view class="return-progress-line" :class="{ done: reviewSubmitted }"></view>
              <view class="return-progress-item" :class="{ done: reviewSubmitted }">
                <view class="return-progress-dot"></view>
                <text class="return-progress-label">{{ reviewSubmitted ? '已评价' : '待评价' }}</text>
              </view>
            </view>

            <view class="return-address-shell" v-if="effectiveReturnAddressInfo">
              <view class="return-address-head">
                <text class="return-address-title font-title">收件信息</text>
                <text class="return-address-copy" @tap="copyReturnAddress">复制地址</text>
              </view>
              <view class="return-address-main">
                <view class="return-address-badge">寄</view>
                <view class="return-address-body">
                  <view class="return-address-top">
                    <text class="return-address-name">{{ effectiveReturnAddressInfo.receiver_name || '-' }}</text>
                    <text class="return-address-phone font-title">{{ effectiveReturnAddressInfo.receiver_phone || '-' }}</text>
                  </view>
                  <text class="return-address-line">{{ effectiveReturnAddressInfo.full_address || '' }}</text>
                </view>
              </view>
            </view>

            <view v-if="reviewInfo" class="delivery-review-block return-review-block">
              <view class="delivery-review-head">
                <text class="delivery-review-title">订单评价</text>
                <text v-if="reviewInfo.score > 0" class="delivery-review-score">{{ reviewInfo.score }} 星</text>
              </view>
              <text v-if="reviewInfo.content" class="delivery-review-content">{{ reviewInfo.content }}</text>
              <view v-if="reviewInfo.images.length" class="delivery-review-images">
                <image
                  v-for="(img, idx) in reviewInfo.images"
                  :key="`review-${idx}`"
                  class="delivery-review-image"
                  :src="img"
                  mode="aspectFill"
                  @tap="previewHistoryImages(reviewInfo.images, idx)"
                />
              </view>
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
                  <view class="history-head-right">
                    <text class="history-time font-title">{{ event.timeText }}</text>
                    <text
                      v-if="event.copyText"
                      class="history-copy font-title"
                      @tap.stop="copyHistoryLogistics(event)"
                    >
                      复制单号
                    </text>
                  </view>
                </view>
                <text
                  v-if="event.desc"
                  class="history-desc"
                  :class="{ copyable: !!event.copyText }"
                  @tap.stop="handleHistoryDescTap(event)"
                >
                  {{ event.desc }}
                </text>
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

    <loading-toast :show="loading" text="正在获取投递详情..." />

    <view v-if="showBottomBar" class="bottom-bar" :style="{ bottom: bottomBarBottom }">
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
        
        <button
          v-if="canArtistConfirm"
          class="action-btn-large"
          :class="{ 'with-attention-dot': confirmSubmissionButtonNeedAttention }"
          @tap="handleConfirmSubmission"
        >
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
          <view class="price-row price-row-static">
            <text class="price-label">作品</text>
            <view class="price-field">
              <text class="price-value">
                {{ (editingItem.work_subject || '').trim() || '未命名作品' }}
              </text>
            </view>
          </view>

          <view class="price-row price-row-static">
            <text class="price-label">当前金额</text>
            <view class="price-field">
              <text class="price-value">
                ¥ {{ formatPrice(calcItemTotal(editingItem)) }}
              </text>
            </view>
          </view>

          <view class="price-row">
            <text class="price-label">新总金额</text>
            <view class="price-field">
              <input
                type="digit"
                class="price-input"
                v-model="priceInput"
                placeholder="请输入新的总金额"
              />
            </view>
          </view>

          <view class="price-row-column">
            <text class="price-label">调价说明（选填）</text>
            <text class="price-hint">这段说明会发给对方，简单说明原因即可</text>
            <textarea
              class="price-textarea"
              v-model="reasonInput"
              placeholder="例如：补色、更换材料、追加工序"
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
	        <text class="custom-modal-title">{{ markFinishedBtnText }}</text>
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

	    <common-modal v-model:visible="materialConfirmModalVisible" width="620rpx" :closeable="!confirmMaterialSubmitting">
	      <view class="custom-modal-content" style="padding-bottom: 40rpx;">
	        <text class="custom-modal-title">确认收到素材</text>
	        <text class="custom-modal-desc">确认你已收到买家寄送的素材吗？</text>
          <view v-if="materialConfirmHasExpressNo" class="material-confirm-logistics" @tap="copyMaterialConfirmExpressNo">
            <text class="material-confirm-logistics-label">买家寄送单号</text>
            <view class="material-confirm-logistics-main">
              <text class="material-confirm-logistics-value">{{ materialConfirmExpressText }}</text>
              <text class="material-confirm-logistics-copy">点击复制</text>
            </view>
          </view>
	        <view class="custom-modal-actions">
	          <button
	            class="custom-modal-btn cancel"
	            :disabled="confirmMaterialSubmitting"
	            @tap="materialConfirmModalVisible = false"
	          >
	            取消
	          </button>
	          <button
	            class="custom-modal-btn confirm"
	            :class="{ disabled: confirmMaterialSubmitting }"
	            :disabled="confirmMaterialSubmitting"
	            @tap="confirmMaterialReceivedByModal"
	          >
	            {{ confirmMaterialSubmitting ? '提交中...' : '确认收到' }}
	          </button>
	        </view>
	      </view>
	    </common-modal>

	    <common-modal v-model:visible="shipModalVisible" width="660rpx" :closeable="!shipSubmitting">
	      <view class="ship-form-modal">
	        <text class="ship-form-tip">{{ shipModalDescText }}</text>
	        <view v-if="creatorAddressInfo" class="ship-form-address-section">
	          <view class="ship-form-address-label-row">
	            <text class="ship-form-address-label-title">寄件信息</text>
	            <text class="ship-form-address-copy-action" @tap.stop="copyCreatorAddress">复制地址</text>
	          </view>
	          <view class="ship-form-address-card" @tap="copyCreatorAddress">
	            <view class="ship-form-address-badge">寄</view>
	            <view class="ship-form-address-content">
	              <view class="ship-form-address-top">
	                <text class="ship-form-address-name">{{ creatorAddressInfo.receiver_name || '-' }}</text>
	                <text class="ship-form-address-phone">{{ creatorAddressInfo.receiver_phone || '-' }}</text>
	              </view>
	              <text class="ship-form-address-line">{{ creatorAddressInfo.full_address || '-' }}</text>
	            </view>
	            <uni-icons type="right" size="18" color="#c0c8d7" />
	          </view>
	        </view>

	        <view class="ship-form-address-section">
	          <view class="ship-form-address-label-row">
	            <text class="ship-form-address-label-title">收件信息</text>
	            <text class="ship-form-address-copy-action" @tap.stop="copyReturnAddress">复制地址</text>
	          </view>
	          <view class="ship-form-address-card" @tap="copyReturnAddress">
	            <view class="ship-form-address-badge receive">收</view>
	            <view class="ship-form-address-content">
	              <view class="ship-form-address-top">
	                <text class="ship-form-address-name">{{ shipModalAddressName }}</text>
	                <text class="ship-form-address-phone">{{ shipModalAddressPhone }}</text>
	              </view>
	              <text class="ship-form-address-line">{{ shipModalAddressLine }}</text>
	            </view>
	            <uni-icons type="right" size="18" color="#c0c8d7" />
	          </view>
	        </view>

	        <view v-if="shipModalNeedExpress" class="ship-form-row">
	          <text class="ship-form-label">快递单号</text>
	          <view class="ship-form-row-right">
	            <input
	              v-model.trim="shipExpressNo"
	              class="ship-form-input"
	              placeholder="请填写"
	            />
	          </view>
	        </view>

	        <view v-if="shipModalNeedExpress" class="ship-form-row" @tap="chooseShipExpressCompany">
	          <text class="ship-form-label">快递公司</text>
	          <view class="ship-form-row-right">
	            <text class="ship-form-value" :class="{ placeholder: !shipExpressCompany }">
	              {{ shipExpressCompany || '请选择' }}
	            </text>
	            <uni-icons type="right" size="16" color="#c0c8d7" />
	          </view>
	        </view>

	        <button
	          class="ship-form-submit"
	          :class="{ disabled: shipModalConfirmDisabled }"
	          :disabled="shipModalConfirmDisabled"
	          @tap="submitShipBack"
	        >
	          {{ shipModalConfirmText }}
	        </button>
	      </view>
	    </common-modal>

	    <common-modal v-model:visible="negotiationModalVisible" width="620rpx" :closeable="!negotiationSubmitting">
	      <view class="custom-modal-content" style="padding-bottom: 40rpx;">
	        <text class="custom-modal-title">{{ negotiationModalTitle }}</text>
	        <text class="custom-modal-desc">{{ negotiationModalDesc }}</text>
	        <view class="custom-modal-actions">
	          <button
	            class="custom-modal-btn cancel"
	            :disabled="negotiationSubmitting"
	            @tap="negotiationModalVisible = false"
	          >
	            取消
	          </button>
	          <button
	            class="custom-modal-btn confirm"
	            :class="{ disabled: negotiationSubmitting }"
	            :disabled="negotiationSubmitting"
	            @tap="confirmNegotiationModal"
	          >
	            {{ negotiationSubmitting ? '提交中...' : negotiationModalConfirmText }}
	          </button>
	        </view>
	      </view>
	    </common-modal>

	    <common-modal v-model:visible="blankReviewModalVisible" width="640rpx" :closeable="!blankReviewSubmitting">
	      <view class="custom-modal-content" style="padding-bottom: 40rpx;">
          <text class="custom-modal-title">{{ blankReviewModalTitle }}</text>
          <text class="custom-modal-desc">{{ blankReviewModalDesc }}</text>
          <input
            v-model.trim="blankReviewPurchaseLink"
            class="blank-review-link-input"
            placeholder="可选填写：毛坯购买链接"
          />
          <textarea
            v-model.trim="blankReviewNote"
            class="blank-review-note-input"
            maxlength="180"
            auto-height
            placeholder="可选填写：备注说明（最多180字）"
          />
          <view class="custom-modal-actions">
            <button
              class="custom-modal-btn cancel"
              :disabled="blankReviewSubmitting"
              @tap="blankReviewModalVisible = false"
            >
              取消
            </button>
            <button
              class="custom-modal-btn confirm"
              :class="{ disabled: blankReviewSubmitting }"
              :disabled="blankReviewSubmitting"
              @tap="submitBlankReview"
            >
              {{ blankReviewSubmitting ? '提交中...' : '确认提交' }}
            </button>
          </view>
        </view>
	    </common-modal>

	    <common-modal v-model:visible="paymentStatusModalVisible" width="660rpx">
	      <view class="payment-modal-content">
	        <text class="payment-modal-title">扫码付款状态</text>

        <view v-if="paymentStatusLoading" class="payment-modal-state">
          <text class="state-desc">正在加载付款凭证...</text>
        </view>
        <view v-else-if="paymentStatusError" class="payment-modal-state">
          <text class="state-desc">{{ paymentStatusError }}</text>
          <view class="payment-modal-refresh" @tap="fetchPaymentStatusInfo">重试</view>
        </view>
        <view v-else class="payment-modal-scroll">
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

          <view class="payment-section" v-if="canApplyDispute && (showUnreceivedActions || showDisputeForm)">
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
        </view>

        <view class="payment-modal-footer">
          <button
            v-if="canApplyDispute && !paymentStatusLoading && !paymentStatusError"
            class="payment-modal-mini-btn"
            @tap="toggleUnreceivedActions"
          >
            我未收到款
          </button>
          <button class="payment-modal-ok-btn" @tap="closePaymentStatusModal">我知道了</button>
        </view>
      </view>
    </common-modal>

  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import CommonModal from '@/components/common-modal/common-modal.vue' 
import OrderStatus from '@/components/order_status/order_status.vue'
import LoadingToast from '@/components/loading-toast/loading-toast.vue'
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

const submissionOrderNoText = computed(() => {
  const orderID = String(queueInfo.value?.order_id || '').trim()
  if (orderID) return orderID
  const fallbackID = Number(queueInfo.value?.submission_id || submissionId.value || 0)
  return fallbackID > 0 ? `#${fallbackID}` : '--'
})

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

function goSubmissionItemDetail(item) {
  const sid = Number(submissionId.value || queueInfo.value?.submission_id || 0)
  const itemID = getItemID(item)
  if (!sid || !itemID) {
    uni.showToast({ title: '缺少投递信息', icon: 'none' })
    return
  }
  uni.navigateTo({
    url: `/pkg-creator/creator_order/submission_item_detail/submission_item_detail?submission_id=${sid}&item_id=${itemID}`
  })
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
const SUBMISSION_STATUS_RETURNED = 8
const SUBMISSION_STATUS_FINISHED = 9
const PAYMENT_METHOD_PLATFORM = 1
const PAYMENT_METHOD_QRCODE = 2
const PAY_STATUS_PENDING = 0
const PAY_STATUS_DEPOSIT_CONFIRMING = 1
const PAY_STATUS_DEPOSIT_PAID = 2
const PAY_STATUS_BALANCE_CONFIRMING = 3
const PAY_STATUS_PAID = 4
const STEP_LOG_EVENT_STEP_REJECT_NEGOTIATING = 'step_reject_negotiating'
const STEP_LOG_EVENT_FINAL_REJECT_NEGOTIATING = 'final_confirm_reject_negotiating'
const NEGOTIATION_STATE_PENDING_ARTIST = 'pending_artist_decision'

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
  if (submissionStatus.value === SUBMISSION_STATUS_FINISHED) {
    return '已结清'
  }
  if ([SUBMISSION_STATUS_PAID, SUBMISSION_STATUS_RETURNED].includes(submissionStatus.value)) {
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
const returnReceived = computed(() => !!queueInfo.value?.return_received)
const reviewSubmitted = computed(() => !!queueInfo.value?.review_submitted)
const returnExpressNoText = computed(() => String(queueInfo.value?.return_express_no || '').trim())
const reviewInfo = computed(() => {
  const raw = queueInfo.value?.review_info || queueInfo.value?.reviewInfo || null
  if (!raw || typeof raw !== 'object') return null
  const id = Number(raw.id || 0)
  const score = Number(raw.score || 0)
  const content = String(raw.content || '').trim()
  const createdAt = Number(raw.created_at || raw.createdAt || 0)
  const sourceImages = Array.isArray(raw.images) ? raw.images : []
  const images = sourceImages.map((item) => String(item || '').trim()).filter(Boolean)
  if (!id && !content && !images.length && score <= 0) return null
  return {
    id,
    score,
    content,
    created_at: createdAt,
    images,
  }
})
function parseAddressInfo(raw) {
  if (!raw || typeof raw !== 'object') return null
  const addressID = Number(raw.address_id ?? raw.addressId ?? raw.AddressID ?? 0)
  const receiverName = String(raw.receiver_name ?? raw.receiverName ?? raw.ReceiverName ?? '').trim()
  const receiverPhone = String(raw.receiver_phone ?? raw.receiverPhone ?? raw.ReceiverPhone ?? '').trim()
  const fullAddress = String(raw.full_address ?? raw.fullAddress ?? raw.FullAddress ?? '').trim()
  if (!receiverName && !receiverPhone && !fullAddress) return null
  return {
    address_id: addressID > 0 ? addressID : 0,
    receiver_name: receiverName,
    receiver_phone: receiverPhone,
    full_address: fullAddress
  }
}

const returnAddressInfo = computed(() => {
  return parseAddressInfo(queueInfo.value?.return_address_info || queueInfo.value?.returnAddressInfo || null)
})

const creatorAddressInfo = computed(() => {
  return parseAddressInfo(queueInfo.value?.creator_address_info || queueInfo.value?.creatorAddressInfo || null)
})
const progressLogs = computed(() => {
  const q = queueInfo.value || {}
  if (Array.isArray(q.progress_logs)) return q.progress_logs
  if (Array.isArray(q.progressLogs)) return q.progressLogs
  return []
})
const fallbackReturnAddressInfo = computed(() => {
  const logs = progressLogs.value
  if (!logs.length) return null
  let picked = null
  logs.forEach((row) => {
    const eventCode = String(row?.event_code || '').trim()
    const status = Number(row?.status || 0)
    if (eventCode !== 'return_address_submitted' || status !== 1) return
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
  if (!picked) return null
  const content = String(picked?.content || '').trim()
  if (!content) return { receiver_name: '', receiver_phone: '', full_address: '' }
  const reg = /买家已填写寄回地址[:：]\s*([^，,]+)[，,]\s*(.+?)[。.]?$/
  const m = content.match(reg)
  if (m && m.length >= 3) {
    return {
      receiver_name: String(m[1] || '').trim(),
      receiver_phone: '',
      full_address: String(m[2] || '').trim()
    }
  }
  return {
    receiver_name: '',
    receiver_phone: '',
    full_address: content.replace(/^买家已填写寄回地址[:：]?\s*/, '').replace(/[。.]$/, '').trim()
  }
})
const effectiveReturnAddressInfo = computed(() => {
  const direct = returnAddressInfo.value
  if (direct && (direct.receiver_name || direct.receiver_phone || direct.full_address)) return direct
  const fallback = fallbackReturnAddressInfo.value
  if (fallback && (fallback.receiver_name || fallback.receiver_phone || fallback.full_address)) return fallback
  return null
})
const effectiveReturnAddressReady = computed(() => {
  if (returnAddressReady.value) return true
  return !!effectiveReturnAddressInfo.value
})
const showDeliveryFlowCard = computed(() => {
  if (isBuyer.value) return false
  if (submissionStatus.value !== SUBMISSION_STATUS_PAID) return false
  if (showReturnShipmentCard.value) return false
  return (
    canCloseSubmissionAction.value ||
    canShipBackAction.value ||
    returnAddressRequested.value ||
    effectiveReturnAddressReady.value ||
    allItemsFinalConfirmed.value
  )
})

const showReturnShipmentCard = computed(() => {
  if (isBuyer.value) return false
  if (![SUBMISSION_STATUS_PAID, SUBMISSION_STATUS_RETURNED, SUBMISSION_STATUS_FINISHED].includes(submissionStatus.value)) return false
  return (
    returnShipped.value ||
    returnReceived.value ||
    reviewSubmitted.value ||
    !!reviewInfo.value
  )
})

const returnShipmentStatusText = computed(() => {
  if (returnReceived.value) return '已完结'
  return '已寄回'
})

const returnShipmentHeadline = computed(() => {
  if (reviewSubmitted.value) return '这次订单已经完结，买家也留下了评价'
  if (returnReceived.value) return '买家已经确认这次订单结束'
  return '作品已经寄出，等待买家确认结束'
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

function resolveLogisticsCopyText(row) {
  if (!row) return ''
  const eventCode = String(row?.event_code || '').trim()
  const logisticsEvents = new Set(['buyer_ship_material', 'return_shipped'])
  if (!logisticsEvents.has(eventCode)) return ''

  const extra = parseLogExtra(row)
  const expressNo = String(
    extra?.buyer_express_no ||
    extra?.return_express_no ||
    extra?.artist_express_no ||
    extra?.express_no ||
    ''
  ).trim()
  if (expressNo) return expressNo

  const content = String(row?.content || '').trim()
  if (!content) return ''
  const matched = content.match(/[A-Za-z0-9-]{8,}/g)
  if (!matched || !matched.length) return ''
  return String(matched[matched.length - 1] || '').trim()
}

function isRejectNegotiatingLog(row) {
  if (!row) return false
  const status = Number(row?.status || 0)
  if (status !== 0) return false
  const eventCode = String(row?.event_code || '').trim()
  if (
    eventCode === STEP_LOG_EVENT_STEP_REJECT_NEGOTIATING ||
    eventCode === STEP_LOG_EVENT_FINAL_REJECT_NEGOTIATING
  ) return true
  const extra = parseLogExtra(row)
  return String(extra?.negotiation_state || '').trim() === NEGOTIATION_STATE_PENDING_ARTIST
}

const activeItemPendingNegotiationLog = computed(() => {
  const itemID = Number(activeItem.value?.id || activeItem.value?.ID || 0)
  if (!itemID) return null
  let picked = null
  progressLogs.value.forEach((row) => {
    const logItemID = Number(row?.submission_item_id || row?.submissionItemID || row?.submissionItemId || 0)
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

const showItemNegotiationActions = computed(() => {
  if (isBuyer.value) return false
  if (submissionStatus.value !== SUBMISSION_STATUS_PAID) return false
  return !!activeItemPendingNegotiationLog.value
})

const activeItemFinalConfirmed = computed(() => {
  if (!activeItem.value) return false
  return !!getItemFinalState(activeItem.value).final_confirmed
})

const activeItemNegotiationIsFinal = computed(() => {
  const row = activeItemPendingNegotiationLog.value
  if (!row) return false
  const eventCode = String(row?.event_code || '').trim()
  if (eventCode === STEP_LOG_EVENT_FINAL_REJECT_NEGOTIATING) return true
  return Number(row?.log_type || 0) === 8
})

const negotiationModalVisible = ref(false)
const negotiationAction = ref('')
const negotiationSubmitting = ref(false)

const negotiationModalTitle = computed(() => {
  if (negotiationAction.value === 'reject') return '拒绝修改'
  return '同意修改'
})

const negotiationModalDesc = computed(() => {
  if (negotiationAction.value === 'reject') {
    if (activeItemNegotiationIsFinal.value) {
      return '确认拒绝修改最终状态吗？确认后将进入擦花寄回并扣定金流程。'
    }
    return '确认拒绝本次修改请求吗？确认后将按节点规则进入拒绝流程。'
  }
  if (activeItemNegotiationIsFinal.value) {
    return '确认同意修改最终状态吗？后续可重新提交最终状态给买家确认。'
  }
  return '确认同意按买家意见修改吗？后续可重新提交节点状态。'
})

const negotiationModalConfirmText = computed(() => {
  if (negotiationAction.value === 'reject') return '确认拒绝'
  return '确认同意'
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
        copyText: resolveLogisticsCopyText(row),
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
  if (!showBottomBar.value) return toPx(0)
  // 给 fixed 底栏留足空间，避免遮挡最后一段信息区。
  const barReservePx = uni?.upx2px ? uni.upx2px(144) : 80
  const floatGapPx = uni?.upx2px ? uni.upx2px(50) : 28
  return toPx(getFooterPlaceholderHeight() + barReservePx + floatGapPx)
})
const footerPadding = computed(() => {
  return toPx(getSafeBottom() + 40)
})
const bottomBarBottom = computed(() => {
  const floatGapPx = uni?.upx2px ? uni.upx2px(50) : 28
  return toPx(getSafeBottom() + floatGapPx)
})

const pricePopupRef = ref(null)
const editingItem = ref(null)
const priceInput = ref('')
const reasonInput = ref('')
const shipModalVisible = ref(false)
const shipExpressNo = ref('')
const shipExpressCompany = ref('')
const shipSubmitting = ref(false)
const shipFromCloseAction = ref(false)
const skipFirstOnShowRefresh = ref(true)
let queueInfoRequestSerial = 0
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
const blankReviewModalVisible = ref(false)
const blankReviewSubmitting = ref(false)
const blankReviewCheckStatus = ref(1)
const blankReviewNote = ref('')
const blankReviewPurchaseLink = ref('')
const confirmMaterialSubmitting = ref(false)
const materialConfirmModalVisible = ref(false)
const materialConfirmItemID = ref(0)
const blankStockSnapshotMap = ref({})
const blankStockSnapshotLoadingMap = ref({})

const materialConfirmItem = computed(() => {
  const targetID = Number(materialConfirmItemID.value || 0)
  if (!targetID) return null
  return items.value.find((row) => Number(row?.id || row?.ID || 0) === targetID) || null
})

const materialConfirmExpressNo = computed(() => {
  return String(materialConfirmItem.value?.buyer_express_no || '').trim()
})

const materialConfirmExpressCompany = computed(() => {
  return String(materialConfirmItem.value?.buyer_express_company || '').trim() || '快递'
})

const materialConfirmHasExpressNo = computed(() => !!materialConfirmExpressNo.value)

const materialConfirmExpressText = computed(() => {
  if (!materialConfirmExpressNo.value) return ''
  return `${materialConfirmExpressCompany.value} ${materialConfirmExpressNo.value}`
})

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

watch(negotiationModalVisible, (show) => {
  if (!show && !negotiationSubmitting.value) {
    negotiationAction.value = ''
  }
})

watch(blankReviewModalVisible, (show) => {
  if (show || blankReviewSubmitting.value) return
  blankReviewCheckStatus.value = 1
  blankReviewNote.value = ''
  blankReviewPurchaseLink.value = ''
})

watch(shipModalVisible, (show) => {
  if (!show && !shipSubmitting.value) {
    shipExpressNo.value = ''
    shipExpressCompany.value = ''
    shipFromCloseAction.value = false
  }
})

watch(materialConfirmModalVisible, (show) => {
  if (!show && !confirmMaterialSubmitting.value) {
    materialConfirmItemID.value = 0
  }
})

const shipModalNeedExpress = computed(() => !shipFromCloseAction.value || !!effectiveReturnAddressReady.value)
const shipModalTitleText = computed(() => {
  if (shipFromCloseAction.value) return '结单'
  return '订单收尾'
})
const shipModalDescText = computed(() => {
  if (shipFromCloseAction.value) {
    if (!effectiveReturnAddressReady.value) {
      return '买家尚未填写寄回地址，确认后将先发送填写地址提醒。'
    }
    return '为了保障您的交易安全，请确认您的寄件信息'
  }
  return '为了保障您的交易安全，请确认您的寄件信息'
})
const shipModalAddressName = computed(() => {
  const info = effectiveReturnAddressInfo.value || {}
  return String(info?.receiver_name || '').trim() || '-'
})
const shipModalAddressPhone = computed(() => {
  const info = effectiveReturnAddressInfo.value || {}
  return String(info?.receiver_phone || '').trim() || '-'
})
const shipModalAddressLine = computed(() => {
  const info = effectiveReturnAddressInfo.value || {}
  return String(info?.full_address || '').trim() || '买家尚未填写寄回地址'
})
const shipModalConfirmDisabled = computed(() => {
  if (shipSubmitting.value) return true
  if (!shipModalNeedExpress.value) return false
  if (!String(shipExpressNo.value || '').trim()) return true
  if (!String(shipExpressCompany.value || '').trim()) return true
  return false
})
const shipModalConfirmText = computed(() => {
  if (shipSubmitting.value) return '提交中...'
  if (shipFromCloseAction.value && !effectiveReturnAddressReady.value) return '发送提醒'
  return '提交'
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

const isHairOrder = computed(() => {
  const q = queueInfo.value || {}
  const artistType = Number(q.artist_type || q.artistType || 0)
  return artistType === 2
})
const creatorRoleText = computed(() => (isHairOrder.value ? '毛娘' : '妆师'))
const markFinishedBtnText = computed(() => (isHairOrder.value ? '我已做完' : '我已画完'))

const activeItemBlankSupplyMode = computed(() => {
  const row = activeItem.value || {}
  return normalizeBlankSupplyMode(row.blank_supply_mode || row.blankSupplyMode || '')
})

const activeItemBlankSnapshot = computed(() => {
  const row = activeItem.value || {}
  const localSnapshot = parseBlankStockSnapshot(
    row.blank_intro ||
      row.blankIntro ||
      row.blank_stock_snapshot ||
      row.blankStockSnapshot ||
      null
  )
  if (localSnapshot) return localSnapshot

  const blankStockID = getItemBlankStockID(row)
  if (blankStockID > 0 && blankStockSnapshotMap.value[blankStockID]) {
    return blankStockSnapshotMap.value[blankStockID]
  }

  const fallbackCover = normalizeImageArray(row.blank_image_urls || row.blankImageUrls || '')[0] || ''
  if (blankStockID > 0 || fallbackCover) {
    return {
      id: blankStockID,
      blank_name: blankStockID > 0 ? `毛坯 #${blankStockID}` : '已选毛坯',
      cover_image: fallbackCover,
      price: Number(row.blank_price || 0),
      head_circumference: String(row.blank_head_circumference || '').trim(),
    }
  }
  return null
})

const activeItemBlankIntroText = computed(() => {
  const row = activeItem.value || {}
  const raw = String(row.blank_intro || row.blankIntro || '').trim()
  if (!raw) return ''
  if (parseBlankStockSnapshot(raw)) return ''
  if (raw.startsWith('{') && raw.endsWith('}')) return ''
  return raw
})

const showBlankReviewActions = computed(() => {
  if (isBuyer.value) return false
  if (!isHairOrder.value) return false
  if (
    submissionStatus.value !== SUBMISSION_STATUS_BUYER_CONFIRMED &&
    submissionStatus.value !== SUBMISSION_STATUS_SELECTED_PAY
  ) return false
  if (!activeItem.value) return false
  return !!activeItemBlankSupplyMode.value
})

watch(
  () => [
    Number(queueInfo.value?.plan_id || queueInfo.value?.planId || 0),
    Number(getItemID(activeItem.value) || 0),
    activeItemBlankSupplyMode.value,
    getItemBlankStockID(activeItem.value || {}),
  ].join('|'),
  () => {
    ensureActiveItemBlankSnapshot()
  },
  { immediate: true }
)

const blankReviewModalTitle = computed(() => {
  return '毛坯需要更换'
})

const blankReviewModalDesc = computed(() => {
  return '确认后会将订单退回待买家确认，买家可重新编辑毛坯。你也可以补充购买链接。'
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
    case 2: return '待付款'
    case 3: return '已下单/进行中'
    case 4: return '未中选'
    case 5: return '已放弃'
    case 6: return '已过期'
    case 7: return '待寄送素材'
    case 8: return '素材寄送中'
    default: return '未知'
  }
}

function normalizeBlankSupplyMode(raw) {
  const val = String(raw || '').trim().toLowerCase()
  if (!val) return ''
  if (val === 'self' || val === 'third' || val === 'stock') return val
  return ''
}

function getItemBlankStockID(item) {
  return Number(item?.blank_stock_id || item?.blankStockId || 0)
}

function parseBlankStockSnapshot(raw) {
  if (!raw) return null
  if (typeof raw === 'object' && raw !== null) {
    const id = Number(raw.id || raw.blank_stock_id || 0)
    const coverFromList = normalizeImageArray(raw.image_urls || raw.imageUrls || '')[0] || ''
    const coverImage = String(raw.cover_image || raw.coverImage || coverFromList || '').trim()
    const blankName = String(raw.blank_name || raw.blankName || '').trim()
    const headCircumference = String(raw.head_circumference || raw.headCircumference || '').trim()
    const price = Number(raw.price || 0)
    const hasVisibleInfo =
      !!blankName ||
      !!coverImage ||
      !!headCircumference ||
      (Number.isFinite(price) && price > 0)
    // 兼容旧数据：即使没有 id，只要有可展示信息也允许渲染。
    if (id <= 0 && !hasVisibleInfo) return null
    return {
      id,
      blank_name: blankName,
      cover_image: coverImage,
      price: Number.isFinite(price) ? price : 0,
      head_circumference: headCircumference,
    }
  }
  const txt = String(raw || '').trim()
  if (!txt || !txt.startsWith('{')) return null
  try {
    const parsed = JSON.parse(txt)
    return parseBlankStockSnapshot(parsed)
  } catch (_) {
    return null
  }
}

function blankSupplyModeText(modeRaw) {
  const mode = normalizeBlankSupplyMode(modeRaw)
  if (mode === 'self') return '买家自带毛坯'
  if (mode === 'third') return '指定购买毛坯'
  if (mode === 'stock') return '选购现有毛坯'
  return '未设置'
}

async function ensureActiveItemBlankSnapshot() {
  const item = activeItem.value
  if (!item) return
  if (normalizeBlankSupplyMode(item.blank_supply_mode || item.blankSupplyMode || '') !== 'stock') return

  const blankStockID = getItemBlankStockID(item)
  if (blankStockID <= 0) return
  if (blankStockSnapshotMap.value[blankStockID]) return
  if (blankStockSnapshotLoadingMap.value[blankStockID]) return

  const planID = Number(queueInfo.value?.plan_id || queueInfo.value?.planId || 0)
  if (planID <= 0) return

  blankStockSnapshotLoadingMap.value = {
    ...blankStockSnapshotLoadingMap.value,
    [blankStockID]: true,
  }
  try {
    let snapshot = await fetchBlankStockSnapshotFromPlan(planID, blankStockID)
    if (!snapshot && !isBuyer.value) {
      snapshot = await fetchBlankStockSnapshotFromBrandManager(blankStockID)
    }
    if (snapshot) {
      blankStockSnapshotMap.value = {
        ...blankStockSnapshotMap.value,
        [blankStockID]: snapshot,
      }
    }
  } finally {
    const next = { ...blankStockSnapshotLoadingMap.value }
    delete next[blankStockID]
    blankStockSnapshotLoadingMap.value = next
  }
}

async function fetchBlankStockSnapshotFromPlan(planID, blankStockID) {
  const token = uni.getStorageSync('token') || ''
  if (!token) return null
  const size = 50
  const maxPages = 8

  for (let page = 1; page <= maxPages; page++) {
    const body = await new Promise((resolve) => {
      uni.request({
        url: `${websiteUrl.value}/with-state/artist-order/blank-stock/options`,
        method: 'GET',
        header: { Authorization: token },
        data: { plan_id: planID, page, size },
        success: (res) => resolve(res?.data || {}),
        fail: () => resolve({}),
      })
    })
    if (String(body?.status || '').toLowerCase() !== 'success') return null
    const data = body?.data || {}
    const list = Array.isArray(data.list) ? data.list : []
    const hit = list.find((row) => Number(row?.id || 0) === Number(blankStockID))
    if (hit) return parseBlankStockSnapshot(hit)

    const total = Number(data.total || 0)
    if (!list.length || (total > 0 && page * size >= total)) break
  }
  return null
}

async function fetchBlankStockSnapshotFromBrandManager(blankStockID) {
  const token = uni.getStorageSync('token') || ''
  if (!token) return null
  const body = await new Promise((resolve) => {
    uni.request({
      url: `${websiteUrl.value}/brand-manager/blank-stock/info`,
      method: 'GET',
      header: { Authorization: token },
      data: { id: Number(blankStockID || 0) },
      success: (res) => resolve(res?.data || {}),
      fail: () => resolve({}),
    })
  })
  if (String(body?.status || '').toLowerCase() !== 'success') return null
  const row = body?.data || null
  return parseBlankStockSnapshot(row)
}

function showBlankInfoCard(item) {
  if (!item || !isHairOrder.value) return false
  const mode = normalizeBlankSupplyMode(item.blank_supply_mode || item.blankSupplyMode || '')
  return !!mode
}

function showMaterialFlowInfo(item) {
  if (!item) return false
  const status = Number(item.status || 0)
  return (
    status === 7 ||
    status === 8 ||
    !!String(item.buyer_express_no || '').trim() ||
    Number(item.buyer_shipped_at || 0) > 0 ||
    Number(item.artist_received_at || 0) > 0
  )
}

function canConfirmMaterialReceived(item) {
  if (!item || isBuyer.value) return false
  if (submissionStatus.value !== SUBMISSION_STATUS_PAID) return false
  return Number(item.status || 0) === 8
}

function materialConfirmButtonNeedAttention(item) {
  return canConfirmMaterialReceived(item) && itemTabNeedAttention(item)
}

const confirmSubmissionButtonNeedAttention = computed(() => {
  if (!canArtistConfirm.value) return false
  if (!activeItem.value) return false
  return itemTabNeedAttention(activeItem.value)
})

function itemTabNeedAttention(item) {
  if (!item || isBuyer.value) return false
  const status = Number(item.status || 0)
  // 待创作者确认内容（待确认）/ 待创作者接收快递（素材寄送中）
  if (status === 2 || canConfirmMaterialReceived(item)) return true
  const state = getItemFinalState(item)
  // 节点或最终状态协商待创作者处理
  return !!state?.negotiation_pending
}

function openBlankReviewModal() {
  if (!showBlankReviewActions.value) {
    uni.showToast({ title: '当前状态不可操作', icon: 'none' })
    return
  }
  blankReviewCheckStatus.value = 2
  blankReviewNote.value = ''
  blankReviewPurchaseLink.value = String(activeItem.value?.blank_purchase_link || '').trim()
  blankReviewModalVisible.value = true
}

function openPurchaseLink(url) {
  const target = String(url || '').trim()
  if (!target) return
  uni.setClipboardData({
    data: target,
    success: () => uni.showToast({ title: '链接已复制', icon: 'none' }),
    fail: () => uni.showToast({ title: '复制失败，请稍后重试', icon: 'none' })
  })
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
  if (eventCode === 'final_product_confirmed') return '买家已确认最终状态'
  if (eventCode === 'return_address_request') return '订单收尾'
  if (eventCode === 'return_address_submitted') return '寄回地址已填写'
  if (eventCode === 'blank_check_approved') return '毛坯判断通过'
  if (eventCode === 'blank_check_replace') return '毛坯需要更换'
  if (eventCode === 'blank_purchase_link') return '毛坯购买链接'
  if (eventCode === 'buyer_ship_material') return '素材已寄送'
  if (eventCode === 'artist_receive_material') return '素材已签收'
  if (eventCode === 'return_shipped') return '创作者已寄回'
  if (eventCode === 'return_received') return '订单已完结'
  if (eventCode === 'trade_reviewed') return '买家已评价'
  return '进度更新'
}

function historyDesc(row) {
  const content = String(row?.content || '').trim()
  if (content) return content
  const eventCode = String(row?.event_code || '').trim()
  if (eventCode === 'step_request') return '创作者上传了进度图片。'
  if (eventCode === 'return_address_request') return '订单进入收尾阶段，等待买家填写寄回地址。'
  if (eventCode === 'return_address_submitted') return '买家已填写寄回地址。'
  if (eventCode === 'blank_check_approved') return '创作者已确认当前毛坯可用。'
  if (eventCode === 'blank_check_replace') return '创作者建议更换毛坯，等待买家重新寄送。'
  if (eventCode === 'blank_purchase_link') return '创作者已提供毛坯购买链接。'
  if (eventCode === 'buyer_ship_material') return '买家已提交素材寄送物流信息。'
  if (eventCode === 'artist_receive_material') return '创作者已确认收到买家寄送的素材。'
  if (eventCode === 'return_shipped') return '创作者已寄回，等待买家确认结束。'
  if (eventCode === 'return_received') return '买家已确认这次订单结束。'
  if (eventCode === 'trade_reviewed') return '买家已完成评价。'
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

function patchQueueInfoAfterCloseRequest() {
  if (!queueInfo.value) return
  queueInfo.value = {
    ...queueInfo.value,
    can_close_submission: false,
    return_address_requested: true
  }
}

function patchQueueInfoAfterShipBack(expressNo) {
  if (!queueInfo.value) return
  const next = {
    ...queueInfo.value,
    status: SUBMISSION_STATUS_RETURNED,
    status_text: '已寄回',
    can_close_submission: false,
    can_ship_back: false,
    return_address_requested: true,
    return_address_ready: true,
    return_shipped: true,
    return_express_no: String(expressNo || '').trim()
  }
  if (Array.isArray(queueInfo.value.items)) {
    next.items = queueInfo.value.items.map((item) => ({
      ...item,
      artist_express_no: String(expressNo || '').trim() || item?.artist_express_no || ''
    }))
  }
  queueInfo.value = next
}

async function fetchQueueInfo() {
  const ok = await ensureLogin()
  if (!ok) {
    loading.value = false
    errorMsg.value = '未登录'
    return null
  }

  const token = uni.getStorageSync('token') || ''
  if (!submissionId.value) {
    loading.value = false
    errorMsg.value = '缺少 submission_id'
    return null
  }

  const requestId = ++queueInfoRequestSerial
  loading.value = true
  errorMsg.value = ''

  return new Promise((resolve) => {
    uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/submission/queue-info`,
      method: 'GET',
      header: { Authorization: token },
      data: { submission_id: submissionId.value },
      success: (res) => {
        const body = res.data || {}
        if (requestId !== queueInfoRequestSerial) {
          resolve(body)
          return
        }
        if (body.status !== 'success') {
          errorMsg.value = body.msg || '获取排队信息失败'
          queueInfo.value = null
          resolve(body)
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
            ensureActiveItemBlankSnapshot()
        }
        resolve(body)
      },
      fail: () => {
        if (requestId === queueInfoRequestSerial) {
          errorMsg.value = '网络错误，请稍后重试'
          queueInfo.value = null
        }
        resolve(null)
      },
      complete: () => {
        if (requestId === queueInfoRequestSerial) {
          loading.value = false
        }
      },
    })
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

function closePaymentStatusModal() {
  paymentStatusModalVisible.value = false
  showUnreceivedActions.value = false
  showDisputeForm.value = false
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
  closePaymentStatusModal()
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

function submitBlankReview() {
  if (blankReviewSubmitting.value) return
  const itemID = Number(activeItem.value?.id || activeItem.value?.ID || 0)
  if (!itemID) {
    uni.showToast({ title: '缺少子单信息', icon: 'none' })
    return
  }
  ensureLogin().then((ok) => {
    if (!ok) return
    blankReviewSubmitting.value = true
    uni.showLoading({ title: '提交中' })
    const token = uni.getStorageSync('token') || ''
    uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/item/review-blank`,
      method: 'POST',
      header: { Authorization: token, 'Content-Type': 'application/json' },
      data: {
        item_id: itemID,
        check_status: Number(blankReviewCheckStatus.value || 1) === 2 ? 2 : 1,
        check_note: String(blankReviewNote.value || '').trim(),
        purchase_link: String(blankReviewPurchaseLink.value || '').trim(),
      },
      success: (res) => {
        const body = res.data || {}
        if (body.status !== 'success') {
          uni.showToast({ title: body.msg || '提交失败', icon: 'none' })
          return
        }
        blankReviewModalVisible.value = false
        const isReplace = Number(blankReviewCheckStatus.value || 0) === 2
        uni.showToast({ title: isReplace ? '已退回买家修改毛坯' : '毛坯判断已提交', icon: 'success' })
        fetchQueueInfo()
      },
      fail: () => {
        uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
      },
      complete: () => {
        blankReviewSubmitting.value = false
        uni.hideLoading()
      },
    })
  })
}

function handleConfirmMaterialReceived(item) {
  if (confirmMaterialSubmitting.value) return
  if (!canConfirmMaterialReceived(item)) {
    uni.showToast({ title: '当前状态不可操作', icon: 'none' })
    return
  }
  const itemID = Number(item?.id || item?.ID || 0)
  if (!itemID) {
    uni.showToast({ title: '缺少子单信息', icon: 'none' })
    return
  }
  materialConfirmItemID.value = itemID
  materialConfirmModalVisible.value = true
}

function confirmMaterialReceivedByModal() {
  if (confirmMaterialSubmitting.value) return
  const itemID = Number(materialConfirmItemID.value || 0)
  if (!itemID) {
    uni.showToast({ title: '缺少子单信息', icon: 'none' })
    return
  }
  ensureLogin().then((ok) => {
    if (!ok) return
    confirmMaterialSubmitting.value = true
    uni.showLoading({ title: '提交中' })
    const token = uni.getStorageSync('token') || ''
    uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/item/confirm-material-received`,
      method: 'POST',
      header: { Authorization: token, 'Content-Type': 'application/json' },
      data: { item_id: itemID },
      success: (res) => {
        const body = res.data || {}
        if (body.status !== 'success') {
          uni.showToast({ title: body.msg || '确认失败', icon: 'none' })
          return
        }
        materialConfirmModalVisible.value = false
        uni.showToast({ title: '已确认收到素材', icon: 'success' })
        fetchQueueInfo()
      },
      fail: () => {
        uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
      },
      complete: () => {
        confirmMaterialSubmitting.value = false
        uni.hideLoading()
      },
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
  if (isBuyer.value) return `仅${creatorRoleText.value}可提交节点状态`

  const status = Number(queueInfo.value.status || 0)
  if (status !== SUBMISSION_STATUS_PAID) {
    return '买家付款后才可提交节点状态'
  }

  const itemId = Number(item?.id || item?.ID || 0)
  if (!itemId) return '缺少子项ID'
  const itemStatus = Number(item?.status || 0)
  if (itemStatus === 7) return '买家寄送素材后才能提交节点状态'
  if (itemStatus === 8) return '请先确认收到素材再提交节点状态'
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

function openNegotiationModal(action) {
  if (!showItemNegotiationActions.value) {
    uni.showToast({ title: '当前无待处理协商', icon: 'none' })
    return
  }
  if (negotiationSubmitting.value) return
  if (!activeItemPendingNegotiationLog.value) {
    uni.showToast({ title: '当前无待处理协商', icon: 'none' })
    return
  }
  negotiationAction.value = action === 'reject' ? 'reject' : 'agree'
  negotiationModalVisible.value = true
}

function confirmNegotiationModal() {
  if (negotiationSubmitting.value) return
  submitNegotiationDecision()
}

function buildAddressText(info) {
  const name = String(info?.receiver_name || '').trim()
  const phone = String(info?.receiver_phone || '').trim()
  const addr = String(info?.full_address || '').trim()
  return [name, phone, addr].filter(Boolean).join(' ')
}

function copyReturnAddress() {
  const text = buildAddressText(effectiveReturnAddressInfo.value || {})
  if (!text) {
    uni.showToast({ title: '暂无地址可复制', icon: 'none' })
    return
  }
  uni.setClipboardData({
    data: text,
    success: () => {
      uni.showToast({ title: '地址已复制', icon: 'none' })
    },
    fail: () => {
      uni.showToast({ title: '复制失败，请稍后重试', icon: 'none' })
    }
  })
}

function copyCreatorAddress() {
  const text = buildAddressText(creatorAddressInfo.value || {})
  if (!text) {
    uni.showToast({ title: '暂无地址可复制', icon: 'none' })
    return
  }
  uni.setClipboardData({
    data: text,
    success: () => {
      uni.showToast({ title: '地址已复制', icon: 'none' })
    },
    fail: () => {
      uni.showToast({ title: '复制失败，请稍后重试', icon: 'none' })
    }
  })
}

function copyMaterialConfirmExpressNo() {
  const text = String(materialConfirmExpressNo.value || '').trim()
  if (!text) {
    uni.showToast({ title: '暂无单号可复制', icon: 'none' })
    return
  }
  uni.setClipboardData({
    data: text,
    success: () => {
      uni.showToast({ title: '单号已复制', icon: 'none' })
    },
    fail: () => {
      uni.showToast({ title: '复制失败，请稍后重试', icon: 'none' })
    }
  })
}

function copyReturnExpressNo() {
  const text = String(returnExpressNoText.value || '').trim()
  if (!text) {
    uni.showToast({ title: '暂无单号可复制', icon: 'none' })
    return
  }
  uni.setClipboardData({
    data: text,
    success: () => {
      uni.showToast({ title: '单号已复制', icon: 'none' })
    },
    fail: () => {
      uni.showToast({ title: '复制失败，请稍后重试', icon: 'none' })
    }
  })
}

function copyHistoryLogistics(event) {
  const text = String(event?.copyText || '').trim()
  if (!text) {
    uni.showToast({ title: '暂无单号可复制', icon: 'none' })
    return
  }
  uni.setClipboardData({
    data: text,
    success: () => {
      uni.showToast({ title: '单号已复制', icon: 'none' })
    },
    fail: () => {
      uni.showToast({ title: '复制失败，请稍后重试', icon: 'none' })
    }
  })
}

function handleHistoryDescTap(event) {
  if (!event?.copyText) return
  copyHistoryLogistics(event)
}

const shipCompanyOptions = [
  '顺丰速运',
  '京东快递',
  '中通快递',
  '圆通速递',
  '韵达快递',
  '申通快递',
  '极兔速递',
  'EMS',
  '邮政快递包裹'
]

function chooseShipExpressCompany() {
  if (!shipModalNeedExpress.value || shipSubmitting.value) return
  uni.showActionSheet({
    itemList: shipCompanyOptions,
    success: ({ tapIndex }) => {
      const idx = Number(tapIndex || 0)
      if (idx >= 0 && idx < shipCompanyOptions.length) {
        shipExpressCompany.value = shipCompanyOptions[idx]
      }
    }
  })
}

function requestCloseSubmission(token) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/submission/close`,
      method: 'POST',
      header: { Authorization: token, 'Content-Type': 'application/json' },
      data: { submission_id: submissionId.value },
      success: (res) => {
        const body = res?.data || {}
        if (body.status !== 'success') {
          reject(new Error(body.msg || '结单失败'))
          return
        }
        resolve(body)
      },
      fail: () => reject(new Error('网络异常，请稍后重试'))
    })
  })
}

function requestShipBack(token, expressNo) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/submission/ship-back`,
      method: 'POST',
      header: { Authorization: token, 'Content-Type': 'application/json' },
      data: {
        submission_id: submissionId.value,
        express_no: expressNo
      },
      success: (res) => {
        const body = res?.data || {}
        if (body.status !== 'success') {
          reject(new Error(body.msg || '提交失败'))
          return
        }
        resolve(body)
      },
      fail: () => reject(new Error('网络异常，请稍后重试'))
    })
  })
}

function submitNegotiationDecision() {
  const row = activeItemPendingNegotiationLog.value
  const logID = Number(row?.id || 0)
  if (!logID) {
    uni.showToast({ title: '缺少协商记录', icon: 'none' })
    return
  }
  const isReject = negotiationAction.value === 'reject'
  const action = isReject ? 'reject_modify' : 'agree_modify'
  ensureLogin().then((ok) => {
    if (!ok) return
    negotiationSubmitting.value = true
    const token = uni.getStorageSync('token') || ''
    uni.showLoading({ title: '提交中' })
    uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/step/reject-decision`,
      method: 'POST',
      header: {
        Authorization: token,
        'Content-Type': 'application/json'
      },
      data: {
        log_id: logID,
        action
      },
      success: (res) => {
        const body = res.data || {}
        if (body.status !== 'success') {
          uni.showToast({ title: body.msg || '处理失败', icon: 'none' })
          return
        }
        uni.showToast({ title: isReject ? '已拒绝修改' : '已同意修改', icon: 'success' })
        negotiationModalVisible.value = false
        negotiationAction.value = ''
        fetchQueueInfo()
      },
      fail: () => {
        uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
      },
      complete: () => {
        negotiationSubmitting.value = false
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
  shipFromCloseAction.value = true
  if (effectiveReturnAddressReady.value && !String(shipExpressNo.value || '').trim()) {
    shipExpressNo.value = String(returnExpressNoText.value || '').trim()
  }
  shipModalVisible.value = true
}

function openShipBackPanel() {
  if (!canShipBackAction.value) {
    uni.showToast({ title: '买家尚未填写寄回地址', icon: 'none' })
    return
  }
  shipFromCloseAction.value = false
  shipExpressNo.value = ''
  shipModalVisible.value = true
}

function closeShipBackPanel() {
  if (shipSubmitting.value) return
  shipModalVisible.value = false
}

async function submitShipBack() {
  if (shipSubmitting.value) return
  const needExpress = shipModalNeedExpress.value
  const expressNo = String(shipExpressNo.value || '').trim()
  if (needExpress && !expressNo) {
    uni.showToast({ title: '请填写快递单号', icon: 'none' })
    return
  }
  if (needExpress && !String(shipExpressCompany.value || '').trim()) {
    uni.showToast({ title: '请选择快递公司', icon: 'none' })
    return
  }
  const ok = await ensureLogin()
  if (!ok) return
  shipSubmitting.value = true
  uni.showLoading({ title: '提交中' })
  try {
    const token = uni.getStorageSync('token') || ''
    if (shipFromCloseAction.value) {
      await requestCloseSubmission(token)
      patchQueueInfoAfterCloseRequest()
      if (!effectiveReturnAddressReady.value) {
        uni.showToast({ title: '已提醒买家填写地址', icon: 'success' })
        shipModalVisible.value = false
        await fetchQueueInfo()
        return
      }
    }
    await requestShipBack(token, expressNo)
    patchQueueInfoAfterShipBack(expressNo)
    uni.showToast({
      title: shipFromCloseAction.value ? '结单并提交寄回成功' : '已提交寄回单号',
      icon: 'success'
    })
    shipModalVisible.value = false
    shipExpressNo.value = ''
    await fetchQueueInfo()
  } catch (e) {
    uni.showToast({ title: e?.message || '提交失败', icon: 'none' })
  } finally {
    shipSubmitting.value = false
    uni.hideLoading()
  }
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
:deep(.status-left-group .order-status.size-small) {
  height: 46rpx;
  min-height: 46rpx;
  padding: 0 14rpx;
  border-radius: 12rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
:deep(.status-left-group .order-status.size-small .order-status-text) {
  line-height: 1;
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
  line-height: 1.2;
}
.payment-status-row.clickable:active {
  opacity: 0.68;
}
.payment-status-right {
  display: flex;
  align-items: center;
  gap: 10rpx;
}
.payment-status-right .status-normal-text {
  display: inline-flex;
  align-items: center;
  line-height: 1;
}
.payment-method-tag {
  min-height: 38rpx;
  padding: 0 14rpx;
  border-radius: 999rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ffd9ef 0%, #dbe8ff 100%);
  box-shadow: inset 0 0 0 1rpx rgba(255, 255, 255, 0.55);
}
.payment-method-tag-text {
  font-size: 20rpx;
  font-weight: 600;
  color: #6f6ac8;
  line-height: 1;
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
  height: 46rpx;
  padding: 0 14rpx;
  border-radius: 12rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ffd98c 0%, #f4b54a 100%);
  box-shadow: 0 2rpx 6rpx rgba(226, 173, 78, 0.22);
}
.tag-text {
  font-size: 20rpx;
  color: #fff;
  font-weight: 700;
  line-height: 1;
  text-shadow: 0 1rpx 1rpx rgba(0, 0, 0, 0.08);
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
  flex: 0 1 auto;
  width: auto;
  max-width: calc(100% - 220rpx);
  display: flex;
  align-items: center;
  gap: 12rpx;
  background-color: #f7f9fd;
  padding: 8rpx 16rpx 8rpx 8rpx;
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
  flex: 0 1 auto;
  max-width: 340rpx;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.user-info-placeholder {
  flex: 0 1 auto;
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
  margin-top: 6rpx;
  overflow: visible;
  padding: 0 4rpx;
}

:deep(.item-tabs-scroll .uni-scroll-view) {
  overflow: visible !important;
}

:deep(.item-tabs-scroll .uni-scroll-view-content) {
  overflow: visible !important;
}

.item-tabs-wrap {
  display: inline-flex;
  align-items: stretch;
  gap: 14rpx;
  padding: 0 8rpx 12rpx;
}

.item-tab {
  position: relative;
  min-width: 206rpx;
  max-width: 292rpx;
  padding: 18rpx 28rpx 16rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #373b44 0%, #232730 100%);
  box-shadow: 0 8rpx 16rpx rgba(31, 39, 56, 0.16);
  box-sizing: border-box;
  text-align: center;
}

.item-tab.active {
  background: linear-gradient(135deg, #c9f3ff 0%, #a8ecff 100%);
  box-shadow: 0 10rpx 18rpx rgba(120, 218, 245, 0.26);
}

.item-tab-title {
  display: block;
  font-size: 28rpx;
  color: #f7fbff;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-tab-sub {
  display: block;
  margin-top: 6rpx;
  font-size: 17rpx;
  line-height: 1.2;
  color: rgba(230, 238, 249, 0.72);
}

.item-tab.active .item-tab-title {
  color: #203246;
}

.item-tab.active .item-tab-sub {
  color: rgba(48, 78, 104, 0.72);
}

.item-tab-attention-mark {
  position: absolute;
  right: 10rpx;
  top: -16rpx;
  display: inline-block;
  font-size: 55rpx;
  font-weight: 900;
  line-height: 1;
  color: #ffa4ce !important;
  -webkit-text-fill-color: #ffa4ce !important;
  opacity: 1 !important;
  letter-spacing: 0;
  text-shadow: 0 0 10rpx rgba(255, 164, 206, 0.45);
  z-index: 5;
  transform-origin: 50% 82%;
  animation: item-tab-attention-wobble 1s ease-in-out infinite;
}

.item-tab .item-tab-attention-mark,
.item-tab.active .item-tab-attention-mark {
  color: #ffa4ce !important;
  -webkit-text-fill-color: #ffa4ce !important;
}

@keyframes item-tab-attention-wobble {
  0% {
    transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
  }
  10% {
    transform: translate3d(-1rpx, 0, 0) rotate(-18deg) scale(1.02);
  }
  20% {
    transform: translate3d(1rpx, 0, 0) rotate(14deg) scale(1.02);
  }
  30% {
    transform: translate3d(-1rpx, 0, 0) rotate(-11deg) scale(1.01);
  }
  40% {
    transform: translate3d(1rpx, 0, 0) rotate(8deg) scale(1.01);
  }
  50% {
    transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
  }
  100% {
    transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
  }
}

/* item 行 */
.item-row {
  margin-top: 14rpx;
  padding: 12rpx 0 6rpx;
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
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 10rpx;
}
.item-title {
  flex: 1;
  min-width: 0;
  margin-right: 0;
  font-size: 31rpx;
  color: #1f2735;
  font-weight: 700;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.item-title-tag {
  flex-shrink: 0;
  align-self: flex-start;
  padding: 7rpx 16rpx 8rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  line-height: 1;
  color: #ffffff;
  background: linear-gradient(135deg, #7fdcc6 0%, #58c5a7 100%);
  box-shadow: 0 8rpx 18rpx rgba(88, 197, 167, 0.18);
  animation: itemTagFloat 2.4s ease-in-out infinite;
}

.item-title-tag-done {
  font-family: inherit;
}

.item-meta-row {
  margin-top: 12rpx;
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 8rpx 22rpx;
}
.item-meta {
  display: inline-flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8rpx;
  margin: 0;
  padding: 0;
  font-size: 24rpx;
  color: #5e6a7d;
  line-height: 1.6;
}
.item-meta-label {
  flex-shrink: 0;
  font-size: 20rpx;
  color: #9aa5b6;
  letter-spacing: 0.8rpx;
}
.item-meta-label::after {
  content: "·";
  margin-left: 6rpx;
  color: #cad2df;
}
.item-meta-value {
  color: #4f5a6a;
  word-break: break-all;
}
.item-price-row {
  align-items: center;
}
.item-meta.adjust {
  color: #c07a45;
}
.item-meta-price {
  align-items: center;
}
.item-price {
  display: inline-flex;
  align-items: baseline;
  gap: 4rpx;
  color: #30394a;
}
.item-price-currency,
.item-price-sign {
  font-size: 20rpx;
  color: #8592a6;
  line-height: 1;
}
.item-price-adjust .item-price-sign {
  color: #c07a45;
}
.item-price-number {
  font-size: 34rpx;
  line-height: 1;
  color: #2f3a4c;
}
.item-meta.adjust .item-price-number {
  color: #c07a45;
}

.item-blank-card {
  margin-top: 12rpx;
  padding: 18rpx;
  border-radius: 16rpx;
  background: #f4f8ff;
}
.item-blank-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10rpx;
}
.item-blank-title {
  font-size: 22rpx;
  color: #334158;
}
.item-blank-check-tag {
  padding: 6rpx 12rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  color: #1e6f54;
  background: #d7f5ea;
}
.item-blank-check-tag.replace {
  color: #9d4f37;
  background: #ffe6dc;
}
.item-blank-mode {
  display: block;
  margin-top: 8rpx;
  font-size: 23rpx;
  color: #4f5d74;
}
.item-blank-picked {
  margin-top: 12rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 10rpx 12rpx;
  border-radius: 14rpx;
  background: rgba(255, 255, 255, 0.9);
}
.item-blank-picked-cover {
  width: 84rpx;
  height: 84rpx;
  border-radius: 12rpx;
  background: #eef2f7;
  flex-shrink: 0;
}
.item-blank-picked-main {
  min-width: 0;
  flex: 1;
}
.item-blank-picked-name {
  display: block;
  font-size: 24rpx;
  color: #2f3a4f;
}
.item-blank-picked-meta {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #6a7b93;
}
.item-blank-fallback {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  color: #4f5d74;
  line-height: 1.6;
}
.item-blank-note {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  color: #67758b;
  line-height: 1.6;
}
.item-blank-link {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #3f79b2;
  line-height: 1.55;
  word-break: break-all;
}

.item-material-card {
  margin-top: 12rpx;
  padding: 16rpx 18rpx;
  border-radius: 16rpx;
  background: #f7f9fc;
}
.item-material-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12rpx;
}
.item-material-row + .item-material-row {
  margin-top: 8rpx;
}
.item-material-label {
  font-size: 22rpx;
  color: #92a0b4;
  flex-shrink: 0;
}
.item-material-value {
  font-size: 22rpx;
  color: #50607a;
  text-align: right;
  word-break: break-all;
}

/* item 操作按钮 */
.item-actions {
  margin-top: 14rpx;
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 12rpx;
}
.btn-mini {
  flex: 1 1 160rpx;
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
  overflow: visible !important;
}
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
.btn-mini.negotiation-agree {
  background: linear-gradient(135deg, #8fdcf8 0%, #72c7ec 100%);
  color: #ffffff;
}
.btn-mini.negotiation-reject {
  background: linear-gradient(135deg, #f4b8b8 0%, #e89898 100%);
  color: #ffffff;
}
.btn-mini.blank-ok {
  background: linear-gradient(135deg, #8fdcf8 0%, #72c7ec 100%);
  color: #ffffff;
}
.btn-mini.blank-replace {
  background: linear-gradient(135deg, #ffd0bc 0%, #f3a88c 100%);
  color: #ffffff;
}
.btn-mini.blank-link {
  background: linear-gradient(135deg, #d5dff5 0%, #b8c7ea 100%);
  color: #334260;
}
.btn-mini.material-received {
  background: linear-gradient(135deg, #95e8cf 0%, #65caac 100%);
  color: #ffffff;
}
.btn-mini.disabled {
  background-color: #e9edf3 !important;
  color: #a2acbb !important;
  box-shadow: none;
}
.btn-mini.with-attention-dot,
.action-btn-large.with-attention-dot {
  position: relative;
}
.btn-mini.with-attention-dot::before {
  content: '';
  position: absolute;
  right: -4rpx;
  top: -4rpx;
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #ff6fa6;
  box-shadow: 0 0 0 5rpx rgba(255, 111, 166, 0.2);
  z-index: 8;
  pointer-events: none;
}
.action-btn-large.with-attention-dot::before {
  content: '';
  position: absolute;
  right: -6rpx;
  top: -6rpx;
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: #ff6fa6;
  box-shadow: 0 0 0 6rpx rgba(255, 111, 166, 0.2);
  z-index: 8;
  pointer-events: none;
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

@keyframes itemTagFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4rpx);
  }
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
  padding: 16rpx 16rpx 14rpx;
  border-radius: 14rpx;
  background: #f6f9ff;
  position: relative;
}
.delivery-address-main {
  display: flex;
  align-items: flex-start;
  gap: 14rpx;
  padding-top: 20rpx;
}
.delivery-address-badge {
  width: 56rpx;
  height: 56rpx;
  border-radius: 16rpx;
  background: #fb8e68;
  color: #ffefa8;
  font-size: 30rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2rpx;
}
.delivery-address-content {
  flex: 1;
  min-width: 0;
}
.delivery-address-top {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 16rpx;
}
.delivery-copy-btn {
  position: absolute;
  top: 14rpx;
  right: 16rpx;
  z-index: 2;
  font-size: 26rpx;
  font-weight: 700;
  color: #ff9a3d;
  line-height: 1.2;
}
.delivery-address-name {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: #1f2735;
  line-height: 1.2;
}
.delivery-address-phone {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: #1f2735;
  line-height: 1.2;
}
.delivery-address-line {
  display: block;
  margin-top: 10rpx;
  font-size: 31rpx;
  line-height: 1.46;
  color: #8f97a6;
}
.delivery-review-block {
  margin-top: 12rpx;
  padding: 18rpx 18rpx 16rpx;
  border-radius: 16rpx;
  background: #f5f7fb;
}
.delivery-review-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}
.delivery-review-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #243042;
}
.delivery-review-score {
  font-size: 22rpx;
  color: #78daf5;
  font-weight: 700;
}
.delivery-review-content {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.6;
  color: #5f6c81;
}
.delivery-review-images {
  margin-top: 12rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}
.delivery-review-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 16rpx;
  background: #edf1f7;
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

.return-card {
  position: relative;
  overflow: hidden;
  padding-top: 24rpx;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  box-shadow: 0 16rpx 34rpx rgba(120, 146, 185, 0.08);
}

.return-card::before {
  content: "";
  position: absolute;
  right: -56rpx;
  top: -72rpx;
  width: 220rpx;
  height: 220rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(73, 202, 238, 0.2) 0%, rgba(73, 202, 238, 0) 72%);
  pointer-events: none;
}

.return-card::after {
  content: "";
  position: absolute;
  left: -48rpx;
  bottom: -84rpx;
  width: 190rpx;
  height: 190rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(136, 208, 231, 0.12) 0%, rgba(136, 208, 231, 0) 72%);
  pointer-events: none;
}

.return-card-head {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.return-card-head-main {
  flex: 1;
  min-width: 0;
}

.return-card-title {
  display: block;
  font-size: 32rpx;
  line-height: 1.2;
  color: #222d3d;
}

.return-card-desc {
  display: block;
  margin-top: 10rpx;
  font-size: 23rpx;
  line-height: 1.6;
  color: #7d8da3;
  max-width: 420rpx;
}

.return-status-pill {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  padding: 12rpx 20rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, rgba(73, 202, 238, 0.18) 0%, rgba(73, 202, 238, 0.34) 100%);
  box-shadow: 0 12rpx 26rpx rgba(73, 202, 238, 0.14);
}

.return-status-pill-text {
  font-size: 22rpx;
  line-height: 1;
  color: #2b6e84;
  font-weight: 700;
}

.return-express-panel {
  position: relative;
  z-index: 1;
  margin-top: 22rpx;
  padding: 20rpx 22rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #edf9ff 0%, #f8fcff 100%);
  box-shadow: inset 0 0 0 1rpx rgba(73, 202, 238, 0.14);
}

.return-express-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.return-express-label {
  font-size: 21rpx;
  color: #91a0b4;
  letter-spacing: 1rpx;
}

.return-express-copy {
  font-size: 23rpx;
  color: #78daf5;
  font-weight: 600;
}

.return-express-main {
  margin-top: 14rpx;
}

.return-express-no {
  display: block;
  font-size: 42rpx;
  line-height: 1.08;
  color: #233146;
  word-break: break-all;
}

.return-progress-row {
  position: relative;
  z-index: 1;
  margin-top: 22rpx;
  display: flex;
  align-items: center;
  padding: 4rpx 2rpx 0;
}

.return-progress-item {
  width: 110rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  flex-shrink: 0;
}

.return-progress-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #d7e0ec;
  box-shadow: 0 0 0 8rpx rgba(215, 224, 236, 0.36);
}

.return-progress-item.done .return-progress-dot {
  background: #78daf5;
  box-shadow: 0 0 0 8rpx rgba(73, 202, 238, 0.18);
}

.return-progress-label {
  font-size: 21rpx;
  line-height: 1.3;
  color: #97a3b5;
}

.return-progress-item.done .return-progress-label {
  color: #34445b;
  font-weight: 600;
}

.return-progress-line {
  flex: 1;
  height: 4rpx;
  border-radius: 999rpx;
  background: #e8eef6;
  margin: 0 10rpx;
}

.return-progress-line.done {
  background: linear-gradient(90deg, rgba(73, 202, 238, 0.7) 0%, rgba(73, 202, 238, 0.22) 100%);
}

.return-address-shell {
  position: relative;
  z-index: 1;
  margin-top: 24rpx;
  padding: 18rpx 18rpx 20rpx;
  border-radius: 20rpx;
  background: linear-gradient(180deg, #f7f9fd 0%, #ffffff 100%);
}

.return-address-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.return-address-title {
  font-size: 21rpx;
  color: #98a4b4;
  letter-spacing: 1rpx;
}

.return-address-copy {
  font-size: 23rpx;
  color: #78daf5;
  font-weight: 600;
}

.return-address-main {
  margin-top: 14rpx;
  display: flex;
  align-items: flex-start;
  gap: 14rpx;
}

.return-address-badge {
  width: 60rpx;
  height: 60rpx;
  border-radius: 18rpx;
  background: linear-gradient(135deg, #f3a36d 0%, #ea8d63 100%);
  color: #fff3c7;
  font-size: 30rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.return-address-body {
  flex: 1;
  min-width: 0;
}

.return-address-top {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 14rpx;
}

.return-address-name {
  font-size: 29rpx;
  line-height: 1.35;
  color: #273246;
  font-weight: 700;
}

.return-address-phone {
  font-size: 30rpx;
  line-height: 1;
  color: #273246;
}

.return-address-line {
  display: block;
  margin-top: 8rpx;
  font-size: 25rpx;
  line-height: 1.6;
  color: #7b8799;
}

.return-review-block {
  position: relative;
  z-index: 1;
  margin-top: 22rpx;
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

.history-head-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4rpx;
  flex-shrink: 0;
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
  font-size: 23rpx;
  line-height: 1.4;
  color: #8e99aa;
}

.history-copy {
  font-size: 20rpx;
  line-height: 1.2;
  color: #78daf5;
}

.history-desc {
  margin-top: 6rpx;
  display: block;
  font-size: 23rpx;
  line-height: 1.6;
  color: #758096;
}

.history-desc.copyable {
  color: #5c7898;
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
  padding-bottom: 2rpx;
}

.payment-modal-title {
  display: block;
  text-align: center;
  font-size: 32rpx;
  font-weight: 700;
  color: #1f2735;
  margin-bottom: 14rpx;
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
  max-height: 50vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 2rpx;
}

.payment-section {
  margin-top: 12rpx;
  border-radius: 16rpx;
  border: 1rpx solid #ebeff6;
  background: #f9fbff;
  padding: 16rpx;
}

.payment-section-title {
  display: block;
  font-size: 27rpx;
  color: #273043;
  font-weight: 700;
}

.payment-modal-footer {
  margin-top: 16rpx;
  padding-top: 10rpx;
  border-top: 1rpx dashed #e9eef7;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12rpx;
  padding-bottom: 8rpx;
}

.payment-modal-mini-btn {
  width: 196rpx;
  height: 64rpx;
  line-height: 64rpx;
  border-radius: 999rpx;
  border: 1rpx solid #f3cfd4;
  background: #fff4f6;
  color: #b96572;
  font-size: 23rpx;
  font-weight: 600;
  margin: 0;
  padding: 0;
}

.payment-modal-mini-btn::after {
  border: none;
}

.payment-modal-ok-btn {
  flex: 1;
  height: 68rpx;
  line-height: 68rpx;
  border-radius: 999rpx;
  border: none;
  margin: 0;
  padding: 0;
  background: linear-gradient(135deg, #87c6ec 0%, #6eaede 100%);
  color: #fff;
  font-size: 27rpx;
  font-weight: 700;
}

.payment-modal-ok-btn::after {
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
  left: 20rpx;
  right: 20rpx;
  bottom: 0;
  background: transparent;
  backdrop-filter: none;
  box-shadow: none;
  z-index: 100;
  padding: 0;
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
  position: relative;
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
  overflow: visible !important;
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
  padding: 18rpx 28rpx 28rpx;
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
  padding-top: 18rpx;
}
.price-row {
  margin-top: 8rpx;
  min-height: 88rpx;
  display: flex;
  align-items: center;
  column-gap: 18rpx;
}
.price-row + .price-row {
  border-top: 1rpx solid #edf2f7;
}
.price-row-static {
  padding: 0;
}
.price-row-column {
  margin-top: 18rpx;
  display: flex;
  flex-direction: column;
  padding-top: 18rpx;
  border-top: 1rpx solid #edf2f7;
}
.price-label {
  font-size: 26rpx;
  color: #5f6778;
  width: 148rpx;
  flex-shrink: 0;
}
.price-field {
  flex: 1;
  min-width: 0;
}
.price-value {
  font-size: 26rpx;
  color: #253044;
  text-align: left;
  display: block;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.price-input {
  height: 72rpx;
  line-height: 72rpx;
  padding: 0;
  background-color: transparent;
  font-size: 26rpx;
  color: #253044;
}
.price-hint {
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #98a4b7;
  line-height: 1.6;
}
.price-textarea {
  margin-top: 18rpx;
  padding: 0;
  background-color: transparent;
  font-size: 24rpx;
  color: #253044;
  min-height: 148rpx;
  line-height: 1.7;
}
.price-footer {
  margin-top: 28rpx;
}
.price-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #7fe1ff, #78daf5);
  color: #ffffff;
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

.material-confirm-logistics {
  width: 100%;
  margin-top: -8rpx;
  margin-bottom: 24rpx;
  padding: 16rpx 20rpx;
  border-radius: 16rpx;
  background: #f5f8fd;
  box-sizing: border-box;
}

.material-confirm-logistics-label {
  display: block;
  font-size: 22rpx;
  color: #8b97ac;
  line-height: 1.2;
}

.material-confirm-logistics-main {
  margin-top: 10rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.material-confirm-logistics-value {
  flex: 1;
  min-width: 0;
  font-size: 26rpx;
  color: #334258;
  line-height: 1.4;
  word-break: break-all;
}

.material-confirm-logistics-copy {
  flex-shrink: 0;
  font-size: 22rpx;
  color: #78daf5;
  line-height: 1.2;
}

.blank-review-link-input {
  width: 100%;
  height: 84rpx;
  margin-top: -8rpx;
  margin-bottom: 14rpx;
  padding: 0 24rpx;
  border-radius: 16rpx;
  background: #f6f8fc;
  font-size: 25rpx;
  color: #243246;
  box-sizing: border-box;
}

.blank-review-note-input {
  width: 100%;
  min-height: 156rpx;
  margin-bottom: 26rpx;
  padding: 18rpx 22rpx;
  border-radius: 16rpx;
  background: #f6f8fc;
  font-size: 25rpx;
  color: #243246;
  line-height: 1.6;
  box-sizing: border-box;
}

.ship-modal-input {
  width: 100%;
  height: 78rpx;
  border-radius: 14rpx;
  background: #f4f7fb;
  padding: 0 20rpx;
  font-size: 26rpx;
  color: #2d3748;
  box-sizing: border-box;
  margin-bottom: 26rpx;
}

.ship-form-modal {
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 8rpx 6rpx 18rpx;
  padding-bottom: calc(18rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.ship-form-tip {
  font-size: 22rpx;
  color: #9ca7bb;
  line-height: 1.6;
  margin-bottom: 10rpx;
}

.ship-form-address-section + .ship-form-address-section {
  margin-top: 12rpx;
}

.ship-form-address-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
  margin-top: 8rpx;
  margin-bottom: 8rpx;
}

.ship-form-address-label-title {
  font-size: 22rpx;
  color: #7f8ba0;
}

.ship-form-address-copy-action {
  font-size: 22rpx;
  color: #78daf5;
}

.ship-form-address-card {
  background: #ffffff;
  border-radius: 12rpx;
  padding: 10rpx 0 18rpx;
  display: flex;
  align-items: flex-start;
  gap: 14rpx;
  border-bottom: 1rpx solid #edf2fa;
}

.ship-form-address-badge {
  width: 52rpx;
  height: 52rpx;
  border-radius: 16rpx;
  background: #fb8e68;
  color: #ffefa8;
  font-size: 29rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 6rpx;
}

.ship-form-address-badge.receive {
  background: #78daf5;
  color: #ffffff;
}

.ship-form-address-content {
  flex: 1;
  min-width: 0;
}

.ship-form-address-top {
  display: flex;
  align-items: baseline;
  gap: 14rpx;
  flex-wrap: wrap;
}

.ship-form-address-name,
.ship-form-address-phone {
  font-size: 42rpx;
  font-weight: 700;
  color: #1f2735;
  line-height: 1.2;
}

.ship-form-address-line {
  margin-top: 10rpx;
  display: block;
  font-size: 24rpx;
  color: #8f99ad;
  line-height: 1.5;
  word-break: break-word;
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.ship-form-row {
  margin-top: 0;
  border-top: 1rpx solid #eef2f8;
  min-height: 94rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14rpx;
  padding: 0 4rpx;
}

.ship-form-label {
  font-size: 28rpx;
  font-weight: 700;
  color: #1f2735;
  line-height: 1.25;
  white-space: nowrap;
}

.ship-form-row-right {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10rpx;
}

.ship-form-input {
  flex: 1;
  min-width: 0;
  height: 64rpx;
  text-align: right;
  font-size: 30rpx;
  color: #344154;
}

.ship-form-value {
  font-size: 30rpx;
  color: #535f74;
}

.ship-form-value.placeholder {
  color: #b7bfce;
}

.ship-form-submit {
  margin-top: 24rpx;
  margin-bottom: 10rpx;
  width: 100%;
  height: 84rpx;
  line-height: 84rpx;
  border-radius: 42rpx;
  background: linear-gradient(135deg, #8bc6ed 0%, #6daee0 100%);
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 700;
  border: none;
}

.ship-form-submit::after {
  border: none;
}

.ship-form-submit.disabled {
  background: #e5ebf5;
  color: #aab4c7;
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
