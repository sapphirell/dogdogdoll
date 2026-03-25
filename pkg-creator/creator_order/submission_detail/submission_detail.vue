<template>
  <view-logs />
<view class="page-container">
    <zhouWei-navBar
      type="transparentFixed"
      :scrollTop="scrollTop"
      :backState="2000"
      :homeState="2000"
      bgColor="rgba(255,255,255,0.92)"
      fontColor="#000000"
      transparentFixedFontColor="#000000"
      :shadow="false"
    >
      <template #left>
        <view class="nav-back-pill nav-back-pill--offset" @click="goBack" aria-label="返回">
          <uni-icons type="left" size="22" color="#000" />
        </view>
      </template>
      <template #transparentFixedLeft>
        <view class="nav-back-pill nav-back-pill--offset nav-back-pill--transparent" @click="goBack" aria-label="返回">
          <uni-icons type="left" size="22" color="#fff" />
        </view>
      </template>
      <template #default>
        <view class="nav-center">
          <text class="nav-title-ellipsis">投递详情</text>
        </view>
      </template>
      <template #transparentFixed>
        <view class="nav-center nav-center--transparent">
          <text class="nav-title-ellipsis nav-title-ellipsis--ghost">投递详情</text>
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
                <image class="chat-icon" src="/static/new-icon/chat.png" />
                <text class="chat-pill-text font-alimamashuhei">发起会话</text>
                <uni-icons class="chat-arrow" type="arrow-right" size="12" color="#6f7b8b" />
              </view>
            </view>
          </view>
        </view>

	        <view class="section-info-list">
          <view class="info-row-item">
            <text class="info-label font-alimamashuhei">订单号</text>
            <text class="info-val font-title">{{ submissionOrderNoText }}</text>
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

          <view v-if="pendingCountdownVisible" class="info-row-item">
            <text class="info-label font-alimamashuhei">{{ pendingCountdownLabel }}</text>
            <text class="info-val info-val-countdown font-title">{{ pendingCountdownText }}</text>
          </view>

	        </view>

	        <view class="overview-inline-panel">
	          <view class="overview-inline-head">
	            <text class="overview-inline-title font-alimamashuhei">前方订单状态</text>
	          </view>

	          <view v-if="progressOverviewLoading && !progressOverviewLoaded" class="overview-inline-loading">
	            <loading-jump-text />
	          </view>
	          <view v-else-if="progressOverviewError && !overviewCurrentPlanItems.length" class="overview-inline-error">
	            <text class="overview-state-text">{{ progressOverviewError }}</text>
	            <view class="overview-retry-btn" @tap="reloadProgressOverview">重试</view>
	          </view>
	          <view v-else-if="!overviewCurrentPlanItems.length" class="overview-empty-row">暂无记录</view>
              <view v-else class="overview-scroll-wrap">
		            <scroll-view
		              class="overview-timeline-scroll"
		              scroll-x
		              :show-scrollbar="false"
                :lower-threshold="80"
                @scrolltolower="handleOverviewReachEnd"
		            >
		              <view class="overview-timeline-track">
		              <view
		                v-for="(entry, idx) in overviewCurrentPlanItems"
		                :key="`inline-plan-${overviewEntryKey(entry)}`"
		                class="overview-timeline-node"
		              >
	                <view class="overview-node-top">
	                  <view
	                    class="overview-node-dot"
	                    :class="{ current: isOverviewCurrentSubmission(entry) }"
	                  ></view>
	                  <view
	                    v-if="idx < overviewCurrentPlanItems.length - 1"
	                    class="overview-node-line"
	                    :class="{ current: isOverviewCurrentSubmission(entry) }"
	                  ></view>
	                </view>

	                <view
	                  class="overview-timeline-card"
	                  :class="{
                    current: isOverviewCurrentSubmission(entry),
                    placeholder: !overviewEntryHasItem(entry),
                    'placeholder-self': isOverviewCurrentSubmission(entry) && !overviewEntryHasItem(entry)
                  }"
	                >
	                  <view class="overview-timeline-card-head">
	                    <text class="overview-item-order-id">{{ overviewEntryOrderTag(entry, idx) }}</text>
	                  </view>

	                  <view class="overview-item-thumb-wrap">
                      <view
                        v-if="overviewEntryHasItem(entry) && overviewEntryThumb(entry) && overviewEntryExtraItemCount(entry) > 0"
                        class="overview-item-stack-layer layer-back"
                      ></view>
                      <view
                        v-if="overviewEntryHasItem(entry) && overviewEntryThumb(entry) && overviewEntryExtraItemCount(entry) > 0"
                        class="overview-item-stack-layer layer-mid"
                      ></view>
                      <template v-if="overviewEntryHasItem(entry) && overviewEntryThumb(entry)">
                        <image
                          class="overview-item-thumb"
                          :src="overviewEntryThumb(entry)"
                          mode="aspectFill"
                          @tap.stop="previewOverviewEntryImages(entry, 0)"
                        />
                        <view
                          v-if="overviewEntryExtraItemCount(entry) > 0"
                          class="overview-item-more-tag font-title"
                        >
                          +{{ overviewEntryExtraItemCount(entry) }}
                        </view>
                      </template>
	                    <view
                        v-else
                        class="overview-item-thumb overview-item-thumb-empty"
                        :class="{ 'overview-item-thumb-empty-self': isOverviewCurrentSubmission(entry) && !overviewEntryHasItem(entry) }"
                      >
	                      <text class="overview-item-thumb-empty-text">{{ overviewEntryHasItem(entry) ? '暂无娃头' : '待填写' }}</text>
	                    </view>
	                  </view>

	                  <text class="overview-item-title text-truncate">{{ overviewEntryTitle(entry) }}</text>
	                  <text class="overview-item-status text-truncate">{{ overviewEntryStatus(entry) }}</text>
	                  <text class="overview-item-time">{{ overviewEntryTime(entry) }}</text>
	                </view>
		              </view>

                <view v-if="progressOverviewAppending" class="overview-loading-tail">加载中...</view>
		              </view>
		            </scroll-view>
                <view v-if="showOverviewTailFade" class="overview-tail-fade"></view>
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
              <text v-if="tabNeedAttention(index)" class="tab-attention-mark font-title">!</text>
            </view>
          </view>
          
          <view v-if="canEditSubmissionItems" class="tab-tip-text">
            <text class="font-title" v-if="remainingCount > 0">还可以创建 {{ remainingCount }} 个投递</text>
            <text class="font-title" v-else>数量已达上限</text>
          </view>
        </view>

        <view class="tab-content-wrapper">
          
	          <view v-if="currentItem" class="content-item-view anim-fade-up" :key="currentTabIndex">
              <view class="item-complete-wrap" :class="{ 'is-incomplete': currentItemNeedCompleteSelection }">
                <view v-if="currentItemNeedCompleteSelection" class="item-complete-tag font-alimamashuhei">待完善</view>
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
                    <view
                      v-if="currentItemAlertTag"
                      class="item-alert-bubble font-alimamashuhei"
                      :class="`item-alert-bubble-${currentItemAlertTag.type}`"
                    >
                      {{ currentItemAlertTag.text }}
                    </view>
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
	                  <view v-if="canViewItemDetail" class="item-view-detail-btn">查看详情</view>
	                </view>
		              </view>
		            </view>

                <view v-if="showBlankSupplyCard" class="blank-supply-card">
	              <view class="blank-supply-head">
	                <text class="blank-supply-title font-alimamashuhei">毛坯方案</text>
	                <view v-if="blankCheckTagText" class="blank-check-tag font-alimamashuhei" :class="{ replace: activeItemNeedReplaceBlank }">
	                  {{ blankCheckTagText }}
	                </view>
              </view>
              <text class="blank-supply-mode">{{ blankSupplyModeText(activeItemBlankSupplyMode) }}</text>

              <view v-if="activeItemBlankSnapshot" class="blank-stock-card">
                <image
                  v-if="activeItemBlankSnapshot.cover_image"
                  class="blank-stock-cover"
                  :src="activeItemBlankSnapshot.cover_image"
                  mode="aspectFill"
                />
                <view class="blank-stock-main">
                  <text class="blank-stock-name font-alimamashuhei">{{ activeItemBlankSnapshot.blank_name || '已选毛坯' }}</text>
                  <text class="blank-stock-meta">¥{{ formatBlankPrice(activeItemBlankSnapshot.price) }} · {{ activeItemBlankSnapshot.head_circumference || '头围待补充' }}</text>
                </view>
              </view>
              <text v-else-if="activeItemBlankIntroText" class="blank-stock-fallback">已选毛坯：{{ activeItemBlankIntroText }}</text>

              <text v-if="activeItemBlankPurchaseLink" class="blank-link-text" @tap="openBlankPurchaseLink(activeItemBlankPurchaseLink)">
                购买链接：{{ activeItemBlankPurchaseLink }}
              </text>

                </view>
              </view>

	            <view v-if="showMaterialShipInfoCard || showSubmitMaterialShipBtn" class="material-ship-panel">
              <view class="material-ship-info">
                <view class="material-ship-row">
                  <text class="material-ship-label font-title">{{ materialShipPanelTitle }}</text>
                  <text class="material-ship-value">{{ materialShipStatusText }}</text>
                </view>
                <view v-if="showMaterialShipDeadlineInfo" class="material-ship-row">
                  <text class="material-ship-label font-title">{{ materialShipDeadlineLabel }}</text>
                  <text class="material-ship-value">{{ materialShipDeadlineText }}</text>
                </view>
                <view v-if="activeItemBuyerExpressNo" class="material-ship-row">
                  <text class="material-ship-label font-title">{{ materialShipExpressNoLabel }}</text>
                  <text class="material-ship-value">{{ activeItemBuyerExpressCompany || '快递' }} {{ activeItemBuyerExpressNo }}</text>
                </view>
              </view>

              <view v-if="creatorAddressInfo" class="material-ship-address-card" @tap="copyCreatorAddress">
                <view class="material-ship-address-head">
                  <text class="material-ship-address-title font-title">寄送地址</text>
                  <text class="material-ship-address-copy">复制地址</text>
                </view>
                <view class="material-ship-address-main">
                  <text class="material-ship-address-name">{{ creatorAddressInfo.receiver_name || '-' }}</text>
                  <text class="material-ship-address-phone">{{ creatorAddressInfo.receiver_phone || '-' }}</text>
                </view>
                <text class="material-ship-address-line">{{ creatorAddressInfo.full_address || '-' }}</text>
              </view>

              <view
                v-if="showSubmitMaterialShipBtn"
                class="material-ship-btn"
                :class="{ disabled: materialShipSubmitting }"
                @tap="openMaterialShipModal"
              >
                {{ materialShipActionText }}
              </view>
            </view>

            <view v-if="showTransferNodeNotice" class="transfer-node-notice">
              <uni-icons type="info-filled" size="16" color="#6f8fa5" />
              <text class="transfer-node-notice-text">{{ transferNodeNoticeText }}</text>
            </view>

            <view class="timeline-area">
              <view class="timeline-header">进度详情</view>
              <view v-if="currentItemProgressGuide || timelineEvents.length" class="timeline-list">
                <view v-if="timelineNextActionText" class="timeline-row timeline-row-guide">
                  <view class="timeline-dot guide"></view>
                  <view v-if="timelineEvents.length" class="timeline-line"></view>
                  <view class="timeline-text-box">
                    <view class="timeline-title-row">
                      <text class="t-title">{{ timelineNextActionText }}</text>
                    </view>
                  </view>
                </view>
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

	            <view v-if="showDeliveryFlowCard" class="timeline-area delivery-flow-area">
	              <view class="timeline-header">订单收尾</view>
	              <text
	                v-if="submission.return_address_requested && !effectiveReturnAddressReady"
	                class="delivery-flow-text"
	              >
	                创作者已发起收尾，请先填写寄回地址。
	              </text>
	              <view v-if="effectiveReturnAddressInfo" class="return-address-preview-card">
	                <text class="return-address-preview-title">寄回地址</text>
	                <text class="return-address-preview-line">
	                  {{ effectiveReturnAddressInfo.receiver_name || '-' }} {{ effectiveReturnAddressInfo.receiver_phone || '' }}
	                </text>
	                <text class="return-address-preview-line">
	                  {{ effectiveReturnAddressInfo.full_address || '-' }}
	                </text>
	              </view>
	              <view v-if="submission.return_shipped" class="delivery-status-chip">
	                <text class="delivery-status-label">寄回进度</text>
	                <text class="delivery-status-value">已寄回 · {{ submission.return_express_no || '待补充单号' }}</text>
	              </view>
	              <view v-if="submission.return_received" class="delivery-status-chip success">
	                <text class="delivery-status-label">订单状态</text>
	                <text class="delivery-status-value">你已确认结束</text>
	              </view>
	              <view v-if="reviewInfo" class="review-preview-card">
	                <view class="review-preview-head">
	                  <text class="review-preview-title">订单评价</text>
	                  <text v-if="reviewInfo.score > 0" class="review-preview-score">{{ reviewInfo.score }} 星</text>
	                </view>
	                <text v-if="reviewInfo.content" class="review-preview-content">{{ reviewInfo.content }}</text>
	                <view v-if="reviewInfo.images.length" class="review-preview-images">
	                  <image
	                    v-for="(img, idx) in reviewInfo.images"
	                    :key="`review-img-${idx}`"
	                    class="review-preview-image"
	                    :src="img"
	                    mode="aspectFill"
	                    @tap.stop="previewTimelineImages(reviewInfo.images, idx)"
	                  />
	                </view>
	              </view>
	              <view v-if="deliveryActionList.length" class="delivery-action-row">
	                <view
	                  v-for="action in deliveryActionList"
	                  :key="action.key"
	                  class="delivery-action-btn"
	                  :class="action.tone"
	                  @tap="handleDeliveryAction(action.key)"
	                >
	                  {{ action.label }}
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

    <view class="fixed-bottom-bar" v-if="isLogin && submission.submission_id && bottomAction && !payPopupVisible && !payCodeModalVisible && !reviewModalVisible">
       <button 
         class="action-btn" 
         :class="{ 'disabled': !isContentReady }"
         :hover-class="isContentReady ? 'btn-hover' : ''"
         @click="handleBottomAction"
       >
	        <view class="btn-content">
	           <text
	             class="btn-price"
	             :class="[bottomAction === 'confirm' ? 'font-alimamashuhei is-confirm' : 'font-din']"
	           >
	             {{ bottomAmountText }}
	           </text>
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
          <text class="overview-modal-title">前方订单状态</text>
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
            <view v-else class="overview-scroll-wrap">
              <scroll-view
                class="overview-timeline-scroll"
                scroll-x
                :show-scrollbar="false"
                :lower-threshold="80"
                @scrolltolower="handleOverviewReachEnd"
                @touchmove.stop
              >
                <view class="overview-timeline-track">
                <view
                  v-for="(entry, idx) in overviewCurrentPlanItems"
                  :key="`plan-${overviewEntryKey(entry)}`"
                  class="overview-timeline-node"
                >
                  <view class="overview-node-top">
                    <view
                      class="overview-node-dot"
                      :class="{ current: isOverviewCurrentSubmission(entry) }"
                    ></view>
                    <view
                      v-if="idx < overviewCurrentPlanItems.length - 1"
                      class="overview-node-line"
                      :class="{ current: isOverviewCurrentSubmission(entry) }"
                    ></view>
                  </view>

	                  <view
	                    class="overview-timeline-card"
	                    :class="{
                      current: isOverviewCurrentSubmission(entry),
                      placeholder: !overviewEntryHasItem(entry),
                      'placeholder-self': isOverviewCurrentSubmission(entry) && !overviewEntryHasItem(entry)
                    }"
	                  >
	                    <view class="overview-timeline-card-head">
	                      <text class="overview-item-order-id">{{ overviewEntryOrderTag(entry, idx) }}</text>
	                    </view>

	                    <view class="overview-item-thumb-wrap">
                      <view
                        v-if="overviewEntryHasItem(entry) && overviewEntryThumb(entry) && overviewEntryExtraItemCount(entry) > 0"
                        class="overview-item-stack-layer layer-back"
                      ></view>
                      <view
                        v-if="overviewEntryHasItem(entry) && overviewEntryThumb(entry) && overviewEntryExtraItemCount(entry) > 0"
                        class="overview-item-stack-layer layer-mid"
                      ></view>
                      <template v-if="overviewEntryHasItem(entry) && overviewEntryThumb(entry)">
                        <image
                          class="overview-item-thumb"
                          :src="overviewEntryThumb(entry)"
                          mode="aspectFill"
                          @tap.stop="previewOverviewEntryImages(entry, 0)"
                        />
                        <view
                          v-if="overviewEntryExtraItemCount(entry) > 0"
                          class="overview-item-more-tag font-title"
                        >
                          +{{ overviewEntryExtraItemCount(entry) }}
                        </view>
                      </template>
                      <view
                        v-else
                        class="overview-item-thumb overview-item-thumb-empty"
                        :class="{ 'overview-item-thumb-empty-self': isOverviewCurrentSubmission(entry) && !overviewEntryHasItem(entry) }"
                      >
                        <text class="overview-item-thumb-empty-text">{{ overviewEntryHasItem(entry) ? '暂无娃头' : '待填写' }}</text>
                      </view>
                    </view>

	                    <text class="overview-item-title text-truncate">{{ overviewEntryTitle(entry) }}</text>
	                    <text class="overview-item-status text-truncate">{{ overviewEntryStatus(entry) }}</text>
	                    <text class="overview-item-time">{{ overviewEntryTime(entry) }}</text>
	                  </view>
                </view>

                  <view v-if="progressOverviewAppending" class="overview-loading-tail">加载中...</view>
                </view>
              </scroll-view>
              <view v-if="showOverviewTailFade" class="overview-tail-fade"></view>
            </view>
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

        <view v-if="selectedMethodPayAmountOptions.length" class="pay-amount-wrap">
          <text class="pay-amount-title">支付价格</text>
          <view v-if="selectedMethodPayAmountOptions.length > 1" class="pay-amount-list">
            <view
              v-for="amountItem in selectedMethodPayAmountOptions"
              :key="`${selectedPayMethodId}-${amountItem.pay_part}`"
              class="pay-amount-item"
              :class="{ active: selectedPayPart === amountItem.pay_part }"
              @tap="selectPayPart(amountItem.pay_part)"
            >
              <text class="pay-amount-item-text">{{ amountItem.label }}</text>
            </view>
          </view>
          <view v-else class="pay-amount-single">
            <text class="pay-amount-single-text">{{ selectedMethodPayAmountOptions[0].label }}</text>
          </view>
        </view>

        <view v-if="selectedMethodIsAlipay" class="pay-method-explain-card">
          <text class="pay-method-explain-title font-alimamashuhei">创作节点预览</text>
          <view v-if="paymentStepPreviewList.length" class="pay-step-preview-list">
            <view
              v-for="(step, idx) in paymentStepPreviewList"
              :key="`pay-step-${step.id || idx}`"
              class="pay-step-preview-item"
            >
              <text class="pay-step-preview-dot"></text>
              <text class="pay-step-preview-name">{{ step.name }} · {{ step.percentText }}</text>
            </view>
          </view>
          <text v-else class="pay-step-preview-empty">本单未配置中间节点，完成后直接进入成品确认。</text>
          <text class="pay-method-explain-tip">{{ platformEscrowNoticeText }}</text>
        </view>

        <view v-if="selectedMethodIsQRCode" class="pay-method-explain-card transfer-risk">
          <text class="pay-method-explain-title font-alimamashuhei">转账付款提醒</text>
          <text class="pay-method-explain-tip">{{ transferRiskNoticeText }}</text>
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

    <common-modal
      v-model:visible="reviewModalVisible"
      width="680rpx"
      :closeable="!reviewSubmitting"
      :center="true"
    >
      <view class="review-modal">
        <text class="review-modal-title">写评价</text>
        <text class="review-modal-desc">可以写下体验，也可以附上返图。</text>

        <textarea
          v-model.trim="reviewContent"
          class="review-textarea"
          maxlength="300"
          placeholder="这次返妆或返毛体验怎么样？"
        />
        <text class="review-count">{{ reviewContentLength }}/300</text>

        <view class="review-upload-head">
          <text class="review-upload-title">返图</text>
          <text class="review-upload-sub">{{ reviewImages.length }}/{{ reviewMaxImages }}</text>
        </view>
        <view class="review-image-list">
          <view
            v-for="(img, idx) in reviewImages"
            :key="`${img}-${idx}`"
            class="review-image-item"
          >
            <image class="review-image-photo" :src="img" mode="aspectFill" @tap="previewReviewImages(idx)" />
            <view class="review-image-remove" @tap.stop="removeReviewImage(idx)">×</view>
          </view>
          <view
            v-if="reviewImages.length < reviewMaxImages && !reviewUploading"
            class="review-image-add"
            @tap="pickReviewImages"
          >
            <text class="review-image-add-icon">+</text>
            <text class="review-image-add-text">添加返图</text>
          </view>
        </view>
        <text v-if="reviewUploading" class="review-uploading">{{ reviewUploadText }}</text>

        <view class="review-modal-actions">
          <button
            class="review-modal-btn cancel"
            :disabled="reviewSubmitting"
            @tap="closeReviewModal"
          >
            取消
          </button>
          <button
            class="review-modal-btn confirm"
            :class="{ disabled: !canSubmitReviewForm || reviewSubmitting }"
            :disabled="!canSubmitReviewForm || reviewSubmitting"
            @tap="submitReview"
          >
            {{ reviewSubmitting ? '提交中...' : '提交评价' }}
          </button>
        </view>
      </view>
    </common-modal>

    <common-modal
      v-model:visible="materialShipModalVisible"
      width="640rpx"
      :closeable="!materialShipSubmitting"
      :center="true"
    >
      <view class="material-ship-modal">
        <text class="material-ship-modal-title font-alimamashuhei">{{ materialShipModalTitleText }}</text>
        <text class="material-ship-modal-desc">{{ materialShipModalDescText }}</text>

        <view v-if="showMaterialShipDeadlineInfo" class="material-ship-deadline-card">
          <text class="material-ship-deadline-label font-title">{{ materialShipDeadlineLabel }}</text>
          <text class="material-ship-deadline-value">{{ materialShipDeadlineText }}</text>
        </view>

        <view v-if="creatorAddressInfo" class="material-ship-address-card modal" @tap="copyCreatorAddress">
          <view class="material-ship-address-head">
            <text class="material-ship-address-title font-title">寄送地址</text>
            <text class="material-ship-address-copy">复制地址</text>
          </view>
          <view class="material-ship-address-main">
            <text class="material-ship-address-name">{{ creatorAddressInfo.receiver_name || '-' }}</text>
            <text class="material-ship-address-phone">{{ creatorAddressInfo.receiver_phone || '-' }}</text>
          </view>
          <text class="material-ship-address-line">{{ creatorAddressInfo.full_address || '-' }}</text>
        </view>

        <view class="material-ship-form-row">
          <text class="material-ship-form-label font-title">{{ materialShipExpressNoLabel }}</text>
          <input
            v-model.trim="materialShipExpressNo"
            class="material-ship-form-input"
            :placeholder="materialShipExpressNoPlaceholder"
          />
        </view>

        <view class="material-ship-form-row" @tap="chooseMaterialShipCompany">
          <text class="material-ship-form-label font-title">快递公司</text>
          <view class="material-ship-form-picker">
            <text :class="{ placeholder: !materialShipExpressCompany }">
              {{ materialShipExpressCompany || materialShipCompanyPlaceholder }}
            </text>
            <uni-icons type="right" size="14" color="#b2bed1" />
          </view>
        </view>

        <view class="material-ship-modal-actions">
          <button
            class="material-ship-modal-btn cancel"
            :disabled="materialShipSubmitting"
            @tap="closeMaterialShipModal"
          >
            取消
          </button>
          <button
            class="material-ship-modal-btn confirm"
            :class="{ disabled: materialShipSubmitting }"
            :disabled="materialShipSubmitting"
            @tap="submitMaterialShip"
          >
            {{ materialShipSubmitting ? '提交中...' : materialShipSubmitText }}
          </button>
        </view>
      </view>
    </common-modal>
  </view>
</template>

<script setup>
import { ref, reactive, computed, nextTick, watch } from 'vue'
import { onLoad, onShow, onHide, onUnload, onPageScroll } from '@dcloudio/uni-app'
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
const SubmissionStatusReturned = 8
const SubmissionStatusFinished = 9
const PayStatusDepositPaid = 2
const PayStatusPaid = 4
const ItemStatusOrdered = 3
const ItemStatusWaitBuyerShip = 7
const ItemStatusBuyerShipped = 8
const PlanPaymentMethodQRCode = 1
const PlanPaymentMethodAlipay = 2
const PendingCountdownSceneFillContent = 'fill_content'
const PendingCountdownScenePay = 'pay'
const reviewMaxImages = 9

// ====== 状态数据 ======
const submissionId = ref(0)
const focusItemID = ref(0)
const loading = ref(false)
const hasFirstLoaded = ref(false)
const fetchSeq = ref(0)
// 修改点：移除 ref 包装，使用普通变量作为共享变量控制定时器
let pollingTimer = null 
let countdownTicker = null

const currentTabIndex = ref(0) // 控制 Tab

const submission = reactive({
  submission_id: 0,
  order_id: '',
  plan_id: 0,
  status: 0,
  status_text: '',
  payment_type: 0,
  pay_status: 0,
  ahead_count: 0,
  viewer_is_buyer: false,
  artist_type: 0, // 修改点：新增 artist_type
  payment_method: 0,
  step_configs: [],
  progress_logs: [],
  items: [],
  item_final_states: [],
  status_flow_map: [],
  item_progress_guides: [],
  buyer_todo_pending: false,
  buyer_todo_count: 0,
  buyer_todo_codes: [],
  can_fill_return_address: false,
  return_address_requested: false,
  return_address_ready: false,
  return_address_info: null,
  return_shipped: false,
  return_received: false,
  can_confirm_received: false,
  review_submitted: false,
  can_submit_review: false,
  review_info: null,
  return_express_no: '',
  creator_address_info: null,
  shipping_deadline: {
    active: false,
    mode: '',
    deadline_type: '',
    deadline_type_text: '',
    deadline_date: '',
    deadline_at: 0,
    remaining_seconds: 0,
    expired: false
  },
  pending_countdown: {
    active: false,
    scene: '',
    label: '',
    total_seconds: 0,
    deadline_at: 0,
    remaining_seconds: 0,
    expired: false
  }
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
  order_type: 0,
  order_config: '',
  extra: {},
  payment_methods: []
})

const payPopupRef = ref(null)
const payPopupData = ref(null)
const selectedPayMethodId = ref(0)
const selectedPayCodeChannel = ref('')
const selectedPayPart = ref('')
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
const reviewModalVisible = ref(false)
const reviewContent = ref('')
const reviewImages = ref([])
const reviewUploading = ref(false)
const reviewUploadText = ref('')
const reviewSubmitting = ref(false)
const stepActioningLogID = ref(0)
const progressOverviewVisible = ref(false)
const progressOverviewLoading = ref(false)
const progressOverviewLoaded = ref(false)
const progressOverviewError = ref('')
const overviewCurrentPlanItems = ref([])
const lastRouteKey = ref('')
const scrollTop = ref(0)
const progressOverviewHasMore = ref(false)
const progressOverviewCursor = ref(0)
const progressOverviewPageSize = ref(20)
const progressOverviewAppending = ref(false)
const progressOverviewAnchorID = ref(0)
const materialShipModalVisible = ref(false)
const materialShipSubmitting = ref(false)
const materialShipExpressNo = ref('')
const materialShipExpressCompany = ref('')
const nowUnixSec = ref(Math.floor(Date.now() / 1000))
const blankStockSnapshotMap = ref({})
const blankStockSnapshotLoadingMap = ref({})

let h5ScrollLockApplied = false
let h5PageScrollEl = null
let h5PageOverscrollBehaviorBackup = ''
let h5PageTouchActionBackup = ''
let h5DocTouchMoveHandler = null
let h5DocWheelHandler = null

const PAY_DEBUG_TAG = '[submission-pay]'
// 支付宝 APP SDK 返回的成功码，表示客户端已经拿到明确成功结果。
const ALIPAY_APP_PAY_SUCCESS_CODES = ['9000']
// 这些状态通常表示支付结果还在确认中，最终仍以后端回调和查单为准。
const ALIPAY_APP_PAY_WAITING_CODES = ['8000', '6004']
const H5_PENDING_ALIPAY_PAYMENT_KEY = 'pendingAlipayH5Payment'
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

const submissionOrderNoText = computed(() => {
  const orderID = String(submission.order_id || '').trim()
  if (orderID) return orderID
  const fallbackID = Number(submission.submission_id || submissionId.value || 0)
  return fallbackID > 0 ? `#${fallbackID}` : '--'
})

const pendingCountdownRaw = computed(() => {
  const row = submission.pending_countdown
  if (!row || typeof row !== 'object') {
    return {
      active: false,
      scene: '',
      label: '',
      total_seconds: 0,
      deadline_at: 0,
      remaining_seconds: 0,
      expired: false
    }
  }
  return row
})

const pendingCountdownLabel = computed(() => {
  const rawLabel = String(pendingCountdownRaw.value.label || '').trim()
  if (rawLabel) return rawLabel
  const scene = String(pendingCountdownRaw.value.scene || '').trim()
  if (scene === PendingCountdownSceneFillContent) return '完善投递倒计时'
  if (scene === PendingCountdownScenePay) return '付款倒计时'
  return '倒计时'
})

const pendingCountdownRemainSeconds = computed(() => {
  const deadlineAt = Number(pendingCountdownRaw.value.deadline_at || 0)
  if (deadlineAt > 0) {
    return Math.max(0, deadlineAt - Number(nowUnixSec.value || 0))
  }
  const remaining = Number(pendingCountdownRaw.value.remaining_seconds || 0)
  return Math.max(0, remaining)
})

function formatCountdownDuration(totalSec) {
  const sec = Math.max(0, Number(totalSec || 0))
  const hh = Math.floor(sec / 3600)
  const mm = Math.floor((sec % 3600) / 60)
  const ss = sec % 60
  const mmText = String(mm).padStart(2, '0')
  const ssText = String(ss).padStart(2, '0')
  if (hh > 0) {
    return `${hh}:${mmText}:${ssText}`
  }
  return `${mmText}:${ssText}`
}

const pendingCountdownText = computed(() => formatCountdownDuration(pendingCountdownRemainSeconds.value))

const pendingCountdownVisible = computed(() => {
  if (!pendingCountdownRaw.value.active) return false
  if (pendingCountdownRaw.value.expired) return false
  return pendingCountdownRemainSeconds.value > 0
})

const itemFinalStateMap = computed(() => {
  const list = Array.isArray(submission.item_final_states) ? submission.item_final_states : []
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

const statusFlowMap = computed(() => {
  return Array.isArray(submission.status_flow_map) ? submission.status_flow_map : []
})

const statusFlowNode = computed(() => {
  const status = Number(submission.status || 0)
  return statusFlowMap.value.find((row) => Number(row?.status || 0) === status) || null
})

const currentItemProgressGuide = computed(() => {
  const itemID = Number(currentItem.value?.id || currentItem.value?.ID || 0)
  const guideList = Array.isArray(submission.item_progress_guides)
    ? submission.item_progress_guides
    : []
  if (itemID > 0) {
    const hit = guideList.find((row) => Number(row?.item_id || 0) === itemID)
    if (hit) return hit
  }
  if (guideList.length === 1) return guideList[0]
  if (statusFlowNode.value) {
    return {
      current_stage_text: statusFlowNode.value.status_text,
      next_action_text: statusFlowNode.value.next_action_text,
      next_status_text: statusFlowNode.value.next_status_text
    }
  }
  return null
})

const timelineNextActionText = computed(() => {
  const itemSpecific = buildItemSpecificNextActionText()
  if (itemSpecific) return itemSpecific

  const guide = currentItemProgressGuide.value
  if (!guide) {
    if (showSubmitMaterialShipBtn.value) {
      if (isThirdBlankShipFlow.value) return `请填写第三方发货单号，等待${creatorRoleText.value}签收`
      return `请提交${materialTargetText.value}物流，等待${creatorRoleText.value}签收`
    }
    if (showMaterialShipInfoCard.value) return `等待${creatorRoleText.value}签收${materialTargetText.value}`
    return '等待下一步'
  }
  const nextAction = String(guide.next_action_text || '').trim()
  if (nextAction) return normalizeCreatorRoleText(nextAction)
  const nextStatus = String(guide.next_status_text || '').trim()
  if (nextStatus) return `下一步：${normalizeCreatorRoleText(nextStatus)}`
  if (showSubmitMaterialShipBtn.value) {
    if (isThirdBlankShipFlow.value) return `请填写第三方发货单号，等待${creatorRoleText.value}签收`
    return `请提交${materialTargetText.value}物流，等待${creatorRoleText.value}签收`
  }
  if (showMaterialShipInfoCard.value) return `等待${creatorRoleText.value}签收${materialTargetText.value}`
  return '等待下一步'
})

function normalizeCreatorRoleText(raw) {
  const txt = String(raw || '').trim()
  if (!txt) return ''
  if (isHairOrder.value) return txt.replace(/妆师/g, '毛娘')
  return txt.replace(/毛娘/g, '妆师')
}

function parseProgressLogExtra(row) {
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

function isRejectNegotiationPending(row) {
  if (!row) return false
  const status = Number(row?.status || 0)
  if (status !== 0) return false
  const eventCode = String(row?.event_code || '').trim()
  if (eventCode === 'step_reject_negotiating' || eventCode === 'final_confirm_reject_negotiating') {
    return true
  }
  const extra = parseProgressLogExtra(row)
  return String(extra?.negotiation_state || '').trim() === 'pending_artist_decision'
}

const latestActionableLogMap = computed(() => {
  const logs = Array.isArray(submission.progress_logs) ? submission.progress_logs : []
  const out = {}
  logs.forEach((row) => {
    const itemID = Number(row?.submission_item_id || 0)
    if (itemID <= 0) return

    const logType = Number(row?.log_type || 0)
    const eventCode = String(row?.event_code || '').trim()
    let kind = ''
    if (logType === 1 || eventCode === 'step_request' || eventCode === 'step_confirmed' || eventCode === 'step_rejected') {
      kind = 'step'
    } else if (
      logType === 8 ||
      eventCode === 'final_confirm_request' ||
      eventCode === 'final_confirm_request_approved'
    ) {
      kind = 'final'
    }
    if (!kind) return

    const status = Number(row?.status || 0)
    const current = out[itemID]
    const ts = Number(row?.created_at || 0)
    const id = Number(row?.id || 0)
    if (
      !current ||
      ts > current.ts ||
      (ts === current.ts && id > current.id)
    ) {
      out[itemID] = {
        id,
        ts,
        kind,
        status,
        negotiationPending: isRejectNegotiationPending(row),
      }
    }
  })
  return out
})

function getLatestActionableLog(item) {
  const itemID = Number(item?.id || item?.ID || 0)
  if (!itemID) return null
  return latestActionableLogMap.value[itemID] || null
}

function buildItemAlertTag(item) {
  if (!item) return null
  const latest = getLatestActionableLog(item)
  if (!latest) return null

  if (latest.negotiationPending) {
    return latest.kind === 'final'
      ? { text: '终态协商中', type: 'final' }
      : { text: '节点协商中', type: 'step' }
  }
  if (latest.kind === 'final' && latest.status === 0) {
    return { text: '待你确认终态', type: 'final' }
  }
  if (latest.kind === 'step' && latest.status === 0) {
    return { text: '待你确认节点', type: 'step' }
  }
  return null
}

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

const currentItemNeedCompleteSelection = computed(() => {
  const row = currentItem.value || null
  if (!row) return false
  const tierTitle = String(row.tier_title || '').trim()
  const size = String(row.size || '').trim()
  return !tierTitle || !size
})

const currentItemAlertTag = computed(() => buildItemAlertTag(currentItem.value))

const isHairOrder = computed(() => Number(submission.artist_type || 0) === 2)
const creatorRoleText = computed(() => (isHairOrder.value ? '毛娘' : '妆师'))
const isTransferSubmissionPayment = computed(() => Number(submission.payment_method || 0) === 2)
const showTransferNodeNotice = computed(() => {
  if (!submission.viewer_is_buyer) return false
  if (!isTransferSubmissionPayment.value) return false
  return Number(submission.status || 0) >= SubmissionStatusPaid
})
const transferNodeNoticeText = computed(() => {
  return `当前订单为扫码转账，不支持中间节点的异议。若需要调整，请直接和${creatorRoleText.value}协商。`
})

const activeItemBlankSupplyMode = computed(() => {
  const row = currentItem.value || {}
  return normalizeBlankSupplyMode(row.blank_supply_mode || row.blankSupplyMode || '')
})

const activeItemBlankSnapshot = computed(() => {
  const row = currentItem.value || {}
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

const activeItemBlankPurchaseLink = computed(() => {
  const row = currentItem.value || {}
  return String(row.blank_purchase_link || row.blankPurchaseLink || '').trim()
})

const activeItemBlankIntroText = computed(() => {
  const row = currentItem.value || {}
  const raw = String(row.blank_intro || row.blankIntro || '').trim()
  if (!raw) return ''
  if (parseBlankStockSnapshot(raw)) return ''
  if (raw.startsWith('{') && raw.endsWith('}')) return ''
  return raw
})

const activeItemNeedReplaceBlank = computed(() => {
  const row = currentItem.value || {}
  return Number(row.blank_check_status || row.blankCheckStatus || 0) === 2
})

const blankCheckTagText = computed(() => {
  // 毛娘确认订单后（待付款及之后），不再展示毛坯审核角标。
  if (Number(submission.status || 0) >= SubmissionStatusSelectedPay) return ''
  const row = currentItem.value || {}
  const st = Number(row.blank_check_status || row.blankCheckStatus || 0)
  if (st === 1) return '毛坯可用'
  if (st === 2) return '需要更换'
  return ''
})

const showBlankSupplyCard = computed(() => {
  if (!currentItem.value) return false
  if (!isHairOrder.value) return false
  return !!activeItemBlankSupplyMode.value
})

watch(
  () => [
    Number(submission.plan_id || 0),
    Number(currentItem.value?.id || 0),
    activeItemBlankSupplyMode.value,
    getItemBlankStockID(currentItem.value || {}),
  ].join('|'),
  () => {
    ensureActiveItemBlankSnapshot()
  },
  { immediate: true }
)

const activeItemBuyerExpressNo = computed(() => {
  const row = currentItem.value || {}
  return String(row.buyer_express_no || row.buyerExpressNo || '').trim()
})

const activeItemBuyerExpressCompany = computed(() => {
  const row = currentItem.value || {}
  return String(row.buyer_express_company || row.buyerExpressCompany || '').trim()
})

const currentItemNeedsShippingMaterial = computed(() => {
  if (!currentItem.value) return false
  if (!isHairOrder.value) return true
  const mode = activeItemBlankSupplyMode.value
  if (mode === 'self') return true
  if (mode === 'third') return !!activeItemBlankPurchaseLink.value
  return false
})

const showMaterialShipInfoCard = computed(() => {
  if (!currentItem.value) return false
  if (!canViewItemDetail.value) return false
  const status = Number(currentItem.value?.status || 0)
  return (
    status === ItemStatusWaitBuyerShip ||
    status === ItemStatusBuyerShipped ||
    !!activeItemBuyerExpressNo.value
  )
})

const showSubmitMaterialShipBtn = computed(() => {
  if (!currentItem.value) return false
  if (submission.status !== SubmissionStatusPaid) return false
  if (!currentItemNeedsShippingMaterial.value) return false
  const status = Number(currentItem.value?.status || 0)
  return status === ItemStatusWaitBuyerShip || status === ItemStatusBuyerShipped
})

const isThirdBlankShipFlow = computed(() => (
  isHairOrder.value && activeItemBlankSupplyMode.value === 'third'
))

const materialTargetText = computed(() => {
  if (!isHairOrder.value) return '素头'
  if (isThirdBlankShipFlow.value) return '第三方毛坯'
  return '毛坯'
})

const materialShipPanelTitle = computed(() => (
  isThirdBlankShipFlow.value ? '第三方发货' : '素材寄送'
))

const materialShipExpressNoLabel = computed(() => (
  isThirdBlankShipFlow.value ? '发货单号' : '物流单号'
))

const materialShipStatusText = computed(() => {
  const status = Number(currentItem.value?.status || 0)
  const mode = activeItemBlankSupplyMode.value
  const hasPurchaseLink = !!activeItemBlankPurchaseLink.value
  if (status === ItemStatusBuyerShipped) return `${materialTargetText.value}寄送中`
  if (status === ItemStatusWaitBuyerShip) {
    if (isHairOrder.value && mode === 'stock') return `使用${creatorRoleText.value}现有毛坯，无需寄送`
    if (isHairOrder.value && mode === 'third' && !hasPurchaseLink) return `待${creatorRoleText.value}提供购买链接`
    if (isHairOrder.value && mode === 'third') return '待填写第三方发货单号'
    return `待寄送${materialTargetText.value}`
  }
  if (isHairOrder.value && mode === 'third' && !hasPurchaseLink) return `待${creatorRoleText.value}提供购买链接`
  if (activeItemBuyerExpressNo.value) {
    return isThirdBlankShipFlow.value ? '已提交第三方发货单号' : '已提交物流'
  }
  return '待更新'
})

const materialShipActionText = computed(() => {
  const status = Number(currentItem.value?.status || 0)
  if (status === ItemStatusBuyerShipped) {
    return isThirdBlankShipFlow.value ? '修改发货信息' : '修改寄送信息'
  }
  return isThirdBlankShipFlow.value ? '填写第三方发货单号' : '提交寄送信息'
})

const materialShipModalTitleText = computed(() => (
  isThirdBlankShipFlow.value ? '提交第三方发货信息' : `提交${materialTargetText.value}寄送信息`
))

const materialShipModalDescText = computed(() => {
  if (isThirdBlankShipFlow.value) {
    return `请在商家发货后填写第三方物流信息，方便${creatorRoleText.value}及时签收毛坯。`
  }
  return `请填写寄送给创作者的物流信息，方便对方及时签收${materialTargetText.value}。`
})

const materialShipExpressNoPlaceholder = computed(() => (
  isThirdBlankShipFlow.value ? '请填写第三方发货单号' : '请填写快递单号'
))

const materialShipCompanyPlaceholder = computed(() => (
  isThirdBlankShipFlow.value ? '请选择第三方快递公司' : '请选择快递公司'
))

const materialShipSubmitText = computed(() => (
  isThirdBlankShipFlow.value ? '提交发货信息' : '确认提交'
))

function buildItemSpecificNextActionText() {
  const item = currentItem.value
  if (!item) return ''
  if (Number(submission.status || 0) !== SubmissionStatusPaid) return ''

  const status = Number(item.status || 0)
  const role = creatorRoleText.value
  if (!isHairOrder.value) {
    if (status === ItemStatusOrdered) return `素材已签收，等待${role}创作中`
    if (status === ItemStatusWaitBuyerShip) return `请寄送素头给${role}并提交物流信息`
    if (status !== ItemStatusBuyerShipped) return ''
    return `等待${role}签收你寄送的素头`
  }

  const mode = activeItemBlankSupplyMode.value
  const hasPurchaseLink = !!activeItemBlankPurchaseLink.value
  if (mode === 'stock') {
    if (activeItemNeedReplaceBlank.value) {
      return `${role}建议更换毛坯，请先沟通替换方案`
    }
    return `使用${role}现有毛坯，无需寄送，等待${role}创作中`
  }

  if (mode === 'third' && !hasPurchaseLink) {
    return `等待${role}提供毛坯购买链接`
  }

  if (status === ItemStatusOrdered) {
    return `素材已签收，等待${role}创作中`
  }

  if (status === ItemStatusWaitBuyerShip) {
    if (mode === 'third') return `请在第三方发货后填写快递单号，便于${role}签收毛坯`
    if (activeItemNeedReplaceBlank.value) return '请更换毛坯后寄送，并提交物流信息'
    return `请寄送毛坯给${role}并提交物流信息`
  }
  if (status !== ItemStatusBuyerShipped) return ''
  return `等待${role}签收你寄送的毛坯`
}

function isItemNeedBuyerShipAction(item) {
  if (!item) return false
  if (Number(submission.status || 0) !== SubmissionStatusPaid) return false
  const status = Number(item.status || 0)
  if (status !== ItemStatusWaitBuyerShip) return false
  const mode = normalizeBlankSupplyMode(item.blank_supply_mode || item.blankSupplyMode || '')
  if (Number(submission.artist_type || 0) === 2) {
    if (mode === 'stock') return false
    if (mode === 'third') {
      const link = String(item.blank_purchase_link || item.blankPurchaseLink || '').trim()
      if (!link) return false
    }
  }
  return true
}

function isItemNeedArtistAction(item) {
  if (!item) return false
  if (Number(submission.status || 0) !== SubmissionStatusPaid) return false
  return Number(item.status || 0) === ItemStatusBuyerShipped
}

function getItemBuyerTodoCodes(item) {
  const list = item?.buyer_todo_codes || item?.buyerTodoCodes || []
  return Array.isArray(list) ? list : []
}

function hasItemBuyerTodo(item) {
  if (!item) return false
  if (item?.buyer_todo_pending === true || item?.buyerTodoPending === true) return true
  return getItemBuyerTodoCodes(item).length > 0
}

function tabNeedAttention(index) {
  const tab = tabList.value[index]
  if (!tab || tab.type !== 'item') return false
  const item = submission.items[tab.index] || null
  if (!item) return false

  if (submission.viewer_is_buyer) {
    return hasItemBuyerTodo(item)
  }

  const alert = buildItemAlertTag(item)
  if (submission.viewer_is_artist && alert && String(alert.text || '').includes('协商中')) {
    return true
  }
  if (submission.viewer_is_artist && isItemNeedArtistAction(item)) {
    return true
  }
  return false
}

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
  // 时间线只显示当前创作相关动态（全局事件 + 当前 item 事件）。
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
      const canOperate =
        logType === 1 &&
        status === 0 &&
        currentItemID > 0 &&
        itemID === currentItemID &&
        !isRejectNegotiationPending(row)
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

function formatBlankPrice(v) {
  const n = Number(v || 0)
  if (!Number.isFinite(n)) return '0.00'
  return n.toFixed(2)
}

async function ensureActiveItemBlankSnapshot() {
  const item = currentItem.value
  if (!item) return
  if (normalizeBlankSupplyMode(item.blank_supply_mode || item.blankSupplyMode || '') !== 'stock') return

  const blankStockID = getItemBlankStockID(item)
  if (blankStockID <= 0) return
  if (blankStockSnapshotMap.value[blankStockID]) return
  if (blankStockSnapshotLoadingMap.value[blankStockID]) return

  const planID = Number(submission.plan_id || 0)
  if (planID <= 0) return

  blankStockSnapshotLoadingMap.value = {
    ...blankStockSnapshotLoadingMap.value,
    [blankStockID]: true,
  }
  try {
    const snapshot = await fetchBlankStockSnapshotFromPlan(planID, blankStockID)
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

function openBlankPurchaseLink(url) {
  const target = String(url || '').trim()
  if (!target) return
  uni.setClipboardData({
    data: target,
    success: () => uni.showToast({ title: '链接已复制', icon: 'none' }),
    fail: () => uni.showToast({ title: '复制失败，请稍后重试', icon: 'none' })
  })
}

function buildAddressText(info) {
  return [
    String(info?.receiver_name || '').trim(),
    String(info?.receiver_phone || '').trim(),
    String(info?.full_address || '').trim()
  ].filter(Boolean).join(' ')
}

function copyCreatorAddress() {
  const text = buildAddressText(creatorAddressInfo.value)
  if (!text) {
    uni.showToast({ title: '暂未填写寄送地址', icon: 'none' })
    return
  }
  uni.setClipboardData({
    data: text,
    success: () => uni.showToast({ title: '地址已复制', icon: 'none' }),
    fail: () => uni.showToast({ title: '复制失败，请稍后重试', icon: 'none' })
  })
}

const materialShipCompanyOptions = [
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

function openMaterialShipModal() {
  if (!showSubmitMaterialShipBtn.value) return
  materialShipExpressNo.value = activeItemBuyerExpressNo.value || ''
  materialShipExpressCompany.value = activeItemBuyerExpressCompany.value || ''
  materialShipModalVisible.value = true
}

function closeMaterialShipModal() {
  if (materialShipSubmitting.value) return
  materialShipModalVisible.value = false
}

function chooseMaterialShipCompany() {
  if (!materialShipModalVisible.value || materialShipSubmitting.value) return
  uni.showActionSheet({
    itemList: materialShipCompanyOptions,
    success: ({ tapIndex }) => {
      const idx = Number(tapIndex || 0)
      if (idx >= 0 && idx < materialShipCompanyOptions.length) {
        materialShipExpressCompany.value = materialShipCompanyOptions[idx]
      }
    }
  })
}

function submitMaterialShip() {
  if (materialShipSubmitting.value) return
  if (!showSubmitMaterialShipBtn.value) return
  const itemID = Number(currentItem.value?.id || currentItem.value?.ID || 0)
  if (!itemID) {
    uni.showToast({ title: '缺少创作信息', icon: 'none' })
    return
  }
  const expressNo = String(materialShipExpressNo.value || '').trim()
  const expressCompany = String(materialShipExpressCompany.value || '').trim()
  if (!expressNo || !expressCompany) {
    uni.showToast({ title: '请填写完整物流信息', icon: 'none' })
    return
  }

  materialShipSubmitting.value = true
  uni.showLoading({ title: '提交中' })
  uni.request({
    url: `${websiteUrl.value}/with-state/artist-order/item/submit-material-ship`,
    method: 'POST',
    header: {
      Authorization: uni.getStorageSync('token'),
      'Content-Type': 'application/json'
    },
    data: {
      item_id: itemID,
      express_no: expressNo,
      express_company: expressCompany
    },
    success: (res) => {
      const body = res?.data || {}
      if (String(body.status).toLowerCase() !== 'success') {
        uni.showToast({ title: body.msg || '提交失败', icon: 'none' })
        return
      }
      uni.showToast({ title: '寄送信息已提交', icon: 'success' })
      materialShipModalVisible.value = false
      if (global.lastRefresh) global.lastRefresh.time = 0
      fetchDetail(true)
    },
    fail: () => {
      uni.showToast({ title: '提交失败，请稍后重试', icon: 'none' })
    },
    complete: () => {
      materialShipSubmitting.value = false
      uni.hideLoading()
    }
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

function formatMoneyText(amount) {
  const n = Number(amount || 0)
  if (!Number.isFinite(n)) return '0'
  return n.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1')
}

const planPaymentMethods = computed(() => {
  const list = Array.isArray(plan.payment_methods) ? plan.payment_methods : []
  return list.map((id) => Number(id || 0)).filter((id) => id > 0)
})

const planScanDepositRate = computed(() => {
  const raw = Number(plan.extra?.scan_deposit_rate || 0)
  if (!Number.isFinite(raw) || raw <= 0) return 100
  if (raw >= 100) return 100
  return Math.max(1, Math.floor(raw))
})

const confirmStageAmountText = computed(() => {
  const total = Number(totalPrice.value || 0)
  const totalText = `¥${formatMoneyText(total)}`
  const methods = planPaymentMethods.value
  const hasQRCode = methods.includes(1)
  const hasOnline = methods.includes(2)

  if (!hasQRCode && !hasOnline) return totalText

  if (hasQRCode) {
    const rate = planScanDepositRate.value
    if (rate >= 100) return `${totalText} 全款`
    const deposit = Number((total * rate / 100).toFixed(2))
    const depositText = `¥${formatMoneyText(deposit)} 定金`
    if (hasOnline) return `${depositText} 或 ${totalText} 全款`
    return depositText
  }

  return `${totalText} 全款`
})

function parseAddressInfo(raw) {
  if (!raw || typeof raw !== 'object') return null
  const receiverName = String(raw.receiver_name || raw.receiverName || '').trim()
  const receiverPhone = String(raw.receiver_phone || raw.receiverPhone || '').trim()
  const fullAddress = String(raw.full_address || raw.fullAddress || '').trim()
  if (!receiverName && !receiverPhone && !fullAddress) return null
  return {
    receiver_name: receiverName,
    receiver_phone: receiverPhone,
    full_address: fullAddress
  }
}

function formatDeadlineRemainText(totalSec) {
  const sec = Math.max(0, Number(totalSec || 0))
  if (sec <= 0) return '已超时'
  const days = Math.floor(sec / 86400)
  const hours = Math.floor((sec % 86400) / 3600)
  const minutes = Math.floor((sec % 3600) / 60)
  const seconds = sec % 60
  if (days > 0) return `${days}天${String(hours).padStart(2, '0')}小时`
  if (hours > 0) return `${hours}小时${String(minutes).padStart(2, '0')}分钟`
  return `${String(minutes).padStart(2, '0')}分钟${String(seconds).padStart(2, '0')}秒`
}

const returnAddressInfo = computed(() => {
  return parseAddressInfo(submission.return_address_info)
})

const creatorAddressInfo = computed(() => {
  return parseAddressInfo(submission.creator_address_info)
})

const shippingDeadlineInfo = computed(() => {
  const raw = submission.shipping_deadline
  if (!raw || typeof raw !== 'object' || !raw.active) return null
  return {
    active: true,
    deadline_type: String(raw.deadline_type || '').trim() === 'ship' ? 'ship' : 'arrival',
    deadline_type_text: String(raw.deadline_type_text || '').trim(),
    deadline_date: String(raw.deadline_date || '').trim(),
    deadline_at: Number(raw.deadline_at || 0),
    remaining_seconds: Number(raw.deadline_at || 0) > 0
      ? Math.max(0, Number(raw.deadline_at || 0) - Number(nowUnixSec.value || 0))
      : Math.max(0, Number(raw.remaining_seconds || 0)),
    expired: !!raw.expired
  }
})

const showMaterialShipDeadlineInfo = computed(() => {
  const deadline = shippingDeadlineInfo.value
  if (!deadline || !currentItem.value || !currentItemNeedsShippingMaterial.value) return false
  const status = Number(currentItem.value?.status || 0)
  const receivedAt = Number(currentItem.value?.artist_received_at || currentItem.value?.artistReceivedAt || 0)
  if (receivedAt > 0) return false
  if (deadline.deadline_type === 'ship') return status === ItemStatusWaitBuyerShip
  return status === ItemStatusWaitBuyerShip || status === ItemStatusBuyerShipped
})

const materialShipDeadlineLabel = computed(() => (
  shippingDeadlineInfo.value?.deadline_type === 'ship' ? '剩余寄送时间' : '剩余寄到时间'
))

const materialShipDeadlineText = computed(() => {
  const deadline = shippingDeadlineInfo.value
  if (!deadline) return ''
  return formatDeadlineRemainText(deadline.remaining_seconds)
})

const effectiveReturnAddressReady = computed(() => {
  return !!submission.return_address_ready || !!returnAddressInfo.value
})

const effectiveReturnAddressInfo = computed(() => returnAddressInfo.value)

const reviewInfo = computed(() => {
  const raw = submission.review_info
  if (!raw || typeof raw !== 'object') return null
  const score = Number(raw.score || 0)
  const content = String(raw.content || '').trim()
  const createdAt = Number(raw.created_at || raw.createdAt || 0)
  const sourceImages = Array.isArray(raw.images) ? raw.images : []
  const images = sourceImages.map((item) => String(item || '').trim()).filter(Boolean)
  if (!content && !images.length && score <= 0) return null
  return {
    score,
    content,
    created_at: createdAt,
    images
  }
})

const showDeliveryFlowCard = computed(() => {
  if (![SubmissionStatusPaid, SubmissionStatusReturned, SubmissionStatusFinished].includes(Number(submission.status || 0))) return false
  return (
    !!submission.return_address_requested ||
    effectiveReturnAddressReady.value ||
    !!submission.return_shipped ||
    !!submission.return_received ||
    !!submission.review_submitted ||
    !!reviewInfo.value
  )
})

const canEditReturnAddress = computed(() => {
  if (submission.status !== SubmissionStatusPaid) return false
  if (!submission.return_address_requested) return false
  return !submission.return_shipped && !submission.return_received
})

const canConfirmReceived = computed(() => {
  return [SubmissionStatusPaid, SubmissionStatusReturned].includes(Number(submission.status || 0)) && !!submission.can_confirm_received
})

const canOpenReview = computed(() => {
  return [SubmissionStatusPaid, SubmissionStatusReturned, SubmissionStatusFinished].includes(Number(submission.status || 0)) && !!submission.can_submit_review
})

const deliveryActionList = computed(() => {
  const list = []
  if (canEditReturnAddress.value) {
    list.push({
      key: 'address',
      label: effectiveReturnAddressReady.value ? '修改寄回地址' : '填写寄回地址',
      tone: 'secondary'
    })
  }
  if (canConfirmReceived.value) {
    list.push({
      key: 'received',
      label: '确认结束',
      tone: 'primary'
    })
  }
  if (canOpenReview.value) {
    list.push({
      key: 'review',
      label: '写评价',
      tone: 'primary'
    })
  }
  return list
})

const reviewContentLength = computed(() => Array.from(String(reviewContent.value || '')).length)

const canSubmitReviewForm = computed(() => {
  if (reviewUploading.value || reviewSubmitting.value) return false
  return reviewContentLength.value > 0 || reviewImages.value.length > 0
})

// 底部按钮
const bottomAction = computed(() => {
  const status = Number(submission.status || 0)
  const txt = String(submission.status_text || '')
  if (txt.includes('待买家确认') || status === SubmissionStatusSelectedConfirm) return 'confirm'
  if (txt.includes('待付款') || status === SubmissionStatusSelectedPay) return 'pay'
  if (status === SubmissionStatusPaid) {
    const paymentMethod = Number(submission.payment_method || 0)
    const payStatus = Number(submission.pay_status || 0)
    // 扫码转账在“已付定金”状态下，仍需展示“去付款”以补尾款。
    if (paymentMethod === PlanPaymentMethodQRCode && payStatus !== PayStatusPaid) {
      return 'pay'
    }
  }
  return ''
})
const bottomActionText = computed(() => {
  if (bottomAction.value === 'confirm') return '确认订单'
  if (bottomAction.value === 'pay') return '去付款'
  return ''
})

const bottomAmountText = computed(() => {
  if (bottomAction.value === 'confirm') return confirmStageAmountText.value
  return `¥ ${formatMoneyText(totalPrice.value)}`
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

const selectedMethodIsAlipay = computed(() => {
  return Number(selectedPayMethod.value?.id || 0) === PlanPaymentMethodAlipay
})

const payPopupStage = computed(() => {
  return String(payPopupData.value?.current_pay_stage || '').trim().toLowerCase()
})

const selectedMethodCodeOptions = computed(() => {
  const list = selectedPayMethod.value?.code_options
  return Array.isArray(list) ? list : []
})

function withBuyerFeeSuffix(baseLabel, amountItem) {
  const fee = Number(amountItem?.buyer_fee_amount || 0)
  if (!Number.isFinite(fee) || fee <= 0) return baseLabel
  return `${baseLabel}（含手续费¥${formatMoneyText(fee)}）`
}

const selectedMethodPayAmountOptions = computed(() => {
  const methodID = Number(selectedPayMethod.value?.id || 0)
  const list = Array.isArray(selectedPayMethod.value?.pay_amount_options)
    ? selectedPayMethod.value.pay_amount_options
    : []
  if (!list.length) return []

  let normalized = list.map((item) => {
    const payPart = String(item?.pay_part || '').trim().toLowerCase()
    const amount = Number(item?.amount || 0)
    return {
      ...item,
      pay_part: payPart,
      amount: Number.isFinite(amount) ? amount : 0
    }
  })

  // 扫码转账在首付阶段仅允许“定金”支付，不开放“全款”入口。
  if (methodID === PlanPaymentMethodQRCode && payPopupStage.value === 'initial') {
    const hasDeposit = normalized.some((item) => item.pay_part === 'deposit')
    if (hasDeposit) {
      normalized = normalized.filter((item) => item.pay_part === 'deposit')
    }
  }

  if (methodID === PlanPaymentMethodQRCode) {
    const rate = planScanDepositRate.value
    return normalized.map((item) => {
      const part = String(item.pay_part || '').trim().toLowerCase()
      const amountText = `¥${formatMoneyText(item.amount)}`
      if (part === 'deposit') {
        return {
          ...item,
          label: withBuyerFeeSuffix(`${amountText} 定金（${rate}%）`, item)
        }
      }
      if (part === 'balance') {
        return {
          ...item,
          label: withBuyerFeeSuffix(`${amountText} 尾款`, item)
        }
      }
      if (part === 'full' && rate >= 100 && payPopupStage.value === 'initial') {
        return {
          ...item,
          label: withBuyerFeeSuffix(`${amountText} 定金（100%）`, item)
        }
      }
      if (part === 'full') {
        return {
          ...item,
          label: withBuyerFeeSuffix(`${amountText} 全款`, item)
        }
      }
      return {
        ...item,
        label: withBuyerFeeSuffix(String(item?.label || amountText), item)
      }
    })
  }

  if (methodID === PlanPaymentMethodAlipay) {
    return normalized.map((item) => {
      const part = String(item.pay_part || '').trim().toLowerCase()
      const amountText = `¥${formatMoneyText(item.amount)}`
      if (part === 'full') return { ...item, label: withBuyerFeeSuffix(`${amountText} 全款`, item) }
      if (part === 'balance') return { ...item, label: withBuyerFeeSuffix(`${amountText} 尾款`, item) }
      if (part === 'deposit') return { ...item, label: withBuyerFeeSuffix(`${amountText} 定金`, item) }
      return { ...item, label: withBuyerFeeSuffix(String(item?.label || amountText), item) }
    })
  }

  return normalized
})

const selectedPayAmountOption = computed(() => {
  const payPart = String(selectedPayPart.value || '').trim().toLowerCase()
  if (!payPart) return null
  return selectedMethodPayAmountOptions.value.find(
    item => String(item?.pay_part || '').trim().toLowerCase() === payPart
  ) || null
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

const platformEscrowNoticeText = computed(() => {
  const txt = String(payPopupData.value?.platform_escrow_notice || '').trim()
  if (txt) return txt
  return '使用支付宝付款后，款项会先由平台托管，交易完成前不会直接打给创作者。若在节点确认后取消订单，创作者会收到已确认节点对应的赔偿金额。若发生吞头吞钱跑路等恶性交易违约事件，我们会先协助您追回娃头；若娃头最终无法追回，狗狗助手会按一手原价赔付娃头损失。'
})

const transferRiskNoticeText = computed(() => {
  const txt = String(payPopupData.value?.transfer_risk_notice || '').trim()
  if (txt) return txt
  return '使用转账支付会直接把钱转入妆师/毛娘账户。狗狗助手会对入驻妆师/毛娘进行实名扫脸，并验证其在其它平台有 100 单成交记录且无重大交易纠纷。但转账付款客观存在风险。由于资金不经过狗狗助手账户，在这种交易模式下，我们仅对吞头吞钱跑路等恶性交易违约事件负责。我们会替您追回娃头；若娃头最终无法追回，狗狗助手会按一手原价赔付娃头损失。'
})

function normalizeStepPercent(raw) {
  const num = Number(raw || 0)
  if (!Number.isFinite(num) || num <= 0) return 0
  if (num <= 1) return Number((num * 100).toFixed(1))
  return Number(num.toFixed(1))
}

function formatStepPercentText(step) {
  const ratio = normalizeStepPercent(
    step?.compensation_rate ??
      step?.breach_compensation_rate ??
      step?.penalty_rate ??
      0
  )
  const text = Number.isInteger(ratio) ? String(ratio) : String(ratio)
  return `${text}%`
}

const paymentStepPreviewList = computed(() => {
  const rows = Array.isArray(submission.step_configs) ? submission.step_configs : []
  const out = []
  rows.forEach((row, idx) => {
    const name = String(row?.name || '').trim()
    if (!name) return
    out.push({
      id: Number(row?.id || idx + 1),
      name,
      percentText: formatStepPercentText(row)
    })
  })
  return out
})

const canSubmitPayFromPopup = computed(() => {
  const methodID = Number(selectedPayMethodId.value || 0)
  if (!methodID) return false
  if (!selectedMethodPayAmountOptions.value.length) return false
  if (!selectedPayAmountOption.value) return false
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
    order_id: '',
    plan_id: 0,
    status: 0,
    status_text: '',
    payment_type: 0,
    pay_status: 0,
    ahead_count: 0,
    artist_type: 0,
    step_configs: [],
    progress_logs: [],
    items: [],
    item_final_states: [],
    status_flow_map: [],
    item_progress_guides: [],
    can_fill_return_address: false,
    return_address_requested: false,
    return_address_ready: false,
    return_address_info: null,
    return_shipped: false,
    return_received: false,
    can_confirm_received: false,
    review_submitted: false,
    can_submit_review: false,
    review_info: null,
    return_express_no: '',
    pending_countdown: {
      active: false,
      scene: '',
      label: '',
      total_seconds: 0,
      deadline_at: 0,
      remaining_seconds: 0,
      expired: false
    }
  })
  draftItems.value = []
  currentTabIndex.value = 0
  stepActioningLogID.value = 0
  reviewModalVisible.value = false
  resetReviewForm()
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
  const nextFocusItemID = Number(opts.focus_item_id || opts.item_id || 0)
  if (nextFocusItemID > 0) {
    focusItemID.value = nextFocusItemID
  }

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
    nextFocusItemID,
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
    if (!body) return

    const resolveH5PageScrollContainer = () => {
      const pageBodies = document.querySelectorAll('uni-page-body')
      if (pageBodies && pageBodies.length > 0) {
        return pageBodies[pageBodies.length - 1]
      }
      const pageWrappers = document.querySelectorAll('uni-page-wrapper')
      if (pageWrappers && pageWrappers.length > 0) {
        return pageWrappers[pageWrappers.length - 1]
      }
      return document.scrollingElement || document.documentElement
    }

    const isFromPayPopup = (e) => {
      const rawTarget = e?.target
      if (!rawTarget) return false
      const target = rawTarget.nodeType === 3 ? rawTarget.parentElement : rawTarget
      if (!target || typeof target.closest !== 'function') return false
      return !!target.closest('.pay-sheet')
    }

    if (locked) {
      if (h5ScrollLockApplied) return
      h5ScrollLockApplied = true
      if (body.style.position === 'fixed' && body.style.top) {
        body.style.position = ''
        body.style.top = ''
        body.style.left = ''
        body.style.right = ''
        body.style.width = ''
      }

      h5PageScrollEl = resolveH5PageScrollContainer()
      h5PageOverscrollBehaviorBackup = h5PageScrollEl?.style?.overscrollBehavior || ''
      h5PageTouchActionBackup = h5PageScrollEl?.style?.touchAction || ''
      if (h5PageScrollEl && h5PageScrollEl.style) {
        h5PageScrollEl.style.overscrollBehavior = 'none'
        h5PageScrollEl.style.touchAction = 'none'
      }

      h5DocTouchMoveHandler = (e) => {
        if (isFromPayPopup(e)) return true
        if (e && typeof e.preventDefault === 'function' && e.cancelable) {
          e.preventDefault()
        }
        return false
      }
      h5DocWheelHandler = (e) => {
        if (isFromPayPopup(e)) return true
        if (e && typeof e.preventDefault === 'function' && e.cancelable) {
          e.preventDefault()
        }
        return false
      }
      document.addEventListener('touchmove', h5DocTouchMoveHandler, { passive: false })
      document.addEventListener('wheel', h5DocWheelHandler, { passive: false })
      return
    }

    if (!h5ScrollLockApplied) return
    h5ScrollLockApplied = false
    if (h5PageScrollEl && h5PageScrollEl.style) {
      h5PageScrollEl.style.overscrollBehavior = h5PageOverscrollBehaviorBackup || ''
      h5PageScrollEl.style.touchAction = h5PageTouchActionBackup || ''
    }
    h5PageScrollEl = null
    h5PageOverscrollBehaviorBackup = ''
    h5PageTouchActionBackup = ''

    if (h5DocTouchMoveHandler) {
      document.removeEventListener('touchmove', h5DocTouchMoveHandler)
      h5DocTouchMoveHandler = null
    }
    if (h5DocWheelHandler) {
      document.removeEventListener('wheel', h5DocWheelHandler)
      h5DocWheelHandler = null
    }
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
  const subID = overviewEntrySubmissionID(entry)
  return `${subID}-${itemID}`
}

function overviewEntrySubmissionID(entry) {
  const subID = Number(entry?.submission?.id || entry?.submission?.ID || 0)
  if (subID > 0) return subID
  return Number(entry?.item?.submission_id || entry?.item?.SubmissionID || 0)
}

function overviewEntryHasItem(entry) {
  if (entry?.has_submission_item === true) return true
  if (entry?.has_submission_item === false) return false
  return Number(entry?.item?.id || entry?.item?.ID || 0) > 0
}

function overviewEntryTitle(entry) {
  if (!overviewEntryHasItem(entry)) return '待填写投递内容'
  const subject = String(entry?.item?.work_subject || '').trim()
  if (subject) return subject
  const subID = overviewEntrySubmissionID(entry)
  return subID ? `投递 #${subID}` : '未命名投递'
}

function overviewEntryStatus(entry) {
  if (!overviewEntryHasItem(entry)) {
    const subText = String(entry?.submission_status_text || '').trim()
    return subText || '等待填写'
  }
  const itemText = String(entry?.item_status_text || '').trim()
  const subText = String(entry?.submission_status_text || '').trim()
  if (itemText && subText) return `${itemText} · ${subText}`
  return itemText || subText || '状态未知'
}

function overviewEntryTime(entry) {
  const latestTs = Number(entry?.latest_progress?.created_at || 0)
  if (latestTs > 0) return formatTimelineTime(latestTs)
  const updated = Number(entry?.item?.updated_at || 0)
  if (updated > 0) return formatTimelineTime(updated)
  const subUpdated = Number(entry?.submission?.updated_at || 0)
  if (subUpdated > 0) return formatTimelineTime(subUpdated)
  return '--'
}

function overviewEntryThumb(entry) {
  return getFirstRefImage(entry?.item?.ref_images || '')
}

function previewOverviewEntryImages(entry, current = 0) {
  const raw = String(entry?.item?.ref_images || '').trim()
  if (!raw) return
  const urls = raw.split(',').map(item => String(item || '').trim()).filter(Boolean)
  if (!urls.length) return
  uni.previewImage({
    urls,
    current: urls[Math.max(0, Math.min(current, urls.length - 1))]
  })
}

function isOverviewCurrentSubmission(entry) {
  const entrySubmissionID = overviewEntrySubmissionID(entry)
  const currentSubmissionID = Number(submission.submission_id || submissionId.value || 0)
  return entrySubmissionID > 0 && currentSubmissionID > 0 && entrySubmissionID === currentSubmissionID
}

function overviewEntrySequence(entry, idx) {
  const displayNo = Number(entry?.display_order_no || entry?._display_queue_no || 0)
  if (displayNo > 0) {
    return `No.${String(displayNo).padStart(3, '0')}`
  }
  const queueNo = Number(entry?.item?.queue_no || 0)
  const orderNo = queueNo > 0 ? queueNo : (Number(idx) + 1)
  return `No.${String(orderNo).padStart(3, '0')}`
}

function overviewEntryOrderTag(entry, idx) {
  const base = overviewEntrySequence(entry, idx)
  if (isOverviewCurrentSubmission(entry)) {
    return `${base} · 您的订单`
  }
  return base
}

function overviewEntryExtraItemCount(entry) {
  const total = Number(entry?._submission_item_count || 0)
  if (!Number.isFinite(total) || total <= 1) return 0
  return total - 1
}

const showOverviewTailFade = computed(() => {
  if (!overviewCurrentPlanItems.value.length) return false
  if (progressOverviewAppending.value) return false
  return !progressOverviewHasMore.value
})

function pickOverviewEntryBySubmission(rows, currentSubmissionID, preferredItemID) {
  const groupMap = new Map()
  const order = []
  rows.forEach((row) => {
    const submissionID = overviewEntrySubmissionID(row)
    if (submissionID <= 0) return
    if (!groupMap.has(submissionID)) {
      groupMap.set(submissionID, [])
      order.push(submissionID)
    }
    groupMap.get(submissionID).push(row)
  })

  const normalized = []
  order.forEach((submissionID) => {
    const list = groupMap.get(submissionID) || []
    if (!list.length) return

    let picked = list[0]
    if (submissionID === currentSubmissionID && preferredItemID > 0) {
      const hit = list.find((row) => Number(row?.item?.id || row?.item?.ID || 0) === preferredItemID)
      if (hit) picked = hit
    }

    normalized.push({
      ...picked,
      _submission_item_count: list.length,
    })
  })

  return normalized
}

function handleOverviewReachEnd() {
  if (!progressOverviewHasMore.value) return
  fetchProgressOverview({ append: true })
}

function resetProgressOverviewState() {
  progressOverviewError.value = ''
  progressOverviewLoaded.value = false
  overviewCurrentPlanItems.value = []
  progressOverviewHasMore.value = false
  progressOverviewCursor.value = 0
  progressOverviewPageSize.value = 20
  progressOverviewAppending.value = false
  progressOverviewAnchorID.value = 0
}

function mergeOverviewEntries(existing, incoming) {
  if (!existing.length) return incoming
  if (!incoming.length) return existing
  const out = existing.slice()
  const seen = new Set(existing.map((row) => overviewEntrySubmissionID(row)).filter((id) => id > 0))
  incoming.forEach((row) => {
    const subID = overviewEntrySubmissionID(row)
    if (subID > 0 && seen.has(subID)) return
    if (subID > 0) seen.add(subID)
    out.push(row)
  })
  return out
}

async function fetchProgressOverview(options = {}) {
  const force = !!options.force
  const append = !!options.append

  if (progressOverviewLoading.value || progressOverviewAppending.value) return
  if (append && !progressOverviewHasMore.value) return
  if (!append && progressOverviewLoaded.value && !force) return
  if (!isLogin.value) {
    progressOverviewError.value = '请先登录'
    return
  }

  if (append) {
    progressOverviewAppending.value = true
  } else {
    progressOverviewLoading.value = true
    progressOverviewError.value = ''
  }

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

    if (!append && (force || progressOverviewAnchorID.value !== currentSubmissionID)) {
      overviewCurrentPlanItems.value = []
      progressOverviewHasMore.value = false
      progressOverviewCursor.value = 0
    }

    const cursorSubmissionID = append ? Number(progressOverviewCursor.value || 0) : 0
    const size = Number(progressOverviewPageSize.value || 20)

    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/item-progress-overview`,
      method: 'GET',
      header: { Authorization: token },
      data: {
        submission_id: currentSubmissionID,
        plan_id: planID,
        brand_id: brandID,
        size,
        cursor_submission_id: cursorSubmissionID
      }
    })
    const body = res?.data || {}
    if (String(body.status).toLowerCase() !== 'success') {
      throw new Error(body.msg || '加载订单动态失败')
    }
    const d = body.data || {}
    const rows = Array.isArray(d.current_plan_items) ? d.current_plan_items.slice() : []
    const currentItemID = Number(currentItem.value?.id || focusItemID.value || 0)
    const normalizedRows = pickOverviewEntryBySubmission(rows, currentSubmissionID, currentItemID)
    const mergedRows = append
      ? mergeOverviewEntries(overviewCurrentPlanItems.value, normalizedRows)
      : normalizedRows

    overviewCurrentPlanItems.value = mergedRows.map((row, idx) => ({
      ...row,
      // 兼容后端未返回 display_order_no 的场景，前端按列表顺序兜底编号。
      _display_queue_no: Number(row?.display_order_no || 0) > 0 ? Number(row.display_order_no) : (Number(idx) + 1),
    }))
    progressOverviewHasMore.value = !!d.has_more_front_items
    progressOverviewCursor.value = Number(d.next_front_cursor_submission_id || 0)
    progressOverviewPageSize.value = Number(d.front_page_size || size)
    progressOverviewAnchorID.value = currentSubmissionID
    progressOverviewLoaded.value = true
  } catch (e) {
    if (!append) {
      progressOverviewError.value = e?.message || '加载订单动态失败'
    }
  } finally {
    progressOverviewLoading.value = false
    progressOverviewAppending.value = false
  }
}

async function openProgressOverview() {
  progressOverviewVisible.value = true
  await fetchProgressOverview()
}

function reloadProgressOverview() {
  fetchProgressOverview({ force: true })
}

function timelineTitle(row) {
  const logType = Number(row?.log_type || 0)
  const status = Number(row?.status || 0)
  const stepName = String(row?.step_name || '').trim()
  const eventCode = String(row?.event_code || '').trim()
  if (eventCode === 'step_reject_negotiating') return '节点协商中'
  if (eventCode === 'final_confirm_reject_negotiating') return '最终状态协商中'
  if (eventCode === 'step_reject_agree_modify') return '创作者同意修改'
  if (eventCode === 'final_confirm_reject_agree_modify') return '创作者同意修改最终状态'
  if (eventCode === 'final_product_confirmed') return '买家已确认最终状态'
  if (eventCode === 'final_confirm_request') return status === 0 ? '最终状态确认（待你确认）' : '最终状态确认'
  if (eventCode === 'return_address_request') {
    if (stepName) return stepName
    if (submission.return_address_ready) return '订单收尾'
    return '等待填写寄回地址'
  }
  if (eventCode === 'blank_check_approved') return '毛坯判断通过'
  if (eventCode === 'blank_check_replace') return '毛坯需要更换'
  if (eventCode === 'blank_purchase_link') return '毛坯购买链接'
  if (eventCode === 'buyer_ship_material') return '素材已寄送'
  if (eventCode === 'artist_receive_material') return '素材已签收'
  if (eventCode === 'return_shipped') return '创作者已寄回'
  if (eventCode === 'return_received') return '订单已完结'
  if (eventCode === 'trade_reviewed') return '买家已评价'
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
  if (eventCode === 'step_reject_negotiating') return '买家驳回了该节点，等待创作者处理协商。'
  if (eventCode === 'final_confirm_reject_negotiating') return '买家拒绝了最终状态，等待创作者处理协商。'
  if (eventCode === 'step_reject_agree_modify' || eventCode === 'final_confirm_reject_agree_modify') {
    return '创作者已同意修改，后续会重新提交状态。'
  }
  if (eventCode === 'final_product_confirmed') return '买家已确认最终成品。'
  if (eventCode === 'final_confirm_request') return '创作者已提交最终状态，请你确认（确认时需选择寄回地址）。'
  if (eventCode === 'return_address_request') {
    if (submission.return_address_ready) return '创作者已进入订单收尾，可填写寄回单号。'
    return '创作者发起结单，请买家填写寄回地址。'
  }
  if (eventCode === 'blank_check_approved') return '创作者已确认当前毛坯可用。'
  if (eventCode === 'blank_check_replace') return '创作者建议更换毛坯，请按要求重新寄送。'
  if (eventCode === 'blank_purchase_link') return '创作者提供了毛坯购买链接。'
  if (eventCode === 'buyer_ship_material') return '你已提交素材寄送物流信息。'
  if (eventCode === 'artist_receive_material') return '创作者已确认收到你寄送的素材。'
  if (eventCode === 'return_shipped') return '创作者已寄回，等待买家确认结束。'
  if (eventCode === 'return_received') return '你已确认这次订单结束。'
  if (eventCode === 'trade_reviewed') return '你已完成订单评价。'
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

function applyFocusItemByID(itemID) {
  const targetID = Number(itemID || 0)
  if (!targetID) return
  const idx = submission.items.findIndex((item) => Number(item?.id || item?.ID || 0) === targetID)
  if (idx >= 0) {
    currentTabIndex.value = idx
    focusItemID.value = 0
  }
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

watch(reviewModalVisible, (visible) => {
  if (visible || reviewSubmitting.value) return
  resetReviewForm()
})

watch(materialShipModalVisible, (visible) => {
  if (visible || materialShipSubmitting.value) return
  materialShipExpressNo.value = ''
  materialShipExpressCompany.value = ''
})

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
    uni.navigateTo({
      url: `/pkg-creator/creator_base/creator_profile/creator_profile?brand_id=${brandId}&type=artist`
    })
  } else if (submission.artist_type === 2) {
    uni.navigateTo({
      url: `/pkg-creator/creator_base/creator_profile/creator_profile?brand_id=${brandId}&type=hair`
    })
  }
}

function goChooseReturnAddress() {
  if (!submission.submission_id) {
    uni.showToast({ title: '缺少订单参数', icon: 'none' })
    return
  }
  uni.navigateTo({
    url: `/pkg-creator/creator_order/return_address/return_address?submission_id=${submission.submission_id}`
  })
}

async function confirmReturnReceived() {
  if (!canConfirmReceived.value) return
  uni.showLoading({ title: '确认中' })
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/submission/confirm-received`,
      method: 'POST',
      header: {
        Authorization: uni.getStorageSync('token'),
        'Content-Type': 'application/json'
      },
      data: {
        submission_id: submission.submission_id
      }
    })
    const body = res?.data || {}
    if (String(body.status).toLowerCase() !== 'success') {
      uni.showToast({ title: body.msg || '确认结束失败', icon: 'none' })
      return
    }
    uni.showToast({ title: '订单已完结', icon: 'success' })
    if (global.lastRefresh) global.lastRefresh.time = 0
    fetchDetail(true)
  } catch (e) {
    uni.showToast({ title: '确认结束失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

function resetReviewForm() {
  reviewContent.value = ''
  reviewImages.value = []
  reviewUploading.value = false
  reviewUploadText.value = ''
}

function openReviewModal() {
  if (!canOpenReview.value) return
  reviewModalVisible.value = true
}

function closeReviewModal() {
  if (reviewSubmitting.value) return
  reviewModalVisible.value = false
}

function previewReviewImages(index) {
  if (!reviewImages.value.length) return
  uni.previewImage({
    current: reviewImages.value[index] || reviewImages.value[0],
    urls: reviewImages.value
  })
}

function removeReviewImage(index) {
  const list = reviewImages.value.slice()
  if (index < 0 || index >= list.length) return
  list.splice(index, 1)
  reviewImages.value = list
}

async function pickReviewImages() {
  const remain = reviewMaxImages - reviewImages.value.length
  if (remain <= 0) {
    uni.showToast({ title: `最多上传${reviewMaxImages}张返图`, icon: 'none' })
    return
  }
  try {
    const files = await chooseImageList(remain)
    if (!Array.isArray(files) || !files.length) return
    reviewUploading.value = true
    reviewUploadText.value = '准备上传...'
    for (let i = 0; i < files.length; i++) {
      reviewUploadText.value = `上传中 (${i + 1}/${files.length})`
      const tk = await getQiniuToken()
      if (!tk?.token || !tk?.path) {
        throw new Error('获取上传凭证失败')
      }
      const ret = await uploadImageToQiniu(files[i], tk.token, tk.path)
      const url = String(ret?.imageUrl || '').trim()
      if (!url) {
        throw new Error('上传失败，请重试')
      }
      reviewImages.value.push(url)
      if (reviewImages.value.length >= reviewMaxImages) break
    }
    reviewUploadText.value = ''
  } catch (e) {
    uni.showToast({ title: e?.message || '上传失败', icon: 'none' })
  } finally {
    reviewUploading.value = false
  }
}

async function submitReview() {
  if (!canSubmitReviewForm.value || reviewSubmitting.value) return
  reviewSubmitting.value = true
  uni.showLoading({ title: '提交中' })
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/submission/review`,
      method: 'POST',
      header: {
        Authorization: uni.getStorageSync('token'),
        'Content-Type': 'application/json'
      },
      data: {
        submission_id: submission.submission_id,
        content: reviewContent.value,
        images: reviewImages.value
      }
    })
    const body = res?.data || {}
    if (String(body.status).toLowerCase() !== 'success') {
      uni.showToast({ title: body.msg || '提交评价失败', icon: 'none' })
      return
    }
    uni.showToast({ title: '评价已提交', icon: 'success' })
    reviewModalVisible.value = false
    resetReviewForm()
    if (global.lastRefresh) global.lastRefresh.time = 0
    fetchDetail(true)
  } catch (e) {
    uni.showToast({ title: '提交评价失败', icon: 'none' })
  } finally {
    reviewSubmitting.value = false
    uni.hideLoading()
  }
}

function handleDeliveryAction(actionKey) {
  if (actionKey === 'address') {
    goChooseReturnAddress()
    return
  }
  if (actionKey === 'received') {
    uni.showModal({
      title: '确认结束',
      content: '确认这次订单已经完成，可以正式结束了吗？',
      confirmText: '确认结束',
      cancelText: '再看看',
      success: ({ confirm }) => {
        if (!confirm) return
        confirmReturnReceived()
      }
    })
    return
  }
  if (actionKey === 'review') {
    openReviewModal()
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
        order_id: String(d.order_id || '').trim(),
        plan_id: d.plan_id,
        status: d.status,
        status_text: d.status_text,
        payment_type: Number(d.payment_type || 0),
        pay_status: Number(d.pay_status || 0),
        ahead_count: d.ahead_count,
        viewer_is_buyer: !!d.viewer_is_buyer,
        artist_type: d.artist_type, // 修改点：赋值 artist_type
        payment_method: Number(d.payment_method || 0),
        step_configs: Array.isArray(d.step_configs) ? d.step_configs : [],
        progress_logs: Array.isArray(d.progress_logs) ? d.progress_logs : [],
        items: d.items || [],
        item_final_states: Array.isArray(d.item_final_states) ? d.item_final_states : [],
        status_flow_map: Array.isArray(d.status_flow_map) ? d.status_flow_map : [],
        item_progress_guides: Array.isArray(d.item_progress_guides) ? d.item_progress_guides : [],
        buyer_todo_pending: !!d.buyer_todo_pending,
        buyer_todo_count: Number(d.buyer_todo_count || 0),
        buyer_todo_codes: Array.isArray(d.buyer_todo_codes) ? d.buyer_todo_codes : [],
        can_fill_return_address: !!d.can_fill_return_address,
        return_address_requested: !!d.return_address_requested,
        return_address_ready: !!d.return_address_ready,
        return_address_info: d.return_address_info || null,
        return_shipped: !!d.return_shipped,
        return_received: !!d.return_received,
        can_confirm_received: !!d.can_confirm_received,
        review_submitted: !!d.review_submitted,
        can_submit_review: !!d.can_submit_review,
        review_info: d.review_info || null,
        return_express_no: d.return_express_no || '',
        creator_address_info: d.creator_address_info || null,
        shipping_deadline: (d.shipping_deadline && typeof d.shipping_deadline === 'object')
          ? d.shipping_deadline
          : {
              active: false,
              mode: '',
              deadline_type: '',
              deadline_type_text: '',
              deadline_date: '',
              deadline_at: 0,
              remaining_seconds: 0,
              expired: false
            },
        pending_countdown: (d.pending_countdown && typeof d.pending_countdown === 'object')
          ? d.pending_countdown
          : {
              active: false,
              scene: '',
              label: '',
              total_seconds: 0,
              deadline_at: 0,
              remaining_seconds: 0,
              expired: false
            }
      })
      draftItems.value = d.draft_items || []
      applyFocusItemByID(focusItemID.value)
      ensureActiveItemBlankSnapshot()
      if (force) {
        progressOverviewLoaded.value = false
      }
      fetchProgressOverview({ force })
      
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
        order_type: d.order_type,
        order_config: d.order_config || ''
      })

      try {
        let cfg = {}
        if (typeof d.order_config === 'string') {
          cfg = d.order_config ? JSON.parse(d.order_config) : {}
        } else if (d.order_config && typeof d.order_config === 'object') {
          cfg = d.order_config
        }
        plan.extra = cfg?.extra && typeof cfg.extra === 'object' ? cfg.extra : {}
        plan.payment_methods = Array.isArray(cfg?.payment_methods) ? cfg.payment_methods : []
      } catch (_) {
        plan.extra = {}
        plan.payment_methods = []
      }
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

function syncSelectedPayPart() {
  const options = selectedMethodPayAmountOptions.value
  if (!options.length) {
    selectedPayPart.value = ''
    payDebug('syncSelectedPayPart:clear_no_options')
    return
  }
  const current = String(selectedPayPart.value || '').trim().toLowerCase()
  const exists = options.some(item => String(item?.pay_part || '').trim().toLowerCase() === current)
  if (!exists) {
    selectedPayPart.value = String(options[0]?.pay_part || '').trim().toLowerCase()
    payDebug('syncSelectedPayPart:auto_select_first', { pay_part: selectedPayPart.value })
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
  syncSelectedPayPart()
  syncSelectedPayCodeChannel()
  payDebug('applyPayPopupDefaultSelection:after', {
    selectedPayMethodId: selectedPayMethodId.value,
    selectedPayPart: selectedPayPart.value,
    selectedPayCodeChannel: selectedPayCodeChannel.value
  })
}

function selectPayMethod(methodID) {
  selectedPayMethodId.value = Number(methodID || 0)
  syncSelectedPayPart()
  syncSelectedPayCodeChannel()
  payDebug('selectPayMethod', {
    methodID: selectedPayMethodId.value,
    selectedPayPart: selectedPayPart.value,
    selectedMethodIsQRCode: selectedMethodIsQRCode.value,
    code_options_count: selectedMethodCodeOptions.value.length,
    selectedPayCodeChannel: selectedPayCodeChannel.value,
    selectedPayCodeUrl: selectedPayCodeUrl.value
  })
}

function selectPayPart(payPart) {
  const normalized = String(payPart || '').trim().toLowerCase()
  if (!normalized) return
  selectedPayPart.value = normalized
  payDebug('selectPayPart', {
    pay_part: selectedPayPart.value,
    amount_label: selectedPayAmountOption.value?.label || ''
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
    selectedPayPart: selectedPayPart.value,
    selectedPayCodeChannel: selectedPayCodeChannel.value,
    payPopupVisible: payPopupVisible.value,
    payCodeModalVisible: payCodeModalVisible.value,
    openingPayCodeModal: openingPayCodeModal.value
  })
  payPopupData.value = null
  selectedPayMethodId.value = 0
  selectedPayPart.value = ''
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

async function submitPayRequest(paymentMethod, paymentCodeChannel = '', payPart = '') {
  const proofImages = payProofImages.value.slice()
  const paymentMessage = String(payMessage.value || '').trim()
  payDebug('submitPayRequest:start', {
    submission_id: submission.submission_id,
    payment_method: Number(paymentMethod || 0),
    pay_part: String(payPart || ''),
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
        pay_part: String(payPart || ''),
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

// 先向后端创建平台支付单，由后端生成签名后的支付宝 order string。
async function createPlatformPaymentOrder(provider = 'alipay', channel = 'app') {
  const res = await uni.request({
    url: `${websiteUrl.value}/with-state/artist-order/platform-payment/create`,
    method: 'POST',
    header: { Authorization: uni.getStorageSync('token') },
    data: {
      submission_id: Number(submission.submission_id || 0),
      provider: String(provider || '').trim().toLowerCase(),
      channel: String(channel || 'app').trim().toLowerCase()
    }
  })
  const body = res.data || {}
  payDebug('createPlatformPaymentOrder:response', body)
  // 只要后端没有成功创建支付单，就不要继续拉起支付宝 SDK。
  if (String(body.status).toLowerCase() !== 'success') {
    throw new Error(body.msg || '创建平台支付订单失败')
  }
  const payload = body.data || {}
  const payURL = String(payload.pay_url || '').trim()
  const orderString = String(payload.order_string || payload.pay_url || '').trim()
  if (!orderString && !payURL) {
    throw new Error('支付参数缺失')
  }
  return {
    bizOrderNo: String(payload.biz_order_no || '').trim(),
    orderString,
    payURL,
    raw: payload
  }
}

function savePendingH5Payment(order) {
  // #ifdef H5
  try {
    uni.setStorageSync(H5_PENDING_ALIPAY_PAYMENT_KEY, {
      bizOrderNo: String(order?.bizOrderNo || '').trim(),
      submissionID: Number(submissionId.value || submission?.submission_id || 0),
      provider: 'alipay',
      createdAt: Date.now()
    })
  } catch (e) {
    payDebug('savePendingH5Payment:error', { message: e?.message || String(e) })
  }
  // #endif
}

function getPendingH5Payment() {
  // #ifdef H5
  try {
    const raw = uni.getStorageSync(H5_PENDING_ALIPAY_PAYMENT_KEY)
    if (!raw || typeof raw !== 'object') return null
    const bizOrderNo = String(raw.bizOrderNo || '').trim()
    if (!bizOrderNo) return null
    return {
      bizOrderNo,
      submissionID: Number(raw.submissionID || 0),
      provider: String(raw.provider || '').trim().toLowerCase(),
      createdAt: Number(raw.createdAt || 0)
    }
  } catch (e) {
    payDebug('getPendingH5Payment:error', { message: e?.message || String(e) })
  }
  // #endif
  return null
}

function clearPendingH5Payment() {
  // #ifdef H5
  try {
    uni.removeStorageSync(H5_PENDING_ALIPAY_PAYMENT_KEY)
  } catch (e) {
    payDebug('clearPendingH5Payment:error', { message: e?.message || String(e) })
  }
  // #endif
}

// 支付宝客户端结果只做“本地态”判断，最终业务成功仍以后端状态为准。
function parseAlipayResultStatus(err, result) {
  const status = String(result?.resultStatus || err?.resultStatus || '').trim()
  if (ALIPAY_APP_PAY_SUCCESS_CODES.includes(status)) return 'success'
  if (ALIPAY_APP_PAY_WAITING_CODES.includes(status)) return 'pending'
  return 'failed'
}

// 真正拉起支付宝收银台，只允许在 uni-app 原生 App 环境执行。
async function invokeAlipayAppPay(orderString) {
  // #ifndef APP-PLUS
  throw new Error('支付宝 APP 支付仅支持 App 端（APP-PLUS）')
  // #endif

  // #ifdef APP-PLUS
  const value = await new Promise((resolve, reject) => {
    uni.requestPayment({
      provider: 'alipay',
      orderInfo: String(orderString || ''),
      success: (res) => resolve(res || {}),
      fail: (err) => reject(err || new Error('支付宝拉起失败'))
    })
  })
  return value
  // #endif
}

async function invokeAlipayH5Pay(order) {
  // #ifndef H5
  throw new Error('支付宝 H5 支付仅支持 H5 页面')
  // #endif

  // #ifdef H5
  const payURL = String(order?.payURL || order?.orderString || '').trim()
  if (!payURL) {
    throw new Error('支付链接缺失')
  }
  savePendingH5Payment(order)
  closePayPopup()
  payCodeModalVisible.value = false
  setH5PageScrollLock(false)
  window.location.href = payURL
  return true
  // #endif
}

// 客户端支付后主动回查本地支付单，避免只依赖 SDK 回调导致状态漂移。
async function queryPlatformPaymentStatus(bizOrderNo) {
  const res = await uni.request({
    url: `${websiteUrl.value}/with-state/artist-order/platform-payment/status`,
    method: 'GET',
    header: { Authorization: uni.getStorageSync('token') },
    data: { biz_order_no: String(bizOrderNo || '').trim() }
  })
  const body = res.data || {}
  payDebug('queryPlatformPaymentStatus:response', body)
  if (String(body.status).toLowerCase() !== 'success') {
    throw new Error(body.msg || '查询支付状态失败')
  }
  return body.data || {}
}

async function tryResumePendingH5Payment() {
  // #ifndef H5
  return
  // #endif

  // #ifdef H5
  const pending = getPendingH5Payment()
  if (!pending) return
  if (pending.provider !== 'alipay') {
    clearPendingH5Payment()
    return
  }
  if (pending.submissionID > 0 && Number(submissionId.value || 0) > 0 && pending.submissionID !== Number(submissionId.value || 0)) {
    return
  }

  payDebug('tryResumePendingH5Payment:start', pending)
  try {
    const statusResp = await queryPlatformPaymentStatus(pending.bizOrderNo)
    const finalStatus = String(statusResp?.status || '').toLowerCase()
    if (finalStatus === 'succeeded') {
      clearPendingH5Payment()
      uni.showToast({ title: '支付成功', icon: 'success' })
      if (global.lastRefresh) global.lastRefresh.time = 0
      fetchDetail()
      resetPayState()
      return
    }
    if (finalStatus === 'failed' || finalStatus === 'closed') {
      clearPendingH5Payment()
      uni.showToast({ title: '支付未完成', icon: 'none' })
      fetchDetail()
      return
    }
    payDebug('tryResumePendingH5Payment:pending', statusResp)
  } catch (err) {
    payDebug('tryResumePendingH5Payment:error', {
      message: err?.message || err?.errMsg || String(err)
    })
  }
  // #endif
}

// 支付宝 APP 支付主流程：
// 1. 创建平台支付单
// 2. 拉起支付宝 SDK
// 3. 回查服务端状态并刷新当前页面
async function runAlipayAppPaymentFlow() {
  uni.showLoading({ title: '拉起支付宝中' })
  try {
    const order = await createPlatformPaymentOrder('alipay', 'app')
    const payResult = await invokeAlipayAppPay(order.orderString)
    const localStatus = parseAlipayResultStatus(null, payResult)
    payDebug('runAlipayAppPaymentFlow:pay_result', {
      localStatus,
      resultStatus: payResult?.resultStatus,
      memo: payResult?.memo,
      result: payResult?.result
    })

    if (localStatus === 'failed') {
      const failMsg = String(payResult?.memo || '支付未完成').trim() || '支付未完成'
      throw new Error(failMsg)
    }

    // 不管支付宝端返回 success/pending，都回查服务端状态，避免客户端状态漂移。
    let statusResp = null
    for (let i = 0; i < 4; i++) {
      statusResp = await queryPlatformPaymentStatus(order.bizOrderNo)
      // 服务端一旦确认成功，就以服务端结果为准结束流程。
      if (String(statusResp.status || '').toLowerCase() === 'succeeded') {
        break
      }
      // 给异步回调一点落库时间，避免用户刚支付完就立刻查到 pending。
      if (i < 3) {
        await new Promise(resolve => setTimeout(resolve, 1500))
      }
    }

    const finalStatus = String(statusResp?.status || '').toLowerCase()
    if (finalStatus === 'succeeded') {
      // 成功后统一刷新详情页，让投稿状态和支付状态一起更新。
      uni.showToast({ title: '支付成功', icon: 'success' })
      if (global.lastRefresh) global.lastRefresh.time = 0
      fetchDetail()
      resetPayState()
      closePayPopup()
      payCodeModalVisible.value = false
      return
    }
    if (localStatus === 'pending') {
      // 支付宝端还在处理中时，不直接判失败，提示用户稍后刷新即可。
      uni.showToast({ title: '支付结果确认中，请稍后刷新', icon: 'none' })
      fetchDetail()
      return
    }
    throw new Error(`支付未完成，当前状态：${finalStatus || 'unknown'}`)
  } catch (err) {
    const msg = String(err?.message || err?.errMsg || '支付失败').trim()
    payDebug('runAlipayAppPaymentFlow:error', {
      message: msg,
      raw: err
    })
    uni.showToast({ title: msg || '支付失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

async function runAlipayH5PaymentFlow() {
  uni.showLoading({ title: '跳转支付中' })
  try {
    const order = await createPlatformPaymentOrder('alipay', 'h5')
    await invokeAlipayH5Pay(order)
  } catch (err) {
    clearPendingH5Payment()
    const msg = String(err?.message || err?.errMsg || '支付失败').trim()
    payDebug('runAlipayH5PaymentFlow:error', {
      message: msg,
      raw: err
    })
    uni.showToast({ title: msg || '支付失败', icon: 'none' })
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
    selectedPayMethodId: selectedPayMethodId.value,
    selectedPayPart: selectedPayPart.value
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
    selectedPayPart: selectedPayPart.value,
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

  payDebug('confirmPayFromPopup:platform_pay_start', {
    selectedPayMethodId: selectedPayMethodId.value
  })
  // 支付宝方式走新的“平台代收 + SDK 拉起”链路；
  // 其它方式继续保留原来的提交流程，避免影响既有逻辑。
  if (Number(selectedPayMethodId.value || 0) === PlanPaymentMethodAlipay) {
    // #ifdef H5
    await runAlipayH5PaymentFlow()
    return
    // #endif
    await runAlipayAppPaymentFlow()
    return
  }
  await submitPayRequest(
    Number(selectedPayMethodId.value || 0),
    '',
    String(selectedPayPart.value || '')
  )
}

async function confirmPayFromCodeModal() {
  syncSelectedPayCodeChannel()
  payDebug('confirmPayFromCodeModal:clicked', {
    selectedPayMethodId: selectedPayMethodId.value,
    selectedPayPart: selectedPayPart.value,
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
    String(selectedPayCodeChannel.value || ''),
    String(selectedPayPart.value || '')
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

watch(selectedPayPart, (val) => {
  payDebug('watch:selectedPayPart', { value: val })
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

function startCountdownTicker() {
  nowUnixSec.value = Math.floor(Date.now() / 1000)
  if (countdownTicker) return
  countdownTicker = setInterval(() => {
    nowUnixSec.value = Math.floor(Date.now() / 1000)
  }, 1000)
}

function stopCountdownTicker() {
  if (!countdownTicker) return
  clearInterval(countdownTicker)
  countdownTicker = null
}

onLoad((opt) => {
  const snap = getCurrentPageSnapshot()
  const merged = Object.assign({}, opt || {}, snap?.opts || {})
  lastRouteKey.value = String(snap?.key || buildStableQueryString(merged) || '')
  applyRouteOptionsAndRefresh(merged, 'onLoad')
})

onPageScroll((e) => {
  scrollTop.value = Number(e?.scrollTop || 0)
})
onShow(() => {
  bindH5HashChangeListener()
  startCountdownTicker()
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
    tryResumePendingH5Payment()
    startPolling(true)
  }
})
onHide(() => {
  unbindH5HashChangeListener()
  setH5PageScrollLock(false)
  stopPolling()
  stopCountdownTicker()
})
onUnload(() => {
  unbindH5HashChangeListener()
  setH5PageScrollLock(false)
  stopPolling()
  stopCountdownTicker()
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

@keyframes overviewLineFlow {
  0% {
    background-position: 0 50%, 0 50%;
  }
  100% {
    background-position: 0 50%, -180rpx 50%;
  }
}

@keyframes overviewDotFlow {
  0% {
    background-position: 160% 50%;
  }
  100% {
    background-position: -60% 50%;
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

.nav-back-pill--transparent {
  background: rgba(0, 0, 0, 0.32);
  backdrop-filter: blur(8px);
}

.nav-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-center--transparent {
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

.nav-title-ellipsis--ghost {
  color: #ffffff;
  text-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.3);
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
  gap: 10rpx;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: #f5f7fa;
  border: 1rpx solid #e2e7ee;
}
.chat-icon {
  width: 30rpx;
  height: 30rpx;
  opacity: 0.85;
}
.chat-pill-text {
  font-size: 24rpx;
  color: #4b5563;
  white-space: nowrap;
  line-height: 1.2;
}
.chat-arrow {
  opacity: 0.75;
}

/* ====== 信息栏 (垂直列表布局) ====== */
.section-info-list {
  margin-top: 70rpx; /* 增大留白 */
  display: flex;
  flex-direction: column;
  gap: 54rpx; /* 增大行间距 */
}

.return-address-tip-card {
  margin-top: 30rpx;
  background: #eef4ff;
  border-radius: 18rpx;
  padding: 16rpx 18rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}
.return-address-tip-main {
  min-width: 0;
}
.return-address-tip-title {
  display: block;
  font-size: 24rpx;
  color: #2f3e57;
}
.return-address-tip-desc {
  display: block;
  margin-top: 4rpx;
  font-size: 22rpx;
  color: #69809a;
}

.return-address-preview-card {
  margin-top: 30rpx;
  background: #f4f7fb;
  border-radius: 18rpx;
  padding: 16rpx 18rpx;
}
.return-address-preview-title {
  display: block;
  font-size: 23rpx;
  color: #4b5b74;
}
.return-address-preview-line {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  line-height: 1.5;
  color: #6f8197;
}
.delivery-flow-area {
  margin-top: 24rpx;
}
.delivery-flow-text {
  display: block;
  font-size: 24rpx;
  line-height: 1.6;
  color: #5f738a;
}
.delivery-status-chip {
  margin-top: 14rpx;
  padding: 16rpx 18rpx;
  border-radius: 18rpx;
  background: #f4f7fb;
}
.delivery-status-chip.success {
  background: #e9f8f2;
}
.delivery-status-label {
  display: block;
  font-size: 22rpx;
  color: #70839b;
}
.delivery-status-value {
  display: block;
  margin-top: 6rpx;
  font-size: 24rpx;
  color: #283446;
}
.review-preview-card {
  margin-top: 14rpx;
  padding: 18rpx;
  border-radius: 18rpx;
  background: #f5f7fb;
}
.review-preview-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}
.review-preview-title {
  font-size: 24rpx;
  color: #243246;
}
.review-preview-score {
  font-size: 22rpx;
  color: #78daf5;
  font-weight: 700;
}
.review-preview-content {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.65;
  color: #55677f;
}
.review-preview-images {
  margin-top: 12rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}
.review-preview-image {
  width: 124rpx;
  height: 124rpx;
  border-radius: 18rpx;
  background: #e9eef5;
}
.delivery-action-row {
  margin-top: 18rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}
.delivery-action-btn {
  min-width: 196rpx;
  height: 74rpx;
  padding: 0 26rpx;
  border-radius: 999rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #eef2f7;
  color: #2d394b;
  font-size: 24rpx;
  font-weight: 600;
  box-sizing: border-box;
}
.delivery-action-btn.primary {
  background: #78daf5;
  color: #fff;
}
.review-modal {
  padding: 14rpx 4rpx 6rpx;
}
.review-modal-title {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  color: #233145;
  text-align: center;
}
.review-modal-desc {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.6;
  color: #71839a;
  text-align: center;
}
.review-textarea {
  width: 100%;
  min-height: 180rpx;
  margin-top: 24rpx;
  padding: 20rpx 22rpx;
  border-radius: 22rpx;
  background: #f5f7fb;
  box-sizing: border-box;
  font-size: 26rpx;
  color: #243246;
}
.review-count {
  display: block;
  margin-top: 10rpx;
  text-align: right;
  font-size: 22rpx;
  color: #90a0b5;
}
.review-upload-head {
  margin-top: 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.review-upload-title {
  font-size: 24rpx;
  color: #243246;
}
.review-upload-sub {
  font-size: 22rpx;
  color: #90a0b5;
}
.review-image-list {
  margin-top: 12rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}
.review-image-item,
.review-image-add {
  width: 132rpx;
  height: 132rpx;
  border-radius: 20rpx;
  background: #f3f6fb;
  position: relative;
  overflow: hidden;
}
.review-image-photo {
  width: 100%;
  height: 100%;
}
.review-image-remove {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 36rpx;
  height: 36rpx;
  border-radius: 999rpx;
  background: rgba(35, 49, 69, 0.72);
  color: #fff;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
.review-image-add {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #7f90a8;
}
.review-image-add-icon {
  font-size: 42rpx;
  line-height: 1;
}
.review-image-add-text {
  margin-top: 8rpx;
  font-size: 22rpx;
}
.review-uploading {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  color: #78daf5;
}
.review-modal-actions {
  margin-top: 28rpx;
  display: flex;
  gap: 12rpx;
}
.review-modal-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 999rpx;
  border: none;
  font-size: 26rpx;
  font-weight: 600;
}
.review-modal-btn::after {
  border: none;
}
.review-modal-btn.cancel {
  background: #eef2f7;
  color: #2d394b;
}
.review-modal-btn.confirm {
  background: #78daf5;
  color: #fff;
}
.review-modal-btn.confirm.disabled {
  opacity: 0.45;
}

.material-ship-modal {
  width: 100%;
  padding: 8rpx 6rpx 24rpx;
  box-sizing: border-box;
}
.material-ship-modal-title {
  display: block;
  font-size: 32rpx;
  color: #243246;
  text-align: center;
}
.material-ship-modal-desc {
  display: block;
  margin-top: 10rpx;
  font-size: 23rpx;
  color: #72839a;
  line-height: 1.6;
  text-align: center;
}
.material-ship-form-row {
  margin-top: 18rpx;
  padding: 0 2rpx;
}
.material-ship-form-label {
  display: block;
  margin-bottom: 8rpx;
  font-size: 22rpx;
  color: #8f9db3;
}
.material-ship-form-input {
  width: 100%;
  height: 78rpx;
  border-radius: 14rpx;
  background: #f5f7fb;
  padding: 0 20rpx;
  box-sizing: border-box;
  font-size: 25rpx;
  color: #26354a;
}
.material-ship-form-picker {
  width: 100%;
  height: 78rpx;
  border-radius: 14rpx;
  background: #f5f7fb;
  padding: 0 20rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
  font-size: 24rpx;
  color: #4e6079;
}
.material-ship-form-picker .placeholder {
  color: #a4b0c1;
}
.material-ship-modal-actions {
  margin-top: 24rpx;
  display: flex;
  gap: 12rpx;
}
.material-ship-modal-btn {
  flex: 1;
  height: 78rpx;
  border-radius: 999rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  font-size: 25rpx;
  font-weight: 600;
}
.material-ship-modal-btn::after {
  border: none;
}
.material-ship-modal-btn.cancel {
  background: #eef2f7;
  color: #2d394b;
}
.material-ship-modal-btn.confirm {
  background: #78daf5;
  color: #fff;
}
.material-ship-modal-btn.confirm.disabled {
  opacity: 0.45;
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

.info-val-countdown {
  color: #ff7fae;
  letter-spacing: 1rpx;
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

.tab-attention-mark {
  position: absolute;
  right: 7rpx;
  top: -33rpx;
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
  animation: tab-attention-wobble 1s ease-in-out infinite;
}

.tab-item .tab-attention-mark {
  color: #ffa4ce !important;
  -webkit-text-fill-color: #ffa4ce !important;
}

.tab-item.active .tab-attention-mark {
  color: #ffa4ce !important;
  -webkit-text-fill-color: #ffa4ce !important;
  text-shadow: 0 0 12rpx rgba(255, 164, 206, 0.5);
}

@keyframes tab-attention-wobble {
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

.item-complete-wrap {
  position: relative;
  border-radius: 28rpx;
}

.item-complete-wrap.is-incomplete {
  border: 4rpx solid #ff9ac5;
  padding: 12rpx;
}

.item-complete-tag {
  position: absolute;
  right: 10rpx;
  top: -20rpx;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  color: #fff;
  background: #ff7fb3;
  z-index: 5;
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
  align-items: center;
  gap: 14rpx;
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

.blank-supply-card {
  margin-top: 14rpx;
  border-radius: 20rpx;
  padding: 20rpx;
  background: #f5f9ff;
}
.blank-supply-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10rpx;
}
.blank-supply-title {
  font-size: 24rpx;
  color: #34435a;
}
.blank-check-tag {
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  color: #257258;
  background: #d7f5ea;
}
.blank-check-tag.replace {
  color: #97503c;
  background: #ffe5db;
}
.blank-supply-mode {
  display: block;
  margin-top: 10rpx;
  font-size: 23rpx;
  color: #52617c;
}
.blank-stock-card {
  margin-top: 12rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 10rpx 12rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.92);
}
.blank-stock-cover {
  width: 86rpx;
  height: 86rpx;
  border-radius: 12rpx;
  background: #edf2f8;
  flex-shrink: 0;
}
.blank-stock-main {
  min-width: 0;
  flex: 1;
}
.blank-stock-name {
  display: block;
  font-size: 24rpx;
  color: #2c394e;
}
.blank-stock-meta {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #6d7c95;
}
.blank-stock-fallback {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  color: #52617c;
  line-height: 1.6;
}
.blank-link-text {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  line-height: 1.55;
  color: #3f79b2;
  word-break: break-all;
}
.material-ship-panel {
  margin-top: 14rpx;
  border-radius: 20rpx;
  padding: 18rpx;
  background: #f5f9ff;
}
.material-ship-info {
  padding: 14rpx 16rpx;
  border-radius: 14rpx;
  background: rgba(255, 255, 255, 0.86);
}
.material-ship-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10rpx;
}
.material-ship-row + .material-ship-row {
  margin-top: 8rpx;
}
.material-ship-label {
  font-size: 22rpx;
  color: #8f9db3;
  flex-shrink: 0;
}
.material-ship-value {
  font-size: 22rpx;
  color: #51627c;
  text-align: right;
  word-break: break-all;
}
.material-ship-address-card {
  margin-top: 12rpx;
  padding: 16rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.92);
}
.material-ship-address-card.modal {
  margin-top: 16rpx;
  margin-bottom: 12rpx;
}
.material-ship-address-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}
.material-ship-address-title {
  font-size: 22rpx;
  color: #7f8da5;
}
.material-ship-address-copy {
  font-size: 22rpx;
  color: #78daf5;
}
.material-ship-address-main {
  margin-top: 10rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-wrap: wrap;
}
.material-ship-address-name,
.material-ship-address-phone {
  font-size: 26rpx;
  color: #2b3648;
  font-weight: 700;
}
.material-ship-address-line {
  margin-top: 10rpx;
  display: block;
  font-size: 22rpx;
  line-height: 1.6;
  color: #5f7088;
  word-break: break-word;
}
.material-ship-deadline-card {
  margin-top: 14rpx;
  margin-bottom: 12rpx;
  padding: 14rpx 16rpx;
  border-radius: 16rpx;
  background: #f6faff;
}
.material-ship-deadline-label {
  font-size: 22rpx;
  color: #7f8da5;
}
.material-ship-deadline-value {
  margin-top: 8rpx;
  display: block;
  font-size: 26rpx;
  color: #2c3c51;
  font-weight: 700;
}
.material-ship-btn {
  margin-top: 14rpx;
  height: 70rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #8fdcf8 0%, #72c7ec 100%);
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.material-ship-btn.disabled {
  background: #e8edf4;
  color: #a0adbd;
}

.item-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  max-width: 280rpx;
  /* 限制行数 */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}

.item-alert-bubble {
  position: relative;
  flex-shrink: 0;
  transform: translateY(-12rpx);
  border-radius: 999rpx;
  padding: 6rpx 16rpx;
  font-size: 18rpx;
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: 0.5rpx;
  white-space: nowrap;
  border: 1rpx solid #f5d3e2;
  color: #5a4169;
  background: linear-gradient(135deg, #fff9d8 0%, #ffe9f4 55%, #e8f4ff 100%);
  box-shadow:
    0 8rpx 20rpx rgba(226, 130, 171, 0.2),
    0 0 0 3rpx rgba(255, 242, 248, 0.7);
  animation: itemAlertBubbleFloat 1.9s ease-in-out infinite;
}

.item-alert-bubble::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -8rpx;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 7rpx solid transparent;
  border-right: 7rpx solid transparent;
  border-top: 9rpx solid #ffeef6;
}

.item-alert-bubble-final {
  border-color: #f2b5cf;
}

.item-alert-bubble-step {
  border-color: #c7dff6;
  background: linear-gradient(135deg, #eef8ff 0%, #e9f0ff 55%, #f6eeff 100%);
  color: #3f5671;
}

@keyframes itemAlertBubbleFloat {
  0%,
  100% {
    transform: translateY(-12rpx);
  }
  50% {
    transform: translateY(-16rpx);
  }
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

.item-view-detail-btn {
  min-width: 132rpx;
  height: 48rpx;
  line-height: 48rpx;
  border-radius: 999rpx;
  text-align: center;
  font-size: 21rpx;
  color: #5d6f88;
  background: #edf2f9;
  border: none;
  margin-bottom: 8rpx;
  padding: 0 16rpx;
}

/* 进度 */
.timeline-area {
  margin-top: 60rpx; /* 增大留白 */
  padding-left: 10rpx;
}
.transfer-node-notice {
  margin-top: 20rpx;
  padding: 16rpx 18rpx;
  border-radius: 16rpx;
  background: linear-gradient(135deg, #edf6fc 0%, #f4f8fc 100%);
  display: flex;
  align-items: flex-start;
  gap: 10rpx;
}
.transfer-node-notice-text {
  flex: 1;
  font-size: 24rpx;
  line-height: 1.5;
  color: #61798b;
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
  &.guide {
    background: #bcc5cf;
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

.overview-inline-panel {
  margin-top: 24rpx;
  padding: 24rpx 22rpx 20rpx;
  border-radius: 28rpx;
  background: linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(246,249,252,0.98) 100%);
  box-shadow: 0 16rpx 30rpx rgba(54, 71, 91, 0.08);
}

.overview-inline-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  margin-bottom: 18rpx;
}

.overview-inline-title {
  font-size: 28rpx;
  color: #27313a;
}

.overview-inline-actions {
  display: flex;
  align-items: center;
  gap: 18rpx;
  flex-shrink: 0;
}

.overview-inline-action {
  font-size: 22rpx;
  color: #8e99a3;
}

.overview-inline-expand {
  display: inline-flex;
  align-items: center;
  gap: 4rpx;
}

.overview-inline-loading,
.overview-inline-error {
  padding: 16rpx 0 6rpx;
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
  gap: 12rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
}

.overview-empty-row {
  font-size: 22rpx;
  color: #98a1a8;
  padding: 16rpx 0;
}

.overview-timeline-scroll {
  width: 100%;
  white-space: nowrap;
}

.overview-scroll-wrap {
  position: relative;
  width: 100%;
}

.overview-timeline-track {
  display: inline-flex;
  align-items: flex-start;
  gap: 0;
  padding: 8rpx 8rpx 12rpx 2rpx;
  box-sizing: border-box;
}

.overview-timeline-node {
  width: 248rpx;
  flex: 0 0 248rpx;
  min-width: 248rpx;
  position: relative;
}

.overview-node-top {
  position: relative;
  height: 34rpx;
  margin-bottom: 16rpx;
  overflow: visible;
}

.overview-node-dot {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 18rpx;
  height: 18rpx;
  border-radius: 50%;
  background: linear-gradient(
    90deg,
    rgba(138, 155, 171, 0.88) 0%,
    rgba(231, 238, 244, 0.98) 52%,
    rgba(138, 155, 171, 0.88) 100%
  );
  background-size: 240% 100%;
  animation: overviewDotFlow 2.3s linear infinite;
  transform: translate(-50%, -50%);
  z-index: 2;
}

.overview-node-dot.current {
  width: 22rpx;
  height: 22rpx;
  background: #8fd2e2;
  background-size: 100% 100%;
  animation: none;
  box-shadow: 0 0 0 8rpx rgba(73, 202, 238, 0.16);
}

.overview-node-line {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 100%;
  height: 8rpx;
  border-radius: 999rpx;
  background:
    linear-gradient(90deg, rgba(168, 188, 203, 0.34) 0%, rgba(168, 188, 203, 0.34) 100%),
    repeating-linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.08) 0rpx,
      rgba(255, 255, 255, 0.08) 16rpx,
      rgba(236, 244, 250, 0.78) 16rpx,
      rgba(236, 244, 250, 0.78) 28rpx,
      rgba(255, 255, 255, 0.08) 28rpx,
      rgba(255, 255, 255, 0.08) 44rpx
    );
  background-size: 100% 100%, 220rpx 100%;
  animation: overviewLineFlow 2.1s linear infinite;
  transform: translateY(-50%);
  z-index: 1;
}

.overview-node-line.current {
  background:
    linear-gradient(90deg, rgba(168, 188, 203, 0.34) 0%, rgba(168, 188, 203, 0.34) 100%),
    repeating-linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.08) 0rpx,
      rgba(255, 255, 255, 0.08) 16rpx,
      rgba(236, 244, 250, 0.78) 16rpx,
      rgba(236, 244, 250, 0.78) 28rpx,
      rgba(255, 255, 255, 0.08) 28rpx,
      rgba(255, 255, 255, 0.08) 44rpx
    );
  background-size: 100% 100%, 220rpx 100%;
}

.overview-timeline-card {
  min-height: 344rpx;
  margin-right: 18rpx;
  padding: 18rpx;
  border-radius: 26rpx;
  background: linear-gradient(180deg, #ffffff 0%, #f7f9fb 100%);
  box-shadow: 0 16rpx 28rpx rgba(36, 54, 74, 0.08);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.overview-timeline-card.current {
  background: linear-gradient(180deg, #f5fcff 0%, #eef8fd 100%);
  box-shadow: 0 18rpx 30rpx rgba(73, 202, 238, 0.16);
}

.overview-timeline-card.placeholder {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border: 2rpx dashed #cad4de;
  box-shadow: none;
}

.overview-timeline-card.placeholder-self {
  border-color: #78daf5;
  background: linear-gradient(180deg, rgba(120, 218, 245, 0.12) 0%, rgba(120, 218, 245, 0.05) 100%);
}

.overview-timeline-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-bottom: 14rpx;
}

.overview-item-thumb-wrap {
  position: relative;
  width: 100%;
  margin-bottom: 14rpx;
  padding-right: 12rpx;
  padding-bottom: 12rpx;
  box-sizing: border-box;
}

.overview-item-stack-layer {
  position: absolute;
  left: 0;
  width: 100%;
  height: 136rpx;
  border-radius: 20rpx;
  background: #dce2e8;
  z-index: 1;
}

.overview-item-stack-layer.layer-back {
  top: 12rpx;
  left: 12rpx;
  background: #cdd5de;
}

.overview-item-stack-layer.layer-mid {
  top: 6rpx;
  left: 6rpx;
  background: #d6dde5;
}

.overview-item-thumb {
  position: relative;
  width: 100%;
  height: 136rpx;
  border-radius: 20rpx;
  display: block;
  background: #eef2f5;
  z-index: 2;
}

.overview-item-more-tag {
  position: absolute;
  right: 0;
  top: 0;
  min-width: 42rpx;
  height: 34rpx;
  padding: 0 10rpx;
  border-radius: 999rpx;
  background: rgba(73, 84, 96, 0.92);
  color: #ffffff;
  font-size: 20rpx;
  line-height: 34rpx;
  text-align: center;
  z-index: 3;
}

.overview-item-thumb-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f4f6f8 0%, #eceff3 100%);
}

.overview-item-thumb-empty-self {
  background: linear-gradient(135deg, rgba(120, 218, 245, 0.26) 0%, rgba(120, 218, 245, 0.12) 100%);
}

.overview-item-thumb-empty-text {
  font-size: 22rpx;
  color: #97a0a8;
}

.overview-item-title {
  display: block;
  font-size: 24rpx;
  color: #2f353a;
  font-weight: 600;
}

.overview-item-order-id {
  display: inline-block;
  margin-bottom: 0;
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  background: #eef3f5;
  font-size: 20rpx;
  color: #66757f;
  white-space: nowrap;
}

.overview-item-status {
  display: block;
  width: 100%;
  min-width: 0;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #6f7c87;
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.overview-item-progress {
  display: block;
  margin-top: 6rpx;
  font-size: 21rpx;
  color: #919ca6;
  line-height: 1.45;
}

.overview-item-progress-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.overview-item-time {
  display: block;
  margin-top: auto;
  padding-top: 18rpx;
  font-size: 20rpx;
  color: #a3adb4;
}

.overview-current-marker {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  padding: 6rpx 12rpx;
  border-radius: 999rpx;
  background: rgba(73, 202, 238, 0.14);
  white-space: nowrap;
  flex-shrink: 0;
}

.overview-current-label {
  font-size: 20rpx;
  color: #1f7e97;
  font-weight: 600;
}

.overview-loading-tail {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 344rpx;
  padding: 0 22rpx;
  font-size: 22rpx;
  color: #7fa6b6;
  white-space: nowrap;
}

.overview-tail-fade {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 90rpx;
  pointer-events: none;
  z-index: 4;
  background: linear-gradient(
    90deg,
    rgba(245, 248, 251, 0) 0%,
    rgba(226, 232, 238, 0.58) 56%,
    rgba(208, 216, 225, 0.92) 100%
  );
  border-radius: 0 22rpx 22rpx 0;
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

.pay-amount-wrap {
  margin-top: 16rpx;
  padding: 18rpx;
  border-radius: 16rpx;
  background: #f7fbfe;
}

.pay-amount-title {
  font-size: 24rpx;
  color: #4d6276;
}

.pay-amount-list {
  margin-top: 12rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.pay-amount-item {
  min-height: 62rpx;
  padding: 0 20rpx;
  border-radius: 999rpx;
  background: #edf3f8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.pay-amount-item.active {
  background: #d6f5ff;
}

.pay-amount-item-text {
  font-size: 23rpx;
  color: #4e6074;
}

.pay-amount-item.active .pay-amount-item-text {
  color: #2f475d;
  font-weight: 600;
}

.pay-amount-single {
  margin-top: 12rpx;
}

.pay-amount-single-text {
  font-size: 24rpx;
  color: #2f475d;
  font-weight: 600;
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

.pay-method-explain-card {
  margin-top: 16rpx;
  padding: 18rpx 20rpx;
  border-radius: 16rpx;
  background: #f4f9fd;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.pay-method-explain-card.transfer-risk {
  background: #f8f5ff;
}

.pay-method-explain-title {
  font-size: 24rpx;
  color: #31455d;
}

.pay-method-explain-tip {
  font-size: 22rpx;
  color: #637688;
  line-height: 1.7;
  white-space: pre-line;
}

.pay-step-preview-list {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.pay-step-preview-item {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.pay-step-preview-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 999rpx;
  background: #90c8df;
  flex-shrink: 0;
}

.pay-step-preview-name {
  font-size: 22rpx;
  color: #3f546a;
  line-height: 1.5;
}

.pay-step-preview-empty {
  font-size: 22rpx;
  color: #7b8fa3;
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
  white-space: nowrap;
}

.btn-price.is-confirm {
  font-size: 27rpx;
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
