<template>
  <meta name="theme-color" content="#e0f3ff"></meta>
  <view-logs />

  <view head_color="url('/static/bg/bg2.jpg')">
    <view class="my-center-page" style="position: relative;">
      
      <view class="star-bg-layer">
        <view 
          v-for="(star, index) in stars" 
          :key="index"
          class="star-item"
          :style="{
            left: star.left,
            top: star.top,
            fontSize: star.size,
            animationDuration: star.duration,
            animationDelay: star.delay,
            opacity: star.opacity,
            '--fall-dist': star.fallDist /* 传入 CSS 变量控制下落距离 */
          }"
        >
          ★
        </view>
      </view>

      <view v-if="isLogin" class="login-wrap">
        <view class="headbg">
          <view class="header-placeholders"></view>

          <view class="profile-header">
            <view class="avatar-circle" @click="jumpToCroper">
              <image
                class="avatar-img"
                mode="aspectFill"
                :src="global.userInfo.avatar || defaultAvatar"
              />
            </view>
            <text class="profile-name font-alimama" @click="jumpToSetName">
              {{ global.userInfo.username || '未设置昵称' }}
            </text>
            <text class="profile-id">
              <text class="font-alimama id-label">ID</text>
              <text class="font-title">
                {{ global.userInfo.id || '-' }}
              </text>
            </text>
          </view>

          <view class="main-tabs">
            <view
              v-for="tab in mainTabs"
              :key="tab.key"
              class="main-tab"
              :class="{ 'main-tab-active': activeMainTab === tab.key }"
              @click="changeMainTab(tab.key)"
            >
              <text class="main-tab-text font-alimama">
                {{ tab.label }}
              </text>
              <view
                v-if="activeMainTab === tab.key"
                class="main-tab-underline"
              ></view>
            </view>
          </view>
        </view>

        <orders-panel v-if="activeMainTab === 'orders'" :active="activeMainTab === 'orders'" />
        <info-hub-panel v-else-if="activeMainTab === 'inbox'" :active="activeMainTab === 'inbox'" />
        <mine-workspace-panel v-else-if="activeMainTab === 'workspace'" />
        <mine-settings-panel v-else-if="activeMainTab === 'settings'" @action="handleSettingsAction" />
      </view>

      <view v-else class="login-wrap unlogin-wrap">
        <view class="header-placeholders"></view>
        <login-panel @success="handleLoginSuccess" />
      </view>
    </view>
    
    <im-fab></im-fab>
  </view>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import {
  websiteUrl,
  global,
  asyncGetUserInfo,
  getUserInfo
} from '@/common/config.js'

const defaultAvatar = 'https://images1.fantuanpu.com/home/jpt.gif'

// --- 星星背景逻辑 ---
const stars = ref([])

onMounted(() => {
  generateStars()
})

function generateStars() {
  // 1. 数量增加：从 35 改为 50 (增加了约 1/3)
  const count = 50 
  const tempStars = []
  
  for (let i = 0; i < count; i++) {
    const duration = 15 + Math.random() * 15 // 保持 15-30秒的慢速旋转
    const delay = Math.random() * 10 
    
    // 2. 随机下落距离：500px - 800px
    const dist = Math.floor(Math.random() * 301 + 500)

    tempStars.push({
      left: Math.random() * 100 + '%', 
      top: (Math.random() * 100) + '%', 
      size: (20 + Math.random() * 30) + 'rpx', 
      duration: duration + 's',
      delay: '-' + delay + 's', 
      opacity: 0.2 + Math.random() * 0.4,
      fallDist: dist + 'px' // 将随机生成的距离存入变量
    })
  }
  stars.value = tempStars
}
// ----------------

const mainTabs = [
  { key: 'inbox', label: '信息集' },
  { key: 'orders', label: '订单集' },
  { key: 'workspace', label: '工作台' },
  { key: 'settings', label: '设置我' }
]
const activeMainTab = ref('inbox')

const isLogin = computed(() => !!global.isLogin)
const systemInfo = uni.getSystemInfoSync()
const navBarHeight = computed(() => {
  // #ifdef MP-WEIXIN
  const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
  const statusBarHeight = systemInfo.statusBarHeight || 32
  return menuButtonInfo.bottom + menuButtonInfo.top - 2 * statusBarHeight
  // #endif
  return 0
})
const headerHeight = computed(() => {
  // #ifdef MP-WEIXIN
  return navBarHeight.value + 'px'
  // #endif
  // #ifdef H5 || APP-PLUS
  const statusBarHeight = systemInfo.statusBarHeight || 0
  return `${statusBarHeight}px`
  // #endif
  return '0px'
})

watch(() => global.isLogin, newVal => {
  if (newVal) {
    uni.showTabBar({ animation: false })
  } else {
    uni.hideTabBar({ animation: false })
  }
})

function changeMainTab (key) { activeMainTab.value = key }

// 图片选择与上传逻辑
function chooseImage () {
  return new Promise((resolve, reject) => {
    uni.chooseImage({
      count: 1,
      success: res => resolve(res.tempFilePaths[0]),
      fail: err => reject(err)
    })
  })
}

function jumpToCroper () {
  chooseImage().then(src => {
    uni.navigateTo({
      url: `/pages/pop_croper/pop_croper?src=${decodeURIComponent(src)}`
    })
  }).catch(() => {})
}

function selectAvatar (croperPath) {
  const token = uni.getStorageSync('token')
  uni.request({
    url: websiteUrl.value + '/with-state/qiniu-token',
    method: 'POST',
    header: { Authorization: token },
    success: res => {
      if (!res.data.data || !res.data.data.token) {
        uni.showToast({ title: '获取上传凭证失败', icon: 'none' })
        return
      }
      const { token: qnToken, path: fileName } = res.data.data
      uni.uploadFile({
        url: 'https://up-cn-east-2.qiniup.com',
        name: 'file',
        method: 'POST',
        filePath: croperPath,
        fileType: 'image',
        formData: {
          token: qnToken,
          key: fileName,
          scope: 'hobby-box:' + fileName
        },
        success: () => {
          updateUserInfo('avatar', 'https://images1.fantuanpu.com/' + fileName)
        },
        fail: () => { uni.showToast({ title: '上传失败', icon: 'none' }) }
      })
    },
    fail: () => { uni.showToast({ title: '获取凭证失败', icon: 'none' }) }
  })
}

function updateUserInfo (key, value) {
  const token = uni.getStorageSync('token')
  uni.request({
    url: websiteUrl.value + '/with-state/update-profile',
    method: 'POST',
    header: { Authorization: token },
    data: { [key]: value },
    success: () => { getUserInfo() },
    fail: () => { uni.showToast({ title: '更新失败', icon: 'none' }) }
  })
}

function jumpSetting () { uni.navigateTo({ url: '/pages/setting/setting' }) }
function jumpToSetName () { uni.navigateTo({ url: '/pages/setting/username/username' }) }
function handleSettingsAction (type) {
  if (type === 'profile') jumpSetting()
  else if (type === 'address') uni.navigateTo({ url: '/pkg-common/address/address-list' })
}
function handleLoginSuccess () { asyncGetUserInfo() }

onShow(async () => {
  const user = await asyncGetUserInfo()
  if (global.isLogin) uni.showTabBar({ animation: false })
  else uni.hideTabBar({ animation: false })

  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  if (currentPage.returnParam) {
    selectAvatar(currentPage.returnParam)
    currentPage.returnParam = ''
  }
})
</script>

<style lang="scss" scoped>
/* --- 星星样式优化 --- */
.star-bg-layer {
  position: absolute; 
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 99; 
  pointer-events: none; 
  overflow: hidden;
}

.star-item {
  position: absolute;
  color: #d1d5db; 
  line-height: 1;
  animation-name: fall-rotate;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  
  /* 定义 CSS 变量默认值，防止 JS 未加载时出错 */
  --fall-dist: 300px;
}

@keyframes fall-rotate {
  0% {
    transform: translateY(-20px) rotate(0deg);
  }
  100% {
    /* 使用 var(--fall-dist) 读取 JS 传入的随机距离 (300-600px) */
    transform: translateY(var(--fall-dist)) rotate(360deg);
  }
}

/* --- 页面其他样式 --- */
.my-center-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  position: relative; 
}

.login-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

.unlogin-wrap {
  background: linear-gradient(135deg, #e0f3ff 0%, #fff9fb 100%);
}

.headbg {
  background: url('/static/blue2yellow.png');
  background-size: contain;
}

.font-alimama, .font-alimamashuhei {
  font-family: 'alimamamshuhei' !important;
}

.header-placeholders { height: v-bind(headerHeight); }

.profile-header {
  padding-top: 60rpx;
  padding-bottom: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-circle {
  width: 180rpx;
  height: 180rpx;
  border-radius: 50%;
  background: #f5f6fa;
  box-shadow: 0 0 20rpx rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-img { width: 100%; height: 100%; }

.profile-name {
  margin-top: 24rpx;
  font-size: 32rpx;
  font-weight: 700;
  color: #222222;
}

.profile-id {
  margin-top: 12rpx;
  font-size: 22rpx;
  color: #888888;
}

.id-label {
  color: #ffffff;
  background: linear-gradient(135deg, #ff88b0 0%, #ffbfbf 100%);
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  margin-right: 6rpx;
}

.main-tabs {
  margin: 24rpx auto 32rpx;
  width: 90%;
  display: flex;
  justify-content: space-between;
}

.main-tab {
  flex: 1;
  align-items: center;
  justify-content: center;
  display: flex;
  flex-direction: column;
  padding-bottom: 12rpx;
}

.main-tab-text { font-size: 28rpx; color: #c4c4c4; }

.main-tab-active .main-tab-text {
  background-image: linear-gradient(90deg, #b6d3ff 0%, #97faff 100%);
  -webkit-background-clip: text;
  color: transparent;
}

.main-tab-underline {
  margin-top: 10rpx;
  width: 60rpx;
  height: 8rpx;
  border-radius: 999rpx;
  background-image: linear-gradient(90deg, #79cfff 0%, #f8d478 100%);
}

::-webkit-scrollbar {
  width: 0 !important;
  height: 0 !important;
  background: transparent !important;
  display: none !important;
}
</style>
