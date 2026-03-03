<template>
  <view class="level-page">
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

        <view class="hero">
          <view class="avatar-wrap">
            <image class="avatar-img" mode="aspectFill" :src="global.userInfo.avatar || defaultAvatar" />
          </view>
          <view class="lv-chip">
            <text class="font-title">Lv{{ overview?.profile?.current_level || 1 }}</text>
          </view>

          <text class="hero-name font-alimamashuhei">{{ global.userInfo.username || '探索者' }}</text>
          <view class="hero-tag">
            <text class="hero-tag-text">✨ 探索大师 ✨</text>
          </view>
        </view>

        <view v-if="overview?.next_rule" class="exp-card">
          <view class="exp-row">
            <text class="exp-current font-title">{{ expCurrent }}</text>
            <text class="exp-total">/1000 经验值</text>
            <text class="exp-percent font-title">{{ expPercent }}%</text>
          </view>
          <view class="exp-track">
            <view class="exp-fill" :style="{ width: `${expPercent}%` }" />
          </view>
          <view class="exp-tip">
            <text>距离 </text>
            <text class="font-title">Lv{{ overview.next_rule.level }}</text>
            <text> 还需 {{ expRemain }} 经验值</text>
          </view>
        </view>

        <view v-if="overview?.next_rule" class="req-section">
          <view class="req-title-row">
            <view class="req-dot">
              <uni-icons type="star-filled" size="13" color="#f2a146" />
            </view>
            <text class="req-title font-alimamashuhei">下一等级要求</text>
          </view>

          <view
            v-for="(item, idx) in normalizedProgress"
            :key="idx"
            class="req-item"
            :class="[`req-item-${idx % 3}`]"
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
                <view class="req-fill" :style="{ width: `${item.percent}%`, background: item.fillBg }" />
              </view>
              <text class="req-desc">{{ item.desc }}</text>
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
            <uni-icons type="trophy-filled" size="48" color="#ffffff" />
          </view>
          <view class="medal-chip">LEVEL UP!</view>
        </view>

        <text class="dialog-title font-alimamashuhei">恭喜升级！</text>
        <text class="dialog-subtitle">您已达到 Lv.{{ upgradeResult.toLevel }}</text>
        <text class="dialog-desc">解锁更多专属特权，享受会员礼遇</text>

        <view class="perk-row">
          <view class="perk-item">
            <view class="perk-icon perk-icon-blue"><uni-icons type="star-filled" size="20" color="#5ea7f1" /></view>
            <text class="perk-text">双倍积分</text>
          </view>
          <view class="perk-item">
            <view class="perk-icon perk-icon-purple"><uni-icons type="gift-filled" size="20" color="#aa78ff" /></view>
            <text class="perk-text">神秘礼盒</text>
          </view>
          <view class="perk-item">
            <view class="perk-icon perk-icon-orange"><uni-icons type="paperplane-filled" size="20" color="#ee9d4f" /></view>
            <text class="perk-text">免邮特权</text>
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
const scrollTop = ref(0)
const headerPadPx = computed(() => toPx(getStatusBarHeight() + getNavBarHeight()))

const iconMap = {
  login_days: { icon: 'calendar', color: '#86c2ea', fill: 'linear-gradient(90deg, #91c8eb 0%, #78bae7 100%)', desc: '累计登录天数' },
  showcase_public_count: { icon: 'image', color: '#8fb5f4', fill: 'linear-gradient(90deg, #91bbff 0%, #7fa7f5 100%)', desc: '发布并公开展示柜' },
  reply_count: { icon: 'chatboxes-filled', color: '#e8a3c0', fill: 'linear-gradient(90deg, #efb6ca 0%, #e39cb9 100%)', desc: '完成有效回复' },
  post_count: { icon: 'compose', color: '#e5a6a6', fill: 'linear-gradient(90deg, #f0b8b8 0%, #eaa5a5 100%)', desc: '发布内容数量' },
  completed_order_count: { icon: 'checkmarkempty', color: '#e6aa63', fill: 'linear-gradient(90deg, #efbc77 0%, #e3a45c 100%)', desc: '完成订单数量' },
  received_like_count: { icon: 'heart-filled', color: '#e99ab6', fill: 'linear-gradient(90deg, #f2b1c9 0%, #e88eaf 100%)', desc: '累计获得点赞' }
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
  uni.showToast({ title: '特权页开发中', icon: 'none' })
  closeUpgradeModal()
}

async function fetchOverview() {
  const token = uni.getStorageSync('token')
  if (!token) {
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

.lv-chip {
  margin-top: -16rpx;
  margin-left: 150rpx;
  background: linear-gradient(135deg, #f5b6cf 0%, #ea95bc 100%);
  border-radius: 999rpx;
  padding: 8rpx 26rpx;
  transform: rotate(-6deg);
  color: #ffffff;
  box-shadow: 0 8rpx 16rpx rgba(230, 143, 183, 0.33);
}

.lv-chip .font-title {
  font-size: 30rpx;
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

.hero-tag {
  margin-top: 14rpx;
  background: #f9fcff;
  border-radius: 999rpx;
  padding: 12rpx 34rpx;
  box-shadow: 0 4rpx 12rpx rgba(132, 147, 173, 0.1);
}

.hero-tag-text {
  font-size: 24rpx;
  color: #7aa4bb;
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
  background: repeating-linear-gradient(
    135deg,
    #82b5ea 0rpx,
    #82b5ea 16rpx,
    #7eaee2 16rpx,
    #7eaee2 30rpx
  );
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

.req-section {
  margin-top: 28rpx;
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

.req-title {
  font-size: 32rpx;
  color: #354258;
}

.req-item {
  background: #fffefe;
  border-radius: 34rpx;
  padding: 24rpx;
  margin-bottom: 18rpx;
  display: flex;
  align-items: center;
}

.req-item-1 {
  box-shadow: inset 0 0 0 2rpx #f8dfe8;
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
}

.req-desc {
  margin-top: 12rpx;
  display: block;
  font-size: 21rpx;
  color: #98a5b8;
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
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: #f2cb53;
  border: 8rpx solid #ffffff;
  box-shadow: 0 10rpx 24rpx rgba(242, 203, 83, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
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

.perk-row {
  margin-top: 22rpx;
  display: flex;
  justify-content: space-between;
  gap: 12rpx;
}

.perk-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.perk-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.perk-icon-blue { background: #ecf4ff; }
.perk-icon-purple { background: #f2edff; }
.perk-icon-orange { background: #fff2e5; }

.perk-text {
  margin-top: 8rpx;
  font-size: 21rpx;
  color: #68788f;
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
</style>
