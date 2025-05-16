"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const common_config = require("../../common/config.js");
const _sfc_main = {
  __name: "goods-search",
  props: {
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
    }
  },
  emits: ["select"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const searchTerm = common_vendor.ref("");
    const results = common_vendor.ref([]);
    const onSearchInput = async () => {
      var _a;
      if (!searchTerm.value.trim()) {
        results.value = [];
        return;
      }
      try {
        const res = await common_vendor.index.request({
          url: common_config.websiteUrl + `/search-goods?search=${encodeURIComponent(searchTerm.value)}`,
          method: "GET"
        });
        results.value = ((_a = res.data) == null ? void 0 : _a.status) === "success" ? res.data.data || [] : [];
      } catch (error) {
        common_vendor.index.__f__("error", "at components/goods-search/goods-search.vue:85", "搜索失败:", error);
        results.value = [];
      }
    };
    const onTap = (goods) => {
      if (props.mode === "jump") {
        common_vendor.index.navigateTo({
          url: `/pages/goods/goods?goods_id=${goods.id}`
        });
      } else if (props.mode === "fill") {
        emit("select", goods);
        searchTerm.value = "";
        results.value = [];
      }
    };
    const cancel = () => {
      searchTerm.value = "";
      results.value = [];
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_assets._imports_0$6,
        b: common_vendor.o([($event) => searchTerm.value = $event.detail.value, onSearchInput]),
        c: __props.fontSize || "22rpx",
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
        l: __props.width
      } : {});
    };
  }
};
wx.createComponent(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/goods-search/goods-search.js.map
