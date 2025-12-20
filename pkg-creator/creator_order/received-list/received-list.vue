<!-- pkg-creator/creator_order/received-list/received-list.vue -->
<template>
  <view-logs />
  <view class="booking-page received-page">
    <!-- 整个可滚区域交给 z-paging 管 -->
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
          <!-- 刷新中时用 gif，其他状态用 png -->
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

      <!-- 头部（跟着列表一起滚动，因为不在 slot="top" 里） -->
      <view class="page-header">
        <!-- Hero -->
        <view class="hero hero-small">
          <view class="hero-bg"></view>
          <view class="hero-footer hero-small-footer">
            <view class="hero-title">
              <text class="brand-name font-title">投递我的</text>
            </view>
            <text class="hero-desc">按订单状态查看谁投递了你</text>
          </view>
        </view>

        <!-- 状态筛选条：点击弹出底部 Picker -->
        <view class="card filter-bar" @tap="openFilterSheet">
          <view class="filter-left">
            <text class="filter-label">当前筛选</text>
            <text class="filter-value">{{ currentFilterLabel }}</text>
          </view>
          <view class="filter-right">
            <text class="filter-hint">点击切换</text>
            <text class="filter-arrow">▼</text>
          </view>
        </view>

        <!-- 汇总信息：当前筛选的 submission 数量 + 总金额 -->
        <view
          class="card summary-card"
          v-if="filteredSubmissions.length > 0"
        >
          <view class="summary-row">
            <text class="summary-label">当前筛选</text>
            <text class="summary-value">
              {{ currentFilterLabel }} · 共 {{ currentSubmissionCount }} 笔投递
            </text>
          </view>
          <view class="summary-row">
            <text class="summary-label">总金额</text>
            <text class="summary-value price">
              ¥ {{ formatPrice(currentTotalAmount) }}
            </text>
          </view>
        </view>
      </view>

      <!-- 白色内容容器 + 列表（列表“物理上”就在 body-container 里） -->
      <view class="body-container">
        <!-- 列表卡片：按 submission 渲染 -->
        <view class="list-wrapper">
          <view
            v-for="row in filteredSubmissions"
            :key="getSubmissionId(row)"
            class="card item-card"
            @click="goSubmissionDetail(row)"
          >
            <!-- 标题行：作品摘要（取第一个子项） + submission 状态 -->
            <view class="item-header">
              <text class="item-title">
                {{ buildSubmissionSubject(row) || '未填写作品标题' }}
              </text>
              <view
                class="status-chip"
                :class="'s-' + getSubmissionStatus(row)"
              >
                <text class="status-text">
                  {{ itemStatusText(getSubmissionStatus(row)) }}
                </text>
              </view>
            </view>

            <!-- 基本信息 -->
            <view class="item-row">
              <text class="item-label">投递用户</text>
              <text class="item-value">
                UID {{ getSubmissionUserId(row) || '-' }}
              </text>
            </view>

            <view class="item-row">
              <text class="item-label">投递时间</text>
              <text class="item-value">
                {{ formatTime(getSubmissionCreatedAt(row)) }}
              </text>
            </view>

            <view class="item-row">
              <text class="item-label">作品数量</text>
              <text class="item-value">
                {{ getItems(row).length }} 个作品
              </text>
            </view>

            <!-- 总金额 -->
            <view class="item-row" v-if="Number(row.total_amount) > 0">
              <text class="item-label">订单总金额</text>
              <text class="item-value price">
                ¥ {{ formatPrice(row.total_amount) }}
              </text>
            </view>

            <!-- 分作品列表：逐条展示 submission_item -->
            <view
              class="items-block"
              v-if="getItems(row).length"
            >
              <view
                class="sub-item"
                v-for="it in getItems(row)"
                :key="it.id || it.ID"
              >
                <view class="sub-item-main-row">
                  <view class="sub-item-cover-wrap" v-if="getFirstImage(it)">
                    <image
                      class="sub-item-cover"
                      :src="getFirstImage(it)"
                      mode="aspectFill"
                    />
                  </view>

                  <view class="sub-item-main">
                    <view class="sub-item-title-row">
                      <text class="sub-item-title">
                        {{ (it.work_subject || '').trim() || '未命名作品' }}
                      </text>
                      <text
                        class="sub-item-price"
                        v-if="calcItemTotal(it) > 0"
                      >
                        ¥ {{ formatPrice(calcItemTotal(it)) }}
                      </text>
                    </view>

                    <view class="sub-item-meta-row">
                      <text
                        class="sub-item-meta"
                        v-if="(it.size || '').trim()"
                      >
                        {{ (it.size || '').trim() }}
                      </text>
                      <text
                        class="sub-item-meta"
                        v-if="(it.tier_title || '').trim()"
                      >
                        档位：{{ (it.tier_title || '').trim() }}
                      </text>
                      <text
                        class="sub-item-meta"
                        v-if="getItemAddonsTitles(it)"
                      >
                        加购：{{ getItemAddonsTitles(it) }}
                      </text>
                      <text
                        class="sub-item-meta adjust"
                        v-if="Number(it.adjust_price) !== 0"
                      >
                        调价：{{ it.adjust_price > 0 ? '+' : '' }}{{ formatPrice(it.adjust_price) }}
                      </text>
                    </view>
                  </view>
                </view>
              </view>
            </view>

            <!-- 底部操作：发起会话 -->
            <view class="item-footer">
              <view class="item-footer-left"></view>
              <view class="item-footer-right">
                <button
                  class="btn-chat"
                  @tap.stop="startChat(row)"
                >
                  发起会话
                </button>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态（交给 z-paging 的 #empty ） -->
      <template #empty>
        <view class="empty-box">
          <image class="empty-icon" src="/static/empty.png" mode="aspectFit" />
          <text class="empty-text">还没有收到相关投递</text>
        </view>
      </template>

    </z-paging>

    <!-- 底部状态筛选弹层 -->
    <uni-popup
      ref="filterPopup"
      type="bottom"
      :mask-click="true"
      @change="onFilterPopupChange"
    >
      <view class="sheet" :style="{ paddingBottom: safeBottom + 'px' }">
        <view class="sheet-header">
          <text class="btn-cancel" @tap="closeFilterSheet">取消</text>
          <text class="sheet-title">筛选订单状态</text>
        </view>

        <picker-view
          v-if="filterMounted"
          class="picker"
          :indicator-style="indicatorStyle"
          :value="[tempFilterIndex]"
          @change="onFilterPickerChange"
        >
          <picker-view-column>
            <view
              v-for="(opt, idx) in statusFilterOptions"
              :key="opt.key"
              class="picker-item"
            >
              {{ opt.label }}
            </view>
          </picker-view-column>
        </picker-view>

        <view class="sheet-footer">
          <button class="btn-confirm" @tap="confirmFilter">确定</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { websiteUrl } from '@/common/config.js'
import LoadingJumpText from '@/components/loading-jump-text/loading-jump-text.vue'

// 传入的 plan_id（可选，用于只看某个开单计划）
const planId = ref(0)

// z-paging 相关
const paging = ref(null)
const innerList = ref([]) // 只给 z-paging 用，不直接渲染
const pageSize = 20

// 后端数据（submission 维度）：每一项是 { submission, items, queue_stat, total_amount }
const rawList = ref([])
const totalCount = ref(0)

/**
 * submission 状态枚举（后端）：
 * 0: 排队中
 * 1: 已抢到，待买家确认（含沟通价格、是否继续）
 * 2: 买家已确认，等待卖家确认
 * 3: 双方确认完毕，待付款
 * 4: 已付款
 * 5: 排队失败
 * 6: 用户取消
 * 7: 付款超时
 */

// 状态筛选选项（用于 Picker）
const statusFilterOptions = ref([
  { key: 'all', label: '全部', value: null },
  { key: 'selected_confirm', label: '等待买家确认订单内容', value: 1 },
  { key: 'buyer_confirmed', label: '买家已确认请您确认', value: 2 },
  { key: 'selected_pay', label: '等待买家付款', value: 3 },
  { key: 'paid', label: '已付款进行中', value: 4 },
  { key: 'failed', label: '排队失败', value: 5 },
  { key: 'cancelled', label: '买家取消', value: 6 },
  { key: 'timeout', label: '付款超时', value: 7 },
])

const currentFilterKey = ref('all')

// 当前选中筛选的 label
const currentFilterLabel = computed(() => {
  const opt = statusFilterOptions.value.find((o) => o.key === currentFilterKey.value)
  return opt ? opt.label : '全部'
})

// 所有 submission 列表
const allSubmissions = computed(() => rawList.value || [])

// 当前筛选后的 submission 列表
const filteredSubmissions = computed(() => {
  const list = allSubmissions.value
  if (currentFilterKey.value === 'all') return list

  const opt = statusFilterOptions.value.find((o) => o.key === currentFilterKey.value)
  if (!opt || opt.value === null || opt.value === undefined) return list

  const targetStatus = Number(opt.value)
  return list.filter((row) => Number(getSubmissionStatus(row)) === targetStatus)
})

// 当前筛选下 submission 数量
const currentSubmissionCount = computed(() => filteredSubmissions.value.length)

// 当前筛选下的总金额（所有 submission 的 total_amount 之和）
const currentTotalAmount = computed(() => {
  return filteredSubmissions.value.reduce((sum, row) => {
    const n = Number(row.total_amount || 0)
    if (Number.isNaN(n)) return sum
    return sum + n
  }, 0)
})

/* ---------- 下拉刷新 gif/静态图状态判断（含调试） ---------- */
function isRefresherGif(status) {
  // 打一条调试日志，看看每次回调传什么
  console.log('[received-list] z-paging refresherStatus =', status, typeof status)
  // 新版：字符串
  if (status === 'loading') return true
  // 兼容旧版数字枚举：0 默认，1 松手立即刷新，2 刷新中，3 刷新成功
  if (status === 2) return true
  // 如果你希望“松手立即刷新”阶段也用 gif，可以把下面这行放开：
  // if (status === 1 || status === 'release-to-refresh') return true
  return false
}

/* ---------- 工具函数：从 row 中取 submission 字段 ---------- */

function getSubmission(row) {
  if (!row) return {}
  return row.submission || row.Submission || {}
}

// 取 submission.id
function getSubmissionId(row) {
  const sub = getSubmission(row)
  return sub.id || sub.ID || 0
}

// 取 submission.status
function getSubmissionStatus(row) {
  const sub = getSubmission(row)
  const s = sub.status ?? sub.Status
  return s === undefined || s === null ? -1 : Number(s)
}

// 取 submission.user_id
function getSubmissionUserId(row) {
  const sub = getSubmission(row)
  return sub.user_id || sub.userId || 0
}

// 取 submission.created_at
function getSubmissionCreatedAt(row) {
  const sub = getSubmission(row)
  return sub.created_at || sub.createdAt || 0
}

// 取 items 列表（兼容大小写）
function getItems(row) {
  if (!row) return []
  return row.items || row.Items || []
}

// 状态文案（使用新的枚举含义）
function itemStatusText(status) {
  const s = Number(status)
  switch (s) {
    case 0:
      return '排队中'
    case 1:
      return '等待买家确认订单内容'
    case 2:
      return '买家已确认请您确认'
    case 3:
      return '等待买家付款'
    case 4:
      return '已付款进行中'
    case 5:
      return '排队失败'
    case 6:
      return '买家取消'
    case 7:
      return '付款超时'
    default:
      return '未知状态'
  }
}

// 作品摘要：从第一个 item 取 娃头 / 尺寸 / 档位
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

// 解析 ref_images，取第一张图
function getFirstImage(item) {
  const src = item.ref_images || item.refImages || ''
  if (!src) return ''
  const arr = String(src)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return arr[0] || ''
}

// 解析加购 JSON
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

// 拼接加购标题（用 / 连接）
function getItemAddonsTitles(item) {
  const addonsJson = item.addons_json || item.addonsJson || ''
  const addons = parseAddons(addonsJson)
  if (!addons.length) return ''
  const titles = addons
    .map((a) => (a.title || a.Title || '').trim())
    .filter(Boolean)
  return titles.join(' / ')
}

// 计算单个 item 的金额：price_total + adjust_price
function calcItemTotal(item) {
  const base = Number(item.price_total || 0)
  const adjust = Number(item.adjust_price || 0)
  const b = Number.isFinite(base) ? base : 0
  const a = Number.isFinite(adjust) ? adjust : 0
  return b + a
}

// 金额格式化
function formatPrice(price) {
  const n = Number(price || 0)
  if (!Number.isFinite(n)) return '0.00'
  return n.toFixed(2)
}

function pad2(n) {
  return n < 10 ? '0' + n : '' + n
}

// created_at 为 Unix 秒
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

/* ---------- 跳转详情 ---------- */

/* ---------- 跳转详情 ---------- */
function goSubmissionDetail(row) {
  const sub = getSubmission(row)
  const submissionId = sub.id || sub.ID
  if (!submissionId) {
    uni.showToast({
      title: '缺少 submission_id',
      icon: 'none',
    })
    return
  }

  const items = getItems(row)
  const first = items[0] || {}
  const itemId = first.id || first.ID || ''

  // 新页面需要的参数：id + 可选 item_id
  const query = [`submission_id=${submissionId}`]
  // if (itemId) {
  //   query.push(`item_id=${itemId}`)
  // }

  // 注意：uni.navigateTo 使用的是不带 # 的路径，
  // H5 下会自动变成 /#/pkg-creator/... 的形式
  uni.navigateTo({
    url: `/pkg-creator/creator_order/received-detail/received-detail?${query.join('&')}`,
  })
}


/* ---------- 发起对话：跳转到 IM ---------- */

function startChat(row) {
  const uid = getSubmissionUserId(row)
  if (!uid) {
    uni.showToast({
      title: '缺少对方 UID',
      icon: 'none',
    })
    return
  }
  uni.navigateTo({
    url: `/pkg-im/chat/chat?peer_id=${uid}`,
  })
}

/* ---------- 计算单个 submission 的总金额 ---------- */
function computeSubmissionTotal(items) {
  if (!items || !items.length) return 0
  return items.reduce((sum, it) => {
    const n = calcItemTotal(it)
    return sum + n
  }, 0)
}

/* ---------- z-paging 查询回调：请求作者视角投递列表 ---------- */
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
      },
      header: token
        ? {
            Authorization: token,
          }
        : {},
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

      return {
        submission,
        items,
        queue_stat: queueStat,
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
    uni.showToast({
      title: '加载失败，请稍后重试',
      icon: 'none',
    })

    if (paging.value) {
      paging.value.complete(false)
    }
  }
}

/* ---------- 底部筛选弹层逻辑 ---------- */

const filterPopup = ref(null)
const filterMounted = ref(false)
const safeBottom = ref(0)
const indicatorStyle = 'height:64px;'

// 当前筛选对应的 index
const currentFilterIndex = computed(() => {
  const idx = statusFilterOptions.value.find((opt) => opt.key === currentFilterKey.value)
  return idx >= 0 ? idx : 0
})

// 临时选中的 index（picker 滚动中的值）
const tempFilterIndex = ref(0)

function openFilterSheet() {
  tempFilterIndex.value = currentFilterIndex.value
  try {
    const wi = uni.getWindowInfo && uni.getWindowInfo()
    safeBottom.value = wi?.safeAreaInsets?.bottom || 0
  } catch {
    safeBottom.value = 0
  }
  nextTick(() => {
    filterMounted.value = true
    filterPopup.value?.open?.()
  })
}

function closeFilterSheet() {
  filterPopup.value?.close?.()
}

function onFilterPopupChange(e) {
  if (!e.show) {
    filterMounted.value = false
  }
}

function onFilterPickerChange(e) {
  const arr = e.detail && e.detail.value
  if (!arr || !arr.length) return
  const idx = Number(arr[0])
  if (Number.isNaN(idx)) return
  tempFilterIndex.value = idx
}

function confirmFilter() {
  const opt =
    statusFilterOptions.value[tempFilterIndex.value] ||
    statusFilterOptions.value[0]
  currentFilterKey.value = opt.key
  closeFilterSheet()
  // 现在只是前端本地筛选，reload 主要用于刷新数据
  if (paging.value) {
    paging.value.reload()
  }
}

/* ---------- 生命周期 ---------- */

onLoad((options) => {
  uni.setNavigationBarTitle({
    title: '投递我的',
  })

  if (options && options.plan_id) {
    const pid = Number(options.plan_id)
    if (!Number.isNaN(pid)) {
      planId.value = pid
    }
  }
})
</script>

<style lang="scss" scoped>
.received-page {
  min-height: 100vh;
  background-color: #f5f5f7;
  box-sizing: border-box;
}

.paging-root {
}

/* ✅ 自定义下拉刷新区域样式 */
.custom-refresher {
  height: 160rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.custom-refresher-debug {
  font-size: 20rpx;
  color: #999;
  margin-bottom: 8rpx;
}
.custom-refresher-icon {
  width: 120rpx;
}

/* 让头部和列表视觉上分组，可以视情况调整 */
.page-header {
}

/* Hero */
.hero {
  position: relative;
  margin-bottom: 16rpx;
}

.hero-small {
  height: 220rpx;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #ffd2e4 0%, #ffe9c8 50%, #daf2ff 100%);
}

.hero-footer {
  position: absolute;
  left: 32rpx;
  right: 32rpx;
  bottom: 40rpx;
  display: flex;
  flex-direction: column;
}

.hero-small-footer {
  bottom: 32rpx;
}

.hero-title {
  display: flex;
  align-items: baseline;
}

.brand-name {
  font-size: 36rpx;
  font-weight: 600;
  color: #222;
}

.hero-desc {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #555;
}

/* 通用卡片 */
.card {
  margin: 0 24rpx 24rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background-color: #fff;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
}

/* 筛选条 */
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.filter-left {
  display: flex;
  flex-direction: column;
}

.filter-label {
  font-size: 24rpx;
  color: #999;
}

.filter-value {
  margin-top: 6rpx;
  font-size: 28rpx;
  color: #333;
  font-weight: 600;
}

.filter-right {
  display: flex;
  align-items: center;
}

.filter-hint {
  font-size: 24rpx;
  color: #999;
  margin-right: 6rpx;
}

.filter-arrow {
  font-size: 28rpx;
  color: #666;
}

/* 汇总卡片 */
.summary-card {
  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 4rpx;
  }

  .summary-label {
    font-size: 24rpx;
    color: #888;
  }

  .summary-value {
    font-size: 26rpx;
    color: #333;
  }

  .summary-value.price {
    font-weight: 600;
    color: #e35a4b;
  }
}

/* 白底容器，可以在这里加圆角、阴影等 */
.body-container {
}

/* 列表 */
.list-wrapper {
  padding-bottom: 40rpx;
}

/* 空状态 */
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

/* Item 卡片 */
.item-card {
  margin-bottom: 20rpx;
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
  color: #222;
}

/* 状态标签 */
.status-chip {
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
  background-color: #f0f0f0;
}

.status-text {
  font-size: 22rpx;
}

/* 各状态颜色 */
.status-chip.s-0 {
  background: rgba(145, 213, 255, 0.14);
  border: 1rpx solid rgba(63, 169, 245, 0.6);
}
.status-chip.s-0 .status-text {
  color: #3fa9f5;
}

.status-chip.s-1 {
  background: rgba(255, 210, 151, 0.14);
  border: 1rpx solid rgba(255, 156, 85, 0.6);
}
.status-chip.s-1 .status-text {
  color: #ff8a3d;
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

/* 行信息 */
.item-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-top: 8rpx;
}

.item-label {
  font-size: 24rpx;
  color: #888;
}

.item-value {
  font-size: 24rpx;
  color: #333;
}

.item-value.price {
  font-weight: 600;
  color: #e35a4b;
}

/* 子作品列表 */
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
  color: #222;
}

.sub-item-price {
  font-size: 24rpx;
  color: #e35a4b;
  font-weight: 600;
}

.sub-item-meta-row {
  margin-top: 6rpx;
  flex-wrap: wrap;
}

.sub-item-meta {
  margin-right: 16rpx;
  font-size: 22rpx;
  color: #777;
}

.sub-item-meta.adjust {
  color: #c46b3d;
}

/* 卡片底部操作区 */
.item-footer {
  margin-top: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-footer-left {
}

.item-footer-right {
  display: flex;
  align-items: center;
}

.btn-chat {
  min-width: 180rpx;
  height: 68rpx;
  line-height: 68rpx;
  padding: 0 32rpx;
  border-radius: 999rpx;
  border: none;
  background: linear-gradient(135deg, #ffd2e4, #ffe1b3);
  color: #4a3131;
  font-size: 26rpx;
  font-weight: 600;
}
.btn-chat::after {
  border: none;
}

/* ---- 底部筛选弹层样式 ---- */
.sheet {
  width: 100vw;
  background: #fff;
  border-top-left-radius: 20rpx;
  border-top-right-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 -8rpx 24rpx rgba(0, 0, 0, 0.04);
}
.sheet-header {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-bottom: 1rpx solid #f0f0f0;
}
.btn-cancel {
  position: absolute;
  left: 24rpx;
  font-size: 28rpx;
  color: #999;
}
.sheet-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #333;
}

.picker {
  height: 420px;
  background: #fff;
  padding: 20rpx 0;
}
.picker-item {
  height: 64px;
  line-height: 64px;
  text-align: center;
  font-size: 30rpx;
  color: #222;
}

.sheet-footer {
  padding: 16rpx 24rpx 24rpx;
  background: #fff;
}
.btn-confirm {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  background: #4df0ff;
  color: #090a0f;
  font-weight: 700;
  font-size: 30rpx;
  border: none;
}
.btn-confirm::after {
  border: none;
}

uni-picker-view {
  display: block;
}
.uni-picker-view-wrapper {
  height: 100%;
}
</style>
