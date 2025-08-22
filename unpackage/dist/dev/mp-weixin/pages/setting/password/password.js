"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_config = require("../../../common/config.js");
if (!Array) {
  const _easycom_view_logs2 = common_vendor.resolveComponent("view-logs");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  (_easycom_view_logs2 + _easycom_uni_icons2)();
}
const _easycom_view_logs = () => "../../../components/view-logs/view-logs.js";
const _easycom_uni_icons = () => "../../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_view_logs + _easycom_uni_icons)();
}
const _sfc_main = {
  __name: "password",
  setup(__props) {
    common_vendor.index.setNavigationBarTitle({
      title: "设置密码"
    });
    let oldPassword = common_vendor.ref("");
    let newPassword = common_vendor.ref("");
    let newPassword2 = common_vendor.ref("");
    const isFormValid = common_vendor.computed(() => {
      return newPassword.value && newPassword2.value && newPassword.value === newPassword2.value;
    });
    const strengthText = common_vendor.computed(() => {
      if (newPassword.value.length < 6) {
        return "密码过于简单";
      } else if (newPassword.value.length < 10) {
        return "密码强度一般";
      } else {
        return "密码强度较高";
      }
    });
    const getStrengthClass = (level) => {
      if (newPassword.value.length < 6) {
        return "weak";
      } else if (newPassword.value.length < 10) {
        return "medium";
      } else {
        return "strong";
      }
    };
    function updatePassword() {
      if (newPassword.value != newPassword2.value) {
        common_vendor.index.showToast({
          title: "两次密码输入不一致",
          icon: "none"
        });
        return;
      }
      if (common_config.global.userInfo.password && !oldPassword.value) {
        common_vendor.index.showToast({
          title: "请输入原密码",
          icon: "none"
        });
        return;
      }
      common_vendor.index.request({
        url: common_config.websiteUrl.value + "/with-state/setting-password",
        method: "POST",
        header: {
          "Authorization": common_vendor.index.getStorageSync("token")
        },
        data: {
          old_password: oldPassword.value,
          new_password: newPassword.value
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/setting/password/password.vue:134", res.data);
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
        d: common_vendor.p({
          type: "locked",
          size: "18",
          color: "#999"
        }),
        e: common_vendor.unref(newPassword),
        f: common_vendor.o(($event) => common_vendor.isRef(newPassword) ? newPassword.value = $event.detail.value : newPassword = $event.detail.value),
        g: common_vendor.p({
          type: "gear",
          size: "18",
          color: "#999"
        }),
        h: common_vendor.unref(newPassword2),
        i: common_vendor.o(($event) => common_vendor.isRef(newPassword2) ? newPassword2.value = $event.detail.value : newPassword2 = $event.detail.value),
        j: common_vendor.p({
          type: "checkmarkempty",
          size: "18",
          color: "#999"
        })
      } : {
        k: common_vendor.unref(newPassword),
        l: common_vendor.o(($event) => common_vendor.isRef(newPassword) ? newPassword.value = $event.detail.value : newPassword = $event.detail.value),
        m: common_vendor.p({
          type: "locked",
          size: "18",
          color: "#999"
        }),
        n: common_vendor.unref(newPassword2),
        o: common_vendor.o(($event) => common_vendor.isRef(newPassword2) ? newPassword2.value = $event.detail.value : newPassword2 = $event.detail.value),
        p: common_vendor.p({
          type: "checkmarkempty",
          size: "18",
          color: "#999"
        })
      }, {
        q: common_vendor.unref(newPassword)
      }, common_vendor.unref(newPassword) ? {
        r: common_vendor.n(getStrengthClass()),
        s: common_vendor.n(getStrengthClass()),
        t: common_vendor.n(getStrengthClass()),
        v: common_vendor.t(strengthText.value)
      } : {}, {
        w: common_vendor.t(common_vendor.unref(common_config.global).userInfo.password ? "更新密码" : "设置密码"),
        x: isFormValid.value ? 1 : "",
        y: common_vendor.o(updatePassword),
        z: !isFormValid.value,
        A: common_vendor.p({
          type: "info",
          size: "16",
          color: "#666"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-b825db0b"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/setting/password/password.js.map
