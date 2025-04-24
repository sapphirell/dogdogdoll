"use strict";
const common_vendor = require("../../common/vendor.js");
const common_config = require("../../common/config.js");
const _sfc_main = {
  __name: "sale_news",
  setup(__props) {
    const detailData = common_vendor.ref({
      title: "",
      content: "",
      image_list: [],
      created_at: 0
    });
    const brand = common_vendor.ref({
      brand_name: "",
      logo: ""
      // 其他品牌信息字段
    });
    const displayMask = common_vendor.ref(false);
    const loading = common_vendor.ref(true);
    const error = common_vendor.ref(false);
    const errorMsg = common_vendor.ref("");
    const pageId = common_vendor.ref(0);
    const brandId = common_vendor.ref(0);
    const hasLikeBrand = common_vendor.ref(false);
    const comments = common_vendor.ref({});
    let myComment = common_vendor.ref("");
    let commentsPage = common_vendor.ref(1);
    let replyForItem = common_vendor.ref({});
    const systemInfo = common_vendor.index.getSystemInfoSync();
    const keyboardHeight = common_vendor.ref(0);
    const footerBottomHeight = common_vendor.computed(() => {
      var _a;
      let safeBottom = ((_a = systemInfo.safeAreaInsets) == null ? void 0 : _a.bottom) || 10;
      if (keyboardHeight.value > 0) {
        safeBottom += keyboardHeight.value;
      }
      let bottom = `${safeBottom}px`;
      common_vendor.index.__f__("log", "at pages/sale_news/sale_news.vue:155", "footer-brand:" + bottom);
      return bottom;
    });
    function replyFor(item) {
      if (replyForItem.value.id == item.id) {
        replyForItem.value = {};
        return;
      }
      replyForItem.value = item;
    }
    const keyboardHeightChangeHandler = (res) => {
      common_vendor.index.__f__("log", "at pages/sale_news/sale_news.vue:173", "键盘高度变化", res);
      keyboardHeight.value = res.height;
    };
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
    function viewFullImage(index) {
      common_vendor.index.previewImage({
        current: goods.value.goods_images["index"],
        urls: goods.value.goods_images
      });
    }
    common_vendor.index.setNavigationBarTitle({
      title: "图透详情"
    });
    function jump2brand(id) {
      common_vendor.index.navigateTo({
        url: "/pages/brand/brand?brand_id=" + id
      });
    }
    const jump2user = (uid) => {
      common_vendor.index.navigateTo({
        url: "/pages/user_page/user_page?uid=" + uid
      });
    };
    function getCollocationComments() {
      common_vendor.index.request({
        url: common_config.websiteUrl + "/sale-news-comments?id=" + pageId.value + "&page=" + commentsPage.value,
        method: "GET",
        timeout: 5e3,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/sale_news/sale_news.vue:224", res.data.data);
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
          common_vendor.index.__f__("log", "at pages/sale_news/sale_news.vue:245", err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        }
      });
    }
    const fetchNewsDetail = async (id) => {
      try {
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl}/sale-news-detail?id=${id}`,
          timeout: 5e3
        });
        if (res.data.status === "success") {
          detailData.value = {
            ...res.data.data,
            image_list: res.data.data.image_list || []
          };
          getBrandsInfo();
        } else {
          handleError(res.data.msg || "数据加载失败");
        }
      } catch (err) {
        handleError("网络请求失败");
      } finally {
        loading.value = false;
      }
    };
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
        type: 4
      };
      if (replyForItem.value.id) {
        requestData.reply_id = replyForItem.value.id;
        requestData.reply_for = replyForItem.value.comment;
        requestData.reply_user_id = replyForItem.value.user_id;
      }
      common_vendor.index.__f__("log", "at pages/sale_news/sale_news.vue:305", requestData);
      common_vendor.index.request({
        url: common_config.websiteUrl + "/with-state/add-comment",
        method: "POST",
        header: {
          "Authorization": token
        },
        data: requestData,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/sale_news/sale_news.vue:314", res.data);
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
          common_vendor.index.__f__("log", "at pages/sale_news/sale_news.vue:336", err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
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
    const getBrandsInfo = () => {
      common_vendor.index.request({
        url: common_config.websiteUrl + "/brand-info?id=" + brandId.value,
        success: (res) => {
          if (res.data.status === "success") {
            brand.value = res.data.data;
            common_vendor.index.setNavigationBarTitle({
              title: res.data.data.brand_name
            });
            getHasLikeBrand();
          }
        },
        fail: () => handleError("品牌信息加载失败")
      });
    };
    const likeBrand = async () => {
      if (!common_config.global.isLogin) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        return;
      }
      const url = `/with-state/${hasLikeBrand.value ? "unlike" : "add-like"}`;
      common_vendor.index.request({
        url: common_config.websiteUrl + url,
        method: "POST",
        header: {
          Authorization: common_vendor.index.getStorageSync("token")
        },
        data: {
          id: parseInt(brandId.value),
          type: 2
          // 假设2代表品牌类型
        },
        success: (res) => {
          if (res.data.status === "success") {
            hasLikeBrand.value = !hasLikeBrand.value;
            common_vendor.index.showToast({
              title: hasLikeBrand.value ? "关注成功" : "已取消关注",
              icon: "none"
            });
          }
        }
      });
    };
    const getHasLikeBrand = () => {
      if (!common_config.global.isLogin)
        return;
      common_vendor.index.request({
        url: `${common_config.websiteUrl}/with-state/hasLike?id=${brandId.value}&type=2`,
        method: "POST",
        header: {
          Authorization: common_vendor.index.getStorageSync("token")
        },
        success: (res) => {
          var _a;
          hasLikeBrand.value = ((_a = res.data.data) == null ? void 0 : _a.id) > 0;
        }
      });
    };
    common_vendor.onShow(() => {
      common_vendor.index.__f__("log", "at pages/sale_news/sale_news.vue:429", "注册键盘弹出事件");
      common_vendor.index.onKeyboardHeightChange(keyboardHeightChangeHandler);
    });
    common_vendor.onLoad((options) => {
      if (!options.id || !options.brand_id) {
        handleError("缺少必要参数");
        return;
      }
      pageId.value = options.id;
      brandId.value = options.brand_id;
      fetchNewsDetail(options.id);
      getCollocationComments();
      common_config.asyncGetUserInfo().then(getHasLikeBrand);
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(detailData.value.image_list, (img, index, i0) => {
          return {
            a: img,
            b: common_vendor.o(($event) => viewFullImage(), index),
            c: index
          };
        }),
        b: brand.value.logo_image,
        c: common_vendor.o(($event) => jump2brand(brand.value.id)),
        d: common_vendor.t(brand.value.brand_name),
        e: common_vendor.t(formatTimestamp(detailData.value.created_at)),
        f: common_vendor.o(($event) => jump2brand(brand.value.id)),
        g: common_vendor.t(hasLikeBrand.value ? "已关注" : "+ 关注品牌"),
        h: common_vendor.o(likeBrand),
        i: hasLikeBrand.value ? "#ff6a6c" : "#65C3D6",
        j: common_vendor.t(detailData.value.title),
        k: common_vendor.t(detailData.value.content),
        l: comments.value.total
      }, comments.value.total ? {
        m: common_vendor.t(comments.value.total || 0)
      } : {}, {
        n: comments.value.comment_list
      }, comments.value.comment_list ? {
        o: common_vendor.f(comments.value.comment_list, (item, index, i0) => {
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
        p: common_vendor.s({
          fontSize: "12px",
          position: "absolute",
          bottom: "3px",
          right: "15px",
          fontWeight: "1000"
        })
      } : {}, {
        q: !comments.value.total
      }, !comments.value.total ? {} : {}, {
        r: comments.value.total
      }, comments.value.total ? {
        s: common_vendor.o(getCollocationComments)
      } : {}, {
        t: loading.value
      }, loading.value ? {} : {}, {
        v: error.value
      }, error.value ? {
        w: common_vendor.t(errorMsg.value)
      } : {}, {
        x: displayMask.value,
        y: common_vendor.o(handleMaskTap),
        z: common_vendor.unref(replyForItem).id
      }, common_vendor.unref(replyForItem).id ? {
        A: common_vendor.t("@" + common_vendor.unref(replyForItem).username)
      } : {}, {
        B: common_vendor.o(handleFocus),
        C: common_vendor.o(handleFocus),
        D: common_vendor.o(handleBlur),
        E: common_vendor.unref(myComment),
        F: common_vendor.o(($event) => common_vendor.isRef(myComment) ? myComment.value = $event.detail.value : myComment = $event.detail.value),
        G: common_vendor.o(addComments),
        H: footerBottomHeight.value
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c9c53f1c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/sale_news/sale_news.js.map
