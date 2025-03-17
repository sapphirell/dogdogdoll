<template>
	<view style="padding: 15px;">
		<view v-if="global.userInfo.password">
			<input class="inputer" type="password" placeholder="请输入原密码" v-model="oldPassword" />
			<input class="inputer" type="password" placeholder="请输入新密码" v-model="newPassword" />
			<input class="inputer" type="password" placeholder="请再次输入新密码" v-model="newPassword2" />
		</view>
		<view v-else>
			<input class="inputer" type="password" placeholder="请设置密码" v-model="newPassword" />
			<input class="inputer" type="password" placeholder="请再次输入新密码" v-model="newPassword2" />

		</view>
		<button class="light_button" @click="updatePassword">提交</button>
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
		title: '设置密码'
	})
	// 密码表单
	let oldPassword = ref("")
	let newPassword = ref("")
	let newPassword2 = ref("")

	// 修改密码
	function updatePassword() {
		if (newPassword.value != newPassword2.value) {
			uni.showToast({
				title: '两次密码输入不一致',
				icon: 'none'
			})
			return
		}
		if (!global.userInfo.password && !oldPassword.value) {
			uni.showToast({
				title: '请输入原密码',
				icon: 'none'
			})
			return
		}
		// /with-state/setting-password
		uni.request({
			url: websiteUrl + '/with-state/setting-password',
			method: "POST",
			header: {
				'Authorization': uni.getStorageSync('token'),
			},
			data: {
				old_password: oldPassword.value,
				new_password: newPassword.value
			},
			success: (res) => {
				console.log(res.data)
				if (res.data.status == "success") {
					uni.showToast({
						title: '修改成功',
						icon: 'success'
					})
				} else {
					uni.showToast({
						title: res.data.msg,
						icon: 'none'
					})
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