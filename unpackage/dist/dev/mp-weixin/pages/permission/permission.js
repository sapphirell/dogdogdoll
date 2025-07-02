"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "permission",
  setup(__props) {
    common_vendor.onMounted(() => {
      common_vendor.index.setNavigationBarTitle({
        title: "权限说明"
      });
    });
    return (_ctx, _cache) => {
      return {};
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/permission/permission.js.map
