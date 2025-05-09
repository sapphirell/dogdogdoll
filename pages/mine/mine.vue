<template>
	<meta name="theme-color" content="#e0f3ff"></meta>
	<common-page head_color="#e0f3ff">
		<view class="container">
			<!-- 个人设置页面 -->
			<!-- 区分是否登录 -->
			<view v-if="global.isLogin">
				<view class="mine">
					<view class="full-width">
						<view class="avatar-container">
							<image mode="aspectFill" class="mine-page-avatar" :src="global.userInfo.avatar"
								@click="jumpToCroper" />
						</view>
						<view class="user-info-container">
							<text class="username-text font-alimamashuhei">{{global.userInfo.username}}</text>
							<text class="user-id-text">
								<text class="font-alimamashuhei" style="color: #fff;font-size: 22rpx;">ID</text> : {{global.userInfo.id}}
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
						<button class="mine-button" @click="jump2myComment">
							<image class="icon-small" src="../../static/mypost.png" />
							<text>我的帖子</text>
							<image class="right-bar" src="../../static/right.png" />
						</button>
						<button class="mine-button" @click="jumpSetting">
							<image class="icon-small" src="../../static/setting.png" />
							<text>账号设置</text>
							<image class="right-bar" src="../../static/right.png" />
						</button>
						<button class="mine-button last-button" @click="logout">
							<image class="icon-small" src="../../static/logout.png" />
							<text>退出账号</text>
							<image class="right-bar" src="../../static/right.png" />
						</button>
					</view>
				</view>

			</view>

			<view v-else class="unlogin-container">
			  <image src="/static/main/2.png" mode="aspectFit" style="width: 300rpx;height: 340rpx;position: relative;right: 20rpx;"></image>
			  <text class="welcome-text">欢迎使用娃圈狗狗助手</text>
			  <view class="input-group">
			    <view class="input-with-icon">
			      <image class="icon" src="/static/user.png"/>
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
			  <button class="submit-btn" @click="wechatSignLogin">微信登录</button>
			</view>

		</view>
	</common-page>

</template>
<script setup>
	import {
		ref, watch
	} from 'vue';

	import {
		onShow
	} from "@dcloudio/uni-app";

	import {
		websiteUrl,
		wechatSignLogin,
		getUserInfo,
		global,
	} from "../../common/config.js";

	console.log(global.isLogin)
	console.log(global.userInfo)

	//登录注册输入
	let inputPhone = ref("")
	let inputPassword = ref("")
	
	let unreadCount = ref(0)
	let likeCount = ref(0)
	let myCollocationCount = ref(0)


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
	
	watch(
	  () => global.isLogin, // 使用函数返回要监听的值
	  (newVal) => {
		console.log("watch", newVal)
		if (newVal) {
		  uni.showTabBar({ animation: false })
		} else {
		  uni.hideTabBar({ animation: false })
		}
	  }
	)
	
	

	onShow(() => {
		// 获取一次个人信息，判断是否是登录超时
		getUserInfo();
		if (global.isLogin) {
		  uni.showTabBar({ animation: false })
		} else {
		  uni.hideTabBar({ animation: false })
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
		background: #e0f3ff;
		background-image: radial-gradient(#fff 20%, transparent 0);
		background-size: 20px 20px;
		height: 400rpx;
		margin-bottom: 200rpx;
		.full-width {
			width: 100%;
			padding: 60rpx 50rpx 20rpx 50rpx;
			box-sizing: border-box;
		}
	}

	.main-padding {
		// padding: 20rpx;
		margin: 100rpx auto;
		width: 620rpx;
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
		background: linear-gradient(180deg, #ffa5c3 0%, #ffd6d6 100%);
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
		box-shadow: 0 0 6rpx #ddd;
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
		box-shadow: 0 0 5rpx #eaeaea;
		margin: 20rpx 0;
		border-radius: 20rpx;
		width: 100%;

		.mine-button {
			background: #fff;
			border-width: 0 !important;
			margin: 20rpx 0;
			position: relative;
			// padding-bottom: 20rpx;
			text-align: left;
			font-weight: 600;

			&::after {
				border: none;
				// border-bottom: 1px solid rgba(0, 0, 0, 0.2);
			}

			text {
				margin-left: 110rpx;
				color: #606060;
				font-size: 24rpx;
			}

			.icon-small {
				width: 32rpx;
				height: 32rpx;
				position: absolute;
				left: 40rpx;
				top: 30rpx;
			}

			.right-bar {
				width: 32rpx;
				height: 32rpx;
				position: relative;
				top: 26rpx;
				float: right;
			}
		}
	}

	// .unlogin-container {
	// 	padding: 20rpx 40rpx 0 40rpx;

	// 	.placeholder-height {
	// 		width: 100vw;
	// 		height: 20vh;
	// 	}

	// 	.welcome-text {
	// 		width: 100%;
	// 		text-align: left;
	// 		font-size: 60rpx;
	// 		font-weight: bold;
	// 		display: block;
	// 		margin: 40rpx 0 120rpx 0;
	// 	}
	// }

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
	
</style>