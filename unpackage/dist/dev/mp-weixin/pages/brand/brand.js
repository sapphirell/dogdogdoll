"use strict";
const common_vendor = require("../../common/vendor.js");
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
    console.log(props);
    common_vendor.index.showLoading({});
    function getBrandsInfo() {
      common_vendor.index.request({
        url: "http://localhost:8080/brand-info?id=" + props.brand_id,
        method: "GET",
        timeout: 5e3,
        success: (res) => {
          console.log(res.data.data);
          brand.value = res.data.data;
          common_vendor.index.setNavigationBarTitle({
            title: res.data.data.brand_name
          });
        },
        fail: (err) => {
          console.log(err);
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
    function getBrandGoods() {
      common_vendor.index.request({
        url: "http://localhost:8080/brand-goods?brand_id=" + props.brand_id + "&page=" + page.value,
        method: "GET",
        timeout: 5e3,
        success: (res) => {
          console.log(res.data.data);
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
          console.log(err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        }
      });
    }
    function getBrandComments() {
      common_vendor.index.request({
        url: "http://localhost:8080/brand-comment?brand_id=" + props.brand_id + "&page=" + commentsPage.value,
        method: "GET",
        timeout: 5e3,
        success: (res) => {
          console.log(res.data.data);
          comments.value.page_index = res.data.data.page_index;
          comments.value.total = res.data.data.total;
          comments.value.comment_list = comments.value.comment_list ? comments.value.comment_list.concat(res.data.data.comments) : res.data.data.comment_list;
          if (res.data.data.comments != null) {
            if (res.data.data.comments.length > 0) {
              commentsPage.value += 1;
            }
            if (res.data.data.comments.length == 0 && commentsPage.value > 1) {
              common_vendor.index.showToast({
                title: "没有更多数据了",
                icon: "none"
              });
            }
          }
        },
        fail: (err) => {
          console.log(err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        }
      });
    }
    function addComments() {
    }
    function jumpGoods(id) {
      common_vendor.index.navigateTo({
        url: "/pages/goods/goods?goods_id=" + id
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
    return (_ctx, _cache) => {
      return {
        a: common_vendor.unref(brand).logo_image,
        b: common_vendor.t(common_vendor.unref(brand).brand_name),
        c: common_vendor.t(common_vendor.unref(brand).country_name),
        d: common_vendor.t(common_vendor.unref(brand).type),
        e: common_vendor.o(_ctx.onChange),
        f: common_vendor.o(($event) => _ctx.rateValue = $event),
        g: common_vendor.p({
          value: 4.2,
          ["allow-half"]: "true",
          modelValue: _ctx.rateValue
        }),
        h: common_vendor.t(common_vendor.unref(brand).description),
        i: common_vendor.t(common_vendor.unref(goods).total),
        j: common_vendor.f(common_vendor.unref(goods).goods_list, (item, index, i0) => {
          return {
            a: item.goods_images[0],
            b: common_vendor.o(($event) => jumpGoods(item.id), item.id),
            c: item.id
          };
        }),
        k: common_vendor.o(getBrandGoods),
        l: common_vendor.t(common_vendor.unref(comments).total),
        m: common_vendor.f(common_vendor.unref(comments).comment_list, (item, index, i0) => {
          return {
            a: item.avatar,
            b: common_vendor.t(item.username),
            c: common_vendor.t(item.floor),
            d: common_vendor.t(item.comment),
            e: item.id
          };
        }),
        n: common_vendor.o(addComments)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1a297a1d"]]);
wx.createPage(MiniProgramPage);
