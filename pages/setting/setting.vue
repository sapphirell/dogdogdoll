<template>
  <view-logs />
  <view class="settings-container">
    <!-- 隐藏挂载版本组件：仅用于“清空忽略期 + 主动检查” -->
    <view style="display:none">
      <version-check
        ref="versionCheckRef"
        :auto-check="false"
        :show-up-to-date-toast="false"
      />
    </view>

    <!-- 统一item结构 -->
    <view
      v-for="(item, index) in menuItems"
      :key="index"
      class="menu-item"
      @click="item.action(item)"
    >
      <text class="menu-label">{{ item.label }}</text>
      <view class="menu-value">
        <text :class="item.status ? 'active' : 'inactive'">{{ item.displayValue }}</text>
        <image class="arrow-icon" src="../../static/right.png" />
      </view>
    </view>

    <!-- 注销按钮区域 -->
    <view class="logout-section">
      <view
        class="logout-btn"
        @click="handleAccountDeletion"
        :style="{ backgroundColor: hasAppliedDeletion ? '#f56c6c' : '#cfcad8' }"
      >
        <text>{{ hasAppliedDeletion ? '取消注销申请' : '申请注销账号' }}</text>
      </view>
      <text v-if="hasAppliedDeletion" class="deletion-notice">
        已申请注销，30天后账号将正式注销。在此之前可以正常使用，并可随时取消注销申请。
      </text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import {
  websiteUrl,
  wechatSignLogin,
  getUserInfo,
  global,
  bindWechat,
  asyncGetUserInfo,
  dogdogdollVersion,
  getAppShellVersion,
} from "../../common/config.js";

uni.setNavigationBarTitle({ title: '设置' });

// ===== 本页新增：用于调用版本组件的方法 =====
const versionCheckRef = ref(null) // <version-check> 组件实例

const menuItems = computed(() => [
  {
    label: '更改用户名',
    action: jump2username,
    status: !!global.userInfo.password,
    displayValue: global.userInfo.password ? '去修改' : '未设置'
  },
  {
    label: '更改密码',
    action: jump2password,
    status: !!global.userInfo.password,
    displayValue: global.userInfo.password ? '去修改' : '未设置'
  },
  {
    label: '绑定手机号',
    action: jump2telphone,
    status: !!global.userInfo.tel_phone, // 修正字段名
    displayValue: global.userInfo.tel_phone
      ? global.userInfo.tel_phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
      : '去绑定'
  },
  {
    label: '绑定微信',
    action: jump2wechat,
    status: !!global.userInfo.wechat_open_id,
    displayValue: global.userInfo.wechat_open_id ? '已绑定' : '去绑定'
  },
  {
    label: '检查更新',
    action: checkUpdate, // 点击时会触发“清空忽略期 + 主动检查”
    status: !!(newVersionInfo.value && newVersionInfo.value.version), // 有新版本时高亮显示
    displayValue: updateStatusText.value
  }
])

// 用户信息
let userInfo = ref({})
// 新版本
let newVersionInfo = ref({})
// 注销申请状态
const hasAppliedDeletion = ref(false)
// 是否需要更新（保留）
let needUpdate = ref(false)
// 更新状态文本（用于右侧文案）
const updateStatusText = ref('检查更新')
// 点击次数（保留你的逻辑）
let click = ref(0)

// 跳转：密码设置
function jump2password() {
  uni.navigateTo({ url: '/pages/setting/password/password' })
}
// 跳转：手机号设置
function jump2telphone() {
  uni.navigateTo({ url: '/pages/setting/tel_phone/tel_phone' })
}
// 跳转：修改用户名
function jump2username() {
  uni.navigateTo({ url: '/pages/setting/username/username' })
}

// 绑定微信
function jump2wechat() {
  if (global.userInfo.wechat_open_id) {
    uni.showToast({ title: '已绑定微信', icon: 'none' })
  } else {
    // 添加实际绑定逻辑
    bindWechat()
      .then(() => {
        console.log('微信绑定成功');
        uni.showToast({ title: '微信绑定成功', icon: 'none' })
      })
      .catch(err => {
        console.error('微信绑定失败:', err);
        uni.showToast({ title: '微信绑定失败', icon: 'none' })
      });
  }
}

/**
 * 检查更新
 * 交互规则更新：
 *  - 若由“点击菜单项”触发：先清空忽略期 -> 调用版本组件的 checkVersion()（会弹窗/静默热更）
 *  - 若非点击（例如 onMounted 自动检查）：只做轻量查询，不清忽略期，仅用于右侧文案展示
 */
const checkUpdate = async (...args) => {
  const userTriggered = args && args.length > 0 // 有入参表示来自点击
  click.value++

  if (userTriggered) {
    console.log('[Settings] 主动检查更新：准备清空忽略期并触发 version-check')
    updateStatusText.value = '检查中...'
    try {
      // 1) 清空忽略期（使用版本组件暴露的调试方法）
      versionCheckRef.value?.debugClearIgnore?.()
      uni.showToast({ title: '忽略期已清空，开始检查', icon: 'none' })

      // 2) 触发版本组件的检查（可能弹出壳更新弹窗，或静默执行 wgt）
      await nextTick()
      if (versionCheckRef.value?.checkVersion) {
        versionCheckRef.value.checkVersion()
      } else {
        console.warn('[Settings] version-check 组件未就绪，走回退查询')
        await lightweightQueryForDisplay()
      }
    } catch (e) {
      console.error('[Settings] 主动检查更新失败：', e)
      await lightweightQueryForDisplay() // 回退旧接口用于展示文案
    } finally {
      // 3) 若 5 秒内没有被弹窗打断，就把文案复位为“检查更新”
      setTimeout(() => {
        if (updateStatusText.value === '检查中...') {
          updateStatusText.value = '检查更新'
        }
      }, 5000)
    }
    return
  }

  // 非用户点击（如 onMounted），只做轻量展示，不清忽略期、不触发弹窗
  await lightweightQueryForDisplay()
}

/**
 * 轻量查询（旧接口 /latest-version?version=）：
 * 仅用于右侧展示“有新版本/已是最新”，不改变忽略期、不触发安装。
 * 保留你原有的代码路径，避免影响之前逻辑。
 */
async function lightweightQueryForDisplay() {
  try {
    const currentVersion = (typeof getAppShellVersion === 'function' ? getAppShellVersion() : '') || dogdogdollVersion
    const res = await uni.request({
      url: `${websiteUrl.value}/latest-version?version=${encodeURIComponent(currentVersion)}`,
      method: 'GET'
    })
    if (res && res.data) {
      if (res.data.status === 'success' && res.data.data) {
        // 有新版本
        const info = res.data.data || {}
        updateStatusText.value = `有新版本: ${info.version || '-'}`
        newVersionInfo.value = info
      } else {
        updateStatusText.value = '已是最新'
        newVersionInfo.value = {}
        // 连点第二次才提示（保留你的原逻辑）
        if (click.value > 1) {
          uni.showToast({ title: '当前已是最新版本', icon: 'none' })
        }
      }
    }
  } catch (err) {
    console.error('[Settings] 轻量查询失败：', err)
    uni.showToast({ title: '检查失败，请稍后重试', icon: 'none' })
  }
}

// 注销账号处理函数
async function handleAccountDeletion() {
  if (hasAppliedDeletion.value) {
    // 取消注销
    uni.showModal({
      title: '取消注销申请',
      content: '确定要取消账号注销申请吗？',
      success: async (res) => {
        if (res.confirm) {
          await cancelAccountDeletion()
        }
      }
    })
  } else {
    // 申请注销
    uni.showModal({
      title: '申请注销账号',
      content: '确定要申请注销账号吗？注销后账号将不可恢复！',
      confirmText: '确认注销',
      confirmColor: '#f56c6c',
      success: async (res) => {
        if (res.confirm) {
          await applyForAccountDeletion()
        }
      }
    })
  }
}

// 申请注销账号
async function applyForAccountDeletion() {
  const token = uni.getStorageSync('token');
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }

  uni.showLoading({ title: '处理中...', mask: true })

  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/apply-delete`,
      method: 'POST',
      header: { 'Authorization': token }
    })

    uni.hideLoading()

    if (res.data.status === "success") {
      // 更新注销状态
      hasAppliedDeletion.value = true
      // 更新全局用户信息
      global.userInfo.deleteApplyAt = Math.floor(Date.now() / 1000)

      uni.showToast({ title: '已申请注销账号', icon: 'success', duration: 3000 })

      // 显示注销提示信息
      setTimeout(() => {
        uni.showModal({
          title: '注销申请已提交',
          content: '您的账号将在30天后正式注销。在此期间您可以正常使用所有功能，并可随时取消注销申请。',
          showCancel: false,
          confirmText: '知道了'
        })
      }, 1000)
    } else {
      throw new Error(res.data.msg || '申请注销失败')
    }
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: error.message || '操作失败，请稍后重试',
      icon: 'none',
      duration: 3000
    })
  }
}

// 取消注销申请
async function cancelAccountDeletion() {
  const token = uni.getStorageSync('token');
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }

  uni.showLoading({ title: '处理中...', mask: true })

  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/cancel-delete`,
      method: 'POST',
      header: { 'Authorization': token }
    })

    uni.hideLoading()

    if (res.data.status === "success") {
      // 更新注销状态
      hasAppliedDeletion.value = false
      // 更新全局用户信息
      global.userInfo.deleteApplyAt = 0

      uni.showToast({ title: '已取消注销申请', icon: 'success', duration: 3000 })
    } else {
      throw new Error(res.data.msg || '取消注销失败')
    }
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: error.message || '操作失败，请稍后重试',
      icon: 'none',
      duration: 3000
    })
  }
}

// 初始化时检查注销状态 + 轻量查询更新状态（不清忽略期）
onMounted(() => {
  asyncGetUserInfo().then((user) => {
    // 检查用户是否已申请注销
    hasAppliedDeletion.value = user?.delete_apply_at > 0
  })
  // 仅用于右侧文案展示；不清忽略期，不触发弹窗
  checkUpdate()
})
</script>

<style lang="less" scoped>
@primary-color: #4cbbd0;
@text-color: #333;
@secondary-text: #666;
@border-color: #eee;
@warning-color: #ff9a2e;
@danger-color: #f56c6c;

.settings-container {
  padding: 24rpx;
  background: #f8f8f8;
  min-height: 100vh;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  margin-bottom: 24rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;

  &:active {
    background: #fafafa;
    transform: scale(0.98);
  }
}

.menu-label {
  font-size: 30rpx;
  color: @text-color;
  font-weight: 500;
}

.menu-value {
  display: flex;
  align-items: center;
  gap: 16rpx;

  text {
    font-size: 28rpx;

    &.active {
      color: @primary-color;
    }

    &.inactive {
      color: @secondary-text;
    }
  }
}

.arrow-icon {
  width: 36rpx;
  height: 36rpx;
  opacity: 0.6;
}

/* 注销区域优化 */
.logout-section {
  margin-top: 60rpx;
  padding: 0 12rpx;
}

.logout-btn {
  padding: 28rpx;
  border-radius: 16rpx;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.12);
  position: relative;
  overflow: hidden;

  text {
    color: #fff;
  }
}

.logout-btn::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -60%;
  width: 40rpx;
  height: 200%;
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(25deg);
  transition: all 0.6s;
}

.logout-btn:active {
  transform: scale(0.96);
}

.logout-btn:active::after {
  left: 120%;
}

.btn-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.5rpx;
  position: relative;
  z-index: 1;
}

.deletion-notice {
  display: block;
  margin-top: 30rpx;
  padding: 24rpx;
  background: #fff8e6;
  border-radius: 16rpx;
  font-size: 26rpx;
  color: #e6a23c;
  line-height: 1.6;
  border-left: 6rpx solid #ffd43b;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

/* 统一按钮样式重置 */
button {
  background: transparent;
  padding: 0;
  margin: 0;
  line-height: 1;
  border-radius: 0;

  &::after {
    border: none;
  }
}
</style>
