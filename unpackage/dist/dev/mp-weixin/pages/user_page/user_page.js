"use strict";
const common_vendor = require("../../common/vendor.js");
const common_config = require("../../common/config.js");
if (!Array) {
  const _easycom_view_logs2 = common_vendor.resolveComponent("view-logs");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  (_easycom_view_logs2 + _easycom_uni_icons2)();
}
const _easycom_view_logs = () => "../../components/view-logs/view-logs.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_view_logs + _easycom_uni_icons)();
}
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
    const is_blocked = common_vendor.ref(false);
    const they_blocked = common_vendor.ref(false);
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
    const navigateTo = (url) => {
      common_vendor.index.navigateTo({
        url
      });
    };
    const loadData = async () => {
      if (is_blocked.value || they_blocked.value)
        return;
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
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl.value}${url}`
        });
        if (res.data.status === "success") {
          const data = res.data.data;
          const list = data[listKey];
          const transformed = list.map((item) => {
            var _a, _b, _c;
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
                  cover: ((_c = item.image_urls) == null ? void 0 : _c.split(",")[0]) || "",
                  title: item.name,
                  desc: item.description,
                  time: item.created_at,
                  price: item.price || 0
                  // 添加价格字段
                };
              case 2:
                return {
                  id: item.id,
                  product_thumb: item.target_image,
                  product_name: item.target_name,
                  content: item.comment,
                  create_time: formatTime(item.created_at),
                  target_id: item.relation_id
                  // 添加目标ID用于跳转
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
        common_vendor.index.__f__("log", "at pages/user_page/user_page.vue:231", error);
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
          url: `${common_config.websiteUrl.value}/user-info?uid=${props.uid}`
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
    const getBlockStatus = async () => {
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        common_vendor.index.__f__("log", "at pages/user_page/user_page.vue:263", "未登录");
        return;
      }
      try {
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl.value}/with-state/blacklist/status`,
          method: "GET",
          data: {
            target_user_id: props.uid
          },
          header: {
            Authorization: token
          }
        });
        if (res.data.status === "success") {
          is_blocked.value = res.data.data.is_blocked;
          they_blocked.value = res.data.data.they_blocked;
        }
      } catch (error) {
        common_vendor.index.__f__("log", "at pages/user_page/user_page.vue:284", "获取黑名单状态失败", error);
      }
    };
    const toggleBlock = async () => {
      try {
        const token = common_vendor.index.getStorageSync("token");
        if (!token) {
          common_vendor.index.__f__("log", "at pages/user_page/user_page.vue:293", "未登录");
          return;
        }
        const action = is_blocked.value ? "remove" : "add";
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl.value}/with-state/blacklist/${action}?target_user_id=` + props.uid,
          method: "POST",
          header: {
            Authorization: token
          }
        });
        if (res.data.status === "success") {
          is_blocked.value = !is_blocked.value;
          common_vendor.index.showToast({
            title: is_blocked.value ? "已加入黑名单" : "已移除黑名单",
            icon: "none"
          });
          if (is_blocked.value || they_blocked.value) {
            collocations.value = [];
            dolls.value = [];
            reviews.value = [];
          }
        } else {
          common_vendor.index.showToast({
            title: res.data.msg,
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("log", "at pages/user_page/user_page.vue:328", "操作失败", error);
        common_vendor.index.showToast({
          title: "操作失败",
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
      getBlockStatus().then(() => {
        if (!is_blocked.value && !they_blocked.value) {
          loadData();
        }
      });
    });
    common_vendor.onReachBottom(() => {
      loadData();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: userInfo.value.avatar,
        b: common_vendor.t(userInfo.value.user_name),
        c: common_vendor.p({
          type: is_blocked.value ? "minus" : "minus",
          size: "16",
          color: "#fff"
        }),
        d: common_vendor.t(is_blocked.value ? "已拉黑" : "拉黑"),
        e: is_blocked.value ? 1 : "",
        f: common_vendor.o(toggleBlock),
        g: !is_blocked.value && !they_blocked.value
      }, !is_blocked.value && !they_blocked.value ? common_vendor.e({
        h: common_vendor.f(tabs.value, (tab, index, i0) => {
          return {
            a: common_vendor.t(tab),
            b: index,
            c: currentTab.value === index ? 1 : "",
            d: common_vendor.o(($event) => currentTab.value = index, index)
          };
        }),
        i: currentTab.value === 0
      }, currentTab.value === 0 ? {
        j: common_vendor.f(collocations.value, (item, index, i0) => {
          return {
            a: item.cover,
            b: common_vendor.t(item.title),
            c: index,
            d: common_vendor.o(($event) => navigateTo(`/pages/collocation_share/collocation_share?collocation_id=${item.id}&origin=1`), index)
          };
        })
      } : {}, {
        k: currentTab.value === 1
      }, currentTab.value === 1 ? {
        l: common_vendor.f(dolls.value, (item, index, i0) => {
          return {
            a: item.cover,
            b: common_vendor.t(item.title),
            c: common_vendor.t(item.price),
            d: index,
            e: common_vendor.o(($event) => navigateTo(`/pages/collocation_share/collocation_share?collocation_id=${item.id}&origin=2`), index)
          };
        })
      } : {}, {
        m: currentTab.value === 2
      }, currentTab.value === 2 ? {
        n: common_vendor.f(reviews.value, (item, index, i0) => {
          return {
            a: item.product_thumb,
            b: common_vendor.t(item.product_name),
            c: common_vendor.t(item.content),
            d: common_vendor.t(item.create_time),
            e: index,
            f: common_vendor.o(($event) => navigateTo(`/pages/goods/goods?goods_id=${item.target_id}`), index)
          };
        })
      } : {}) : {}, {
        o: is_blocked.value || they_blocked.value
      }, is_blocked.value || they_blocked.value ? {
        p: common_vendor.p({
          type: "minus",
          size: "48",
          color: "#ccc"
        })
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c3556478"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user_page/user_page.js.map
