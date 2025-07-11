"use strict";
const common_vendor = require("../../common/vendor.js");
const common_config = require("../../common/config.js");
const common_image = require("../../common/image.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_switch_search2 = common_vendor.resolveComponent("switch-search");
  const _easycom_bottom_popup2 = common_vendor.resolveComponent("bottom-popup");
  (_easycom_uni_icons2 + _easycom_switch_search2 + _easycom_bottom_popup2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_switch_search = () => "../switch-search/switch-search.js";
const _easycom_bottom_popup = () => "../bottom-popup/bottom-popup.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_switch_search + _easycom_bottom_popup)();
}
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
    const showPopup = common_vendor.ref(false);
    const props = __props;
    common_vendor.ref(null);
    const isFocused = common_vendor.ref(false);
    const emit = __emit;
    const commentText = common_vendor.ref("");
    const displayMask = common_vendor.ref(false);
    const clickedInside = common_vendor.ref(false);
    const showActionBar = common_vendor.ref(false);
    const isAnonymous = common_vendor.ref(false);
    const selectedAssociation = common_vendor.ref(null);
    const uploadedImageUrl = common_vendor.ref("");
    const keyboardHeight = common_vendor.ref(0);
    const systemInfo = common_vendor.index.getSystemInfoSync();
    const footerBottomHeight = common_vendor.computed(() => {
      var _a, _b;
      let safeBottomVar = ((_a = systemInfo.safeAreaInsets) == null ? void 0 : _a.bottom) || 10;
      common_vendor.index.__f__("log", "at components/comment-input/comment-input.vue:138", "底部安全距离1:", (_b = systemInfo.safeAreaInsets) == null ? void 0 : _b.bottom, "=>", safeBottomVar);
      let safeBottom = safeBottomVar + keyboardHeight.value;
      common_vendor.index.__f__("log", "at components/comment-input/comment-input.vue:141", "底部最终距离2:", safeBottom);
      return `${safeBottom}px`;
    });
    const keyboardHeightChangeHandler = (res) => {
      common_vendor.index.__f__("log", "at components/comment-input/comment-input.vue:146", "键盘高度变化", res);
      keyboardHeight.value = res.height;
    };
    const toggleAnonymous = (event) => {
      common_vendor.index.__f__("log", "at components/comment-input/comment-input.vue:151", "切换匿名状态", isAnonymous.value);
      isAnonymous.value = !isAnonymous.value;
      if (isAnonymous.value) {
        common_vendor.index.showToast({
          title: "进入匿名状态",
          icon: "none"
        });
      } else {
        common_vendor.index.showToast({
          title: "退出匿名状态",
          icon: "none"
        });
      }
    };
    const handleFocus = () => {
      displayMask.value = true;
      isFocused.value = true;
      showActionBar.value = true;
    };
    const handleBlur = () => {
      setTimeout(() => {
        if (!clickedInside.value) {
          if (!showActionBar.value) {
            displayMask.value = false;
          }
          isFocused.value = false;
        }
        clickedInside.value = false;
      }, 200);
    };
    async function selectImage() {
      common_vendor.index.chooseImage({
        count: 1,
        success: async (res) => {
          const tempFilePaths = res.tempFilePaths;
          for (const filePath of tempFilePaths) {
            try {
              const tokenData = await common_image.getQiniuToken();
              const uploadRes = await common_image.uploadImageToQiniu(filePath, tokenData.token, tokenData.path);
              common_vendor.index.__f__("log", "at components/comment-input/comment-input.vue:203", "res:", uploadRes);
              if (uploadRes.qiniuRes.statusCode === 200) {
                const imageUrl = common_config.image1Url + tokenData.path;
                uploadedImageUrl.value = imageUrl;
              } else {
                common_vendor.index.__f__("error", "at components/comment-input/comment-input.vue:208", "上传失败:", filePath);
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at components/comment-input/comment-input.vue:211", "上传错误:", error);
            }
          }
        }
      });
    }
    const handleMaskTap = () => {
      common_vendor.index.__f__("log", "at components/comment-input/comment-input.vue:221", "蒙版被点击");
      displayMask.value = false;
      isFocused.value = false;
      showActionBar.value = false;
      common_vendor.index.hideKeyboard();
    };
    function handleSearchSelect(event) {
      let edata = {};
      if (event.type === "goods") {
        common_vendor.index.__f__("log", "at components/comment-input/comment-input.vue:235", "选择了商品:", event.data);
        showPopup.value = false;
        edata.type = 1;
        edata.id = event.data.id;
        edata.name = event.data.name;
      } else if (event.type === "brand") {
        common_vendor.index.__f__("log", "at components/comment-input/comment-input.vue:243", "选择了品牌:", event.data);
        showPopup.value = false;
        edata.type = 2;
        edata.id = event.data.id;
        edata.name = event.data.name;
      }
      selectedAssociation.value = edata;
    }
    const handleSubmit = () => {
      if (!commentText.value.trim() && !uploadedImageUrl.value) {
        common_vendor.index.showToast({
          title: "请输入评论内容或上传图片",
          icon: "none"
        });
        return;
      }
      let scene = common_config.getScene();
      common_vendor.index.__f__("log", "at components/comment-input/comment-input.vue:267", "scene", scene);
      const submitData = {
        content: commentText.value,
        target_id: props.targetId,
        type: 4,
        replyInfo: props.replyInfo,
        origin: scene,
        // 添加图片和关联信息
        image_url: uploadedImageUrl.value || "",
        association_id: selectedAssociation.value ? selectedAssociation.value.id : 0,
        association_type: selectedAssociation.value ? selectedAssociation.value.type : 0,
        is_anonymous: isAnonymous.value ? 1 : 0
        // 1表示匿名，0表示正常
      };
      emit("submit", submitData);
      commentText.value = "";
      uploadedImageUrl.value = "";
      selectedAssociation.value = null;
      isAnonymous.value = false;
      emit("update:replyInfo", {});
      handleMaskTap();
    };
    const focusInput = () => {
      isFocused.value = true;
    };
    __expose({
      focusInput
    });
    common_vendor.onMounted(() => {
      common_vendor.index.__f__("log", "at components/comment-input/comment-input.vue:312", "注册键盘弹出事件");
      common_vendor.index.onKeyboardHeightChange(keyboardHeightChangeHandler);
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: displayMask.value,
        b: common_vendor.o(handleMaskTap),
        c: selectedAssociation.value
      }, selectedAssociation.value ? {
        d: common_vendor.p({
          type: "paperclip",
          size: "20",
          color: "#fff"
        }),
        e: common_vendor.t(selectedAssociation.value.name),
        f: common_vendor.o(($event) => selectedAssociation.value = null),
        g: common_vendor.p({
          type: "close",
          size: "20",
          color: "#fff"
        })
      } : {}, {
        h: uploadedImageUrl.value
      }, uploadedImageUrl.value ? {
        i: uploadedImageUrl.value,
        j: common_vendor.p({
          type: "close",
          size: "18",
          color: "#fff"
        }),
        k: common_vendor.o(($event) => uploadedImageUrl.value = "")
      } : {}, {
        l: isFocused.value,
        m: isFocused.value ? 1 : "",
        n: common_vendor.o(handleFocus),
        o: common_vendor.o(handleBlur),
        p: __props.replyInfo.username ? "回复@" + __props.replyInfo.username + " " : "写评论...",
        q: commentText.value,
        r: common_vendor.o(($event) => commentText.value = $event.detail.value),
        s: common_vendor.o(handleSubmit),
        t: isAnonymous.value
      }, isAnonymous.value ? {
        v: common_vendor.p({
          type: "eye-slash",
          size: "22",
          color: isAnonymous.value ? "#007aff" : ""
        })
      } : {
        w: common_vendor.p({
          type: "eye",
          size: "22",
          color: "#696a6c"
        })
      }, {
        x: common_vendor.o(toggleAnonymous),
        y: common_vendor.p({
          type: "plus",
          size: "22",
          color: "#696a6c"
        }),
        z: common_vendor.o(($event) => showPopup.value = true),
        A: common_vendor.p({
          type: "image",
          size: "22",
          color: "#696a6c"
        }),
        B: common_vendor.o(selectImage),
        C: showActionBar.value,
        D: showPopup.value
      }, showPopup.value ? {
        E: common_vendor.o(handleSearchSelect),
        F: common_vendor.p({
          ["target-id"]: props.targetId,
          ["reply-info"]: props.replyInfo,
          mode: "fill"
        })
      } : {}, {
        G: common_vendor.o(($event) => showPopup.value = false),
        H: common_vendor.p({
          show: showPopup.value
        }),
        I: footerBottomHeight.value
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-88f35a0c"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/comment-input/comment-input.js.map
