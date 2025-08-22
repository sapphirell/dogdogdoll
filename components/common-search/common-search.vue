<!-- common-search -->
<template>
	<view style="width:100%">
		<view class="search_tab" :class="$attrs.class" :style="{
				background: background || '#fff'
			}">
			<image class="icon_image" src="../../static/search.png" v-if="!props.hiddenIcon && props.mode == 'jump'"></image>
			<!-- 索引选择器 - 修改为蓝色样式 -->
			<view v-if="showIndexSelector" class="index-selector">
				<picker mode="selector" :value="selectedIndex" :range="indexLabels" @change="handleIndexChange">
					<view class="selector-content">
						<text>{{ currentIndexLabel }}</text>
					</view>
				</picker>
			</view>
			<input class="common_search_input" placeholder="可以模糊搜索 o( ❛ᴗ❛ )o …" v-model="searchTerm"
				@input="onSearchInput" :ignoreCompositionEvent="false" />
			<view class="search-info-tap" v-if="results.length > 0">
				<text v-if="results.length > 0 && searchTerm.length < 5">拼音、缩写、别名都可以搜</text>
				<image class="icon_image" src="../../static/cancel.png" @tap="cancel"></image>
			</view>
			
			
		</view>

		<view style="position: relative;">
			<!-- 显示搜索结果 -->
			<scroll-view v-if="results.length > 0" class="search_results" style="height: 600rpx;"
				:style="{width: width}" scroll-y>
				<view class="close-associate result_item" @tap="closeAssociate" style="padding-top: 0;text-align: center;">
					<text>关闭联想</text>
				</view>
				<view v-for="item in results" :key="item.id" class="result_item" @tap="onTap(item.id, item.name)">
					{{ item.name }}
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed
	} from 'vue';
	import {
		websiteUrl,
	} from "../../common/config.js";

	// 新增 props 接收父组件参数
	const props = defineProps({
		mode: {
			type: String,
			default: 'jump', // 默认跳转模式
			validator: (value) => ['jump', 'fill'].includes(value) // 参数校验
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
		hiddenIcon: {
			type: Boolean,
			default: false
		},
		// 新增：是否显示索引选择器
		showIndexSelector: {
			type: Boolean,
			default: false
		},
		// 新增：索引选项配置
		indexOptions: {
			type: Array,
			default: () => [
				{ label: "店铺", value: "" },
				{ label: "妆师", value: "bjd_artist" },
				{ label: "毛娘", value: "hairstylist" }
			]
		},
		// 新增：默认选中的索引
		defaultIndex: {
			type: String,
			default: ""
		}
	});
	
	defineOptions({
		inheritAttrs: false
	})
	
	// 新增事件定义
	const emit = defineEmits(['select', 'close-associate', 'index-change']);

	const searchTerm = ref('');
	const results = ref([]);
	const currentIndex = ref(props.defaultIndex || (props.indexOptions[0]?.value || ""));
	
	// 当前索引对应的标签
	const currentIndexLabel = computed(() => {
		const option = props.indexOptions.find(opt => opt.value === currentIndex.value);
		return option ? option.label : "选择类型";
	});
	
	// 索引标签数组（用于picker的range属性）
	const indexLabels = computed(() => {
		return props.indexOptions.map(opt => opt.label);
	});
	
	// 当前选中的索引位置
	const selectedIndex = computed(() => {
		return props.indexOptions.findIndex(opt => opt.value === currentIndex.value);
	});
	
	// 关闭联想功能
	const closeAssociate = () => {
		console.log("开始通知", searchTerm.value)
		results.value = []; // 清空搜索结果
		emit('close-associate', searchTerm.value); // 通知父组件关闭联想
	};
	
	// 处理索引变更
	const handleIndexChange = (e) => {
		const index = e.detail.value;
		currentIndex.value = props.indexOptions[index]?.value || "";
		emit('index-change', currentIndex.value);
		
		// 如果已有搜索词，则重新搜索
		if (searchTerm.value.trim() !== '') {
			onSearchInput();
		}
	};

	const onSearchInput = async () => {
		if (searchTerm.value.trim() === '') {
			results.value = []; // 如果输入框为空，则清空结果
			return;
		}

		emit('select', 0, searchTerm.value); // 清空向父组件传递的id

		// 构建请求URL
		let url = `${websiteUrl.value}/search-brand?search=${encodeURIComponent(searchTerm.value)}`;
		
		// 如果当前索引不为空，添加到URL参数
		if (currentIndex.value) {
			url += `&index=${currentIndex.value}`;
		}

		try {
			const res = await uni.request({
				url: url,
				method: 'GET',
				header: {
					'Content-Type': 'application/json'
				}
			});

			console.log('请求结果:', res.data);
			if (res.data.status == "success") {
				// 判断res.data.data 是不是null
				if (res.data.data == null) {
					results.value = [];
					return;
				}
				results.value = res.data.data;
				return
			} else {
				results.value = [];
				return
			}

		} catch (error) {
			console.error('请求错误:', error);
			results.value = []; // 请求失败时清空结果
			return
		}
	};

	const onTap = (brandId, brandName) => {
		if (props.mode === 'jump') {
			// 跳转模式
			uni.navigateTo({
				url: `/pages/brand/brand?brand_id=${brandId}`
			});
		} else if (props.mode === 'fill') {
			// 填充模式
			searchTerm.value = brandName; // 填充品牌名称
			results.value = []; // 清空搜索结果
			emit('select', brandId, brandName); // 向父组件传递选中ID
		}
	};

	function cancel() {
		searchTerm.value = '';
		results.value = [];
	}
</script>

<style lang="less" scoped>
	.search_tab {
		box-sizing: border-box;
		display: flex;
		align-items: center;
		background: #fff;
		border-radius: 10px;
		width: 100%;
		position: relative;
		height: 72rpx;
		/* 统一高度 */
		padding: 0 20rpx;
		/* 统一内边距 */

		.icon_image {
			width: 36rpx;
			/* 统一图标大小 */
			height: 36rpx;
			/* 统一图标大小 */
			margin-right: 16rpx;
			/* 统一图标间距 */
		}

		.common_search_input {
			flex: 1;
			height: 100%;
			padding: 0;
			/* 统一内边距 */
			font-size: 23rpx;
			/* 统一字体大小 */
		}
		
		/* 索引选择器样式 - 修改为蓝色 */
		.index-selector {
			
			.selector-content {
				display: flex;
				align-items: center;
				justify-content: center;
				padding: 0 20rpx;
				height: 60rpx;
				border-radius: 30rpx;
				font-size: 24rpx;
				color: white;
				// box-shadow: 0 4rpx 10rpx rgba(116, 126, 229, 0.3);
				transition: all 0.3s ease;
				margin-right: 15rpx;
				
				&:active {
					transform: translateY(2rpx);
				}
				
				text {
					font-weight: 500;
				}
			}
		}
	}

	.search_results {
		padding: 10px;
		background-color: #f8f8f8;
		border-radius: 5px;
		position: absolute;
		z-index: 120;
		box-shadow: 0 0 15px #0000002b;
		max-height: 400rpx;
		font-size: 22rpx;
		box-sizing: border-box;

		.result_item {
			font-size: 22rpx;
			padding: 15px 0;
			cursor: pointer;
			color: #333;
			border-bottom: 1px solid #ececec;

			&:last-child {
				border-bottom: none;
			}

			&:hover {
				color: #007aff;
			}
		}
	}

	.search-info-tap {
		display: flex;
		align-items: center;
		position: relative;
		/* 改为相对定位 */
		margin-left: 10rpx;
		/* 添加左边距 */

		text {
			color: #fff;
			background: linear-gradient(135deg, #a494b2, #fad0c4);
			font-size: 20rpx;
			padding: 3px 5px;
			border-radius: 3px;
			font-weight: 900;
			position: relative;
			bottom: 0;
			/* 取消垂直偏移 */
			margin-right: 8rpx;
			/* 添加右边距 */
		}

		.icon_image {
			width: 36rpx;
			height: 36rpx;
			margin-left: 0;
			/* 重置左边距 */
		}
	}

	.close-associate {
		text {
			font-size: 22rpx;
			color: #ccc;
		}
		&:active {
			background-color: #f0f0f0;
		}
	}
</style>
