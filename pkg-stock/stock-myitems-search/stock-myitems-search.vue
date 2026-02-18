<!-- pages/stock/stock-myitems-search.vue -->
<template>
  <view-logs />
  <view class="wrap" :style="{ '--safe-top': safeTop + 'px' }">
    <!-- 吸顶搜索 -->
    <view class="search-bar" :style="{ paddingTop: safePadPx }">
      <view class="bar">
        <view class="back" @click="goBack">
          <uni-icons type="left" size="20" color="#666" />
        </view>
        <view class="ipt-wrap">
          <uni-icons type="search" size="18" color="#999" />
          <input
            class="ipt"
            v-model.trim="q"
            type="text"
            placeholder="搜索名称/备注/品牌/尺寸等"
            :focus="true"
            confirm-type="search"
            @confirm="noop"
          />
        </view>
        <!-- 使用艺术字体：按钮文字 -->
        <view class="cancel font-alimamashuhei" @click="goBack">取消</view>
        <!-- 小程序端：在右侧加一个占位符，避让胶囊 -->
        <view
          v-if="isMP"
          class="capsule-ph"
          :style="{ width: capsulePad + 'px' }"
        ></view>
      </view>
    </view>

    <!-- 结果 -->
    <view class="grid-list">
      <view
        class="grid-card"
        v-for="it in filtered"
        :key="it.id || it.__key || JSON.stringify(it)"
        @tap="openPreview(it)"
      >
        <view class="thumb">
          <view class="thumb-inner">
            <image
              class="thumb-img"
              :src="getDisplayImg(it)"
              mode="aspectFill"
              @error="onImgError(it)"
            />
          </view>
        </view>
        <view class="grid-info">
          <!-- 标题使用艺术标题字体 -->
          <text class="grid-title ellipsis2 font-alimamashuhei">
            {{ getItemTitle(it) }}
          </text>
          <text class="grid-sub ellipsis1 font-title">{{ getItemSub(it) }}</text>
        </view>
      </view>

      <view v-if="isFetching && baseList.length === 0" class="empty">
        <image class="empty-icon" src="/static/new-icon/loading.gif" />
        <text class="empty-title font-title">正在加载娃柜数据…</text>
        <text class="empty-tip">首次进入可能需要一点时间</text>
      </view>

      <view v-else-if="filtered.length === 0" class="empty">
        <image class="empty-icon" src="/static/empty.jpg" />
        <!-- 空态标题也用艺术字体 -->
        <text class="empty-title font-title">没有匹配的物品</text>
        <text class="empty-tip">换个关键词试试～</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { websiteUrl } from '@/common/config.js'

/* ========= 安全区 ========= */
const safeTop = ref(0)
try {
  const wi = (uni.getWindowInfo && uni.getWindowInfo()) || uni.getSystemInfoSync()
  safeTop.value = wi?.safeAreaInsets?.top ?? wi?.statusBarHeight ?? 0
} catch {
  safeTop.value = 20
}
const safePadPx = `${Math.max(0, safeTop.value)}px`

/* ========= 接收原页传来的列表 ========= */
const baseList = ref([])
const isFetching = ref(false)
const hasTriedRemote = ref(false)

/* ========= 选择模式：用于从娃柜中选择回填 ========= */
// 是否为“选择模式”（投妆从娃柜中选择），通过 URL 参数控制：?pickMode=1
const isPickMode = ref(false)

/* ========= 小程序胶囊避让 ========= */
const isMP = ref(false)
const capsulePad = ref(0) // 右侧占位宽度（像素）
// #ifdef MP
isMP.value = true
// #endif
// #ifdef MP-WEIXIN
try {
  const sys = uni.getSystemInfoSync()
  const mb = wx.getMenuButtonBoundingClientRect()
  const rightPad = Math.max(0, sys.windowWidth - mb.left + 6)
  capsulePad.value = rightPad
} catch (e) {
  capsulePad.value = 0
}
// #endif

function normalizeListPayload(input) {
  if (Array.isArray(input)) return input
  if (!input || typeof input !== 'object') return []
  if (Array.isArray(input.list)) return input.list
  if (Array.isArray(input.rows)) return input.rows
  if (Array.isArray(input.items)) return input.items
  if (Array.isArray(input.account_books)) return input.account_books
  if (Array.isArray(input?.account_books?.list)) return input.account_books.list
  if (Array.isArray(input?.data?.list)) return input.data.list
  if (Array.isArray(input?.data?.rows)) return input.data.rows
  if (Array.isArray(input?.data?.items)) return input.data.items
  if (Array.isArray(input?.data?.account_books)) return input.data.account_books
  if (Array.isArray(input?.data?.account_books?.list)) return input.data.account_books.list
  return []
}

function applyList(input, source = 'unknown') {
  const list = normalizeListPayload(input)
  if (!Array.isArray(list) || list.length === 0) return false
  baseList.value = list
  try { uni.setStorageSync('__stockList', list) } catch (e) {}
  console.log('[stock-search] list loaded from', source, 'count=', list.length)
  return true
}

function tryLoadFromCache() {
  if (baseList.value.length > 0) return true

  try {
    const cached = uni.getStorageSync('__stockList')
    if (applyList(cached, 'uniStorage')) return true
  } catch (e) {}

  // H5 兜底
  try {
    const fromState = history.state && history.state.__stockList
    if (applyList(fromState, 'history.state')) return true
  } catch (e) {}

  try {
    const cached = localStorage.getItem('__stockList')
    if (cached && applyList(JSON.parse(cached), 'localStorage')) return true
  } catch (e) {}

  return false
}

async function fetchStockListFromServer(force = false) {
  if (isFetching.value) return
  if (hasTriedRemote.value && !force) return

  const token = uni.getStorageSync('token') || ''
  if (!token) return

  hasTriedRemote.value = true
  isFetching.value = true
  try {
    const res = await uni.request({
      url: websiteUrl.value + '/with-state/account-book',
      method: 'GET',
      header: { Authorization: token }
    })
    const raw = res?.data || {}
    const data = raw?.data || {}
    if (!applyList(raw, 'remote.raw') && !applyList(data, 'remote.data')) {
      console.log('[stock-search] remote response has no account_books')
    }
  } catch (err) {
    console.error('[stock-search] fetch remote list fail:', err)
  } finally {
    isFetching.value = false
  }
}

/** H5/小程序通用的 opener 通道 + 缓存 + 远程兜底 */
onLoad((options) => {
  // 选择模式开关：从 URL 参数中读取
  if (options && (options.pickMode === '1' || options.pickMode === 'true')) {
    isPickMode.value = true
  }

  // 1) 事件通道：接收上级页面传来的列表
  try {
    const ec = uni.getOpenerEventChannel && uni.getOpenerEventChannel()
    ec &&
      ec.on &&
      ec.on('initList', (data) => {
        if (!applyList(data, 'eventChannel')) {
          if (!tryLoadFromCache()) {
            fetchStockListFromServer(false)
          }
        }
      })
  } catch {}

  // 2) 先读缓存，无则远程拉取
  if (!tryLoadFromCache()) {
    fetchStockListFromServer(false)
  }
})

onShow(() => {
  // 某些端 eventChannel 或缓存命中时机存在延迟，onShow 再兜一层
  if (baseList.value.length > 0) return
  if (tryLoadFromCache()) return
  fetchStockListFromServer(false)
})

/* ========= 搜索 ========= */
const q = ref('')

function matchOne(val, k) {
  if (!val) return false
  return String(val).toLowerCase().includes(k)
}
function matches(it, k) {
  if (!k) return true
  const s = k.toLowerCase()
  return (
    matchOne(it.name, s) ||
    matchOne(it.title, s) ||
    matchOne(it.remark, s) ||
    matchOne(it.brand_name, s) ||
    matchOne(it.type, s) ||
    matchOne(it.size, s) ||
    matchOne(it.size_detail, s) ||
    matchOne(it.tags, s) ||
    matchOne(it.goods_name, s)
  )
}
const filtered = computed(() => {
  const key = q.value.trim()
  if (!key) return baseList.value
  return baseList.value.filter((it) => matches(it, key))
})

/* ========= 展示字段 ========= */
function getItemTitle(it) {
  return it.name || it.title || it.goods_name || '未命名物品'
}
function getItemSub(it) {
  const brand = it.brand_name ? `@${it.brand_name}` : ''
  const size = [it.size, it.size_detail].filter(Boolean).join(' / ')
  const type = it.type || ''
  return [type, size, brand].filter(Boolean).join(' · ')
}

/* ========= 无图兜底 ========= */
const NO_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
      <rect width="100%" height="100%" fill="#e9ebef"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        fill="#9aa0a6" font-size="40" font-family="Arial">No Image</text>
    </svg>`
  )
function rawImg(it) {
  if (it.image) return it.image
  if (it.image_url) return it.image_url
  if (it.cover) return it.cover
  if (Array.isArray(it.images) && it.images.length) {
    return it.images[0]?.url || it.images[0]?.image_url || it.images[0]
  }
  return ''
}
function normalizeFirstImage(s) {
  if (!s) return ''
  const first = String(s).split(',')[0].trim()
  if (!first) return ''
  const low = first.toLowerCase()
  if (low.includes('/default') || low.endsWith('default.png') || low.includes('noimage')) return ''
  return first
}
function getDisplayImg(it) {
  if (it.__imgBroken) return NO_IMG
  const src = normalizeFirstImage(rawImg(it))
  return src || NO_IMG
}
function onImgError(it) {
  it.__imgBroken = true
}

/* ========= 点击条目：预览 or 回传选择 ========= */
function openPreview(it) {
  // 兼容几种常见字段
  const id = it.id || it.account_book_id || it.AccountBookId || it.book_id
  if (!id) {
    uni.showToast({ title: '缺少ID', icon: 'none' })
    return
  }

  // 如果是“选择模式”，则把数据回传给上一级页面，而不是跳详情
  if (isPickMode.value) {
    const payload = {
      id,
      account_book_id: id,
      name: getItemTitle(it),
      title: getItemTitle(it),
      image: getDisplayImg(it),
    }

    try {
      const ec = uni.getOpenerEventChannel && uni.getOpenerEventChannel()
      if (ec && ec.emit) {
        // 上层页面在 navigateTo 的 events 中监听：pickMyItemFromStock
        ec.emit('pickMyItemFromStock', payload)
      } else {
        // H5/其他兜底：写到 storage，上一页 onShow 自己读取
        uni.setStorageSync('__pickedMyItemFromStock', payload)
      }
    } catch (e) {
      uni.setStorageSync('__pickedMyItemFromStock', payload)
    }

    uni.navigateBack({ delta: 1 })
    return
  }

  // 默认行为：打开我的物品详情页
  const url = `/pkg-stock/account_book_preview/account_book_preview?account_book_id=${id}`
  if (process.env.UNI_PLATFORM === 'h5') {
    location.href = `/#${url}`
  } else {
    uni.navigateTo({ url })
  }
}

/* ========= 其它 ========= */
function goBack() {
  try {
    const pages = getCurrentPages && getCurrentPages()
    if (pages && pages.length > 1) {
      uni.navigateBack({ delta: 1 })
      return
    }
  } catch {}
  // H5 兜底
  if (process.env.UNI_PLATFORM === 'h5') history.back()
}
const noop = () => {}
</script>

<style lang="scss" scoped>
:root {
  --safe-top: 0px;
}
.wrap {
  background: #f7f8fa;
  min-height: 100vh;
}

/* 吸顶搜索 */
.search-bar {
  position: sticky;
  top: 0;
  z-index: 9999;
  background: linear-gradient(180deg, #fdfdfd, #f7f8fa);
  padding-bottom: 8px;
  .bar {
    display: flex;
    align-items: center;
    gap: 10rpx;
    padding: 8px 12px 0;
  }
  .back {
    width: 64rpx;
    height: 64rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .ipt-wrap {
    flex: 1;
    height: 74rpx;
    border-radius: 37rpx;
    background: #f1f2f5;
    display: flex;
    align-items: center;
    gap: 12rpx;
    padding: 0 18rpx;
    border: 1rpx solid #e6e8ef;
  }
  .ipt {
    flex: 1;
    font-size: 28rpx;
    color: #333;
  }
  .cancel {
    margin-left: 6rpx;
    color: #74c9e5;
    font-size: 28rpx;
    padding: 8rpx 8rpx;
  }
}

/* 结果网格 */
.grid-list {
  padding: 12px 14px 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.grid-card {
  border-radius: 18rpx;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
}

/* 图片区域：3:4 比例，四周 10rpx 内边距，图片本身圆角 */
.thumb {
  width: 100%;
  padding: 10rpx;
  box-sizing: border-box;
}
.thumb-inner {
  position: relative;
  width: 100%;
  border-radius: 16rpx;
  overflow: hidden;
  background: #f2f2f2;
}
/* 利用 before 维持 3:4 纵向比例：height = 4/3 * width */
.thumb-inner::before {
  content: '';
  display: block;
  padding-top: 133.333%; /* 4/3 * 100% */
}
.thumb-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
}

/* 文本信息 */
.grid-info {
  padding: 8rpx 14rpx 14rpx;
}
.grid-title {
  font-size: 26rpx;
  color: #333;
  font-weight: 600;
  color: #7e97b4;
}
.grid-sub {
  font-size: 22rpx;
  color: #888;
  margin-top: 6rpx;
  display: block;
}

/* 空态 */
.empty {
  grid-column: 1 / span 2;
  min-height: 40vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.empty-icon {
  width: 300rpx;
  height: 300rpx;
  opacity: 0.85;
  margin-bottom: 26rpx;
}
.empty-title {
  font-size: 32rpx;
  color: #747ee5;
  margin-bottom: 10rpx;
  font-weight: 600;
}
.empty-tip {
  font-size: 26rpx;
  color: #999;
}

.ellipsis1 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}
.ellipsis2 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 小程序胶囊占位（仅在 MP 渲染） */
.capsule-ph {
  flex: 0 0 auto;
  height: 64rpx;
}
</style>
