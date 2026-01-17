<template>
	<view class="mask" v-show="displayMask" @tap="handleMaskTap" @touchmove.stop.prevent="() => {}"></view>

	<view class="bottom_tab" @touchmove.stop.prevent="() => {}" :adjust-position="false"
		:style="{ paddingBottom: footerBottomHeight }">
		<view class="about_info">
			<view v-if="selectedAssociation" class="association-container">
				<view class="association-item">
					<uni-icons type="paperclip" size="20" color="#fff"></uni-icons>
					<text class="association-text">{{ selectedAssociation.name }}</text>
					<uni-icons type="close" size="20" color="#fff" @tap.stop="selectedAssociation = null"
						class="close-icon"></uni-icons>
				</view>
			</view>
			<view v-if="uploadedImageUrl" class="image-container">
				<view class="image-item">
					<image :src="uploadedImageUrl" mode="aspectFill" class="uploaded-image"></image>
					<view class="delete-icon" @tap.stop="uploadedImageUrl = ''">
						<uni-icons type="close" size="18" color="#fff"></uni-icons>
					</view>
				</view>
			</view>
		</view>
		<view class="bottom_input">
			<textarea :disable-default-padding="true" :focus="isFocused" class="comment_input unified-textarea"
				:class="{ expanded: isFocused }" ref="inputRef" v-model="commentText" @focus="handleFocus"
				@blur="handleBlur" :adjust-position="false"
				:placeholder="replyInfo.username ? '回复@' + replyInfo.username + ' ' : '写评论...'"></textarea>

			<button @click="handleSubmit">写评论</button>
		</view>


		<view v-show="showActionBar" class="action-bar">
			<view @tap.stop="toggleAnonymous">
				<uni-icons v-if="isAnonymous" type="eye-slash" size="22"
					:color="isAnonymous ? '#007aff' : ''"></uni-icons>
				<uni-icons v-else type="eye" size="22" color="#696a6c"></uni-icons>
			</view>
			<view @tap.stop="showPopup = true">
				<uni-icons type="plus" size="22" color="#696a6c"></uni-icons>
			</view>
			<view @tap.stop="selectImage">
				<uni-icons type="image" size="22" color="#696a6c"></uni-icons>
			</view>

			</view>


		<view>
			</view>

		<bottom-popup :show="showPopup" @close="showPopup = false">
			<switch-search :target-id="props.targetId" :reply-info="props.replyInfo" mode="fill"
				@submit="handleSearchSelect" v-if="showPopup"></switch-search>
			<view style="height: 900rpx;"></view>
		</bottom-popup>
	</view>
</template>

<script setup>
	import {
		ref,
		computed,
		getCurrentInstance,
		onMounted,
	} from 'vue'
	import {
		onLoad,
		onShow,

	} from "@dcloudio/uni-app";

	import {
		getScene,
		websiteUrl,
		image1Url,
	} from "@/common/config.js"

	import {
		chooseImage,
		jumpToCroper,
		getQiniuToken,
		uploadImageToQiniu
	} from "@/common/image.js";


	const showPopup = ref(false)
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
	const clickedInside = ref(false)
	// 显示操作栏
	const showActionBar = ref(false)
	// 是否隐身回复
	const isAnonymous = ref(false)
	// 选择的品牌或商品信息
	const selectedAssociation = ref(null)
	// 上传的图片地址
	const uploadedImageUrl = ref("")



	const keyboardHeight = ref(0)
	const systemInfo = uni.getSystemInfoSync()

	// [修改] 优化高度计算逻辑，解决抬起过高问题
	const footerBottomHeight = computed(() => {
		// 获取底部安全距离，默认为10
		let safeBottomVar = systemInfo.safeAreaInsets?.bottom || 10
		
		// 如果键盘高度大于0（键盘弹起）
		if (keyboardHeight.value > 0) {
			// 直接使用键盘高度支撑，不再叠加安全距离
			// 因为键盘高度通常是从屏幕底部计算的，已经包含了安全区域
			return `${keyboardHeight.value}px`
		}
		
		// 键盘未弹起时，仅使用安全距离
		return `${safeBottomVar}px`
	})

	const keyboardHeightChangeHandler = (res) => {
		console.log("键盘高度变化", res)
		keyboardHeight.value = res.height
	}

	const toggleAnonymous = (event) => {
		console.log("切换匿名状态", isAnonymous.value)

		// event.stopPropagation()
		isAnonymous.value = !isAnonymous.value
		if (isAnonymous.value) {
			uni.showToast({
				title: "进入匿名状态",
				icon: 'none'
			})
		} else {
			uni.showToast({
				title: "退出匿名状态",
				icon: 'none'
			})
		}

	}

	const handleFocus = () => {
		displayMask.value = true
		isFocused.value = true
		// 输入框聚焦时显示操作栏
		showActionBar.value = true
	}

	const handleBlur = () => {
		setTimeout(() => {
			if (!clickedInside.value) {
				// 在操作栏打开的时候不关闭蒙版
				if (!showActionBar.value) {
					displayMask.value = false
				}
				isFocused.value = false
			}
			clickedInside.value = false
		}, 200)
	}

	// 选择图片
	async function selectImage() {
		uni.chooseImage({
			count: 1,
			success: async (res) => {
				const tempFilePaths = res.tempFilePaths;

				// 依次上传所有图片（每张图片使用独立的 token）
				for (const filePath of tempFilePaths) {
					try {
						// 为每张图片获取独立的 token
						const tokenData = await getQiniuToken();
						const uploadRes = await uploadImageToQiniu(filePath, tokenData.token, tokenData
							.path);
						console.log("res:", uploadRes)
						if (uploadRes.qiniuRes.statusCode === 200) {
							const imageUrl = image1Url + tokenData.path;
							uploadedImageUrl.value = imageUrl;
						} else {
							console.error('上传失败:', filePath);
						}
					} catch (error) {
						console.error('上传错误:', error);
					}
				}


			}
		});
	}

	const handleMaskTap = () => {
		console.log("蒙版被点击")
		displayMask.value = false
		isFocused.value = false
		showActionBar.value = false
		uni.hideKeyboard()
	}

	const handleActionBarClick = () => {
		clickedInside.value = true
	}

	function handleSearchSelect(event) {
		let edata = {}
		if (event.type === 'goods') {
			console.log('选择了商品:', event.data);
			// 添加：关闭弹窗
			showPopup.value = false;
			edata.type = 1
			edata.id = event.data.id
			edata.name = event.data.name

		} else if (event.type === 'brand') {
			console.log('选择了品牌:', event.data);
			// 添加：关闭弹窗
			showPopup.value = false;
			edata.type = 2
			edata.id = event.data.id
			edata.name = event.data.name
		}
		selectedAssociation.value = edata
	}

	const openAssociationPopup = () => {
		handleActionBarClick() // 标记为内部点击
		// ...其他逻辑
	}
	const handleSubmit = () => {
		if (!commentText.value.trim() && !uploadedImageUrl.value) {
			uni.showToast({
				title: '请输入评论内容或上传图片',
				icon: 'none'
			})
			return
		}
		
		let scene = getScene()
		console.log("scene", scene)
		
		// 构建提交数据
		const submitData = {
			content: commentText.value,
			target_id: props.targetId,
			type: 4,
			replyInfo: props.replyInfo,
			origin: scene,
			// 添加图片和关联信息
			image_url: uploadedImageUrl.value || "",
			association_id: selectedAssociation.value ? selectedAssociation.value.id : 0,
			association_type: selectedAssociation.value ? selectedAssociation.value.type : 0,
			is_anonymous: isAnonymous.value ? 1 : 0  // 1表示匿名，0表示正常
		}
		
		emit('submit', submitData)

		// 重置表单
		commentText.value = ''
		uploadedImageUrl.value = ''
		selectedAssociation.value = null
		isAnonymous.value = false 
		emit('update:replyInfo', {})
		
		// 关闭蒙版和键盘
		handleMaskTap()
	}


	// 暴露聚焦方法
	const focusInput = () => {
		isFocused.value = true
	}

	defineExpose({
		focusInput
	})

	onMounted(() => {
		if (process.env.VUE_APP_PLATFORM == "h5") {
			console.log("不注册键盘弹出事件")
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

		align-items: center;
		/* 垂直居中 */
		gap: 8px;
		/* 元素间距 */
		padding: 10px;
		box-sizing: border-box;
		left: 0px;
		position: fixed;
		bottom: 0px;
		z-index: 999;
		width: 100vw;
		background: #fff;


		.bottom_input {
			display: flex;
			/* 添加顶部对齐，防止按钮被拉伸 */
			align-items: flex-start;
		}

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
			// flex: 1;
			margin-right: 15rpx;
			// min-height: 56rpx;
			background: #f2f2f2;
			border-radius: 10rpx;
			padding: 15rpx;
			line-height: normal;
			font-size: 24rpx;
			color: #373838;
			// 聚焦时高度2倍
			height: 40rpx;
			transition: height 0.3s ease;
			font-size: 24rpx;
			box-sizing: content-box;

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

	.action-bar {
		display: flex;
		gap: 16px;
		margin: 30rpx 0 0 0;
		justify-content: flex-start;
	}

	/* 关联信息容器 */
	.about_info {
		display: flex;
		flex-wrap: wrap;
		gap: 12rpx;
		margin-bottom: 10rpx;
		align-items: center;
		/* 添加垂直居中 */
	}

	/* 关联项容器 */
	.association-container {
		background-color: #3f4449;
		border-radius: 12rpx;
		padding: 0 10rpx;
		height: 60rpx;
		/* 固定高度 */
		display: flex;
		align-items: center;
		/* 垂直居中 */
	}

	/* 关联项样式 */
	.association-item {
		display: flex;
		align-items: center;
		padding: 8rpx 12rpx;
		/* 移除 transform: translate(0, 20%) */
	}

	/* 关联文本样式 */
	.association-text {
		margin: 0 12rpx;
		font-size: 26rpx;
		color: #fff;
		max-width: 400rpx;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* 关闭图标样式 */
	.close-icon {
		padding: 8rpx;
		border-radius: 50%;
	}

	/* 图片容器 */
	.image-container {
		border-radius: 12rpx;
		padding: 5rpx;
		height: 80rpx;
		/* 固定高度 */
		display: flex;
		align-items: center;
		/* 垂直居中 */
	}

	/* 图片项样式 */
	.image-item {
		position: relative;
		width: 90rpx;
		height: 90rpx;
	}

	/* 上传的图片样式 */
	.uploaded-image {
		width: 80rpx;
		height: 80rpx;
		border: 2px solid #a5eeff;
		border-radius: 10rpx;
	}

	/* 删除图标样式 */
	.delete-icon {
		position: absolute;
		top: -10rpx;
		right: -10rpx;
		width: 36rpx;
		height: 36rpx;
		background-color: #ff5a5f;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/deep/ .search_results {
		box-shadow: none;
		background: #fff;
		width: 600rpx;
	}
</style>