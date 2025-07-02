"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "custom-picker",
  props: {
    dataList: {
      type: Array,
      required: true
    },
    margin: {
      type: String,
      default: "0"
    }
  },
  emits: ["select"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const inputValue = common_vendor.ref("");
    const isOpen = common_vendor.ref(false);
    const filteredList = common_vendor.computed(() => {
      return props.dataList.filter(
        (item) => item.name.toLowerCase().includes(inputValue.value.toLowerCase())
      );
    });
    const callbackValue = () => {
      emit("select", 0, inputValue.value);
    };
    const toggleOpen = () => {
      isOpen.value = !isOpen.value;
    };
    const selectOption = (item) => {
      inputValue.value = item.name;
      isOpen.value = false;
      emit("select", item.id, item.name);
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(toggleOpen),
        b: common_vendor.o([($event) => inputValue.value = $event.detail.value, callbackValue]),
        c: __props.margin,
        d: inputValue.value,
        e: isOpen.value
      }, isOpen.value ? {
        f: common_vendor.f(filteredList.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.name),
            b: item.id,
            c: common_vendor.o(($event) => selectOption(item), item.id)
          };
        })
      } : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-edb43aad"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/custom-picker/custom-picker.js.map
