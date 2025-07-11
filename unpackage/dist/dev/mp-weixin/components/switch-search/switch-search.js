"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_goods_search2 = common_vendor.resolveComponent("goods-search");
  const _easycom_common_search2 = common_vendor.resolveComponent("common-search");
  (_easycom_goods_search2 + _easycom_common_search2)();
}
const _easycom_goods_search = () => "../goods-search/goods-search.js";
const _easycom_common_search = () => "../common-search/common-search.js";
if (!Math) {
  (_easycom_goods_search + _easycom_common_search)();
}
const _sfc_main = {
  __name: "switch-search",
  props: {
    mode: {
      type: String,
      default: "jump",
      validator: (value) => ["jump", "fill"].includes(value)
    },
    width: {
      type: String,
      default: "100%"
    },
    background: {
      type: String,
      default: "#fff"
    },
    fontSize: {
      type: String,
      default: "28rpx"
    }
  },
  emits: ["submit"],
  setup(__props, { emit: __emit }) {
    common_vendor.useCssVars((_ctx) => ({
      "aac2d174": props.width
    }));
    const searchType = common_vendor.ref("goods");
    const goodsResults = common_vendor.ref([]);
    const brandResults = common_vendor.ref([]);
    const goodsSearchRef = common_vendor.ref(null);
    const commonSearchRef = common_vendor.ref(null);
    const hasResults = common_vendor.computed(() => {
      return searchType.value === "goods" && goodsResults.value.length > 0 || searchType.value === "brand" && brandResults.value.length > 0;
    });
    const toggleSearchType = () => {
      if (searchType.value === "goods") {
        goodsResults.value = [];
      } else {
        brandResults.value = [];
      }
      searchType.value = searchType.value === "goods" ? "brand" : "goods";
    };
    const handleGoodsSelect = (goods) => {
      goodsResults.value = goods ? [goods] : [];
      if (goods) {
        emit("submit", {
          type: "goods",
          data: goods
        });
      }
    };
    const handleBrandSelect = (id, name) => {
      if (id === 0) {
        brandResults.value = [];
      } else {
        brandResults.value = [{
          id,
          name
        }];
        emit("submit", {
          type: "brand",
          data: {
            id,
            name
          }
        });
      }
    };
    const selectGoods = (goods) => {
      if (props.mode === "jump") {
        common_vendor.index.navigateTo({
          url: `/pages/goods/goods?goods_id=${goods.id}`
        });
      }
    };
    const selectBrand = (brand) => {
      if (props.mode === "jump") {
        common_vendor.index.navigateTo({
          url: `/pages/brand/brand?brand_id=${brand.id}`
        });
      }
    };
    const props = __props;
    const searchWidth = common_vendor.computed(() => {
      return "700rpx";
    });
    const emit = __emit;
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: searchType.value === "goods"
      }, searchType.value === "goods" ? {
        b: common_vendor.sr(goodsSearchRef, "946fdc68-0", {
          "k": "goodsSearchRef"
        }),
        c: common_vendor.o(handleGoodsSelect),
        d: common_vendor.p({
          width: searchWidth.value,
          background: __props.background,
          ["hidden-icon"]: false,
          mode: __props.mode
        })
      } : {
        e: common_vendor.sr(commonSearchRef, "946fdc68-1", {
          "k": "commonSearchRef"
        }),
        f: common_vendor.o(handleBrandSelect),
        g: common_vendor.p({
          width: searchWidth.value,
          background: __props.background,
          fontSize: __props.fontSize,
          hidenIcon: false,
          mode: __props.mode
        })
      }, {
        h: searchWidth.value,
        i: common_vendor.t(searchType.value === "goods" ? "娃物" : "娃店"),
        j: common_vendor.o(toggleSearchType),
        k: hasResults.value
      }, hasResults.value ? common_vendor.e({
        l: searchType.value === "goods" && goodsResults.value.length > 0
      }, searchType.value === "goods" && goodsResults.value.length > 0 ? {
        m: common_vendor.f(goodsResults.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.brand_name),
            b: common_vendor.t(item.name),
            c: item.id,
            d: common_vendor.o(($event) => selectGoods(item), item.id)
          };
        })
      } : searchType.value === "brand" && brandResults.value.length > 0 ? {
        o: common_vendor.f(brandResults.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.name),
            b: item.id,
            c: common_vendor.o(($event) => selectBrand(item), item.id)
          };
        })
      } : {}, {
        n: searchType.value === "brand" && brandResults.value.length > 0
      }) : {}, {
        p: common_vendor.s(_ctx.__cssVars())
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-946fdc68"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/switch-search/switch-search.js.map
