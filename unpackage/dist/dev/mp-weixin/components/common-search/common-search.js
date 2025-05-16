"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const common_config = require("../../common/config.js");
const _sfc_main = /* @__PURE__ */ Object.assign({
  inheritAttrs: false
}, {
  __name: "common-search",
  props: {
    mode: {
      type: String,
      default: "jump",
      // 默认跳转模式
      validator: (value) => ["jump", "fill"].includes(value)
      // 参数校验
    },
    width: {
      type: String,
      default: "100%"
    },
    background: {
      type: String,
      default: ""
    },
    fontSize: {
      type: String,
      default: ""
    }
  },
  emits: ["select"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const searchTerm = common_vendor.ref("");
    const results = common_vendor.ref([]);
    const onSearchInput = async () => {
      if (searchTerm.value.trim() === "") {
        results.value = [];
        return;
      }
      emit("select", 0, searchTerm.value);
      try {
        const res = await common_vendor.index.request({
          url: common_config.websiteUrl + `/search-brand?search=${searchTerm.value}`,
          method: "GET",
          header: {
            "Content-Type": "application/json"
          }
        });
        common_vendor.index.__f__("log", "at components/common-search/common-search.vue:75", "请求结果:", res.data);
        if (res.data.status == "success") {
          if (res.data.data == null) {
            results.value = [];
            return;
          }
          results.value = res.data.data;
          return;
        } else {
          results.value = [];
          return;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at components/common-search/common-search.vue:90", "请求错误:", error);
        results.value = [];
        return;
      }
    };
    const onTap = (brandId, brandName) => {
      if (props.mode === "jump") {
        common_vendor.index.navigateTo({
          url: `/pages/brand/brand?brand_id=${brandId}`
        });
      } else if (props.mode === "fill") {
        searchTerm.value = brandName;
        results.value = [];
        emit("select", brandId, brandName);
      }
    };
    function cancel() {
      searchTerm.value = "";
      results.value = [];
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: props.mode == "jump"
      }, props.mode == "jump" ? {
        b: common_assets._imports_0$6
      } : {}, {
        c: common_vendor.o([($event) => searchTerm.value = $event.detail.value, onSearchInput]),
        d: searchTerm.value,
        e: results.value.length > 0
      }, results.value.length > 0 ? {
        f: common_assets._imports_1$6,
        g: common_vendor.o(cancel)
      } : {}, {
        h: common_vendor.n(_ctx.$attrs.class),
        i: __props.background || "#fff",
        j: results.value.length > 0
      }, results.value.length > 0 ? {
        k: common_vendor.f(results.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.name),
            b: item.id,
            c: common_vendor.o(($event) => onTap(item.id, item.name), item.id)
          };
        }),
        l: __props.width
      } : {});
    };
  }
});
wx.createComponent(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/common-search/common-search.js.map
