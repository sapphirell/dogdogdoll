<template>
  <view class="container">
    <!-- 分类导航 -->
    <view class="nav-bar">
      <view 
        v-for="(item, index) in categories" 
        :key="index"
        class="nav-item"
        :class="{ active: activeCategory === item.type }"
        @click="switchCategory(item.type)"
      >
        {{ item.name }}
      </view>
    </view>

    <!-- 列表内容 -->
    <scroll-view 
      class="scroll-view"
      scroll-y
      @scrolltolower="loadMore"
      :show-scrollbar="false"
    >
      <view class="list-container">
        <block v-for="(item, index) in currentList" :key="item.id">
          <!-- 商品类型 -->
          <view 
            v-if="activeCategory === 1 && item.goods"
            class="list-item"
            @click="navigateToGoods(item.goods.id)"
          >
            <image 
              class="item-image"
              :src="getFirstImage(item.goods.goods_images)"
              mode="aspectFill"
            />
            <text class="item-title">{{ item.goods.name }}</text>
          </view>

          <!-- 品牌类型 -->
          <view 
            v-if="activeCategory === 2 && item.brand"
            class="list-item"
            @click="navigateToBrand(item.brand.id)"
          >
            <image 
              class="item-image brand-image"
              :src="item.brand.logo_image"
              mode="aspectFit"
            />
            <text class="item-title">{{ item.brand.brand_name }}</text>
          </view>

          <!-- 搭配类型 -->
          <view 
            v-if="activeCategory === 3 && item.collocation"
            class="list-item"
            @click="navigateToCollocation(item.collocation.id)"
          >
            <image 
              class="item-image"
              :src="getFirstCollocationImage(item.collocation.image_urls)"
              mode="aspectFill"
            />
            <text class="item-title">{{ item.collocation.title }}</text>
          </view>

          <!-- 展示柜类型 -->
          <view 
            v-if="activeCategory === 4 && item.showcase"
            class="list-item"
            @click="navigateToShowcase(item.showcase.id)"
          >
            <image 
              class="item-image"
              :src="getFirstImage(item.showcase.image_urls)"
              mode="aspectFill"
            />
            <text class="item-title">{{ item.showcase.name }}</text>
          </view>
        </block>

        <!-- 加载状态 -->
        <view class="loading-status">
          <text v-if="loading" class="loading-text">加载中...</text>
          <text v-if="noMore" class="no-more-text">没有更多了</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { 
  websiteUrl,
  image1Url,
  asyncGetUserInfo
} from "../../common/config.js"

const categories = ref([
  { type: 1, name: '商品' },
  { type: 2, name: '品牌' },
  { type: 3, name: '搭配' },
  { type: 4, name: '展示柜' }
])

const activeCategory = ref(1)
const currentList = ref([])
const loading = ref(false)
const noMore = ref(false)

// 分页数据
const pagination = reactive({
  page: 1,
  page_size: 8,
  total: 0
})

// 初始化加载
onMounted(async () => {
  await checkLogin()
  loadData()
})

// 检查登录状态
const checkLogin = async () => {
  const userInfo = await asyncGetUserInfo()
  if (!userInfo) {
    uni.navigateTo({ url: '/pages/login/login' })
  }
}

// 切换分类
const switchCategory = (type) => {
  if (activeCategory.value === type) return
  activeCategory.value = type
  resetPagination()
  loadData()
}

// 加载数据
const loadData = async () => {
  if (loading.value || noMore.value) return
  
  loading.value = true
  try {
    const res = await uni.request({
      url: `${websiteUrl}/with-state/user-likes`,
      method: 'GET',
      data: {
        type: activeCategory.value,
        page: pagination.page,
        page_size: pagination.page_size
      },
      header: {
        Authorization: uni.getStorageSync('token')
      }
    })

    if (res.data.status === 'success') {
      const newData = res.data.data.list
      currentList.value = [...currentList.value, ...newData]
      pagination.total = res.data.data.total
      
	  // 如果res.data.data.list.length是0 ，则说明没有更多数据了
	  if (!res.data.data.list.length) {
		  noMore.value = true
	  }else {
		  noMore.value = false
	  }
      
      pagination.page += 1
    }
  } catch (error) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// 加载更多
const loadMore = () => {
  if (!noMore.value) {
    loadData()
  }else {
	  console.log("no more")
  }
}

// 重置分页
const resetPagination = () => {
  pagination.page = 1
  currentList.value = []
  noMore.value = false
}

// 获取第一张图片
const getFirstImage = (images) => {
  return images?.length > 0 ?images[0] : ``
}

// 处理搭配图片
const getFirstCollocationImage = (images) => {
  const url = images?.split(',')[0] || ''
  return url ? url : ``
}

// 跳转方法
const navigateToGoods = (id) => {
  uni.navigateTo({ url: `/pages/goods/goods?goods_id=${id}` })
}

const navigateToBrand = (id) => {
  uni.navigateTo({ url: `/pages/brand/brand?brand_id=${id}` })
}

const navigateToCollocation = (id) => {
  uni.navigateTo({ url: `/pages/collocation/detail?id=${id}` })
}

const navigateToShowcase = (id) => {
  uni.navigateTo({ url: `/pages/showcase/detail?id=${id}` })
}
</script>

<style lang="less" scoped>
.container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.nav-bar {
  display: flex;
  height: 90rpx;
  background: #fff;
  border-bottom: 1rpx solid #eee;
  
  .nav-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30rpx;
    color: #666;
    
    &.active {
      color: #ff6a6c;
      font-weight: bold;
      position: relative;
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60rpx;
        height: 4rpx;
        background: #ff6a6c;
      }
    }
  }
}

.scroll-view {
  flex: 1;
  box-sizing: border-box;
  padding: 20rpx;
  flex: 1; // 使用 flex 填充剩余空间
  height: 1px; // 兼容性写法（重要）
}

.list-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.list-item {
  width: 345rpx;
  margin-bottom: 20rpx;
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  
  .item-image {
    width: 100%;
    height: 345rpx;
    background: #f5f5f5;
    
    &.brand-image {
		width: 300rpx;
      height: 200rpx;
	  padding: 40rpx;
      background: #fff;
    }
  }
  
  .item-title {
    display: block;
    padding: 20rpx;
    font-size: 28rpx;
    color: #333;
    line-height: 1.4;
    .line-clamp(2);
	text-align: center;
  }
}

.loading-status {
  width: 100%;
  padding: 30rpx 0;
  text-align: center;
  font-size: 26rpx;
  color: #999;
  
  .loading-text {
    // &::before {
    //   content: '⏳';
    //   margin-right: 10rpx;
    // }
  }
  
  .no-more-text {
    &::before {
      content: '—';
      margin-right: 10rpx;
    }
    &::after {
      content: '—';
      margin-left: 10rpx;
    }
  }
}

.line-clamp(@lines) {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: @lines;
  overflow: hidden;
}
</style>
