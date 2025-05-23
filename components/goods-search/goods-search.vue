<!-- goods-search -->
<template>
	<!-- 新增遮罩层 -->
	<view v-if="showResults" class="mask-layer" @tap="closeResults"></view>
	<view class="search_tab" :class="$attrs.class" :style="{ background: background || '#fff' }">
		<image v-if="!hiddenIcon" class="icon_image" src="../../static/search.png"></image>
		<input class="common_search_input" placeholder="请输入商品名称..." :value="inputValue" @input="onSearchInput"
			:style="{ fontSize: fontSize || '22rpx' }" />
		<image class="icon_image" src="../../static/cancel.png" @tap="cancel" v-if="results.length > 0"></image>
	</view>

	<!-- 商品搜索结果 -->
	 <scroll-view 
	    v-if="results.length > 0" 
	    class="search_results" 
	    :style="{ width: width }" 
	    scroll-y
	  >
		<view v-for="item in results" :key="item.id" class="result_item" @tap="onTap(item)">
			<view class="brand-tag" v-if="item.brand_name">{{ item.brand_name }}</view>
			<text class="goods-name">{{ item.name }}</text>
		</view>
	</scroll-view>
</template>

<script setup>
	import {
		ref,
		computed,
		watch,
	} from 'vue';
	import {
		websiteUrl
	} from "../../common/config.js";

	// 新增显示状态
	const showResults = ref(false);

	const props = defineProps({
		modelValue: {
			type: String,
			default: ''
		},
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
		hiddenIcon: {
			type: Boolean,
			default: true
		},

	});

	const emit = defineEmits(['select', 'update:modelValue']);
	// const searchTerm = ref('');
	const results = ref([]);

	// 使用computed处理输入值
	const inputValue = computed({
		get: () => props.modelValue,
		set: (val) => emit('update:modelValue', val)
	});


	// 监听results变化控制遮罩层
	watch(results, (newVal) => {
		showResults.value = newVal.length > 0;
	});

	// 新增关闭方法
	const closeResults = () => {
		results.value = [];
		showResults.value = false;
	};



	// 修改onSearchInput方法
	const onSearchInput = async (e) => {
		inputValue.value = e.detail.value; // 更新双向绑定值
		const searchValue = e.detail.value.trim();
		showResults.value = true; // 新增显示控制
		if (!searchValue) {
			results.value = [];
			return;
		}

		try {
			const res = await uni.request({
				url: websiteUrl + `/search-goods?search=${encodeURIComponent(searchValue)}`,
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
		}
		if (props.mode === 'fill') {
			emit('select', goods);
			inputValue.value = goods.name; // 直接更新双向绑定值
			results.value = [];
		}
		closeResults(); // 新增关闭
	};

	const cancel = () => {
		closeResults(); // 替换原有清空逻辑
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

			&:first-child {
				margin-right: 16rpx;
			}

			&:last-child {
				margin-left: 16rpx;
			}
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
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
		max-height: 60vh;
		position: absolute;
		z-index: 1001;

		.result_item {
			display: flex;
			align-items: center;
			padding: 24rpx;
			border-bottom: 1rpx solid #f0f0f0;

			&:last-child {
				border-bottom: none;
			}

			&:active {
				background: #f8f8f8;
			}

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

	.mask-layer {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0);
		z-index: 1000;
		/* 确保在搜索结果下方 */
	}
</style>