<template>
	<view class="attitude-container">
		<view v-if="showPanel" class="mask" @click.stop="togglePanel" @touchmove.stop.prevent></view>

		<!-- 合并后的全局统计 -->
		<view class="counts-and-expand">
			<view class="global-counts">
				<view v-for="action in visibleGlobalCounts" :key="action.value" class="count-item" :class="{ 
            'active': currentStatus === action.value,
            'has-count': action.count > 0 
          }">
					<text class="emoji">{{ action.emoji }}</text>
					<text class="count">{{ action.count }}</text>
				</view>
			</view>
			<view class="expand-btn" @click.stop="togglePanel">
				<uni-icons :type="showPanel ? 'arrowup' : 'plus'" size="16" color="#888" />
				<text class="btn-text">{{ showPanel ? '收起' : '表态' }}</text>
			</view>
		</view>

		<!-- 表态面板 -->
		<view v-if="showPanel" class="attitude-panel">
			<view v-for="action in attitudeTypes" :key="action.value" class="attitude-btn"
				:class="{ active: currentStatus === action.value }" @click.stop="handleAction(action.value)">
				<text class="emoji">{{ action.emoji }}</text>
				<view class="text-container">
					<text class="label">{{ action.label }}</text>
				</view>
			</view>
		</view>
	</view>
</template>


<script setup>
	import {
		ref,
		computed,
		watch
	} from 'vue'
	
	import {
		websiteUrl,
		asyncGetUserInfo,
		wechatSignLogin,
		getScene
	} from '../../common/config.js'

	const props = defineProps({
		targetId: Number,
		type: Number,
		attitudeStatus: {
			type: Number,
			default: 0
		},
		attitudeCounts: {
			type: Object,
			default: () => ({})
		}
	})

	const emit = defineEmits(['change'])

	// 本地状态
	const showPanel = ref(false)
	const currentStatus = ref(props.attitudeStatus)
	const currentCounts = ref({})

	// 配置项
	const attitudeTypes = ref([{
			emoji: '😝',
			value: 1,
			label: '很有趣'
		},
		{
			emoji: '😨',
			value: 2,
			label: '这个...'
		},
		{
			emoji: '🤤',
			value: 3,
			label: '我也想要'
		},
		{
			emoji: '🤦‍♀️',
			value: 4,
			label: '难以直视'
		},
		{
			emoji: '🔴',
			value: 5,
			label: '谁的鼻子掉了?'
		}
	])

	// 初始化计数
	watch(() => props.attitudeCounts, (newVal) => {
		attitudeTypes.value.forEach(t => {
			currentCounts.value[t.value] = Number(newVal[t.value] ?? 0)
		})
		currentCounts.value = {
			...currentCounts.value
		}
	}, {
		immediate: true,
		deep: true
	})

	// 过滤显示的非零计数
	const visibleGlobalCounts = computed(() => {
		return attitudeTypes.value
			.map(t => ({
				...t,
				count: currentCounts.value[t.value] || 0
			}))
			.filter(t => t.count > 0 || t.value === currentStatus.value)
			.filter(t => t.count > 0) // 最终确保只显示count>0的
	})

	const togglePanel = () => {
		showPanel.value = !showPanel.value
	}

	const handleAction = async (actionType) => {
	
		try {
			const token = uni.getStorageSync('token')
				console.log(token)
			if (!token) {
				uni.showToast({
					title: '请先登录',
					icon: 'none'
				})
				return
			}

			const isActive = currentStatus.value === actionType
			const apiUrl = `${websiteUrl.value}/with-state/attitude/${isActive ? 'remove' : 'add'}`

			const res = await uni.request({
				url: apiUrl,
				method: 'POST',
				data: {
					target_id: props.targetId,
					type: props.type,
					action_type: actionType
				},
				header: {
					Authorization: token
				}
			})

			if (res.data.status === 'success') {
				// 更新本地状态
				if (isActive) {
					currentCounts.value[actionType]--
					currentStatus.value = 0
				} else {
					if (currentStatus.value > 0) {
						currentCounts.value[currentStatus.value]--
					}
					currentStatus.value = actionType
					currentCounts.value[actionType] = (currentCounts.value[actionType] || 0) + 1
				}

				emit('change', {
					status: currentStatus.value,
					counts: {
						...currentCounts.value
					}
				})

				showPanel.value = false
			}
		} catch (err) {
			console.log(err)
			uni.showToast({
				title: '操作失败',
				icon: 'none'
			})
		}
	}
</script>

<style lang="less" scoped>
	.mask {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: rgba(255, 255, 255, 0.0);
		backdrop-filter: blur(2px);
		z-index: 998;
	}

	.attitude-container {
		position: relative;
	}

	.counts-and-expand {
		display: flex;
		align-items: center;
		gap: 12rpx;
		position: relative;
	}

	.global-counts {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;

		.count-item {
			display: flex;
			align-items: center;
			padding: 4rpx 12rpx;
			border-radius: 20rpx;
			background: #f5f5f5;
			transition: all 0.3s;

			&.active {
				background: #e0f0ff;

				.emoji,
				.count {
					color: #007AFF;
				}
			}

			.emoji {
				font-size: 28rpx;
			}

			.count {
				font-size: 22rpx;
				margin-left: 5rpx;
			}
		}
	}

	.expand-btn {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		padding: 4rpx 8rpx;

		.btn-text {
			font-size: 22rpx;
			color: #888;
			margin-left: 4rpx;
		}
	}

	.attitude-panel {
		position: absolute;
		top: 110%;
		right: 0;
		background: #fff;
		border-radius: 8rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
		padding: 16rpx;
		z-index: 10;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 12rpx;
		z-index: 999;
		width: 450rpx;

		.attitude-btn {
			padding: 12rpx;
			border-radius: 8rpx;
			background: #f5f5f5;
			display: flex;
			align-items: center;

			&.active {
				background: #e0f0ff;

				.emoji,
				.label {
					color: #007AFF;
				}
			}

			.emoji {
				margin-right: 8rpx;
			}

			.label {
				font-size: 24rpx;
			}
		}
	}
</style>