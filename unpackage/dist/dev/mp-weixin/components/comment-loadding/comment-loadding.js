"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
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
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.triggered ? $data.refreshingGif : $data.pullDownGif,
    b: common_vendor.t($data.refreshText),
    c: $data.triggered ? 1 : "",
    d: `${$props.threshold}px`,
    e: $data.triggered,
    f: $props.threshold,
    g: common_vendor.o((...args) => $options.onRefresh && $options.onRefresh(...args)),
    h: common_vendor.o((...args) => $options.onRestore && $options.onRestore(...args)),
    i: common_vendor.o((...args) => $options.onAbort && $options.onAbort(...args)),
    j: $props.scrollHeight
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-a113cad1"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/comment-loadding/comment-loadding.js.map
