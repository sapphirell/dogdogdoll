"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _component_transition = common_vendor.resolveComponent("transition");
  _component_transition();
}
const _sfc_main = {
  __name: "common-modal",
  props: {
    visible: Boolean
  },
  emits: ["update:visible"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const closeModal = () => {
      common_vendor.index.__f__("log", "at components/common-modal/common-modal.vue:27", props.visible);
      emit("update:visible", false);
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.visible
      }, __props.visible ? {
        b: common_vendor.o(() => {
        }),
        c: common_vendor.o(closeModal)
      } : {}, {
        d: common_vendor.p({
          name: "modal-fade"
        })
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d7656854"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/common-modal/common-modal.js.map
