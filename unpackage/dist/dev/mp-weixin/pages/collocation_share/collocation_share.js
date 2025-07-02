"use strict";
const common_vendor = require("../../common/vendor.js");
const common_config = require("../../common/config.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_report_button2 = common_vendor.resolveComponent("report-button");
  const _easycom_comment_list2 = common_vendor.resolveComponent("comment-list");
  const _easycom_comment_input2 = common_vendor.resolveComponent("comment-input");
  (_easycom_uni_icons2 + _easycom_report_button2 + _easycom_comment_list2 + _easycom_comment_input2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_report_button = () => "../../components/report-button/report-button.js";
const _easycom_comment_list = () => "../../components/comment-list/comment-list.js";
const _easycom_comment_input = () => "../../components/comment-input/comment-input.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_report_button + _easycom_comment_list + _easycom_comment_input)();
}
const _sfc_main = {
  __name: "collocation_share",
  props: {
    collocation_id: {
      type: String,
      default: 0
    },
    origin: {
      type: String,
      default: 0
    }
  },
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
    common_vendor.index.getSystemInfoSync();
    const loading = common_vendor.ref(true);
    const error = common_vendor.ref(false);
    const errorMsg = common_vendor.ref("");
    const props = __props;
    const pageId = common_vendor.ref(0);
    const origin = common_vendor.ref(0);
    let hasLike = common_vendor.ref(false);
    const commentListRef = common_vendor.ref(null);
    const commentInputRef = common_vendor.ref(null);
    common_vendor.ref(1);
    let replyForItem = common_vendor.ref({});
    common_vendor.index.setNavigationBarTitle({
      title: "搭配详情"
    });
    function jump2user(uid) {
      common_vendor.index.navigateTo({
        url: "/pages/user_page/user_page?uid=" + uid
      });
    }
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
            common_vendor.index.__f__("error", "at pages/collocation_share/collocation_share.vue:213", err);
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
      common_vendor.index.__f__("log", "at pages/collocation_share/collocation_share.vue:226", detailData);
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
                common_vendor.index.__f__("error", "at pages/collocation_share/collocation_share.vue:265", "商品信息获取失败:", error2);
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
          common_vendor.index.__f__("error", "at pages/collocation_share/collocation_share.vue:316", "获取用户信息失败:", res.data.msg);
        }
      } catch (error2) {
        common_vendor.index.__f__("error", "at pages/collocation_share/collocation_share.vue:319", "用户信息请求失败:", error2);
        common_vendor.index.showToast({
          title: "作者信息加载失败",
          icon: "none"
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
          common_vendor.index.__f__("log", "at pages/collocation_share/collocation_share.vue:374", res.data);
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
          common_vendor.index.__f__("log", "at pages/collocation_share/collocation_share.vue:393", err);
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
          common_vendor.index.__f__("log", "at pages/collocation_share/collocation_share.vue:433", err);
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
    const handleReplyComment = ({
      parent,
      target
    }) => {
      var _a;
      common_vendor.index.__f__("log", "at pages/collocation_share/collocation_share.vue:457", "parent", parent);
      common_vendor.index.__f__("log", "at pages/collocation_share/collocation_share.vue:458", "target", target);
      let item = parent;
      if (target != null) {
        item = target;
      }
      if (replyForItem.value.id == item.id) {
        replyForItem.value = {};
        return;
      }
      common_vendor.index.__f__("log", "at pages/collocation_share/collocation_share.vue:469", "item", item);
      replyForItem.value = item;
      (_a = commentInputRef.value) == null ? void 0 : _a.focusInput();
    };
    const handleCommentSubmit = ({
      content,
      replyInfo,
      origin: origin2
    }) => {
      let token = common_vendor.index.getStorageSync("token");
      if (!common_config.global.isLogin) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        return;
      }
      common_vendor.index.__f__("log", "at pages/collocation_share/collocation_share.vue:501", "reply_info", replyInfo);
      const requestData = {
        content,
        origin: origin2,
        target_id: parseInt(pageId.value),
        type: props.origin == 1 ? 3 : 6,
        ...replyInfo.id && {
          reply_id: replyInfo.id,
          reply_for: replyInfo.comment,
          reply_user_id: replyInfo.user_id,
          parent_id: replyInfo.parent_id > 0 ? replyInfo.parent_id : replyInfo.id
        }
      };
      common_vendor.index.request({
        url: common_config.websiteUrl + "/with-state/add-comment",
        method: "POST",
        header: {
          "Authorization": token
        },
        data: requestData,
        success: (res) => {
          var _a, _b;
          if (res.data.status == "success") {
            const newComment = res.data.data;
            if (newComment.parent_id === 0) {
              (_a = commentListRef.value) == null ? void 0 : _a.addNewComment(newComment);
            } else {
              (_b = commentListRef.value) == null ? void 0 : _b.addReplyComment(newComment);
            }
            common_vendor.index.showToast({
              title: "评论成功",
              icon: "success"
            });
          } else {
            common_vendor.index.showToast({
              title: res.data.msg,
              icon: "none"
            });
          }
        },
        fail: (err) => {
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        }
      });
    };
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
    common_vendor.onShow(() => {
      common_vendor.index.__f__("log", "at pages/collocation_share/collocation_share.vue:575", "注册键盘弹出事件");
      common_vendor.index.onKeyboardHeightChange(keyboardHeightChangeHandler);
    });
    common_vendor.onLoad((options) => {
      try {
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
          common_vendor.index.__f__("log", "at pages/collocation_share/collocation_share.vue:598", userInfo);
          getHasLike(options.collocation_id);
        });
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/collocation_share/collocation_share.vue:604", "onLoad Error:", err);
        common_vendor.index.showToast({
          title: "加载失败",
          icon: "none"
        });
      }
    });
    return (_ctx, _cache) => {
      var _a;
      return common_vendor.e({
        a: !common_vendor.unref(hasLike)
      }, !common_vendor.unref(hasLike) ? {
        b: common_vendor.p({
          type: "heart",
          size: "28",
          color: "#ff4d4f"
        })
      } : {
        c: common_vendor.p({
          type: "heart-filled",
          size: "28",
          color: "#ff4d4f"
        })
      }, {
        d: common_vendor.t(((_a = detailData.value) == null ? void 0 : _a.like_count) ? formatNumber(detailData.value.like_count) : 0),
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
        i: common_vendor.t(formatTimestamp(detailData.value.created_at)),
        j: common_vendor.o(($event) => jump2user(detailData.value.uid)),
        k: common_vendor.t(detailData.value.title),
        l: common_vendor.p({
          ["report-type"]: origin.value === 1 ? 2 : 1,
          ["relation-id"]: parseInt(pageId.value),
          ["icon-type"]: "flag",
          ["icon-color"]: "#999"
        }),
        m: common_vendor.t(detailData.value.content),
        n: common_vendor.f(detailData.value.collocation_relation_list, (item, k0, i0) => {
          var _a2, _b;
          return common_vendor.e({
            a: item.relation_goods_id === 0
          }, item.relation_goods_id === 0 ? {} : common_vendor.e({
            b: item.imageLoaded
          }, item.imageLoaded ? {
            c: ((_b = (_a2 = item.goodsInfo) == null ? void 0 : _a2.goods_images) == null ? void 0 : _b[0]) || "/static/goods-default.png"
          } : item.imageError ? {} : {}, {
            d: item.imageError
          }), {
            e: common_vendor.t(item.relation_brand_name),
            f: common_vendor.t(item.relation_goods_name),
            g: common_vendor.t(item.type),
            h: common_vendor.t(item.goodsInfo && item.goodsInfo.total_amount ? item.goodsInfo.total_amount + item.goodsInfo.currency : "贩售价格未收录"),
            i: item.id,
            j: common_vendor.o(($event) => item.relation_goods_id > 0 ? navigateToGoods(item.relation_goods_id) : null, item.id)
          });
        }),
        o: origin.value > 0
      }, origin.value > 0 ? {
        p: common_vendor.sr(commentListRef, "38d96b75-3", {
          "k": "commentListRef"
        }),
        q: common_vendor.o(handleReplyComment),
        r: common_vendor.p({
          type: origin.value == 1 ? 3 : 6,
          ["relation-id"]: parseInt(pageId.value)
        })
      } : {}, {
        s: detailData.value.title
      }, detailData.value.title ? {
        t: common_vendor.sr(commentInputRef, "38d96b75-4", {
          "k": "commentInputRef"
        }),
        v: common_vendor.o(handleCommentSubmit),
        w: common_vendor.o((val) => common_vendor.isRef(replyForItem) ? replyForItem.value = val : replyForItem = val),
        x: common_vendor.p({
          ["reply-info"]: common_vendor.unref(replyForItem),
          ["target-id"]: pageId.value
        })
      } : {}, {
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
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/collocation_share/collocation_share.js.map
