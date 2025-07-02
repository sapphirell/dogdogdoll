<!-- common-search -->
<template>
	<view style="width:100%">
		<view class="search_tab" :class="$attrs.class" :style="{
				background: background || '#fff'
			}">
			<image class="icon_image" src="../../static/search.png" v-if="props.mode == 'jump'"></image>
			<input class="common_search_input" placeholder="可以模糊搜索娃社 o( ❛ᴗ❛ )o …" v-model="searchTerm"
				@input="onSearchInput" :ignoreCompositionEvent="false" />
			<view class="search-info-tap" v-if="results.length > 0">
				<text v-if="results.length > 0 && searchTerm.length < 5">拼音、缩写、别名都可以搜</text>
				<image class="icon_image" src="../../static/cancel.png" @tap="cancel" ></image>
			</view>
		
		</view>
		
		<view style="position: relative;">
			<!-- 显示搜索结果 -->
			<scroll-view v-if="results.length > 0" class="search_results" :style="{width: width}" scroll-y>
				<view v-for="item in results" :key="item.id" class="result_item" @tap="onTap(item.id, item.name)">
					{{ item.name }}
				</view>
			</scroll-view>
		</view>
		
	</view>

</template>

<script setup>
	import {
		ref
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
	});
	defineOptions({
		inheritAttrs: false
	})
	// 新增事件定义
	const emit = defineEmits(['select']);

	const searchTerm = ref('');
	const results = ref([]);


	const onSearchInput = async () => {
		if (searchTerm.value.trim() === '') {
			results.value = []; // 如果输入框为空，则清空结果
			return;
		}

		emit('select', 0, searchTerm.value); // 清空向父组件传递的id

		// 发起请求进行搜索
		try {
			const res = await uni.request({
				url: websiteUrl + `/search-brand?search=${searchTerm.value}`,
				method: 'GET',
				header: {
					'Content-Type': 'application/json'
				}
			});

			console.log('请求结果:', res.data);
			if (res.data.status == "success") {
				//判断res.data.data 是不是null
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

		image {
			position: relative;
			margin-left: 5px;
		}

		.common_search_input {
			display: inline-block;
			// margin-left: 15px;
			padding: 10px 15px;
			width: calc(100% - 85px);
			// text-align: center;
			top: 2rpx;
			position: relative;
			font-size: 22rpx;
		}
	}

	.search_results {
		padding: 10px;
		background-color: #f8f8f8;
		border-radius: 5px;
		position: absolute;
		top: 0px;
		z-index: 12;
		box-shadow: 0 0 15px #0000002b;
		max-height: 400rpx;
		font-size: 22rpx;

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
		position: absolute;
		right: 10rpx;
		vertical-align: middle;
		bottom: 0px;
		text {
			color: #fff;
			background: linear-gradient(135deg, #a494b2, #fad0c4);
			font-size: 20rpx;
			width: 260px;
			padding: 3px 5px;
			border-radius: 3px;
			font-weight: 900;
			position: relative;
			bottom: 15rpx;
		}
	
	}
</style>