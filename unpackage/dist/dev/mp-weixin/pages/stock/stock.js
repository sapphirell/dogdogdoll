"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const common_config = require("../../common/config.js");
if (!Array) {
  const _easycom_uni_transition2 = common_vendor.resolveComponent("uni-transition");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_common_modal2 = common_vendor.resolveComponent("common-modal");
  const _easycom_common_page2 = common_vendor.resolveComponent("common-page");
  (_easycom_uni_transition2 + _easycom_uni_icons2 + _easycom_common_modal2 + _easycom_common_page2)();
}
const _easycom_uni_transition = () => "../../uni_modules/uni-transition/components/uni-transition/uni-transition.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_common_modal = () => "../../components/common-modal/common-modal.js";
const _easycom_common_page = () => "../../components/common-page/common-page.js";
if (!Math) {
  (_easycom_uni_transition + _easycom_uni_icons + _easycom_common_modal + _easycom_common_page)();
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
      common_vendor.index.__f__("log", "at pages/stock/stock.vue:225", `从 tab ${oldIndex} 切换到 tab ${index}，方向: ${transitionName()}`);
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
    const selectedType = common_vendor.ref(0);
    const typeModalVisible = common_vendor.ref(false);
    const newTypeName = common_vendor.ref("");
    const customTypes = common_vendor.ref([]);
    const defaultTypes = ["全部", "娃头", "娃衣", "素体", "眼珠", "假发", "娃鞋"];
    const typeOptions = common_vendor.computed(() => [
      ...defaultTypes,
      ...customTypes.value.map((t) => t.name)
    ]);
    const showTypeModal = () => {
      typeModalVisible.value = true;
    };
    const getAccountTypes = async () => {
      const token = common_vendor.index.getStorageSync("token");
      try {
        const res = await common_vendor.index.request({
          url: common_config.websiteUrl + "/with-state/account-types",
          method: "GET",
          header: {
            "Authorization": token
          }
        });
        customTypes.value = res.data.data || [];
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/stock/stock.vue:295", "获取分类失败:", err);
      }
    };
    const addNewType = async () => {
      if (!newTypeName.value.trim()) {
        common_vendor.index.showToast({
          title: "请输入分类名称",
          icon: "none"
        });
        return;
      }
      const token = common_vendor.index.getStorageSync("token");
      try {
        await common_vendor.index.request({
          url: common_config.websiteUrl + "/with-state/add-account-type",
          method: "POST",
          header: {
            "Authorization": token
          },
          data: {
            name: newTypeName.value.trim()
          }
        });
        await getAccountTypes();
        newTypeName.value = "";
        common_vendor.index.showToast({
          title: "添加成功"
        });
      } catch (err) {
        common_vendor.index.showToast({
          title: "添加失败",
          icon: "none"
        });
      }
    };
    const deleteType = async (id) => {
      common_vendor.index.showModal({
        title: "确认删除",
        // content: '如果该分类下存在物品，则不可以直接删除分类',
        success: async (res) => {
          if (res.confirm) {
            const token = common_vendor.index.getStorageSync("token");
            try {
              const response = await common_vendor.index.request({
                url: common_config.websiteUrl + "/with-state/delete-account-type",
                method: "POST",
                header: {
                  "Authorization": token,
                  "Content-Type": "application/json"
                  // 添加Content-Type
                },
                data: {
                  id
                }
                // 使用JSON格式传参
              });
              const resData = response.data;
              if (resData.status === "success") {
                await getAccountTypes();
                common_vendor.index.showToast({
                  title: "删除成功"
                });
              } else {
                common_vendor.index.showToast({
                  title: resData.msg || "删除失败",
                  icon: "none"
                });
              }
            } catch (err) {
              common_vendor.index.__f__("error", "at pages/stock/stock.vue:370", "删除失败:", err);
              common_vendor.index.showToast({
                title: err.errMsg || "请求失败",
                icon: "none"
              });
            }
          }
        }
      });
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
    const totalPrice = common_vendor.computed(() => {
      if (!accountBookData.value.account_books)
        return 0;
      return accountBookData.value.account_books.reduce((sum, item) => {
        return sum + (parseFloat(item.price) || 0);
      }, 0).toFixed(2);
    });
    function updateSelectedType(e) {
      selectedType.value = e.detail.value;
      const selectedTypeName = typeOptions.value[selectedType.value];
      getAccountBookData(selectedTypeName === "全部" ? "" : selectedTypeName);
    }
    function getAccountBookData(type) {
      common_vendor.index.__f__("log", "at pages/stock/stock.vue:421", common_config.global);
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
          common_vendor.index.__f__("log", "at pages/stock/stock.vue:439", res.data.data);
          accountBookData.value = res.data.data;
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/stock/stock.vue:443", err);
        }
      });
    }
    function getShowcaseData() {
      common_vendor.index.__f__("log", "at pages/stock/stock.vue:450", common_config.global);
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
          common_vendor.index.__f__("log", "at pages/stock/stock.vue:464", res.data.data);
          showcaseData.value = res.data.data;
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/stock/stock.vue:468", err);
        }
      });
    }
    function getBillData() {
      common_vendor.index.__f__("log", "at pages/stock/stock.vue:475", common_config.global);
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
          common_vendor.index.__f__("log", "at pages/stock/stock.vue:489", res.data.data);
          billData.value = res.data.data;
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/stock/stock.vue:493", err);
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
        getAccountTypes();
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
        g: common_vendor.t(typeOptions.value[selectedType.value]),
        h: selectedType.value,
        i: typeOptions.value,
        j: common_vendor.o(updateSelectedType),
        k: common_vendor.o(showTypeModal),
        l: common_vendor.t(totalPrice.value),
        m: ((_a = accountBookData.value.account_books) == null ? void 0 : _a.length) > 0
      }, ((_b = accountBookData.value.account_books) == null ? void 0 : _b.length) > 0 ? {
        n: common_vendor.f(accountBookData.value.account_books, (item, index, i0) => {
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
        o: common_assets._imports_0$3
      }, {
        p: common_vendor.p({
          name: transitionName(),
          ["mode-class"]: ["fade", "slide-left"],
          duration: 300,
          show: activeTab.value === 1
        }),
        q: showcaseData.value.showcases && showcaseData.value.showcases.length > 0
      }, showcaseData.value.showcases && showcaseData.value.showcases.length > 0 ? {
        r: common_vendor.f(showcaseData.value.showcases, (item, index, i0) => {
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
        s: common_assets._imports_1$2,
        t: common_assets._imports_2$1
      } : {
        v: common_assets._imports_0$3
      }, {
        w: common_vendor.p({
          name: transitionName(),
          ["mode-class"]: transitionName(),
          duration: 300,
          show: activeTab.value === 2
        }),
        x: Object.keys(billData.value).length > 0
      }, Object.keys(billData.value).length > 0 ? {
        y: common_vendor.f(billData.value, (bills, month, i0) => {
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
        z: common_assets._imports_0$3
      }, {
        A: common_vendor.p({
          name: transitionName(),
          ["mode-class"]: ["fade", "slide-bottom"],
          duration: 300,
          show: activeTab.value === 3
        }),
        B: common_vendor.f(customTypes.value, (type, index, i0) => {
          return {
            a: common_vendor.t(type.name),
            b: common_vendor.o(($event) => deleteType(type.id), type.id),
            c: "4829e7f4-5-" + i0 + ",4829e7f4-4",
            d: type.id
          };
        }),
        C: common_vendor.p({
          type: "trash",
          size: "22",
          color: "#ff6666"
        }),
        D: newTypeName.value,
        E: common_vendor.o(($event) => newTypeName.value = $event.detail.value),
        F: common_vendor.o(addNewType),
        G: common_vendor.o((val) => typeModalVisible.value = val),
        H: common_vendor.p({
          visible: typeModalVisible.value,
          top: "300rpx",
          height: "60%"
        }),
        I: common_vendor.p({
          type: "plusempty",
          size: "30",
          color: "#fff"
        }),
        J: common_vendor.o(handleFloatingButton),
        K: common_vendor.p({
          head_color: "#d8deff"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4829e7f4"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/stock/stock.js.map
