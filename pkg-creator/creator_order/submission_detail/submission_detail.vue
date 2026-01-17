<template>
  <view class="page-container">
    <zhouwei-navbar 
      backState="2000" 
      fontColor="#000000" 
      bgColor="transparent" 
      :title="navTitle"
      :fixed="true"
    ></zhouwei-navbar>

    <view v-if="loading && !hasFirstLoaded" class="loading-mask">
      <view class="loading-spinner"></view>
    </view>

    <view v-else class="main-body">
      <view class="header-banner-box">
        <image 
          class="header-banner" 
          :src="planCoverImage" 
          mode="aspectFill"
        />
        <view class="banner-overlay"></view>
        
        <view class="banner-blur-left"></view>
        <view class="banner-blur-right"></view>
      </view>

      <view class="content-wrapper">
        
        <view class="section-artist">
          <image 
            class="artist-avatar" 
            :src="artistLogo || '/static/default-avatar.png'" 
            mode="aspectFill" 
            @click.stop="handleBrandClick"
          />
          
          <view class="artist-info-group">
            <view class="artist-texts" @click.stop="handlePlanClick">
              <text class="brand-name text-truncate font-alimamashuhei">{{ artistBrandName }} {{ planBasicText }}</text>
            </view>
            
            <view class="chat-btn-row" >
              <view class="chat-pill" @click="handleStartChat">
                <image src="/static/new-icon/chat.png" style="width: 50rpx;height: 50rpx;"></image>
                
                <view class="cyber-text-box">
                  <text class="cyber-text layer-1 font-alimamashuhei">发起会话</text>
                  <text class="cyber-text layer-2 font-alimamashuhei">发起会话</text>
                </view>

                <uni-icons type="arrow-right" size="12" color="#222" style="opacity: 0.8; margin-left: 4rpx;" />
              </view>
            </view>
          </view>
        </view>

        <view class="section-info-list">
          <view class="info-row-item">
            <text class="info-label font-alimamashuhei">投递编号</text>
            <text class="info-val font-title">#{{ submission.submission_id }}</text>
          </view>
          
          <view class="info-row-item">
            <text class="info-label font-alimamashuhei">订单状态</text>
            <view class="status-badge-sm">
              <text class="status-text font-alimamashuhei">{{ submission.status_text || '—' }}</text>
            </view>
          </view>

          <view class="info-row-item">
            <text class="info-label font-alimamashuhei">当前顺序</text>
            <text class="info-val font-title">{{ queuePositionText }}</text>
          </view>
        </view>

        <view class="tab-header-wrapper">
          <view class="custom-tab-bar">
            <view 
              class="tab-slider"
              :style="{
                width: `calc(${100 / tabList.length}% - 8rpx)`, 
                left: `calc(${currentTabIndex * (100 / tabList.length)}% + 4rpx)`
              }"
            ></view>
            
            <view 
              v-for="(tab, index) in tabList" 
              :key="index"
              class="tab-item"
              :class="{ 'active': currentTabIndex === index }"
              :style="{ width: `${100 / tabList.length}%` }"
              @click="switchTab(index)"
            >
              <text class="tab-text text-truncate font-alimamashuhei">{{ tab.label }}</text>
            </view>
          </view>
          
          <view class="tab-tip-text">
            <text class="font-title" v-if="remainingCount > 0">还可以创建 {{ remainingCount }} 个投递</text>
            <text class="font-title" v-else>数量已达上限</text>
          </view>
        </view>

        <view class="tab-content-wrapper">
          
          <view v-if="currentItem" class="content-item-view anim-fade-up" :key="currentTabIndex">
            <view class="item-detail-card" @click="goEditItem(currentItem)">
              <image 
                :src="getFirstRefImage(currentItem.ref_images)" 
                class="item-img" 
                mode="aspectFill"
              />
              
              <view class="item-info-col">
                <view class="info-section-title">
                  <text class="item-title text-truncate">{{ currentItem.work_subject || '未命名作品' }}</text>
                </view>
                
                <view class="info-section-tags">
                  <view class="item-tags-row">
                    <view class="spec-tag tag-primary font-alimamashuhei">
                        {{ currentItem.tier_title || '默认档' }}
                    </view>
                    
                    <block v-if="currentItem.size">
                        <view class="font-alimamashuhei divider-dash"> - </view>
                        <view class="spec-tag font-alimamashuhei">{{ currentItem.size }}</view>
                    </block>

                    <block v-if="getAddonsText(currentItem.addons_json)">
                        <view class="font-alimamashuhei divider-dash"> - </view>
                        <view class="spec-tag font-alimamashuhei text-truncate" style="max-width: 160rpx;">
                            {{ getAddonsText(currentItem.addons_json) }}
                        </view>
                    </block>
                  </view>
                </view>
                
                <view class="info-section-price">
                  <view class="item-price-row font-din">
                    <text class="currency">¥</text>
                    <text class="amount font-title">{{ Number(currentItem.price_total || 0) }}</text>
                  </view>
                </view>
              </view>
            </view>

            <view class="timeline-area">
              <view class="timeline-header">进度详情</view>
              <view class="timeline-placeholder-box">
                <view class="timeline-dot active"></view>
                <view class="timeline-line"></view>
                <view class="timeline-text-box">
                  <text class="t-title">正在制作...</text>
                  <text class="t-desc">当前阶段暂无更多信息</text>
                </view>
              </view>
              <view class="timeline-placeholder-box opacity-50">
                <view class="timeline-dot"></view>
                <view class="timeline-text-box">
                  <text class="t-title">等待确认...</text>
                </view>
              </view>
            </view>
          </view>

          <view v-else class="content-empty-view anim-fade-up" :key="'empty'">
              <view class="add-new-card" @click="goCreateItem">
                <view class="add-icon-circle">
                  <uni-icons type="plus-filled" size="24" color="#2B2B2B" />
                </view>
                <text class="add-text font-alimamashuhei">点击新建投递内容</text>
              </view>

              <view v-if="draftItems.length" class="draft-picker-area">
                <view class="draft-title font-title">或从草稿箱选择</view>
                <scroll-view scroll-x class="draft-scroll-view">
                  <view class="draft-list">
                    <view 
                      v-for="draft in draftItems" 
                      :key="draft.id" 
                      class="draft-item"
                      @click="useDraft(draft)"
                    >
                      <image :src="getFirstRefImage(draft.ref_images)" class="draft-thumb" mode="aspectFill" />
                      <view class="draft-mask">
                        <text class="draft-use-btn">使用</text>
                      </view>
                      <text class="draft-name text-truncate font-title">{{ draft.work_subject }}</text>
                    </view>
                  </view>
                </scroll-view>
              </view>
          </view>

        </view>

      </view>

      <view class="safe-area-bottom"></view>
    </view>

    <view class="fixed-bottom-bar" v-if="isLogin && submission.submission_id && bottomAction">
       <button class="action-btn" hover-class="btn-hover" @click="handleBottomAction">
         <view class="btn-content">
           <text class="btn-price font-din">¥ {{ Number(totalPrice) }}</text>
           <view class="btn-divider"></view>
           <text class="btn-label">{{ bottomActionText }}</text>
         </view>
       </button>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { onLoad, onShow, onHide, onUnload } from '@dcloudio/uni-app'
import { websiteUrl, global } from '@/common/config.js'

// ====== 常量 ======
const SubmissionStatusQueued = 0
const SubmissionStatusSelectedConfirm = 1
const SubmissionStatusSelectedPay = 3

// ====== 状态数据 ======
const submissionId = ref(0)
const loading = ref(false)
const hasFirstLoaded = ref(false)
const fetchSeq = ref(0)
// 修改点：移除 ref 包装，使用普通变量作为共享变量控制定时器
let pollingTimer = null 

const currentTabIndex = ref(0) // 控制 Tab

const submission = reactive({
  submission_id: 0,
  plan_id: 0,
  status: 0,
  status_text: '',
  ahead_count: 0,
  artist_type: 0, // 修改点：新增 artist_type
  items: []
})
const draftItems = ref([])
const plan = reactive({
  id: 0,
  artist_name: '',
  brand_admin_id: 0,
  max_submissions_per_user: 0,
  artist_info: null,
  brand: null,
  images: '',
  order_type: 0
})

// ====== Computed ======
const isLogin = computed(() => !!(uni.getStorageSync('token') || global.isLogin))
const navTitle = computed(() => '') 

const planCoverImage = computed(() => plan.images ? plan.images.split(',')[0] : '')

// 品牌信息
const artistLogo = computed(() => {
  if (plan.artist_info?.LogoImage) return plan.artist_info.LogoImage
  if (plan.brand?.logo_image) return plan.brand.logo_image
  return ''
})
const artistBrandName = computed(() => {
  if (plan.artist_info?.BrandName) return plan.artist_info.BrandName
  if (plan.brand?.brand_name) return plan.brand.brand_name
  return '未知作者'
})
const planBasicText = computed(() => {
  const types = { 1: '常驻', 2: '手速', 3: '抽选', 4: '黑箱' }
  const t = types[plan.order_type] || '活动'
  return `${t} · ${plan.artist_name}`
})

// 队列/状态显示
const queuePositionText = computed(() => {
  const count = (submission.ahead_count || 0) + 1
  return `No.${String(count).padStart(3, '0')}`
})

const statusColorClass = computed(() => {
  const s = submission.status
  if (s === SubmissionStatusQueued) return 'bg-blue'
  if (s === SubmissionStatusSelectedConfirm) return 'bg-orange'
  if (s === SubmissionStatusSelectedPay) return 'bg-red'
  return 'bg-green'
})

// === Tab 计算逻辑 ===
const tabList = computed(() => {
  const list = []
  const max = plan.max_submissions_per_user > 0 
    ? plan.max_submissions_per_user 
    : (submission.items.length + 1)
   
  for (let i = 0; i < max; i++) {
    if (i < submission.items.length) {
      list.push({
        label: submission.items[i].work_subject || `作品${i+1}`,
        type: 'item',
        index: i
      })
    } else {
      list.push({ label: '+', type: 'empty', index: i })
    }
  }
  return list
})

const currentItem = computed(() => {
  if (currentTabIndex.value < submission.items.length) {
    return submission.items[currentTabIndex.value]
  }
  return null
})

const remainingCount = computed(() => {
  const max = plan.max_submissions_per_user || 99
  const used = submission.items.length
  return Math.max(0, max - used)
})

const totalPrice = computed(() => {
  return submission.items.reduce((sum, item) => sum + Number(item.price_total || 0), 0)
})

// 底部按钮
const bottomAction = computed(() => {
  const txt = submission.status_text || ''
  if (txt.includes('待买家确认') || submission.status === SubmissionStatusSelectedConfirm) return 'confirm'
  if (txt.includes('待付款') || submission.status === SubmissionStatusSelectedPay) return 'pay'
  return ''
})
const bottomActionText = computed(() => {
  if (bottomAction.value === 'confirm') return '确认订单'
  if (bottomAction.value === 'pay') return '去付款'
  return ''
})

// ====== Methods ======
function switchTab(index) {
  currentTabIndex.value = index
}

function getFirstRefImage(str) {
  if (!str) return ''
  return str.split(',')[0]
}

// 解析加购项
function getAddonsText(jsonStr) {
  if (!jsonStr) return ''
  try {
    const list = JSON.parse(jsonStr)
    if (Array.isArray(list) && list.length > 0) {
      // 提取 title 并用 & 连接
      return list.map(item => item.title).filter(t => t).join(' & ')
    }
  } catch(e) {
    console.error('Addons parse error:', e)
  }
  return ''
}

// 修改点：跳转到 Plan 详情
function handlePlanClick() {
  if (submission.plan_id) {
    uni.navigateTo({
      url: `/pkg-creator/creator_order/plan_detail/plan_detail?id=${submission.plan_id}`
    })
  }
}

// 修改点：跳转到店铺主页 (根据 artist_type)
function handleBrandClick() {
  // 尝试从 items[0] 中获取 brand_id，或者从 plan 信息中获取
  const brandId = submission.items.length > 0 ? submission.items[0].brand_id : (plan.brand?.id || 0)
   
  if (!brandId) return

  if (submission.artist_type === 1) {
    // 妆师
    uni.navigateTo({
      url: `/pkg-creator/creator_base/bjd_faceup_artist/bjd_faceup_artist?brand_id=${brandId}`
    })
  } else if (submission.artist_type === 2) {
    // 毛娘
    uni.navigateTo({
      url: `/pkg-creator/creator_base/hair_artist/hair_artist?brand_id=${brandId}`
    })
  }
}


// 数据请求
async function fetchDetail() {
  const sid = submissionId.value
  if (!sid) return

  // --- 新增：全局防重复刷新检查 (5秒CD) ---
  const currentUrlKey = `submission/queue-info?submission_id=${sid}`
  const now = Date.now()
  
  // 检查是否在全局变量中记录过，且时间间隔小于 5000ms
  if (global.lastRefresh && 
      global.lastRefresh.url === currentUrlKey && 
      (now - global.lastRefresh.time < 3000)) {
    console.log('[Throttle] Skip fetchDetail due to global timer constraint.')
    return // ⚠️ 直接返回，不执行后续请求
  }

  // 更新全局记录
  if (!global.lastRefresh) global.lastRefresh = {}
  global.lastRefresh.url = currentUrlKey
  global.lastRefresh.time = now
  // -------------------------------------
   
  const seq = ++fetchSeq.value
  if (!hasFirstLoaded.value) loading.value = true
   
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/submission/queue-info`,
      header: { Authorization: uni.getStorageSync('token') },
      data: { submission_id: sid }
    })
    
    if (seq !== fetchSeq.value) return 

    const body = res.data
    if (body.status === 'success') {
      const d = body.data
      Object.assign(submission, {
        submission_id: d.submission_id,
        plan_id: d.plan_id,
        status: d.status,
        status_text: d.status_text,
        ahead_count: d.ahead_count,
        artist_type: d.artist_type, // 修改点：赋值 artist_type
        items: d.items || []
      })
      draftItems.value = d.draft_items || []
      
      if (d.plan_id && (!plan.id || plan.id !== d.plan_id)) {
        fetchPlanInfo(d.plan_id)
      }
    }
    hasFirstLoaded.value = true
  } catch(e) {
  } finally {
    loading.value = false
  }
}

async function fetchPlanInfo(pid) {
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/brand-artist/order-plan-info`,
      data: { id: pid }
    })
    if (res.data.status === 'success') {
      const d = res.data.data
      Object.assign(plan, {
        id: d.id,
        artist_name: d.artist_name,
        brand_admin_id: d.brand_admin_id,
        max_submissions_per_user: d.max_submissions_per_user,
        artist_info: d.artist_info,
        brand: d.brand,
        images: d.images,
        order_type: d.order_type
      })
    }
  } catch(e) {}
}

function handleStartChat() {
  if (plan.brand_admin_id) {
    const url = `/pkg-im/chat/chat?peer_id=${plan.brand_admin_id}`
    // #ifdef H5
    window.location.hash = url
    // #endif
    // #ifndef H5
    uni.navigateTo({ url })
    // #endif
  }
}

function goCreateItem() {
  const url = `/pkg-creator/creator_order/submission_item_form/submission_item_form?submission_id=${submission.submission_id}&plan_id=${submission.plan_id}`
  uni.navigateTo({ url })
}
function goEditItem(item) {
  const url = `/pkg-creator/creator_order/submission_item_form/submission_item_form?submission_item_id=${item.id}`
  uni.navigateTo({ url })
}

async function useDraft(draft) {
  uni.showLoading({ title: '绑定中' })
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/item/attach`,
      method: 'POST',
      header: { Authorization: uni.getStorageSync('token') },
      data: { submission_id: submission.submission_id, item_ids: [draft.id] }
    })
    
    // 修改点：增加对业务状态码的判断
    if (res.data && res.data.status === 'success') {
      uni.showToast({ title: '成功' })
      fetchDetail()
    } else {
      // 失败时显示后端返回的 msg
      uni.showToast({ 
        title: res.data?.msg || '绑定失败', 
        icon: 'none',
        duration: 2500
      })
    }
  } catch(e) {
    uni.showToast({ title: '请求失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

async function handleBottomAction() {
  const urlMap = {
    'confirm': `${websiteUrl.value}/with-state/artist-order/submission/confirm-content`,
    'pay': `${websiteUrl.value}/with-state/artist-order/pay`
  }
  if (!urlMap[bottomAction.value]) return
   
  uni.showLoading({ title: '请求中' })
  try {
    const res = await uni.request({
      url: urlMap[bottomAction.value],
      method: 'POST',
      header: { Authorization: uni.getStorageSync('token') },
      data: { submission_id: submission.submission_id }
    })
    if (res.data.status === 'success') {
      uni.showToast({ title: '成功', icon: 'success' })
      fetchDetail()
    } else {
      uni.showToast({ title: res.data.msg || '失败', icon: 'none' })
    }
  } finally {
    uni.hideLoading()
  }
}

// 修改点：优化轮询逻辑
function startPolling() {
  // 1. 无论定时器是否在跑，进入页面时先刷新一次数据，保证实时性
  // 注意：fetchDetail 内部现在有全局防抖，如果刚跳进来不久，这次可能也会被防抖掉，这是符合预期的
  fetchDetail()
   
  // 2. 如果定时器已存在，直接返回，避免创建多个定时器
  if (pollingTimer) return
   
  // 3. 启动新的定时器
  pollingTimer = setInterval(fetchDetail, 5000)
}

function stopPolling() {
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
  }
}

onLoad((opt) => {
  submissionId.value = Number(opt.submission_id || 0)
})
onShow(() => {
  if (isLogin.value && submissionId.value) {
    startPolling()
  }
})
onHide(stopPolling)
onUnload(stopPolling)
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@500;700&display=swap');

/* --- 动画定义 --- */
@keyframes fadeSlideUp {
  0% {
    opacity: 0;
    transform: translateY(20rpx);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.anim-fade-up {
  animation: fadeSlideUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

.font-din {
  font-family: 'Roboto', 'Helvetica Neue', Helvetica, sans-serif;
  font-weight: 700;
  letter-spacing: 0.5px;
}
.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mt-20 { margin-top: 20rpx; }

$color-bg-grey: #f8f8f8;
$color-dark: #2B2B2B;
// 修改点：颜色改为 #8afdff
$color-accent: #c8feff; 
$spacing-page: 30rpx;

.page-container {
  min-height: 100vh;
  background-color: #fff;
}

/* ====== Header Banner (含模糊效果) ====== */
.header-banner-box {
  width: 100%;
  height: 520rpx;
  position: relative;
  border-bottom: none;
  box-sizing: border-box;
  overflow: hidden; // 确保模糊不溢出
}
.header-banner {
  width: 100%;
  height: 100%;
  display: block; 
  border: none;
}
/* 底部阴影渐变 */
.banner-overlay {
  position: absolute;
  top: 0; 
  left: 0; 
  right: 0; 
  bottom: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 60%);
  pointer-events: none;
  z-index: 1;
}

/* 左右两侧模糊效果 */
/* 使用 backdrop-filter 产生毛玻璃，配合 mask-image 实现渐变消失 */
// 修改点：宽度改为 120rpx
.banner-blur-left, .banner-blur-right {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 120rpx; 
  z-index: 2;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  pointer-events: none;
}
.banner-blur-left {
  left: 0;
  /* 从左侧完全可见渐变到右侧不可见 */
  -webkit-mask-image: linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%);
  mask-image: linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%);
}
.banner-blur-right {
  right: 0;
  /* 从右侧完全可见渐变到左侧不可见 */
  -webkit-mask-image: linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%);
  mask-image: linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%);
}

/* ====== 内容区域 ====== */
.content-wrapper {
  position: relative;
  margin-top: 20rpx; 
  padding: 0 $spacing-page;
  z-index: 10;
}

/* ====== 作者栏 ====== */
.section-artist {
  display: flex;
  align-items: center; 
  margin-bottom: 50rpx; /* 增大留白 */
  gap: 24rpx;
}

.artist-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 16rpx;
  background: #f0f0f0;
  flex-shrink: 0;
}

.artist-info-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}

.artist-texts {
  display: flex;
  flex-direction: column;
  margin-bottom: 12rpx;
}
.brand-name {
  font-size: 25rpx;
  font-weight: bold;
  color: #464646; 
  margin-bottom: 4rpx;
}
.plan-name {
  font-size: 24rpx;
  color: #999;
}

.chat-btn-row {
  display: flex;
}
.chat-pill {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

/* 修改点：赛博朋克文字容器 */
.cyber-text-box {
  position: relative;
  display: inline-block;
  /* 增加：行高防止高度异常 */
  line-height: 1;
  width: 100rpx;
  height: 22rpx;
}
.cyber-text {
  font-size: 24rpx;
  font-weight: bold;
  /* 增加：强制不换行 */
  white-space: nowrap;
}
.layer-1 {
  color: #ff0050; /* 红色底层 */
  z-index: 1;
  position: absolute;
  top: 0;
  left: 1rpx; /* 偏移 */
}
.layer-2 {
  color: #00f0ff; /* 蓝色顶层 */
  position: absolute;
  top: 0;
  left: -2rpx; /* 偏移 */
  z-index: 2;
  mix-blend-mode: multiply; /* 正片叠底，实现交错变色 */
  opacity: 0.8;
}

/* ====== 信息栏 (垂直列表布局) ====== */
.section-info-list {
  margin-top: 70rpx; /* 增大留白 */
  display: flex;
  flex-direction: column;
  gap: 54rpx; /* 增大行间距 */
}

.info-row-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 22rpx;
  color: #737373;
}

.info-val {
  font-size: 22rpx; /* 缩小字号 (24->22) */
  color: #464646;
  font-weight: bold;
}

/* 状态小标签 */
.status-badge-sm {
  display: flex;
  align-items: center;
  background: $color-accent;
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
  text {
    font-size: 22rpx; /* 这里也可以跟随缩小一点 */
    color: #262626;
  }
}
.status-text {
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
}

/* ====== Tab Bar (圆角30) ====== */
.tab-header-wrapper {
  margin-top: 70rpx; /* 增大留白 */
  display:flex;
  justify-content: space-between;
}
.custom-tab-bar {
  width: 300rpx;
  position: relative;
  height: 60rpx; 
  background-color: $color-dark;
  border-radius: 40rpx; 
  padding: 4rpx;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}
.tab-slider {
  position: absolute;
  top: 4rpx;
  bottom: 4rpx;
  background-color: $color-accent;
  border-radius: 28rpx; 
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  z-index: 1;
}
.tab-item {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s;
  cursor: pointer;
  text {
    color: #fff; /* 未选中时白色 */
  }
}
.tab-item.active {
  font-weight: 600;
  text {
    color: $color-dark; /* 选中时深色 */
  }
   
}
.tab-text {
  font-size: 24rpx;
  padding: 0 10rpx;
}

.tab-tip-text {
  text-align: right;
  font-size: 22rpx;
  color: #999;
  margin-top: 12rpx;
}

/* ====== Tab 内容 ====== */
.tab-content-wrapper {
  margin-top: 50rpx; /* 增大留白 */
  min-height: 400rpx;
}
.item-detail-card {
  display: flex;
  gap: 24rpx;
  background: #fff;
  border-radius: 24rpx;
  /* 去除原来的 padding 或保持简洁，这里使用 flex gap 控制间距 */
}
.item-img {
  width: 180rpx;
  height: 180rpx;
  border-radius: 24rpx; 
  background: #f7f7f7;
  flex-shrink: 0;
}

/* 修改：垂直布局 Flex */
.item-info-col {
  flex: 1;
  height: 180rpx; /* 强制与图片等高 */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* 1:1:2 比例划分 */
.info-section-title {
  flex: 1; /* 1 */
  display: flex;
  align-items: flex-start; /* 顶部对齐 */
}
.info-section-tags {
  flex: 1; /* 1 */
  display: flex;
  align-items: center; /* 居中 */
}
.info-section-price {
  flex: 2; /* 2 - 占比最大 */
  display: flex;
  align-items: flex-end; /* 底部对齐 */
  justify-content: space-between; /* 价格在左，箭头在右 */
}

.item-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  max-width: 360rpx;
  /* 限制行数 */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}

.item-tags-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.spec-tag {
  font-size: 22rpx;
  color: #666;
  padding: 2rpx 0;
}
/* 修改点：第一个Tag的样式 */
.spec-tag.tag-primary {
  background-color: $color-accent;
  color: #262626;
  padding: 6rpx 16rpx; /* 合理的 Padding */
  border-radius: 8rpx;
}

.divider-dash {
  color: #ccc;
  font-size: 20rpx;
}

.item-price-row {
  color: #464646;
  font-weight: bold;
  .currency { font-size: 24rpx; margin-right: 4rpx; margin-bottom: 4rpx;}
  .amount { font-size: 40rpx; line-height: 1; }
}

/* 进度 */
.timeline-area {
  margin-top: 60rpx; /* 增大留白 */
  padding-left: 10rpx;
}
.timeline-header {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 30rpx; /* 增大留白 */
  color: #333;
}
.timeline-placeholder-box {
  position: relative;
  padding-left: 40rpx;
  padding-bottom: 50rpx; /* 增大留白 */
}
.timeline-dot {
  position: absolute;
  left: 0;
  top: 10rpx;
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  background: #ddd;
  z-index: 2;
  &.active {
    background: $color-accent;
    box-shadow: 0 0 0 6rpx rgba(138, 253, 255, 0.4);
  }
}
.timeline-line {
  position: absolute;
  left: 9rpx;
  top: 30rpx;
  bottom: 0;
  width: 2rpx;
  background: #eee;
  z-index: 1;
}
.timeline-text-box {
  display: flex;
  flex-direction: column;
}
.t-title {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}
.t-desc {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}
.opacity-50 {
  opacity: 0.5;
}

/* 新增 & 草稿 */
.add-new-card {
  height: 240rpx;
  border: 2rpx dashed #d1d5db;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 40rpx;
}
// 修改点：缩小圆圈到 64rpx
.add-icon-circle {
  width: 44rpx;
  height: 44rpx;
  background: $color-accent;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
}
.add-text {
  font-size: 26rpx;
  color: #666;
}
.draft-picker-area .draft-title {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 20rpx;
}
.draft-scroll-view {
  white-space: nowrap;
  width: 100%;
}
.draft-list {
  display: flex;
  gap: 20rpx;
  padding-bottom: 20rpx;
}
.draft-item {
  width: 200rpx;
  height: 260rpx;
  position: relative;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.08);
  display: inline-block;
}
.draft-thumb {
  width: 100%;
  height: 100%;
  background: #eee;
}
.draft-mask {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}
.draft-item:active .draft-mask { opacity: 1; }
.draft-use-btn {
  color: #fff;
  border: 2rpx solid #fff;
  padding: 4rpx 16rpx;
  border-radius: 99rpx;
  font-size: 24rpx;
}
.draft-name {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  background: #fff;
  padding: 10rpx;
  font-size: 22rpx;
  text-align: center;
  color: #333;
}

.safe-area-bottom {
  height: 200rpx;
}
.fixed-bottom-bar {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  background: #fff;
  padding: 20rpx 30rpx calc(20rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 16rpx rgba(0,0,0,0.05);
  z-index: 100;
}
.action-btn {
  background: $color-dark;
  color: #fff;
  border-radius: 99rpx;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
   
}
.btn-content {
  display: flex;
  align-items: center;
}
.btn-price {
  font-size: 32rpx;
}
.btn-divider {
  width: 2rpx;
  height: 24rpx;
  background: rgba(255,255,255,0.4);
  margin: 0 20rpx;
}
.btn-label {
  font-size: 30rpx;
  font-weight: 500;
}
.loading-mask {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  background: #fff; z-index: 999;
}
</style>