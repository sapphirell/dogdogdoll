import {
	reactive,ref
} from 'vue';

// 网站域名
// export const websiteUrl = ref('https://api.fantuanpu.com');
export const websiteUrl = ref('http://localhost:8080');
// 测试环境
export const devUrl = 'http://localhost:8080';
// 中国服务器API
export const cnURL = 'https://api.fantuanpu.com';	
// US API
export const usURL = 'https://us-api.dogdogdoll.com'

// 图片域名
export const image1Url = 'https://images1.fantuanpu.com/';


// H5 访问域名
export const SHARE_H5_BASE = 'https://m.dogdogdoll.com'

// 大多数 uni-app H5 默认是 hash 路由（/#/pages/...）
export const USE_HASH_ROUTER = true


// 客户端版本号
export const dogdogdollVersion = "1.1.4"

// 全局状态
export let global = reactive({
	isLogin: false,
	userInfo: {},
});


export function getAppShellVersion() {
  const info = uni.getAppBaseInfo?.() || {}
  return info.appVersion || dogdogdollVersion // 外壳版本
}


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
				url: `${websiteUrl.value}/login-with-wechat`,
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
          url: `${websiteUrl.value}/with-state/bind-wechat`,
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
		url: `${websiteUrl.value}/with-state/mine`,
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
			url: `${websiteUrl.value}/with-state/mine`,
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
		url: websiteUrl.value + '/with-state/add-vote-score',
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
				url: websiteUrl.value + '/goods?id=' + id,
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
	
// config.js 中追加：
export async function initLoginState() {
  // 1. 尝试从本地读取 token 和 userInfo
  const token = uni.getStorageSync('token');
  const userInfo = uni.getStorageSync('userInfo');

  if (token && userInfo) {
    // 有 token 且有缓存的 userInfo，直接还原状态
    global.isLogin = true;
    global.userInfo = userInfo;
    return userInfo;
  }

  if (token && !userInfo) {
    // 有 token 但没有 userInfo，去后端拉一次
    const data = await asyncGetUserInfo(); // asyncGetUserInfo 已经会内部调用 saveUserInfo
    return data;
  }

  // 没有 token，清空状态
  clearUserInfo();
  return null;
}


// export const showModal = (options) => {
//     let params = {
//         title: "提示",
//         content: "自定义内容", 
//         align: "center", // 对齐方式 left/center/right
//         cancelText: "取消", // 取消按钮的文字
//         cancelColor: "#8F8F8F", // 取消按钮颜色
//         confirmText: "确定", // 确认按钮文字
//         confirmColor: "#FFAD15", // 确认按钮颜色 
//         showCancel: true, // 是否显示取消按钮，默认为 true
//     }

//     Object.assign(params, options)

//     let list = []
//     Object.keys(params).forEach(ele => {
//         list.push(ele + "=" + params[ele])
//     })
//     let paramsStr = list.join('&')

//     uni.navigateTo({
//         url: "/pages/modal/modal?" + paramsStr
//     })

//     return new Promise((resolve, reject) => {
//         uni.$once("AppModalCancel", () => {
//             reject()
//         })
//         uni.$once("AppModalConfirm", () => {
//             resolve()
//         })
//     });
// }

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

/** ================== 安全区 / 导航尺寸工具（追加） ================== */

function _isWxMP() {
  return process.env.UNI_PLATFORM === 'mp-weixin'
}

let _sysInfoCache = null
export function getSystemInfoCached() {
  if (!_sysInfoCache) {
    try { _sysInfoCache = uni.getSystemInfoSync() } catch (e) { _sysInfoCache = {} }
  }
  return _sysInfoCache
}

/** 状态栏高度（px，可能为 0） */
export function getStatusBarHeight() {
  const s = getSystemInfoCached()
  return Number(s?.statusBarHeight) || 0
}

/** 小程序胶囊信息（仅微信小程序可用） */
export function getMenuButtonRect() {
  if (!_isWxMP()) return null
  try { return uni.getMenuButtonBoundingClientRect() } catch (e) { return null }
}

/** 导航栏内容高度（不含状态栏），微信小程序通过胶囊估算，其它端取 44 */
export function getNavBarHeight() {
  if (!_isWxMP()) return 44
  const mb = getMenuButtonRect()
  const status = getStatusBarHeight() || 32
  if (mb && typeof mb.bottom === 'number' && typeof mb.top === 'number') {
    const h = mb.bottom + mb.top - 2 * status
    return h > 0 ? h : 44
  }
  return 44
}

/** window 顶部（状态栏 + 导航栏内容），微信小程序返回两者之和，其它端返回状态栏高度 */
export function getWindowTop() {
  return _isWxMP()
    ? (getStatusBarHeight() + getNavBarHeight())
    : getStatusBarHeight()
}

/** safeAreaInsets：若无则用 safeArea 估算 */
export function getSafeAreaInsets() {
  const s = getSystemInfoCached()
  if (s?.safeAreaInsets) return s.safeAreaInsets
  const sa = s?.safeArea
  const sh = s?.screenHeight
  const sw = s?.screenWidth
  let top = 0, bottom = 0, left = 0, right = 0
  if (sa && sh && sw) {
    top = sa.top || 0
    bottom = Math.max(0, sh - sa.bottom)
    left = sa.left || 0
    right = Math.max(0, sw - sa.right)
  }
  return { top, bottom, left, right }
}

/** 底部安全区高度（px） */
export function getSafeBottom() {
  const s = getSystemInfoCached()
  if (s?.safeAreaInsets && typeof s.safeAreaInsets.bottom === 'number') {
    return s.safeAreaInsets.bottom
  }
  const sa = s?.safeArea
  const sh = s?.screenHeight
  return (sa && sh) ? Math.max(0, sh - sa.bottom) : 0
}

/** 用于 v-bind() 的 px 字符串 */
export function toPx(n) {
  return `${Math.max(0, Math.round(Number(n) || 0))}px`
}

/** 顶部占位高度（按平台）：微信小程序用导航内容高，其它端用状态栏高 */
export function getHeaderPlaceholderHeight() {
  return _isWxMP() ? getNavBarHeight() : getStatusBarHeight()
}

/** 底部占位高度（安全区） */
export function getFooterPlaceholderHeight() {
  return getSafeBottom()
}

