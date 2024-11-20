import { reactive } from 'vue';

// 网站域名
export const websiteUrl = 'http://localhost:8080';

// 全局状态
export const global = reactive({
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
            const { code } = event;
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
                data: { js_token: code },
                success: (res) => {
                    const data = res.data.data;
					console.log(data.data.status)
					if (data.data.status != "success") {
						uni.showToast({ title: data.msg, icon: 'none' });
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
        header: { Authorization: token },
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
    uni.showToast({ title: message, icon: 'none' });
}
