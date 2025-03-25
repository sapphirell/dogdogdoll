<template>
	<view class="container">
		<!-- 状态提示 -->
		<view v-if="isEdit && !isEditable" class="status-alert">
			<text>正在审核中，暂时无法编辑，请大人稍候片刻！</text>
		</view>

		<!-- 表单卡片容器 -->
		<view class="form-card" :class="{ disabled: isEdit && !isEditable }">
			<!-- 表单项 -->
			<view class="form-item">
				<text class="form-label">展示柜名称</text>
				<input class="form-input" 
					type="text" 
					placeholder="请输入名称"
					placeholder-class="placeholder-style"
					v-model="name"
					:disabled="isEdit && !isEditable" />
			</view>

			<view class="form-item">
				<text class="form-label">展示柜描述</text>
				<textarea class="form-input textarea" 
					placeholder="请输入描述"
					placeholder-class="placeholder-style"
					v-model="description"
					:disabled="isEdit && !isEditable"></textarea>
			</view>

			<view class="form-item">
				<text class="form-label">展示柜图片</text>
				<view class="upload-wrapper">
					<view v-if="image_url" class="preview-image">
						<image 
							mode="aspectFill" 
							:src="image_url"
							class="image-preview"></image>
						<text class="image-tip" v-if="isEditable">点击更换图片</text>
					</view>
					<button 
						class="upload-button" 
						@click="selectImage"
						v-else
						:disabled="isEdit && !isEditable">
						<text class="iconfont icon-camera"></text>
						选择图片
					</button>
				</view>
			</view>
	
		</view>

		<!-- 操作按钮组 -->
		<view class="button-group">
			<button 
				class="delete-button" 
				v-if="isEdit"
				:disabled="isEdit && !isEditable"
				@click="handleDelete">
				删除展示
			</button>
			<button 
				class="submit-button" 
				@click="postSubmit"
				:disabled="isEdit && !isEditable">
				提交{{ isEdit ? '修改' : '新增' }}
			</button>
		</view>
	</view>
</template>

<script setup>
	import {
		ref, computed
	} from 'vue';
	import {
		websiteUrl,
		image1Url,
		wechatSignLogin,
		getUserInfo,
		global,
		asyncGetUserInfo,
	} from "../../../common/config.js";
	import {
		chooseImage,
		jumpToCroper,
		getQiniuToken,
		uploadImageToQiniu
	} from "../../../common/image.js";

	const props = defineProps(["showcase_id"]);
	const isEdit = props.showcase_id ? true : false;

	const displayStatus = ref(-1);
	const name = ref("");
	const description = ref("");
	const image_url = ref("");
	
	// 计算是否可编辑
	const isEditable = computed(() => {
		return [1, 3].includes(displayStatus.value);
	});


	// 获取展示柜详情
	function getShowcaseById(id) {
		let token = uni.getStorageSync('token');
		uni.request({
			url: websiteUrl + '/with-state/showcase-detail',
			method: 'GET',
			header: {
				'Authorization': token
			},
			data: {
				id: id
			},
			success: (res) => {
				name.value = res.data.data.name;
				description.value = res.data.data.description;
				image_url.value = res.data.data.image_url;
				displayStatus.value = res.data.data.display; 
			},
			fail: (err) => {
				console.log(err);
			}
		});
	}
	
	
	// 新增删除功能
	function handleDelete() {
		uni.showModal({
			title: '确认删除',
			content: '确定要永久删除这个展示柜吗？',
			success: (res) => {
				if (res.confirm) {
					deleteShowcase();
				}
			}
		});
	}
	function deleteShowcase() {
		uni.request({
			url: websiteUrl + '/with-state/delete-showcase',
			method: "POST",
			header: {
				'Authorization': uni.getStorageSync('token')
			},
			data: {
				id: parseInt(props.showcase_id, 10)
			},
			success: (res) => {
				if (res.data.status == "success") {
					uni.showToast({
						title: '删除成功',
						icon: 'success'
					});
					setTimeout(() => {
						uni.navigateBack();
					}, 500);
				} else {
					uni.showToast({
						title: res.data.msg,
						icon: 'none'
					});
				}
			},
		});
	}

	// 选择图片
	function selectImage() {
		chooseImage().then((res) => {
			getQiniuToken().then((tokenData) => {
				uploadImageToQiniu(res, tokenData.token, tokenData.path).then((uploadRes) => {
					if (uploadRes.statusCode != 200) {
						uni.showToast({
							title: '上传失败',
							icon: 'none'
						});
					}
					image_url.value = image1Url + tokenData.path;
					uni.showToast({
						title: '上传成功',
						icon: 'success'
					});
				});
			});
		});
	}

	// 页面加载时，判断是编辑还是新增
	if (isEdit) {
		getShowcaseById(props.showcase_id);
		uni.setNavigationBarTitle({
			title: '编辑展示柜'
		});
	} else {
		uni.setNavigationBarTitle({
			title: '新增展示柜'
		});
	}

	// 提交表单
	function postSubmit() {
		if (isEdit) {
			updateShowcase();
		} else {
			addShowcase();
		}
	}

	// 新增展示柜
	function addShowcase() {
		let postData = {
			name: name.value,
			description: description.value,
			image_url: image_url.value
		};

		uni.request({
			url: websiteUrl + '/with-state/add-showcase',
			method: "POST",
			header: {
				'Authorization': uni.getStorageSync('token')
			},
			data: postData,
			success: (res) => {
				if (res.data.status == "success") {
					uni.showToast({
						title: '提交成功',
						icon: 'success'
					});
					setTimeout(() => {
						uni.navigateBack();
					}, 500);
				} else {
					uni.showToast({
						title: res.data.msg,
						icon: 'none'
					});
				}
			},
		});
	}

	// 修改展示柜
	function updateShowcase() {
		let postData = {
			id: parseInt(props.showcase_id, 10),
			name: name.value,
			description: description.value,
			image_url: image_url.value
		};

		uni.request({
			url: websiteUrl + '/with-state/update-showcase',
			method: "POST",
			header: {
				'Authorization': uni.getStorageSync('token')
			},
			data: postData,
			success: (res) => {
				if (res.data.status == "success") {
					uni.showToast({
						title: '提交成功',
						icon: 'success'
					});
					setTimeout(() => {
						uni.navigateBack();
					}, 500);
				} else {
					uni.showToast({
						title: res.data.msg,
						icon: 'none'
					});
				}
			},
		});
	}
</script>

<style lang="scss" scoped>
	// #a6e9f7, #94a5f3
	$primary-color: #a6e9f7;
	$hover-color: #94a5f3;
	$border-color: #e6e6e6;
	$radius: 8px;

	.container {
		padding: 20rpx;
		background-color: #f5f5f5;
		min-height: 100vh;
	}

	.form-card {
		background: white;
		border-radius: $radius;
		padding: 30rpx;
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
	}

	.form-item {
		margin-bottom: 40rpx;
	}

	.form-label {
		display: block;
		font-size: 28rpx;
		color: #666;
		margin-bottom: 16rpx;
		font-weight: 500;
	}

	.form-input {
		width: 600rpx;
		height: 80rpx;
		padding: 0 20rpx;
		border: 2rpx solid $border-color;
		border-radius: $radius;
		font-size: 28rpx;
		transition: all 0.3s;
		
		&:focus {
			border-color: $primary-color;
			box-shadow: 0 0 8rpx rgba($primary-color, 0.2);
		}
	}

	.textarea {
		height: 200rpx;
		padding: 20rpx;
		line-height: 1.5;
	}

	.upload-wrapper {
		border: 2rpx dashed $border-color;
		border-radius: $radius;
		padding: 30rpx;
		text-align: center;
	}

	.preview-image {
		position: relative;
		margin: 0 auto;
		
		.image-preview {
			width: 100%;
			height: 300rpx;
			border-radius: $radius;
		}
		
		.image-tip {
			position: absolute;
			bottom: 20rpx;
			left: 50%;
			transform: translateX(-50%);
			color: white;
			font-size: 24rpx;
			background: rgba(0,0,0,0.5);
			padding: 8rpx 20rpx;
			border-radius: 20rpx;
		}
	}

	.upload-button {
		background: rgba($primary-color, 0.1);
		color: $primary-color;
		border: none;
		font-size: 28rpx;
		height: auto;
		line-height: 1.5;
		padding: 20rpx;
		border-radius: $radius;
		transition: all 0.3s;
		
		.iconfont {
			margin-right: 12rpx;
		}
		
		&:active {
			background: rgba($primary-color, 0.2);
		}
	}

	.submit-button {
		margin-top: 60rpx;
		background: linear-gradient(135deg, $primary-color, $hover-color);
		color: white;
		border: none;
		border-radius: 50rpx;
		font-size: 32rpx;
		height: 90rpx;
		line-height: 90rpx;
		box-shadow: 0 6rpx 20rpx rgba($primary-color, 0.3);
		transition: all 0.3s;
		
		
		&:active {
			transform: translateY(2rpx);
			box-shadow: 0 4rpx 12rpx rgba($primary-color, 0.3);
		}
	}

	.placeholder-style {
		color: #ccc;
		font-size: 28rpx;
	}
	
		.status-alert {
			background: #fffbe6;
			border: 1px solid #ffe58f;
			border-radius: 4px;
			padding: 20rpx;
			margin: 20rpx 0;
			text-align: center;
			color: #faad14;
			font-size: 26rpx;
		}
	
		.disabled {
			opacity: 0.6;
			pointer-events: none;
		}
	
		.button-group {
			margin-top: 60rpx;
			
			button {
				display: inline-block;
				font-size: 25rpx;
				margin: 10rpx 20rpx;
				color: #fff;
				width: 660rpx;
				border-radius: 40rpx!important;
				// flex: 1;
				// width: 200rpx;
			}
		}
	
		.delete-button {
			background: linear-gradient(135deg, #adadad, #ffbdbb);
			color: white;
			border: none;
			border-radius: 50rpx;
			font-size: 32rpx;
			height: 90rpx;
			line-height: 90rpx;
			box-shadow: 0 6rpx 20rpx rgba(255,77,79,0.3);
			transition: all 0.3s;
			
			&:active {
				transform: translateY(2rpx);
				box-shadow: 0 4rpx 12rpx rgba(255,77,79,0.3);
			}
		}
			.submit-button:disabled {
				background: #cccccc;
				box-shadow: none;
				opacity: 0.7;
			}

</style>