<!-- /components/comment-input.vue -->
<template>
	<!-- 蒙版层 -->
	<view class="mask" v-show="displayMask" @tap="handleMaskTap"></view>

	<!-- 评论框 -->
	<view class="bottom_tab" :adjust-position="false" :style="{ paddingBottom: footerBottomHeight }">
		<!-- 输入框 -->
		<textarea :focus="isFocused" class="comment_input unified-textarea" :class="{ expanded: isFocused }" ref="inputRef"
			v-model="commentText" @focus="handleFocus" @blur="handleBlur" :adjust-position="false"
			:placeholder="replyInfo.username ? '回复@' + replyInfo.username + ' ' : '写评论...'"></textarea>

		<!-- 按钮 -->
		<button @click="handleSubmit">写评论</button>
	</view>
</template>

<script setup>
	import {
		ref,
		computed,
		getCurrentInstance,
	} from 'vue'
	import {
		onLoad,
		onShow
	} from "@dcloudio/uni-app";

	import {
		getScene
	} from "@/common/config.js"
	const props = defineProps({
		replyInfo: {
			type: Object,
			default: () => ({})
		},
		targetId: {
			type: String,
			required: true
		},
		safeBottom: {
			type: Number,
			default: 10
		}
	})
	// 暴露聚焦方法
	const inputRef = ref(null) // 需要关联到真实的textarea元素
	// 聚焦状态
	const isFocused = ref(false)

	const emit = defineEmits(['submit', 'update:replyInfo'])
	const instance = getCurrentInstance()
	const commentText = ref('')
	const displayMask = ref(false)
	const keyboardHeight = ref(0)
	const systemInfo = uni.getSystemInfoSync()
	const footerBottomHeight = computed(() => {
		let safeBottomVar = systemInfo.safeAreaInsets?.bottom || 10
		console.log("底部安全距离1:", systemInfo.safeAreaInsets?.bottom, "=>", safeBottomVar)

		const safeBottom = safeBottomVar + keyboardHeight.value
		return `${safeBottom}px`
	})

	const keyboardHeightChangeHandler = (res) => {
		console.log("键盘高度变化", res)
		keyboardHeight.value = res.height
	}

	const handleFocus = () => {
		displayMask.value = true
		isFocused.value = true
	}

	const handleBlur = () => {
		displayMask.value = false
		isFocused.value = false
	}

	const handleMaskTap = () => {
		displayMask.value = false
		isFocused.value = false
		uni.hideKeyboard()
	}

	const handleSubmit = () => {
		if (!commentText.value.trim()) {
			uni.showToast({
				title: '请输入评论内容',
				icon: 'none'
			})
			return
		}
		let scene = getScene()
		console.log("scene", scene)
		emit('submit', {
			content: commentText.value,
			target_id: props.targetId,
			type: 4,
			replyInfo: props.replyInfo,
			origin: scene,
		})

		commentText.value = ''
		emit('update:replyInfo', {})
	}


	// 暴露聚焦方法
	const focusInput = () => {
		isFocused.value = true
	}

	defineExpose({
		focusInput
	})

	onShow(() => {
		if (process.env.VUE_APP_PLATFORM == "h5") {
			//h5不会弹出软键盘
			return
		}
		console.log("注册键盘弹出事件")
		uni.onKeyboardHeightChange(keyboardHeightChangeHandler)
	})
</script>

<style lang="less" scoped>
	/* 保持原样式不变 */
	.mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: #fff;
		opacity: 0;
		z-index: 99;
		width: 100vw;
		height: 100vh;
	}

	// 底部tab
	.bottom_tab {
		display: flex;
		align-items: center;
		/* 垂直居中 */
		gap: 8px;
		/* 元素间距 */
		padding: 10px;
		box-sizing: border-box;
		left: 0px;
		position: fixed;
		bottom: 0px;
		z-index: 100;
		width: 100vw;
		background: #fff;

		.replyInfo {
			flex-shrink: 0;
			/* 禁止缩小 */
			max-width: 50px;
			/* 最大宽度限制 */
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			flex-shrink: 0;
			max-width: 50px;
			margin-right: 8px;
		}

		.comment_input {
			flex: 1;
			/* 占据剩余空间 */
			min-width: 0;
			/* 允许缩小 */
			flex: 1;
			margin-right: 8px;
			// min-height: 56rpx;
			background: #f2f2f2;
			border-radius: 5px;
			padding: 8px 8px 8px 10px;
			line-height: normal;
			font-size: 26rpx;
			color: #373838;
			// 聚焦时高度2倍
			height: 40rpx;
			transition: height 0.3s ease;

		}

		.comment_input.expanded {
			height: 80rpx !important;
		}

		button {
			flex-shrink: 0;
			/* 固定宽度 */
			width: 90px;
			/* 按钮固定宽度 */
			background: rgb(100, 198, 220);
			border-radius: 10px;
			width: 90px;
			color: rgb(255, 255, 255);
			font-size: 14px;
		}
	}

	uni-button:after {
		border: none;
	}
</style>