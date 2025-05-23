"use strict";
const common_vendor = require("../../common/vendor.js");
const common_config = require("../../common/config.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_common_name_picker2 = common_vendor.resolveComponent("common-name-picker");
  const _easycom_common_search2 = common_vendor.resolveComponent("common-search");
  const _easycom_custom_picker2 = common_vendor.resolveComponent("custom-picker");
  const _easycom_goods_search2 = common_vendor.resolveComponent("goods-search");
  const _easycom_common_modal2 = common_vendor.resolveComponent("common-modal");
  (_easycom_uni_icons2 + _easycom_common_name_picker2 + _easycom_common_search2 + _easycom_custom_picker2 + _easycom_goods_search2 + _easycom_common_modal2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_common_name_picker = () => "../common-name-picker/common-name-picker.js";
const _easycom_common_search = () => "../common-search/common-search.js";
const _easycom_custom_picker = () => "../custom-picker/custom-picker.js";
const _easycom_goods_search = () => "../goods-search/goods-search.js";
const _easycom_common_modal = () => "../common-modal/common-modal.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_common_name_picker + _easycom_common_search + _easycom_custom_picker + _easycom_goods_search + _easycom_common_modal)();
}
const _sfc_main = {
  __name: "relation-picker",
  props: {
    typeList: {
      type: Array,
      default: () => []
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: [
    "update:visible",
    "confirm",
    "cancel"
  ],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const goodsList = common_vendor.ref([]);
    const typePicker = common_vendor.ref();
    const brandSearch = common_vendor.ref();
    const goodsPicker = common_vendor.ref();
    const fuzzySearch = common_vendor.ref();
    const internalVisible = common_vendor.ref(false);
    const isFuzzyMode = common_vendor.ref(true);
    const selectedData = common_vendor.ref({
      type: null,
      brand: {
        id: 0,
        name: ""
      },
      goods: {
        id: 0,
        name: "",
        image: ""
      }
    });
    const searchKeyword = common_vendor.ref("");
    const switchMode = (isFuzzy) => {
      isFuzzyMode.value = isFuzzy;
      resetAllComponents();
      selectedData.value = {
        type: null,
        brand: {
          id: 0,
          name: ""
        },
        goods: {
          id: 0,
          name: "",
          image: ""
        }
      };
    };
    const handleComponentToggle = (component) => {
      const components = {
        type: typePicker,
        brand: brandSearch,
        goods: goodsPicker,
        fuzzy: fuzzySearch
      };
      Object.entries(components).forEach(([key, ref]) => {
        var _a;
        if (key !== component && ((_a = ref.value) == null ? void 0 : _a.close)) {
          ref.value.close();
        }
      });
    };
    const resetAllComponents = () => {
      [typePicker, brandSearch, goodsPicker, fuzzySearch].forEach((comp) => {
        var _a;
        if ((_a = comp.value) == null ? void 0 : _a.reset)
          comp.value.reset();
      });
    };
    const handleFuzzySelect = async (goods) => {
      var _a;
      try {
        if (!(goods == null ? void 0 : goods.id)) {
          searchKeyword.value = goods.name;
          selectedData.value = {
            type: "未知类型",
            brand: {
              id: 0,
              name: ""
            },
            goods: {
              id: 0,
              name: goods.name,
              image: ""
            }
          };
          return;
        }
        const detail = await getGoodsInfo(goods.id);
        searchKeyword.value = goods.name;
        selectedData.value = {
          type: detail.type || "未知类型",
          brand: {
            id: detail.brand_id || 0,
            name: detail.brand_name || ""
          },
          goods: {
            id: goods.id,
            name: goods.name,
            image: ((_a = detail == null ? void 0 : detail.goods_images) == null ? void 0 : _a[0]) || ""
          }
        };
      } catch (error) {
        common_vendor.index.__f__("error", "at components/relation-picker/relation-picker.vue:202", "商品信息获取失败", error);
        common_vendor.index.showToast({
          title: "详细信息获取失败，已保存基本信息",
          icon: "none"
        });
        searchKeyword.value = goods.name;
        selectedData.value = {
          type: "未知类型",
          brand: {
            id: 0,
            name: ""
          },
          goods: {
            id: (goods == null ? void 0 : goods.id) || 0,
            name: goods.name,
            image: ""
          }
        };
      }
    };
    const closePicker = () => {
      internalVisible.value = false;
      searchKeyword.value = "";
      resetAllComponents();
      common_vendor.nextTick$1(() => {
        selectedData.value = {
          type: null,
          brand: {
            id: 0,
            name: ""
          },
          goods: {
            id: 0,
            name: "",
            image: ""
          }
        };
      });
    };
    common_vendor.watch(() => props.visible, (val) => {
      internalVisible.value = val;
    });
    common_vendor.watch(internalVisible, (val) => {
      emit("update:visible", val);
    });
    const handleModalVisibilityChange = (newVal) => {
      internalVisible.value = newVal;
      if (!newVal) {
        closePicker();
      }
    };
    const handleTypeSelect = (type) => {
      selectedData.value.type = type;
    };
    const getGoodsInfo = (id) => {
      return new Promise((resolve, reject) => {
        common_vendor.index.request({
          url: common_config.websiteUrl + "/goods?id=" + id,
          method: "GET",
          timeout: 5e3,
          success: (res) => {
            resolve(res.data.data);
          },
          fail: (err) => {
            common_vendor.index.__f__("error", "at components/relation-picker/relation-picker.vue:286", "商品详情获取失败", err);
            reject(err);
          }
        });
      });
    };
    const handleBrandSelect = (id, name) => {
      selectedData.value.brand = {
        id: id || 0,
        name
      };
      if (id)
        getGoods(id);
    };
    const handleGoodsSelect = async (id, name) => {
      var _a;
      try {
        selectedData.value.goods = {
          // 先设置默认值
          id: id || 0,
          name,
          image: ""
        };
        if (id && id !== 0) {
          const detail = await getGoodsInfo(id);
          selectedData.value.goods.image = ((_a = detail == null ? void 0 : detail.goods_images) == null ? void 0 : _a[0]) || "";
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at components/relation-picker/relation-picker.vue:352", "商品信息获取失败", error);
        common_vendor.index.showToast({
          title: "图片信息获取失败，已保存基本信息",
          icon: "none"
        });
      }
    };
    function getGoods(id) {
      common_vendor.index.request({
        url: common_config.websiteUrl + "/goods-name-list?id=" + id,
        method: "GET",
        timeout: 5e3,
        success: (res) => {
          common_vendor.index.__f__("log", "at components/relation-picker/relation-picker.vue:367", res.data.data);
          goodsList.value = res.data.data;
          common_vendor.index.__f__("log", "at components/relation-picker/relation-picker.vue:369", goodsList.value);
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at components/relation-picker/relation-picker.vue:373", err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        }
      });
    }
    const handleConfirm = async () => {
      var _a, _b;
      try {
        let result = null;
        if (isFuzzyMode.value) {
          if (selectedData.value.goods.id && selectedData.value.goods.id !== 0) {
            try {
              const detail = await getGoodsInfo(selectedData.value.goods.id);
              result = {
                isFuzzy: true,
                keyword: searchKeyword.value,
                goods: {
                  id: detail.id || selectedData.value.goods.id,
                  name: detail.goods_name || selectedData.value.goods.name,
                  image: ((_a = detail == null ? void 0 : detail.goods_images) == null ? void 0 : _a[0]) || ""
                },
                brand: {
                  id: detail.brand_id || 0,
                  name: detail.brand_name || ""
                },
                // 添加默认类型
                type: detail.type || "未知类型"
                // 确保这里使用默认值
              };
            } catch (error) {
              common_vendor.index.__f__("error", "at components/relation-picker/relation-picker.vue:435", "商品信息获取失败，使用缓存数据", error);
              result = {
                isFuzzy: true,
                keyword: searchKeyword.value,
                goods: selectedData.value.goods,
                brand: selectedData.value.brand,
                // 确保这里使用默认值
                type: selectedData.value.type || "未知类型"
              };
            }
          } else {
            result = {
              isFuzzy: true,
              keyword: searchKeyword.value,
              goods: {
                id: 0,
                name: searchKeyword.value,
                image: ""
              },
              brand: {
                id: 0,
                name: ""
              },
              // 明确设置默认类型
              type: "未知类型"
            };
          }
        } else {
          common_vendor.index.__f__("log", "at components/relation-picker/relation-picker.vue:465", "jjjjjjjjjjjjjjjj");
          if (selectedData.value.goods.id && selectedData.value.goods.id !== 0) {
            try {
              const detail = await getGoodsInfo(selectedData.value.goods.id);
              selectedData.value.goods.image = ((_b = detail == null ? void 0 : detail.goods_images) == null ? void 0 : _b[0]) || "";
              selectedData.value.type = detail.type || selectedData.value.type;
            } catch (error) {
              common_vendor.index.__f__("error", "at components/relation-picker/relation-picker.vue:474", "商品信息获取失败，使用缓存数据", error);
            }
          }
          if (!selectedData.value.type)
            throw new Error("请选择商品类型");
          if (!selectedData.value.brand.name)
            throw new Error("请填写或选择品牌");
          if (!selectedData.value.goods.name)
            throw new Error("请填写或选择商品");
          result = {
            isFuzzy: false,
            type: selectedData.value.type,
            brand: selectedData.value.brand,
            goods: selectedData.value.goods
          };
        }
        common_vendor.index.__f__("log", "at components/relation-picker/relation-picker.vue:490", "确认数据:", result);
        emit("confirm", result);
        closePicker();
      } catch (error) {
        common_vendor.index.showToast({
          title: error.message,
          icon: "none"
        });
      }
    };
    const handleCancel = () => {
      emit("cancel");
      closePicker();
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: isFuzzyMode.value
      }, isFuzzyMode.value ? {
        b: common_vendor.p({
          type: "search",
          size: "18",
          color: "#fff"
        }),
        c: common_vendor.o(($event) => switchMode(false))
      } : {}, {
        d: !isFuzzyMode.value
      }, !isFuzzyMode.value ? {
        e: common_vendor.p({
          type: "list",
          size: "18",
          color: "#fff"
        }),
        f: common_vendor.o(($event) => switchMode(true))
      } : {}, {
        g: !isFuzzyMode.value
      }, !isFuzzyMode.value ? {
        h: common_vendor.sr(typePicker, "0488033a-3,0488033a-0", {
          "k": "typePicker"
        }),
        i: common_vendor.o(handleTypeSelect),
        j: common_vendor.o(($event) => handleComponentToggle("type")),
        k: common_vendor.p({
          dataList: __props.typeList
        }),
        l: common_vendor.sr(brandSearch, "0488033a-4,0488033a-0", {
          "k": "brandSearch"
        }),
        m: common_vendor.o(handleBrandSelect),
        n: common_vendor.o(($event) => handleComponentToggle("brand")),
        o: common_vendor.p({
          mode: "fill"
        }),
        p: common_vendor.sr(goodsPicker, "0488033a-5,0488033a-0", {
          "k": "goodsPicker"
        }),
        q: common_vendor.o(handleGoodsSelect),
        r: common_vendor.o(($event) => handleComponentToggle("goods")),
        s: common_vendor.p({
          dataList: goodsList.value
        })
      } : {
        t: common_vendor.sr(fuzzySearch, "0488033a-6,0488033a-0", {
          "k": "fuzzySearch"
        }),
        v: common_vendor.o(handleFuzzySelect),
        w: common_vendor.o(($event) => handleComponentToggle("fuzzy")),
        x: common_vendor.o(($event) => searchKeyword.value = $event),
        y: common_vendor.p({
          mode: "fill",
          modelValue: searchKeyword.value
        })
      }, {
        z: common_vendor.o(handleCancel),
        A: common_vendor.o(handleConfirm),
        B: common_vendor.o(handleModalVisibilityChange),
        C: common_vendor.p({
          visible: internalVisible.value,
          top: "3%"
        })
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-0488033a"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/relation-picker/relation-picker.js.map
