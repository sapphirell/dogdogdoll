"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _component_transition = common_vendor.resolveComponent("transition");
  _component_transition();
}
const _sfc_main = {
  __name: "common-modal",
  props: {
    visible: Boolean,
    // 新增参数
    top: {
      type: [String, Number],
      default: "20%"
    },
    width: {
      type: [String, Number],
      default: "80%"
    },
    height: {
      type: [String, Number],
      default: "auto"
    }
  },
  emits: ["update:visible"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const containerStyle = common_vendor.computed(() => ({
      top: formatValue(props.top),
      width: formatValue(props.width),
      height: formatValue(props.height)
    }));
    const formatValue = (val) => {
      if (typeof val === "number") {
        return `${val}px`;
      }
      if (/\d$/.test(val)) {
        return `${val}px`;
      }
      return val;
    };
    const closeModal = () => {
      emit("update:visible", false);
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.visible
      }, __props.visible ? {
        b: common_vendor.s(containerStyle.value),
        c: common_vendor.o(() => {
        }),
        d: common_vendor.o(closeModal)
      } : {}, {
        e: common_vendor.p({
          name: "modal-fade"
        })
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d7656854"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/common-modal/common-modal.js.map
