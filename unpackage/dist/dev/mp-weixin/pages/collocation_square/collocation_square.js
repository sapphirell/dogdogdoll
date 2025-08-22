"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const common_config = require("../../common/config.js");
if (!Array) {
  const _easycom_view_logs2 = common_vendor.resolveComponent("view-logs");
  const _easycom_goods_search2 = common_vendor.resolveComponent("goods-search");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_transition2 = common_vendor.resolveComponent("uni-transition");
  const _easycom_common_modal2 = common_vendor.resolveComponent("common-modal");
  const _easycom_loading_toast2 = common_vendor.resolveComponent("loading-toast");
  const _easycom_common_page2 = common_vendor.resolveComponent("common-page");
  (_easycom_view_logs2 + _easycom_goods_search2 + _easycom_uni_icons2 + _easycom_uni_transition2 + _easycom_common_modal2 + _easycom_loading_toast2 + _easycom_common_page2)();
}
const _easycom_view_logs = () => "../../components/view-logs/view-logs.js";
const _easycom_goods_search = () => "../../components/goods-search/goods-search.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_transition = () => "../../uni_modules/uni-transition/components/uni-transition/uni-transition.js";
const _easycom_common_modal = () => "../../components/common-modal/common-modal.js";
const _easycom_loading_toast = () => "../../components/loading-toast/loading-toast.js";
const _easycom_common_page = () => "../../components/common-page/common-page.js";
if (!Math) {
  (_easycom_view_logs + _easycom_goods_search + _easycom_uni_icons + _easycom_uni_transition + _easycom_common_modal + _easycom_loading_toast + _easycom_common_page)();
}
const pageSize = 10;
const _sfc_main = {
  __name: "collocation_square",
  setup(__props) {
    const currentTab = common_vendor.ref("find");
    const collocationList = common_vendor.ref([]);
    const loading = common_vendor.ref(false);
    const noMore = common_vendor.ref(false);
    const currentPage = common_vendor.ref(1);
    const containerHeight = common_vendor.ref(0);
    const cardWidth = common_vendor.ref(0);
    const columnsHeight = common_vendor.reactive([0, 0]);
    const showFilterModal = common_vendor.ref(false);
    const filterBrand = common_vendor.ref("");
    const goodsOptions = common_vendor.ref([]);
    const instance = common_vendor.getCurrentInstance();
    const selectedBrand = common_vendor.ref(null);
    const filterGoods = common_vendor.ref([]);
    common_vendor.ref(null);
    const randomGoodsList = common_vendor.ref([]);
    const goodsLoading = common_vendor.ref(false);
    const goodsNoMore = common_vendor.ref(false);
    const goodsCursor = common_vendor.ref(-1);
    const selectedType = common_vendor.ref("全部");
    const selectedSize = common_vendor.ref("全部");
    const goodsTypes = common_vendor.ref([]);
    const sizes = common_vendor.ref([]);
    const showPostMenu = common_vendor.ref(false);
    const togglePostMenu = () => {
      showPostMenu.value = !showPostMenu.value;
    };
    const closePostMenu = () => {
      showPostMenu.value = false;
    };
    const goToCollocation = () => {
      closePostMenu();
      common_vendor.index.navigateTo({
        url: "/pages/collocation/collocation"
      });
    };
    const goToShowcase = () => {
      closePostMenu();
      common_vendor.index.navigateTo({
        url: "/pages/stock/showcase_form/showcase_form"
      });
    };
    const cardStyle = (index) => {
      const item = collocationList.value[index];
      if (!item.position)
        return {};
      return {
        left: `${item.position.left}px`,
        top: `${item.position.top}px`,
        width: `${cardWidth.value}px`
      };
    };
    const calculateLayout = (instance2) => {
      common_vendor.index.__f__("log", "at pages/collocation_square/collocation_square.vue:278", "进入计算布局逻辑");
      if (!instance2) {
        common_vendor.index.__f__("log", "at pages/collocation_square/collocation_square.vue:280", "无法获取instance");
        return;
      }
      common_vendor.index.__f__("log", "at pages/collocation_square/collocation_square.vue:283", "获取成功");
      if (!collocationList.value) {
        common_vendor.index.__f__("log", "at pages/collocation_square/collocation_square.vue:285", "无列表数据，不需要计算布局");
        return;
      }
      common_vendor.index.__f__("log", "at pages/collocation_square/collocation_square.vue:288", "获取成功，准备createSelectorQuery");
      common_vendor.index.__f__("log", "at pages/collocation_square/collocation_square.vue:289", instance2);
      const query = common_vendor.index.createSelectorQuery().in(instance2.proxy);
      common_vendor.index.__f__("log", "at pages/collocation_square/collocation_square.vue:291", "获取到query");
      const tasks = collocationList.value.map((_, index) => {
        return new Promise((resolve) => {
          query.select(`#card-${index}`).boundingClientRect((rect) => {
            resolve({
              index,
              rect
            });
          });
        });
      });
      query.exec(async () => {
        common_vendor.index.__f__("log", "at pages/collocation_square/collocation_square.vue:306", "进入Query");
        columnsHeight[0] = 0;
        columnsHeight[1] = 0;
        const results = await Promise.all(tasks);
        if (!results.length) {
          common_vendor.index.__f__("warn", "at pages/collocation_square/collocation_square.vue:314", "未查询到任何卡片元素");
          return;
        }
        results.forEach(({
          index,
          rect
        }) => {
          if (!rect) {
            common_vendor.index.__f__("error", "at pages/collocation_square/collocation_square.vue:322", `卡片${index}元素查询失败`);
            return;
          }
          const item = collocationList.value[index];
          const colIdx = columnsHeight[0] <= columnsHeight[1] ? 0 : 1;
          const left = colIdx * (cardWidth.value + 10);
          const top = columnsHeight[colIdx] + 10;
          columnsHeight[colIdx] = top + rect.height;
          item.position = {
            left,
            top
          };
        });
        containerHeight.value = Math.max(...columnsHeight) + 20;
      });
    };
    const handleTabSwitch = (tab) => {
      showPostMenu.value = false;
      showFilterModal.value = false;
      if (currentTab.value === "view") {
        collocationList.value.forEach((item) => {
          delete item.position;
        });
        columnsHeight[0] = 0;
        columnsHeight[1] = 0;
      }
      switchTab(tab);
    };
    const switchTab = (tab) => {
      currentTab.value = tab;
      if (tab === "find") {
        if (goodsTypes.value.length === 0) {
          fetchGoodsTypes();
          fetchSizes();
        }
        if (randomGoodsList.value.length === 0) {
          fetchRandomGoods(true);
        }
      }
      if (tab == "view") {
        fetchCollocations();
      }
    };
    const fetchGoodsTypes = async () => {
      try {
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl.value}/goods-types`,
          method: "GET"
        });
        if (res.data.status === "success") {
          goodsTypes.value = ["全部", ...res.data.data];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/collocation_square/collocation_square.vue:393", "获取商品分类失败:", error);
      }
    };
    const fetchSizes = async () => {
      try {
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl.value}/sizes?show_type=hot`,
          method: "GET"
        });
        if (res.data.status === "success") {
          const sizeKeys = Object.keys(res.data.data);
          sizes.value = ["全部", ...sizeKeys];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/collocation_square/collocation_square.vue:411", "获取尺寸分类失败:", error);
      }
    };
    const selectType = (type) => {
      selectedType.value = type;
      fetchRandomGoods(true);
    };
    const selectSize = (size) => {
      selectedSize.value = size;
      fetchRandomGoods(true);
    };
    const fetchRandomGoods = async (reset = false) => {
      if (reset) {
        randomGoodsList.value = [];
        goodsCursor.value = -1;
        goodsNoMore.value = false;
      }
      if (goodsLoading.value || goodsNoMore.value)
        return;
      try {
        goodsLoading.value = true;
        const params = {
          cursor: goodsCursor.value,
          page_size: 10,
          type: selectedType.value === "全部" ? "" : selectedType.value,
          size: selectedSize.value === "全部" ? "" : selectedSize.value
        };
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl.value}/random-list`,
          method: "POST",
          data: params,
          header: {
            "content-type": "application/json"
          }
        });
        if (res.data.status === "success") {
          const data = res.data.data;
          const newItems = data.goods_list || [];
          randomGoodsList.value = reset ? newItems : [...randomGoodsList.value, ...newItems];
          goodsCursor.value = data.next_cursor;
          goodsNoMore.value = newItems.length < 10;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/collocation_square/collocation_square.vue:465", "获取随机商品失败:", error);
        common_vendor.index.showToast({
          title: "加载失败",
          icon: "none"
        });
      } finally {
        goodsLoading.value = false;
      }
    };
    const loadMoreGoods = () => {
      fetchRandomGoods();
    };
    common_vendor.onMounted(() => {
      const systemInfo = common_vendor.index.getSystemInfoSync();
      const padding = 30;
      cardWidth.value = (systemInfo.windowWidth - padding) / 2;
      fetchGoodsTypes();
      fetchSizes();
      fetchRandomGoods(true);
    });
    common_vendor.onPullDownRefresh(async () => {
      try {
        if (currentTab.value === "view") {
          await fetchCollocations(true);
        } else if (currentTab.value === "find") {
          await fetchRandomGoods(true);
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
    const fetchCollocations = async (reset = false) => {
      if (reset) {
        collocationList.value = [];
        currentPage.value = 1;
        noMore.value = false;
        loading.value = false;
      }
      if (loading.value || noMore.value) {
        common_vendor.index.__f__("log", "at pages/collocation_square/collocation_square.vue:523", "正在加载或没有更多数据，停止请求");
        layoutFunction();
        return;
      }
      try {
        loading.value = true;
        const params = {
          page: currentPage.value,
          page_size: pageSize,
          filter_goods_id_list: filterGoods.value.map((g) => g.goods_id)
        };
        common_vendor.index.__f__("log", "at pages/collocation_square/collocation_square.vue:538", "请求参数:", JSON.stringify(params, null, 2));
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl.value}/collocation-list`,
          method: "POST",
          data: params,
          header: {
            "content-type": "application/json"
            // 确保使用JSON格式
          }
        });
        common_vendor.index.__f__("log", "at pages/collocation_square/collocation_square.vue:549", "接口响应:", res);
        if (res.data.status === "success") {
          const data = res.data.data || {};
          const newItems = Array.isArray(data.collocation_relation_list) ? data.collocation_relation_list : [];
          collocationList.value = reset ? newItems : [...collocationList.value, ...newItems];
          noMore.value = newItems.length < pageSize;
          currentPage.value++;
          if (reset && newItems.length === 0) {
            common_vendor.index.showToast({
              title: "暂无相关搭配",
              icon: "none"
            });
          }
          layoutFunction();
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/collocation_square/collocation_square.vue:575", "请求失败:", error);
        common_vendor.index.showToast({
          title: "加载失败",
          icon: "none"
        });
      } finally {
        loading.value = false;
      }
    };
    const layoutFunction = async () => {
      common_vendor.index.__f__("log", "at pages/collocation_square/collocation_square.vue:586", "等待next tick");
      await common_vendor.nextTick$1();
      common_vendor.index.__f__("log", "at pages/collocation_square/collocation_square.vue:588", "等待完成");
      calculateLayout(instance);
      setTimeout(() => {
        common_vendor.index.__f__("log", "at pages/collocation_square/collocation_square.vue:592", "二次计算布局");
        calculateLayout(instance);
      }, 500);
    };
    const showFilter = () => {
      showFilterModal.value = true;
    };
    const handleGoodsSelect = (goods) => {
      common_vendor.index.__f__("log", "at pages/collocation_square/collocation_square.vue:632", "选择商品:", goods);
      if (!(goods == null ? void 0 : goods.id))
        return;
      const newGoods = {
        goods_id: goods.id,
        goods_name: `${goods.brand_name ? goods.brand_name + "·" : ""}${goods.name}`
      };
      const exists = filterGoods.value.some(
        (item) => item.goods_id === newGoods.goods_id
      );
      if (!exists) {
        filterGoods.value = [...filterGoods.value, newGoods];
      }
    };
    function jumpGoods(id) {
      common_vendor.index.navigateTo({
        url: "/pages/goods/goods?goods_id=" + id
      });
    }
    const applyFilter = async () => {
      showFilterModal.value = false;
      await fetchCollocations(true);
    };
    const closeFilter = () => {
      showFilterModal.value = false;
    };
    const removeGood = (goodsId, event) => {
      var _a;
      (_a = event == null ? void 0 : event.stopPropagation) == null ? void 0 : _a.call(event);
      filterGoods.value = filterGoods.value.filter((g) => g.goods_id !== goodsId);
      noMore.value = false;
      fetchCollocations(true);
    };
    const resetFilter = () => {
      selectedBrand.value = null;
      filterBrand.value = "";
      filterGoods.value = [];
      goodsOptions.value = [];
    };
    function jump2collectionDetail(collocation_id, origin) {
      common_vendor.index.navigateTo({
        url: "/pages/collocation_share/collocation_share?collocation_id=" + collocation_id + "&origin=" + origin
      });
    }
    const loadMore = () => {
      if (!noMore.value)
        fetchCollocations();
    };
    const jumpToUserPage = (uid) => {
      common_vendor.index.navigateTo({
        url: `/pages/user_page/user_page?uid=${uid}`
      });
    };
    const getUserName = (name) => {
      return name.length > 10 ? `${name.toString().slice(-8)}...` : name;
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_assets._imports_0$9,
        b: currentTab.value === "find" ? 1 : "",
        c: common_vendor.o(($event) => handleTabSwitch("find")),
        d: common_assets._imports_1$6,
        e: currentTab.value === "view" ? 1 : "",
        f: common_vendor.o(($event) => handleTabSwitch("view")),
        g: currentTab.value === "find"
      }, currentTab.value === "find" ? common_vendor.e({
        h: common_vendor.p({
          ["hidden-icon"]: false,
          width: "670rpx"
        }),
        i: common_vendor.f(goodsTypes.value, (type, index, i0) => {
          return {
            a: common_vendor.t(type),
            b: index,
            c: selectedType.value === type ? 1 : "",
            d: common_vendor.o(($event) => selectType(type), index)
          };
        }),
        j: common_vendor.f(sizes.value, (size, index, i0) => {
          return {
            a: common_vendor.t(size),
            b: index,
            c: selectedSize.value === size ? 1 : "",
            d: common_vendor.o(($event) => selectSize(size), index)
          };
        }),
        k: common_vendor.f(randomGoodsList.value, (goods, index, i0) => {
          return {
            a: goods.goods_images[0],
            b: common_vendor.t(goods.name),
            c: common_vendor.t(goods.brand_name),
            d: common_vendor.t(goods.total_amount),
            e: common_vendor.t(goods.currency),
            f: goods.id,
            g: common_vendor.o(($event) => jumpGoods(goods.id), goods.id)
          };
        }),
        l: goodsLoading.value
      }, goodsLoading.value ? {} : {}, {
        m: goodsNoMore.value
      }, goodsNoMore.value ? {} : {}, {
        n: common_vendor.o(loadMoreGoods)
      }) : {}, {
        o: currentTab.value === "view"
      }, currentTab.value === "view" ? common_vendor.e({
        p: common_vendor.f(filterGoods.value, (goods, k0, i0) => {
          return {
            a: common_vendor.t(goods.goods_name),
            b: goods.goods_id,
            c: common_vendor.o((e) => removeGood(goods.goods_id, e), goods.goods_id)
          };
        }),
        q: !filterGoods.value.length
      }, !filterGoods.value.length ? {} : {}, {
        r: common_vendor.o(showFilter),
        s: common_vendor.o(($event) => fetchCollocations(true)),
        t: common_vendor.f(collocationList.value, (item, index, i0) => {
          var _a, _b;
          return common_vendor.e({
            a: item.avatar || "/default_avatar.jpg",
            b: common_vendor.t(getUserName(item.username)),
            c: "e981f8ca-3-" + i0 + ",e981f8ca-1",
            d: common_vendor.t(item.like_count),
            e: common_vendor.o(($event) => jumpToUserPage(item.uid), item.collocation_id),
            f: ((_a = item.image_urls) == null ? void 0 : _a.length) > 0
          }, ((_b = item.image_urls) == null ? void 0 : _b.length) > 0 ? {
            g: item.image_urls[0]
          } : {}, {
            h: common_vendor.t(item.title),
            i: common_vendor.t(item.content),
            j: common_vendor.f(item.relation_list, (rel, index2, i1) => {
              return {
                a: common_vendor.t(rel.relation_goods_name || "未命名商品"),
                b: index2
              };
            }),
            k: item.collocation_id,
            l: "card-" + index,
            m: common_vendor.s(cardStyle(index)),
            n: common_vendor.o(($event) => jump2collectionDetail(item.collocation_id, item.origin), item.collocation_id)
          });
        }),
        v: common_vendor.p({
          type: "hand-up",
          size: "18",
          color: "#5f85a3"
        }),
        w: containerHeight.value + "px",
        x: loading.value
      }, loading.value ? {} : {}, {
        y: noMore.value
      }, noMore.value ? {} : {}, {
        z: common_vendor.o(loadMore),
        A: common_vendor.p({
          type: "plusempty",
          size: "30",
          color: "#fff"
        }),
        B: common_vendor.o(togglePostMenu),
        C: showPostMenu.value
      }, showPostMenu.value ? {
        D: common_vendor.o(closePostMenu)
      } : {}, {
        E: common_vendor.p({
          name: "fade",
          mode: "out-in",
          duration: 300
        }),
        F: common_vendor.p({
          type: "color",
          size: "24",
          color: "#5f85a3"
        }),
        G: common_vendor.o(goToCollocation),
        H: common_vendor.p({
          type: "compose",
          size: "24",
          color: "#5f85a3"
        }),
        I: common_vendor.o(goToShowcase),
        J: showPostMenu.value ? 1 : "",
        K: common_vendor.o(closeFilter),
        L: common_vendor.o(closeFilter),
        M: common_vendor.s("margin-top:60rpx"),
        N: common_vendor.o(handleGoodsSelect),
        O: common_vendor.p({
          mode: "fill",
          background: "#f8f8f8",
          width: "100%"
        }),
        P: common_vendor.f(filterGoods.value, (goods, k0, i0) => {
          return {
            a: common_vendor.t(goods.goods_name),
            b: goods.goods_id,
            c: common_vendor.o((e) => removeGood(goods.goods_id, e), goods.goods_id)
          };
        }),
        Q: common_vendor.o(resetFilter),
        R: common_vendor.o(applyFilter),
        S: common_vendor.o(($event) => showFilterModal.value = $event),
        T: common_vendor.p({
          top: "0",
          width: "100%",
          height: "100%",
          visible: showFilterModal.value
        })
      }) : {}, {
        U: common_vendor.p({
          show: goodsLoading.value || loading.value
        }),
        V: common_vendor.p({
          head_color: "#def9ff"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e981f8ca"]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/collocation_square/collocation_square.js.map
