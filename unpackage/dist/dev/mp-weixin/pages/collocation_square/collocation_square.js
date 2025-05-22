"use strict";
const common_vendor = require("../../common/vendor.js");
const common_config = require("../../common/config.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_goods_search2 = common_vendor.resolveComponent("goods-search");
  const _easycom_common_modal2 = common_vendor.resolveComponent("common-modal");
  const _easycom_common_page2 = common_vendor.resolveComponent("common-page");
  (_easycom_uni_icons2 + _easycom_goods_search2 + _easycom_common_modal2 + _easycom_common_page2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_goods_search = () => "../../components/goods-search/goods-search.js";
const _easycom_common_modal = () => "../../components/common-modal/common-modal.js";
const _easycom_common_page = () => "../../components/common-page/common-page.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_goods_search + _easycom_common_modal + _easycom_common_page)();
}
const pageSize = 10;
const _sfc_main = {
  __name: "collocation_square",
  setup(__props) {
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
      common_vendor.index.__f__("log", "at pages/collocation_square/collocation_square.vue:145", "进入计算布局逻辑");
      if (!instance2) {
        common_vendor.index.__f__("log", "at pages/collocation_square/collocation_square.vue:147", "无法获取instance");
        return;
      }
      common_vendor.index.__f__("log", "at pages/collocation_square/collocation_square.vue:150", "获取成功");
      if (!collocationList.value) {
        common_vendor.index.__f__("log", "at pages/collocation_square/collocation_square.vue:152", "无列表数据，不需要计算布局");
        return;
      }
      common_vendor.index.__f__("log", "at pages/collocation_square/collocation_square.vue:155", "获取成功，准备createSelectorQuery");
      common_vendor.index.__f__("log", "at pages/collocation_square/collocation_square.vue:156", instance2);
      const query = common_vendor.index.createSelectorQuery().in(instance2.proxy);
      common_vendor.index.__f__("log", "at pages/collocation_square/collocation_square.vue:158", "获取到query");
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
        common_vendor.index.__f__("log", "at pages/collocation_square/collocation_square.vue:173", "进入Query");
        columnsHeight[0] = 0;
        columnsHeight[1] = 0;
        const results = await Promise.all(tasks);
        if (!results.length) {
          common_vendor.index.__f__("warn", "at pages/collocation_square/collocation_square.vue:181", "未查询到任何卡片元素");
          return;
        }
        results.forEach(({
          index,
          rect
        }) => {
          if (!rect) {
            common_vendor.index.__f__("error", "at pages/collocation_square/collocation_square.vue:189", `卡片${index}元素查询失败`);
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
    common_vendor.onMounted(() => {
      const systemInfo = common_vendor.index.getSystemInfoSync();
      const padding = 30;
      cardWidth.value = (systemInfo.windowWidth - padding) / 2;
    });
    const fetchCollocations = async (reset = false) => {
      if (reset) {
        collocationList.value = [];
        currentPage.value = 1;
        noMore.value = false;
        loading.value = false;
      }
      if (loading.value || noMore.value) {
        common_vendor.index.__f__("log", "at pages/collocation_square/collocation_square.vue:227", "正在加载或没有更多数据，停止请求");
        return;
      }
      try {
        loading.value = true;
        const params = {
          page: currentPage.value,
          page_size: pageSize,
          filter_goods_id_list: filterGoods.value.map((g) => g.goods_id)
        };
        common_vendor.index.__f__("log", "at pages/collocation_square/collocation_square.vue:241", "请求参数:", JSON.stringify(params, null, 2));
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl}/collocation-list`,
          method: "POST",
          data: params,
          header: {
            "content-type": "application/json"
            // 确保使用JSON格式
          }
        });
        common_vendor.index.__f__("log", "at pages/collocation_square/collocation_square.vue:252", "接口响应:", res);
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
          common_vendor.index.__f__("log", "at pages/collocation_square/collocation_square.vue:277", "等待next tick");
          await common_vendor.nextTick$1();
          common_vendor.index.__f__("log", "at pages/collocation_square/collocation_square.vue:279", "等待完成");
          calculateLayout(instance);
          setTimeout(() => {
            common_vendor.index.__f__("log", "at pages/collocation_square/collocation_square.vue:283", "二次计算布局");
            calculateLayout(instance);
          }, 500);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/collocation_square/collocation_square.vue:288", "请求失败:", error);
        common_vendor.index.showToast({
          title: "加载失败",
          icon: "none"
        });
      } finally {
        loading.value = false;
      }
    };
    const showFilter = () => {
      showFilterModal.value = true;
    };
    const handleGoodsSelect = (goods) => {
      common_vendor.index.__f__("log", "at pages/collocation_square/collocation_square.vue:333", "选择商品:", goods);
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
    common_vendor.onMounted(fetchCollocations);
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(filterGoods.value, (goods, k0, i0) => {
          return {
            a: common_vendor.t(goods.goods_name),
            b: goods.goods_id,
            c: common_vendor.o((e) => removeGood(goods.goods_id, e), goods.goods_id)
          };
        }),
        b: !filterGoods.value.length
      }, !filterGoods.value.length ? {} : {}, {
        c: common_vendor.o(showFilter),
        d: common_vendor.o(($event) => fetchCollocations(true)),
        e: common_vendor.s("width:500rpx"),
        f: common_vendor.f(collocationList.value, (item, index, i0) => {
          var _a, _b;
          return common_vendor.e({
            a: item.avatar || "/default_avatar.jpg",
            b: common_vendor.t(getUserName(item.username)),
            c: "e981f8ca-1-" + i0 + ",e981f8ca-0",
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
        g: common_vendor.p({
          type: "hand-up",
          size: "18",
          color: "#5f85a3"
        }),
        h: containerHeight.value + "px",
        i: loading.value
      }, loading.value ? {} : {}, {
        j: noMore.value
      }, noMore.value ? {} : {}, {
        k: common_vendor.o(loadMore),
        l: common_vendor.o(closeFilter),
        m: common_vendor.o(closeFilter),
        n: common_vendor.s("margin-top:60rpx"),
        o: common_vendor.o(handleGoodsSelect),
        p: common_vendor.p({
          mode: "fill",
          background: "#f8f8f8",
          width: "100%"
        }),
        q: common_vendor.f(filterGoods.value, (goods, k0, i0) => {
          return {
            a: common_vendor.t(goods.goods_name),
            b: goods.goods_id,
            c: common_vendor.o((e) => removeGood(goods.goods_id, e), goods.goods_id)
          };
        }),
        r: common_vendor.o(resetFilter),
        s: common_vendor.o(applyFilter),
        t: common_vendor.o(($event) => showFilterModal.value = $event),
        v: common_vendor.p({
          top: "0",
          width: "100%",
          height: "100%",
          visible: showFilterModal.value
        }),
        w: common_vendor.p({
          head_color: "#f5f5f5"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e981f8ca"]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/collocation_square/collocation_square.js.map
