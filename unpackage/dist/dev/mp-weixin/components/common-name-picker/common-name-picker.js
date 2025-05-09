"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _component_transition = common_vendor.resolveComponent("transition");
  _component_transition();
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
    }
  },
  emits: ["select"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const isOpen = common_vendor.ref(false);
    const selectedValue = common_vendor.ref("");
    const toggleOpen = () => {
      isOpen.value = !isOpen.value;
    };
    const selectItem = (item) => {
      selectedValue.value = item;
      isOpen.value = false;
      emit("select", item);
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(selectedValue.value || __props.placeholder),
        b: common_vendor.o(toggleOpen),
        c: isOpen.value
      }, isOpen.value ? {
        d: common_vendor.o(($event) => isOpen.value = false),
        e: common_vendor.f(__props.dataList, (item, index, i0) => {
          return {
            a: common_vendor.t(item),
            b: index,
            c: common_vendor.o(($event) => selectItem(item), index)
          };
        })
      } : {}, {
        f: common_vendor.p({
          name: "slide-fade"
        })
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c7d66d43"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/common-name-picker/common-name-picker.js.map
