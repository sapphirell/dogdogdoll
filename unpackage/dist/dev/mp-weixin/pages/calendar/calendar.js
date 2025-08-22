"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const common_config = require("../../common/config.js");
if (!Array) {
  const _easycom_view_logs2 = common_vendor.resolveComponent("view-logs");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_loading_toast2 = common_vendor.resolveComponent("loading-toast");
  const _easycom_common_page2 = common_vendor.resolveComponent("common-page");
  (_easycom_view_logs2 + _easycom_uni_icons2 + _easycom_loading_toast2 + _easycom_common_page2)();
}
const _easycom_view_logs = () => "../../components/view-logs/view-logs.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_loading_toast = () => "../../components/loading-toast/loading-toast.js";
const _easycom_common_page = () => "../../components/common-page/common-page.js";
if (!Math) {
  (_easycom_view_logs + _easycom_uni_icons + _easycom_loading_toast + _easycom_common_page)();
}
const _sfc_main = {
  __name: "calendar",
  setup(__props) {
    const activeTab = common_vendor.ref("sale");
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
    const sizeList = common_vendor.ref([
      "全部尺寸",
      "四分",
      "六分",
      "三分",
      "其它大尺寸",
      "八分",
      "十二分",
      "一分",
      "二分",
      "五分",
      "棉花娃",
      "眼珠"
    ]);
    const getOrderTypeText = (type) => {
      const typeMap = {
        1: "限时手速",
        2: "抽选投递",
        3: "黑箱卡投递"
      };
      return typeMap[type] || "未知类型";
    };
    let activeType = common_vendor.ref("全部");
    let activeSize = common_vendor.ref("全部尺寸");
    const saleCalendar = common_vendor.ref({});
    const makeupCalendar = common_vendor.ref({});
    const brandNames = common_vendor.ref({});
    const expandStates = common_vendor.ref({});
    const toggleFold = (planId) => {
      expandStates.value[planId] = !expandStates.value[planId];
    };
    const getHighlightImages = (imagesString) => {
      if (!imagesString)
        return [];
      return imagesString.split(",").filter((img) => img.trim() !== "");
    };
    const previewImage = (url) => {
      common_vendor.index.previewImage({
        urls: [url],
        current: url
      });
    };
    const today = /* @__PURE__ */ new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const todayFormat = common_vendor.ref(`${year}-${month}-${day}`);
    common_vendor.ref(null);
    const systemInfo = common_vendor.index.getSystemInfoSync();
    const screenWidth = systemInfo.screenWidth;
    const itemWidth = screenWidth / 7;
    let scrollLeft = common_vendor.ref(0);
    let chooseDate = common_vendor.ref(todayFormat.value);
    let chooseItem = common_vendor.ref({});
    let loading = common_vendor.ref(true);
    const currentCalendar = common_vendor.computed(() => {
      if (activeTab.value === "sale") {
        return filteredSaleCalendar.value;
      }
      return makeupCalendar.value;
    });
    const getPriceRange = (plan) => {
      const tiers = getTiers(plan);
      if (!tiers || tiers.length === 0) {
        return "待定";
      }
      const prices = tiers.map((tier) => parseFloat(tier.price)).filter((price) => !isNaN(price));
      if (prices.length === 0) {
        return "待定";
      }
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      if (min === max) {
        return `${min}元`;
      }
      return `${min}-${max}元`;
    };
    const switchTab = (tab) => {
      if (activeTab.value === tab)
        return;
      activeTab.value = tab;
      chooseDate.value = todayFormat.value;
      if (tab === "makeup" && Object.keys(makeupCalendar.value).length === 0) {
        fetchMakeupCalendar();
      } else {
        updateSelectedItem();
      }
    };
    const filteredSaleCalendar = common_vendor.computed(() => {
      const filtered = {};
      Object.entries(saleCalendar.value).forEach(([date, info]) => {
        const copy = {
          ...info
        };
        if (copy.goods) {
          copy.goods = copy.goods.filter((g) => {
            const typeMatch = activeType.value === "全部" || g.type === activeType.value;
            const sizeMatch = activeSize.value === "全部尺寸" || g.size === activeSize.value;
            return typeMatch && sizeMatch;
          });
          copy.goods_number = copy.goods.length;
          if (copy.goods.length === 0) {
            copy.goods = null;
          }
        }
        filtered[date] = copy;
      });
      return filtered;
    });
    const fetchSaleCalendar = () => {
      loading.value = true;
      common_vendor.index.request({
        url: common_config.websiteUrl.value + `/goods-news`,
        method: "GET",
        timeout: 5e3,
        success: (res) => {
          saleCalendar.value = res.data.data;
          chooseItem.value = saleCalendar.value[todayFormat.value] || {
            goods: null
          };
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/calendar/calendar.vue:445", err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        },
        complete: () => {
          scrollLeft.value = itemWidth * 7 - 5;
          loading.value = false;
        }
      });
    };
    const fetchMakeupCalendar = () => {
      loading.value = true;
      common_vendor.index.request({
        url: common_config.websiteUrl.value + `/bjd-makeup-news`,
        method: "GET",
        timeout: 5e3,
        success: (res) => {
          makeupCalendar.value = res.data.data;
          chooseItem.value = makeupCalendar.value[todayFormat.value] || {
            plans: null
          };
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/calendar/calendar.vue:472", err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        },
        complete: () => {
          loading.value = false;
        }
      });
    };
    const fetchBrandNames = () => {
      brandNames.value = {
        938: "小圆点儿工作室"
      };
    };
    function isToday(date) {
      return date === todayFormat.value;
    }
    const handleSizeClick = (size) => {
      activeSize.value = size;
    };
    const handleTabClick = (type) => {
      activeType.value = type;
    };
    function updateSelectedItem() {
      const calendar = currentCalendar.value;
      if (calendar[chooseDate.value]) {
        chooseItem.value = calendar[chooseDate.value];
        return;
      }
      const firstValidEntry = Object.entries(calendar).find(
        ([_, v]) => activeTab.value === "sale" && v.goods || activeTab.value === "makeup" && v.plans
      );
      if (firstValidEntry) {
        chooseDate.value = firstValidEntry[0];
        chooseItem.value = firstValidEntry[1];
      } else {
        chooseItem.value = activeTab.value === "sale" ? {
          goods: null
        } : {
          plans: null
        };
      }
    }
    function jumpGoods(id, goodsId) {
      common_vendor.index.request({
        url: common_config.websiteUrl.value + "/sale-record-click?id=" + id,
        method: "POST",
        header: {
          "Content-Type": "application/json"
        },
        success: () => common_vendor.index.__f__("log", "at pages/calendar/calendar.vue:570", "点击记录成功"),
        fail: (err) => common_vendor.index.__f__("error", "at pages/calendar/calendar.vue:571", "点击记录失败:", err)
      });
      common_vendor.index.navigateTo({
        url: "/pages/goods/goods?goods_id=" + goodsId
      });
    }
    const navigateToArtistDetail = (artist) => {
      common_vendor.index.navigateTo({
        url: "/pages/artist_info/artist_info?brand_id=" + artist.brand_id
      });
    };
    function selectDate(date, item) {
      chooseDate.value = date;
      chooseItem.value = item;
    }
    function formatTimestamp(timestamp) {
      const date = new Date(timestamp * 1e3);
      const month2 = (date.getMonth() + 1).toString().padStart(2, "0");
      const day2 = date.getDate().toString().padStart(2, "0");
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${month2}/${day2} ${hours}:${minutes}`;
    }
    const getTiers = (plan) => {
      try {
        const config = JSON.parse(plan.order_config);
        return config.tiers || [];
      } catch {
        return [];
      }
    };
    const getAddons = (plan) => {
      try {
        const config = JSON.parse(plan.order_config);
        return config.addons || [];
      } catch {
        return [];
      }
    };
    common_vendor.watch([filteredSaleCalendar, makeupCalendar], () => {
      updateSelectedItem();
    });
    common_vendor.onLoad(() => {
      fetchSaleCalendar();
      fetchBrandNames();
    });
    common_vendor.onPullDownRefresh(async () => {
      try {
        if (activeTab.value === "sale") {
          fetchSaleCalendar();
        } else {
          fetchMakeupCalendar();
        }
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
        a: activeTab.value === "sale"
      }, activeTab.value === "sale" ? {} : {}, {
        b: activeTab.value === "sale" ? 1 : "",
        c: common_vendor.o(($event) => switchTab("sale")),
        d: activeTab.value === "makeup"
      }, activeTab.value === "makeup" ? {} : {}, {
        e: activeTab.value === "makeup" ? 1 : "",
        f: common_vendor.o(($event) => switchTab("makeup")),
        g: activeTab.value === "sale"
      }, activeTab.value === "sale" ? {
        h: common_vendor.f(tabList.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item),
            b: index,
            c: common_vendor.unref(activeType) === item ? 1 : "",
            d: common_vendor.o(($event) => handleTabClick(item), index)
          };
        })
      } : {}, {
        i: activeTab.value === "sale"
      }, activeTab.value === "sale" ? {
        j: common_vendor.f(sizeList.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item),
            b: index,
            c: common_vendor.unref(activeSize) === item ? 1 : "",
            d: common_vendor.o(($event) => handleSizeClick(item), index)
          };
        })
      } : {}, {
        k: activeTab.value === "makeup"
      }, activeTab.value === "makeup" ? {} : {}, {
        l: common_vendor.f(currentCalendar.value, (item, date, i0) => {
          return common_vendor.e({
            a: activeTab.value === "sale" && item.goods_number > 0
          }, activeTab.value === "sale" && item.goods_number > 0 ? {
            b: common_vendor.t(item.goods_number)
          } : activeTab.value === "makeup" && item.plans_number > 0 ? {
            d: common_vendor.t(item.plans_number)
          } : {}, {
            c: activeTab.value === "makeup" && item.plans_number > 0,
            e: common_vendor.t(item.weekday),
            f: item.weekday === "周日" || item.weekday === "周六" ? 1 : "",
            g: common_vendor.t(isToday(date) ? "今天" : item.day_number),
            h: common_vendor.unref(chooseDate) === date ? 1 : "",
            i: date,
            j: common_vendor.o(($event) => selectDate(date, item), date)
          });
        }),
        m: common_vendor.unref(scrollLeft),
        n: activeTab.value === "sale"
      }, activeTab.value === "sale" ? common_vendor.e({
        o: common_vendor.t(common_vendor.unref(chooseDate)),
        p: common_vendor.t(common_vendor.unref(chooseItem).weekday),
        q: common_vendor.unref(chooseItem).goods == null
      }, common_vendor.unref(chooseItem).goods == null ? {
        r: common_assets._imports_0$6
      } : {
        s: common_vendor.f(common_vendor.unref(chooseItem).goods, (good, k0, i0) => {
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
      }) : common_vendor.e({
        t: common_vendor.t(common_vendor.unref(chooseDate)),
        v: common_vendor.t(common_vendor.unref(chooseItem).weekday),
        w: common_vendor.unref(chooseItem).plans == null || common_vendor.unref(chooseItem).plans.length === 0
      }, common_vendor.unref(chooseItem).plans == null || common_vendor.unref(chooseItem).plans.length === 0 ? {
        x: common_assets._imports_0$6
      } : {
        y: common_vendor.f(common_vendor.unref(chooseItem).plans, (plan, k0, i0) => {
          return common_vendor.e({
            a: plan.artist_info && plan.artist_info.LogoImage
          }, plan.artist_info && plan.artist_info.LogoImage ? {
            b: plan.artist_info.LogoImage
          } : {}, {
            c: common_vendor.t(plan.artist_name),
            d: common_vendor.t(getPriceRange(plan)),
            e: plan.artist_info && plan.artist_info.Description
          }, plan.artist_info && plan.artist_info.Description ? {
            f: common_vendor.t(plan.artist_info.Description)
          } : {}, {
            g: plan.artist_info && plan.artist_info.artist_highlight_images
          }, plan.artist_info && plan.artist_info.artist_highlight_images ? {
            h: common_vendor.f(getHighlightImages(plan.artist_info.artist_highlight_images), (img, index, i1) => {
              return {
                a: index,
                b: img,
                c: common_vendor.o(($event) => previewImage(img), index)
              };
            })
          } : {}, {
            i: common_vendor.t(formatTimestamp(plan.open_time)),
            j: common_vendor.t(formatTimestamp(plan.close_time)),
            k: common_vendor.t(getOrderTypeText(plan.order_type)),
            l: common_vendor.t(plan.max_participants === 0 ? "不限量" : plan.max_participants),
            m: common_vendor.t(plan.max_submissions_per_user),
            n: common_vendor.f(getTiers(plan), (tier, k1, i1) => {
              return {
                a: common_vendor.t(tier.title),
                b: common_vendor.t(tier.price),
                c: common_vendor.t(tier.description),
                d: tier.title
              };
            }),
            o: getAddons(plan).length > 0
          }, getAddons(plan).length > 0 ? {
            p: common_vendor.f(getAddons(plan), (addon, k1, i1) => {
              return {
                a: common_vendor.t(addon.title),
                b: common_vendor.t(addon.price),
                c: common_vendor.t(addon.description),
                d: addon.title
              };
            })
          } : {}, {
            q: expandStates.value[plan.id] ? 1 : "",
            r: common_vendor.t(expandStates.value[plan.id] ? "收起" : "展开"),
            s: "6e8913ab-2-" + i0 + ",6e8913ab-0",
            t: common_vendor.p({
              type: expandStates.value[plan.id] ? "arrowup" : "arrowdown",
              size: "16",
              color: "#81D8cf"
            }),
            v: common_vendor.o(($event) => toggleFold(plan.id), plan.id),
            w: plan.id,
            x: common_vendor.o(($event) => navigateToArtistDetail(plan.artist_info), plan.id)
          });
        })
      }), {
        z: common_vendor.p({
          show: common_vendor.unref(loading)
        }),
        A: common_vendor.p({
          head_color: "rgb(185 195 253)"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-6e8913ab"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/calendar/calendar.js.map
