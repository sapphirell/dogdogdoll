"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const common_config = require("../../common/config.js");
const _sfc_main = {
  __name: "goods",
  props: ["goods_id"],
  setup(__props) {
    const props = __props;
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
      common_vendor.index.__f__("log", "at pages/goods/goods.vue:237", "footer:" + bottom);
      return bottom;
    });
    let goods = common_vendor.ref({});
    let comments = common_vendor.ref({});
    let commentsPage = common_vendor.ref(1);
    let swiperIndex = common_vendor.ref(1);
    let myComment = common_vendor.ref("");
    let hasLike = common_vendor.ref(false);
    let collocationList = common_vendor.ref(false);
    let replyForItem = common_vendor.ref({});
    common_vendor.index.showLoading({
      title: "加载中"
    });
    function jumpBrand(id) {
      common_vendor.index.navigateTo({
        url: "/pages/brand/brand?brand_id=" + id
      });
    }
    function onChange(e) {
      common_vendor.index.__f__("log", "at pages/goods/goods.vue:267", e.detail.current);
      swiperIndex.value = e.detail.current + 1;
    }
    function getGoods() {
      common_vendor.index.request({
        url: common_config.websiteUrl + "/goods?id=" + props.goods_id,
        method: "GET",
        timeout: 5e3,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/goods/goods.vue:277", res.data.data);
          goods.value = res.data.data;
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/goods/goods.vue:281", err);
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
    function formatNumber(num) {
      if (num < 1e3) {
        return num.toString();
      } else {
        const kValue = Math.floor(num / 1e3);
        return `${kValue}k+`;
      }
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
    function replyFor(item) {
      if (replyForItem.value.id == item.id) {
        replyForItem.value = {};
        return;
      }
      replyForItem.value = item;
    }
    function getBrandComments() {
      common_vendor.index.request({
        url: common_config.websiteUrl + "/goods-comment?goods_id=" + props.goods_id + "&page=" + commentsPage.value,
        method: "GET",
        timeout: 5e3,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/goods/goods.vue:331", res.data.data);
          comments.value.page_index = res.data.data.page_index;
          comments.value.total = res.data.data.total;
          comments.value.comment_list = comments.value.comment_list ? comments.value.comment_list.concat(
            res.data.data.comment_list
          ) : res.data.data.comment_list;
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
          common_vendor.index.__f__("log", "at pages/goods/goods.vue:352", err);
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
      if (replyForItem.value.id) {
        requestData.reply_id = replyForItem.value.id;
        requestData.reply_for = replyForItem.value.comment;
        requestData.reply_user_id = replyForItem.value.user_id;
      }
      common_vendor.index.__f__("log", "at pages/goods/goods.vue:389", requestData);
      common_vendor.index.request({
        url: common_config.websiteUrl + "/with-state/add-comment",
        method: "POST",
        header: {
          "Authorization": token
        },
        data: requestData,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/goods/goods.vue:398", res.data);
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
          common_vendor.index.__f__("log", "at pages/goods/goods.vue:420", err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        }
      });
    }
    function likeFn() {
      let token = common_vendor.index.getStorageSync("token");
      if (!common_config.global.isLogin) {
        common_vendor.index.showToast({
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
      common_vendor.index.request({
        url: common_config.websiteUrl + url,
        method: "POST",
        header: {
          "Authorization": token
        },
        data: requestData,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/goods/goods.vue:452", res.data);
          if (res.data.status == "success") {
            common_vendor.index.showToast({
              title: "操作成功",
              icon: "success"
            });
            hasLike.value = !hasLike.value;
            getHasLike();
            getGoods();
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
          common_vendor.index.__f__("log", "at pages/goods/goods.vue:471", err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        }
      });
    }
    function getHasLike() {
      let token = common_vendor.index.getStorageSync("token");
      if (token == "") {
        return;
      }
      common_vendor.index.request({
        url: common_config.websiteUrl + "/with-state/hasLike?id=" + props.goods_id + "&type=1",
        method: "POST",
        header: {
          "Authorization": token
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/goods/goods.vue:493", res.data);
          if (res.data.status == "success") {
            if (res.data.data.id > 0) {
              hasLike.value = true;
            } else {
              hasLike.value = false;
            }
          } else {
            common_vendor.index.showToast({
              title: res.data.msg,
              icon: "none"
            });
            return;
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/goods/goods.vue:511", err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        }
      });
    }
    function jump2collocation() {
      common_vendor.index.navigateTo({
        url: "/pages/collocation/collocation?goods_id=" + props.goods_id + "&brand_id=" + goods.value.brand_id + "&goods_name=" + goods.value.name + "&brand_name=" + goods.value.brand_name + "&type=" + goods.value.type
      });
    }
    function jump2collectionDetail(collocation_id) {
      common_vendor.index.navigateTo({
        url: "/pages/collocation_share/collocation_share?collocation_id=" + collocation_id
      });
    }
    function getCollocation() {
      common_vendor.index.request({
        url: common_config.websiteUrl + "/goods-collocation?goods_id=" + props.goods_id,
        method: "GET",
        timeout: 5e3,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/goods/goods.vue:542", res.data.data);
          collocationList.value = res.data.data;
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/goods/goods.vue:546", err);
          common_vendor.index.showToast({
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
      common_vendor.index.previewImage({
        current: goods.value.goods_images["index"],
        urls: goods.value.goods_images
      });
    }
    function jump2user(uid) {
      common_vendor.index.navigateTo({
        url: "/pages/user_page/user_page?uid=" + uid
      });
    }
    getGoods();
    getBrandComments();
    getCollocation();
    common_config.asyncGetUserInfo().then((userInfo) => {
      common_vendor.index.__f__("log", "at pages/goods/goods.vue:586", userInfo);
      getHasLike();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.unref(goods).name
      }, common_vendor.unref(goods).name ? common_vendor.e({
        b: !common_vendor.unref(hasLike)
      }, !common_vendor.unref(hasLike) ? {
        c: common_assets._imports_0$4
      } : {
        d: common_assets._imports_1$2
      }, {
        e: common_vendor.t(formatNumber(common_vendor.unref(goods).goods_like_count)),
        f: common_vendor.o(($event) => likeFn()),
        g: common_vendor.f(common_vendor.unref(goods).goods_images, (item, key, i0) => {
          return {
            a: item,
            b: common_vendor.o(($event) => viewFullImage(), key),
            c: key
          };
        }),
        h: common_vendor.o(onChange),
        i: common_vendor.t(common_vendor.unref(swiperIndex)),
        j: common_vendor.t(common_vendor.unref(goods).goods_images.length),
        k: common_vendor.t(common_vendor.unref(goods).name),
        l: common_vendor.t(common_vendor.unref(goods).type),
        m: common_vendor.unref(goods).total_amount
      }, common_vendor.unref(goods).total_amount ? {
        n: common_vendor.t(common_vendor.unref(goods).total_amount + " " + common_vendor.unref(goods).currency)
      } : common_vendor.unref(goods).goods_sales && common_vendor.unref(goods).goods_sales.length > 0 ? {
        p: common_vendor.t(common_vendor.unref(goods).goods_sales[0].sub_amount + common_vendor.unref(goods).goods_sales[0].fin_amount),
        q: common_vendor.t(common_vendor.unref(goods).goods_sales[0].currency)
      } : {}, {
        o: common_vendor.unref(goods).goods_sales && common_vendor.unref(goods).goods_sales.length > 0,
        r: common_vendor.t(common_vendor.unref(goods).size),
        s: common_vendor.t(common_vendor.unref(goods).size_detail),
        t: common_vendor.unref(goods).type === "单体" || common_vendor.unref(goods).type === "整体"
      }, common_vendor.unref(goods).type === "单体" || common_vendor.unref(goods).type === "整体" ? {
        v: common_vendor.t(common_vendor.unref(goods).body_size)
      } : {}, {
        w: common_vendor.t(common_vendor.unref(goods).skin),
        x: common_vendor.unref(goods).goods_sales == null
      }, common_vendor.unref(goods).goods_sales == null ? {} : {}, {
        y: common_vendor.f(common_vendor.unref(goods).goods_sales, (sale, k0, i0) => {
          return {
            a: common_vendor.t(formatTimestamp(sale.sub_time)),
            b: common_vendor.t(sale.sale_type),
            c: common_vendor.t(sale.sub_amount + sale.fin_amount),
            d: common_vendor.t(sale.currency),
            e: sale.id
          };
        }),
        z: common_vendor.t(common_vendor.unref(goods).brand_name),
        A: common_vendor.o(($event) => jumpBrand(common_vendor.unref(goods).brand_id)),
        B: common_assets._imports_2$2,
        C: common_vendor.unref(collocationList) && common_vendor.unref(collocationList).collocation_relation_list.length > 0
      }, common_vendor.unref(collocationList) && common_vendor.unref(collocationList).collocation_relation_list.length > 0 ? {
        D: common_vendor.f(common_vendor.unref(collocationList).collocation_relation_list, (collocation, k0, i0) => {
          return {
            a: getImageForList(collocation.image_urls),
            b: collocation.collocation_id,
            c: common_vendor.o(($event) => jump2collectionDetail(collocation.collocation_id), collocation.collocation_id)
          };
        })
      } : {}, {
        E: common_assets._imports_3$2,
        F: common_vendor.o(jump2collocation),
        G: common_vendor.t(common_vendor.unref(comments).total || 0),
        H: common_vendor.unref(comments).comment_list
      }, common_vendor.unref(comments).comment_list ? {
        I: common_vendor.f(common_vendor.unref(comments).comment_list, (item, index, i0) => {
          return {
            a: item.avatar,
            b: common_vendor.t(item.username),
            c: common_vendor.o(($event) => jump2user(item.uid), item.id),
            d: common_vendor.t(item.comment),
            e: common_vendor.t(formatTimestamp(item.created_at)),
            f: common_vendor.t(item.floor),
            g: common_vendor.s(common_vendor.unref(replyForItem).id === item.id ? {
              color: "#fd6669"
            } : {
              color: "#888"
            }),
            h: common_vendor.o(($event) => replyFor(item), item.id),
            i: item.id
          };
        }),
        J: common_vendor.s({
          fontSize: "12px",
          position: "absolute",
          bottom: "3px",
          right: "15px",
          fontWeight: "1000"
        }),
        K: common_vendor.o(getBrandComments)
      } : {}, {
        L: common_vendor.unref(replyForItem).id
      }, common_vendor.unref(replyForItem).id ? {
        M: common_vendor.t("@" + common_vendor.unref(replyForItem).username)
      } : {}, {
        N: common_vendor.unref(myComment),
        O: common_vendor.o(($event) => common_vendor.isRef(myComment) ? myComment.value = $event.detail.value : myComment = $event.detail.value),
        P: common_vendor.o(addComments),
        Q: footerBottomHeight.value
      }) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7e2880f6"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/goods/goods.js.map
