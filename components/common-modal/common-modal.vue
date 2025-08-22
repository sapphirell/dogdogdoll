<!-- components/common-modal.vue -->
<template>
	<view class="modal-mask" v-if="visible" @tap.stop="closeModal" @touchmove.stop.prevent="moveHandle"
	:style="maskStyle">  <!-- 修改：使用动态样式 -->
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
		onMounted  // 新增生命周期钩子
	} from 'vue'
	
	import {
		getScene
	} from "../../common/config.js";
	
	const isApp = ref(false)
	
	const props = defineProps({
		visible: Boolean,
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
			type: Boolean,
			default: true
		},
	})
	
	let modeClass = ref(['fade', 'zoom-in'])

	const emit = defineEmits(['update:visible'])

	// 新增：计算遮罩层样式
	const maskStyle = computed(() => {
		// App环境下完全透明，其他环境保持半透明遮罩
		return {
			backgroundColor: isApp.value ? 'rgba(0, 0, 0, 0)' : 'rgba(0, 0, 0, 0.5)'
		}
	})

	const containerStyle = computed(() => ({
		top: formatValue(props.top),
		height: formatValue(props.height)
	}))
	
	const moveHandle = () => false;

	const formatValue = (val) => {
		if (typeof val === 'number') return `${val}px`
		if (/\d$/.test(val)) return `${val}px`
		return val
	}

	const closeModal = () => {
		if (props.closeable) {
			emit('update:visible', false)
		}
	}
	
	// 新增：组件挂载时检测环境
	onMounted(() => {
		const scene = getScene()
		isApp.value = scene === 2 || scene === 3  // 2或3表示App环境
	})
</script>

<style scoped>
	.modal-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		justify-content: center;
		z-index: 1001;
		/* 移除背景色设置，改为动态绑定 */
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
