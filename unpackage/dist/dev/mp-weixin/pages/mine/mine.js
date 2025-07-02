"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const common_config = require("../../common/config.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "mine",
  setup(__props) {
    common_vendor.useCssVars((_ctx) => ({
      "cb11d27e": headerHeight.value
    }));
    common_vendor.index.__f__("log", "at pages/mine/mine.vue:153", common_config.global.isLogin);
    common_vendor.index.__f__("log", "at pages/mine/mine.vue:154", common_config.global.userInfo);
    let inputPhone = common_vendor.ref("");
    let inputPassword = common_vendor.ref("");
    let unreadCount = common_vendor.ref(0);
    let likeCount = common_vendor.ref(0);
    let myCollocationCount = common_vendor.ref(0);
    common_vendor.ref(false);
    let scene = common_config.getScene();
    let agree = common_vendor.ref(false);
    function handleAgreeChange(e) {
      agree.value = e.detail.value.length > 0;
    }
    function goToPrivacy() {
      common_vendor.index.navigateTo({
        url: "/pages/private/private"
      });
    }
    function goToPermissions() {
      common_vendor.index.navigateTo({
        url: "/pages/permission/permission"
      });
    }
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
      common_vendor.index.navigateTo({
        url: `/pages/register/register`
      });
    }
    function jump2like() {
      common_vendor.index.navigateTo({
        url: `/pages/user_like/user_like`
      });
    }
    function jump2index() {
      common_vendor.index.showTabBar({
        animation: false
      });
      common_vendor.index.switchTab({
        url: `/pages/index/index`
      });
    }
    function jump2myComment() {
      common_vendor.index.navigateTo({
        url: `/pages/my_comment/my_comment`
      });
    }
    function jump2message() {
      common_vendor.index.navigateTo({
        url: `/pages/message_list/message_list`
      });
    }
    function jump2forgetPassword() {
      common_vendor.index.navigateTo({
        url: `/pages/reset_password/reset_password`
      });
    }
    function jump2collocation() {
      common_vendor.index.navigateTo({
        url: `/pages/my_collocation/my_collocation`
      });
    }
    function jumpToCroper() {
      chooseImage().then((src) => {
        common_vendor.index.navigateTo({
          url: `/pages/pop_croper/pop_croper?src=${decodeURIComponent(src)}`
        });
      });
    }
    const fetchUnreadCount = async () => {
      try {
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl}/with-state/unread-message-count`,
          header: {
            Authorization: common_vendor.index.getStorageSync("token")
          }
        });
        if (res.data.status === "success") {
          unreadCount.value = res.data.data.count;
        }
      } catch (error) {
        common_vendor.index.__f__("log", "at pages/mine/mine.vue:279", error);
        common_vendor.index.showToast({
          title: "未读数获取失败",
          icon: "none"
        });
      }
    };
    const fetchLikeCount = async () => {
      try {
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl}/with-state/user-likes-count`,
          header: {
            Authorization: common_vendor.index.getStorageSync("token")
          }
        });
        if (res.data.status === "success") {
          likeCount.value = res.data.data.count;
        }
      } catch (error) {
        common_vendor.index.__f__("log", "at pages/mine/mine.vue:300", error);
        common_vendor.index.showToast({
          title: "关注数获取失败",
          icon: "none"
        });
      }
    };
    const fetchMyCollocationCount = async () => {
      try {
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl}/with-state/my-collocation-count`,
          header: {
            Authorization: common_vendor.index.getStorageSync("token")
          }
        });
        if (res.data.status === "success") {
          myCollocationCount.value = res.data.data;
        }
      } catch (error) {
        common_vendor.index.__f__("log", "at pages/mine/mine.vue:322", error);
        common_vendor.index.showToast({
          title: "搭配数获取失败",
          icon: "none"
        });
      }
    };
    function selectAvatar(croperPath) {
      common_vendor.index.__f__("log", "at pages/mine/mine.vue:331", "croperPath:" + croperPath);
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
            common_vendor.index.__f__("log", "at pages/mine/mine.vue:351", "获取到的七牛token：" + res.data.data.token);
            let userInfo = common_vendor.index.getStorageSync("userInfo");
            common_vendor.index.__f__("log", "at pages/mine/mine.vue:353", userInfo);
            let fileName = res.data.data.path;
            common_vendor.index.__f__("log", "at pages/mine/mine.vue:356", "fileName:" + fileName);
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
                common_vendor.index.__f__("log", "at pages/mine/mine.vue:371", "上传成功");
                updateUserInfo("avatar", "https://images1.fantuanpu.com/" + fileName);
              },
              fail: (res2) => {
                common_vendor.index.__f__("log", "at pages/mine/mine.vue:378", res2);
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
          common_vendor.index.__f__("log", "at pages/mine/mine.vue:411", "更新成功");
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
      if (!agree.value) {
        common_vendor.index.showToast({
          title: "请先阅读并同意协议",
          icon: "none"
        });
        return;
      }
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
          common_vendor.index.__f__("log", "at pages/mine/mine.vue:471", res);
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
          common_vendor.index.__f__("log", "at pages/mine/mine.vue:486", "jwt:" + data.jwt_token);
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
    const systemInfo = common_vendor.index.getSystemInfoSync();
    const navBarHeight = common_vendor.computed(() => {
      const menuButtonInfo = common_vendor.index.getMenuButtonBoundingClientRect();
      const statusBarHeight = systemInfo.statusBarHeight || 32;
      return menuButtonInfo.bottom + menuButtonInfo.top - 2 * statusBarHeight;
    });
    const headerHeight = common_vendor.computed(() => {
      return navBarHeight.value + "px";
    });
    common_vendor.watch(
      () => common_config.global.isLogin,
      // 使用函数返回要监听的值
      (newVal) => {
        common_vendor.index.__f__("log", "at pages/mine/mine.vue:543", "watch", newVal);
        if (newVal) {
          common_vendor.index.showTabBar({
            animation: false
          });
        } else {
          common_vendor.index.hideTabBar({
            animation: false
          });
        }
      }
    );
    common_vendor.onShow(() => {
      common_config.getUserInfo();
      if (common_config.global.isLogin) {
        common_vendor.index.showTabBar({
          animation: false
        });
      } else {
        common_vendor.index.hideTabBar({
          animation: false
        });
      }
      fetchUnreadCount();
      fetchLikeCount();
      fetchMyCollocationCount();
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      if (currentPage.returnParam) {
        selectAvatar(currentPage.returnParam);
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.s(_ctx.__cssVars()),
        b: common_vendor.unref(common_config.global).isLogin
      }, common_vendor.unref(common_config.global).isLogin ? {
        c: common_vendor.unref(common_config.global).userInfo.avatar,
        d: common_vendor.o(jumpToCroper),
        e: common_vendor.t(common_vendor.unref(common_config.global).userInfo.username),
        f: common_vendor.t(common_vendor.unref(common_config.global).userInfo.id),
        g: common_assets._imports_0$4,
        h: common_vendor.t(common_vendor.unref(likeCount)),
        i: common_vendor.o(jump2like),
        j: common_assets._imports_1$3,
        k: common_vendor.t(common_vendor.unref(unreadCount)),
        l: common_vendor.o(jump2message),
        m: common_assets._imports_2$2,
        n: common_vendor.t(common_vendor.unref(myCollocationCount)),
        o: common_vendor.o(jump2collocation),
        p: common_vendor.p({
          type: "chatboxes",
          size: "24",
          color: "#606060"
        }),
        q: common_vendor.p({
          type: "right",
          size: "24",
          color: "#c0c0c0"
        }),
        r: common_vendor.o(jump2myComment),
        s: common_vendor.p({
          type: "gear",
          size: "24",
          color: "#606060"
        }),
        t: common_vendor.p({
          type: "right",
          size: "24",
          color: "#c0c0c0"
        }),
        v: common_vendor.o(jumpSetting),
        w: common_vendor.p({
          type: "arrow-right",
          size: "24",
          color: "#606060"
        }),
        x: common_vendor.p({
          type: "right",
          size: "24",
          color: "#c0c0c0"
        }),
        y: common_vendor.o(logout)
      } : common_vendor.e({
        z: common_assets._imports_3,
        A: common_vendor.unref(inputPhone),
        B: common_vendor.o(($event) => common_vendor.isRef(inputPhone) ? inputPhone.value = $event.detail.value : inputPhone = $event.detail.value),
        C: common_assets._imports_4$1,
        D: common_vendor.unref(inputPassword),
        E: common_vendor.o(($event) => common_vendor.isRef(inputPassword) ? inputPassword.value = $event.detail.value : inputPassword = $event.detail.value),
        F: common_vendor.o(jump2register),
        G: common_vendor.o(jump2forgetPassword),
        H: common_vendor.o(login),
        I: common_vendor.unref(scene) == 4
      }, common_vendor.unref(scene) == 4 ? {
        J: common_vendor.o((...args) => common_vendor.unref(common_config.wechatSignLogin) && common_vendor.unref(common_config.wechatSignLogin)(...args))
      } : {}, {
        K: common_vendor.o(jump2index),
        L: common_vendor.unref(agree),
        M: common_vendor.o(handleAgreeChange),
        N: common_vendor.o(goToPrivacy),
        O: common_vendor.o(goToPermissions)
      }), {
        P: common_vendor.s(_ctx.__cssVars())
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7c2ebfa5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/mine/mine.js.map
