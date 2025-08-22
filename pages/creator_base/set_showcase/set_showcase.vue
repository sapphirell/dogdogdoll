<template>
  <view class="artist-container">
    <!-- 顶部Tab切换 -->
    <view class="tabs">
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'highlight' }"
        @click="switchTab('highlight')"
      >
        展示图
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'faceup' }"
        @click="switchTab('faceup')"
      >
        妆图列表
      </view>
    </view>

    <!-- 展示图Tab -->
    <view v-if="activeTab === 'highlight'" class="highlight-tab">
      <!-- 展示图列表 -->
      <scroll-view class="highlight-scroll" scroll-y>
        <view class="highlight-list">
          <view v-for="(img, index) in artistInfo.artist_highlight_images" :key="index" class="highlight-item">
            <image 
              :src="img" 
              mode="aspectFill" 
              class="highlight-img"
              @click="previewImage(img)"
            ></image>
            <view class="highlight-actions">
              <uni-icons 
                type="trash" 
                size="24" 
                color="#ff4d6a" 
                @click="deleteHighlight(index)"
              ></uni-icons>
            </view>
          </view>
        </view>
      </scroll-view>

      <!-- 添加按钮 -->
      <view class="add-btn" @click="handleUploadHighlight">
        <uni-icons type="plus" size="24" color="#fff"></uni-icons>
        <text>添加展示图</text>
      </view>
      
      <!-- 上传进度提示 -->
      <view class="upload-progress" v-if="uploading">
        <progress 
          :percent="uploadProgress" 
          stroke-width="4" 
          activeColor="#4a9db5"
        />
        <text>{{ uploadStatusText }}</text>
      </view>
    </view>

    <!-- 妆图列表Tab -->
    <view v-else class="faceup-tab">
      <!-- 妆图列表 -->
      <scroll-view class="faceup-scroll" scroll-y>
        <view class="faceup-list">
          <view 
            v-for="(item, index) in faceupList" 
            :key="item.id" 
            class="faceup-item"
            @click="navigateToEditFaceup(item.id)"
          >
            <image :src="item.image_urls[0]" mode="aspectFill" class="faceup-img"></image>
            <view class="faceup-info">
              <text class="faceup-head">{{ item.head_name }}</text>
              <view class="faceup-tags">
                <view 
                  v-for="(tag, tagIndex) in item.style_tags" 
                  :key="tagIndex" 
                  class="tag"
                >
                  {{ tag }}
                </view>
              </view>
              <view class="faceup-meta">
                <text class="sex" :class="item.sex === '男' ? 'male' : 'female'">
                  {{ item.sex }}
                </text>
                <text class="date">{{ formatDate(item.created_at) }}</text>
              </view>
            </view>
            <uni-icons type="arrowright" size="20" color="#999"></uni-icons>
          </view>
        </view>
      </scroll-view>

      <!-- 添加按钮 -->
      <view class="add-btn" @click="navigateToAddFaceup">
        <uni-icons type="plus" size="24" color="#fff"></uni-icons>
        <text>添加妆图</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { websiteUrl } from "@/common/config.js";
import { chooseImageList, getQiniuToken, uploadImageToQiniu } from '@/common/image.js';

// 当前激活的Tab
const activeTab = ref('highlight');

// 艺术家信息
const artistInfo = ref({
  artist_id: 0,
  brand_id: 0,
  brand_name: '',
  description: '',
  logo_image: '',
  artist_highlight_images: [],
  status_of_artist: 0,
  status_of_artist_text: '',
  status_of_hairstylist: 0,
  status_of_hairstylist_text: ''
});

// 妆图列表
const faceupList = ref([]);
const currentPage = ref(1);
const pageSize = ref(20);
const hasMore = ref(true);

// 当前品牌ID
const brandId = ref(0);

// 上传状态
const uploading = ref(false);
const uploadProgress = ref(0);
const uploadStatusText = ref('');

// 切换Tab
const switchTab = (tab) => {
  activeTab.value = tab;
  if (tab === 'faceup' && faceupList.value.length === 0) {
    fetchFaceupList();
  }
};

// 获取当前品牌ID
const fetchBrandInfo = async () => {
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/brand-manager/get-artist-info`,
      method: 'GET',
      header: {
        'Authorization': `${uni.getStorageSync('token')}`
      }
    });
    
    if (res.data.status === 'success' && res.data.data) {
      brandId.value = res.data.data.brand_id;
      
      // 获取艺术家信息
      await fetchArtistInfo();
    } else {
      uni.showToast({
        title: '获取品牌信息失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('获取品牌信息失败:', error);
    uni.showToast({
      title: '获取品牌信息失败',
      icon: 'none'
    });
  }
};

// 获取艺术家信息
const fetchArtistInfo = async () => {
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/brand-manager/get-artist-info`,
      method: 'GET',
      header: {
        'Authorization': `${uni.getStorageSync('token')}`
      }
    });
    
    if (res.data.status === 'success' && res.data.data) {
      const data = res.data.data;
      // 更新艺术家信息，使用 artist_highlight_images
      artistInfo.value = {
        ...artistInfo.value,
        brand_id: data.brand_id,
        artist_highlight_images: data.artist_highlight_images || []
      };
	  brandId.value = data.brand_id
    } else {
      uni.showToast({
        title: '获取艺术家信息失败',
        icon: 'none'
      });
    }
  } catch (error) {
    uni.showToast({
      title: '网络错误',
      icon: 'none'
    });
  }
};

// 获取妆图列表
const fetchFaceupList = async () => {
  if (!brandId.value) {
	  console.log("无Brand_id")
	  return
  }
  
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/brand-artist/bjd-faceup?brand_id=${brandId.value}&page=${currentPage.value}&size=${pageSize.value}`,
      method: 'GET'
    });
    
    if (res.data.status === 'success') {
      const newList = res.data.data.list.map(item => ({
        ...item,
        // 确保image_urls是数组格式
        image_urls: Array.isArray(item.image_urls) 
          ? item.image_urls 
          : (item.image_urls || '').split(',')
      }));
      
      if (currentPage.value === 1) {
        faceupList.value = newList;
      } else {
        faceupList.value = [...faceupList.value, ...newList];
      }
      hasMore.value = faceupList.value.length < res.data.data.total;
    } else {
      uni.showToast({
        title: '获取妆图列表失败',
        icon: 'none'
      });
    }
  } catch (error) {
    uni.showToast({
      title: '网络错误',
      icon: 'none'
    });
  }
};

// 处理展示图上传
const handleUploadHighlight = async () => {
  try {
    const tempFilePaths = await chooseImageList(1);
    if (!tempFilePaths || tempFilePaths.length === 0) return;
    uploading.value = true;
    uploadStatusText.value = '准备上传...';
    uploadStatusText.value = '获取上传凭证...';
    const qiniuTokenData = await getQiniuToken();
    if (!qiniuTokenData || !qiniuTokenData.token) {
      throw new Error('获取上传凭证失败');
    }
    const filePath = tempFilePaths[0];
    uploadStatusText.value = '上传中...';
    uploadProgress.value = 50;
    const fileName = qiniuTokenData.path;
    const result = await uploadImageToQiniu(
      filePath,
      qiniuTokenData.token,
      fileName
    );
    if (result && result.imageUrl) {
      // 添加到展示图列表 - 使用 artist_highlight_images
      artistInfo.value.artist_highlight_images.push(result.imageUrl);
      uploadProgress.value = 100;
      
      await updateArtistHighlights();
      
      uni.showToast({
        title: '上传成功',
        icon: 'success'
      });
    }
  } catch (error) {
    console.error('上传图片失败:', error);
    uni.showToast({
      title: '上传图片失败',
      icon: 'none'
    });
  } finally {
    uploading.value = false;
    uploadProgress.value = 0;
  }
};

// 更新艺术家展示图
const updateArtistHighlights = async () => {
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/brand-manager/update-highlight-images`,
      method: 'POST',
      data: {
        brand_id: artistInfo.value.brand_id,
        artist_highlight_images: artistInfo.value.artist_highlight_images.join(',')
      },
      header: {
        'Authorization': `${uni.getStorageSync('token')}`
      }
    });
    
    if (res.data.status !== 'success') {
      console.error('更新展示图失败:', res.data.msg);
    }
	  fetchArtistInfo();
  } catch (error) {
    console.error('更新展示图失败:', error);
  }
};

// 预览图片
const previewImage = (url) => {
  uni.previewImage({
    current: url,
    urls: artistInfo.value.artist_highlight_images
  });
};

// 删除展示图
const deleteHighlight = async (index) => {
  uni.showModal({
    title: '提示',
    content: '确定要删除这张展示图吗？',
    success: async (res) => {
      if (res.confirm) {
        artistInfo.value.artist_highlight_images.splice(index, 1);
        await updateArtistHighlights();
        uni.showToast({
          title: '删除成功',
          icon: 'success'
        });
      }
    }
  });
};

// 格式化日期
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};

// 跳转到添加妆图页面
const navigateToAddFaceup = () => {
  uni.navigateTo({
    url: `/pages/creator_base/faceup_editor/faceup_editor`
  });
};

// 跳转到编辑妆图页面
const navigateToEditFaceup = (id) => {
  uni.navigateTo({
    url: `/pages/creator_base/faceup_editor/faceup_editor?id=${id}`
  });
};

// 初始化
onMounted(() => {
  uni.setNavigationBarTitle({
    title: "作品展示设置"
  });
  // 首先获取品牌信息
  fetchArtistInfo();
});
</script>

<style lang="less" scoped>
.artist-container {
  padding: 20rpx;
  background-color: #f8f8f8;
  min-height: 100vh;
}

/* Tab样式 */
.tabs {
  display: flex;
  background-color: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  font-size: 30rpx;
  color: #666;
  position: relative;
  
  &.active {
    color: #333;
    font-weight: bold;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 80rpx;
      height: 6rpx;
      background: linear-gradient(90deg, #8fecff, #c1ddff);;
      border-radius: 4rpx;
    }
  }
}

/* 展示图Tab样式 */
.highlight-scroll {
  height: calc(100vh - 240rpx);
}

.highlight-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.highlight-item {
  position: relative;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.highlight-img {
  width: 100%;
  height: 320rpx;
}

.highlight-actions {
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 10rpx;
  background-color: rgba(0, 0, 0, 0.5);
  border-top-left-radius: 16rpx;
}

/* 妆图列表Tab样式 */
.faceup-scroll {
  height: calc(100vh - 240rpx);
}

.faceup-list {
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.faceup-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
  
  &:active {
    background-color: #f9f9f9;
  }
}

.faceup-img {
  width: 120rpx;
  height: 120rpx;
  border-radius: 8rpx;
  margin-right: 20rpx;
}

.faceup-info {
  flex: 1;
}

.faceup-head {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.faceup-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-bottom: 10rpx;
}

.tag {
  font-size: 22rpx;
  color: #666;
  background-color: #f5f5f5;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
}

.faceup-meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.sex {
  font-size: 22rpx;
  padding: 2rpx 12rpx;
  border-radius: 20rpx;
  
  &.male {
    background-color: #E8F5FF;
    color: #1890FF;
  }
  
  &.female {
    background-color: #FFEEF2;
    color: #FF4D6A;
  }
}

.date {
  font-size: 22rpx;
  color: #999;
}

/* 添加按钮 */
.add-btn {
  position: fixed;
  bottom: 40rpx;
  right: 40rpx;
  color: #fff;
  padding: 16rpx 24rpx;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #8fecff, #c1ddff);
  color: #2c3e50;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
  
  text {
    margin-left: 8rpx;
    font-size: 26rpx;
	  color: #fff;
  }
  
  &:active {
    opacity: 0.9;
    transform: scale(0.98);
  }
}

/* 上传进度提示 */
.upload-progress {
  margin-top: 20rpx;
  padding: 20rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  
  progress {
    width: 100%;
    margin-bottom: 10rpx;
  }
  
  text {
    display: block;
    text-align: center;
    font-size: 24rpx;
    color: #666;
  }
}
</style>
