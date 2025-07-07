<template>
	<!-- 版本检查组件 -->
	<view>
		<!-- 新版本提示弹窗 -->
		<common-modal :visible="modalVisible" @update:visible="modalVisible = $event" top="15vh">
			<view class="version-update-container">
				<view class="update-title">发现新版本 v{{newVersionInfo?.version}} 当前 v{{}}</view>

				<scroll-view class="update-content" scroll-y>
					<view class="update-section">
						<view class="section-title">更新内容</view>
						<view class="section-content">{{newVersionInfo?.note || '优化用户体验，修复已知问题'}}</view>
					</view>
					<view class="update-section">
						<view class="section-title">更新日期</view>
						<view class="section-content">{{formatTime(newVersionInfo?.created_at)}}</view>
					</view>
				</scroll-view>

				<view class="update-buttons">
					<button class="update-btn ignore" @tap="ignoreUpdate">暂不更新</button>
					<button class="update-btn confirm" @tap="handleUpdate">立即更新</button>
				</view>
			</view>
		</common-modal>

		<!-- 已是最新版本提示 -->
		<view v-if="showUpToDateToast" class="toast-message">
			<text>已是最新版本</text>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted,
		computed
	} from 'vue';
	import {
		websiteUrl,
		getScene
	} from '../../common/config.js';

	// 组件属性
	const props = defineProps({
		// 是否显示已是最新版本的提示
		showUpToDateToast: {
			type: Boolean,
			default: false
		},
		// 当前版本号
		currentVersion: {
			type: String,
			required: true
		},
		// 是否自动检查版本
		autoCheck: {
			type: Boolean,
			default: true
		}
	});

	// 弹窗可见性
	const modalVisible = ref(false);
	// 新版本信息
	const newVersionInfo = ref(null);
	// 显示已是最新提示
	const showUpToDateToast = ref(false);
	const cv = ref("1.0.0")
	// 获取平台信息
	const platform = computed(() => {
		const systemInfo = uni.getSystemInfoSync();
		return systemInfo.platform || 'unknown';
	});

	// 格式化时间
	const formatTime = (timestamp) => {
		if (!timestamp) return '未知日期';
		const date = new Date(timestamp * 1000);
		return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
	}

	// 检查是否在忽略期内
	const isIgnored = () => {
		const ignoreTime = uni.getStorageSync('ignoreUpdateTime');
		console.log("忽略时间：", ignoreTime)
		if (!ignoreTime) return false;

		// 检查是否在3天（259200000毫秒）内
		const now = Date.now();
		console.log("当前时间", now)
		return (now - ignoreTime) < 259200000;
	}

	// 检查版本更新
	const checkVersion = async () => {
		try {
			// 平台检查：H5或小程序不弹出
			let scene = getScene()
			if (scene === 1 || scene === 4) {
				console.log("scene:", scene)
				return
			}
			// 检查是否在忽略期内
			if (isIgnored()) {
				console.log('在忽略期内，不显示更新提示 ');
				return;
			}
			const cv = uni.getAppBaseInfo().appVersion;
			const res = await uni.request({
				url: `${websiteUrl}/latest-version?version=1.0.40`,
				method: 'GET'
			});

			if (res && res.data) {
				if (res.data.status === 'success' && res.data.data) {
					// 有新版本
					newVersionInfo.value = res.data.data;
					modalVisible.value = true;
				} else if (res.data.status === 'failed' && props.showUpToDateToast) {
					// 已是最新版本
					showUpToDateToast.value = true;
					setTimeout(() => {
						showUpToDateToast.value = false;
					}, 2000);
				}
			}
		} catch (err) {
			console.error('版本检查失败:', err);
		}
	};

	// 处理更新操作
	const handleUpdate = () => {
		// 记录用户选择了更新（3天内不再提示）
		uni.setStorageSync('ignoreUpdateTime', Date.now());

		modalVisible.value = false;

		// 平台特定的更新处理
		const platformValue = platform.value.toLowerCase();
		console.log(platformValue)

		let scene = getScene()

		if (scene === 2) {
			// iOS 跳转 App Store
			plus.runtime.openURL('https://apps.apple.com/app/id6747564362');
		} else if (scene === 3) {
			plus.runtime.openURL('https://apps.apple.com/app/id6747564362');
		} else {
			// 其他平台提示
			uni.showModal({
				title: '更新提示',
				content: '请前往应用商店更新最新版本',
				showCancel: false
			});
		}
	};

	// 忽略更新
	const ignoreUpdate = () => {
		// 记录忽略时间（3天内不再提示）
		uni.setStorageSync('ignoreUpdateTime', Date.now());
		modalVisible.value = false;
	};

	// 暴露检查方法给父组件
	defineExpose({
		checkVersion
	});

	// 自动检查版本
	onMounted(() => {
		cv.value = uni.getAppBaseInfo().appVersion;
		if (props.autoCheck) {
			setTimeout(() => {
				checkVersion();
			}, 1500);
		}
	});
</script>

<style lang="less">
	.version-update-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 30rpx;
		width: 600rpx;
		box-sizing: border-box;

		.update-icon {
			width: 160rpx;
			height: 160rpx;
			margin-bottom: 20rpx;
		}

		.update-title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 30rpx;
			text-align: center;
		}

		.update-content {
			width: 100%;
			max-height: 300rpx;
			margin-bottom: 40rpx;
			border-radius: 12rpx;
			background-color: #f8f9fa;
			padding: 20rpx;
			box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

			.update-section {
				margin-bottom: 40rpx;

				.section-title {
					font-size: 26rpx;
					font-weight: bold;
					color: #4a90e2;
					margin-bottom: 10rpx;
					position: relative;
					padding-left: 20rpx;

					&::before {
						content: '';
						position: absolute;
						left: 0;
						top: 50%;
						transform: translateY(-50%);
						width: 8rpx;
						height: 26rpx;
						background: linear-gradient(to bottom, #4facfe, #00f2fe);
						border-radius: 4rpx;
					}
				}

				.section-content {
					font-size: 24rpx;
					color: #666;
					line-height: 1.6;
					padding-left: 20rpx;
				}
			}
		}

		.update-buttons {
			display: flex;
			justify-content: space-between;
			width: 100%;
			gap: 20rpx;

			.update-btn {
				flex: 1;
				height: 60rpx;
				border-radius: 40rpx;
				font-size: 24rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				transition: all 0.3s;
				position: relative;
				overflow: hidden;

				&::after {
					border: none;
				}

				&.ignore {
					background-color: #f5f5f5;
					color: #666;
					border: 1rpx solid #e5e5e5;

					&:active {
						background-color: #e5e5e5;
						transform: translateY(2rpx);
					}
				}

				&.confirm {
					background: linear-gradient(135deg, #a6e9f7, #1ed1e1);
					color: white;
					box-shadow: 0 4rpx 12rpx rgba(30, 209, 225, 0.4);

					&:active {
						opacity: 0.9;
						transform: translateY(2rpx);
						box-shadow: 0 2rpx 6rpx rgba(30, 209, 225, 0.4);
					}

					// &::before {
					//   content: '';
					//   position: absolute;
					//   top: -50%;
					//   left: -50%;
					//   width: 200%;
					//   height: 200%;
					//   background: linear-gradient(
					//     to right,
					//     rgba(255, 255, 255, 0) 0%,
					//     rgba(255, 255, 255, 0.8) 50%,
					//     rgba(255, 255, 255, 0) 100%
					//   );
					//   transform: rotate(30deg);
					//   animation: shine 2s infinite;
					// }
				}
			}
		}
	}

	.toast-message {
		position: fixed;
		bottom: 150rpx;
		left: 50%;
		transform: translateX(-50%);
		background-color: rgba(0, 0, 0, 0.7);
		color: white;
		padding: 20rpx 40rpx;
		border-radius: 50rpx;
		font-size: 26rpx;
		z-index: 9999;
		animation: fadeInOut 2s forwards;
	}

	@keyframes fadeInOut {
		0% {
			opacity: 0;
		}

		20% {
			opacity: 1;
		}

		80% {
			opacity: 1;
		}

		100% {
			opacity: 0;
		}
	}

	@keyframes shine {
		0% {
			transform: translateX(-100%) rotate(30deg);
		}

		100% {
			transform: translateX(100%) rotate(30deg);
		}
	}
</style>