"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "check-box",
  props: {
    // 默认状态
    modelValue: {
      type: Boolean,
      default: false
    },
    // 组件高度
    height: {
      type: Number,
      default: 50
    },
    // 激活颜色
    activeColor: {
      type: String,
      default: "#5e7bf0"
    },
    // 非激活颜色
    inactiveColor: {
      type: String,
      default: "#f0f2f7"
    },
    // 滑块颜色
    sliderColor: {
      type: String,
      default: "linear-gradient(135deg, #a6e9f7, #1ed1e1);"
    },
    // 激活文本颜色
    activeTextColor: {
      type: String,
      default: "#ffffff"
    },
    // 非激活文本颜色
    inactiveTextColor: {
      type: String,
      default: "#666666"
    },
    // 激活状态文本
    activeText: {
      type: String,
      default: "是"
    },
    // 非激活状态文本
    inactiveText: {
      type: String,
      default: "否"
    }
  },
  emits: ["update:modelValue", "change"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const isActive = common_vendor.ref(props.modelValue);
    const containerWidth = common_vendor.ref(200);
    const sliderWidth = common_vendor.ref(0);
    const sliderActivePosition = common_vendor.computed(() => {
      return containerWidth.value - sliderWidth.value - 4;
    });
    const sliderInactivePosition = common_vendor.computed(() => {
      return 4;
    });
    const toggle = () => {
      isActive.value = !isActive.value;
      emit("update:modelValue", isActive.value);
      emit("change", isActive.value);
    };
    common_vendor.watch(() => props.modelValue, (newVal) => {
      isActive.value = newVal;
    });
    common_vendor.onMounted(() => {
      setTimeout(() => {
        const query = common_vendor.index.createSelectorQuery();
        query.select(".slide-radio").boundingClientRect((data) => {
          if (data) {
            containerWidth.value = data.width;
            sliderWidth.value = data.width / 2 - 8;
          }
        }).exec();
      }, 100);
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(isActive.value ? __props.activeText : __props.inactiveText),
        b: `translateX(${isActive.value ? sliderActivePosition.value : sliderInactivePosition.value}px)`,
        c: __props.sliderColor,
        d: common_vendor.t(__props.inactiveText),
        e: __props.inactiveTextColor,
        f: common_vendor.t(__props.activeText),
        g: __props.activeTextColor,
        h: __props.inactiveColor,
        i: __props.height + "px",
        j: common_vendor.o(toggle)
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-522c3538"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/check-box/check-box.js.map
