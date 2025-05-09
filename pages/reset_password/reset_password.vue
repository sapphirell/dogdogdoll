<template>
	<view class="container">
		<view class="header">
			<text class="title">重置密码</text>
		</view>

		<view class="form-box">
			<!-- 手机号输入 -->
			<view class="input-item">
				<view class="input-wrapper">
					<text class="prefix">+86</text>
					<input v-model="formData.telephone" type="number" placeholder="请输入手机号" maxlength="11" class="input"
						placeholder-class="placeholder" @blur="validatePhone" />
				</view>
				<text v-if="errors.phone" class="error-text">{{ errors.phone }}</text>
			</view>

			<!-- 验证码输入 -->
			<view class="input-item">
				<view class="code-wrapper">
					<input v-model="formData.code" type="number" placeholder="请输入验证码" maxlength="6" class="input"
						placeholder-class="placeholder" @blur="validateCode" />
					<button class="code-btn" :disabled="codeBtnDisabled" @click="sendSmsCode"
						:class="{ disabled: codeBtnDisabled }">
						{{ codeBtnText }}
					</button>
				</view>
				<text v-if="errors.code" class="error-text">{{ errors.code }}</text>
			</view>

			<!-- 新密码输入 -->
			<view class="input-item">
				<view class="input-wrapper">
					<input v-model="formData.newPassword" type="password" placeholder="请输入新密码（至少6位）" class="input"
						placeholder-class="placeholder" @blur="validateNewPassword" />
				</view>
				<text v-if="errors.newPassword" class="error-text">{{ errors.newPassword }}</text>
			</view>

			<!-- 确认新密码 -->
			<view class="input-item">
				<view class="input-wrapper">
					<input v-model="formData.reNewPassword" type="password" placeholder="请再次输入新密码" class="input"
						placeholder-class="placeholder" @blur="validateReNewPassword" />
				</view>
				<text v-if="errors.reNewPassword" class="error-text">{{ errors.reNewPassword }}</text>
			</view>

			<!-- 提交按钮 -->
			<button class="submit-btn" :disabled="loading" @click="handleResetPassword" :class="{ loading: loading }">
				{{ loading ? '提交中...' : '重置密码' }}
			</button>

			<!-- 返回登录 -->
			<view class="bottom-tips">
				<text class="link-text" @click="navigateToLogin">返回登录</text>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed
	} from 'vue'
	import {
		websiteUrl
	} from '@/common/config.js'

	const formData = ref({
		telephone: '',
		code: '',
		newPassword: '',
		reNewPassword: ''
	})

	const errors = ref({
		phone: '',
		code: '',
		newPassword: '',
		reNewPassword: ''
	})

	// 验证码按钮状态
	const codeCountdown = ref(0)
	const codeBtnDisabled = computed(() => codeCountdown.value > 0)
	const codeBtnText = computed(() =>
		codeCountdown.value > 0 ? `${codeCountdown.value}秒后重发` : '获取验证码'
	)

	// 加载状态
	const loading = ref(false)

	// 验证手机号（复用注册页面的验证逻辑）
	const validatePhone = () => {
		if (!formData.value.telephone) {
			errors.value.phone = '手机号不能为空'
			return false
		}
		if (!/^1[3-9]\d{9}$/.test(formData.value.telephone)) {
			errors.value.phone = '手机号格式不正确'
			return false
		}
		errors.value.phone = ''
		return true
	}

	// 发送验证码（修改API地址）
	const sendSmsCode = async () => {
		if (!validatePhone()) return

		try {
			const res = await uni.request({
				url: `${websiteUrl}/send-sms-code`, // 根据实际接口调整
				method: 'POST',
				data: {
					tel_phone: formData.value.telephone
				}
			})

			if (res.data.status === 'success') {
				startCountdown()
				uni.showToast({
					title: '验证码已发送',
					icon: 'none'
				})
			} else {
				uni.showToast({
					title: res.data.msg || '发送失败',
					icon: 'none'
				})
			}
		} catch (err) {
			uni.showToast({
				title: '网络请求失败',
				icon: 'none'
			})
		}
	}

	// 验证新密码
	const validateNewPassword = () => {
		if (formData.value.newPassword.length < 6) {
			errors.value.newPassword = '密码至少需要6位'
			return false
		}
		errors.value.newPassword = ''
		return true
	}

	// 验证确认密码
	const validateReNewPassword = () => {
		if (formData.value.newPassword !== formData.value.reNewPassword) {
			errors.value.reNewPassword = '两次密码输入不一致'
			return false
		}
		errors.value.reNewPassword = ''
		return true
	}

	// 验证验证码（复用注册逻辑）
	const validateCode = () => {
		if (!formData.value.code) {
			errors.value.code = '验证码不能为空'
			return false
		}
		if (formData.value.code.length !== 6) {
			errors.value.code = '验证码格式不正确'
			return false
		}
		errors.value.code = ''
		return true
	}

	// 提交重置请求
	const handleResetPassword = async () => {
		const validations = [
			validatePhone(),
			validateCode(),
			validateNewPassword(),
			validateReNewPassword()
		]

		if (!validations.every(v => v)) return

		try {
			loading.value = true
			const res = await uni.request({
				url: `${websiteUrl}/reset-password`, // 修改为重置密码接口
				method: 'POST',
				data: {
					telephone: formData.value.telephone,
					code: formData.value.code,
					password: formData.value.newPassword,
					re_password: formData.value.reNewPassword
				}
			})

			if (res.data.status === 'success') {
				uni.showToast({
					title: '密码重置成功',
					icon: 'success',
					complete: () => {
						setTimeout(() => {
							uni.navigateBack() // 返回登录页面或指定页面
						}, 1500)
					}
				})
			} else {
				uni.showToast({
					title: res.data.msg || '重置失败',
					icon: 'none'
				})
			}
		} catch (err) {
			uni.showToast({
				title: '网络请求失败',
				icon: 'none'
			})
		} finally {
			loading.value = false
		}
	}

	// 倒计时处理（复用注册逻辑）
	const startCountdown = () => {
		codeCountdown.value = 60
		const timer = setInterval(() => {
			if (codeCountdown.value <= 0) {
				clearInterval(timer)
				return
			}
			codeCountdown.value--
		}, 1000)
	}

	// 返回登录
	const navigateToLogin = () => {
		uni.navigateBack()
	}
</script>

<style lang="scss" scoped>
	/* 复用注册页面的样式，保持一致性 */
	$primary-color: #a6e9f7;
	$hover-color: #1ed1e1;
	$border-color: #e6e6e6;
	$radius: 8px;


	.container {
		padding: 60rpx 48rpx;
		min-height: 100vh;
		background: #f8f9fa;
	}

	.header {
		margin-bottom: 96rpx;

		.title {
			font-size: 56rpx;
			font-weight: 600;
			color: #333;
			line-height: 1.4;
		}
	}

	.form-box {
		.input-item {
			margin-bottom: 48rpx;

			.item-label {
				display: block;
				font-size: 28rpx;
				color: #666;
				margin-bottom: 24rpx;
			}

			/* 统一输入框容器样式 */
			.input-wrapper,
			.code-wrapper {
				position: relative;
				height: 96rpx;
				background: #ffffff;
				border-radius: 16rpx;
				// border: 2rpx solid #e5e5e5;
				padding: 0 24rpx;
				display: flex;
				align-items: center;
			}

			/* 手机号前缀样式 */
			.prefix {
				font-size: 28rpx;
				color: #666;
				margin-right: 16rpx;
			}

			/* 输入框通用样式 */
			.input {
				flex: 1;
				height: 100%;
				font-size: 28rpx;
				color: #333;
			}

			/* 验证码容器特殊处理 */
			.code-wrapper {
				padding: 0;
				overflow: hidden;

				.input {
					padding: 0 24rpx;
					border-right: 2rpx solid #e5e5e5;
				}
			}

			/* 验证码按钮样式 */
			.code-btn {
				width: 220rpx;
				height: 100%;
				line-height: 90rpx;
				// background: #81ffff;
				background: linear-gradient(135deg, $primary-color, $hover-color);
				border-radius: 0;
				font-size: 28rpx;
				color: #fff;
				padding: 0;
				transition: all 0.3s;

				&::after {
					border: none;
				}

				&.disabled {
					background: #c8c9cc;
					color: #fff;
				}
			}

			.placeholder {
				color: #cccccc;
				font-size: 28rpx;
			}

			.error-text {
				display: block;
				margin-top: 16rpx;
				color: #ff4d4f;
				font-size: 24rpx;
				line-height: 1.4;
			}
		}

		.submit-btn {
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

		.bottom-tips {
			text-align: center;
			margin-top: 48rpx;
			font-size: 28rpx;
			color: #666;

			.link-text {
				color: #007aff;
				margin-left: 16rpx;
			}
		}
	}



	/* 微调标题样式 */
	.title {
		color: #ff6b6b;
	}
</style>