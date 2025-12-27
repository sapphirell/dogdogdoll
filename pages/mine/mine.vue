<!-- pages/mine/mine.vue -->
<template>
  <meta name="theme-color" content="#e0f3ff"></meta>
  <view-logs />

  <view head_color="url('/static/bg/bg2.jpg')">
    <view class="my-center-page">
      <!-- 已登录视图 -->
      <view v-if="isLogin" class="login-wrap">
        <view class="headbg">
          <!-- 顶部安全区占位 -->
          <view class="header-placeholders"></view>

          <!-- 头像 + 昵称 -->
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

          <!-- 一级 Tab：订单集 / 信息集 / 工作台 / 设置我 -->
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

        <!-- 订单集 -->
        <orders-panel
          v-if="activeMainTab === 'orders'"
          :active="activeMainTab === 'orders'"
        />

        <!-- 信息集 -->
        <info-hub-panel
          v-else-if="activeMainTab === 'inbox'"
          :active="activeMainTab === 'inbox'"
        />

        <!-- 工作台：使用新的子组件 -->
        <mine-workspace-panel v-else-if="activeMainTab === 'workspace'" />

        <!-- 设置我：按钮列表组件 -->
        <mine-settings-panel
          v-else-if="activeMainTab === 'settings'"
          @action="handleSettingsAction"
        />
      </view>

      <!-- 未登录视图 -->
      <!-- 关键：这里额外加 unlogin-wrap，用渐变铺满整个安全区 -->
      <view v-else class="login-wrap unlogin-wrap">
        <view class="header-placeholders"></view>
        <login-panel @success="handleLoginSuccess" />
      </view>
    </view>

    <im-fab></im-fab>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import {
  websiteUrl,
  global,
  asyncGetUserInfo,
  getUserInfo
} from '@/common/config.js'

const defaultAvatar =
  'https://images1.fantuanpu.com/home/jpt.gif' // 默认头像

// 一级 Tab
const mainTabs = [
  { key: 'inbox', label: '信息集' },
  { key: 'orders', label: '订单集' },
  { key: 'workspace', label: '工作台' },
  { key: 'settings', label: '设置我' }
]
const activeMainTab = ref('inbox')

const isLogin = computed(() => !!global.isLogin)

// 顶部系统信息（计算安全区高度）
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

// 监听登录状态，控制 TabBar 显隐
watch(
  () => global.isLogin,
  newVal => {
    if (newVal) {
      uni.showTabBar({ animation: false })
    } else {
      uni.hideTabBar({ animation: false })
    }
  }
)

// 一级 Tab 切换
function changeMainTab (key) {
  activeMainTab.value = key
}

// ====== 头像裁剪上传逻辑 ======

function chooseImage () {
  return new Promise(resolve => {
    uni.chooseImage({
      count: 1,
      success: res => {
        resolve(res.tempFilePaths[0])
      }
    })
  })
}

// 裁切头像
function jumpToCroper () {
  chooseImage().then(src => {
    uni.navigateTo({
      url: `/pages/pop_croper/pop_croper?src=${decodeURIComponent(src)}`
    })
  })
}

function selectAvatar (croperPath) {
  const token = uni.getStorageSync('token')
  let qnToken = ''

  // 获取七牛上传 token
  uni.request({
    url: websiteUrl.value + '/with-state/qiniu-token',
    method: 'POST',
    header: {
      Authorization: token
    },
    success: res => {
      if (!res.data.data || !res.data.data.token) {
        uni.showToast({
          title: '获取上传凭证失败',
          icon: 'none'
        })
        return
      }
      qnToken = res.data.data.token
      const fileName = res.data.data.path

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
        fail: () => {
          uni.showToast({
            title: '上传失败',
            icon: 'none'
          })
        }
      })
    },
    fail: () => {
      uni.showToast({
        title: '获取上传凭证失败',
        icon: 'none'
      })
    }
  })
}

function updateUserInfo (key, value) {
  const token = uni.getStorageSync('token')
  uni.request({
    url: websiteUrl.value + '/with-state/update-profile',
    method: 'POST',
    header: {
      Authorization: token
    },
    data: {
      [key]: value
    },
    success: () => {
      getUserInfo()
    },
    fail: () => {
      uni.showToast({
        title: '更新失败',
        icon: 'none'
      })
    }
  })
}

// 账号设置页面（暂作为“基本信息设置”的入口）
function jumpSetting () {
  uni.navigateTo({
    url: '/pages/setting/setting'
  })
}

// 跳转到设置用户名
function jumpToSetName () {
  uni.navigateTo({
    url: '/pages/setting/username/username'
  })
}

// 处理设置面板按钮点击
function handleSettingsAction (type) {
  if (type === 'profile') {
    // 基本信息设置
    jumpSetting()
  } else if (type === 'address') {
    // 地址设置：占位，后续可以换成真实地址页面
    uni.showToast({
      title: '地址设置开发中',
      icon: 'none'
    })
  }
  // 退出账号逻辑已经移入 mine-settings-panel 组件内部
}

// 登录组件回调
function handleLoginSuccess () {
  asyncGetUserInfo()
}

// 生命周期：进入页面时刷新一下用户信息 & 显示/隐藏 TabBar
onShow(async () => {
  const user = await asyncGetUserInfo()
  if (global.isLogin) {
    uni.showTabBar({ animation: false })
    if (user) {
      // 需要的话这里可以用 user 做别的事情
    }
  } else {
    uni.hideTabBar({ animation: false })
  }

  // 裁剪返回
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  if (currentPage.returnParam) {
    selectAvatar(currentPage.returnParam)
    currentPage.returnParam = ''
  }
})
</script>

<style lang="scss" scoped>
.my-center-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

.login-wrap {
  /* 登录 / 未登录共同的容器：先撑满剩余高度 */
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

/* 未登录场景：使用渐变背景，把顶部 header-placeholders 和底部安全区都染色 */
.unlogin-wrap {
  background: linear-gradient(135deg, #e0f3ff 0%, #fff9fb 100%);
}

.headbg {
  background: url('/static/blue2yellow.png');
  background-size: contain;
}

/* 字体：兼容原 class 名 */
.font-alimama,
.font-alimamashuhei {
  font-family: 'alimamamshuhei' !important;
}

/* 顶部安全区占位 */
.header-placeholders {
  height: v-bind(headerHeight);
}

/* 头像 + 昵称 */
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

.avatar-img {
  width: 100%;
  height: 100%;
}

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

/* 一级 Tab */
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

.main-tab-text {
  font-size: 28rpx;
  color: #c4c4c4;
}

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

/* 占位 */
.placeholder-panel {
  padding: 120rpx 40rpx 40rpx;
}
.placeholder-text {
  font-size: 26rpx;
  color: #999999;
  line-height: 1.7;
}

/* 原来的设置按钮样式保留 */
.settings-btn {
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #89d4ff 0%, #f8d478 100%);
  color: #ffffff;
  border: none;
  font-size: 28rpx;
}

/* 隐藏滚动条 */
::-webkit-scrollbar {
  width: 0 !important;
  height: 0 !important;
  background: transparent !important;
  display: none !important;
}
</style>
