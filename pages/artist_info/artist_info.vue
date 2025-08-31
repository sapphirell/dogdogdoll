<template>
  <view-logs />
  <view class="artist-detail">
    <!-- 头部信息 -->
    <view class="artist-header">
      <view class="avatar-container">
        <image class="avatar" :src="artistInfo.logo_image" mode="aspectFill" @click="jump2brand(artistInfo.brand_id)"></image>
      </view>
      <view class="info-container">
        <view class="name-container">
          <text class="brand-name" @click="jump2brand(artistInfo.brand_id)">{{ artistInfo.brand_name }}</text>
        </view>

        <!-- 描述：可点击展开/收起 -->
        <text class="description" :class="{ clamp: !descExpanded }" @click="descExpanded = !descExpanded">
          {{ artistInfo.description }}
        </text>

        <view class="status-container">
          <text class="status" v-if="activePlanTab === 'artist'">妆师接单方式: {{ artistInfo.status_of_artist_text }}</text>
          <text class="status" v-else>毛娘接单方式: {{ artistInfo.status_of_hairstylist_text }}</text>
        </view>

        <view class="contact-container">
          <text class="contact-info">联系方式：{{ artistInfo.contact ? artistInfo.contact : "尚未设置" }}</text>
          <text class="copy-tip" @click="copyContactInfo">复制</text>
        </view>
      </view>
    </view>

    <!-- 主Tab切换 -->
    <view class="main-tabs">
      <view class="tab-item" :class="{ active: activeMode === 'works' }" @click="switchMode('works')">作品展示</view>
      <view class="tab-item" :class="{ active: activeMode === 'plans' }" @click="switchMode('plans')">开单记录</view>
    </view>

    <!-- 作品展示模式 -->
    <view v-if="activeMode === 'works'">
      <!-- 置顶作品（原“作品展示”标题改为“置顶作品”） -->
      <view class="showcase-header">
        <text class="showcase-title">置顶作品</text>
        <view class="showcase-divider"></view>
      </view>

      <!-- 高亮图片展示 + 预览 -->
      <scroll-view class="highlight-scroll" scroll-x>
        <view class="highlight-container">
          <image
            v-for="(img, index) in artistInfo.highlight_images"
            :key="index"
            :src="img"
            mode="aspectFill"
            class="highlight-img"
            @click="previewImages(artistInfo.highlight_images, index)"
          ></image>
        </view>
      </scroll-view>

      <!-- 第二个标题：作品展示（防止“作品展示”重复语义不清） -->
      <view class="showcase-header">
        <text class="showcase-title">作品展示</text>
        <view class="showcase-divider"></view>
      </view>

      <!-- Tab切换 -->
      <view class="tabs">
        <view class="tab-item" :class="{ active: activePlanTab === 'artist' }" @click="switchPlanTab('artist')">妆师作品</view>
        <view class="tab-item" :class="{ active: activePlanTab === 'hairstylist' }" @click="switchPlanTab('hairstylist')">毛娘作品</view>
      </view>

      <!-- 妆师作品列表（带大图预览） -->
      <view class="works-list" v-if="activePlanTab === 'artist'">
        <view class="work-item" v-for="(work, index) in worksList" :key="work.id" @click="navigateToFaceup(work.id)">
          <image
            class="work-cover"
            :src="work.image_urls && work.image_urls[0]"
            mode="aspectFill"
            @click.stop="previewImages(work.image_urls || [], 0)"
          ></image>
          <view class="work-info">
            <view class="work-header">
              <text class="work-head" @click.stop="navigateToGoods(work.goods_id)">{{ work.head_name }}</text>
              <view class="sex-tag" :class="work.sex === '男' ? 'male' : 'female'">{{ work.sex }}</view>
            </view>
            <view class="style-tags" v-if="work.style_tags && work.style_tags.length">
              <view class="style-tag" v-for="(tag, idx) in work.style_tags" :key="idx" :style="{ backgroundColor: getTagColor(tag) }">
                {{ tag }}
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 毛娘作品空态（单独区域，确保可居中） -->
      <view v-else class="no-works">
        <image class="empty-icon" src="/static/images/empty.png" mode="aspectFit"></image>
        <text class="empty-text">暂无作品</text>
      </view>

      <!-- 加载更多 / 没有更多（仅妆师作品列表时展示） -->
      <view class="load-more" v-if="activePlanTab === 'artist' && hasMore">
        <uni-load-more status="loading"></uni-load-more>
      </view>
      <view class="no-more" v-else-if="activePlanTab === 'artist' && worksList.length > 0">
        <text>— 已经到底了 —</text>
      </view>
    </view>

    <!-- 开单记录模式 -->
    <view v-else>
      <view class="showcase-header">
        <text class="showcase-title">开单记录</text>
        <view class="showcase-divider"></view>
      </view>

      <!-- 开单Tab切换 -->
      <view class="tabs">
        <view class="tab-item" :class="{ active: activePlanTab === 'artist' }" @click="switchPlanTab('artist')">妆师开单</view>
        <view class="tab-item" :class="{ active: activePlanTab === 'hairstylist' }" @click="switchPlanTab('hairstylist')">毛娘开单</view>
      </view>

      <!-- 开单记录列表 -->
      <view class="plans-list">
        <view v-for="(plan, index) in orderPlans" :key="plan.id" class="plan-item">
          <view class="plan-images">
            <image
              v-for="(img, imgIndex) in plan.images"
              :key="imgIndex"
              :src="img"
              mode="aspectFill"
              class="plan-image"
              @click="previewImages(plan.images, imgIndex)"
            ></image>
          </view>

          <view class="plan-info">
            <text class="info-item">接单类型: {{ getOrderTypeText(plan.order_type) }}</text>
            <text class="info-item">名额: {{ plan.max_participants }}人/每人{{ plan.max_submissions_per_user }}单</text>
            <text class="info-item">
              {{ formatDate(plan.open_time * 1000) }} 至 {{ formatDate(plan.close_time * 1000) }}
              <view class="plan-status" :class="plan.is_active ? 'active' : 'inactive'">{{ plan.is_active ? '进行中' : '已结束' }}</view>
            </text>
          </view>

          <view class="tiers-section">
            <text class="section-title">档位选择</text>
            <view class="tiers-container">
              <view v-for="(tier, tierIndex) in plan.tiers" :key="tierIndex" class="tier-item">
                <text class="tier-title">{{ tier.title }}</text>
                <text class="tier-price">¥{{ tier.price }}</text>
                <text class="tier-desc">{{ tier.description }}</text>
              </view>
            </view>
          </view>

          <view class="addons-section" v-if="plan.addons && plan.addons.length">
            <text class="section-title">加购服务</text>
            <view class="addons-container">
              <view v-for="(addon, addonIndex) in plan.addons" :key="addonIndex" class="addon-item">
                <text class="addon-title">{{ addon.title }}</text>
                <text class="addon-price">+¥{{ addon.price }}</text>
                <text class="addon-desc">{{ addon.description }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="load-more" v-if="hasMorePlans">
        <uni-load-more status="loading"></uni-load-more>
      </view>
      <view class="no-more" v-else-if="orderPlans.length > 0">
        <text>— 没有更多开单记录了 —</text>
      </view>
      <view class="no-works" v-else>
        <image class="empty-icon" src="/static/images/empty.png" mode="aspectFit"></image>
        <text class="empty-text">暂无开单记录</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { websiteUrl } from "@/common/config.js"

const artistInfo = ref({
  artist_id: 0,
  brand_id: 0,
  brand_name: '',
  description: '',
  logo_image: '',
  highlight_images: [],
  status_of_artist: 0,
  status_of_artist_text: '',
  status_of_hairstylist: 0,
  status_of_hairstylist_text: '',
  base_price_of_artist: 0,
  base_price_of_hairstylist: 0,
  // 兼容可能的后端字段
  contact: '',
  contact_of_artist: '',
  contact_of_hairstylist: ''
})

const descExpanded = ref(false)
const worksList = ref([])
const activeMode = ref('works')         // works | plans
const activePlanTab = ref('artist')     // artist | hairstylist
const currentPage = ref(1)
const pageSize = ref(20)
const hasMore = ref(true)
const brandId = ref(0)

const orderPlans = ref([])
const plansPage = ref(1)
const plansPageSize = ref(5)
const hasMorePlans = ref(true)

const getUrlParams = (options) => { brandId.value = options?.brand_id || 0 }

const getTagColor = (tag) => {
  const colors = ['#FFEEF2','#E8F5FF','#F0FFF0','#FFF8E8','#F5F0FF','#E8FFF8','#FFF0F5','#F0F8FF']
  const index = tag?.toString()?.charCodeAt(0) % colors.length || 0
  return colors[index]
}

function jump2brand(id) {
  uni.navigateTo({ url: '/pages/brand/brand?brand_id=' + id })
}

const fetchArtistInfo = async () => {
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/brand-artist/info?brand_id=${brandId.value}`,
      method: 'GET'
    })
    if (res.data.status === 'success') {
      artistInfo.value = res.data.data || {}
    } else {
      uni.showToast({ title: '获取创作者信息失败', icon: 'none' })
    }
  } catch {
    uni.showToast({ title: '网络错误', icon: 'none' })
  }
}

const fetchWorksList = async () => {
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/brand-artist/bjd-faceup?brand_id=${brandId.value}&page=${currentPage.value}&size=${pageSize.value}`,
      method: 'GET'
    })
    if (res.data.status === 'success') {
      const newList = res.data.data.list || []
      worksList.value = currentPage.value === 1 ? newList : [...worksList.value, ...newList]
      hasMore.value = worksList.value.length < (res.data.data.total || 0)
    } else {
      uni.showToast({ title: '获取作品列表失败', icon: 'none' })
    }
  } catch {
    uni.showToast({ title: '网络错误', icon: 'none' })
  }
}

const fetchOrderPlans = async () => {
  try {
    const artistType = activePlanTab.value === 'artist' ? 1 : 2
    const res = await uni.request({
      url: `${websiteUrl.value}/brand-artist/order-plans?brand_id=${brandId.value}&artist_type=${artistType}&page=${plansPage.value}&size=${plansPageSize.value}`,
      method: 'GET'
    })
    if (res.data.status === 'success') {
      const newPlans = res.data.data || []
      orderPlans.value = plansPage.value === 1 ? newPlans : [...orderPlans.value, ...newPlans]
      hasMorePlans.value = newPlans.length === plansPageSize.value
    } else {
      uni.showToast({ title: '获取开单记录失败', icon: 'none' })
    }
  } catch {
    uni.showToast({ title: '网络错误', icon: 'none' })
  }
}

/** 修复 1：复制逻辑统一读取已有字段，并向下兼容 */
const copyContactInfo = () => {
  // 优先使用当前 Tab 对应字段，其次回退到通用 contact
  const byTab = activePlanTab.value === 'artist'
    ? (artistInfo.value.contact_of_artist || '')
    : (artistInfo.value.contact_of_hairstylist || '')
  const contactInfo = byTab || artistInfo.value.contact || ''

  if (!contactInfo) {
    uni.showToast({ title: '暂无联系信息', icon: 'none' })
    return
  }
  uni.setClipboardData({
    data: contactInfo,
    success: () => uni.showToast({ title: '已复制联系信息', icon: 'success' })
  })
}

/** 修复 2：通用图片预览 */
const previewImages = (images = [], currentIndex = 0) => {
  if (!images?.length) return
  uni.previewImage({
    current: currentIndex,
    urls: images,
    indicator: 'number',
    loop: true
  })
}

const getOrderTypeText = (type) => {
  const types = { 1:'长期接单', 2:'限时手速', 3:'限时抽选', 4:'限时黑箱卡', 9:'关闭投递' }
  return types[type] || '未知类型'
}

const switchMode = (mode) => {
  activeMode.value = mode
  if (mode === 'plans') {
    plansPage.value = 1
    fetchOrderPlans()
  }
}
const switchPlanTab = (tab) => {
  activePlanTab.value = tab
  if (activeMode.value === 'works') {
    currentPage.value = 1
    fetchWorksList()
  } else {
    plansPage.value = 1
    fetchOrderPlans()
  }
}

const formatDate = (timestamp) => {
  if (!timestamp) return ''
  const d = new Date(timestamp)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  return `${y}-${m}-${day} ${h}:${mm}:${s}`
}

const navigateToGoods = (goodsId) => {
  uni.navigateTo({ url: `/pages/goods/goods?goods_id=${goodsId || 1576}` })
}
const navigateToFaceup = (id) => {
  uni.navigateTo({ url: `/pages/artwork/artwork?id=${id}` })
}

onLoad((options) => {
  uni.setNavigationBarTitle({ title: "妆师毛娘主页" })
  getUrlParams(options)
  fetchArtistInfo()
  fetchWorksList()
})
</script>

<style lang="less" scoped>
.artist-detail {
  background-color: #f8f8f8;
  min-height: 100vh;
  padding: 24rpx;
  padding-bottom: 120rpx;
}

.artist-header {
  display: flex;
  margin-bottom: 32rpx;
  padding: 24rpx;
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.avatar-container {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  overflow: hidden;
  border: 2rpx solid #f5f5f5;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
}
.avatar { width: 100%; height: 100%; border-radius: 50%; }

.info-container { flex: 1; margin-left: 24rpx; display: flex; flex-direction: column; justify-content: center; overflow: hidden; gap: 12rpx; }

.brand-name {
  font-size: 36rpx; font-weight: bold; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* 修复 3：描述可展开/收起 */
.description {
  font-size: 28rpx; color: #666; margin-bottom: 12rpx;
}
.description.clamp {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.status-container { display: flex; align-items: center; }
.status { font-size: 24rpx; color: #666; background-color: #f5f5f5; padding: 6rpx 16rpx; border-radius: 20rpx; }



/* 置顶作品滚动 */
.highlight-scroll { width: auto; white-space: nowrap; margin: 0 24rpx 32rpx; border-radius: 20rpx; overflow: hidden; }
.highlight-container { display: inline-flex; padding-right: 24rpx; }
.highlight-img {
  width: 240rpx; height: 240rpx; border-radius: 16rpx; margin-right: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.08); transition: transform .3s ease;
}
.highlight-img:active { transform: scale(0.98); }

/* 小节标题 */
.showcase-header { margin: 32rpx 24rpx 24rpx; position: relative; }
.showcase-title { font-size: 32rpx; font-weight: 600; color: #333; position: relative; padding-left: 16rpx; z-index: 1; }
.showcase-title::before {
  content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%);
  width: 6rpx; height: 28rpx; background-color: #171e22; border-radius: 3rpx;
}
.showcase-divider { position: absolute; left: 0; right: 0; bottom: 8rpx; height: 1rpx; z-index: 0; }


/* 作品列表 */
.works-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24rpx; padding: 0 8rpx; }
.work-item { background-color: #fff; border-radius: 16rpx; overflow: hidden; box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.06); transition: transform .3s, box-shadow .3s; }
.work-item:active { transform: translateY(4rpx); box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.08); }
.work-cover { width: calc(100% - 20rpx); height: 320rpx; border-radius: 16rpx; margin: 10rpx; box-sizing: border-box; }
.work-info { padding: 20rpx; }
.work-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12rpx; }
.work-head { font-size: 24rpx; color: #666; display: block; margin-bottom: 12rpx; padding-left: 8rpx; padding-right: 18rpx; }
.sex-tag { font-size: 20rpx; padding: 4rpx 12rpx; border-radius: 20rpx; font-weight: 500; }
.sex-tag.male { background-color: #E8F5FF; color: #1890FF; }
.sex-tag.female { background-color: #FFEEF2; color: #FF4D6A; }
.style-tags { display: flex; flex-wrap: wrap; margin: 12rpx 0; gap: 8rpx; }
.style-tag { font-size: 20rpx; padding: 4rpx 12rpx; border-radius: 20rpx; color: #666; font-weight: 400; }

.work-date { font-size: 22rpx; color: #999; display: block; margin-top: 8rpx; }
.load-more { text-align: center; padding: 40rpx 0; }
.no-more { text-align: center; padding: 40rpx 0; color: #999; font-size: 26rpx; }

/* 修复 6：空态独立容器，确保居中 */
.no-works {
  text-align: center; padding: 80rpx 0; display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.empty-icon { width: 200rpx; height: 200rpx; margin-bottom: 24rpx; opacity: 0.6; }
.empty-text { color: #999; font-size: 28rpx; }

/* 开单记录 */
.plans-list { padding: 0 24rpx; }
.plan-item { background-color: #fff; border-radius: 16rpx; padding: 24rpx; margin-bottom: 24rpx; box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.06); }
.plan-images { display: flex; overflow-x: auto; gap: 16rpx; margin-bottom: 20rpx; padding-bottom: 8rpx; }
.plan-image { width: 200rpx; height: 200rpx; border-radius: 12rpx; flex-shrink: 0; }
.plan-info { display: flex; flex-direction: column; gap: 12rpx; margin-bottom: 24rpx; }
.info-item { font-size: 26rpx; color: #666; }
.section-title { font-size: 28rpx; font-weight: bold; color: #333; margin-bottom: 16rpx; display: block; }
.tiers-section, .addons-section { margin-bottom: 24rpx; }
.tiers-container, .addons-container { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16rpx; }
.tier-item, .addon-item { background-color: #f9f9f9; border-radius: 12rpx; padding: 16rpx; }
.tier-title, .addon-title { font-size: 26rpx; font-weight: 500; color: #333; display: block; }
.tier-price, .addon-price { font-size: 28rpx; font-weight: bold; color: #ff4d6a; display: block; margin: 8rpx 0; }
.tier-desc, .addon-desc { font-size: 24rpx; color: #999; display: block; }
.plan-status { font-size: 24rpx; padding: 6rpx 16rpx; border-radius: 20rpx; font-weight: 500; display: inline-block; }
.plan-status.active { background-color: #E8F5FF; color: #1890FF; }
.plan-status.inactive { background-color: #f5f5f5; color: #999; }

/* 联系方式区域 */
/* 修复 4：按钮天蓝背景 + 白字 */
.contact-container { display: flex; align-items: center; margin-top: 16rpx; padding: 12rpx 0; font-size: 26rpx; color: #333; flex-wrap: wrap; }
.contact-info { flex: 1; padding-right: 16rpx; word-break: break-all; }
/* 新的天蓝按钮风格 */
.copy-tip {
  color: #fff;
  padding: 8rpx 20rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
     background: linear-gradient(135deg, #8fecff, #c1ddff);
  box-shadow: 0 4rpx 12rpx rgba(42, 140, 255, 0.25);
}
.copy-tip:active { opacity: .9; }

/* ===== 主导航 Tabs：圆角分段控件（填充型） ===== */
.main-tabs {
  display: flex;
  gap: 16rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 12rpx;
  margin: 16rpx 24rpx 24rpx;

  box-shadow: 0 6rpx 18rpx rgba(0, 0, 0, 0.05);
}

.main-tabs .tab-item {
  -webkit-tap-highlight-color: transparent;
  flex: 1;
  text-align: center;
  padding: 22rpx 0;
  font-size: 30rpx;
  color: #6b7280;           /* 未选中文本 */
  background: transparent;  /* 未选中无底 */
  border-radius: 14rpx;
  font-weight: 500;
  transition: all .2s ease;
}

.main-tabs .tab-item:active { transform: translateY(1rpx); }

.main-tabs .tab-item.active {
  color: #fff;
      background: linear-gradient(135deg, #8fecff, #c1ddff);
  box-shadow: 0 6rpx 16rpx rgba(42, 140, 255, 0.25);
}

/* 去掉任何底部边线/指示条（主导航用填充态即可） */
.main-tabs .tab-item::after { display: none !important; }

/* ===== 二级 Tabs：轻量下划线指示（文字为主） ===== */
.tabs {
  display: flex;
  padding: 0 24rpx;
  margin: 8rpx 0 22rpx;
  background: transparent;
  /* 如需吸顶，可保留或删除下面两行 */
  position: sticky;
  top: 0;
  z-index: 5;
}

.tabs .tab-item {
  -webkit-tap-highlight-color: transparent;
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #64748b;         /* 未选中文字 */
  font-weight: 500;
  position: relative;
}

/* 底部分隔基线（灰） */
.tabs .tab-item::after {
  content: '';
  position: absolute;
  left: 10%;
  right: 10%;
  bottom: 0;
  height: 4rpx;
  background: #eef2f5;
  border-radius: 2rpx;
}

/* 选中态：深色文字 + 蓝色短下划线 */
.tabs .tab-item.active {
  color: #111827;         /* 选中文字加深 */
  font-weight: 600;
}

.tabs .tab-item.active::after {
  left: 28%;
  right: 28%;
  height: 6rpx;
      background: linear-gradient(135deg, #8fecff, #c1ddff);
  box-shadow: 0 2rpx 8rpx rgba(42, 140, 255, 0.25);
}

/* 去除与主导航重复的“整体底边线”效果 */
.tabs { border-bottom: none; box-shadow: none; }

</style>
