<template>
	<meta name="theme-color" content="#e0f3ff">
	</meta>
	<view head_color="url('/static/bg/bg2.jpg')">

		<view class="container">

			<!-- 个人设置页面 -->
			<!-- 区分是否登录 -->
			<view v-if="global.isLogin">
				<view class="mine">
					<view class="header-placeholders"></view>
					<view class="full-width">
						<view class="avatar-container">
							<image mode="aspectFill" class="mine-page-avatar" :src="global.userInfo.avatar"
								@click="jumpToCroper" />
						</view>
						<view class="user-info-container">
							<text class="username-text font-alimamashuhei">{{global.userInfo.username}}</text>
							<text class="user-id-text">
								<text class="font-alimamashuhei" style="color: #fff;font-size: 22rpx;">ID</text> :
								{{global.userInfo.id}}
							</text>
						</view>
						<view class="clearfix"></view>
					</view>

					<view class="pageinfo-infobox">
						<view class="info-item" @tap="jump2like">
							<image src="/static/pixcollocation.png" class="icon"></image>
							<text class="info-tap font-alimamashuhei">关注</text>
							<text class="mine-info-number">{{ likeCount }}</text>
						</view>
						<view class="info-item" @tap="jump2message">
							<image src="/static/pixpaperplane.png" class="icon"></image>
							<text class="info-tap font-alimamashuhei">消息</text>
							<text class="mine-info-number">{{ unreadCount }}</text>
						</view>
						<view class="info-item" @tap="jump2collocation">
							<image src="/static/pixttq2.png" class="icon"></image>
							<text class="info-tap font-alimamashuhei">搭配</text>
							<text class="mine-info-number">{{ myCollocationCount }}</text>
						</view>
					</view>
				</view>
				<view class="main-padding">
					<view class="button-container">
						<!-- 修改后的按钮样式 -->
						<view class="mine-button-item" @click="jump2myComment">
							<view class="button-content">
								<uni-icons type="chatboxes" size="24" color="#606060"></uni-icons>
								<text class="button-text">我的帖子</text>
							</view>
							<uni-icons type="right" size="24" color="#c0c0c0"></uni-icons>
						</view>

						<view class="mine-button-item" @click="jumpSetting">
							<view class="button-content">
								<uni-icons type="gear" size="24" color="#606060"></uni-icons>
								<text class="button-text">账号设置</text>
							</view>
							<uni-icons type="right" size="24" color="#c0c0c0"></uni-icons>
						</view>
						
					<!-- 	<view class="mine-button-item" @click="jump2test">
							<view class="button-content">
								<uni-icons type="gear" size="24" color="#606060"></uni-icons>
								<text class="button-text">测试</text>
							</view>
							<uni-icons type="right" size="24" color="#c0c0c0"></uni-icons>
						</view> -->

						<view class="mine-button-item last-button" @click="logout">
							<view class="button-content">
								<uni-icons type="arrow-right" size="24" color="#606060"></uni-icons>
								<text class="button-text">退出账号</text>
							</view>
							<uni-icons type="right" size="24" color="#c0c0c0"></uni-icons>
						</view>
					</view>
				</view>

			</view>

			<view v-else class="unlogin-container">
				<view class="header-placeholders"></view>
				<image src="https://images1.fantuanpu.com/home/jpt.gif" mode="aspectFit"
					style="width: 360rpx;height: 380rpx;position: relative;right: 20rpx;"></image>
				<text class="welcome-text">欢迎使用娃圈狗狗助手</text>
				<!-- <image src="https://images1.fantuanpu.com/home/title.gif" mode="widthFix" style="width: 600rpx;"></image> -->
				<view class="input-group">
					<view class="input-with-icon">
						<image class="icon" src="/static/user.png" />
						<input type="text" placeholder="请输入手机号" class="inputer" v-model="inputPhone" />
					</view>
					<view class="input-with-icon">
						<image class="icon" src="/static/key.png" />
						<input type="password" placeholder="请输入密码" class="inputer" v-model="inputPassword" />
					</view>
				</view>
				<view class="action-links">
					<text class="float-left" @tap="jump2register">注册账号</text>
					<text class="float-right" @tap="jump2forgetPassword">忘记密码</text>
					<view class="clearfix" />
				</view>
				<button class="submit-btn" @click="login">立即登录</button>
				<button class="submit-btn" @click="wechatSignLogin" v-if="scene == 4">微信登录</button>
				<button class="submit-btn" @click="jump2index"
					style="background: linear-gradient(135deg, #cdcdcd, #b1b1b1);">随便看看→</button>
					
				<!-- 协议勾选框 -->
				<view class="agreement-container">
				  <checkbox-group @change="handleAgreeChange">
					<label class="agreement-label">
					  <checkbox :checked="agree" color="#65C3D6" style="transform:scale(0.8)"  />
					  <text class="agreement-text">我已阅读并同意</text>
					</label>
				  </checkbox-group>
				  
				     
				  <view class="agreement-links">
					<text class="agreement-link" @tap="goToPrivacy">《隐私政策》</text>
					<text class="agreement-link" @tap="goToPermissions">《用户协议》</text>
				  </view>
				</view>
			</view>



		</view>
	</view>

</template>
<script setup>
	import {
		ref,
		watch,
		computed
	} from 'vue';

	import {
		onShow
	} from "@dcloudio/uni-app";

	import {
		websiteUrl,
		wechatSignLogin,
		getUserInfo,
		global,
		getScene
	} from "../../common/config.js";

	console.log(global.isLogin)
	console.log(global.userInfo)

	//登录注册输入
	let inputPhone = ref("")
	let inputPassword = ref("")

	let unreadCount = ref(0)
	let likeCount = ref(0)
	let myCollocationCount = ref(0)

	let visible = ref(false)
	
	let scene = getScene()


	// 添加协议状态
	let agree = ref(false)
	// 处理协议勾选状态变化
	function handleAgreeChange(e) {
	  agree.value = e.detail.value.length > 0
	}
	// 跳转到隐私政策
	function goToPrivacy() {
	  uni.navigateTo({
		url: '/pages/private/private'
	  });
	};
	// 跳转到权限说明
	function goToPermissions() {
	  uni.navigateTo({
		url: '/pages/permission/permission'
	  });
	};

	//选择图片
	function chooseImage() {
		return new Promise(resolve => {
			uni.chooseImage({
				count: 1,
				success: (res) => {
					resolve(res.tempFilePaths[0])
				}
			})
		})
	}
	// 退出账号
	function logout() {
		uni.removeStorageSync('token')
		uni.removeStorageSync('userInfo')
		global.isLogin = false
	}
	// var jWeixin = require('jweixin-module')  

	//jump2register 跳转到register页面
	function jump2register() {
		uni.navigateTo({
			url: `/pages/register/register`
		})
	}

	//jump2follow
	function jump2like() {
		uni.navigateTo({
			url: `/pages/user_like/user_like`
		})
	}
	// jump2index
	function jump2index() {
		uni.showTabBar({
			animation: false
		})
		uni.switchTab({
			url: `/pages/index/index`
		})
	}

	function jump2myComment() {
		uni.navigateTo({
			url: `/pages/my_comment/my_comment`
		})
	}

	//jump2message
	function jump2message() {
		uni.navigateTo({
			url: `/pages/message_list/message_list`
		})
	}
	//jump2forgetPassword
	function jump2forgetPassword() {
		uni.navigateTo({
			url: `/pages/reset_password/reset_password`
		})
	}

	//jump2collocation
	function jump2collocation() {
		uni.navigateTo({
			url: `/pages/my_collocation/my_collocation`
		})
	}

	// 裁切头像
	function jumpToCroper() {
		chooseImage().then(src => {
			uni.navigateTo({
				url: `/pages/pop_croper/pop_croper?src=${decodeURIComponent(src)}`
			})
		})
	}

	// 获取未读数量
	const fetchUnreadCount = async () => {
		try {
			const res = await uni.request({
				url: `${websiteUrl}/with-state/unread-message-count`,
				header: {
					Authorization: uni.getStorageSync('token')
				}
			});

			if (res.data.status === 'success') {
				unreadCount.value = res.data.data.count;
			}
		} catch (error) {
			console.log(error)
			uni.showToast({
				title: '未读数获取失败',
				icon: 'none'
			});
		}
	};
	// 获取关注数量
	const fetchLikeCount = async () => {
		try {
			const res = await uni.request({
				url: `${websiteUrl}/with-state/user-likes-count`,
				header: {
					Authorization: uni.getStorageSync('token')
				}
			});

			if (res.data.status === 'success') {
				likeCount.value = res.data.data.count;
			}
		} catch (error) {
			console.log(error)
			uni.showToast({
				title: '关注数获取失败',
				icon: 'none'
			});
		}
	};

	// 获取我的搭配数量 my-collocation-count
	const fetchMyCollocationCount = async () => {
		try {
			const res = await uni.request({
				url: `${websiteUrl}/with-state/my-collocation-count`,
				header: {
					Authorization: uni.getStorageSync('token')
				}
			});

			if (res.data.status === 'success') {
				myCollocationCount.value = res.data.data;
			}
		} catch (error) {
			console.log(error)
			uni.showToast({
				title: '搭配数获取失败',
				icon: 'none'
			});
		}
	};

	function selectAvatar(croperPath) {
		console.log("croperPath:" + croperPath);
		let token = uni.getStorageSync('token');
		let qnToken = "";

		// 获取七牛上传token
		uni.request({
				url: websiteUrl + '/with-state/qiniu-token',
				method: "POST",
				header: {
					'Authorization': token,
				},
				success: (res) => {
					if (res.data.data == null || res.data.data.token == "") {
						uni.showToast({
							title: '获取上传凭证失败',
							icon: 'none',
						});
						return
					}
					qnToken = res.data.data.token;
					console.log("获取到的七牛token：" + res.data.data.token);
					let userInfo = uni.getStorageSync('userInfo');
					console.log(userInfo);
					// let fileName = "avatar/" + userInfo.id + ".jpg";
					let fileName = res.data.data.path
					console.log("fileName:" + fileName);
					// 上传图片
					uni.uploadFile({
						url: 'https://up-cn-east-2.qiniup.com',
						name: 'file',
						method: "POST",
						filePath: croperPath,
						fileType: 'image', //仅支付宝小程序，且必填。
						formData: {
							token: qnToken,
							key: fileName,
							//覆盖上传
							scope: "hobby-box:" + fileName
						},
						success: (res) => {
							console.log("上传成功");
							// 更新用户头像
							updateUserInfo("avatar", "https://images1.fantuanpu.com/" + fileName);


						},
						fail: (res) => {
							console.log(res)
							uni.showToast({
								title: '上传失败',
								icon: 'none',
							});
						},
					});

				},
				fail: (res) => {
					uni.showToast({
						title: '获取上传凭证失败',
						icon: 'none',
					});
				}
			} // uni.request.qnToken
		);


	} //selectAvatar
	function updateUserInfo(key, value) {
		let token = uni.getStorageSync('token');
		let userInfo = uni.getStorageSync('userInfo');
		uni.request({
			url: websiteUrl + '/with-state/update-profile',
			method: "POST",
			header: {
				'Authorization': token,
			},
			data: {
				"avatar": value
			},
			success: (res) => {
				console.log("更新成功");
				// userInfo.avatar = value;
				// uni.setStorageSync('userInfo', userInfo);
				getUserInfo();
			},
			fail: (res) => {
				uni.showToast({
					title: '更新失败',
					icon: 'none',
				});
			},
		});
	}
	//手机号+密码登录
	function login() {
		  // 检查是否同意协议
		  if (!agree.value) {
		    uni.showToast({
		      title: '请先阅读并同意协议',
		      icon: 'none',
		    });
		    return;
		  }
		//获取手机号和密码
		if (inputPassword.value == "" || inputPhone.value == "") {
			uni.showToast({
				title: '请输入手机号和密码',
				icon: 'none',
			});
			return
		}
		//检查手机号规则是否合法
		if (!(/^1[3456789]\d{9}$/.test(inputPhone.value))) {
			uni.showToast({
				title: '手机号格式错误',
				icon: 'none',
			});
			return
		}
		//密码必须大于6位
		if (inputPassword.value.length < 6) {
			uni.showToast({
				title: '密码必须大于6位',
				icon: 'none',
			});
			return
		}


		let phone = inputPhone.value;
		let password = inputPassword.value;

		uni.request({
			url: websiteUrl + '/login',
			method: "POST",
			data: {
				account: phone,
				password: password
			},
			success: (res) => {
				console.log(res)
				let data = res.data.data
				let status = res.data.status
				if (status != "success") {
					uni.showToast({
						title: res.data.msg,
						icon: 'none',
					});
					return
				}

				//获得token完成登录
				uni.setStorageSync('token', data.jwt_token)
				uni.setStorageSync('openid', data.open_id)
				uni.setStorageSync('session_key', data.session_key)
				console.log("jwt:" + data.jwt_token)
				if (data.jwt_token != null && data.jwt_token != "") {
					getUserInfo();

				}
			},
			fail: (res) => {
				uni.showToast({
					title: '登录失败',
					icon: 'none',
				});
			},
		});
	}

	function jumpSetting() {
		uni.navigateTo({
			url: '/pages/setting/setting',
		})
	}
	
	function jump2test() {
		uni.navigateTo({
			url: '/pages/loadding/loadding',
		})
	}
	// 获取系统信息
	const systemInfo = uni.getSystemInfoSync()
	const navBarHeight = computed(() => {
		// #ifdef MP-WEIXIN
		const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
		// 确保状态栏高度存在（iOS可能为0）
		const statusBarHeight = systemInfo.statusBarHeight || 32
		return menuButtonInfo.bottom + menuButtonInfo.top - 2 * statusBarHeight
		// #endif
		return 0
	})
	// 计算顶部占位高度
	const headerHeight = computed(() => {
		// 小程序需要包含状态栏和导航栏高度
		// #ifdef MP-WEIXIN
		return navBarHeight.value + 'px'
		// #endif

		// // H5/App使用安全区域计算
		// return `calc(constant(safe-area-inset-top) + 20px)` // 默认值20px作为fallback
		// #ifdef H5 || APP
		// 直接获取状态栏高度（iOS 安卓通用）
		const statusBarHeight = systemInfo.statusBarHeight || 0
		return `${statusBarHeight}px` // 44px 为 iOS 导航栏标准高度
		// #endif
	})


	watch(
		() => global.isLogin, // 使用函数返回要监听的值
		(newVal) => {
			console.log("watch", newVal)
			if (newVal) {
				uni.showTabBar({
					animation: false
				})
			} else {
				uni.hideTabBar({
					animation: false
				})
			}
		}
	)



	onShow(() => {
		// 获取一次个人信息，判断是否是登录超时
		getUserInfo();
		if (global.isLogin) {
			uni.showTabBar({
				animation: false
			})
		} else {
			uni.hideTabBar({
				animation: false
			})
		}


		//获取未读数量
		fetchUnreadCount();
		//获取关注数量化
		fetchLikeCount();
		// 获取我的搭配数量
		fetchMyCollocationCount();
		const pages = getCurrentPages();
		const currentPage = pages[pages.length - 1];
		if (currentPage.returnParam) {
			selectAvatar(currentPage.returnParam); // 调用上传逻辑
		}
	})
</script>



<style lang="scss" scoped>
	.container {
		background: #fff;
	}

	$primary-color: #a6e9f7;
	$hover-color: #1ed1e1;
	$border-color: #e6e6e6;
	$radius: 8px;

	.mine {
		// background: linear-gradient(180deg, rgb(185 195 253) 0%, rgb(211 245 255) 100%);
		// background: #e0f3ff;
		// background-image: radial-gradient(#fff 20%, transparent 0);
		// background-size: 20px 20px;

		background: url("data:image/jpeg;base64,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");
		background-size: cover;
		// height: 400rpx;
		margin-bottom: 80rpx;

		.full-width {
			width: 100%;
			padding: 60rpx 50rpx 20rpx 50rpx;
			box-sizing: border-box;
		}
	}

	.main-padding {
		// padding: 20rpx;
		margin: 20rpx auto 0 auto;
		width: 640rpx;
	}



	.avatar-container {
		display: inline-block;
		width: 180rpx;
		height: 180rpx;
		padding: 5rpx;
		float: left;
		border: 3rpx solid #fff;
		border-radius: 100%;
		background: transparent;
		box-shadow: 0 0 16rpx #baebff;
		background: #fff;

		.mine-page-avatar {
			width: 100%;
			height: auto;
			aspect-ratio: 1;
			// margin: 20rpx auto;
			display: block;
			border-radius: 100%;
		}
	}

	.user-info-container {
		display: inline-block;
		float: left;
		width: calc(70vw - 140rpx);
		padding: 0rpx 20rpx 20rpx 30rpx;
	}

	.username-text {
		display: block;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		margin: 20rpx 0 40rpx 0;
		font-weight: bold;
		color: #606060;
		font-size: 26rpx;
	}

	.user-id-text {
		font-size: 22rpx;
		background: linear-gradient(180deg, #ff88b0 0%, #ffbfbf 100%);
		padding: 5rpx 15rpx;
		display: inline-block;
		border-radius: 10rpx;
		color: #fff;
		font-weight: 600;
	}

	.clearfix {
		clear: both;
	}

	.pageinfo-infobox {
		width: 620rpx;
		display: flex;
		justify-content: space-evenly;
		padding: 10rpx;
		background: #fff;
		margin: 0rpx auto;
		border-radius: 20rpx;
		box-shadow: 0 0 20px #ff898926;
		padding-bottom: 30rpx;
		position: relative;
		top: 40rpx;

		.info-item {
			width: 200rpx;
			align-items: center;
			padding: 10rpx 0rpx;

			.info-tap {
				display: block;
				width: 100%;
				text-align: center;
				font-size: 24rpx;
				color: #626262;
			}

			.mine-info-number {
				display: block;
				width: 100%;
				text-align: center;
				font-size: 24rpx;
				color: #949494;
				font-weight: 1000;
				margin-top: 20rpx;
			}

			.icon {
				width: 60rpx;
				height: 60rpx;
				margin: 10rpx 70rpx 0rpx 70rpx;
			}
		}
	}

	.button-container {
		// padding: 40rpx;
		overflow: hidden;
		background: #fff;
		box-shadow: 0 0 20px #ff898926;
		margin: 20rpx 0;
		border-radius: 20rpx;
		width: 100%;

		/* 新增按钮样式 */
		.mine-button-item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 30rpx 40rpx;
			background: #fff;
			border-bottom: 1rpx solid #f5f5f5;

			&:last-child {
				border-bottom: none;
			}

			.button-content {
				display: flex;
				align-items: center;
				gap: 40rpx;
			}

			.button-text {
				font-size: 24rpx;
				color: #606060;
				font-weight: 500;
			}
		}
	}




	.input-group {
		margin: 30rpx 0;
	}

	.inputer {
		font-size: 40rpx;
		border-bottom: 2rpx #ddd solid;
		padding: 20rpx;
		margin: 80rpx 0;
		letter-spacing: 5rpx;
		padding-left: 45rpx;
	}

	.action-links {
		margin: 20rpx 20rpx 100rpx 20rpx;
	}

	.float-left {
		float: left;
	}

	.float-right {
		float: right;
	}

	.light-button {
		color: #fff;
		background: #65C3D6;
		box-shadow: 0 0 6rpx #1ed1e1;
		border: 0;
		margin: 40rpx 0;
		border-radius: 30rpx;
		height: 90rpx;
		line-height: 90rpx;
		font-size: 36rpx;

		&:active {
			background: #4e98a9;
		}
	}

	.last-button::after {
		border-bottom: 0 !important;
	}

	// 注册框
	.uni-input-input {
		letter-spacing: 5rpx;
		padding-left: 15rpx;
	}

	.unlogin-container {
		padding: 40rpx 60rpx;
		background: linear-gradient(135deg, #e0f3ff 0%, #fff9fb 100%);
		// background-image: url('/static/120.jpg');
		// background-size: cover;
		// background: #e0f3ff;
		// background-image: radial-gradient(#fff 20%, transparent 0);
		background-size: 15px 15px;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;

		.placeholder-height {
			height: 15vh;
		}

		.welcome-text {
			font-size: 34rpx;
			font-weight: 600;
			color: #2c3e50;
			text-align: center;
			position: relative;

			&::after {
				content: '';
				display: block;
				width: 80rpx;
				height: 6rpx;
				background: #65C3D6;
				margin: 20rpx auto;
				border-radius: 3rpx;
			}
		}

		.input-group {
			width: 100%;
			margin: 40rpx 0;

			.inputer {
				height: 80rpx;
				padding: 0 20rpx;
				margin: 30rpx 0;
				border-radius: 16rpx;
				background: #ffffff;
				// border: 2rpx solid #e6e6e6;
				font-size: 26rpx;
				transition: all 0.3s;
				box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

				&:focus {
					border-color: #65C3D6;
					box-shadow: 0 4rpx 16rpx rgba(101, 195, 214, 0.2);
				}

				&::placeholder {
					color: #bdc3c7;
				}
			}
		}

		.action-links {
			width: 100%;
			margin: 30rpx 0;

			text {
				color: #7f8c8d;
				font-size: 26rpx;
				transition: all 0.3s;

				&:active {
					color: #65C3D6;
				}
			}
		}

		.light-button {
			width: 100%;
			height: 70rpx;
			line-height: 70rpx;
			border-radius: 50rpx;
			font-size: 27rpx;
			font-weight: 500;
			margin: 30rpx 0;
			transition: all 0.3s;
			position: relative;
			overflow: hidden;

			&[disabled] {
				opacity: 0.7;

				&::after {
					background: #bdc3c7;
				}
			}

			&:not([disabled]):active {
				transform: scale(0.98);
				opacity: 0.9;
			}


		}
	}

	// 输入框图标增强（需要添加图标元素）
	.input-with-icon {
		position: relative;

		.icon {
			position: absolute;
			left: 30rpx;
			top: 50%;
			transform: translateY(-50%);
			width: 40rpx;
			height: 40rpx;
			z-index: 2;
		}

		input {
			padding-left: 80rpx !important;
		}
	}

	.submit-btn {
		margin-top: 40rpx;
		background: linear-gradient(135deg, $primary-color, $hover-color);
		color: white;
		border: none;
		border-radius: 50rpx;
		font-size: 26rpx;
		height: 70rpx;
		line-height: 90rpx;
		box-shadow: 0 6rpx 20rpx rgba($primary-color, 0.3);
		transition: all 0.3s;
		width: 100%;
		line-height: 66rpx;

		&::after {
			border: none;
		}

		&.loading {
			opacity: 0.7;
			background: #007aff;
		}

		&[disabled] {
			background: #c8c9cc;
			color: #fff;
		}

		&:active {
			transform: translateY(2rpx);
			box-shadow: 0 4rpx 12rpx rgba($primary-color, 0.3);
		}
	}


	// 适配区域
	.header-placeholders {
		height: v-bind(headerHeight);
	}
	
	// 添加协议样式
	.agreement-container {
	  display: flex;
	  align-items: center;
	  flex-wrap: wrap;
	  margin: 60rpx 0 40rpx;
	  font-size: 24rpx;
	  color: #666;
	  position: relative;
	  right: 30rpx;
	  
	  .agreement-label {
	    display: flex;
	    align-items: center;
	    margin-right: 10rpx;
	  }
	  
	  .agreement-text {
	    margin-left: 5rpx;
	  }
	  
	  .agreement-links {
	    display: flex;
	  }
	  
	  .agreement-link {
	    color: #65C3D6;
	    margin-left: 10rpx;
	    
	    &:active {
	      color: #1ed1e1;
	    }
	  }
	}
</style>