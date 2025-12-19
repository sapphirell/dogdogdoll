<template>
  <view class="info-hub-panel">
    <view class="stats-card">
      <view
        class="stat-item"
        :class="{ 'stat-item-active': activeSecondTab === 'follow' }"
        @click="changeSecondTab('follow')"
      >
        <text class="stat-number font-alimamashuhei">{{ followCount }}</text>
        <text class="stat-label font-alimamashuhei">关注</text>
      </view>

      <view class="stat-divider"></view>

      <view
        class="stat-item"
        :class="{ 'stat-item-active': activeSecondTab === 'message' }"
        @click="changeSecondTab('message')"
      >
        <text class="stat-number font-alimamashuhei">{{ messageCount }}</text>
        <text class="stat-label font-alimamashuhei">站内信</text>
      </view>
    </view>

    <view class="info-content">
      <info-follow-tab
        v-if="activeSecondTab === 'follow'"
        :active="active"
        :active-sub-tab="followActiveSubTab"
        :brand-list="brandList"
        :brand-loading="brandLoading"
        :brand-finished="brandFinished"
        :goods-list="goodsList"
        :goods-loading="goodsLoading"
        :goods-finished="goodsFinished"
        @change-sub-tab="onFollowSubTabChange"
        @load-brand-more="loadBrand(false)"
        @load-goods-more="loadGoods(false)"
        @open-brand="openBrand"
        @open-goods="openGoods"
      />

      <info-message-list
        v-else
        :active="active"
        :list="messageList"
        :loading="msgLoading"
        :finished="msgFinished"
        @load-more="loadMessages(false)"
        @delete="deleteMessage"
        @read="markAsRead"
        @open="gotoMessageDetail"
      />
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { websiteUrl } from '@/common/config.js'

const props = defineProps({
  active: { type: Boolean, default: true }
})

// 二级 Tab
const activeSecondTab = ref('follow')

// 关注：三级 Tab
const followActiveSubTab = ref('brand')

// 统计数字
const followCount = ref(0)
const messageCount = ref(0)

// baseURL 兼容（websiteUrl 可能是 ref）
const baseURL = computed(() => {
  if (typeof websiteUrl === 'string') return websiteUrl
  if (websiteUrl && typeof websiteUrl === 'object' && 'value' in websiteUrl) return websiteUrl.value
  return ''
})

// ========== 通用请求封装 ==========
function requestWithAuth ({ url, method = 'GET', data }) {
  const token = uni.getStorageSync('token')
  if (!token) return Promise.resolve({ ok: false, data: null })

  return new Promise((resolve) => {
    uni.request({
      url,
      method,
      data,
      timeout: 15000,
      header: { Authorization: token },
      success: (res) => resolve({ ok: true, data: res?.data }),
      fail: () => resolve({ ok: false, data: null })
    })
  })
}

function changeSecondTab (key) {
  activeSecondTab.value = key
}

// ========== 站内信：列表 ==========
const messageList = ref([])
const msgPage = ref(1)
const msgPageSize = 10
const msgLoading = ref(false)
const msgFinished = ref(false)
let msgSeq = 0

async function loadMessages (reset) {
  if (!props.active) return
  if (!baseURL.value) return
  const token = uni.getStorageSync('token')
  if (!token) return

  if (msgLoading.value) return
  if (!reset && msgFinished.value) return

  if (reset) {
    msgPage.value = 1
    msgFinished.value = false
    messageList.value = []
  }

  msgLoading.value = true
  const seq = ++msgSeq

  const res = await requestWithAuth({
    url: `${baseURL.value}/with-state/user-messages`,
    method: 'GET',
    data: { page: msgPage.value, page_size: msgPageSize }
  })

  if (seq !== msgSeq) {
    msgLoading.value = false
    return
  }

  const resp = res.data || {}
  if (!res.ok || resp.status !== 'success') {
    msgLoading.value = false
    uni.showToast({ title: resp.msg || '消息加载失败', icon: 'none' })
    return
  }

  const data = resp.data || {}
  const list = data.message_list || []

  messageList.value = reset ? list : messageList.value.concat(list)

  if (list.length < msgPageSize) {
    msgFinished.value = true
  } else {
    msgPage.value = msgPage.value + 1
  }

  msgLoading.value = false
}

function gotoMessageDetail (item) {
  if (!item || !item.id) return
  uni.navigateTo({ url: `/pages/message_info/message_info?message_id=${item.id}` })
}

// ========== 站内信：未读数 / 删除 / 已读 ==========
let unreadSeq = 0
async function refreshUnreadCount () {
  if (!props.active) return
  if (!baseURL.value) return
  const token = uni.getStorageSync('token')
  if (!token) return

  const seq = ++unreadSeq
  const res = await requestWithAuth({
    url: `${baseURL.value}/with-state/unread-message-count`,
    method: 'GET'
  })
  if (seq !== unreadSeq) return

  const resp = res.data || {}
  if (res.ok && resp.status === 'success') {
    const count = Number(resp.data?.count || 0)
    messageCount.value = Number.isNaN(count) ? 0 : count
  }
}

async function deleteMessage (messageId) {
  if (!messageId) return
  if (!baseURL.value) return

  const res = await requestWithAuth({
    url: `${baseURL.value}/with-state/delete-message`,
    method: 'POST',
    data: { message_id: messageId }
  })

  if (!res.ok) {
    uni.showToast({ title: '删除失败', icon: 'none' })
    return
  }

  // 这里不强依赖后端回包格式：成功就先本地移除
  messageList.value = messageList.value.filter(item => item.id !== messageId)

  // 未读数建议重新拉一次，避免本地推导出错
  await refreshUnreadCount()
  uni.showToast({ title: '删除成功' })
}

async function markAsRead (messageId) {
  if (!messageId) return
  if (!baseURL.value) return

  const res = await requestWithAuth({
    url: `${baseURL.value}/with-state/mark-message-read`,
    method: 'POST',
    data: { message_id: messageId }
  })

  if (!res.ok) {
    uni.showToast({ title: '标记失败', icon: 'none' })
    return
  }

  // 本地更新 + 未读数刷新（更稳）
  const item = messageList.value.find(i => i.id === messageId)
  if (item) item.is_read = 1
  await refreshUnreadCount()
}

// ========== 关注：品牌/商品列表 ==========
const brandList = ref([])
const brandPage = ref(1)
const brandPageSize = 10
const brandTotal = ref(0)
const brandLoading = ref(false)
const brandFinished = ref(false)
let brandSeq = 0

async function loadBrand (reset) {
  if (!props.active) return
  if (!baseURL.value) return
  const token = uni.getStorageSync('token')
  if (!token) return

  if (brandLoading.value) return
  if (!reset && brandFinished.value) return

  if (reset) {
    brandPage.value = 1
    brandFinished.value = false
    brandList.value = []
  }

  brandLoading.value = true
  const seq = ++brandSeq

  const res = await requestWithAuth({
    url: `${baseURL.value}/with-state/my-liked-brands`,
    method: 'GET',
    data: { page: brandPage.value, page_size: brandPageSize }
  })

  if (seq !== brandSeq) {
    brandLoading.value = false
    return
  }

  const resp = res.data || {}
  if (!res.ok || resp.status !== 'success') {
    brandLoading.value = false
    uni.showToast({ title: resp.msg || '获取关注品牌失败', icon: 'none' })
    return
  }

  const data = resp.data || {}
  const list = data.list || []
  const total = Number(data.total || 0)

  brandList.value = reset ? list : brandList.value.concat(list)
  brandTotal.value = Number.isNaN(total) ? 0 : total

  // “关注”统计：当处于品牌 Tab，用品牌 total
  if (followActiveSubTab.value === 'brand') {
    followCount.value = brandTotal.value
  }

  if (brandList.value.length >= brandTotal.value || list.length < brandPageSize) {
    brandFinished.value = true
  } else {
    brandPage.value = brandPage.value + 1
  }

  brandLoading.value = false
}

const goodsList = ref([])
const goodsPage = ref(1)
const goodsPageSize = 10
const goodsTotal = ref(0)
const goodsLoading = ref(false)
const goodsFinished = ref(false)
let goodsSeq = 0

async function loadGoods (reset) {
  if (!props.active) return
  if (!baseURL.value) return
  const token = uni.getStorageSync('token')
  if (!token) return

  if (goodsLoading.value) return
  if (!reset && goodsFinished.value) return

  if (reset) {
    goodsPage.value = 1
    goodsFinished.value = false
    goodsList.value = []
  }

  goodsLoading.value = true
  const seq = ++goodsSeq

  const res = await requestWithAuth({
    url: `${baseURL.value}/with-state/my-liked-goods`,
    method: 'GET',
    data: { page: goodsPage.value, page_size: goodsPageSize }
  })

  if (seq !== goodsSeq) {
    goodsLoading.value = false
    return
  }

  const resp = res.data || {}
  if (!res.ok || resp.status !== 'success') {
    goodsLoading.value = false
    uni.showToast({ title: resp.msg || '获取关注商品失败', icon: 'none' })
    return
  }

  const data = resp.data || {}
  const rawList = data.list || []
  
  // ================= 修改点：数据处理 =================
  // 补全商品图片：优先取 goods_images 的第一张，赋值给 goods_image 字段
  // 这样子组件如果只读单张图片字段，可以直接使用 goods_image
  const list = rawList.map(item => {
    let cover = ''
    // 检查是否存在图片数组且有内容
    if (item.goods_images && Array.isArray(item.goods_images) && item.goods_images.length > 0) {
      cover = item.goods_images[0]
    }
    return {
      ...item,
      // 确保有一个 goods_image 字段作为封面图
      goods_image: item.goods_image || cover 
    }
  })
  // ===================================================

  const total = Number(data.total || 0)

  goodsList.value = reset ? list : goodsList.value.concat(list)
  goodsTotal.value = Number.isNaN(total) ? 0 : total

  // “关注”统计：当处于商品 Tab，用商品 total
  if (followActiveSubTab.value === 'goods') {
    followCount.value = goodsTotal.value
  }

  if (goodsList.value.length >= goodsTotal.value || list.length < goodsPageSize) {
    goodsFinished.value = true
  } else {
    goodsPage.value = goodsPage.value + 1
  }

  goodsLoading.value = false
}

function onFollowSubTabChange (key) {
  followActiveSubTab.value = key

  if (key === 'brand') {
    followCount.value = brandTotal.value
    if (brandList.value.length === 0) loadBrand(true)
  } else if (key === 'goods') {
    followCount.value = goodsTotal.value
    if (goodsList.value.length === 0) loadGoods(true)
  } else {
    // mix/display 暂无数据
    followCount.value = 0
  }
}

function openBrand (item) {
  if (!item || !item.id) return
  uni.navigateTo({ url: `/pages/brand/brand?brand_id=${item.id}` })
}

// ================= 修改点：商品跳转逻辑 =================
function openGoods (item) {
  if (!item || !item.id) {
    uni.showToast({ title: '商品信息无效', icon: 'none' })
    return
  }
  // 跳转到详情页，URL 会自动处理成 /#/pages/... 格式（H5模式下）
  uni.navigateTo({ 
    url: `/pages/goods/goods?goods_id=${item.id}` 
  })
}
// ======================================================

// ========== 生命周期与触发策略（只在父组件请求） ==========
async function refreshCurrentTabDataOnShow () {
  if (!props.active) return

  // 统计
  await refreshUnreadCount()

  // 当前 Tab 列表（按你“onShow 刷新”的习惯：重置拉新）
  if (activeSecondTab.value === 'message') {
    await loadMessages(true)
  } else {
    if (followActiveSubTab.value === 'brand') await loadBrand(true)
    if (followActiveSubTab.value === 'goods') await loadGoods(true)
  }
}

// 面板激活时：拉一次（避免隐藏状态请求）
watch(
  () => props.active,
  (val) => {
    if (val) refreshCurrentTabDataOnShow()
  },
  { immediate: true }
)

// 页面 onShow：刷新（符合你的偏好）
onShow(() => {
  refreshCurrentTabDataOnShow()
})

// 二级 tab 切换时：若列表为空再拉（避免每次切换都重置）
watch(
  () => activeSecondTab.value,
  (key) => {
    if (!props.active) return
    if (key === 'message') {
      if (messageList.value.length === 0) loadMessages(true)
      refreshUnreadCount()
    } else {
      if (followActiveSubTab.value === 'brand' && brandList.value.length === 0) loadBrand(true)
      if (followActiveSubTab.value === 'goods' && goodsList.value.length === 0) loadGoods(true)
    }
  }
)

defineExpose({
  refreshUnreadCount,
  loadMessages,
  loadBrand,
  loadGoods
})
</script>

<style lang="scss" scoped>
.info-hub-panel {
  padding: 0 40rpx 40rpx;
  box-sizing: border-box;
}

.stats-card {
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  background: #ffffff;
  border-radius: 32rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.04);
  padding: 24rpx 40rpx;
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  margin-bottom: 32rpx;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.stat-number {
  font-size: 40rpx;
  font-weight: 700;
  color: #d0d0d0;
}

.stat-label {
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #d0d0d0;
}

.stat-item-active .stat-number,
.stat-item-active .stat-label {
  color: #222222;
}

.stat-divider {
  width: 2rpx;
  height: 60rpx;
  background: #f2f2f2;
}

.info-content {
  margin-top: 16rpx;
}
</style>