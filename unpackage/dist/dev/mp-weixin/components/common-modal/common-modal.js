"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_transition2 = common_vendor.resolveComponent("uni-transition");
  _easycom_uni_transition2();
}
const _easycom_uni_transition = () => "../../uni_modules/uni-transition/components/uni-transition/uni-transition.js";
if (!Math) {
  _easycom_uni_transition();
}
const _sfc_main = {
  __name: "common-modal",
  props: {
    visible: Boolean,
    // 新增参数
    top: {
      type: [String, Number],
      default: "30%"
    },
    width: {
      type: [String, Number],
      default: "80%"
    },
    height: {
      type: [String, Number],
      default: "auto"
    },
    closeable: {
      // 点击遮罩层是否可以关闭
      type: Boolean,
      default: true
    }
  },
  emits: ["update:visible"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    let modeClass = common_vendor.ref(["fade", "zoom-in"]);
    const emit = __emit;
    const containerStyle = common_vendor.computed(() => ({
      top: formatValue(props.top),
      // width: formatValue(props.width),
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
      if (props.closeable) {
        emit("update:visible", false);
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.visible
      }, __props.visible ? {
        b: common_vendor.s(containerStyle.value),
        c: common_vendor.o(() => {
        }),
        d: common_vendor.p({
          ["mode-class"]: common_vendor.unref(modeClass),
          show: __props.visible
        }),
        e: common_vendor.o(closeModal)
      } : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d7656854"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/common-modal/common-modal.js.map
