"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "BottomPopup",
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    closePopup() {
      this.$emit("close");
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.show
  }, $props.show ? {
    b: $props.show ? 1 : "",
    c: common_vendor.o((...args) => $options.closePopup && $options.closePopup(...args))
  } : {}, {
    d: $props.show ? 1 : ""
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-f4186061"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/bottom-popup/bottom-popup.js.map
