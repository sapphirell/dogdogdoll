"use strict";
const common_vendor = require("../../../common/vendor.js");
require("../../../common/config.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "artist_setting",
  setup(__props) {
    common_vendor.ref("");
    common_vendor.ref({});
    const navigateTo = (type) => {
      let url = "";
      switch (type) {
        case "makeupGallery":
          url = "/pages/creator_base/set_showcase/set_showcase";
          break;
        case "wigGallery":
          common_vendor.index.showToast({
            title: "将在下一个版本支持",
            icon: "none"
          });
          break;
        case "profileEdit":
          url = "/pages/creator_base/artist_info/artist_info";
          break;
        case "orderPlan":
          url = "/pages/creator_base/order_plane/order_plane";
          break;
        default:
          return;
      }
      common_vendor.index.navigateTo({
        url
      });
    };
    common_vendor.onMounted(() => {
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          type: "color",
          size: "24",
          color: "#3c3b48"
        }),
        b: common_vendor.p({
          type: "arrowright",
          size: "20",
          color: "#999"
        }),
        c: common_vendor.o(($event) => navigateTo("makeupGallery")),
        d: common_vendor.p({
          type: "headphones",
          size: "24",
          color: "#3c3b48"
        }),
        e: common_vendor.p({
          type: "arrowright",
          size: "20",
          color: "#999"
        }),
        f: common_vendor.o(($event) => navigateTo("wigGallery")),
        g: common_vendor.p({
          type: "person",
          size: "24",
          color: "#3c3b48"
        }),
        h: common_vendor.p({
          type: "arrowright",
          size: "20",
          color: "#999"
        }),
        i: common_vendor.o(($event) => navigateTo("profileEdit")),
        j: common_vendor.p({
          type: "calendar",
          size: "24",
          color: "#3c3b48"
        }),
        k: common_vendor.p({
          type: "arrowright",
          size: "20",
          color: "#999"
        }),
        l: common_vendor.o(($event) => navigateTo("orderPlan"))
      };
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/creator_base/artist_setting/artist_setting.js.map
