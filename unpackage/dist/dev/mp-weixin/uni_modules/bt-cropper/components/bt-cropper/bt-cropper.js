"use strict";
const common_vendor = require("../../../../common/vendor.js");
const uni_modules_btCropper_components_btCropper_utils_tools = require("./utils/tools.js");
const block0 = (Component2) => {
  if (!Component2.wxsCallMethods) {
    Component2.wxsCallMethods = [];
  }
  Component2.wxsCallMethods.push("onTouchStart", "updateData");
};
const _sfc_main = {
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
      common_vendor.index.showLoading({
        title: "载入中..."
      });
      common_vendor.index.getImageInfo({
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
          common_vendor.index.showToast({
            title: "图片下载失败!",
            icon: "none"
          });
        },
        complete(res) {
          common_vendor.index.hideLoading();
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
      const systemInfo = common_vendor.index.getSystemInfoSync();
      if (this.canvas2d === false || systemInfo.platform === "windows" || systemInfo.platform === "mac") {
        this.type2d = false;
      } else {
        this.type2d = true;
        this.pixel = systemInfo.pixelRatio;
      }
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
          width: uni_modules_btCropper_components_btCropper_utils_tools.parseUnit(width),
          height: uni_modules_btCropper_components_btCropper_utils_tools.parseUnit(height)
        });
      } else {
        return new Promise((resolve) => {
          const query = common_vendor.index.createSelectorQuery().in(this);
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
          common_vendor.index.getImageInfo({
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
        const query = common_vendor.index.createSelectorQuery().in(this);
        canvas = await new Promise(
          (resolve) => query.select(".bt-canvas").node(({ node }) => resolve(node)).exec()
        );
        canvas.width = this.target.width * this.pixel;
        canvas.height = this.target.height * this.pixel;
        ctx = canvas.getContext("2d");
      } else {
        ctx = common_vendor.index.createCanvasContext(this.canvasId, this);
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
            common_vendor.index.canvasGetImageData({
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
            common_vendor.index.canvasGetImageData({
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
            common_vendor.index.canvasPutImageData({
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
        common_vendor.index.canvasToTempFilePath({
          ...params,
          destWidth: this.target.width,
          destHeight: this.target.height,
          quality: Number(this.quality) || 1,
          fileType: this.fileType,
          success: ({ tempFilePath }) => {
            resolve(tempFilePath);
          },
          fail(err) {
            common_vendor.index.__f__("log", "at uni_modules/bt-cropper/components/bt-cropper/bt-cropper.vue:593", "保存失败，错误信息：", err);
            reject(err);
          }
        }, this);
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.imageRect && $data.cropperRect
  }, $data.imageRect && $data.cropperRect ? common_vendor.e({
    b: $props.imageSrc,
    c: $options.rotateAngle,
    d: $data.imageRect,
    e: $data.anim ? 1 : "",
    f: $props.mask,
    g: $props.showGrid
  }, $props.showGrid ? {} : {}, {
    h: $data.anim ? 1 : "",
    i: $data.cropperRect,
    j: $props.ratio
  }) : {}, {
    k: $data.type2d
  }, $data.type2d ? {
    l: $data.target.width,
    m: $data.target.height
  } : {
    n: $data.canvasId,
    o: $data.target.width + "px",
    p: $data.target.height + "px",
    q: $data.target.width * $data.pixel,
    r: $data.target.height * $data.pixel
  }, {
    s: common_vendor.s($options.containerStyle)
  });
}
if (typeof block0 === "function")
  block0(_sfc_main);
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-51ff46c2"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/bt-cropper/components/bt-cropper/bt-cropper.js.map
