<template>
  <view class="summary-wrap">
    <view-logs />

    <!-- 吸顶标题栏（滚动后出现，可点击跳品牌/妆师） -->
    <view
      class="sticky-titlebar"
      v-show="showStickyTitle"
      :style="{ paddingTop: safeTop + 'px' }"
    >
      <view class="st-left">
        <view class="nav-back-pill" @click="goBack" aria-label="返回">
          <uni-icons type="left" size="22" color="#222" />
        </view>
      </view>
      <view class="st-center" @click="goStickyTarget" aria-label="打开品牌/作者">
        <text class="sticky-title">{{ stickyTitle }}</text>
      </view>
      <view class="st-right"></view>
    </view>

    <!-- 顶部渐变（整块点击回主页） -->
    <view class="header-gradient" @click="goHome" aria-label="回主页">
      <view class="nav-placeholder" :style="{ height: headerPadPx }" />
      <view class="tabs-underline" @click.stop>
        <view class="tab font-alimamashuhei" :class="{active: activeTab==='sale'}" @click.stop="switchTab('sale')">
          <text>贩售</text>
          <view class="underline" v-if="activeTab==='sale'"></view>
        </view>
        <view class="tab font-alimamashuhei" :class="{active: activeTab==='makeup'}" @click.stop="switchTab('makeup')">
          <text>约妆</text>
          <view class="underline" v-if="activeTab==='makeup'"></view>
        </view>
        <view class="tab font-alimamashuhei" :class="{active: activeTab==='hair'}" @click.stop="switchTab('hair')">
          <text>约毛</text>
          <view class="underline" v-if="activeTab==='hair'"></view>
        </view>
      </view>
    </view>

    <!-- 分类筛选（仅贩售） -->
    <view class="category-container" v-if="activeTab === 'sale'">
      <scroll-view scroll-x class="category-scroll" :show-scrollbar="false">
        <view
          class="category-item font-alimamashuhei"
          v-for="(item, index) in tabList"
          :key="index"
          :class="{ active: activeType === item }"
          @click="handleTabClick(item)"
        >{{ item }}</view>
      </scroll-view>
    </view>

    <!-- 尺寸筛选（仅贩售） -->
    <view class="size-container" v-if="activeTab === 'sale'">
      <scroll-view scroll-x class="size-scroll" :show-scrollbar="false">
        <view
          class="size-item font-alimamashuhei"
          v-for="(item, index) in sizeList"
          :key="index"
          :class="{ active: activeSize === item }"
          @click="handleSizeClick(item)"
        >{{ item }}</view>
      </scroll-view>
    </view>

    <view v-if="activeTab !== 'sale'" style="height: 50rpx; background:#f5f6f8;"></view>

    <!-- 日期选择 -->
    <view class="date-picker-container">
      <scroll-view
        class="date-scroll"
        scroll-x
        scroll-with-animation
        :scroll-left="dateScrollLeft"
        :show-scrollbar="false"
      >
        <view
          v-for="(item, date) in currentCalendar"
          :key="date"
          class="date-item"
          :class="{ 'selected-item': chooseDate === date }"
          :id="getDateAnchorId(date)"
          @click="selectDate(date)"
        >
          <view class="weekday font-alimamashuhei" :class="{'weekend': item.weekday==='周日'||item.weekday==='周六'}">{{ item.weekday }}</view>
          <view
            class="day-number font-title"
            :class="{
              'selected': chooseDate === date,
              'today-unselected': isToday(date) && chooseDate !== date
            }"
          >
            {{ isToday(date) ? '今天' : item.day_number }}
          </view>
          <view
            class="date-badge font-title"
            v-if="activeTab === 'sale' ? (item.goods_number > 0) : (item.plans_number > 0)"
          >
            {{ activeTab === 'sale' ? item.goods_number : item.plans_number }}
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 内容 -->
    <view class="goods-container">
      <!-- 贩售 -->
      <template v-if="activeTab === 'sale'">
        <view class="date-title font-alimamashuhei">
          <text class="highlight font-title">{{chooseDate}} 日</text>
          <text class="title-text"> 星期{{chooseItem.weekday}}上新</text>
        </view>

        <view v-if="chooseItem.goods == null" class="empty-tip">
          <image src="/static/empty-box.png" class="empty-icon"></image>
          <text>这天没有上新呢...</text>
        </view>

        <view v-else>
          <view
            v-for="good in chooseItem.goods"
            :key="good.id"
            class="goods-card"
            :data-brand-id="good.brand_id"
            :data-brand-name="good.brand_name"
            data-kind="sale"
            @click="jumpGoods(good.id, good.goods_id)"
          >
            <view class="goods-image-container">
              <image :src="good.goods_image" mode="aspectFill" class="goods-image"></image>
              <view class="goods-tags">
                <text class="tag sale-type">{{good.type}} · {{good.sale_type}}</text>
                <text class="tag first-day" v-if="good.is_first_sale_day == 1">首日</text>
              </view>
            </view>

            <view class="goods-info">
              <view>
                <text class="brand-name font-alimamashuhei">{{good.brand_name}}</text>
                <text class="goods-name font-alimamashuhei">{{good.goods_name}}</text>
              </view>

              <view class="goods-details">
                <view v-if="good.sizes && good.sizes.length">
                  <view v-for="(g, i) in getSizeGroups(good.sizes)" :key="i" class="size-group">
                    <text class="size-category">{{ g.category }}：</text>
                    <view class="size-values">
                      <text class="size-details">{{ g.previewText }}</text>
                      <text v-if="g.hiddenCount > 0" class="size-more font-title">... +{{ g.hiddenCount }}</text>
                    </view>
                  </view>
                </view>
                <text v-else>{{good.size}} · {{good.size_detail}}</text>
              </view>

              <view class="time-info">
                <text class="font-title">开售 {{ formatTimestamp(good.sub_time) }}</text>
                <text class="font-title" v-if="good.sub_time_end">截止 {{ formatTimestamp(good.sub_time_end)}}</text>
              </view>

              <view class="price-info">
                <view v-if="good.sale_type != '限量现货' && good.sale_type != '不限量现货'">
                  <view class="price-group">
                    <text class="price-label font-alimamashuhei">定金</text>
                    <text class="deposit-price font-title">{{good.sub_amount}}</text>
                    <text class="currency font-title">({{good.currency}})</text>
                  </view>
                  <view class="price-group">
                    <text class="price-label font-alimamashuhei">尾款</text>
                    <text class="final-price font-title">{{good.fin_amount}}</text>
                  </view>
                </view>
                <view v-else>
                  <view class="price-group">
                    <text class="price-label font-alimamashuhei">全款</text>
                    <text class="full-price font-title">{{good.sub_amount + good.fin_amount}}</text>
                    <text class="currency font-title">({{good.currency}})</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </template>

      <!-- 约妆 / 约毛 共用 -->
      <template v-else>
        <view class="date-title font-alimamashuhei">
          <text class="highlight font-title">{{chooseDate}} 日</text>
          <text class="title-text"> 星期{{chooseItem.weekday}}{{ planLabel }}</text>
        </view>

        <view v-if="chooseItem.plans == null || chooseItem.plans.length === 0" class="empty-tip">
          <image src="/static/empty-box.png" class="empty-icon"></image>
          <text>这天没有{{ planLabel }}计划呢...</text>
        </view>

        <view v-else>
          <view
            class="plan-card"
            v-for="plan in chooseItem.plans"
            :key="plan.id"
            :data-brand-id="(plan.artist_info && (plan.artist_info.brand_id || plan.artist_info.BrandId)) || plan.brand_id"
            :data-brand-name="plan.artist_name || (plan.artist_info && (plan.artist_info.BrandName || plan.artist_info.brand_name)) || ''"
            :data-kind="activeTab"
            @tap="navigateToArtistDetail(plan.artist_info)"
          >
            <view class="artist-header">
              <view class="artist-info">
                <image
                  v-if="plan.artist_info && (plan.artist_info.LogoImage || plan.artist_info.logo_image)"
                  :src="plan.artist_info.LogoImage || plan.artist_info.logo_image"
                  mode="aspectFill"
                  class="artist-avatar"
                />
                <view class="artist-details">
                  <text class="artist-name font-alimamashuhei">{{plan.artist_name}}</text>
                  <view class="makeup-price-range">
                    <text>{{ priceLabel }}: {{ getPriceRange(plan) }}</text>
                  </view>
                </view>
              </view>
            </view>

            <view class="artist-description" v-if="plan.artist_info && (plan.artist_info.Description || plan.artist_info.description)">
              {{plan.artist_info.Description || plan.artist_info.description}}
            </view>

            <view class="highlight-images" v-if="getPlanImages(plan).length">
              <scroll-view scroll-x class="image-scroll">
                <image
                  v-for="(img, i) in getPlanImages(plan)"
                  :key="i"
                  :src="img"
                  mode="aspectFill"
                  class="highlight-image"
                  @click.stop="previewImage(img)"
                />
              </scroll-view>
            </view>

            <view class="foldable-section" :class="{ expanded: expandStates[plan.id] }">
              <view class="plan-info">
                <view class="info-row">
                  <text class="label">开放时间:</text>
                  <text class="value">{{formatTimestamp(plan.open_time)}} - {{formatTimestamp(plan.close_time)}}</text>
                </view>
                <view class="info-row">
                  <text class="label">接单类型:</text>
                  <text class="value">{{getOrderTypeText(plan.order_type)}}</text>
                </view>
                <view class="info-row">
                  <text class="label">最大人数:</text>
                  <text class="value">{{plan.max_participants === 0 ? '不限量' : plan.max_participants}}</text>
                </view>
                <view class="info-row">
                  <text class="label">每人限投:</text>
                  <text class="value">{{plan.max_submissions_per_user}}次</text>
                </view>
              </view>

              <view class="plan-config">
                <view class="config-section">
                  <text class="section-title font-alimamashuhei">档位选择</text>
                  <view v-for="tier in getTiers(plan)" :key="tier.title" class="tier-item">
                    <text class="tier-title font-alimamashuhei">{{tier.title}}</text>
                    <text class="tier-price font-title">{{tier.price}}元</text>
                    <text class="tier-desc">{{tier.description}}</text>
                  </view>
                </view>

                <view class="config-section" v-if="getAddons(plan).length">
                  <text class="section-title font-alimamashuhei">加购服务</text>
                  <view v-for="addon in getAddons(plan)" :key="addon.title" class="addon-item">
                    <text class="addon-title font-alimamashuhei">{{addon.title}}</text>
                    <text class="addon-price font-title">{{addon.price}}元</text>
                    <text class="addon-desc">{{addon.description}}</text>
                  </view>
                </view>
              </view>
            </view>

            <view class="fold-toggle" @click.stop="toggleFold(plan.id)">
              <text>{{ expandStates[plan.id] ? '收起' : '展开' }}</text>
              <uni-icons :type="expandStates[plan.id] ? 'arrowup' : 'arrowdown'" size="16" color="#81D8cf"></uni-icons>
            </view>
          </view>
        </view>
      </template>
    </view>

    <loading-toast :show="loading" />
  </view>
</template>

<script setup>
import { ref, computed, watch, nextTick, getCurrentInstance, onMounted } from 'vue'
import { onLoad, onShow, onHide, onUnload, onPullDownRefresh, onPageScroll, onReady } from '@dcloudio/uni-app'
import { websiteUrl, getStatusBarHeight, getNavBarHeight, toPx } from '@/common/config.js'

/* ========== 基础状态 ========== */
const scrollTop = ref(0)
const safeTop = ref(0)
onPageScroll(e => { scrollTop.value = e?.scrollTop || 0; scheduleScrollSpy() })

const goBack = () => {
  try {
    const pages = getCurrentPages && getCurrentPages()
    if (pages && pages.length > 1) uni.navigateBack({ delta: 1 })
    else (uni.switchTab?.({ url: '/pages/index/index' }) || uni.reLaunch({ url: '/pages/index/index' }))
  } catch { uni.navigateBack({ delta: 1 }) }
}
function goHome () {
  uni.switchTab({ url: '/pages/index/index' })
}

/* 顶部占位高度 */
const navBarPx = toPx(getNavBarHeight())
const headerPadPx = computed(() => toPx(getStatusBarHeight() + getNavBarHeight()))

/* Tab（切换即拉取未拉过的数据） */
const activeTab = ref('sale')
const switchTab = async (t) => {
  if (activeTab.value === t) return
  activeTab.value = t
  console.log('【日历】切换Tab为：', t)
  if (t === 'makeup') {
    if (!Object.keys(makeupCalendar.value).length) await fetchMakeupCalendar()
  } else if (t === 'hair') {
    if (!Object.keys(hairCalendar.value).length) await fetchHairCalendar()
  } else {
    if (!Object.keys(saleCalendar.value).length) await fetchSaleCalendar()
  }
  updateSelectedItem()
  resetStickySoon()
}

/* 贩售筛选 */
const tabList = ref(['全部','整体','单头','单体','娃衣','眼珠','娃鞋','手型','脚型','袜子','配饰'])
const sizeList = ref(['全部尺寸','四分','六分','三分','其它大尺寸','八分','十二分','一分','二分','五分','棉花娃','眼珠'])
let activeType = ref('全部')
let activeSize = ref('全部尺寸')

/* 日历数据 */
const saleCalendar = ref({})
const makeupCalendar = ref({})
const hairCalendar = ref({})
const expandStates = ref({})

const toggleFold = async (id)=>{
  expandStates.value[id] = !expandStates.value[id]
  await nextTick()
  resetStickySoon()
  setTimeout(resetStickySoon, 360)
  setTimeout(resetStickySoon, 720)
}

/* 图片工具 */
const getHighlightImages = (s)=> (!s ? [] : s.split(',').map(i=>i.trim()).filter(Boolean))

/* 约妆/约毛：根据当前Tab返回要展示的图片数组（合并后的字段已由后端处理） */
function getPlanImages(plan){
  const info = plan?.artist_info || {}
  if (activeTab.value === 'hair') {
    const hairStr = info.hairstylist_highlight_images || info.HairstylistHighlightImages
    const fallback = info.artist_highlight_images || info.ArtistHighlightImages
    const imgs = getHighlightImages(hairStr || fallback)
    return imgs
  }
  // makeup
  const makeupStr = info.artist_highlight_images || info.ArtistHighlightImages
  return getHighlightImages(makeupStr)
}

const previewImage = (url)=> uni.previewImage({ urls:[url], current:url })

/* 今日（每次进入或刷新重算） */
const todayFormat = ref('')
function computeTodayFormat(){
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth()+1).padStart(2,'0')
  const day = String(d.getDate()).padStart(2,'0')
  return `${y}-${m}-${day}`
}

let chooseDate = ref('')
let chooseItem = ref({})
let loading = ref(true)
const dateScrollLeft = ref(0)
const targetDateOnEnter = ref('')
const DATE_ITEM_STEP_RPX = 152
const DATE_SCROLL_LEFT_PADDING_RPX = 14
const hasTriggeredInitialSelect = ref(false)
const measuredDateStepPx = ref(0)
// 自动滚动开关：设为 false 可关闭“进入页面自动滚到选中日期（第二位）”
const AUTO_SCROLL_ENABLED = true

function normalizeDateString(input) {
  const raw = String(input || '').trim()
  if (!raw) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw
  if (/^\d{8}$/.test(raw)) return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`
  return ''
}

function getDateAnchorId(date) {
  return `calendar-date-${String(date || '').replace(/-/g, '')}`
}

const calendarDates = computed(() => Object.keys(currentCalendar.value || {}))
function getDateStepPx() {
  if (measuredDateStepPx.value > 0) return measuredDateStepPx.value
  try {
    return uni.upx2px ? uni.upx2px(DATE_ITEM_STEP_RPX) : 76
  } catch {
    return 76
  }
}
function measureDateStepPx() {
  return new Promise((resolve) => {
    if (!selectorCtx.value) return resolve()
    try {
      uni.createSelectorQuery()
        .in(selectorCtx.value)
        .selectAll('.date-item')
        .boundingClientRect((nodes) => {
          const list = Array.isArray(nodes) ? nodes : []
          if (list.length >= 2) {
            const step = Math.round(Math.abs((list[1]?.left || 0) - (list[0]?.left || 0)))
            if (step > 0) measuredDateStepPx.value = step
          } else if (list.length === 1 && list[0]?.width) {
            measuredDateStepPx.value = Math.round(list[0].width)
          }
          console.log('[calendar-debug] measureDateStepPx', {
            measured: measuredDateStepPx.value,
            fallback: uni.upx2px ? uni.upx2px(DATE_ITEM_STEP_RPX) : 76
          })
          resolve()
        })
        .exec()
    } catch {
      resolve()
    }
  })
}
function applyDateScrollLeft(targetLeft) {
  const nextLeft = Math.max(0, Math.round(targetLeft))
  if (dateScrollLeft.value === nextLeft) {
    dateScrollLeft.value = Math.max(0, nextLeft - 1)
    nextTick(() => {
      dateScrollLeft.value = nextLeft
    })
    return
  }
  dateScrollLeft.value = nextLeft
}
function syncDateScrollPosition() {
  if (!AUTO_SCROLL_ENABLED) return
  const date = chooseDate.value
  if (!date) {
    console.log('[calendar-debug] syncDateScrollPosition skip: empty chooseDate')
    return
  }
  const idx = calendarDates.value.indexOf(date)
  if (idx < 0) {
    console.log('[calendar-debug] syncDateScrollPosition miss date in calendarDates', {
      chooseDate: date,
      targetDateOnEnter: targetDateOnEnter.value,
      today: todayFormat.value,
      calendarDatesLen: calendarDates.value.length,
      calendarDatesHead: calendarDates.value.slice(0, 8)
    })
    dateScrollLeft.value = 0
    return
  }
  const targetIdx = Math.max(idx - 1, 0)
  const stepPx = getDateStepPx()
  const leftPaddingPx = uni.upx2px ? uni.upx2px(DATE_SCROLL_LEFT_PADDING_RPX) : 7
  applyDateScrollLeft(Math.max(0, targetIdx * stepPx - leftPaddingPx))
  console.log('[calendar-debug] syncDateScrollPosition applied', {
    chooseDate: date,
    idx,
    targetIdx,
    stepPx,
    leftPaddingPx,
    scrollLeft: dateScrollLeft.value
  })
}

function normalizeDateKey(raw) {
  return String(raw || '').replace(/[^0-9]/g, '')
}

function resolveDateFromCalendar(targetDate) {
  const keys = calendarDates.value || []
  if (!keys.length) return ''

  if (keys.includes(targetDate)) return targetDate

  const targetNorm = normalizeDateKey(targetDate)
  if (targetNorm) {
    const hit = keys.find(k => normalizeDateKey(k) === targetNorm)
    if (hit) return hit

    // 兜底：后端若仅返回 MMDD（或其它简写），按末 4 位匹配
    if (targetNorm.length >= 4) {
      const targetMMDD = targetNorm.slice(-4)
      const hitByMMDD = keys.find(k => normalizeDateKey(k).slice(-4) === targetMMDD)
      if (hitByMMDD) return hitByMMDD
    }
  }

  const todayNorm = normalizeDateKey(todayFormat.value)
  if (todayNorm) {
    const todayHit = keys.find(k => normalizeDateKey(k) === todayNorm)
    if (todayHit) return todayHit

    if (todayNorm.length >= 4) {
      const todayMMDD = todayNorm.slice(-4)
      const todayHitByMMDD = keys.find(k => normalizeDateKey(k).slice(-4) === todayMMDD)
      if (todayHitByMMDD) return todayHitByMMDD
    }
  }

  return keys[0]
}

function triggerInitialSelectDateOnce() {
  if (hasTriggeredInitialSelect.value) return false
  const resolvedDate = resolveDateFromCalendar(chooseDate.value || targetDateOnEnter.value || todayFormat.value)
  if (!resolvedDate) {
    console.log('[calendar-debug] triggerInitialSelectDateOnce skip: resolvedDate empty', {
      chooseDate: chooseDate.value,
      targetDateOnEnter: targetDateOnEnter.value,
      today: todayFormat.value,
      calendarDatesLen: calendarDates.value.length
    })
    return false
  }
  chooseDate.value = resolvedDate
  hasTriggeredInitialSelect.value = true
  console.log('[calendar-debug] triggerInitialSelectDateOnce fire', {
    resolvedDate,
    calendarDatesLen: calendarDates.value.length
  })
  selectDate(resolvedDate)
  // 强制二次对齐，确保首次进入也触发滚动定位
  nextTick(() => {
    syncDateScrollPosition()
    setTimeout(() => syncDateScrollPosition(), 60)
    setTimeout(() => syncDateScrollPosition(), 180)
  })
  return true
}

/* 过滤后的当月（贩售） */
const filteredSaleCalendar = computed(()=>{
  const out = {}
  Object.entries(saleCalendar.value).forEach(([date, info])=>{
    const c = { ...info }
    if (c.goods){
      c.goods = c.goods.filter(g=>{
        const typeOk = activeType.value==='全部' || g.type===activeType.value
        let sizeOk = (activeSize.value==='全部尺寸')
        if (!sizeOk && g.sizes && g.sizes.length) sizeOk = g.sizes.some(s=>s.goods_size===activeSize.value)
        else if (!sizeOk) sizeOk = g.size===activeSize.value
        return typeOk && sizeOk
      })
      c.goods_number = c.goods.length
      if (!c.goods.length) c.goods = null
    }
    out[date] = c
  })
  return out
})
const currentCalendar = computed(()=>{
  if (activeTab.value === 'sale') return filteredSaleCalendar.value
  if (activeTab.value === 'makeup') return makeupCalendar.value
  return hairCalendar.value
})

/* 选日 */
const selectDate = (d) => {
  chooseDate.value = d
  updateSelectedItem()
  syncDateScrollPosition()
  resetStickySoon()
}

/* 同步 chooseItem */
watch([activeType, activeSize], () => { if (activeTab.value === 'sale') updateSelectedItem() })
watch(() => filteredSaleCalendar.value, () => { if (activeTab.value === 'sale') updateSelectedItem() })
watch(() => makeupCalendar.value, () => { if (activeTab.value === 'makeup') updateSelectedItem() })
watch(() => hairCalendar.value, () => { if (activeTab.value === 'hair') updateSelectedItem() })
watch(() => chooseDate.value, () => {
  syncDateScrollPosition()
})
watch(() => calendarDates.value.join(','), () => {
  if (!hasTriggeredInitialSelect.value && calendarDates.value.length) {
    console.log('[calendar-debug] calendarDates changed -> force initial select', {
      calendarDatesLen: calendarDates.value.length
    })
    triggerInitialSelectDateOnce()
  }
  syncDateScrollPosition()
})

/* 请求（含中文日志） */
const fetchSaleCalendar = () => new Promise(resolve => {
  loading.value = true
  console.log('【日历】开始请求贩售日历')
  uni.request({
    url: websiteUrl.value + '/goods-news',
    method: 'GET',
    timeout: 5000,
    success: (res)=>{
      saleCalendar.value = res.data?.data || {}
      console.log('【日历】贩售日历成功，天数=', Object.keys(saleCalendar.value).length)
    },
    fail: ()=> uni.showToast({ title:'网络请求失败', icon:'none' }),
    complete: async ()=>{
      loading.value = false
      if (!chooseDate.value) chooseDate.value = todayFormat.value
      updateSelectedItem()
      await nextTick()
      syncDateScrollPosition()
      resetStickySoon()
      resolve()
    }
  })
})

/* 约妆（type=1） */
const fetchMakeupCalendar = () => new Promise(resolve => {
  loading.value = true
  console.log('【日历】开始请求约妆日历')
  uni.request({
    url: websiteUrl.value + '/bjd-makeup-news?type=1',
    method: 'GET',
    timeout: 5000,
    success: (res)=>{
      makeupCalendar.value = res.data?.data || {}
      console.log('【日历】约妆日历成功，天数=', Object.keys(makeupCalendar.value).length)
    },
    fail: ()=> uni.showToast({ title:'网络请求失败', icon:'none' }),
    complete: async ()=>{
      loading.value = false
      if (!chooseDate.value) chooseDate.value = todayFormat.value
      updateSelectedItem()
      await nextTick()
      syncDateScrollPosition()
      resetStickySoon()
      resolve()
    }
  })
})

/* 约毛（type=2） */
const fetchHairCalendar = () => new Promise(resolve => {
  loading.value = true
  console.log('【日历】开始请求约毛日历')
  uni.request({
    url: websiteUrl.value + '/bjd-makeup-news?type=2',
    method: 'GET',
    timeout: 5000,
    success: (res)=>{
      hairCalendar.value = res.data?.data || {}
      console.log('【日历】约毛日历成功，天数=', Object.keys(hairCalendar.value).length)
    },
    fail: ()=> uni.showToast({ title:'网络请求失败', icon:'none' }),
    complete: async ()=>{
      loading.value = false
      if (!chooseDate.value) chooseDate.value = todayFormat.value
      updateSelectedItem()
      await nextTick()
      syncDateScrollPosition()
      resetStickySoon()
      resolve()
    }
  })
})

/* 工具 */
const handleTabClick = t => { activeType.value = t }
const handleSizeClick = s => { activeSize.value = s }
const isToday = d => d === todayFormat.value
function updateSelectedItem(){
  const cal = currentCalendar.value
  const d = chooseDate.value
  const goodsLen = cal[d]?.goods?.length || 0
  const plansLen = cal[d]?.plans?.length || 0
  console.log('【日历】更新选中项：tab=', activeTab.value, ' 日期=', d, ' goods#=', goodsLen, ' plans#=', plansLen)

  if (cal[d]){ chooseItem.value = cal[d]; return }
  if (d) {
    chooseItem.value = activeTab.value === 'sale' ? { goods: null } : { plans: null }
    return
  }
  const first = Object.entries(cal).find(([_,v])=> (activeTab.value==='sale'&&v.goods) || ((activeTab.value!=='sale')&&v.plans))
  if (first){ chooseDate.value = first[0]; chooseItem.value = first[1] }
  else { chooseItem.value = activeTab.value==='sale' ? {goods:null} : {plans:null} }
}
function formatTimestamp(ts){
  const d = new Date(ts*1000)
  const M = String(d.getMonth()+1).padStart(2,'0')
  const D = String(d.getDate()).padStart(2,'0')
  const h = String(d.getHours()).padStart(2,'0')
  const m = String(d.getMinutes()).padStart(2,'0')
  return `${M}/${D} ${h}:${m}`
}
function getTiers(plan){ try{ return JSON.parse(plan.order_config).tiers || [] }catch{ return [] } }
function getAddons(plan){ try{ return JSON.parse(plan.order_config).addons || [] }catch{ return [] } }
function getOrderTypeText(status) {
  const map = { 0:'未知',1:'长期接单',2:'限时手速投递',3:'限时抽选投递',4:'限时黑箱卡投递',9:'关闭投递' }
  return map[Number(status)] ?? '未知'
}
function getSizeGroups(sizes){
  if (!sizes || !sizes.length) return []
  const g = {}
  sizes.forEach(it=>{ const k = it.goods_size; if(!g[k]) g[k]=[]; if(it.size_detail) g[k].push(it.size_detail) })
  return Object.keys(g).map(k => {
    const details = Array.from(new Set((g[k] || []).filter(Boolean)))
    const previewDetails = details.slice(0, 2)
    return {
      category: k,
      details,
      previewText: previewDetails.join('、'),
      hiddenCount: Math.max(details.length - 2, 0)
    }
  })
}
function getPriceRange(plan){
  const tiers = getTiers(plan) || []
  const ps = tiers.map(t=>parseFloat(t.price)).filter(n=>!isNaN(n))
  if (!ps.length) return '待定'
  const min = Math.min(...ps), max = Math.max(...ps)
  return min===max ? `${min}元` : `${min}-${max}元`
}
function jumpGoods(id, goodsId){
  uni.request({ url: websiteUrl.value + '/sale-record-click?id=' + id, method:'POST', header:{'Content-Type':'application/json'} })
  uni.navigateTo({ url: '/pages/goods/goods?goods_id=' + goodsId })
}
const navigateToArtistDetail = (artist)=> {
  const brandId = artist?.brand_id || artist?.BrandId || 0
  if (!brandId) return
  
  if (activeTab.value==='makeup') {
	  uni.navigateTo({
	    url: "/pkg-creator/creator_base/bjd_faceup_artist/bjd_faceup_artist?brand_id=" + artist.brand_id
	  });
  } else {
	    uni.navigateTo({ url: '/pkg-creator/creator_base/hair_artist/hair_artist?brand_id=' + brandId })
  }
  

}

/* ========== 吸顶标题（动态：贩售/约妆/约毛） ========== */
const stickyTitle = ref('')
const stickyTarget = ref({ kind: 'sale', id: 0 }) // 'sale' | 'makeup' | 'hair'
const stickyShowThreshold = 80
const showStickyTitle = computed(() => scrollTop.value > stickyShowThreshold && !!stickyTitle.value)
const labelMap = { sale:'贩售', makeup:'约妆', hair:'约毛' }
const planLabel = computed(()=> activeTab.value === 'hair' ? '约毛' : '约妆')
const priceLabel = computed(()=> activeTab.value === 'hair' ? '毛费' : '妆费')

/* 绑定当前页面上下文 */
const selectorCtx = ref(null)
onMounted(() => {
  selectorCtx.value = getCurrentInstance()?.proxy || null
  console.log('【日历】mounted：查询上下文可用=', !!selectorCtx.value)
})
onReady(() => {
  if (!selectorCtx.value) selectorCtx.value = getCurrentInstance()?.proxy || null
  console.log('【日历】ready：查询上下文（兜底）可用=', !!selectorCtx.value)
})

function computeStickyFromViewport () {
  const selector = (activeTab.value === 'sale') ? '.goods-card' : '.plan-card'
  const topGuard = (safeTop.value || 0) + parseInt(navBarPx) + 8

  if (!selectorCtx.value) return

  try {
    uni.createSelectorQuery()
      .in(selectorCtx.value)
      .selectAll(selector)
      .fields({ rect: true, dataset: true }, (nodes) => {
        const rects = Array.isArray(nodes) ? nodes : []
        if (!rects.length) { stickyTitle.value = ''; return }

        // 选出最靠近topGuard的卡片
        let idx = -1
        let minTop = Number.POSITIVE_INFINITY
        rects.forEach((r, i) => { const t = r.top; if (t >= topGuard && t < minTop) { minTop = t; idx = i } })
        if (idx < 0) rects.forEach((r, i) => { const t = r.top; if (t <= topGuard && (topGuard - t) < minTop) { minTop = (topGuard - t); idx = i } })
        if (idx < 0) { stickyTitle.value = ''; return }

        const node = rects[idx]
        const kind = node.dataset?.kind || activeTab.value
        const bid  = Number(node.dataset?.brandId || 0)
        const bname = node.dataset?.brandName || ''

        stickyTarget.value = { kind, id: bid }
        stickyTitle.value = `${labelMap[kind] || '贩售'} · ${bname || ''}`
      })
      .exec()
  } catch (e) {
    console.warn('【日历】计算吸顶异常：', e)
  }
}

/* 跳转吸顶目标 */
let jumping = false
async function goStickyTarget () {
  if (jumping) return
  jumping = true

  const selector = (activeTab.value === 'sale') ? '.goods-card' : '.plan-card'
  const topGuard = (safeTop.value || 0) + parseInt(navBarPx) + 8

  const resolved = await new Promise((resolve) => {
    try {
      uni.createSelectorQuery()
        .in(selectorCtx.value)
        .selectAll(selector)
        .fields({ rect: true, dataset: true }, (nodes) => {
          const rects = Array.isArray(nodes) ? nodes : []
          let idx = -1; let minTop = Number.POSITIVE_INFINITY
          rects.forEach((r, i) => { const t = r.top; if (t >= topGuard && t < minTop) { minTop = t; idx = i } })
          if (idx < 0) rects.forEach((r, i) => { const t = r.top; if (t <= topGuard && (topGuard - t) < minTop) { minTop = (topGuard - t); idx = i } })
          if (idx < 0) return resolve(null)
          const n = rects[idx]
          resolve({ kind: n.dataset?.kind || activeTab.value, id: Number(n.dataset?.brandId || 0) })
        })
        .exec()
    } catch { resolve(null) }
  })

  const kind = resolved?.kind || stickyTarget.value.kind
  const id   = Number(resolved?.id || stickyTarget.value.id || 0)

  if (!id) { uni.showToast({ title:'未获取到品牌ID', icon:'none' }); jumping = false; return }

  // 清计时器
  if (spyTimer) { clearTimeout(spyTimer); spyTimer = null }

  // 约妆 & 约毛都跳作者详情
  if (kind === 'makeup') {
    uni.navigateTo({ url: `/pkg-creator/creator_base/bjd_faceup_artist/bjd_faceup_artist?brand_id=${id}` })
  } else if (kind === 'hair') {
	  uni.navigateTo({ url: `/pkg-creator/creator_base/hair_artist/hair_artist?brand_id=${id}` })
  } else {
    uni.navigateTo({ url: `/pages/brand/brand?brand_id=${id}` })
  }

  setTimeout(()=> jumping = false, 500)
}

/* 节流与重算 */
let spyTimer = null
function scheduleScrollSpy() {
  if (spyTimer) return
  spyTimer = setTimeout(() => { spyTimer = null; computeStickyFromViewport() }, 120)
}
function resetStickySoon() {
  setTimeout(() => computeStickyFromViewport(), 0)
  setTimeout(() => computeStickyFromViewport(), 200)
  setTimeout(() => computeStickyFromViewport(), 600)
}

/* 统一刷新（进入页面 & 下拉刷新） */
async function refreshAll () {
  console.log('【日历】开始刷新全量数据，tab=', activeTab.value)
  todayFormat.value = computeTodayFormat()
  if (!chooseDate.value) chooseDate.value = targetDateOnEnter.value || todayFormat.value

  if (activeTab.value === 'makeup')      await fetchMakeupCalendar()
  else if (activeTab.value === 'hair')   await fetchHairCalendar()
  else                                    await fetchSaleCalendar()

  await nextTick()
  await measureDateStepPx()
  console.log('[calendar-debug] refreshAll after data ready', {
    chooseDate: chooseDate.value,
    targetDateOnEnter: targetDateOnEnter.value,
    today: todayFormat.value,
    calendarDatesLen: calendarDates.value.length
  })
  triggerInitialSelectDateOnce()
  syncDateScrollPosition()
  resetStickySoon()
}

/* 生命周期 */
onLoad((options = {})=>{
  try{
    const wi = uni.getWindowInfo && uni.getWindowInfo()
    safeTop.value = wi?.safeAreaInsets?.top ?? wi?.statusBarHeight ?? 0
  }catch{ safeTop.value = 20 }

  const tab = String(options.tab || '').toLowerCase()
  activeTab.value = (tab === 'makeup' || tab === 'sale' || tab === 'hair') ? tab : 'sale'

  todayFormat.value = computeTodayFormat()
  const inputDate = normalizeDateString(options.date || options.choose_date || options.target_date)
  targetDateOnEnter.value = inputDate || todayFormat.value
  chooseDate.value = targetDateOnEnter.value
})

onShow(async ()=>{
  hasTriggeredInitialSelect.value = false
  dateScrollLeft.value = 0
  console.log('[calendar-debug] onShow reset initial flag', {
    chooseDate: chooseDate.value,
    targetDateOnEnter: targetDateOnEnter.value
  })
  if (spyTimer) { clearTimeout(spyTimer); spyTimer = null }
  await refreshAll()
})

onHide(()=>{ if (spyTimer) { clearTimeout(spyTimer); spyTimer = null } })
onUnload(()=>{ if (spyTimer) { clearTimeout(spyTimer); spyTimer = null } })

onPullDownRefresh(async ()=>{
  try { await refreshAll() } finally { uni.stopPullDownRefresh() }
})

watch(() => chooseItem.value, () => { resetStickySoon() }, { deep: true })
</script>

<style lang="less" scoped>
/* 页面背景淡灰 */
.summary-wrap{
  padding-bottom: 40rpx;
  background:#f5f6f8;
}

/* ====== 吸顶标题栏 ====== */
.sticky-titlebar{
  position: fixed; top: 0; left: 0; right: 0; z-index: 9999;
  backdrop-filter: blur(6px);
  border-bottom: none;
  display: grid;
  grid-template-columns: 120rpx 1fr 120rpx;
  align-items: end;
}
.st-left, .st-right{ display:flex; align-items:center; justify-content:center; padding: 0 12rpx 10rpx; }
.st-center{ display:flex; align-items:flex-end; justify-content:center; padding-bottom: 10rpx; }
.sticky-title{
  color: #222;
  font-size: 22rpx;
  font-weight: 400;
  letter-spacing: .3rpx;
  max-width: 70vw;
  overflow:hidden; white-space:nowrap; text-overflow:ellipsis;
  background: rgba(169,231,255,.96); padding: 4rpx 8rpx; border-radius: 5rpx;
}

/* 返回小胶囊 */
.nav-back-pill{
  height: 56rpx; padding: 0 18rpx; border-radius: 33rpx;
  background: rgba(255,255,255,.85);
  border: 2rpx solid rgba(0,0,0,.08);
  display: flex; align-items: center; justify-content: center;position: relative;top:10rpx;
}

/* 顶部渐变头 */
.header-gradient{
  padding: calc(var(--safe-top, 0px) + 16px) 28rpx 12rpx;
  background: linear-gradient(180deg,#b9e3ff 0%, #d1ecff 38%, #e8eef4 72%, #f5f6f8 100%);
  border-bottom-left-radius: 40rpx; border-bottom-right-radius: 40rpx;
  box-shadow: 0 12rpx 28rpx rgba(123, 186, 224, .2);
}

/* 下划线Tab */
.tabs-underline{ display:flex; gap: 40rpx; }
.tab{ position:relative; padding: 8rpx 6rpx 18rpx; font-size:34rpx; font-weight:800; letter-spacing:.5rpx; color:#8a8f9a; }
.tab.active{ color:#333; }
.underline{ position:absolute; left:0; right:0; bottom:0; height: 6rpx; border-radius: 6rpx; background:#77b8de; box-shadow: 0 2rpx 6rpx rgba(119,184,222,.45); }

/* 分类/尺寸（仅贩售） */
.category-container{ padding:20rpx 20rpx 0; background:#f5f6f8; }
.category-scroll{ white-space:nowrap; height:100rpx; }
.category-item{
  display:inline-flex; align-items:center; justify-content:center;
  font-size:28rpx; margin:0 15rpx; padding:10rpx 25rpx; border-radius:50rpx;
  background: rgba(255,255,255,.9); transition:.2s; box-shadow:0 4rpx 10rpx rgba(0,0,0,.05);
  color:#666; font-weight:500; position:relative; top:10rpx;
}
.category-item.active{ background:#7dc3d3; color:#fff; font-weight:700; box-shadow:0 4rpx 10rpx rgba(125,195,211,.4); transform: translateY(-4rpx); }

.size-container{ padding:0 20rpx 10rpx; background:#f5f6f8; }
.size-scroll{ white-space:nowrap; height:80rpx; }
.size-item{
  display:inline-flex; align-items:center; justify-content:center;
  font-size:26rpx; margin:0 12rpx; padding:8rpx 20rpx; border-radius:50rpx;
  background: rgba(255,255,255,.9); transition:.2s; box-shadow:0 4rpx 8rpx rgba(0,0,0,.05);
  color:#666; font-weight:500;
}
.size-item.active{ background:#ff9ab2; color:#fff; font-weight:700; box-shadow:0 4rpx 10rpx rgba(255,154,178,.4); }

/* 日期选择卡片 */
.date-picker-container{
  margin: 6rpx 20rpx 10rpx 0;
  padding: 0;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  position: relative;
  z-index: 20;
  overflow: visible;
}
.date-scroll{
  white-space: nowrap;
  display: block;
  padding: 6rpx 14rpx 0;
  overflow: visible;
}
.date-item{
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 140rpx;
  min-height: 168rpx;
  padding: 24rpx 0 10rpx;
  position: relative;
  z-index: 1;
  box-sizing: border-box;
  vertical-align: top;
  flex: 0 0 140rpx;
  flex-shrink: 0;
  margin-right: 12rpx;
}
.date-item.selected-item{
  z-index: 6;
}
.date-item.selected-item::before{
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  width: 132rpx;
  height: 162rpx;
  background: #fff;
  border-radius: 72rpx 72rpx 0 0;
}
.date-item.selected-item::after{
  content: '';
  position: absolute;
  left: 50%;
  bottom: -12rpx;
  transform: translateX(-50%);
  width: 132rpx;
  height: 36rpx;
  background: #fff;
  border-radius: 0;
}
.date-item.selected-item .weekday,
.date-item.selected-item .day-number{
  position: relative;
  z-index: 2;
}
.date-badge{
  position: absolute;
  left: 50%;
  bottom: 18rpx;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f39cb4;
  color: #fff;
  border-radius: 999rpx;
  min-width: 34rpx;
  padding: 0 8rpx;
  height: 34rpx;
  line-height: 34rpx;
  font-size: 20rpx;
  text-align: center;
  font-weight: 700;
  z-index: 3;
}
.weekday{
  font-size: 24rpx;
  color: #7a8cae;
  margin-bottom: 8rpx;
  font-weight: 500;
  line-height: 1;
}
.weekday.weekend{
  color: #9aa9c4;
  font-weight: 600;
}
.day-number{
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  width: 110rpx;
  height: 52rpx;
  border-radius: 24rpx;
  font-size: 28rpx;
  color: #31456a;
  background: transparent;
  transition: .2s ease;
  font-weight: 600;
  letter-spacing: 0;
  line-height: 1;
  white-space: nowrap;
}
.day-number.selected{
  color: #22385f;
  font-weight: 700;
  transform: none;
  box-shadow: none;
}
.day-number.today-unselected{
  color: #2f4c7f;
  font-size: 30rpx;
  background: transparent;
}
.day-number.today-unselected::before{
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: #d8ecff;
  z-index: -1;
}
.date-item.selected-item .weekday{
  color: #5a6f94;
  margin-top: 0;
}

/* 主体/卡片 */
.goods-container{
  margin: -8rpx 20rpx 24rpx;
  padding: 30rpx 24rpx 24rpx;
  background: #fff;
  border-radius: 52rpx;
  box-shadow: 0 12rpx 24rpx rgba(84, 111, 162, .08);
  min-height: 70vh;
  position: relative;
  bottom: 2rpx;
}
.date-title{ font-size:32rpx; color:#555; margin-bottom:30rpx; padding-left:15rpx; }
.date-title .highlight{ color:#7dc3d3; font-weight:700; margin-right:10rpx; }
.date-title .title-text{ color:#2e3340; font-weight:700; }

.empty-tip{ display:flex; flex-direction:column; align-items:center; justify-content:center; padding:80rpx 0; color:#999; font-size:32rpx; }
.empty-tip .empty-icon{ width:180rpx; height:180rpx; margin-bottom:30rpx; opacity:.6; }

.goods-card{ display:flex; background:#fff; border-radius:24rpx; overflow:hidden; margin-bottom:30rpx;  transition: transform .2s ease, box-shadow .2s ease; }
.goods-card:active{ transform:scale(.98); box-shadow:0 6rpx 18rpx rgba(0,0,0,0.06); }
.goods-image-container{ position:relative; width:260rpx; flex-shrink:0; }
.goods-image{ width:100%; height:10.625rem; display:block; overflow:hidden; border-radius:10px; margin:20rpx 10rpx; }
.goods-tags{ position:absolute; top:35rpx; left:10rpx; display:flex; flex-direction:column; align-items:flex-start; }
.tag{ font-size:24rpx; padding:6rpx 18rpx; border-radius:0 10rpx 10rpx 0; margin-bottom:10rpx; color:#fff; font-weight:500; }
.sale-type{ background: linear-gradient(90deg, rgba(52,68,160,.8), rgba(52,68,160,.6)); }
.first-day{ background: linear-gradient(90deg, rgba(0,0,0,.7), rgba(0,0,0,.5)); }

.goods-info{ flex:1; padding:25rpx 25rpx 25rpx 40rpx; display:flex; flex-direction:column; }
.brand-name{ font-size:22rpx; color:#fff; font-weight:700; margin-bottom:8rpx; display:inline-block; background:#7dc3d3; padding:5rpx 10rpx; border-radius:10rpx; margin-right:15rpx; }
.goods-name{ font-size:26rpx; color:#38374c; font-weight:700; margin-bottom:8rpx; display:inline-block; }

.goods-details{ margin-bottom:20rpx; display:flex; flex-wrap:wrap; align-items:center; }
.size-group{
  display: block;
  margin-right: 10rpx;
  margin-bottom: 10rpx;
  white-space: normal;
}
.size-category{
  display: block;
  font-weight:700;
  color:#555;
  margin-bottom: 4rpx;
}
.size-values{
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  column-gap: 8rpx;
  row-gap: 4rpx;
  padding-left: 12rpx;
}
.size-details{
  color:#777;
  max-width: 100%;
  white-space: normal;
  overflow: visible;
  text-overflow: unset;
  line-height: 1.35;
}
.size-more{
  color: #7f8ba4;
  font-size: 22rpx;
  flex-shrink: 0;
  line-height: 1.35;
}

.time-info{
  background:#f8f9ff;
  border-radius:12rpx;
  padding:18rpx 18rpx;
  color:#666;
  margin-top: 0;
  margin-bottom: 30rpx;
}
.time-info text{ display:block; font-size:22rpx; margin-bottom:14rpx; position:relative; padding-left:16rpx; line-height: 1.45; }
.time-info text:last-child{ margin-bottom: 0; }
.time-info text::before{ content:''; position:absolute; left:0; top:50%; transform:translateY(-50%); width:10rpx; height:10rpx; background:#7dc3d3; border-radius:50%; }

.price-info{ margin-top:auto; display:flex; gap:25rpx; }
.price-group{ display:flex; align-items:baseline; flex-wrap:wrap; }
.price-label{ font-size:26rpx; color:#ff9ab2; margin-right:8rpx; white-space:nowrap; }
.deposit-price{ font-size:36rpx; color:#ff6b9c; font-weight:700; margin-right:6rpx; }
.final-price{ font-size:32rpx; color:#ff6b9c; font-weight:700; }
.full-price{ font-size:36rpx; color:#ff6b9c; font-weight:700; margin:0 5rpx; }
.currency{ font-size:24rpx; color:#999; transform: translateY(-2rpx); }

/* 约妆/约毛卡片 */
.plan-card{ background:#fff; border-radius:24rpx; padding:30rpx; margin-bottom:30rpx; box-shadow:0 8rpx 25rpx rgba(125,195,211,.15); position:relative; }
.artist-header{ display:flex; justify-content:space-between; align-items:center; margin-bottom:20rpx; }
.artist-info{ display:flex; align-items:center; }
.artist-avatar{ width:100rpx; height:100rpx; border-radius:50%; margin-right:20rpx; border:2rpx solid #e6f7ff; }
.artist-details{ display:flex; flex-direction:column; }
.artist-name{ font-size:28rpx; font-weight:700; color:#333; margin-bottom:5rpx; padding-left:8rpx; }
.makeup-price-range{ font-weight:700; background: linear-gradient(135deg, #97e7f7, #d5acd6); padding:4rpx 12rpx; border-radius:20rpx; align-self:flex-start; }
.makeup-price-range text{ font-size:24rpx; color:#fff; }

.artist-description{ font-size:26rpx; color:#666; line-height:1.6; margin-bottom:20rpx; padding:15rpx; background:#f8f9ff; border-radius:12rpx; }
.highlight-images{ margin:20rpx 0; padding:10rpx 0; overflow:hidden; }
.image-scroll{ white-space:nowrap; }
.highlight-image{ display:inline-block; width:240rpx; height:300rpx; border-radius:12rpx; margin-right:15rpx; background:#f5f9ff; box-shadow:0 4rpx 10rpx rgba(0,0,0,.05); transition: transform .2s; }
.highlight-image:active{ transform:scale(.95); }
.highlight-image:last-child{ margin-right:0; }

/* 折叠区 */
.foldable-section{ max-height:0; overflow:hidden; transition:max-height .5s, opacity .3s; opacity:0; }
.foldable-section.expanded{ max-height:1500rpx; opacity:1; }
.fold-toggle{ display:flex; align-items:center; justify-content:center; padding:20rpx 0; color:#81D8cf; font-size:26rpx; font-weight:500; margin-top:10rpx; }
.fold-toggle text{ margin-right:10rpx; }

/* 约妆/约毛 信息块 */
.plan-info{ background:#f0f9ff; border-radius:12rpx; padding:20rpx; margin-bottom:20rpx; }
.plan-info .info-row{ display:flex; margin-bottom:15rpx; font-size:26rpx; }
.plan-info .info-row:last-child{ margin-bottom:0; }
.plan-info .label{ color:#5da8c0; font-weight:700; width:140rpx; }
.plan-info .value{ color:#333; flex:1; }

/* 配置清单 */
.config-section{ margin-bottom:25rpx; }
.config-section .section-title{ display:block; font-size:26rpx; font-weight:700; color:#5da8c0; margin-bottom:15rpx; padding-bottom:8rpx; border-bottom:1rpx solid #e6f7ff; }
.tier-item,.addon-item{ display:flex; align-items:center; padding:12rpx 0; border-bottom:1rpx dashed #e6f7ff; }
.tier-item:last-child,.addon-item:last-child{ border-bottom:none; }
.tier-title,.addon-title{ font-size:26rpx; color:#333; width:140rpx; font-weight:500; }
.tier-price,.addon-price{ font-size:26rpx; color:#5da8c0; font-weight:700; width:120rpx; text-align:right; }
.tier-desc,.addon-desc{ font-size:24rpx; color:#888; flex:1; margin-left:20rpx; }

/* 隐藏滚动条 */
::-webkit-scrollbar{ width:0!important; height:0!important; background:transparent!important; display:none!important; }
</style>
