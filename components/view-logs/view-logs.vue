<script setup>
	import { onMounted } from 'vue';
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

	// 获取 / 缓存 UniPush2 的设备ID（cid）
	// 返回 Promise<string>，获取失败则返回空字符串
	const getPushClientId = () => {
		return new Promise((resolve) => {
			// 先看本地缓存，避免每次都调接口
			const cached = uni.getStorageSync('unipush_cid');
			if (cached) {
				resolve(cached);
				return;
			}

			// #ifdef APP-PLUS
			// APP 端：优先走官方 uni.getPushClientId
			if (uni.getPushClientId) {
				uni.getPushClientId({
					success: (res) => {
						const cid = (res && res.cid) ? res.cid : '';
						if (cid) {
							uni.setStorageSync('unipush_cid', cid);
						}
						resolve(cid);
					},
					fail: (err) => {
						console.warn('getPushClientId fail:', err);
						// 兜底：尝试旧版 plus.push.getClientInfo
						try {
							const info = plus.push.getClientInfo && plus.push.getClientInfo();
							const cid = info && info.clientid ? info.clientid : '';
							if (cid) {
								uni.setStorageSync('unipush_cid', cid);
							}
							resolve(cid);
						} catch (e) {
							console.warn('plus.push.getClientInfo fail:', e);
							resolve('');
						}
					}
				});
			} else {
				// 再次兜底：直接 plus.push.getClientInfo（某些老环境）
				try {
					const info = plus.push.getClientInfo && plus.push.getClientInfo();
					const cid = info && info.clientid ? info.clientid : '';
					if (cid) {
						uni.setStorageSync('unipush_cid', cid);
					}
					resolve(cid);
				} catch (e) {
					console.warn('getPushClientId not available:', e);
					resolve('');
				}
			}
			// #endif

			// #ifndef APP-PLUS
			// H5 / 小程序 等：默认没有 cid，直接返回空字符串
			resolve('');
			// #endif
		});
	};

	// 发送日志数据到后端（可选带上 pushClientId）
	const sendViewLog = async (pushClientId = '') => {
		let userInfo = uni.getStorageSync('userInfo')
		const logData = {
			scene: getScene(),               // 访问场景
			path: getCurrentPagePath(),      // 当前页面路径
			uid: userInfo ? userInfo.id : 0, // 用户ID（如果登录）
			uvid: getUVId(),                 // 独立访客ID
			version: dogdogdollVersion,      // 版本号

			// 新增：推送相关字段，和后端 ViewLogRequest 对应
			push_client_id: pushClientId || '',
			push_channel: pushClientId ? 'unipush' : '' // 有 cid 默认标记为 unipush，没有就留空
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

	// 先获取 cid，再带着 cid 发送日志（获取失败也会照常发日志）
	const sendViewLogWithPushInfo = async () => {
		const cid = await getPushClientId();
		await sendViewLog(cid);
	};

	onMounted(() => {
		// 在组件挂载时发送日志
		sendViewLogWithPushInfo();
	});
</script>

<template>
	<!-- 这是一个无UI组件，不需要渲染任何内容 -->
</template>
