"use strict";
const common_vendor = require("../../common/vendor.js");
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
const _sfc_main = {
  __name: "report-button",
  props: {
    // 举报类型（1=展示柜,2=搭配,3=树洞发帖,4=用户，5=回帖）
    reportType: {
      type: Number,
      required: true
    },
    // 关联ID（被举报内容的ID）
    relationId: {
      type: Number,
      required: true
    },
    // 按钮文本
    buttonText: {
      type: String,
      default: "举报"
    },
    // 图标类型
    iconType: {
      type: String,
      default: ""
    },
    // 图标大小
    iconSize: {
      type: String,
      default: 24
    },
    // 图标颜色
    iconColor: {
      type: String,
      default: "#999"
    },
    // 主题颜色
    themeColor: {
      type: String,
      default: "#64c6dc"
    },
    // 是否自动聚焦文本输入框
    autoFocus: {
      type: Boolean,
      default: false
    }
  },
  emits: ["success", "error", "cancel", "before-submit"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const reportVisible = common_vendor.ref(false);
    const reportReasons = common_vendor.ref([]);
    const selectedReason = common_vendor.ref("");
    const reportDetails = common_vendor.ref("");
    const isSubmitting = common_vendor.ref(false);
    const selectReason = (reason) => {
      if (selectedReason.value === reason) {
        selectedReason.value = "";
      } else {
        selectedReason.value = reason;
      }
    };
    const fetchReportReasons = async () => {
      try {
        const token = common_vendor.index.getStorageSync("token");
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl}/report/reasons?type=${props.reportType}`,
          method: "GET",
          header: {
            "Authorization": token
          }
        });
        if (res.data.status === "success") {
          reportReasons.value = res.data.data;
          return true;
        } else {
          common_vendor.index.showToast({
            title: "获取举报原因失败: " + (res.data.msg || ""),
            icon: "none"
          });
          return false;
        }
      } catch (error) {
        common_vendor.index.showToast({
          title: "网络请求失败",
          icon: "none"
        });
        return false;
      }
    };
    const handleClick = async () => {
      const success = await fetchReportReasons();
      if (!success)
        return;
      selectedReason.value = "";
      reportDetails.value = "";
      reportVisible.value = true;
    };
    const submitReport = async () => {
      if (isSubmitting.value)
        return;
      isSubmitting.value = true;
      try {
        if (!selectedReason.value) {
          common_vendor.index.showToast({
            title: "请选择举报原因",
            icon: "none"
          });
          return;
        }
        emit("before-submit", {
          type: props.reportType,
          relationId: props.relationId,
          reason: selectedReason.value,
          details: reportDetails.value
        });
        const token = common_vendor.index.getStorageSync("token");
        const reportData = {
          type: props.reportType,
          relation_id: props.relationId,
          reason: selectedReason.value,
          details: reportDetails.value
        };
        let url = `${common_config.websiteUrl}/with-state/report/submit`;
        if (token == "") {
          url = `${common_config.websiteUrl}/report/submit`;
        }
        const res = await common_vendor.index.request({
          url,
          method: "POST",
          header: {
            "Authorization": token,
            "Content-Type": "application/json"
          },
          data: reportData,
          timeout: 1e4
          // 10秒超时
        });
        if (res.data.status === "success") {
          common_vendor.index.showToast({
            title: "举报提交成功",
            icon: "success",
            duration: 2e3
          });
          reportVisible.value = false;
          emit("success", res.data);
        } else {
          common_vendor.index.showToast({
            title: res.data.msg || "举报提交失败",
            icon: "none"
          });
          emit("error", res.data);
        }
      } catch (error) {
        common_vendor.index.showToast({
          title: "举报提交失败: " + (error.errMsg || "网络错误"),
          icon: "none"
        });
        emit("error", error);
      } finally {
        isSubmitting.value = false;
      }
    };
    common_vendor.watch(reportVisible, (newVal) => {
      if (!newVal) {
        emit("cancel");
      }
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          ["v-if"]: __props.iconType !== "",
          type: __props.iconType,
          size: parseInt(__props.iconSize),
          color: __props.iconColor
        }),
        b: common_vendor.t(__props.buttonText),
        c: common_vendor.o(handleClick),
        d: common_vendor.o(($event) => reportVisible.value = false),
        e: common_vendor.p({
          type: "closeempty",
          size: "24",
          color: "#999"
        }),
        f: common_vendor.f(reportReasons.value, (reason, k0, i0) => {
          return {
            a: reason.label,
            b: selectedReason.value === reason.label,
            c: common_vendor.t(reason.label),
            d: reason.id,
            e: common_vendor.o(($event) => selectReason(reason.label), reason.id),
            f: selectedReason.value === reason.label ? 1 : ""
          };
        }),
        g: __props.themeColor,
        h: __props.autoFocus,
        i: reportDetails.value,
        j: common_vendor.o(($event) => reportDetails.value = $event.detail.value),
        k: common_vendor.t(reportDetails.value.length),
        l: common_vendor.o(($event) => reportVisible.value = false),
        m: common_vendor.o(submitReport),
        n: __props.themeColor,
        o: common_vendor.o((val) => reportVisible.value = val),
        p: common_vendor.p({
          visible: reportVisible.value,
          top: "10vh"
        })
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-b620d6d3"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/report-button/report-button.js.map
