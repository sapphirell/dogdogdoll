"use strict";
const common_vendor = require("./vendor.js");
const websiteUrl = "http://localhost:8080";
const image1Url = "https://images1.fantuanpu.com/";
const dogdogdollVersion = "1.0.41";
let global = common_vendor.reactive({
  isLogin: false,
  userInfo: {}
});
function wechatSignLogin() {
  common_vendor.index.login({
    provider: "weixin",
    onlyAuthorize: true,
    success: (event) => {
      const {
        code
      } = event;
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
        data: {
          js_token: code
        },
        success: (res) => {
          const data = res.data.data;
          common_vendor.index.__f__("log", "at common/config.js:52", data);
          if (res.data.status != "success") {
            common_vendor.index.showToast({
              title: data.msg,
              icon: "none"
            });
            return;
          }
          if (data.jwt_token) {
            common_vendor.index.__f__("log", "at common/config.js:62", "data.token:", data.jwt_token);
            common_vendor.index.setStorageSync("token", data.jwt_token);
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
function bindWechat() {
  return new Promise((resolve, reject) => {
    common_vendor.index.login({
      provider: "weixin",
      onlyAuthorize: true,
      success: (loginRes) => {
        const { code } = loginRes;
        if (!code) {
          common_vendor.index.showToast({
            title: "微信授权失败，请重试",
            icon: "none"
          });
          reject("微信授权失败");
          return;
        }
        const token = common_vendor.index.getStorageSync("token");
        if (!token) {
          common_vendor.index.showToast({
            title: "请先登录",
            icon: "none"
          });
          reject("用户未登录");
          return;
        }
        common_vendor.index.request({
          url: `${websiteUrl}/with-state/bind-wechat`,
          method: "POST",
          header: {
            Authorization: token
          },
          data: {
            js_token: code
          },
          success: (res) => {
            if (res.data.status === "success") {
              getUserInfo();
              common_vendor.index.showToast({
                title: "微信绑定成功",
                icon: "success"
              });
              resolve(true);
            } else {
              const errorMsg = res.data.msg || "微信绑定失败";
              common_vendor.index.showToast({
                title: errorMsg,
                icon: "none"
              });
              reject(errorMsg);
            }
          },
          fail: (err) => {
            handleRequestError(err, "绑定微信失败");
            reject(err);
          }
        });
      },
      fail: (err) => {
        handleRequestError(err, "微信授权失败");
        reject(err);
      }
    });
  });
}
function getUserInfo() {
  const token = common_vendor.index.getStorageSync("token");
  common_vendor.index.__f__("log", "at common/config.js:167", "token:", token);
  if (!token) {
    common_vendor.index.__f__("log", "at common/config.js:169", "没有token，无法获取用户信息");
    clearUserInfo();
    return;
  }
  common_vendor.index.__f__("log", "at common/config.js:173", "请求接口");
  common_vendor.index.request({
    url: `${websiteUrl}/with-state/mine`,
    method: "GET",
    header: {
      Authorization: token
    },
    success: (res) => {
      const data = res.data.data;
      if (data) {
        common_vendor.index.__f__("log", "at common/config.js:183", "获取用户信息成功,进行存储", data);
        saveUserInfo(data);
      } else {
        common_vendor.index.__f__("log", "at common/config.js:186", "无法获取，清理用户状态");
        clearUserInfo();
      }
    },
    fail: (err) => {
      handleRequestError(err, "获取用户信息失败");
    }
  });
}
function asyncGetUserInfo() {
  return new Promise((resolve, reject) => {
    const token = common_vendor.index.getStorageSync("token");
    if (!token) {
      clearUserInfo();
      resolve(null);
      return;
    }
    common_vendor.index.request({
      url: `${websiteUrl}/with-state/mine`,
      method: "GET",
      header: {
        Authorization: token
      },
      success: (res) => {
        const data = res.data.data;
        if (data) {
          common_vendor.index.__f__("log", "at common/config.js:217", "返回：", data);
          saveUserInfo(data);
          resolve(data);
        } else {
          clearUserInfo();
          resolve(null);
        }
        return data;
      },
      fail: (err) => {
        handleRequestError(err, "获取用户信息失败");
        resolve(null);
      }
    });
  });
}
function getScene() {
  const platform = "mp-weixin";
  common_vendor.index.__f__("log", "at common/config.js:289", "platform:", platform);
  {
    return 4;
  }
}
function saveUserInfo(data) {
  common_vendor.index.setStorageSync("userInfo", data);
  common_vendor.index.setStorageSync("token", data.last_token);
  global.userInfo = data;
  global.isLogin = true;
}
function clearUserInfo() {
  common_vendor.index.removeStorageSync("userInfo");
  global.userInfo = {};
  global.isLogin = false;
}
function handleRequestError(error, message = "请求失败") {
  common_vendor.index.__f__("error", "at common/config.js:352", error);
  common_vendor.index.showToast({
    title: message,
    icon: "none"
  });
}
exports.asyncGetUserInfo = asyncGetUserInfo;
exports.bindWechat = bindWechat;
exports.dogdogdollVersion = dogdogdollVersion;
exports.getScene = getScene;
exports.getUserInfo = getUserInfo;
exports.global = global;
exports.image1Url = image1Url;
exports.websiteUrl = websiteUrl;
exports.wechatSignLogin = wechatSignLogin;
//# sourceMappingURL=../../.sourcemap/mp-weixin/common/config.js.map
