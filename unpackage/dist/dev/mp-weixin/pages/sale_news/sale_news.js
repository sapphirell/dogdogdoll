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
    const loading = common_vendor.ref(true);
    const error = common_vendor.ref(false);
    const errorMsg = common_vendor.ref("");
    const pageId = common_vendor.ref(0);
    const brandId = common_vendor.ref(0);
    const hasLikeBrand = common_vendor.ref(false);
    const comments = common_vendor.ref({});
    common_vendor.index.setNavigationBarTitle({ title: "图透详情" });
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
    const getBrandsInfo = () => {
      common_vendor.index.request({
        url: common_config.websiteUrl + "/brand-info?id=" + brandId.value,
        success: (res) => {
          if (res.data.status === "success") {
            brand.value = res.data.data;
            common_vendor.index.setNavigationBarTitle({ title: res.data.data.brand_name });
            getHasLikeBrand();
          }
        },
        fail: () => handleError("品牌信息加载失败")
      });
    };
    const likeBrand = async () => {
      if (!common_config.global.isLogin) {
        common_vendor.index.showToast({ title: "请先登录", icon: "none" });
        return;
      }
      const url = `/with-state/${hasLikeBrand.value ? "unlike" : "add-like"}`;
      common_vendor.index.request({
        url: common_config.websiteUrl + url,
        method: "POST",
        header: { Authorization: common_vendor.index.getStorageSync("token") },
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
        header: { Authorization: common_vendor.index.getStorageSync("token") },
        success: (res) => {
          var _a;
          hasLikeBrand.value = ((_a = res.data.data) == null ? void 0 : _a.id) > 0;
        }
      });
    };
    common_vendor.onLoad((options) => {
      if (!options.id || !options.brand_id) {
        handleError("缺少必要参数");
        return;
      }
      pageId.value = options.id;
      brandId.value = options.brand_id;
      fetchNewsDetail(options.id);
      common_config.asyncGetUserInfo().then(getHasLikeBrand);
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(detailData.value.image_list, (img, index, i0) => {
          return {
            a: img,
            b: common_vendor.o(($event) => _ctx.viewFullImage(index), index),
            c: index
          };
        }),
        b: brand.value.logo,
        c: common_vendor.t(brand.value.brand_name),
        d: common_vendor.t(_ctx.formatTimestamp(detailData.value.created_at)),
        e: common_vendor.t(hasLikeBrand.value ? "已关注" : "+ 关注品牌"),
        f: common_vendor.o(likeBrand),
        g: hasLikeBrand.value ? "#ff6a6c" : "#65C3D6",
        h: common_vendor.t(detailData.value.title),
        i: common_vendor.t(detailData.value.content),
        j: common_vendor.t(comments.value.total || 0),
        k: comments.value.comment_list
      }, comments.value.comment_list ? {
        l: common_vendor.f(comments.value.comment_list, (item, index, i0) => {
          return {
            a: item.avatar,
            b: common_vendor.t(item.username),
            c: common_vendor.t(item.comment),
            d: common_vendor.t(_ctx.formatTimestamp(item.created_at)),
            e: common_vendor.t(item.floor),
            f: common_vendor.s(_ctx.replyForItem.id === item.id ? {
              color: "#fd6669"
            } : {
              color: "#888"
            }),
            g: common_vendor.o(($event) => _ctx.replyFor(item), item.id),
            h: item.id
          };
        }),
        m: common_vendor.s({
          fontSize: "12px",
          position: "absolute",
          bottom: "3px",
          right: "15px",
          fontWeight: "1000"
        }),
        n: common_vendor.o((...args) => _ctx.getCollocationComments && _ctx.getCollocationComments(...args))
      } : {}, {
        o: loading.value
      }, loading.value ? {} : {}, {
        p: error.value
      }, error.value ? {
        q: common_vendor.t(errorMsg.value)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c9c53f1c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/sale_news/sale_news.js.map
