<template>
	<view class="container" :style="{ paddingTop: statusBarHeight + 'px' }" >
	
		<!-- 个人设置页面 -->
		<!-- 区分是否登录 -->
		<view v-if="global.isLogin" style="padding: 10px;">
			<view class="mine">
				<view style="width: 100vw;">
					<view class="avatar_container" style="display: inline-block;width: calc(30vw - 20px); padding: 0px 10px;float: left;">
						<image mode="aspectFill" class="mine_page_avatar" :src="global.userInfo.avatar" @click="jumpToCroper">
						</image>
					</view>
					<view style="display: inline-block;float: left;width: calc(70vw - 40px);padding: 10px;">
						<text style="display: block;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;margin:15px 0px;">{{global.userInfo.username}}</text>
						<text style="display: block;">
							<text class="font-alimamashuhei">ID</text> : {{global.userInfo.id}}
						</text>
					</view>
					<view style="clear: both;"></view>
				</view>
	
				<view class="pageinfo_infobox">
					<view class="info_item">
						<text class="info_tap font-alimamashuhei">好友</text>
						<text class="mine_info_number">10</text>
					</view>
					<view class="info_item">
						<text class="info_tap font-alimamashuhei">消息</text>
						<text class="mine_info_number">10</text>
					</view>
					<view class="info_item">
						<text class="info_tap font-alimamashuhei">关注</text>
						<text class="mine_info_number">0</text>
					</view>
					
				</view>
			</view>

			<view class="button_container">
				<text>常用工具</text>
				<button class="mine_button">
					<image src="../../static/mypost.png" style="width: 18px; height: 18px;"></image>
					<text>我的帖子</text>
				</button>
				<button class="mine_button" @click="jumpSetting">
					<image src="../../static/setting.png" style="width: 18px; height: 18px;"></image>
					<text>账号设置</text>
				</button>
				<button class="mine_button" @click="logout">
					<image src="../../static/logout.png" style="width: 18px; height: 18px;"></image>
					<text>退出账号</text>
				</button>
				
			</view>
		</view>
			
		<view v-else style="padding: 10px 20px 0px 20px;">
			<view style="width: 100vw;height: 10vh;"></view>
			<text style="width: 100%;text-align: left;font-size: 30px;font-weight: bold;display: block;margin: 20px 0px 60px 0px;">欢迎使用娃圈狗狗助手</text>
			<view style="margin: 15px 0px;">
				<input type="text" placeholder="请输入手机号" class="inputer" v-model="inputPhone" />
				<input type="password" placeholder="请输入密码" class="inputer" v-model="inputPassword" />
			</view>
			<view>
				<view style="margin: 10px 10px 50px 10px;">
					<navigator style="float: left;">
						<text>注册</text>
					</navigator>
					
					<navigator style="float: right;">
						<text>忘记密码</text>
					</navigator>
					<view style="clear: both;"></view>
				</view>
				
			
				<button class="light_button" @click="login">登录</button>
				<button class="light_button" @click="wechatSignLogin">微信登录</button>
			
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
	} from "@dcloudio/uni-app";

	import {
		websiteUrl,
		wechatSignLogin,
		getUserInfo, 
		global, 
	} from "../../common/config.js";
	
	console.log(global.isLogin)
	console.log(global.userInfo)
	// //获取登录信息
	// let userInfo = ref({})
	// console.log(userInfo)
	// console.log(config.websiteUrl)
	// //判断是否登录
	// let isLogin = ref(false)
	// if (userInfo) {
	// 	isLogin.value = true
	// }

	//状态栏高度
	const systemInfo = uni.getSystemInfoSync();
	const statusBarHeight = ref(systemInfo.statusBarHeight);
	
	//登录注册输入
	let inputPhone = ref("")
	let inputPassword = ref("")

	//跳转微信登录
	function wechatLogin() {
		var weixinOauth = null;
		plus.oauth.getServices(function(services) {
			for (var i in services) {
				var service = services[i];
				// 获取微信登录对象
				if (service.id == 'weixin') {
					weixinOauth = service;
					break;
				}
			}
			weixinOauth.login(function(oauth) {
				// 授权成功，weixinOauth.authResult 中保存授权信息
			}, function(err) {
				// 登录授权失败
				// err.code是错误码
			})
		}, function(err) {
			// 获取 services 失败
		})
	}
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
	

	

	// 裁切头像
	function jumpToCroper() {
		chooseImage().then(src => {
			uni.navigateTo({
				url: `/pages/pop_croper/pop_croper?src=${decodeURIComponent(src)}`
			})
		})
	}

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
	
	function jumpSetting () {
		uni.navigateTo({
			url: '/pages/setting/setting',
		})
	}
	
	// 获取一次个人信息，判断是否是登录超时
	getUserInfo();


	onShow(() => {
		const pages = getCurrentPages();
		const currentPage = pages[pages.length - 1];
		if (currentPage.returnParam) {
			selectAvatar(currentPage.returnParam); // 调用上传逻辑
		}
	})
</script>



<style lang="scss" scoped>
	.container {
		background: linear-gradient(180deg, rgb(218 238 255) 0%, rgb(255 255 255) 100%);
	}
	.avatar_container {
		// align-items: center;
		// width: 100vw;
		// padding-top: 145px;
		// background: linear-gradient(180deg, #d7d7d7 0%, rgb(255 255 255) 100%);

		.mine_page_avatar {
			// 头像
			width: 100%;
			height: auto;
			box-shadow: 0 0 3px #ddd;
			aspect-ratio: 1;
			margin: 10px auto;
			display: block;
			border-radius: 10px;
		}
	}

	.button_container {
		padding: 20px;
		background: #fff;
		box-shadow: 0 0 3px #ddd;
		margin: 10px 0px;
		
		text {
			margin: 20px 0px;
			font-weight: 900;
		}
		.mine_button {
			background: #fff;
			border-width: 0px!important;
			margin: 10px 0px;
			position: relative;
			padding-bottom: 10px;
			
			&::after{
				border: none;
				border-bottom: 1px solid rgba(0, 0, 0, 0.2);
			}
			
			image {
				position: absolute;
				left: 20px;
				top: 15px;
			}
		}
		.button_item {
			margin: 20px 0px !important;
			display: block;
			border-radius: 0px !important;
		
			
		
		}
	}
	
	.pageinfo_infobox {
		width: 100%;
		display: block;
		display: flex;
		justify-content: space-evenly;
		padding: 10px;
		
		.info_item {
			width: 25vw;
			
			.info_tap {
				display: block;
				width: 100%;
				text-align: center;
				margin: 15px 0px;
			}
			.mine_info_number {
				display: block;
				width: 100%;
				text-align: center;
			}
		}
	}
	
	.inputer {
		font-size: 20px;
		border-bottom: 1px #ddd solid;
		padding: 10px;
		margin: 40px 0px;
	}
	
	.light_button {
		color: #fff;
		background: #65C3D6;
		box-shadow:0 0 3px #1ed1e1;
		border: 0px;
		margin: 20px 0px;
		border-radius: 15px;
		
	}
	.light_button:active {
		background: #4e98a9;
	}
	
	uni-button:after {
		border:0px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.2);
	}

</style>