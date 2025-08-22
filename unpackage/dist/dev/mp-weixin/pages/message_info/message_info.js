"use strict";
const common_vendor = require("../../common/vendor.js");
const common_config = require("../../common/config.js");
if (!Array) {
  const _easycom_view_logs2 = common_vendor.resolveComponent("view-logs");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  (_easycom_view_logs2 + _easycom_uni_load_more2 + _easycom_uni_icons2)();
}
const _easycom_view_logs = () => "../../components/view-logs/view-logs.js";
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_view_logs + _easycom_uni_load_more + _easycom_uni_icons)();
}
const _sfc_main = {
  __name: "message_info",
  props: ["message_id"],
  setup(__props) {
    const props = __props;
    const messageDetail = common_vendor.ref(null);
    const loading = common_vendor.ref(true);
    const error = common_vendor.ref("");
    const messageId = common_vendor.ref("");
    const fetchMessageDetail = async () => {
      try {
        loading.value = true;
        error.value = "";
        if (!messageId.value) {
          error.value = "无效的消息ID";
          return;
        }
        const userInfo = await common_config.asyncGetUserInfo();
        if (!userInfo) {
          error.value = "请先登录";
          return;
        }
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl.value}/with-state/message-detail`,
          method: "GET",
          data: { id: messageId.value },
          header: { Authorization: common_vendor.index.getStorageSync("token") }
        });
        if (res.data.status === "success") {
          messageDetail.value = res.data.data;
          common_vendor.index.$emit("message-status-update", {
            id: messageId.value,
            is_read: 1
          });
        } else {
          error.value = res.data.msg || "获取详情失败";
        }
      } catch (err) {
        error.value = "请求失败，请检查网络";
        common_vendor.index.__f__("error", "at pages/message_info/message_info.vue:97", "详情请求失败:", err);
      } finally {
        loading.value = false;
      }
    };
    const formatTime = (timestamp) => {
      const date = new Date(timestamp * 1e3);
      return date.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      }).replace(/\//g, "-");
    };
    common_vendor.onMounted(() => {
      common_vendor.index.setNavigationBarTitle({
        title: "消息详情"
      });
      messageId.value = props.message_id;
      fetchMessageDetail();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: loading.value
      }, loading.value ? {
        b: common_vendor.p({
          status: "loading"
        })
      } : error.value ? {
        d: common_vendor.p({
          type: "info",
          size: "24",
          color: "#ff4d4f"
        }),
        e: common_vendor.t(error.value),
        f: common_vendor.o(fetchMessageDetail)
      } : {
        g: messageDetail.value.cover_image,
        h: common_vendor.t(messageDetail.value.title),
        i: common_vendor.t(formatTime(messageDetail.value.created_at)),
        j: common_vendor.t(messageDetail.value.msg)
      }, {
        c: error.value
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/message_info/message_info.js.map
