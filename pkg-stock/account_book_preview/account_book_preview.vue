<template>
	<view-logs />
  <!-- 透明固定自定义导航 -->
  <zhouWei-navBar
    type="transparentFixed"
    :backState="2000"
    :homeState="2000"
    fontColor="#000"
    transparentFixedFontColor="#000"
    :scrollTop="scrollTop"
  >
    <!-- 不透明层（下滑后出现）左侧按钮 -->
    <template #left>
      <view class="nav-back-pill" @click="goBack" aria-label="返回">
        <uni-icons type="left" size="22" color="#000"></uni-icons>
      </view>
    </template>
    <!-- 透明层（页面顶部时显示）左侧按钮 -->
    <template #transparentFixedLeft>
      <view class="nav-back-pill" @click="goBack" aria-label="返回">
        <uni-icons type="left" size="22" color="#000"></uni-icons>
      </view>
    </template>
  </zhouWei-navBar>

  <!-- 如需整体下移避免被覆盖，可打开这一行（见 script 注释） -->
  <!-- <view class="nav-spacer" :style="{ height: headerPadPx }" /> -->

  <view v-if="loadingSuccess" class="detail-container">
    <!-- 头图区域 -->
    <view class="header-image-container">
      <swiper
        class="swiper"
        :autoplay="true"
        :interval="3000"
        :circular="true"
        indicator-dots
        :style="{ height: swiperHeight + 'px' }"
      >
        <swiper-item v-for="(img, index) in imageList" :key="index">
          <view class="image-container">
            <image
              :src="img"
              mode="widthFix"
              class="header-image"
              @load="handleImageLoad($event, index)"
            />
          </view>
        </swiper-item>
      </swiper>
      <view class="image-overlay"></view>
    </view>

    <!-- 标题区域 -->
    <view class="title-container">
      <text class="title font-alimamashuhei">{{ detail.name }}</text>
      <view class="tag-row">
        <view class="category-tag font-title">{{ detail.type }}</view>
        <!-- 付款状态标签（新增） -->
        <view class="pay-badge font-title" :class="payClass">{{ payLabel }}</view>
      </view>
    </view>

    <!-- 信息列表 -->
    <view class="info-section">
      <view class="section-title">
        <text class="section-zh font-alimamashuhei">详细信息</text>
        <text class="section-en font-title">Details</text>
      </view>

      <view class="info-container">
        <view class="info-line" v-if="detail.count">
          <view class="info-label">
            <text class="label-zh font-alimamashuhei">数量</text>
            <text class="label-en font-title">Qty</text>
          </view>
          <view class="info-value">{{ detail.count }}</view>
        </view>

        <view class="info-line" v-if="detail.price || detail.final_price > 0">
          <view class="info-label">
            <text class="label-zh font-alimamashuhei">价格</text>
            <text class="label-en font-title">Price</text>
          </view>
          <view class="info-value price-value-line">
            <template v-if="detail.final_price > 0">
              <text class="price-prefix">总价</text>
              <text class="price-currency font-title">¥</text>
              <text class="price-number font-title">{{ detail.price || 0 }}</text>
              <text class="price-unit">元</text>
            </template>
            <template v-else>
              <text class="price-currency font-title">¥</text>
              <text class="price-number font-title">{{ detail.price || 0 }}</text>
              <text class="price-unit">元</text>
            </template>
          </view>
        </view>

        <view class="info-line" v-if="detail.final_price > 0">
          <view class="info-label">
            <text class="label-zh font-alimamashuhei">尾款金额</text>
            <text class="label-en font-title">Balance</text>
          </view>
          <view class="info-value price-value-line">
            <text class="price-currency font-title">¥</text>
            <text class="price-number font-title">{{ detail.final_price || 0 }}</text>
            <text class="price-unit">元</text>
            <text v-if="detail.final_time" class="time-tag">（{{ detail.final_time }}）</text>
          </view>
        </view>

        <view class="info-line" v-if="detail.shop_name">
          <view class="info-label">
            <text class="label-zh font-alimamashuhei">店铺</text>
            <text class="label-en font-title">Shop</text>
          </view>
          <view class="info-value">{{ detail.shop_name }}</view>
        </view>

        <view class="info-line" v-if="detail.size || detail.size_detail">
          <view class="info-label">
            <text class="label-zh font-alimamashuhei">尺寸</text>
            <text class="label-en font-title">Size</text>
          </view>
          <view class="info-value">{{ detail.size }} {{ detail.size_detail }}</view>
        </view>

        <view class="info-line" v-if="detail.head_circumference">
          <view class="info-label">
            <text class="label-zh font-alimamashuhei">头围</text>
            <text class="label-en font-title">Head</text>
          </view>
          <view class="info-value">{{ detail.head_circumference }}</view>
        </view>

        <view class="info-line" v-if="detail.shoulder_width">
          <view class="info-label">
            <text class="label-zh font-alimamashuhei">肩宽</text>
            <text class="label-en font-title">Shoulder</text>
          </view>
          <view class="info-value">{{ detail.shoulder_width }}</view>
        </view>

        <view class="info-line" v-if="detail.makeup_artist">
          <view class="info-label">
            <text class="label-zh font-alimamashuhei">妆师</text>
            <text class="label-en font-title">Artist</text>
          </view>
          <view class="info-value">{{ detail.makeup_artist }}</view>
        </view>

        <view class="info-line" v-if="detail.color">
          <view class="info-label">
            <text class="label-zh font-alimamashuhei">颜色</text>
            <text class="label-en font-title">Color</text>
          </view>
          <view class="info-value">
            {{ detail.color }}
            <view class="color-preview" :style="{ backgroundColor: detail.color }"></view>
          </view>
        </view>
      </view>
    </view>

    <!-- 时间信息 -->
    <view class="info-section" v-if="detail.buy_date || detail.arrival_date">
      <view class="section-title">
        <text class="section-zh font-alimamashuhei">时间信息</text>
        <text class="section-en font-title">Timeline</text>
      </view>

      <view class="info-container">
        <view class="info-line" v-if="detail.buy_date">
          <view class="info-label">
            <text class="label-zh font-alimamashuhei">购入时间</text>
            <text class="label-en font-title">Bought</text>
          </view>
          <view class="info-value">{{ detail.buy_date }}</view>
        </view>

        <view class="info-line" v-if="detail.arrival_date">
          <view class="info-label">
            <text class="label-zh font-alimamashuhei">到家日期</text>
            <text class="label-en font-title">Arrival</text>
          </view>
          <view class="info-value">{{ detail.arrival_date }}</view>
        </view>
      </view>
    </view>

    <!-- 位置信息 -->
    <view class="info-section" v-if="detail.position">
      <view class="section-title">
        <text class="section-zh font-alimamashuhei">位置信息</text>
        <text class="section-en font-title">Location</text>
      </view>

      <view class="info-container">
        <view class="info-line">
          <view class="info-label">
            <text class="label-zh font-alimamashuhei">存放位置</text>
            <text class="label-en font-title">Storage</text>
          </view>
          <view class="info-value">{{ detail.position }}</view>
        </view>
      </view>
    </view>

    <!-- 附加信息 -->
    <view class="info-section" v-if="detail.additional_value || detail.remark">
      <view class="section-title">
        <text class="section-zh font-alimamashuhei">附加信息</text>
        <text class="section-en font-title">Extras</text>
      </view>

      <view class="info-container">
        <view class="info-line" v-if="detail.additional_value">
          <view class="info-label">
            <text class="label-zh font-alimamashuhei">附加值</text>
            <text class="label-en font-title">Extra</text>
          </view>
          <view class="info-value">{{ detail.additional_value }}</view>
        </view>

        <view class="info-line" v-if="detail.remark">
          <view class="info-label">
            <text class="label-zh font-alimamashuhei">备注</text>
            <text class="label-en font-title">Notes</text>
          </view>
          <view class="info-value">{{ detail.remark }}</view>
        </view>
      </view>
    </view>
  </view>

  <!-- 编辑按钮 -->
  <view class="edit-button-container" @click="navigateToEdit">
    <view class="edit-button">
      <uni-icons type="compose" size="22" color="#fff"></uni-icons>
    </view>
  </view>

  <loading-toast :show="!loadingSuccess"></loading-toast>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow, onPageScroll } from '@dcloudio/uni-app'
import {
  websiteUrl,
  asyncGetUserInfo,
  // 如要启用“占位条”，解开以下三个工具并见下方 headerPadPx
  // getStatusBarHeight, getNavBarHeight, toPx
} from '@/common/config.js'

const props = defineProps(['account_book_id'])

/* ===== 透明导航：滚动联动 & 返回 ===== */
const scrollTop = ref(0)
onPageScroll(e => { scrollTop.value = e?.scrollTop || 0 })

function goBack() {
  const pages = getCurrentPages?.() || []
  if (pages.length > 1) uni.navigateBack({ delta: 1 })
  else uni.switchTab({ url: '/pages/index/index' })
}
// 如需让内容整体下移避免被覆盖，取消注释：
// const headerPadPx = toPx(getStatusBarHeight() + getNavBarHeight())

/* ===== 原有逻辑保持不变 ===== */
const loadingSuccess = ref(false)
const detail = ref({})
const swiperHeight = ref(500)
const imageHeights = ref([])
const screenWidth = ref(0)

const STORAGE_KEY = `account_book_heights_${props.account_book_id}`

const handleImageLoad = (event, index) => {
  if (!screenWidth.value) return
  const { width: originWidth, height: originHeight } = event.detail
  const renderHeight = (originHeight / originWidth) * screenWidth.value
  imageHeights.value[index] = renderHeight
  const currentHeights = imageHeights.value.filter(h => h)
  if (currentHeights.length > 0) {
    const maxHeight = Math.max(...currentHeights)
    if (maxHeight > swiperHeight.value) {
      swiperHeight.value = maxHeight
      uni.setStorageSync(STORAGE_KEY, { heights: imageHeights.value, screenWidth: screenWidth.value })
    }
  }
}

const imageList = computed(() => {
  if (!detail.value.image_url) return []
  return detail.value.image_url.split(',').map(u => u.trim())
})

const fetchDetail = async (id) => {
  const token = uni.getStorageSync('token')
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/account-book-detail?id=${id}`,
      method: 'GET',
      header: { Authorization: token }
    })
    if (res.data.status === 'success') {
      detail.value = res.data.data
      setTimeout(() => {
        loadingSuccess.value = true
        uni.setNavigationBarTitle({ title: detail.value.name || '账本详情' })
      }, 600)
    } else {
      uni.showToast({ title: res.data.msg || '获取详情失败', icon: 'none' })
    }
  } catch (e) {
    uni.showToast({ title: '网络请求失败', icon: 'none' })
  }
}

const navigateToEdit = () => {
  uni.navigateTo({ url: `/pkg-stock/stock/account_book_form/account_book_form?account_book_id=${props.account_book_id}` })
}

onShow(() => {
  const systemInfo = uni.getSystemInfoSync()
  const currentScreenWidth = systemInfo.windowWidth
  screenWidth.value = currentScreenWidth

  const storedData = uni.getStorageSync(STORAGE_KEY)

  swiperHeight.value = 300
  imageHeights.value = []

  if (storedData) {
    const isScreenSizeChanged = storedData.screenWidth !== currentScreenWidth
    if (!isScreenSizeChanged && storedData.heights.length > 0) {
      imageHeights.value = storedData.heights
      const maxStoredHeight = Math.max(...storedData.heights.filter(h => h))
      swiperHeight.value = Math.max(maxStoredHeight, 300)
    }
  }

  asyncGetUserInfo().then(() => fetchDetail(props.account_book_id))
})

/* ===== 付款状态：显示标签（新增） ===== */
const payLabel = computed(() => {
  const v = detail.value?.payment_status
  if (v === 2) return '已付定金'
  if (v === 3) return '未购买'
  return '已全款' // 默认
})
const payClass = computed(() => {
  const v = detail.value?.payment_status
  if (v === 2) return 'is-deposit'
  if (v === 3) return 'is-unbought'
  return 'is-full'
})

</script>

<style lang="less">
@mist-blue-strong: #5d7998;
@mist-blue: #6c89a7;
@mist-blue-soft: #e9eff6;
@mist-bg-top: #f6f9fc;
@mist-bg: #ffffff;
@text-main: #243248;
@text-sub: #6b7c92;
@text-body: #2c3b4f;
@line-soft: #e9eef4;
@line-lighter: #eff3f8;
@price-soft: #b16f7f;

.detail-container {
  padding-bottom: 56rpx;
  background: linear-gradient(180deg, @mist-bg-top 0%, #f8fbff 28%, @mist-bg 64%);
  min-height: 100vh;
}

/* 顶部返回胶囊（两层导航都复用） */
.nav-back-pill {
  margin-left: 15rpx;
  width: 66rpx;
  height: 66rpx;
  border-radius: 33rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.78);
  border: 1rpx solid rgba(255, 255, 255, 0.88);
  box-shadow: 0 6rpx 18rpx rgba(70, 93, 121, 0.14);
  backdrop-filter: blur(6px);
}
.nav-spacer {
  width: 100%;
} /* 如启用占位条 */

/* 头部图片样式 */
.header-image-container {
  position: relative;
  width: 100%;
  margin: 0;
  overflow: hidden;
  border-radius: 0;
  box-shadow: 0 12rpx 30rpx rgba(77, 98, 124, 0.12);
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 130rpx;
  background: linear-gradient(to top, rgba(246, 249, 252, 0.94), transparent);
}

/* 标题区域 */
.title-container {
  margin: -74rpx 26rpx 4rpx;
  padding: 28rpx 24rpx 24rpx;
  position: relative;
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
  border: 1rpx solid rgba(255, 255, 255, 0.95);
  border-radius: 28rpx;
  box-shadow: 0 8rpx 26rpx rgba(70, 93, 121, 0.1);
  backdrop-filter: blur(12px);
}

.title {
  display: block;
  margin-bottom: 16rpx;
  color: @text-main;
  font-size: 42rpx;
  line-height: 1.24;
  letter-spacing: 0.8rpx;
  text-shadow: 0 2rpx 5rpx rgba(36, 50, 72, 0.06);
}

.tag-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14rpx;
  flex-wrap: wrap;
}

.category-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46rpx;
  padding: 8rpx 24rpx;
  border-radius: 999rpx;
  border: 1rpx solid #d6e3f1;
  background: @mist-blue-soft;
  color: @mist-blue-strong;
  font-size: 22rpx;
  letter-spacing: 0.5rpx;
}

/* 付款状态标签（新增） */
.pay-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46rpx;
  padding: 8rpx 24rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  letter-spacing: 0.4rpx;
  box-shadow: 0 3rpx 10rpx rgba(43, 63, 86, 0.08);
}

.pay-badge.is-full {
  background: #eef5f1;
  color: #5d7c67;
  border: 1rpx solid #d6e4dc;
}

.pay-badge.is-deposit {
  background: #f7f3ea;
  color: #8a7758;
  border: 1rpx solid #eadfcf;
}

.pay-badge.is-unbought {
  background: #f6eef1;
  color: #8e6772;
  border: 1rpx solid #ead8de;
}

/* 分区 */
.info-section {
  margin: 22rpx 20rpx 0;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 6rpx 18rpx rgba(77, 98, 124, 0.08);
}

.section-title {
  padding: 22rpx 24rpx;
  font-size: 30rpx;
  font-weight: 700;
  color: @text-main;
  display: flex;
  align-items: baseline;
  gap: 10rpx;
  background: linear-gradient(180deg, #f7fbff 0%, #f5f9fd 100%);
  border-bottom: 1rpx solid @line-soft;
}

.section-zh {
  font-size: 30rpx;
  letter-spacing: 0.5rpx;
}

.section-en {
  font-size: 20rpx;
  color: #9aaabc;
  letter-spacing: 0.6rpx;
}

.info-container {
  padding: 6rpx 24rpx 8rpx;
  background: #fff;
}

.info-line {
  display: flex;
  align-items: flex-start;
  padding: 24rpx 0;
  border-bottom: 1rpx solid @line-lighter;
  transition: 0.2s;
  &:last-child {
    border-bottom: none;
  }
  &:active {
    background: #f8fbff;
  }
}

.info-label {
  width: 214rpx;
  padding-top: 2rpx;
  display: flex;
  align-items: baseline;
  gap: 8rpx;
  color: @text-sub;
  font-size: 26rpx;
  font-weight: 500;
  line-height: 1.4;
}

.label-zh {
  font-size: 26rpx;
  color: @text-sub;
  line-height: 1.32;
  letter-spacing: 0.2rpx;
}

.label-en {
  font-size: 20rpx;
  color: #a1b0c1;
  line-height: 1;
  letter-spacing: 0.5rpx;
}

.info-value {
  flex: 1;
  min-width: 0;
  font-size: 29rpx;
  line-height: 1.5;
  color: @text-body;
  font-weight: 500;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  word-break: break-all;
}

.price-value-line {
  align-items: baseline;
  gap: 6rpx;
}

.price-prefix {
  font-size: 23rpx;
  color: @text-sub;
  margin-right: 2rpx;
}

.price-currency {
  font-size: 22rpx;
  color: @price-soft;
}

.price-number {
  font-size: 42rpx;
  line-height: 1;
  color: @price-soft;
}

.price-unit {
  font-size: 23rpx;
  color: @price-soft;
}

.highlight {
  color: @price-soft;
  font-weight: bold;
}

.time-tag {
  margin-left: 12rpx;
  background: @mist-blue-soft;
  color: @mist-blue-strong;
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
}

.color-preview {
  width: 32rpx;
  height: 32rpx;
  border-radius: 8rpx;
  margin-left: 12rpx;
  border: 1rpx solid #d9e2ec;
}

/* 编辑按钮 */
.edit-button-container {
  position: fixed;
  right: 28rpx;
  bottom: calc(84rpx + constant(safe-area-inset-bottom));
  bottom: calc(84rpx + env(safe-area-inset-bottom));
  z-index: 100;
}

.edit-button {
  width: 96rpx;
  height: 96rpx;
  border-radius: 48rpx;
  background: linear-gradient(135deg, #91adca, #b9c9d8);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 18rpx rgba(84, 108, 132, 0.28);
  transition: 0.3s;
  &:active {
    transform: scale(0.95);
    box-shadow: 0 3rpx 10rpx rgba(84, 108, 132, 0.22);
  }
}

.swiper {
  width: 100%;
}

.image-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.header-image {
  width: 100%;
  max-height: 100%;
  display: block;
}

:deep(.uni-swiper-dots-horizontal) {
  bottom: 14rpx;
}

:deep(.uni-swiper-dot) {
  width: 14rpx;
  height: 14rpx;
  margin: 0 5rpx !important;
  border-radius: 999rpx;
  background: rgba(149, 167, 190, 0.45);
}

:deep(.uni-swiper-dot-active) {
  width: 28rpx;
  background: @mist-blue;
}
</style>
