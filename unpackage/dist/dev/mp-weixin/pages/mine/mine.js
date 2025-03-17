"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const common_config = require("../../common/config.js");
if (!Array) {
  const _easycom_common_page2 = common_vendor.resolveComponent("common-page");
  _easycom_common_page2();
}
const _easycom_common_page = () => "../../components/common-page/common-page.js";
if (!Math) {
  _easycom_common_page();
}
const _sfc_main = {
  __name: "mine",
  setup(__props) {
    common_vendor.index.__f__("log", "at pages/mine/mine.vue:93", common_config.global.isLogin);
    common_vendor.index.__f__("log", "at pages/mine/mine.vue:94", common_config.global.userInfo);
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
    function jump2register() {
    }
    function jumpToCroper() {
      chooseImage().then((src) => {
        common_vendor.index.navigateTo({
          url: `/pages/pop_croper/pop_croper?src=${decodeURIComponent(src)}`
        });
      });
    }
    function selectAvatar(croperPath) {
      common_vendor.index.__f__("log", "at pages/mine/mine.vue:136", "croperPath:" + croperPath);
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
            common_vendor.index.__f__("log", "at pages/mine/mine.vue:156", "获取到的七牛token：" + res.data.data.token);
            let userInfo = common_vendor.index.getStorageSync("userInfo");
            common_vendor.index.__f__("log", "at pages/mine/mine.vue:158", userInfo);
            let fileName = res.data.data.path;
            common_vendor.index.__f__("log", "at pages/mine/mine.vue:161", "fileName:" + fileName);
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
                common_vendor.index.__f__("log", "at pages/mine/mine.vue:176", "上传成功");
                updateUserInfo("avatar", "https://images1.fantuanpu.com/" + fileName);
              },
              fail: (res2) => {
                common_vendor.index.__f__("log", "at pages/mine/mine.vue:183", res2);
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
          common_vendor.index.__f__("log", "at pages/mine/mine.vue:216", "更新成功");
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
          common_vendor.index.__f__("log", "at pages/mine/mine.vue:268", res);
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
          common_vendor.index.__f__("log", "at pages/mine/mine.vue:283", "jwt:" + data.jwt_token);
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
    common_vendor.onShow(() => {
      common_config.getUserInfo();
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
        f: common_assets._imports_0$2,
        g: common_assets._imports_0$3,
        h: common_assets._imports_2$1,
        i: common_assets._imports_0$3,
        j: common_vendor.o(jumpSetting),
        k: common_assets._imports_3$1,
        l: common_assets._imports_0$3,
        m: common_vendor.o(logout)
      } : {
        n: common_vendor.unref(inputPhone),
        o: common_vendor.o(($event) => common_vendor.isRef(inputPhone) ? inputPhone.value = $event.detail.value : inputPhone = $event.detail.value),
        p: common_vendor.unref(inputPassword),
        q: common_vendor.o(($event) => common_vendor.isRef(inputPassword) ? inputPassword.value = $event.detail.value : inputPassword = $event.detail.value),
        r: common_vendor.o(jump2register),
        s: common_vendor.o((...args) => _ctx.jump2forgetPassword && _ctx.jump2forgetPassword(...args)),
        t: common_vendor.o(login),
        v: common_vendor.o((...args) => common_vendor.unref(common_config.wechatSignLogin) && common_vendor.unref(common_config.wechatSignLogin)(...args))
      }, {
        w: common_vendor.p({
          head_color: "#e0f3ff"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7c2ebfa5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/mine/mine.js.map
