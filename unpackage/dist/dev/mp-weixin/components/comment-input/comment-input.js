"use strict";
const common_vendor = require("../../common/vendor.js");
const common_config = require("../../common/config.js");
const _sfc_main = {
  __name: "comment-input",
  props: {
    replyInfo: {
      type: Object,
      default: () => ({})
    },
    targetId: {
      type: String,
      required: true
    },
    safeBottom: {
      type: Number,
      default: 10
    }
  },
  emits: ["submit", "update:replyInfo"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const props = __props;
    common_vendor.ref(null);
    const isFocused = common_vendor.ref(false);
    const emit = __emit;
    const commentText = common_vendor.ref("");
    const displayMask = common_vendor.ref(false);
    const keyboardHeight = common_vendor.ref(0);
    const systemInfo = common_vendor.index.getSystemInfoSync();
    const footerBottomHeight = common_vendor.computed(() => {
      var _a, _b;
      let safeBottomVar = ((_a = systemInfo.safeAreaInsets) == null ? void 0 : _a.bottom) || 10;
      common_vendor.index.__f__("log", "at components/comment-input/comment-input.vue:59", "底部安全距离1:", (_b = systemInfo.safeAreaInsets) == null ? void 0 : _b.bottom, "=>", safeBottomVar);
      const safeBottom = safeBottomVar + keyboardHeight.value;
      return `${safeBottom}px`;
    });
    const keyboardHeightChangeHandler = (res) => {
      common_vendor.index.__f__("log", "at components/comment-input/comment-input.vue:66", "键盘高度变化", res);
      keyboardHeight.value = res.height;
    };
    const handleFocus = () => {
      displayMask.value = true;
      isFocused.value = true;
    };
    const handleBlur = () => {
      displayMask.value = false;
      isFocused.value = false;
    };
    const handleMaskTap = () => {
      displayMask.value = false;
      isFocused.value = false;
      common_vendor.index.hideKeyboard();
    };
    const handleSubmit = () => {
      if (!commentText.value.trim()) {
        common_vendor.index.showToast({
          title: "请输入评论内容",
          icon: "none"
        });
        return;
      }
      let scene = common_config.getScene();
      common_vendor.index.__f__("log", "at components/comment-input/comment-input.vue:95", "scene", scene);
      emit("submit", {
        content: commentText.value,
        target_id: props.targetId,
        type: 4,
        replyInfo: props.replyInfo,
        origin: scene
      });
      commentText.value = "";
      emit("update:replyInfo", {});
    };
    const focusInput = () => {
      isFocused.value = true;
    };
    __expose({
      focusInput
    });
    common_vendor.onShow(() => {
      common_vendor.index.__f__("log", "at components/comment-input/comment-input.vue:123", "注册键盘弹出事件");
      common_vendor.index.onKeyboardHeightChange(keyboardHeightChangeHandler);
    });
    return (_ctx, _cache) => {
      return {
        a: displayMask.value,
        b: common_vendor.o(handleMaskTap),
        c: isFocused.value,
        d: isFocused.value ? 1 : "",
        e: common_vendor.o(handleFocus),
        f: common_vendor.o(handleBlur),
        g: __props.replyInfo.username ? "回复@" + __props.replyInfo.username + " " : "写评论...",
        h: commentText.value,
        i: common_vendor.o(($event) => commentText.value = $event.detail.value),
        j: common_vendor.o(handleSubmit),
        k: footerBottomHeight.value
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-88f35a0c"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/comment-input/comment-input.js.map
