<!-- components/common-modal.vue -->
<template>
	<view class="modal-mask" v-if="visible" @tap="closeModal">
		<uni-transition :mode-class="modeClass" :show="visible">
			<view class="modal-container" :style="containerStyle" @tap.stop>
				<view class="modal-content">
					<slot></slot>
				</view>
			</view>
		</uni-transition>
	</view>

</template>

<script setup>
	import {
		defineProps,
		defineEmits,
		computed,
		ref,
	} from 'vue'
	const props = defineProps({
		visible: Boolean,
		// 新增参数
		top: {
			type: [String, Number],
			default: '30%'
		},
		width: {
			type: [String, Number],
			default: '80%'
		},
		height: {
			type: [String, Number],
			default: 'auto'
		},
		closeable: {
			// 点击遮罩层是否可以关闭
			type: Boolean,
			default: true
		},
	})
	let modeClass = ref(['fade', 'zoom-in'])

	const emit = defineEmits(['update:visible'])

	// 样式计算
	const containerStyle = computed(() => ({
		top: formatValue(props.top),
		// width: formatValue(props.width),
		height: formatValue(props.height)
	}))

	// 值格式化方法
	const formatValue = (val) => {
		if (typeof val === 'number') {
			return `${val}px`
		}
		if (/\d$/.test(val)) { // 纯数字默认加px
			return `${val}px`
		}
		return val
	}

	const closeModal = () => {
		if (props.closeable) {
			emit('update:visible', false)
		}
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
		z-index: 1001;
	}

	.modal-container {
		position: absolute;
		background-color: #fff;
		border-radius: 8px;
		padding: 20px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
		min-width: 200px;
		min-height: 100px;
		max-width: 100vw;
		left: 50%;
		transform: translateX(-50%);
	}

	.modal-content {
		/* position: relative; */
	}
</style>