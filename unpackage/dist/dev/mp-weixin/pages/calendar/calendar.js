"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const common_config = require("../../common/config.js");
if (!Array) {
  const _easycom_view_logs2 = common_vendor.resolveComponent("view-logs");
  const _easycom_common_search2 = common_vendor.resolveComponent("common-search");
  const _easycom_loading_toast2 = common_vendor.resolveComponent("loading-toast");
  const _easycom_common_page2 = common_vendor.resolveComponent("common-page");
  (_easycom_view_logs2 + _easycom_common_search2 + _easycom_loading_toast2 + _easycom_common_page2)();
}
const _easycom_view_logs = () => "../../components/view-logs/view-logs.js";
const _easycom_common_search = () => "../../components/common-search/common-search.js";
const _easycom_loading_toast = () => "../../components/loading-toast/loading-toast.js";
const _easycom_common_page = () => "../../components/common-page/common-page.js";
if (!Math) {
  (_easycom_view_logs + _easycom_common_search + _easycom_loading_toast + _easycom_common_page)();
}
const _sfc_main = {
  __name: "calendar",
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
    let originalNews = common_vendor.ref({});
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
    common_vendor.ref(systemInfo.statusBarHeight);
    let chooseDate = common_vendor.ref(todayFormat);
    let chooseItem = common_vendor.ref({});
    let loading = common_vendor.ref(true);
    function getDateMap() {
      loading.value = true;
      common_vendor.index.request({
        url: common_config.websiteUrl + `/goods-news`,
        method: "GET",
        timeout: 5e3,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/calendar/calendar.vue:189", res.data.data);
          originalNews.value = res.data.data;
          news.value = filterNews("全部");
          for (let [key, value] of Object.entries(news.value)) {
            if (key === todayFormat) {
              chooseItem.value = value;
            }
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/calendar/calendar.vue:199", err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        },
        complete: () => {
          scrollLeft.value = itemWidth * 7 - 5;
          common_vendor.index.__f__("log", "at pages/calendar/calendar.vue:207", "left:" + scrollLeft.value);
          loading.value = false;
        }
      });
    }
    function isToday(date) {
      return date === todayFormat;
    }
    function filterNews(type) {
      const filtered = {};
      Object.entries(originalNews.value).forEach(([date, info]) => {
        const copy = {
          ...info
        };
        if (copy.goods) {
          copy.goods = type === "全部" ? copy.goods : copy.goods.filter((g) => g.type === type);
          if (copy.goods.length === 0)
            copy.goods = null;
        }
        filtered[date] = copy;
      });
      return filtered;
    }
    const handleTabClick = (type) => {
      activeType.value = type;
      const filtered = filterNews(type);
      news.value = {
        ...filtered
      };
      const firstValidEntry = Object.entries(filtered).find(([_, v]) => v.goods);
      if (firstValidEntry) {
        chooseDate.value = firstValidEntry[0];
        chooseItem.value = firstValidEntry[1];
      } else {
        chooseItem.value = {
          goods: null
        };
      }
    };
    function jumpGoods(id, goodsId) {
      common_vendor.index.request({
        url: common_config.websiteUrl + "/sale-record-click?id=" + id,
        method: "POST",
        header: {
          "Content-Type": "application/json"
        },
        success: () => {
          common_vendor.index.__f__("log", "at pages/calendar/calendar.vue:259", "点击记录成功");
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/calendar/calendar.vue:262", "点击记录失败:", err);
        }
      });
      common_vendor.index.navigateTo({
        url: "/pages/goods/goods?goods_id=" + goodsId
      });
    }
    function selectDate(date, item) {
      common_vendor.index.__f__("log", "at pages/calendar/calendar.vue:273", item);
      chooseDate.value = date;
      chooseItem.value = item;
    }
    function formatTimestamp(timestamp) {
      const date = new Date(timestamp * 1e3);
      date.getFullYear();
      const month2 = (date.getMonth() + 1).toString().padStart(2, "0");
      const day2 = date.getDate().toString().padStart(2, "0");
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${month2}-${day2} ${hours}:${minutes}`;
    }
    getDateMap();
    common_vendor.onPullDownRefresh(async () => {
      try {
        getDateMap();
        common_vendor.index.stopPullDownRefresh();
      } catch (error) {
        common_vendor.index.stopPullDownRefresh();
        common_vendor.index.showToast({
          title: "刷新失败",
          icon: "none"
        });
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          width: "560rpx"
        }),
        b: common_vendor.s("width:500rpx; margin:0rpx 20rpx 10rpx 20rpx;"),
        c: common_vendor.f(tabList.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item),
            b: index,
            c: common_vendor.unref(activeType) === item ? 1 : "",
            d: common_vendor.o(($event) => handleTabClick(item), index)
          };
        }),
        d: common_vendor.f(common_vendor.unref(news), (item, date, i0) => {
          return common_vendor.e({
            a: item.goods_number > 0
          }, item.goods_number > 0 ? {
            b: common_vendor.t(item.goods_number)
          } : {}, {
            c: common_vendor.t(item.weekday),
            d: item.weekday === "周日" || item.weekday === "周六" ? 1 : "",
            e: common_vendor.t(isToday(date) ? "今天" : item.day_number),
            f: common_vendor.unref(chooseDate) === date ? 1 : "",
            g: item.id,
            h: common_vendor.o(($event) => selectDate(date, item), item.id)
          });
        }),
        e: common_vendor.unref(scrollLeft),
        f: common_vendor.t(common_vendor.unref(chooseDate)),
        g: common_vendor.t(common_vendor.unref(chooseItem).weekday),
        h: common_vendor.unref(chooseItem).goods == null
      }, common_vendor.unref(chooseItem).goods == null ? {
        i: common_assets._imports_0$6
      } : {
        j: common_vendor.f(common_vendor.unref(chooseItem).goods, (good, k0, i0) => {
          return common_vendor.e({
            a: good.goods_image,
            b: common_vendor.t(good.sale_type),
            c: good.is_first_sale_day == 1
          }, good.is_first_sale_day == 1 ? {} : {}, {
            d: common_vendor.t(good.brand_name),
            e: common_vendor.t(good.goods_name),
            f: common_vendor.t(good.size),
            g: common_vendor.t(good.size_detail),
            h: common_vendor.t(good.type),
            i: common_vendor.t(formatTimestamp(good.sub_time)),
            j: good.sub_time_end
          }, good.sub_time_end ? {
            k: common_vendor.t(formatTimestamp(good.sub_time_end))
          } : {}, {
            l: good.sale_type != "限量现货" && good.sale_type != "不限量现货"
          }, good.sale_type != "限量现货" && good.sale_type != "不限量现货" ? {
            m: common_vendor.t(good.sub_amount),
            n: common_vendor.t(good.currency),
            o: common_vendor.t(good.fin_amount)
          } : {
            p: common_vendor.t(good.sub_amount + good.fin_amount),
            q: common_vendor.t(good.currency)
          }, {
            r: good.id,
            s: common_vendor.o(($event) => jumpGoods(good.id, good.goods_id), good.id)
          });
        })
      }, {
        k: common_vendor.p({
          show: common_vendor.unref(loading)
        }),
        l: common_vendor.p({
          head_color: "rgb(185 195 253)"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-6e8913ab"]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/calendar/calendar.js.map
