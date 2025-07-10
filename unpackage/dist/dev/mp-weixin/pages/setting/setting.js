"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const common_config = require("../../common/config.js");
if (!Array) {
  const _easycom_view_logs2 = common_vendor.resolveComponent("view-logs");
  _easycom_view_logs2();
}
const _easycom_view_logs = () => "../../components/view-logs/view-logs.js";
if (!Math) {
  _easycom_view_logs();
}
const _sfc_main = {
  __name: "setting",
  setup(__props) {
    common_vendor.index.setNavigationBarTitle({
      title: "设置"
    });
    const menuItems = common_vendor.computed(() => [
      {
        label: "更改用户名",
        action: jump2username,
        status: !!common_config.global.userInfo.password,
        displayValue: common_config.global.userInfo.password ? "去修改" : "未设置"
      },
      {
        label: "更改密码",
        action: jump2password,
        status: !!common_config.global.userInfo.password,
        displayValue: common_config.global.userInfo.password ? "去修改" : "未设置"
      },
      {
        label: "绑定手机号",
        action: jump2telphone,
        status: !!common_config.global.userInfo.tel_phone,
        // 修正字段名
        displayValue: common_config.global.userInfo.tel_phone ? common_config.global.userInfo.tel_phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2") : "去绑定"
      },
      {
        label: "绑定微信",
        action: jump2wechat,
        status: !!common_config.global.userInfo.wechat_open_id,
        displayValue: common_config.global.userInfo.wechat_open_id ? "已绑定" : "去绑定"
      },
      {
        label: "检查更新",
        action: checkUpdate,
        status: newVersionInfo.value.version,
        // 有新版本时高亮显示
        displayValue: updateStatusText.value
      }
    ]);
    common_vendor.ref({});
    let newVersionInfo = common_vendor.ref({});
    const hasAppliedDeletion = common_vendor.ref(false);
    common_vendor.ref(false);
    const updateStatusText = common_vendor.ref("检查更新");
    let click = common_vendor.ref(0);
    function jump2password() {
      common_vendor.index.navigateTo({
        url: "/pages/setting/password/password"
      });
    }
    function jump2telphone() {
      common_vendor.index.navigateTo({
        url: "/pages/setting/tel_phone/tel_phone"
      });
    }
    function jump2username() {
      common_vendor.index.navigateTo({
        url: "/pages/setting/username/username"
      });
    }
    function jump2wechat() {
      if (common_config.global.userInfo.wechat_open_id) {
        common_vendor.index.showToast({
          title: "已绑定微信",
          icon: "none"
        });
      } else {
        common_config.bindWechat().then(() => {
          common_vendor.index.__f__("log", "at pages/setting/setting.vue:120", "微信绑定成功");
          common_vendor.index.showToast({
            title: "微信绑定成功",
            icon: "none"
          });
        }).catch((err) => {
          common_vendor.index.__f__("error", "at pages/setting/setting.vue:127", "微信绑定失败:", err);
          common_vendor.index.showToast({
            title: "微信绑定失败",
            icon: "none"
          });
        });
      }
    }
    const checkUpdate = async () => {
      if (common_vendor.index.getSystemInfoSync().platform === "app" || true) {
        click.value++;
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl}/latest-version?version=${common_config.dogdogdollVersion}`,
          method: "GET"
        });
        if (res && res.data) {
          if (res.data.status === "success" && res.data.data) {
            updateStatusText.value = "有新版本:" + res.data.data.version;
            newVersionInfo.value = true;
          } else {
            if (click.value > 1) {
              common_vendor.index.showToast({
                title: "当前已是最新版本",
                icon: "none"
              });
            }
          }
        }
      } else {
        common_vendor.index.showToast({
          title: "您所使用的平台无需更新",
          icon: "none"
        });
      }
    };
    async function handleAccountDeletion() {
      if (hasAppliedDeletion.value) {
        common_vendor.index.showModal({
          title: "取消注销申请",
          content: "确定要取消账号注销申请吗？",
          success: async (res) => {
            if (res.confirm) {
              await cancelAccountDeletion();
            }
          }
        });
      } else {
        common_vendor.index.showModal({
          title: "申请注销账号",
          content: "确定要申请注销账号吗？注销后账号将不可恢复！",
          confirmText: "确认注销",
          confirmColor: "#f56c6c",
          success: async (res) => {
            if (res.confirm) {
              await applyForAccountDeletion();
            }
          }
        });
      }
    }
    async function applyForAccountDeletion() {
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "处理中...",
        mask: true
      });
      try {
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl}/with-state/apply-delete`,
          method: "POST",
          header: {
            "Authorization": token
          }
        });
        common_vendor.index.hideLoading();
        if (res.data.status === "success") {
          hasAppliedDeletion.value = true;
          common_config.global.userInfo.deleteApplyAt = Math.floor(Date.now() / 1e3);
          common_vendor.index.showToast({
            title: "已申请注销账号",
            icon: "success",
            duration: 3e3
          });
          setTimeout(() => {
            common_vendor.index.showModal({
              title: "注销申请已提交",
              content: "您的账号将在30天后正式注销。在此期间您可以正常使用所有功能，并可随时取消注销申请。",
              showCancel: false,
              confirmText: "知道了"
            });
          }, 1e3);
        } else {
          throw new Error(res.data.msg || "申请注销失败");
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: error.message || "操作失败，请稍后重试",
          icon: "none",
          duration: 3e3
        });
      }
    }
    async function cancelAccountDeletion() {
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "处理中...",
        mask: true
      });
      try {
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl}/with-state/cancel-delete`,
          method: "POST",
          header: {
            "Authorization": token
          }
        });
        common_vendor.index.hideLoading();
        if (res.data.status === "success") {
          hasAppliedDeletion.value = false;
          common_config.global.userInfo.deleteApplyAt = 0;
          common_vendor.index.showToast({
            title: "已取消注销申请",
            icon: "success",
            duration: 3e3
          });
        } else {
          throw new Error(res.data.msg || "取消注销失败");
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: error.message || "操作失败，请稍后重试",
          icon: "none",
          duration: 3e3
        });
      }
    }
    common_vendor.onMounted(() => {
      common_config.asyncGetUserInfo().then((user) => {
        hasAppliedDeletion.value = user.delete_apply_at > 0;
      });
      checkUpdate();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(menuItems.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item.label),
            b: common_vendor.t(item.displayValue),
            c: common_vendor.n(item.status ? "active" : "inactive"),
            d: index,
            e: common_vendor.o(($event) => item.action(item), index)
          };
        }),
        b: common_assets._imports_0$7,
        c: common_vendor.t(hasAppliedDeletion.value ? "取消注销申请" : "申请注销账号"),
        d: common_vendor.o(handleAccountDeletion),
        e: hasAppliedDeletion.value ? "#f56c6c" : "#cfcad8",
        f: hasAppliedDeletion.value
      }, hasAppliedDeletion.value ? {} : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-018cdf56"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/setting/setting.js.map
