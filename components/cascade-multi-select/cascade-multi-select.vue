<!-- components/cascade-multi-selector.vue -->
<template>
  <bottom-popup :show="show" @close="closePopup">
    <view class="cascade-container">
      <!-- 顶部操作栏 -->
      <view class="header">
        <text class="title">选择尺寸</text>
        <view class="actions">
          <text class="action-text" @tap="resetSelection">重置</text>
          <uni-icons type="closeempty" size="24" color="#666" @tap="closePopup"></uni-icons>
        </view>
      </view>
      
      <!-- 主体内容 - 纵向级联布局 -->
      <view class="cascade-body">
        <!-- 左侧分类列表 -->
        <scroll-view scroll-y class="categories-container">
          <view 
            v-for="(category, index) in mainCategories" 
            :key="index"
            class="category-item"
            :class="{active: activeCategory === category.value}"
            @tap="selectCategory(category)"
          >
            <text class="category-label">{{ category.label }}</text>
            <text class="category-count">{{ category.count }}个</text>
          </view>
        </scroll-view>
        
        <!-- 右侧尺寸列表 -->
        <scroll-view scroll-y class="sizes-container">
          <view 
            v-for="(size, index) in currentSizes" 
            :key="index"
            class="size-item"
            :class="{selected: isSelected(size, activeCategory)}"
            @tap="toggleSelect(size, activeCategory)"
          >
            <text class="size-label">{{ size }}</text>
            <uni-icons 
              v-if="isSelected(size, activeCategory)"
              type="checkmarkempty" 
              size="16" 
              color="#65c6d9"
            ></uni-icons>
          </view>
        </scroll-view>
      </view>
      
      <!-- 底部操作栏 -->
      <view class="footer">
        <text class="selected-count">已选: {{ selectedSizes.length }}个</text>
        <button class="confirm-btn" @tap="confirmSelection">确定</button>
      </view>
    </view>
  </bottom-popup>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  sizeData: {
    type: Object,
    default: () => ({})
  },
  initialSelection: {
    type: Array,
    default: () => ([])
  }
});

const emit = defineEmits(['close', 'confirm']);

// 当前激活的分类
const activeCategory = ref('');
// 已选择的尺寸 [{ category, size }]
const selectedSizes = ref([]);

// 主分类数据
const mainCategories = computed(() => {
  return Object.keys(props.sizeData).map(category => ({
    label: category,
    value: category,
    count: props.sizeData[category].length
  }));
});

// 当前显示的尺寸选项
const currentSizes = computed(() => {
  if (!activeCategory.value) return [];
  return props.sizeData[activeCategory.value] || [];
});

// 重置选择
const resetSelection = () => {
  activeCategory.value = '';
  selectedSizes.value = [];
};

// 关闭弹窗
const closePopup = () => {
  emit('close');
};

// 选择分类
const selectCategory = (category) => {
  activeCategory.value = category.value;
};

// 切换尺寸选择
const toggleSelect = (size, category) => {
  const index = selectedSizes.value.findIndex(
    item => item.category === category && item.size === size
  );
  
  if (index >= 0) {
    // 已选中，移除
    selectedSizes.value.splice(index, 1);
  } else {
    // 未选中，添加
    selectedSizes.value.push({
      category,
      size
    });
  }
};

// 检查尺寸是否已选中
const isSelected = (size, category) => {
  return selectedSizes.value.some(
    item => item.category === category && item.size === size
  );
};

// 确认选择
const confirmSelection = () => {
  emit('confirm', [...selectedSizes.value]);
  closePopup();
};

// 监听显示状态变化
watch(() => props.show, (newVal) => {
  if (newVal) {
    // 如果有初始选择值，设置初始状态
    if (props.initialSelection && props.initialSelection.length > 0) {
      selectedSizes.value = [...props.initialSelection];
      if (props.initialSelection[0]) {
        activeCategory.value = props.initialSelection[0].category;
      }
    } else {
      resetSelection();
      // 默认选中第一个分类
      if (mainCategories.value.length > 0) {
        activeCategory.value = mainCategories.value[0].value;
      }
    }
  }
});
</script>

<style lang="less" scoped>
.cascade-container {
  display: flex;
  flex-direction: column;
  height: 70vh;
  background-color: #fff;
  border-radius: 24rpx 24rpx 0 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  
  .title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }
  
  .actions {
    display: flex;
    align-items: center;
    gap: 30rpx;
    
    .action-text {
      font-size: 28rpx;
      color: #65c6d9;
    }
  }
}

.cascade-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.categories-container {
  width: 35%;
  height: 100%;
  border-right: 1rpx solid #f0f0f0;
  
  .category-item {
    padding: 25rpx 20rpx;
    border-bottom: 1rpx solid #f8f8f8;
    
    &.active {
      background-color: #e6f7ff;
      border-right: 4rpx solid #65c6d9;
    }
    
    .category-label {
      font-size: 28rpx;
      color: #333;
      margin-bottom: 5rpx;
      display: block;
    }
    
    .category-count {
      font-size: 24rpx;
      color: #999;
    }
  }
}

.sizes-container {
  width: 65%;
  height: 100%;
  padding: 15rpx 0;
  
  .size-item {
    padding: 25rpx 30rpx;
    border-bottom: 1rpx solid #f8f8f8;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    &.selected {
      background-color: #f0faff;
      color: #65c6d9;
      font-weight: 500;
    }
    
    .size-label {
      font-size: 28rpx;
    }
  }
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  border-top: 1rpx solid #f0f0f0;
  background-color: #fff;
  
  .selected-count {
    font-size: 28rpx;
    color: #666;
  }
  
  .confirm-btn {
    background: linear-gradient(135deg, #8fecff, #c1ddff);
    color: #fff;
    border-radius: 50rpx;
    padding: 0 60rpx;
    height: 70rpx;
    line-height: 70rpx;
    font-size: 28rpx;
	margin: auto 0 auto auto;
  }
}
</style>
