"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_bottom_popup2 = common_vendor.resolveComponent("bottom-popup");
  (_easycom_uni_icons2 + _easycom_bottom_popup2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_bottom_popup = () => "../bottom-popup/bottom-popup.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_bottom_popup)();
}
const _sfc_main = {
  __name: "cascade-multi-select",
  props: {
    show: {
      type: Boolean,
      default: false
    },
    sizeData: {
      type: Object,
      default: () => ({})
    },
    initialSelection: {
      type: Array,
      default: () => []
    }
  },
  emits: ["close", "confirm"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const activeCategory = common_vendor.ref("");
    const selectedSizes = common_vendor.ref([]);
    const mainCategories = common_vendor.computed(() => {
      return Object.keys(props.sizeData).map((category) => ({
        label: category,
        value: category,
        count: props.sizeData[category].length
      }));
    });
    const currentSizes = common_vendor.computed(() => {
      if (!activeCategory.value)
        return [];
      return props.sizeData[activeCategory.value] || [];
    });
    const resetSelection = () => {
      activeCategory.value = "";
      selectedSizes.value = [];
    };
    const closePopup = () => {
      emit("close");
    };
    const selectCategory = (category) => {
      activeCategory.value = category.value;
    };
    const toggleSelect = (size, category) => {
      const index = selectedSizes.value.findIndex(
        (item) => item.category === category && item.size === size
      );
      if (index >= 0) {
        selectedSizes.value.splice(index, 1);
      } else {
        selectedSizes.value.push({
          category,
          size
        });
      }
    };
    const isSelected = (size, category) => {
      return selectedSizes.value.some(
        (item) => item.category === category && item.size === size
      );
    };
    const confirmSelection = () => {
      emit("confirm", [...selectedSizes.value]);
      closePopup();
    };
    common_vendor.watch(() => props.show, (newVal) => {
      if (newVal) {
        if (props.initialSelection && props.initialSelection.length > 0) {
          selectedSizes.value = [...props.initialSelection];
          if (props.initialSelection[0]) {
            activeCategory.value = props.initialSelection[0].category;
          }
        } else {
          resetSelection();
          if (mainCategories.value.length > 0) {
            activeCategory.value = mainCategories.value[0].value;
          }
        }
      }
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(resetSelection),
        b: common_vendor.o(closePopup),
        c: common_vendor.p({
          type: "closeempty",
          size: "24",
          color: "#666"
        }),
        d: common_vendor.f(mainCategories.value, (category, index, i0) => {
          return {
            a: common_vendor.t(category.label),
            b: common_vendor.t(category.count),
            c: index,
            d: activeCategory.value === category.value ? 1 : "",
            e: common_vendor.o(($event) => selectCategory(category), index)
          };
        }),
        e: common_vendor.f(currentSizes.value, (size, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(size),
            b: isSelected(size, activeCategory.value)
          }, isSelected(size, activeCategory.value) ? {
            c: "1f538290-2-" + i0 + ",1f538290-0",
            d: common_vendor.p({
              type: "checkmarkempty",
              size: "16",
              color: "#65c6d9"
            })
          } : {}, {
            e: index,
            f: isSelected(size, activeCategory.value) ? 1 : "",
            g: common_vendor.o(($event) => toggleSelect(size, activeCategory.value), index)
          });
        }),
        f: common_vendor.t(selectedSizes.value.length),
        g: common_vendor.o(confirmSelection),
        h: common_vendor.o(closePopup),
        i: common_vendor.p({
          show: __props.show
        })
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1f538290"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/cascade-multi-select/cascade-multi-select.js.map
