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
    const menuItems = common_vendor.computed(() => [
      {
        label: "更改用户名",
        action: jump2username,
        status: !!common_config.global.userInfo.password,
        displayValue: common_config.global.userInfo.password ? "去修改" : "未设置"
      },
      {
        label: "更改密码",
        action: jump2password,
        status: !!common_config.global.userInfo.password,
        displayValue: common_config.global.userInfo.password ? "去修改" : "未设置"
      },
      {
        label: "绑定手机号",
        action: jump2telphone,
        status: !!common_config.global.userInfo.tel_phone,
        // 修正字段名
        displayValue: common_config.global.userInfo.tel_phone ? common_config.global.userInfo.tel_phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2") : "去绑定"
      },
      {
        label: "绑定微信",
        action: jump2wechat,
        status: !!common_config.global.userInfo.wechat_open_id,
        displayValue: common_config.global.userInfo.wechat_open_id ? "已绑定" : "去绑定"
      },
      {
        label: "检查更新",
        action: checkUpdate,
        status: false,
        displayValue: "无需更新"
      }
    ]);
    common_vendor.ref({});
    common_vendor.ref(false);
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
    function jump2username() {
      common_vendor.index.navigateTo({
        url: "/pages/setting/username/username"
      });
    }
    function jump2wechat() {
      if (common_config.global.userInfo.wechat_open_id) {
        common_vendor.index.showToast({
          title: "已绑定微信",
          icon: "none"
        });
      } else {
        common_config.bindWechat().then(() => {
          common_vendor.index.__f__("log", "at pages/setting/setting.vue:99", "微信绑定成功");
          common_vendor.index.showToast({
            title: "微信绑定成功",
            icon: "none"
          });
        }).catch((err) => {
          common_vendor.index.__f__("error", "at pages/setting/setting.vue:106", "微信绑定失败:", err);
          common_vendor.index.showToast({
            title: "微信绑定失败",
            icon: "none"
          });
        });
      }
    }
    function checkUpdate() {
      if (common_vendor.index.getSystemInfoSync().platform === "app") {
        const version = plus.runtime.version;
        common_vendor.index.__f__("log", "at pages/setting/setting.vue:119", "App version from manifest:", version);
      } else {
        common_vendor.index.showToast({
          title: "您所使用的平台无需更新",
          icon: "none"
        });
      }
    }
    common_config.getUserInfo();
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(menuItems.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item.label),
            b: common_vendor.t(item.displayValue),
            c: common_vendor.n(item.status ? "active" : "inactive"),
            d: index,
            e: common_vendor.o(($event) => item.action(item), index)
          };
        }),
        b: common_assets._imports_0$6
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-018cdf56"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/setting/setting.js.map
