<script setup>
	import {
		onMounted
	} from 'vue';
	import {
		getScene,
		dogdogdollVersion,
		global,
		websiteUrl
	} from '../../common/config.js'

	// 生成独立访客ID
	const getUVId = () => {
		let uvid = uni.getStorageSync('ft_uvid');
		if (!uvid) {
			// 生成随机ID (1到2147483647之间)
			uvid = Math.floor(Math.random() * 2147483647) + 1;
			uni.setStorageSync('ft_uvid', uvid);
		}
		return uvid;
	};

	// 获取当前页面路径
	const getCurrentPagePath = () => {
		const pages = getCurrentPages();
		if (pages.length === 0) return '';
		return pages[pages.length - 1].route || '';
	};

	// 发送日志数据到后端
	const sendViewLog = async () => {
		let userInfo = uni.getStorageSync('userInfo')
		const logData = {
			scene: getScene(), // 访问场景
			path: getCurrentPagePath(), // 当前页面路径
			uid: userInfo ? userInfo.id : 0, // 用户ID（如果登录）
			uvid: getUVId(), // 独立访客ID
			version: dogdogdollVersion // 版本号
		};
		console.log("logData:", logData)

		// 确保所有必要数据都存在
		if (!logData.path) {
			console.warn('无法获取当前页面路径');
			return;
		}

		try {
			const res = await uni.request({
				url: `${websiteUrl.value}/log/view`,
				method: 'POST',
				data: logData,
				header: {
					'content-type': 'application/json'
				}
			});
		} catch (error) {
			console.error('日志发送错误:', error);
		}
	};

	onMounted(() => {
		// 在组件挂载时发送日志
		sendViewLog();
	});
</script>

<template>
	<!-- 这是一个无UI组件，不需要渲染任何内容 -->
</template>