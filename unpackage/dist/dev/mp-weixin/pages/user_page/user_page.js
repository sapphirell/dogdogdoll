"use strict";
const common_vendor = require("../../common/vendor.js");
const common_config = require("../../common/config.js");
const _sfc_main = {
  __name: "user_page",
  props: ["uid"],
  setup(__props) {
    const currentTab = common_vendor.ref(0);
    const tabs = common_vendor.ref(["搭配", "娃柜", "点评"]);
    const props = __props;
    const userInfo = common_vendor.ref({
      avatar: "",
      user_name: "加载中..."
    });
    const collocations = common_vendor.ref([]);
    const dolls = common_vendor.ref([]);
    const reviews = common_vendor.ref([]);
    const paginations = common_vendor.ref([
      {
        // 搭配
        page: 1,
        pageSize: 10,
        total: 0,
        loading: false,
        finished: false
      },
      {
        // 娃柜
        page: 1,
        pageSize: 10,
        total: 0,
        loading: false,
        finished: false
      },
      {
        // 点评
        page: 1,
        pageSize: 10,
        total: 0,
        loading: false,
        finished: false
      }
    ]);
    common_vendor.watch(currentTab, (newVal) => {
      paginations.value[newVal];
      const currentData = [collocations, dolls, reviews][newVal].value;
      if (currentData.length === 0) {
        loadData();
      }
    });
    const loadData = async () => {
      const currentPagination = paginations.value[currentTab.value];
      if (currentPagination.loading || currentPagination.finished) {
        return;
      }
      currentPagination.loading = true;
      try {
        let url, listKey;
        switch (currentTab.value) {
          case 0:
            url = `/user-info/collection?user_id=${props.uid}&page=${currentPagination.page}`;
            listKey = "List";
            break;
          case 1:
            url = `/user-info/show-case?user_id=${props.uid}&page=${currentPagination.page}`;
            listKey = "List";
            break;
          case 2:
            url = `/user-info/posts?user_id=${props.uid}&page=${currentPagination.page}`;
            listKey = "comment_list";
            break;
        }
        common_vendor.index.__f__("log", "at pages/user_page/user_page.vue:150", `${common_config.websiteUrl}${url}`);
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl}${url}`
        });
        if (res.data.status === "success") {
          const data = res.data.data;
          const list = data[listKey];
          const transformed = list.map((item) => {
            var _a, _b;
            switch (currentTab.value) {
              case 0:
                return {
                  id: item.id,
                  cover: ((_a = item.image_urls) == null ? void 0 : _a.split(",")[0]) || "",
                  images: ((_b = item.image_urls) == null ? void 0 : _b.split(",")) || [],
                  title: item.title,
                  time: item.created_at
                };
              case 1:
                return {
                  id: item.id,
                  cover: item.image_url,
                  title: item.name,
                  desc: item.description,
                  time: item.created_at
                };
              case 2:
                return {
                  id: item.id,
                  product_thumb: item.target_image,
                  product_name: item.target_name,
                  content: item.comment,
                  create_time: formatTime(item.created_at)
                };
            }
          });
          const target = [collocations, dolls, reviews][currentTab.value];
          target.value = [...target.value, ...transformed];
          currentPagination.total = data.total;
          currentPagination.finished = target.value.length >= data.total;
          currentPagination.page++;
        }
      } catch (error) {
        common_vendor.index.__f__("log", "at pages/user_page/user_page.vue:199", error);
        common_vendor.index.showToast({
          title: "数据加载失败",
          icon: "none"
        });
      } finally {
        currentPagination.loading = false;
      }
    };
    const getAuthorInfo = async () => {
      try {
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl}/user-info?uid=${props.uid}`
        });
        if (res.data.status === "success") {
          userInfo.value = res.data.data;
        }
      } catch (error) {
        common_vendor.index.showToast({
          title: "用户信息加载失败",
          icon: "none"
        });
      }
    };
    const formatTime = (timestamp) => {
      const date = new Date(timestamp * 1e3);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
    };
    common_vendor.index.setNavigationBarTitle({
      title: "用户主页"
    });
    common_vendor.onShow(() => {
      getAuthorInfo();
      loadData();
    });
    common_vendor.onReachBottom(() => {
      loadData();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: userInfo.value.avatar,
        b: common_vendor.t(userInfo.value.user_name),
        c: common_vendor.f(tabs.value, (tab, index, i0) => {
          return {
            a: common_vendor.t(tab),
            b: index,
            c: currentTab.value === index ? 1 : "",
            d: common_vendor.o(($event) => currentTab.value = index, index)
          };
        }),
        d: currentTab.value === 0
      }, currentTab.value === 0 ? {
        e: common_vendor.f(collocations.value, (item, index, i0) => {
          return {
            a: item.cover,
            b: common_vendor.t(item.title),
            c: index,
            d: common_vendor.o(($event) => _ctx.navigateTo(`/pages/collocation_share/collocation_share?collocation_id=${item.id}`), index)
          };
        })
      } : {}, {
        f: currentTab.value === 1
      }, currentTab.value === 1 ? {
        g: common_vendor.f(dolls.value, (item, index, i0) => {
          return {
            a: item.cover,
            b: common_vendor.t(item.title),
            c: common_vendor.t(item.price),
            d: index,
            e: common_vendor.o(($event) => _ctx.navigateTo(`/pages/user_doll/user_doll?id=${item.id}`), index)
          };
        })
      } : {}, {
        h: currentTab.value === 2
      }, currentTab.value === 2 ? {
        i: common_vendor.f(reviews.value, (item, index, i0) => {
          return {
            a: item.product_thumb,
            b: common_vendor.t(item.product_name),
            c: common_vendor.t(item.content),
            d: common_vendor.t(item.create_time),
            e: index
          };
        })
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c3556478"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user_page/user_page.js.map
