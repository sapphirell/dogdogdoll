<template>
	<view class="settings-container">
		<!-- 统一item结构 -->
		<view 
			v-for="(item, index) in menuItems" 
			:key="index"
			class="menu-item"
			@click="item.action(item)"
		>
			<text class="menu-label">{{ item.label }}</text>
			<view class="menu-value">
				<text :class="item.status ? 'active' : 'inactive'">{{ item.displayValue }}</text>
				<image class="arrow-icon" src="../../static/right.png" />
			</view>
		</view>
	</view>
</template>

<script setup>
	import { ref, computed } from 'vue'
	import {
		websiteUrl,
		wechatSignLogin,
		getUserInfo,
		global,
	} from "../../common/config.js";
	uni.setNavigationBarTitle({
		title: '设置'
	});
	
	const menuItems = computed(() => [
	  {
	    label: '更改用户名',
	    action: jump2username,
	    status: !!global.userInfo.password,
	    displayValue: global.userInfo.password ? '去修改' : '未设置'
	  },
	  {
	    label: '更改密码',
	    action: jump2password,
	    status: !!global.userInfo.password,
	    displayValue: global.userInfo.password ? '去修改' : '未设置'
	  },
	  {
	  	label: '绑定手机号',
	  	action: jump2telphone,
	  	status: !!global.userInfo.tel_phone,  // 修正字段名
	  	displayValue: global.userInfo.tel_phone ? 
	  		global.userInfo.tel_phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : 
	  		'去绑定'
	  },
	  {
	    label: '绑定微信',
	    action: jump2wechat,
	    status: !!global.userInfo.wechat_open_id,
	    displayValue: global.userInfo.wechat_open_id ? '已绑定' : '去绑定'
	  },
	  {
	    label: '检查更新',
	    action: checkUpdate,
	    status: false,
	    displayValue: '无需更新'
	  }
	])

	// 用户信息
	let userInfo = ref({})

	// 是否需要更新
	let needUpdate = ref(false)


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
	//跳转到修改用户名
	function jump2username() {
		uni.navigateTo({
			url: '/pages/setting/username/username'
		})
	}
	//绑定微信
	function jump2wechat() {
		if (global.userInfo.wechat_open_id) {
			uni.showToast({ title: '已绑定微信', icon: 'none' })
		} else {
			// 添加实际绑定逻辑
			wechatSignLogin().then(res => {
				uni.showToast({ title: '绑定成功' })
				getUserInfo()
			})
		}
	}
	//检查更新
	function checkUpdate() {
		// 获取manifest.json文件的内容
		if (uni.getSystemInfoSync().platform === 'app') {
		  const version = plus.runtime.version;
		  console.log('App version from manifest:', version);
		} else {
			uni.showToast({
				title: '您所使用的平台无需更新',
				icon: 'none'
			})
		}
	} 

	getUserInfo();
</script>

<style lang="less" scoped>
	@primary-color: #4cbbd0;
	@text-color: #333;
	@secondary-text: #666;
	@border-color: #eee;
	
	.settings-container {
		padding: 24rpx;
		background: #f8f8f8;
		min-height: 100vh;
	}
	
	.menu-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 32rpx;
		margin-bottom: 24rpx;
		background: #fff;
		border-radius: 16rpx;
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.04);
		transition: all 0.2s ease;
		
		&:active {
			background: #fafafa;
			transform: scale(0.98);
		}
	}
	
	.menu-label {
		font-size: 30rpx;
		color: @text-color;
		font-weight: 500;
	}
	
	.menu-value {
		display: flex;
		align-items: center;
		gap: 16rpx;
		
		text {
			font-size: 28rpx;
			&.active {
				color: @primary-color;
			}
			&.inactive {
				color: @secondary-text;
			}
		}
	}
	
	.arrow-icon {
		width: 36rpx;
		height: 36rpx;
		opacity: 0.6;
	}
	
	// 统一按钮样式重置
	button {
		background: transparent;
		padding: 0;
		margin: 0;
		line-height: 1;
		border-radius: 0;
		
		&::after {
			border: none;
		}
	}
</style>