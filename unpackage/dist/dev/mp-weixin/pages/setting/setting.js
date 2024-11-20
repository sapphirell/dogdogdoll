"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const common_config = require("../../common/config.js");
const _sfc_main = {
  __name: "setting",
  setup(__props) {
    common_vendor.index.setNavigationBarTitle({
      title: "设置"
    });
    let userInfo = common_vendor.ref({});
    function jump2password() {
      common_vendor.index.navigateTo({
        url: "/pages/setting/password/password"
      });
    }
    function jump2telphone() {
      common_vendor.index.navigateTo({
        url: "/pages/setting/tel_phone/tel_phone"
      });
    }
    function jump2wechat() {
      if (userInfo.wechat_open_id) {
        common_vendor.index.showToast({
          title: "已绑定微信",
          icon: "none"
        });
        return;
      }
    }
    common_config.getUserInfo();
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.unref(common_config.global).userInfo.password
      }, common_vendor.unref(common_config.global).userInfo.password ? {
        b: common_assets._imports_0$2,
        c: common_vendor.o(jump2password)
      } : {
        d: common_assets._imports_0$2,
        e: common_vendor.o(jump2password)
      }, {
        f: common_vendor.unref(common_config.global).userInfo.tel_phone
      }, common_vendor.unref(common_config.global).userInfo.tel_phone ? {
        g: common_vendor.t(common_vendor.unref(common_config.global).userInfo.tel_phone),
        h: common_assets._imports_0$2,
        i: common_vendor.o(jump2telphone)
      } : {
        j: common_assets._imports_0$2,
        k: common_vendor.o(jump2telphone)
      }, {
        l: common_vendor.unref(common_config.global).userInfo.wechat_open_id
      }, common_vendor.unref(common_config.global).userInfo.wechat_open_id ? {
        m: common_assets._imports_0$2,
        n: common_vendor.o(jump2wechat)
      } : {
        o: common_assets._imports_0$2,
        p: common_vendor.o(jump2wechat)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-018cdf56"]]);
wx.createPage(MiniProgramPage);
