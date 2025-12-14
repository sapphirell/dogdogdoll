<template>
  <view class="submission-page">
    <!-- 主体滚动区 -->
    <scroll-view class="scroll-body" scroll-y :show-scrollbar="false">
      <!-- 未登录 -->
      <view v-if="!isLogin" class="state-box">
        <text class="state-title">请先登录</text>
        <text class="state-desc">登录后可以查看本次投递详情。</text>
      </view>

      <!-- 缺少 submission_id -->
      <view v-else-if="!submissionId" class="state-box state-error">
        <text class="state-title">缺少必要参数</text>
        <text class="state-desc">需要提供 submission_id 才能查看详情。</text>
      </view>

      <!-- 加载中 -->
      <view v-else-if="loading && !hasFirstLoaded" class="state-box">
        <text class="state-title">加载中…</text>
        <text class="state-desc">正在加载投递详情</text>
      </view>

      <!-- 加载错误 -->
      <view v-else-if="errorMsg" class="state-box state-error">
        <text class="state-title">加载失败</text>
        <text class="state-desc">{{ errorMsg }}</text>
        <button class="primary-btn" type="default" @click="reloadDetail">重试</button>
      </view>

      <!-- 正常内容 -->
      <view v-else class="content">
        <!-- 概览卡片：投递基本信息 + 作者信息 + 档期信息 -->
        <view class="card">
          <view class="card-header">
            <!-- 有作者信息时：展示作者 Logo + 名称 -->
            <view v-if="artistLogo || artistBrandName" class="card-header-artist">
              <image
                v-if="artistLogo"
                :src="artistLogo"
                class="artist-avatar"
                mode="aspectFill"
              />
              <view class="artist-meta">
                <text class="artist-name">{{ artistBrandName || '投递作者' }}</text>
                <text v-if="planBasicText" class="artist-plan-text">
                  {{ planBasicText }}
                </text>
              </view>
            </view>

            <!-- 没有作者信息时：回退为原来的标题 -->
            <template v-else>
              <text class="card-title">投递详情</text>
              <text class="card-sub" v-if="planBasicText">{{ planBasicText }}</text>
            </template>
          </view>

          <view class="info-row">
            <text class="info-label">投递编号</text>
            <text class="info-val">#{{ submission.submission_id }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">投递状态</text>
            <text class="info-val">{{ submission.status_text || '—' }}</text>
          </view>

          <view class="info-row" v-if="plan.artist_name">
            <text class="info-label">本次投递开单</text>
            <text class="info-val">{{ plan.artist_name }}</text>
          </view>

          <view class="info-row">
            <text class="info-label">投递时间</text>
            <text class="info-val">
              {{ submission.created_at ? fmtTime(submission.created_at) : '--' }}
            </text>
          </view>

          <view class="info-row" v-if="maxSubmissionsPerUser > 0">
            <text class="info-label">本次可投递{{ subjectWord }}上限</text>
            <text class="info-val">
              {{ maxSubmissionsPerUser }} {{ unitWord }}
              <text class="info-extra">（当前已填：{{ currentItemCount }} {{ unitWord }}）</text>
            </text>
          </view>
        </view>

        <!-- 排队信息卡片 -->
        <view class="card">
          <view class="card-header">
            <text class="card-title">排队进度</text>
          </view>

          <view class="queue-summary">
            <view class="q-item">
              <text class="q-label">当前状态</text>
              <text class="q-value">{{ submission.status_text || '—' }}</text>
            </view>

            <view class="q-item">
              <text class="q-label">排队位置</text>
              <text class="q-value">{{ queuePositionText }}</text>
            </view>
          </view>
        </view>

        <!-- 列表卡片（items） + 我的草稿 -->
        <view class="card">
          <view class="card-header card-header-with-action">
            <view>
              <text class="card-title">本次投递的{{ subjectWord }}</text>
              <text class="card-sub">
                已填 {{ currentItemCount }} {{ unitWord }}
                <text v-if="maxSubmissionsPerUser > 0">
                  / 最多 {{ maxSubmissionsPerUser }} {{ unitWord }}
                </text>
              </text>
            </view>

            <!-- 新增投递按钮：达上限则隐藏 -->
            <view v-if="canAddItem" class="card-action">
              <button class="mini-add-btn" type="default" @click="goCreateItem">
                <uni-icons class="mini-add-icon" type="plus" size="18" color="#ffffff" />
                <text class="mini-add-text">新增投递</text>
              </button>
            </view>
          </view>

          <!-- 没有作品 -->
          <view v-if="!submission.items || !submission.items.length" class="empty-box">
            <text class="empty-text">还没有填写任何{{ subjectWord }}信息。</text>
            <text v-if="canAddItem" class="empty-tip">点右上角「新增投递」开始填写。</text>
          </view>

          <!-- 本次投递列表 -->
          <view v-for="item in submission.items" :key="item.id" class="item-row">
            <image
              v-if="getFirstRefImage(item.ref_images)"
              class="item-thumb"
              :src="getFirstRefImage(item.ref_images)"
              mode="aspectFill"
            />
            <view class="item-main" @click="goEditItem(item)">
              <view class="item-title-row">
                <text class="item-title">{{ item.work_subject || '未命名作品' }}</text>
              </view>
              <view class="item-tags">
                <text v-if="item.size" class="item-tag">尺寸：{{ item.size }}</text>
                <text v-if="item.tier_title" class="item-tag">档位：{{ item.tier_title }}</text>
                <text
                  v-if="item.price_total !== undefined && item.price_total !== null"
                  class="item-tag"
                >
                  总价：¥{{ Number(item.price_total) }}
                </text>
              </view>
              <view v-if="item.remark" class="item-remark">{{ item.remark }}</view>
            </view>

            <!-- 编辑按钮 -->
            <view class="item-right">
              <button class="edit-btn" type="default" size="mini" @click.stop="goEditItem(item)">
                <text class="edit-text">编辑</text>
              </button>
            </view>
          </view>

          <!-- 我的草稿 -->
          <view v-if="draftItems.length" class="draft-section">
            <view class="draft-header">
              <text class="draft-title">我的草稿</text>
              <text class="draft-sub">可将草稿绑定到本次投递</text>
            </view>

            <view v-for="d in draftItems" :key="d.id" class="draft-row">
              <image
                v-if="getFirstRefImage(d.ref_images)"
                class="item-thumb"
                :src="getFirstRefImage(d.ref_images)"
                mode="aspectFill"
              />
              <view class="draft-main" @click="goEditItem(d)">
                <view class="item-title-row">
                  <text class="item-title">{{ d.work_subject || '未命名作品' }}</text>
                </view>
                <view class="item-tags">
                  <text v-if="d.size" class="item-tag">尺寸：{{ d.size }}</text>
                  <text v-if="d.tier_title" class="item-tag">档位：{{ d.tier_title }}</text>
                  <text
                    v-if="d.price_total !== undefined && d.price_total !== null"
                    class="item-tag"
                  >
                    总价：¥{{ Number(d.price_total) }}
                  </text>
                </view>
              </view>

              <view class="draft-right">
                <button class="use-btn" type="default" size="mini" @click.stop="useDraft(d)">
                  <text class="use-text">使用</text>
                </button>
              </view>
            </view>
          </view>
        </view>

        <!-- 发起对话按钮（作者 Logo + 文本 + 箭头） -->
        <view v-if="artistLogo" class="chat-entry">
          <button class="chat-btn" type="default" @click="handleStartChat">
            <image :src="artistLogo" class="chat-logo" mode="aspectFill" />
            <text class="chat-text">发起对话</text>
            <uni-icons class="chat-arrow" type="arrowright" size="20" color="#9ca3af" />
          </button>
        </view>

        <!-- 说明 -->
        <view class="hint-box">
          <text class="hint-text">
            提示：本页展示你在当前档期下的本次投递信息和排队进度。如需修改投递内容，可点击每一条投递右侧的「编辑」按钮。
          </text>
        </view>

        <!-- 底部留白：给底部按钮预留空间 -->
        <view style="height: 180rpx;"></view>
      </view>
    </scroll-view>

    <!-- 底部按钮：仅“确认订单 / 去付款”两种 -->
    <view class="bottom-bar" v-if="isLogin && submission.submission_id && bottomAction">
      <button class="pay-btn" type="default" @click="handleBottomAction">
        <text v-if="totalPrice > 0" class="pay-amount">合计 ¥{{ totalPrice }} ·</text>
        <text class="pay-text">{{ bottomActionText }}</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { onLoad, onShow, onHide, onUnload } from '@dcloudio/uni-app'
import { websiteUrl, global } from '@/common/config.js'

/** ====== 状态常量 ====== */
const ItemStatusPending = 0
const ItemStatusQueued = 1
const ItemStatusSelectedPay = 2
const ItemStatusOrdered = 3
const ItemStatusNotSelected = 4
const ItemStatusAbandoned = 5
const ItemStatusExpired = 6

/** ====== 路由参数 ====== */
const submissionId = ref(0)

/** ====== 状态 ====== */
const loading = ref(false)
const hasFirstLoaded = ref(false)
const errorMsg = ref('')
const pollingTimer = ref(null)

/** 用于丢弃过期响应（sid/seq 双校验） */
let fetchSeq = 0

/** H5 hashchange 监听器句柄 */
let h5HashHandler = null

/**
 * submission 排队信息（严格按照后端 SubmissionQueueInfoResp 映射）
 */
const submission = reactive({
  submission_id: 0,
  plan_id: 0,
  mode: 0,
  ahead_count: 0,
  status: 0,
  status_text: '',
  created_at: 0,
  items: []
})

/** 我的草稿（同 plan，submission_id = 0） */
const draftItems = ref([])

/** 单独缓存 plan 信息（不跟着轮询重复请求；每次进页面允许刷新一次） */
const plan = reactive({
  id: 0,
  order_type: 0,
  artist_type: 0,
  service_scene: 0,
  brand_admin_id: 0,
  max_submissions_per_user: 0,
  open_time: 0,
  close_time: 0,
  artist_name: '',
  artist_info: null,
  brand: null
})
const hasLoadedPlan = ref(false)

/** 登录状态 */
const isLogin = computed(() => {
  const token = uni.getStorageSync('token') || ''
  return !!token || !!global.isLogin
})

/** 是否毛娘单：优先用 plan.artist_type（示例：2=毛娘） */
const isHairOrder = computed(() => Number(plan.artist_type || 0) === 2)

/** 名词/量词 */
const subjectWord = computed(() => (isHairOrder.value ? '假毛' : '娃头'))
const unitWord = computed(() => (isHairOrder.value ? '顶' : '颗'))

/** 当前 submission 的作品数量 */
const currentItemCount = computed(() =>
  submission.items && submission.items.length ? submission.items.length : 0
)

/** plan 限制人数 */
const maxSubmissionsPerUser = computed(() => Number(plan.max_submissions_per_user || 0))

/** 是否还能新增作品 */
const canAddItem = computed(() => {
  if (!isLogin.value) return false
  if (!submission.submission_id) return false
  const max = maxSubmissionsPerUser.value
  if (!max || max <= 0) return true
  return currentItemCount.value < max
})

/** 顶部 plan 文本 */
const planBasicText = computed(() => {
  if (!plan.id) return ''
  const typeMap = { 1: '常驻投递', 2: '限时手速', 3: '限时抽选', 4: '限时黑箱' }
  const mode = typeMap[Number(plan.order_type) || 0] || '档期'
  const open = fmtTime(plan.open_time)
  const close = fmtTime(plan.close_time)
  if (plan.open_time && plan.close_time) return `${mode} · ${open} ~ ${close}`
  return mode
})

/** 作者 Logo：优先用 artist_info.LogoImage，其次 brand.logo_image */
const artistLogo = computed(() => {
  if (plan.artist_info) {
    return plan.artist_info.LogoImage || plan.artist_info.logo_image || ''
  }
  if (plan.brand) return plan.brand.logo_image || ''
  return ''
})

/** 作者名称：优先用 artist_info.BrandName，其次 brand.brand_name */
const artistBrandName = computed(() => {
  if (plan.artist_info) {
    return plan.artist_info.BrandName || plan.artist_info.brand_name || ''
  }
  if (plan.brand) return plan.brand.brand_name || ''
  return ''
})

/** 总价（本次投递合计） */
const totalPrice = computed(() => {
  if (!submission.items || !submission.items.length) return 0
  let sum = 0
  submission.items.forEach(it => {
    const v = Number(it.price_total || 0)
    if (!Number.isNaN(v)) sum += v
  })
  return Number(sum.toFixed(2))
})

/** 排队位置文案 */
const queuePositionText = computed(() => {
  const ahead = submission.ahead_count
  const hasAhead = typeof ahead === 'number'

  if (submission.status === ItemStatusQueued) {
    return hasAhead ? `前面还有${ahead}人` : '前面还有--人'
  }

  // 非排队中：显示“您位于n号”（n = ahead_count + 1）
  if (hasAhead) return `您位于${ahead + 1}号`
  return '您位于--号'
})

/** 是否需要“确认订单”（以 status_text 包含“待买家确认”为准，避免后端状态码不一致） */
const needConfirmOrder = computed(() => {
  const t = String(submission.status_text || '')
  return t.includes('待买家确认')
})

/** 底部按钮类型：仅两种 */
const bottomAction = computed(() => {
  if (!isLogin.value || !submission.submission_id) return ''
  if (needConfirmOrder.value) return 'confirm'
  if (submission.status === ItemStatusSelectedPay) return 'pay'
  return ''
})

const bottomActionText = computed(() => {
  if (bottomAction.value === 'confirm') return '确认订单'
  if (bottomAction.value === 'pay') return '去付款'
  return ''
})

/** 时间格式化（秒） */
function fmtTime (ts) {
  if (!ts) return '--'
  const d = new Date(Number(ts) * 1000)
  if (Number.isNaN(d.getTime())) return '--'
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${dd} ${hh}:${mi}`
}

/** 取 ref_images 中的第一张图 */
function getFirstRefImage (refImages) {
  if (!refImages) return ''
  if (Array.isArray(refImages)) return refImages[0] || ''
  const str = String(refImages)
  if (!str) return ''
  const parts = str.split(',').map(s => s.trim()).filter(Boolean)
  return parts[0] || ''
}

/** 从当前路由读取 submission_id（每次 onShow 都要重新读，防止沿用旧值） */
function readSubmissionIdFromRoute () {
  // #ifdef H5
  try {
    const hash = window.location.hash || ''
    const qIndex = hash.indexOf('?')
    if (qIndex >= 0) {
      const qs = hash.slice(qIndex + 1)
      const sp = new URLSearchParams(qs)
      const sid = Number(sp.get('submission_id') || 0)
      if (sid > 0) return sid
    }
  } catch (e) {
    // ignore
  }
  // #endif

  try {
    const pages = getCurrentPages()
    const cur = pages && pages.length ? pages[pages.length - 1] : null
    const opt = (cur && (cur.options || cur.$page?.options)) || {}
    const sid = Number(opt.submission_id || 0)
    if (sid > 0) return sid
  } catch (e) {
    // ignore
  }

  return Number(submissionId.value || 0)
}

/** 进入页面时重置，避免展示旧数据 */
function resetForEnter () {
  stopPolling()

  loading.value = true
  hasFirstLoaded.value = false
  errorMsg.value = ''

  submission.submission_id = 0
  submission.plan_id = 0
  submission.mode = 0
  submission.ahead_count = 0
  submission.status = 0
  submission.status_text = ''
  submission.created_at = 0
  submission.items = []
  draftItems.value = []

  plan.id = 0
  plan.order_type = 0
  plan.artist_type = 0
  plan.service_scene = 0
  plan.brand_admin_id = 0
  plan.max_submissions_per_user = 0
  plan.open_time = 0
  plan.close_time = 0
  plan.artist_name = ''
  plan.artist_info = null
  plan.brand = null
  hasLoadedPlan.value = false
}

/** 确保 submissionId 与当前路由一致；不一致则切换并重置 */
function ensureRouteSubmissionIdFresh () {
  const routeSid = readSubmissionIdFromRoute()
  const prevSid = Number(submissionId.value || 0)

  if (routeSid > 0 && routeSid !== prevSid) {
    console.log('[submission_detail] route sid changed:', { prevSid, routeSid })
    submissionId.value = routeSid
  }

  return Number(submissionId.value || 0)
}

/** 填充 submission + draftItems */
function fillSubmissionFromQueueInfo (raw) {
  if (!raw) return
  submission.submission_id = Number(raw.submission_id || submissionId.value || 0)
  submission.plan_id = Number(raw.plan_id || 0)
  submission.mode = Number(raw.mode || 0)

  if (typeof raw.ahead_count === 'number') submission.ahead_count = raw.ahead_count
  if (typeof raw.status === 'number') submission.status = raw.status
  submission.status_text = raw.status_text || ''

  if (typeof raw.created_at === 'number') submission.created_at = raw.created_at

  submission.items = Array.isArray(raw.items) ? raw.items : []
  draftItems.value = Array.isArray(raw.draft_items) ? raw.draft_items : []
}

/** queue-info 轮询（永远用 sid 快照；过期响应直接丢弃） */
async function fetchDetail (sidArg) {
  const sid = Number(sidArg || submissionId.value || 0)
  if (!isLogin.value || !sid) return

  const seq = ++fetchSeq

  if (!hasFirstLoaded.value) {
    loading.value = true
    errorMsg.value = ''
  }

  try {
    const token = uni.getStorageSync('token') || ''
    console.log('[submission_detail] fetch queue-info:', { sid, seq })

    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/submission/queue-info`,
      method: 'GET',
      header: { Authorization: token },
      data: { submission_id: sid }
    })

    // 若期间切换了 submission_id / 触发了更新 seq，则丢弃旧响应
    if (seq !== fetchSeq) return
    if (sid !== Number(submissionId.value || 0)) return

    const body = res.data || {}
    if (String(body.status).toLowerCase() !== 'success') {
      if (!hasFirstLoaded.value) throw new Error(body.msg || '加载失败')
      console.warn('轮询 submission queue-info 失败：', body.msg)
      return
    }

    const raw = body.data || {}
    fillSubmissionFromQueueInfo(raw)

    if (!hasLoadedPlan.value && submission.plan_id) {
      fetchPlan(submission.plan_id)
    }

    hasFirstLoaded.value = true
  } catch (e) {
    console.error('加载 submission queue-info 失败', e)
    if (!hasFirstLoaded.value) errorMsg.value = e?.message || '加载失败，请稍后重试'
  } finally {
    if (seq === fetchSeq) loading.value = false
  }
}

/** 单独请求 plan 详情 */
async function fetchPlan (planId) {
  if (!planId) return
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/brand-artist/order-plan-info`,
      method: 'GET',
      data: { id: planId }
    })
    const body = res.data || {}
    if (String(body.status).toLowerCase() !== 'success') {
      console.warn('加载 plan 详情失败：', body.msg)
      return
    }
    const d = body.data || {}
    plan.id = d.id || planId
    plan.order_type = d.order_type || 0
    plan.artist_type = Number(d.artist_type || 0)
    plan.service_scene = Number(d.service_scene || 0)
    plan.brand_admin_id = Number(d.brand_admin_id || 0)

    plan.max_submissions_per_user = d.max_submissions_per_user ?? 0
    plan.open_time = Number(d.open_time || 0)
    plan.close_time = Number(d.close_time || 0)
    plan.artist_name = d.artist_name || ''
    plan.artist_info = d.artist_info || null
    plan.brand = d.brand || null

    hasLoadedPlan.value = true
  } catch (e) {
    console.error('请求 plan 详情异常', e)
  }
}

/** 重试 detail */
function reloadDetail () {
  loading.value = true
  hasFirstLoaded.value = false
  errorMsg.value = ''
  fetchDetail(submissionId.value)
}

/** 跳转：新增投递 */
function goCreateItem () {
  if (!submission.submission_id || !submission.plan_id) return
  const url =
    `/pkg-creator/creator_order/submission_item_form/submission_item_form?submission_id=${submission.submission_id}&plan_id=${submission.plan_id}`

  // #ifdef H5
  window.location.hash = url
  // #endif
  // #ifndef H5
  uni.navigateTo({ url })
  // #endif
}

/** 跳转：编辑作品 */
function goEditItem (item) {
  if (!item || !item.id) return
  const url =
    `/pkg-creator/creator_order/submission_item_form/submission_item_form?submission_item_id=${item.id}`

  // #ifdef H5
  window.location.hash = url
  // #endif
  // #ifndef H5
  uni.navigateTo({ url })
  // #endif
}

/** 使用草稿：绑定到本次投递 */
async function useDraft (draft) {
  if (!draft || !draft.id) return
  if (!submission.submission_id) {
    uni.showToast({ title: '投递信息异常，无法绑定', icon: 'none' })
    return
  }

  const token = uni.getStorageSync('token') || ''
  uni.showLoading({ title: '绑定中...', mask: true })
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/item/attach`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        Authorization: token
      },
      data: {
        submission_id: submission.submission_id,
        item_ids: [draft.id]
      }
    })

    const body = res.data || {}
    if (String(body.status).toLowerCase() !== 'success') {
      throw new Error(body.msg || '绑定失败')
    }

    uni.showToast({ title: '已绑定到本次投递', icon: 'success' })
    fetchDetail(submissionId.value)
  } catch (e) {
    console.error('绑定草稿失败', e)
    uni.showToast({ title: e?.message || '绑定失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

/** 发起对话按钮点击：/#/pkg-im/chat/chat?peer_id=brand_admin_id */
function handleStartChat () {
  if (!isLogin.value) {
    uni.showToast({ title: '请先登录后再发起对话', icon: 'none' })
    return
  }
  const peerId = Number(plan.brand_admin_id || 0)
  if (!peerId) {
    uni.showToast({ title: '暂时无法获取对话对象', icon: 'none' })
    return
  }

  const url = `/pkg-im/chat/chat?peer_id=${peerId}`

  // #ifdef H5
  window.location.hash = url
  // #endif
  // #ifndef H5
  uni.navigateTo({ url })
  // #endif
}

/** 底部按钮点击：仅确认订单 / 去付款 */
async function handleBottomAction () {
  if (!bottomAction.value) return
  if (!isLogin.value) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  if (!submission.submission_id) {
    uni.showToast({ title: '投递信息异常', icon: 'none' })
    return
  }

  if (bottomAction.value === 'confirm') {
    await confirmOrder()
    return
  }
  if (bottomAction.value === 'pay') {
    await payNow()
    return
  }
}

/** 确认订单：/with-state/artist-order/submission/confirm-content */
async function confirmOrder () {
  const token = uni.getStorageSync('token') || ''
  uni.showLoading({ title: '确认中...', mask: true })
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/submission/confirm-content`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        Authorization: token
      },
      data: { submission_id: submission.submission_id }
    })

    const body = res.data || {}
    if (String(body.status).toLowerCase() !== 'success') {
      throw new Error(body.msg || '确认失败')
    }

    uni.showToast({ title: '已确认订单', icon: 'success' })
    fetchDetail(submissionId.value)
  } catch (e) {
    console.error('确认订单失败', e)
    uni.showToast({ title: e?.message || '确认失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

/** 去付款：/with-state/artist-order/pay（伪支付） */
async function payNow () {
  const token = uni.getStorageSync('token') || ''
  uni.showLoading({ title: '支付中...', mask: true })
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/pay`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        Authorization: token
      },
      data: { submission_id: submission.submission_id }
    })

    const body = res.data || {}
    if (String(body.status).toLowerCase() !== 'success') {
      throw new Error(body.msg || '支付失败')
    }

    uni.showToast({ title: '支付成功', icon: 'success' })
    fetchDetail(submissionId.value)
  } catch (e) {
    console.error('支付失败', e)
    uni.showToast({ title: e?.message || '支付失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

/** 启动 / 停止轮询 */
function startPolling () {
  stopPolling()
  const sid = Number(submissionId.value || 0)
  if (!sid) return
  fetchDetail(sid)
  pollingTimer.value = setInterval(() => {
    fetchDetail(Number(submissionId.value || 0))
  }, 5000)
}
function stopPolling () {
  if (pollingTimer.value) {
    clearInterval(pollingTimer.value)
    pollingTimer.value = null
  }
}

/** H5：页面展示期间监听 hashchange，确保 submission_id 变化能立即生效 */
function bindH5HashChange () {
  // #ifdef H5
  if (h5HashHandler) return
  h5HashHandler = () => {
    const sid = readSubmissionIdFromRoute()
    if (sid > 0 && sid !== Number(submissionId.value || 0)) {
      submissionId.value = sid
      resetForEnter()
      startPolling()
    }
  }
  window.addEventListener('hashchange', h5HashHandler)
  // #endif
}
function unbindH5HashChange () {
  // #ifdef H5
  if (h5HashHandler) {
    window.removeEventListener('hashchange', h5HashHandler)
    h5HashHandler = null
  }
  // #endif
}

/** ====== 生命周期 ====== */
onLoad((q = {}) => {
  // 首次进入仍然读一次
  submissionId.value = Number(q.submission_id || 0)
  uni.setNavigationBarTitle({ title: '投递详情' })
})

onShow(() => {
  // 所有 API 加载尽量放在 onShow：每次进入都刷新
  bindH5HashChange()

  if (!isLogin.value) {
    stopPolling()
    return
  }

  // 关键：每次 onShow 都重新从路由读 submission_id，避免沿用旧值
  const sid = ensureRouteSubmissionIdFresh()
  if (!sid) {
    stopPolling()
    return
  }

  resetForEnter()
  startPolling()
})

onHide(() => {
  stopPolling()
  unbindH5HashChange()
})

onUnload(() => {
  stopPolling()
  unbindH5HashChange()
})
</script>

<style scoped>
.submission-page {
  min-height: 100vh;
  background: #f6f7fb;
}

/* 滚动容器 */
.scroll-body {
  height: 100vh;
}

/* 主体内容 */
.content {
  padding-bottom: 40rpx;
}

/* ====== 通用卡片 ====== */
.card {
  margin: 24rpx 24rpx 0;
  padding: 24rpx;
  background: #ffffff;
  border-radius: 20rpx;
  box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.06);
}

.card-header {
  margin-bottom: 20rpx;
}
.card-header-with-action {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.card-title {
  font-size: 28rpx;
  color: #222;
  font-weight: 600;
}
.card-sub {
  font-size: 24rpx;
  color: #999;
  margin-top: 6rpx;
}
.card-action {
  margin-left: 16rpx;
}

/* 作者头部 */
.card-header-artist {
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.artist-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: #f3f4f6;
  flex-shrink: 0;
}
.artist-meta {
  display: flex;
  flex-direction: column;
}
.artist-name {
  font-size: 28rpx;
  color: #111827;
  font-weight: 600;
}
.artist-plan-text {
  margin-top: 4rpx;
  font-size: 24rpx;
  color: #9ca3af;
}

/* 信息行 */
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10rpx 0;
}
.info-label {
  font-size: 26rpx;
  color: #555;
}
.info-val {
  font-size: 26rpx;
  color: #111827;
}
.info-extra {
  font-size: 22rpx;
  color: #9ca3af;
}

/* mini 新增按钮 */
.mini-add-btn {
  padding: 0 26rpx;
  height: 60rpx;
  border-radius: 999rpx;
  border: none;
  margin: 0;
  background: linear-gradient(90deg, #89d4ff 0%, #64c7ff 45%, #2fb1ff 75%, #1499f0 100%);
  box-shadow: 0 4rpx 12rpx rgba(24, 144, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
}
.mini-add-icon {
  margin-right: 6rpx;
}
.mini-add-text {
  font-size: 24rpx;
  color: #ffffff;
  font-weight: 600;
}

/* 排队信息 */
.queue-summary {
  margin-top: 4rpx;
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
}
.q-item {
  flex: 1;
  padding: 16rpx;
  border-radius: 16rpx;
  background: #f7f8fc;
}
.q-label,
.q-value {
  display: block;
  width: 100%;
}
.q-label {
  font-size: 24rpx;
  color: #6b7280;
}
.q-value {
  margin-top: 6rpx;
  font-size: 28rpx;
  color: #111827;
  font-weight: 600;
}

/* 空状态 */
.empty-box {
  padding: 10rpx 4rpx 4rpx;
}
.empty-text {
  font-size: 26rpx;
  color: #777;
}
.empty-tip {
  display: block;
  margin-top: 4rpx;
  font-size: 24rpx;
  color: #9ca3af;
}

/* 作品 / 草稿列表通用 */
.item-row,
.draft-row {
  margin-top: 16rpx;
  padding: 16rpx;
  border-radius: 16rpx;
  background: #f7f8fc;
  display: flex;
  align-items: stretch;
  gap: 12rpx;
}

.item-thumb {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
  background: #e5e7eb;
  flex-shrink: 0;
}

.item-main,
.draft-main {
  flex: 1;
}
.item-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.item-title {
  font-size: 28rpx;
  color: #111827;
  font-weight: 600;
}
.item-tags {
  margin-top: 6rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}
.item-tag {
  padding: 4rpx 10rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  color: #111827;
  background: #e0efff;
}
.item-remark {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #6b7280;
  line-height: 1.6;
}

/* 作品右侧编辑按钮 */
.item-right {
  display: flex;
  align-items: center;
}
.edit-btn {
  border-radius: 999rpx;
  height: 60rpx;
  padding: 0 20rpx;
  border: 1rpx solid #9ca3af;
  background: #ffffff;
  margin: 0;
}
.edit-text {
  font-size: 24rpx;
  color: #374151;
}

/* 我的草稿区域 */
.draft-section {
  margin-top: 20rpx;
  border-top: 1rpx dashed #e5e7eb;
  padding-top: 16rpx;
}
.draft-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}
.draft-title {
  font-size: 26rpx;
  color: #111827;
  font-weight: 600;
}
.draft-sub {
  font-size: 24rpx;
  color: #9ca3af;
}
.draft-right {
  display: flex;
  align-items: center;
}
.use-btn {
  border-radius: 999rpx;
  height: 60rpx;
  padding: 0 24rpx;
  border: 1rpx solid #22c55e;
  background: #ecfdf3;
  margin: 0;
}
.use-text {
  font-size: 24rpx;
  color: #16a34a;
  font-weight: 500;
}

/* 发起对话按钮区域 */
.chat-entry {
  margin: 24rpx 24rpx 0;
}
.chat-btn {
  width: 100%;
  height: 88rpx;
  border-radius: 999rpx;
  border: none;
  margin: 0;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  box-shadow: 0 6rpx 20rpx rgba(15, 23, 42, 0.06);
}
.chat-btn::after {
  border: none;
}
.chat-logo {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  margin-right: 16rpx;
  background: #f3f4f6;
}
.chat-text {
  flex: 1;
  font-size: 26rpx;
  color: #111827;
  font-weight: 600;
}
.chat-arrow {
  margin-left: 8rpx;
}

/* 提示 */
.hint-box {
  margin: 18rpx 24rpx 0;
}
.hint-text {
  font-size: 24rpx;
  color: #888;
  line-height: 1.7;
}

/* ====== 底部按钮 ====== */
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 10rpx 24rpx calc(22rpx + env(safe-area-inset-bottom));
  background: rgba(246, 247, 251, 0.98);
  box-shadow: 0 -4rpx 12rpx rgba(15, 23, 42, 0.06);
  display: flex;
  justify-content: center;
  z-index: 10;
}
.pay-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 999rpx;
  margin: 0;
  padding: 0;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(90deg, #89d4ff 0%, #abe1ff 45%, #d5cbff 75%, #8afdff 100%);
  box-shadow: 0 6rpx 20rpx rgba(24, 144, 255, 0.25);
}
.pay-btn::after {
  border: none;
}
.pay-amount {
  font-size: 26rpx;
  color: #374151;
  margin-right: 8rpx;
}
.pay-text {
  font-size: 28rpx;
  color: #374151;
  font-weight: 700;
}

/* ====== 通用状态视图 ====== */
.state-box {
  margin: 120rpx 24rpx 0;
  padding: 24rpx;
  text-align: center;
  color: #555;
}
.state-title {
  font-size: 30rpx;
  font-weight: 600;
  margin-bottom: 8rpx;
}
.state-desc {
  font-size: 24rpx;
  color: #888;
}
.state-error .state-title {
  color: #f43f5e;
}
.primary-btn {
  margin-top: 20rpx;
  border-radius: 999rpx;
  padding: 10rpx 40rpx;
  font-size: 26rpx;
  background: linear-gradient(90deg, #89d4ff 0%, #64c7ff 45%, #2fb1ff 75%, #1499f0 100%);
  color: #ffffff;
}

/* 隐藏 H5 滚动条 */
::-webkit-scrollbar {
  width: 0 !important;
  height: 0 !important;
  background: transparent !important;
  display: none !important;
}
</style>
