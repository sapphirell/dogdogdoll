"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
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
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($props.resdata, (item, index, i0) => {
      return {
        a: common_vendor.n(index === $props.currentIndex - 2 ? "prew_2_dot" : index === $props.currentIndex - 1 ? "prew_1_dot" : index === $props.currentIndex ? "current-dot" : index === $props.currentIndex + 1 ? "next_1_dot" : index === $props.currentIndex + 2 ? "next_2_dot" : "")
      };
    }),
    b: common_vendor.s("transform:translateX(" + $options.translateX + "px);width:" + $props.dot_distance + "px;height:" + $props.dot_distance + "px;")
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
