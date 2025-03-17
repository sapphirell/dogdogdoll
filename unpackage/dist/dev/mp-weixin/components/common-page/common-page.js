"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "common-page",
  props: {
    head_color: {
      type: String,
      default: "#ffffff"
    }
  },
  setup(__props) {
    common_vendor.useCssVars((_ctx) => ({
      "9d29b882": headerHeight.value,
      "20ceeea2": __props.head_color,
      "1341f44d": footerHeight.value
    }));
    const systemInfo = common_vendor.index.getSystemInfoSync();
    const navBarHeight = common_vendor.computed(() => {
      const menuButtonInfo = common_vendor.index.getMenuButtonBoundingClientRect();
      const statusBarHeight = systemInfo.statusBarHeight || 32;
      return menuButtonInfo.bottom + menuButtonInfo.top - 2 * statusBarHeight;
    });
    const headerHeight = common_vendor.computed(() => {
      return navBarHeight.value + "px";
    });
    const footerHeight = common_vendor.computed(() => {
      var _a;
      const safeBottom = ((_a = systemInfo.safeAreaInsets) == null ? void 0 : _a.bottom) || 0;
      return `${safeBottom + 20}px`;
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.s(_ctx.__cssVars())
      };
    };
  }
};
wx.createComponent(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/common-page/common-page.js.map
