<!-- components/privacy-permission-modal.vue -->
<template>
	<common-modal v-model:visible="showModal" top="20vh" height="auto" :closeable="false">
		<view class="privacy-container">
			<view class="header">
				<image src="/static/new-icon/write.gif" class="logo" />
				<text class="title">隐私与权限说明</text>
			</view>

			<view class="content">
				<text class="desc">欢迎使用我们的应用，为了提供更好的服务，我们需要获取相关权限并说明隐私政策：</text>

				<view class="policy-item" @click="goToPrivacy">
					<uni-icons type="info" size="18" color="#80afff" />
					<text class="policy-text">《隐私政策》</text>
					<uni-icons type="arrowright" size="16" color="#999" />
				</view>

				<view class="policy-item" @click="goToPermissions">
					<uni-icons type="locked" size="18" color="#80afff" />
					<text class="policy-text">《权限说明》</text>
					<uni-icons type="arrowright" size="16" color="#999" />
				</view>
			</view>

			<view class="footer">
				<button class="btn refuse" @click="handleDisagree">拒绝并退出</button>
				<button class="btn agree" @click="handleAgree">同意并继续</button>
			</view>
		</view>
	</common-modal>
</template>

<script setup>
	import {
		ref,
		onMounted
	} from 'vue';
	import {
		websiteUrl,
		wechatSignLogin,
		getUserInfo,
		global,
		getScene
	} from "../../common/config.js";

	const showModal = ref(false);
	const storageKey = 'privacyAgreementStatus';

	// 检查是否已同意
	const hasAgreed = () => {
		let storageContent = uni.getStorageSync(storageKey)
		console.log(storageContent)
		return storageContent === 'agreed';
	};

	// 检查环境并显示弹窗
	const checkAndShow = () => {
		if (hasAgreed()) {
			console.log("用户已经同意过隐私政策")
			return
		}
		const scene = getScene();
		if(scene !== 2 && scene !== 3) {
			console.log("并非安卓或iOS客户端：", scene)
			return
		}
		
	
		setTimeout(() => {
			showModal.value = true;
		}, 1000);
	
		
	};

	// 跳转到隐私政策
	const goToPrivacy = () => {
		uni.navigateTo({
			url: '/pages/private/private'
		});
	};

	// 跳转到权限说明
	const goToPermissions = () => {
		uni.navigateTo({
			url: '/pages/permission/permission'
		});
	};

	// 处理同意
	const handleAgree = () => {
		uni.setStorageSync(storageKey, 'agreed');
		showModal.value = false;
	};

	// 处理拒绝
	const handleDisagree = () => {
		// 退出App
		uni.exitApp();
	};

	onMounted(() => {
		checkAndShow();
	});
</script>

<style lang="less">
	.privacy-container {
		padding: 24rpx;
		display: flex;
		flex-direction: column;
		width: 85vw;
		box-sizing: border-box;

		.header {
			display: flex;
			align-items: center;
			padding-bottom: 16rpx;
			border-bottom: 1px solid #f0f0f0;
			margin-bottom: 24rpx;

			.logo {
				width: 80rpx;
				height: 80rpx;
				border-radius: 16rpx;
				margin-right: 20rpx;
			}

			.title {
				font-size: 26rpx;
				font-weight: bold;
				color: #333;
			}
		}

		.content {
			padding: 0 10rpx;

			.desc {
				font-size: 25rpx;
				color: #666;
				line-height: 1.6;
				margin-bottom: 30rpx;
				display: block;
			}

			.policy-item {
				display: flex;
				align-items: center;
				padding: 24rpx 20rpx;
				background-color: #f9f9f9;
				border-radius: 12rpx;
				margin-bottom: 24rpx;

				.policy-text {
					flex: 1;
					font-size: 25rpx;
					color: #80afff;
					margin-left: 16rpx;
				}
			}
		}

		.footer {
			display: flex;
			justify-content: space-between;
			margin-top: 20rpx;

			.btn {
				flex: 1;
				height: 60rpx;
				line-height: 60rpx;
				font-size: 24rpx;
				border-radius: 40rpx;
				margin: 0 10rpx;
				border: none;
				
				&::after {
					border: none;
				}

				&.refuse {
					background-color: #f8f8f8;
					color: #666;
				}

				&.agree {
					background-color: #80afff;
					color: #fff;
				}
			}
		}
	}
</style>