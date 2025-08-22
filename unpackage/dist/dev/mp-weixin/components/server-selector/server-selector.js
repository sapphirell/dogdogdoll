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
  __name: "server-selector",
  emits: ["server-change"],
  setup(__props, { emit: __emit }) {
    const servers = common_vendor.reactive([
      {
        name: "中国",
        url: common_config.cnURL,
        ping: -1
        // -1: 测试中, -2: 失败, >0: 延迟
      },
      {
        name: "美国",
        url: common_config.usURL,
        ping: -1
      },
      {
        name: "Localhost",
        url: common_config.devUrl,
        ping: -1
      }
    ]);
    const showModal = common_vendor.ref(false);
    const selectedServer = common_vendor.ref("");
    const currentPing = common_vendor.ref(-1);
    let pingInterval = null;
    const emit = __emit;
    common_vendor.onMounted(() => {
      const savedServer = common_vendor.index.getStorageSync("selectedServer");
      selectedServer.value = savedServer || common_config.cnURL;
      common_config.websiteUrl.value = selectedServer.value;
      testCurrentServer();
      startPingInterval();
    });
    common_vendor.onUnmounted(() => {
      clearInterval(pingInterval);
    });
    const startPingInterval = () => {
      pingInterval = setInterval(() => {
        testCurrentServer();
      }, 5e3);
    };
    const testCurrentServer = async () => {
      try {
        const startTime = Date.now();
        await pingServer(selectedServer.value);
        currentPing.value = Date.now() - startTime;
      } catch (error) {
        currentPing.value = -2;
      }
    };
    common_vendor.watch(showModal, (newVal) => {
      if (newVal) {
        pingAllServers();
      }
    });
    const pingAllServers = async () => {
      for (const server of servers) {
        server.ping = -1;
        try {
          const startTime = Date.now();
          await pingServer(server.url);
          server.ping = Date.now() - startTime;
          if (server.url === selectedServer.value) {
            currentPing.value = server.ping;
          }
        } catch (error) {
          server.ping = -2;
          if (server.url === selectedServer.value) {
            currentPing.value = -2;
          }
        }
      }
    };
    const pingServer = (url) => {
      return new Promise((resolve, reject) => {
        common_vendor.index.request({
          url: `${url}/ping`,
          method: "GET",
          timeout: 5e3,
          // 5秒超时
          success: () => resolve(),
          fail: () => reject()
        });
      });
    };
    const selectServer = (server) => {
      if (server.ping === -2) {
        common_vendor.index.showToast({
          title: "服务器连接失败，无法选择",
          icon: "none"
        });
        return;
      }
      selectedServer.value = server.url;
      common_config.websiteUrl.value = server.url;
      common_vendor.index.setStorageSync("selectedServer", server.url);
      currentPing.value = server.ping;
      common_vendor.index.showToast({
        title: `已切换到${server.name}`,
        icon: "success"
      });
      showModal.value = false;
      emit("server-change", {
        server,
        ping: server.ping
      });
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          type: "paperplane",
          size: "24",
          color: "#5db7ff"
        }),
        b: common_vendor.t(currentPing.value >= 0 ? currentPing.value + "ms" : "9999ms"),
        c: common_vendor.o(($event) => showModal.value = true),
        d: common_vendor.t(currentPing.value >= 0 ? currentPing.value + "ms" : "-1ms"),
        e: common_vendor.f(servers, (server, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(server.name),
            b: server.ping === -1
          }, server.ping === -1 ? {
            c: "47f41f1f-2-" + i0 + ",47f41f1f-1",
            d: common_vendor.p({
              type: "spinner-cycle",
              size: "16",
              color: "#999"
            })
          } : server.ping === -2 ? {} : {
            f: common_vendor.t(server.ping)
          }, {
            e: server.ping === -2,
            g: index,
            h: server.url === selectedServer.value ? 1 : "",
            i: server.ping === -1 ? 1 : "",
            j: common_vendor.o(($event) => selectServer(server), index)
          });
        }),
        f: common_vendor.o(($event) => showModal.value = $event),
        g: common_vendor.p({
          visible: showModal.value,
          top: "15vh"
        })
      };
    };
  }
};
wx.createComponent(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/server-selector/server-selector.js.map
