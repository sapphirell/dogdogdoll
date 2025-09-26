<template>
	<view-logs />
	<view class="page">
		<view v-if="global.userInfo.tel_phone">
			<input type="text" class="input input--disabled" :value="global.userInfo.tel_phone" disabled />
			<text class="tip">已绑定，如需修改请联系管理员操作。</text>
		</view>

		<view v-else>
			<view class="field">
				<input class="input" type="text" placeholder="请输入手机号" v-model="telPhone" />
			</view>

			<!-- 重要：采用 Flex 横向布局，彻底避免 input 与按钮的层叠/覆盖问题（安卓小程序 input 为原生组件，会遮挡绝对定位元素） -->
			<view class="field code-field">
				<input class="input flex-1" type="text" placeholder="请输入验证码" v-model="code" />
				<button class="code-btn" :class="{ 'is-disabled': buttonMsg !== '发送验证码' }" :disabled="buttonMsg !== '发送验证码'" @click="sendCode">
					<text>{{ buttonMsg }}</text>
				</button>
			</view>
		</view>

		<button class="primary-btn" @click="updateTelPhone" v-if="!global.userInfo.tel_phone">提交</button>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { websiteUrl, wechatSignLogin, getUserInfo, global } from "../../../common/config.js"

uni.setNavigationBarTitle({ title: '手机号' })

// 关联表单
const telPhone = ref('')
const code = ref('')
const buttonMsg = ref('发送验证码')
let timer = null

function updateTelPhone() {
	uni.request({
		url: websiteUrl.value + '/with-state/update-profile',
		method: 'POST',
		header: { Authorization: uni.getStorageSync('token') },
		data: { tel_phone: telPhone.value, code: code.value },
		success: (res) => {
			if (res.data.status === 'success') {
				uni.showToast({ title: '修改成功', icon: 'success' })
				getUserInfo()
			} else {
				uni.showToast({ title: res.data.msg || '提交失败', icon: 'none' })
			}
		},
	})
}

// 发送验证码（修正重复点击与文案；安卓小程序避免绝对定位覆盖导致点击失效）
function sendCode() {
	if (buttonMsg.value !== '发送验证码') {
		uni.showToast({ title: '请勿重复发送', icon: 'none' })
		return
	}
	if (!telPhone.value) {
		uni.showToast({ title: '请输入手机号', icon: 'none' })
		return
	}
	if (!/^1[3-9]\d{9}$/.test(telPhone.value)) {
		uni.showToast({ title: '手机号格式错误', icon: 'none' })
		return
	}

	buttonMsg.value = '发送中…'
	uni.request({
		url: websiteUrl.value + '/send-sms-code',
		method: 'POST',
		header: { Authorization: uni.getStorageSync('token') },
		data: { tel_phone: telPhone.value },
		success: (res) => {
			if (res.data.status === 'success') {
				uni.showToast({ title: '发送成功', icon: 'success' })
				startCountdown(60)
			} else {
				uni.showToast({ title: res.data.msg || '发送失败', icon: 'none' })
				buttonMsg.value = '发送验证码'
			}
		},
		fail: () => {
			buttonMsg.value = '发送验证码'
		},
	})
}

function startCountdown(seconds) {
	let left = seconds
	clearInterval(timer)
	timer = setInterval(() => {
		left -= 1
		if (left <= 0) {
			clearInterval(timer)
			buttonMsg.value = '发送验证码'
		} else {
			buttonMsg.value = `${left}s后重发`
		}
	}, 1000)
}

getUserInfo()
</script>

<style lang="less" scoped>
/* 说明：
  1) 安卓小程序端 input 是原生组件，层级高，绝对定位的按钮容易被遮挡导致点击无效；
  2) 采用 Flex 横排 + 固定按钮宽度，避免层叠；不依赖 z-index；
*/

.page {
	padding: 30rpx;
}

.field {
	margin: 24rpx 0;
}

.input {
	width: 100%;
	height: 88rpx;
	line-height: 88rpx;
	border: 1px solid #ddd;
	border-radius: 12rpx;
	padding: 0 24rpx;
	box-sizing: border-box;
	background-color: #fff;
	font-size: 28rpx;
}

.input--disabled {
	color: #aaa;
}

.code-field {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.flex-1 {
	flex: 1;
}

.code-btn {
	height: 88rpx;
	line-height: 88rpx;
	padding: 0 24rpx;
	border-radius: 12rpx;
	background: #65C3D6;
	color: #fff;
	border: none;
}

.code-btn:active { background: #4e98a9; }
.code-btn.is-disabled { opacity: .6; }

.primary-btn {
	color: #fff;
	background: #65C3D6;
	box-shadow: 0 0 3px #1ed1e1;
	border: 0;
	margin: 20rpx 0;
	border-radius: 15rpx;
	height: 88rpx;
	line-height: 88rpx;
}
.primary-btn:active { background: #4e98a9; }

.tip { padding: 10rpx 0; font-size: 26rpx; color: #bebebe; }

/* 兼容性补充：避免父容器 overflow:hidden 影响子元素可点击区域；此处不设置绝对定位 */
</style>
