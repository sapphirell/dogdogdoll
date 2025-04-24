"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const common_config = require("../../../common/config.js");
const _sfc_main = {
  __name: "bill_form",
  props: ["bill_id"],
  setup(__props) {
    const props = __props;
    const isEdit = props.bill_id ? true : false;
    const name = common_vendor.ref("");
    const price = common_vendor.ref("");
    const date = common_vendor.ref("");
    const status = common_vendor.ref(0);
    const statusList = ["未补款", "已补款"];
    function getBillById(id) {
      let token = common_vendor.index.getStorageSync("token");
      common_vendor.index.request({
        url: common_config.websiteUrl + "/with-state/tail-bill-detail",
        method: "GET",
        header: { "Authorization": token },
        data: { id },
        success: (res) => {
          name.value = res.data.data.name;
          price.value = res.data.data.price;
          date.value = res.data.data.ymd;
          status.value = res.data.data.status;
          formattedDate.value = formatDate(res.data.data.ymd);
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/stock/bill_form/bill_form.vue:112", err);
        }
      });
    }
    const formattedDate = common_vendor.ref("");
    function updateDate(e) {
      const selectedDate = e.detail.value;
      date.value = selectedDate;
      formattedDate.value = formatDate(selectedDate);
    }
    function formatDate(dateStr) {
      let date2 = new Date(dateStr);
      const year = date2.getFullYear();
      const month = (date2.getMonth() + 1).toString().padStart(2, "0");
      const day = date2.getDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    function updateStatus(e) {
      status.value = e.detail.value;
    }
    common_vendor.onMounted(() => {
      if (isEdit) {
        getBillById(props.bill_id);
        common_vendor.index.setNavigationBarTitle({
          title: "编辑账单"
        });
      } else {
        common_vendor.index.setNavigationBarTitle({
          title: "新增账单"
        });
      }
    });
    function postSubmit() {
      if (isEdit) {
        updateBill();
      } else {
        addBill();
      }
    }
    function addBill() {
      let postData = {
        name: name.value,
        price: parseFloat(price.value),
        ymd: date.value,
        // 原始日期
        status: status.value
      };
      common_vendor.index.request({
        url: common_config.websiteUrl + "/with-state/add-tail-bill",
        method: "POST",
        header: {
          "Authorization": common_vendor.index.getStorageSync("token")
        },
        data: postData,
        success: (res) => {
          if (res.data.status == "success") {
            common_vendor.index.showToast({
              title: "提交成功",
              icon: "success"
            });
            setTimeout(() => {
              common_vendor.index.navigateBack();
            }, 500);
          } else {
            common_vendor.index.showToast({
              title: res.data.msg,
              icon: "none"
            });
          }
        }
      });
    }
    function updateBill() {
      let postData = {
        id: parseInt(props.bill_id, 10),
        name: name.value,
        price: parseFloat(price.value),
        ymd: date.value,
        // 原始日期
        status: status.value
      };
      common_vendor.index.request({
        url: common_config.websiteUrl + "/with-state/update-tail-bill",
        method: "POST",
        header: {
          "Authorization": common_vendor.index.getStorageSync("token")
        },
        data: postData,
        success: (res) => {
          if (res.data.status == "success") {
            common_vendor.index.showToast({
              title: "提交成功",
              icon: "success"
            });
            setTimeout(() => {
              common_vendor.index.navigateBack();
            }, 500);
          } else {
            common_vendor.index.showToast({
              title: res.data.msg,
              icon: "none"
            });
          }
        }
      });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: name.value,
        b: common_vendor.o(($event) => name.value = $event.detail.value),
        c: price.value,
        d: common_vendor.o(($event) => price.value = $event.detail.value),
        e: common_vendor.t(formattedDate.value || "请选择日期"),
        f: formattedDate.value,
        g: common_vendor.o(updateDate),
        h: common_vendor.t(statusList[status.value] || "请选择状态"),
        i: status.value,
        j: statusList,
        k: common_vendor.o(updateStatus),
        l: common_assets._imports_0$4,
        m: common_vendor.t(common_vendor.unref(isEdit) ? "修改" : "新增"),
        n: common_vendor.o(postSubmit),
        o: common_vendor.unref(isEdit)
      }, common_vendor.unref(isEdit) ? {
        p: common_vendor.o((...args) => _ctx.handleDelete && _ctx.handleDelete(...args))
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c24e185a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/stock/bill_form/bill_form.js.map
