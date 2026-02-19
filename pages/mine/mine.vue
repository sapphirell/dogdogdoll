<template>
  <meta name="theme-color" content="#e0f3ff"></meta>
  <view-logs />

  <view head_color="url('/static/bg/bg2.jpg')">
    <view class="my-center-page" :style="pageBackgroundStyle">
      <skin-background
        class="mine-skin-fx"
        style="position: fixed; inset: 0; z-index: 99; pointer-events: none;"
        :animation-type="activeSkin.background_animation"
        :animation-config="activeSkin.animation_config"
      />

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
import { ref, computed, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import {
  websiteUrl,
  global,
  asyncGetUserInfo,
  getUserInfo
} from '@/common/config.js'

const defaultAvatar = 'https://images1.fantuanpu.com/home/jpt.gif'

const noneSkin = {
  id: 0,
  skin_key: 'none',
  name: '无皮肤',
  background_color: '#ffffff',
  background_image: '',
  background_animation: '',
  animation_config: {}
}

const defaultSkin = {
  id: 0,
  skin_key: 'star_snow',
  name: '星雪',
  background_color: 'linear-gradient(180deg, #eaf7ff 0%, #ffffff 58%, #f9fcff 100%)',
  background_image: '',
  background_animation: 'star_fall',
  animation_config: {
    count: 50,
    min_size_rpx: 20,
    max_size_rpx: 50,
    min_duration_s: 15,
    max_duration_s: 30,
    min_opacity: 0.2,
    max_opacity: 0.6,
    min_fall_px: 500,
    max_fall_px: 800,
    max_delay_s: 10,
    size_scale: 1.5
  }
}
const activeSkin = ref({ ...defaultSkin })

const pageBackgroundStyle = computed(() => {
  const style = { position: 'relative' }
  const bgColor = String(activeSkin.value?.background_color || '').trim()
  const bgImage = String(activeSkin.value?.background_image || '').trim()

  if (bgColor.includes('gradient(')) {
    if (bgImage) style.backgroundImage = `${bgColor}, url('${bgImage}')`
    else style.backgroundImage = bgColor
    style.backgroundSize = bgImage ? 'cover, cover' : 'cover'
    style.backgroundPosition = bgImage ? 'center center, center center' : 'center center'
    style.backgroundRepeat = bgImage ? 'no-repeat, no-repeat' : 'no-repeat'
  } else {
    if (bgColor) style.backgroundColor = bgColor
    if (bgImage) {
      style.backgroundImage = `url('${bgImage}')`
      style.backgroundSize = 'cover'
      style.backgroundPosition = 'center center'
      style.backgroundRepeat = 'no-repeat'
    }
  }
  return style
})

function normalizeAnimationConfig (raw) {
  if (!raw) return {}
  if (typeof raw === 'string') {
    try {
      const obj = JSON.parse(raw)
      return obj && typeof obj === 'object' ? obj : {}
    } catch (e) {
      return {}
    }
  }
  if (typeof raw === 'object') return raw
  return {}
}

function normalizeSkin (raw) {
  if (!raw || typeof raw !== 'object') return { ...defaultSkin }
  return {
    id: Number(raw.id || 0),
    skin_key: String(raw.skin_key || defaultSkin.skin_key),
    name: String(raw.name || defaultSkin.name),
    background_color: String(raw.background_color || defaultSkin.background_color),
    background_image: String(raw.background_image || ''),
    background_animation: String(raw.background_animation || ''),
    animation_config: normalizeAnimationConfig(raw.background_animation_config || raw.animation_config)
  }
}

function requestWithToken ({ url, method = 'GET', data }) {
  return new Promise((resolve) => {
    const token = uni.getStorageSync('token')
    if (!token) {
      resolve({ ok: false, data: null })
      return
    }
    uni.request({
      url,
      method,
      data,
      header: { Authorization: token },
      timeout: 15000,
      success: (res) => resolve({ ok: true, data: res?.data }),
      fail: () => resolve({ ok: false, data: null })
    })
  })
}

async function loadActiveSkin () {
  if (!global.isLogin) {
    activeSkin.value = { ...defaultSkin }
    return
  }

  const ret = await requestWithToken({
    url: `${websiteUrl.value}/with-state/skin/list`,
    method: 'GET'
  })
  const resp = ret?.data || {}
  if (!ret.ok || String(resp.status || '').toLowerCase() !== 'success') {
    activeSkin.value = { ...defaultSkin }
    return
  }

  const list = Array.isArray(resp?.data?.skins) ? resp.data.skins : []
  const selectedId = Number(resp?.data?.selected_skin_id || 0)
  if (selectedId <= 0) {
    activeSkin.value = { ...noneSkin }
    return
  }
  const selected = list.find(item => Number(item?.id || 0) === selectedId)
  activeSkin.value = selected ? normalizeSkin(selected) : { ...noneSkin }
}

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
  else if (type === 'skin') uni.navigateTo({ url: '/pkg-common/skin/skin-setting' })
}
function handleLoginSuccess () { asyncGetUserInfo() }

onShow(async () => {
  await asyncGetUserInfo()
  if (global.isLogin) uni.showTabBar({ animation: false })
  else uni.hideTabBar({ animation: false })

  await loadActiveSkin()

  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  if (currentPage.returnParam) {
    selectAvatar(currentPage.returnParam)
    currentPage.returnParam = ''
  }
})
</script>

<style lang="scss" scoped>
/* --- 页面其他样式 --- */
.my-center-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: transparent;
  position: relative;
}

.mine-skin-fx {
  pointer-events: none;
}

.login-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  position: relative;
  z-index: 1;
}

.unlogin-wrap {
  background: transparent;
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
