<template>
  <view class="todo-page">
    <z-paging
      ref="paging"
      v-model="list"
      @query="queryList"
      :auto="true"
      :default-page-size="pageSize"
      :inside-more="true"
      :to-bottom-loading-more-enabled="true"
      :loading-more-enabled="true"
      :style="{ top: pagingTopPx }"
      class="todo-paging"
    >
      <view class="summary-card" v-if="summary.pendingSubmissionCount > 0 || summary.pendingItemCount > 0">
        <view class="summary-row">
          <text class="summary-label">待处理订单</text>
          <text class="summary-value font-title">{{ summary.pendingSubmissionCount }}</text>
        </view>
        <view class="summary-row">
          <text class="summary-label">待处理事项</text>
          <text class="summary-value font-title">{{ summary.pendingItemCount }}</text>
        </view>
      </view>

      <view class="todo-list">
        <view
          v-for="row in list"
          :key="`todo-sub-${getSubmissionId(row)}`"
          class="submission-card"
        >
          <view class="submission-head">
            <view class="submission-main">
              <text class="submission-id font-title">订单 #{{ getSubmissionId(row) }}</text>
              <text class="submission-status">{{ getSubmissionStatusText(row) }}</text>
            </view>
            <view class="submission-pending-tag">
              <text class="font-title">{{ getPendingCount(row) }}</text>
              <text>项待处理</text>
            </view>
          </view>

          <view class="action-list" v-if="getPendingActions(row).length">
            <view
              v-for="(action, idx) in getPendingActions(row)"
              :key="`action-${getSubmissionId(row)}-${idx}-${action.code || ''}`"
              class="action-item"
              @tap="goByAction(action)"
            >
              <view class="action-main">
                <text class="action-title font-alimamashuhei">{{ action.title || '待处理事项' }}</text>
                <text class="action-desc">{{ action.description || '' }}</text>
              </view>
              <uni-icons type="arrow-right" size="16" color="#7b8799" />
            </view>
          </view>

          <view class="items-list">
            <view
              v-for="item in getItems(row)"
              :key="`item-${getSubmissionId(row)}-${getItemId(item)}`"
              class="item-row"
              :class="{ 'item-row-dim': !isItemPending(item) }"
              @tap="goItemDetail(row, item)"
            >
              <view class="item-cover-wrap">
                <image
                  v-if="getFirstImage(item)"
                  class="item-cover"
                  :class="{ 'item-cover-dim': !isItemPending(item) }"
                  :src="getFirstImage(item)"
                  mode="aspectFill"
                />
                <view v-else class="item-cover item-cover-placeholder"></view>
              </view>

              <view class="item-main">
                <view class="item-title-row">
                  <text class="item-title font-alimamashuhei">{{ getItemSubject(item) }}</text>
                  <view v-if="isItemPending(item)" class="item-pending-dot"></view>
                </view>

                <view class="item-meta-row">
                  <text class="item-meta">{{ getItemMeta(item) }}</text>
                </view>

                <view class="item-code-row" v-if="getItemCodesText(item)">
                  <text class="item-codes">{{ getItemCodesText(item) }}</text>
                </view>
              </view>

              <uni-icons type="arrow-right" size="16" color="#a0abbd" />
            </view>
          </view>

          <view class="submission-footer">
            <view class="go-detail-btn" @tap.stop="goSubmissionDetail(row)">
              <text>查看订单详情</text>
              <uni-icons type="arrow-right" size="14" color="#2f415e" />
            </view>
          </view>
        </view>
      </view>

      <template #empty>
        <view class="empty-box">
          <image class="empty-icon" src="/static/empty.png" mode="aspectFit" />
          <text class="empty-text">当前没有待您处理事项</text>
        </view>
      </template>
    </z-paging>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getWindowTop, toPx, websiteUrl } from '@/common/config.js'

const paging = ref(null)
const list = ref([])
const pageSize = 20
const planId = ref(0)
const pagingTopPxRaw = ref(0)

const pagingTopPx = computed(() => toPx(pagingTopPxRaw.value))

const summary = ref({
  pendingSubmissionCount: 0,
  pendingItemCount: 0,
})

function getSubmission(row) {
  if (!row) return {}
  return row.submission || row.Submission || {}
}

function getSubmissionId(row) {
  const sub = getSubmission(row)
  return Number(sub.id || sub.ID || 0)
}

function getSubmissionStatusText(row) {
  const sub = getSubmission(row)
  const status = Number(sub.status || sub.Status || 0)
  if (status === 2) return '待创作者确认'
  if (status === 4) return '进行中'
  if (status === 8) return '已寄回'
  if (status === 9) return '已完结'
  return '订单处理中'
}

function getPendingCount(row) {
  return Number(row?.pending_count || row?.pendingCount || 0)
}

function getPendingActions(row) {
  const list = row?.pending_actions || row?.pendingActions || []
  return Array.isArray(list) ? list : []
}

function getItems(row) {
  const list = row?.items || row?.Items || []
  return Array.isArray(list) ? list : []
}

function getItemId(item) {
  return Number(item?.id || item?.ID || 0)
}

function getItemSubject(item) {
  const v = String(item?.work_subject || '').trim()
  return v || '未填写投递内容'
}

function getItemMeta(item) {
  const parts = []
  const size = String(item?.size || '').trim()
  const tier = String(item?.tier_title || '').trim()
  if (size) parts.push(size)
  if (tier) parts.push(tier)
  if (!parts.length) return '点击查看待处理详情'
  return parts.join(' · ')
}

function isItemPending(item) {
  if (!item) return false
  if (item.creator_todo_pending === true) return true
  const codes = item.creator_todo_codes || item.creatorTodoCodes || []
  return Array.isArray(codes) && codes.length > 0
}

function getItemCodesText(item) {
  const codes = item?.creator_todo_codes || item?.creatorTodoCodes || []
  if (!Array.isArray(codes) || !codes.length) return ''
  return codes.map((code) => mapTodoCodeText(code)).filter(Boolean).join('、')
}

function mapTodoCodeText(code) {
  const k = String(code || '').trim()
  if (!k) return ''
  if (k === 'confirm_submission') return '等待确认订单'
  if (k === 'close_submission') return '等待发起结单'
  if (k === 'resolve_negotiation') return '等待处理协商'
  if (k === 'confirm_material_received') return '等待确认收件'
  if (k === 'ship_back') return '等待寄回'
  return '待处理'
}

function getFirstImage(item) {
  const src = String(item?.ref_images || item?.refImages || '').trim()
  if (!src) return ''
  const arr = src.split(',').map((v) => String(v || '').trim()).filter(Boolean)
  return arr[0] || ''
}

function goSubmissionDetail(row) {
  const submissionId = getSubmissionId(row)
  if (!submissionId) {
    uni.showToast({ title: '订单参数缺失', icon: 'none' })
    return
  }
  uni.navigateTo({
    url: `/pkg-creator/creator_order/received-detail/received-detail?submission_id=${submissionId}`,
  })
}

function goItemDetail(row, item) {
  const submissionId = getSubmissionId(row)
  const itemId = getItemId(item)
  if (!submissionId || !itemId) {
    goSubmissionDetail(row)
    return
  }
  uni.navigateTo({
    url: `/pkg-creator/creator_order/submission_item_detail/submission_item_detail?submission_id=${submissionId}&item_id=${itemId}`,
  })
}

function goByAction(action) {
  const level = String(action?.level || '').trim()
  const submissionId = Number(action?.submission_id || action?.submissionId || 0)
  const itemId = Number(action?.item_id || action?.itemId || 0)
  if (level === 'item' && submissionId > 0 && itemId > 0) {
    uni.navigateTo({
      url: `/pkg-creator/creator_order/submission_item_detail/submission_item_detail?submission_id=${submissionId}&item_id=${itemId}`,
    })
    return
  }
  if (submissionId > 0) {
    uni.navigateTo({
      url: `/pkg-creator/creator_order/received-detail/received-detail?submission_id=${submissionId}`,
    })
    return
  }
  uni.showToast({ title: '入口参数缺失', icon: 'none' })
}

async function queryList(pageNo, pageSizeArg) {
  const token = uni.getStorageSync('token') || ''
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/creator-todos`,
      method: 'GET',
      data: {
        page: pageNo,
        size: pageSizeArg || pageSize,
        plan_id: planId.value || undefined,
      },
      header: token ? { Authorization: token } : {},
    })
    const body = res.data || {}
    const payload = body?.data || {}
    const rows = Array.isArray(payload?.list) ? payload.list : []
    const total = Number(payload?.page?.total || 0)

    if (pageNo === 1) {
      summary.value.pendingSubmissionCount = Number(payload?.pending_submission_count || 0)
      summary.value.pendingItemCount = Number(payload?.pending_item_count || 0)
    }

    if (paging.value && typeof paging.value.complete === 'function') {
      paging.value.complete(rows, total)
    } else if (pageNo === 1) {
      list.value = rows
    } else {
      list.value = list.value.concat(rows)
    }
  } catch (err) {
    console.error('query creator todos failed', err)
    uni.showToast({ title: '加载失败，请稍后重试', icon: 'none' })
    if (paging.value && typeof paging.value.complete === 'function') {
      paging.value.complete(false)
    }
  }
}

onLoad((options) => {
  uni.setNavigationBarTitle({ title: '待您处理' })
  const pid = Number(options?.plan_id || 0)
  if (pid > 0) planId.value = pid
  refreshPagingTop()
})

onShow(() => {
  refreshPagingTop()
})

function refreshPagingTop() {
  try {
    const wi = (uni.getWindowInfo && uni.getWindowInfo()) || uni.getSystemInfoSync() || {}
    const windowTop = Number(wi?.windowTop || 0)
    const safeTop = Number(wi?.safeAreaInsets?.top ?? wi?.statusBarHeight ?? 0)
    pagingTopPxRaw.value = Math.max(windowTop, safeTop, Number(getWindowTop() || 0), 0)
  } catch (e) {
    pagingTopPxRaw.value = Math.max(0, Number(getWindowTop() || 0))
  }
}
</script>

<style scoped lang="scss">
.todo-page {
  min-height: 100vh;
  box-sizing: border-box;
  background: linear-gradient(180deg, #f4f7fc 0%, #f1f4fa 100%);
}

.todo-paging {
  min-height: 100vh;
}

.summary-card {
  margin: 20rpx 24rpx 12rpx;
  padding: 20rpx 24rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 10rpx 26rpx rgba(39, 58, 93, 0.08);
}

.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.summary-row + .summary-row {
  margin-top: 12rpx;
}

.summary-label {
  font-size: 28rpx;
  color: #728099;
}

.summary-value {
  font-size: 32rpx;
  color: #253246;
}

.todo-list {
  padding: 0 24rpx 34rpx;
}

.submission-card {
  margin-bottom: 18rpx;
  padding: 22rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 10rpx 24rpx rgba(36, 58, 96, 0.08);
}

.submission-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.submission-main {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.submission-id {
  font-size: 34rpx;
  color: #253246;
}

.submission-status {
  font-size: 24rpx;
  color: #8491a8;
}

.submission-pending-tag {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
  background: rgba(120, 218, 245, 0.2);
  color: #2e5266;
  font-size: 22rpx;
}

.action-list {
  margin-top: 16rpx;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.action-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
  padding: 14rpx 16rpx;
  border-radius: 16rpx;
  background: #f5f8fd;
}

.action-main {
  min-width: 0;
}

.action-title {
  display: block;
  font-size: 26rpx;
  color: #253246;
}

.action-desc {
  margin-top: 6rpx;
  display: block;
  font-size: 23rpx;
  color: #7f8ca1;
}

.items-list {
  margin-top: 16rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 12rpx;
  border-radius: 16rpx;
  background: #f8fbff;
}

.item-row-dim {
  opacity: 0.5;
}

.item-cover-wrap {
  width: 86rpx;
  height: 86rpx;
  border-radius: 16rpx;
  overflow: hidden;
  flex-shrink: 0;
  background: #edf2f9;
}

.item-cover {
  width: 86rpx;
  height: 86rpx;
}

.item-cover-dim {
  filter: grayscale(1);
}

.item-cover-placeholder {
  background: #ecf1f8;
}

.item-main {
  flex: 1;
  min-width: 0;
}

.item-title-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.item-title {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 28rpx;
  color: #273652;
}

.item-pending-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 999rpx;
  background: #78daf5;
  flex-shrink: 0;
}

.item-meta-row,
.item-code-row {
  margin-top: 6rpx;
}

.item-meta {
  font-size: 23rpx;
  color: #75829a;
}

.item-codes {
  font-size: 22rpx;
  color: #627089;
}

.submission-footer {
  margin-top: 14rpx;
  display: flex;
  justify-content: flex-end;
}

.go-detail-btn {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 10rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(120, 218, 245, 0.15);
  color: #2f415e;
  font-size: 24rpx;
}

.empty-box {
  margin-top: 120rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
}

.empty-icon {
  width: 220rpx;
  height: 220rpx;
  opacity: 0.82;
}

.empty-text {
  font-size: 26rpx;
  color: #8b97aa;
}
</style>
