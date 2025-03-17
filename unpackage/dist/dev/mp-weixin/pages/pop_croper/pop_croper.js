"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
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
    common_vendor.index.stopPullDownRefresh();
  },
  methods: {
    openPopup() {
      this.$refs.pop.open();
    },
    change() {
      common_vendor.index.chooseImage({
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
        common_vendor.index.__f__("log", "at pages/pop_croper/pop_croper.vue:82", parentPage);
        parentPage.returnParam = res;
        common_vendor.index.navigateBack({
          delta: 1
        });
      });
    }
  }
};
if (!Array) {
  const _easycom_bt_cropper2 = common_vendor.resolveComponent("bt-cropper");
  const _component_uni_popup = common_vendor.resolveComponent("uni-popup");
  (_easycom_bt_cropper2 + _component_uni_popup)();
}
const _easycom_bt_cropper = () => "../../uni_modules/bt-cropper/components/bt-cropper/bt-cropper.js";
if (!Math) {
  _easycom_bt_cropper();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.sr("cropper", "ec2e1a43-1,ec2e1a43-0"),
    b: common_vendor.o($options.onChange),
    c: common_vendor.p({
      imageSrc: $data.imageSrc,
      mask: $data.mask,
      ratio: $data.ratio,
      initPosition: $data.initPosition,
      dWidth: 800,
      fileType: "png",
      containerSize: $data.containerSize
    }),
    d: common_vendor.o((...args) => $options.crop && $options.crop(...args)),
    e: common_vendor.o((...args) => $options.undo && $options.undo(...args)),
    f: common_vendor.sr("pop", "ec2e1a43-0")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-ec2e1a43"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/pop_croper/pop_croper.js.map
