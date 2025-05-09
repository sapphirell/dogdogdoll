"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const common_config = require("../../common/config.js");
const _sfc_main = {
  __name: "my_collocation",
  setup(__props) {
    const list = common_vendor.ref([]);
    const page = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const total = common_vendor.ref(0);
    const loading = common_vendor.ref(false);
    const noMore = common_vendor.ref(false);
    const formatTime = (timestamp) => {
      const date = new Date(timestamp * 1e3);
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    };
    const getList = async () => {
      if (noMore.value || loading.value)
        return;
      loading.value = true;
      try {
        const userInfo = await common_config.asyncGetUserInfo();
        if (!userInfo)
          return;
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl}/with-state/my-collocation`,
          method: "GET",
          header: {
            Authorization: common_vendor.index.getStorageSync("token")
          },
          data: {
            page: page.value,
            page_size: pageSize.value
          }
        });
        if (res.data.status === "success") {
          list.value = [...list.value, ...res.data.data.collocation_relation_list];
          total.value = res.data.data.total;
          noMore.value = list.value.length >= total.value;
          page.value++;
        }
      } catch (error) {
        common_vendor.index.showToast({ title: "加载失败", icon: "none" });
      } finally {
        loading.value = false;
      }
    };
    const loadMore = () => {
      if (!noMore.value)
        getList();
    };
    common_vendor.index.setNavigationBarTitle({
      title: "我的搭配"
    });
    common_vendor.onMounted(() => {
      getList();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: list.value.length === 0 && !loading.value
      }, list.value.length === 0 && !loading.value ? {} : {}, {
        b: common_vendor.f(list.value, (item, index, i0) => {
          return common_vendor.e({
            a: item.avatar || `${common_vendor.unref(common_config.image1Url)}/default-avatar.png`,
            b: common_vendor.t(formatTime(item.created_at)),
            c: item.image_urls.length > 1
          }, item.image_urls.length > 1 ? {
            d: common_vendor.f(item.image_urls, (img, imgIndex, i1) => {
              return {
                a: img,
                b: imgIndex
              };
            })
          } : {
            e: item.image_urls[0]
          }, {
            f: common_vendor.t(item.title),
            g: common_vendor.t(item.content),
            h: item.relation_list.length > 0
          }, item.relation_list.length > 0 ? {
            i: common_vendor.f(item.relation_list, (rel, relIndex, i1) => {
              return {
                a: common_vendor.t(rel.type),
                b: common_vendor.t(rel.relation_goods_name || rel.relation_brand_name),
                c: relIndex
              };
            })
          } : {}, {
            j: index
          });
        }),
        c: loading.value
      }, loading.value ? {
        d: common_assets._imports_0$5
      } : {}, {
        e: noMore.value
      }, noMore.value ? {} : {}, {
        f: common_vendor.o(loadMore)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c07e3656"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my_collocation/my_collocation.js.map
