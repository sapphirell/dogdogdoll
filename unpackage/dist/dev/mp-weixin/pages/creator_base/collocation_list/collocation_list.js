"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const common_config = require("../../../common/config.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "collocation_list",
  setup(__props) {
    const route = common_vendor.useRoute();
    const goodsId = common_vendor.ref(route.query.goods_id || "");
    const collocationList = common_vendor.ref([]);
    const loading = common_vendor.ref(true);
    const goodsInfo = common_vendor.ref(null);
    const fetchCollocations = async () => {
      if (!goodsId.value) {
        common_vendor.index.showToast({
          title: "商品ID缺失",
          icon: "none"
        });
        return;
      }
      try {
        loading.value = true;
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl.value}/goods-collocation`,
          method: "GET",
          data: {
            goods_id: goodsId.value,
            official: true
          }
        });
        if (res.data.status === "success") {
          const data = res.data.data;
          collocationList.value = data.collocation_relation_list.map((item) => ({
            ...item,
            imageList: item.image_urls.split(",").map((url) => url.trim())
          }));
        } else {
          throw new Error(res.data.msg || "获取搭配数据失败");
        }
      } catch (error) {
        common_vendor.index.showToast({
          title: error.message || "请求失败",
          icon: "none"
        });
        common_vendor.index.__f__("error", "at pages/creator_base/collocation_list/collocation_list.vue:131", "获取搭配数据失败:", error);
      } finally {
        loading.value = false;
      }
    };
    const previewImage = (urls, index) => {
      common_vendor.index.previewImage({
        current: index,
        urls
      });
    };
    const goToPreview = (collocationId) => {
      common_vendor.index.navigateTo({
        url: `/pages/collocation_share/collocation_share?collocation_id=${collocationId}&origin=1`
      });
    };
    const handleAddCollocation = async () => {
      if (!goodsInfo.value && goodsId.value) {
        try {
          const res = await common_vendor.index.request({
            url: `${common_config.websiteUrl.value}/goods`,
            method: "GET",
            data: {
              id: goodsId.value
            }
          });
          if (res.data.status === "success") {
            goodsInfo.value = res.data.data;
          }
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/creator_base/collocation_list/collocation_list.vue:171", "获取商品信息失败:", error);
        }
      }
      const queryParams = {
        goods_id: goodsId.value
      };
      if (goodsInfo.value) {
        queryParams.brand_id = goodsInfo.value.brand_id;
        queryParams.goods_name = goodsInfo.value.name;
        queryParams.brand_name = goodsInfo.value.brand_name;
        queryParams.type = goodsInfo.value.type;
      }
      const queryString = Object.entries(queryParams).map(([key, value]) => `${key}=${value}`).join("&");
      common_vendor.index.navigateTo({
        url: `/pages/collocation/collocation?${queryString}`
      });
    };
    const handleEdit = (collocationId) => {
      common_vendor.index.navigateTo({
        url: `/pages/collocation/collocation?collocation_id=${collocationId}`
      });
    };
    const handleDelete = async (item) => {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "确定要删除这个搭配参考吗？",
        success: async (res) => {
          if (res.confirm) {
            common_vendor.index.__f__("log", "at pages/creator_base/collocation_list/collocation_list.vue:213", item);
            try {
              const token = common_vendor.index.getStorageSync("token");
              const res2 = await common_vendor.index.request({
                url: `${common_config.websiteUrl.value}/with-state/delete-collocation?collocation_id=${item.collocation_id}`,
                method: "POST",
                header: {
                  Authorization: token
                },
                data: {
                  collocation_id: item.collocation_id
                }
              });
              if (res2.data.status === "success") {
                common_vendor.index.showToast({
                  title: "删除成功"
                });
                fetchCollocations();
              } else {
                throw new Error(res2.data.msg || "删除失败");
              }
            } catch (error) {
              common_vendor.index.showToast({
                title: error.message || "删除失败",
                icon: "none"
              });
            }
          }
        }
      });
    };
    const formatTime = (timestamp) => {
      const date = new Date(timestamp * 1e3);
      return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
    };
    common_vendor.onMounted(async () => {
      common_vendor.index.setNavigationBarTitle({
        title: "官方搭配管理"
      });
      if (!common_config.global.isLogin) {
        await common_config.asyncGetUserInfo();
      }
      fetchCollocations();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(handleAddCollocation),
        b: collocationList.value.length > 0
      }, collocationList.value.length > 0 ? {
        c: common_vendor.f(collocationList.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.title),
            b: common_vendor.t(formatTime(item.created_at)),
            c: common_vendor.t(item.content),
            d: common_vendor.f(item.imageList, (img, index, i1) => {
              return {
                a: index,
                b: img,
                c: common_vendor.o(($event) => previewImage(item.imageList, index), index)
              };
            }),
            e: "1bd3f7a4-0-" + i0,
            f: common_vendor.o(($event) => goToPreview(item.collocation_id), item.relation_id),
            g: "1bd3f7a4-1-" + i0,
            h: common_vendor.o(($event) => handleEdit(item.collocation_id), item.relation_id),
            i: "1bd3f7a4-2-" + i0,
            j: common_vendor.o(($event) => handleDelete(item), item.relation_id),
            k: item.relation_id
          };
        }),
        d: common_vendor.p({
          type: "eye",
          size: "14",
          color: "#3a3a3a"
        }),
        e: common_vendor.p({
          type: "compose",
          size: "14",
          color: "#3a3a3a"
        }),
        f: common_vendor.p({
          type: "closeempty",
          size: "14",
          color: "#3a3a3a"
        })
      } : {
        g: common_assets._imports_0$11
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/creator_base/collocation_list/collocation_list.js.map
