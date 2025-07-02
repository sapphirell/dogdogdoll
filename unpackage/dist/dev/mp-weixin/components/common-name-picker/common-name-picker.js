"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "common-name-picker",
  props: {
    dataList: {
      type: Array,
      default: () => []
    },
    placeholder: {
      type: String,
      default: "请选择"
    },
    defaultValue: {
      type: String,
      default: ""
    }
  },
  emits: ["select"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const isOpen = common_vendor.ref(false);
    const selectedValue = common_vendor.ref(props.defaultValue);
    const toggleOpen = () => {
      isOpen.value = !isOpen.value;
    };
    const selectItem = (item) => {
      selectedValue.value = item;
      isOpen.value = false;
      emit("select", item);
    };
    common_vendor.onMounted(() => {
      common_vendor.index.__f__("log", "at components/common-name-picker/common-name-picker.vue:69", "初始值", isOpen.value);
      isOpen.value = false;
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(selectedValue.value || __props.placeholder),
        b: common_vendor.p({
          type: "arrowdown",
          size: "16",
          color: "#666"
        }),
        c: isOpen.value ? 1 : "",
        d: common_vendor.o(toggleOpen),
        e: isOpen.value
      }, isOpen.value ? {
        f: common_vendor.o(($event) => toggleOpen())
      } : {}, {
        g: isOpen.value
      }, isOpen.value ? {
        h: common_vendor.f(__props.dataList, (item, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item),
            b: selectedValue.value === item
          }, selectedValue.value === item ? {
            c: "c7d66d43-1-" + i0,
            d: common_vendor.p({
              type: "checkmarkempty",
              size: "18",
              color: "#007AFF"
            })
          } : {}, {
            e: index,
            f: selectedValue.value === item ? 1 : "",
            g: common_vendor.o(($event) => selectItem(item), index)
          });
        })
      } : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c7d66d43"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/common-name-picker/common-name-picker.js.map
