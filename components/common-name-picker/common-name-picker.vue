<template>
	<view class="select-container" ref="containerRef">
		<view class="select-input" @click="toggleOpen">
			<text class="selected-value">{{ selectedValue || placeholder }}</text>
			<view class="arrow-icon" :class="{ 'rotate': isOpen }">
				<uni-icons type="arrowdown" size="16" color="#666"></uni-icons>
			</view>
		</view>
		<!-- <text>{{ isOpen}}</text> -->

		<view class="popup-container">
			<!-- 遮罩层 -->
			<view class="mask" v-if="isOpen" @click="toggleOpen()"></view>
			<!-- 选项列表 -->
			<!-- <uni-transition mode-class="fade" :show="isOpen"> -->
				<view class="options-wrapper" v-if="isOpen">
					<scroll-view scroll-y="true" class="select-options">
						<view v-for="(item, index) in dataList" :key="index" class="option-item"
							:class="{ 'selected': selectedValue === item }" @click.stop="selectItem(item)">
							{{ item }}
							<uni-icons v-if="selectedValue === item" type="checkmarkempty" size="18" color="#007AFF"
								class="check-icon"></uni-icons>
						</view>
					</scroll-view>
				</view>
			<!-- </uni-transition> -->
		</view>

	</view>
</template>

<script setup>
	import {
		ref,
		onMounted,
	} from 'vue'

	const props = defineProps({
		dataList: {
			type: Array,
			default: () => []
		},
		placeholder: {
			type: String,
			default: '请选择'
		},
		defaultValue: {
			type: String,
			default: ''
		}
	})

	const emit = defineEmits(['select'])

	const isOpen = ref(false)
	const selectedValue = ref(props.defaultValue)

	const toggleOpen = () => {
		isOpen.value = !isOpen.value
	}

	const selectItem = (item) => {
		selectedValue.value = item
		isOpen.value = false
		emit('select', item)
	}

	onMounted(() => {
		console.log("初始值", isOpen.value)
		isOpen.value = false
	})
</script>

<style scoped>
	.select-container {
		position: relative;
		width: 100%;
		font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
	}

	.select-input {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px 16px;
		background-color: #fff;
		border-radius: 8px;
		font-size: 14px;
		color: #333;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}

	.selected-value {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.arrow-icon {
		transition: transform 0.3s ease;
		margin-left: 8px;
	}

	.arrow-icon.rotate {
		transform: rotate(180deg);
	}

	.mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.3);
		z-index: 99;
	}

	.popup-container {
		position: relative;
		z-index: 100;
	}

	.options-wrapper {
		position: absolute;
		top: 8px;
		left: 0;
		right: 0;
		z-index: 10000;
		background: #fff;
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		max-height: 250px;
		overflow: hidden;
	}

	.select-options {
		max-height: 250px;
		padding: 8px 0;
	}

	.option-item {
		position: relative;
		padding: 12px 16px;
		font-size: 14px;
		color: #333;
		display: flex;
		align-items: center;
		justify-content: space-between;

	}

	.option-item:active {
		background-color: #f5f5f5;
	}

	.option-item.selected {
		color: #007AFF;
		font-weight: 500;
		background-color: #f0f7ff;
	}

	.check-icon {
		margin-left: 8px;
	}

	/* 动画优化 */

	.options-wrapper {
		position: absolute;
		z-index: 10000;
	}
</style>