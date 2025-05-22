"use strict";
const common_vendor = require("../../common/vendor.js");
const common_config = require("../../common/config.js");
const _sfc_main = {
  __name: "my_comment",
  setup(__props) {
    const commentList = common_vendor.ref([]);
    const currentPage = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const total = common_vendor.ref(0);
    const loading = common_vendor.ref(false);
    const noMore = common_vendor.ref(false);
    const commentTypes = {
      1: {
        name: "品牌",
        class: "brand"
      },
      2: {
        name: "商品",
        class: "goods"
      },
      3: {
        name: "搭配",
        class: "collocation"
      },
      4: {
        name: "资讯",
        class: "news"
      },
      5: {
        name: "树洞",
        class: "treehole"
      },
      6: {
        name: "展示柜",
        class: "collocation"
      },
      7: {
        name: "文章",
        class: "collocation"
      }
    };
    common_vendor.onMounted(() => {
      loadComments();
    });
    const loadComments = async (isLoadMore = false) => {
      if (loading.value || noMore.value)
        return;
      loading.value = true;
      try {
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl}/with-state/my-comment`,
          method: "GET",
          header: {
            "Authorization": common_vendor.index.getStorageSync("token")
          },
          data: {
            page: currentPage.value,
            page_size: pageSize.value
          }
        });
        if (res.data.status === "success") {
          const data = res.data.data;
          commentList.value = isLoadMore ? [...commentList.value, ...data.comment_list] : data.comment_list;
          total.value = data.total;
          currentPage.value++;
          noMore.value = commentList.value.length >= total.value;
        }
      } finally {
        loading.value = false;
      }
    };
    const loadMore = () => {
      if (!noMore.value)
        loadComments(true);
    };
    const navigateToTarget = (item) => {
      let url = "";
      const id = item.relation_id;
      switch (item.type) {
        case 1:
          url = `/pages/brand/brand?brand_id=${id}`;
          break;
        case 2:
          url = `/pages/goods/goods?goods_id=${id}`;
          break;
        case 3:
          url = `/pages/collocation_share/collocation_share?collocation_id=${id}&origin=1`;
          break;
        case 4:
          url = `/pages/sale_news/sale_news?newsId=${id}`;
          break;
        case 5:
          url = `/pages/treehole_detail/treehole_detail?id=${id}`;
          break;
        case 6:
          url = `/pages/collocation_share/collocation_share?collocation_id=${id}&origin=2`;
          break;
        default:
          common_vendor.index.showToast({
            title: "未知类型",
            icon: "none"
          });
          return;
      }
      if (url) {
        common_vendor.index.navigateTo({
          url
        });
      }
    };
    const getTypeName = (type) => {
      var _a;
      return ((_a = commentTypes[type]) == null ? void 0 : _a.name) || "未知";
    };
    const getTypeClass = (type) => {
      var _a;
      return ((_a = commentTypes[type]) == null ? void 0 : _a.class) || "";
    };
    function formatTime(timestamp) {
      const date = new Date(timestamp * 1e3);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const seconds = date.getSeconds().toString().padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    common_vendor.index.setNavigationBarTitle({
      title: "我的评论"
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(commentList.value, (item, index, i0) => {
          return common_vendor.e({
            a: item.avatar || "/static/default-avatar.png",
            b: common_vendor.t(item.username),
            c: common_vendor.t(formatTime(item.created_at)),
            d: common_vendor.t(item.comment),
            e: item.target_image
          }, item.target_image ? {
            f: item.target_image
          } : {}, {
            g: common_vendor.t(getTypeName(item.type)),
            h: common_vendor.n(getTypeClass(item.type)),
            i: common_vendor.t(item.target_name),
            j: common_vendor.o(($event) => navigateToTarget(item), index),
            k: index,
            l: common_vendor.o(($event) => navigateToTarget(item), index)
          });
        }),
        b: loading.value
      }, loading.value ? {} : {}, {
        c: noMore.value
      }, noMore.value ? {} : {}, {
        d: common_vendor.o(loadMore)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7fd39f53"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my_comment/my_comment.js.map
