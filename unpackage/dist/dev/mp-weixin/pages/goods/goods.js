"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "goods",
  props: ["goods_id"],
  setup(__props) {
    const props = __props;
    let goods = common_vendor.ref({});
    let comments = common_vendor.ref({});
    let commentsPage = common_vendor.ref(1);
    common_vendor.index.showLoading({
      title: "加载中"
    });
    function jumpBrand(id) {
      common_vendor.index.navigateTo({
        url: "/pages/brand/brand?brand_id=" + id
      });
    }
    function getGoods() {
      common_vendor.index.request({
        url: "http://localhost:8080/goods?id=" + props.goods_id,
        method: "GET",
        timeout: 5e3,
        success: (res) => {
          console.log(res.data.data);
          goods.value = res.data.data;
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
    function formatTimestamp(timestamp) {
      const date = new Date(timestamp * 1e3);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const seconds = date.getSeconds().toString().padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    function getBrandComments() {
      common_vendor.index.request({
        url: "http://localhost:8080/goods-comment?goods_id=" + props.goods_id + "&page=" + commentsPage.value,
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
    getGoods();
    getBrandComments();
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.unref(goods).name
      }, common_vendor.unref(goods).name ? common_vendor.e({
        b: common_vendor.f(common_vendor.unref(goods).goods_images, (item, key, i0) => {
          return {
            a: item,
            b: key
          };
        }),
        c: common_vendor.o((...args) => _ctx.onChange && _ctx.onChange(...args)),
        d: common_vendor.t(common_vendor.unref(goods).name),
        e: common_vendor.t(common_vendor.unref(goods).type),
        f: common_vendor.unref(goods).goods_sales && common_vendor.unref(goods).goods_sales.length > 0
      }, common_vendor.unref(goods).goods_sales && common_vendor.unref(goods).goods_sales.length > 0 ? {
        g: common_vendor.t(common_vendor.unref(goods).goods_sales[0].sub_amount + common_vendor.unref(goods).goods_sales[0].fin_amount),
        h: common_vendor.t(common_vendor.unref(goods).goods_sales[0].currency)
      } : {}, {
        i: common_vendor.t(common_vendor.unref(goods).size),
        j: common_vendor.t(common_vendor.unref(goods).size_detail),
        k: common_vendor.t(common_vendor.unref(goods).skin),
        l: common_vendor.unref(goods).goods_sales == null
      }, common_vendor.unref(goods).goods_sales == null ? {} : {}, {
        m: common_vendor.f(common_vendor.unref(goods).goods_sales, (sale, k0, i0) => {
          return {
            a: common_vendor.t(formatTimestamp(sale.sub_time)),
            b: common_vendor.t(sale.sale_type),
            c: common_vendor.t(sale.sub_amount + sale.fin_amount),
            d: common_vendor.t(sale.currency),
            e: sale.id
          };
        }),
        n: common_vendor.t(common_vendor.unref(goods).brand_name),
        o: common_vendor.o(($event) => jumpBrand(common_vendor.unref(goods).brand_id)),
        p: common_vendor.t(common_vendor.unref(comments).total),
        q: common_vendor.f(common_vendor.unref(comments).comment_list, (item, index, i0) => {
          return {
            a: item.avatar,
            b: common_vendor.t(item.username),
            c: common_vendor.t(item.floor),
            d: common_vendor.t(item.comment),
            e: item.id
          };
        }),
        r: common_vendor.o(addComments)
      }) : {});
    };
  }
};
wx.createPage(_sfc_main);
