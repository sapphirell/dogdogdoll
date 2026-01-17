<template>
  <view-logs />
  <view class="settings-panel font-alimamashuhei">
    <view
      v-for="(item, index) in items"
      :key="item.key"
      class="settings-item"
      :style="itemStyle(index)"
      @click="handleClick(item.key)"
    >
      <text class="settings-label">{{ item.label }}</text>
      <uni-icons
        class="settings-arrow-icon"
        type="arrow-right"
        size="18"
        color="#666"
      />
    </view>

    <view
      v-if="articleList.length > 0"
      class="article-ticker"
      @tap="gotoCurrentArticle"
      aria-label="跳转到文章详情"
    >
      <view class="ticker-inline">
        <uni-icons
          class="ticker-icon"
          type="paperplane"
          size="14"
          color="#b5b5b5"
        />

        <view class="ticker-viewport">
          <view class="ticker-inner" :style="tickerInnerStyle">
            <text class="ticker-text" number-of-lines="1">
              {{ currentTitle }}
            </text>

            <text
              v-if="articleList.length > 1"
              class="ticker-text"
              number-of-lines="1"
            >
              {{ nextTitle }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <common-modal v-model:visible="showLogoutConfirm" top="26vh" width="80vw">
      <view class="logout-modal font-alimamashuhei">
        <view class="logout-title">确认退出账号？</view>
        <view class="logout-desc">
          退出后将返回未登录状态，下次使用需要重新登录。
        </view>

        <view class="logout-actions">
          <view class="logout-btn logout-btn-cancel" @tap="onCancelLogout">
            再想想
          </view>
          <view class="logout-btn logout-btn-confirm" @tap="onConfirmLogout">
            退出登录
          </view>
        </view>
      </view>
    </common-modal>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { websiteUrl, global } from '@/common/config.js'

const emit = defineEmits(['action'])

const items = [
  { key: 'profile', label: '基本信息设置' },
  { key: 'deal', label: '交易信息设置' }, // 改名：地址设置 -> 交易信息设置， key 保持 deal 或自定义
  { key: 'logout', label: '退出账号' }
]

const showLogoutConfirm = ref(false)

function handleClick (key) {
  if (key === 'logout') {
    showLogoutConfirm.value = true
  } else if (key === 'deal') {
    // 处理跳转逻辑
    uni.navigateTo({
      url: '/pkg-common/deal-setting/deal-setting'
    })
  } else {
    emit('action', key)
  }
}

function onConfirmLogout () {
  showLogoutConfirm.value = false
  uni.removeStorageSync('token')
  global.isLogin = false
  global.userInfo = {}
  uni.showToast({ title: '已退出', icon: 'none' })
}

function onCancelLogout () {
  showLogoutConfirm.value = false
}

const itemStyle = (index) => {
  const delay = index * 80
  return { animationDelay: `${delay}ms` }
}

// ==================== 文章轮播（category=1） ====================
const baseURL = computed(() => {
  if (typeof websiteUrl === 'string') return websiteUrl
  if (websiteUrl && typeof websiteUrl === 'object' && 'value' in websiteUrl) return websiteUrl.value
  return ''
})

const articleList = ref([]) // [{id,title}]
const tickerIndex = ref(0)
const tickerAnimating = ref(false)
let tickerTimer = null

const currentArticle = computed(() => {
  if (articleList.value.length === 0) return null
  return articleList.value[tickerIndex.value] || null
})

const nextArticle = computed(() => {
  const len = articleList.value.length
  if (len <= 1) return null
  return articleList.value[(tickerIndex.value + 1) % len] || null
})

const currentTitle = computed(() => currentArticle.value?.title || '')
const nextTitle = computed(() => nextArticle.value?.title || '')

const tickerInnerStyle = computed(() => {
  return {
    transform: tickerAnimating.value ? 'translateY(-36rpx)' : 'translateY(0)',
    transition: tickerAnimating.value ? 'transform 420ms ease' : 'none'
  }
})

function startTicker () {
  stopTicker()
  if (articleList.value.length <= 1) return

  tickerTimer = setInterval(() => {
    tickerAnimating.value = true
    setTimeout(() => {
      tickerIndex.value = (tickerIndex.value + 1) % articleList.value.length
      tickerAnimating.value = false
    }, 430)
  }, 2600)
}

function stopTicker () {
  if (tickerTimer) {
    clearInterval(tickerTimer)
    tickerTimer = null
  }
  tickerAnimating.value = false
}

function requestPublic ({ url, method = 'GET', data }) {
  return new Promise((resolve) => {
    uni.request({
      url,
      method,
      data,
      timeout: 15000,
      success: (res) => resolve({ ok: true, data: res?.data }),
      fail: () => resolve({ ok: false, data: null })
    })
  })
}

async function fetchArticlesCategory1 () {
  if (!baseURL.value) return

  const res = await requestPublic({
    url: `${baseURL.value}/articles`,
    method: 'GET',
    data: { page: 1, page_size: 20, category: 1 }
  })

  const resp = res.data || {}
  if (!res.ok || resp.status !== 'success') {
    articleList.value = []
    stopTicker()
    return
  }

  const list = resp.data?.list || []
  const filtered = list
    .map(a => ({
      id: a?.id,
      title: (a?.title || '').trim()
    }))
    .filter(a => a.id && a.title)

  articleList.value = filtered
  tickerIndex.value = 0
  startTicker()
}

function gotoCurrentArticle () {
  const a = currentArticle.value
  if (!a || !a.id) return
  uni.navigateTo({
    url: `/pages/article_detail/article_detail?id=${a.id}`
  })
}

onMounted(() => {
  fetchArticlesCategory1()
})

onUnmounted(() => {
  stopTicker()
})
</script>

<style lang="scss" scoped>
.settings-panel {
  position: relative;
  padding: 32rpx 40rpx 120rpx; /* 底部留空间，避免压住列表 */
  box-sizing: border-box;
}

@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-40rpx); }
  to { opacity: 1; transform: translateX(0); }
}

.settings-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 26rpx 32rpx;
  margin-bottom: 20rpx;
  border-radius: 999rpx;
  background-image: linear-gradient(90deg, #e1e1e1 0%, #ffffff 100%);
  color: #666666;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.03);
  transition: background 0.18s ease, transform 0.12s ease;

  opacity: 0;
  transform: translateX(-40rpx);
  animation-name: slideInLeft;
  animation-duration: 0.3s;
  animation-timing-function: ease-out;
  animation-fill-mode: forwards;
}

.settings-item:active {
  background: #eef5ff;
  transform: translateY(2rpx);
}

.settings-label { font-size: 28rpx; }

.settings-arrow-icon {
  margin-left: 12rpx;
  transform: translateX(4rpx);
}

/* ===== 底部居中：紧凑 inline（icon + title） ===== */
.article-ticker {
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(env(safe-area-inset-bottom) + 20rpx);
  display: flex;
  justify-content: center;
  padding: 0 40rpx;
  box-sizing: border-box;
}

.article-ticker:active { opacity: 0.75; }

/* 关键：inline-flex + gap 小，避免分散 */
.ticker-inline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  max-width: 100%;
}

.ticker-icon {
  flex-shrink: 0;
  transform: translateY(1rpx);
}

/* 视口负责裁切，整体紧凑居中 */
.ticker-viewport {
  width: 520rpx;
  max-width: 100%;
  height: 36rpx;
  overflow: hidden;
}

.ticker-inner {
  display: flex;
  flex-direction: column;
}

/* 标题文本居中，且与 icon 紧挨 */
.ticker-text {
  height: 36rpx;
  line-height: 36rpx;
  font-size: 24rpx;
  color: #b5b5b5;
  text-align: center;
}

/* ==== 退出确认弹窗 UI ==== */
.logout-modal {
  padding: 32rpx 24rpx 24rpx;
  box-sizing: border-box;
  width: calc(80vw - 70rpx);
}

.logout-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #222222;
  text-align: center;
}

.logout-desc {
  margin-top: 16rpx;
  font-size: 26rpx;
  color: #777777;
  line-height: 1.6;
  text-align: center;
}

.logout-actions {
  margin-top: 32rpx;
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
}

.logout-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 999rpx;
  font-size: 28rpx;
}

.logout-btn-cancel {
  background: #f5f5f5;
  color: #666666;
}

.logout-btn-confirm {
  background-image: linear-gradient(90deg, #ffa0a0 0%, #ffacac 100%);
  color: #ffffff;
}
</style>