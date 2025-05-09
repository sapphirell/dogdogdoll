<!-- components/MyModal.vue -->
<template>
	<transition name="modal-fade">
		<view class="modal-mask" v-if="visible" @tap="closeModal" >
			<view class="modal-container" @tap.stop>
				<view class="modal-content">
					<slot></slot>
				</view>
			</view>
		</view>
	</transition>
</template>

<script setup>
	import {
		defineProps,
		defineEmits
	} from 'vue'

	const props = defineProps({
		visible: Boolean
	})

	const emit = defineEmits(['update:visible'])

	const closeModal = () => {
		console.log(props.visible)
		emit('update:visible', false)
	}
</script>

<style scoped>
	.modal-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 999;
		pointer-events: auto;
		/* 关键属性 */
	}

	.modal-container {
		background-color: #fff;
		border-radius: 8px;
		width: 80%;
		max-width: 600px;
		padding: 20px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
		pointer-events: auto;
		position: absolute;
		top: 20%;
		/* 确保弹窗内容可交互 */
		padding-top: 0rpx;
	}
</style>