<template>
  <view class="container">
	  <view-logs />
    <!-- 加载状态 -->
    <view v-if="loading" class="loading-wrapper">
      <uni-load-more status="loading"></uni-load-more>
    </view>

    <!-- 错误提示 -->
    <view v-else-if="error" class="error-wrapper">
      <uni-icons type="info" size="24" color="#ff4d4f"></uni-icons>
      <text class="error-text">{{ error }}</text>
      <button class="retry-btn" @tap="fetchMessageDetail">重试</button>
    </view>

    <!-- 内容区域 -->
    <scroll-view v-else class="content-wrapper" scroll-y>
      <!-- 封面图 -->
      <image 
        class="cover-image" 
        :src="messageDetail.cover_image" 
        mode="widthFix" 
        lazy-load
      />

      <view class="main-content">
        <!-- 标题和时间 -->
        <view class="header">
          <text class="title">{{ messageDetail.title }}</text>
          <text class="time">{{ formatTime(messageDetail.created_at) }}</text>
        </view>

        <!-- 消息正文 -->
        <view class="message-content">
          <text class="message-text">{{ messageDetail.msg }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { websiteUrl, asyncGetUserInfo } from '../../common/config.js';

const props = defineProps(["message_id"])
const messageDetail = ref(null);
const loading = ref(true);
const error = ref('');
const messageId = ref('');

// // 获取路由参数
// const getQueryParams = () => {
//   const pages = getCurrentPages();
//   const currentPage = pages[pages.length - 1];
//   messageId.value = currentPage.$page.options?.id || '';
// };

// 获取消息详情
const fetchMessageDetail = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    // 验证必要参数
    if (!messageId.value) {
      error.value = '无效的消息ID';
      return;
    }

    // 验证用户登录状态
    const userInfo = await asyncGetUserInfo();
    if (!userInfo) {
      error.value = '请先登录';
      return;
    }

    const res = await uni.request({
      url: `${websiteUrl}/with-state/message-detail`,
      method: 'GET',
      data: { id: messageId.value },
      header: { Authorization: uni.getStorageSync('token') }
    });

    if (res.data.status === 'success') {
      messageDetail.value = res.data.data;
      // 通知列表页更新已读状态
      uni.$emit('message-status-update', { 
        id: messageId.value,
        is_read: 1
      });
    } else {
      error.value = res.data.msg || '获取详情失败';
    }
  } catch (err) {
    error.value = '请求失败，请检查网络';
    console.error('详情请求失败:', err);
  } finally {
    loading.value = false;
  }
};

// 时间格式化
const formatTime = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('zh-CN', { 
    year: 'numeric',
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(/\//g, '-');
};

onMounted(() => {
	uni.setNavigationBarTitle({
		title: "消息详情"
	})
  messageId.value = props.message_id
  fetchMessageDetail();
});
</script>

<style lang="less">
@primary-color: #2a6af4;
@error-color: #ff4d4f;

.container {
  background: #f5f6f7;
  min-height: 100vh;
}

.loading-wrapper {
  padding: 40rpx 0;
  display: flex;
  justify-content: center;
}

.error-wrapper {
  padding: 80rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .error-text {
    font-size: 28rpx;
    color: @error-color;
    margin: 20rpx 0;
  }
  
  .retry-btn {
    width: 200rpx;
    height: 70rpx;
    line-height: 70rpx;
    background: @primary-color;
    color: white;
    font-size: 28rpx;
    border-radius: 8rpx;
    margin-top: 20rpx;
  }
}

.content-wrapper {
  padding: 30rpx;
  box-sizing: border-box;

  .cover-image {
    width: 100%;
    border-radius: 16rpx;
    margin-bottom: 30rpx;
    background: #f0f0f0;
    min-height: 300rpx;
  }

  .main-content {
    background: white;
    border-radius: 16rpx;
    padding: 32rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);

    .header {
      margin-bottom: 32rpx;

      .title {
        font-size: 36rpx;
        font-weight: 600;
        color: #333;
        line-height: 1.4;
        margin-bottom: 16rpx;
      }

      .time {
        font-size: 24rpx;
        color: #999;
        display: block;
      }
    }

    .message-content {
      .message-text {
        font-size: 30rpx;
        line-height: 1.6;
        color: #666;
        white-space: pre-wrap;
      }
    }
  }
}
</style>
