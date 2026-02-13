<template>
  <view-logs />
<view class="calendar-page">
    <!-- 顶部透明自定义导航 -->
    <zhouWei-navBar
      type="transparentFixed"
      :backState="2000"
      :homeState="2000"
      fontColor="#000"
      transparentFixedFontColor="#000"
      :scrollTop="scrollTop"
      :titleCenter="true"
    >
      <!-- 不透明层（滚动后出现）左侧按钮 -->
      <template #left>
        <view class="nav-back-pill" @click="goBack">
          <uni-icons type="left" size="22" color="#000" />
        </view>
      </template>

      <!-- 透明层（页面顶部时显示）左侧按钮 -->
      <template #transparentFixedLeft>
        <view class="nav-back-pill" @click="goBack">
          <uni-icons type="left" size="22" color="#000" />
        </view>
      </template>
      <!-- 别放默认插槽内容，否则会出现在中间标题位 -->
    </zhouWei-navBar>


    <!-- 页面主体 -->
    <calendar-tab />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onPageScroll } from '@dcloudio/uni-app'
import { getStatusBarHeight, getNavBarHeight, toPx } from '@/common/config.js'

/** 让透明导航感知滚动 */
const scrollTop = ref(0)
onPageScroll(e => { scrollTop.value = e?.scrollTop || 0 })

/** 顶部占位高度 = 状态栏安全距离 + 导航条高度 */
const headerPadPx = computed(() => toPx(getStatusBarHeight() + getNavBarHeight()))

/** 返回：有历史就后退，没历史就回首页（可按需修改） */
function goBack() {
  const pages = getCurrentPages?.() || []
  if (pages.length > 1) {
    uni.navigateBack({ delta: 1 })
  } else {
    // 没有可返回页面时的兜底行为
    uni.switchTab({ url: '/pages/index/index' })
  }
}
</script>

<style lang="less" scoped>
.calendar-page {
  min-height: 100vh;
  background: #f8faff;
}

.nav-placeholder { width: 100%; }

/* 你原有的 tab 样式保留 */
.main-tab{
  display:flex;
  padding: 18rpx 30rpx 0;
  .tab{
    flex:1; text-align:center; padding: 24rpx 0; font-size: 32rpx; color:#666; position:relative;
    &.active{ color:#7dc3d3; font-weight:700; }
    .bar{ position:absolute; left:50%; transform:translateX(-50%); bottom:0; width: 92rpx; height: 8rpx; border-radius:4rpx; background:#7dc3d3;}
  }
}

.content-wrap{ min-height: 80vh; background:#f8faff; border-radius: 36rpx 36rpx 0 0; }

/* 顶部返回的小胶囊 */
.nav-back-pill{
	margin-left: 15rpx;
}
</style>
