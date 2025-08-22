"use strict";
const common_vendor = require("../../common/vendor.js");
const common_config = require("../../common/config.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_comment_list2 = common_vendor.resolveComponent("comment-list");
  const _easycom_comment_input2 = common_vendor.resolveComponent("comment-input");
  (_easycom_uni_icons2 + _easycom_comment_list2 + _easycom_comment_input2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_comment_list = () => "../../components/comment-list/comment-list.js";
const _easycom_comment_input = () => "../../components/comment-input/comment-input.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_comment_list + _easycom_comment_input)();
}
const _sfc_main = {
  __name: "artwork",
  setup(__props) {
    const detailData = common_vendor.ref({
      id: 0,
      title: "",
      head_name: "",
      faceup_tag_content: [],
      sex: 0,
      created_at: 0,
      brand_id: 0,
      art_type: 1,
      goods_id: 0,
      images: [],
      like_count: 0
    });
    const goodsInfo = common_vendor.ref(null);
    const brandInfo = common_vendor.ref(null);
    const loading = common_vendor.ref(true);
    const error = common_vendor.ref(false);
    const errorMsg = common_vendor.ref("");
    const hasLike = common_vendor.ref(false);
    const pageId = common_vendor.ref(0);
    const commentType = common_vendor.ref(8);
    const commentListRef = common_vendor.ref(null);
    const commentInputRef = common_vendor.ref(null);
    const replyForItem = common_vendor.ref({});
    function formatNumber(num) {
      if (!num)
        return "0";
      if (num < 1e3)
        return num.toString();
      return `${Math.floor(num / 1e3)}k+`;
    }
    function getSexText(sex) {
      const sexMap = {
        0: "未知",
        1: "男",
        2: "女"
      };
      return sexMap[sex] || "未知";
    }
    function getArtTypeText(type) {
      const typeMap = {
        1: "妆师",
        2: "毛娘"
      };
      return typeMap[type] || "未知类型";
    }
    function formatTimestamp(timestamp) {
      if (!timestamp)
        return "";
      const date = new Date(timestamp * 1e3);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
    }
    function viewFullImage(index) {
      common_vendor.index.previewImage({
        current: detailData.value.images[index],
        urls: detailData.value.images
      });
    }
    const fetchData = async (id) => {
      try {
        loading.value = true;
        const res = await common_vendor.index.request({
          url: common_config.websiteUrl.value + `/faceup/detail?id=${id}`
        });
        if (res.data.status !== "success") {
          handleError(res.data.msg || "数据加载失败");
          return;
        }
        detailData.value = res.data.data;
        if (!Array.isArray(detailData.value.images)) {
          detailData.value.images = detailData.value.face_up_image_urls ? detailData.value.face_up_image_urls.split(",") : [];
        }
        if (detailData.value.goods_id) {
          fetchGoodsInfo(detailData.value.goods_id);
        }
        if (detailData.value.brand_id) {
          fetchBrandInfo(detailData.value.brand_id);
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/artwork/artwork.vue:191", "获取作品详情失败:", err);
        handleError("数据加载失败");
      } finally {
        loading.value = false;
      }
    };
    const fetchGoodsInfo = async (goodsId) => {
      try {
        const res = await common_vendor.index.request({
          url: common_config.websiteUrl.value + `/goods?id=${goodsId}`,
          method: "GET"
        });
        if (res.data.status === "success") {
          goodsInfo.value = res.data.data;
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/artwork/artwork.vue:210", "获取商品信息失败:", e);
      }
    };
    const fetchBrandInfo = async (brandId) => {
      try {
        const res = await common_vendor.index.request({
          url: common_config.websiteUrl.value + `/brand-info?id=${brandId}`,
          method: "GET"
        });
        if (res.data.status === "success") {
          brandInfo.value = res.data.data;
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/artwork/artwork.vue:226", "获取品牌信息失败:", e);
      }
    };
    const handleError = (msg) => {
      error.value = true;
      errorMsg.value = msg;
      common_vendor.index.showToast({
        title: msg,
        icon: "none"
      });
    };
    function navigateToGoods(goodsId) {
      common_vendor.index.navigateTo({
        url: `/pages/goods/goods?goods_id=${goodsId}`
      });
    }
    function navigateToBrand(brandId) {
      common_vendor.index.navigateTo({
        url: `/pages/brand/brand?brand_id=${brandId}`
      });
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
      const requestData = {
        id: parseInt(pageId.value),
        type: 7
        // 妆师作品点赞类型为7
      };
      let url = hasLike.value ? "/with-state/unlike" : "/with-state/add-like";
      common_vendor.index.request({
        url: common_config.websiteUrl.value + url,
        method: "POST",
        header: {
          "Authorization": token
        },
        data: requestData,
        success: (res) => {
          if (res.data.status == "success") {
            common_vendor.index.showToast({
              title: hasLike.value ? "取消点赞" : "点赞成功",
              icon: "success"
            });
            hasLike.value = !hasLike.value;
            if (hasLike.value) {
              detailData.value.like_count += 1;
            } else {
              detailData.value.like_count -= 1;
            }
          } else {
            common_vendor.index.showToast({
              title: res.data.msg || "操作失败",
              icon: "none"
            });
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/artwork/artwork.vue:301", err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        }
      });
    }
    function getHasLike() {
      let token = common_vendor.index.getStorageSync("token");
      if (!token) {
        return;
      }
      common_vendor.index.request({
        url: common_config.websiteUrl.value + "/with-state/hasLike?id=" + pageId.value + "&type=7",
        // 类型7
        method: "POST",
        header: {
          "Authorization": token
        },
        success: (res) => {
          if (res.data.status == "success") {
            hasLike.value = res.data.data.id > 0;
          }
        }
      });
    }
    const handleReplyComment = ({ parent, target }) => {
      var _a;
      let item = parent;
      if (target != null) {
        item = target;
      }
      if (replyForItem.value.id == item.id) {
        replyForItem.value = {};
        return;
      }
      replyForItem.value = item;
      (_a = commentInputRef.value) == null ? void 0 : _a.focusInput();
    };
    const handleCommentSubmit = (submitData) => {
      var _a, _b, _c;
      let token = common_vendor.index.getStorageSync("token");
      if (!common_config.global.isLogin) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        return;
      }
      const requestData = {
        content: submitData.content,
        origin: submitData.origin,
        target_id: parseInt(pageId.value),
        type: 8,
        // 妆师作品评论类型为8
        image_url: submitData.image_url || "",
        association_id: submitData.association_id || 0,
        association_type: submitData.association_type || 0,
        is_anonymous: submitData.is_anonymous || 0,
        ...replyForItem.value.id && {
          reply_id: replyForItem.value.id,
          reply_for: replyForItem.value.comment,
          reply_uid: replyForItem.value.user_id,
          parent_id: replyForItem.value.parent_id > 0 ? replyForItem.value.parent_id : replyForItem.value.id
        }
      };
      const tempComment = {
        id: Date.now(),
        content: submitData.content,
        created_at: Math.floor(Date.now() / 1e3),
        like_count: 0,
        reply_count: 0,
        is_liked: false,
        floor: 0,
        ...submitData.is_anonymous ? {
          avatar: "https://images1.fantuanpu.com/home/default_avatar.jpg",
          username: "匿名用户",
          is_anonymous: 1
        } : {
          avatar: common_config.global.userInfo.avatar,
          username: common_config.global.userInfo.nickname,
          is_anonymous: 0
        },
        ...submitData.image_url && {
          image_url: submitData.image_url
        },
        ...replyForItem.value.id && {
          reply_id: replyForItem.value.id,
          reply_for: replyForItem.value.comment,
          reply_uid: replyForItem.value.user_id,
          parent_id: replyForItem.value.parent_id > 0 ? replyForItem.value.parent_id : replyForItem.value.id,
          reply_username: replyForItem.value.is_anonymous ? "匿名用户" : replyForItem.value.username
        }
      };
      if (!replyForItem.value.id) {
        (_a = commentListRef.value) == null ? void 0 : _a.addNewComment(tempComment);
      } else if (replyForItem.value.parent_id === 0) {
        (_b = commentListRef.value) == null ? void 0 : _b.addReplyComment({
          ...tempComment,
          parent_id: replyForItem.value.id
        });
      } else {
        (_c = commentListRef.value) == null ? void 0 : _c.addReplyComment({
          ...tempComment,
          parent_id: replyForItem.value.parent_id
        });
      }
      common_vendor.index.request({
        url: common_config.websiteUrl.value + "/with-state/add-comment",
        method: "POST",
        header: {
          "Authorization": token
        },
        data: requestData,
        success: (res) => {
          var _a2, _b2;
          if (res.data.status == "success") {
            const newComment = res.data.data;
            const finalComment = {
              ...newComment,
              ...submitData.is_anonymous ? {
                avatar: "https://images1.fantuanpu.com/home/default_avatar.jpg",
                username: "匿名用户",
                is_anonymous: 1
              } : {
                avatar: common_config.global.userInfo.avatar,
                username: common_config.global.userInfo.nickname,
                is_anonymous: 0
              }
            };
            if (newComment.reply_uid && replyForItem.value.is_anonymous) {
              finalComment.reply_username = "匿名用户";
            }
            (_a2 = commentListRef.value) == null ? void 0 : _a2.updateTempComment(tempComment.id, finalComment);
            common_vendor.index.showToast({
              title: "评论成功",
              icon: "success"
            });
          } else {
            (_b2 = commentListRef.value) == null ? void 0 : _b2.removeTempComment(tempComment.id);
            common_vendor.index.showToast({
              title: res.data.msg,
              icon: "none"
            });
          }
        },
        fail: (err) => {
          var _a2;
          (_a2 = commentListRef.value) == null ? void 0 : _a2.removeTempComment(tempComment.id);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        }
      });
    };
    common_vendor.onLoad((options) => {
      if (!options.id) {
        handleError("缺少必要参数");
        return;
      }
      pageId.value = options.id;
      fetchData(options.id);
      common_config.asyncGetUserInfo().then(() => {
        getHasLike();
      });
    });
    return (_ctx, _cache) => {
      var _a, _b;
      return common_vendor.e({
        a: !hasLike.value
      }, !hasLike.value ? {
        b: common_vendor.p({
          type: "heart",
          size: "28",
          color: "#ff4d4f"
        })
      } : {
        c: common_vendor.p({
          type: "heart-filled",
          size: "28",
          color: "#ff4d4f"
        })
      }, {
        d: common_vendor.t(((_a = detailData.value) == null ? void 0 : _a.like_count) ? formatNumber(detailData.value.like_count) : 0),
        e: common_vendor.o(($event) => likeFn()),
        f: common_vendor.f(detailData.value.images, (img, index, i0) => {
          return {
            a: img,
            b: common_vendor.o(($event) => viewFullImage(index), index),
            c: index
          };
        }),
        g: brandInfo.value
      }, brandInfo.value ? {
        h: brandInfo.value.logo_image,
        i: common_vendor.t(brandInfo.value.brand_name),
        j: common_vendor.t(formatTimestamp(detailData.value.created_at)),
        k: common_vendor.o(($event) => navigateToBrand(detailData.value.brand_id))
      } : {}, {
        l: common_vendor.t(detailData.value.title),
        m: common_vendor.t(detailData.value.head_name),
        n: common_vendor.t(getSexText(detailData.value.sex)),
        o: common_vendor.t(getArtTypeText(detailData.value.art_type)),
        p: detailData.value.faceup_tag_content && detailData.value.faceup_tag_content.length
      }, detailData.value.faceup_tag_content && detailData.value.faceup_tag_content.length ? {
        q: common_vendor.f(detailData.value.faceup_tag_content, (tag, index, i0) => {
          return {
            a: common_vendor.t(tag),
            b: index
          };
        })
      } : {}, {
        r: detailData.value.goods_id && goodsInfo.value
      }, detailData.value.goods_id && goodsInfo.value ? {
        s: ((_b = goodsInfo.value.goods_images) == null ? void 0 : _b[0]) || "/static/goods-default.png",
        t: common_vendor.t(goodsInfo.value.name),
        v: common_vendor.t(goodsInfo.value.brand_name),
        w: common_vendor.o(($event) => navigateToGoods(detailData.value.goods_id))
      } : {}, {
        x: common_vendor.sr(commentListRef, "0583fe19-2", {
          "k": "commentListRef"
        }),
        y: common_vendor.o(handleReplyComment),
        z: common_vendor.p({
          type: commentType.value,
          ["relation-id"]: parseInt(pageId.value)
        }),
        A: common_vendor.sr(commentInputRef, "0583fe19-3", {
          "k": "commentInputRef"
        }),
        B: common_vendor.o(handleCommentSubmit),
        C: common_vendor.o((val) => replyForItem.value = val),
        D: common_vendor.p({
          ["reply-info"]: replyForItem.value,
          ["target-id"]: pageId.value
        }),
        E: loading.value
      }, loading.value ? {} : {}, {
        F: error.value
      }, error.value ? {
        G: common_vendor.t(errorMsg.value)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-0583fe19"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/artwork/artwork.js.map
