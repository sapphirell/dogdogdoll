if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global = uni.requireGlobal();
  ArrayBuffer = global.ArrayBuffer;
  Int8Array = global.Int8Array;
  Uint8Array = global.Uint8Array;
  Uint8ClampedArray = global.Uint8ClampedArray;
  Int16Array = global.Int16Array;
  Uint16Array = global.Uint16Array;
  Int32Array = global.Int32Array;
  Uint32Array = global.Uint32Array;
  Float32Array = global.Float32Array;
  Float64Array = global.Float64Array;
  BigInt64Array = global.BigInt64Array;
  BigUint64Array = global.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  const ON_SHOW = "onShow";
  const ON_HIDE = "onHide";
  const ON_LOAD = "onLoad";
  const ON_REACH_BOTTOM = "onReachBottom";
  const ON_PULL_DOWN_REFRESH = "onPullDownRefresh";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  function resolveEasycom(component, easycom) {
    return typeof component === "string" ? easycom : component;
  }
  const createHook = (lifecycle) => (hook, target = vue.getCurrentInstance()) => {
    !vue.isInSSRComponentSetup && vue.injectHook(lifecycle, hook, target);
  };
  const onShow = /* @__PURE__ */ createHook(ON_SHOW);
  const onHide = /* @__PURE__ */ createHook(ON_HIDE);
  const onLoad = /* @__PURE__ */ createHook(ON_LOAD);
  const onReachBottom = /* @__PURE__ */ createHook(ON_REACH_BOTTOM);
  const onPullDownRefresh = /* @__PURE__ */ createHook(ON_PULL_DOWN_REFRESH);
  const websiteUrl = "http://localhost:8080";
  const image1Url = "https://images1.fantuanpu.com/";
  let global = vue.reactive({
    isLogin: false,
    userInfo: {}
  });
  function wechatSignLogin() {
    {
      uni.showToast({
        title: "请在微信小程序中登录",
        icon: "none"
      });
      return;
    }
  }
  function getUserInfo() {
    const token = uni.getStorageSync("token");
    formatAppLog("log", "at common/config.js:81", "token:", token);
    if (!token) {
      formatAppLog("log", "at common/config.js:83", "没有token，无法获取用户信息");
      clearUserInfo();
      return;
    }
    formatAppLog("log", "at common/config.js:87", "请求接口");
    uni.request({
      url: `${websiteUrl}/with-state/mine`,
      method: "GET",
      header: {
        Authorization: token
      },
      success: (res) => {
        const data = res.data.data;
        if (data) {
          formatAppLog("log", "at common/config.js:97", "获取用户信息成功,进行存储", data);
          saveUserInfo(data);
        } else {
          formatAppLog("log", "at common/config.js:100", "无法获取，清理用户状态");
          clearUserInfo();
        }
      },
      fail: (err) => {
        handleRequestError(err, "获取用户信息失败");
      }
    });
  }
  function asyncGetUserInfo() {
    return new Promise((resolve, reject) => {
      const token = uni.getStorageSync("token");
      if (!token) {
        clearUserInfo();
        resolve(null);
        return;
      }
      uni.request({
        url: `${websiteUrl}/with-state/mine`,
        method: "GET",
        header: {
          Authorization: token
        },
        success: (res) => {
          const data = res.data.data;
          if (data) {
            formatAppLog("log", "at common/config.js:131", "返回：", data);
            saveUserInfo(data);
            resolve(data);
          } else {
            clearUserInfo();
            resolve(null);
          }
        },
        fail: (err) => {
          handleRequestError(err, "获取用户信息失败");
          resolve(null);
        }
      });
    });
  }
  async function voteScore(type, score, targetId) {
    let token = uni.getStorageSync("token");
    if (!token) {
      uni.showToast({
        title: "请先登录",
        icon: "none"
      });
      return 0;
    }
    uni.request({
      url: websiteUrl + "/with-state/add-vote-score",
      method: "POST",
      header: {
        "Authorization": token
      },
      data: {
        target_id: parseInt(targetId),
        score: parseInt(score),
        type
      },
      success: (res) => {
        formatAppLog("log", "at common/config.js:170", res.data);
        if (res.data.status == "success") {
          uni.showToast({
            title: "评分成功",
            icon: "success"
          });
          activeModal.value = false;
          return 0;
        } else {
          uni.showToast({
            title: res.data.msg,
            icon: "none"
          });
          return 0;
        }
      },
      fail: (err) => {
        formatAppLog("log", "at common/config.js:188", err);
        uni.showToast({
          title: "网络请求失败",
          icon: "none"
        });
      }
    });
    return 0;
  }
  function getScene() {
    return 1;
  }
  function saveUserInfo(data) {
    uni.setStorageSync("userInfo", data);
    uni.setStorageSync("token", data.last_token);
    global.userInfo = data;
    global.isLogin = true;
  }
  function clearUserInfo() {
    uni.removeStorageSync("userInfo");
    global.userInfo = {};
    global.isLogin = false;
  }
  function handleRequestError(error, message = "请求失败") {
    formatAppLog("error", "at common/config.js:246", error);
    uni.showToast({
      title: message,
      icon: "none"
    });
  }
  const _imports_0$8 = "/static/search.png";
  const _imports_0$7 = "/static/cancel.png";
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$P = {
    __name: "goods-search",
    props: {
      modelValue: {
        type: String,
        default: ""
      },
      width: {
        type: String,
        default: "100%"
      },
      background: {
        type: String,
        default: ""
      },
      fontSize: {
        type: String,
        default: ""
      },
      tagColor: {
        type: String,
        default: "#666"
        // 新增标签颜色控制
      },
      mode: {
        type: String,
        default: "jump",
        validator: (value) => ["jump", "fill"].includes(value)
      },
      hiddenIcon: {
        type: Boolean,
        default: true
      }
    },
    emits: ["select", "update:modelValue"],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const showResults = vue.ref(false);
      const props = __props;
      const emit = __emit;
      const results = vue.ref([]);
      const inputValue = vue.computed({
        get: () => props.modelValue,
        set: (val) => emit("update:modelValue", val)
      });
      vue.watch(results, (newVal) => {
        showResults.value = newVal.length > 0;
      });
      const closeResults = () => {
        results.value = [];
        showResults.value = false;
      };
      const onSearchInput = async (e) => {
        var _a;
        inputValue.value = e.detail.value;
        const searchValue = e.detail.value.trim();
        showResults.value = true;
        if (!searchValue) {
          results.value = [];
          return;
        }
        try {
          const res = await uni.request({
            url: websiteUrl + `/search-goods?search=${encodeURIComponent(searchValue)}`,
            method: "GET"
          });
          results.value = ((_a = res.data) == null ? void 0 : _a.status) === "success" ? res.data.data || [] : [];
        } catch (error) {
          formatAppLog("error", "at components/goods-search/goods-search.vue:114", "搜索失败:", error);
          results.value = [];
        }
      };
      const onTap = (goods2) => {
        if (props.mode === "jump") {
          uni.navigateTo({
            url: `/pages/goods/goods?goods_id=${goods2.id}`
          });
        }
        if (props.mode === "fill") {
          emit("select", goods2);
          inputValue.value = goods2.name;
          results.value = [];
        }
        closeResults();
      };
      const cancel = () => {
        closeResults();
      };
      const __returned__ = { showResults, props, emit, results, inputValue, closeResults, onSearchInput, onTap, cancel, ref: vue.ref, computed: vue.computed, watch: vue.watch, get websiteUrl() {
        return websiteUrl;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$O(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      vue.Fragment,
      null,
      [
        vue.createCommentVNode(" 新增遮罩层 "),
        $setup.showResults ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "mask-layer",
          onClick: $setup.closeResults
        })) : vue.createCommentVNode("v-if", true),
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["search_tab", _ctx.$attrs.class]),
            style: vue.normalizeStyle({ background: $props.background || "#fff" })
          },
          [
            !$props.hiddenIcon ? (vue.openBlock(), vue.createElementBlock("image", {
              key: 0,
              class: "icon_image",
              src: _imports_0$8
            })) : vue.createCommentVNode("v-if", true),
            vue.createElementVNode("input", {
              class: "common_search_input",
              placeholder: "请输入商品名称...",
              value: $setup.inputValue,
              onInput: $setup.onSearchInput,
              style: vue.normalizeStyle({ fontSize: $props.fontSize || "22rpx" })
            }, null, 44, ["value"]),
            $setup.results.length > 0 ? (vue.openBlock(), vue.createElementBlock("image", {
              key: 1,
              class: "icon_image",
              src: _imports_0$7,
              onClick: $setup.cancel
            })) : vue.createCommentVNode("v-if", true)
          ],
          6
          /* CLASS, STYLE */
        ),
        vue.createCommentVNode(" 商品搜索结果 "),
        $setup.results.length > 0 ? (vue.openBlock(), vue.createElementBlock(
          "scroll-view",
          {
            key: 1,
            class: "search_results",
            style: vue.normalizeStyle({ width: $props.width }),
            "scroll-y": ""
          },
          [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.results, (item) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: item.id,
                  class: "result_item",
                  onClick: ($event) => $setup.onTap(item)
                }, [
                  item.brand_name ? (vue.openBlock(), vue.createElementBlock(
                    "view",
                    {
                      key: 0,
                      class: "brand-tag"
                    },
                    vue.toDisplayString(item.brand_name),
                    1
                    /* TEXT */
                  )) : vue.createCommentVNode("v-if", true),
                  vue.createElementVNode(
                    "text",
                    { class: "goods-name" },
                    vue.toDisplayString(item.name),
                    1
                    /* TEXT */
                  )
                ], 8, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ],
          4
          /* STYLE */
        )) : vue.createCommentVNode("v-if", true)
      ],
      64
      /* STABLE_FRAGMENT */
    );
  }
  const __easycom_1$6 = /* @__PURE__ */ _export_sfc(_sfc_main$P, [["render", _sfc_render$O], ["__scopeId", "data-v-445b599f"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/components/goods-search/goods-search.vue"]]);
  const _sfc_main$O = {
    __name: "index-brand",
    props: ["brand", "key"],
    setup(__props, { expose: __expose }) {
      __expose();
      const props = __props;
      function jumpBrand() {
        uni.navigateTo({
          url: "/pages/brand/brand?brand_id=" + props.brand.id
        });
      }
      function jumpGoods(id) {
        uni.navigateTo({
          url: "/pages/goods/goods?goods_id=" + id
        });
      }
      const __returned__ = { props, jumpBrand, jumpGoods };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$N(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", {
      class: "brand-card",
      key: $props.key
    }, [
      vue.createCommentVNode(" 品牌信息卡片 "),
      vue.createElementVNode("view", {
        class: "brand-header",
        onClick: $setup.jumpBrand
      }, [
        vue.createElementVNode("image", {
          class: "brand-logo",
          src: $props.brand.logo_image,
          mode: "aspectFit"
        }, null, 8, ["src"]),
        vue.createElementVNode("view", { class: "brand-meta" }, [
          vue.createElementVNode("view", { class: "title-row" }, [
            vue.createElementVNode(
              "text",
              { class: "brand-title" },
              vue.toDisplayString($props.brand.brand_name),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "brand-tag" },
              vue.toDisplayString($props.brand.country_name) + "·" + vue.toDisplayString($props.brand.type),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "goods-count" },
              "收录" + vue.toDisplayString($props.brand.total_goods) + "款",
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode(
            "text",
            { class: "brand-desc" },
            vue.toDisplayString($props.brand.description),
            1
            /* TEXT */
          )
        ])
      ]),
      vue.createCommentVNode(" 横向滚动商品列表 "),
      vue.createElementVNode("scroll-view", {
        class: "goods-scroll",
        "scroll-x": "",
        "show-scrollbar": false
      }, [
        vue.createElementVNode("view", { class: "goods-list" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($props.brand.goods, (doll, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "goods-item",
                key: doll.id,
                onClick: ($event) => $setup.jumpGoods(doll.id)
              }, [
                vue.createElementVNode("image", {
                  class: "goods-image",
                  src: doll.goods_images[0],
                  mode: "aspectFill"
                }, null, 8, ["src"]),
                vue.createElementVNode(
                  "text",
                  { class: "goods-name" },
                  vue.toDisplayString(doll.name),
                  1
                  /* TEXT */
                )
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])
    ]);
  }
  const __easycom_1$5 = /* @__PURE__ */ _export_sfc(_sfc_main$O, [["render", _sfc_render$N], ["__scopeId", "data-v-aa9d9d58"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/components/index-brand/index-brand.vue"]]);
  const fontData = [
    {
      "font_class": "arrow-down",
      "unicode": ""
    },
    {
      "font_class": "arrow-left",
      "unicode": ""
    },
    {
      "font_class": "arrow-right",
      "unicode": ""
    },
    {
      "font_class": "arrow-up",
      "unicode": ""
    },
    {
      "font_class": "auth",
      "unicode": ""
    },
    {
      "font_class": "auth-filled",
      "unicode": ""
    },
    {
      "font_class": "back",
      "unicode": ""
    },
    {
      "font_class": "bars",
      "unicode": ""
    },
    {
      "font_class": "calendar",
      "unicode": ""
    },
    {
      "font_class": "calendar-filled",
      "unicode": ""
    },
    {
      "font_class": "camera",
      "unicode": ""
    },
    {
      "font_class": "camera-filled",
      "unicode": ""
    },
    {
      "font_class": "cart",
      "unicode": ""
    },
    {
      "font_class": "cart-filled",
      "unicode": ""
    },
    {
      "font_class": "chat",
      "unicode": ""
    },
    {
      "font_class": "chat-filled",
      "unicode": ""
    },
    {
      "font_class": "chatboxes",
      "unicode": ""
    },
    {
      "font_class": "chatboxes-filled",
      "unicode": ""
    },
    {
      "font_class": "chatbubble",
      "unicode": ""
    },
    {
      "font_class": "chatbubble-filled",
      "unicode": ""
    },
    {
      "font_class": "checkbox",
      "unicode": ""
    },
    {
      "font_class": "checkbox-filled",
      "unicode": ""
    },
    {
      "font_class": "checkmarkempty",
      "unicode": ""
    },
    {
      "font_class": "circle",
      "unicode": ""
    },
    {
      "font_class": "circle-filled",
      "unicode": ""
    },
    {
      "font_class": "clear",
      "unicode": ""
    },
    {
      "font_class": "close",
      "unicode": ""
    },
    {
      "font_class": "closeempty",
      "unicode": ""
    },
    {
      "font_class": "cloud-download",
      "unicode": ""
    },
    {
      "font_class": "cloud-download-filled",
      "unicode": ""
    },
    {
      "font_class": "cloud-upload",
      "unicode": ""
    },
    {
      "font_class": "cloud-upload-filled",
      "unicode": ""
    },
    {
      "font_class": "color",
      "unicode": ""
    },
    {
      "font_class": "color-filled",
      "unicode": ""
    },
    {
      "font_class": "compose",
      "unicode": ""
    },
    {
      "font_class": "contact",
      "unicode": ""
    },
    {
      "font_class": "contact-filled",
      "unicode": ""
    },
    {
      "font_class": "down",
      "unicode": ""
    },
    {
      "font_class": "bottom",
      "unicode": ""
    },
    {
      "font_class": "download",
      "unicode": ""
    },
    {
      "font_class": "download-filled",
      "unicode": ""
    },
    {
      "font_class": "email",
      "unicode": ""
    },
    {
      "font_class": "email-filled",
      "unicode": ""
    },
    {
      "font_class": "eye",
      "unicode": ""
    },
    {
      "font_class": "eye-filled",
      "unicode": ""
    },
    {
      "font_class": "eye-slash",
      "unicode": ""
    },
    {
      "font_class": "eye-slash-filled",
      "unicode": ""
    },
    {
      "font_class": "fire",
      "unicode": ""
    },
    {
      "font_class": "fire-filled",
      "unicode": ""
    },
    {
      "font_class": "flag",
      "unicode": ""
    },
    {
      "font_class": "flag-filled",
      "unicode": ""
    },
    {
      "font_class": "folder-add",
      "unicode": ""
    },
    {
      "font_class": "folder-add-filled",
      "unicode": ""
    },
    {
      "font_class": "font",
      "unicode": ""
    },
    {
      "font_class": "forward",
      "unicode": ""
    },
    {
      "font_class": "gear",
      "unicode": ""
    },
    {
      "font_class": "gear-filled",
      "unicode": ""
    },
    {
      "font_class": "gift",
      "unicode": ""
    },
    {
      "font_class": "gift-filled",
      "unicode": ""
    },
    {
      "font_class": "hand-down",
      "unicode": ""
    },
    {
      "font_class": "hand-down-filled",
      "unicode": ""
    },
    {
      "font_class": "hand-up",
      "unicode": ""
    },
    {
      "font_class": "hand-up-filled",
      "unicode": ""
    },
    {
      "font_class": "headphones",
      "unicode": ""
    },
    {
      "font_class": "heart",
      "unicode": ""
    },
    {
      "font_class": "heart-filled",
      "unicode": ""
    },
    {
      "font_class": "help",
      "unicode": ""
    },
    {
      "font_class": "help-filled",
      "unicode": ""
    },
    {
      "font_class": "home",
      "unicode": ""
    },
    {
      "font_class": "home-filled",
      "unicode": ""
    },
    {
      "font_class": "image",
      "unicode": ""
    },
    {
      "font_class": "image-filled",
      "unicode": ""
    },
    {
      "font_class": "images",
      "unicode": ""
    },
    {
      "font_class": "images-filled",
      "unicode": ""
    },
    {
      "font_class": "info",
      "unicode": ""
    },
    {
      "font_class": "info-filled",
      "unicode": ""
    },
    {
      "font_class": "left",
      "unicode": ""
    },
    {
      "font_class": "link",
      "unicode": ""
    },
    {
      "font_class": "list",
      "unicode": ""
    },
    {
      "font_class": "location",
      "unicode": ""
    },
    {
      "font_class": "location-filled",
      "unicode": ""
    },
    {
      "font_class": "locked",
      "unicode": ""
    },
    {
      "font_class": "locked-filled",
      "unicode": ""
    },
    {
      "font_class": "loop",
      "unicode": ""
    },
    {
      "font_class": "mail-open",
      "unicode": ""
    },
    {
      "font_class": "mail-open-filled",
      "unicode": ""
    },
    {
      "font_class": "map",
      "unicode": ""
    },
    {
      "font_class": "map-filled",
      "unicode": ""
    },
    {
      "font_class": "map-pin",
      "unicode": ""
    },
    {
      "font_class": "map-pin-ellipse",
      "unicode": ""
    },
    {
      "font_class": "medal",
      "unicode": ""
    },
    {
      "font_class": "medal-filled",
      "unicode": ""
    },
    {
      "font_class": "mic",
      "unicode": ""
    },
    {
      "font_class": "mic-filled",
      "unicode": ""
    },
    {
      "font_class": "micoff",
      "unicode": ""
    },
    {
      "font_class": "micoff-filled",
      "unicode": ""
    },
    {
      "font_class": "minus",
      "unicode": ""
    },
    {
      "font_class": "minus-filled",
      "unicode": ""
    },
    {
      "font_class": "more",
      "unicode": ""
    },
    {
      "font_class": "more-filled",
      "unicode": ""
    },
    {
      "font_class": "navigate",
      "unicode": ""
    },
    {
      "font_class": "navigate-filled",
      "unicode": ""
    },
    {
      "font_class": "notification",
      "unicode": ""
    },
    {
      "font_class": "notification-filled",
      "unicode": ""
    },
    {
      "font_class": "paperclip",
      "unicode": ""
    },
    {
      "font_class": "paperplane",
      "unicode": ""
    },
    {
      "font_class": "paperplane-filled",
      "unicode": ""
    },
    {
      "font_class": "person",
      "unicode": ""
    },
    {
      "font_class": "person-filled",
      "unicode": ""
    },
    {
      "font_class": "personadd",
      "unicode": ""
    },
    {
      "font_class": "personadd-filled",
      "unicode": ""
    },
    {
      "font_class": "personadd-filled-copy",
      "unicode": ""
    },
    {
      "font_class": "phone",
      "unicode": ""
    },
    {
      "font_class": "phone-filled",
      "unicode": ""
    },
    {
      "font_class": "plus",
      "unicode": ""
    },
    {
      "font_class": "plus-filled",
      "unicode": ""
    },
    {
      "font_class": "plusempty",
      "unicode": ""
    },
    {
      "font_class": "pulldown",
      "unicode": ""
    },
    {
      "font_class": "pyq",
      "unicode": ""
    },
    {
      "font_class": "qq",
      "unicode": ""
    },
    {
      "font_class": "redo",
      "unicode": ""
    },
    {
      "font_class": "redo-filled",
      "unicode": ""
    },
    {
      "font_class": "refresh",
      "unicode": ""
    },
    {
      "font_class": "refresh-filled",
      "unicode": ""
    },
    {
      "font_class": "refreshempty",
      "unicode": ""
    },
    {
      "font_class": "reload",
      "unicode": ""
    },
    {
      "font_class": "right",
      "unicode": ""
    },
    {
      "font_class": "scan",
      "unicode": ""
    },
    {
      "font_class": "search",
      "unicode": ""
    },
    {
      "font_class": "settings",
      "unicode": ""
    },
    {
      "font_class": "settings-filled",
      "unicode": ""
    },
    {
      "font_class": "shop",
      "unicode": ""
    },
    {
      "font_class": "shop-filled",
      "unicode": ""
    },
    {
      "font_class": "smallcircle",
      "unicode": ""
    },
    {
      "font_class": "smallcircle-filled",
      "unicode": ""
    },
    {
      "font_class": "sound",
      "unicode": ""
    },
    {
      "font_class": "sound-filled",
      "unicode": ""
    },
    {
      "font_class": "spinner-cycle",
      "unicode": ""
    },
    {
      "font_class": "staff",
      "unicode": ""
    },
    {
      "font_class": "staff-filled",
      "unicode": ""
    },
    {
      "font_class": "star",
      "unicode": ""
    },
    {
      "font_class": "star-filled",
      "unicode": ""
    },
    {
      "font_class": "starhalf",
      "unicode": ""
    },
    {
      "font_class": "trash",
      "unicode": ""
    },
    {
      "font_class": "trash-filled",
      "unicode": ""
    },
    {
      "font_class": "tune",
      "unicode": ""
    },
    {
      "font_class": "tune-filled",
      "unicode": ""
    },
    {
      "font_class": "undo",
      "unicode": ""
    },
    {
      "font_class": "undo-filled",
      "unicode": ""
    },
    {
      "font_class": "up",
      "unicode": ""
    },
    {
      "font_class": "top",
      "unicode": ""
    },
    {
      "font_class": "upload",
      "unicode": ""
    },
    {
      "font_class": "upload-filled",
      "unicode": ""
    },
    {
      "font_class": "videocam",
      "unicode": ""
    },
    {
      "font_class": "videocam-filled",
      "unicode": ""
    },
    {
      "font_class": "vip",
      "unicode": ""
    },
    {
      "font_class": "vip-filled",
      "unicode": ""
    },
    {
      "font_class": "wallet",
      "unicode": ""
    },
    {
      "font_class": "wallet-filled",
      "unicode": ""
    },
    {
      "font_class": "weibo",
      "unicode": ""
    },
    {
      "font_class": "weixin",
      "unicode": ""
    }
  ];
  const getVal = (val) => {
    const reg = /^[0-9]*$/g;
    return typeof val === "number" || reg.test(val) ? val + "px" : val;
  };
  const _sfc_main$N = {
    name: "UniIcons",
    emits: ["click"],
    props: {
      type: {
        type: String,
        default: ""
      },
      color: {
        type: String,
        default: "#333333"
      },
      size: {
        type: [Number, String],
        default: 16
      },
      customPrefix: {
        type: String,
        default: ""
      },
      fontFamily: {
        type: String,
        default: ""
      }
    },
    data() {
      return {
        icons: fontData
      };
    },
    computed: {
      unicode() {
        let code = this.icons.find((v) => v.font_class === this.type);
        if (code) {
          return code.unicode;
        }
        return "";
      },
      iconSize() {
        return getVal(this.size);
      },
      styleObj() {
        if (this.fontFamily !== "") {
          return `color: ${this.color}; font-size: ${this.iconSize}; font-family: ${this.fontFamily};`;
        }
        return `color: ${this.color}; font-size: ${this.iconSize};`;
      }
    },
    methods: {
      _onClick() {
        this.$emit("click");
      }
    }
  };
  function _sfc_render$M(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "text",
      {
        style: vue.normalizeStyle($options.styleObj),
        class: vue.normalizeClass(["uni-icons", ["uniui-" + $props.type, $props.customPrefix, $props.customPrefix ? $props.type : ""]]),
        onClick: _cache[0] || (_cache[0] = (...args) => $options._onClick && $options._onClick(...args))
      },
      [
        vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const __easycom_0$6 = /* @__PURE__ */ _export_sfc(_sfc_main$N, [["render", _sfc_render$M], ["__scopeId", "data-v-d31e1c47"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/uni_modules/uni-icons/components/uni-icons/uni-icons.vue"]]);
  const _sfc_main$M = {
    __name: "common-page",
    props: {
      head_color: {
        type: String,
        default: "#ffffff"
      }
    },
    emits: ["scroll"],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      vue.useCssVars((_ctx) => ({
        "957ceee2-headerHeight": headerHeight.value,
        "957ceee2-head_color": __props.head_color,
        "957ceee2-footerHeight": footerHeight.value
      }));
      const emit = __emit;
      const handleScroll = (e) => {
        emit("scroll", e.detail);
      };
      const systemInfo2 = uni.getSystemInfoSync();
      const navBarHeight = vue.computed(() => {
        return 0;
      });
      const props = __props;
      const headerHeight = vue.computed(() => {
        const statusBarHeight = systemInfo2.statusBarHeight || 0;
        return `${statusBarHeight}px`;
      });
      const footerHeight = vue.computed(() => {
        var _a;
        const safeBottom = ((_a = systemInfo2.safeAreaInsets) == null ? void 0 : _a.bottom) || 0;
        return `${safeBottom + 20}px`;
      });
      const __returned__ = { emit, handleScroll, systemInfo: systemInfo2, navBarHeight, props, headerHeight, footerHeight, ref: vue.ref, computed: vue.computed };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$L(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      vue.Fragment,
      null,
      [
        vue.createCommentVNode(" 页面容器 "),
        vue.createElementVNode("view", { class: "page-container" }, [
          vue.createCommentVNode(" 顶部安全区域占位 "),
          vue.createElementVNode("view", { class: "header-placeholder" }),
          vue.createCommentVNode(" 页面内容区域 "),
          vue.createElementVNode("view", { class: "content-container" }, [
            vue.createCommentVNode(" 这里放页面主要内容 "),
            vue.createElementVNode(
              "scroll-view",
              {
                class: "main-content",
                "scroll-y": "",
                onScroll: $setup.handleScroll
              },
              [
                vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
              ],
              32
              /* NEED_HYDRATION */
            )
          ]),
          vue.createCommentVNode(" 底部安全区域占位 "),
          vue.createElementVNode("view", { class: "footer-placeholder" })
        ])
      ],
      2112
      /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
    );
  }
  const __easycom_1$4 = /* @__PURE__ */ _export_sfc(_sfc_main$M, [["render", _sfc_render$L], ["__scopeId", "data-v-957ceee2"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/components/common-page/common-page.vue"]]);
  const _sfc_main$L = {
    name: "swiper-dynamic-bullets",
    props: {
      // 轮播图数据
      resdata: {
        type: Array
      },
      // 指示点的中心距离,相当于指示点之间的距离
      dot_distance: {
        type: [Number, String],
        default: 20
      },
      // 当前指示点索引
      currentIndex: {
        type: [Number, String],
        default: 0
      },
      // 指示点宽高
      dotWidth: {
        type: [Number, String],
        default: 10
      }
    },
    data() {
      return {};
    },
    computed: {
      translateX() {
        return -+this.currentIndex * +this.dot_distance - +this.dot_distance / 2;
      }
    }
  };
  function _sfc_render$K(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: "dot-wrapper-box",
        style: vue.normalizeStyle("transform:translateX(" + $options.translateX + "px);width:" + $props.dot_distance + "px;height:" + $props.dot_distance + "px;")
      },
      [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($props.resdata, (item, index) => {
            return vue.openBlock(), vue.createElementBlock("view", { class: "dot-wrapper" }, [
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["dot", index === $props.currentIndex - 2 ? "prew_2_dot" : index === $props.currentIndex - 1 ? "prew_1_dot" : index === $props.currentIndex ? "current-dot" : index === $props.currentIndex + 1 ? "next_1_dot" : index === $props.currentIndex + 2 ? "next_2_dot" : ""])
                },
                null,
                2
                /* CLASS */
              )
            ]);
          }),
          256
          /* UNKEYED_FRAGMENT */
        ))
      ],
      4
      /* STYLE */
    );
  }
  const sdp = /* @__PURE__ */ _export_sfc(_sfc_main$L, [["render", _sfc_render$K], ["__scopeId", "data-v-1fb386b0"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/components/swiper-dynamic-bullets/swiper-dynamic-bullets.vue"]]);
  const _imports_7 = "/static/main/2.png";
  const _imports_1$6 = "/static/default-banner.jpg";
  const _imports_2$4 = "/static/cat-1.png";
  const _imports_3$1 = "/static/cat-2.png";
  const _imports_4 = "/static/cat-3.png";
  const _imports_5$1 = "/static/cat-10.png";
  const _imports_6$1 = "/static/noname.png";
  const _sfc_main$K = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      let brandsList = vue.ref([]);
      let data = vue.ref({});
      const tabs = vue.ref([
        {
          label: "中国娃社",
          value: 1
        },
        {
          label: "个人作者",
          value: 2
        },
        {
          label: "外国娃社",
          value: 3
        }
      ]);
      const activeSearchType = vue.ref(1);
      var swiperIndex = vue.ref(0);
      const systemInfo2 = uni.getSystemInfoSync();
      var totalBrand = vue.ref(0);
      const page = vue.ref(1);
      const pageSize2 = vue.ref(10);
      const hasMore = vue.ref(true);
      const loading = vue.ref(false);
      let newsList = vue.ref([]);
      const newsPage = vue.ref(1);
      const newsPageSize = vue.ref(10);
      const newsHasMore = vue.ref(true);
      const newsLoading = vue.ref(false);
      let hotList = vue.ref([]);
      const hotPage = vue.ref(1);
      const hotPageSize = vue.ref(10);
      const hotHasMore = vue.ref(true);
      const hotLoading = vue.ref(false);
      let treeholeList = vue.ref([]);
      const treeholePage = vue.ref(1);
      const treeholePageSize = vue.ref(10);
      const treeholeHasMore = vue.ref(true);
      const treeholeLoading = vue.ref(false);
      const activeTab = vue.ref("news");
      const switchTab = (tab) => {
        activeTab.value = tab;
      };
      const onShareAppMessage = () => ({
        title: "BJD娃圈你想知道的这里都有~",
        path: "/pages/news/news",
        imageUrl: "/static/share",
        success(res) {
          formatAppLog("log", "at pages/index/index.vue:338", "分享成功", res);
        },
        fail(err) {
          formatAppLog("log", "at pages/index/index.vue:341", "分享失败", err);
        },
        mp: {
          wxpath: "/pages/index/index.html"
        }
      });
      onPullDownRefresh(async () => {
        try {
          await refreshData();
          uni.stopPullDownRefresh();
        } catch (error) {
          uni.stopPullDownRefresh();
          uni.showToast({
            title: "刷新失败",
            icon: "none"
          });
        }
      });
      const refreshData = async () => {
        const refreshActions = {
          "brands": () => {
            page.value = 1;
            brandsList.value = [];
            hasMore.value = true;
            getBrands(true);
          },
          "news": () => {
            newsPage.value = 1;
            newsList.value = [];
            newsHasMore.value = true;
            getNews(true);
          },
          "hot": () => {
            hotPage.value = 1;
            hotList.value = [];
            hotHasMore.value = true;
            getHotCollocations(true);
          },
          "second": () => {
            treeholePage.value = 1;
            treeholeList.value = [];
            treeholeHasMore.value = true;
            getTreeholeList(true);
          }
        };
        await refreshActions[activeTab.value]();
        getArticles();
      };
      function jump2collocationSquare() {
        uni.navigateTo({
          url: "/pages/collocation_square/collocation_square"
        });
      }
      const handleBannerClick = (item) => {
        uni.navigateTo({
          url: `/pages/article_detail/article_detail?id=${item.id}`
        });
      };
      function jump2saleNews(item) {
        uni.navigateTo({
          url: "/pages/sale_news/sale_news?id=" + item.id + "&brand_id=" + item.brand_id
        });
      }
      const getArticles = () => {
        uni.request({
          url: websiteUrl + "/articles",
          data: {
            page: 1,
            page_size: 10,
            status: 1
            // 只获取已发布文章
          },
          success: (res) => {
            if (res.data.status === "success") {
              data.value = res.data.data.list;
            }
          },
          fail: (err) => {
            formatAppLog("error", "at pages/index/index.vue:434", "获取Banner失败:", err);
            data.value = {};
          }
        });
      };
      function onChange(e) {
        this.swiperIndex.value = e.detail.current;
      }
      const handleTabClick = (value) => {
        if (activeSearchType.value === value) {
          activeSearchType.value = null;
        } else {
          activeSearchType.value = value;
        }
        page.value = 1;
        hasMore.value = true;
        brandsList.value = [];
        getBrands();
      };
      function jump2userWhenNotAnonymous(item) {
        if (item.is_anonymous == 1) {
          return;
        }
        uni.navigateTo({
          url: "/pages/user_page/user_page?uid=" + item.uid
        });
      }
      function copyUrl(item) {
        let url = "http://m.dogdogdoll.com/#/pages/treehole_detail/treehole_detail?id=" + item.id;
        uni.setClipboardData({
          data: url,
          success: function() {
            uni.showToast({
              title: "复制链接成功",
              icon: "none"
            });
          }
        });
      }
      const getNews = async (isRefresh = false) => {
        if (isRefresh)
          newsPage.value = 1;
        if (!newsHasMore.value || newsLoading.value)
          return;
        newsLoading.value = true;
        uni.showLoading();
        uni.request({
          url: websiteUrl + "/sale-news",
          data: {
            page: newsPage.value,
            pageSize: newsPageSize.value
          },
          success: (res) => {
            const newData = res.data.data.news_list;
            if (newData.length === 0) {
              newsHasMore.value = false;
              return;
            }
            newsList.value = [...newsList.value, ...newData];
            newsHasMore.value = res.data.data.news_list.length === newsPageSize.value;
            newsPage.value++;
          },
          fail: (err) => {
            formatAppLog("log", "at pages/index/index.vue:503", err);
            uni.showToast({
              title: "加载失败",
              icon: "none"
            });
          },
          complete: () => {
            newsLoading.value = false;
            uni.hideLoading();
          }
        });
      };
      function jump2treeholeDetail(item) {
        uni.navigateTo({
          url: "/pages/treehole_detail/treehole_detail?id=" + item.id
        });
      }
      const getHotCollocations = async (isRefresh = false) => {
        if (isRefresh)
          hotPage.value = 1;
        if (!hotHasMore.value || hotLoading.value)
          return;
        hotLoading.value = true;
        uni.showLoading();
        uni.request({
          url: websiteUrl + "/hot-collocation",
          data: {
            page: hotPage.value,
            pageSize: hotPageSize.value
          },
          success: (res) => {
            const newData = res.data.data.collocation_relation_list;
            if (newData.length === 0) {
              hotHasMore.value = false;
              return;
            }
            hotList.value = [...hotList.value, ...newData.map((item) => ({
              ...item
            }))];
            hotHasMore.value = hotList.value.length < res.data.data.total;
            hotPage.value++;
          },
          fail: (err) => {
            formatAppLog("log", "at pages/index/index.vue:549", err);
            uni.showToast({
              title: "加载失败",
              icon: "none"
            });
          },
          complete: () => {
            hotLoading.value = false;
            uni.hideLoading();
          }
        });
      };
      function jumpToCollocationDetail(item) {
        uni.navigateTo({
          url: `/pages/collocation_share/collocation_share?collocation_id=${item.collocation_id}&origin=${item.origin}`
        });
      }
      const getBrands = async (isRefresh = false) => {
        if (isRefresh)
          page.value = 1;
        if (!hasMore.value || loading.value) {
          return;
        }
        loading.value = true;
        uni.showLoading();
        uni.request({
          url: websiteUrl + "/brands",
          data: {
            page: page.value,
            pageSize: pageSize2.value,
            ...activeSearchType.value && {
              searchType: activeSearchType.value
            }
          },
          success: (res) => {
            const newData = res.data.data.brands_list;
            if (newData.length === 0) {
              hasMore.value = false;
              return;
            }
            brandsList.value = [...brandsList.value, ...newData];
            hasMore.value = brandsList.value.length < res.data.data.total;
            page.value++;
          },
          fail: (err) => {
            formatAppLog("log", "at pages/index/index.vue:600", err);
            uni.showToast({
              title: "网络请求失败",
              icon: "none"
            });
          },
          complete: () => {
            loading.value = false;
            uni.hideLoading();
          }
        });
      };
      const getTreeholeList = async (isRefresh = false) => {
        if (isRefresh)
          treeholePage.value = 1;
        if (!treeholeHasMore.value || treeholeLoading.value)
          return;
        treeholeLoading.value = true;
        uni.showLoading();
        uni.request({
          url: websiteUrl + "/treehole-submissions",
          data: {
            page: treeholePage.value,
            pageSize: treeholePageSize.value
          },
          success: (res) => {
            const newData = res.data.data.submission_list.map((item) => ({
              ...item,
              images: item.images || []
            }));
            if (newData.length === 0) {
              treeholeHasMore.value = false;
              return;
            }
            treeholeList.value = [...treeholeList.value, ...newData];
            treeholeHasMore.value = treeholeList.value.length < res.data.data.total;
            treeholePage.value++;
          },
          fail: (err) => {
            uni.showToast({
              title: "加载失败",
              icon: "none"
            });
          },
          complete: () => {
            treeholeLoading.value = false;
            uni.hideLoading();
          }
        });
      };
      function handlePublish() {
        if (!global.isLogin) {
          uni.showModal({
            title: "提示",
            content: "需要登录后才能发布树洞",
            success: (res) => {
              if (res.confirm)
                uni.navigateTo({
                  url: "/pages/login/login"
                });
            }
          });
          return;
        }
        uni.navigateTo({
          url: "/pages/treehole_publish/treehole_publish"
        });
      }
      function previewImage(images, index) {
        uni.previewImage({
          current: index,
          urls: images
        });
      }
      function handleLike(item) {
        if (!global.isLogin) {
          uni.showToast({
            title: "请先登录",
            icon: "none"
          });
          return;
        }
        let token = uni.getStorageSync("token");
        if (!token) {
          uni.showToast({
            title: "请先登录",
            icon: "none"
          });
          return;
        }
        uni.request({
          url: websiteUrl + (item.has_liked ? "/with-state/unlike" : "/with-state/add-like"),
          method: "POST",
          header: {
            Authorization: token
          },
          data: {
            id: item.id,
            type: 5
          },
          // 5表示树洞类型
          success: (res) => {
            if (res.data.status === "success") {
              item.has_liked = !item.has_liked;
              item.like_count += item.has_liked ? 1 : -1;
            } else {
              uni.showD;
            }
          }
        });
      }
      const formatTime = (timestamp) => {
        const date = new Date(timestamp * 1e3);
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      };
      onLoad(() => {
        getUserInfo();
        getBrands();
        getNews();
        getHotCollocations();
        getTreeholeList();
        getArticles();
      });
      onReachBottom(() => {
        if (activeTab.value === "brands") {
          getBrands();
        } else if (activeTab.value === "news") {
          getNews();
        } else if (activeTab.value === "second") {
          getTreeholeList();
        }
      });
      const __returned__ = { get brandsList() {
        return brandsList;
      }, set brandsList(v) {
        brandsList = v;
      }, get data() {
        return data;
      }, set data(v) {
        data = v;
      }, tabs, activeSearchType, get swiperIndex() {
        return swiperIndex;
      }, set swiperIndex(v) {
        swiperIndex = v;
      }, systemInfo: systemInfo2, get totalBrand() {
        return totalBrand;
      }, set totalBrand(v) {
        totalBrand = v;
      }, page, pageSize: pageSize2, hasMore, loading, get newsList() {
        return newsList;
      }, set newsList(v) {
        newsList = v;
      }, newsPage, newsPageSize, newsHasMore, newsLoading, get hotList() {
        return hotList;
      }, set hotList(v) {
        hotList = v;
      }, hotPage, hotPageSize, hotHasMore, hotLoading, get treeholeList() {
        return treeholeList;
      }, set treeholeList(v) {
        treeholeList = v;
      }, treeholePage, treeholePageSize, treeholeHasMore, treeholeLoading, activeTab, switchTab, onShareAppMessage, refreshData, jump2collocationSquare, handleBannerClick, jump2saleNews, getArticles, onChange, handleTabClick, jump2userWhenNotAnonymous, copyUrl, getNews, jump2treeholeDetail, getHotCollocations, jumpToCollocationDetail, getBrands, getTreeholeList, handlePublish, previewImage, handleLike, formatTime, get onLoad() {
        return onLoad;
      }, get onReachBottom() {
        return onReachBottom;
      }, get onPullDownRefresh() {
        return onPullDownRefresh;
      }, ref: vue.ref, get websiteUrl() {
        return websiteUrl;
      }, get wechatSignLogin() {
        return wechatSignLogin;
      }, get getUserInfo() {
        return getUserInfo;
      }, get global() {
        return global;
      }, sdp };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$J(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_goods_search = resolveEasycom(vue.resolveDynamicComponent("goods-search"), __easycom_1$6);
    const _component_uni_transition = vue.resolveComponent("uni-transition");
    const _component_index_brand = resolveEasycom(vue.resolveDynamicComponent("index-brand"), __easycom_1$5);
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$6);
    const _component_common_page = resolveEasycom(vue.resolveDynamicComponent("common-page"), __easycom_1$4);
    return vue.openBlock(), vue.createElementBlock(
      vue.Fragment,
      null,
      [
        vue.createElementVNode("meta", {
          name: "theme-color",
          content: "#ffe6d7"
        }),
        vue.createVNode(_component_common_page, { head_color: "rgb(255 230 215) " }, {
          default: vue.withCtx(() => [
            vue.createElementVNode("view", { class: "body" }, [
              vue.createElementVNode("view", { class: "index_header" }, [
                vue.createElementVNode("view", null, [
                  vue.createElementVNode("image", {
                    src: _imports_7,
                    style: { "width": "100rpx", "height": "100rpx", "display": "inline-block", "vertical-align": "top" },
                    mode: "aspectFill"
                  }),
                  vue.createElementVNode("view", { style: { "display": "inline-block" } }, [
                    vue.createElementVNode("text", {
                      class: "font-alimamashuhei logo",
                      style: { "color": "#4cbbd0", "width": "250rpx", "padding-top": "10rpx", "vertical-align": "top", "position": "relative" }
                    }, "娃圈狗狗助手")
                  ])
                ]),
                vue.createElementVNode("view", null, [
                  vue.createCommentVNode(' <common-search width="680rpx"></common-search> '),
                  vue.createVNode(_component_goods_search, { width: "720rpx" }),
                  vue.createElementVNode("div", { style: { "clear": "both" } })
                ]),
                vue.createElementVNode("view", { style: { "position": "relative", "height": "250rpx" } }, [
                  vue.createCommentVNode(" 轮播图部分 "),
                  vue.createElementVNode("swiper", {
                    interval: 3e3,
                    duration: 200,
                    class: "banner_swiper",
                    "indicator-active-color": "#4cbbd0",
                    "indicator-color": "rgba(255,255,255,0.5)"
                  }, [
                    (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList($setup.data, (item) => {
                        return vue.openBlock(), vue.createElementBlock("swiper-item", {
                          key: item.id,
                          class: "banner_swiper_item"
                        }, [
                          vue.createCommentVNode(" <view>{{item}}</view> "),
                          vue.createElementVNode("view", { class: "swiper-item" }, [
                            vue.createElementVNode("image", {
                              src: item.banner,
                              mode: "aspectFill",
                              style: { "width": "100%", "height": "250rpx" },
                              onClick: ($event) => $setup.handleBannerClick(item)
                            }, null, 8, ["src", "onClick"])
                          ])
                        ]);
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    )),
                    vue.createCommentVNode(" 空状态 "),
                    $setup.data.length === 0 ? (vue.openBlock(), vue.createElementBlock("swiper-item", { key: 0 }, [
                      vue.createElementVNode("view", { class: "empty-banner" }, [
                        vue.createElementVNode("image", {
                          src: _imports_1$6,
                          mode: "aspectFill",
                          style: { "width": "100%", "height": "250rpx" }
                        })
                      ])
                    ])) : vue.createCommentVNode("v-if", true)
                  ])
                ]),
                vue.createElementVNode("view", { style: { "margin": "40rpx 0rpx" } }, [
                  vue.createCommentVNode(" 四个小方块按钮 "),
                  vue.createElementVNode("view", { class: "index_page_article" }, [
                    vue.createElementVNode(
                      "view",
                      {
                        class: vue.normalizeClass(["swich_box", { "active": $setup.activeTab === "news" }]),
                        onClick: _cache[0] || (_cache[0] = ($event) => $setup.switchTab("news"))
                      },
                      [
                        vue.createElementVNode("image", {
                          src: _imports_2$4,
                          mode: "aspectFill"
                        }),
                        vue.createElementVNode("text", null, "品牌图透")
                      ],
                      2
                      /* CLASS */
                    ),
                    vue.createElementVNode(
                      "view",
                      {
                        class: vue.normalizeClass(["swich_box", { "active": $setup.activeTab === "brands" }]),
                        onClick: _cache[1] || (_cache[1] = ($event) => $setup.switchTab("brands"))
                      },
                      [
                        vue.createElementVNode("image", {
                          src: _imports_3$1,
                          mode: "aspectFill"
                        }),
                        vue.createElementVNode("text", null, "品牌图鉴")
                      ],
                      2
                      /* CLASS */
                    ),
                    vue.createElementVNode(
                      "view",
                      {
                        class: vue.normalizeClass(["swich_box", { "active": $setup.activeTab === "hot" }]),
                        onClick: _cache[2] || (_cache[2] = ($event) => $setup.switchTab("hot"))
                      },
                      [
                        vue.createElementVNode("image", {
                          src: _imports_4,
                          mode: "aspectFill"
                        }),
                        vue.createElementVNode("text", null, "热门搭配")
                      ],
                      2
                      /* CLASS */
                    ),
                    vue.createElementVNode(
                      "view",
                      {
                        class: vue.normalizeClass(["swich_box", { "active": $setup.activeTab === "second" }]),
                        onClick: _cache[3] || (_cache[3] = ($event) => $setup.switchTab("second"))
                      },
                      [
                        vue.createElementVNode("image", {
                          src: _imports_5$1,
                          mode: "aspectFill"
                        }),
                        vue.createElementVNode("text", null, "树洞投稿")
                      ],
                      2
                      /* CLASS */
                    )
                  ])
                ])
              ]),
              vue.createElementVNode("view", { class: "body_container" }, [
                vue.createCommentVNode(' <transition name="fade" mode="out-in"> '),
                vue.createVNode(_component_uni_transition, {
                  "mode-class": ["fade"],
                  show: $setup.activeTab === "news"
                }, {
                  default: vue.withCtx(() => [
                    vue.createCommentVNode(" 品牌图透 "),
                    $setup.activeTab === "news" ? (vue.openBlock(), vue.createElementBlock("view", {
                      key: 0,
                      class: "body_list news-box"
                    }, [
                      (vue.openBlock(true), vue.createElementBlock(
                        vue.Fragment,
                        null,
                        vue.renderList($setup.newsList, (item) => {
                          return vue.openBlock(), vue.createElementBlock("view", {
                            key: item.id,
                            class: "news-item",
                            onClick: ($event) => $setup.jump2saleNews(item)
                          }, [
                            vue.createElementVNode("view", { class: "news-images" }, [
                              item.image_list.length > 0 ? (vue.openBlock(), vue.createElementBlock("swiper", {
                                key: 0,
                                class: "image-swiper",
                                autoplay: true,
                                circular: true
                              }, [
                                (vue.openBlock(true), vue.createElementBlock(
                                  vue.Fragment,
                                  null,
                                  vue.renderList(item.image_list, (img, idx) => {
                                    return vue.openBlock(), vue.createElementBlock("swiper-item", { key: idx }, [
                                      vue.createElementVNode("image", {
                                        src: img,
                                        mode: "aspectFill",
                                        class: "swiper-image"
                                      }, null, 8, ["src"])
                                    ]);
                                  }),
                                  128
                                  /* KEYED_FRAGMENT */
                                ))
                              ])) : vue.createCommentVNode("v-if", true)
                            ]),
                            vue.createElementVNode("view", { class: "news-content" }, [
                              vue.createElementVNode(
                                "text",
                                { class: "news-title" },
                                vue.toDisplayString(item.title),
                                1
                                /* TEXT */
                              ),
                              vue.createElementVNode(
                                "text",
                                { class: "news-desc" },
                                vue.toDisplayString(item.content),
                                1
                                /* TEXT */
                              ),
                              vue.createElementVNode("view", { class: "news-footer" }, [
                                vue.createElementVNode(
                                  "text",
                                  { class: "brand-tag" },
                                  vue.toDisplayString(item.brand_name),
                                  1
                                  /* TEXT */
                                ),
                                vue.createElementVNode(
                                  "text",
                                  { class: "news-time" },
                                  vue.toDisplayString($setup.formatTime(item.created_at)),
                                  1
                                  /* TEXT */
                                )
                              ])
                            ])
                          ], 8, ["onClick"]);
                        }),
                        128
                        /* KEYED_FRAGMENT */
                      )),
                      vue.createCommentVNode(" 加载状态 "),
                      vue.createElementVNode("view", { class: "loading-more" }, [
                        $setup.newsLoading ? (vue.openBlock(), vue.createElementBlock("text", { key: 0 }, "加载中...")) : vue.createCommentVNode("v-if", true),
                        !$setup.newsHasMore ? (vue.openBlock(), vue.createElementBlock("text", { key: 1 }, "没有更多了~")) : vue.createCommentVNode("v-if", true)
                      ])
                    ])) : vue.createCommentVNode("v-if", true),
                    vue.createCommentVNode(" </transition> ")
                  ]),
                  _: 1
                  /* STABLE */
                }, 8, ["show"]),
                vue.createCommentVNode(" 品牌图鉴 "),
                vue.createCommentVNode(' <transition name="fade" mode="out-in"> '),
                vue.createVNode(_component_uni_transition, {
                  "mode-class": ["fade"],
                  show: $setup.activeTab === "brands"
                }, {
                  default: vue.withCtx(() => [
                    $setup.activeTab === "brands" ? (vue.openBlock(), vue.createElementBlock("view", {
                      key: 0,
                      class: "body_list brand_box",
                      style: { "position": "relative" }
                    }, [
                      vue.createElementVNode("view", { class: "filter-tabs" }, [
                        (vue.openBlock(true), vue.createElementBlock(
                          vue.Fragment,
                          null,
                          vue.renderList($setup.tabs, (tab, index) => {
                            return vue.openBlock(), vue.createElementBlock("view", {
                              key: index,
                              class: vue.normalizeClass(["tab-item", { "active": $setup.activeSearchType === tab.value }]),
                              onClick: ($event) => $setup.handleTabClick(tab.value)
                            }, vue.toDisplayString(tab.label), 11, ["onClick"]);
                          }),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ]),
                      vue.createElementVNode("view", {
                        class: "brand_type_description",
                        style: { "display": "block", "width": "100%" }
                      }, [
                        $setup.activeSearchType == 1 ? (vue.openBlock(), vue.createElementBlock("text", { key: 0 }, "中国公司制作的BJD在打磨、分模线等工艺的处理上比较优秀，价格也比外社低很多。")) : vue.createCommentVNode("v-if", true),
                        $setup.activeSearchType == 2 ? (vue.openBlock(), vue.createElementBlock("text", { key: 1 }, "个人作者在贩售娃物前基本都是圈内玩家，在设计方面花的心思很多。")) : vue.createCommentVNode("v-if", true),
                        $setup.activeSearchType == 3 ? (vue.openBlock(), vue.createElementBlock("text", { key: 2 }, "国外娃社起步较早，风格设计也比较多样化。")) : vue.createCommentVNode("v-if", true)
                      ]),
                      (vue.openBlock(true), vue.createElementBlock(
                        vue.Fragment,
                        null,
                        vue.renderList($setup.brandsList, (item, index) => {
                          return vue.openBlock(), vue.createElementBlock("view", {
                            key: item.id
                          }, [
                            vue.createVNode(_component_index_brand, { brand: item }, null, 8, ["brand"])
                          ]);
                        }),
                        128
                        /* KEYED_FRAGMENT */
                      )),
                      vue.createCommentVNode(" 添加加载状态提示 "),
                      vue.createElementVNode("view", { class: "loading-more" }, [
                        $setup.loading ? (vue.openBlock(), vue.createElementBlock("text", { key: 0 }, "加载中...")) : vue.createCommentVNode("v-if", true),
                        !$setup.hasMore ? (vue.openBlock(), vue.createElementBlock("text", { key: 1 }, "没有更多数据了")) : vue.createCommentVNode("v-if", true)
                      ])
                    ])) : vue.createCommentVNode("v-if", true)
                  ]),
                  _: 1
                  /* STABLE */
                }, 8, ["show"]),
                vue.createCommentVNode(" </transition> "),
                vue.createCommentVNode(" 热门搭配 "),
                vue.createCommentVNode(' <transition name="fade" mode="out-in"> '),
                vue.createVNode(_component_uni_transition, {
                  "mode-class": ["fade"],
                  show: $setup.activeTab === "hot"
                }, {
                  default: vue.withCtx(() => [
                    $setup.activeTab === "hot" ? (vue.openBlock(), vue.createElementBlock("view", {
                      key: 0,
                      class: "body_list hot-box"
                    }, [
                      (vue.openBlock(true), vue.createElementBlock(
                        vue.Fragment,
                        null,
                        vue.renderList($setup.hotList, (item) => {
                          return vue.openBlock(), vue.createElementBlock("view", {
                            key: item.collocation_id,
                            class: "hot-item",
                            onClick: ($event) => $setup.jumpToCollocationDetail(item)
                          }, [
                            vue.createElementVNode("view", { class: "images-box" }, [
                              item.image_urls.length > 0 ? (vue.openBlock(), vue.createElementBlock("swiper", {
                                key: 0,
                                class: "image-swiper",
                                autoplay: true,
                                circular: true
                              }, [
                                (vue.openBlock(true), vue.createElementBlock(
                                  vue.Fragment,
                                  null,
                                  vue.renderList(item.image_urls, (img, idx) => {
                                    return vue.openBlock(), vue.createElementBlock("swiper-item", { key: idx }, [
                                      vue.createElementVNode("image", {
                                        src: img,
                                        mode: "aspectFill",
                                        class: "swiper-image"
                                      }, null, 8, ["src"])
                                    ]);
                                  }),
                                  128
                                  /* KEYED_FRAGMENT */
                                ))
                              ])) : vue.createCommentVNode("v-if", true)
                            ]),
                            vue.createElementVNode("view", { class: "content-box" }, [
                              vue.createElementVNode(
                                "text",
                                { class: "title" },
                                vue.toDisplayString(item.title),
                                1
                                /* TEXT */
                              ),
                              vue.createElementVNode(
                                "text",
                                { class: "desc" },
                                vue.toDisplayString(item.content),
                                1
                                /* TEXT */
                              ),
                              vue.createElementVNode("view", { class: "tags-box" }, [
                                (vue.openBlock(true), vue.createElementBlock(
                                  vue.Fragment,
                                  null,
                                  vue.renderList(item.relation_list, (tag, tIdx) => {
                                    return vue.openBlock(), vue.createElementBlock("view", {
                                      key: tIdx,
                                      class: "tag-item"
                                    }, [
                                      vue.createElementVNode(
                                        "text",
                                        { class: "tag-text" },
                                        vue.toDisplayString(tag.relation_goods_name),
                                        1
                                        /* TEXT */
                                      ),
                                      vue.createElementVNode(
                                        "text",
                                        { class: "brand-text" },
                                        vue.toDisplayString(tag.relation_brand_name),
                                        1
                                        /* TEXT */
                                      )
                                    ]);
                                  }),
                                  128
                                  /* KEYED_FRAGMENT */
                                ))
                              ]),
                              vue.createElementVNode("view", { class: "footer" }, [
                                vue.createElementVNode("view", { class: "user-info" }, [
                                  vue.createElementVNode("image", {
                                    src: item.avatar,
                                    class: "avatar",
                                    mode: "aspectFill"
                                  }, null, 8, ["src"]),
                                  vue.createElementVNode(
                                    "text",
                                    { class: "time" },
                                    " 发布" + vue.toDisplayString(item.origin == 1 ? "搭配" : "展示柜") + "于 " + vue.toDisplayString($setup.formatTime(item.created_at)),
                                    1
                                    /* TEXT */
                                  )
                                ]),
                                vue.createElementVNode("view", { class: "like-box" }, [
                                  vue.createVNode(_component_uni_icons, {
                                    type: "heart",
                                    size: "18",
                                    color: "#ff4d4f"
                                  }),
                                  vue.createElementVNode(
                                    "text",
                                    { class: "like-count" },
                                    vue.toDisplayString(item.like_count),
                                    1
                                    /* TEXT */
                                  )
                                ])
                              ])
                            ])
                          ], 8, ["onClick"]);
                        }),
                        128
                        /* KEYED_FRAGMENT */
                      )),
                      vue.createCommentVNode(" 加载状态 "),
                      vue.createElementVNode("view", { class: "loading-more" }, [
                        $setup.hotLoading ? (vue.openBlock(), vue.createElementBlock("text", { key: 0 }, "加载中...")) : vue.createCommentVNode("v-if", true),
                        !$setup.hotHasMore ? (vue.openBlock(), vue.createElementBlock("text", { key: 1 }, "没有更多了~")) : vue.createCommentVNode("v-if", true)
                      ])
                    ])) : vue.createCommentVNode("v-if", true),
                    vue.createCommentVNode(" </transition> ")
                  ]),
                  _: 1
                  /* STABLE */
                }, 8, ["show"]),
                vue.createCommentVNode(" 说给树洞 "),
                vue.createCommentVNode(' <transition name="fade" mode="out-in"> '),
                vue.createVNode(_component_uni_transition, {
                  "mode-class": ["fade"],
                  show: $setup.activeTab === "second"
                }, {
                  default: vue.withCtx(() => [
                    $setup.activeTab === "second" ? (vue.openBlock(), vue.createElementBlock("view", {
                      key: 0,
                      class: "body_list treehole-box"
                    }, [
                      vue.createCommentVNode(" 发布按钮 "),
                      vue.createElementVNode("view", {
                        class: "publish-btn",
                        onClick: $setup.handlePublish
                      }, [
                        vue.createVNode(_component_uni_icons, {
                          type: "plusempty",
                          size: "30",
                          color: "#fff"
                        })
                      ]),
                      vue.createCommentVNode(" 树洞列表 "),
                      (vue.openBlock(true), vue.createElementBlock(
                        vue.Fragment,
                        null,
                        vue.renderList($setup.treeholeList, (item) => {
                          return vue.openBlock(), vue.createElementBlock("view", {
                            key: item.id,
                            class: "treehole-item",
                            onClick: ($event) => $setup.jump2treeholeDetail(item)
                          }, [
                            vue.createCommentVNode(" 用户信息 "),
                            vue.createElementVNode("view", {
                              class: "user-info",
                              onClick: vue.withModifiers(($event) => $setup.jump2userWhenNotAnonymous(item), ["stop"])
                            }, [
                              item.avatar !== "" ? (vue.openBlock(), vue.createElementBlock("image", {
                                key: 0,
                                src: item.avatar,
                                class: "avatar",
                                mode: "aspectFill"
                              }, null, 8, ["src"])) : (vue.openBlock(), vue.createElementBlock("image", {
                                key: 1,
                                src: _imports_6$1,
                                class: "avatar",
                                mode: "scaleToFill"
                              })),
                              vue.createElementVNode(
                                "text",
                                { class: "username" },
                                vue.toDisplayString(item.is_anonymous ? "匿名用户" : item.author_name),
                                1
                                /* TEXT */
                              ),
                              vue.createElementVNode(
                                "text",
                                { class: "time" },
                                vue.toDisplayString($setup.formatTime(item.created_at)),
                                1
                                /* TEXT */
                              ),
                              vue.createElementVNode(
                                "text",
                                { class: "cid" },
                                "【" + vue.toDisplayString(item.id) + "】",
                                1
                                /* TEXT */
                              )
                            ], 8, ["onClick"]),
                            vue.createCommentVNode(" 内容 "),
                            vue.createElementVNode(
                              "text",
                              { class: "content" },
                              vue.toDisplayString(item.content),
                              1
                              /* TEXT */
                            ),
                            vue.createCommentVNode(" 图片 "),
                            item.images.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                              key: 0,
                              class: "image-grid"
                            }, [
                              vue.createElementVNode("swiper", {
                                class: "image-swiper",
                                autoplay: true,
                                circular: true,
                                "indicator-dots": ""
                              }, [
                                (vue.openBlock(true), vue.createElementBlock(
                                  vue.Fragment,
                                  null,
                                  vue.renderList(item.images, (img, idx) => {
                                    return vue.openBlock(), vue.createElementBlock("swiper-item", { key: idx }, [
                                      vue.createElementVNode("image", {
                                        src: img,
                                        mode: "aspectFill",
                                        class: "swiper-image",
                                        onClick: vue.withModifiers(($event) => $setup.previewImage(item.images, idx), ["stop"])
                                      }, null, 8, ["src", "onClick"])
                                    ]);
                                  }),
                                  128
                                  /* KEYED_FRAGMENT */
                                ))
                              ])
                            ])) : vue.createCommentVNode("v-if", true),
                            vue.createCommentVNode(" 操作栏 "),
                            vue.createElementVNode("view", { class: "action-bar" }, [
                              vue.createElementVNode("view", {
                                class: "action-item",
                                onClick: ($event) => $setup.handleLike(item)
                              }, [
                                vue.createVNode(_component_uni_icons, {
                                  type: item.has_liked ? "hand-up-filled" : "hand-up",
                                  size: "18",
                                  color: item.has_liked ? "#ff4d4f" : "#666"
                                }, null, 8, ["type", "color"]),
                                vue.createElementVNode(
                                  "text",
                                  { class: "count" },
                                  vue.toDisplayString(item.like_count || 0),
                                  1
                                  /* TEXT */
                                )
                              ], 8, ["onClick"]),
                              vue.createElementVNode("view", { class: "action-item" }, [
                                vue.createVNode(_component_uni_icons, {
                                  type: "chat",
                                  size: "18",
                                  color: "#666"
                                }),
                                vue.createElementVNode(
                                  "text",
                                  { class: "count" },
                                  vue.toDisplayString(item.comment_count || 0),
                                  1
                                  /* TEXT */
                                )
                              ]),
                              vue.createElementVNode("view", {
                                class: "action-item",
                                onClick: vue.withModifiers(($event) => $setup.copyUrl(item), ["stop"])
                              }, [
                                vue.createVNode(_component_uni_icons, {
                                  type: "redo",
                                  size: "18",
                                  color: "#666"
                                }),
                                vue.createElementVNode("text", { class: "count" }, "分享")
                              ], 8, ["onClick"])
                            ])
                          ], 8, ["onClick"]);
                        }),
                        128
                        /* KEYED_FRAGMENT */
                      )),
                      vue.createCommentVNode(" 加载状态 "),
                      vue.createElementVNode("view", { class: "loading-more" }, [
                        $setup.treeholeLoading ? (vue.openBlock(), vue.createElementBlock("text", { key: 0 }, "加载中...")) : vue.createCommentVNode("v-if", true),
                        !$setup.treeholeHasMore ? (vue.openBlock(), vue.createElementBlock("text", { key: 1 }, "没有更多了~")) : vue.createCommentVNode("v-if", true)
                      ])
                    ])) : vue.createCommentVNode("v-if", true)
                  ]),
                  _: 1
                  /* STABLE */
                }, 8, ["show"]),
                vue.createCommentVNode(" </transition> ")
              ])
            ])
          ]),
          _: 1
          /* STABLE */
        })
      ],
      64
      /* STABLE_FRAGMENT */
    );
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$K, [["render", _sfc_render$J], ["__scopeId", "data-v-1cf27b2a"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/index/index.vue"]]);
  const _sfc_main$J = /* @__PURE__ */ Object.assign({
    inheritAttrs: false
  }, {
    __name: "common-search",
    props: {
      mode: {
        type: String,
        default: "jump",
        // 默认跳转模式
        validator: (value) => ["jump", "fill"].includes(value)
        // 参数校验
      },
      width: {
        type: String,
        default: "100%"
      },
      background: {
        type: String,
        default: ""
      },
      fontSize: {
        type: String,
        default: ""
      }
    },
    emits: ["select"],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const props = __props;
      const emit = __emit;
      const searchTerm = vue.ref("");
      const results = vue.ref([]);
      const onSearchInput = async () => {
        if (searchTerm.value.trim() === "") {
          results.value = [];
          return;
        }
        emit("select", 0, searchTerm.value);
        try {
          const res = await uni.request({
            url: websiteUrl + `/search-brand?search=${searchTerm.value}`,
            method: "GET",
            header: {
              "Content-Type": "application/json"
            }
          });
          formatAppLog("log", "at components/common-search/common-search.vue:76", "请求结果:", res.data);
          if (res.data.status == "success") {
            if (res.data.data == null) {
              results.value = [];
              return;
            }
            results.value = res.data.data;
            return;
          } else {
            results.value = [];
            return;
          }
        } catch (error) {
          formatAppLog("error", "at components/common-search/common-search.vue:91", "请求错误:", error);
          results.value = [];
          return;
        }
      };
      const onTap = (brandId, brandName) => {
        if (props.mode === "jump") {
          uni.navigateTo({
            url: `/pages/brand/brand?brand_id=${brandId}`
          });
        } else if (props.mode === "fill") {
          searchTerm.value = brandName;
          results.value = [];
          emit("select", brandId, brandName);
        }
      };
      function cancel() {
        searchTerm.value = "";
        results.value = [];
      }
      const __returned__ = { props, emit, searchTerm, results, onSearchInput, onTap, cancel, ref: vue.ref, get websiteUrl() {
        return websiteUrl;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$I(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      vue.Fragment,
      null,
      [
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["search_tab", _ctx.$attrs.class]),
            style: vue.normalizeStyle({
              background: $props.background || "#fff"
            })
          },
          [
            $setup.props.mode == "jump" ? (vue.openBlock(), vue.createElementBlock("image", {
              key: 0,
              class: "icon_image",
              src: _imports_0$8
            })) : vue.createCommentVNode("v-if", true),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "common_search_input",
                placeholder: "请输入品牌 …",
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.searchTerm = $event),
                onInput: $setup.onSearchInput,
                ignoreCompositionEvent: false
              },
              null,
              544
              /* NEED_HYDRATION, NEED_PATCH */
            ), [
              [vue.vModelText, $setup.searchTerm]
            ]),
            $setup.results.length > 0 ? (vue.openBlock(), vue.createElementBlock("image", {
              key: 1,
              class: "icon_image",
              src: _imports_0$7,
              onClick: $setup.cancel
            })) : vue.createCommentVNode("v-if", true)
          ],
          6
          /* CLASS, STYLE */
        ),
        vue.createCommentVNode(" 显示搜索结果 "),
        $setup.results.length > 0 ? (vue.openBlock(), vue.createElementBlock(
          "scroll-view",
          {
            key: 0,
            class: "search_results",
            style: vue.normalizeStyle({ width: $props.width }),
            "scroll-y": ""
          },
          [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.results, (item) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: item.id,
                  class: "result_item",
                  onClick: ($event) => $setup.onTap(item.id, item.name)
                }, vue.toDisplayString(item.name), 9, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ],
          4
          /* STYLE */
        )) : vue.createCommentVNode("v-if", true)
      ],
      64
      /* STABLE_FRAGMENT */
    );
  }
  const __easycom_2$2 = /* @__PURE__ */ _export_sfc(_sfc_main$J, [["render", _sfc_render$I], ["__scopeId", "data-v-e5a069da"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/components/common-search/common-search.vue"]]);
  const _imports_0$6 = "/static/logo.png";
  const _imports_1$5 = "/static/message.png";
  const _imports_2$3 = "/static/like.png";
  const _sfc_main$I = {};
  function _sfc_render$H(_ctx, _cache) {
    return vue.openBlock(), vue.createElementBlock("view", null, [
      vue.createElementVNode("image", {
        class: "list_item_main_image",
        src: _imports_0$6
      }),
      vue.createElementVNode("view", { class: "list_item_main_info" }, [
        vue.createElementVNode("text", null, "Puypoodoll - momo"),
        vue.createElementVNode("text", null, "21分钟前"),
        vue.createElementVNode("view", { class: "list_view_and_like_box" }, [
          vue.createElementVNode("view", { class: "posion_bottom" }, [
            vue.createElementVNode("view", { class: "icon_inline_text" }, [
              vue.createElementVNode("image", {
                class: "icon_image",
                src: _imports_1$5
              }),
              vue.createElementVNode("text", null, "10")
            ]),
            vue.createElementVNode("view", { class: "icon_inline_text" }, [
              vue.createElementVNode("image", {
                class: "icon_image",
                src: _imports_2$3
              }),
              vue.createElementVNode("text", null, "20")
            ])
          ])
        ])
      ])
    ]);
  }
  const __easycom_1$3 = /* @__PURE__ */ _export_sfc(_sfc_main$I, [["render", _sfc_render$H], ["__scopeId", "data-v-704f716d"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/components/homepage-list-item/homepage-list-item.vue"]]);
  const _imports_0$5 = "/static/pixsun.png";
  const _imports_1$4 = "/static/arrow_down.png";
  const _sfc_main$H = {
    __name: "homepage",
    setup(__props, { expose: __expose }) {
      __expose();
      let selectSizeArray = ["所有尺寸", "一分", "二分", "三分", "四分", "六分", "八分", "十分", "十二分", "其它大尺寸", "棉花娃"];
      let index = vue.ref(0);
      let menuList = [
        { name: "上新推送" },
        { name: "BJD整娃" },
        { name: "单头" },
        { name: "假发" },
        { name: "娃衣" },
        { name: "眼珠" },
        { name: "鞋子" },
        { name: "支架" },
        { name: "其它配件" }
      ];
      function bindPickerChange(e) {
        formatAppLog("log", "at pages/homepage/homepage.vue:68", "picker发送选择改变，携带值为", e.detail.value);
        index.value = e.detail.value;
      }
      const systemInfo2 = uni.getSystemInfoSync();
      const statusBarHeight = vue.ref(systemInfo2.statusBarHeight);
      formatAppLog("log", "at pages/homepage/homepage.vue:74", "状态栏高度" + statusBarHeight.value);
      onReachBottom(() => {
        formatAppLog("log", "at pages/homepage/homepage.vue:77", "onEachBottom!");
      });
      function go2goods() {
        uni.navigateTo({
          url: "/pages/goods/goods"
        });
      }
      const onShareAppMessage = () => ({
        title: "BJD娃圈你想知道的这里都有~",
        path: "/pages/news/news",
        success(res) {
          formatAppLog("log", "at pages/homepage/homepage.vue:90", "分享成功", res);
        },
        fail(err) {
          formatAppLog("log", "at pages/homepage/homepage.vue:93", "分享失败", err);
        },
        mp: {
          wxpath: "/pages/index/index.html"
        }
      });
      const __returned__ = { get selectSizeArray() {
        return selectSizeArray;
      }, set selectSizeArray(v) {
        selectSizeArray = v;
      }, get index() {
        return index;
      }, set index(v) {
        index = v;
      }, get menuList() {
        return menuList;
      }, set menuList(v) {
        menuList = v;
      }, bindPickerChange, systemInfo: systemInfo2, statusBarHeight, go2goods, onShareAppMessage, ref: vue.ref, get onReachBottom() {
        return onReachBottom;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$G(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_common_search = resolveEasycom(vue.resolveDynamicComponent("common-search"), __easycom_2$2);
    const _component_homepage_list_item = resolveEasycom(vue.resolveDynamicComponent("homepage-list-item"), __easycom_1$3);
    return vue.openBlock(), vue.createElementBlock(
      vue.Fragment,
      null,
      [
        vue.createCommentVNode(" 页面主体 "),
        vue.createElementVNode("view", { class: "backbody" }, [
          vue.createCommentVNode(" 个人信息部分 "),
          vue.createElementVNode("view", { class: "pageinfo_userinfo" }, [
            vue.createElementVNode("image", {
              mode: "aspectFill",
              class: "avatar mine_avatar",
              src: _imports_0$5
            }),
            vue.createElementVNode("view", { class: "pageinfo_infobox" }, [
              vue.createElementVNode("text", { class: "mine_username font-alimamashuhei" }, "用户名"),
              vue.createElementVNode("view", null, [
                vue.createElementVNode("text", { class: "mine_friends" }, [
                  vue.createTextVNode("好友 "),
                  vue.createElementVNode("text", { class: "mine_info_number" }, "10")
                ]),
                vue.createElementVNode("text", { class: "mine_message" }, [
                  vue.createTextVNode("消息 "),
                  vue.createElementVNode("text", { class: "mine_info_number" }, "10")
                ])
              ])
            ])
          ]),
          vue.createCommentVNode(" 信息主体 "),
          vue.createElementVNode("view", { class: "pageinfo_body" }, [
            vue.createElementVNode("view", null, [
              vue.createElementVNode("view", null, [
                vue.createElementVNode("view", { class: "uni-list-cell-db pick_size font-alimamashuhei" }, [
                  vue.createElementVNode("picker", {
                    onChange: $setup.bindPickerChange,
                    value: $setup.index,
                    range: $setup.selectSizeArray
                  }, [
                    vue.createElementVNode("view", { class: "uni-input select_size" }, [
                      vue.createTextVNode(
                        vue.toDisplayString($setup.selectSizeArray[$setup.index]) + " ",
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode("image", {
                        class: "icon_image down",
                        src: _imports_1$4
                      })
                    ])
                  ], 40, ["value", "range"])
                ]),
                vue.createElementVNode("icon", { class: "" })
              ]),
              vue.createCommentVNode(" 左侧边栏 "),
              vue.createElementVNode("view", { class: "left_menu" }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.menuList, (item, key) => {
                    return vue.openBlock(), vue.createElementBlock("view", null, [
                      (vue.openBlock(), vue.createElementBlock(
                        "text",
                        {
                          class: "menu_text font-alimamashuhei",
                          key
                        },
                        vue.toDisplayString(item.name),
                        1
                        /* TEXT */
                      ))
                    ]);
                  }),
                  256
                  /* UNKEYED_FRAGMENT */
                ))
              ]),
              vue.createCommentVNode(" 右侧内容 "),
              vue.createElementVNode("view", { class: "right_body" }, [
                vue.createCommentVNode(" 搜索框 "),
                vue.createVNode(_component_common_search),
                vue.createCommentVNode(" 列表 "),
                vue.createElementVNode("view", null, [
                  vue.createVNode(_component_homepage_list_item, { onClick: $setup.go2goods })
                ])
              ])
            ])
          ])
        ]),
        vue.createCommentVNode(' <ddd-footer onSelect="ddd1111111"></ddd-footer> ')
      ],
      2112
      /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
    );
  }
  const PagesHomepageHomepage = /* @__PURE__ */ _export_sfc(_sfc_main$H, [["render", _sfc_render$G], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/homepage/homepage.vue"]]);
  const _sfc_main$G = {
    __name: "common-modal",
    props: {
      visible: Boolean,
      // 新增参数
      top: {
        type: [String, Number],
        default: "20%"
      },
      width: {
        type: [String, Number],
        default: "80%"
      },
      height: {
        type: [String, Number],
        default: "auto"
      }
    },
    emits: ["update:visible"],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const props = __props;
      const emit = __emit;
      const containerStyle = vue.computed(() => ({
        top: formatValue(props.top),
        width: formatValue(props.width),
        height: formatValue(props.height)
      }));
      const formatValue = (val) => {
        if (typeof val === "number") {
          return `${val}px`;
        }
        if (/\d$/.test(val)) {
          return `${val}px`;
        }
        return val;
      };
      const closeModal = () => {
        emit("update:visible", false);
      };
      const __returned__ = { props, emit, containerStyle, formatValue, closeModal, computed: vue.computed };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$F(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createBlock(vue.Transition, { name: "modal-fade" }, {
      default: vue.withCtx(() => [
        $props.visible ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "modal-mask",
          onClick: $setup.closeModal
        }, [
          vue.createElementVNode(
            "view",
            {
              class: "modal-container",
              style: vue.normalizeStyle($setup.containerStyle),
              onClick: _cache[0] || (_cache[0] = vue.withModifiers(() => {
              }, ["stop"]))
            },
            [
              vue.createElementVNode("view", { class: "modal-content" }, [
                vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
              ])
            ],
            4
            /* STYLE */
          )
        ])) : vue.createCommentVNode("v-if", true)
      ]),
      _: 3
      /* FORWARDED */
    });
  }
  const __easycom_2$1 = /* @__PURE__ */ _export_sfc(_sfc_main$G, [["render", _sfc_render$F], ["__scopeId", "data-v-d7656854"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/components/common-modal/common-modal.vue"]]);
  const _imports_0$4 = "/static/empty.png";
  const _imports_1$3 = "/static/eye.png";
  const _imports_2$2 = "/static/6.png";
  const _sfc_main$F = {
    __name: "stock",
    setup(__props, { expose: __expose }) {
      __expose();
      const systemInfo2 = uni.getSystemInfoSync();
      const statusBarHeight = vue.ref(systemInfo2.statusBarHeight);
      const activeTab = vue.ref(1);
      const previousTab = vue.ref(1);
      function transitionName() {
        return activeTab.value > previousTab.value ? "slide_left" : "slide_right";
      }
      function switch_tab(index) {
        previousTab.value = activeTab.value;
        activeTab.value = index;
        formatAppLog("log", "at pages/stock/stock.vue:205", `切换到 tab ${index}`);
        switch (index) {
          case 1:
            getAccountBookData();
            activeTab.value = 1;
            break;
          case 2:
            activeTab.value = 2;
            getShowcaseData();
            break;
          case 3:
            activeTab.value = 3;
            getBillData();
            break;
        }
      }
      function countPaid(bills) {
        return bills.filter((bill) => bill.status === 1).length;
      }
      const selectedType = vue.ref(0);
      const typeModalVisible = vue.ref(false);
      const newTypeName = vue.ref("");
      const customTypes = vue.ref([]);
      const defaultTypes = ["全部", "娃头", "娃衣", "素体", "眼珠", "假发", "娃鞋"];
      const typeOptions = vue.computed(() => [
        ...defaultTypes,
        ...customTypes.value.map((t) => t.name)
      ]);
      const showTypeModal = () => {
        typeModalVisible.value = true;
      };
      const getAccountTypes = async () => {
        const token = uni.getStorageSync("token");
        try {
          const res = await uni.request({
            url: websiteUrl + "/with-state/account-types",
            method: "GET",
            header: {
              "Authorization": token
            }
          });
          customTypes.value = res.data.data || [];
        } catch (err) {
          formatAppLog("error", "at pages/stock/stock.vue:259", "获取分类失败:", err);
        }
      };
      const addNewType = async () => {
        if (!newTypeName.value.trim()) {
          uni.showToast({
            title: "请输入分类名称",
            icon: "none"
          });
          return;
        }
        const token = uni.getStorageSync("token");
        try {
          await uni.request({
            url: websiteUrl + "/with-state/add-account-type",
            method: "POST",
            header: {
              "Authorization": token
            },
            data: {
              name: newTypeName.value.trim()
            }
          });
          await getAccountTypes();
          newTypeName.value = "";
          uni.showToast({
            title: "添加成功"
          });
        } catch (err) {
          uni.showToast({
            title: "添加失败",
            icon: "none"
          });
        }
      };
      const deleteType = async (id) => {
        uni.showModal({
          title: "确认删除",
          // content: '如果该分类下存在物品，则不可以直接删除分类',
          success: async (res) => {
            if (res.confirm) {
              const token = uni.getStorageSync("token");
              try {
                const response = await uni.request({
                  url: websiteUrl + "/with-state/delete-account-type",
                  method: "POST",
                  header: {
                    "Authorization": token,
                    "Content-Type": "application/json"
                    // 添加Content-Type
                  },
                  data: { id }
                  // 使用JSON格式传参
                });
                const resData = response.data;
                if (resData.status === "success") {
                  await getAccountTypes();
                  uni.showToast({ title: "删除成功" });
                } else {
                  uni.showToast({
                    title: resData.msg || "删除失败",
                    icon: "none"
                  });
                }
              } catch (err) {
                formatAppLog("error", "at pages/stock/stock.vue:330", "删除失败:", err);
                uni.showToast({
                  title: err.errMsg || "请求失败",
                  icon: "none"
                });
              }
            }
          }
        });
      };
      const accountBookData = vue.ref({});
      const showcaseData = vue.ref({});
      const billData = vue.ref({});
      const totalPrice = vue.computed(() => {
        if (!accountBookData.value.account_books)
          return 0;
        return accountBookData.value.account_books.reduce((sum, item) => {
          return sum + (parseFloat(item.price) || 0);
        }, 0).toFixed(2);
      });
      function updateSelectedType(e) {
        selectedType.value = e.detail.value;
        const selectedTypeName = typeOptions.value[selectedType.value];
        getAccountBookData(selectedTypeName === "全部" ? "" : selectedTypeName);
      }
      function getAccountBookData(type) {
        formatAppLog("log", "at pages/stock/stock.vue:368", global);
        if (!global.isLogin) {
          return;
        }
        let token = uni.getStorageSync("token");
        let url = websiteUrl + "/with-state/account-book";
        if (type && type !== "全部") {
          url = websiteUrl + "/with-state/account-book?type=" + type;
        }
        accountBookData.value = {};
        uni.request({
          url,
          method: "GET",
          header: {
            "Authorization": token
          },
          success: (res) => {
            formatAppLog("log", "at pages/stock/stock.vue:387", res.data.data);
            accountBookData.value = res.data.data;
          },
          fail: (err) => {
            formatAppLog("log", "at pages/stock/stock.vue:391", err);
          }
        });
      }
      function getShowcaseData() {
        formatAppLog("log", "at pages/stock/stock.vue:398", global);
        if (!global.isLogin) {
          return;
        }
        let token = uni.getStorageSync("token");
        showcaseData.value = {};
        uni.request({
          url: websiteUrl + "/with-state/showcase",
          method: "GET",
          header: {
            "Authorization": token
          },
          success: (res) => {
            formatAppLog("log", "at pages/stock/stock.vue:412", res.data.data);
            showcaseData.value = res.data.data;
          },
          fail: (err) => {
            formatAppLog("log", "at pages/stock/stock.vue:416", err);
          }
        });
      }
      function getBillData() {
        formatAppLog("log", "at pages/stock/stock.vue:423", global);
        if (!global.isLogin) {
          return;
        }
        let token = uni.getStorageSync("token");
        billData.value = {};
        uni.request({
          url: websiteUrl + "/with-state/tail-bill",
          method: "GET",
          header: {
            "Authorization": token
          },
          success: (res) => {
            formatAppLog("log", "at pages/stock/stock.vue:437", res.data.data);
            billData.value = res.data.data;
          },
          fail: (err) => {
            formatAppLog("log", "at pages/stock/stock.vue:441", err);
          }
        });
      }
      function go2addAccountBook() {
        uni.navigateTo({
          url: "/pages/stock/account_book_form/account_book_form"
        });
      }
      function go2editor(id) {
        uni.navigateTo({
          url: "/pages/stock/account_book_form/account_book_form?account_book_id=" + id
        });
      }
      function go2addShowCase() {
        uni.navigateTo({
          url: "/pages/stock/showcase_form/showcase_form"
        });
      }
      function go2editorShowCase(id) {
        uni.navigateTo({
          url: "/pages/stock/showcase_form/showcase_form?showcase_id=" + id
        });
      }
      function go2addBill(id) {
        if (id == false) {
          uni.navigateTo({
            url: "/pages/stock/bill_form/bill_form"
          });
          return;
        }
        uni.navigateTo({
          url: "/pages/stock/bill_form/bill_form?bill_id=" + id
        });
      }
      function getStatusClass(display) {
        const statusMap = {
          0: "reviewing",
          2: "rechecking",
          3: "violation"
        };
        return statusMap[display] || "";
      }
      function getStatusText(display) {
        const textMap = {
          0: "审核中",
          2: "人工复核中",
          3: "违规隐藏中"
        };
        return textMap[display] || "";
      }
      onShow(() => {
        asyncGetUserInfo().then((userInfo) => {
          getAccountTypes();
          getAccountBookData();
          getShowcaseData();
          getBillData();
        });
      });
      const __returned__ = { systemInfo: systemInfo2, statusBarHeight, activeTab, previousTab, transitionName, switch_tab, countPaid, selectedType, typeModalVisible, newTypeName, customTypes, defaultTypes, typeOptions, showTypeModal, getAccountTypes, addNewType, deleteType, accountBookData, showcaseData, billData, totalPrice, updateSelectedType, getAccountBookData, getShowcaseData, getBillData, go2addAccountBook, go2editor, go2addShowCase, go2editorShowCase, go2addBill, getStatusClass, getStatusText, ref: vue.ref, computed: vue.computed, get onShow() {
        return onShow;
      }, get websiteUrl() {
        return websiteUrl;
      }, get wechatSignLogin() {
        return wechatSignLogin;
      }, get getUserInfo() {
        return getUserInfo;
      }, get global() {
        return global;
      }, get asyncGetUserInfo() {
        return asyncGetUserInfo;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$E(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$6);
    const _component_common_modal = resolveEasycom(vue.resolveDynamicComponent("common-modal"), __easycom_2$1);
    const _component_common_page = resolveEasycom(vue.resolveDynamicComponent("common-page"), __easycom_1$4);
    return vue.openBlock(), vue.createElementBlock(
      vue.Fragment,
      null,
      [
        vue.createElementVNode("meta", {
          name: "theme-color",
          content: "rgb(185 195 253)"
        }),
        vue.createVNode(_component_common_page, { head_color: "rgb(185 195 253)" }, {
          default: vue.withCtx(() => [
            vue.createElementVNode("view", {
              class: "container",
              style: { "overflow": "hidden" }
            }, [
              vue.createElementVNode("view", { class: "head_container" }, [
                vue.createElementVNode("view", { class: "switch_tab" }, [
                  vue.createElementVNode(
                    "button",
                    {
                      onClick: _cache[0] || (_cache[0] = ($event) => $setup.switch_tab(1)),
                      class: vue.normalizeClass(["font-alimamashuhei", { "active": $setup.activeTab === 1 }])
                    },
                    [
                      vue.createElementVNode("text", null, "我的物品")
                    ],
                    2
                    /* CLASS */
                  ),
                  vue.createElementVNode(
                    "button",
                    {
                      onClick: _cache[1] || (_cache[1] = ($event) => $setup.switch_tab(2)),
                      class: vue.normalizeClass(["font-alimamashuhei", { "active": $setup.activeTab === 2 }])
                    },
                    [
                      vue.createElementVNode("text", null, "展示柜")
                    ],
                    2
                    /* CLASS */
                  ),
                  vue.createElementVNode(
                    "button",
                    {
                      onClick: _cache[2] || (_cache[2] = ($event) => $setup.switch_tab(3)),
                      class: vue.normalizeClass(["font-alimamashuhei", { "active": $setup.activeTab === 3 }])
                    },
                    [
                      vue.createElementVNode("text", null, "尾款日历")
                    ],
                    2
                    /* CLASS */
                  )
                ])
              ]),
              vue.createElementVNode("view", { class: "data_body" }, [
                vue.createVNode(vue.Transition, {
                  name: $setup.transitionName()
                }, {
                  default: vue.withCtx(() => {
                    var _a;
                    return [
                      $setup.activeTab === 1 ? (vue.openBlock(), vue.createElementBlock(
                        "view",
                        {
                          key: 0,
                          class: vue.normalizeClass(["tab_body_1st", { none: $setup.activeTab !== 1 }])
                        },
                        [
                          vue.createElementVNode("view", { class: "type-header" }, [
                            vue.createElementVNode("picker", {
                              class: "type-picker",
                              mode: "selector",
                              value: $setup.selectedType,
                              range: $setup.typeOptions,
                              onChange: $setup.updateSelectedType
                            }, [
                              vue.createElementVNode(
                                "view",
                                { class: "uni-input" },
                                vue.toDisplayString($setup.typeOptions[$setup.selectedType]),
                                1
                                /* TEXT */
                              )
                            ], 40, ["value", "range"]),
                            vue.createElementVNode("text", {
                              class: "manage-btn",
                              onClick: $setup.showTypeModal
                            }, "管理分类")
                          ]),
                          vue.createElementVNode("view", { class: "summary-container" }, [
                            vue.createElementVNode(
                              "text",
                              { class: "total-text" },
                              "当前分类合计：¥" + vue.toDisplayString($setup.totalPrice),
                              1
                              /* TEXT */
                            )
                          ]),
                          vue.createCommentVNode(" 新增分类管理弹窗 "),
                          vue.createVNode(_component_common_modal, {
                            visible: $setup.typeModalVisible,
                            "onUpdate:visible": _cache[4] || (_cache[4] = (val) => $setup.typeModalVisible = val),
                            top: "5%",
                            height: "60%"
                          }, {
                            default: vue.withCtx(() => [
                              vue.createElementVNode("view", { class: "type-modal" }, [
                                vue.createElementVNode("view", { class: "type-list" }, [
                                  (vue.openBlock(true), vue.createElementBlock(
                                    vue.Fragment,
                                    null,
                                    vue.renderList($setup.customTypes, (type, index) => {
                                      return vue.openBlock(), vue.createElementBlock("view", {
                                        key: type.id,
                                        class: "type-item"
                                      }, [
                                        vue.createElementVNode(
                                          "text",
                                          null,
                                          vue.toDisplayString(type.name),
                                          1
                                          /* TEXT */
                                        ),
                                        vue.createVNode(_component_uni_icons, {
                                          type: "trash",
                                          size: "22",
                                          color: "#ff6666",
                                          onClick: ($event) => $setup.deleteType(type.id)
                                        }, null, 8, ["onClick"])
                                      ]);
                                    }),
                                    128
                                    /* KEYED_FRAGMENT */
                                  ))
                                ]),
                                vue.createElementVNode("view", { class: "add-type-form" }, [
                                  vue.withDirectives(vue.createElementVNode(
                                    "input",
                                    {
                                      "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $setup.newTypeName = $event),
                                      placeholder: "输入新分类名称",
                                      class: "type-input"
                                    },
                                    null,
                                    512
                                    /* NEED_PATCH */
                                  ), [
                                    [vue.vModelText, $setup.newTypeName]
                                  ]),
                                  vue.createElementVNode("button", {
                                    class: "add-btn",
                                    onClick: $setup.addNewType
                                  }, "添加分类")
                                ])
                              ])
                            ]),
                            _: 1
                            /* STABLE */
                          }, 8, ["visible"]),
                          ((_a = $setup.accountBookData.account_books) == null ? void 0 : _a.length) > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                            key: 0,
                            class: "content"
                          }, [
                            vue.createElementVNode("view", { class: "content-grid" }, [
                              (vue.openBlock(true), vue.createElementBlock(
                                vue.Fragment,
                                null,
                                vue.renderList($setup.accountBookData.account_books, (item, index) => {
                                  return vue.openBlock(), vue.createElementBlock("view", {
                                    key: index,
                                    class: "grid-item",
                                    onClick: ($event) => $setup.go2editor(item.id)
                                  }, [
                                    vue.createElementVNode("image", {
                                      src: item.image_url,
                                      mode: "aspectFill",
                                      class: "item-image"
                                    }, null, 8, ["src"]),
                                    vue.createElementVNode(
                                      "text",
                                      { class: "item-type" },
                                      vue.toDisplayString(item.type),
                                      1
                                      /* TEXT */
                                    ),
                                    vue.createElementVNode("view", { class: "item-info" }, [
                                      vue.createElementVNode(
                                        "text",
                                        { class: "item-price" },
                                        vue.toDisplayString(item.price) + "￥",
                                        1
                                        /* TEXT */
                                      )
                                    ]),
                                    vue.createElementVNode("view", { class: "item-info" }, [
                                      vue.createElementVNode(
                                        "text",
                                        { class: "item-name one_line_text" },
                                        vue.toDisplayString(item.name),
                                        1
                                        /* TEXT */
                                      )
                                    ])
                                  ], 8, ["onClick"]);
                                }),
                                128
                                /* KEYED_FRAGMENT */
                              ))
                            ])
                          ])) : (vue.openBlock(), vue.createElementBlock("view", {
                            key: 1,
                            class: "empty-state"
                          }, [
                            vue.createElementVNode("image", {
                              class: "empty-icon",
                              src: _imports_0$4
                            }),
                            vue.createElementVNode("text", { class: "empty-text" }, "空空如也～"),
                            vue.createElementVNode("text", { class: "empty-tip" }, "点击下方按钮添加第一个物品吧！")
                          ])),
                          vue.createElementVNode("view", null, [
                            vue.createElementVNode("button", {
                              class: "jump2addButton",
                              onClick: $setup.go2addAccountBook
                            }, "+")
                          ])
                        ],
                        2
                        /* CLASS */
                      )) : vue.createCommentVNode("v-if", true)
                    ];
                  }),
                  _: 1
                  /* STABLE */
                }, 8, ["name"]),
                vue.createVNode(vue.Transition, {
                  name: $setup.transitionName()
                }, {
                  default: vue.withCtx(() => [
                    $setup.activeTab === 2 ? (vue.openBlock(), vue.createElementBlock(
                      "view",
                      {
                        key: 0,
                        class: vue.normalizeClass(["tab_body_sec", { none: $setup.activeTab !== 2 }])
                      },
                      [
                        vue.createCommentVNode(" 展示柜 "),
                        $setup.showcaseData.showcases && $setup.showcaseData.showcases.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                          key: 0,
                          class: "showcase-container"
                        }, [
                          (vue.openBlock(true), vue.createElementBlock(
                            vue.Fragment,
                            null,
                            vue.renderList($setup.showcaseData.showcases, (item, index) => {
                              return vue.openBlock(), vue.createElementBlock("view", {
                                key: index,
                                class: "showcase-card",
                                onClick: ($event) => $setup.go2editorShowCase(item.id)
                              }, [
                                item.display !== 1 ? (vue.openBlock(), vue.createElementBlock("view", {
                                  key: 0,
                                  class: "status-overlay"
                                }, [
                                  vue.createElementVNode(
                                    "text",
                                    { class: "status-text" },
                                    vue.toDisplayString($setup.getStatusText(item.display)),
                                    1
                                    /* TEXT */
                                  )
                                ])) : vue.createCommentVNode("v-if", true),
                                vue.createElementVNode(
                                  "view",
                                  {
                                    class: vue.normalizeClass(["card-content", { "blur-effect": item.display !== 1 }])
                                  },
                                  [
                                    vue.createElementVNode("image", {
                                      src: item.image_url_list[0],
                                      mode: "aspectFill",
                                      class: "showcase-image"
                                    }, null, 8, ["src"]),
                                    vue.createElementVNode("view", { class: "showcase-info" }, [
                                      vue.createElementVNode(
                                        "text",
                                        { class: "showcase-title one_line_text" },
                                        vue.toDisplayString(item.name),
                                        1
                                        /* TEXT */
                                      ),
                                      vue.createElementVNode(
                                        "text",
                                        { class: "showcase-description multi_line_text" },
                                        vue.toDisplayString(item.description),
                                        1
                                        /* TEXT */
                                      ),
                                      vue.createElementVNode("view", { class: "interaction-bar" }, [
                                        vue.createElementVNode("view", { class: "interaction-item" }, [
                                          vue.createElementVNode("image", {
                                            src: _imports_1$3,
                                            class: "interaction-icon"
                                          }),
                                          vue.createElementVNode(
                                            "text",
                                            { class: "interaction-count" },
                                            vue.toDisplayString(item.views || 0),
                                            1
                                            /* TEXT */
                                          )
                                        ]),
                                        vue.createElementVNode("view", { class: "interaction-item" }, [
                                          vue.createElementVNode("image", {
                                            src: _imports_2$2,
                                            class: "interaction-icon"
                                          }),
                                          vue.createElementVNode(
                                            "text",
                                            { class: "interaction-count" },
                                            vue.toDisplayString(item.likes || 0),
                                            1
                                            /* TEXT */
                                          )
                                        ])
                                      ])
                                    ])
                                  ],
                                  2
                                  /* CLASS */
                                )
                              ], 8, ["onClick"]);
                            }),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ])) : (vue.openBlock(), vue.createElementBlock("view", {
                          key: 1,
                          class: "empty-state"
                        }, [
                          vue.createElementVNode("image", {
                            class: "empty-icon",
                            src: _imports_0$4
                          }),
                          vue.createElementVNode("text", { class: "empty-text" }, "展示柜空空如也"),
                          vue.createElementVNode("text", { class: "empty-tip" }, "快来创建你的展示空间吧！")
                        ])),
                        vue.createCommentVNode(" 添加展示柜数据 "),
                        vue.createElementVNode("view", null, [
                          vue.createElementVNode("button", {
                            class: "jump2addButton",
                            onClick: $setup.go2addShowCase
                          }, "+")
                        ])
                      ],
                      2
                      /* CLASS */
                    )) : vue.createCommentVNode("v-if", true)
                  ]),
                  _: 1
                  /* STABLE */
                }, 8, ["name"]),
                vue.createVNode(vue.Transition, {
                  name: $setup.transitionName()
                }, {
                  default: vue.withCtx(() => [
                    $setup.activeTab === 3 ? (vue.openBlock(), vue.createElementBlock(
                      "view",
                      {
                        key: 0,
                        class: vue.normalizeClass(["tab_body_3th", { none: $setup.activeTab !== 3 }])
                      },
                      [
                        Object.keys($setup.billData).length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                          key: 0,
                          class: "calendar-container"
                        }, [
                          (vue.openBlock(true), vue.createElementBlock(
                            vue.Fragment,
                            null,
                            vue.renderList($setup.billData, (bills, month) => {
                              return vue.openBlock(), vue.createElementBlock("view", { key: month }, [
                                vue.createElementVNode("view", { class: "month-header-container" }, [
                                  vue.createElementVNode(
                                    "text",
                                    { class: "month-header font-alimamashuhei" },
                                    vue.toDisplayString(month) + " 账单",
                                    1
                                    /* TEXT */
                                  ),
                                  vue.createElementVNode(
                                    "text",
                                    { class: "month-stats" },
                                    " 已补/总计：" + vue.toDisplayString($setup.countPaid(bills)) + "/" + vue.toDisplayString(bills.length),
                                    1
                                    /* TEXT */
                                  )
                                ]),
                                (vue.openBlock(true), vue.createElementBlock(
                                  vue.Fragment,
                                  null,
                                  vue.renderList(bills, (bill) => {
                                    return vue.openBlock(), vue.createElementBlock("view", {
                                      key: bill.id,
                                      class: "bill-item",
                                      onClick: ($event) => $setup.go2addBill(bill.id)
                                    }, [
                                      vue.createElementVNode("view", { class: "bill-left" }, [
                                        vue.createElementVNode("view", { class: "bill-name-container" }, [
                                          vue.createElementVNode(
                                            "text",
                                            { class: "bill-name" },
                                            vue.toDisplayString(bill.name),
                                            1
                                            /* TEXT */
                                          )
                                        ]),
                                        vue.createElementVNode("view", { class: "due-amount-container" }, [
                                          vue.createElementVNode("text", { class: "due-label" }, "待补款:"),
                                          vue.createElementVNode(
                                            "text",
                                            { class: "due-amount" },
                                            "¥" + vue.toDisplayString(bill.price),
                                            1
                                            /* TEXT */
                                          )
                                        ])
                                      ]),
                                      vue.createElementVNode("view", { class: "bill-right" }, [
                                        vue.createElementVNode("view", { class: "date-container" }, [
                                          vue.createElementVNode(
                                            "text",
                                            { class: "date-text" },
                                            "日期: " + vue.toDisplayString(bill.ymd),
                                            1
                                            /* TEXT */
                                          )
                                        ]),
                                        vue.createElementVNode("view", { class: "status-container" }, [
                                          vue.createElementVNode(
                                            "text",
                                            {
                                              class: vue.normalizeClass(["status-text", { "paid": bill.status === 1 }])
                                            },
                                            vue.toDisplayString(bill.status === 0 ? "未补款" : "已补款"),
                                            3
                                            /* TEXT, CLASS */
                                          )
                                        ])
                                      ])
                                    ], 8, ["onClick"]);
                                  }),
                                  128
                                  /* KEYED_FRAGMENT */
                                ))
                              ]);
                            }),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ])) : (vue.openBlock(), vue.createElementBlock("view", {
                          key: 1,
                          class: "empty-state"
                        }, [
                          vue.createElementVNode("image", {
                            class: "empty-icon",
                            src: _imports_0$4
                          }),
                          vue.createElementVNode("text", { class: "empty-text" }, "暂无待补尾款"),
                          vue.createElementVNode("text", { class: "empty-tip" }, "增加添加一个到账本试试吧～")
                        ])),
                        vue.createElementVNode("view", null, [
                          vue.createElementVNode("button", {
                            class: "jump2addButton",
                            onClick: _cache[5] || (_cache[5] = ($event) => $setup.go2addBill(false))
                          }, "+")
                        ])
                      ],
                      2
                      /* CLASS */
                    )) : vue.createCommentVNode("v-if", true)
                  ]),
                  _: 1
                  /* STABLE */
                }, 8, ["name"])
              ])
            ])
          ]),
          _: 1
          /* STABLE */
        })
      ],
      64
      /* STABLE_FRAGMENT */
    );
  }
  const PagesStockStock = /* @__PURE__ */ _export_sfc(_sfc_main$F, [["render", _sfc_render$E], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/stock/stock.vue"]]);
  const _imports_0$3 = "/static/pixcollocation.png";
  const _imports_1$2 = "/static/pixpaperplane.png";
  const _imports_2$1 = "/static/pixttq2.png";
  const _imports_3 = "/static/mypost.png";
  const _imports_0$2 = "/static/right.png";
  const _imports_5 = "/static/setting.png";
  const _imports_6 = "/static/logout.png";
  const _imports_8 = "/static/user.png";
  const _imports_9 = "/static/key.png";
  const _sfc_main$E = {
    __name: "mine",
    setup(__props, { expose: __expose }) {
      __expose();
      formatAppLog("log", "at pages/mine/mine.vue:105", global.isLogin);
      formatAppLog("log", "at pages/mine/mine.vue:106", global.userInfo);
      let inputPhone = vue.ref("");
      let inputPassword = vue.ref("");
      let unreadCount = vue.ref(0);
      let likeCount = vue.ref(0);
      let myCollocationCount = vue.ref(0);
      function chooseImage2() {
        return new Promise((resolve) => {
          uni.chooseImage({
            count: 1,
            success: (res) => {
              resolve(res.tempFilePaths[0]);
            }
          });
        });
      }
      function logout() {
        uni.removeStorageSync("token");
        uni.removeStorageSync("userInfo");
        global.isLogin = false;
      }
      function jump2register() {
        uni.navigateTo({
          url: `/pages/register/register`
        });
      }
      function jump2like() {
        uni.navigateTo({
          url: `/pages/user_like/user_like`
        });
      }
      function jump2myComment() {
        uni.navigateTo({
          url: `/pages/my_comment/my_comment`
        });
      }
      function jump2message() {
        uni.navigateTo({
          url: `/pages/message_list/message_list`
        });
      }
      function jump2forgetPassword() {
        uni.navigateTo({
          url: `/pages/reset_password/reset_password`
        });
      }
      function jump2collocation() {
        uni.navigateTo({
          url: `/pages/my_collocation/my_collocation`
        });
      }
      function jumpToCroper2() {
        chooseImage2().then((src) => {
          uni.navigateTo({
            url: `/pages/pop_croper/pop_croper?src=${decodeURIComponent(src)}`
          });
        });
      }
      const fetchUnreadCount = async () => {
        try {
          const res = await uni.request({
            url: `${websiteUrl}/with-state/unread-message-count`,
            header: {
              Authorization: uni.getStorageSync("token")
            }
          });
          if (res.data.status === "success") {
            unreadCount.value = res.data.data.count;
          }
        } catch (error) {
          formatAppLog("log", "at pages/mine/mine.vue:199", error);
          uni.showToast({
            title: "未读数获取失败",
            icon: "none"
          });
        }
      };
      const fetchLikeCount = async () => {
        try {
          const res = await uni.request({
            url: `${websiteUrl}/with-state/user-likes-count`,
            header: {
              Authorization: uni.getStorageSync("token")
            }
          });
          if (res.data.status === "success") {
            likeCount.value = res.data.data.count;
          }
        } catch (error) {
          formatAppLog("log", "at pages/mine/mine.vue:220", error);
          uni.showToast({
            title: "关注数获取失败",
            icon: "none"
          });
        }
      };
      const fetchMyCollocationCount = async () => {
        try {
          const res = await uni.request({
            url: `${websiteUrl}/with-state/my-collocation-count`,
            header: {
              Authorization: uni.getStorageSync("token")
            }
          });
          if (res.data.status === "success") {
            myCollocationCount.value = res.data.data;
          }
        } catch (error) {
          formatAppLog("log", "at pages/mine/mine.vue:242", error);
          uni.showToast({
            title: "搭配数获取失败",
            icon: "none"
          });
        }
      };
      function selectAvatar(croperPath) {
        formatAppLog("log", "at pages/mine/mine.vue:251", "croperPath:" + croperPath);
        let token = uni.getStorageSync("token");
        let qnToken = "";
        uni.request(
          {
            url: websiteUrl + "/with-state/qiniu-token",
            method: "POST",
            header: {
              "Authorization": token
            },
            success: (res) => {
              if (res.data.data == null || res.data.data.token == "") {
                uni.showToast({
                  title: "获取上传凭证失败",
                  icon: "none"
                });
                return;
              }
              qnToken = res.data.data.token;
              formatAppLog("log", "at pages/mine/mine.vue:271", "获取到的七牛token：" + res.data.data.token);
              let userInfo = uni.getStorageSync("userInfo");
              formatAppLog("log", "at pages/mine/mine.vue:273", userInfo);
              let fileName = res.data.data.path;
              formatAppLog("log", "at pages/mine/mine.vue:276", "fileName:" + fileName);
              uni.uploadFile({
                url: "https://up-cn-east-2.qiniup.com",
                name: "file",
                method: "POST",
                filePath: croperPath,
                fileType: "image",
                //仅支付宝小程序，且必填。
                formData: {
                  token: qnToken,
                  key: fileName,
                  //覆盖上传
                  scope: "hobby-box:" + fileName
                },
                success: (res2) => {
                  formatAppLog("log", "at pages/mine/mine.vue:291", "上传成功");
                  updateUserInfo("avatar", "https://images1.fantuanpu.com/" + fileName);
                },
                fail: (res2) => {
                  formatAppLog("log", "at pages/mine/mine.vue:298", res2);
                  uni.showToast({
                    title: "上传失败",
                    icon: "none"
                  });
                }
              });
            },
            fail: (res) => {
              uni.showToast({
                title: "获取上传凭证失败",
                icon: "none"
              });
            }
          }
          // uni.request.qnToken
        );
      }
      function updateUserInfo(key, value) {
        let token = uni.getStorageSync("token");
        uni.getStorageSync("userInfo");
        uni.request({
          url: websiteUrl + "/with-state/update-profile",
          method: "POST",
          header: {
            "Authorization": token
          },
          data: {
            "avatar": value
          },
          success: (res) => {
            formatAppLog("log", "at pages/mine/mine.vue:331", "更新成功");
            getUserInfo();
          },
          fail: (res) => {
            uni.showToast({
              title: "更新失败",
              icon: "none"
            });
          }
        });
      }
      function login() {
        if (inputPassword.value == "" || inputPhone.value == "") {
          uni.showToast({
            title: "请输入手机号和密码",
            icon: "none"
          });
          return;
        }
        if (!/^1[3456789]\d{9}$/.test(inputPhone.value)) {
          uni.showToast({
            title: "手机号格式错误",
            icon: "none"
          });
          return;
        }
        if (inputPassword.value.length < 6) {
          uni.showToast({
            title: "密码必须大于6位",
            icon: "none"
          });
          return;
        }
        let phone = inputPhone.value;
        let password = inputPassword.value;
        uni.request({
          url: websiteUrl + "/login",
          method: "POST",
          data: {
            account: phone,
            password
          },
          success: (res) => {
            formatAppLog("log", "at pages/mine/mine.vue:383", res);
            let data = res.data.data;
            let status = res.data.status;
            if (status != "success") {
              uni.showToast({
                title: res.data.msg,
                icon: "none"
              });
              return;
            }
            uni.setStorageSync("token", data.jwt_token);
            uni.setStorageSync("openid", data.open_id);
            uni.setStorageSync("session_key", data.session_key);
            formatAppLog("log", "at pages/mine/mine.vue:398", "jwt:" + data.jwt_token);
            if (data.jwt_token != null && data.jwt_token != "") {
              getUserInfo();
            }
          },
          fail: (res) => {
            uni.showToast({
              title: "登录失败",
              icon: "none"
            });
          }
        });
      }
      function jumpSetting() {
        uni.navigateTo({
          url: "/pages/setting/setting"
        });
      }
      vue.watch(
        () => global.isLogin,
        // 使用函数返回要监听的值
        (newVal) => {
          formatAppLog("log", "at pages/mine/mine.vue:422", "watch", newVal);
          if (newVal) {
            uni.showTabBar({ animation: false });
          } else {
            uni.hideTabBar({ animation: false });
          }
        }
      );
      onShow(() => {
        getUserInfo();
        if (global.isLogin) {
          uni.showTabBar({ animation: false });
        } else {
          uni.hideTabBar({ animation: false });
        }
        fetchUnreadCount();
        fetchLikeCount();
        fetchMyCollocationCount();
        const pages = getCurrentPages();
        const currentPage = pages[pages.length - 1];
        if (currentPage.returnParam) {
          selectAvatar(currentPage.returnParam);
        }
      });
      const __returned__ = { get inputPhone() {
        return inputPhone;
      }, set inputPhone(v) {
        inputPhone = v;
      }, get inputPassword() {
        return inputPassword;
      }, set inputPassword(v) {
        inputPassword = v;
      }, get unreadCount() {
        return unreadCount;
      }, set unreadCount(v) {
        unreadCount = v;
      }, get likeCount() {
        return likeCount;
      }, set likeCount(v) {
        likeCount = v;
      }, get myCollocationCount() {
        return myCollocationCount;
      }, set myCollocationCount(v) {
        myCollocationCount = v;
      }, chooseImage: chooseImage2, logout, jump2register, jump2like, jump2myComment, jump2message, jump2forgetPassword, jump2collocation, jumpToCroper: jumpToCroper2, fetchUnreadCount, fetchLikeCount, fetchMyCollocationCount, selectAvatar, updateUserInfo, login, jumpSetting, ref: vue.ref, watch: vue.watch, get onShow() {
        return onShow;
      }, get websiteUrl() {
        return websiteUrl;
      }, get wechatSignLogin() {
        return wechatSignLogin;
      }, get getUserInfo() {
        return getUserInfo;
      }, get global() {
        return global;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$D(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_common_page = resolveEasycom(vue.resolveDynamicComponent("common-page"), __easycom_1$4);
    return vue.openBlock(), vue.createElementBlock(
      vue.Fragment,
      null,
      [
        vue.createElementVNode("meta", {
          name: "theme-color",
          content: "#e0f3ff"
        }),
        vue.createVNode(_component_common_page, { head_color: "#e0f3ff" }, {
          default: vue.withCtx(() => [
            vue.createElementVNode("view", { class: "container" }, [
              vue.createCommentVNode(" 个人设置页面 "),
              vue.createCommentVNode(" 区分是否登录 "),
              $setup.global.isLogin ? (vue.openBlock(), vue.createElementBlock("view", { key: 0 }, [
                vue.createElementVNode("view", { class: "mine" }, [
                  vue.createElementVNode("view", { class: "full-width" }, [
                    vue.createElementVNode("view", { class: "avatar-container" }, [
                      vue.createElementVNode("image", {
                        mode: "aspectFill",
                        class: "mine-page-avatar",
                        src: $setup.global.userInfo.avatar,
                        onClick: $setup.jumpToCroper
                      }, null, 8, ["src"])
                    ]),
                    vue.createElementVNode("view", { class: "user-info-container" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "username-text font-alimamashuhei" },
                        vue.toDisplayString($setup.global.userInfo.username),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode("text", { class: "user-id-text" }, [
                        vue.createElementVNode("text", {
                          class: "font-alimamashuhei",
                          style: { "color": "#fff", "font-size": "22rpx" }
                        }, "ID"),
                        vue.createTextVNode(
                          " : " + vue.toDisplayString($setup.global.userInfo.id),
                          1
                          /* TEXT */
                        )
                      ])
                    ]),
                    vue.createElementVNode("view", { class: "clearfix" })
                  ]),
                  vue.createElementVNode("view", { class: "pageinfo-infobox" }, [
                    vue.createElementVNode("view", {
                      class: "info-item",
                      onClick: $setup.jump2like
                    }, [
                      vue.createElementVNode("image", {
                        src: _imports_0$3,
                        class: "icon"
                      }),
                      vue.createElementVNode("text", { class: "info-tap font-alimamashuhei" }, "关注"),
                      vue.createElementVNode(
                        "text",
                        { class: "mine-info-number" },
                        vue.toDisplayString($setup.likeCount),
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode("view", {
                      class: "info-item",
                      onClick: $setup.jump2message
                    }, [
                      vue.createElementVNode("image", {
                        src: _imports_1$2,
                        class: "icon"
                      }),
                      vue.createElementVNode("text", { class: "info-tap font-alimamashuhei" }, "消息"),
                      vue.createElementVNode(
                        "text",
                        { class: "mine-info-number" },
                        vue.toDisplayString($setup.unreadCount),
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode("view", {
                      class: "info-item",
                      onClick: $setup.jump2collocation
                    }, [
                      vue.createElementVNode("image", {
                        src: _imports_2$1,
                        class: "icon"
                      }),
                      vue.createElementVNode("text", { class: "info-tap font-alimamashuhei" }, "搭配"),
                      vue.createElementVNode(
                        "text",
                        { class: "mine-info-number" },
                        vue.toDisplayString($setup.myCollocationCount),
                        1
                        /* TEXT */
                      )
                    ])
                  ])
                ]),
                vue.createElementVNode("view", { class: "main-padding" }, [
                  vue.createElementVNode("view", { class: "button-container" }, [
                    vue.createElementVNode("button", {
                      class: "mine-button",
                      onClick: $setup.jump2myComment
                    }, [
                      vue.createElementVNode("image", {
                        class: "icon-small",
                        src: _imports_3
                      }),
                      vue.createElementVNode("text", null, "我的帖子"),
                      vue.createElementVNode("image", {
                        class: "right-bar",
                        src: _imports_0$2
                      })
                    ]),
                    vue.createElementVNode("button", {
                      class: "mine-button",
                      onClick: $setup.jumpSetting
                    }, [
                      vue.createElementVNode("image", {
                        class: "icon-small",
                        src: _imports_5
                      }),
                      vue.createElementVNode("text", null, "账号设置"),
                      vue.createElementVNode("image", {
                        class: "right-bar",
                        src: _imports_0$2
                      })
                    ]),
                    vue.createElementVNode("button", {
                      class: "mine-button last-button",
                      onClick: $setup.logout
                    }, [
                      vue.createElementVNode("image", {
                        class: "icon-small",
                        src: _imports_6
                      }),
                      vue.createElementVNode("text", null, "退出账号"),
                      vue.createElementVNode("image", {
                        class: "right-bar",
                        src: _imports_0$2
                      })
                    ])
                  ])
                ])
              ])) : (vue.openBlock(), vue.createElementBlock("view", {
                key: 1,
                class: "unlogin-container"
              }, [
                vue.createElementVNode("image", {
                  src: _imports_7,
                  mode: "aspectFit",
                  style: { "width": "300rpx", "height": "340rpx", "position": "relative", "right": "20rpx" }
                }),
                vue.createElementVNode("text", { class: "welcome-text" }, "欢迎使用娃圈狗狗助手"),
                vue.createElementVNode("view", { class: "input-group" }, [
                  vue.createElementVNode("view", { class: "input-with-icon" }, [
                    vue.createElementVNode("image", {
                      class: "icon",
                      src: _imports_8
                    }),
                    vue.withDirectives(vue.createElementVNode(
                      "input",
                      {
                        type: "text",
                        placeholder: "请输入手机号",
                        class: "inputer",
                        "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.inputPhone = $event)
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [vue.vModelText, $setup.inputPhone]
                    ])
                  ]),
                  vue.createElementVNode("view", { class: "input-with-icon" }, [
                    vue.createElementVNode("image", {
                      class: "icon",
                      src: _imports_9
                    }),
                    vue.withDirectives(vue.createElementVNode(
                      "input",
                      {
                        type: "password",
                        placeholder: "请输入密码",
                        class: "inputer",
                        "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.inputPassword = $event)
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [vue.vModelText, $setup.inputPassword]
                    ])
                  ])
                ]),
                vue.createElementVNode("view", { class: "action-links" }, [
                  vue.createElementVNode("text", {
                    class: "float-left",
                    onClick: $setup.jump2register
                  }, "注册账号"),
                  vue.createElementVNode("text", {
                    class: "float-right",
                    onClick: $setup.jump2forgetPassword
                  }, "忘记密码"),
                  vue.createElementVNode("view", { class: "clearfix" })
                ]),
                vue.createElementVNode("button", {
                  class: "submit-btn",
                  onClick: $setup.login
                }, "立即登录"),
                vue.createElementVNode("button", {
                  class: "submit-btn",
                  onClick: _cache[2] || (_cache[2] = (...args) => $setup.wechatSignLogin && $setup.wechatSignLogin(...args))
                }, "微信登录")
              ]))
            ])
          ]),
          _: 1
          /* STABLE */
        })
      ],
      64
      /* STABLE_FRAGMENT */
    );
  }
  const PagesMineMine = /* @__PURE__ */ _export_sfc(_sfc_main$E, [["render", _sfc_render$D], ["__scopeId", "data-v-7c2ebfa5"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/mine/mine.vue"]]);
  const _sfc_main$D = {
    __name: "watch_demo",
    setup(__props, { expose: __expose }) {
      __expose();
      const person = vue.ref({ name: "john", age: 18 });
      vue.watch(() => person.value.name, (newVal, oldVal) => {
        formatAppLog("log", "at pages/watch_demo/watch_demo.vue:14", "newVal", newVal);
        formatAppLog("log", "at pages/watch_demo/watch_demo.vue:15", "oldVal", oldVal);
      }, { deep: true });
      const __returned__ = { person, ref: vue.ref, watch: vue.watch };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$C(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", null, [
      vue.withDirectives(vue.createElementVNode(
        "input",
        {
          type: "text",
          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.person.name = $event)
        },
        null,
        512
        /* NEED_PATCH */
      ), [
        [vue.vModelText, $setup.person.name]
      ]),
      vue.createElementVNode(
        "text",
        null,
        vue.toDisplayString($setup.person.name),
        1
        /* TEXT */
      ),
      vue.createElementVNode("footer")
    ]);
  }
  const PagesWatchDemoWatchDemo = /* @__PURE__ */ _export_sfc(_sfc_main$D, [["render", _sfc_render$C], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/watch_demo/watch_demo.vue"]]);
  const _sfc_main$C = {
    __name: "attitude-widget",
    props: {
      targetId: Number,
      type: Number,
      attitudeStatus: {
        type: Number,
        default: 0
      },
      attitudeCounts: {
        type: Object,
        default: () => ({})
      }
    },
    emits: ["change"],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const props = __props;
      const emit = __emit;
      const showPanel = vue.ref(false);
      const currentStatus = vue.ref(props.attitudeStatus);
      const currentCounts = vue.ref({});
      const attitudeTypes = vue.ref([
        {
          emoji: "😝",
          value: 1,
          label: "很有趣"
        },
        {
          emoji: "😨",
          value: 2,
          label: "这个..."
        },
        {
          emoji: "🤤",
          value: 3,
          label: "我也想要"
        },
        {
          emoji: "🤦‍♀️",
          value: 4,
          label: "难以直视"
        },
        {
          emoji: "🤡",
          value: 5,
          label: "谁的鼻子掉了?"
        }
      ]);
      vue.watch(() => props.attitudeCounts, (newVal) => {
        attitudeTypes.value.forEach((t) => {
          currentCounts.value[t.value] = Number(newVal[t.value] ?? 0);
        });
        currentCounts.value = {
          ...currentCounts.value
        };
      }, {
        immediate: true,
        deep: true
      });
      const visibleGlobalCounts = vue.computed(() => {
        return attitudeTypes.value.map((t) => ({
          ...t,
          count: currentCounts.value[t.value] || 0
        })).filter((t) => t.count > 0 || t.value === currentStatus.value).filter((t) => t.count > 0);
      });
      const togglePanel = () => {
        showPanel.value = !showPanel.value;
      };
      const handleAction = async (actionType) => {
        try {
          const token = uni.getStorageSync("token");
          if (!token) {
            uni.showToast({
              title: "请先登录",
              icon: "none"
            });
            return;
          }
          const isActive = currentStatus.value === actionType;
          const apiUrl = `${websiteUrl}/with-state/attitude/${isActive ? "remove" : "add"}`;
          const res = await uni.request({
            url: apiUrl,
            method: "POST",
            data: {
              target_id: props.targetId,
              type: props.type,
              action_type: actionType
            },
            header: {
              Authorization: token
            }
          });
          if (res.data.status === "success") {
            if (isActive) {
              currentCounts.value[actionType]--;
              currentStatus.value = 0;
            } else {
              if (currentStatus.value > 0) {
                currentCounts.value[currentStatus.value]--;
              }
              currentStatus.value = actionType;
              currentCounts.value[actionType] = (currentCounts.value[actionType] || 0) + 1;
            }
            emit("change", {
              status: currentStatus.value,
              counts: {
                ...currentCounts.value
              }
            });
            showPanel.value = false;
          }
        } catch (err) {
          formatAppLog("log", "at components/attitude-widget/attitude-widget.vue:176", err);
          uni.showToast({
            title: "操作失败",
            icon: "none"
          });
        }
      };
      const __returned__ = { props, emit, showPanel, currentStatus, currentCounts, attitudeTypes, visibleGlobalCounts, togglePanel, handleAction, ref: vue.ref, computed: vue.computed, watch: vue.watch, get websiteUrl() {
        return websiteUrl;
      }, get asyncGetUserInfo() {
        return asyncGetUserInfo;
      }, get wechatSignLogin() {
        return wechatSignLogin;
      }, get getScene() {
        return getScene;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$B(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$6);
    return vue.openBlock(), vue.createElementBlock("view", { class: "attitude-container" }, [
      $setup.showPanel ? (vue.openBlock(), vue.createElementBlock(
        "view",
        {
          key: 0,
          class: "mask",
          onClick: vue.withModifiers($setup.togglePanel, ["stop"]),
          onTouchmove: _cache[0] || (_cache[0] = vue.withModifiers(() => {
          }, ["stop", "prevent"]))
        },
        null,
        32
        /* NEED_HYDRATION */
      )) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 合并后的全局统计 "),
      vue.createElementVNode("view", { class: "counts-and-expand" }, [
        vue.createElementVNode("view", { class: "global-counts" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.visibleGlobalCounts, (action) => {
              return vue.openBlock(), vue.createElementBlock(
                "view",
                {
                  key: action.value,
                  class: vue.normalizeClass(["count-item", {
                    "active": $setup.currentStatus === action.value,
                    "has-count": action.count > 0
                  }])
                },
                [
                  vue.createElementVNode(
                    "text",
                    { class: "emoji" },
                    vue.toDisplayString(action.emoji),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "count" },
                    vue.toDisplayString(action.count),
                    1
                    /* TEXT */
                  )
                ],
                2
                /* CLASS */
              );
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        vue.createElementVNode("view", {
          class: "expand-btn",
          onClick: vue.withModifiers($setup.togglePanel, ["stop"])
        }, [
          vue.createVNode(_component_uni_icons, {
            type: $setup.showPanel ? "arrowup" : "plus",
            size: "16",
            color: "#888"
          }, null, 8, ["type"]),
          vue.createElementVNode(
            "text",
            { class: "btn-text" },
            vue.toDisplayString($setup.showPanel ? "收起" : "表态"),
            1
            /* TEXT */
          )
        ])
      ]),
      vue.createCommentVNode(" 表态面板 "),
      $setup.showPanel ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "attitude-panel"
      }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.attitudeTypes, (action) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: action.value,
              class: vue.normalizeClass(["attitude-btn", { active: $setup.currentStatus === action.value }]),
              onClick: vue.withModifiers(($event) => $setup.handleAction(action.value), ["stop"])
            }, [
              vue.createElementVNode(
                "text",
                { class: "emoji" },
                vue.toDisplayString(action.emoji),
                1
                /* TEXT */
              ),
              vue.createElementVNode("view", { class: "text-container" }, [
                vue.createElementVNode(
                  "text",
                  { class: "label" },
                  vue.toDisplayString(action.label),
                  1
                  /* TEXT */
                )
              ])
            ], 10, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const __easycom_0$5 = /* @__PURE__ */ _export_sfc(_sfc_main$C, [["render", _sfc_render$B], ["__scopeId", "data-v-f15d1ff3"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/components/attitude-widget/attitude-widget.vue"]]);
  const _sfc_main$B = {
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
      const commentList = vue.ref([]);
      const currentPage = vue.ref(1);
      const mainCommentsTotal = vue.ref(0);
      const hasMore = vue.ref(true);
      const subCommentPages = vue.reactive({});
      const emit = __emit;
      const loading = vue.ref(false);
      const handleAttitudeChange = (comment2, {
        status,
        counts
      }) => {
        comment2.attitudeStatus = status;
        comment2.attitudeCounts = counts;
      };
      __expose({
        // 添加主评论
        addNewComment: (comment2) => {
          commentList.value.unshift({
            ...comment2,
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
      vue.onMounted(() => {
        loadMainComments();
      });
      const visibleChildren = (comment2) => {
        if (!comment2.showAll && comment2.localChildren.length > 5) {
          return comment2.localChildren.slice(0, 5);
        }
        return comment2.localChildren;
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
      const handleLike = async (comment2) => {
        if (!global.isLogin) {
          uni.showToast({
            title: "请先登录",
            icon: "none"
          });
          return;
        }
        try {
          const token = uni.getStorageSync("token");
          const url = `${websiteUrl}/with-state/${comment2.user_like ? "unlike" : "add-like"}`;
          const res = await uni.request({
            url,
            method: "POST",
            header: {
              Authorization: token
            },
            data: {
              id: comment2.id,
              type: 6
              // 评论类型
            }
          });
          if (res.data.status === "success") {
            comment2.user_like = !comment2.user_like;
            if (comment2.user_like) {
              comment2.like_count = (comment2.like_count || 0) + 1;
            } else {
              comment2.like_count = Math.max(0, (comment2.like_count || 0) - 1);
            }
            uni.showToast({
              title: comment2.user_like ? "点赞成功" : "已取消点赞",
              icon: "none"
            });
          } else {
            uni.showToast({
              title: res.data.msg || "操作失败",
              icon: "none"
            });
          }
        } catch (err) {
          formatAppLog("error", "at components/comment-list/comment-list.vue:277", "点赞失败:", err);
          uni.showToast({
            title: "操作失败",
            icon: "none"
          });
        }
      };
      const jump2user = (uid) => {
        uni.navigateTo({
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
          let token = uni.getStorageSync("token");
          const res = await uni.request({
            url: `${websiteUrl}/get-comments`,
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
            formatAppLog("log", "at components/comment-list/comment-list.vue:342", "total", data.total);
            hasMore.value = data.total > commentList.value.length;
            mainCommentsTotal.value = data.total;
            formatAppLog("log", "at components/comment-list/comment-list.vue:346", "是否还有更多?", hasMore.value);
          }
        } catch (err) {
          uni.showToast({
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
      const shouldShowMore = (comment2) => {
        return comment2.childTotal > 5 && !comment2.showAll;
      };
      const remainingCount = (comment2) => {
        return comment2.childTotal - Math.min(comment2.localChildren.length, 5);
      };
      const loadMore = async (comment2) => {
        if (comment2.localChildren.length < comment2.childTotal) {
          const nextPage = Math.ceil(comment2.localChildren.length / 5) + 1;
          try {
            const res = await uni.request({
              url: `${websiteUrl}/get-comments-by-parent-id`,
              data: {
                parent_id: comment2.id,
                page: nextPage
              }
            });
            if (res.data.status === "success") {
              comment2.localChildren = [
                ...comment2.localChildren,
                ...res.data.data.comment_list
              ];
              comment2.childTotal = res.data.data.total;
              if (comment2.localChildren.length >= 5 && !comment2.showAll) {
                comment2.showAll = true;
              }
            }
          } catch (err) {
            uni.showToast({
              title: "加载失败",
              icon: "none"
            });
          }
        } else {
          comment2.showAll = !comment2.showAll;
        }
      };
      const __returned__ = { props, commentList, currentPage, mainCommentsTotal, hasMore, subCommentPages, emit, loading, handleAttitudeChange, visibleChildren, loadMoreMainComments, handleLike, jump2user, formatTime, formatUsername, loadMainComments, handleReply, shouldShowMore, remainingCount, loadMore, ref: vue.ref, computed: vue.computed, onMounted: vue.onMounted, reactive: vue.reactive, get websiteUrl() {
        return websiteUrl;
      }, get asyncGetUserInfo() {
        return asyncGetUserInfo;
      }, get wechatSignLogin() {
        return wechatSignLogin;
      }, get getScene() {
        return getScene;
      }, get global() {
        return global;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$A(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_attitude_widget = resolveEasycom(vue.resolveDynamicComponent("attitude-widget"), __easycom_0$5);
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$6);
    return vue.openBlock(), vue.createElementBlock("view", { class: "comment-container" }, [
      $setup.commentList.length > 0 ? (vue.openBlock(), vue.createElementBlock(
        "view",
        {
          key: 0,
          class: "comment-count"
        },
        " 共" + vue.toDisplayString($setup.mainCommentsTotal) + "条回复 ",
        1
        /* TEXT */
      )) : (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "empty-tips"
      }, [
        vue.createElementVNode("text", null, "-- 暂无回复 --")
      ])),
      vue.createCommentVNode(" 评论列表 "),
      (vue.openBlock(true), vue.createElementBlock(
        vue.Fragment,
        null,
        vue.renderList($setup.commentList, (comment2) => {
          return vue.openBlock(), vue.createElementBlock("view", {
            key: comment2.id,
            class: "comment-card"
          }, [
            vue.createCommentVNode(" 主评论 "),
            vue.createElementVNode("view", { class: "main-comment" }, [
              vue.createElementVNode("image", {
                onClick: ($event) => $setup.jump2user(comment2.uid),
                src: comment2.avatar,
                class: "avatar",
                mode: "aspectFill"
              }, null, 8, ["onClick", "src"]),
              vue.createElementVNode("view", { class: "content" }, [
                vue.createElementVNode("view", { class: "header" }, [
                  vue.createElementVNode("text", {
                    class: "username",
                    onClick: ($event) => $setup.jump2user(comment2.uid)
                  }, vue.toDisplayString($setup.formatUsername(comment2.username)), 9, ["onClick"]),
                  vue.createElementVNode(
                    "text",
                    { class: "floor" },
                    "#" + vue.toDisplayString(comment2.floor),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("text", {
                  class: "comment-text",
                  onClick: ($event) => $setup.handleReply(comment2)
                }, vue.toDisplayString(comment2.comment), 9, ["onClick"]),
                vue.createCommentVNode(" 新增表态按钮组 "),
                vue.createVNode(_component_attitude_widget, {
                  "target-id": comment2.id,
                  type: 6,
                  "attitude-status": comment2.attitudeStatus,
                  "attitude-counts": comment2.attitudeCounts,
                  onChange: ($event) => $setup.handleAttitudeChange(comment2, $event)
                }, null, 8, ["target-id", "attitude-status", "attitude-counts", "onChange"]),
                vue.createElementVNode("view", { class: "footer" }, [
                  vue.createElementVNode("view", { class: "left-actions" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "time" },
                      vue.toDisplayString($setup.formatTime(comment2.created_at)),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("view", { class: "like-container" }, [
                      vue.createElementVNode("view", {
                        class: "like-btn",
                        onClick: ($event) => $setup.handleLike(comment2)
                      }, [
                        vue.createVNode(_component_uni_icons, {
                          type: comment2.user_like ? "hand-up-filled" : "hand-up",
                          size: "18",
                          color: comment2.user_like ? "rgb(100 198 220)" : "#999"
                        }, null, 8, ["type", "color"]),
                        vue.createElementVNode(
                          "text",
                          {
                            class: vue.normalizeClass(["like-count", { liked: comment2.user_like }])
                          },
                          vue.toDisplayString(comment2.like_count || 0),
                          3
                          /* TEXT, CLASS */
                        )
                      ], 8, ["onClick"])
                    ])
                  ]),
                  vue.createElementVNode("view", { class: "right-actions" }, [
                    vue.createElementVNode("text", {
                      class: "reply-btn",
                      onClick: ($event) => $setup.handleReply(comment2)
                    }, "回复", 8, ["onClick"])
                  ])
                ])
              ])
            ]),
            vue.createCommentVNode(" 子评论 "),
            comment2.localChildren && comment2.localChildren.length ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "sub-comments"
            }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.visibleChildren(comment2), (child, index) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    key: child.id,
                    class: "sub-comment"
                  }, [
                    vue.createElementVNode("image", {
                      onClick: ($event) => $setup.jump2user(child.uid),
                      src: child.avatar,
                      class: "avatar",
                      mode: "aspectFill"
                    }, null, 8, ["onClick", "src"]),
                    vue.createElementVNode("view", { class: "content" }, [
                      vue.createElementVNode("view", { class: "header" }, [
                        vue.createElementVNode("text", {
                          onClick: ($event) => $setup.jump2user(child.uid),
                          class: "username"
                        }, vue.toDisplayString($setup.formatUsername(child.username)), 9, ["onClick"]),
                        child.reply_for ? (vue.openBlock(), vue.createElementBlock(
                          "text",
                          {
                            key: 0,
                            class: "reply-to"
                          },
                          "@" + vue.toDisplayString(child.reply_for),
                          1
                          /* TEXT */
                        )) : vue.createCommentVNode("v-if", true)
                      ]),
                      vue.createElementVNode("text", {
                        class: "comment-text",
                        onClick: ($event) => $setup.handleReply(comment2)
                      }, vue.toDisplayString(child.comment), 9, ["onClick"]),
                      vue.createCommentVNode(" 新增表态按钮组 "),
                      vue.createVNode(_component_attitude_widget, {
                        "target-id": child.id,
                        type: 6,
                        "attitude-status": comment2.attitudeStatus,
                        "attitude-counts": comment2.attitudeCounts,
                        onChange: ($event) => $setup.handleAttitudeChange(comment2, $event)
                      }, null, 8, ["target-id", "attitude-status", "attitude-counts", "onChange"]),
                      vue.createElementVNode("view", { class: "footer" }, [
                        vue.createElementVNode("view", { class: "left-actions" }, [
                          vue.createElementVNode(
                            "text",
                            { class: "time" },
                            vue.toDisplayString($setup.formatTime(child.created_at)),
                            1
                            /* TEXT */
                          ),
                          vue.createElementVNode("view", { class: "like-container" }, [
                            vue.createElementVNode("view", {
                              class: "like-btn",
                              onClick: ($event) => $setup.handleLike(child)
                            }, [
                              vue.createVNode(_component_uni_icons, {
                                type: child.user_like ? "hand-up-filled" : "hand-up",
                                size: "18",
                                color: child.user_like ? "rgb(100 198 220)" : "#999"
                              }, null, 8, ["type", "color"]),
                              vue.createElementVNode(
                                "text",
                                {
                                  class: vue.normalizeClass(["like-count", { liked: child.user_like }])
                                },
                                vue.toDisplayString(child.like_count || 0),
                                3
                                /* TEXT, CLASS */
                              )
                            ], 8, ["onClick"])
                          ])
                        ]),
                        vue.createElementVNode("view", { class: "right-actions" }, [
                          vue.createElementVNode("text", {
                            class: "reply-btn",
                            onClick: ($event) => $setup.handleReply(comment2, child)
                          }, "回复", 8, ["onClick"])
                        ])
                      ])
                    ])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              )),
              vue.createCommentVNode(" 加载更多 "),
              $setup.shouldShowMore(comment2) ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "load-more",
                onClick: ($event) => $setup.loadMore(comment2)
              }, [
                vue.createElementVNode(
                  "text",
                  null,
                  "展开" + vue.toDisplayString($setup.remainingCount(comment2)) + "条回复",
                  1
                  /* TEXT */
                ),
                vue.createVNode(_component_uni_icons, {
                  type: "arrow-down",
                  size: "18",
                  color: "#007AFF"
                })
              ], 8, ["onClick"])) : vue.createCommentVNode("v-if", true)
            ])) : vue.createCommentVNode("v-if", true)
          ]);
        }),
        128
        /* KEYED_FRAGMENT */
      )),
      vue.createCommentVNode(" 加载更多按钮 "),
      $setup.commentList.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 2,
        class: "load-more-box"
      }, [
        $setup.hasMore ? (vue.openBlock(), vue.createElementBlock(
          "view",
          {
            key: 0,
            class: vue.normalizeClass(["load-more-btn", { loading: $setup.loading }]),
            onClick: $setup.loadMoreMainComments
          },
          [
            !$setup.loading ? (vue.openBlock(), vue.createElementBlock("view", { key: 0 }, [
              vue.createElementVNode("text", null, " 加载更多 "),
              vue.createVNode(_component_uni_icons, {
                type: "arrow-down",
                size: "18",
                color: "#007AFF"
              })
            ])) : (vue.openBlock(), vue.createElementBlock("view", { key: 1 }, [
              vue.createVNode(_component_uni_icons, {
                type: "spinner-cycle",
                size: "16",
                color: "#888"
              })
            ]))
          ],
          2
          /* CLASS */
        )) : (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "no-more"
        }, [
          vue.createElementVNode("text", null, "-- 没有更多了 --")
        ]))
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const __easycom_1$2 = /* @__PURE__ */ _export_sfc(_sfc_main$B, [["render", _sfc_render$A], ["__scopeId", "data-v-ea2f609f"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/components/comment-list/comment-list.vue"]]);
  const _sfc_main$A = {
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
      const inputRef = vue.ref(null);
      const isFocused = vue.ref(false);
      const emit = __emit;
      const instance = vue.getCurrentInstance();
      const commentText = vue.ref("");
      const displayMask = vue.ref(false);
      const keyboardHeight = vue.ref(0);
      const systemInfo2 = uni.getSystemInfoSync();
      const footerBottomHeight = vue.computed(() => {
        var _a, _b;
        let safeBottomVar = ((_a = systemInfo2.safeAreaInsets) == null ? void 0 : _a.bottom) || 10;
        formatAppLog("log", "at components/comment-input/comment-input.vue:59", "底部安全距离1:", (_b = systemInfo2.safeAreaInsets) == null ? void 0 : _b.bottom, "=>", safeBottomVar);
        const safeBottom = safeBottomVar + keyboardHeight.value;
        return `${safeBottom}px`;
      });
      const keyboardHeightChangeHandler2 = (res) => {
        formatAppLog("log", "at components/comment-input/comment-input.vue:66", "键盘高度变化", res);
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
        uni.hideKeyboard();
      };
      const handleSubmit = () => {
        if (!commentText.value.trim()) {
          uni.showToast({
            title: "请输入评论内容",
            icon: "none"
          });
          return;
        }
        let scene = getScene();
        formatAppLog("log", "at components/comment-input/comment-input.vue:95", "scene", scene);
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
      onShow(() => {
        formatAppLog("log", "at components/comment-input/comment-input.vue:123", "注册键盘弹出事件");
        uni.onKeyboardHeightChange(keyboardHeightChangeHandler2);
      });
      const __returned__ = { props, inputRef, isFocused, emit, instance, commentText, displayMask, keyboardHeight, systemInfo: systemInfo2, footerBottomHeight, keyboardHeightChangeHandler: keyboardHeightChangeHandler2, handleFocus, handleBlur, handleMaskTap, handleSubmit, focusInput, ref: vue.ref, computed: vue.computed, getCurrentInstance: vue.getCurrentInstance, get onLoad() {
        return onLoad;
      }, get onShow() {
        return onShow;
      }, get getScene() {
        return getScene;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$z(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      vue.Fragment,
      null,
      [
        vue.createCommentVNode(" 蒙版层 "),
        vue.withDirectives(vue.createElementVNode(
          "view",
          {
            class: "mask",
            onClick: $setup.handleMaskTap
          },
          null,
          512
          /* NEED_PATCH */
        ), [
          [vue.vShow, $setup.displayMask]
        ]),
        vue.createCommentVNode(" 评论框 "),
        vue.createElementVNode(
          "view",
          {
            class: "bottom_tab",
            "adjust-position": false,
            style: vue.normalizeStyle({ paddingBottom: $setup.footerBottomHeight })
          },
          [
            vue.createCommentVNode(" 输入框 "),
            vue.withDirectives(vue.createElementVNode("textarea", {
              "disable-default-padding": true,
              focus: $setup.isFocused,
              class: vue.normalizeClass(["comment_input unified-textarea", { expanded: $setup.isFocused }]),
              ref: "inputRef",
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.commentText = $event),
              onFocus: $setup.handleFocus,
              onBlur: $setup.handleBlur,
              "adjust-position": false,
              placeholder: $props.replyInfo.username ? "回复@" + $props.replyInfo.username + " " : "写评论..."
            }, null, 42, ["focus", "placeholder"]), [
              [vue.vModelText, $setup.commentText]
            ]),
            vue.createCommentVNode(" 按钮 "),
            vue.createElementVNode("button", { onClick: $setup.handleSubmit }, "写评论")
          ],
          4
          /* STYLE */
        )
      ],
      64
      /* STABLE_FRAGMENT */
    );
  }
  const __easycom_2 = /* @__PURE__ */ _export_sfc(_sfc_main$A, [["render", _sfc_render$z], ["__scopeId", "data-v-88f35a0c"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/components/comment-input/comment-input.vue"]]);
  const _imports_2 = "/static/right2.png";
  const _imports_1$1 = "/static/paper_plane.png";
  const _sfc_main$z = {
    __name: "goods",
    props: ["goods_id"],
    setup(__props, { expose: __expose }) {
      __expose();
      const props = __props;
      const systemInfo2 = uni.getSystemInfoSync();
      const loading = vue.ref(false);
      const error = vue.ref(false);
      const errorMsg = vue.ref("");
      const commentListRef = vue.ref(null);
      const commentInputRef = vue.ref(null);
      let commentsPage = vue.ref(1);
      let replyForItem = vue.ref({});
      let goods2 = vue.ref({});
      let swiperIndex = vue.ref(1);
      let hasLike = vue.ref(false);
      let collocationList = vue.ref(false);
      const swiperHeight = vue.ref(400);
      const imageHeights = vue.ref([]);
      const handleReplyComment = ({
        parent,
        target
      }) => {
        var _a;
        formatAppLog("log", "at pages/goods/goods.vue:221", "parent", parent);
        formatAppLog("log", "at pages/goods/goods.vue:222", "target", target);
        let item = parent;
        if (target != null) {
          item = target;
        }
        if (replyForItem.value.id == item.id) {
          replyForItem.value = {};
          return;
        }
        formatAppLog("log", "at pages/goods/goods.vue:233", "item", item);
        replyForItem.value = item;
        (_a = commentInputRef.value) == null ? void 0 : _a.focusInput();
      };
      const handleCommentSubmit = ({
        content,
        replyInfo,
        origin
      }) => {
        let token = uni.getStorageSync("token");
        if (!global.isLogin) {
          uni.showToast({
            title: "请先登录",
            icon: "none"
          });
          return;
        }
        formatAppLog("log", "at pages/goods/goods.vue:251", "reply_info", replyInfo);
        const requestData = {
          content,
          origin,
          target_id: parseInt(props.goods_id),
          type: 2,
          ...replyInfo.id && {
            reply_id: replyInfo.id,
            reply_for: replyInfo.comment,
            reply_user_id: replyInfo.user_id,
            parent_id: replyInfo.parent_id > 0 ? replyInfo.parent_id : replyInfo.id
          }
        };
        uni.request({
          url: websiteUrl + "/with-state/add-comment",
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
              uni.showToast({
                title: "评论成功",
                icon: "success"
              });
            } else {
              uni.showToast({
                title: res.data.msg,
                icon: "none"
              });
            }
          },
          fail: (err) => {
            uni.showToast({
              title: "网络请求失败",
              icon: "none"
            });
          }
        });
      };
      const onShareAppMessage = () => ({
        title: "BJD娃圈你想知道的这里都有~",
        path: "/pages/news/news",
        success(res) {
          formatAppLog("log", "at pages/goods/goods.vue:309", "分享成功", res);
        },
        fail(err) {
          formatAppLog("log", "at pages/goods/goods.vue:312", "分享失败", err);
        },
        mp: {
          wxpath: "/pages/index/index.html"
        }
      });
      function onImageLoad(index) {
        formatAppLog("log", "at pages/goods/goods.vue:322", "图片加载完成", index);
        const query = uni.createSelectorQuery();
        setTimeout(() => {
          query.select(`.swiper-image-${index}`).boundingClientRect((rect) => {
            try {
              if (!rect) {
                formatAppLog("warn", "at pages/goods/goods.vue:329", "未找到图片元素");
                return;
              }
              formatAppLog("log", "at pages/goods/goods.vue:332", rect);
              imageHeights.value[index] = rect.height;
              const validHeights = imageHeights.value.filter((h) => h > 0);
              if (validHeights.length === 0)
                return;
              swiperHeight.value = Math.max(...validHeights);
            } catch (e) {
              formatAppLog("error", "at pages/goods/goods.vue:338", "高度计算异常:", e);
            }
          }).exec();
        }, 20);
      }
      uni.showLoading({
        title: "加载中"
      });
      function jumpBrand(id) {
        uni.navigateTo({
          url: "/pages/brand/brand?brand_id=" + id
        });
      }
      function onChange(e) {
        formatAppLog("log", "at pages/goods/goods.vue:356", e.detail.current);
        swiperIndex.value = e.detail.current + 1;
      }
      function getGoods() {
        uni.request({
          url: websiteUrl + "/goods?id=" + props.goods_id,
          method: "GET",
          timeout: 5e3,
          success: (res) => {
            formatAppLog("log", "at pages/goods/goods.vue:366", res.data.data);
            goods2.value = res.data.data;
          },
          fail: (err) => {
            formatAppLog("log", "at pages/goods/goods.vue:370", err);
            uni.showToast({
              title: "网络请求失败",
              icon: "none"
            });
          },
          complete: () => {
            uni.hideLoading();
          }
        });
      }
      function formatNumber(num) {
        if (num < 1e3) {
          return num.toString();
        } else {
          const kValue = Math.floor(num / 1e3);
          return `${kValue}k+`;
        }
      }
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
      function replyFor(item) {
        if (replyForItem.value.id == item.id) {
          replyForItem.value = {};
          return;
        }
        replyForItem.value = item;
      }
      function likeFn() {
        let token = uni.getStorageSync("token");
        if (!global.isLogin) {
          uni.showToast({
            title: "请先登录",
            icon: "none"
          });
          return;
        }
        let requestData = {
          id: parseInt(props.goods_id),
          type: 1
        };
        let url = hasLike.value ? "/with-state/unlike" : "/with-state/add-like";
        uni.request({
          url: websiteUrl + url,
          method: "POST",
          header: {
            "Authorization": token
          },
          data: requestData,
          success: (res) => {
            formatAppLog("log", "at pages/goods/goods.vue:440", res.data);
            if (res.data.status == "success") {
              uni.showToast({
                title: "操作成功",
                icon: "success"
              });
              hasLike.value = !hasLike.value;
              getHasLike();
              getGoods();
              return;
            } else {
              uni.showToast({
                title: res.data.msg,
                icon: "none"
              });
              return;
            }
          },
          fail: (err) => {
            formatAppLog("log", "at pages/goods/goods.vue:459", err);
            uni.showToast({
              title: "网络请求失败",
              icon: "none"
            });
          }
        });
      }
      function getHasLike() {
        let token = uni.getStorageSync("token");
        if (token == "") {
          return;
        }
        uni.request({
          url: websiteUrl + "/with-state/hasLike?id=" + props.goods_id + "&type=1",
          method: "POST",
          header: {
            "Authorization": token
          },
          success: (res) => {
            formatAppLog("log", "at pages/goods/goods.vue:481", res.data);
            if (res.data.status == "success") {
              if (res.data.data.id > 0) {
                hasLike.value = true;
              } else {
                hasLike.value = false;
              }
            } else {
              uni.showToast({
                title: res.data.msg,
                icon: "none"
              });
              return;
            }
          },
          fail: (err) => {
            formatAppLog("log", "at pages/goods/goods.vue:499", err);
            uni.showToast({
              title: "网络请求失败",
              icon: "none"
            });
          }
        });
      }
      function jump2collocation() {
        uni.navigateTo({
          url: "/pages/collocation/collocation?goods_id=" + props.goods_id + "&brand_id=" + goods2.value.brand_id + "&goods_name=" + goods2.value.name + "&brand_name=" + goods2.value.brand_name + "&type=" + goods2.value.type
        });
      }
      function jump2collectionDetail(collocation_id, origin) {
        uni.navigateTo({
          url: "/pages/collocation_share/collocation_share?collocation_id=" + collocation_id + "&origin=" + origin
        });
      }
      function getCollocation() {
        uni.request({
          url: websiteUrl + "/goods-collocation?goods_id=" + props.goods_id,
          method: "GET",
          timeout: 5e3,
          success: (res) => {
            formatAppLog("log", "at pages/goods/goods.vue:530", res.data.data);
            collocationList.value = res.data.data;
          },
          fail: (err) => {
            formatAppLog("log", "at pages/goods/goods.vue:534", err);
            uni.showToast({
              title: "网络请求失败",
              icon: "none"
            });
          }
        });
      }
      function getImageForList(urlList) {
        if (!urlList) {
          return "";
        }
        let urls = urlList.split(",");
        return urls[0].trim();
      }
      function viewFullImage(index) {
        uni.previewImage({
          current: goods2.value.goods_images["index"],
          urls: goods2.value.goods_images
        });
      }
      function jump2user(uid) {
        uni.navigateTo({
          url: "/pages/user_page/user_page?uid=" + uid
        });
      }
      getGoods();
      getCollocation();
      asyncGetUserInfo().then((userInfo) => {
        formatAppLog("log", "at pages/goods/goods.vue:573", userInfo);
        getHasLike();
      });
      const __returned__ = { props, systemInfo: systemInfo2, loading, error, errorMsg, commentListRef, commentInputRef, get commentsPage() {
        return commentsPage;
      }, set commentsPage(v) {
        commentsPage = v;
      }, get replyForItem() {
        return replyForItem;
      }, set replyForItem(v) {
        replyForItem = v;
      }, get goods() {
        return goods2;
      }, set goods(v) {
        goods2 = v;
      }, get swiperIndex() {
        return swiperIndex;
      }, set swiperIndex(v) {
        swiperIndex = v;
      }, get hasLike() {
        return hasLike;
      }, set hasLike(v) {
        hasLike = v;
      }, get collocationList() {
        return collocationList;
      }, set collocationList(v) {
        collocationList = v;
      }, swiperHeight, imageHeights, handleReplyComment, handleCommentSubmit, onShareAppMessage, onImageLoad, jumpBrand, onChange, getGoods, formatNumber, formatTimestamp, replyFor, likeFn, getHasLike, jump2collocation, jump2collectionDetail, getCollocation, getImageForList, viewFullImage, jump2user, ref: vue.ref, watch: vue.watch, computed: vue.computed, get asyncGetUserInfo() {
        return asyncGetUserInfo;
      }, get getScene() {
        return getScene;
      }, get onShow() {
        return onShow;
      }, get onHide() {
        return onHide;
      }, get websiteUrl() {
        return websiteUrl;
      }, get wechatSignLogin() {
        return wechatSignLogin;
      }, get getUserInfo() {
        return getUserInfo;
      }, get global() {
        return global;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$y(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$6);
    const _component_comment_list = resolveEasycom(vue.resolveDynamicComponent("comment-list"), __easycom_1$2);
    const _component_comment_input = resolveEasycom(vue.resolveDynamicComponent("comment-input"), __easycom_2);
    return $setup.goods.name ? (vue.openBlock(), vue.createElementBlock("view", { key: 0 }, [
      vue.createElementVNode("meta", {
        name: "theme-color",
        content: "#F8F8F8"
      }),
      vue.createElementVNode("view", null, [
        vue.createCommentVNode(" 轮播图部分 "),
        vue.createElementVNode("view", { style: { "position": "relative" } }, [
          vue.createElementVNode("view", {
            class: "heart",
            onClick: _cache[0] || (_cache[0] = ($event) => $setup.likeFn())
          }, [
            vue.createCommentVNode(' 					<image src="../../static/heart-w.png" v-if="!hasLike"></image>\r\n					<image src="../../static/heart2.png" v-else></image> '),
            !$setup.hasLike ? (vue.openBlock(), vue.createBlock(_component_uni_icons, {
              key: 0,
              type: "heart",
              size: "28",
              color: "#ff4d4f"
            })) : (vue.openBlock(), vue.createBlock(_component_uni_icons, {
              key: 1,
              type: "heart-filled",
              size: "28",
              color: "#ff4d4f"
            })),
            vue.createElementVNode(
              "text",
              {
                class: "num",
                style: { "color": "#ff4d4f" }
              },
              vue.toDisplayString($setup.formatNumber($setup.goods.goods_like_count)),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode(
            "swiper",
            {
              interval: 3e3,
              duration: 200,
              onChange: $setup.onChange,
              class: "banner_swiper",
              style: vue.normalizeStyle([{ "max-height": "800px" }, { height: $setup.swiperHeight + "px" }])
            },
            [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.goods.goods_images, (item, key) => {
                  return vue.openBlock(), vue.createElementBlock("swiper-item", {
                    key,
                    class: "banner_swiper_item"
                  }, [
                    vue.createElementVNode("view", { class: "swiper-item" }, [
                      vue.createElementVNode("image", {
                        src: item,
                        mode: "widthFix",
                        style: { "width": "100%", "display": "block" },
                        class: vue.normalizeClass("swiper-image-" + key),
                        onClick: ($event) => $setup.viewFullImage(key),
                        onLoad: ($event) => $setup.onImageLoad(key)
                      }, null, 42, ["src", "onClick", "onLoad"])
                    ])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ],
            36
            /* STYLE, NEED_HYDRATION */
          ),
          vue.createElementVNode("view", { class: "swiper-index-box" }, [
            vue.createElementVNode(
              "text",
              { class: "font-alimamashuhei" },
              vue.toDisplayString($setup.swiperIndex) + " / " + vue.toDisplayString($setup.goods.goods_images.length),
              1
              /* TEXT */
            )
          ])
        ])
      ]),
      vue.createElementVNode("view", { class: "msg_body" }, [
        vue.createElementVNode("view", { class: "msg_block" }, [
          vue.createElementVNode("text", { class: "lable_text" }, "名称"),
          vue.createElementVNode(
            "text",
            { class: "msg_text" },
            vue.toDisplayString($setup.goods.name),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "msg_block" }, [
          vue.createElementVNode("text", { class: "lable_text" }, "类型"),
          vue.createElementVNode(
            "text",
            { class: "msg_text" },
            vue.toDisplayString($setup.goods.type),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "msg_block" }, [
          vue.createElementVNode("text", { class: "lable_text" }, "初贩定价"),
          $setup.goods.total_amount ? (vue.openBlock(), vue.createElementBlock(
            "text",
            {
              key: 0,
              class: "msg_text"
            },
            vue.toDisplayString($setup.goods.total_amount + " " + $setup.goods.currency),
            1
            /* TEXT */
          )) : $setup.goods.goods_sales && $setup.goods.goods_sales.length > 0 ? (vue.openBlock(), vue.createElementBlock(
            "text",
            {
              key: 1,
              class: "msg_text"
            },
            vue.toDisplayString($setup.goods.goods_sales[0].sub_amount + $setup.goods.goods_sales[0].fin_amount) + " " + vue.toDisplayString($setup.goods.goods_sales[0].currency),
            1
            /* TEXT */
          )) : (vue.openBlock(), vue.createElementBlock("text", { key: 2 }, "未知"))
        ]),
        vue.createElementVNode("view", { class: "msg_block" }, [
          vue.createElementVNode("text", { class: "lable_text" }, "初贩时间"),
          vue.createElementVNode(
            "text",
            { class: "msg_text" },
            vue.toDisplayString($setup.goods.sub_time1 > 0 ? $setup.formatTimestamp($setup.goods.sub_time1) : "未知"),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "msg_block" }, [
          vue.createElementVNode("text", { class: "lable_text" }, "尺寸"),
          vue.createElementVNode(
            "text",
            { class: "msg_text" },
            vue.toDisplayString($setup.goods.size) + " / " + vue.toDisplayString($setup.goods.size_detail),
            1
            /* TEXT */
          )
        ]),
        $setup.goods.type === "单体" || $setup.goods.type === "整体" || $setup.goods.type === "单头" ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "msg_block"
        }, [
          vue.createElementVNode("text", { class: "lable_text" }, "可选体型"),
          vue.createElementVNode(
            "text",
            { class: "msg_text" },
            vue.toDisplayString($setup.goods.body_size || "未知"),
            1
            /* TEXT */
          )
        ])) : vue.createCommentVNode("v-if", true),
        vue.createElementVNode("view", { class: "msg_block" }, [
          vue.createElementVNode("text", { class: "lable_text" }, "可选颜色"),
          vue.createElementVNode(
            "text",
            { class: "msg_text" },
            vue.toDisplayString($setup.goods.skin),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "msg_block" }, [
          vue.createElementVNode("text", { class: "lable_text" }, "贩售情报"),
          $setup.goods.goods_sales == null ? (vue.openBlock(), vue.createElementBlock("text", { key: 0 }, "暂无收录贩售详细信息")) : vue.createCommentVNode("v-if", true),
          vue.createElementVNode("view", { class: "msg_text" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.goods.goods_sales, (sale) => {
                return vue.openBlock(), vue.createElementBlock(
                  "text",
                  {
                    key: sale.id,
                    style: { "width": "100%", "display": "block", "margin-bottom": "10px" }
                  },
                  vue.toDisplayString($setup.formatTimestamp(sale.sub_time)) + ", " + vue.toDisplayString(sale.sale_type) + ", 总价: " + vue.toDisplayString(sale.sub_amount + sale.fin_amount) + " (" + vue.toDisplayString(sale.currency) + ") ",
                  1
                  /* TEXT */
                );
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ]),
        vue.createElementVNode("view", { class: "msg_block" }, [
          vue.createElementVNode("text", { class: "lable_text" }, "制作方"),
          vue.createElementVNode(
            "text",
            {
              class: "msg_text",
              style: { "color": "#55aae5" },
              onClick: _cache[1] || (_cache[1] = ($event) => $setup.jumpBrand($setup.goods.brand_id))
            },
            vue.toDisplayString($setup.goods.brand_name),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "msg_block" }, [
          vue.createElementVNode("text", { class: "lable_text" }, "备注"),
          vue.createElementVNode(
            "text",
            { class: "msg_text" },
            vue.toDisplayString($setup.goods.desc_content),
            1
            /* TEXT */
          )
        ])
      ]),
      vue.createCommentVNode(" 搭配参考 "),
      vue.createElementVNode("view", { style: { "padding": "40rpx" } }, [
        vue.createElementVNode("view", { style: { "display": "flex", "margin": "30px 5px 10px 5px" } }, [
          vue.createElementVNode("text", { style: { "color": "rgb(100, 198, 220)", "font-weight": "bold", "display": "block", "width": "calc(100% - 130rpx)" } }, "搭配参考"),
          vue.createElementVNode("view", { style: { "display": "flex" } }, [
            vue.createElementVNode("text", { style: { "width": "110rpx", "display": "inline-block", "color": "#888" } }, "查看更多"),
            vue.createElementVNode("image", {
              src: _imports_2,
              style: { "width": "30rpx", "height": "30rpx", "display": "inline-block", "position": "relative", "top": "3rpx" }
            })
          ])
        ]),
        vue.createElementVNode("scroll-view", {
          "scroll-x": "true",
          class: "collocationBox",
          "ll-with-animation": "true",
          "show-scrollbar": false
        }, [
          vue.createCommentVNode(" 遍历搭配参考 "),
          $setup.collocationList && $setup.collocationList.collocation_relation_list.length > 0 ? (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            { key: 0 },
            vue.renderList($setup.collocationList.collocation_relation_list, (collocation) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: collocation.collocation_id,
                style: {},
                class: "collocationItem square",
                onClick: ($event) => $setup.jump2collectionDetail(collocation.collocation_id, collocation.relation_origin)
              }, [
                vue.createElementVNode("image", {
                  src: $setup.getImageForList(collocation.image_urls),
                  mode: "aspectFill",
                  style: { "width": "100%", "height": "100%" }
                }, null, 8, ["src"])
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          )) : vue.createCommentVNode("v-if", true)
        ]),
        vue.createElementVNode("view", {
          onClick: $setup.jump2collocation,
          style: { "border": "1px solid #eaeaea", "display": "flex", "margin": "20rpx auto", "border-radius": "15rpx", "width": "400rpx" }
        }, [
          vue.createElementVNode("image", {
            src: _imports_1$1,
            style: { "width": "45rpx", "height": "45rpx", "margin": "18rpx" }
          }),
          vue.createElementVNode("text", { style: { "color": "rgb(184 184 184)", "margin": "12px auto" } }, "上传搭配参考帮助他人")
        ])
      ]),
      vue.createCommentVNode(" 评论区（保留原有结构，需根据接口调整） "),
      vue.createElementVNode("view", { style: { "padding": "10px" } }, [
        vue.createVNode(_component_comment_list, {
          ref: "commentListRef",
          type: 2,
          "relation-id": parseInt($setup.props.goods_id),
          onReply: $setup.handleReplyComment
        }, null, 8, ["relation-id"])
      ]),
      vue.createCommentVNode(" 加载状态 "),
      $setup.loading ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "loading"
      }, "加载中...")) : vue.createCommentVNode("v-if", true),
      $setup.error ? (vue.openBlock(), vue.createElementBlock(
        "view",
        {
          key: 1,
          class: "error"
        },
        vue.toDisplayString($setup.errorMsg),
        1
        /* TEXT */
      )) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 输入框 "),
      vue.createVNode(_component_comment_input, {
        ref: "commentInputRef",
        "reply-info": $setup.replyForItem,
        "target-id": $setup.props.goods_id,
        onSubmit: $setup.handleCommentSubmit,
        "onUpdate:replyInfo": _cache[2] || (_cache[2] = (val) => $setup.replyForItem = val)
      }, null, 8, ["reply-info", "target-id"]),
      vue.createCommentVNode(" 一个不可见透明元素，撑起80px高度 "),
      vue.createElementVNode("view", { style: { "height": "80px" } })
    ])) : vue.createCommentVNode("v-if", true);
  }
  const PagesGoodsGoods = /* @__PURE__ */ _export_sfc(_sfc_main$z, [["render", _sfc_render$y], ["__scopeId", "data-v-7e2880f6"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/goods/goods.vue"]]);
  const _sfc_main$y = {
    name: "UniRate",
    props: {
      isFill: {
        // 星星的类型，是否镂空
        type: [Boolean, String],
        default: true
      },
      color: {
        // 星星未选中的颜色
        type: String,
        default: "#ececec"
      },
      activeColor: {
        // 星星选中状态颜色
        type: String,
        default: "#ffca3e"
      },
      disabledColor: {
        // 星星禁用状态颜色
        type: String,
        default: "#c0c0c0"
      },
      size: {
        // 星星的大小
        type: [Number, String],
        default: 24
      },
      value: {
        // 当前评分
        type: [Number, String],
        default: 0
      },
      modelValue: {
        // 当前评分
        type: [Number, String],
        default: 0
      },
      max: {
        // 最大评分
        type: [Number, String],
        default: 5
      },
      margin: {
        // 星星的间距
        type: [Number, String],
        default: 0
      },
      disabled: {
        // 是否可点击
        type: [Boolean, String],
        default: false
      },
      readonly: {
        // 是否只读
        type: [Boolean, String],
        default: false
      },
      allowHalf: {
        // 是否显示半星
        type: [Boolean, String],
        default: false
      },
      touchable: {
        // 是否支持滑动手势
        type: [Boolean, String],
        default: true
      }
    },
    data() {
      return {
        valueSync: "",
        userMouseFristMove: true,
        userRated: false,
        userLastRate: 1
      };
    },
    watch: {
      value(newVal) {
        this.valueSync = Number(newVal);
      },
      modelValue(newVal) {
        this.valueSync = Number(newVal);
      }
    },
    computed: {
      stars() {
        const value = this.valueSync ? this.valueSync : 0;
        const starList = [];
        const floorValue = Math.floor(value);
        const ceilValue = Math.ceil(value);
        for (let i = 0; i < this.max; i++) {
          if (floorValue > i) {
            starList.push({
              activeWitch: "100%"
            });
          } else if (ceilValue - 1 === i) {
            starList.push({
              activeWitch: (value - floorValue) * 100 + "%"
            });
          } else {
            starList.push({
              activeWitch: "0"
            });
          }
        }
        return starList;
      },
      marginNumber() {
        return Number(this.margin);
      }
    },
    created() {
      this.valueSync = Number(this.value || this.modelValue);
      this._rateBoxLeft = 0;
      this._oldValue = null;
    },
    mounted() {
      setTimeout(() => {
        this._getSize();
      }, 100);
    },
    methods: {
      touchstart(e) {
        if (this.readonly || this.disabled)
          return;
        const {
          clientX,
          screenX
        } = e.changedTouches[0];
        this._getRateCount(clientX || screenX);
      },
      touchmove(e) {
        if (this.readonly || this.disabled || !this.touchable)
          return;
        const {
          clientX,
          screenX
        } = e.changedTouches[0];
        this._getRateCount(clientX || screenX);
      },
      /**
       * 兼容 PC @tian
       */
      mousedown(e) {
      },
      mousemove(e) {
      },
      mouseleave(e) {
      },
      /**
       * 获取星星个数
       */
      _getRateCount(clientX) {
        this._getSize();
        const size = Number(this.size);
        if (isNaN(size)) {
          return new Error("size 属性只能设置为数字");
        }
        const rateMoveRange = clientX - this._rateBoxLeft;
        let index = parseInt(rateMoveRange / (size + this.marginNumber));
        index = index < 0 ? 0 : index;
        index = index > this.max ? this.max : index;
        const range = parseInt(rateMoveRange - (size + this.marginNumber) * index);
        let value = 0;
        if (this._oldValue === index && !this.PC)
          return;
        this._oldValue = index;
        if (this.allowHalf) {
          if (range > size / 2) {
            value = index + 1;
          } else {
            value = index + 0.5;
          }
        } else {
          value = index + 1;
        }
        value = Math.max(0.5, Math.min(value, this.max));
        this.valueSync = value;
        this._onChange();
      },
      /**
       * 触发动态修改
       */
      _onChange() {
        this.$emit("input", this.valueSync);
        this.$emit("update:modelValue", this.valueSync);
        this.$emit("change", {
          value: this.valueSync
        });
      },
      /**
       * 获取星星距离屏幕左侧距离
       */
      _getSize() {
        uni.createSelectorQuery().in(this).select(".uni-rate").boundingClientRect().exec((ret) => {
          if (ret) {
            this._rateBoxLeft = ret[0].left;
          }
        });
      }
    }
  };
  function _sfc_render$x(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$6);
    return vue.openBlock(), vue.createElementBlock("view", null, [
      vue.createElementVNode(
        "view",
        {
          ref: "uni-rate",
          class: "uni-rate"
        },
        [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($options.stars, (star, index) => {
              return vue.openBlock(), vue.createElementBlock(
                "view",
                {
                  class: vue.normalizeClass(["uni-rate__icon", { "uni-cursor-not-allowed": $props.disabled }]),
                  style: vue.normalizeStyle({ "margin-right": $options.marginNumber + "px" }),
                  key: index,
                  onTouchstart: _cache[0] || (_cache[0] = vue.withModifiers((...args) => $options.touchstart && $options.touchstart(...args), ["stop"])),
                  onTouchmove: _cache[1] || (_cache[1] = vue.withModifiers((...args) => $options.touchmove && $options.touchmove(...args), ["stop"])),
                  onMousedown: _cache[2] || (_cache[2] = vue.withModifiers((...args) => $options.mousedown && $options.mousedown(...args), ["stop"])),
                  onMousemove: _cache[3] || (_cache[3] = vue.withModifiers((...args) => $options.mousemove && $options.mousemove(...args), ["stop"])),
                  onMouseleave: _cache[4] || (_cache[4] = (...args) => $options.mouseleave && $options.mouseleave(...args))
                },
                [
                  vue.createVNode(_component_uni_icons, {
                    color: $props.color,
                    size: $props.size,
                    type: $props.isFill ? "star-filled" : "star"
                  }, null, 8, ["color", "size", "type"]),
                  vue.createElementVNode(
                    "view",
                    {
                      style: vue.normalizeStyle({ width: star.activeWitch }),
                      class: "uni-rate__icon-on"
                    },
                    [
                      vue.createVNode(_component_uni_icons, {
                        color: $props.disabled ? $props.disabledColor : $props.activeColor,
                        size: $props.size,
                        type: "star-filled"
                      }, null, 8, ["color", "size"])
                    ],
                    4
                    /* STYLE */
                  )
                ],
                38
                /* CLASS, STYLE, NEED_HYDRATION */
              );
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ],
        512
        /* NEED_PATCH */
      )
    ]);
  }
  const __easycom_0$4 = /* @__PURE__ */ _export_sfc(_sfc_main$y, [["render", _sfc_render$x], ["__scopeId", "data-v-5c8fbdf3"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/uni_modules/uni-rate/components/uni-rate/uni-rate.vue"]]);
  const _sfc_main$x = {
    __name: "brand",
    props: ["brand_id"],
    setup(__props, { expose: __expose }) {
      __expose();
      const props = __props;
      formatAppLog("log", "at pages/brand/brand.vue:103", props);
      const hasLikeBrand = vue.ref(false);
      const activeModal2 = vue.ref(false);
      uni.showLoading({
        title: "加载中"
      });
      const systemInfo2 = uni.getSystemInfoSync();
      let rateValue = vue.ref(0);
      const commentListRef = vue.ref(null);
      const commentInputRef = vue.ref(null);
      let commentsPage = vue.ref(1);
      let replyForItem = vue.ref({});
      const handleReplyComment = ({
        parent,
        target
      }) => {
        var _a;
        formatAppLog("log", "at pages/brand/brand.vue:131", "parent", parent);
        formatAppLog("log", "at pages/brand/brand.vue:132", "target", target);
        let item = parent;
        if (target != null) {
          item = target;
        }
        if (replyForItem.value.id == item.id) {
          replyForItem.value = {};
          return;
        }
        formatAppLog("log", "at pages/brand/brand.vue:143", "item", item);
        replyForItem.value = item;
        (_a = commentInputRef.value) == null ? void 0 : _a.focusInput();
      };
      const handleCommentSubmit = ({
        content,
        replyInfo,
        origin
      }) => {
        let token = uni.getStorageSync("token");
        if (!global.isLogin) {
          uni.showToast({
            title: "请先登录",
            icon: "none"
          });
          return;
        }
        formatAppLog("log", "at pages/brand/brand.vue:161", "reply_info", replyInfo);
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
        uni.request({
          url: websiteUrl + "/with-state/add-comment",
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
              uni.showToast({
                title: "评论成功",
                icon: "success"
              });
            } else {
              uni.showToast({
                title: res.data.msg,
                icon: "none"
              });
            }
          },
          fail: (err) => {
            uni.showToast({
              title: "网络请求失败",
              icon: "none"
            });
          }
        });
      };
      function voteScoreProxy() {
        if (rateValue.value == 0) {
          uni.showToast({
            title: "请先评分",
            icon: "none"
          });
          return;
        }
        if (rateValue.value > 5) {
          uni.showToast({
            title: "评分不能大于5",
            icon: "none"
          });
          return;
        }
        formatAppLog("log", "at pages/brand/brand.vue:230", rateValue.value, props.brand_id);
        voteScore(1, rateValue.value, props.brand_id);
      }
      const onShareAppMessage = () => ({
        title: "BJD娃圈你想知道的这里都有~",
        path: "/pages/news/news",
        success(res) {
          formatAppLog("log", "at pages/brand/brand.vue:239", "分享成功", res);
        },
        fail(err) {
          formatAppLog("log", "at pages/brand/brand.vue:242", "分享失败", err);
        },
        mp: {
          wxpath: "/pages/index/index.html"
        }
      });
      function getBrandsInfo() {
        uni.request({
          url: websiteUrl + "/brand-info?id=" + props.brand_id,
          method: "GET",
          timeout: 5e3,
          success: (res) => {
            formatAppLog("log", "at pages/brand/brand.vue:255", res.data.data);
            brand.value = res.data.data;
            uni.setNavigationBarTitle({
              title: res.data.data.brand_name
            });
            getHasLikeBrand();
          },
          fail: (err) => {
            formatAppLog("log", "at pages/brand/brand.vue:265", err);
            uni.showToast({
              title: "网络请求失败",
              icon: "none"
            });
          },
          complete: () => {
            uni.hideLoading();
          }
        });
      }
      const likeBrand = async () => {
        let token = uni.getStorageSync("token");
        if (!global.isLogin) {
          uni.showToast({ title: "请先登录", icon: "none" });
          return;
        }
        try {
          const url = `${websiteUrl}/with-state/${hasLikeBrand.value ? "unlike" : "add-like"}`;
          const res = await uni.request({
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
            uni.showToast({ title: hasLikeBrand.value ? "关注成功" : "已取消关注", icon: "none" });
            getBrandsInfo();
          } else {
            uni.showToast({ title: res.data.msg, icon: "none" });
          }
        } catch (err) {
          formatAppLog("error", "at pages/brand/brand.vue:306", err);
          uni.showToast({ title: "操作失败", icon: "none" });
        }
      };
      const getHasLikeBrand = async () => {
        var _a;
        try {
          const res = await uni.request({
            url: `${websiteUrl}/with-state/hasLike?id=${parseInt(props.brand_id)}&type=2`,
            method: "POST",
            header: { Authorization: uni.getStorageSync("token") }
          });
          hasLikeBrand.value = ((_a = res.data.data) == null ? void 0 : _a.id) > 0;
        } catch (err) {
          formatAppLog("error", "at pages/brand/brand.vue:323", "获取关注状态失败:", err);
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
        uni.request({
          url: websiteUrl + "/brand-goods?brand_id=" + props.brand_id + "&page=" + page.value,
          method: "GET",
          timeout: 5e3,
          success: (res) => {
            formatAppLog("log", "at pages/brand/brand.vue:347", res.data.data);
            goods2.value.page_index = res.data.data.page_index;
            goods2.value.total = res.data.data.total;
            goods2.value.goods_list = goods2.value.goods_list ? goods2.value.goods_list.concat(res.data.data.goods_list) : res.data.data.goods_list;
            if (res.data.data.goods_list.length > 0) {
              page.value += 1;
            }
            if (res.data.data.goods_list.length == 0 && page.value > 1) {
              uni.showToast({
                title: "没有更多数据了",
                icon: "none"
              });
            }
          },
          fail: (err) => {
            formatAppLog("log", "at pages/brand/brand.vue:364", err);
            uni.showToast({
              title: "网络请求失败",
              icon: "none"
            });
          }
        });
      }
      function openRate(i) {
        activeModal2.value = !activeModal2.value;
      }
      function addComments() {
        let token = uni.getStorageSync("token");
        if (!token) {
          uni.showToast({
            title: "请先登录",
            icon: "none"
          });
          return;
        }
        if (comment.value == "") {
          uni.showToast({
            title: "请输入评论内容",
            icon: "none"
          });
          return;
        }
        let scene = getScene();
        uni.request({
          url: websiteUrl + "/with-state/add-comment",
          method: "POST",
          header: {
            "Authorization": token
          },
          data: {
            //props.brand_id转为int
            target_id: parseInt(props.brand_id),
            content: comment.value,
            type: 1,
            origin: scene
          },
          success: (res) => {
            formatAppLog("log", "at pages/brand/brand.vue:415", res.data);
            if (res.data.status == "success") {
              uni.showToast({
                title: "评论成功",
                icon: "success"
              });
              comment.value = "";
              commentsPage.value = 1;
              comments.value = {};
              getBrandComments();
              return;
            } else {
              uni.showToast({
                title: res.data.msg,
                icon: "none"
              });
              return;
            }
          },
          fail: (err) => {
            formatAppLog("log", "at pages/brand/brand.vue:437", err);
            uni.showToast({
              title: "网络请求失败",
              icon: "none"
            });
          }
        });
      }
      function getMyScore(type, targetId) {
        let token = uni.getStorageSync("token");
        if (!token) {
          return 0;
        }
        if (!global.isLogin) {
          return 0;
        }
        uni.request({
          url: websiteUrl + "/with-state/my-vote-record",
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
            formatAppLog("log", "at pages/brand/brand.vue:466", res.data.data);
            if (res.data.status == "success") {
              rateValue.value = res.data.data.score;
              return res.data.data.score;
            } else {
              uni.showToast({
                title: res.data.msg,
                icon: "none"
              });
              return 0;
            }
          },
          fail: (err) => {
            formatAppLog("log", "at pages/brand/brand.vue:479", err);
            uni.showToast({
              title: "网络请求失败",
              icon: "none"
            });
            return 0;
          }
        });
      }
      function jumpGoods(id) {
        uni.navigateTo({
          url: "/pages/goods/goods?goods_id=" + id
        });
      }
      function jump2user(uid) {
        uni.navigateTo({
          url: "/pages/user_page/user_page?uid=" + uid
        });
      }
      let goods2 = vue.ref({});
      let page = vue.ref(1);
      let brand = vue.ref({});
      getBrandsInfo();
      getBrandGoods();
      getMyScore(1, props.brand_id);
      const __returned__ = { props, hasLikeBrand, activeModal: activeModal2, systemInfo: systemInfo2, get rateValue() {
        return rateValue;
      }, set rateValue(v) {
        rateValue = v;
      }, commentListRef, commentInputRef, get commentsPage() {
        return commentsPage;
      }, set commentsPage(v) {
        commentsPage = v;
      }, get replyForItem() {
        return replyForItem;
      }, set replyForItem(v) {
        replyForItem = v;
      }, handleReplyComment, handleCommentSubmit, voteScoreProxy, onShareAppMessage, getBrandsInfo, likeBrand, getHasLikeBrand, formatTimestamp, getBrandGoods, openRate, addComments, getMyScore, jumpGoods, jump2user, get goods() {
        return goods2;
      }, set goods(v) {
        goods2 = v;
      }, get page() {
        return page;
      }, set page(v) {
        page = v;
      }, get brand() {
        return brand;
      }, set brand(v) {
        brand = v;
      }, ref: vue.ref, watch: vue.watch, computed: vue.computed, get websiteUrl() {
        return websiteUrl;
      }, get wechatSignLogin() {
        return wechatSignLogin;
      }, get getUserInfo() {
        return getUserInfo;
      }, get global() {
        return global;
      }, get voteScore() {
        return voteScore;
      }, get getScene() {
        return getScene;
      }, get onShow() {
        return onShow;
      }, get onHide() {
        return onHide;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$w(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_rate = resolveEasycom(vue.resolveDynamicComponent("uni-rate"), __easycom_0$4);
    const _component_comment_list = resolveEasycom(vue.resolveDynamicComponent("comment-list"), __easycom_1$2);
    const _component_comment_input = resolveEasycom(vue.resolveDynamicComponent("comment-input"), __easycom_2);
    return vue.openBlock(), vue.createElementBlock("view", null, [
      vue.createElementVNode("meta", {
        name: "theme-color",
        content: "#F8F8F8"
      }),
      vue.createElementVNode("image", {
        src: $setup.brand.logo_image,
        mode: "aspectFit",
        class: "brand_logo"
      }, null, 8, ["src"]),
      vue.createElementVNode("view", { class: "body" }, [
        vue.createElementVNode("view", null, [
          vue.createElementVNode(
            "text",
            {
              style: { "float": "left", "font-size": "20px" },
              selectable: "true",
              "user-select": "true"
            },
            vue.toDisplayString($setup.brand.brand_name),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            { style: { "float": "right", "margin": "5px 0px" } },
            vue.toDisplayString($setup.brand.country_name) + " / " + vue.toDisplayString($setup.brand.type),
            1
            /* TEXT */
          ),
          vue.createElementVNode("view", { style: { "clear": "both" } })
        ]),
        vue.createElementVNode("view", { style: { "margin": "20rpx 0rpx", "display": "flex", "justify-content": "space-between" } }, [
          vue.createElementVNode("view", {
            onClick: _cache[0] || (_cache[0] = ($event) => $setup.openRate(1)),
            style: { "display": "inline-block", "position": "relative", "left": "-8rpx" }
          }, [
            vue.createVNode(_component_uni_rate, {
              style: { "margin-top": "5px", "float": "left" },
              value: $setup.brand.score,
              "allow-half": "true",
              "disabled-color": "rgb(255 157 219)"
            }, null, 8, ["value"]),
            vue.createElementVNode(
              "text",
              { style: { "float": "left", "position": "relative", "top": "5px" } },
              vue.toDisplayString($setup.brand.score) + "（" + vue.toDisplayString($setup.brand.vote_number) + "次评分）",
              1
              /* TEXT */
            ),
            vue.createElementVNode("view", { style: { "clear": "both" } })
          ]),
          vue.createElementVNode(
            "text",
            {
              class: "follow",
              onClick: $setup.likeBrand,
              style: vue.normalizeStyle({ background: $setup.hasLikeBrand ? "#ff6a6c" : "#65C3D6" })
            },
            vue.toDisplayString($setup.hasLikeBrand ? "已关注" : "+ 关注品牌"),
            5
            /* TEXT, STYLE */
          )
        ]),
        vue.createElementVNode("view", { style: { "margin-top": "15px" } }, [
          vue.createElementVNode(
            "text",
            null,
            "别名：" + vue.toDisplayString($setup.brand.nickname_list),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { style: { "margin-top": "10px" } }, [
          vue.createElementVNode(
            "text",
            null,
            "简介：" + vue.toDisplayString($setup.brand.description),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("div", { style: { "clear": "both" } }),
        vue.createCommentVNode(" 品牌商品列表 "),
        vue.createElementVNode(
          "text",
          { style: { "color": "rgb(100, 198, 220)", "display": "block", "margin": "20px 0px" } },
          "收录作品 (" + vue.toDisplayString($setup.goods.total) + ")",
          1
          /* TEXT */
        ),
        vue.createElementVNode("view", { class: "brand_goods" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.goods.goods_list, (item, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "brand_goods_item",
                style: {},
                key: item.id
              }, [
                vue.createElementVNode("navigator", {
                  onClick: ($event) => $setup.jumpGoods(item.id),
                  style: { "width": "100%", "height": "100%" }
                }, [
                  vue.createElementVNode("view", { style: { "width": "100%", "height": "calc(100% - 20px)" } }, [
                    vue.createElementVNode("image", {
                      style: { "width": "100%", "height": "100%" },
                      src: item.goods_images[0],
                      mode: "aspectFill",
                      class: "brand_goods_image"
                    }, null, 8, ["src"])
                  ]),
                  vue.createElementVNode(
                    "text",
                    { style: { "display": "block", "width": "100%", "text-align": "center", "font-weight": "900", "color": "#586f88" } },
                    vue.toDisplayString(item.name),
                    1
                    /* TEXT */
                  )
                ], 8, ["onClick"])
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        vue.createElementVNode("button", {
          class: "load_more",
          onClick: $setup.getBrandGoods
        }, "加载更多"),
        vue.createElementVNode("view", null, [
          vue.createCommentVNode(" 评论区 "),
          vue.createVNode(_component_comment_list, {
            ref: "commentListRef",
            type: 1,
            "relation-id": parseInt($setup.props.brand_id),
            onReply: $setup.handleReplyComment
          }, null, 8, ["relation-id"]),
          _ctx.loading ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "loading"
          }, "加载中...")) : vue.createCommentVNode("v-if", true),
          _ctx.error ? (vue.openBlock(), vue.createElementBlock(
            "view",
            {
              key: 1,
              class: "error"
            },
            vue.toDisplayString(_ctx.errorMsg),
            1
            /* TEXT */
          )) : vue.createCommentVNode("v-if", true)
        ])
      ]),
      vue.createCommentVNode(" 一个不可见透明元素，撑起80px高度 "),
      vue.createElementVNode("view", { style: { "height": "80px" } }),
      vue.createCommentVNode(" 评分悬浮窗 "),
      vue.createElementVNode(
        "view",
        {
          class: vue.normalizeClass(["modal_shadow", { none: !$setup.activeModal }]),
          onClick: _cache[2] || (_cache[2] = ($event) => $setup.openRate(2))
        },
        [
          vue.createElementVNode("view", { class: "modal_box" }, [
            vue.createElementVNode("view", null, [
              vue.createElementVNode(
                "text",
                { style: { "font-size": "25px", "color": "#7b6d6d", "width": "100%", "text-align": "center", "margin-bottom": "13px", "display": "block" } },
                "您的评分 " + vue.toDisplayString($setup.rateValue),
                1
                /* TEXT */
              ),
              vue.createVNode(_component_uni_rate, {
                modelValue: $setup.rateValue,
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.rateValue = $event),
                "allow-half": "true",
                style: { "margin-top": "5px", "float": "left" },
                size: "45"
              }, null, 8, ["modelValue"]),
              vue.createCommentVNode(' <text style="float: left;margin-left: 20px;position: relative;top: 5px;">触摸评分</text> ')
            ]),
            vue.createElementVNode("view", { style: { "clear": "both" } }),
            vue.createElementVNode("button", {
              style: { "display": "block", "width": "100px", "position": "absolute", "bottom": "0px", "right": "20px" },
              class: "light_button",
              onClick: $setup.voteScoreProxy
            }, [
              vue.createElementVNode("text", { style: { "color": "#fff" } }, "提交")
            ])
          ])
        ],
        2
        /* CLASS */
      ),
      vue.createCommentVNode(" 输入框 "),
      vue.createVNode(_component_comment_input, {
        ref: "commentInputRef",
        "reply-info": $setup.replyForItem,
        "target-id": $setup.props.brand_id,
        onSubmit: $setup.handleCommentSubmit,
        "onUpdate:replyInfo": _cache[3] || (_cache[3] = (val) => $setup.replyForItem = val)
      }, null, 8, ["reply-info", "target-id"])
    ]);
  }
  const PagesBrandBrand = /* @__PURE__ */ _export_sfc(_sfc_main$x, [["render", _sfc_render$w], ["__scopeId", "data-v-1a297a1d"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/brand/brand.vue"]]);
  const _sfc_main$w = {
    __name: "calendar",
    setup(__props, { expose: __expose }) {
      __expose();
      const tabList = vue.ref([
        "全部",
        "整体",
        "单头",
        "单体",
        "娃衣",
        "眼珠",
        "娃鞋",
        "手型",
        "脚型",
        "袜子",
        "配饰"
      ]);
      let activeType = vue.ref("全部");
      let originalNews = vue.ref({});
      let news = vue.ref({});
      const today = /* @__PURE__ */ new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      const todayFormat = `${year}-${month}-${day}`;
      const scrollView = vue.ref(null);
      const systemInfo2 = uni.getSystemInfoSync();
      const screenWidth = systemInfo2.screenWidth;
      const itemWidth = screenWidth / 7;
      let scrollLeft = vue.ref(0);
      const miniProgram = false;
      const statusBarHeight = vue.ref(systemInfo2.statusBarHeight);
      formatAppLog("log", "at pages/calendar/calendar.vue:138", "状态栏高度" + statusBarHeight.value);
      let chooseDate = vue.ref(todayFormat);
      let chooseItem = vue.ref({});
      uni.showLoading({
        title: "加载中"
      });
      const onShareAppMessage = () => ({
        title: "快来看娃圈上新！",
        path: "/pages/news/news",
        imageUrl: "/static/share",
        success(res) {
          formatAppLog("log", "at pages/calendar/calendar.vue:151", "分享成功", res);
        },
        fail(err) {
          formatAppLog("log", "at pages/calendar/calendar.vue:154", "分享失败", err);
        },
        mp: {
          wxpath: "/pages/news/news.html"
        }
      });
      function getDateMap() {
        uni.request({
          url: websiteUrl + `/goods-news`,
          method: "GET",
          timeout: 5e3,
          success: (res) => {
            formatAppLog("log", "at pages/calendar/calendar.vue:167", res.data.data);
            originalNews.value = res.data.data;
            news.value = filterNews("全部");
            for (let [key, value] of Object.entries(news.value)) {
              if (key === todayFormat) {
                chooseItem.value = value;
              }
            }
          },
          fail: (err) => {
            formatAppLog("log", "at pages/calendar/calendar.vue:179", err);
            uni.showToast({
              title: "网络请求失败",
              icon: "none"
            });
          },
          complete: () => {
            scrollLeft.value = itemWidth * 7 - 5;
            formatAppLog("log", "at pages/calendar/calendar.vue:187", "left:" + scrollLeft.value);
            uni.hideLoading();
          }
        });
      }
      function filterNews(type) {
        const filtered = {};
        Object.entries(originalNews.value).forEach(([date, info]) => {
          const copy = {
            ...info
          };
          if (copy.goods) {
            copy.goods = type === "全部" ? copy.goods : copy.goods.filter((g) => g.type === type);
            if (copy.goods.length === 0)
              copy.goods = null;
          }
          filtered[date] = copy;
        });
        return filtered;
      }
      const handleTabClick = (type) => {
        activeType.value = type;
        const filtered = filterNews(type);
        news.value = {
          ...filtered
        };
        const firstValidEntry = Object.entries(filtered).find(([_, v]) => v.goods);
        if (firstValidEntry) {
          chooseDate.value = firstValidEntry[0];
          chooseItem.value = firstValidEntry[1];
        } else {
          chooseItem.value = {
            goods: null
          };
        }
      };
      function selectDate(date, item) {
        formatAppLog("log", "at pages/calendar/calendar.vue:237", item);
        chooseDate.value = date;
        chooseItem.value = item;
      }
      function formatTimestamp(timestamp) {
        const date = new Date(timestamp * 1e3);
        const year2 = date.getFullYear();
        const month2 = (date.getMonth() + 1).toString().padStart(2, "0");
        const day2 = date.getDate().toString().padStart(2, "0");
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const seconds = date.getSeconds().toString().padStart(2, "0");
        return `${year2}-${month2}-${day2} ${hours}:${minutes}:${seconds}`;
      }
      function jumpGoods(id) {
        uni.navigateTo({
          url: "/pages/goods/goods?goods_id=" + id
        });
      }
      getDateMap();
      const __returned__ = { tabList, get activeType() {
        return activeType;
      }, set activeType(v) {
        activeType = v;
      }, get originalNews() {
        return originalNews;
      }, set originalNews(v) {
        originalNews = v;
      }, get news() {
        return news;
      }, set news(v) {
        news = v;
      }, today, year, month, day, todayFormat, scrollView, systemInfo: systemInfo2, screenWidth, itemWidth, get scrollLeft() {
        return scrollLeft;
      }, set scrollLeft(v) {
        scrollLeft = v;
      }, miniProgram, statusBarHeight, get chooseDate() {
        return chooseDate;
      }, set chooseDate(v) {
        chooseDate = v;
      }, get chooseItem() {
        return chooseItem;
      }, set chooseItem(v) {
        chooseItem = v;
      }, onShareAppMessage, getDateMap, filterNews, handleTabClick, selectDate, formatTimestamp, jumpGoods, ref: vue.ref, onMounted: vue.onMounted, get websiteUrl() {
        return websiteUrl;
      }, get wechatSignLogin() {
        return wechatSignLogin;
      }, get getUserInfo() {
        return getUserInfo;
      }, get global() {
        return global;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$v(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_common_search = resolveEasycom(vue.resolveDynamicComponent("common-search"), __easycom_2$2);
    const _component_common_page = resolveEasycom(vue.resolveDynamicComponent("common-page"), __easycom_1$4);
    return vue.openBlock(), vue.createElementBlock(
      vue.Fragment,
      null,
      [
        vue.createElementVNode("meta", {
          name: "theme-color",
          content: "rgb(185 195 253)"
        }),
        vue.createVNode(_component_common_page, { head_color: "rgb(185 195 253)" }, {
          default: vue.withCtx(() => [
            vue.createElementVNode("view", { class: "goods_renew_header_content" }, [
              vue.createElementVNode(
                "view",
                {
                  style: vue.normalizeStyle([{ "width": "80%", "margin": "40rpx auto 20rpx auto" }, $setup.miniProgram ? "width:500rpx; margin:20rpx 20rpx 0rpx 20rpx" : ""])
                },
                [
                  vue.createVNode(_component_common_search, { width: "560rpx" })
                ],
                4
                /* STYLE */
              ),
              vue.createElementVNode("scroll-view", {
                "scroll-x": "true",
                class: "choose_tab",
                "show-scrollbar": false
              }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.tabList, (item, index) => {
                    return vue.openBlock(), vue.createElementBlock("text", {
                      key: index,
                      class: vue.normalizeClass({ active: $setup.activeType === item }),
                      onClick: ($event) => $setup.handleTabClick(item)
                    }, vue.toDisplayString(item), 11, ["onClick"]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ]),
            vue.createElementVNode("view", { class: "content-box" }, [
              vue.createElementVNode("scroll-view", {
                class: "scroll-view_H",
                "scroll-x": "true",
                ref: "scrollView",
                "scroll-left": $setup.scrollLeft,
                "show-scrollbar": false
              }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.news, (item, date) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      key: item.id,
                      class: "scroll-view-item_H",
                      onClick: ($event) => $setup.selectDate(date, item)
                    }, [
                      item.goods_number > 0 ? (vue.openBlock(), vue.createElementBlock("view", { key: 0 }, [
                        item.weekday === "周日" || item.weekday === "周六" ? (vue.openBlock(), vue.createElementBlock(
                          "view",
                          {
                            key: 0,
                            class: "float-number-red"
                          },
                          vue.toDisplayString(item.goods_number),
                          1
                          /* TEXT */
                        )) : vue.createCommentVNode("v-if", true),
                        item.weekday !== "周日" && item.weekday !== "周六" ? (vue.openBlock(), vue.createElementBlock(
                          "view",
                          {
                            key: 1,
                            class: "float-number-blue"
                          },
                          vue.toDisplayString(item.goods_number),
                          1
                          /* TEXT */
                        )) : vue.createCommentVNode("v-if", true)
                      ])) : vue.createCommentVNode("v-if", true),
                      item.weekday === "周日" || item.weekday === "周六" ? (vue.openBlock(), vue.createElementBlock(
                        "text",
                        {
                          key: 1,
                          style: { "display": "block", "margin": "10px 0px 15px", "color": "#e65555" }
                        },
                        vue.toDisplayString(item.weekday),
                        1
                        /* TEXT */
                      )) : vue.createCommentVNode("v-if", true),
                      item.weekday !== "周日" && item.weekday !== "周六" ? (vue.openBlock(), vue.createElementBlock(
                        "text",
                        {
                          key: 2,
                          style: { "display": "block", "margin": "10px 0px 15px" }
                        },
                        vue.toDisplayString(item.weekday),
                        1
                        /* TEXT */
                      )) : vue.createCommentVNode("v-if", true),
                      $setup.chooseDate !== date ? (vue.openBlock(), vue.createElementBlock(
                        "text",
                        {
                          key: 3,
                          style: { "display": "block", "border-radius": "100%", "padding": "10px", "box-sizing": "border-box", "width": "60px", "height": "47px" }
                        },
                        vue.toDisplayString(item.day_number),
                        1
                        /* TEXT */
                      )) : (vue.openBlock(), vue.createElementBlock(
                        "text",
                        {
                          key: 4,
                          style: { "display": "block", "background": "#7dc3d3", "color": "#fff", "border-radius": "5px", "padding": "10px", "box-sizing": "border-box", "width": "60px", "height": "45px" }
                        },
                        vue.toDisplayString(item.day_number),
                        1
                        /* TEXT */
                      ))
                    ], 8, ["onClick"]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ], 8, ["scroll-left"]),
              vue.createElementVNode("view", { style: { "padding": "5px 0px" } }, [
                vue.createElementVNode(
                  "text",
                  {
                    class: "font-alimamashuhei",
                    style: { "color": "#7dc3d3", "margin": "15px 0px 15px 0px", "display": "block" }
                  },
                  vue.toDisplayString($setup.chooseDate) + " 日 星期" + vue.toDisplayString($setup.chooseItem.weekday) + "上新",
                  1
                  /* TEXT */
                ),
                $setup.chooseItem.goods == null ? (vue.openBlock(), vue.createElementBlock("view", { key: 0 }, [
                  vue.createElementVNode("text", null, "这天没有上新呢...")
                ])) : vue.createCommentVNode("v-if", true)
              ]),
              vue.createCommentVNode(" 遍历chooseItem.goods "),
              $setup.chooseItem.goods ? (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                { key: 0 },
                vue.renderList($setup.chooseItem.goods, (good) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    key: good.id,
                    style: { "margin": "10px 0px 10px 0px", "box-sizing": "border-box", "padding": "10px 0px" }
                  }, [
                    vue.createElementVNode("view", { style: { "width": "30vw", "float": "left", "position": "relative" } }, [
                      vue.createElementVNode("navigator", {
                        onClick: ($event) => $setup.jumpGoods(good.goods_id)
                      }, [
                        vue.createElementVNode("image", {
                          src: good.goods_image,
                          mode: "aspectFill",
                          style: { "width": "30vw", "height": "auto", "aspect-ratio": "1" }
                        }, null, 8, ["src"]),
                        vue.createElementVNode(
                          "text",
                          { style: { "left": "0px", "position": "absolute", "top": "5px", "width": "100px", "background": "rgb(82 104 138)", "color": "#fff", "text-align": "center", "opacity": "0.8", "font-size": "13px", "padding": "5rpx" } },
                          vue.toDisplayString(good.sale_type),
                          1
                          /* TEXT */
                        )
                      ], 8, ["onClick"])
                    ]),
                    vue.createElementVNode("view", {
                      class: "brand_goods_item",
                      style: { "width": "calc(70vw - 70px)", "float": "left", "margin-left": "15px" }
                    }, [
                      vue.createElementVNode("navigator", {
                        onClick: ($event) => $setup.jumpGoods(good.goods_id)
                      }, [
                        vue.createElementVNode(
                          "text",
                          { class: "font-alimamashuhei" },
                          vue.toDisplayString(good.brand_name) + " " + vue.toDisplayString(good.goods_name),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode("view", null, [
                          vue.createElementVNode(
                            "text",
                            { class: "line-height" },
                            vue.toDisplayString(good.size) + "·" + vue.toDisplayString(good.size_detail) + "·" + vue.toDisplayString(good.type),
                            1
                            /* TEXT */
                          )
                        ]),
                        vue.createElementVNode("view", null, [
                          vue.createElementVNode(
                            "text",
                            { class: "line-height" },
                            "开定时间 " + vue.toDisplayString($setup.formatTimestamp(good.sub_time)),
                            1
                            /* TEXT */
                          )
                        ]),
                        good.sale_type != "限量现货" && good.sale_type != "不限量现货" ? (vue.openBlock(), vue.createElementBlock("text", {
                          key: 0,
                          class: "line-height",
                          style: { "color": "rgb(255 150 178)" }
                        }, [
                          vue.createTextVNode(" 定金 "),
                          vue.createElementVNode(
                            "text",
                            { style: { "font-size": "25px", "color": "rgb(255 150 178)", "font-weight": "900" } },
                            vue.toDisplayString(good.sub_amount),
                            1
                            /* TEXT */
                          ),
                          vue.createTextVNode(
                            " (" + vue.toDisplayString(good.currency) + ") 尾款 ",
                            1
                            /* TEXT */
                          ),
                          vue.createElementVNode(
                            "text",
                            { style: { "color": "rgb(255 150 178)", "font-weight": "900" } },
                            vue.toDisplayString(good.fin_amount),
                            1
                            /* TEXT */
                          )
                        ])) : vue.createCommentVNode("v-if", true),
                        good.sale_type == "限量现货" || good.sale_type == "不限量现货" ? (vue.openBlock(), vue.createElementBlock("text", {
                          key: 1,
                          class: "line-height",
                          style: { "color": "rgb(255 150 178)" }
                        }, [
                          vue.createTextVNode(" 全款 "),
                          vue.createElementVNode(
                            "text",
                            { style: { "font-size": "25px", "color": "rgb(255 150 178)", "font-weight": "900" } },
                            vue.toDisplayString(good.sub_amount + good.fin_amount),
                            1
                            /* TEXT */
                          ),
                          vue.createTextVNode(
                            " (" + vue.toDisplayString(good.currency) + ") ",
                            1
                            /* TEXT */
                          )
                        ])) : vue.createCommentVNode("v-if", true)
                      ], 8, ["onClick"])
                    ]),
                    vue.createElementVNode("view", { style: { "clear": "both" } })
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              )) : vue.createCommentVNode("v-if", true)
            ])
          ]),
          _: 1
          /* STABLE */
        })
      ],
      64
      /* STABLE_FRAGMENT */
    );
  }
  const PagesCalendarCalendar = /* @__PURE__ */ _export_sfc(_sfc_main$w, [["render", _sfc_render$v], ["__scopeId", "data-v-6e8913ab"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/calendar/calendar.vue"]]);
  const systemInfo$1 = uni.getSystemInfoSync();
  function parseUnit(size) {
    if (typeof size == "number" || !isNaN(Number(size))) {
      return uni.upx2px(size);
    } else if (typeof size === "string") {
      if (size.endsWith("rpx")) {
        return parseUnit(size.replace("rpx", ""));
      } else if (size.endsWith("px")) {
        return Number(size.replace("px", ""));
      } else if (size.endsWith("vw")) {
        return Number(size.replace("vw", "")) * systemInfo$1.screenWidth / 100;
      } else if (size.endsWith("vh")) {
        return Number(size.replace("vh", "")) * systemInfo$1.screenHeight / 100;
      }
    }
    return 0;
  }
  const block0$2 = (Comp) => {
    (Comp.$wxs || (Comp.$wxs = [])).push("wxsModule");
    (Comp.$wxsModules || (Comp.$wxsModules = {}))["wxsModule"] = "8ab5efd6";
  };
  const _sfc_main$v = {
    name: "bt-cropper",
    props: {
      // 图片路径，支持网络路径和本地路径
      imageSrc: {
        type: String,
        default: "",
        required: true
      },
      mask: {
        type: String,
        default: ""
      },
      // 手动指定容器的大小
      containerSize: {
        type: Object,
        default: null
      },
      // 输出图片的格式，默认jpg
      fileType: {
        type: String,
        default: "png"
      },
      // 生成的图片的宽度,不传或者传0表示按照原始分辨率裁切
      dWidth: Number,
      maxWidth: {
        type: Number,
        default: 2e3
      },
      // 裁切比例，0表示自由
      ratio: {
        type: Number,
        default: 0,
        validator(value) {
          if (typeof value === "number") {
            if (value < 0) {
              return false;
            }
          } else {
            return false;
          }
          return true;
        }
      },
      // 旋转角度
      rotate: Number,
      // 是否展示网格
      showGrid: {
        type: Boolean,
        default: false
      },
      // 图片质量，0-1 越大质量越好
      quality: {
        type: Number,
        default: 1
      },
      canvas2d: {
        type: Boolean,
        default: false
      },
      // 初始的图片位置
      initPosition: {
        type: Object,
        default() {
          return null;
        }
      },
      // 是否开启操作结束后自动放大
      autoZoom: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        canvasId: "bt-cropper",
        containerRect: null,
        imageInfo: null,
        operationHistory: [],
        operationIndex: 0,
        anim: false,
        timer: null,
        // 是否使用2D canvas
        type2d: false,
        pixel: 1,
        imageRect: null,
        cropperRect: null,
        target: {
          width: 0,
          height: 0
        }
      };
    },
    watch: {
      imageSrc: {
        handler(src) {
          if (typeof src === "string" && src !== "") {
            this.imageInit(src);
          } else {
            this.imageInfo = null;
          }
        },
        immediate: true
      },
      ratio() {
        if (this.ratio != 0) {
          this.startAnim();
          this.init();
        }
      }
    },
    computed: {
      containerStyle() {
        if (this.containerSize && this.containerRect) {
          return {
            width: this.containerRect.width + "px",
            height: this.containerRect.height + "px"
          };
        }
        return {};
      },
      rotateAngle() {
        const angel = Number(this.rotate);
        if (isNaN(angel)) {
          return 0;
        } else {
          return angel % 360;
        }
      }
    },
    methods: {
      startAnim() {
        this.stopAnim();
        this.anim = true;
        this.timer = setTimeout(() => {
          this.anim = false;
        }, 200);
      },
      stopAnim() {
        this.anim = false;
        clearTimeout(this.timer);
      },
      imageInit(src) {
        uni.showLoading({
          title: "载入中..."
        });
        uni.getImageInfo({
          src,
          success: (res) => {
            this.imageInfo = res;
            this.$nextTick(() => {
              this.getContainer().then((rect) => {
                this.containerRect = rect;
                this.init();
              });
            });
          },
          fail: (err) => {
            this.$emit("loadFail", err);
            uni.showToast({
              title: "图片下载失败!",
              icon: "none"
            });
          },
          complete(res) {
            uni.hideLoading();
          }
        });
      },
      initCropper() {
        const imageRate = this.imageInfo.width / this.imageInfo.height;
        const containerRate = this.containerRect.width / this.containerRect.height;
        const imageRect = {};
        let cropperRate = this.ratio;
        if (cropperRate == 0) {
          if (this.cropperRect) {
            cropperRate = this.cropperRect.width / this.cropperRect.height;
          } else {
            cropperRate = 1;
          }
        }
        const cropperRect = {};
        if (containerRate > cropperRate) {
          cropperRect.height = this.containerRect.height * 0.85;
          cropperRect.width = cropperRect.height * cropperRate;
        } else {
          cropperRect.width = this.containerRect.width * 0.85;
          cropperRect.height = cropperRect.width / cropperRate;
        }
        if (cropperRate > imageRate) {
          imageRect.width = cropperRect.width;
          imageRect.height = imageRect.width / imageRate;
        } else {
          imageRect.height = cropperRect.height;
          imageRect.width = imageRect.height * imageRate;
        }
        imageRect.left = (this.containerRect.width - imageRect.width) / 2;
        imageRect.top = (this.containerRect.height - imageRect.height) / 2;
        cropperRect.left = imageRect.left + (imageRect.width - cropperRect.width) / 2;
        cropperRect.top = imageRect.top + (imageRect.height - cropperRect.height) / 2;
        return {
          imageRect,
          cropperRect
        };
      },
      init() {
        const { imageRect, cropperRect } = this.initCropper();
        if (this.initPosition) {
          const scale = this.imageInfo.width / imageRect.width;
          const { left, top, width, height } = this.initPosition;
          if (left !== void 0 && top !== void 0 && width !== void 0 && height !== void 0) {
            cropperRect.width = width / scale;
            cropperRect.height = height / scale;
            cropperRect.left = left / scale;
            cropperRect.top = top / scale;
            this.$nextTick(this.zoomToFill);
          }
        }
        this.imageRect = imageRect;
        this.cropperRect = cropperRect;
        this.operationHistory = [{ imageRect, cropperRect }];
        this.operationIndex = 0;
        this.setTarget();
        this.type2d = false;
      },
      // 设置目标图像的大小
      setTarget() {
        const ratio = this.cropperRect.width / this.cropperRect.height;
        if (!!this.dWidth) {
          this.target = {
            width: this.dWidth,
            height: this.dWidth / (ratio || 1)
          };
        } else {
          const width = Math.min(this.maxWidth, this.cropperRect.width * (this.imageInfo.width / this.imageRect.width));
          this.target = {
            width,
            height: width / (ratio || 1)
          };
        }
      },
      addHistory({ imageRect, cropperRect }) {
        if (this.operationIndex !== this.operationHistory.length - 1) {
          this.operationHistory = this.operationHistory.slice(0, this.operationIndex);
        }
        this.operationHistory.push({
          imageRect,
          cropperRect
        });
        if (this.operationHistory.length > 10) {
          this.operationHistory.shift();
        }
        this.operationIndex = this.operationHistory.length - 1;
      },
      updateData(data) {
        this.imageRect = data.imageRect;
        this.cropperRect = data.cropperRect;
        this.addHistory(data);
        this.setTarget();
        if (this.autoZoom) {
          this.timer = setTimeout(() => {
            this.zoomToFill();
          }, 600);
        }
        const { imageRect, cropperRect } = data;
        const scale = imageRect.width / this.imageInfo.width;
        this.$emit("change", {
          left: (cropperRect.left - imageRect.left) / scale,
          top: (cropperRect.top - imageRect.top) / scale,
          width: cropperRect.width / scale,
          height: cropperRect.height / scale
        });
      },
      getContainer() {
        if (this.containerSize !== null && typeof this.containerSize == "object") {
          const { width, height } = this.containerSize;
          return Promise.resolve({
            width: parseUnit(width),
            height: parseUnit(height)
          });
        } else {
          return new Promise((resolve) => {
            const query = uni.createSelectorQuery().in(this);
            query.select(".mainContent").boundingClientRect((rect) => {
              resolve(rect);
            }).exec();
          });
        }
      },
      zoomToFill() {
        this.startAnim();
        const beforeCropper = {
          ...this.cropperRect
        };
        ({
          imageRect: this.imageRect,
          cropperRect: this.cropperRect
        });
        this.cropperRect = this.initCropper().cropperRect;
        const scale = this.cropperRect.width / beforeCropper.width;
        const ox = beforeCropper.left - this.imageRect.left;
        const oy = beforeCropper.top - this.imageRect.top;
        this.imageRect = {
          width: this.imageRect.width * scale,
          height: this.imageRect.height * scale,
          left: this.imageRect.left + (this.cropperRect.left - beforeCropper.left) - (scale - 1) * ox,
          top: this.imageRect.top + (this.cropperRect.top - beforeCropper.top) - (scale - 1) * oy
        };
      },
      onTouchStart() {
        this.stopAnim();
      },
      // 撤销
      undo() {
        if (this.operationIndex > 0) {
          this.operationIndex--;
          this.imageRect = this.operationHistory[this.operationIndex].imageRect;
          this.cropperRect = this.operationHistory[this.operationIndex].cropperRect;
          return true;
        }
        return false;
      },
      // 重做
      resume() {
        if (this.operationIndex < this.operationHistory.length - 1) {
          this.operationIndex++;
          this.imageRect = this.operationHistory[this.operationIndex].imageRect;
          this.cropperRect = this.operationHistory[this.operationIndex].cropperRect;
          return true;
        }
        return false;
      },
      async drawImage(ctx, image, x, y, w, h) {
        if (this.type2d) {
          await new Promise((resolve) => image.onload = resolve);
          ctx.drawImage(image, x * this.pixel, y * this.pixel, w * this.pixel, h * this.pixel);
        } else {
          const path = await new Promise((resolve) => {
            uni.getImageInfo({
              src: image,
              success({ path: path2 }) {
                resolve(path2);
              }
            });
          });
          ctx.drawImage(path, x * this.pixel, y * this.pixel, w * this.pixel, h * this.pixel);
          await new Promise((resolve) => ctx.draw(false, resolve));
        }
      },
      async crop() {
        let ctx;
        let canvas;
        this.$emit("cropStart");
        this.setTarget();
        if (this.type2d) {
          const query = uni.createSelectorQuery().in(this);
          canvas = await new Promise(
            (resolve) => query.select(".bt-canvas").node(({ node: node2 }) => resolve(node2)).exec()
          );
          canvas.width = this.target.width * this.pixel;
          canvas.height = this.target.height * this.pixel;
          ctx = canvas.getContext("2d");
        } else {
          ctx = uni.createCanvasContext(this.canvasId, this);
        }
        const scale = this.cropperRect.width / this.target.width;
        const dx = (this.cropperRect.left - this.imageRect.left) / scale;
        const dy = (this.cropperRect.top - this.imageRect.top) / scale;
        let image;
        if (this.type2d) {
          image = canvas.createImage();
          image.src = this.imageSrc;
        } else {
          image = this.imageSrc;
        }
        const x = -dx, y = -dy, w = this.imageRect.width / scale, h = this.imageRect.height / scale;
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);
        ctx.rotate(this.rotateAngle * Math.PI / 180);
        ctx.translate(-(x + w / 2), -(y + h / 2));
        await this.drawImage(ctx, image, x, y, w, h);
        ctx.restore();
        if (this.mask !== "") {
          let imageData;
          if (this.type2d) {
            imageData = ctx.getImageData(0, 0, this.target.width, this.target.height);
          } else {
            imageData = await new Promise((resolve) => {
              uni.canvasGetImageData({
                canvasId: this.canvasId,
                x: 0,
                y: 0,
                width: this.target.width,
                height: this.target.height,
                success(res) {
                  resolve(res);
                }
              }, this);
            });
          }
          ctx.clearRect(0, 0, this.target.width, this.target.height);
          if (this.type2d) {
            image.src = this.mask;
          } else {
            image = this.mask;
          }
          await this.drawImage(ctx, image, 0, 0, this.target.width, this.target.height);
          let maskData;
          if (this.type2d) {
            maskData = ctx.getImageData(0, 0, this.target.width, this.target.height);
          } else {
            maskData = await new Promise((resolve, reject) => {
              uni.canvasGetImageData({
                canvasId: this.canvasId,
                x: 0,
                y: 0,
                width: this.target.width,
                height: this.target.height,
                success(res) {
                  resolve(res);
                }
              }, this);
            });
          }
          ctx.clearRect(0, 0, this.target.width, this.target.height);
          for (let index = 3; index < maskData.data.length; index += 4) {
            const alpha = maskData.data[index];
            if (alpha !== 0) {
              imageData.data[index] = 0;
            }
          }
          if (this.type2d) {
            ctx.putImageData(imageData, 0, 0);
          } else {
            await new Promise((resolve) => {
              uni.canvasPutImageData({
                canvasId: this.canvasId,
                x: 0,
                y: 0,
                width: imageData.width,
                height: imageData.height,
                data: imageData.data,
                complete: (res) => {
                  resolve(res);
                }
              }, this);
            });
          }
        }
        return new Promise((resolve, reject) => {
          const params = {};
          if (this.type2d) {
            params.canvas = canvas;
          } else {
            params.canvasId = this.canvasId;
          }
          uni.canvasToTempFilePath({
            ...params,
            destWidth: this.target.width,
            destHeight: this.target.height,
            quality: Number(this.quality) || 1,
            fileType: this.fileType,
            success: ({ tempFilePath }) => {
              resolve(tempFilePath);
            },
            fail(err) {
              formatAppLog("log", "at uni_modules/bt-cropper/components/bt-cropper/bt-cropper.vue:593", "保存失败，错误信息：", err);
              reject(err);
            }
          }, this);
        });
      }
    }
  };
  function _sfc_render$u(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: "bt-container",
        style: vue.normalizeStyle([$options.containerStyle])
      },
      [
        vue.createElementVNode(
          "view",
          {
            class: "mainContent",
            "data-type": "image",
            onTouchstart: _cache[8] || (_cache[8] = (...args) => _ctx.wxsModule.touchStart && _ctx.wxsModule.touchStart(...args)),
            onTouchmove: _cache[9] || (_cache[9] = (...args) => _ctx.wxsModule.touchMove && _ctx.wxsModule.touchMove(...args)),
            onTouchend: _cache[10] || (_cache[10] = (...args) => _ctx.wxsModule.touchEnd && _ctx.wxsModule.touchEnd(...args))
          },
          [
            $data.imageRect && $data.cropperRect ? (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              { key: 0 },
              [
                vue.createElementVNode("image", {
                  mode: "aspectFit",
                  src: $props.imageSrc,
                  class: vue.normalizeClass(["image", { anim: $data.anim }]),
                  rotateAngle: vue.wp($options.rotateAngle),
                  "change:rotateAngle": _ctx.wxsModule.changeRotateAngle,
                  "change:imageRect": _ctx.wxsModule.changeImageRect,
                  imageRect: vue.wp($data.imageRect)
                }, null, 10, ["src", "rotateAngle", "change:rotateAngle", "change:imageRect", "imageRect"]),
                vue.createElementVNode("view", {
                  class: vue.normalizeClass(["cropper", { anim: $data.anim }]),
                  "change:cropperRect": _ctx.wxsModule.changeCropper,
                  cropperRect: vue.wp($data.cropperRect),
                  "change:ratio": _ctx.wxsModule.changeRatio,
                  ratio: vue.wp($props.ratio)
                }, [
                  vue.createElementVNode("image", {
                    class: "mask",
                    src: $props.mask
                  }, null, 8, ["src"]),
                  $props.showGrid ? (vue.openBlock(), vue.createElementBlock(
                    vue.Fragment,
                    { key: 0 },
                    [
                      vue.createElementVNode("view", { class: "line row row1" }),
                      vue.createElementVNode("view", { class: "line row row2" }),
                      vue.createElementVNode("view", { class: "line col col1" }),
                      vue.createElementVNode("view", { class: "line col col2" })
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : vue.createCommentVNode("v-if", true),
                  vue.createElementVNode(
                    "view",
                    {
                      class: "controller vertical left",
                      onTouchstart: _cache[0] || (_cache[0] = (...args) => _ctx.wxsModule.touchStart && _ctx.wxsModule.touchStart(...args)),
                      "data-type": "controller"
                    },
                    null,
                    32
                    /* NEED_HYDRATION */
                  ),
                  vue.createElementVNode(
                    "view",
                    {
                      class: "controller vertical right",
                      onTouchstart: _cache[1] || (_cache[1] = (...args) => _ctx.wxsModule.touchStart && _ctx.wxsModule.touchStart(...args)),
                      "data-type": "controller"
                    },
                    null,
                    32
                    /* NEED_HYDRATION */
                  ),
                  vue.createElementVNode(
                    "view",
                    {
                      class: "controller horizon top",
                      onTouchstart: _cache[2] || (_cache[2] = (...args) => _ctx.wxsModule.touchStart && _ctx.wxsModule.touchStart(...args)),
                      "data-type": "controller"
                    },
                    null,
                    32
                    /* NEED_HYDRATION */
                  ),
                  vue.createElementVNode(
                    "view",
                    {
                      class: "controller horizon bottom",
                      onTouchstart: _cache[3] || (_cache[3] = (...args) => _ctx.wxsModule.touchStart && _ctx.wxsModule.touchStart(...args)),
                      "data-type": "controller"
                    },
                    null,
                    32
                    /* NEED_HYDRATION */
                  ),
                  vue.createElementVNode(
                    "view",
                    {
                      class: "controller left top",
                      onTouchstart: _cache[4] || (_cache[4] = (...args) => _ctx.wxsModule.touchStart && _ctx.wxsModule.touchStart(...args)),
                      "data-type": "controller"
                    },
                    null,
                    32
                    /* NEED_HYDRATION */
                  ),
                  vue.createElementVNode(
                    "view",
                    {
                      class: "controller left bottom",
                      onTouchstart: _cache[5] || (_cache[5] = (...args) => _ctx.wxsModule.touchStart && _ctx.wxsModule.touchStart(...args)),
                      "data-type": "controller"
                    },
                    null,
                    32
                    /* NEED_HYDRATION */
                  ),
                  vue.createElementVNode(
                    "view",
                    {
                      class: "controller right top",
                      onTouchstart: _cache[6] || (_cache[6] = (...args) => _ctx.wxsModule.touchStart && _ctx.wxsModule.touchStart(...args)),
                      "data-type": "controller"
                    },
                    null,
                    32
                    /* NEED_HYDRATION */
                  ),
                  vue.createElementVNode(
                    "view",
                    {
                      class: "controller right bottom",
                      onTouchstart: _cache[7] || (_cache[7] = (...args) => _ctx.wxsModule.touchStart && _ctx.wxsModule.touchStart(...args)),
                      "data-type": "controller"
                    },
                    null,
                    32
                    /* NEED_HYDRATION */
                  )
                ], 10, ["change:cropperRect", "cropperRect", "change:ratio", "ratio"])
              ],
              64
              /* STABLE_FRAGMENT */
            )) : vue.createCommentVNode("v-if", true)
          ],
          32
          /* NEED_HYDRATION */
        ),
        $data.type2d ? (vue.openBlock(), vue.createElementBlock("canvas", {
          key: 0,
          type: "2d",
          class: "bt-canvas",
          width: $data.target.width,
          height: $data.target.height
        }, null, 8, ["width", "height"])) : (vue.openBlock(), vue.createElementBlock("canvas", {
          key: 1,
          "canvas-id": $data.canvasId,
          class: "bt-canvas",
          style: vue.normalizeStyle({
            width: $data.target.width + "px",
            height: $data.target.height + "px"
          }),
          width: $data.target.width * $data.pixel,
          height: $data.target.height * $data.pixel
        }, null, 12, ["canvas-id", "width", "height"]))
      ],
      4
      /* STYLE */
    );
  }
  if (typeof block0$2 === "function")
    block0$2(_sfc_main$v);
  const __easycom_0$3 = /* @__PURE__ */ _export_sfc(_sfc_main$v, [["render", _sfc_render$u], ["__scopeId", "data-v-51ff46c2"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/uni_modules/bt-cropper/components/bt-cropper/bt-cropper.vue"]]);
  const _sfc_main$u = {
    data() {
      return {
        imageSrc: "",
        // mask: "https://vkceyugu.cdn.bspapp.com/VKCEYUGU-a3b890b4-7cb2-4b29-aa78-e652572bdef6/d6bc69ee-cdc0-4a13-a744-d79db42e0dbe.png",
        dist: "",
        mask: "",
        ratio: 1,
        // 如果在弹窗中使用，必须手动指定裁剪器的大小
        containerSize: {
          width: 600,
          height: 600
        },
        // 保存操作后的状态以供下次编辑
        initPosition: null
      };
    },
    onLoad(options) {
      this.imageSrc = decodeURIComponent(options.src);
    },
    onPullDownRefresh() {
      uni.stopPullDownRefresh();
    },
    methods: {
      openPopup() {
        this.$refs.pop.open();
      },
      change() {
        uni.chooseImage({
          count: 1,
          sizeType: ["original"],
          success: (res) => {
            let tempFilePaths = res.tempFilePaths[0];
            this.src = tempFilePaths;
            this.initPosition = null;
          }
        });
      },
      close() {
        this.$refs.pop.close();
      },
      onChange(ev) {
        this.initPosition = ev;
      },
      // 撤销
      undo() {
        this.$refs.cropper.undo();
      },
      // 重做
      resume() {
        this.$refs.cropper.resume();
      },
      crop() {
        this.$refs.cropper.crop().then((res) => {
          this.dist = res;
          const pages = getCurrentPages();
          const parentPage = pages[pages.length - 2];
          formatAppLog("log", "at pages/pop_croper/pop_croper.vue:82", parentPage);
          parentPage.returnParam = res;
          uni.navigateBack({
            delta: 1
          });
        });
      }
    }
  };
  function _sfc_render$t(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_bt_cropper = resolveEasycom(vue.resolveDynamicComponent("bt-cropper"), __easycom_0$3);
    const _component_uni_popup = vue.resolveComponent("uni-popup");
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(' <image v-if="dist" :src="dist" class="dist" mode="widthFix"></image> '),
      vue.createVNode(
        _component_uni_popup,
        { ref: "pop" },
        {
          default: vue.withCtx(() => [
            vue.createElementVNode("view", { class: "content" }, [
              vue.createCommentVNode(' <view @click="close" class="close">X</view> '),
              vue.createVNode(_component_bt_cropper, {
                ref: "cropper",
                imageSrc: $data.imageSrc,
                mask: $data.mask,
                ratio: $data.ratio,
                initPosition: $data.initPosition,
                dWidth: 800,
                fileType: "png",
                containerSize: $data.containerSize,
                onChange: $options.onChange
              }, null, 8, ["imageSrc", "mask", "ratio", "initPosition", "containerSize", "onChange"]),
              vue.createElementVNode("view", { class: "btns" }, [
                vue.createCommentVNode(' <button class="button" @click="change">换张图</button> '),
                vue.createElementVNode("button", {
                  class: "button",
                  onClick: _cache[0] || (_cache[0] = (...args) => $options.crop && $options.crop(...args))
                }, "裁剪"),
                vue.createElementVNode("button", {
                  class: "button",
                  onClick: _cache[1] || (_cache[1] = (...args) => $options.undo && $options.undo(...args))
                }, "撤销"),
                vue.createCommentVNode(' <button class="button" @click="resume">重做</button> ')
              ])
            ])
          ]),
          _: 1
          /* STABLE */
        },
        512
        /* NEED_PATCH */
      ),
      vue.createCommentVNode(' <button @click="openPopup">打开编辑器</button> ')
    ]);
  }
  const PagesPopCroperPopCroper = /* @__PURE__ */ _export_sfc(_sfc_main$u, [["render", _sfc_render$t], ["__scopeId", "data-v-ec2e1a43"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/pop_croper/pop_croper.vue"]]);
  const _sfc_main$t = {
    __name: "setting",
    setup(__props, { expose: __expose }) {
      __expose();
      uni.setNavigationBarTitle({
        title: "设置"
      });
      const menuItems = vue.computed(() => [
        {
          label: "更改用户名",
          action: jump2username,
          status: !!global.userInfo.password,
          displayValue: global.userInfo.password ? "去修改" : "未设置"
        },
        {
          label: "更改密码",
          action: jump2password,
          status: !!global.userInfo.password,
          displayValue: global.userInfo.password ? "去修改" : "未设置"
        },
        {
          label: "绑定手机号",
          action: jump2telphone,
          status: !!global.userInfo.tel_phone,
          // 修正字段名
          displayValue: global.userInfo.tel_phone ? global.userInfo.tel_phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2") : "去绑定"
        },
        {
          label: "绑定微信",
          action: jump2wechat,
          status: !!global.userInfo.wechat_open_id,
          displayValue: global.userInfo.wechat_open_id ? "已绑定" : "去绑定"
        },
        {
          label: "检查更新",
          action: checkUpdate,
          status: false,
          displayValue: "无需更新"
        }
      ]);
      let userInfo = vue.ref({});
      let needUpdate = vue.ref(false);
      function jump2password() {
        uni.navigateTo({
          url: "/pages/setting/password/password"
        });
      }
      function jump2telphone() {
        uni.navigateTo({
          url: "/pages/setting/tel_phone/tel_phone"
        });
      }
      function jump2username() {
        uni.navigateTo({
          url: "/pages/setting/username/username"
        });
      }
      function jump2wechat() {
        if (global.userInfo.wechat_open_id) {
          uni.showToast({ title: "已绑定微信", icon: "none" });
        } else {
          wechatSignLogin().then((res) => {
            uni.showToast({ title: "绑定成功" });
            getUserInfo();
          });
        }
      }
      function checkUpdate() {
        if (uni.getSystemInfoSync().platform === "app") {
          const version = plus.runtime.version;
          formatAppLog("log", "at pages/setting/setting.vue:108", "App version from manifest:", version);
        } else {
          uni.showToast({
            title: "您所使用的平台无需更新",
            icon: "none"
          });
        }
      }
      getUserInfo();
      const __returned__ = { menuItems, get userInfo() {
        return userInfo;
      }, set userInfo(v) {
        userInfo = v;
      }, get needUpdate() {
        return needUpdate;
      }, set needUpdate(v) {
        needUpdate = v;
      }, jump2password, jump2telphone, jump2username, jump2wechat, checkUpdate, ref: vue.ref, computed: vue.computed, get websiteUrl() {
        return websiteUrl;
      }, get wechatSignLogin() {
        return wechatSignLogin;
      }, get getUserInfo() {
        return getUserInfo;
      }, get global() {
        return global;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$s(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "settings-container" }, [
      vue.createCommentVNode(" 统一item结构 "),
      (vue.openBlock(true), vue.createElementBlock(
        vue.Fragment,
        null,
        vue.renderList($setup.menuItems, (item, index) => {
          return vue.openBlock(), vue.createElementBlock("view", {
            key: index,
            class: "menu-item",
            onClick: ($event) => item.action(item)
          }, [
            vue.createElementVNode(
              "text",
              { class: "menu-label" },
              vue.toDisplayString(item.label),
              1
              /* TEXT */
            ),
            vue.createElementVNode("view", { class: "menu-value" }, [
              vue.createElementVNode(
                "text",
                {
                  class: vue.normalizeClass(item.status ? "active" : "inactive")
                },
                vue.toDisplayString(item.displayValue),
                3
                /* TEXT, CLASS */
              ),
              vue.createElementVNode("image", {
                class: "arrow-icon",
                src: _imports_0$2
              })
            ])
          ], 8, ["onClick"]);
        }),
        128
        /* KEYED_FRAGMENT */
      ))
    ]);
  }
  const PagesSettingSetting = /* @__PURE__ */ _export_sfc(_sfc_main$t, [["render", _sfc_render$s], ["__scopeId", "data-v-018cdf56"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/setting/setting.vue"]]);
  const _sfc_main$s = {
    __name: "password",
    setup(__props, { expose: __expose }) {
      __expose();
      uni.setNavigationBarTitle({
        title: "设置密码"
      });
      let oldPassword = vue.ref("");
      let newPassword = vue.ref("");
      let newPassword2 = vue.ref("");
      const isFormValid = vue.computed(() => {
        return newPassword.value && newPassword2.value && newPassword.value === newPassword2.value;
      });
      const strengthText = vue.computed(() => {
        if (newPassword.value.length < 6) {
          return "密码过于简单";
        } else if (newPassword.value.length < 10) {
          return "密码强度一般";
        } else {
          return "密码强度较高";
        }
      });
      const getStrengthClass = (level) => {
        if (newPassword.value.length < 6) {
          return "weak";
        } else if (newPassword.value.length < 10) {
          return "medium";
        } else {
          return "strong";
        }
      };
      function updatePassword() {
        if (newPassword.value != newPassword2.value) {
          uni.showToast({
            title: "两次密码输入不一致",
            icon: "none"
          });
          return;
        }
        if (!global.userInfo.password && !oldPassword.value) {
          uni.showToast({
            title: "请输入原密码",
            icon: "none"
          });
          return;
        }
        uni.request({
          url: websiteUrl + "/with-state/setting-password",
          method: "POST",
          header: {
            "Authorization": uni.getStorageSync("token")
          },
          data: {
            old_password: oldPassword.value,
            new_password: newPassword.value
          },
          success: (res) => {
            formatAppLog("log", "at pages/setting/password/password.vue:133", res.data);
            if (res.data.status == "success") {
              uni.showToast({
                title: "修改成功",
                icon: "success"
              });
            } else {
              uni.showToast({
                title: res.data.msg,
                icon: "none"
              });
            }
          }
        });
      }
      getUserInfo();
      const __returned__ = { get oldPassword() {
        return oldPassword;
      }, set oldPassword(v) {
        oldPassword = v;
      }, get newPassword() {
        return newPassword;
      }, set newPassword(v) {
        newPassword = v;
      }, get newPassword2() {
        return newPassword2;
      }, set newPassword2(v) {
        newPassword2 = v;
      }, isFormValid, strengthText, getStrengthClass, updatePassword, ref: vue.ref, computed: vue.computed, get websiteUrl() {
        return websiteUrl;
      }, get wechatSignLogin() {
        return wechatSignLogin;
      }, get getUserInfo() {
        return getUserInfo;
      }, get global() {
        return global;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$r(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$6);
    return vue.openBlock(), vue.createElementBlock("view", { class: "password-container" }, [
      vue.createElementVNode("view", { class: "form-wrapper" }, [
        $setup.global.userInfo.password ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "input-group"
        }, [
          vue.createElementVNode("view", { class: "input-item" }, [
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "input",
                type: "password",
                placeholder: " ",
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.oldPassword = $event)
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.oldPassword]
            ]),
            vue.createElementVNode("label", { class: "floating-label" }, "原密码"),
            vue.createVNode(_component_uni_icons, {
              class: "input-icon",
              type: "locked",
              size: "18",
              color: "#999"
            })
          ]),
          vue.createElementVNode("view", { class: "input-item" }, [
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "input",
                type: "password",
                placeholder: " ",
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.newPassword = $event)
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.newPassword]
            ]),
            vue.createElementVNode("label", { class: "floating-label" }, "新密码"),
            vue.createVNode(_component_uni_icons, {
              class: "input-icon",
              type: "gear",
              size: "18",
              color: "#999"
            })
          ]),
          vue.createElementVNode("view", { class: "input-item" }, [
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "input",
                type: "password",
                placeholder: " ",
                "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $setup.newPassword2 = $event)
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.newPassword2]
            ]),
            vue.createElementVNode("label", { class: "floating-label" }, "确认新密码"),
            vue.createVNode(_component_uni_icons, {
              class: "input-icon",
              type: "checkmarkempty",
              size: "18",
              color: "#999"
            })
          ])
        ])) : (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "input-group"
        }, [
          vue.createElementVNode("view", { class: "input-item" }, [
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "input",
                type: "password",
                placeholder: " ",
                "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $setup.newPassword = $event)
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.newPassword]
            ]),
            vue.createElementVNode("label", { class: "floating-label" }, "设置密码"),
            vue.createVNode(_component_uni_icons, {
              class: "input-icon",
              type: "locked",
              size: "18",
              color: "#999"
            })
          ]),
          vue.createElementVNode("view", { class: "input-item" }, [
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "input",
                type: "password",
                placeholder: " ",
                "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => $setup.newPassword2 = $event)
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.newPassword2]
            ]),
            vue.createElementVNode("label", { class: "floating-label" }, "确认密码"),
            vue.createVNode(_component_uni_icons, {
              class: "input-icon",
              type: "checkmarkempty",
              size: "18",
              color: "#999"
            })
          ])
        ])),
        $setup.newPassword ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 2,
          class: "password-strength"
        }, [
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["strength-bar", $setup.getStrengthClass(1)])
            },
            null,
            2
            /* CLASS */
          ),
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["strength-bar", $setup.getStrengthClass(2)])
            },
            null,
            2
            /* CLASS */
          ),
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["strength-bar", $setup.getStrengthClass(3)])
            },
            null,
            2
            /* CLASS */
          ),
          vue.createElementVNode(
            "text",
            { class: "strength-text" },
            vue.toDisplayString($setup.strengthText),
            1
            /* TEXT */
          )
        ])) : vue.createCommentVNode("v-if", true),
        vue.createElementVNode("button", {
          class: vue.normalizeClass(["submit-btn", { active: $setup.isFormValid }]),
          onClick: $setup.updatePassword,
          disabled: !$setup.isFormValid
        }, vue.toDisplayString($setup.global.userInfo.password ? "更新密码" : "设置密码"), 11, ["disabled"])
      ]),
      vue.createElementVNode("view", { class: "security-tips" }, [
        vue.createVNode(_component_uni_icons, {
          type: "info",
          size: "16",
          color: "#666"
        }),
        vue.createElementVNode("text", null, "建议使用8位以上包含字母和数字的组合")
      ])
    ]);
  }
  const PagesSettingPasswordPassword = /* @__PURE__ */ _export_sfc(_sfc_main$s, [["render", _sfc_render$r], ["__scopeId", "data-v-b825db0b"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/setting/password/password.vue"]]);
  const _sfc_main$r = {
    __name: "tel_phone",
    setup(__props, { expose: __expose }) {
      __expose();
      uni.setNavigationBarTitle({
        title: "手机号"
      });
      let telPhone = vue.ref("");
      let code = vue.ref("");
      let buttonMsg = vue.ref("发送验证码");
      function updateTelPhone() {
        uni.request({
          url: websiteUrl + "/with-state/update-profile",
          method: "POST",
          header: {
            "Authorization": uni.getStorageSync("token")
          },
          data: {
            tel_phone: telPhone.value,
            code: code.value
          },
          success: (res) => {
            formatAppLog("log", "at pages/setting/tel_phone/tel_phone.vue:57", res.data);
            if (res.data.status == "success") {
              uni.showToast({
                title: "修改成功",
                icon: "success"
              });
              getUserInfo();
            } else {
              uni.showToast({
                title: res.data.msg,
                icon: "none"
              });
            }
          }
        });
      }
      function sendCode() {
        if (buttonMsg.value != "发送验证码") {
          uni.showToast({
            title: "请点击发送验证码",
            icon: "none"
          });
          return;
        }
        if (telPhone.value == "" || telPhone.value == "") {
          uni.showToast({
            title: "请输入手机号和密码",
            icon: "none"
          });
          return;
        }
        if (!/^1[3456789]\d{9}$/.test(telPhone.value)) {
          uni.showToast({
            title: "手机号格式错误",
            icon: "none"
          });
          return;
        }
        buttonMsg.value = "发送中";
        uni.request({
          url: websiteUrl + "/send-sms-code",
          method: "POST",
          header: {
            "Authorization": uni.getStorageSync("token")
          },
          data: {
            tel_phone: telPhone.value
          },
          success: (res) => {
            formatAppLog("log", "at pages/setting/tel_phone/tel_phone.vue:110", res.data);
            if (res.data.status == "success") {
              buttonMsg.value = "已发送";
              uni.showToast({
                title: "发送成功",
                icon: "success"
              });
            } else {
              uni.showToast({
                title: res.data.msg,
                icon: "none"
              });
              buttonMsg.value = "发送验证码";
            }
          }
        });
      }
      getUserInfo();
      const __returned__ = { get telPhone() {
        return telPhone;
      }, set telPhone(v) {
        telPhone = v;
      }, get code() {
        return code;
      }, set code(v) {
        code = v;
      }, get buttonMsg() {
        return buttonMsg;
      }, set buttonMsg(v) {
        buttonMsg = v;
      }, updateTelPhone, sendCode, ref: vue.ref, get websiteUrl() {
        return websiteUrl;
      }, get wechatSignLogin() {
        return wechatSignLogin;
      }, get getUserInfo() {
        return getUserInfo;
      }, get global() {
        return global;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$q(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { style: { "padding": "15px" } }, [
      $setup.global.userInfo.tel_phone ? (vue.openBlock(), vue.createElementBlock("view", { key: 0 }, [
        vue.createElementVNode("input", {
          type: "text",
          class: "inputer",
          value: $setup.global.userInfo.tel_phone,
          disabled: ""
        }, null, 8, ["value"]),
        vue.createElementVNode("text", { style: { "padding": "10px", "font-size": "20px", "color": "rgb(190 190 190)" } }, "已绑定，如需修改请联系管理员操作。")
      ])) : (vue.openBlock(), vue.createElementBlock("view", { key: 1 }, [
        vue.withDirectives(vue.createElementVNode(
          "input",
          {
            class: "inputer",
            type: "text",
            placeholder: "请输入手机号",
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.telPhone = $event)
          },
          null,
          512
          /* NEED_PATCH */
        ), [
          [vue.vModelText, $setup.telPhone]
        ]),
        vue.createElementVNode("view", { style: { "position": "relative" } }, [
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              class: "inputer",
              type: "text",
              placeholder: "请输入验证码",
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.code = $event)
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $setup.code]
          ]),
          vue.createElementVNode("button", {
            style: { "position": "absolute", "right": "0px", "width": "110px", "font-size": "16px", "bottom": "10px" },
            onClick: $setup.sendCode
          }, [
            vue.createElementVNode(
              "text",
              null,
              vue.toDisplayString($setup.buttonMsg),
              1
              /* TEXT */
            )
          ])
        ])
      ])),
      !$setup.global.userInfo.tel_phone ? (vue.openBlock(), vue.createElementBlock("button", {
        key: 2,
        class: "light_button",
        onClick: $setup.updateTelPhone
      }, "提交")) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesSettingTelPhoneTelPhone = /* @__PURE__ */ _export_sfc(_sfc_main$r, [["render", _sfc_render$q], ["__scopeId", "data-v-25dd367f"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/setting/tel_phone/tel_phone.vue"]]);
  function chooseImage() {
    return new Promise((resolve) => {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          resolve(res.tempFilePaths[0]);
        }
      });
    });
  }
  function chooseImageList(count = 9) {
    return new Promise((resolve, reject) => {
      uni.chooseImage({
        count,
        success: (res) => {
          resolve(res.tempFilePaths);
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  }
  function jumpToCroper() {
    chooseImage().then((src) => {
      uni.navigateTo({
        url: `/pages/pop_croper/pop_croper?src=${decodeURIComponent(src)}`
      });
    });
  }
  function getQiniuToken() {
    return new Promise((resolve, reject) => {
      let token = uni.getStorageSync("token");
      uni.request({
        url: websiteUrl + "/with-state/qiniu-token",
        method: "POST",
        header: {
          "Authorization": token
        },
        success: (res) => {
          if (res.data.data && res.data.data.token) {
            formatAppLog("log", "at common/image.js:54", "获取到的七牛token：" + res.data.data.token);
            resolve(res.data.data);
          } else {
            uni.showToast({
              title: "获取上传凭证失败",
              icon: "none"
            });
            reject("获取上传凭证失败");
          }
        },
        fail: (err) => {
          uni.showToast({
            title: "获取上传凭证失败",
            icon: "none"
          });
          reject("获取上传凭证失败");
        }
      });
    });
  }
  function uploadImageToQiniu(croperPath, qnToken, fileName) {
    let authorization = uni.getStorageSync("token");
    return new Promise((resolve, reject) => {
      uni.uploadFile({
        url: "https://up-cn-east-2.qiniup.com",
        name: "file",
        method: "POST",
        filePath: croperPath,
        fileType: "image",
        formData: {
          token: qnToken,
          key: fileName,
          scope: "hobby-box:" + fileName
        },
        success: async (res) => {
          try {
            const fullUrl = image1Url + fileName;
            const logRes = await uni.request({
              url: `${websiteUrl}/with-state/add-image-log`,
              method: "POST",
              header: {
                "Content-Type": "application/json",
                "Authorization": authorization
              },
              data: {
                image_url: fullUrl
              }
            });
            formatAppLog("log", "at common/image.js:108", logRes);
            if (logRes.data.status !== "success") {
              throw new Error("上传图片失败");
            }
            resolve({ qiniuRes: res, imageUrl: fullUrl });
          } catch (logErr) {
            formatAppLog("error", "at common/image.js:115", "日志记录失败:", logErr);
            uni.showToast({
              title: "日志记录失败",
              icon: "none"
            });
            reject("日志记录失败");
          }
        },
        fail: (err) => {
          uni.showToast({
            title: "上传失败",
            icon: "none"
          });
          reject("上传失败");
        }
      });
    });
  }
  const _imports_0$1 = "/static/info-circle.png";
  const _sfc_main$q = {
    __name: "account_book_form",
    props: ["account_book_id"],
    setup(__props, { expose: __expose }) {
      __expose();
      const props = __props;
      const isEdit = props.account_book_id ? true : false;
      const systemInfo2 = uni.getSystemInfoSync();
      const statusBarHeight = vue.ref(systemInfo2.statusBarHeight);
      let name = vue.ref("");
      let price = vue.ref("");
      const activeTab = vue.ref(1);
      function switch_tab(index) {
        activeTab.value = index;
        formatAppLog("log", "at pages/stock/account_book_form/account_book_form.vue:156", `切换到 tab ${index}`);
      }
      const typeModalVisible = vue.ref(false);
      const newTypeName = vue.ref("");
      const customTypes = vue.ref([]);
      const defaultTypes = ["请选择", "娃衣", "娃头", "眼珠", "假发", "娃鞋", "其它"];
      const typeOptions = vue.computed(() => [
        ...defaultTypes,
        ...customTypes.value.map((t) => t.name)
      ]);
      const form = vue.ref({
        isRemind: false,
        finalPrice: 0,
        finalTime: ""
      });
      const getAccountTypes = async () => {
        const token = uni.getStorageSync("token");
        try {
          const res = await uni.request({
            url: websiteUrl + "/with-state/account-types",
            method: "GET",
            header: {
              "Authorization": token
            }
          });
          customTypes.value = res.data.data || [];
        } catch (err) {
          formatAppLog("error", "at pages/stock/account_book_form/account_book_form.vue:190", "获取分类失败:", err);
        }
      };
      const addNewType = async () => {
        if (!newTypeName.value.trim()) {
          uni.showToast({
            title: "请输入分类名称",
            icon: "none"
          });
          return;
        }
        const token = uni.getStorageSync("token");
        try {
          await uni.request({
            url: websiteUrl + "/with-state/add-account-type",
            method: "POST",
            header: {
              "Authorization": token
            },
            data: {
              name: newTypeName.value.trim()
            }
          });
          await getAccountTypes();
          newTypeName.value = "";
          uni.showToast({
            title: "添加成功"
          });
        } catch (err) {
          uni.showToast({
            title: "添加失败",
            icon: "none"
          });
        }
      };
      const deleteType = async (id) => {
        uni.showModal({
          title: "确认删除",
          // content: '如果该分类下存在物品，则不可以直接删除分类',
          success: async (res) => {
            if (res.confirm) {
              const token = uni.getStorageSync("token");
              try {
                const response = await uni.request({
                  url: websiteUrl + "/with-state/delete-account-type",
                  method: "POST",
                  header: {
                    "Authorization": token,
                    "Content-Type": "application/json"
                    // 添加Content-Type
                  },
                  data: { id }
                  // 使用JSON格式传参
                });
                const resData = response.data;
                if (resData.status === "success") {
                  await getAccountTypes();
                  uni.showToast({ title: "删除成功" });
                } else {
                  uni.showToast({
                    title: resData.msg || "删除失败",
                    icon: "none"
                  });
                }
              } catch (err) {
                formatAppLog("error", "at pages/stock/account_book_form/account_book_form.vue:260", "删除失败:", err);
                uni.showToast({
                  title: err.errMsg || "请求失败",
                  icon: "none"
                });
              }
            }
          }
        });
      };
      const toggleRemind = () => {
        form.value.isRemind = !form.value.isRemind;
        if (!form.value.isRemind) {
          form.value.finalPrice = 0;
          form.value.finalTime = "";
        }
      };
      const selectedType = vue.ref(0);
      const accountBookTypeList = vue.ref(["请选择", "娃衣", "娃头", "眼珠", "假发", "娃鞋", "其它"]);
      const accountBookData = vue.ref({});
      const accountImage = vue.ref("");
      function updateSelectedType(e) {
        selectedType.value = e.detail.value;
      }
      function getAccountBookById(id) {
        let token = uni.getStorageSync("token");
        uni.request({
          url: websiteUrl + "/with-state/account-book-detail",
          method: "GET",
          header: {
            "Authorization": token
          },
          data: {
            id
          },
          success: (res) => {
            formatAppLog("log", "at pages/stock/account_book_form/account_book_form.vue:313", res.data.data);
            name.value = res.data.data.name;
            price.value = parseInt(res.data.data.price);
            selectedType.value = typeOptions.value.indexOf(res.data.data.type);
            accountImage.value = res.data.data.image_url;
            form.value = {
              isRemind: res.data.data.is_remind,
              finalPrice: res.data.data.final_price,
              finalTime: res.data.data.final_time
            };
            formatAppLog("log", "at pages/stock/account_book_form/account_book_form.vue:324", "f:", form);
          },
          fail: (err) => {
            formatAppLog("log", "at pages/stock/account_book_form/account_book_form.vue:327", err);
          }
        });
      }
      const handleGoodsSelect = async (goods2) => {
        var _a;
        try {
          const res = await uni.request({
            url: websiteUrl + `/goods?id=${goods2.id}`,
            method: "GET"
          });
          if (res.data.status === "success") {
            const detail = res.data.data;
            name.value = detail.name;
            price.value = detail.fin_amount + detail.sub_amount;
            if ((_a = detail.goods_images) == null ? void 0 : _a[0]) {
              accountImage.value = detail.goods_images[0];
            }
          }
        } catch (error) {
          formatAppLog("error", "at pages/stock/account_book_form/account_book_form.vue:351", "获取商品详情失败:", error);
          uni.showToast({
            title: "获取商品信息失败",
            icon: "none"
          });
        }
      };
      function handleDelete() {
        uni.showModal({
          title: "提示",
          content: "确定删除该账本吗？",
          success: (res) => {
            if (res.confirm) {
              const id = Number(props.account_book_id);
              if (isNaN(id) || id <= 0) {
                uni.showToast({ title: "参数错误", icon: "none" });
                return;
              }
              uni.request({
                url: websiteUrl + "/with-state/delete-account-book",
                method: "POST",
                header: {
                  "Authorization": uni.getStorageSync("token"),
                  "Content-Type": "application/json"
                  // 添加Content-Type
                },
                data: { id },
                // 改为JSON格式传参
                success: (res2) => {
                  formatAppLog("log", "at pages/stock/account_book_form/account_book_form.vue:384", res2.data.status);
                  if (res2.data.status === "success") {
                    uni.showToast({ title: "删除成功", icon: "success" });
                    setTimeout(() => uni.navigateBack(), 500);
                  } else {
                    uni.showToast({
                      title: res2.data.msg || "删除失败",
                      icon: "none"
                    });
                  }
                },
                fail: (err) => {
                  formatAppLog("error", "at pages/stock/account_book_form/account_book_form.vue:396", "请求失败:", err);
                  uni.showToast({ title: "网络错误", icon: "none" });
                }
              });
            }
          }
        });
      }
      function selectImage() {
        chooseImage().then((res) => {
          getQiniuToken().then((tokenData) => {
            formatAppLog("log", "at pages/stock/account_book_form/account_book_form.vue:408", tokenData);
            uploadImageToQiniu(res, tokenData.token, tokenData.path).then((uploadRes) => {
              if (uploadRes.statusCode != 200) {
                uni.showToast({
                  title: "上传失败",
                  icon: "none"
                });
              }
              formatAppLog("log", "at pages/stock/account_book_form/account_book_form.vue:417", image1Url + tokenData.path);
              accountImage.value = image1Url + tokenData.path;
              uni.showToast({
                title: "上传成功",
                icon: "success"
              });
            });
          });
        });
      }
      asyncGetUserInfo().then((userInfo) => {
        if (isEdit) {
          getAccountBookById(props.account_book_id);
          uni.setNavigationBarTitle({
            title: "编辑账本"
          });
        } else {
          uni.setNavigationBarTitle({
            title: "新增账本"
          });
        }
      });
      function postSubmit() {
        if (!validateForm())
          return;
        if (isEdit) {
          updateAccountBook();
        } else {
          addAccountBook();
        }
      }
      const validateForm = () => {
        if (form.value.isRemind) {
          if (!form.value.finalPrice || form.value.finalPrice <= 0) {
            uni.showToast({
              title: "请输入正确的尾款金额",
              icon: "none"
            });
            return false;
          }
          if (!form.value.finalTime || new Date(form.value.finalTime) < /* @__PURE__ */ new Date()) {
            uni.showToast({
              title: "请选择未来的日期",
              icon: "none"
            });
            return false;
          }
        }
        return true;
      };
      function addAccountBook() {
        let postData = {
          name: name.value,
          price: parseInt(price.value, 10),
          type: typeOptions.value[selectedType.value],
          // 使用合并后的分类列表
          image_url: accountImage.value,
          is_remind: form.value.isRemind,
          final_price: parseInt(form.value.finalPrice, 10),
          final_time: form.value.finalTime
        };
        formatAppLog("log", "at pages/stock/account_book_form/account_book_form.vue:493", "提交数据:", postData);
        uni.request({
          url: websiteUrl + "/with-state/add-account-book",
          method: "POST",
          header: {
            "Authorization": uni.getStorageSync("token")
          },
          data: postData,
          success: (res) => {
            formatAppLog("log", "at pages/stock/account_book_form/account_book_form.vue:503", res.data);
            if (res.data.status == "success") {
              uni.showToast({
                title: "提交成功",
                icon: "success"
              });
              setTimeout(() => {
                uni.navigateBack();
              }, 500);
            } else {
              uni.showToast({
                title: res.data.msg,
                icon: "none"
              });
            }
          }
        });
      }
      function updateAccountBook() {
        let postData = {
          name: name.value,
          price: parseInt(price.value, 10),
          type: typeOptions.value[selectedType.value],
          // 使用合并后的分类列表
          image_url: accountImage.value,
          id: parseInt(props.account_book_id, 10),
          is_remind: form.value.isRemind,
          // 转换为数据库需要的格式
          final_price: parseInt(form.value.finalPrice, 10),
          final_time: form.value.finalTime
        };
        uni.request({
          url: websiteUrl + "/with-state/update-account-book",
          method: "POST",
          header: {
            "Authorization": uni.getStorageSync("token")
          },
          data: postData,
          success: (res) => {
            formatAppLog("log", "at pages/stock/account_book_form/account_book_form.vue:544", res.data);
            if (res.data.status == "success") {
              uni.showToast({
                title: "提交成功",
                icon: "success"
              });
              setTimeout(() => {
                uni.navigateBack();
              }, 500);
            } else {
              uni.showToast({
                title: res.data.msg,
                icon: "none"
              });
            }
          }
        });
      }
      onShow(() => {
        asyncGetUserInfo().then(() => {
          getAccountTypes();
        });
      });
      const __returned__ = { props, isEdit, systemInfo: systemInfo2, statusBarHeight, get name() {
        return name;
      }, set name(v) {
        name = v;
      }, get price() {
        return price;
      }, set price(v) {
        price = v;
      }, activeTab, switch_tab, typeModalVisible, newTypeName, customTypes, defaultTypes, typeOptions, form, getAccountTypes, addNewType, deleteType, toggleRemind, selectedType, accountBookTypeList, accountBookData, accountImage, updateSelectedType, getAccountBookById, handleGoodsSelect, handleDelete, selectImage, postSubmit, validateForm, addAccountBook, updateAccountBook, ref: vue.ref, computed: vue.computed, onMounted: vue.onMounted, get onShow() {
        return onShow;
      }, get websiteUrl() {
        return websiteUrl;
      }, get image1Url() {
        return image1Url;
      }, get wechatSignLogin() {
        return wechatSignLogin;
      }, get getUserInfo() {
        return getUserInfo;
      }, get global() {
        return global;
      }, get asyncGetUserInfo() {
        return asyncGetUserInfo;
      }, get chooseImage() {
        return chooseImage;
      }, get jumpToCroper() {
        return jumpToCroper;
      }, get getQiniuToken() {
        return getQiniuToken;
      }, get uploadImageToQiniu() {
        return uploadImageToQiniu;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$p(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$6);
    const _component_common_modal = resolveEasycom(vue.resolveDynamicComponent("common-modal"), __easycom_2$1);
    const _component_goods_search = resolveEasycom(vue.resolveDynamicComponent("goods-search"), __easycom_1$6);
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("meta", {
        name: "theme-color",
        content: "#F8F8F8"
      }),
      vue.createCommentVNode(" 分类管理弹窗 "),
      vue.createVNode(_component_common_modal, {
        visible: $setup.typeModalVisible,
        "onUpdate:visible": _cache[1] || (_cache[1] = (val) => $setup.typeModalVisible = val),
        top: "5%",
        height: "60%"
      }, {
        default: vue.withCtx(() => [
          vue.createElementVNode("view", { class: "type-modal" }, [
            vue.createElementVNode("view", { class: "add-type-form" }, [
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.newTypeName = $event),
                  placeholder: "输入新分类名称",
                  class: "type-input"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $setup.newTypeName]
              ]),
              vue.createElementVNode("button", {
                class: "add-btn",
                onClick: $setup.addNewType
              }, "添加分类")
            ]),
            vue.createElementVNode("view", { class: "type-list" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.customTypes, (type, index) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    key: type.id,
                    class: "type-item"
                  }, [
                    vue.createElementVNode(
                      "text",
                      null,
                      vue.toDisplayString(type.name),
                      1
                      /* TEXT */
                    ),
                    vue.createVNode(_component_uni_icons, {
                      type: "trash",
                      size: "22",
                      color: "#ff6666",
                      onClick: ($event) => $setup.deleteType(type.id)
                    }, null, 8, ["onClick"])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ]),
        _: 1
        /* STABLE */
      }, 8, ["visible"]),
      vue.createCommentVNode(" 表单卡片容器 "),
      vue.createElementVNode("view", { class: "form-card" }, [
        vue.createCommentVNode(" 分类选择 "),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "form-label" }, "分类"),
          vue.createElementVNode("view", { class: "type-selector" }, [
            vue.createElementVNode("picker", {
              mode: "selector",
              class: "form-input",
              value: $setup.selectedType,
              range: $setup.typeOptions,
              onChange: $setup.updateSelectedType
            }, [
              vue.createElementVNode(
                "view",
                { class: "picker-content" },
                vue.toDisplayString($setup.typeOptions[$setup.selectedType] || "请选择分类"),
                1
                /* TEXT */
              )
            ], 40, ["value", "range"]),
            vue.createElementVNode("text", {
              class: "manage-type",
              onClick: _cache[2] || (_cache[2] = ($event) => $setup.typeModalVisible = true)
            }, "管理分类")
          ])
        ]),
        vue.createCommentVNode(" 名称 "),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "form-label" }, "名称"),
          vue.createElementVNode("view", {
            class: "form-input",
            style: { "padding": "0" }
          }, [
            vue.createVNode(_component_goods_search, {
              "font-size": "24rpx",
              mode: "fill",
              onSelect: $setup.handleGoodsSelect,
              modelValue: $setup.name,
              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $setup.name = $event),
              background: "#fff",
              width: "640rpx",
              "show-icon": false,
              class: "custom-search"
            }, null, 8, ["modelValue"])
          ])
        ]),
        vue.createCommentVNode(" 价值 "),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "form-label" }, "价值"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              class: "form-input",
              type: "digit",
              placeholder: "请输入价值",
              "placeholder-class": "placeholder-style",
              "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => $setup.price = $event)
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $setup.price]
          ])
        ]),
        vue.createCommentVNode(" 图片上传 "),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "form-label" }, "物品图片"),
          vue.createElementVNode("view", { class: "upload-wrapper" }, [
            $setup.accountImage ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "preview-image",
              onClick: vue.withModifiers($setup.selectImage, ["stop"])
            }, [
              vue.createElementVNode("image", {
                mode: "aspectFill",
                src: $setup.accountImage,
                class: "image-preview"
              }, null, 8, ["src"]),
              vue.createElementVNode("text", { class: "image-tip" }, "点击更换图片")
            ])) : (vue.openBlock(), vue.createElementBlock("button", {
              key: 1,
              class: "upload-button",
              onClick: $setup.selectImage
            }, [
              vue.createElementVNode("text", { class: "iconfont icon-camera" }),
              vue.createTextVNode(" 选择图片 ")
            ]))
          ])
        ]),
        vue.createCommentVNode(" 补款提醒 "),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("label", {
            class: "remind-label",
            onClick: _cache[5] || (_cache[5] = ($event) => $setup.toggleRemind())
          }, [
            !$setup.form.isRemind ? (vue.openBlock(), vue.createBlock(_component_uni_icons, {
              key: 0,
              type: "right",
              size: "20",
              color: "#888"
            })) : (vue.openBlock(), vue.createBlock(_component_uni_icons, {
              key: 1,
              type: "down",
              size: "20",
              color: "#888"
            })),
            vue.createElementVNode("text", null, "需要补款提醒"),
            vue.createCommentVNode(" 新增小红点 "),
            $setup.form.finalPrice > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 2,
              class: "remind-dot"
            })) : vue.createCommentVNode("v-if", true)
          ])
        ]),
        $setup.form.isRemind ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "remind-form",
          style: { "margin-bottom": "40rpx" }
        }, [
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, "尾款金额"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                type: "number",
                "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => $setup.form.finalPrice = $event),
                placeholder: "请输入待补款金额",
                class: "form-input"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.form.finalPrice]
            ])
          ]),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, "补款日期"),
            vue.createElementVNode("picker", {
              mode: "date",
              value: $setup.form.finalTime,
              onChange: _cache[7] || (_cache[7] = ($event) => $setup.form.finalTime = $event.detail.value),
              class: "form-input"
            }, [
              vue.createElementVNode(
                "view",
                { class: "picker-content" },
                vue.toDisplayString($setup.form.finalTime || "选择截止日期"),
                1
                /* TEXT */
              )
            ], 40, ["value"])
          ])
        ])) : vue.createCommentVNode("v-if", true),
        vue.createElementVNode("view", { style: { "overflow": "hidden" } }, [
          vue.createElementVNode("image", {
            src: _imports_0$1,
            mode: "aspectFill",
            style: { "width": "28rpx", "height": "28rpx", "margin-right": "10rpx", "position": "relative", "top": "3rpx" }
          }),
          vue.createElementVNode("text", { style: { "color": "#888" } }, "仅用于记录您所购买过的物品，其他人不会看到")
        ]),
        vue.createCommentVNode(" 操作按钮 "),
        vue.createElementVNode("view", { class: "button-group" }, [
          $setup.isEdit ? (vue.openBlock(), vue.createElementBlock("button", {
            key: 0,
            class: "delete-button",
            onClick: $setup.handleDelete
          }, " 删除账本 ")) : vue.createCommentVNode("v-if", true),
          vue.createElementVNode(
            "button",
            {
              class: "submit-button",
              onClick: $setup.postSubmit
            },
            " 记录" + vue.toDisplayString($setup.isEdit ? "修改" : "新增"),
            1
            /* TEXT */
          )
        ])
      ])
    ]);
  }
  const PagesStockAccountBookFormAccountBookForm = /* @__PURE__ */ _export_sfc(_sfc_main$q, [["render", _sfc_render$p], ["__scopeId", "data-v-0299c5b6"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/stock/account_book_form/account_book_form.vue"]]);
  const _sfc_main$p = {
    __name: "common-name-picker",
    props: {
      dataList: {
        type: Array,
        default: () => []
      },
      placeholder: {
        type: String,
        default: "请选择"
      }
    },
    emits: ["select"],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const props = __props;
      const emit = __emit;
      const isOpen = vue.ref(false);
      const selectedValue = vue.ref("");
      const toggleOpen = () => {
        isOpen.value = !isOpen.value;
      };
      const selectItem = (item) => {
        selectedValue.value = item;
        isOpen.value = false;
        emit("select", item);
      };
      const __returned__ = { props, emit, isOpen, selectedValue, toggleOpen, selectItem, ref: vue.ref };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$o(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: "select-container",
        ref: "containerRef"
      },
      [
        vue.createElementVNode(
          "view",
          {
            class: "select-input",
            onClick: $setup.toggleOpen
          },
          vue.toDisplayString($setup.selectedValue || $props.placeholder),
          1
          /* TEXT */
        ),
        vue.createVNode(vue.Transition, { name: "slide-fade" }, {
          default: vue.withCtx(() => [
            $setup.isOpen ? (vue.openBlock(), vue.createElementBlock("view", { key: 0 }, [
              vue.createCommentVNode(" 添加遮罩层 "),
              vue.createElementVNode("view", {
                class: "mask",
                onClick: _cache[0] || (_cache[0] = ($event) => $setup.isOpen = false)
              }),
              vue.createElementVNode("view", { class: "options-wrapper" }, [
                vue.createElementVNode("ul", { class: "select-options" }, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList($props.dataList, (item, index) => {
                      return vue.openBlock(), vue.createElementBlock("li", {
                        key: index,
                        class: "option-item",
                        onClick: ($event) => $setup.selectItem(item)
                      }, vue.toDisplayString(item), 9, ["onClick"]);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ])) : vue.createCommentVNode("v-if", true)
          ]),
          _: 1
          /* STABLE */
        })
      ],
      512
      /* NEED_PATCH */
    );
  }
  const __easycom_1$1 = /* @__PURE__ */ _export_sfc(_sfc_main$p, [["render", _sfc_render$o], ["__scopeId", "data-v-c7d66d43"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/components/common-name-picker/common-name-picker.vue"]]);
  const _sfc_main$o = {
    __name: "custom-picker",
    props: {
      dataList: {
        type: Array,
        required: true
      },
      margin: {
        type: String,
        default: "0"
      }
    },
    emits: ["select"],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const props = __props;
      const emit = __emit;
      const inputValue = vue.ref("");
      const isOpen = vue.ref(false);
      const filteredList = vue.computed(() => {
        return props.dataList.filter(
          (item) => item.name.toLowerCase().includes(inputValue.value.toLowerCase())
        );
      });
      const callbackValue = () => {
        emit("select", 0, inputValue.value);
      };
      const toggleOpen = () => {
        isOpen.value = !isOpen.value;
      };
      const selectOption = (item) => {
        inputValue.value = item.name;
        isOpen.value = false;
        emit("select", item.id, item.name);
      };
      const __returned__ = { props, emit, inputValue, isOpen, filteredList, callbackValue, toggleOpen, selectOption, ref: vue.ref, computed: vue.computed };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$n(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "custom-select" }, [
      vue.withDirectives(vue.createElementVNode(
        "input",
        {
          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.inputValue = $event),
          onClick: $setup.toggleOpen,
          onInput: $setup.callbackValue,
          placeholder: "请选择或输入",
          class: "select-input",
          style: vue.normalizeStyle({ margin: $props.margin })
        },
        null,
        36
        /* STYLE, NEED_HYDRATION */
      ), [
        [vue.vModelText, $setup.inputValue]
      ]),
      vue.createVNode(vue.Transition, { name: "slide-fade" }, {
        default: vue.withCtx(() => [
          $setup.isOpen ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "dropdown"
          }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.filteredList, (item) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: item.id,
                  onClick: ($event) => $setup.selectOption(item),
                  class: "dropdown-item"
                }, vue.toDisplayString(item.name), 9, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])) : vue.createCommentVNode("v-if", true)
        ]),
        _: 1
        /* STABLE */
      })
    ]);
  }
  const __easycom_3 = /* @__PURE__ */ _export_sfc(_sfc_main$o, [["render", _sfc_render$n], ["__scopeId", "data-v-edb43aad"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/components/custom-picker/custom-picker.vue"]]);
  const _sfc_main$n = {
    __name: "relation-picker",
    props: {
      typeList: {
        type: Array,
        default: () => []
      },
      visible: {
        type: Boolean,
        default: false
      }
    },
    emits: [
      "update:visible",
      "confirm",
      "cancel"
    ],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const props = __props;
      const emit = __emit;
      const goodsList = vue.ref([]);
      const typePicker = vue.ref();
      const brandSearch = vue.ref();
      const goodsPicker = vue.ref();
      const fuzzySearch = vue.ref();
      const internalVisible = vue.ref(false);
      const isFuzzyMode = vue.ref(true);
      const selectedData = vue.ref({
        type: null,
        brand: {
          id: 0,
          name: ""
        },
        goods: {
          id: 0,
          name: "",
          image: ""
        }
      });
      const searchKeyword = vue.ref("");
      const switchMode = (isFuzzy) => {
        isFuzzyMode.value = isFuzzy;
        resetAllComponents();
        selectedData.value = {
          type: null,
          brand: {
            id: 0,
            name: ""
          },
          goods: {
            id: 0,
            name: "",
            image: ""
          }
        };
      };
      const handleComponentToggle = (component) => {
        const components = {
          type: typePicker,
          brand: brandSearch,
          goods: goodsPicker,
          fuzzy: fuzzySearch
        };
        Object.entries(components).forEach(([key, ref]) => {
          var _a;
          if (key !== component && ((_a = ref.value) == null ? void 0 : _a.close)) {
            ref.value.close();
          }
        });
      };
      const resetAllComponents = () => {
        [typePicker, brandSearch, goodsPicker, fuzzySearch].forEach((comp) => {
          var _a;
          if ((_a = comp.value) == null ? void 0 : _a.reset)
            comp.value.reset();
        });
      };
      const handleFuzzySelect = async (goods2) => {
        var _a;
        try {
          if (!(goods2 == null ? void 0 : goods2.id)) {
            searchKeyword.value = goods2.name;
            selectedData.value = {
              type: "未知类型",
              brand: {
                id: 0,
                name: ""
              },
              goods: {
                id: 0,
                name: goods2.name,
                image: ""
              }
            };
            return;
          }
          const detail = await getGoodsInfo(goods2.id);
          searchKeyword.value = goods2.name;
          selectedData.value = {
            type: detail.type || "未知类型",
            brand: {
              id: detail.brand_id || 0,
              name: detail.brand_name || ""
            },
            goods: {
              id: goods2.id,
              name: goods2.name,
              image: ((_a = detail == null ? void 0 : detail.goods_images) == null ? void 0 : _a[0]) || ""
            }
          };
        } catch (error) {
          formatAppLog("error", "at components/relation-picker/relation-picker.vue:202", "商品信息获取失败", error);
          uni.showToast({
            title: "详细信息获取失败，已保存基本信息",
            icon: "none"
          });
          searchKeyword.value = goods2.name;
          selectedData.value = {
            type: "未知类型",
            brand: {
              id: 0,
              name: ""
            },
            goods: {
              id: (goods2 == null ? void 0 : goods2.id) || 0,
              name: goods2.name,
              image: ""
            }
          };
        }
      };
      const closePicker = () => {
        internalVisible.value = false;
        searchKeyword.value = "";
        resetAllComponents();
        vue.nextTick(() => {
          selectedData.value = {
            type: null,
            brand: {
              id: 0,
              name: ""
            },
            goods: {
              id: 0,
              name: "",
              image: ""
            }
          };
        });
      };
      vue.watch(() => props.visible, (val) => {
        internalVisible.value = val;
      });
      vue.watch(internalVisible, (val) => {
        emit("update:visible", val);
      });
      const handleModalVisibilityChange = (newVal) => {
        internalVisible.value = newVal;
        if (!newVal) {
          closePicker();
        }
      };
      const handleTypeSelect = (type) => {
        selectedData.value.type = type;
      };
      const getGoodsInfo = (id) => {
        return new Promise((resolve, reject) => {
          uni.request({
            url: websiteUrl + "/goods?id=" + id,
            method: "GET",
            timeout: 5e3,
            success: (res) => {
              resolve(res.data.data);
            },
            fail: (err) => {
              formatAppLog("error", "at components/relation-picker/relation-picker.vue:286", "商品详情获取失败", err);
              reject(err);
            }
          });
        });
      };
      const handleBrandSelect = (id, name) => {
        selectedData.value.brand = {
          id: id || 0,
          name
        };
        if (id)
          getGoods(id);
      };
      const handleGoodsSelect = async (id, name) => {
        var _a;
        try {
          selectedData.value.goods = {
            // 先设置默认值
            id: id || 0,
            name,
            image: ""
          };
          if (id && id !== 0) {
            const detail = await getGoodsInfo(id);
            selectedData.value.goods.image = ((_a = detail == null ? void 0 : detail.goods_images) == null ? void 0 : _a[0]) || "";
          }
        } catch (error) {
          formatAppLog("error", "at components/relation-picker/relation-picker.vue:352", "商品信息获取失败", error);
          uni.showToast({
            title: "图片信息获取失败，已保存基本信息",
            icon: "none"
          });
        }
      };
      function getGoods(id) {
        uni.request({
          url: websiteUrl + "/goods-name-list?id=" + id,
          method: "GET",
          timeout: 5e3,
          success: (res) => {
            formatAppLog("log", "at components/relation-picker/relation-picker.vue:367", res.data.data);
            goodsList.value = res.data.data;
            formatAppLog("log", "at components/relation-picker/relation-picker.vue:369", goodsList.value);
          },
          fail: (err) => {
            formatAppLog("log", "at components/relation-picker/relation-picker.vue:373", err);
            uni.showToast({
              title: "网络请求失败",
              icon: "none"
            });
          }
        });
      }
      const handleConfirm = async () => {
        var _a, _b;
        try {
          let result = null;
          if (isFuzzyMode.value) {
            if (selectedData.value.goods.id && selectedData.value.goods.id !== 0) {
              try {
                const detail = await getGoodsInfo(selectedData.value.goods.id);
                result = {
                  isFuzzy: true,
                  keyword: searchKeyword.value,
                  goods: {
                    id: detail.id || selectedData.value.goods.id,
                    name: detail.goods_name || selectedData.value.goods.name,
                    image: ((_a = detail == null ? void 0 : detail.goods_images) == null ? void 0 : _a[0]) || ""
                  },
                  brand: {
                    id: detail.brand_id || 0,
                    name: detail.brand_name || ""
                  },
                  // 添加默认类型
                  type: detail.type || "未知类型"
                  // 确保这里使用默认值
                };
              } catch (error) {
                formatAppLog("error", "at components/relation-picker/relation-picker.vue:435", "商品信息获取失败，使用缓存数据", error);
                result = {
                  isFuzzy: true,
                  keyword: searchKeyword.value,
                  goods: selectedData.value.goods,
                  brand: selectedData.value.brand,
                  // 确保这里使用默认值
                  type: selectedData.value.type || "未知类型"
                };
              }
            } else {
              result = {
                isFuzzy: true,
                keyword: searchKeyword.value,
                goods: {
                  id: 0,
                  name: searchKeyword.value,
                  image: ""
                },
                brand: {
                  id: 0,
                  name: ""
                },
                // 明确设置默认类型
                type: "未知类型"
              };
            }
          } else {
            formatAppLog("log", "at components/relation-picker/relation-picker.vue:465", "jjjjjjjjjjjjjjjj");
            if (selectedData.value.goods.id && selectedData.value.goods.id !== 0) {
              try {
                const detail = await getGoodsInfo(selectedData.value.goods.id);
                selectedData.value.goods.image = ((_b = detail == null ? void 0 : detail.goods_images) == null ? void 0 : _b[0]) || "";
                selectedData.value.type = detail.type || selectedData.value.type;
              } catch (error) {
                formatAppLog("error", "at components/relation-picker/relation-picker.vue:474", "商品信息获取失败，使用缓存数据", error);
              }
            }
            if (!selectedData.value.type)
              throw new Error("请选择商品类型");
            if (!selectedData.value.brand.name)
              throw new Error("请填写或选择品牌");
            if (!selectedData.value.goods.name)
              throw new Error("请填写或选择商品");
            result = {
              isFuzzy: false,
              type: selectedData.value.type,
              brand: selectedData.value.brand,
              goods: selectedData.value.goods
            };
          }
          formatAppLog("log", "at components/relation-picker/relation-picker.vue:490", "确认数据:", result);
          emit("confirm", result);
          closePicker();
        } catch (error) {
          uni.showToast({
            title: error.message,
            icon: "none"
          });
        }
      };
      const handleCancel = () => {
        emit("cancel");
        closePicker();
      };
      const __returned__ = { props, emit, goodsList, typePicker, brandSearch, goodsPicker, fuzzySearch, internalVisible, isFuzzyMode, selectedData, searchKeyword, switchMode, handleComponentToggle, resetAllComponents, handleFuzzySelect, closePicker, handleModalVisibilityChange, handleTypeSelect, getGoodsInfo, handleBrandSelect, handleGoodsSelect, getGoods, handleConfirm, handleCancel, ref: vue.ref, watch: vue.watch, nextTick: vue.nextTick, get websiteUrl() {
        return websiteUrl;
      }, get image1Url() {
        return image1Url;
      }, get wechatSignLogin() {
        return wechatSignLogin;
      }, get getUserInfo() {
        return getUserInfo;
      }, get global() {
        return global;
      }, get asyncGetUserInfo() {
        return asyncGetUserInfo;
      }, get getScene() {
        return getScene;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$m(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$6);
    const _component_common_name_picker = resolveEasycom(vue.resolveDynamicComponent("common-name-picker"), __easycom_1$1);
    const _component_common_search = resolveEasycom(vue.resolveDynamicComponent("common-search"), __easycom_2$2);
    const _component_custom_picker = resolveEasycom(vue.resolveDynamicComponent("custom-picker"), __easycom_3);
    const _component_goods_search = resolveEasycom(vue.resolveDynamicComponent("goods-search"), __easycom_1$6);
    const _component_common_modal = resolveEasycom(vue.resolveDynamicComponent("common-modal"), __easycom_2$1);
    return vue.openBlock(), vue.createBlock(_component_common_modal, {
      visible: $setup.internalVisible,
      "onUpdate:visible": $setup.handleModalVisibilityChange,
      top: "3%"
    }, {
      default: vue.withCtx(() => [
        vue.createElementVNode("view", { class: "relation-picker-container" }, [
          vue.createElementVNode("view", { class: "picker-header" }, [
            vue.createElementVNode("view", { class: "mode-switch" }, [
              vue.createCommentVNode(" 模式切换按钮 "),
              $setup.isFuzzyMode ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "switch-btn precision-mode",
                onClick: _cache[0] || (_cache[0] = ($event) => $setup.switchMode(false))
              }, [
                vue.createVNode(_component_uni_icons, {
                  type: "search",
                  size: "18",
                  color: "#fff"
                }),
                vue.createElementVNode("text", null, "切换到精确关联")
              ])) : vue.createCommentVNode("v-if", true),
              !$setup.isFuzzyMode ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 1,
                class: "switch-btn fuzzy-mode",
                onClick: _cache[1] || (_cache[1] = ($event) => $setup.switchMode(true))
              }, [
                vue.createVNode(_component_uni_icons, {
                  type: "list",
                  size: "18",
                  color: "#fff"
                }),
                vue.createElementVNode("text", null, "切换到模糊关联")
              ])) : vue.createCommentVNode("v-if", true)
            ])
          ]),
          vue.createElementVNode("view", { class: "picker-body" }, [
            vue.createCommentVNode(" 精确模式 "),
            !$setup.isFuzzyMode ? (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              { key: 0 },
              [
                vue.createVNode(_component_common_name_picker, {
                  ref: "typePicker",
                  dataList: $props.typeList,
                  onSelect: $setup.handleTypeSelect,
                  onToggle: _cache[2] || (_cache[2] = ($event) => $setup.handleComponentToggle("type")),
                  class: "type-picker"
                }, null, 8, ["dataList"]),
                vue.createVNode(
                  _component_common_search,
                  {
                    ref: "brandSearch",
                    mode: "fill",
                    onSelect: $setup.handleBrandSelect,
                    onToggle: _cache[3] || (_cache[3] = ($event) => $setup.handleComponentToggle("brand")),
                    class: "brand-search"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ),
                vue.createVNode(_component_custom_picker, {
                  ref: "goodsPicker",
                  dataList: $setup.goodsList,
                  onSelect: $setup.handleGoodsSelect,
                  onToggle: _cache[4] || (_cache[4] = ($event) => $setup.handleComponentToggle("goods")),
                  class: "goods-picker"
                }, null, 8, ["dataList"])
              ],
              64
              /* STABLE_FRAGMENT */
            )) : (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              { key: 1 },
              [
                vue.createCommentVNode(" 模糊模式 "),
                vue.createVNode(_component_goods_search, {
                  ref: "fuzzySearch",
                  mode: "fill",
                  onSelect: $setup.handleFuzzySelect,
                  modelValue: $setup.searchKeyword,
                  "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => $setup.searchKeyword = $event),
                  onToggle: _cache[6] || (_cache[6] = ($event) => $setup.handleComponentToggle("fuzzy")),
                  class: "fuzzy-search"
                }, null, 8, ["modelValue"])
              ],
              64
              /* STABLE_FRAGMENT */
            ))
          ]),
          vue.createElementVNode("view", { class: "picker-footer" }, [
            vue.createElementVNode("button", {
              class: "cancel-btn",
              onClick: $setup.handleCancel
            }, "取消"),
            vue.createElementVNode("button", {
              class: "confirm-btn",
              onClick: $setup.handleConfirm
            }, "确认")
          ])
        ])
      ]),
      _: 1
      /* STABLE */
    }, 8, ["visible"]);
  }
  const __easycom_0$2 = /* @__PURE__ */ _export_sfc(_sfc_main$n, [["render", _sfc_render$m], ["__scopeId", "data-v-0488033a"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/components/relation-picker/relation-picker.vue"]]);
  const _imports_1 = "/static/add2.png";
  const _sfc_main$m = {
    __name: "showcase_form",
    props: ["showcase_id"],
    setup(__props, { expose: __expose }) {
      __expose();
      const props = __props;
      const uploadList = vue.ref([]);
      const goodsList = vue.ref([
        // {"name":"aa", "id":1}
      ]);
      const typeList = vue.ref([]);
      const showSelectTab = vue.ref(false);
      const chooseBrandName = vue.ref("");
      const chooseBrandId = vue.ref(0);
      const chooseGoodsName = vue.ref("");
      const chooseGoodsId = vue.ref(0);
      const chooseType = vue.ref("");
      const handleRelationConfirm = (data) => {
        try {
          const relationData = {
            goods_id: data.goods.id || 0,
            goods_name: data.goods.name,
            goods_image: data.goods.image || "",
            brand_id: data.brand.id || 0,
            brand_name: data.brand.name || (data.isFuzzy ? "" : "未知品牌"),
            type: data.type || (data.isFuzzy ? "未知类型" : "")
          };
          const isExist = saveCollocationDataList.value.some(
            (item) => item.goods_id !== 0 && item.goods_id === relationData.goods_id || item.goods_name === relationData.goods_name
          );
          if (!isExist) {
            saveCollocationDataList.value.push(relationData);
          } else {
            uni.showToast({
              title: "已存在相同关联项",
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/stock/showcase_form/showcase_form.vue:148", "保存关联数据失败:", error);
          uni.showToast({
            title: "保存关联信息失败",
            icon: "none"
          });
        }
      };
      const handleRelationCancel = () => {
        formatAppLog("log", "at pages/stock/showcase_form/showcase_form.vue:157", "用户取消选择");
      };
      const showRelationPicker = () => {
        showSelectTab.value = true;
      };
      const isEditable = vue.computed(() => [-1, 1, 3].includes(display.value));
      const showDelete = vue.computed(() => {
        if (props.showcase_id > 0) {
          return true;
        }
        return false;
      });
      const name = vue.ref("");
      const description = vue.ref("");
      const display = vue.ref(-1);
      function getGoodsInfo(id) {
        return new Promise((resolve, reject) => {
          uni.request({
            url: websiteUrl + "/goods?id=" + id,
            method: "GET",
            timeout: 5e3,
            success: (res) => {
              formatAppLog("log", "at pages/stock/showcase_form/showcase_form.vue:189", res.data.data);
              resolve(res.data);
            },
            fail: (err) => {
              formatAppLog("log", "at pages/stock/showcase_form/showcase_form.vue:193", err);
              uni.showToast({
                title: "网络请求失败",
                icon: "none"
              });
              reject(err);
            },
            complete: () => {
              uni.hideLoading();
            }
          });
        });
      }
      const saveCollocationDataList = vue.ref([]);
      async function getShowCaseInfo() {
        var _a;
        if (!props.showcase_id)
          return;
        try {
          const res = await uni.request({
            url: `${websiteUrl}/with-state/showcase-detail?id=${props.showcase_id}`,
            method: "GET",
            header: {
              "Authorization": uni.getStorageSync("token")
            }
          });
          const data = res.data.data;
          name.value = data.name;
          description.value = data.description;
          display.value = data.display;
          uploadList.value = ((_a = data.image_urls) == null ? void 0 : _a.split(",")) || [];
          formatAppLog("log", "at pages/stock/showcase_form/showcase_form.vue:230", data);
          if (data.relations) {
            saveCollocationDataList.value = data.relations.map((r) => ({
              goods_id: r.relation_goods_id,
              goods_name: r.relation_goods_name,
              brand_id: r.relation_brand_id,
              brand_name: r.relation_brand_name,
              type: r.type,
              goods_image: r.relation_goods_image
            }));
          }
        } catch (err) {
          uni.showToast({
            title: "加载失败",
            icon: "none"
          });
        }
      }
      function viewFullImage(index) {
        uni.previewImage({
          current: uploadList.value[index],
          urls: uploadList.value
        });
      }
      async function selectImage() {
        try {
          const imagePaths = await chooseImageList(9);
          for (const path of imagePaths) {
            const tokenData = await getQiniuToken();
            await uploadImageToQiniu(path, tokenData.token, tokenData.path);
            uploadList.value.push(image1Url + tokenData.path);
          }
          uni.showToast({ title: `成功上传${imagePaths.length}张图片`, icon: "success" });
        } catch (error) {
          formatAppLog("error", "at pages/stock/showcase_form/showcase_form.vue:277", "上传出错:", error);
          uni.showToast({ title: "部分图片上传失败", icon: "none" });
        }
      }
      async function handleDelete() {
        uni.showModal({
          title: "确认删除",
          content: "确定要删除这个展示吗？",
          success: async (res) => {
            if (res.confirm) {
              try {
                const res2 = await uni.request({
                  url: `${websiteUrl}/with-state/delete-showcase?id=` + props.showcase_id,
                  method: "POST",
                  header: {
                    "Authorization": uni.getStorageSync("token")
                  }
                });
                if (res2.data.status === "success") {
                  uni.showToast({
                    title: "删除成功"
                  });
                  setTimeout(() => uni.navigateBack(), 1e3);
                }
              } catch (err) {
                uni.showToast({
                  title: "删除失败",
                  icon: "none"
                });
              }
            }
          }
        });
      }
      async function submitForm() {
        const token = uni.getStorageSync("token");
        if (!token) {
          uni.showToast({
            title: "请先登录",
            icon: "none"
          });
          return;
        }
        if (!name.value.trim() || !description.value.trim()) {
          uni.showToast({
            title: "标题和正文不能为空",
            icon: "none"
          });
          return;
        }
        if (uploadList.value.length === 0) {
          uni.showToast({
            title: "请至少上传一张图片",
            icon: "none"
          });
          return;
        }
        let scene = getScene();
        let postData = {
          name: name.value,
          description: description.value,
          image_urls: uploadList.value.join(","),
          display: display.value,
          origin: scene,
          relations: saveCollocationDataList.value.map((item) => ({
            relation_goods_id: item.goods_id,
            relation_goods_name: item.goods_name,
            relation_brand_id: item.brand_id,
            relation_brand_name: item.brand_name,
            type: item.type,
            relation_origin: 2
            // 标识关联的是showcase
          }))
        };
        try {
          let url = `${websiteUrl}/with-state/add-showcase`;
          if (props.showcase_id) {
            url = `${websiteUrl}/with-state/update-showcase`;
            postData = {
              ...postData,
              id: parseInt(props.showcase_id, 10)
            };
          }
          const res = await uni.request({
            url,
            method: "POST",
            data: postData,
            header: {
              "Content-Type": "application/json",
              "Authorization": uni.getStorageSync("token")
            }
          });
          if (res.data.code !== "failed") {
            uni.showToast({
              title: "提交成功"
            });
            setTimeout(() => uni.navigateBack(), 1500);
          } else {
            uni.showToast({
              title: "提交失败",
              icon: "none"
            });
            return;
          }
        } catch (err) {
          formatAppLog("log", "at pages/stock/showcase_form/showcase_form.vue:392", err);
          uni.showToast({
            title: "提交失败",
            icon: "none"
          });
        }
      }
      function getTypes() {
        uni.request({
          url: websiteUrl + "/goods-types",
          method: "GET",
          timeout: 5e3,
          success: (res) => {
            formatAppLog("log", "at pages/stock/showcase_form/showcase_form.vue:412", res.data.data);
            typeList.value = res.data.data;
          },
          fail: (err) => {
            formatAppLog("log", "at pages/stock/showcase_form/showcase_form.vue:416", err);
            uni.showToast({
              title: "网络请求失败",
              icon: "none"
            });
          }
        });
      }
      function saveCollocation() {
        if (chooseBrandName.value == "") {
          uni.showToast({
            title: "请选择或填写品牌名称",
            icon: "none"
          });
          return;
        }
        if (chooseGoodsName.value == "") {
          uni.showToast({
            title: "请选择或填写商品名称",
            icon: "none"
          });
          return;
        }
        if (chooseGoodsId.value == 0) {
          let data = {
            "brand_id": chooseBrandId.value,
            "goods_id": 0,
            "brand_name": chooseBrandName.value,
            "goods_name": chooseGoodsName.value,
            "goods_image": "",
            "type": chooseType.value
          };
          saveCollocationDataList.value.push(data);
          showSelectTab.value = false;
          chooseBrandId.value = 0;
          chooseBrandName.value = "";
          chooseGoodsId.value = 0;
          chooseGoodsName.value = "";
          chooseType.value = "";
          return;
        }
        getGoodsInfo(chooseGoodsId.value).then((res) => {
          let data = {
            "brand_id": chooseBrandId.value,
            "goods_id": chooseGoodsId.value,
            "brand_name": chooseBrandName.value,
            "goods_name": chooseGoodsName.value,
            "goods_image": res.data.goods_images[0],
            "type": chooseType.value
          };
          saveCollocationDataList.value.push(data);
          showSelectTab.value = false;
          chooseBrandId.value = 0;
          chooseBrandName.value = "";
          chooseGoodsId.value = 0;
          chooseGoodsName.value = "";
          chooseType.value = "";
        });
      }
      function deleteImage(index) {
        uploadList.value.splice(index, 1);
      }
      function deleteCollcation(index) {
        saveCollocationDataList.value.splice(index, 1);
      }
      uni.setNavigationBarTitle({
        title: "展示柜"
      });
      vue.onMounted(() => {
        getTypes();
        getShowCaseInfo();
      });
      const __returned__ = { props, uploadList, goodsList, typeList, showSelectTab, chooseBrandName, chooseBrandId, chooseGoodsName, chooseGoodsId, chooseType, handleRelationConfirm, handleRelationCancel, showRelationPicker, isEditable, showDelete, name, description, display, getGoodsInfo, saveCollocationDataList, getShowCaseInfo, viewFullImage, selectImage, handleDelete, submitForm, getTypes, saveCollocation, deleteImage, deleteCollcation, onMounted: vue.onMounted, ref: vue.ref, computed: vue.computed, get websiteUrl() {
        return websiteUrl;
      }, get image1Url() {
        return image1Url;
      }, get wechatSignLogin() {
        return wechatSignLogin;
      }, get getUserInfo() {
        return getUserInfo;
      }, get global() {
        return global;
      }, get asyncGetUserInfo() {
        return asyncGetUserInfo;
      }, get getScene() {
        return getScene;
      }, get chooseImage() {
        return chooseImage;
      }, get jumpToCroper() {
        return jumpToCroper;
      }, get getQiniuToken() {
        return getQiniuToken;
      }, get uploadImageToQiniu() {
        return uploadImageToQiniu;
      }, get chooseImageList() {
        return chooseImageList;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$l(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_relation_picker = resolveEasycom(vue.resolveDynamicComponent("relation-picker"), __easycom_0$2);
    return vue.openBlock(), vue.createElementBlock("view", null, [
      vue.createElementVNode("meta", {
        name: "theme-color",
        content: "#F8F8F8"
      }),
      !$setup.isEditable ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "edit-tip"
      }, [
        vue.createElementVNode("text", null, "当前状态不可编辑")
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 上传图片列表 "),
      vue.createElementVNode("scroll-view", {
        "scroll-x": "true",
        class: "upload_box",
        "ll-with-animation": "true",
        "show-scrollbar": false
      }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.uploadList, (item, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: "upload_item",
              key: index
            }, [
              vue.createElementVNode("image", {
                src: item,
                class: "uploaded_image",
                onClick: $setup.viewFullImage,
                mode: "aspectFill"
              }, null, 8, ["src"]),
              $setup.isEditable ? (vue.openBlock(), vue.createElementBlock("image", {
                key: 0,
                src: _imports_0$7,
                class: "close_icon",
                onClick: ($event) => $setup.deleteImage(index)
              }, null, 8, ["onClick"])) : vue.createCommentVNode("v-if", true)
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        )),
        $setup.isEditable ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "uploadImageBox",
          style: { "background": "#f8f8f8" }
        }, [
          vue.createElementVNode("image", {
            src: _imports_1,
            class: "upload_img",
            onClick: _cache[0] || (_cache[0] = ($event) => $setup.selectImage(_ctx.index)),
            style: { "width": "50px", "height": "50px", "margin": "25px" }
          })
        ])) : vue.createCommentVNode("v-if", true)
      ]),
      vue.createCommentVNode(" 标题 "),
      vue.withDirectives(vue.createElementVNode("input", {
        "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.name = $event),
        type: "text",
        disabled: !$setup.isEditable,
        placeholder: "请输入标题",
        style: { "padding": "10px", "margin": "20px 15px 5px 15px", "display": "block" }
      }, null, 8, ["disabled"]), [
        [vue.vModelText, $setup.name]
      ]),
      vue.createElementVNode("view", { class: "oneLine" }),
      vue.withDirectives(vue.createElementVNode("textarea", {
        "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $setup.description = $event),
        disabled: !$setup.isEditable,
        placeholder: "请输入描述",
        style: { "padding": "10px", "margin": "10px 15px 5px 15px", "display": "block", "line-height": "28px", "width": "calc(100% - 50px)" }
      }, null, 8, ["disabled"]), [
        [vue.vModelText, $setup.description]
      ]),
      vue.createElementVNode("view", { class: "oneLine" }),
      vue.createElementVNode("view", { class: "" }, [
        $setup.isEditable ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "relation-trigger",
          onClick: $setup.showRelationPicker
        }, [
          vue.createElementVNode("text", { class: "placeholder" }, "点击关联娃物"),
          vue.createElementVNode("image", {
            src: _imports_2,
            class: "arrow-icon"
          })
        ])) : vue.createCommentVNode("v-if", true)
      ]),
      vue.createCommentVNode(" 相关 "),
      vue.createElementVNode("view", { class: "saveCollocationDataList" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.saveCollocationDataList, (item, index) => {
            return vue.openBlock(), vue.createElementBlock("view", { key: index }, [
              vue.createElementVNode("view", { class: "saveCollocationDataItem" }, [
                item.goods_image ? (vue.openBlock(), vue.createElementBlock("image", {
                  key: 0,
                  src: item.goods_image,
                  mode: "aspectFill",
                  style: { "width": "70px", "height": "70px" }
                }, null, 8, ["src"])) : (vue.openBlock(), vue.createElementBlock("text", {
                  key: 1,
                  class: "no-image"
                }, "?")),
                vue.createElementVNode(
                  "text",
                  {
                    class: "info-tap",
                    style: { "width": "calc(100% - 120px)", "display": "inline-block" }
                  },
                  vue.toDisplayString(item.type) + " " + vue.toDisplayString(item.brand_name) + " - " + vue.toDisplayString(item.goods_name),
                  1
                  /* TEXT */
                ),
                $setup.isEditable ? (vue.openBlock(), vue.createElementBlock("image", {
                  key: 2,
                  src: _imports_0$7,
                  class: "close_icon",
                  onClick: ($event) => $setup.deleteCollcation(index)
                }, null, 8, ["onClick"])) : vue.createCommentVNode("v-if", true)
              ])
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      vue.createVNode(_component_relation_picker, {
        visible: $setup.showSelectTab,
        "onUpdate:visible": _cache[3] || (_cache[3] = ($event) => $setup.showSelectTab = $event),
        typeList: $setup.typeList,
        goodsList: $setup.goodsList,
        onConfirm: $setup.handleRelationConfirm,
        onCancel: $setup.handleRelationCancel
      }, null, 8, ["visible", "typeList", "goodsList"]),
      vue.createElementVNode("view", { class: "footer" }, [
        $setup.showDelete ? (vue.openBlock(), vue.createElementBlock("button", {
          key: 0,
          onClick: $setup.handleDelete,
          class: "delete-btn"
        }, "删除")) : vue.createCommentVNode("v-if", true),
        vue.createElementVNode("button", { onClick: $setup.submitForm }, "发表")
      ])
    ]);
  }
  const PagesStockShowcaseFormShowcaseForm = /* @__PURE__ */ _export_sfc(_sfc_main$m, [["render", _sfc_render$l], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/stock/showcase_form/showcase_form.vue"]]);
  const _sfc_main$l = {
    __name: "bill_form",
    props: ["bill_id"],
    setup(__props, { expose: __expose }) {
      __expose();
      const props = __props;
      const isEdit = props.bill_id ? true : false;
      const name = vue.ref("");
      const price = vue.ref("");
      const date = vue.ref("");
      const status = vue.ref(0);
      const statusList = ["未补款", "已补款"];
      function getBillById(id) {
        let token = uni.getStorageSync("token");
        uni.request({
          url: websiteUrl + "/with-state/tail-bill-detail",
          method: "GET",
          header: { "Authorization": token },
          data: { id },
          success: (res) => {
            name.value = res.data.data.name;
            price.value = res.data.data.price;
            date.value = res.data.data.ymd;
            status.value = res.data.data.status;
            formattedDate.value = formatDate(res.data.data.ymd);
          },
          fail: (err) => {
            formatAppLog("log", "at pages/stock/bill_form/bill_form.vue:113", err);
          }
        });
      }
      const formattedDate = vue.ref("");
      function updateDate(e) {
        const selectedDate = e.detail.value;
        date.value = selectedDate;
        formattedDate.value = formatDate(selectedDate);
      }
      function handleDelete() {
        uni.showModal({
          title: "提示",
          content: "确定删除该账单吗？",
          success: (res) => {
            if (res.confirm) {
              uni.request({
                url: websiteUrl + "/with-state/delete-tail-bill?id=" + parseInt(props.bill_id, 10),
                method: "POST",
                header: { "Authorization": uni.getStorageSync("token") },
                success: (res2) => {
                  if (res2.data.status == "success") {
                    uni.showToast({
                      title: "删除成功",
                      icon: "success"
                    });
                    setTimeout(() => {
                      uni.navigateBack();
                    }, 500);
                  } else {
                    uni.showToast({
                      title: res2.data.msg,
                      icon: "none"
                    });
                  }
                }
              });
            }
          }
        });
      }
      function formatDate(dateStr) {
        let date2 = new Date(dateStr);
        const year = date2.getFullYear();
        const month = (date2.getMonth() + 1).toString().padStart(2, "0");
        const day = date2.getDate().toString().padStart(2, "0");
        return `${year}-${month}-${day}`;
      }
      function updateStatus(e) {
        status.value = e.detail.value;
      }
      vue.onMounted(() => {
        if (isEdit) {
          getBillById(props.bill_id);
          uni.setNavigationBarTitle({
            title: "编辑账单"
          });
        } else {
          uni.setNavigationBarTitle({
            title: "新增账单"
          });
        }
      });
      function postSubmit() {
        if (isEdit) {
          updateBill();
        } else {
          addBill();
        }
      }
      function addBill() {
        let postData = {
          name: name.value,
          price: parseFloat(price.value),
          ymd: date.value,
          // 原始日期
          status: status.value
        };
        uni.request({
          url: websiteUrl + "/with-state/add-tail-bill",
          method: "POST",
          header: {
            "Authorization": uni.getStorageSync("token")
          },
          data: postData,
          success: (res) => {
            if (res.data.status == "success") {
              uni.showToast({
                title: "提交成功",
                icon: "success"
              });
              setTimeout(() => {
                uni.navigateBack();
              }, 500);
            } else {
              uni.showToast({
                title: res.data.msg,
                icon: "none"
              });
            }
          }
        });
      }
      function updateBill() {
        let postData = {
          id: parseInt(props.bill_id, 10),
          name: name.value,
          price: parseFloat(price.value),
          ymd: date.value,
          // 原始日期
          status: status.value
        };
        uni.request({
          url: websiteUrl + "/with-state/update-tail-bill",
          method: "POST",
          header: {
            "Authorization": uni.getStorageSync("token")
          },
          data: postData,
          success: (res) => {
            if (res.data.status == "success") {
              uni.showToast({
                title: "提交成功",
                icon: "success"
              });
              setTimeout(() => {
                uni.navigateBack();
              }, 500);
            } else {
              uni.showToast({
                title: res.data.msg,
                icon: "none"
              });
            }
          }
        });
      }
      const __returned__ = { props, isEdit, name, price, date, status, statusList, getBillById, formattedDate, updateDate, handleDelete, formatDate, updateStatus, postSubmit, addBill, updateBill, ref: vue.ref, onMounted: vue.onMounted, get websiteUrl() {
        return websiteUrl;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$k(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("meta", {
        name: "theme-color",
        content: "#F8F8F8"
      }),
      vue.createCommentVNode(" 表单卡片容器 "),
      vue.createElementVNode("view", { class: "form-card" }, [
        vue.createCommentVNode(" 账单名称 "),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "form-label" }, "账单名称"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              class: "form-input",
              type: "text",
              placeholder: "请输入名称",
              "placeholder-class": "placeholder-style",
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.name = $event)
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $setup.name]
          ])
        ]),
        vue.createCommentVNode(" 账单金额 "),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "form-label" }, "账单金额"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              class: "form-input",
              type: "digit",
              placeholder: "请输入金额",
              "placeholder-class": "placeholder-style",
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.price = $event)
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $setup.price]
          ])
        ]),
        vue.createCommentVNode(" 账单日期 "),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "form-label" }, "账单日期"),
          vue.createElementVNode("picker", {
            mode: "date",
            class: "form-input",
            value: $setup.formattedDate,
            onChange: $setup.updateDate
          }, [
            vue.createElementVNode(
              "view",
              { class: "picker-content" },
              vue.toDisplayString($setup.formattedDate || "请选择日期"),
              1
              /* TEXT */
            )
          ], 40, ["value"])
        ]),
        vue.createCommentVNode(" 账单状态 "),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "form-label" }, "账单状态"),
          vue.createElementVNode("picker", {
            mode: "selector",
            class: "form-input",
            value: $setup.status,
            range: $setup.statusList,
            onChange: $setup.updateStatus
          }, [
            vue.createElementVNode(
              "view",
              { class: "picker-content" },
              vue.toDisplayString($setup.statusList[$setup.status] || "请选择状态"),
              1
              /* TEXT */
            )
          ], 40, ["value"])
        ]),
        vue.createElementVNode("view", { style: { "overflow": "hidden" } }, [
          vue.createElementVNode("image", {
            src: _imports_0$1,
            mode: "aspectFill",
            style: { "width": "28rpx", "height": "28rpx", "margin-right": "10rpx", "position": "relative", "top": "3rpx" }
          }),
          vue.createElementVNode("text", { style: { "color": "#888" } }, "仅用于您的记账，其他人不会看到")
        ])
      ]),
      vue.createCommentVNode(" 操作按钮 "),
      vue.createElementVNode("view", { class: "button-group" }, [
        vue.createElementVNode(
          "button",
          {
            class: "submit-button",
            onClick: $setup.postSubmit
          },
          " 记录" + vue.toDisplayString($setup.isEdit ? "修改" : "新增"),
          1
          /* TEXT */
        ),
        $setup.isEdit ? (vue.openBlock(), vue.createElementBlock("button", {
          key: 0,
          class: "delete-button",
          onClick: $setup.handleDelete
        }, " 删除账单 ")) : vue.createCommentVNode("v-if", true)
      ])
    ]);
  }
  const PagesStockBillFormBillForm = /* @__PURE__ */ _export_sfc(_sfc_main$l, [["render", _sfc_render$k], ["__scopeId", "data-v-c24e185a"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/stock/bill_form/bill_form.vue"]]);
  const _sfc_main$k = {
    __name: "collocation",
    props: ["goods_id", "goods_name", "brand_id", "brand_name", "type"],
    setup(__props, { expose: __expose }) {
      __expose();
      const props = __props;
      const uploadList = vue.ref([]);
      const goodsList = vue.ref([
        // {"name":"aa", "id":1}
      ]);
      const typeList = vue.ref([]);
      const showSelectTab = vue.ref(false);
      const chooseBrandName = vue.ref("");
      const chooseBrandId = vue.ref(0);
      const chooseGoodsName = vue.ref("");
      const chooseGoodsId = vue.ref(0);
      const chooseType = vue.ref("");
      const handleRelationConfirm = (data) => {
        try {
          const relationData = {
            goods_id: data.goods.id || 0,
            goods_name: data.goods.name,
            goods_image: data.goods.image || "",
            brand_id: data.brand.id || 0,
            brand_name: data.brand.name || (data.isFuzzy ? "" : "未知品牌"),
            type: data.type || (data.isFuzzy ? "未知类型" : "")
          };
          const isExist = saveCollocationDataList.value.some(
            (item) => item.goods_id !== 0 && item.goods_id === relationData.goods_id || item.goods_name === relationData.goods_name
          );
          if (!isExist) {
            saveCollocationDataList.value.push(relationData);
          } else {
            uni.showToast({
              title: "已存在相同关联项",
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/collocation/collocation.vue:121", "保存关联数据失败:", error);
          uni.showToast({
            title: "保存关联信息失败",
            icon: "none"
          });
        }
      };
      const handleRelationCancel = () => {
        formatAppLog("log", "at pages/collocation/collocation.vue:130", "用户取消选择");
      };
      const showRelationPicker = () => {
        showSelectTab.value = true;
      };
      function getGoodsInfo(id) {
        return new Promise((resolve, reject) => {
          uni.request({
            url: websiteUrl + "/goods?id=" + id,
            method: "GET",
            timeout: 5e3,
            success: (res) => {
              formatAppLog("log", "at pages/collocation/collocation.vue:145", res.data.data);
              resolve(res.data);
            },
            fail: (err) => {
              formatAppLog("log", "at pages/collocation/collocation.vue:149", err);
              uni.showToast({
                title: "网络请求失败",
                icon: "none"
              });
              reject(err);
            },
            complete: () => {
              uni.hideLoading();
            }
          });
        });
      }
      const saveCollocationDataList = vue.ref([]);
      if (props.goods_id && props.goods_name && props.brand_id && props.brand_name && props.type) {
        getGoodsInfo(props.goods_id).then((res) => {
          let data = {
            "brand_id": parseInt(props.brand_id, 10),
            "goods_id": parseInt(props.goods_id, 10),
            "brand_name": props.brand_name,
            "goods_name": props.goods_name,
            "goods_image": res.data.goods_images[0],
            "type": props.type
          };
          formatAppLog("log", "at pages/collocation/collocation.vue:176", data);
          saveCollocationDataList.value.push(data);
        });
      }
      const title = vue.ref("");
      const content = vue.ref("");
      function viewFullImage(index) {
        uni.previewImage({
          current: uploadList.value[index],
          urls: uploadList.value
        });
      }
      async function selectImage() {
        try {
          const imagePaths = await chooseImageList(9);
          for (const path of imagePaths) {
            const tokenData = await getQiniuToken();
            await uploadImageToQiniu(path, tokenData.token, tokenData.path);
            uploadList.value.push(image1Url + tokenData.path);
          }
          uni.showToast({ title: `成功上传${imagePaths.length}张图片`, icon: "success" });
        } catch (error) {
          formatAppLog("error", "at pages/collocation/collocation.vue:214", "上传出错:", error);
          uni.showToast({ title: "部分图片上传失败", icon: "none" });
        }
      }
      function addRelated() {
      }
      function submitForm() {
        const token = uni.getStorageSync("token");
        if (!token) {
          uni.showToast({
            title: "请先登录",
            icon: "none"
          });
          return;
        }
        if (!title.value.trim()) {
          uni.showToast({
            title: "标题不能为空",
            icon: "none"
          });
          return;
        }
        if (uploadList.value.length === 0) {
          uni.showToast({
            title: "请至少上传一张图片",
            icon: "none"
          });
          return;
        }
        let scene = getScene();
        const postData = {
          title: title.value,
          content: content.value,
          image_url_list: uploadList.value,
          scene,
          relations: saveCollocationDataList.value.map((item) => ({
            relation_goods_id: item.goods_id,
            relation_goods_name: item.goods_name,
            relation_brand_id: item.brand_id,
            relation_brand_name: item.brand_name,
            type: item.type,
            relation_origin: 1
            // 标识关联的是collocation
          }))
        };
        formatAppLog("log", "at pages/collocation/collocation.vue:266", postData);
        uni.request({
          url: websiteUrl + "/with-state/add-collocation",
          method: "POST",
          data: postData,
          header: {
            "Content-Type": "application/json",
            "Authorization": token
          },
          timeout: 5e3,
          success: (res) => {
            if (res.data.status === "success") {
              uni.showToast({
                title: "提交成功"
              });
              title.value = "";
              content.value = "";
              uploadList.value = [];
              saveCollocationDataList.value = [];
              uni.navigateBack();
            } else {
              uni.showToast({
                title: res.data.msg || "提交失败",
                icon: "none"
              });
            }
          },
          fail: (err) => {
            formatAppLog("log", "at pages/collocation/collocation.vue:297", err);
            uni.showToast({
              title: "网络请求失败",
              icon: "none"
            });
          }
        });
      }
      function getGoods(id) {
        uni.request({
          url: websiteUrl + "/goods-name-list?id=" + id,
          method: "GET",
          timeout: 5e3,
          success: (res) => {
            formatAppLog("log", "at pages/collocation/collocation.vue:318", res.data.data);
            goodsList.value = res.data.data;
            formatAppLog("log", "at pages/collocation/collocation.vue:320", goodsList.value);
          },
          fail: (err) => {
            formatAppLog("log", "at pages/collocation/collocation.vue:324", err);
            uni.showToast({
              title: "网络请求失败",
              icon: "none"
            });
          }
        });
      }
      function getTypes() {
        uni.request({
          url: websiteUrl + "/goods-types",
          method: "GET",
          timeout: 5e3,
          success: (res) => {
            formatAppLog("log", "at pages/collocation/collocation.vue:343", res.data.data);
            typeList.value = res.data.data;
          },
          fail: (err) => {
            formatAppLog("log", "at pages/collocation/collocation.vue:347", err);
            uni.showToast({
              title: "网络请求失败",
              icon: "none"
            });
          }
        });
      }
      function saveCollocation() {
        if (chooseBrandName.value == "") {
          uni.showToast({
            title: "请选择或填写品牌名称",
            icon: "none"
          });
          return;
        }
        if (chooseGoodsName.value == "") {
          uni.showToast({
            title: "请选择或填写商品名称",
            icon: "none"
          });
          return;
        }
        if (chooseGoodsId.value == 0) {
          let data = {
            "brand_id": chooseBrandId.value,
            "goods_id": 0,
            "brand_name": chooseBrandName.value,
            "goods_name": chooseGoodsName.value,
            "goods_image": "",
            "type": chooseType.value
          };
          saveCollocationDataList.value.push(data);
          showSelectTab.value = false;
          chooseBrandId.value = 0;
          chooseBrandName.value = "";
          chooseGoodsId.value = 0;
          chooseGoodsName.value = "";
          chooseType.value = "";
          return;
        }
        getGoodsInfo(chooseGoodsId.value).then((res) => {
          let data = {
            "brand_id": chooseBrandId.value,
            "goods_id": chooseGoodsId.value,
            "brand_name": chooseBrandName.value,
            "goods_name": chooseGoodsName.value,
            "goods_image": res.data.goods_images[0],
            "type": chooseType.value
          };
          saveCollocationDataList.value.push(data);
          showSelectTab.value = false;
          chooseBrandId.value = 0;
          chooseBrandName.value = "";
          chooseGoodsId.value = 0;
          chooseGoodsName.value = "";
          chooseType.value = "";
        });
      }
      function deleteImage(index) {
        uploadList.value.splice(index, 1);
      }
      function deleteCollcation(index) {
        saveCollocationDataList.value.splice(index, 1);
      }
      getTypes();
      const __returned__ = { props, uploadList, goodsList, typeList, showSelectTab, chooseBrandName, chooseBrandId, chooseGoodsName, chooseGoodsId, chooseType, handleRelationConfirm, handleRelationCancel, showRelationPicker, getGoodsInfo, saveCollocationDataList, title, content, viewFullImage, selectImage, addRelated, submitForm, getGoods, getTypes, saveCollocation, deleteImage, deleteCollcation, ref: vue.ref, get websiteUrl() {
        return websiteUrl;
      }, get image1Url() {
        return image1Url;
      }, get wechatSignLogin() {
        return wechatSignLogin;
      }, get getUserInfo() {
        return getUserInfo;
      }, get global() {
        return global;
      }, get asyncGetUserInfo() {
        return asyncGetUserInfo;
      }, get getScene() {
        return getScene;
      }, get chooseImage() {
        return chooseImage;
      }, get jumpToCroper() {
        return jumpToCroper;
      }, get getQiniuToken() {
        return getQiniuToken;
      }, get uploadImageToQiniu() {
        return uploadImageToQiniu;
      }, get chooseImageList() {
        return chooseImageList;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$j(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_relation_picker = resolveEasycom(vue.resolveDynamicComponent("relation-picker"), __easycom_0$2);
    const _component_common_page = resolveEasycom(vue.resolveDynamicComponent("common-page"), __easycom_1$4);
    return vue.openBlock(), vue.createBlock(_component_common_page, null, {
      default: vue.withCtx(() => [
        vue.createCommentVNode(" 上传图片列表 "),
        vue.createElementVNode("scroll-view", {
          "scroll-x": "true",
          class: "upload_box",
          "ll-with-animation": "true",
          "show-scrollbar": false
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.uploadList, (item, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "upload_item",
                key: index
              }, [
                vue.createElementVNode("image", {
                  src: item,
                  class: "uploaded_image",
                  onClick: $setup.viewFullImage,
                  mode: "aspectFill"
                }, null, 8, ["src"]),
                vue.createElementVNode("image", {
                  src: _imports_0$7,
                  class: "close_icon",
                  onClick: ($event) => $setup.deleteImage(index)
                }, null, 8, ["onClick"])
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          )),
          vue.createElementVNode("view", {
            class: "uploadImageBox",
            style: { "background": "#f8f8f8" }
          }, [
            vue.createElementVNode("image", {
              src: _imports_1,
              class: "upload_img",
              onClick: _cache[0] || (_cache[0] = ($event) => $setup.selectImage(_ctx.index)),
              style: { "width": "50px", "height": "50px", "margin": "25px" }
            })
          ])
        ]),
        vue.createCommentVNode(" 标题 "),
        vue.withDirectives(vue.createElementVNode(
          "input",
          {
            "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.title = $event),
            type: "text",
            placeholder: "请输入标题",
            style: { "padding": "10px", "margin": "20px 15px 5px 15px", "display": "block" }
          },
          null,
          512
          /* NEED_PATCH */
        ), [
          [vue.vModelText, $setup.title]
        ]),
        vue.createElementVNode("view", { class: "oneLine" }),
        vue.withDirectives(vue.createElementVNode(
          "textarea",
          {
            "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $setup.content = $event),
            placeholder: "请输入正文",
            style: { "padding": "10px", "margin": "10px 15px 5px 15px", "display": "block", "line-height": "28px", "width": "calc(100% - 50px)" }
          },
          null,
          512
          /* NEED_PATCH */
        ), [
          [vue.vModelText, $setup.content]
        ]),
        vue.createElementVNode("view", { class: "oneLine" }),
        vue.createElementVNode("view", { class: "" }, [
          vue.createElementVNode("view", {
            class: "relation-trigger",
            onClick: $setup.showRelationPicker
          }, [
            vue.createElementVNode("text", { class: "placeholder" }, "点击关联娃物"),
            vue.createElementVNode("image", {
              src: _imports_2,
              class: "arrow-icon"
            })
          ])
        ]),
        vue.createCommentVNode(" 相关 "),
        vue.createElementVNode("view", { class: "saveCollocationDataList" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.saveCollocationDataList, (item, index) => {
              return vue.openBlock(), vue.createElementBlock("view", { key: index }, [
                vue.createElementVNode("view", { class: "saveCollocationDataItem" }, [
                  item.goods_image ? (vue.openBlock(), vue.createElementBlock("image", {
                    key: 0,
                    src: item.goods_image,
                    mode: "aspectFill",
                    style: { "width": "70px", "height": "70px" }
                  }, null, 8, ["src"])) : (vue.openBlock(), vue.createElementBlock("text", {
                    key: 1,
                    class: "no-image"
                  }, "?")),
                  vue.createElementVNode(
                    "text",
                    {
                      class: "info-tap",
                      style: { "width": "calc(100% - 120px)", "display": "inline-block" }
                    },
                    vue.toDisplayString(item.type) + " " + vue.toDisplayString(item.brand_name) + " - " + vue.toDisplayString(item.goods_name),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("image", {
                    src: _imports_0$7,
                    class: "close_icon",
                    onClick: ($event) => $setup.deleteCollcation(index)
                  }, null, 8, ["onClick"])
                ])
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        vue.createVNode(_component_relation_picker, {
          visible: $setup.showSelectTab,
          "onUpdate:visible": _cache[3] || (_cache[3] = ($event) => $setup.showSelectTab = $event),
          typeList: $setup.typeList,
          goodsList: $setup.goodsList,
          onConfirm: $setup.handleRelationConfirm,
          onCancel: $setup.handleRelationCancel
        }, null, 8, ["visible", "typeList", "goodsList"]),
        vue.createElementVNode("view", { class: "footer" }, [
          vue.createElementVNode("button", { onClick: $setup.submitForm }, "提交")
        ])
      ]),
      _: 1
      /* STABLE */
    });
  }
  const PagesCollocationCollocation = /* @__PURE__ */ _export_sfc(_sfc_main$k, [["render", _sfc_render$j], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/collocation/collocation.vue"]]);
  const _sfc_main$j = {
    __name: "collocation_share",
    props: {
      collocation_id: {
        type: String,
        default: 0
      },
      origin: {
        type: String,
        default: 0
      }
    },
    setup(__props, { expose: __expose }) {
      __expose();
      const detailData = vue.ref({
        title: "",
        content: "",
        image_url_list: [],
        collocation_relation_list: []
      });
      const authorInfo = vue.ref({
        userName: "",
        avatar: ""
      });
      const systemInfo2 = uni.getSystemInfoSync();
      const loading = vue.ref(true);
      const error = vue.ref(false);
      const errorMsg = vue.ref("");
      const props = __props;
      const pageId2 = vue.ref(0);
      const origin = vue.ref(0);
      let hasLike = vue.ref(false);
      const commentListRef = vue.ref(null);
      const commentInputRef = vue.ref(null);
      let commentsPage = vue.ref(1);
      let replyForItem = vue.ref({});
      uni.setNavigationBarTitle({
        title: "搭配详情"
      });
      function jump2user(uid) {
        uni.navigateTo({
          url: "/pages/user_page/user_page?uid=" + uid
        });
      }
      const getGoodsInfo = (id) => {
        return new Promise((resolve, reject) => {
          if (!id || id === 0) {
            reject("无效的商品ID");
            return;
          }
          uni.request({
            url: `${websiteUrl}/goods?id=${id}`,
            method: "GET",
            timeout: 5e3,
            success: (res) => {
              if (res.data.status === "success") {
                resolve(res.data.data);
              } else {
                reject(res.data.msg || "获取商品信息失败");
              }
            },
            fail: (err) => {
              formatAppLog("error", "at pages/collocation_share/collocation_share.vue:206", err);
              uni.showToast({
                title: "网络请求失败",
                icon: "none"
              });
              reject(err);
            }
          });
        });
      };
      function viewFullImage(index) {
        formatAppLog("log", "at pages/collocation_share/collocation_share.vue:219", detailData);
        uni.previewImage({
          current: detailData.value.image_url_list[index],
          urls: detailData.value.image_url_list
        });
      }
      const fetchData = async (id, origin2) => {
        var _a;
        try {
          const res = await uni.request({
            url: websiteUrl + `/view-collocation?collocation_id=${id}&origin=${origin2}`
          });
          if (res.data.status !== "success") {
            handleError2(res.data.msg || "数据加载失败");
            return;
          }
          const processedData = {
            ...res.data.data,
            image_url_list: Array.isArray(res.data.data.image_url_list) ? res.data.data.image_url_list : [res.data.data.image_urls],
            collocation_relation_list: await Promise.all(
              res.data.data.collocation_relation_list.map(async (item) => {
                try {
                  const goodsInfo = item.relation_goods_id > 0 ? await getGoodsInfo(item.relation_goods_id) : null;
                  return {
                    ...item,
                    goodsInfo,
                    imageLoaded: !!goodsInfo,
                    imageError: !goodsInfo
                  };
                } catch (error2) {
                  formatAppLog("error", "at pages/collocation_share/collocation_share.vue:258", "商品信息获取失败:", error2);
                  return {
                    ...item,
                    goodsInfo: null,
                    imageLoaded: false,
                    imageError: true
                  };
                }
              })
            )
          };
          detailData.value = processedData;
          if ((_a = res.data.data) == null ? void 0 : _a.uid) {
            await getAuthorInfo(res.data.data.uid);
          }
        } catch (error2) {
          handleError2("数据加载失败");
        } finally {
          loading.value = false;
        }
      };
      const navigateToGoods = (goodsId) => {
        if (goodsId == 0) {
          uni.showToast({
            title: "商品暂时没有录入",
            icon: "none"
          });
          return;
        }
        uni.navigateTo({
          url: `/pages/goods/goods?goods_id=${goodsId}`
        });
      };
      const getAuthorInfo = async (uid) => {
        try {
          const res = await uni.request({
            url: `${websiteUrl}/user-info?uid=${uid}`,
            method: "GET"
          });
          if (res.data.status === "success") {
            authorInfo.value = res.data.data;
          } else {
            formatAppLog("error", "at pages/collocation_share/collocation_share.vue:309", "获取用户信息失败:", res.data.msg);
          }
        } catch (error2) {
          formatAppLog("error", "at pages/collocation_share/collocation_share.vue:312", "用户信息请求失败:", error2);
          uni.showToast({
            title: "作者信息加载失败",
            icon: "none"
          });
        }
      };
      const navigateToUser = (uid) => {
        if (uid) {
          uni.navigateTo({
            url: `/pages/user/profile?uid=${uid}`
          });
        }
      };
      const handleError2 = (msg) => {
        error.value = true;
        errorMsg.value = msg;
        uni.showToast({
          title: msg,
          icon: "none"
        });
      };
      function likeFn() {
        let token = uni.getStorageSync("token");
        if (!global.isLogin) {
          uni.showToast({
            title: "请先登录",
            icon: "none"
          });
          return;
        }
        let type = origin.value == 1 ? 3 : 4;
        let requestData = {
          id: parseInt(detailData.value.id),
          type
        };
        let url = hasLike.value ? "/with-state/unlike" : "/with-state/add-like";
        uni.request({
          url: websiteUrl + url,
          method: "POST",
          header: {
            "Authorization": token
          },
          data: requestData,
          success: (res) => {
            formatAppLog("log", "at pages/collocation_share/collocation_share.vue:367", res.data);
            if (res.data.status == "success") {
              uni.showToast({
                title: "操作成功",
                icon: "success"
              });
              hasLike.value = !hasLike.value;
              getHasLike(detailData.value.id);
              fetchData(detailData.value.id, origin.value);
              return;
            } else {
              uni.showToast({
                title: res.data.msg,
                icon: "none"
              });
              return;
            }
          },
          fail: (err) => {
            formatAppLog("log", "at pages/collocation_share/collocation_share.vue:386", err);
            uni.showToast({
              title: "网络请求失败",
              icon: "none"
            });
          }
        });
      }
      function getHasLike(id) {
        let token = uni.getStorageSync("token");
        if (token == "") {
          return;
        }
        let type = origin.value == 1 ? 3 : 4;
        uni.request({
          url: websiteUrl + "/with-state/hasLike?id=" + id + "&type=" + type,
          method: "POST",
          header: {
            "Authorization": token
          },
          success: (res) => {
            if (res.data.status == "success") {
              if (res.data.data.id > 0) {
                hasLike.value = true;
              } else {
                hasLike.value = false;
              }
            } else {
              uni.showToast({
                title: res.data.msg,
                icon: "none"
              });
              return;
            }
          },
          fail: (err) => {
            formatAppLog("log", "at pages/collocation_share/collocation_share.vue:426", err);
            uni.showToast({
              title: "网络请求失败",
              icon: "none"
            });
          }
        });
      }
      function formatNumber(num) {
        if (num < 1e3) {
          return num.toString();
        } else {
          const kValue = Math.floor(num / 1e3);
          return `${kValue}k+`;
        }
      }
      const handleReplyComment = ({
        parent,
        target
      }) => {
        var _a;
        formatAppLog("log", "at pages/collocation_share/collocation_share.vue:450", "parent", parent);
        formatAppLog("log", "at pages/collocation_share/collocation_share.vue:451", "target", target);
        let item = parent;
        if (target != null) {
          item = target;
        }
        if (replyForItem.value.id == item.id) {
          replyForItem.value = {};
          return;
        }
        formatAppLog("log", "at pages/collocation_share/collocation_share.vue:462", "item", item);
        replyForItem.value = item;
        (_a = commentInputRef.value) == null ? void 0 : _a.focusInput();
      };
      const onShareAppMessage = () => ({
        title: "BJD娃圈你想知道的这里都有~",
        path: "/pages/news/news",
        success(res) {
          formatAppLog("log", "at pages/collocation_share/collocation_share.vue:472", "分享成功", res);
        },
        fail(err) {
          formatAppLog("log", "at pages/collocation_share/collocation_share.vue:475", "分享失败", err);
        },
        mp: {
          wxpath: "/pages/index/index.html"
        }
      });
      const handleCommentSubmit = ({
        content,
        replyInfo,
        origin: origin2
      }) => {
        let token = uni.getStorageSync("token");
        if (!global.isLogin) {
          uni.showToast({
            title: "请先登录",
            icon: "none"
          });
          return;
        }
        formatAppLog("log", "at pages/collocation_share/collocation_share.vue:494", "reply_info", replyInfo);
        const requestData = {
          content,
          origin: origin2,
          target_id: parseInt(pageId2.value),
          type: props.origin == 1 ? 3 : 6,
          ...replyInfo.id && {
            reply_id: replyInfo.id,
            reply_for: replyInfo.comment,
            reply_user_id: replyInfo.user_id,
            parent_id: replyInfo.parent_id > 0 ? replyInfo.parent_id : replyInfo.id
          }
        };
        uni.request({
          url: websiteUrl + "/with-state/add-comment",
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
              uni.showToast({
                title: "评论成功",
                icon: "success"
              });
            } else {
              uni.showToast({
                title: res.data.msg,
                icon: "none"
              });
            }
          },
          fail: (err) => {
            uni.showToast({
              title: "网络请求失败",
              icon: "none"
            });
          }
        });
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
      onShow(() => {
        formatAppLog("log", "at pages/collocation_share/collocation_share.vue:568", "注册键盘弹出事件");
        uni.onKeyboardHeightChange(keyboardHeightChangeHandler);
      });
      onLoad((options) => {
        try {
          if (!options.collocation_id) {
            error.value = true;
            errorMsg.value = "缺少必要参数Id";
            return;
          }
          if (!options.origin) {
            error.value = true;
            errorMsg.value = "缺少必要参数Origin";
            return;
          }
          pageId2.value = options.collocation_id;
          origin.value = options.origin;
          fetchData(options.collocation_id, options.origin);
          asyncGetUserInfo().then((userInfo) => {
            formatAppLog("log", "at pages/collocation_share/collocation_share.vue:591", userInfo);
            getHasLike(options.collocation_id);
          });
        } catch (err) {
          formatAppLog("error", "at pages/collocation_share/collocation_share.vue:597", "onLoad Error:", err);
          uni.showToast({
            title: "加载失败",
            icon: "none"
          });
        }
      });
      const __returned__ = { detailData, authorInfo, systemInfo: systemInfo2, loading, error, errorMsg, props, pageId: pageId2, origin, get hasLike() {
        return hasLike;
      }, set hasLike(v) {
        hasLike = v;
      }, commentListRef, commentInputRef, get commentsPage() {
        return commentsPage;
      }, set commentsPage(v) {
        commentsPage = v;
      }, get replyForItem() {
        return replyForItem;
      }, set replyForItem(v) {
        replyForItem = v;
      }, jump2user, getGoodsInfo, viewFullImage, fetchData, navigateToGoods, getAuthorInfo, navigateToUser, handleError: handleError2, likeFn, getHasLike, formatNumber, handleReplyComment, onShareAppMessage, handleCommentSubmit, formatTimestamp, ref: vue.ref, onMounted: vue.onMounted, computed: vue.computed, get onLoad() {
        return onLoad;
      }, get onShow() {
        return onShow;
      }, get onHide() {
        return onHide;
      }, get websiteUrl() {
        return websiteUrl;
      }, get image1Url() {
        return image1Url;
      }, get wechatSignLogin() {
        return wechatSignLogin;
      }, get getUserInfo() {
        return getUserInfo;
      }, get global() {
        return global;
      }, get asyncGetUserInfo() {
        return asyncGetUserInfo;
      }, get getScene() {
        return getScene;
      }, get chooseImage() {
        return chooseImage;
      }, get jumpToCroper() {
        return jumpToCroper;
      }, get getQiniuToken() {
        return getQiniuToken;
      }, get uploadImageToQiniu() {
        return uploadImageToQiniu;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$i(_ctx, _cache, $props, $setup, $data, $options) {
    var _a;
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$6);
    const _component_comment_list = resolveEasycom(vue.resolveDynamicComponent("comment-list"), __easycom_1$2);
    const _component_comment_input = resolveEasycom(vue.resolveDynamicComponent("comment-input"), __easycom_2);
    return vue.openBlock(), vue.createElementBlock("view", null, [
      vue.createCommentVNode(" 图片轮播区域 "),
      vue.createElementVNode("view", { style: { "position": "relative" } }, [
        vue.createElementVNode("view", {
          class: "heart",
          onClick: _cache[0] || (_cache[0] = ($event) => $setup.likeFn())
        }, [
          vue.createCommentVNode(' 				<image src="../../static/heart-w.png" v-if="!hasLike"></image>\r\n				<image src="../../static/heart2.png" v-else></image> '),
          !$setup.hasLike ? (vue.openBlock(), vue.createBlock(_component_uni_icons, {
            key: 0,
            type: "heart",
            size: "28",
            color: "#ff4d4f"
          })) : (vue.openBlock(), vue.createBlock(_component_uni_icons, {
            key: 1,
            type: "heart-filled",
            size: "28",
            color: "#ff4d4f"
          })),
          vue.createElementVNode(
            "text",
            { class: "num" },
            vue.toDisplayString(((_a = $setup.detailData) == null ? void 0 : _a.like_count) ? $setup.formatNumber($setup.detailData.like_count) : 0),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("swiper", {
          class: "swiper-box",
          "indicator-dots": true,
          autoplay: false
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.detailData.image_url_list, (img, index) => {
              return vue.openBlock(), vue.createElementBlock("swiper-item", { key: index }, [
                vue.createElementVNode("image", {
                  src: img,
                  mode: "aspectFill",
                  class: "swiper-image",
                  onClick: ($event) => $setup.viewFullImage(index)
                }, null, 8, ["src", "onClick"])
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      vue.createCommentVNode(" 新增作者信息区域 "),
      vue.createElementVNode("view", {
        class: "author-info",
        onClick: _cache[1] || (_cache[1] = ($event) => $setup.jump2user($setup.detailData.uid))
      }, [
        vue.createElementVNode("image", {
          class: "avatar",
          src: $setup.authorInfo.avatar,
          mode: "aspectFill"
        }, null, 8, ["src"]),
        vue.createElementVNode("view", { class: "user-meta" }, [
          vue.createElementVNode(
            "text",
            { class: "username" },
            vue.toDisplayString($setup.authorInfo.user_name || "未知用户"),
            1
            /* TEXT */
          ),
          vue.createCommentVNode(" 新增发布时间 "),
          vue.createElementVNode(
            "text",
            { class: "publish-time" },
            "发布于 " + vue.toDisplayString($setup.formatTimestamp($setup.detailData.created_at)),
            1
            /* TEXT */
          )
        ])
      ]),
      vue.createCommentVNode(" 图文信息区域 "),
      vue.createElementVNode("view", { class: "content-box" }, [
        vue.createElementVNode(
          "text",
          { class: "title" },
          vue.toDisplayString($setup.detailData.title),
          1
          /* TEXT */
        ),
        vue.createElementVNode(
          "text",
          { class: "content" },
          vue.toDisplayString($setup.detailData.content),
          1
          /* TEXT */
        )
      ]),
      vue.createCommentVNode(" 关联商品列表 "),
      vue.createElementVNode("view", { class: "goods-list" }, [
        vue.createCommentVNode(' <text class="about">相关商品</text> '),
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.detailData.collocation_relation_list, (item) => {
            var _a2, _b;
            return vue.openBlock(), vue.createElementBlock("view", {
              key: item.id,
              class: "goods-item",
              onClick: ($event) => item.relation_goods_id > 0 ? $setup.navigateToGoods(item.relation_goods_id) : null
            }, [
              vue.createCommentVNode(" 商品图片 "),
              vue.createElementVNode("view", { class: "image-container" }, [
                item.relation_goods_id === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "placeholder-box"
                }, [
                  vue.createElementVNode("text", { style: { "color": "#fff", "font-size": "45px" } }, "?")
                ])) : (vue.openBlock(), vue.createElementBlock(
                  vue.Fragment,
                  { key: 1 },
                  [
                    item.imageLoaded ? (vue.openBlock(), vue.createElementBlock("image", {
                      key: 0,
                      src: ((_b = (_a2 = item.goodsInfo) == null ? void 0 : _a2.goods_images) == null ? void 0 : _b[0]) || "/static/goods-default.png",
                      mode: "aspectFill",
                      class: "goods-image"
                    }, null, 8, ["src"])) : item.imageError ? (vue.openBlock(), vue.createElementBlock("view", {
                      key: 1,
                      class: "error-box"
                    }, [
                      vue.createElementVNode("text", null, "图片加载失败")
                    ])) : (vue.openBlock(), vue.createElementBlock("view", {
                      key: 2,
                      class: "loading-box"
                    }, [
                      vue.createElementVNode("text", null, "加载中...")
                    ]))
                  ],
                  64
                  /* STABLE_FRAGMENT */
                ))
              ]),
              vue.createElementVNode("view", { class: "goods-info" }, [
                vue.createElementVNode(
                  "text",
                  { class: "brand" },
                  vue.toDisplayString(item.relation_brand_name) + " - " + vue.toDisplayString(item.relation_goods_name),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("view", null, [
                  vue.createElementVNode(
                    "text",
                    { class: "category" },
                    vue.toDisplayString(item.type),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "price" },
                    " （" + vue.toDisplayString(item.goodsInfo && item.goodsInfo.total_amount ? item.goodsInfo.total_amount + item.goodsInfo.currency : "贩售价格未收录") + "）",
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "see font-alimamashuhei" }, " 去看看 → ")
              ])
            ], 8, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      vue.createCommentVNode(" 评论区（保留原有结构，需根据接口调整） "),
      $setup.origin > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        style: { "padding": "10px" }
      }, [
        vue.createVNode(_component_comment_list, {
          ref: "commentListRef",
          type: $setup.origin == 1 ? 3 : 6,
          "relation-id": parseInt($setup.pageId),
          onReply: $setup.handleReplyComment
        }, null, 8, ["type", "relation-id"])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 加载状态 "),
      vue.createCommentVNode(" 输入框 "),
      vue.createVNode(_component_comment_input, {
        ref: "commentInputRef",
        "reply-info": $setup.replyForItem,
        "target-id": $setup.pageId,
        onSubmit: $setup.handleCommentSubmit,
        "onUpdate:replyInfo": _cache[2] || (_cache[2] = (val) => $setup.replyForItem = val)
      }, null, 8, ["reply-info", "target-id"]),
      vue.createElementVNode("view", { style: { "width": "100%", "height": "120rpx" } }),
      vue.createCommentVNode(" 加载状态 "),
      $setup.loading ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "loading"
      }, "加载中...")) : vue.createCommentVNode("v-if", true),
      $setup.error ? (vue.openBlock(), vue.createElementBlock(
        "view",
        {
          key: 2,
          class: "error"
        },
        vue.toDisplayString($setup.errorMsg),
        1
        /* TEXT */
      )) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesCollocationShareCollocationShare = /* @__PURE__ */ _export_sfc(_sfc_main$j, [["render", _sfc_render$i], ["__scopeId", "data-v-38d96b75"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/collocation_share/collocation_share.vue"]]);
  const _sfc_main$i = {
    __name: "user_page",
    props: ["uid"],
    setup(__props, { expose: __expose }) {
      __expose();
      const currentTab = vue.ref(0);
      const tabs = vue.ref(["搭配", "娃柜", "点评"]);
      const props = __props;
      const userInfo = vue.ref({
        avatar: "",
        user_name: "加载中..."
      });
      const collocations = vue.ref([]);
      const dolls = vue.ref([]);
      const reviews = vue.ref([]);
      const paginations = vue.ref([
        {
          // 搭配
          page: 1,
          pageSize: 10,
          total: 0,
          loading: false,
          finished: false
        },
        {
          // 娃柜
          page: 1,
          pageSize: 10,
          total: 0,
          loading: false,
          finished: false
        },
        {
          // 点评
          page: 1,
          pageSize: 10,
          total: 0,
          loading: false,
          finished: false
        }
      ]);
      vue.watch(currentTab, (newVal) => {
        paginations.value[newVal];
        const currentData = [collocations, dolls, reviews][newVal].value;
        if (currentData.length === 0) {
          loadData();
        }
      });
      const loadData = async () => {
        const currentPagination = paginations.value[currentTab.value];
        if (currentPagination.loading || currentPagination.finished) {
          return;
        }
        currentPagination.loading = true;
        try {
          let url, listKey;
          switch (currentTab.value) {
            case 0:
              url = `/user-info/collection?user_id=${props.uid}&page=${currentPagination.page}`;
              listKey = "List";
              break;
            case 1:
              url = `/user-info/show-case?user_id=${props.uid}&page=${currentPagination.page}`;
              listKey = "List";
              break;
            case 2:
              url = `/user-info/posts?user_id=${props.uid}&page=${currentPagination.page}`;
              listKey = "comment_list";
              break;
          }
          formatAppLog("log", "at pages/user_page/user_page.vue:151", `${websiteUrl}${url}`);
          const res = await uni.request({
            url: `${websiteUrl}${url}`
          });
          if (res.data.status === "success") {
            const data = res.data.data;
            const list = data[listKey];
            const transformed = list.map((item) => {
              var _a, _b, _c;
              switch (currentTab.value) {
                case 0:
                  return {
                    id: item.id,
                    cover: ((_a = item.image_urls) == null ? void 0 : _a.split(",")[0]) || "",
                    images: ((_b = item.image_urls) == null ? void 0 : _b.split(",")) || [],
                    title: item.title,
                    time: item.created_at
                  };
                case 1:
                  return {
                    id: item.id,
                    cover: ((_c = item.image_urls) == null ? void 0 : _c.split(",")[0]) || "",
                    title: item.name,
                    desc: item.description,
                    time: item.created_at
                  };
                case 2:
                  return {
                    id: item.id,
                    product_thumb: item.target_image,
                    product_name: item.target_name,
                    content: item.comment,
                    create_time: formatTime(item.created_at)
                  };
              }
            });
            const target = [collocations, dolls, reviews][currentTab.value];
            target.value = [...target.value, ...transformed];
            currentPagination.total = data.total;
            currentPagination.finished = target.value.length >= data.total;
            currentPagination.page++;
          }
        } catch (error) {
          formatAppLog("log", "at pages/user_page/user_page.vue:200", error);
          uni.showToast({
            title: "数据加载失败",
            icon: "none"
          });
        } finally {
          currentPagination.loading = false;
        }
      };
      const getAuthorInfo = async () => {
        try {
          const res = await uni.request({
            url: `${websiteUrl}/user-info?uid=${props.uid}`
          });
          if (res.data.status === "success") {
            userInfo.value = res.data.data;
          }
        } catch (error) {
          uni.showToast({
            title: "用户信息加载失败",
            icon: "none"
          });
        }
      };
      const formatTime = (timestamp) => {
        const date = new Date(timestamp * 1e3);
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
      };
      uni.setNavigationBarTitle({
        title: "用户主页"
      });
      onShow(() => {
        getAuthorInfo();
        loadData();
      });
      onReachBottom(() => {
        loadData();
      });
      const __returned__ = { currentTab, tabs, props, userInfo, collocations, dolls, reviews, paginations, loadData, getAuthorInfo, formatTime, ref: vue.ref, watch: vue.watch, onMounted: vue.onMounted, get onShow() {
        return onShow;
      }, get onReachBottom() {
        return onReachBottom;
      }, get websiteUrl() {
        return websiteUrl;
      }, get wechatSignLogin() {
        return wechatSignLogin;
      }, get getUserInfo() {
        return getUserInfo;
      }, get global() {
        return global;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$h(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "page-container" }, [
      vue.createElementVNode("meta", {
        name: "theme-color",
        content: "#F8F8F8"
      }),
      vue.createElementVNode("view", { class: "header_container" }, [
        vue.createCommentVNode(" 头部区域 "),
        vue.createElementVNode("view", { class: "header" }, [
          vue.createElementVNode("image", {
            class: "avatar",
            src: $setup.userInfo.avatar,
            mode: "aspectFill"
          }, null, 8, ["src"]),
          vue.createElementVNode(
            "text",
            { class: "username" },
            vue.toDisplayString($setup.userInfo.user_name),
            1
            /* TEXT */
          )
        ]),
        vue.createCommentVNode(" Tab切换 "),
        vue.createElementVNode("view", { class: "tabs" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.tabs, (tab, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: index,
                class: vue.normalizeClass(["tab-item font-alimamashuhei", { active: $setup.currentTab === index }]),
                onClick: ($event) => $setup.currentTab = index
              }, vue.toDisplayString(tab), 11, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      vue.createCommentVNode(" 内容区域 "),
      vue.createElementVNode("view", { class: "content" }, [
        vue.createCommentVNode(" 搭配列表 "),
        $setup.currentTab === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "collocation-list"
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.collocations, (item, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: index,
                class: "collocation-item item-image-container",
                onClick: ($event) => _ctx.navigateTo(`/pages/collocation_share/collocation_share?collocation_id=${item.id}`)
              }, [
                vue.createElementVNode("image", {
                  class: "item-image",
                  src: item.cover,
                  mode: "aspectFill"
                }, null, 8, ["src"]),
                vue.createElementVNode(
                  "text",
                  { class: "item-title" },
                  vue.toDisplayString(item.title),
                  1
                  /* TEXT */
                )
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 娃柜列表 "),
        $setup.currentTab === 1 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "doll-list"
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.dolls, (item, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: index,
                class: "doll-item item-image-container",
                onClick: ($event) => _ctx.navigateTo(`/pages/user_doll/user_doll?id=${item.id}`)
              }, [
                vue.createElementVNode("image", {
                  class: "item-image",
                  src: item.cover,
                  mode: "aspectFill"
                }, null, 8, ["src"]),
                vue.createElementVNode(
                  "text",
                  { class: "item-title" },
                  vue.toDisplayString(item.title),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "item-price" },
                  "¥" + vue.toDisplayString(item.price),
                  1
                  /* TEXT */
                )
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 点评列表 "),
        $setup.currentTab === 2 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 2,
          class: "review-list"
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.reviews, (item, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: index,
                class: "review-item"
              }, [
                vue.createElementVNode("image", {
                  class: "product-thumb",
                  src: item.product_thumb,
                  mode: "aspectFill"
                }, null, 8, ["src"]),
                vue.createElementVNode("view", { class: "review-content" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "product-name" },
                    vue.toDisplayString(item.product_name),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "review-text" },
                    vue.toDisplayString(item.content),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "review-time" },
                    vue.toDisplayString(item.create_time),
                    1
                    /* TEXT */
                  )
                ])
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : vue.createCommentVNode("v-if", true)
      ])
    ]);
  }
  const PagesUserPageUserPage = /* @__PURE__ */ _export_sfc(_sfc_main$i, [["render", _sfc_render$h], ["__scopeId", "data-v-c3556478"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/user_page/user_page.vue"]]);
  let mpMixins = {};
  mpMixins = {
    data() {
      return {
        is_show: "none"
      };
    },
    watch: {
      show(newVal) {
        this.is_show = this.show;
      }
    },
    created() {
      this.swipeaction = this.getSwipeAction();
      if (this.swipeaction && Array.isArray(this.swipeaction.children)) {
        this.swipeaction.children.push(this);
      }
    },
    mounted() {
      this.is_show = this.show;
    },
    methods: {
      // wxs 中调用
      closeSwipe(e) {
        if (this.autoClose && this.swipeaction) {
          this.swipeaction.closeOther(this);
        }
      },
      change(e) {
        this.$emit("change", e.open);
        if (this.is_show !== e.open) {
          this.is_show = e.open;
        }
      },
      appTouchStart(e) {
        const {
          clientX
        } = e.changedTouches[0];
        this.clientX = clientX;
        this.timestamp = (/* @__PURE__ */ new Date()).getTime();
      },
      appTouchEnd(e, index, item, position) {
        const {
          clientX
        } = e.changedTouches[0];
        let diff = Math.abs(this.clientX - clientX);
        let time = (/* @__PURE__ */ new Date()).getTime() - this.timestamp;
        if (diff < 40 && time < 300) {
          this.$emit("click", {
            content: item,
            index,
            position
          });
        }
      },
      onClickForPC(index, item, position) {
        return;
      }
    }
  };
  const mpwxs = mpMixins;
  let bindIngXMixins = {};
  let otherMixins = {};
  const block0$1 = (Comp) => {
    (Comp.$wxs || (Comp.$wxs = [])).push("wxsswipe");
    (Comp.$wxsModules || (Comp.$wxsModules = {}))["wxsswipe"] = "afd46426";
  };
  const block1 = (Comp) => {
    (Comp.$renderjs || (Comp.$renderjs = [])).push("renderswipe");
    (Comp.$renderjsModules || (Comp.$renderjsModules = {}))["renderswipe"] = "5a1e922e";
  };
  const _sfc_main$h = {
    mixins: [mpwxs, bindIngXMixins, otherMixins],
    emits: ["click", "change"],
    props: {
      // 控制开关
      show: {
        type: String,
        default: "none"
      },
      // 禁用
      disabled: {
        type: Boolean,
        default: false
      },
      // 是否自动关闭
      autoClose: {
        type: Boolean,
        default: true
      },
      // 滑动缺省距离
      threshold: {
        type: Number,
        default: 20
      },
      // 左侧按钮内容
      leftOptions: {
        type: Array,
        default() {
          return [];
        }
      },
      // 右侧按钮内容
      rightOptions: {
        type: Array,
        default() {
          return [];
        }
      }
    },
    // TODO vue3
    unmounted() {
      this.__isUnmounted = true;
      this.uninstall();
    },
    methods: {
      uninstall() {
        if (this.swipeaction) {
          this.swipeaction.children.forEach((item, index) => {
            if (item === this) {
              this.swipeaction.children.splice(index, 1);
            }
          });
        }
      },
      /**
       * 获取父元素实例
       */
      getSwipeAction(name = "uniSwipeAction") {
        let parent = this.$parent;
        let parentName = parent.$options.name;
        while (parentName !== name) {
          parent = parent.$parent;
          if (!parent)
            return false;
          parentName = parent.$options.name;
        }
        return parent;
      }
    }
  };
  function _sfc_render$g(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      vue.Fragment,
      null,
      [
        vue.createCommentVNode(" 在微信小程序 app vue端 h5 使用wxs 实现"),
        vue.createElementVNode("view", { class: "uni-swipe" }, [
          vue.createElementVNode("view", {
            class: "uni-swipe_box",
            "change:prop": _ctx.wxsswipe.showWatch,
            prop: vue.wp(_ctx.is_show),
            "data-threshold": $props.threshold,
            "data-disabled": $props.disabled,
            onTouchstart: _cache[2] || (_cache[2] = (...args) => _ctx.wxsswipe.touchstart && _ctx.wxsswipe.touchstart(...args)),
            onTouchmove: _cache[3] || (_cache[3] = (...args) => _ctx.wxsswipe.touchmove && _ctx.wxsswipe.touchmove(...args)),
            onTouchend: _cache[4] || (_cache[4] = (...args) => _ctx.wxsswipe.touchend && _ctx.wxsswipe.touchend(...args))
          }, [
            vue.createCommentVNode(" 在微信小程序 app vue端 h5 使用wxs 实现"),
            vue.createElementVNode("view", { class: "uni-swipe_button-group button-group--left" }, [
              vue.renderSlot(_ctx.$slots, "left", {}, () => [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($props.leftOptions, (item, index) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      key: index,
                      style: vue.normalizeStyle({
                        backgroundColor: item.style && item.style.backgroundColor ? item.style.backgroundColor : "#C7C6CD"
                      }),
                      class: "uni-swipe_button button-hock",
                      onTouchstart: _cache[0] || (_cache[0] = vue.withModifiers((...args) => _ctx.appTouchStart && _ctx.appTouchStart(...args), ["stop"])),
                      onTouchend: vue.withModifiers(($event) => _ctx.appTouchEnd($event, index, item, "left"), ["stop"]),
                      onClick: vue.withModifiers(($event) => _ctx.onClickForPC(index, item, "left"), ["stop"])
                    }, [
                      vue.createElementVNode(
                        "text",
                        {
                          class: "uni-swipe_button-text",
                          style: vue.normalizeStyle({ color: item.style && item.style.color ? item.style.color : "#FFFFFF", fontSize: item.style && item.style.fontSize ? item.style.fontSize : "16px" })
                        },
                        vue.toDisplayString(item.text),
                        5
                        /* TEXT, STYLE */
                      )
                    ], 44, ["onTouchend", "onClick"]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ], true)
            ]),
            vue.createElementVNode("view", { class: "uni-swipe_text--center" }, [
              vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
            ]),
            vue.createElementVNode("view", { class: "uni-swipe_button-group button-group--right" }, [
              vue.renderSlot(_ctx.$slots, "right", {}, () => [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($props.rightOptions, (item, index) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      key: index,
                      style: vue.normalizeStyle({
                        backgroundColor: item.style && item.style.backgroundColor ? item.style.backgroundColor : "#C7C6CD"
                      }),
                      class: "uni-swipe_button button-hock",
                      onTouchstart: _cache[1] || (_cache[1] = vue.withModifiers((...args) => _ctx.appTouchStart && _ctx.appTouchStart(...args), ["stop"])),
                      onTouchend: vue.withModifiers(($event) => _ctx.appTouchEnd($event, index, item, "right"), ["stop"]),
                      onClick: vue.withModifiers(($event) => _ctx.onClickForPC(index, item, "right"), ["stop"])
                    }, [
                      vue.createElementVNode(
                        "text",
                        {
                          class: "uni-swipe_button-text",
                          style: vue.normalizeStyle({ color: item.style && item.style.color ? item.style.color : "#FFFFFF", fontSize: item.style && item.style.fontSize ? item.style.fontSize : "16px" })
                        },
                        vue.toDisplayString(item.text),
                        5
                        /* TEXT, STYLE */
                      )
                    ], 44, ["onTouchend", "onClick"]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ], true)
            ])
          ], 40, ["change:prop", "prop", "data-threshold", "data-disabled"])
        ]),
        vue.createCommentVNode(" app nvue端 使用 bindingx "),
        vue.createCommentVNode(" 其他平台使用 js ，长列表性能可能会有影响")
      ],
      2112
      /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
    );
  }
  if (typeof block0$1 === "function")
    block0$1(_sfc_main$h);
  if (typeof block1 === "function")
    block1(_sfc_main$h);
  const __easycom_0$1 = /* @__PURE__ */ _export_sfc(_sfc_main$h, [["render", _sfc_render$g], ["__scopeId", "data-v-8ff2a577"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/uni_modules/uni-swipe-action/components/uni-swipe-action-item/uni-swipe-action-item.vue"]]);
  const _sfc_main$g = {
    name: "uniSwipeAction",
    data() {
      return {};
    },
    created() {
      this.children = [];
    },
    methods: {
      // 公开给用户使用，重制组件样式
      resize() {
      },
      // 公开给用户使用，关闭全部 已经打开的组件
      closeAll() {
        this.children.forEach((vm) => {
          vm.is_show = "none";
        });
      },
      closeOther(vm) {
        if (this.openItem && this.openItem !== vm) {
          this.openItem.is_show = "none";
        }
        this.openItem = vm;
      }
    }
  };
  function _sfc_render$f(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", null, [
      vue.renderSlot(_ctx.$slots, "default")
    ]);
  }
  const __easycom_1 = /* @__PURE__ */ _export_sfc(_sfc_main$g, [["render", _sfc_render$f], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/uni_modules/uni-swipe-action/components/uni-swipe-action/uni-swipe-action.vue"]]);
  const _sfc_main$f = {
    __name: "message_list",
    setup(__props, { expose: __expose }) {
      __expose();
      const messageList = vue.ref([]);
      const unreadCount = vue.ref(0);
      const page = vue.ref(1);
      const isRefreshing = vue.ref(false);
      const hasMore = vue.ref(true);
      const loading = vue.ref(false);
      const swipeOptions = (item) => {
        return [
          {
            text: "删除",
            style: {
              backgroundColor: "#dd524d"
            },
            data: {
              type: "delete",
              id: item.id
            }
          },
          {
            text: item.is_read ? "已读" : "标记已读",
            style: {
              backgroundColor: "#6fd0d4"
            },
            data: {
              type: "read",
              id: item.id
            }
          }
        ];
      };
      vue.onMounted(async () => {
        await asyncGetUserInfo();
        fetchMessages();
        fetchUnreadCount();
        uni.setNavigationBarTitle({
          title: "消息"
        });
      });
      const fetchMessages = async (isLoadMore = false) => {
        try {
          loading.value = true;
          const targetPage = isLoadMore ? page.value : 1;
          const res = await uni.request({
            url: `${websiteUrl}/with-state/user-messages?page=${targetPage}`,
            header: {
              Authorization: uni.getStorageSync("token")
            }
          });
          if (res.data.status === "success") {
            const newMessages = res.data.data.message_list;
            if (isLoadMore) {
              messageList.value = [...messageList.value, ...newMessages];
            } else {
              messageList.value = newMessages;
            }
            hasMore.value = newMessages.length >= 10;
            page.value = targetPage + (hasMore.value ? 1 : 0);
          }
        } catch (error) {
          uni.showToast({
            title: "消息加载失败",
            icon: "none"
          });
        } finally {
          loading.value = false;
          isRefreshing.value = false;
        }
      };
      const onRefresh = () => {
        if (loading.value)
          return;
        isRefreshing.value = true;
        page.value = 1;
        hasMore.value = true;
        fetchMessages();
      };
      const loadMore = () => {
        formatAppLog("log", "at pages/message_list/message_list.vue:137", "触发加载更多", loading.value, hasMore.value);
        if (loading.value || !hasMore.value)
          return;
        fetchMessages(true);
      };
      const fetchUnreadCount = async () => {
        try {
          const res = await uni.request({
            url: `${websiteUrl}/with-state/unread-message-count`,
            header: {
              Authorization: uni.getStorageSync("token")
            }
          });
          if (res.data.status === "success") {
            unreadCount.value = res.data.data.count;
          }
        } catch (error) {
          uni.showToast({
            title: "未读数获取失败",
            icon: "none"
          });
        }
      };
      const handleSwipeClick = (e) => {
        const {
          type,
          id
        } = e.content.data;
        if (type === "delete") {
          showDeleteConfirm(id);
        } else if (type === "read") {
          markAsRead(id);
        }
      };
      const showDeleteConfirm = (messageId) => {
        uni.showModal({
          title: "删除确认",
          content: "确定要删除这条消息吗？",
          success: (res) => {
            if (res.confirm) {
              deleteMessage(messageId);
            }
          }
        });
      };
      const deleteMessage = async (messageId) => {
        try {
          await uni.request({
            url: `${websiteUrl}/with-state/delete-message`,
            method: "POST",
            header: {
              "Authorization": uni.getStorageSync("token"),
              "Content-Type": "application/json"
            },
            data: {
              message_id: messageId
            }
          });
          messageList.value = messageList.value.filter((item) => item.id !== messageId);
          fetchUnreadCount();
          uni.showToast({
            title: "删除成功"
          });
        } catch (error) {
          uni.showToast({
            title: "删除失败",
            icon: "none"
          });
        }
      };
      const markAsRead = async (messageId) => {
        try {
          await uni.request({
            url: `${websiteUrl}/with-state/mark-message-read`,
            method: "POST",
            header: {
              "Authorization": uni.getStorageSync("token"),
              "Content-Type": "application/json"
            },
            data: {
              message_id: messageId
            }
          });
          const item = messageList.value.find((i) => i.id === messageId);
          if (item && !item.is_read) {
            item.is_read = 1;
            unreadCount.value--;
          }
        } catch (error) {
          uni.showToast({
            title: "标记失败",
            icon: "none"
          });
        }
      };
      const gotoDetail = (id) => {
        uni.navigateTo({
          url: `/pages/message_info/message_info?message_id=${id}`
        });
      };
      const formatTime = (timestamp) => {
        const date = new Date(timestamp * 1e3);
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      };
      const __returned__ = { messageList, unreadCount, page, isRefreshing, hasMore, loading, swipeOptions, fetchMessages, onRefresh, loadMore, fetchUnreadCount, handleSwipeClick, showDeleteConfirm, deleteMessage, markAsRead, gotoDetail, formatTime, ref: vue.ref, onMounted: vue.onMounted, get websiteUrl() {
        return websiteUrl;
      }, get global() {
        return global;
      }, get asyncGetUserInfo() {
        return asyncGetUserInfo;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$e(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_swipe_action_item = resolveEasycom(vue.resolveDynamicComponent("uni-swipe-action-item"), __easycom_0$1);
    const _component_uni_swipe_action = resolveEasycom(vue.resolveDynamicComponent("uni-swipe-action"), __easycom_1);
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("meta", {
        name: "theme-color",
        content: "#F8F8F8"
      }),
      vue.createCommentVNode(" 顶部未读消息 "),
      vue.createCommentVNode('    <view class="header">\r\n      <text class="unread-count">未读消息：{{ unreadCount }}</text>\r\n    </view> '),
      vue.createCommentVNode(" 消息列表 "),
      vue.createElementVNode(
        "scroll-view",
        {
          class: "message-list",
          "scroll-y": "",
          onScrolltolower: $setup.loadMore,
          "show-scrollbar": false
        },
        [
          vue.createVNode(_component_uni_swipe_action, null, {
            default: vue.withCtx(() => [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.messageList, (item) => {
                  return vue.openBlock(), vue.createBlock(_component_uni_swipe_action_item, {
                    key: item.id,
                    "right-options": $setup.swipeOptions(item),
                    threshold: 0.4,
                    onClick: $setup.handleSwipeClick
                  }, {
                    default: vue.withCtx(() => [
                      vue.createElementVNode("view", {
                        class: "message-item",
                        onClick: ($event) => $setup.gotoDetail(item.id)
                      }, [
                        vue.createCommentVNode(" 头图 "),
                        vue.createElementVNode("image", {
                          class: "cover-image",
                          src: item.cover_image,
                          mode: "aspectFill"
                        }, null, 8, ["src"]),
                        vue.createCommentVNode(" 消息内容 "),
                        vue.createElementVNode("view", { class: "content" }, [
                          vue.createElementVNode(
                            "text",
                            { class: "title" },
                            vue.toDisplayString(item.title),
                            1
                            /* TEXT */
                          ),
                          vue.createElementVNode(
                            "text",
                            {
                              class: vue.normalizeClass(["msg", { unread: !item.is_read }])
                            },
                            vue.toDisplayString(item.msg),
                            3
                            /* TEXT, CLASS */
                          )
                        ]),
                        vue.createCommentVNode(" 时间 "),
                        vue.createElementVNode(
                          "text",
                          { class: "time" },
                          vue.toDisplayString($setup.formatTime(item.created_at)),
                          1
                          /* TEXT */
                        )
                      ], 8, ["onClick"])
                    ]),
                    _: 2
                    /* DYNAMIC */
                  }, 1032, ["right-options"]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ]),
            _: 1
            /* STABLE */
          }),
          vue.createElementVNode("view", { class: "loading-wrapper" }, [
            $setup.loading ? (vue.openBlock(), vue.createElementBlock("text", {
              key: 0,
              class: "loading-text"
            }, "加载中...")) : vue.createCommentVNode("v-if", true),
            !$setup.hasMore ? (vue.openBlock(), vue.createElementBlock("text", {
              key: 1,
              class: "loading-text"
            }, "没有更多数据了")) : vue.createCommentVNode("v-if", true)
          ])
        ],
        32
        /* NEED_HYDRATION */
      )
    ]);
  }
  const PagesMessageListMessageList = /* @__PURE__ */ _export_sfc(_sfc_main$f, [["render", _sfc_render$e], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/message_list/message_list.vue"]]);
  const _sfc_main$e = {
    __name: "message_info",
    props: ["message_id"],
    setup(__props, { expose: __expose }) {
      __expose();
      const props = __props;
      const messageDetail = vue.ref(null);
      const loading = vue.ref(true);
      const error = vue.ref("");
      const messageId = vue.ref("");
      const fetchMessageDetail = async () => {
        try {
          loading.value = true;
          error.value = "";
          if (!messageId.value) {
            error.value = "无效的消息ID";
            return;
          }
          const userInfo = await asyncGetUserInfo();
          if (!userInfo) {
            error.value = "请先登录";
            return;
          }
          const res = await uni.request({
            url: `${websiteUrl}/with-state/message-detail`,
            method: "GET",
            data: { id: messageId.value },
            header: { Authorization: uni.getStorageSync("token") }
          });
          if (res.data.status === "success") {
            messageDetail.value = res.data.data;
            uni.$emit("message-status-update", {
              id: messageId.value,
              is_read: 1
            });
          } else {
            error.value = res.data.msg || "获取详情失败";
          }
        } catch (err) {
          error.value = "请求失败，请检查网络";
          formatAppLog("error", "at pages/message_info/message_info.vue:96", "详情请求失败:", err);
        } finally {
          loading.value = false;
        }
      };
      const formatTime = (timestamp) => {
        const date = new Date(timestamp * 1e3);
        return date.toLocaleDateString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
        }).replace(/\//g, "-");
      };
      vue.onMounted(() => {
        uni.setNavigationBarTitle({
          title: "消息详情"
        });
        messageId.value = props.message_id;
        fetchMessageDetail();
      });
      const __returned__ = { props, messageDetail, loading, error, messageId, fetchMessageDetail, formatTime, ref: vue.ref, onMounted: vue.onMounted, get websiteUrl() {
        return websiteUrl;
      }, get asyncGetUserInfo() {
        return asyncGetUserInfo;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$d(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_load_more = vue.resolveComponent("uni-load-more");
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$6);
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 加载状态 "),
      $setup.loading ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "loading-wrapper"
      }, [
        vue.createVNode(_component_uni_load_more, { status: "loading" })
      ])) : $setup.error ? (vue.openBlock(), vue.createElementBlock(
        vue.Fragment,
        { key: 1 },
        [
          vue.createCommentVNode(" 错误提示 "),
          vue.createElementVNode("view", { class: "error-wrapper" }, [
            vue.createVNode(_component_uni_icons, {
              type: "info",
              size: "24",
              color: "#ff4d4f"
            }),
            vue.createElementVNode(
              "text",
              { class: "error-text" },
              vue.toDisplayString($setup.error),
              1
              /* TEXT */
            ),
            vue.createElementVNode("button", {
              class: "retry-btn",
              onClick: $setup.fetchMessageDetail
            }, "重试")
          ])
        ],
        2112
        /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
      )) : (vue.openBlock(), vue.createElementBlock(
        vue.Fragment,
        { key: 2 },
        [
          vue.createCommentVNode(" 内容区域 "),
          vue.createElementVNode("scroll-view", {
            class: "content-wrapper",
            "scroll-y": ""
          }, [
            vue.createCommentVNode(" 封面图 "),
            vue.createElementVNode("image", {
              class: "cover-image",
              src: $setup.messageDetail.cover_image,
              mode: "widthFix",
              "lazy-load": ""
            }, null, 8, ["src"]),
            vue.createElementVNode("view", { class: "main-content" }, [
              vue.createCommentVNode(" 标题和时间 "),
              vue.createElementVNode("view", { class: "header" }, [
                vue.createElementVNode(
                  "text",
                  { class: "title" },
                  vue.toDisplayString($setup.messageDetail.title),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "time" },
                  vue.toDisplayString($setup.formatTime($setup.messageDetail.created_at)),
                  1
                  /* TEXT */
                )
              ]),
              vue.createCommentVNode(" 消息正文 "),
              vue.createElementVNode("view", { class: "message-content" }, [
                vue.createElementVNode(
                  "text",
                  { class: "message-text" },
                  vue.toDisplayString($setup.messageDetail.msg),
                  1
                  /* TEXT */
                )
              ])
            ])
          ])
        ],
        2112
        /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
      ))
    ]);
  }
  const PagesMessageInfoMessageInfo = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["render", _sfc_render$d], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/message_info/message_info.vue"]]);
  const _sfc_main$d = {
    __name: "register",
    setup(__props, { expose: __expose }) {
      __expose();
      const formData = vue.ref({
        telephone: "",
        code: "",
        password: "",
        rePassword: ""
      });
      const errors = vue.ref({
        phone: "",
        code: "",
        password: "",
        rePassword: ""
      });
      const codeCountdown = vue.ref(0);
      const codeBtnDisabled = vue.computed(() => codeCountdown.value > 0);
      const codeBtnText = vue.computed(
        () => codeCountdown.value > 0 ? `${codeCountdown.value}秒后重发` : "获取验证码"
      );
      const loading = vue.ref(false);
      const validatePhone = () => {
        if (!formData.value.telephone) {
          errors.value.phone = "手机号不能为空";
          return false;
        }
        if (!/^1[3-9]\d{9}$/.test(formData.value.telephone)) {
          errors.value.phone = "手机号格式不正确";
          return false;
        }
        errors.value.phone = "";
        return true;
      };
      const sendSmsCode = async () => {
        if (!validatePhone())
          return;
        try {
          const res = await uni.request({
            url: `${websiteUrl}/send-sms-code`,
            method: "POST",
            data: { tel_phone: formData.value.telephone }
          });
          if (res.data.status === "success") {
            startCountdown();
            uni.showToast({ title: "验证码已发送", icon: "none" });
          } else {
            uni.showToast({ title: res.data.msg || "发送失败", icon: "none" });
          }
        } catch (err) {
          uni.showToast({ title: "网络请求失败", icon: "none" });
        }
      };
      const startCountdown = () => {
        codeCountdown.value = 60;
        const timer = setInterval(() => {
          if (codeCountdown.value <= 0) {
            clearInterval(timer);
            return;
          }
          codeCountdown.value--;
        }, 1e3);
      };
      const validatePassword = () => {
        if (formData.value.password.length < 6) {
          errors.value.password = "密码至少需要6位";
          return false;
        }
        errors.value.password = "";
        return true;
      };
      const validateRePassword = () => {
        if (formData.value.password !== formData.value.rePassword) {
          errors.value.rePassword = "两次密码输入不一致";
          return false;
        }
        errors.value.rePassword = "";
        return true;
      };
      const validateCode = () => {
        if (!formData.value.code) {
          errors.value.code = "验证码不能为空";
          return false;
        }
        if (formData.value.code.length !== 6) {
          errors.value.code = "验证码格式不正确";
          return false;
        }
        errors.value.code = "";
        return true;
      };
      const handleRegister = async () => {
        const validations = [
          validatePhone(),
          validateCode(),
          validatePassword(),
          validateRePassword()
        ];
        if (!validations.every((v) => v))
          return;
        try {
          loading.value = true;
          const res = await uni.request({
            url: `${websiteUrl}/register`,
            method: "POST",
            data: {
              telephone: formData.value.telephone,
              code: formData.value.code,
              password: formData.value.password,
              re_password: formData.value.rePassword
            }
          });
          if (res.data.status === "success") {
            uni.setStorageSync("token", res.data.data.jwt_token);
            uni.showToast({
              title: "注册成功",
              icon: "success",
              complete: () => {
                setTimeout(() => {
                  uni.switchTab({ url: "/pages/mine/mine" });
                }, 1500);
              }
            });
          } else {
            uni.showToast({ title: res.data.msg || "注册失败", icon: "none" });
          }
        } catch (err) {
          uni.showToast({ title: "网络请求失败", icon: "none" });
        } finally {
          loading.value = false;
        }
      };
      const navigateToLogin = () => {
        uni.navigateTo({ url: "/pages/login/login" });
      };
      const __returned__ = { formData, errors, codeCountdown, codeBtnDisabled, codeBtnText, loading, validatePhone, sendSmsCode, startCountdown, validatePassword, validateRePassword, validateCode, handleRegister, navigateToLogin, ref: vue.ref, computed: vue.computed, get websiteUrl() {
        return websiteUrl;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$c(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("text", { class: "title" }, "手机号注册")
      ]),
      vue.createElementVNode("view", { class: "form-box" }, [
        vue.createCommentVNode(" 手机号输入 "),
        vue.createElementVNode("view", { class: "input-item" }, [
          vue.createElementVNode("view", { class: "input-wrapper" }, [
            vue.createElementVNode("text", { class: "prefix" }, "+86"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.formData.telephone = $event),
                type: "number",
                placeholder: "请输入手机号",
                maxlength: "11",
                class: "input",
                "placeholder-class": "placeholder",
                onBlur: $setup.validatePhone
              },
              null,
              544
              /* NEED_HYDRATION, NEED_PATCH */
            ), [
              [vue.vModelText, $setup.formData.telephone]
            ])
          ]),
          $setup.errors.phone ? (vue.openBlock(), vue.createElementBlock(
            "text",
            {
              key: 0,
              class: "error-text"
            },
            vue.toDisplayString($setup.errors.phone),
            1
            /* TEXT */
          )) : vue.createCommentVNode("v-if", true)
        ]),
        vue.createCommentVNode(" 验证码输入 "),
        vue.createElementVNode("view", { class: "input-item" }, [
          vue.createElementVNode("view", { class: "code-wrapper" }, [
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.formData.code = $event),
                type: "number",
                autocomplete: "new-password",
                placeholder: "请输入验证码",
                maxlength: "6",
                class: "input",
                "placeholder-class": "placeholder",
                onBlur: $setup.validateCode
              },
              null,
              544
              /* NEED_HYDRATION, NEED_PATCH */
            ), [
              [vue.vModelText, $setup.formData.code]
            ]),
            vue.createElementVNode("button", {
              class: vue.normalizeClass(["code-btn", { disabled: $setup.codeBtnDisabled }]),
              disabled: $setup.codeBtnDisabled,
              onClick: $setup.sendSmsCode
            }, vue.toDisplayString($setup.codeBtnText), 11, ["disabled"])
          ]),
          $setup.errors.code ? (vue.openBlock(), vue.createElementBlock(
            "text",
            {
              key: 0,
              class: "error-text"
            },
            vue.toDisplayString($setup.errors.code),
            1
            /* TEXT */
          )) : vue.createCommentVNode("v-if", true)
        ]),
        vue.createCommentVNode(" 密码输入 "),
        vue.createElementVNode("view", { class: "input-item" }, [
          vue.createElementVNode("view", { class: "input-wrapper" }, [
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $setup.formData.password = $event),
                autocomplete: "new-password",
                type: "password",
                placeholder: "请输入密码（至少6位）",
                class: "input",
                "placeholder-class": "placeholder",
                onBlur: $setup.validatePassword
              },
              null,
              544
              /* NEED_HYDRATION, NEED_PATCH */
            ), [
              [vue.vModelText, $setup.formData.password]
            ])
          ]),
          $setup.errors.password ? (vue.openBlock(), vue.createElementBlock(
            "text",
            {
              key: 0,
              class: "error-text"
            },
            vue.toDisplayString($setup.errors.password),
            1
            /* TEXT */
          )) : vue.createCommentVNode("v-if", true)
        ]),
        vue.createCommentVNode(" 确认密码 "),
        vue.createElementVNode("view", { class: "input-item" }, [
          vue.createElementVNode("view", { class: "input-wrapper" }, [
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $setup.formData.rePassword = $event),
                type: "password",
                placeholder: "请再次输入密码",
                class: "input",
                "placeholder-class": "placeholder",
                onBlur: $setup.validateRePassword
              },
              null,
              544
              /* NEED_HYDRATION, NEED_PATCH */
            ), [
              [vue.vModelText, $setup.formData.rePassword]
            ])
          ]),
          $setup.errors.rePassword ? (vue.openBlock(), vue.createElementBlock(
            "text",
            {
              key: 0,
              class: "error-text"
            },
            vue.toDisplayString($setup.errors.rePassword),
            1
            /* TEXT */
          )) : vue.createCommentVNode("v-if", true)
        ]),
        vue.createCommentVNode(" 注册按钮 "),
        vue.createElementVNode("button", {
          class: vue.normalizeClass(["submit-btn", { loading: $setup.loading }]),
          disabled: $setup.loading,
          onClick: $setup.handleRegister
        }, vue.toDisplayString($setup.loading ? "注册中..." : "立即注册"), 11, ["disabled"]),
        vue.createCommentVNode(" 已有账号 "),
        vue.createElementVNode("view", { class: "bottom-tips" }, [
          vue.createTextVNode(" 已有账号？ "),
          vue.createElementVNode("text", {
            class: "link-text",
            onClick: $setup.navigateToLogin
          }, "去登录")
        ])
      ])
    ]);
  }
  const PagesRegisterRegister = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["render", _sfc_render$c], ["__scopeId", "data-v-bac4a35d"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/register/register.vue"]]);
  const _sfc_main$c = {
    __name: "user_like",
    setup(__props, { expose: __expose }) {
      __expose();
      const categories = vue.ref([
        {
          type: 1,
          name: "商品"
        },
        {
          type: 2,
          name: "品牌"
        },
        {
          type: 3,
          name: "搭配"
        },
        {
          type: 4,
          name: "展示柜"
        }
      ]);
      const activeCategory = vue.ref(1);
      const currentList = vue.ref([]);
      const loading = vue.ref(false);
      const noMore = vue.ref(false);
      const pagination = vue.reactive({
        page: 1,
        page_size: 8,
        total: 0
      });
      vue.onMounted(async () => {
        await checkLogin();
        loadData();
      });
      const checkLogin = async () => {
        const userInfo = await asyncGetUserInfo();
        if (!userInfo) {
          uni.navigateTo({
            url: "/pages/login/login"
          });
        }
      };
      const switchCategory = (type) => {
        if (activeCategory.value === type)
          return;
        activeCategory.value = type;
        resetPagination();
        loadData();
      };
      const loadData = async () => {
        if (loading.value || noMore.value)
          return;
        loading.value = true;
        try {
          const res = await uni.request({
            url: `${websiteUrl}/with-state/user-likes`,
            method: "GET",
            data: {
              type: activeCategory.value,
              page: pagination.page,
              page_size: pagination.page_size
            },
            header: {
              Authorization: uni.getStorageSync("token")
            }
          });
          if (res.data.status === "success") {
            const newData = res.data.data.list;
            currentList.value = [...currentList.value, ...newData];
            pagination.total = res.data.data.total;
            if (!res.data.data.list.length) {
              noMore.value = true;
            } else {
              noMore.value = false;
            }
            pagination.page += 1;
          }
        } catch (error) {
          uni.showToast({
            title: "加载失败",
            icon: "none"
          });
        } finally {
          loading.value = false;
        }
      };
      const loadMore = () => {
        if (!noMore.value) {
          loadData();
        } else {
          formatAppLog("log", "at pages/user_like/user_like.vue:202", "no more");
        }
      };
      const resetPagination = () => {
        pagination.page = 1;
        currentList.value = [];
        noMore.value = false;
      };
      const getFirstImage = (images) => {
        return (images == null ? void 0 : images.length) > 0 ? images[0] : ``;
      };
      const getFirstCollocationImage = (images) => {
        const url = (images == null ? void 0 : images.split(",")[0]) || "";
        return url ? url : ``;
      };
      const unfollowGoods = async (id) => {
        try {
          const res = await uni.request({
            url: `${websiteUrl}/user/unfollow`,
            method: "POST",
            data: {
              id
            },
            header: {
              Authorization: uni.getStorageSync("token")
            }
          });
          if (res.data.status === "success") {
            currentList.value = currentList.value.filter((item) => item.id !== id);
            uni.showToast({
              title: "已取消关注",
              icon: "success"
            });
          }
        } catch (error) {
          uni.showToast({
            title: "操作失败",
            icon: "none"
          });
        }
      };
      const navigateToGoods = (id) => {
        uni.navigateTo({
          url: `/pages/goods/goods?goods_id=${id}`
        });
      };
      const navigateToBrand = (id) => {
        uni.navigateTo({
          url: `/pages/brand/brand?brand_id=${id}`
        });
      };
      const navigateToCollocation = (id) => {
        uni.navigateTo({
          url: `/pages/collocation/detail?id=${id}`
        });
      };
      const navigateToShowcase = (id) => {
        uni.navigateTo({
          url: `/pages/showcase/detail?id=${id}`
        });
      };
      uni.setNavigationBarTitle({
        title: "我的关注"
      });
      const __returned__ = { categories, activeCategory, currentList, loading, noMore, pagination, checkLogin, switchCategory, loadData, loadMore, resetPagination, getFirstImage, getFirstCollocationImage, unfollowGoods, navigateToGoods, navigateToBrand, navigateToCollocation, navigateToShowcase, ref: vue.ref, reactive: vue.reactive, onMounted: vue.onMounted, get websiteUrl() {
        return websiteUrl;
      }, get image1Url() {
        return image1Url;
      }, get asyncGetUserInfo() {
        return asyncGetUserInfo;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$b(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("meta", {
        name: "theme-color",
        content: "#F8F8F8"
      }),
      vue.createCommentVNode(" 分类导航 "),
      vue.createElementVNode("view", { class: "nav-bar" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.categories, (item, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: index,
              class: vue.normalizeClass(["nav-item", { active: $setup.activeCategory === item.type }]),
              onClick: ($event) => $setup.switchCategory(item.type)
            }, vue.toDisplayString(item.name), 11, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      vue.createCommentVNode(" 列表内容 "),
      vue.createElementVNode(
        "scroll-view",
        {
          class: "scroll-view",
          "scroll-y": "",
          onScrolltolower: $setup.loadMore,
          "show-scrollbar": false
        },
        [
          vue.createElementVNode("view", { class: "list-container" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.currentList, (item, index) => {
                return vue.openBlock(), vue.createElementBlock(
                  vue.Fragment,
                  {
                    key: item.id
                  },
                  [
                    vue.createCommentVNode(" 商品类型 "),
                    $setup.activeCategory === 1 && item.goods ? (vue.openBlock(), vue.createElementBlock("view", {
                      key: 0,
                      class: "list-item goods-item",
                      onClick: ($event) => $setup.navigateToGoods(item.goods.id)
                    }, [
                      vue.createElementVNode("view", { class: "goods-left" }, [
                        vue.createElementVNode("image", {
                          class: "goods-thumb",
                          src: $setup.getFirstImage(item.goods.goods_images),
                          mode: "aspectFill"
                        }, null, 8, ["src"]),
                        vue.createElementVNode(
                          "view",
                          { class: "price-tag" },
                          "¥" + vue.toDisplayString(item.goods.total_amount),
                          1
                          /* TEXT */
                        )
                      ]),
                      vue.createElementVNode("view", { class: "goods-right" }, [
                        vue.createElementVNode("view", { class: "goods-header" }, [
                          vue.createElementVNode(
                            "text",
                            { class: "goods-title line-clamp-2" },
                            vue.toDisplayString(item.goods.name),
                            1
                            /* TEXT */
                          ),
                          vue.createElementVNode("button", {
                            class: "unfollow-btn",
                            onClick: vue.withModifiers(($event) => $setup.unfollowGoods(item.id), ["stop"])
                          }, "取消关注", 8, ["onClick"])
                        ]),
                        vue.createElementVNode("view", { class: "goods-specs" }, [
                          vue.createElementVNode(
                            "text",
                            { class: "spec-item" },
                            vue.toDisplayString(item.goods.brand_name),
                            1
                            /* TEXT */
                          ),
                          vue.createElementVNode(
                            "text",
                            { class: "spec-item" },
                            vue.toDisplayString(item.goods.size),
                            1
                            /* TEXT */
                          ),
                          vue.createElementVNode(
                            "text",
                            { class: "spec-item" },
                            vue.toDisplayString(item.goods.skin.split(" ")[0]),
                            1
                            /* TEXT */
                          )
                        ]),
                        vue.createElementVNode("view", { class: "goods-footer" }, [
                          vue.createElementVNode(
                            "text",
                            { class: "goods-type" },
                            vue.toDisplayString(item.goods.type),
                            1
                            /* TEXT */
                          ),
                          vue.createElementVNode(
                            "text",
                            { class: "goods-material" },
                            vue.toDisplayString(item.goods.doll_material),
                            1
                            /* TEXT */
                          )
                        ])
                      ])
                    ], 8, ["onClick"])) : vue.createCommentVNode("v-if", true),
                    vue.createCommentVNode(" 品牌类型 "),
                    $setup.activeCategory === 2 && item.brand ? (vue.openBlock(), vue.createElementBlock("view", {
                      key: 1,
                      class: "list-item brand-item",
                      onClick: ($event) => $setup.navigateToBrand(item.brand.id)
                    }, [
                      vue.createElementVNode("view", { class: "brand-content" }, [
                        vue.createElementVNode("image", {
                          class: "brand-logo",
                          src: item.brand.logo_image,
                          mode: "aspectFit"
                        }, null, 8, ["src"]),
                        vue.createElementVNode("view", { class: "brand-info" }, [
                          vue.createElementVNode("view", { class: "brand-header" }, [
                            vue.createElementVNode(
                              "text",
                              { class: "brand-name" },
                              vue.toDisplayString(item.brand.brand_name),
                              1
                              /* TEXT */
                            ),
                            vue.createElementVNode(
                              "text",
                              { class: "brand-country" },
                              vue.toDisplayString(item.brand.country_name),
                              1
                              /* TEXT */
                            )
                          ]),
                          vue.createElementVNode(
                            "text",
                            { class: "brand-description line-clamp-2" },
                            vue.toDisplayString(item.brand.description),
                            1
                            /* TEXT */
                          ),
                          vue.createElementVNode("view", { class: "brand-actions" }, [
                            vue.createElementVNode("button", {
                              class: "action-btn",
                              onClick: vue.withModifiers(($event) => _ctx.unfollowBrand(item.id), ["stop"])
                            }, "取消关注", 8, ["onClick"])
                          ])
                        ])
                      ])
                    ], 8, ["onClick"])) : vue.createCommentVNode("v-if", true),
                    vue.createCommentVNode(" 搭配类型 "),
                    $setup.activeCategory === 3 && item.collocation ? (vue.openBlock(), vue.createElementBlock("view", {
                      key: 2,
                      class: "list-item",
                      onClick: ($event) => $setup.navigateToCollocation(item.collocation.id)
                    }, [
                      vue.createElementVNode("image", {
                        class: "item-image",
                        src: $setup.getFirstCollocationImage(item.collocation.image_urls),
                        mode: "aspectFill"
                      }, null, 8, ["src"]),
                      vue.createElementVNode(
                        "text",
                        { class: "item-title" },
                        vue.toDisplayString(item.collocation.title),
                        1
                        /* TEXT */
                      )
                    ], 8, ["onClick"])) : vue.createCommentVNode("v-if", true),
                    vue.createCommentVNode(" 展示柜类型 "),
                    $setup.activeCategory === 4 && item.showcase ? (vue.openBlock(), vue.createElementBlock("view", {
                      key: 3,
                      class: "list-item",
                      onClick: ($event) => $setup.navigateToShowcase(item.showcase.id)
                    }, [
                      vue.createElementVNode("image", {
                        class: "item-image",
                        src: $setup.getFirstImage(item.showcase.image_urls),
                        mode: "aspectFill"
                      }, null, 8, ["src"]),
                      vue.createElementVNode(
                        "text",
                        { class: "item-title" },
                        vue.toDisplayString(item.showcase.name),
                        1
                        /* TEXT */
                      )
                    ], 8, ["onClick"])) : vue.createCommentVNode("v-if", true)
                  ],
                  64
                  /* STABLE_FRAGMENT */
                );
              }),
              128
              /* KEYED_FRAGMENT */
            )),
            vue.createCommentVNode(" 加载状态 "),
            vue.createElementVNode("view", { class: "loading-status" }, [
              $setup.loading ? (vue.openBlock(), vue.createElementBlock("text", {
                key: 0,
                class: "loading-text"
              }, "加载中...")) : vue.createCommentVNode("v-if", true),
              $setup.noMore ? (vue.openBlock(), vue.createElementBlock("text", {
                key: 1,
                class: "no-more-text"
              }, "没有更多了")) : vue.createCommentVNode("v-if", true)
            ])
          ])
        ],
        32
        /* NEED_HYDRATION */
      )
    ]);
  }
  const PagesUserLikeUserLike = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["render", _sfc_render$b], ["__scopeId", "data-v-909fcc31"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/user_like/user_like.vue"]]);
  const pageSize = 10;
  const _sfc_main$b = {
    __name: "collocation_square",
    setup(__props, { expose: __expose }) {
      __expose();
      const collocationList = vue.ref([]);
      const loading = vue.ref(false);
      const noMore = vue.ref(false);
      const currentPage = vue.ref(1);
      const containerHeight = vue.ref(0);
      const cardWidth = vue.ref(0);
      const columnsHeight = vue.reactive([0, 0]);
      const showFilterModal = vue.ref(false);
      const filterBrand = vue.ref("");
      const goodsOptions = vue.ref([]);
      const instance = vue.getCurrentInstance();
      const selectedBrand = vue.ref(null);
      const filterGoods = vue.ref([]);
      const tempSelectGoods = vue.ref(null);
      const miniProgram = false;
      const cardStyle = (index) => {
        const item = collocationList.value[index];
        if (!item.position)
          return {};
        return {
          left: `${item.position.left}px`,
          top: `${item.position.top}px`,
          width: `${cardWidth.value}px`
        };
      };
      const calculateLayout = (instance2) => {
        formatAppLog("log", "at pages/collocation_square/collocation_square.vue:145", "进入计算布局逻辑");
        if (!instance2) {
          formatAppLog("log", "at pages/collocation_square/collocation_square.vue:147", "无法获取instance");
          return;
        }
        formatAppLog("log", "at pages/collocation_square/collocation_square.vue:150", "获取成功");
        if (!collocationList.value) {
          formatAppLog("log", "at pages/collocation_square/collocation_square.vue:152", "无列表数据，不需要计算布局");
          return;
        }
        formatAppLog("log", "at pages/collocation_square/collocation_square.vue:155", "获取成功，准备createSelectorQuery");
        formatAppLog("log", "at pages/collocation_square/collocation_square.vue:156", instance2);
        const query = uni.createSelectorQuery().in(instance2.proxy);
        formatAppLog("log", "at pages/collocation_square/collocation_square.vue:158", "获取到query");
        const tasks = collocationList.value.map((_, index) => {
          return new Promise((resolve) => {
            query.select(`#card-${index}`).boundingClientRect((rect) => {
              resolve({
                index,
                rect
              });
            });
          });
        });
        query.exec(async () => {
          formatAppLog("log", "at pages/collocation_square/collocation_square.vue:173", "进入Query");
          columnsHeight[0] = 0;
          columnsHeight[1] = 0;
          const results = await Promise.all(tasks);
          if (!results.length) {
            formatAppLog("warn", "at pages/collocation_square/collocation_square.vue:181", "未查询到任何卡片元素");
            return;
          }
          results.forEach(({
            index,
            rect
          }) => {
            if (!rect) {
              formatAppLog("error", "at pages/collocation_square/collocation_square.vue:189", `卡片${index}元素查询失败`);
              return;
            }
            const item = collocationList.value[index];
            const colIdx = columnsHeight[0] <= columnsHeight[1] ? 0 : 1;
            const left = colIdx * (cardWidth.value + 10);
            const top = columnsHeight[colIdx] + 10;
            columnsHeight[colIdx] = top + rect.height;
            item.position = {
              left,
              top
            };
          });
          containerHeight.value = Math.max(...columnsHeight) + 20;
        });
      };
      vue.onMounted(() => {
        const systemInfo2 = uni.getSystemInfoSync();
        const padding = 30;
        cardWidth.value = (systemInfo2.windowWidth - padding) / 2;
      });
      const fetchCollocations = async (reset = false) => {
        if (reset) {
          collocationList.value = [];
          currentPage.value = 1;
          noMore.value = false;
          loading.value = false;
        }
        if (loading.value || noMore.value) {
          formatAppLog("log", "at pages/collocation_square/collocation_square.vue:227", "正在加载或没有更多数据，停止请求");
          return;
        }
        try {
          loading.value = true;
          const params = {
            page: currentPage.value,
            page_size: pageSize,
            filter_goods_id_list: filterGoods.value.map((g) => g.goods_id)
          };
          formatAppLog("log", "at pages/collocation_square/collocation_square.vue:241", "请求参数:", JSON.stringify(params, null, 2));
          const res = await uni.request({
            url: `${websiteUrl}/collocation-list`,
            method: "POST",
            data: params,
            header: {
              "content-type": "application/json"
              // 确保使用JSON格式
            }
          });
          formatAppLog("log", "at pages/collocation_square/collocation_square.vue:252", "接口响应:", res);
          if (res.data.status === "success") {
            const data = res.data.data || {};
            const newItems = Array.isArray(data.collocation_relation_list) ? data.collocation_relation_list : [];
            collocationList.value = reset ? newItems : [...collocationList.value, ...newItems];
            noMore.value = newItems.length < pageSize;
            currentPage.value++;
            if (reset && newItems.length === 0) {
              uni.showToast({
                title: "暂无相关搭配",
                icon: "none"
              });
            }
            formatAppLog("log", "at pages/collocation_square/collocation_square.vue:277", "等待next tick");
            await vue.nextTick();
            formatAppLog("log", "at pages/collocation_square/collocation_square.vue:279", "等待完成");
            calculateLayout(instance);
            setTimeout(() => {
              formatAppLog("log", "at pages/collocation_square/collocation_square.vue:283", "二次计算布局");
              calculateLayout(instance);
            }, 500);
          }
        } catch (error) {
          formatAppLog("error", "at pages/collocation_square/collocation_square.vue:288", "请求失败:", error);
          uni.showToast({
            title: "加载失败",
            icon: "none"
          });
        } finally {
          loading.value = false;
        }
      };
      const showFilter = () => {
        showFilterModal.value = true;
      };
      const handleBrandSelect = (brandId, brandName) => {
        selectedBrand.value = {
          id: brandId,
          name: brandName
        };
        filterBrand.value = brandName;
        if (brandId) {
          loadGoodsOptions(brandId);
        }
      };
      const loadGoodsOptions = async (brandId) => {
        try {
          const res = await uni.request({
            url: `${websiteUrl}/goods-name-list?id=${brandId}`,
            method: "GET"
          });
          formatAppLog("log", "at pages/collocation_square/collocation_square.vue:323", "商品列表:", res.data);
          if (res.data.status === "success") {
            goodsOptions.value = res.data.data;
          }
        } catch (error) {
          formatAppLog("error", "at pages/collocation_square/collocation_square.vue:328", "加载商品失败:", error);
        }
      };
      const handleGoodsSelect = (goods2) => {
        formatAppLog("log", "at pages/collocation_square/collocation_square.vue:333", "选择商品:", goods2);
        if (!(goods2 == null ? void 0 : goods2.id))
          return;
        const newGoods = {
          goods_id: goods2.id,
          goods_name: `${goods2.brand_name ? goods2.brand_name + "·" : ""}${goods2.name}`
        };
        const exists = filterGoods.value.some(
          (item) => item.goods_id === newGoods.goods_id
        );
        if (!exists) {
          filterGoods.value = [...filterGoods.value, newGoods];
        }
      };
      const onShareAppMessage = () => ({
        title: "BJD娃圈你想知道的这里都有~",
        path: "/pages/news/news",
        success(res) {
          formatAppLog("log", "at pages/collocation_square/collocation_square.vue:361", "分享成功", res);
        },
        fail(err) {
          formatAppLog("log", "at pages/collocation_square/collocation_square.vue:364", "分享失败", err);
        },
        mp: {
          wxpath: "/pages/index/index.html"
        }
      });
      const applyFilter = async () => {
        showFilterModal.value = false;
        await fetchCollocations(true);
      };
      const closeFilter = () => {
        showFilterModal.value = false;
      };
      const removeGood = (goodsId, event) => {
        var _a;
        (_a = event == null ? void 0 : event.stopPropagation) == null ? void 0 : _a.call(event);
        filterGoods.value = filterGoods.value.filter((g) => g.goods_id !== goodsId);
        noMore.value = false;
        fetchCollocations(true);
      };
      const resetFilter = () => {
        selectedBrand.value = null;
        filterBrand.value = "";
        filterGoods.value = [];
        goodsOptions.value = [];
      };
      function jump2collectionDetail(collocation_id, origin) {
        uni.navigateTo({
          url: "/pages/collocation_share/collocation_share?collocation_id=" + collocation_id + "&origin=" + origin
        });
      }
      const confirmFilter = async () => {
        filterGoods.value.push(tempSelectGoods.value);
        showFilterModal.value = false;
        noMore.value = false;
        await fetchCollocations(true);
      };
      const loadMore = () => {
        if (!noMore.value)
          fetchCollocations();
      };
      const navigateToDetail = (item) => {
        uni.navigateTo({
          url: `/pages/collocation_share/collocation_share?collocation_id=${item.collocation_id}&origin=${item.origin}`
        });
      };
      const jumpToUserPage = (uid) => {
        uni.navigateTo({
          url: `/pages/user_page/user_page?uid=${uid}`
        });
      };
      const getUserName = (name) => {
        return name.length > 10 ? `${name.toString().slice(-8)}...` : name;
      };
      vue.onMounted(fetchCollocations);
      const __returned__ = { collocationList, loading, noMore, currentPage, pageSize, containerHeight, cardWidth, columnsHeight, showFilterModal, filterBrand, goodsOptions, instance, selectedBrand, filterGoods, tempSelectGoods, miniProgram, cardStyle, calculateLayout, fetchCollocations, showFilter, handleBrandSelect, loadGoodsOptions, handleGoodsSelect, onShareAppMessage, applyFilter, closeFilter, removeGood, resetFilter, jump2collectionDetail, confirmFilter, loadMore, navigateToDetail, jumpToUserPage, getUserName, ref: vue.ref, reactive: vue.reactive, onMounted: vue.onMounted, nextTick: vue.nextTick, getCurrentInstance: vue.getCurrentInstance, get websiteUrl() {
        return websiteUrl;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$a(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$6);
    const _component_goods_search = resolveEasycom(vue.resolveDynamicComponent("goods-search"), __easycom_1$6);
    const _component_common_modal = resolveEasycom(vue.resolveDynamicComponent("common-modal"), __easycom_2$1);
    const _component_common_page = resolveEasycom(vue.resolveDynamicComponent("common-page"), __easycom_1$4);
    return vue.openBlock(), vue.createElementBlock(
      vue.Fragment,
      null,
      [
        vue.createElementVNode("meta", {
          name: "theme-color",
          content: "#f5f5f5"
        }),
        vue.createVNode(_component_common_page, { head_color: "#f5f5f5" }, {
          default: vue.withCtx(() => [
            vue.createElementVNode("view", { class: "container" }, [
              vue.createCommentVNode(' <view v-if="miniProgram" style="height: 40rpx;"></view> '),
              vue.createCommentVNode(" 筛选栏 "),
              vue.createElementVNode(
                "view",
                {
                  class: "filter-bar",
                  style: vue.normalizeStyle($setup.miniProgram ? "width:500rpx" : "")
                },
                [
                  vue.createElementVNode("view", {
                    class: "filter-tags",
                    onClick: $setup.showFilter
                  }, [
                    vue.createElementVNode("view", { class: "selected-goods" }, [
                      (vue.openBlock(true), vue.createElementBlock(
                        vue.Fragment,
                        null,
                        vue.renderList($setup.filterGoods, (goods2) => {
                          return vue.openBlock(), vue.createElementBlock("view", {
                            key: goods2.goods_id,
                            class: "tag",
                            onClick: vue.withModifiers((e) => $setup.removeGood(goods2.goods_id, e), ["stop"])
                          }, [
                            vue.createTextVNode(
                              vue.toDisplayString(goods2.goods_name) + " ",
                              1
                              /* TEXT */
                            ),
                            vue.createElementVNode("text", { class: "remove" }, "×")
                          ], 8, ["onClick"]);
                        }),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ]),
                    !$setup.filterGoods.length ? (vue.openBlock(), vue.createElementBlock("text", {
                      key: 0,
                      class: "tip"
                    }, "当前无筛选条件")) : vue.createCommentVNode("v-if", true)
                  ]),
                  vue.createElementVNode("button", {
                    class: "submit-btn",
                    onClick: _cache[0] || (_cache[0] = ($event) => $setup.fetchCollocations(true))
                  }, "筛选")
                ],
                4
                /* STYLE */
              ),
              vue.createCommentVNode(" 搭配列表 "),
              vue.createElementVNode(
                "scroll-view",
                {
                  class: "card-list",
                  "scroll-y": "",
                  onScrolltolower: $setup.loadMore,
                  "show-scrollbar": false
                },
                [
                  vue.createElementVNode(
                    "view",
                    {
                      class: "cards-container",
                      style: vue.normalizeStyle({ height: $setup.containerHeight + "px" })
                    },
                    [
                      (vue.openBlock(true), vue.createElementBlock(
                        vue.Fragment,
                        null,
                        vue.renderList($setup.collocationList, (item, index) => {
                          var _a;
                          return vue.openBlock(), vue.createElementBlock("view", {
                            key: item.collocation_id,
                            class: "card",
                            id: "card-" + index,
                            style: vue.normalizeStyle($setup.cardStyle(index)),
                            onClick: ($event) => $setup.jump2collectionDetail(item.collocation_id, item.origin)
                          }, [
                            vue.createElementVNode("view", {
                              class: "user-info",
                              onClick: vue.withModifiers(($event) => $setup.jumpToUserPage(item.uid), ["stop"])
                            }, [
                              vue.createElementVNode("image", {
                                src: item.avatar || "/default_avatar.jpg",
                                class: "avatar",
                                mode: "aspectFill"
                              }, null, 8, ["src"]),
                              vue.createElementVNode("view", { class: "user-meta" }, [
                                vue.createElementVNode(
                                  "text",
                                  { class: "username" },
                                  vue.toDisplayString($setup.getUserName(item.username)),
                                  1
                                  /* TEXT */
                                ),
                                vue.createElementVNode("view", { class: "like-count" }, [
                                  vue.createVNode(_component_uni_icons, {
                                    type: "hand-up",
                                    size: "18",
                                    color: "#5f85a3"
                                  }),
                                  vue.createElementVNode(
                                    "text",
                                    { style: { "margin": "0 5rpx", "color": "#5f85a3" } },
                                    vue.toDisplayString(item.like_count),
                                    1
                                    /* TEXT */
                                  )
                                ])
                              ])
                            ], 8, ["onClick"]),
                            ((_a = item.image_urls) == null ? void 0 : _a.length) > 0 ? (vue.openBlock(), vue.createElementBlock("image", {
                              key: 0,
                              src: item.image_urls[0],
                              mode: "aspectFill",
                              class: "card-image",
                              "lazy-load": ""
                            }, null, 8, ["src"])) : vue.createCommentVNode("v-if", true),
                            vue.createElementVNode("view", { class: "card-content" }, [
                              vue.createElementVNode(
                                "text",
                                { class: "title" },
                                vue.toDisplayString(item.title),
                                1
                                /* TEXT */
                              ),
                              vue.createElementVNode(
                                "text",
                                { class: "desc" },
                                vue.toDisplayString(item.content),
                                1
                                /* TEXT */
                              ),
                              vue.createElementVNode("view", { class: "goods-tags" }, [
                                (vue.openBlock(true), vue.createElementBlock(
                                  vue.Fragment,
                                  null,
                                  vue.renderList(item.relation_list, (rel, index2) => {
                                    return vue.openBlock(), vue.createElementBlock("view", {
                                      class: "tag-box",
                                      key: index2
                                    }, [
                                      vue.createElementVNode(
                                        "text",
                                        { class: "goods-tag" },
                                        vue.toDisplayString(rel.relation_goods_name || "未命名商品"),
                                        1
                                        /* TEXT */
                                      )
                                    ]);
                                  }),
                                  128
                                  /* KEYED_FRAGMENT */
                                ))
                              ])
                            ])
                          ], 12, ["id", "onClick"]);
                        }),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ],
                    4
                    /* STYLE */
                  ),
                  vue.createCommentVNode(" 加载状态 "),
                  vue.createElementVNode("view", { class: "loading-state" }, [
                    $setup.loading ? (vue.openBlock(), vue.createElementBlock("text", { key: 0 }, "加载中...")) : vue.createCommentVNode("v-if", true),
                    $setup.noMore ? (vue.openBlock(), vue.createElementBlock("text", {
                      key: 1,
                      class: "no-more"
                    }, "没有更多了")) : vue.createCommentVNode("v-if", true)
                  ])
                ],
                32
                /* NEED_HYDRATION */
              ),
              vue.createCommentVNode(" 筛选弹窗 "),
              vue.createVNode(_component_common_modal, {
                visible: $setup.showFilterModal,
                "onUpdate:visible": _cache[1] || (_cache[1] = ($event) => $setup.showFilterModal = $event),
                top: "0",
                width: "100%",
                height: "100%"
              }, {
                default: vue.withCtx(() => [
                  vue.createElementVNode("view", {
                    class: "modal-mask",
                    onClick: vue.withModifiers($setup.closeFilter, ["stop"])
                  }),
                  vue.createElementVNode("view", { class: "filter-modal" }, [
                    vue.createElementVNode(
                      "view",
                      {
                        class: "modal-header",
                        style: vue.normalizeStyle($setup.miniProgram ? "margin-top:60rpx" : "margin-top:0rpx")
                      },
                      [
                        vue.createElementVNode("text", { class: "title" }, "筛选看想要的娃物搭配吧！"),
                        vue.createElementVNode("text", {
                          class: "close",
                          onClick: $setup.closeFilter
                        }, "×")
                      ],
                      4
                      /* STYLE */
                    ),
                    vue.createCommentVNode(" 商品搜索组件 "),
                    vue.createVNode(_component_goods_search, {
                      mode: "fill",
                      onSelect: $setup.handleGoodsSelect,
                      background: "#f8f8f8",
                      width: "100%"
                    }),
                    vue.createCommentVNode(" 已选商品展示 "),
                    vue.createElementVNode("view", { class: "selected-goods" }, [
                      (vue.openBlock(true), vue.createElementBlock(
                        vue.Fragment,
                        null,
                        vue.renderList($setup.filterGoods, (goods2) => {
                          return vue.openBlock(), vue.createElementBlock("view", {
                            key: goods2.goods_id,
                            class: "goods-tag",
                            onClick: vue.withModifiers((e) => $setup.removeGood(goods2.goods_id, e), ["stop"])
                          }, [
                            vue.createTextVNode(
                              vue.toDisplayString(goods2.goods_name) + " ",
                              1
                              /* TEXT */
                            ),
                            vue.createElementVNode("text", { class: "remove" }, "×")
                          ], 8, ["onClick"]);
                        }),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ]),
                    vue.createElementVNode("view", { class: "action-btns" }, [
                      vue.createElementVNode("button", {
                        class: "btn reset",
                        onClick: $setup.resetFilter
                      }, "重置"),
                      vue.createElementVNode("button", {
                        class: "btn confirm",
                        onClick: $setup.applyFilter
                      }, "应用筛选")
                    ])
                  ])
                ]),
                _: 1
                /* STABLE */
              }, 8, ["visible"])
            ])
          ]),
          _: 1
          /* STABLE */
        })
      ],
      64
      /* STABLE_FRAGMENT */
    );
  }
  const PagesCollocationSquareCollocationSquare = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["render", _sfc_render$a], ["__scopeId", "data-v-e981f8ca"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/collocation_square/collocation_square.vue"]]);
  const _sfc_main$a = {
    __name: "sale_news",
    setup(__props, { expose: __expose }) {
      __expose();
      const detailData = vue.ref({
        title: "",
        content: "",
        image_list: [],
        created_at: 0
      });
      const brand = vue.ref({
        brand_name: "",
        logo: ""
        // 其他品牌信息字段
      });
      const loading = vue.ref(true);
      const error = vue.ref(false);
      const errorMsg = vue.ref("");
      const pageId2 = vue.ref(0);
      const brandId = vue.ref(0);
      const hasLikeBrand = vue.ref(false);
      const commentListRef = vue.ref(null);
      const commentInputRef = vue.ref(null);
      let commentsPage = vue.ref(1);
      let replyForItem = vue.ref({});
      const systemInfo2 = uni.getSystemInfoSync();
      const handleReplyComment = ({
        parent,
        target
      }) => {
        var _a;
        formatAppLog("log", "at pages/sale_news/sale_news.vue:108", "parent", parent);
        formatAppLog("log", "at pages/sale_news/sale_news.vue:109", "target", target);
        let item = parent;
        if (target != null) {
          item = target;
        }
        if (replyForItem.value.id == item.id) {
          replyForItem.value = {};
          return;
        }
        formatAppLog("log", "at pages/sale_news/sale_news.vue:120", "item", item);
        replyForItem.value = item;
        (_a = commentInputRef.value) == null ? void 0 : _a.focusInput();
      };
      function viewFullImage(index) {
        uni.previewImage({
          current: goods.value.goods_images["index"],
          urls: goods.value.goods_images
        });
      }
      uni.setNavigationBarTitle({
        title: "图透详情"
      });
      function jump2brand(id) {
        uni.navigateTo({
          url: "/pages/brand/brand?brand_id=" + id
        });
      }
      const onShareAppMessage = () => ({
        title: "BJD娃圈你想知道的这里都有~",
        path: "/pages/news/news",
        success(res) {
          formatAppLog("log", "at pages/sale_news/sale_news.vue:150", "分享成功", res);
        },
        fail(err) {
          formatAppLog("log", "at pages/sale_news/sale_news.vue:153", "分享失败", err);
        },
        mp: {
          wxpath: "/pages/index/index.html"
        }
      });
      const jump2user = (uid) => {
        uni.navigateTo({
          url: "/pages/user_page/user_page?uid=" + uid
        });
      };
      const fetchNewsDetail = async (id) => {
        try {
          const res = await uni.request({
            url: `${websiteUrl}/sale-news-detail?id=${id}`,
            timeout: 5e3
          });
          if (res.data.status === "success") {
            detailData.value = {
              ...res.data.data,
              image_list: res.data.data.image_list || []
            };
            getBrandsInfo();
          } else {
            handleError(res.data.msg || "数据加载失败");
          }
        } catch (err) {
          handleError("网络请求失败");
        } finally {
          loading.value = false;
        }
      };
      const handleCommentSubmit = ({
        content,
        replyInfo,
        origin
      }) => {
        let token = uni.getStorageSync("token");
        if (!global.isLogin) {
          uni.showToast({
            title: "请先登录",
            icon: "none"
          });
          return;
        }
        formatAppLog("log", "at pages/sale_news/sale_news.vue:205", "reply_info", replyInfo);
        const requestData = {
          content,
          origin,
          target_id: parseInt(pageId2.value),
          type: 4,
          ...replyInfo.id && {
            reply_id: replyInfo.id,
            reply_for: replyInfo.comment,
            reply_user_id: replyInfo.user_id,
            parent_id: replyInfo.parent_id > 0 ? replyInfo.parent_id : replyInfo.id
          }
        };
        uni.request({
          url: websiteUrl + "/with-state/add-comment",
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
              uni.showToast({
                title: "评论成功",
                icon: "success"
              });
            } else {
              uni.showToast({
                title: res.data.msg,
                icon: "none"
              });
            }
          },
          fail: (err) => {
            uni.showToast({
              title: "网络请求失败",
              icon: "none"
            });
          }
        });
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
      const getBrandsInfo = () => {
        uni.request({
          url: websiteUrl + "/brand-info?id=" + brandId.value,
          success: (res) => {
            if (res.data.status === "success") {
              brand.value = res.data.data;
              uni.setNavigationBarTitle({
                title: res.data.data.brand_name
              });
              getHasLikeBrand();
            }
          },
          fail: () => handleError("品牌信息加载失败")
        });
      };
      const likeBrand = async () => {
        if (!global.isLogin) {
          uni.showToast({
            title: "请先登录",
            icon: "none"
          });
          return;
        }
        const url = `/with-state/${hasLikeBrand.value ? "unlike" : "add-like"}`;
        uni.request({
          url: websiteUrl + url,
          method: "POST",
          header: {
            Authorization: uni.getStorageSync("token")
          },
          data: {
            id: parseInt(brandId.value),
            type: 2
            // 假设2代表品牌类型
          },
          success: (res) => {
            if (res.data.status === "success") {
              hasLikeBrand.value = !hasLikeBrand.value;
              uni.showToast({
                title: hasLikeBrand.value ? "关注成功" : "已取消关注",
                icon: "none"
              });
            }
          }
        });
      };
      const getHasLikeBrand = () => {
        if (!global.isLogin)
          return;
        uni.request({
          url: `${websiteUrl}/with-state/hasLike?id=${brandId.value}&type=2`,
          method: "POST",
          header: {
            Authorization: uni.getStorageSync("token")
          },
          success: (res) => {
            var _a;
            hasLikeBrand.value = ((_a = res.data.data) == null ? void 0 : _a.id) > 0;
          }
        });
      };
      onLoad((options) => {
        if (!options.id || !options.brand_id) {
          handleError("缺少必要参数");
          return;
        }
        pageId2.value = options.id;
        brandId.value = options.brand_id;
        fetchNewsDetail(options.id);
        asyncGetUserInfo().then(getHasLikeBrand);
      });
      const __returned__ = { detailData, brand, loading, error, errorMsg, pageId: pageId2, brandId, hasLikeBrand, commentListRef, commentInputRef, get commentsPage() {
        return commentsPage;
      }, set commentsPage(v) {
        commentsPage = v;
      }, get replyForItem() {
        return replyForItem;
      }, set replyForItem(v) {
        replyForItem = v;
      }, systemInfo: systemInfo2, handleReplyComment, viewFullImage, jump2brand, onShareAppMessage, jump2user, fetchNewsDetail, handleCommentSubmit, formatTimestamp, getBrandsInfo, likeBrand, getHasLikeBrand, ref: vue.ref, onMounted: vue.onMounted, computed: vue.computed, get onLoad() {
        return onLoad;
      }, get onShow() {
        return onShow;
      }, get websiteUrl() {
        return websiteUrl;
      }, get global() {
        return global;
      }, get asyncGetUserInfo() {
        return asyncGetUserInfo;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$9(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_comment_list = resolveEasycom(vue.resolveDynamicComponent("comment-list"), __easycom_1$2);
    const _component_comment_input = resolveEasycom(vue.resolveDynamicComponent("comment-input"), __easycom_2);
    return vue.openBlock(), vue.createElementBlock("view", null, [
      vue.createElementVNode("meta", {
        name: "theme-color",
        content: "#F8F8F8"
      }),
      vue.createCommentVNode(" 图片轮播区域 "),
      vue.createElementVNode("view", { style: { "position": "relative" } }, [
        vue.createElementVNode("swiper", {
          class: "swiper-box",
          "indicator-dots": true,
          autoplay: false
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.detailData.image_list, (img, index) => {
              return vue.openBlock(), vue.createElementBlock("swiper-item", { key: index }, [
                vue.createElementVNode("image", {
                  src: img,
                  mode: "aspectFill",
                  class: "swiper-image",
                  onClick: ($event) => $setup.viewFullImage(index)
                }, null, 8, ["src", "onClick"])
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      vue.createCommentVNode(" 品牌信息区域 "),
      vue.createElementVNode("view", { class: "brand-info" }, [
        vue.createElementVNode("image", {
          class: "brand-logo",
          src: $setup.brand.logo_image,
          mode: "aspectFill",
          onClick: _cache[0] || (_cache[0] = ($event) => $setup.jump2brand($setup.brand.id))
        }, null, 8, ["src"]),
        vue.createElementVNode("view", {
          class: "brand-details",
          onClick: _cache[1] || (_cache[1] = ($event) => $setup.jump2brand($setup.brand.id))
        }, [
          vue.createElementVNode(
            "text",
            { class: "brand-name" },
            vue.toDisplayString($setup.brand.brand_name),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            { class: "publish-time" },
            vue.toDisplayString($setup.formatTimestamp($setup.detailData.created_at)),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode(
          "text",
          {
            class: "follow",
            onClick: $setup.likeBrand,
            style: vue.normalizeStyle({ background: $setup.hasLikeBrand ? "#ff6a6c" : "#65C3D6" })
          },
          vue.toDisplayString($setup.hasLikeBrand ? "已关注" : "+ 关注品牌"),
          5
          /* TEXT, STYLE */
        )
      ]),
      vue.createCommentVNode(" 图文信息区域 "),
      vue.createElementVNode("view", { class: "content-box" }, [
        vue.createElementVNode("view", null, [
          vue.createElementVNode(
            "text",
            { class: "title" },
            vue.toDisplayString($setup.detailData.title),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { style: { "margin": "20rpx 0rpx" } }, [
          vue.createElementVNode(
            "text",
            { class: "content" },
            vue.toDisplayString($setup.detailData.content),
            1
            /* TEXT */
          )
        ])
      ]),
      vue.createCommentVNode(" 评论区（保留原有结构，需根据接口调整） "),
      vue.createElementVNode("view", { style: { "padding": "10px" } }, [
        vue.createVNode(_component_comment_list, {
          ref: "commentListRef",
          type: 4,
          "relation-id": parseInt($setup.pageId),
          onReply: $setup.handleReplyComment
        }, null, 8, ["relation-id"])
      ]),
      vue.createCommentVNode(" 加载状态 "),
      $setup.loading ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "loading"
      }, "加载中...")) : vue.createCommentVNode("v-if", true),
      $setup.error ? (vue.openBlock(), vue.createElementBlock(
        "view",
        {
          key: 1,
          class: "error"
        },
        vue.toDisplayString($setup.errorMsg),
        1
        /* TEXT */
      )) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 输入框 "),
      vue.createVNode(_component_comment_input, {
        ref: "commentInputRef",
        "reply-info": $setup.replyForItem,
        "target-id": $setup.pageId,
        onSubmit: $setup.handleCommentSubmit,
        "onUpdate:replyInfo": _cache[2] || (_cache[2] = (val) => $setup.replyForItem = val)
      }, null, 8, ["reply-info", "target-id"]),
      vue.createElementVNode("view", { style: { "width": "100%", "height": "120rpx" } })
    ]);
  }
  const PagesSaleNewsSaleNews = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["render", _sfc_render$9], ["__scopeId", "data-v-c9c53f1c"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/sale_news/sale_news.vue"]]);
  const _sfc_main$9 = {
    __name: "treehole_publish",
    setup(__props, { expose: __expose }) {
      __expose();
      const content = vue.ref("");
      const isAnonymous = vue.ref(0);
      const uploadList = vue.ref([]);
      const categories = vue.ref({});
      const selectedCategory = vue.ref("");
      const selectedIndex = vue.ref(-1);
      const selectedCategoryLabel = vue.ref("");
      function viewFullImage(index) {
        uni.previewImage({
          current: uploadList.value[index],
          urls: uploadList.value
        });
      }
      function handleAnonymous(e) {
        isAnonymous.value = e.detail.value.length > 0 ? 1 : 0;
      }
      uni.setNavigationBarTitle({
        title: "投稿树洞"
      });
      function selectImage() {
        formatAppLog("log", "at pages/treehole_publish/treehole_publish.vue:108", "openSelect");
        chooseImage().then((res) => {
          getQiniuToken().then((tokenData) => {
            formatAppLog("log", "at pages/treehole_publish/treehole_publish.vue:111", tokenData);
            uploadImageToQiniu(res, tokenData.token, tokenData.path).then((uploadRes) => {
              if (uploadRes.statusCode != 200) {
                uni.showToast({
                  title: "上传失败",
                  icon: "none"
                });
              }
              formatAppLog("log", "at pages/treehole_publish/treehole_publish.vue:120", image1Url + tokenData.path);
              uploadList.value.push(image1Url + tokenData.path);
              uni.showToast({
                title: "上传成功",
                icon: "success"
              });
            });
          });
        });
      }
      const fetchCategories = async () => {
        try {
          const res = await uni.request({
            url: websiteUrl + "/treehole-typelist",
            method: "GET"
          });
          if (res.data.status === "success") {
            categories.value = Object.entries(res.data.data).map(([value, label]) => ({
              value: Number(value),
              label
            }));
          }
        } catch (err) {
          formatAppLog("error", "at pages/treehole_publish/treehole_publish.vue:150", "获取分类失败:", err);
        }
      };
      function handleCategoryChange(e) {
        const index = e.detail.value;
        if (index >= 0 && categories.value[index]) {
          selectedIndex.value = index;
          selectedCategory.value = categories.value[index].value;
          selectedCategoryLabel.value = categories.value[index].label;
        }
      }
      const canSubmit = vue.computed(() => {
        return content.value.trim().length > 0 && selectedCategory.value !== null;
      });
      async function handleSubmit() {
        if (!canSubmit.value)
          return;
        if (!selectedCategory.value) {
          uni.showToast({
            title: "请选择分类",
            icon: "none"
          });
          return;
        }
        try {
          uni.showLoading({
            title: "提交中..."
          });
          const token = uni.getStorageSync("token");
          if (!token) {
            uni.showToast({
              title: "请先登录",
              icon: "none"
            });
            return;
          }
          const postData = {
            content: content.value.trim(),
            images: uploadList.value,
            is_anonymous: isAnonymous.value,
            category_id: selectedCategory.value
          };
          const res = await uni.request({
            url: websiteUrl + "/with-state/add-submission",
            method: "POST",
            data: postData,
            header: {
              "Content-Type": "application/json",
              "Authorization": token
            }
          });
          uni.hideLoading();
          if (res.data.status == "success") {
            uni.showToast({
              title: "我们很快审核完成",
              icon: "success"
            });
            setTimeout(() => {
              content.value = "";
              uploadList.value = [];
              isAnonymous.value = 0;
              uni.navigateBack();
            }, 1500);
          } else {
            uni.showToast({
              title: res.data.msg || "提交失败",
              icon: "none"
            });
          }
        } catch (err) {
          uni.hideLoading();
          formatAppLog("error", "at pages/treehole_publish/treehole_publish.vue:236", "提交失败:", err);
          uni.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        }
      }
      vue.onMounted(() => {
        fetchCategories();
      });
      const __returned__ = { content, isAnonymous, uploadList, categories, selectedCategory, selectedIndex, selectedCategoryLabel, viewFullImage, handleAnonymous, selectImage, fetchCategories, handleCategoryChange, canSubmit, handleSubmit, onMounted: vue.onMounted, ref: vue.ref, computed: vue.computed, get websiteUrl() {
        return websiteUrl;
      }, get image1Url() {
        return image1Url;
      }, get wechatSignLogin() {
        return wechatSignLogin;
      }, get getUserInfo() {
        return getUserInfo;
      }, get global() {
        return global;
      }, get asyncGetUserInfo() {
        return asyncGetUserInfo;
      }, get chooseImage() {
        return chooseImage;
      }, get jumpToCroper() {
        return jumpToCroper;
      }, get getQiniuToken() {
        return getQiniuToken;
      }, get uploadImageToQiniu() {
        return uploadImageToQiniu;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$8(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$6);
    const _component_common_page = resolveEasycom(vue.resolveDynamicComponent("common-page"), __easycom_1$4);
    return vue.openBlock(), vue.createBlock(_component_common_page, { title: "发布树洞" }, {
      default: vue.withCtx(() => [
        vue.createElementVNode("meta", {
          name: "theme-color",
          content: "#F8F8F8"
        }),
        vue.createElementVNode("view", { class: "publish-box" }, [
          vue.createCommentVNode(" 分类选择 "),
          vue.createElementVNode("picker", {
            class: "category-picker",
            range: $setup.categories,
            "range-key": "label",
            onChange: $setup.handleCategoryChange,
            value: $setup.selectedIndex
          }, [
            vue.createElementVNode("view", { class: "picker-content" }, [
              vue.createElementVNode(
                "text",
                {
                  class: vue.normalizeClass(["picker-text", $setup.selectedCategory ? "" : "placeholder"])
                },
                vue.toDisplayString($setup.selectedCategoryLabel || "请选择分类（必选）"),
                3
                /* TEXT, CLASS */
              ),
              vue.createVNode(_component_uni_icons, {
                type: "right",
                size: "22",
                color: "#888"
              })
            ])
          ], 40, ["range", "value"]),
          vue.createCommentVNode(" 上传图片列表 "),
          vue.createElementVNode("scroll-view", {
            "scroll-x": "true",
            class: "upload_box",
            "ll-with-animation": "true",
            "show-scrollbar": false
          }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.uploadList, (item, index) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  class: "upload_item",
                  key: index
                }, [
                  vue.createElementVNode("image", {
                    src: item,
                    class: "uploaded_image",
                    onClick: $setup.viewFullImage,
                    mode: "aspectFill"
                  }, null, 8, ["src"]),
                  vue.createElementVNode("image", {
                    src: _imports_0$7,
                    class: "close_icon",
                    onClick: ($event) => _ctx.deleteImage(index)
                  }, null, 8, ["onClick"])
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            )),
            vue.createElementVNode("view", {
              class: "uploadImageBox",
              style: { "background": "#f8f8f8" }
            }, [
              vue.createElementVNode("image", {
                src: _imports_1,
                class: "upload_img",
                onClick: _cache[0] || (_cache[0] = ($event) => $setup.selectImage(_ctx.index)),
                style: { "width": "50px", "height": "50px", "margin": "25px" }
              })
            ])
          ]),
          vue.withDirectives(vue.createElementVNode(
            "textarea",
            {
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.content = $event),
              placeholder: "写下你想说的话...",
              class: "textarea",
              maxlength: "500"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $setup.content]
          ]),
          vue.createElementVNode("view", { class: "anonymous" }, [
            vue.createElementVNode(
              "checkbox-group",
              { onChange: $setup.handleAnonymous },
              [
                vue.createElementVNode("label", null, [
                  vue.createElementVNode("checkbox", {
                    checked: $setup.isAnonymous === 1,
                    color: "#4cbbd0"
                  }, null, 8, ["checked"]),
                  vue.createElementVNode("text", null, "匿名发布")
                ])
              ],
              32
              /* NEED_HYDRATION */
            )
          ]),
          vue.createElementVNode("view", { class: "publish-detail" }, [
            vue.createElementVNode("text", null, "* 目前树洞为审稿发布，只接受娃圈相关投稿，不接受包含人身攻击或违反法律法规的投稿。"),
            vue.createElementVNode("text", null, "* 我们会在工作时间进行审稿，您可以在个人投稿中心查看投稿状态，审核通过后稿件才被可见。"),
            vue.createElementVNode("text", null, "* 如果勾选匿名发布，他人将无法通过稿件进入您的主页。如果稿件遭到过多点踩或投诉，我们可能会隐藏这封稿件。")
          ]),
          vue.createElementVNode(
            "button",
            {
              class: vue.normalizeClass(["submit-btn", { disabled: !$setup.canSubmit }]),
              onClick: $setup.handleSubmit
            },
            " 提交 ",
            2
            /* CLASS */
          )
        ])
      ]),
      _: 1
      /* STABLE */
    });
  }
  const PagesTreeholePublishTreeholePublish = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["render", _sfc_render$8], ["__scopeId", "data-v-07f0d6e5"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/treehole_publish/treehole_publish.vue"]]);
  const _sfc_main$8 = {
    __name: "treehole_detail",
    props: {
      id: {
        type: String,
        required: true
      }
    },
    setup(__props, { expose: __expose }) {
      __expose();
      const loading = vue.ref(true);
      const error = vue.ref(false);
      const errorMsg = vue.ref("");
      const pageId2 = vue.ref(0);
      const detailData = vue.ref(null);
      const commentListRef = vue.ref(null);
      const commentInputRef = vue.ref(null);
      let commentsPage = vue.ref(1);
      let replyForItem = vue.ref({});
      const hasLiked = vue.ref(false);
      const props = __props;
      const handleReplyComment = ({
        parent,
        target
      }) => {
        var _a;
        formatAppLog("log", "at pages/treehole_detail/treehole_detail.vue:110", "parent", parent);
        formatAppLog("log", "at pages/treehole_detail/treehole_detail.vue:111", "target", target);
        let item = parent;
        if (target != null) {
          item = target;
        }
        if (replyForItem.value.id == item.id) {
          replyForItem.value = {};
          return;
        }
        formatAppLog("log", "at pages/treehole_detail/treehole_detail.vue:122", "item", item);
        replyForItem.value = item;
        (_a = commentInputRef.value) == null ? void 0 : _a.focusInput();
      };
      const handleCommentSubmit = ({
        content,
        replyInfo,
        origin
      }) => {
        let token = uni.getStorageSync("token");
        if (!global.isLogin) {
          uni.showToast({
            title: "请先登录",
            icon: "none"
          });
          return;
        }
        formatAppLog("log", "at pages/treehole_detail/treehole_detail.vue:140", "reply_info", replyInfo);
        const requestData = {
          content,
          origin,
          target_id: parseInt(pageId2.value),
          type: 5,
          ...replyInfo.id && {
            reply_id: replyInfo.id,
            reply_for: replyInfo.comment,
            reply_user_id: replyInfo.user_id,
            parent_id: replyInfo.parent_id > 0 ? replyInfo.parent_id : replyInfo.id
          }
        };
        uni.request({
          url: websiteUrl + "/with-state/add-comment",
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
                formatAppLog("log", "at pages/treehole_detail/treehole_detail.vue:165", "添加主评论");
                (_a = commentListRef.value) == null ? void 0 : _a.addNewComment(newComment);
              } else {
                formatAppLog("log", "at pages/treehole_detail/treehole_detail.vue:169", "添加子评论");
                (_b = commentListRef.value) == null ? void 0 : _b.addReplyComment(newComment);
              }
              uni.showToast({
                title: "评论成功",
                icon: "success"
              });
            } else {
              uni.showToast({
                title: res.data.msg,
                icon: "none"
              });
            }
          },
          fail: (err) => {
            uni.showToast({
              title: "网络请求失败",
              icon: "none"
            });
          }
        });
      };
      function copyUrl(item) {
        let url = "http://m.dogdogdoll.com/#/pages/treehole_detail/treehole_detail?id=" + item.id;
        uni.setClipboardData({
          data: url,
          success: function() {
            uni.showToast({
              title: "复制链接成功",
              icon: "none"
            });
          }
        });
      }
      const handleLike = () => {
        if (!global.isLogin) {
          uni.showModal({
            title: "提示",
            content: "需要登录后才能点赞",
            success: (res) => {
              if (res.confirm)
                uni.navigateTo({
                  url: "/pages/login/login"
                });
            }
          });
          return;
        }
        const token = uni.getStorageSync("token");
        const url = websiteUrl + (hasLiked.value ? "/with-state/unlike" : "/with-state/add-like");
        uni.request({
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
        let token = uni.getStorageSync("token");
        if (token == "") {
          return;
        }
        uni.request({
          url: websiteUrl + "/with-state/hasLike?id=" + props.id + "&type=5",
          method: "POST",
          header: {
            "Authorization": token
          },
          success: (res) => {
            formatAppLog("log", "at pages/treehole_detail/treehole_detail.vue:263", res.data);
            if (res.data.status == "success") {
              if (res.data.data.id > 0) {
                hasLiked.value = true;
              } else {
                hasLiked.value = false;
              }
            } else {
              uni.showToast({
                title: res.data.msg,
                icon: "none"
              });
              return;
            }
          },
          fail: (err) => {
            formatAppLog("log", "at pages/treehole_detail/treehole_detail.vue:281", err);
            uni.showToast({
              title: "网络请求失败",
              icon: "none"
            });
          }
        });
      }
      const displayImages = vue.computed(() => {
        var _a, _b;
        return ((_b = (_a = detailData.value) == null ? void 0 : _a.images) == null ? void 0 : _b.slice(0, 9)) || [];
      });
      const remainingCount = vue.computed(() => {
        var _a, _b;
        return (((_b = (_a = detailData.value) == null ? void 0 : _a.images) == null ? void 0 : _b.length) || 0) - 9;
      });
      const showOverlay = vue.computed(() => {
        var _a, _b;
        return (((_b = (_a = detailData.value) == null ? void 0 : _a.images) == null ? void 0 : _b.length) || 0) > 9;
      });
      uni.setNavigationBarTitle({
        title: "投稿详情"
      });
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
      const layoutClass = vue.computed(() => {
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
        uni.previewImage({
          current: index,
          urls: detailData.value.images
        });
      };
      vue.onMounted(async () => {
        pageId2.value = props.id;
        formatAppLog("log", "at pages/treehole_detail/treehole_detail.vue:347", "pageId", pageId2.value);
        try {
          const res = await uni.request({
            url: `${websiteUrl}/treehole-detail?id=${props.id}`
          });
          if (res.data.status === "success") {
            detailData.value = res.data.data;
          }
        } catch (error2) {
          formatAppLog("log", "at pages/treehole_detail/treehole_detail.vue:358", error2);
          uni.showToast({
            title: "加载失败",
            icon: "none"
          });
        }
        asyncGetUserInfo();
        getHasLike();
      });
      const __returned__ = { loading, error, errorMsg, pageId: pageId2, detailData, commentListRef, commentInputRef, get commentsPage() {
        return commentsPage;
      }, set commentsPage(v) {
        commentsPage = v;
      }, get replyForItem() {
        return replyForItem;
      }, set replyForItem(v) {
        replyForItem = v;
      }, hasLiked, props, handleReplyComment, handleCommentSubmit, copyUrl, handleLike, getHasLike, displayImages, remainingCount, showOverlay, formatTimestamp, layoutClass, formatTime, previewImage, ref: vue.ref, computed: vue.computed, onMounted: vue.onMounted, get websiteUrl() {
        return websiteUrl;
      }, get image1Url() {
        return image1Url;
      }, get global() {
        return global;
      }, get asyncGetUserInfo() {
        return asyncGetUserInfo;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$6);
    const _component_comment_list = resolveEasycom(vue.resolveDynamicComponent("comment-list"), __easycom_1$2);
    const _component_comment_input = resolveEasycom(vue.resolveDynamicComponent("comment-input"), __easycom_2);
    return vue.openBlock(), vue.createElementBlock(
      vue.Fragment,
      null,
      [
        $setup.detailData ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "container"
        }, [
          vue.createElementVNode("meta", {
            name: "theme-color",
            content: "#F8F8F8"
          }),
          vue.createCommentVNode(" 头部作者信息 "),
          vue.createElementVNode("view", { class: "header" }, [
            vue.createElementVNode("view", { class: "author-info" }, [
              vue.createElementVNode("image", {
                src: $setup.detailData.avatar || "/static/noname.png",
                class: "avatar",
                mode: "aspectFill"
              }, null, 8, ["src"]),
              vue.createElementVNode("view", { style: { "width": "500rpx" } }, [
                vue.createElementVNode(
                  "text",
                  { class: "author-name" },
                  vue.toDisplayString($setup.detailData.author_name),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "view",
                  { class: "time" },
                  vue.toDisplayString($setup.formatTime($setup.detailData.created_at)),
                  1
                  /* TEXT */
                )
              ])
            ]),
            vue.createCommentVNode(' 			<button class="share-btn" open-type="share">\r\n				<image src="/static/images/share-icon.png" class="share-icon" />\r\n			</button> ')
          ]),
          vue.createCommentVNode(" 正文内容 "),
          vue.createElementVNode(
            "view",
            { class: "content" },
            vue.toDisplayString($setup.detailData.content),
            1
            /* TEXT */
          ),
          vue.createCommentVNode(" 图片展示区域 "),
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["image-container", $setup.layoutClass])
            },
            [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.displayImages, (img, index) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    key: index,
                    class: "image-wrapper"
                  }, [
                    vue.createElementVNode("image", {
                      src: img,
                      mode: "aspectFill",
                      class: "image-item",
                      onClick: ($event) => $setup.previewImage(index)
                    }, null, 8, ["src", "onClick"]),
                    $setup.showOverlay && index === 8 ? (vue.openBlock(), vue.createElementBlock(
                      "view",
                      {
                        key: 0,
                        class: "image-overlay"
                      },
                      " +" + vue.toDisplayString($setup.remainingCount),
                      1
                      /* TEXT */
                    )) : vue.createCommentVNode("v-if", true)
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ],
            2
            /* CLASS */
          ),
          vue.createElementVNode("view", { class: "action-bar" }, [
            vue.createElementVNode("view", { class: "action-group" }, [
              vue.createElementVNode("view", {
                class: "action-item",
                onClick: $setup.handleLike
              }, [
                vue.createVNode(_component_uni_icons, {
                  type: $setup.hasLiked ? "hand-up-filled" : "hand-up",
                  size: "24",
                  color: $setup.hasLiked ? "#ff4d4f" : "#666"
                }, null, 8, ["type", "color"]),
                vue.createElementVNode(
                  "text",
                  { class: "action-text" },
                  vue.toDisplayString($setup.detailData.like_count || 0),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", {
                class: "action-item",
                onClick: _cache[0] || (_cache[0] = ($event) => $setup.copyUrl($setup.detailData))
              }, [
                vue.createVNode(_component_uni_icons, {
                  type: "redo",
                  size: "24",
                  color: "#666"
                }),
                vue.createElementVNode("text", { class: "action-text" }, "分享")
              ])
            ]),
            vue.createElementVNode(
              "text",
              { class: "time-text" },
              "审核于 " + vue.toDisplayString($setup.formatTime($setup.detailData.approve_time)),
              1
              /* TEXT */
            )
          ])
        ])) : (vue.openBlock(), vue.createElementBlock(
          vue.Fragment,
          { key: 1 },
          [
            vue.createCommentVNode(" 加载状态 "),
            vue.createElementVNode("view", { class: "loading" }, "加载中...")
          ],
          2112
          /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
        )),
        vue.createCommentVNode(" 评论区（保留原有结构，需根据接口调整） "),
        vue.createElementVNode("view", { style: { "padding": "10px" } }, [
          vue.createVNode(_component_comment_list, {
            ref: "commentListRef",
            type: 5,
            "relation-id": parseInt($setup.props.id),
            onReply: $setup.handleReplyComment
          }, null, 8, ["relation-id"])
        ]),
        vue.createCommentVNode(' 加载状态 --\r\n	\r\n	<view v-if="error" class="error">{{ errorMsg }}</view>\r\n\r\n\r\n		\r\n		<!-- 输入框 '),
        vue.createVNode(_component_comment_input, {
          ref: "commentInputRef",
          "reply-info": $setup.replyForItem,
          "target-id": $setup.pageId,
          onSubmit: $setup.handleCommentSubmit,
          "onUpdate:replyInfo": _cache[1] || (_cache[1] = (val) => $setup.replyForItem = val)
        }, null, 8, ["reply-info", "target-id"]),
        vue.createElementVNode("view", { style: { "width": "100%", "height": "120rpx" } })
      ],
      64
      /* STABLE_FRAGMENT */
    );
  }
  const PagesTreeholeDetailTreeholeDetail = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$7], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/treehole_detail/treehole_detail.vue"]]);
  const _sfc_main$7 = {
    __name: "reset_password",
    setup(__props, { expose: __expose }) {
      __expose();
      const formData = vue.ref({
        telephone: "",
        code: "",
        newPassword: "",
        reNewPassword: ""
      });
      const errors = vue.ref({
        phone: "",
        code: "",
        newPassword: "",
        reNewPassword: ""
      });
      const codeCountdown = vue.ref(0);
      const codeBtnDisabled = vue.computed(() => codeCountdown.value > 0);
      const codeBtnText = vue.computed(
        () => codeCountdown.value > 0 ? `${codeCountdown.value}秒后重发` : "获取验证码"
      );
      const loading = vue.ref(false);
      const validatePhone = () => {
        if (!formData.value.telephone) {
          errors.value.phone = "手机号不能为空";
          return false;
        }
        if (!/^1[3-9]\d{9}$/.test(formData.value.telephone)) {
          errors.value.phone = "手机号格式不正确";
          return false;
        }
        errors.value.phone = "";
        return true;
      };
      const sendSmsCode = async () => {
        if (!validatePhone())
          return;
        try {
          const res = await uni.request({
            url: `${websiteUrl}/send-sms-code`,
            // 根据实际接口调整
            method: "POST",
            data: {
              tel_phone: formData.value.telephone
            }
          });
          if (res.data.status === "success") {
            startCountdown();
            uni.showToast({
              title: "验证码已发送",
              icon: "none"
            });
          } else {
            uni.showToast({
              title: res.data.msg || "发送失败",
              icon: "none"
            });
          }
        } catch (err) {
          uni.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        }
      };
      const validateNewPassword = () => {
        if (formData.value.newPassword.length < 6) {
          errors.value.newPassword = "密码至少需要6位";
          return false;
        }
        errors.value.newPassword = "";
        return true;
      };
      const validateReNewPassword = () => {
        if (formData.value.newPassword !== formData.value.reNewPassword) {
          errors.value.reNewPassword = "两次密码输入不一致";
          return false;
        }
        errors.value.reNewPassword = "";
        return true;
      };
      const validateCode = () => {
        if (!formData.value.code) {
          errors.value.code = "验证码不能为空";
          return false;
        }
        if (formData.value.code.length !== 6) {
          errors.value.code = "验证码格式不正确";
          return false;
        }
        errors.value.code = "";
        return true;
      };
      const handleResetPassword = async () => {
        const validations = [
          validatePhone(),
          validateCode(),
          validateNewPassword(),
          validateReNewPassword()
        ];
        if (!validations.every((v) => v))
          return;
        try {
          loading.value = true;
          const res = await uni.request({
            url: `${websiteUrl}/reset-password`,
            // 修改为重置密码接口
            method: "POST",
            data: {
              telephone: formData.value.telephone,
              code: formData.value.code,
              password: formData.value.newPassword,
              re_password: formData.value.reNewPassword
            }
          });
          if (res.data.status === "success") {
            uni.showToast({
              title: "密码重置成功",
              icon: "success",
              complete: () => {
                setTimeout(() => {
                  uni.navigateBack();
                }, 1500);
              }
            });
          } else {
            uni.showToast({
              title: res.data.msg || "重置失败",
              icon: "none"
            });
          }
        } catch (err) {
          uni.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        } finally {
          loading.value = false;
        }
      };
      const startCountdown = () => {
        codeCountdown.value = 60;
        const timer = setInterval(() => {
          if (codeCountdown.value <= 0) {
            clearInterval(timer);
            return;
          }
          codeCountdown.value--;
        }, 1e3);
      };
      const navigateToLogin = () => {
        uni.navigateBack();
      };
      const __returned__ = { formData, errors, codeCountdown, codeBtnDisabled, codeBtnText, loading, validatePhone, sendSmsCode, validateNewPassword, validateReNewPassword, validateCode, handleResetPassword, startCountdown, navigateToLogin, ref: vue.ref, computed: vue.computed, get websiteUrl() {
        return websiteUrl;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("text", { class: "title" }, "重置密码")
      ]),
      vue.createElementVNode("view", { class: "form-box" }, [
        vue.createCommentVNode(" 手机号输入 "),
        vue.createElementVNode("view", { class: "input-item" }, [
          vue.createElementVNode("view", { class: "input-wrapper" }, [
            vue.createElementVNode("text", { class: "prefix" }, "+86"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.formData.telephone = $event),
                type: "number",
                placeholder: "请输入手机号",
                maxlength: "11",
                class: "input",
                "placeholder-class": "placeholder",
                onBlur: $setup.validatePhone
              },
              null,
              544
              /* NEED_HYDRATION, NEED_PATCH */
            ), [
              [vue.vModelText, $setup.formData.telephone]
            ])
          ]),
          $setup.errors.phone ? (vue.openBlock(), vue.createElementBlock(
            "text",
            {
              key: 0,
              class: "error-text"
            },
            vue.toDisplayString($setup.errors.phone),
            1
            /* TEXT */
          )) : vue.createCommentVNode("v-if", true)
        ]),
        vue.createCommentVNode(" 验证码输入 "),
        vue.createElementVNode("view", { class: "input-item" }, [
          vue.createElementVNode("view", { class: "code-wrapper" }, [
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.formData.code = $event),
                type: "number",
                placeholder: "请输入验证码",
                maxlength: "6",
                class: "input",
                "placeholder-class": "placeholder",
                onBlur: $setup.validateCode
              },
              null,
              544
              /* NEED_HYDRATION, NEED_PATCH */
            ), [
              [vue.vModelText, $setup.formData.code]
            ]),
            vue.createElementVNode("button", {
              class: vue.normalizeClass(["code-btn", { disabled: $setup.codeBtnDisabled }]),
              disabled: $setup.codeBtnDisabled,
              onClick: $setup.sendSmsCode
            }, vue.toDisplayString($setup.codeBtnText), 11, ["disabled"])
          ]),
          $setup.errors.code ? (vue.openBlock(), vue.createElementBlock(
            "text",
            {
              key: 0,
              class: "error-text"
            },
            vue.toDisplayString($setup.errors.code),
            1
            /* TEXT */
          )) : vue.createCommentVNode("v-if", true)
        ]),
        vue.createCommentVNode(" 新密码输入 "),
        vue.createElementVNode("view", { class: "input-item" }, [
          vue.createElementVNode("view", { class: "input-wrapper" }, [
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $setup.formData.newPassword = $event),
                type: "password",
                placeholder: "请输入新密码（至少6位）",
                class: "input",
                "placeholder-class": "placeholder",
                onBlur: $setup.validateNewPassword
              },
              null,
              544
              /* NEED_HYDRATION, NEED_PATCH */
            ), [
              [vue.vModelText, $setup.formData.newPassword]
            ])
          ]),
          $setup.errors.newPassword ? (vue.openBlock(), vue.createElementBlock(
            "text",
            {
              key: 0,
              class: "error-text"
            },
            vue.toDisplayString($setup.errors.newPassword),
            1
            /* TEXT */
          )) : vue.createCommentVNode("v-if", true)
        ]),
        vue.createCommentVNode(" 确认新密码 "),
        vue.createElementVNode("view", { class: "input-item" }, [
          vue.createElementVNode("view", { class: "input-wrapper" }, [
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $setup.formData.reNewPassword = $event),
                type: "password",
                placeholder: "请再次输入新密码",
                class: "input",
                "placeholder-class": "placeholder",
                onBlur: $setup.validateReNewPassword
              },
              null,
              544
              /* NEED_HYDRATION, NEED_PATCH */
            ), [
              [vue.vModelText, $setup.formData.reNewPassword]
            ])
          ]),
          $setup.errors.reNewPassword ? (vue.openBlock(), vue.createElementBlock(
            "text",
            {
              key: 0,
              class: "error-text"
            },
            vue.toDisplayString($setup.errors.reNewPassword),
            1
            /* TEXT */
          )) : vue.createCommentVNode("v-if", true)
        ]),
        vue.createCommentVNode(" 提交按钮 "),
        vue.createElementVNode("button", {
          class: vue.normalizeClass(["submit-btn", { loading: $setup.loading }]),
          disabled: $setup.loading,
          onClick: $setup.handleResetPassword
        }, vue.toDisplayString($setup.loading ? "提交中..." : "重置密码"), 11, ["disabled"]),
        vue.createCommentVNode(" 返回登录 "),
        vue.createElementVNode("view", { class: "bottom-tips" }, [
          vue.createElementVNode("text", {
            class: "link-text",
            onClick: $setup.navigateToLogin
          }, "返回登录")
        ])
      ])
    ]);
  }
  const PagesResetPasswordResetPassword = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$6], ["__scopeId", "data-v-7140db85"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/reset_password/reset_password.vue"]]);
  const _sfc_main$6 = {
    __name: "username",
    setup(__props, { expose: __expose }) {
      __expose();
      uni.setNavigationBarTitle({
        title: "修改用户名"
      });
      const username = vue.ref(global.userInfo.username || "");
      const isLoading = vue.ref(false);
      const isFormValid = vue.computed(() => {
        return username.value.length >= 2 && username.value !== global.userInfo.username;
      });
      async function updateUsername() {
        if (!isFormValid.value)
          return;
        try {
          isLoading.value = true;
          const res = await uni.request({
            url: websiteUrl + "/with-state/update-profile",
            method: "POST",
            header: {
              "Authorization": uni.getStorageSync("token")
            },
            data: {
              username: username.value
            }
          });
          if (res.data.status === "success") {
            uni.showToast({
              title: "更新成功",
              icon: "success"
            });
            await getUserInfo();
            setTimeout(() => uni.navigateBack(), 1500);
          } else {
            uni.showToast({
              title: res.data.msg || "更新失败",
              icon: "none"
            });
          }
        } catch (error) {
          uni.showToast({
            title: "请求失败，请稍后重试",
            icon: "none"
          });
        } finally {
          isLoading.value = false;
        }
      }
      const __returned__ = { username, isLoading, isFormValid, updateUsername, ref: vue.ref, computed: vue.computed, get websiteUrl() {
        return websiteUrl;
      }, get global() {
        return global;
      }, get getUserInfo() {
        return getUserInfo;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$6);
    return vue.openBlock(), vue.createElementBlock("view", { class: "password-container" }, [
      vue.createElementVNode("view", { class: "form-wrapper" }, [
        vue.createElementVNode("view", { class: "input-group" }, [
          vue.createElementVNode("view", { class: "input-item" }, [
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "input",
                type: "text",
                placeholder: " ",
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.username = $event),
                maxlength: "20"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.username]
            ]),
            vue.createElementVNode("label", { class: "floating-label" }, "用户名"),
            vue.createVNode(_component_uni_icons, {
              class: "input-icon",
              type: "person",
              size: "18",
              color: "#999"
            })
          ])
        ]),
        vue.createElementVNode("button", {
          class: vue.normalizeClass(["submit-btn", { active: $setup.isFormValid }]),
          onClick: $setup.updateUsername,
          disabled: !$setup.isFormValid
        }, [
          vue.createTextVNode(
            vue.toDisplayString($setup.isLoading ? "提交中..." : "更新用户名") + " ",
            1
            /* TEXT */
          ),
          $setup.isLoading ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "loading"
          })) : vue.createCommentVNode("v-if", true)
        ], 10, ["disabled"])
      ]),
      vue.createElementVNode("view", { class: "security-tips" }, [
        vue.createVNode(_component_uni_icons, {
          type: "info",
          size: "16",
          color: "#666"
        }),
        vue.createElementVNode("text", null, "用户名2-20个字符，支持中英文、数字和下划线")
      ])
    ]);
  }
  const PagesSettingUsernameUsername = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$5], ["__scopeId", "data-v-ce7f77cb"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/setting/username/username.vue"]]);
  const _sfc_main$5 = {
    __name: "my_comment",
    setup(__props, { expose: __expose }) {
      __expose();
      const commentList = vue.ref([]);
      const currentPage = vue.ref(1);
      const pageSize2 = vue.ref(10);
      const total = vue.ref(0);
      const loading = vue.ref(false);
      const noMore = vue.ref(false);
      const commentTypes = {
        1: {
          name: "品牌",
          class: "brand"
        },
        2: {
          name: "商品",
          class: "goods"
        },
        3: {
          name: "搭配",
          class: "collocation"
        },
        4: {
          name: "资讯",
          class: "news"
        },
        5: {
          name: "树洞",
          class: "treehole"
        },
        6: {
          name: "展示柜",
          class: "collocation"
        },
        7: {
          name: "文章",
          class: "collocation"
        }
      };
      vue.onMounted(() => {
        loadComments();
      });
      const loadComments = async (isLoadMore = false) => {
        if (loading.value || noMore.value)
          return;
        loading.value = true;
        try {
          const res = await uni.request({
            url: `${websiteUrl}/with-state/my-comment`,
            method: "GET",
            header: {
              "Authorization": uni.getStorageSync("token")
            },
            data: {
              page: currentPage.value,
              page_size: pageSize2.value
            }
          });
          if (res.data.status === "success") {
            const data = res.data.data;
            commentList.value = isLoadMore ? [...commentList.value, ...data.comment_list] : data.comment_list;
            total.value = data.total;
            currentPage.value++;
            noMore.value = commentList.value.length >= total.value;
          }
        } finally {
          loading.value = false;
        }
      };
      const loadMore = () => {
        if (!noMore.value)
          loadComments(true);
      };
      const navigateToTarget = (item) => {
        let url = "";
        const id = item.relation_id;
        switch (item.type) {
          case 1:
            url = `/pages/brand/brand?brand_id=${id}`;
            break;
          case 2:
            url = `/pages/goods/goods?goods_id=${id}`;
            break;
          case 3:
            url = `/pages/collocation_share/collocation_share?collocation_id=${id}&origin=1`;
            break;
          case 4:
            url = `/pages/sale_news/sale_news?newsId=${id}`;
            break;
          case 5:
            url = `/pages/treehole_detail/treehole_detail?id=${id}`;
            break;
          case 6:
            url = `/pages/collocation_share/collocation_share?collocation_id=${id}&origin=2`;
            break;
          default:
            uni.showToast({
              title: "未知类型",
              icon: "none"
            });
            return;
        }
        if (url) {
          uni.navigateTo({
            url
          });
        }
      };
      const getTypeName = (type) => {
        var _a;
        return ((_a = commentTypes[type]) == null ? void 0 : _a.name) || "未知";
      };
      const getTypeClass = (type) => {
        var _a;
        return ((_a = commentTypes[type]) == null ? void 0 : _a.class) || "";
      };
      const truncate = (text, length) => {
        return text.length > length ? text.substring(0, length) + "..." : text;
      };
      function formatTime(timestamp) {
        const date = new Date(timestamp * 1e3);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const seconds = date.getSeconds().toString().padStart(2, "0");
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      }
      uni.setNavigationBarTitle({
        title: "我的评论"
      });
      const __returned__ = { commentList, currentPage, pageSize: pageSize2, total, loading, noMore, commentTypes, loadComments, loadMore, navigateToTarget, getTypeName, getTypeClass, truncate, formatTime, ref: vue.ref, onMounted: vue.onMounted, get websiteUrl() {
        return websiteUrl;
      }, get image1Url() {
        return image1Url;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "page-container" }, [
      vue.createCommentVNode(" 列表区域 "),
      vue.createElementVNode(
        "scroll-view",
        {
          class: "comment-list",
          "scroll-y": "",
          onScrolltolower: $setup.loadMore,
          "show-scrollbar": false
        },
        [
          vue.createCommentVNode(" 列表内容 "),
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.commentList, (item, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: index,
                class: "comment-item",
                onClick: ($event) => $setup.navigateToTarget(item)
              }, [
                vue.createCommentVNode(" 用户信息 "),
                vue.createElementVNode("view", { class: "user-info" }, [
                  vue.createElementVNode("image", {
                    class: "avatar",
                    src: item.avatar || "/static/default-avatar.png",
                    mode: "aspectFill"
                  }, null, 8, ["src"]),
                  vue.createElementVNode("view", { class: "user-meta" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "username" },
                      vue.toDisplayString(item.username),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "time" },
                      vue.toDisplayString($setup.formatTime(item.created_at)),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                vue.createCommentVNode(" 回复内容 "),
                vue.createElementVNode("view", { class: "content-box" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "content" },
                    vue.toDisplayString(item.comment),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createCommentVNode(" 关联目标 "),
                vue.createElementVNode("view", {
                  class: "target-box",
                  onClick: ($event) => $setup.navigateToTarget(item)
                }, [
                  item.target_image ? (vue.openBlock(), vue.createElementBlock("image", {
                    key: 0,
                    class: "target-image",
                    src: item.target_image,
                    mode: "aspectFill"
                  }, null, 8, ["src"])) : vue.createCommentVNode("v-if", true),
                  vue.createElementVNode("view", { class: "target-info" }, [
                    vue.createElementVNode(
                      "view",
                      {
                        class: vue.normalizeClass(["type-tag", $setup.getTypeClass(item.type)])
                      },
                      vue.toDisplayString($setup.getTypeName(item.type)),
                      3
                      /* TEXT, CLASS */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "target-name" },
                      vue.toDisplayString(item.target_name),
                      1
                      /* TEXT */
                    )
                  ])
                ], 8, ["onClick"])
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          )),
          vue.createCommentVNode(" 加载状态 "),
          vue.createElementVNode("view", { class: "loading-status" }, [
            $setup.loading ? (vue.openBlock(), vue.createElementBlock("text", {
              key: 0,
              class: "loading-text"
            }, "加载中...")) : vue.createCommentVNode("v-if", true),
            $setup.noMore ? (vue.openBlock(), vue.createElementBlock("text", {
              key: 1,
              class: "no-more-text"
            }, "没有更多了")) : vue.createCommentVNode("v-if", true)
          ])
        ],
        32
        /* NEED_HYDRATION */
      )
    ]);
  }
  const PagesMyCommentMyComment = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__scopeId", "data-v-7fd39f53"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/my_comment/my_comment.vue"]]);
  const _imports_0 = "/static/images/loading.gif";
  const _sfc_main$4 = {
    __name: "my_collocation",
    setup(__props, { expose: __expose }) {
      __expose();
      const list = vue.ref([]);
      const page = vue.ref(1);
      const pageSize2 = vue.ref(10);
      const total = vue.ref(0);
      const loading = vue.ref(false);
      const noMore = vue.ref(false);
      const formatTime = (timestamp) => {
        const date = new Date(timestamp * 1e3);
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      };
      const getList = async () => {
        if (noMore.value || loading.value)
          return;
        loading.value = true;
        try {
          const userInfo = await asyncGetUserInfo();
          if (!userInfo)
            return;
          const res = await uni.request({
            url: `${websiteUrl}/with-state/my-collocation`,
            method: "GET",
            header: {
              Authorization: uni.getStorageSync("token")
            },
            data: {
              page: page.value,
              page_size: pageSize2.value
            }
          });
          if (res.data.status === "success") {
            list.value = [...list.value, ...res.data.data.collocation_relation_list];
            total.value = res.data.data.total;
            noMore.value = list.value.length >= total.value;
            page.value++;
          }
        } catch (error) {
          uni.showToast({
            title: "加载失败",
            icon: "none"
          });
        } finally {
          loading.value = false;
        }
      };
      const loadMore = () => {
        if (!noMore.value)
          getList();
      };
      uni.setNavigationBarTitle({
        title: "我的搭配"
      });
      vue.onMounted(() => {
        getList();
      });
      const __returned__ = { list, page, pageSize: pageSize2, total, loading, noMore, formatTime, getList, loadMore, ref: vue.ref, onMounted: vue.onMounted, get websiteUrl() {
        return websiteUrl;
      }, get image1Url() {
        return image1Url;
      }, get asyncGetUserInfo() {
        return asyncGetUserInfo;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("meta", {
        name: "theme-color",
        content: "#F8F8F8"
      }),
      vue.createElementVNode(
        "scroll-view",
        {
          class: "scroll-content",
          "scroll-y": "",
          onScrolltolower: $setup.loadMore,
          "show-scrollbar": false
        },
        [
          $setup.list.length === 0 && !$setup.loading ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "empty-tip"
          }, " 暂无发布的搭配，快去创建吧~ ")) : vue.createCommentVNode("v-if", true),
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.list, (item, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: index,
                class: "collocation-card"
              }, [
                vue.createCommentVNode(" 头部信息 "),
                vue.createElementVNode("view", { class: "card-header" }, [
                  vue.createElementVNode("image", {
                    class: "avatar",
                    src: item.avatar || `${$setup.image1Url}/default-avatar.png`,
                    mode: "aspectFill"
                  }, null, 8, ["src"]),
                  vue.createElementVNode(
                    "text",
                    { class: "time" },
                    vue.toDisplayString($setup.formatTime(item.created_at)),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createCommentVNode(" 图片展示 "),
                vue.createElementVNode("view", { class: "image-container" }, [
                  item.image_urls.length > 1 ? (vue.openBlock(), vue.createElementBlock("swiper", {
                    key: 0,
                    class: "swiper-box",
                    autoplay: false,
                    circular: true
                  }, [
                    (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList(item.image_urls, (img, imgIndex) => {
                        return vue.openBlock(), vue.createElementBlock("swiper-item", { key: imgIndex }, [
                          vue.createElementVNode("image", {
                            class: "swiper-image",
                            src: img,
                            mode: "aspectFill",
                            "lazy-load": "",
                            style: { aspectRatio: "3/4" }
                          }, null, 8, ["src"])
                        ]);
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])) : (vue.openBlock(), vue.createElementBlock("image", {
                    key: 1,
                    class: "single-image",
                    src: item.image_urls[0],
                    mode: "aspectFill",
                    "lazy-load": "",
                    style: { aspectRatio: "3/4" }
                  }, null, 8, ["src"]))
                ]),
                vue.createCommentVNode(" 内容区域 "),
                vue.createElementVNode("view", { class: "content-box" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "title" },
                    vue.toDisplayString(item.title),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "content" },
                    vue.toDisplayString(item.content),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createCommentVNode(" 关联商品 "),
                item.relation_list.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "relation-box"
                }, [
                  vue.createElementVNode("text", { class: "relation-label" }, "搭配包含："),
                  vue.createElementVNode("scroll-view", {
                    "scroll-x": "",
                    class: "tag-scroll"
                  }, [
                    (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList(item.relation_list, (rel, relIndex) => {
                        return vue.openBlock(), vue.createElementBlock(
                          "view",
                          {
                            key: relIndex,
                            class: "relation-tag"
                          },
                          vue.toDisplayString(rel.type) + "·" + vue.toDisplayString(rel.relation_goods_name || rel.relation_brand_name),
                          1
                          /* TEXT */
                        );
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ])) : vue.createCommentVNode("v-if", true)
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          )),
          vue.createCommentVNode(" 加载状态 "),
          $setup.loading ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "loading-box"
          }, [
            vue.createElementVNode("image", {
              src: _imports_0,
              class: "loading-icon"
            }),
            vue.createElementVNode("text", null, "加载中...")
          ])) : vue.createCommentVNode("v-if", true),
          $setup.noMore ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 2,
            class: "no-more"
          }, "没有更多了～")) : vue.createCommentVNode("v-if", true)
        ],
        32
        /* NEED_HYDRATION */
      )
    ]);
  }
  const PagesMyCollocationMyCollocation = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__scopeId", "data-v-c07e3656"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/my_collocation/my_collocation.vue"]]);
  const block0 = (Comp) => {
    (Comp.$wxs || (Comp.$wxs = [])).push("handler");
    (Comp.$wxsModules || (Comp.$wxsModules = {}))["handler"] = "2f992f8c";
  };
  const _sfc_main$3 = {
    name: "node",
    options: {},
    data() {
      return {
        ctrl: {}
      };
    },
    props: {
      name: String,
      attrs: {
        type: Object,
        default() {
          return {};
        }
      },
      childs: Array,
      opts: Array
    },
    components: {},
    mounted() {
      this.$nextTick(() => {
        for (this.root = this.$parent; this.root.$options.name !== "mp-html"; this.root = this.root.$parent)
          ;
      });
      if (this.opts[0]) {
        let i;
        for (i = this.childs.length; i--; ) {
          if (this.childs[i].name === "img")
            break;
        }
        if (i !== -1) {
          this.observer = uni.createIntersectionObserver(this).relativeToViewport({
            top: 500,
            bottom: 500
          });
          this.observer.observe("._img", (res) => {
            if (res.intersectionRatio) {
              this.$set(this.ctrl, "load", 1);
              this.observer.disconnect();
            }
          });
        }
      }
    },
    beforeDestroy() {
      if (this.observer) {
        this.observer.disconnect();
      }
    },
    methods: {
      /**
       * @description 播放视频事件
       * @param {Event} e
       */
      play(e) {
        const i = e.currentTarget.dataset.i;
        const node2 = this.childs[i];
        this.root.$emit("play", {
          source: node2.name,
          attrs: {
            ...node2.attrs,
            src: node2.src[this.ctrl[i] || 0]
          }
        });
      },
      /**
       * @description 图片点击事件
       * @param {Event} e
       */
      imgTap(e) {
        const node2 = this.childs[e.currentTarget.dataset.i];
        if (node2.a) {
          this.linkTap(node2.a);
          return;
        }
        if (node2.attrs.ignore)
          return;
        node2.attrs.src = node2.attrs.src || node2.attrs["data-src"];
        this.root.$emit("imgtap", node2.attrs);
        if (this.root.previewImg) {
          uni.previewImage({
            current: parseInt(node2.attrs.i),
            urls: this.root.imgList
          });
        }
      },
      /**
       * @description 图片长按
       */
      imgLongTap(e) {
        const attrs = this.childs[e.currentTarget.dataset.i].attrs;
        if (this.opts[3] && !attrs.ignore) {
          uni.showActionSheet({
            itemList: ["保存图片"],
            success: () => {
              const save = (path) => {
                uni.saveImageToPhotosAlbum({
                  filePath: path,
                  success() {
                    uni.showToast({
                      title: "保存成功"
                    });
                  }
                });
              };
              if (this.root.imgList[attrs.i].startsWith("http")) {
                uni.downloadFile({
                  url: this.root.imgList[attrs.i],
                  success: (res) => save(res.tempFilePath)
                });
              } else {
                save(this.root.imgList[attrs.i]);
              }
            }
          });
        }
      },
      /**
       * @description 图片加载完成事件
       * @param {Event} e
       */
      imgLoad(e) {
        const i = e.currentTarget.dataset.i;
        if (!this.childs[i].w) {
          this.$set(this.ctrl, i, e.detail.width);
        } else if (this.opts[1] && !this.ctrl[i] || this.ctrl[i] === -1) {
          this.$set(this.ctrl, i, 1);
        }
        this.checkReady();
      },
      /**
       * @description 检查是否所有图片加载完毕
       */
      checkReady() {
        if (this.root && !this.root.lazyLoad) {
          this.root._unloadimgs -= 1;
          if (!this.root._unloadimgs) {
            setTimeout(() => {
              this.root.getRect().then((rect) => {
                this.root.$emit("ready", rect);
              }).catch(() => {
                this.root.$emit("ready", {});
              });
            }, 350);
          }
        }
      },
      /**
       * @description 链接点击事件
       * @param {Event} e
       */
      linkTap(e) {
        const node2 = e.currentTarget ? this.childs[e.currentTarget.dataset.i] : {};
        const attrs = node2.attrs || e;
        const href = attrs.href;
        this.root.$emit("linktap", Object.assign({
          innerText: this.root.getText(node2.children || [])
          // 链接内的文本内容
        }, attrs));
        if (href) {
          if (href[0] === "#") {
            this.root.navigateTo(href.substring(1)).catch(() => {
            });
          } else if (href.split("?")[0].includes("://")) {
            if (this.root.copyLink) {
              plus.runtime.openWeb(href);
            }
          } else {
            uni.navigateTo({
              url: href,
              fail() {
                uni.switchTab({
                  url: href,
                  fail() {
                  }
                });
              }
            });
          }
        }
      },
      /**
       * @description 错误事件
       * @param {Event} e
       */
      mediaError(e) {
        const i = e.currentTarget.dataset.i;
        const node2 = this.childs[i];
        if (node2.name === "video" || node2.name === "audio") {
          let index = (this.ctrl[i] || 0) + 1;
          if (index > node2.src.length) {
            index = 0;
          }
          if (index < node2.src.length) {
            this.$set(this.ctrl, i, index);
            return;
          }
        } else if (node2.name === "img") {
          if (this.opts[2]) {
            this.$set(this.ctrl, i, -1);
          }
          this.checkReady();
        }
        if (this.root) {
          this.root.$emit("error", {
            source: node2.name,
            attrs: node2.attrs,
            errMsg: e.detail.errMsg
          });
        }
      }
    }
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_node = vue.resolveComponent("node", true);
    return vue.openBlock(), vue.createElementBlock("view", {
      id: $props.attrs.id,
      class: vue.normalizeClass("_block _" + $props.name + " " + $props.attrs.class),
      style: vue.normalizeStyle($props.attrs.style)
    }, [
      (vue.openBlock(true), vue.createElementBlock(
        vue.Fragment,
        null,
        vue.renderList($props.childs, (n, i) => {
          return vue.openBlock(), vue.createElementBlock(
            vue.Fragment,
            { key: i },
            [
              vue.createCommentVNode(" 图片 "),
              vue.createCommentVNode(" 占位图 "),
              n.name === "img" && !n.t && ($props.opts[1] && !$data.ctrl[i] || $data.ctrl[i] < 0) ? (vue.openBlock(), vue.createElementBlock("image", {
                key: 0,
                class: "_img",
                style: vue.normalizeStyle(n.attrs.style),
                src: $data.ctrl[i] < 0 ? $props.opts[2] : $props.opts[1],
                mode: "widthFix"
              }, null, 12, ["src"])) : vue.createCommentVNode("v-if", true),
              vue.createCommentVNode(" 显示图片 "),
              vue.createCommentVNode(" 表格中的图片，使用 rich-text 防止大小不正确 "),
              n.name === "img" && n.t ? (vue.openBlock(), vue.createElementBlock("rich-text", {
                key: 1,
                style: vue.normalizeStyle("display:" + n.t),
                nodes: [{ attrs: { style: n.attrs.style || "", src: n.attrs.src }, name: "img" }],
                "data-i": i,
                onClick: _cache[0] || (_cache[0] = vue.withModifiers((...args) => $options.imgTap && $options.imgTap(...args), ["stop"]))
              }, null, 12, ["nodes", "data-i"])) : n.name === "img" ? (vue.openBlock(), vue.createElementBlock("image", {
                key: 2,
                id: n.attrs.id,
                class: vue.normalizeClass("_img " + n.attrs.class),
                style: vue.normalizeStyle(($data.ctrl[i] === -1 ? "display:none;" : "") + "width:" + ($data.ctrl[i] || 1) + "px;" + n.attrs.style),
                src: n.attrs.src || ($data.ctrl.load ? n.attrs["data-src"] : ""),
                mode: !n.h ? "widthFix" : !n.w ? "heightFix" : n.m || "",
                "data-i": i,
                onLoad: _cache[1] || (_cache[1] = (...args) => $options.imgLoad && $options.imgLoad(...args)),
                onError: _cache[2] || (_cache[2] = (...args) => $options.mediaError && $options.mediaError(...args)),
                onClick: _cache[3] || (_cache[3] = vue.withModifiers((...args) => $options.imgTap && $options.imgTap(...args), ["stop"])),
                onLongpress: _cache[4] || (_cache[4] = (...args) => $options.imgLongTap && $options.imgLongTap(...args))
              }, null, 46, ["id", "src", "mode", "data-i"])) : n.text ? (vue.openBlock(), vue.createElementBlock(
                vue.Fragment,
                { key: 3 },
                [
                  vue.createCommentVNode(" 文本 "),
                  vue.createElementVNode(
                    "text",
                    { decode: "" },
                    vue.toDisplayString(n.text),
                    1
                    /* TEXT */
                  )
                ],
                2112
                /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
              )) : n.name === "br" ? (vue.openBlock(), vue.createElementBlock("text", { key: 4 }, "\\n")) : n.name === "a" ? (vue.openBlock(), vue.createElementBlock(
                vue.Fragment,
                { key: 5 },
                [
                  vue.createCommentVNode(" 链接 "),
                  vue.createElementVNode("view", {
                    id: n.attrs.id,
                    class: vue.normalizeClass((n.attrs.href ? "_a " : "") + n.attrs.class),
                    "hover-class": "_hover",
                    style: vue.normalizeStyle("display:inline;" + n.attrs.style),
                    "data-i": i,
                    onClick: _cache[5] || (_cache[5] = vue.withModifiers((...args) => $options.linkTap && $options.linkTap(...args), ["stop"]))
                  }, [
                    vue.createVNode(_component_node, {
                      name: "span",
                      childs: n.children,
                      opts: $props.opts,
                      style: { "display": "inherit" }
                    }, null, 8, ["childs", "opts"])
                  ], 14, ["id", "data-i"])
                ],
                2112
                /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
              )) : n.html ? (vue.openBlock(), vue.createElementBlock(
                vue.Fragment,
                { key: 6 },
                [
                  vue.createCommentVNode(" 视频 "),
                  vue.createElementVNode("view", {
                    id: n.attrs.id,
                    class: vue.normalizeClass("_video " + n.attrs.class),
                    style: vue.normalizeStyle(n.attrs.style),
                    innerHTML: n.html,
                    "data-i": i,
                    onVplay: _cache[6] || (_cache[6] = vue.withModifiers((...args) => $options.play && $options.play(...args), ["stop"]))
                  }, null, 46, ["id", "innerHTML", "data-i"])
                ],
                2112
                /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
              )) : n.name === "iframe" ? (vue.openBlock(), vue.createElementBlock("iframe", {
                key: 7,
                style: vue.normalizeStyle(n.attrs.style),
                allowfullscreen: n.attrs.allowfullscreen,
                frameborder: n.attrs.frameborder,
                src: n.attrs.src
              }, null, 12, ["allowfullscreen", "frameborder", "src"])) : n.name === "embed" ? (vue.openBlock(), vue.createElementBlock("embed", {
                key: 8,
                style: vue.normalizeStyle(n.attrs.style),
                src: n.attrs.src
              }, null, 12, ["src"])) : n.name === "table" && n.c || n.name === "li" ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 9,
                id: n.attrs.id,
                class: vue.normalizeClass("_" + n.name + " " + n.attrs.class),
                style: vue.normalizeStyle(n.attrs.style)
              }, [
                n.name === "li" ? (vue.openBlock(), vue.createBlock(_component_node, {
                  key: 0,
                  childs: n.children,
                  opts: $props.opts
                }, null, 8, ["childs", "opts"])) : (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  { key: 1 },
                  vue.renderList(n.children, (tbody, x) => {
                    return vue.openBlock(), vue.createElementBlock(
                      "view",
                      {
                        key: x,
                        class: vue.normalizeClass("_" + tbody.name + " " + tbody.attrs.class),
                        style: vue.normalizeStyle(tbody.attrs.style)
                      },
                      [
                        tbody.name === "td" || tbody.name === "th" ? (vue.openBlock(), vue.createBlock(_component_node, {
                          key: 0,
                          childs: tbody.children,
                          opts: $props.opts
                        }, null, 8, ["childs", "opts"])) : (vue.openBlock(true), vue.createElementBlock(
                          vue.Fragment,
                          { key: 1 },
                          vue.renderList(tbody.children, (tr, y) => {
                            return vue.openBlock(), vue.createElementBlock(
                              vue.Fragment,
                              { key: y },
                              [
                                tr.name === "td" || tr.name === "th" ? (vue.openBlock(), vue.createElementBlock(
                                  "view",
                                  {
                                    key: 0,
                                    class: vue.normalizeClass("_" + tr.name + " " + tr.attrs.class),
                                    style: vue.normalizeStyle(tr.attrs.style)
                                  },
                                  [
                                    vue.createVNode(_component_node, {
                                      childs: tr.children,
                                      opts: $props.opts
                                    }, null, 8, ["childs", "opts"])
                                  ],
                                  6
                                  /* CLASS, STYLE */
                                )) : (vue.openBlock(), vue.createElementBlock(
                                  "view",
                                  {
                                    key: 1,
                                    class: vue.normalizeClass("_" + tr.name + " " + tr.attrs.class),
                                    style: vue.normalizeStyle(tr.attrs.style)
                                  },
                                  [
                                    (vue.openBlock(true), vue.createElementBlock(
                                      vue.Fragment,
                                      null,
                                      vue.renderList(tr.children, (td, z) => {
                                        return vue.openBlock(), vue.createElementBlock(
                                          "view",
                                          {
                                            key: z,
                                            class: vue.normalizeClass("_" + td.name + " " + td.attrs.class),
                                            style: vue.normalizeStyle(td.attrs.style)
                                          },
                                          [
                                            vue.createVNode(_component_node, {
                                              childs: td.children,
                                              opts: $props.opts
                                            }, null, 8, ["childs", "opts"])
                                          ],
                                          6
                                          /* CLASS, STYLE */
                                        );
                                      }),
                                      128
                                      /* KEYED_FRAGMENT */
                                    ))
                                  ],
                                  6
                                  /* CLASS, STYLE */
                                ))
                              ],
                              64
                              /* STABLE_FRAGMENT */
                            );
                          }),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ],
                      6
                      /* CLASS, STYLE */
                    );
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ], 14, ["id"])) : !n.c ? (vue.openBlock(), vue.createElementBlock(
                vue.Fragment,
                { key: 10 },
                [
                  vue.createCommentVNode(" 富文本 "),
                  vue.createElementVNode("rich-text", {
                    id: n.attrs.id,
                    style: vue.normalizeStyle("display:inline;" + n.f),
                    preview: false,
                    selectable: $props.opts[4],
                    "user-select": $props.opts[4],
                    nodes: [n]
                  }, null, 12, ["id", "selectable", "user-select", "nodes"])
                ],
                2112
                /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
              )) : n.c === 2 ? (vue.openBlock(), vue.createElementBlock(
                vue.Fragment,
                { key: 11 },
                [
                  vue.createCommentVNode(" 继续递归 "),
                  vue.createElementVNode("view", {
                    id: n.attrs.id,
                    class: vue.normalizeClass("_block _" + n.name + " " + n.attrs.class),
                    style: vue.normalizeStyle(n.f + ";" + n.attrs.style)
                  }, [
                    (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList(n.children, (n2, j) => {
                        return vue.openBlock(), vue.createBlock(_component_node, {
                          key: j,
                          style: vue.normalizeStyle(n2.f),
                          name: n2.name,
                          attrs: n2.attrs,
                          childs: n2.children,
                          opts: $props.opts
                        }, null, 8, ["style", "name", "attrs", "childs", "opts"]);
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ], 14, ["id"])
                ],
                2112
                /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
              )) : (vue.openBlock(), vue.createBlock(_component_node, {
                key: 12,
                style: vue.normalizeStyle(n.f),
                name: n.name,
                attrs: n.attrs,
                childs: n.children,
                opts: $props.opts
              }, null, 8, ["style", "name", "attrs", "childs", "opts"]))
            ],
            64
            /* STABLE_FRAGMENT */
          );
        }),
        128
        /* KEYED_FRAGMENT */
      ))
    ], 14, ["id"]);
  }
  if (typeof block0 === "function")
    block0(_sfc_main$3);
  const node = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__scopeId", "data-v-8845ff2f"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/uni_modules/mp-html/components/mp-html/node/node.vue"]]);
  const config = {
    // 信任的标签（保持标签名不变）
    trustTags: makeMap("a,abbr,ad,audio,b,blockquote,br,code,col,colgroup,dd,del,dl,dt,div,em,fieldset,h1,h2,h3,h4,h5,h6,hr,i,img,ins,label,legend,li,ol,p,q,ruby,rt,source,span,strong,sub,sup,table,tbody,td,tfoot,th,thead,tr,title,ul,video"),
    // 块级标签（转为 div，其他的非信任标签转为 span）
    blockTags: makeMap("address,article,aside,body,caption,center,cite,footer,header,html,nav,pre,section"),
    // 行内标签
    inlineTags: makeMap("abbr,b,big,code,del,em,i,ins,label,q,small,span,strong,sub,sup"),
    // 要移除的标签
    ignoreTags: makeMap("area,base,canvas,embed,frame,head,iframe,input,link,map,meta,param,rp,script,source,style,textarea,title,track,wbr"),
    // 自闭合的标签
    voidTags: makeMap("area,base,br,col,circle,ellipse,embed,frame,hr,img,input,line,link,meta,param,path,polygon,rect,source,track,use,wbr"),
    // html 实体
    entities: {
      lt: "<",
      gt: ">",
      quot: '"',
      apos: "'",
      ensp: " ",
      emsp: " ",
      nbsp: " ",
      semi: ";",
      ndash: "–",
      mdash: "—",
      middot: "·",
      lsquo: "‘",
      rsquo: "’",
      ldquo: "“",
      rdquo: "”",
      bull: "•",
      hellip: "…",
      larr: "←",
      uarr: "↑",
      rarr: "→",
      darr: "↓"
    },
    // 默认的标签样式
    tagStyle: {
      address: "font-style:italic",
      big: "display:inline;font-size:1.2em",
      caption: "display:table-caption;text-align:center",
      center: "text-align:center",
      cite: "font-style:italic",
      dd: "margin-left:40px",
      mark: "background-color:yellow",
      pre: "font-family:monospace;white-space:pre",
      s: "text-decoration:line-through",
      small: "display:inline;font-size:0.8em",
      strike: "text-decoration:line-through",
      u: "text-decoration:underline"
    },
    // svg 大小写对照表
    svgDict: {
      animatetransform: "animateTransform",
      lineargradient: "linearGradient",
      viewbox: "viewBox",
      attributename: "attributeName",
      repeatcount: "repeatCount",
      repeatdur: "repeatDur",
      foreignobject: "foreignObject"
    }
  };
  const tagSelector = {};
  let windowWidth;
  const systemInfo = uni.getSystemInfoSync();
  windowWidth = systemInfo.windowWidth;
  const blankChar = makeMap(" ,\r,\n,	,\f");
  let idIndex = 0;
  config.ignoreTags.iframe = void 0;
  config.trustTags.iframe = true;
  config.ignoreTags.embed = void 0;
  config.trustTags.embed = true;
  function makeMap(str) {
    const map = /* @__PURE__ */ Object.create(null);
    const list = str.split(",");
    for (let i = list.length; i--; ) {
      map[list[i]] = true;
    }
    return map;
  }
  function decodeEntity(str, amp) {
    let i = str.indexOf("&");
    while (i !== -1) {
      const j = str.indexOf(";", i + 3);
      let code;
      if (j === -1)
        break;
      if (str[i + 1] === "#") {
        code = parseInt((str[i + 2] === "x" ? "0" : "") + str.substring(i + 2, j));
        if (!isNaN(code)) {
          str = str.substr(0, i) + String.fromCharCode(code) + str.substr(j + 1);
        }
      } else {
        code = str.substring(i + 1, j);
        if (config.entities[code] || code === "amp" && amp) {
          str = str.substr(0, i) + (config.entities[code] || "&") + str.substr(j + 1);
        }
      }
      i = str.indexOf("&", i + 1);
    }
    return str;
  }
  function mergeNodes(nodes) {
    let i = nodes.length - 1;
    for (let j = i; j >= -1; j--) {
      if (j === -1 || nodes[j].c || !nodes[j].name || nodes[j].name !== "div" && nodes[j].name !== "p" && nodes[j].name[0] !== "h" || (nodes[j].attrs.style || "").includes("inline")) {
        if (i - j >= 5) {
          nodes.splice(j + 1, i - j, {
            name: "div",
            attrs: {},
            children: nodes.slice(j + 1, i + 1)
          });
        }
        i = j - 1;
      }
    }
  }
  function Parser(vm) {
    this.options = vm || {};
    this.tagStyle = Object.assign({}, config.tagStyle, this.options.tagStyle);
    this.imgList = vm.imgList || [];
    this.imgList._unloadimgs = 0;
    this.plugins = vm.plugins || [];
    this.attrs = /* @__PURE__ */ Object.create(null);
    this.stack = [];
    this.nodes = [];
    this.pre = (this.options.containerStyle || "").includes("white-space") && this.options.containerStyle.includes("pre") ? 2 : 0;
  }
  Parser.prototype.parse = function(content) {
    for (let i = this.plugins.length; i--; ) {
      if (this.plugins[i].onUpdate) {
        content = this.plugins[i].onUpdate(content, config) || content;
      }
    }
    new Lexer(this).parse(content);
    while (this.stack.length) {
      this.popNode();
    }
    if (this.nodes.length > 50) {
      mergeNodes(this.nodes);
    }
    return this.nodes;
  };
  Parser.prototype.expose = function() {
    for (let i = this.stack.length; i--; ) {
      const item = this.stack[i];
      if (item.c || item.name === "a" || item.name === "video" || item.name === "audio")
        return;
      item.c = 1;
    }
  };
  Parser.prototype.hook = function(node2) {
    for (let i = this.plugins.length; i--; ) {
      if (this.plugins[i].onParse && this.plugins[i].onParse(node2, this) === false) {
        return false;
      }
    }
    return true;
  };
  Parser.prototype.getUrl = function(url) {
    const domain = this.options.domain;
    if (url[0] === "/") {
      if (url[1] === "/") {
        url = (domain ? domain.split("://")[0] : "http") + ":" + url;
      } else if (domain) {
        url = domain + url;
      } else {
        url = plus.io.convertLocalFileSystemURL(url);
      }
    } else if (!url.includes("data:") && !url.includes("://")) {
      if (domain) {
        url = domain + "/" + url;
      } else {
        url = plus.io.convertLocalFileSystemURL(url);
      }
    }
    return url;
  };
  Parser.prototype.parseStyle = function(node2) {
    const attrs = node2.attrs;
    const list = (this.tagStyle[node2.name] || "").split(";").concat((attrs.style || "").split(";"));
    const styleObj = {};
    let tmp = "";
    if (attrs.id && !this.xml) {
      if (this.options.useAnchor) {
        this.expose();
      } else if (node2.name !== "img" && node2.name !== "a" && node2.name !== "video" && node2.name !== "audio") {
        attrs.id = void 0;
      }
    }
    if (attrs.width) {
      styleObj.width = parseFloat(attrs.width) + (attrs.width.includes("%") ? "%" : "px");
      attrs.width = void 0;
    }
    if (attrs.height) {
      styleObj.height = parseFloat(attrs.height) + (attrs.height.includes("%") ? "%" : "px");
      attrs.height = void 0;
    }
    for (let i = 0, len = list.length; i < len; i++) {
      const info = list[i].split(":");
      if (info.length < 2)
        continue;
      const key = info.shift().trim().toLowerCase();
      let value = info.join(":").trim();
      if (value[0] === "-" && value.lastIndexOf("-") > 0 || value.includes("safe")) {
        tmp += `;${key}:${value}`;
      } else if (!styleObj[key] || value.includes("import") || !styleObj[key].includes("import")) {
        if (value.includes("url")) {
          let j = value.indexOf("(") + 1;
          if (j) {
            while (value[j] === '"' || value[j] === "'" || blankChar[value[j]]) {
              j++;
            }
            value = value.substr(0, j) + this.getUrl(value.substr(j));
          }
        } else if (value.includes("rpx")) {
          value = value.replace(/[0-9.]+\s*rpx/g, ($) => parseFloat($) * windowWidth / 750 + "px");
        }
        styleObj[key] = value;
      }
    }
    node2.attrs.style = tmp;
    return styleObj;
  };
  Parser.prototype.onTagName = function(name) {
    this.tagName = this.xml ? name : name.toLowerCase();
    if (this.tagName === "svg") {
      this.xml = (this.xml || 0) + 1;
      config.ignoreTags.style = void 0;
    }
  };
  Parser.prototype.onAttrName = function(name) {
    name = this.xml ? name : name.toLowerCase();
    if (name.includes("?") || name.includes(";")) {
      this.attrName = void 0;
      return;
    }
    if (name.substr(0, 5) === "data-") {
      if (name === "data-src" && !this.attrs.src) {
        this.attrName = "src";
      } else if (this.tagName === "img" || this.tagName === "a") {
        this.attrName = name;
      } else {
        this.attrName = void 0;
      }
    } else {
      this.attrName = name;
      this.attrs[name] = "T";
    }
  };
  Parser.prototype.onAttrVal = function(val) {
    const name = this.attrName || "";
    if (name === "style" || name === "href") {
      this.attrs[name] = decodeEntity(val, true);
    } else if (name.includes("src")) {
      this.attrs[name] = this.getUrl(decodeEntity(val, true));
    } else if (name) {
      this.attrs[name] = val;
    }
  };
  Parser.prototype.onOpenTag = function(selfClose) {
    const node2 = /* @__PURE__ */ Object.create(null);
    node2.name = this.tagName;
    node2.attrs = this.attrs;
    if (this.options.nodes.length) {
      node2.type = "node";
    }
    this.attrs = /* @__PURE__ */ Object.create(null);
    const attrs = node2.attrs;
    const parent = this.stack[this.stack.length - 1];
    const siblings = parent ? parent.children : this.nodes;
    const close = this.xml ? selfClose : config.voidTags[node2.name];
    if (tagSelector[node2.name]) {
      attrs.class = tagSelector[node2.name] + (attrs.class ? " " + attrs.class : "");
    }
    if (node2.name === "embed") {
      this.expose();
    }
    if (node2.name === "video" || node2.name === "audio") {
      if (node2.name === "video" && !attrs.id) {
        attrs.id = "v" + idIndex++;
      }
      if (!attrs.controls && !attrs.autoplay) {
        attrs.controls = "T";
      }
      node2.src = [];
      if (attrs.src) {
        node2.src.push(attrs.src);
        attrs.src = void 0;
      }
      this.expose();
    }
    if (close) {
      if (!this.hook(node2) || config.ignoreTags[node2.name]) {
        if (node2.name === "base" && !this.options.domain) {
          this.options.domain = attrs.href;
        } else if (node2.name === "source" && parent && (parent.name === "video" || parent.name === "audio") && attrs.src) {
          parent.src.push(attrs.src);
        }
        return;
      }
      const styleObj = this.parseStyle(node2);
      if (node2.name === "img") {
        if (attrs.src) {
          if (attrs.src.includes("webp")) {
            node2.webp = "T";
          }
          if (attrs.src.includes("data:") && this.options.previewImg !== "all" && !attrs["original-src"]) {
            attrs.ignore = "T";
          }
          if (!attrs.ignore || node2.webp || attrs.src.includes("cloud://")) {
            for (let i = this.stack.length; i--; ) {
              const item = this.stack[i];
              if (item.name === "a") {
                node2.a = item.attrs;
              }
              if (item.name === "table" && !node2.webp && !attrs.src.includes("cloud://")) {
                if (!styleObj.display || styleObj.display.includes("inline")) {
                  node2.t = "inline-block";
                } else {
                  node2.t = styleObj.display;
                }
                styleObj.display = void 0;
              }
              item.c = 1;
            }
            attrs.i = this.imgList.length.toString();
            let src = attrs["original-src"] || attrs.src;
            this.imgList.push(src);
            if (!node2.t) {
              this.imgList._unloadimgs += 1;
            }
            if (this.options.lazyLoad) {
              attrs["data-src"] = attrs.src;
              attrs.src = void 0;
            }
          }
        }
        if (styleObj.display === "inline") {
          styleObj.display = "";
        }
        if (attrs.ignore) {
          styleObj["max-width"] = styleObj["max-width"] || "100%";
          attrs.style += ";-webkit-touch-callout:none";
        }
        if (parseInt(styleObj.width) > windowWidth) {
          styleObj.height = void 0;
        }
        if (!isNaN(parseInt(styleObj.width))) {
          node2.w = "T";
        }
        if (!isNaN(parseInt(styleObj.height)) && (!styleObj.height.includes("%") || parent && (parent.attrs.style || "").includes("height"))) {
          node2.h = "T";
        }
        if (node2.w && node2.h && styleObj["object-fit"]) {
          if (styleObj["object-fit"] === "contain") {
            node2.m = "aspectFit";
          } else if (styleObj["object-fit"] === "cover") {
            node2.m = "aspectFill";
          }
        }
      } else if (node2.name === "svg") {
        siblings.push(node2);
        this.stack.push(node2);
        this.popNode();
        return;
      }
      for (const key in styleObj) {
        if (styleObj[key]) {
          attrs.style += `;${key}:${styleObj[key].replace(" !important", "")}`;
        }
      }
      attrs.style = attrs.style.substr(1) || void 0;
    } else {
      if ((node2.name === "pre" || (attrs.style || "").includes("white-space") && attrs.style.includes("pre")) && this.pre !== 2) {
        this.pre = node2.pre = 1;
      }
      node2.children = [];
      this.stack.push(node2);
    }
    siblings.push(node2);
  };
  Parser.prototype.onCloseTag = function(name) {
    name = this.xml ? name : name.toLowerCase();
    let i;
    for (i = this.stack.length; i--; ) {
      if (this.stack[i].name === name)
        break;
    }
    if (i !== -1) {
      while (this.stack.length > i) {
        this.popNode();
      }
    } else if (name === "p" || name === "br") {
      const siblings = this.stack.length ? this.stack[this.stack.length - 1].children : this.nodes;
      siblings.push({
        name,
        attrs: {
          class: tagSelector[name] || "",
          style: this.tagStyle[name] || ""
        }
      });
    }
  };
  Parser.prototype.popNode = function() {
    const node2 = this.stack.pop();
    let attrs = node2.attrs;
    const children = node2.children;
    const parent = this.stack[this.stack.length - 1];
    const siblings = parent ? parent.children : this.nodes;
    if (!this.hook(node2) || config.ignoreTags[node2.name]) {
      if (node2.name === "title" && children.length && children[0].type === "text" && this.options.setTitle) {
        uni.setNavigationBarTitle({
          title: children[0].text
        });
      }
      siblings.pop();
      return;
    }
    if (node2.pre && this.pre !== 2) {
      this.pre = node2.pre = void 0;
      for (let i = this.stack.length; i--; ) {
        if (this.stack[i].pre) {
          this.pre = 1;
        }
      }
    }
    const styleObj = {};
    if (node2.name === "svg") {
      if (this.xml > 1) {
        this.xml--;
        return;
      }
      let src = "";
      const style = attrs.style;
      attrs.style = "";
      attrs.xmlns = "http://www.w3.org/2000/svg";
      (function traversal(node3) {
        if (node3.type === "text") {
          src += node3.text;
          return;
        }
        const name = config.svgDict[node3.name] || node3.name;
        if (name === "foreignObject") {
          for (const child of node3.children || []) {
            if (child.attrs && !child.attrs.xmlns) {
              child.attrs.xmlns = "http://www.w3.org/1999/xhtml";
              break;
            }
          }
        }
        src += "<" + name;
        for (const item in node3.attrs) {
          const val = node3.attrs[item];
          if (val) {
            src += ` ${config.svgDict[item] || item}="${val.replace(/"/g, "")}"`;
          }
        }
        if (!node3.children) {
          src += "/>";
        } else {
          src += ">";
          for (let i = 0; i < node3.children.length; i++) {
            traversal(node3.children[i]);
          }
          src += "</" + name + ">";
        }
      })(node2);
      node2.name = "img";
      node2.attrs = {
        src: "data:image/svg+xml;utf8," + src.replace(/#/g, "%23"),
        style,
        ignore: "T"
      };
      node2.children = void 0;
      this.xml = false;
      config.ignoreTags.style = true;
      return;
    }
    if (attrs.align) {
      if (node2.name === "table") {
        if (attrs.align === "center") {
          styleObj["margin-inline-start"] = styleObj["margin-inline-end"] = "auto";
        } else {
          styleObj.float = attrs.align;
        }
      } else {
        styleObj["text-align"] = attrs.align;
      }
      attrs.align = void 0;
    }
    if (attrs.dir) {
      styleObj.direction = attrs.dir;
      attrs.dir = void 0;
    }
    if (node2.name === "font") {
      if (attrs.color) {
        styleObj.color = attrs.color;
        attrs.color = void 0;
      }
      if (attrs.face) {
        styleObj["font-family"] = attrs.face;
        attrs.face = void 0;
      }
      if (attrs.size) {
        let size = parseInt(attrs.size);
        if (!isNaN(size)) {
          if (size < 1) {
            size = 1;
          } else if (size > 7) {
            size = 7;
          }
          styleObj["font-size"] = ["x-small", "small", "medium", "large", "x-large", "xx-large", "xxx-large"][size - 1];
        }
        attrs.size = void 0;
      }
    }
    if ((attrs.class || "").includes("align-center")) {
      styleObj["text-align"] = "center";
    }
    Object.assign(styleObj, this.parseStyle(node2));
    if (node2.name !== "table" && parseInt(styleObj.width) > windowWidth) {
      styleObj["max-width"] = "100%";
      styleObj["box-sizing"] = "border-box";
    }
    if (config.blockTags[node2.name]) {
      node2.name = "div";
    } else if (!config.trustTags[node2.name] && !this.xml) {
      node2.name = "span";
    }
    if (node2.name === "a" || node2.name === "ad" || node2.name === "iframe") {
      this.expose();
    } else if (node2.name === "video") {
      if ((styleObj.height || "").includes("auto")) {
        styleObj.height = void 0;
      }
      let str = '<video style="width:100%;height:100%"';
      for (const item in attrs) {
        if (attrs[item]) {
          str += " " + item + '="' + attrs[item] + '"';
        }
      }
      if (this.options.pauseVideo) {
        str += ` onplay="this.dispatchEvent(new CustomEvent('vplay',{bubbles:!0}));for(var e=document.getElementsByTagName('video'),t=0;t<e.length;t++)e[t]!=this&&e[t].pause()"`;
      }
      str += ">";
      for (let i = 0; i < node2.src.length; i++) {
        str += '<source src="' + node2.src[i] + '">';
      }
      str += "</video>";
      node2.html = str;
    } else if ((node2.name === "ul" || node2.name === "ol") && node2.c) {
      const types = {
        a: "lower-alpha",
        A: "upper-alpha",
        i: "lower-roman",
        I: "upper-roman"
      };
      if (types[attrs.type]) {
        attrs.style += ";list-style-type:" + types[attrs.type];
        attrs.type = void 0;
      }
      for (let i = children.length; i--; ) {
        if (children[i].name === "li") {
          children[i].c = 1;
        }
      }
    } else if (node2.name === "table") {
      let padding = parseFloat(attrs.cellpadding);
      let spacing = parseFloat(attrs.cellspacing);
      const border = parseFloat(attrs.border);
      const bordercolor = styleObj["border-color"];
      const borderstyle = styleObj["border-style"];
      if (node2.c) {
        if (isNaN(padding)) {
          padding = 2;
        }
        if (isNaN(spacing)) {
          spacing = 2;
        }
      }
      if (border) {
        attrs.style += `;border:${border}px ${borderstyle || "solid"} ${bordercolor || "gray"}`;
      }
      if (node2.flag && node2.c) {
        styleObj.display = "grid";
        if (styleObj["border-collapse"] === "collapse") {
          styleObj["border-collapse"] = void 0;
          spacing = 0;
        }
        if (spacing) {
          styleObj["grid-gap"] = spacing + "px";
          styleObj.padding = spacing + "px";
        } else if (border) {
          attrs.style += ";border-left:0;border-top:0";
        }
        const width = [];
        const trList = [];
        const cells = [];
        const map = {};
        (function traversal(nodes) {
          for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].name === "tr") {
              trList.push(nodes[i]);
            } else if (nodes[i].name === "colgroup") {
              let colI = 1;
              for (const col of nodes[i].children || []) {
                if (col.name === "col") {
                  const style = col.attrs.style || "";
                  const start = style.indexOf("width") ? style.indexOf(";width") : 0;
                  if (start !== -1) {
                    let end = style.indexOf(";", start + 6);
                    if (end === -1) {
                      end = style.length;
                    }
                    width[colI] = style.substring(start ? start + 7 : 6, end);
                  }
                  colI += 1;
                }
              }
            } else {
              traversal(nodes[i].children || []);
            }
          }
        })(children);
        for (let row = 1; row <= trList.length; row++) {
          let col = 1;
          for (let j = 0; j < trList[row - 1].children.length; j++) {
            const td = trList[row - 1].children[j];
            if (td.name === "td" || td.name === "th") {
              while (map[row + "." + col]) {
                col++;
              }
              let style = td.attrs.style || "";
              let start = style.indexOf("width") ? style.indexOf(";width") : 0;
              if (start !== -1) {
                let end = style.indexOf(";", start + 6);
                if (end === -1) {
                  end = style.length;
                }
                if (!td.attrs.colspan) {
                  width[col] = style.substring(start ? start + 7 : 6, end);
                }
                style = style.substr(0, start) + style.substr(end);
              }
              style += ";display:flex";
              start = style.indexOf("vertical-align");
              if (start !== -1) {
                const val = style.substr(start + 15, 10);
                if (val.includes("middle")) {
                  style += ";align-items:center";
                } else if (val.includes("bottom")) {
                  style += ";align-items:flex-end";
                }
              } else {
                style += ";align-items:center";
              }
              start = style.indexOf("text-align");
              if (start !== -1) {
                const val = style.substr(start + 11, 10);
                if (val.includes("center")) {
                  style += ";justify-content: center";
                } else if (val.includes("right")) {
                  style += ";justify-content: right";
                }
              }
              style = (border ? `;border:${border}px ${borderstyle || "solid"} ${bordercolor || "gray"}` + (spacing ? "" : ";border-right:0;border-bottom:0") : "") + (padding ? `;padding:${padding}px` : "") + ";" + style;
              if (td.attrs.colspan) {
                style += `;grid-column-start:${col};grid-column-end:${col + parseInt(td.attrs.colspan)}`;
                if (!td.attrs.rowspan) {
                  style += `;grid-row-start:${row};grid-row-end:${row + 1}`;
                }
                col += parseInt(td.attrs.colspan) - 1;
              }
              if (td.attrs.rowspan) {
                style += `;grid-row-start:${row};grid-row-end:${row + parseInt(td.attrs.rowspan)}`;
                if (!td.attrs.colspan) {
                  style += `;grid-column-start:${col};grid-column-end:${col + 1}`;
                }
                for (let rowspan = 1; rowspan < td.attrs.rowspan; rowspan++) {
                  for (let colspan = 0; colspan < (td.attrs.colspan || 1); colspan++) {
                    map[row + rowspan + "." + (col - colspan)] = 1;
                  }
                }
              }
              if (style) {
                td.attrs.style = style;
              }
              cells.push(td);
              col++;
            }
          }
          if (row === 1) {
            let temp = "";
            for (let i = 1; i < col; i++) {
              temp += (width[i] ? width[i] : "auto") + " ";
            }
            styleObj["grid-template-columns"] = temp;
          }
        }
        node2.children = cells;
      } else {
        if (node2.c) {
          styleObj.display = "table";
        }
        if (!isNaN(spacing)) {
          styleObj["border-spacing"] = spacing + "px";
        }
        if (border || padding) {
          (function traversal(nodes) {
            for (let i = 0; i < nodes.length; i++) {
              const td = nodes[i];
              if (td.name === "th" || td.name === "td") {
                if (border) {
                  td.attrs.style = `border:${border}px ${borderstyle || "solid"} ${bordercolor || "gray"};${td.attrs.style || ""}`;
                }
                if (padding) {
                  td.attrs.style = `padding:${padding}px;${td.attrs.style || ""}`;
                }
              } else if (td.children) {
                traversal(td.children);
              }
            }
          })(children);
        }
      }
      if (this.options.scrollTable && !(attrs.style || "").includes("inline")) {
        const table = Object.assign({}, node2);
        node2.name = "div";
        node2.attrs = {
          style: "overflow:auto"
        };
        node2.children = [table];
        attrs = table.attrs;
      }
    } else if ((node2.name === "tbody" || node2.name === "tr") && node2.flag && node2.c) {
      node2.flag = void 0;
      (function traversal(nodes) {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].name === "td") {
            for (const style of ["color", "background", "background-color"]) {
              if (styleObj[style]) {
                nodes[i].attrs.style = style + ":" + styleObj[style] + ";" + (nodes[i].attrs.style || "");
              }
            }
          } else {
            traversal(nodes[i].children || []);
          }
        }
      })(children);
    } else if ((node2.name === "td" || node2.name === "th") && (attrs.colspan || attrs.rowspan)) {
      for (let i = this.stack.length; i--; ) {
        if (this.stack[i].name === "table" || this.stack[i].name === "tbody" || this.stack[i].name === "tr") {
          this.stack[i].flag = 1;
        }
      }
    } else if (node2.name === "ruby") {
      node2.name = "span";
      for (let i = 0; i < children.length - 1; i++) {
        if (children[i].type === "text" && children[i + 1].name === "rt") {
          children[i] = {
            name: "div",
            attrs: {
              style: "display:inline-block;text-align:center"
            },
            children: [{
              name: "div",
              attrs: {
                style: "font-size:50%;" + (children[i + 1].attrs.style || "")
              },
              children: children[i + 1].children
            }, children[i]]
          };
          children.splice(i + 1, 1);
        }
      }
    } else if (node2.c) {
      (function traversal(node3) {
        node3.c = 2;
        for (let i = node3.children.length; i--; ) {
          const child = node3.children[i];
          if (child.name && (config.inlineTags[child.name] || (child.attrs.style || "").includes("inline") && child.children) && !child.c) {
            traversal(child);
          }
          if (!child.c || child.name === "table") {
            node3.c = 1;
          }
        }
      })(node2);
    }
    if ((styleObj.display || "").includes("flex") && !node2.c) {
      for (let i = children.length; i--; ) {
        const item = children[i];
        if (item.f) {
          item.attrs.style = (item.attrs.style || "") + item.f;
          item.f = void 0;
        }
      }
    }
    const flex = parent && ((parent.attrs.style || "").includes("flex") || (parent.attrs.style || "").includes("grid")) && !node2.c;
    if (flex) {
      node2.f = ";max-width:100%";
    }
    if (children.length >= 50 && node2.c && !(styleObj.display || "").includes("flex")) {
      mergeNodes(children);
    }
    for (const key in styleObj) {
      if (styleObj[key]) {
        const val = `;${key}:${styleObj[key].replace(" !important", "")}`;
        if (flex && (key.includes("flex") && key !== "flex-direction" || key === "align-self" || key.includes("grid") || styleObj[key][0] === "-" || key.includes("width") && val.includes("%"))) {
          node2.f += val;
          if (key === "width") {
            attrs.style += ";width:100%";
          }
        } else {
          attrs.style += val;
        }
      }
    }
    attrs.style = attrs.style.substr(1) || void 0;
  };
  Parser.prototype.onText = function(text) {
    if (!this.pre) {
      let trim = "";
      let flag;
      for (let i = 0, len = text.length; i < len; i++) {
        if (!blankChar[text[i]]) {
          trim += text[i];
        } else {
          if (trim[trim.length - 1] !== " ") {
            trim += " ";
          }
          if (text[i] === "\n" && !flag) {
            flag = true;
          }
        }
      }
      if (trim === " ") {
        if (flag)
          return;
        else {
          const parent = this.stack[this.stack.length - 1];
          if (parent && parent.name[0] === "t")
            return;
        }
      }
      text = trim;
    }
    const node2 = /* @__PURE__ */ Object.create(null);
    node2.type = "text";
    node2.text = decodeEntity(text);
    if (this.hook(node2)) {
      const siblings = this.stack.length ? this.stack[this.stack.length - 1].children : this.nodes;
      siblings.push(node2);
    }
  };
  function Lexer(handler) {
    this.handler = handler;
  }
  Lexer.prototype.parse = function(content) {
    this.content = content || "";
    this.i = 0;
    this.start = 0;
    this.state = this.text;
    for (let len = this.content.length; this.i !== -1 && this.i < len; ) {
      this.state();
    }
  };
  Lexer.prototype.checkClose = function(method) {
    const selfClose = this.content[this.i] === "/";
    if (this.content[this.i] === ">" || selfClose && this.content[this.i + 1] === ">") {
      if (method) {
        this.handler[method](this.content.substring(this.start, this.i));
      }
      this.i += selfClose ? 2 : 1;
      this.start = this.i;
      this.handler.onOpenTag(selfClose);
      if (this.handler.tagName === "script") {
        this.i = this.content.indexOf("</", this.i);
        if (this.i !== -1) {
          this.i += 2;
          this.start = this.i;
        }
        this.state = this.endTag;
      } else {
        this.state = this.text;
      }
      return true;
    }
    return false;
  };
  Lexer.prototype.text = function() {
    this.i = this.content.indexOf("<", this.i);
    if (this.i === -1) {
      if (this.start < this.content.length) {
        this.handler.onText(this.content.substring(this.start, this.content.length));
      }
      return;
    }
    const c = this.content[this.i + 1];
    if (c >= "a" && c <= "z" || c >= "A" && c <= "Z") {
      if (this.start !== this.i) {
        this.handler.onText(this.content.substring(this.start, this.i));
      }
      this.start = ++this.i;
      this.state = this.tagName;
    } else if (c === "/" || c === "!" || c === "?") {
      if (this.start !== this.i) {
        this.handler.onText(this.content.substring(this.start, this.i));
      }
      const next = this.content[this.i + 2];
      if (c === "/" && (next >= "a" && next <= "z" || next >= "A" && next <= "Z")) {
        this.i += 2;
        this.start = this.i;
        this.state = this.endTag;
        return;
      }
      let end = "-->";
      if (c !== "!" || this.content[this.i + 2] !== "-" || this.content[this.i + 3] !== "-") {
        end = ">";
      }
      this.i = this.content.indexOf(end, this.i);
      if (this.i !== -1) {
        this.i += end.length;
        this.start = this.i;
      }
    } else {
      this.i++;
    }
  };
  Lexer.prototype.tagName = function() {
    if (blankChar[this.content[this.i]]) {
      this.handler.onTagName(this.content.substring(this.start, this.i));
      while (blankChar[this.content[++this.i]])
        ;
      if (this.i < this.content.length && !this.checkClose()) {
        this.start = this.i;
        this.state = this.attrName;
      }
    } else if (!this.checkClose("onTagName")) {
      this.i++;
    }
  };
  Lexer.prototype.attrName = function() {
    let c = this.content[this.i];
    if (blankChar[c] || c === "=") {
      this.handler.onAttrName(this.content.substring(this.start, this.i));
      let needVal = c === "=";
      const len = this.content.length;
      while (++this.i < len) {
        c = this.content[this.i];
        if (!blankChar[c]) {
          if (this.checkClose())
            return;
          if (needVal) {
            this.start = this.i;
            this.state = this.attrVal;
            return;
          }
          if (this.content[this.i] === "=") {
            needVal = true;
          } else {
            this.start = this.i;
            this.state = this.attrName;
            return;
          }
        }
      }
    } else if (!this.checkClose("onAttrName")) {
      this.i++;
    }
  };
  Lexer.prototype.attrVal = function() {
    const c = this.content[this.i];
    const len = this.content.length;
    if (c === '"' || c === "'") {
      this.start = ++this.i;
      this.i = this.content.indexOf(c, this.i);
      if (this.i === -1)
        return;
      this.handler.onAttrVal(this.content.substring(this.start, this.i));
    } else {
      for (; this.i < len; this.i++) {
        if (blankChar[this.content[this.i]]) {
          this.handler.onAttrVal(this.content.substring(this.start, this.i));
          break;
        } else if (this.checkClose("onAttrVal"))
          return;
      }
    }
    while (blankChar[this.content[++this.i]])
      ;
    if (this.i < len && !this.checkClose()) {
      this.start = this.i;
      this.state = this.attrName;
    }
  };
  Lexer.prototype.endTag = function() {
    const c = this.content[this.i];
    if (blankChar[c] || c === ">" || c === "/") {
      this.handler.onCloseTag(this.content.substring(this.start, this.i));
      if (c !== ">") {
        this.i = this.content.indexOf(">", this.i);
        if (this.i === -1)
          return;
      }
      this.start = ++this.i;
      this.state = this.text;
    } else {
      this.i++;
    }
  };
  const plugins = [];
  const _sfc_main$2 = {
    name: "mp-html",
    data() {
      return {
        nodes: []
      };
    },
    props: {
      containerStyle: {
        type: String,
        default: ""
      },
      content: {
        type: String,
        default: ""
      },
      copyLink: {
        type: [Boolean, String],
        default: true
      },
      domain: String,
      errorImg: {
        type: String,
        default: ""
      },
      lazyLoad: {
        type: [Boolean, String],
        default: false
      },
      loadingImg: {
        type: String,
        default: ""
      },
      pauseVideo: {
        type: [Boolean, String],
        default: true
      },
      previewImg: {
        type: [Boolean, String],
        default: true
      },
      scrollTable: [Boolean, String],
      selectable: [Boolean, String],
      setTitle: {
        type: [Boolean, String],
        default: true
      },
      showImgMenu: {
        type: [Boolean, String],
        default: true
      },
      tagStyle: Object,
      useAnchor: [Boolean, Number]
    },
    emits: ["load", "ready", "imgtap", "linktap", "play", "error"],
    components: {
      node
    },
    watch: {
      content(content) {
        this.setContent(content);
      }
    },
    created() {
      this.plugins = [];
      for (let i = plugins.length; i--; ) {
        this.plugins.push(new plugins[i](this));
      }
    },
    mounted() {
      if (this.content && !this.nodes.length) {
        this.setContent(this.content);
      }
    },
    beforeDestroy() {
      this._hook("onDetached");
    },
    methods: {
      /**
       * @description 将锚点跳转的范围限定在一个 scroll-view 内
       * @param {Object} page scroll-view 所在页面的示例
       * @param {String} selector scroll-view 的选择器
       * @param {String} scrollTop scroll-view scroll-top 属性绑定的变量名
       */
      in(page, selector, scrollTop) {
        if (page && selector && scrollTop) {
          this._in = {
            page,
            selector,
            scrollTop
          };
        }
      },
      /**
       * @description 锚点跳转
       * @param {String} id 要跳转的锚点 id
       * @param {Number} offset 跳转位置的偏移量
       * @returns {Promise}
       */
      navigateTo(id, offset) {
        return new Promise((resolve, reject) => {
          if (!this.useAnchor) {
            reject(Error("Anchor is disabled"));
            return;
          }
          offset = offset || parseInt(this.useAnchor) || 0;
          let deep = " ";
          const selector = uni.createSelectorQuery().in(this._in ? this._in.page : this).select((this._in ? this._in.selector : "._root") + (id ? `${deep}#${id}` : "")).boundingClientRect();
          if (this._in) {
            selector.select(this._in.selector).scrollOffset().select(this._in.selector).boundingClientRect();
          } else {
            selector.selectViewport().scrollOffset();
          }
          selector.exec((res) => {
            if (!res[0]) {
              reject(Error("Label not found"));
              return;
            }
            const scrollTop = res[1].scrollTop + res[0].top - (res[2] ? res[2].top : 0) + offset;
            if (this._in) {
              this._in.page[this._in.scrollTop] = scrollTop;
            } else {
              uni.pageScrollTo({
                scrollTop,
                duration: 300
              });
            }
            resolve();
          });
        });
      },
      /**
       * @description 获取文本内容
       * @return {String}
       */
      getText(nodes) {
        let text = "";
        (function traversal(nodes2) {
          for (let i = 0; i < nodes2.length; i++) {
            const node2 = nodes2[i];
            if (node2.type === "text") {
              text += node2.text.replace(/&amp;/g, "&");
            } else if (node2.name === "br") {
              text += "\n";
            } else {
              const isBlock = node2.name === "p" || node2.name === "div" || node2.name === "tr" || node2.name === "li" || node2.name[0] === "h" && node2.name[1] > "0" && node2.name[1] < "7";
              if (isBlock && text && text[text.length - 1] !== "\n") {
                text += "\n";
              }
              if (node2.children) {
                traversal(node2.children);
              }
              if (isBlock && text[text.length - 1] !== "\n") {
                text += "\n";
              } else if (node2.name === "td" || node2.name === "th") {
                text += "	";
              }
            }
          }
        })(nodes || this.nodes);
        return text;
      },
      /**
       * @description 获取内容大小和位置
       * @return {Promise}
       */
      getRect() {
        return new Promise((resolve, reject) => {
          uni.createSelectorQuery().in(this).select("#_root").boundingClientRect().exec((res) => res[0] ? resolve(res[0]) : reject(Error("Root label not found")));
        });
      },
      /**
       * @description 暂停播放媒体
       */
      pauseMedia() {
        for (let i = (this._videos || []).length; i--; ) {
          this._videos[i].pause();
        }
        const command = 'for(var e=document.getElementsByTagName("video"),i=e.length;i--;)e[i].pause()';
        let page = this.$parent;
        while (!page.$scope)
          page = page.$parent;
        page.$scope.$getAppWebview().evalJS(command);
      },
      /**
       * @description 设置媒体播放速率
       * @param {Number} rate 播放速率
       */
      setPlaybackRate(rate) {
        this.playbackRate = rate;
        for (let i = (this._videos || []).length; i--; ) {
          this._videos[i].playbackRate(rate);
        }
        const command = 'for(var e=document.getElementsByTagName("video"),i=e.length;i--;)e[i].playbackRate=' + rate;
        let page = this.$parent;
        while (!page.$scope)
          page = page.$parent;
        page.$scope.$getAppWebview().evalJS(command);
      },
      /**
       * @description 设置内容
       * @param {String} content html 内容
       * @param {Boolean} append 是否在尾部追加
       */
      setContent(content, append) {
        if (!append || !this.imgList) {
          this.imgList = [];
        }
        const nodes = new Parser(this).parse(content);
        this.$set(this, "nodes", append ? (this.nodes || []).concat(nodes) : nodes);
        this._videos = [];
        this.$nextTick(() => {
          this._hook("onLoad");
          this.$emit("load");
        });
        if (this.lazyLoad || this.imgList._unloadimgs < this.imgList.length / 2) {
          let height = 0;
          const callback = (rect) => {
            if (!rect || !rect.height)
              rect = {};
            if (rect.height === height) {
              this.$emit("ready", rect);
            } else {
              height = rect.height;
              setTimeout(() => {
                this.getRect().then(callback).catch(callback);
              }, 350);
            }
          };
          this.getRect().then(callback).catch(callback);
        } else {
          if (!this.imgList._unloadimgs) {
            this.getRect().then((rect) => {
              this.$emit("ready", rect);
            }).catch(() => {
              this.$emit("ready", {});
            });
          }
        }
      },
      /**
       * @description 调用插件钩子函数
       */
      _hook(name) {
        for (let i = plugins.length; i--; ) {
          if (this.plugins[i][name]) {
            this.plugins[i][name]();
          }
        }
      }
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_node = vue.resolveComponent("node");
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        id: "_root",
        class: vue.normalizeClass(($props.selectable ? "_select " : "") + "_root"),
        style: vue.normalizeStyle($props.containerStyle)
      },
      [
        !$data.nodes[0] ? vue.renderSlot(_ctx.$slots, "default", { key: 0 }, void 0, true) : (vue.openBlock(), vue.createBlock(_component_node, {
          key: 1,
          childs: $data.nodes,
          opts: [$props.lazyLoad, $props.loadingImg, $props.errorImg, $props.showImgMenu, $props.selectable],
          name: "span"
        }, null, 8, ["childs", "opts"]))
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const __easycom_0 = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__scopeId", "data-v-a290f043"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/uni_modules/mp-html/components/mp-html/mp-html.vue"]]);
  const _sfc_main$1 = {
    __name: "article_detail",
    setup(__props, { expose: __expose }) {
      __expose();
      const article = vue.ref({
        title: "",
        content: "",
        banner: "",
        created_at: 0
      });
      const currentPage = vue.ref(1);
      const loading = vue.ref(false);
      const noMore = vue.ref(false);
      const replyComment = vue.ref(null);
      const commentListRef = vue.ref(null);
      const commentInputRef = vue.ref(null);
      const replyForItem = vue.ref({});
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
          const { data } = await uni.request({
            url: `${websiteUrl}/with-state/add-comment`,
            method: "POST",
            header: { Authorization: uni.getStorageSync("token") },
            data: requestData
          });
          if (data.status === "success") {
            if (data.data.parent_id === 0) {
              (_a = commentListRef.value) == null ? void 0 : _a.addNewComment(data.data);
            } else {
              (_b = commentListRef.value) == null ? void 0 : _b.addReplyComment(data.data);
            }
            uni.showToast({ title: "评论成功" });
          }
        } catch (error) {
          uni.showToast({ title: "评论失败", icon: "none" });
        }
      };
      const handleReplyComment = ({ parent, target }) => {
        var _a;
        const item = target || parent;
        replyForItem.value = item;
        (_a = commentInputRef.value) == null ? void 0 : _a.focusInput();
      };
      onLoad(async (options) => {
        if (!options.id)
          return uni.navigateBack();
        asyncGetUserInfo();
        await fetchArticle(options.id);
      });
      const fetchArticle = async (id) => {
        try {
          const { data } = await uni.request({
            url: `${websiteUrl}/article-detail?id=${id}`
          });
          if (data.status === "success") {
            article.value = data.data;
            uni.setNavigationBarTitle({ title: data.data.title });
          }
        } catch (error) {
          uni.showToast({ title: "加载失败", icon: "none" });
        }
      };
      const checkLogin = async (showToast = false) => {
        if (global.isLogin)
          return true;
        if (showToast) {
          uni.showToast({ title: "请先登录", icon: "none" });
        }
        return false;
      };
      const formatTime = (timestamp) => {
        const date = new Date(timestamp * 1e3);
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      };
      const __returned__ = { article, currentPage, loading, noMore, replyComment, commentListRef, commentInputRef, replyForItem, handleCommentSubmit, handleReplyComment, fetchArticle, checkLogin, formatTime, ref: vue.ref, onMounted: vue.onMounted, get onLoad() {
        return onLoad;
      }, get websiteUrl() {
        return websiteUrl;
      }, get global() {
        return global;
      }, get asyncGetUserInfo() {
        return asyncGetUserInfo;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_mp_html = resolveEasycom(vue.resolveDynamicComponent("mp-html"), __easycom_0);
    const _component_comment_list = resolveEasycom(vue.resolveDynamicComponent("comment-list"), __easycom_1$2);
    const _component_comment_input = resolveEasycom(vue.resolveDynamicComponent("comment-input"), __easycom_2);
    return vue.openBlock(), vue.createElementBlock("view", { class: "article-container" }, [
      vue.createCommentVNode(" 文章封面 "),
      $setup.article.banner ? (vue.openBlock(), vue.createElementBlock("image", {
        key: 0,
        src: $setup.article.banner,
        mode: "widthFix",
        class: "banner"
      }, null, 8, ["src"])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 文章主体 "),
      vue.createElementVNode("view", { class: "content-wrapper" }, [
        vue.createElementVNode(
          "text",
          { class: "title" },
          vue.toDisplayString($setup.article.title),
          1
          /* TEXT */
        ),
        vue.createCommentVNode(" HTML内容渲染 "),
        vue.createVNode(_component_mp_html, {
          content: $setup.article.content,
          class: "content-html"
        }, null, 8, ["content"]),
        vue.createCommentVNode(" 评论区组件 "),
        $setup.article.id > 0 ? (vue.openBlock(), vue.createElementBlock("view", { key: 0 }, [
          vue.createElementVNode("view", null, [
            vue.createVNode(_component_comment_list, {
              ref: "commentListRef",
              type: 7,
              "relation-id": parseInt($setup.article.id),
              onReply: $setup.handleReplyComment
            }, null, 8, ["relation-id"])
          ]),
          vue.createCommentVNode(" 评论输入框组件 "),
          vue.createVNode(_component_comment_input, {
            ref: "commentInputRef",
            "reply-info": $setup.replyForItem,
            "target-id": $setup.article.id.toString(),
            onSubmit: $setup.handleCommentSubmit,
            "onUpdate:replyInfo": _cache[0] || (_cache[0] = (val) => $setup.replyForItem = val)
          }, null, 8, ["reply-info", "target-id"])
        ])) : vue.createCommentVNode("v-if", true)
      ])
    ]);
  }
  const PagesArticleDetailArticleDetail = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__scopeId", "data-v-55f34774"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/article_detail/article_detail.vue"]]);
  __definePage("pages/index/index", PagesIndexIndex);
  __definePage("pages/homepage/homepage", PagesHomepageHomepage);
  __definePage("pages/stock/stock", PagesStockStock);
  __definePage("pages/mine/mine", PagesMineMine);
  __definePage("pages/watch_demo/watch_demo", PagesWatchDemoWatchDemo);
  __definePage("pages/goods/goods", PagesGoodsGoods);
  __definePage("pages/brand/brand", PagesBrandBrand);
  __definePage("pages/calendar/calendar", PagesCalendarCalendar);
  __definePage("pages/pop_croper/pop_croper", PagesPopCroperPopCroper);
  __definePage("pages/setting/setting", PagesSettingSetting);
  __definePage("pages/setting/password/password", PagesSettingPasswordPassword);
  __definePage("pages/setting/tel_phone/tel_phone", PagesSettingTelPhoneTelPhone);
  __definePage("pages/stock/account_book_form/account_book_form", PagesStockAccountBookFormAccountBookForm);
  __definePage("pages/stock/showcase_form/showcase_form", PagesStockShowcaseFormShowcaseForm);
  __definePage("pages/stock/bill_form/bill_form", PagesStockBillFormBillForm);
  __definePage("pages/collocation/collocation", PagesCollocationCollocation);
  __definePage("pages/collocation_share/collocation_share", PagesCollocationShareCollocationShare);
  __definePage("pages/user_page/user_page", PagesUserPageUserPage);
  __definePage("pages/message_list/message_list", PagesMessageListMessageList);
  __definePage("pages/message_info/message_info", PagesMessageInfoMessageInfo);
  __definePage("pages/register/register", PagesRegisterRegister);
  __definePage("pages/user_like/user_like", PagesUserLikeUserLike);
  __definePage("pages/collocation_square/collocation_square", PagesCollocationSquareCollocationSquare);
  __definePage("pages/sale_news/sale_news", PagesSaleNewsSaleNews);
  __definePage("pages/treehole_publish/treehole_publish", PagesTreeholePublishTreeholePublish);
  __definePage("pages/treehole_detail/treehole_detail", PagesTreeholeDetailTreeholeDetail);
  __definePage("pages/reset_password/reset_password", PagesResetPasswordResetPassword);
  __definePage("pages/setting/username/username", PagesSettingUsernameUsername);
  __definePage("pages/my_comment/my_comment", PagesMyCommentMyComment);
  __definePage("pages/my_collocation/my_collocation", PagesMyCollocationMyCollocation);
  __definePage("pages/article_detail/article_detail", PagesArticleDetailArticleDetail);
  const _sfc_main = {
    __name: "App",
    setup(__props, { expose: __expose }) {
      __expose();
      const __returned__ = { ref: vue.ref, computed: vue.computed };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
