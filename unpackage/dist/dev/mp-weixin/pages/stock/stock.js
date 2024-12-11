"use strict";
const common_vendor = require("../../common/vendor.js");
const common_config = require("../../common/config.js");
const _sfc_main = {
  __name: "stock",
  setup(__props) {
    const systemInfo = common_vendor.index.getSystemInfoSync();
    const statusBarHeight = common_vendor.ref(systemInfo.statusBarHeight);
    const activeTab = common_vendor.ref(1);
    function switch_tab(index) {
      activeTab.value = index;
      console.log(`切换到 tab ${index}`);
    }
    common_vendor.onShow(() => {
      common_config.getUserInfo();
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(($event) => switch_tab(1)),
        b: common_vendor.o(($event) => switch_tab(2)),
        c: common_vendor.o(($event) => switch_tab(3)),
        d: activeTab.value !== 1 ? 1 : "",
        e: activeTab.value !== 2 ? 1 : "",
        f: activeTab.value !== 3 ? 1 : "",
        g: statusBarHeight.value + "px"
      };
    };
  }
};
wx.createPage(_sfc_main);
