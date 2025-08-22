<!-- components/bottom-popup.vue -->
<template>
  <view>
    <!-- 遮罩层 -->
    <view 
      v-if="show" 
      class="mask" 
      :class="{'mask-show': show}" 
      @tap="closePopup"
	  @touchmove.stop.prevent="moveHandle"
    ></view>
    
    <!-- 弹窗内容 -->
    <view 
      class="popup-container" 
      :class="{'popup-show': show}"
	  @touchmove.stop.prevent="moveHandle"
    >
      <!-- 关闭按钮 -->
  <!--    <view class="close-btn" @tap="closePopup">
        <uni-icons type="closeempty" size="24" color="#666"></uni-icons>
      </view> -->
      
      <!-- 插槽内容 -->
      <slot></slot>
    </view>
  </view>
</template>

<script>
  export default {
    name: 'BottomPopup',
    props: {
      show: {
        type: Boolean,
        default: false
      }
    },
	watch: {
	  show(newVal) {
	    if (typeof uni === 'undefined') return;
	    
	    // 获取运行环境
	    const platform = uni.getSystemInfoSync().platform;
	    const isApp = platform === 'android' || platform === 'ios';
	    
	    if (isApp) {
	      if (newVal) {
	        // 弹窗显示时隐藏tab-bar
	        uni.hideTabBar();
	      } else {
	        // 弹窗隐藏时显示tab-bar
	        uni.showTabBar();
	      }
	    }
	  }
	},
    methods: {
      closePopup() {
        this.$emit('close');
      },
	  moveHandle() {
	  	return false;
	  },
    }
  };
</script>

<style lang="scss" scoped>
  .mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 998;
    opacity: 0;
    transition: opacity 0.3s ease;
    
    &.mask-show {
      opacity: 1;
    }
  }
  
  .popup-container {
    position: fixed;
    bottom: -100%;
    left: 0;
    right: 0;
    background-color: #fff;
    border-radius: 24rpx 24rpx 0 0;
    padding: 30rpx;
    z-index: 999;
    box-shadow: 0 -2rpx 20rpx rgba(0, 0, 0, 0.1);
    transition: bottom 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    
    &.popup-show {
      bottom: 0;
    }
  }
  
  .close-btn {
    position: absolute;
    top: 20rpx;
    right: 20rpx;
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
    z-index: 1000;
  }
</style>
