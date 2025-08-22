"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const common_config = require("../../common/config.js");
const _sfc_main = {
  __name: "goods-search",
  props: {
    modelValue: {
      type: String,
      default: ""
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
    },
    tagColor: {
      type: String,
      default: "#666"
      // 新增标签颜色控制
    },
    mode: {
      type: String,
      default: "jump",
      validator: (value) => ["jump", "fill"].includes(value)
    },
    hiddenIcon: {
      type: Boolean,
      default: true
    },
    brandId: {
      // 新增brandId属性
      type: Number,
      default: 0
    }
  },
  emits: ["select", "update:modelValue"],
  setup(__props, { emit: __emit }) {
    const showResults = common_vendor.ref(false);
    const props = __props;
    const emit = __emit;
    const results = common_vendor.ref([]);
    const inputValue = common_vendor.computed({
      get: () => props.modelValue,
      set: (val) => emit("update:modelValue", val)
    });
    common_vendor.watch(results, (newVal) => {
      showResults.value = newVal.length > 0;
    });
    const closeResults = () => {
      results.value = [];
      showResults.value = false;
    };
    const onSearchInput = async (e) => {
      var _a;
      inputValue.value = e.detail.value;
      const searchValue = e.detail.value.trim();
      showResults.value = true;
      if (!searchValue) {
        results.value = [];
        return;
      }
      let url = `${common_config.websiteUrl.value}/search-goods?search=${encodeURIComponent(searchValue)}`;
      if (props.brandId && props.brandId !== 0) {
        url += `&brand_id=${props.brandId}`;
      }
      try {
        const res = await common_vendor.index.request({
          url,
          method: "GET"
        });
        results.value = ((_a = res.data) == null ? void 0 : _a.status) === "success" ? res.data.data || [] : [];
      } catch (error) {
        common_vendor.index.__f__("error", "at components/goods-search/goods-search.vue:120", "搜索失败:", error);
        results.value = [];
      }
    };
    const onTap = (goods) => {
      if (props.mode === "jump") {
        common_vendor.index.navigateTo({
          url: `/pages/goods/goods?goods_id=${goods.id}`
        });
      }
      if (props.mode === "fill") {
        emit("select", goods);
        inputValue.value = goods.name;
        results.value = [];
      }
      closeResults();
    };
    const cancel = () => {
      closeResults();
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: showResults.value
      }, showResults.value ? {
        b: common_vendor.o(closeResults)
      } : {}, {
        c: !__props.hiddenIcon
      }, !__props.hiddenIcon ? {
        d: common_assets._imports_0$15
      } : {}, {
        e: inputValue.value,
        f: common_vendor.o(onSearchInput),
        g: __props.fontSize || "23rpx",
        h: results.value.length > 0
      }, results.value.length > 0 ? {
        i: common_assets._imports_1$5,
        j: common_vendor.o(cancel)
      } : {}, {
        k: common_vendor.n(_ctx.$attrs.class),
        l: __props.background || "#fff",
        m: results.value.length > 0
      }, results.value.length > 0 ? {
        n: common_vendor.f(results.value, (item, k0, i0) => {
          return common_vendor.e({
            a: item.brand_name
          }, item.brand_name ? {
            b: common_vendor.t(item.brand_name)
          } : {}, {
            c: common_vendor.t(item.name),
            d: item.id,
            e: common_vendor.o(($event) => onTap(item), item.id)
          });
        }),
        o: __props.width
      } : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-445b599f"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/goods-search/goods-search.js.map
