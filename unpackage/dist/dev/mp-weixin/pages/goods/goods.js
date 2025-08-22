"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const common_config = require("../../common/config.js");
if (!Array) {
  const _easycom_view_logs2 = common_vendor.resolveComponent("view-logs");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_item_impression2 = common_vendor.resolveComponent("item-impression");
  const _easycom_comment_list2 = common_vendor.resolveComponent("comment-list");
  const _easycom_comment_input2 = common_vendor.resolveComponent("comment-input");
  (_easycom_view_logs2 + _easycom_uni_icons2 + _easycom_item_impression2 + _easycom_comment_list2 + _easycom_comment_input2)();
}
const _easycom_view_logs = () => "../../components/view-logs/view-logs.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_item_impression = () => "../../components/item-impression/item-impression.js";
const _easycom_comment_list = () => "../../components/comment-list/comment-list.js";
const _easycom_comment_input = () => "../../components/comment-input/comment-input.js";
if (!Math) {
  (_easycom_view_logs + _easycom_uni_icons + _easycom_item_impression + _easycom_comment_list + _easycom_comment_input)();
}
const _sfc_main = {
  __name: "goods",
  props: ["goods_id"],
  setup(__props) {
    const props = __props;
    common_vendor.index.getSystemInfoSync();
    common_vendor.ref(false);
    common_vendor.ref(false);
    common_vendor.ref("");
    const commentListRef = common_vendor.ref(null);
    const commentInputRef = common_vendor.ref(null);
    common_vendor.ref(1);
    let replyForItem = common_vendor.ref({});
    let goods = common_vendor.ref({});
    let swiperIndex = common_vendor.ref(1);
    let hasLike = common_vendor.ref(false);
    let collocationList = common_vendor.ref(false);
    let wishLoading = common_vendor.ref(false);
    let hasWish = common_vendor.ref(false);
    let wishCount = common_vendor.ref(0);
    const swiperHeight = common_vendor.ref(400);
    const imageHeights = common_vendor.ref([]);
    const maxHeight = common_vendor.ref(common_vendor.index.upx2px(1e3));
    const faceupList = common_vendor.ref([]);
    const faceupPage = common_vendor.ref(1);
    const faceupLoading = common_vendor.ref(false);
    const showFaceupSection = common_vendor.computed(() => {
      return goods.value.type === "单头" || goods.value.type === "整体";
    });
    const getFaceupList = async () => {
      if (!showFaceupSection.value)
        return;
      faceupLoading.value = true;
      try {
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl.value}/rand-bjd-faceup?goods_id=${props.goods_id}&page=${faceupPage.value}`,
          method: "GET",
          timeout: 5e3
        });
        if (res.data.status === "success") {
          if (faceupPage.value === 1) {
            faceupList.value = res.data.data || [];
          } else {
            faceupList.value = [...faceupList.value, ...res.data.data || []];
          }
        } else {
          common_vendor.index.showToast({
            title: res.data.msg || "获取妆图失败",
            icon: "none"
          });
        }
      } catch (err) {
        common_vendor.index.__f__("log", "at pages/goods/goods.vue:328", err);
        common_vendor.index.showToast({
          title: "网络请求失败",
          icon: "none"
        });
      } finally {
        faceupLoading.value = false;
      }
    };
    const refreshFaceupList = () => {
      getFaceupList();
    };
    const getFirstImage = (imageUrls) => {
      if (!imageUrls)
        return "";
      const urls = imageUrls.split(",");
      return urls[0].trim();
    };
    const handleReplyComment = ({
      parent,
      target
    }) => {
      var _a;
      common_vendor.index.__f__("log", "at pages/goods/goods.vue:352", "parent", parent);
      common_vendor.index.__f__("log", "at pages/goods/goods.vue:353", "target", target);
      let item = parent;
      if (target != null) {
        item = target;
      }
      if (replyForItem.value.id == item.id) {
        replyForItem.value = {};
        return;
      }
      common_vendor.index.__f__("log", "at pages/goods/goods.vue:364", "item", item);
      replyForItem.value = item;
      (_a = commentInputRef.value) == null ? void 0 : _a.focusInput();
    };
    const handleCommentSubmit = (submitData) => {
      var _a, _b, _c;
      let token = common_vendor.index.getStorageSync("token");
      if (!common_config.global.isLogin) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        return;
      }
      common_vendor.index.__f__("log", "at pages/goods/goods.vue:380", "reply_info", replyForItem.value);
      const requestData = {
        content: submitData.content,
        origin: submitData.origin,
        target_id: parseInt(props.goods_id),
        type: 2,
        // 商品类型
        image_url: submitData.image_url || "",
        association_id: submitData.association_id || 0,
        association_type: submitData.association_type || 0,
        is_anonymous: submitData.is_anonymous || 0,
        ...replyForItem.value.id && {
          reply_id: replyForItem.value.id,
          reply_for: replyForItem.value.comment,
          reply_uid: replyForItem.value.user_id,
          parent_id: replyForItem.value.parent_id > 0 ? replyForItem.value.parent_id : replyForItem.value.id
        }
      };
      const tempComment = {
        id: Date.now(),
        // 临时ID
        content: submitData.content,
        created_at: Math.floor(Date.now() / 1e3),
        like_count: 0,
        reply_count: 0,
        is_liked: false,
        floor: 0,
        // 临时楼层数
        // 匿名处理
        ...submitData.is_anonymous ? {
          avatar: "https://images1.fantuanpu.com/home/default_avatar.jpg",
          username: "匿名用户",
          is_anonymous: 1
        } : {
          avatar: common_config.global.userInfo.avatar,
          username: common_config.global.userInfo.nickname,
          is_anonymous: 0
        },
        // 关联信息
        ...submitData.association_id && {
          association_id: submitData.association_id,
          association_type: submitData.association_type
        },
        // 图片信息
        ...submitData.image_url && {
          image_url: submitData.image_url
        },
        // 回复信息
        ...replyForItem.value.id && {
          reply_id: replyForItem.value.id,
          reply_for: replyForItem.value.comment,
          reply_uid: replyForItem.value.user_id,
          parent_id: replyForItem.value.parent_id > 0 ? replyForItem.value.parent_id : replyForItem.value.id,
          // 处理被回复者的匿名状态
          reply_username: replyForItem.value.is_anonymous ? "匿名用户" : replyForItem.value.username
        }
      };
      if (!replyForItem.value.id) {
        (_a = commentListRef.value) == null ? void 0 : _a.addNewComment(tempComment);
      } else if (replyForItem.value.parent_id === 0) {
        (_b = commentListRef.value) == null ? void 0 : _b.addReplyComment({
          ...tempComment,
          parent_id: replyForItem.value.id
        });
      } else {
        (_c = commentListRef.value) == null ? void 0 : _c.addReplyComment({
          ...tempComment,
          parent_id: replyForItem.value.parent_id
        });
      }
      common_vendor.index.request({
        url: common_config.websiteUrl.value + "/with-state/add-comment",
        method: "POST",
        header: {
          "Authorization": token
        },
        data: requestData,
        success: (res) => {
          var _a2, _b2;
          if (res.data.status == "success") {
            const newComment = res.data.data;
            const finalComment = {
              ...newComment,
              ...submitData.is_anonymous ? {
                avatar: "https://images1.fantuanpu.com/home/default_avatar.jpg",
                username: "匿名用户",
                is_anonymous: 1
              } : {
                avatar: common_config.global.userInfo.avatar,
                username: common_config.global.userInfo.nickname,
                is_anonymous: 0
              }
            };
            if (newComment.reply_uid && replyForItem.value.is_anonymous) {
              finalComment.reply_username = "匿名用户";
            }
            (_a2 = commentListRef.value) == null ? void 0 : _a2.updateTempComment(tempComment.id, finalComment);
            common_vendor.index.showToast({
              title: "评论成功",
              icon: "success"
            });
          } else {
            (_b2 = commentListRef.value) == null ? void 0 : _b2.removeTempComment(tempComment.id);
            common_vendor.index.showToast({
              title: res.data.msg,
              icon: "none"
            });
          }
        },
        fail: (err) => {
          var _a2;
          (_a2 = commentListRef.value) == null ? void 0 : _a2.removeTempComment(tempComment.id);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        }
      });
    };
    function onImageLoad(index) {
      common_vendor.index.__f__("log", "at pages/goods/goods.vue:538", "图片加载完成", index);
      const query = common_vendor.index.createSelectorQuery();
      setTimeout(() => {
        query.select(`.swiper-image-${index}`).boundingClientRect((rect) => {
          try {
            if (!rect) {
              common_vendor.index.__f__("warn", "at pages/goods/goods.vue:545", "未找到图片元素");
              return;
            }
            common_vendor.index.__f__("log", "at pages/goods/goods.vue:548", rect);
            imageHeights.value[index] = rect.height;
            const validHeights = imageHeights.value.filter((h) => h > 0);
            if (validHeights.length === 0)
              return;
            const calculatedHeight = Math.max(...validHeights);
            swiperHeight.value = Math.min(calculatedHeight, maxHeight.value);
          } catch (e) {
            common_vendor.index.__f__("error", "at pages/goods/goods.vue:557", "高度计算异常:", e);
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
      common_vendor.index.__f__("log", "at pages/goods/goods.vue:574", e.detail.current);
      swiperIndex.value = e.detail.current + 1;
    }
    function getGoods() {
      common_vendor.index.request({
        url: common_config.websiteUrl.value + "/goods?id=" + props.goods_id,
        method: "GET",
        timeout: 5e3,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/goods/goods.vue:584", res.data.data);
          goods.value = res.data.data;
          getWishInfo();
          if (showFaceupSection.value) {
            faceupPage.value = 1;
            getFaceupList();
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/goods/goods.vue:595", err);
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
      if (!timestamp || timestamp <= 0)
        return "未知";
      const date = new Date(timestamp * 1e3);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}`;
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
        url: common_config.websiteUrl.value + url,
        method: "POST",
        header: {
          "Authorization": token
        },
        data: requestData,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/goods/goods.vue:665", res.data);
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
          common_vendor.index.__f__("log", "at pages/goods/goods.vue:684", err);
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
        url: common_config.websiteUrl.value + "/with-state/hasLike?id=" + props.goods_id + "&type=1",
        method: "POST",
        header: {
          "Authorization": token
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/goods/goods.vue:706", res.data);
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
          common_vendor.index.__f__("log", "at pages/goods/goods.vue:724", err);
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
    function addToShowcase() {
      if (!goods.value.id || !goods.value.name || !goods.value.brand_id || !goods.value.brand_name || !goods.value.type) {
        common_vendor.index.showToast({
          title: "商品信息不完整",
          icon: "none"
        });
        return;
      }
      const params = {
        goods_id: goods.value.id,
        goods_name: goods.value.name,
        brand_id: goods.value.brand_id,
        brand_name: goods.value.brand_name,
        type: goods.value.type
      };
      const query = Object.keys(params).map((key) => `${key}=${params[key]}`).join("&");
      common_vendor.index.navigateTo({
        url: `/pages/stock/showcase_form/showcase_form?${query}`
      });
    }
    function jump2faceup(id) {
      common_vendor.index.navigateTo({
        url: "/pages/artwork/artwork?id=" + id
      });
    }
    function selectType(type) {
    }
    function selectSize(size) {
    }
    function getCollocation() {
      common_vendor.index.request({
        url: common_config.websiteUrl.value + "/goods-collocation?goods_id=" + props.goods_id,
        method: "GET",
        timeout: 5e3,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/goods/goods.vue:827", res.data.data);
          collocationList.value = res.data.data;
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/goods/goods.vue:831", err);
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
    function addToStock() {
      common_vendor.index.navigateTo({
        url: `/pages/stock/account_book_form/account_book_form?goods_id=${props.goods_id}`
      });
    }
    function createBill(sale) {
      const params = {
        amount: sale.fin_amount,
        currency: sale.currency,
        name: goods.value.name,
        sale_id: sale.id
      };
      const query = Object.keys(params).map((key) => `${key}=${params[key]}`).join("&");
      common_vendor.index.navigateTo({
        url: `/pages/stock/bill_form/bill_form?${query}`
      });
    }
    function wishResale() {
      if (wishLoading.value)
        return;
      let token = common_vendor.index.getStorageSync("token");
      if (!common_config.global.isLogin) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        return;
      }
      wishLoading.value = true;
      common_vendor.index.request({
        url: common_config.websiteUrl.value + "/with-state/wish-restock",
        method: "POST",
        header: {
          "Authorization": token,
          "Content-Type": "application/json"
        },
        data: {
          goods_id: parseInt(props.goods_id)
        },
        success: (res) => {
          if (res.data.status === "success") {
            common_vendor.index.showToast({
              title: "许愿成功",
              icon: "success"
            });
            hasWish.value = true;
            wishCount.value = res.data.data.wish_count || wishCount.value + 1;
          } else {
            common_vendor.index.showToast({
              title: res.data.msg || "许愿失败",
              icon: "none"
            });
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/goods/goods.vue:934", "许愿请求失败:", err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        },
        complete: () => {
          wishLoading.value = false;
        }
      });
    }
    function getWishInfo() {
      let token = common_vendor.index.getStorageSync("token");
      common_vendor.index.request({
        url: common_config.websiteUrl.value + "/with-state/wish-info?goods_id=" + props.goods_id,
        method: "GET",
        header: token ? {
          "Authorization": token
        } : {},
        success: (res) => {
          if (res.data.status === "success") {
            hasWish.value = res.data.data.user_has_wished;
            wishCount.value = res.data.data.wish_count;
          }
        }
      });
    }
    getGoods();
    getCollocation();
    common_config.asyncGetUserInfo().then((userInfo) => {
      common_vendor.index.__f__("log", "at pages/goods/goods.vue:972", userInfo);
      getHasLike();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.unref(goods).name
      }, common_vendor.unref(goods).name ? common_vendor.e({
        b: common_vendor.p({
          type: common_vendor.unref(hasLike) ? "heart-filled" : "heart",
          size: "28",
          color: "#ff4d4f"
        }),
        c: common_vendor.t(formatNumber(common_vendor.unref(goods).goods_like_count)),
        d: common_vendor.o(($event) => likeFn()),
        e: common_vendor.f(common_vendor.unref(goods).goods_images, (item, key, i0) => {
          return {
            a: item,
            b: common_vendor.n("swiper-image-" + key),
            c: common_vendor.o(($event) => onImageLoad(key), key),
            d: key,
            e: viewFullImage()
          };
        }),
        f: common_vendor.o(onChange),
        g: swiperHeight.value + "px",
        h: maxHeight.value + "px",
        i: common_vendor.t(common_vendor.unref(swiperIndex)),
        j: common_vendor.t(common_vendor.unref(goods).goods_images.length),
        k: common_vendor.p({
          type: "plus",
          size: "18",
          color: "#fff"
        }),
        l: common_vendor.o(addToStock),
        m: common_vendor.p({
          type: "star",
          size: "18",
          color: "#fff"
        }),
        n: common_vendor.o(wishResale),
        o: common_vendor.p({
          type: "vip",
          size: "18",
          color: "#fff"
        }),
        p: common_vendor.o(addToShowcase),
        q: common_vendor.unref(goods).goods_name_image,
        r: common_vendor.t(common_vendor.unref(goods).type),
        s: common_vendor.o(($event) => selectType(common_vendor.unref(goods).type)),
        t: common_vendor.unref(goods).goods_price_image
      }, common_vendor.unref(goods).goods_price_image ? {
        v: common_vendor.unref(goods).goods_price_image
      } : common_vendor.unref(goods).goods_sales && common_vendor.unref(goods).goods_sales.length > 0 ? {
        x: common_vendor.t(common_vendor.unref(goods).goods_sales[0].sub_amount + common_vendor.unref(goods).goods_sales[0].fin_amount),
        y: common_vendor.t(common_vendor.unref(goods).goods_sales[0].currency)
      } : {}, {
        w: common_vendor.unref(goods).goods_sales && common_vendor.unref(goods).goods_sales.length > 0,
        z: common_vendor.t(common_vendor.unref(goods).sub_time1 > 0 ? formatTimestamp(common_vendor.unref(goods).sub_time1) : "未知"),
        A: common_vendor.t(common_vendor.unref(goods).size),
        B: common_vendor.t(common_vendor.unref(goods).size_detail),
        C: common_vendor.o(($event) => selectSize(common_vendor.unref(goods).size)),
        D: common_vendor.unref(goods).type === "单体" || common_vendor.unref(goods).type === "整体" || common_vendor.unref(goods).type === "单头"
      }, common_vendor.unref(goods).type === "单体" || common_vendor.unref(goods).type === "整体" || common_vendor.unref(goods).type === "单头" ? {
        E: common_vendor.t(common_vendor.unref(goods).body_size || "未知")
      } : {}, {
        F: common_vendor.t(common_vendor.unref(goods).skin),
        G: common_vendor.unref(goods).goods_brand_name_image
      }, common_vendor.unref(goods).goods_brand_name_image ? {
        H: common_vendor.o(($event) => jumpBrand(common_vendor.unref(goods).brand_id)),
        I: common_vendor.unref(goods).goods_brand_name_image
      } : {}, {
        J: common_vendor.t(common_vendor.unref(goods).doll_material),
        K: common_vendor.t(common_vendor.unref(goods).desc_content || "暂无备注信息"),
        L: common_vendor.unref(goods).goods_sales && common_vendor.unref(goods).goods_sales.length > 0
      }, common_vendor.unref(goods).goods_sales && common_vendor.unref(goods).goods_sales.length > 0 ? {
        M: common_vendor.f(common_vendor.unref(goods).goods_sales, (sale, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(sale.sale_type),
            b: common_vendor.t(sale.sub_amount + sale.fin_amount),
            c: common_vendor.t(sale.currency),
            d: common_vendor.t(formatTimestamp(sale.sub_time)),
            e: sale.sub_time_end > 0
          }, sale.sub_time_end > 0 ? {} : {}, {
            f: sale.sub_time_end > 0
          }, sale.sub_time_end > 0 ? {
            g: common_vendor.t(formatTimestamp(sale.sub_time_end))
          } : {}, {
            h: common_vendor.t(sale.size),
            i: common_vendor.t(sale.size_detail),
            j: "7e2880f6-5-" + i0,
            k: common_vendor.o(($event) => createBill(sale), sale.id),
            l: sale.id
          });
        }),
        N: common_vendor.p({
          type: "plus",
          size: "16",
          color: "#64c6dc"
        })
      } : {}, {
        O: common_vendor.p({
          target_id: props.goods_id,
          type: "2",
          ["goods-type"]: common_vendor.unref(goods).type
        }),
        P: common_assets._imports_2$2,
        Q: common_vendor.o(jump2collocation),
        R: common_vendor.f(common_vendor.unref(collocationList).collocation_relation_list, (collocation, k0, i0) => {
          return {
            a: getImageForList(collocation.image_urls),
            b: collocation.collocation_id,
            c: common_vendor.o(($event) => jump2collectionDetail(collocation.collocation_id, collocation.relation_origin), collocation.collocation_id)
          };
        }),
        S: common_vendor.p({
          type: "upload",
          size: "20",
          color: "#ccc"
        }),
        T: common_vendor.o(jump2collocation),
        U: showFaceupSection.value
      }, showFaceupSection.value ? {
        V: common_vendor.p({
          type: "refreshempty",
          size: "16",
          color: "#64c6dc"
        }),
        W: common_vendor.o(refreshFaceupList),
        X: common_vendor.f(faceupList.value, (faceup, index, i0) => {
          return {
            a: getFirstImage(faceup.face_up_image_urls),
            b: common_vendor.t(faceup.title),
            c: index,
            d: common_vendor.o(($event) => jump2faceup(faceup.id), index)
          };
        })
      } : {}, {
        Y: common_vendor.sr(commentListRef, "7e2880f6-9", {
          "k": "commentListRef"
        }),
        Z: common_vendor.o(handleReplyComment),
        aa: common_vendor.p({
          type: 2,
          ["relation-id"]: parseInt(props.goods_id)
        }),
        ab: common_vendor.sr(commentInputRef, "7e2880f6-10", {
          "k": "commentInputRef"
        }),
        ac: common_vendor.o(handleCommentSubmit),
        ad: common_vendor.o((val) => common_vendor.isRef(replyForItem) ? replyForItem.value = val : replyForItem = val),
        ae: common_vendor.p({
          ["reply-info"]: common_vendor.unref(replyForItem),
          ["target-id"]: props.goods_id
        })
      }) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7e2880f6"]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/goods/goods.js.map
