<!-- pages/stock/stock-myitems-search.vue -->
<template>
  <view class="wrap" :style="{ '--safe-top': safeTop + 'px' }">
    <!-- 吸顶搜索 -->
    <view class="search-bar" :style="{ paddingTop: safePadPx }">
      <view class="bar">
        <view class="back" @click="goBack"><uni-icons type="left" size="20" color="#666" /></view>
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
        <view class="cancel" @click="goBack">取消</view>
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
          <image
            class="thumb-img"
            :src="getDisplayImg(it)"
            mode="aspectFill"
            @error="onImgError(it)"
          />
        </view>
        <view class="grid-info">
          <text class="grid-title ellipsis2">{{ getItemTitle(it) }}</text>
          <text class="grid-sub ellipsis1">{{ getItemSub(it) }}</text>
        </view>
      </view>

      <view v-if="filtered.length===0" class="empty">
        <image class="empty-icon" src="/static/empty.jpg" />
        <text class="empty-title">没有匹配的物品</text>
        <text class="empty-tip">换个关键词试试～</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
/* ========= 安全区 ========= */
const safeTop = ref(0)
try {
  const wi = (uni.getWindowInfo && uni.getWindowInfo()) || uni.getSystemInfoSync()
  safeTop.value = wi?.safeAreaInsets?.top ?? wi?.statusBarHeight ?? 0
} catch { safeTop.value = 20 }
const safePadPx = `${Math.max(0, safeTop.value)}px`

/* ========= 接收原页传来的列表 ========= */
const baseList = ref([])

/** H5/小程序通用的 opener 通道 + H5 的后备方案 */
onLoad(() => {
  // 1) 事件通道
  try {
    const ec = uni.getOpenerEventChannel && uni.getOpenerEventChannel()
    ec && ec.on && ec.on('initList', (data) => {
      baseList.value = data?.list || []
    })
  } catch {}
  // 2) H5 后备：用 history.state 或 localStorage 兜底
  if (!baseList.value.length) {
    try {
      const fromState = history.state && history.state.__stockList
      if (Array.isArray(fromState)) baseList.value = fromState
    } catch {}
  }
  if (!baseList.value.length) {
    try {
      const cached = localStorage.getItem('__stockList')
      if (cached) baseList.value = JSON.parse(cached)
    } catch {}
  }
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
  return baseList.value.filter(it => matches(it, key))
})

/* ========= 展示字段 ========= */
function getItemTitle(it) { return it.name || it.title || it.goods_name || '未命名物品' }
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
function onImgError(it) { it.__imgBroken = true }

/* ========= 跳转预览 ========= */
function openPreview(it) {
  // 兼容几种常见字段
  const id =
    it.id ||
    it.account_book_id ||
    it.AccountBookId ||
    it.book_id
  if (!id) { uni.showToast({ title: '缺少ID', icon: 'none' }); return }
  const url = `/pages/account_book_preview/account_book_preview?account_book_id=${id}`
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
    if (pages && pages.length > 1) { uni.navigateBack({ delta: 1 }); return }
  } catch {}
  // H5 兜底
  if (process.env.UNI_PLATFORM === 'h5') history.back()
}
const noop = () => {}
</script>

<style lang="scss" scoped>
:root { --safe-top: 0px; }
.wrap { background:#f7f8fa; min-height: 100vh; }

/* 吸顶搜索 */
.search-bar {
  position: sticky; top: 0; z-index: 9999;
  background: linear-gradient(180deg,#fdfdfd,#f7f8fa);
  padding-bottom: 8px;
  .bar {
    display:flex; align-items:center; gap:10rpx; padding: 8px 12px 0;
  }
  .back { width: 64rpx; height: 64rpx; display:flex; align-items:center; justify-content:center; }
  .ipt-wrap {
    flex:1; height: 74rpx; border-radius: 37rpx; background:#f1f2f5;
    display:flex; align-items:center; gap:12rpx; padding:0 18rpx; border:1rpx solid #e6e8ef;
  }
  .ipt { flex:1; font-size:28rpx; color:#333; }
  .cancel { margin-left: 6rpx; color:#74c9e5; font-size: 28rpx; padding: 8rpx 8rpx; }
}

/* 结果网格 */
.grid-list {
  padding: 12px 14px 24px;
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
}
.grid-card { border-radius: 14rpx; overflow: hidden; background:#fff; box-shadow:0 4rpx 12rpx rgba(0,0,0,.06); }
.thumb { width:100%; height: 240rpx; background:#f2f2f2; position:relative; }
.thumb-img { width:100%; height:100%; display:block; } /* 无图占位也走这里，不会错位 */
.grid-info { padding: 12rpx; }
.grid-title { font-size: 26rpx; color:#333; font-weight:600; }
.grid-sub { font-size: 22rpx; color:#888; margin-top: 6rpx; display:block; }

/* 空态 */
.empty {
  grid-column: 1 / span 2; min-height: 40vh;
  display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center;
}
.empty-icon { width:300rpx; height:300rpx; opacity:.85; margin-bottom: 26rpx; }
.empty-title { font-size: 32rpx; color:#747EE5; margin-bottom: 10rpx; font-weight: 600; }
.empty-tip { font-size: 26rpx; color:#999; }
.ellipsis1 {
  overflow: hidden; text-overflow: ellipsis; display: -webkit-box;
  -webkit-line-clamp: 1; -webkit-box-orient: vertical;
}
.ellipsis2 {
  overflow: hidden; text-overflow: ellipsis; display: -webkit-box;
  -webkit-line-clamp: 2; -webkit-box-orient: vertical;
}
</style>
