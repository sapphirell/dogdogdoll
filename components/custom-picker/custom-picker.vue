<!-- custom-picker -->
<template>
	<view class="custom-select">
		<input v-model="inputValue" @click="toggleOpen" @input="callbackValue" placeholder="请选择或输入" class="select-input"
			:style="{ margin: margin }" />
	
			<view v-if="isOpen" class="dropdown">
				<view v-for="item in filteredList" :key="item.id" @click="selectOption(item)" class="dropdown-item">
					{{ item.name }}
				</view>
			</view>
		
	</view>
</template>

<script setup>
	import {
		ref,
		computed
	} from 'vue';

	const props = defineProps({
		dataList: {
			type: Array,
			required: true,
		},
		margin: {
			type: String,
			default: '0',
		}
	});

	const emit = defineEmits(['select']);

	const inputValue = ref('');
	const isOpen = ref(false);
	// const filteredList = ref([...props.dataList]);
	
	// 使用 computed 动态计算 filteredList
	const filteredList = computed(() => {
	  return props.dataList.filter(item =>
	    item.name.toLowerCase().includes(inputValue.value.toLowerCase())
	  );
	});

	const callbackValue = () => {
		// 输入内容传递到父组件
		emit('select', 0, inputValue.value);
	};


	const toggleOpen = () => {
		isOpen.value = !isOpen.value
	}

	const selectOption = (item) => {
		inputValue.value = item.name;
		isOpen.value = false;
		emit('select', item.id, item.name);
	};
	
</script>

<style scoped>
		.custom-select {
			position: relative;
			z-index: 2;
		}
	
		.select-input {
			padding: 20rpx 32rpx;
			border-radius: 12rpx;
			background: #f8f8f8;
			font-size: 22rpx;
			color: #333;
			height: 72rpx;
			box-sizing: border-box;
			width: 100%;
			line-height: normal;
		}
	
		.dropdown {
			position: absolute;
			width: 100%;
			max-height: 320rpx;
			overflow-y: auto;
			border-radius: 12rpx;
			background-color: #fff;
			z-index: 1000;
			box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.08);
			margin-top: 8rpx;
			border: 1rpx solid #eee;
		}
	
		.dropdown-item {
			padding: 24rpx 32rpx;
			font-size: 22rpx;
			color: #333;
			transition: all 0.2s;
			position: relative;
		}
	
		.dropdown-item:active {
			background-color: #f8f8f8;
		}
	
		.dropdown-item:not(:last-child)::after {
			content: '';
			position: absolute;
			left: 32rpx;
			right: 32rpx;
			bottom: 0;
			height: 1rpx;
			background: #f0f0f0;
		}
	
		/* 自定义滚动条 */
		.dropdown::-webkit-scrollbar {
			width: 4rpx;
		}
	
		.dropdown::-webkit-scrollbar-track {
			background: #f8f8f8;
			border-radius: 4rpx;
		}
	
		.dropdown::-webkit-scrollbar-thumb {
			background: #ddd;
			border-radius: 4rpx;
		}
	
		/* 优化动画效果 */
		.slide-fade-enter-active {
			transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		}
	
		.slide-fade-leave-active {
			transition: all 0.15s cubic-bezier(0.4, 0, 1, 1);
		}
	
		.slide-fade-enter-from,
		.slide-fade-leave-to {
			opacity: 0;
			transform: translateY(-16rpx);
		}
</style>