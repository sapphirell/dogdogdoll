"use strict";
const common_vendor = require("./vendor.js");
const websiteUrl = "http://localhost:8080";
const global = common_vendor.reactive({
  isLogin: false,
  userInfo: {}
});
function wechatSignLogin() {
  common_vendor.index.login({
    provider: "weixin",
    onlyAuthorize: true,
    success: (event) => {
      const { code } = event;
      if (!code) {
        common_vendor.index.showToast({
          title: "微信登录失败，授权初始化失败",
          icon: "none"
        });
        return;
      }
      common_vendor.index.request({
        url: `${websiteUrl}/login-with-wechat`,
        method: "POST",
        data: { js_token: code },
        success: (res) => {
          const data = res.data.data;
          console.log(data.data.status);
          if (data.data.status != "success") {
            common_vendor.index.showToast({ title: data.msg, icon: "none" });
            return;
          }
          if (data.jwt_token) {
            common_vendor.index.setStorageSync("token", data.jwt_token);
            saveUserInfo(data);
            getUserInfo();
          }
        },
        fail: (err) => {
          handleRequestError(err, "微信登录失败");
        }
      });
    },
    fail: (err) => {
      handleRequestError(err, "微信授权失败");
    }
  });
}
function getUserInfo() {
  const token = common_vendor.index.getStorageSync("token");
  if (!token) {
    clearUserInfo();
    return;
  }
  common_vendor.index.request({
    url: `${websiteUrl}/with-state/mine`,
    method: "GET",
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
      handleRequestError(err, "获取用户信息失败");
    }
  });
}
function saveUserInfo(data) {
  common_vendor.index.setStorageSync("userInfo", data);
  global.userInfo = data;
  global.isLogin = true;
}
function clearUserInfo() {
  common_vendor.index.removeStorageSync("userInfo");
  global.userInfo = {};
  global.isLogin = false;
}
function handleRequestError(error, message = "请求失败") {
  console.error(error);
  common_vendor.index.showToast({ title: message, icon: "none" });
}
exports.getUserInfo = getUserInfo;
exports.global = global;
exports.websiteUrl = websiteUrl;
exports.wechatSignLogin = wechatSignLogin;
