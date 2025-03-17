"use strict";
const common_vendor = require("../../common/vendor.js");
const common_config = require("../../common/config.js");
if (!Array) {
  const _easycom_common_search2 = common_vendor.resolveComponent("common-search");
  const _easycom_common_page2 = common_vendor.resolveComponent("common-page");
  (_easycom_common_search2 + _easycom_common_page2)();
}
const _easycom_common_search = () => "../../components/common-search/common-search.js";
const _easycom_common_page = () => "../../components/common-page/common-page.js";
if (!Math) {
  (_easycom_common_search + _easycom_common_page)();
}
const _sfc_main = {
  __name: "news",
  setup(__props) {
    const tabList = common_vendor.ref([
      "全部",
      "整体",
      "单头",
      "单体",
      "娃衣",
      "眼珠",
      "娃鞋",
      "手型",
      "脚型",
      "袜子",
      "配饰"
    ]);
    let activeType = common_vendor.ref("全部");
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
    common_vendor.index.__f__("log", "at pages/news/news.vue:123", "状态栏高度" + statusBarHeight.value);
    let chooseDate = common_vendor.ref(todayFormat);
    let chooseItem = common_vendor.ref({});
    common_vendor.index.showLoading({
      title: "加载中"
    });
    function getDateMap(type = "全部开售") {
      common_vendor.index.request({
        url: common_config.websiteUrl + `/goods-news?type=${type}`,
        method: "GET",
        timeout: 5e3,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/news/news.vue:152", res.data.data);
          news.value = res.data.data;
          for (let [key, value] of Object.entries(news.value)) {
            if (key === todayFormat) {
              chooseItem.value = value;
            }
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/news/news.vue:162", err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        },
        complete: () => {
          scrollLeft.value = itemWidth * 7 - 5;
          common_vendor.index.__f__("log", "at pages/news/news.vue:170", "left:" + scrollLeft.value);
          common_vendor.index.hideLoading();
        }
      });
    }
    const handleTabClick = (type) => {
      activeType.value = type;
      getDateMap(type);
    };
    function selectDate(date, item) {
      common_vendor.index.__f__("log", "at pages/news/news.vue:185", item);
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
        a: common_vendor.f(tabList.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item),
            b: index,
            c: common_vendor.unref(activeType) === item ? 1 : "",
            d: common_vendor.o(($event) => handleTabClick(item), index)
          };
        }),
        b: common_vendor.f(common_vendor.unref(news), (item, date, i0) => {
          return common_vendor.e({
            a: item.weekday === "周日" || item.weekday === "周六"
          }, item.weekday === "周日" || item.weekday === "周六" ? {
            b: common_vendor.t(item.weekday)
          } : {}, {
            c: item.weekday !== "周日" && item.weekday !== "周六"
          }, item.weekday !== "周日" && item.weekday !== "周六" ? {
            d: common_vendor.t(item.weekday)
          } : {}, {
            e: common_vendor.unref(chooseDate) !== date
          }, common_vendor.unref(chooseDate) !== date ? {
            f: common_vendor.t(item.day_number)
          } : {
            g: common_vendor.t(item.day_number)
          }, {
            h: item.id,
            i: common_vendor.o(($event) => selectDate(date, item), item.id)
          });
        }),
        c: common_vendor.unref(scrollLeft),
        d: common_vendor.t(common_vendor.unref(chooseDate)),
        e: common_vendor.t(common_vendor.unref(chooseItem).weekday),
        f: common_vendor.unref(chooseItem).goods == null
      }, common_vendor.unref(chooseItem).goods == null ? {} : {}, {
        g: common_vendor.unref(chooseItem).goods
      }, common_vendor.unref(chooseItem).goods ? {
        h: common_vendor.f(common_vendor.unref(chooseItem).goods, (good, k0, i0) => {
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
        })
      } : {}, {
        i: common_vendor.p({
          head_color: "rgb(185 195 253)"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-24bc9d41"]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/news/news.js.map
