"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  __name: "loading-toast",
  props: {
    show: {
      type: Boolean,
      default: false
    },
    text: {
      type: String,
      default: "To Connect The Love..."
    }
  },
  setup(__props) {
    const props = __props;
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: props.show
      }, props.show ? common_vendor.e({
        b: common_assets._imports_0$13,
        c: __props.text
      }, __props.text ? {
        d: common_vendor.t(__props.text)
      } : {}) : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-3ed615fd"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/loading-toast/loading-toast.js.map
