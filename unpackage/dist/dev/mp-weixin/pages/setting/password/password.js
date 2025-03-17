"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_config = require("../../../common/config.js");
const _sfc_main = {
  __name: "password",
  setup(__props) {
    common_vendor.index.setNavigationBarTitle({
      title: "设置密码"
    });
    let oldPassword = common_vendor.ref("");
    let newPassword = common_vendor.ref("");
    let newPassword2 = common_vendor.ref("");
    function updatePassword() {
      if (newPassword.value != newPassword2.value) {
        common_vendor.index.showToast({
          title: "两次密码输入不一致",
          icon: "none"
        });
        return;
      }
      if (!common_config.global.userInfo.password && !oldPassword.value) {
        common_vendor.index.showToast({
          title: "请输入原密码",
          icon: "none"
        });
        return;
      }
      common_vendor.index.request({
        url: common_config.websiteUrl + "/with-state/setting-password",
        method: "POST",
        header: {
          "Authorization": common_vendor.index.getStorageSync("token")
        },
        data: {
          old_password: oldPassword.value,
          new_password: newPassword.value
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/setting/password/password.vue:65", res.data);
          if (res.data.status == "success") {
            common_vendor.index.showToast({
              title: "修改成功",
              icon: "success"
            });
          } else {
            common_vendor.index.showToast({
              title: res.data.msg,
              icon: "none"
            });
          }
        }
      });
    }
    common_config.getUserInfo();
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.unref(common_config.global).userInfo.password
      }, common_vendor.unref(common_config.global).userInfo.password ? {
        b: common_vendor.unref(oldPassword),
        c: common_vendor.o(($event) => common_vendor.isRef(oldPassword) ? oldPassword.value = $event.detail.value : oldPassword = $event.detail.value),
        d: common_vendor.unref(newPassword),
        e: common_vendor.o(($event) => common_vendor.isRef(newPassword) ? newPassword.value = $event.detail.value : newPassword = $event.detail.value),
        f: common_vendor.unref(newPassword2),
        g: common_vendor.o(($event) => common_vendor.isRef(newPassword2) ? newPassword2.value = $event.detail.value : newPassword2 = $event.detail.value)
      } : {
        h: common_vendor.unref(newPassword),
        i: common_vendor.o(($event) => common_vendor.isRef(newPassword) ? newPassword.value = $event.detail.value : newPassword = $event.detail.value),
        j: common_vendor.unref(newPassword2),
        k: common_vendor.o(($event) => common_vendor.isRef(newPassword2) ? newPassword2.value = $event.detail.value : newPassword2 = $event.detail.value)
      }, {
        l: common_vendor.o(updatePassword)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-b825db0b"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/setting/password/password.js.map
