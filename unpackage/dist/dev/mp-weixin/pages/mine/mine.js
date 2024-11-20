"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const common_config = require("../../common/config.js");
const _sfc_main = {
  __name: "mine",
  setup(__props) {
    console.log(common_config.global.isLogin);
    console.log(common_config.global.userInfo);
    const systemInfo = common_vendor.index.getSystemInfoSync();
    const statusBarHeight = common_vendor.ref(systemInfo.statusBarHeight);
    let inputPhone = common_vendor.ref("");
    let inputPassword = common_vendor.ref("");
    function chooseImage() {
      return new Promise((resolve) => {
        common_vendor.index.chooseImage({
          count: 1,
          success: (res) => {
            resolve(res.tempFilePaths[0]);
          }
        });
      });
    }
    function logout() {
      common_vendor.index.removeStorageSync("token");
      common_vendor.index.removeStorageSync("userInfo");
      common_config.global.isLogin = false;
    }
    function jumpToCroper() {
      chooseImage().then((src) => {
        common_vendor.index.navigateTo({
          url: `/pages/pop_croper/pop_croper?src=${decodeURIComponent(src)}`
        });
      });
    }
    function selectAvatar(croperPath) {
      console.log("croperPath:" + croperPath);
      let token = common_vendor.index.getStorageSync("token");
      let qnToken = "";
      common_vendor.index.request(
        {
          url: common_config.websiteUrl + "/with-state/qiniu-token",
          method: "POST",
          header: {
            "Authorization": token
          },
          success: (res) => {
            if (res.data.data == null || res.data.data.token == "") {
              common_vendor.index.showToast({
                title: "获取上传凭证失败",
                icon: "none"
              });
              return;
            }
            qnToken = res.data.data.token;
            console.log("获取到的七牛token：" + res.data.data.token);
            let userInfo = common_vendor.index.getStorageSync("userInfo");
            console.log(userInfo);
            let fileName = res.data.data.path;
            console.log("fileName:" + fileName);
            common_vendor.index.uploadFile({
              url: "https://up-cn-east-2.qiniup.com",
              name: "file",
              method: "POST",
              filePath: croperPath,
              fileType: "image",
              //仅支付宝小程序，且必填。
              formData: {
                token: qnToken,
                key: fileName,
                //覆盖上传
                scope: "hobby-box:" + fileName
              },
              success: (res2) => {
                console.log("上传成功");
                updateUserInfo("avatar", "https://images1.fantuanpu.com/" + fileName);
              },
              fail: (res2) => {
                common_vendor.index.showToast({
                  title: "上传失败",
                  icon: "none"
                });
              }
            });
          },
          fail: (res) => {
            common_vendor.index.showToast({
              title: "获取上传凭证失败",
              icon: "none"
            });
          }
        }
        // uni.request.qnToken
      );
    }
    function updateUserInfo(key, value) {
      let token = common_vendor.index.getStorageSync("token");
      common_vendor.index.getStorageSync("userInfo");
      common_vendor.index.request({
        url: common_config.websiteUrl + "/with-state/update-profile",
        method: "POST",
        header: {
          "Authorization": token
        },
        data: {
          "avatar": value
        },
        success: (res) => {
          console.log("更新成功");
          common_config.getUserInfo();
        },
        fail: (res) => {
          common_vendor.index.showToast({
            title: "更新失败",
            icon: "none"
          });
        }
      });
    }
    function login() {
      if (inputPassword.value == "" || inputPhone.value == "") {
        common_vendor.index.showToast({
          title: "请输入手机号和密码",
          icon: "none"
        });
        return;
      }
      if (!/^1[3456789]\d{9}$/.test(inputPhone.value)) {
        common_vendor.index.showToast({
          title: "手机号格式错误",
          icon: "none"
        });
        return;
      }
      if (inputPassword.value.length < 6) {
        common_vendor.index.showToast({
          title: "密码必须大于6位",
          icon: "none"
        });
        return;
      }
      let phone = inputPhone.value;
      let password = inputPassword.value;
      common_vendor.index.request({
        url: common_config.websiteUrl + "/login",
        method: "POST",
        data: {
          account: phone,
          password
        },
        success: (res) => {
          console.log(res);
          let data = res.data.data;
          let status = res.data.status;
          if (status != "success") {
            common_vendor.index.showToast({
              title: res.data.msg,
              icon: "none"
            });
            return;
          }
          common_vendor.index.setStorageSync("token", data.jwt_token);
          common_vendor.index.setStorageSync("openid", data.open_id);
          common_vendor.index.setStorageSync("session_key", data.session_key);
          console.log("jwt:" + data.jwt_token);
          if (data.jwt_token != null && data.jwt_token != "") {
            common_config.getUserInfo();
          }
        },
        fail: (res) => {
          common_vendor.index.showToast({
            title: "登录失败",
            icon: "none"
          });
        }
      });
    }
    function jumpSetting() {
      common_vendor.index.navigateTo({
        url: "/pages/setting/setting"
      });
    }
    common_config.getUserInfo();
    common_vendor.onShow(() => {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      if (currentPage.returnParam) {
        selectAvatar(currentPage.returnParam);
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.unref(common_config.global).isLogin
      }, common_vendor.unref(common_config.global).isLogin ? {
        b: common_vendor.unref(common_config.global).userInfo.avatar,
        c: common_vendor.o(jumpToCroper),
        d: common_vendor.t(common_vendor.unref(common_config.global).userInfo.username),
        e: common_vendor.t(common_vendor.unref(common_config.global).userInfo.id),
        f: common_assets._imports_0$1,
        g: common_assets._imports_1$1,
        h: common_vendor.o(jumpSetting),
        i: common_assets._imports_2,
        j: common_vendor.o(logout)
      } : {
        k: common_vendor.unref(inputPhone),
        l: common_vendor.o(($event) => common_vendor.isRef(inputPhone) ? inputPhone.value = $event.detail.value : inputPhone = $event.detail.value),
        m: common_vendor.unref(inputPassword),
        n: common_vendor.o(($event) => common_vendor.isRef(inputPassword) ? inputPassword.value = $event.detail.value : inputPassword = $event.detail.value),
        o: common_vendor.o(login),
        p: common_vendor.o((...args) => common_vendor.unref(common_config.wechatSignLogin) && common_vendor.unref(common_config.wechatSignLogin)(...args))
      }, {
        q: statusBarHeight.value + "px"
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7c2ebfa5"]]);
wx.createPage(MiniProgramPage);
