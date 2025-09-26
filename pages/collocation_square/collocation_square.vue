<template>
  <meta name="theme-color" content="#def9ff"></meta>
  <view-logs />
  <common-page head_color="#def9ff">
    <!-- ===== 固定头部（Tabs + 辅助面板） ===== -->
    <view
      class="header-fixed"
      :style="{
        height: headerHeightRpx + 'rpx',
        boxShadow: `0 6rpx 18rpx rgba(0,0,0,${0.10 * progress})`,
        '--header-height-px': headerHeightPx + 'px'
      }"
    >
      <!-- 图片/文字 Tab：重叠渐变切换 -->
      <view class="tabs-area" :style="{ height: tabsHeightRpx + 'rpx' }">
        <view class="tabs-inner">
          <!-- 图片层（保持尺寸不变，容器裁切 + 透明度） -->
          <view class="layer image-layer" :style="{ opacity: 1 - progress }">
            <view class="tab" :class="{ active: currentTab === 'find' }" @tap="handleTabSwitch('find')">
              <image src="/static/new-icon/findfind.gif" class="tab-image" mode="aspectFill" />
            </view>
            <view class="tab" :class="{ active: currentTab === 'view' }" @tap="handleTabSwitch('view')">
              <image src="/static/new-icon/sesee.png" class="tab-image" mode="aspectFill" />
            </view>
          </view>

          <!-- 文字层（与图片层绝对重叠，渐显） -->
          <view class="layer text-layer" :style="{ opacity: progress }">
            <view class="tab text" :class="{ active: currentTab === 'find' }" @tap="handleTabSwitch('find')">
              <text class="tab-text">找找</text>
            </view>
            <view class="tab text" :class="{ active: currentTab === 'view' }" @tap="handleTabSwitch('view')">
              <text class="tab-text">看看</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 辅助面板（固定头部的一部分；随 progress 折叠为 0） -->
      <view class="aux-container" :style="{ height: auxHeightRpx + 'rpx', opacity: 1 - progress }">
        <!-- find：分类/尺寸/搜索 -->
        <view v-show="currentTab === 'find'" class="category-container">
          <view style="margin: 10rpx 0 40rpx 0;">
            <goods-search :hidden-icon="false" width="670rpx"></goods-search>
          </view>
          <scroll-view scroll-x class="category-scroll" :show-scrollbar="false">
            <view
              class="category-item"
              v-for="(type, index) in goodsTypes"
              :key="index"
              :class="{ active: selectedType === type }"
              @tap="selectType(type)"
            >
              {{ type }}
            </view>
          </scroll-view>

          <scroll-view scroll-x class="size-scroll" :show-scrollbar="false">
            <view
              class="size-item"
              v-for="(size, index) in sizes"
              :key="index"
              :class="{ active: selectedSize === size }"
              @tap="selectSize(size)"
            >
              {{ size }}
            </view>
          </scroll-view>
        </view>

        <!-- view：筛选条 -->
        <view v-show="currentTab === 'view'" class="filter-bar-container">
          <view class="filter-bar">
            <view class="filter-tags" @tap="showFilter">
              <view class="selected-goods">
                <view
                  v-for="goods in filterGoods"
                  :key="goods.goods_id"
                  class="tag"
                  @tap.stop="(e) => removeGood(goods.goods_id, e)"
                >
                  {{ goods.goods_name }}
                  <text class="remove">×</text>
                </view>
              </view>
              <text v-if="!filterGoods.length" class="tip">当前无筛选条件</text>
            </view>
            <button class="submit-btn" @tap="fetchCollocations(true)">筛选</button>
          </view>
        </view>
      </view>
    </view>
    <!-- ===== /固定头部 ===== -->

    <!-- 页面主体：用 header 高度撑开，避免被遮挡 -->
    <view class="page-body" :style="{ '--header-height-px': headerHeightPx + 'px' }">
      <!-- 找找 Tab 内容区 -->
      <view v-if="currentTab === 'find'">
        <scroll-view
          class="goods-list"
          scroll-y
          :refresher-enabled="enableRefresher"
          :refresher-triggered="findRefreshing"
          refresher-default-style="black"
          refresher-background="#f5f5f5"
          @refresherrefresh="onFindRefresh"
          @refresherrestore="() => { findRefreshing = false }"
          @refresherabort="() => { findRefreshing = false }"
          @scrolltolower="loadMoreGoods"
          :show-scrollbar="false"
          @scroll="onContentScroll"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
        >
          <view class="goods-container">
            <view
              v-for="(goods, index) in randomGoodsList"
              :key="goods.id"
              class="goods-card"
              @tap="jumpGoods(goods.id)"
            >
              <image :src="goods.goods_images[0]" mode="aspectFill" class="goods-image" />
              <view class="goods-info">
                <text class="goods-name">{{ goods.name }}</text>
                <text class="goods-brand">{{ goods.brand_name }}</text>
                <text class="goods-price">{{ goods.total_amount }} {{ goods.currency }}</text>
              </view>
            </view>
          </view>

          <view class="loading-state">
            <text v-if="goodsLoading">加载中...</text>
            <text v-if="goodsNoMore" class="no-more">没有更多了</text>
          </view>
        </scroll-view>
      </view>

      <!-- 看看 Tab 内容区 -->
      <view v-if="currentTab === 'view'">
        <view class="container">
          <scroll-view
            class="card-list"
            scroll-y
            :refresher-enabled="enableRefresher"
            :refresher-triggered="viewRefreshing"
            refresher-default-style="black"
            refresher-background="#f5f5f5"
            @refresherrefresh="onViewRefresh"
            @refresherrestore="() => { viewRefreshing = false }"
            @refresherabort="() => { viewRefreshing = false }"
            @scrolltolower="loadMore"
            :show-scrollbar="false"
            @scroll="onContentScroll"
            @touchstart="onTouchStart"
            @touchmove="onTouchMove"
            @touchend="onTouchEnd"
          >
            <view class="cards-container" :style="{ height: containerHeight + 'px' }">
              <view
                v-for="(item, index) in collocationList"
                :key="item.collocation_id"
                class="card"
                :id="'card-' + index"
                :style="cardStyle(index)"
                @tap="jump2collectionDetail(item.collocation_id, item.origin)"
              >
                <view class="user-info" @tap.stop="jumpToUserPage(item.uid)">
                  <image :src="item.avatar || '/default_avatar.jpg'" class="avatar" mode="aspectFill" />
                  <view class="user-meta">
                    <text class="username">{{ getUserName(item.username) }}</text>
                    <view class="like-count">
                      <uni-icons type="hand-up" size="18" color="#5f85a3"></uni-icons>
                      <text style="margin: 0 5rpx;color: #5f85a3;"> {{ item.like_count }}</text>
                    </view>
                  </view>
                </view>

                <image
                  v-if="item.image_urls?.length > 0"
                  :src="item.image_urls[0]"
                  mode="aspectFill"
                  class="card-image"
                  lazy-load
                />
                <view class="card-content">
                  <text class="title">{{ item.title }}</text>
                  <text class="desc">{{ item.content }}</text>
                  <view class="goods-tags">
                    <view class="tag-box" v-for="(rel, index) in item.relation_list" :key="index">
                      <text class="goods-tag">
                        {{ rel.relation_goods_name || '未命名商品' }}
                      </text>
                    </view>
                  </view>
                </view>
              </view>
            </view>

            <view class="loading-state">
              <text v-if="loading">加载中...</text>
              <text v-if="noMore" class="no-more">没有更多了</text>
            </view>
          </scroll-view>

          <!-- 悬浮发帖按钮与弹层 -->
          <view class="floating-button" @tap="togglePostMenu">
            <uni-icons type="plusempty" size="30" color="#fff"></uni-icons>
          </view>
          <uni-transition name="fade" mode="out-in" :duration="300">
            <view v-if="showPostMenu" class="post-menu-mask" @tap="closePostMenu"></view>
          </uni-transition>
          <view class="post-menu" :class="{ show: showPostMenu }">
            <view class="menu-item" @tap="goToCollocation">
              <uni-icons style="margin-right: 10rpx;" type="color" size="24" color="#5f85a3"></uni-icons>
              <text>发搭配分享</text>
            </view>
            <view class="menu-item" @tap="goToShowcase">
              <uni-icons style="margin-right: 10rpx;" type="compose" size="24" color="#5f85a3"></uni-icons>
              <text>发展示柜</text>
            </view>
          </view>

          <!-- 筛选弹窗 -->
          <common-modal v-model:visible="showFilterModal" top="0" width="100%" height="100%">
            <view class="modal-mask" @tap.stop="closeFilter"></view>
            <view class="filter-modal">
              <view class="modal-header" :style="miniProgram ? 'margin-top:60rpx' : 'margin-top:0rpx'">
                <text class="title">筛选看想要的娃物搭配吧！</text>
                <text class="close" @tap="closeFilter">×</text>
              </view>

              <goods-search mode="fill" @select="handleGoodsSelect" :background="'#f8f8f8'" :width="'100%'" />

              <view class="selected-goods">
                <view
                  v-for="goods in filterGoods"
                  :key="goods.goods_id"
                  class="goods-tag"
                  @tap.stop="(e) => removeGood(goods.goods_id, e)"
                >
                  {{ goods.goods_name }}
                  <text class="remove">×</text>
                </view>
              </view>

              <view class="action-btns">
                <button class="btn reset" @tap="resetFilter">重置</button>
                <button class="btn confirm" @tap="applyFilter">应用筛选</button>
              </view>
            </view>
          </common-modal>
        </view>
      </view>
    </view>

    <loading-toast :show="goodsLoading||loading"></loading-toast>
  </common-page>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, getCurrentInstance, computed } from 'vue'
import { onLoad } from "@dcloudio/uni-app"
import { websiteUrl } from '../../common/config.js'

/** ===== 折叠参数（可按视觉微调） ===== */
const TABS_EXPANDED_RPX = 150
const TABS_COLLAPSED_RPX = 60
const FIND_PANEL_RPX = 260   // 找找辅助面板（搜索+分类+尺寸）展开时的预期高度
const VIEW_PANEL_RPX  = 160  // 看看辅助面板（筛选条）展开时的预期高度

const sys = uni.getSystemInfoSync()
const rpx2px = (rpx) => (sys.windowWidth / 750) * rpx

/** 折叠进度：0（完全展开）~ 1（完全折叠，仅显示Tab） */
const collapsePx = ref(0)                      // 0 ~ MAX_COLLAPSE_PX
const MAX_COLLAPSE_PX = rpx2px(TABS_EXPANDED_RPX - TABS_COLLAPSED_RPX)
const progress = computed(() => (MAX_COLLAPSE_PX ? collapsePx.value / MAX_COLLAPSE_PX : 0))

/** 高度计算 */
const tabsHeightRpx = computed(() =>
  Math.round(TABS_EXPANDED_RPX - (TABS_EXPANDED_RPX - TABS_COLLAPSED_RPX) * progress.value)
)
const auxFullRpx = computed(() => currentTab.value === 'find' ? FIND_PANEL_RPX : VIEW_PANEL_RPX)
const auxHeightRpx = computed(() => Math.round(auxFullRpx.value * (1 - progress.value)))
const headerHeightRpx = computed(() => tabsHeightRpx.value + auxHeightRpx.value)
const headerHeightPx  = computed(() => Math.round(rpx2px(headerHeightRpx.value)))

/** 滚动驱动（向下滚动 -> 折叠；向上滚动 -> 展开到 scrollTop 为 0） */
const atTop = ref(true)
const onContentScroll = (e) => {
  const t = Math.max(0, e?.detail?.scrollTop || 0)
  atTop.value = t <= 0
  // 根据可见的滚动位置推进折叠（不会把 collapsePx 设成负数）
  collapsePx.value = Math.min(MAX_COLLAPSE_PX, t)
}

/** 顶部下拉优先展开（在 scrollTop=0 时拦截手势） */
let startY = 0
const pullingExpand = ref(false)
const onTouchStart = (e) => {
  startY = e?.touches?.[0]?.clientY || 0
  pullingExpand.value = false
}
const onTouchMove = (e) => {
  const y = e?.touches?.[0]?.clientY || 0
  const dy = y - startY
  // 在顶部、头部处于折叠状态、并且手势向下时，用手势位移先反向减小 collapsePx（优先展开）
  if (atTop.value && progress.value > 0 && dy > 0) {
    pullingExpand.value = true
    // dy 为 px，collapsePx 也是 px，直接相减
    collapsePx.value = Math.max(0, collapsePx.value - dy)
    startY = y // 连续手势累积
  }
}
const onTouchEnd = () => {
  pullingExpand.value = false
}

/** 下拉刷新开关：头部完全展开时才允许触发 */
const enableRefresher = computed(() => progress.value === 0)

/** ===== 业务状态 ===== */
const currentTab = ref('find')

const findRefreshing = ref(false)
const onFindRefresh = async () => {
  if (findRefreshing.value) return
  findRefreshing.value = true
  try { await fetchRandomGoods(true) } finally { findRefreshing.value = false }
}

const viewRefreshing = ref(false)
const onViewRefresh = async () => {
  if (viewRefreshing.value) return
  viewRefreshing.value = true
  try { await fetchCollocations(true) } finally { viewRefreshing.value = false }
}

const collocationList = ref([])
const loading = ref(false)
const noMore = ref(false)
const currentPage = ref(1)
const pageSize = 10

const containerHeight = ref(0)
const cardWidth = ref(0)
const columnsHeight = reactive([0, 0])

const showFilterModal = ref(false)
const goodsOptions = ref([])
const instance = getCurrentInstance()

const filterGoods = ref([])
const randomGoodsList = ref([])
const goodsLoading = ref(false)
const goodsNoMore = ref(false)
const goodsCursor = ref(-1)
const selectedType = ref('全部')
const selectedSize = ref('全部')
const goodsTypes = ref([])
const sizes = ref([])

const miniProgram = process.env.VUE_APP_PLATFORM === 'mp-weixin'
const showPostMenu = ref(false)
const togglePostMenu = () => { showPostMenu.value = !showPostMenu.value }
const closePostMenu = () => { showPostMenu.value = false }

const handleTabSwitch = (tab) => {
  showPostMenu.value = false
  showFilterModal.value = false
  if (currentTab.value === 'view') {
    collocationList.value.forEach(item => { delete item.position })
    columnsHeight[0] = 0
    columnsHeight[1] = 0
  }
  switchTab(tab)
}
const switchTab = (tab) => {
  currentTab.value = tab
  if (tab === 'find') {
    if (goodsTypes.value.length === 0) { fetchGoodsTypes(); fetchSizes() }
    if (randomGoodsList.value.length === 0) { fetchRandomGoods(true) }
  }
  if (tab === 'view') { fetchCollocations(true) }
}

// 分类/尺寸
const fetchGoodsTypes = async () => {
  try {
    const res = await uni.request({ url: `${websiteUrl.value}/goods-types`, method: 'GET' })
    if (res.data.status === 'success') goodsTypes.value = ['全部', ...res.data.data]
  } catch (e) { console.error(e) }
}
const fetchSizes = async () => {
  try {
    const res = await uni.request({ url: `${websiteUrl.value}/sizes?show_type=hot`, method: 'GET' })
    if (res.data.status === 'success') sizes.value = ['全部', ...Object.keys(res.data.data)]
  } catch (e) { console.error(e) }
}
const selectType = (type) => { selectedType.value = type; fetchRandomGoods(true) }
const selectSize = (size) => { selectedSize.value = size; fetchRandomGoods(true) }

// 商品列表
const fetchRandomGoods = async (reset = false) => {
  if (reset) { randomGoodsList.value = []; goodsCursor.value = -1; goodsNoMore.value = false }
  if (goodsLoading.value || goodsNoMore.value) return
  try {
    goodsLoading.value = true
    const params = {
      cursor: goodsCursor.value,
      page_size: 10,
      type: selectedType.value === '全部' ? '' : selectedType.value,
      size: selectedSize.value === '全部' ? '' : selectedSize.value
    }
    const res = await uni.request({
      url: `${websiteUrl.value}/random-list`,
      method: 'POST',
      data: params,
      header: { 'content-type': 'application/json' }
    })
    if (res.data.status === 'success') {
      const data = res.data.data
      const newItems = data.goods_list || []
      randomGoodsList.value = reset ? newItems : [...randomGoodsList.value, ...newItems]
      goodsCursor.value = data.next_cursor
      goodsNoMore.value = newItems.length < 10
    }
  } catch (e) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    goodsLoading.value = false
  }
}
const loadMoreGoods = () => { fetchRandomGoods() }

// 瀑布流布局
const cardStyle = (index) => {
  const item = collocationList.value[index]
  if (!item?.position) return {}
  return { left: `${item.position.left}px`, top: `${item.position.top}px`, width: `${cardWidth.value}px` }
}
const calculateLayout = (instance) => {
  if (!instance || !collocationList.value?.length) return
  const query = uni.createSelectorQuery().in(instance.proxy)
  const tasks = collocationList.value.map((_, index) =>
    new Promise((resolve) => {
      query.select(`#card-${index}`).boundingClientRect(rect => resolve({ index, rect }))
    })
  )
  query.exec(async () => {
    columnsHeight[0] = 0; columnsHeight[1] = 0
    const results = await Promise.all(tasks)
    results.forEach(({ index, rect }) => {
      if (!rect) return
      const item = collocationList.value[index]
      const colIdx = columnsHeight[0] <= columnsHeight[1] ? 0 : 1
      const left = colIdx * (cardWidth.value + 10)
      const top = columnsHeight[colIdx] + 10
      columnsHeight[colIdx] = top + rect.height
      item.position = { left, top }
    })
    containerHeight.value = Math.max(...columnsHeight) + 20
  })
}
const layoutFunction = async () => {
  await nextTick()
  calculateLayout(instance)
  setTimeout(() => calculateLayout(instance), 500)
}

// 搭配列表
const fetchCollocations = async (reset = false) => {
  if (reset) { collocationList.value = []; currentPage.value = 1; noMore.value = false; loading.value = false }
  if (loading.value || noMore.value) { layoutFunction(); return }
  try {
    loading.value = true
    const params = { page: currentPage.value, page_size: pageSize, filter_goods_id_list: filterGoods.value.map(g => g.goods_id) }
    const res = await uni.request({
      url: `${websiteUrl.value}/collocation-list`,
      method: 'POST',
      data: params,
      header: { 'content-type': 'application/json' }
    })
    if (res.data.status === 'success') {
      const data = res.data.data || {}
      const newItems = Array.isArray(data.collocation_relation_list) ? data.collocation_relation_list : []
      collocationList.value = reset ? newItems : [...collocationList.value, ...newItems]
      noMore.value = newItems.length < pageSize
      currentPage.value++
      if (reset && newItems.length === 0) uni.showToast({ title: '暂无相关搭配', icon: 'none' })
      layoutFunction()
    }
  } catch (e) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}
const loadMore = () => { if (!noMore.value) fetchCollocations() }

// 杂项
const jumpGoods = (id) => { uni.navigateTo({ url: '/pages/goods/goods?goods_id=' + id }) }
const showFilter = () => { showFilterModal.value = true }
const handleGoodsSelect = (goods) => {
  if (!goods?.id) return
  const newGoods = { goods_id: goods.id, goods_name: `${goods.brand_name ? goods.brand_name + '·' : ''}${goods.name}` }
  if (!filterGoods.value.some(item => item.goods_id === newGoods.goods_id)) {
    filterGoods.value = [...filterGoods.value, newGoods]
  }
}
const applyFilter = async () => { showFilterModal.value = false; await fetchCollocations(true) }
const closeFilter = () => { showFilterModal.value = false }
const removeGood = (goodsId, e) => {
  e?.stopPropagation?.()
  filterGoods.value = filterGoods.value.filter(g => g.goods_id !== goodsId)
  noMore.value = false
  fetchCollocations(true)
}
const resetFilter = () => { filterGoods.value = [] }
const jump2collectionDetail = (id, origin) => {
  uni.navigateTo({ url: `/pages/collocation_share/collocation_share?collocation_id=${id}&origin=${origin}` })
}
const jumpToUserPage = (uid) => { uni.navigateTo({ url: `/pages/user_page/user_page?uid=${uid}` }) }
const getUserName = (name) => (name && name.length > 10 ? `${name.toString().slice(-8)}...` : name)

onMounted(() => {
  const padding = 30
  cardWidth.value = (sys.windowWidth - padding) / 2
  fetchGoodsTypes()
  fetchSizes()
  fetchRandomGoods(true)
})

onLoad(() => {
  // 页面级下拉不启用，由 scroll-view 承担
})
</script>

<style lang="scss" scoped>
$primary-color: #a6e9f7;
$hover-color: #1ed1e1;
$border-color: #e6e6e6;

/* Tab 选中/未选中颜色变量 */
$tab-active: #516272;
$tab-inactive: #9aa4ad;

text{ font-size:22rpx; }

/** ===== 固定头部容器 ===== */
.header-fixed{
  position: fixed; left: 0; right: 0; top: 0; z-index: 1000;
  background: linear-gradient(180deg, #def9ff, #d6e4f2);
  overflow: hidden;
  transition: height .22s ease, box-shadow .22s ease;
}

/** Tabs 区（高度随 progress 变化，图片/文字两层重叠） */
.tabs-area{ width: 100%; }
.tabs-inner{
  position: relative; width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
}
.layer{
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center; gap: 80rpx;
  transition: opacity .22s ease;
  pointer-events: none;
}
.layer .tab{ pointer-events: auto; }

.tab{
  width: 200rpx; height: 100%;
  display:flex; align-items:center; justify-content:center;
  position: relative;
}

/* 图片默认灰阶 + 降不透明度；active 恢复彩色与不透明度 */
.tab-image{
  width: 100rpx; height: 100rpx; border-radius: 16rpx;
  filter: grayscale(1) saturate(0);
  opacity: .65;
  transition: filter .2s ease, opacity .2s ease, transform .2s ease;
}
.image-layer .tab.active .tab-image{
  filter: none;
  opacity: 1;
}

/* 文字未选中为灰色，选中为主题色 */
.tab.text .tab-text{
  font-size: 32rpx; font-weight: 700; letter-spacing: 2rpx;
  color: $tab-inactive;
  transition: color .2s ease;
}
.tab.text.active .tab-text{ color: $tab-active; }

/* 下划线仅在选中时显示 */
.tab.active::after{
  content:''; position:absolute; bottom: 8rpx; left:50%; transform:translateX(-50%);
  width: 80rpx; height: 6rpx; background: $tab-active; border-radius: 3rpx;
}

/** 辅助面板容器（根据 progress 调整高度并裁切） */
.aux-container{
  width: 100%;
  overflow: hidden;
  transition: height .22s ease, opacity .22s ease;
}

/** ===== find：分类/尺寸 ===== */
.category-container{ padding: 10rpx 40rpx; background: transparent; }
.category-scroll,.size-scroll{ white-space:nowrap; margin-bottom:10rpx; }
.category-item,.size-item{
  display:inline-block; padding:10rpx 15rpx; margin-right:20rpx; border-radius:40rpx; background:#f5f5f5; font-size:24rpx; color:#817f7f;
  &.active{ background:#fff; color:#7aa2d6; font-weight:bold; }
}

/** ===== view：筛选条 ===== */
.filter-bar-container{ background: transparent; padding:20rpx 30rpx 0rpx; }
.filter-bar{ display:flex; align-items:center; padding:10rpx 20rpx; background:#fff; font-size:22rpx; border-radius:16rpx; }
.filter-tags{ flex:1;
  .tag{ display:inline-block; margin-right:20rpx; padding:8rpx 16rpx; background:#f0f2f5; border-radius:8rpx; font-size:24rpx; color:#666; }
  .tip{ color:#999; font-size:24rpx; }
}
.submit-btn{
  background: linear-gradient(135deg, $primary-color, $hover-color); color:#fff; border:none; border-radius:15rpx;
  font-size:22rpx; font-weight:900; height:60rpx; line-height:60rpx; box-shadow:0 6rpx 20rpx rgba($primary-color,.3);
  &::after{ border:none; }
}

/** ===== 主体区（用 header 高度撑开） ===== */
.page-body{ padding-top: var(--header-height-px); }

/** 找找列表 */
.goods-list{ height: calc(100vh - var(--header-height-px)); background:#f5f5f5; }
.goods-container{ display:flex; flex-wrap:wrap; padding:0 20rpx 20rpx; gap:10rpx; background: linear-gradient(1deg,#e4e4e4,#fff); }
.goods-card{ width:350rpx; background:#fff; border-radius:16rpx; overflow:hidden; box-shadow:0 4rpx 12rpx rgba(0,0,0,.05); }
.goods-image{ width:320rpx; height:400rpx; margin:20rpx 15rpx; border-radius:20rpx; }
.goods-info{ padding:20rpx; }
.goods-name{ font-size:26rpx; color:#333; font-weight:500; display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:2; overflow:hidden; line-height:1.4; }
.goods-brand{ display:block; font-size:24rpx; color:#666; margin-top:10rpx; }
.goods-price{ display:block; font-size:26rpx; color:#f9a1a0; font-weight:bold; margin-top:10rpx; }

/** 看看列表（瀑布流） */
.card-list{ height: calc(100vh - var(--header-height-px)); }
.card-list .cards-container{ position:relative; width:100%; }
.card-list .card{
  position:absolute; background:white; border-radius:16rpx; overflow:hidden; box-shadow:0 4rpx 12rpx rgba(0,0,0,.05); width:330rpx;
  transition: top .3s ease, left .3s ease;
  .card-image{ width:calc(100% - 40rpx); height:360rpx; border-radius:15rpx; margin:0 20rpx; }
  .card-content{ padding:24rpx;
    .title{ font-size:26rpx; font-weight:500; color:#515151; margin-bottom:16rpx; display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:1; overflow:hidden; }
    .desc{ display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:2; overflow:hidden; font-size:22rpx; color:#666; line-height:1.5; }
    .goods-tags{ margin-top:20rpx; display:flex; flex-wrap:wrap; gap:12rpx;
      .tag-box{ padding:4rpx 15rpx; background:#f0f2f5; border-radius:8rpx;
        .goods-tag{ line-height:20rpx; font-size:20rpx; color:#666; max-width:110rpx; display:inline-block; white-space:nowrap; overflow:hidden; }
      }
    }
  }
  .user-info{ display:flex; align-items:center; padding:20rpx 24rpx 0; margin-bottom:16rpx;
    .avatar{ width:64rpx; height:64rpx; border-radius:50%; margin-right:16rpx; }
    .user-meta{ flex:1;
      .username{ font-size:24rpx; color:#515151; display:block; max-width:150rpx; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .like-count{ font-size:20rpx; color:#666; display:flex; align-items:center; }
    }
  }
}

.loading-state{ text-align:center; padding:40rpx; color:#999; font-size:28rpx; .no-more{ display:block; } }

/** 悬浮发帖按钮/菜单 */
.floating-button{
  position: fixed; right: 40rpx; bottom: 120rpx; width: 90rpx; height: 90rpx;
  background: linear-gradient(135deg, #a6e9f7, #1ed1e1);
  border-radius: 50%; display:flex; align-items:center; justify-content:center;
  box-shadow: 0 6rpx 20rpx rgba(30, 209, 225, 0.4); z-index: 999; transition: all .3s ease;
  &:active{ transform: scale(.95); box-shadow: 0 4rpx 12rpx rgba(30, 209, 225, .3); }
}
.post-menu-mask{
  position: fixed; inset: 0; background: rgba(0, 0, 0, .3); z-index: 1000; backdrop-filter: blur(5rpx);
}
.post-menu{
  position: fixed; right: 40rpx; bottom: 240rpx; background: #fff; border-radius: 16rpx;
  box-shadow: 0 8rpx 30rpx rgba(0,0,0,.15); padding: 20rpx 0; z-index: 1001;
  transform: translateY(30rpx); opacity: 0; pointer-events: none; transition: all .3s ease;
  &.show{ transform: translateY(0); opacity: 1; pointer-events: auto; }
  &::before{ content:''; position:absolute; bottom:-12rpx; right:35rpx; width:0; height:0;
    border-left:12rpx solid transparent; border-right:12rpx solid transparent; border-top:12rpx solid #fff; }
  .menu-item{ display:flex; align-items:center; padding:20rpx 40rpx; font-size:26rpx; color:#333; &:active{ background:#f5f5f5; } }
}

/* 去滚动条 */
::-webkit-scrollbar{ width:0!important; height:0!important; background-color:transparent!important; display:none!important; }
</style>
