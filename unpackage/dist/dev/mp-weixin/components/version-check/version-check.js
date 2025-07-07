"use strict";
const common_vendor = require("../../common/vendor.js");
const common_config = require("../../common/config.js");
if (!Array) {
  const _easycom_common_modal2 = common_vendor.resolveComponent("common-modal");
  _easycom_common_modal2();
}
const _easycom_common_modal = () => "../common-modal/common-modal.js";
if (!Math) {
  _easycom_common_modal();
}
const _sfc_main = {
  __name: "version-check",
  props: {
    // 是否显示已是最新版本的提示
    showUpToDateToast: {
      type: Boolean,
      default: false
    },
    // 当前版本号
    currentVersion: {
      type: String,
      required: true
    },
    // 是否自动检查版本
    autoCheck: {
      type: Boolean,
      default: true
    }
  },
  setup(__props, { expose: __expose }) {
    const props = __props;
    const modalVisible = common_vendor.ref(false);
    const newVersionInfo = common_vendor.ref(null);
    const showUpToDateToast = common_vendor.ref(false);
    const cv = common_vendor.ref("1.0.0");
    const platform = common_vendor.computed(() => {
      const systemInfo = common_vendor.index.getSystemInfoSync();
      return systemInfo.platform || "unknown";
    });
    const formatTime = (timestamp) => {
      if (!timestamp)
        return "未知日期";
      const date = new Date(timestamp * 1e3);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
    };
    const isIgnored = () => {
      const ignoreTime = common_vendor.index.getStorageSync("ignoreUpdateTime");
      common_vendor.index.__f__("log", "at components/version-check/version-check.vue:87", "忽略时间：", ignoreTime);
      if (!ignoreTime)
        return false;
      const now = Date.now();
      common_vendor.index.__f__("log", "at components/version-check/version-check.vue:92", "当前时间", now);
      return now - ignoreTime < 2592e5;
    };
    const checkVersion = async () => {
      try {
        let scene = common_config.getScene();
        if (scene === 1 || scene === 4) {
          common_vendor.index.__f__("log", "at components/version-check/version-check.vue:102", "scene:", scene);
          return;
        }
        if (isIgnored()) {
          common_vendor.index.__f__("log", "at components/version-check/version-check.vue:107", "在忽略期内，不显示更新提示 ");
          return;
        }
        const cv2 = common_vendor.index.getAppBaseInfo().appVersion;
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl}/latest-version?version=1.0.40`,
          method: "GET"
        });
        if (res && res.data) {
          if (res.data.status === "success" && res.data.data) {
            newVersionInfo.value = res.data.data;
            modalVisible.value = true;
          } else if (res.data.status === "failed" && props.showUpToDateToast) {
            showUpToDateToast.value = true;
            setTimeout(() => {
              showUpToDateToast.value = false;
            }, 2e3);
          }
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at components/version-check/version-check.vue:130", "版本检查失败:", err);
      }
    };
    const handleUpdate = () => {
      common_vendor.index.setStorageSync("ignoreUpdateTime", Date.now());
      modalVisible.value = false;
      const platformValue = platform.value.toLowerCase();
      common_vendor.index.__f__("log", "at components/version-check/version-check.vue:143", platformValue);
      let scene = common_config.getScene();
      if (scene === 2) {
        plus.runtime.openURL("https://apps.apple.com/app/id6747564362");
      } else if (scene === 3) {
        plus.runtime.openURL("https://apps.apple.com/app/id6747564362");
      } else {
        common_vendor.index.showModal({
          title: "更新提示",
          content: "请前往应用商店更新最新版本",
          showCancel: false
        });
      }
    };
    const ignoreUpdate = () => {
      common_vendor.index.setStorageSync("ignoreUpdateTime", Date.now());
      modalVisible.value = false;
    };
    __expose({
      checkVersion
    });
    common_vendor.onMounted(() => {
      cv.value = common_vendor.index.getAppBaseInfo().appVersion;
      if (props.autoCheck) {
        setTimeout(() => {
          checkVersion();
        }, 1500);
      }
    });
    return (_ctx, _cache) => {
      var _a, _b, _c;
      return common_vendor.e({
        a: common_vendor.t((_a = newVersionInfo.value) == null ? void 0 : _a.version),
        b: common_vendor.t(),
        c: common_vendor.t(((_b = newVersionInfo.value) == null ? void 0 : _b.note) || "优化用户体验，修复已知问题"),
        d: common_vendor.t(formatTime((_c = newVersionInfo.value) == null ? void 0 : _c.created_at)),
        e: common_vendor.o(ignoreUpdate),
        f: common_vendor.o(handleUpdate),
        g: common_vendor.o(($event) => modalVisible.value = $event),
        h: common_vendor.p({
          visible: modalVisible.value,
          top: "15vh"
        }),
        i: showUpToDateToast.value
      }, showUpToDateToast.value ? {} : {});
    };
  }
};
wx.createComponent(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/version-check/version-check.js.map
