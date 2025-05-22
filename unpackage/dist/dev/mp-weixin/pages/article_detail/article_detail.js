"use strict";
const common_vendor = require("../../common/vendor.js");
const common_config = require("../../common/config.js");
if (!Array) {
  const _easycom_mp_html2 = common_vendor.resolveComponent("mp-html");
  const _easycom_comment_list2 = common_vendor.resolveComponent("comment-list");
  const _easycom_comment_input2 = common_vendor.resolveComponent("comment-input");
  (_easycom_mp_html2 + _easycom_comment_list2 + _easycom_comment_input2)();
}
const _easycom_mp_html = () => "../../uni_modules/mp-html/components/mp-html/mp-html.js";
const _easycom_comment_list = () => "../../components/comment-list/comment-list.js";
const _easycom_comment_input = () => "../../components/comment-input/comment-input.js";
if (!Math) {
  (_easycom_mp_html + _easycom_comment_list + _easycom_comment_input)();
}
const _sfc_main = {
  __name: "article_detail",
  setup(__props) {
    const article = common_vendor.ref({
      title: "",
      content: "",
      banner: "",
      created_at: 0
    });
    common_vendor.ref(1);
    common_vendor.ref(false);
    common_vendor.ref(false);
    common_vendor.ref(null);
    const commentListRef = common_vendor.ref(null);
    const commentInputRef = common_vendor.ref(null);
    const replyForItem = common_vendor.ref({});
    const handleCommentSubmit = async ({ content, replyInfo, origin }) => {
      var _a, _b;
      if (!await checkLogin(true))
        return;
      const requestData = {
        content,
        origin,
        target_id: parseInt(article.value.id),
        type: 7,
        ...replyInfo.id && {
          reply_id: replyInfo.id,
          reply_for: replyInfo.comment,
          reply_user_id: replyInfo.user_id,
          parent_id: replyInfo.parent_id > 0 ? replyInfo.parent_id : replyInfo.id
        }
      };
      try {
        const { data } = await common_vendor.index.request({
          url: `${common_config.websiteUrl}/with-state/add-comment`,
          method: "POST",
          header: { Authorization: common_vendor.index.getStorageSync("token") },
          data: requestData
        });
        if (data.status === "success") {
          if (data.data.parent_id === 0) {
            (_a = commentListRef.value) == null ? void 0 : _a.addNewComment(data.data);
          } else {
            (_b = commentListRef.value) == null ? void 0 : _b.addReplyComment(data.data);
          }
          common_vendor.index.showToast({ title: "评论成功" });
        }
      } catch (error) {
        common_vendor.index.showToast({ title: "评论失败", icon: "none" });
      }
    };
    const handleReplyComment = ({ parent, target }) => {
      var _a;
      const item = target || parent;
      replyForItem.value = item;
      (_a = commentInputRef.value) == null ? void 0 : _a.focusInput();
    };
    common_vendor.onLoad(async (options) => {
      if (!options.id)
        return common_vendor.index.navigateBack();
      common_config.asyncGetUserInfo();
      await fetchArticle(options.id);
    });
    const fetchArticle = async (id) => {
      try {
        const { data } = await common_vendor.index.request({
          url: `${common_config.websiteUrl}/article-detail?id=${id}`
        });
        if (data.status === "success") {
          article.value = data.data;
          common_vendor.index.setNavigationBarTitle({ title: data.data.title });
        }
      } catch (error) {
        common_vendor.index.showToast({ title: "加载失败", icon: "none" });
      }
    };
    const checkLogin = async (showToast = false) => {
      if (common_config.global.isLogin)
        return true;
      if (showToast) {
        common_vendor.index.showToast({ title: "请先登录", icon: "none" });
      }
      return false;
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: article.value.banner
      }, article.value.banner ? {
        b: article.value.banner
      } : {}, {
        c: common_vendor.t(article.value.title),
        d: common_vendor.p({
          content: article.value.content
        }),
        e: article.value.id > 0
      }, article.value.id > 0 ? {
        f: common_vendor.sr(commentListRef, "55f34774-1", {
          "k": "commentListRef"
        }),
        g: common_vendor.o(handleReplyComment),
        h: common_vendor.p({
          type: 7,
          ["relation-id"]: parseInt(article.value.id)
        }),
        i: common_vendor.sr(commentInputRef, "55f34774-2", {
          "k": "commentInputRef"
        }),
        j: common_vendor.o(handleCommentSubmit),
        k: common_vendor.o((val) => replyForItem.value = val),
        l: common_vendor.p({
          ["reply-info"]: replyForItem.value,
          ["target-id"]: article.value.id.toString()
        })
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-55f34774"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/article_detail/article_detail.js.map
