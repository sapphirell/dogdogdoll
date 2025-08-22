"use strict";
const common_vendor = require("../../common/vendor.js");
const common_config = require("../../common/config.js");
if (!Array) {
  const _easycom_shmily_drag_image2 = common_vendor.resolveComponent("shmily-drag-image");
  _easycom_shmily_drag_image2();
}
const _easycom_shmily_drag_image = () => "../../components/shmily-drag-image/shmily-drag-image.js";
if (!Math) {
  _easycom_shmily_drag_image();
}
const _sfc_main = {
  __name: "drag-image-test",
  setup(__props) {
    const list = common_vendor.ref([]);
    function getAccountBookData(type) {
      common_vendor.index.__f__("log", "at pages/drag-image-test/drag-image-test.vue:38", common_config.global);
      if (!common_config.global.isLogin) {
        return;
      }
      let token = common_vendor.index.getStorageSync("token");
      let url = common_config.websiteUrl.value + "/with-state/account-book";
      if (type && type !== "全部") {
        url = common_config.websiteUrl.value + "/with-state/account-book?type=" + type;
      }
      common_vendor.index.request({
        url,
        method: "GET",
        header: {
          "Authorization": token
        },
        success: (res) => {
          list.value = res.data.data.account_books;
          common_vendor.index.__f__("log", "at pages/drag-image-test/drag-image-test.vue:58", list.value);
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/drag-image-test/drag-image-test.vue:61", err);
        }
      });
    }
    common_config.asyncGetUserInfo().then((userInfo) => {
      getAccountBookData();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: list.value.length > 0
      }, list.value.length > 0 ? {
        b: common_vendor.o(($event) => list.value = $event),
        c: common_vendor.p({
          ["border-radius"]: "20",
          modelValue: list.value
        })
      } : {});
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/drag-image-test/drag-image-test.js.map
