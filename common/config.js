import {
	reactive,ref
} from 'vue';

const DEFAULT_DOMAIN_CONFIG = {
  api: {
    cn: 'https://api.dogdogdoll.com',
    us: 'https://us-api.dogdogdoll.com',
    dev: 'http://localhost:8080',
    // 预留其他区域
    eu: '',
    jp: '',
    sg: ''
  },
  web: {
    www: 'https://www.dogdogdoll.com',
    h5: 'https://m.dogdogdoll.com'
  },
  image: {
    image1: 'https://images1.fantuanpu.com/'
  }
}

function trimSlash(url) {
  const str = String(url || '').trim()
  return str ? str.replace(/\/+$/, '') : ''
}

function withTailSlash(url) {
  const s = trimSlash(url)
  return s ? `${s}/` : ''
}

function pickFirstString(...values) {
  for (const v of values) {
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  return ''
}

function getRuntimeEnvValue(...keys) {
  const importMetaEnv = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {}
  const processEnv = (typeof process !== 'undefined' && process.env) ? process.env : {}
  for (const key of keys) {
    const importMetaValue = importMetaEnv[key]
    if (typeof importMetaValue === 'string' && importMetaValue.trim()) return importMetaValue.trim()
    const processValue = processEnv[key]
    if (typeof processValue === 'string' && processValue.trim()) return processValue.trim()
  }
  return ''
}

function isUnsafeLocalApi(url) {
  const s = String(url || '').trim().toLowerCase()
  if (!s) return false
  return (
    s.includes('://localhost') ||
    s.includes('://127.0.0.1') ||
    s.includes('://0.0.0.0')
  )
}

function getStorageConfig() {
  if (typeof uni === 'undefined' || typeof uni.getStorageSync !== 'function') return {}
  const raw = uni.getStorageSync('domainConfig') || uni.getStorageSync('runtimeDomainConfig')
  if (!raw) return {}
  if (typeof raw === 'object') return raw
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch (e) { return {} }
  }
  return {}
}

function getGlobalConfig() {
  if (typeof globalThis === 'undefined') return {}
  return globalThis.__DOGDOGDOLL_DOMAIN_CONFIG__ || {}
}

function getEnvConfig() {
  return {
    api: {
      cn: getRuntimeEnvValue('VITE_APP_API_CN', 'VUE_APP_API_CN', 'VUE_APP_CN_API'),
      us: getRuntimeEnvValue('VITE_APP_API_US', 'VUE_APP_API_US', 'VUE_APP_US_API'),
      dev: getRuntimeEnvValue('VITE_APP_API_DEV', 'VUE_APP_API_DEV'),
      eu: getRuntimeEnvValue('VITE_APP_API_EU', 'VUE_APP_API_EU'),
      jp: getRuntimeEnvValue('VITE_APP_API_JP', 'VUE_APP_API_JP'),
      sg: getRuntimeEnvValue('VITE_APP_API_SG', 'VUE_APP_API_SG')
    },
    web: {
      www: getRuntimeEnvValue('VITE_APP_WEB_WWW', 'VUE_APP_WEB_WWW'),
      h5: getRuntimeEnvValue('VITE_APP_WEB_H5', 'VUE_APP_WEB_H5', 'VITE_APP_SHARE_H5_BASE', 'VUE_APP_SHARE_H5_BASE')
    },
    image: {
      image1: getRuntimeEnvValue('VITE_APP_IMAGE1_URL', 'VUE_APP_IMAGE1_URL')
    }
  }
}

function buildDomainConfig() {
  // 配置优先级（高 -> 低）：
  // 1) globalThis.__DOGDOGDOLL_DOMAIN_CONFIG__
  //    适合在运行时由宿主/注入脚本动态下发。
  // 2) 本地存储 domainConfig / runtimeDomainConfig
  //    适合远程拉取配置后本地缓存。
  // 3) process.env (VUE_APP_*)
  //    来自 .env.development / .env.production（由运行/发行模式决定）。
  // 4) DEFAULT_DOMAIN_CONFIG
  //    最终兜底，避免未配置时崩溃。
  const g = getGlobalConfig()
  const s = getStorageConfig()
  const e = getEnvConfig()
  const api = DEFAULT_DOMAIN_CONFIG.api
  const web = DEFAULT_DOMAIN_CONFIG.web
  const image = DEFAULT_DOMAIN_CONFIG.image
  return {
    api: {
      cn: trimSlash(pickFirstString(g?.api?.cn, s?.api?.cn, e?.api?.cn, api.cn)),
      us: trimSlash(pickFirstString(g?.api?.us, s?.api?.us, e?.api?.us, api.us)),
      dev: trimSlash(pickFirstString(g?.api?.dev, s?.api?.dev, e?.api?.dev, api.dev)),
      eu: trimSlash(pickFirstString(g?.api?.eu, s?.api?.eu, e?.api?.eu, api.eu)),
      jp: trimSlash(pickFirstString(g?.api?.jp, s?.api?.jp, e?.api?.jp, api.jp)),
      sg: trimSlash(pickFirstString(g?.api?.sg, s?.api?.sg, e?.api?.sg, api.sg))
    },
    web: {
      www: trimSlash(pickFirstString(g?.web?.www, s?.web?.www, e?.web?.www, web.www)),
      h5: trimSlash(pickFirstString(g?.web?.h5, s?.web?.h5, e?.web?.h5, web.h5))
    },
    image: {
      image1: trimSlash(pickFirstString(g?.image?.image1, s?.image?.image1, e?.image?.image1, image.image1))
    }
  }
}

export const DOMAIN_CONFIG = buildDomainConfig()
export const ENV_NAME = pickFirstString(
  getRuntimeEnvValue('VITE_APP_ENV_NAME', 'VUE_APP_ENV_NAME'),
  'unknown'
)

// 测试环境
export const devUrl = DOMAIN_CONFIG.api.dev;
// 中国服务器API
export const cnURL = DOMAIN_CONFIG.api.cn;
// US API
export const usURL = DOMAIN_CONFIG.api.us;
// 其他区域 API 预留
export const euURL = DOMAIN_CONFIG.api.eu;
export const jpURL = DOMAIN_CONFIG.api.jp;
export const sgURL = DOMAIN_CONFIG.api.sg;
export const apiRegionURLs = Object.freeze({
  cn: cnURL,
  us: usURL,
  dev: devUrl,
  eu: euURL,
  jp: jpURL,
  sg: sgURL
});

const savedServer = (typeof uni !== 'undefined' && typeof uni.getStorageSync === 'function')
  ? uni.getStorageSync('selectedServer')
  : '';
const safeSelectedServer = isUnsafeLocalApi(savedServer) ? '' : savedServer
// 默认 API 选择规则：
// 1) 若存在 selectedServer（用户通过服务器切换组件选过），优先使用它；
// 2) 否则按 cnURL -> usURL -> devUrl 回退。
//
// 所以你即便改了 .env 的 VUE_APP_API_CN，只要本机仍保存 selectedServer，
// 实际请求地址仍可能不是新配置值。排查时请看控制台 [Config] 日志。
const defaultApiUrl = trimSlash(pickFirstString(safeSelectedServer, cnURL, usURL, devUrl));
// 网站域名（动态取配置 + 本地已选服务器）
export const websiteUrl = ref(defaultApiUrl);

if (typeof console !== 'undefined' && typeof console.info === 'function') {
  console.info(
    '[Config] env=%s api=%s h5=%s selectedServer=%s selectedServerIgnored=%s',
    ENV_NAME,
    websiteUrl.value,
    DOMAIN_CONFIG.web.h5,
    savedServer || '(none)',
    isUnsafeLocalApi(savedServer) ? 'yes(local)' : 'no'
  )
}

// 图片域名
export const image1Url = withTailSlash(DOMAIN_CONFIG.image.image1);


// H5 访问域名
export const SHARE_H5_BASE = DOMAIN_CONFIG.web.h5

// 大多数 uni-app H5 默认是 hash 路由（/#/pages/...）
export const USE_HASH_ROUTER = true


// 客户端版本号
export const dogdogdollVersion = "1.2.2"

// 全局状态
export let global = reactive({
	isLogin: false,
	userInfo: {},
	
	// --- 新增：记录最后一次自动刷新的请求信息 ---
	lastRefresh: {
	    url: '',  // 记录请求的唯一标识（如 URL + 参数）
	    time: 0   // 记录时间戳
	}
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
  console.log('[AUTH] getUserInfo() start, current token =', token)

  if (!token) {
    console.log('[AUTH] getUserInfo() no token, clearUserInfo()')
    clearUserInfo();
    return;
  }

  console.log('[AUTH] getUserInfo() request /with-state/mine')
  uni.request({
    url: `${websiteUrl.value}/with-state/mine`,
    method: 'GET',
    header: {
      Authorization: token
    },
    success: (res) => {
      console.log('[AUTH] getUserInfo() response raw =', res.data)
      const data = res.data.data;
      if (data) {
        console.log('[AUTH] getUserInfo() success, call saveUserInfo, uid =', data.id)
        saveUserInfo(data);
      } else {
        console.log('[AUTH] getUserInfo() no data, clearUserInfo()')
        clearUserInfo();
      }
    },
    fail: (err) => {
      console.log('[AUTH] getUserInfo() fail', err)
      handleRequestError(err, '获取用户信息失败');
    },
  });
}



// 获取用户信息，返回 Promise
export function asyncGetUserInfo() {
  return new Promise((resolve) => {
    const token = uni.getStorageSync('token');
    console.log('[AUTH] asyncGetUserInfo() start, current token =', token)

    if (!token) {
      console.log('[AUTH] asyncGetUserInfo() no token, clearUserInfo()')
      clearUserInfo();
      resolve(null);
      return;
    }

    uni.request({
      url: `${websiteUrl.value}/with-state/mine`,
      method: 'GET',
      header: {
        Authorization: token
      },
      success: (res) => {
        console.log('[AUTH] asyncGetUserInfo() response raw =', res.data)
        const data = res.data.data;
        if (data) {
          console.log('[AUTH] asyncGetUserInfo() success, call saveUserInfo, uid =', data.id)
          saveUserInfo(data);
          resolve(data);
        } else {
          console.log('[AUTH] asyncGetUserInfo() empty data, clearUserInfo()')
          clearUserInfo();
          resolve(null);
        }
      },
      fail: (err) => {
        console.log('[AUTH] asyncGetUserInfo() fail', err)
        handleRequestError(err, '获取用户信息失败');
        resolve(null);
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
  const beforeToken = uni.getStorageSync('token')
  console.log('[AUTH] saveUserInfo() in, beforeToken =', beforeToken, ' payload.last_token =', data?.last_token)

  // 写 userInfo
  uni.setStorageSync('userInfo', data);

  // ✅ 只在 last_token 存在时覆盖
  if (data && data.last_token) {
    uni.setStorageSync('token', data.last_token)
    console.log('[AUTH] saveUserInfo() use data.last_token, new token =', data.last_token)
  } else {
    console.log('[AUTH] saveUserInfo() no last_token, keep old token =', beforeToken)
  }

  global.userInfo = data;
  global.isLogin = true;
  console.log('[AUTH] saveUserInfo() done, global.isLogin =', global.isLogin, ' uid =', data?.id)

  // 广播“登录成功 / 登录恢复成功”事件
  if (typeof uni !== 'undefined' && typeof uni.$emit === 'function') {
    console.log('[AUTH] saveUserInfo() emit login-success')
    uni.$emit('login-success', data)
  }
}

function clearUserInfo() {
	const hadToken = !!uni.getStorageSync('token')
	uni.removeStorageSync('token');
	uni.removeStorageSync('userInfo');
	global.userInfo = {};
	global.isLogin = false;
	if (hadToken && typeof uni !== 'undefined' && typeof uni.$emit === 'function') {
		uni.$emit('logout-success');
	}
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
