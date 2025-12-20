<template>
  <view class="booking-page">
    <!-- 1. 吸顶导航栏 (白色背景) -->
    <view
      class="sticky-titlebar"
      v-show="showStickyTitle"
      :style="{ paddingTop: safeTop + 'px' }"
    >
      <view class="nav-left" @click="goBack" aria-label="返回">
        <image class="back-icon" src="/static/artist/left.png" mode="aspectFit" />
        <text class="back-text font-alimamashuhei" style="color:#000;">返回</text>
      </view>
      <view class="st-center" @click="goArtistHome" aria-label="打开作者主页">
        <image class="st-logo" :src="avatarUrl" mode="aspectFill" />
        <text class="st-name">{{ artistName }}</text>
      </view>
      <view class="st-right" v-if="showShare">
        <!-- 修改：移除了收藏按钮，只保留分享 -->
        <view class="icon-btn" @click="shareClick">
           <uni-icons type="redo" size="24" color="#000"></uni-icons>
        </view>
      </view>
    </view>

    <!-- 2. 透明/渐变导航栏 -->
    <zhouWei-navBar
      type="transparentFixed"
      :backState="2000"
      :homeState="2000"
      :scrollTop="scrollTop"
      :titleCenter="true"
      fontColor="#fff"
      transparentFixedFontColor="#fff"
    >
      <template #left>
        <view class="nav-left" @click="goBack" aria-label="返回">
          <image class="back-icon" src="/static/artist/left.png" mode="aspectFit" />
          <text class="back-text font-alimamashuhei">返回</text>
        </view>
      </template>
      <template #right>
        <view v-if="showShare" class="nav-right-icon" style="padding-right: 40rpx; display: flex; align-items: center;">
            <!-- 修改：移除了收藏按钮，只保留分享 -->
            <view @click="shareClick">
                <uni-icons type="redo" size="24" :color="scrollTop > 100 ? '#000' : '#fff'"></uni-icons>
            </view>
        </view>
      </template>
      <template #transparentFixedLeft>
        <view class="nav-left" @click="goBack" aria-label="返回">
          <image class="back-icon" src="/static/artist/left.png" mode="aspectFit" />
          <text class="back-text">返回</text>
        </view>
      </template>
    </zhouWei-navBar>

    <!-- Hero 区域 -->
    <view class="hero">
      <image class="hero-img" :src="coverUrl" mode="aspectFill" />
      <view class="hero-mask"></view>
      <view class="hero-footer">
        <image class="avatar" :src="avatarUrl" mode="aspectFill" @click="goArtistHome" />
        <view class="hero-title">
          <text class="brand-name font-title" @click="goArtistHome">{{ artistName }}</text>
          <text class="plan-title font-alimamashuhei">开单</text>
        </view>
        <!-- 修改：收藏按钮放在这里，位于 Hero Title 右边 -->
        <view class="hero-follow" @click.stop="toggleFollow">
           <!-- 未关注显示白色，已关注显示红色 -->
		   <image src="/static/new-icon/like.png" v-if="!hasLikeBrand" mode="aspectFill" style="width: 50rpx;height: 50rpx;"></image>
		   <image src="/static/new-icon/like-fill.png" v-else mode="aspectFill" style="width: 50rpx;height: 50rpx;"></image>
        </view>
      </view>
    </view>

    <!-- 高光图 -->
    <scroll-view v-if="highlightImages.length" class="hl-strip" scroll-x :show-scrollbar="false">
      <view class="hl-row">
        <image
          v-for="(img, i) in highlightImages"
          :key="i"
          class="hl-img"
          :src="img"
          mode="aspectFill"
          @click="previewHL(i)"
        />
      </view>
    </scroll-view>

    <!-- 基础信息卡片 -->
    <view class="card">
      <view class="row" @click="openModeDescModal">
        <text class="label font-title">投递方式</text>
        <view class="val mode-val">
          <text class="mode-chip" :class="modeClass">{{ modeName }}</text>
          <text v-if="!isLocalPlan" class="external-tip">在其它平台开单</text>
        </view>
      </view>

      <view class="row" v-if="isPermanent">
        <text class="label font-title">档期</text>
        <text class="val">常驻可约 · 按时间顺序排期</text>
      </view>

      <template v-else>
        <view class="row">
          <text class="label font-title">开始时间</text>
          <text class="val"><text class="font-title">{{ fmtTime(plan.open_time) }}</text></text>
        </view>
        <view class="row">
          <text class="label font-title">截止时间</text>
          <text class="val"><text class="font-title">{{ fmtTime(plan.close_time) }}</text></text>
        </view>
        <view class="row" v-if="phase === 'upcoming'">
          <text class="label font-title">距离开始</text>
          <text class="val strong"><text class="font-title">{{ startsInText }}</text></text>
        </view>
        <view class="row" v-if="phase === 'ongoing'">
          <text class="label font-title">距离截止</text>
          <text class="val strong"><text class="font-title">{{ endsInText }}</text></text>
        </view>
        <view class="row" v-if="phase === 'ended'">
          <text class="label font-title">状态</text>
          <text class="val strong">已截止</text>
        </view>
      </template>

      <view class="row" v-if="isFaceup">
        <text class="label font-title">定妆方式</text>
        <view class="val finishing-val" @click="openFinishingModal">
          <text>{{ finishingMethodText }}</text>
          <uni-icons type="arrow-right" size="18" color="#fff" />
        </view>
      </view>

      <view class="row" v-else-if="isHairstylist">
        <text class="label font-title">毛坯提供方式</text>
        <view class="val wrap blank-val" @click="openBlankSupplyModal">
          <view
            v-if="blankOptions.length"
            v-for="opt in blankOptions"
            :key="opt.key"
            class="blank-chip"
            :class="opt.chipClass"
          >
            <text class="blank-chip-text font-alimamashuhei">{{ opt.label }}</text>
            <image class="blank-chip-icon" src="/static/duigou.png" mode="aspectFit" />
          </view>
          <text v-else class="blank-empty">未设置</text>
        </view>
      </view>

      <view class="row" v-if="showPerHeadCycle">
        <text class="label font-title">{{ perHeadCycleLabel }}</text>
        <text class="val"><text class="font-title">{{ perHeadCycleDays }}</text> 天</text>
      </view>
      <view class="row" v-if="showTotalCycle">
        <text class="label font-title">本次开单总工期</text>
        <text class="val"><text class="font-title">{{ totalCycleDays }}</text> 天</text>
      </view>

      <view class="row" v-if="showPremiumRow">
        <text class="label font-title">本次开单是否可钞</text>
        <view class="val" style="display: flex; align-items: center;">
          <text>{{ premiumQueueText }}</text>
          <view v-if="supportsPremiumQueue" @click.stop="openPremiumTip" style="margin-left: 8rpx; display: flex;">
            <uni-icons
              class="oc-info-icon"
              type="info"
              size="18"
              color="#1677ff"
            />
          </view>
        </view>
      </view>
      <view class="row" v-if="showPremiumRow && supportsPremiumQueue">
        <text class="label font-title">钞倍数</text>
        <text class="val"><text class="font-title">{{ plan.extra?.premium_price_multiple || 0 }}</text> 倍</text>
      </view>
    </view>

    <!-- 档位卡片 -->
    <view class="card oc-card">
      <view class="oc-grid">
        <view class="oc-label"><text class="font-title">档位</text></view>
        <view class="oc-value">
          <view v-if="plan.tiers && plan.tiers.length">
            <view class="oc-item" v-for="(t, idx) in plan.tiers" :key="'tier-'+idx">
              <view class="oc-item-hd">
                <text class="oc-badge font-title">¥{{ Number(t.price || 0) }}</text>
                <text class="oc-name">{{ t.title || '—' }}</text>
              </view>
              <text v-if="t.description" class="oc-desc">{{ t.description }}</text>
            </view>
          </view>
          <text v-else class="oc-empty">—</text>
        </view>

        <view class="oc-label"><text class="font-title">加购</text></view>
        <view class="oc-value">
          <view v-if="plan.addons && plan.addons.length">
            <view class="oc-item" v-for="(a, idx) in plan.addons" :key="'addon-'+idx">
              <view class="oc-item-hd">
                <text class="oc-badge add font-title">+¥{{ Number(a.price || 0) }}</text>
                <text class="oc-name">{{ a.title || '—' }}</text>
              </view>
              <text v-if="a.description" class="oc-desc">{{ a.description }}</text>
            </view>
          </view>
          <text v-else class="oc-empty">—</text>
        </view>

        <view class="oc-label"><text class="font-title">不同尺寸的价格</text></view>
        <view class="oc-value">
          <view v-if="sizeSurcharges.length" class="oc-chip-row">
            <view v-for="(s, i) in sizeSurcharges" :key="'size-'+i" class="oc-chip">
              <text class="oc-chip-size">{{ s.size || '—' }}</text>
              <text class="oc-chip-num font-alimamashuhei">+ ￥{{ Number(s.price || 0) }}</text>
            </view>
          </view>
          <text v-else class="oc-empty">—</text>
        </view>

        <view class="oc-label" v-if="!isHairstylist">
          <text class="font-title">寄送约定</text>
        </view>
        <view class="oc-value oc-value-row" v-if="!isHairstylist">
          <text v-if="shippingText" class="oc-plain">{{ shippingText }}</text>
          <text v-else class="oc-empty">—</text>
          <uni-icons
            class="oc-info-icon"
            type="info"
            size="18"
            color="#1677ff"
            @click="shippingVisible = true"
          />
        </view>

        <view class="oc-label" v-if="isFaceup">
          <text class="font-title">定妆说明</text>
        </view>
        <view class="oc-value" v-if="isFaceup">
          <text v-if="finishingDescText" class="oc-desc">{{ finishingDescText }}</text>
          <text v-else class="oc-empty">—</text>
        </view>
      </view>
    </view>

    <!-- 说明卡片 -->
    <view v-if="descText" class="desc-card">
      <view class="desc-row">
        <text class="desc-title font-title">说明</text>
        <text class="desc">{{ descText }}</text>
      </view>
    </view>

    <!-- 待投递卡片 -->
    <view v-if="isLocalPlan" class="card draft-card">
      <view class="draft-header">
        <text class="draft-title font-title">我的待投递</text>
        <button class="draft-add-btn" @click="goCreateDraft">
          <uni-icons type="plusempty" size="18" color="#ffffff" />
          <text class="draft-add-text">新增预投递</text>
        </button>
      </view>
      <view v-if="draftItems.length" class="draft-list">
        <view
          class="draft-item"
          v-for="item in draftItems"
          :key="item.id"
        >
          <view class="draft-main" @click="goEditDraft(item)">
            <text class="draft-subject">
              {{ item.work_subject || '未填写主体' }}
            </text>
            <view class="draft-meta">
              <text v-if="item.size" class="draft-meta-chip">{{ item.size }}</text>
              <text v-if="item.tier_title" class="draft-meta-chip">{{ item.tier_title }}</text>
              <text class="draft-price">¥{{ Number(item.price_total || 0) }}</text>
            </view>
          </view>
          <view class="draft-actions">
            <uni-icons
              type="compose"
              size="20"
              color="#999999"
              @click.stop="goEditDraft(item)"
            />
            <uni-icons
              type="trash"
              size="20"
              color="#999999"
              @click.stop="confirmDeleteDraft(item)"
            />
          </view>
        </view>
      </view>
      <view v-else class="draft-empty">
        <text class="draft-empty-text">暂无待投递内容，点击右上角按钮添加</text>
      </view>
    </view>

    <!-- 7. 底部购买栏 -->
    <view class="buybar" :class="{ safe: safeArea }">
      <view class="buy-left">
        <!-- 排钞开关：仅在支持排钞时显示 -->
        <view v-if="supportsPremiumQueue" class="premium-switch-box">
           <switch 
              :checked="usePremiumQueue === 1" 
              @change="onPremiumSwitchChange" 
              color="#8ad3ff" 
              style="transform: scale(0.7);"
           />
           <text class="premium-switch-label font-alimamashuhei" :class="{active: usePremiumQueue === 1}">
             {{ usePremiumQueue === 1 ? '接受排钞' : '不排钞' }}
           </text>
        </view>
      </view>

      <button
        class="buy-cta"
        :class="[ctaClass, { 'btn-premium-active': usePremiumQueue === 1 }]"
        :disabled="btnDisabled"
        @click="handleCTA"
      >
        <template v-if="!isValidPlatformArtist">
              <text class="cta-text font-alimamashuhei">不在本平台开单·不可投递</text>
        </template>
        <template v-else>
            <!-- 名额信息 -->
            <text class="stock-text font-alimamashuhei">{{ commonStockInfo }}</text>
            
            <template v-if="premiumStockInfo">
                <view class="sep"></view>
                <text class="stock-text font-alimamashuhei">{{ premiumStockInfo }}</text>
            </template>

            <view class="sep"></view>
            <text class="cta-text font-alimamashuhei">{{ btnText }}</text>
        </template>
      </button>
    </view>

    <view style="height: 160rpx;"></view>

    <!-- 弹窗组件 -->
    <common-modal
      :visible="finishingVisible"
      @update:visible="v => finishingVisible = v"
      top="200rpx"
      width="calc(80vw)"
    >
      <view class="cm-wrapper">
        <view class="cm-title">定妆方式说明</view>
        <view class="cm-body">
          <text class="cm-intro">
            定妆工具一般分为三种，油性消光、水性消光、罩光剂三种，它们的特点和区别如下：
          </text>
          <view class="cm-swiper-wrapper">
            <swiper
              class="cm-swiper"
              :current="finishingSlideIndex"
              indicator-dots
              circular
              :autoplay="true"
              :interval="9000"
              indicator-color="rgba(0,0,0,0.16)"
              indicator-active-color="#86b9fb"
              @change="onFinishingSwiperChange"
            >
              <swiper-item v-for="(item, idx) in finishingSlides" :key="item.key">
                <view class="cm-slide">
                  <image class="cm-img" :src="item.img" mode="aspectFit" />
                </view>
              </swiper-item>
            </swiper>
          </view>
          <view class="cm-desc-wrapper">
            <text class="cm-desc-title">{{ currentFinishingSlide.name }}</text>
            <text class="cm-desc-text">{{ currentFinishingSlide.desc }}</text>
          </view>
          <view>
            <text class="cm-desc-title">为什么需要喷涂这些？</text>
            <text class="cm-desc-text">打底可以保护娃头不受颜料染色，同时提供一些粗糙度，以供颜料和色粉附着。定妆是为了避免颜料和色粉被磨掉。</text>
          </view>
        </view>
      </view>
    </common-modal>

    <common-modal
      :visible="blankSupplyVisible"
      @update:visible="v => blankSupplyVisible = v"
      top="200rpx"
      width="80vw"
    >
      <view class="cm-wrapper">
        <view class="cm-title">毛坯提供方式说明</view>
        <view class="cm-body">
          <view class="blank-modal-tags" v-if="blankOptions.length">
            <view
              v-for="opt in blankOptions"
              :key="opt.key"
              class="blank-chip"
              :class="opt.chipClass"
            >
              <text class="blank-chip-text font-alimamashuhei">{{ opt.label }}</text>
              <image class="blank-chip-icon" src="/static/duigou.png" mode="aspectFit" />
            </view>
          </view>
          <text class="cm-desc-title">自带毛坯</text>
          <text class="cm-desc-text">由买家提供已经购买好的毛坯进行修剪。</text>
          <text class="cm-desc-title">指定购买毛坯</text>
          <text class="cm-desc-text">由毛娘提供一个第三方毛坯店铺的链接，指定买家购买毛坯并寄送。</text>
          <text class="cm-desc-title">选购现有毛坯</text>
          <text class="cm-desc-text">根据买家的指定造型，毛娘提供一些可选毛坯现货进行完成，需要支付毛坯和手工费。</text>
        </view>
      </view>
    </common-modal>

    <common-modal
      :visible="shippingVisible"
      @update:visible="v => shippingVisible = v"
      top="200rpx"
      width="80vw"
    >
      <view class="cm-wrapper">
        <view class="cm-title">寄送约定</view>
        <view class="cm-body">
          <view v-if="isUnifiedShipping">
            <text class="cm-desc-text">需要在指定日期前寄送到妆师地址。</text>
            <text class="cm-desc-text">如果未按要求在指定日期前寄到，该订单将不计入超时工期。且在开始之前妆师取消订单。</text>
          </view>
          <view v-else>
            <text class="cm-desc-text">会根据排单顺序约定寄送日期.</text>
            <text class="cm-desc-text">如果未按要求在指定日期前寄到，该订单将不计入超时工期。且在开始之前妆师有权利取消订单。</text>
          </view>
        </view>
      </view>
    </common-modal>

    <common-modal
      :visible="modeDescVisible"
      @update:visible="v => modeDescVisible = v"
      top="200rpx"
      width="calc(80vw)"
    >
      <view class="cm-wrapper">
        <view class="cm-title">投递方式说明</view>
        <view class="cm-body">
          <text class="cm-desc-title">长期接单</text>
          <text class="cm-desc-text">如果库存足够，您可以随时拍下一个订单。</text>
          <text class="cm-desc-title">限时手速投递-手速排单</text>
          <text class="cm-desc-text">限时限量开放投递，并以投递顺序进行排单，您可以在订单中心看到自己的排位。限时手速模式允许超量抢购，如果前方有人未付款，后续队列将依次轮到。</text>
          <text class="cm-desc-title">限时抽选投递</text>
          <text class="cm-desc-text">限时限量开放投递，接单方在结束后将进行挑选。抽选模式不限制投递数量，当抽选数量达到库存限制之后，未中选的订单将标记为失败。</text>
          <text class="cm-desc-title">限时黑箱卡投递</text>
          <text class="cm-desc-text">功能暂未开放。</text>
          <text class="cm-desc-title">限时手速投递-自由排单</text>
          <text class="cm-desc-text">限时限量开放投递，所有投单的人共享一个工期，接单者可以自由排列订单顺序。您可以在订单中心看到自己的排位。限时手速模式允许超量抢购，如果前方有人未付款，后续队列将依次轮到。</text>
        </view>
      </view>
    </common-modal>

    <common-modal
      :visible="premiumTipVisible"
      @update:visible="v => premiumTipVisible = v"
      top="30vh"
      width="600rpx"
    >
      <view class="cm-wrapper">
        <view class="cm-title">关于加价队列</view>
        <view class="cm-body">
          <text class="cm-desc-text">您可以选择付额外的钱，在普单投满的情况下，排入加价队列。</text>
          <text class="cm-desc-text" style="margin-top:10rpx;">如果您抢到了普单名额，那么也不需要额外付钱。</text>
        </view>
        <view style="margin-top: 30rpx; text-align: center;">
             <button @click="premiumTipVisible = false" style="background:#f0f0f0; color:#333; font-size:26rpx; border-radius:30rpx; width:200rpx; height:60rpx; line-height:60rpx;">知道了</button>
        </view>
      </view>
    </common-modal>

  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { onLoad, onPageScroll, onShow } from '@dcloudio/uni-app'
import { websiteUrl, global, getScene } from '@/common/config.js'
import { useCrossShare } from '@/common/share.js'
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'

onShareAppMessage(() => ({
  title: '快来看看这个开单！',
  path: `/pkg-creator/creator_order/plan_detail/plan_detail?id=${planId.value}`,
  imageUrl: coverUrl.value || ''
}))

onShareTimeline(() => ({
  title: '快来看看这个开单！',
  query: `id=${planId.value}`, // 朋友圈通常用 query
  imageUrl: coverUrl.value || ''
}))
/** ====== 滚动 & 吸顶标题栏 ====== */
const scrollTop = ref(0)
const safeTop = ref(0)
onPageScroll(e => { scrollTop.value = e?.scrollTop || 0 })
const stickyShowThreshold = 140
const showStickyTitle = computed(() => scrollTop.value > stickyShowThreshold)
const showShare = ref(true)
/** ====== 路由参数 ====== */
const planId = ref(0)

/** ====== 详情对象 ====== */
const plan = reactive({
  id: 0,
  brand_id: 0,
  artist_name: '',
  artist_type: 0,
  order_type: 1,
  max_participants: null,
  max_submissions_per_user: null,
  open_time: 0,
  close_time: 0,
  images: '',
  order_config: '',
  service_scene: 0,
  capacity: 0,
  challenge_type: 0,
  require_platform_account: false,
  check_showcase: false,
  queue_window_sec: 0,
  artist_info: null,
  brand: null,
  external_url: '',
  is_local: 1,
  tiers: [],
  addons: [],
  extra: {},
  inventory: 0,
  premium_queue_limit: 0,
  premium_inventory: 0,
  premium_rate: 1,
  brand_admin_id: 0 // 新增：作者ID用于判断是否入驻
})

/** 状态：是否接受排钞 (0=不接受, 1=接受) */
const usePremiumQueue = ref(0)

/** 类型标记：妆师 / 毛娘 */
const isFaceup = computed(() => Number(plan.artist_type) === 1)
const isHairstylist = computed(() => Number(plan.artist_type) === 2)

/** 返回 */
const goBack = () => uni.navigateBack({ delta: 1 })

/** ====== 分享逻辑 (Step 1) ====== */
const { shareClick, setupMpShare } = useCrossShare(() => ({
    title: '快来看看这个开单！',
    path: `/pkg-creator/creator_order/plan_detail/plan_detail?id=${planId.value}`,
    imageUrl: coverUrl.value || ''
}))

/** 跳转投递详情（带 submission_id） */
function goSubmissionDetail(submissionId) {
  if (!submissionId) return
  const sid = Number(submissionId)
  const url = `/pkg-creator/creator_order/submission_detail/submission_detail?submission_id=${sid}`
  // #ifdef H5
  window.location.hash = url
  // #endif
  // #ifndef H5
  uni.navigateTo({ url })
  // #endif
}

/** 拉取详情 */
async function fetchPlan() {
  const res = await uni.request({
    url: `${websiteUrl.value}/brand-artist/order-plan-info`,
    method: 'GET',
    data: { id: planId.value }
  })
  if (String(res.data?.status).toLowerCase() !== 'success') {
    uni.showToast({ title: res.data?.msg || '加载失败', icon: 'none' })
    return
  }
  const d = res.data.data || {}
  plan.id = d.id || planId.value
  plan.brand_id = d.brand_id || 0
  plan.artist_name = d.artist_name || ''
  plan.artist_type = d.artist_type || 0
  plan.order_type = d.order_type || 1
  plan.max_participants = d.max_participants ?? null
  plan.max_submissions_per_user = d.max_submissions_per_user ?? null
  plan.open_time = Number(d.open_time || 0)
  plan.close_time = Number(d.close_time || 0)
  plan.images = d.images || ''
  plan.order_config = d.order_config || ''
  plan.service_scene = d.service_scene || 0
  plan.capacity = d.capacity || 0
  plan.challenge_type = d.challenge_type || 0
  plan.require_platform_account = !!d.require_platform_account
  plan.check_showcase = !!d.check_showcase
  plan.queue_window_sec = Number(d.queue_window_sec || 0)
  plan.artist_info = d.artist_info || null
  plan.brand = d.brand || null
  plan.external_url = d.external_url || ''
  plan.is_local = plan.external_url ? 0 : 1
  plan.inventory = Number(d.inventory || 0)
  plan.premium_queue_limit = Number(d.premium_queue_limit || 0)
  plan.premium_inventory = Number(d.premium_inventory || 0)
  plan.premium_rate = Number(d.premium_rate || 1)
  plan.brand_admin_id = Number(d.brand_admin_id || 0) // 获取作者入驻ID

  try {
    if (plan.order_config) {
      const cfg = JSON.parse(plan.order_config)
      plan.tiers = Array.isArray(cfg?.tiers) ? cfg.tiers : []
      plan.addons = Array.isArray(cfg?.addons) ? cfg.addons : []
      plan.extra = cfg?.extra || {}
    } else {
      plan.tiers = []; plan.addons = []; plan.extra = {}
    }
  } catch (e) {
    plan.tiers = []; plan.addons = []; plan.extra = {}
  }
}

/** ====== 计算展示 ====== */
const coverUrl = computed(() => {
  const imgs = String(plan.images || '').split(',').map(s => s.trim()).filter(Boolean)
  if (imgs.length) return imgs[0]
  if (plan.artist_info?.LogoImage) return plan.artist_info.LogoImage
  if (plan.brand?.logo_image) return plan.brand.logo_image
  return 'https://images1.fantuanpu.com/brand-avatar/default'
})
const avatarUrl = computed(() => {
  if (plan.artist_info?.LogoImage) return plan.artist_info.LogoImage
  if (plan.brand?.logo_image) return plan.brand.logo_image
  return 'https://images1.fantuanpu.com/brand-avatar/default'
})
const artistName = computed(() =>
  plan.artist_info?.BrandName || plan.brand?.brand_name || plan.artist_name || '—'
)

/** 高光图：按类型只解析对应字段 */
const highlightImages = computed(() => {
  const info = plan.artist_info || {}
  const artistImgs = String(info.artist_highlight_images || '').split(',').map(s => s.trim()).filter(Boolean)
  const hairImgs = String(info.hairstylist_highlight_images || '').split(',').map(s => s.trim()).filter(Boolean)

  if (isHairstylist.value) {
    return hairImgs.length ? hairImgs : artistImgs
  }
  if (isFaceup.value) {
    return artistImgs.length ? artistImgs : hairImgs
  }
  return artistImgs.length ? artistImgs : hairImgs
})
function previewHL(idx) { uni.previewImage({ urls: highlightImages.value, current: idx || 0 }) }

/** 是否本平台/阶段 */
const isLocalPlan = computed(() => plan.is_local ? true : false)
const modeMap = {
  1: '长期接单',
  2: '限时手速投递-手速排单',
  3: '限时抽选投递',
  4: '限时黑箱卡投递',
  5: '限时手速投递-自由排单'
}
const modeName = computed(() => modeMap[Number(plan.order_type)] || '未知')
const modeClass = computed(() => {
  const m = Number(plan.order_type)
  return {
    'mode-direct': m === 1,
    'mode-speed': m === 2 || m === 5,
    'mode-lottery': m === 3,
    'mode-black': m === 4
  }
})
const isPermanent = computed(() => Number(plan.order_type) === 1 && (!plan.open_time || !plan.close_time))
const nowSec = () => Math.floor(Date.now() / 1000)
// 修改 phase 计算：即使不是 local plan，也计算时间状态以便显示倒计时
const phase = computed(() => {
  if (isPermanent.value) return 'ongoing'
  const n = nowSec()
  if (n < plan.open_time) return 'upcoming'
  if (n >= plan.open_time && n <= plan.close_time) return 'ongoing'
  return 'ended'
})
function fmtTime(ts) {
  if (!ts) return '--'
  const d = new Date(ts * 1000)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${dd} ${hh}:${mi}`
}
function fmtDur(sec) {
  if (sec <= 0) return '0秒'
  const d = Math.floor(sec / 86400)
  const h = Math.floor((sec % 86400) / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  const a = []
  if (d) a.push(`${d}天`)
  if (h) a.push(`${h}小时`)
  if (m) a.push(`${m}分`)
  if (!d && !h && !m) a.push(`${s}秒`)
  return a.join('')
}
const startsInText = ref('')
const endsInText = ref('')
let timer = null
function tick() {
  if (phase.value === 'upcoming') startsInText.value = fmtDur(Math.max(0, plan.open_time - nowSec()))
  else if (phase.value === 'ongoing') endsInText.value = fmtDur(Math.max(0, plan.close_time - nowSec()))
  else {
    startsInText.value = ''
    endsInText.value = ''
  }
}
function startTimer() { stopTimer(); tick(); timer = setInterval(tick, 1000) }
function stopTimer() { if (timer) { clearInterval(timer); timer = null } }

/** 库存文本：普通名额 + 钞名额 (修改1, 2) */
const commonStockInfo = computed(() => {
  const inv = Number(plan.inventory ?? 0)
  if (Number.isNaN(inv)) return '名额 不限'
  if (inv > 0) return `名额 ${inv}`
  return '名额 0'
})

const premiumStockInfo = computed(() => {
  const premiumLimit = Number(plan.premium_queue_limit ?? 0)
  const premiumInv = Number(plan.premium_inventory ?? 0)
  if (premiumLimit <= 0) return null
  return Number.isNaN(premiumInv) ? '' : `钞名额 ${premiumInv}`
})

/** 配置/价格区间（工期、价格） */
const perHeadCycleDays = computed(() => {
  const n = Number(plan.extra?.per_head_cycle_days || 0)
  return n > 0 && Number.isFinite(n) ? n : null
})
const totalCycleDays = computed(() => {
  const n = Number(plan.extra?.total_cycle_days || 0)
  return n > 0 && Number.isFinite(n) ? n : null
})
const showPerHeadCycle = computed(
  () => Number(plan.order_type) === 2 && perHeadCycleDays.value !== null
)
const showTotalCycle = computed(
  () => Number(plan.order_type) === 5 && totalCycleDays.value !== null
)
const perHeadCycleLabel = computed(() => (isHairstylist.value ? '每顶毛工期' : '每颗头工期'))

/** 是否支持加价队列及说明行 */
const supportsPremiumQueue = computed(() => Number(plan.premium_queue_limit || 0) > 0)
const showPremiumRow = computed(() => isLocalPlan.value)
const premiumQueueText = computed(() => {
  if (!showPremiumRow.value) return ''
  if (supportsPremiumQueue.value) {
    const premiumInv = Number(plan.premium_inventory ?? 0)
    return '支持'
  }
  return '不支持'
})

// 加价队列说明弹窗
const premiumTipVisible = ref(false)
function openPremiumTip() {
  premiumTipVisible.value = true
}

const finishingMap = { oil: '油性消光', water: '水性消光', gloss: '罩光剂' }
const finishingMethodText = computed(() => {
  const m = String(plan.extra?.finishing_method || '').trim()
  return finishingMap[m] || (m ? m : '未设置')
})
const finishingDescText = computed(() => String(plan.extra?.finishing_desc || '').trim())

/** 毛娘专用：毛坯提供方式，仅在 isHairstylist 时使用（圆角标签） */
const blankOptions = computed(() => {
  if (!isHairstylist.value) return []
  const extra = plan.extra || {}
  const list = [
    {
      key: 'self',
      label: '自带毛坯',
      desc: '由买家提供已经购买好的毛坯进行修剪',
      enabled: !!extra.support_self_blank,
      chipClass: 'blank-chip--self'
    },
    {
      key: 'third',
      label: '指定购买毛坯',
      desc: '由毛娘提供一个第三方毛坯店铺的链接，指定买家购买毛坯并寄送',
      enabled: !!extra.support_third_party_blank,
      chipClass: 'blank-chip--third'
    },
    {
      key: 'stock',
      label: '选购现有毛坯',
      desc: '根据买家的指定造型，毛娘提供一些可选毛坯现货进行完成，需要支付毛坯和手工费',
      enabled: !!extra.support_stock_blank,
      chipClass: 'blank-chip--stock'
    }
  ]
  return list.filter(o => o.enabled)
})

const shipping = computed(() => plan.extra?.shipping || {})
const isUnifiedShipping = computed(() => shipping.value?.mode === 'unified')
const shippingText = computed(() => {
  const s = shipping.value
  if (!s || !s.mode) return ''
  if (s.mode === 'unified' && s.unified_date) return `统一寄送：${s.unified_date}`
  if (s.mode === 'separate') {
    const n = Number(s.separate_days_before_start || 0)
    return `分批寄送：开始前 ${n} 天发出`
  }
  return ''
})
const sizeSurcharges = computed(() => {
  const rows = Array.isArray(plan.extra?.size_surcharges) ? plan.extra.size_surcharges : []
  return rows.filter(r => r && typeof r.price !== 'undefined')
})
const sizePriceText = computed(() => {
  if (!sizeSurcharges.value.length) return ''
  return sizeSurcharges.value.map(r => `${r.size || '—'} +${Number(r.price)}`).join(' · ')
})
const tierListText = computed(() => {
  if (!plan.tiers?.length) return ''
  return plan.tiers.map(t => `${t.title || '—'} ¥${Number(t.price || 0)}`).join('；')
})
const addonListText = computed(() => {
  if (!plan.addons?.length) return ''
  return plan.addons.map(a => `${a.title || '—'} +¥${Number(a.price || 0)}`).join('；')
})
function _min(a) { return a.length ? Math.min(...a) : 0 }
function _max(a) { return a.length ? Math.max(...a) : 0 }
const tierRangeText = computed(() => {
  const tp = (plan.tiers || []).map(t => Number(t.price || 0)).filter(n => !isNaN(n))
  if (!tp.length) return '未设置档位'
  const sp = (sizeSurcharges.value || []).map(s => Number(s.price || 0)).filter(n => !isNaN(n))
  const min = _min(tp) + _min(sp)
  const max = _max(tp) + _max(sp)
  return min === max ? `¥${min}` : `¥${min} ~ ¥${max}`
})
const tierRangePriceText = computed(() => tierRangeText.value)

/** CTA 文案/状态 */
// 是否是有效的入驻作者且在本平台开单 (Step 3)
const isValidPlatformArtist = computed(() => {
    return plan.brand_admin_id > 0 && plan.service_scene === 2
})

const btnText = computed(() => {
  // 如果不是本平台开单，但通过检验是入驻作者，保持旧逻辑
  if (!isLocalPlan.value) return '在其它平台开单'
  if (phase.value === 'upcoming') return '即将开始'
  // 修改3: 立即购买 -> 投递
  if (phase.value === 'ongoing') return '投递' 
  if (phase.value === 'ended') return '已结束'
  return '投递'
})

const btnDisabled = computed(() => {
  if (!isValidPlatformArtist.value) return true // 不在本平台且非入驻作者 -> 禁用
  if (!isLocalPlan.value) return false
  return phase.value === 'upcoming' || phase.value === 'ended'
})

const ctaClass = computed(() => {
    if (!isValidPlatformArtist.value) return 'btn-grey'
    return {
      'btn-grey': phase.value === 'ended' || btnDisabled.value,
      'btn-warn': phase.value === 'upcoming',
      'btn-primary': phase.value === 'ongoing' && !btnDisabled.value
    }
})

// 切换排钞
function onPremiumSwitchChange(e) {
  usePremiumQueue.value = e.detail.value ? 1 : 0
}

function goArtistHome() {
  const url = `/pkg-creator/creator_base/bjd_faceup_artist/bjd_faceup_artist?brand_id=${plan.brand_id}`
  // #ifdef H5
  window.location.hash = url
  // #endif
  // #ifndef H5
  uni.navigateTo({ url })
  // #endif
}

/**
 * 投递按钮：
 * - 外部平台：复制链接（原逻辑保留）
 * - 本平台：调用新投递接口 /with-state/artist-order/submit
 * 若返回 submission_id，则跳转到投递详情页
 */
async function handleCTA() {
  if (!isValidPlatformArtist.value) return // 禁用点击

  // 其它平台：复制链接
  if (!isLocalPlan.value) {
    if (plan.external_url) {
      uni.setClipboardData({
        data: plan.external_url,
        success: () => uni.showToast({ title: '已复制链接', icon: 'none' })
      })
    }
    return
  }

  // 本平台但按钮不可用（未开始/已结束）
  if (btnDisabled.value) return

  // 改为只看 token：
  const token = uni.getStorageSync('token') || ''
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }

  try {
    uni.showLoading({ title: '投递中...', mask: true })
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/submit`,
      method: 'POST',
      header: {
        Authorization: token,
        'Content-Type': 'application/json'
      },
      data: {
        plan_id: plan.id,
        // 这里先用空字符串占位，后续如果有账号/备注输入，再从表单取值
        platform_account: '',
        requirement: '',
        // 传递排钞参数
        use_premium_queue: usePremiumQueue.value
      }
    })
    uni.hideLoading()

    if (String(res.data?.status).toLowerCase() !== 'success') {
      uni.showToast({ title: res.data?.msg || '投递失败', icon: 'none' })
      return
    }

    const data = res.data?.data || {}
    const code = data.code
    const counter = data.brand_counter
    const submissionId = data.submission_id
    let msg = ''

    if (code === 1) {
      // 成功时优先使用后端返回的提示
      msg = res.data?.msg || '投递成功'
    } else if (code === 0) {
      msg = '当前不在开单时间段'
    } else if (code === 2) {
      msg = '请勿重复投递'
    } else if (code === 3) {
      msg = '排队人数已满，投递未成功'
    } else {
      msg = '投递失败，请稍后重试'
    }

    if (typeof counter === 'number' && counter > 0) {
      msg += `（您的序号：${counter}）`
    }

    // ① 若返回 submission_id，则跳转到投递详情
    if (code === 1 && submissionId) {
      uni.showToast({ title: msg, icon: 'none', duration: 1200 })
      setTimeout(() => {
        goSubmissionDetail(submissionId)
      }, 800)
      return
    }

    uni.showToast({ title: msg, icon: 'none', duration: 3000 })
  } catch (e) {
    uni.hideLoading()
    uni.showToast({ title: '网络异常，投递失败', icon: 'none' })
  }
}

/** ====== 待投递草稿列表（submission_id=0） ====== */
const draftItems = ref([])

async function fetchDraftItems() {
  const token = uni.getStorageSync('token') || ''
  if (!token || !plan.id) {
    draftItems.value = []
    return
  }
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/plan-draft-items`,
      method: 'GET',
      header: { Authorization: token },
      data: { plan_id: plan.id }
    })
    if (String(res.data?.status).toLowerCase() !== 'success') {
      return
    }
    const list = res.data?.data?.items
    draftItems.value = Array.isArray(list) ? list : []
  } catch (e) {
    // 忽略错误
  }
}

function goCreateDraft() {
  if (!plan.id) return

  const url = `/pkg-creator/creator_order/submission_item_form/submission_item_form?submission_id=0&plan_id=${plan.id}`

  uni.navigateTo({ url })
}

function goEditDraft(item) {
  if (!item || !item.id) return
  const id = item.id
  const url = `/pkg-creator/creator_order/submission_item_form/submission_item_form?submission_item_id=${id}&plan_id=${plan.id}`

  uni.navigateTo({ url })
}

function confirmDeleteDraft(item) {
  if (!item || !item.id) return
  const id = item.id
  const token = uni.getStorageSync('token') || ''
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  uni.showModal({
    title: '删除预投递',
    content: '确定要删除这条预投递吗？',
    confirmText: '删除',
    confirmColor: '#ff4d4f',
    success: async res => {
      if (!res.confirm) return
      try {
        uni.showLoading({ title: '删除中...', mask: true })
        const resp = await uni.request({
          url: `${websiteUrl.value}/with-state/artist-order/item/delete`,
          method: 'POST',
          header: {
            Authorization: token,
            'Content-Type': 'application/json'
          },
          data: { item_id: id }
        })
        uni.hideLoading()
        if (String(resp.data?.status).toLowerCase() !== 'success') {
          uni.showToast({ title: resp.data?.msg || '删除失败', icon: 'none' })
          return
        }
        uni.showToast({ title: '已删除', icon: 'none' })
        fetchDraftItems()
      } catch (e) {
        uni.hideLoading()
        uni.showToast({ title: '删除失败', icon: 'none' })
      }
    }
  })
}

/** 关注（与品牌页一致） */
const hasLikeBrand = ref(false)
async function fetchHasLikeBrand() {
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/hasLike?id=${parseInt(plan.brand_id)}&type=2`,
      method: 'POST',
      header: { Authorization: uni.getStorageSync('token') || '' }
    })
    hasLikeBrand.value = !!(res.data?.data?.id > 0)
  } catch { }
}
async function toggleFollow() {
  // 1. 触感反馈
  uni.vibrateShort()

  const token = uni.getStorageSync('token') || ''
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  try {
    const url = `${websiteUrl.value}/with-state/${hasLikeBrand.value ? 'unlike' : 'add-like'}`
    const res = await uni.request({
      url, method: 'POST',
      header: { Authorization: token },
      data: { id: parseInt(plan.brand_id), type: 2 }
    })
    if (res.data.status === 'success') {
      hasLikeBrand.value = !hasLikeBrand.value
      uni.showToast({ title: hasLikeBrand.value ? '关注成功' : '已取消关注', icon: 'none' })
    } else {
      uni.showToast({ title: res.data.msg || '操作失败', icon: 'none' })
    }
  } catch { uni.showToast({ title: '操作失败', icon: 'none' }) }
}

/** 弹框可见性（common-modal） */
const finishingVisible = ref(false)
const blankSupplyVisible = ref(false)
const shippingVisible = ref(false)
const modeDescVisible = ref(false)

/** ====== 定妆方式图文说明（妆师专用） ====== */
const finishingSlides = [
  {
    key: 'oil',
    name: '油性消光',
    img: 'https://images1.fantuanpu.com/admin/sys/youxingxiaoguang.jpg',
    desc: '经典定妆溶剂，耐磨度较高。缺点是定妆需要在空气湿度较低的情况下操作，且未干透前有毒性。'
  },
  {
    key: 'water',
    name: '水性消光',
    img: 'https://images1.fantuanpu.com/admin/sys/shuixingxiaoguang.jpg',
    desc: '基本无毒，定妆时不需要受限于空气湿度，基本不泛白。缺点是定妆的强度相对较低，可以被酒精轻易擦掉。'
  },
  {
    key: 'gloss',
    name: '罩光剂',
    img: 'https://images1.fantuanpu.com/admin/sys/zhaoguangji.jpg',
    desc: '近几年被广泛使用的定妆方式，无毒且不受限空气湿度。缺点是定妆强度过于高，很难卸掉，并且比较沾灰。另外如果采用蘸取拍打方式打底，手感将与喷涂方式不同。'
  }
]

const finishingSlideIndex = ref(0)

const currentFinishingSlide = computed(
  () => finishingSlides[finishingSlideIndex.value] || finishingSlides[0]
)

// extra 中的定妆 key -> slide key
const finishingMethodKey = computed(() => {
  const m = String(plan.extra?.finishing_method || '').trim()
  if (m === 'oil' || m === 'water' || m === 'gloss') return m
  return 'oil'
})

function openFinishingModal() {
  if (!isFaceup.value) return
  const key = finishingMethodKey.value
  const idx = finishingSlides.findIndex(s => s.key === key)
  finishingSlideIndex.value = idx >= 0 ? idx : 0
  finishingVisible.value = true
}

function onFinishingSwiperChange(e) {
  finishingSlideIndex.value = e.detail?.current || 0
}

/** 打开毛坯提供方式说明弹窗 */
function openBlankSupplyModal() {
  if (!isHairstylist.value) return
  blankSupplyVisible.value = true
}

/** 打开投递方式说明弹窗 */
function openModeDescModal() {
  modeDescVisible.value = true
}

/** 生命周期 */
onLoad((q = {}) => {
  planId.value = Number(q?.id || 0)
  try {
    const wi = uni.getWindowInfo && uni.getWindowInfo()
    safeTop.value = wi?.safeAreaInsets?.top ?? wi?.statusBarHeight ?? 0
  } catch { safeTop.value = 20 }
  // 小程序分享初始化
  setupMpShare()
})
onMounted(async () => {
  if (!planId.value) { uni.showToast({ title: '缺少参数：id', icon: 'none' }); return }
  uni.showLoading({ title: '加载中...' })
  startTimer()
})

onShow(async () => {
	if (getScene() == 4) {
		showShare.value = false
	}
	
  try {
    await fetchPlan()
    if (global.isLogin && plan.brand_id) await fetchHasLikeBrand()
    if (global.isLogin) await fetchDraftItems()
  } finally {
    uni.hideLoading()
  }
})
onUnmounted(stopTimer)

/** 安全区 & 说明文本：按类型解析妆师/毛娘规则，兜底品牌说明 */
const safeArea = true
const descText = computed(() => {
  const info = plan.artist_info || {}
  if (isFaceup.value) {
    return String(info.rule_of_artist || info.Description || '').trim()
  }
  if (isHairstylist.value) {
    return String(info.rule_of_hairstylist || info.Description || '').trim()
  }
  return String(info.Description || '').trim()
})
</script>

<style scoped>
.booking-page { min-height: 100vh; background: #fff; }

/* ====== 吸顶标题栏 ====== */
.sticky-titlebar{
  position: fixed; top: 0; left: 0; right: 0; z-index: 9999;
  background: rgba(255,255,255,.92);
  backdrop-filter: saturate(160%) blur(10px);
  border-bottom: 1rpx solid rgba(0,0,0,.05);
  display: grid;
  grid-template-columns: 140rpx 1fr 140rpx;
  align-items: center;
}
.nav-left { display:flex; align-items:center; padding: 0 16rpx; height: 88rpx; }
.back-icon { width: 15rpx; height: 28rpx; margin-right: 12rpx; filter: drop-shadow(0 2rpx 4rpx rgba(0,0,0,.25)); }
.back-text { font-size: 28rpx; color: #fff; }
.st-center{ display:flex; align-items:center; justify-content:center; gap: 12rpx; min-height: 56rpx; }
.st-logo{ width: 44rpx; height: 44rpx; border-radius: 50%; border: 2rpx solid rgba(255,255,255,.9); box-shadow: 0 2rpx 8rpx rgba(0,0,0,.08); }
.st-name{ max-width: 56vw; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size: 28rpx; color: #222; font-weight: 600; letter-spacing: .3rpx; }
/* 修改：移除 margin-right，统一 padding-right 为 40rpx 以对齐透明导航栏 */
.st-right { display: flex; align-items: center; justify-content: flex-end; padding-right: 40rpx; }

/* 沉浸式大图 */
.hero { width: 100vw; height: 60vh; position: relative; overflow: hidden; }
.hero-img { width: 100%; height: 100%; }
.hero-mask { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,.55) 100%); }
.hero-footer { position: absolute; left: 24rpx; right: 24rpx; bottom: 24rpx; display: flex; align-items: center; gap: 20rpx; }
.avatar { width: 96rpx; height: 96rpx; border-radius: 50%; border: 4rpx solid rgba(255,255,255,.9); box-shadow: 0 6rpx 18rpx rgba(0,0,0,.25); }
.hero-title { 
  display: flex; flex-direction: column; color: #fff; text-shadow: 0 2rpx 6rpx rgba(0,0,0,.35);
  flex: 1; /* 占据剩余空间 */
}
.hero-follow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80rpx; 
  height: 80rpx;
}
.brand-name { font-size: 28rpx; opacity: .95; color: #fff;}
.plan-title { font-size: 40rpx; font-weight: 600; margin-top: 4rpx; color: #fff;}

/* 高光图横向滚动 */
.hl-strip { width: 100vw; margin: 12rpx 0 0; overflow: hidden; }
.hl-row { white-space: nowrap; padding: 0 24rpx 6rpx; }
.hl-img {
  display: inline-block;
  /* 修改为 3:4 比例，例如 300rpx : 400rpx */
  width: 300rpx; height: 400rpx;
  border-radius: 16rpx; margin-right: 16rpx;
  background:#f6f7f9; box-shadow: 0 6rpx 18rpx rgba(0,0,0,0.08);
  vertical-align: top;
}

/* 信息卡 */
.card {
  margin: 20rpx 24rpx 0; padding: 24rpx; background: #fff; border-radius: 20rpx;
  box-shadow: 0 6rpx 24rpx rgba(0,0,0,0.06);
}
.row { display: flex; align-items: center; justify-content: space-between; gap: 16rpx; padding: 28rpx 0; }
.row:last-child { border-bottom: none; }
.label { color: #666; font-size: 26rpx; white-space: nowrap; }
.val { color: #333; font-size: 28rpx; display: flex; align-items: center; gap: 12rpx; }
.mode-val { /* 视觉上提示可点，H5 有效果，小程序忽略也没关系 */ }
.finishing-val {
  background: #000;
  color: #fff;
  padding: 5px 16px;
  border-radius: 100px;
}
.finishing-val text { color: #fff; }
.val.strong { font-weight: 700; }
.val.wrap { flex-wrap: wrap; word-break: break-all; }
.mode-chip { padding: 6rpx 18rpx; border-radius: 999rpx; font-size: 24rpx;}
.mode-direct { background: #f0faf4; color: #19a15f;  }
.mode-speed  { background: #ffc8a4; color: #525252;  }
.mode-lottery{ background: #f4f0ff; color: #6e4bd6;  }
.mode-black  { background: #f5f5f5; color: #333;  }
.external-tip { color: #999; font-size: 24rpx; }

/* 毛坯提供方式：圆角标签 */
.blank-val {
  flex-wrap: wrap;
  justify-content: flex-start;
}
.blank-chip {
  display: inline-flex;
  align-items: center;
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  margin: 6rpx 12rpx 6rpx 0;
}
.blank-chip-text {
  font-size: 24rpx;
}
.blank-chip-icon {
  width: 28rpx;
  height: 28rpx;
  margin-left: 8rpx;
}
.blank-chip--self {
  background: #fff3e0;
  color: #b15b00;
}
.blank-chip--third {
  background: #e5f4ff;
  color: #0a4f94;
}
.blank-chip--stock {
  background: #e8f5e9;
  color: #1b5e20;
}
.blank-empty {
  font-size: 26rpx;
  color: #bbb;
}
.blank-modal-tags {
  margin-bottom: 16rpx;
  display: flex;
  flex-wrap: wrap;
}

/* 详情网格 */
.oc-card { margin-top: 16rpx; }
.oc-grid { display: grid; grid-template-columns: 200rpx 1fr; column-gap: 16rpx; row-gap: 16rpx; }
.oc-label { align-self: start; padding-top: 8rpx; color:#666; font-size: 26rpx; text-align: left; }
.oc-value { align-self: start; }
.oc-value-row { display: flex; align-items: center; gap: 12rpx; flex-wrap: wrap; }
.oc-item { padding: 8rpx 0; }
.oc-item-hd { display:flex; align-items:center; gap:12rpx; margin-bottom: 4rpx; }
.oc-badge { background: #8affbf; color: #000000;  border-radius:12rpx; padding: 8rpx 12rpx; font-size: 24rpx; }
.oc-badge.add { background: #ffc8a4;color: #000000; }
.oc-name { font-size: 28rpx; color:#222; font-weight:600; }
.oc-desc { font-size: 26rpx; color:#666; line-height: 1.7; }
.oc-plain { font-size: 28rpx; color:#333; }
.oc-empty { font-size: 28rpx; color:#bbb; }
.oc-chip-row { display:flex; flex-wrap:wrap; gap: 10rpx; }
.oc-chip {
  display: inline-flex;
  align-items: center;
  gap: 5rpx;
  padding: 0.1875rem 0.375rem;
  background: #b1d6ff;
  border: 0.03125rem solid #d6e6ff;
  font-size: 24rpx;
  color: #000000;
}
.oc-chip-size,.oc-chip-num { font-weight: 700; }
.oc-info-icon { margin-left: 2rpx; }

/* 说明 */
.desc-card {
  margin: 20rpx 24rpx 0;
  padding: 22rpx;
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 6rpx 24rpx rgba(0,0,0,0.06);
}

/* 新的左右排版 */
.desc-row {
  display: flex;
  align-items: flex-start;
  gap: 24rpx;
}
.desc-title {
  font-size: 28rpx;
  color: #333;
  flex: 0 0 auto;
  white-space: nowrap;
}
.desc {
  margin-top: 0;
  font-size: 26rpx;
  color: #555;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-word;
  flex: 1 1 auto;
}

/* 我的待投递卡片 */
.draft-card { margin-top: 20rpx; }
.draft-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12rpx;
}
.draft-title {
  font-size: 28rpx;
  color: #333;
}
.draft-add-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 10rpx 20rpx;
  background: #000000;
  border-radius: 999rpx;
  border: none;
  color: #ffffff;
  font-size: 24rpx;
  line-height: 1;
  margin: 0;
}
.draft-add-btn::after { border: none; }
.draft-add-text {
  color: #ffffff;
}
.draft-list {
  margin-top: 4rpx;
}
.draft-item {
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f2f2f2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}
.draft-item:last-child {
  border-bottom: none;
}
.draft-main {
  flex: 1;
  min-width: 0;
}
.draft-subject {
  font-size: 26rpx;
  color: #222;
  font-weight: 500;
}
.draft-meta {
  margin-top: 6rpx;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8rpx;
  font-size: 22rpx;
  color: #888;
}
.draft-meta-chip {
  padding: 4rpx 10rpx;
  border-radius: 999rpx;
  background: #f5f5f5;
}
.draft-price {
  margin-left: auto;
  font-size: 24rpx;
  color: #333;
}
.draft-actions {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding-left: 8rpx;
}
.draft-empty {
  margin-top: 8rpx;
}
.draft-empty-text {
  font-size: 24rpx;
  color: #999;
}

/* 底部 buybar 与按钮 */
.buybar {
  position: fixed; left: 0; right: 0; bottom: 0;
  background: #ffffff;
  border-top: 1rpx solid #eee;
  padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));
  display: flex; align-items: center; justify-content: space-between;
  box-shadow: 0 -6rpx 18rpx rgba(0,0,0,0.06);
}
.buybar.safe { padding-bottom: calc(16rpx + env(safe-area-inset-bottom)); }

.buy-left { display: flex; align-items: center; gap: 24rpx;}

/* 修改：Switch横向排列 */
.premium-switch-box {
  display: flex; flex-direction: row; align-items: center; gap: 8rpx;
}
.premium-switch-label {
  font-size: 24rpx; color: #888;
  font-weight: bold;
}
.premium-switch-label.active {
  color: #333;
}

/* 胶囊按钮：价格｜库存｜操作 */
.buy-cta {
  height: 72rpx; padding: 0 36rpx;
  border-radius: 999rpx; border: none;
  display: flex; align-items: center; justify-content: center; gap: 28rpx;
  /* box-shadow: 0 6rpx 20rpx rgba(24,144,255,.25); */
  color:#0e1318; font-weight: 800; letter-spacing: .3rpx;margin:0;
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.buy-cta::before {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  /* background: linear-gradient(90deg, #ffbb9b 0%, #ffcfb3 45%, #8ad3ff 75%, #b2e0ff 100%); */
 background: #ff8c2d;
 background: linear-gradient(90deg, #ffbb9b 0%, #ff8c2d 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: -1;
}

.buy-cta.btn-premium-active::before {
  opacity: 1;
}

/* .btn-primary { background: linear-gradient(90deg, #89d4ff 0%, #64c7ff 45%, #2fb1ff 75%, #1499f0 100%); } */
.btn-primary { background: #5ebbed; }
.btn-warn    { background: linear-gradient(90deg, #ffe39a 0%, #ffc45a 60%, #ffa11a 100%); }
/* .btn-warn    { background: #ff8c2d; } */
.btn-grey    { background: linear-gradient(90deg, #d7dbe0 0%, #c8ced6 50%, #b8c0c9 100%); color:#3a4046; }

.stock-text { font-size: 24rpx; color: #fff; z-index: 2;}
.sep { width: 2rpx; height: 26rpx; background: rgba(0,0,0,.18); z-index: 2;}
.cta-text { font-size: 24rpx; color: #fff; z-index: 2;}

/* 弹窗统一子容器 */
.cm-wrapper{
  width: calc(80vw - 70rpx);
  box-sizing: border-box;
}

/* common-modal 微样式 */
.cm-title{
  font-size: 30rpx;
  font-weight: 700;
  margin-bottom: 12rpx;
  color:#222;
}
.cm-body{
  font-size: 26rpx;
  color:#777;
  line-height: 1.8;
  white-space: pre-wrap;
}

/* 定妆说明样式 */
.cm-intro{
  display:block;
  margin-bottom: 16rpx;
  font-size: 26rpx;
  color:#777;
  line-height: 1.7;
}

.cm-swiper-wrapper{
  margin: 16rpx 0 8rpx;
}

.cm-swiper{
  width: 100%;
  height: 340rpx;
}

.cm-slide{
  width: 100%;
  height: 100%;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
}

.cm-img{
  width: 100%;
  height: 260rpx;
  border-radius: 16rpx;
  background:#f5f5f5;
}

.cm-name{
  margin-top: 8rpx;
  font-size: 26rpx;
  color:#555;
  font-weight:600;
}

/* 轮播图和说明文字之间的距离 */
.cm-desc-wrapper{
  margin-top: 24rpx;
}

.cm-desc-title{
  font-size: 28rpx;
  color:#444;
  font-weight:600;
}

.cm-desc-text{
  display:block;
  margin-top: 6rpx;
  font-size: 26rpx;
  color:#777;
  line-height: 1.8;
}

.cm-extra-note{
  display:block;
  margin-top: 16rpx;
  font-size: 24rpx;
  color:#888;
}

.cm-extra{
  display:block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color:#888;
}
uni-button:after {
  border: none;
}
/* 隐藏滚动条 */
::-webkit-scrollbar{ width:0!important; height:0!important; background:transparent!important; display:none!important; }
</style>