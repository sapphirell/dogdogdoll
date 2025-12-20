<!-- received-detail -->
<template>
  <view-logs />
  <view class="submission-page">


    <!-- 主体内容 -->
    <scroll-view
      class="scroll-body"
      scroll-y
      :show-scrollbar="false"
    >
      <!-- 加载中 -->
      <view v-if="loading" class="state-box">
        <text class="state-title">加载中…</text>
        <text class="state-desc">正在获取投递详情</text>
      </view>

      <!-- 加载失败或无数据 -->
      <view v-else-if="!queueInfo">
        <view class="state-box state-error">
          <text class="state-title">获取失败</text>
          <text class="state-desc">{{ errorMsg || '暂时无法获取投递信息' }}</text>
          <button class="btn-retry" @tap="reload">重试</button>
        </view>
      </view>

      <!-- 正常展示 -->
      <view v-else class="content">
        <!-- 顶部状态卡片 -->
        <view class="card status-card">
          <view class="status-row">
            <view class="status-chip" :class="'s-' + queueInfo.status">
              <text class="status-text">{{ queueInfo.status_text || '未知状态' }}</text>
            </view>
            <text class="status-mode" v-if="queueInfo.mode === 1">模式：普通队列</text>
            <text class="status-mode" v-else-if="queueInfo.mode === 2">模式：手速队列</text>
          </view>

          <view class="status-row">
            <text class="status-label">排队位置</text>
            <text class="status-value">
              <!-- ahead_count 是“前面还有几人”，如果你后端未来返回 index 可以改用 index -->
              <text v-if="queueInfo.ahead_count > 0">
                前面还有 {{ queueInfo.ahead_count }} 位投递
              </text>
              <text v-else-if="queueInfo.status === 0">当前在首位 / 未统计</text>
              <text v-else>当前不在排队队列</text>
            </text>
          </view>

          <view class="status-row">
            <text class="status-label">本次投递 ID</text>
            <text class="status-value">#{{ queueInfo.submission_id }}</text>
          </view>

          <view class="status-row">
            <text class="status-label">接单计划 ID</text>
            <text class="status-value">#{{ queueInfo.plan_id }}</text>
          </view>

          <view class="status-row" v-if="queueInfo.premium_queue_status">
            <text class="status-label">钞队列</text>
            <text class="status-value">
              {{ queueInfo.premium_queue_status === 1 ? '已开启' : '未开启' }}
            </text>
          </view>

          <!-- 顶部操作：与卖家发起会话 / 确认订单 -->
          <view class="status-actions">
            <button
              class="btn-primary"
              @tap="handleChatWithSeller"
            >
              {{ isBuyer ? '与卖家发起会话' : '与买家发起会话' }}
            </button>

            <button
              v-if="queueInfo.status === 2"
              class="btn-secondary"
              @tap="handleConfirmSubmission"
            >
              确认订单（状态 2 → 3）
            </button>
          </view>
        </view>

        <!-- 子项列表 -->
        <view class="card items-card">
          <view class="card-header">
            <text class="card-title">作品列表（{{ items.length }}）</text>
          </view>

          <view
            v-if="!items.length"
            class="state-box"
            style="margin-top: 0;"
          >
            <text class="state-title">还没有作品</text>
            <text class="state-desc">可以稍后再为本次投递添加作品</text>
          </view>

          <view
            v-for="item in items"
            :key="item.id"
            class="item-row"
          >
            <view class="item-main">
              <!-- 左侧封面 -->
              <view class="item-cover-wrap" v-if="getFirstImage(item)">
                <image
                  class="item-cover"
                  :src="getFirstImage(item)"
                  mode="aspectFill"
                />
              </view>

              <view class="item-body">
                <view class="item-title-row">
                  <text class="item-title">
                    {{ (item.work_subject || '').trim() || '未命名作品' }}
                  </text>
                </view>

                <view class="item-meta-row">
                  <text v-if="item.size" class="item-meta">尺寸：{{ item.size }}</text>
                  <text v-if="item.tier_title" class="item-meta">档位：{{ item.tier_title }}</text>
                  <text v-if="getAddonsTitles(item)" class="item-meta">
                    加购：{{ getAddonsTitles(item) }}
                  </text>
                </view>

                <view class="item-meta-row">
                  <text class="item-meta">
                    子单状态：{{ formatItemStatus(item.status) }}
                  </text>
                </view>

                <view class="item-meta-row">
                  <text class="item-meta">
                    当前金额：¥ {{ formatPrice(calcItemTotal(item)) }}
                  </text>
                  <text v-if="Number(item.adjust_price) !== 0" class="item-meta adjust">
                    调价差额：{{ item.adjust_price > 0 ? '+' : '' }}{{ formatPrice(item.adjust_price) }}
                  </text>
                </view>
              </view>
            </view>

            <!-- 子项操作按钮 -->
            <view class="item-actions">
              <button
                class="btn-mini"
                @tap="openChangePricePanel(item)"
              >
                修改金额
              </button>
              <button
                class="btn-mini outline"
                @tap="goStepEditor(item)"
              >
                提交节点状态
              </button>
            </view>
          </view>
        </view>

        <!-- 草稿子项（如果有） -->
        <view
          v-if="draftItems.length"
          class="card draft-card"
        >
          <view class="card-header">
            <text class="card-title">草稿作品（未挂到投递）</text>
          </view>

          <view
            v-for="d in draftItems"
            :key="d.id"
            class="item-row draft-item"
          >
            <view class="item-main">
              <view class="item-body">
                <text class="item-title">
                  {{ (d.work_subject || '').trim() || '未命名作品' }}
                </text>
                <view class="item-meta-row">
                  <text v-if="d.size" class="item-meta">尺寸：{{ d.size }}</text>
                  <text v-if="d.tier_title" class="item-meta">档位：{{ d.tier_title }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 底部安全区占位 -->
        <view :style="{ height: footerPlaceholderHeight }"></view>
      </view>
    </scroll-view>

    <!-- 底部固定操作区（可选） -->
    <view class="bottom-bar" :style="{ paddingBottom: footerPadding }">
      <button class="bottom-btn" @tap="handleChatWithSeller">
        {{ isBuyer ? '与卖家发起会话' : '与买家发起会话' }}
      </button>
    </view>

    <!-- 修改金额弹层 -->
    <uni-popup
      ref="pricePopupRef"
      type="bottom"
      :mask-click="true"
      @change="onPricePopupChange"
    >
      <view class="price-sheet" :style="{ paddingBottom: footerPadding }">
        <view class="price-header">
          <text class="price-title">修改金额</text>
          <text class="price-close" @tap="closePricePanel">关闭</text>
        </view>

        <view class="price-body" v-if="editingItem">
          <view class="price-row">
            <text class="price-label">作品</text>
            <text class="price-value">
              {{ (editingItem.work_subject || '').trim() || '未命名作品' }}
            </text>
          </view>

          <view class="price-row">
            <text class="price-label">当前金额</text>
            <text class="price-value">
              ¥ {{ formatPrice(calcItemTotal(editingItem)) }}
            </text>
          </view>

          <view class="price-row">
            <text class="price-label">新总金额</text>
            <input
              type="digit"
              class="price-input"
              v-model="priceInput"
              placeholder="请输入新的总金额（整数或小数）"
            />
          </view>

          <view class="price-row-column">
            <text class="price-label">调价说明（选填）</text>
            <textarea
              class="price-textarea"
              v-model="reasonInput"
              placeholder="该说明会发送给对方，建议简单说明调价原因"
              auto-height
              maxlength="200"
            />
          </view>
        </view>

        <view class="price-footer">
          <button class="price-btn" @tap="submitChangePrice">
            提交修改金额
          </button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import {
  websiteUrl,
  global,
  initLoginState,
  getFooterPlaceholderHeight,
  getSafeBottom,
  toPx,
} from '@/common/config.js'

// ================== 响应式状态 ==================

const loading = ref(true)
const errorMsg = ref('')

const submissionId = ref(0)
const queueInfo = ref(null) // 后端返回的 data
const items = computed(() => (queueInfo.value?.items || []))
const draftItems = computed(() => (queueInfo.value?.draft_items || []))

// 当前登录用户 ID（从 config.global 中取）
const currentUid = computed(() => {
  const u = global.userInfo || {}
  return u.id || u.Id || 0
})

// 推测当前视角（非常粗暴的推断）
// 若第一个 item 的 user_id == 当前 uid，则认为是“买家视角”
// 否则认为是“卖家视角”
const isBuyer = computed(() => {
  const list = items.value
  if (!list.length || !currentUid.value) return true
  const first = list[0]
  const uid = first.user_id || first.userId
  return Number(uid) === Number(currentUid.value)
})

// 底部安全区
const footerPlaceholderHeight = computed(() => {
  return toPx(getFooterPlaceholderHeight())
})
const footerPadding = computed(() => {
  return toPx(getSafeBottom())
})

// 修改金额弹层
const pricePopupRef = ref(null)
const editingItem = ref(null)
const priceInput = ref('')
const reasonInput = ref('')

// ================== 工具函数 ==================

function handleBack() {
  uni.navigateBack({
    delta: 1,
  })
}

function getFirstImage(item) {
  const src = item.ref_images || item.refImages
  if (!src) return ''
  const arr = String(src)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return arr[0] || ''
}

function parseAddons(addonsJson) {
  if (!addonsJson) return []
  try {
    const v = JSON.parse(addonsJson)
    if (Array.isArray(v)) return v
    return []
  } catch (e) {
    console.warn('[submission-queue] parseAddons failed', e)
    return []
  }
}

function getAddonsTitles(item) {
  const addonsJson = item.addons_json || item.addonsJson || ''
  const addons = parseAddons(addonsJson)
  if (!addons.length) return ''
  return addons
    .map((a) => (a.title || a.Title || '').trim())
    .filter(Boolean)
    .join(' / ')
}

function calcItemTotal(item) {
  const base = Number(item.price_total || 0)
  const adjust = Number(item.adjust_price || 0)
  const addonsPrice = Number(item.addons_price || 0)
  const surchargePrice = Number(item.surcharge_price || 0)
  const b = Number.isFinite(base) ? base : 0
  const a = Number.isFinite(adjust) ? adjust : 0
  const ad = Number.isFinite(addonsPrice) ? addonsPrice : 0
  const s = Number.isFinite(surchargePrice) ? surchargePrice : 0
  // 这里假定 price_total 已经包含 addons + surcharge，如果后端设计不同可调整
  return b + a
}

function formatPrice(v) {
  const n = Number(v || 0)
  if (!Number.isFinite(n)) return '0.00'
  return n.toFixed(2)
}

function formatItemStatus(st) {
  const s = Number(st)
  switch (s) {
    case 0:
      return '待处理/排队中'
    case 1:
      return '已抢到，待确认'
    case 2:
      return '等待妆师/毛娘确认'
    case 3:
      return '待付款'
    case 4:
      return '已下单/进行中'
    case 5:
      return '未中选'
    case 6:
      return '已放弃/取消'
    case 7:
      return '保留过期'
    default:
      return '未知'
  }
}

// ================== 登录 & 请求 ==================

async function ensureLogin() {
  await initLoginState()
  const token = uni.getStorageSync('token')
  if (!token) {
    uni.showToast({
      title: '请先登录',
      icon: 'none',
    })
    return false
  }
  return true
}

async function fetchQueueInfo() {
  const ok = await ensureLogin()
  if (!ok) {
    loading.value = false
    errorMsg.value = '未登录'
    return
  }

  const token = uni.getStorageSync('token') || ''
  if (!submissionId.value) {
    loading.value = false
    errorMsg.value = '缺少 submission_id'
    return
  }

  loading.value = true
  errorMsg.value = ''

  console.log(
    '[submission-queue] 请求排队信息',
    `${websiteUrl.value}/with-state/artist-order/submission/queue-info`,
    'submission_id=',
    submissionId.value
  )

  uni.request({
    url: `${websiteUrl.value}/with-state/artist-order/submission/queue-info`,
    method: 'GET',
    header: {
      Authorization: token,
    },
    data: {
      submission_id: submissionId.value,
    },
    success: (res) => {
      console.log('[submission-queue] 接口返回', res.data)
      const body = res.data || {}
      if (body.status !== 'success') {
        errorMsg.value = body.msg || '获取排队信息失败'
        queueInfo.value = null
        return
      }
      queueInfo.value = body.data || null
    },
    fail: (err) => {
      console.error('[submission-queue] 请求失败', err)
      errorMsg.value = '网络错误，请稍后重试'
      queueInfo.value = null
    },
    complete: () => {
      loading.value = false
    },
  })
}

function reload() {
  fetchQueueInfo()
}

// ================== 功能 1：与卖家发起会话 ==================

/**
 * 获取聊天对方的 UID
 * - 若当前是买家视角：对方为品牌/创作者（通过 brand-info 拿 owner uid，假设字段为 user_id）
 * - 若当前是卖家视角：对方为买家（取 item.user_id）
 */
function resolvePeerId() {
  const list = items.value
  if (!list.length) {
    uni.showToast({
      title: '暂无作品，无法发起会话',
      icon: 'none',
    })
    return null
  }
  const first = list[0]
  const buyerUid = first.user_id || first.userId || 0
  const brandId = first.brand_id || first.brandId || 0

  // 卖家视角：对方是买家
  if (!isBuyer.value) {
    if (!buyerUid) {
      uni.showToast({
        title: '找不到买家ID',
        icon: 'none',
      })
      return null
    }
    return buyerUid
  }

  // 买家视角：对方是卖家（品牌 owner）
  if (!brandId) {
    uni.showToast({
      title: '缺少品牌信息，暂无法发起对话',
      icon: 'none',
    })
    return null
  }

  // 通过 /brand-info 拿 owner uid（此处假设后端返回 data.user_id）
  return new Promise((resolve) => {
    uni.request({
      url: `${websiteUrl.value}/brand-info`,
      method: 'GET',
      data: {
        id: brandId,
      },
      success: (res) => {
        console.log('[submission-queue] /brand-info 返回', res.data)
        const body = res.data || {}
        const data = body.data || {}
        const ownerUid = data.user_id || data.userId || 0
        if (!ownerUid) {
          uni.showToast({
            title: '未配置品牌账号，暂无法发起对话',
            icon: 'none',
          })
          resolve(null)
        } else {
          resolve(ownerUid)
        }
      },
      fail: (err) => {
        console.error('[submission-queue] /brand-info 请求失败', err)
        uni.showToast({
          title: '获取品牌信息失败',
          icon: 'none',
        })
        resolve(null)
      },
    })
  })
}

async function handleChatWithSeller() {
  if (!queueInfo.value) {
    uni.showToast({
      title: '还未加载完成',
      icon: 'none',
    })
    return
  }

  const ok = await ensureLogin()
  if (!ok) return

  const peer = await resolvePeerId()
  if (!peer) return

  console.log('[submission-queue] 发起会话 peer_id =', peer)

  // 直接跳转 IM 聊天页面，内部会调用 /with-state/im/start-session
  uni.navigateTo({
    url: `/pkg-im/chat/chat?peer_id=${peer}`,
  })
}

// ================== 功能 2：修改金额（针对 item） ==================

function openChangePricePanel(item) {
  editingItem.value = item
  // 默认填入当前金额
  priceInput.value = String(calcItemTotal(item))
  reasonInput.value = ''
  nextTickOpenPricePopup()
}

function nextTickOpenPricePopup() {
  // uni-popup 有时需要 nextTick，这里直接 try 一下
  setTimeout(() => {
    try {
      pricePopupRef.value?.open?.()
    } catch (e) {
      console.warn('[submission-queue] 打开 price popup 异常', e)
    }
  }, 0)
}

function closePricePanel() {
  try {
    pricePopupRef.value?.close?.()
  } catch (e) {
    console.warn('[submission-queue] 关闭 price popup 异常', e)
  }
}

function onPricePopupChange(e) {
  console.log('[submission-queue] price popup change', e)
  if (!e.show) {
    // 关闭时清理上下文
    editingItem.value = null
    priceInput.value = ''
    reasonInput.value = ''
  }
}

function submitChangePrice() {
  if (!editingItem.value) {
    uni.showToast({
      title: '未选择作品',
      icon: 'none',
    })
    return
  }

  const raw = priceInput.value.trim()
  const n = Number(raw)
  if (!raw || Number.isNaN(n) || n <= 0) {
    uni.showToast({
      title: '请填写正确的金额',
      icon: 'none',
    })
    return
  }

  ensureLogin().then((ok) => {
    if (!ok) return
    const token = uni.getStorageSync('token') || ''
    const payload = {
      item_id: editingItem.value.id || editingItem.value.ID,
      new_price: n,
      reason: reasonInput.value.trim(),
    }

    console.log('[submission-queue] 修改金额请求体', payload)

    uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/item/change-price`,
      method: 'POST',
      header: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      data: payload,
      success: (res) => {
        console.log('[submission-queue] 修改金额返回', res.data)
        const body = res.data || {}
        if (body.status !== 'success') {
          uni.showToast({
            title: body.msg || '修改金额失败',
            icon: 'none',
          })
          return
        }
        uni.showToast({
          title: '修改金额成功',
          icon: 'success',
        })
        closePricePanel()
        // 重新拉一次详情，保证金额一致
        fetchQueueInfo()
      },
      fail: (err) => {
        console.error('[submission-queue] 修改金额请求失败', err)
        uni.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none',
        })
      },
    })
  })
}

// ================== 功能 3：确认订单（状态 2 → 3） ==================

function handleConfirmSubmission() {
  if (!queueInfo.value) return
  if (queueInfo.value.status !== 2) {
    uni.showToast({
      title: '当前状态不需要确认',
      icon: 'none',
    })
    return
  }

  uni.showModal({
    title: '确认订单',
    content: '确认后将进入待付款状态，是否继续？',
    confirmText: '确认订单',
    cancelText: '再想想',
    success: (res) => {
      if (!res.confirm) return
      doConfirmSubmission()
    },
  })
}

// 这里假设后端会实现：POST /with-state/artist-order/submission/confirm
// Body: { submission_id: xxx }
function doConfirmSubmission() {
  ensureLogin().then((ok) => {
    if (!ok) return
    const token = uni.getStorageSync('token') || ''
    const payload = {
      submission_id: submissionId.value,
    }

    console.log('[submission-queue] 确认订单请求', payload)

    uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/submission/confirm`,
      method: 'POST',
      header: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      data: payload,
      success: (res) => {
        console.log('[submission-queue] 确认订单返回', res.data)
        const body = res.data || {}
        if (body.status !== 'success') {
          uni.showToast({
            title: body.msg || '确认订单失败',
            icon: 'none',
          })
          return
        }
        uni.showToast({
          title: '订单已确认',
          icon: 'success',
        })
        fetchQueueInfo()
      },
      fail: (err) => {
        console.error('[submission-queue] 确认订单请求失败', err)
        uni.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none',
        })
      },
    })
  })
}

// ================== 功能 4：提交节点状态 ==================

function goStepEditor(item) {
  const itemId = item.id || item.ID
  if (!itemId) {
    uni.showToast({
      title: '缺少子项ID',
      icon: 'none',
    })
    return
  }
  // 这里跳到你准备做节点编辑的页面路由
  // 例如：/pages/artist-order/step-editor?item_id=xxx
  uni.navigateTo({
    url: `/pages/artist-order/step-editor?item_id=${itemId}`,
  })
}

// ================== 生命周期 ==================

onLoad((options) => {
  console.log('[submission-queue] onLoad options=', options)
  const sid = Number(options?.submission_id || options?.submissionId || 0)
  if (!Number.isNaN(sid) && sid > 0) {
    submissionId.value = sid
  }

  if (!submissionId.value) {
    loading.value = false
    errorMsg.value = '缺少 submission_id 参数'
    return
  }

  fetchQueueInfo()
})
</script>

<style lang="scss" scoped>
.submission-page {
  min-height: 100vh;
  background-color: #f6f6f8;
  display: flex;
  flex-direction: column;
}

/* 顶部导航 */
.nav-bar {
  height: 88rpx;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  z-index: 10;
}
.nav-left {
  display: flex;
  align-items: center;
}
.nav-back-icon {
  font-size: 40rpx;
  margin-right: 4rpx;
}
.nav-back-text {
  font-size: 28rpx;
}
.nav-title {
  font-size: 30rpx;
  font-weight: 600;
}
.nav-right {
  width: 64rpx;
}

/* 滚动主体 */
.scroll-body {
  flex: 1;
}

/* 通用卡片 */
.card {
  margin: 24rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background-color: #ffffff;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
}

/* 状态卡片 */
.status-card {
}
.status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8rpx;
}
.status-row:first-child {
  margin-top: 0;
}
.status-label {
  font-size: 24rpx;
  color: #888;
}
.status-value {
  font-size: 24rpx;
  color: #333;
}
.status-chip {
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
  background-color: #f0f0f0;
}
.status-text {
  font-size: 24rpx;
}
.status-mode {
  font-size: 24rpx;
  color: #666;
}

/* 可以根据不同状态再细分颜色 */
.status-chip.s-0 {
  background: rgba(145, 213, 255, 0.16);
  border: 1rpx solid rgba(63, 169, 245, 0.6);
}
.status-chip.s-0 .status-text {
  color: #3fa9f5;
}
.status-chip.s-2 {
  background: rgba(189, 214, 255, 0.16);
  border: 1rpx solid rgba(95, 149, 255, 0.65);
}
.status-chip.s-2 .status-text {
  color: #5f95ff;
}
.status-chip.s-3 {
  background: rgba(140, 235, 195, 0.16);
  border: 1rpx solid rgba(64, 192, 135, 0.65);
}
.status-chip.s-3 .status-text {
  color: #36b67a;
}
.status-chip.s-4 {
  background: rgba(110, 218, 151, 0.16);
  border: 1rpx solid rgba(27, 176, 102, 0.65);
}
.status-chip.s-4 .status-text {
  color: #1bb066;
}
.status-chip.s-5 {
  background: rgba(230, 170, 170, 0.16);
  border: 1rpx solid rgba(210, 110, 110, 0.7);
}
.status-chip.s-5 .status-text {
  color: #d46b6b;
}
.status-chip.s-6 {
  background: rgba(210, 210, 210, 0.18);
  border: 1rpx solid rgba(170, 170, 170, 0.78);
}
.status-chip.s-6 .status-text {
  color: #999;
}
.status-chip.s-7 {
  background: rgba(220, 200, 200, 0.18);
  border: 1rpx solid rgba(190, 140, 140, 0.8);
}
.status-chip.s-7 .status-text {
  color: #c25b5b;
}

.status-actions {
  margin-top: 20rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.btn-primary {
  flex: 1;
  min-width: 240rpx;
  height: 72rpx;
  line-height: 72rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #ffd2e4, #ffe1b3);
  color: #4a3131;
  font-size: 26rpx;
  font-weight: 600;
  border: none;
}
.btn-primary::after {
  border: none;
}
.btn-secondary {
  flex: 1;
  min-width: 240rpx;
  height: 72rpx;
  line-height: 72rpx;
  border-radius: 999rpx;
  background: #ffffff;
  border: 1rpx solid #ffb36a;
  color: #c16a1f;
  font-size: 26rpx;
}
.btn-secondary::after {
  border: none;
}

/* 调试块 */
.debug-block {
  margin-top: 20rpx;
  padding: 12rpx 16rpx;
  border-radius: 16rpx;
  background-color: #f8f9fb;
}
.debug-title {
  font-size: 22rpx;
  color: #999;
}
.debug-line {
  font-size: 22rpx;
  color: #666;
}

/* items 卡片 */
.items-card {
}
.card-header {
  margin-bottom: 8rpx;
}
.card-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #222;
}

/* item 行 */
.item-row {
  margin-top: 20rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #f1f1f3;
}
.item-row:first-of-type {
  margin-top: 12rpx;
  padding-top: 8rpx;
  border-top: none;
}

.item-main {
  display: flex;
  align-items: flex-start;
}

.item-cover-wrap {
  width: 120rpx;
  height: 120rpx;
  margin-right: 16rpx;
  border-radius: 16rpx;
  overflow: hidden;
  background-color: #f6f6f8;
}
.item-cover {
  width: 100%;
  height: 100%;
}

.item-body {
  flex: 1;
}
.item-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.item-title {
  flex: 1;
  margin-right: 16rpx;
  font-size: 28rpx;
  color: #222;
  font-weight: 500;
}

.item-meta-row {
  margin-top: 4rpx;
  flex-wrap: wrap;
}
.item-meta {
  margin-right: 16rpx;
  font-size: 22rpx;
  color: #777;
}
.item-meta.adjust {
  color: #c46b3d;
}

/* item 操作按钮 */
.item-actions {
  margin-top: 12rpx;
  display: flex;
  justify-content: flex-end;
  gap: 12rpx;
}
.btn-mini {
  min-width: 160rpx;
  height: 60rpx;
  line-height: 60rpx;
  padding: 0 20rpx;
  border-radius: 999rpx;
  background-color: #ffe4c4;
  color: #5b3c1b;
  font-size: 24rpx;
  border: none;
}
.btn-mini::after {
  border: none;
}
.btn-mini.outline {
  background-color: #ffffff;
  border: 1rpx solid #d6d6e0;
  color: #555;
}

/* 草稿 */
.draft-card {
}
.draft-item {
  opacity: 0.9;
}

/* 通用状态展示 */
.state-box {
  margin: 80rpx 24rpx 0;
  padding: 24rpx;
  border-radius: 24rpx;
  background-color: #ffffff;
  text-align: center;
}
.state-box.state-error {
  border: 1rpx solid #ffd0d0;
}
.state-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #222;
  display:block;
}
.state-desc {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #777;
}
.btn-retry {
  margin-top: 20rpx;
  height: 72rpx;
  line-height: 72rpx;
  padding: 0 40rpx;
  border-radius: 999rpx;
  border: none;
  background-color: #ffe1b3;
  color: #5b3c1b;
  font-size: 26rpx;
}
.btn-retry::after {
  border: none;
}

/* 底部操作条 */
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 8rpx 24rpx 0;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);
}
.bottom-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #ffd2e4, #ffe1b3);
  color: #4a3131;
  font-size: 28rpx;
  font-weight: 600;
  border: none;
}
.bottom-btn::after {
  border: none;
}

/* 修改金额弹层 */
.price-sheet {
  background-color: #ffffff;
  border-top-left-radius: 24rpx;
  border-top-right-radius: 24rpx;
  padding: 16rpx 24rpx 24rpx;
}
.price-header {
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-bottom: 1rpx solid #f0f0f2;
}
.price-title {
  font-size: 30rpx;
  font-weight: 600;
}
.price-close {
  position: absolute;
  right: 8rpx;
  font-size: 26rpx;
  color: #999;
}
.price-body {
  padding-top: 12rpx;
}
.price-row {
  margin-top: 12rpx;
  display: flex;
  align-items: center;
}
.price-row-column {
  margin-top: 16rpx;
  display: flex;
  flex-direction: column;
}
.price-label {
  font-size: 26rpx;
  color: #555;
  min-width: 160rpx;
}
.price-value {
  flex: 1;
  font-size: 26rpx;
  color: #333;
}
.price-input {
  flex: 1;
  height: 72rpx;
  line-height: 72rpx;
  padding: 0 16rpx;
  border-radius: 16rpx;
  background-color: #f6f6f8;
  font-size: 26rpx;
}
.price-textarea {
  margin-top: 8rpx;
  padding: 12rpx 16rpx;
  border-radius: 16rpx;
  background-color: #f6f6f8;
  font-size: 24rpx;
  min-height: 120rpx;
}
.price-footer {
  margin-top: 20rpx;
}
.price-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 999rpx;
  background: #4df0ff;
  color: #090a0f;
  font-size: 30rpx;
  font-weight: 700;
  border: none;
}
.price-btn::after {
  border: none;
}
</style>
