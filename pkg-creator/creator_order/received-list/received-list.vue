<!-- pkg-creator/creator_order/received-list/received-list.vue -->
<template>
  <view-logs />
  <view class="booking-page received-page">
    <z-paging
      ref="paging"
      v-model="innerList"
      @query="queryList"
      :default-page-size="pageSize"
      :refresher-enabled="true"
      :use-custom-refresher="true"
      show-loading-more-when-reload
      :auto="true"
      :loading-more-enabled="true"
      :to-bottom-loading-more-enabled="true"
      :inside-more="true"
      class="paging-root"
    >
      <template #refresher="{ refresherStatus }">
        <view class="custom-refresher">
          <image
            v-if="isRefresherGif(refresherStatus)"
            class="custom-refresher-icon"
            src="/static/new-icon/loading.gif"
            mode="widthFix"
          />
          <image
            v-else
            class="custom-refresher-icon"
            src="/static/new-icon/loading.png"
            mode="widthFix"
          />
        </view>
      </template>

      <view class="page-header">
        <view class="card page-switch-card">
          <view class="page-switch" :class="{ creations: activeMainTab === 'creations' }">
            <view class="switch-indicator"></view>
            <view class="switch-item" :class="{ active: activeMainTab === 'orders' }" @tap="switchMainTab('orders')">
              我的订单
            </view>
            <view class="switch-item" :class="{ active: activeMainTab === 'creations' }" @tap="switchMainTab('creations')">
              我的创作
            </view>
          </view>
        </view>

        <view class="card order-toolbar">
          <view class="toolbar-head">
            <text class="toolbar-title font-alimamashuhei">{{ currentToolbarTitle }}</text>
            <text class="toolbar-sub">{{ currentToolbarSub }}</text>
          </view>
          <view class="toolbar-grid">
            <view
              v-for="op in currentOps"
              :key="op.key"
              class="toolbar-item"
              :class="{ active: isOpActive(op), schedule: op.key === 'schedule' }"
              @tap="handleToolbarTap(op)"
            >
              <view class="toolbar-icon-wrap">
                <uni-icons :type="op.icon" :size="22" :color="toolbarIconColor(op)" />
                <text
                  v-if="showToolbarBadge(op)"
                  class="toolbar-badge font-title"
                >
                  {{ formatToolbarBadge(getToolbarCount(op.key)) }}
                </text>
              </view>
              <text class="toolbar-label font-alimamashuhei">{{ op.label }}</text>
            </view>
          </view>
        </view>

        <view class="card summary-card" v-if="showSummaryCard">
          <view class="summary-row">
            <text class="summary-label">当前筛选</text>
            <text class="summary-value" v-if="activeMainTab === 'orders'">
              {{ currentFilterLabel }} · 共 <text class="font-title">{{ currentSubmissionCount }}</text> 笔投递
            </text>
            <text class="summary-value" v-else>
              {{ currentFilterLabel }} · 共 <text class="font-title">{{ filteredCreations.length }}</text> 个子单（<text class="font-title">{{ filteredSubmissionCount }}</text> 笔投递）
            </text>
          </view>
          <view class="summary-row">
            <text class="summary-label">{{ activeMainTab === 'orders' ? '总金额' : '创作金额' }}</text>
            <text class="summary-value price font-title">
              ¥ {{ formatPrice(activeMainTab === 'orders' ? currentTotalAmount : currentFilteredAmount) }}
            </text>
          </view>
        </view>
      </view>

      <view class="body-container">
        <view class="list-wrapper" :class="{ 'content-enter-anim': contentAnimating }">
          <template v-if="activeMainTab === 'orders'">
            <view
              v-for="row in filteredSubmissions"
              :key="`order-${getSubmissionId(row)}`"
              class="card item-card"
              @tap="goSubmissionDetail(row)"
            >
              <view class="item-header">
                <text class="item-title">
                  {{ buildSubmissionSubject(row) || '未填写作品标题' }}
                </text>
                <order-status :status="getSubmissionStatus(row)" />
              </view>

              <view class="item-row">
                <text class="item-label">投递用户</text>
                <text class="item-value font-title">UID {{ getSubmissionUserId(row) || '-' }}</text>
              </view>

              <view class="item-row">
                <text class="item-label">投递时间</text>
                <text class="item-value font-title">{{ formatTime(getSubmissionCreatedAt(row)) }}</text>
              </view>

              <view class="item-row">
                <text class="item-label">作品数量</text>
                <text class="item-value font-title">{{ getItems(row).length }} 个作品</text>
              </view>

              <view class="item-row" v-if="Number(row.total_amount) > 0">
                <text class="item-label">订单总金额</text>
                <text class="item-value price font-title">¥ {{ formatPrice(row.total_amount) }}</text>
              </view>

              <view class="items-block" v-if="getItems(row).length">
                <view class="sub-item" v-for="it in getItems(row)" :key="it.id || it.ID">
                  <view class="sub-item-main-row">
                    <view class="sub-item-cover-wrap" v-if="getFirstImage(it)">
                      <image class="sub-item-cover" :src="getFirstImage(it)" mode="aspectFill" />
                    </view>

                    <view class="sub-item-main">
                      <view class="sub-item-title-row">
                        <text class="sub-item-title">{{ (it.work_subject || '').trim() || '未命名作品' }}</text>
                        <text class="sub-item-price font-title" v-if="calcItemTotal(it) > 0">
                          ¥ {{ formatPrice(calcItemTotal(it)) }}
                        </text>
                      </view>

                      <view class="sub-item-meta-row">
                        <text class="sub-item-meta stage" v-if="getItemStageLabel(row, it)">
                          {{ getItemStageLabel(row, it) }}
                        </text>
                        <text class="sub-item-meta" v-if="(it.size || '').trim()">{{ (it.size || '').trim() }}</text>
                        <text class="sub-item-meta" v-if="(it.tier_title || '').trim()">档位：{{ (it.tier_title || '').trim() }}</text>
                        <text class="sub-item-meta" v-if="getItemAddonsTitles(it)">加购：{{ getItemAddonsTitles(it) }}</text>
                        <text class="sub-item-meta adjust" v-if="Number(it.adjust_price) !== 0">
                          调价：{{ it.adjust_price > 0 ? '+' : '' }}{{ formatPrice(it.adjust_price) }}
                        </text>
                      </view>
                    </view>
                  </view>
                </view>
              </view>

              <view class="item-footer">
                <view class="item-footer-left"></view>
                <view class="item-footer-right">
                  <view class="btn-chat-plain" @tap.stop="startChatBySubmission(row)">
                    <text class="btn-chat-plain-text">发起会话</text>
                    <uni-icons type="arrow-right" size="14" color="#4b5563" />
                  </view>
                </view>
              </view>
            </view>
          </template>

          <template v-else>
            <view
              v-for="creation in filteredCreations"
              :key="`creation-${creation.key}`"
              class="card creation-item-card"
              @tap="goCreationDetail(creation)"
            >
              <view class="item-header">
                <text class="item-title">{{ creation.subject || '未命名作品' }}</text>
                <text class="stage-pill" :class="`stage-${creation.stage}`">{{ formatCreationStage(creation.stage) }}</text>
              </view>

              <view class="sub-item-main-row">
                <view class="sub-item-cover-wrap" v-if="creation.cover">
                  <image class="sub-item-cover" :src="creation.cover" mode="aspectFill" />
                </view>

                <view class="sub-item-main">
                  <view class="sub-item-meta-row">
                    <text class="sub-item-meta" v-if="creation.size">{{ creation.size }}</text>
                    <text class="sub-item-meta" v-if="creation.tier">档位：{{ creation.tier }}</text>
                    <text class="sub-item-meta" v-if="creation.addons">加购：{{ creation.addons }}</text>
                  </view>

                  <view class="item-row compact">
                    <text class="item-label">投递编号</text>
                    <text class="item-value font-title">#{{ creation.submission_id }}</text>
                  </view>

                  <view class="item-row compact">
                    <text class="item-label">投递用户</text>
                    <text class="item-value font-title">UID {{ creation.buyer_uid || '-' }}</text>
                  </view>

                  <view class="item-row compact">
                    <text class="item-label">创建时间</text>
                    <text class="item-value font-title">{{ formatTime(creation.created_at) }}</text>
                  </view>
                </view>
              </view>

              <view class="item-row amount-row" v-if="creation.total_amount > 0">
                <text class="item-label">创作金额</text>
                <text class="item-value price font-title">¥ {{ formatPrice(creation.total_amount) }}</text>
              </view>

              <view class="item-footer">
                <view class="item-footer-left"></view>
                <view class="item-footer-right">
                  <button class="btn-view" @tap.stop="goCreationDetail(creation)">查看详情</button>
                  <view class="btn-chat-plain" @tap.stop="startChatByCreation(creation)">
                    <text class="btn-chat-plain-text">发起会话</text>
                    <uni-icons type="arrow-right" size="14" color="#4b5563" />
                  </view>
                </view>
              </view>
            </view>
          </template>
        </view>
      </view>

      <template #empty>
        <view class="empty-box">
          <image class="empty-icon" src="/static/empty.png" mode="aspectFit" />
          <text class="empty-text">{{ emptyText }}</text>
        </view>
      </template>
    </z-paging>
  </view>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { websiteUrl } from '@/common/config.js'
import OrderStatus from '@/components/order_status/order_status.vue'

const planId = ref(0)

const paging = ref(null)
const innerList = ref([])
const pageSize = 20

const rawList = ref([])
const totalCount = ref(0)

// “我的创作”只统计已经进入创作流程的父单。
// 待确认、待付款、排队中的投递不应出现在创作阶段筛选里。
const creationSubmissionStatuses = Object.freeze([4, 8, 9])

const activeMainTab = ref('orders')
const contentAnimating = ref(false)

const orderOps = Object.freeze([
  { key: 'all', label: '全部', icon: 'list', statuses: [] },
  { key: 'need_confirm', label: '待确认', icon: 'compose', statuses: [1, 2] },
  { key: 'need_pay', label: '待付款', icon: 'info-filled', statuses: [3] },
  { key: 'processing', label: '进行中', icon: 'spinner-cycle', statuses: [0, 4, 8] },
  { key: 'closed', label: '已结束', icon: 'checkbox-filled', statuses: [5, 6, 7, 9] },
])

const creationOps = Object.freeze([
  { key: 'all', label: '全部', icon: 'list' },
  { key: 'not_started', label: '未开始', icon: 'info-filled' },
  { key: 'in_progress', label: '进行中', icon: 'spinner-cycle' },
  { key: 'finished', label: '待寄回', icon: 'checkbox-filled' },
  { key: 'returned', label: '已寄回', icon: 'redo' },
  { key: 'received', label: '已完结', icon: 'checkmarkempty' },
  { key: 'reviewed', label: '已评论', icon: 'chatbubble' },
  { key: 'schedule', label: '排期', icon: 'calendar' },
])

const currentOrderFilter = ref('all')
const currentCreationFilter = ref('all')

const currentOps = computed(() => (activeMainTab.value === 'orders' ? orderOps : creationOps))

const currentFilterLabel = computed(() => {
  const key = activeMainTab.value === 'orders' ? currentOrderFilter.value : currentCreationFilter.value
  const op = currentOps.value.find((o) => o.key === key)
  return op ? op.label : '全部'
})

const currentToolbarTitle = computed(() => (activeMainTab.value === 'orders' ? '订单操作栏' : '创作操作栏'))

const currentToolbarSub = computed(() => {
  if (activeMainTab.value === 'orders') {
    return `共 ${totalCount.value} 笔投递`
  }
  return `共 ${totalCreationCount.value} 个子单`
})

const allSubmissions = computed(() => rawList.value || [])

function isInStatuses(status, statuses) {
  if (!Array.isArray(statuses) || statuses.length === 0) return true
  return statuses.includes(Number(status))
}

const filteredSubmissions = computed(() => {
  const list = allSubmissions.value
  if (currentOrderFilter.value === 'all') return list
  const op = orderOps.find((o) => o.key === currentOrderFilter.value)
  if (!op) return list
  return list.filter((row) => isInStatuses(getSubmissionStatus(row), op.statuses))
})

const orderToolbarCountMap = computed(() => {
  const list = allSubmissions.value || []
  const map = {}
  orderOps.forEach((op) => {
    if (op.key === 'all') {
      map[op.key] = list.length
      return
    }
    map[op.key] = list.reduce((sum, row) => sum + (isInStatuses(getSubmissionStatus(row), op.statuses) ? 1 : 0), 0)
  })
  return map
})

const currentSubmissionCount = computed(() => filteredSubmissions.value.length)

const currentTotalAmount = computed(() => {
  return filteredSubmissions.value.reduce((sum, row) => {
    const n = Number(row.total_amount || 0)
    if (Number.isNaN(n)) return sum
    return sum + n
  }, 0)
})

const allCreations = computed(() => {
  const rows = allSubmissions.value
  const out = []

  rows.forEach((row) => {
    const submission = getSubmission(row)
    const submissionID = Number(submission.id || submission.ID || 0)
    if (!submissionID) return
    if (!creationSubmissionStatuses.includes(getSubmissionStatus(row))) return

    const buyerUID = Number(submission.user_id || submission.userId || 0)
    const submissionCreatedAt = Number(submission.created_at || submission.createdAt || 0)
    const planID = Number(submission.plan_id || submission.planId || 0)

    const stageMap = getStageMap(row)
    const items = getItems(row)

    items.forEach((item) => {
      const itemID = Number(item.id || item.ID || 0)
      if (!itemID) return

      const stage = stageMap[itemID] || 'not_started'
      const createdAt = Number(item.created_at || item.createdAt || submissionCreatedAt || 0)
      const subject = (item.work_subject || '').trim() || '未命名作品'

      out.push({
        key: `${submissionID}-${itemID}`,
        submission,
        item,
        submission_id: submissionID,
        item_id: itemID,
        plan_id: planID,
        buyer_uid: buyerUID,
        created_at: createdAt,
        stage,
        subject,
        cover: getFirstImage(item),
        size: (item.size || '').trim(),
        tier: (item.tier_title || '').trim(),
        addons: getItemAddonsTitles(item),
        total_amount: calcItemTotal(item),
      })
    })
  })

  return out
})

const filteredCreations = computed(() => {
  const list = allCreations.value
  if (currentCreationFilter.value === 'all' || currentCreationFilter.value === 'schedule') return list
  return list.filter((row) => row.stage === currentCreationFilter.value)
})

const creationToolbarCountMap = computed(() => {
  const list = allCreations.value || []
  const map = {}
  creationOps.forEach((op) => {
    if (op.key === 'schedule') return
    if (op.key === 'all') {
      map[op.key] = list.length
      return
    }
    map[op.key] = list.reduce((sum, row) => sum + (row.stage === op.key ? 1 : 0), 0)
  })
  return map
})

const totalCreationCount = computed(() => Number(creationToolbarCountMap.value.all || 0))

const filteredSubmissionCount = computed(() => {
  const set = new Set()
  filteredCreations.value.forEach((row) => {
    if (row.submission_id) set.add(row.submission_id)
  })
  return set.size
})

const currentFilteredAmount = computed(() => {
  return filteredCreations.value.reduce((sum, row) => sum + Number(row.total_amount || 0), 0)
})

const showSummaryCard = computed(() => {
  if (activeMainTab.value === 'orders') return filteredSubmissions.value.length > 0
  return filteredCreations.value.length > 0
})

const emptyText = computed(() => (activeMainTab.value === 'orders' ? '还没有收到相关投递' : '还没有创作子单'))

function switchMainTab(tab) {
  if (tab !== 'orders' && tab !== 'creations') return
  if (activeMainTab.value === tab) return
  activeMainTab.value = tab
  triggerContentEnter()
}

function triggerContentEnter() {
  contentAnimating.value = false
  nextTick(() => {
    contentAnimating.value = true
    setTimeout(() => {
      contentAnimating.value = false
    }, 260)
  })
}

function getToolbarCount(key) {
  if (activeMainTab.value === 'orders') return Number(orderToolbarCountMap.value[key] || 0)
  return Number(creationToolbarCountMap.value[key] || 0)
}

function showToolbarBadge(op) {
  if (!op) return false
  if (activeMainTab.value === 'creations' && op.key === 'schedule') return false
  return getToolbarCount(op.key) > 0
}

function formatToolbarBadge(n) {
  const num = Number(n || 0)
  if (num > 99) return '99+'
  return String(num)
}

function isOpActive(op) {
  if (!op) return false
  if (activeMainTab.value === 'orders') return currentOrderFilter.value === op.key
  return currentCreationFilter.value === op.key
}

function toolbarIconColor(op) {
  if (!op) return '#8a97ab'
  if (op.key === 'schedule') return '#5b6d86'
  return isOpActive(op) ? '#2f5d8f' : '#8a97ab'
}

function resolvePlanIDForSchedule() {
  if (planId.value) return Number(planId.value)
  const fromCreation = filteredCreations.value[0] || allCreations.value[0] || null
  if (fromCreation && Number(fromCreation.plan_id || 0) > 0) return Number(fromCreation.plan_id || 0)
  const fromOrder = filteredSubmissions.value[0] || allSubmissions.value[0] || null
  return Number(getSubmission(fromOrder)?.plan_id || 0)
}

function handleToolbarTap(op) {
  if (!op) return
  if (activeMainTab.value === 'orders') {
    currentOrderFilter.value = op.key
    return
  }

  if (op.key === 'schedule') {
    const pid = resolvePlanIDForSchedule()
    if (!pid) {
      uni.showToast({ title: '暂无可排期的计划', icon: 'none' })
      return
    }
    uni.navigateTo({
      url: `/pkg-creator/creator_order/schedule_board/schedule_board?plan_id=${pid}`,
    })
    return
  }

  currentCreationFilter.value = op.key
}

function isRefresherGif(status) {
  if (status === 'loading') return true
  if (status === 2) return true
  return false
}

function getSubmission(row) {
  if (!row) return {}
  return row.submission || row.Submission || {}
}

function getSubmissionId(row) {
  const sub = getSubmission(row)
  return sub.id || sub.ID || 0
}

function getSubmissionStatus(row) {
  const sub = getSubmission(row)
  const s = sub.status ?? sub.Status
  return s === undefined || s === null ? -1 : Number(s)
}

function getSubmissionUserId(row) {
  const sub = getSubmission(row)
  return sub.user_id || sub.userId || 0
}

function getSubmissionCreatedAt(row) {
  const sub = getSubmission(row)
  return sub.created_at || sub.createdAt || 0
}

function getItems(row) {
  if (!row) return []
  return row.items || row.Items || []
}

function getItemStageRows(row) {
  if (!row) return []
  const list = row.item_stages || row.itemStages || []
  return Array.isArray(list) ? list : []
}

function getStageMap(row) {
  const map = {}
  const list = getItemStageRows(row)
  list.forEach((it) => {
    const itemId = Number(it?.item_id || it?.itemId || 0)
    const stage = String(it?.stage || '').trim()
    if (!itemId || !stage) return
    map[itemId] = stage
  })
  return map
}

function getItemStageLabel(row, item) {
  if (!row || !item) return ''
  const itemID = Number(item.id || item.ID || 0)
  if (!itemID) return ''
  const stage = getStageMap(row)[itemID] || ''
  if (stage === 'not_started') return '未开始'
  if (stage === 'in_progress') return '进行中'
  if (stage === 'finished') return '待寄回'
  if (stage === 'returned') return '已寄回'
  if (stage === 'received') return '已完结'
  if (stage === 'reviewed') return '已评论'
  return ''
}

function formatCreationStage(stage) {
  if (stage === 'not_started') return '未开始'
  if (stage === 'in_progress') return '进行中'
  if (stage === 'finished') return '待寄回'
  if (stage === 'returned') return '已寄回'
  if (stage === 'received') return '已完结'
  if (stage === 'reviewed') return '已评论'
  return '未开始'
}

function buildSubmissionSubject(row) {
  const items = getItems(row)
  if (!items.length) return ''
  const first = items[0] || {}
  const parts = []
  const subject = (first.work_subject || '').trim()
  const size = (first.size || '').trim()
  const tier = (first.tier_title || '').trim()

  if (subject) parts.push(subject)
  if (size) parts.push(size)
  if (tier) parts.push(tier)

  return parts.join(' / ')
}

function getFirstImage(item) {
  const src = item.ref_images || item.refImages || ''
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
    console.warn('parseAddons failed', e)
    return []
  }
}

function getItemAddonsTitles(item) {
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
  const b = Number.isFinite(base) ? base : 0
  const a = Number.isFinite(adjust) ? adjust : 0
  return b + a
}

function formatPrice(price) {
  const n = Number(price || 0)
  if (!Number.isFinite(n)) return '0.00'
  return n.toFixed(2)
}

function pad2(n) {
  return n < 10 ? `0${n}` : `${n}`
}

function formatTime(ts) {
  const n = Number(ts || 0)
  if (!n) return '-'
  const d = new Date(n * 1000)
  const y = d.getFullYear()
  const m = pad2(d.getMonth() + 1)
  const day = pad2(d.getDate())
  const h = pad2(d.getHours())
  const mi = pad2(d.getMinutes())
  return `${y}-${m}-${day} ${h}:${mi}`
}

function goSubmissionDetail(row) {
  const sub = getSubmission(row)
  const submissionId = sub.id || sub.ID
  if (!submissionId) {
    uni.showToast({ title: '缺少 submission_id', icon: 'none' })
    return
  }
  uni.navigateTo({
    url: `/pkg-creator/creator_order/received-detail/received-detail?submission_id=${submissionId}`,
  })
}

function goCreationDetail(row) {
  const submissionID = Number(row?.submission_id || 0)
  const itemID = Number(row?.item_id || 0)
  if (!submissionID || !itemID) {
    uni.showToast({ title: '缺少作品参数', icon: 'none' })
    return
  }
  uni.navigateTo({
    url: `/pkg-creator/creator_order/submission_item_detail/submission_item_detail?submission_id=${submissionID}&item_id=${itemID}`,
  })
}

function startChatBySubmission(row) {
  const uid = getSubmissionUserId(row)
  if (!uid) {
    uni.showToast({ title: '缺少对方 UID', icon: 'none' })
    return
  }
  uni.navigateTo({
    url: `/pkg-im/chat/chat?peer_id=${uid}`,
  })
}

function startChatByCreation(row) {
  const uid = Number(row?.buyer_uid || 0)
  if (!uid) {
    uni.showToast({ title: '缺少对方 UID', icon: 'none' })
    return
  }
  uni.navigateTo({
    url: `/pkg-im/chat/chat?peer_id=${uid}`,
  })
}

function computeSubmissionTotal(items) {
  if (!items || !items.length) return 0
  return items.reduce((sum, it) => sum + calcItemTotal(it), 0)
}

async function queryList(pageNo, pageSizeArg) {
  const size = pageSizeArg || pageSize
  const token = uni.getStorageSync('token') || ''

  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/received-submissions`,
      method: 'GET',
      data: {
        page: pageNo,
        size,
        plan_id: planId.value || undefined,
        include_queue: 0,
      },
      header: token ? { Authorization: token } : {},
    })

    const body = res.data || {}
    const payload = body.data || body
    const list = payload.list || []
    const pageInfo = payload.page || {}

    const totalSubmissions = Number(pageInfo.total || 0)
    totalCount.value = totalSubmissions

    const normalized = list.map((row) => {
      const submission = row.submission || row.Submission || {}
      const items = row.items || row.Items || []
      const queueStat = row.queue_stat || row.queueStat || null
      const itemStages = row.item_stages || row.itemStages || []
      const itemStats = row.item_stage_stats || row.itemStageStats || {}

      return {
        submission,
        items,
        queue_stat: queueStat,
        item_stages: Array.isArray(itemStages) ? itemStages : [],
        item_stage_stats: itemStats || {},
        total_amount: computeSubmissionTotal(items),
      }
    })

    if (pageNo === 1) {
      rawList.value = normalized
    } else {
      rawList.value = rawList.value.concat(normalized)
    }

    if (paging.value) {
      paging.value.complete(normalized, totalSubmissions)
    } else {
      innerList.value = normalized
    }
  } catch (err) {
    console.error('fetch received submissions failed', err)
    uni.showToast({ title: '加载失败，请稍后重试', icon: 'none' })
    if (paging.value) paging.value.complete(false)
  }
}

onLoad((options) => {
  uni.setNavigationBarTitle({ title: '我的订单' })

  if (options && options.plan_id) {
    const pid = Number(options.plan_id)
    if (!Number.isNaN(pid)) {
      planId.value = pid
    }
  }

  if (options && options.tab) {
    const t = String(options.tab).trim().toLowerCase()
    if (t === 'creations' || t === 'creation') {
      activeMainTab.value = 'creations'
    } else {
      activeMainTab.value = 'orders'
    }
  }

  triggerContentEnter()
})
</script>

<style lang="scss" scoped>
.received-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f7f9fc 0%, #f3f5f9 48%, #f6f7fb 100%);
  box-sizing: border-box;
}

.paging-root {
}

.custom-refresher {
  height: 160rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.custom-refresher-icon {
  width: 120rpx;
}

.page-header {
  padding-top: 40rpx;
}

.card {
  margin: 0 24rpx 24rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background-color: #fff;
  border: 1rpx solid #edf1f6;
  box-shadow: 0 8rpx 18rpx rgba(39, 48, 67, 0.04);
}

.page-switch-card {
  padding: 10rpx;
}

.page-switch {
  position: relative;
  display: flex;
  align-items: center;
  background: #f2f5fb;
  border-radius: 999rpx;
  padding: 6rpx;
}

.switch-indicator {
  position: absolute;
  left: 6rpx;
  top: 6rpx;
  width: calc((100% - 12rpx) / 2);
  height: calc(100% - 12rpx);
  border-radius: 999rpx;
  background: #fff;
  box-shadow: 0 6rpx 14rpx rgba(39, 48, 67, 0.08);
  transition: transform 0.24s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-switch.creations .switch-indicator {
  transform: translateX(100%);
}

.switch-item {
  position: relative;
  z-index: 1;
  flex: 1;
  height: 62rpx;
  line-height: 62rpx;
  border-radius: 999rpx;
  text-align: center;
  font-size: 24rpx;
  color: #6d7990;
  font-weight: 600;
  transition: color 0.2s ease;
}

.switch-item.active {
  color: #273043;
}

.order-toolbar {
  padding: 24rpx 20rpx 18rpx;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
}

.toolbar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8rpx;
  margin-bottom: 16rpx;
}

.toolbar-title {
  font-size: 28rpx;
  color: #273043;
  font-weight: 700;
}

.toolbar-sub {
  font-size: 22rpx;
  color: #8e99aa;
}

.toolbar-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12rpx;
}

.toolbar-item {
  border-radius: 16rpx;
  min-height: 124rpx;
  padding: 14rpx 10rpx 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f2f4f8;
  box-sizing: border-box;
  transition: all 0.2s ease;
}

.toolbar-item.active {
  background: #e9eff8;
  transform: translateY(-1rpx);
}

.toolbar-item.schedule {
  background: #eef3fb;
}

.toolbar-icon-wrap {
  position: relative;
  width: 48rpx;
  height: 48rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.toolbar-badge {
  position: absolute;
  right: -14rpx;
  top: -8rpx;
  min-width: 30rpx;
  height: 30rpx;
  border-radius: 999rpx;
  padding: 0 8rpx;
  line-height: 30rpx;
  font-size: 17rpx;
  text-align: center;
  color: #fff;
  background: #ff6f8f;
}

.toolbar-label {
  margin-top: 10rpx;
  font-size: 22rpx;
  color: #5f6775;
}

.toolbar-item.active .toolbar-label {
  color: #273043;
  font-weight: 700;
}

.summary-card {
  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 4rpx;
  }

  .summary-label {
    font-size: 24rpx;
    color: #8692a6;
  }

  .summary-value {
    font-size: 26rpx;
    color: #273043;
  }

  .summary-value.price {
    font-weight: 600;
    color: #e35a4b;
  }
}

.list-wrapper {
  padding-bottom: 40rpx;
}

.content-enter-anim {
  animation: fadeInUpContent 0.24s ease both;
}

@keyframes fadeInUpContent {
  from {
    opacity: 0;
    transform: translateY(18rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.empty-box {
  margin: 80rpx auto 0;
  width: 60%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon {
  width: 220rpx;
  height: 220rpx;
  opacity: 0.8;
}

.empty-text {
  margin-top: 12rpx;
  font-size: 26rpx;
  color: #999;
}

.item-card,
.creation-item-card {
  margin-bottom: 16rpx;
}

.item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12rpx;
}

.item-title {
  flex: 1;
  margin-right: 16rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #1f2735;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-top: 8rpx;
}

.item-row.compact {
  margin-top: 4rpx;
}

.item-row.amount-row {
  margin-top: 16rpx;
}

.item-label {
  font-size: 24rpx;
  color: #8692a6;
}

.item-value {
  font-size: 24rpx;
  color: #273043;
}

.item-value.price {
  font-weight: 600;
  color: #e35a4b;
}

.items-block {
  margin-top: 20rpx;
  padding-top: 16rpx;
  border-top: 1rpx dashed #eee;
}

.sub-item {
  margin-top: 12rpx;
}

.sub-item:first-child {
  margin-top: 0;
}

.sub-item-main-row {
  display: flex;
  align-items: flex-start;
}

.sub-item-cover-wrap {
  width: 120rpx;
  height: 120rpx;
  border-radius: 16rpx;
  overflow: hidden;
  margin-right: 16rpx;
  background-color: #f6f6f8;
}

.sub-item-cover {
  width: 100%;
  height: 100%;
}

.sub-item-main {
  flex: 1;
}

.sub-item-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sub-item-title {
  flex: 1;
  margin-right: 16rpx;
  font-size: 26rpx;
  color: #1f2735;
}

.sub-item-price {
  font-size: 24rpx;
  color: #e35a4b;
  font-weight: 600;
}

.sub-item-meta-row {
  margin-top: 6rpx;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.sub-item-meta {
  margin-right: 16rpx;
  margin-bottom: 4rpx;
  font-size: 22rpx;
  color: #758096;
}

.sub-item-meta.stage {
  margin-right: 12rpx;
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  color: #4e6c94;
  background: #eaf2ff;
}

.sub-item-meta.adjust {
  color: #c46b3d;
}

.stage-pill {
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  font-weight: 600;
}

.stage-not_started {
  color: #5f6f86;
  background: #edf2fa;
}

.stage-in_progress {
  color: #2f6289;
  background: #dff1ff;
}

.stage-finished {
  color: #7a5b2f;
  background: #f8efdc;
}

.stage-returned {
  color: #526f8c;
  background: #e8f1fb;
}

.stage-received {
  color: #2f7a63;
  background: #def4eb;
}

.stage-reviewed {
  color: #5c5ea8;
  background: #ecebff;
}

.item-footer {
  margin-top: 16rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-footer-right {
  display: flex;
  align-items: center;
}

.btn-view {
  min-width: 156rpx;
  height: 62rpx;
  line-height: 62rpx;
  padding: 0 24rpx;
  border-radius: 999rpx;
  border: none;
  font-size: 24rpx;
  font-weight: 600;
}

.btn-view {
  margin-right: 12rpx;
  background: #eef3fb;
  color: #5e6b82;
}

.btn-chat-plain {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 6rpx 0;
  color: #4b5563;
}

.btn-chat-plain-text {
  font-size: 24rpx;
  line-height: 1.4;
  color: #4b5563;
  font-weight: 600;
}

.btn-view::after,
button::after {
  border: none;
}
</style>
