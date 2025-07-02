"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const common_config = require("../../common/config.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_common_modal2 = common_vendor.resolveComponent("common-modal");
  (_easycom_uni_icons2 + _easycom_common_modal2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_common_modal = () => "../common-modal/common-modal.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_common_modal)();
}
const storageKey = "privacyAgreementStatus";
const _sfc_main = {
  __name: "privacy-permission-modal",
  setup(__props) {
    const showModal = common_vendor.ref(false);
    const hasAgreed = () => {
      let storageContent = common_vendor.index.getStorageSync(storageKey);
      common_vendor.index.__f__("log", "at components/privacy-permission-modal/privacy-permission-modal.vue:53", storageContent);
      return storageContent === "agreed";
    };
    const checkAndShow = () => {
      if (hasAgreed()) {
        common_vendor.index.__f__("log", "at components/privacy-permission-modal/privacy-permission-modal.vue:60", "用户已经同意过隐私政策");
        return;
      }
      const scene = common_config.getScene();
      if (scene !== 2 && scene !== 3) {
        common_vendor.index.__f__("log", "at components/privacy-permission-modal/privacy-permission-modal.vue:65", "并非安卓或iOS客户端");
        return;
      }
      setTimeout(() => {
        showModal.value = true;
      }, 1e3);
    };
    const goToPrivacy = () => {
      common_vendor.index.navigateTo({
        url: "/pages/private/private"
      });
    };
    const goToPermissions = () => {
      common_vendor.index.navigateTo({
        url: "/pages/permission/permission"
      });
    };
    const handleAgree = () => {
      common_vendor.index.setStorageSync(storageKey, "agreed");
      showModal.value = false;
    };
    const handleDisagree = () => {
      common_vendor.index.exitApp();
    };
    common_vendor.onMounted(() => {
      checkAndShow();
    });
    return (_ctx, _cache) => {
      return {
        a: common_assets._imports_0$1,
        b: common_vendor.p({
          type: "info",
          size: "18",
          color: "#80afff"
        }),
        c: common_vendor.p({
          type: "arrowright",
          size: "16",
          color: "#999"
        }),
        d: common_vendor.o(goToPrivacy),
        e: common_vendor.p({
          type: "locked",
          size: "18",
          color: "#80afff"
        }),
        f: common_vendor.p({
          type: "arrowright",
          size: "16",
          color: "#999"
        }),
        g: common_vendor.o(goToPermissions),
        h: common_vendor.o(handleDisagree),
        i: common_vendor.o(handleAgree),
        j: common_vendor.o(($event) => showModal.value = $event),
        k: common_vendor.p({
          top: "20vh",
          height: "auto",
          closeable: false,
          visible: showModal.value
        })
      };
    };
  }
};
wx.createComponent(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/privacy-permission-modal/privacy-permission-modal.js.map
