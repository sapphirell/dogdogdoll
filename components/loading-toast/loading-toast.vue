<template>
  <!-- 使用v-show而不是v-if以获得更好的性能 -->

  <view class="loading-container" v-if="props.show">
    <!-- 半透明黑色遮罩层 -->
    <view class="loading-mask"></view>
    
    <!-- 加载动画内容 -->
    <view class="loading-content">
      <image 
        class="loading-gif" 
		src="/static/loading.gif"
        mode="aspectFit"
      />
      <text class="loading-text" v-if="text">{{ text }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';

// 定义组件属性
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },

  text: {
    type: String,
    default: '助手加载中...'
  }
});


</script>

<style lang="less" scoped>
.loading-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  
  .loading-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    // background-color: rgba(0, 0, 0, 0.39); // 半透明黑色背景
    // backdrop-filter: blur(4px); // 背景模糊效果
  }
  
  .loading-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30rpx;
    border-radius: 20rpx;
    background: rgba(30, 30, 30, 0.7); // 稍深的背景
    box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.3);
	backdrop-filter: blur(4px); // 背景模糊效果
    
    .loading-gif {
      width: 220rpx;
      height: 220rpx;
    }
    
    .loading-text {
      margin-top: 20rpx;
      color: #fff;
      font-size: 28rpx;
      text-align: center;
      font-weight: 1000;
      letter-spacing: 1rpx;
    }
  }
}
</style>
