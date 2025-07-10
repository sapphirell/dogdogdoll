<template>
	<view-logs />
	<view style="padding: 15px;">
		<view v-if="global.userInfo.tel_phone">
			<input type="text" class="inputer" :value="global.userInfo.tel_phone" disabled=""/>
			<text style="padding: 10px;font-size: 20px;color: rgb(190 190 190);">已绑定，如需修改请联系管理员操作。</text>
		</view>
		<view v-else>
			<input class="inputer" type="text" placeholder="请输入手机号" v-model="telPhone" />
			<view style="position: relative;" >
				<input class="inputer" type="text" placeholder="请输入验证码" v-model="code" />
				<button style="position: absolute;right: 0px;width: 110px;font-size: 16px;bottom: 10px;"  @click="sendCode">
					<text>{{buttonMsg}}</text>
				</button>
			</view>
	

		</view>
		<button class="light_button" @click="updateTelPhone" v-if="!global.userInfo.tel_phone">提交</button>

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
	} from "../../../common/config.js";

	uni.setNavigationBarTitle({
		title: '手机号'
	})
	// 关联表单
	let telPhone = ref("")
	let code = ref("")
	let buttonMsg = ref("发送验证码")

	function updateTelPhone() {
		uni.request({
			url: websiteUrl + '/with-state/update-profile',
			method: "POST",
			header: {
				'Authorization': uni.getStorageSync('token'),
			},
			data: {
				tel_phone: telPhone.value,
				code: code.value
			},
			success: (res) => {
				console.log(res.data)
				if (res.data.status == "success") {
					uni.showToast({
						title: '修改成功',
						icon: 'success'
					})
					getUserInfo();
				} else {
					uni.showToast({
						title: res.data.msg,
						icon: 'none'
					})
				}
			}
		})
	}
	
	// 发送验证码
	function sendCode() {
		if (buttonMsg.value != "发送验证码") {
			uni.showToast({
				title: '请点击发送验证码',
				icon: 'none'
			})
			return
		}
		//检测是否已经填写手机号
		if (telPhone.value == "" || telPhone.value == "") {
			uni.showToast({
				title: '请输入手机号和密码',
				icon: 'none',
			});
			return
		}
		//检查手机号规则是否合法
		if (!(/^1[3456789]\d{9}$/.test(telPhone.value))) {
			uni.showToast({
				title: '手机号格式错误',
				icon: 'none',
			});
			return
		}
		buttonMsg.value = "发送中"
		uni.request({
			url: websiteUrl + '/send-sms-code',
			method: "POST",
			header: {
				'Authorization': uni.getStorageSync('token'),
			},
			data: {
				tel_phone: telPhone.value,
			},
			success: (res) => {
				console.log(res.data)
				if (res.data.status == "success") {
					buttonMsg.value = "已发送";
					uni.showToast({
						title: '发送成功',
						icon: 'success'
					})
				} else {
					uni.showToast({
						title: res.data.msg,
						icon: 'none'
					})
					buttonMsg.value = "发送验证码"
				}
			}
		})
	}


	getUserInfo();
</script>

<style lang="less" scoped>
	text {
		font-size: 26rpx;
	}
	.light_button {
		color: #fff;
		background: #65C3D6;
		box-shadow: 0 0 3px #1ed1e1;
		border: 0px;
		margin: 20px 0px;
		border-radius: 15px;

	}
	.light_button:active {
		background: #4e98a9;
	}
	

	.inputer {
			font-size: 28rpx;
		border-bottom: 1px #ddd solid;
		padding: 10px;
		margin: 40px 0px;
	}
</style>