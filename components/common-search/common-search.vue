<template>
	<view class="search_tab">
		<image class="icon_image" src="../../static/search.png" v-if="props.mode == 'jump'"></image>
		<input class="common_search_input" placeholder="请输入品牌 …" v-model="searchTerm" @input="onSearchInput" :ignoreCompositionEvent="false" />
		<image class="icon_image" src="../../static/cancel.png" @tap="cancel" v-if="results.length > 0" ></image>
	</view>

	<!-- 显示搜索结果 -->
	<scroll-view v-if="results.length > 0" class="search_results" :style="{width: width}" scroll-y>
		<view v-for="item in results" :key="item.id" class="result_item"  @tap="onTap(item.id, item.name)">
			{{ item.name }}
		</view>
	</scroll-view >
</template>

<script setup>
	import { ref } from 'vue';
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
	  }
	});

	// 新增事件定义
	const emit = defineEmits(['select']);

	const searchTerm = ref('');
	const results = ref([]);


	const onSearchInput = async () => {
		if (searchTerm.value.trim() === '') {
			results.value = []; // 如果输入框为空，则清空结果
			return;
		}
		
		emit('select', 0, searchTerm.value);        // 清空向父组件传递的id

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
		searchTerm.value = brandName;   // 填充品牌名称
		results.value = [];             // 清空搜索结果
		emit('select', brandId, brandName);        // 向父组件传递选中ID
	  }
	};
	
	function cancel() {
		searchTerm.value = '';
		results.value = [];
	}
</script>

<style lang="less">
	.search_tab {
		// padding: 3px 10px;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		background: #fff;
		border-radius: 10px;
		// padding: 5px 0px 7px 5px;

		image {
			position: relative;
			margin-left: 5px;
			// top: 3px;
		}

		.common_search_input {
			display: inline-block;
			// margin-left: 15px;
			  padding: 10px 15px;
			width: calc(100% - 85px);
			// text-align: center;
			top: 2rpx;
			position: relative;
		}
	}

	.search_results {
		margin-top: 10px;
		padding: 10px;
		background-color: #f8f8f8;
		border-radius: 5px;
		position: absolute;
		z-index: 12;
		box-shadow: 0 0 15px #0000002b;
		max-height: 400rpx;
		.result_item {
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
</style>