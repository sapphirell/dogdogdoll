<template>
	<!-- 举报按钮 - 横向布局 -->
	<view class="report-button" @click="handleClick">
		<slot>
			<view class="default-button horizontal">
				<uni-icons :v-if="iconType !== ''" :type="iconType" :size="  parseInt(iconSize)" :color="iconColor"></uni-icons>
				<text class="button-text">{{ buttonText }}</text>
			</view>
		</slot>
	</view>
	
	<!-- 举报弹窗 -->
	<common-modal :visible="reportVisible" @update:visible="val => reportVisible = val" top="10vh">
		<view class="report-dialog">
			<view class="dialog-header">
				<text class="dialog-title">举报内容</text>
				<uni-icons type="closeempty" size="24" color="#999" @click="reportVisible = false"></uni-icons>
			</view>
			
			<view class="reason-list">
				<view 
					v-for="reason in reportReasons" 
					:key="reason.id" 
					class="reason-item"
					@click="selectReason(reason.label)"
					:class="{'selected': selectedReason === reason.label}"
				>
					<radio 
						:value="reason.label" 
						:checked="selectedReason === reason.label"
						:color="themeColor" 
					/>
					<text class="reason-label">{{ reason.label }}</text>
				</view>
			</view>
			
			<view class="details-box">
				<textarea 
					v-model="reportDetails" 
					placeholder="请详细描述举报原因（选填）" 
					class="details-input" 
					maxlength="200"
					:focus="autoFocus"
				/>
				<text class="word-count">{{ reportDetails.length }}/200</text>
			</view>
			
			<view class="button-group">
				<button class="cancel-btn" @click="reportVisible = false">取消</button>
				<button class="submit-btn" @click="submitReport" :style="{ backgroundColor: themeColor }">提交举报</button>
			</view>
		</view>
	</common-modal>
</template>

<script setup>
	import {
		ref,
		computed,
		watch
	} from 'vue'
	import {
		websiteUrl,
		global,
		asyncGetUserInfo,
		wechatSignLogin
	} from '@/common/config.js'

	const props = defineProps({
		// 举报类型（1=展示柜,2=搭配,3=树洞发帖,4=用户，5=回帖）
		reportType: {
			type: Number,
			required: true
		},
		// 关联ID（被举报内容的ID）
		relationId: {
			type: Number,
			required: true
		},
		// 按钮文本
		buttonText: {
			type: String,
			default: '举报'
		},
		// 图标类型
		iconType: {
			type: String,
			default: ''
		},
		// 图标大小
		iconSize: {
			type: String,
			default: 24
		},
		// 图标颜色
		iconColor: {
			type: String,
			default: '#999'
		},
		// 主题颜色
		themeColor: {
			type: String,
			default: '#64c6dc'
		},
		// 是否自动聚焦文本输入框
		autoFocus: {
			type: Boolean,
			default: false
		}
	})

	const emit = defineEmits(['success', 'error', 'cancel', 'before-submit'])

	const reportVisible = ref(false)
	const reportReasons = ref([])
	const selectedReason = ref('')
	const reportDetails = ref('')
	const isSubmitting = ref(false)

	// 选择举报原因
	const selectReason = (reason) => {
		// 如果点击的是已选中的原因，则取消选择
		if (selectedReason.value === reason) {
			selectedReason.value = ''
		} else {
			selectedReason.value = reason
		}
	}



	// 获取举报原因
	const fetchReportReasons = async () => {
		try {
			const token = uni.getStorageSync('token')
			const res = await uni.request({
				url: `${websiteUrl.value}/report/reasons?type=${props.reportType}`,
				method: 'GET',
				header: {
					'Authorization': token,
				},
			})

			if (res.data.status === 'success') {
				reportReasons.value = res.data.data
				return true
			} else {
				uni.showToast({
					title: '获取举报原因失败: ' + (res.data.msg || ''),
					icon: 'none'
				})
				return false
			}
		} catch (error) {
			uni.showToast({
				title: '网络请求失败',
				icon: 'none'
			})
			return false
		}
	}

	// 处理举报按钮点击
	const handleClick = async () => {
		// 获取举报原因
		const success = await fetchReportReasons()
		if (!success) return

		// 重置表单
		selectedReason.value = ''
		reportDetails.value = ''

		// 显示弹窗
		reportVisible.value = true
	}

	// 提交举报
	const submitReport = async () => {
		if (isSubmitting.value) return
		isSubmitting.value = true

		try {
			if (!selectedReason.value) {
				uni.showToast({
					title: '请选择举报原因',
					icon: 'none'
				})
				return
			}

			// 触发提交前事件
			emit('before-submit', {
				type: props.reportType,
				relationId: props.relationId,
				reason: selectedReason.value,
				details: reportDetails.value
			})

			const token = uni.getStorageSync('token')
			const reportData = {
				type: props.reportType,
				relation_id: props.relationId,
				reason: selectedReason.value,
				details: reportDetails.value
			}
			let url = `${websiteUrl.value}/with-state/report/submit`
			
			if (token == "") {
				url = `${websiteUrl.value}/report/submit`
			}

			const res = await uni.request({
				url: url,
				method: 'POST',
				header: {
					'Authorization': token,
					'Content-Type': 'application/json'
				},
				data: reportData,
				timeout: 10000 // 10秒超时
			})

			if (res.data.status === 'success') {
				uni.showToast({
					title: '举报提交成功',
					icon: 'success',
					duration: 2000
				})
				reportVisible.value = false
				// 触发成功事件
				emit('success', res.data)
			} else {
				uni.showToast({
					title: res.data.msg || '举报提交失败',
					icon: 'none'
				})
				// 触发错误事件
				emit('error', res.data)
			}
		} catch (error) {
			uni.showToast({
				title: '举报提交失败: ' + (error.errMsg || '网络错误'),
				icon: 'none'
			})
			// 触发错误事件
			emit('error', error)
		} finally {
			isSubmitting.value = false
		}
	}

	// 监听弹窗关闭
	watch(reportVisible, (newVal) => {
		if (!newVal) {
			emit('cancel')
		}
	})
</script>

<style lang="less" scoped>
.report-button {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  background-color: transparent; /* 透明背景 */
  
  /* 横向按钮样式 */
  .default-button.horizontal {
    display: flex;
    flex-direction: row; /* 横向布局 */
    align-items: center;
    padding: 6rpx 16rpx;
    border-radius: 36rpx;
    background-color: transparent; /* 透明背景 */
    
    .button-text {
      font-size: 22rpx; /* 稍微放大文字 */
      color: #999; /* 深一点的颜色 */
      margin-left: 8rpx; /* 图标和文字间距 */
      font-weight: 500;
	  width: 50rpx;
    }
  }
  
  /* 移除默认按钮的边框 */
  &::after {
    border: none;
  }
}

uni-button {
  &::after {
    border: none;
  }
}

.report-dialog {
  padding: 24rpx;
  width: 86vw;
  max-width: 560rpx;
  background-color: #fff;
  border-radius: 14rpx;
  box-sizing: border-box;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #eee;
  
  .dialog-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }
}

.reason-list {
  max-height: 50vh;
  overflow-y: auto;
  margin-bottom: 24rpx;
  padding: 8rpx 0;
}

.reason-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-radius: 8rpx;
  cursor: pointer; /* 手型指针 */
  
  /* 选中状态效果 */
  &.selected {
    background-color: rgba(100, 198, 220, 0.1); /* 浅蓝色背景 */
  }
  
  /* 悬停效果 */
  &:hover {
    background-color: #f9f9f9;
  }
  
  .reason-label {
    font-size: 26rpx;
    margin-left: 16rpx;
    color: #333;
    flex: 1;
    padding: 10rpx 0; /* 扩大点击区域 */
  }
}

.details-box {
  position: relative;
  margin-bottom: 32rpx;
  background-color: #f8f8f8;
  border-radius: 10rpx;
  overflow: hidden;
  
  .details-input {
    width: 100%;
    height: 180rpx;
    padding: 16rpx;
    font-size: 26rpx;
    box-sizing: border-box;
    background-color: transparent;
  }
  
  .word-count {
    position: absolute;
    right: 12rpx;
    bottom: 12rpx;
    font-size: 22rpx;
    color: #999;
  }
}

.button-group {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
  
  .cancel-btn, .submit-btn {
    flex: 1;
    height: 72rpx;
    line-height: 72rpx;
    border-radius: 36rpx;
    font-size: 28rpx;
    transition: all 0.3s;
    
    &:active {
      opacity: 0.8;
      transform: scale(0.98);
    }
  }
  
  .cancel-btn {
    background-color: #f5f5f5;
    color: #666;
    font-size: 26rpx;
  }
  
  .submit-btn {
    color: white;
    border: none;
    background-color: #64c6dc;
  }
}

/* 单选按钮使用新主题色 */
::v-deep .uni-radio-input.uni-radio-input-checked {
  border-color: #64c6dc !important;
  background-color: #64c6dc !important;
}

/* 弹窗关闭按钮缩小 */
::v-deep .uni-icons {
  font-size: 22rpx !important;
}
</style>
