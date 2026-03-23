<template>
  <view>
    <meta name="theme-color" content="#F8F8F8"></meta>
    <view-logs></view-logs>

    <image :src="brand.logo_image" mode="aspectFit" class="brand_logo"></image>

    <view class="body">
      <!-- 顶部信息：一排（左：品牌名图+地区作者类型上下；右：关注按钮） -->
      <view class="brand-head-row">
        <view class="brand-title-col">
          <image
            v-if="brand.brand_name_image"
            :src="brand.brand_name_image"
            mode="heightFix"
            class="brand-name-img"
          ></image>
          <text class="brand-title-sub font-title">
            {{ brand.country_name }} / {{ brand.type }}
          </text>
        </view>

        <text
          class="follow alimama-shuhei"
          @click="likeBrand"
          :style="{ background: hasLikeBrand ? '#ff6a6c' : '#65C3D6' }"
        >
          {{ hasLikeBrand ? '已关注' : '+ 关注品牌' }}
        </text>
      </view>

      <!-- 基本信息 -->
      <view class="info-block">
        <view class="info-line alimama-shuhei">
          <text class="info-k">别名：</text>
          <text class="info-v">{{ brand.nickname_list || '暂无设置' }}</text>
        </view>
        <view class="info-line alimama-shuhei">
          <text class="info-k">简介：</text>
          <text class="info-v">{{ brand.description || '暂未设置' }}</text>
        </view>
      </view>

      <!-- 链接按钮：统一复制（官网/淘宝/微店/小红书/微博） -->
      <view v-if="linkButtons.length" class="link-actions">
        <view
          v-for="btn in linkButtons"
          :key="btn.key"
          class="link-btn alimama-shuhei"
          @tap="handleLinkTap(btn)"
        >
          {{ btn.label }}
        </view>
      </view>

      <!-- Tab（滑动 indicator） -->
      <view class="tabs-container">
        <view class="tab-indicator" :style="indicatorStyle"></view>

        <view
          v-for="(tab, index) in tabs"
          :key="tab.key"
          class="tab-item"
          :class="{ 'active-tab': activeTab === index }"
          @click="switchTab(index)"
        >
          <text class="alimama-shuhei">{{ tab.label }}</text>
        </view>
      </view>

      <!-- 贩售作品 -->
      <view v-show="activeTabKey === 'goods'">
        <view v-if="brandGoodsTypes.length" class="goods-type-sections">
          <view v-for="typeItem in brandGoodsTypes" :key="typeItem.type" class="goods-type-section">
            <view class="goods-type-head">
              <text class="goods-type-tag alimama-shuhei">{{ typeItem.label }}</text>
              <text class="goods-type-meta font-title">{{ formatTypeTotal(typeItem) }} 款</text>
            </view>

            <scroll-view
              class="goods-row-scroll"
              scroll-x
              enhanced
              :show-scrollbar="false"
              :lower-threshold="80"
              @scrolltolower="loadMoreByType(typeItem.type)"
            >
              <view class="goods-row-inner">
                <view
                  class="brand_goods_item goods-row-item"
                  v-for="item in getTypeGoodsList(typeItem.type)"
                  :key="`${typeItem.type}-${item.id}`"
                >
                  <navigator hover-class="none" @click="jumpGoods(item.id)" style="width: 100%;height: 100%;">
                    <view class="goods-media">
                      <image
                        class="brand_goods_image"
                        :src="getGoodsCover(item)"
                        mode="aspectFill"
                      ></image>
                      <view v-if="Number(item.waiting_sale) === 1" class="goods-badge alimama-shuhei">
                        待开售
                      </view>
                    </view>
                    <text class="goods-title alimama-shuhei">{{ item.name }}</text>
                  </navigator>
                </view>
              </view>
            </scroll-view>

            <view v-if="isTypeLoading(typeItem.type) && getTypeGoodsList(typeItem.type).length" class="goods-hint alimama-shuhei">
              正在加载更多...
            </view>
            <view v-if="!isTypeLoading(typeItem.type) && !getTypeGoodsList(typeItem.type).length" class="goods-hint alimama-shuhei">
              这个分类还没有商品
            </view>
          </view>
        </view>

        <view v-else class="goods-hint alimama-shuhei">暂时还没有可展示的商品类型</view>
      </view>

      <!-- 消息动态：卡片（图片 + 标题一行 + 时间） -->
      <view v-show="activeTabKey === 'news'">
        <view class="news-list">
          <view
            class="news-card"
            v-for="item in newsList"
            :key="item.id"
            @click="jump2saleNews(item)"
          >
            <view class="news-media" v-if="item.image_list && item.image_list.length > 0">
              <swiper class="image-swiper" :autoplay="true" :circular="true" indicator-dots>
                <swiper-item v-for="(img, imgIndex) in item.image_list" :key="imgIndex">
                  <image :src="img" mode="aspectFill" class="swiper-image"></image>
                </swiper-item>
              </swiper>
            </view>

            <view class="news-meta">
              <text class="news-title alimama-shuhei">{{ item.title }}</text>
              <text class="news-time font-title">{{ formatTimestamp(item.created_at) }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 接单主页（存在才显示） -->
      <view v-show="activeTabKey === 'artist'">
        <view style="text-align: center; padding: 50rpx 0;">
          <button class="artist-button" @click="jumpToArtistPage">
            <text class="alimama-shuhei">前往接单主页</text>
            <uni-icons type="arrow-right" size="20" color="#65C3D6"></uni-icons>
          </button>
        </view>
      </view>

      <!-- 评论列表：仅在评论 Tab 渲染 -->
      <view v-if="activeTabKey === 'comment'">
        <comment-list
          ref="commentListRef"
          :type="1"
          :relation-id="numericBrandId"
          @reply="handleReplyComment"
        />
      </view>
    </view>

    <view style="height: 80px;"></view>

    <!-- 评论输入框：仅切到评论 Tab 时显示 -->
    <comment-input
      v-if="showCommentInput"
      ref="commentInputRef"
      :reply-info="replyForItem"
      :target-id="String(currentBrandId)"
      @submit="handleCommentSubmit"
      @update:reply-info="val => (replyForItem = val)"
    />
  </view>
</template>

<script setup>
import { ref, computed, onActivated, onDeactivated } from 'vue'
import { websiteUrl, getUserInfo, global } from '../../common/config.js'
import { onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'

const props = defineProps(['brand_id'])

/** ====== brand_id 热切换 ====== */
const currentBrandId = ref(String(props.brand_id || ''))
const lastBrandId = ref(currentBrandId.value)
const numericBrandId = computed(() => parseInt(currentBrandId.value || '0'))

function parseBrandIdFromRoute() {
  try {
    const pages = getCurrentPages?.() || []
    const top = pages[pages.length - 1]
    if (top?.options?.brand_id) return String(top.options.brand_id)
  } catch {}
  if (typeof location !== 'undefined' && location.hash) {
    const m = location.hash.match(/[?&]brand_id=(\d+)/)
    if (m && m[1]) return m[1]
  }
  return ''
}

/** ====== 小程序分享（方法1：右上角胶囊） ====== */
// #ifdef MP-WEIXIN
function ensureShareMenu() {
  try {
    uni.showShareMenu?.({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  } catch {}
}

const buildBrandShareTitle = () => {
  const name = brand.value?.brand_name || ''
  if (name) return `快来看看品牌：${name}`
  return '快来看看这个品牌'
}

const buildBrandSharePath = () => {
  const bid = encodeURIComponent(currentBrandId.value || '')
  return `/pages/brand/brand?brand_id=${bid}`
}

const buildBrandShareImage = () => {
  // 优先 logo，其次品牌名图片
  return brand.value?.logo_image || brand.value?.brand_name_image || ''
}

onShareAppMessage(() => {
  return {
    title: buildBrandShareTitle(),
    path: buildBrandSharePath(),
    imageUrl: buildBrandShareImage()
  }
})

onShareTimeline(() => {
  const bid = encodeURIComponent(currentBrandId.value || '')
  return {
    title: buildBrandShareTitle(),
    query: `brand_id=${bid}`,
    imageUrl: buildBrandShareImage()
  }
})
// #endif

/** ====== Tab（带 key，避免动态插入导致 index 混乱） ====== */
const activeTab = ref(0)
const hasAddedArtistTab = ref(false)
const tabs = ref([
  { label: '贩售作品', key: 'goods' },
  { label: '消息动态', key: 'news' },
  { label: '评论', key: 'comment' }
])

const activeTabKey = computed(() => tabs.value[activeTab.value]?.key || 'goods')

const switchTab = i => {
  const nextKey = tabs.value[i]?.key
  activeTab.value = i

  // 离开评论 tab：收起键盘、清理回复态
  if (nextKey !== 'comment') {
    replyForItem.value = {}
    try { uni.hideKeyboard?.() } catch {}
  }
}

// indicator：宽度=100/tabs.length，位移=activeTab*100%
const indicatorStyle = computed(() => {
  const n = Math.max(1, tabs.value.length || 1)
  return {
    width: `${100 / n}%`,
    transform: `translateX(${activeTab.value * 100}%)`
  }
})

/** ====== 链接按钮：统一复制 ====== */
function normalizeUrl(u) {
  const s = String(u || '').trim()
  if (!s) return ''
  if (/^https?:\/\//i.test(s)) return s
  return `https://${s}`
}

let brand = ref({})

const linkButtons = computed(() => {
  const list = []
  const w = normalizeUrl(brand.value.website_url)
  const tb = normalizeUrl(brand.value.tb_url)
  const vd = normalizeUrl(brand.value.vd_url)
  const red = normalizeUrl(brand.value.rednote_url)
  const wb = normalizeUrl(brand.value.weibo_url)

  if (w) list.push({ key: 'website', label: '官网', url: w })
  if (tb) list.push({ key: 'taobao', label: '淘宝店铺', url: tb })
  if (vd) list.push({ key: 'weidian', label: '微店店铺', url: vd })
  if (red) list.push({ key: 'rednote', label: '小红书', url: red })
  if (wb) list.push({ key: 'weibo', label: '微博', url: wb })

  return list
})

function handleLinkTap(btn) {
  const url = btn?.url
  if (!url) return
  uni.setClipboardData({
    data: url,
    success: () => uni.showToast({ title: `已复制${btn.label}链接`, icon: 'none' }),
    fail: () => uni.showToast({ title: '复制失败', icon: 'none' })
  })
}

/** ====== 关注 ====== */
const hasLikeBrand = ref(false)

/** ====== 评论引用/输入：仅评论Tab显示 ====== */
const commentListRef = ref(null)
const commentInputRef = ref(null)
let replyForItem = ref({})

const pageActive = ref(true)
onActivated(() => (pageActive.value = true))
onDeactivated(() => (pageActive.value = false))

const showCommentInput = computed(() => pageActive.value && activeTabKey.value === 'comment')

const handleReplyComment = ({ parent, target }) => {
  const item = target ?? parent
  if (replyForItem.value.id === item.id) {
    replyForItem.value = {}
    return
  }
  replyForItem.value = item
  commentInputRef.value?.focusInput()
}

const handleCommentSubmit = submitData => {
  let token = uni.getStorageSync('token')
  if (!global.isLogin) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }

  const requestData = {
    content: submitData.content,
    origin: submitData.origin,
    target_id: numericBrandId.value,
    type: 1,
    image_url: submitData.image_url || '',
    association_id: submitData.association_id || 0,
    association_type: submitData.association_type || 0,
    is_anonymous: submitData.is_anonymous || 0,
    ...(replyForItem.value.id && {
      reply_id: replyForItem.value.id,
      reply_for: replyForItem.value.comment,
      reply_uid: replyForItem.value.user_id,
      parent_id:
        replyForItem.value.parent_id > 0
          ? replyForItem.value.parent_id
          : replyForItem.value.id
    })
  }

  const tempComment = {
    id: Date.now(),
    content: submitData.content,
    created_at: Math.floor(Date.now() / 1000),
    like_count: 0,
    reply_count: 0,
    is_liked: false,
    floor: 0,
    ...(submitData.is_anonymous
      ? {
          avatar: 'https://images1.fantuanpu.com/home/default_avatar.jpg',
          username: '匿名用户',
          is_anonymous: 1
        }
      : {
          avatar: global.userInfo.avatar,
          username: global.userInfo.nickname,
          is_anonymous: 0
        }),
    ...(submitData.association_id && {
      association_id: submitData.association_id,
      association_type: submitData.association_type
    }),
    ...(submitData.image_url && { image_url: submitData.image_url }),
    ...(replyForItem.value.id && {
      reply_id: replyForItem.value.id,
      reply_for: replyForItem.value.comment,
      reply_uid: replyForItem.value.user_id,
      parent_id:
        replyForItem.value.parent_id > 0
          ? replyForItem.value.parent_id
          : replyForItem.value.id,
      reply_username: replyForItem.value.is_anonymous
        ? '匿名用户'
        : replyForItem.value.username
    })
  }

  if (!replyForItem.value.id) commentListRef.value?.addNewComment(tempComment)
  else if (replyForItem.value.parent_id === 0)
    commentListRef.value?.addReplyComment({ ...tempComment, parent_id: replyForItem.value.id })
  else
    commentListRef.value?.addReplyComment({ ...tempComment, parent_id: replyForItem.value.parent_id })

  uni.request({
    url: websiteUrl.value + '/with-state/add-comment',
    method: 'POST',
    header: { Authorization: token },
    data: requestData,
    success: res => {
      if (res.data.status === 'success') {
        const newComment = res.data.data
        const finalComment = {
          ...newComment,
          ...(submitData.is_anonymous
            ? {
                avatar: 'https://images1.fantuanpu.com/home/default_avatar.jpg',
                username: '匿名用户',
                is_anonymous: 1
              }
            : {
                avatar: global.userInfo.avatar,
                username: global.userInfo.nickname,
                is_anonymous: 0
              })
        }
        if (newComment.reply_uid && replyForItem.value.is_anonymous) finalComment.reply_username = '匿名用户'
        commentListRef.value?.updateTempComment(tempComment.id, finalComment)
        uni.showToast({ title: '评论成功', icon: 'success' })
      } else {
        commentListRef.value?.removeTempComment(tempComment.id)
        uni.showToast({ title: res.data.msg, icon: 'none' })
      }
    },
    fail: () => {
      commentListRef.value?.removeTempComment(tempComment.id)
      uni.showToast({ title: '网络请求失败', icon: 'none' })
    }
  })
}

/** ====== 数据拉取 ====== */
let newsList = ref([])
let newsPage = ref({ page_index: 1, page_size: 10, total: 0 })
const brandGoodsTypes = ref([])
const goodsTypeStateMap = ref({})

function resetGoodsTypeState() {
  brandGoodsTypes.value = []
  goodsTypeStateMap.value = {}
}

function ensureGoodsTypeState(typeKey) {
  if (!goodsTypeStateMap.value[typeKey]) {
    goodsTypeStateMap.value[typeKey] = {
      goods_list: [],
      page: 1,
      total: 0,
      loading: false,
      inited: false,
      noMore: false
    }
  }
  return goodsTypeStateMap.value[typeKey]
}

function getTypeGoodsList(typeKey) {
  return ensureGoodsTypeState(typeKey).goods_list || []
}

function isTypeLoading(typeKey) {
  return !!ensureGoodsTypeState(typeKey).loading
}

function canLoadMoreType(typeKey) {
  const state = ensureGoodsTypeState(typeKey)
  if (state.loading || !state.inited) return false
  if (state.total <= 0) return false
  return state.goods_list.length < state.total
}

function loadMoreByType(typeKey) {
  return getBrandGoodsByType(true, typeKey, currentBrandId.value)
}

function formatTypeTotal(typeItem) {
  const typeKey = String(typeItem?.type || '')
  if (!typeKey) return Number(typeItem?.count || 0)
  const state = ensureGoodsTypeState(typeKey)
  return Number(state.total || typeItem?.count || 0)
}

function getBrandGoodsTypes(brandId = currentBrandId.value) {
  return new Promise(resolve => {
    const parseTypeList = rawList => {
      if (Array.isArray(rawList)) {
        return rawList
          .map(item => {
            if (typeof item === 'string') {
              return { type: item, label: item, count: 0 }
            }
            return {
              type: String(item?.type || '').trim(),
              label: String(item?.label || item?.type || '').trim(),
              count: Number(item?.count || 0)
            }
          })
          .filter(item => item.type)
      }
      return []
    }

    const applyList = list => {
      brandGoodsTypes.value = parseTypeList(list)
    }

    const fallbackToGlobalTypes = () => {
      uni.request({
        url: `${websiteUrl.value}/goods-types`,
        method: 'GET',
        success: fallbackRes => {
          applyList(fallbackRes?.data?.data || [])
        },
        complete: () => resolve()
      })
    }

    uni.request({
      url: `${websiteUrl.value}/brand-goods-types?brand_id=${brandId}`,
      method: 'GET',
      success: res => {
        const isSuccess = String(res?.data?.status || '') === 'success'
        if (!isSuccess) {
          fallbackToGlobalTypes()
          return
        }
        applyList(res?.data?.data || [])
        resolve()
      },
      fail: () => {
        fallbackToGlobalTypes()
      },
      complete: () => {}
    })
  })
}

function getBrandGoodsByType(isLoadMore = false, goodsType = '', brandId = currentBrandId.value) {
  return new Promise(resolve => {
    const state = ensureGoodsTypeState(goodsType)
    if (state.loading) {
      resolve()
      return
    }
    if (isLoadMore && state.noMore) {
      resolve()
      return
    }
    const page = isLoadMore ? state.page : 1
    state.loading = true

    uni.request({
      url: `${websiteUrl.value}/brand-goods?brand_id=${brandId}&page=${page}&page_size=9&goods_type=${encodeURIComponent(goodsType)}`,
      method: 'GET',
      timeout: 5000,
      success: res => {
        const data = res.data?.data || { goods_list: [], total: 0, page_index: page }
        const nextList = Array.isArray(data.goods_list) ? data.goods_list : []
        state.total = Number(data.total || 0)
        state.goods_list = isLoadMore ? state.goods_list.concat(nextList) : nextList
        state.inited = true
        state.page = page + 1
        state.noMore = state.goods_list.length >= state.total || nextList.length === 0
        if (isLoadMore && nextList.length === 0) {
          uni.showToast({ title: '这个分类已经到底啦', icon: 'none' })
        }
      },
      fail: () => uni.showToast({ title: '网络请求失败', icon: 'none' }),
      complete: () => {
        state.loading = false
        resolve()
      }
    })
  })
}

async function initBrandGoodsByType(brandId = currentBrandId.value) {
  resetGoodsTypeState()
  await getBrandGoodsTypes(brandId)
  if (!brandGoodsTypes.value.length) {
    return
  }
  await Promise.all(
    brandGoodsTypes.value.map(typeItem => getBrandGoodsByType(false, typeItem.type, brandId))
  )
}

async function reloadByBrandId(newId, source = 'unknown') {
  console.log(`【品牌】reloadByBrandId 来源=${source} id=${newId}`)
  currentBrandId.value = String(newId)
  lastBrandId.value = String(newId)

  // 重置
  resetGoodsTypeState()
  newsList.value = []
  newsPage.value = { page_index: 1, page_size: 10, total: 0 }
  hasLikeBrand.value = false
  replyForItem.value = {}

  // 重置 Tab：固定包含评论
  activeTab.value = 0
  tabs.value = [
    { label: '贩售作品', key: 'goods' },
    { label: '消息动态', key: 'news' },
    { label: '评论', key: 'comment' }
  ]
  hasAddedArtistTab.value = false

  uni.showLoading({ title: '加载中' })
  try {
    await Promise.all([
      getBrandsInfo(currentBrandId.value),
      initBrandGoodsByType(currentBrandId.value),
      getBrandNews(currentBrandId.value)
    ])
  } finally {
    uni.hideLoading()
  }
}

function getBrandNews(brandId = currentBrandId.value) {
  return new Promise(resolve => {
    uni.request({
      url: `${websiteUrl.value}/brand-news-list?brand_id=${brandId}&page=${newsPage.value.page_index}&page_size=${newsPage.value.page_size}`,
      method: 'GET',
      success: res => {
        if (res.data.status === 'success') {
          const data = res.data.data
          newsList.value = [...newsList.value, ...(data.news_list || [])]
          newsPage.value.total = data.total || 0
          if (data.news_list && data.news_list.length > 0) newsPage.value.page_index += 1
        } else {
          uni.showToast({ title: res.data.msg || '获取图透失败', icon: 'none' })
        }
      },
      fail: () => uni.showToast({ title: '网络请求失败', icon: 'none' }),
      complete: () => resolve()
    })
  })
}

function getBrandsInfo(brandId = currentBrandId.value) {
  return new Promise(resolve => {
    uni.request({
      url: websiteUrl.value + '/brand-info?id=' + brandId,
      method: 'GET',
      timeout: 5000,
      success: res => {
        brand.value = res.data.data || {}
        uni.setNavigationBarTitle({ title: brand.value.brand_name || '品牌' })
        getHasLikeBrand(brandId)

        // 动态追加“接单主页”tab：插入到“评论”之前
        if (
          !hasAddedArtistTab.value &&
          (brand.value.is_bjd_artist == 1 || brand.value.is_bjd_hairstylist == 1)
        ) {
          const idx = tabs.value.findIndex(t => t.key === 'comment')
          const insertAt = idx >= 0 ? idx : tabs.value.length
          tabs.value.splice(insertAt, 0, { label: '接单主页', key: 'artist' })
          hasAddedArtistTab.value = true
        }
      },
      fail: () => uni.showToast({ title: '网络请求失败', icon: 'none' }),
      complete: () => resolve()
    })
  })
}

const jumpToArtistPage = () => {
  uni.navigateTo({ url: `/pkg-creator/creator_base/creator_profile/creator_profile?brand_id=${currentBrandId.value}&type=artist` })
}

const likeBrand = async () => {
  let token = uni.getStorageSync('token')
  if (!global.isLogin) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  try {
    const url = `${websiteUrl.value}/with-state/${hasLikeBrand.value ? 'unlike' : 'add-like'}`
    const res = await uni.request({
      url,
      method: 'POST',
      header: { Authorization: token },
      data: { id: numericBrandId.value, type: 2 }
    })
    if (res.data.status === 'success') {
      hasLikeBrand.value = !hasLikeBrand.value
      uni.showToast({ title: hasLikeBrand.value ? '关注成功' : '已取消关注', icon: 'none' })
      getBrandsInfo(currentBrandId.value)
    } else {
      uni.showToast({ title: res.data.msg || '操作失败', icon: 'none' })
    }
  } catch {
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

const getHasLikeBrand = async (brandId = currentBrandId.value) => {
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/hasLike?id=${parseInt(brandId)}&type=2`,
      method: 'POST',
      header: { Authorization: uni.getStorageSync('token') || '' }
    })
    hasLikeBrand.value = !!(res.data?.data?.id > 0)
  } catch {}
}

/** ====== 工具 ====== */
function formatTimestamp(ts) {
  if (!ts) return ''
  const d = new Date(ts * 1000)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${h}:${mm}`
}

function getGoodsCover(item) {
  if (!item) return ''
  const images = item.goods_images
  if (Array.isArray(images)) {
    return String(images[0] || '').trim()
  }
  if (typeof images === 'string') {
    const raw = images.trim()
    if (!raw) return ''
    if (raw.startsWith('[') && raw.endsWith(']')) {
      try {
        const arr = JSON.parse(raw)
        if (Array.isArray(arr)) {
          return String(arr[0] || '').trim()
        }
      } catch {}
    }
    if (raw.includes(',')) {
      return raw
        .split(',')
        .map(v => String(v || '').trim())
        .filter(Boolean)[0] || ''
    }
    return raw
  }
  return String(item.cover_image || item.cover || item.image || '').trim()
}

function jumpGoods(id) {
  uni.navigateTo({ url: '/pages/goods/goods?goods_id=' + id })
}

function jump2saleNews(item) {
  uni.navigateTo({ url: `/pkg-common/sale_news/sale_news?id=${item.id}&brand_id=${item.brand_id}` })
}

/** ====== 生命周期 ====== */
onShow(async () => {
  // #ifdef MP-WEIXIN
  ensureShareMenu()
  // #endif

  getUserInfo()
  const idFromRoute = parseBrandIdFromRoute()
  const newId = String(idFromRoute || currentBrandId.value || '')
  console.log('[品牌] 当前 URL/路由 brand_id =', newId)

  if (newId && newId !== lastBrandId.value) {
    console.log('【品牌】onShow 检测到ID变化：', lastBrandId.value, '→', newId)
    await reloadByBrandId(newId, 'onShow')
    return
  }

  if (!brand.value.id) {
    uni.showLoading({ title: '加载中' })
    try {
      await getBrandsInfo(currentBrandId.value)
      await Promise.all([getBrandNews(currentBrandId.value), initBrandGoodsByType(currentBrandId.value)])
    } finally {
      uni.hideLoading()
    }
  } else {
    if (newsList.value.length === 0) getBrandNews(currentBrandId.value)
    if (!brandGoodsTypes.value.length) initBrandGoodsByType(currentBrandId.value)
  }
})
</script>

<style lang="less" scoped>
.brand_logo {
  width: calc(100vw - 10px);
  display: block;
  margin: 5px;
  float: left;
}

.body {
  width: 100vw;
  opacity: 1;
  border-radius: 25px;
  background: white;
  box-shadow: 0px -10px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  padding: 20px;
  box-sizing: border-box;
}

.font-title {
  font-weight: 800;
}

.alimama-shuhei {
  font-weight: 600;
}

/* 顶部一排 */
.brand-head-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

/* 左侧上下布局 */
.brand-title-col {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  min-width: 0;
}

.brand-name-img {
  height: 60rpx;
  max-width: 520rpx;
}

.brand-title-sub {
  color: #7a7a7a;
  font-size: 24rpx;
  line-height: 1.2;
}

/* 关注按钮（同一排） */
.follow {
  padding: 12rpx 30rpx;
  border-radius: 20rpx;
  overflow: hidden;
  display: inline-block;
  color: #ffffff;
  font-size: 11px;
  flex-shrink: 0;
}

/* 基本信息 */
.info-block {
  margin-top: 12px;
}
.info-line {
  margin-top: 10px;
  display: flex;
  gap: 8rpx;
  line-height: 1.6;
}
.info-k {
  color: #8c8c8c;
  flex-shrink: 0;
}
.info-v {
  color: #333;
  flex: 1;
}

/* 链接按钮 */
.link-actions {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}
.link-btn {
  padding: 12rpx 18rpx;
  border-radius: 14rpx;
  background: #f4fbfd;
  color: #2b7f8f;
  font-size: 26rpx;
}

/* Tab + indicator */
.tabs-container {
  position: relative;
  display: flex;
  margin: 20rpx 0;
  border-bottom: 1px solid #eee;
}
.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  font-size: 32rpx;
  color: #666;
  position: relative;
  z-index: 2;
}
.tab-item.active-tab {
  color: #65c3d6;
  font-weight: bold;
}
.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 4rpx;
  background-color: #65c3d6;
  border-radius: 2rpx;
  transition: transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1);
  will-change: transform;
  z-index: 1;
}

/* 贩售作品：按类型纵向分区，每个分区横向滑动 */
.goods-type-sections {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.goods-type-section {
  padding: 4rpx 0 10rpx;
}

.goods-type-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 12rpx;
  padding: 0 2rpx;
}

.goods-type-tag {
  display: inline-block;
  font-size: 28rpx;
  font-weight: 700;
  letter-spacing: 1rpx;
  color: #ffffff;
  background: linear-gradient(135deg, #7adcf3 0%, #78daf5 52%, #74b7ff 100%);
  padding: 10rpx 20rpx 10rpx 30rpx;
  border-radius: 14rpx 6rpx 14rpx 6rpx;
  line-height: 1.2;
  position: relative;
  box-shadow: 0 8rpx 16rpx rgba(73, 202, 238, 0.25);
}

.goods-type-tag::before {
  content: '';
  position: absolute;
  left: 12rpx;
  top: 50%;
  width: 8rpx;
  height: 8rpx;
  border-radius: 999rpx;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.92);
}

.goods-type-meta {
  font-size: 24rpx;
  color: #8ea0b8;
}

.goods-row-scroll {
  width: 100%;
  white-space: nowrap;
}

.goods-row-inner {
  display: inline-flex;
  align-items: flex-start;
  gap: 14rpx;
  padding-right: 8rpx;
}

.brand_goods_item.goods-row-item {
  width: 220rpx;
  min-width: 220rpx;
  max-width: 220rpx;
  height: 300rpx;
  border-radius: 14rpx;
  overflow: hidden;
  background: #ffffff;
  padding: 8rpx;
  box-sizing: border-box;
}

.goods-media {
  width: 204rpx;
  height: 220rpx;
  position: relative;
  border-radius: 12rpx;
  overflow: hidden;
}

.brand_goods_image {
  width: 100%;
  height: 100%;
}

/* 待开售角标（圆角 tag） */
.goods-badge {
  position: absolute;
  top: 10rpx;
  left: 10rpx;
  z-index: 5;
  padding: 6rpx 12rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  color: #ffffff;
  background: rgba(0, 0, 0, 0.55);
}

.goods-title {
  display: block;
  width: 204rpx;
  margin-top: 8rpx;
  text-align: left;
  font-weight: 900;
  color: #586f88;
  font-size: 24rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goods-hint {
  margin-top: 10rpx;
  text-align: left;
  padding-left: 8rpx;
  color: #8ea0b8;
  font-size: 24rpx;
}

/* 消息动态 */
.news-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}
.news-card {
  width: calc(50% - 10px);
  margin-bottom: 20px;
  border-radius: 12rpx;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.08);
}
.news-media {
  height: 400rpx;
}
.image-swiper {
  height: 100%;
}
.swiper-image {
  width: 100%;
  height: 100%;
}
.news-meta {
  padding: 14rpx 12rpx 16rpx 12rpx;
}
.news-title {
  display: block;
  font-size: 28rpx;
  color: #111;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.news-time {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #9aa0a6;
}

/* 接单按钮 */
.artist-button {
  background: none;
  border-radius: 40rpx;
  color: #65c3d6;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10rpx 30rpx;
  margin: 0 auto;
}
.artist-button::after {
  border: none;
}
</style>
