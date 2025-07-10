"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_view_logs2 = common_vendor.resolveComponent("view-logs");
  _easycom_view_logs2();
}
const _easycom_view_logs = () => "../../components/view-logs/view-logs.js";
if (!Math) {
  _easycom_view_logs();
}
const _sfc_main = {
  __name: "permission",
  setup(__props) {
    common_vendor.onMounted(() => {
      common_vendor.index.setNavigationBarTitle({
        title: "用户协议"
      });
    });
    return (_ctx, _cache) => {
      return {};
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/permission/permission.js.map
