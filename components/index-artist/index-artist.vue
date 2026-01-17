<template>
  <view-logs />
  <view class="artist-list-container">
    
    <view class="sticky-header">
      <view class="top-actions">
        <view class="role-toggle-wrapper">
          <view 
            class="role-item" 
            :class="{ active: roleType === 'artist' }"
            @click="switchRole('artist')"
          >
            <text>妆师</text>
          </view>
          <view 
            class="role-item" 
            :class="{ active: roleType === 'hairstylist' }"
            @click="switchRole('hairstylist')"
          >
            <text>毛娘</text>
          </view>
        </view>

        <view class="actions-right">
          <view class="filter-btn" @click="showFilterPopup">
            <uni-icons type="tune" size="16" color="#666"></uni-icons>
            <text class="filter-text font-alimamashuhei">筛选</text>
          </view>
          <view class="help-btn" @click="showHelpModal">
            <uni-icons type="help-filled" size="22" color="#cfcfcf"></uni-icons>
          </view>
        </view>
      </view>
    </view>

    <view class="artist-list">
      <view
        v-for="(artist, index) in filteredArtists"
        :key="index"
        class="artist-card"
        @click="navigateToArtistDetail(artist)"
      >
        <view class="card-header">
          <view class="avatar-wrapper">
             <common-image 
               :src="artist.logo_image" 
               width="110" 
               height="110" 
               radius="24" 
               class="artist-avatar"
             ></common-image>
          </view>
          
          <view class="artist-details">
            <view class="row-top">
              <view class="artist-name font-alimamashuhei">{{ artist.brand_name }}</view>
              <view class="artist-price">
                <text class="currency">¥</text>
                <text class="price-value font-title">{{ artist.base_price }}</text>
                <text class="price-label">起</text>
              </view>
            </view>
            
            <view class="row-desc">
               <text class="desc-text" v-if="artist.description">{{ artist.description }}</text>
               <text class="desc-text placeholder" v-else>暂无简介...</text>
            </view>
          </view>
        </view>

        <view class="card-body">
          <view class="highlight-works" v-if="artist.highlight_img && artist.highlight_img.length > 0">
            <scroll-view scroll-x class="works-scroll" :show-scrollbar="false">
              <view class="scroll-inner">
                <view
                  v-for="(img, imgIndex) in artist.highlight_img"
                  :key="imgIndex"
                  class="work-item"
                >
                  <common-image 
                    :src="img" 
                    width="100%" 
                    height="100%" 
                    radius="0"
                  ></common-image>
                </view>
              </view>
            </scroll-view>
            <view class="scroll-mask"></view>
          </view>
          <view class="no-works" v-else>
            <text>暂无作品展示</text>
          </view>
        </view>
      </view>
    </view>

    <view class="empty-state" v-if="filteredArtists.length === 0 && !loading">
      <image src="/static/empty-artist.png" class="empty-image" mode="widthFix"></image>
      <text class="empty-title">哎呀，这里空空如也</text>
      <text class="empty-sub">未找到符合条件的{{ roleType === 'artist' ? '妆师' : '毛娘' }}</text>
      <button class="reset-btn" hover-class="btn-hover" @click="resetFilters">重置筛选</button>
    </view>

    <common-modal :visible="helpModalVisible" width="600rpx" @update:visible="helpModalVisible = $event">
      <scroll-view scroll-y="true" class="help-modal-content">
        <view class="modal-header-text">说明</view>
        
        <view class="modal-item">
          <text class="modal-label">基础妆费说明</text>
          <text class="modal-desc">基础妆费是妆师妆则中费用最低的一个选项（例如：自由妆200、半指定300、全指定400，选取自由妆费作为展示）。</text>
        </view>

        <view class="modal-item">
          <text class="modal-label">价格说明</text>
          <text class="modal-desc">受限于数据收集困难等原因，妆师妆费价格与实际价格可能存在差距，如有错误请在妆师主页留言订正，我们会很快核对更新。</text>
        </view>

        <view class="modal-item">
          <text class="modal-label">交易说明</text>
          <text class="modal-desc">当前软件版本暂不支持在线交易，交易详情、责任与规则以联系本人为准。</text>
        </view>
        
        <view class="modal-item">
          <text class="modal-label">接管词条</text>
          <text class="modal-desc">在【我的-作者入驻】中申请。</text>
        </view>

        <view class="modal-close-btn" @click="helpModalVisible = false">我知道了</view>
      </scroll-view>
    </common-modal>

    <bottom-popup :show="filterPopupVisible" @close="filterPopupVisible = false">
      <view class="filter-popup-content">
        <view class="popup-header">
          <text class="popup-title">筛选条件</text>
          <uni-icons type="closeempty" size="24" color="#999" @click="filterPopupVisible = false"></uni-icons>
        </view>

        <view class="filter-section">
          <view class="section-title">接单状态</view>
          <view class="status-buttons">
            <view
              v-for="(status, index) in statusFilters"
              :key="index"
              :class="['status-btn', { active: activeStatus === status.value }]"
              @click="activeStatus = status.value"
            >
              {{ status.label }}
            </view>
          </view>
        </view>

        <view class="filter-section">
          <view class="section-title">价格区间</view>
          <view class="price-inputs">
            <input v-model="minPrice" type="number" placeholder="最低价" class="price-input" placeholder-class="placeholder-style" />
            <text class="price-separator">-</text>
            <input v-model="maxPrice" type="number" placeholder="最高价" class="price-input" placeholder-class="placeholder-style" />
          </view>
        </view>

        <view class="filter-section" v-if="roleType === 'artist'">
          <view class="section-title">可接妆面类型</view>

          <view class="switch-row">
            <text class="switch-label">显示可接二次元妆面</text>
            <switch
              :checked="accept2D"
              @change="accept2D = $event.detail.value"
              color="#97e7f7"
              style="transform:scale(0.8)"
            />
          </view>

          <view class="switch-row">
            <text class="switch-label">显示可接三次元妆面</text>
            <switch
              :checked="accept3D"
              @change="accept3D = $event.detail.value"
              color="#97e7f7"
              style="transform:scale(0.8)"
            />
          </view>

          <view class="switch-tips">
            <uni-icons type="info" size="14" color="#faad14" style="margin-right:4rpx"></uni-icons>
            开启后只显示“支持该类型”的妆师，关闭则不限。
          </view>
        </view>

        <view class="popup-actions">
          <button class="popup-btn reset" hover-class="btn-hover-light" @click="resetFilters">重置</button>
          <button class="popup-btn apply" hover-class="btn-hover" @click="applyFilter">应用</button>
        </view>
      </view>
    </bottom-popup>

  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { websiteUrl } from '@/common/config.js'

// --- Props ---
const props = defineProps({
  list: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

// --- Emits ---
const emit = defineEmits(['filter-change'])

// --- Refs & State ---
const roleType = ref('artist') 

// 状态筛选选项
const statusFilters = ref([
  { label: '全部', value: 0 },
  { label: '长期接单', value: 1 },
  { label: '限时手速', value: 2 },
  { label: '限时抽选', value: 3 },
  { label: '黑箱卡', value: 4 },
  { label: '关闭接单', value: 9 },
])

// 筛选条件
const activeStatus = ref(0)
const minPrice = ref('')
const maxPrice = ref('')
const accept2D = ref(false)
const accept3D = ref(false)

// 弹窗控制
const helpModalVisible = ref(false)
const filterPopupVisible = ref(false)

// --- Computed ---
const filteredArtists = computed(() => props.list || [])

// --- Methods ---
const emitFilterChange = () => {
  emit('filter-change', {
    roleType: roleType.value,
    status: activeStatus.value,
    minPrice: minPrice.value,
    maxPrice: maxPrice.value,
    accept2D: accept2D.value,
    accept3D: accept3D.value,
  })
}

onMounted(() => {
  emitFilterChange()
})

const switchRole = (role) => {
  if (roleType.value === role) return
  roleType.value = role
  emitFilterChange()
}

const showFilterPopup = () => {
  filterPopupVisible.value = true
}
const showHelpModal = () => {
  helpModalVisible.value = true
}

const applyFilter = () => {
  filterPopupVisible.value = false
  emitFilterChange()
}

const resetFilters = () => {
  activeStatus.value = 0
  minPrice.value = ''
  maxPrice.value = ''
  accept2D.value = false
  accept3D.value = false
  emitFilterChange()
}

const navigateToArtistDetail = (artist) => {
  const baseUrl = roleType.value === 'artist' 
    ? '/pkg-creator/creator_base/bjd_faceup_artist/bjd_faceup_artist' 
    : '/pkg-creator/creator_base/hair_artist/hair_artist'
  
  uni.navigateTo({
    url: `${baseUrl}?brand_id=${artist.brand_id}`,
  })
}
</script>

<style lang="less">
/* 定义变量，方便统一调整 */
@primary-gradient: linear-gradient(135deg, #97e7f7 0%, #d5acd6 100%);
@bg-color: #f7f8fa;
@card-bg: #ffffff;
@text-main: #333333;
@text-sub: #999999;
@price-color: #ff6b81;
@shadow-soft: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);

.artist-list-container {
  min-height: 100vh;
  background-color: @bg-color;
  padding-bottom: 40rpx;
}

/* --- 吸顶头部 --- */
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 99;
  background-color: @bg-color;
  padding: 20rpx 24rpx;
  
  /* 头部下方淡淡的阴影，增加层次感 */
  &::after {
    content: '';
    position: absolute;
    bottom: -20rpx;
    left: 0;
    right: 0;
    height: 20rpx;
    background: linear-gradient(to bottom, @bg-color, transparent);
    pointer-events: none;
  }
}

.top-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .role-toggle-wrapper {
    position: relative;
    display: flex;
    background: #eef1f5;
    border-radius: 60rpx;
    padding: 6rpx;
    height: 72rpx;
    box-sizing: border-box;
    
    .role-item {
      position: relative;
      z-index: 2;
      padding: 0 32rpx;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50rpx;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      
      text {
        font-size: 28rpx;
        color: #888;
        font-weight: 500;
        transition: color 0.3s;
      }

      &.active {
        background: @primary-gradient;
        box-shadow: 0 4rpx 12rpx rgba(151, 231, 247, 0.4);
        
        text {
          color: #fff;
          font-weight: 600;
        }
      }
    }
  }

  .actions-right {
    display: flex;
    align-items: center;
    gap: 20rpx;

    .filter-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 64rpx;
      padding: 0 28rpx;
      background: #fff;
      border: 2rpx solid #e0e0e0;
      border-radius: 32rpx;
      box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.02);
      transition: transform 0.1s;

      &:active {
        transform: scale(0.96);
        background: #f9f9f9;
      }

      .filter-text {
        font-size: 24rpx;
        color: #555;
        margin-left: 6rpx;
        letter-spacing: 1rpx;
      }
    }

    .help-btn {
      width: 64rpx;
      height: 64rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: rgba(255,255,255,0.6);
    }
  }
}

/* --- 列表卡片 --- */
.artist-list {
  padding: 10rpx 0rpx;
  
  .artist-card {
    background: @card-bg;
    border-radius: 32rpx;
    margin-bottom: 30rpx;
    padding: 30rpx;
    box-shadow: @shadow-soft;
    transition: transform 0.2s;
    position: relative;
    overflow: hidden;

    &:active {
      transform: scale(0.99);
    }

    /* 头部信息 */
    .card-header {
      display: flex;
      margin-bottom: 24rpx; 

      .avatar-wrapper {
        margin-right: 24rpx;
        flex-shrink: 0;
        /* 【修改点 3】移除了多余的border-radius等样式，
           因为现在由 common-image 组件控制，这里只负责布局间距 */
        .artist-avatar {
          /* width/height 已通过 props 传入 */
          /* border: 1rpx solid rgba(0,0,0,0.04);  可选：如果需要边框可以保留 */
        }
      }

      .artist-details {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between; 
        min-height: 110rpx; 
        padding-top: 2rpx;
        padding-bottom: 2rpx;

        .row-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          
          .artist-name {
            font-size: 34rpx;
            font-weight: 600;
            color: @text-main;
            max-width: 320rpx;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .artist-price {
            display: flex;
            align-items: baseline;
            color: @price-color;
            
            .currency { font-size: 24rpx; font-weight: bold; margin-right: 2rpx; }
            .price-value { font-size: 36rpx; font-weight: 700; font-family: 'DIN', sans-serif; }
            .price-label { font-size: 22rpx; color: #b0b0b0; margin-left: 4rpx; }
          }
        }

        .row-desc {
          .desc-text {
            font-size: 26rpx;
            color: @text-sub;
            line-height: 1.5; 
            
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2; 
            -webkit-box-orient: vertical;
            
            &.placeholder { color: #e0e0e0; font-size: 24rpx; }
          }
        }
      }
    }

    /* 作品集 */
    .card-body {
      position: relative;
      
      .highlight-works {
        position: relative;
        margin: 0 -30rpx; 
        
        .works-scroll {
          width: 100%;
          white-space: nowrap;
          height: 200rpx;
          
          .scroll-inner {
            display: flex;
            padding: 0 30rpx; 
          }

          .work-item {
            display: inline-block;
            width: 200rpx;
            height: 200rpx;
            margin-right: 16rpx;
            border-radius: 16rpx;
            overflow: hidden;
            background: #f9f9f9;
            flex-shrink: 0;

            /* 【修改点 4】移除了 .work-image 的 animation 和 opacity 样式
               因为 common-image 组件内部已经实现了渐变加载动画 */
          }
        }
        
        /* 右侧白色透明遮罩 */
        .scroll-mask {
            position: absolute;
            right: 0;
            top: 0;
            bottom: 0;
            width: 50rpx;
            background: linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.9));
            pointer-events: none;
            z-index: 2;
        }
      }

      .no-works {
        background-color: #f9fafc;
        border-radius: 12rpx;
        padding: 30rpx 0;
        text-align: center;
        text { font-size: 24rpx; color: #ccc; }
      }
    }
  }
}

/* --- 空状态 --- */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 120rpx;

  .empty-image { width: 320rpx; margin-bottom: 30rpx; opacity: 0.8; }
  .empty-title { font-size: 30rpx; color: #666; font-weight: 600; margin-bottom: 12rpx; }
  .empty-sub { font-size: 24rpx; color: #bbb; margin-bottom: 60rpx; }

  .reset-btn {
    width: 240rpx;
    height: 80rpx;
    line-height: 80rpx;
    border-radius: 40rpx;
    background: @primary-gradient;
    color: #fff;
    font-size: 28rpx;
    border: none;
    box-shadow: 0 8rpx 20rpx rgba(151, 231, 247, 0.4);
    &::after { border: none; }
  }
}

/* --- 筛选弹窗样式 --- */
.filter-popup-content {
  padding: 40rpx 32rpx;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  min-height: 60vh; 

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 48rpx;

    .popup-title {
      font-size: 34rpx;
      font-weight: 700;
      color: @text-main;
      position: relative;
      padding-left: 24rpx;
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 8rpx;
        height: 32rpx;
        background: @primary-gradient;
        border-radius: 4rpx;
      }
    }
  }

  .filter-section {
    margin-bottom: 50rpx;

    .section-title {
      font-size: 28rpx;
      color: @text-main;
      font-weight: 600;
      margin-bottom: 24rpx;
    }

    .status-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 20rpx;

      .status-btn {
        padding: 0 36rpx;
        height: 68rpx;
        line-height: 68rpx;
        background: #f5f6f8;
        border-radius: 34rpx;
        color: #666;
        font-size: 26rpx;
        border: 1px solid transparent;

        &.active {
          background: rgba(151, 231, 247, 0.1);
          color: #4dbbdd;
          border-color: #97e7f7;
          font-weight: 500;
        }
      }
    }

    .price-inputs {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .price-input {
        flex: 1;
        height: 80rpx;
        background: #f5f6f8;
        border-radius: 16rpx;
        text-align: center;
        font-size: 28rpx;
        color: @text-main;
      }
      .placeholder-style { color: #bbb; }
      .price-separator {
        width: 60rpx;
        text-align: center;
        color: #ddd;
        font-weight: bold;
      }
    }

    /* 开关行 */
    .switch-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20rpx;
      
      .switch-label { font-size: 28rpx; color: #555; }
    }
    
    .switch-tips {
        background: #fffbe6;
        color: #faad14;
        font-size: 22rpx;
        padding: 16rpx 20rpx;
        border-radius: 12rpx;
        display: flex;
        align-items: center;
        line-height: 1.4;
    }
  }

  .popup-actions {
    display: flex;
    gap: 24rpx;
    margin-top: 60rpx;

    .popup-btn {
      flex: 1;
      height: 88rpx;
      line-height: 88rpx;
      border-radius: 44rpx;
      font-size: 30rpx;
      font-weight: 500;
      
      &.reset {
        background: #fff;
        border: 2rpx solid #eee;
        color: #666;
      }

      &.apply {
        background: @primary-gradient;
        color: #fff;
        box-shadow: 0 6rpx 16rpx rgba(151, 231, 247, 0.3);
      }
      
      &::after { border: none; }
    }
    
    .btn-hover { opacity: 0.9; transform: scale(0.98); }
    .btn-hover-light { background: #f9f9f9; }
  }
}

/* --- 帮助弹窗内容 --- */
.help-modal-content {
    padding: 20rpx 0rpx;
    height: 700rpx;
    .modal-header-text {
        text-align: center;
        font-size: 34rpx;
        font-weight: bold;
        margin-bottom: 40rpx;
        color: #333;
    }
    
    .modal-item {
        margin-bottom: 30rpx;
        
        .modal-label {
            display: block;
            font-size: 28rpx;
            font-weight: 600;
            color: #4dbbdd;
            margin-bottom: 10rpx;
            position: relative;
            padding-left: 16rpx;
            
            &::before {
                content: '';
                position: absolute;
                left: 0;
                top: 10rpx;
                width: 8rpx;
                height: 20rpx;
                background: #d5acd6;
                border-radius: 4rpx;
            }
        }
        
         .modal-desc {
             font-size: 26rpx;
             color: #666;
             line-height: 1.6;
             display: block;
             text-align: justify;
            
             /* Add these lines to fix overflow */
             word-break: break-all; /* Forces break at any character to prevent overflow */
             white-space: normal;   /* Ensures text wraps normally */
             width: 100%;           /* Ensures it takes available width but no more */
         }
    }

    .modal-close-btn {
        margin-top: 50rpx;
        height: 80rpx;
        line-height: 80rpx;
        text-align: center;
        background: #f5f6f8;
        border-radius: 40rpx;
        color: #999;
        font-size: 28rpx;
        
        &:active { background: #eee; }
    }
}
</style>