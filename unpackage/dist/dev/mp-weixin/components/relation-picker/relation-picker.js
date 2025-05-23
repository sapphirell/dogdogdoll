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
    const internalVisible = common_vendor.ref(false);
    const searchKeyword = common_vendor.ref("");
    const isFuzzyMode = common_vendor.ref(false);
    const switchMode = (isFuzzy) => {
      common_vendor.index.__f__("log", "at components/relation-picker/relation-picker.vue:104", isFuzzy);
      isFuzzyMode.value = isFuzzy;
      searchKeyword.value = "";
      selectedData.value = {
        type: null,
        brand: null,
        goods: null
      };
      goodsList.value = [];
    };
    const handleFuzzySelect = async (goods) => {
      var _a;
      try {
        const detail = await getGoodsInfo(goods.id);
        selectedData.value = {
          type: detail.type || "其他",
          brand: {
            id: detail.brand_id,
            name: detail.brand_name
          },
          goods: {
            id: goods.id,
            name: goods.name,
            image: ((_a = detail == null ? void 0 : detail.goods_images) == null ? void 0 : _a[0]) || ""
          }
        };
      } catch (error) {
        common_vendor.index.__f__("error", "at components/relation-picker/relation-picker.vue:133", "商品信息获取失败", error);
        common_vendor.index.showToast({
          title: "商品信息获取失败",
          icon: "none"
        });
      }
    };
    const closePicker = () => {
      internalVisible.value = false;
      searchKeyword.value = "";
      selectedData.value = {
        type: null,
        brand: null,
        goods: null
      };
    };
    common_vendor.watch(() => props.visible, (val) => {
      internalVisible.value = val;
    });
    common_vendor.watch(internalVisible, (val) => {
      emit("update:visible", val);
    });
    const selectedData = common_vendor.ref({
      type: null,
      brand: null,
      goods: null
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
            common_vendor.index.__f__("error", "at components/relation-picker/relation-picker.vue:190", "商品详情获取失败", err);
            reject(err);
          }
        });
      });
    };
    const handleBrandSelect = (brandId, brandName) => {
      selectedData.value.brand = {
        id: brandId,
        name: brandName
      };
      try {
        getGoods(brandId);
      } catch (error) {
        common_vendor.index.__f__("error", "at components/relation-picker/relation-picker.vue:207", "获取商品失败", error);
      }
    };
    const handleGoodsSelect = async (goodsId, goodsName) => {
      var _a;
      try {
        selectedData.value.goods = null;
        const detail = await getGoodsInfo(goodsId);
        if (!detail) {
          throw new Error("未找到商品信息");
        }
        selectedData.value.goods = {
          id: goodsId,
          name: goodsName,
          image: ((_a = detail == null ? void 0 : detail.goods_images) == null ? void 0 : _a[0]) || ""
        };
      } catch (error) {
        common_vendor.index.__f__("error", "at components/relation-picker/relation-picker.vue:226", "商品选择失败", error);
        common_vendor.index.showToast({
          title: "商品信息获取失败，请重新选择",
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
          common_vendor.index.__f__("log", "at components/relation-picker/relation-picker.vue:241", res.data.data);
          goodsList.value = res.data.data;
          common_vendor.index.__f__("log", "at components/relation-picker/relation-picker.vue:243", goodsList.value);
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at components/relation-picker/relation-picker.vue:247", err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        }
      });
    }
    const handleConfirm = async () => {
      var _a;
      try {
        const goodsDetail = await getGoodsInfo(selectedData.value.goods.id);
        const resultData = {
          ...selectedData.value,
          goods_image: ((_a = goodsDetail == null ? void 0 : goodsDetail.goods_images) == null ? void 0 : _a[0]) || "",
          goods_id: selectedData.value.goods.id,
          brand_id: selectedData.value.brand.id,
          brand_name: selectedData.value.brand.name,
          type: selectedData.value.type
        };
        emit("confirm", resultData);
        closePicker();
      } catch (error) {
        common_vendor.index.__f__("error", "at components/relation-picker/relation-picker.vue:275", "商品信息获取失败", error);
        common_vendor.index.showToast({
          title: "商品信息获取失败",
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
        a: !isFuzzyMode.value
      }, !isFuzzyMode.value ? {
        b: common_vendor.p({
          type: "search",
          size: "18",
          color: "#fff"
        }),
        c: common_vendor.o(($event) => switchMode(true))
      } : {}, {
        d: isFuzzyMode.value
      }, isFuzzyMode.value ? {
        e: common_vendor.p({
          type: "list",
          size: "18",
          color: "#fff"
        }),
        f: common_vendor.o(($event) => switchMode(false))
      } : {}, {
        g: isFuzzyMode.value
      }, isFuzzyMode.value ? {
        h: common_vendor.o(handleTypeSelect),
        i: common_vendor.p({
          dataList: __props.typeList,
          placeholder: "选择类型"
        }),
        j: common_vendor.o(handleBrandSelect),
        k: common_vendor.p({
          mode: "fill",
          width: "520rpx",
          background: "#f8f8f8"
        }),
        l: common_vendor.o(handleGoodsSelect),
        m: common_vendor.p({
          dataList: goodsList.value
        })
      } : {
        n: common_vendor.o(handleFuzzySelect),
        o: common_vendor.o(($event) => searchKeyword.value = $event),
        p: common_vendor.p({
          mode: "fill",
          width: "520rpx",
          background: "#f8f8f8",
          ["show-icon"]: false,
          modelValue: searchKeyword.value
        })
      }, {
        q: common_vendor.o(handleCancel),
        r: common_vendor.o(handleConfirm),
        s: common_vendor.o(handleModalVisibilityChange),
        t: common_vendor.p({
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
