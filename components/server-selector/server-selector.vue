<template>
  <!-- 触发按钮 - 只显示延迟时间 -->
  <view class="server-selector-trigger" @click="showModal = true">
    <uni-icons type="paperplane" size="24" color="#5db7ff"></uni-icons>
    <text>{{ currentPing >= 0 ? currentPing + 'ms' : '9999ms' }}</text>
  </view>
  
  <!-- 服务器选择弹窗 -->
  <common-modal :visible="showModal" @update:visible="showModal = $event" top="15vh">
    <view class="server-modal-content">
      <view class="modal-header">
        <text class="title">选择服务器</text>
        <text class="subtitle">点击服务器可切换，当前延迟：{{ currentPing >= 0 ? currentPing + 'ms' : '-1ms' }}</text>
      </view>
      
      <view class="server-list">
        <view 
          v-for="(server, index) in servers" 
          :key="index"
          class="server-item"
          :class="{ 
            active: server.url === selectedServer,
            loading: server.ping === -1
          }"
          @click="selectServer(server)"
        >
          <view class="server-info">
            <text class="name">{{ server.name }}</text>
          </view>
          
          <view class="ping-info">
            <uni-icons v-if="server.ping === -1" type="spinner-cycle" size="16" color="#999" class="spinner"></uni-icons>
            <text v-else-if="server.ping === -2" class="ping-error">请求失败</text>
            <text v-else class="ping-value">{{ server.ping }} ms</text>
          </view>
        </view>
      </view>
    </view>
  </common-modal>
</template>

<script setup>
import { ref, reactive, watch, onMounted, onUnmounted } from 'vue';
import { cnURL, usURL, devUrl, websiteUrl } from '@/common/config.js';

// 服务器列表
const servers = reactive([
  { 
    name: '中国', 
    url: cnURL, 
    ping: -1 // -1: 测试中, -2: 失败, >0: 延迟
  },
  { 
    name: '美国', 
    url: usURL, 
    ping: -1 
  },
  { 
    name: 'Localhost', 
    url: devUrl, 
    ping: -1 
  }
]);

const showModal = ref(false);
const selectedServer = ref('');
const currentPing = ref(-1); // 初始为测试中状态
let pingInterval = null; // 存储定时器

// 定义emit事件
const emit = defineEmits(['server-change']);

// 组件挂载时从本地存储加载已选择的服务器
onMounted(() => {
  const savedServer = uni.getStorageSync('selectedServer');
  selectedServer.value = savedServer || cnURL;
  websiteUrl.value = selectedServer.value; // 更新全局websiteUrl.value
  
  // 挂载后立即测试当前服务器的延迟
  testCurrentServer();
  
  // 启动5秒一次的定时ping
  startPingInterval();
});

onUnmounted(() => {
  // 组件卸载时清除定时器
  clearInterval(pingInterval);
});

// 启动定时ping
const startPingInterval = () => {
  pingInterval = setInterval(() => {
    testCurrentServer();
  }, 5000); // 每5秒执行一次
};

// 测试当前服务器的延迟
const testCurrentServer = async () => {
  try {
    const startTime = Date.now();
    await pingServer(selectedServer.value);
    currentPing.value = Date.now() - startTime;
  } catch (error) {
    currentPing.value = -2; // 测试失败
  }
};

// 监听弹窗显示状态，显示时测试所有服务器
watch(showModal, (newVal) => {
  if (newVal) {
    pingAllServers();
  }
});

// 测试所有服务器
const pingAllServers = async () => {
  for (const server of servers) {
    server.ping = -1; // 设置为测试中状态
    try {
      const startTime = Date.now();
      await pingServer(server.url);
      server.ping = Date.now() - startTime;
      
      // 更新当前服务器的延迟
      if (server.url === selectedServer.value) {
        currentPing.value = server.ping;
      }
    } catch (error) {
      server.ping = -2; // 请求失败
      
      // 如果是当前服务器测试失败
      if (server.url === selectedServer.value) {
        currentPing.value = -2;
      }
    }
  }
};

// Ping单个服务器
const pingServer = (url) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${url}/ping`,
      method: 'GET',
      timeout: 5000, // 5秒超时
      success: () => resolve(),
      fail: () => reject()
    });
  });
};

// 选择服务器
const selectServer = (server) => {
  if (server.ping === -2) {
    uni.showToast({
      title: '服务器连接失败，无法选择',
      icon: 'none'
    });
    return;
  }
  
  selectedServer.value = server.url;
  websiteUrl.value = server.url; // 更新全局websiteUrl.value
  uni.setStorageSync('selectedServer', server.url);
  
  // 更新当前延迟显示
  currentPing.value = server.ping;
  
  uni.showToast({
    title: `已切换到${server.name}`,
    icon: 'success'
  });
  
  // 关闭弹窗
  showModal.value = false;
  
  // 触发选择事件
  emit('server-change', {
    server: server,
    ping: server.ping
  });
};
</script>


<style lang="less">
.server-selector-trigger {
  display: flex;
  align-items: center;
  padding: 10rpx 20rpx;
  background-color: #f0f4ff;
  border-radius: 50rpx;
  font-size: 28rpx;
  color: #5db7ff;
  position: fixed;
  bottom: 160rpx;
  right: 30rpx;
  z-index: 99;
  box-shadow: 0 4rpx 15rpx rgba(93, 183, 255, 0.3);
  
  text {
    margin-left: 10rpx;
    font-weight: 500;
  }
}

.server-modal-content {
  padding: 30rpx;
  width: 500rpx;
  
  .modal-header {
    margin-bottom: 30rpx;
    
    .title {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
      display: block;
      margin-bottom: 10rpx;
    }
    
    .subtitle {
      font-size: 26rpx;
      color: #666;
    }
  }
  
  .server-list {
    .server-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 25rpx 30rpx;
      margin-bottom: 20rpx;
      background-color: #f8faff;
      border-radius: 16rpx;
      border: 2rpx solid #e8ecff;
      transition: all 0.3s ease;
      
      &.active {
        background-color: #e6f3ff;
        border-color: #5db7ff;
        box-shadow: 0 4rpx 10rpx rgba(93, 183, 255, 0.2);
      }
      
      &.loading {
        opacity: 0.8;
      }
      
      .server-info {
        flex: 1;
        
        .name {
          display: block;
          font-size: 32rpx;  // 稍微加大字体
          font-weight: 500;
          color: #333;
        }
        
        /* 移除了URL样式 */
      }
      
      .ping-info {
        font-size: 28rpx;
        font-weight: 500;
        min-width: 120rpx;
        text-align: right;
        
        .ping-value {
          color: #5db7ff;
        }
        
        .ping-error {
          color: #ff6b6b;
        }
        
        .spinner {
          animation: rotate 1.5s linear infinite;
        }
      }
    }
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
