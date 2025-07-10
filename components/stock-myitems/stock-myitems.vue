<script setup>
	import {
		ref,
		computed,
		onMounted,
		watch,
		nextTick
	} from 'vue';
	import {
		websiteUrl
	} from '../../common/config.js';

	const props = defineProps({
		accountBookData: Object
	});

	const emits = defineEmits(['go2editor', 'update-type', 'init-request', 'update:accountBookData']);

	// 分类管理相关状态
	const typeModalVisible = ref(false);
	const newTypeName = ref('');
	const customTypes = ref([]);
	const selectedType = ref(0);

	// 默认分类选项
	const defaultTypes = ["全部"];

	// 组合分类选项
	const typeOptions = computed(() => [
		...defaultTypes,
		...customTypes.value.map(t => t.name)
	]);

	// 当前分类合计价格
	const totalPrice = computed(() => {
		if (!props.accountBookData.account_books) return 0;
		return props.accountBookData.account_books.reduce((sum, item) => {
			return sum + (parseFloat(item.price) || 0);
		}, 0).toFixed(2);
	});

	// 获取第一张图片 - 修复路径问题
	const getFirstImage = (imageUrls) => {
		if (!imageUrls) return '';

		// 处理可能包含逗号分隔的多个URL
		const urls = imageUrls.split(',');
		const firstUrl = urls[0]?.trim() || '';

		// 如果是相对路径，转换为绝对路径
		if (firstUrl.startsWith('/')) {
			return `${websiteUrl}${firstUrl}`;
		}

		// 如果是完整URL直接返回
		if (firstUrl.startsWith('http')) {
			return firstUrl;
		}

		// 默认返回空字符串
		return '';
	};

	// 获取分类数据
	const getAccountTypes = async () => {
		const token = uni.getStorageSync('token');
		try {
			const res = await uni.request({
				url: websiteUrl + '/with-state/account-types',
				method: 'GET',
				header: {
					'Authorization': token
				}
			});
			customTypes.value = res.data.data || [];
		} catch (err) {
			console.error('获取分类失败:', err);
		}
	};

	// 添加分类
	const addNewType = async () => {
		if (!newTypeName.value.trim()) {
			uni.showToast({
				title: '请输入分类名称',
				icon: 'none'
			});
			return;
		}

		const token = uni.getStorageSync('token');
		try {
			await uni.request({
				url: websiteUrl + '/with-state/add-account-type',
				method: 'POST',
				header: {
					'Authorization': token
				},
				data: {
					name: newTypeName.value.trim()
				}
			});
			await getAccountTypes();
			newTypeName.value = '';
			uni.showToast({
				title: '添加成功'
			});
		} catch (err) {
			uni.showToast({
				title: '添加失败',
				icon: 'none'
			});
		}
	};

	// 删除分类
	const deleteType = async (id) => {
		uni.showModal({
			title: '确认删除',
			success: async (res) => {
				if (res.confirm) {
					const token = uni.getStorageSync('token');
					try {
						const response = await uni.request({
							url: websiteUrl + '/with-state/delete-account-type',
							method: 'POST',
							header: {
								'Authorization': token,
								'Content-Type': 'application/json'
							},
							data: {
								id
							}
						});

						const resData = response.data;
						if (resData.status === "success") {
							await getAccountTypes();
							uni.showToast({
								title: '删除成功'
							});
						} else {
							uni.showToast({
								title: resData.msg || '删除失败',
								icon: 'none'
							});
						}
					} catch (err) {
						console.error('删除失败:', err);
						uni.showToast({
							title: err.errMsg || '请求失败',
							icon: 'none'
						});
					}
				}
			}
		});
	};

	// 切换分类
	const updateSelectedType = (e) => {
		selectedType.value = e.detail.value;
		const selectedTypeName = typeOptions.value[selectedType.value];
		emits('update-type', selectedTypeName === "全部" ? "" : selectedTypeName);
	};

	// 初始化分类数据
	onMounted(() => {
		getAccountTypes();
	});



	// 确保组件挂载后初始化拖拽系统
	onMounted(() => {
		// 延迟执行以确保DOM渲染完成
		setTimeout(initDragSystem, 300);
	});
</script>

<template>
	<view class="tab_body_1st">
		<!-- 分类选择器区域 -->
		<view class="type-header">
			<view class="selector-container">
				<picker class="type-picker" mode="selector" :value="selectedType" :range="typeOptions"
					@change="updateSelectedType">
					<view class="selector-content">
						<text class="selector-label">分类:</text>
						<text class="selector-value">{{ typeOptions[selectedType] }}</text>
						<uni-icons type="arrowdown" size="14" color="#747EE5" class="selector-icon"></uni-icons>
					</view>
				</picker>
				<text class="manage-btn" @tap="typeModalVisible = true">
					<uni-icons type="gear" size="16" color="#fff"></uni-icons>
					<text>管理分类</text>
				</text>
			</view>
		</view>

		<!-- 合计金额 -->
		<view class="summary-container">
			<view class="summary-content">
				<uni-icons type="money" size="18" color="#74c9e5"></uni-icons>
				<text class="total-text">当前分类合计：¥{{ totalPrice }}</text>
			</view>
		</view>

		<!-- 内容区域 -->
		<view class="content" v-if="accountBookData.account_books?.length > 0">
			<shmily-drag-image v-model="accountBookData.account_books" border-radius="20"></shmily-drag-image>
		</view>

		<!-- 空状态 -->
		<view class="empty-state" v-else>
			<image class="empty-icon" src="/static/empty.jpg"></image>
			<text class="empty-text">空空如也～</text>
			<text class="empty-tip">点击下方按钮添加第一个物品吧！</text>
		</view>
	</view>

	<!-- 分类管理弹窗 -->
	<common-modal :visible="typeModalVisible" @update:visible="val => typeModalVisible = val" top="250rpx" height="65%">
		<view class="type-modal">
			<view class="modal-header">
				<text class="modal-title">分类管理</text>
				<uni-icons type="closeempty" size="24" color="#999" @tap="typeModalVisible = false"></uni-icons>
			</view>

			<view class="type-list">
				<view v-for="(type, index) in customTypes" :key="type.id" class="type-item">
					<view class="type-icon">
						<uni-icons type="folder" size="20" color="#747EE5"></uni-icons>
					</view>
					<text class="type-name">{{ type.name }}</text>
					<view class="type-actions">
						<uni-icons type="trash" size="20" color="#ff6666" @tap="deleteType(type.id)"></uni-icons>
					</view>
				</view>

				<view v-if="customTypes.length === 0" class="empty-types">
					<image class="empty-folder" src="/static/folder-empty.png"></image>
					<text class="empty-text">暂无自定义分类</text>
					<text class="empty-tip">请在下方添加新分类</text>
				</view>
			</view>

			<view class="add-type-container">
				<view class="add-type-form">
					<input v-model="newTypeName" placeholder="输入新分类名称" class="type-input" />
					<button class="add-btn" @tap="addNewType">
						<uni-icons type="plus" size="16" color="#fff"></uni-icons>
						<text>添加分类</text>
					</button>
				</view>
				<text class="hint-text">提示：分类名称不能超过10个字符</text>
			</view>
		</view>
	</common-modal>
</template>

<style lang="scss" scoped>
	
	/* 调整原有样式 */
	.content {
		padding: 0 20rpx;
	}

	/* 其他原有样式保持不变 */
	.type-header {
		padding: 15rpx 30rpx;
		background: linear-gradient(135deg, #f8f9ff, #eef2ff);
		border-radius: 16rpx;
		margin: 20rpx 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(116, 126, 229, 0.15);
	}

	.selector-container {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.type-picker {
		flex: 1;
	}

	.selector-content {
		display: flex;
		align-items: center;
		padding: 20rpx 25rpx;
		background: #fff;
		border-radius: 12rpx;
		box-shadow: 0 2rpx 10rpx rgba(116, 126, 229, 0.1);
		transition: all 0.3s ease;

		&:active {
			transform: translateY(2rpx);
			box-shadow: 0 1rpx 5rpx rgba(116, 126, 229, 0.15);
		}
	}

	.selector-label {
		font-size: 26rpx;
		color: #747EE5;
		font-weight: 600;
		margin-right: 15rpx;
	}

	.selector-value {
		font-size: 28rpx;
		color: #464646;
		font-weight: 600;
		flex: 1;
	}

	.selector-icon {
		margin-left: 10rpx;
	}

	.manage-btn {
		display: flex;
		align-items: center;
		font-size: 26rpx;
		color: white;
		background: linear-gradient(135deg, #97e7f7, #d5acd6);
		padding: 20rpx 30rpx;
		border-radius: 12rpx;
		margin-left: 20rpx;
		transition: all 0.3s ease;

		&:active {
			transform: translateY(2rpx);
			box-shadow: 0 2rpx 8rpx rgba(116, 126, 229, 0.3);
		}

		text {
			color: #fff;
			margin-left: 10rpx;
		}
	}

	.summary-container {
		margin: 0 30rpx 20rpx;
	}

	.summary-content {
		display: flex;
		align-items: center;
		padding: 20rpx 25rpx;
		background: linear-gradient(135deg, #f0f9ff, #e6f7ff);
		border-radius: 12rpx;
		box-shadow: 0 2rpx 10rpx rgba(116, 202, 229, 0.15);
	}

	.total-text {
		font-size: 28rpx;
		color: #74c9e5;
		font-weight: bold;
		margin-left: 12rpx;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 50vh;
		padding: 40rpx;
		text-align: center;

		.empty-icon {
			width: 300rpx;
			height: 300rpx;
			opacity: 0.8;
			margin-bottom: 40rpx;
			border-radius: 50%;
			box-shadow: 0 8rpx 25rpx rgba(0, 0, 0, 0.1);
		}

		.empty-text {
			font-size: 32rpx;
			color: #747EE5;
			margin-bottom: 15rpx;
			font-weight: 600;
		}

		.empty-tip {
			font-size: 26rpx;
			color: #999;
			line-height: 1.6;
		}
	}

	.type-modal {
		padding: 30rpx;
		box-sizing: border-box;
		width: 86vw;
		height: 100%;
		display: flex;
		flex-direction: column;

		.modal-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding-bottom: 25rpx;
			border-bottom: 1rpx solid #eee;
			margin-bottom: 25rpx;

			.modal-title {
				font-size: 32rpx;
				color: #464646;
				font-weight: 600;
			}
		}

		.type-list {
			flex: 1;
			overflow-y: auto;
			margin-bottom: 30rpx;

			.type-item {
				display: flex;
				align-items: center;
				padding: 25rpx;
				margin-bottom: 20rpx;
				background: #f8f9ff;
				border-radius: 16rpx;
				box-shadow: 0 2rpx 10rpx rgba(116, 126, 229, 0.1);
				transition: all 0.3s ease;

				&:active {
					transform: translateY(2rpx);
					box-shadow: 0 1rpx 5rpx rgba(116, 126, 229, 0.15);
				}

				.type-icon {
					width: 60rpx;
					height: 60rpx;
					background: rgba(116, 126, 229, 0.1);
					border-radius: 12rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					margin-right: 20rpx;
				}

				.type-name {
					flex: 1;
					font-size: 28rpx;
					color: #464646;
					font-weight: 500;
				}

				.type-actions {
					width: 80rpx;
					display: flex;
					justify-content: flex-end;
				}
			}

			.empty-types {
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				height: 300rpx;
				text-align: center;

				.empty-folder {
					width: 160rpx;
					height: 160rpx;
					opacity: 0.5;
					margin-bottom: 25rpx;
				}

				.empty-text {
					font-size: 28rpx;
					color: #747EE5;
					margin-bottom: 10rpx;
					font-weight: 500;
				}

				.empty-tip {
					font-size: 24rpx;
					color: #999;
				}
			}
		}

		.add-type-container {
			border-top: 1rpx solid #f0f0f0;
			padding-top: 25rpx;

			.add-type-form {
				display: flex;
				gap: 20rpx;
				margin-bottom: 20rpx;

				.type-input {
					flex: 1;
					border: 1rpx solid #e0e0e0;
					border-radius: 12rpx;
					padding: 20rpx;
					font-size: 28rpx;
					background: #fff;
					box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
				}

				.add-btn {
					display: flex;
					align-items: center;
					justify-content: center;
					background: linear-gradient(135deg, #747EE5, #9BA3EB);
					color: white;
					font-size: 26rpx;
					padding: 0 35rpx;
					border-radius: 12rpx;
					box-shadow: 0 4rpx 15rpx rgba(116, 126, 229, 0.3);
					transition: all 0.3s ease;

					&:active {
						transform: translateY(2rpx);
						box-shadow: 0 2rpx 8rpx rgba(116, 126, 229, 0.3);
					}

					text {
						margin-left: 8rpx;
					}
				}
			}

			.hint-text {
				font-size: 24rpx;
				color: #aaa;
				text-align: center;
			}
		}
	}
</style>