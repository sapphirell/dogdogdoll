<template>
	<!-- 表态组件主容器 -->
	<view class="impression-container">
		<!-- 标题区域 -->
		<view class="impression-header">
			<text class="title">你对它的印象怎样？</text>
			<text class="subtitle">（轻触表态）</text>
			<!-- <text class="subtitle">({{ totalCount }}条表态)</text> -->
		</view>

		<!-- 表态列表区域 - 换行布局 -->
		<view class="impression-list">
			<!-- 所有表态项 -->
			<view 
				v-for="(item, index) in allImpressions" 
				:key="item.id || 'default-' + item.content"
				:class="['impression-item', { 'active': item.selected }]"
				@tap="handleImpressionClick(item)">
				<text class="impression-text">{{ item.content }}</text>
				<text class="impression-count">{{ item.count }}</text>
			</view>

			<!-- 添加新表态按钮 -->
			<view class="add-impression" @tap="showAddModal">
				<text class="plus-icon">+</text>
				<text class="add-text">添加表态</text>
			</view>
		</view>

		<!-- 添加新表态模态框 -->
		<common-modal :visible="modalVisible" @update:visible="modalVisible = $event" width="80%" top="30%">
			<view class="modal-content">
				<text class="modal-title">添加新表态</text>
				<input class="input-field" v-model="newImpression" placeholder="请输入表态内容"
					placeholder-style="color: #aaa;" @confirm="confirmAdd" />
				<view class="modal-actions">
					<button class="cancel-btn" @tap="cancelAdd">取消</button>
					<button class="confirm-btn" @tap="confirmAdd">确定</button>
				</view>
			</view>
		</common-modal>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted,
		watch,
		computed
	} from 'vue';
	import {
		websiteUrl,
		asyncGetUserInfo
	} from '../../common/config.js';

	// 组件属性
	const props = defineProps({
		target_id: {
			type: String,
			required: true
		},
		type: {
			type: String,
			required: true
		},
		goodsType : {
			type: Number,
			required: true
		}
	});

	// 响应式数据
	const impressions = ref([]); // 已有表态
	const defaultImpressionTitles = ref([]); // 默认表态标题
	const totalCount = ref(0);
	const newImpression = ref('');
	const modalVisible = ref(false);
	const userInfo = ref(null);


	// 计算所有表态（合并已有和默认，并按数量排序）
	const allImpressions = computed(() => {
		// 1. 创建已有表态的映射
		const existingMap = {};
		impressions.value.forEach(item => {
			existingMap[item.content] = item;
		});
		
		// 2. 处理默认表态
		const defaultItems = defaultImpressionTitles.value.map(title => {
			// 如果已有表态中有相同内容，则使用已有数据
			if (existingMap[title]) {
				return {
					...existingMap[title],
					isDefault: true
				};
			}
			
			// 否则创建新的默认表态项
			return {
				content: title,
				count: 0,
				selected: false,
				isDefault: true
			};
		});
		
		// 3. 添加不在默认列表中的已有表态
		const uniqueExisting = impressions.value.filter(item => 
			!defaultImpressionTitles.value.includes(item.content)
		);
		
		// 4. 合并所有表态
		const merged = [...defaultItems, ...uniqueExisting];
		
		// 5. 按照点赞数量从高到低排序
		return merged.sort((a, b) => b.count - a.count);
	});


	// 获取默认表态列表 - 根据商品类型
	const fetchDefaultImpressions = async () => {
	  try {
	    // 根据商品类型映射为接口需要的参数
	    let impressionType = 9; // 默认9
	    
	    // 根据商品类型映射
	    switch (props.goodsType) {
	      case "整体" || "单体": // 整体、单体
	        impressionType = 1;
	        break;
	      case "单头": // 单头
	        impressionType = 2;
	        break;
	      case "娃衣"||"娃鞋": // 娃衣、娃鞋等
	        impressionType = 3;
	        break;
	      case "眼珠": // 眼珠
	        impressionType = 4;
	        break;
	      case "假发": // 假发
	        impressionType = 5;
	        break;
	      default:
	        impressionType = 9; // 默认
	    }
	    
	    const res = await uni.request({
	      url: `${websiteUrl}/impression/default`,
	      method: 'GET',
	      data: {
	        type: impressionType
	      }
	    });
	    
	    if (res.statusCode === 200 && res.data.status === 'success') {
	      defaultImpressionTitles.value = res.data.data;
	    } else {
	      console.error('获取默认表态失败:', res.data);
	      uni.showToast({
	        title: '获取默认表态失败',
	        icon: 'none'
	      });
	    }
	  } catch (error) {
	    console.error('获取默认表态失败:', error);
	    uni.showToast({
	      title: '获取默认表态失败',
	      icon: 'none'
	    });
	  }
	};

	// 获取表态数据
	const fetchImpressionData = async () => {
		try {
			// 获取用户信息
			userInfo.value = await asyncGetUserInfo();

			// 获取表态统计
			const countsRes = await uni.request({
				url: `${websiteUrl}/impression/counts`,
				method: 'GET',
				data: {
					target_id: parseInt(props.target_id, 10),
					type_id: parseInt(props.type, 10),
				}
			});

			// 获取用户表态状态
			const statusRes = await uni.request({
				url: `${websiteUrl}/with-state/impression/status`,
				method: 'GET',
				data: {
					target_id: parseInt(props.target_id, 10),
					type_id: parseInt(props.type, 10),
				},
				header: {
					Authorization: uni.getStorageSync('token')
				}
			});

			// 处理数据
			if (countsRes.statusCode === 200 && countsRes.data.status === 'success') {
				const countsData = countsRes.data.data;

				// 计算总表态数
				totalCount.value = countsData.reduce((sum, item) => sum + item.count, 0);

				// 处理用户选择状态
				const userSelected = statusRes.statusCode === 200 && statusRes.data.status === 'success' ?
					statusRes.data.data.map(item => item.id) : [];

				// 组合数据
				impressions.value = countsData.map(item => ({
					...item,
					selected: userSelected.includes(item.id)
				}));
			}
		} catch (error) {
			console.error('获取表态数据失败:', error);
			uni.showToast({
				title: '获取表态数据失败',
				icon: 'none'
			});
		}
	};

	// 处理表态点击
	const handleImpressionClick = async (item) => {
		if (!userInfo.value) {
			// 未登录处理
			uni.showToast({
				title: '请先登录',
				icon: 'none'
			});
			return;
		}

		try {
			// 1. 创建请求数据
			const data = {
				target_id: parseInt(props.target_id, 10),
				type_id: parseInt(props.type, 10),
			};
			
			// 2. 如果是默认表态且没有ID，则使用内容
			if (item.isDefault && !item.id) {
				data.content = item.content;
			} else {
				data.impression_id = item.id;
			}

			if (item.selected) {
				// 3. 移除表态
				const res = await uni.request({
					url: `${websiteUrl}/with-state/impression/remove`,
					method: 'POST',
					header: {
						Authorization: uni.getStorageSync('token'),
						'Content-Type': 'application/json'
					},
					data: {
						impression_id: item.id
					}
				});

				if (res.statusCode === 200 && res.data.status === 'success') {
					// 4. 更新状态 - 使用响应式方法
					updateImpressionState(item, false);
				}
			} else {
				// 5. 添加表态
				const res = await uni.request({
					url: `${websiteUrl}/with-state/impression/add`,
					method: 'POST',
					header: {
						Authorization: uni.getStorageSync('token'),
						'Content-Type': 'application/json'
					},
					data
				});

				if (res.statusCode === 200 && res.data.status === 'success') {
					// 6. 更新状态 - 使用响应式方法
					updateImpressionState(item, true, res.data.data.impression_id);
				}
			}
		} catch (error) {
			console.error('操作失败:', error);
			uni.showToast({
				title: '操作失败',
				icon: 'none'
			});
		}
	};

	// 更新表态状态（确保响应式更新）
	const updateImpressionState = (item, isSelected, newId = null) => {
		// 1. 查找在 impressions 数组中的索引
		const impressionIndex = impressions.value.findIndex(imp => 
			imp.id === item.id || imp.content === item.content
		);
		
		// 2. 如果是新表态（默认表态首次点击）
		if (impressionIndex === -1 && isSelected) {
			// 创建新表态对象
			const newImpression = {
				id: newId,
				content: item.content,
				count: 1,
				selected: true
			};
			
			// 添加到已有表态列表
			impressions.value = [...impressions.value, newImpression];
			totalCount.value++;
			return;
		}
		
		// 3. 更新现有表态
		if (impressionIndex !== -1) {
			// 创建新数组确保响应式更新
			const updatedImpressions = [...impressions.value];
			const updatedItem = { ...updatedImpressions[impressionIndex] };
			
			if (isSelected) {
				// 选中状态
				updatedItem.selected = true;
				updatedItem.count = (updatedItem.count || 0) + 1;
				if (newId) updatedItem.id = newId; // 更新ID（如果是默认表态首次点击）
				totalCount.value++;
			} else {
				// 取消选中状态
				updatedItem.selected = false;
				updatedItem.count = Math.max(0, updatedItem.count - 1);
				totalCount.value--;
			}
			
			// 更新数组
			updatedImpressions[impressionIndex] = updatedItem;
			impressions.value = updatedImpressions;
		}
	};

	// 显示添加模态框
	const showAddModal = () => {
		if (!userInfo.value) {
			uni.showToast({
				title: '请先登录',
				icon: 'none'
			});
			return;
		}

		newImpression.value = '';
		modalVisible.value = true;
	};

	// 取消添加
	const cancelAdd = () => {
		modalVisible.value = false;
	};

	// 确认添加新表态
	const confirmAdd = async () => {
		if (!newImpression.value.trim()) {
			uni.showToast({
				title: '请输入表态内容',
				icon: 'none'
			});
			return;
		}

		try {
			const res = await uni.request({
				url: `${websiteUrl}/with-state/impression/add`,
				method: 'POST',
				header: {
					Authorization: uni.getStorageSync('token'),
					'Content-Type': 'application/json'
				},
				data: {
					target_id: parseInt(props.target_id, 10),
					type_id: parseInt(props.type, 10),
					content: newImpression.value.trim()
				}
			});

			if (res.statusCode === 200 && res.data.status === 'success') {
				// 添加新表态到列表（使用响应式更新）
				impressions.value = [
					...impressions.value,
					{
						id: res.data.data.impression_id,
						content: newImpression.value.trim(),
						count: 1,
						selected: true
					}
				];
				totalCount.value++;

				modalVisible.value = false;
				uni.showToast({
					title: '添加成功',
					icon: 'success'
				});
			}
		} catch (error) {
			console.error('添加表态失败:', error);
			uni.showToast({
				title: '添加表态失败',
				icon: 'none'
			});
		}
	};

	// 监听属性变化
	watch(() => [props.target_id, props.type], fetchImpressionData, {
		immediate: true
	});

	// 组件挂载时加载数据
	onMounted(() => {
		fetchDefaultImpressions();
		fetchImpressionData();
	});
</script>

<style lang="less">
	.impression-container {
		padding: 20rpx 30rpx;
		background-color: #fff;
		border-radius: 16rpx;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.05);
	}

	.impression-header {
		display: flex;
		align-items: baseline;
		margin-bottom: 20rpx;

		.title {
		    display: block;
		    font-size: 26rpx;
		    font-weight: bold;
		    color: #64c6dc;
		    margin-bottom: 0.78125rem;
		    padding-left: 0.3125rem;
		    border-left: 0.25rem solid #64c6dc;
			margin-left: 10rpx;
		}

		.subtitle {
			font-size: 22rpx; /* 调小字体 */
			color: #999;
		}
	}

	/* 换行布局 */
	.impression-list {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx; /* 减小间距 */
	}

	.impression-item {
		padding: 12rpx 20rpx; /* 减小内边距 */
		background-color: #f5f7fa;
		border-radius: 32rpx; /* 调小圆角 */
		display: inline-flex;
		align-items: center;
		transition: all 0.3s ease;
		flex-shrink: 0;

		&.active {
			background-color: #e6f9fc; /* 浅蓝色背景 */
			border: 1rpx solid #64c6dc; /* 主色调蓝色 */

			.impression-text {
				color: #64c6dc; /* 主色调蓝色 */
			}

			.impression-count {
				background-color: #64c6dc; /* 主色调蓝色 */
				color: #fff;
			}
		}

		.impression-text {
			font-size: 24rpx; /* 调小字体 */
			color: #666;
			margin-right: 10rpx; /* 调整间距 */
		}

		.impression-count {
			font-size: 20rpx; /* 调小字体 */
			background-color: #e8e8e8;
			color: #888;
			border-radius: 50%;
			width: 34rpx; /* 调小尺寸 */
			height: 34rpx; /* 调小尺寸 */
			display: flex;
			align-items: center;
			justify-content: center;
		}
	}

	.add-impression {
		padding: 12rpx 20rpx; /* 减小内边距 */
		background-color: #f5f7fa;
		border-radius: 32rpx; /* 调小圆角 */
		display: inline-flex;
		align-items: center;

		.plus-icon {
			font-size: 26rpx; /* 调小字体 */
			color: #64c6dc; /* 主色调蓝色 */
			margin-right: 6rpx; /* 调整间距 */
			font-weight: bold;
		}

		.add-text {
			font-size: 24rpx; /* 调小字体 */
			color: #666;
		}
	}

	.modal-content {
		padding: 30rpx; /* 减小内边距 */
		background-color: #fff;
		border-radius: 16rpx; /* 调小圆角 */

		.modal-title {
			display: block;
			text-align: center;
			font-size: 28rpx; /* 调小字体 */
			font-weight: 600;
			color: #333;
			margin-bottom: 30rpx; /* 调整间距 */
		}

		.input-field {
			height: 70rpx; /* 调小高度 */
			background-color: #f5f7fa;
			border-radius: 10rpx; /* 调小圆角 */
			padding: 0 16rpx; /* 调整内边距 */
			font-size: 24rpx; /* 调小字体 */
			color: #333;
			margin-bottom: 30rpx; /* 调整间距 */
		}

		.modal-actions {
			display: flex;
			justify-content: space-between;

			button {
				flex: 1;
				height: 70rpx; /* 调小高度 */
				line-height: 70rpx; /* 调整行高 */
				font-size: 26rpx; /* 调小字体 */
				border-radius: 10rpx; /* 调小圆角 */
				margin: 0 8rpx; /* 调整间距 */
				border: none;

				&::after {
					border: none;
				}
			}

			.cancel-btn {
				background-color: #f5f7fa;
				color: #666;
			}

			.confirm-btn {
				background-color: #64c6dc; /* 主色调蓝色 */
				color: #fff;
			}
		}
	}
</style>
