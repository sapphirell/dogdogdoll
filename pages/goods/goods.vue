<template>
  <!-- 透明固定导航条 -->
  <zhouWei-navBar
    type="transparentFixed"
    :backState="1000"
    :homeState="2000"
    fontColor="#000"
    transparentFixedFontColor="#000"
    :scrollTop="scrollTop"
  >
    <!-- 顶部透明态：左侧返回 -->
    <template #transparentFixedLeft>
      <view class="nav-back-pill" @click="goBack" aria-label="返回">
        <uni-icons type="left" size="22" color="#000" />
      </view>
    </template>

    <!-- 顶部透明态：中间标题（商品名，超长省略） -->
    <template #transparentFixed>
      <text class="nav-title-ellipsis">
        {{ goods.name || goods.goods_name || '商品详情' }}
      </text>
    </template>

    <!-- 滚动出现的实底态：左侧同样要放返回，避免“消失” -->
    <template #left>
      <view class="nav-back-pill" @click="goBack" aria-label="返回">
        <uni-icons type="left" size="22" color="#000" />
      </view>
    </template>

    <!-- 滚动出现的实底态：中间显示品牌图片（蓝底），点击跳品牌详情 -->
    <template #default>
      <view v-if="goods.goods_brand_name_image" class="nav-brand-wrap" @tap="jumpBrand(goods.brand_id)">
        <image :src="goods.goods_brand_name_image" mode="heightFix" class="nav-brand-img" />
      </view>
      <text v-else class="nav-brand-name" @tap="jumpBrand(goods.brand_id)">
        {{ goods.brand_name || '品牌' }}
      </text>
    </template>
  </zhouWei-navBar>

  <!-- 页面主体 -->
  <view v-if="goods.name" class="goods-detail-container" :key="currentId">
    <meta name="theme-color" content="#F8F8F8"></meta>
    <view-logs />

    <!-- 轮播图部分 -->
    <view class="swiper-container">
      <view class="heart" @click="likeFn()">
        <uni-icons :type="hasLike ? 'heart-filled' : 'heart'" size="28" color="#ff4d4f" style="position: relative;top: 5rpx;"></uni-icons>
        <text class="num" style="color:#ff4d4f;">{{ formatNumber(goods.goods_like_count) }}</text>
      </view>

      <swiper :interval="3000" :duration="200" @change="onChange" class="banner-swiper"
        :style="{ height: swiperHeight + 'px', 'min-height': '200px', 'max-height': maxHeight + 'px' }">
        <block v-for="(item, key) in goods.goods_images" :key="key">
          <swiper-item class="swiper-item-container">
            <view class="swiper-item">
              <image :src="item" mode="widthFix" :class="'swiper-image-'+key" @load="onImageLoad(key)" @tap="viewFullImage(key)"></image>
            </view>
          </swiper-item>
        </block>
      </swiper>

      <view class="swiper-index">
        <text style="color: #fff;">{{swiperIndex}} / {{goods.goods_images.length}}</text>
      </view>
    </view>

    <!-- 商品基本信息 -->
    <view class="goods-info">
      <view class="action-buttons">
        <button class="action-btn add-to-stock" @click="addToStock">
          <view class="btn-content">
            <uni-icons type="plus" size="18" color="#fff" style="height: 36rpx;margin-bottom: 10rpx;"></uni-icons>
            <text>放入物品栏</text>
          </view>
        </button>
        <button class="action-btn wish-resale" @click="wishResale">
          <view class="btn-content">
            <uni-icons type="star" size="18" color="#fff" style="height: 36rpx;margin-bottom: 10rpx;"></uni-icons>
            <text>期望再贩</text>
          </view>
        </button>
        <button class="action-btn add-showcase" @click="addToShowcase">
          <view class="btn-content">
            <uni-icons type="vip" size="18" color="#fff" style="height: 36rpx;margin-bottom: 10rpx;"></uni-icons>
            <text>加入展示柜</text>
          </view>
        </button>
      </view>

      <view class="info-item">
        <text class="label">名称</text>
        <image :src="goods.goods_name_image" mode="heightFix" class="img_info"></image>
      </view>
      <view class="info-item" @click="selectType(goods.type)">
        <text class="label">类型</text>
        <text class="value">{{goods.type}}</text>
      </view>

      <view class="info-item">
        <text class="label">初贩定价</text>
        <image :src="goods.goods_price_image" v-if="goods.goods_price_image" mode="heightFix" class="img_info"></image>
        <text class="value" v-else-if="goods.goods_sales && goods.goods_sales.length > 0">
          {{goods.goods_sales[0].sub_amount + goods.goods_sales[0].fin_amount}}
          {{goods.goods_sales[0].currency}}
        </text>
        <text class="value" v-else>未知</text>
      </view>

      <view class="info-item">
        <text class="label">初贩时间</text>
        <text class="value">{{goods.sub_time1 > 0 ? formatTimestamp(goods.sub_time1) : "未知"}}</text>
      </view>

      <view class="info-item" @click="selectSize(goods.size)">
        <text class="label">尺寸</text>
        <view class="value">
          <view v-if="goods.sizes && goods.sizes.length > 0">
            <view v-for="(group, index) in groupedSizes" :key="index" class="size-group">
              <text class="size-category">{{ group.category }}：</text>
              <text class="size-details">{{ group.details.join('、') }}</text>
            </view>
          </view>
          <text v-else>
            {{ goods.size }} / {{ goods.size_detail }}
          </text>
        </view>
      </view>

      <view v-if="goods.type==='单体' || goods.type === '整体' || goods.type === '单头'" class="info-item">
        <text class="label">可选体型</text>
        <text class="value">{{goods.body_size || "未知"}}</text>
      </view>

      <view class="info-item">
        <text class="label">可选颜色</text>
        <text class="value">{{goods.skin}}</text>
      </view>

      <view class="info-item">
        <text class="label">制作方</text>
        <image @click="jumpBrand(goods.brand_id)" :src="goods.goods_brand_name_image" v-if="goods.goods_brand_name_image" mode="heightFix" class="img_info" style="background: rgb(169 231 255);padding: 0rpx 20rpx;"></image>
      </view>

      <view class="info-item">
        <text class="label">材质</text>
        <text class="value">{{goods.doll_material}}</text>
      </view>

      <view class="info-item">
        <text class="label">备注</text>
        <text class="value">{{goods.desc_content || '暂无备注信息'}}</text>
      </view>
    </view>

    <!-- 贩售情报 -->
    <view class="sales-info" v-if="goods.goods_sales && goods.goods_sales.length > 0">
      <text class="section-title">贩售情报</text>
      <view class="sales-list">
        <view v-for="(sale, index) in goods.goods_sales" :key="sale.id" class="sale-item">
          <view class="sale-header">
            <text class="sale-type">{{sale.sale_type}}</text>
            <text class="sale-price">{{sale.sub_amount + sale.fin_amount}} {{sale.currency}}</text>
          </view>
          <view class="sale-period">
            <text>{{formatTimestamp(sale.sub_time)}}</text>
            <text v-if="sale.sub_time_end > 0" class="separator">至</text>
            <text v-if="sale.sub_time_end > 0">{{formatTimestamp(sale.sub_time_end)}}</text>
            <text v-else class="separator">开定</text>
          </view>
          <view class="sale-size">
            <text>{{sale.size}} · {{sale.size_detail}}</text>
          </view>
          <view class="bill-action" @click="createBill(sale)">
            <uni-icons type="plus" size="16" color="#64c6dc"></uni-icons>
            <text>创建一个尾款账单</text>
          </view>
        </view>
      </view>
    </view>
    <view v-else class="no-sales">
      <text class="section-title">贩售情报</text>
      <text class="empty-text">暂无贩售信息</text>
    </view>

    <!-- 表态组件 -->
    <item-impression
      :key="currentId"
      :target_id="parseInt(currentId)"
      type="2"
      :goods-type="Number(goods.type) || 0"
    ></item-impression>

    <!-- 搭配参考 -->
    <view class="collocation-section">
      <view class="section-header">
        <text class="section-title">搭配参考</text>
        <view class="more-link" @tap="jump2collocation">
          <text>查看更多</text>
          <image src="../../static/right2.png"></image>
        </view>
      </view>

      <scroll-view scroll-x="true" class="collocation-list">
        <view
          v-for="collocation in collocationList.collocation_relation_list"
          :key="collocation.collocation_id"
          class="collocation-item"
          @tap="jump2collectionDetail(collocation.collocation_id, collocation.relation_origin)"
        >
          <image :src="getImageForList(collocation.image_urls)" mode="aspectFill"></image>
        </view>
      </scroll-view>

      <view @tap="jump2collocation" class="upload-collocation">
        <text>返图帮助其它娃友?</text>
        <uni-icons type="upload" size="20" color="#ccc" style="margin-left: 10rpx;"></uni-icons>
      </view>
    </view>

    <!-- 妆图展示 -->
    <view v-if="showFaceupSection" class="faceup-section">
      <view class="section-header">
        <text class="section-title">妆图展示</text>
        <view class="refresh-btn" :class="{loading: faceupLoading}" @click="refreshFaceupList">
          <text class="refresh-text"> {{ faceupLoading ? '换一批中…' : '换一批' }} </text>
          <uni-icons v-if="!faceupLoading" type="refresh" size="16" color="#64c6dc" style="margin-left: 8rpx;"></uni-icons>
        </view>
      </view>

      <view class="faceup-grid">
        <view v-for="(faceup, index) in faceupList" :key="index" class="faceup-card" @click="jump2faceup(faceup.id)">
          <image :src="getFirstImage(faceup.face_up_image_urls)" mode="aspectFill" class="faceup-cover"></image>
          <view class="faceup-title">{{ faceup.title }}</view>
        </view>
      </view>

      <view class="faceup-empty" v-if="!faceupLoading && faceupList.length === 0">
        暂无妆图～
      </view>
    </view>

    <!-- 评论区 -->
    <view class="comment-section">
      <comment-list
        :key="currentId"
        ref="commentListRef"
        :type="2"
        :relation-id="parseInt(currentId)"
        @reply="handleReplyComment"
      />
    </view>

    <!-- 输入框 -->
    <comment-input
      ref="commentInputRef"
      :reply-info="replyForItem"
      :target-id="parseInt(currentId)"
      @submit="handleCommentSubmit"
      @update:reply-info="val => replyForItem = val"
    />

    <view class="bottom-placeholder"></view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { onPageScroll, onLoad, onShow } from '@dcloudio/uni-app'
import { asyncGetUserInfo } from '../../common/config'
import { websiteUrl, global } from '../../common/config.js'

const props = defineProps(['goods_id'])

/* ===== 透明导航：滚动联动 & 返回 ===== */
const scrollTop = ref(0)
onPageScroll(e => { scrollTop.value = e?.scrollTop || 0 })
function goBack () {
  const pages = getCurrentPages?.() || []
  if (pages.length > 1) uni.navigateBack({ delta: 1 })
  else uni.switchTab({ url: '/pages/index/index' })
}

/* ===== 数据区 ===== */
const loading = ref(false)
const error = ref(false)
const errorMsg = ref('')

const commentListRef = ref(null)
const commentInputRef = ref(null)
let replyForItem = ref({})

let goods = ref({})
let swiperIndex = ref(1)

let hasLike = ref(false)
let collocationList = ref(false)
let wishLoading = ref(false);
let hasWish = ref(false);
let wishCount = ref(0);

const swiperHeight = ref(400);
const imageHeights = ref([]);
const maxHeight = ref(uni.upx2px(1000));

const faceupList = ref([]);
const faceupLoading = ref(false);
const showFaceupSection = computed(() => goods.value.type === '单头' || goods.value.type === '整体');

/* ===== 关键：按 ID 重新拉取 ===== */
const currentId = ref(String(props.goods_id || ''))
const lastGoodsId = ref(String(props.goods_id || ''))

function reloadById(id, reason = 'unknown') {
  const newId = String(id || '')
  if (!newId) {
    console.log('【商品】reloadById 失败：ID 为空，原因=', reason)
    return
  }
  console.log('【商品】准备按ID重新拉取，原因=', reason, ' ID=', newId)

  currentId.value = newId
  lastGoodsId.value = newId

  // 轻量重置视图状态，避免闪旧数据
  goods.value = {}
  faceupList.value = []
  imageHeights.value = []
  swiperIndex.value = 1
  swiperHeight.value = 400
  hasLike.value = false
  hasWish.value = false
  wishCount.value = 0
  replyForItem.value = {}

  uni.showLoading({ title: '加载中' })
  getGoods(newId)
  getCollocation(newId)
  asyncGetUserInfo().then(() => { getHasLike(newId) })
  getWishInfo(newId)
}

/* ===== 请求函数（全部支持传入 id） ===== */
function getGoods(id = currentId.value) {
  uni.request({
    url: websiteUrl.value + '/goods?id=' + id, method: 'GET', timeout: 5000,
    success: (res) => {
      goods.value = res.data.data || {}
      console.log('【商品】详情加载完成：id=', id, ' name=', goods.value.name)
      getWishInfo(id)
      if (showFaceupSection.value) getFaceupList(id)
    },
    fail: () => uni.showToast({ title: '网络请求失败', icon: 'none' }),
    complete: () => uni.hideLoading()
  })
}

function getHasLike(id = currentId.value){
  const token = uni.getStorageSync('token'); if(!token) return
  uni.request({
    url: websiteUrl.value + '/with-state/hasLike?id=' + id + '&type=1', method:'POST', header:{ Authorization: token },
    success: (res)=>{ if(res.data.status==='success'){ hasLike.value = res.data.data.id > 0 } },
  })
}

function getWishInfo(id = currentId.value){
  const token = uni.getStorageSync('token')
  uni.request({
    url: websiteUrl.value + '/with-state/wish-info?goods_id=' + id, method:'GET',
    header: token ? { Authorization: token } : {},
    success: (res)=>{ if(res.data.status==='success'){ hasWish.value = res.data.data.user_has_wished; wishCount.value = res.data.data.wish_count } }
  })
}

function getCollocation(id = currentId.value){
  uni.request({
    url: websiteUrl.value + '/goods-collocation?goods_id=' + id, method:'GET', timeout:5000,
    success: (res)=>{ collocationList.value = res.data.data },
    fail: ()=> uni.showToast({ title:'网络请求失败', icon:'none' })
  })
}

const getFaceupList = async (id = currentId.value) => {
  if (!showFaceupSection.value) return;
  faceupLoading.value = true;
  try {
    const res = await uni.request({ url: `${websiteUrl.value}/rand-bjd-faceup?goods_id=${id}`, method: 'GET', timeout: 5000 })
    if (res.data.status === 'success') faceupList.value = res.data.data || []
    else uni.showToast({ title: res.data.msg || '获取妆图失败', icon: 'none' })
  } catch { uni.showToast({ title: '网络请求失败', icon: 'none' }) }
  finally { faceupLoading.value = false }
}
const refreshFaceupList = () => { if (!faceupLoading.value) getFaceupList() }
const getFirstImage = (s) => (s ? s.split(',')[0].trim() : '')
function jump2faceup(id) { uni.navigateTo({ url: '/pages/artwork/artwork?id=' + id }) }

/* ===== 其它交互 ===== */
const groupedSizes = computed(() => {
  if (!goods.value.sizes || goods.value.sizes.length === 0) return []
  const groups = {}
  goods.value.sizes.forEach(i => {
    const cat = i.goods_size
    if (!groups[cat]) groups[cat] = []
    if (i.size_detail) groups[cat].push(i.size_detail)
  })
  return Object.keys(groups).map(category => ({ category, details: groups[category] }))
})

function onImageLoad(index) {
  const query = uni.createSelectorQuery()
  setTimeout(() => {
    query.select(`.swiper-image-${index}`).boundingClientRect(rect => {
      if (!rect) return
      imageHeights.value[index] = rect.height
      const valid = imageHeights.value.filter(h => h > 0)
      if (!valid.length) return
      const h = Math.max(...valid)
      swiperHeight.value = Math.min(h, maxHeight.value)
    }).exec()
  }, 20)
}
function jumpBrand(id) { uni.navigateTo({ url: '/pages/brand/brand?brand_id=' + id }) }
function onChange(e) { swiperIndex.value = e.detail.current + 1 }

function formatNumber(n) { if (n < 1000) return '' + n; const k = Math.floor(n/1000); return `${k}k+` }
function formatTimestamp(ts) {
  if (!ts || ts <= 0) return '未知'
  const d = new Date(ts*1000)
  const p = n => (''+n).padStart(2,'0')
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

function viewFullImage(i){ const urls = goods.value.goods_images || []; if(urls.length) uni.previewImage({ current: urls[i], urls }) }

function likeFn(){
  const id = parseInt(currentId.value)
  let token = uni.getStorageSync('token')
  if (!global.isLogin){ uni.showToast({ title:'请先登录', icon:'none' }); return }
  const requestData = { id, type: 1 }
  const url = hasLike.value ? '/with-state/unlike' : '/with-state/add-like'
  uni.request({
    url: websiteUrl.value + url, method:'POST', header:{ Authorization: token }, data: requestData,
    success: (res)=>{ if(res.data.status==='success'){ uni.showToast({ title:'操作成功', icon:'success' }); hasLike.value=!hasLike.value; getHasLike(id); getGoods(id) } else { uni.showToast({ title: res.data.msg, icon:'none' }) } },
    fail: ()=> uni.showToast({ title:'网络请求失败', icon:'none' })
  })
}

function jump2collocation(){
  const id = currentId.value
  uni.navigateTo({ url: '/pages/collocation/collocation?goods_id=' + id + '&brand_id=' + goods.value.brand_id + '&goods_name=' + goods.value.name + '&brand_name=' + goods.value.brand_name + '&type=' + goods.value.type })
}
function jump2collectionDetail(id, origin){
  uni.navigateTo({ url: '/pages/collocation_share/collocation_share?collocation_id=' + id + '&origin=' + origin })
}
function getImageForList(s){ if(!s) return ''; return s.split(',')[0].trim() }
function wishResale(){
  if (wishLoading.value) return
  let token = uni.getStorageSync('token')
  if (!global.isLogin){ uni.showToast({ title:'请先登录', icon:'none' }); return }
  wishLoading.value = true
  uni.request({
    url: websiteUrl.value + '/with-state/wish-restock', method:'POST', header:{ Authorization: token, 'Content-Type':'application/json' },
    data:{ goods_id: parseInt(currentId.value) },
    success: (res)=>{ if(res.data.status==='success'){ uni.showToast({ title:'许愿成功', icon:'success' }); hasWish.value = true; wishCount.value = res.data.data.wish_count || wishCount.value + 1 } else { uni.showToast({ title: res.data.msg || '许愿失败', icon:'none' }) } },
    fail: ()=> uni.showToast({ title:'网络请求失败', icon:'none' }),
    complete: ()=> { wishLoading.value = false }
  })
}
function getHasToken(){ return !!uni.getStorageSync('token') }


/* 评论相关 */
const handleReplyComment = ({ parent, target }) => {
  const item = target ?? parent
  if (replyForItem.value.id === item.id) { replyForItem.value = {}; return }
  replyForItem.value = item
  commentInputRef.value?.focusInput()
}

const handleCommentSubmit = (submitData) => {
  let token = uni.getStorageSync('token');
  if (!global.isLogin) { uni.showToast({ title: '请先登录', icon: 'none' }); return }

  const requestData = {
    content: submitData.content, origin: submitData.origin, target_id: parseInt(currentId.value), type: 2,
    image_url: submitData.image_url || "", association_id: submitData.association_id || 0, association_type: submitData.association_type || 0,
    is_anonymous: submitData.is_anonymous || 0,
    ...(replyForItem.value.id && {
      reply_id: replyForItem.value.id, reply_for: replyForItem.value.comment, reply_uid: replyForItem.value.user_id,
      parent_id: replyForItem.value.parent_id > 0 ? replyForItem.value.parent_id : replyForItem.value.id
    })
  }

  const tempComment = {
    id: Date.now(), content: submitData.content, created_at: Math.floor(Date.now()/1000),
    like_count: 0, reply_count: 0, is_liked: false, floor: 0,
    ...(submitData.is_anonymous ? { avatar: 'https://images1.fantuanpu.com/home/default_avatar.jpg', username: '匿名用户', is_anonymous: 1 }
      : { avatar: global.userInfo.avatar, username: global.userInfo.nickname, is_anonymous: 0 }),
    ...(submitData.association_id && { association_id: submitData.association_id, association_type: submitData.association_type }),
    ...(submitData.image_url && { image_url: submitData.image_url }),
    ...(replyForItem.value.id && {
      reply_id: replyForItem.value.id, reply_for: replyForItem.value.comment, reply_uid: replyForItem.value.user_id,
      parent_id: replyForItem.value.parent_id > 0 ? replyForItem.value.parent_id : replyForItem.value.id,
      reply_username: replyForItem.value.is_anonymous ? '匿名用户' : replyForItem.value.username
    })
  }

  if (!replyForItem.value.id) commentListRef.value?.addNewComment(tempComment)
  else if (replyForItem.value.parent_id === 0) commentListRef.value?.addReplyComment({ ...tempComment, parent_id: replyForItem.value.id })
  else commentListRef.value?.addReplyComment({ ...tempComment, parent_id: replyForItem.value.parent_id })

  uni.request({
    url: websiteUrl.value + '/with-state/add-comment', method: 'POST', header: { Authorization: token }, data: requestData,
    success: (res) => {
      if (res.data.status === 'success') {
        const newComment = res.data.data
        const finalComment = {
          ...newComment,
          ...(submitData.is_anonymous ? { avatar: 'https://images1.fantuanpu.com/home/default_avatar.jpg', username: '匿名用户', is_anonymous: 1 }
            : { avatar: global.userInfo.avatar, username: global.userInfo.nickname, is_anonymous: 0 })
        }
        if (newComment.reply_uid && replyForItem.value.is_anonymous) finalComment.reply_username = '匿名用户'
        commentListRef.value?.updateTempComment(tempComment.id, finalComment)
        uni.showToast({ title: '评论成功', icon: 'success' })
      } else {
        commentListRef.value?.removeTempComment(tempComment.id)
        uni.showToast({ title: res.data.msg, icon: 'none' })
      }
    },
    fail: () => { commentListRef.value?.removeTempComment(tempComment.id); uni.showToast({ title: '网络请求失败', icon: 'none' }) }
  })
}

// 放入物品栏（分包）
function addToStock () {
  const gid = parseInt(currentId.value)
  if (!gid) { uni.showToast({ title: '缺少商品ID', icon: 'none' }); return }
  uni.navigateTo({
    url: `/pkg-stock/stock/account_book_form/account_book_form?goods_id=${gid}`
  })
}

// 加入展示柜（分包）
function addToShowcase () {
  const g = goods.value || {}
  if (!g.id || !g.name || !g.brand_id || !g.brand_name || !g.type) {
    uni.showToast({ title: '商品信息不完整', icon: 'none' })
    return
  }
  const params = {
    goods_id: g.id,
    goods_name: g.name,
    brand_id: g.brand_id,
    brand_name: g.brand_name,
    type: g.type
  }
  const q = Object.keys(params)
    .map(k => `${k}=${encodeURIComponent(params[k])}`)
    .join('&')
  uni.navigateTo({
    url: `/pkg-stock/stock/showcase_form/showcase_form?${q}`
  })
}

// 创建尾款账单（分包）
function createBill (sale) {
  const params = {
    amount: sale.fin_amount,
    currency: sale.currency,
    name: goods.value.name,
    sale_id: sale.id
  }
  const q = Object.keys(params)
    .map(k => `${k}=${encodeURIComponent(params[k])}`)
    .join('&')
  uni.navigateTo({
    url: `/pkg-stock/stock/bill_form/bill_form?${q}`
  })
}


/* ===== 初始化/路由变化兜底 ===== */
onLoad((options = {}) => {
  const idFromLoad = options?.goods_id || props.goods_id
  console.log('【商品】onLoad，检测到ID=', idFromLoad)
  reloadById(idFromLoad, 'onLoad')
})

onShow(() => {
  const pages = getCurrentPages?.() || []
  const top = pages[pages.length - 1]
  const idFromRoute = top?.options?.goods_id
  const newId = String(idFromRoute || props.goods_id || '')
  console.log("路径ID" + newId)
  if (newId && newId !== lastGoodsId.value) {
    console.log('【商品】onShow 检测到ID变更：', lastGoodsId.value, '→', newId)
    reloadById(newId, 'onShow')
  } else {
    console.log('【商品】onShow，无ID变化，跳过拉取（当前=', lastGoodsId.value, '）')
  }
})

watch(() => props.goods_id, (val, old) => {
  const v = String(val || '')
  const o = String(old || '')
  if (v && v !== o) {
    console.log('【商品】props.goods_id 变化：', o, '→', v)
    reloadById(v, 'watch props.goods_id')
  }
})

/* ============ 你项目里的这两个方法仍被引用，保持存在 =========== */
function selectType(){/* 占位：你的原逻辑可保留 */ }
function selectSize(){/* 占位：你的原逻辑可保留 */ }
</script>

<style lang="scss" scoped>
/* 顶部返回的小胶囊（导航条左右插槽复用） */
.nav-back-pill{
  height: 56rpx;
  padding: 0 18rpx;
  border-radius: 33rpx;
  background: rgba(255,255,255,.72);
  border: 2rpx solid rgba(0,0,0,.10);
  display: flex; align-items: center; justify-content: center;
}

.nav-title-ellipsis{
  max-width: 60vw;
  font-size: 30rpx;
  font-weight: 600;
  color: #000;
  overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
}

.goods-detail-container { background-color: #f8f8f8; padding-bottom: 20px; font-size: 24rpx; }

/* 轮播图 */
.swiper-container { position: relative; background-color: #fff; border-radius: 0 0 20rpx 20rpx; overflow: hidden; box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05); }
.heart { position: absolute; top: 70rpx; right: 30rpx; z-index: 10; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 70rpx; height: 70rpx; background: rgba(255,255,255,0.8); border-radius: 50%; padding: 5rpx;
  .num { font-size: 20rpx; font-weight: bold; margin-top: 5rpx; width: 100%; text-align: center; }
}
.banner-swiper { width: 100%; }
.swiper-item-container { display: flex; justify-content: center; align-items: center; background: #ffffff; background-image: radial-gradient(#c6c6c6 15%, #0000 0); background-size: 20rpx 20rpx; }
.swiper-item { display: flex; justify-content: center; align-items: center; width: 100%; }
.swiper-index { position: absolute; bottom: 30rpx; right: 30rpx; background: rgba(0,0,0,0.4); padding: 6rpx 20rpx; border-radius: 30rpx; color: #fff; font-size: 24rpx; }

/* 商品信息 */
.goods-info { background: #fff; border-radius: 20rpx; margin: 20rpx; padding: 30rpx; box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
  .info-item { display: flex; padding: 18rpx 0; border-bottom: 1rpx solid #f5f5f5; &:last-child{border-bottom:none;} }
  .label { width: 180rpx; font-size: 26rpx; color: #999; flex-shrink: 0; }
  .value { flex: 1; font-size: 26rpx; color: #333; word-break: break-all; }
  .brand { color: #64c6dc; font-weight: bold; }
}

/* 贩售情报 */
.sales-info, .no-sales { background:#fff; border-radius:20rpx; margin:20rpx; padding:30rpx; box-shadow:0 4rpx 12rpx rgba(0,0,0,0.05);
  .section-title { display:block; font-size:28rpx; font-weight:bold; color:#64c6dc; margin-bottom:25rpx; padding-left:10rpx; border-left:8rpx solid #64c6dc; }
}
.sales-list {
  .sale-item { padding: 20rpx 0; border-bottom: 1rpx solid #f5f5f5; &:last-child{border-bottom:none;} }
  .sale-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12rpx; }
  .sale-type { font-size:26rpx; font-weight:bold; color:#333; background:#f0f9ff; padding:5rpx 12rpx; border-radius:8rpx; }
  .sale-price { font-size:26rpx; font-weight:bold; color:#ff6b6b; }
  .sale-period { display:flex; align-items:center; font-size:24rpx; color:#666; margin-bottom:12rpx;
    .separator { margin:0 12rpx; color:#ccc; }
  }
  .sale-size { font-size:24rpx; color:#888; }
}
.bill-action { display:flex; align-items:center; justify-content:flex-end; margin-top:15rpx; padding-top:15rpx; border-top:1rpx dashed #eee;
  text { font-size:24rpx; color:#64c6dc; margin-left:8rpx; }
  &:active { opacity:.7; }
}
.sale-item { padding:20rpx 0 15rpx; }
.empty-text { font-size:26rpx; color:#999; text-align:center; padding:30rpx 0; display:block; }

/* 搭配参考 */
.collocation-section { background:#fff; border-radius:20rpx; margin:20rpx; padding:30rpx; box-shadow:0 4rpx 12rpx rgba(0,0,0,0.05);
  .section-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:25rpx; }
  .section-title { font-size:28rpx; font-weight:bold; color:#64c6dc; }
  .more-link { display:flex; align-items:center; color:#888; font-size:24rpx; image{ width:25rpx; height:25rpx; margin-left:8rpx; } }
  .collocation-list { width:100%; white-space:nowrap; margin-top:15rpx; padding:8rpx 0; }
  .collocation-item { display:inline-block; width:200rpx; height:280rpx; border-radius:12rpx; overflow:hidden; margin-right:18rpx; box-shadow:0 4rpx 12rpx rgba(0,0,0,0.1);
    image{ width:100%; height:100%; }
  }
  .upload-collocation { display:flex; align-items:center; justify-content:center; border:1rpx solid #eaeaea; border-radius:15rpx; padding:18rpx; margin-top:25rpx;
    text{ color:#b8b8b8; font-size:24rpx; }
  }
}

/* 妆图展示 */
.faceup-section {
  background:#fff; border-radius:20rpx; margin:20rpx; padding:30rpx; box-shadow:0 4rpx 12rpx rgba(0,0,0,0.05);
  .section-header{ display:flex; justify-content:space-between; align-items:center; margin-bottom:25rpx; }
  .section-title{ font-size:28rpx; font-weight:bold; color:#64c6dc; padding-left:10rpx; border-left:8rpx solid #64c6dc; }
  .refresh-btn{ display:flex; align-items:center; padding:8rpx 16rpx; border-radius:30rpx; background:#eff6ff; }
  .refresh-text{ color:#64c6dc; font-size:24rpx; }
  .refresh-btn.loading{ opacity:.6; }

  .faceup-grid{ display:flex; flex-wrap:wrap; justify-content:space-between; row-gap:20rpx; }
  .faceup-card{ width:48.5%; border-radius:12rpx; overflow:hidden; box-shadow:0 4rpx 12rpx rgba(0,0,0,.1); background:#fff; }
  .faceup-cover{ width:100%; height:320rpx; display:block; }
  .faceup-title{ padding:12rpx 14rpx; font-size:24rpx; color:#333; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; border-top:1rpx solid #f2f2f2; }
  .faceup-empty{ text-align:center; color:#aaa; font-size:24rpx; padding-top:10rpx; }
}

/* 评论区 */
.comment-section { background:#fff; border-radius:20rpx; margin:20rpx; box-shadow:0 4rpx 12rpx rgba(0,0,0,0.05); font-size:24rpx; }

/* 底部占位 */
.bottom-placeholder{ width:100%; height:120rpx }
.img_info{ height:42rpx; position:relative; left:-5rpx; }

/* 顶部按钮组 */
.action-buttons { display:flex; gap:15rpx; padding:0; margin:20rpx 0 30rpx; justify-content:space-between; }
.action-btn {
  line-height:normal !important; flex:1; height:100rpx; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8rpx;
  border-radius:16rpx; font-size:24rpx; font-weight:600; border:none; transition:all .2s ease; position:relative; overflow:hidden; padding:10rpx 0;
  box-shadow:0 6rpx 16rpx rgba(0,0,0,.15); text-shadow:0 1rpx 2rpx rgba(0,0,0,.1);
  &::before{ content:none; } &:active{ transform:scale(.96); box-shadow:0 3rpx 8rpx rgba(0,0,0,.15); } &::after{ border:none; }
  text{ color:#fff; line-height:1.2; } .uni-icons{ filter:drop-shadow(0 1rpx 2rpx rgba(0,0,0,.2)); }
}
.btn-content{ display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; }
.add-to-stock{ background:linear-gradient(135deg,#64c6dc,#4aa5c0); box-shadow:0 6rpx 16rpx rgba(74,165,192,.3); }
.wish-resale{ background:linear-gradient(135deg,#ff9a9e,#f78ca0); box-shadow:0 6rpx 16rpx rgba(247,140,160,.3); }
.add-showcase{ background:linear-gradient(135deg,#a18cd1,#fbc2eb); box-shadow:0 6rpx 16rpx rgba(161,140,209,.3); }

.goods-info{ margin-bottom:10rpx; .info-item:first-child{ padding-top:10rpx; } }
.swiper-container{ margin-bottom:0; }

/* 尺寸分组 */
.size-group { margin-bottom: 8rpx; }
.size-category { font-weight: bold; color: #333; }
.size-details { color: #666; }

/* 实底态的品牌图片（与 .img_info 视觉一致：蓝底+内边距） */
.nav-brand-wrap{
  background: rgb(169 231 255);
  padding: 0 20rpx;
  border-radius: 10rpx;
  display: inline-flex; align-items: center; height: 42rpx;
}
.nav-brand-img{ height: 42rpx; display: block; }
.nav-brand-name{
  font-size: 28rpx; font-weight: 600; color: #333;
  background: rgb(169 231 255); padding: 0 16rpx; border-radius: 10rpx;
}
</style>
