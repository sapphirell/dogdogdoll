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
    },
    // 新增：是否显示索引选择器
    showIndexSelector: {
      type: Boolean,
      default: false
    },
    // 新增：索引选项配置
    indexOptions: {
      type: Array,
      default: () => [
        { label: "店铺", value: "" },
        { label: "妆师", value: "bjd_artist" },
        { label: "毛娘", value: "hairstylist" }
      ]
    },
    // 新增：默认选中的索引
    defaultIndex: {
      type: String,
      default: ""
    }
  },
  emits: ["select", "close-associate", "index-change"],
  setup(__props, { emit: __emit }) {
    var _a;
    const props = __props;
    const emit = __emit;
    const searchTerm = common_vendor.ref("");
    const results = common_vendor.ref([]);
    const currentIndex = common_vendor.ref(props.defaultIndex || (((_a = props.indexOptions[0]) == null ? void 0 : _a.value) || ""));
    const currentIndexLabel = common_vendor.computed(() => {
      const option = props.indexOptions.find((opt) => opt.value === currentIndex.value);
      return option ? option.label : "选择类型";
    });
    const indexLabels = common_vendor.computed(() => {
      return props.indexOptions.map((opt) => opt.label);
    });
    const selectedIndex = common_vendor.computed(() => {
      return props.indexOptions.findIndex((opt) => opt.value === currentIndex.value);
    });
    const closeAssociate = () => {
      common_vendor.index.__f__("log", "at components/common-search/common-search.vue:119", "开始通知", searchTerm.value);
      results.value = [];
      emit("close-associate", searchTerm.value);
    };
    const handleIndexChange = (e) => {
      var _a2;
      const index = e.detail.value;
      currentIndex.value = ((_a2 = props.indexOptions[index]) == null ? void 0 : _a2.value) || "";
      emit("index-change", currentIndex.value);
      if (searchTerm.value.trim() !== "") {
        onSearchInput();
      }
    };
    const onSearchInput = async () => {
      if (searchTerm.value.trim() === "") {
        results.value = [];
        return;
      }
      emit("select", 0, searchTerm.value);
      let url = `${common_config.websiteUrl.value}/search-brand?search=${encodeURIComponent(searchTerm.value)}`;
      if (currentIndex.value) {
        url += `&index=${currentIndex.value}`;
      }
      try {
        const res = await common_vendor.index.request({
          url,
          method: "GET",
          header: {
            "Content-Type": "application/json"
          }
        });
        common_vendor.index.__f__("log", "at components/common-search/common-search.vue:161", "请求结果:", res.data);
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
        common_vendor.index.__f__("error", "at components/common-search/common-search.vue:176", "请求错误:", error);
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
        b: common_assets._imports_0$15
      } : {}, {
        c: __props.showIndexSelector
      }, __props.showIndexSelector ? {
        d: common_vendor.t(currentIndexLabel.value),
        e: selectedIndex.value,
        f: indexLabels.value,
        g: common_vendor.o(handleIndexChange)
      } : {}, {
        h: common_vendor.o([($event) => searchTerm.value = $event.detail.value, onSearchInput]),
        i: searchTerm.value,
        j: results.value.length > 0
      }, results.value.length > 0 ? common_vendor.e({
        k: results.value.length > 0 && searchTerm.value.length < 5
      }, results.value.length > 0 && searchTerm.value.length < 5 ? {} : {}, {
        l: common_assets._imports_1$5,
        m: common_vendor.o(cancel)
      }) : {}, {
        n: common_vendor.n(_ctx.$attrs.class),
        o: __props.background || "#fff",
        p: results.value.length > 0
      }, results.value.length > 0 ? {
        q: common_vendor.o(closeAssociate),
        r: common_vendor.f(results.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.name),
            b: item.id,
            c: common_vendor.o(($event) => onTap(item.id, item.name), item.id)
          };
        }),
        s: __props.width
      } : {});
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e5a069da"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/common-search/common-search.js.map
