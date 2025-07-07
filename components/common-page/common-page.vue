<template>
	<!-- 页面容器 -->
	<view class="page-container">
		<!-- 顶部安全区域占位 -->
		<view class="header-placeholder"></view>
		

		<!-- 页面内容区域 -->
		<view class="content-container">
			<!-- 这里放页面主要内容 -->
			<view class="main-content" scroll-y @scroll="handleScroll">
				<slot></slot>
			</view>
		</view>

		<!-- 底部安全区域占位 -->
		<view class="footer-placeholder"></view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed
	} from 'vue'


	const emit = defineEmits(['scroll'])

	const handleScroll = (e) => {
		emit('scroll', e.detail) // 传递滚动事件
	}
	// 获取系统信息
	const systemInfo = uni.getSystemInfoSync()

	// 计算导航栏高度（小程序专用）
	const navBarHeight = computed(() => {
		// #ifdef MP-WEIXIN
		const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
		// 确保状态栏高度存在（iOS可能为0）
		const statusBarHeight = systemInfo.statusBarHeight || 32
		return menuButtonInfo.bottom + menuButtonInfo.top - 2 * statusBarHeight
		// #endif
		return 0
	})
	// 参数
	const props = defineProps({
		head_color: {
			type: String,
			default: '#ffffff',
		}
	})

	// 计算顶部占位高度
	const headerHeight = computed(() => {
		// 小程序需要包含状态栏和导航栏高度
		// #ifdef MP-WEIXIN
		return navBarHeight.value + 'px'
		// #endif

		// // H5/App使用安全区域计算
		// return `calc(constant(safe-area-inset-top) + 20px)` // 默认值20px作为fallback
		// #ifdef H5 || APP
		// 直接获取状态栏高度（iOS 安卓通用）
		const statusBarHeight = systemInfo.statusBarHeight || 0
		return `${statusBarHeight}px` // 44px 为 iOS 导航栏标准高度
		// #endif
	})

	// 底部安全区域高度
	const footerHeight = computed(() => {
		// 通过系统信息获取安全区域值
		const safeBottom = systemInfo.safeAreaInsets?.bottom || 0
		return `${safeBottom + 20}px` // 直接返回计算后的像素值
	})
</script>

<style lang="less">
	.page-container {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		// background-color: #f5f5f5;
		// background: linear-gradient(180deg, rgb(218 238 255) 0%, rgb(255 255 255) 100%);
		// 适配异形屏的安全区域
		padding-left: constant(safe-area-inset-left);
		padding-left: env(safe-area-inset-left);
		padding-right: constant(safe-area-inset-right);
		padding-right: env(safe-area-inset-right);
	}

	.header-placeholder {
		height: v-bind(headerHeight);
		background: v-bind('head_color');
		background-size: cover;
		background-position: 0px 50rpx;
	}

	.content-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.main-content {
		flex: 1;
		// padding: 20rpx;
		// background-color: #ffffff;
		overflow-y: auto;
	}

	.footer-placeholder {
		height: v-bind(footerHeight);
		background-color: #ffffff;
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);
	}

	// 适配iOS安全区域
	@supports (bottom: constant(safe-area-inset-bottom)) {
		.page-container {
			padding-bottom: constant(safe-area-inset-bottom);
			padding-bottom: env(safe-area-inset-bottom);
		}
	}
</style>