"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const common_config = require("../../common/config.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_item_impression2 = common_vendor.resolveComponent("item-impression");
  const _easycom_comment_list2 = common_vendor.resolveComponent("comment-list");
  const _easycom_comment_input2 = common_vendor.resolveComponent("comment-input");
  (_easycom_uni_icons2 + _easycom_item_impression2 + _easycom_comment_list2 + _easycom_comment_input2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_item_impression = () => "../../components/item-impression/item-impression.js";
const _easycom_comment_list = () => "../../components/comment-list/comment-list.js";
const _easycom_comment_input = () => "../../components/comment-input/comment-input.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_item_impression + _easycom_comment_list + _easycom_comment_input)();
}
const _sfc_main = {
  __name: "goods",
  props: ["goods_id"],
  setup(__props) {
    const props = __props;
    common_vendor.index.getSystemInfoSync();
    common_vendor.ref(false);
    common_vendor.ref(false);
    common_vendor.ref("");
    const commentListRef = common_vendor.ref(null);
    const commentInputRef = common_vendor.ref(null);
    common_vendor.ref(1);
    let replyForItem = common_vendor.ref({});
    let goods = common_vendor.ref({});
    let swiperIndex = common_vendor.ref(1);
    let hasLike = common_vendor.ref(false);
    let collocationList = common_vendor.ref(false);
    const swiperHeight = common_vendor.ref(400);
    const imageHeights = common_vendor.ref([]);
    const handleReplyComment = ({
      parent,
      target
    }) => {
      var _a;
      common_vendor.index.__f__("log", "at pages/goods/goods.vue:244", "parent", parent);
      common_vendor.index.__f__("log", "at pages/goods/goods.vue:245", "target", target);
      let item = parent;
      if (target != null) {
        item = target;
      }
      if (replyForItem.value.id == item.id) {
        replyForItem.value = {};
        return;
      }
      common_vendor.index.__f__("log", "at pages/goods/goods.vue:256", "item", item);
      replyForItem.value = item;
      (_a = commentInputRef.value) == null ? void 0 : _a.focusInput();
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
      common_vendor.index.__f__("log", "at pages/goods/goods.vue:274", "reply_info", replyInfo);
      const requestData = {
        content,
        origin,
        target_id: parseInt(props.goods_id),
        type: 2,
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
    function onImageLoad(index) {
      common_vendor.index.__f__("log", "at pages/goods/goods.vue:345", "图片加载完成", index);
      const query = common_vendor.index.createSelectorQuery();
      setTimeout(() => {
        query.select(`.swiper-image-${index}`).boundingClientRect((rect) => {
          try {
            if (!rect) {
              common_vendor.index.__f__("warn", "at pages/goods/goods.vue:352", "未找到图片元素");
              return;
            }
            common_vendor.index.__f__("log", "at pages/goods/goods.vue:355", rect);
            imageHeights.value[index] = rect.height;
            const validHeights = imageHeights.value.filter((h) => h > 0);
            if (validHeights.length === 0)
              return;
            swiperHeight.value = Math.max(...validHeights);
          } catch (e) {
            common_vendor.index.__f__("error", "at pages/goods/goods.vue:361", "高度计算异常:", e);
          }
        }).exec();
      }, 20);
    }
    common_vendor.index.showLoading({
      title: "加载中"
    });
    function jumpBrand(id) {
      common_vendor.index.navigateTo({
        url: "/pages/brand/brand?brand_id=" + id
      });
    }
    function onChange(e) {
      common_vendor.index.__f__("log", "at pages/goods/goods.vue:379", e.detail.current);
      swiperIndex.value = e.detail.current + 1;
    }
    function getGoods() {
      common_vendor.index.request({
        url: common_config.websiteUrl + "/goods?id=" + props.goods_id,
        method: "GET",
        timeout: 5e3,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/goods/goods.vue:389", res.data.data);
          goods.value = res.data.data;
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/goods/goods.vue:393", err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        },
        complete: () => {
          common_vendor.index.hideLoading();
        }
      });
    }
    function formatNumber(num) {
      if (num < 1e3) {
        return num.toString();
      } else {
        const kValue = Math.floor(num / 1e3);
        return `${kValue}k+`;
      }
    }
    function formatTimestamp(timestamp) {
      if (!timestamp || timestamp <= 0)
        return "未知";
      const date = new Date(timestamp * 1e3);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    }
    function likeFn() {
      let token = common_vendor.index.getStorageSync("token");
      if (!common_config.global.isLogin) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        return;
      }
      let requestData = {
        id: parseInt(props.goods_id),
        type: 1
      };
      let url = hasLike.value ? "/with-state/unlike" : "/with-state/add-like";
      common_vendor.index.request({
        url: common_config.websiteUrl + url,
        method: "POST",
        header: {
          "Authorization": token
        },
        data: requestData,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/goods/goods.vue:463", res.data);
          if (res.data.status == "success") {
            common_vendor.index.showToast({
              title: "操作成功",
              icon: "success"
            });
            hasLike.value = !hasLike.value;
            getHasLike();
            getGoods();
            return;
          } else {
            common_vendor.index.showToast({
              title: res.data.msg,
              icon: "none"
            });
            return;
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/goods/goods.vue:482", err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        }
      });
    }
    function getHasLike() {
      let token = common_vendor.index.getStorageSync("token");
      if (token == "") {
        return;
      }
      common_vendor.index.request({
        url: common_config.websiteUrl + "/with-state/hasLike?id=" + props.goods_id + "&type=1",
        method: "POST",
        header: {
          "Authorization": token
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/goods/goods.vue:504", res.data);
          if (res.data.status == "success") {
            if (res.data.data.id > 0) {
              hasLike.value = true;
            } else {
              hasLike.value = false;
            }
          } else {
            common_vendor.index.showToast({
              title: res.data.msg,
              icon: "none"
            });
            return;
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/goods/goods.vue:522", err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        }
      });
    }
    function jump2collocation() {
      common_vendor.index.navigateTo({
        url: "/pages/collocation/collocation?goods_id=" + props.goods_id + "&brand_id=" + goods.value.brand_id + "&goods_name=" + goods.value.name + "&brand_name=" + goods.value.brand_name + "&type=" + goods.value.type
      });
    }
    function jump2collectionDetail(collocation_id, origin) {
      common_vendor.index.navigateTo({
        url: "/pages/collocation_share/collocation_share?collocation_id=" + collocation_id + "&origin=" + origin
      });
    }
    function getCollocation() {
      common_vendor.index.request({
        url: common_config.websiteUrl + "/goods-collocation?goods_id=" + props.goods_id,
        method: "GET",
        timeout: 5e3,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/goods/goods.vue:553", res.data.data);
          collocationList.value = res.data.data;
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/goods/goods.vue:557", err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        }
      });
    }
    function getImageForList(urlList) {
      if (!urlList) {
        return "";
      }
      let urls = urlList.split(",");
      return urls[0].trim();
    }
    function viewFullImage(index) {
      common_vendor.index.previewImage({
        current: goods.value.goods_images["index"],
        urls: goods.value.goods_images
      });
    }
    getGoods();
    getCollocation();
    common_config.asyncGetUserInfo().then((userInfo) => {
      common_vendor.index.__f__("log", "at pages/goods/goods.vue:596", userInfo);
      getHasLike();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.unref(goods).name
      }, common_vendor.unref(goods).name ? common_vendor.e({
        b: common_vendor.p({
          type: common_vendor.unref(hasLike) ? "heart-filled" : "heart",
          size: "28",
          color: "#ff4d4f"
        }),
        c: common_vendor.t(formatNumber(common_vendor.unref(goods).goods_like_count)),
        d: common_vendor.o(($event) => likeFn()),
        e: common_vendor.f(common_vendor.unref(goods).goods_images, (item, key, i0) => {
          return {
            a: item,
            b: common_vendor.n("swiper-image-" + key),
            c: common_vendor.o(($event) => viewFullImage(), key),
            d: common_vendor.o(($event) => onImageLoad(key), key),
            e: key
          };
        }),
        f: common_vendor.o(onChange),
        g: swiperHeight.value + "px",
        h: common_vendor.t(common_vendor.unref(swiperIndex)),
        i: common_vendor.t(common_vendor.unref(goods).goods_images.length),
        j: common_vendor.unref(goods).goods_name_image,
        k: common_vendor.t(common_vendor.unref(goods).type),
        l: common_vendor.unref(goods).goods_price_image
      }, common_vendor.unref(goods).goods_price_image ? {
        m: common_vendor.unref(goods).goods_price_image
      } : common_vendor.unref(goods).goods_sales && common_vendor.unref(goods).goods_sales.length > 0 ? {
        o: common_vendor.t(common_vendor.unref(goods).goods_sales[0].sub_amount + common_vendor.unref(goods).goods_sales[0].fin_amount),
        p: common_vendor.t(common_vendor.unref(goods).goods_sales[0].currency)
      } : {}, {
        n: common_vendor.unref(goods).goods_sales && common_vendor.unref(goods).goods_sales.length > 0,
        q: common_vendor.t(common_vendor.unref(goods).sub_time1 > 0 ? formatTimestamp(common_vendor.unref(goods).sub_time1) : "未知"),
        r: common_vendor.t(common_vendor.unref(goods).size),
        s: common_vendor.t(common_vendor.unref(goods).size_detail),
        t: common_vendor.unref(goods).type === "单体" || common_vendor.unref(goods).type === "整体" || common_vendor.unref(goods).type === "单头"
      }, common_vendor.unref(goods).type === "单体" || common_vendor.unref(goods).type === "整体" || common_vendor.unref(goods).type === "单头" ? {
        v: common_vendor.t(common_vendor.unref(goods).body_size || "未知")
      } : {}, {
        w: common_vendor.t(common_vendor.unref(goods).skin),
        x: common_vendor.unref(goods).goods_brand_name_image
      }, common_vendor.unref(goods).goods_brand_name_image ? {
        y: common_vendor.o(($event) => jumpBrand(common_vendor.unref(goods).brand_id)),
        z: common_vendor.unref(goods).goods_brand_name_image
      } : {}, {
        A: common_vendor.t(common_vendor.unref(goods).desc_content || "暂无备注信息"),
        B: common_vendor.unref(goods).goods_sales && common_vendor.unref(goods).goods_sales.length > 0
      }, common_vendor.unref(goods).goods_sales && common_vendor.unref(goods).goods_sales.length > 0 ? {
        C: common_vendor.f(common_vendor.unref(goods).goods_sales, (sale, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(sale.sale_type),
            b: common_vendor.t(sale.sub_amount + sale.fin_amount),
            c: common_vendor.t(sale.currency),
            d: common_vendor.t(formatTimestamp(sale.sub_time)),
            e: sale.sub_time_end > 0
          }, sale.sub_time_end > 0 ? {} : {}, {
            f: sale.sub_time_end > 0
          }, sale.sub_time_end > 0 ? {
            g: common_vendor.t(formatTimestamp(sale.sub_time_end))
          } : {}, {
            h: common_vendor.t(sale.size),
            i: common_vendor.t(sale.size_detail),
            j: sale.id
          });
        })
      } : {}, {
        D: common_vendor.p({
          target_id: props.goods_id,
          type: "2",
          ["goods-type"]: common_vendor.unref(goods).type
        }),
        E: common_assets._imports_2$3,
        F: common_vendor.o(jump2collocation),
        G: common_vendor.f(common_vendor.unref(collocationList).collocation_relation_list, (collocation, k0, i0) => {
          return {
            a: getImageForList(collocation.image_urls),
            b: collocation.collocation_id,
            c: common_vendor.o(($event) => jump2collectionDetail(collocation.collocation_id, collocation.relation_origin), collocation.collocation_id)
          };
        }),
        H: common_assets._imports_1$4,
        I: common_vendor.o(jump2collocation),
        J: common_vendor.sr(commentListRef, "7e2880f6-2", {
          "k": "commentListRef"
        }),
        K: common_vendor.o(handleReplyComment),
        L: common_vendor.p({
          type: 2,
          ["relation-id"]: parseInt(props.goods_id)
        }),
        M: common_vendor.sr(commentInputRef, "7e2880f6-3", {
          "k": "commentInputRef"
        }),
        N: common_vendor.o(handleCommentSubmit),
        O: common_vendor.o((val) => common_vendor.isRef(replyForItem) ? replyForItem.value = val : replyForItem = val),
        P: common_vendor.p({
          ["reply-info"]: common_vendor.unref(replyForItem),
          ["target-id"]: props.goods_id
        })
      }) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7e2880f6"]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/goods/goods.js.map
