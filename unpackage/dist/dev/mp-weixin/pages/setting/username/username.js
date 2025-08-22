"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_config = require("../../../common/config.js");
if (!Array) {
  const _easycom_view_logs2 = common_vendor.resolveComponent("view-logs");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  (_easycom_view_logs2 + _easycom_uni_icons2)();
}
const _easycom_view_logs = () => "../../../components/view-logs/view-logs.js";
const _easycom_uni_icons = () => "../../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_view_logs + _easycom_uni_icons)();
}
const _sfc_main = {
  __name: "username",
  setup(__props) {
    common_vendor.index.setNavigationBarTitle({
      title: "修改用户名"
    });
    const username = common_vendor.ref(common_config.global.userInfo.username || "");
    const isLoading = common_vendor.ref(false);
    const isFormValid = common_vendor.computed(() => {
      return username.value.length >= 2 && username.value !== common_config.global.userInfo.username;
    });
    async function updateUsername() {
      if (!isFormValid.value)
        return;
      try {
        isLoading.value = true;
        const res = await common_vendor.index.request({
          url: common_config.websiteUrl.value + "/with-state/update-profile",
          method: "POST",
          header: {
            "Authorization": common_vendor.index.getStorageSync("token")
          },
          data: {
            username: username.value
          }
        });
        if (res.data.status === "success") {
          common_vendor.index.showToast({
            title: "更新成功",
            icon: "success"
          });
          await common_config.getUserInfo();
          setTimeout(() => common_vendor.index.navigateBack(), 1500);
        } else {
          common_vendor.index.showToast({
            title: res.data.msg || "更新失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.showToast({
          title: "请求失败，请稍后重试",
          icon: "none"
        });
      } finally {
        isLoading.value = false;
      }
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: username.value,
        b: common_vendor.o(($event) => username.value = $event.detail.value),
        c: common_vendor.p({
          type: "person",
          size: "18",
          color: "#999"
        }),
        d: common_vendor.t(isLoading.value ? "提交中..." : "更新用户名"),
        e: isLoading.value
      }, isLoading.value ? {} : {}, {
        f: isFormValid.value ? 1 : "",
        g: common_vendor.o(updateUsername),
        h: !isFormValid.value,
        i: common_vendor.p({
          type: "info",
          size: "16",
          color: "#666"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-ce7f77cb"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/setting/username/username.js.map
