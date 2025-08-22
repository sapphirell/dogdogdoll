"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_config = require("../../../common/config.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  (_easycom_uni_icons2 + _easycom_uni_load_more2)();
}
const _easycom_uni_icons = () => "../../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_load_more = () => "../../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_load_more)();
}
const _sfc_main = {
  __name: "goods_list",
  setup(__props) {
    const goodsList = common_vendor.ref([]);
    const loading = common_vendor.ref(true);
    const loadStatus = common_vendor.ref("more");
    const error = common_vendor.ref(null);
    const pageInfo = common_vendor.ref(null);
    const currentPage = common_vendor.ref(1);
    const typeCount = common_vendor.ref({});
    const currentType = common_vendor.ref("all");
    const allCount = common_vendor.ref(0);
    const fetchTypeCount = async () => {
      try {
        const token = common_vendor.index.getStorageSync("token");
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl.value}/brand-manager/get-goods-count`,
          method: "GET",
          header: {
            Authorization: token
          },
          data: {
            brand_id: 1
            // 这里需要替换为实际的品牌ID
          }
        });
        if (res.data.status === "success") {
          let total = 0;
          const counts = res.data.data;
          for (const key in counts) {
            total += counts[key];
          }
          typeCount.value = counts;
          allCount.value = total;
        } else {
          common_vendor.index.showToast({
            title: res.data.msg || "获取分类数量失败",
            icon: "none"
          });
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/creator_base/goods_list/goods_list.vue:159", "获取分类数量失败:", err);
        common_vendor.index.showToast({
          title: "获取分类数量失败",
          icon: "none"
        });
      }
    };
    const jump2postGoods = () => {
    };
    const changeType = (type) => {
      currentType.value = type;
      currentPage.value = 1;
      goodsList.value = [];
      fetchGoodsList(1);
    };
    const previewGoods = (goodsId) => {
      common_vendor.index.navigateTo({
        url: `/pages/goods/goods?goods_id=${goodsId}`
      });
    };
    const editGoods = (goodsId) => {
      common_vendor.index.navigateTo({
        url: `/pages/creator_base/goods_editor/goods_editor?goods_id=${goodsId}`
      });
    };
    const openCollocation = (goodsId) => {
      common_vendor.index.navigateTo({
        url: `/pages/creator_base/collocation_list/collocation_list?goods_id=${goodsId}`
      });
    };
    const openSalesPlan = (goodsId) => {
      common_vendor.index.navigateTo({
        url: `/pages/creator_base/sales_plan/sales_plan?goods_id=${goodsId}`
      });
    };
    const fetchGoodsList = async (page = 1) => {
      try {
        if (page > 1) {
          loadStatus.value = "loading";
        } else {
          loading.value = true;
        }
        const token = common_vendor.index.getStorageSync("token");
        if (!token) {
          error.value = "未登录，请先登录";
          loading.value = false;
          loadStatus.value = "more";
          return;
        }
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl.value}/brand-manager/get-goods-list`,
          method: "GET",
          header: {
            Authorization: token
          },
          data: {
            page,
            page_size: 10,
            type: currentType.value === "all" ? "" : currentType.value
            // 如果选中的是全部，则传空字符串
          }
        });
        const responseData = res.data;
        if (responseData.status === "success") {
          const newGoods = responseData.data.goods_list || [];
          currentPage.value = page;
          if (page === 1) {
            goodsList.value = newGoods;
          } else {
            goodsList.value = [...goodsList.value, ...newGoods];
          }
          pageInfo.value = {
            page_index: responseData.data.page_index,
            page_size: responseData.data.page_size,
            total: responseData.data.total
          };
          const totalPages = Math.ceil(pageInfo.value.total / pageInfo.value.page_size);
          loadStatus.value = pageInfo.value.page_index < totalPages ? "more" : "noMore";
        } else {
          error.value = responseData.msg || "获取商品列表失败";
          common_vendor.index.showToast({
            title: error.value,
            icon: "none"
          });
          loadStatus.value = "more";
        }
      } catch (err) {
        error.value = "网络请求失败";
        common_vendor.index.__f__("error", "at pages/creator_base/goods_list/goods_list.vue:273", "获取商品列表失败:", err);
        common_vendor.index.showToast({
          title: "网络请求失败",
          icon: "none"
        });
        loadStatus.value = "more";
      } finally {
        loading.value = false;
      }
    };
    const loadMore = () => {
      if (loadStatus.value === "more") {
        fetchGoodsList(currentPage.value + 1);
      }
    };
    common_vendor.onMounted(async () => {
      common_vendor.index.setNavigationBarTitle({
        title: "作品管理"
      });
      const userInfo = await common_config.asyncGetUserInfo();
      if (!userInfo) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        setTimeout(() => {
          common_vendor.index.reLaunch({
            url: "/pages/login/login"
          });
        }, 1500);
        return;
      }
      await fetchTypeCount();
      fetchGoodsList(1);
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(typeCount.value.all || 0),
        b: currentType.value === "all" ? 1 : "",
        c: common_vendor.o(($event) => changeType("all")),
        d: _ctx.type !== "all"
      }, _ctx.type !== "all" ? {
        e: common_vendor.f(typeCount.value, (count, type, i0) => {
          return {
            a: common_vendor.t(type),
            b: common_vendor.t(count),
            c: type,
            d: currentType.value === type ? 1 : "",
            e: common_vendor.o(($event) => changeType(type), type)
          };
        })
      } : {}, {
        f: loading.value
      }, loading.value ? {} : goodsList.value.length === 0 ? {} : {
        h: common_vendor.f(goodsList.value, (item, index, i0) => {
          return common_vendor.e({
            a: item.goods_images[0] || "/static/default-goods.png",
            b: common_vendor.t(item.name),
            c: item.is_hot
          }, item.is_hot ? {} : {}, {
            d: common_vendor.t(item.size || "无"),
            e: common_vendor.t(item.skin || "无"),
            f: common_vendor.t(item.total_amount),
            g: common_vendor.t(item.currency),
            h: "5fc11b8a-0-" + i0,
            i: common_vendor.o(($event) => previewGoods(item.id), item.id),
            j: "5fc11b8a-1-" + i0,
            k: common_vendor.o(($event) => editGoods(item.id), item.id),
            l: "5fc11b8a-2-" + i0,
            m: common_vendor.o(($event) => openCollocation(item.id), item.id),
            n: "5fc11b8a-3-" + i0,
            o: common_vendor.o(($event) => openSalesPlan(item.id), item.id),
            p: item.id,
            q: index === goodsList.value.length - 1 ? 1 : ""
          });
        }),
        i: common_vendor.p({
          type: "eye",
          size: "14",
          color: "#3a3a3a"
        }),
        j: common_vendor.p({
          type: "compose",
          size: "14",
          color: "#3a3a3a"
        }),
        k: common_vendor.p({
          type: "star",
          size: "14",
          color: "#3a3a3a"
        }),
        l: common_vendor.p({
          type: "shop",
          size: "14",
          color: "#3a3a3a"
        }),
        m: common_vendor.p({
          status: loadStatus.value,
          contentText: {
            contentdown: "上拉加载更多",
            contentrefresh: "正在加载...",
            contentnomore: "没有更多了"
          }
        }),
        n: common_vendor.o(loadMore)
      }, {
        g: goodsList.value.length === 0,
        o: common_vendor.p({
          type: "plusempty",
          size: "30",
          color: "#fff"
        }),
        p: common_vendor.o(jump2postGoods)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-5fc11b8a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/creator_base/goods_list/goods_list.js.map
