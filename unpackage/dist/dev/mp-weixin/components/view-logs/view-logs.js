"use strict";
const common_vendor = require("../../common/vendor.js");
const common_config = require("../../common/config.js");
const _sfc_main = {
  __name: "view-logs",
  setup(__props) {
    const getUVId = () => {
      let uvid = common_vendor.index.getStorageSync("ft_uvid");
      if (!uvid) {
        uvid = Math.floor(Math.random() * 2147483647) + 1;
        common_vendor.index.setStorageSync("ft_uvid", uvid);
      }
      return uvid;
    };
    const getCurrentPagePath = () => {
      const pages = getCurrentPages();
      if (pages.length === 0)
        return "";
      return pages[pages.length - 1].route || "";
    };
    const sendViewLog = async () => {
      let userInfo = common_vendor.index.getStorageSync("userInfo");
      const logData = {
        scene: common_config.getScene(),
        // 访问场景
        path: getCurrentPagePath(),
        // 当前页面路径
        uid: userInfo ? userInfo.id : 0,
        // 用户ID（如果登录）
        uvid: getUVId(),
        // 独立访客ID
        version: common_config.dogdogdollVersion
        // 版本号
      };
      common_vendor.index.__f__("log", "at components/view-logs/view-logs.vue:40", "logData:", logData);
      if (!logData.path) {
        common_vendor.index.__f__("warn", "at components/view-logs/view-logs.vue:44", "无法获取当前页面路径");
        return;
      }
      try {
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl}/log/view`,
          method: "POST",
          data: logData,
          header: {
            "content-type": "application/json"
          }
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at components/view-logs/view-logs.vue:58", "日志发送错误:", error);
      }
    };
    common_vendor.onMounted(() => {
      sendViewLog();
    });
    return (_ctx, _cache) => {
      return {};
    };
  }
};
wx.createComponent(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/view-logs/view-logs.js.map
