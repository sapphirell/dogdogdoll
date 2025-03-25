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
      "https://images1.fantuanpu.com/box/100024/28a0d23e82607d47a56edb08daa85d0f",
      "https://images1.fantuanpu.com/box/100024/28a0d23e82607d47a56edb08daa85d0f",
      "https://images1.fantuanpu.com/box/100024/28a0d23e82607d47a56edb08daa85d0f"
    ]);
    const tabs = common_vendor.ref([
      { label: "中国娃社", value: 1 },
      { label: "个人作者", value: 2 },
      { label: "外国娃社", value: 3 }
    ]);
    const activeSearchType = common_vendor.ref(null);
    common_vendor.ref(0);
    common_vendor.index.getSystemInfoSync();
    common_vendor.ref(0);
    const page = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const hasMore = common_vendor.ref(true);
    const loading = common_vendor.ref(false);
    function onChange(e) {
      this.swiperIndex.value = e.detail.current;
    }
    const handleTabClick = (value) => {
      if (activeSearchType.value === value) {
        activeSearchType.value = null;
      } else {
        activeSearchType.value = value;
      }
      page.value = 1;
      hasMore.value = true;
      brandsList.value = [];
      getBrands();
    };
    function getBrands() {
      if (!hasMore.value || loading.value) {
        return;
      }
      loading.value = true;
      common_vendor.index.showLoading();
      common_vendor.index.request({
        url: common_config.websiteUrl + "/brands",
        data: {
          page: page.value,
          pageSize: pageSize.value,
          ...activeSearchType.value && { searchType: activeSearchType.value }
        },
        success: (res) => {
          const newData = res.data.data.brands_list;
          if (newData.length === 0) {
            hasMore.value = false;
            return;
          }
          brandsList.value = [...brandsList.value, ...newData];
          hasMore.value = brandsList.value.length < res.data.data.total;
          page.value++;
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/index/index.vue:191", err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        },
        complete: () => {
          loading.value = false;
          common_vendor.index.hideLoading();
        }
      });
    }
    common_vendor.onReachBottom(() => {
      getBrands();
    });
    getBrands();
    return (_ctx, _cache) => {
      return common_vendor.e({
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
        g: common_vendor.f(tabs.value, (tab, index, i0) => {
          return {
            a: common_vendor.t(tab.label),
            b: index,
            c: activeSearchType.value === tab.value ? 1 : "",
            d: common_vendor.o(($event) => handleTabClick(tab.value), index)
          };
        }),
        h: common_vendor.f(common_vendor.unref(brandsList), (item, index, i0) => {
          return {
            a: "1cf27b2a-2-" + i0 + ",1cf27b2a-0",
            b: common_vendor.p({
              brand: item
            }),
            c: item.id
          };
        }),
        i: loading.value
      }, loading.value ? {} : {}, {
        j: !hasMore.value
      }, !hasMore.value ? {} : {}, {
        k: common_vendor.p({
          head_color: "rgb(255 230 215) "
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1cf27b2a"]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
