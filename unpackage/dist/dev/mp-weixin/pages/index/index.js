"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const common_config = require("../../common/config.js");
if (!Array) {
  const _easycom_common_search2 = common_vendor.resolveComponent("common-search");
  const _easycom_index_brand2 = common_vendor.resolveComponent("index-brand");
  const _easycom_common_page2 = common_vendor.resolveComponent("common-page");
  (_easycom_common_search2 + _easycom_index_brand2 + _easycom_common_page2)();
}
const _easycom_common_search = () => "../../components/common-search/common-search.js";
const _easycom_index_brand = () => "../../components/index-brand/index-brand.js";
const _easycom_common_page = () => "../../components/common-page/common-page.js";
if (!Math) {
  (_easycom_common_search + _easycom_index_brand + _easycom_common_page)();
}
const _sfc_main = {
  __name: "index",
  setup(__props) {
    let brandsList = common_vendor.ref([]);
    let data = common_vendor.ref([
      "../../static/blurbg.jpg",
      "../../static/blurbg.jpg",
      "../../static/blurbg.jpg",
      "../../static/blurbg.jpg",
      "../../static/blurbg.jpg"
    ]);
    common_vendor.ref(0);
    common_vendor.index.getSystemInfoSync();
    var totalBrand = common_vendor.ref(0);
    function onChange(e) {
      this.swiperIndex.value = e.detail.current;
    }
    function getBrands() {
      common_vendor.index.showLoading();
      common_vendor.index.request({
        url: common_config.websiteUrl + "/brands",
        method: "GET",
        timeout: 5e3,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/index/index.vue:111", common_config.websiteUrl);
          common_vendor.index.__f__("log", "at pages/index/index.vue:112", res);
          common_vendor.index.__f__("log", "at pages/index/index.vue:113", res.data.data.brands_list);
          brandsList.value = res.data.data.brands_list;
          totalBrand.value = res.data.data.total;
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/index/index.vue:118", err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        },
        complete: () => {
          common_vendor.index.hideLoading();
        }
      });
    }
    getBrands();
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(common_vendor.unref(data), (item, k0, i0) => {
          return {
            a: item,
            b: item
          };
        }),
        b: common_vendor.o(onChange),
        c: common_assets._imports_0,
        d: common_assets._imports_1,
        e: common_assets._imports_2,
        f: common_assets._imports_3,
        g: common_vendor.f(common_vendor.unref(brandsList), (item, index, i0) => {
          return {
            a: "1cf27b2a-2-" + i0 + ",1cf27b2a-0",
            b: common_vendor.p({
              brand: item
            }),
            c: item.id
          };
        }),
        h: common_vendor.p({
          head_color: "rgb(255 230 215) "
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
