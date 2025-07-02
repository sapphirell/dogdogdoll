<template>
  <!-- 添加根元素包裹 -->
  <view>
    <scroll-view 
      scroll-y 
      refresher-default-style="none"
      :refresher-enabled="true" 
      :refresher-triggered="triggered"
      :refresher-threshold="threshold"
      refresher-background="#f8f8f8"
      @refresherrefresh="onRefresh"
      @refresherrestore="onRestore"
      @refresherabort="onAbort"
      :style="{ height: scrollHeight }"
      class="scroll-view" 
    >
      <!-- 使用Vue 2兼容的插槽语法 -->
      <view slot="refresher" class="refresh-container" :style="{ height: `${threshold}px` }">
        <view class="refresh-content" :class="{ refreshing: triggered }">
          <image 
            class="refresh-icon" 
            :src="triggered ? refreshingGif : pullDownGif" 
            mode="aspectFit"
          />
          <text class="refresh-text">{{ refreshText }}</text>
        </view>
      </view>
      
      <!-- 内容区域 -->
      <slot></slot>
    </scroll-view>
  </view>
</template>


<script>
export default {
  props: {
    // 下拉刷新阈值（触发刷新的高度）
    threshold: {
      type: Number,
      default: 150
    },
    // 滚动区域高度
    scrollHeight: {
      type: String,
      default: '100vh'
    }
  },
  data() {
    return {
      triggered: false, // 是否触发刷新
      // 下拉时显示的静态图片
      pullDownGif: 'https://images1.fantuanpu.com/home/f4a2f2a997e45b87bfce23edc794d9a6.gif',
      // 刷新中显示的动态GIF
      refreshingGif: 'https://images1.fantuanpu.com/home/f4a2f2a997e45b87bfce23edc794d9a6.gif',
      refreshText: '下拉刷新' // 提示文字
    };
  },
  methods: {
    // 触发刷新
    onRefresh() {
      this.triggered = true;
      this.refreshText = '正在刷新...';
      this.$emit('refresh');
    },
    // 刷新完成
    finishRefresh() {
      this.triggered = false;
      this.refreshText = '刷新完成';
      setTimeout(() => {
        this.refreshText = '下拉刷新';
      }, 800);
    },
    // 下拉状态恢复
    onRestore() {
      this.refreshText = '下拉刷新';
    },
    // 刷新中断
    onAbort() {
      this.refreshText = '刷新取消';
    }
  }
};
</script>

<style scoped>
.refresh-container {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.refresh-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transform: translateY(-20px);
  opacity: 0;
  transition: all 0.3s ease;
}

.scroll-view[refresher-triggered] .refresh-content,
.refresh-content.refreshing {
  transform: translateY(0);
  opacity: 1;
}

.refresh-icon {
  width: 40px;
  height: 40px;
  margin-bottom: 8px;
}

.refresh-text {
  font-size: 14px;
  color: #999;
  transition: color 0.3s;
}

.refresh-content.refreshing .refresh-text {
  color: #007AFF;
}
</style>
