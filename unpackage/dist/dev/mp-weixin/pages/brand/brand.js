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
    common_vendor.index.__f__("log", "at pages/brand/brand.vue:103", props);
    const hasLikeBrand = common_vendor.ref(false);
    const activeModal = common_vendor.ref(false);
    common_vendor.index.showLoading({
      title: "加载中"
    });
    common_vendor.index.getSystemInfoSync();
    let rateValue = common_vendor.ref(0);
    const commentListRef = common_vendor.ref(null);
    const commentInputRef = common_vendor.ref(null);
    common_vendor.ref(1);
    let replyForItem = common_vendor.ref({});
    const handleReplyComment = ({
      parent,
      target
    }) => {
      var _a;
      common_vendor.index.__f__("log", "at pages/brand/brand.vue:131", "parent", parent);
      common_vendor.index.__f__("log", "at pages/brand/brand.vue:132", "target", target);
      let item = parent;
      if (target != null) {
        item = target;
      }
      if (replyForItem.value.id == item.id) {
        replyForItem.value = {};
        return;
      }
      common_vendor.index.__f__("log", "at pages/brand/brand.vue:143", "item", item);
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
      common_vendor.index.__f__("log", "at pages/brand/brand.vue:161", "reply_info", replyInfo);
      const requestData = {
        content,
        origin,
        target_id: parseInt(pageId.value),
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
    function voteScoreProxy() {
      if (rateValue.value == 0) {
        common_vendor.index.showToast({
          title: "请先评分",
          icon: "none"
        });
        return;
      }
      if (rateValue.value > 5) {
        common_vendor.index.showToast({
          title: "评分不能大于5",
          icon: "none"
        });
        return;
      }
      common_vendor.index.__f__("log", "at pages/brand/brand.vue:230", rateValue.value, props.brand_id);
      common_config.voteScore(1, rateValue.value, props.brand_id);
    }
    function getBrandsInfo() {
      common_vendor.index.request({
        url: common_config.websiteUrl + "/brand-info?id=" + props.brand_id,
        method: "GET",
        timeout: 5e3,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/brand/brand.vue:241", res.data.data);
          brand.value = res.data.data;
          common_vendor.index.setNavigationBarTitle({
            title: res.data.data.brand_name
          });
          getHasLikeBrand();
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/brand/brand.vue:251", err);
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
        common_vendor.index.showToast({ title: "请先登录", icon: "none" });
        return;
      }
      try {
        const url = `${common_config.websiteUrl}/with-state/${hasLikeBrand.value ? "unlike" : "add-like"}`;
        const res = await common_vendor.index.request({
          url,
          method: "POST",
          header: { Authorization: token },
          data: {
            id: parseInt(props.brand_id),
            type: 2
            // 注意：品牌类型可能需要确认，这里假设2代表品牌
          }
        });
        if (res.data.status === "success") {
          hasLikeBrand.value = !hasLikeBrand.value;
          common_vendor.index.showToast({ title: hasLikeBrand.value ? "关注成功" : "已取消关注", icon: "none" });
          getBrandsInfo();
        } else {
          common_vendor.index.showToast({ title: res.data.msg, icon: "none" });
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/brand/brand.vue:292", err);
        common_vendor.index.showToast({ title: "操作失败", icon: "none" });
      }
    };
    const getHasLikeBrand = async () => {
      var _a;
      try {
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl}/with-state/hasLike?id=${parseInt(props.brand_id)}&type=2`,
          method: "POST",
          header: { Authorization: common_vendor.index.getStorageSync("token") }
        });
        hasLikeBrand.value = ((_a = res.data.data) == null ? void 0 : _a.id) > 0;
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/brand/brand.vue:309", "获取关注状态失败:", err);
      }
    };
    function getBrandGoods() {
      common_vendor.index.request({
        url: common_config.websiteUrl + "/brand-goods?brand_id=" + props.brand_id + "&page=" + page.value,
        method: "GET",
        timeout: 5e3,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/brand/brand.vue:333", res.data.data);
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
          common_vendor.index.__f__("log", "at pages/brand/brand.vue:350", err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        }
      });
    }
    function openRate(i) {
      activeModal.value = !activeModal.value;
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
          common_vendor.index.__f__("log", "at pages/brand/brand.vue:452", res.data.data);
          if (res.data.status == "success") {
            rateValue.value = res.data.data.score;
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
          common_vendor.index.__f__("log", "at pages/brand/brand.vue:465", err);
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
    let goods = common_vendor.ref({});
    let page = common_vendor.ref(1);
    let brand = common_vendor.ref({});
    getBrandsInfo();
    getBrandGoods();
    getMyScore(1, props.brand_id);
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.unref(brand).logo_image,
        b: common_vendor.t(common_vendor.unref(brand).brand_name),
        c: common_vendor.t(common_vendor.unref(brand).country_name),
        d: common_vendor.t(common_vendor.unref(brand).type),
        e: common_vendor.p({
          value: common_vendor.unref(brand).score,
          ["allow-half"]: "true",
          ["disabled-color"]: "rgb(255 157 219)"
        }),
        f: common_vendor.t(common_vendor.unref(brand).score),
        g: common_vendor.t(common_vendor.unref(brand).vote_number),
        h: common_vendor.o(($event) => openRate()),
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
        q: common_vendor.sr(commentListRef, "1a297a1d-1", {
          "k": "commentListRef"
        }),
        r: common_vendor.o(handleReplyComment),
        s: common_vendor.p({
          type: 1,
          ["relation-id"]: parseInt(props.brand_id)
        }),
        t: _ctx.loading
      }, _ctx.loading ? {} : {}, {
        v: _ctx.error
      }, _ctx.error ? {
        w: common_vendor.t(_ctx.errorMsg)
      } : {}, {
        x: common_vendor.t(common_vendor.unref(rateValue)),
        y: common_vendor.o(($event) => common_vendor.isRef(rateValue) ? rateValue.value = $event : rateValue = $event),
        z: common_vendor.p({
          ["allow-half"]: "true",
          size: "45",
          modelValue: common_vendor.unref(rateValue)
        }),
        A: common_vendor.o(voteScoreProxy),
        B: !activeModal.value ? 1 : "",
        C: common_vendor.o(($event) => openRate()),
        D: common_vendor.sr(commentInputRef, "1a297a1d-3", {
          "k": "commentInputRef"
        }),
        E: common_vendor.o(handleCommentSubmit),
        F: common_vendor.o((val) => common_vendor.isRef(replyForItem) ? replyForItem.value = val : replyForItem = val),
        G: common_vendor.p({
          ["reply-info"]: common_vendor.unref(replyForItem),
          ["target-id"]: props.brand_id
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1a297a1d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/brand/brand.js.map
