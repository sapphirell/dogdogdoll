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
    }
  },
  emits: ["select", "update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const results = common_vendor.ref([]);
    const inputValue = common_vendor.computed({
      get: () => props.modelValue,
      set: (val) => emit("update:modelValue", val)
    });
    const onSearchInput = async (e) => {
      var _a;
      inputValue.value = e.detail.value;
      const searchValue = e.detail.value.trim();
      if (!searchValue) {
        results.value = [];
        return;
      }
      try {
        const res = await common_vendor.index.request({
          url: common_config.websiteUrl + `/search-goods?search=${encodeURIComponent(searchValue)}`,
          method: "GET"
        });
        results.value = ((_a = res.data) == null ? void 0 : _a.status) === "success" ? res.data.data || [] : [];
      } catch (error) {
        common_vendor.index.__f__("error", "at components/goods-search/goods-search.vue:89", "搜索失败:", error);
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
    };
    const cancel = () => {
      results.value = [];
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: !__props.hiddenIcon
      }, !__props.hiddenIcon ? {
        b: common_assets._imports_0$6
      } : {}, {
        c: inputValue.value,
        d: common_vendor.o(onSearchInput),
        e: __props.fontSize || "22rpx",
        f: results.value.length > 0
      }, results.value.length > 0 ? {
        g: common_assets._imports_1$6,
        h: common_vendor.o(cancel)
      } : {}, {
        i: common_vendor.n(_ctx.$attrs.class),
        j: __props.background || "#fff",
        k: results.value.length > 0
      }, results.value.length > 0 ? {
        l: common_vendor.f(results.value, (item, k0, i0) => {
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
        m: __props.width
      } : {});
    };
  }
};
wx.createComponent(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/goods-search/goods-search.js.map
