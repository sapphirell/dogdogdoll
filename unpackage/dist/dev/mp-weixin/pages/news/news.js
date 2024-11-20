"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "news",
  setup(__props) {
    let news = common_vendor.ref({});
    const today = /* @__PURE__ */ new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const todayFormat = `${year}-${month}-${day}`;
    common_vendor.ref(null);
    const systemInfo = common_vendor.index.getSystemInfoSync();
    const screenWidth = systemInfo.screenWidth;
    const itemWidth = screenWidth / 7;
    let scrollLeft = common_vendor.ref(0);
    const statusBarHeight = common_vendor.ref(systemInfo.statusBarHeight);
    console.log("状态栏高度" + statusBarHeight.value);
    let chooseDate = common_vendor.ref(todayFormat);
    let chooseItem = common_vendor.ref({});
    common_vendor.index.showLoading({
      title: "加载中"
    });
    function getDateMap() {
      common_vendor.index.request({
        url: "http://localhost:8080/goods-news",
        method: "GET",
        timeout: 5e3,
        success: (res) => {
          console.log(res.data.data);
          news.value = res.data.data;
          for (let [key, value] of Object.entries(news.value)) {
            if (key === todayFormat) {
              chooseItem.value = value;
            }
          }
        },
        fail: (err) => {
          console.log(err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        },
        complete: () => {
          scrollLeft.value = itemWidth * 7 - 5;
          console.log("left:" + scrollLeft.value);
          common_vendor.index.hideLoading();
        }
      });
    }
    function selectDate(date, item) {
      console.log(item);
      chooseDate.value = date;
      chooseItem.value = item;
    }
    function formatTimestamp(timestamp) {
      const date = new Date(timestamp * 1e3);
      const year2 = date.getFullYear();
      const month2 = (date.getMonth() + 1).toString().padStart(2, "0");
      const day2 = date.getDate().toString().padStart(2, "0");
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const seconds = date.getSeconds().toString().padStart(2, "0");
      return `${year2}-${month2}-${day2} ${hours}:${minutes}:${seconds}`;
    }
    function jumpGoods(id) {
      common_vendor.index.navigateTo({
        url: "/pages/goods/goods?goods_id=" + id
      });
    }
    getDateMap();
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(common_vendor.unref(news), (item, date, i0) => {
          return common_vendor.e({
            a: item.weekday === "日" || item.weekday === "六"
          }, item.weekday === "日" || item.weekday === "六" ? {
            b: common_vendor.t(item.weekday)
          } : {}, {
            c: item.weekday !== "日" && item.weekday !== "六"
          }, item.weekday !== "日" && item.weekday !== "六" ? {
            d: common_vendor.t(item.weekday)
          } : {}, {
            e: common_vendor.unref(chooseDate) !== date
          }, common_vendor.unref(chooseDate) !== date ? {
            f: common_vendor.t(item.day_number)
          } : {}, {
            g: common_vendor.unref(chooseDate) === date
          }, common_vendor.unref(chooseDate) === date ? {
            h: common_vendor.t(item.day_number)
          } : {}, {
            i: item.goods != null
          }, item.goods != null ? {} : {}, {
            j: item.id,
            k: common_vendor.o(($event) => selectDate(date, item), item.id)
          });
        }),
        b: common_vendor.unref(scrollLeft),
        c: common_vendor.t(common_vendor.unref(chooseDate)),
        d: common_vendor.t(common_vendor.unref(chooseItem).weekday),
        e: common_vendor.unref(chooseItem).goods == null
      }, common_vendor.unref(chooseItem).goods == null ? {} : {}, {
        f: common_vendor.f(common_vendor.unref(chooseItem).goods, (good, k0, i0) => {
          return common_vendor.e({
            a: good.goods_image,
            b: common_vendor.t(good.sale_type),
            c: common_vendor.o(($event) => jumpGoods(good.goods_id), good.id),
            d: common_vendor.t(good.brand_name),
            e: common_vendor.t(good.goods_name),
            f: common_vendor.t(good.size),
            g: common_vendor.t(good.size_detail),
            h: common_vendor.t(good.type),
            i: common_vendor.t(formatTimestamp(good.sub_time)),
            j: good.sale_type != "限量现货" && good.sale_type != "不限量现货"
          }, good.sale_type != "限量现货" && good.sale_type != "不限量现货" ? {
            k: common_vendor.t(good.sub_amount),
            l: common_vendor.t(good.currency),
            m: common_vendor.t(good.fin_amount)
          } : {}, {
            n: good.sale_type == "限量现货" || good.sale_type == "不限量现货"
          }, good.sale_type == "限量现货" || good.sale_type == "不限量现货" ? {
            o: common_vendor.t(good.sub_amount + good.fin_amount),
            p: common_vendor.t(good.currency)
          } : {}, {
            q: common_vendor.o(($event) => jumpGoods(good.goods_id), good.id),
            r: good.id
          });
        }),
        g: statusBarHeight.value + "px"
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-24bc9d41"]]);
wx.createPage(MiniProgramPage);
