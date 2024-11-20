"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_config = require("../../../common/config.js");
const _sfc_main = {
  __name: "tel_phone",
  setup(__props) {
    common_vendor.index.setNavigationBarTitle({
      title: "手机号"
    });
    let telPhone = common_vendor.ref("");
    let code = common_vendor.ref("");
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
          console.log(res.data);
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
        a: common_vendor.unref(common_config.global).userInfo.tel_phone
      }, common_vendor.unref(common_config.global).userInfo.tel_phone ? {} : {
        b: common_vendor.unref(telPhone),
        c: common_vendor.o(($event) => common_vendor.isRef(telPhone) ? telPhone.value = $event.detail.value : telPhone = $event.detail.value),
        d: common_vendor.unref(code),
        e: common_vendor.o(($event) => common_vendor.isRef(code) ? code.value = $event.detail.value : code = $event.detail.value)
      }, {
        f: common_vendor.o(updatePassword)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-25dd367f"]]);
wx.createPage(MiniProgramPage);
