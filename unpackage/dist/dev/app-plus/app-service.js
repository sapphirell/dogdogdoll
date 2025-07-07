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
  const global2 = uni.requireGlobal();
  ArrayBuffer = global2.ArrayBuffer;
  Int8Array = global2.Int8Array;
  Uint8Array = global2.Uint8Array;
  Uint8ClampedArray = global2.Uint8ClampedArray;
  Int16Array = global2.Int16Array;
  Uint16Array = global2.Uint16Array;
  Int32Array = global2.Int32Array;
  Uint32Array = global2.Uint32Array;
  Float32Array = global2.Float32Array;
  Float64Array = global2.Float64Array;
  BigInt64Array = global2.BigInt64Array;
  BigUint64Array = global2.BigUint64Array;
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
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const getVal = (val) => {
    const reg = /^[0-9]*$/g;
    return typeof val === "number" || reg.test(val) ? val + "px" : val;
  };
  const _sfc_main$10 = {
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
        let code = this.icons.find((v2) => v2.font_class === this.type);
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
  function _sfc_render$$(_ctx, _cache, $props, $setup, $data, $options) {
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
  const __easycom_0$b = /* @__PURE__ */ _export_sfc(_sfc_main$10, [["render", _sfc_render$$], ["__scopeId", "data-v-d31e1c47"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/uni_modules/uni-icons/components/uni-icons/uni-icons.vue"]]);
  class MPAnimation {
    constructor(options, _this) {
      this.options = options;
      this.animation = uni.createAnimation({
        ...options
      });
      this.currentStepAnimates = {};
      this.next = 0;
      this.$ = _this;
    }
    _nvuePushAnimates(type, args) {
      let aniObj = this.currentStepAnimates[this.next];
      let styles = {};
      if (!aniObj) {
        styles = {
          styles: {},
          config: {}
        };
      } else {
        styles = aniObj;
      }
      if (animateTypes1.includes(type)) {
        if (!styles.styles.transform) {
          styles.styles.transform = "";
        }
        let unit = "";
        if (type === "rotate") {
          unit = "deg";
        }
        styles.styles.transform += `${type}(${args + unit}) `;
      } else {
        styles.styles[type] = `${args}`;
      }
      this.currentStepAnimates[this.next] = styles;
    }
    _animateRun(styles = {}, config2 = {}) {
      let ref = this.$.$refs["ani"].ref;
      if (!ref)
        return;
      return new Promise((resolve, reject) => {
        nvueAnimation.transition(ref, {
          styles,
          ...config2
        }, (res) => {
          resolve();
        });
      });
    }
    _nvueNextAnimate(animates, step = 0, fn) {
      let obj = animates[step];
      if (obj) {
        let {
          styles,
          config: config2
        } = obj;
        this._animateRun(styles, config2).then(() => {
          step += 1;
          this._nvueNextAnimate(animates, step, fn);
        });
      } else {
        this.currentStepAnimates = {};
        typeof fn === "function" && fn();
        this.isEnd = true;
      }
    }
    step(config2 = {}) {
      this.animation.step(config2);
      return this;
    }
    run(fn) {
      this.$.animationData = this.animation.export();
      this.$.timer = setTimeout(() => {
        typeof fn === "function" && fn();
      }, this.$.durationTime);
    }
  }
  const animateTypes1 = [
    "matrix",
    "matrix3d",
    "rotate",
    "rotate3d",
    "rotateX",
    "rotateY",
    "rotateZ",
    "scale",
    "scale3d",
    "scaleX",
    "scaleY",
    "scaleZ",
    "skew",
    "skewX",
    "skewY",
    "translate",
    "translate3d",
    "translateX",
    "translateY",
    "translateZ"
  ];
  const animateTypes2 = ["opacity", "backgroundColor"];
  const animateTypes3 = ["width", "height", "left", "right", "top", "bottom"];
  animateTypes1.concat(animateTypes2, animateTypes3).forEach((type) => {
    MPAnimation.prototype[type] = function(...args) {
      this.animation[type](...args);
      return this;
    };
  });
  function createAnimation(option, _this) {
    if (!_this)
      return;
    clearTimeout(_this.timer);
    return new MPAnimation(option, _this);
  }
  const _sfc_main$$ = {
    name: "uniTransition",
    emits: ["click", "change"],
    props: {
      show: {
        type: Boolean,
        default: false
      },
      modeClass: {
        type: [Array, String],
        default() {
          return "fade";
        }
      },
      duration: {
        type: Number,
        default: 300
      },
      styles: {
        type: Object,
        default() {
          return {};
        }
      },
      customClass: {
        type: String,
        default: ""
      },
      onceRender: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        isShow: false,
        transform: "",
        opacity: 1,
        animationData: {},
        durationTime: 300,
        config: {}
      };
    },
    watch: {
      show: {
        handler(newVal) {
          if (newVal) {
            this.open();
          } else {
            if (this.isShow) {
              this.close();
            }
          }
        },
        immediate: true
      }
    },
    computed: {
      // 生成样式数据
      stylesObject() {
        let styles = {
          ...this.styles,
          "transition-duration": this.duration / 1e3 + "s"
        };
        let transform = "";
        for (let i2 in styles) {
          let line = this.toLine(i2);
          transform += line + ":" + styles[i2] + ";";
        }
        return transform;
      },
      // 初始化动画条件
      transformStyles() {
        return "transform:" + this.transform + ";opacity:" + this.opacity + ";" + this.stylesObject;
      }
    },
    created() {
      this.config = {
        duration: this.duration,
        timingFunction: "ease",
        transformOrigin: "50% 50%",
        delay: 0
      };
      this.durationTime = this.duration;
    },
    methods: {
      /**
       *  ref 触发 初始化动画
       */
      init(obj = {}) {
        if (obj.duration) {
          this.durationTime = obj.duration;
        }
        this.animation = createAnimation(Object.assign(this.config, obj), this);
      },
      /**
       * 点击组件触发回调
       */
      onClick() {
        this.$emit("click", {
          detail: this.isShow
        });
      },
      /**
       * ref 触发 动画分组
       * @param {Object} obj
       */
      step(obj, config2 = {}) {
        if (!this.animation)
          return;
        for (let i2 in obj) {
          try {
            if (typeof obj[i2] === "object") {
              this.animation[i2](...obj[i2]);
            } else {
              this.animation[i2](obj[i2]);
            }
          } catch (e2) {
            formatAppLog("error", "at uni_modules/uni-transition/components/uni-transition/uni-transition.vue:148", `方法 ${i2} 不存在`);
          }
        }
        this.animation.step(config2);
        return this;
      },
      /**
       *  ref 触发 执行动画
       */
      run(fn) {
        if (!this.animation)
          return;
        this.animation.run(fn);
      },
      // 开始过度动画
      open() {
        clearTimeout(this.timer);
        this.transform = "";
        this.isShow = true;
        let { opacity, transform } = this.styleInit(false);
        if (typeof opacity !== "undefined") {
          this.opacity = opacity;
        }
        this.transform = transform;
        this.$nextTick(() => {
          this.timer = setTimeout(() => {
            this.animation = createAnimation(this.config, this);
            this.tranfromInit(false).step();
            this.animation.run(() => {
              this.transform = "";
              this.opacity = opacity || 1;
            });
            this.$emit("change", {
              detail: this.isShow
            });
          }, 20);
        });
      },
      // 关闭过度动画
      close(type) {
        if (!this.animation)
          return;
        this.tranfromInit(true).step().run(() => {
          this.isShow = false;
          this.animationData = null;
          this.animation = null;
          let { opacity, transform } = this.styleInit(false);
          this.opacity = opacity || 1;
          this.transform = transform;
          this.$emit("change", {
            detail: this.isShow
          });
        });
      },
      // 处理动画开始前的默认样式
      styleInit(type) {
        let styles = {
          transform: ""
        };
        let buildStyle = (type2, mode) => {
          if (mode === "fade") {
            styles.opacity = this.animationType(type2)[mode];
          } else {
            styles.transform += this.animationType(type2)[mode] + " ";
          }
        };
        if (typeof this.modeClass === "string") {
          buildStyle(type, this.modeClass);
        } else {
          this.modeClass.forEach((mode) => {
            buildStyle(type, mode);
          });
        }
        return styles;
      },
      // 处理内置组合动画
      tranfromInit(type) {
        let buildTranfrom = (type2, mode) => {
          let aniNum = null;
          if (mode === "fade") {
            aniNum = type2 ? 0 : 1;
          } else {
            aniNum = type2 ? "-100%" : "0";
            if (mode === "zoom-in") {
              aniNum = type2 ? 0.8 : 1;
            }
            if (mode === "zoom-out") {
              aniNum = type2 ? 1.2 : 1;
            }
            if (mode === "slide-right") {
              aniNum = type2 ? "100%" : "0";
            }
            if (mode === "slide-bottom") {
              aniNum = type2 ? "100%" : "0";
            }
          }
          this.animation[this.animationMode()[mode]](aniNum);
        };
        if (typeof this.modeClass === "string") {
          buildTranfrom(type, this.modeClass);
        } else {
          this.modeClass.forEach((mode) => {
            buildTranfrom(type, mode);
          });
        }
        return this.animation;
      },
      animationType(type) {
        return {
          fade: type ? 0 : 1,
          "slide-top": `translateY(${type ? "0" : "-100%"})`,
          "slide-right": `translateX(${type ? "0" : "100%"})`,
          "slide-bottom": `translateY(${type ? "0" : "100%"})`,
          "slide-left": `translateX(${type ? "0" : "-100%"})`,
          "zoom-in": `scaleX(${type ? 1 : 0.8}) scaleY(${type ? 1 : 0.8})`,
          "zoom-out": `scaleX(${type ? 1 : 1.2}) scaleY(${type ? 1 : 1.2})`
        };
      },
      // 内置动画类型与实际动画对应字典
      animationMode() {
        return {
          fade: "opacity",
          "slide-top": "translateY",
          "slide-right": "translateX",
          "slide-bottom": "translateY",
          "slide-left": "translateX",
          "zoom-in": "scale",
          "zoom-out": "scale"
        };
      },
      // 驼峰转中横线
      toLine(name) {
        return name.replace(/([A-Z])/g, "-$1").toLowerCase();
      }
    }
  };
  function _sfc_render$_(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.withDirectives((vue.openBlock(), vue.createElementBlock("view", {
      ref: "ani",
      animation: $data.animationData,
      class: vue.normalizeClass($props.customClass),
      style: vue.normalizeStyle($options.transformStyles),
      onClick: _cache[0] || (_cache[0] = (...args) => $options.onClick && $options.onClick(...args))
    }, [
      vue.renderSlot(_ctx.$slots, "default")
    ], 14, ["animation"])), [
      [vue.vShow, $data.isShow]
    ]);
  }
  const __easycom_2$2 = /* @__PURE__ */ _export_sfc(_sfc_main$$, [["render", _sfc_render$_], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/uni_modules/uni-transition/components/uni-transition/uni-transition.vue"]]);
  const _sfc_main$_ = {
    __name: "common-modal",
    props: {
      visible: Boolean,
      // 新增参数
      top: {
        type: [String, Number],
        default: "30%"
      },
      width: {
        type: [String, Number],
        default: "80%"
      },
      height: {
        type: [String, Number],
        default: "auto"
      },
      closeable: {
        // 点击遮罩层是否可以关闭
        type: Boolean,
        default: true
      }
    },
    emits: ["update:visible"],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const props = __props;
      let modeClass = vue.ref(["fade", "zoom-in"]);
      const emit = __emit;
      const containerStyle = vue.computed(() => ({
        top: formatValue(props.top),
        // width: formatValue(props.width),
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
        if (props.closeable) {
          emit("update:visible", false);
        }
      };
      const __returned__ = { props, get modeClass() {
        return modeClass;
      }, set modeClass(v2) {
        modeClass = v2;
      }, emit, containerStyle, formatValue, closeModal, computed: vue.computed, ref: vue.ref };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$Z(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_transition = resolveEasycom(vue.resolveDynamicComponent("uni-transition"), __easycom_2$2);
    return $props.visible ? (vue.openBlock(), vue.createElementBlock("view", {
      key: 0,
      class: "modal-mask",
      onClick: $setup.closeModal
    }, [
      vue.createVNode(_component_uni_transition, {
        "mode-class": $setup.modeClass,
        show: $props.visible
      }, {
        default: vue.withCtx(() => [
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
        ]),
        _: 3
        /* FORWARDED */
      }, 8, ["mode-class", "show"])
    ])) : vue.createCommentVNode("v-if", true);
  }
  const __easycom_3$2 = /* @__PURE__ */ _export_sfc(_sfc_main$_, [["render", _sfc_render$Z], ["__scopeId", "data-v-d7656854"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/components/common-modal/common-modal.vue"]]);
  const websiteUrl = "https://api.fantuanpu.com";
  const image1Url = "https://images1.fantuanpu.com/";
  let global$1 = vue.reactive({
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
  function bindWechat() {
    {
      uni.showToast({
        title: "请在微信小程序中绑定",
        icon: "none"
      });
      return Promise.reject("请在微信小程序中绑定");
    }
  }
  function getUserInfo() {
    const token = uni.getStorageSync("token");
    formatAppLog("log", "at common/config.js:165", "token:", token);
    if (!token) {
      formatAppLog("log", "at common/config.js:167", "没有token，无法获取用户信息");
      clearUserInfo();
      return;
    }
    formatAppLog("log", "at common/config.js:171", "请求接口");
    uni.request({
      url: `${websiteUrl}/with-state/mine`,
      method: "GET",
      header: {
        Authorization: token
      },
      success: (res) => {
        const data = res.data.data;
        if (data) {
          formatAppLog("log", "at common/config.js:181", "获取用户信息成功,进行存储", data);
          saveUserInfo(data);
        } else {
          formatAppLog("log", "at common/config.js:184", "无法获取，清理用户状态");
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
            formatAppLog("log", "at common/config.js:215", "返回：", data);
            saveUserInfo(data);
            resolve(data);
          } else {
            clearUserInfo();
            resolve(null);
          }
          return data;
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
        formatAppLog("log", "at common/config.js:255", res.data);
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
        formatAppLog("log", "at common/config.js:273", err);
        uni.showToast({
          title: "网络请求失败",
          icon: "none"
        });
      }
    });
    return 0;
  }
  function getScene() {
    const platform2 = "app";
    formatAppLog("log", "at common/config.js:287", "platform:", platform2);
    {
      const systemInfo2 = uni.getSystemInfoSync();
      if (systemInfo2.osName === "ios") {
        return 2;
      }
      if (systemInfo2.osName === "android") {
        return 3;
      }
    }
    return 1;
  }
  function saveUserInfo(data) {
    uni.setStorageSync("userInfo", data);
    uni.setStorageSync("token", data.last_token);
    global$1.userInfo = data;
    global$1.isLogin = true;
  }
  function clearUserInfo() {
    uni.removeStorageSync("userInfo");
    global$1.userInfo = {};
    global$1.isLogin = false;
  }
  function handleRequestError(error, message = "请求失败") {
    formatAppLog("error", "at common/config.js:333", error);
    uni.showToast({
      title: message,
      icon: "none"
    });
  }
  const _imports_4$1 = "/static/new-icon/write.png";
  const storageKey = "privacyAgreementStatus";
  const _sfc_main$Z = {
    __name: "privacy-permission-modal",
    setup(__props, { expose: __expose }) {
      __expose();
      const showModal = vue.ref(false);
      const hasAgreed = () => {
        let storageContent = uni.getStorageSync(storageKey);
        formatAppLog("log", "at components/privacy-permission-modal/privacy-permission-modal.vue:53", storageContent);
        return storageContent === "agreed";
      };
      const checkAndShow = () => {
        if (hasAgreed()) {
          formatAppLog("log", "at components/privacy-permission-modal/privacy-permission-modal.vue:60", "用户已经同意过隐私政策");
          return;
        }
        const scene = getScene();
        if (scene !== 2 && scene !== 3) {
          formatAppLog("log", "at components/privacy-permission-modal/privacy-permission-modal.vue:65", "并非安卓或iOS客户端：", scene);
          return;
        }
        setTimeout(() => {
          showModal.value = true;
        }, 1e3);
      };
      const goToPrivacy = () => {
        uni.navigateTo({
          url: "/pages/private/private"
        });
      };
      const goToPermissions = () => {
        uni.navigateTo({
          url: "/pages/permission/permission"
        });
      };
      const handleAgree = () => {
        uni.setStorageSync(storageKey, "agreed");
        showModal.value = false;
      };
      const handleDisagree = () => {
        uni.exitApp();
      };
      vue.onMounted(() => {
        checkAndShow();
      });
      const __returned__ = { showModal, storageKey, hasAgreed, checkAndShow, goToPrivacy, goToPermissions, handleAgree, handleDisagree, ref: vue.ref, onMounted: vue.onMounted, get websiteUrl() {
        return websiteUrl;
      }, get wechatSignLogin() {
        return wechatSignLogin;
      }, get getUserInfo() {
        return getUserInfo;
      }, get global() {
        return global$1;
      }, get getScene() {
        return getScene;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$Y(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$b);
    const _component_common_modal = resolveEasycom(vue.resolveDynamicComponent("common-modal"), __easycom_3$2);
    return vue.openBlock(), vue.createBlock(_component_common_modal, {
      visible: $setup.showModal,
      "onUpdate:visible": _cache[0] || (_cache[0] = ($event) => $setup.showModal = $event),
      top: "20vh",
      height: "auto",
      closeable: false
    }, {
      default: vue.withCtx(() => [
        vue.createElementVNode("view", { class: "privacy-container" }, [
          vue.createElementVNode("view", { class: "header" }, [
            vue.createElementVNode("image", {
              src: _imports_4$1,
              class: "logo"
            }),
            vue.createElementVNode("text", { class: "title" }, "隐私与权限说明")
          ]),
          vue.createElementVNode("view", { class: "content" }, [
            vue.createElementVNode("text", { class: "desc" }, "欢迎使用我们的应用，为了提供更好的服务，我们需要获取相关权限并说明隐私政策："),
            vue.createElementVNode("view", {
              class: "policy-item",
              onClick: $setup.goToPrivacy
            }, [
              vue.createVNode(_component_uni_icons, {
                type: "info",
                size: "18",
                color: "#80afff"
              }),
              vue.createElementVNode("text", { class: "policy-text" }, "《隐私政策》"),
              vue.createVNode(_component_uni_icons, {
                type: "arrowright",
                size: "16",
                color: "#999"
              })
            ]),
            vue.createElementVNode("view", {
              class: "policy-item",
              onClick: $setup.goToPermissions
            }, [
              vue.createVNode(_component_uni_icons, {
                type: "locked",
                size: "18",
                color: "#80afff"
              }),
              vue.createElementVNode("text", { class: "policy-text" }, "《权限说明》"),
              vue.createVNode(_component_uni_icons, {
                type: "arrowright",
                size: "16",
                color: "#999"
              })
            ])
          ]),
          vue.createElementVNode("view", { class: "footer" }, [
            vue.createElementVNode("button", {
              class: "btn refuse",
              onClick: $setup.handleDisagree
            }, "拒绝并退出"),
            vue.createElementVNode("button", {
              class: "btn agree",
              onClick: $setup.handleAgree
            }, "同意并继续")
          ])
        ])
      ]),
      _: 1
      /* STABLE */
    }, 8, ["visible"]);
  }
  const __easycom_0$a = /* @__PURE__ */ _export_sfc(_sfc_main$Z, [["render", _sfc_render$Y], ["__scopeId", "data-v-c6b543e1"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/components/privacy-permission-modal/privacy-permission-modal.vue"]]);
  const _imports_0$c = "/static/search.png";
  const _imports_0$b = "/static/cancel.png";
  const _sfc_main$Y = {
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
      const onSearchInput = async (e2) => {
        var _a;
        inputValue.value = e2.detail.value;
        const searchValue = e2.detail.value.trim();
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
  function _sfc_render$X(_ctx, _cache, $props, $setup, $data, $options) {
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
              src: _imports_0$c
            })) : vue.createCommentVNode("v-if", true),
            vue.createElementVNode("input", {
              class: "common_search_input",
              placeholder: "请输入娃物名称 (ㅇㅅㅇ❀)...",
              value: $setup.inputValue,
              onInput: $setup.onSearchInput,
              style: vue.normalizeStyle({ fontSize: $props.fontSize || "22rpx" })
            }, null, 44, ["value"]),
            $setup.results.length > 0 ? (vue.openBlock(), vue.createElementBlock("image", {
              key: 1,
              class: "icon_image",
              src: _imports_0$b,
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
  const __easycom_0$9 = /* @__PURE__ */ _export_sfc(_sfc_main$Y, [["render", _sfc_render$X], ["__scopeId", "data-v-445b599f"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/components/goods-search/goods-search.vue"]]);
  const _sfc_main$X = /* @__PURE__ */ Object.assign({
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
          formatAppLog("log", "at components/common-search/common-search.vue:86", "请求结果:", res.data);
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
          formatAppLog("error", "at components/common-search/common-search.vue:101", "请求错误:", error);
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
  function _sfc_render$W(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { style: { "width": "100%" } }, [
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
            src: _imports_0$c
          })) : vue.createCommentVNode("v-if", true),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              class: "common_search_input",
              placeholder: "可以模糊搜索娃社 o( ❛ᴗ❛ )o …",
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
          $setup.results.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "search-info-tap"
          }, [
            $setup.results.length > 0 && $setup.searchTerm.length < 5 ? (vue.openBlock(), vue.createElementBlock("text", { key: 0 }, "拼音、缩写、别名都可以搜")) : vue.createCommentVNode("v-if", true),
            vue.createElementVNode("image", {
              class: "icon_image",
              src: _imports_0$b,
              onClick: $setup.cancel
            })
          ])) : vue.createCommentVNode("v-if", true)
        ],
        6
        /* CLASS, STYLE */
      ),
      vue.createElementVNode("view", { style: { "position": "relative" } }, [
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
      ])
    ]);
  }
  const __easycom_2$1 = /* @__PURE__ */ _export_sfc(_sfc_main$X, [["render", _sfc_render$W], ["__scopeId", "data-v-e5a069da"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/components/common-search/common-search.vue"]]);
  const _sfc_main$W = {
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
  function _sfc_render$V(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", {
      class: "brand-card",
      key: $props.key
    }, [
      vue.createCommentVNode(" 品牌信息卡片 "),
      vue.createElementVNode("view", {
        class: "brand-header",
        onClick: $setup.jumpBrand
      }, [
        $props.brand.logo_image ? (vue.openBlock(), vue.createElementBlock("image", {
          key: 0,
          class: "brand-logo",
          src: $props.brand.logo_image,
          mode: "aspectFit"
        }, null, 8, ["src"])) : (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "brand-logo",
          style: { "background": "linear-gradient(180deg, #d8c1b3 0%, #d3f5ff 100%)", "align-items": "center" }
        }, [
          vue.createElementVNode("text", { style: { "color": "rgb(255, 255, 255)", "font-size": "100rpx", "display": "block", "text-align": "center" } }, "?")
        ])),
        vue.createElementVNode("view", { class: "brand-meta" }, [
          vue.createElementVNode("view", { class: "title-row" }, [
            vue.createCommentVNode(' <text class="brand-title">{{brand.brand_name}}</text> '),
            vue.createElementVNode("image", {
              src: $props.brand.brand_name_image,
              mode: "heightFix",
              style: { "height": "40rpx" }
            }, null, 8, ["src"]),
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
                  src: doll.goods_images && doll.goods_images[0],
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
  const __easycom_4$1 = /* @__PURE__ */ _export_sfc(_sfc_main$W, [["render", _sfc_render$V], ["__scopeId", "data-v-aa9d9d58"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/components/index-brand/index-brand.vue"]]);
  const _imports_0$a = "/static/loading.gif";
  const _sfc_main$V = {
    __name: "loading-toast",
    props: {
      show: {
        type: Boolean,
        default: false
      },
      text: {
        type: String,
        default: "助手加载中..."
      }
    },
    setup(__props, { expose: __expose }) {
      __expose();
      const props = __props;
      const __returned__ = { props, ref: vue.ref };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$U(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      vue.Fragment,
      null,
      [
        vue.createCommentVNode(" 使用v-show而不是v-if以获得更好的性能 "),
        vue.withDirectives(vue.createElementVNode(
          "view",
          { class: "loading-container" },
          [
            vue.createCommentVNode(" 半透明黑色遮罩层 "),
            vue.createElementVNode("view", { class: "loading-mask" }),
            vue.createCommentVNode(" 加载动画内容 "),
            vue.createElementVNode("view", { class: "loading-content" }, [
              vue.createElementVNode("image", {
                class: "loading-gif",
                src: _imports_0$a,
                mode: "aspectFit"
              }),
              $props.text ? (vue.openBlock(), vue.createElementBlock(
                "text",
                {
                  key: 0,
                  class: "loading-text"
                },
                vue.toDisplayString($props.text),
                1
                /* TEXT */
              )) : vue.createCommentVNode("v-if", true)
            ])
          ],
          512
          /* NEED_PATCH */
        ), [
          [vue.vShow, $props.show]
        ])
      ],
      2112
      /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
    );
  }
  const __easycom_4 = /* @__PURE__ */ _export_sfc(_sfc_main$V, [["render", _sfc_render$U], ["__scopeId", "data-v-3ed615fd"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/components/loading-toast/loading-toast.vue"]]);
  const _sfc_main$U = {
    __name: "version-check",
    props: {
      // 是否显示已是最新版本的提示
      showUpToDateToast: {
        type: Boolean,
        default: false
      },
      // 当前版本号
      currentVersion: {
        type: String,
        required: true
      },
      // 是否自动检查版本
      autoCheck: {
        type: Boolean,
        default: true
      }
    },
    setup(__props, { expose: __expose }) {
      const props = __props;
      const modalVisible = vue.ref(false);
      const newVersionInfo = vue.ref(null);
      const showUpToDateToast = vue.ref(false);
      const cv = vue.ref("1.0.0");
      const platform2 = vue.computed(() => {
        const systemInfo2 = uni.getSystemInfoSync();
        return systemInfo2.platform || "unknown";
      });
      const formatTime = (timestamp) => {
        if (!timestamp)
          return "未知日期";
        const date = new Date(timestamp * 1e3);
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
      };
      const isIgnored = () => {
        const ignoreTime = uni.getStorageSync("ignoreUpdateTime");
        formatAppLog("log", "at components/version-check/version-check.vue:87", "忽略时间：", ignoreTime);
        if (!ignoreTime)
          return false;
        const now = Date.now();
        formatAppLog("log", "at components/version-check/version-check.vue:92", "当前时间", now);
        return now - ignoreTime < 2592e5;
      };
      const checkVersion = async () => {
        try {
          let scene = getScene();
          if (scene === 1 || scene === 4) {
            formatAppLog("log", "at components/version-check/version-check.vue:102", "scene:", scene);
            return;
          }
          if (isIgnored()) {
            formatAppLog("log", "at components/version-check/version-check.vue:107", "在忽略期内，不显示更新提示 ");
            return;
          }
          const cv2 = uni.getAppBaseInfo().appVersion;
          const res = await uni.request({
            url: `${websiteUrl}/latest-version?version=1.0.40`,
            method: "GET"
          });
          if (res && res.data) {
            if (res.data.status === "success" && res.data.data) {
              newVersionInfo.value = res.data.data;
              modalVisible.value = true;
            } else if (res.data.status === "failed" && props.showUpToDateToast) {
              showUpToDateToast.value = true;
              setTimeout(() => {
                showUpToDateToast.value = false;
              }, 2e3);
            }
          }
        } catch (err) {
          formatAppLog("error", "at components/version-check/version-check.vue:130", "版本检查失败:", err);
        }
      };
      const handleUpdate = () => {
        uni.setStorageSync("ignoreUpdateTime", Date.now());
        modalVisible.value = false;
        const platformValue = platform2.value.toLowerCase();
        formatAppLog("log", "at components/version-check/version-check.vue:143", platformValue);
        let scene = getScene();
        if (scene === 2) {
          plus.runtime.openURL("https://apps.apple.com/app/id6747564362");
        } else if (scene === 3) {
          plus.runtime.openURL("https://apps.apple.com/app/id6747564362");
        } else {
          uni.showModal({
            title: "更新提示",
            content: "请前往应用商店更新最新版本",
            showCancel: false
          });
        }
      };
      const ignoreUpdate = () => {
        uni.setStorageSync("ignoreUpdateTime", Date.now());
        modalVisible.value = false;
      };
      __expose({
        checkVersion
      });
      vue.onMounted(() => {
        cv.value = uni.getAppBaseInfo().appVersion;
        if (props.autoCheck) {
          setTimeout(() => {
            checkVersion();
          }, 1500);
        }
      });
      const __returned__ = { props, modalVisible, newVersionInfo, showUpToDateToast, cv, platform: platform2, formatTime, isIgnored, checkVersion, handleUpdate, ignoreUpdate, ref: vue.ref, onMounted: vue.onMounted, computed: vue.computed, get websiteUrl() {
        return websiteUrl;
      }, get getScene() {
        return getScene;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$T(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_common_modal = resolveEasycom(vue.resolveDynamicComponent("common-modal"), __easycom_3$2);
    return vue.openBlock(), vue.createElementBlock(
      vue.Fragment,
      null,
      [
        vue.createCommentVNode(" 版本检查组件 "),
        vue.createElementVNode("view", null, [
          vue.createCommentVNode(" 新版本提示弹窗 "),
          vue.createVNode(_component_common_modal, {
            visible: $setup.modalVisible,
            "onUpdate:visible": _cache[0] || (_cache[0] = ($event) => $setup.modalVisible = $event),
            top: "15vh"
          }, {
            default: vue.withCtx(() => {
              var _a, _b, _c;
              return [
                vue.createElementVNode("view", { class: "version-update-container" }, [
                  vue.createElementVNode(
                    "view",
                    { class: "update-title" },
                    "发现新版本 v" + vue.toDisplayString((_a = $setup.newVersionInfo) == null ? void 0 : _a.version) + " 当前 v" + vue.toDisplayString(),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("scroll-view", {
                    class: "update-content",
                    "scroll-y": ""
                  }, [
                    vue.createElementVNode("view", { class: "update-section" }, [
                      vue.createElementVNode("view", { class: "section-title" }, "更新内容"),
                      vue.createElementVNode(
                        "view",
                        { class: "section-content" },
                        vue.toDisplayString(((_b = $setup.newVersionInfo) == null ? void 0 : _b.note) || "优化用户体验，修复已知问题"),
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode("view", { class: "update-section" }, [
                      vue.createElementVNode("view", { class: "section-title" }, "更新日期"),
                      vue.createElementVNode(
                        "view",
                        { class: "section-content" },
                        vue.toDisplayString($setup.formatTime((_c = $setup.newVersionInfo) == null ? void 0 : _c.created_at)),
                        1
                        /* TEXT */
                      )
                    ])
                  ]),
                  vue.createElementVNode("view", { class: "update-buttons" }, [
                    vue.createElementVNode("button", {
                      class: "update-btn ignore",
                      onClick: $setup.ignoreUpdate
                    }, "暂不更新"),
                    vue.createElementVNode("button", {
                      class: "update-btn confirm",
                      onClick: $setup.handleUpdate
                    }, "立即更新")
                  ])
                ])
              ];
            }),
            _: 1
            /* STABLE */
          }, 8, ["visible"]),
          vue.createCommentVNode(" 已是最新版本提示 "),
          $setup.showUpToDateToast ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "toast-message"
          }, [
            vue.createElementVNode("text", null, "已是最新版本")
          ])) : vue.createCommentVNode("v-if", true)
        ])
      ],
      2112
      /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
    );
  }
  const __easycom_7 = /* @__PURE__ */ _export_sfc(_sfc_main$U, [["render", _sfc_render$T], ["__scopeId", "data-v-3cade7b0"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/components/version-check/version-check.vue"]]);
  const _sfc_main$T = {
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
  function _sfc_render$S(_ctx, _cache, $props, $setup, $data, $options) {
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
  const sdp = /* @__PURE__ */ _export_sfc(_sfc_main$T, [["render", _sfc_render$S], ["__scopeId", "data-v-1fb386b0"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/components/swiper-dynamic-bullets/swiper-dynamic-bullets.vue"]]);
  const _imports_0$9 = "/static/new-icon/title.gif";
  const _imports_1$7 = "/static/new-icon/telphone.png";
  const _imports_2$4 = "/static/new-icon/read.png";
  const _imports_3$1 = "/static/new-icon/collocation.png";
  const _imports_5 = "/static/default-banner.jpg";
  const _imports_6 = "/static/noname.png";
  const _sfc_main$S = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      vue.useCssVars((_ctx) => ({
        "1cf27b2a-headerHeight": headerHeight.value
      }));
      let brandsList = vue.ref([]);
      let data = vue.ref({});
      let cursor = vue.ref("");
      let showLoadding = vue.ref(false);
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
      const navBarHeight = vue.computed(() => {
        return 0;
      });
      const headerHeight = vue.computed(() => {
        const statusBarHeight = systemInfo2.statusBarHeight || 0;
        return `${statusBarHeight}px`;
      });
      const onShareAppMessage = () => ({
        title: "BJD娃圈你想知道的这里都有~",
        path: "/pages/news/news",
        imageUrl: "/static/share",
        success(res) {
          formatAppLog("log", "at pages/index/index.vue:383", "分享成功", res);
        },
        fail(err) {
          formatAppLog("log", "at pages/index/index.vue:386", "分享失败", err);
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
        showLoadding.value = true;
        setTimeout(async () => {
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
        }, 800);
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
            formatAppLog("error", "at pages/index/index.vue:484", "获取Banner失败:", err);
            data.value = {};
          }
        });
      };
      function onChange(e2) {
        this.swiperIndex.value = e2.detail.current;
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
        cursor.value = "";
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
        showLoadding.value = true;
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
            formatAppLog("log", "at pages/index/index.vue:554", err);
            uni.showToast({
              title: "加载失败",
              icon: "none"
            });
          },
          complete: () => {
            newsLoading.value = false;
            showLoadding.value = false;
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
        showLoadding.value = true;
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
            formatAppLog("log", "at pages/index/index.vue:600", err);
            uni.showToast({
              title: "加载失败",
              icon: "none"
            });
          },
          complete: () => {
            hotLoading.value = false;
            showLoadding.value = false;
          }
        });
      };
      function jumpToCollocationDetail(item) {
        uni.navigateTo({
          url: `/pages/collocation_share/collocation_share?collocation_id=${item.collocation_id}&origin=${item.origin}`
        });
      }
      const getBrands = async (isRefresh = false) => {
        if (isRefresh) {
          page.value = 1;
          brandsList.value = [];
          hasMore.value = true;
          cursor.value = "";
        }
        if (!hasMore.value || loading.value)
          return;
        loading.value = true;
        showLoadding.value = true;
        const params = {
          pageSize: pageSize2.value
        };
        if (cursor.value) {
          params.cursor = cursor.value;
        } else if (activeSearchType.value) {
          params.searchType = activeSearchType.value;
        }
        uni.request({
          url: websiteUrl + "/brands-info-list",
          data: params,
          success: (res) => {
            if (res.data.status !== "success") {
              uni.showToast({
                title: "加载失败: " + res.data.message,
                icon: "none"
              });
              return;
            }
            const response = res.data.data;
            const newData = response.data;
            formatAppLog("log", "at pages/index/index.vue:661", "newData:", newData);
            cursor.value = response.next_cursor || "";
            if (newData.length === 0) {
              hasMore.value = false;
              return;
            }
            brandsList.value = [...brandsList.value, ...newData];
            hasMore.value = response.has_more;
          },
          fail: (err) => {
            formatAppLog("log", "at pages/index/index.vue:674", err);
            uni.showToast({
              title: "网络请求失败",
              icon: "none"
            });
          },
          complete: () => {
            loading.value = false;
            showLoadding.value = false;
          }
        });
      };
      const getTreeholeList = async (isRefresh = false) => {
        if (isRefresh)
          treeholePage.value = 1;
        if (!treeholeHasMore.value || treeholeLoading.value)
          return;
        treeholeLoading.value = true;
        showLoadding.value = true;
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
            showLoadding.value = false;
          }
        });
      };
      function handlePublish() {
        if (!global$1.isLogin) {
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
        if (!global$1.isLogin) {
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
        if (activeTab.value === "brands" && hasMore.value) {
          getBrands();
        } else if (activeTab.value === "news" && newsHasMore.value) {
          getNews();
        } else if (activeTab.value === "second" && treeholeHasMore.value) {
          getTreeholeList();
        }
      });
      const __returned__ = { get brandsList() {
        return brandsList;
      }, set brandsList(v2) {
        brandsList = v2;
      }, get data() {
        return data;
      }, set data(v2) {
        data = v2;
      }, get cursor() {
        return cursor;
      }, set cursor(v2) {
        cursor = v2;
      }, get showLoadding() {
        return showLoadding;
      }, set showLoadding(v2) {
        showLoadding = v2;
      }, tabs, activeSearchType, get swiperIndex() {
        return swiperIndex;
      }, set swiperIndex(v2) {
        swiperIndex = v2;
      }, systemInfo: systemInfo2, get totalBrand() {
        return totalBrand;
      }, set totalBrand(v2) {
        totalBrand = v2;
      }, page, pageSize: pageSize2, hasMore, loading, get newsList() {
        return newsList;
      }, set newsList(v2) {
        newsList = v2;
      }, newsPage, newsPageSize, newsHasMore, newsLoading, get hotList() {
        return hotList;
      }, set hotList(v2) {
        hotList = v2;
      }, hotPage, hotPageSize, hotHasMore, hotLoading, get treeholeList() {
        return treeholeList;
      }, set treeholeList(v2) {
        treeholeList = v2;
      }, treeholePage, treeholePageSize, treeholeHasMore, treeholeLoading, activeTab, switchTab, navBarHeight, headerHeight, onShareAppMessage, refreshData, jump2collocationSquare, handleBannerClick, jump2saleNews, getArticles, onChange, handleTabClick, jump2userWhenNotAnonymous, copyUrl, getNews, jump2treeholeDetail, getHotCollocations, jumpToCollocationDetail, getBrands, getTreeholeList, handlePublish, previewImage, handleLike, formatTime, get onLoad() {
        return onLoad;
      }, get onReachBottom() {
        return onReachBottom;
      }, get onPullDownRefresh() {
        return onPullDownRefresh;
      }, ref: vue.ref, computed: vue.computed, get websiteUrl() {
        return websiteUrl;
      }, get wechatSignLogin() {
        return wechatSignLogin;
      }, get getUserInfo() {
        return getUserInfo;
      }, get global() {
        return global$1;
      }, sdp };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$R(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_privacy_permission_modal = resolveEasycom(vue.resolveDynamicComponent("privacy-permission-modal"), __easycom_0$a);
    const _component_goods_search = resolveEasycom(vue.resolveDynamicComponent("goods-search"), __easycom_0$9);
    const _component_uni_transition = resolveEasycom(vue.resolveDynamicComponent("uni-transition"), __easycom_2$2);
    const _component_common_search = resolveEasycom(vue.resolveDynamicComponent("common-search"), __easycom_2$1);
    const _component_index_brand = resolveEasycom(vue.resolveDynamicComponent("index-brand"), __easycom_4$1);
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$b);
    const _component_loading_toast = resolveEasycom(vue.resolveDynamicComponent("loading-toast"), __easycom_4);
    const _component_version_check = resolveEasycom(vue.resolveDynamicComponent("version-check"), __easycom_7);
    return vue.openBlock(), vue.createElementBlock(
      vue.Fragment,
      null,
      [
        vue.createElementVNode("meta", {
          name: "theme-color",
          content: "#def9ff"
        }),
        vue.createElementVNode("view", null, [
          vue.createVNode(_component_privacy_permission_modal),
          vue.createElementVNode("view", { class: "body" }, [
            vue.createElementVNode("view", { class: "index_header" }, [
              vue.createElementVNode("view", { class: "header-placeholders" }),
              vue.createElementVNode("view", null, [
                vue.createCommentVNode(' <image src="/static/new-icon/logo-with-img.jpg" style="width: 380rpx;height: 120rpx;"></image> '),
                vue.createCommentVNode(' <image src="/static/main/2.png"\n						style="width: 170rpx;height: 170rpx;display: inline-block;  vertical-align: top; "\n						mode="aspectFill"></image> '),
                vue.createElementVNode("view", { style: { "display": "inline-block", "margin-left": "20rpx" } }, [
                  vue.createCommentVNode(' <text class="font-alimamashuhei logo"\n							style="">娃圈狗狗助手</text> '),
                  vue.createElementVNode("image", {
                    src: _imports_0$9,
                    mode: "widthFix",
                    style: { "width": "400rpx", "max-height": "180rpx", "position": "relative", "left": "-20rpx", "margin-bottom": "10rpx" }
                  })
                ]),
                vue.createVNode(_component_goods_search, {
                  width: "720rpx",
                  hiddenIcon: false
                })
              ]),
              vue.createElementVNode("view", { style: { "margin": "20rpx 0rpx 0rpx 0rpx", "padding": "5px 10px 0px 10px", "border-radius": "20px 20px 0 0" } }, [
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
                        src: _imports_1$7,
                        mode: "aspectFill"
                      }),
                      vue.createElementVNode("text", { class: "font-cute" }, "新情报！")
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
                        src: _imports_2$4,
                        mode: "aspectFill"
                      }),
                      vue.createElementVNode("text", { class: "font-cute" }, "娃物图鉴")
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
                        src: _imports_3$1,
                        mode: "aspectFill",
                        style: { "width": "90rpx", "height": "90rpx", "position": "relative", "bottom": "0rpx" }
                      }),
                      vue.createElementVNode("text", {
                        class: "font-cute",
                        style: { "position": "relative", "bottom": "5rpx" }
                      }, "热门搭配")
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
                        src: _imports_4$1,
                        mode: "aspectFill"
                      }),
                      vue.createElementVNode("text", { class: "font-cute" }, "匿名版")
                    ],
                    2
                    /* CLASS */
                  )
                ])
              ])
            ]),
            vue.createElementVNode("view", { class: "body_container" }, [
              vue.createElementVNode("view", { style: { "height": "40rpx" } }),
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
                    vue.createElementVNode("view", { style: { "position": "relative", "height": "250rpx", "margin-bottom": "20rpx", "display": "none" } }, [
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
                              src: _imports_5,
                              mode: "aspectFill",
                              style: { "width": "100%", "height": "250rpx" }
                            })
                          ])
                        ])) : vue.createCommentVNode("v-if", true)
                      ])
                    ]),
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
                  vue.createElementVNode("view", { style: { "width": "700rpx" } }, [
                    vue.createVNode(_component_common_search, {
                      style: { "width": "100%" },
                      width: "720rpx"
                    })
                  ]),
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
                    style: { "display": "block" }
                  }, [
                    $setup.activeSearchType == 1 ? (vue.openBlock(), vue.createElementBlock("text", { key: 0 }, "中国公司制作的BJD在打磨、分模线等工艺的处理上比较优秀，价格也比外社低很多。")) : vue.createCommentVNode("v-if", true),
                    $setup.activeSearchType == 2 ? (vue.openBlock(), vue.createElementBlock("text", { key: 1 }, "个人作者在贩售娃物前基本都是圈内玩家，在设计方面花的心思很多。")) : vue.createCommentVNode("v-if", true),
                    $setup.activeSearchType == 3 ? (vue.openBlock(), vue.createElementBlock("text", { key: 2 }, "国外娃社起步较早，风格设计也比较多样化。")) : vue.createCommentVNode("v-if", true)
                  ]),
                  $setup.activeTab === "brands" ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 0,
                    class: "body_list brand_box",
                    style: { "position": "relative" }
                  }, [
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
                              src: _imports_6,
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
            ]),
            vue.createVNode(_component_loading_toast, { show: $setup.showLoadding }, null, 8, ["show"]),
            vue.createVNode(_component_version_check, { "show-up-to-date-toast": true })
          ])
        ])
      ],
      64
      /* STABLE_FRAGMENT */
    );
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$S, [["render", _sfc_render$R], ["__scopeId", "data-v-1cf27b2a"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/index/index.vue"]]);
  const _imports_0$8 = "/static/logo.png";
  const _imports_1$6 = "/static/message.png";
  const _imports_2$3 = "/static/like.png";
  const _sfc_main$R = {};
  function _sfc_render$Q(_ctx, _cache) {
    return vue.openBlock(), vue.createElementBlock("view", null, [
      vue.createElementVNode("image", {
        class: "list_item_main_image",
        src: _imports_0$8
      }),
      vue.createElementVNode("view", { class: "list_item_main_info" }, [
        vue.createElementVNode("text", null, "Puypoodoll - momo"),
        vue.createElementVNode("text", null, "21分钟前"),
        vue.createElementVNode("view", { class: "list_view_and_like_box" }, [
          vue.createElementVNode("view", { class: "posion_bottom" }, [
            vue.createElementVNode("view", { class: "icon_inline_text" }, [
              vue.createElementVNode("image", {
                class: "icon_image",
                src: _imports_1$6
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
  const __easycom_1$5 = /* @__PURE__ */ _export_sfc(_sfc_main$R, [["render", _sfc_render$Q], ["__scopeId", "data-v-704f716d"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/components/homepage-list-item/homepage-list-item.vue"]]);
  const _imports_0$7 = "/static/pixsun.png";
  const _imports_1$5 = "/static/arrow_down.png";
  const _sfc_main$Q = {
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
      function bindPickerChange(e2) {
        formatAppLog("log", "at pages/homepage/homepage.vue:68", "picker发送选择改变，携带值为", e2.detail.value);
        index.value = e2.detail.value;
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
      }, set selectSizeArray(v2) {
        selectSizeArray = v2;
      }, get index() {
        return index;
      }, set index(v2) {
        index = v2;
      }, get menuList() {
        return menuList;
      }, set menuList(v2) {
        menuList = v2;
      }, bindPickerChange, systemInfo: systemInfo2, statusBarHeight, go2goods, onShareAppMessage, ref: vue.ref, get onReachBottom() {
        return onReachBottom;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$P(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_common_search = resolveEasycom(vue.resolveDynamicComponent("common-search"), __easycom_2$1);
    const _component_homepage_list_item = resolveEasycom(vue.resolveDynamicComponent("homepage-list-item"), __easycom_1$5);
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
              src: _imports_0$7
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
                        src: _imports_1$5
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
  const PagesHomepageHomepage = /* @__PURE__ */ _export_sfc(_sfc_main$Q, [["render", _sfc_render$P], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/homepage/homepage.vue"]]);
  const _sfc_main$P = {
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
      const __returned__ = { emit, systemInfo: systemInfo2, navBarHeight, props, headerHeight, footerHeight, ref: vue.ref, computed: vue.computed };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$O(_ctx, _cache, $props, $setup, $data, $options) {
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
              "view",
              {
                class: "main-content",
                "scroll-y": "",
                onScroll: _cache[0] || (_cache[0] = (...args) => _ctx.handleScroll && _ctx.handleScroll(...args))
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
  const __easycom_1$4 = /* @__PURE__ */ _export_sfc(_sfc_main$P, [["render", _sfc_render$O], ["__scopeId", "data-v-957ceee2"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/components/common-page/common-page.vue"]]);
  const _imports_0$6 = "/static/empty.png";
  const _imports_1$4 = "/static/eye.png";
  const _imports_2$2 = "/static/6.png";
  const _sfc_main$O = {
    __name: "stock",
    setup(__props, { expose: __expose }) {
      __expose();
      const systemInfo2 = uni.getSystemInfoSync();
      const statusBarHeight = vue.ref(systemInfo2.statusBarHeight);
      const activeTab = vue.ref(1);
      const previousTab = vue.ref(1);
      function transitionName() {
        if (activeTab.value > 1) {
          return ["fade", "slide-left"];
        } else {
          return ["fade", "slide-right"];
        }
      }
      function switch_tab(index) {
        const oldIndex = activeTab.value;
        previousTab.value = oldIndex;
        activeTab.value = index;
        formatAppLog("log", "at pages/stock/stock.vue:225", `从 tab ${oldIndex} 切换到 tab ${index}，方向: ${transitionName()}`);
        switch (index) {
          case 1:
            getAccountBookData();
            break;
          case 2:
            getShowcaseData();
            break;
          case 3:
            getBillData();
            break;
        }
      }
      function countPaid(bills) {
        let totalAmount = 0;
        let paidAmount = 0;
        bills.forEach((bill) => {
          const price = parseFloat(bill.price) || 0;
          totalAmount += price;
          if (bill.status === 1) {
            paidAmount += price;
          }
        });
        return `${paidAmount.toFixed(1)}/${totalAmount.toFixed(1)}`;
      }
      const selectedType = vue.ref(0);
      const typeModalVisible = vue.ref(false);
      const newTypeName = vue.ref("");
      const customTypes = vue.ref([]);
      const defaultTypes = ["全部", "娃头", "娃衣", "素体", "眼珠", "假发", "娃鞋"];
      const typeOptions = vue.computed(() => [
        ...defaultTypes,
        ...customTypes.value.map((t2) => t2.name)
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
          formatAppLog("error", "at pages/stock/stock.vue:295", "获取分类失败:", err);
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
                  data: {
                    id
                  }
                  // 使用JSON格式传参
                });
                const resData = response.data;
                if (resData.status === "success") {
                  await getAccountTypes();
                  uni.showToast({
                    title: "删除成功"
                  });
                } else {
                  uni.showToast({
                    title: resData.msg || "删除失败",
                    icon: "none"
                  });
                }
              } catch (err) {
                formatAppLog("error", "at pages/stock/stock.vue:370", "删除失败:", err);
                uni.showToast({
                  title: err.errMsg || "请求失败",
                  icon: "none"
                });
              }
            }
          }
        });
      };
      function handleFloatingButton() {
        switch (activeTab.value) {
          case 1:
            go2addAccountBook();
            break;
          case 2:
            go2addShowCase();
            break;
          case 3:
            go2addBill(false);
            break;
        }
      }
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
      function updateSelectedType(e2) {
        selectedType.value = e2.detail.value;
        const selectedTypeName = typeOptions.value[selectedType.value];
        getAccountBookData(selectedTypeName === "全部" ? "" : selectedTypeName);
      }
      function getAccountBookData(type) {
        formatAppLog("log", "at pages/stock/stock.vue:421", global$1);
        if (!global$1.isLogin) {
          return;
        }
        let token = uni.getStorageSync("token");
        let url = websiteUrl + "/with-state/account-book";
        if (type && type !== "全部") {
          url = websiteUrl + "/with-state/account-book?type=" + type;
        }
        uni.request({
          url,
          method: "GET",
          header: {
            "Authorization": token
          },
          success: (res) => {
            formatAppLog("log", "at pages/stock/stock.vue:439", res.data.data);
            accountBookData.value = res.data.data;
          },
          fail: (err) => {
            formatAppLog("log", "at pages/stock/stock.vue:443", err);
          }
        });
      }
      function getShowcaseData() {
        formatAppLog("log", "at pages/stock/stock.vue:450", global$1);
        if (!global$1.isLogin) {
          return;
        }
        let token = uni.getStorageSync("token");
        uni.request({
          url: websiteUrl + "/with-state/showcase",
          method: "GET",
          header: {
            "Authorization": token
          },
          success: (res) => {
            formatAppLog("log", "at pages/stock/stock.vue:464", res.data.data);
            showcaseData.value = res.data.data;
          },
          fail: (err) => {
            formatAppLog("log", "at pages/stock/stock.vue:468", err);
          }
        });
      }
      function getFirstImage(imageUrls) {
        if (!imageUrls)
          return "";
        const urls = imageUrls.split(",");
        if (urls.length === 1 && urls[0].trim() !== "") {
          return urls[0].trim();
        }
        for (const url of urls) {
          if (url.trim() !== "") {
            return url.trim();
          }
        }
        return "";
      }
      function getBillData() {
        formatAppLog("log", "at pages/stock/stock.vue:498", global$1);
        if (!global$1.isLogin) {
          return;
        }
        let token = uni.getStorageSync("token");
        uni.request({
          url: websiteUrl + "/with-state/tail-bill",
          method: "GET",
          header: {
            "Authorization": token
          },
          success: (res) => {
            formatAppLog("log", "at pages/stock/stock.vue:512", res.data.data);
            billData.value = res.data.data;
          },
          fail: (err) => {
            formatAppLog("log", "at pages/stock/stock.vue:516", err);
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
      const __returned__ = { systemInfo: systemInfo2, statusBarHeight, activeTab, previousTab, transitionName, switch_tab, countPaid, selectedType, typeModalVisible, newTypeName, customTypes, defaultTypes, typeOptions, showTypeModal, getAccountTypes, addNewType, deleteType, handleFloatingButton, accountBookData, showcaseData, billData, totalPrice, updateSelectedType, getAccountBookData, getShowcaseData, getFirstImage, getBillData, go2addAccountBook, go2editor, go2addShowCase, go2editorShowCase, go2addBill, getStatusClass, getStatusText, ref: vue.ref, computed: vue.computed, get onShow() {
        return onShow;
      }, get websiteUrl() {
        return websiteUrl;
      }, get wechatSignLogin() {
        return wechatSignLogin;
      }, get getUserInfo() {
        return getUserInfo;
      }, get global() {
        return global$1;
      }, get asyncGetUserInfo() {
        return asyncGetUserInfo;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$N(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_transition = resolveEasycom(vue.resolveDynamicComponent("uni-transition"), __easycom_2$2);
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$b);
    const _component_common_modal = resolveEasycom(vue.resolveDynamicComponent("common-modal"), __easycom_3$2);
    const _component_common_page = resolveEasycom(vue.resolveDynamicComponent("common-page"), __easycom_1$4);
    return vue.openBlock(), vue.createElementBlock(
      vue.Fragment,
      null,
      [
        vue.createElementVNode("meta", {
          name: "theme-color",
          content: "#d8deff"
        }),
        vue.createVNode(_component_common_page, { head_color: "#d8deff" }, {
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
                vue.createVNode(_component_uni_transition, {
                  name: $setup.transitionName(),
                  "mode-class": ["fade", "slide-left"],
                  duration: 300,
                  show: $setup.activeTab === 1
                }, {
                  default: vue.withCtx(() => {
                    var _a;
                    return [
                      vue.createElementVNode("view", { class: "tab_body_1st" }, [
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
                                    src: $setup.getFirstImage(item.image_url),
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
                          class: "empty-state",
                          style: { "position": "relative", "bottom": "80px" }
                        }, [
                          vue.createElementVNode("image", {
                            class: "empty-icon",
                            src: _imports_0$6
                          }),
                          vue.createElementVNode("text", { class: "empty-text" }, "空空如也～"),
                          vue.createElementVNode("text", { class: "empty-tip" }, "点击下方按钮添加第一个物品吧！")
                        ])),
                        vue.createCommentVNode(' <view class="floating-button" @tap="go2addAccountBook">\n							<uni-icons type="plusempty" size="30" color="#fff"></uni-icons>\n						</view> ')
                      ])
                    ];
                  }),
                  _: 1
                  /* STABLE */
                }, 8, ["name", "show"]),
                vue.createVNode(_component_uni_transition, {
                  name: $setup.transitionName(),
                  "mode-class": $setup.transitionName(),
                  duration: 300,
                  show: $setup.activeTab === 2
                }, {
                  default: vue.withCtx(() => [
                    vue.createElementVNode("view", { class: "tab_body_sec" }, [
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
                                          src: _imports_1$4,
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
                          src: _imports_0$6
                        }),
                        vue.createElementVNode("text", { class: "empty-text" }, "展示柜空空如也"),
                        vue.createElementVNode("text", { class: "empty-tip" }, "快来创建你的展示空间吧！")
                      ])),
                      vue.createCommentVNode(" 添加展示柜数据 "),
                      vue.createCommentVNode(' <view class="floating-button" @tap="go2addShowCase">\n							<uni-icons type="plusempty" size="30" color="#fff"></uni-icons>\n						</view> ')
                    ])
                  ]),
                  _: 1
                  /* STABLE */
                }, 8, ["name", "mode-class", "show"]),
                vue.createVNode(_component_uni_transition, {
                  name: $setup.transitionName(),
                  "mode-class": ["fade", "slide-bottom"],
                  duration: 300,
                  show: $setup.activeTab === 3
                }, {
                  default: vue.withCtx(() => [
                    vue.createElementVNode("view", { class: "tab_body_3th" }, [
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
                                vue.createCommentVNode(" 已补/总计：{{ countPaid(bills) }}/{{ bills.length }} "),
                                vue.createElementVNode(
                                  "text",
                                  { class: "month-stats" },
                                  vue.toDisplayString($setup.countPaid(bills)),
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
                          src: _imports_0$6
                        }),
                        vue.createElementVNode("text", { class: "empty-text" }, "暂无待补尾款"),
                        vue.createElementVNode("text", { class: "empty-tip" }, "增加添加一个到账本试试吧～")
                      ])),
                      vue.createCommentVNode(' 					<view class="floating-button" @tap="go2addBill(false)">\n							<uni-icons type="plusempty" size="30" color="#fff"></uni-icons>\n						</view> ')
                    ])
                  ]),
                  _: 1
                  /* STABLE */
                }, 8, ["name", "show"])
              ])
            ]),
            vue.createCommentVNode(" 新增分类管理弹窗 "),
            vue.createVNode(_component_common_modal, {
              visible: $setup.typeModalVisible,
              "onUpdate:visible": _cache[4] || (_cache[4] = (val) => $setup.typeModalVisible = val),
              top: "300rpx",
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
            vue.createCommentVNode(" 统一的悬浮按钮 - 固定在底部中央 "),
            vue.createElementVNode("view", {
              class: "unified-floating-button",
              onClick: $setup.handleFloatingButton
            }, [
              vue.createVNode(_component_uni_icons, {
                type: "plusempty",
                size: "30",
                color: "#fff"
              })
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
  const PagesStockStock = /* @__PURE__ */ _export_sfc(_sfc_main$O, [["render", _sfc_render$N], ["__scopeId", "data-v-4829e7f4"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/stock/stock.vue"]]);
  const _imports_0$5 = "/static/pixcollocation.png";
  const _imports_1$3 = "/static/pixpaperplane.png";
  const _imports_2$1 = "/static/pixttq2.png";
  const _imports_3 = "/static/user.png";
  const _imports_4 = "/static/key.png";
  const _sfc_main$N = {
    __name: "mine",
    setup(__props, { expose: __expose }) {
      __expose();
      vue.useCssVars((_ctx) => ({
        "7c2ebfa5-headerHeight": headerHeight.value
      }));
      formatAppLog("log", "at pages/mine/mine.vue:153", global$1.isLogin);
      formatAppLog("log", "at pages/mine/mine.vue:154", global$1.userInfo);
      let inputPhone = vue.ref("");
      let inputPassword = vue.ref("");
      let unreadCount = vue.ref(0);
      let likeCount = vue.ref(0);
      let myCollocationCount = vue.ref(0);
      let visible = vue.ref(false);
      let scene = getScene();
      let agree = vue.ref(false);
      function handleAgreeChange(e2) {
        agree.value = e2.detail.value.length > 0;
      }
      function goToPrivacy() {
        uni.navigateTo({
          url: "/pages/private/private"
        });
      }
      function goToPermissions() {
        uni.navigateTo({
          url: "/pages/permission/permission"
        });
      }
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
        global$1.isLogin = false;
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
      function jump2index() {
        uni.showTabBar({
          animation: false
        });
        uni.switchTab({
          url: `/pages/index/index`
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
          formatAppLog("log", "at pages/mine/mine.vue:279", error);
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
          formatAppLog("log", "at pages/mine/mine.vue:300", error);
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
          formatAppLog("log", "at pages/mine/mine.vue:322", error);
          uni.showToast({
            title: "搭配数获取失败",
            icon: "none"
          });
        }
      };
      function selectAvatar(croperPath) {
        formatAppLog("log", "at pages/mine/mine.vue:331", "croperPath:" + croperPath);
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
              formatAppLog("log", "at pages/mine/mine.vue:351", "获取到的七牛token：" + res.data.data.token);
              let userInfo = uni.getStorageSync("userInfo");
              formatAppLog("log", "at pages/mine/mine.vue:353", userInfo);
              let fileName = res.data.data.path;
              formatAppLog("log", "at pages/mine/mine.vue:356", "fileName:" + fileName);
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
                  formatAppLog("log", "at pages/mine/mine.vue:371", "上传成功");
                  updateUserInfo("avatar", "https://images1.fantuanpu.com/" + fileName);
                },
                fail: (res2) => {
                  formatAppLog("log", "at pages/mine/mine.vue:378", res2);
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
            formatAppLog("log", "at pages/mine/mine.vue:411", "更新成功");
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
        if (!agree.value) {
          uni.showToast({
            title: "请先阅读并同意协议",
            icon: "none"
          });
          return;
        }
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
            formatAppLog("log", "at pages/mine/mine.vue:471", res);
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
            formatAppLog("log", "at pages/mine/mine.vue:486", "jwt:" + data.jwt_token);
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
      function jump2test() {
        uni.navigateTo({
          url: "/pages/loadding/loadding"
        });
      }
      const systemInfo2 = uni.getSystemInfoSync();
      const navBarHeight = vue.computed(() => {
        return 0;
      });
      const headerHeight = vue.computed(() => {
        const statusBarHeight = systemInfo2.statusBarHeight || 0;
        return `${statusBarHeight}px`;
      });
      vue.watch(
        () => global$1.isLogin,
        // 使用函数返回要监听的值
        (newVal) => {
          formatAppLog("log", "at pages/mine/mine.vue:543", "watch", newVal);
          if (newVal) {
            uni.showTabBar({
              animation: false
            });
          } else {
            uni.hideTabBar({
              animation: false
            });
          }
        }
      );
      onShow(() => {
        getUserInfo();
        if (global$1.isLogin) {
          uni.showTabBar({
            animation: false
          });
        } else {
          uni.hideTabBar({
            animation: false
          });
        }
        fetchUnreadCount();
        fetchLikeCount();
        fetchMyCollocationCount();
        const pages2 = getCurrentPages();
        const currentPage = pages2[pages2.length - 1];
        if (currentPage.returnParam) {
          selectAvatar(currentPage.returnParam);
        }
      });
      const __returned__ = { get inputPhone() {
        return inputPhone;
      }, set inputPhone(v2) {
        inputPhone = v2;
      }, get inputPassword() {
        return inputPassword;
      }, set inputPassword(v2) {
        inputPassword = v2;
      }, get unreadCount() {
        return unreadCount;
      }, set unreadCount(v2) {
        unreadCount = v2;
      }, get likeCount() {
        return likeCount;
      }, set likeCount(v2) {
        likeCount = v2;
      }, get myCollocationCount() {
        return myCollocationCount;
      }, set myCollocationCount(v2) {
        myCollocationCount = v2;
      }, get visible() {
        return visible;
      }, set visible(v2) {
        visible = v2;
      }, get scene() {
        return scene;
      }, set scene(v2) {
        scene = v2;
      }, get agree() {
        return agree;
      }, set agree(v2) {
        agree = v2;
      }, handleAgreeChange, goToPrivacy, goToPermissions, chooseImage: chooseImage2, logout, jump2register, jump2like, jump2index, jump2myComment, jump2message, jump2forgetPassword, jump2collocation, jumpToCroper: jumpToCroper2, fetchUnreadCount, fetchLikeCount, fetchMyCollocationCount, selectAvatar, updateUserInfo, login, jumpSetting, jump2test, systemInfo: systemInfo2, navBarHeight, headerHeight, ref: vue.ref, watch: vue.watch, computed: vue.computed, get onShow() {
        return onShow;
      }, get websiteUrl() {
        return websiteUrl;
      }, get wechatSignLogin() {
        return wechatSignLogin;
      }, get getUserInfo() {
        return getUserInfo;
      }, get global() {
        return global$1;
      }, get getScene() {
        return getScene;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$M(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$b);
    return vue.openBlock(), vue.createElementBlock(
      vue.Fragment,
      null,
      [
        vue.createElementVNode("meta", {
          name: "theme-color",
          content: "#e0f3ff"
        }),
        vue.createElementVNode("view", { head_color: "url('/static/bg/bg2.jpg')" }, [
          vue.createElementVNode("view", { class: "container" }, [
            vue.createCommentVNode(" 个人设置页面 "),
            vue.createCommentVNode(" 区分是否登录 "),
            $setup.global.isLogin ? (vue.openBlock(), vue.createElementBlock("view", { key: 0 }, [
              vue.createElementVNode("view", { class: "mine" }, [
                vue.createElementVNode("view", { class: "header-placeholders" }),
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
                      src: _imports_0$5,
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
                      src: _imports_1$3,
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
                  vue.createCommentVNode(" 修改后的按钮样式 "),
                  vue.createElementVNode("view", {
                    class: "mine-button-item",
                    onClick: $setup.jump2myComment
                  }, [
                    vue.createElementVNode("view", { class: "button-content" }, [
                      vue.createVNode(_component_uni_icons, {
                        type: "chatboxes",
                        size: "24",
                        color: "#606060"
                      }),
                      vue.createElementVNode("text", { class: "button-text" }, "我的帖子")
                    ]),
                    vue.createVNode(_component_uni_icons, {
                      type: "right",
                      size: "24",
                      color: "#c0c0c0"
                    })
                  ]),
                  vue.createElementVNode("view", {
                    class: "mine-button-item",
                    onClick: $setup.jumpSetting
                  }, [
                    vue.createElementVNode("view", { class: "button-content" }, [
                      vue.createVNode(_component_uni_icons, {
                        type: "gear",
                        size: "24",
                        color: "#606060"
                      }),
                      vue.createElementVNode("text", { class: "button-text" }, "账号设置")
                    ]),
                    vue.createVNode(_component_uni_icons, {
                      type: "right",
                      size: "24",
                      color: "#c0c0c0"
                    })
                  ]),
                  vue.createCommentVNode(' 	<view class="mine-button-item" @click="jump2test">\n							<view class="button-content">\n								<uni-icons type="gear" size="24" color="#606060"></uni-icons>\n								<text class="button-text">测试</text>\n							</view>\n							<uni-icons type="right" size="24" color="#c0c0c0"></uni-icons>\n						</view> '),
                  vue.createElementVNode("view", {
                    class: "mine-button-item last-button",
                    onClick: $setup.logout
                  }, [
                    vue.createElementVNode("view", { class: "button-content" }, [
                      vue.createVNode(_component_uni_icons, {
                        type: "arrow-right",
                        size: "24",
                        color: "#606060"
                      }),
                      vue.createElementVNode("text", { class: "button-text" }, "退出账号")
                    ]),
                    vue.createVNode(_component_uni_icons, {
                      type: "right",
                      size: "24",
                      color: "#c0c0c0"
                    })
                  ])
                ])
              ])
            ])) : (vue.openBlock(), vue.createElementBlock("view", {
              key: 1,
              class: "unlogin-container"
            }, [
              vue.createElementVNode("view", { class: "header-placeholders" }),
              vue.createElementVNode("image", {
                src: "https://images1.fantuanpu.com/home/jpt.gif",
                mode: "aspectFit",
                style: { "width": "360rpx", "height": "380rpx", "position": "relative", "right": "20rpx" }
              }),
              vue.createElementVNode("text", { class: "welcome-text" }, "欢迎使用娃圈狗狗助手"),
              vue.createCommentVNode(' <image src="https://images1.fantuanpu.com/home/title.gif" mode="widthFix" style="width: 600rpx;"></image> '),
              vue.createElementVNode("view", { class: "input-group" }, [
                vue.createElementVNode("view", { class: "input-with-icon" }, [
                  vue.createElementVNode("image", {
                    class: "icon",
                    src: _imports_3
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
                    src: _imports_4
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
              $setup.scene == 4 ? (vue.openBlock(), vue.createElementBlock("button", {
                key: 0,
                class: "submit-btn",
                onClick: _cache[2] || (_cache[2] = (...args) => $setup.wechatSignLogin && $setup.wechatSignLogin(...args))
              }, "微信登录")) : vue.createCommentVNode("v-if", true),
              vue.createElementVNode("button", {
                class: "submit-btn",
                onClick: $setup.jump2index,
                style: { "background": "linear-gradient(135deg, #cdcdcd, #b1b1b1)" }
              }, "随便看看→"),
              vue.createCommentVNode(" 协议勾选框 "),
              vue.createElementVNode("view", { class: "agreement-container" }, [
                vue.createElementVNode(
                  "checkbox-group",
                  { onChange: $setup.handleAgreeChange },
                  [
                    vue.createElementVNode("label", { class: "agreement-label" }, [
                      vue.createElementVNode("checkbox", {
                        checked: $setup.agree,
                        color: "#65C3D6",
                        style: { "transform": "scale(0.8)" }
                      }, null, 8, ["checked"]),
                      vue.createElementVNode("text", { class: "agreement-text" }, "我已阅读并同意")
                    ])
                  ],
                  32
                  /* NEED_HYDRATION */
                ),
                vue.createElementVNode("view", { class: "agreement-links" }, [
                  vue.createElementVNode("text", {
                    class: "agreement-link",
                    onClick: $setup.goToPrivacy
                  }, "《隐私政策》"),
                  vue.createElementVNode("text", {
                    class: "agreement-link",
                    onClick: $setup.goToPermissions
                  }, "《用户协议》")
                ])
              ])
            ]))
          ])
        ])
      ],
      64
      /* STABLE_FRAGMENT */
    );
  }
  const PagesMineMine = /* @__PURE__ */ _export_sfc(_sfc_main$N, [["render", _sfc_render$M], ["__scopeId", "data-v-7c2ebfa5"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/mine/mine.vue"]]);
  const _sfc_main$M = {
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
  function _sfc_render$L(_ctx, _cache, $props, $setup, $data, $options) {
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
  const PagesWatchDemoWatchDemo = /* @__PURE__ */ _export_sfc(_sfc_main$M, [["render", _sfc_render$L], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/watch_demo/watch_demo.vue"]]);
  const _sfc_main$L = {
    __name: "item-impression",
    props: {
      target_id: {
        type: String,
        required: true
      },
      type: {
        type: String,
        required: true
      },
      goodsType: {
        type: Number,
        required: true
      }
    },
    setup(__props, { expose: __expose }) {
      __expose();
      const props = __props;
      const impressions = vue.ref([]);
      const defaultImpressionTitles = vue.ref([]);
      const totalCount = vue.ref(0);
      const newImpression = vue.ref("");
      const modalVisible = vue.ref(false);
      const userInfo = vue.ref(null);
      const allImpressions = vue.computed(() => {
        const existingMap = {};
        impressions.value.forEach((item) => {
          existingMap[item.content] = item;
        });
        const defaultItems = defaultImpressionTitles.value.map((title) => {
          if (existingMap[title]) {
            return {
              ...existingMap[title],
              isDefault: true
            };
          }
          return {
            content: title,
            count: 0,
            selected: false,
            isDefault: true
          };
        });
        const uniqueExisting = impressions.value.filter(
          (item) => !defaultImpressionTitles.value.includes(item.content)
        );
        const merged = [...defaultItems, ...uniqueExisting];
        return merged.sort((a2, b2) => b2.count - a2.count);
      });
      const fetchDefaultImpressions = async () => {
        try {
          let impressionType = 9;
          switch (props.goodsType) {
            case "整体":
              impressionType = 1;
              break;
            case "单头":
              impressionType = 2;
              break;
            case "娃衣":
              impressionType = 3;
              break;
            case "眼珠":
              impressionType = 4;
              break;
            case "假发":
              impressionType = 5;
              break;
            default:
              impressionType = 9;
          }
          const res = await uni.request({
            url: `${websiteUrl}/impression/default`,
            method: "GET",
            data: {
              type: impressionType
            }
          });
          if (res.statusCode === 200 && res.data.status === "success") {
            defaultImpressionTitles.value = res.data.data;
          } else {
            formatAppLog("error", "at components/item-impression/item-impression.vue:160", "获取默认表态失败:", res.data);
            uni.showToast({
              title: "获取默认表态失败",
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("error", "at components/item-impression/item-impression.vue:167", "获取默认表态失败:", error);
          uni.showToast({
            title: "获取默认表态失败",
            icon: "none"
          });
        }
      };
      const fetchImpressionData = async () => {
        try {
          userInfo.value = await asyncGetUserInfo();
          const countsRes = await uni.request({
            url: `${websiteUrl}/impression/counts`,
            method: "GET",
            data: {
              target_id: parseInt(props.target_id, 10),
              type_id: parseInt(props.type, 10)
            }
          });
          const statusRes = await uni.request({
            url: `${websiteUrl}/with-state/impression/status`,
            method: "GET",
            data: {
              target_id: parseInt(props.target_id, 10),
              type_id: parseInt(props.type, 10)
            },
            header: {
              Authorization: uni.getStorageSync("token")
            }
          });
          if (countsRes.statusCode === 200 && countsRes.data.status === "success") {
            const countsData = countsRes.data.data;
            totalCount.value = countsData.reduce((sum, item) => sum + item.count, 0);
            const userSelected = statusRes.statusCode === 200 && statusRes.data.status === "success" ? statusRes.data.data.map((item) => item.id) : [];
            impressions.value = countsData.map((item) => ({
              ...item,
              selected: userSelected.includes(item.id)
            }));
          }
        } catch (error) {
          formatAppLog("error", "at components/item-impression/item-impression.vue:222", "获取表态数据失败:", error);
          uni.showToast({
            title: "获取表态数据失败",
            icon: "none"
          });
        }
      };
      const handleImpressionClick = async (item) => {
        if (!userInfo.value) {
          uni.showToast({
            title: "请先登录",
            icon: "none"
          });
          return;
        }
        try {
          const data = {
            target_id: parseInt(props.target_id, 10),
            type_id: parseInt(props.type, 10)
          };
          if (item.isDefault && !item.id) {
            data.content = item.content;
          } else {
            data.impression_id = item.id;
          }
          if (item.selected) {
            const res = await uni.request({
              url: `${websiteUrl}/with-state/impression/remove`,
              method: "POST",
              header: {
                Authorization: uni.getStorageSync("token"),
                "Content-Type": "application/json"
              },
              data: {
                impression_id: item.id
              }
            });
            if (res.statusCode === 200 && res.data.status === "success") {
              updateImpressionState(item, false);
            }
          } else {
            const res = await uni.request({
              url: `${websiteUrl}/with-state/impression/add`,
              method: "POST",
              header: {
                Authorization: uni.getStorageSync("token"),
                "Content-Type": "application/json"
              },
              data
            });
            if (res.statusCode === 200 && res.data.status === "success") {
              updateImpressionState(item, true, res.data.data.impression_id);
            }
          }
        } catch (error) {
          formatAppLog("error", "at components/item-impression/item-impression.vue:291", "操作失败:", error);
          uni.showToast({
            title: "操作失败",
            icon: "none"
          });
        }
      };
      const updateImpressionState = (item, isSelected, newId = null) => {
        const impressionIndex = impressions.value.findIndex(
          (imp) => imp.id === item.id || imp.content === item.content
        );
        if (impressionIndex === -1 && isSelected) {
          const newImpression2 = {
            id: newId,
            content: item.content,
            count: 1,
            selected: true
          };
          impressions.value = [...impressions.value, newImpression2];
          totalCount.value++;
          return;
        }
        if (impressionIndex !== -1) {
          const updatedImpressions = [...impressions.value];
          const updatedItem = { ...updatedImpressions[impressionIndex] };
          if (isSelected) {
            updatedItem.selected = true;
            updatedItem.count = (updatedItem.count || 0) + 1;
            if (newId)
              updatedItem.id = newId;
            totalCount.value++;
          } else {
            updatedItem.selected = false;
            updatedItem.count = Math.max(0, updatedItem.count - 1);
            totalCount.value--;
          }
          updatedImpressions[impressionIndex] = updatedItem;
          impressions.value = updatedImpressions;
        }
      };
      const showAddModal = () => {
        if (!userInfo.value) {
          uni.showToast({
            title: "请先登录",
            icon: "none"
          });
          return;
        }
        newImpression.value = "";
        modalVisible.value = true;
      };
      const cancelAdd = () => {
        modalVisible.value = false;
      };
      const confirmAdd = async () => {
        if (!newImpression.value.trim()) {
          uni.showToast({
            title: "请输入表态内容",
            icon: "none"
          });
          return;
        }
        try {
          const res = await uni.request({
            url: `${websiteUrl}/with-state/impression/add`,
            method: "POST",
            header: {
              Authorization: uni.getStorageSync("token"),
              "Content-Type": "application/json"
            },
            data: {
              target_id: parseInt(props.target_id, 10),
              type_id: parseInt(props.type, 10),
              content: newImpression.value.trim()
            }
          });
          if (res.statusCode === 200 && res.data.status === "success") {
            impressions.value = [
              ...impressions.value,
              {
                id: res.data.data.impression_id,
                content: newImpression.value.trim(),
                count: 1,
                selected: true
              }
            ];
            totalCount.value++;
            modalVisible.value = false;
            uni.showToast({
              title: "添加成功",
              icon: "success"
            });
          }
        } catch (error) {
          formatAppLog("error", "at components/item-impression/item-impression.vue:411", "添加表态失败:", error);
          uni.showToast({
            title: "添加表态失败",
            icon: "none"
          });
        }
      };
      vue.watch(() => [props.target_id, props.type], fetchImpressionData, {
        immediate: true
      });
      vue.onMounted(() => {
        fetchDefaultImpressions();
        fetchImpressionData();
      });
      const __returned__ = { props, impressions, defaultImpressionTitles, totalCount, newImpression, modalVisible, userInfo, allImpressions, fetchDefaultImpressions, fetchImpressionData, handleImpressionClick, updateImpressionState, showAddModal, cancelAdd, confirmAdd, ref: vue.ref, onMounted: vue.onMounted, watch: vue.watch, computed: vue.computed, get websiteUrl() {
        return websiteUrl;
      }, get asyncGetUserInfo() {
        return asyncGetUserInfo;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$K(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_common_modal = resolveEasycom(vue.resolveDynamicComponent("common-modal"), __easycom_3$2);
    return vue.openBlock(), vue.createElementBlock(
      vue.Fragment,
      null,
      [
        vue.createCommentVNode(" 表态组件主容器 "),
        vue.createElementVNode("view", { class: "impression-container" }, [
          vue.createCommentVNode(" 标题区域 "),
          vue.createElementVNode("view", { class: "impression-header" }, [
            vue.createElementVNode("text", { class: "title" }, "你对它的印象怎样？"),
            vue.createElementVNode("text", { class: "subtitle" }, "（轻触表态）"),
            vue.createCommentVNode(' <text class="subtitle">({{ totalCount }}条表态)</text> ')
          ]),
          vue.createCommentVNode(" 表态列表区域 - 换行布局 "),
          vue.createElementVNode("view", { class: "impression-list" }, [
            vue.createCommentVNode(" 所有表态项 "),
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.allImpressions, (item, index) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: item.id || "default-" + item.content,
                  class: vue.normalizeClass(["impression-item", { "active": item.selected }]),
                  onClick: ($event) => $setup.handleImpressionClick(item)
                }, [
                  vue.createElementVNode(
                    "text",
                    { class: "impression-text" },
                    vue.toDisplayString(item.content),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "impression-count" },
                    vue.toDisplayString(item.count),
                    1
                    /* TEXT */
                  )
                ], 10, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            )),
            vue.createCommentVNode(" 添加新表态按钮 "),
            vue.createElementVNode("view", {
              class: "add-impression",
              onClick: $setup.showAddModal
            }, [
              vue.createElementVNode("text", { class: "plus-icon" }, "+"),
              vue.createElementVNode("text", { class: "add-text" }, "添加表态")
            ])
          ]),
          vue.createCommentVNode(" 添加新表态模态框 "),
          vue.createVNode(_component_common_modal, {
            visible: $setup.modalVisible,
            "onUpdate:visible": _cache[1] || (_cache[1] = ($event) => $setup.modalVisible = $event),
            width: "80%",
            top: "30%"
          }, {
            default: vue.withCtx(() => [
              vue.createElementVNode("view", { class: "modal-content" }, [
                vue.createElementVNode("text", { class: "modal-title" }, "添加新表态"),
                vue.withDirectives(vue.createElementVNode(
                  "input",
                  {
                    class: "input-field",
                    "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.newImpression = $event),
                    placeholder: "请输入表态内容",
                    "placeholder-style": "color: #aaa;",
                    onConfirm: $setup.confirmAdd
                  },
                  null,
                  544
                  /* NEED_HYDRATION, NEED_PATCH */
                ), [
                  [vue.vModelText, $setup.newImpression]
                ]),
                vue.createElementVNode("view", { class: "modal-actions" }, [
                  vue.createElementVNode("button", {
                    class: "cancel-btn",
                    onClick: $setup.cancelAdd
                  }, "取消"),
                  vue.createElementVNode("button", {
                    class: "confirm-btn",
                    onClick: $setup.confirmAdd
                  }, "确定")
                ])
              ])
            ]),
            _: 1
            /* STABLE */
          }, 8, ["visible"])
        ])
      ],
      2112
      /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
    );
  }
  const __easycom_1$3 = /* @__PURE__ */ _export_sfc(_sfc_main$L, [["render", _sfc_render$K], ["__scopeId", "data-v-883b6a8c"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/components/item-impression/item-impression.vue"]]);
  const _sfc_main$K = {
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
        attitudeTypes.value.forEach((t2) => {
          currentCounts.value[t2.value] = Number(newVal[t2.value] ?? 0);
        });
        currentCounts.value = {
          ...currentCounts.value
        };
      }, {
        immediate: true,
        deep: true
      });
      const visibleGlobalCounts = vue.computed(() => {
        return attitudeTypes.value.map((t2) => ({
          ...t2,
          count: currentCounts.value[t2.value] || 0
        })).filter((t2) => t2.count > 0 || t2.value === currentStatus.value).filter((t2) => t2.count > 0);
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
  function _sfc_render$J(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$b);
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
  const __easycom_0$8 = /* @__PURE__ */ _export_sfc(_sfc_main$K, [["render", _sfc_render$J], ["__scopeId", "data-v-f15d1ff3"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/components/attitude-widget/attitude-widget.vue"]]);
  const _sfc_main$J = {
    __name: "report-button",
    props: {
      // 举报类型（1=展示柜,2=搭配,3=树洞发帖,4=用户，5=回帖）
      reportType: {
        type: Number,
        required: true
      },
      // 关联ID（被举报内容的ID）
      relationId: {
        type: Number,
        required: true
      },
      // 按钮文本
      buttonText: {
        type: String,
        default: "举报"
      },
      // 图标类型
      iconType: {
        type: String,
        default: ""
      },
      // 图标大小
      iconSize: {
        type: Number,
        default: 24
      },
      // 图标颜色
      iconColor: {
        type: String,
        default: "#999"
      },
      // 主题颜色
      themeColor: {
        type: String,
        default: "#64c6dc"
      },
      // 是否自动聚焦文本输入框
      autoFocus: {
        type: Boolean,
        default: false
      }
    },
    emits: ["success", "error", "cancel", "before-submit"],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const props = __props;
      const emit = __emit;
      const reportVisible = vue.ref(false);
      const reportReasons = vue.ref([]);
      const selectedReason = vue.ref("");
      const reportDetails = vue.ref("");
      const isSubmitting = vue.ref(false);
      const selectReason = (reason) => {
        if (selectedReason.value === reason) {
          selectedReason.value = "";
        } else {
          selectedReason.value = reason;
        }
      };
      const fetchReportReasons = async () => {
        try {
          const token = uni.getStorageSync("token");
          const res = await uni.request({
            url: `${websiteUrl}/report/reasons?type=${props.reportType}`,
            method: "GET",
            header: {
              "Authorization": token
            }
          });
          if (res.data.status === "success") {
            reportReasons.value = res.data.data;
            return true;
          } else {
            uni.showToast({
              title: "获取举报原因失败: " + (res.data.msg || ""),
              icon: "none"
            });
            return false;
          }
        } catch (error) {
          uni.showToast({
            title: "网络请求失败",
            icon: "none"
          });
          return false;
        }
      };
      const handleClick = async () => {
        const success = await fetchReportReasons();
        if (!success)
          return;
        selectedReason.value = "";
        reportDetails.value = "";
        reportVisible.value = true;
      };
      const submitReport = async () => {
        if (isSubmitting.value)
          return;
        isSubmitting.value = true;
        try {
          if (!selectedReason.value) {
            uni.showToast({
              title: "请选择举报原因",
              icon: "none"
            });
            return;
          }
          emit("before-submit", {
            type: props.reportType,
            relationId: props.relationId,
            reason: selectedReason.value,
            details: reportDetails.value
          });
          const token = uni.getStorageSync("token");
          const reportData = {
            type: props.reportType,
            relation_id: props.relationId,
            reason: selectedReason.value,
            details: reportDetails.value
          };
          let url = `${websiteUrl}/with-state/report/submit`;
          if (token == "") {
            url = `${websiteUrl}/report/submit`;
          }
          const res = await uni.request({
            url,
            method: "POST",
            header: {
              "Authorization": token,
              "Content-Type": "application/json"
            },
            data: reportData,
            timeout: 1e4
            // 10秒超时
          });
          if (res.data.status === "success") {
            uni.showToast({
              title: "举报提交成功",
              icon: "success",
              duration: 2e3
            });
            reportVisible.value = false;
            emit("success", res.data);
          } else {
            uni.showToast({
              title: res.data.msg || "举报提交失败",
              icon: "none"
            });
            emit("error", res.data);
          }
        } catch (error) {
          uni.showToast({
            title: "举报提交失败: " + (error.errMsg || "网络错误"),
            icon: "none"
          });
          emit("error", error);
        } finally {
          isSubmitting.value = false;
        }
      };
      vue.watch(reportVisible, (newVal) => {
        if (!newVal) {
          emit("cancel");
        }
      });
      const __returned__ = { props, emit, reportVisible, reportReasons, selectedReason, reportDetails, isSubmitting, selectReason, fetchReportReasons, handleClick, submitReport, ref: vue.ref, computed: vue.computed, watch: vue.watch, get websiteUrl() {
        return websiteUrl;
      }, get global() {
        return global$1;
      }, get asyncGetUserInfo() {
        return asyncGetUserInfo;
      }, get wechatSignLogin() {
        return wechatSignLogin;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$I(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$b);
    const _component_common_modal = resolveEasycom(vue.resolveDynamicComponent("common-modal"), __easycom_3$2);
    return vue.openBlock(), vue.createElementBlock(
      vue.Fragment,
      null,
      [
        vue.createCommentVNode(" 举报按钮 - 横向布局 "),
        vue.createElementVNode("view", {
          class: "report-button",
          onClick: $setup.handleClick
        }, [
          vue.renderSlot(_ctx.$slots, "default", {}, () => [
            vue.createElementVNode("view", { class: "default-button horizontal" }, [
              vue.createVNode(_component_uni_icons, {
                "v-if": $props.iconType !== "",
                type: $props.iconType,
                size: $props.iconSize,
                color: $props.iconColor
              }, null, 8, ["v-if", "type", "size", "color"]),
              vue.createElementVNode(
                "text",
                { class: "button-text" },
                vue.toDisplayString($props.buttonText),
                1
                /* TEXT */
              )
            ])
          ], true)
        ]),
        vue.createCommentVNode(" 举报弹窗 "),
        vue.createVNode(_component_common_modal, {
          visible: $setup.reportVisible,
          "onUpdate:visible": _cache[3] || (_cache[3] = (val) => $setup.reportVisible = val),
          top: "10vh"
        }, {
          default: vue.withCtx(() => [
            vue.createElementVNode("view", { class: "report-dialog" }, [
              vue.createElementVNode("view", { class: "dialog-header" }, [
                vue.createElementVNode("text", { class: "dialog-title" }, "举报内容"),
                vue.createVNode(_component_uni_icons, {
                  type: "closeempty",
                  size: "24",
                  color: "#999",
                  onClick: _cache[0] || (_cache[0] = ($event) => $setup.reportVisible = false)
                })
              ]),
              vue.createElementVNode("view", { class: "reason-list" }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.reportReasons, (reason) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      key: reason.id,
                      class: vue.normalizeClass(["reason-item", { "selected": $setup.selectedReason === reason.label }]),
                      onClick: ($event) => $setup.selectReason(reason.label)
                    }, [
                      vue.createElementVNode("radio", {
                        value: reason.label,
                        checked: $setup.selectedReason === reason.label,
                        color: $props.themeColor
                      }, null, 8, ["value", "checked", "color"]),
                      vue.createElementVNode(
                        "text",
                        { class: "reason-label" },
                        vue.toDisplayString(reason.label),
                        1
                        /* TEXT */
                      )
                    ], 10, ["onClick"]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ]),
              vue.createElementVNode("view", { class: "details-box" }, [
                vue.withDirectives(vue.createElementVNode("textarea", {
                  "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.reportDetails = $event),
                  placeholder: "请详细描述举报原因（选填）",
                  class: "details-input",
                  maxlength: "200",
                  focus: $props.autoFocus
                }, null, 8, ["focus"]), [
                  [vue.vModelText, $setup.reportDetails]
                ]),
                vue.createElementVNode(
                  "text",
                  { class: "word-count" },
                  vue.toDisplayString($setup.reportDetails.length) + "/200",
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "button-group" }, [
                vue.createElementVNode("button", {
                  class: "cancel-btn",
                  onClick: _cache[2] || (_cache[2] = ($event) => $setup.reportVisible = false)
                }, "取消"),
                vue.createElementVNode(
                  "button",
                  {
                    class: "submit-btn",
                    onClick: $setup.submitReport,
                    style: vue.normalizeStyle({ backgroundColor: $props.themeColor })
                  },
                  "提交举报",
                  4
                  /* STYLE */
                )
              ])
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["visible"])
      ],
      64
      /* STABLE_FRAGMENT */
    );
  }
  const __easycom_0$7 = /* @__PURE__ */ _export_sfc(_sfc_main$J, [["render", _sfc_render$I], ["__scopeId", "data-v-b620d6d3"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/components/report-button/report-button.vue"]]);
  const _sfc_main$I = {
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
          const parent = commentList.value.find((c2) => c2.id === reply.parent_id);
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
        if (!global$1.isLogin) {
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
          formatAppLog("error", "at components/comment-list/comment-list.vue:287", "点赞失败:", err);
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
            const newComments = data.comment_list.map((c2) => ({
              ...c2,
              showAll: false,
              localChildren: c2.children || [],
              childTotal: c2.childTotal || (c2.children ? c2.children.length : 0),
              // 新增表态相关字段
              attitudeStatus: c2.user_attitude || 0,
              // 当前用户表态状态
              attitudeCounts: c2.attitude_counts || {
                1: c2.count_1 || 0,
                2: c2.count_2 || 0,
                3: c2.count_3 || 0,
                4: c2.count_4 || 0,
                5: c2.count_5 || 0
              }
            }));
            if (currentPage.value === 1) {
              commentList.value = newComments;
            } else {
              commentList.value.push(...newComments);
            }
            formatAppLog("log", "at components/comment-list/comment-list.vue:352", "total", data.total);
            hasMore.value = data.total > commentList.value.length;
            mainCommentsTotal.value = data.total;
            formatAppLog("log", "at components/comment-list/comment-list.vue:356", "是否还有更多?", hasMore.value);
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
        return global$1;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$H(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_attitude_widget = resolveEasycom(vue.resolveDynamicComponent("attitude-widget"), __easycom_0$8);
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$b);
    const _component_report_button = resolveEasycom(vue.resolveDynamicComponent("report-button"), __easycom_0$7);
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
                    }, "回复", 8, ["onClick"]),
                    vue.createVNode(_component_report_button, {
                      "report-type": 5,
                      "relation-id": comment2.id,
                      "button-text": "举报",
                      "icon-color": "#999",
                      "theme-color": "#64c6dc",
                      "icon-size": "20"
                    }, null, 8, ["relation-id"])
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
                          }, "回复", 8, ["onClick"]),
                          vue.createVNode(_component_report_button, {
                            "report-type": 5,
                            "relation-id": child.id,
                            "button-text": "举报",
                            "icon-color": "#999",
                            "theme-color": "#64c6dc",
                            "icon-size": "20"
                          }, null, 8, ["relation-id"])
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
  const __easycom_1$2 = /* @__PURE__ */ _export_sfc(_sfc_main$I, [["render", _sfc_render$H], ["__scopeId", "data-v-ea2f609f"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/components/comment-list/comment-list.vue"]]);
  const _sfc_main$H = {
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
        formatAppLog("log", "at components/comment-input/comment-input.vue:61", "底部安全距离1:", (_b = systemInfo2.safeAreaInsets) == null ? void 0 : _b.bottom, "=>", safeBottomVar);
        let safeBottom = safeBottomVar + keyboardHeight.value;
        formatAppLog("log", "at components/comment-input/comment-input.vue:64", "底部最终距离2:", safeBottom);
        return `${safeBottom}px`;
      });
      const keyboardHeightChangeHandler2 = (res) => {
        formatAppLog("log", "at components/comment-input/comment-input.vue:69", "键盘高度变化", res);
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
        formatAppLog("log", "at components/comment-input/comment-input.vue:98", "scene", scene);
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
      vue.onMounted(() => {
        formatAppLog("log", "at components/comment-input/comment-input.vue:127", "注册键盘弹出事件");
        uni.onKeyboardHeightChange(keyboardHeightChangeHandler2);
      });
      const __returned__ = { props, inputRef, isFocused, emit, instance, commentText, displayMask, keyboardHeight, systemInfo: systemInfo2, footerBottomHeight, keyboardHeightChangeHandler: keyboardHeightChangeHandler2, handleFocus, handleBlur, handleMaskTap, handleSubmit, focusInput, ref: vue.ref, computed: vue.computed, getCurrentInstance: vue.getCurrentInstance, onMounted: vue.onMounted, get onLoad() {
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
  function _sfc_render$G(_ctx, _cache, $props, $setup, $data, $options) {
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
  const __easycom_2 = /* @__PURE__ */ _export_sfc(_sfc_main$H, [["render", _sfc_render$G], ["__scopeId", "data-v-88f35a0c"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/components/comment-input/comment-input.vue"]]);
  const _imports_2 = "/static/right2.png";
  const _imports_1$2 = "/static/paper_plane.png";
  const _sfc_main$G = {
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
        formatAppLog("log", "at pages/goods/goods.vue:244", "parent", parent);
        formatAppLog("log", "at pages/goods/goods.vue:245", "target", target);
        let item = parent;
        if (target != null) {
          item = target;
        }
        if (replyForItem.value.id == item.id) {
          replyForItem.value = {};
          return;
        }
        formatAppLog("log", "at pages/goods/goods.vue:256", "item", item);
        replyForItem.value = item;
        (_a = commentInputRef.value) == null ? void 0 : _a.focusInput();
      };
      const handleCommentSubmit = ({
        content,
        replyInfo,
        origin
      }) => {
        let token = uni.getStorageSync("token");
        if (!global$1.isLogin) {
          uni.showToast({
            title: "请先登录",
            icon: "none"
          });
          return;
        }
        formatAppLog("log", "at pages/goods/goods.vue:274", "reply_info", replyInfo);
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
          formatAppLog("log", "at pages/goods/goods.vue:332", "分享成功", res);
        },
        fail(err) {
          formatAppLog("log", "at pages/goods/goods.vue:335", "分享失败", err);
        },
        mp: {
          wxpath: "/pages/index/index.html"
        }
      });
      function onImageLoad(index) {
        formatAppLog("log", "at pages/goods/goods.vue:345", "图片加载完成", index);
        const query = uni.createSelectorQuery();
        setTimeout(() => {
          query.select(`.swiper-image-${index}`).boundingClientRect((rect) => {
            try {
              if (!rect) {
                formatAppLog("warn", "at pages/goods/goods.vue:352", "未找到图片元素");
                return;
              }
              formatAppLog("log", "at pages/goods/goods.vue:355", rect);
              imageHeights.value[index] = rect.height;
              const validHeights = imageHeights.value.filter((h2) => h2 > 0);
              if (validHeights.length === 0)
                return;
              swiperHeight.value = Math.max(...validHeights);
            } catch (e2) {
              formatAppLog("error", "at pages/goods/goods.vue:361", "高度计算异常:", e2);
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
      function onChange(e2) {
        formatAppLog("log", "at pages/goods/goods.vue:379", e2.detail.current);
        swiperIndex.value = e2.detail.current + 1;
      }
      function getGoods() {
        uni.request({
          url: websiteUrl + "/goods?id=" + props.goods_id,
          method: "GET",
          timeout: 5e3,
          success: (res) => {
            formatAppLog("log", "at pages/goods/goods.vue:389", res.data.data);
            goods2.value = res.data.data;
          },
          fail: (err) => {
            formatAppLog("log", "at pages/goods/goods.vue:393", err);
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
        if (!timestamp || timestamp <= 0)
          return "未知";
        const date = new Date(timestamp * 1e3);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
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
        if (!global$1.isLogin) {
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
            formatAppLog("log", "at pages/goods/goods.vue:463", res.data);
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
            formatAppLog("log", "at pages/goods/goods.vue:482", err);
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
            formatAppLog("log", "at pages/goods/goods.vue:504", res.data);
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
            formatAppLog("log", "at pages/goods/goods.vue:522", err);
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
            formatAppLog("log", "at pages/goods/goods.vue:553", res.data.data);
            collocationList.value = res.data.data;
          },
          fail: (err) => {
            formatAppLog("log", "at pages/goods/goods.vue:557", err);
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
        formatAppLog("log", "at pages/goods/goods.vue:596", userInfo);
        getHasLike();
      });
      const __returned__ = { props, systemInfo: systemInfo2, loading, error, errorMsg, commentListRef, commentInputRef, get commentsPage() {
        return commentsPage;
      }, set commentsPage(v2) {
        commentsPage = v2;
      }, get replyForItem() {
        return replyForItem;
      }, set replyForItem(v2) {
        replyForItem = v2;
      }, get goods() {
        return goods2;
      }, set goods(v2) {
        goods2 = v2;
      }, get swiperIndex() {
        return swiperIndex;
      }, set swiperIndex(v2) {
        swiperIndex = v2;
      }, get hasLike() {
        return hasLike;
      }, set hasLike(v2) {
        hasLike = v2;
      }, get collocationList() {
        return collocationList;
      }, set collocationList(v2) {
        collocationList = v2;
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
        return global$1;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$F(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$b);
    const _component_item_impression = resolveEasycom(vue.resolveDynamicComponent("item-impression"), __easycom_1$3);
    const _component_comment_list = resolveEasycom(vue.resolveDynamicComponent("comment-list"), __easycom_1$2);
    const _component_comment_input = resolveEasycom(vue.resolveDynamicComponent("comment-input"), __easycom_2);
    return $setup.goods.name ? (vue.openBlock(), vue.createElementBlock("view", {
      key: 0,
      class: "goods-detail-container"
    }, [
      vue.createElementVNode("meta", {
        name: "theme-color",
        content: "#F8F8F8"
      }),
      vue.createCommentVNode(" 轮播图部分 "),
      vue.createElementVNode("view", { class: "swiper-container" }, [
        vue.createElementVNode("view", {
          class: "heart",
          onClick: _cache[0] || (_cache[0] = ($event) => $setup.likeFn())
        }, [
          vue.createVNode(_component_uni_icons, {
            type: $setup.hasLike ? "heart-filled" : "heart",
            size: "28",
            color: "#ff4d4f"
          }, null, 8, ["type"]),
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
            class: "banner-swiper",
            style: vue.normalizeStyle({ height: $setup.swiperHeight + "px" })
          },
          [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.goods.goods_images, (item, key) => {
                return vue.openBlock(), vue.createElementBlock("swiper-item", {
                  key,
                  class: "swiper-item-container"
                }, [
                  vue.createElementVNode("view", { class: "swiper-item" }, [
                    vue.createElementVNode("image", {
                      src: item,
                      mode: "widthFix",
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
        vue.createElementVNode("view", { class: "swiper-index" }, [
          vue.createElementVNode(
            "text",
            null,
            vue.toDisplayString($setup.swiperIndex) + " / " + vue.toDisplayString($setup.goods.goods_images.length),
            1
            /* TEXT */
          )
        ])
      ]),
      vue.createCommentVNode(" 商品基本信息 "),
      vue.createElementVNode("view", { class: "goods-info" }, [
        vue.createElementVNode("view", { class: "info-item" }, [
          vue.createElementVNode("text", { class: "label" }, "名称"),
          vue.createCommentVNode(' <text class="value">{{goods.name}}</text> '),
          vue.createElementVNode("image", {
            src: $setup.goods.goods_name_image,
            mode: "heightFix",
            style: { "height": "40rpx" }
          }, null, 8, ["src"])
        ]),
        vue.createElementVNode("view", { class: "info-item" }, [
          vue.createElementVNode("text", { class: "label" }, "类型"),
          vue.createElementVNode(
            "text",
            { class: "value" },
            vue.toDisplayString($setup.goods.type),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "info-item" }, [
          vue.createElementVNode("text", { class: "label" }, "初贩定价"),
          vue.createCommentVNode(' <text class="value" v-if="goods.total_amount">{{goods.total_amount + " " + goods.currency}}</text> '),
          $setup.goods.goods_price_image ? (vue.openBlock(), vue.createElementBlock("image", {
            key: 0,
            src: $setup.goods.goods_price_image,
            mode: "heightFix",
            style: { "height": "40rpx" }
          }, null, 8, ["src"])) : $setup.goods.goods_sales && $setup.goods.goods_sales.length > 0 ? (vue.openBlock(), vue.createElementBlock(
            "text",
            {
              key: 1,
              class: "value"
            },
            vue.toDisplayString($setup.goods.goods_sales[0].sub_amount + $setup.goods.goods_sales[0].fin_amount) + " " + vue.toDisplayString($setup.goods.goods_sales[0].currency),
            1
            /* TEXT */
          )) : (vue.openBlock(), vue.createElementBlock("text", {
            key: 2,
            class: "value"
          }, "未知"))
        ]),
        vue.createElementVNode("view", { class: "info-item" }, [
          vue.createElementVNode("text", { class: "label" }, "初贩时间"),
          vue.createElementVNode(
            "text",
            { class: "value" },
            vue.toDisplayString($setup.goods.sub_time1 > 0 ? $setup.formatTimestamp($setup.goods.sub_time1) : "未知"),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "info-item" }, [
          vue.createElementVNode("text", { class: "label" }, "尺寸"),
          vue.createElementVNode(
            "text",
            { class: "value" },
            vue.toDisplayString($setup.goods.size) + " / " + vue.toDisplayString($setup.goods.size_detail),
            1
            /* TEXT */
          )
        ]),
        $setup.goods.type === "单体" || $setup.goods.type === "整体" || $setup.goods.type === "单头" ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "info-item"
        }, [
          vue.createElementVNode("text", { class: "label" }, "可选体型"),
          vue.createElementVNode(
            "text",
            { class: "value" },
            vue.toDisplayString($setup.goods.body_size || "未知"),
            1
            /* TEXT */
          )
        ])) : vue.createCommentVNode("v-if", true),
        vue.createElementVNode("view", { class: "info-item" }, [
          vue.createElementVNode("text", { class: "label" }, "可选颜色"),
          vue.createElementVNode(
            "text",
            { class: "value" },
            vue.toDisplayString($setup.goods.skin),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "info-item" }, [
          vue.createElementVNode("text", { class: "label" }, "制作方"),
          $setup.goods.goods_brand_name_image ? (vue.openBlock(), vue.createElementBlock("image", {
            key: 0,
            onClick: _cache[1] || (_cache[1] = ($event) => $setup.jumpBrand($setup.goods.brand_id)),
            src: $setup.goods.goods_brand_name_image,
            mode: "heightFix",
            style: { "height": "40rpx" }
          }, null, 8, ["src"])) : vue.createCommentVNode("v-if", true)
        ]),
        vue.createElementVNode("view", { class: "info-item" }, [
          vue.createElementVNode("text", { class: "label" }, "备注"),
          vue.createElementVNode(
            "text",
            { class: "value" },
            vue.toDisplayString($setup.goods.desc_content || "暂无备注信息"),
            1
            /* TEXT */
          )
        ])
      ]),
      vue.createCommentVNode(" 贩售情报 "),
      $setup.goods.goods_sales && $setup.goods.goods_sales.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "sales-info"
      }, [
        vue.createElementVNode("text", { class: "section-title" }, "贩售情报"),
        vue.createElementVNode("view", { class: "sales-list" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.goods.goods_sales, (sale, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: sale.id,
                class: "sale-item"
              }, [
                vue.createElementVNode("view", { class: "sale-header" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "sale-type" },
                    vue.toDisplayString(sale.sale_type),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "sale-price" },
                    vue.toDisplayString(sale.sub_amount + sale.fin_amount) + " " + vue.toDisplayString(sale.currency),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "sale-period" }, [
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString($setup.formatTimestamp(sale.sub_time)),
                    1
                    /* TEXT */
                  ),
                  sale.sub_time_end > 0 ? (vue.openBlock(), vue.createElementBlock("text", {
                    key: 0,
                    class: "separator"
                  }, "至")) : vue.createCommentVNode("v-if", true),
                  sale.sub_time_end > 0 ? (vue.openBlock(), vue.createElementBlock(
                    "text",
                    { key: 1 },
                    vue.toDisplayString($setup.formatTimestamp(sale.sub_time_end)),
                    1
                    /* TEXT */
                  )) : (vue.openBlock(), vue.createElementBlock("text", {
                    key: 2,
                    class: "separator"
                  }, "开定"))
                ]),
                vue.createElementVNode("view", { class: "sale-size" }, [
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString(sale.size) + " · " + vue.toDisplayString(sale.size_detail),
                    1
                    /* TEXT */
                  )
                ])
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])) : (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "no-sales"
      }, [
        vue.createElementVNode("text", { class: "section-title" }, "贩售情报"),
        vue.createElementVNode("text", { class: "empty-text" }, "暂无贩售信息")
      ])),
      vue.createCommentVNode(" 表态组件 "),
      vue.createVNode(_component_item_impression, {
        target_id: $setup.props.goods_id,
        type: "2",
        "goods-type": $setup.goods.type
      }, null, 8, ["target_id", "goods-type"]),
      vue.createCommentVNode(" 搭配参考 "),
      vue.createElementVNode("view", { class: "collocation-section" }, [
        vue.createElementVNode("view", { class: "section-header" }, [
          vue.createElementVNode("text", { class: "section-title" }, "搭配参考"),
          vue.createElementVNode("view", {
            class: "more-link",
            onClick: $setup.jump2collocation
          }, [
            vue.createElementVNode("text", null, "查看更多"),
            vue.createElementVNode("image", { src: _imports_2 })
          ])
        ]),
        vue.createElementVNode("scroll-view", {
          "scroll-x": "true",
          class: "collocation-list"
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.collocationList.collocation_relation_list, (collocation) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: collocation.collocation_id,
                class: "collocation-item",
                onClick: ($event) => $setup.jump2collectionDetail(collocation.collocation_id, collocation.relation_origin)
              }, [
                vue.createElementVNode("image", {
                  src: $setup.getImageForList(collocation.image_urls),
                  mode: "aspectFill"
                }, null, 8, ["src"])
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        vue.createElementVNode("view", {
          onClick: $setup.jump2collocation,
          class: "upload-collocation"
        }, [
          vue.createElementVNode("image", { src: _imports_1$2 }),
          vue.createElementVNode("text", null, "上传搭配参考帮助他人")
        ])
      ]),
      vue.createCommentVNode(" 评论区 "),
      vue.createElementVNode("view", { class: "comment-section" }, [
        vue.createVNode(_component_comment_list, {
          ref: "commentListRef",
          type: 2,
          "relation-id": parseInt($setup.props.goods_id),
          onReply: $setup.handleReplyComment
        }, null, 8, ["relation-id"])
      ]),
      vue.createCommentVNode(" 输入框 "),
      vue.createVNode(_component_comment_input, {
        ref: "commentInputRef",
        "reply-info": $setup.replyForItem,
        "target-id": $setup.props.goods_id,
        onSubmit: $setup.handleCommentSubmit,
        "onUpdate:replyInfo": _cache[2] || (_cache[2] = (val) => $setup.replyForItem = val)
      }, null, 8, ["reply-info", "target-id"]),
      vue.createCommentVNode(" 底部占位 "),
      vue.createElementVNode("view", { class: "bottom-placeholder" })
    ])) : vue.createCommentVNode("v-if", true);
  }
  const PagesGoodsGoods = /* @__PURE__ */ _export_sfc(_sfc_main$G, [["render", _sfc_render$F], ["__scopeId", "data-v-7e2880f6"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/goods/goods.vue"]]);
  const _sfc_main$F = {
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
        for (let i2 = 0; i2 < this.max; i2++) {
          if (floorValue > i2) {
            starList.push({
              activeWitch: "100%"
            });
          } else if (ceilValue - 1 === i2) {
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
      touchstart(e2) {
        if (this.readonly || this.disabled)
          return;
        const {
          clientX,
          screenX
        } = e2.changedTouches[0];
        this._getRateCount(clientX || screenX);
      },
      touchmove(e2) {
        if (this.readonly || this.disabled || !this.touchable)
          return;
        const {
          clientX,
          screenX
        } = e2.changedTouches[0];
        this._getRateCount(clientX || screenX);
      },
      /**
       * 兼容 PC @tian
       */
      mousedown(e2) {
      },
      mousemove(e2) {
      },
      mouseleave(e2) {
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
  function _sfc_render$E(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$b);
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
  const __easycom_0$6 = /* @__PURE__ */ _export_sfc(_sfc_main$F, [["render", _sfc_render$E], ["__scopeId", "data-v-5c8fbdf3"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/uni_modules/uni-rate/components/uni-rate/uni-rate.vue"]]);
  const _sfc_main$E = {
    __name: "brand",
    props: ["brand_id"],
    setup(__props, { expose: __expose }) {
      __expose();
      const props = __props;
      formatAppLog("log", "at pages/brand/brand.vue:120", props);
      const hasLikeBrand = vue.ref(false);
      let newsList = vue.ref([]);
      let newsPage = vue.ref({
        page_index: 1,
        // 当前页码
        page_size: 3,
        // 每页数量
        total: 0
        // 总数
      });
      uni.showLoading({
        title: "加载中"
      });
      const systemInfo2 = uni.getSystemInfoSync();
      let rateValue = vue.ref(0);
      const myRateValue = vue.ref(0);
      const commentListRef = vue.ref(null);
      const commentInputRef = vue.ref(null);
      let commentsPage = vue.ref(1);
      let replyForItem = vue.ref({});
      const handleReplyComment = ({
        parent,
        target
      }) => {
        var _a;
        formatAppLog("log", "at pages/brand/brand.vue:152", "parent", parent);
        formatAppLog("log", "at pages/brand/brand.vue:153", "target", target);
        let item = parent;
        if (target != null) {
          item = target;
        }
        if (replyForItem.value.id == item.id) {
          replyForItem.value = {};
          return;
        }
        formatAppLog("log", "at pages/brand/brand.vue:164", "item", item);
        replyForItem.value = item;
        (_a = commentInputRef.value) == null ? void 0 : _a.focusInput();
      };
      const handleCommentSubmit = ({
        content,
        replyInfo,
        origin
      }) => {
        let token = uni.getStorageSync("token");
        if (!global$1.isLogin) {
          uni.showToast({
            title: "请先登录",
            icon: "none"
          });
          return;
        }
        formatAppLog("log", "at pages/brand/brand.vue:182", "reply_info", replyInfo);
        const requestData = {
          content,
          origin,
          target_id: parseInt(props.brand_id),
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
      const onRateChange = (e2) => {
        formatAppLog("log", "at pages/brand/brand.vue:236", e2);
        if (!global$1.isLogin) {
          uni.showToast({
            title: "请先登录",
            icon: "none"
          });
          rateValue.value = 0;
          return;
        }
        rateValue.value = e2.value;
        myRateValue.value = e2.value;
        voteScoreProxy();
      };
      async function voteScoreProxy() {
        if (rateValue.value == 0) {
          uni.showToast({
            title: "请先评分",
            icon: "none"
          });
          return;
        }
        try {
          let token = uni.getStorageSync("token");
          if (!token) {
            uni.showToast({
              title: "请先登录",
              icon: "none"
            });
            return;
          }
          uni.showLoading({
            title: "提交中..."
          });
          const res = await uni.request({
            url: websiteUrl + "/with-state/add-vote-score",
            method: "POST",
            header: {
              "Authorization": token,
              "Content-Type": "application/json"
            },
            data: {
              type: 1,
              score: rateValue.value,
              target_id: parseInt(props.brand_id)
            }
          });
          uni.hideLoading();
          if (res.data.status === "success") {
            getBrandsInfo();
            uni.showToast({
              title: "评分成功",
              icon: "success"
            });
          } else {
            uni.showToast({
              title: res.data.msg || "评分失败",
              icon: "none"
            });
          }
        } catch (err) {
          uni.hideLoading();
          formatAppLog("error", "at pages/brand/brand.vue:308", "评分失败:", err);
          uni.showToast({
            title: "评分失败，请重试",
            icon: "none"
          });
        }
      }
      function getBrandNews() {
        uni.request({
          url: `${websiteUrl}/brand-news-list?brand_id=${props.brand_id}&page=${newsPage.value.page_index}&page_size=${newsPage.value.page_size}`,
          method: "GET",
          success: (res) => {
            if (res.data.status === "success") {
              const data = res.data.data;
              newsList.value = [...newsList.value, ...data.news_list];
              newsPage.value.total = data.total;
              if (data.news_list.length > 0) {
                newsPage.value.page_index += 1;
              }
            } else {
              uni.showToast({
                title: res.data.msg || "获取图透失败",
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
      }
      const onShareAppMessage = () => ({
        title: "BJD娃圈你想知道的这里都有~",
        path: "/pages/news/news",
        success(res) {
          formatAppLog("log", "at pages/brand/brand.vue:351", "分享成功", res);
        },
        fail(err) {
          formatAppLog("log", "at pages/brand/brand.vue:354", "分享失败", err);
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
            formatAppLog("log", "at pages/brand/brand.vue:367", res.data.data);
            brand.value = res.data.data;
            uni.setNavigationBarTitle({
              title: res.data.data.brand_name
            });
            getHasLikeBrand();
          },
          fail: (err) => {
            formatAppLog("log", "at pages/brand/brand.vue:377", err);
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
        if (!global$1.isLogin) {
          uni.showToast({
            title: "请先登录",
            icon: "none"
          });
          return;
        }
        try {
          const url = `${websiteUrl}/with-state/${hasLikeBrand.value ? "unlike" : "add-like"}`;
          const res = await uni.request({
            url,
            method: "POST",
            header: {
              Authorization: token
            },
            data: {
              id: parseInt(props.brand_id),
              type: 2
              // 注意：品牌类型可能需要确认，这里假设2代表品牌
            }
          });
          if (res.data.status === "success") {
            hasLikeBrand.value = !hasLikeBrand.value;
            uni.showToast({
              title: hasLikeBrand.value ? "关注成功" : "已取消关注",
              icon: "none"
            });
            getBrandsInfo();
          } else {
            uni.showToast({
              title: res.data.msg,
              icon: "none"
            });
          }
        } catch (err) {
          formatAppLog("error", "at pages/brand/brand.vue:429", err);
          uni.showToast({
            title: "操作失败",
            icon: "none"
          });
        }
      };
      const getHasLikeBrand = async () => {
        var _a;
        try {
          const res = await uni.request({
            url: `${websiteUrl}/with-state/hasLike?id=${parseInt(props.brand_id)}&type=2`,
            method: "POST",
            header: {
              Authorization: uni.getStorageSync("token")
            }
          });
          hasLikeBrand.value = ((_a = res.data.data) == null ? void 0 : _a.id) > 0;
        } catch (err) {
          formatAppLog("error", "at pages/brand/brand.vue:451", "获取关注状态失败:", err);
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
            formatAppLog("log", "at pages/brand/brand.vue:476", res.data.data);
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
            formatAppLog("log", "at pages/brand/brand.vue:494", err);
            uni.showToast({
              title: "网络请求失败",
              icon: "none"
            });
          }
        });
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
            formatAppLog("log", "at pages/brand/brand.vue:540", res.data);
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
            formatAppLog("log", "at pages/brand/brand.vue:562", err);
            uni.showToast({
              title: "网络请求失败",
              icon: "none"
            });
          }
        });
      }
      function viewFullImage(currentUrl, allUrl) {
        uni.previewImage({
          current: currentUrl,
          urls: allUrl
        });
      }
      function getMyScore(type, targetId) {
        let token = uni.getStorageSync("token");
        if (!token) {
          return 0;
        }
        if (!global$1.isLogin) {
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
            formatAppLog("log", "at pages/brand/brand.vue:600", res.data.data);
            if (res.data.status == "success") {
              myRateValue.value = res.data.data.score;
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
            formatAppLog("log", "at pages/brand/brand.vue:613", err);
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
      function jump2saleNews(item) {
        uni.navigateTo({
          url: `/pages/sale_news/sale_news?id=${item.id}&brand_id=${item.brand_id}`
        });
      }
      let goods2 = vue.ref({});
      let page = vue.ref(1);
      let brand = vue.ref({});
      onShow(() => {
        getUserInfo();
        getBrandsInfo();
        getBrandGoods();
        getBrandNews();
        if (global$1.isLogin) {
          getMyScore(1, props.brand_id);
        } else {
          rateValue.value = 0;
        }
      });
      const __returned__ = { props, hasLikeBrand, get newsList() {
        return newsList;
      }, set newsList(v2) {
        newsList = v2;
      }, get newsPage() {
        return newsPage;
      }, set newsPage(v2) {
        newsPage = v2;
      }, systemInfo: systemInfo2, get rateValue() {
        return rateValue;
      }, set rateValue(v2) {
        rateValue = v2;
      }, myRateValue, commentListRef, commentInputRef, get commentsPage() {
        return commentsPage;
      }, set commentsPage(v2) {
        commentsPage = v2;
      }, get replyForItem() {
        return replyForItem;
      }, set replyForItem(v2) {
        replyForItem = v2;
      }, handleReplyComment, handleCommentSubmit, onRateChange, voteScoreProxy, getBrandNews, onShareAppMessage, getBrandsInfo, likeBrand, getHasLikeBrand, formatTimestamp, getBrandGoods, addComments, viewFullImage, getMyScore, jumpGoods, jump2user, jump2saleNews, get goods() {
        return goods2;
      }, set goods(v2) {
        goods2 = v2;
      }, get page() {
        return page;
      }, set page(v2) {
        page = v2;
      }, get brand() {
        return brand;
      }, set brand(v2) {
        brand = v2;
      }, ref: vue.ref, watch: vue.watch, computed: vue.computed, get websiteUrl() {
        return websiteUrl;
      }, get wechatSignLogin() {
        return wechatSignLogin;
      }, get getUserInfo() {
        return getUserInfo;
      }, get global() {
        return global$1;
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
  function _sfc_render$D(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_rate = resolveEasycom(vue.resolveDynamicComponent("uni-rate"), __easycom_0$6);
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
          vue.createElementVNode("image", {
            src: $setup.brand.brand_name_image,
            mode: "heightFix",
            style: { "height": "60rpx" }
          }, null, 8, ["src"]),
          vue.createElementVNode(
            "text",
            { style: { "float": "right", "margin": "5px 0px" } },
            vue.toDisplayString($setup.brand.country_name) + " / " + vue.toDisplayString($setup.brand.type),
            1
            /* TEXT */
          ),
          vue.createElementVNode("view", { style: { "clear": "both" } })
        ]),
        vue.createCommentVNode(" 优化后的评分区域 "),
        vue.createElementVNode("view", { style: { "margin": "20rpx 0rpx", "display": "flex", "flex-wrap": "wrap", "align-items": "center", "justify-content": "space-between" } }, [
          vue.createElementVNode("view", { style: { "display": "flex", "align-items": "center", "flex-grow": "1" } }, [
            vue.createVNode(_component_uni_rate, {
              style: { "margin-top": "5px" },
              value: $setup.brand.score,
              "allow-half": "true",
              activeColor: "#65C3D6",
              onChange: $setup.onRateChange,
              "is-fill": "false"
            }, null, 8, ["value"]),
            vue.createElementVNode(
              "text",
              { style: { "margin-left": "8rpx", "position": "relative", "top": "5px" } },
              vue.toDisplayString($setup.brand.score) + "（" + vue.toDisplayString($setup.brand.vote_number) + "次评分) ",
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
        vue.createCommentVNode(" 品牌图透模块 "),
        vue.createElementVNode(
          "text",
          { class: "section-title" },
          "品牌图透 (" + vue.toDisplayString($setup.newsPage.total) + ")",
          1
          /* TEXT */
        ),
        vue.createElementVNode("view", { class: "news-list" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.newsList, (item, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "news-item",
                style: { "position": "relative" },
                key: item.id
              }, [
                vue.createElementVNode("view", { class: "news-header" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "news-header-title" },
                    vue.toDisplayString(item.title),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createCommentVNode(" 添加轮播图 "),
                item.image_list && item.image_list.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "news-images"
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
                      vue.renderList(item.image_list, (img, imgIndex) => {
                        return vue.openBlock(), vue.createElementBlock("swiper-item", { key: imgIndex }, [
                          vue.createElementVNode("image", {
                            src: img,
                            mode: "aspectFill",
                            class: "swiper-image",
                            onClick: ($event) => $setup.viewFullImage(img, item.image_list)
                          }, null, 8, ["src", "onClick"])
                        ]);
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ])) : vue.createCommentVNode("v-if", true),
                vue.createElementVNode(
                  "view",
                  { class: "news-content" },
                  vue.toDisplayString(item.content),
                  1
                  /* TEXT */
                ),
                vue.createCommentVNode(" 添加品牌标签 "),
                vue.createElementVNode("view", { class: "news-footer" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "news-time" },
                    vue.toDisplayString($setup.formatTimestamp(item.created_at)),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("text", {
                    class: "view-more",
                    onClick: ($event) => $setup.jump2saleNews(item)
                  }, "查看详情 →", 8, ["onClick"])
                ])
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        vue.createElementVNode("view", null, [
          vue.createCommentVNode(" 评论区 "),
          vue.createVNode(_component_comment_list, {
            ref: "commentListRef",
            type: 1,
            "relation-id": parseInt($setup.props.brand_id),
            onReply: $setup.handleReplyComment
          }, null, 8, ["relation-id"])
        ])
      ]),
      vue.createCommentVNode(" 一个不可见透明元素，撑起80px高度 "),
      vue.createElementVNode("view", { style: { "height": "80px" } }),
      vue.createCommentVNode(" 输入框 "),
      vue.createVNode(_component_comment_input, {
        ref: "commentInputRef",
        "reply-info": $setup.replyForItem,
        "target-id": $setup.props.brand_id,
        onSubmit: $setup.handleCommentSubmit,
        "onUpdate:replyInfo": _cache[0] || (_cache[0] = (val) => $setup.replyForItem = val)
      }, null, 8, ["reply-info", "target-id"])
    ]);
  }
  const PagesBrandBrand = /* @__PURE__ */ _export_sfc(_sfc_main$E, [["render", _sfc_render$D], ["__scopeId", "data-v-1a297a1d"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/brand/brand.vue"]]);
  const _imports_0$4 = "/static/empty-box.png";
  const _sfc_main$D = {
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
      let chooseDate = vue.ref(todayFormat);
      let chooseItem = vue.ref({});
      let loading = vue.ref(true);
      const onShareAppMessage = () => ({
        title: "快来看娃圈上新！",
        path: "/pages/news/news",
        imageUrl: "/static/share",
        success(res) {
          formatAppLog("log", "at pages/calendar/calendar.vue:171", "分享成功", res);
        },
        fail(err) {
          formatAppLog("log", "at pages/calendar/calendar.vue:174", "分享失败", err);
        },
        mp: {
          wxpath: "/pages/news/news.html"
        }
      });
      function getDateMap() {
        loading.value = true;
        uni.request({
          url: websiteUrl + `/goods-news`,
          method: "GET",
          timeout: 5e3,
          success: (res) => {
            formatAppLog("log", "at pages/calendar/calendar.vue:188", res.data.data);
            originalNews.value = res.data.data;
            news.value = filterNews("全部");
            for (let [key, value] of Object.entries(news.value)) {
              if (key === todayFormat) {
                chooseItem.value = value;
              }
            }
          },
          fail: (err) => {
            formatAppLog("log", "at pages/calendar/calendar.vue:198", err);
            uni.showToast({
              title: "网络请求失败",
              icon: "none"
            });
          },
          complete: () => {
            scrollLeft.value = itemWidth * 7 - 5;
            formatAppLog("log", "at pages/calendar/calendar.vue:206", "left:" + scrollLeft.value);
            loading.value = false;
          }
        });
      }
      function isToday(date) {
        return date === todayFormat;
      }
      function filterNews(type) {
        const filtered = {};
        Object.entries(originalNews.value).forEach(([date, info]) => {
          const copy = {
            ...info
          };
          if (copy.goods) {
            copy.goods = type === "全部" ? copy.goods : copy.goods.filter((g2) => g2.type === type);
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
        const firstValidEntry = Object.entries(filtered).find(([_2, v2]) => v2.goods);
        if (firstValidEntry) {
          chooseDate.value = firstValidEntry[0];
          chooseItem.value = firstValidEntry[1];
        } else {
          chooseItem.value = {
            goods: null
          };
        }
      };
      function jumpGoods(id, goodsId) {
        uni.request({
          url: websiteUrl + "/sale-record-click?id=" + id,
          method: "POST",
          header: {
            "Content-Type": "application/json"
          },
          success: () => {
            formatAppLog("log", "at pages/calendar/calendar.vue:258", "点击记录成功");
          },
          fail: (err) => {
            formatAppLog("error", "at pages/calendar/calendar.vue:261", "点击记录失败:", err);
          }
        });
        uni.navigateTo({
          url: "/pages/goods/goods?goods_id=" + goodsId
        });
      }
      function selectDate(date, item) {
        formatAppLog("log", "at pages/calendar/calendar.vue:272", item);
        chooseDate.value = date;
        chooseItem.value = item;
      }
      function formatTimestamp(timestamp) {
        const date = new Date(timestamp * 1e3);
        date.getFullYear();
        const month2 = (date.getMonth() + 1).toString().padStart(2, "0");
        const day2 = date.getDate().toString().padStart(2, "0");
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        return `${month2}-${day2} ${hours}:${minutes}`;
      }
      getDateMap();
      onPullDownRefresh(async () => {
        try {
          getDateMap();
          uni.stopPullDownRefresh();
        } catch (error) {
          uni.stopPullDownRefresh();
          uni.showToast({
            title: "刷新失败",
            icon: "none"
          });
        }
      });
      const __returned__ = { tabList, get activeType() {
        return activeType;
      }, set activeType(v2) {
        activeType = v2;
      }, get originalNews() {
        return originalNews;
      }, set originalNews(v2) {
        originalNews = v2;
      }, get news() {
        return news;
      }, set news(v2) {
        news = v2;
      }, today, year, month, day, todayFormat, scrollView, systemInfo: systemInfo2, screenWidth, itemWidth, get scrollLeft() {
        return scrollLeft;
      }, set scrollLeft(v2) {
        scrollLeft = v2;
      }, miniProgram, statusBarHeight, get chooseDate() {
        return chooseDate;
      }, set chooseDate(v2) {
        chooseDate = v2;
      }, get chooseItem() {
        return chooseItem;
      }, set chooseItem(v2) {
        chooseItem = v2;
      }, get loading() {
        return loading;
      }, set loading(v2) {
        loading = v2;
      }, onShareAppMessage, getDateMap, isToday, filterNews, handleTabClick, jumpGoods, selectDate, formatTimestamp, ref: vue.ref, onMounted: vue.onMounted, get onLoad() {
        return onLoad;
      }, get onReachBottom() {
        return onReachBottom;
      }, get onPullDownRefresh() {
        return onPullDownRefresh;
      }, get websiteUrl() {
        return websiteUrl;
      }, get wechatSignLogin() {
        return wechatSignLogin;
      }, get getUserInfo() {
        return getUserInfo;
      }, get global() {
        return global$1;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$C(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_common_search = resolveEasycom(vue.resolveDynamicComponent("common-search"), __easycom_2$1);
    const _component_loading_toast = resolveEasycom(vue.resolveDynamicComponent("loading-toast"), __easycom_4);
    const _component_common_page = resolveEasycom(vue.resolveDynamicComponent("common-page"), __easycom_1$4);
    return vue.openBlock(), vue.createBlock(_component_common_page, { head_color: "rgb(185 195 253)" }, {
      default: vue.withCtx(() => [
        vue.createCommentVNode(" 顶部搜索和分类区域 "),
        vue.createElementVNode("view", { class: "header-container" }, [
          vue.createElementVNode(
            "view",
            {
              class: "search-container",
              style: vue.normalizeStyle($setup.miniProgram ? "width:500rpx; margin:0rpx 20rpx 10rpx 20rpx;" : "")
            },
            [
              vue.createVNode(_component_common_search, { width: "560rpx" })
            ],
            4
            /* STYLE */
          ),
          vue.createElementVNode("view", { class: "category-container" }, [
            vue.createElementVNode("scroll-view", {
              "scroll-x": "true",
              class: "category-scroll",
              "show-scrollbar": false
            }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.tabList, (item, index) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: vue.normalizeClass(["category-item", { active: $setup.activeType === item }]),
                    key: index,
                    onClick: ($event) => $setup.handleTabClick(item)
                  }, vue.toDisplayString(item), 11, ["onClick"]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ]),
        vue.createCommentVNode(" 日期选择区域 "),
        vue.createElementVNode("view", { class: "date-picker-container" }, [
          vue.createElementVNode("scroll-view", {
            class: "date-scroll",
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
                  class: "date-item",
                  onClick: ($event) => $setup.selectDate(date, item)
                }, [
                  item.goods_number > 0 ? (vue.openBlock(), vue.createElementBlock(
                    "view",
                    {
                      key: 0,
                      class: "date-badge"
                    },
                    vue.toDisplayString(item.goods_number),
                    1
                    /* TEXT */
                  )) : vue.createCommentVNode("v-if", true),
                  vue.createElementVNode(
                    "view",
                    {
                      class: vue.normalizeClass(["weekday", { "weekend": item.weekday === "周日" || item.weekday === "周六" }])
                    },
                    vue.toDisplayString(item.weekday),
                    3
                    /* TEXT, CLASS */
                  ),
                  vue.createCommentVNode(` <view class="day-number" :class="{'selected': chooseDate === date}"> `),
                  vue.createCommentVNode(" {{ item.day_number }} "),
                  vue.createCommentVNode(" </view> "),
                  vue.createElementVNode(
                    "view",
                    {
                      class: vue.normalizeClass(["day-number", { "selected": $setup.chooseDate === date }])
                    },
                    vue.toDisplayString($setup.isToday(date) ? "今天" : item.day_number),
                    3
                    /* TEXT, CLASS */
                  )
                ], 8, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ], 8, ["scroll-left"])
        ]),
        vue.createCommentVNode(" 商品展示区域 "),
        vue.createElementVNode("view", { class: "goods-container" }, [
          vue.createElementVNode("view", { class: "date-title" }, [
            vue.createElementVNode(
              "text",
              { class: "highlight" },
              vue.toDisplayString($setup.chooseDate) + " 日",
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              null,
              " 星期" + vue.toDisplayString($setup.chooseItem.weekday) + "上新",
              1
              /* TEXT */
            )
          ]),
          $setup.chooseItem.goods == null ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "empty-tip"
          }, [
            vue.createElementVNode("image", {
              src: _imports_0$4,
              class: "empty-icon"
            }),
            vue.createElementVNode("text", null, "这天没有上新呢...")
          ])) : (vue.openBlock(), vue.createElementBlock("view", { key: 1 }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.chooseItem.goods, (good) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: good.id,
                  class: "goods-card",
                  onClick: ($event) => $setup.jumpGoods(good.id, good.goods_id)
                }, [
                  vue.createElementVNode("view", { class: "goods-image-container" }, [
                    vue.createElementVNode("image", {
                      src: good.goods_image,
                      mode: "aspectFill",
                      class: "goods-image"
                    }, null, 8, ["src"]),
                    vue.createElementVNode("view", { class: "goods-tags" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "tag sale-type" },
                        vue.toDisplayString(good.sale_type),
                        1
                        /* TEXT */
                      ),
                      good.is_first_sale_day == 1 ? (vue.openBlock(), vue.createElementBlock("text", {
                        key: 0,
                        class: "tag first-day"
                      }, "首日")) : vue.createCommentVNode("v-if", true)
                    ])
                  ]),
                  vue.createElementVNode("view", { class: "goods-info" }, [
                    vue.createElementVNode("view", null, [
                      vue.createElementVNode(
                        "text",
                        { class: "brand-name" },
                        vue.toDisplayString(good.brand_name),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "goods-name" },
                        vue.toDisplayString(good.goods_name),
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode("view", { class: "goods-details" }, [
                      vue.createElementVNode(
                        "text",
                        null,
                        vue.toDisplayString(good.size) + " · " + vue.toDisplayString(good.size_detail) + " · " + vue.toDisplayString(good.type),
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createCommentVNode(" 时间信息区域 "),
                    vue.createElementVNode("view", { class: "time-info" }, [
                      vue.createElementVNode(
                        "text",
                        null,
                        "开定 " + vue.toDisplayString($setup.formatTimestamp(good.sub_time)),
                        1
                        /* TEXT */
                      ),
                      good.sub_time_end ? (vue.openBlock(), vue.createElementBlock(
                        "text",
                        { key: 0 },
                        "截止 " + vue.toDisplayString($setup.formatTimestamp(good.sub_time_end)),
                        1
                        /* TEXT */
                      )) : vue.createCommentVNode("v-if", true)
                    ]),
                    vue.createCommentVNode(" 价格信息区域 "),
                    vue.createElementVNode("view", { class: "price-info" }, [
                      good.sale_type != "限量现货" && good.sale_type != "不限量现货" ? (vue.openBlock(), vue.createElementBlock("view", { key: 0 }, [
                        vue.createElementVNode("view", { class: "price-group" }, [
                          vue.createElementVNode("text", { class: "price-label" }, "定金"),
                          vue.createElementVNode(
                            "text",
                            { class: "deposit-price" },
                            vue.toDisplayString(good.sub_amount),
                            1
                            /* TEXT */
                          ),
                          vue.createElementVNode(
                            "text",
                            { class: "currency" },
                            "(" + vue.toDisplayString(good.currency) + ")",
                            1
                            /* TEXT */
                          )
                        ]),
                        vue.createElementVNode("view", { class: "price-group" }, [
                          vue.createElementVNode("text", { class: "price-label" }, "尾款"),
                          vue.createElementVNode(
                            "text",
                            { class: "final-price" },
                            vue.toDisplayString(good.fin_amount),
                            1
                            /* TEXT */
                          )
                        ])
                      ])) : (vue.openBlock(), vue.createElementBlock("view", { key: 1 }, [
                        vue.createElementVNode("view", { class: "price-group" }, [
                          vue.createElementVNode("text", { class: "price-label" }, "全款"),
                          vue.createElementVNode(
                            "text",
                            { class: "full-price" },
                            vue.toDisplayString(good.sub_amount + good.fin_amount),
                            1
                            /* TEXT */
                          ),
                          vue.createElementVNode(
                            "text",
                            { class: "currency" },
                            "(" + vue.toDisplayString(good.currency) + ")",
                            1
                            /* TEXT */
                          )
                        ])
                      ]))
                    ])
                  ])
                ], 8, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ]))
        ]),
        vue.createVNode(_component_loading_toast, { show: $setup.loading }, null, 8, ["show"])
      ]),
      _: 1
      /* STABLE */
    });
  }
  const PagesCalendarCalendar = /* @__PURE__ */ _export_sfc(_sfc_main$D, [["render", _sfc_render$C], ["__scopeId", "data-v-6e8913ab"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/calendar/calendar.vue"]]);
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
  const _sfc_main$C = {
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
      async drawImage(ctx, image, x, y2, w2, h2) {
        if (this.type2d) {
          await new Promise((resolve) => image.onload = resolve);
          ctx.drawImage(image, x * this.pixel, y2 * this.pixel, w2 * this.pixel, h2 * this.pixel);
        } else {
          const path = await new Promise((resolve) => {
            uni.getImageInfo({
              src: image,
              success({ path: path2 }) {
                resolve(path2);
              }
            });
          });
          ctx.drawImage(path, x * this.pixel, y2 * this.pixel, w2 * this.pixel, h2 * this.pixel);
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
        const x = -dx, y2 = -dy, w2 = this.imageRect.width / scale, h2 = this.imageRect.height / scale;
        ctx.save();
        ctx.translate(x + w2 / 2, y2 + h2 / 2);
        ctx.rotate(this.rotateAngle * Math.PI / 180);
        ctx.translate(-(x + w2 / 2), -(y2 + h2 / 2));
        await this.drawImage(ctx, image, x, y2, w2, h2);
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
  function _sfc_render$B(_ctx, _cache, $props, $setup, $data, $options) {
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
    block0$2(_sfc_main$C);
  const __easycom_0$5 = /* @__PURE__ */ _export_sfc(_sfc_main$C, [["render", _sfc_render$B], ["__scopeId", "data-v-51ff46c2"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/uni_modules/bt-cropper/components/bt-cropper/bt-cropper.vue"]]);
  const _sfc_main$B = {
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
          const pages2 = getCurrentPages();
          const parentPage = pages2[pages2.length - 2];
          formatAppLog("log", "at pages/pop_croper/pop_croper.vue:82", parentPage);
          parentPage.returnParam = res;
          uni.navigateBack({
            delta: 1
          });
        });
      }
    }
  };
  function _sfc_render$A(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_bt_cropper = resolveEasycom(vue.resolveDynamicComponent("bt-cropper"), __easycom_0$5);
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
  const PagesPopCroperPopCroper = /* @__PURE__ */ _export_sfc(_sfc_main$B, [["render", _sfc_render$A], ["__scopeId", "data-v-ec2e1a43"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/pop_croper/pop_croper.vue"]]);
  const _imports_0$3 = "/static/right.png";
  const _sfc_main$A = {
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
          status: !!global$1.userInfo.password,
          displayValue: global$1.userInfo.password ? "去修改" : "未设置"
        },
        {
          label: "更改密码",
          action: jump2password,
          status: !!global$1.userInfo.password,
          displayValue: global$1.userInfo.password ? "去修改" : "未设置"
        },
        {
          label: "绑定手机号",
          action: jump2telphone,
          status: !!global$1.userInfo.tel_phone,
          // 修正字段名
          displayValue: global$1.userInfo.tel_phone ? global$1.userInfo.tel_phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2") : "去绑定"
        },
        {
          label: "绑定微信",
          action: jump2wechat,
          status: !!global$1.userInfo.wechat_open_id,
          displayValue: global$1.userInfo.wechat_open_id ? "已绑定" : "去绑定"
        },
        {
          label: "检查更新",
          action: checkUpdate,
          status: newVersionInfo.value.version,
          // 有新版本时高亮显示
          displayValue: updateStatusText.value
        }
      ]);
      let userInfo = vue.ref({});
      let newVersionInfo = vue.ref({});
      const hasAppliedDeletion = vue.ref(false);
      let needUpdate = vue.ref(false);
      const updateStatusText = vue.ref("检查更新");
      let click = vue.ref(0);
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
        if (global$1.userInfo.wechat_open_id) {
          uni.showToast({
            title: "已绑定微信",
            icon: "none"
          });
        } else {
          bindWechat().then(() => {
            formatAppLog("log", "at pages/setting/setting.vue:119", "微信绑定成功");
            uni.showToast({
              title: "微信绑定成功",
              icon: "none"
            });
          }).catch((err) => {
            formatAppLog("error", "at pages/setting/setting.vue:126", "微信绑定失败:", err);
            uni.showToast({
              title: "微信绑定失败",
              icon: "none"
            });
          });
        }
      }
      const checkUpdate = async () => {
        if (uni.getSystemInfoSync().platform === "app" || true) {
          click.value++;
          uni.getAppBaseInfo().appVersion;
          const res = await uni.request({
            url: `${websiteUrl}/latest-version?version=1.0.40`,
            method: "GET"
          });
          if (res && res.data) {
            if (res.data.status === "success" && res.data.data) {
              updateStatusText.value = "有新版本:" + res.data.data.version;
              newVersionInfo.value = true;
            } else {
              if (click.value > 1) {
                uni.showToast({
                  title: "当前已是最新版本",
                  icon: "none"
                });
              }
            }
          }
        } else {
          uni.showToast({
            title: "您所使用的平台无需更新",
            icon: "none"
          });
        }
      };
      async function handleAccountDeletion() {
        if (hasAppliedDeletion.value) {
          uni.showModal({
            title: "取消注销申请",
            content: "确定要取消账号注销申请吗？",
            success: async (res) => {
              if (res.confirm) {
                await cancelAccountDeletion();
              }
            }
          });
        } else {
          uni.showModal({
            title: "申请注销账号",
            content: "确定要申请注销账号吗？注销后账号将不可恢复！",
            confirmText: "确认注销",
            confirmColor: "#f56c6c",
            success: async (res) => {
              if (res.confirm) {
                await applyForAccountDeletion();
              }
            }
          });
        }
      }
      async function applyForAccountDeletion() {
        const token = uni.getStorageSync("token");
        if (!token) {
          uni.showToast({
            title: "请先登录",
            icon: "none"
          });
          return;
        }
        uni.showLoading({
          title: "处理中...",
          mask: true
        });
        try {
          const res = await uni.request({
            url: `${websiteUrl}/with-state/apply-delete`,
            method: "POST",
            header: {
              "Authorization": token
            }
          });
          uni.hideLoading();
          if (res.data.status === "success") {
            hasAppliedDeletion.value = true;
            global$1.userInfo.deleteApplyAt = Math.floor(Date.now() / 1e3);
            uni.showToast({
              title: "已申请注销账号",
              icon: "success",
              duration: 3e3
            });
            setTimeout(() => {
              uni.showModal({
                title: "注销申请已提交",
                content: "您的账号将在30天后正式注销。在此期间您可以正常使用所有功能，并可随时取消注销申请。",
                showCancel: false,
                confirmText: "知道了"
              });
            }, 1e3);
          } else {
            throw new Error(res.data.msg || "申请注销失败");
          }
        } catch (error) {
          uni.hideLoading();
          uni.showToast({
            title: error.message || "操作失败，请稍后重试",
            icon: "none",
            duration: 3e3
          });
        }
      }
      async function cancelAccountDeletion() {
        const token = uni.getStorageSync("token");
        if (!token) {
          uni.showToast({
            title: "请先登录",
            icon: "none"
          });
          return;
        }
        uni.showLoading({
          title: "处理中...",
          mask: true
        });
        try {
          const res = await uni.request({
            url: `${websiteUrl}/with-state/cancel-delete`,
            method: "POST",
            header: {
              "Authorization": token
            }
          });
          uni.hideLoading();
          if (res.data.status === "success") {
            hasAppliedDeletion.value = false;
            global$1.userInfo.deleteApplyAt = 0;
            uni.showToast({
              title: "已取消注销申请",
              icon: "success",
              duration: 3e3
            });
          } else {
            throw new Error(res.data.msg || "取消注销失败");
          }
        } catch (error) {
          uni.hideLoading();
          uni.showToast({
            title: error.message || "操作失败，请稍后重试",
            icon: "none",
            duration: 3e3
          });
        }
      }
      vue.onMounted(() => {
        asyncGetUserInfo().then((user) => {
          hasAppliedDeletion.value = user.delete_apply_at > 0;
        });
        checkUpdate();
      });
      const __returned__ = { menuItems, get userInfo() {
        return userInfo;
      }, set userInfo(v2) {
        userInfo = v2;
      }, get newVersionInfo() {
        return newVersionInfo;
      }, set newVersionInfo(v2) {
        newVersionInfo = v2;
      }, hasAppliedDeletion, get needUpdate() {
        return needUpdate;
      }, set needUpdate(v2) {
        needUpdate = v2;
      }, updateStatusText, get click() {
        return click;
      }, set click(v2) {
        click = v2;
      }, jump2password, jump2telphone, jump2username, jump2wechat, checkUpdate, handleAccountDeletion, applyForAccountDeletion, cancelAccountDeletion, ref: vue.ref, computed: vue.computed, onMounted: vue.onMounted, get websiteUrl() {
        return websiteUrl;
      }, get wechatSignLogin() {
        return wechatSignLogin;
      }, get getUserInfo() {
        return getUserInfo;
      }, get global() {
        return global$1;
      }, get bindWechat() {
        return bindWechat;
      }, get asyncGetUserInfo() {
        return asyncGetUserInfo;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$z(_ctx, _cache, $props, $setup, $data, $options) {
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
                src: _imports_0$3
              })
            ])
          ], 8, ["onClick"]);
        }),
        128
        /* KEYED_FRAGMENT */
      )),
      vue.createCommentVNode(" 注销按钮区域 "),
      vue.createElementVNode("view", { class: "logout-section" }, [
        vue.createElementVNode(
          "view",
          {
            class: "logout-btn",
            onClick: $setup.handleAccountDeletion,
            style: vue.normalizeStyle({ backgroundColor: $setup.hasAppliedDeletion ? "#f56c6c" : "#cfcad8" })
          },
          [
            vue.createElementVNode(
              "text",
              null,
              vue.toDisplayString($setup.hasAppliedDeletion ? "取消注销申请" : "申请注销账号"),
              1
              /* TEXT */
            )
          ],
          4
          /* STYLE */
        ),
        $setup.hasAppliedDeletion ? (vue.openBlock(), vue.createElementBlock("text", {
          key: 0,
          class: "deletion-notice"
        }, " 已申请注销，30天后账号将正式注销。在此之前可以正常使用，并可随时取消注销申请。 ")) : vue.createCommentVNode("v-if", true)
      ])
    ]);
  }
  const PagesSettingSetting = /* @__PURE__ */ _export_sfc(_sfc_main$A, [["render", _sfc_render$z], ["__scopeId", "data-v-018cdf56"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/setting/setting.vue"]]);
  const _sfc_main$z = {
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
        if (!global$1.userInfo.password && !oldPassword.value) {
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
      }, set oldPassword(v2) {
        oldPassword = v2;
      }, get newPassword() {
        return newPassword;
      }, set newPassword(v2) {
        newPassword = v2;
      }, get newPassword2() {
        return newPassword2;
      }, set newPassword2(v2) {
        newPassword2 = v2;
      }, isFormValid, strengthText, getStrengthClass, updatePassword, ref: vue.ref, computed: vue.computed, get websiteUrl() {
        return websiteUrl;
      }, get wechatSignLogin() {
        return wechatSignLogin;
      }, get getUserInfo() {
        return getUserInfo;
      }, get global() {
        return global$1;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$y(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$b);
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
  const PagesSettingPasswordPassword = /* @__PURE__ */ _export_sfc(_sfc_main$z, [["render", _sfc_render$y], ["__scopeId", "data-v-b825db0b"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/setting/password/password.vue"]]);
  const _sfc_main$y = {
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
      }, set telPhone(v2) {
        telPhone = v2;
      }, get code() {
        return code;
      }, set code(v2) {
        code = v2;
      }, get buttonMsg() {
        return buttonMsg;
      }, set buttonMsg(v2) {
        buttonMsg = v2;
      }, updateTelPhone, sendCode, ref: vue.ref, get websiteUrl() {
        return websiteUrl;
      }, get wechatSignLogin() {
        return wechatSignLogin;
      }, get getUserInfo() {
        return getUserInfo;
      }, get global() {
        return global$1;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$x(_ctx, _cache, $props, $setup, $data, $options) {
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
  const PagesSettingTelPhoneTelPhone = /* @__PURE__ */ _export_sfc(_sfc_main$y, [["render", _sfc_render$x], ["__scopeId", "data-v-25dd367f"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/setting/tel_phone/tel_phone.vue"]]);
  const isObject = (val) => val !== null && typeof val === "object";
  const defaultDelimiters = ["{", "}"];
  class BaseFormatter {
    constructor() {
      this._caches = /* @__PURE__ */ Object.create(null);
    }
    interpolate(message, values, delimiters = defaultDelimiters) {
      if (!values) {
        return [message];
      }
      let tokens = this._caches[message];
      if (!tokens) {
        tokens = parse(message, delimiters);
        this._caches[message] = tokens;
      }
      return compile(tokens, values);
    }
  }
  const RE_TOKEN_LIST_VALUE = /^(?:\d)+/;
  const RE_TOKEN_NAMED_VALUE = /^(?:\w)+/;
  function parse(format, [startDelimiter, endDelimiter]) {
    const tokens = [];
    let position = 0;
    let text = "";
    while (position < format.length) {
      let char = format[position++];
      if (char === startDelimiter) {
        if (text) {
          tokens.push({ type: "text", value: text });
        }
        text = "";
        let sub = "";
        char = format[position++];
        while (char !== void 0 && char !== endDelimiter) {
          sub += char;
          char = format[position++];
        }
        const isClosed = char === endDelimiter;
        const type = RE_TOKEN_LIST_VALUE.test(sub) ? "list" : isClosed && RE_TOKEN_NAMED_VALUE.test(sub) ? "named" : "unknown";
        tokens.push({ value: sub, type });
      } else {
        text += char;
      }
    }
    text && tokens.push({ type: "text", value: text });
    return tokens;
  }
  function compile(tokens, values) {
    const compiled = [];
    let index = 0;
    const mode = Array.isArray(values) ? "list" : isObject(values) ? "named" : "unknown";
    if (mode === "unknown") {
      return compiled;
    }
    while (index < tokens.length) {
      const token = tokens[index];
      switch (token.type) {
        case "text":
          compiled.push(token.value);
          break;
        case "list":
          compiled.push(values[parseInt(token.value, 10)]);
          break;
        case "named":
          if (mode === "named") {
            compiled.push(values[token.value]);
          } else {
            {
              console.warn(`Type of token '${token.type}' and format of value '${mode}' don't match!`);
            }
          }
          break;
        case "unknown":
          {
            console.warn(`Detect 'unknown' type of token!`);
          }
          break;
      }
      index++;
    }
    return compiled;
  }
  const LOCALE_ZH_HANS = "zh-Hans";
  const LOCALE_ZH_HANT = "zh-Hant";
  const LOCALE_EN = "en";
  const LOCALE_FR = "fr";
  const LOCALE_ES = "es";
  const hasOwnProperty = Object.prototype.hasOwnProperty;
  const hasOwn = (val, key) => hasOwnProperty.call(val, key);
  const defaultFormatter = new BaseFormatter();
  function include(str, parts) {
    return !!parts.find((part) => str.indexOf(part) !== -1);
  }
  function startsWith(str, parts) {
    return parts.find((part) => str.indexOf(part) === 0);
  }
  function normalizeLocale(locale, messages2) {
    if (!locale) {
      return;
    }
    locale = locale.trim().replace(/_/g, "-");
    if (messages2 && messages2[locale]) {
      return locale;
    }
    locale = locale.toLowerCase();
    if (locale === "chinese") {
      return LOCALE_ZH_HANS;
    }
    if (locale.indexOf("zh") === 0) {
      if (locale.indexOf("-hans") > -1) {
        return LOCALE_ZH_HANS;
      }
      if (locale.indexOf("-hant") > -1) {
        return LOCALE_ZH_HANT;
      }
      if (include(locale, ["-tw", "-hk", "-mo", "-cht"])) {
        return LOCALE_ZH_HANT;
      }
      return LOCALE_ZH_HANS;
    }
    let locales = [LOCALE_EN, LOCALE_FR, LOCALE_ES];
    if (messages2 && Object.keys(messages2).length > 0) {
      locales = Object.keys(messages2);
    }
    const lang = startsWith(locale, locales);
    if (lang) {
      return lang;
    }
  }
  class I18n {
    constructor({ locale, fallbackLocale, messages: messages2, watcher, formater: formater2 }) {
      this.locale = LOCALE_EN;
      this.fallbackLocale = LOCALE_EN;
      this.message = {};
      this.messages = {};
      this.watchers = [];
      if (fallbackLocale) {
        this.fallbackLocale = fallbackLocale;
      }
      this.formater = formater2 || defaultFormatter;
      this.messages = messages2 || {};
      this.setLocale(locale || LOCALE_EN);
      if (watcher) {
        this.watchLocale(watcher);
      }
    }
    setLocale(locale) {
      const oldLocale = this.locale;
      this.locale = normalizeLocale(locale, this.messages) || this.fallbackLocale;
      if (!this.messages[this.locale]) {
        this.messages[this.locale] = {};
      }
      this.message = this.messages[this.locale];
      if (oldLocale !== this.locale) {
        this.watchers.forEach((watcher) => {
          watcher(this.locale, oldLocale);
        });
      }
    }
    getLocale() {
      return this.locale;
    }
    watchLocale(fn) {
      const index = this.watchers.push(fn) - 1;
      return () => {
        this.watchers.splice(index, 1);
      };
    }
    add(locale, message, override = true) {
      const curMessages = this.messages[locale];
      if (curMessages) {
        if (override) {
          Object.assign(curMessages, message);
        } else {
          Object.keys(message).forEach((key) => {
            if (!hasOwn(curMessages, key)) {
              curMessages[key] = message[key];
            }
          });
        }
      } else {
        this.messages[locale] = message;
      }
    }
    f(message, values, delimiters) {
      return this.formater.interpolate(message, values, delimiters).join("");
    }
    t(key, locale, values) {
      let message = this.message;
      if (typeof locale === "string") {
        locale = normalizeLocale(locale, this.messages);
        locale && (message = this.messages[locale]);
      } else {
        values = locale;
      }
      if (!hasOwn(message, key)) {
        console.warn(`Cannot translate the value of keypath ${key}. Use the value of keypath as default.`);
        return key;
      }
      return this.formater.interpolate(message[key], values).join("");
    }
  }
  function watchAppLocale(appVm, i18n) {
    if (appVm.$watchLocale) {
      appVm.$watchLocale((newLocale) => {
        i18n.setLocale(newLocale);
      });
    } else {
      appVm.$watch(() => appVm.$locale, (newLocale) => {
        i18n.setLocale(newLocale);
      });
    }
  }
  function getDefaultLocale() {
    if (typeof uni !== "undefined" && uni.getLocale) {
      return uni.getLocale();
    }
    if (typeof global !== "undefined" && global.getLocale) {
      return global.getLocale();
    }
    return LOCALE_EN;
  }
  function initVueI18n(locale, messages2 = {}, fallbackLocale, watcher) {
    if (typeof locale !== "string") {
      const options = [
        messages2,
        locale
      ];
      locale = options[0];
      messages2 = options[1];
    }
    if (typeof locale !== "string") {
      locale = getDefaultLocale();
    }
    if (typeof fallbackLocale !== "string") {
      fallbackLocale = typeof __uniConfig !== "undefined" && __uniConfig.fallbackLocale || LOCALE_EN;
    }
    const i18n = new I18n({
      locale,
      fallbackLocale,
      messages: messages2,
      watcher
    });
    let t2 = (key, values) => {
      if (typeof getApp !== "function") {
        t2 = function(key2, values2) {
          return i18n.t(key2, values2);
        };
      } else {
        let isWatchedAppLocale = false;
        t2 = function(key2, values2) {
          const appVm = getApp().$vm;
          if (appVm) {
            appVm.$locale;
            if (!isWatchedAppLocale) {
              isWatchedAppLocale = true;
              watchAppLocale(appVm, i18n);
            }
          }
          return i18n.t(key2, values2);
        };
      }
      return t2(key, values);
    };
    return {
      i18n,
      f(message, values, delimiters) {
        return i18n.f(message, values, delimiters);
      },
      t(key, values) {
        return t2(key, values);
      },
      add(locale2, message, override = true) {
        return i18n.add(locale2, message, override);
      },
      watch(fn) {
        return i18n.watchLocale(fn);
      },
      getLocale() {
        return i18n.getLocale();
      },
      setLocale(newLocale) {
        return i18n.setLocale(newLocale);
      }
    };
  }
  const en$1 = {
    "uni-load-more.contentdown": "Pull up to show more",
    "uni-load-more.contentrefresh": "loading...",
    "uni-load-more.contentnomore": "No more data"
  };
  const zhHans = {
    "uni-load-more.contentdown": "上拉显示更多",
    "uni-load-more.contentrefresh": "正在加载...",
    "uni-load-more.contentnomore": "没有更多数据了"
  };
  const zhHant = {
    "uni-load-more.contentdown": "上拉顯示更多",
    "uni-load-more.contentrefresh": "正在加載...",
    "uni-load-more.contentnomore": "沒有更多數據了"
  };
  const messages = {
    en: en$1,
    "zh-Hans": zhHans,
    "zh-Hant": zhHant
  };
  let platform;
  setTimeout(() => {
    platform = uni.getSystemInfoSync().platform;
  }, 16);
  const {
    t: t$1
  } = initVueI18n(messages);
  const _sfc_main$x = {
    name: "UniLoadMore",
    emits: ["clickLoadMore"],
    props: {
      status: {
        // 上拉的状态：more-loading前；loading-loading中；noMore-没有更多了
        type: String,
        default: "more"
      },
      showIcon: {
        type: Boolean,
        default: true
      },
      iconType: {
        type: String,
        default: "auto"
      },
      iconSize: {
        type: Number,
        default: 24
      },
      color: {
        type: String,
        default: "#777777"
      },
      contentText: {
        type: Object,
        default() {
          return {
            contentdown: "",
            contentrefresh: "",
            contentnomore: ""
          };
        }
      },
      showText: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        webviewHide: false,
        platform,
        imgBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QzlBMzU3OTlEOUM0MTFFOUI0NTZDNERBQURBQzI4RkUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QzlBMzU3OUFEOUM0MTFFOUI0NTZDNERBQURBQzI4RkUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpDOUEzNTc5N0Q5QzQxMUU5QjQ1NkM0REFBREFDMjhGRSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpDOUEzNTc5OEQ5QzQxMUU5QjQ1NkM0REFBREFDMjhGRSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pt+ALSwAAA6CSURBVHja1FsLkFZVHb98LM+F5bHL8khA1iSeiyQBCRM+YGqKUnnJTDLGI0BGZlKDIU2MMglUiDApEZvSsZnQtBRJtKwQNKQMFYeRDR10WOLd8ljYXdh+v8v5fR3Od+797t1dnOnO/Ofce77z+J//+b/P+ZqtXbs2sJ9MJhNUV1cHJ06cCJo3bx7EPc2aNcvpy7pWrVoF+/fvDyoqKoI2bdoE9fX1F7TjN8a+EXBn/fkfvw942Tf+wYMHg9mzZwfjxo0LDhw4EPa1x2MbFw/fOGfPng1qa2tzcCkILsLDydq2bRsunpOTMM7TD/W/tZDZhPdeKD+yGxHhdu3aBV27dg3OnDlzMVANMheLAO3btw8KCwuDmpoaX5OxbgUIMEq7K8IcPnw4KCsrC/r37x8cP378/4cAXAB3vqSkJMuiDhTkw+XcuXNhOWbMmKBly5YhUT8xArhyFvP0BfwRsAuwxJZJsm/nzp2DTp06he/OU+cZ64K6o0ePBkOHDg2GDx8e6gEbJ5Q/NHNuAJQ1hgBeHUDlR7nVTkY8rQAvAi4z34vR/mPs1FoRsaCgIJThI0eOBC1atEiFGGV+5MiRoS45efJkqFjJFXV1dQuA012m2WcwTw98fy6CqBdsaiIO4CScrGPHjvk4odhavPquRtFWXEC25VgkREKOCh/qDSq+vn37htzD/mZTOmOc5U7zKzBPEedygWshcDyWvs30igAbU+6oyMgJBCFhwQE0fccxN60Ay9iebbjoDh06hMowjQxT4fXq1SskArmHZpkArvixp/kWzHdMeArExSJEaiXIjjRjRJ4DaAGWpibLzXN3Fm1vA5teBgh3j1Rv3bp1YgKwPdmf2p9zcyNYYgPKMfY0T5f5nNYdw158nJ8QawW4CLKwiOBSEgO/hok2eBydR+3dYH+PLxA5J8Vv0KBBwenTp0P2JWAx6+yFEBfs8lMY+y0SWMBNI9E4ThKi58VKTg3FQZS1RQF1cz27eC0QHMu+3E0SkUowjhVt5VdaWhp07949ZHv2Qd1EjDXM2cla1M0nl3GxAs3J9yREzyTdFVKVFOaE9qRA8GM0WebRuo9JGZKA7Mv2SeS/Z8+eoQ9BArMfFrLGo6jvxbhHbJZnKX2Rzz1O7QhJJ9Cs2ZMaWIyq/zhdeqPNfIoHd58clIQD+JSXl4dKlyIAuBdVXZwFVWKspSSoxE++h8x4k3uCnEhE4I5KwRiFWGOU0QWKiCYLbdoRMRKAu2kQ9vkfLU6dOhX06NEjlH+yMRZSinnuyWnYosVcji8CEA/6Cg2JF+IIUBqnGKUTCNwtwBN4f89RiK1R96DEgO2o0NDmtEdvVFdVVYV+P3UAPUEs6GFwV3PHmXkD4vh74iDFJysVI/MlaQhwKeBNTLYX5VuA8T4/gZxA4MRGFxDB6R7OmYPfyykGRJbyie+XnGYnQIC/coH9+vULiYrxrkL9ZA9+0ykaHIfEpM7ge8TiJ2CsHYwyMfafAF1yCGBHYIbCVDjDjKt7BeB51D+LgQa6OkG7IDYEEtvQ7lnXLKLtLdLuJBpE4gPUXcW2+PkZwOex+4cGDhwYDBkyRL7/HFcEwUGPo/8uWRUpYnfxGHco8HkewLHLyYmAawAPuIFZxhOpDfJQ8gbUv41yORAptMWBNr6oqMhWird5+u+iHmBb2nhjDV7HWBNQTgK8y11l5NetWzc5ULscAtSj7nbNI0skhWeUZCc0W4nyH/jO4Vz0u1IeYhbk4AiwM6tjxIWByHsoZ9qcIBPJd/y+DwPfBESOmCa/QF3WiZHucLlEDpNxcNhmheEOPgdQNx6/VZFQzFZ5TN08AHXQt2Ii3EdyFuUsPtTcGPhW5iMiCNELvz+Gdn9huG4HUJaW/w3g0wxV0XaG7arG2WeKiUWYM4Y7GO5ezshTARbbWGw/DvXkpp/ivVvE0JVoMxN4rpGzJMhE5Pl+xlATsDIqikP9F9D2z3h9nOksEUFhK+qO4rcPkoalMQ/HqJLIyb3F3JdjrCcw1yZ8joyJLR5gCo54etlag7qIoeNh1N1BRYj3DTFJ0elotxPlVzkGuYAmL0VSJVGAJA41c4Z6A3BzTLfn0HYwYKEI6CUAMzZEWvLsIcQOo1AmmyyM72nHJCfYsogflGV6jEk9vyQZXSuq6w4c16NsGcGZbwOPr+H1RkOk2LEzjNepxQkihHSCQ4ynAYNRx2zMKV92CQMWqj8J0BRE8EShxRFN6YrfCRhC0x3r/Zm4IbQCcmJoV0kMamllccR6FjHqUC5F2R/wS2dcymOlfAKOS4KmzQb5cpNC2MC7JhVn5wjXoJ44rYhLh8n0eXOCorJxa7POjbSlCGVczr34/RsAmrcvo9s+wGp3tzVhntxiXiJ4nvEYb4FJkf0O8HocAePmLvCxnL0AORraVekJk6TYjDabRVXfRE2lCN1h6ZQRN1+InUbsCpKwoBZHh0dODN9JBCUffItXxEavTQkUtnfTVAplCWL3JISz29h4NjotnuSsQKJCk8dF+kJR6RARjrqFVmfPnj3ZbK8cIJ0msd6jgHPGtfVTQ8VLmlvh4mct9sobRmPic0DyDQQnx/NlfYUgyz59+oScsH379pAwXABD32nTpoUHIToESeI5mnbE/UqDdyLcafEBf2MCqgC7NwxIbMREJQ0g4D4sfJwnD+AmRrII05cfMWJE+L1169bQr+fip06dGp4oJ83lmYd5wj/EmMa4TaHivo4EeCguYZBnkB5g2aWA69OIEnUHOaGysjIYMGBAMGnSpODYsWPZwCpFmm4lNq+4gSLQA7jcX8DwtjEyRC8wjabnXEx9kfWnTJkSJkAo90xpJVV+FmcVNeYAF5zWngS4C4O91MBxmAv8blLEpbjI5sz9MTdAhcgkCT1RO8mZkAjfiYpTEvStAS53Uw1vAiUGgZ3GpuQEYvoiBqlIan7kSDHnTwJQFNiPu0+5VxCVYhcZIjNrdXUDdp+Eq5AZ3Gkg8QAyVZRZIk4Tl4QAbF9cXJxNYZMAtAokgs4BrNxEpCtteXg7DDTMDKYNSuQdKsnJBek7HxewvxaosWxLYXtw+cJp18217wql4aKCfBNoEu0O5VU+PhctJ0YeXD4C6JQpyrlpSLTojpGGGN5YwNziChdIZLk4lvLcFJ9jMX3QdiImY9bmGQU+TRUL5CHITTRlgF8D9ouD1MfmLoEPl5xokIumZ2cfgMpHt47IW9N64Hsh7wQYYjyIugWuF5fCqYncXRd5vPMWyizzvhi/32+nvG0dZc9vR6fZOu0md5e+uC408FvKSIOZwXlGvxPv95izA2Vtvg1xKFWARI+vMX66HUhpQQb643uW1bSjuTWyw2SBvDrBvjFic1eGGlz5esq3ko9uSIlBRqPuFcCv8F4WIcN12nVaBd0SaYwI6PDDImR11JkqgHcPmQssjxIn6bUshygDFJUTxPMpHk+jfjPgupgdnYV2R/g7xSjtpah8RJBewhwf0gGK6XI92u4wXFEU40afJ4DN4h5LcAd+40HI3JgJecuT0c062W0i2hQJUTcxan3/CMW1PF2K6bbA+Daz4xRs1D3Br1Cm0OihKCqizW78/nXAF/G5TXrEcVzaNMH6CyMswqsAHqDyDLEyou8lwOXnKF8DjI6KjV3KzMBiXkDH8ij/H214J5A596ekrZ3F0zXlWeL7+P5eUrNo3/QwC15uxthuzidy7DzKRwEDaAViiDgKbTbz7CJnzo0bN7pIfIiid8SuPwn25o3QCmpnyjlZkyxPP8EomCJzrGb7GJMx7tNsq4MT2xMUYaiErZOluTzKsnz3gwCeCZyVRZJfYplNEokEjwrPtxlxjeYAk+F1F74VAzPxQRNYYdtpOUvWs8J1sGhBJMNsb7igN8plJs1eSmLIhLKE4rvaCX27gOhLpLOsIzJ7qn/i+wZzcvSOZ23/du8TZjwV8zHIXoP4R3ifBxiFz1dcVpa3aPntPE+c6TmIWE9EtcMmAcPdWAhYhAXxcLOQi9L1WhD1Sc8p1d2oL7XGiRKp8F4A2i8K/nfI+y/gsTDJ/YC/8+AD5Uh04KHiGl+cIFPnBDDrPMjwRGkLXyxO4VGbfQWnDH2v0bVWE3C9QOXlepbgjEfIJQI6XDG3z5ahD9cw2pS78ipB85wyScNTvsVzlzzhL8/jRrnmVjfFJK/m3m4nj9vbgQTguT8XZTjsm672R5uJKEaQmBI/c58gyus8ZDagLpEVSJBIyHp4jn++xqPV71OgQgJYEWOtZ/haxRtKmWOBu8xdBLftWltsY84zE6WIEy/eIOWL+BaayMx+KHtL7EAkqdNDLiEXmEMUHniedtJqg9HmZtfvt26vNi0BdG3Ft3g8ZOf7PAu59TxtzivLNIekyi+wD1i8CuUiD9FXAa8C+/xS3JPmZnomyc7H+fb4/Se0bk41Fel621r4cgVxbq91V4jVqwB7HTe2M7jgB+QWHavZkDRPmZcASoZEmBx6i75bGjPcMdL4/VKGFAGWZkGzPG0XAbdL9A81G5LOmUnC9hHKJeO7dcUMjblSl12867ElFTtaGl20xvvLGPdVz/8TVuU7y0x1PG7vtNg24oz9Uo/Z412++VFWI7Fcog9tu9Lm6gvRmIPv9x1xmQAu6RDkXtbOtlGEmpgD5Nvnyc0dcv0EE6cfdi1HmhMf9wDF3k3gtRvEedhxjpgfqPb9PU9iEJHnyOUA7bQUXh6kq/D7l2iTjWv7XOD530BDr8jIrus+srXjt4MzumJMHuTsBa63YKE1+RR5lBjEikCCnWKWiHdzOgKO+nRIBAF88za/IFmJ3eMZov4CYxGBabcpGL8EYx+SeMXJeRwHNsV/h+vdxeuhEpN3ZyNY78Gm2fknJxVGhyjixPiQvVkNzT1elD9Py/aTAL64Hb9vcYmC9zfdXdT/C1LeGbg4rnBaAihDFJH12W5ulfNCNe/xTsP3bp8ikzJs5BF+5PNfAQYAPaseTdsEcaYAAAAASUVORK5CYII="
      };
    },
    computed: {
      iconSnowWidth() {
        return (Math.floor(this.iconSize / 24) || 1) * 2;
      },
      contentdownText() {
        return this.contentText.contentdown || t$1("uni-load-more.contentdown");
      },
      contentrefreshText() {
        return this.contentText.contentrefresh || t$1("uni-load-more.contentrefresh");
      },
      contentnomoreText() {
        return this.contentText.contentnomore || t$1("uni-load-more.contentnomore");
      }
    },
    mounted() {
      var pages2 = getCurrentPages();
      var page = pages2[pages2.length - 1];
      var currentWebview = page.$getAppWebview();
      currentWebview.addEventListener("hide", () => {
        this.webviewHide = true;
      });
      currentWebview.addEventListener("show", () => {
        this.webviewHide = false;
      });
    },
    methods: {
      onClick() {
        this.$emit("clickLoadMore", {
          detail: {
            status: this.status
          }
        });
      }
    }
  };
  function _sfc_render$w(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", {
      class: "uni-load-more",
      onClick: _cache[0] || (_cache[0] = (...args) => $options.onClick && $options.onClick(...args))
    }, [
      !$data.webviewHide && ($props.iconType === "circle" || $props.iconType === "auto" && $data.platform === "android") && $props.status === "loading" && $props.showIcon ? (vue.openBlock(), vue.createElementBlock(
        "view",
        {
          key: 0,
          style: vue.normalizeStyle({ width: $props.iconSize + "px", height: $props.iconSize + "px" }),
          class: "uni-load-more__img uni-load-more__img--android-MP"
        },
        [
          vue.createElementVNode(
            "view",
            {
              class: "uni-load-more__img-icon",
              style: vue.normalizeStyle({ borderTopColor: $props.color, borderTopWidth: $props.iconSize / 12 })
            },
            null,
            4
            /* STYLE */
          ),
          vue.createElementVNode(
            "view",
            {
              class: "uni-load-more__img-icon",
              style: vue.normalizeStyle({ borderTopColor: $props.color, borderTopWidth: $props.iconSize / 12 })
            },
            null,
            4
            /* STYLE */
          ),
          vue.createElementVNode(
            "view",
            {
              class: "uni-load-more__img-icon",
              style: vue.normalizeStyle({ borderTopColor: $props.color, borderTopWidth: $props.iconSize / 12 })
            },
            null,
            4
            /* STYLE */
          )
        ],
        4
        /* STYLE */
      )) : !$data.webviewHide && $props.status === "loading" && $props.showIcon ? (vue.openBlock(), vue.createElementBlock(
        "view",
        {
          key: 1,
          style: vue.normalizeStyle({ width: $props.iconSize + "px", height: $props.iconSize + "px" }),
          class: "uni-load-more__img uni-load-more__img--ios-H5"
        },
        [
          vue.createElementVNode("image", {
            src: $data.imgBase64,
            mode: "widthFix"
          }, null, 8, ["src"])
        ],
        4
        /* STYLE */
      )) : vue.createCommentVNode("v-if", true),
      $props.showText ? (vue.openBlock(), vue.createElementBlock(
        "text",
        {
          key: 2,
          class: "uni-load-more__text",
          style: vue.normalizeStyle({ color: $props.color })
        },
        vue.toDisplayString($props.status === "more" ? $options.contentdownText : $props.status === "loading" ? $options.contentrefreshText : $options.contentnomoreText),
        5
        /* TEXT, STYLE */
      )) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const __easycom_0$4 = /* @__PURE__ */ _export_sfc(_sfc_main$x, [["render", _sfc_render$w], ["__scopeId", "data-v-9245e42c"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/uni_modules/uni-load-more/components/uni-load-more/uni-load-more.vue"]]);
  const pages = [
    {
      path: "pages/index/index",
      style: {
        navigationBarTitleText: "首页",
        navigationStyle: "custom",
        enablePullDownRefresh: true
      }
    },
    {
      path: "pages/homepage/homepage",
      style: {
        navigationBarTitleText: "home",
        navigationStyle: "custom"
      }
    },
    {
      path: "pages/stock/stock",
      style: {
        navigationBarTitleText: "我的娃柜",
        navigationStyle: "custom"
      }
    },
    {
      path: "pages/mine/mine",
      style: {
        navigationBarTitleText: "个人信息",
        navigationStyle: "custom"
      }
    },
    {
      path: "pages/watch_demo/watch_demo",
      style: {
        navigationBarTitleText: "watch_demo"
      }
    },
    {
      path: "pages/goods/goods",
      style: {
        navigationBarTitleText: "商品页面",
        "app-plus": {
          softinputmode: "adjustResize"
        }
      }
    },
    {
      path: "pages/brand/brand",
      style: {
        navigationBarTitleText: "品牌页面"
      }
    },
    {
      path: "pages/calendar/calendar",
      style: {
        navigationBarTitleText: "上新",
        navigationStyle: "custom",
        enablePullDownRefresh: true
      }
    },
    {
      path: "pages/pop_croper/pop_croper",
      style: {
        navigationBarTitleText: ""
      }
    },
    {
      path: "pages/setting/setting",
      style: {
        navigationBarTitleText: ""
      }
    },
    {
      path: "pages/setting/password/password",
      style: {
        navigationBarTitleText: ""
      }
    },
    {
      path: "pages/setting/tel_phone/tel_phone",
      style: {
        navigationBarTitleText: ""
      }
    },
    {
      path: "pages/stock/account_book_form/account_book_form",
      style: {
        navigationBarTitleText: ""
      }
    },
    {
      path: "pages/stock/showcase_form/showcase_form",
      style: {
        navigationBarTitleText: ""
      }
    },
    {
      path: "pages/stock/bill_form/bill_form",
      style: {
        navigationBarTitleText: ""
      }
    },
    {
      path: "pages/collocation/collocation",
      style: {
        navigationBarTitleText: "分享搭配"
      }
    },
    {
      path: "pages/collocation_share/collocation_share",
      style: {
        navigationBarTitleText: ""
      }
    },
    {
      path: "pages/user_page/user_page",
      style: {
        navigationBarTitleText: ""
      }
    },
    {
      path: "pages/message_list/message_list",
      style: {
        navigationBarTitleText: ""
      }
    },
    {
      path: "pages/message_info/message_info",
      style: {
        navigationBarTitleText: ""
      }
    },
    {
      path: "pages/register/register",
      style: {
        navigationBarTitleText: ""
      }
    },
    {
      path: "pages/user_like/user_like",
      style: {
        navigationBarTitleText: ""
      }
    },
    {
      path: "pages/collocation_square/collocation_square",
      style: {
        navigationBarTitleText: "",
        navigationStyle: "custom",
        enablePullDownRefresh: true
      }
    },
    {
      path: "pages/sale_news/sale_news",
      style: {
        navigationBarTitleText: ""
      }
    },
    {
      path: "pages/treehole_publish/treehole_publish",
      style: {
        navigationBarTitleText: ""
      }
    },
    {
      path: "pages/treehole_detail/treehole_detail",
      style: {
        navigationBarTitleText: ""
      }
    },
    {
      path: "pages/reset_password/reset_password",
      style: {
        navigationBarTitleText: ""
      }
    },
    {
      path: "pages/setting/username/username",
      style: {
        navigationBarTitleText: ""
      }
    },
    {
      path: "pages/my_comment/my_comment",
      style: {
        navigationBarTitleText: ""
      }
    },
    {
      path: "pages/my_collocation/my_collocation",
      style: {
        navigationBarTitleText: ""
      }
    },
    {
      path: "pages/article_detail/article_detail",
      style: {
        navigationBarTitleText: ""
      }
    },
    {
      path: "pages/loadding/loadding",
      style: {
        navigationBarTitleText: ""
      }
    },
    {
      path: "pages/private/private",
      style: {
        navigationBarTitleText: ""
      }
    },
    {
      path: "pages/permission/permission",
      style: {
        navigationBarTitleText: ""
      }
    }
  ];
  const globalStyle = {
    navigationBarTextStyle: "black",
    navigationBarTitleText: "uni-app",
    navigationBarBackgroundColor: "#F8F8F8",
    backgroundColor: "#F8F8F8",
    rpxCalcMaxDeviceWidth: 750,
    rpxCalcBaseDeviceWidth: 375,
    rpxCalcIncludeWidth: 750
  };
  const tabBar = {
    selectedColor: "#7cc1d2",
    backgroundColor: "#fefefe",
    borderStyle: "white",
    list: [
      {
        pagePath: "pages/index/index",
        text: "百科",
        iconPath: "static/new-icon/home-w.png",
        selectedIconPath: "static/new-icon/home-b.png"
      },
      {
        pagePath: "pages/collocation_square/collocation_square",
        text: "广场",
        iconPath: "static/new-icon/home-w.png",
        selectedIconPath: "static/new-icon/home-b.png"
      },
      {
        pagePath: "pages/calendar/calendar",
        text: "上新",
        iconPath: "static/new-icon/date-w.png",
        selectedIconPath: "static/new-icon/date-b.png"
      },
      {
        pagePath: "pages/stock/stock",
        text: "娃柜",
        iconPath: "static/new-icon/stock-w.png",
        selectedIconPath: "static/new-icon/stock-b.png"
      },
      {
        pagePath: "pages/mine/mine",
        text: "我的",
        iconPath: "static/new-icon/mine-w.png",
        selectedIconPath: "static/new-icon/mine-b.png"
      }
    ]
  };
  const uniIdRouter = {};
  const e = {
    pages,
    globalStyle,
    tabBar,
    uniIdRouter
  };
  var define_process_env_UNI_SECURE_NETWORK_CONFIG_default = [];
  function t(e2) {
    return e2 && e2.__esModule && Object.prototype.hasOwnProperty.call(e2, "default") ? e2.default : e2;
  }
  function n(e2, t2, n2) {
    return e2(n2 = { path: t2, exports: {}, require: function(e3, t3) {
      return function() {
        throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs");
      }(null == t3 && n2.path);
    } }, n2.exports), n2.exports;
  }
  var s = n(function(e2, t2) {
    var n2;
    e2.exports = (n2 = n2 || function(e3, t3) {
      var n3 = Object.create || /* @__PURE__ */ function() {
        function e4() {
        }
        return function(t4) {
          var n4;
          return e4.prototype = t4, n4 = new e4(), e4.prototype = null, n4;
        };
      }(), s2 = {}, r2 = s2.lib = {}, i2 = r2.Base = { extend: function(e4) {
        var t4 = n3(this);
        return e4 && t4.mixIn(e4), t4.hasOwnProperty("init") && this.init !== t4.init || (t4.init = function() {
          t4.$super.init.apply(this, arguments);
        }), t4.init.prototype = t4, t4.$super = this, t4;
      }, create: function() {
        var e4 = this.extend();
        return e4.init.apply(e4, arguments), e4;
      }, init: function() {
      }, mixIn: function(e4) {
        for (var t4 in e4)
          e4.hasOwnProperty(t4) && (this[t4] = e4[t4]);
        e4.hasOwnProperty("toString") && (this.toString = e4.toString);
      }, clone: function() {
        return this.init.prototype.extend(this);
      } }, o2 = r2.WordArray = i2.extend({ init: function(e4, n4) {
        e4 = this.words = e4 || [], this.sigBytes = n4 != t3 ? n4 : 4 * e4.length;
      }, toString: function(e4) {
        return (e4 || c2).stringify(this);
      }, concat: function(e4) {
        var t4 = this.words, n4 = e4.words, s3 = this.sigBytes, r3 = e4.sigBytes;
        if (this.clamp(), s3 % 4)
          for (var i3 = 0; i3 < r3; i3++) {
            var o3 = n4[i3 >>> 2] >>> 24 - i3 % 4 * 8 & 255;
            t4[s3 + i3 >>> 2] |= o3 << 24 - (s3 + i3) % 4 * 8;
          }
        else
          for (i3 = 0; i3 < r3; i3 += 4)
            t4[s3 + i3 >>> 2] = n4[i3 >>> 2];
        return this.sigBytes += r3, this;
      }, clamp: function() {
        var t4 = this.words, n4 = this.sigBytes;
        t4[n4 >>> 2] &= 4294967295 << 32 - n4 % 4 * 8, t4.length = e3.ceil(n4 / 4);
      }, clone: function() {
        var e4 = i2.clone.call(this);
        return e4.words = this.words.slice(0), e4;
      }, random: function(t4) {
        for (var n4, s3 = [], r3 = function(t5) {
          t5 = t5;
          var n5 = 987654321, s4 = 4294967295;
          return function() {
            var r4 = ((n5 = 36969 * (65535 & n5) + (n5 >> 16) & s4) << 16) + (t5 = 18e3 * (65535 & t5) + (t5 >> 16) & s4) & s4;
            return r4 /= 4294967296, (r4 += 0.5) * (e3.random() > 0.5 ? 1 : -1);
          };
        }, i3 = 0; i3 < t4; i3 += 4) {
          var a3 = r3(4294967296 * (n4 || e3.random()));
          n4 = 987654071 * a3(), s3.push(4294967296 * a3() | 0);
        }
        return new o2.init(s3, t4);
      } }), a2 = s2.enc = {}, c2 = a2.Hex = { stringify: function(e4) {
        for (var t4 = e4.words, n4 = e4.sigBytes, s3 = [], r3 = 0; r3 < n4; r3++) {
          var i3 = t4[r3 >>> 2] >>> 24 - r3 % 4 * 8 & 255;
          s3.push((i3 >>> 4).toString(16)), s3.push((15 & i3).toString(16));
        }
        return s3.join("");
      }, parse: function(e4) {
        for (var t4 = e4.length, n4 = [], s3 = 0; s3 < t4; s3 += 2)
          n4[s3 >>> 3] |= parseInt(e4.substr(s3, 2), 16) << 24 - s3 % 8 * 4;
        return new o2.init(n4, t4 / 2);
      } }, u2 = a2.Latin1 = { stringify: function(e4) {
        for (var t4 = e4.words, n4 = e4.sigBytes, s3 = [], r3 = 0; r3 < n4; r3++) {
          var i3 = t4[r3 >>> 2] >>> 24 - r3 % 4 * 8 & 255;
          s3.push(String.fromCharCode(i3));
        }
        return s3.join("");
      }, parse: function(e4) {
        for (var t4 = e4.length, n4 = [], s3 = 0; s3 < t4; s3++)
          n4[s3 >>> 2] |= (255 & e4.charCodeAt(s3)) << 24 - s3 % 4 * 8;
        return new o2.init(n4, t4);
      } }, h2 = a2.Utf8 = { stringify: function(e4) {
        try {
          return decodeURIComponent(escape(u2.stringify(e4)));
        } catch (e5) {
          throw new Error("Malformed UTF-8 data");
        }
      }, parse: function(e4) {
        return u2.parse(unescape(encodeURIComponent(e4)));
      } }, l2 = r2.BufferedBlockAlgorithm = i2.extend({ reset: function() {
        this._data = new o2.init(), this._nDataBytes = 0;
      }, _append: function(e4) {
        "string" == typeof e4 && (e4 = h2.parse(e4)), this._data.concat(e4), this._nDataBytes += e4.sigBytes;
      }, _process: function(t4) {
        var n4 = this._data, s3 = n4.words, r3 = n4.sigBytes, i3 = this.blockSize, a3 = r3 / (4 * i3), c3 = (a3 = t4 ? e3.ceil(a3) : e3.max((0 | a3) - this._minBufferSize, 0)) * i3, u3 = e3.min(4 * c3, r3);
        if (c3) {
          for (var h3 = 0; h3 < c3; h3 += i3)
            this._doProcessBlock(s3, h3);
          var l3 = s3.splice(0, c3);
          n4.sigBytes -= u3;
        }
        return new o2.init(l3, u3);
      }, clone: function() {
        var e4 = i2.clone.call(this);
        return e4._data = this._data.clone(), e4;
      }, _minBufferSize: 0 });
      r2.Hasher = l2.extend({ cfg: i2.extend(), init: function(e4) {
        this.cfg = this.cfg.extend(e4), this.reset();
      }, reset: function() {
        l2.reset.call(this), this._doReset();
      }, update: function(e4) {
        return this._append(e4), this._process(), this;
      }, finalize: function(e4) {
        return e4 && this._append(e4), this._doFinalize();
      }, blockSize: 16, _createHelper: function(e4) {
        return function(t4, n4) {
          return new e4.init(n4).finalize(t4);
        };
      }, _createHmacHelper: function(e4) {
        return function(t4, n4) {
          return new d2.HMAC.init(e4, n4).finalize(t4);
        };
      } });
      var d2 = s2.algo = {};
      return s2;
    }(Math), n2);
  }), r = s, i = (n(function(e2, t2) {
    var n2;
    e2.exports = (n2 = r, function(e3) {
      var t3 = n2, s2 = t3.lib, r2 = s2.WordArray, i2 = s2.Hasher, o2 = t3.algo, a2 = [];
      !function() {
        for (var t4 = 0; t4 < 64; t4++)
          a2[t4] = 4294967296 * e3.abs(e3.sin(t4 + 1)) | 0;
      }();
      var c2 = o2.MD5 = i2.extend({ _doReset: function() {
        this._hash = new r2.init([1732584193, 4023233417, 2562383102, 271733878]);
      }, _doProcessBlock: function(e4, t4) {
        for (var n3 = 0; n3 < 16; n3++) {
          var s3 = t4 + n3, r3 = e4[s3];
          e4[s3] = 16711935 & (r3 << 8 | r3 >>> 24) | 4278255360 & (r3 << 24 | r3 >>> 8);
        }
        var i3 = this._hash.words, o3 = e4[t4 + 0], c3 = e4[t4 + 1], p2 = e4[t4 + 2], f2 = e4[t4 + 3], g2 = e4[t4 + 4], m2 = e4[t4 + 5], y2 = e4[t4 + 6], _2 = e4[t4 + 7], w2 = e4[t4 + 8], v2 = e4[t4 + 9], I2 = e4[t4 + 10], S2 = e4[t4 + 11], b2 = e4[t4 + 12], k2 = e4[t4 + 13], T2 = e4[t4 + 14], A2 = e4[t4 + 15], P2 = i3[0], C2 = i3[1], x2 = i3[2], O2 = i3[3];
        P2 = u2(P2, C2, x2, O2, o3, 7, a2[0]), O2 = u2(O2, P2, C2, x2, c3, 12, a2[1]), x2 = u2(x2, O2, P2, C2, p2, 17, a2[2]), C2 = u2(C2, x2, O2, P2, f2, 22, a2[3]), P2 = u2(P2, C2, x2, O2, g2, 7, a2[4]), O2 = u2(O2, P2, C2, x2, m2, 12, a2[5]), x2 = u2(x2, O2, P2, C2, y2, 17, a2[6]), C2 = u2(C2, x2, O2, P2, _2, 22, a2[7]), P2 = u2(P2, C2, x2, O2, w2, 7, a2[8]), O2 = u2(O2, P2, C2, x2, v2, 12, a2[9]), x2 = u2(x2, O2, P2, C2, I2, 17, a2[10]), C2 = u2(C2, x2, O2, P2, S2, 22, a2[11]), P2 = u2(P2, C2, x2, O2, b2, 7, a2[12]), O2 = u2(O2, P2, C2, x2, k2, 12, a2[13]), x2 = u2(x2, O2, P2, C2, T2, 17, a2[14]), P2 = h2(P2, C2 = u2(C2, x2, O2, P2, A2, 22, a2[15]), x2, O2, c3, 5, a2[16]), O2 = h2(O2, P2, C2, x2, y2, 9, a2[17]), x2 = h2(x2, O2, P2, C2, S2, 14, a2[18]), C2 = h2(C2, x2, O2, P2, o3, 20, a2[19]), P2 = h2(P2, C2, x2, O2, m2, 5, a2[20]), O2 = h2(O2, P2, C2, x2, I2, 9, a2[21]), x2 = h2(x2, O2, P2, C2, A2, 14, a2[22]), C2 = h2(C2, x2, O2, P2, g2, 20, a2[23]), P2 = h2(P2, C2, x2, O2, v2, 5, a2[24]), O2 = h2(O2, P2, C2, x2, T2, 9, a2[25]), x2 = h2(x2, O2, P2, C2, f2, 14, a2[26]), C2 = h2(C2, x2, O2, P2, w2, 20, a2[27]), P2 = h2(P2, C2, x2, O2, k2, 5, a2[28]), O2 = h2(O2, P2, C2, x2, p2, 9, a2[29]), x2 = h2(x2, O2, P2, C2, _2, 14, a2[30]), P2 = l2(P2, C2 = h2(C2, x2, O2, P2, b2, 20, a2[31]), x2, O2, m2, 4, a2[32]), O2 = l2(O2, P2, C2, x2, w2, 11, a2[33]), x2 = l2(x2, O2, P2, C2, S2, 16, a2[34]), C2 = l2(C2, x2, O2, P2, T2, 23, a2[35]), P2 = l2(P2, C2, x2, O2, c3, 4, a2[36]), O2 = l2(O2, P2, C2, x2, g2, 11, a2[37]), x2 = l2(x2, O2, P2, C2, _2, 16, a2[38]), C2 = l2(C2, x2, O2, P2, I2, 23, a2[39]), P2 = l2(P2, C2, x2, O2, k2, 4, a2[40]), O2 = l2(O2, P2, C2, x2, o3, 11, a2[41]), x2 = l2(x2, O2, P2, C2, f2, 16, a2[42]), C2 = l2(C2, x2, O2, P2, y2, 23, a2[43]), P2 = l2(P2, C2, x2, O2, v2, 4, a2[44]), O2 = l2(O2, P2, C2, x2, b2, 11, a2[45]), x2 = l2(x2, O2, P2, C2, A2, 16, a2[46]), P2 = d2(P2, C2 = l2(C2, x2, O2, P2, p2, 23, a2[47]), x2, O2, o3, 6, a2[48]), O2 = d2(O2, P2, C2, x2, _2, 10, a2[49]), x2 = d2(x2, O2, P2, C2, T2, 15, a2[50]), C2 = d2(C2, x2, O2, P2, m2, 21, a2[51]), P2 = d2(P2, C2, x2, O2, b2, 6, a2[52]), O2 = d2(O2, P2, C2, x2, f2, 10, a2[53]), x2 = d2(x2, O2, P2, C2, I2, 15, a2[54]), C2 = d2(C2, x2, O2, P2, c3, 21, a2[55]), P2 = d2(P2, C2, x2, O2, w2, 6, a2[56]), O2 = d2(O2, P2, C2, x2, A2, 10, a2[57]), x2 = d2(x2, O2, P2, C2, y2, 15, a2[58]), C2 = d2(C2, x2, O2, P2, k2, 21, a2[59]), P2 = d2(P2, C2, x2, O2, g2, 6, a2[60]), O2 = d2(O2, P2, C2, x2, S2, 10, a2[61]), x2 = d2(x2, O2, P2, C2, p2, 15, a2[62]), C2 = d2(C2, x2, O2, P2, v2, 21, a2[63]), i3[0] = i3[0] + P2 | 0, i3[1] = i3[1] + C2 | 0, i3[2] = i3[2] + x2 | 0, i3[3] = i3[3] + O2 | 0;
      }, _doFinalize: function() {
        var t4 = this._data, n3 = t4.words, s3 = 8 * this._nDataBytes, r3 = 8 * t4.sigBytes;
        n3[r3 >>> 5] |= 128 << 24 - r3 % 32;
        var i3 = e3.floor(s3 / 4294967296), o3 = s3;
        n3[15 + (r3 + 64 >>> 9 << 4)] = 16711935 & (i3 << 8 | i3 >>> 24) | 4278255360 & (i3 << 24 | i3 >>> 8), n3[14 + (r3 + 64 >>> 9 << 4)] = 16711935 & (o3 << 8 | o3 >>> 24) | 4278255360 & (o3 << 24 | o3 >>> 8), t4.sigBytes = 4 * (n3.length + 1), this._process();
        for (var a3 = this._hash, c3 = a3.words, u3 = 0; u3 < 4; u3++) {
          var h3 = c3[u3];
          c3[u3] = 16711935 & (h3 << 8 | h3 >>> 24) | 4278255360 & (h3 << 24 | h3 >>> 8);
        }
        return a3;
      }, clone: function() {
        var e4 = i2.clone.call(this);
        return e4._hash = this._hash.clone(), e4;
      } });
      function u2(e4, t4, n3, s3, r3, i3, o3) {
        var a3 = e4 + (t4 & n3 | ~t4 & s3) + r3 + o3;
        return (a3 << i3 | a3 >>> 32 - i3) + t4;
      }
      function h2(e4, t4, n3, s3, r3, i3, o3) {
        var a3 = e4 + (t4 & s3 | n3 & ~s3) + r3 + o3;
        return (a3 << i3 | a3 >>> 32 - i3) + t4;
      }
      function l2(e4, t4, n3, s3, r3, i3, o3) {
        var a3 = e4 + (t4 ^ n3 ^ s3) + r3 + o3;
        return (a3 << i3 | a3 >>> 32 - i3) + t4;
      }
      function d2(e4, t4, n3, s3, r3, i3, o3) {
        var a3 = e4 + (n3 ^ (t4 | ~s3)) + r3 + o3;
        return (a3 << i3 | a3 >>> 32 - i3) + t4;
      }
      t3.MD5 = i2._createHelper(c2), t3.HmacMD5 = i2._createHmacHelper(c2);
    }(Math), n2.MD5);
  }), n(function(e2, t2) {
    var n2;
    e2.exports = (n2 = r, void function() {
      var e3 = n2, t3 = e3.lib.Base, s2 = e3.enc.Utf8;
      e3.algo.HMAC = t3.extend({ init: function(e4, t4) {
        e4 = this._hasher = new e4.init(), "string" == typeof t4 && (t4 = s2.parse(t4));
        var n3 = e4.blockSize, r2 = 4 * n3;
        t4.sigBytes > r2 && (t4 = e4.finalize(t4)), t4.clamp();
        for (var i2 = this._oKey = t4.clone(), o2 = this._iKey = t4.clone(), a2 = i2.words, c2 = o2.words, u2 = 0; u2 < n3; u2++)
          a2[u2] ^= 1549556828, c2[u2] ^= 909522486;
        i2.sigBytes = o2.sigBytes = r2, this.reset();
      }, reset: function() {
        var e4 = this._hasher;
        e4.reset(), e4.update(this._iKey);
      }, update: function(e4) {
        return this._hasher.update(e4), this;
      }, finalize: function(e4) {
        var t4 = this._hasher, n3 = t4.finalize(e4);
        return t4.reset(), t4.finalize(this._oKey.clone().concat(n3));
      } });
    }());
  }), n(function(e2, t2) {
    e2.exports = r.HmacMD5;
  })), o = n(function(e2, t2) {
    e2.exports = r.enc.Utf8;
  }), a = n(function(e2, t2) {
    var n2;
    e2.exports = (n2 = r, function() {
      var e3 = n2, t3 = e3.lib.WordArray;
      function s2(e4, n3, s3) {
        for (var r2 = [], i2 = 0, o2 = 0; o2 < n3; o2++)
          if (o2 % 4) {
            var a2 = s3[e4.charCodeAt(o2 - 1)] << o2 % 4 * 2, c2 = s3[e4.charCodeAt(o2)] >>> 6 - o2 % 4 * 2;
            r2[i2 >>> 2] |= (a2 | c2) << 24 - i2 % 4 * 8, i2++;
          }
        return t3.create(r2, i2);
      }
      e3.enc.Base64 = { stringify: function(e4) {
        var t4 = e4.words, n3 = e4.sigBytes, s3 = this._map;
        e4.clamp();
        for (var r2 = [], i2 = 0; i2 < n3; i2 += 3)
          for (var o2 = (t4[i2 >>> 2] >>> 24 - i2 % 4 * 8 & 255) << 16 | (t4[i2 + 1 >>> 2] >>> 24 - (i2 + 1) % 4 * 8 & 255) << 8 | t4[i2 + 2 >>> 2] >>> 24 - (i2 + 2) % 4 * 8 & 255, a2 = 0; a2 < 4 && i2 + 0.75 * a2 < n3; a2++)
            r2.push(s3.charAt(o2 >>> 6 * (3 - a2) & 63));
        var c2 = s3.charAt(64);
        if (c2)
          for (; r2.length % 4; )
            r2.push(c2);
        return r2.join("");
      }, parse: function(e4) {
        var t4 = e4.length, n3 = this._map, r2 = this._reverseMap;
        if (!r2) {
          r2 = this._reverseMap = [];
          for (var i2 = 0; i2 < n3.length; i2++)
            r2[n3.charCodeAt(i2)] = i2;
        }
        var o2 = n3.charAt(64);
        if (o2) {
          var a2 = e4.indexOf(o2);
          -1 !== a2 && (t4 = a2);
        }
        return s2(e4, t4, r2);
      }, _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=" };
    }(), n2.enc.Base64);
  });
  const c = "FUNCTION", u = "OBJECT", h = "CLIENT_DB", l = "pending", d = "fulfilled", p = "rejected";
  function f(e2) {
    return Object.prototype.toString.call(e2).slice(8, -1).toLowerCase();
  }
  function g(e2) {
    return "object" === f(e2);
  }
  function m(e2) {
    return "function" == typeof e2;
  }
  function y(e2) {
    return function() {
      try {
        return e2.apply(e2, arguments);
      } catch (e3) {
        console.error(e3);
      }
    };
  }
  const _ = "REJECTED", w = "NOT_PENDING";
  class v {
    constructor({ createPromise: e2, retryRule: t2 = _ } = {}) {
      this.createPromise = e2, this.status = null, this.promise = null, this.retryRule = t2;
    }
    get needRetry() {
      if (!this.status)
        return true;
      switch (this.retryRule) {
        case _:
          return this.status === p;
        case w:
          return this.status !== l;
      }
    }
    exec() {
      return this.needRetry ? (this.status = l, this.promise = this.createPromise().then((e2) => (this.status = d, Promise.resolve(e2)), (e2) => (this.status = p, Promise.reject(e2))), this.promise) : this.promise;
    }
  }
  function I(e2) {
    return e2 && "string" == typeof e2 ? JSON.parse(e2) : e2;
  }
  const S = true, b = "app", T = I(define_process_env_UNI_SECURE_NETWORK_CONFIG_default), A = b, P = I(""), C = I("[]") || [];
  let O = "";
  try {
    O = "__UNI__5D7AAEE";
  } catch (e2) {
  }
  let E, L = {};
  function R(e2, t2 = {}) {
    var n2, s2;
    return n2 = L, s2 = e2, Object.prototype.hasOwnProperty.call(n2, s2) || (L[e2] = t2), L[e2];
  }
  function U() {
    return E || (E = function() {
      if ("undefined" != typeof globalThis)
        return globalThis;
      if ("undefined" != typeof self)
        return self;
      if ("undefined" != typeof window)
        return window;
      function e2() {
        return this;
      }
      return void 0 !== e2() ? e2() : new Function("return this")();
    }(), E);
  }
  L = uni._globalUniCloudObj ? uni._globalUniCloudObj : uni._globalUniCloudObj = {};
  const N = ["invoke", "success", "fail", "complete"], D = R("_globalUniCloudInterceptor");
  function M(e2, t2) {
    D[e2] || (D[e2] = {}), g(t2) && Object.keys(t2).forEach((n2) => {
      N.indexOf(n2) > -1 && function(e3, t3, n3) {
        let s2 = D[e3][t3];
        s2 || (s2 = D[e3][t3] = []), -1 === s2.indexOf(n3) && m(n3) && s2.push(n3);
      }(e2, n2, t2[n2]);
    });
  }
  function q(e2, t2) {
    D[e2] || (D[e2] = {}), g(t2) ? Object.keys(t2).forEach((n2) => {
      N.indexOf(n2) > -1 && function(e3, t3, n3) {
        const s2 = D[e3][t3];
        if (!s2)
          return;
        const r2 = s2.indexOf(n3);
        r2 > -1 && s2.splice(r2, 1);
      }(e2, n2, t2[n2]);
    }) : delete D[e2];
  }
  function K(e2, t2) {
    return e2 && 0 !== e2.length ? e2.reduce((e3, n2) => e3.then(() => n2(t2)), Promise.resolve()) : Promise.resolve();
  }
  function F(e2, t2) {
    return D[e2] && D[e2][t2] || [];
  }
  function j(e2) {
    M("callObject", e2);
  }
  const $ = R("_globalUniCloudListener"), B = "response", W = "needLogin", H = "refreshToken", J = "clientdb", z = "cloudfunction", V = "cloudobject";
  function G(e2) {
    return $[e2] || ($[e2] = []), $[e2];
  }
  function Y(e2, t2) {
    const n2 = G(e2);
    n2.includes(t2) || n2.push(t2);
  }
  function Q(e2, t2) {
    const n2 = G(e2), s2 = n2.indexOf(t2);
    -1 !== s2 && n2.splice(s2, 1);
  }
  function X(e2, t2) {
    const n2 = G(e2);
    for (let e3 = 0; e3 < n2.length; e3++) {
      (0, n2[e3])(t2);
    }
  }
  let Z, ee = false;
  function te() {
    return Z || (Z = new Promise((e2) => {
      ee && e2(), function t2() {
        if ("function" == typeof getCurrentPages) {
          const t3 = getCurrentPages();
          t3 && t3[0] && (ee = true, e2());
        }
        ee || setTimeout(() => {
          t2();
        }, 30);
      }();
    }), Z);
  }
  function ne(e2) {
    const t2 = {};
    for (const n2 in e2) {
      const s2 = e2[n2];
      m(s2) && (t2[n2] = y(s2));
    }
    return t2;
  }
  class se extends Error {
    constructor(e2) {
      super(e2.message), this.errMsg = e2.message || e2.errMsg || "unknown system error", this.code = this.errCode = e2.code || e2.errCode || "SYSTEM_ERROR", this.errSubject = this.subject = e2.subject || e2.errSubject, this.cause = e2.cause, this.requestId = e2.requestId;
    }
    toJson(e2 = 0) {
      if (!(e2 >= 10))
        return e2++, { errCode: this.errCode, errMsg: this.errMsg, errSubject: this.errSubject, cause: this.cause && this.cause.toJson ? this.cause.toJson(e2) : this.cause };
    }
  }
  var re = { request: (e2) => uni.request(e2), uploadFile: (e2) => uni.uploadFile(e2), setStorageSync: (e2, t2) => uni.setStorageSync(e2, t2), getStorageSync: (e2) => uni.getStorageSync(e2), removeStorageSync: (e2) => uni.removeStorageSync(e2), clearStorageSync: () => uni.clearStorageSync(), connectSocket: (e2) => uni.connectSocket(e2) };
  function ie(e2) {
    return e2 && ie(e2.__v_raw) || e2;
  }
  function oe() {
    return { token: re.getStorageSync("uni_id_token") || re.getStorageSync("uniIdToken"), tokenExpired: re.getStorageSync("uni_id_token_expired") };
  }
  function ae({ token: e2, tokenExpired: t2 } = {}) {
    e2 && re.setStorageSync("uni_id_token", e2), t2 && re.setStorageSync("uni_id_token_expired", t2);
  }
  let ce, ue;
  function he() {
    return ce || (ce = uni.getSystemInfoSync()), ce;
  }
  function le() {
    let e2, t2;
    try {
      if (uni.getLaunchOptionsSync) {
        if (uni.getLaunchOptionsSync.toString().indexOf("not yet implemented") > -1)
          return;
        const { scene: n2, channel: s2 } = uni.getLaunchOptionsSync();
        e2 = s2, t2 = n2;
      }
    } catch (e3) {
    }
    return { channel: e2, scene: t2 };
  }
  let de = {};
  function pe() {
    const e2 = uni.getLocale && uni.getLocale() || "en";
    if (ue)
      return { ...de, ...ue, locale: e2, LOCALE: e2 };
    const t2 = he(), { deviceId: n2, osName: s2, uniPlatform: r2, appId: i2 } = t2, o2 = ["appId", "appLanguage", "appName", "appVersion", "appVersionCode", "appWgtVersion", "browserName", "browserVersion", "deviceBrand", "deviceId", "deviceModel", "deviceType", "osName", "osVersion", "romName", "romVersion", "ua", "hostName", "hostVersion", "uniPlatform", "uniRuntimeVersion", "uniRuntimeVersionCode", "uniCompilerVersion", "uniCompilerVersionCode"];
    for (const e3 in t2)
      Object.hasOwnProperty.call(t2, e3) && -1 === o2.indexOf(e3) && delete t2[e3];
    return ue = { PLATFORM: r2, OS: s2, APPID: i2, DEVICEID: n2, ...le(), ...t2 }, { ...de, ...ue, locale: e2, LOCALE: e2 };
  }
  var fe = { sign: function(e2, t2) {
    let n2 = "";
    return Object.keys(e2).sort().forEach(function(t3) {
      e2[t3] && (n2 = n2 + "&" + t3 + "=" + e2[t3]);
    }), n2 = n2.slice(1), i(n2, t2).toString();
  }, wrappedRequest: function(e2, t2) {
    return new Promise((n2, s2) => {
      t2(Object.assign(e2, { complete(e3) {
        e3 || (e3 = {});
        const t3 = e3.data && e3.data.header && e3.data.header["x-serverless-request-id"] || e3.header && e3.header["request-id"];
        if (!e3.statusCode || e3.statusCode >= 400) {
          const n3 = e3.data && e3.data.error && e3.data.error.code || "SYS_ERR", r3 = e3.data && e3.data.error && e3.data.error.message || e3.errMsg || "request:fail";
          return s2(new se({ code: n3, message: r3, requestId: t3 }));
        }
        const r2 = e3.data;
        if (r2.error)
          return s2(new se({ code: r2.error.code, message: r2.error.message, requestId: t3 }));
        r2.result = r2.data, r2.requestId = t3, delete r2.data, n2(r2);
      } }));
    });
  }, toBase64: function(e2) {
    return a.stringify(o.parse(e2));
  } };
  var ge = class {
    constructor(e2) {
      ["spaceId", "clientSecret"].forEach((t2) => {
        if (!Object.prototype.hasOwnProperty.call(e2, t2))
          throw new Error(`${t2} required`);
      }), this.config = Object.assign({}, { endpoint: 0 === e2.spaceId.indexOf("mp-") ? "https://api.next.bspapp.com" : "https://api.bspapp.com" }, e2), this.config.provider = "aliyun", this.config.requestUrl = this.config.endpoint + "/client", this.config.envType = this.config.envType || "public", this.config.accessTokenKey = "access_token_" + this.config.spaceId, this.adapter = re, this._getAccessTokenPromiseHub = new v({ createPromise: () => this.requestAuth(this.setupRequest({ method: "serverless.auth.user.anonymousAuthorize", params: "{}" }, "auth")).then((e3) => {
        if (!e3.result || !e3.result.accessToken)
          throw new se({ code: "AUTH_FAILED", message: "获取accessToken失败" });
        this.setAccessToken(e3.result.accessToken);
      }), retryRule: w });
    }
    get hasAccessToken() {
      return !!this.accessToken;
    }
    setAccessToken(e2) {
      this.accessToken = e2;
    }
    requestWrapped(e2) {
      return fe.wrappedRequest(e2, this.adapter.request);
    }
    requestAuth(e2) {
      return this.requestWrapped(e2);
    }
    request(e2, t2) {
      return Promise.resolve().then(() => this.hasAccessToken ? t2 ? this.requestWrapped(e2) : this.requestWrapped(e2).catch((t3) => new Promise((e3, n2) => {
        !t3 || "GATEWAY_INVALID_TOKEN" !== t3.code && "InvalidParameter.InvalidToken" !== t3.code ? n2(t3) : e3();
      }).then(() => this.getAccessToken()).then(() => {
        const t4 = this.rebuildRequest(e2);
        return this.request(t4, true);
      })) : this.getAccessToken().then(() => {
        const t3 = this.rebuildRequest(e2);
        return this.request(t3, true);
      }));
    }
    rebuildRequest(e2) {
      const t2 = Object.assign({}, e2);
      return t2.data.token = this.accessToken, t2.header["x-basement-token"] = this.accessToken, t2.header["x-serverless-sign"] = fe.sign(t2.data, this.config.clientSecret), t2;
    }
    setupRequest(e2, t2) {
      const n2 = Object.assign({}, e2, { spaceId: this.config.spaceId, timestamp: Date.now() }), s2 = { "Content-Type": "application/json" };
      return "auth" !== t2 && (n2.token = this.accessToken, s2["x-basement-token"] = this.accessToken), s2["x-serverless-sign"] = fe.sign(n2, this.config.clientSecret), { url: this.config.requestUrl, method: "POST", data: n2, dataType: "json", header: s2 };
    }
    getAccessToken() {
      return this._getAccessTokenPromiseHub.exec();
    }
    async authorize() {
      await this.getAccessToken();
    }
    callFunction(e2) {
      const t2 = { method: "serverless.function.runtime.invoke", params: JSON.stringify({ functionTarget: e2.name, functionArgs: e2.data || {} }) };
      return this.request({ ...this.setupRequest(t2), timeout: e2.timeout });
    }
    getOSSUploadOptionsFromPath(e2) {
      const t2 = { method: "serverless.file.resource.generateProximalSign", params: JSON.stringify(e2) };
      return this.request(this.setupRequest(t2));
    }
    uploadFileToOSS({ url: e2, formData: t2, name: n2, filePath: s2, fileType: r2, onUploadProgress: i2 }) {
      return new Promise((o2, a2) => {
        const c2 = this.adapter.uploadFile({ url: e2, formData: t2, name: n2, filePath: s2, fileType: r2, header: { "X-OSS-server-side-encrpytion": "AES256" }, success(e3) {
          e3 && e3.statusCode < 400 ? o2(e3) : a2(new se({ code: "UPLOAD_FAILED", message: "文件上传失败" }));
        }, fail(e3) {
          a2(new se({ code: e3.code || "UPLOAD_FAILED", message: e3.message || e3.errMsg || "文件上传失败" }));
        } });
        "function" == typeof i2 && c2 && "function" == typeof c2.onProgressUpdate && c2.onProgressUpdate((e3) => {
          i2({ loaded: e3.totalBytesSent, total: e3.totalBytesExpectedToSend });
        });
      });
    }
    reportOSSUpload(e2) {
      const t2 = { method: "serverless.file.resource.report", params: JSON.stringify(e2) };
      return this.request(this.setupRequest(t2));
    }
    async uploadFile({ filePath: e2, cloudPath: t2, fileType: n2 = "image", cloudPathAsRealPath: s2 = false, onUploadProgress: r2, config: i2 }) {
      if ("string" !== f(t2))
        throw new se({ code: "INVALID_PARAM", message: "cloudPath必须为字符串类型" });
      if (!(t2 = t2.trim()))
        throw new se({ code: "INVALID_PARAM", message: "cloudPath不可为空" });
      if (/:\/\//.test(t2))
        throw new se({ code: "INVALID_PARAM", message: "cloudPath不合法" });
      const o2 = i2 && i2.envType || this.config.envType;
      if (s2 && ("/" !== t2[0] && (t2 = "/" + t2), t2.indexOf("\\") > -1))
        throw new se({ code: "INVALID_PARAM", message: "使用cloudPath作为路径时，cloudPath不可包含“\\”" });
      const a2 = (await this.getOSSUploadOptionsFromPath({ env: o2, filename: s2 ? t2.split("/").pop() : t2, fileId: s2 ? t2 : void 0 })).result, c2 = "https://" + a2.cdnDomain + "/" + a2.ossPath, { securityToken: u2, accessKeyId: h2, signature: l2, host: d2, ossPath: p2, id: g2, policy: m2, ossCallbackUrl: y2 } = a2, _2 = { "Cache-Control": "max-age=2592000", "Content-Disposition": "attachment", OSSAccessKeyId: h2, Signature: l2, host: d2, id: g2, key: p2, policy: m2, success_action_status: 200 };
      if (u2 && (_2["x-oss-security-token"] = u2), y2) {
        const e3 = JSON.stringify({ callbackUrl: y2, callbackBody: JSON.stringify({ fileId: g2, spaceId: this.config.spaceId }), callbackBodyType: "application/json" });
        _2.callback = fe.toBase64(e3);
      }
      const w2 = { url: "https://" + a2.host, formData: _2, fileName: "file", name: "file", filePath: e2, fileType: n2 };
      if (await this.uploadFileToOSS(Object.assign({}, w2, { onUploadProgress: r2 })), y2)
        return { success: true, filePath: e2, fileID: c2 };
      if ((await this.reportOSSUpload({ id: g2 })).success)
        return { success: true, filePath: e2, fileID: c2 };
      throw new se({ code: "UPLOAD_FAILED", message: "文件上传失败" });
    }
    getTempFileURL({ fileList: e2 } = {}) {
      return new Promise((t2, n2) => {
        Array.isArray(e2) && 0 !== e2.length || n2(new se({ code: "INVALID_PARAM", message: "fileList的元素必须是非空的字符串" })), t2({ fileList: e2.map((e3) => ({ fileID: e3, tempFileURL: e3 })) });
      });
    }
    async getFileInfo({ fileList: e2 } = {}) {
      if (!Array.isArray(e2) || 0 === e2.length)
        throw new se({ code: "INVALID_PARAM", message: "fileList的元素必须是非空的字符串" });
      const t2 = { method: "serverless.file.resource.info", params: JSON.stringify({ id: e2.map((e3) => e3.split("?")[0]).join(",") }) };
      return { fileList: (await this.request(this.setupRequest(t2))).result };
    }
  };
  var me = { init(e2) {
    const t2 = new ge(e2), n2 = { signInAnonymously: function() {
      return t2.authorize();
    }, getLoginState: function() {
      return Promise.resolve(false);
    } };
    return t2.auth = function() {
      return n2;
    }, t2.customAuth = t2.auth, t2;
  } };
  const ye = "undefined" != typeof location && "http:" === location.protocol ? "http:" : "https:";
  var _e;
  !function(e2) {
    e2.local = "local", e2.none = "none", e2.session = "session";
  }(_e || (_e = {}));
  var we = function() {
  }, ve = n(function(e2, t2) {
    var n2;
    e2.exports = (n2 = r, function(e3) {
      var t3 = n2, s2 = t3.lib, r2 = s2.WordArray, i2 = s2.Hasher, o2 = t3.algo, a2 = [], c2 = [];
      !function() {
        function t4(t5) {
          for (var n4 = e3.sqrt(t5), s4 = 2; s4 <= n4; s4++)
            if (!(t5 % s4))
              return false;
          return true;
        }
        function n3(e4) {
          return 4294967296 * (e4 - (0 | e4)) | 0;
        }
        for (var s3 = 2, r3 = 0; r3 < 64; )
          t4(s3) && (r3 < 8 && (a2[r3] = n3(e3.pow(s3, 0.5))), c2[r3] = n3(e3.pow(s3, 1 / 3)), r3++), s3++;
      }();
      var u2 = [], h2 = o2.SHA256 = i2.extend({ _doReset: function() {
        this._hash = new r2.init(a2.slice(0));
      }, _doProcessBlock: function(e4, t4) {
        for (var n3 = this._hash.words, s3 = n3[0], r3 = n3[1], i3 = n3[2], o3 = n3[3], a3 = n3[4], h3 = n3[5], l2 = n3[6], d2 = n3[7], p2 = 0; p2 < 64; p2++) {
          if (p2 < 16)
            u2[p2] = 0 | e4[t4 + p2];
          else {
            var f2 = u2[p2 - 15], g2 = (f2 << 25 | f2 >>> 7) ^ (f2 << 14 | f2 >>> 18) ^ f2 >>> 3, m2 = u2[p2 - 2], y2 = (m2 << 15 | m2 >>> 17) ^ (m2 << 13 | m2 >>> 19) ^ m2 >>> 10;
            u2[p2] = g2 + u2[p2 - 7] + y2 + u2[p2 - 16];
          }
          var _2 = s3 & r3 ^ s3 & i3 ^ r3 & i3, w2 = (s3 << 30 | s3 >>> 2) ^ (s3 << 19 | s3 >>> 13) ^ (s3 << 10 | s3 >>> 22), v2 = d2 + ((a3 << 26 | a3 >>> 6) ^ (a3 << 21 | a3 >>> 11) ^ (a3 << 7 | a3 >>> 25)) + (a3 & h3 ^ ~a3 & l2) + c2[p2] + u2[p2];
          d2 = l2, l2 = h3, h3 = a3, a3 = o3 + v2 | 0, o3 = i3, i3 = r3, r3 = s3, s3 = v2 + (w2 + _2) | 0;
        }
        n3[0] = n3[0] + s3 | 0, n3[1] = n3[1] + r3 | 0, n3[2] = n3[2] + i3 | 0, n3[3] = n3[3] + o3 | 0, n3[4] = n3[4] + a3 | 0, n3[5] = n3[5] + h3 | 0, n3[6] = n3[6] + l2 | 0, n3[7] = n3[7] + d2 | 0;
      }, _doFinalize: function() {
        var t4 = this._data, n3 = t4.words, s3 = 8 * this._nDataBytes, r3 = 8 * t4.sigBytes;
        return n3[r3 >>> 5] |= 128 << 24 - r3 % 32, n3[14 + (r3 + 64 >>> 9 << 4)] = e3.floor(s3 / 4294967296), n3[15 + (r3 + 64 >>> 9 << 4)] = s3, t4.sigBytes = 4 * n3.length, this._process(), this._hash;
      }, clone: function() {
        var e4 = i2.clone.call(this);
        return e4._hash = this._hash.clone(), e4;
      } });
      t3.SHA256 = i2._createHelper(h2), t3.HmacSHA256 = i2._createHmacHelper(h2);
    }(Math), n2.SHA256);
  }), Ie = ve, Se = n(function(e2, t2) {
    e2.exports = r.HmacSHA256;
  });
  const be = () => {
    let e2;
    if (!Promise) {
      e2 = () => {
      }, e2.promise = {};
      const t3 = () => {
        throw new se({ message: 'Your Node runtime does support ES6 Promises. Set "global.Promise" to your preferred implementation of promises.' });
      };
      return Object.defineProperty(e2.promise, "then", { get: t3 }), Object.defineProperty(e2.promise, "catch", { get: t3 }), e2;
    }
    const t2 = new Promise((t3, n2) => {
      e2 = (e3, s2) => e3 ? n2(e3) : t3(s2);
    });
    return e2.promise = t2, e2;
  };
  function ke(e2) {
    return void 0 === e2;
  }
  function Te(e2) {
    return "[object Null]" === Object.prototype.toString.call(e2);
  }
  function Ae(e2 = "") {
    return e2.replace(/([\s\S]+)\s+(请前往云开发AI小助手查看问题：.*)/, "$1");
  }
  function Pe(e2 = 32) {
    const t2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", n2 = t2.length;
    let s2 = "";
    for (let r2 = 0; r2 < e2; r2++)
      s2 += t2.charAt(Math.floor(Math.random() * n2));
    return s2;
  }
  var Ce;
  function xe(e2) {
    const t2 = (n2 = e2, "[object Array]" === Object.prototype.toString.call(n2) ? e2 : [e2]);
    var n2;
    for (const e3 of t2) {
      const { isMatch: t3, genAdapter: n3, runtime: s2 } = e3;
      if (t3())
        return { adapter: n3(), runtime: s2 };
    }
  }
  !function(e2) {
    e2.WEB = "web", e2.WX_MP = "wx_mp";
  }(Ce || (Ce = {}));
  const Oe = { adapter: null, runtime: void 0 }, Ee = ["anonymousUuidKey"];
  class Le extends we {
    constructor() {
      super(), Oe.adapter.root.tcbObject || (Oe.adapter.root.tcbObject = {});
    }
    setItem(e2, t2) {
      Oe.adapter.root.tcbObject[e2] = t2;
    }
    getItem(e2) {
      return Oe.adapter.root.tcbObject[e2];
    }
    removeItem(e2) {
      delete Oe.adapter.root.tcbObject[e2];
    }
    clear() {
      delete Oe.adapter.root.tcbObject;
    }
  }
  function Re(e2, t2) {
    switch (e2) {
      case "local":
        return t2.localStorage || new Le();
      case "none":
        return new Le();
      default:
        return t2.sessionStorage || new Le();
    }
  }
  class Ue {
    constructor(e2) {
      if (!this._storage) {
        this._persistence = Oe.adapter.primaryStorage || e2.persistence, this._storage = Re(this._persistence, Oe.adapter);
        const t2 = `access_token_${e2.env}`, n2 = `access_token_expire_${e2.env}`, s2 = `refresh_token_${e2.env}`, r2 = `anonymous_uuid_${e2.env}`, i2 = `login_type_${e2.env}`, o2 = "device_id", a2 = `token_type_${e2.env}`, c2 = `user_info_${e2.env}`;
        this.keys = { accessTokenKey: t2, accessTokenExpireKey: n2, refreshTokenKey: s2, anonymousUuidKey: r2, loginTypeKey: i2, userInfoKey: c2, deviceIdKey: o2, tokenTypeKey: a2 };
      }
    }
    updatePersistence(e2) {
      if (e2 === this._persistence)
        return;
      const t2 = "local" === this._persistence;
      this._persistence = e2;
      const n2 = Re(e2, Oe.adapter);
      for (const e3 in this.keys) {
        const s2 = this.keys[e3];
        if (t2 && Ee.includes(e3))
          continue;
        const r2 = this._storage.getItem(s2);
        ke(r2) || Te(r2) || (n2.setItem(s2, r2), this._storage.removeItem(s2));
      }
      this._storage = n2;
    }
    setStore(e2, t2, n2) {
      if (!this._storage)
        return;
      const s2 = { version: n2 || "localCachev1", content: t2 }, r2 = JSON.stringify(s2);
      try {
        this._storage.setItem(e2, r2);
      } catch (e3) {
        throw e3;
      }
    }
    getStore(e2, t2) {
      try {
        if (!this._storage)
          return;
      } catch (e3) {
        return "";
      }
      t2 = t2 || "localCachev1";
      const n2 = this._storage.getItem(e2);
      if (!n2)
        return "";
      if (n2.indexOf(t2) >= 0) {
        return JSON.parse(n2).content;
      }
      return "";
    }
    removeStore(e2) {
      this._storage.removeItem(e2);
    }
  }
  const Ne = {}, De = {};
  function Me(e2) {
    return Ne[e2];
  }
  class qe {
    constructor(e2, t2) {
      this.data = t2 || null, this.name = e2;
    }
  }
  class Ke extends qe {
    constructor(e2, t2) {
      super("error", { error: e2, data: t2 }), this.error = e2;
    }
  }
  const Fe = new class {
    constructor() {
      this._listeners = {};
    }
    on(e2, t2) {
      return function(e3, t3, n2) {
        n2[e3] = n2[e3] || [], n2[e3].push(t3);
      }(e2, t2, this._listeners), this;
    }
    off(e2, t2) {
      return function(e3, t3, n2) {
        if (n2 && n2[e3]) {
          const s2 = n2[e3].indexOf(t3);
          -1 !== s2 && n2[e3].splice(s2, 1);
        }
      }(e2, t2, this._listeners), this;
    }
    fire(e2, t2) {
      if (e2 instanceof Ke)
        return console.error(e2.error), this;
      const n2 = "string" == typeof e2 ? new qe(e2, t2 || {}) : e2;
      const s2 = n2.name;
      if (this._listens(s2)) {
        n2.target = this;
        const e3 = this._listeners[s2] ? [...this._listeners[s2]] : [];
        for (const t3 of e3)
          t3.call(this, n2);
      }
      return this;
    }
    _listens(e2) {
      return this._listeners[e2] && this._listeners[e2].length > 0;
    }
  }();
  function je(e2, t2) {
    Fe.on(e2, t2);
  }
  function $e(e2, t2 = {}) {
    Fe.fire(e2, t2);
  }
  function Be(e2, t2) {
    Fe.off(e2, t2);
  }
  const We = "loginStateChanged", He = "loginStateExpire", Je = "loginTypeChanged", ze = "anonymousConverted", Ve = "refreshAccessToken";
  var Ge;
  !function(e2) {
    e2.ANONYMOUS = "ANONYMOUS", e2.WECHAT = "WECHAT", e2.WECHAT_PUBLIC = "WECHAT-PUBLIC", e2.WECHAT_OPEN = "WECHAT-OPEN", e2.CUSTOM = "CUSTOM", e2.EMAIL = "EMAIL", e2.USERNAME = "USERNAME", e2.NULL = "NULL";
  }(Ge || (Ge = {}));
  class Ye {
    constructor() {
      this._fnPromiseMap = /* @__PURE__ */ new Map();
    }
    async run(e2, t2) {
      let n2 = this._fnPromiseMap.get(e2);
      return n2 || (n2 = new Promise(async (n3, s2) => {
        try {
          await this._runIdlePromise();
          const s3 = t2();
          n3(await s3);
        } catch (e3) {
          s2(e3);
        } finally {
          this._fnPromiseMap.delete(e2);
        }
      }), this._fnPromiseMap.set(e2, n2)), n2;
    }
    _runIdlePromise() {
      return Promise.resolve();
    }
  }
  class Qe {
    constructor(e2) {
      this._singlePromise = new Ye(), this._cache = Me(e2.env), this._baseURL = `https://${e2.env}.ap-shanghai.tcb-api.tencentcloudapi.com`, this._reqClass = new Oe.adapter.reqClass({ timeout: e2.timeout, timeoutMsg: `请求在${e2.timeout / 1e3}s内未完成，已中断`, restrictedMethods: ["post"] });
    }
    _getDeviceId() {
      if (this._deviceID)
        return this._deviceID;
      const { deviceIdKey: e2 } = this._cache.keys;
      let t2 = this._cache.getStore(e2);
      return "string" == typeof t2 && t2.length >= 16 && t2.length <= 48 || (t2 = Pe(), this._cache.setStore(e2, t2)), this._deviceID = t2, t2;
    }
    async _request(e2, t2, n2 = {}) {
      const s2 = { "x-request-id": Pe(), "x-device-id": this._getDeviceId() };
      if (n2.withAccessToken) {
        const { tokenTypeKey: e3 } = this._cache.keys, t3 = await this.getAccessToken(), n3 = this._cache.getStore(e3);
        s2.authorization = `${n3} ${t3}`;
      }
      return this._reqClass["get" === n2.method ? "get" : "post"]({ url: `${this._baseURL}${e2}`, data: t2, headers: s2 });
    }
    async _fetchAccessToken() {
      const { loginTypeKey: e2, accessTokenKey: t2, accessTokenExpireKey: n2, tokenTypeKey: s2 } = this._cache.keys, r2 = this._cache.getStore(e2);
      if (r2 && r2 !== Ge.ANONYMOUS)
        throw new se({ code: "INVALID_OPERATION", message: "非匿名登录不支持刷新 access token" });
      const i2 = await this._singlePromise.run("fetchAccessToken", async () => (await this._request("/auth/v1/signin/anonymously", {}, { method: "post" })).data), { access_token: o2, expires_in: a2, token_type: c2 } = i2;
      return this._cache.setStore(s2, c2), this._cache.setStore(t2, o2), this._cache.setStore(n2, Date.now() + 1e3 * a2), o2;
    }
    isAccessTokenExpired(e2, t2) {
      let n2 = true;
      return e2 && t2 && (n2 = t2 < Date.now()), n2;
    }
    async getAccessToken() {
      const { accessTokenKey: e2, accessTokenExpireKey: t2 } = this._cache.keys, n2 = this._cache.getStore(e2), s2 = this._cache.getStore(t2);
      return this.isAccessTokenExpired(n2, s2) ? this._fetchAccessToken() : n2;
    }
    async refreshAccessToken() {
      const { accessTokenKey: e2, accessTokenExpireKey: t2, loginTypeKey: n2 } = this._cache.keys;
      return this._cache.removeStore(e2), this._cache.removeStore(t2), this._cache.setStore(n2, Ge.ANONYMOUS), this.getAccessToken();
    }
    async getUserInfo() {
      return this._singlePromise.run("getUserInfo", async () => (await this._request("/auth/v1/user/me", {}, { withAccessToken: true, method: "get" })).data);
    }
  }
  const Xe = ["auth.getJwt", "auth.logout", "auth.signInWithTicket", "auth.signInAnonymously", "auth.signIn", "auth.fetchAccessTokenWithRefreshToken", "auth.signUpWithEmailAndPassword", "auth.activateEndUserMail", "auth.sendPasswordResetEmail", "auth.resetPasswordWithToken", "auth.isUsernameRegistered"], Ze = { "X-SDK-Version": "1.3.5" };
  function et(e2, t2, n2) {
    const s2 = e2[t2];
    e2[t2] = function(t3) {
      const r2 = {}, i2 = {};
      n2.forEach((n3) => {
        const { data: s3, headers: o3 } = n3.call(e2, t3);
        Object.assign(r2, s3), Object.assign(i2, o3);
      });
      const o2 = t3.data;
      return o2 && (() => {
        var e3;
        if (e3 = o2, "[object FormData]" !== Object.prototype.toString.call(e3))
          t3.data = { ...o2, ...r2 };
        else
          for (const e4 in r2)
            o2.append(e4, r2[e4]);
      })(), t3.headers = { ...t3.headers || {}, ...i2 }, s2.call(e2, t3);
    };
  }
  function tt() {
    const e2 = Math.random().toString(16).slice(2);
    return { data: { seqId: e2 }, headers: { ...Ze, "x-seqid": e2 } };
  }
  class nt {
    constructor(e2 = {}) {
      var t2;
      this.config = e2, this._reqClass = new Oe.adapter.reqClass({ timeout: this.config.timeout, timeoutMsg: `请求在${this.config.timeout / 1e3}s内未完成，已中断`, restrictedMethods: ["post"] }), this._cache = Me(this.config.env), this._localCache = (t2 = this.config.env, De[t2]), this.oauth = new Qe(this.config), et(this._reqClass, "post", [tt]), et(this._reqClass, "upload", [tt]), et(this._reqClass, "download", [tt]);
    }
    async post(e2) {
      return await this._reqClass.post(e2);
    }
    async upload(e2) {
      return await this._reqClass.upload(e2);
    }
    async download(e2) {
      return await this._reqClass.download(e2);
    }
    async refreshAccessToken() {
      let e2, t2;
      this._refreshAccessTokenPromise || (this._refreshAccessTokenPromise = this._refreshAccessToken());
      try {
        e2 = await this._refreshAccessTokenPromise;
      } catch (e3) {
        t2 = e3;
      }
      if (this._refreshAccessTokenPromise = null, this._shouldRefreshAccessTokenHook = null, t2)
        throw t2;
      return e2;
    }
    async _refreshAccessToken() {
      const { accessTokenKey: e2, accessTokenExpireKey: t2, refreshTokenKey: n2, loginTypeKey: s2, anonymousUuidKey: r2 } = this._cache.keys;
      this._cache.removeStore(e2), this._cache.removeStore(t2);
      let i2 = this._cache.getStore(n2);
      if (!i2)
        throw new se({ message: "未登录CloudBase" });
      const o2 = { refresh_token: i2 }, a2 = await this.request("auth.fetchAccessTokenWithRefreshToken", o2);
      if (a2.data.code) {
        const { code: e3 } = a2.data;
        if ("SIGN_PARAM_INVALID" === e3 || "REFRESH_TOKEN_EXPIRED" === e3 || "INVALID_REFRESH_TOKEN" === e3) {
          if (this._cache.getStore(s2) === Ge.ANONYMOUS && "INVALID_REFRESH_TOKEN" === e3) {
            const e4 = this._cache.getStore(r2), t3 = this._cache.getStore(n2), s3 = await this.send("auth.signInAnonymously", { anonymous_uuid: e4, refresh_token: t3 });
            return this.setRefreshToken(s3.refresh_token), this._refreshAccessToken();
          }
          $e(He), this._cache.removeStore(n2);
        }
        throw new se({ code: a2.data.code, message: `刷新access token失败：${a2.data.code}` });
      }
      if (a2.data.access_token)
        return $e(Ve), this._cache.setStore(e2, a2.data.access_token), this._cache.setStore(t2, a2.data.access_token_expire + Date.now()), { accessToken: a2.data.access_token, accessTokenExpire: a2.data.access_token_expire };
      a2.data.refresh_token && (this._cache.removeStore(n2), this._cache.setStore(n2, a2.data.refresh_token), this._refreshAccessToken());
    }
    async getAccessToken() {
      const { accessTokenKey: e2, accessTokenExpireKey: t2, refreshTokenKey: n2 } = this._cache.keys;
      if (!this._cache.getStore(n2))
        throw new se({ message: "refresh token不存在，登录状态异常" });
      let s2 = this._cache.getStore(e2), r2 = this._cache.getStore(t2), i2 = true;
      return this._shouldRefreshAccessTokenHook && !await this._shouldRefreshAccessTokenHook(s2, r2) && (i2 = false), (!s2 || !r2 || r2 < Date.now()) && i2 ? this.refreshAccessToken() : { accessToken: s2, accessTokenExpire: r2 };
    }
    async request(e2, t2, n2) {
      const s2 = `x-tcb-trace_${this.config.env}`;
      let r2 = "application/x-www-form-urlencoded";
      const i2 = { action: e2, env: this.config.env, dataVersion: "2019-08-16", ...t2 };
      let o2;
      if (-1 === Xe.indexOf(e2) && (this._cache.keys, i2.access_token = await this.oauth.getAccessToken()), "storage.uploadFile" === e2) {
        o2 = new FormData();
        for (let e3 in o2)
          o2.hasOwnProperty(e3) && void 0 !== o2[e3] && o2.append(e3, i2[e3]);
        r2 = "multipart/form-data";
      } else {
        r2 = "application/json", o2 = {};
        for (let e3 in i2)
          void 0 !== i2[e3] && (o2[e3] = i2[e3]);
      }
      let a2 = { headers: { "content-type": r2 } };
      n2 && n2.timeout && (a2.timeout = n2.timeout), n2 && n2.onUploadProgress && (a2.onUploadProgress = n2.onUploadProgress);
      const c2 = this._localCache.getStore(s2);
      c2 && (a2.headers["X-TCB-Trace"] = c2);
      const { parse: u2, inQuery: h2, search: l2 } = t2;
      let d2 = { env: this.config.env };
      u2 && (d2.parse = true), h2 && (d2 = { ...h2, ...d2 });
      let p2 = function(e3, t3, n3 = {}) {
        const s3 = /\?/.test(t3);
        let r3 = "";
        for (let e4 in n3)
          "" === r3 ? !s3 && (t3 += "?") : r3 += "&", r3 += `${e4}=${encodeURIComponent(n3[e4])}`;
        return /^http(s)?\:\/\//.test(t3 += r3) ? t3 : `${e3}${t3}`;
      }(ye, "//tcb-api.tencentcloudapi.com/web", d2);
      l2 && (p2 += l2);
      const f2 = await this.post({ url: p2, data: o2, ...a2 }), g2 = f2.header && f2.header["x-tcb-trace"];
      if (g2 && this._localCache.setStore(s2, g2), 200 !== Number(f2.status) && 200 !== Number(f2.statusCode) || !f2.data)
        throw new se({ code: "NETWORK_ERROR", message: "network request error" });
      return f2;
    }
    async send(e2, t2 = {}, n2 = {}) {
      const s2 = await this.request(e2, t2, { ...n2, onUploadProgress: t2.onUploadProgress });
      if (("ACCESS_TOKEN_DISABLED" === s2.data.code || "ACCESS_TOKEN_EXPIRED" === s2.data.code) && -1 === Xe.indexOf(e2)) {
        await this.oauth.refreshAccessToken();
        const s3 = await this.request(e2, t2, { ...n2, onUploadProgress: t2.onUploadProgress });
        if (s3.data.code)
          throw new se({ code: s3.data.code, message: Ae(s3.data.message) });
        return s3.data;
      }
      if (s2.data.code)
        throw new se({ code: s2.data.code, message: Ae(s2.data.message) });
      return s2.data;
    }
    setRefreshToken(e2) {
      const { accessTokenKey: t2, accessTokenExpireKey: n2, refreshTokenKey: s2 } = this._cache.keys;
      this._cache.removeStore(t2), this._cache.removeStore(n2), this._cache.setStore(s2, e2);
    }
  }
  const st = {};
  function rt(e2) {
    return st[e2];
  }
  class it {
    constructor(e2) {
      this.config = e2, this._cache = Me(e2.env), this._request = rt(e2.env);
    }
    setRefreshToken(e2) {
      const { accessTokenKey: t2, accessTokenExpireKey: n2, refreshTokenKey: s2 } = this._cache.keys;
      this._cache.removeStore(t2), this._cache.removeStore(n2), this._cache.setStore(s2, e2);
    }
    setAccessToken(e2, t2) {
      const { accessTokenKey: n2, accessTokenExpireKey: s2 } = this._cache.keys;
      this._cache.setStore(n2, e2), this._cache.setStore(s2, t2);
    }
    async refreshUserInfo() {
      const { data: e2 } = await this._request.send("auth.getUserInfo", {});
      return this.setLocalUserInfo(e2), e2;
    }
    setLocalUserInfo(e2) {
      const { userInfoKey: t2 } = this._cache.keys;
      this._cache.setStore(t2, e2);
    }
  }
  class ot {
    constructor(e2) {
      if (!e2)
        throw new se({ code: "PARAM_ERROR", message: "envId is not defined" });
      this._envId = e2, this._cache = Me(this._envId), this._request = rt(this._envId), this.setUserInfo();
    }
    linkWithTicket(e2) {
      if ("string" != typeof e2)
        throw new se({ code: "PARAM_ERROR", message: "ticket must be string" });
      return this._request.send("auth.linkWithTicket", { ticket: e2 });
    }
    linkWithRedirect(e2) {
      e2.signInWithRedirect();
    }
    updatePassword(e2, t2) {
      return this._request.send("auth.updatePassword", { oldPassword: t2, newPassword: e2 });
    }
    updateEmail(e2) {
      return this._request.send("auth.updateEmail", { newEmail: e2 });
    }
    updateUsername(e2) {
      if ("string" != typeof e2)
        throw new se({ code: "PARAM_ERROR", message: "username must be a string" });
      return this._request.send("auth.updateUsername", { username: e2 });
    }
    async getLinkedUidList() {
      const { data: e2 } = await this._request.send("auth.getLinkedUidList", {});
      let t2 = false;
      const { users: n2 } = e2;
      return n2.forEach((e3) => {
        e3.wxOpenId && e3.wxPublicId && (t2 = true);
      }), { users: n2, hasPrimaryUid: t2 };
    }
    setPrimaryUid(e2) {
      return this._request.send("auth.setPrimaryUid", { uid: e2 });
    }
    unlink(e2) {
      return this._request.send("auth.unlink", { platform: e2 });
    }
    async update(e2) {
      const { nickName: t2, gender: n2, avatarUrl: s2, province: r2, country: i2, city: o2 } = e2, { data: a2 } = await this._request.send("auth.updateUserInfo", { nickName: t2, gender: n2, avatarUrl: s2, province: r2, country: i2, city: o2 });
      this.setLocalUserInfo(a2);
    }
    async refresh() {
      const e2 = await this._request.oauth.getUserInfo();
      return this.setLocalUserInfo(e2), e2;
    }
    setUserInfo() {
      const { userInfoKey: e2 } = this._cache.keys, t2 = this._cache.getStore(e2);
      ["uid", "loginType", "openid", "wxOpenId", "wxPublicId", "unionId", "qqMiniOpenId", "email", "hasPassword", "customUserId", "nickName", "gender", "avatarUrl"].forEach((e3) => {
        this[e3] = t2[e3];
      }), this.location = { country: t2.country, province: t2.province, city: t2.city };
    }
    setLocalUserInfo(e2) {
      const { userInfoKey: t2 } = this._cache.keys;
      this._cache.setStore(t2, e2), this.setUserInfo();
    }
  }
  class at {
    constructor(e2) {
      if (!e2)
        throw new se({ code: "PARAM_ERROR", message: "envId is not defined" });
      this._cache = Me(e2);
      const { refreshTokenKey: t2, accessTokenKey: n2, accessTokenExpireKey: s2 } = this._cache.keys, r2 = this._cache.getStore(t2), i2 = this._cache.getStore(n2), o2 = this._cache.getStore(s2);
      this.credential = { refreshToken: r2, accessToken: i2, accessTokenExpire: o2 }, this.user = new ot(e2);
    }
    get isAnonymousAuth() {
      return this.loginType === Ge.ANONYMOUS;
    }
    get isCustomAuth() {
      return this.loginType === Ge.CUSTOM;
    }
    get isWeixinAuth() {
      return this.loginType === Ge.WECHAT || this.loginType === Ge.WECHAT_OPEN || this.loginType === Ge.WECHAT_PUBLIC;
    }
    get loginType() {
      return this._cache.getStore(this._cache.keys.loginTypeKey);
    }
  }
  class ct extends it {
    async signIn() {
      this._cache.updatePersistence("local"), await this._request.oauth.getAccessToken(), $e(We), $e(Je, { env: this.config.env, loginType: Ge.ANONYMOUS, persistence: "local" });
      const e2 = new at(this.config.env);
      return await e2.user.refresh(), e2;
    }
    async linkAndRetrieveDataWithTicket(e2) {
      const { anonymousUuidKey: t2, refreshTokenKey: n2 } = this._cache.keys, s2 = this._cache.getStore(t2), r2 = this._cache.getStore(n2), i2 = await this._request.send("auth.linkAndRetrieveDataWithTicket", { anonymous_uuid: s2, refresh_token: r2, ticket: e2 });
      if (i2.refresh_token)
        return this._clearAnonymousUUID(), this.setRefreshToken(i2.refresh_token), await this._request.refreshAccessToken(), $e(ze, { env: this.config.env }), $e(Je, { loginType: Ge.CUSTOM, persistence: "local" }), { credential: { refreshToken: i2.refresh_token } };
      throw new se({ message: "匿名转化失败" });
    }
    _setAnonymousUUID(e2) {
      const { anonymousUuidKey: t2, loginTypeKey: n2 } = this._cache.keys;
      this._cache.removeStore(t2), this._cache.setStore(t2, e2), this._cache.setStore(n2, Ge.ANONYMOUS);
    }
    _clearAnonymousUUID() {
      this._cache.removeStore(this._cache.keys.anonymousUuidKey);
    }
  }
  class ut extends it {
    async signIn(e2) {
      if ("string" != typeof e2)
        throw new se({ code: "PARAM_ERROR", message: "ticket must be a string" });
      const { refreshTokenKey: t2 } = this._cache.keys, n2 = await this._request.send("auth.signInWithTicket", { ticket: e2, refresh_token: this._cache.getStore(t2) || "" });
      if (n2.refresh_token)
        return this.setRefreshToken(n2.refresh_token), await this._request.refreshAccessToken(), $e(We), $e(Je, { env: this.config.env, loginType: Ge.CUSTOM, persistence: this.config.persistence }), await this.refreshUserInfo(), new at(this.config.env);
      throw new se({ message: "自定义登录失败" });
    }
  }
  class ht extends it {
    async signIn(e2, t2) {
      if ("string" != typeof e2)
        throw new se({ code: "PARAM_ERROR", message: "email must be a string" });
      const { refreshTokenKey: n2 } = this._cache.keys, s2 = await this._request.send("auth.signIn", { loginType: "EMAIL", email: e2, password: t2, refresh_token: this._cache.getStore(n2) || "" }), { refresh_token: r2, access_token: i2, access_token_expire: o2 } = s2;
      if (r2)
        return this.setRefreshToken(r2), i2 && o2 ? this.setAccessToken(i2, o2) : await this._request.refreshAccessToken(), await this.refreshUserInfo(), $e(We), $e(Je, { env: this.config.env, loginType: Ge.EMAIL, persistence: this.config.persistence }), new at(this.config.env);
      throw s2.code ? new se({ code: s2.code, message: `邮箱登录失败: ${s2.message}` }) : new se({ message: "邮箱登录失败" });
    }
    async activate(e2) {
      return this._request.send("auth.activateEndUserMail", { token: e2 });
    }
    async resetPasswordWithToken(e2, t2) {
      return this._request.send("auth.resetPasswordWithToken", { token: e2, newPassword: t2 });
    }
  }
  class lt extends it {
    async signIn(e2, t2) {
      if ("string" != typeof e2)
        throw new se({ code: "PARAM_ERROR", message: "username must be a string" });
      "string" != typeof t2 && (t2 = "", console.warn("password is empty"));
      const { refreshTokenKey: n2 } = this._cache.keys, s2 = await this._request.send("auth.signIn", { loginType: Ge.USERNAME, username: e2, password: t2, refresh_token: this._cache.getStore(n2) || "" }), { refresh_token: r2, access_token_expire: i2, access_token: o2 } = s2;
      if (r2)
        return this.setRefreshToken(r2), o2 && i2 ? this.setAccessToken(o2, i2) : await this._request.refreshAccessToken(), await this.refreshUserInfo(), $e(We), $e(Je, { env: this.config.env, loginType: Ge.USERNAME, persistence: this.config.persistence }), new at(this.config.env);
      throw s2.code ? new se({ code: s2.code, message: `用户名密码登录失败: ${s2.message}` }) : new se({ message: "用户名密码登录失败" });
    }
  }
  class dt {
    constructor(e2) {
      this.config = e2, this._cache = Me(e2.env), this._request = rt(e2.env), this._onAnonymousConverted = this._onAnonymousConverted.bind(this), this._onLoginTypeChanged = this._onLoginTypeChanged.bind(this), je(Je, this._onLoginTypeChanged);
    }
    get currentUser() {
      const e2 = this.hasLoginState();
      return e2 && e2.user || null;
    }
    get loginType() {
      return this._cache.getStore(this._cache.keys.loginTypeKey);
    }
    anonymousAuthProvider() {
      return new ct(this.config);
    }
    customAuthProvider() {
      return new ut(this.config);
    }
    emailAuthProvider() {
      return new ht(this.config);
    }
    usernameAuthProvider() {
      return new lt(this.config);
    }
    async signInAnonymously() {
      return new ct(this.config).signIn();
    }
    async signInWithEmailAndPassword(e2, t2) {
      return new ht(this.config).signIn(e2, t2);
    }
    signInWithUsernameAndPassword(e2, t2) {
      return new lt(this.config).signIn(e2, t2);
    }
    async linkAndRetrieveDataWithTicket(e2) {
      this._anonymousAuthProvider || (this._anonymousAuthProvider = new ct(this.config)), je(ze, this._onAnonymousConverted);
      return await this._anonymousAuthProvider.linkAndRetrieveDataWithTicket(e2);
    }
    async signOut() {
      if (this.loginType === Ge.ANONYMOUS)
        throw new se({ message: "匿名用户不支持登出操作" });
      const { refreshTokenKey: e2, accessTokenKey: t2, accessTokenExpireKey: n2 } = this._cache.keys, s2 = this._cache.getStore(e2);
      if (!s2)
        return;
      const r2 = await this._request.send("auth.logout", { refresh_token: s2 });
      return this._cache.removeStore(e2), this._cache.removeStore(t2), this._cache.removeStore(n2), $e(We), $e(Je, { env: this.config.env, loginType: Ge.NULL, persistence: this.config.persistence }), r2;
    }
    async signUpWithEmailAndPassword(e2, t2) {
      return this._request.send("auth.signUpWithEmailAndPassword", { email: e2, password: t2 });
    }
    async sendPasswordResetEmail(e2) {
      return this._request.send("auth.sendPasswordResetEmail", { email: e2 });
    }
    onLoginStateChanged(e2) {
      je(We, () => {
        const t3 = this.hasLoginState();
        e2.call(this, t3);
      });
      const t2 = this.hasLoginState();
      e2.call(this, t2);
    }
    onLoginStateExpired(e2) {
      je(He, e2.bind(this));
    }
    onAccessTokenRefreshed(e2) {
      je(Ve, e2.bind(this));
    }
    onAnonymousConverted(e2) {
      je(ze, e2.bind(this));
    }
    onLoginTypeChanged(e2) {
      je(Je, () => {
        const t2 = this.hasLoginState();
        e2.call(this, t2);
      });
    }
    async getAccessToken() {
      return { accessToken: (await this._request.getAccessToken()).accessToken, env: this.config.env };
    }
    hasLoginState() {
      const { accessTokenKey: e2, accessTokenExpireKey: t2 } = this._cache.keys, n2 = this._cache.getStore(e2), s2 = this._cache.getStore(t2);
      return this._request.oauth.isAccessTokenExpired(n2, s2) ? null : new at(this.config.env);
    }
    async isUsernameRegistered(e2) {
      if ("string" != typeof e2)
        throw new se({ code: "PARAM_ERROR", message: "username must be a string" });
      const { data: t2 } = await this._request.send("auth.isUsernameRegistered", { username: e2 });
      return t2 && t2.isRegistered;
    }
    getLoginState() {
      return Promise.resolve(this.hasLoginState());
    }
    async signInWithTicket(e2) {
      return new ut(this.config).signIn(e2);
    }
    shouldRefreshAccessToken(e2) {
      this._request._shouldRefreshAccessTokenHook = e2.bind(this);
    }
    getUserInfo() {
      return this._request.send("auth.getUserInfo", {}).then((e2) => e2.code ? e2 : { ...e2.data, requestId: e2.seqId });
    }
    getAuthHeader() {
      const { refreshTokenKey: e2, accessTokenKey: t2 } = this._cache.keys, n2 = this._cache.getStore(e2);
      return { "x-cloudbase-credentials": this._cache.getStore(t2) + "/@@/" + n2 };
    }
    _onAnonymousConverted(e2) {
      const { env: t2 } = e2.data;
      t2 === this.config.env && this._cache.updatePersistence(this.config.persistence);
    }
    _onLoginTypeChanged(e2) {
      const { loginType: t2, persistence: n2, env: s2 } = e2.data;
      s2 === this.config.env && (this._cache.updatePersistence(n2), this._cache.setStore(this._cache.keys.loginTypeKey, t2));
    }
  }
  const pt = function(e2, t2) {
    t2 = t2 || be();
    const n2 = rt(this.config.env), { cloudPath: s2, filePath: r2, onUploadProgress: i2, fileType: o2 = "image" } = e2;
    return n2.send("storage.getUploadMetadata", { path: s2 }).then((e3) => {
      const { data: { url: a2, authorization: c2, token: u2, fileId: h2, cosFileId: l2 }, requestId: d2 } = e3, p2 = { key: s2, signature: c2, "x-cos-meta-fileid": l2, success_action_status: "201", "x-cos-security-token": u2 };
      n2.upload({ url: a2, data: p2, file: r2, name: s2, fileType: o2, onUploadProgress: i2 }).then((e4) => {
        201 === e4.statusCode ? t2(null, { fileID: h2, requestId: d2 }) : t2(new se({ code: "STORAGE_REQUEST_FAIL", message: `STORAGE_REQUEST_FAIL: ${e4.data}` }));
      }).catch((e4) => {
        t2(e4);
      });
    }).catch((e3) => {
      t2(e3);
    }), t2.promise;
  }, ft = function(e2, t2) {
    t2 = t2 || be();
    const n2 = rt(this.config.env), { cloudPath: s2 } = e2;
    return n2.send("storage.getUploadMetadata", { path: s2 }).then((e3) => {
      t2(null, e3);
    }).catch((e3) => {
      t2(e3);
    }), t2.promise;
  }, gt = function({ fileList: e2 }, t2) {
    if (t2 = t2 || be(), !e2 || !Array.isArray(e2))
      return { code: "INVALID_PARAM", message: "fileList必须是非空的数组" };
    for (let t3 of e2)
      if (!t3 || "string" != typeof t3)
        return { code: "INVALID_PARAM", message: "fileList的元素必须是非空的字符串" };
    const n2 = { fileid_list: e2 };
    return rt(this.config.env).send("storage.batchDeleteFile", n2).then((e3) => {
      e3.code ? t2(null, e3) : t2(null, { fileList: e3.data.delete_list, requestId: e3.requestId });
    }).catch((e3) => {
      t2(e3);
    }), t2.promise;
  }, mt = function({ fileList: e2 }, t2) {
    t2 = t2 || be(), e2 && Array.isArray(e2) || t2(null, { code: "INVALID_PARAM", message: "fileList必须是非空的数组" });
    let n2 = [];
    for (let s3 of e2)
      "object" == typeof s3 ? (s3.hasOwnProperty("fileID") && s3.hasOwnProperty("maxAge") || t2(null, { code: "INVALID_PARAM", message: "fileList的元素必须是包含fileID和maxAge的对象" }), n2.push({ fileid: s3.fileID, max_age: s3.maxAge })) : "string" == typeof s3 ? n2.push({ fileid: s3 }) : t2(null, { code: "INVALID_PARAM", message: "fileList的元素必须是字符串" });
    const s2 = { file_list: n2 };
    return rt(this.config.env).send("storage.batchGetDownloadUrl", s2).then((e3) => {
      e3.code ? t2(null, e3) : t2(null, { fileList: e3.data.download_list, requestId: e3.requestId });
    }).catch((e3) => {
      t2(e3);
    }), t2.promise;
  }, yt = async function({ fileID: e2 }, t2) {
    const n2 = (await mt.call(this, { fileList: [{ fileID: e2, maxAge: 600 }] })).fileList[0];
    if ("SUCCESS" !== n2.code)
      return t2 ? t2(n2) : new Promise((e3) => {
        e3(n2);
      });
    const s2 = rt(this.config.env);
    let r2 = n2.download_url;
    if (r2 = encodeURI(r2), !t2)
      return s2.download({ url: r2 });
    t2(await s2.download({ url: r2 }));
  }, _t = function({ name: e2, data: t2, query: n2, parse: s2, search: r2, timeout: i2 }, o2) {
    const a2 = o2 || be();
    let c2;
    try {
      c2 = t2 ? JSON.stringify(t2) : "";
    } catch (e3) {
      return Promise.reject(e3);
    }
    if (!e2)
      return Promise.reject(new se({ code: "PARAM_ERROR", message: "函数名不能为空" }));
    const u2 = { inQuery: n2, parse: s2, search: r2, function_name: e2, request_data: c2 };
    return rt(this.config.env).send("functions.invokeFunction", u2, { timeout: i2 }).then((e3) => {
      if (e3.code)
        a2(null, e3);
      else {
        let t3 = e3.data.response_data;
        if (s2)
          a2(null, { result: t3, requestId: e3.requestId });
        else
          try {
            t3 = JSON.parse(e3.data.response_data), a2(null, { result: t3, requestId: e3.requestId });
          } catch (e4) {
            a2(new se({ message: "response data must be json" }));
          }
      }
      return a2.promise;
    }).catch((e3) => {
      a2(e3);
    }), a2.promise;
  }, wt = { timeout: 15e3, persistence: "session" }, vt = {};
  class It {
    constructor(e2) {
      this.config = e2 || this.config, this.authObj = void 0;
    }
    init(e2) {
      switch (Oe.adapter || (this.requestClient = new Oe.adapter.reqClass({ timeout: e2.timeout || 5e3, timeoutMsg: `请求在${(e2.timeout || 5e3) / 1e3}s内未完成，已中断` })), this.config = { ...wt, ...e2 }, true) {
        case this.config.timeout > 6e5:
          console.warn("timeout大于可配置上限[10分钟]，已重置为上限数值"), this.config.timeout = 6e5;
          break;
        case this.config.timeout < 100:
          console.warn("timeout小于可配置下限[100ms]，已重置为下限数值"), this.config.timeout = 100;
      }
      return new It(this.config);
    }
    auth({ persistence: e2 } = {}) {
      if (this.authObj)
        return this.authObj;
      const t2 = e2 || Oe.adapter.primaryStorage || wt.persistence;
      var n2;
      return t2 !== this.config.persistence && (this.config.persistence = t2), function(e3) {
        const { env: t3 } = e3;
        Ne[t3] = new Ue(e3), De[t3] = new Ue({ ...e3, persistence: "local" });
      }(this.config), n2 = this.config, st[n2.env] = new nt(n2), this.authObj = new dt(this.config), this.authObj;
    }
    on(e2, t2) {
      return je.apply(this, [e2, t2]);
    }
    off(e2, t2) {
      return Be.apply(this, [e2, t2]);
    }
    callFunction(e2, t2) {
      return _t.apply(this, [e2, t2]);
    }
    deleteFile(e2, t2) {
      return gt.apply(this, [e2, t2]);
    }
    getTempFileURL(e2, t2) {
      return mt.apply(this, [e2, t2]);
    }
    downloadFile(e2, t2) {
      return yt.apply(this, [e2, t2]);
    }
    uploadFile(e2, t2) {
      return pt.apply(this, [e2, t2]);
    }
    getUploadMetadata(e2, t2) {
      return ft.apply(this, [e2, t2]);
    }
    registerExtension(e2) {
      vt[e2.name] = e2;
    }
    async invokeExtension(e2, t2) {
      const n2 = vt[e2];
      if (!n2)
        throw new se({ message: `扩展${e2} 必须先注册` });
      return await n2.invoke(t2, this);
    }
    useAdapters(e2) {
      const { adapter: t2, runtime: n2 } = xe(e2) || {};
      t2 && (Oe.adapter = t2), n2 && (Oe.runtime = n2);
    }
  }
  var St = new It();
  function bt(e2, t2, n2) {
    void 0 === n2 && (n2 = {});
    var s2 = /\?/.test(t2), r2 = "";
    for (var i2 in n2)
      "" === r2 ? !s2 && (t2 += "?") : r2 += "&", r2 += i2 + "=" + encodeURIComponent(n2[i2]);
    return /^http(s)?:\/\//.test(t2 += r2) ? t2 : "" + e2 + t2;
  }
  class kt {
    get(e2) {
      const { url: t2, data: n2, headers: s2, timeout: r2 } = e2;
      return new Promise((e3, i2) => {
        re.request({ url: bt("https:", t2), data: n2, method: "GET", header: s2, timeout: r2, success(t3) {
          e3(t3);
        }, fail(e4) {
          i2(e4);
        } });
      });
    }
    post(e2) {
      const { url: t2, data: n2, headers: s2, timeout: r2 } = e2;
      return new Promise((e3, i2) => {
        re.request({ url: bt("https:", t2), data: n2, method: "POST", header: s2, timeout: r2, success(t3) {
          e3(t3);
        }, fail(e4) {
          i2(e4);
        } });
      });
    }
    upload(e2) {
      return new Promise((t2, n2) => {
        const { url: s2, file: r2, data: i2, headers: o2, fileType: a2 } = e2, c2 = re.uploadFile({ url: bt("https:", s2), name: "file", formData: Object.assign({}, i2), filePath: r2, fileType: a2, header: o2, success(e3) {
          const n3 = { statusCode: e3.statusCode, data: e3.data || {} };
          200 === e3.statusCode && i2.success_action_status && (n3.statusCode = parseInt(i2.success_action_status, 10)), t2(n3);
        }, fail(e3) {
          n2(new Error(e3.errMsg || "uploadFile:fail"));
        } });
        "function" == typeof e2.onUploadProgress && c2 && "function" == typeof c2.onProgressUpdate && c2.onProgressUpdate((t3) => {
          e2.onUploadProgress({ loaded: t3.totalBytesSent, total: t3.totalBytesExpectedToSend });
        });
      });
    }
  }
  const Tt = { setItem(e2, t2) {
    re.setStorageSync(e2, t2);
  }, getItem: (e2) => re.getStorageSync(e2), removeItem(e2) {
    re.removeStorageSync(e2);
  }, clear() {
    re.clearStorageSync();
  } };
  var At = { genAdapter: function() {
    return { root: {}, reqClass: kt, localStorage: Tt, primaryStorage: "local" };
  }, isMatch: function() {
    return true;
  }, runtime: "uni_app" };
  St.useAdapters(At);
  const Pt = St, Ct = Pt.init;
  Pt.init = function(e2) {
    e2.env = e2.spaceId;
    const t2 = Ct.call(this, e2);
    t2.config.provider = "tencent", t2.config.spaceId = e2.spaceId;
    const n2 = t2.auth;
    return t2.auth = function(e3) {
      const t3 = n2.call(this, e3);
      return ["linkAndRetrieveDataWithTicket", "signInAnonymously", "signOut", "getAccessToken", "getLoginState", "signInWithTicket", "getUserInfo"].forEach((e4) => {
        var n3;
        t3[e4] = (n3 = t3[e4], function(e5) {
          e5 = e5 || {};
          const { success: t4, fail: s2, complete: r2 } = ne(e5);
          if (!(t4 || s2 || r2))
            return n3.call(this, e5);
          n3.call(this, e5).then((e6) => {
            t4 && t4(e6), r2 && r2(e6);
          }, (e6) => {
            s2 && s2(e6), r2 && r2(e6);
          });
        }).bind(t3);
      }), t3;
    }, t2.customAuth = t2.auth, t2;
  };
  var xt = Pt;
  async function Ot(e2, t2) {
    const n2 = `http://${e2}:${t2}/system/ping`;
    try {
      const e3 = await (s2 = { url: n2, timeout: 500 }, new Promise((e4, t3) => {
        re.request({ ...s2, success(t4) {
          e4(t4);
        }, fail(e5) {
          t3(e5);
        } });
      }));
      return !(!e3.data || 0 !== e3.data.code);
    } catch (e3) {
      return false;
    }
    var s2;
  }
  async function Et(e2, t2) {
    let n2;
    for (let s2 = 0; s2 < e2.length; s2++) {
      const r2 = e2[s2];
      if (await Ot(r2, t2)) {
        n2 = r2;
        break;
      }
    }
    return { address: n2, port: t2 };
  }
  const Lt = { "serverless.file.resource.generateProximalSign": "storage/generate-proximal-sign", "serverless.file.resource.report": "storage/report", "serverless.file.resource.delete": "storage/delete", "serverless.file.resource.getTempFileURL": "storage/get-temp-file-url" };
  var Rt = class {
    constructor(e2) {
      if (["spaceId", "clientSecret"].forEach((t2) => {
        if (!Object.prototype.hasOwnProperty.call(e2, t2))
          throw new Error(`${t2} required`);
      }), !e2.endpoint)
        throw new Error("集群空间未配置ApiEndpoint，配置后需要重新关联服务空间后生效");
      this.config = Object.assign({}, e2), this.config.provider = "dcloud", this.config.requestUrl = this.config.endpoint + "/client", this.config.envType = this.config.envType || "public", this.adapter = re;
    }
    async request(e2, t2 = true) {
      const n2 = t2;
      return e2 = n2 ? await this.setupLocalRequest(e2) : this.setupRequest(e2), Promise.resolve().then(() => n2 ? this.requestLocal(e2) : fe.wrappedRequest(e2, this.adapter.request));
    }
    requestLocal(e2) {
      return new Promise((t2, n2) => {
        this.adapter.request(Object.assign(e2, { complete(e3) {
          if (e3 || (e3 = {}), !e3.statusCode || e3.statusCode >= 400) {
            const t3 = e3.data && e3.data.code || "SYS_ERR", s2 = e3.data && e3.data.message || "request:fail";
            return n2(new se({ code: t3, message: s2 }));
          }
          t2({ success: true, result: e3.data });
        } }));
      });
    }
    setupRequest(e2) {
      const t2 = Object.assign({}, e2, { spaceId: this.config.spaceId, timestamp: Date.now() }), n2 = { "Content-Type": "application/json" };
      n2["x-serverless-sign"] = fe.sign(t2, this.config.clientSecret);
      const s2 = pe();
      n2["x-client-info"] = encodeURIComponent(JSON.stringify(s2));
      const { token: r2 } = oe();
      return n2["x-client-token"] = r2, { url: this.config.requestUrl, method: "POST", data: t2, dataType: "json", header: JSON.parse(JSON.stringify(n2)) };
    }
    async setupLocalRequest(e2) {
      const t2 = pe(), { token: n2 } = oe(), s2 = Object.assign({}, e2, { spaceId: this.config.spaceId, timestamp: Date.now(), clientInfo: t2, token: n2 }), { address: r2, servePort: i2 } = this.__dev__ && this.__dev__.debugInfo || {}, { address: o2 } = await Et(r2, i2);
      return { url: `http://${o2}:${i2}/${Lt[e2.method]}`, method: "POST", data: s2, dataType: "json", header: JSON.parse(JSON.stringify({ "Content-Type": "application/json" })) };
    }
    callFunction(e2) {
      const t2 = { method: "serverless.function.runtime.invoke", params: JSON.stringify({ functionTarget: e2.name, functionArgs: e2.data || {} }) };
      return this.request(t2, false);
    }
    getUploadFileOptions(e2) {
      const t2 = { method: "serverless.file.resource.generateProximalSign", params: JSON.stringify(e2) };
      return this.request(t2);
    }
    reportUploadFile(e2) {
      const t2 = { method: "serverless.file.resource.report", params: JSON.stringify(e2) };
      return this.request(t2);
    }
    uploadFile({ filePath: e2, cloudPath: t2, fileType: n2 = "image", onUploadProgress: s2 }) {
      if (!t2)
        throw new se({ code: "CLOUDPATH_REQUIRED", message: "cloudPath不可为空" });
      let r2;
      return this.getUploadFileOptions({ cloudPath: t2 }).then((t3) => {
        const { url: i2, formData: o2, name: a2 } = t3.result;
        return r2 = t3.result.fileUrl, new Promise((t4, r3) => {
          const c2 = this.adapter.uploadFile({ url: i2, formData: o2, name: a2, filePath: e2, fileType: n2, success(e3) {
            e3 && e3.statusCode < 400 ? t4(e3) : r3(new se({ code: "UPLOAD_FAILED", message: "文件上传失败" }));
          }, fail(e3) {
            r3(new se({ code: e3.code || "UPLOAD_FAILED", message: e3.message || e3.errMsg || "文件上传失败" }));
          } });
          "function" == typeof s2 && c2 && "function" == typeof c2.onProgressUpdate && c2.onProgressUpdate((e3) => {
            s2({ loaded: e3.totalBytesSent, total: e3.totalBytesExpectedToSend });
          });
        });
      }).then(() => this.reportUploadFile({ cloudPath: t2 })).then((t3) => new Promise((n3, s3) => {
        t3.success ? n3({ success: true, filePath: e2, fileID: r2 }) : s3(new se({ code: "UPLOAD_FAILED", message: "文件上传失败" }));
      }));
    }
    deleteFile({ fileList: e2 }) {
      const t2 = { method: "serverless.file.resource.delete", params: JSON.stringify({ fileList: e2 }) };
      return this.request(t2).then((e3) => {
        if (e3.success)
          return e3.result;
        throw new se({ code: "DELETE_FILE_FAILED", message: "删除文件失败" });
      });
    }
    getTempFileURL({ fileList: e2, maxAge: t2 } = {}) {
      if (!Array.isArray(e2) || 0 === e2.length)
        throw new se({ code: "INVALID_PARAM", message: "fileList的元素必须是非空的字符串" });
      const n2 = { method: "serverless.file.resource.getTempFileURL", params: JSON.stringify({ fileList: e2, maxAge: t2 }) };
      return this.request(n2).then((e3) => {
        if (e3.success)
          return { fileList: e3.result.fileList.map((e4) => ({ fileID: e4.fileID, tempFileURL: e4.tempFileURL })) };
        throw new se({ code: "GET_TEMP_FILE_URL_FAILED", message: "获取临时文件链接失败" });
      });
    }
  };
  var Ut = { init(e2) {
    const t2 = new Rt(e2), n2 = { signInAnonymously: function() {
      return Promise.resolve();
    }, getLoginState: function() {
      return Promise.resolve(false);
    } };
    return t2.auth = function() {
      return n2;
    }, t2.customAuth = t2.auth, t2;
  } }, Nt = n(function(e2, t2) {
    e2.exports = r.enc.Hex;
  });
  function Dt() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(e2) {
      var t2 = 16 * Math.random() | 0;
      return ("x" === e2 ? t2 : 3 & t2 | 8).toString(16);
    });
  }
  function Mt(e2 = "", t2 = {}) {
    const { data: n2, functionName: s2, method: r2, headers: i2, signHeaderKeys: o2 = [], config: a2 } = t2, c2 = String(Date.now()), u2 = Dt(), h2 = Object.assign({}, i2, { "x-from-app-id": a2.spaceAppId, "x-from-env-id": a2.spaceId, "x-to-env-id": a2.spaceId, "x-from-instance-id": c2, "x-from-function-name": s2, "x-client-timestamp": c2, "x-alipay-source": "client", "x-request-id": u2, "x-alipay-callid": u2, "x-trace-id": u2 }), l2 = ["x-from-app-id", "x-from-env-id", "x-to-env-id", "x-from-instance-id", "x-from-function-name", "x-client-timestamp"].concat(o2), [d2 = "", p2 = ""] = e2.split("?") || [], f2 = function(e3) {
      const t3 = e3.signedHeaders.join(";"), n3 = e3.signedHeaders.map((t4) => `${t4.toLowerCase()}:${e3.headers[t4]}
`).join(""), s3 = Ie(e3.body).toString(Nt), r3 = `${e3.method.toUpperCase()}
${e3.path}
${e3.query}
${n3}
${t3}
${s3}
`, i3 = Ie(r3).toString(Nt), o3 = `HMAC-SHA256
${e3.timestamp}
${i3}
`, a3 = Se(o3, e3.secretKey).toString(Nt);
      return `HMAC-SHA256 Credential=${e3.secretId}, SignedHeaders=${t3}, Signature=${a3}`;
    }({ path: d2, query: p2, method: r2, headers: h2, timestamp: c2, body: JSON.stringify(n2), secretId: a2.accessKey, secretKey: a2.secretKey, signedHeaders: l2.sort() });
    return { url: `${a2.endpoint}${e2}`, headers: Object.assign({}, h2, { Authorization: f2 }) };
  }
  function qt({ url: e2, data: t2, method: n2 = "POST", headers: s2 = {}, timeout: r2 }) {
    return new Promise((i2, o2) => {
      re.request({ url: e2, method: n2, data: "object" == typeof t2 ? JSON.stringify(t2) : t2, header: s2, dataType: "json", timeout: r2, complete: (e3 = {}) => {
        const t3 = s2["x-trace-id"] || "";
        if (!e3.statusCode || e3.statusCode >= 400) {
          const { message: n3, errMsg: s3, trace_id: r3 } = e3.data || {};
          return o2(new se({ code: "SYS_ERR", message: n3 || s3 || "request:fail", requestId: r3 || t3 }));
        }
        i2({ status: e3.statusCode, data: e3.data, headers: e3.header, requestId: t3 });
      } });
    });
  }
  function Kt(e2, t2) {
    const { path: n2, data: s2, method: r2 = "GET" } = e2, { url: i2, headers: o2 } = Mt(n2, { functionName: "", data: s2, method: r2, headers: { "x-alipay-cloud-mode": "oss", "x-data-api-type": "oss", "x-expire-timestamp": Date.now() + 6e4 }, signHeaderKeys: ["x-data-api-type", "x-expire-timestamp"], config: t2 });
    return qt({ url: i2, data: s2, method: r2, headers: o2 }).then((e3) => {
      const t3 = e3.data || {};
      if (!t3.success)
        throw new se({ code: e3.errCode, message: e3.errMsg, requestId: e3.requestId });
      return t3.data || {};
    }).catch((e3) => {
      throw new se({ code: e3.errCode, message: e3.errMsg, requestId: e3.requestId });
    });
  }
  function Ft(e2 = "") {
    const t2 = e2.trim().replace(/^cloud:\/\//, ""), n2 = t2.indexOf("/");
    if (n2 <= 0)
      throw new se({ code: "INVALID_PARAM", message: "fileID不合法" });
    const s2 = t2.substring(0, n2), r2 = t2.substring(n2 + 1);
    return s2 !== this.config.spaceId && console.warn("file ".concat(e2, " does not belong to env ").concat(this.config.spaceId)), r2;
  }
  function jt(e2 = "") {
    return "cloud://".concat(this.config.spaceId, "/").concat(e2.replace(/^\/+/, ""));
  }
  class $t {
    constructor(e2) {
      this.config = e2;
    }
    signedURL(e2, t2 = {}) {
      const n2 = `/ws/function/${e2}`, s2 = this.config.wsEndpoint.replace(/^ws(s)?:\/\//, ""), r2 = Object.assign({}, t2, { accessKeyId: this.config.accessKey, signatureNonce: Dt(), timestamp: "" + Date.now() }), i2 = [n2, ["accessKeyId", "authorization", "signatureNonce", "timestamp"].sort().map(function(e3) {
        return r2[e3] ? "".concat(e3, "=").concat(r2[e3]) : null;
      }).filter(Boolean).join("&"), `host:${s2}`].join("\n"), o2 = ["HMAC-SHA256", Ie(i2).toString(Nt)].join("\n"), a2 = Se(o2, this.config.secretKey).toString(Nt), c2 = Object.keys(r2).map((e3) => `${e3}=${encodeURIComponent(r2[e3])}`).join("&");
      return `${this.config.wsEndpoint}${n2}?${c2}&signature=${a2}`;
    }
  }
  var Bt = class {
    constructor(e2) {
      if (["spaceId", "spaceAppId", "accessKey", "secretKey"].forEach((t2) => {
        if (!Object.prototype.hasOwnProperty.call(e2, t2))
          throw new Error(`${t2} required`);
      }), e2.endpoint) {
        if ("string" != typeof e2.endpoint)
          throw new Error("endpoint must be string");
        if (!/^https:\/\//.test(e2.endpoint))
          throw new Error("endpoint must start with https://");
        e2.endpoint = e2.endpoint.replace(/\/$/, "");
      }
      this.config = Object.assign({}, e2, { endpoint: e2.endpoint || `https://${e2.spaceId}.api-hz.cloudbasefunction.cn`, wsEndpoint: e2.wsEndpoint || `wss://${e2.spaceId}.api-hz.cloudbasefunction.cn` }), this._websocket = new $t(this.config);
    }
    callFunction(e2) {
      return function(e3, t2) {
        const { name: n2, data: s2, async: r2 = false, timeout: i2 } = e3, o2 = "POST", a2 = { "x-to-function-name": n2 };
        r2 && (a2["x-function-invoke-type"] = "async");
        const { url: c2, headers: u2 } = Mt("/functions/invokeFunction", { functionName: n2, data: s2, method: o2, headers: a2, signHeaderKeys: ["x-to-function-name"], config: t2 });
        return qt({ url: c2, data: s2, method: o2, headers: u2, timeout: i2 }).then((e4) => {
          let t3 = 0;
          if (r2) {
            const n3 = e4.data || {};
            t3 = "200" === n3.errCode ? 0 : n3.errCode, e4.data = n3.data || {}, e4.errMsg = n3.errMsg;
          }
          if (0 !== t3)
            throw new se({ code: t3, message: e4.errMsg, requestId: e4.requestId });
          return { errCode: t3, success: 0 === t3, requestId: e4.requestId, result: e4.data };
        }).catch((e4) => {
          throw new se({ code: e4.errCode, message: e4.errMsg, requestId: e4.requestId });
        });
      }(e2, this.config);
    }
    uploadFileToOSS({ url: e2, filePath: t2, fileType: n2, formData: s2, onUploadProgress: r2 }) {
      return new Promise((i2, o2) => {
        const a2 = re.uploadFile({ url: e2, filePath: t2, fileType: n2, formData: s2, name: "file", success(e3) {
          e3 && e3.statusCode < 400 ? i2(e3) : o2(new se({ code: "UPLOAD_FAILED", message: "文件上传失败" }));
        }, fail(e3) {
          o2(new se({ code: e3.code || "UPLOAD_FAILED", message: e3.message || e3.errMsg || "文件上传失败" }));
        } });
        "function" == typeof r2 && a2 && "function" == typeof a2.onProgressUpdate && a2.onProgressUpdate((e3) => {
          r2({ loaded: e3.totalBytesSent, total: e3.totalBytesExpectedToSend });
        });
      });
    }
    async uploadFile({ filePath: e2, cloudPath: t2 = "", fileType: n2 = "image", onUploadProgress: s2 }) {
      if ("string" !== f(t2))
        throw new se({ code: "INVALID_PARAM", message: "cloudPath必须为字符串类型" });
      if (!(t2 = t2.trim()))
        throw new se({ code: "INVALID_PARAM", message: "cloudPath不可为空" });
      if (/:\/\//.test(t2))
        throw new se({ code: "INVALID_PARAM", message: "cloudPath不合法" });
      const r2 = await Kt({ path: "/".concat(t2.replace(/^\//, ""), "?post_url") }, this.config), { file_id: i2, upload_url: o2, form_data: a2 } = r2, c2 = a2 && a2.reduce((e3, t3) => (e3[t3.key] = t3.value, e3), {});
      return this.uploadFileToOSS({ url: o2, filePath: e2, fileType: n2, formData: c2, onUploadProgress: s2 }).then(() => ({ fileID: i2 }));
    }
    async getTempFileURL({ fileList: e2 }) {
      return new Promise((t2, n2) => {
        (!e2 || e2.length < 0) && t2({ code: "INVALID_PARAM", message: "fileList不能为空数组" }), e2.length > 50 && t2({ code: "INVALID_PARAM", message: "fileList数组长度不能超过50" });
        const s2 = [];
        for (const n3 of e2) {
          let e3;
          "string" !== f(n3) && t2({ code: "INVALID_PARAM", message: "fileList的元素必须是非空的字符串" });
          try {
            e3 = Ft.call(this, n3);
          } catch (t3) {
            console.warn(t3.errCode, t3.errMsg), e3 = n3;
          }
          s2.push({ file_id: e3, expire: 600 });
        }
        Kt({ path: "/?download_url", data: { file_list: s2 }, method: "POST" }, this.config).then((e3) => {
          const { file_list: n3 = [] } = e3;
          t2({ fileList: n3.map((e4) => ({ fileID: jt.call(this, e4.file_id), tempFileURL: e4.download_url })) });
        }).catch((e3) => n2(e3));
      });
    }
    async connectWebSocket(e2) {
      const { name: t2, query: n2 } = e2;
      return re.connectSocket({ url: this._websocket.signedURL(t2, n2), complete: () => {
      } });
    }
  };
  var Wt = { init: (e2) => {
    e2.provider = "alipay";
    const t2 = new Bt(e2);
    return t2.auth = function() {
      return { signInAnonymously: function() {
        return Promise.resolve();
      }, getLoginState: function() {
        return Promise.resolve(true);
      } };
    }, t2;
  } };
  function Ht({ data: e2 }) {
    let t2;
    t2 = pe();
    const n2 = JSON.parse(JSON.stringify(e2 || {}));
    if (Object.assign(n2, { clientInfo: t2 }), !n2.uniIdToken) {
      const { token: e3 } = oe();
      e3 && (n2.uniIdToken = e3);
    }
    return n2;
  }
  async function Jt(e2 = {}) {
    await this.__dev__.initLocalNetwork();
    const { localAddress: t2, localPort: n2 } = this.__dev__, s2 = { aliyun: "aliyun", tencent: "tcb", alipay: "alipay", dcloud: "dcloud" }[this.config.provider], r2 = this.config.spaceId, i2 = `http://${t2}:${n2}/system/check-function`, o2 = `http://${t2}:${n2}/cloudfunctions/${e2.name}`;
    return new Promise((t3, n3) => {
      re.request({ method: "POST", url: i2, data: { name: e2.name, platform: A, provider: s2, spaceId: r2 }, timeout: 3e3, success(e3) {
        t3(e3);
      }, fail() {
        t3({ data: { code: "NETWORK_ERROR", message: "连接本地调试服务失败，请检查客户端是否和主机在同一局域网下，自动切换为已部署的云函数。" } });
      } });
    }).then(({ data: e3 } = {}) => {
      const { code: t3, message: n3 } = e3 || {};
      return { code: 0 === t3 ? 0 : t3 || "SYS_ERR", message: n3 || "SYS_ERR" };
    }).then(({ code: t3, message: n3 }) => {
      if (0 !== t3) {
        switch (t3) {
          case "MODULE_ENCRYPTED":
            console.error(`此云函数（${e2.name}）依赖加密公共模块不可本地调试，自动切换为云端已部署的云函数`);
            break;
          case "FUNCTION_ENCRYPTED":
            console.error(`此云函数（${e2.name}）已加密不可本地调试，自动切换为云端已部署的云函数`);
            break;
          case "ACTION_ENCRYPTED":
            console.error(n3 || "需要访问加密的uni-clientDB-action，自动切换为云端环境");
            break;
          case "NETWORK_ERROR":
            console.error(n3 || "连接本地调试服务失败，请检查客户端是否和主机在同一局域网下");
            break;
          case "SWITCH_TO_CLOUD":
            break;
          default: {
            const e3 = `检测本地调试服务出现错误：${n3}，请检查网络环境或重启客户端再试`;
            throw console.error(e3), new Error(e3);
          }
        }
        return this._callCloudFunction(e2);
      }
      return new Promise((t4, n4) => {
        const r3 = Ht.call(this, { data: e2.data });
        re.request({ method: "POST", url: o2, data: { provider: s2, platform: A, param: r3 }, timeout: e2.timeout, success: ({ statusCode: e3, data: s3 } = {}) => !e3 || e3 >= 400 ? n4(new se({ code: s3.code || "SYS_ERR", message: s3.message || "request:fail" })) : t4({ result: s3 }), fail(e3) {
          n4(new se({ code: e3.code || e3.errCode || "SYS_ERR", message: e3.message || e3.errMsg || "request:fail" }));
        } });
      });
    });
  }
  const zt = [{ rule: /fc_function_not_found|FUNCTION_NOT_FOUND/, content: "，云函数[{functionName}]在云端不存在，请检查此云函数名称是否正确以及该云函数是否已上传到服务空间", mode: "append" }];
  var Vt = /[\\^$.*+?()[\]{}|]/g, Gt = RegExp(Vt.source);
  function Yt(e2, t2, n2) {
    return e2.replace(new RegExp((s2 = t2) && Gt.test(s2) ? s2.replace(Vt, "\\$&") : s2, "g"), n2);
    var s2;
  }
  const Xt = "request", Zt = "response", en = "both";
  const Mn = { code: 2e4, message: "System error" }, qn = { code: 20101, message: "Invalid client" };
  function jn(e2) {
    const { errSubject: t2, subject: n2, errCode: s2, errMsg: r2, code: i2, message: o2, cause: a2 } = e2 || {};
    return new se({ subject: t2 || n2 || "uni-secure-network", code: s2 || i2 || Mn.code, message: r2 || o2, cause: a2 });
  }
  let Bn;
  function Vn({ secretType: e2 } = {}) {
    return e2 === Xt || e2 === Zt || e2 === en;
  }
  function Gn({ name: e2, data: t2 = {} } = {}) {
    return "DCloud-clientDB" === e2 && "encryption" === t2.redirectTo && "getAppClientKey" === t2.action;
  }
  function Yn({ provider: e2, spaceId: t2, functionName: n2 } = {}) {
    const { appId: s2, uniPlatform: r2, osName: i2 } = he();
    let o2 = r2;
    "app" === r2 && (o2 = i2);
    const a2 = function({ provider: e3, spaceId: t3 } = {}) {
      const n3 = T;
      if (!n3)
        return {};
      e3 = /* @__PURE__ */ function(e4) {
        return "tencent" === e4 ? "tcb" : e4;
      }(e3);
      const s3 = n3.find((n4) => n4.provider === e3 && n4.spaceId === t3);
      return s3 && s3.config;
    }({ provider: e2, spaceId: t2 });
    if (!a2 || !a2.accessControl || !a2.accessControl.enable)
      return false;
    const c2 = a2.accessControl.function || {}, u2 = Object.keys(c2);
    if (0 === u2.length)
      return true;
    const h2 = function(e3, t3) {
      let n3, s3, r3;
      for (let i3 = 0; i3 < e3.length; i3++) {
        const o3 = e3[i3];
        o3 !== t3 ? "*" !== o3 ? o3.split(",").map((e4) => e4.trim()).indexOf(t3) > -1 && (s3 = o3) : r3 = o3 : n3 = o3;
      }
      return n3 || s3 || r3;
    }(u2, n2);
    if (!h2)
      return false;
    if ((c2[h2] || []).find((e3 = {}) => e3.appId === s2 && (e3.platform || "").toLowerCase() === o2.toLowerCase()))
      return true;
    throw console.error(`此应用[appId: ${s2}, platform: ${o2}]不在云端配置的允许访问的应用列表内，参考：https://uniapp.dcloud.net.cn/uniCloud/secure-network.html#verify-client`), jn(qn);
  }
  function Qn({ functionName: e2, result: t2, logPvd: n2 }) {
    if (this.__dev__.debugLog && t2 && t2.requestId) {
      const s2 = JSON.stringify({ spaceId: this.config.spaceId, functionName: e2, requestId: t2.requestId });
      console.log(`[${n2}-request]${s2}[/${n2}-request]`);
    }
  }
  function Xn(e2) {
    const t2 = e2.callFunction, n2 = function(n3) {
      const s2 = n3.name;
      n3.data = Ht.call(e2, { data: n3.data });
      const r2 = { aliyun: "aliyun", tencent: "tcb", tcb: "tcb", alipay: "alipay", dcloud: "dcloud" }[this.config.provider], i2 = Vn(n3), o2 = Gn(n3), a2 = i2 || o2;
      return t2.call(this, n3).then((e3) => (e3.errCode = 0, !a2 && Qn.call(this, { functionName: s2, result: e3, logPvd: r2 }), Promise.resolve(e3)), (e3) => (!a2 && Qn.call(this, { functionName: s2, result: e3, logPvd: r2 }), e3 && e3.message && (e3.message = function({ message: e4 = "", extraInfo: t3 = {}, formatter: n4 = [] } = {}) {
        for (let s3 = 0; s3 < n4.length; s3++) {
          const { rule: r3, content: i3, mode: o3 } = n4[s3], a3 = e4.match(r3);
          if (!a3)
            continue;
          let c2 = i3;
          for (let e5 = 1; e5 < a3.length; e5++)
            c2 = Yt(c2, `{$${e5}}`, a3[e5]);
          for (const e5 in t3)
            c2 = Yt(c2, `{${e5}}`, t3[e5]);
          return "replace" === o3 ? c2 : e4 + c2;
        }
        return e4;
      }({ message: `[${n3.name}]: ${e3.message}`, formatter: zt, extraInfo: { functionName: s2 } })), Promise.reject(e3)));
    };
    e2.callFunction = function(t3) {
      const { provider: s2, spaceId: r2 } = e2.config, i2 = t3.name;
      let o2, a2;
      if (t3.data = t3.data || {}, e2.__dev__.debugInfo && !e2.__dev__.debugInfo.forceRemote && C ? (e2._callCloudFunction || (e2._callCloudFunction = n2, e2._callLocalFunction = Jt), o2 = Jt) : o2 = n2, o2 = o2.bind(e2), Gn(t3))
        a2 = n2.call(e2, t3);
      else if (Vn(t3)) {
        a2 = new Bn({ secretType: t3.secretType, uniCloudIns: e2 }).wrapEncryptDataCallFunction(n2.bind(e2))(t3);
      } else if (Yn({ provider: s2, spaceId: r2, functionName: i2 })) {
        a2 = new Bn({ secretType: t3.secretType, uniCloudIns: e2 }).wrapVerifyClientCallFunction(n2.bind(e2))(t3);
      } else
        a2 = o2(t3);
      return Object.defineProperty(a2, "result", { get: () => (console.warn("当前返回结果为Promise类型，不可直接访问其result属性，详情请参考：https://uniapp.dcloud.net.cn/uniCloud/faq?id=promise"), {}) }), a2.then((e3) => ("undefined" != typeof UTSJSONObject && "undefined" != typeof UTS && (e3.result = UTS.JSON.parse(JSON.stringify(e3.result))), e3));
    };
  }
  Bn = class {
    constructor() {
      throw jn({ message: `Platform ${A} is not enabled, please check whether secure network module is enabled in your manifest.json` });
    }
  };
  const Zn = Symbol("CLIENT_DB_INTERNAL");
  function es(e2, t2) {
    return e2.then = "DoNotReturnProxyWithAFunctionNamedThen", e2._internalType = Zn, e2.inspect = null, e2.__v_raw = void 0, new Proxy(e2, { get(e3, n2, s2) {
      if ("_uniClient" === n2)
        return null;
      if ("symbol" == typeof n2)
        return e3[n2];
      if (n2 in e3 || "string" != typeof n2) {
        const t3 = e3[n2];
        return "function" == typeof t3 ? t3.bind(e3) : t3;
      }
      return t2.get(e3, n2, s2);
    } });
  }
  function ts(e2) {
    return { on: (t2, n2) => {
      e2[t2] = e2[t2] || [], e2[t2].indexOf(n2) > -1 || e2[t2].push(n2);
    }, off: (t2, n2) => {
      e2[t2] = e2[t2] || [];
      const s2 = e2[t2].indexOf(n2);
      -1 !== s2 && e2[t2].splice(s2, 1);
    } };
  }
  const ns = ["db.Geo", "db.command", "command.aggregate"];
  function ss(e2, t2) {
    return ns.indexOf(`${e2}.${t2}`) > -1;
  }
  function rs(e2) {
    switch (f(e2 = ie(e2))) {
      case "array":
        return e2.map((e3) => rs(e3));
      case "object":
        return e2._internalType === Zn || Object.keys(e2).forEach((t2) => {
          e2[t2] = rs(e2[t2]);
        }), e2;
      case "regexp":
        return { $regexp: { source: e2.source, flags: e2.flags } };
      case "date":
        return { $date: e2.toISOString() };
      default:
        return e2;
    }
  }
  function is(e2) {
    return e2 && e2.content && e2.content.$method;
  }
  class os {
    constructor(e2, t2, n2) {
      this.content = e2, this.prevStage = t2 || null, this.udb = null, this._database = n2;
    }
    toJSON() {
      let e2 = this;
      const t2 = [e2.content];
      for (; e2.prevStage; )
        e2 = e2.prevStage, t2.push(e2.content);
      return { $db: t2.reverse().map((e3) => ({ $method: e3.$method, $param: rs(e3.$param) })) };
    }
    toString() {
      return JSON.stringify(this.toJSON());
    }
    getAction() {
      const e2 = this.toJSON().$db.find((e3) => "action" === e3.$method);
      return e2 && e2.$param && e2.$param[0];
    }
    getCommand() {
      return { $db: this.toJSON().$db.filter((e2) => "action" !== e2.$method) };
    }
    get isAggregate() {
      let e2 = this;
      for (; e2; ) {
        const t2 = is(e2), n2 = is(e2.prevStage);
        if ("aggregate" === t2 && "collection" === n2 || "pipeline" === t2)
          return true;
        e2 = e2.prevStage;
      }
      return false;
    }
    get isCommand() {
      let e2 = this;
      for (; e2; ) {
        if ("command" === is(e2))
          return true;
        e2 = e2.prevStage;
      }
      return false;
    }
    get isAggregateCommand() {
      let e2 = this;
      for (; e2; ) {
        const t2 = is(e2), n2 = is(e2.prevStage);
        if ("aggregate" === t2 && "command" === n2)
          return true;
        e2 = e2.prevStage;
      }
      return false;
    }
    getNextStageFn(e2) {
      const t2 = this;
      return function() {
        return as({ $method: e2, $param: rs(Array.from(arguments)) }, t2, t2._database);
      };
    }
    get count() {
      return this.isAggregate ? this.getNextStageFn("count") : function() {
        return this._send("count", Array.from(arguments));
      };
    }
    get remove() {
      return this.isCommand ? this.getNextStageFn("remove") : function() {
        return this._send("remove", Array.from(arguments));
      };
    }
    get() {
      return this._send("get", Array.from(arguments));
    }
    get add() {
      return this.isCommand ? this.getNextStageFn("add") : function() {
        return this._send("add", Array.from(arguments));
      };
    }
    update() {
      return this._send("update", Array.from(arguments));
    }
    end() {
      return this._send("end", Array.from(arguments));
    }
    get set() {
      return this.isCommand ? this.getNextStageFn("set") : function() {
        throw new Error("JQL禁止使用set方法");
      };
    }
    _send(e2, t2) {
      const n2 = this.getAction(), s2 = this.getCommand();
      if (s2.$db.push({ $method: e2, $param: rs(t2) }), S) {
        const e3 = s2.$db.find((e4) => "collection" === e4.$method), t3 = e3 && e3.$param;
        t3 && 1 === t3.length && "string" == typeof e3.$param[0] && e3.$param[0].indexOf(",") > -1 && console.warn("检测到使用JQL语法联表查询时，未使用getTemp先过滤主表数据，在主表数据量大的情况下可能会查询缓慢。\n- 如何优化请参考此文档：https://uniapp.dcloud.net.cn/uniCloud/jql?id=lookup-with-temp \n- 如果主表数据量很小请忽略此信息，项目发行时不会出现此提示。");
      }
      return this._database._callCloudFunction({ action: n2, command: s2 });
    }
  }
  function as(e2, t2, n2) {
    return es(new os(e2, t2, n2), { get(e3, t3) {
      let s2 = "db";
      return e3 && e3.content && (s2 = e3.content.$method), ss(s2, t3) ? as({ $method: t3 }, e3, n2) : function() {
        return as({ $method: t3, $param: rs(Array.from(arguments)) }, e3, n2);
      };
    } });
  }
  function cs({ path: e2, method: t2 }) {
    return class {
      constructor() {
        this.param = Array.from(arguments);
      }
      toJSON() {
        return { $newDb: [...e2.map((e3) => ({ $method: e3 })), { $method: t2, $param: this.param }] };
      }
      toString() {
        return JSON.stringify(this.toJSON());
      }
    };
  }
  function us(e2, t2 = {}) {
    return es(new e2(t2), { get: (e3, t3) => ss("db", t3) ? as({ $method: t3 }, null, e3) : function() {
      return as({ $method: t3, $param: rs(Array.from(arguments)) }, null, e3);
    } });
  }
  class hs extends class {
    constructor({ uniClient: e2 = {}, isJQL: t2 = false } = {}) {
      this._uniClient = e2, this._authCallBacks = {}, this._dbCallBacks = {}, e2._isDefault && (this._dbCallBacks = R("_globalUniCloudDatabaseCallback")), t2 || (this.auth = ts(this._authCallBacks)), this._isJQL = t2, Object.assign(this, ts(this._dbCallBacks)), this.env = es({}, { get: (e3, t3) => ({ $env: t3 }) }), this.Geo = es({}, { get: (e3, t3) => cs({ path: ["Geo"], method: t3 }) }), this.serverDate = cs({ path: [], method: "serverDate" }), this.RegExp = cs({ path: [], method: "RegExp" });
    }
    getCloudEnv(e2) {
      if ("string" != typeof e2 || !e2.trim())
        throw new Error("getCloudEnv参数错误");
      return { $env: e2.replace("$cloudEnv_", "") };
    }
    _callback(e2, t2) {
      const n2 = this._dbCallBacks;
      n2[e2] && n2[e2].forEach((e3) => {
        e3(...t2);
      });
    }
    _callbackAuth(e2, t2) {
      const n2 = this._authCallBacks;
      n2[e2] && n2[e2].forEach((e3) => {
        e3(...t2);
      });
    }
    multiSend() {
      const e2 = Array.from(arguments), t2 = e2.map((e3) => {
        const t3 = e3.getAction(), n2 = e3.getCommand();
        if ("getTemp" !== n2.$db[n2.$db.length - 1].$method)
          throw new Error("multiSend只支持子命令内使用getTemp");
        return { action: t3, command: n2 };
      });
      return this._callCloudFunction({ multiCommand: t2, queryList: e2 });
    }
  } {
    _parseResult(e2) {
      return this._isJQL ? e2.result : e2;
    }
    _callCloudFunction({ action: e2, command: t2, multiCommand: n2, queryList: s2 }) {
      function r2(e3, t3) {
        if (n2 && s2)
          for (let n3 = 0; n3 < s2.length; n3++) {
            const r3 = s2[n3];
            r3.udb && "function" == typeof r3.udb.setResult && (t3 ? r3.udb.setResult(t3) : r3.udb.setResult(e3.result.dataList[n3]));
          }
      }
      const i2 = this, o2 = this._isJQL ? "databaseForJQL" : "database";
      function a2(e3) {
        return i2._callback("error", [e3]), K(F(o2, "fail"), e3).then(() => K(F(o2, "complete"), e3)).then(() => (r2(null, e3), X(B, { type: J, content: e3 }), Promise.reject(e3)));
      }
      const c2 = K(F(o2, "invoke")), u2 = this._uniClient;
      return c2.then(() => u2.callFunction({ name: "DCloud-clientDB", type: h, data: { action: e2, command: t2, multiCommand: n2 } })).then((e3) => {
        const { code: t3, message: n3, token: s3, tokenExpired: c3, systemInfo: u3 = [] } = e3.result;
        if (u3)
          for (let e4 = 0; e4 < u3.length; e4++) {
            const { level: t4, message: n4, detail: s4 } = u3[e4], r3 = console["warn" === t4 ? "error" : t4] || console.log;
            let i3 = "[System Info]" + n4;
            s4 && (i3 = `${i3}
详细信息：${s4}`), r3(i3);
          }
        if (t3) {
          return a2(new se({ code: t3, message: n3, requestId: e3.requestId }));
        }
        e3.result.errCode = e3.result.errCode || e3.result.code, e3.result.errMsg = e3.result.errMsg || e3.result.message, s3 && c3 && (ae({ token: s3, tokenExpired: c3 }), this._callbackAuth("refreshToken", [{ token: s3, tokenExpired: c3 }]), this._callback("refreshToken", [{ token: s3, tokenExpired: c3 }]), X(H, { token: s3, tokenExpired: c3 }));
        const h2 = [{ prop: "affectedDocs", tips: "affectedDocs不再推荐使用，请使用inserted/deleted/updated/data.length替代" }, { prop: "code", tips: "code不再推荐使用，请使用errCode替代" }, { prop: "message", tips: "message不再推荐使用，请使用errMsg替代" }];
        for (let t4 = 0; t4 < h2.length; t4++) {
          const { prop: n4, tips: s4 } = h2[t4];
          if (n4 in e3.result) {
            const t5 = e3.result[n4];
            Object.defineProperty(e3.result, n4, { get: () => (console.warn(s4), t5) });
          }
        }
        return function(e4) {
          return K(F(o2, "success"), e4).then(() => K(F(o2, "complete"), e4)).then(() => {
            r2(e4, null);
            const t4 = i2._parseResult(e4);
            return X(B, { type: J, content: t4 }), Promise.resolve(t4);
          });
        }(e3);
      }, (e3) => {
        /fc_function_not_found|FUNCTION_NOT_FOUND/g.test(e3.message) && console.warn("clientDB未初始化，请在web控制台保存一次schema以开启clientDB");
        return a2(new se({ code: e3.code || "SYSTEM_ERROR", message: e3.message, requestId: e3.requestId }));
      });
    }
  }
  const ls = "token无效，跳转登录页面", ds = "token过期，跳转登录页面", ps = { TOKEN_INVALID_TOKEN_EXPIRED: ds, TOKEN_INVALID_INVALID_CLIENTID: ls, TOKEN_INVALID: ls, TOKEN_INVALID_WRONG_TOKEN: ls, TOKEN_INVALID_ANONYMOUS_USER: ls }, fs = { "uni-id-token-expired": ds, "uni-id-check-token-failed": ls, "uni-id-token-not-exist": ls, "uni-id-check-device-feature-failed": ls };
  function gs(e2, t2) {
    let n2 = "";
    return n2 = e2 ? `${e2}/${t2}` : t2, n2.replace(/^\//, "");
  }
  function ms(e2 = [], t2 = "") {
    const n2 = [], s2 = [];
    return e2.forEach((e3) => {
      true === e3.needLogin ? n2.push(gs(t2, e3.path)) : false === e3.needLogin && s2.push(gs(t2, e3.path));
    }), { needLoginPage: n2, notNeedLoginPage: s2 };
  }
  function ys(e2) {
    return e2.split("?")[0].replace(/^\//, "");
  }
  function _s() {
    return function(e2) {
      let t2 = e2 && e2.$page && e2.$page.fullPath || "";
      return t2 ? ("/" !== t2.charAt(0) && (t2 = "/" + t2), t2) : t2;
    }(function() {
      const e2 = getCurrentPages();
      return e2[e2.length - 1];
    }());
  }
  function ws() {
    return ys(_s());
  }
  function vs(e2 = "", t2 = {}) {
    if (!e2)
      return false;
    if (!(t2 && t2.list && t2.list.length))
      return false;
    const n2 = t2.list, s2 = ys(e2);
    return n2.some((e3) => e3.pagePath === s2);
  }
  const Is = !!e.uniIdRouter;
  const { loginPage: Ss, routerNeedLogin: bs, resToLogin: ks, needLoginPage: Ts, notNeedLoginPage: As, loginPageInTabBar: Ps } = function({ pages: t2 = [], subPackages: n2 = [], uniIdRouter: s2 = {}, tabBar: r2 = {} } = e) {
    const { loginPage: i2, needLogin: o2 = [], resToLogin: a2 = true } = s2, { needLoginPage: c2, notNeedLoginPage: u2 } = ms(t2), { needLoginPage: h2, notNeedLoginPage: l2 } = function(e2 = []) {
      const t3 = [], n3 = [];
      return e2.forEach((e3) => {
        const { root: s3, pages: r3 = [] } = e3, { needLoginPage: i3, notNeedLoginPage: o3 } = ms(r3, s3);
        t3.push(...i3), n3.push(...o3);
      }), { needLoginPage: t3, notNeedLoginPage: n3 };
    }(n2);
    return { loginPage: i2, routerNeedLogin: o2, resToLogin: a2, needLoginPage: [...c2, ...h2], notNeedLoginPage: [...u2, ...l2], loginPageInTabBar: vs(i2, r2) };
  }();
  if (Ts.indexOf(Ss) > -1)
    throw new Error(`Login page [${Ss}] should not be "needLogin", please check your pages.json`);
  function Cs(e2) {
    const t2 = ws();
    if ("/" === e2.charAt(0))
      return e2;
    const [n2, s2] = e2.split("?"), r2 = n2.replace(/^\//, "").split("/"), i2 = t2.split("/");
    i2.pop();
    for (let e3 = 0; e3 < r2.length; e3++) {
      const t3 = r2[e3];
      ".." === t3 ? i2.pop() : "." !== t3 && i2.push(t3);
    }
    return "" === i2[0] && i2.shift(), "/" + i2.join("/") + (s2 ? "?" + s2 : "");
  }
  function xs(e2) {
    const t2 = ys(Cs(e2));
    return !(As.indexOf(t2) > -1) && (Ts.indexOf(t2) > -1 || bs.some((t3) => function(e3, t4) {
      return new RegExp(t4).test(e3);
    }(e2, t3)));
  }
  function Os({ redirect: e2 }) {
    const t2 = ys(e2), n2 = ys(Ss);
    return ws() !== n2 && t2 !== n2;
  }
  function Es({ api: e2, redirect: t2 } = {}) {
    if (!t2 || !Os({ redirect: t2 }))
      return;
    const n2 = function(e3, t3) {
      return "/" !== e3.charAt(0) && (e3 = "/" + e3), t3 ? e3.indexOf("?") > -1 ? e3 + `&uniIdRedirectUrl=${encodeURIComponent(t3)}` : e3 + `?uniIdRedirectUrl=${encodeURIComponent(t3)}` : e3;
    }(Ss, t2);
    Ps ? "navigateTo" !== e2 && "redirectTo" !== e2 || (e2 = "switchTab") : "switchTab" === e2 && (e2 = "navigateTo");
    const s2 = { navigateTo: uni.navigateTo, redirectTo: uni.redirectTo, switchTab: uni.switchTab, reLaunch: uni.reLaunch };
    setTimeout(() => {
      s2[e2]({ url: n2 });
    }, 0);
  }
  function Ls({ url: e2 } = {}) {
    const t2 = { abortLoginPageJump: false, autoToLoginPage: false }, n2 = function() {
      const { token: e3, tokenExpired: t3 } = oe();
      let n3;
      if (e3) {
        if (t3 < Date.now()) {
          const e4 = "uni-id-token-expired";
          n3 = { errCode: e4, errMsg: fs[e4] };
        }
      } else {
        const e4 = "uni-id-check-token-failed";
        n3 = { errCode: e4, errMsg: fs[e4] };
      }
      return n3;
    }();
    if (xs(e2) && n2) {
      n2.uniIdRedirectUrl = e2;
      if (G(W).length > 0)
        return setTimeout(() => {
          X(W, n2);
        }, 0), t2.abortLoginPageJump = true, t2;
      t2.autoToLoginPage = true;
    }
    return t2;
  }
  function Rs() {
    !function() {
      const e3 = _s(), { abortLoginPageJump: t2, autoToLoginPage: n2 } = Ls({ url: e3 });
      t2 || n2 && Es({ api: "redirectTo", redirect: e3 });
    }();
    const e2 = ["navigateTo", "redirectTo", "reLaunch", "switchTab"];
    for (let t2 = 0; t2 < e2.length; t2++) {
      const n2 = e2[t2];
      uni.addInterceptor(n2, { invoke(e3) {
        const { abortLoginPageJump: t3, autoToLoginPage: s2 } = Ls({ url: e3.url });
        return t3 ? e3 : s2 ? (Es({ api: n2, redirect: Cs(e3.url) }), false) : e3;
      } });
    }
  }
  function Us() {
    this.onResponse((e2) => {
      const { type: t2, content: n2 } = e2;
      let s2 = false;
      switch (t2) {
        case "cloudobject":
          s2 = function(e3) {
            if ("object" != typeof e3)
              return false;
            const { errCode: t3 } = e3 || {};
            return t3 in fs;
          }(n2);
          break;
        case "clientdb":
          s2 = function(e3) {
            if ("object" != typeof e3)
              return false;
            const { errCode: t3 } = e3 || {};
            return t3 in ps;
          }(n2);
      }
      s2 && function(e3 = {}) {
        const t3 = G(W);
        te().then(() => {
          const n3 = _s();
          if (n3 && Os({ redirect: n3 }))
            return t3.length > 0 ? X(W, Object.assign({ uniIdRedirectUrl: n3 }, e3)) : void (Ss && Es({ api: "navigateTo", redirect: n3 }));
        });
      }(n2);
    });
  }
  function Ns(e2) {
    !function(e3) {
      e3.onResponse = function(e4) {
        Y(B, e4);
      }, e3.offResponse = function(e4) {
        Q(B, e4);
      };
    }(e2), function(e3) {
      e3.onNeedLogin = function(e4) {
        Y(W, e4);
      }, e3.offNeedLogin = function(e4) {
        Q(W, e4);
      }, Is && (R("_globalUniCloudStatus").needLoginInit || (R("_globalUniCloudStatus").needLoginInit = true, te().then(() => {
        Rs.call(e3);
      }), ks && Us.call(e3)));
    }(e2), function(e3) {
      e3.onRefreshToken = function(e4) {
        Y(H, e4);
      }, e3.offRefreshToken = function(e4) {
        Q(H, e4);
      };
    }(e2);
  }
  let Ds;
  const Ms = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", qs = /^(?:[A-Za-z\d+/]{4})*?(?:[A-Za-z\d+/]{2}(?:==)?|[A-Za-z\d+/]{3}=?)?$/;
  function Ks() {
    const e2 = oe().token || "", t2 = e2.split(".");
    if (!e2 || 3 !== t2.length)
      return { uid: null, role: [], permission: [], tokenExpired: 0 };
    let n2;
    try {
      n2 = JSON.parse((s2 = t2[1], decodeURIComponent(Ds(s2).split("").map(function(e3) {
        return "%" + ("00" + e3.charCodeAt(0).toString(16)).slice(-2);
      }).join(""))));
    } catch (e3) {
      throw new Error("获取当前用户信息出错，详细错误信息为：" + e3.message);
    }
    var s2;
    return n2.tokenExpired = 1e3 * n2.exp, delete n2.exp, delete n2.iat, n2;
  }
  Ds = "function" != typeof atob ? function(e2) {
    if (e2 = String(e2).replace(/[\t\n\f\r ]+/g, ""), !qs.test(e2))
      throw new Error("Failed to execute 'atob' on 'Window': The string to be decoded is not correctly encoded.");
    var t2;
    e2 += "==".slice(2 - (3 & e2.length));
    for (var n2, s2, r2 = "", i2 = 0; i2 < e2.length; )
      t2 = Ms.indexOf(e2.charAt(i2++)) << 18 | Ms.indexOf(e2.charAt(i2++)) << 12 | (n2 = Ms.indexOf(e2.charAt(i2++))) << 6 | (s2 = Ms.indexOf(e2.charAt(i2++))), r2 += 64 === n2 ? String.fromCharCode(t2 >> 16 & 255) : 64 === s2 ? String.fromCharCode(t2 >> 16 & 255, t2 >> 8 & 255) : String.fromCharCode(t2 >> 16 & 255, t2 >> 8 & 255, 255 & t2);
    return r2;
  } : atob;
  var Fs = n(function(e2, t2) {
    Object.defineProperty(t2, "__esModule", { value: true });
    const n2 = "chooseAndUploadFile:ok", s2 = "chooseAndUploadFile:fail";
    function r2(e3, t3) {
      return e3.tempFiles.forEach((e4, n3) => {
        e4.name || (e4.name = e4.path.substring(e4.path.lastIndexOf("/") + 1)), t3 && (e4.fileType = t3), e4.cloudPath = Date.now() + "_" + n3 + e4.name.substring(e4.name.lastIndexOf("."));
      }), e3.tempFilePaths || (e3.tempFilePaths = e3.tempFiles.map((e4) => e4.path)), e3;
    }
    function i2(e3, t3, { onChooseFile: s3, onUploadProgress: r3 }) {
      return t3.then((e4) => {
        if (s3) {
          const t4 = s3(e4);
          if (void 0 !== t4)
            return Promise.resolve(t4).then((t5) => void 0 === t5 ? e4 : t5);
        }
        return e4;
      }).then((t4) => false === t4 ? { errMsg: n2, tempFilePaths: [], tempFiles: [] } : function(e4, t5, s4 = 5, r4) {
        (t5 = Object.assign({}, t5)).errMsg = n2;
        const i3 = t5.tempFiles, o2 = i3.length;
        let a2 = 0;
        return new Promise((n3) => {
          for (; a2 < s4; )
            c2();
          function c2() {
            const s5 = a2++;
            if (s5 >= o2)
              return void (!i3.find((e5) => !e5.url && !e5.errMsg) && n3(t5));
            const u2 = i3[s5];
            e4.uploadFile({ provider: u2.provider, filePath: u2.path, cloudPath: u2.cloudPath, fileType: u2.fileType, cloudPathAsRealPath: u2.cloudPathAsRealPath, onUploadProgress(e5) {
              e5.index = s5, e5.tempFile = u2, e5.tempFilePath = u2.path, r4 && r4(e5);
            } }).then((e5) => {
              u2.url = e5.fileID, s5 < o2 && c2();
            }).catch((e5) => {
              u2.errMsg = e5.errMsg || e5.message, s5 < o2 && c2();
            });
          }
        });
      }(e3, t4, 5, r3));
    }
    t2.initChooseAndUploadFile = function(e3) {
      return function(t3 = { type: "all" }) {
        return "image" === t3.type ? i2(e3, function(e4) {
          const { count: t4, sizeType: n3, sourceType: i3 = ["album", "camera"], extension: o2 } = e4;
          return new Promise((e5, a2) => {
            uni.chooseImage({ count: t4, sizeType: n3, sourceType: i3, extension: o2, success(t5) {
              e5(r2(t5, "image"));
            }, fail(e6) {
              a2({ errMsg: e6.errMsg.replace("chooseImage:fail", s2) });
            } });
          });
        }(t3), t3) : "video" === t3.type ? i2(e3, function(e4) {
          const { camera: t4, compressed: n3, maxDuration: i3, sourceType: o2 = ["album", "camera"], extension: a2 } = e4;
          return new Promise((e5, c2) => {
            uni.chooseVideo({ camera: t4, compressed: n3, maxDuration: i3, sourceType: o2, extension: a2, success(t5) {
              const { tempFilePath: n4, duration: s3, size: i4, height: o3, width: a3 } = t5;
              e5(r2({ errMsg: "chooseVideo:ok", tempFilePaths: [n4], tempFiles: [{ name: t5.tempFile && t5.tempFile.name || "", path: n4, size: i4, type: t5.tempFile && t5.tempFile.type || "", width: a3, height: o3, duration: s3, fileType: "video", cloudPath: "" }] }, "video"));
            }, fail(e6) {
              c2({ errMsg: e6.errMsg.replace("chooseVideo:fail", s2) });
            } });
          });
        }(t3), t3) : i2(e3, function(e4) {
          const { count: t4, extension: n3 } = e4;
          return new Promise((e5, i3) => {
            let o2 = uni.chooseFile;
            if ("undefined" != typeof wx && "function" == typeof wx.chooseMessageFile && (o2 = wx.chooseMessageFile), "function" != typeof o2)
              return i3({ errMsg: s2 + " 请指定 type 类型，该平台仅支持选择 image 或 video。" });
            o2({ type: "all", count: t4, extension: n3, success(t5) {
              e5(r2(t5));
            }, fail(e6) {
              i3({ errMsg: e6.errMsg.replace("chooseFile:fail", s2) });
            } });
          });
        }(t3), t3);
      };
    };
  }), js = t(Fs);
  const $s = "manual";
  function Bs(e2) {
    return { props: { localdata: { type: Array, default: () => [] }, options: { type: [Object, Array], default: () => ({}) }, spaceInfo: { type: Object, default: () => ({}) }, collection: { type: [String, Array], default: "" }, action: { type: String, default: "" }, field: { type: String, default: "" }, orderby: { type: String, default: "" }, where: { type: [String, Object], default: "" }, pageData: { type: String, default: "add" }, pageCurrent: { type: Number, default: 1 }, pageSize: { type: Number, default: 20 }, getcount: { type: [Boolean, String], default: false }, gettree: { type: [Boolean, String], default: false }, gettreepath: { type: [Boolean, String], default: false }, startwith: { type: String, default: "" }, limitlevel: { type: Number, default: 10 }, groupby: { type: String, default: "" }, groupField: { type: String, default: "" }, distinct: { type: [Boolean, String], default: false }, foreignKey: { type: String, default: "" }, loadtime: { type: String, default: "auto" }, manual: { type: Boolean, default: false } }, data: () => ({ mixinDatacomLoading: false, mixinDatacomHasMore: false, mixinDatacomResData: [], mixinDatacomErrorMessage: "", mixinDatacomPage: {}, mixinDatacomError: null }), created() {
      this.mixinDatacomPage = { current: this.pageCurrent, size: this.pageSize, count: 0 }, this.$watch(() => {
        var e3 = [];
        return ["pageCurrent", "pageSize", "localdata", "collection", "action", "field", "orderby", "where", "getont", "getcount", "gettree", "groupby", "groupField", "distinct"].forEach((t2) => {
          e3.push(this[t2]);
        }), e3;
      }, (e3, t2) => {
        if (this.loadtime === $s)
          return;
        let n2 = false;
        const s2 = [];
        for (let r2 = 2; r2 < e3.length; r2++)
          e3[r2] !== t2[r2] && (s2.push(e3[r2]), n2 = true);
        e3[0] !== t2[0] && (this.mixinDatacomPage.current = this.pageCurrent), this.mixinDatacomPage.size = this.pageSize, this.onMixinDatacomPropsChange(n2, s2);
      });
    }, methods: { onMixinDatacomPropsChange(e3, t2) {
    }, mixinDatacomEasyGet({ getone: e3 = false, success: t2, fail: n2 } = {}) {
      this.mixinDatacomLoading || (this.mixinDatacomLoading = true, this.mixinDatacomErrorMessage = "", this.mixinDatacomError = null, this.mixinDatacomGet().then((n3) => {
        this.mixinDatacomLoading = false;
        const { data: s2, count: r2 } = n3.result;
        this.getcount && (this.mixinDatacomPage.count = r2), this.mixinDatacomHasMore = s2.length < this.pageSize;
        const i2 = e3 ? s2.length ? s2[0] : void 0 : s2;
        this.mixinDatacomResData = i2, t2 && t2(i2);
      }).catch((e4) => {
        this.mixinDatacomLoading = false, this.mixinDatacomErrorMessage = e4, this.mixinDatacomError = e4, n2 && n2(e4);
      }));
    }, mixinDatacomGet(t2 = {}) {
      let n2;
      t2 = t2 || {}, n2 = "undefined" != typeof __uniX && __uniX ? e2.databaseForJQL(this.spaceInfo) : e2.database(this.spaceInfo);
      const s2 = t2.action || this.action;
      s2 && (n2 = n2.action(s2));
      const r2 = t2.collection || this.collection;
      n2 = Array.isArray(r2) ? n2.collection(...r2) : n2.collection(r2);
      const i2 = t2.where || this.where;
      i2 && Object.keys(i2).length && (n2 = n2.where(i2));
      const o2 = t2.field || this.field;
      o2 && (n2 = n2.field(o2));
      const a2 = t2.foreignKey || this.foreignKey;
      a2 && (n2 = n2.foreignKey(a2));
      const c2 = t2.groupby || this.groupby;
      c2 && (n2 = n2.groupBy(c2));
      const u2 = t2.groupField || this.groupField;
      u2 && (n2 = n2.groupField(u2));
      true === (void 0 !== t2.distinct ? t2.distinct : this.distinct) && (n2 = n2.distinct());
      const h2 = t2.orderby || this.orderby;
      h2 && (n2 = n2.orderBy(h2));
      const l2 = void 0 !== t2.pageCurrent ? t2.pageCurrent : this.mixinDatacomPage.current, d2 = void 0 !== t2.pageSize ? t2.pageSize : this.mixinDatacomPage.size, p2 = void 0 !== t2.getcount ? t2.getcount : this.getcount, f2 = void 0 !== t2.gettree ? t2.gettree : this.gettree, g2 = void 0 !== t2.gettreepath ? t2.gettreepath : this.gettreepath, m2 = { getCount: p2 }, y2 = { limitLevel: void 0 !== t2.limitlevel ? t2.limitlevel : this.limitlevel, startWith: void 0 !== t2.startwith ? t2.startwith : this.startwith };
      return f2 && (m2.getTree = y2), g2 && (m2.getTreePath = y2), n2 = n2.skip(d2 * (l2 - 1)).limit(d2).get(m2), n2;
    } } };
  }
  function Ws(e2) {
    return function(t2, n2 = {}) {
      n2 = function(e3, t3 = {}) {
        return e3.customUI = t3.customUI || e3.customUI, e3.parseSystemError = t3.parseSystemError || e3.parseSystemError, Object.assign(e3.loadingOptions, t3.loadingOptions), Object.assign(e3.errorOptions, t3.errorOptions), "object" == typeof t3.secretMethods && (e3.secretMethods = t3.secretMethods), e3;
      }({ customUI: false, loadingOptions: { title: "加载中...", mask: true }, errorOptions: { type: "modal", retry: false } }, n2);
      const { customUI: s2, loadingOptions: r2, errorOptions: i2, parseSystemError: o2 } = n2, a2 = !s2;
      return new Proxy({}, { get(s3, c2) {
        switch (c2) {
          case "toString":
            return "[object UniCloudObject]";
          case "toJSON":
            return {};
        }
        return function({ fn: e3, interceptorName: t3, getCallbackArgs: n3 } = {}) {
          return async function(...s4) {
            const r3 = n3 ? n3({ params: s4 }) : {};
            let i3, o3;
            try {
              return await K(F(t3, "invoke"), { ...r3 }), i3 = await e3(...s4), await K(F(t3, "success"), { ...r3, result: i3 }), i3;
            } catch (e4) {
              throw o3 = e4, await K(F(t3, "fail"), { ...r3, error: o3 }), o3;
            } finally {
              await K(F(t3, "complete"), o3 ? { ...r3, error: o3 } : { ...r3, result: i3 });
            }
          };
        }({ fn: async function s4(...h2) {
          let l2;
          a2 && uni.showLoading({ title: r2.title, mask: r2.mask });
          const d2 = { name: t2, type: u, data: { method: c2, params: h2 } };
          "object" == typeof n2.secretMethods && function(e3, t3) {
            const n3 = t3.data.method, s5 = e3.secretMethods || {}, r3 = s5[n3] || s5["*"];
            r3 && (t3.secretType = r3);
          }(n2, d2);
          let p2 = false;
          try {
            l2 = await e2.callFunction(d2);
          } catch (e3) {
            p2 = true, l2 = { result: new se(e3) };
          }
          const { errSubject: f2, errCode: g2, errMsg: m2, newToken: y2 } = l2.result || {};
          if (a2 && uni.hideLoading(), y2 && y2.token && y2.tokenExpired && (ae(y2), X(H, { ...y2 })), g2) {
            let e3 = m2;
            if (p2 && o2) {
              e3 = (await o2({ objectName: t2, methodName: c2, params: h2, errSubject: f2, errCode: g2, errMsg: m2 })).errMsg || m2;
            }
            if (a2)
              if ("toast" === i2.type)
                uni.showToast({ title: e3, icon: "none" });
              else {
                if ("modal" !== i2.type)
                  throw new Error(`Invalid errorOptions.type: ${i2.type}`);
                {
                  const { confirm: t3 } = await async function({ title: e4, content: t4, showCancel: n4, cancelText: s5, confirmText: r3 } = {}) {
                    return new Promise((i3, o3) => {
                      uni.showModal({ title: e4, content: t4, showCancel: n4, cancelText: s5, confirmText: r3, success(e5) {
                        i3(e5);
                      }, fail() {
                        i3({ confirm: false, cancel: true });
                      } });
                    });
                  }({ title: "提示", content: e3, showCancel: i2.retry, cancelText: "取消", confirmText: i2.retry ? "重试" : "确定" });
                  if (i2.retry && t3)
                    return s4(...h2);
                }
              }
            const n3 = new se({ subject: f2, code: g2, message: m2, requestId: l2.requestId });
            throw n3.detail = l2.result, X(B, { type: V, content: n3 }), n3;
          }
          return X(B, { type: V, content: l2.result }), l2.result;
        }, interceptorName: "callObject", getCallbackArgs: function({ params: e3 } = {}) {
          return { objectName: t2, methodName: c2, params: e3 };
        } });
      } });
    };
  }
  function Hs(e2) {
    return R("_globalUniCloudSecureNetworkCache__{spaceId}".replace("{spaceId}", e2.config.spaceId));
  }
  async function Js({ openid: e2, callLoginByWeixin: t2 = false } = {}) {
    Hs(this);
    throw new Error(`[SecureNetwork] API \`initSecureNetworkByWeixin\` is not supported on platform \`${A}\``);
  }
  async function zs(e2) {
    const t2 = Hs(this);
    return t2.initPromise || (t2.initPromise = Js.call(this, e2).then((e3) => e3).catch((e3) => {
      throw delete t2.initPromise, e3;
    })), t2.initPromise;
  }
  function Vs(e2) {
    return function({ openid: t2, callLoginByWeixin: n2 = false } = {}) {
      return zs.call(e2, { openid: t2, callLoginByWeixin: n2 });
    };
  }
  function Gs(e2) {
    !function(e3) {
      de = e3;
    }(e2);
  }
  function Ys(e2) {
    const t2 = { getSystemInfo: uni.getSystemInfo, getPushClientId: uni.getPushClientId };
    return function(n2) {
      return new Promise((s2, r2) => {
        t2[e2]({ ...n2, success(e3) {
          s2(e3);
        }, fail(e3) {
          r2(e3);
        } });
      });
    };
  }
  class Qs extends class {
    constructor() {
      this._callback = {};
    }
    addListener(e2, t2) {
      this._callback[e2] || (this._callback[e2] = []), this._callback[e2].push(t2);
    }
    on(e2, t2) {
      return this.addListener(e2, t2);
    }
    removeListener(e2, t2) {
      if (!t2)
        throw new Error('The "listener" argument must be of type function. Received undefined');
      const n2 = this._callback[e2];
      if (!n2)
        return;
      const s2 = function(e3, t3) {
        for (let n3 = e3.length - 1; n3 >= 0; n3--)
          if (e3[n3] === t3)
            return n3;
        return -1;
      }(n2, t2);
      n2.splice(s2, 1);
    }
    off(e2, t2) {
      return this.removeListener(e2, t2);
    }
    removeAllListener(e2) {
      delete this._callback[e2];
    }
    emit(e2, ...t2) {
      const n2 = this._callback[e2];
      if (n2)
        for (let e3 = 0; e3 < n2.length; e3++)
          n2[e3](...t2);
    }
  } {
    constructor() {
      super(), this._uniPushMessageCallback = this._receivePushMessage.bind(this), this._currentMessageId = -1, this._payloadQueue = [];
    }
    init() {
      return Promise.all([Ys("getSystemInfo")(), Ys("getPushClientId")()]).then(([{ appId: e2 } = {}, { cid: t2 } = {}] = []) => {
        if (!e2)
          throw new Error("Invalid appId, please check the manifest.json file");
        if (!t2)
          throw new Error("Invalid push client id");
        this._appId = e2, this._pushClientId = t2, this._seqId = Date.now() + "-" + Math.floor(9e5 * Math.random() + 1e5), this.emit("open"), this._initMessageListener();
      }, (e2) => {
        throw this.emit("error", e2), this.close(), e2;
      });
    }
    async open() {
      return this.init();
    }
    _isUniCloudSSE(e2) {
      if ("receive" !== e2.type)
        return false;
      const t2 = e2 && e2.data && e2.data.payload;
      return !(!t2 || "UNI_CLOUD_SSE" !== t2.channel || t2.seqId !== this._seqId);
    }
    _receivePushMessage(e2) {
      if (!this._isUniCloudSSE(e2))
        return;
      const t2 = e2 && e2.data && e2.data.payload, { action: n2, messageId: s2, message: r2 } = t2;
      this._payloadQueue.push({ action: n2, messageId: s2, message: r2 }), this._consumMessage();
    }
    _consumMessage() {
      for (; ; ) {
        const e2 = this._payloadQueue.find((e3) => e3.messageId === this._currentMessageId + 1);
        if (!e2)
          break;
        this._currentMessageId++, this._parseMessagePayload(e2);
      }
    }
    _parseMessagePayload(e2) {
      const { action: t2, messageId: n2, message: s2 } = e2;
      "end" === t2 ? this._end({ messageId: n2, message: s2 }) : "message" === t2 && this._appendMessage({ messageId: n2, message: s2 });
    }
    _appendMessage({ messageId: e2, message: t2 } = {}) {
      this.emit("message", t2);
    }
    _end({ messageId: e2, message: t2 } = {}) {
      this.emit("end", t2), this.close();
    }
    _initMessageListener() {
      uni.onPushMessage(this._uniPushMessageCallback);
    }
    _destroy() {
      uni.offPushMessage(this._uniPushMessageCallback);
    }
    toJSON() {
      return { appId: this._appId, pushClientId: this._pushClientId, seqId: this._seqId };
    }
    close() {
      this._destroy(), this.emit("close");
    }
  }
  async function Xs(e2) {
    {
      const { osName: e3, osVersion: t3 } = he();
      "ios" === e3 && function(e4) {
        if (!e4 || "string" != typeof e4)
          return 0;
        const t4 = e4.match(/^(\d+)./);
        return t4 && t4[1] ? parseInt(t4[1]) : 0;
      }(t3) >= 14 && console.warn("iOS 14及以上版本连接uniCloud本地调试服务需要允许客户端查找并连接到本地网络上的设备（仅开发期间需要，发行后不需要）");
    }
    const t2 = e2.__dev__;
    if (!t2.debugInfo)
      return;
    const { address: n2, servePort: s2 } = t2.debugInfo, { address: r2 } = await Et(n2, s2);
    if (r2)
      return t2.localAddress = r2, void (t2.localPort = s2);
    const i2 = console["error"];
    let o2 = "";
    if ("remote" === t2.debugInfo.initialLaunchType ? (t2.debugInfo.forceRemote = true, o2 = "当前客户端和HBuilderX不在同一局域网下（或其他网络原因无法连接HBuilderX），uniCloud本地调试服务不对当前客户端生效。\n- 如果不使用uniCloud本地调试服务，请直接忽略此信息。\n- 如需使用uniCloud本地调试服务，请将客户端与主机连接到同一局域网下并重新运行到客户端。") : o2 = "无法连接uniCloud本地调试服务，请检查当前客户端是否与主机在同一局域网下。\n- 如需使用uniCloud本地调试服务，请将客户端与主机连接到同一局域网下并重新运行到客户端。", o2 += "\n- 如果在HBuilderX开启的状态下切换过网络环境，请重启HBuilderX后再试\n- 检查系统防火墙是否拦截了HBuilderX自带的nodejs\n- 检查是否错误的使用拦截器修改uni.request方法的参数", 0 === A.indexOf("mp-") && (o2 += "\n- 小程序中如何使用uniCloud，请参考：https://uniapp.dcloud.net.cn/uniCloud/publish.html#useinmp"), !t2.debugInfo.forceRemote)
      throw new Error(o2);
    i2(o2);
  }
  function Zs(e2) {
    e2._initPromiseHub || (e2._initPromiseHub = new v({ createPromise: function() {
      let t2 = Promise.resolve();
      var n2;
      n2 = 1, t2 = new Promise((e3) => {
        setTimeout(() => {
          e3();
        }, n2);
      });
      const s2 = e2.auth();
      return t2.then(() => s2.getLoginState()).then((e3) => e3 ? Promise.resolve() : s2.signInAnonymously());
    } }));
  }
  const er = { tcb: xt, tencent: xt, aliyun: me, private: Ut, dcloud: Ut, alipay: Wt };
  let tr = new class {
    init(e2) {
      let t2 = {};
      const n2 = er[e2.provider];
      if (!n2)
        throw new Error("未提供正确的provider参数");
      t2 = n2.init(e2), function(e3) {
        const t3 = {};
        e3.__dev__ = t3, t3.debugLog = "app" === A;
        const n3 = P;
        n3 && !n3.code && (t3.debugInfo = n3);
        const s2 = new v({ createPromise: function() {
          return Xs(e3);
        } });
        t3.initLocalNetwork = function() {
          return s2.exec();
        };
      }(t2), Zs(t2), Xn(t2), function(e3) {
        const t3 = e3.uploadFile;
        e3.uploadFile = function(e4) {
          return t3.call(this, e4);
        };
      }(t2), function(e3) {
        e3.database = function(t3) {
          if (t3 && Object.keys(t3).length > 0)
            return e3.init(t3).database();
          if (this._database)
            return this._database;
          const n3 = us(hs, { uniClient: e3 });
          return this._database = n3, n3;
        }, e3.databaseForJQL = function(t3) {
          if (t3 && Object.keys(t3).length > 0)
            return e3.init(t3).databaseForJQL();
          if (this._databaseForJQL)
            return this._databaseForJQL;
          const n3 = us(hs, { uniClient: e3, isJQL: true });
          return this._databaseForJQL = n3, n3;
        };
      }(t2), function(e3) {
        e3.getCurrentUserInfo = Ks, e3.chooseAndUploadFile = js.initChooseAndUploadFile(e3), Object.assign(e3, { get mixinDatacom() {
          return Bs(e3);
        } }), e3.SSEChannel = Qs, e3.initSecureNetworkByWeixin = Vs(e3), e3.setCustomClientInfo = Gs, e3.importObject = Ws(e3);
      }(t2);
      return ["callFunction", "uploadFile", "deleteFile", "getTempFileURL", "downloadFile", "chooseAndUploadFile"].forEach((e3) => {
        if (!t2[e3])
          return;
        const n3 = t2[e3];
        t2[e3] = function() {
          return n3.apply(t2, Array.from(arguments));
        }, t2[e3] = (/* @__PURE__ */ function(e4, t3) {
          return function(n4) {
            let s2 = false;
            if ("callFunction" === t3) {
              const e5 = n4 && n4.type || c;
              s2 = e5 !== c;
            }
            const r2 = "callFunction" === t3 && !s2, i2 = this._initPromiseHub.exec();
            n4 = n4 || {};
            const { success: o2, fail: a2, complete: u2 } = ne(n4), h2 = i2.then(() => s2 ? Promise.resolve() : K(F(t3, "invoke"), n4)).then(() => e4.call(this, n4)).then((e5) => s2 ? Promise.resolve(e5) : K(F(t3, "success"), e5).then(() => K(F(t3, "complete"), e5)).then(() => (r2 && X(B, { type: z, content: e5 }), Promise.resolve(e5))), (e5) => s2 ? Promise.reject(e5) : K(F(t3, "fail"), e5).then(() => K(F(t3, "complete"), e5)).then(() => (X(B, { type: z, content: e5 }), Promise.reject(e5))));
            if (!(o2 || a2 || u2))
              return h2;
            h2.then((e5) => {
              o2 && o2(e5), u2 && u2(e5), r2 && X(B, { type: z, content: e5 });
            }, (e5) => {
              a2 && a2(e5), u2 && u2(e5), r2 && X(B, { type: z, content: e5 });
            });
          };
        }(t2[e3], e3)).bind(t2);
      }), t2.init = this.init, t2;
    }
  }();
  (() => {
    const e2 = C;
    let t2 = {};
    if (e2 && 1 === e2.length)
      t2 = e2[0], tr = tr.init(t2), tr._isDefault = true;
    else {
      const t3 = ["auth", "callFunction", "uploadFile", "deleteFile", "getTempFileURL", "downloadFile", "database", "getCurrentUSerInfo", "importObject"];
      let n2;
      n2 = e2 && e2.length > 0 ? "应用有多个服务空间，请通过uniCloud.init方法指定要使用的服务空间" : "应用未关联服务空间，请在uniCloud目录右键关联服务空间", t3.forEach((e3) => {
        tr[e3] = function() {
          return console.error(n2), Promise.reject(new se({ code: "SYS_ERR", message: n2 }));
        };
      });
    }
    if (Object.assign(tr, { get mixinDatacom() {
      return Bs(tr);
    } }), Ns(tr), tr.addInterceptor = M, tr.removeInterceptor = q, tr.interceptObject = j, uni.__uniCloud = tr, "app" === A) {
      const e3 = U();
      e3.uniCloud = tr, e3.UniCloudError = se;
    }
  })();
  var nr = tr;
  const dataPicker = {
    props: {
      localdata: {
        type: [Array, Object],
        default() {
          return [];
        }
      },
      spaceInfo: {
        type: Object,
        default() {
          return {};
        }
      },
      collection: {
        type: String,
        default: ""
      },
      action: {
        type: String,
        default: ""
      },
      field: {
        type: String,
        default: ""
      },
      orderby: {
        type: String,
        default: ""
      },
      where: {
        type: [String, Object],
        default: ""
      },
      pageData: {
        type: String,
        default: "add"
      },
      pageCurrent: {
        type: Number,
        default: 1
      },
      pageSize: {
        type: Number,
        default: 500
      },
      getcount: {
        type: [Boolean, String],
        default: false
      },
      getone: {
        type: [Boolean, String],
        default: false
      },
      gettree: {
        type: [Boolean, String],
        default: false
      },
      manual: {
        type: Boolean,
        default: false
      },
      value: {
        type: [Array, String, Number],
        default() {
          return [];
        }
      },
      modelValue: {
        type: [Array, String, Number],
        default() {
          return [];
        }
      },
      preload: {
        type: Boolean,
        default: false
      },
      stepSearh: {
        type: Boolean,
        default: true
      },
      selfField: {
        type: String,
        default: ""
      },
      parentField: {
        type: String,
        default: ""
      },
      multiple: {
        type: Boolean,
        default: false
      },
      map: {
        type: Object,
        default() {
          return {
            text: "text",
            value: "value"
          };
        }
      }
    },
    data() {
      return {
        loading: false,
        errorMessage: "",
        loadMore: {
          contentdown: "",
          contentrefresh: "",
          contentnomore: ""
        },
        dataList: [],
        selected: [],
        selectedIndex: 0,
        page: {
          current: this.pageCurrent,
          size: this.pageSize,
          count: 0
        }
      };
    },
    computed: {
      isLocalData() {
        return !this.collection.length;
      },
      isCloudData() {
        return this.collection.length > 0;
      },
      isCloudDataList() {
        return this.isCloudData && (!this.parentField && !this.selfField);
      },
      isCloudDataTree() {
        return this.isCloudData && this.parentField && this.selfField;
      },
      dataValue() {
        let isModelValue = Array.isArray(this.modelValue) ? this.modelValue.length > 0 : this.modelValue !== null || this.modelValue !== void 0;
        return isModelValue ? this.modelValue : this.value;
      },
      hasValue() {
        if (typeof this.dataValue === "number") {
          return true;
        }
        return this.dataValue != null && this.dataValue.length > 0;
      }
    },
    created() {
      this.$watch(() => {
        var al = [];
        [
          "pageCurrent",
          "pageSize",
          "spaceInfo",
          "value",
          "modelValue",
          "localdata",
          "collection",
          "action",
          "field",
          "orderby",
          "where",
          "getont",
          "getcount",
          "gettree"
        ].forEach((key) => {
          al.push(this[key]);
        });
        return al;
      }, (newValue, oldValue) => {
        for (let i2 = 2; i2 < newValue.length; i2++) {
          if (newValue[i2] != oldValue[i2]) {
            break;
          }
        }
        if (newValue[0] != oldValue[0]) {
          this.page.current = this.pageCurrent;
        }
        this.page.size = this.pageSize;
        this.onPropsChange();
      });
      this._treeData = [];
    },
    methods: {
      onPropsChange() {
        this._treeData = [];
      },
      // 填充 pickview 数据
      async loadData() {
        if (this.isLocalData) {
          this.loadLocalData();
        } else if (this.isCloudDataList) {
          this.loadCloudDataList();
        } else if (this.isCloudDataTree) {
          this.loadCloudDataTree();
        }
      },
      // 加载本地数据
      async loadLocalData() {
        this._treeData = [];
        this._extractTree(this.localdata, this._treeData);
        let inputValue = this.dataValue;
        if (inputValue === void 0) {
          return;
        }
        if (Array.isArray(inputValue)) {
          inputValue = inputValue[inputValue.length - 1];
          if (typeof inputValue === "object" && inputValue[this.map.value]) {
            inputValue = inputValue[this.map.value];
          }
        }
        this.selected = this._findNodePath(inputValue, this.localdata);
      },
      // 加载 Cloud 数据 (单列)
      async loadCloudDataList() {
        if (this.loading) {
          return;
        }
        this.loading = true;
        try {
          let response = await this.getCommand();
          let responseData = response.result.data;
          this._treeData = responseData;
          this._updateBindData();
          this._updateSelected();
          this.onDataChange();
        } catch (e2) {
          this.errorMessage = e2;
        } finally {
          this.loading = false;
        }
      },
      // 加载 Cloud 数据 (树形)
      async loadCloudDataTree() {
        if (this.loading) {
          return;
        }
        this.loading = true;
        try {
          let commandOptions = {
            field: this._cloudDataPostField(),
            where: this._cloudDataTreeWhere()
          };
          if (this.gettree) {
            commandOptions.startwith = `${this.selfField}=='${this.dataValue}'`;
          }
          let response = await this.getCommand(commandOptions);
          let responseData = response.result.data;
          this._treeData = responseData;
          this._updateBindData();
          this._updateSelected();
          this.onDataChange();
        } catch (e2) {
          this.errorMessage = e2;
        } finally {
          this.loading = false;
        }
      },
      // 加载 Cloud 数据 (节点)
      async loadCloudDataNode(callback) {
        if (this.loading) {
          return;
        }
        this.loading = true;
        try {
          let commandOptions = {
            field: this._cloudDataPostField(),
            where: this._cloudDataNodeWhere()
          };
          let response = await this.getCommand(commandOptions);
          let responseData = response.result.data;
          callback(responseData);
        } catch (e2) {
          this.errorMessage = e2;
        } finally {
          this.loading = false;
        }
      },
      // 回显 Cloud 数据
      getCloudDataValue() {
        if (this.isCloudDataList) {
          return this.getCloudDataListValue();
        }
        if (this.isCloudDataTree) {
          return this.getCloudDataTreeValue();
        }
      },
      // 回显 Cloud 数据 (单列)
      getCloudDataListValue() {
        let where = [];
        let whereField = this._getForeignKeyByField();
        if (whereField) {
          where.push(`${whereField} == '${this.dataValue}'`);
        }
        where = where.join(" || ");
        if (this.where) {
          where = `(${this.where}) && (${where})`;
        }
        return this.getCommand({
          field: this._cloudDataPostField(),
          where
        }).then((res) => {
          this.selected = res.result.data;
          return res.result.data;
        });
      },
      // 回显 Cloud 数据 (树形)
      getCloudDataTreeValue() {
        return this.getCommand({
          field: this._cloudDataPostField(),
          getTreePath: {
            startWith: `${this.selfField}=='${this.dataValue}'`
          }
        }).then((res) => {
          let treePath = [];
          this._extractTreePath(res.result.data, treePath);
          this.selected = treePath;
          return treePath;
        });
      },
      getCommand(options = {}) {
        let db = nr.database(this.spaceInfo);
        const action = options.action || this.action;
        if (action) {
          db = db.action(action);
        }
        const collection = options.collection || this.collection;
        db = db.collection(collection);
        const where = options.where || this.where;
        if (!(!where || !Object.keys(where).length)) {
          db = db.where(where);
        }
        const field = options.field || this.field;
        if (field) {
          db = db.field(field);
        }
        const orderby = options.orderby || this.orderby;
        if (orderby) {
          db = db.orderBy(orderby);
        }
        const current = options.pageCurrent !== void 0 ? options.pageCurrent : this.page.current;
        const size = options.pageSize !== void 0 ? options.pageSize : this.page.size;
        const getCount = options.getcount !== void 0 ? options.getcount : this.getcount;
        const getTree = options.gettree !== void 0 ? options.gettree : this.gettree;
        const getOptions = {
          getCount,
          getTree
        };
        if (options.getTreePath) {
          getOptions.getTreePath = options.getTreePath;
        }
        db = db.skip(size * (current - 1)).limit(size).get(getOptions);
        return db;
      },
      _cloudDataPostField() {
        let fields = [this.field];
        if (this.parentField) {
          fields.push(`${this.parentField} as parent_value`);
        }
        return fields.join(",");
      },
      _cloudDataTreeWhere() {
        let result = [];
        let selected = this.selected;
        let parentField = this.parentField;
        if (parentField) {
          result.push(`${parentField} == null || ${parentField} == ""`);
        }
        if (selected.length) {
          for (var i2 = 0; i2 < selected.length - 1; i2++) {
            result.push(`${parentField} == '${selected[i2].value}'`);
          }
        }
        let where = [];
        if (this.where) {
          where.push(`(${this.where})`);
        }
        if (result.length) {
          where.push(`(${result.join(" || ")})`);
        }
        return where.join(" && ");
      },
      _cloudDataNodeWhere() {
        let where = [];
        let selected = this.selected;
        if (selected.length) {
          where.push(`${this.parentField} == '${selected[selected.length - 1].value}'`);
        }
        where = where.join(" || ");
        if (this.where) {
          return `(${this.where}) && (${where})`;
        }
        return where;
      },
      _getWhereByForeignKey() {
        let result = [];
        let whereField = this._getForeignKeyByField();
        if (whereField) {
          result.push(`${whereField} == '${this.dataValue}'`);
        }
        if (this.where) {
          return `(${this.where}) && (${result.join(" || ")})`;
        }
        return result.join(" || ");
      },
      _getForeignKeyByField() {
        let fields = this.field.split(",");
        let whereField = null;
        for (let i2 = 0; i2 < fields.length; i2++) {
          const items = fields[i2].split("as");
          if (items.length < 2) {
            continue;
          }
          if (items[1].trim() === "value") {
            whereField = items[0].trim();
            break;
          }
        }
        return whereField;
      },
      _updateBindData(node2) {
        const {
          dataList,
          hasNodes
        } = this._filterData(this._treeData, this.selected);
        let isleaf = this._stepSearh === false && !hasNodes;
        if (node2) {
          node2.isleaf = isleaf;
        }
        this.dataList = dataList;
        this.selectedIndex = dataList.length - 1;
        if (!isleaf && this.selected.length < dataList.length) {
          this.selected.push({
            value: null,
            text: "请选择"
          });
        }
        return {
          isleaf,
          hasNodes
        };
      },
      _updateSelected() {
        let dl = this.dataList;
        let sl = this.selected;
        let textField = this.map.text;
        let valueField = this.map.value;
        for (let i2 = 0; i2 < sl.length; i2++) {
          let value = sl[i2].value;
          let dl2 = dl[i2];
          for (let j2 = 0; j2 < dl2.length; j2++) {
            let item2 = dl2[j2];
            if (item2[valueField] === value) {
              sl[i2].text = item2[textField];
              break;
            }
          }
        }
      },
      _filterData(data, paths) {
        let dataList = [];
        let hasNodes = true;
        dataList.push(data.filter((item) => {
          return item.parent_value === null || item.parent_value === void 0 || item.parent_value === "";
        }));
        for (let i2 = 0; i2 < paths.length; i2++) {
          let value = paths[i2].value;
          let nodes = data.filter((item) => {
            return item.parent_value === value;
          });
          if (nodes.length) {
            dataList.push(nodes);
          } else {
            hasNodes = false;
          }
        }
        return {
          dataList,
          hasNodes
        };
      },
      _extractTree(nodes, result, parent_value) {
        let valueField = this.map.value;
        for (let i2 = 0; i2 < nodes.length; i2++) {
          let node2 = nodes[i2];
          let child = {};
          for (let key in node2) {
            if (key !== "children") {
              child[key] = node2[key];
            }
          }
          if (parent_value !== null && parent_value !== void 0 && parent_value !== "") {
            child.parent_value = parent_value;
          }
          result.push(child);
          let children = node2.children;
          if (children) {
            this._extractTree(children, result, node2[valueField]);
          }
        }
      },
      _extractTreePath(nodes, result) {
        for (let i2 = 0; i2 < nodes.length; i2++) {
          let node2 = nodes[i2];
          let child = {};
          for (let key in node2) {
            if (key !== "children") {
              child[key] = node2[key];
            }
          }
          result.push(child);
          let children = node2.children;
          if (children) {
            this._extractTreePath(children, result);
          }
        }
      },
      _findNodePath(key, nodes, path = []) {
        let textField = this.map.text;
        let valueField = this.map.value;
        for (let i2 = 0; i2 < nodes.length; i2++) {
          let node2 = nodes[i2];
          let children = node2.children;
          let text = node2[textField];
          let value = node2[valueField];
          path.push({
            value,
            text
          });
          if (value === key) {
            return path;
          }
          if (children) {
            const p2 = this._findNodePath(key, children, path);
            if (p2.length) {
              return p2;
            }
          }
          path.pop();
        }
        return [];
      }
    }
  };
  const _sfc_main$w = {
    name: "UniDataPickerView",
    emits: ["nodeclick", "change", "datachange", "update:modelValue"],
    mixins: [dataPicker],
    props: {
      managedMode: {
        type: Boolean,
        default: false
      },
      ellipsis: {
        type: Boolean,
        default: true
      }
    },
    created() {
      if (!this.managedMode) {
        this.$nextTick(() => {
          this.loadData();
        });
      }
    },
    methods: {
      onPropsChange() {
        this._treeData = [];
        this.selectedIndex = 0;
        this.$nextTick(() => {
          this.loadData();
        });
      },
      handleSelect(index) {
        this.selectedIndex = index;
      },
      handleNodeClick(item, i2, j2) {
        if (item.disable) {
          return;
        }
        const node2 = this.dataList[i2][j2];
        const text = node2[this.map.text];
        const value = node2[this.map.value];
        if (i2 < this.selected.length - 1) {
          this.selected.splice(i2, this.selected.length - i2);
          this.selected.push({
            text,
            value
          });
        } else if (i2 === this.selected.length - 1) {
          this.selected.splice(i2, 1, {
            text,
            value
          });
        }
        if (node2.isleaf) {
          this.onSelectedChange(node2, node2.isleaf);
          return;
        }
        const {
          isleaf,
          hasNodes
        } = this._updateBindData();
        if (this.isLocalData) {
          this.onSelectedChange(node2, !hasNodes || isleaf);
        } else if (this.isCloudDataList) {
          this.onSelectedChange(node2, true);
        } else if (this.isCloudDataTree) {
          if (isleaf) {
            this.onSelectedChange(node2, node2.isleaf);
          } else if (!hasNodes) {
            this.loadCloudDataNode((data) => {
              if (!data.length) {
                node2.isleaf = true;
              } else {
                this._treeData.push(...data);
                this._updateBindData(node2);
              }
              this.onSelectedChange(node2, node2.isleaf);
            });
          }
        }
      },
      updateData(data) {
        this._treeData = data.treeData;
        this.selected = data.selected;
        if (!this._treeData.length) {
          this.loadData();
        } else {
          this._updateBindData();
        }
      },
      onDataChange() {
        this.$emit("datachange");
      },
      onSelectedChange(node2, isleaf) {
        if (isleaf) {
          this._dispatchEvent();
        }
        if (node2) {
          this.$emit("nodeclick", node2);
        }
      },
      _dispatchEvent() {
        this.$emit("change", this.selected.slice(0));
      }
    }
  };
  function _sfc_render$v(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_load_more = resolveEasycom(vue.resolveDynamicComponent("uni-load-more"), __easycom_0$4);
    return vue.openBlock(), vue.createElementBlock("view", { class: "uni-data-pickerview" }, [
      !_ctx.isCloudDataList ? (vue.openBlock(), vue.createElementBlock("scroll-view", {
        key: 0,
        class: "selected-area",
        "scroll-x": "true"
      }, [
        vue.createElementVNode("view", { class: "selected-list" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList(_ctx.selected, (item, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: vue.normalizeClass(["selected-item", {
                  "selected-item-active": index == _ctx.selectedIndex
                }]),
                key: index,
                onClick: ($event) => $options.handleSelect(index)
              }, [
                vue.createElementVNode(
                  "text",
                  null,
                  vue.toDisplayString(item.text || ""),
                  1
                  /* TEXT */
                )
              ], 10, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createElementVNode("view", { class: "tab-c" }, [
        vue.createElementVNode("scroll-view", {
          class: "list",
          "scroll-y": true
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList(_ctx.dataList[_ctx.selectedIndex], (item, j2) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: vue.normalizeClass(["item", { "is-disabled": !!item.disable }]),
                key: j2,
                onClick: ($event) => $options.handleNodeClick(item, _ctx.selectedIndex, j2)
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "item-text" },
                  vue.toDisplayString(item[_ctx.map.text]),
                  1
                  /* TEXT */
                ),
                _ctx.selected.length > _ctx.selectedIndex && item[_ctx.map.value] == _ctx.selected[_ctx.selectedIndex].value ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "check"
                })) : vue.createCommentVNode("v-if", true)
              ], 10, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        _ctx.loading ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "loading-cover"
        }, [
          vue.createVNode(_component_uni_load_more, {
            class: "load-more",
            contentText: _ctx.loadMore,
            status: "loading"
          }, null, 8, ["contentText"])
        ])) : vue.createCommentVNode("v-if", true),
        _ctx.errorMessage ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "error-message"
        }, [
          vue.createElementVNode(
            "text",
            { class: "error-text" },
            vue.toDisplayString(_ctx.errorMessage),
            1
            /* TEXT */
          )
        ])) : vue.createCommentVNode("v-if", true)
      ])
    ]);
  }
  const DataPickerView = /* @__PURE__ */ _export_sfc(_sfc_main$w, [["render", _sfc_render$v], ["__scopeId", "data-v-91ec6a82"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/uni_modules/uni-data-picker/components/uni-data-pickerview/uni-data-pickerview.vue"]]);
  const _sfc_main$v = {
    name: "UniDataPicker",
    emits: ["popupopened", "popupclosed", "nodeclick", "input", "change", "update:modelValue", "inputclick"],
    mixins: [dataPicker],
    components: {
      DataPickerView
    },
    props: {
      options: {
        type: [Object, Array],
        default() {
          return {};
        }
      },
      popupTitle: {
        type: String,
        default: "请选择"
      },
      placeholder: {
        type: String,
        default: "请选择"
      },
      heightMobile: {
        type: String,
        default: ""
      },
      readonly: {
        type: Boolean,
        default: false
      },
      clearIcon: {
        type: Boolean,
        default: true
      },
      border: {
        type: Boolean,
        default: true
      },
      split: {
        type: String,
        default: "/"
      },
      ellipsis: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        isOpened: false,
        inputSelected: []
      };
    },
    created() {
      this.$nextTick(() => {
        this.load();
      });
    },
    watch: {
      localdata: {
        handler() {
          this.load();
        },
        deep: true
      }
    },
    methods: {
      clear() {
        this._dispatchEvent([]);
      },
      onPropsChange() {
        this._treeData = [];
        this.selectedIndex = 0;
        this.load();
      },
      load() {
        if (this.readonly) {
          this._processReadonly(this.localdata, this.dataValue);
          return;
        }
        if (this.isLocalData) {
          this.loadData();
          this.inputSelected = this.selected.slice(0);
        } else if (this.isCloudDataList || this.isCloudDataTree) {
          this.loading = true;
          this.getCloudDataValue().then((res) => {
            this.loading = false;
            this.inputSelected = res;
          }).catch((err) => {
            this.loading = false;
            this.errorMessage = err;
          });
        }
      },
      show() {
        this.isOpened = true;
        setTimeout(() => {
          this.$refs.pickerView.updateData({
            treeData: this._treeData,
            selected: this.selected,
            selectedIndex: this.selectedIndex
          });
        }, 200);
        this.$emit("popupopened");
      },
      hide() {
        this.isOpened = false;
        this.$emit("popupclosed");
      },
      handleInput() {
        if (this.readonly) {
          this.$emit("inputclick");
          return;
        }
        this.show();
      },
      handleClose(e2) {
        this.hide();
      },
      onnodeclick(e2) {
        this.$emit("nodeclick", e2);
      },
      ondatachange(e2) {
        this._treeData = this.$refs.pickerView._treeData;
      },
      onchange(e2) {
        this.hide();
        this.$nextTick(() => {
          this.inputSelected = e2;
        });
        this._dispatchEvent(e2);
      },
      _processReadonly(dataList, value) {
        var isTree = dataList.findIndex((item2) => {
          return item2.children;
        });
        if (isTree > -1) {
          let inputValue;
          if (Array.isArray(value)) {
            inputValue = value[value.length - 1];
            if (typeof inputValue === "object" && inputValue.value) {
              inputValue = inputValue.value;
            }
          } else {
            inputValue = value;
          }
          this.inputSelected = this._findNodePath(inputValue, this.localdata);
          return;
        }
        if (!this.hasValue) {
          this.inputSelected = [];
          return;
        }
        let result = [];
        if (Array.isArray(value)) {
          for (let i2 = 0; i2 < value.length; i2++) {
            var val = value[i2];
            var item = dataList.find((v2) => {
              return v2.value == val;
            });
            if (item) {
              result.push(item);
            }
          }
        } else {
          let item2 = dataList.find((v2) => {
            return v2.value == value;
          });
          if (item2) {
            result.push(item2);
          }
        }
        if (result.length) {
          this.inputSelected = result;
        }
      },
      _filterForArray(data, valueArray) {
        var result = [];
        for (let i2 = 0; i2 < valueArray.length; i2++) {
          var value = valueArray[i2];
          var found = data.find((item) => {
            return item.value == value;
          });
          if (found) {
            result.push(found);
          }
        }
        return result;
      },
      _dispatchEvent(selected) {
        let item = {};
        if (selected.length) {
          var value = new Array(selected.length);
          for (var i2 = 0; i2 < selected.length; i2++) {
            value[i2] = selected[i2].value;
          }
          item = selected[selected.length - 1];
        } else {
          item.value = "";
        }
        if (this.formItem) {
          this.formItem.setValue(item.value);
        }
        this.$emit("input", item.value);
        this.$emit("update:modelValue", item.value);
        this.$emit("change", {
          detail: {
            value: selected
          }
        });
      }
    }
  };
  function _sfc_render$u(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_load_more = resolveEasycom(vue.resolveDynamicComponent("uni-load-more"), __easycom_0$4);
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$b);
    const _component_data_picker_view = vue.resolveComponent("data-picker-view");
    return vue.openBlock(), vue.createElementBlock("view", { class: "uni-data-tree" }, [
      vue.createElementVNode("view", {
        class: "uni-data-tree-input",
        onClick: _cache[1] || (_cache[1] = (...args) => $options.handleInput && $options.handleInput(...args))
      }, [
        vue.renderSlot(_ctx.$slots, "default", {
          options: $props.options,
          data: $data.inputSelected,
          error: _ctx.errorMessage
        }, () => [
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["input-value", { "input-value-border": $props.border }])
            },
            [
              _ctx.errorMessage ? (vue.openBlock(), vue.createElementBlock(
                "text",
                {
                  key: 0,
                  class: "selected-area error-text"
                },
                vue.toDisplayString(_ctx.errorMessage),
                1
                /* TEXT */
              )) : _ctx.loading && !$data.isOpened ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 1,
                class: "selected-area"
              }, [
                vue.createVNode(_component_uni_load_more, {
                  class: "load-more",
                  contentText: _ctx.loadMore,
                  status: "loading"
                }, null, 8, ["contentText"])
              ])) : $data.inputSelected.length ? (vue.openBlock(), vue.createElementBlock("scroll-view", {
                key: 2,
                class: "selected-area",
                "scroll-x": "true"
              }, [
                vue.createElementVNode("view", { class: "selected-list" }, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList($data.inputSelected, (item, index) => {
                      return vue.openBlock(), vue.createElementBlock("view", {
                        class: "selected-item",
                        key: index
                      }, [
                        vue.createElementVNode(
                          "text",
                          { class: "text-color" },
                          vue.toDisplayString(item.text),
                          1
                          /* TEXT */
                        ),
                        index < $data.inputSelected.length - 1 ? (vue.openBlock(), vue.createElementBlock(
                          "text",
                          {
                            key: 0,
                            class: "input-split-line"
                          },
                          vue.toDisplayString($props.split),
                          1
                          /* TEXT */
                        )) : vue.createCommentVNode("v-if", true)
                      ]);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])) : (vue.openBlock(), vue.createElementBlock(
                "text",
                {
                  key: 3,
                  class: "selected-area placeholder"
                },
                vue.toDisplayString($props.placeholder),
                1
                /* TEXT */
              )),
              $props.clearIcon && !$props.readonly && $data.inputSelected.length ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 4,
                class: "icon-clear",
                onClick: _cache[0] || (_cache[0] = vue.withModifiers((...args) => $options.clear && $options.clear(...args), ["stop"]))
              }, [
                vue.createVNode(_component_uni_icons, {
                  type: "clear",
                  color: "#c0c4cc",
                  size: "24"
                })
              ])) : vue.createCommentVNode("v-if", true),
              (!$props.clearIcon || !$data.inputSelected.length) && !$props.readonly ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 5,
                class: "arrow-area"
              }, [
                vue.createElementVNode("view", { class: "input-arrow" })
              ])) : vue.createCommentVNode("v-if", true)
            ],
            2
            /* CLASS */
          )
        ], true)
      ]),
      $data.isOpened ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "uni-data-tree-cover",
        onClick: _cache[2] || (_cache[2] = (...args) => $options.handleClose && $options.handleClose(...args))
      })) : vue.createCommentVNode("v-if", true),
      $data.isOpened ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "uni-data-tree-dialog"
      }, [
        vue.createElementVNode("view", { class: "uni-popper__arrow" }),
        vue.createElementVNode("view", { class: "dialog-caption" }, [
          vue.createElementVNode("view", { class: "title-area" }, [
            vue.createElementVNode(
              "text",
              { class: "dialog-title" },
              vue.toDisplayString($props.popupTitle),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", {
            class: "dialog-close",
            onClick: _cache[3] || (_cache[3] = (...args) => $options.handleClose && $options.handleClose(...args))
          }, [
            vue.createElementVNode("view", {
              class: "dialog-close-plus",
              "data-id": "close"
            }),
            vue.createElementVNode("view", {
              class: "dialog-close-plus dialog-close-rotate",
              "data-id": "close"
            })
          ])
        ]),
        vue.createVNode(_component_data_picker_view, {
          class: "picker-view",
          ref: "pickerView",
          modelValue: _ctx.dataValue,
          "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => _ctx.dataValue = $event),
          localdata: _ctx.localdata,
          preload: _ctx.preload,
          collection: _ctx.collection,
          field: _ctx.field,
          orderby: _ctx.orderby,
          where: _ctx.where,
          "step-searh": _ctx.stepSearh,
          "self-field": _ctx.selfField,
          "parent-field": _ctx.parentField,
          "managed-mode": true,
          map: _ctx.map,
          ellipsis: $props.ellipsis,
          onChange: $options.onchange,
          onDatachange: $options.ondatachange,
          onNodeclick: $options.onnodeclick
        }, null, 8, ["modelValue", "localdata", "preload", "collection", "field", "orderby", "where", "step-searh", "self-field", "parent-field", "map", "ellipsis", "onChange", "onDatachange", "onNodeclick"])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const __easycom_3$1 = /* @__PURE__ */ _export_sfc(_sfc_main$v, [["render", _sfc_render$u], ["__scopeId", "data-v-2653531e"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/uni_modules/uni-data-picker/components/uni-data-picker/uni-data-picker.vue"]]);
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
  const _imports_0$2 = "/static/info-circle.png";
  const _sfc_main$u = {
    __name: "account_book_form",
    props: ["account_book_id"],
    setup(__props, { expose: __expose }) {
      __expose();
      const props = __props;
      const isEdit = props.account_book_id ? true : false;
      const count = vue.ref(1);
      const imageList = vue.ref([]);
      const systemInfo2 = uni.getSystemInfoSync();
      const statusBarHeight = vue.ref(systemInfo2.statusBarHeight);
      let name = vue.ref("");
      let price = vue.ref("");
      const activeTab = vue.ref(1);
      function switch_tab(index) {
        activeTab.value = index;
        formatAppLog("log", "at pages/stock/account_book_form/account_book_form.vue:236", `切换到 tab ${index}`);
      }
      const typeModalVisible = vue.ref(false);
      const newTypeName = vue.ref("");
      const customTypes = vue.ref([]);
      const defaultTypes = ["请选择", "娃衣", "娃头", "眼珠", "假发", "娃鞋", "其它"];
      const typeOptions = vue.computed(() => [
        ...defaultTypes,
        ...customTypes.value.map((t2) => t2.name)
      ]);
      const form = vue.ref({
        isRemind: false,
        finalPrice: 0,
        finalTime: ""
      });
      const showMoreInfo = vue.ref(false);
      const sizeOptions = vue.ref([]);
      const selectedSize = vue.ref([]);
      const selectedSizePath = vue.ref([]);
      const moreInfo = vue.ref({
        sizeDetail: "",
        color: "",
        remark: "",
        buyDate: "",
        position: ""
      });
      const fetchSizes = async () => {
        try {
          const res = await uni.request({
            url: websiteUrl + "/sizes",
            method: "GET"
          });
          if (res.data.status === "success") {
            const sizesData = res.data.data;
            const formattedSizes = [];
            for (const [category, items] of Object.entries(sizesData)) {
              formattedSizes.push({
                text: category,
                // 大分类名称 (如"二分")
                value: category,
                // 大分类值
                children: items.map((item) => ({
                  text: item,
                  // 小分类名称 (如"普通二分")
                  value: item
                  // 小分类值
                }))
              });
            }
            sizeOptions.value = formattedSizes;
          }
        } catch (err) {
          formatAppLog("error", "at pages/stock/account_book_form/account_book_form.vue:302", "获取尺寸数据失败:", err);
          uni.showToast({
            title: "获取尺寸数据失败",
            icon: "none"
          });
        }
      };
      const onSizeChange = (e2) => {
        const nodes = e2.detail.value;
        if (nodes.length === 2) {
          selectedSizePath.value = [
            nodes[0].value,
            // 大分类值
            nodes[1].value
            // 小分类值
          ];
          moreInfo.value.sizeDetail = nodes[1].value;
        } else {
          selectedSizePath.value = [];
          moreInfo.value.sizeDetail = "";
        }
      };
      const toggleMoreInfo = () => {
        showMoreInfo.value = !showMoreInfo.value;
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
          formatAppLog("error", "at pages/stock/account_book_form/account_book_form.vue:347", "获取分类失败:", err);
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
                  data: {
                    id
                  }
                  // 使用JSON格式传参
                });
                const resData = response.data;
                if (resData.status === "success") {
                  await getAccountTypes();
                  uni.showToast({
                    title: "删除成功"
                  });
                } else {
                  uni.showToast({
                    title: resData.msg || "删除失败",
                    icon: "none"
                  });
                }
              } catch (err) {
                formatAppLog("error", "at pages/stock/account_book_form/account_book_form.vue:421", "删除失败:", err);
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
      function updateSelectedType(e2) {
        selectedType.value = e2.detail.value;
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
            formatAppLog("log", "at pages/stock/account_book_form/account_book_form.vue:469", res.data.data);
            name.value = res.data.data.name;
            price.value = parseInt(res.data.data.price);
            count.value = res.data.data.count || 1;
            selectedType.value = typeOptions.value.indexOf(res.data.data.type);
            if (res.data.data.image_url) {
              imageList.value = res.data.data.image_url.split(",");
            }
            form.value = {
              isRemind: res.data.data.is_remind,
              finalPrice: res.data.data.final_price,
              finalTime: res.data.data.final_time
            };
            moreInfo.value = {
              sizeDetail: res.data.data.size_detail || "",
              color: res.data.data.color || "",
              remark: res.data.data.remark || "",
              buyDate: res.data.data.buy_date ? new Date(res.data.data.buy_date).toISOString().split(
                "T"
              )[0] : "",
              position: res.data.data.position || ""
            };
            if (res.data.data.size) {
              selectedSizePath.value = [
                res.data.data.size,
                res.data.data.size_detail || ""
              ];
            }
            formatAppLog("log", "at pages/stock/account_book_form/account_book_form.vue:502", "f:", form);
          },
          fail: (err) => {
            formatAppLog("log", "at pages/stock/account_book_form/account_book_form.vue:505", err);
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
            count.value = 1;
            if ((_a = detail.goods_images) == null ? void 0 : _a[0]) {
              imageList.value = [detail.goods_images[0]];
            }
          }
        } catch (error) {
          formatAppLog("error", "at pages/stock/account_book_form/account_book_form.vue:533", "获取商品详情失败:", error);
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
                uni.showToast({
                  title: "参数错误",
                  icon: "none"
                });
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
                data: {
                  id
                },
                // 改为JSON格式传参
                success: (res2) => {
                  formatAppLog("log", "at pages/stock/account_book_form/account_book_form.vue:571", res2.data.status);
                  if (res2.data.status === "success") {
                    uni.showToast({
                      title: "删除成功",
                      icon: "success"
                    });
                    setTimeout(() => uni.navigateBack(), 500);
                  } else {
                    uni.showToast({
                      title: res2.data.msg || "删除失败",
                      icon: "none"
                    });
                  }
                },
                fail: (err) => {
                  formatAppLog("error", "at pages/stock/account_book_form/account_book_form.vue:586", "请求失败:", err);
                  uni.showToast({
                    title: "网络错误",
                    icon: "none"
                  });
                }
              });
            }
          }
        });
      }
      async function selectImage() {
        uni.chooseImage({
          count: 9,
          success: async (res) => {
            const tempFilePaths = res.tempFilePaths;
            for (const filePath of tempFilePaths) {
              try {
                const tokenData = await getQiniuToken();
                const uploadRes = await uploadImageToQiniu(filePath, tokenData.token, tokenData.path);
                formatAppLog("log", "at pages/stock/account_book_form/account_book_form.vue:612", "res:", uploadRes);
                if (uploadRes.qiniuRes.statusCode === 200) {
                  const imageUrl = image1Url + tokenData.path;
                  imageList.value.push(imageUrl);
                } else {
                  formatAppLog("error", "at pages/stock/account_book_form/account_book_form.vue:617", "上传失败:", filePath);
                }
              } catch (error) {
                formatAppLog("error", "at pages/stock/account_book_form/account_book_form.vue:620", "上传错误:", error);
              }
            }
            uni.showToast({
              title: `上传了${tempFilePaths.length}张图片`,
              icon: "success"
            });
          }
        });
      }
      function removeImage(index, event) {
        if (event && event.stopPropagation) {
          event.stopPropagation();
        }
        uni.showModal({
          title: "删除图片",
          content: "确定删除这张图片吗？",
          success: (res) => {
            if (res.confirm) {
              imageList.value.splice(index, 1);
            }
          }
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
        if (count.value <= 0) {
          uni.showToast({
            title: "个数必须大于0",
            icon: "none"
          });
          return false;
        }
        if (form.value.isRemind) {
          if (!form.value.finalPrice || form.value.finalPrice <= 0) {
            uni.showToast({
              title: "请输入正确的尾款金额",
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
          count: parseInt(count.value, 10),
          // 新增：个数
          type: typeOptions.value[selectedType.value],
          // 使用合并后的分类列表
          image_url: imageList.value.join(","),
          // 修改：图片数组转逗号分隔字符串
          is_remind: form.value.isRemind,
          final_price: parseInt(form.value.finalPrice, 10),
          final_time: form.value.finalTime,
          // 新增更多信息字段
          size: selectedSizePath.value[0] || "",
          // 大分类
          size_detail: moreInfo.value.sizeDetail || "",
          // 小分类/尺寸详情
          color: moreInfo.value.color,
          remark: moreInfo.value.remark,
          buy_date: moreInfo.value.buyDate,
          position: moreInfo.value.position
        };
        formatAppLog("log", "at pages/stock/account_book_form/account_book_form.vue:724", "提交数据:", postData);
        uni.request({
          url: websiteUrl + "/with-state/add-account-book",
          method: "POST",
          header: {
            "Authorization": uni.getStorageSync("token")
          },
          data: postData,
          success: (res) => {
            formatAppLog("log", "at pages/stock/account_book_form/account_book_form.vue:734", res.data);
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
          count: parseInt(count.value, 10),
          // 新增：个数
          type: typeOptions.value[selectedType.value],
          // 使用合并后的分类列表
          image_url: imageList.value.join(","),
          // 修改：图片数组转逗号分隔字符串
          id: parseInt(props.account_book_id, 10),
          is_remind: form.value.isRemind,
          // 转换为数据库需要的格式
          final_price: parseInt(form.value.finalPrice, 10),
          final_time: form.value.finalTime,
          // 新增更多信息字段
          size: selectedSizePath.value[0] || "",
          // 大分类
          size_detail: moreInfo.value.sizeDetail || "",
          // 小分类/尺寸详情
          color: moreInfo.value.color,
          remark: moreInfo.value.remark,
          buy_date: moreInfo.value.buyDate,
          position: moreInfo.value.position
        };
        uni.request({
          url: websiteUrl + "/with-state/update-account-book",
          method: "POST",
          header: {
            "Authorization": uni.getStorageSync("token")
          },
          data: postData,
          success: (res) => {
            formatAppLog("log", "at pages/stock/account_book_form/account_book_form.vue:783", res.data);
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
      function viewFullImage(index) {
        uni.previewImage({
          current: imageList.value["index"],
          urls: imageList.value
        });
      }
      onShow(() => {
        asyncGetUserInfo().then(() => {
          getAccountTypes();
          fetchSizes();
        });
      });
      const __returned__ = { props, isEdit, count, imageList, systemInfo: systemInfo2, statusBarHeight, get name() {
        return name;
      }, set name(v2) {
        name = v2;
      }, get price() {
        return price;
      }, set price(v2) {
        price = v2;
      }, activeTab, switch_tab, typeModalVisible, newTypeName, customTypes, defaultTypes, typeOptions, form, showMoreInfo, sizeOptions, selectedSize, selectedSizePath, moreInfo, fetchSizes, onSizeChange, toggleMoreInfo, getAccountTypes, addNewType, deleteType, toggleRemind, selectedType, accountBookTypeList, accountBookData, updateSelectedType, getAccountBookById, handleGoodsSelect, handleDelete, selectImage, removeImage, postSubmit, validateForm, addAccountBook, updateAccountBook, viewFullImage, ref: vue.ref, computed: vue.computed, onMounted: vue.onMounted, get onShow() {
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
        return global$1;
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
  function _sfc_render$t(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$b);
    const _component_common_modal = resolveEasycom(vue.resolveDynamicComponent("common-modal"), __easycom_3$2);
    const _component_goods_search = resolveEasycom(vue.resolveDynamicComponent("goods-search"), __easycom_0$9);
    const _component_uni_data_picker = resolveEasycom(vue.resolveDynamicComponent("uni-data-picker"), __easycom_3$1);
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("meta", {
        name: "theme-color",
        content: "#F8F8F8"
      }),
      vue.createCommentVNode(" 分类管理弹窗 "),
      vue.createVNode(_component_common_modal, {
        visible: $setup.typeModalVisible,
        "onUpdate:visible": _cache[1] || (_cache[1] = (val) => $setup.typeModalVisible = val),
        top: "100rpx",
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
        vue.createCommentVNode(" 个数 "),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "form-label" }, "个数"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              class: "form-input",
              type: "number",
              placeholder: "请输入个数",
              "placeholder-class": "placeholder-style",
              "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => $setup.count = $event)
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $setup.count]
          ])
        ]),
        vue.createCommentVNode(" 图片上传 "),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "form-label" }, "物品图片"),
          vue.createElementVNode("view", { class: "upload-wrapper" }, [
            vue.createElementVNode("view", { class: "image-grid" }, [
              vue.createCommentVNode(" 已上传图片预览 "),
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.imageList, (img, index) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    key: index,
                    class: "preview-image"
                  }, [
                    vue.createElementVNode("image", {
                      mode: "aspectFill",
                      src: img,
                      class: "image-preview",
                      onClick: ($event) => $setup.viewFullImage(index)
                    }, null, 8, ["src", "onClick"]),
                    vue.createElementVNode("view", { class: "image-actions" }, [
                      vue.createVNode(_component_uni_icons, {
                        type: "close",
                        size: "22",
                        color: "#fff",
                        onClick: (e2) => $setup.removeImage(index, e2),
                        class: "delete-icon"
                      }, null, 8, ["onClick"])
                    ])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              )),
              vue.createCommentVNode(" 添加图片按钮 "),
              vue.createElementVNode("view", {
                class: "add-image-box",
                onClick: $setup.selectImage
              }, [
                vue.createVNode(_component_uni_icons, {
                  type: "plusempty",
                  size: "40",
                  color: "#ccc"
                }),
                vue.createElementVNode("text", { class: "add-text" }, "添加图片")
              ])
            ])
          ])
        ]),
        vue.createCommentVNode(" 尺寸选择器 "),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "form-label" }, "尺寸"),
          vue.createVNode(_component_uni_data_picker, {
            placeholder: "请选择尺寸",
            localdata: $setup.sizeOptions,
            value: $setup.selectedSizePath,
            onChange: $setup.onSizeChange,
            class: "size-picker"
          }, null, 8, ["localdata", "value"])
        ]),
        vue.createCommentVNode(" 更多信息折叠区域 "),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("label", {
            class: "remind-label",
            onClick: _cache[6] || (_cache[6] = ($event) => $setup.toggleMoreInfo())
          }, [
            !$setup.showMoreInfo ? (vue.openBlock(), vue.createBlock(_component_uni_icons, {
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
            vue.createElementVNode("text", null, "更多信息")
          ])
        ]),
        $setup.showMoreInfo ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "more-info-form"
        }, [
          vue.createCommentVNode(" 尺寸详情 "),
          vue.createElementVNode("view", { class: "form-item size_detail" }, [
            vue.createElementVNode("text", { class: "form-label" }, "尺寸详情"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => $setup.moreInfo.sizeDetail = $event),
                placeholder: "请输入尺寸详情",
                class: "form-input"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.moreInfo.sizeDetail]
            ])
          ]),
          vue.createCommentVNode(" 颜色 "),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, "颜色"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => $setup.moreInfo.color = $event),
                placeholder: "请输入颜色",
                class: "form-input"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.moreInfo.color]
            ])
          ]),
          vue.createCommentVNode(" 备注 "),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, "备注"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => $setup.moreInfo.remark = $event),
                placeholder: "请输入备注",
                class: "form-input"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.moreInfo.remark]
            ])
          ]),
          vue.createCommentVNode(" 购入时间 "),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, "购入时间"),
            vue.createElementVNode("view", { style: { "padding": "0px 10px", "border": "1px solid #e6e6e6", "border-radius": "10px" } }, [
              vue.createElementVNode("picker", {
                mode: "date",
                value: $setup.moreInfo.buyDate,
                onChange: _cache[10] || (_cache[10] = (e2) => $setup.moreInfo.buyDate = e2.detail.value)
              }, [
                vue.createElementVNode(
                  "view",
                  {
                    class: "picker-content",
                    style: { "color": "#2c2c2c", "font-size": "26rpx" }
                  },
                  vue.toDisplayString($setup.moreInfo.buyDate || "选择购入日期"),
                  1
                  /* TEXT */
                )
              ], 40, ["value"])
            ])
          ]),
          vue.createCommentVNode(" 存放位置 "),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, "存放位置"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => $setup.moreInfo.position = $event),
                placeholder: "请输入存放位置",
                class: "form-input"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.moreInfo.position]
            ])
          ])
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 补款提醒 "),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("label", {
            class: "remind-label",
            onClick: _cache[12] || (_cache[12] = ($event) => $setup.toggleRemind())
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
          key: 1,
          class: "remind-form",
          style: { "margin-bottom": "40rpx" }
        }, [
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, "尾款金额"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                type: "number",
                "onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => $setup.form.finalPrice = $event),
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
            vue.createElementVNode("view", { style: { "padding": "0px 10px", "border": "1px solid #e6e6e6", "border-radius": "10px" } }, [
              vue.createElementVNode("picker", {
                mode: "date",
                value: $setup.form.finalTime,
                onChange: _cache[14] || (_cache[14] = ($event) => $setup.form.finalTime = $event.detail.value)
              }, [
                vue.createElementVNode(
                  "view",
                  {
                    class: "picker-content",
                    style: { "color": "#2c2c2c", "font-size": "26rpx" }
                  },
                  vue.toDisplayString($setup.form.finalTime || "选择截止日期"),
                  1
                  /* TEXT */
                )
              ], 40, ["value"])
            ])
          ])
        ])) : vue.createCommentVNode("v-if", true),
        vue.createElementVNode("view", { style: { "overflow": "hidden" } }, [
          vue.createElementVNode("image", {
            src: _imports_0$2,
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
  const PagesStockAccountBookFormAccountBookForm = /* @__PURE__ */ _export_sfc(_sfc_main$u, [["render", _sfc_render$t], ["__scopeId", "data-v-0299c5b6"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/stock/account_book_form/account_book_form.vue"]]);
  const _sfc_main$t = {
    __name: "common-name-picker",
    props: {
      dataList: {
        type: Array,
        default: () => []
      },
      placeholder: {
        type: String,
        default: "请选择"
      },
      defaultValue: {
        type: String,
        default: ""
      }
    },
    emits: ["select"],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const props = __props;
      const emit = __emit;
      const isOpen = vue.ref(false);
      const selectedValue = vue.ref(props.defaultValue);
      const toggleOpen = () => {
        isOpen.value = !isOpen.value;
      };
      const selectItem = (item) => {
        selectedValue.value = item;
        isOpen.value = false;
        emit("select", item);
      };
      vue.onMounted(() => {
        formatAppLog("log", "at components/common-name-picker/common-name-picker.vue:69", "初始值", isOpen.value);
        isOpen.value = false;
      });
      const __returned__ = { props, emit, isOpen, selectedValue, toggleOpen, selectItem, ref: vue.ref, onMounted: vue.onMounted };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$s(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$b);
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: "select-container",
        ref: "containerRef"
      },
      [
        vue.createElementVNode("view", {
          class: "select-input",
          onClick: $setup.toggleOpen
        }, [
          vue.createElementVNode(
            "text",
            { class: "selected-value" },
            vue.toDisplayString($setup.selectedValue || $props.placeholder),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["arrow-icon", { "rotate": $setup.isOpen }])
            },
            [
              vue.createVNode(_component_uni_icons, {
                type: "arrowdown",
                size: "16",
                color: "#666"
              })
            ],
            2
            /* CLASS */
          )
        ]),
        vue.createCommentVNode(" <text>{{ isOpen}}</text> "),
        vue.createElementVNode("view", { class: "popup-container" }, [
          vue.createCommentVNode(" 遮罩层 "),
          $setup.isOpen ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "mask",
            onClick: _cache[0] || (_cache[0] = ($event) => $setup.toggleOpen())
          })) : vue.createCommentVNode("v-if", true),
          vue.createCommentVNode(" 选项列表 "),
          vue.createCommentVNode(' <uni-transition mode-class="fade" :show="isOpen"> '),
          $setup.isOpen ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "options-wrapper"
          }, [
            vue.createElementVNode("scroll-view", {
              "scroll-y": "true",
              class: "select-options"
            }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($props.dataList, (item, index) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    key: index,
                    class: vue.normalizeClass(["option-item", { "selected": $setup.selectedValue === item }]),
                    onClick: vue.withModifiers(($event) => $setup.selectItem(item), ["stop"])
                  }, [
                    vue.createTextVNode(
                      vue.toDisplayString(item) + " ",
                      1
                      /* TEXT */
                    ),
                    $setup.selectedValue === item ? (vue.openBlock(), vue.createBlock(_component_uni_icons, {
                      key: 0,
                      type: "checkmarkempty",
                      size: "18",
                      color: "#007AFF",
                      class: "check-icon"
                    })) : vue.createCommentVNode("v-if", true)
                  ], 10, ["onClick"]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])) : vue.createCommentVNode("v-if", true),
          vue.createCommentVNode(" </uni-transition> ")
        ])
      ],
      512
      /* NEED_PATCH */
    );
  }
  const __easycom_1$1 = /* @__PURE__ */ _export_sfc(_sfc_main$t, [["render", _sfc_render$s], ["__scopeId", "data-v-c7d66d43"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/components/common-name-picker/common-name-picker.vue"]]);
  const _sfc_main$s = {
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
  function _sfc_render$r(_ctx, _cache, $props, $setup, $data, $options) {
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
    ]);
  }
  const __easycom_3 = /* @__PURE__ */ _export_sfc(_sfc_main$s, [["render", _sfc_render$r], ["__scopeId", "data-v-edb43aad"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/components/custom-picker/custom-picker.vue"]]);
  const _sfc_main$r = {
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
        return global$1;
      }, get asyncGetUserInfo() {
        return asyncGetUserInfo;
      }, get getScene() {
        return getScene;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$q(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$b);
    const _component_common_name_picker = resolveEasycom(vue.resolveDynamicComponent("common-name-picker"), __easycom_1$1);
    const _component_common_search = resolveEasycom(vue.resolveDynamicComponent("common-search"), __easycom_2$1);
    const _component_custom_picker = resolveEasycom(vue.resolveDynamicComponent("custom-picker"), __easycom_3);
    const _component_goods_search = resolveEasycom(vue.resolveDynamicComponent("goods-search"), __easycom_0$9);
    const _component_common_modal = resolveEasycom(vue.resolveDynamicComponent("common-modal"), __easycom_3$2);
    return vue.openBlock(), vue.createBlock(_component_common_modal, {
      visible: $setup.internalVisible,
      "onUpdate:visible": $setup.handleModalVisibilityChange,
      top: "200rpx"
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
                    background: "#f8f8f8",
                    mode: "fill",
                    onSelect: $setup.handleBrandSelect,
                    onToggle: _cache[3] || (_cache[3] = ($event) => $setup.handleComponentToggle("brand")),
                    class: "brand-search",
                    style: { "padding": "0px!important" }
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ),
                vue.createVNode(_component_custom_picker, {
                  ref: "goodsPicker",
                  background: "#f8f8f8",
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
                  width: "550rpx",
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
  const __easycom_0$3 = /* @__PURE__ */ _export_sfc(_sfc_main$r, [["render", _sfc_render$q], ["__scopeId", "data-v-0488033a"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/components/relation-picker/relation-picker.vue"]]);
  const _imports_1$1 = "/static/add2.png";
  const _sfc_main$q = {
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
          formatAppLog("error", "at pages/stock/showcase_form/showcase_form.vue:154", "保存关联数据失败:", error);
          uni.showToast({
            title: "保存关联信息失败",
            icon: "none"
          });
        }
      };
      const handleRelationCancel = () => {
        formatAppLog("log", "at pages/stock/showcase_form/showcase_form.vue:163", "用户取消选择");
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
              formatAppLog("log", "at pages/stock/showcase_form/showcase_form.vue:195", res.data.data);
              resolve(res.data);
            },
            fail: (err) => {
              formatAppLog("log", "at pages/stock/showcase_form/showcase_form.vue:199", err);
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
          formatAppLog("log", "at pages/stock/showcase_form/showcase_form.vue:236", data);
          if (data.relations) {
            saveCollocationDataList.value = data.relations.map((r2) => ({
              goods_id: r2.relation_goods_id,
              goods_name: r2.relation_goods_name,
              brand_id: r2.relation_brand_id,
              brand_name: r2.relation_brand_name,
              type: r2.type,
              goods_image: r2.relation_goods_image
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
          formatAppLog("error", "at pages/stock/showcase_form/showcase_form.vue:283", "上传出错:", error);
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
          formatAppLog("log", "at pages/stock/showcase_form/showcase_form.vue:398", err);
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
            formatAppLog("log", "at pages/stock/showcase_form/showcase_form.vue:418", res.data.data);
            typeList.value = res.data.data;
          },
          fail: (err) => {
            formatAppLog("log", "at pages/stock/showcase_form/showcase_form.vue:422", err);
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
        return global$1;
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
  function _sfc_render$p(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_relation_picker = resolveEasycom(vue.resolveDynamicComponent("relation-picker"), __easycom_0$3);
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
      vue.createElementVNode("view", { style: { "width": "100%", "overflow": "hidden" } }, [
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
                  src: _imports_0$b,
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
              src: _imports_1$1,
              class: "upload_img",
              onClick: _cache[0] || (_cache[0] = ($event) => $setup.selectImage(_ctx.index)),
              style: { "width": "50px", "height": "50px", "margin": "25px" }
            })
          ])) : vue.createCommentVNode("v-if", true)
        ])
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
      vue.createElementVNode("view", { class: "publish-detail" }, [
        vue.createElementVNode("text", null, "* 展示您的宝宝们 🩵。"),
        vue.createElementVNode("text", null, "* 不关联商品的展示柜不会出现在广场中。")
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
                  src: _imports_0$b,
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
  const PagesStockShowcaseFormShowcaseForm = /* @__PURE__ */ _export_sfc(_sfc_main$q, [["render", _sfc_render$p], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/stock/showcase_form/showcase_form.vue"]]);
  const _sfc_main$p = {
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
            formatAppLog("log", "at pages/stock/bill_form/bill_form.vue:118", err);
          }
        });
      }
      const formattedDate = vue.ref("");
      function updateDate(e2) {
        const selectedDate = e2.detail.value;
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
      function updateStatus(e2) {
        status.value = e2.detail.value;
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
  function _sfc_render$o(_ctx, _cache, $props, $setup, $data, $options) {
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
          vue.createElementVNode("view", { style: { "padding": "0px 10px", "border": "1px solid #e6e6e6", "border-radius": "10px" } }, [
            vue.createElementVNode("picker", {
              mode: "date",
              value: $setup.formattedDate,
              onChange: $setup.updateDate
            }, [
              vue.createElementVNode(
                "view",
                {
                  class: "picker-content",
                  style: { "color": "#2c2c2c", "font-size": "26rpx" }
                },
                vue.toDisplayString($setup.formattedDate || "请选择日期"),
                1
                /* TEXT */
              )
            ], 40, ["value"])
          ])
        ]),
        vue.createCommentVNode(" 账单状态 "),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "form-label" }, "账单状态"),
          vue.createElementVNode("view", { style: { "padding": "0px 10px", "border": "1px solid #e6e6e6", "border-radius": "10px" } }, [
            vue.createElementVNode("picker", {
              mode: "selector",
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
          ])
        ]),
        vue.createElementVNode("view", { style: { "overflow": "hidden" } }, [
          vue.createElementVNode("image", {
            src: _imports_0$2,
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
  const PagesStockBillFormBillForm = /* @__PURE__ */ _export_sfc(_sfc_main$p, [["render", _sfc_render$o], ["__scopeId", "data-v-c24e185a"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/stock/bill_form/bill_form.vue"]]);
  const _sfc_main$o = {
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
          formatAppLog("error", "at pages/collocation/collocation.vue:128", "保存关联数据失败:", error);
          uni.showToast({
            title: "保存关联信息失败",
            icon: "none"
          });
        }
      };
      const handleRelationCancel = () => {
        formatAppLog("log", "at pages/collocation/collocation.vue:137", "用户取消选择");
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
              formatAppLog("log", "at pages/collocation/collocation.vue:152", res.data.data);
              resolve(res.data);
            },
            fail: (err) => {
              formatAppLog("log", "at pages/collocation/collocation.vue:156", err);
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
          formatAppLog("log", "at pages/collocation/collocation.vue:183", data);
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
          uni.showToast({
            title: `成功上传${imagePaths.length}张图片`,
            icon: "success"
          });
        } catch (error) {
          formatAppLog("error", "at pages/collocation/collocation.vue:224", "上传出错:", error);
          uni.showToast({
            title: "部分图片上传失败",
            icon: "none"
          });
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
        formatAppLog("log", "at pages/collocation/collocation.vue:279", postData);
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
            formatAppLog("log", "at pages/collocation/collocation.vue:310", err);
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
            formatAppLog("log", "at pages/collocation/collocation.vue:331", res.data.data);
            goodsList.value = res.data.data;
            formatAppLog("log", "at pages/collocation/collocation.vue:333", goodsList.value);
          },
          fail: (err) => {
            formatAppLog("log", "at pages/collocation/collocation.vue:337", err);
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
            formatAppLog("log", "at pages/collocation/collocation.vue:356", res.data.data);
            typeList.value = res.data.data;
          },
          fail: (err) => {
            formatAppLog("log", "at pages/collocation/collocation.vue:360", err);
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
        return global$1;
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
  function _sfc_render$n(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_relation_picker = resolveEasycom(vue.resolveDynamicComponent("relation-picker"), __easycom_0$3);
    return vue.openBlock(), vue.createElementBlock("view", null, [
      vue.createCommentVNode(" 上传图片列表 "),
      vue.createElementVNode("view", { style: { "width": "100%", "overflow": "hidden" } }, [
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
                  src: _imports_0$b,
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
              src: _imports_1$1,
              class: "upload_img",
              onClick: _cache[0] || (_cache[0] = ($event) => $setup.selectImage(_ctx.index)),
              style: { "width": "50px", "height": "50px", "margin": "25px" }
            })
          ])
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
      vue.createElementVNode("view", { class: "publish-detail" }, [
        vue.createElementVNode("text", null, "* 分享您对于打扮BJD的想法✨。"),
        vue.createElementVNode("text", null, "* 不关联商品的搭配不会出现在广场中。"),
        vue.createElementVNode("text", null, "* 可以是BJD相关的贩售广告，但不可以滥用关联。")
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
                  src: _imports_0$b,
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
    ]);
  }
  const PagesCollocationCollocation = /* @__PURE__ */ _export_sfc(_sfc_main$o, [["render", _sfc_render$n], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/collocation/collocation.vue"]]);
  const _sfc_main$n = {
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
      const pageId = vue.ref(0);
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
              formatAppLog("error", "at pages/collocation_share/collocation_share.vue:213", err);
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
        formatAppLog("log", "at pages/collocation_share/collocation_share.vue:226", detailData);
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
                  formatAppLog("error", "at pages/collocation_share/collocation_share.vue:265", "商品信息获取失败:", error2);
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
            formatAppLog("error", "at pages/collocation_share/collocation_share.vue:316", "获取用户信息失败:", res.data.msg);
          }
        } catch (error2) {
          formatAppLog("error", "at pages/collocation_share/collocation_share.vue:319", "用户信息请求失败:", error2);
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
        if (!global$1.isLogin) {
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
            formatAppLog("log", "at pages/collocation_share/collocation_share.vue:374", res.data);
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
            formatAppLog("log", "at pages/collocation_share/collocation_share.vue:393", err);
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
            formatAppLog("log", "at pages/collocation_share/collocation_share.vue:433", err);
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
        formatAppLog("log", "at pages/collocation_share/collocation_share.vue:457", "parent", parent);
        formatAppLog("log", "at pages/collocation_share/collocation_share.vue:458", "target", target);
        let item = parent;
        if (target != null) {
          item = target;
        }
        if (replyForItem.value.id == item.id) {
          replyForItem.value = {};
          return;
        }
        formatAppLog("log", "at pages/collocation_share/collocation_share.vue:469", "item", item);
        replyForItem.value = item;
        (_a = commentInputRef.value) == null ? void 0 : _a.focusInput();
      };
      const onShareAppMessage = () => ({
        title: "BJD娃圈你想知道的这里都有~",
        path: "/pages/news/news",
        success(res) {
          formatAppLog("log", "at pages/collocation_share/collocation_share.vue:479", "分享成功", res);
        },
        fail(err) {
          formatAppLog("log", "at pages/collocation_share/collocation_share.vue:482", "分享失败", err);
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
        if (!global$1.isLogin) {
          uni.showToast({
            title: "请先登录",
            icon: "none"
          });
          return;
        }
        formatAppLog("log", "at pages/collocation_share/collocation_share.vue:501", "reply_info", replyInfo);
        const requestData = {
          content,
          origin: origin2,
          target_id: parseInt(pageId.value),
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
        formatAppLog("log", "at pages/collocation_share/collocation_share.vue:575", "注册键盘弹出事件");
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
          pageId.value = options.collocation_id;
          origin.value = options.origin;
          fetchData(options.collocation_id, options.origin);
          asyncGetUserInfo().then((userInfo) => {
            formatAppLog("log", "at pages/collocation_share/collocation_share.vue:598", userInfo);
            getHasLike(options.collocation_id);
          });
        } catch (err) {
          formatAppLog("error", "at pages/collocation_share/collocation_share.vue:604", "onLoad Error:", err);
          uni.showToast({
            title: "加载失败",
            icon: "none"
          });
        }
      });
      const __returned__ = { detailData, authorInfo, systemInfo: systemInfo2, loading, error, errorMsg, props, pageId, origin, get hasLike() {
        return hasLike;
      }, set hasLike(v2) {
        hasLike = v2;
      }, commentListRef, commentInputRef, get commentsPage() {
        return commentsPage;
      }, set commentsPage(v2) {
        commentsPage = v2;
      }, get replyForItem() {
        return replyForItem;
      }, set replyForItem(v2) {
        replyForItem = v2;
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
        return global$1;
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
  function _sfc_render$m(_ctx, _cache, $props, $setup, $data, $options) {
    var _a;
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$b);
    const _component_report_button = resolveEasycom(vue.resolveDynamicComponent("report-button"), __easycom_0$7);
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
        vue.createElementVNode("view", { style: { "display": "flex", "justify-content": "space-between" } }, [
          vue.createElementVNode(
            "text",
            { class: "title" },
            vue.toDisplayString($setup.detailData.title),
            1
            /* TEXT */
          ),
          vue.createElementVNode("view", { class: "report-container" }, [
            vue.createVNode(_component_report_button, {
              "report-type": $setup.origin === 1 ? 2 : 1,
              "relation-id": parseInt($setup.pageId),
              "icon-type": "flag",
              "icon-color": "#999"
            }, null, 8, ["report-type", "relation-id"])
          ])
        ]),
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
      $setup.detailData.title ? (vue.openBlock(), vue.createBlock(_component_comment_input, {
        key: 1,
        ref: "commentInputRef",
        "reply-info": $setup.replyForItem,
        "target-id": $setup.pageId,
        onSubmit: $setup.handleCommentSubmit,
        "onUpdate:replyInfo": _cache[2] || (_cache[2] = (val) => $setup.replyForItem = val)
      }, null, 8, ["reply-info", "target-id"])) : vue.createCommentVNode("v-if", true),
      vue.createElementVNode("view", { style: { "width": "100%", "height": "120rpx" } }),
      vue.createCommentVNode(" 加载状态 "),
      $setup.loading ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 2,
        class: "loading"
      }, "加载中...")) : vue.createCommentVNode("v-if", true),
      $setup.error ? (vue.openBlock(), vue.createElementBlock(
        "view",
        {
          key: 3,
          class: "error"
        },
        vue.toDisplayString($setup.errorMsg),
        1
        /* TEXT */
      )) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesCollocationShareCollocationShare = /* @__PURE__ */ _export_sfc(_sfc_main$n, [["render", _sfc_render$m], ["__scopeId", "data-v-38d96b75"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/collocation_share/collocation_share.vue"]]);
  const _sfc_main$m = {
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
      const is_blocked = vue.ref(false);
      const they_blocked = vue.ref(false);
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
        if (is_blocked.value || they_blocked.value)
          return;
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
          formatAppLog("log", "at pages/user_page/user_page.vue:227", error);
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
      const getBlockStatus = async () => {
        const token = uni.getStorageSync("token");
        if (!token) {
          formatAppLog("log", "at pages/user_page/user_page.vue:259", "未登录");
          return;
        }
        try {
          const res = await uni.request({
            url: `${websiteUrl}/with-state/blacklist/status`,
            method: "GET",
            data: {
              target_user_id: props.uid
            },
            header: {
              Authorization: token
            }
          });
          if (res.data.status === "success") {
            is_blocked.value = res.data.data.is_blocked;
            they_blocked.value = res.data.data.they_blocked;
          }
        } catch (error) {
          formatAppLog("log", "at pages/user_page/user_page.vue:280", "获取黑名单状态失败", error);
        }
      };
      const toggleBlock = async () => {
        try {
          const token = uni.getStorageSync("token");
          if (!token) {
            formatAppLog("log", "at pages/user_page/user_page.vue:289", "未登录");
            return;
          }
          const action = is_blocked.value ? "remove" : "add";
          const res = await uni.request({
            url: `${websiteUrl}/with-state/blacklist/${action}?target_user_id=` + props.uid,
            method: "POST",
            header: {
              Authorization: token
            }
          });
          if (res.data.status === "success") {
            is_blocked.value = !is_blocked.value;
            uni.showToast({
              title: is_blocked.value ? "已加入黑名单" : "已移除黑名单",
              icon: "none"
            });
            if (is_blocked.value || they_blocked.value) {
              collocations.value = [];
              dolls.value = [];
              reviews.value = [];
            }
          } else {
            uni.showToast({
              title: res.data.msg,
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("log", "at pages/user_page/user_page.vue:324", "操作失败", error);
          uni.showToast({
            title: "操作失败",
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
        getBlockStatus().then(() => {
          if (!is_blocked.value && !they_blocked.value) {
            loadData();
          }
        });
      });
      onReachBottom(() => {
        loadData();
      });
      const __returned__ = { currentTab, tabs, props, userInfo, is_blocked, they_blocked, collocations, dolls, reviews, paginations, loadData, getAuthorInfo, getBlockStatus, toggleBlock, formatTime, ref: vue.ref, watch: vue.watch, onMounted: vue.onMounted, get onShow() {
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
        return global$1;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$l(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$b);
    return vue.openBlock(), vue.createElementBlock("view", { class: "page-container" }, [
      vue.createElementVNode("meta", {
        name: "theme-color",
        content: "#F8F8F8"
      }),
      vue.createElementVNode("view", { class: "header_container" }, [
        vue.createCommentVNode(" 黑名单提示 "),
        vue.createCommentVNode(' 			<view class="block-info" v-if="is_blocked || they_blocked">\n				<uni-icons type="minus" size="16" color="#fff"></uni-icons>\n				<text>你们已互相拉黑，无法查看彼此主页</text>\n			</view> '),
        vue.createCommentVNode(" 头像和用户名区域 "),
        vue.createElementVNode("view", { class: "user-info-container" }, [
          vue.createElementVNode("view", { class: "user-info-box" }, [
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
          vue.createCommentVNode(" 拉黑按钮 "),
          vue.createElementVNode("view", { class: "action-buttons" }, [
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["action-btn block-btn", { "blocked": $setup.is_blocked }]),
                onClick: $setup.toggleBlock
              },
              [
                vue.createVNode(_component_uni_icons, {
                  type: $setup.is_blocked ? "minus" : "minus",
                  size: "16",
                  color: "#fff"
                }, null, 8, ["type"]),
                vue.createElementVNode(
                  "text",
                  null,
                  vue.toDisplayString($setup.is_blocked ? "已拉黑" : "拉黑"),
                  1
                  /* TEXT */
                )
              ],
              2
              /* CLASS */
            )
          ])
        ])
      ]),
      vue.createCommentVNode(" 内容区域 "),
      !$setup.is_blocked && !$setup.they_blocked ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "content"
      }, [
        vue.createCommentVNode(" Tab切换 "),
        vue.createElementVNode("view", { class: "tabs-container" }, [
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
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 无权限提示 "),
      $setup.is_blocked || $setup.they_blocked ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "empty-state"
      }, [
        vue.createVNode(_component_uni_icons, {
          type: "minus",
          size: "48",
          color: "#ccc"
        }),
        vue.createElementVNode("text", null, "你无法查看该用户的主页")
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesUserPageUserPage = /* @__PURE__ */ _export_sfc(_sfc_main$m, [["render", _sfc_render$l], ["__scopeId", "data-v-c3556478"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/user_page/user_page.vue"]]);
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
      closeSwipe(e2) {
        if (this.autoClose && this.swipeaction) {
          this.swipeaction.closeOther(this);
        }
      },
      change(e2) {
        this.$emit("change", e2.open);
        if (this.is_show !== e2.open) {
          this.is_show = e2.open;
        }
      },
      appTouchStart(e2) {
        const {
          clientX
        } = e2.changedTouches[0];
        this.clientX = clientX;
        this.timestamp = (/* @__PURE__ */ new Date()).getTime();
      },
      appTouchEnd(e2, index, item, position) {
        const {
          clientX
        } = e2.changedTouches[0];
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
  const _sfc_main$l = {
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
  function _sfc_render$k(_ctx, _cache, $props, $setup, $data, $options) {
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
    block0$1(_sfc_main$l);
  if (typeof block1 === "function")
    block1(_sfc_main$l);
  const __easycom_0$2 = /* @__PURE__ */ _export_sfc(_sfc_main$l, [["render", _sfc_render$k], ["__scopeId", "data-v-8ff2a577"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/uni_modules/uni-swipe-action/components/uni-swipe-action-item/uni-swipe-action-item.vue"]]);
  const _sfc_main$k = {
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
  function _sfc_render$j(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", null, [
      vue.renderSlot(_ctx.$slots, "default")
    ]);
  }
  const __easycom_1 = /* @__PURE__ */ _export_sfc(_sfc_main$k, [["render", _sfc_render$j], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/uni_modules/uni-swipe-action/components/uni-swipe-action/uni-swipe-action.vue"]]);
  const _sfc_main$j = {
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
      const handleSwipeClick = (e2) => {
        const {
          type,
          id
        } = e2.content.data;
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
          const item = messageList.value.find((i2) => i2.id === messageId);
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
        return global$1;
      }, get asyncGetUserInfo() {
        return asyncGetUserInfo;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$i(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_swipe_action_item = resolveEasycom(vue.resolveDynamicComponent("uni-swipe-action-item"), __easycom_0$2);
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
  const PagesMessageListMessageList = /* @__PURE__ */ _export_sfc(_sfc_main$j, [["render", _sfc_render$i], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/message_list/message_list.vue"]]);
  const _sfc_main$i = {
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
  function _sfc_render$h(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_load_more = resolveEasycom(vue.resolveDynamicComponent("uni-load-more"), __easycom_0$4);
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$b);
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
  const PagesMessageInfoMessageInfo = /* @__PURE__ */ _export_sfc(_sfc_main$i, [["render", _sfc_render$h], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/message_info/message_info.vue"]]);
  const _sfc_main$h = {
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
        if (!validations.every((v2) => v2))
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
  function _sfc_render$g(_ctx, _cache, $props, $setup, $data, $options) {
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
  const PagesRegisterRegister = /* @__PURE__ */ _export_sfc(_sfc_main$h, [["render", _sfc_render$g], ["__scopeId", "data-v-bac4a35d"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/register/register.vue"]]);
  const _sfc_main$g = {
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
  function _sfc_render$f(_ctx, _cache, $props, $setup, $data, $options) {
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
  const PagesUserLikeUserLike = /* @__PURE__ */ _export_sfc(_sfc_main$g, [["render", _sfc_render$f], ["__scopeId", "data-v-909fcc31"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/user_like/user_like.vue"]]);
  const _imports_0$1 = "/static/new-icon/findfind.png";
  const _imports_1 = "/static/new-icon/sesee.png";
  const pageSize = 10;
  const _sfc_main$f = {
    __name: "collocation_square",
    setup(__props, { expose: __expose }) {
      __expose();
      const currentTab = vue.ref("find");
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
      const randomGoodsList = vue.ref([]);
      const goodsLoading = vue.ref(false);
      const goodsNoMore = vue.ref(false);
      const goodsCursor = vue.ref(-1);
      const selectedType = vue.ref("全部");
      const selectedSize = vue.ref("全部");
      const goodsTypes = vue.ref([]);
      const sizes = vue.ref([]);
      const miniProgram = false;
      const showPostMenu = vue.ref(false);
      const togglePostMenu = () => {
        showPostMenu.value = !showPostMenu.value;
      };
      const closePostMenu = () => {
        showPostMenu.value = false;
      };
      const goToCollocation = () => {
        closePostMenu();
        uni.navigateTo({
          url: "/pages/collocation/collocation"
        });
      };
      const goToShowcase = () => {
        closePostMenu();
        uni.navigateTo({
          url: "/pages/stock/showcase_form/showcase_form"
        });
      };
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
        formatAppLog("log", "at pages/collocation_square/collocation_square.vue:278", "进入计算布局逻辑");
        if (!instance2) {
          formatAppLog("log", "at pages/collocation_square/collocation_square.vue:280", "无法获取instance");
          return;
        }
        formatAppLog("log", "at pages/collocation_square/collocation_square.vue:283", "获取成功");
        if (!collocationList.value) {
          formatAppLog("log", "at pages/collocation_square/collocation_square.vue:285", "无列表数据，不需要计算布局");
          return;
        }
        formatAppLog("log", "at pages/collocation_square/collocation_square.vue:288", "获取成功，准备createSelectorQuery");
        formatAppLog("log", "at pages/collocation_square/collocation_square.vue:289", instance2);
        const query = uni.createSelectorQuery().in(instance2.proxy);
        formatAppLog("log", "at pages/collocation_square/collocation_square.vue:291", "获取到query");
        const tasks = collocationList.value.map((_2, index) => {
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
          formatAppLog("log", "at pages/collocation_square/collocation_square.vue:306", "进入Query");
          columnsHeight[0] = 0;
          columnsHeight[1] = 0;
          const results = await Promise.all(tasks);
          if (!results.length) {
            formatAppLog("warn", "at pages/collocation_square/collocation_square.vue:314", "未查询到任何卡片元素");
            return;
          }
          results.forEach(({
            index,
            rect
          }) => {
            if (!rect) {
              formatAppLog("error", "at pages/collocation_square/collocation_square.vue:322", `卡片${index}元素查询失败`);
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
      const handleTabSwitch = (tab) => {
        showPostMenu.value = false;
        showFilterModal.value = false;
        if (currentTab.value === "view") {
          collocationList.value.forEach((item) => {
            delete item.position;
          });
          columnsHeight[0] = 0;
          columnsHeight[1] = 0;
        }
        switchTab(tab);
      };
      const switchTab = (tab) => {
        currentTab.value = tab;
        if (tab === "find") {
          if (goodsTypes.value.length === 0) {
            fetchGoodsTypes();
            fetchSizes();
          }
          if (randomGoodsList.value.length === 0) {
            fetchRandomGoods(true);
          }
        }
        if (tab == "view") {
          fetchCollocations();
        }
      };
      const fetchGoodsTypes = async () => {
        try {
          const res = await uni.request({
            url: `${websiteUrl}/goods-types`,
            method: "GET"
          });
          if (res.data.status === "success") {
            goodsTypes.value = ["全部", ...res.data.data];
          }
        } catch (error) {
          formatAppLog("error", "at pages/collocation_square/collocation_square.vue:393", "获取商品分类失败:", error);
        }
      };
      const fetchSizes = async () => {
        try {
          const res = await uni.request({
            url: `${websiteUrl}/sizes?show_type=hot`,
            method: "GET"
          });
          if (res.data.status === "success") {
            const sizeKeys = Object.keys(res.data.data);
            sizes.value = ["全部", ...sizeKeys];
          }
        } catch (error) {
          formatAppLog("error", "at pages/collocation_square/collocation_square.vue:411", "获取尺寸分类失败:", error);
        }
      };
      const selectType = (type) => {
        selectedType.value = type;
        fetchRandomGoods(true);
      };
      const selectSize = (size) => {
        selectedSize.value = size;
        fetchRandomGoods(true);
      };
      const fetchRandomGoods = async (reset = false) => {
        if (reset) {
          randomGoodsList.value = [];
          goodsCursor.value = -1;
          goodsNoMore.value = false;
        }
        if (goodsLoading.value || goodsNoMore.value)
          return;
        try {
          goodsLoading.value = true;
          const params = {
            cursor: goodsCursor.value,
            page_size: 10,
            type: selectedType.value === "全部" ? "" : selectedType.value,
            size: selectedSize.value === "全部" ? "" : selectedSize.value
          };
          const res = await uni.request({
            url: `${websiteUrl}/random-list`,
            method: "POST",
            data: params,
            header: {
              "content-type": "application/json"
            }
          });
          if (res.data.status === "success") {
            const data = res.data.data;
            const newItems = data.goods_list || [];
            randomGoodsList.value = reset ? newItems : [...randomGoodsList.value, ...newItems];
            goodsCursor.value = data.next_cursor;
            goodsNoMore.value = newItems.length < 10;
          }
        } catch (error) {
          formatAppLog("error", "at pages/collocation_square/collocation_square.vue:465", "获取随机商品失败:", error);
          uni.showToast({
            title: "加载失败",
            icon: "none"
          });
        } finally {
          goodsLoading.value = false;
        }
      };
      const loadMoreGoods = () => {
        fetchRandomGoods();
      };
      vue.onMounted(() => {
        const systemInfo2 = uni.getSystemInfoSync();
        const padding = 30;
        cardWidth.value = (systemInfo2.windowWidth - padding) / 2;
        fetchGoodsTypes();
        fetchSizes();
        fetchRandomGoods(true);
      });
      onPullDownRefresh(async () => {
        try {
          if (currentTab.value === "view") {
            await fetchCollocations(true);
          } else if (currentTab.value === "find") {
            await fetchRandomGoods(true);
          }
          uni.stopPullDownRefresh();
        } catch (error) {
          uni.stopPullDownRefresh();
          uni.showToast({
            title: "刷新失败",
            icon: "none"
          });
        }
      });
      const fetchCollocations = async (reset = false) => {
        if (reset) {
          collocationList.value = [];
          currentPage.value = 1;
          noMore.value = false;
          loading.value = false;
        }
        if (loading.value || noMore.value) {
          formatAppLog("log", "at pages/collocation_square/collocation_square.vue:523", "正在加载或没有更多数据，停止请求");
          layoutFunction();
          return;
        }
        try {
          loading.value = true;
          const params = {
            page: currentPage.value,
            page_size: pageSize,
            filter_goods_id_list: filterGoods.value.map((g2) => g2.goods_id)
          };
          formatAppLog("log", "at pages/collocation_square/collocation_square.vue:538", "请求参数:", JSON.stringify(params, null, 2));
          const res = await uni.request({
            url: `${websiteUrl}/collocation-list`,
            method: "POST",
            data: params,
            header: {
              "content-type": "application/json"
              // 确保使用JSON格式
            }
          });
          formatAppLog("log", "at pages/collocation_square/collocation_square.vue:549", "接口响应:", res);
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
            layoutFunction();
          }
        } catch (error) {
          formatAppLog("error", "at pages/collocation_square/collocation_square.vue:575", "请求失败:", error);
          uni.showToast({
            title: "加载失败",
            icon: "none"
          });
        } finally {
          loading.value = false;
        }
      };
      const layoutFunction = async () => {
        formatAppLog("log", "at pages/collocation_square/collocation_square.vue:586", "等待next tick");
        await vue.nextTick();
        formatAppLog("log", "at pages/collocation_square/collocation_square.vue:588", "等待完成");
        calculateLayout(instance);
        setTimeout(() => {
          formatAppLog("log", "at pages/collocation_square/collocation_square.vue:592", "二次计算布局");
          calculateLayout(instance);
        }, 500);
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
          formatAppLog("log", "at pages/collocation_square/collocation_square.vue:622", "商品列表:", res.data);
          if (res.data.status === "success") {
            goodsOptions.value = res.data.data;
          }
        } catch (error) {
          formatAppLog("error", "at pages/collocation_square/collocation_square.vue:627", "加载商品失败:", error);
        }
      };
      const handleGoodsSelect = (goods2) => {
        formatAppLog("log", "at pages/collocation_square/collocation_square.vue:632", "选择商品:", goods2);
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
      function jumpGoods(id) {
        uni.navigateTo({
          url: "/pages/goods/goods?goods_id=" + id
        });
      }
      const onShareAppMessage = () => ({
        title: "BJD娃圈你想知道的这里都有~",
        path: "/pages/news/news",
        success(res) {
          formatAppLog("log", "at pages/collocation_square/collocation_square.vue:665", "分享成功", res);
        },
        fail(err) {
          formatAppLog("log", "at pages/collocation_square/collocation_square.vue:668", "分享失败", err);
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
        filterGoods.value = filterGoods.value.filter((g2) => g2.goods_id !== goodsId);
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
      const __returned__ = { currentTab, collocationList, loading, noMore, currentPage, pageSize, containerHeight, cardWidth, columnsHeight, showFilterModal, filterBrand, goodsOptions, instance, selectedBrand, filterGoods, tempSelectGoods, randomGoodsList, goodsLoading, goodsNoMore, goodsCursor, selectedType, selectedSize, goodsTypes, sizes, miniProgram, showPostMenu, togglePostMenu, closePostMenu, goToCollocation, goToShowcase, cardStyle, calculateLayout, handleTabSwitch, switchTab, fetchGoodsTypes, fetchSizes, selectType, selectSize, fetchRandomGoods, loadMoreGoods, fetchCollocations, layoutFunction, showFilter, handleBrandSelect, loadGoodsOptions, handleGoodsSelect, jumpGoods, onShareAppMessage, applyFilter, closeFilter, removeGood, resetFilter, jump2collectionDetail, confirmFilter, loadMore, navigateToDetail, jumpToUserPage, getUserName, ref: vue.ref, reactive: vue.reactive, onMounted: vue.onMounted, nextTick: vue.nextTick, getCurrentInstance: vue.getCurrentInstance, get onLoad() {
        return onLoad;
      }, get onReachBottom() {
        return onReachBottom;
      }, get onPullDownRefresh() {
        return onPullDownRefresh;
      }, get websiteUrl() {
        return websiteUrl;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$e(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_goods_search = resolveEasycom(vue.resolveDynamicComponent("goods-search"), __easycom_0$9);
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$b);
    const _component_uni_transition = resolveEasycom(vue.resolveDynamicComponent("uni-transition"), __easycom_2$2);
    const _component_common_modal = resolveEasycom(vue.resolveDynamicComponent("common-modal"), __easycom_3$2);
    const _component_loading_toast = resolveEasycom(vue.resolveDynamicComponent("loading-toast"), __easycom_4);
    const _component_common_page = resolveEasycom(vue.resolveDynamicComponent("common-page"), __easycom_1$4);
    return vue.openBlock(), vue.createElementBlock(
      vue.Fragment,
      null,
      [
        vue.createElementVNode("meta", {
          name: "theme-color",
          content: "#def9ff"
        }),
        vue.createVNode(_component_common_page, { head_color: "#def9ff" }, {
          default: vue.withCtx(() => [
            vue.createCommentVNode(" 看看 Tab 内容 "),
            vue.createCommentVNode(" 顶部 tab 切换栏 "),
            vue.createElementVNode("view", { class: "tabs" }, [
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["tab", { active: $setup.currentTab === "find" }]),
                  onClick: _cache[0] || (_cache[0] = ($event) => $setup.handleTabSwitch("find"))
                },
                [
                  vue.createElementVNode("image", {
                    src: _imports_0$1,
                    class: "tab-image"
                  }),
                  vue.createCommentVNode(" <text>找找</text> ")
                ],
                2
                /* CLASS */
              ),
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["tab", { active: $setup.currentTab === "view" }]),
                  onClick: _cache[1] || (_cache[1] = ($event) => $setup.handleTabSwitch("view"))
                },
                [
                  vue.createElementVNode("image", {
                    src: _imports_1,
                    class: "tab-image",
                    style: { "position": "relative", "bottom": "5rpx" }
                  }),
                  vue.createCommentVNode(" <text>看看</text> ")
                ],
                2
                /* CLASS */
              )
            ]),
            vue.createCommentVNode(" 找找 Tab 内容 "),
            $setup.currentTab === "find" ? (vue.openBlock(), vue.createElementBlock("view", { key: 0 }, [
              vue.createCommentVNode(" 分类筛选区域 "),
              vue.createElementVNode("view", { class: "category-container" }, [
                vue.createElementVNode("view", { style: { "margin": "10rpx 0 40rpx 0" } }, [
                  vue.createVNode(_component_goods_search, {
                    "hidden-icon": false,
                    width: "670rpx"
                  })
                ]),
                vue.createCommentVNode(" 商品分类 "),
                vue.createElementVNode("scroll-view", {
                  "scroll-x": "",
                  class: "category-scroll",
                  "show-scrollbar": false
                }, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList($setup.goodsTypes, (type, index) => {
                      return vue.openBlock(), vue.createElementBlock("view", {
                        class: vue.normalizeClass(["category-item", { active: $setup.selectedType === type }]),
                        key: index,
                        onClick: ($event) => $setup.selectType(type)
                      }, vue.toDisplayString(type), 11, ["onClick"]);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ]),
                vue.createCommentVNode(" 尺寸分类 "),
                vue.createElementVNode("scroll-view", {
                  "scroll-x": "",
                  class: "size-scroll",
                  "show-scrollbar": false
                }, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList($setup.sizes, (size, index) => {
                      return vue.openBlock(), vue.createElementBlock("view", {
                        class: vue.normalizeClass(["size-item", { active: $setup.selectedSize === size }]),
                        key: index,
                        onClick: ($event) => $setup.selectSize(size)
                      }, vue.toDisplayString(size), 11, ["onClick"]);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ]),
              vue.createCommentVNode(" 随机商品列表 "),
              vue.createElementVNode(
                "scroll-view",
                {
                  class: "goods-list",
                  "scroll-y": "",
                  onScrolltolower: $setup.loadMoreGoods,
                  "show-scrollbar": false
                },
                [
                  vue.createElementVNode("view", { class: "goods-container" }, [
                    (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList($setup.randomGoodsList, (goods2, index) => {
                        return vue.openBlock(), vue.createElementBlock("view", {
                          key: goods2.id,
                          class: "goods-card",
                          onClick: ($event) => $setup.jumpGoods(goods2.id)
                        }, [
                          vue.createElementVNode("image", {
                            src: goods2.goods_images[0],
                            mode: "aspectFill",
                            class: "goods-image"
                          }, null, 8, ["src"]),
                          vue.createElementVNode("view", { class: "goods-info" }, [
                            vue.createElementVNode(
                              "text",
                              { class: "goods-name" },
                              vue.toDisplayString(goods2.name),
                              1
                              /* TEXT */
                            ),
                            vue.createElementVNode(
                              "text",
                              { class: "goods-brand" },
                              vue.toDisplayString(goods2.brand_name),
                              1
                              /* TEXT */
                            ),
                            vue.createElementVNode(
                              "text",
                              { class: "goods-price" },
                              vue.toDisplayString(goods2.total_amount) + " " + vue.toDisplayString(goods2.currency),
                              1
                              /* TEXT */
                            )
                          ])
                        ], 8, ["onClick"]);
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ]),
                  vue.createCommentVNode(" 加载状态 "),
                  vue.createElementVNode("view", { class: "loading-state" }, [
                    $setup.goodsLoading ? (vue.openBlock(), vue.createElementBlock("text", { key: 0 }, "加载中...")) : vue.createCommentVNode("v-if", true),
                    $setup.goodsNoMore ? (vue.openBlock(), vue.createElementBlock("text", {
                      key: 1,
                      class: "no-more"
                    }, "没有更多了")) : vue.createCommentVNode("v-if", true)
                  ])
                ],
                32
                /* NEED_HYDRATION */
              )
            ])) : vue.createCommentVNode("v-if", true),
            $setup.currentTab === "view" ? (vue.openBlock(), vue.createElementBlock("view", { key: 1 }, [
              vue.createCommentVNode(" 筛选栏 "),
              vue.createCommentVNode(` <view class="filter-bar" :style="miniProgram ? 'width:500rpx' : ''"> `),
              vue.createElementVNode("view", { class: "filter-bar-container" }, [
                vue.createElementVNode("view", { class: "filter-bar" }, [
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
                            onClick: vue.withModifiers((e2) => $setup.removeGood(goods2.goods_id, e2), ["stop"])
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
                    onClick: _cache[2] || (_cache[2] = ($event) => $setup.fetchCollocations(true))
                  }, "筛选")
                ])
              ]),
              vue.createElementVNode("view", { class: "container" }, [
                vue.createCommentVNode(' <view v-if="miniProgram" style="height: 40rpx;"></view> '),
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
                vue.createCommentVNode(" 悬浮发帖按钮 "),
                vue.createElementVNode("view", {
                  class: "floating-button",
                  onClick: $setup.togglePostMenu
                }, [
                  vue.createVNode(_component_uni_icons, {
                    type: "plusempty",
                    size: "30",
                    color: "#fff"
                  })
                ]),
                vue.createCommentVNode(" 发帖菜单 "),
                vue.createVNode(_component_uni_transition, {
                  name: "fade",
                  mode: "out-in",
                  duration: 300
                }, {
                  default: vue.withCtx(() => [
                    $setup.showPostMenu ? (vue.openBlock(), vue.createElementBlock("view", {
                      key: 0,
                      class: "post-menu-mask",
                      onClick: $setup.closePostMenu
                    })) : vue.createCommentVNode("v-if", true)
                  ]),
                  _: 1
                  /* STABLE */
                }),
                vue.createElementVNode(
                  "view",
                  {
                    class: vue.normalizeClass(["post-menu", { show: $setup.showPostMenu }])
                  },
                  [
                    vue.createElementVNode("view", {
                      class: "menu-item",
                      onClick: $setup.goToCollocation
                    }, [
                      vue.createVNode(_component_uni_icons, {
                        style: { "margin-right": "10rpx" },
                        type: "color",
                        size: "24",
                        color: "#5f85a3"
                      }),
                      vue.createElementVNode("text", null, "发搭配分享")
                    ]),
                    vue.createElementVNode("view", {
                      class: "menu-item",
                      onClick: $setup.goToShowcase
                    }, [
                      vue.createVNode(_component_uni_icons, {
                        style: { "margin-right": "10rpx" },
                        type: "compose",
                        size: "24",
                        color: "#5f85a3"
                      }),
                      vue.createElementVNode("text", null, "发展示柜")
                    ])
                  ],
                  2
                  /* CLASS */
                ),
                vue.createCommentVNode(" 筛选弹窗 "),
                vue.createVNode(_component_common_modal, {
                  visible: $setup.showFilterModal,
                  "onUpdate:visible": _cache[3] || (_cache[3] = ($event) => $setup.showFilterModal = $event),
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
                              onClick: vue.withModifiers((e2) => $setup.removeGood(goods2.goods_id, e2), ["stop"])
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
            ])) : vue.createCommentVNode("v-if", true),
            vue.createVNode(_component_loading_toast, {
              show: $setup.goodsLoading || $setup.loading
            }, null, 8, ["show"])
          ]),
          _: 1
          /* STABLE */
        })
      ],
      64
      /* STABLE_FRAGMENT */
    );
  }
  const PagesCollocationSquareCollocationSquare = /* @__PURE__ */ _export_sfc(_sfc_main$f, [["render", _sfc_render$e], ["__scopeId", "data-v-e981f8ca"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/collocation_square/collocation_square.vue"]]);
  const _sfc_main$e = {
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
      const pageId = vue.ref(0);
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
            brandId.value = res.data.data.brand_id;
            getBrandsInfo();
          } else {
            handleError(res.data.msg || "数据加载失败");
          }
        } catch (err) {
          formatAppLog("error", "at pages/sale_news/sale_news.vue:187", "请求失败:", err);
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
        if (!global$1.isLogin) {
          uni.showToast({
            title: "请先登录",
            icon: "none"
          });
          return;
        }
        formatAppLog("log", "at pages/sale_news/sale_news.vue:208", "reply_info", replyInfo);
        const requestData = {
          content,
          origin,
          target_id: parseInt(pageId.value),
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
        if (!global$1.isLogin) {
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
        if (!global$1.isLogin)
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
        if (!options.id) {
          handleError("缺少必要参数");
          return;
        }
        pageId.value = options.id;
        fetchNewsDetail(options.id);
        asyncGetUserInfo().then(getHasLikeBrand);
      });
      const __returned__ = { detailData, brand, loading, error, errorMsg, pageId, brandId, hasLikeBrand, commentListRef, commentInputRef, get commentsPage() {
        return commentsPage;
      }, set commentsPage(v2) {
        commentsPage = v2;
      }, get replyForItem() {
        return replyForItem;
      }, set replyForItem(v2) {
        replyForItem = v2;
      }, systemInfo: systemInfo2, handleReplyComment, viewFullImage, jump2brand, onShareAppMessage, jump2user, fetchNewsDetail, handleCommentSubmit, formatTimestamp, getBrandsInfo, likeBrand, getHasLikeBrand, ref: vue.ref, onMounted: vue.onMounted, computed: vue.computed, get onLoad() {
        return onLoad;
      }, get onShow() {
        return onShow;
      }, get websiteUrl() {
        return websiteUrl;
      }, get global() {
        return global$1;
      }, get asyncGetUserInfo() {
        return asyncGetUserInfo;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$d(_ctx, _cache, $props, $setup, $data, $options) {
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
  const PagesSaleNewsSaleNews = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["render", _sfc_render$d], ["__scopeId", "data-v-c9c53f1c"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/sale_news/sale_news.vue"]]);
  const _sfc_main$d = {
    __name: "treehole_publish",
    setup(__props, { expose: __expose }) {
      __expose();
      const content = vue.ref("");
      const isAnonymous = vue.ref(0);
      const uploadList = vue.ref([]);
      const categories = vue.ref([]);
      const selectedCategory = vue.ref("");
      const selectedIndex = vue.ref(-1);
      const selectedCategoryLabel = vue.ref("");
      function viewFullImage(index) {
        uni.previewImage({
          current: uploadList.value[index],
          urls: uploadList.value
        });
      }
      function handleAnonymous(e2) {
        isAnonymous.value = e2.detail.value.length > 0 ? 1 : 0;
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
      function handleCategoryChange(e2) {
        const index = e2.detail.value;
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
              title: "已收到您的投稿",
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
        return global$1;
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
  function _sfc_render$c(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$b);
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
                    src: _imports_0$b,
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
                src: _imports_1$1,
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
            vue.createElementVNode("text", null, "* 目前树洞为非审稿发布，只接受娃圈相关内容。"),
            vue.createCommentVNode(" <text>* 我们会在工作时间进行审稿，您可以在个人投稿中心查看投稿状态，审核通过后稿件才被可见。</text> "),
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
  const PagesTreeholePublishTreeholePublish = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["render", _sfc_render$c], ["__scopeId", "data-v-07f0d6e5"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/treehole_publish/treehole_publish.vue"]]);
  const _sfc_main$c = {
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
      const pageId = vue.ref(0);
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
        formatAppLog("log", "at pages/treehole_detail/treehole_detail.vue:123", "parent", parent);
        formatAppLog("log", "at pages/treehole_detail/treehole_detail.vue:124", "target", target);
        let item = parent;
        if (target != null) {
          item = target;
        }
        if (replyForItem.value.id == item.id) {
          replyForItem.value = {};
          return;
        }
        formatAppLog("log", "at pages/treehole_detail/treehole_detail.vue:135", "item", item);
        replyForItem.value = item;
        (_a = commentInputRef.value) == null ? void 0 : _a.focusInput();
      };
      const handleCommentSubmit = ({
        content,
        replyInfo,
        origin
      }) => {
        let token = uni.getStorageSync("token");
        if (!global$1.isLogin) {
          uni.showToast({
            title: "请先登录",
            icon: "none"
          });
          return;
        }
        formatAppLog("log", "at pages/treehole_detail/treehole_detail.vue:153", "reply_info", replyInfo);
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
                formatAppLog("log", "at pages/treehole_detail/treehole_detail.vue:178", "添加主评论");
                (_a = commentListRef.value) == null ? void 0 : _a.addNewComment(newComment);
              } else {
                formatAppLog("log", "at pages/treehole_detail/treehole_detail.vue:182", "添加子评论");
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
        if (!global$1.isLogin) {
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
            formatAppLog("log", "at pages/treehole_detail/treehole_detail.vue:276", res.data);
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
            formatAppLog("log", "at pages/treehole_detail/treehole_detail.vue:294", err);
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
        pageId.value = props.id;
        formatAppLog("log", "at pages/treehole_detail/treehole_detail.vue:360", "pageId", pageId.value);
        try {
          const res = await uni.request({
            url: `${websiteUrl}/treehole-detail?id=${props.id}`
          });
          if (res.data.status === "success") {
            detailData.value = res.data.data;
          }
        } catch (error2) {
          formatAppLog("log", "at pages/treehole_detail/treehole_detail.vue:371", error2);
          uni.showToast({
            title: "加载失败",
            icon: "none"
          });
        }
        asyncGetUserInfo();
        getHasLike();
      });
      const __returned__ = { loading, error, errorMsg, pageId, detailData, commentListRef, commentInputRef, get commentsPage() {
        return commentsPage;
      }, set commentsPage(v2) {
        commentsPage = v2;
      }, get replyForItem() {
        return replyForItem;
      }, set replyForItem(v2) {
        replyForItem = v2;
      }, hasLiked, props, handleReplyComment, handleCommentSubmit, copyUrl, handleLike, getHasLike, displayImages, remainingCount, showOverlay, formatTimestamp, layoutClass, formatTime, previewImage, ref: vue.ref, computed: vue.computed, onMounted: vue.onMounted, get websiteUrl() {
        return websiteUrl;
      }, get image1Url() {
        return image1Url;
      }, get global() {
        return global$1;
      }, get asyncGetUserInfo() {
        return asyncGetUserInfo;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$b(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_report_button = resolveEasycom(vue.resolveDynamicComponent("report-button"), __easycom_0$7);
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$b);
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
              ]),
              vue.createCommentVNode(" 举报按钮 "),
              vue.createElementVNode("view", { style: { "width": "120rpx" } }, [
                vue.createVNode(_component_report_button, {
                  "report-type": "3",
                  "relation-id": parseInt($setup.props.id),
                  "button-text": "举报",
                  "icon-type": "flag",
                  "icon-size": "24",
                  "icon-color": "#666"
                }, null, 8, ["relation-id"])
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
  const PagesTreeholeDetailTreeholeDetail = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["render", _sfc_render$b], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/treehole_detail/treehole_detail.vue"]]);
  const _sfc_main$b = {
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
        if (!validations.every((v2) => v2))
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
  function _sfc_render$a(_ctx, _cache, $props, $setup, $data, $options) {
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
  const PagesResetPasswordResetPassword = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["render", _sfc_render$a], ["__scopeId", "data-v-7140db85"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/reset_password/reset_password.vue"]]);
  const _sfc_main$a = {
    __name: "username",
    setup(__props, { expose: __expose }) {
      __expose();
      uni.setNavigationBarTitle({
        title: "修改用户名"
      });
      const username = vue.ref(global$1.userInfo.username || "");
      const isLoading = vue.ref(false);
      const isFormValid = vue.computed(() => {
        return username.value.length >= 2 && username.value !== global$1.userInfo.username;
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
        return global$1;
      }, get getUserInfo() {
        return getUserInfo;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$9(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$b);
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
  const PagesSettingUsernameUsername = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["render", _sfc_render$9], ["__scopeId", "data-v-ce7f77cb"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/setting/username/username.vue"]]);
  const _sfc_main$9 = {
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
            url = `/pages/sale_news/sale_news?id=${id}&brand_id=0`;
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
  function _sfc_render$8(_ctx, _cache, $props, $setup, $data, $options) {
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
  const PagesMyCommentMyComment = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["render", _sfc_render$8], ["__scopeId", "data-v-7fd39f53"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/my_comment/my_comment.vue"]]);
  const _imports_0 = "/static/images/loading.gif";
  const _sfc_main$8 = {
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
  function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
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
  const PagesMyCollocationMyCollocation = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$7], ["__scopeId", "data-v-c07e3656"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/my_collocation/my_collocation.vue"]]);
  const block0 = (Comp) => {
    (Comp.$wxs || (Comp.$wxs = [])).push("handler");
    (Comp.$wxsModules || (Comp.$wxsModules = {}))["handler"] = "2f992f8c";
  };
  const _sfc_main$7 = {
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
        let i2;
        for (i2 = this.childs.length; i2--; ) {
          if (this.childs[i2].name === "img")
            break;
        }
        if (i2 !== -1) {
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
      play(e2) {
        const i2 = e2.currentTarget.dataset.i;
        const node2 = this.childs[i2];
        this.root.$emit("play", {
          source: node2.name,
          attrs: {
            ...node2.attrs,
            src: node2.src[this.ctrl[i2] || 0]
          }
        });
      },
      /**
       * @description 图片点击事件
       * @param {Event} e
       */
      imgTap(e2) {
        const node2 = this.childs[e2.currentTarget.dataset.i];
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
      imgLongTap(e2) {
        const attrs = this.childs[e2.currentTarget.dataset.i].attrs;
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
      imgLoad(e2) {
        const i2 = e2.currentTarget.dataset.i;
        if (!this.childs[i2].w) {
          this.$set(this.ctrl, i2, e2.detail.width);
        } else if (this.opts[1] && !this.ctrl[i2] || this.ctrl[i2] === -1) {
          this.$set(this.ctrl, i2, 1);
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
      linkTap(e2) {
        const node2 = e2.currentTarget ? this.childs[e2.currentTarget.dataset.i] : {};
        const attrs = node2.attrs || e2;
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
      mediaError(e2) {
        const i2 = e2.currentTarget.dataset.i;
        const node2 = this.childs[i2];
        if (node2.name === "video" || node2.name === "audio") {
          let index = (this.ctrl[i2] || 0) + 1;
          if (index > node2.src.length) {
            index = 0;
          }
          if (index < node2.src.length) {
            this.$set(this.ctrl, i2, index);
            return;
          }
        } else if (node2.name === "img") {
          if (this.opts[2]) {
            this.$set(this.ctrl, i2, -1);
          }
          this.checkReady();
        }
        if (this.root) {
          this.root.$emit("error", {
            source: node2.name,
            attrs: node2.attrs,
            errMsg: e2.detail.errMsg
          });
        }
      }
    }
  };
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_node = vue.resolveComponent("node", true);
    return vue.openBlock(), vue.createElementBlock("view", {
      id: $props.attrs.id,
      class: vue.normalizeClass("_block _" + $props.name + " " + $props.attrs.class),
      style: vue.normalizeStyle($props.attrs.style)
    }, [
      (vue.openBlock(true), vue.createElementBlock(
        vue.Fragment,
        null,
        vue.renderList($props.childs, (n2, i2) => {
          return vue.openBlock(), vue.createElementBlock(
            vue.Fragment,
            { key: i2 },
            [
              vue.createCommentVNode(" 图片 "),
              vue.createCommentVNode(" 占位图 "),
              n2.name === "img" && !n2.t && ($props.opts[1] && !$data.ctrl[i2] || $data.ctrl[i2] < 0) ? (vue.openBlock(), vue.createElementBlock("image", {
                key: 0,
                class: "_img",
                style: vue.normalizeStyle(n2.attrs.style),
                src: $data.ctrl[i2] < 0 ? $props.opts[2] : $props.opts[1],
                mode: "widthFix"
              }, null, 12, ["src"])) : vue.createCommentVNode("v-if", true),
              vue.createCommentVNode(" 显示图片 "),
              vue.createCommentVNode(" 表格中的图片，使用 rich-text 防止大小不正确 "),
              n2.name === "img" && n2.t ? (vue.openBlock(), vue.createElementBlock("rich-text", {
                key: 1,
                style: vue.normalizeStyle("display:" + n2.t),
                nodes: [{ attrs: { style: n2.attrs.style || "", src: n2.attrs.src }, name: "img" }],
                "data-i": i2,
                onClick: _cache[0] || (_cache[0] = vue.withModifiers((...args) => $options.imgTap && $options.imgTap(...args), ["stop"]))
              }, null, 12, ["nodes", "data-i"])) : n2.name === "img" ? (vue.openBlock(), vue.createElementBlock("image", {
                key: 2,
                id: n2.attrs.id,
                class: vue.normalizeClass("_img " + n2.attrs.class),
                style: vue.normalizeStyle(($data.ctrl[i2] === -1 ? "display:none;" : "") + "width:" + ($data.ctrl[i2] || 1) + "px;" + n2.attrs.style),
                src: n2.attrs.src || ($data.ctrl.load ? n2.attrs["data-src"] : ""),
                mode: !n2.h ? "widthFix" : !n2.w ? "heightFix" : n2.m || "",
                "data-i": i2,
                onLoad: _cache[1] || (_cache[1] = (...args) => $options.imgLoad && $options.imgLoad(...args)),
                onError: _cache[2] || (_cache[2] = (...args) => $options.mediaError && $options.mediaError(...args)),
                onClick: _cache[3] || (_cache[3] = vue.withModifiers((...args) => $options.imgTap && $options.imgTap(...args), ["stop"])),
                onLongpress: _cache[4] || (_cache[4] = (...args) => $options.imgLongTap && $options.imgLongTap(...args))
              }, null, 46, ["id", "src", "mode", "data-i"])) : n2.text ? (vue.openBlock(), vue.createElementBlock(
                vue.Fragment,
                { key: 3 },
                [
                  vue.createCommentVNode(" 文本 "),
                  vue.createElementVNode(
                    "text",
                    { decode: "" },
                    vue.toDisplayString(n2.text),
                    1
                    /* TEXT */
                  )
                ],
                2112
                /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
              )) : n2.name === "br" ? (vue.openBlock(), vue.createElementBlock("text", { key: 4 }, "\\n")) : n2.name === "a" ? (vue.openBlock(), vue.createElementBlock(
                vue.Fragment,
                { key: 5 },
                [
                  vue.createCommentVNode(" 链接 "),
                  vue.createElementVNode("view", {
                    id: n2.attrs.id,
                    class: vue.normalizeClass((n2.attrs.href ? "_a " : "") + n2.attrs.class),
                    "hover-class": "_hover",
                    style: vue.normalizeStyle("display:inline;" + n2.attrs.style),
                    "data-i": i2,
                    onClick: _cache[5] || (_cache[5] = vue.withModifiers((...args) => $options.linkTap && $options.linkTap(...args), ["stop"]))
                  }, [
                    vue.createVNode(_component_node, {
                      name: "span",
                      childs: n2.children,
                      opts: $props.opts,
                      style: { "display": "inherit" }
                    }, null, 8, ["childs", "opts"])
                  ], 14, ["id", "data-i"])
                ],
                2112
                /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
              )) : n2.html ? (vue.openBlock(), vue.createElementBlock(
                vue.Fragment,
                { key: 6 },
                [
                  vue.createCommentVNode(" 视频 "),
                  vue.createElementVNode("view", {
                    id: n2.attrs.id,
                    class: vue.normalizeClass("_video " + n2.attrs.class),
                    style: vue.normalizeStyle(n2.attrs.style),
                    innerHTML: n2.html,
                    "data-i": i2,
                    onVplay: _cache[6] || (_cache[6] = vue.withModifiers((...args) => $options.play && $options.play(...args), ["stop"]))
                  }, null, 46, ["id", "innerHTML", "data-i"])
                ],
                2112
                /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
              )) : n2.name === "iframe" ? (vue.openBlock(), vue.createElementBlock("iframe", {
                key: 7,
                style: vue.normalizeStyle(n2.attrs.style),
                allowfullscreen: n2.attrs.allowfullscreen,
                frameborder: n2.attrs.frameborder,
                src: n2.attrs.src
              }, null, 12, ["allowfullscreen", "frameborder", "src"])) : n2.name === "embed" ? (vue.openBlock(), vue.createElementBlock("embed", {
                key: 8,
                style: vue.normalizeStyle(n2.attrs.style),
                src: n2.attrs.src
              }, null, 12, ["src"])) : n2.name === "table" && n2.c || n2.name === "li" ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 9,
                id: n2.attrs.id,
                class: vue.normalizeClass("_" + n2.name + " " + n2.attrs.class),
                style: vue.normalizeStyle(n2.attrs.style)
              }, [
                n2.name === "li" ? (vue.openBlock(), vue.createBlock(_component_node, {
                  key: 0,
                  childs: n2.children,
                  opts: $props.opts
                }, null, 8, ["childs", "opts"])) : (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  { key: 1 },
                  vue.renderList(n2.children, (tbody, x) => {
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
                          vue.renderList(tbody.children, (tr2, y2) => {
                            return vue.openBlock(), vue.createElementBlock(
                              vue.Fragment,
                              { key: y2 },
                              [
                                tr2.name === "td" || tr2.name === "th" ? (vue.openBlock(), vue.createElementBlock(
                                  "view",
                                  {
                                    key: 0,
                                    class: vue.normalizeClass("_" + tr2.name + " " + tr2.attrs.class),
                                    style: vue.normalizeStyle(tr2.attrs.style)
                                  },
                                  [
                                    vue.createVNode(_component_node, {
                                      childs: tr2.children,
                                      opts: $props.opts
                                    }, null, 8, ["childs", "opts"])
                                  ],
                                  6
                                  /* CLASS, STYLE */
                                )) : (vue.openBlock(), vue.createElementBlock(
                                  "view",
                                  {
                                    key: 1,
                                    class: vue.normalizeClass("_" + tr2.name + " " + tr2.attrs.class),
                                    style: vue.normalizeStyle(tr2.attrs.style)
                                  },
                                  [
                                    (vue.openBlock(true), vue.createElementBlock(
                                      vue.Fragment,
                                      null,
                                      vue.renderList(tr2.children, (td, z2) => {
                                        return vue.openBlock(), vue.createElementBlock(
                                          "view",
                                          {
                                            key: z2,
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
              ], 14, ["id"])) : !n2.c ? (vue.openBlock(), vue.createElementBlock(
                vue.Fragment,
                { key: 10 },
                [
                  vue.createCommentVNode(" 富文本 "),
                  vue.createElementVNode("rich-text", {
                    id: n2.attrs.id,
                    style: vue.normalizeStyle("display:inline;" + n2.f),
                    preview: false,
                    selectable: $props.opts[4],
                    "user-select": $props.opts[4],
                    nodes: [n2]
                  }, null, 12, ["id", "selectable", "user-select", "nodes"])
                ],
                2112
                /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
              )) : n2.c === 2 ? (vue.openBlock(), vue.createElementBlock(
                vue.Fragment,
                { key: 11 },
                [
                  vue.createCommentVNode(" 继续递归 "),
                  vue.createElementVNode("view", {
                    id: n2.attrs.id,
                    class: vue.normalizeClass("_block _" + n2.name + " " + n2.attrs.class),
                    style: vue.normalizeStyle(n2.f + ";" + n2.attrs.style)
                  }, [
                    (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList(n2.children, (n22, j2) => {
                        return vue.openBlock(), vue.createBlock(_component_node, {
                          key: j2,
                          style: vue.normalizeStyle(n22.f),
                          name: n22.name,
                          attrs: n22.attrs,
                          childs: n22.children,
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
                style: vue.normalizeStyle(n2.f),
                name: n2.name,
                attrs: n2.attrs,
                childs: n2.children,
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
    block0(_sfc_main$7);
  const node = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$6], ["__scopeId", "data-v-8845ff2f"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/uni_modules/mp-html/components/mp-html/node/node.vue"]]);
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
    for (let i2 = list.length; i2--; ) {
      map[list[i2]] = true;
    }
    return map;
  }
  function decodeEntity(str, amp) {
    let i2 = str.indexOf("&");
    while (i2 !== -1) {
      const j2 = str.indexOf(";", i2 + 3);
      let code;
      if (j2 === -1)
        break;
      if (str[i2 + 1] === "#") {
        code = parseInt((str[i2 + 2] === "x" ? "0" : "") + str.substring(i2 + 2, j2));
        if (!isNaN(code)) {
          str = str.substr(0, i2) + String.fromCharCode(code) + str.substr(j2 + 1);
        }
      } else {
        code = str.substring(i2 + 1, j2);
        if (config.entities[code] || code === "amp" && amp) {
          str = str.substr(0, i2) + (config.entities[code] || "&") + str.substr(j2 + 1);
        }
      }
      i2 = str.indexOf("&", i2 + 1);
    }
    return str;
  }
  function mergeNodes(nodes) {
    let i2 = nodes.length - 1;
    for (let j2 = i2; j2 >= -1; j2--) {
      if (j2 === -1 || nodes[j2].c || !nodes[j2].name || nodes[j2].name !== "div" && nodes[j2].name !== "p" && nodes[j2].name[0] !== "h" || (nodes[j2].attrs.style || "").includes("inline")) {
        if (i2 - j2 >= 5) {
          nodes.splice(j2 + 1, i2 - j2, {
            name: "div",
            attrs: {},
            children: nodes.slice(j2 + 1, i2 + 1)
          });
        }
        i2 = j2 - 1;
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
    for (let i2 = this.plugins.length; i2--; ) {
      if (this.plugins[i2].onUpdate) {
        content = this.plugins[i2].onUpdate(content, config) || content;
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
    for (let i2 = this.stack.length; i2--; ) {
      const item = this.stack[i2];
      if (item.c || item.name === "a" || item.name === "video" || item.name === "audio")
        return;
      item.c = 1;
    }
  };
  Parser.prototype.hook = function(node2) {
    for (let i2 = this.plugins.length; i2--; ) {
      if (this.plugins[i2].onParse && this.plugins[i2].onParse(node2, this) === false) {
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
    for (let i2 = 0, len = list.length; i2 < len; i2++) {
      const info = list[i2].split(":");
      if (info.length < 2)
        continue;
      const key = info.shift().trim().toLowerCase();
      let value = info.join(":").trim();
      if (value[0] === "-" && value.lastIndexOf("-") > 0 || value.includes("safe")) {
        tmp += `;${key}:${value}`;
      } else if (!styleObj[key] || value.includes("import") || !styleObj[key].includes("import")) {
        if (value.includes("url")) {
          let j2 = value.indexOf("(") + 1;
          if (j2) {
            while (value[j2] === '"' || value[j2] === "'" || blankChar[value[j2]]) {
              j2++;
            }
            value = value.substr(0, j2) + this.getUrl(value.substr(j2));
          }
        } else if (value.includes("rpx")) {
          value = value.replace(/[0-9.]+\s*rpx/g, ($2) => parseFloat($2) * windowWidth / 750 + "px");
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
            for (let i2 = this.stack.length; i2--; ) {
              const item = this.stack[i2];
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
    let i2;
    for (i2 = this.stack.length; i2--; ) {
      if (this.stack[i2].name === name)
        break;
    }
    if (i2 !== -1) {
      while (this.stack.length > i2) {
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
      for (let i2 = this.stack.length; i2--; ) {
        if (this.stack[i2].pre) {
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
          for (let i2 = 0; i2 < node3.children.length; i2++) {
            traversal(node3.children[i2]);
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
      for (let i2 = 0; i2 < node2.src.length; i2++) {
        str += '<source src="' + node2.src[i2] + '">';
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
      for (let i2 = children.length; i2--; ) {
        if (children[i2].name === "li") {
          children[i2].c = 1;
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
          for (let i2 = 0; i2 < nodes.length; i2++) {
            if (nodes[i2].name === "tr") {
              trList.push(nodes[i2]);
            } else if (nodes[i2].name === "colgroup") {
              let colI = 1;
              for (const col of nodes[i2].children || []) {
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
              traversal(nodes[i2].children || []);
            }
          }
        })(children);
        for (let row = 1; row <= trList.length; row++) {
          let col = 1;
          for (let j2 = 0; j2 < trList[row - 1].children.length; j2++) {
            const td = trList[row - 1].children[j2];
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
            for (let i2 = 1; i2 < col; i2++) {
              temp += (width[i2] ? width[i2] : "auto") + " ";
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
            for (let i2 = 0; i2 < nodes.length; i2++) {
              const td = nodes[i2];
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
        for (let i2 = 0; i2 < nodes.length; i2++) {
          if (nodes[i2].name === "td") {
            for (const style of ["color", "background", "background-color"]) {
              if (styleObj[style]) {
                nodes[i2].attrs.style = style + ":" + styleObj[style] + ";" + (nodes[i2].attrs.style || "");
              }
            }
          } else {
            traversal(nodes[i2].children || []);
          }
        }
      })(children);
    } else if ((node2.name === "td" || node2.name === "th") && (attrs.colspan || attrs.rowspan)) {
      for (let i2 = this.stack.length; i2--; ) {
        if (this.stack[i2].name === "table" || this.stack[i2].name === "tbody" || this.stack[i2].name === "tr") {
          this.stack[i2].flag = 1;
        }
      }
    } else if (node2.name === "ruby") {
      node2.name = "span";
      for (let i2 = 0; i2 < children.length - 1; i2++) {
        if (children[i2].type === "text" && children[i2 + 1].name === "rt") {
          children[i2] = {
            name: "div",
            attrs: {
              style: "display:inline-block;text-align:center"
            },
            children: [{
              name: "div",
              attrs: {
                style: "font-size:50%;" + (children[i2 + 1].attrs.style || "")
              },
              children: children[i2 + 1].children
            }, children[i2]]
          };
          children.splice(i2 + 1, 1);
        }
      }
    } else if (node2.c) {
      (function traversal(node3) {
        node3.c = 2;
        for (let i2 = node3.children.length; i2--; ) {
          const child = node3.children[i2];
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
      for (let i2 = children.length; i2--; ) {
        const item = children[i2];
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
      for (let i2 = 0, len = text.length; i2 < len; i2++) {
        if (!blankChar[text[i2]]) {
          trim += text[i2];
        } else {
          if (trim[trim.length - 1] !== " ") {
            trim += " ";
          }
          if (text[i2] === "\n" && !flag) {
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
    const c2 = this.content[this.i + 1];
    if (c2 >= "a" && c2 <= "z" || c2 >= "A" && c2 <= "Z") {
      if (this.start !== this.i) {
        this.handler.onText(this.content.substring(this.start, this.i));
      }
      this.start = ++this.i;
      this.state = this.tagName;
    } else if (c2 === "/" || c2 === "!" || c2 === "?") {
      if (this.start !== this.i) {
        this.handler.onText(this.content.substring(this.start, this.i));
      }
      const next = this.content[this.i + 2];
      if (c2 === "/" && (next >= "a" && next <= "z" || next >= "A" && next <= "Z")) {
        this.i += 2;
        this.start = this.i;
        this.state = this.endTag;
        return;
      }
      let end = "-->";
      if (c2 !== "!" || this.content[this.i + 2] !== "-" || this.content[this.i + 3] !== "-") {
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
    let c2 = this.content[this.i];
    if (blankChar[c2] || c2 === "=") {
      this.handler.onAttrName(this.content.substring(this.start, this.i));
      let needVal = c2 === "=";
      const len = this.content.length;
      while (++this.i < len) {
        c2 = this.content[this.i];
        if (!blankChar[c2]) {
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
    const c2 = this.content[this.i];
    const len = this.content.length;
    if (c2 === '"' || c2 === "'") {
      this.start = ++this.i;
      this.i = this.content.indexOf(c2, this.i);
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
    const c2 = this.content[this.i];
    if (blankChar[c2] || c2 === ">" || c2 === "/") {
      this.handler.onCloseTag(this.content.substring(this.start, this.i));
      if (c2 !== ">") {
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
  const _sfc_main$6 = {
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
      for (let i2 = plugins.length; i2--; ) {
        this.plugins.push(new plugins[i2](this));
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
          for (let i2 = 0; i2 < nodes2.length; i2++) {
            const node2 = nodes2[i2];
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
        for (let i2 = (this._videos || []).length; i2--; ) {
          this._videos[i2].pause();
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
        for (let i2 = (this._videos || []).length; i2--; ) {
          this._videos[i2].playbackRate(rate);
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
        for (let i2 = plugins.length; i2--; ) {
          if (this.plugins[i2][name]) {
            this.plugins[i2][name]();
          }
        }
      }
    }
  };
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
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
  const __easycom_0$1 = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$5], ["__scopeId", "data-v-a290f043"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/uni_modules/mp-html/components/mp-html/mp-html.vue"]]);
  const _sfc_main$5 = {
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
        if (global$1.isLogin)
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
        return global$1;
      }, get asyncGetUserInfo() {
        return asyncGetUserInfo;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_mp_html = resolveEasycom(vue.resolveDynamicComponent("mp-html"), __easycom_0$1);
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
  const PagesArticleDetailArticleDetail = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__scopeId", "data-v-55f34774"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/article_detail/article_detail.vue"]]);
  const _sfc_main$4 = {
    props: {
      // 下拉刷新阈值（触发刷新的高度）
      threshold: {
        type: Number,
        default: 150
      },
      // 滚动区域高度
      scrollHeight: {
        type: String,
        default: "100vh"
      }
    },
    data() {
      return {
        triggered: false,
        // 是否触发刷新
        // 下拉时显示的静态图片
        pullDownGif: "https://images1.fantuanpu.com/home/f4a2f2a997e45b87bfce23edc794d9a6.gif",
        // 刷新中显示的动态GIF
        refreshingGif: "https://images1.fantuanpu.com/home/f4a2f2a997e45b87bfce23edc794d9a6.gif",
        refreshText: "下拉刷新"
        // 提示文字
      };
    },
    methods: {
      // 触发刷新
      onRefresh() {
        this.triggered = true;
        this.refreshText = "正在刷新...";
        this.$emit("refresh");
      },
      // 刷新完成
      finishRefresh() {
        this.triggered = false;
        this.refreshText = "刷新完成";
        setTimeout(() => {
          this.refreshText = "下拉刷新";
        }, 800);
      },
      // 下拉状态恢复
      onRestore() {
        this.refreshText = "下拉刷新";
      },
      // 刷新中断
      onAbort() {
        this.refreshText = "刷新取消";
      }
    }
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      vue.Fragment,
      null,
      [
        vue.createCommentVNode(" 添加根元素包裹 "),
        vue.createElementVNode("view", null, [
          vue.createElementVNode("scroll-view", {
            "scroll-y": "",
            "refresher-default-style": "none",
            "refresher-enabled": true,
            "refresher-triggered": $data.triggered,
            "refresher-threshold": $props.threshold,
            "refresher-background": "#f8f8f8",
            onRefresherrefresh: _cache[0] || (_cache[0] = (...args) => $options.onRefresh && $options.onRefresh(...args)),
            onRefresherrestore: _cache[1] || (_cache[1] = (...args) => $options.onRestore && $options.onRestore(...args)),
            onRefresherabort: _cache[2] || (_cache[2] = (...args) => $options.onAbort && $options.onAbort(...args)),
            style: vue.normalizeStyle({ height: $props.scrollHeight }),
            class: "scroll-view"
          }, [
            vue.createCommentVNode(" 使用Vue 2兼容的插槽语法 "),
            vue.createElementVNode(
              "view",
              {
                slot: "refresher",
                class: "refresh-container",
                style: vue.normalizeStyle({ height: `${$props.threshold}px` })
              },
              [
                vue.createElementVNode(
                  "view",
                  {
                    class: vue.normalizeClass(["refresh-content", { refreshing: $data.triggered }])
                  },
                  [
                    vue.createElementVNode("image", {
                      class: "refresh-icon",
                      src: $data.triggered ? $data.refreshingGif : $data.pullDownGif,
                      mode: "aspectFit"
                    }, null, 8, ["src"]),
                    vue.createElementVNode(
                      "text",
                      { class: "refresh-text" },
                      vue.toDisplayString($data.refreshText),
                      1
                      /* TEXT */
                    )
                  ],
                  2
                  /* CLASS */
                )
              ],
              4
              /* STYLE */
            ),
            vue.createCommentVNode(" 内容区域 "),
            vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
          ], 44, ["refresher-triggered", "refresher-threshold"])
        ])
      ],
      2112
      /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
    );
  }
  const __easycom_0 = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__scopeId", "data-v-a113cad1"], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/components/comment-loadding/comment-loadding.vue"]]);
  const _sfc_main$3 = {
    data() {
      return {
        statusBarHeight: 0,
        dataList: [
          {
            id: 1,
            name: "张三",
            content: "今天天气真不错，适合户外运动！",
            time: "10:30",
            avatar: "https://randomuser.me/api/portraits/men/1.jpg"
          },
          {
            id: 2,
            name: "李四",
            content: "刚刚完成了一个重要的项目，庆祝一下！",
            time: "09:15",
            avatar: "https://randomuser.me/api/portraits/women/2.jpg"
          },
          {
            id: 3,
            name: "王五",
            content: "学习新技能真的很有成就感，继续加油！",
            time: "昨天 18:20",
            avatar: "https://randomuser.me/api/portraits/men/3.jpg"
          },
          {
            id: 4,
            name: "赵六",
            content: "分享一张今天拍的美景照片，大自然真神奇！",
            time: "昨天 16:45",
            avatar: "https://randomuser.me/api/portraits/women/4.jpg"
          },
          {
            id: 5,
            name: "钱七",
            content: "尝试了新的菜谱，味道超级棒！",
            time: "昨天 14:30",
            avatar: "https://randomuser.me/api/portraits/men/5.jpg"
          }
        ]
      };
    },
    onLoad() {
      const systemInfo2 = uni.getSystemInfoSync();
      this.statusBarHeight = systemInfo2.statusBarHeight;
    },
    methods: {
      handleRefresh() {
        setTimeout(() => {
          const newItem = {
            id: this.dataList.length + 1,
            name: `新用户${this.dataList.length + 1}`,
            content: `这是新刷出的内容 #${this.dataList.length + 1}`,
            time: "刚刚",
            avatar: `https://randomuser.me/api/portraits/${this.dataList.length % 2 === 0 ? "men" : "women"}/${this.dataList.length + 1}.jpg`
          };
          this.dataList.unshift(newItem);
          this.$refs.refresh.finishRefresh();
        }, 1500);
      }
    }
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_comment_loadding = resolveEasycom(vue.resolveDynamicComponent("comment-loadding"), __easycom_0);
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createVNode(_component_comment_loadding, {
        ref: "refresh",
        onRefresh: $options.handleRefresh,
        scrollHeight: `calc(100vh - ${$data.statusBarHeight}px)`
      }, {
        default: vue.withCtx(() => [
          vue.createElementVNode("view", { class: "content" }, [
            vue.createElementVNode("view", { class: "header" }, [
              vue.createElementVNode("text", { class: "title" }, "自定义下拉刷新演示")
            ]),
            vue.createElementVNode("view", { class: "card-list" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.dataList, (item, index) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    key: index,
                    class: "card"
                  }, [
                    vue.createElementVNode("view", { class: "card-header" }, [
                      vue.createElementVNode("image", {
                        class: "avatar",
                        src: item.avatar,
                        mode: "aspectFill"
                      }, null, 8, ["src"]),
                      vue.createElementVNode(
                        "text",
                        { class: "name" },
                        vue.toDisplayString(item.name),
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode(
                      "text",
                      { class: "card-content" },
                      vue.toDisplayString(item.content),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "card-time" },
                      vue.toDisplayString(item.time),
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
        ]),
        _: 1
        /* STABLE */
      }, 8, ["onRefresh", "scrollHeight"])
    ]);
  }
  const PagesLoaddingLoadding = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/loadding/loadding.vue"]]);
  const _sfc_main$2 = {
    __name: "private",
    setup(__props, { expose: __expose }) {
      __expose();
      uni.setNavigationBarTitle({
        title: "隐私政策"
      });
      const __returned__ = {};
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", null, [
      vue.createElementVNode("view", { class: "container" }, [
        vue.createElementVNode("view", { class: "content" }, [
          vue.createElementVNode("view", { class: "section" }, [
            vue.createElementVNode("h2", { class: "section-title" }, [
              vue.createElementVNode("i", { class: "fas fa-info-circle" }),
              vue.createTextVNode(" 引言")
            ]),
            vue.createElementVNode("text", { class: "policy-text" }, "本应用尊重并保护所有使用服务用户的个人隐私权。"),
            vue.createElementVNode("text", { class: "policy-text" }, "为了给您提供更准确、更有个性化的服务，本应用会按照本隐私权政策的规定使用和披露您的个人信息。"),
            vue.createElementVNode("text", { class: "policy-text" }, "但本应用将以高度的勤勉、审慎义务对待这些信息。"),
            vue.createElementVNode("text", { class: "policy-text" }, "除本隐私权政策另有规定外，在未征得您事先许可的情况下，本应用不会将这些信息对外披露或向第三方提供。"),
            vue.createElementVNode("text", { class: "policy-text" }, "本应用会不时更新本隐私权政策。"),
            vue.createElementVNode("text", { class: "policy-text" }, "您在同意本应用服务使用协议之时，即视为您已经同意本隐私权政策全部内容。"),
            vue.createElementVNode("text", { class: "policy-text" }, "本隐私权政策属于本应用服务使用协议不可分割的一部分。")
          ]),
          vue.createElementVNode("view", { class: "section" }, [
            vue.createElementVNode("h2", { class: "section-title" }, [
              vue.createElementVNode("i", { class: "fas fa-globe" }),
              vue.createTextVNode(" 1. 适用范围")
            ]),
            vue.createElementVNode("text", { class: "policy-text" }, "(a) 在您注册本应用帐号时，您根据本应用要求提供的个人注册信息；"),
            vue.createElementVNode("text", { class: "policy-text" }, "(b) 在您使用本应用网络服务，或访问本应用平台网页时，本应用自动接收并记录的您的浏览器和计算机上的信息，包括但不限于您的IP地址、浏览器的类型、使用的语言、访问日期和时间、软硬件特征信息及您需求的网页记录等数据；"),
            vue.createElementVNode("text", { class: "policy-text" }, "(c) 本应用通过合法途径从商业伙伴处取得的用户个人数据。"),
            vue.createElementVNode("text", { class: "policy-text" }, "您了解并同意，以下信息不适用本隐私权政策："),
            vue.createElementVNode("text", { class: "policy-text" }, "(a) 您在使用本应用平台提供的搜索服务时输入的关键字信息；"),
            vue.createElementVNode("text", { class: "policy-text" }, "(b) 本应用收集到的您在本应用发布的有关信息数据，包括但不限于参与活动、成交信息及评价详情；"),
            vue.createElementVNode("text", { class: "policy-text" }, "(c) 违反法律规定或违反本应用规则行为及本应用已对您采取的措施。")
          ]),
          vue.createElementVNode("view", { class: "section" }, [
            vue.createElementVNode("h2", { class: "section-title" }, [
              vue.createElementVNode("i", { class: "fas fa-cogs" }),
              vue.createTextVNode(" 2. 信息使用")
            ]),
            vue.createElementVNode("text", { class: "policy-text" }, "(a)本应用不会向任何无关第三方提供、出售、出租、分享或交易您的个人信息，除非事先得到您的许可，或该第三方和本应用（含本应用关联公司）单独或共同为您提供服务，且在该服务结束后，其将被禁止访问包括其以前能够访问的所有这些资料。"),
            vue.createElementVNode("text", { class: "policy-text" }, "(b) 本应用亦不允许任何第三方以任何手段收集、编辑、出售或者无偿传播您的个人信息。任何本应用平台用户如从事上述活动，一经发现，本应用有权立即终止与该用户的服务协议。"),
            vue.createElementVNode("text", { class: "policy-text" }, "(c) 为服务用户的目的，本应用可能通过使用您的个人信息，向您提供您感兴趣的信息，包括但不限于向您发出产品和服务信息，或者与本应用合作伙伴共享信息以便他们向您发送有关其产品和服务的信息（后者需要您的事先同意）。")
          ]),
          vue.createElementVNode("view", { class: "section" }, [
            vue.createElementVNode("h2", { class: "section-title" }, [
              vue.createElementVNode("i", { class: "fas fa-shield-alt" }),
              vue.createTextVNode(" 3. 信息披露")
            ]),
            vue.createElementVNode("text", { class: "policy-text" }, "在如下情况下，本应用将依据您的个人意愿或法律的规定全部或部分的披露您的个人信息："),
            vue.createElementVNode("text", { class: "policy-text" }, "(a) 经您事先同意，向第三方披露；"),
            vue.createElementVNode("text", { class: "policy-text" }, "(b)为提供您所要求的产品和服务，而必须和第三方分享您的个人信息；"),
            vue.createElementVNode("text", { class: "policy-text" }, "(c) 根据法律的有关规定，或者行政或司法机构的要求，向第三方或者行政、司法机构披露；"),
            vue.createElementVNode("text", { class: "policy-text" }, "(d) 如您出现违反中国有关法律、法规或者本应用服务协议或相关规则的情况，需要向第三方披露；"),
            vue.createElementVNode("text", { class: "policy-text" }, "(e) 如您是适格的知识产权投诉人并已提起投诉，应被投诉人要求，向被投诉人披露，以便双方处理可能的权利纠纷；"),
            vue.createElementVNode("text", { class: "policy-text" }, "(f) 在本应用平台上创建的某一交易中，如交易任何一方履行或部分履行了交易义务并提出信息披露请求的，本应用有权决定向该用户提供其交易对方的联络方式等必要信息，以促成交易的完成或纠纷的解决。"),
            vue.createElementVNode("text", { class: "policy-text" }, "(g) 其它本应用根据法律、法规或者网站政策认为合适的披露。")
          ]),
          vue.createElementVNode("view", { class: "section" }, [
            vue.createElementVNode("h2", { class: "section-title" }, [
              vue.createElementVNode("i", { class: "fas fa-database" }),
              vue.createTextVNode(" 4. 信息存储和交换")
            ]),
            vue.createElementVNode("text", { class: "policy-text" }, "本应用收集的有关您的信息和资料将保存在本应用及（或）其关联公司的服务器上，这些信息和资料可能传送至您所在国家、地区或本应用收集信息和资料所在地的境外并在境外被访问、存储和展示。")
          ]),
          vue.createElementVNode("view", { class: "section" }, [
            vue.createElementVNode("h2", { class: "section-title" }, [
              vue.createElementVNode("i", { class: "fas fa-cookie" }),
              vue.createTextVNode(" 5. Cookie的使用")
            ]),
            vue.createElementVNode("text", { class: "policy-text" }, "(a) 在您未拒绝接受cookies的情况下，本应用会在您的计算机上设定或取用cookies ，以便您能登录或使用依赖于cookies的本应用平台服务或功能。本应用使用cookies可为您提供更加周到的个性化服务，包括推广服务。"),
            vue.createElementVNode("text", { class: "policy-text" }, "(b) 您有权选择接受或拒绝接受cookies。您可以通过修改浏览器设置的方式拒绝接受cookies。但如果您选择拒绝接受cookies，则您可能无法登录或使用依赖于cookies的本应用网络服务或功能。"),
            vue.createElementVNode("text", { class: "policy-text" }, "(c) 通过本应用所设cookies所取得的有关信息，将适用本政策。")
          ]),
          vue.createElementVNode("view", { class: "section" }, [
            vue.createElementVNode("h2", { class: "section-title" }, [
              vue.createElementVNode("i", { class: "fas fa-lock" }),
              vue.createTextVNode(" 6. 信息安全")
            ]),
            vue.createElementVNode("text", { class: "policy-text" }, "(a) 本应用帐号均有安全保护功能，请妥善保管您的用户名及密码信息。本应用将通过对用户密码进行加密等安全措施确保您的信息不丢失，不被滥用和变造。尽管有前述安全措施，但同时也请您注意在信息网络上不存在“完善的安全措施”。"),
            vue.createElementVNode("text", { class: "policy-text" }, "(b) 在使用本应用网络服务进行网上交易时，您不可避免的要向交易对方或潜在的交易对方披露自己的个人信息，如联络方式或者邮政地址。请您妥善保护自己的个人信息，仅在必要的情形下向他人提供。如您发现自己的个人信息泄密，尤其是本应用用户名及密码发生泄露，请您立即联络本应用客服，以便本应用采取相应措施。")
          ]),
          vue.createElementVNode("view", { class: "section" }, [
            vue.createElementVNode("h2", { class: "section-title" }, [
              vue.createElementVNode("i", { class: "fas fa-sync-alt" }),
              vue.createTextVNode(" 7. 本隐私政策的更改")
            ]),
            vue.createElementVNode("text", { class: "policy-text" }, "(a)如果决定更改隐私政策，我们会在本政策中、本公司网站中以及我们认为适当的位置发布这些更改，以便您了解我们如何收集、使用您的个人信息，哪些人可以访问这些信息，以及在什么情况下我们会透露这些信息。"),
            vue.createElementVNode("text", { class: "policy-text" }, "(b)本公司保留随时修改本政策的权利，因此请经常查看。如对本政策作出重大更改，本公司会通过网站通知的形式告知。")
          ]),
          vue.createElementVNode("view", { class: "last-update" }, [
            vue.createElementVNode("text", { class: "policy-text" }, [
              vue.createElementVNode("i", { class: "fas fa-exclamation-circle" }),
              vue.createTextVNode(" 重要提示：请您妥善保护自己的个人信息，仅在必要的情形下向他人提供。如您发现自己的个人信息泄密，尤其是本应用用户名及密码发生泄露，请您立即联络本应用客服，以便本应用采取相应措施。")
            ])
          ])
        ])
      ])
    ]);
  }
  const PagesPrivatePrivate = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/private/private.vue"]]);
  const _sfc_main$1 = {
    __name: "permission",
    setup(__props, { expose: __expose }) {
      __expose();
      vue.onMounted(() => {
        uni.setNavigationBarTitle({
          title: "用户协议"
        });
      });
      const __returned__ = { onMounted: vue.onMounted };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "content" }, [
        vue.createElementVNode("view", { class: "section" }, [
          vue.createElementVNode("text", { class: "section-title" }, "数据保护条款"),
          vue.createElementVNode("view", { class: "permission-item" }, [
            vue.createElementVNode("text", { class: "permission-text" }, "严格禁止任何未经授权的的人工转载、复制或传播平台内容")
          ]),
          vue.createElementVNode("view", { class: "permission-item" }, [
            vue.createElementVNode("text", { class: "permission-text" }, "未经授权禁止使用爬虫工具获取平台数据")
          ]),
          vue.createElementVNode("view", { class: "permission-item" }, [
            vue.createElementVNode("text", { class: "permission-text" }, "所有用户生成内容均受版权保护，未经授权不得使用")
          ]),
          vue.createElementVNode("view", { class: "permission-item" }, [
            vue.createElementVNode("text", { class: "permission-text" }, "我们部署了反爬虫系统，实时监控数据访问行为")
          ]),
          vue.createElementVNode("view", { class: "permission-item" }, [
            vue.createElementVNode("text", { class: "permission-text" }, "我们保留对侵权行为采取法律手段的权利")
          ])
        ]),
        vue.createElementVNode("view", { class: "section" }, [
          vue.createElementVNode("text", { class: "section-title" }, "用户行为规范与内容管理"),
          vue.createElementVNode("view", { class: "permission-item" }, [
            vue.createElementVNode("text", { class: "permission-text" }, " 您在使用本应用过程中所发布的任何文字、图片、音视频、评论等内容，均需遵守相关法律法规及本协议的约定，不得包含以下内容（包括但不限于）： 淫秽、暴力、威胁、骚扰、辱骂、恐吓、恶意中伤他人； 散布谣言、虚假信息、诈骗、钓鱼链接； 仇恨言论、歧视性言论或可能引发社会不安的内容； 其他违反法律法规、社会公序良俗或平台管理规范的内容。 ")
          ]),
          vue.createElementVNode("view", { class: "permission-item" }, [
            vue.createElementVNode("text", { class: "permission-text" }, "我们对不良内容和滥用行为采取“零容忍”政策，包括但不限于恶意骚扰、辱骂他人、发送垃圾内容、冒充他人等。一经发现，我们有权立即删除相关内容，并封禁发布者账号，且无需另行通知。")
          ]),
          vue.createElementVNode("view", { class: "permission-item" }, [
            vue.createElementVNode("text", { class: "permission-text" }, "用户可通过本应用提供的“举报”功能对不良信息进行举报，我们将在 24 小时内处理并视情况采取禁言、删除、封号等措施。")
          ])
        ]),
        vue.createElementVNode("view", { class: "section" }, [
          vue.createElementVNode("text", { class: "section-title" }, "相机权限"),
          vue.createElementVNode("view", { class: "permission-item" }, [
            vue.createElementVNode("text", { class: "permission-text" }, "• 用于扫描二维码、拍摄照片与上传图片")
          ]),
          vue.createElementVNode("view", { class: "permission-item" }, [
            vue.createElementVNode("text", { class: "permission-text" }, "• 仅在您主动使用拍照功能时申请")
          ]),
          vue.createElementVNode("view", { class: "permission-item" }, [
            vue.createElementVNode("text", { class: "permission-text" }, "• 不会在后台访问您的相机")
          ])
        ]),
        vue.createElementVNode("view", { class: "section" }, [
          vue.createElementVNode("text", { class: "section-title" }, "位置权限"),
          vue.createElementVNode("view", { class: "permission-item" }, [
            vue.createElementVNode("text", { class: "permission-text" }, "• 用于查找附近的娃店")
          ]),
          vue.createElementVNode("view", { class: "permission-item" }, [
            vue.createElementVNode("text", { class: "permission-text" }, "• 仅在您使用基于位置的服务时申请")
          ]),
          vue.createElementVNode("view", { class: "permission-item" }, [
            vue.createElementVNode("text", { class: "permission-text" }, "• 您可以随时在系统设置中关闭此权限")
          ])
        ]),
        vue.createElementVNode("view", { class: "section" }, [
          vue.createElementVNode("text", { class: "section-title" }, "通知权限"),
          vue.createElementVNode("view", { class: "permission-item" }, [
            vue.createElementVNode("text", { class: "permission-text" }, "• 用于接受BJD娃圈关注品牌的上新通知")
          ]),
          vue.createElementVNode("view", { class: "permission-item" }, [
            vue.createElementVNode("text", { class: "permission-text" }, "• 您可以自定义接收的通知类型")
          ]),
          vue.createElementVNode("view", { class: "permission-item" }, [
            vue.createElementVNode("text", { class: "permission-text" }, "• 可以在系统设置中随时关闭通知")
          ])
        ]),
        vue.createElementVNode("view", { class: "section" }, [
          vue.createElementVNode("text", { class: "section-title" }, "存储权限"),
          vue.createElementVNode("view", { class: "permission-item" }, [
            vue.createElementVNode("text", { class: "permission-text" }, "• 用于保存照片和下载内容")
          ]),
          vue.createElementVNode("view", { class: "permission-item" }, [
            vue.createElementVNode("text", { class: "permission-text" }, "• 用于缓存应用数据以提升加载速度")
          ]),
          vue.createElementVNode("view", { class: "permission-item" }, [
            vue.createElementVNode("text", { class: "permission-text" }, "• 不会访问您设备上的其他文件")
          ])
        ]),
        vue.createElementVNode("view", { class: "section" }, [
          vue.createElementVNode("text", { class: "section-title" }, "设备信息"),
          vue.createElementVNode("view", { class: "permission-item" }, [
            vue.createElementVNode("text", { class: "permission-text" }, "• 用于适配不同设备，提供更好的兼容性")
          ]),
          vue.createElementVNode("view", { class: "permission-item" }, [
            vue.createElementVNode("text", { class: "permission-text" }, "• 用于统计分析，改进产品质量")
          ]),
          vue.createElementVNode("view", { class: "permission-item" }, [
            vue.createElementVNode("text", { class: "permission-text" }, "• 收集的信息包括设备型号、操作系统版本等")
          ])
        ])
      ])
    ]);
  }
  const PagesPermissionPermission = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__file", "/Users/sapphirell/Documents/git/dogdogdoll-uniapp/pages/permission/permission.vue"]]);
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
  __definePage("pages/loadding/loadding", PagesLoaddingLoadding);
  __definePage("pages/private/private", PagesPrivatePrivate);
  __definePage("pages/permission/permission", PagesPermissionPermission);
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
  uni.loadFontFace({
    family: "cutefont",
    source: `url("https://images1.fantuanpu.com/font/ry-super-less-rokk.ttf")`
  });
  uni.loadFontFace({
    family: "alimamamshuhei",
    source: `url("https://images1.fantuanpu.com/font/AlimamaShuHeiTi-Bold.ttf")`
  });
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
