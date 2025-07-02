<template>
	<common-page title="发布树洞">
		<meta name="theme-color" content="#F8F8F8"></meta>
		<view class="publish-box">
			<!-- 分类选择 -->
			<picker class="category-picker" :range="categories" range-key="label" @change="handleCategoryChange"
				:value="selectedIndex">
				<view class="picker-content">
					<text :class="['picker-text', selectedCategory ? '' : 'placeholder']">
						{{ selectedCategoryLabel || '请选择分类（必选）' }}
					</text>
					<uni-icons type="right" size="22" color="#888"></uni-icons>
				</view>
			</picker>
			<!-- 上传图片列表 -->
			<scroll-view scroll-x="true" class="upload_box" ll-with-animation="true" :show-scrollbar="false">
				<view class="upload_item" v-for="(item, index) in uploadList" :key="index">
					<image :src="item" class="uploaded_image" @tap="viewFullImage" mode="aspectFill" />
					<image src="/static/cancel.png" class="close_icon" @tap="deleteImage(index)" />
				</view>
				<view class="uploadImageBox" style="background: #f8f8f8;">
					<image src="/static/add2.png" class="upload_img" @tap="selectImage(index)"
						style="width: 50px;height: 50px;margin: 25px;" />
				</view>

			</scroll-view>
			<textarea v-model="content" placeholder="写下你想说的话..." class="textarea" maxlength="500" />


			<view class="anonymous">
				<checkbox-group @change="handleAnonymous">
					<label>
						<checkbox :checked="isAnonymous === 1" color="#4cbbd0" />
						<text>匿名发布</text>
					</label>
				</checkbox-group>
			</view>


			<view class="publish-detail">
				<text>* 目前树洞为非审稿发布，只接受娃圈相关内容。</text>
				<!-- <text>* 我们会在工作时间进行审稿，您可以在个人投稿中心查看投稿状态，审核通过后稿件才被可见。</text> -->
				<text>* 如果勾选匿名发布，他人将无法通过稿件进入您的主页。如果稿件遭到过多点踩或投诉，我们可能会隐藏这封稿件。</text>
			</view>

			<button class="submit-btn" :class="{ disabled: !canSubmit }" @click="handleSubmit">
				提交
			</button>
		</view>
	</common-page>
</template>

<script setup>
	import {
		onMounted,
		ref,
		computed,
	} from 'vue';
	import {
		websiteUrl,
		image1Url,
		wechatSignLogin,
		getUserInfo,
		global,
		asyncGetUserInfo,
	} from "../../common/config.js";

	import {
		chooseImage,
		jumpToCroper,
		getQiniuToken,
		uploadImageToQiniu
	} from "../../common/image.js";

	const content = ref('')

	const isAnonymous = ref(0)
	const uploadList = ref([]);

	// 新增分类相关数据
	const categories = ref([]) // 存储分类数据
	const selectedCategory = ref('') // 选中的分类ID

	const selectedIndex = ref(-1)
	const selectedCategoryLabel = ref('')


	function viewFullImage(index) {
		uni.previewImage({
			current: uploadList.value[index],
			urls: uploadList.value
		});
	}


	function handleAnonymous(e) {
		isAnonymous.value = e.detail.value.length > 0 ? 1 : 0
	}
	// 设置标题
	uni.setNavigationBarTitle({
		title: '投稿树洞'
	})



	//选择图片
	function selectImage() {
		console.log("openSelect")
		chooseImage().then((res) => {
			getQiniuToken().then((tokenData) => {
				console.log(tokenData)

				uploadImageToQiniu(res, tokenData.token, tokenData.path).then((uploadRes) => {
					if (uploadRes.statusCode != 200) {
						uni.showToast({
							title: '上传失败',
							icon: 'none'
						})
					}
					console.log(image1Url + tokenData.path)
					//image1Url + tokenData.path;
					uploadList.value.push(image1Url + tokenData.path);

					uni.showToast({
						title: '上传成功',
						icon: 'success'
					})

				}) //uploadImageToQiniu
			}) //getQiniuToken
		}) //chooseImage
	}


	// 获取分类列表
	const fetchCategories = async () => {
		try {
			const res = await uni.request({
				url: websiteUrl + '/treehole-typelist',
				method: 'GET'
			})
			if (res.data.status === "success") {
				// 转换数据结构为 {value, label} 格式
				categories.value = Object.entries(res.data.data).map(([value, label]) => ({
					value: Number(value),
					label
				}))
			}
		} catch (err) {
			console.error('获取分类失败:', err)
		}
	}

	// 处理选择事件
	function handleCategoryChange(e) {
		const index = e.detail.value
		if (index >= 0 && categories.value[index]) {
			selectedIndex.value = index
			selectedCategory.value = categories.value[index].value
			selectedCategoryLabel.value = categories.value[index].label
		}
	}

	// 修改提交校验逻辑
	const canSubmit = computed(() => {
		return content.value.trim().length > 0 && selectedCategory.value !== null
	})
	async function handleSubmit() {
		if (!canSubmit.value) return


		if (!selectedCategory.value) {
			uni.showToast({
				title: '请选择分类',
				icon: 'none'
			})
			return
		}


		try {
			uni.showLoading({
				title: '提交中...'
			})

			// 检查登录状态
			const token = uni.getStorageSync('token')
			if (!token) {
				uni.showToast({
					title: '请先登录',
					icon: 'none'
				})
				return
			}

			// 构造提交数据
			const postData = {
				content: content.value.trim(),
				images: uploadList.value,
				is_anonymous: isAnonymous.value,
				category_id: selectedCategory.value,
			}

			const res = await uni.request({
				url: websiteUrl + '/with-state/add-submission',
				method: 'POST',
				data: postData,
				header: {
					'Content-Type': 'application/json',
					'Authorization': token,
				}
			})

			uni.hideLoading()

			if (res.data.status == "success") {
				uni.showToast({
					title: '已收到您的投稿',
					icon: 'success'
				})
				setTimeout(() => {
					// 提交成功后清空数据
					content.value = ''
					uploadList.value = []
					isAnonymous.value = 0
					uni.navigateBack()
				}, 1500)
			} else {
				uni.showToast({
					title: res.data.msg || '提交失败',
					icon: 'none'
				})
			}
		} catch (err) {
			uni.hideLoading()
			console.error('提交失败:', err)
			uni.showToast({
				title: '网络请求失败',
				icon: 'none'
			})
		}
	}


	onMounted(() => {
		fetchCategories()
	})
</script>

<style lang="less" scoped>
	.publish-box {
		padding: 30rpx;
	}

	.textarea {
		width: 650rpx;
		height: 300rpx;
		padding: 20rpx;
		background: #f8f8f8;
		border-radius: 12rpx;
		margin-bottom: 30rpx;
	}

	.anonymous {
		margin: 30rpx 0;

		text {
			color: #666;
			font-size: 28rpx;
			margin-left: 10rpx;
		}
	}

	.submit-btn {
		background: #4cbbd0;
		color: #fff;
		border-radius: 50rpx;

		&.disabled {
			background: #ccc;
			color: #999;
		}
	}

	.uploaded_image {
		width: 100px;
		height: 100px;
		margin-right: 10px;

	}

	.upload_box {
		// 核心修改点：
		width: 100%; // 避免使用 100vw（可能因滚动条导致宽度溢出）
		white-space: nowrap; // 强制子元素不换行
		overflow-x: auto; // 确保横向滚动生效（UniApp的scroll-view组件已封装滚动逻辑，此处为保险可保留）
		display: block; // 明确容器为块级元素
		margin-bottom: 35rpx;


		view {
			display: inline-block; // 关键！强制子元素横向排列（替代 float）
			vertical-align: top; // 对齐方式（避免图片底部留白）
		}

		.upload_item {
			position: relative;
			width: 100px;
			margin-right: 10px;

			border-radius: 5px;
			overflow: hidden;

			.uploaded_image {
				width: 100px;
				height: 100px;
			}

			.close_icon {
				position: absolute;
				right: 0;
				top: 0;
				width: 20px;
				height: 20px;
			}
		}
	}

	.publish-detail {
		text {
			display: block;
			color: #888;
			margin: 20rpx 20rpx;
		}
	}

	// 分类选择
	.category-picker {
		display: block;
		height: 70rpx;
		line-height: 70rpx;
		padding: 0 30rpx;
		margin: 30rpx 0;
		background: #f8f8f8;
		border-radius: 12rpx;
		border: 1px solid #e0e0e0;

		.picker-content {
			display: flex;
			align-items: center;
			justify-content: space-between;
		}

		.picker-text {
			color: #333;
			font-size: 24rpx;

			&.placeholder {
				color: #999;
			}
		}

		&:active {
			background: #f0f0f0;
		}
	}


	// 优化提交按钮间距
	.submit-btn {
		margin-top: 50rpx;
	}


	/deep/ .uni-picker-action-confirm {
		color: #4cbbd0!important;

	}
</style>