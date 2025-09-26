<template>
  <view class="summary-wrap" :style="{ '--safe-top': safeTop + 'px' }">
    <view-logs />

    <!-- 顶部：#FCE259 → 淡灰 渐变头部 + 下划线Tab -->
    <view class="header-gradient">
      <!-- ✅ 占位：安全距离(状态栏) + 导航条高度 -->
      <view class="nav-placeholder" :style="{ height: headerPadPx }" />

      <view class="tabs-underline">
        <view class="tab" :class="{active: activeTab==='sale'}" @click="switchTab('sale')">
          <text>贩售</text>
          <view class="underline" v-if="activeTab==='sale'"></view>
        </view>
        <view class="tab" :class="{active: activeTab==='makeup'}" @click="switchTab('makeup')">
          <text>约妆</text>
          <view class="underline" v-if="activeTab==='makeup'"></view>
        </view>
      </view>
    </view>

    <!-- 分类筛选（仅贩售） -->
    <view class="category-container" v-if="activeTab === 'sale'">
      <scroll-view scroll-x class="category-scroll" :show-scrollbar="false">
        <view
          class="category-item"
          v-for="(item, index) in tabList"
          :key="index"
          :class="{ active: activeType === item }"
          @click="handleTabClick(item)"
        >{{ item }}</view>
      </scroll-view>
    </view>

    <!-- 尺寸筛选（仅贩售） -->
    <view class="size-container" v-if="activeTab === 'sale'">
      <scroll-view scroll-x class="size-scroll" :show-scrollbar="false">
        <view
          class="size-item"
          v-for="(item, index) in sizeList"
          :key="index"
          :class="{ active: activeSize === item }"
          @click="handleSizeClick(item)"
        >{{ item }}</view>
      </scroll-view>
    </view>

    <view v-if="activeTab === 'makeup'" style="height: 50rpx; background:#f5f6f8;"></view>

    <!-- 日期选择 -->
    <view class="date-picker-container">
      <scroll-view class="date-scroll" scroll-x :scroll-left="scrollLeft" :show-scrollbar="false">
        <view
          v-for="(item, date) in currentCalendar"
          :key="date"
          class="date-item"
          @click="selectDate(date)"
        >
          <view class="date-badge" v-if="activeTab === 'sale' && item.goods_number > 0">{{ item.goods_number }}</view>
          <view class="date-badge" v-else-if="activeTab === 'makeup' && item.plans_number > 0">{{ item.plans_number }}</view>

          <view class="weekday" :class="{'weekend': item.weekday==='周日'||item.weekday==='周六'}">{{ item.weekday }}</view>
          <view class="day-number" :class="{'selected': chooseDate === date}">
            {{ isToday(date) ? '今天' : item.day_number }}
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 内容 -->
    <view class="goods-container">
      <!-- 贩售 -->
      <template v-if="activeTab === 'sale'">
        <view class="date-title">
          <text class="highlight">{{chooseDate}} 日</text>
          <text> 星期{{chooseItem.weekday}}上新</text>
        </view>

        <view v-if="chooseItem.goods == null" class="empty-tip">
          <image src="/static/empty-box.png" class="empty-icon"></image>
          <text>这天没有上新呢...</text>
        </view>

        <view v-else>
          <view
            v-for="good in chooseItem.goods"
            :key="good.id"
            class="goods-card"
            @click="jumpGoods(good.id, good.goods_id)"
          >
            <view class="goods-image-container">
              <image :src="good.goods_image" mode="aspectFill" class="goods-image"></image>
              <view class="goods-tags">
                <text class="tag sale-type">{{good.type}} · {{good.sale_type}}</text>
                <text class="tag first-day" v-if="good.is_first_sale_day == 1">首日</text>
              </view>
            </view>

            <view class="goods-info">
              <view>
                <text class="brand-name">{{good.brand_name}}</text>
                <text class="goods-name">{{good.goods_name}}</text>
              </view>

              <view class="goods-details">
                <view v-if="good.sizes && good.sizes.length">
                  <view v-for="(g, i) in getSizeGroups(good.sizes)" :key="i" class="size-group">
                    <text class="size-category">{{ g.category }}：</text>
                    <text class="size-details">{{ g.details.join('、') }}</text>
                  </view>
                </view>
                <text v-else>{{good.size}} · {{good.size_detail}}</text>
              </view>

              <view class="time-info">
                <text>开定 {{ formatTimestamp(good.sub_time) }}</text>
                <text v-if="good.sub_time_end">截止 {{ formatTimestamp(good.sub_time_end)}}</text>
              </view>

              <view class="price-info">
                <view v-if="good.sale_type != '限量现货' && good.sale_type != '不限量现货'">
                  <view class="price-group">
                    <text class="price-label">定金</text>
                    <text class="deposit-price">{{good.sub_amount}}</text>
                    <text class="currency">({{good.currency}})</text>
                  </view>
                  <view class="price-group">
                    <text class="price-label">尾款</text>
                    <text class="final-price">{{good.fin_amount}}</text>
                  </view>
                </view>
                <view v-else>
                  <view class="price-group">
                    <text class="price-label">全款</text>
                    <text class="full-price">{{good.sub_amount + good.fin_amount}}</text>
                    <text class="currency">({{good.currency}})</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </template>

      <!-- 约妆 -->
      <template v-else>
        <view class="date-title">
          <text class="highlight">{{chooseDate}} 日</text>
          <text> 星期{{chooseItem.weekday}}约妆</text>
        </view>

        <view v-if="chooseItem.plans == null || chooseItem.plans.length === 0" class="empty-tip">
          <image src="/static/empty-box.png" class="empty-icon"></image>
          <text>这天没有开妆计划呢...</text>
        </view>

        <view v-else>
          <view class="plan-card" v-for="plan in chooseItem.plans" :key="plan.id" @tap="navigateToArtistDetail(plan.artist_info)">
            <view class="artist-header">
              <view class="artist-info">
                <image v-if="plan.artist_info && plan.artist_info.LogoImage" :src="plan.artist_info.LogoImage" mode="aspectFill" class="artist-avatar"/>
                <view class="artist-details">
                  <text class="artist-name">{{plan.artist_name}}</text>
                  <view class="makeup-price-range"><text>妆费: {{ getPriceRange(plan) }}</text></view>
                </view>
              </view>
            </view>

            <view class="artist-description" v-if="plan.artist_info && plan.artist_info.Description">
              {{plan.artist_info.Description}}
            </view>

            <view class="highlight-images" v-if="plan.artist_info && plan.artist_info.artist_highlight_images">
              <scroll-view scroll-x class="image-scroll">
                <image
                  v-for="(img, i) in getHighlightImages(plan.artist_info.artist_highlight_images)"
                  :key="i" :src="img" mode="aspectFill" class="highlight-image" @click="previewImage(img)"/>
              </scroll-view>
            </view>

            <view class="foldable-section" :class="{ expanded: expandStates[plan.id] }">
              <view class="plan-info">
                <view class="info-row"><text class="label">开放时间:</text><text class="value">{{formatTimestamp(plan.open_time)}} - {{formatTimestamp(plan.close_time)}}</text></view>
                <view class="info-row"><text class="label">接单类型:</text><text class="value">{{getOrderTypeText(plan.order_type)}}</text></view>
                <view class="info-row"><text class="label">最大人数:</text><text class="value">{{plan.max_participants === 0 ? '不限量' : plan.max_participants}}</text></view>
                <view class="info-row"><text class="label">每人限投:</text><text class="value">{{plan.max_submissions_per_user}}次</text></view>
              </view>

              <view class="plan-config">
                <view class="config-section">
                  <text class="section-title">档位选择</text>
                  <view v-for="tier in getTiers(plan)" :key="tier.title" class="tier-item">
                    <text class="tier-title">{{tier.title}}</text>
                    <text class="tier-price">{{tier.price}}元</text>
                    <text class="tier-desc">{{tier.description}}</text>
                  </view>
                </view>

                <view class="config-section" v-if="getAddons(plan).length">
                  <text class="section-title">加购服务</text>
                  <view v-for="addon in getAddons(plan)" :key="addon.title" class="addon-item">
                    <text class="addon-title">{{addon.title}}</text>
                    <text class="addon-price">{{addon.price}}元</text>
                    <text class="addon-desc">{{addon.description}}</text>
                  </view>
                </view>
              </view>
            </view>

            <view class="fold-toggle" @click.stop="toggleFold(plan.id)">
              <text>{{ expandStates[plan.id] ? '收起' : '展开' }}</text>
              <uni-icons :type="expandStates[plan.id] ? 'arrowup' : 'arrowdown'" size="16" color="#81D8cf"></uni-icons>
            </view>
          </view>
        </view>
      </template>
    </view>

    <loading-toast :show="loading" />
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { onLoad, onPullDownRefresh, onPageScroll } from '@dcloudio/uni-app'
import { websiteUrl, getStatusBarHeight, getNavBarHeight, toPx } from '@/common/config.js'

/* 顶部透明导航需要的滚动值 & 返回（如需返回按钮可继续复用） */
const scrollTop = ref(0)
const safeTop = ref(0)
onPageScroll(e => { scrollTop.value = e.scrollTop || 0 })
const goBack = () => {
  try {
    const pages = getCurrentPages && getCurrentPages()
    if (pages && pages.length > 1) uni.navigateBack({ delta: 1 })
    else (uni.switchTab?.({ url: '/pages/index/index' }) || uni.reLaunch({ url: '/pages/index/index' }))
  } catch { uni.navigateBack({ delta: 1 }) }
}
/** 顶部占位高度 = 状态栏安全距离 + 导航条高度 */
const headerPadPx = computed(() => toPx(getStatusBarHeight() + getNavBarHeight()))

/* Tab */
const activeTab = ref('sale')
const switchTab = (t) => {
  if (activeTab.value === t) return
  activeTab.value = t
  chooseDate.value = todayFormat.value
  if (t === 'makeup' && Object.keys(makeupCalendar.value).length === 0) {
    fetchMakeupCalendar()
  } else {
    updateSelectedItem()
  }
}

/* 贩售筛选 */
const tabList = ref(['全部','整体','单头','单体','娃衣','眼珠','娃鞋','手型','脚型','袜子','配饰'])
const sizeList = ref(['全部尺寸','四分','六分','三分','其它大尺寸','八分','十二分','一分','二分','五分','棉花娃','眼珠'])
let activeType = ref('全部')
let activeSize = ref('全部尺寸')
const saleCalendar = ref({})

/* 约妆 */
const makeupCalendar = ref({})
const expandStates = ref({})
const toggleFold = (id)=>{ expandStates.value[id] = !expandStates.value[id] }
const getHighlightImages = (s)=> (!s ? [] : s.split(',').filter(i=>i.trim()))
const previewImage = (url)=> uni.previewImage({ urls:[url], current:url })

/* 公共 */
const today = new Date()
const year = today.getFullYear()
const month = String(today.getMonth()+1).padStart(2,'0')
const day = String(today.getDate()).padStart(2,'0')
const todayFormat = ref(`${year}-${month}-${day}`)
const screenWidth = uni.getSystemInfoSync().screenWidth
const itemWidth = screenWidth / 7
let scrollLeft = ref(0)

let chooseDate = ref(todayFormat.value)
let chooseItem = ref({})
let loading = ref(true)

/* 计算：按筛选实时产出当月数据 */
const filteredSaleCalendar = computed(()=>{
  const out = {}
  Object.entries(saleCalendar.value).forEach(([date, info])=>{
    const c = { ...info }
    if (c.goods){
      c.goods = c.goods.filter(g=>{
        const typeOk = activeType.value==='全部' || g.type===activeType.value
        let sizeOk = (activeSize.value==='全部尺寸')
        if (!sizeOk && g.sizes && g.sizes.length) sizeOk = g.sizes.some(s=>s.goods_size===activeSize.value)
        else if (!sizeOk) sizeOk = g.size===activeSize.value
        return typeOk && sizeOk
      })
      c.goods_number = c.goods.length
      if (!c.goods.length) c.goods = null
    }
    out[date] = c
  })
  return out
})
const currentCalendar = computed(()=> activeTab.value==='sale' ? filteredSaleCalendar.value : makeupCalendar.value)

/* ✅ 修复点 #1：selectDate 仅收 date，用最新日历计算 */
const selectDate = (d) => {
  chooseDate.value = d
  updateSelectedItem()
}

/* ✅ 修复点 #2：监听筛选条件与日历变化，保持 chooseItem 同步 */
watch([activeType, activeSize], () => {
  if (activeTab.value === 'sale') updateSelectedItem()
})
watch(() => filteredSaleCalendar.value, () => {
  if (activeTab.value === 'sale') updateSelectedItem()
})
watch(() => makeupCalendar.value, () => {
  if (activeTab.value === 'makeup') updateSelectedItem()
})

/* 请求 */
const fetchSaleCalendar = ()=>{
  loading.value = true
  uni.request({
    url: websiteUrl.value + '/goods-news',
    method: 'GET',
    timeout: 5000,
    success: (res)=>{
      saleCalendar.value = res.data.data
      chooseItem.value = saleCalendar.value[todayFormat.value] || { goods:null }
    },
    fail: ()=> uni.showToast({ title:'网络请求失败', icon:'none' }),
    complete: ()=>{ scrollLeft.value = itemWidth * 7 - 5; loading.value = false; updateSelectedItem() }
  })
}
const fetchMakeupCalendar = ()=>{
  loading.value = true
  uni.request({
    url: websiteUrl.value + '/bjd-makeup-news',
    method: 'GET',
    timeout: 5000,
    success: (res)=>{
      makeupCalendar.value = res.data.data
      chooseItem.value = makeupCalendar.value[todayFormat.value] || { plans:null }
    },
    fail: ()=> uni.showToast({ title:'网络请求失败', icon:'none' }),
    complete: ()=>{ loading.value = false; updateSelectedItem() }
  })
}

/* 工具 */
const handleTabClick = t => { activeType.value = t }
const handleSizeClick = s => { activeSize.value = s }
const isToday = d => d === todayFormat.value
function updateSelectedItem(){
  const cal = currentCalendar.value
  if (cal[chooseDate.value]){ chooseItem.value = cal[chooseDate.value]; return }
  const first = Object.entries(cal).find(([_,v])=>(activeTab.value==='sale'&&v.goods)||(activeTab.value==='makeup'&&v.plans))
  if (first){ chooseDate.value = first[0]; chooseItem.value = first[1] }
  else { chooseItem.value = activeTab.value==='sale' ? {goods:null} : {plans:null} }
}
function formatTimestamp(ts){
  const d = new Date(ts*1000)
  const M = String(d.getMonth()+1).padStart(2,'0')
  const D = String(d.getDate()).padStart(2,'0')
  const h = String(d.getHours()).padStart(2,'0')
  const m = String(d.getMinutes()).padStart(2,'0')
  return `${M}/${D} ${h}:${m}`
}
function getTiers(plan){ try{ return JSON.parse(plan.order_config).tiers || [] }catch{ return [] } }
function getAddons(plan){ try{ return JSON.parse(plan.order_config).addons || [] }catch{ return [] } }
function getOrderTypeText(status) {
  const map = {
    0: '未知',          // StatusUnknown
    1: '长期接单',      // StatusLongTerm
    2: '限时手速投递',  // StatusSpeedDelivery
    3: '限时抽选投递',  // StatusLotteryDelivery
    4: '限时黑箱卡投递',// StatusBlackCard
    9: '关闭投递',      // StatusClosed
  }
  return map[Number(status)] ?? '未知'
}

function getSizeGroups(sizes){
  if (!sizes || !sizes.length) return []
  const g = {}
  sizes.forEach(it=>{ const k = it.goods_size; if(!g[k]) g[k]=[]; if(it.size_detail) g[k].push(it.size_detail) })
  return Object.keys(g).map(k=>({category:k, details:g[k]}))
}
function getPriceRange(plan){
  const tiers = getTiers(plan) || []
  const ps = tiers.map(t=>parseFloat(t.price)).filter(n=>!isNaN(n))
  if (!ps.length) return '待定'
  const min = Math.min(...ps), max = Math.max(...ps)
  return min===max ? `${min}元` : `${min}-${max}元`
}
function jumpGoods(id, goodsId){
  uni.request({ url: websiteUrl.value + '/sale-record-click?id=' + id, method:'POST', header:{'Content-Type':'application/json'} })
  uni.navigateTo({ url: '/pages/goods/goods?goods_id=' + goodsId })
}
const navigateToArtistDetail = (artist)=> uni.navigateTo({ url: '/pages/artist_info/artist_info?brand_id=' + artist.brand_id })

/* 生命周期 */
onLoad(()=>{
  try{
    const wi = uni.getWindowInfo && uni.getWindowInfo()
    safeTop.value = wi?.safeAreaInsets?.top ?? wi?.statusBarHeight ?? 0
  }catch{ safeTop.value = 20 }
  fetchSaleCalendar()
})
onPullDownRefresh(async ()=>{
  try{
    activeTab.value==='sale' ? fetchSaleCalendar() : fetchMakeupCalendar()
    uni.stopPullDownRefresh()
  } catch(e){
    uni.stopPullDownRefresh()
    uni.showToast({title:'刷新失败',icon:'none'})
  }
})
</script>

<style lang="less" scoped>
/* 页面背景淡灰 */
.summary-wrap{
  padding-bottom: 40rpx;
  background:#f5f6f8;
}

/* 返回圆角胶囊按钮（如后续加入返回按钮可复用） */
.nav-back-pill{
  display:flex; align-items:center; justify-content:center;
  height: 64rpx; min-width: 64rpx; padding: 0 16rpx;
  border-radius: 999rpx; background: rgba(255,255,255,.78);
  box-shadow: 0 6rpx 12rpx rgba(0,0,0,.08);
}

/* 顶部渐变头：#FCE259 → 淡灰；增加顶部安全区占位 */
.header-gradient{
  padding: calc(var(--safe-top, 0px) + 16px) 28rpx 12rpx;
  background: linear-gradient(
    180deg,
    #FCE259 0%,
    #FFD863 18%,
    #FFE891 46%,
    #FFF6CC 70%,
    #f5f6f8 100%
  );
  border-bottom-left-radius: 40rpx;
  border-bottom-right-radius: 40rpx;
  box-shadow: 0 12rpx 28rpx rgba(252, 226, 89, .26);
}

/* 下划线Tab */
.tabs-underline{ display:flex; gap: 40rpx; }
.tab{ position:relative; padding: 8rpx 6rpx 18rpx; font-size:34rpx; font-weight:800; letter-spacing:.5rpx; color:#8a8f9a; }
.tab.active{ color:#333; }
.underline{
  position:absolute; left:0; right:0; bottom:0;
  height: 6rpx; border-radius: 6rpx;
  background:#FCE259; box-shadow: 0 2rpx 6rpx rgba(252,226,89,.55);
}

/* 分类/尺寸（保留蓝/粉） */
.category-container{ padding:20rpx 20rpx 0; background:#f5f6f8; }
.category-scroll{ white-space:nowrap; height:100rpx; }
.category-item{
  display:inline-flex; align-items:center; justify-content:center;
  font-size:28rpx; margin:0 15rpx; padding:10rpx 25rpx; border-radius:50rpx;
  background: rgba(255,255,255,.9); transition:.2s; box-shadow:0 4rpx 10rpx rgba(0,0,0,.05);
  color:#666; font-weight:500; position:relative; top:10rpx;
}
.category-item.active{
  background:#7dc3d3; color:#fff; font-weight:700; box-shadow:0 4rpx 10rpx rgba(125,195,211,.4);
  transform: translateY(-4rpx);
}

.size-container{ padding:0 20rpx 10rpx; background:#f5f6f8; }
.size-scroll{ white-space:nowrap; height:80rpx; }
.size-item{
  display:inline-flex; align-items:center; justify-content:center;
  font-size:26rpx; margin:0 12rpx; padding:8rpx 20rpx; border-radius:50rpx;
  background: rgba(255,255,255,.9); transition:.2s; box-shadow:0 4rpx 8rpx rgba(0,0,0,.05);
  color:#666; font-weight:500;
}
.size-item.active{
  background:#ff9ab2; color:#fff; font-weight:700; box-shadow:0 4rpx 10rpx rgba(255,154,178,.4);
}

/* 日期选择卡片 */
.date-picker-container{
  padding:20rpx; background:#fff; margin: 8rpx 20rpx 0; border-radius:20rpx;
  box-shadow:0 8rpx 20rpx rgba(0,0,0,.06); position:relative; z-index:10;
}
.date-scroll{ white-space:nowrap; display:flex; padding:10rpx 0; }
.date-item{ display:inline-flex; flex-direction:column; align-items:center; justify-content:center; width:calc(100vw / 7); padding:50rpx 0 10rpx; position:relative; }
.date-badge{ position:absolute; top:0rpx; right:35rpx; background:#ff9ab2; color:#fff; border-radius:50%; width:36rpx; height:36rpx; line-height:36rpx; font-size:22rpx; text-align:center; font-weight:700; z-index:2; }
.weekday{ font-size:26rpx; color:#666; margin-bottom:10rpx; }
.weekday.weekend{ color:#ff6b6b; font-weight:700; }
.day-number{ display:flex; align-items:center; justify-content:center; width:70rpx; height:70rpx; border-radius:50%; font-size:24rpx; color:#333; background:#f5f9ff; transition:.2s; font-weight:500; }
.day-number.selected{ background: linear-gradient(135deg,#7dc3d3,#89d1e1); color:#fff; font-weight:700; transform:scale(1.1); box-shadow:0 5rpx 15rpx rgba(125,195,211,.3); }

/* 主体/卡片 */
.goods-container{ padding:40rpx 30rpx; background:#f5f6f8; border-radius:40rpx 40rpx 0 0; min-height:70vh; }
.date-title{ font-size:32rpx; color:#555; margin-bottom:30rpx; padding-left:15rpx; border-left:8rpx solid #7dc3d3; }
.date-title .highlight{ color:#7dc3d3; font-weight:700; margin-right:10rpx; }

.empty-tip{ display:flex; flex-direction:column; align-items:center; justify-content:center; padding:80rpx 0; color:#999; font-size:32rpx; }
.empty-tip .empty-icon{ width:180rpx; height:180rpx; margin-bottom:30rpx; opacity:.6; }

.goods-card{ display:flex; background:#fff; border-radius:24rpx; overflow:hidden; margin-bottom:30rpx; box-shadow:0 8rpx 24rpx rgba(0,0,0,.06); transition: transform .2s ease, box-shadow .2s ease; }
.goods-card:active{ transform:scale(.98); box-shadow:0 6rpx 18rpx rgba(0,0,0,.06); }
.goods-image-container{ position:relative; width:260rpx; flex-shrink:0; }
.goods-image{ width:100%; height:10.625rem; display:block; overflow:hidden; border-radius:10px; margin:20rpx 10rpx; }
.goods-tags{ position:absolute; top:35rpx; left:10rpx; display:flex; flex-direction:column; align-items:flex-start; }
.tag{ font-size:24rpx; padding:6rpx 18rpx; border-radius:0 10rpx 10rpx 0; margin-bottom:10rpx; color:#fff; font-weight:500; }
.sale-type{ background: linear-gradient(90deg, rgba(52,68,160,.8), rgba(52,68,160,.6)); }
.first-day{ background: linear-gradient(90deg, rgba(0,0,0,.7), rgba(0,0,0,.5)); }

.goods-info{ flex:1; padding:25rpx; display:flex; flex-direction:column; }
.brand-name{ font-size:22rpx; color:#fff; font-weight:700; margin-bottom:8rpx; display:inline-block; background:#7dc3d3; padding:5rpx 10rpx; border-radius:10rpx; margin-right:15rpx; }
.goods-name{ font-size:26rpx; color:#38374c; font-weight:700; margin-bottom:8rpx; display:inline-block; }

.goods-details{ margin-bottom:20rpx; display:flex; flex-wrap:wrap; align-items:center; }
.size-group{ display:flex; align-items:flex-start; margin-right:10rpx; margin-bottom:5rpx; white-space:nowrap; }
.size-category{ font-weight:700; color:#555; margin-right:5rpx; flex-shrink:0; }
.size-details{ color:#777; word-break:break-word; max-width:200rpx; }

.time-info{ background:#f8f9ff; border-radius:12rpx; padding:15rpx; color:#666; margin-bottom:20rpx; }
.time-info text{ display:block; font-size:22rpx; margin-bottom:10rpx; position:relative; padding-left:16rpx; }
.time-info text::before{ content:''; position:absolute; left:0; top:50%; transform:translateY(-50%); width:10rpx; height:10rpx; background:#7dc3d3; border-radius:50%; }

.price-info{ margin-top:auto; display:flex; gap:25rpx; }
.price-group{ display:flex; align-items:baseline; flex-wrap:wrap; }
.price-label{ font-size:26rpx; color:#ff9ab2; margin-right:8rpx; white-space:nowrap; }
.deposit-price{ font-size:36rpx; color:#ff6b9c; font-weight:700; margin-right:6rpx; }
.final-price{ font-size:32rpx; color:#ff6b9c; font-weight:700; }
.full-price{ font-size:36rpx; color:#ff6b9c; font-weight:700; margin:0 5rpx; }
.currency{ font-size:24rpx; color:#999; transform: translateY(-2rpx); }

/* 约妆卡片 */
.plan-card{ background:#fff; border-radius:24rpx; padding:30rpx; margin-bottom:30rpx; box-shadow:0 8rpx 25rpx rgba(125,195,211,.15); position:relative; }
.artist-header{ display:flex; justify-content:space-between; align-items:center; margin-bottom:20rpx; }
.artist-info{ display:flex; align-items:center; }
.artist-avatar{ width:100rpx; height:100rpx; border-radius:50%; margin-right:20rpx; border:2rpx solid #e6f7ff; }
.artist-details{ display:flex; flex-direction:column; }
.artist-name{ font-size:28rpx; font-weight:700; color:#333; margin-bottom:5rpx; padding-left:8rpx; }
.makeup-price-range{ font-weight:700; background: linear-gradient(135deg, #97e7f7, #d5acd6); padding:4rpx 12rpx; border-radius:20rpx; align-self:flex-start; }
.makeup-price-range text{ font-size:24rpx; color:#fff; }

.artist-description{ font-size:26rpx; color:#666; line-height:1.6; margin-bottom:20rpx; padding:15rpx; background:#f8f9ff; border-radius:12rpx; }
.highlight-images{ margin:20rpx 0; padding:10rpx 0; overflow:hidden; }
.image-scroll{ white-space:nowrap; }
.highlight-image{ display:inline-block; width:240rpx; height:300rpx; border-radius:12rpx; margin-right:15rpx; background:#f5f9ff; box-shadow:0 4rpx 10rpx rgba(0,0,0,.05); transition: transform .2s; }
.highlight-image:active{ transform:scale(.95); }
.highlight-image:last-child{ margin-right:0; }

.foldable-section{ max-height:0; overflow:hidden; transition:max-height .5s, opacity .3s; opacity:0; }
.foldable-section.expanded{ max-height:1500rpx; opacity:1; }
.fold-toggle{ display:flex; align-items:center; justify-content:center; padding:20rpx 0; color:#81D8cf; font-size:26rpx; font-weight:500; margin-top:10rpx; }
.fold-toggle text{ margin-right:10rpx; }

.plan-info{ background:#f0f9ff; border-radius:12rpx; padding:20rpx; margin-bottom:20rpx; }
.plan-info .info-row{ display:flex; margin-bottom:15rpx; font-size:26rpx; }
.plan-info .info-row:last-child{ margin-bottom:0; }
.plan-info .label{ color:#5da8c0; font-weight:700; width:140rpx; }
.plan-info .value{ color:#333; flex:1; }

.config-section{ margin-bottom:25rpx; }
.config-section .section-title{ display:block; font-size:26rpx; font-weight:700; color:#5da8c0; margin-bottom:15rpx; padding-bottom:8rpx; border-bottom:1rpx solid #e6f7ff; }
.tier-item,.addon-item{ display:flex; align-items:center; padding:12rpx 0; border-bottom:1rpx dashed #e6f7ff; }
.tier-item:last-child,.addon-item:last-child{ border-bottom:none; }
.tier-title,.addon-title{ font-size:26rpx; color:#333; width:140rpx; font-weight:500; }
.tier-price,.addon-price{ font-size:26rpx; color:#5da8c0; font-weight:700; width:120rpx; text-align:right; }
.tier-desc,.addon-desc{ font-size:24rpx; color:#888; flex:1; margin-left:20rpx; }

/* 隐藏滚动条 */
::-webkit-scrollbar{ width:0!important; height:0!important; background:transparent!important; display:none!important; }
</style>
