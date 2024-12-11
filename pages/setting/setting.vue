<template>
	<view class="container">
		<view class="item">
			<text class="tab_text">密码设置</text>
			<view class="button_body">
				<button v-if="global.userInfo.password" @click="jump2password">
					<text class="binded">已设置</text>
					<image src="../../static/right.png" style="width: 18px;height: 18px;position: relative;top: 3px;">
					</image>
				</button>
				<button v-else @click="jump2password">
					<text class="notBind">未设置</text>
					<image src="../../static/right.png" style="width: 18px;height: 18px;position: relative;top: 3px;">
					</image>

				</button>
			</view>
			<view style="clear: both;"></view>
		</view>


		<view class="item">
			<text class="tab_text">手机号</text>
			<view class="button_body">
				<button v-if="global.userInfo.tel_phone" @click="jump2telphone">
					<text class="binded">已绑定</text>
					<image src="../../static/right.png" style="width: 18px;height: 18px;position: relative;top: 3px;">
					</image>
				</button>
				<button v-else @click="jump2telphone">
					<text class="notBind">未设置</text>
					<image src="../../static/right.png" style="width: 18px;height: 18px;position: relative;top: 3px;">
					</image>

				</button>
			</view>
			<view style="clear: both;"></view>
		</view>

		<view class="item">
			<text class="tab_text">微信账号</text>
			<view class="button_body">
				<button v-if="global.userInfo.wechat_open_id" @click="jump2wechat">
					<text class="binded">已绑定</text>
					<image src="../../static/right.png" style="width: 18px;height: 18px;position: relative;top: 3px;">
					</image>
				</button>
				<button v-else @click="jump2wechat">
					<text class="notBind">未绑定</text>
					<image src="../../static/right.png" style="width: 18px;height: 18px;position: relative;top: 3px;">
					</image>

				</button>
			</view>
			<view style="clear: both;"></view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue';
	import {
		websiteUrl,
		wechatSignLogin,
		getUserInfo,
		global,
	} from "../../common/config.js";
	uni.setNavigationBarTitle({
		title: '设置'
	});

	// 用户信息
	let userInfo = ref({})




	//跳转到密码设置页面
	function jump2password() {
		uni.navigateTo({
			url: '/pages/setting/password/password'
		})
	}
	//跳转到手机号设置页面
	function jump2telphone() {
		uni.navigateTo({
			url: '/pages/setting/tel_phone/tel_phone'
		})
	}
	//绑定微信
	function jump2wechat() {
		//是否绑定过微信
		if (userInfo.wechat_open_id) {
			uni.showToast({
				title: '已绑定微信',
				icon: 'none'
			})
			return
		}
	}

	getUserInfo();
</script>

<style lang="less" scoped>
	text {
		font-size: 18px;
	}

	button {
		background: #fff;
		&::after {
			border: none;
		}
	}

	uni-button {
		font-size: 18px;
		background-color: #fff;
		width: 120px;
		margin: 0px;
		padding: 0px;
	}

	uni-button:after {
		border: 0px;
		display: inline-block;
		float: right;
		width: 80px;
	}

	.container {
		// background: #f7f7f7;
		height: 100vh;

		.item {

			background: #fff;
			padding: 5px;
			margin: 15px;
			box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
			border-radius: 8px;

			.tab_text {
				float: left;
				padding: 11px;
			}

			.button_body {
				width: 120px;
				float: right;
				box-sizing: border-box;

				.binded {
					color: #4cbbd0!important;
				}

				.notBind {
					color: #a2a2a2!important;
				}
			}

			image {
				margin-left: 8px;
			}
		}
	}
	.inputer {
		font-size: 20px;
		border-bottom: 1px #ddd solid;
		padding: 10px;
		margin: 40px 0px;
	}
</style>