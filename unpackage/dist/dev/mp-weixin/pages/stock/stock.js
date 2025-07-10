"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const common_config = require("../../common/config.js");
if (!Array) {
  const _easycom_view_logs2 = common_vendor.resolveComponent("view-logs");
  const _easycom_stock_myitems2 = common_vendor.resolveComponent("stock-myitems");
  const _easycom_uni_transition2 = common_vendor.resolveComponent("uni-transition");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_common_modal2 = common_vendor.resolveComponent("common-modal");
  const _easycom_common_page2 = common_vendor.resolveComponent("common-page");
  (_easycom_view_logs2 + _easycom_stock_myitems2 + _easycom_uni_transition2 + _easycom_uni_icons2 + _easycom_common_modal2 + _easycom_common_page2)();
}
const _easycom_view_logs = () => "../../components/view-logs/view-logs.js";
const _easycom_stock_myitems = () => "../../components/stock-myitems/stock-myitems.js";
const _easycom_uni_transition = () => "../../uni_modules/uni-transition/components/uni-transition/uni-transition.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_common_modal = () => "../../components/common-modal/common-modal.js";
const _easycom_common_page = () => "../../components/common-page/common-page.js";
if (!Math) {
  (_easycom_view_logs + _easycom_stock_myitems + _easycom_uni_transition + _easycom_uni_icons + _easycom_common_modal + _easycom_common_page)();
}
const _sfc_main = {
  __name: "stock",
  setup(__props) {
    const systemInfo = common_vendor.index.getSystemInfoSync();
    common_vendor.ref(systemInfo.statusBarHeight);
    const activeTab = common_vendor.ref(1);
    const previousTab = common_vendor.ref(1);
    function transitionName() {
      if (activeTab.value > 1) {
        return ["fade", "slide-left"];
      } else {
        return ["fade", "slide-right"];
      }
    }
    function switch_tab(index) {
      const oldIndex = activeTab.value;
      previousTab.value = oldIndex;
      activeTab.value = index;
      common_vendor.index.__f__("log", "at pages/stock/stock.vue:190", `从 tab ${oldIndex} 切换到 tab ${index}，方向: ${transitionName()}`);
      switch (index) {
        case 1:
          getAccountBookData();
          break;
        case 2:
          getShowcaseData();
          break;
        case 3:
          getBillData();
          break;
      }
    }
    function countPaid(bills) {
      let totalAmount = 0;
      let paidAmount = 0;
      bills.forEach((bill) => {
        const price = parseFloat(bill.price) || 0;
        totalAmount += price;
        if (bill.status === 1) {
          paidAmount += price;
        }
      });
      return `${paidAmount.toFixed(1)}/${totalAmount.toFixed(1)}`;
    }
    const handleTypeUpdate = (type) => {
      getAccountBookData(type);
    };
    function handleFloatingButton() {
      switch (activeTab.value) {
        case 1:
          go2addAccountBook();
          break;
        case 2:
          go2addShowCase();
          break;
        case 3:
          go2addBill(false);
          break;
      }
    }
    const accountBookData = common_vendor.ref({});
    const showcaseData = common_vendor.ref({});
    const billData = common_vendor.ref({});
    function getAccountBookData(type) {
      common_vendor.index.__f__("log", "at pages/stock/stock.vue:263", common_config.global);
      if (!common_config.global.isLogin) {
        return;
      }
      let token = common_vendor.index.getStorageSync("token");
      let url = common_config.websiteUrl + "/with-state/account-book";
      if (type && type !== "全部") {
        url = common_config.websiteUrl + "/with-state/account-book?type=" + type;
      }
      common_vendor.index.request({
        url,
        method: "GET",
        header: {
          "Authorization": token
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/stock/stock.vue:281", res.data.data);
          accountBookData.value = res.data.data;
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/stock/stock.vue:285", err);
        }
      });
    }
    function getShowcaseData() {
      common_vendor.index.__f__("log", "at pages/stock/stock.vue:292", common_config.global);
      if (!common_config.global.isLogin) {
        return;
      }
      let token = common_vendor.index.getStorageSync("token");
      common_vendor.index.request({
        url: common_config.websiteUrl + "/with-state/showcase",
        method: "GET",
        header: {
          "Authorization": token
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/stock/stock.vue:306", res.data.data);
          showcaseData.value = res.data.data;
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/stock/stock.vue:310", err);
        }
      });
    }
    function getBillData() {
      common_vendor.index.__f__("log", "at pages/stock/stock.vue:319", common_config.global);
      if (!common_config.global.isLogin) {
        return;
      }
      let token = common_vendor.index.getStorageSync("token");
      common_vendor.index.request({
        url: common_config.websiteUrl + "/with-state/tail-bill",
        method: "GET",
        header: {
          "Authorization": token
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/stock/stock.vue:333", res.data.data);
          billData.value = res.data.data;
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/stock/stock.vue:337", err);
        }
      });
    }
    function jump2test() {
      common_vendor.index.navigateTo({
        url: "/pages/drag-image-test/drag-image-test"
      });
    }
    function go2addAccountBook() {
      common_vendor.index.navigateTo({
        url: "/pages/stock/account_book_form/account_book_form"
      });
    }
    function go2editor(id) {
      common_vendor.index.navigateTo({
        url: "/pages/stock/account_book_form/account_book_form?account_book_id=" + id
      });
    }
    function go2addShowCase() {
      common_vendor.index.navigateTo({
        url: "/pages/stock/showcase_form/showcase_form"
      });
    }
    function go2editorShowCase(id) {
      common_vendor.index.navigateTo({
        url: "/pages/stock/showcase_form/showcase_form?showcase_id=" + id
      });
    }
    function go2addBill(id) {
      if (id == false) {
        common_vendor.index.navigateTo({
          url: "/pages/stock/bill_form/bill_form"
        });
        return;
      }
      common_vendor.index.navigateTo({
        url: "/pages/stock/bill_form/bill_form?bill_id=" + id
      });
    }
    function getStatusText(display) {
      const textMap = {
        0: "审核中",
        2: "人工复核中",
        3: "违规隐藏中"
      };
      return textMap[display] || "";
    }
    common_vendor.onShow(() => {
      common_config.asyncGetUserInfo().then((userInfo) => {
        switch (activeTab.value) {
          case 1:
            getAccountBookData();
            break;
          case 2:
            getShowcaseData();
            break;
          case 3:
            getBillData();
            break;
        }
      });
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(($event) => switch_tab(1)),
        b: activeTab.value === 1 ? 1 : "",
        c: common_vendor.o(($event) => switch_tab(2)),
        d: activeTab.value === 2 ? 1 : "",
        e: common_vendor.o(($event) => switch_tab(3)),
        f: activeTab.value === 3 ? 1 : "",
        g: common_vendor.o(jump2test),
        h: common_vendor.o(go2editor),
        i: common_vendor.o(handleTypeUpdate),
        j: common_vendor.p({
          accountBookData: accountBookData.value
        }),
        k: common_vendor.p({
          name: transitionName(),
          ["mode-class"]: ["fade", "slide-bottom"],
          duration: 300,
          show: activeTab.value === 1
        }),
        l: showcaseData.value.showcases && showcaseData.value.showcases.length > 0
      }, showcaseData.value.showcases && showcaseData.value.showcases.length > 0 ? {
        m: common_vendor.f(showcaseData.value.showcases, (item, index, i0) => {
          return common_vendor.e({
            a: item.display !== 1
          }, item.display !== 1 ? {
            b: common_vendor.t(getStatusText(item.display))
          } : {}, {
            c: item.image_url_list[0],
            d: common_vendor.t(item.name),
            e: common_vendor.t(item.description),
            f: common_vendor.t(item.views || 0),
            g: common_vendor.t(item.likes || 0),
            h: item.display !== 1 ? 1 : "",
            i: index,
            j: common_vendor.o(($event) => go2editorShowCase(item.id), index)
          });
        }),
        n: common_assets._imports_0$4,
        o: common_assets._imports_1$2
      } : {
        p: common_assets._imports_0$3
      }, {
        q: common_vendor.p({
          name: transitionName(),
          ["mode-class"]: ["fade", "slide-bottom"],
          duration: 300,
          show: activeTab.value === 2
        }),
        r: Object.keys(billData.value).length > 0
      }, Object.keys(billData.value).length > 0 ? {
        s: common_vendor.f(billData.value, (bills, month, i0) => {
          return {
            a: common_vendor.t(month),
            b: common_vendor.t(countPaid(bills)),
            c: common_vendor.f(bills, (bill, k1, i1) => {
              return {
                a: common_vendor.t(bill.name),
                b: common_vendor.t(bill.price),
                c: common_vendor.t(bill.ymd),
                d: common_vendor.t(bill.status === 0 ? "未补款" : "已补款"),
                e: bill.status === 1 ? 1 : "",
                f: bill.id,
                g: common_vendor.o(($event) => go2addBill(bill.id), bill.id)
              };
            }),
            d: month
          };
        })
      } : {
        t: common_assets._imports_0$3
      }, {
        v: common_vendor.p({
          name: transitionName(),
          ["mode-class"]: ["fade", "slide-bottom"],
          duration: 300,
          show: activeTab.value === 3
        }),
        w: common_vendor.f(_ctx.customTypes, (type, index, i0) => {
          return {
            a: common_vendor.t(type.name),
            b: common_vendor.o(($event) => _ctx.deleteType(type.id), type.id),
            c: "4829e7f4-7-" + i0 + ",4829e7f4-6",
            d: type.id
          };
        }),
        x: common_vendor.p({
          type: "trash",
          size: "22",
          color: "#ff6666"
        }),
        y: _ctx.newTypeName,
        z: common_vendor.o(($event) => _ctx.newTypeName = $event.detail.value),
        A: common_vendor.o((...args) => _ctx.addNewType && _ctx.addNewType(...args)),
        B: common_vendor.o((val) => _ctx.typeModalVisible = val),
        C: common_vendor.p({
          visible: _ctx.typeModalVisible,
          top: "300rpx",
          height: "60%"
        }),
        D: common_vendor.p({
          type: "plusempty",
          size: "30",
          color: "#fff"
        }),
        E: common_vendor.o(handleFloatingButton),
        F: common_vendor.p({
          head_color: "#d8deff"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4829e7f4"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/stock/stock.js.map
