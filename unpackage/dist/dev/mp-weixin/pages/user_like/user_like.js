"use strict";
const common_vendor = require("../../common/vendor.js");
const common_config = require("../../common/config.js");
const _sfc_main = {
  __name: "user_like",
  setup(__props) {
    const categories = common_vendor.ref([
      {
        type: 1,
        name: "商品"
      },
      {
        type: 2,
        name: "品牌"
      },
      {
        type: 3,
        name: "搭配"
      },
      {
        type: 4,
        name: "展示柜"
      }
    ]);
    const activeCategory = common_vendor.ref(1);
    const currentList = common_vendor.ref([]);
    const loading = common_vendor.ref(false);
    const noMore = common_vendor.ref(false);
    const pagination = common_vendor.reactive({
      page: 1,
      page_size: 8,
      total: 0
    });
    common_vendor.onMounted(async () => {
      await checkLogin();
      loadData();
    });
    const checkLogin = async () => {
      const userInfo = await common_config.asyncGetUserInfo();
      if (!userInfo) {
        common_vendor.index.navigateTo({
          url: "/pages/login/login"
        });
      }
    };
    const switchCategory = (type) => {
      if (activeCategory.value === type)
        return;
      activeCategory.value = type;
      resetPagination();
      loadData();
    };
    const loadData = async () => {
      if (loading.value || noMore.value)
        return;
      loading.value = true;
      try {
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl}/with-state/user-likes`,
          method: "GET",
          data: {
            type: activeCategory.value,
            page: pagination.page,
            page_size: pagination.page_size
          },
          header: {
            Authorization: common_vendor.index.getStorageSync("token")
          }
        });
        if (res.data.status === "success") {
          const newData = res.data.data.list;
          currentList.value = [...currentList.value, ...newData];
          pagination.total = res.data.data.total;
          if (!res.data.data.list.length) {
            noMore.value = true;
          } else {
            noMore.value = false;
          }
          pagination.page += 1;
        }
      } catch (error) {
        common_vendor.index.showToast({
          title: "加载失败",
          icon: "none"
        });
      } finally {
        loading.value = false;
      }
    };
    const loadMore = () => {
      if (!noMore.value) {
        loadData();
      } else {
        common_vendor.index.__f__("log", "at pages/user_like/user_like.vue:201", "no more");
      }
    };
    const resetPagination = () => {
      pagination.page = 1;
      currentList.value = [];
      noMore.value = false;
    };
    const getFirstImage = (images) => {
      return (images == null ? void 0 : images.length) > 0 ? images[0] : ``;
    };
    const getFirstCollocationImage = (images) => {
      const url = (images == null ? void 0 : images.split(",")[0]) || "";
      return url ? url : ``;
    };
    const unfollowGoods = async (id) => {
      try {
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl}/user/unfollow`,
          method: "POST",
          data: {
            id
          },
          header: {
            Authorization: common_vendor.index.getStorageSync("token")
          }
        });
        if (res.data.status === "success") {
          currentList.value = currentList.value.filter((item) => item.id !== id);
          common_vendor.index.showToast({
            title: "已取消关注",
            icon: "success"
          });
        }
      } catch (error) {
        common_vendor.index.showToast({
          title: "操作失败",
          icon: "none"
        });
      }
    };
    const navigateToGoods = (id) => {
      common_vendor.index.navigateTo({
        url: `/pages/goods/goods?goods_id=${id}`
      });
    };
    const navigateToBrand = (id) => {
      common_vendor.index.navigateTo({
        url: `/pages/brand/brand?brand_id=${id}`
      });
    };
    const navigateToCollocation = (id) => {
      common_vendor.index.navigateTo({
        url: `/pages/collocation/detail?id=${id}`
      });
    };
    const navigateToShowcase = (id) => {
      common_vendor.index.navigateTo({
        url: `/pages/showcase/detail?id=${id}`
      });
    };
    common_vendor.index.setNavigationBarTitle({
      title: "我的关注"
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(categories.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item.name),
            b: index,
            c: activeCategory.value === item.type ? 1 : "",
            d: common_vendor.o(($event) => switchCategory(item.type), index)
          };
        }),
        b: common_vendor.f(currentList.value, (item, index, i0) => {
          return common_vendor.e({
            a: activeCategory.value === 1 && item.goods
          }, activeCategory.value === 1 && item.goods ? {
            b: getFirstImage(item.goods.goods_images),
            c: common_vendor.t(item.goods.total_amount),
            d: common_vendor.t(item.goods.name),
            e: common_vendor.o(($event) => unfollowGoods(item.id), item.id),
            f: common_vendor.t(item.goods.brand_name),
            g: common_vendor.t(item.goods.size),
            h: common_vendor.t(item.goods.skin.split(" ")[0]),
            i: common_vendor.t(item.goods.type),
            j: common_vendor.t(item.goods.doll_material),
            k: common_vendor.o(($event) => navigateToGoods(item.goods.id), item.id)
          } : {}, {
            l: activeCategory.value === 2 && item.brand
          }, activeCategory.value === 2 && item.brand ? {
            m: item.brand.logo_image,
            n: common_vendor.t(item.brand.brand_name),
            o: common_vendor.t(item.brand.country_name),
            p: common_vendor.t(item.brand.description),
            q: common_vendor.o(($event) => _ctx.unfollowBrand(item.id), item.id),
            r: common_vendor.o(($event) => navigateToBrand(item.brand.id), item.id)
          } : {}, {
            s: activeCategory.value === 3 && item.collocation
          }, activeCategory.value === 3 && item.collocation ? {
            t: getFirstCollocationImage(item.collocation.image_urls),
            v: common_vendor.t(item.collocation.title),
            w: common_vendor.o(($event) => navigateToCollocation(item.collocation.id), item.id)
          } : {}, {
            x: activeCategory.value === 4 && item.showcase
          }, activeCategory.value === 4 && item.showcase ? {
            y: getFirstImage(item.showcase.image_urls),
            z: common_vendor.t(item.showcase.name),
            A: common_vendor.o(($event) => navigateToShowcase(item.showcase.id), item.id)
          } : {}, {
            B: item.id
          });
        }),
        c: loading.value
      }, loading.value ? {} : {}, {
        d: noMore.value
      }, noMore.value ? {} : {}, {
        e: common_vendor.o(loadMore)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-909fcc31"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user_like/user_like.js.map
