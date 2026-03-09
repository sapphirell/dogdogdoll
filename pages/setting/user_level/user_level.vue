<template>
  <view class="level-page">
    <loading-toast :show="pageLoading" text="加载中..." />

    <zhouWei-navBar
      type="transparentFixed"
      :backState="2000"
      :homeState="2000"
      fontColor="#3f4f66"
      transparentFixedFontColor="#3f4f66"
      :scrollTop="scrollTop"
      :titleCenter="true"
      title="等级中心"
    >
      <template #left>
        <view class="nav-back-pill" @click="goBack">
          <uni-icons type="left" size="22" color="#3f4f66" />
        </view>
      </template>
      <template #transparentFixedLeft>
        <view class="nav-back-pill" @click="goBack">
          <uni-icons type="left" size="22" color="#3f4f66" />
        </view>
      </template>
    </zhouWei-navBar>

    <view class="level-body" :style="{ paddingTop: headerPadPx, '--header-pad': headerPadPx }">
      <view class="level-shell">
        <template v-if="!pageLoading">
        <view class="hero">
          <view class="avatar-wrap">
            <image class="avatar-img" mode="aspectFill" :src="global.userInfo.avatar || defaultAvatar" />
          </view>
          <view class="hero-level-row">
            <view class="lv-chip">
              <text class="font-title">Lv{{ overview?.profile?.current_level || 1 }}</text>
            </view>
            <text class="hero-level-name font-alimamashuhei">{{ overview?.current_rule?.name || '正在成长中' }}</text>
          </view>

          <text class="hero-name font-alimamashuhei">{{ global.userInfo.username || '探索者' }}</text>
        </view>

        <view v-if="overview?.next_rule" class="exp-card">
          <view class="exp-row">
            <text class="exp-current font-title">{{ expCurrent }}</text>
            <text class="exp-total">/1000 经验值</text>
            <text class="exp-percent font-title">{{ expPercent }}%</text>
          </view>
          <view class="exp-track">
            <view class="exp-fill" :style="{ width: `${expPercent}%` }">
              <view class="progress-stripe progress-stripe-exp" />
            </view>
          </view>
          <view class="exp-tip">
            <text>距离 </text>
            <text class="font-title">Lv{{ overview.next_rule.level }}</text>
            <text> 还需 {{ expRemain }} 经验值</text>
          </view>
        </view>

        <view v-if="overview?.next_rule" class="info-section">
          <view class="info-tabs">
            <view
              class="info-tab font-alimamashuhei"
              :class="{ 'info-tab-active': activeInfoTab === 'requirements' }"
              @tap="activeInfoTab = 'requirements'"
            >
              下一等级要求
            </view>
            <view
              class="info-tab font-alimamashuhei"
              :class="{ 'info-tab-active': activeInfoTab === 'rewards' }"
              @tap="activeInfoTab = 'rewards'"
            >
              下一等级奖励
            </view>
          </view>

          <view v-if="activeInfoTab === 'requirements'" class="info-panel">
            <view
              v-for="(item, idx) in normalizedProgress"
              :key="idx"
              class="req-item"
            >
              <view class="req-icon-wrap">
                <uni-icons :type="item.icon" size="24" :color="item.iconColor" />
              </view>
              <view class="req-main">
                <view class="req-main-top">
                  <text class="req-label font-alimamashuhei">{{ item.label }}</text>
                  <text class="req-count font-title">{{ item.current }}/{{ item.target }}</text>
                </view>
                <view class="req-track">
                  <view class="req-fill" :style="{ width: `${item.percent}%`, background: item.fillBg }">
                    <view class="progress-stripe" :style="{ backgroundImage: item.stripeBg }" />
                  </view>
                </view>
                <text class="req-desc">{{ item.desc }}</text>
              </view>
            </view>
          </view>

          <view v-else class="info-panel">
            <view v-if="nextRewards.length" class="reward-list">
              <view
                v-for="(reward, idx) in nextRewards"
                :key="`${reward.type}-${idx}`"
                class="reward-item"
              >
                <view class="reward-media" :class="[`reward-media-${reward.type}`]">
                  <image
                    v-if="reward.type === 'skin' && reward.skin_preview_image"
                    class="reward-skin-image"
                    mode="aspectFill"
                    :src="reward.skin_preview_image"
                  />
                  <uni-icons
                    v-else
                    :type="reward.icon"
                    size="22"
                    :color="reward.iconColor"
                  />
                </view>
                <view class="reward-main">
                  <view class="reward-top">
                    <text class="reward-label font-alimamashuhei">{{ reward.label }}</text>
                    <text class="reward-value font-title">{{ reward.valueText }}</text>
                  </view>
                  <text class="reward-desc">{{ reward.description }}</text>
                </view>
              </view>
            </view>
            <view v-else class="reward-empty">
              <text class="reward-empty-text">下一等级奖励正在整理中，稍后会在这里展示。</text>
            </view>
          </view>
        </view>

        <view v-else class="max-card">
          <text class="max-title font-alimamashuhei">已经达到最高等级啦</text>
        </view>

        <view class="footer">
          <button
            :disabled="!canUpgradeAction || upgrading"
            :class="['upgrade-btn', canUpgradeAction ? 'upgrade-btn-on' : 'upgrade-btn-off']"
            @click="handleUpgrade"
          >
            <uni-icons v-if="!canUpgradeAction || upgrading" type="locked" size="18" color="#9aa7bc" />
            <text class="upgrade-text">
              {{ upgrading ? '升级中...' : (canUpgradeAction ? `立即升级 (Lv${(overview?.next_rule?.level || 1)})` : '立即升级') }}
            </text>
          </button>
          <text v-if="!canUpgradeAction" class="unlock-tip">完成所有要求解锁</text>
          <text v-if="DEBUG_SKIP_UPGRADE_API" class="debug-tip">DEBUG模式：升级按钮不调用接口，可反复测试弹窗</text>
        </view>
        </template>
      </view>
    </view>

    <view v-if="showUpgradeModal" class="upgrade-mask" @touchmove.stop>
      <view class="confetti-layer">
        <view
          v-for="item in confettiItems"
          :key="item.id"
          class="confetti"
          :style="{
            '--drift': `${item.drift}px`,
            '--rotate-start': `${item.rotate}deg`,
            left: `${item.left}%`,
            width: `${item.size}rpx`,
            height: `${Math.max(8, Math.round(item.size * 0.6))}rpx`,
            background: item.color,
            animationDelay: `${item.delay}s`,
            animationDuration: `${item.duration}s`
          }"
        />
      </view>

      <view class="upgrade-dialog" @tap.stop>
        <view class="medal-wrap">
          <view class="medal-circle">
            <text class="medal-level font-title">Lv{{ upgradeResult.toLevel }}</text>
            <text class="medal-level-text">升级成功</text>
          </view>
          <view class="medal-chip">LEVEL UP!</view>
        </view>

        <text class="dialog-title font-alimamashuhei">恭喜升级！</text>
        <text class="dialog-subtitle">您已达到 Lv.{{ upgradeResult.toLevel }}</text>
        <text class="dialog-desc">新的等级奖励已经解锁，可在下方查看本次升级获得的内容。</text>

        <view v-if="dialogRewards.length" class="dialog-reward-list">
          <view
            v-for="(reward, idx) in dialogRewards"
            :key="`${reward.type}-${idx}`"
            class="dialog-reward-item"
          >
            <view class="dialog-reward-icon" :class="[`dialog-reward-icon-${reward.type}`]">
              <image
                v-if="reward.type === 'skin' && reward.skin_preview_image"
                class="dialog-reward-image"
                mode="aspectFill"
                :src="reward.skin_preview_image"
              />
              <uni-icons
                v-else
                :type="reward.icon"
                size="18"
                :color="reward.iconColor"
              />
            </view>
            <view class="dialog-reward-main">
              <text class="dialog-reward-label">{{ reward.label }}</text>
              <text class="dialog-reward-desc">{{ reward.description }}</text>
            </view>
          </view>
        </view>

        <button class="dialog-btn-primary" @tap.stop="closeUpgradeModal">太棒了</button>
        <button class="dialog-btn-secondary" @tap.stop="viewPerks">查看新特权</button>
      </view>

      <view class="dialog-close-btn" @tap.stop="closeUpgradeModal">
        <uni-icons type="closeempty" size="26" color="#ffffff" />
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { onPageScroll } from '@dcloudio/uni-app'
import { websiteUrl, global, getStatusBarHeight, getNavBarHeight, toPx } from '@/common/config'

// 调试开关：true=点击升级不调后端接口，直接弹出升级成功动效，方便重复测试。
const DEBUG_SKIP_UPGRADE_API = true

const defaultAvatar = 'https://images1.fantuanpu.com/home/jpt.gif'
const upgrading = ref(false)
const overview = ref(null)
const showUpgradeModal = ref(false)
const upgradeResult = ref({ fromLevel: 1, toLevel: 1 })
const confettiItems = ref([])
const activeInfoTab = ref('requirements')
const scrollTop = ref(0)
const pageLoading = ref(true)
const headerPadPx = computed(() => toPx(getStatusBarHeight() + getNavBarHeight()))

const iconMap = {
  login_days: { icon: 'calendar', color: '#86c2ea', fill: 'linear-gradient(90deg, #91c8eb 0%, #78bae7 100%)', desc: '累计登录天数' },
  showcase_public_count: { icon: 'image', color: '#8fb5f4', fill: 'linear-gradient(90deg, #91bbff 0%, #7fa7f5 100%)', desc: '发布并公开展示柜' },
  reply_count: { icon: 'chatboxes-filled', color: '#e8a3c0', fill: 'linear-gradient(90deg, #efb6ca 0%, #e39cb9 100%)', desc: '完成有效回复' },
  post_count: { icon: 'compose', color: '#e5a6a6', fill: 'linear-gradient(90deg, #f0b8b8 0%, #eaa5a5 100%)', desc: '发布内容数量' },
  completed_order_count: { icon: 'checkmarkempty', color: '#e6aa63', fill: 'linear-gradient(90deg, #efbc77 0%, #e3a45c 100%)', desc: '完成订单数量' },
  received_like_count: { icon: 'heart-filled', color: '#e99ab6', fill: 'linear-gradient(90deg, #f2b1c9 0%, #e88eaf 100%)', desc: '累计获得点赞' }
}

const rewardMap = {
  account_book_limit: { icon: 'calendar', color: '#49caee', label: '记账上限', unit: '条', prefix: '解锁至' },
  skin: { icon: 'gift-filled', color: '#fb9ac2', label: '专属皮肤', unit: '', prefix: '' },
  points: { icon: 'star-filled', color: '#f2b45f', label: '奖励积分', unit: '积分', prefix: '+' }
}

const normalizedProgress = computed(() => {
  const list = overview.value?.progress || []
  return list.map((item) => {
    const meta = iconMap[item.metric] || { icon: 'star-filled', color: '#8db4eb', fill: 'linear-gradient(90deg, #9bc0f3 0%, #8db4eb 100%)', desc: '条件进度' }
    const target = Number(item.target || 0)
    const current = Number(item.current || 0)
    const safeTarget = target > 0 ? target : 1
    const percent = Math.max(0, Math.min(100, Math.round((Math.min(current, safeTarget) / safeTarget) * 100)))
    return {
      ...item,
      current,
      target,
      percent,
      icon: meta.icon,
      iconColor: meta.color,
      fillBg: meta.fill,
      stripeBg: getStripeOverlay(item),
      desc: meta.desc
    }
  })
})

const expPercent = computed(() => {
  const rows = normalizedProgress.value
  if (!rows.length) return 0
  const totalTarget = rows.reduce((sum, row) => sum + (row.target > 0 ? row.target : 1), 0)
  const totalCurrent = rows.reduce((sum, row) => sum + Math.min(row.current, row.target > 0 ? row.target : 1), 0)
  if (totalTarget <= 0) return 0
  return Math.max(0, Math.min(100, Math.round((totalCurrent / totalTarget) * 100)))
})

const expCurrent = computed(() => Math.round((expPercent.value / 100) * 1000))
const expRemain = computed(() => Math.max(0, 1000 - expCurrent.value))
const canUpgradeAction = computed(() => DEBUG_SKIP_UPGRADE_API || !!overview.value?.can_upgrade)
const nextRewards = computed(() => normalizeRewards(overview.value?.next_rule?.rewards || []))
const dialogRewards = computed(() => {
  const list = overview.value?.rules || []
  const targetLevel = Number(upgradeResult.value?.toLevel || 0)
  const targetRule = list.find((item) => Number(item?.level || 0) === targetLevel)
  if (targetRule?.rewards?.length) {
    return normalizeRewards(targetRule.rewards)
  }
  return nextRewards.value
})

function normalizeRewards(list) {
  return (Array.isArray(list) ? list : []).map((item) => {
    const type = String(item?.type || '').trim()
    const meta = rewardMap[type] || { icon: 'gift-filled', color: '#49caee', label: '等级奖励', unit: '', prefix: '' }
    const amount = Number(item?.amount || 0)
    const label = String(item?.label || '').trim() || meta.label
    let valueText = ''
    if (type === 'account_book_limit') {
      valueText = `${meta.prefix}${amount}${meta.unit}`
    } else if (type === 'points') {
      valueText = `${meta.prefix}${amount} ${meta.unit}`.trim()
    } else if (type === 'skin') {
      valueText = String(item?.skin_name || item?.description || '皮肤礼遇').trim()
    } else {
      valueText = String(item?.description || '').trim()
    }
    return {
      ...item,
      type,
      label,
      icon: meta.icon,
      iconColor: meta.color,
      valueText,
      description: String(item?.description || valueText || '升级后解锁').trim()
    }
  })
}

function createConfettiItems() {
  const colors = ['#ee7f85', '#6dcdd1', '#ffd86a', '#72b7ff', '#f3a3d3', '#9ee0a9']
  const list = []
  for (let i = 0; i < 24; i++) {
    list.push({
      id: `${Date.now()}-${i}`,
      left: Math.round((i / 24) * 100 + (Math.random() * 8 - 4)),
      size: 12 + Math.round(Math.random() * 10),
      rotate: Math.round(Math.random() * 360),
      drift: Math.round(Math.random() * 160 - 80),
      delay: Number((Math.random() * 0.35).toFixed(2)),
      duration: Number((1.2 + Math.random() * 1.2).toFixed(2)),
      color: colors[Math.floor(Math.random() * colors.length)]
    })
  }
  return list
}

function openUpgradeModal(fromLevel, toLevel) {
  upgradeResult.value = {
    fromLevel: Number(fromLevel || 1),
    toLevel: Number(toLevel || 1)
  }
  confettiItems.value = createConfettiItems()
  showUpgradeModal.value = true
}

function closeUpgradeModal() {
  showUpgradeModal.value = false
}

function viewPerks() {
  activeInfoTab.value = 'rewards'
  closeUpgradeModal()
}

async function fetchOverview(options = {}) {
  const { silent = false } = options
  if (!silent) pageLoading.value = true
  const token = uni.getStorageSync('token')
  if (!token) {
    if (!silent) pageLoading.value = false
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/user-level/overview`,
      method: 'GET',
      header: { Authorization: token }
    })
    if (res?.data?.status !== 'success') {
      uni.showToast({ title: res?.data?.msg || '获取等级信息失败', icon: 'none' })
      return
    }
    overview.value = res.data.data || null
  } catch (e) {
    uni.showToast({ title: '网络异常，请稍后再试', icon: 'none' })
  } finally {
    if (!silent) pageLoading.value = false
  }
}

function buildStripeOverlay(colorA, colorB) {
  return `repeating-linear-gradient(135deg, ${colorA} 0rpx, ${colorA} 18rpx, ${colorB} 18rpx, ${colorB} 36rpx)`
}

function getStripeOverlay(item) {
  switch (item.metric) {
    case 'login_days':
      return buildStripeOverlay('rgba(255,255,255,0.22)', 'rgba(255,255,255,0.04)')
    case 'reply_count':
      return buildStripeOverlay('rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)')
    case 'showcase_public_count':
      return buildStripeOverlay('rgba(255,255,255,0.24)', 'rgba(255,255,255,0.06)')
    default:
      return buildStripeOverlay('rgba(255,255,255,0.22)', 'rgba(255,255,255,0.05)')
  }
}

async function handleUpgrade() {
  if (upgrading.value) return
  const token = uni.getStorageSync('token')
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }

  if (DEBUG_SKIP_UPGRADE_API) {
    const currentLv = Number(overview.value?.profile?.current_level || 1)
    const targetLv = Math.min(9, currentLv + 1)
    openUpgradeModal(currentLv, targetLv)
    return
  }

  upgrading.value = true
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/user-level/upgrade`,
      method: 'POST',
      header: { Authorization: token }
    })
    const ok = res?.data?.status === 'success'
    if (!ok) {
      uni.showToast({ title: res?.data?.msg || '升级失败', icon: 'none' })
      return
    }
    const data = res.data.data || {}
    const fromLevel = Number(data.from_level || overview.value?.profile?.current_level || 1)
    const toLevel = Number(data.to_level || fromLevel)

    uni.showToast({ title: data.message || '处理完成', icon: 'none' })
    if (data.overview) {
      overview.value = data.overview
    } else {
      await fetchOverview()
    }
    if (data.upgraded) {
      openUpgradeModal(fromLevel, toLevel)
    }
  } catch (e) {
    uni.showToast({ title: '网络异常，请稍后再试', icon: 'none' })
  } finally {
    upgrading.value = false
  }
}

function goBack() {
  const pages = getCurrentPages()
  if ((pages || []).length > 1) {
    uni.navigateBack()
    return
  }
  uni.switchTab({ url: '/pages/mine/mine' })
}

onPageScroll((e) => {
  scrollTop.value = e?.scrollTop || 0
})

onMounted(() => {
  fetchOverview()
})
</script>

<style scoped>
.level-page {
  min-height: 100vh;
  background: #ffffff;
  box-sizing: border-box;
}

.level-body {
  min-height: 100vh;
  padding-left: 18rpx;
  padding-right: 18rpx;
  padding-bottom: 18rpx;
  box-sizing: border-box;
}

.level-shell {
  min-height: calc(100vh - 36rpx - var(--header-pad));
  background: #ffffff;
  border-radius: 40rpx;
  border: none;
  box-sizing: border-box;
  padding: 30rpx 30rpx 40rpx;
}

.nav-back-pill {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: #f5f8ff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(93, 117, 149, 0.12);
}

.hero {
  margin-top: 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-wrap {
  width: 220rpx;
  height: 220rpx;
  border-radius: 50%;
  background: #eff4fb;
  padding: 14rpx;
  box-sizing: border-box;
  box-shadow: 0 8rpx 20rpx rgba(123, 140, 166, 0.15);
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.hero-level-row {
  margin-top: -14rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.lv-chip {
  background: linear-gradient(135deg, #f5b6cf 0%, #ea95bc 100%);
  border-radius: 999rpx;
  padding: 8rpx 26rpx;
  color: #ffffff;
  box-shadow: 0 8rpx 16rpx rgba(230, 143, 183, 0.33);
}

.lv-chip .font-title {
  font-size: 30rpx;
}

.hero-level-name {
  font-size: 24rpx;
  color: #8ea0b7;
  line-height: 1.2;
}

.hero-name {
  margin-top: 18rpx;
  font-size: 30rpx;
  color: #2d3a52;
  line-height: 1.18;
  text-align: center;
  max-width: 82%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.exp-card {
  margin-top: 30rpx;
  background: #fffefe;
  border-radius: 30rpx;
  padding: 26rpx;
  box-sizing: border-box;
}

.exp-row {
  display: flex;
  align-items: baseline;
  flex-wrap: nowrap;
}

.exp-current {
  font-size: 54rpx;
  color: #6a9ca3;
}

.exp-total {
  margin-left: 8rpx;
  font-size: 24rpx;
  color: #8f95a5;
}

.exp-percent {
  margin-left: auto;
  background: #91c7e7;
  color: #ffffff;
  border-radius: 999rpx;
  padding: 7rpx 22rpx;
  font-size: 24rpx;
}

.exp-track {
  margin-top: 18rpx;
  height: 30rpx;
  border-radius: 999rpx;
  background: #edf2fa;
  overflow: hidden;
  box-shadow: inset 0 0 0 2rpx rgba(114, 148, 201, 0.2);
}

.exp-fill {
  height: 100%;
  border-radius: 999rpx;
  position: relative;
  background: linear-gradient(90deg, #88b7ea 0%, #79abe4 100%);
  overflow: hidden;
}

.exp-tip {
  margin-top: 20rpx;
  font-size: 22rpx;
  color: #9aa0ae;
  text-align: center;
  background: #f5f7fb;
  border-radius: 999rpx;
  padding: 10rpx 16rpx;
}

.info-section {
  margin-top: 28rpx;
  background: #f8fbff;
  border-radius: 34rpx;
  padding: 14rpx;
}

.info-tabs {
  display: flex;
  align-items: center;
  gap: 10rpx;
  background: #edf4f9;
  border-radius: 999rpx;
  padding: 8rpx;
}

.info-tab {
  flex: 1;
  height: 70rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 25rpx;
  color: #91a2b6;
  background: transparent;
  transition: all 0.22s ease;
}

.info-tab-active {
  background: #ffffff;
  color: #31415a;
  box-shadow: 0 8rpx 18rpx rgba(73, 202, 238, 0.12);
}

.info-panel {
  margin-top: 18rpx;
}

.req-title-row {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.req-dot {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #ffe2b8;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12rpx;
}

.req-dot-blue {
  background: rgba(73, 202, 238, 0.14);
}

.req-title {
  font-size: 32rpx;
  color: #354258;
}

.req-item {
  background: #ffffff;
  border-radius: 34rpx;
  padding: 24rpx;
  margin-bottom: 18rpx;
  display: flex;
  align-items: center;
}

.req-item-1 {
  box-shadow: none;
}

.req-item-2 {
  box-shadow: none;
}

.req-icon-wrap {
  width: 98rpx;
  height: 98rpx;
  border-radius: 50%;
  background: #f1f4fa;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 18rpx;
  flex-shrink: 0;
}

.req-main {
  flex: 1;
  min-width: 0;
}

.req-main-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.req-label {
  font-size: 28rpx;
  color: #2f3d54;
}

.req-count {
  font-size: 26rpx;
  color: #9eb0c4;
}

.req-track {
  height: 22rpx;
  border-radius: 999rpx;
  background: #edf1f7;
  margin-top: 16rpx;
  overflow: hidden;
}

.req-fill {
  height: 100%;
  border-radius: 999rpx;
  position: relative;
  overflow: hidden;
}

.progress-stripe {
  position: absolute;
  inset: 0;
  background-size: 72rpx 72rpx;
  background-repeat: repeat;
  background-position: 0 0;
  opacity: 0.9;
  animation: progress-stripe-flow 1.15s linear infinite;
}

.progress-stripe-exp {
  background-image: repeating-linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.22) 0rpx,
    rgba(255, 255, 255, 0.22) 18rpx,
    rgba(255, 255, 255, 0.06) 18rpx,
    rgba(255, 255, 255, 0.06) 36rpx
  );
}

.req-desc {
  margin-top: 12rpx;
  display: block;
  font-size: 21rpx;
  color: #98a5b8;
}

.reward-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.reward-item {
  background: linear-gradient(180deg, #f8fcff 0%, #fdfefe 100%);
  border-radius: 34rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
}

.reward-media {
  width: 108rpx;
  height: 108rpx;
  border-radius: 28rpx;
  background: rgba(73, 202, 238, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 18rpx;
  flex-shrink: 0;
  overflow: hidden;
}

.reward-media-skin {
  background: rgba(251, 154, 194, 0.14);
}

.reward-media-points {
  background: rgba(242, 180, 95, 0.14);
}

.reward-skin-image {
  width: 100%;
  height: 100%;
}

.reward-main {
  flex: 1;
  min-width: 0;
}

.reward-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
}

.reward-label {
  font-size: 29rpx;
  color: #2f3d54;
}

.reward-value {
  font-size: 26rpx;
  color: #49caee;
  flex-shrink: 0;
}

.reward-desc {
  margin-top: 10rpx;
  display: block;
  font-size: 22rpx;
  line-height: 1.5;
  color: #8f9db1;
}

.reward-empty {
  background: #f7fbff;
  border-radius: 28rpx;
  padding: 28rpx 24rpx;
}

.reward-empty-text {
  font-size: 24rpx;
  line-height: 1.5;
  color: #96a6bb;
}

.max-card {
  margin-top: 28rpx;
  text-align: center;
  background: #ffffff;
  border-radius: 30rpx;
  padding: 30rpx 24rpx;
}

.max-title {
  font-size: 32rpx;
  color: #495b74;
}

.footer {
  margin-top: 18rpx;
}

.upgrade-btn {
  border-radius: 999rpx;
  height: 92rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  border: none;
}

.upgrade-btn::after {
  border: none;
}

.upgrade-btn-on {
  background: linear-gradient(135deg, #88bbe8 0%, #7ea9e2 100%);
  box-shadow: 0 10rpx 20rpx rgba(131, 166, 214, 0.3);
}

.upgrade-btn-off {
  background: #e9edf4;
}

.upgrade-text {
  font-size: 28rpx;
  color: #93a2b8;
}

.upgrade-btn-on .upgrade-text {
  color: #ffffff;
}

.unlock-tip {
  margin-top: 16rpx;
  display: block;
  text-align: center;
  font-size: 21rpx;
  color: #9aa6ba;
}

.debug-tip {
  margin-top: 10rpx;
  display: block;
  text-align: center;
  font-size: 20rpx;
  color: #c08daa;
}

.upgrade-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(34, 48, 72, 0.45);
  backdrop-filter: blur(2px);
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  box-sizing: border-box;
}

.confetti-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.confetti {
  position: absolute;
  top: -80rpx;
  border-radius: 6rpx;
  opacity: 0;
  animation-name: confetti-fall;
  animation-timing-function: ease-in;
  animation-fill-mode: forwards;
}

.upgrade-dialog {
  width: 100%;
  max-width: 640rpx;
  background: #ffffff;
  border-radius: 34rpx;
  padding: 38rpx 34rpx 28rpx;
  box-sizing: border-box;
  position: relative;
  z-index: 2;
}

.medal-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: -86rpx;
}

.medal-circle {
  width: 184rpx;
  height: 184rpx;
  border-radius: 50rpx;
  background: linear-gradient(180deg, #f6d66e 0%, #e6bf57 100%);
  box-shadow: 0 12rpx 28rpx rgba(230, 191, 87, 0.34);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.medal-level {
  font-size: 46rpx;
  color: #ffffff;
  line-height: 1;
}

.medal-level-text {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.92);
}

.medal-chip {
  margin-top: -12rpx;
  background: linear-gradient(135deg, #f56765 0%, #e65162 100%);
  color: #ffffff;
  padding: 10rpx 24rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  font-weight: 700;
  box-shadow: 0 6rpx 12rpx rgba(234, 92, 108, 0.35);
}

.dialog-title {
  margin-top: 18rpx;
  display: block;
  text-align: center;
  font-size: 42rpx;
  line-height: 1.2;
  color: #25364f;
}

.dialog-subtitle {
  margin-top: 12rpx;
  display: block;
  text-align: center;
  font-size: 30rpx;
  line-height: 1.25;
  color: #5fa0ea;
  font-weight: 700;
}

.dialog-desc {
  margin-top: 12rpx;
  display: block;
  text-align: center;
  font-size: 22rpx;
  line-height: 1.45;
  color: #8996ab;
}

.dialog-reward-list {
  margin-top: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.dialog-reward-item {
  background: #f7fbff;
  border-radius: 24rpx;
  padding: 18rpx 20rpx;
  display: flex;
  align-items: center;
}

.dialog-reward-icon {
  width: 70rpx;
  height: 70rpx;
  border-radius: 20rpx;
  background: rgba(73, 202, 238, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14rpx;
  overflow: hidden;
  flex-shrink: 0;
}

.dialog-reward-icon-skin {
  background: rgba(251, 154, 194, 0.14);
}

.dialog-reward-icon-points {
  background: rgba(242, 180, 95, 0.14);
}

.dialog-reward-image {
  width: 100%;
  height: 100%;
}

.dialog-reward-main {
  flex: 1;
  min-width: 0;
}

.dialog-reward-label {
  display: block;
  font-size: 24rpx;
  color: #2d3a52;
  font-weight: 700;
}

.dialog-reward-desc {
  margin-top: 6rpx;
  display: block;
  font-size: 21rpx;
  line-height: 1.45;
  color: #8a98ac;
}

.dialog-btn-primary,
.dialog-btn-secondary {
  margin-top: 18rpx;
  height: 84rpx;
  border-radius: 999rpx;
  border: none;
  font-size: 30rpx;
}

.dialog-btn-primary::after,
.dialog-btn-secondary::after {
  border: none;
}

.dialog-btn-primary {
  margin-top: 24rpx;
  background: linear-gradient(135deg, #5ea0e8 0%, #4f91df 100%);
  color: #ffffff;
  box-shadow: 0 8rpx 16rpx rgba(88, 151, 224, 0.28);
}

.dialog-btn-secondary {
  background: #f1f4fa;
  color: #6f7f95;
}

.dialog-close-btn {
  position: absolute;
  left: 50%;
  bottom: 72rpx;
  transform: translateX(-50%);
  width: 78rpx;
  height: 78rpx;
  border-radius: 50%;
  background: rgba(95, 110, 132, 0.72);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
}

@keyframes confetti-fall {
  0% {
    opacity: 0;
    top: -80rpx;
    transform: translate3d(0, 0, 0) rotate(var(--rotate-start));
  }
  8% {
    opacity: 1;
  }
  100% {
    opacity: 0.95;
    top: 112%;
    transform: translate3d(var(--drift), 0, 0) rotate(calc(var(--rotate-start) + 720deg));
  }
}

@keyframes progress-stripe-flow {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 72rpx 0;
  }
}
</style>
