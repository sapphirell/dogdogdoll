<template>
  <view class="workspace-panel font-alimamashuhei">
    <!-- 加载中状态 -->
    <view v-if="loading" class="ws-loading">
      <loading-jump-text />
    </view>

    <!-- 未入驻：去成为入驻作者 -->
    <view v-else-if="!isSettled" class="creator-empty-card">
      <text class="creator-title">还不是入驻作者</text>
      <text class="creator-desc">
        入驻后可以开启店铺 / 妆师 / 毛娘身份，拥有自己的工作台和主页入口。
      </text>
      <view class="creator-btn" @tap="goBecomeCreator">
        去成为入驻作者
      </view>
    </view>

    <!-- 已入驻：展示工作台 -->
    <view v-else class="ws-content">
      <!-- 顶部：我收到的投递（快捷卡片） -->
      <view v-if="showOrderHome" class="received-quick-wrap">
        <view class="received-quick-head">
          <text class="received-quick-title">我收到的投递</text>
          <text class="received-quick-count">共 {{ receivedCount }} 笔</text>
        </view>
        <view class="received-quick-grid">
          <view class="received-quick-item" @tap="goReceivedNeedConfirm">
            <image class="received-quick-icon" src="/static/new-icon/notification.png" mode="aspectFit" />
            <text class="received-quick-label">待您处理</text>
          </view>
          <view class="received-quick-item" @tap="goReceivedAll">
            <image class="received-quick-icon" src="/static/new-icon/order.png" mode="aspectFit" />
            <text class="received-quick-label">全部订单</text>
          </view>
          <view class="received-quick-item" @tap="goScheduleBoard593">
            <image class="received-quick-icon" src="/static/new-icon/log.png" mode="aspectFit" />
            <text class="received-quick-label">我的日程</text>
          </view>
        </view>
      </view>

      <!-- 我的身份设置 -->
      <view class="card identity-card">
        <view class="card-header-row">
          <text class="card-title">我的身份设置</text>
        </view>

        <view class="identity-row">
          <text class="identity-label">店铺</text>
          <switch
            :checked="isShop"
            @change="onToggle('shop', $event)"
            color="#8fecff"
          />
        </view>
        <view class="identity-row">
          <text class="identity-label">妆师</text>
          <switch
            :checked="isArtist"
            @change="onToggle('artist', $event)"
            color="#8fecff"
          />
        </view>
        <view class="identity-row">
          <text class="identity-label">毛娘</text>
          <switch
            :checked="isHairstylist"
            @change="onToggle('hairstylist', $event)"
            color="#8fecff"
          />
        </view>

        <text class="identity-tip">
          开启对应身份，代表您经营对应业务，可以在搜索框中被搜索到。
        </text>
      </view>

      <!-- 主主页入口 -->
      <view class="card entry-card">
        <view
          v-if="showOrderHome"
          class="entry-row"
          @tap="goOrderHome"
        >
          <view class="entry-main">
            <text class="entry-title">前往我的接单主页</text>
          </view>
          <uni-icons type="arrow-right" size="18" color="#999" />
        </view>

        <view
          v-if="showBrandHome"
          class="entry-row"
          @tap="goBrandHome"
        >
          <view class="entry-main">
            <text class="entry-title">前往我的品牌主页</text>
          </view>
          <uni-icons type="arrow-right" size="18" color="#999" />
        </view>
      </view>

      <!-- 功能按钮区域 -->
      <view class="card function-card">
        <view class="role-tab-row">
          <view
            v-for="role in workspaceRoleTabs"
            :key="role.key"
            class="role-tab-item"
            :class="{
              'role-tab-item-active': activeRoleTab === role.key,
              'role-tab-item-muted': !role.enabled
            }"
            @tap="activeRoleTab = role.key"
          >
            <text class="role-tab-text">{{ role.label }}</text>
          </view>
        </view>

        <text v-if="!activeRoleEnabled" class="role-disabled-tip">
          该身份尚未开启，先在上方打开开关后即可使用
        </text>

        <view class="function-list">
          <view
            v-for="item in currentRoleFunctions"
            :key="item.key"
            class="function-item"
            :class="{ 'is-disabled': !activeRoleEnabled }"
            @tap="handleFunctionClick(item.key)"
          >
            <view
              class="function-icon"
              :class="[getFunctionThemeClass(item.key), { 'is-disabled': !activeRoleEnabled }]"
            >
              <uni-icons
                :type="item.icon"
                size="22"
                :color="!activeRoleEnabled ? '#aeb6c2' : getFunctionIconColor(item.key)"
              />
            </view>
            <view class="function-info">
              <text class="function-title">{{ item.label }}</text>
              <text v-if="item.desc" class="function-desc">{{ item.desc }}</text>
            </view>
            <view class="function-arrow">
              <uni-icons type="arrow-right" size="18" :color="!activeRoleEnabled ? '#bfc6d1' : '#999'" />
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { websiteUrl, asyncGetUserInfo } from '@/common/config.js'

// 加载与用户信息
const loading = ref(true)
const userInfo = ref({})

// 入驻判定：这里以 brand_id > 0 作为“已经入驻作者”的判断条件
const isSettled = computed(() => {
  return !!userInfo.value && Number(userInfo.value.brand_id || 0) > 0
})

// 身份状态
const isShop = ref(false)         // 店铺
const isArtist = ref(false)       // 妆师
const isHairstylist = ref(false)  // 毛娘

// 防重复提交
const updating = ref(false)

// 主页入口是否显示
const showOrderHome = computed(() => isArtist.value || isHairstylist.value)
const showBrandHome = computed(() => isShop.value)

// 「我收到的投递」数量
const receivedCount = ref(0)

// 所有功能按钮配置
const allFunctions = [
  {
    key: 'shop-settings',
    label: '店铺设置',
    desc: '设置店铺基础信息与对外展示',
    icon: 'shop',
    role: 'shop'
  },
  {
    key: 'goods-manage',
    label: '商品管理',
    desc: '上新、编辑你的贩售商品',
    icon: 'gift', // gift
    role: 'shop'
  },
  {
    key: 'makeup-gallery',
    label: '妆图展示',
    desc: '管理妆面作品展示页',
    icon: 'heart', // 妆师设计
    role: 'artist'
  },
  {
    key: 'hair-gallery',
    label: '手改毛展示',
    desc: '管理手改毛作品展示页',
    icon: 'staff', // 手改毛图
    role: 'hairstylist'
  },
  {
    key: 'publish-plan-artist',
    label: '发布妆师开单',
    desc: '发布妆面接单计划',
    icon: 'calendar',
    role: 'artist'
  },
  {
    key: 'publish-plan-hairstylist',
    label: '发布毛娘开单',
    desc: '发布手改毛接单计划',
    icon: 'calendar',
    role: 'hairstylist'
  },
  {
    key: 'artist-settings',
    label: '妆师设置',
    desc: '设置妆师接单信息与规则',
    icon: 'person',
    role: 'artist'
  },
  {
    key: 'hairstylist-settings',
    label: '毛娘设置',
    desc: '设置毛娘接单信息与规则',
    icon: 'heart-filled', // 毛娘设置
    role: 'hairstylist'
  },
  {
    key: 'blank-stock-settings',
    label: '毛坯设置',
    desc: '管理已有毛坯库存、价格与头围信息',
    icon: 'list',
    role: 'hairstylist'
  },
  {
    key: 'article-publish',
    label: '发布文章',
    desc: '发布图透、成品展示和公告',
    icon: 'compose',
    role: 'shop'
  }
]

// 功能 → 主题 class 映射（背景色用 class）
const functionThemeMap = {
  'shop-settings': 'fc-theme-1',          // 原配色1
  'goods-manage': 'fc-theme-2',          // 原配色2
  'article-publish': 'fc-theme-3',       // 原配色3
  'artist-settings': 'fc-theme-4',       // 原配色4
  'makeup-gallery': 'fc-theme-5',        // 新配色1：#e5e3ed + #e19cbb
  'hair-gallery': 'fc-theme-6',          // 新配色2：#003153 + #e5e3ed
  'publish-plan-artist': 'fc-theme-7',   // 新配色3：#ecf2ec + #008c8d
  'publish-plan-hairstylist': 'fc-theme-7',
  'hairstylist-settings': 'fc-theme-8',  // 新配色4：#efdfce + #7e041d
  'blank-stock-settings': 'fc-theme-7'
}

// 主题 class → 图标颜色 映射（给 uni-icons 的 :color 用）
const themeIconColorMap = {
  'fc-theme-1': '#006a57', // #ffb400 + #006a57
  'fc-theme-2': '#dfd7c2', // #ef856d + #dfd7c2
  'fc-theme-3': '#fff6e1', // #81D8cf + #fff6e1
  'fc-theme-4': '#c7e1fa', // #28517f + #c7e1fa
  'fc-theme-5': '#e19cbb', // #e5e3ed + #e19cbb
  'fc-theme-6': '#e5e3ed', // #003153 + #e5e3ed
  'fc-theme-7': '#008c8d', // #ecf2ec + #008c8d
  'fc-theme-8': '#7e041d'  // #efdfce + #7e041d
}

function getFunctionThemeClass (key) {
  return functionThemeMap[key] || 'fc-theme-1'
}

function getFunctionIconColor (key) {
  const theme = functionThemeMap[key] || 'fc-theme-1'
  return themeIconColorMap[theme] || '#3c3b48'
}

const workspaceRoleTabs = computed(() => ([
  { key: 'shop', label: '店铺', enabled: isShop.value },
  { key: 'artist', label: '妆师', enabled: isArtist.value },
  { key: 'hairstylist', label: '毛娘', enabled: isHairstylist.value }
]))
const activeRoleTab = ref('shop')
const activeRoleEnabled = computed(() => {
  if (activeRoleTab.value === 'shop') return isShop.value
  if (activeRoleTab.value === 'artist') return isArtist.value
  if (activeRoleTab.value === 'hairstylist') return isHairstylist.value
  return false
})
const currentRoleFunctions = computed(() => {
  return allFunctions.filter(item => item.role === activeRoleTab.value)
})

function syncActiveRoleTab () {
  const tabs = workspaceRoleTabs.value
  const current = tabs.find(item => item.key === activeRoleTab.value)
  if (current && current.enabled) return
  const firstEnabled = tabs.find(item => item.enabled)
  if (firstEnabled) {
    activeRoleTab.value = firstEnabled.key
    return
  }
  if (current) return
  activeRoleTab.value = 'shop'
}

// 初始化：获取用户信息 + 品牌身份
onMounted(async () => {
  loading.value = true
  try {
    const u = await asyncGetUserInfo()
    userInfo.value = u || {}

    if (isSettled.value) {
      fetchBrandIdentity()
    }
  } catch (e) {
    console.error('加载工作台失败', e)
    uni.showToast({
      title: '工作台加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
})

// 拉取品牌身份（店铺 / 妆师 / 毛娘）
function fetchBrandIdentity () {
  const id = userInfo.value.brand_id
  if (!id) return

  uni.request({
    url: `${websiteUrl.value}/brand-info?id=${id}`,
    method: 'GET',
    success: res => {
      const resp = res.data || {}
      if (resp.status !== 'success' || !resp.data) return
      const d = resp.data
      isShop.value = d.is_brand === 1
      isArtist.value = d.is_bjd_artist === 1
      isHairstylist.value = d.is_bjd_hairstylist === 1
      syncActiveRoleTab()

      // 身份信息加载完再去拉“我收到的投递”数量
      fetchReceivedCount()
    },
    fail: () => {
      uni.showToast({
        title: '获取身份信息失败',
        icon: 'none'
      })
    }
  })
}

// 获取“我收到的投递”数量：调用 /with-state/artist-order/received
function fetchReceivedCount () {
  // 没开妆师/毛娘身份就不查
  if (!showOrderHome.value) {
    receivedCount.value = 0
    return
  }

  const token = uni.getStorageSync('token')
  if (!token) {
    receivedCount.value = 0
    return
  }

  uni.request({
    url: `${websiteUrl.value}/with-state/artist-order/received`,
    method: 'GET',
    header: {
      Authorization: token
    },
    data: {
      page: 1,
      page_size: 1 // 只要 total，不需要列表
    },
    success: res => {
      const resp = res.data || {}
      if (resp.status === 'success' && resp.data && resp.data.page) {
        receivedCount.value = resp.data.page.total || 0
      } else {
        receivedCount.value = 0
      }
    },
    fail: () => {
      receivedCount.value = 0
    }
  })
}

// 切换身份开关
function onToggle (type, e) {
  const val = !!e.detail.value
  if (type === 'shop') {
    updateBrandIdentity(
      'is_brand',
      val,
      () => {
        isShop.value = val
      },
      () => {
        isShop.value = !val
      }
    )
  } else if (type === 'artist') {
    updateBrandIdentity(
      'is_bjd_artist',
      val,
      () => {
        isArtist.value = val
      },
      () => {
        isArtist.value = !val
      }
    )
  } else if (type === 'hairstylist') {
    updateBrandIdentity(
      'is_bjd_hairstylist',
      val,
      () => {
        isHairstylist.value = val
      },
      () => {
        isHairstylist.value = !val
      }
    )
  }
}

// 调用后端更新身份
function updateBrandIdentity (field, value, onSuccess, onRollback) {
  if (updating.value) return
  updating.value = true

  const token = uni.getStorageSync('token')
  if (!token) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    updating.value = false
    onRollback && onRollback()
    return
  }

  uni.showLoading({ title: '更新中...', mask: true })

  const data = {}
  data[field] = value ? 1 : 0

  uni.request({
    url: `${websiteUrl.value}/brand-manager/update-brand-identity`,
    method: 'POST',
    header: {
      Authorization: token,
      'Content-Type': 'application/json'
    },
    data,
    success: res => {
      const resp = res.data || {}
      if (resp.status === 'success') {
        onSuccess && onSuccess()
        uni.showToast({ title: '已更新', icon: 'success' })
        // 身份变更后重新拉一次“我收到的投递”数量
        fetchReceivedCount()
      } else {
        onRollback && onRollback()
        uni.showToast({
          title: resp.msg || '更新失败',
          icon: 'none'
        })
      }
    },
    fail: () => {
      onRollback && onRollback()
      uni.showToast({
        title: '网络错误',
        icon: 'none'
      })
    },
    complete: () => {
      updating.value = false
      uni.hideLoading()
    }
  })
}

// 去成为入驻作者
function goBecomeCreator () {
  uni.navigateTo({
    url: '/pkg-creator/creator_base/creator_base'
  })
}

// 前往接单主页（妆师 / 毛娘）
function goOrderHome () {
  const bid = userInfo.value.brand_id || ''
  if (!bid) {
    uni.showToast({
      title: '暂无品牌信息',
      icon: 'none'
    })
    return
  }
  const roleType = isHairstylist.value && !isArtist.value ? 'hair' : 'artist'
  uni.navigateTo({
    url: `/pkg-creator/creator_base/creator_profile/creator_profile?brand_id=${bid}&type=${roleType}`
  })
}

// 前往品牌主页（贩售）
function goBrandHome () {
  const bid = userInfo.value.brand_id || ''
  if (!bid) {
    uni.showToast({
      title: '暂无品牌信息',
      icon: 'none'
    })
    return
  }
  uni.navigateTo({
    url: `/pages/brand/brand?brand_id=${bid}`
  })
}

// 跳转到“我收到的投递”列表（全部）
function goReceivedAll () {
  uni.navigateTo({
    url: '/pkg-creator/creator_order/received-list/received-list?order_filter=all'
  })
}

// 跳转到“待您处理”聚合页
function goReceivedNeedConfirm () {
  uni.navigateTo({
    url: '/pkg-creator/creator_order/creator_todo_list/creator_todo_list'
  })
}

// 跳转到“我的日程”
function goScheduleBoard593 () {
  uni.navigateTo({
    url: '/pkg-creator/creator_order/schedule_board/schedule_board?plan_id=593'
  })
}

// 功能按钮点击
function handleFunctionClick (key) {
  if (!activeRoleEnabled.value) {
    uni.showToast({
      title: '请先开启该身份',
      icon: 'none'
    })
    return
  }

  let url = ''

  switch (key) {
    case 'shop-settings':
      url = '/pkg-creator/creator_base/brand_edit/brand_edit'
      break
    case 'goods-manage':
      url = '/pkg-creator/creator_base/goods_list/goods_list'
      break
    case 'makeup-gallery':
      url = '/pkg-creator/creator_base/set_showcase/set_showcase'
      break
    case 'hair-gallery':
      url = '/pkg-creator/creator_base/set_hair_showcase/set_hair_showcase'
      break
    case 'publish-plan-artist':
      url = '/pkg-creator/creator_base/order_plan/form-artist'
      break
    case 'publish-plan-hairstylist':
      url = '/pkg-creator/creator_base/order_plan/form-wig'
      break
    case 'artist-settings':
      url = '/pkg-creator/creator_base/artist_setting/artist_setting'
      break
    case 'hairstylist-settings':
      url = '/pkg-creator/creator_base/hairstylist_setting/hairstylist_setting'
      break
    case 'blank-stock-settings':
      url = '/pkg-creator/creator_base/blank_stock_manage/blank_stock_manage'
      break
    case 'article-publish':
      url = '/pkg-creator/creator_base/news/news'
      break
    default:
      url = ''
  }

  if (!url) return

  uni.navigateTo({ url })
}
</script>

<style lang="scss" scoped>
.workspace-panel {
  padding: 20rpx 24rpx 40rpx;
  box-sizing: border-box;
}

/* 加载中 */
.ws-loading {
  padding: 60rpx 20rpx;
  text-align: center;
  font-size: 26rpx;
  color: #999999;
}

/* === 入场动画：淡入 + 向上滑动 === */
/* 只要 loading 去掉，creator-empty-card / ws-content 挂载时就会播放 */
.creator-empty-card,
.ws-content {
  animation: fade-up-in 0.82s ease-out both;
}

@keyframes fade-up-in {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 未入驻卡片 */
.creator-empty-card {
  margin-top: 20rpx;
  padding: 36rpx 28rpx 32rpx;
  background: #ffffff;
  border-radius: 24rpx;
  box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.04);
}

.creator-title {
  font-size: 32rpx;
  color: #666666;
  font-weight: 700;
}

.creator-desc {
  display: block;
  margin-top: 16rpx;
  font-size: 26rpx;
  color: #777777;
  line-height: 1.7;
}

.creator-btn {
  margin-top: 28rpx;
  height: 82rpx;
  line-height: 82rpx;
  text-align: center;
  border-radius: 999rpx;
  background-image: linear-gradient(90deg, #89d4ff 0%, #f8d478 100%);
  color: #ffffff;
  font-size: 28rpx;
}

/* 已入驻内容 */
.ws-content {
  margin-top: 10rpx;
}

/* 通用卡片 */
.card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 26rpx 24rpx;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.04);
  margin-bottom: 24rpx;
}

.card-header-row {
  margin-bottom: 12rpx;
}

.card-title {
  font-size: 30rpx;
  color: #666666;
  font-weight: 700;
}

/* 顶部：我收到的投递快捷卡片 */
.received-quick-wrap {
  margin-bottom: 26rpx;
}

.received-quick-head {
  padding: 0 4rpx;
  margin-bottom: 16rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.received-quick-title {
  font-size: 30rpx;
  color: #253246;
  font-weight: 700;
}

.received-quick-count {
  font-size: 24rpx;
  color: #7a8699;
}

.received-quick-grid {
  display: flex;
  gap: 14rpx;
}

.received-quick-item {
  flex: 1;
  min-height: 144rpx;
  border-radius: 22rpx;
  background: #ffffff;
  box-shadow: 0 12rpx 28rpx rgba(37, 50, 70, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 18rpx 8rpx;
  box-sizing: border-box;
}

.received-quick-icon {
  width: 44rpx;
  height: 44rpx;
}

.received-quick-label {
  margin-top: 12rpx;
  font-size: 25rpx;
  color: #253246;
}

/* 身份设置 */
.identity-card {
}

.identity-row {
  padding: 18rpx 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.identity-label {
  font-size: 28rpx;
  color: #666666;
}

.identity-tip {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #999999;
  line-height: 1.6;
}

/* 主页入口 */
.entry-card {
}

.entry-row {
  padding: 18rpx 0;
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid #f3f3f3;

  &:last-child {
    border-bottom: none;
  }

  /* 两个按钮之间留一些垂直间距 */
  & + .entry-row {
    margin-top: 16rpx;
  }
}

.entry-main {
  flex: 1;
}

.entry-title {
  font-size: 28rpx;
  color: #666666;
}

/* 功能按钮区域 */
.function-card {
  padding: 20rpx;
}

.role-tab-row {
  display: flex;
  gap: 14rpx;
  margin-bottom: 18rpx;
}

.role-tab-item {
  flex: 1;
  height: 64rpx;
  border-radius: 999rpx;
  background: #f4f7fc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.role-tab-item-active {
  background: #dff7ff;
}

.role-tab-item-muted {
  background: #f1f2f5;
}

.role-tab-text {
  font-size: 26rpx;
  color: #627089;
}

.role-tab-item-active .role-tab-text {
  color: #3a516e;
  font-weight: 700;
}

.role-disabled-tip {
  display: block;
  margin-bottom: 14rpx;
  font-size: 22rpx;
  color: #9aa3af;
}

.function-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.function-item {
  display: flex;
  align-items: center;
  padding: 22rpx 20rpx;
  border-radius: 18rpx;
  background: #f8fbff;
  transition: background 0.58s ease;

  &:active {
    background-color: #edf4fb;
  }
}

.function-icon {
  width: 72rpx;
  height: 72rpx;
  margin-right: 16rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.75;
}
.function-icon.is-disabled {
  background: #e8ebf0 !important;
}

/* 撞色主题：背景用 class 控制（以后你可以只改这里） */
/* 原 4 组 */
.function-icon.fc-theme-1 {
  background-color: #ffb400;
}

.function-icon.fc-theme-2 {
  background-color: #ef856d;
}

.function-icon.fc-theme-3 {
  background-color: #81d8cf;
}

.function-icon.fc-theme-4 {
  background-color: #28517f;
}

/* 新增的 4 组撞色 */
.function-icon.fc-theme-5 {
  background-color: #e5e3ed; /* #e5e3ed + #e19cbb */
}

.function-icon.fc-theme-6 {
  background-color: #003153; /* #003153 + #e5e3ed */
}

.function-icon.fc-theme-7 {
  background-color: #ecf2ec; /* #ecf2ec + #008c8d */
}

.function-icon.fc-theme-8 {
  background-color: #efdfce; /* #efdfce + #7e041d */
}

.function-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.function-title {
  font-size: 28rpx;
  color: #666666;
  margin-bottom: 6rpx;
}

.function-desc {
  font-size: 24rpx;
  color: #999999;
}

.function-arrow {
  margin-left: 12rpx;
}

.function-item.is-disabled {
  background: #f5f6f8;
}

.function-item.is-disabled:active {
  background: #f5f6f8;
}

.function-item.is-disabled .function-title {
  color: #9ea6b2;
}

.function-item.is-disabled .function-desc {
  color: #b5bcc7;
}
</style>
