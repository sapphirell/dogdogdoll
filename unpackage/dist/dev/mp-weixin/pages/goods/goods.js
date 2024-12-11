"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const common_config = require("../../common/config.js");
const _sfc_main = {
  __name: "goods",
  props: ["goods_id"],
  setup(__props) {
    const props = __props;
    let goods = common_vendor.ref({});
    let comments = common_vendor.ref({});
    let commentsPage = common_vendor.ref(1);
    let swiperIndex = common_vendor.ref(1);
    let myComment = common_vendor.ref("");
    common_vendor.index.showLoading({
      title: "加载中"
    });
    function jumpBrand(id) {
      common_vendor.index.navigateTo({
        url: "/pages/brand/brand?brand_id=" + id
      });
    }
    function onChange(e) {
      console.log(e.detail.current);
      swiperIndex.value = e.detail.current + 1;
    }
    function getGoods() {
      common_vendor.index.request({
        url: common_config.websiteUrl + "/goods?id=" + props.goods_id,
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
      date.getSeconds().toString().padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    }
    function getBrandComments() {
      common_vendor.index.request({
        url: common_config.websiteUrl + "/goods-comment?goods_id=" + props.goods_id + "&page=" + commentsPage.value,
        method: "GET",
        timeout: 5e3,
        success: (res) => {
          console.log(res.data.data);
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
          console.log(err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        }
      });
    }
    function addComments() {
      let token = common_vendor.index.getStorageSync("token");
      if (!common_config.global.isLogin) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        return;
      }
      if (myComment.value == "") {
        common_vendor.index.showToast({
          title: "请输入评论内容",
          icon: "none"
        });
        return;
      }
      let requestData = {
        content: myComment.value,
        target_id: parseInt(props.goods_id),
        type: 2
      };
      console.log(requestData);
      common_vendor.index.request({
        url: common_config.websiteUrl + "/with-state/add-comment",
        method: "POST",
        header: {
          "Authorization": token
        },
        data: requestData,
        success: (res) => {
          console.log(res.data);
          if (res.data.status == "success") {
            common_vendor.index.showToast({
              title: "评论成功",
              icon: "success"
            });
            myComment.value = "";
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
          console.log(err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        }
      });
    }
    getGoods();
    getBrandComments();
    common_config.getUserInfo();
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.unref(goods).name
      }, common_vendor.unref(goods).name ? common_vendor.e({
        b: common_assets._imports_0$3,
        c: common_vendor.f(common_vendor.unref(goods).goods_images, (item, key, i0) => {
          return {
            a: item,
            b: key
          };
        }),
        d: common_vendor.o(onChange),
        e: common_vendor.t(common_vendor.unref(swiperIndex)),
        f: common_vendor.t(common_vendor.unref(goods).goods_images.length),
        g: common_vendor.t(common_vendor.unref(goods).name),
        h: common_vendor.t(common_vendor.unref(goods).type),
        i: common_vendor.unref(goods).goods_sales && common_vendor.unref(goods).goods_sales.length > 0
      }, common_vendor.unref(goods).goods_sales && common_vendor.unref(goods).goods_sales.length > 0 ? {
        j: common_vendor.t(common_vendor.unref(goods).goods_sales[0].sub_amount + common_vendor.unref(goods).goods_sales[0].fin_amount),
        k: common_vendor.t(common_vendor.unref(goods).goods_sales[0].currency)
      } : {}, {
        l: common_vendor.t(common_vendor.unref(goods).size),
        m: common_vendor.t(common_vendor.unref(goods).size_detail),
        n: common_vendor.t(common_vendor.unref(goods).skin),
        o: common_vendor.unref(goods).goods_sales == null
      }, common_vendor.unref(goods).goods_sales == null ? {} : {}, {
        p: common_vendor.f(common_vendor.unref(goods).goods_sales, (sale, k0, i0) => {
          return {
            a: common_vendor.t(formatTimestamp(sale.sub_time)),
            b: common_vendor.t(sale.sale_type),
            c: common_vendor.t(sale.sub_amount + sale.fin_amount),
            d: common_vendor.t(sale.currency),
            e: sale.id
          };
        }),
        q: common_vendor.t(common_vendor.unref(goods).brand_name),
        r: common_vendor.o(($event) => jumpBrand(common_vendor.unref(goods).brand_id)),
        s: common_vendor.t(common_vendor.unref(comments).total),
        t: common_vendor.unref(comments).comment_list
      }, common_vendor.unref(comments).comment_list ? {
        v: common_vendor.f(common_vendor.unref(comments).comment_list, (item, index, i0) => {
          return {
            a: item.avatar,
            b: common_vendor.t(item.username),
            c: common_vendor.t(item.comment),
            d: common_vendor.t(formatTimestamp(item.created_at)),
            e: common_vendor.t(item.floor),
            f: item.id
          };
        }),
        w: common_vendor.o(getBrandComments)
      } : {}, {
        x: common_vendor.unref(myComment),
        y: common_vendor.o(($event) => common_vendor.isRef(myComment) ? myComment.value = $event.detail.value : myComment = $event.detail.value),
        z: common_vendor.o(addComments)
      }) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7e2880f6"]]);
wx.createPage(MiniProgramPage);
