"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const common_config = require("../../common/config.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "goods",
  props: ["goods_id"],
  setup(__props) {
    const props = __props;
    const systemInfo = common_vendor.index.getSystemInfoSync();
    const keyboardHeight = common_vendor.ref(0);
    const displayMask = common_vendor.ref(false);
    const keyboardHeightChangeHandler = (res) => {
      common_vendor.index.__f__("log", "at pages/goods/goods.vue:223", "键盘高度变化", res);
      keyboardHeight.value = res.height;
    };
    common_vendor.onShow(() => {
      common_vendor.index.__f__("log", "at pages/goods/goods.vue:233", "注册键盘弹出事件");
      common_vendor.index.onKeyboardHeightChange(keyboardHeightChangeHandler);
    });
    common_vendor.onHide(() => {
      var _a, _b;
      common_vendor.index.__f__("log", "at pages/goods/goods.vue:242", "卸载键盘弹出事件");
      (_b = (_a = common_vendor.index).offKeyboardHeightChange) == null ? void 0 : _b.call(_a, keyboardHeightChangeHandler);
    });
    const footerBottomHeight = common_vendor.computed(() => {
      var _a;
      let safeBottom = ((_a = systemInfo.safeAreaInsets) == null ? void 0 : _a.bottom) || 10;
      if (keyboardHeight.value > 0) {
        safeBottom += keyboardHeight.value;
      }
      let bottom = `${safeBottom}px`;
      common_vendor.index.__f__("log", "at pages/goods/goods.vue:253", "footer:" + bottom);
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
    const swiperHeight = common_vendor.ref(400);
    const imageHeights = common_vendor.ref([]);
    function handleFocus() {
      displayMask.value = true;
    }
    function handleBlur() {
      displayMask.value = false;
    }
    const handleMaskTap = () => {
      displayMask.value = false;
      common_vendor.index.hideKeyboard();
    };
    function onImageLoad(index) {
      common_vendor.index.__f__("log", "at pages/goods/goods.vue:291", "图片加载完成", index);
      const query = common_vendor.index.createSelectorQuery();
      setTimeout(() => {
        query.select(`.swiper-image-${index}`).boundingClientRect((rect) => {
          try {
            if (!rect) {
              common_vendor.index.__f__("warn", "at pages/goods/goods.vue:298", "未找到图片元素");
              return;
            }
            common_vendor.index.__f__("log", "at pages/goods/goods.vue:301", rect);
            imageHeights.value[index] = rect.height;
            const validHeights = imageHeights.value.filter((h) => h > 0);
            if (validHeights.length === 0)
              return;
            swiperHeight.value = Math.max(...validHeights);
          } catch (e) {
            common_vendor.index.__f__("error", "at pages/goods/goods.vue:307", "高度计算异常:", e);
          }
        }).exec();
      }, 20);
    }
    common_vendor.index.showLoading({
      title: "加载中"
    });
    function jumpBrand(id) {
      common_vendor.index.navigateTo({
        url: "/pages/brand/brand?brand_id=" + id
      });
    }
    function onChange(e) {
      common_vendor.index.__f__("log", "at pages/goods/goods.vue:325", e.detail.current);
      swiperIndex.value = e.detail.current + 1;
    }
    function getGoods() {
      common_vendor.index.request({
        url: common_config.websiteUrl + "/goods?id=" + props.goods_id,
        method: "GET",
        timeout: 5e3,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/goods/goods.vue:335", res.data.data);
          goods.value = res.data.data;
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/goods/goods.vue:339", err);
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
          common_vendor.index.__f__("log", "at pages/goods/goods.vue:389", res.data.data);
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
          common_vendor.index.__f__("log", "at pages/goods/goods.vue:410", err);
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
      common_vendor.index.__f__("log", "at pages/goods/goods.vue:447", requestData);
      common_vendor.index.request({
        url: common_config.websiteUrl + "/with-state/add-comment",
        method: "POST",
        header: {
          "Authorization": token
        },
        data: requestData,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/goods/goods.vue:456", res.data);
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
          common_vendor.index.__f__("log", "at pages/goods/goods.vue:478", err);
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
          common_vendor.index.__f__("log", "at pages/goods/goods.vue:510", res.data);
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
          common_vendor.index.__f__("log", "at pages/goods/goods.vue:529", err);
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
          common_vendor.index.__f__("log", "at pages/goods/goods.vue:551", res.data);
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
          common_vendor.index.__f__("log", "at pages/goods/goods.vue:569", err);
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
    function jump2collectionDetail(collocation_id, origin) {
      common_vendor.index.navigateTo({
        url: "/pages/collocation_share/collocation_share?collocation_id=" + collocation_id + "&origin=" + origin
      });
    }
    function getCollocation() {
      common_vendor.index.request({
        url: common_config.websiteUrl + "/goods-collocation?goods_id=" + props.goods_id,
        method: "GET",
        timeout: 5e3,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/goods/goods.vue:600", res.data.data);
          collocationList.value = res.data.data;
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/goods/goods.vue:604", err);
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
      common_vendor.index.__f__("log", "at pages/goods/goods.vue:644", userInfo);
      getHasLike();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.unref(goods).name
      }, common_vendor.unref(goods).name ? common_vendor.e({
        b: !common_vendor.unref(hasLike)
      }, !common_vendor.unref(hasLike) ? {
        c: common_vendor.p({
          type: "heart",
          size: "28",
          color: "#ff4d4f"
        })
      } : {
        d: common_vendor.p({
          type: "heart-filled",
          size: "28",
          color: "#ff4d4f"
        })
      }, {
        e: common_vendor.t(formatNumber(common_vendor.unref(goods).goods_like_count)),
        f: common_vendor.o(($event) => likeFn()),
        g: common_vendor.f(common_vendor.unref(goods).goods_images, (item, key, i0) => {
          return {
            a: item,
            b: common_vendor.n("swiper-image-" + key),
            c: common_vendor.o(($event) => viewFullImage(), key),
            d: common_vendor.o(($event) => onImageLoad(key), key),
            e: key
          };
        }),
        h: common_vendor.o(onChange),
        i: swiperHeight.value + "px",
        j: common_vendor.t(common_vendor.unref(swiperIndex)),
        k: common_vendor.t(common_vendor.unref(goods).goods_images.length),
        l: common_vendor.t(common_vendor.unref(goods).name),
        m: common_vendor.t(common_vendor.unref(goods).type),
        n: common_vendor.unref(goods).total_amount
      }, common_vendor.unref(goods).total_amount ? {
        o: common_vendor.t(common_vendor.unref(goods).total_amount + " " + common_vendor.unref(goods).currency)
      } : common_vendor.unref(goods).goods_sales && common_vendor.unref(goods).goods_sales.length > 0 ? {
        q: common_vendor.t(common_vendor.unref(goods).goods_sales[0].sub_amount + common_vendor.unref(goods).goods_sales[0].fin_amount),
        r: common_vendor.t(common_vendor.unref(goods).goods_sales[0].currency)
      } : {}, {
        p: common_vendor.unref(goods).goods_sales && common_vendor.unref(goods).goods_sales.length > 0,
        s: common_vendor.t(common_vendor.unref(goods).size),
        t: common_vendor.t(common_vendor.unref(goods).size_detail),
        v: common_vendor.unref(goods).type === "单体" || common_vendor.unref(goods).type === "整体" || common_vendor.unref(goods).type === "单头"
      }, common_vendor.unref(goods).type === "单体" || common_vendor.unref(goods).type === "整体" || common_vendor.unref(goods).type === "单头" ? {
        w: common_vendor.t(common_vendor.unref(goods).body_size || "未知")
      } : {}, {
        x: common_vendor.t(common_vendor.unref(goods).skin),
        y: common_vendor.unref(goods).goods_sales == null
      }, common_vendor.unref(goods).goods_sales == null ? {} : {}, {
        z: common_vendor.f(common_vendor.unref(goods).goods_sales, (sale, k0, i0) => {
          return {
            a: common_vendor.t(formatTimestamp(sale.sub_time)),
            b: common_vendor.t(sale.sale_type),
            c: common_vendor.t(sale.sub_amount + sale.fin_amount),
            d: common_vendor.t(sale.currency),
            e: sale.id
          };
        }),
        A: common_vendor.t(common_vendor.unref(goods).brand_name),
        B: common_vendor.o(($event) => jumpBrand(common_vendor.unref(goods).brand_id)),
        C: common_vendor.t(common_vendor.unref(goods).desc_content),
        D: common_assets._imports_2$2,
        E: common_vendor.unref(collocationList) && common_vendor.unref(collocationList).collocation_relation_list.length > 0
      }, common_vendor.unref(collocationList) && common_vendor.unref(collocationList).collocation_relation_list.length > 0 ? {
        F: common_vendor.f(common_vendor.unref(collocationList).collocation_relation_list, (collocation, k0, i0) => {
          return {
            a: getImageForList(collocation.image_urls),
            b: collocation.collocation_id,
            c: common_vendor.o(($event) => jump2collectionDetail(collocation.collocation_id, collocation.relation_origin), collocation.collocation_id)
          };
        })
      } : {}, {
        G: common_assets._imports_1$4,
        H: common_vendor.o(jump2collocation),
        I: common_vendor.t(common_vendor.unref(comments).total || 0),
        J: common_vendor.unref(comments).comment_list
      }, common_vendor.unref(comments).comment_list ? {
        K: common_vendor.f(common_vendor.unref(comments).comment_list, (item, index, i0) => {
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
        L: common_vendor.s({
          fontSize: "12px",
          position: "absolute",
          bottom: "3px",
          right: "15px",
          fontWeight: "1000"
        }),
        M: common_vendor.o(getBrandComments)
      } : {}, {
        N: displayMask.value,
        O: common_vendor.o(handleMaskTap),
        P: common_vendor.unref(replyForItem).id
      }, common_vendor.unref(replyForItem).id ? {
        Q: common_vendor.t("@" + common_vendor.unref(replyForItem).username)
      } : {}, {
        R: common_vendor.o(handleFocus),
        S: common_vendor.o(handleFocus),
        T: common_vendor.o(handleBlur),
        U: common_vendor.unref(myComment),
        V: common_vendor.o(($event) => common_vendor.isRef(myComment) ? myComment.value = $event.detail.value : myComment = $event.detail.value),
        W: common_vendor.o(addComments),
        X: footerBottomHeight.value
      }) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7e2880f6"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/goods/goods.js.map
