"use strict";
const common_vendor = require("../../common/vendor.js");
const common_config = require("../../common/config.js");
if (!Array) {
  const _easycom_view_logs2 = common_vendor.resolveComponent("view-logs");
  const _easycom_report_button2 = common_vendor.resolveComponent("report-button");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_comment_list2 = common_vendor.resolveComponent("comment-list");
  const _easycom_comment_input2 = common_vendor.resolveComponent("comment-input");
  (_easycom_view_logs2 + _easycom_report_button2 + _easycom_uni_icons2 + _easycom_comment_list2 + _easycom_comment_input2)();
}
const _easycom_view_logs = () => "../../components/view-logs/view-logs.js";
const _easycom_report_button = () => "../../components/report-button/report-button.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_comment_list = () => "../../components/comment-list/comment-list.js";
const _easycom_comment_input = () => "../../components/comment-input/comment-input.js";
if (!Math) {
  (_easycom_view_logs + _easycom_report_button + _easycom_uni_icons + _easycom_comment_list + _easycom_comment_input)();
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
    common_vendor.ref({});
    const hasLiked = common_vendor.ref(false);
    const props = __props;
    const handleReplyComment = ({ parent, target }) => {
      var _a;
      const item = target || parent;
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
      common_vendor.index.__f__("log", "at pages/treehole_detail/treehole_detail.vue:136", "reply_info", replyForItem.value);
      const requestData = {
        content: submitData.content,
        origin: submitData.origin,
        target_id: parseInt(pageId.value),
        type: 5,
        // 树洞类型
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
        // 临时ID
        content: submitData.content,
        created_at: Math.floor(Date.now() / 1e3),
        like_count: 0,
        reply_count: 0,
        is_liked: false,
        floor: 0,
        // 临时楼层数，后续用真实数据更新
        // 如果是匿名评论，使用匿名信息
        ...submitData.is_anonymous ? {
          avatar: "https://images1.fantuanpu.com/home/default_avatar.jpg",
          username: "匿名用户",
          is_anonymous: 1
        } : {
          avatar: common_config.global.userInfo.avatar,
          username: common_config.global.userInfo.nickname,
          is_anonymous: 0
        },
        // 关联信息
        ...submitData.association_id && {
          association_id: submitData.association_id,
          association_type: submitData.association_type
        },
        // 图片信息
        ...submitData.image_url && {
          image_url: submitData.image_url
        },
        // 回复信息
        ...replyForItem.value.id && {
          reply_id: replyForItem.value.id,
          reply_for: replyForItem.value.comment,
          reply_uid: replyForItem.value.user_id,
          parent_id: replyForItem.value.parent_id > 0 ? replyForItem.value.parent_id : replyForItem.value.id,
          // 处理被回复者的匿名状态
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
        url: common_config.websiteUrl + "/with-state/add-comment",
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
              // 如果是匿名评论，保持匿名信息
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
          common_vendor.index.__f__("log", "at pages/treehole_detail/treehole_detail.vue:343", res.data);
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
          common_vendor.index.__f__("log", "at pages/treehole_detail/treehole_detail.vue:361", err);
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
      common_vendor.index.__f__("log", "at pages/treehole_detail/treehole_detail.vue:427", "pageId", pageId.value);
      try {
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl}/treehole-detail?id=${props.id}`
        });
        if (res.data.status === "success") {
          detailData.value = res.data.data;
        }
      } catch (error) {
        common_vendor.index.__f__("log", "at pages/treehole_detail/treehole_detail.vue:438", error);
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
      }, detailData.value ? common_vendor.e({
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
        n: detailData.value.approve_time > 0
      }, detailData.value.approve_time > 0 ? {
        o: common_vendor.t(formatTime(detailData.value.approve_time))
      } : {}) : {}, {
        p: common_vendor.sr(commentListRef, "f102c4f6-4", {
          "k": "commentListRef"
        }),
        q: common_vendor.o(handleReplyComment),
        r: common_vendor.p({
          type: 5,
          ["relation-id"]: parseInt(props.id)
        }),
        s: common_vendor.sr(commentInputRef, "f102c4f6-5", {
          "k": "commentInputRef"
        }),
        t: common_vendor.o(handleCommentSubmit),
        v: common_vendor.o((val) => common_vendor.isRef(replyForItem) ? replyForItem.value = val : replyForItem = val),
        w: common_vendor.p({
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
