"use strict";
const common_vendor = require("../../common/vendor.js");
const common_config = require("../../common/config.js");
if (!Array) {
  const _easycom_common_name_picker2 = common_vendor.resolveComponent("common-name-picker");
  const _easycom_common_search2 = common_vendor.resolveComponent("common-search");
  const _easycom_custom_picker2 = common_vendor.resolveComponent("custom-picker");
  const _easycom_common_modal2 = common_vendor.resolveComponent("common-modal");
  (_easycom_common_name_picker2 + _easycom_common_search2 + _easycom_custom_picker2 + _easycom_common_modal2)();
}
const _easycom_common_name_picker = () => "../common-name-picker/common-name-picker.js";
const _easycom_common_search = () => "../common-search/common-search.js";
const _easycom_custom_picker = () => "../custom-picker/custom-picker.js";
const _easycom_common_modal = () => "../common-modal/common-modal.js";
if (!Math) {
  (_easycom_common_name_picker + _easycom_common_search + _easycom_custom_picker + _easycom_common_modal)();
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
            common_vendor.index.__f__("error", "at components/relation-picker/relation-picker.vue:106", "商品详情获取失败", err);
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
        common_vendor.index.__f__("error", "at components/relation-picker/relation-picker.vue:123", "获取商品失败", error);
      }
    };
    const handleGoodsSelect = async (goodsId, goodsName) => {
      var _a;
      try {
        const detail = await getGoodsInfo(goodsId);
        selectedData.value.goods = {
          id: goodsId,
          name: goodsName,
          image: ((_a = detail.goods_images) == null ? void 0 : _a[0]) || ""
        };
      } catch (error) {
        common_vendor.index.__f__("error", "at components/relation-picker/relation-picker.vue:137", "商品选择失败", error);
      }
    };
    function getGoods(id) {
      common_vendor.index.request({
        url: common_config.websiteUrl + "/goods-name-list?id=" + id,
        method: "GET",
        timeout: 5e3,
        success: (res) => {
          common_vendor.index.__f__("log", "at components/relation-picker/relation-picker.vue:148", res.data.data);
          goodsList.value = res.data.data;
          common_vendor.index.__f__("log", "at components/relation-picker/relation-picker.vue:150", goodsList.value);
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at components/relation-picker/relation-picker.vue:154", err);
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
          goods_image: ((_a = goodsDetail.goods_images) == null ? void 0 : _a[0]) || "",
          goods_id: selectedData.value.goods.id,
          brand_id: selectedData.value.brand.id,
          brand_name: selectedData.value.brand.name,
          type: selectedData.value.type
        };
        emit("confirm", resultData);
        closePicker();
      } catch (error) {
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
    const closePicker = () => {
      internalVisible.value = false;
      selectedData.value = {
        type: null,
        brand: null,
        goods: null
      };
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(handleTypeSelect),
        b: common_vendor.p({
          dataList: __props.typeList,
          placeholder: "选择类型"
        }),
        c: common_vendor.o(handleBrandSelect),
        d: common_vendor.p({
          mode: "fill",
          width: "520rpx",
          background: "#f8f8f8"
        }),
        e: common_vendor.o(handleGoodsSelect),
        f: common_vendor.p({
          dataList: goodsList.value
        }),
        g: common_vendor.o(handleCancel),
        h: common_vendor.o(handleConfirm),
        i: common_vendor.o(handleModalVisibilityChange),
        j: common_vendor.p({
          visible: internalVisible.value
        })
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-0488033a"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/relation-picker/relation-picker.js.map
