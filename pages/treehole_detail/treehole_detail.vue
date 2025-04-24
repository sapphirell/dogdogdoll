<template>
  <view class="container" v-if="detailData">
    <!-- 头部作者信息 -->
    <view class="header">
      <view class="author-info">
        <image :src="detailData.avatar || '/static/noname.png' " class="avatar" mode="aspectFill" />
		<view style="width: 500rpx;">
			<text class="author-name">{{ detailData.author_name }}</text>
			    <view class="time">{{ formatTime(detailData.created_at) }}</view>
		</view>
  
      </view>
      <button class="share-btn" open-type="share">
        <image src="/static/images/share-icon.png" class="share-icon" />
      </button>
    </view>

    <!-- 正文内容 -->
    <view class="content">{{ detailData.content }}</view>

    <!-- 图片展示区域 -->
    <view class="image-container" :class="layoutClass">
      <view 
        v-for="(img, index) in displayImages" 
        :key="index" 
        class="image-wrapper"
      >
        <image 
          :src="img" 
          mode="aspectFill" 
          class="image-item"
          @click="previewImage(index)"
        />
        <view v-if="showOverlay && index === 8" class="image-overlay">
          +{{ remainingCount }}
        </view>
      </view>
    </view>

    <!-- 时间信息 -->

  </view>

  <!-- 加载状态 -->
  <view v-else class="loading">加载中...</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { websiteUrl, image1Url } from '../../common/config.js';

const props = defineProps({
  id: {
    type: String,
    required: true
  }
});

const detailData = ref(null);

// 图片显示逻辑
const displayImages = computed(() => {
  return detailData.value?.images?.slice(0, 9) || [];
});

const remainingCount = computed(() => {
  return (detailData.value?.images?.length || 0) - 9;
});

const showOverlay = computed(() => {
  return (detailData.value?.images?.length || 0) > 9;
});

// 设置标题
uni.setNavigationBarTitle({
	title: '投稿详情'
})


const layoutClass = computed(() => {
  const count = displayImages.value.length;
  if (count === 1) return 'single';
  if (count === 2) return 'double';
  return 'multi';
});

// 时间格式化
const formatTime = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

// 预览图片
const previewImage = (index) => {
  uni.previewImage({
    current: index,
    urls: detailData.value.images
  });
};

// 获取数据
onMounted(async () => {
  try {
    const res = await uni.request({
      url: `${websiteUrl}/treehole-detail?id=${props.id}`
    });
    
    if (res.data.status === 'success') {
      detailData.value = res.data.data;
    }
  } catch (error) {
	  console.log(error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    });
  }
});

// 分享功能
// uni.onShareAppMessage(() => {
//   return {
//     title: detailData.value?.author_name + '的树洞',
//     path: `/pages/treehole/detail?id=${props.id}`
//   };
// });
</script>

<style lang="less">
.container {
  padding: 30rpx;
  background: #fff;
}

.loading {
  text-align: center;
  padding: 40rpx;
  color: #999;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.author-info {
  display: flex;
  align-items: center;
  flex: 1;
  overflow: hidden;
  padding-bottom: 10rpx;

  .avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    margin-right: 20rpx;
  }

  .author-name {
    font-size: 24rpx;
	font-weight: 800;
    color: #333;
    max-width: 70%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.share-btn {
  background: none;
  padding: 0;
  margin: 0;
  
  .share-icon {
    width: 40rpx;
    height: 40rpx;
  }
  
  &::after {
    border: none;
  }
}

.content {
  font-size: 22rpx;
  color: #333;
  line-height: 1.6;
  margin-bottom: 30rpx;
}

.image-container {
  margin-bottom: 30rpx;

  &.single {
    .image-wrapper {
      width: 100%;
      padding-bottom: 100%;
    }
  }

  &.double {
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;

    .image-wrapper {
      width: calc(50% - 5rpx);
      padding-bottom: 50%;
    }
  }

  &.multi {
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;

    .image-wrapper {
      width: calc(33.333% - 7rpx);
      padding-bottom: 33.333%;
      position: relative;
    }
  }
}

.image-wrapper {
  position: relative;
  border-radius: 10rpx;
  overflow: hidden;
  background: #f5f5f5;
}

.image-item {
  position: absolute;
  width: 100%;
  height: 100%;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 36rpx;
}

.time {
  font-size: 24rpx;
  color: #999;
}
</style>
