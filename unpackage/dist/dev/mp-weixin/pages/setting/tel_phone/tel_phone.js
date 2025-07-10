"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_config = require("../../../common/config.js");
if (!Array) {
  const _easycom_view_logs2 = common_vendor.resolveComponent("view-logs");
  _easycom_view_logs2();
}
const _easycom_view_logs = () => "../../../components/view-logs/view-logs.js";
if (!Math) {
  _easycom_view_logs();
}
const _sfc_main = {
  __name: "tel_phone",
  setup(__props) {
    common_vendor.index.setNavigationBarTitle({
      title: "手机号"
    });
    let telPhone = common_vendor.ref("");
    let code = common_vendor.ref("");
    let buttonMsg = common_vendor.ref("发送验证码");
    function updateTelPhone() {
      common_vendor.index.request({
        url: common_config.websiteUrl + "/with-state/update-profile",
        method: "POST",
        header: {
          "Authorization": common_vendor.index.getStorageSync("token")
        },
        data: {
          tel_phone: telPhone.value,
          code: code.value
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/setting/tel_phone/tel_phone.vue:58", res.data);
          if (res.data.status == "success") {
            common_vendor.index.showToast({
              title: "修改成功",
              icon: "success"
            });
            common_config.getUserInfo();
          } else {
            common_vendor.index.showToast({
              title: res.data.msg,
              icon: "none"
            });
          }
        }
      });
    }
    function sendCode() {
      if (buttonMsg.value != "发送验证码") {
        common_vendor.index.showToast({
          title: "请点击发送验证码",
          icon: "none"
        });
        return;
      }
      if (telPhone.value == "" || telPhone.value == "") {
        common_vendor.index.showToast({
          title: "请输入手机号和密码",
          icon: "none"
        });
        return;
      }
      if (!/^1[3456789]\d{9}$/.test(telPhone.value)) {
        common_vendor.index.showToast({
          title: "手机号格式错误",
          icon: "none"
        });
        return;
      }
      buttonMsg.value = "发送中";
      common_vendor.index.request({
        url: common_config.websiteUrl + "/send-sms-code",
        method: "POST",
        header: {
          "Authorization": common_vendor.index.getStorageSync("token")
        },
        data: {
          tel_phone: telPhone.value
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/setting/tel_phone/tel_phone.vue:111", res.data);
          if (res.data.status == "success") {
            buttonMsg.value = "已发送";
            common_vendor.index.showToast({
              title: "发送成功",
              icon: "success"
            });
          } else {
            common_vendor.index.showToast({
              title: res.data.msg,
              icon: "none"
            });
            buttonMsg.value = "发送验证码";
          }
        }
      });
    }
    common_config.getUserInfo();
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.unref(common_config.global).userInfo.tel_phone
      }, common_vendor.unref(common_config.global).userInfo.tel_phone ? {
        b: common_vendor.unref(common_config.global).userInfo.tel_phone
      } : {
        c: common_vendor.unref(telPhone),
        d: common_vendor.o(($event) => common_vendor.isRef(telPhone) ? telPhone.value = $event.detail.value : telPhone = $event.detail.value),
        e: common_vendor.unref(code),
        f: common_vendor.o(($event) => common_vendor.isRef(code) ? code.value = $event.detail.value : code = $event.detail.value),
        g: common_vendor.t(common_vendor.unref(buttonMsg)),
        h: common_vendor.o(sendCode)
      }, {
        i: !common_vendor.unref(common_config.global).userInfo.tel_phone
      }, !common_vendor.unref(common_config.global).userInfo.tel_phone ? {
        j: common_vendor.o(updateTelPhone)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-25dd367f"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/setting/tel_phone/tel_phone.js.map
