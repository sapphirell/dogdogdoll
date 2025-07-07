"use strict";
const common_vendor = require("../../common/vendor.js");
const common_config = require("../../common/config.js");
if (!Array) {
  const _easycom_uni_rate2 = common_vendor.resolveComponent("uni-rate");
  const _easycom_comment_list2 = common_vendor.resolveComponent("comment-list");
  const _easycom_comment_input2 = common_vendor.resolveComponent("comment-input");
  (_easycom_uni_rate2 + _easycom_comment_list2 + _easycom_comment_input2)();
}
const _easycom_uni_rate = () => "../../uni_modules/uni-rate/components/uni-rate/uni-rate.js";
const _easycom_comment_list = () => "../../components/comment-list/comment-list.js";
const _easycom_comment_input = () => "../../components/comment-input/comment-input.js";
if (!Math) {
  (_easycom_uni_rate + _easycom_comment_list + _easycom_comment_input)();
}
const _sfc_main = {
  __name: "brand",
  props: ["brand_id"],
  setup(__props) {
    const props = __props;
    common_vendor.index.__f__("log", "at pages/brand/brand.vue:120", props);
    const hasLikeBrand = common_vendor.ref(false);
    let newsList = common_vendor.ref([]);
    let newsPage = common_vendor.ref({
      page_index: 1,
      // 当前页码
      page_size: 3,
      // 每页数量
      total: 0
      // 总数
    });
    common_vendor.index.showLoading({
      title: "加载中"
    });
    common_vendor.index.getSystemInfoSync();
    let rateValue = common_vendor.ref(0);
    const myRateValue = common_vendor.ref(0);
    const commentListRef = common_vendor.ref(null);
    const commentInputRef = common_vendor.ref(null);
    common_vendor.ref(1);
    let replyForItem = common_vendor.ref({});
    const handleReplyComment = ({
      parent,
      target
    }) => {
      var _a;
      common_vendor.index.__f__("log", "at pages/brand/brand.vue:152", "parent", parent);
      common_vendor.index.__f__("log", "at pages/brand/brand.vue:153", "target", target);
      let item = parent;
      if (target != null) {
        item = target;
      }
      if (replyForItem.value.id == item.id) {
        replyForItem.value = {};
        return;
      }
      common_vendor.index.__f__("log", "at pages/brand/brand.vue:164", "item", item);
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
      common_vendor.index.__f__("log", "at pages/brand/brand.vue:182", "reply_info", replyInfo);
      const requestData = {
        content,
        origin,
        target_id: parseInt(props.brand_id),
        type: 1,
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
    const onRateChange = (e) => {
      common_vendor.index.__f__("log", "at pages/brand/brand.vue:236", e);
      if (!common_config.global.isLogin) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        rateValue.value = 0;
        return;
      }
      rateValue.value = e.value;
      myRateValue.value = e.value;
      voteScoreProxy();
    };
    async function voteScoreProxy() {
      if (rateValue.value == 0) {
        common_vendor.index.showToast({
          title: "请先评分",
          icon: "none"
        });
        return;
      }
      try {
        let token = common_vendor.index.getStorageSync("token");
        if (!token) {
          common_vendor.index.showToast({
            title: "请先登录",
            icon: "none"
          });
          return;
        }
        common_vendor.index.showLoading({
          title: "提交中..."
        });
        const res = await common_vendor.index.request({
          url: common_config.websiteUrl + "/with-state/add-vote-score",
          method: "POST",
          header: {
            "Authorization": token,
            "Content-Type": "application/json"
          },
          data: {
            type: 1,
            score: rateValue.value,
            target_id: parseInt(props.brand_id)
          }
        });
        common_vendor.index.hideLoading();
        if (res.data.status === "success") {
          getBrandsInfo();
          common_vendor.index.showToast({
            title: "评分成功",
            icon: "success"
          });
        } else {
          common_vendor.index.showToast({
            title: res.data.msg || "评分失败",
            icon: "none"
          });
        }
      } catch (err) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/brand/brand.vue:308", "评分失败:", err);
        common_vendor.index.showToast({
          title: "评分失败，请重试",
          icon: "none"
        });
      }
    }
    function getBrandNews() {
      common_vendor.index.request({
        url: `${common_config.websiteUrl}/brand-news-list?brand_id=${props.brand_id}&page=${newsPage.value.page_index}&page_size=${newsPage.value.page_size}`,
        method: "GET",
        success: (res) => {
          if (res.data.status === "success") {
            const data = res.data.data;
            newsList.value = [...newsList.value, ...data.news_list];
            newsPage.value.total = data.total;
            if (data.news_list.length > 0) {
              newsPage.value.page_index += 1;
            }
          } else {
            common_vendor.index.showToast({
              title: res.data.msg || "获取图透失败",
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
    }
    function getBrandsInfo() {
      common_vendor.index.request({
        url: common_config.websiteUrl + "/brand-info?id=" + props.brand_id,
        method: "GET",
        timeout: 5e3,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/brand/brand.vue:367", res.data.data);
          brand.value = res.data.data;
          common_vendor.index.setNavigationBarTitle({
            title: res.data.data.brand_name
          });
          getHasLikeBrand();
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/brand/brand.vue:377", err);
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
    const likeBrand = async () => {
      let token = common_vendor.index.getStorageSync("token");
      if (!common_config.global.isLogin) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        return;
      }
      try {
        const url = `${common_config.websiteUrl}/with-state/${hasLikeBrand.value ? "unlike" : "add-like"}`;
        const res = await common_vendor.index.request({
          url,
          method: "POST",
          header: {
            Authorization: token
          },
          data: {
            id: parseInt(props.brand_id),
            type: 2
            // 注意：品牌类型可能需要确认，这里假设2代表品牌
          }
        });
        if (res.data.status === "success") {
          hasLikeBrand.value = !hasLikeBrand.value;
          common_vendor.index.showToast({
            title: hasLikeBrand.value ? "关注成功" : "已取消关注",
            icon: "none"
          });
          getBrandsInfo();
        } else {
          common_vendor.index.showToast({
            title: res.data.msg,
            icon: "none"
          });
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/brand/brand.vue:429", err);
        common_vendor.index.showToast({
          title: "操作失败",
          icon: "none"
        });
      }
    };
    const getHasLikeBrand = async () => {
      var _a;
      try {
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl}/with-state/hasLike?id=${parseInt(props.brand_id)}&type=2`,
          method: "POST",
          header: {
            Authorization: common_vendor.index.getStorageSync("token")
          }
        });
        hasLikeBrand.value = ((_a = res.data.data) == null ? void 0 : _a.id) > 0;
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/brand/brand.vue:451", "获取关注状态失败:", err);
      }
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
    function getBrandGoods() {
      common_vendor.index.request({
        url: common_config.websiteUrl + "/brand-goods?brand_id=" + props.brand_id + "&page=" + page.value,
        method: "GET",
        timeout: 5e3,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/brand/brand.vue:476", res.data.data);
          goods.value.page_index = res.data.data.page_index;
          goods.value.total = res.data.data.total;
          goods.value.goods_list = goods.value.goods_list ? goods.value.goods_list.concat(res.data.data.goods_list) : res.data.data.goods_list;
          if (res.data.data.goods_list.length > 0) {
            page.value += 1;
          }
          if (res.data.data.goods_list.length == 0 && page.value > 1) {
            common_vendor.index.showToast({
              title: "没有更多数据了",
              icon: "none"
            });
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/brand/brand.vue:494", err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        }
      });
    }
    function viewFullImage(currentUrl, allUrl) {
      common_vendor.index.previewImage({
        current: currentUrl,
        urls: allUrl
      });
    }
    function getMyScore(type, targetId) {
      let token = common_vendor.index.getStorageSync("token");
      if (!token) {
        return 0;
      }
      if (!common_config.global.isLogin) {
        return 0;
      }
      common_vendor.index.request({
        url: common_config.websiteUrl + "/with-state/my-vote-record",
        method: "GET",
        header: {
          "Authorization": token,
          "Content-Type": "application/json"
        },
        data: {
          target_id: parseInt(targetId),
          type
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/brand/brand.vue:600", res.data.data);
          if (res.data.status == "success") {
            myRateValue.value = res.data.data.score;
            return res.data.data.score;
          } else {
            common_vendor.index.showToast({
              title: res.data.msg,
              icon: "none"
            });
            return 0;
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/brand/brand.vue:613", err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
          return 0;
        }
      });
    }
    function jumpGoods(id) {
      common_vendor.index.navigateTo({
        url: "/pages/goods/goods?goods_id=" + id
      });
    }
    function jump2saleNews(item) {
      common_vendor.index.navigateTo({
        url: `/pages/sale_news/sale_news?id=${item.id}&brand_id=${item.brand_id}`
      });
    }
    let goods = common_vendor.ref({});
    let page = common_vendor.ref(1);
    let brand = common_vendor.ref({});
    common_vendor.onShow(() => {
      common_config.getUserInfo();
      getBrandsInfo();
      getBrandGoods();
      getBrandNews();
      if (common_config.global.isLogin) {
        getMyScore(1, props.brand_id);
      } else {
        rateValue.value = 0;
      }
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.unref(brand).logo_image,
        b: common_vendor.unref(brand).brand_name_image,
        c: common_vendor.t(common_vendor.unref(brand).country_name),
        d: common_vendor.t(common_vendor.unref(brand).type),
        e: common_vendor.o(onRateChange),
        f: common_vendor.p({
          value: common_vendor.unref(brand).score,
          ["allow-half"]: "true",
          activeColor: "#65C3D6",
          ["is-fill"]: "false"
        }),
        g: common_vendor.t(common_vendor.unref(brand).score),
        h: common_vendor.t(common_vendor.unref(brand).vote_number),
        i: common_vendor.t(hasLikeBrand.value ? "已关注" : "+ 关注品牌"),
        j: common_vendor.o(likeBrand),
        k: hasLikeBrand.value ? "#ff6a6c" : "#65C3D6",
        l: common_vendor.t(common_vendor.unref(brand).nickname_list),
        m: common_vendor.t(common_vendor.unref(brand).description),
        n: common_vendor.t(common_vendor.unref(goods).total),
        o: common_vendor.f(common_vendor.unref(goods).goods_list, (item, index, i0) => {
          return {
            a: item.goods_images[0],
            b: common_vendor.t(item.name),
            c: common_vendor.o(($event) => jumpGoods(item.id), item.id),
            d: item.id
          };
        }),
        p: common_vendor.o(getBrandGoods),
        q: common_vendor.t(common_vendor.unref(newsPage).total),
        r: common_vendor.f(common_vendor.unref(newsList), (item, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.title),
            b: item.image_list && item.image_list.length > 0
          }, item.image_list && item.image_list.length > 0 ? {
            c: common_vendor.f(item.image_list, (img, imgIndex, i1) => {
              return {
                a: img,
                b: common_vendor.o(($event) => viewFullImage(img, item.image_list), imgIndex),
                c: imgIndex
              };
            })
          } : {}, {
            d: common_vendor.t(item.content),
            e: common_vendor.t(formatTimestamp(item.created_at)),
            f: common_vendor.o(($event) => jump2saleNews(item), item.id),
            g: item.id
          });
        }),
        s: common_vendor.sr(commentListRef, "1a297a1d-1", {
          "k": "commentListRef"
        }),
        t: common_vendor.o(handleReplyComment),
        v: common_vendor.p({
          type: 1,
          ["relation-id"]: parseInt(props.brand_id)
        }),
        w: common_vendor.sr(commentInputRef, "1a297a1d-2", {
          "k": "commentInputRef"
        }),
        x: common_vendor.o(handleCommentSubmit),
        y: common_vendor.o((val) => common_vendor.isRef(replyForItem) ? replyForItem.value = val : replyForItem = val),
        z: common_vendor.p({
          ["reply-info"]: common_vendor.unref(replyForItem),
          ["target-id"]: props.brand_id
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1a297a1d"]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/brand/brand.js.map
