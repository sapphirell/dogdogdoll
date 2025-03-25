"use strict";
const common_vendor = require("../../common/vendor.js");
const common_config = require("../../common/config.js");
if (!Array) {
  const _easycom_uni_rate2 = common_vendor.resolveComponent("uni-rate");
  _easycom_uni_rate2();
}
const _easycom_uni_rate = () => "../../uni_modules/uni-rate/components/uni-rate/uni-rate.js";
if (!Math) {
  _easycom_uni_rate();
}
const _sfc_main = {
  __name: "brand",
  props: ["brand_id"],
  setup(__props) {
    const props = __props;
    common_vendor.index.__f__("log", "at pages/brand/brand.vue:113", props);
    common_vendor.index.showLoading({
      title: "加载中"
    });
    const systemInfo = common_vendor.index.getSystemInfoSync();
    const keyboardHeight = common_vendor.ref(0);
    common_vendor.onShow(() => {
      {
        return;
      }
    });
    common_vendor.onHide(() => {
      {
        return;
      }
    });
    const footerBottomHeight = common_vendor.computed(() => {
      var _a;
      let safeBottom = ((_a = systemInfo.safeAreaInsets) == null ? void 0 : _a.bottom) || 10;
      if (keyboardHeight.value > 0) {
        safeBottom += keyboardHeight.value;
      }
      let bottom = `${safeBottom}px`;
      common_vendor.index.__f__("log", "at pages/brand/brand.vue:156", "footer-brand:" + bottom);
      return bottom;
    });
    let comment = common_vendor.ref("");
    let rateValue = common_vendor.ref(0);
    let activeModal = common_vendor.ref(false);
    function voteScoreProxy() {
      if (rateValue.value == 0) {
        common_vendor.index.showToast({
          title: "请先评分",
          icon: "none"
        });
        return;
      }
      if (rateValue.value > 5) {
        common_vendor.index.showToast({
          title: "评分不能大于5",
          icon: "none"
        });
        return;
      }
      common_vendor.index.__f__("log", "at pages/brand/brand.vue:184", rateValue.value, props.brand_id);
      common_config.voteScore(1, rateValue.value, props.brand_id);
    }
    function getBrandsInfo() {
      common_vendor.index.request({
        url: common_config.websiteUrl + "/brand-info?id=" + props.brand_id,
        method: "GET",
        timeout: 5e3,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/brand/brand.vue:195", res.data.data);
          brand.value = res.data.data;
          common_vendor.index.setNavigationBarTitle({
            title: res.data.data.brand_name
          });
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/brand/brand.vue:204", err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        },
        complete: () => {
          common_vendor.index.hideLoading();
        }
      });
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
    function getBrandGoods() {
      common_vendor.index.request({
        url: common_config.websiteUrl + "/brand-goods?brand_id=" + props.brand_id + "&page=" + page.value,
        method: "GET",
        timeout: 5e3,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/brand/brand.vue:236", res.data.data);
          goods.value.page_index = res.data.data.page_index;
          goods.value.total = res.data.data.total;
          goods.value.goods_list = goods.value.goods_list ? goods.value.goods_list.concat(res.data.data.goods_list) : res.data.data.goods_list;
          if (res.data.data.goods_list.length > 0) {
            page.value += 1;
          }
          if (res.data.data.goods_list.length == 0 && page.value > 1) {
            common_vendor.index.showToast({
              title: "没有更多数据了",
              icon: "none"
            });
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/brand/brand.vue:253", err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        }
      });
    }
    function getBrandComments() {
      common_vendor.index.request({
        url: common_config.websiteUrl + "/brand-comment?brand_id=" + props.brand_id + "&page=" + commentsPage.value,
        method: "GET",
        timeout: 5e3,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/brand/brand.vue:269", res.data.data);
          comments.value.page_index = res.data.data.page_index;
          comments.value.total = res.data.data.total;
          comments.value.comment_list = comments.value.comment_list ? comments.value.comment_list.concat(res.data.data.comment_list) : res.data.data.comment_list;
          if (res.data.data.comment_list != null) {
            if (res.data.data.comment_list.length > 0) {
              commentsPage.value += 1;
            }
            if (res.data.data.comment_list.length == 0 && commentsPage.value > 1) {
              common_vendor.index.showToast({
                title: "没有更多数据了",
                icon: "none"
              });
            }
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/brand/brand.vue:289", err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        }
      });
    }
    function openRate(i) {
      activeModal.value = !activeModal.value;
    }
    function addComments() {
      let token = common_vendor.index.getStorageSync("token");
      if (!token) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        return;
      }
      if (comment.value == "") {
        common_vendor.index.showToast({
          title: "请输入评论内容",
          icon: "none"
        });
        return;
      }
      let scene = common_config.getScene();
      common_vendor.index.request({
        url: common_config.websiteUrl + "/with-state/add-comment",
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
          common_vendor.index.__f__("log", "at pages/brand/brand.vue:338", res.data);
          if (res.data.status == "success") {
            common_vendor.index.showToast({
              title: "评论成功",
              icon: "success"
            });
            comment.value = "";
            commentsPage.value = 1;
            comments.value = {};
            getBrandComments();
            return;
          } else {
            common_vendor.index.showToast({
              title: res.data.msg,
              icon: "none"
            });
            return;
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/brand/brand.vue:360", err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        }
      });
    }
    function getMyScore(type, targetId) {
      let token = common_vendor.index.getStorageSync("token");
      if (!token) {
        return 0;
      }
      if (!common_config.global.isLogin) {
        return 0;
      }
      common_vendor.index.request({
        url: common_config.websiteUrl + "/with-state/my-vote-record",
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
          common_vendor.index.__f__("log", "at pages/brand/brand.vue:389", res.data.data);
          if (res.data.status == "success") {
            rateValue.value = res.data.data.score;
            return res.data.data.score;
          } else {
            common_vendor.index.showToast({
              title: res.data.msg,
              icon: "none"
            });
            return 0;
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/brand/brand.vue:402", err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
          return 0;
        }
      });
    }
    function jumpGoods(id) {
      common_vendor.index.navigateTo({
        url: "/pages/goods/goods?goods_id=" + id
      });
    }
    function jump2user(uid) {
      common_vendor.index.navigateTo({
        url: "/pages/user_page/user_page?uid=" + uid
      });
    }
    let goods = common_vendor.ref({});
    let page = common_vendor.ref(1);
    let brand = common_vendor.ref({});
    let comments = common_vendor.ref({});
    let commentsPage = common_vendor.ref(1);
    getBrandsInfo();
    getBrandGoods();
    getBrandComments();
    getMyScore(1, props.brand_id);
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.unref(brand).logo_image,
        b: common_vendor.t(common_vendor.unref(brand).brand_name),
        c: common_vendor.t(common_vendor.unref(brand).country_name),
        d: common_vendor.t(common_vendor.unref(brand).type),
        e: common_vendor.p({
          value: common_vendor.unref(brand).score,
          ["allow-half"]: "true",
          ["disabled-color"]: "rgb(255 157 219)"
        }),
        f: common_vendor.t(common_vendor.unref(brand).score),
        g: common_vendor.t(common_vendor.unref(brand).vote_number),
        h: common_vendor.o(($event) => openRate()),
        i: common_vendor.t(common_vendor.unref(brand).nickname_list),
        j: common_vendor.t(common_vendor.unref(brand).description),
        k: common_vendor.t(common_vendor.unref(goods).total),
        l: common_vendor.f(common_vendor.unref(goods).goods_list, (item, index, i0) => {
          return {
            a: item.goods_images[0],
            b: common_vendor.t(item.name),
            c: common_vendor.o(($event) => jumpGoods(item.id), item.id),
            d: item.id
          };
        }),
        m: common_vendor.o(getBrandGoods),
        n: common_vendor.t(common_vendor.unref(comments).total),
        o: common_vendor.unref(comments).comment_list
      }, common_vendor.unref(comments).comment_list ? {
        p: common_vendor.f(common_vendor.unref(comments).comment_list, (item, index, i0) => {
          return {
            a: item.avatar,
            b: common_vendor.t(item.username),
            c: common_vendor.o(($event) => jump2user(item.uid), item.id),
            d: common_vendor.t(item.comment),
            e: common_vendor.t(formatTimestamp(item.created_at)),
            f: common_vendor.t(item.floor),
            g: item.id
          };
        }),
        q: common_vendor.o(getBrandComments)
      } : {}, {
        r: common_vendor.t(common_vendor.unref(rateValue)),
        s: common_vendor.o(($event) => common_vendor.isRef(rateValue) ? rateValue.value = $event : rateValue = $event),
        t: common_vendor.p({
          ["allow-half"]: "true",
          size: "45",
          modelValue: common_vendor.unref(rateValue)
        }),
        v: common_vendor.o(voteScoreProxy),
        w: !common_vendor.unref(activeModal) ? 1 : "",
        x: common_vendor.o(($event) => openRate()),
        y: common_vendor.unref(comment),
        z: common_vendor.o(($event) => common_vendor.isRef(comment) ? comment.value = $event.detail.value : comment = $event.detail.value),
        A: common_vendor.o(addComments),
        B: footerBottomHeight.value
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1a297a1d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/brand/brand.js.map
