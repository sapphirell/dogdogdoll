<template>
  <view class="page" :style="{ '--safe-top': safeTop + 'px' }">
    <meta name="theme-color" content="#f8f9ff" />
    <view class="pastel-bg"></view>

    <!-- 右上角小按钮（仅刷新，不可切换时段） -->
    <view class="top-tools">
      <view class="refresh-chip mini" @tap="manualRefresh">
        <uni-icons type="reload" size="18" color="#fff"></uni-icons>
        <text class="refresh-text">{{ lastUpdatedText }}</text>
      </view>
    </view>

    <!-- 列表 -->
    <scroll-view
      class="list"
      scroll-y
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      refresher-background="#f8f9ff"
      refresher-default-style="black"
      @refresherrefresh="onRefresh"
      @refresherrestore="() => (refreshing = false)"
      @refresherabort="() => (refreshing = false)"
      @scrolltolower="loadMore"
      :show-scrollbar="false"
    >
      <!-- 骨架屏 -->
      <view v-if="loading && items.length === 0" class="skeleton-wrap">
        <view v-for="n in 6" :key="'sk-'+n" class="card skeleton">
          <view class="left"><view class="img sk"></view></view>
          <view class="right">
            <view class="line sk" style="width:60%"></view>
            <view class="line sk" style="width:80%"></view>
            <view class="chip-row">
              <view class="chip sk" style="width:120rpx"></view>
              <view class="chip sk" style="width:160rpx"></view>
            </view>
            <view class="time sk" style="width:180rpx"></view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else-if="!loading && items.length === 0" class="empty">
        <image class="empty-img" src="https://images1.fantuanpu.com/box/admin/4b0fae8e4f074a1f9d9f5b3d3da8e9c3"></image>
        <text class="empty-title">暂时还没有动态</text>
        <text class="empty-sub">已固定为最近 7 天</text>
      </view>

      <!-- 列表卡片 -->
      <view v-else class="cards">
        <view v-for="item in items" :key="item.id" class="card" @tap="handleOpen(item)">
          <view class="left">
            <image class="img" :src="item.image_url || defaultImg" mode="aspectFill" lazy-load />
            <view class="badge" :style="{ background: badgeStyle(item).bg }">
              <uni-icons :type="badgeStyle(item).icon" size="14" color="#fff"></uni-icons>
              <text>{{ badgeStyle(item).text }}</text>
            </view>
          </view>

          <view class="right">
            <text class="summary">{{ item.summary }}</text>
            <view class="chip-row">
              <view v-if="item.brand_name" class="chip chip-brand" @tap.stop="openBrand(item)">
                <uni-icons type="shop" size="16" color="#ff6b8b"></uni-icons>
                <text>{{ item.brand_name }}</text>
              </view>
              <view v-if="item.goods_name" class="chip chip-goods" @tap.stop="openGoods(item)">
                <uni-icons type="gift" size="16" color="#9c6bff"></uni-icons>
                <text>{{ item.goods_name }}</text>
              </view>
            </view>
            <view class="meta-row">
              <view class="time">
                <uni-icons type="time" size="16" color="#ff9d6c"></uni-icons>
                <text class="time-text">{{ item.time_ago || formatTime(item.created_at) }}</text>
              </view>
              <view class="more" @tap.stop="openActions(item)">
                <uni-icons type="more" size="18" color="#ff9d6c"></uni-icons>
              </view>
            </view>
          </view>
        </view>

        <view class="loading-state">
          <view v-if="loading" class="loading-spinner">
            <uni-icons type="spinner-cycle" size="24" color="#ff6b8b"></uni-icons>
            <text>加载中...</text>
          </view>
          <text v-else-if="noMore" class="no-more">没有更多了</text>
        </view>
      </view>
    </scroll-view>

    <!-- 回到顶部 -->
    <view v-if="showToTop" class="to-top" @tap="scrollToTop">
      <uni-icons type="arrow-up" size="20" color="#fff"></uni-icons>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { websiteUrl } from '@/common/config.js'

/** ===== 固定为 7 天（168 小时） ===== */
const hours = ref(168)

const items = ref([])
const page = ref(1)
const pageSize = 12
const total = ref(0)
const loading = ref(false)
const refreshing = ref(false)
const noMore = ref(false)
const lastUpdated = ref(0)
const showToTop = ref(false)
const defaultImg = 'https://images1.fantuanpu.com/box/admin/ee5e6c79b2bee5efb4b53ab89e8d9f62'
const safeTop = ref(0)

/** ===== 请求 ===== */
async function fetchFeed(reset = false) {
  if (loading.value) return
  if (reset) { page.value = 1; noMore.value = false; items.value = [] }
  loading.value = true
  try {
    const url = `${websiteUrl.value}/ops-feed/recent?hours=${hours.value}&page=${page.value}&page_size=${pageSize}`
    const res = await uni.request({ url, method: 'GET' })
    const data = res.data?.data || {}
    const list = data.list || []
    items.value = page.value === 1 ? list : [...items.value, ...list]
    total.value = data.total || 0
    noMore.value = items.value.length >= total.value || list.length < pageSize
    if (!noMore.value) page.value += 1
    lastUpdated.value = Date.now()
  } catch (e) { uni.showToast({ title: '加载失败', icon: 'none' }) }
  finally { loading.value = false; refreshing.value = false }
}
function onRefresh(){ if (!refreshing.value){ refreshing.value = true; fetchFeed(true) } }
function loadMore(){ if (!loading.value && !noMore.value) fetchFeed() }
function manualRefresh(){ if (!loading.value) onRefresh() }

/** 工具 */
const lastUpdatedText = computed(() => {
  if (!lastUpdated.value) return '刚刚'
  const diff = Math.floor((Date.now() - lastUpdated.value) / 1000)
  if (diff < 10) return '已更新'
  if (diff < 60) return `${diff}s前`
  const m = Math.floor(diff / 60)
  if (m < 60) return `${m}分钟前`
  const h = Math.floor(m / 60)
  return `${h}小时前`
})
function formatTime(tsSec){
  const d = new Date((tsSec||0)*1000); if (isNaN(d.getTime())) return ''
  const y=d.getFullYear(), mm=String(d.getMonth()+1).padStart(2,'0'), dd=String(d.getDate()).padStart(2,'0')
  const hh=String(d.getHours()).padStart(2,'0'), mi=String(d.getMinutes()).padStart(2,'0')
  return `${y}-${mm}-${dd} ${hh}:${mi}`
}
function badgeStyle(item){
  const act = Number(item.action)
  if (act===1) return { text:'新增', icon:'plus',  bg:'linear-gradient(135deg,#ff9d6c,#ff6b8b)' }
  if (act===3) return { text:'删除', icon:'trash', bg:'linear-gradient(135deg,#ff8e8e,#ff5e7d)' }
  const t = Number(item.op_type)
  const bg = t===1 ? 'linear-gradient(135deg,#6bc5f8,#9c6bff)'
           : t===3 ? 'linear-gradient(135deg,#ffd166,#ff9d6c)'
                   : 'linear-gradient(135deg,#6bc5f8,#9c6bff)'
  return { text:'更新', icon:'compose', bg }
}
function openGoods(item){ if (+item.goods_id>0) uni.navigateTo({ url: `/pages/goods/goods?goods_id=${item.goods_id}` }) }
function openBrand(item){ if (+item.brand_id>0) uni.navigateTo({ url: `/pages/brand/brand?brand_id=${item.brand_id}` }) }
function handleOpen(item){ +item.goods_id>0 ? openGoods(item) : (+item.brand_id>0 && openBrand(item)) }
function openActions(item){
  uni.showActionSheet({
    itemList: ['查看商品','查看品牌'],
    success:(r)=>{ r.tapIndex===0 ? openGoods(item) : openBrand(item) }
  })
}
function scrollToTop(){ uni.pageScrollTo({ scrollTop:0, duration:200 }) }

/** 生命周期 */
onMounted(() => {
  try {
    const wi = uni.getWindowInfo && uni.getWindowInfo()
    safeTop.value = wi?.safeAreaInsets?.top ?? wi?.statusBarHeight ?? 0
    if (!safeTop.value) {
      const si = uni.getSystemInfoSync()
      safeTop.value = si?.safeAreaInsets?.top ?? si?.statusBarHeight ?? 0
    }
  } catch { safeTop.value = 20 }
  fetchFeed(true)
})
uni.setNavigationBarTitle({ title: '上新动态' })

// #ifdef H5 || MP
uni.onPageScroll?.((e) => { showToTop.value = e.scrollTop > 400 })
// #endif
</script>

<style lang="scss" scoped>
$candy-pink: #ff6b8b;
$candy-purple: #9c6bff;
$candy-orange: #ff9d6c;

$light-bg: #f8f9ff;
$card-bg: #ffffff;
$text-dark: #3a2a4a;
$text-light: #8c7aa8;

.page{ background:$light-bg; min-height:100vh; }

/* 柔和背景 */
.pastel-bg{
  position: fixed; inset: 0; z-index: -1; pointer-events: none;
  background:
    radial-gradient(120% 120% at 15% 12%, rgba(255,170,190,.38) 0%, rgba(255,170,190,0) 60%),
    radial-gradient(120% 120% at 88% 10%, rgba(150,220,255,.45) 0%, rgba(150,220,255,0) 55%),
    radial-gradient(120% 120% at 0% 80%,  rgba(205,190,255,.30) 0%, rgba(205,190,255,0) 55%),
    linear-gradient(180deg, #f4f7ff 0%, #eef2fb 40%, #eceef6 100%);
}

/* 右上角小按钮 */
.top-tools{
  position: fixed;
  top: calc(var(--safe-top, 0px) + 10px);
  right: 16rpx;
  z-index: 10010;
}
.refresh-chip{
  display:inline-flex; align-items:center; gap:10rpx;
  padding:10rpx 20rpx; border-radius:999rpx;
  background: rgba(0,0,0,.15); backdrop-filter: blur(8rpx);
  box-shadow: 0 6rpx 16rpx rgba(156,107,255,.15);
}
.refresh-chip.mini{ background: linear-gradient(135deg, $candy-orange, $candy-pink); }
.refresh-text{ font-size:24rpx; color:#fff; font-weight:500; }

/* 列表 */
.list{ height: 100vh; }

/* 卡片 */
.cards{ padding: 0 20rpx 40rpx; }
.card{
  display:flex; gap:24rpx; background:$card-bg; border-radius:24rpx; padding:24rpx;
  box-shadow:0 10rpx 30rpx rgba(154,101,255,.1); margin-bottom:24rpx;
  transition: transform .3s ease, box-shadow .3s ease;
}
.card:active{ transform: translateY(-4rpx); box-shadow:0 16rpx 36rpx rgba(154,101,255,.15); }
.left{ width:200rpx; height:200rpx; position:relative; flex-shrink:0;
  .img{ width:100%; height:100%; border-radius:20rpx; object-fit:cover;
    background: linear-gradient(135deg, #f0f7ff, #f8f0ff); }
  .badge{
    position:absolute; left:10rpx; top:10rpx; display:inline-flex; align-items:center; gap:8rpx;
    padding:8rpx 16rpx; border-radius:999rpx; color:#fff; font-size:24rpx; font-weight:500;
    box-shadow:0 6rpx 12rpx rgba(0,0,0,.15); z-index:2;
    text { color: #fff; }
  }
}
.right{ flex:1; min-width:0; }
.summary{ font-size:26rpx; color:$text-dark; font-weight:600; line-height:1.5; }
.chip-row{ display:flex; flex-wrap:wrap; gap:12rpx; margin-top:16rpx; }
.chip{ display:inline-flex; align-items:center; gap:8rpx; padding:10rpx 18rpx; border-radius:999rpx; font-size:24rpx; font-weight:500; }
.chip-brand{ background:rgba(255,107,139,.12); color:$candy-pink; font-size: 24rpx; }
.chip-goods{ background:rgba(156,107,255,.12); color:$candy-purple; }
.meta-row{ display:flex; align-items:center; justify-content:space-between; margin-top:18rpx; padding-top:12rpx; border-top:1rpx dashed rgba(156,107,255,.15); }
.time{ display:inline-flex; align-items:center; gap:10rpx; }
.time-text{ font-size:24rpx; color:$text-light; }
.more{ padding:8rpx; }

/* 骨架屏/空状态/加载 */
.skeleton-wrap{ padding:20rpx; }
.skeleton .sk{ background:linear-gradient(90deg,#f0f7ff 25%,#f8f0ff 37%,#f0f7ff 63%); background-size:400% 100%; animation:shimmer 1.4s ease infinite; border-radius:12rpx; }
@keyframes shimmer{ 0%{background-position:100% 0} 100%{background-position:-100% 0} }
.skeleton.card .left .img{ border-radius:20rpx; }
.skeleton.card .right .line{ height:30rpx; margin:16rpx 0; }
.skeleton.card .right .chip-row{ display:flex; gap:12rpx; margin-top:12rpx; }
.skeleton.card .right .chip{ height:48rpx; border-radius:999rpx; }
.skeleton.card .right .time{ height:26rpx; margin-top:20rpx; }

.empty{ padding:120rpx 40rpx 40rpx; text-align:center;
  .empty-img{ width:320rpx; height:320rpx; opacity:.9; }
  .empty-title{ display:block; margin-top:24rpx; font-size:36rpx; font-weight:700; color:$text-dark; }
  .empty-sub{ display:block; margin-top:12rpx; font-size:26rpx; color:$text-light; }
}
.loading-state{ text-align:center; padding:40rpx; color:$text-light; font-size:26rpx;
  .loading-spinner{ display:flex; align-items:center; justify-content:center; gap:12rpx; }
  .no-more{ display:inline-block; padding:10rpx 24rpx; border-radius:999rpx; background:rgba(156,107,255,.1); color:$candy-purple; }
}

/* 回到顶部 */
.to-top{
  position: fixed; right:32rpx; bottom:160rpx; width:96rpx; height:96rpx; border-radius:50%;
  background: linear-gradient(135deg, $candy-pink, $candy-purple);
  display:flex; align-items:center; justify-content:center;
  box-shadow: 0 12rpx 32rpx rgba(154,101,255,.35);
  z-index: 999; transition: transform .3s ease;
}
.to-top:active{ transform: scale(.95); }
</style>
