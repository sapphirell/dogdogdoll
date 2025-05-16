<template>
  <view class="search_tab" :class="$attrs.class" :style="{ background: background || '#fff' }">
    <image class="icon_image" src="../../static/search.png"></image>
    <input 
      class="common_search_input" 
      placeholder="请输入商品名称…" 
      v-model="searchTerm" 
      @input="onSearchInput"
      :style="{ fontSize: fontSize || '22rpx' }"
    />
    <image 
      class="icon_image" 
      src="../../static/cancel.png" 
      @tap="cancel" 
      v-if="results.length > 0"
    ></image>
  </view>

  <!-- 商品搜索结果 -->
  <scroll-view 
    v-if="results.length > 0" 
    class="search_results" 
    :style="{ width: width }" 
    scroll-y
  >
    <view 
      v-for="item in results" 
      :key="item.id" 
      class="result_item" 
      @tap="onTap(item)"
    >
      <view class="brand-tag" v-if="item.brand_name">{{ item.brand_name }}</view>
      <text class="goods-name">{{ item.name }}</text>
    </view>
  </scroll-view>
</template>

<script setup>
  import { ref } from 'vue';
  import { websiteUrl } from "../../common/config.js";

  const props = defineProps({
    width: {
      type: String,
      default: '100%'
    },
    background: {
      type: String,
      default: ''
    },
    fontSize: {
      type: String,
      default: ''
    },
    tagColor: {
      type: String,
      default: '#666' // 新增标签颜色控制
    }, 
	mode: {
	  type: String,
	  default: 'jump',
	  validator: (value) => ['jump', 'fill'].includes(value)
	},
	    
  });

  const emit = defineEmits(['select']);
  const searchTerm = ref('');
  const results = ref([]);

  const onSearchInput = async () => {
    if (!searchTerm.value.trim()) {
      results.value = [];
      return;
    }

    try {
      const res = await uni.request({
        url: websiteUrl + `/search-goods?search=${encodeURIComponent(searchTerm.value)}`,
        method: 'GET'
      });

      results.value = res.data?.status === "success" ? res.data.data || [] : [];
    } catch (error) {
      console.error('搜索失败:', error);
      results.value = [];
    }
  };

  const onTap = (goods) => {
    if (props.mode === 'jump') {
      uni.navigateTo({
        url: `/pages/goods/goods?goods_id=${goods.id}`
      });
    } else if (props.mode === 'fill') {
      emit('select', goods);
      // 新增清空逻辑
      searchTerm.value = '';
      results.value = [];
    }
  };

  const cancel = () => {
    searchTerm.value = '';
    results.value = [];
  };
</script>

<style lang="less">
  .search_tab {
    display: flex;
    align-items: center;
    padding: 0 20rpx;
    border-radius: 12rpx;
    background: #fff;
    height: 72rpx;

    .icon_image {
      width: 36rpx;
      height: 36rpx;
      flex-shrink: 0;
      &:first-child { margin-right: 16rpx; }
      &:last-child { margin-left: 16rpx; }
    }

    .common_search_input {
      flex: 1;
      height: 100%;
      padding: 0;
      font-size: inherit;
    }
  }

  .search_results {
    margin-top: 16rpx;
    background: #fff;
    border-radius: 12rpx;
    box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.08);
    max-height: 60vh;

    .result_item {
      display: flex;
      align-items: center;
      padding: 24rpx;
      border-bottom: 1rpx solid #f0f0f0;

      &:last-child { border-bottom: none; }
      &:active { background: #f8f8f8; }

      .brand-tag {
        background: #f0f0f0;
        color: #666;
        font-size: 20rpx;
        padding: 4rpx 12rpx;
        border-radius: 6rpx;
        margin-right: 16rpx;
        line-height: 1.4;
        max-width: 200rpx;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .goods-name {
        flex: 1;
        color: #333;
        font-size: 28rpx;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
</style>
