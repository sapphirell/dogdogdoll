<template>
  <view class="summary-wrap">
    <!-- 顶部渐变 + 伪Tab + 搜索 -->
    <view class="header">
      <!-- 伪Tab：摘要 / 日历 -->
      <view class="top-tabs" @click.stop>
        <view class="t-tab active" @tap="onTapSummary">
          <text class="font-title">综合</text>
          <view class="underline"></view>
        </view>
        <view class="t-tab" @tap="onTapCalendar">
          <text class="font-title">日历</text>
        </view>
      </view>

      <view class="header-main">
        <view class="hero-sale-card" @tap="scrollToSection('today')">
          <view class="hero-chip font-alimamashuhei">🔥 热门Hot</view>
          <text class="hero-main-title font-title">今日特卖</text>
          <text class="hero-main-sub font-alimamashuhei">Daily Sales · New arrivals today</text>
          <view class="hero-bottom">
            <view class="hero-avatar-row">
              <common-image
                v-for="(thumb, idx) in heroThumbs"
                :key="`hero-thumb-${idx}`"
                class="hero-avatar"
                :class="`hero-avatar-${idx}`"
                :src="thumb"
                width="52"
                height="52"
                radius="50%"
                mode="aspectFill"
              />
              <view v-if="heroMoreCount > 0" class="hero-avatar-more font-alimamashuhei">+{{ heroMoreCount }}</view>
            </view>
            <view class="hero-action font-alimamashuhei">查看详情</view>
          </view>
        </view>

        <view class="search-box">
          <view class="fake-search" @tap="goSearchPage">
            <common-image class="icon" src="/static/search.png" width="36" height="36" radius="0" mode="aspectFit" />
            <text class="placeholder">搜索娃娃 / 妆师 / 毛娘 …</text>
            <view class="action">搜 索</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 今日上新 -->
      <view class="section s-today" :class="[{ 'is-inview': secInView.today }, { 'is-active': activeSection==='today' }]">
      <view class="section-hd">
        <view class="title-group">
          <text class="title font-title">今日贩售</text>
          <text class="title-en font-title">Today's Sales</text>
        </view>
        <view class="sub sub-row">
          <text v-if="todayLoading" class="loading-mini">加载中…</text>
          <text class="link-calendar" @tap="goCalendar">查看全部</text>
        </view>
      </view>

      <view v-if="todayList.length === 0 && !todayLoading" class="empty">
        <common-image class="empty-icon" src="/static/empty-box.png" width="160" height="160" radius="20" mode="aspectFit" />
        <text>今天暂无商品开售</text>
      </view>

      <scroll-view v-else scroll-x class="theme-scroll" :show-scrollbar="false">
        <view
          class="goods-mini"
          v-for="it in todayList"
          :key="'today-' + it.goodsId + '-' + it.recordId"
          @tap="goGoods(it.goodsId, it.recordId)"
        >
          <common-image class="goods-cover" :src="it.cover" width="196" height="262" radius="18" mode="aspectFill" />
          <text class="type-badge font-alimamashuhei" v-if="it.type">{{ it.type }}</text>
          <view class="gname ellipsis-2 font-alimamashuhei">{{ it.goods_name }}</view>
          <view class="size-tags" v-if="it.sizeChips && it.sizeChips.length">
            <text class="size-tag-item font-alimamashuhei" v-for="(sz, i) in it.sizeChips" :key="`today-size-${i}`">{{ sz }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 【新增】今日开妆约毛 (显示在今日上新下方) -->
      <view class="section s-artist-today" :class="[{ 'is-inview': secInView.artistToday }, { 'is-active': activeSection==='artistToday' }]">
      <view class="section-hd">
        <view class="title-group">
          <text class="title font-title">接单提示</text>
          <text class="title-en font-title">Open Tips (Past24h ~ 7d)</text>
        </view>
        <view class="sub sub-row">
          <text v-if="artistPlanLoading" class="loading-mini">加载中…</text>
        </view>
      </view>

      <view v-if="faceupList.length === 0 && hairList.length === 0 && !artistPlanLoading" class="empty">
        <common-image class="empty-icon" src="/static/empty-box.png" width="160" height="160" radius="20" mode="aspectFit" />
        <text>过去24小时到未来7天暂无开妆/开手改毛提示</text>
      </view>

      <view v-else class="artist-plan-container">
        <!-- 妆面列表 -->
        <view v-if="faceupList.length > 0" class="sub-section">
          <view class="sub-label-row">
            <view class="dot-deco makeup"></view>
            <text class="sub-label">开妆</text>
          </view>
          <scroll-view scroll-x class="theme-scroll" :show-scrollbar="false">
            <view
              class="goods-mini artist-mini"
              v-for="plan in faceupList"
              :key="'faceup-' + plan.id"
              @tap="goPlan(plan.id)"
            >
              <!-- 优先取作品图，没有则取Logo -->
              <common-image class="goods-cover" :src="getPlanCover(plan)" width="196" height="220" radius="18" mode="aspectFill" />
              <text class="time-badge font-alimamashuhei">{{ fmtHM(plan.open_time) }} 开投</text>
              <view class="gname ellipsis-1 font-alimamashuhei">{{ plan.artist_name || plan.brand_name }}</view>
              <view class="artist-meta ellipsis-1" v-if="plan.tiers && plan.tiers.length">
                 <text class="artist-price font-title">
                   <text class="price-sign">¥</text>
                   <text class="price-value">{{ formatPrice(plan.tiers[0].price) }}</text>
                   <text class="price-tail font-alimamashuhei">起</text>
                 </text>
              </view>
              <view class="artist-meta ellipsis-1" v-else>
                 <text class="artist-price-empty font-alimamashuhei">无报价</text>
              </view>
            </view>
          </scroll-view>
        </view>

        <!-- 约毛列表 -->
        <view v-if="hairList.length > 0" class="sub-section" :style="{ marginTop: faceupList.length > 0 ? '24rpx' : '0' }">
          <view class="sub-label-row">
            <view class="dot-deco wig"></view>
            <text class="sub-label">约毛</text>
          </view>
          <scroll-view scroll-x class="theme-scroll" :show-scrollbar="false">
            <view
              class="goods-mini artist-mini"
              v-for="plan in hairList"
              :key="'hair-' + plan.id"
              @tap="goPlan(plan.id)"
            >
              <common-image class="goods-cover" :src="getPlanCover(plan)" width="196" height="220" radius="18" mode="aspectFill" />
              <text class="time-badge wig-bg font-alimamashuhei">{{ fmtHM(plan.open_time) }} 开投</text>
              <view class="gname ellipsis-1 font-alimamashuhei">{{ plan.artist_name || plan.brand_name }}</view>
              <view class="artist-meta ellipsis-1" v-if="plan.tiers && plan.tiers.length">
                 <text class="artist-price font-title">
                   <text class="price-sign">¥</text>
                   <text class="price-value">{{ formatPrice(plan.tiers[0].price) }}</text>
                   <text class="price-tail font-alimamashuhei">起</text>
                 </text>
              </view>
              <view class="artist-meta ellipsis-1" v-else>
                 <text class="artist-price-empty font-alimamashuhei">无报价</text>
              </view>
            </view>
          </scroll-view>
        </view>
      </view>
    </view>
    
    <!-- 待贩售 -->
      <view class="section s-waiting" :class="[{ 'is-inview': secInView.waiting }, { 'is-active': activeSection==='waiting' }]">
      <view class="section-hd">
        <view class="title-group">
          <text class="title font-title">待贩售</text>
          <text class="title-en font-title">Pending Sale</text>
        </view>
        <view class="sub sub-row">
          <text v-if="waitingLoading" class="loading-mini">加载中…</text>
          <view class="waiting-view-all" @tap="goWaitingSaleByType">
            <text class="waiting-view-all-text">查看所有待售</text>
            <uni-icons class="waiting-view-all-icon" type="arrow-right" size="14" color="#6e7f95"></uni-icons>
          </view>
        </view>
      </view>
    
      <view v-if="waitingList.length === 0 && !waitingLoading" class="empty">
        <common-image class="empty-icon" src="/static/empty-box.png" width="160" height="160" radius="20" mode="aspectFit" />
        <text>暂无待贩售的商品</text>
      </view>
    
      <view v-else class="waiting-grid">
        <view
          class="waiting-card"
          v-for="it in waitingList.slice(0, 6)"
          :key="'wait-' + it.goodsId"
          @tap="goGoods(it.goodsId)"
        >
          <common-image class="waiting-cover" :src="it.cover" width="100%" height="auto" radius="14" mode="aspectFill" />
          <text class="waiting-type-badge font-alimamashuhei" v-if="it.type">{{ it.type }}</text>
          <view class="waiting-name ellipsis-2 font-alimamashuhei">{{ it.goods_name }}</view>
          <view class="waiting-size-tags" v-if="it.sizeChips && it.sizeChips.length">
            <text class="waiting-size-tag-item font-alimamashuhei" v-for="(sz, i) in it.sizeChips.slice(0, 2)" :key="`wait-size-${i}`">{{ sz }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 热榜：今日 / 近7日（总榜）切换 -->
      <view class="section s-hot" :class="[{ 'is-inview': secInView.hot }, { 'is-active': activeSection==='hot' }]">
      <view class="section-hd">
        <view class="title-group">
          <text class="title font-title">热榜</text>
          <text class="title-en font-title">Hot List</text>
        </view>
        <view class="sub sub-row">
          <text
            :class="['tab-mini', { active: hotMode==='today' }]"
            @tap="hotMode='today'"
          >今日</text>
          <text
            :class="['tab-mini', { active: hotMode==='7days' }]"
            @tap="hotMode='7days'"
          >近7日</text>
          <text v-if="hotLoading" class="loading-mini">加载中…</text>
          <text class="link-calendar" @tap="goCalendar">查看日历</text>
        </view>
      </view>

      <view v-if="activeHotList.length === 0 && !hotLoading" class="empty">
        <common-image class="empty-icon" src="/static/empty-box.png" width="160" height="160" radius="20" mode="aspectFit" />
        <text>{{ hotMode === 'today' ? '今天还没有上榜商品' : '最近7日暂无上榜商品' }}</text>
      </view>

      <view v-else class="hot-list-rows">
        <view
          v-for="(it, idx) in activeHotList"
          :key="`${hotMode}-${it.goodsId}-${idx}`"
          :class="['hot-row', `hot-row-${idx + 1}`, { 'hot-row-plain': idx >= 3 }]"
          @tap="goGoods(it.goodsId, it.recordId)"
        >
          <view class="hot-row-rank">{{ idx + 1 }}</view>
          <common-image class="hot-row-cover" :src="it.cover" width="74" height="74" radius="18" mode="aspectFill" />
          <view class="hot-row-main">
            <text class="hot-row-name ellipsis-1 font-alimamashuhei">{{ it.goods_name }}</text>
            <text class="hot-row-brand ellipsis-1">{{ it.brand_name || '未知品牌' }}</text>
          </view>
          <view class="hot-row-right">
            <uni-icons type="fire" size="18" color="#f09a64" />
            <text class="hot-row-views">{{ it.views ? formatViews(it.views) : '0' }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 主题合集（按后端分组） -->
      <view class="section s-themes" :class="[{ 'is-inview': secInView.themes }, { 'is-active': activeSection==='themes' }]">
      <view class="section-hd">
        <view class="title-group">
          <text class="title font-title">在售合集</text>
          <text class="title-en font-title">Collections</text>
        </view>
        <scroll-view v-if="themeChips.length" scroll-x class="chips-scroll" :show-scrollbar="false">
          <view class="chips">
            <view
              v-for="c in themeChips"
              :key="c.key"
              :class="['chip', 'font-alimamashuhei', { active: activeThemeKey === c.key }]"
              @tap="activeThemeKey = c.key"
            >
              {{ c.title }}
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="themes">
        <scroll-view v-if="filteredThemeItems.length" scroll-x class="theme-scroll" :show-scrollbar="false">
          <view
            class="goods-mini"
            v-for="it in filteredThemeItems"
            :key="it.key"
            @tap="goGoods(it.goodsId, it.recordId)"
          >
            <common-image class="goods-cover" :src="it.cover" width="196" height="262" radius="18" mode="aspectFill" />
            <text class="type-badge font-alimamashuhei" v-if="it.type">{{ it.type }}</text>
            <view class="gname ellipsis-2 font-alimamashuhei">{{ it.goods_name }}</view>
            <view class="size-tags" v-if="it.sizeChips && it.sizeChips.length">
              <text class="size-tag-item font-alimamashuhei" v-for="(sz, i) in it.sizeChips" :key="`theme-size-${i}`">{{ sz }}</text>
            </view>
          </view>
        </scroll-view>
        <view v-else-if="!themeLoading" class="empty-slim">该主题暂无在售</view>
      </view>
    </view>

    <!-- 最近入库（Ops Feed） -->
      <view class="section s-ops" :class="[{ 'is-inview': secInView.ops }, { 'is-active': activeSection==='ops' }]">
      <view class="section-hd">
        <view class="title-group">
          <text class="title font-title">最近收录</text>
          <text class="title-en font-title">Database</text>
        </view>
        <view class="sub" style="display:flex; gap: 12rpx; align-items:center;">
          <text v-if="opsLoading">加载中…</text>
          <text class="link-more" @tap="go2recentFeed">查看更多</text>
        </view>
      </view>

      <view v-if="opsList.length === 0 && !opsLoading" class="empty">
        <common-image class="empty-icon" src="/static/empty-box.png" width="160" height="160" radius="20" mode="aspectFit" />
        <text>最近暂无入库动态</text>
      </view>

      <view v-else class="ops-grid">
        <view
          class="ops-card"
          v-for="(op, idx) in opsList.slice(0, 6)"
          :key="op.id + '-' + idx"
          @tap="goOpsItem(op)"
        >
          <common-image class="ops-cover" :src="op.image_url" width="100%" height="200" radius="18" mode="aspectFill" />
          <view class="ops-content">
            <text class="ops-title ellipsis-1 font-alimama">{{ op.summary || '最新收录' }}</text>
            <view class="ops-meta">
              <text class="ops-brand ellipsis-1">{{ op.brand_name || '匿名品牌' }}</text>
              <text class="ops-time">{{ op.time_ago }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 订阅品牌 -->
      <view class="section s-likes" :class="[{ 'is-inview': secInView.likes }, { 'is-active': activeSection==='likes' }]">
      <view class="section-hd">
        <view class="title-group">
          <text class="title font-title">关注的店铺</text>
          <text class="title-en font-title">Followed Shops</text>
        </view>
        <text class="sub" v-if="likesLoading">加载中…</text>
      </view>

      <view v-if="!hasToken" class="login-tip">
        <text>登录后可查看你的订阅品牌</text>
      </view>

      <scroll-view v-else class="brand-scroll" scroll-x :show-scrollbar="false">
        <view class="brand-item" v-for="it in likeBrands" :key="it.id" @tap="goBrand(it.brand.id)">
          <common-image :src="it.brand.logo_image" width="100" height="100" radius="50%" mode="aspectFill" class="brand-logo" />
          <text class="brand-name ellipsis-1">{{ it.brand.brand_name }}</text>
        </view>
        <view v-if="likeBrands.length === 0 && !likesLoading" class="brand-empty">还没有订阅品牌~</view>
      </scroll-view>
    </view>

    <!-- 即将上新 时间线 -->
    <view class="section s-timeline" :class="[{ 'is-inview': secInView.timeline }, { 'is-active': activeSection==='timeline' }]">
      <view class="section-hd">
        <view class="title-group">
          <text class="title font-title">{{ timelineMode === 'sale' ? '即将贩售' : '接单时间轴' }}</text>
          <text class="title-en font-title">{{ timelineMode === 'sale' ? 'Upcoming (24h)' : 'Faceup & Wig Timeline' }}</text>
        </view>
        <view class="sub sub-row">
          <text v-if="activeTimelineLoading" class="loading-mini">加载中…</text>
          <view class="switch-order-tip" @tap="switchToOrderTips">
            <view v-if="timelineMode === 'sale'" class="switch-order-bubble font-alimamashuhei">点击试试</view>
            <text class="switch-order-text font-title">{{ timelineMode === 'sale' ? '切换到约妆/毛' : '切换到贩售' }}</text>
            <uni-icons class="switch-order-icon" type="arrow-right" size="14" color="#6e7f95"></uni-icons>
          </view>
        </view>
      </view>

      <view v-if="activeTimelineList.length === 0 && !activeTimelineLoading" class="empty">
        <common-image class="empty-icon" src="/static/empty-box.png" width="160" height="160" radius="20" mode="aspectFit" />
        <text>{{ activeTimelineEmptyText }}</text>
      </view>

      <view class="timeline" v-else>
        <view class="timeline-connector"></view>
        <view
          class="tl-item"
          v-for="(r, index) in activeTimelineList"
          :key="r.key"
          :class="{ 'is-visible': index < visibleCount }"
          @tap="onTapTimelineItem(r)"
        >
          <view class="tl-left">
            <view class="tl-time">{{ fmtHM(r.time) }}</view>
            <view class="tl-date">{{ fmtMD(r.time) }}</view>
          </view>
          <view class="tl-middle"><view class="dot"></view></view>
          <view class="tl-card">
            <view class="tl-card-grid">
              <common-image :src="r.cover" width="140" height="200" radius="16" mode="aspectFill" class="thumb" />
              <view class="tl-info">
                <view class="row-1">
                  <text class="brand-tag font-alimamashuhei">{{ r.brand_name }}</text>
                  <text class="gname ellipsis-1 font-alimamashuhei">{{ r.goods_name }}</text>
                </view>
                <view class="row-2">
                  <text class="type-badge font-alimamashuhei" v-if="r.type">{{ r.type }}</text>
                  <view class="hotness" v-if="timelineMode === 'sale'">
                    <uni-icons type="fire" size="22" color="#ff5a6e"></uni-icons>
                    <text class="views" v-if="r.views">{{ formatViews(r.views) }}</text>
                  </view>
                  <text class="order-open-text font-title" v-else>{{ r.openStatusText || '' }}</text>
                </view>
                <view class="sizes" v-if="r.sizeChips && r.sizeChips.length">
                  <text class="size-chip font-alimamashuhei" v-for="(s, i) in r.sizeChips" :key="i">{{ s }}</text>
                </view>
                <view class="order-price font-title" v-if="timelineMode === 'order' && r.priceText">{{ r.priceText }}</view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, getCurrentInstance, watch, nextTick } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { websiteUrl, asyncGetUserInfo } from '@/common/config.js'

/** ----------------- 状态 ----------------- */
const todayList = ref([])     // 今日上新（新增）
const todayLoading = ref(true)

// 【新增】开妆约毛数据
const faceupList = ref([])
const hairList = ref([])
const artistPlanLoading = ref(true)

const hotList = ref([])       // 今日热榜
const hot7List = ref([])      // 近7日热榜（总榜）
const hotMode = ref('today')  // 'today' | '7days'
const hotLoading = ref(true)

// 防抖：避免并发刷新
const isRefreshing = ref(false)

const themeGroups = ref([])
const themeLoading = ref(true)
const activeThemeKey = ref('')

const likeBrands = ref([])
const likesLoading = ref(true)
const hasToken = ref(false)

const timeline = ref([])
const timelineLoading = ref(true)
const orderTimeline = ref([])
const timelineMode = ref('sale') // sale | order
const activeTimelineList = computed(() => (timelineMode.value === 'sale' ? timeline.value : orderTimeline.value))
const activeTimelineLoading = computed(() => (timelineMode.value === 'sale' ? timelineLoading.value : artistPlanLoading.value))
const activeTimelineEmptyText = computed(() => (
  timelineMode.value === 'sale'
    ? '暂无即将开始的上新'
    : '过去24小时到未来7天暂无开妆/手改毛'
))

/** 最近入库（ops-feed） */
const opsList = ref([])
const opsLoading = ref(true)

/** ▼▼▼ 时间轴显隐控制（逐条显现） ▼▼▼ */
const visibleCount = ref(0)
const staggerStarted = ref(false)
let revealTimer = null
const STEP_MS = 700
const instance = getCurrentInstance()
let tlObserver = null

function startStaggerReveal () {
  if (staggerStarted.value) return
  staggerStarted.value = true
  visibleCount.value = 0
  const total = activeTimelineList.value.length || 0
  if (total === 0) return
  const tick = () => {
    if (visibleCount.value < total) {
      visibleCount.value += 1
      revealTimer = setTimeout(tick, STEP_MS)
    } else {
      stopStaggerReveal()
    }
  }
  tick()
}
function stopStaggerReveal () {
  if (revealTimer) {
    clearTimeout(revealTimer)
    revealTimer = null
  }
}
function initTlObserver () {
  destroyTlObserver()
  tlObserver = uni.createIntersectionObserver(instance)
  tlObserver.relativeToViewport({ top: 160 })
  tlObserver.observe('.timeline', (res) => {
    if (!res) return
    const ratio = res?.intersectionRatio || 0
    if (ratio > 0) {
      startStaggerReveal()
      destroyTlObserver()
    }
  })
}
function destroyTlObserver () {
  if (tlObserver && typeof tlObserver.disconnect === 'function') {
    tlObserver.disconnect()
  }
  tlObserver = null
}

function resetTimelineRevealAndObserve () {
  stopStaggerReveal()
  visibleCount.value = 0
  staggerStarted.value = false
  nextTick(() => {
    initTlObserver()
    forceRevealIfStuck()
  })
}

function forceRevealIfStuck () {
  setTimeout(() => {
    if (activeTimelineList.value.length > 0 && visibleCount.value === 0 && !staggerStarted.value) {
      visibleCount.value = activeTimelineList.value.length
    }
  }, 800)
}

/** 待贩售 */
const waitingList = ref([])
const waitingLoading = ref(true)

/** 商品列表（非贩售记录）归一化：不产生 recordId，避免误上报 */
function normalizePlainGoods (list) {
  return (list || []).map(it => {
    const cover = it.goods_image || (Array.isArray(it.goods_images) ? it.goods_images[0] : '')
    const sizes = Array.isArray(it.sizes) ? it.sizes : []
    return {
      recordId: 0, // 关键：不产生记录ID，避免 /sale-record-click
      goodsId: it.goods_id || it.id,
      cover,
      brand_name: it.brand_name || it.brand?.brand_name || '',
      goods_name: it.goods_name || it.name || '',
      type: it.type || '',
      views: it.views || 0,
      sizeChips: sizeChips(sizes)
    }
  })
}

/** 拉取待贩售 */
function fetchWaitingSale () {
  waitingLoading.value = true
  return uni.request({
    url: websiteUrl.value + '/goods/waiting-sale',
    method: 'GET',
    data: { page: 1, page_size: 12, watermark: 1 },
    timeout: 5000
  }).then(res => {
    const list =
      res?.data?.data?.goods_list ||
      res?.data?.data?.list ||
      res?.data?.data ||
      []
    waitingList.value = normalizePlainGoods(list)
  }).finally(() => { waitingLoading.value = false })
}

/** ----------------- Section In-View & Active（只允许一个旋转） ----------------- */
const sectionMap = [
  { sel: '.s-today', key: 'today' },
  { sel: '.s-artist-today', key: 'artistToday' }, // 新增
  { sel: '.s-waiting', key: 'waiting' },
  { sel: '.s-hot', key: 'hot' },
  { sel: '.s-themes', key: 'themes' },
  { sel: '.s-ops', key: 'ops' },
  { sel: '.s-likes', key: 'likes' },
  { sel: '.s-timeline', key: 'timeline' }
]
const secInView = ref({
  today: false, artistToday: false, waiting: false, hot: false, themes: false,
  ops: false, likes: false, timeline: false
})
const lastRatios = ref({})
const activeSection = ref('')
let secObservers = []
let activeSetTimer = null

function scrollToSection (key) {
  const target = sectionMap.find(item => item.key === key)
  if (!target) return
  activeSection.value = key
  uni.pageScrollTo({
    selector: target.sel,
    duration: 280,
    fail: () => {}
  })
}

function pickActiveByMaxRatio () {
  let bestKey = ''
  let bestRatio = 0
  for (const { key } of sectionMap) {
    const r = lastRatios.value[key] || 0
    if (r > bestRatio) { bestRatio = r; bestKey = key }
  }
  activeSection.value = bestRatio > 0.02 ? bestKey : ''
}
function schedulePickActive () {
  if (activeSetTimer) clearTimeout(activeSetTimer)
  activeSetTimer = setTimeout(() => {
    pickActiveByMaxRatio()
    activeSetTimer = null
  }, 80)
}
function initSectionInViewObservers () {
  destroySectionInViewObservers()
  sectionMap.forEach(({ sel, key }) => {
    const ob = uni.createIntersectionObserver(instance)
    ob.relativeToViewport({ top: 120, bottom: 120 })
    ob.observe(sel, (res) => {
      const ratio = res?.intersectionRatio || 0
      secInView.value[key] = ratio > 0
      lastRatios.value[key] = ratio
      schedulePickActive()
    })
    secObservers.push(ob)
  })
}
function destroySectionInViewObservers () {
  secObservers.forEach(o => { try { o.disconnect() } catch(_){} })
  secObservers = []
}

/** ----------------- Token / Auth ----------------- */
function readToken() {
  return uni.getStorageSync('Authorization') || uni.getStorageSync('token') || ''
}
function refreshAuthFlag() {
  hasToken.value = !!readToken()
}
async function ensureAuth() {
  try {
    if (typeof asyncGetUserInfo === 'function') {
      await asyncGetUserInfo()
    }
  } catch (_) {}
  refreshAuthFlag()
}
function getAuthHeader() {
  const t = readToken()
  return t ? { Authorization: t } : {}
}

/** ----------------- 跨天自动刷新：日期记录 ----------------- */
const STORAGE_DATE_KEY = 'summary_page_date_key'
function todayKey () {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

/** 统一刷新当前页需要的数据 */
async function refreshAll (isInit = false) {
  try {
    await Promise.all([
      fetchTodaySales(),    // 今日上新
      fetchArtistPlansOpenTips(), // 开单时间轴数据（过去24h~未来7d）
      fetchWaitingSale(),   // 待贩售
      fetchHotToday(),      // 今日热榜
      fetchThemes(),        // 主题合集
      fetchLikes(),         // 订阅品牌
      fetchTimeline(),      // 即将上新时间线
      fetchOpsFeedRecent()  // 最近入库
    ])
  } finally {
    uni.setStorageSync(STORAGE_DATE_KEY, todayKey())
  }
}

/** ----------------- 顶部伪Tab行为 ----------------- */
async function onTapSummary () {
  if (isRefreshing.value) return
  isRefreshing.value = true
  try {
    uni.showNavigationBarLoading()
    uni.showToast({ title: '正在刷新', icon: 'none', duration: 700 })
    await refreshAll(false)
    uni.showToast({ title: '已更新', icon: 'success', duration: 800 })
    try { uni.vibrateShort({}) } catch(_) {}
  } finally {
    uni.hideNavigationBarLoading()
    isRefreshing.value = false
  }
}
function onTapCalendar () {
  goCalendar()
}

/** ----------------- API ----------------- */
function normalizeGoodsList(list) {
  return (list || []).map(it => {
    const cover = it.goods_image || (Array.isArray(it.goods_images) ? it.goods_images[0] : '')
    const sizes = Array.isArray(it.sizes) ? it.sizes : []
    return {
      recordId: it.id,
      goodsId: it.goods_id || it.id,
      cover,
      brand_name: it.brand_name || it.brand?.brand_name || '',
      goods_name: it.goods_name || it.name || '',
      type: it.type || '',
      views: it.views || it.click_count || 0,
      sizeChips: sizeChips(sizes)
    }
  })
}

/** 今日上新（新增） */
function fetchTodaySales() {
  todayLoading.value = true
  return uni.request({
    url: websiteUrl.value + '/sales-start-today',
    method: 'GET',
    data: { limit: 12 },
    timeout: 5000
  }).then(res => {
    const list = res?.data?.data?.list || res?.data?.data || []
    todayList.value = normalizeGoodsList(list)
  }).finally(() => { todayLoading.value = false })
}

/** 拉取开单时间轴（过去24小时到未来7天，开妆/开手改毛各最多10条） */
function fetchArtistPlansOpenTips() {
  artistPlanLoading.value = true
  return uni.request({
    url: websiteUrl.value + '/order-plan/open-tips',
    method: 'GET',
    data: { start_offset_hours: -24, end_offset_hours: 168, limit: 10 },
    timeout: 5000
  }).then(res => {
    const d = res?.data?.data || {}
    const faceup = d.faceup_list || []
    const hair = d.hairstylist_list || []
    faceupList.value = faceup
    hairList.value = hair

    const merged = [
      ...normalizePlanTimelineRows(faceup, 1),
      ...normalizePlanTimelineRows(hair, 2)
    ].sort((a, b) => a.time - b.time)
    orderTimeline.value = merged
    if (timelineMode.value === 'order') {
      resetTimelineRevealAndObserve()
    }
  }).finally(() => { artistPlanLoading.value = false })
}

// 辅助：获取Plan封面图
function getPlanCover(plan) {
  // 优先取图册第一张
  if (plan.images && plan.images.length > 0) return plan.images[0]
  // 兜底Logo
  return plan.logo_image || ''
}

function normalizePlanTimelineRows(list, artistType) {
  const now = Math.floor(Date.now() / 1000)
  return (list || []).map(plan => {
    const tiers = Array.isArray(plan?.tiers) ? plan.tiers : []
    const firstTierPrice = tiers.length > 0 ? formatPrice(tiers[0]?.price) : ''
    const chips = tiers
      .map(t => (t?.goods_size || t?.name || t?.label || '').trim())
      .filter(Boolean)
      .slice(0, 3)
    const openTime = Number(plan?.open_time || 0)
    return {
      key: `plan-${plan?.id || 0}-${openTime}`,
      mode: 'order',
      planId: plan?.id || 0,
      recordId: 0,
      goodsId: 0,
      time: openTime,
      cover: getPlanCover(plan || {}),
      brand_name: plan?.brand_name || plan?.artist_name || '接单计划',
      goods_name: plan?.artist_name || plan?.brand_name || '接单计划',
      type: artistType === 2 ? '手改毛' : '开妆',
      views: 0,
      sizeChips: chips,
      openStatusText: openTime <= now ? '已开单' : '待开单',
      priceText: firstTierPrice ? `¥${firstTierPrice}起` : '暂无报价'
    }
  }).filter(x => x.time > 0)
}

function fetchHotToday() {
  hotLoading.value = true
  return uni.request({
    url: websiteUrl.value + '/goods-hot-today',
    method: 'GET',
    data: { limit: 6 },
    timeout: 5000
  }).then(res => {
    const list = res?.data?.data?.list || []
    hotList.value = normalizeGoodsList(list)
  }).finally(() => { hotLoading.value = false })
}

function fetchHot7Days() {
  hotLoading.value = true
  return uni.request({
    url: websiteUrl.value + '/goods-hot-7days',
    method: 'GET',
    data: { limit: 6 },
    timeout: 5000
  }).then(res => {
    const list = res?.data?.data?.list || []
    hot7List.value = normalizeGoodsList(list)
  }).finally(() => { hotLoading.value = false })
}

/** 主题合集：按后端分组渲染 */
function fetchThemes() {
  themeLoading.value = true
  return uni.request({
    url: websiteUrl.value + '/goods-themes',
    method: 'GET',
    timeout: 5000
  }).then(res => {
    const groups = res?.data?.data || []
    themeGroups.value = Array.isArray(groups) ? groups : []
    if (!activeThemeKey.value && themeGroups.value.length) {
      activeThemeKey.value = themeGroups.value[0].key
    }
  }).finally(() => { themeLoading.value = false })
}

/** 订阅品牌（需要 Authorization） */
function fetchLikes() {
  likesLoading.value = true
  refreshAuthFlag()
  if (!hasToken.value) {
    likesLoading.value = false
    likeBrands.value = []
    return Promise.resolve()
  }
  return uni.request({
    url: websiteUrl.value + '/with-state/user-likes',
    method: 'GET',
    data: { type: 2, page: 1, page_size: 8 },
    header: getAuthHeader(),
    timeout: 5000
  }).then(res => {
    likeBrands.value = res?.data?.data?.list || []
  }).finally(() => { likesLoading.value = false })
}

/** 最近24小时时间线 */
function fetchTimeline() {
  timelineLoading.value = true
  return uni.request({
    url: websiteUrl.value + '/goods-timeline',
    method: 'GET',
    timeout: 5000
  }).then(res => {
    const raw = res?.data?.data
    const list = Array.isArray(raw) ? raw : raw?.list || []
    const now = Math.floor(Date.now() / 1000)
    const from = now - 3600
    const to = now + 86400

    const norm = list.map(it => {
      const time = deriveTime(it)
      const cover = it.goods_image || (Array.isArray(it.goods_images) ? it.goods_images[0] : '')
      const sizes = Array.isArray(it.sizes) ? it.sizes : []
      return {
        key: `${it.id}-${time || 0}`,
        recordId: it.id,
        goodsId: it.goods_id || it.id,
        time: time || 0,
        cover,
        brand_name: it.brand_name || it.brand?.brand_name || '',
        goods_name: it.goods_name || it.name || '',
        type: it.type || '',
        views: it.views || it.click_count || 0,
        sizeChips: sizeChips(sizes)
      }
    }).filter(x => x.time >= from && x.time <= to)

    norm.sort((a, b) => a.time - b.time)
    timeline.value = norm

    resetTimelineRevealAndObserve()

    setTimeout(() => {
      if (!staggerStarted.value) {
        uni.createSelectorQuery().in(instance).select('.timeline').boundingClientRect(rect => {
          try {
            const vh = uni.getSystemInfoSync().windowHeight || 0
            if (rect && typeof rect.top === 'number' && rect.top < vh - 160) {
              startStaggerReveal()
            }
          } catch (_) {}
        }).exec()
      }
    }, 0)
  }).finally(() => { timelineLoading.value = false })
}

/** 最近入库（Ops Feed） */
function fetchOpsFeedRecent() {
  opsLoading.value = true
  return uni.request({
    url: websiteUrl.value + '/ops-feed/recent',
    method: 'GET',
    data: { hours: 24, page: 1, page_size: 12 },
    timeout: 5000
  }).then(res => {
    const rows = res?.data?.data?.list || []
    opsList.value = rows.map(r => ({
      id: r.id,
      op_type: r.op_type,
      target_id: r.target_id,
      brand_id: r.brand_id,
      brand_name: r.brand_name || '',
      goods_id: r.goods_id,
      goods_name: r.goods_name || '',
      summary: r.summary || '',
      image_url: r.image_url || '',
      time_ago: r.time_ago || ''
    }))
  }).finally(() => { opsLoading.value = false })
}

/** ----------------- 主题合集：归一化与筛选 ----------------- */
const themeChips = computed(() =>
  (themeGroups.value || []).map(g => ({ key: g.key, title: g.title }))
)
const filteredThemeItems = computed(() => {
  const g = (themeGroups.value || []).find(x => x.key === activeThemeKey.value)
  if (!g || !Array.isArray(g.items)) return []
  return g.items.map(it => {
    const info = it.goods_info || {}
    const sizes = it.sizes || info.sizes || []
    const cover = it.goods_image
      || (Array.isArray(info.goods_images) ? info.goods_images[0] : '')
      || (Array.isArray(it.goods_images) ? it.goods_images[0] : '')
      || ''
    return {
      key: `${it.id}-${it.goods_id || info.id || ''}`,
      recordId: it.id,
      goodsId: it.goods_id || info.id || it.id,
      cover,
      goods_name: it.goods_name || it.name || info.name || '',
      brand_name: it.brand_name || info.brand_name || '',
      type: it.type || info.type || '',
      sizeChips: sizeChips(sizes)
    }
  })
})

const activeHotList = computed(() => hotMode.value === 'today' ? hotList.value : hot7List.value)
const heroThumbs = computed(() => {
  const list = (todayList.value || []).slice(0, 3).map(it => it.cover).filter(Boolean)
  if (list.length === 0) return ['/static/new-icon/tab1.png', '/static/new-icon/tab2.png']
  return list
})
const heroMoreCount = computed(() => {
  const count = (todayList.value || []).length - heroThumbs.value.length
  return count > 0 ? count : 0
})

/** ----------------- helpers ----------------- */
function onSearchSubmit() {}
function formatPrice(value) {
  const n = Number(value || 0)
  if (!Number.isFinite(n)) return '0'
  if (Number.isInteger(n)) return String(n)
  return n.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1')
}
function sizeChips(sizes) {
  if (!Array.isArray(sizes) || sizes.length === 0) return []
  const chips = []
  const exists = new Set()
  sizes.forEach(s => {
    const key = (s.goods_size || '').trim()
    if (!key) return
    if (exists.has(key)) return
    exists.add(key)
    chips.push(key)
  })
  return chips.slice(0, 3)
}
function go2recentFeed() {
  uni.navigateTo({ url: "/pages/recent-feed/recent-feed" })
}
function goOpsFeed () {
  if (process.env.UNI_PLATFORM === 'h5') {
    location.href = '/#/pages/ops_feed/ops_feed'
    return
  }
  uni.navigateTo({ url: '/pages/ops_feed/ops_feed' })
}
function goCalendar () {
  if (process.env.UNI_PLATFORM === 'h5') {
    location.href = '/#/pages/calendar/calendar'
    return
  }
  uni.navigateTo({ url: '/pages/calendar/calendar' })
}
function goWaitingSaleByType () {
  if (process.env.UNI_PLATFORM === 'h5') {
    location.href = '/#/pages/waiting_sale/waiting_sale'
    return
  }
  uni.navigateTo({ url: '/pages/waiting_sale/waiting_sale' })
}

function switchToOrderTips () {
  timelineMode.value = timelineMode.value === 'sale' ? 'order' : 'sale'
}

function onTapTimelineItem (item) {
  if (!item) return
  if (timelineMode.value === 'order' || item.mode === 'order') {
    if (item.planId) goPlan(item.planId)
    return
  }
  goGoods(item.goodsId, item.recordId)
}

function deriveTime(it) {
  const cands = []
  if (it.sub_time) cands.push(+it.sub_time)
  for (let i = 1; i <= 5; i++) {
    const v = it[`sub_time${i}`]
    if (v) cands.push(+v)
  }
  if (it.start_time) cands.push(+it.start_time)
  return cands.filter(x => x > 0).sort((a, b) => a - b)[0] || 0
}
function fmtHM(ts) {
  const d = new Date(ts * 1000)
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}
function fmtMD(ts) {
  const d = new Date(ts * 1000)
  const M = String(d.getMonth() + 1).padStart(2, '0')
  const D = String(d.getDate()).padStart(2, '0')
  return `${M}/${D}`
}
function formatViews(views) {
  if (views >= 10000) return (views / 10000).toFixed(1) + 'w'
  if (views >= 1000) return (views / 1000).toFixed(1) + 'k'
  return views
}

/** ----------------- 跳转 ----------------- */
function goGoods(goodsId, recordId) {
  if (recordId) {
    uni.request({
      url: websiteUrl.value + '/sale-record-click?id=' + recordId,
      method: 'POST',
      header: { 'Content-Type': 'application/json' }
    })
  }
  if (!goodsId) return
  uni.navigateTo({ url: `/pages/goods/goods?goods_id=${goodsId}` })
}
function goBrand(brandId) {
  uni.navigateTo({ url: `/pages/brand/brand?brand_id=${brandId}` })
}
// 新增：跳转开单详情
function goPlan(planId) {
  uni.navigateTo({
    url: `/pkg-creator/creator_order/plan_detail/plan_detail?id=${planId}`
  })
}

function goOpsItem (op) {
  if (!op) return
  // 优先跳商品
  if (op.goods_id && Number(op.goods_id) > 0) {
    goGoods(op.goods_id)
    return
  }
  // 其后跳品牌
  if (op.brand_id && Number(op.brand_id) > 0) {
    goBrand(op.brand_id)
    return
  }
  // 兜底：添加品牌类（op_type===1）一般 target_id 即品牌ID
  if (op.op_type === 1 && op.target_id && Number(op.target_id) > 0) {
    goBrand(op.target_id)
    return
  }
}

function goSearchPage () {
  const tabs = '1,2,3,4'
  const mode = 'jump'
  uni.navigateTo({
    url: `/pkg-common/search/search?mode=${mode}&tabs=${tabs}`
  })
}

/** ----------------- 下拉刷新 ----------------- */
async function handlePullDownRefresh () {
  if (isRefreshing.value) return
  isRefreshing.value = true
  try {
    uni.showNavigationBarLoading()
    await refreshAll(false)
    if (activeTimelineList.value.length > 0 && visibleCount.value === 0) {
      resetTimelineRevealAndObserve()
      startStaggerReveal()
    }
  } catch (e) {
  } finally {
    uni.stopPullDownRefresh()
    uni.hideNavigationBarLoading()
    isRefreshing.value = false
  }
}
onPullDownRefresh(handlePullDownRefresh)

/** ----------------- 生命周期 ----------------- */
onMounted(async () => {
  await ensureAuth()
  await refreshAll(true)   // 统一刷新并记录今天
  initTlObserver()
  initSectionInViewObservers()
})

onShow(() => {
  try {
    const last = uni.getStorageSync(STORAGE_DATE_KEY)
    const now = todayKey()
    if (last && last !== now) {
      // 隔天自动刷新数据
      refreshAll(false).then(() => {
        if (activeTimelineList.value.length > 0) {
          resetTimelineRevealAndObserve()
          startStaggerReveal()
        }
      })
    }
  } catch (_) {}
})

watch(hotMode, (m) => {
  if (m === '7days' && hot7List.value.length === 0) {
    fetchHot7Days()
  }
})

watch(timelineMode, () => {
  nextTick(() => {
    resetTimelineRevealAndObserve()
  })
})

onBeforeUnmount(() => {
  stopStaggerReveal()
  destroyTlObserver()
  destroySectionInViewObservers()
})
</script>

<style lang="less" scoped>
/* =========================================================
   统一主题变量
   ========================================================= */
.summary-wrap {
  --c-primary: #7a8fa3;
  --c-primary-700: #6d8093;
  --c-primary-500: #7a8fa3;

  --c-grad-start: #88a4ba;
  --c-grad-end:   #88a4ba;
  --g-primary: linear-gradient(135deg, var(--c-grad-start), var(--c-grad-end));

  --c-accent-start: #88a4ba;
  --c-accent-end:   #88a4ba;
  --g-accent: linear-gradient(135deg, var(--c-accent-start), var(--c-accent-end));

  --c-soft-rgb: 163, 177, 192;
  --c-primary-r: 122;
  --c-primary-g: 143;
  --c-primary-b: 163;

  --star-rot-speed: 3.2s;
}

.summary-wrap{
  padding-bottom: 56rpx;
  background-color: #f0f2f5;
}

/* 统一移除摘要页所有边框线 */
.summary-wrap,
.summary-wrap *,
.summary-wrap *::before,
.summary-wrap *::after{
  border: none !important;
}

/* 顶部渐变 + 伪Tab + 搜索 */
.header{
  padding: 20rpx 24rpx 18rpx;
  background: linear-gradient(180deg, #eef9ff 0%, #e9f3fb 42%, #edf2f7 100%);
  border-radius: 0 0 28rpx 28rpx;
  box-shadow: 0 10rpx 24rpx rgba(74, 112, 146, 0.10);

  .top-tabs{
    display: flex;
    gap: 36rpx;
    align-items: flex-end;
    padding: 8rpx 4rpx 4rpx;
    margin-bottom: 16rpx;
    margin-left: 10rpx;
    .t-tab{
      position: relative; 
      padding: 8rpx 6rpx 12rpx;
	  text {
		  font-size: 31rpx;
      line-height: 1;
      font-weight: 800;
      color:#8a8f9a;
	  }
      .underline{ display:none; position:absolute; left:0; right:0; bottom:0; height:6rpx; border-radius:6rpx; background: linear-gradient(90deg, #8da5ba, #8da5ba); }
      &.active{ text {color:#333;} .underline{ display:block; } }
      &:active{ opacity:.9; }
    }
  }

  .header-main{
    display: flex;
    flex-direction: column;
    gap: 16rpx;
  }

  .search-box{
    margin-top: 2rpx;
  }
}

.hero-sale-card{
  position: relative;
  overflow: hidden;
  min-height: 224rpx;
  border-radius: 36rpx 52rpx 36rpx 36rpx;
  padding: 22rpx 26rpx 22rpx;
  background: linear-gradient(140deg, #52b4e8 0%, #4aa8de 60%, #59b8ef 100%);
  box-shadow: 0 16rpx 34rpx rgba(58, 126, 171, 0.26);
}

.hero-sale-card::after{
  content: '';
  position: absolute;
  right: -8rpx;
  top: 0;
  width: 120rpx;
  height: 86rpx;
  border-bottom-left-radius: 70rpx;
  background: rgba(191, 234, 255, 0.42);
}

.hero-chip{
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40rpx;
  padding: 0 16rpx;
  border-radius: 999rpx;
  font-size: 18rpx;
  font-weight: 700;
  background: rgba(255,255,255,.22);
  color: #eaf7ff;
}

.hero-main-title{
  display: block;
  margin-top: 10rpx;
  font-size: 40rpx;
  font-weight: 900;
  color: #f6fdff;
  line-height: 1.1;
}

.hero-main-sub{
  display: block;
  margin-top: 10rpx;
  font-size: 19rpx;
  color: rgba(238, 250, 255, .92);
  line-height: 1.32;
}

.hero-bottom{
  margin-top: 18rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.hero-avatar-row{
  display: flex;
  align-items: center;
}

.hero-avatar{
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  border: 3rpx solid rgba(255, 255, 255, .9);
  box-shadow: 0 8rpx 14rpx rgba(43, 82, 114, .2);
  background: rgba(255,255,255,.22);
}

.hero-avatar + .hero-avatar{
  margin-left: -12rpx;
}

.hero-avatar-more{
  min-width: 52rpx;
  height: 52rpx;
  line-height: 52rpx;
  text-align: center;
  padding: 0 10rpx;
  margin-left: -10rpx;
  border-radius: 999rpx;
  color: #2f5f79;
  background: rgba(255,255,255,.82);
  font-size: 18rpx;
  font-weight: 700;
}

.hero-action{
  height: 56rpx;
  padding: 0 26rpx;
  border-radius: 999rpx;
  line-height: 56rpx;
  font-size: 20rpx;
  color: #2e86ba;
  background: linear-gradient(180deg, rgba(255,255,255,.96), rgba(239,249,255,.95));
  font-weight: 700;
  box-shadow: 0 6rpx 14rpx rgba(59, 124, 165, 0.18);
}

/* 区块外框 */
.section{
  padding: 24rpx 24rpx 22rpx;
  margin: 18rpx 24rpx 24rpx;
  background: #fff;
  border-radius: 28rpx;
  box-shadow: 0 10rpx 24rpx rgba(54, 82, 112, 0.06);
  &:last-child { margin-bottom: 0; }
}

/* 区块标题（星星替代左边框） */
.section-hd{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  margin-bottom: 30rpx;
  flex-wrap: wrap;

  .title-group{
    display: flex;
    align-items: baseline;
    min-width: 0;
    gap: 10rpx;
  }

  .title{
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 12rpx;

    font-size: 30rpx;
    font-weight: 800;
    color:#1f2736;
    line-height: 1.1;

    padding-left: 0;
    border-left: none;

    &::before{
      content: '';
      width: 28rpx;
      height: 28rpx;
      background: url('/static/new-icon/flower.png') no-repeat center / contain;
      display: inline-block;
      transform-origin: 50% 50%;
    }
  }
  .title-en{
    font-size: 18rpx;
    color: #8da0b4;
    line-height: 1;
    opacity: .92;
  }
  .sub{ font-size: 20rpx; color:#999; }
}

.s-today .section-hd,
.s-artist-today .section-hd,
.s-waiting .section-hd,
.s-themes .section-hd{
  margin-bottom: 20rpx;
}

/* 旋转动画（只给唯一激活的 section） */
@keyframes star-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
.section.is-active .section-hd .title::before{
  animation: star-spin var(--star-rot-speed) linear infinite;
}

/* 迷你切换按钮 */
.tab-mini{
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  color:#666;
  background: rgba(var(--c-soft-rgb), .12);
  border: 1rpx solid rgba(var(--c-soft-rgb), .30);
  margin-left: 12rpx;
  transition: all .2s ease;

  &.active{
    background: #384353;
    color:#fff;
    font-weight: 600;
  }
}

/* 热榜/上新右侧：查看日历按钮 + loading 微样式 */
.sub-row{
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.loading-mini{ color:#999; }
.link-calendar{
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  color: #667488;
  background: #f1f4f7;
  transition: all .2s ease;
}
.link-calendar:active{ opacity:.85; }

.waiting-view-all{
  padding: 8rpx 14rpx 8rpx 16rpx;
  border-radius: 999rpx;
  background: #f1f4f7;
  display: flex;
  align-items: center;
  gap: 4rpx;
  transition: all .2s ease;
}
.waiting-view-all:active{ opacity: .82; }
.waiting-view-all-text{
  font-size: 20rpx;
  color: #667488;
  line-height: 1;
}
.waiting-view-all-icon{
  display: inline-flex;
  animation: switch-right-bounce 1.2s ease-in-out infinite;
}

.switch-order-tip{
  position: relative;
  overflow: visible;
  padding: 8rpx 14rpx 8rpx 16rpx;
  border-radius: 999rpx;
  background: #f1f4f7;
  display: flex;
  align-items: center;
  gap: 4rpx;
  transition: all .2s ease;
}
.switch-order-tip:active{ opacity: .82; }
.switch-order-text{
  font-size: 20rpx;
  color: #667488;
  line-height: 1;
}
.switch-order-icon{
  display: inline-flex;
  animation: switch-right-bounce 1.2s ease-in-out infinite;
}
.switch-order-bubble{
  position: absolute;
  left: 50%;
  top: -52rpx;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #fff9d8 0%, #ffe9f4 55%, #e8f4ff 100%);
  color: #5a4169;
  border: 1rpx solid #f5d3e2;
  border-radius: 999rpx;
  padding: 6rpx 18rpx;
  font-size: 17rpx;
  font-weight: 600;
  letter-spacing: 0.6rpx;
  line-height: 1.35;
  white-space: nowrap;
  box-shadow:
    0 8rpx 20rpx rgba(226, 130, 171, 0.26),
    0 0 0 3rpx rgba(255, 242, 248, 0.8);
  z-index: 4;
  animation: summaryTryBubbleFloat 1.9s ease-in-out infinite, summaryTryBubbleGlow 2.4s ease-in-out infinite;
}
.switch-order-bubble::before{
  content: '';
  position: absolute;
  left: 50%;
  bottom: -14rpx;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 11rpx solid transparent;
  border-right: 11rpx solid transparent;
  border-top: 13rpx solid #f5d3e2;
}
.switch-order-bubble::after{
  content: '';
  position: absolute;
  left: 50%;
  bottom: -12rpx;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 9rpx solid transparent;
  border-right: 9rpx solid transparent;
  border-top: 11rpx solid #ffeef6;
  filter: drop-shadow(0 2rpx 2rpx rgba(226, 130, 171, 0.18));
}
@keyframes switch-right-bounce{
  0%, 100% { transform: translateX(0); }
  45% { transform: translateX(8rpx); }
  60% { transform: translateX(3rpx); }
}
@keyframes summaryTryBubbleFloat {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-6rpx); }
}
@keyframes summaryTryBubbleGlow {
  0%, 100% {
    box-shadow:
      0 8rpx 20rpx rgba(226, 130, 171, 0.26),
      0 0 0 3rpx rgba(255, 242, 248, 0.8);
  }
  50% {
    box-shadow:
      0 10rpx 24rpx rgba(226, 130, 171, 0.34),
      0 0 0 6rpx rgba(255, 236, 245, 0.55);
  }
}

/* 查看更多 */
.link-more{
  font-size: 20rpx;
  color: #667488;
  padding: 6rpx 10rpx;
  border-radius: 8rpx;
  background: #f1f4f7;
}

/* ---- 热榜：纵向列表 ---- */
.hot-list-rows{
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.hot-row{
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 18rpx;
  border-radius: 22rpx;
  background: transparent;
}

.hot-row-1{
  background: #f2f7fb;
}
.hot-row-2{
  background: #f5f8fb;
}
.hot-row-3{
  background: #f8fafc;
}
.hot-row-plain{
  background: transparent !important;
}

.hot-row-rank{
  width: 44rpx;
  min-width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background: transparent;
  color: #8f9caf;
  font-size: 20rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.hot-row-1 .hot-row-rank{
  background: rgba(88, 150, 182, .86);
  color: #fff;
}
.hot-row-2 .hot-row-rank{
  background: rgba(88, 150, 182, .56);
  color: #fff;
}
.hot-row-3 .hot-row-rank{
  background: rgba(88, 150, 182, .30);
  color: #fff;
}
.hot-row-plain .hot-row-rank{
  background: transparent !important;
  color: #9aa5b6;
}

.hot-row-cover{
  width: 80rpx;
  height: 80rpx;
  border-radius: 18rpx;
  background: #ecf3f9;
}

.hot-row-main{
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.hot-row-name{
  font-size: 24rpx;
  color: #1f2736;
  font-weight: 700;
}

.hot-row-brand{
  font-size: 19rpx;
  color: #8da0b4;
}

.hot-row-right{
  display: flex;
  align-items: center;
  gap: 6rpx;
  color: #7d8aa0;
}

.hot-row-views{
  font-size: 20rpx;
  font-weight: 700;
}

/* 主题合集 & 今日上新卡片复用 */
.chips-scroll{ width: 100%; margin-top: 24rpx;
  .chips{ display:flex; gap: 18rpx; flex-wrap: nowrap; padding-left: 14rpx; padding-bottom: 8rpx; width: max-content; }
}
.chip{
  padding: 10rpx 22rpx; font-size: 20rpx; color:#666;
  background: #f1f3f6;
  transition: all 0.3s ease; white-space: nowrap; height: 34rpx; line-height: 30rpx; display: flex; align-items: center;
  &.active{
    background: #384353;
    color:#fff; border-color: var(--c-grad-start); border-radius:20px 0 20px 0 ; 
    font-weight: 500;
  }
}
.theme-scroll{ white-space: nowrap; padding-top: 10rpx; }

/* 待贩售：固定 3 列 x 2 行，不横向滚动 */
.waiting-grid{
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10rpx;
}

.waiting-card{
  position: relative;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  padding: 0 6rpx 8rpx;
}

.waiting-cover{
  display: block;
  width: 100%;
  height: auto !important;
  aspect-ratio: 3 / 4;
  margin-top: 6rpx;
  background: linear-gradient(135deg, #f0f4f8, #e2e8f0);
}

.waiting-type-badge{
  position: absolute;
  left: 14rpx;
  top: 14rpx;
  padding: 4rpx 10rpx;
  border-radius: 999rpx;
  font-size: 16rpx;
  font-weight: 600;
  color: #fff;
  background: rgba(0,0,0,.54);
}

.waiting-name{
  margin-top: 8rpx;
  font-size: 23rpx;
  line-height: 1.35;
  color: #232f42;
  min-height: 62rpx;
}

.waiting-size-tags{
  margin-top: 10rpx;
  display: flex;
  gap: 8rpx;
  flex-wrap: nowrap;
  overflow: hidden;
}

.waiting-size-tag-item{
  padding: 5rpx 12rpx;
  border-radius: 999rpx;
  font-size: 18rpx;
  font-weight: 600;
  color: #667488;
  background: #f2f4f7;
  white-space: nowrap;
}

.goods-mini{
  display:inline-flex; flex-direction:column; width: 230rpx; min-height: 402rpx; margin-bottom: 16rpx;
  margin-right: 12rpx; background: #fff; border-radius: 24rpx; overflow: hidden;
  transition: all 0.3s ease; position: relative;
  &:active{ transform: translateY(1rpx) scale(.996); }

  .type-badge{
    position: absolute; left: 18rpx; top: 18rpx;
    padding: 6rpx 12rpx; border-radius: 999rpx; font-size: 17rpx; font-weight: 600;
    background: rgba(0,0,0,.55); color:#fff; backdrop-filter: blur(2rpx);
  }

  .goods-cover{
    display: block;
    margin: 12rpx auto 0;
    background: linear-gradient(135deg, #f0f4f8, #e2e8f0);
  }

  .gname{
    font-size: 24rpx;
    margin: 12rpx 12rpx 0;
    line-height: 1.35;
    color:#232f42;
    font-weight: 700;
    min-height: 66rpx;
  }

  .size-tags{
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    gap: 8rpx;
    margin: 10rpx 12rpx 12rpx;
    min-height: 38rpx;
    overflow: hidden;
  }

  .size-tag-item{
    padding: 5rpx 14rpx;
    border-radius: 999rpx;
    font-size: 19rpx;
    font-weight: 600;
    color: #667488;
    background: #f2f4f7;
    white-space: nowrap;
  }
}
.empty-slim{ text-align:center; color:#999; padding: 16rpx 0; font-size: 22rpx; }

/* 订阅品牌 */
.login-tip{ padding: 16rpx 0 0; color:#999; font-size: 20rpx; text-align: center; }
.brand-scroll{ white-space: nowrap; padding: 8rpx 0; }
.brand-item{
  display:inline-flex; width: 160rpx; flex-direction:column; align-items:center; margin-right: 24rpx;
  background: #fff; border-radius: 20rpx; padding: 20rpx 0; 
  transition: all 0.3s ease;

  &:active { transform: scale(0.97); }

  .brand-logo{ width: 100rpx; height: 100rpx; border-radius: 50%; background:#f2f2f2; }
  .brand-name{ margin-top: 16rpx; font-size: 20rpx; color:#333; width: 100%; text-align:center; padding: 0 10rpx; font-weight: 500; }
}
.brand-empty{ padding: 30rpx; color:#999; text-align: center; font-size: 20rpx; }

.ops-grid{
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12rpx;
}

.ops-card{
  background: #f8fbfe;
  border-radius: 18rpx;
  overflow: hidden;
}

.ops-cover{
  width: 100%;
  height: 140rpx;
  background: #edf2f7;
}

.ops-content{
  padding: 10rpx 10rpx 12rpx;
}

.ops-title{
  font-size: 19rpx;
  font-weight: 700;
  color: #232f42;
}

.ops-meta{
  margin-top: 6rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6rpx;
}

.ops-brand{
  flex: 1;
  min-width: 0;
  font-size: 16rpx;
  color: #91a0b1;
}

.ops-time{
  font-size: 15rpx;
  color: #9fb0c4;
  flex-shrink: 0;
}

/* ---- 空态 ---- */
.empty{
  display:flex; flex-direction:column; align-items:center; color:#999; padding: 40rpx 0;
  .empty-icon{ margin-bottom: 20rpx; opacity:.7; }
}

/* ---- 时间轴 ---- */
.timeline{ position: relative; padding: 20rpx 0; }
.timeline-connector {
  position: absolute; left: 115rpx; top: 40rpx; bottom: 40rpx; width: 4rpx;
  background: linear-gradient(to bottom,
    rgba(var(--c-soft-rgb), .55),
    rgba(var(--c-primary-r), var(--c-primary-g), var(--c-primary-b), .15)
  );
  z-index: 1;
}

.tl-item{
  display: flex;
  margin-bottom: 40rpx;
  position: relative;
  align-items: flex-start;
  z-index: 2;

  opacity: 0.01;
  transform: translateY(16rpx);
  transition: opacity .34s ease, transform .4s ease;
  will-change: opacity, transform;

  &:last-child { margin-bottom: 0; }

  &.is-visible{
    opacity: 1;
    transform: translateY(0);
  }
}

.tl-left{
  width: 82rpx; text-align: right; padding-right: 22rpx; padding-top: 6rpx;
  .tl-time{ font-size: 26rpx; color: #6f7f92; font-weight: 700; line-height: 1.2; }
  .tl-date{ font-size: 18rpx; color:#9aa4b2; margin-top: 6rpx; }
}
.tl-middle{ position: relative; width: 30rpx; height: 100%; display: flex; justify-content: center;
  .dot{
    width: 24rpx; height:24rpx; border-radius:50%; background:#fff;
    border: 4rpx solid var(--c-grad-start);
    box-shadow: 0 0 0 4rpx rgba(var(--c-soft-rgb), .20);
    z-index: 3; margin-top: 10rpx;
  }
}

.tl-card{
  flex:1; background:#fff; border-radius: 20rpx; padding: 20rpx;
  transition: box-shadow .3s ease; margin-left: 10rpx; min-height: 160rpx;
  &:active { opacity: .95; }

  .tl-card-grid{
    display: grid;
    grid-template-columns: 140rpx 1fr;
    column-gap: 20rpx;
    align-items: start;
  }

  .thumb{ width: 140rpx; height: 200rpx; border-radius: 16rpx; background: linear-gradient(135deg, #f0f4f8, #e2e8f0); }

  .tl-info{
    display: flex; flex-direction: column; min-width: 0;

    .row-1{
      display:flex; align-items:center; gap:12rpx; margin-bottom: 10rpx; min-width: 0;
      .brand-tag{
        background: #5f6e83;
        color:#fff; padding: 4rpx 12rpx; font-size: 18rpx; border-radius: 8rpx; font-weight: 500; flex-shrink: 0;
      }
      .gname{ font-size: 23rpx; color:#333; flex:1; font-weight: 500; min-width: 0; }
    }

    .row-2{
      display:flex; justify-content:space-between; gap: 12rpx; align-items:center; font-size: 20rpx; color:#777; min-height: 40rpx;

      .type-badge{
        padding: 6rpx 14rpx; border-radius: 999rpx; font-size: 18rpx; font-weight: 600;
        background: #f1f4f7;
        color: #667488;
        max-width: 70%; overflow:hidden; white-space:nowrap; text-overflow:ellipsis;
      }
      .hotness{ display: flex; align-items: center;
        .views{ color:#ff5a6e; font-weight: 500; margin-left: 4rpx; }
      }
      .order-open-text{
        color: #6f7f92;
        font-size: 19rpx;
      }
    }

    .sizes{
      display: flex; flex-wrap: wrap; gap: 8rpx 10rpx; margin-top: 12rpx; max-height: none;
      .size-chip{
        padding: 6rpx 12rpx; border-radius: 999rpx;
        font-size: 18rpx; line-height: 1.4; color: #667488;
        background: #f1f4f7;
        max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
    }

    .order-price{
      margin-top: 12rpx;
      font-size: 22rpx;
      color: #5f6e83;
    }
  }
}

/* 文字截断 */
.ellipsis-1{ overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
.ellipsis-2{ display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }

/* 假搜索框样式 */
.fake-search{
  height: 76rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 0 16rpx 0 20rpx;
  border-radius: 38rpx;
  background: rgba(255,255,255,.92);
  box-shadow: 0 6rpx 14rpx rgba(72, 105, 134, 0.08);

  .icon{
    width: 36rpx;
    height: 36rpx;
    opacity: .85;
    flex-shrink: 0;
  }

  .placeholder{
    flex: 1;
    color: #97a6b8;
    font-size: 20rpx;
  }

  .action{
    padding: 8rpx 16rpx;
    border-radius: 999rpx;
    font-size: 20rpx;
    color: #fff;
    background: #5f6e83;
    flex-shrink: 0;
  }

  &:active { opacity: .9; }
}

/* 【新增】今日开妆约毛样式 */

.sub-section {
  position: relative;
}
.sub-label-row {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
  padding-left: 10rpx;
}
.dot-deco {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  margin-right: 12rpx;
  &.makeup { background: #ff9a9e; box-shadow: 0 0 8rpx rgba(255, 154, 158, 0.6); }
  &.wig { background: #a18cd1; box-shadow: 0 0 8rpx rgba(161, 140, 209, 0.6); }
}
.sub-label {
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
}
.artist-mini {
	height: auto;
  min-height: 0;
  /* 复用 .goods-mini 基础样式，微调内部 */
  .time-badge {
    position: absolute; left: 12rpx; top: 12rpx;
    padding: 6rpx 12rpx; border-radius: 8rpx; font-size: 19rpx; font-weight: 600;
    background: rgba(255, 111, 145, 0.9); color:#fff; backdrop-filter: blur(2rpx);
    &.wig-bg { background: rgba(132, 94, 194, 0.9); }
  }
  .gname{
    margin: 10rpx 12rpx 0;
    min-height: 34rpx;
    font-size: 24rpx;
    font-weight: 700;
  }
  .artist-meta {
    margin: 8rpx 12rpx 10rpx;
    min-height: 44rpx;
    display: flex;
    align-items: flex-end;
    color: #2d3745;
  }
  .artist-price{
    display: inline-flex;
    align-items: flex-end;
    line-height: 1;
    color: #2f3c4d;
  }
  .price-sign{
    font-size: 24rpx;
    margin-right: 2rpx;
    opacity: .9;
  }
  .price-value{
    font-size: 42rpx;
    font-weight: 700;
    letter-spacing: .4rpx;
  }
  .price-tail{
    font-size: 20rpx;
    margin-left: 2rpx;
    color: #5f6d7f;
  }
  .artist-price-empty{
    font-size: 20rpx;
    color: #8d9aad;
  }
}
</style>
