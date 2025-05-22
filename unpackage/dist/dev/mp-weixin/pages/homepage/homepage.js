"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
if (!Array) {
  const _easycom_common_search2 = common_vendor.resolveComponent("common-search");
  const _easycom_homepage_list_item2 = common_vendor.resolveComponent("homepage-list-item");
  (_easycom_common_search2 + _easycom_homepage_list_item2)();
}
const _easycom_common_search = () => "../../components/common-search/common-search.js";
const _easycom_homepage_list_item = () => "../../components/homepage-list-item/homepage-list-item.js";
if (!Math) {
  (_easycom_common_search + _easycom_homepage_list_item)();
}
const _sfc_main = {
  __name: "homepage",
  setup(__props) {
    let selectSizeArray = ["所有尺寸", "一分", "二分", "三分", "四分", "六分", "八分", "十分", "十二分", "其它大尺寸", "棉花娃"];
    let index = common_vendor.ref(0);
    let menuList = [
      { name: "上新推送" },
      { name: "BJD整娃" },
      { name: "单头" },
      { name: "假发" },
      { name: "娃衣" },
      { name: "眼珠" },
      { name: "鞋子" },
      { name: "支架" },
      { name: "其它配件" }
    ];
    function bindPickerChange(e) {
      common_vendor.index.__f__("log", "at pages/homepage/homepage.vue:68", "picker发送选择改变，携带值为", e.detail.value);
      index.value = e.detail.value;
    }
    const systemInfo = common_vendor.index.getSystemInfoSync();
    const statusBarHeight = common_vendor.ref(systemInfo.statusBarHeight);
    common_vendor.index.__f__("log", "at pages/homepage/homepage.vue:74", "状态栏高度" + statusBarHeight.value);
    common_vendor.onReachBottom(() => {
      common_vendor.index.__f__("log", "at pages/homepage/homepage.vue:77", "onEachBottom!");
    });
    function go2goods() {
      common_vendor.index.navigateTo({
        url: "/pages/goods/goods"
      });
    }
    return (_ctx, _cache) => {
      return {
        a: common_assets._imports_0,
        b: common_vendor.t(common_vendor.unref(selectSizeArray)[common_vendor.unref(index)]),
        c: common_assets._imports_1$1,
        d: common_vendor.o(bindPickerChange),
        e: common_vendor.unref(index),
        f: common_vendor.unref(selectSizeArray),
        g: common_vendor.f(common_vendor.unref(menuList), (item, key, i0) => {
          return {
            a: common_vendor.t(item.name),
            b: key
          };
        }),
        h: common_vendor.o(go2goods)
      };
    };
  }
};
_sfc_main.__runtimeHooks = 2;
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/homepage/homepage.js.map
