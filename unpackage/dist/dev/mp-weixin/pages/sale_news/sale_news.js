"use strict";
const common_vendor = require("../../common/vendor.js");
const common_config = require("../../common/config.js");
if (!Array) {
  const _easycom_view_logs2 = common_vendor.resolveComponent("view-logs");
  const _easycom_comment_list2 = common_vendor.resolveComponent("comment-list");
  const _easycom_comment_input2 = common_vendor.resolveComponent("comment-input");
  (_easycom_view_logs2 + _easycom_comment_list2 + _easycom_comment_input2)();
}
const _easycom_view_logs = () => "../../components/view-logs/view-logs.js";
const _easycom_comment_list = () => "../../components/comment-list/comment-list.js";
const _easycom_comment_input = () => "../../components/comment-input/comment-input.js";
if (!Math) {
  (_easycom_view_logs + _easycom_comment_list + _easycom_comment_input)();
}
const _sfc_main = {
  __name: "sale_news",
  setup(__props) {
    const detailData = common_vendor.ref({
      title: "",
      content: "",
      image_list: [],
      created_at: 0
    });
    const brand = common_vendor.ref({
      brand_name: "",
      logo: ""
      // 其他品牌信息字段
    });
    const loading = common_vendor.ref(true);
    const error = common_vendor.ref(false);
    const errorMsg = common_vendor.ref("");
    const pageId = common_vendor.ref(0);
    const brandId = common_vendor.ref(0);
    const hasLikeBrand = common_vendor.ref(false);
    const commentListRef = common_vendor.ref(null);
    const commentInputRef = common_vendor.ref(null);
    common_vendor.ref(1);
    let replyForItem = common_vendor.ref({});
    common_vendor.index.getSystemInfoSync();
    const handleReplyComment = ({
      parent,
      target
    }) => {
      var _a;
      common_vendor.index.__f__("log", "at pages/sale_news/sale_news.vue:109", "parent", parent);
      common_vendor.index.__f__("log", "at pages/sale_news/sale_news.vue:110", "target", target);
      let item = parent;
      if (target != null) {
        item = target;
      }
      if (replyForItem.value.id == item.id) {
        replyForItem.value = {};
        return;
      }
      common_vendor.index.__f__("log", "at pages/sale_news/sale_news.vue:121", "item", item);
      replyForItem.value = item;
      (_a = commentInputRef.value) == null ? void 0 : _a.focusInput();
    };
    function viewFullImage(index) {
      common_vendor.index.previewImage({
        current: goods.value.goods_images["index"],
        urls: goods.value.goods_images
      });
    }
    common_vendor.index.setNavigationBarTitle({
      title: "图透详情"
    });
    function jump2brand(id) {
      common_vendor.index.navigateTo({
        url: "/pages/brand/brand?brand_id=" + id
      });
    }
    const fetchNewsDetail = async (id) => {
      try {
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl}/sale-news-detail?id=${id}`,
          timeout: 5e3
        });
        if (res.data.status === "success") {
          detailData.value = {
            ...res.data.data,
            image_list: res.data.data.image_list || []
          };
          brandId.value = res.data.data.brand_id;
          getBrandsInfo();
        } else {
          handleError(res.data.msg || "数据加载失败");
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/sale_news/sale_news.vue:188", "请求失败:", err);
        handleError("网络请求失败");
      } finally {
        loading.value = false;
      }
    };
    const handleCommentSubmit = ({
      content,
      replyInfo,
      origin
    }) => {
      let token = common_vendor.index.getStorageSync("token");
      if (!common_config.global.isLogin) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        return;
      }
      common_vendor.index.__f__("log", "at pages/sale_news/sale_news.vue:209", "reply_info", replyInfo);
      const requestData = {
        content,
        origin,
        target_id: parseInt(pageId.value),
        type: 4,
        ...replyInfo.id && {
          reply_id: replyInfo.id,
          reply_for: replyInfo.comment,
          reply_user_id: replyInfo.user_id,
          parent_id: replyInfo.parent_id > 0 ? replyInfo.parent_id : replyInfo.id
        }
      };
      common_vendor.index.request({
        url: common_config.websiteUrl + "/with-state/add-comment",
        method: "POST",
        header: {
          "Authorization": token
        },
        data: requestData,
        success: (res) => {
          var _a, _b;
          if (res.data.status == "success") {
            const newComment = res.data.data;
            if (newComment.parent_id === 0) {
              (_a = commentListRef.value) == null ? void 0 : _a.addNewComment(newComment);
            } else {
              (_b = commentListRef.value) == null ? void 0 : _b.addReplyComment(newComment);
            }
            common_vendor.index.showToast({
              title: "评论成功",
              icon: "success"
            });
          } else {
            common_vendor.index.showToast({
              title: res.data.msg,
              icon: "none"
            });
          }
        },
        fail: (err) => {
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        }
      });
    };
    function formatTimestamp(timestamp) {
      const date = new Date(timestamp * 1e3);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      date.getSeconds().toString().padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    }
    const getBrandsInfo = () => {
      common_vendor.index.request({
        url: common_config.websiteUrl + "/brand-info?id=" + brandId.value,
        success: (res) => {
          if (res.data.status === "success") {
            brand.value = res.data.data;
            common_vendor.index.setNavigationBarTitle({
              title: res.data.data.brand_name
            });
            getHasLikeBrand();
          }
        },
        fail: () => handleError("品牌信息加载失败")
      });
    };
    const likeBrand = async () => {
      if (!common_config.global.isLogin) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        return;
      }
      const url = `/with-state/${hasLikeBrand.value ? "unlike" : "add-like"}`;
      common_vendor.index.request({
        url: common_config.websiteUrl + url,
        method: "POST",
        header: {
          Authorization: common_vendor.index.getStorageSync("token")
        },
        data: {
          id: parseInt(brandId.value),
          type: 2
          // 假设2代表品牌类型
        },
        success: (res) => {
          if (res.data.status === "success") {
            hasLikeBrand.value = !hasLikeBrand.value;
            common_vendor.index.showToast({
              title: hasLikeBrand.value ? "关注成功" : "已取消关注",
              icon: "none"
            });
          }
        }
      });
    };
    const getHasLikeBrand = () => {
      if (!common_config.global.isLogin)
        return;
      common_vendor.index.request({
        url: `${common_config.websiteUrl}/with-state/hasLike?id=${brandId.value}&type=2`,
        method: "POST",
        header: {
          Authorization: common_vendor.index.getStorageSync("token")
        },
        success: (res) => {
          var _a;
          hasLikeBrand.value = ((_a = res.data.data) == null ? void 0 : _a.id) > 0;
        }
      });
    };
    common_vendor.onLoad((options) => {
      if (!options.id) {
        handleError("缺少必要参数");
        return;
      }
      pageId.value = options.id;
      fetchNewsDetail(options.id);
      common_config.asyncGetUserInfo().then(getHasLikeBrand);
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(detailData.value.image_list, (img, index, i0) => {
          return {
            a: img,
            b: common_vendor.o(($event) => viewFullImage(), index),
            c: index
          };
        }),
        b: brand.value.logo_image,
        c: common_vendor.o(($event) => jump2brand(brand.value.id)),
        d: common_vendor.t(brand.value.brand_name),
        e: common_vendor.t(formatTimestamp(detailData.value.created_at)),
        f: common_vendor.o(($event) => jump2brand(brand.value.id)),
        g: common_vendor.t(hasLikeBrand.value ? "已关注" : "+ 关注品牌"),
        h: common_vendor.o(likeBrand),
        i: hasLikeBrand.value ? "#ff6a6c" : "#65C3D6",
        j: common_vendor.t(detailData.value.title),
        k: common_vendor.t(detailData.value.content),
        l: common_vendor.sr(commentListRef, "c9c53f1c-1", {
          "k": "commentListRef"
        }),
        m: common_vendor.o(handleReplyComment),
        n: common_vendor.p({
          type: 4,
          ["relation-id"]: parseInt(pageId.value)
        }),
        o: loading.value
      }, loading.value ? {} : {}, {
        p: error.value
      }, error.value ? {
        q: common_vendor.t(errorMsg.value)
      } : {}, {
        r: common_vendor.sr(commentInputRef, "c9c53f1c-2", {
          "k": "commentInputRef"
        }),
        s: common_vendor.o(handleCommentSubmit),
        t: common_vendor.o((val) => common_vendor.isRef(replyForItem) ? replyForItem.value = val : replyForItem = val),
        v: common_vendor.p({
          ["reply-info"]: common_vendor.unref(replyForItem),
          ["target-id"]: pageId.value
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c9c53f1c"]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/sale_news/sale_news.js.map
