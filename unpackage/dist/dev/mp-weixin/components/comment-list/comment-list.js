"use strict";
const common_vendor = require("../../common/vendor.js");
const common_config = require("../../common/config.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
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
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl}/get-comments`,
          data: {
            relation_id: props.relationId,
            type: props.type,
            page: currentPage.value,
            page_size: 10
            // 添加分页大小
          }
        });
        if (res.data.status === "success") {
          const data = res.data.data;
          const newComments = data.comment_list.map((c) => ({
            ...c,
            showAll: false,
            localChildren: c.children || [],
            childTotal: c.childTotal || (c.children ? c.children.length : 0)
          }));
          if (currentPage.value === 1) {
            commentList.value = newComments;
          } else {
            commentList.value.push(...newComments);
          }
          common_vendor.index.__f__("log", "at components/comment-list/comment-list.vue:224", "total", data.total);
          hasMore.value = data.total > commentList.value.length;
          mainCommentsTotal.value = data.total;
          common_vendor.index.__f__("log", "at components/comment-list/comment-list.vue:228", "是否还有更多?", hasMore.value);
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
            h: common_vendor.t(formatTime(comment.created_at)),
            i: common_vendor.o(($event) => handleReply(comment), comment.id),
            j: comment.localChildren && comment.localChildren.length
          }, comment.localChildren && comment.localChildren.length ? common_vendor.e({
            k: common_vendor.f(visibleChildren(comment), (child, index, i1) => {
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
                i: common_vendor.t(formatTime(child.created_at)),
                j: common_vendor.o(($event) => handleReply(comment, child), child.id),
                k: child.id
              });
            }),
            l: shouldShowMore(comment)
          }, shouldShowMore(comment) ? {
            m: common_vendor.t(remainingCount(comment)),
            n: "779bedea-0-" + i0,
            o: common_vendor.p({
              type: "arrow-down",
              size: "18",
              color: "#007AFF"
            }),
            p: common_vendor.o(($event) => loadMore(comment), comment.id)
          } : {}) : {}, {
            q: comment.id
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
