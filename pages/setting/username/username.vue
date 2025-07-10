<template>
	<view-logs />
  <view class="password-container">
    <view class="form-wrapper">
      <view class="input-group">
        <view class="input-item">
          <input 
            class="input" 
            type="text" 
            placeholder=" " 
            v-model="username" 
            maxlength="20"
          />
          <label class="floating-label">用户名</label>
          <uni-icons class="input-icon" type="person" size="18" color="#999" />
        </view>
      </view>

      <button 
        class="submit-btn" 
        :class="{active: isFormValid}" 
        @click="updateUsername"
        :disabled="!isFormValid"
      >
        {{ isLoading ? '提交中...' : '更新用户名' }}
        <view class="loading" v-if="isLoading"></view>
      </button>
    </view>

    <view class="security-tips">
      <uni-icons type="info" size="16" color="#666" />
      <text>用户名2-20个字符，支持中英文、数字和下划线</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { websiteUrl, global, getUserInfo } from "../../../common/config.js"

uni.setNavigationBarTitle({
  title: '修改用户名'
})

const username = ref(global.userInfo.username || '')
const isLoading = ref(false)

// 表单验证
const isFormValid = computed(() => {
  return username.value.length >= 2 && 
         username.value !== global.userInfo.username
})

// 更新用户名
async function updateUsername() {
  if (!isFormValid.value) return
  
  try {
    isLoading.value = true
    const res = await uni.request({
      url: websiteUrl + '/with-state/update-profile',
      method: 'POST',
      header: {
        'Authorization': uni.getStorageSync('token')
      },
      data: {
        username: username.value
      }
    })

    if (res.data.status === "success") {
      uni.showToast({
        title: '更新成功',
        icon: 'success'
      })
      // 更新全局用户信息
      await getUserInfo()
      setTimeout(() => uni.navigateBack(), 1500)
    } else {
      uni.showToast({
        title: res.data.msg || '更新失败',
        icon: 'none'
      })
    }
  } catch (error) {
    uni.showToast({
      title: '请求失败，请稍后重试',
      icon: 'none'
    })
  } finally {
    isLoading.value = false
  }
}
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

/* 新增用户名输入样式 */
.input-item {
  position: relative;
  margin-bottom: 60rpx;
}

.input {
  &[type="text"] {
    letter-spacing: 0.5rpx;
  }
}
</style>
