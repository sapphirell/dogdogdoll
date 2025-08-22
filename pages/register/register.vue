<template>
	<view-logs />
	<view class="container">
		<view class="header">
			<text class="title">手机号注册</text>
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
					<input v-model="formData.code" type="number" autocomplete="new-password" placeholder="请输入验证码"
						maxlength="6" class="input" placeholder-class="placeholder" @blur="validateCode" />
					<button class="code-btn" :disabled="codeBtnDisabled" @click="sendSmsCode"
						:class="{ disabled: codeBtnDisabled }">
						{{ codeBtnText }}
					</button>
				</view>
				<text v-if="errors.code" class="error-text">{{ errors.code }}</text>
			</view>

			<!-- 密码输入 -->
			<view class="input-item">
				<view class="input-wrapper">
					<input v-model="formData.password" autocomplete="new-password" type="password"
						placeholder="请输入密码（至少6位）" class="input" placeholder-class="placeholder"
						@blur="validatePassword" />
				</view>
				<text v-if="errors.password" class="error-text">{{ errors.password }}</text>
			</view>

			<!-- 确认密码 -->
			<view class="input-item">
				<view class="input-wrapper">
					<input v-model="formData.rePassword" type="password" placeholder="请再次输入密码" class="input"
						placeholder-class="placeholder" @blur="validateRePassword" />
				</view>
				<text v-if="errors.rePassword" class="error-text">{{ errors.rePassword }}</text>
			</view>

			<!-- 注册按钮 -->
			<button class="submit-btn" :disabled="loading" @click="handleRegister" :class="{ loading: loading }">
				{{ loading ? '注册中...' : '立即注册' }}
			</button>

			<!-- 已有账号 -->
			<view class="bottom-tips">
				已有账号？
				<text class="link-text" @click="navigateToLogin">去登录</text>
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
		password: '',
		rePassword: ''
	})

	const errors = ref({
		phone: '',
		code: '',
		password: '',
		rePassword: ''
	})

	// 验证码按钮状态
	const codeCountdown = ref(0)
	const codeBtnDisabled = computed(() => codeCountdown.value > 0)
	const codeBtnText = computed(() =>
		codeCountdown.value > 0 ? `${codeCountdown.value}秒后重发` : '获取验证码'
	)

	// 加载状态
	const loading = ref(false)

	// 验证手机号
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

	// 发送验证码
	const sendSmsCode = async () => {
		if (!validatePhone()) return

		try {
			const res = await uni.request({
				url: `${websiteUrl.value}/send-sms-code`,
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

	// 倒计时处理
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

	// 验证密码
	const validatePassword = () => {
		if (formData.value.password.length < 6) {
			errors.value.password = '密码至少需要6位'
			return false
		}
		errors.value.password = ''
		return true
	}

	// 验证确认密码
	const validateRePassword = () => {
		if (formData.value.password !== formData.value.rePassword) {
			errors.value.rePassword = '两次密码输入不一致'
			return false
		}
		errors.value.rePassword = ''
		return true
	}

	// 验证验证码
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

	// 注册处理
	const handleRegister = async () => {
		const validations = [
			validatePhone(),
			validateCode(),
			validatePassword(),
			validateRePassword()
		]

		if (!validations.every(v => v)) return

		try {
			loading.value = true
			const res = await uni.request({
				url: `${websiteUrl.value}/register`,
				method: 'POST',
				data: {
					telephone: formData.value.telephone,
					code: formData.value.code,
					password: formData.value.password,
					re_password: formData.value.rePassword
				}
			})

			if (res.data.status === 'success') {
				uni.setStorageSync('token', res.data.data.jwt_token)
				uni.showToast({
					title: '注册成功',
					icon: 'success',
					complete: () => {
						setTimeout(() => {
							uni.switchTab({
								url: '/pages/mine/mine'
							})
						}, 1500)
					}
				})
			} else {
				uni.showToast({
					title: res.data.msg || '注册失败',
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

	// 跳转登录
	const navigateToLogin = () => {
		uni.navigateTo({
			url: '/pages/login/login'
		})
	}
</script>

<style lang="scss" scoped>
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

	.submit-button {}
</style>