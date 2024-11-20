"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_common_search2 = common_vendor.resolveComponent("common-search");
  const _easycom_index_brand2 = common_vendor.resolveComponent("index-brand");
  (_easycom_common_search2 + _easycom_index_brand2)();
}
const _easycom_common_search = () => "../../components/common-search/common-search.js";
const _easycom_index_brand = () => "../../components/index-brand/index-brand.js";
if (!Math) {
  (_easycom_common_search + sdp + _easycom_index_brand)();
}
const sdp = () => "../../components/swiper-dynamic-bullets/swiper-dynamic-bullets.js";
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
    var swiperIndex = common_vendor.ref(0);
    const systemInfo = common_vendor.index.getSystemInfoSync();
    const statusBarHeight = common_vendor.ref(systemInfo.statusBarHeight + 15);
    console.log("状态栏高度" + statusBarHeight.value);
    var totalBrand = common_vendor.ref(0);
    function onChange(e) {
      this.swiperIndex.value = e.detail.current;
    }
    function getBrands() {
      common_vendor.index.showLoading();
      common_vendor.index.request({
        url: "http://localhost:8080/brands",
        method: "GET",
        timeout: 5e3,
        success: (res) => {
          console.log(res.data.data.brands_list);
          brandsList.value = res.data.data.brands_list;
          totalBrand.value = res.data.data.total;
        },
        fail: (err) => {
          console.log(err);
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
        a: common_vendor.f(common_vendor.unref(data), (i, k0, i0) => {
          return {
            a: i
          };
        }),
        b: common_vendor.o(onChange),
        c: common_vendor.p({
          resdata: common_vendor.unref(data),
          currentIndex: common_vendor.unref(swiperIndex)
        }),
        d: statusBarHeight.value + "px",
        e: common_vendor.f(common_vendor.unref(brandsList), (item, index, i0) => {
          return {
            a: "1cf27b2a-2-" + i0,
            b: common_vendor.p({
              brand: item
            })
          };
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
