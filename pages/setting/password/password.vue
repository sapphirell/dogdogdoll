<template>
	<view-logs />
	<view class="password-container">
		<view class="form-wrapper">
			<view v-if="global.userInfo.password" class="input-group">
				<view class="input-item">
					<input class="input" type="password" placeholder=" " v-model="oldPassword" />
					<label class="floating-label">原密码</label>
					<uni-icons class="input-icon" type="locked" size="18" color="#999" />
				</view>
				<view class="input-item">
					<input class="input" type="password" placeholder=" " v-model="newPassword" />
					<label class="floating-label">新密码</label>
					<uni-icons class="input-icon" type="gear" size="18" color="#999" />
				</view>
				<view class="input-item">
					<input class="input" type="password" placeholder=" " v-model="newPassword2" />
					<label class="floating-label">确认新密码</label>
					<uni-icons class="input-icon" type="checkmarkempty" size="18" color="#999" />
				</view>
			</view>
			<view v-else class="input-group">
				<view class="input-item">
					<input class="input" type="password" placeholder=" " v-model="newPassword" />
					<label class="floating-label">设置密码</label>
					<uni-icons class="input-icon" type="locked" size="18" color="#999" />
				</view>
				<view class="input-item">
					<input class="input" type="password" placeholder=" " v-model="newPassword2" />
					<label class="floating-label">确认密码</label>
					<uni-icons class="input-icon" type="checkmarkempty" size="18" color="#999" />
				</view>
			</view>

			<view class="password-strength" v-if="newPassword">
				<view class="strength-bar" :class="getStrengthClass(1)"></view>
				<view class="strength-bar" :class="getStrengthClass(2)"></view>
				<view class="strength-bar" :class="getStrengthClass(3)"></view>
				<text class="strength-text">{{ strengthText }}</text>
			</view>

			<button class="submit-btn" :class="{active: isFormValid}" @click="updatePassword" :disabled="!isFormValid">
				{{ global.userInfo.password ? '更新密码' : '设置密码' }}
			</button>
		</view>

		<view class="security-tips">
			<uni-icons type="info" size="16" color="#666" />
			<text>建议使用8位以上包含字母和数字的组合</text>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed
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

	// 根据当前状态验证表单有效性
	const isFormValid = computed(() => {
		return newPassword.value && newPassword2.value && newPassword.value === newPassword2.value
	})

	// 密码强度计算 	  // 根据密码复杂度返回提示文本
	const strengthText = computed(() => {
		if (newPassword.value.length < 6) {
			return '密码过于简单'
		} else if (newPassword.value.length < 10) {
			return '密码强度一般'
		} else {
			return '密码强度较高'
		}
	})

	// 强度条样式
	const getStrengthClass = (level) => {
		// 根据密码强度返回对应样式

		if (newPassword.value.length < 6) {
			return 'weak'
		} else if (newPassword.value.length < 10) {
			return 'medium'
		} else {
			return 'strong'
		}
	}



	// 修改密码
	function updatePassword() {
		if (newPassword.value != newPassword2.value) {
			uni.showToast({
				title: '两次密码输入不一致',
				icon: 'none'
			})
			return
		}
		if ( global.userInfo.password && !oldPassword.value) {
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
	@primary-color: #65C3D6;
	@error-color: #ff5252;
	@success-color: #4CAF50;
	@bg-color: #f5f7fa;

	.password-container {
		padding: 40rpx;
		background: @bg-color;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.form-wrapper {
		background: #fff;
		border-radius: 24rpx;
		padding: 40rpx;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);
	}

	.input-group {
		margin-bottom: 40rpx;
	}

	.input-item {
		margin-bottom: 48rpx;
		position: relative;

		&:last-child {
			margin-bottom: 0;
		}
	}

	.input {
		height: 100rpx;
		padding: 0 80rpx 0 40rpx;
		font-size: 32rpx;
		border: 2rpx solid #e0e0e0;
		border-radius: 16rpx;
		transition: all 0.3s ease;

		&:focus {
			border-color: @primary-color;
			box-shadow: 0 4rpx 12rpx rgba(101, 195, 214, 0.2);

			&+.floating-label {
				transform: translateY(-220%);
				font-size: 26rpx;
				color: @primary-color;
			}
		}
	}

	.floating-label {
		position: absolute;
		left: 40rpx;
		top: 60%;
		transform: translateY(-50%);
		color: #999;
		font-size: 32rpx;
		pointer-events: none;
		transition: all 0.3s ease;
		background: #fff;

		.input:not(:placeholder-shown)+&,
		.input:focus+& {
			transform: translateY(-220%);
			font-size: 26rpx;
		}
	}

	.input-icon {
		position: absolute;
		right: 30rpx;
		top: 50%;
		transform: translateY(-50%);
	}

	.password-strength {
		display: flex;
		align-items: center;
		gap: 16rpx;
		margin: 32rpx 0;

		.strength-bar {
			height: 8rpx;
			flex: 1;
			background: #eee;
			border-radius: 4rpx;
			transition: all 0.3s ease;

			&.weak {
				background: @error-color;
			}

			&.medium {
				background: #ffb300;
			}

			&.strong {
				background: @success-color;
			}
		}

		.strength-text {
			font-size: 26rpx;
			color: #666;
		}
	}

	.submit-btn {
		width: 100%;
		height: 96rpx;
		background: linear-gradient(135deg, #65C3D6 0%, #4CA1AF 100%);
		color: #fff;
		font-size: 32rpx;
		border-radius: 16rpx;
		border: none;
		position: relative;
		overflow: hidden;
		transition: all 0.3s ease;
		line-height: 96rpx;


		&:active {
			transform: scale(0.98);
			opacity: 0.9;
		}

		&.active {
			box-shadow: 0 8rpx 24rpx rgba(101, 195, 214, 0.3);
		}

		.loading {
			position: absolute;
			right: 30rpx;
			top: 50%;
			transform: translateY(-50%);
			width: 32rpx;
			height: 32rpx;
			border: 3rpx solid #fff;
			border-top-color: transparent;
			border-radius: 50%;
			animation: spin 0.8s linear infinite;
		}
	}

	.security-tips {
		margin-top: 40rpx;
		padding: 24rpx;
		background: #fff;
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		gap: 12rpx;
		font-size: 26rpx;
		color: #666;
		
		.uni-icons {
			flex: 1;
		}

		text {
			flex: 6;
		}
	}

	@keyframes spin {
		to {
			transform: translateY(-50%) rotate(360deg);
		}
	}
</style>