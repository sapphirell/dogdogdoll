<template>
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
      <text class="title">{{ detail.name }}</text>
      <view class="category-tag">{{ detail.type }}</view>
    </view>

    <!-- 信息列表 -->
    <view class="info-section">
      <view class="section-title">
        <uni-icons type="list" size="16" color="#5db7ff"></uni-icons>
        <text>详细信息</text>
      </view>

      <view class="info-container">
        <view class="info-line" v-if="detail.count">
          <view class="info-label">
            <uni-icons type="number" size="14" color="#5db7ff"></uni-icons>
            <text>数量</text>
          </view>
          <view class="info-value">{{ detail.count }}</view>
        </view>

        <view class="info-line" v-if="detail.price || detail.final_price > 0">
          <view class="info-label">
            <uni-icons type="money" size="14" color="#5db7ff"></uni-icons>
            <text>价格</text>
          </view>
          <view class="info-value">
            <text v-if="detail.final_price > 0" class="highlight">总价: {{ detail.price }}元</text>
            <text v-else>{{ detail.price }}元</text>
          </view>
        </view>

        <view class="info-line" v-if="detail.final_price > 0">
          <view class="info-label">
            <uni-icons type="money" size="14" color="#5db7ff"></uni-icons>
            <text>尾款金额</text>
          </view>
          <view class="info-value">
            <text class="highlight">{{ detail.final_price }}元</text>
            <text v-if="detail.final_time" class="time-tag">（{{ detail.final_time }}）</text>
          </view>
        </view>

        <view class="info-line" v-if="detail.shop_name">
          <view class="info-label">
            <uni-icons type="shop" size="14" color="#5db7ff"></uni-icons>
            <text>店铺</text>
          </view>
          <view class="info-value">{{ detail.shop_name }}</view>
        </view>

        <view class="info-line" v-if="detail.size || detail.size_detail">
          <view class="info-label">
            <uni-icons type="compose" size="14" color="#5db7ff"></uni-icons>
            <text>尺寸</text>
          </view>
          <view class="info-value">{{ detail.size }} {{ detail.size_detail }}</view>
        </view>

        <view class="info-line" v-if="detail.head_circumference">
          <view class="info-label">
            <uni-icons type="circle" size="14" color="#5db7ff"></uni-icons>
            <text>头围</text>
          </view>
          <view class="info-value">{{ detail.head_circumference }}</view>
        </view>

        <view class="info-line" v-if="detail.shoulder_width">
          <view class="info-label">
            <uni-icons type="arrowright" size="14" color="#5db7ff"></uni-icons>
            <text>肩宽</text>
          </view>
          <view class="info-value">{{ detail.shoulder_width }}</view>
        </view>

        <view class="info-line" v-if="detail.makeup_artist">
          <view class="info-label">
            <uni-icons type="person" size="14" color="#5db7ff"></uni-icons>
            <text>妆师</text>
          </view>
          <view class="info-value">{{ detail.makeup_artist }}</view>
        </view>

        <view class="info-line" v-if="detail.color">
          <view class="info-label">
            <uni-icons type="color" size="14" color="#5db7ff"></uni-icons>
            <text>颜色</text>
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
        <uni-icons type="calendar" size="16" color="#5db7ff"></uni-icons>
        <text>时间信息</text>
      </view>

      <view class="info-container">
        <view class="info-line" v-if="detail.buy_date">
          <view class="info-label">
            <uni-icons type="cart" size="14" color="#5db7ff"></uni-icons>
            <text>购入时间</text>
          </view>
          <view class="info-value">{{ detail.buy_date }}</view>
        </view>

        <view class="info-line" v-if="detail.arrival_date">
          <view class="info-label">
            <uni-icons type="home" size="14" color="#5db7ff"></uni-icons>
            <text>到家日期</text>
          </view>
          <view class="info-value">{{ detail.arrival_date }}</view>
        </view>
      </view>
    </view>

    <!-- 位置信息 -->
    <view class="info-section" v-if="detail.position">
      <view class="section-title">
        <uni-icons type="location" size="16" color="#5db7ff"></uni-icons>
        <text>位置信息</text>
      </view>

      <view class="info-container">
        <view class="info-line">
          <view class="info-label">
            <uni-icons type="map" size="14" color="#5db7ff"></uni-icons>
            <text>存放位置</text>
          </view>
          <view class="info-value">{{ detail.position }}</view>
        </view>
      </view>
    </view>

    <!-- 附加信息 -->
    <view class="info-section" v-if="detail.additional_value || detail.remark">
      <view class="section-title">
        <uni-icons type="info" size="16" color="#5db7ff"></uni-icons>
        <text>附加信息</text>
      </view>

      <view class="info-container">
        <view class="info-line" v-if="detail.additional_value">
          <view class="info-label">
            <uni-icons type="plus" size="14" color="#5db7ff"></uni-icons>
            <text>附加值</text>
          </view>
          <view class="info-value">{{ detail.additional_value }}</view>
        </view>

        <view class="info-line" v-if="detail.remark">
          <view class="info-label">
            <uni-icons type="chat" size="14" color="#5db7ff"></uni-icons>
            <text>备注</text>
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
  uni.navigateTo({ url: `/pages/stock/account_book_form/account_book_form?account_book_id=${props.account_book_id}` })
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
</script>

<style lang="less">
.detail-container {
  padding-bottom: 40rpx;
  background: linear-gradient(to bottom, #f0f4ff, #ffffff 20%);
  min-height: 100vh;
}

/* 顶部返回胶囊（两层导航都复用） */
.nav-back-pill{
  margin-left: 15rpx;
}
.nav-spacer{ width:100%; } /* 如启用占位条 */

/* 头部图片样式 */
.header-image-container{ position: relative; width:100%; overflow:hidden; box-shadow:0 10rpx 30rpx rgba(93,120,255,.15); }
.header-image{ width:100%; height:100%; display:block; }
.image-overlay{ position:absolute; bottom:0; left:0; right:0; height:120rpx; background:linear-gradient(to top, rgba(240,244,255,.9), transparent); }

/* 标题区域 */
.title-container{ padding:30rpx; position:relative; text-align:center; margin-top:-60rpx; }
.title{ font-size:40rpx; font-weight:bold; color:#1a1a1a; display:block; margin-bottom:15rpx; text-shadow:0 2rpx 4rpx rgba(0,0,0,.05); }
.category-tag{ display:inline-block; padding:6rpx 24rpx; background:#eef2ff; color:#5db7ff; border-radius:50rpx; font-size:24rpx; font-weight:500; }

/* 分区 */
.section-title{ padding:20rpx 30rpx; font-size:30rpx; font-weight:bold; color:#333; display:flex; align-items:center; background:#f8faff; border-bottom:1rpx solid #e8ecff; margin-top:20rpx;
  text{ margin-left:10rpx; } }

.info-container{ padding:0 30rpx; background:#fff; border-radius:20rpx; margin:0 20rpx; box-shadow:0 4rpx 20rpx rgba(93,120,255,.08); }
.info-line{ display:flex; align-items:center; padding:28rpx 0; border-bottom:1rpx solid #f5f7ff; transition:.2s;
  &:last-child{ border-bottom:none; }
  &:active{ background:#f9faff; } }
.info-label{ width:180rpx; display:flex; align-items:center; color:#666; font-size:28rpx; font-weight:500; text{ margin-left:10rpx; } }
.info-value{ flex:1; font-size:28rpx; color:#333; font-weight:500; display:flex; align-items:center; }

.highlight{ color:#ff6b6b; font-weight:bold; }
.time-tag{ background:#f0f4ff; color:#5db7ff; padding:4rpx 12rpx; border-radius:8rpx; font-size:24rpx; margin-left:10rpx; }
.color-preview{ width:30rpx; height:30rpx; border-radius:6rpx; margin-right:12rpx; border:1rpx solid #eee; }

/* 编辑按钮 */
.edit-button-container{ position:fixed; right:30rpx; bottom:80rpx; z-index:100; }
.edit-button{ width:100rpx; height:100rpx; border-radius:50%; background:linear-gradient(135deg,#97e7f7,#d5acd6);
  display:flex; align-items:center; justify-content:center; box-shadow:0 6rpx 20rpx rgba(45,140,240,.4); transition:.3s;
  &:active{ transform:scale(.95); box-shadow:0 3rpx 10rpx rgba(45,140,240,.3); } }

.swiper{ width:100%; }
.image-container{ align-items:center; justify-content:center; height:100%; width:100%; overflow:hidden; }
.header-image{ width:100%; max-height:100%; display:block; }
</style>
