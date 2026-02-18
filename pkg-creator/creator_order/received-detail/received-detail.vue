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
                :class="{ disabled: !canSubmitStep(item) }"
                :disabled="!canSubmitStep(item)"
                @tap="handleSubmitStep(item)"
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

    <view v-if="showBottomBar" class="bottom-bar" :style="{ paddingBottom: bottomBarPadding }">
      <view class="bottom-actions-row" :class="{ 'only-cancel': canOnlyCancel }">
        <view class="left-text-actions">
            <view
              v-if="canArtistCancel"
              class="text-btn-item danger"
              @tap="handleAuditSubmission('cancel_order')"
            >
                取消订单
            </view>
            <view
              v-if="canArtistReturn"
              class="text-btn-item"
              @tap="handleAuditSubmission('return_pending')"
            >
                退回修改
            </view>
        </view>
        
        <button v-if="canArtistConfirm" class="action-btn-large" @tap="handleConfirmSubmission">
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

const currentUid = computed(() => {
  const u = global.userInfo || {}
  return u.id || u.Id || 0
})

const isBuyer = computed(() => {
  const q = queueInfo.value || {}
  if (typeof q.viewer_is_buyer === 'boolean') {
    return q.viewer_is_buyer
  }

  const submissionUserID = Number(q.submission_user_id || q.user_id || q.userId || 0)
  if (submissionUserID > 0 && Number(currentUid.value) > 0) {
    return Number(submissionUserID) === Number(currentUid.value)
  }

  const list = items.value
  if (!list.length || !currentUid.value) {
    const brandId = Number(global.userInfo?.brand_id || global.userInfo?.brandId || 0)
    return brandId <= 0
  }
  const first = list[0]
  const uid = first.user_id || first.userId
  return Number(uid) === Number(currentUid.value)
})

const SUBMISSION_STATUS_SELECTED_CONFIRM = 1
const SUBMISSION_STATUS_BUYER_CONFIRMED = 2
const SUBMISSION_STATUS_SELECTED_PAY = 3
const SUBMISSION_STATUS_PAID = 4
const PAYMENT_METHOD_PLATFORM = 1
const PAYMENT_METHOD_QRCODE = 2

const submissionStatus = computed(() => Number(queueInfo.value?.status || 0))

const canArtistCancel = computed(() => {
  if (isBuyer.value) return false
  return (
    submissionStatus.value === SUBMISSION_STATUS_SELECTED_CONFIRM ||
    submissionStatus.value === SUBMISSION_STATUS_BUYER_CONFIRMED
  )
})

const canArtistReturn = computed(() => {
  if (isBuyer.value) return false
  return submissionStatus.value === SUBMISSION_STATUS_BUYER_CONFIRMED
})

const canArtistConfirm = computed(() => {
  if (isBuyer.value) return false
  return submissionStatus.value === SUBMISSION_STATUS_BUYER_CONFIRMED
})

const canOnlyCancel = computed(() => canArtistCancel.value && !canArtistConfirm.value && !canArtistReturn.value)

const showBottomBar = computed(() => {
  return !!queueInfo.value && (canArtistCancel.value || canArtistReturn.value || canArtistConfirm.value)
})

const stepConfigs = computed(() => {
  const q = queueInfo.value || {}
  let raw = []

  if (Array.isArray(q.step_configs)) {
    raw = q.step_configs
  } else if (Array.isArray(q.stepConfig)) {
    raw = q.stepConfig
  } else {
    const txt = String(q.step_config_json || q.stepConfigJSON || '').trim()
    if (txt) {
      try {
        const parsed = JSON.parse(txt)
        if (Array.isArray(parsed)) raw = parsed
      } catch (_) {}
    }
  }

  const list = raw.map((s, idx) => {
    const n = Number(s?.id || s?.ID || idx + 1)
    const id = Number.isFinite(n) && n > 0 ? n : (idx + 1)
    const name = String(s?.name || s?.Name || '').trim() || `节点${id}`
    return { id, name }
  })

  return list
    .filter((x, idx) => x.id > 0 && list.findIndex((y) => y.id === x.id) === idx)
    .sort((a, b) => a.id - b.id)
})

const footerPlaceholderHeight = computed(() => {
  return toPx(getFooterPlaceholderHeight())
})
const footerPadding = computed(() => {
  return toPx(getSafeBottom())
})
const bottomBarPadding = computed(() => {
  return toPx(getSafeBottom() + 14)
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
      // 获取成功后，优先用 submission_user_id 定位买家
      if (queueInfo.value) {
          const first = queueInfo.value.items && queueInfo.value.items.length > 0
            ? queueInfo.value.items[0]
            : null
          const uid = Number(
            queueInfo.value.submission_user_id ||
            first?.user_id ||
            first?.userId ||
            0
          )
          if (uid > 0) {
            fetchTargetUserInfo(uid)
          } else {
            targetUserInfo.value = null
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
    if (!queueInfo.value) return
    const first = queueInfo.value.items && queueInfo.value.items.length ? queueInfo.value.items[0] : null
    const uid = Number(
      queueInfo.value.submission_user_id ||
      first?.user_id ||
      first?.userId ||
      0
    )
    if (uid > 0) {
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
  const first = list.length ? list[0] : null
  const buyerUid = Number(
    queueInfo.value?.submission_user_id ||
    first?.user_id ||
    first?.userId ||
    0
  )
  const brandId = Number(first?.brand_id || first?.brandId || 0)
  const brandOwnerUid = Number(queueInfo.value?.brand_owner_uid || 0)

  if (!isBuyer.value) {
    // 如果我是卖家/妆师，我要找买家
    if (!buyerUid) {
      uni.showToast({ title: '找不到买家ID', icon: 'none' })
      return null
    }
    return buyerUid
  }

  // 如果我是买家，我要找品牌/妆师
  if (brandOwnerUid > 0) {
    return brandOwnerUid
  }

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
  if (!canArtistConfirm.value) {
    uni.showToast({ title: '当前状态不可确认订单', icon: 'none' })
    return
  }
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
  if (action === 'cancel_order' && !canArtistCancel.value) {
    uni.showToast({ title: '当前状态不可取消订单', icon: 'none' })
    return
  }
  if (action === 'return_pending' && !canArtistReturn.value) {
    uni.showToast({ title: '当前状态不可退回修改', icon: 'none' })
    return
  }
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

function getStepDisabledReason(item) {
  if (!queueInfo.value) return '订单信息加载中'

  const status = Number(queueInfo.value.status || 0)
  if (status === SUBMISSION_STATUS_BUYER_CONFIRMED) {
    return '买家已确认，待卖家确认阶段不可提交节点'
  }
  if (status !== SUBMISSION_STATUS_SELECTED_PAY && status !== SUBMISSION_STATUS_PAID) {
    return '当前订单状态不支持提交节点'
  }

  if (!stepConfigs.value.length) {
    return '当前订单未配置创作节点'
  }

  const payMethod = Number(queueInfo.value.payment_method || queueInfo.value.paymentMethod || 0)
  if (payMethod === PAYMENT_METHOD_QRCODE) {
    return '收款码收款订单不支持提交节点'
  }
  if (payMethod !== PAYMENT_METHOD_PLATFORM) {
    return '仅在线支付并完成付款后可提交节点'
  }

  const itemId = Number(item?.id || item?.ID || 0)
  if (!itemId) return '缺少子项ID'
  return ''
}

function canSubmitStep(item) {
  return !getStepDisabledReason(item)
}

function buildStepCandidates(item) {
  const all = stepConfigs.value
  if (!all.length) return []

  const currentStepId = Number(item?.current_step_id || item?.currentStepID || 0)
  if (!Number.isFinite(currentStepId) || currentStepId <= 0) return all

  const next = all.filter((s) => s.id > currentStepId)
  return next.length ? next : all
}

function submitStepRequest(itemId, step) {
  ensureLogin().then((ok) => {
    if (!ok) return
    const token = uni.getStorageSync('token') || ''
    uni.showLoading({ title: '提交中' })
    uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/step/request`,
      method: 'POST',
      header: { Authorization: token, 'Content-Type': 'application/json' },
      data: {
        item_id: itemId,
        step_id: step.id,
        images: [],
      },
      success: (res) => {
        if (res.data?.status === 'success') {
          uni.showToast({ title: '节点提交成功', icon: 'success' })
          fetchQueueInfo()
        } else {
          uni.showToast({ title: res.data?.msg || '提交失败', icon: 'none' })
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

function handleSubmitStep(item) {
  const reason = getStepDisabledReason(item)
  if (reason) {
    uni.showToast({ title: reason, icon: 'none' })
    return
  }

  const itemId = Number(item?.id || item?.ID || 0)
  if (!itemId) {
    uni.showToast({ title: '缺少子项ID', icon: 'none' })
    return
  }

  const steps = buildStepCandidates(item)
  if (!steps.length) {
    uni.showToast({ title: '当前订单未配置创作节点', icon: 'none' })
    return
  }

  if (steps.length === 1) {
    submitStepRequest(itemId, steps[0])
    return
  }

  uni.showActionSheet({
    itemList: steps.map((s) => `${s.id}. ${s.name}`),
    success: (res) => {
      const step = steps[res.tapIndex]
      if (!step) return
      submitStepRequest(itemId, step)
    }
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
  background: linear-gradient(180deg, #f7f9fc 0%, #f3f5f9 48%, #f6f7fb 100%);
  display: flex;
  flex-direction: column;
}

/* 滚动主体 */
.scroll-body {
  flex: 1;
  min-height: 0;
}

.content {
  padding: 8rpx 0 24rpx;
}

/* 通用卡片 */
.card {
  margin: 18rpx 20rpx 0;
  padding: 24rpx;
  border-radius: 22rpx;
  background-color: #ffffff;
  border: 1rpx solid #edf1f6;
  box-shadow: 0 8rpx 24rpx rgba(16, 30, 54, 0.04);
}

.status-card {
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
}

/* 状态卡片 */
.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8rpx 0;
}
.status-row + .status-row {
  margin-top: 8rpx;
  padding-top: 18rpx;
  border-top: 1rpx dashed #edf1f6;
}
.status-left-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12rpx;
}
.status-label {
  width: 132rpx;
  flex-shrink: 0;
  font-size: 24rpx;
  color: #8692a6;
}

/* 通用大字体标题样式 */
.font-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #273043;
  line-height: 1.2;
  font-family: DIN, 'Helvetica Neue', Helvetica, sans-serif;
}

.status-value-group {
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  min-width: 0;
}
.status-unit {
  font-size: 24rpx;
  color: #98a1b2;
  margin-left: 4rpx;
}
.status-normal-text {
  font-size: 26rpx;
  color: #5f6775;
}


.status-chip {
  padding: 7rpx 18rpx;
  border-radius: 999rpx;
  background-color: #f2f4f8;
  border: 1rpx solid #e7ebf2;
}
.status-text {
  font-size: 24rpx;
  font-weight: 600;
  color: #4f5a6b;
}

/* 钞单标签样式 */
.tag-premium {
  background: linear-gradient(135deg, #ffd667, #f7ad2f);
  padding: 5rpx 12rpx;
  border-radius: 10rpx;
  box-shadow: 0 4rpx 10rpx rgba(231, 177, 58, 0.32);
}
.tag-text {
  font-size: 20rpx;
  color: #fff;
  font-weight: 700;
  text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1);
}

/* 状态 Chip 颜色 */
.status-chip.s-0 { background: rgba(145, 213, 255, 0.14); border: 1rpx solid rgba(63, 169, 245, 0.5); }
.status-chip.s-0 .status-text { color: #3fa9f5; }

/* s-2 状态特殊处理 */
.status-chip.s-2 { 
  background: transparent; 
  border: none; 
  padding: 0;
}
.status-chip.s-2 .status-text { color: #333; } 
.status-chip.font-title .status-text {
  font-size: 40rpx;
  font-weight: 700;
  color: #273043;
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
  margin-top: 24rpx;
  padding-top: 20rpx;
  border-top: 1rpx dashed #edf1f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16rpx;
}

/* 用户信息组样式 */
.user-info-group {
  flex: 1;
  min-width: 0;
  max-width: 65%;
  display: flex;
  align-items: center;
  gap: 16rpx;
  background-color: #f7f9fd;
  padding: 8rpx 20rpx 8rpx 8rpx;
  border-radius: 999rpx;
  border: 1rpx solid #ebeff6;
}
.user-info-group:active {
  opacity: 0.72;
}
.user-avatar {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background-color: #eceff5;
}
.user-name {
  font-size: 26rpx;
  color: #2d3442;
  font-weight: 500;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.user-info-placeholder {
  flex: 1;
}


.btn-chat-inline {
  height: 64rpx;
  line-height: 64rpx;
  padding: 0 30rpx;
  border-radius: 999rpx;
  background-color: #ffffff;
  color: #455064;
  font-size: 26rpx;
  font-weight: 600;
  border: none;
  display: flex;
  align-items: center;
  margin: 0;
  white-space: nowrap;
}
.btn-chat-inline::after { border: none; }


/* items 卡片 */
.card-header {
  margin-bottom: 14rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card-title {
  font-size: 31rpx;
  font-weight: 600;
  color: #20293a;
}

/* item 行 */
.item-row {
  margin-top: 14rpx;
  padding: 20rpx;
  border-radius: 18rpx;
  border: 1rpx solid #eef2f8;
  background: #fafbff;
}
.item-row:first-of-type {
  margin-top: 10rpx;
}

.item-main {
  display: flex;
  align-items: flex-start;
}

.item-cover-wrap {
  width: 132rpx;
  height: 132rpx;
  margin-right: 18rpx;
  border-radius: 16rpx;
  overflow: hidden;
  background-color: #eef2f8;
  flex-shrink: 0;
}
.item-cover {
  width: 100%;
  height: 100%;
}

.item-body {
  flex: 1;
  min-width: 0;
}
.item-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.item-title {
  flex: 1;
  margin-right: 12rpx;
  font-size: 29rpx;
  color: #1f2735;
  font-weight: 600;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.item-meta-row {
  margin-top: 10rpx;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
.item-meta {
  margin-right: 12rpx;
  margin-bottom: 8rpx;
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  background: #f0f3f9;
  font-size: 22rpx;
  color: #5e6a7d;
  line-height: 1.6;
}
.item-meta.adjust {
  color: #b66232;
  background: #fff2e9;
}

/* item 操作按钮 */
.item-actions {
  margin-top: 14rpx;
  display: flex;
  justify-content: flex-end;
}
.btn-mini {
  flex: 1;
  min-width: 0;
  height: 64rpx;
  line-height: 64rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  background-color: #ffe9cf;
  color: #6a4622;
  font-size: 23rpx;
  font-weight: 600;
  border: none;
  margin: 0;
}
.btn-mini + .btn-mini { margin-left: 12rpx; }
.btn-mini::after { border: none; }
.btn-mini.outline {
  background-color: #ffffff;
  border: none;
  color: #4f5c70;
}
.btn-mini.disabled {
  background-color: #e9edf3 !important;
  color: #a2acbb !important;
  box-shadow: none;
}

/* 草稿 */
.draft-item {
  opacity: 1;
  border-style: dashed;
  background: #f7f9fc;
}

/* 通用状态展示 */
.state-box {
  margin: 72rpx 20rpx 0;
  padding: 24rpx;
  border-radius: 24rpx;
  background-color: #ffffff;
  text-align: center;
  border: 1rpx solid #edf1f6;
}
.state-box.state-error {
  border-color: #ffd8d8;
  background: #fffdfd;
}
.state-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #20293a;
  display: block;
}
.state-desc {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #768193;
}
.btn-retry {
  margin-top: 20rpx;
  height: 72rpx;
  line-height: 72rpx;
  padding: 0 40rpx;
  border-radius: 999rpx;
  border: none;
  background-color: #ffe7c8;
  color: #63411d;
  font-size: 26rpx;
  font-weight: 600;
}
.btn-retry::after { border: none; }

/* 底部操作条 */
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.93);
  backdrop-filter: blur(12rpx);
  border-top: 1rpx solid #e9edf4;
  z-index: 100;
  padding: 14rpx 20rpx 0;
}
.bottom-actions-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  min-height: 96rpx;
  gap: 22rpx;
}
.bottom-actions-row.only-cancel {
  justify-content: flex-end;
}
.bottom-actions-row.only-cancel .left-text-actions {
  margin-left: auto;
  justify-content: flex-end;
}

.left-text-actions {
  display: flex;
  gap: 26rpx;
  flex-shrink: 0;
}

.text-btn-item {
  font-size: 27rpx;
  color: #7a6670;
  padding: 18rpx 0;
  font-weight: 500;
}
.text-btn-item.danger {
  color: #b35f5f;
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
  font-weight: 700;
  margin: 0;
  border: none;
  background: linear-gradient(135deg, #ffd8e8, #ffe3bd);
  color: #4a3131;
  box-shadow: 0 6rpx 14rpx rgba(253, 212, 170, 0.35);
}
.action-btn-large::after { border: none; }


/* 修改金额弹层 */
.price-sheet {
  background-color: #ffffff;
  border-top-left-radius: 28rpx;
  border-top-right-radius: 28rpx;
  padding: 18rpx 24rpx 24rpx;
  box-shadow: 0 -8rpx 28rpx rgba(20, 33, 52, 0.12);
}
.price-header {
  height: 84rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-bottom: 1rpx solid #edf1f6;
}
.price-title {
  font-size: 31rpx;
  font-weight: 600;
  color: #1f2735;
}
.price-close {
  position: absolute;
  right: 6rpx;
  font-size: 26rpx;
  color: #8d97aa;
}
.price-body {
  padding-top: 14rpx;
}
.price-row {
  margin-top: 12rpx;
  padding: 14rpx 16rpx;
  border-radius: 14rpx;
  background: #f6f8fc;
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
  color: #5f6778;
  min-width: 150rpx;
}
.price-value {
  flex: 1;
  font-size: 26rpx;
  color: #253044;
  text-align: right;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.price-input {
  flex: 1;
  height: 72rpx;
  line-height: 72rpx;
  padding: 0 16rpx;
  border-radius: 16rpx;
  background-color: #ffffff;
  border: 1rpx solid #e4eaf4;
  font-size: 26rpx;
}
.price-textarea {
  margin-top: 8rpx;
  padding: 12rpx 16rpx;
  border-radius: 16rpx;
  background-color: #ffffff;
  border: 1rpx solid #e4eaf4;
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
  background: linear-gradient(135deg, #8fe8ff, #72d8ff);
  color: #143043;
  font-size: 29rpx;
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
  font-size: 34rpx;
  font-weight: 600;
  color: #1f2735;
  margin-bottom: 24rpx;
}

.custom-modal-desc {
  font-size: 28rpx;
  color: #5f6878;
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
  background-color: #f4f6fa;
  color: #6d7484;
}

.custom-modal-btn.confirm {
  background: linear-gradient(135deg, #ffd9e9, #ffe8c6);
  color: #4a3131;
  font-weight: 600;
}

@media screen and (max-width: 370px) {
  .status-actions {
    flex-wrap: wrap;
  }
  .user-info-group {
    max-width: 100%;
    width: 100%;
  }
  .btn-chat-inline {
    width: 100%;
    justify-content: center;
  }
  .bottom-actions-row {
    flex-wrap: wrap;
    gap: 12rpx;
  }
  .left-text-actions {
    width: 100%;
    justify-content: space-between;
  }
  .bottom-actions-row.only-cancel .left-text-actions {
    width: auto;
    margin-left: auto;
    justify-content: flex-end;
  }
  .action-btn-large {
    width: 100%;
    flex: none;
  }
}
</style>
