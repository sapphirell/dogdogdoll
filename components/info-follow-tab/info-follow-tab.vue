<template>
  <view class="follow-tab">
    <view class="follow-sub-tabs">
      <view
        v-for="tab in subTabs"
        :key="tab.key"
        class="sub-tab-item"
        :class="{ 'sub-tab-item-active': activeSubTab === tab.key }"
        @click="emit('change-sub-tab', tab.key)"
      >
        <text class="sub-tab-text font-alimamashuhei">{{ tab.label }}</text>
      </view>
    </view>

    <view v-if="activeSubTab === 'brand'" class="list-wrap">
      <view v-if="!brandLoading && brandList.length === 0" class="empty-box">
        <text class="empty-text font-alimamashuhei">还没有关注任何品牌哦</text>
      </view>

      <view
        v-for="(item, index) in brandList"
        :key="item.id"
        class="brand-item"
        :style="brandItemStyle(index)"
        @click="emit('open-brand', item)"
      >
        <view class="brand-avatar">
          <image class="brand-avatar-img" :src="resolveImage(item.logo_image)" mode="aspectFill" />
        </view>

        <view class="brand-main">
          <text class="brand-name font-alimamashuhei">{{ item.brand_name || '未命名品牌' }}</text>

          <view class="brand-meta">
            <text class="meta-tag font-alimamashuhei">待开售 {{ getWaitingCount(item) }}</text>
            <text class="meta-label font-alimamashuhei">新情报</text>
            <text class="meta-time font-alimamashuhei">{{ formatTime(item.latest_news_time) }}</text>
          </view>
        </view>

        <view class="brand-arrow">
          <text class="arrow-text font-alimamashuhei">去看看</text>
          <text class="arrow-symbol font-alimamashuhei">→</text>
        </view>
      </view>

      <view v-if="brandLoading" class="loading-box">
        <loading-jump-text />
      </view>

      <view
        v-else-if="!brandFinished && brandList.length > 0"
        class="load-more-box"
        @click="emit('load-brand-more')"
      >
        <text class="load-more-text font-alimamashuhei">点击加载更多</text>
      </view>

      <view v-else-if="brandFinished && brandList.length > 0" class="load-more-box">
        <text class="load-more-text font-alimamashuhei">已经到底啦</text>
      </view>
    </view>

    <view v-else-if="activeSubTab === 'goods'" class="list-wrap">
      <view v-if="!goodsLoading && goodsList.length === 0" class="empty-box">
        <text class="empty-text font-alimamashuhei">还没有关注任何商品哦</text>
      </view>

      <view
        v-for="(item, index) in goodsList"
        :key="item.id"
        class="goods-item"
        :style="goodsItemStyle(index)"
        @click="emit('open-goods', item)"
      >
        <view class="goods-thumb">
          <image 
            class="goods-thumb-img" 
            :src="resolveImage(item.goods_image || (item.goods_images && item.goods_images[0]))" 
            mode="aspectFill" 
          />
        </view>

        <view class="goods-main">
          <text class="goods-title font-alimamashuhei">{{ itemTitle(item) }}</text>
          <text class="goods-brand font-alimamashuhei">{{ item.brand_name || '未知品牌' }}</text>
        </view>

        <view class="brand-arrow">
          <text class="arrow-text font-alimamashuhei">去看看</text>
          <text class="arrow-symbol font-alimamashuhei">→</text>
        </view>
      </view>

      <view v-if="goodsLoading" class="loading-box">
        <loading-jump-text />
      </view>

      <view
        v-else-if="!goodsFinished && goodsList.length > 0"
        class="load-more-box"
        @click="emit('load-goods-more')"
      >
        <text class="load-more-text font-alimamashuhei">点击加载更多</text>
      </view>

      <view v-else-if="goodsFinished && goodsList.length > 0" class="load-more-box">
        <text class="load-more-text font-alimamashuhei">已经到底啦</text>
      </view>
    </view>

    <view v-else class="empty-box">
      <text class="empty-text font-alimamashuhei">该模块后续接入～</text>
    </view>
  </view>
</template>

<script setup>
import { image1Url } from '@/common/config.js'

const emit = defineEmits([
  'change-sub-tab',
  'load-brand-more',
  'load-goods-more',
  'open-brand',
  'open-goods'
])

const props = defineProps({
  active: { type: Boolean, default: true },

  activeSubTab: { type: String, default: 'brand' },

  brandList: { type: Array, default: () => [] },
  brandLoading: { type: Boolean, default: false },
  brandFinished: { type: Boolean, default: false },

  goodsList: { type: Array, default: () => [] },
  goodsLoading: { type: Boolean, default: false },
  goodsFinished: { type: Boolean, default: false }
})

const subTabs = [
  { key: 'brand', label: '品牌' },
  { key: 'goods', label: '商品' },
  { key: 'mix', label: '搭配' },
  { key: 'display', label: '展示柜' }
]

const defaultImg = 'https://images1.fantuanpu.com/home/jpt.gif'

function resolveImage (url) {
  if (!url) return defaultImg
  // 如果是完整链接 (http开头)，直接返回
  if (typeof url === 'string' && (url.indexOf('http') === 0 || url.indexOf('//') === 0)) return url
  // 否则拼接域名
  return image1Url + url
}

function formatTime (ts) {
  if (!ts) return '--'
  const d = new Date(ts * 1000)
  if (isNaN(d.getTime())) return '--'
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return y + '-' + m + '-' + day + ' ' + hh + ':' + mm
}

function getWaitingCount (brand) {
  const list = brand.waiting_goods || []
  return Array.isArray(list) ? list.length : 0
}

function itemTitle (item) {
  return item.title || item.goods_title || item.goods_name || item.name || '未命名商品'
}

function brandItemStyle (index) {
  const delay = index * 80
  return { animationDelay: delay + 'ms' }
}

function goodsItemStyle (index) {
  const delay = index * 80
  return { animationDelay: delay + 'ms' }
}
</script>

<style lang="scss" scoped>
.follow-tab {
  padding-top: 12rpx;
}

/* 三级 Tab：品牌 / 商品 / 搭配 / 展示柜 */
.follow-sub-tabs {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx 0 16rpx;
}

.sub-tab-item {
  margin: 0 36rpx;
}

.sub-tab-text {
  font-size: 28rpx;
  color: #c4c4c4;
}

/* 激活态：蓝绿色，高亮显示 */
.sub-tab-item-active .sub-tab-text {
  color: #7fdfff;
}

/* 列表通用 */
.list-wrap {
  margin-top: 4rpx;
}

/* 统一淡入动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(16rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 品牌 item */
.brand-item {
  margin-top: 24rpx;
  padding: 24rpx 20rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;

  opacity: 0;
  transform: translateY(16rpx);
  animation-name: fadeInUp;
  animation-duration: 0.32s;
  animation-timing-function: ease;
  animation-fill-mode: forwards;
}

.brand-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  overflow: hidden;
  background: #f3f3f3;
  margin-right: 24rpx;
}

.brand-avatar-img {
  width: 100%;
  height: 100%;
}

.brand-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-size: 28rpx;
  font-weight: 700;
  color: #222222;
}

.brand-meta {
  margin-top: 10rpx;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.meta-tag {
  font-size: 22rpx;
  color: #777777;
  margin-right: 16rpx;
}

.meta-label {
  font-size: 22rpx;
  color: #66d3ff;
  margin-right: 8rpx;
}

.meta-time {
  font-size: 22rpx;
  color: #9fdfff;
}

.brand-arrow {
  margin-left: 16rpx;
  align-items: center;
  justify-content: flex-end;
  display: flex;
  flex-direction: column;
}

.arrow-text {
  font-size: 22rpx;
  color: #222222;
}

.arrow-symbol {
  font-size: 24rpx;
  margin-top: 4rpx;
  color: #bbbbbb;
}

/* 商品 item */
.goods-item {
  margin-top: 24rpx;
  padding: 20rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;

  opacity: 0;
  transform: translateY(16rpx);
  animation-name: fadeInUp;
  animation-duration: 0.32s;
  animation-timing-function: ease;
  animation-fill-mode: forwards;
}

.goods-thumb {
  width: 120rpx;
  height: 120rpx;
  border-radius: 18rpx;
  overflow: hidden;
  background: #f3f3f3;
  margin-right: 24rpx;
}

.goods-thumb-img {
  width: 100%;
  height: 100%;
}

.goods-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.goods-title {
  font-size: 26rpx;
  color: #222222;
}

.goods-brand {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #888888;
}

/* 状态 */
.empty-box {
  margin-top: 80rpx;
  text-align: center;
}

.empty-text {
  font-size: 26rpx;
  color: #aaaaaa;
}

.loading-box,
.load-more-box {
  margin: 24rpx 0 12rpx;
  text-align: center;
}

.loading-text,
.load-more-text {
  font-size: 24rpx;
  color: #888888;
}
</style>