<template>
	<view class="container">
		<meta name="theme-color" content="#F8F8F8"></meta>
		<!-- 表单卡片容器 -->
		<view class="form-card">
			<!-- 分类选择 -->
			<view class="form-item">
				<text class="form-label">分类</text>
				<picker 
					mode="selector" 
					class="form-input"
					:value="selectedType" 
					:range="accountBookTypeList"
					@change="updateSelectedType">
					<view class="picker-content">
						{{ accountBookTypeList[selectedType] || '请选择分类' }}
					</view>
				</picker>
			</view>

			<!-- 名称 -->
			<view class="form-item">
				<text class="form-label">名称</text>
				<input 
					class="form-input" 
					type="text" 
					placeholder="请输入名称"
					placeholder-class="placeholder-style"
					v-model="name" />
			</view>

			<!-- 价值 -->
			<view class="form-item">
				<text class="form-label">价值</text>
				<input 
					class="form-input" 
					type="digit" 
					placeholder="请输入价值"
					placeholder-class="placeholder-style"
					v-model="price" />
			</view>

			<!-- 图片上传 -->
			<view class="form-item">
				<text class="form-label">物品图片</text>
				<view class="upload-wrapper">
					<view v-if="accountImage" class="preview-image">
						<image 
							mode="aspectFill" 
							:src="accountImage"
							class="image-preview"></image>
						<text class="image-tip">点击更换图片</text>
					</view>
					<button 
						class="upload-button" 
						@click="selectImage"
						v-else>
						<text class="iconfont icon-camera"></text>
						选择图片
					</button>
				</view>
			</view>
			<view style="overflow: hidden;">
				<image src="/static/info-circle.png" mode="aspectFill" style="width: 28rpx;height: 28rpx;margin-right: 10rpx; position: relative;top: 3rpx;"></image>
				<text style="color: #888;">仅用于记录您所购买过的物品，其他人不会看到</text>
			</view>
			
			<!-- 操作按钮 -->
			<view class="button-group">
				<button 
					class="delete-button" 
					v-if="isEdit"
					@click="handleDelete">
					删除账本
				</button>
				<button 
					class="submit-button" 
					@click="postSubmit">
					记录{{ isEdit ? '修改' : '新增' }}
				</button>
			</view>
		</view>


	</view>
</template>
<script setup>
	import {
		ref
	} from 'vue';
	import {
		onShow
	} from '@dcloudio/uni-app';
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


	const props = defineProps(["account_book_id"])
	//判断页面是否有参数，如果有代表编辑，如果没有代表新增
	const isEdit = props.account_book_id ? true : false;


	// 状态栏高度
	const systemInfo = uni.getSystemInfoSync();
	const statusBarHeight = ref(systemInfo.statusBarHeight);

	// 提交表单数据
	let name = ref("");
	let price = ref("");
	// 当前激活的 tab
	const activeTab = ref(1);

	function switch_tab(index) {
		activeTab.value = index; // 切换激活 tab
		console.log(`切换到 tab ${index}`);
	}

	// 账本下选择的下拉菜单按钮
	const selectedType = ref(0);

	// 账本下选择的下拉菜单按钮
	const accountBookTypeList = ref(['请选择', '娃衣', '娃头', '眼珠', '假发', '娃鞋', '其它', ]);

	// 账本数据
	const accountBookData = ref({});

	// 上传的图片数据
	const accountImage = ref("");


	// 切换账本选择类型
	function updateSelectedType(e) {
		selectedType.value = e.detail.value
	}

	//以id获取账本详情
	function getAccountBookById(id) {
		let token = uni.getStorageSync('token')
		// /with-state/account-book-detail
		uni.request({
			url: websiteUrl + '/with-state/account-book-detail',
			method: 'GET',
			header: {
				'Authorization': token,
			},
			data: {
				id: id
			},
			success: (res) => {
				console.log(res.data.data);
				name.value = res.data.data.name;
				price.value = res.data.data.price;
				selectedType.value = accountBookTypeList.value.indexOf(res.data.data.type);
				accountImage.value = res.data.data.image_url;
			},
			fail: (err) => {
				console.log(err);
			}
		});
	}
	// 删除账本 /delete-account-book
	function handleDelete() {
		uni.showModal({
			title: '提示',
			content: '确定删除该账本吗？',
			success: (res) => {
				if (res.confirm) {
					uni.request({
						url: websiteUrl + '/with-state/delete-account-book?id=' +  parseInt(props.account_book_id, 10),
						method: 'POST',
						header: {
							'Authorization': uni.getStorageSync('token'),
						},
						success: (res) => {
							console.log(res.data);
							if (res.data.status == "success") {
								uni.showToast({
									title: '删除成功',
									icon: 'success'
								})
								//一秒后返回上级页面
								setTimeout(() => {
									uni.navigateBack()
								}, 500)
							} else {
								uni.showToast({
									title: res.data.msg,
									icon: 'none'
								})
							}
						},
					})
				}
			}
		})
	}

	//选择图片
	function selectImage() {
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
					accountImage.value = image1Url + tokenData.path;
					uni.showToast({
						title: '上传成功',
						icon: 'success'
					})
				}) //uploadImageToQiniu
			}) //getQiniuToken
		}) //chooseImage
	}

	// 加载用户信息
	asyncGetUserInfo().then((userInfo) => {
		if (isEdit) {
			//编辑
			getAccountBookById(props.account_book_id)
			uni.setNavigationBarTitle({
				title: '编辑账本'
			})
		} else {
			uni.setNavigationBarTitle({
				title: '新增账本'
			})
		}

	})

	//提交表单
	function postSubmit() {
		// 区分是新增还是提交，新增 post /with-state/account-book  提交 post /with-state/update-account-book
		if (isEdit) {
			//编辑
			updateAccountBook()
		} else {
			//新增
			addAccountBook()
		}


	}
	//新增
	function addAccountBook() {
		
		let postData = {
			name: name.value,
			price: parseInt(price.value, 10),
			type: accountBookTypeList.value[selectedType.value],
			image_url: accountImage.value
		}

		console.log(postData)

		uni.request({
			url: websiteUrl + '/with-state/add-account-book',
			method: "POST",
			header: {
				'Authorization': uni.getStorageSync('token'),
			},
			data: postData,
			success: (res) => {
				console.log(res.data)
				if (res.data.status == "success") {
					uni.showToast({
						title: '提交成功',
						icon: 'success'
					})
					//一秒后返回上级页面
					setTimeout(() => {
						uni.navigateBack()
					}, 500)
				} else {
					uni.showToast({
						title: res.data.msg,
						icon: 'none'
					})
				}
			},
		})
	}
	//修改
	function updateAccountBook() {

		let postData = {
			name: name.value,
			price: parseInt(price.value, 10),
			type: accountBookTypeList.value[selectedType.value],
			image_url: accountImage.value,
			id: parseInt(props.account_book_id, 10),
		}

		uni.request({
			url: websiteUrl + '/with-state/update-account-book',
			method: "POST",
			header: {
				'Authorization': uni.getStorageSync('token'),
			},
			data: postData,
			success: (res) => {
				console.log(res.data)
				if (res.data.status == "success") {
					uni.showToast({
						title: '提交成功',
						icon: 'success'
					})
					//一秒后返回上级页面
					setTimeout(() => {
						uni.navigateBack()
					}, 500)
				} else {
					uni.showToast({
						title: res.data.msg,
						icon: 'none'
					})
				}
			},
		})
	}
</script>

<style lang="scss" scoped>
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
		height: 80rpx;
		padding: 0 20rpx;
		border: 2rpx solid $border-color;
		border-radius: $radius;
		font-size: 28rpx;
		transition: all 0.3s;
		line-height: 80rpx;
		
		&:focus {
			border-color: $primary-color;
			box-shadow: 0 0 8rpx rgba($primary-color, 0.2);
		}
	}

	.picker-content {
		height: 80rpx;
		line-height: 80rpx;
		color: #333;
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
		max-width: 400rpx;
		
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
		width: 100%;
		
		&:active {
			transform: translateY(2rpx);
			box-shadow: 0 4rpx 12rpx rgba($primary-color, 0.3);
		}
	}

	.placeholder-style {
		color: #ccc;
		font-size: 28rpx;
	}

	.button-group {
		margin-top: 60rpx;
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
		margin-top: 30rpx;
		
		&:active {
			transform: translateY(2rpx);
			box-shadow: 0 4rpx 12rpx rgba(255,77,79,0.3);
		}
	}
</style>