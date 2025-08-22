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
  watch: {
    show(newVal) {
      if (typeof common_vendor.index === "undefined")
        return;
      const platform = common_vendor.index.getSystemInfoSync().platform;
      const isApp = platform === "android" || platform === "ios";
      if (isApp) {
        if (newVal) {
          common_vendor.index.hideTabBar();
        } else {
          common_vendor.index.showTabBar();
        }
      }
    }
  },
  methods: {
    closePopup() {
      this.$emit("close");
    },
    moveHandle() {
      return false;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.show
  }, $props.show ? {
    b: $props.show ? 1 : "",
    c: common_vendor.o((...args) => $options.closePopup && $options.closePopup(...args)),
    d: common_vendor.o((...args) => $options.moveHandle && $options.moveHandle(...args))
  } : {}, {
    e: $props.show ? 1 : "",
    f: common_vendor.o((...args) => $options.moveHandle && $options.moveHandle(...args))
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-f4186061"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/bottom-popup/bottom-popup.js.map
