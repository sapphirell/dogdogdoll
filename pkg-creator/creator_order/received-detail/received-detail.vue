<template>
  <view-logs />
  <view class="submission-page">

    <scroll-view
      class="scroll-body"
      scroll-y
      :show-scrollbar="false"
    >
      <view v-if="loading" class="state-box">
        <text class="state-title">加载中…</text>
        <text class="state-desc">正在获取投递详情</text>
      </view>

      <view v-else-if="!queueInfo" class="state-box state-error">
        <text class="state-title">获取失败</text>
        <text class="state-desc">{{ errorMsg || '暂时无法获取投递信息' }}</text>
        <button class="btn-retry" @tap="reload">重试</button>
      </view>

      <view v-else class="content">
        <view class="card status-card">
          <view class="status-row">
            <view class="status-left-group">
                <view 
                  class="status-chip" 
                  :class="['s-' + queueInfo.status, { 'font-title': queueInfo.status === 2 }]"
                >
                  <text class="status-text">{{ queueInfo.status_text || '未知状态' }}</text>
                </view>
                <view v-if="queueInfo.premium_queue_status === 1" class="tag-premium">
                    <text class="tag-text">钞能力</text>
                </view>
            </view>
          </view>

          <view class="status-row">
            <text class="status-label">排队位置</text>
            <view class="status-value-group">
              <text v-if="queueInfo.ahead_count > 0" class="font-title">
                {{ queueInfo.ahead_count }}
              </text>
              <text v-else-if="queueInfo.status === 0" class="font-title">0</text>
              <text v-else class="status-normal-text">不在队列中</text>
              <text v-if="queueInfo.ahead_count > 0" class="status-unit">位</text>
            </view>
          </view>

          <view class="status-row">
            <text class="status-label">ID</text>
            <text class="font-title">#{{ queueInfo.submission_id }}</text>
          </view>
          
          <view class="status-actions">
            <view 
              class="user-info-group" 
              v-if="targetUserInfo"
              @tap="goUserPage"
            >
              <image 
                class="user-avatar" 
                :src="targetUserInfo.avatar || 'https://images1.fantuanpu.com/home/default_avatar.jpg'" 
                mode="aspectFill"
              />
              <text class="user-name">{{ targetUserInfo.user_name || '未知用户' }}</text>
            </view>
            <view v-else class="user-info-placeholder"></view>

            <button
              class="btn-chat-inline"
              @tap="handleChatWithSeller"
            >
              <uni-icons type="chatbubble" size="16" color="#4a3131" style="margin-right: 4rpx;"/>
              {{ isBuyer ? '联系卖家' : '联系买家' }}
            </button>
          </view>
        </view>

        <view class="card items-card">
          <view class="card-header">
            <text class="card-title">投递内容（{{ items.length }}）</text>
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
                    订单状态：{{ formatItemStatus(item.status) }}
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

        <view v-if="showBottomBar" :style="{ height: footerPlaceholderHeight }"></view>
      </view>
    </scroll-view>

    <view v-if="showBottomBar" class="bottom-bar" :style="{ paddingBottom: footerPadding }">
      <view class="bottom-actions-row">
        <view class="left-text-actions">
            <view class="text-btn-item" @tap="handleAuditSubmission('cancel_order')">
                取消订单
            </view>
            <view class="text-btn-item" @tap="handleAuditSubmission('return_pending')">
                退回修改
            </view>
        </view>
        
        <button class="action-btn-large" @tap="handleConfirmSubmission">
            确认订单
        </button>
      </view>
    </view>

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

    <common-modal v-model:visible="auditModalVisible" width="600rpx">
      <view class="custom-modal-content" style="padding-bottom: 40rpx;">
        <text class="custom-modal-title">{{ auditModalTitle }}</text>
        <text class="custom-modal-desc">{{ auditModalDesc }}</text>
        <view class="custom-modal-actions">
          <button class="custom-modal-btn cancel" @tap="auditModalVisible = false">取消</button>
          <button class="custom-modal-btn confirm" @tap="onModalConfirm">确定</button>
        </view>
      </view>
    </common-modal>

  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import CommonModal from '@/components/common-modal/common-modal.vue' 
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
const queueInfo = ref(null) 
const targetUserInfo = ref(null) // 新增：投递者用户信息

const items = computed(() => (queueInfo.value?.items || []))
const draftItems = computed(() => (queueInfo.value?.draft_items || []))

const showBottomBar = computed(() => {
    return queueInfo.value && queueInfo.value.status === 2
})

const currentUid = computed(() => {
  const u = global.userInfo || {}
  return u.id || u.Id || 0
})

const isBuyer = computed(() => {
  const list = items.value
  if (!list.length || !currentUid.value) return true
  const first = list[0]
  const uid = first.user_id || first.userId
  return Number(uid) === Number(currentUid.value)
})

const footerPlaceholderHeight = computed(() => {
  return toPx(getFooterPlaceholderHeight())
})
const footerPadding = computed(() => {
  return toPx(getSafeBottom())
})

const pricePopupRef = ref(null)
const editingItem = ref(null)
const priceInput = ref('')
const reasonInput = ref('')

// ================== 确认/审核弹窗状态 ==================
const auditModalVisible = ref(false)
const auditModalTitle = ref('')
const auditModalDesc = ref('')
const currentActionType = ref('')

// ================== 工具函数 ==================

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
  return base + adjust
}

function formatPrice(v) {
  const n = Number(v || 0)
  if (!Number.isFinite(n)) return '0.00'
  return n.toFixed(2)
}

function formatItemStatus(st) {
  const s = Number(st)
  switch (s) {
    case 0: return '待处理/排队中'
    case 1: return '已抢到，待确认'
    case 2: return '等待妆师/毛娘确认'
    case 3: return '待付款'
    case 4: return '已下单/进行中'
    case 5: return '未中选'
    case 6: return '已放弃/取消'
    case 7: return '保留过期'
    default: return '未知'
  }
}

// ================== 登录 & 请求 ==================

async function ensureLogin() {
  await initLoginState()
  const token = uni.getStorageSync('token')
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
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

  uni.request({
    url: `${websiteUrl.value}/with-state/artist-order/submission/queue-info`,
    method: 'GET',
    header: { Authorization: token },
    data: { submission_id: submissionId.value },
    success: (res) => {
      const body = res.data || {}
      if (body.status !== 'success') {
        errorMsg.value = body.msg || '获取排队信息失败'
        queueInfo.value = null
        return
      }
      queueInfo.value = body.data || null
      // 获取成功后，如果有关联的 User，解析用户信息
      if (queueInfo.value && queueInfo.value.items && queueInfo.value.items.length > 0) {
          const first = queueInfo.value.items[0]
          const uid = first.user_id || first.userId || 0
          if (uid) {
              fetchTargetUserInfo(uid)
          }
      }
    },
    fail: (err) => {
      errorMsg.value = '网络错误，请稍后重试'
      queueInfo.value = null
    },
    complete: () => {
      loading.value = false
    },
  })
}

// 新增：获取用户信息接口
function fetchTargetUserInfo(uid) {
    // 接口文档给的是完整地址，这里为了保险起见，如果 websiteUrl 已经是域名则拼接，或者直接使用全路径
    // 假设 websiteUrl 是 https://api.fantuanpu.com
    uni.request({
        url: `${websiteUrl.value}/user-info`, 
        method: 'GET',
        data: { uid: uid },
        success: (res) => {
            const body = res.data || {}
            if (body.status === 'success') {
                targetUserInfo.value = body.data
            }
        }
    })
}

// 新增：跳转用户主页
function goUserPage() {
    if (!queueInfo.value || !queueInfo.value.items || !queueInfo.value.items.length) return
    const first = queueInfo.value.items[0]
    const uid = first.user_id || first.userId || 0
    if (uid) {
        // H5 或 uni-app 页面跳转
        uni.navigateTo({
            url: `/pages/user_page/user_page?uid=${uid}`
        })
    }
}

function reload() {
  fetchQueueInfo()
}

// ================== 业务逻辑 ==================

async function resolvePeerId() {
  const list = items.value
  if (!list.length) {
    uni.showToast({ title: '暂无作品，无法发起会话', icon: 'none' })
    return null
  }
  const first = list[0]
  const buyerUid = first.user_id || first.userId || 0
  const brandId = first.brand_id || first.brandId || 0

  if (!isBuyer.value) {
    // 如果我是卖家/妆师，我要找买家
    if (!buyerUid) {
      uni.showToast({ title: '找不到买家ID', icon: 'none' })
      return null
    }
    return buyerUid
  }

  // 如果我是买家，我要找品牌/妆师
  if (!brandId) {
    uni.showToast({ title: '缺少品牌信息', icon: 'none' })
    return null
  }

  return new Promise((resolve) => {
    uni.request({
      url: `${websiteUrl.value}/brand-info`,
      method: 'GET',
      data: { id: brandId },
      success: (res) => {
        const body = res.data || {}
        const ownerUid = body.data?.user_id || body.data?.userId || 0
        if (!ownerUid) {
          uni.showToast({ title: '品牌未绑定账号', icon: 'none' })
          resolve(null)
        } else {
          resolve(ownerUid)
        }
      },
      fail: () => {
        uni.showToast({ title: '获取品牌信息失败', icon: 'none' })
        resolve(null)
      },
    })
  })
}

async function handleChatWithSeller() {
  if (!queueInfo.value) return
  const ok = await ensureLogin()
  if (!ok) return
  const peer = await resolvePeerId()
  if (!peer) return
  uni.navigateTo({
    url: `/pkg-im/chat/chat?peer_id=${peer}`,
  })
}

function openChangePricePanel(item) {
  editingItem.value = item
  priceInput.value = String(calcItemTotal(item))
  reasonInput.value = ''
  nextTickOpenPricePopup()
}

function nextTickOpenPricePopup() {
  setTimeout(() => {
    try {
      pricePopupRef.value?.open?.()
    } catch (e) {}
  }, 0)
}

function closePricePanel() {
  try {
    pricePopupRef.value?.close?.()
  } catch (e) {}
}

function onPricePopupChange(e) {
  if (!e.show) {
    editingItem.value = null
    priceInput.value = ''
    reasonInput.value = ''
  }
}

function submitChangePrice() {
  if (!editingItem.value) return
  const raw = priceInput.value.trim()
  const n = Number(raw)
  if (!raw || Number.isNaN(n) || n <= 0) {
    uni.showToast({ title: '请填写正确的金额', icon: 'none' })
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

    uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/item/change-price`,
      method: 'POST',
      header: { Authorization: token, 'Content-Type': 'application/json' },
      data: payload,
      success: (res) => {
        const body = res.data || {}
        if (body.status !== 'success') {
          uni.showToast({ title: body.msg || '失败', icon: 'none' })
          return
        }
        uni.showToast({ title: '成功', icon: 'success' })
        closePricePanel()
        fetchQueueInfo()
      },
    })
  })
}

function handleConfirmSubmission() {
  if (!queueInfo.value || queueInfo.value.status !== 2) return
  currentActionType.value = 'confirm'
  auditModalTitle.value = '确认订单'
  auditModalDesc.value = '确认后将进入待付款状态，是否继续？'
  auditModalVisible.value = true
}

function doConfirmSubmission() {
  ensureLogin().then((ok) => {
    if (!ok) return
    const token = uni.getStorageSync('token') || ''
    uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/submission/confirm`,
      method: 'POST',
      header: { Authorization: token, 'Content-Type': 'application/json' },
      data: { submission_id: submissionId.value },
      success: (res) => {
        if (res.data?.status === 'success') {
          uni.showToast({ title: '已确认', icon: 'success' })
          fetchQueueInfo()
        } else {
          uni.showToast({ title: res.data?.msg || '失败', icon: 'none' })
        }
      },
    })
  })
}

function handleAuditSubmission(action) {
  if (!queueInfo.value) return
  currentActionType.value = action
  if (action === 'return_pending') {
      auditModalTitle.value = '退回待确认'
      auditModalDesc.value = '确定要将此订单退回至“待确认”状态吗？买家需要重新确认。'
  } else if (action === 'cancel_order') {
      auditModalTitle.value = '取消订单'
      auditModalDesc.value = '确定要取消此订单吗？操作不可撤销。'
  } else {
      return
  }
  auditModalVisible.value = true
}

function doAuditSubmission(action) {
    ensureLogin().then((ok) => {
      if (!ok) return
      const token = uni.getStorageSync('token') || ''
      const url = `${websiteUrl.value}/with-state/artist-order/submission/operate`
      const payload = {
          submission_id: submissionId.value,
          action: action 
      }
      uni.showLoading({ title: '处理中' })
      uni.request({
        url: url,
        method: 'POST',
        header: { Authorization: token, 'Content-Type': 'application/json' },
        data: payload,
        success: (res) => {
          if (res.data?.status === 'success') {
            uni.showToast({ title: '操作成功', icon: 'success' })
            fetchQueueInfo()
          } else {
            uni.showToast({ title: res.data?.msg || '操作失败', icon: 'none' })
          }
        },
        fail: () => {
              uni.showToast({ title: '网络请求失败', icon: 'none' })
        },
        complete: () => {
            uni.hideLoading()
        }
      })
    })
}

function onModalConfirm() {
  auditModalVisible.value = false
  if (currentActionType.value === 'confirm') {
    doConfirmSubmission()
  } else if (['return_pending', 'cancel_order'].includes(currentActionType.value)) {
    doAuditSubmission(currentActionType.value)
  }
}

function goStepEditor(item) {
  const itemId = item.id || item.ID
  if (!itemId) return
  uni.navigateTo({
    url: `/pages/artist-order/step-editor?item_id=${itemId}`,
  })
}

onLoad((options) => {
  uni.setNavigationBarTitle({ title: '投递订单详情' })
  
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
.status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* 修改点1：间距加长 */
  margin-top: 24rpx;
}
.status-row:first-child {
  margin-top: 0;
}
.status-left-group {
    display: flex;
    align-items: center;
    gap: 12rpx;
}
.status-label {
  font-size: 24rpx;
  color: #888;
}

/* 通用大字体标题样式 */
.font-title {
    font-size: 40rpx;
    font-weight: bold;
    color: #333;
    line-height: 1.2;
    font-family: DIN, 'Helvetica Neue', Helvetica, sans-serif; /* 尝试使用数字字体 */
}

.status-value-group {
    display: flex;
    align-items: baseline;
}
.status-unit {
    font-size: 24rpx;
    color: #888;
    margin-left: 4rpx;
}
.status-normal-text {
    font-size: 26rpx;
    color: #666;
}


.status-chip {
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
  background-color: #f0f0f0;
}
.status-text {
  font-size: 24rpx;
}

/* 钞单标签样式 */
.tag-premium {
    background: linear-gradient(135deg, #FFD700, #FDB931);
    padding: 4rpx 12rpx;
    border-radius: 8rpx;
    box-shadow: 0 2rpx 4rpx rgba(218, 165, 32, 0.3);
}
.tag-text {
    font-size: 20rpx;
    color: #fff;
    font-weight: bold;
    text-shadow: 0 1rpx 2rpx rgba(0,0,0,0.1);
}

/* 状态 Chip 颜色 */
.status-chip.s-0 { background: rgba(145, 213, 255, 0.16); border: 1rpx solid rgba(63, 169, 245, 0.6); }
.status-chip.s-0 .status-text { color: #3fa9f5; }

/* s-2 状态特殊处理 */
.status-chip.s-2 { 
    background: transparent; 
    border: none; 
    padding: 0;
}
.status-chip.s-2 .status-text { color: #333; } 
.status-chip.font-title .status-text {
    /* 继承全局 font-title 或单独定义 */
    font-size: 40rpx;
    font-weight: bold;
    color: #333;
}

.status-chip.s-3 { background: rgba(140, 235, 195, 0.16); border: 1rpx solid rgba(64, 192, 135, 0.65); }
.status-chip.s-3 .status-text { color: #36b67a; }
.status-chip.s-4 { background: rgba(110, 218, 151, 0.16); border: 1rpx solid rgba(27, 176, 102, 0.65); }
.status-chip.s-4 .status-text { color: #1bb066; }
.status-chip.s-5 { background: rgba(230, 170, 170, 0.16); border: 1rpx solid rgba(210, 110, 110, 0.7); }
.status-chip.s-5 .status-text { color: #d46b6b; }
.status-chip.s-6 { background: rgba(210, 210, 210, 0.18); border: 1rpx solid rgba(170, 170, 170, 0.78); }
.status-chip.s-6 .status-text { color: #999; }
.status-chip.s-7 { background: rgba(220, 200, 200, 0.18); border: 1rpx solid rgba(190, 140, 140, 0.8); }
.status-chip.s-7 .status-text { color: #c25b5b; }

.status-actions {
  margin-top: 32rpx; /* 稍微加大间距 */
  display: flex;
  /* 修改点4：两端对齐 */
  justify-content: space-between; 
  align-items: center;
}

/* 用户信息组样式 */
.user-info-group {
    display: flex;
    align-items: center;
    gap: 16rpx;
    background-color: #f9f9fb;
    padding: 8rpx 20rpx 8rpx 8rpx;
    border-radius: 999rpx;
}
.user-info-group:active {
    opacity: 0.7;
}
.user-avatar {
    width: 56rpx;
    height: 56rpx;
    border-radius: 50%;
    background-color: #eee;
}
.user-name {
    font-size: 26rpx;
    color: #333;
    font-weight: 500;
    max-width: 200rpx;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.user-info-placeholder {
    flex: 1; /* 占位，如果没有用户信息，保持chat按钮在右侧（如果需要chat按钮单独居左可去除）*/
}


.btn-chat-inline {
    height: 64rpx;
    line-height: 64rpx;
    padding: 0 32rpx;
    border-radius: 999rpx;
    background-color: #f5f5f7;
    color: #4a3131;
    font-size: 26rpx;
    font-weight: 500;
    border: none;
    display: flex;
    align-items: center;
    margin: 0; /* 清除默认 margin */
}
.btn-chat-inline::after { border: none; }


/* items 卡片 */
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
.btn-mini::after { border: none; }
.btn-mini.outline {
  background-color: #ffffff;
  border: 1rpx solid #d6d6e0;
  color: #555;
}

/* 草稿 */
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
.btn-retry::after { border: none; }

/* 底部操作条 */
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: none;
  border-top: 1rpx solid #eeeeee;
  z-index: 100;
  padding-top: 16rpx;
}
.bottom-actions-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32rpx; 
    height: 100rpx;
    gap: 32rpx;
}

.left-text-actions {
    display: flex;
    gap: 32rpx; 
    flex-shrink: 0;
}

.text-btn-item {
    font-size: 28rpx;
    color: #666;
    padding: 20rpx 0;
}
.text-btn-item:active {
    opacity: 0.6;
}

.action-btn-large {
    flex: 1; 
    height: 80rpx;
    line-height: 80rpx;
    border-radius: 999rpx;
    font-size: 30rpx;
    font-weight: 600;
    margin: 0;
    border: none;
    background: linear-gradient(135deg, #ffd2e4, #ffe1b3);
    color: #4a3131;
    box-shadow: 0 4rpx 12rpx rgba(255, 225, 179, 0.4);
}
.action-btn-large::after { border: none; }


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
.price-btn::after { border: none; }

/* ================= Custom Modal Styles ================= */
.custom-modal-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.custom-modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 24rpx;
}

.custom-modal-desc {
  font-size: 28rpx;
  color: #666;
  text-align: center;
  line-height: 1.5;
  margin-bottom: 40rpx;
  padding: 0 20rpx;
}

.custom-modal-actions {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
}

.custom-modal-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  text-align: center;
  border: none;
}
.custom-modal-btn::after { border: none; }

.custom-modal-btn.cancel {
  background-color: #f5f5f5;
  color: #666;
}

.custom-modal-btn.confirm {
  background: linear-gradient(135deg, #ffd2e4, #ffe1b3);
  color: #4a3131;
  font-weight: 600;
}
</style>