<template>
	<view class="integrated-search-container">
		<!-- 搜索框区域 -->
		<view class="search-header">
			<view class="search-wrapper" :style="{ width: searchWidth }">
				<!-- 商品搜索组件 -->
				<goods-search v-if="searchType === 'goods'" ref="goodsSearchRef" :width="searchWidth"
					:background="background" :hidden-icon="false" :mode="mode" @select="handleGoodsSelect" />

				<!-- 品牌搜索组件 -->
				<common-search v-else ref="commonSearchRef" :width="searchWidth" :background="background"
					:fontSize="fontSize" :hidenIcon="false" :mode="mode" @select="handleBrandSelect" />
			</view>
			<!-- 切换按钮 -->
			<view class="toggle-button" @tap="toggleSearchType">
				<text>{{ searchType === 'goods' ? '娃物' : '娃店' }}</text>
			</view>
		</view>

		<!-- 搜索结果区域 -->
		<view v-if="hasResults" class="results-container">
			<!-- 商品搜索结果 -->
			<view v-if="searchType === 'goods' && goodsResults.length > 0" class="goods-results">
				<view v-for="item in goodsResults" :key="item.id" class="result-item" @tap="selectGoods(item)">
					<view class="brand-tag">{{ item.brand_name }}</view>
					<text class="goods-name">{{ item.name }}</text>
				</view>
			</view>

			<!-- 品牌搜索结果 -->
			<view v-else-if="searchType === 'brand' && brandResults.length > 0" class="brand-results">
				<view v-for="item in brandResults" :key="item.id" class="result-item" @tap="selectBrand(item)">
					{{ item.name }}
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed
	} from 'vue';

	// 搜索类型：'goods' 或 'brand'
	const searchType = ref('goods');

	// 商品搜索结果
	const goodsResults = ref([]);

	// 品牌搜索结果
	const brandResults = ref([]);

	// 组件引用
	const goodsSearchRef = ref(null);
	const commonSearchRef = ref(null);

	// 计算属性：是否有搜索结果
	const hasResults = computed(() => {
		return (searchType.value === 'goods' && goodsResults.value.length > 0) ||
			(searchType.value === 'brand' && brandResults.value.length > 0);
	});

	// 切换搜索类型
	const toggleSearchType = () => {
		// 清空当前搜索结果
		if (searchType.value === 'goods') {
			goodsResults.value = [];
		} else {
			brandResults.value = [];
		}

		// 切换搜索类型
		searchType.value = searchType.value === 'goods' ? 'brand' : 'goods';
	};

	// 处理商品搜索结果
	const handleGoodsSelect = (goods) => {
		goodsResults.value = goods ? [goods] : [];
		// 添加：立即触发submit事件
		if (goods) {
			emit('submit', {
				type: 'goods',
				data: goods
			});
		}
	};

	// 处理品牌搜索结果
	const handleBrandSelect = (id, name) => {
		if (id === 0) {
			brandResults.value = [];
		} else {
			brandResults.value = [{
				id,
				name
			}];
			// 添加：立即触发submit事件
			emit('submit', {
				type: 'brand',
				data: {
					id,
					name
				}
			});
		}
	};
	// 选择商品
	const selectGoods = (goods) => {
		if (props.mode === 'jump') {
			uni.navigateTo({
				url: `/pages/goods/goods?goods_id=${goods.id}`
			});
		}
	};

	// 选择品牌
	const selectBrand = (brand) => {
		if (props.mode === 'jump') {
			uni.navigateTo({
				url: `/pages/brand/brand?brand_id=${brand.id}`
			});
		}
	};

	// 组件属性
	const props = defineProps({
		mode: {
			type: String,
			default: 'jump',
			validator: (value) => ['jump', 'fill'].includes(value)
		},
		width: {
			type: String,
			default: '100%'
		},
		background: {
			type: String,
			default: '#fff'
		},
		fontSize: {
			type: String,
			default: '28rpx'
		}
	});

	// 计算搜索框宽度（减去切换按钮宽度）
	const searchWidth = computed(() => {
		return "700rpx"
	});

	// 事件定义 - 添加 submit 事件
	const emit = defineEmits(['submit']);
</script>

<style lang="less" scoped>
	.integrated-search-container {
		width: v-bind('props.width');
		position: relative;
	}

	.search-header {
		display: flex;
		align-items: center;
		gap: 35rpx;
	}
	
	.search-wrapper 
	{
		flex: 1;
		padding-left: 20rpx;
	}
	.toggle-button {
		flex-shrink: 0;
		background: linear-gradient(135deg, #97e7f7, #d5acd6);
		color: #fff;
		padding: 10rpx 20rpx;
		border-radius: 50rpx;
		font-size: 26rpx;
		font-weight: bold;
		box-shadow: 0 4rpx 12rpx rgba(164, 148, 178, 0.3);
		transition: all 0.3s ease;

		text {
			color: #fff;
		}

		&:active {
			transform: scale(0.95);
			box-shadow: 0 2rpx 6rpx rgba(164, 148, 178, 0.3);
		}
	}

	.results-container {
		margin-top: 20rpx;
		background: #fff;
		border-radius: 16rpx;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
		max-height: 500rpx;
		overflow-y: auto;
		position: absolute;
		width: 100%;
		z-index: 100;

		.result-item {
			padding: 24rpx;
			border-bottom: 1rpx solid #f0f0f0;
			display: flex;
			align-items: center;

			&:last-child {
				border-bottom: none;
			}

			&:active {
				background-color: #f9f9f9;
			}
		}
	}

	.goods-results {
		.brand-tag {
			background: #f0f0f0;
			color: #666;
			font-size: 24rpx;
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

	.brand-results {
		.result-item {
			font-size: 28rpx;
			color: #333;
			padding: 20rpx 24rpx;

			&:before {
				content: '🏷️';
				margin-right: 12rpx;
			}
		}
	}
</style>