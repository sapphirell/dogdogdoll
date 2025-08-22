"use strict";
const common_vendor = require("../../common/vendor.js");
const common_config = require("../../common/config.js");
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
      type: Boolean,
      default: true
    }
  },
  emits: ["update:visible"],
  setup(__props, { emit: __emit }) {
    const isApp = common_vendor.ref(false);
    const props = __props;
    let modeClass = common_vendor.ref(["fade", "zoom-in"]);
    const emit = __emit;
    const maskStyle = common_vendor.computed(() => {
      return {
        backgroundColor: isApp.value ? "rgba(0, 0, 0, 0)" : "rgba(0, 0, 0, 0.5)"
      };
    });
    const containerStyle = common_vendor.computed(() => ({
      top: formatValue(props.top),
      height: formatValue(props.height)
    }));
    const moveHandle = () => false;
    const formatValue = (val) => {
      if (typeof val === "number")
        return `${val}px`;
      if (/\d$/.test(val))
        return `${val}px`;
      return val;
    };
    const closeModal = () => {
      if (props.closeable) {
        emit("update:visible", false);
      }
    };
    common_vendor.onMounted(() => {
      const scene = common_config.getScene();
      isApp.value = scene === 2 || scene === 3;
    });
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
        e: common_vendor.o(closeModal),
        f: common_vendor.o(moveHandle),
        g: common_vendor.s(maskStyle.value)
      } : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d7656854"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/common-modal/common-modal.js.map
