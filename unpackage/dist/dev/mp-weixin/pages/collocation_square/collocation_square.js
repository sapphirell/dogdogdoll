"use strict";
const common_vendor = require("../../common/vendor.js");
const common_config = require("../../common/config.js");
if (!Array) {
  const _easycom_common_search2 = common_vendor.resolveComponent("common-search");
  const _easycom_custom_picker2 = common_vendor.resolveComponent("custom-picker");
  const _easycom_common_modal2 = common_vendor.resolveComponent("common-modal");
  const _easycom_common_page2 = common_vendor.resolveComponent("common-page");
  (_easycom_common_search2 + _easycom_custom_picker2 + _easycom_common_modal2 + _easycom_common_page2)();
}
const _easycom_common_search = () => "../../components/common-search/common-search.js";
const _easycom_custom_picker = () => "../../components/custom-picker/custom-picker.js";
const _easycom_common_modal = () => "../../components/common-modal/common-modal.js";
const _easycom_common_page = () => "../../components/common-page/common-page.js";
if (!Math) {
  (_easycom_common_search + _easycom_custom_picker + _easycom_common_modal + _easycom_common_page)();
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
    const tempSelectGoods = common_vendor.ref(null);
    const miniProgram = true;
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
      if (!instance2) {
        common_vendor.index.__f__("log", "at pages/collocation_square/collocation_square.vue:132", "无法获取instance");
        return;
      }
      if (!collocationList.value) {
        common_vendor.index.__f__("log", "at pages/collocation_square/collocation_square.vue:137", "无列表数据，不需要计算布局");
        return;
      }
      const query = common_vendor.index.createSelectorQuery().in(instance2.ctx);
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
        columnsHeight[0] = 0;
        columnsHeight[1] = 0;
        const results = await Promise.all(tasks);
        results.forEach(({
          index,
          rect
        }) => {
          if (!rect)
            return;
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
      if (loading.value || noMore.value) {
        common_vendor.index.__f__("log", "at pages/collocation_square/collocation_square.vue:197", "正在加载中或没有更多了");
        return;
      }
      try {
        loading.value = true;
        if (reset) {
          collocationList.value = [];
          currentPage.value = 1;
        }
        const params = {
          page: currentPage.value,
          page_size: pageSize,
          filter_goods_id_list: filterGoods.value.map((g) => g.goods_id)
          // 传递ID数组
        };
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl}/collocation-list`,
          method: "POST",
          data: params
        });
        if (res.data.status === "success") {
          const data = res.data.data;
          const newItems = data.collocation_relation_list;
          collocationList.value = reset ? newItems : [...collocationList.value, ...newItems];
          noMore.value = data.total <= currentPage.value * pageSize;
          currentPage.value++;
          await common_vendor.nextTick$1();
          calculateLayout(instance);
          setTimeout(() => {
            calculateLayout(instance);
          }, 500);
        }
      } finally {
        loading.value = false;
      }
    };
    const showFilter = () => showFilterModal.value = true;
    const handleBrandSelect = (brandId, brandName) => {
      selectedBrand.value = {
        id: brandId,
        name: brandName
      };
      filterBrand.value = brandName;
      if (brandId) {
        loadGoodsOptions(brandId);
      }
    };
    const loadGoodsOptions = async (brandId) => {
      try {
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl}/goods-name-list?id=${brandId}`,
          method: "GET"
        });
        common_vendor.index.__f__("log", "at pages/collocation_square/collocation_square.vue:270", "商品列表:", res.data);
        if (res.data.status === "success") {
          goodsOptions.value = res.data.data;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/collocation_square/collocation_square.vue:275", "加载商品失败:", error);
      }
    };
    const handleGoodsSelect = (goodsId, goodsName) => {
      if (!goodsId) {
        common_vendor.index.__f__("log", "at pages/collocation_square/collocation_square.vue:282", "未选择有效goods");
        return;
      }
      for (const g of filterGoods.value) {
        if (g.goods_id === goodsId) {
          return;
        }
      }
      tempSelectGoods.value = {
        goods_id: goodsId,
        goods_name: goodsName
      };
    };
    const removeGood = (goodsId) => {
      event.stopPropagation();
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
    const confirmFilter = async () => {
      filterGoods.value.push(tempSelectGoods.value);
      showFilterModal.value = false;
      noMore.value = false;
      await fetchCollocations(true);
    };
    const loadMore = () => {
      if (!noMore.value)
        fetchCollocations();
    };
    common_vendor.onMounted(fetchCollocations);
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: miniProgram
      }, {}, {
        b: common_vendor.f(filterGoods.value, (goods, k0, i0) => {
          return {
            a: common_vendor.t(goods.goods_name),
            b: common_vendor.o(($event) => removeGood(goods.goods_id), goods.goods_id),
            c: goods.goods_id
          };
        }),
        c: !filterGoods.value.length
      }, !filterGoods.value.length ? {} : {}, {
        d: common_vendor.o(showFilter),
        e: common_vendor.o(($event) => fetchCollocations(true)),
        f: common_vendor.f(collocationList.value, (item, index, i0) => {
          return {
            a: item.image_urls[0],
            b: common_vendor.t(item.title),
            c: common_vendor.t(item.content),
            d: common_vendor.f(item.relation_list, (rel, index2, i1) => {
              return {
                a: common_vendor.t(rel.relation_goods_name || "未命名商品"),
                b: index2
              };
            }),
            e: item.collocation_id,
            f: "card-" + index,
            g: common_vendor.s(cardStyle(index))
          };
        }),
        g: containerHeight.value + "px",
        h: loading.value
      }, loading.value ? {} : {}, {
        i: noMore.value
      }, noMore.value ? {} : {}, {
        j: common_vendor.o(loadMore),
        k: showFilterModal.value
      }, showFilterModal.value ? common_vendor.e({
        l: common_vendor.o(($event) => showFilterModal.value = false),
        m: common_vendor.o(handleBrandSelect),
        n: common_vendor.p({
          mode: "fill",
          width: "450rpx"
        }),
        o: selectedBrand.value
      }, selectedBrand.value ? {
        p: common_vendor.o(handleGoodsSelect),
        q: common_vendor.p({
          dataList: goodsOptions.value,
          multiple: true
        })
      } : {}, {
        r: common_vendor.o(resetFilter),
        s: common_vendor.o(confirmFilter),
        t: common_vendor.o(($event) => showFilterModal.value = $event),
        v: common_vendor.p({
          visible: showFilterModal.value,
          visible: showFilterModal.value
        })
      }) : {}, {
        w: common_vendor.p({
          head_color: "#f5f5f5"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e981f8ca"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/collocation_square/collocation_square.js.map
