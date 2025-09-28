<!-- pages/collocation_square/collocation_square.vue -->
<template>
  <meta name="theme-color" content="#def9ff" />
  <view-logs />

  <view class="page-root">
    <!-- ===== 固定头部（含状态栏） ===== -->
    <view
      class="header-fixed"
      :style="{
        paddingTop: statusBarRpx + 'rpx',
        boxShadow: `0 6rpx 18rpx rgba(0,0,0,${0.10 * progress})`
      }"
    >
      <!-- Tab：图片/文字重叠渐变 -->
      <view class="tabs-area" :style="{ height: tabsHeightRpx + 'rpx' }">
        <view class="tabs-inner">
          <view class="layer image-layer" :style="{ opacity: 1 - progress }">
            <view class="tab" :class="{ active: currentTab === 'find' }" @tap="handleTabSwitch('find')">
              <image src="/static/new-icon/findfind.gif" class="tab-image" mode="aspectFill" />
            </view>
            <view class="tab" :class="{ active: currentTab === 'view' }" @tap="handleTabSwitch('view')">
              <image src="/static/new-icon/sesee.png" class="tab-image" mode="aspectFill" />
            </view>
          </view>

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

      <!-- 辅助面板（随 progress 折叠） -->
      <view class="aux-container" :style="{ height: auxHeightRpx + 'rpx', opacity: 1 - progress }">
        <!-- 找找：搜索 + 分类 + 尺寸 -->
        <view v-show="currentTab === 'find'" class="category-container">
          <view class="search_tab" style="margin: 10rpx 0 40rpx 0;">
            <goods-search :hidden-icon="false" width="670rpx"></goods-search>
          </view>

          <scroll-view scroll-x class="category-scroll" :show-scrollbar="false">
            <view
              class="category-item"
              v-for="(type, index) in goodsTypes"
              :key="index"
              :class="{ active: selectedType === type }"
              @tap="selectType(type)"
            >{{ type }}</view>
          </scroll-view>

          <scroll-view scroll-x class="size-scroll" :show-scrollbar="false">
            <view
              class="size-item"
              v-for="(size, index) in sizes"
              :key="index"
              :class="{ active: selectedSize === size }"
              @tap="selectSize(size)"
            >{{ size }}</view>
          </scroll-view>
        </view>

        <!-- 看看：筛选条（点击整条打开弹层） -->
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
                  {{ goods.goods_name }} <text class="remove">×</text>
                </view>
              </view>
              <text v-if="!filterGoods.length" class="tip">当前无筛选条件</text>
            </view>
            <button class="submit-btn" @tap.stop="applyFilterAndOpen">筛选</button>
          </view>
        </view>
      </view>
    </view>
    <!-- ===== /固定头部 ===== -->

    <!-- 主体：用 marginTop 挪到头部下方 -->
    <view class="page-body" :style="{ marginTop: headerTotalRpx + 'rpx' }">
      <!-- 找找 -->
      <view v-if="currentTab === 'find'">
        <scroll-view
          class="goods-list"
          scroll-y
          :style="{ height: listHeightRpx + 'rpx' }"
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
              <image
                :src="firstGoodsImage(goods)"
                mode="aspectFill"
                class="goods-image"
                @error="onGoodsImgError(goods)"
              />
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

      <!-- 看看 -->
      <view v-if="currentTab === 'view'">
        <view class="container" style="height: 100vh;">
          <scroll-view
            class="card-list"
            scroll-y
            :style="{ height: listHeightRpx + 'rpx' }"
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
                      <uni-icons type="hand-up" size="18" color="#5f85a3" />
                      <text style="margin: 0 5rpx;color: #5f85a3;"> {{ item.like_count }}</text>
                    </view>
                  </view>
                </view>

                <image
                  v-if="Array.isArray(item.image_urls) && item.image_urls.length > 0"
                  :src="item.image_urls[0] || NO_IMG"
                  mode="aspectFill"
                  class="card-image"
                  lazy-load
                  @error="onCardImgError(item)"
                  @load="onCardImgLoad"
                />

                <view class="card-content">
                  <text class="title">{{ item.title }}</text>
                  <text class="desc">{{ item.content }}</text>
                  <view class="goods-tags">
                    <view class="tag-box" v-for="(rel, idx) in (item.relation_list || [])" :key="idx">
                      <text class="goods-tag">{{ rel.relation_goods_name || '未命名商品' }}</text>
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
            <uni-icons type="plusempty" size="30" color="#fff" />
          </view>
          <uni-transition name="fade" mode="out-in" :duration="300">
            <view v-if="showPostMenu" class="post-menu-mask" @tap="closePostMenu" />
          </uni-transition>
          <view class="post-menu" :class="{ show: showPostMenu }">
            <view class="menu-item" @tap="goToCollocation">
              <uni-icons style="margin-right: 10rpx" type="color" size="24" color="#5f85a3" />
              <text>发搭配分享</text>
            </view>
            <view class="menu-item" @tap="goToShowcase">
              <uni-icons style="margin-right: 10rpx" type="compose" size="24" color="#5f85a3" />
              <text>发展示柜</text>
            </view>
          </view>

          <!-- ===== 官方 uni-popup 筛选弹层（全屏） ===== -->
          <uni-popup ref="filterPopupRef" type="center" :mask-click="true">
            <view class="filter-modal">
              <view class="modal-header" :style="miniProgram ? 'margin-top:60rpx' : 'margin-top:0rpx'">
                <text class="title">筛选看想要的娃物搭配吧！</text>
                <text class="close" @tap="closeFilter">×</text>
              </view>

              <view class="modal-body">
                <view class="search_tab">
                  <goods-search mode="fill" @select="handleGoodsSelect" :background="'#f8f8f8'" :width="'100%'" />
                </view>

                <view class="selected-goods">
                  <view
                    v-for="goods in filterGoods"
                    :key="goods.goods_id"
                    class="goods-tag"
                    @tap.stop="(e) => removeGood(goods.goods_id, e)"
                  >
                    {{ goods.goods_name }} <text class="remove">×</text>
                  </view>
                </view>
              </view>

              <view class="action-btns">
                <button class="btn reset" @tap="resetFilter">重置</button>
                <button class="btn confirm" @tap="applyFilter">应用筛选</button>
              </view>
            </view>
          </uni-popup>
          <!-- ===== /uni-popup ===== -->
        </view>
      </view>
    </view>

    <loading-toast :show="goodsLoading || loading" />
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, getCurrentInstance, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { websiteUrl, global } from '../../common/config.js'

/* ======== 无图兜底 & 安全取图 ======== */
const NO_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
      <rect width="100%" height="100%" fill="#e9ebef"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        fill="#9aa0a6" font-size="40" font-family="Arial">No Image</text>
    </svg>`
  )

function firstGoodsImage (goods) {
  const arr = Array.isArray(goods?.goods_images) ? goods.goods_images : []
  let url = (arr[0] || '').trim()
  if (!url) url = goods?.goods_name_image || goods?.goods_brand_name_image || ''
  if (url) {
    const low = url.toLowerCase()
    if (low.includes('/default') || low.endsWith('default.png') || low.includes('noimage')) url = ''
  }
  if (goods?.__imgBroken) url = ''
  return url || NO_IMG
}
function onGoodsImgError (goods) { if (goods) goods.__imgBroken = true }
function onCardImgError (item) {
  if (!item) return
  if (!Array.isArray(item.image_urls)) item.image_urls = []
  item.image_urls[0] = NO_IMG
}
function onCardImgLoad () {
  // 单张图片加载完成后再补测一次，避免高度为 0
  layoutFunction(true)
}

/* ======== 统一用 rpx 计算高度（含状态栏） ======== */
const si = global?.systemInfo || uni.getSystemInfoSync()
const px2rpx = (px) => (si && si.windowWidth ? (750 / si.windowWidth) * px : px)
const rpx2px = (rpx) => (si && si.windowWidth ? (si.windowWidth / 750) * rpx : rpx)
const windowHeightRpx = Math.round(px2rpx(si.windowHeight || 0))
const statusBarRpx   = Math.round(px2rpx(si.statusBarHeight || 0))

/** 间距常量（恢复旧版：左右 20rpx 容器内边距 + 列间距 12rpx） */
const SIDE_PADDING_RPX = 20
const GUTTER_RPX = 12
const SIDE_PADDING_PX = rpx2px(SIDE_PADDING_RPX)
const GUTTER_PX  = rpx2px(GUTTER_RPX)

/** 折叠参数 */
const TABS_EXPANDED_RPX = 150
const TABS_COLLAPSED_RPX = 60
const FIND_PANEL_RPX = 260
const VIEW_PANEL_RPX  = 160

/** 折叠进度：0~1 */
const collapsePx = ref(0)
const MAX_COLLAPSE_PX = rpx2px(TABS_EXPANDED_RPX - TABS_COLLAPSED_RPX)
const progress = computed(() => (MAX_COLLAPSE_PX ? collapsePx.value / MAX_COLLAPSE_PX : 0))

/** 头部高度（rpx） */
const tabsHeightRpx = computed(() =>
  Math.round(TABS_EXPANDED_RPX - (TABS_EXPANDED_RPX - TABS_COLLAPSED_RPX) * progress.value)
)
const auxFullRpx = computed(() => (currentTab.value === 'find' ? FIND_PANEL_RPX : VIEW_PANEL_RPX))
const auxHeightRpx = computed(() => Math.round(auxFullRpx.value * (1 - progress.value)))
const headerContentRpx = computed(() => tabsHeightRpx.value + auxHeightRpx.value)
const headerTotalRpx   = computed(() => statusBarRpx + headerContentRpx.value)
const listHeightRpx    = computed(() => Math.max(0, windowHeightRpx - headerTotalRpx.value))

/** 滚动驱动（向下折叠、向上展开） */
const atTop = ref(true)
const onContentScroll = (e) => {
  const t = Math.max(0, e?.detail?.scrollTop || 0)
  atTop.value = t <= 0
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
  if (atTop.value && progress.value > 0 && dy > 0) {
    pullingExpand.value = true
    collapsePx.value = Math.max(0, collapsePx.value - dy)
    startY = y
  }
}
const onTouchEnd = () => { pullingExpand.value = false }

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

/** 列表 & 瀑布流 */
const collocationList = ref([])
const loading = ref(false)
const noMore = ref(false)
const currentPage = ref(1)
const pageSize = 10

const containerHeight = ref(0)
const cardWidth = ref(0)
/** 旧版逻辑：两列高度累加表 + 列数固定为 2 */
const columnsHeight = reactive([0, 0])
const COLUMN_COUNT = 2

const instance = getCurrentInstance()
const miniProgram = process.env.VUE_APP_PLATFORM === 'mp-weixin'

/** 弹出菜单（发帖） */
const showPostMenu = ref(false)
const togglePostMenu = () => { showPostMenu.value = !showPostMenu.value }
const closePostMenu = () => { showPostMenu.value = false }

/** 找找数据 */
const filterGoods = ref([])
const randomGoodsList = ref([])
const goodsLoading = ref(false)
const goodsNoMore = ref(false)
const goodsCursor = ref(-1)
const selectedType = ref('全部')
const selectedSize = ref('全部')
const goodsTypes = ref([])
const sizes = ref([])
const goodsOptions = ref([])

/** Tab 切换（保留你的写法） */
const handleTabSwitch = (tab) => {
  showPostMenu.value = false
  closeFilter()
  // 切换离开“看看”时清空布局缓存
  if (currentTab.value === 'view') {
    collocationList.value.forEach(item => { delete item.position })
    resetColumns()
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

/** 分类/尺寸接口 */
const { value: baseUrl } = websiteUrl
const fetchGoodsTypes = async () => {
  try {
    const res = await uni.request({ url: `${baseUrl}/goods-types`, method: 'GET' })
    if (res.data?.status === 'success') goodsTypes.value = ['全部', ...(res.data.data || [])]
  } catch (e) { console.error(e) }
}
const fetchSizes = async () => {
  try {
    const res = await uni.request({ url: `${baseUrl}/sizes?show_type=hot`, method: 'GET' })
    if (res.data?.status === 'success') sizes.value = ['全部', ...Object.keys(res.data.data || {})]
  } catch (e) { console.error(e) }
}
const selectType = (type) => { selectedType.value = type; fetchRandomGoods(true) }
const selectSize = (size) => { selectedSize.value = size; fetchRandomGoods(true) }

/** 商品列表（找找） */
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
      url: `${baseUrl}/random-list`,
      method: 'POST',
      data: params,
      header: { 'content-type': 'application/json' }
    })
    if (res.data?.status === 'success') {
      const data = res.data.data || {}
      const newItems = Array.isArray(data.goods_list) ? data.goods_list : []
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

/** ====== 瀑布流布局（旧版思路的稳态实现） ====== */
/** 单卡片 style */
const cardStyle = (index) => {
  const item = collocationList.value[index]
  if (!item?.position) return {}
  return { left: `${item.position.left}px`, top: `${item.position.top}px`, width: `${cardWidth.value}px` }
}
/** 重置列高 */
const resetColumns = () => { for (let i = 0; i < COLUMN_COUNT; i++) columnsHeight[i] = 0 }
/** 主计算：一次性 selectAll('.card')，顺序落位 */
const calculateLayout = (inst, { force = false } = {}) => {
  if (!inst || !collocationList.value?.length) return

  const query = uni.createSelectorQuery().in(inst.proxy)
  // 关键：一次 selectAll，避免逐个 select 的 race 问题
  query.selectAll('.card').boundingClientRect(rects => {
    if (!rects || !rects.length) return
    // 如果大多数高度仍为 0，说明图片尚未加载，稍后重试
    const zeroCount = rects.filter(r => !r || !r.height).length
    if (zeroCount > 0 && !force) {
      // 轻量退避：等一帧后再来
      setTimeout(() => calculateLayout(inst), 120)
      return
    }

    resetColumns()

    rects.forEach((rect, i) => {
      if (!rect) return
      // 找到当前最短列
      let colIdx = 0
      for (let c = 1; c < COLUMN_COUNT; c++) {
        if (columnsHeight[c] < columnsHeight[colIdx]) colIdx = c
      }
      // const left = colIdx * (cardWidth.value + GUTTER_PX)
	  const left = SIDE_PADDING_PX + colIdx * (cardWidth.value + GUTTER_PX)
      const top  = columnsHeight[colIdx]
      columnsHeight[colIdx] = top + rect.height + GUTTER_PX

      const item = collocationList.value[i]
      if (item) item.position = { left, top }
    })

    containerHeight.value = Math.max(...columnsHeight) // 已含最后一行的底部间距
  }).exec()
}
/** 触发布局（首帧 + 两次补算，兼容图片懒加载） */
let layoutTimer = null
const layoutFunction = async (force = false) => {
  await nextTick()
  if (layoutTimer) { clearTimeout(layoutTimer); layoutTimer = null }
  calculateLayout(instance, { force })
  // 补算：等待图片/字体渲染完成
  layoutTimer = setTimeout(() => calculateLayout(instance, { force }), 250)
  setTimeout(() => calculateLayout(instance, { force }), 600)
}

/** 搭配列表（看看） */
const fetchCollocations = async (reset = false) => {
  if (reset) { collocationList.value = []; currentPage.value = 1; noMore.value = false; loading.value = false; resetColumns() }
  if (loading.value || noMore.value) { layoutFunction(); return }
  try {
    loading.value = true
    const params = { page: currentPage.value, page_size: pageSize, filter_goods_id_list: filterGoods.value.map(g => g.goods_id) }
    const res = await uni.request({
      url: `${baseUrl}/collocation-list`,
      method: 'POST',
      data: params,
      header: { 'content-type': 'application/json' }
    })
    if (res.data?.status === 'success') {
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
  } finally { loading.value = false }
}
const loadMore = () => { if (!noMore.value) fetchCollocations() }

/** ===== 筛选弹层（官方 uni-popup） ===== */
const filterPopupRef = ref(null)
const openFilter  = () => { filterPopupRef.value?.open('center') }
const closeFilter = () => { filterPopupRef.value?.close() }
const showFilter  = () => { openFilter() }

const applyFilterAndOpen = () => { openFilter() }

const handleGoodsSelect = (goods) => {
  if (!goods?.id) return
  const newGoods = { goods_id: goods.id, goods_name: `${goods.brand_name ? goods.brand_name + '·' : ''}${goods.name}` }
  if (!filterGoods.value.some(item => item.goods_id === newGoods.goods_id)) {
    filterGoods.value = [...filterGoods.value, newGoods]
  }
}
const applyFilter = async () => { closeFilter(); await fetchCollocations(true) }
const removeGood = (goodsId, e) => {
  e?.stopPropagation?.()
  filterGoods.value = filterGoods.value.filter(g => g.goods_id !== goodsId)
  noMore.value = false
  fetchCollocations(true)
}
const resetFilter = () => { filterGoods.value = [] }

/** 杂项 */
const jumpGoods = (id) => { uni.navigateTo({ url: '/pages/goods/goods?goods_id=' + id }) }
const jump2collectionDetail = (id, origin) => { uni.navigateTo({ url: `/pages/collocation_share/collocation_share?collocation_id=${id}&origin=${origin}` }) }
const jumpToUserPage = (uid) => { uni.navigateTo({ url: `/pages/user_page/user_page?uid=${uid}` }) }
const getUserName = (name) => (name && name.length > 10 ? `${name.toString().slice(-8)}...` : name)
const goToCollocation = () => uni.showToast({ title: 'TODO: 发搭配', icon: 'none' })
const goToShowcase   = () => uni.showToast({ title: 'TODO: 发展示柜', icon: 'none' })

/** 初始化 */
onMounted(() => {
  // 计算卡片宽度（旧版：容器左右 20rpx padding + 列间距 12rpx，2 列）
  const containerWidthPx = si.windowWidth - SIDE_PADDING_PX * 2
  cardWidth.value = (containerWidthPx - GUTTER_PX) / 2

  fetchGoodsTypes()
  fetchSizes()
  fetchRandomGoods(true)
})
onLoad(() => { /* 页面级下拉交给 scroll-view */ })
</script>

<style lang="scss" scoped>
$primary-color: #a6e9f7;
$hover-color: #1ed1e1;

/** ===== 固定头部容器 ===== */
.header-fixed{
  position: fixed; left: 0; right: 0; top: 0; z-index: 2000;
  background: linear-gradient(180deg, #def9ff, #d6e4f2);
  overflow: hidden;
  transition: height .22s ease, box-shadow .22s ease;
}

/** Tabs */
.tabs-area{ width: 100%; }
.tabs-inner{ position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.layer{
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  transition: opacity .22s ease; pointer-events: none;
}
.layer .tab{ pointer-events: auto; }
.tab{ width: 200rpx; height: 100%; display:flex; align-items:center; justify-content:center; position: relative; }
.tab-image{ width: 100rpx; height: 100rpx; border-radius: 16rpx; filter: grayscale(1) saturate(0); opacity: .65; transition: filter .2s, opacity .2s, transform .2s; }
.image-layer .tab.active .tab-image{ filter: none; opacity: 1; }
.tab.text .tab-text{ font-size: 26rpx; font-weight: 400; letter-spacing: 2rpx; color: #9aa4ad; transition: color .2s; }
.tab.text.active .tab-text{ color: #516272; }
.tab.active::after{ content:''; position:absolute; bottom: 8rpx; left:50%; transform:translateX(-50%); width: 80rpx; height: 6rpx; background: #516272; border-radius: 3rpx; }

/** 辅助面板容器 */
.aux-container{ width: 100%; overflow: hidden; transition: height .22s ease, opacity .22s ease; }

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

/** ===== 主体区 / 列表 ===== */
.page-root{
  height: 100vh;
  overflow: hidden;
  /* H5 防止滚动链式传递/回弹 */
  overscroll-behavior: contain;
}
.page-body{ overflow: hidden;}
.goods-list, .card-list{ position: relative; z-index: 0; }
.goods-list{ background:#f5f5f5; }
.goods-container{ display:flex; flex-wrap:wrap; padding:0 20rpx 20rpx; gap:10rpx; background: linear-gradient(1deg,#e4e4e4,#fff); }
.goods-card{ width:350rpx; background:#fff; border-radius:16rpx; overflow:hidden; box-shadow:0 4rpx 12rpx rgba(0,0,0,.05); }
.goods-image{ width:320rpx; height:400rpx; margin:20rpx 15rpx; border-radius:20rpx; }
.goods-info{ padding:20rpx; }
.goods-name{ font-size:26rpx; color:#333; font-weight:500; display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:2; overflow:hidden; line-height:1.4; }
.goods-brand{ display:block; font-size:24rpx; color:#666; margin-top:10rpx; }
.goods-price{ display:block; font-size:26rpx; color:#f9a1a0; font-weight:bold; margin-top:10rpx; }

/** 看看：瀑布流卡片（与旧版一致的紧凑间距） */
.card-list .cards-container{
  position:relative; width:100%;
  // padding: 0 20rpx 20rpx; /* 左右 20rpx，与计算一致 */
  padding: 0;     
  box-sizing: border-box;
}
.card-list .card{
  position:absolute; background:white; border-radius:16rpx; overflow:hidden; box-shadow:0 4rpx 12rpx rgba(0,0,0,.05);
  transition: top .3s ease, left .3s ease;

  .card-image{
    width: calc(100% - 24rpx);
    height: 360rpx;
    border-radius: 15rpx;
    margin: 0 12rpx;
  }
  .card-content{
    padding: 20rpx;
    .title{
      font-size:26rpx; font-weight:500; color:#515151; margin-bottom:12rpx;
      display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:1; overflow:hidden;
    }
    .desc{ display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:2; overflow:hidden; font-size:22rpx; color:#666; line-height:1.5; }
    .goods-tags{
      margin-top:14rpx; display:flex; flex-wrap:wrap; gap:10rpx;
      .tag-box{ padding:4rpx 12rpx; background:#f0f2f5; border-radius:8rpx;
        .goods-tag{ line-height:20rpx; font-size:20rpx; color:#666; max-width:110rpx; display:inline-block; white-space:nowrap; overflow:hidden; }
      }
    }
  }
  .user-info{
    display:flex; align-items:center; padding:16rpx 20rpx 0; margin-bottom:10rpx;
    .avatar{ width:64rpx; height:64rpx; border-radius:50%; margin-right:12rpx; }
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
  box-shadow: 0 6rpx 20rpx rgba(30, 209, 225, 0.4); z-index: 1200; transition: all .3s ease;
  &:active{ transform: scale(.95); box-shadow: 0 4rpx 12rpx rgba(30, 209, 225, .3); }
}
.post-menu-mask{ position: fixed; inset: 0; background: rgba(0, 0, 0, .3); z-index: 1200; backdrop-filter: blur(5rpx); }
.post-menu{
  position: fixed; right: 40rpx; bottom: 240rpx; background: #fff; border-radius: 16rpx;
  box-shadow: 0 8rpx 30rpx rgba(0,0,0,.15); padding: 20rpx 0; z-index: 1201;
  transform: translateY(30rpx); opacity: 0; pointer-events: none; transition: all .3s ease;
  &.show{ transform: translateY(0); opacity: 1; pointer-events: auto; }
  &::before{ content:''; position:absolute; bottom:-12rpx; right:35rpx; width:0; height:0;
    border-left:12rpx solid transparent; border-right:12rpx solid transparent; border-top:12rpx solid #fff; }
  .menu-item{ display:flex; align-items:center; padding:20rpx 40rpx; font-size:26rpx; color:#333; &:active{ background:#f5f5f5; } }
}

/** ===== 弹层相关（官方 uni-popup，全屏） ===== */
:deep(.uni-popup){ z-index: 4000 !important; }
:deep(.uni-popup__wrapper),
:deep(.uni-popup__box),
:deep(.uni-popup__wrapper-box){ width: 100vw !important; max-width: 100vw !important; }

.filter-modal{
  width: 100vw; height: 100vh; background:#fff; border-radius: 0;
  display:flex; flex-direction: column; box-shadow: 0 12rpx 40rpx rgba(0,0,0,.15);
}
.filter-modal .modal-header{
  position: sticky; top: 0; z-index: 2;
  display:flex; align-items:center; justify-content:center;
  padding: 30rpx; background: linear-gradient(180deg, #def9ff, #d6e4f2); border-bottom: 2rpx solid rgba(0,0,0,.04);
  .title{ font-size: 30rpx; font-weight: 700; color: #516272; }
  .close{ position:absolute; right: 24rpx; top: 12rpx; font-size: 48rpx; line-height: 1; color:#8191a0; padding: 10rpx 20rpx; }
}
.filter-modal .modal-body{
  padding: 20rpx 24rpx; overflow-y: auto; flex: 1; background: #fafcff;
}
.filter-modal .search_tab{ margin-bottom: 20rpx; }

/* 已选标签区域 */
.selected-goods{ display:flex; flex-wrap:wrap; gap: 16rpx; margin-top: 10rpx; }
.goods-tag{
  display:inline-flex; align-items:center; padding: 10rpx 16rpx; border-radius: 12rpx;
  background:#eef2f6; color:#516272; font-size:24rpx;
  .remove{ margin-left: 10rpx; font-size: 28rpx; color:#9aa4ad; }
}
/* 底部按钮 */
.action-btns{
  display:flex; gap: 20rpx; padding: 20rpx 24rpx 40rpx; background:#fff; border-top: 2rpx solid rgba(0,0,0,.05);
  .btn{ flex:1; height: 80rpx; line-height: 80rpx; border-radius: 16rpx; font-size: 28rpx; font-weight: 700; }
  .reset{ background:#f4f6f8; color:#637186; border:none; }
  .confirm{ background: linear-gradient(135deg, #a6e9f7, #1ed1e1); color:#fff; border:none; }
}

/** 让搜索组件的结果列表始终在所有列表之上 */
:deep(.search_tab){ position: relative; z-index: 3001; }

/* 去滚动条 */
::-webkit-scrollbar{ width:0!important; height:0!important; background-color:transparent!important; display:none!important; }
</style>
