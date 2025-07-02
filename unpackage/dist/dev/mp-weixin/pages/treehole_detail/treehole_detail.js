"use strict";
const common_vendor = require("../../common/vendor.js");
const common_config = require("../../common/config.js");
if (!Array) {
  const _easycom_report_button2 = common_vendor.resolveComponent("report-button");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_comment_list2 = common_vendor.resolveComponent("comment-list");
  const _easycom_comment_input2 = common_vendor.resolveComponent("comment-input");
  (_easycom_report_button2 + _easycom_uni_icons2 + _easycom_comment_list2 + _easycom_comment_input2)();
}
const _easycom_report_button = () => "../../components/report-button/report-button.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_comment_list = () => "../../components/comment-list/comment-list.js";
const _easycom_comment_input = () => "../../components/comment-input/comment-input.js";
if (!Math) {
  (_easycom_report_button + _easycom_uni_icons + _easycom_comment_list + _easycom_comment_input)();
}
const _sfc_main = {
  __name: "treehole_detail",
  props: {
    id: {
      type: String,
      required: true
    }
  },
  setup(__props) {
    common_vendor.ref(true);
    common_vendor.ref(false);
    common_vendor.ref("");
    const pageId = common_vendor.ref(0);
    const detailData = common_vendor.ref(null);
    const commentListRef = common_vendor.ref(null);
    const commentInputRef = common_vendor.ref(null);
    common_vendor.ref(1);
    let replyForItem = common_vendor.ref({});
    const hasLiked = common_vendor.ref(false);
    const props = __props;
    const handleReplyComment = ({
      parent,
      target
    }) => {
      var _a;
      common_vendor.index.__f__("log", "at pages/treehole_detail/treehole_detail.vue:123", "parent", parent);
      common_vendor.index.__f__("log", "at pages/treehole_detail/treehole_detail.vue:124", "target", target);
      let item = parent;
      if (target != null) {
        item = target;
      }
      if (replyForItem.value.id == item.id) {
        replyForItem.value = {};
        return;
      }
      common_vendor.index.__f__("log", "at pages/treehole_detail/treehole_detail.vue:135", "item", item);
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
      common_vendor.index.__f__("log", "at pages/treehole_detail/treehole_detail.vue:153", "reply_info", replyInfo);
      const requestData = {
        content,
        origin,
        target_id: parseInt(pageId.value),
        type: 5,
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
              common_vendor.index.__f__("log", "at pages/treehole_detail/treehole_detail.vue:178", "添加主评论");
              (_a = commentListRef.value) == null ? void 0 : _a.addNewComment(newComment);
            } else {
              common_vendor.index.__f__("log", "at pages/treehole_detail/treehole_detail.vue:182", "添加子评论");
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
    function copyUrl(item) {
      let url = "http://m.dogdogdoll.com/#/pages/treehole_detail/treehole_detail?id=" + item.id;
      common_vendor.index.setClipboardData({
        data: url,
        success: function() {
          common_vendor.index.showToast({
            title: "复制链接成功",
            icon: "none"
          });
        }
      });
    }
    const handleLike = () => {
      if (!common_config.global.isLogin) {
        common_vendor.index.showModal({
          title: "提示",
          content: "需要登录后才能点赞",
          success: (res) => {
            if (res.confirm)
              common_vendor.index.navigateTo({
                url: "/pages/login/login"
              });
          }
        });
        return;
      }
      const token = common_vendor.index.getStorageSync("token");
      const url = common_config.websiteUrl + (hasLiked.value ? "/with-state/unlike" : "/with-state/add-like");
      common_vendor.index.request({
        url,
        method: "POST",
        header: {
          Authorization: token
        },
        data: {
          id: parseInt(props.id),
          type: 5
          // 假设树洞类型为5
        },
        success: (res) => {
          if (res.data.status === "success") {
            hasLiked.value = !hasLiked.value;
            detailData.value.like_count += hasLiked.value ? 1 : -1;
          }
        }
      });
    };
    function getHasLike() {
      let token = common_vendor.index.getStorageSync("token");
      if (token == "") {
        return;
      }
      common_vendor.index.request({
        url: common_config.websiteUrl + "/with-state/hasLike?id=" + props.id + "&type=5",
        method: "POST",
        header: {
          "Authorization": token
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/treehole_detail/treehole_detail.vue:276", res.data);
          if (res.data.status == "success") {
            if (res.data.data.id > 0) {
              hasLiked.value = true;
            } else {
              hasLiked.value = false;
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
          common_vendor.index.__f__("log", "at pages/treehole_detail/treehole_detail.vue:294", err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        }
      });
    }
    const displayImages = common_vendor.computed(() => {
      var _a, _b;
      return ((_b = (_a = detailData.value) == null ? void 0 : _a.images) == null ? void 0 : _b.slice(0, 9)) || [];
    });
    const remainingCount = common_vendor.computed(() => {
      var _a, _b;
      return (((_b = (_a = detailData.value) == null ? void 0 : _a.images) == null ? void 0 : _b.length) || 0) - 9;
    });
    const showOverlay = common_vendor.computed(() => {
      var _a, _b;
      return (((_b = (_a = detailData.value) == null ? void 0 : _a.images) == null ? void 0 : _b.length) || 0) > 9;
    });
    common_vendor.index.setNavigationBarTitle({
      title: "投稿详情"
    });
    const layoutClass = common_vendor.computed(() => {
      const count = displayImages.value.length;
      if (count === 1)
        return "single";
      if (count === 2)
        return "double";
      return "multi";
    });
    const formatTime = (timestamp) => {
      const date = new Date(timestamp * 1e3);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    };
    const previewImage = (index) => {
      common_vendor.index.previewImage({
        current: index,
        urls: detailData.value.images
      });
    };
    common_vendor.onMounted(async () => {
      pageId.value = props.id;
      common_vendor.index.__f__("log", "at pages/treehole_detail/treehole_detail.vue:360", "pageId", pageId.value);
      try {
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl}/treehole-detail?id=${props.id}`
        });
        if (res.data.status === "success") {
          detailData.value = res.data.data;
        }
      } catch (error) {
        common_vendor.index.__f__("log", "at pages/treehole_detail/treehole_detail.vue:371", error);
        common_vendor.index.showToast({
          title: "加载失败",
          icon: "none"
        });
      }
      common_config.asyncGetUserInfo();
      getHasLike();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: detailData.value
      }, detailData.value ? {
        b: detailData.value.avatar || "/static/noname.png",
        c: common_vendor.t(detailData.value.author_name),
        d: common_vendor.t(formatTime(detailData.value.created_at)),
        e: common_vendor.p({
          ["report-type"]: "3",
          ["relation-id"]: parseInt(props.id),
          ["button-text"]: "举报",
          ["icon-type"]: "flag",
          ["icon-size"]: "24",
          ["icon-color"]: "#666"
        }),
        f: common_vendor.t(detailData.value.content),
        g: common_vendor.f(displayImages.value, (img, index, i0) => {
          return common_vendor.e({
            a: img,
            b: common_vendor.o(($event) => previewImage(index), index),
            c: showOverlay.value && index === 8
          }, showOverlay.value && index === 8 ? {
            d: common_vendor.t(remainingCount.value)
          } : {}, {
            e: index
          });
        }),
        h: common_vendor.n(layoutClass.value),
        i: common_vendor.p({
          type: hasLiked.value ? "hand-up-filled" : "hand-up",
          size: "24",
          color: hasLiked.value ? "#ff4d4f" : "#666"
        }),
        j: common_vendor.t(detailData.value.like_count || 0),
        k: common_vendor.o(handleLike),
        l: common_vendor.p({
          type: "redo",
          size: "24",
          color: "#666"
        }),
        m: common_vendor.o(($event) => copyUrl(detailData.value)),
        n: common_vendor.t(formatTime(detailData.value.approve_time))
      } : {}, {
        o: common_vendor.sr(commentListRef, "f102c4f6-3", {
          "k": "commentListRef"
        }),
        p: common_vendor.o(handleReplyComment),
        q: common_vendor.p({
          type: 5,
          ["relation-id"]: parseInt(props.id)
        }),
        r: common_vendor.sr(commentInputRef, "f102c4f6-4", {
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
_sfc_main.__runtimeHooks = 2;
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/treehole_detail/treehole_detail.js.map
