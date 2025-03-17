import {
	reactive
} from 'vue';

// 网站域名
// export const websiteUrl = 'http://localhost:8080';
export const websiteUrl = 'https://api.fantuanpu.com';
// 图片域名
export const image1Url = 'https://images1.fantuanpu.com/';

// 全局状态
export let global = reactive({
	isLogin: false,
	userInfo: {},
});

// 微信登录
export function wechatSignLogin() {
	if (process.env.VUE_APP_PLATFORM !== 'mp-weixin') {
		uni.showToast({
			title: '请在微信小程序中登录',
			icon: 'none',
		});
		return;
	}

	uni.login({
		provider: 'weixin',
		onlyAuthorize: true,
		success: (event) => {
			const {
				code
			} = event;
			if (!code) {
				uni.showToast({
					title: '微信登录失败，授权初始化失败',
					icon: 'none',
				});
				return;
			}

			uni.request({
				url: `${websiteUrl}/login-with-wechat`,
				method: 'POST',
				data: {
					js_token: code
				},
				success: (res) => {
					const data = res.data.data;
					console.log(data)
					if (res.data.status != "success") {
						uni.showToast({
							title: data.msg,
							icon: 'none'
						});
						return
					}
					if (data.jwt_token) {
						uni.setStorageSync('token', data.jwt_token);
						saveUserInfo(data);
						//刷新当前页面数据
						getUserInfo();
					}
				},
				fail: (err) => {
					handleRequestError(err, '微信登录失败');
				},
			});
		},
		fail: (err) => {
			handleRequestError(err, '微信授权失败');
		},
	});
}

// 获取用户信息
export function getUserInfo() {
	const token = uni.getStorageSync('token');
	if (!token) {
		clearUserInfo();
		return;
	}

	uni.request({
		url: `${websiteUrl}/with-state/mine`,
		method: 'GET',
		header: {
			Authorization: token
		},
		success: (res) => {
			const data = res.data.data;
			if (data) {
				saveUserInfo(data);
			} else {
				clearUserInfo();
			}
		},
		fail: (err) => {
			handleRequestError(err, '获取用户信息失败');
		},
	});
}



// 获取用户信息，返回 Promise
export function asyncGetUserInfo() {
	return new Promise((resolve, reject) => {
		const token = uni.getStorageSync('token');
		if (!token) {
			clearUserInfo();
			resolve(null); // 返回 null 表示没有 token，无法获取用户信息
			return;
		}

		uni.request({
			url: `${websiteUrl}/with-state/mine`,
			method: 'GET',
			header: {
				Authorization: token
			},
			success: (res) => {
				const data = res.data.data;
				if (data) {
					console.log("返回：", data);
					saveUserInfo(data);
					resolve(data); // 返回用户信息
				} else {
					clearUserInfo();
					resolve(null); // 如果没有数据，清空用户信息并返回 null
				}
			},
			fail: (err) => {
				handleRequestError(err, '获取用户信息失败');
				resolve(null); // 请求失败，返回 null
			}
		});
	});
}


//提交评分
export async function voteScore(type, score, targetId) {
	let token = uni.getStorageSync('token')
	if (!token) {
		uni.showToast({
			title: '请先登录',
			icon: 'none'
		})
		return 0;
	}
	uni.request({
		url: websiteUrl + '/with-state/add-vote-score',
		method: 'POST',
		header: {
			'Authorization': token,
		},
		data: {
			target_id: parseInt(targetId),
			score: parseInt(score),
			type: type
		},
		success: (res) => {
			console.log(res.data);
			if (res.data.status == "success") {
				uni.showToast({
					title: '评分成功',
					icon: 'success'
				})
				//关闭弹窗
				activeModal.value = false
				return 0;
			} else {
				uni.showToast({
					title: res.data.msg,
					icon: 'none'
				})
				return 0;
			}
		},
		fail: (err) => {
			console.log(err);
			uni.showToast({
				title: '网络请求失败',
				icon: 'none'
			})
		},
	});

	return 0;
}

// 工具函数
function saveUserInfo(data) {
	uni.setStorageSync('userInfo', data);
	global.userInfo = data;
	global.isLogin = true;
}

function clearUserInfo() {
	uni.removeStorageSync('userInfo');
	global.userInfo = {};
	global.isLogin = false;
}

function handleRequestError(error, message = '请求失败') {
	console.error(error);
	uni.showToast({
		title: message,
		icon: 'none'
	});
}