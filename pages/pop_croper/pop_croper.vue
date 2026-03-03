<template>
  <view-logs />
  <view class="avatar-crop-page" :style="pageStyle">
    <view class="crop-header" :style="{ paddingTop: `${safeTopPx}px` }">
      <view class="header-btn" @tap="goBack">
        <uni-icons type="left" size="22" color="#2f4663" />
      </view>
      <text class="header-title font-alimamashuhei">编辑头像</text>
      <view class="header-btn" @tap="pickImage">
        <uni-icons type="image" size="20" color="#2f4663" />
      </view>
    </view>

    <view class="guide-row">
      <text class="guide-text">双指缩放图片，单指拖拽位置，拖动边框可改裁剪范围</text>
    </view>

    <view class="crop-stage" :style="cropStageStyle">
      <bt-cropper
        v-if="imageSrc"
        ref="cropper"
        class="cropper-host"
        :imageSrc="imageSrc"
        :ratio="ratio"
        :showGrid="showGrid"
        :autoZoom="false"
        :dWidth="900"
        fileType="jpg"
        :quality="0.95"
        :containerSize="containerSize"
        :initPosition="initPosition"
        @change="onChange"
        @loadFail="onLoadFail"
      />
      <view v-else class="empty-wrap">
        <uni-icons type="image" size="46" color="#8ba2be" />
        <text class="empty-text">未获取到图片，请重新选择</text>
        <button class="empty-btn" @tap="pickImage">选择图片</button>
      </view>
    </view>

    <view class="actions-wrap" :style="{ paddingBottom: `${safeBottomPx + 14}px` }">
      <view class="ratio-row">
        <view
          :class="['ratio-pill', { active: ratio === 1 }]"
          @tap="changeRatio(1)"
        >
          1:1
        </view>
        <view
          :class="['ratio-pill', { active: ratio === 0 }]"
          @tap="changeRatio(0)"
        >
          自由
        </view>
        <view
          :class="['ratio-pill', { active: showGrid }]"
          @tap="toggleGrid"
        >
          网格
        </view>
      </view>

      <view class="tool-row">
        <view class="tool-btn" @tap="undo">
          <uni-icons type="undo" size="18" color="#5a7492" />
          <text>撤销</text>
        </view>
        <view class="tool-btn" @tap="resetCropper">
          <uni-icons type="refresh" size="18" color="#5a7492" />
          <text>重置</text>
        </view>
        <view class="tool-btn" @tap="pickImage">
          <uni-icons type="camera" size="18" color="#5a7492" />
          <text>换图</text>
        </view>
      </view>

      <button class="submit-btn" :disabled="submitting || !imageSrc" @tap="crop">
        {{ submitting ? '处理中...' : '完成并使用头像' }}
      </button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      imageSrc: '',
      ratio: 1,
      showGrid: false,
      submitting: false,
      initPosition: null,
      safeTopPx: 0,
      safeBottomPx: 0,
      cropStageHeightPx: 420,
      containerSize: null
    }
  },
  computed: {
    pageStyle() {
      return {
        minHeight: '100vh'
      }
    },
    cropStageStyle() {
      return {
        height: `${this.cropStageHeightPx}px`
      }
    }
  },
  onLoad(options) {
    const raw = String(options?.src || '').trim()
    if (raw) {
      try {
        this.imageSrc = decodeURIComponent(raw)
      } catch (_) {
        this.imageSrc = raw
      }
    } else {
      this.imageSrc = ''
    }
    this.setupLayout()
  },
  onReady() {
    this.$nextTick(() => {
      this.refreshCropContainerSize()
    })
  },
  onPullDownRefresh() {
    uni.stopPullDownRefresh()
  },
  methods: {
    setupLayout() {
      const sys = uni.getSystemInfoSync()
      const statusBarHeight = Number(sys?.statusBarHeight || 0)
      const safeArea = sys?.safeArea || null
      const screenHeight = Number(sys?.screenHeight || sys?.windowHeight || 667)
      const safeBottom = safeArea ? Math.max(0, screenHeight - Number(safeArea.bottom || 0)) : 0

      this.safeTopPx = statusBarHeight
      this.safeBottomPx = safeBottom

      const windowHeight = Number(sys?.windowHeight || 667)
      const reserved = 270 + safeBottom + statusBarHeight
      this.cropStageHeightPx = Math.max(300, Math.floor(windowHeight - reserved))
    },
    refreshCropContainerSize() {
      const query = uni.createSelectorQuery().in(this)
      query
        .select('.crop-stage')
        .boundingClientRect((rect) => {
          if (!rect || !rect.width || !rect.height) return
          this.containerSize = {
            width: Math.floor(rect.width),
            height: Math.floor(rect.height)
          }
          this.$nextTick(() => {
            if (this.$refs.cropper && typeof this.$refs.cropper.init === 'function') {
              this.$refs.cropper.init()
            }
          })
        })
        .exec()
    },
    onLoadFail() {
      uni.showToast({ title: '图片加载失败，请重选', icon: 'none' })
    },
    onChange(ev) {
      this.initPosition = ev
    },
    goBack() {
      uni.navigateBack({ delta: 1 })
    },
    pickImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed', 'original'],
        success: (res) => {
          const src = String(res?.tempFilePaths?.[0] || '').trim()
          if (!src) return
          this.imageSrc = src
          this.initPosition = null
          this.$nextTick(() => {
            this.refreshCropContainerSize()
          })
        }
      })
    },
    changeRatio(nextRatio) {
      if (this.ratio === nextRatio) return
      this.ratio = nextRatio
      this.$nextTick(() => {
        if (this.$refs.cropper && typeof this.$refs.cropper.init === 'function') {
          this.$refs.cropper.init()
        }
      })
    },
    toggleGrid() {
      this.showGrid = !this.showGrid
    },
    undo() {
      if (!this.$refs.cropper || typeof this.$refs.cropper.undo !== 'function') return
      const ok = this.$refs.cropper.undo()
      if (!ok) uni.showToast({ title: '没有可撤销操作', icon: 'none' })
    },
    resetCropper() {
      if (!this.$refs.cropper || typeof this.$refs.cropper.initCropper !== 'function') return
      this.initPosition = null
      this.$refs.cropper.initCropper()
      if (typeof this.$refs.cropper.init === 'function') this.$refs.cropper.init()
    },
    emitResult(tempPath) {
      const pages = getCurrentPages()
      if ((pages || []).length > 1) {
        const parentPage = pages[pages.length - 2]
        parentPage.returnParam = tempPath
      }
      const channel = this.getOpenerEventChannel && this.getOpenerEventChannel()
      if (channel && typeof channel.emit === 'function') {
        channel.emit('avatar-crop-done', { path: tempPath })
      }
    },
    crop() {
      if (!this.imageSrc || this.submitting) return
      if (!this.$refs.cropper || typeof this.$refs.cropper.crop !== 'function') {
        uni.showToast({ title: '裁剪器未就绪', icon: 'none' })
        return
      }

      this.submitting = true
      uni.showLoading({ title: '正在生成' })

      this.$refs.cropper
        .crop()
        .then((tempPath) => {
          if (!tempPath) {
            uni.showToast({ title: '生成失败，请重试', icon: 'none' })
            return
          }
          this.emitResult(tempPath)
          uni.navigateBack({ delta: 1 })
        })
        .catch(() => {
          uni.showToast({ title: '裁剪失败，请重试', icon: 'none' })
        })
        .finally(() => {
          this.submitting = false
          uni.hideLoading()
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.avatar-crop-page {
  background: linear-gradient(180deg, #f3f7fc 0%, #eaf1fa 100%);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.crop-header {
  height: 92rpx;
  padding: 0 26rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-btn {
  width: 68rpx;
  height: 68rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  box-shadow: 0 6rpx 20rpx rgba(57, 86, 116, 0.12);
}

.header-title {
  font-size: 34rpx;
  color: #2f4663;
}

.guide-row {
  padding: 10rpx 30rpx 18rpx;
}

.guide-text {
  font-size: 24rpx;
  color: #758ca8;
}

.crop-stage {
  margin: 0 24rpx;
  border-radius: 26rpx;
  overflow: hidden;
  background: #101722;
  box-shadow: 0 12rpx 32rpx rgba(20, 35, 53, 0.2);
}

.empty-wrap {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}

.empty-text {
  color: #9eb1c7;
  font-size: 26rpx;
}

.empty-btn {
  margin: 0;
  min-width: 200rpx;
  height: 64rpx;
  line-height: 64rpx;
  border-radius: 999rpx;
  font-size: 26rpx;
  color: #ffffff;
  background: #5a91c8;
}

.empty-btn::after {
  border: none;
}

.actions-wrap {
  margin-top: 24rpx;
  padding: 0 24rpx;
}

.ratio-row {
  display: flex;
  gap: 16rpx;
}

.ratio-pill {
  flex: 1;
  height: 66rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #dce8f5;
  color: #4e6785;
  font-size: 24rpx;
}

.ratio-pill.active {
  background: #6d93be;
  color: #ffffff;
}

.tool-row {
  margin-top: 16rpx;
  display: flex;
  gap: 14rpx;
}

.tool-btn {
  flex: 1;
  height: 72rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.82);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  color: #5a7492;
  font-size: 24rpx;
}

.submit-btn {
  margin-top: 18rpx;
  height: 86rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #78abd8 0%, #5e90bf 100%);
  color: #ffffff;
  font-size: 30rpx;
  box-shadow: 0 10rpx 22rpx rgba(78, 123, 167, 0.28);
}

.submit-btn::after {
  border: none;
}

.submit-btn[disabled] {
  opacity: 0.5;
}

.cropper-host {
  width: 100%;
  height: 100%;
}

:deep(.bt-container) {
  height: 100% !important;
  margin: 0 !important;
}

:deep(.mainContent) {
  touch-action: none;
}
</style>
