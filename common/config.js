import {
	reactive
} from 'vue';

// 网站域名
export const websiteUrl = 'http://localhost:8080';
// export const websiteUrl = 'https://api.fantuanpu.com';	
// 图片域名
export const image1Url = 'https://images1.fantuanpu.com/';
// 客户端版本号
export const dogdogdollVersion = "1.0.41"

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
						// 微信登录成功
						console.log("data.token:", data.jwt_token);
						uni.setStorageSync('token', data.jwt_token);
						
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


// 绑定微信
export function bindWechat() {
  // 检查是否在微信小程序环境中
  if (process.env.VUE_APP_PLATFORM !== 'mp-weixin') {
    uni.showToast({
      title: '请在微信小程序中绑定',
      icon: 'none',
    });
    return Promise.reject('请在微信小程序中绑定');
  }

  // 1. 获取微信登录凭证
  return new Promise((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      onlyAuthorize: true,
      success: (loginRes) => {
        const { code } = loginRes;
        if (!code) {
          uni.showToast({
            title: '微信授权失败，请重试',
            icon: 'none',
          });
          reject('微信授权失败');
          return;
        }

        // 2. 获取当前用户的token
        const token = uni.getStorageSync('token');
        if (!token) {
          uni.showToast({
            title: '请先登录',
            icon: 'none',
          });
          reject('用户未登录');
          return;
        }

        // 3. 调用后端绑定接口
        uni.request({
          url: `${websiteUrl}/with-state/bind-wechat`,
          method: 'POST',
          header: {
            Authorization: token,
          },
          data: {
            js_token: code,
          },
          success: (res) => {
            if (res.data.status === 'success') {
              // 4. 绑定成功，更新用户信息
              getUserInfo();
              uni.showToast({
                title: '微信绑定成功',
                icon: 'success',
              });
              resolve(true);
            } else {
              // 处理错误信息
              const errorMsg = res.data.msg || '微信绑定失败';
              uni.showToast({
                title: errorMsg,
                icon: 'none',
              });
              reject(errorMsg);
            }
          },
          fail: (err) => {
            handleRequestError(err, '绑定微信失败');
            reject(err);
          },
        });
      },
      fail: (err) => {
        handleRequestError(err, '微信授权失败');
        reject(err);
      },
    });
  });
}



// 获取用户信息
export function getUserInfo() {
	const token = uni.getStorageSync('token');
	console.log("token:", token)
	if (!token) {
		console.log("没有token，无法获取用户信息");
		clearUserInfo();
		return;
	}
	console.log("请求接口")
	uni.request({
		url: `${websiteUrl}/with-state/mine`,
		method: 'GET',
		header: {
			Authorization: token
		},
		success: (res) => {
			const data = res.data.data;
			if (data) {
				console.log("获取用户信息成功,进行存储", data);
				saveUserInfo(data);
			} else {
				console.log("无法获取，清理用户状态")
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
				return data;
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
// 获取当前场景  评论来源 1=网页 2=ios 3=安卓 4=微信小程序
export function getScene() {
	// 获取运行平台信息
	const platform = process.env.UNI_PLATFORM
	console.log("platform:", platform)

	// 微信小程序
	if (platform === 'mp-weixin') {
		return 4
	}

	// H5网页
	if (platform === 'h5') {
		return 1
	}

	// App 环境
	if (platform === 'app-plus' || platform === 'app') {
		const systemInfo = uni.getSystemInfoSync()
		// iOS 设备
		if (systemInfo.osName === 'ios') {
			return 2
		}
		// Android 设备
		if (systemInfo.osName === 'android') {
			return 3
		}
	}

	// 默认返回网页（可根据需要修改）
	return 1
}


export function getGoodsInfo (id) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: websiteUrl + '/goods?id=' + id,
				method: 'GET',
				timeout: 5000,
				success: (res) => {
					resolve(res.data.data)
				},
				fail: (err) => {
					console.error('商品详情获取失败', err)
					reject(err)
				}
			})
		})
	}


// 工具函数
function saveUserInfo(data) {
	uni.setStorageSync('userInfo', data);
	uni.setStorageSync('token', data.last_token)
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