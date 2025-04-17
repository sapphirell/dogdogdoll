"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const common_config = require("../../common/config.js");
const _sfc_main = {
  __name: "collocation_share",
  setup(__props) {
    const detailData = common_vendor.ref({
      title: "",
      content: "",
      image_url_list: [],
      collocation_relation_list: []
    });
    const authorInfo = common_vendor.ref({
      userName: "",
      avatar: ""
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
      common_vendor.index.__f__("log", "at pages/collocation_share/collocation_share.vue:196", "footer-brand:" + bottom);
      return bottom;
    });
    const loading = common_vendor.ref(true);
    const error = common_vendor.ref(false);
    const errorMsg = common_vendor.ref("");
    const pageId = common_vendor.ref(0);
    const origin = common_vendor.ref(0);
    let hasLike = common_vendor.ref(false);
    let comments = common_vendor.ref({});
    let commentsPage = common_vendor.ref(1);
    let myComment = common_vendor.ref("");
    let replyForItem = common_vendor.ref({});
    common_vendor.index.setNavigationBarTitle({
      title: "搭配详情"
    });
    const getGoodsInfo = (id) => {
      return new Promise((resolve, reject) => {
        if (!id || id === 0) {
          reject("无效的商品ID");
          return;
        }
        common_vendor.index.request({
          url: `${common_config.websiteUrl}/goods?id=${id}`,
          method: "GET",
          timeout: 5e3,
          success: (res) => {
            if (res.data.status === "success") {
              resolve(res.data.data);
            } else {
              reject(res.data.msg || "获取商品信息失败");
            }
          },
          fail: (err) => {
            common_vendor.index.__f__("error", "at pages/collocation_share/collocation_share.vue:245", err);
            common_vendor.index.showToast({
              title: "网络请求失败",
              icon: "none"
            });
            reject(err);
          }
        });
      });
    };
    function viewFullImage(index) {
      common_vendor.index.__f__("log", "at pages/collocation_share/collocation_share.vue:258", detailData);
      common_vendor.index.previewImage({
        current: detailData.value.image_url_list[index],
        urls: detailData.value.image_url_list
      });
    }
    const fetchData = async (id, origin2) => {
      var _a;
      try {
        const res = await common_vendor.index.request({
          url: common_config.websiteUrl + `/view-collocation?collocation_id=${id}&origin=${origin2}`
        });
        if (res.data.status !== "success") {
          handleError(res.data.msg || "数据加载失败");
          return;
        }
        const processedData = {
          ...res.data.data,
          image_url_list: Array.isArray(res.data.data.image_url_list) ? res.data.data.image_url_list : [res.data.data.image_urls],
          collocation_relation_list: await Promise.all(
            res.data.data.collocation_relation_list.map(async (item) => {
              try {
                const goodsInfo = item.relation_goods_id > 0 ? await getGoodsInfo(item.relation_goods_id) : null;
                return {
                  ...item,
                  goodsInfo,
                  imageLoaded: !!goodsInfo,
                  imageError: !goodsInfo
                };
              } catch (error2) {
                common_vendor.index.__f__("error", "at pages/collocation_share/collocation_share.vue:297", "商品信息获取失败:", error2);
                return {
                  ...item,
                  goodsInfo: null,
                  imageLoaded: false,
                  imageError: true
                };
              }
            })
          )
        };
        detailData.value = processedData;
        if ((_a = res.data.data) == null ? void 0 : _a.uid) {
          await getAuthorInfo(res.data.data.uid);
        }
      } catch (error2) {
        handleError("数据加载失败");
      } finally {
        loading.value = false;
      }
    };
    const navigateToGoods = (goodsId) => {
      if (goodsId == 0) {
        common_vendor.index.showToast({
          title: "商品暂时没有录入",
          icon: "none"
        });
        return;
      }
      common_vendor.index.navigateTo({
        url: `/pages/goods/goods?goods_id=${goodsId}`
      });
    };
    const getAuthorInfo = async (uid) => {
      try {
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl}/user-info?uid=${uid}`,
          method: "GET"
        });
        if (res.data.status === "success") {
          authorInfo.value = res.data.data;
        } else {
          common_vendor.index.__f__("error", "at pages/collocation_share/collocation_share.vue:348", "获取用户信息失败:", res.data.msg);
        }
      } catch (error2) {
        common_vendor.index.__f__("error", "at pages/collocation_share/collocation_share.vue:351", "用户信息请求失败:", error2);
        common_vendor.index.showToast({
          title: "作者信息加载失败",
          icon: "none"
        });
      }
    };
    const navigateToUser = (uid) => {
      if (uid) {
        common_vendor.index.navigateTo({
          url: `/pages/user/profile?uid=${uid}`
        });
      }
    };
    const handleError = (msg) => {
      error.value = true;
      errorMsg.value = msg;
      common_vendor.index.showToast({
        title: msg,
        icon: "none"
      });
    };
    function likeFn() {
      let token = common_vendor.index.getStorageSync("token");
      if (!common_config.global.isLogin) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        return;
      }
      let type = origin.value == 1 ? 3 : 4;
      let requestData = {
        id: parseInt(detailData.value.id),
        type
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
          common_vendor.index.__f__("log", "at pages/collocation_share/collocation_share.vue:406", res.data);
          if (res.data.status == "success") {
            common_vendor.index.showToast({
              title: "操作成功",
              icon: "success"
            });
            hasLike.value = !hasLike.value;
            getHasLike(detailData.value.id);
            fetchData(detailData.value.id, origin.value);
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
          common_vendor.index.__f__("log", "at pages/collocation_share/collocation_share.vue:425", err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        }
      });
    }
    function getHasLike(id) {
      let token = common_vendor.index.getStorageSync("token");
      if (token == "") {
        return;
      }
      let type = origin.value == 1 ? 3 : 4;
      common_vendor.index.request({
        url: common_config.websiteUrl + "/with-state/hasLike?id=" + id + "&type=" + type,
        method: "POST",
        header: {
          "Authorization": token
        },
        success: (res) => {
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
          common_vendor.index.__f__("log", "at pages/collocation_share/collocation_share.vue:465", err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
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
    function getCollocationComments() {
      common_vendor.index.request({
        url: common_config.websiteUrl + "/collocation-comment?collocation_id=" + pageId.value + "&page=" + commentsPage.value,
        method: "GET",
        timeout: 5e3,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/collocation_share/collocation_share.vue:490", res.data.data);
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
          common_vendor.index.__f__("log", "at pages/collocation_share/collocation_share.vue:511", err);
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
        target_id: parseInt(pageId.value),
        type: 3
        // 搭配分享
      };
      if (replyForItem.value.id) {
        requestData.reply_id = replyForItem.value.id;
        requestData.reply_for = replyForItem.value.comment;
        requestData.reply_user_id = replyForItem.value.user_id;
      }
      common_vendor.index.__f__("log", "at pages/collocation_share/collocation_share.vue:548", requestData);
      common_vendor.index.request({
        url: common_config.websiteUrl + "/with-state/add-comment",
        method: "POST",
        header: {
          "Authorization": token
        },
        data: requestData,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/collocation_share/collocation_share.vue:557", res.data);
          if (res.data.status == "success") {
            common_vendor.index.showToast({
              title: "评论成功",
              icon: "success"
            });
            myComment.value = "";
            commentsPage.value = 1;
            comments.value = {};
            getCollocationComments();
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
          common_vendor.index.__f__("log", "at pages/collocation_share/collocation_share.vue:579", err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        }
      });
    }
    function replyFor(item) {
      if (replyForItem.value.id == item.id) {
        replyForItem.value = {};
        return;
      }
      replyForItem.value = item;
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
    common_vendor.onLoad((options) => {
      if (!options.collocation_id) {
        error.value = true;
        errorMsg.value = "缺少必要参数Id";
        return;
      }
      if (!options.origin) {
        error.value = true;
        errorMsg.value = "缺少必要参数Origin";
        return;
      }
      pageId.value = options.collocation_id;
      origin.value = options.origin;
      fetchData(options.collocation_id, options.origin);
      common_config.asyncGetUserInfo().then((userInfo) => {
        common_vendor.index.__f__("log", "at pages/collocation_share/collocation_share.vue:628", userInfo);
        getHasLike(options.collocation_id);
      });
      getCollocationComments();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: !common_vendor.unref(hasLike)
      }, !common_vendor.unref(hasLike) ? {
        b: common_assets._imports_0$5
      } : {
        c: common_assets._imports_1$4
      }, {
        d: common_vendor.t(formatNumber(detailData.value.like_count)),
        e: common_vendor.o(($event) => likeFn()),
        f: common_vendor.f(detailData.value.image_url_list, (img, index, i0) => {
          return {
            a: img,
            b: common_vendor.o(($event) => viewFullImage(index), index),
            c: index
          };
        }),
        g: authorInfo.value.avatar,
        h: common_vendor.t(authorInfo.value.user_name || "未知用户"),
        i: common_vendor.o(($event) => navigateToUser(detailData.value.uid)),
        j: common_vendor.t(detailData.value.title),
        k: common_vendor.t(detailData.value.content),
        l: common_vendor.f(detailData.value.collocation_relation_list, (item, k0, i0) => {
          var _a, _b;
          return common_vendor.e({
            a: item.relation_goods_id === 0
          }, item.relation_goods_id === 0 ? {} : common_vendor.e({
            b: item.imageLoaded
          }, item.imageLoaded ? {
            c: ((_b = (_a = item.goodsInfo) == null ? void 0 : _a.goods_images) == null ? void 0 : _b[0]) || "/static/goods-default.png"
          } : item.imageError ? {} : {}, {
            d: item.imageError
          }), {
            e: common_vendor.t(item.relation_brand_name),
            f: common_vendor.t(item.type),
            g: common_vendor.t(item.relation_goods_name),
            h: item.id,
            i: common_vendor.o(($event) => item.relation_goods_id > 0 ? navigateToGoods(item.relation_goods_id) : null, item.id)
          });
        }),
        m: common_vendor.t(common_vendor.unref(comments).total || 0),
        n: common_vendor.unref(comments).comment_list
      }, common_vendor.unref(comments).comment_list ? {
        o: common_vendor.f(common_vendor.unref(comments).comment_list, (item, index, i0) => {
          return {
            a: item.avatar,
            b: common_vendor.t(item.username),
            c: common_vendor.t(item.comment),
            d: common_vendor.t(formatTimestamp(item.created_at)),
            e: common_vendor.t(item.floor),
            f: common_vendor.s(common_vendor.unref(replyForItem).id === item.id ? {
              color: "#fd6669"
            } : {
              color: "#888"
            }),
            g: common_vendor.o(($event) => replyFor(item), item.id),
            h: item.id
          };
        }),
        p: common_vendor.s({
          fontSize: "12px",
          position: "absolute",
          bottom: "3px",
          right: "15px",
          fontWeight: "1000"
        }),
        q: common_vendor.o(getCollocationComments)
      } : {}, {
        r: common_vendor.unref(replyForItem).id
      }, common_vendor.unref(replyForItem).id ? {
        s: common_vendor.t("@" + common_vendor.unref(replyForItem).username)
      } : {}, {
        t: common_vendor.unref(myComment),
        v: common_vendor.o(($event) => common_vendor.isRef(myComment) ? myComment.value = $event.detail.value : myComment = $event.detail.value),
        w: common_vendor.o(addComments),
        x: footerBottomHeight.value,
        y: loading.value
      }, loading.value ? {} : {}, {
        z: error.value
      }, error.value ? {
        A: common_vendor.t(errorMsg.value)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-38d96b75"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/collocation_share/collocation_share.js.map
