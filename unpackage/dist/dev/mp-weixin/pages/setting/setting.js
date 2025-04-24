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
    let needUpdate = common_vendor.ref(false);
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
    function checkUpdate() {
      if (common_vendor.index.getSystemInfoSync().platform === "app") {
        const version = plus.runtime.version;
        common_vendor.index.__f__("log", "at pages/setting/setting.vue:127", "App version from manifest:", version);
      } else {
        common_vendor.index.showToast({
          title: "您所使用的平台无需更新",
          icon: "none"
        });
      }
    }
    common_config.getUserInfo();
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.unref(common_config.global).userInfo.password
      }, common_vendor.unref(common_config.global).userInfo.password ? {
        b: common_assets._imports_0$3,
        c: common_vendor.o(jump2password)
      } : {
        d: common_assets._imports_0$3,
        e: common_vendor.o(jump2password)
      }, {
        f: common_vendor.unref(common_config.global).userInfo.tel_phone
      }, common_vendor.unref(common_config.global).userInfo.tel_phone ? {
        g: common_assets._imports_0$3,
        h: common_vendor.o(jump2telphone)
      } : {
        i: common_assets._imports_0$3,
        j: common_vendor.o(jump2telphone)
      }, {
        k: common_vendor.unref(common_config.global).userInfo.wechat_open_id
      }, common_vendor.unref(common_config.global).userInfo.wechat_open_id ? {
        l: common_assets._imports_0$3,
        m: common_vendor.o(jump2wechat)
      } : {
        n: common_assets._imports_0$3,
        o: common_vendor.o(jump2wechat)
      }, {
        p: common_vendor.unref(needUpdate)
      }, common_vendor.unref(needUpdate) ? {
        q: common_assets._imports_0$3,
        r: common_vendor.o(checkUpdate)
      } : {
        s: common_assets._imports_0$3,
        t: common_vendor.o(checkUpdate)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-018cdf56"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/setting/setting.js.map
