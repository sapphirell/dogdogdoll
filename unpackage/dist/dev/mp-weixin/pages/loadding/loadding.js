"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
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
    const systemInfo = common_vendor.index.getSystemInfoSync();
    this.statusBarHeight = systemInfo.statusBarHeight;
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
if (!Array) {
  const _easycom_comment_loadding2 = common_vendor.resolveComponent("comment-loadding");
  _easycom_comment_loadding2();
}
const _easycom_comment_loadding = () => "../../components/comment-loadding/comment-loadding.js";
if (!Math) {
  _easycom_comment_loadding();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($data.dataList, (item, index, i0) => {
      return {
        a: item.avatar,
        b: common_vendor.t(item.name),
        c: common_vendor.t(item.content),
        d: common_vendor.t(item.time),
        e: index
      };
    }),
    b: common_vendor.sr("refresh", "4334579f-0"),
    c: common_vendor.o($options.handleRefresh),
    d: common_vendor.p({
      scrollHeight: `calc(100vh - ${$data.statusBarHeight}px)`
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/loadding/loadding.js.map
