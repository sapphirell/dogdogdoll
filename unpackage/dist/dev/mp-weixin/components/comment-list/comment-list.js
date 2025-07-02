"use strict";
const common_vendor = require("../../common/vendor.js");
const common_config = require("../../common/config.js");
if (!Array) {
  const _easycom_attitude_widget2 = common_vendor.resolveComponent("attitude-widget");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_report_button2 = common_vendor.resolveComponent("report-button");
  (_easycom_attitude_widget2 + _easycom_uni_icons2 + _easycom_report_button2)();
}
const _easycom_attitude_widget = () => "../attitude-widget/attitude-widget.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_report_button = () => "../report-button/report-button.js";
if (!Math) {
  (_easycom_attitude_widget + _easycom_uni_icons + _easycom_report_button)();
}
const _sfc_main = {
  __name: "comment-list",
  props: {
    type: {
      type: Number,
      required: true
    },
    relationId: {
      type: Number,
      required: true
    }
  },
  emits: ["reply"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const props = __props;
    const commentList = common_vendor.ref([]);
    const currentPage = common_vendor.ref(1);
    const mainCommentsTotal = common_vendor.ref(0);
    const hasMore = common_vendor.ref(true);
    common_vendor.reactive({});
    const emit = __emit;
    const loading = common_vendor.ref(false);
    const handleAttitudeChange = (comment, {
      status,
      counts
    }) => {
      comment.attitudeStatus = status;
      comment.attitudeCounts = counts;
    };
    __expose({
      // 添加主评论
      addNewComment: (comment) => {
        commentList.value.unshift({
          ...comment,
          showAll: false,
          localChildren: [],
          childTotal: 0
        });
      },
      // 添加子评论
      addReplyComment: (reply) => {
        const parent = commentList.value.find((c) => c.id === reply.parent_id);
        if (parent) {
          if (!parent.localChildren) {
            parent.localChildren = [];
          }
          if (typeof parent.childTotal !== "number") {
            parent.childTotal = 0;
          }
          parent.localChildren.unshift(reply);
          parent.childTotal += 1;
          if (!parent.showAll && parent.childTotal <= 5) {
            parent.showAll = true;
          }
        }
      }
    });
    common_vendor.onMounted(() => {
      loadMainComments();
    });
    const visibleChildren = (comment) => {
      if (!comment.showAll && comment.localChildren.length > 5) {
        return comment.localChildren.slice(0, 5);
      }
      return comment.localChildren;
    };
    const loadMoreMainComments = async () => {
      if (loading.value || !hasMore.value) {
        return;
      }
      try {
        loading.value = true;
        currentPage.value += 1;
        await loadMainComments();
      } finally {
        loading.value = false;
      }
    };
    const handleLike = async (comment) => {
      if (!common_config.global.isLogin) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        return;
      }
      try {
        const token = common_vendor.index.getStorageSync("token");
        const url = `${common_config.websiteUrl}/with-state/${comment.user_like ? "unlike" : "add-like"}`;
        const res = await common_vendor.index.request({
          url,
          method: "POST",
          header: {
            Authorization: token
          },
          data: {
            id: comment.id,
            type: 6
            // 评论类型
          }
        });
        if (res.data.status === "success") {
          comment.user_like = !comment.user_like;
          if (comment.user_like) {
            comment.like_count = (comment.like_count || 0) + 1;
          } else {
            comment.like_count = Math.max(0, (comment.like_count || 0) - 1);
          }
          common_vendor.index.showToast({
            title: comment.user_like ? "点赞成功" : "已取消点赞",
            icon: "none"
          });
        } else {
          common_vendor.index.showToast({
            title: res.data.msg || "操作失败",
            icon: "none"
          });
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at components/comment-list/comment-list.vue:288", "点赞失败:", err);
        common_vendor.index.showToast({
          title: "操作失败",
          icon: "none"
        });
      }
    };
    const jump2user = (uid) => {
      common_vendor.index.navigateTo({
        url: "/pages/user_page/user_page?uid=" + uid
      });
    };
    const formatTime = (timestamp) => {
      const date = new Date(timestamp * 1e3);
      return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
    };
    const formatUsername = (name) => {
      return name.length > 12 ? name.slice(0, 12) + "..." : name;
    };
    const loadMainComments = async () => {
      try {
        loading.value = true;
        let token = common_vendor.index.getStorageSync("token");
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl}/get-comments`,
          data: {
            relation_id: props.relationId,
            type: props.type,
            page: currentPage.value,
            page_size: 10
            // 添加分页大小
          },
          header: {
            "Authorization": token
          }
        });
        if (res.data.status === "success") {
          const data = res.data.data;
          const newComments = data.comment_list.map((c) => ({
            ...c,
            showAll: false,
            localChildren: c.children || [],
            childTotal: c.childTotal || (c.children ? c.children.length : 0),
            // 新增表态相关字段
            attitudeStatus: c.user_attitude || 0,
            // 当前用户表态状态
            attitudeCounts: c.attitude_counts || {
              1: c.count_1 || 0,
              2: c.count_2 || 0,
              3: c.count_3 || 0,
              4: c.count_4 || 0,
              5: c.count_5 || 0
            }
          }));
          if (currentPage.value === 1) {
            commentList.value = newComments;
          } else {
            commentList.value.push(...newComments);
          }
          common_vendor.index.__f__("log", "at components/comment-list/comment-list.vue:353", "total", data.total);
          hasMore.value = data.total > commentList.value.length;
          mainCommentsTotal.value = data.total;
          common_vendor.index.__f__("log", "at components/comment-list/comment-list.vue:357", "是否还有更多?", hasMore.value);
        }
      } catch (err) {
        common_vendor.index.showToast({
          title: "加载失败",
          icon: "none"
        });
      } finally {
        loading.value = false;
      }
    };
    const handleReply = (parent, target = null) => {
      emit("reply", {
        parent,
        target,
        relationId: props.relationId
      });
    };
    const shouldShowMore = (comment) => {
      return comment.childTotal > 5 && !comment.showAll;
    };
    const remainingCount = (comment) => {
      return comment.childTotal - Math.min(comment.localChildren.length, 5);
    };
    const loadMore = async (comment) => {
      if (comment.localChildren.length < comment.childTotal) {
        const nextPage = Math.ceil(comment.localChildren.length / 5) + 1;
        try {
          const res = await common_vendor.index.request({
            url: `${common_config.websiteUrl}/get-comments-by-parent-id`,
            data: {
              parent_id: comment.id,
              page: nextPage
            }
          });
          if (res.data.status === "success") {
            comment.localChildren = [
              ...comment.localChildren,
              ...res.data.data.comment_list
            ];
            comment.childTotal = res.data.data.total;
            if (comment.localChildren.length >= 5 && !comment.showAll) {
              comment.showAll = true;
            }
          }
        } catch (err) {
          common_vendor.index.showToast({
            title: "加载失败",
            icon: "none"
          });
        }
      } else {
        comment.showAll = !comment.showAll;
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: commentList.value.length > 0
      }, commentList.value.length > 0 ? {
        b: common_vendor.t(mainCommentsTotal.value)
      } : {}, {
        c: common_vendor.f(commentList.value, (comment, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.o(($event) => jump2user(comment.uid), comment.id),
            b: comment.avatar,
            c: common_vendor.t(formatUsername(comment.username)),
            d: common_vendor.o(($event) => jump2user(comment.uid), comment.id),
            e: common_vendor.t(comment.floor),
            f: common_vendor.t(comment.comment),
            g: common_vendor.o(($event) => handleReply(comment), comment.id),
            h: common_vendor.o(($event) => handleAttitudeChange(comment, $event), comment.id),
            i: "779bedea-0-" + i0,
            j: common_vendor.p({
              ["target-id"]: comment.id,
              type: 6,
              ["attitude-status"]: comment.attitudeStatus,
              ["attitude-counts"]: comment.attitudeCounts
            }),
            k: common_vendor.t(formatTime(comment.created_at)),
            l: "779bedea-1-" + i0,
            m: common_vendor.p({
              type: comment.user_like ? "hand-up-filled" : "hand-up",
              size: "18",
              color: comment.user_like ? "rgb(100 198 220)" : "#999"
            }),
            n: common_vendor.t(comment.like_count || 0),
            o: comment.user_like ? 1 : "",
            p: common_vendor.o(($event) => handleLike(comment), comment.id),
            q: common_vendor.o(($event) => handleReply(comment), comment.id),
            r: "779bedea-2-" + i0,
            s: common_vendor.p({
              ["report-type"]: 5,
              ["relation-id"]: comment.id,
              ["button-text"]: "",
              ["icon-type"]: "flag",
              ["icon-color"]: "#999",
              ["theme-color"]: "#64c6dc",
              ["icon-size"]: "20"
            }),
            t: comment.localChildren && comment.localChildren.length
          }, comment.localChildren && comment.localChildren.length ? common_vendor.e({
            v: common_vendor.f(visibleChildren(comment), (child, index, i1) => {
              return common_vendor.e({
                a: common_vendor.o(($event) => jump2user(child.uid), child.id),
                b: child.avatar,
                c: common_vendor.t(formatUsername(child.username)),
                d: common_vendor.o(($event) => jump2user(child.uid), child.id),
                e: child.reply_for
              }, child.reply_for ? {
                f: common_vendor.t(child.reply_for)
              } : {}, {
                g: common_vendor.t(child.comment),
                h: common_vendor.o(($event) => handleReply(comment), child.id),
                i: common_vendor.o(($event) => handleAttitudeChange(comment, $event), child.id),
                j: "779bedea-3-" + i0 + "-" + i1,
                k: common_vendor.p({
                  ["target-id"]: child.id,
                  type: 6,
                  ["attitude-status"]: comment.attitudeStatus,
                  ["attitude-counts"]: comment.attitudeCounts
                }),
                l: common_vendor.t(formatTime(child.created_at)),
                m: "779bedea-4-" + i0 + "-" + i1,
                n: common_vendor.p({
                  type: child.user_like ? "hand-up-filled" : "hand-up",
                  size: "18",
                  color: child.user_like ? "rgb(100 198 220)" : "#999"
                }),
                o: common_vendor.t(child.like_count || 0),
                p: child.user_like ? 1 : "",
                q: common_vendor.o(($event) => handleLike(child), child.id),
                r: common_vendor.o(($event) => handleReply(comment, child), child.id),
                s: "779bedea-5-" + i0 + "-" + i1,
                t: common_vendor.p({
                  ["report-type"]: 5,
                  ["relation-id"]: child.id,
                  ["button-text"]: "",
                  ["icon-type"]: "flag",
                  ["icon-color"]: "#999",
                  ["theme-color"]: "#64c6dc",
                  ["icon-size"]: "20"
                }),
                v: child.id
              });
            }),
            w: shouldShowMore(comment)
          }, shouldShowMore(comment) ? {
            x: common_vendor.t(remainingCount(comment)),
            y: "779bedea-6-" + i0,
            z: common_vendor.p({
              type: "arrow-down",
              size: "18",
              color: "#007AFF"
            }),
            A: common_vendor.o(($event) => loadMore(comment), comment.id)
          } : {}) : {}, {
            B: comment.id
          });
        }),
        d: commentList.value.length > 0
      }, commentList.value.length > 0 ? common_vendor.e({
        e: hasMore.value
      }, hasMore.value ? common_vendor.e({
        f: !loading.value
      }, !loading.value ? {
        g: common_vendor.p({
          type: "arrow-down",
          size: "18",
          color: "#007AFF"
        })
      } : {
        h: common_vendor.p({
          type: "spinner-cycle",
          size: "16",
          color: "#888"
        })
      }, {
        i: common_vendor.o(loadMoreMainComments),
        j: loading.value ? 1 : ""
      }) : {}) : {});
    };
  }
};
wx.createComponent(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/comment-list/comment-list.js.map
