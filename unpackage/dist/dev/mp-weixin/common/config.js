"use strict";
const common_vendor = require("./vendor.js");
const websiteUrl = "https://api.fantuanpu.com";
const image1Url = "https://images1.fantuanpu.com/";
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
          common_vendor.index.__f__("log", "at common/config.js:50", data);
          if (res.data.status != "success") {
            common_vendor.index.showToast({
              title: data.msg,
              icon: "none"
            });
            return;
          }
          if (data.jwt_token) {
            common_vendor.index.__f__("log", "at common/config.js:60", "data.token:", data.jwt_token);
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
function getUserInfo() {
  const token = common_vendor.index.getStorageSync("token");
  common_vendor.index.__f__("log", "at common/config.js:81", "token:", token);
  if (!token) {
    common_vendor.index.__f__("log", "at common/config.js:83", "没有token，无法获取用户信息");
    clearUserInfo();
    return;
  }
  common_vendor.index.__f__("log", "at common/config.js:87", "请求接口");
  common_vendor.index.request({
    url: `${websiteUrl}/with-state/mine`,
    method: "GET",
    header: {
      Authorization: token
    },
    success: (res) => {
      const data = res.data.data;
      if (data) {
        common_vendor.index.__f__("log", "at common/config.js:97", "获取用户信息成功,进行存储", data);
        saveUserInfo(data);
      } else {
        common_vendor.index.__f__("log", "at common/config.js:100", "无法获取，清理用户状态");
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
          common_vendor.index.__f__("log", "at common/config.js:131", "返回：", data);
          saveUserInfo(data);
          resolve(data);
        } else {
          clearUserInfo();
          resolve(null);
        }
      },
      fail: (err) => {
        handleRequestError(err, "获取用户信息失败");
        resolve(null);
      }
    });
  });
}
async function voteScore(type, score, targetId) {
  let token = common_vendor.index.getStorageSync("token");
  if (!token) {
    common_vendor.index.showToast({
      title: "请先登录",
      icon: "none"
    });
    return 0;
  }
  common_vendor.index.request({
    url: websiteUrl + "/with-state/add-vote-score",
    method: "POST",
    header: {
      "Authorization": token
    },
    data: {
      target_id: parseInt(targetId),
      score: parseInt(score),
      type
    },
    success: (res) => {
      common_vendor.index.__f__("log", "at common/config.js:170", res.data);
      if (res.data.status == "success") {
        common_vendor.index.showToast({
          title: "评分成功",
          icon: "success"
        });
        activeModal.value = false;
        return 0;
      } else {
        common_vendor.index.showToast({
          title: res.data.msg,
          icon: "none"
        });
        return 0;
      }
    },
    fail: (err) => {
      common_vendor.index.__f__("log", "at common/config.js:188", err);
      common_vendor.index.showToast({
        title: "网络请求失败",
        icon: "none"
      });
    }
  });
  return 0;
}
function getScene() {
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
  common_vendor.index.__f__("error", "at common/config.js:246", error);
  common_vendor.index.showToast({
    title: message,
    icon: "none"
  });
}
exports.asyncGetUserInfo = asyncGetUserInfo;
exports.getScene = getScene;
exports.getUserInfo = getUserInfo;
exports.global = global;
exports.image1Url = image1Url;
exports.voteScore = voteScore;
exports.websiteUrl = websiteUrl;
exports.wechatSignLogin = wechatSignLogin;
//# sourceMappingURL=../../.sourcemap/mp-weixin/common/config.js.map
