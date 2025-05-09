"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const common_config = require("../../common/config.js");
if (!Array) {
  const _component_transition = common_vendor.resolveComponent("transition");
  const _easycom_common_page2 = common_vendor.resolveComponent("common-page");
  (_component_transition + _easycom_common_page2)();
}
const _easycom_common_page = () => "../../components/common-page/common-page.js";
if (!Math) {
  _easycom_common_page();
}
const _sfc_main = {
  __name: "stock",
  setup(__props) {
    const systemInfo = common_vendor.index.getSystemInfoSync();
    common_vendor.ref(systemInfo.statusBarHeight);
    const activeTab = common_vendor.ref(1);
    const previousTab = common_vendor.ref(1);
    function transitionName() {
      return activeTab.value > previousTab.value ? "slide_left" : "slide_right";
    }
    function switch_tab(index) {
      previousTab.value = activeTab.value;
      activeTab.value = index;
      common_vendor.index.__f__("log", "at pages/stock/stock.vue:180", `切换到 tab ${index}`);
      switch (index) {
        case 1:
          getAccountBookData();
          activeTab.value = 1;
          break;
        case 2:
          activeTab.value = 2;
          getShowcaseData();
          break;
        case 3:
          activeTab.value = 3;
          getBillData();
          break;
      }
    }
    function countPaid(bills) {
      return bills.filter((bill) => bill.status === 1).length;
    }
    const selectedType = common_vendor.ref(0);
    const accountBookTypeList = common_vendor.ref(["全部", "娃头", "娃衣", "眼珠", "假发", "娃鞋"]);
    const accountBookData = common_vendor.ref({});
    const showcaseData = common_vendor.ref({});
    const billData = common_vendor.ref({});
    function updateSelectedType(e) {
      selectedType.value = e.detail.value;
      getAccountBookData(accountBookTypeList.value[selectedType.value]);
    }
    function getAccountBookData(type) {
      common_vendor.index.__f__("log", "at pages/stock/stock.vue:222", common_config.global);
      if (!common_config.global.isLogin) {
        return;
      }
      let token = common_vendor.index.getStorageSync("token");
      let url = common_config.websiteUrl + "/with-state/account-book";
      if (type && type !== "全部") {
        url = common_config.websiteUrl + "/with-state/account-book?type=" + type;
      }
      accountBookData.value = {};
      common_vendor.index.request({
        url,
        method: "GET",
        header: {
          "Authorization": token
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/stock/stock.vue:241", res.data.data);
          accountBookData.value = res.data.data;
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/stock/stock.vue:245", err);
        }
      });
    }
    function getShowcaseData() {
      common_vendor.index.__f__("log", "at pages/stock/stock.vue:252", common_config.global);
      if (!common_config.global.isLogin) {
        return;
      }
      let token = common_vendor.index.getStorageSync("token");
      showcaseData.value = {};
      common_vendor.index.request({
        url: common_config.websiteUrl + "/with-state/showcase",
        method: "GET",
        header: {
          "Authorization": token
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/stock/stock.vue:266", res.data.data);
          showcaseData.value = res.data.data;
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/stock/stock.vue:270", err);
        }
      });
    }
    function getBillData() {
      common_vendor.index.__f__("log", "at pages/stock/stock.vue:277", common_config.global);
      if (!common_config.global.isLogin) {
        return;
      }
      let token = common_vendor.index.getStorageSync("token");
      billData.value = {};
      common_vendor.index.request({
        url: common_config.websiteUrl + "/with-state/tail-bill",
        method: "GET",
        header: {
          "Authorization": token
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/stock/stock.vue:291", res.data.data);
          billData.value = res.data.data;
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/stock/stock.vue:295", err);
        }
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
        getAccountBookData();
        getShowcaseData();
        getBillData();
      });
    });
    return (_ctx, _cache) => {
      var _a, _b;
      return common_vendor.e({
        a: common_vendor.o(($event) => switch_tab(1)),
        b: activeTab.value === 1 ? 1 : "",
        c: common_vendor.o(($event) => switch_tab(2)),
        d: activeTab.value === 2 ? 1 : "",
        e: common_vendor.o(($event) => switch_tab(3)),
        f: activeTab.value === 3 ? 1 : "",
        g: activeTab.value === 1
      }, activeTab.value === 1 ? common_vendor.e({
        h: common_vendor.t(accountBookTypeList.value[selectedType.value]),
        i: selectedType.value,
        j: accountBookTypeList.value,
        k: common_vendor.o(updateSelectedType),
        l: ((_a = accountBookData.value.account_books) == null ? void 0 : _a.length) > 0
      }, ((_b = accountBookData.value.account_books) == null ? void 0 : _b.length) > 0 ? {
        m: common_vendor.f(accountBookData.value.account_books, (item, index, i0) => {
          return {
            a: item.image_url,
            b: common_vendor.t(item.type),
            c: common_vendor.t(item.price),
            d: common_vendor.t(item.name),
            e: index,
            f: common_vendor.o(($event) => go2editor(item.id), index)
          };
        })
      } : {
        n: common_assets._imports_0$1
      }, {
        o: common_vendor.o(go2addAccountBook),
        p: activeTab.value !== 1 ? 1 : ""
      }) : {}, {
        q: common_vendor.p({
          name: transitionName()
        }),
        r: activeTab.value === 2
      }, activeTab.value === 2 ? common_vendor.e({
        s: showcaseData.value.showcases && showcaseData.value.showcases.length > 0
      }, showcaseData.value.showcases && showcaseData.value.showcases.length > 0 ? {
        t: common_vendor.f(showcaseData.value.showcases, (item, index, i0) => {
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
        v: common_assets._imports_1$2,
        w: common_assets._imports_2$1
      } : {
        x: common_assets._imports_0$1
      }, {
        y: common_vendor.o(go2addShowCase),
        z: activeTab.value !== 2 ? 1 : ""
      }) : {}, {
        A: common_vendor.p({
          name: transitionName()
        }),
        B: activeTab.value === 3
      }, activeTab.value === 3 ? common_vendor.e({
        C: Object.keys(billData.value).length > 0
      }, Object.keys(billData.value).length > 0 ? {
        D: common_vendor.f(billData.value, (bills, month, i0) => {
          return {
            a: common_vendor.t(month),
            b: common_vendor.t(countPaid(bills)),
            c: common_vendor.t(bills.length),
            d: common_vendor.f(bills, (bill, k1, i1) => {
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
            e: month
          };
        })
      } : {
        E: common_assets._imports_0$1
      }, {
        F: common_vendor.o(($event) => go2addBill(false)),
        G: activeTab.value !== 3 ? 1 : ""
      }) : {}, {
        H: common_vendor.p({
          name: transitionName()
        }),
        I: common_vendor.p({
          head_color: "rgb(185 195 253)"
        })
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/stock/stock.js.map
