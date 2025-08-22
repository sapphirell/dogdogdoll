<template>
	<view>
		
		<!-- 功能按钮区域 -->
		<view class="function-section">
			<view class="function-item" @click="navigateTo('makeupGallery')">
				<view class="function-icon">
					<uni-icons type="color" size="24" color="#3c3b48"></uni-icons>
				</view>
				<view class="function-info">
					<text class="function-title">设置妆图展示</text>
					<text class="function-desc">管理你的妆面作品展示</text>
				</view>
				<view class="function-arrow">
					<uni-icons type="arrowright" size="20" color="#999"></uni-icons>
				</view>
			</view>
			<view class="function-item" @click="navigateTo('wigGallery')">
				<view class="function-icon">
					<uni-icons type="headphones" size="24" color="#3c3b48"></uni-icons>
				</view>
				<view class="function-info">
					<text class="function-title">设置假毛展示</text>
					<text class="function-desc">管理你的假发作品展示</text>
				</view>
				<view class="function-arrow">
					<uni-icons type="arrowright" size="20" color="#999"></uni-icons>
				</view>
			</view>
			<view class="function-item" @click="navigateTo('profileEdit')">
				<view class="function-icon">
					<uni-icons type="person" size="24" color="#3c3b48"></uni-icons>
				</view>
				<view class="function-info">
					<text class="function-title">编辑个人信息</text>
					<text class="function-desc">修改个人资料和联系方式</text>
				</view>
				<view class="function-arrow">
					<uni-icons type="arrowright" size="20" color="#999"></uni-icons>
				</view>
			</view>
			<view class="function-item" @click="navigateTo('orderPlan')">
				<view class="function-icon">
					<uni-icons type="calendar" size="24" color="#3c3b48"></uni-icons>
				</view>
				<view class="function-info">
					<text class="function-title">发布接单计划</text>
					<text class="function-desc">设置你的接单时间和规则</text>
				</view>
				<view class="function-arrow">
					<uni-icons type="arrowright" size="20" color="#999"></uni-icons>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { websiteUrl } from '@/common/config.js'


const activeTab = ref('')
const formData = ref({})

// 页面跳转
const navigateTo = (type) => {
  let url = ''
  switch(type) {
    case 'makeupGallery':
      url = '/pages/creator_base/set_showcase/set_showcase'
      break
    case 'wigGallery':
		uni.showToast({
			title: "将在下一个版本支持",
			icon: 'none'
		})
      // url = '/pages/artist/wigGallery'
      break
    case 'profileEdit':
      url = '/pages/creator_base/artist_info/artist_info'
      break
    case 'orderPlan':
      url = '/pages/creator_base/order_plane/order_plane'
      break
    default:
      return
  }
  
  uni.navigateTo({
    url: url
  })
}

// 获取创作者信息
const fetchArtistInfo = async () => {
  const token = uni.getStorageSync('token')
  if (!token) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    return
  }
  uni.showLoading({
    title: '加载中...'
  })
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/brand-manager/get-artist-info`,
      method: 'GET',
      header: {
        Authorization: token
      }
    })
    if (res.data.status === 'success') {
      console.log(res.data.data)
      const data = res.data.data
      formData.value = {
        artist_highlight_images: data.artist_highlight_images || [],
        hairstylist_highlight_images: data.hairstylist_highlight_images || [],
        status_of_artist: Number(data.status_of_artist) || 0,
        status_of_hairstylist: Number(data.status_of_hairstylist) || 0,
        base_price_of_artist: parseFloat(data.base_price_of_artist) || 0,
        base_price_of_hairstylist: parseFloat(data.base_price_of_hairstylist) || 0,
        overload_ratio_of_artist: parseFloat(data.overload_ratio_of_artist) || 1,
        overload_ratio_of_hairstylist: parseFloat(data.overload_ratio_of_hairstylist) || 1,
        rule_of_artist: data.rule_of_artist || '',
        rule_of_hairstylist: data.rule_of_hairstylist || ''
      }
      // 设置身份状态
      isArtist.value = data.status_of_artist > 0
      isHairstylist.value = data.status_of_hairstylist > 0
    } else {
      uni.showToast({
        title: res.data.msg || '获取信息失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('获取创作者信息失败:', error)
    uni.showToast({
      title: '网络请求失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

// 初始化加载数据
onMounted(() => {
  // fetchArtistInfo()
})
</script>

<style lang="less">

/* 功能按钮区域样式 */
.function-section {
  background: white;
  border-radius: 16rpx;
  margin: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}
.function-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
  transition: all 0.2s ease;
  
  &:active {
    background-color: #f9f9f9;
  }
  
  &:last-child {
    border-bottom: none;
  }
}
.function-icon {
  width: 80rpx;
  height: 80rpx;
  margin-right: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  
  image {
    width: 60rpx;
    height: 60rpx;
  }
}
.function-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.function-title {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 8rpx;
}
.function-desc {
  font-size: 24rpx;
  color: #999;
}
.function-arrow {
  margin-left: 20rpx;
}
</style>