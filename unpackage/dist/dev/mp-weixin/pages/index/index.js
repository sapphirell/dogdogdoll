"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const common_config = require("../../common/config.js");
if (!Array) {
  const _easycom_privacy_permission_modal2 = common_vendor.resolveComponent("privacy-permission-modal");
  const _easycom_version_check2 = common_vendor.resolveComponent("version-check");
  const _easycom_loading_toast2 = common_vendor.resolveComponent("loading-toast");
  const _easycom_goods_search2 = common_vendor.resolveComponent("goods-search");
  const _easycom_uni_transition2 = common_vendor.resolveComponent("uni-transition");
  const _easycom_common_search2 = common_vendor.resolveComponent("common-search");
  const _easycom_index_brand2 = common_vendor.resolveComponent("index-brand");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  (_easycom_privacy_permission_modal2 + _easycom_version_check2 + _easycom_loading_toast2 + _easycom_goods_search2 + _easycom_uni_transition2 + _easycom_common_search2 + _easycom_index_brand2 + _easycom_uni_icons2)();
}
const _easycom_privacy_permission_modal = () => "../../components/privacy-permission-modal/privacy-permission-modal.js";
const _easycom_version_check = () => "../../components/version-check/version-check.js";
const _easycom_loading_toast = () => "../../components/loading-toast/loading-toast.js";
const _easycom_goods_search = () => "../../components/goods-search/goods-search.js";
const _easycom_uni_transition = () => "../../uni_modules/uni-transition/components/uni-transition/uni-transition.js";
const _easycom_common_search = () => "../../components/common-search/common-search.js";
const _easycom_index_brand = () => "../../components/index-brand/index-brand.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_privacy_permission_modal + _easycom_version_check + _easycom_loading_toast + _easycom_goods_search + _easycom_uni_transition + _easycom_common_search + _easycom_index_brand + _easycom_uni_icons)();
}
const _sfc_main = {
  __name: "index",
  setup(__props) {
    common_vendor.useCssVars((_ctx) => ({
      "4455f122": headerHeight.value
    }));
    let brandsList = common_vendor.ref([]);
    let data = common_vendor.ref({});
    let cursor = common_vendor.ref("");
    let showLoadding = common_vendor.ref(false);
    const tabs = common_vendor.ref([
      {
        label: "中国娃社",
        value: 1
      },
      {
        label: "个人作者",
        value: 2
      },
      {
        label: "外国娃社",
        value: 3
      }
    ]);
    const activeSearchType = common_vendor.ref(1);
    common_vendor.ref(0);
    const systemInfo = common_vendor.index.getSystemInfoSync();
    common_vendor.ref(0);
    const page = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const hasMore = common_vendor.ref(true);
    const loading = common_vendor.ref(false);
    let newsList = common_vendor.ref([]);
    const newsPage = common_vendor.ref(1);
    const newsPageSize = common_vendor.ref(10);
    const newsHasMore = common_vendor.ref(true);
    const newsLoading = common_vendor.ref(false);
    let hotList = common_vendor.ref([]);
    const hotPage = common_vendor.ref(1);
    const hotPageSize = common_vendor.ref(10);
    const hotHasMore = common_vendor.ref(true);
    const hotLoading = common_vendor.ref(false);
    let treeholeList = common_vendor.ref([]);
    const treeholePage = common_vendor.ref(1);
    const treeholePageSize = common_vendor.ref(10);
    const treeholeHasMore = common_vendor.ref(true);
    const treeholeLoading = common_vendor.ref(false);
    const activeTab = common_vendor.ref("news");
    const switchTab = (tab) => {
      activeTab.value = tab;
    };
    const navBarHeight = common_vendor.computed(() => {
      const menuButtonInfo = common_vendor.index.getMenuButtonBoundingClientRect();
      const statusBarHeight = systemInfo.statusBarHeight || 32;
      return menuButtonInfo.bottom + menuButtonInfo.top - 2 * statusBarHeight;
    });
    const headerHeight = common_vendor.computed(() => {
      return navBarHeight.value + "px";
    });
    common_vendor.onPullDownRefresh(async () => {
      try {
        await refreshData();
        common_vendor.index.stopPullDownRefresh();
      } catch (error) {
        common_vendor.index.stopPullDownRefresh();
        common_vendor.index.showToast({
          title: "刷新失败",
          icon: "none"
        });
      }
    });
    const refreshData = async () => {
      showLoadding.value = true;
      setTimeout(async () => {
        const refreshActions = {
          "brands": () => {
            page.value = 1;
            brandsList.value = [];
            hasMore.value = true;
            getBrands(true);
          },
          "news": () => {
            newsPage.value = 1;
            newsList.value = [];
            newsHasMore.value = true;
            getNews(true);
          },
          "hot": () => {
            hotPage.value = 1;
            hotList.value = [];
            hotHasMore.value = true;
            getHotCollocations(true);
          },
          "second": () => {
            treeholePage.value = 1;
            treeholeList.value = [];
            treeholeHasMore.value = true;
            getTreeholeList(true);
          }
        };
        await refreshActions[activeTab.value]();
      }, 800);
    };
    const handleBannerClick = (item) => {
      common_vendor.index.navigateTo({
        url: `/pages/article_detail/article_detail?id=${item.id}`
      });
    };
    function jump2saleNews(item) {
      common_vendor.index.navigateTo({
        url: "/pages/sale_news/sale_news?id=" + item.id + "&brand_id=" + item.brand_id
      });
    }
    const getArticles = () => {
      common_vendor.index.request({
        url: common_config.websiteUrl + "/articles",
        data: {
          page: 1,
          page_size: 10,
          status: 1
          // 只获取已发布文章
        },
        success: (res) => {
          if (res.data.status === "success") {
            data.value = res.data.data.list;
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/index/index.vue:484", "获取Banner失败:", err);
          data.value = {};
        }
      });
    };
    const handleTabClick = (value) => {
      if (activeSearchType.value === value) {
        activeSearchType.value = null;
      } else {
        activeSearchType.value = value;
      }
      page.value = 1;
      hasMore.value = true;
      brandsList.value = [];
      cursor.value = "";
      getBrands();
    };
    function jump2userWhenNotAnonymous(item) {
      if (item.is_anonymous == 1) {
        return;
      }
      common_vendor.index.navigateTo({
        url: "/pages/user_page/user_page?uid=" + item.uid
      });
    }
    function copyUrl(item) {
      let url = "http://m.dogdogdoll.com/#/pages/treehole_detail/treehole_detail?id=" + item.id;
      common_vendor.index.setClipboardData({
        data: url,
        success: function() {
          common_vendor.index.showToast({
            title: "复制链接成功",
            icon: "none"
          });
        }
      });
    }
    const getNews = async (isRefresh = false) => {
      if (isRefresh)
        newsPage.value = 1;
      if (!newsHasMore.value || newsLoading.value)
        return;
      newsLoading.value = true;
      showLoadding.value = true;
      common_vendor.index.request({
        url: common_config.websiteUrl + "/sale-news",
        data: {
          page: newsPage.value,
          pageSize: newsPageSize.value
        },
        success: (res) => {
          const newData = res.data.data.news_list;
          if (newData.length === 0) {
            newsHasMore.value = false;
            return;
          }
          newsList.value = [...newsList.value, ...newData];
          newsHasMore.value = res.data.data.news_list.length === newsPageSize.value;
          newsPage.value++;
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/index/index.vue:554", err);
          common_vendor.index.showToast({
            title: "加载失败",
            icon: "none"
          });
        },
        complete: () => {
          newsLoading.value = false;
          showLoadding.value = false;
        }
      });
    };
    function jump2treeholeDetail(item) {
      common_vendor.index.navigateTo({
        url: "/pages/treehole_detail/treehole_detail?id=" + item.id
      });
    }
    const getHotCollocations = async (isRefresh = false) => {
      if (isRefresh)
        hotPage.value = 1;
      if (!hotHasMore.value || hotLoading.value)
        return;
      hotLoading.value = true;
      showLoadding.value = true;
      common_vendor.index.request({
        url: common_config.websiteUrl + "/hot-collocation",
        data: {
          page: hotPage.value,
          pageSize: hotPageSize.value
        },
        success: (res) => {
          const newData = res.data.data.collocation_relation_list;
          if (newData.length === 0) {
            hotHasMore.value = false;
            return;
          }
          hotList.value = [...hotList.value, ...newData.map((item) => ({
            ...item
          }))];
          hotHasMore.value = hotList.value.length < res.data.data.total;
          hotPage.value++;
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/index/index.vue:600", err);
          common_vendor.index.showToast({
            title: "加载失败",
            icon: "none"
          });
        },
        complete: () => {
          hotLoading.value = false;
          showLoadding.value = false;
        }
      });
    };
    function jumpToCollocationDetail(item) {
      common_vendor.index.navigateTo({
        url: `/pages/collocation_share/collocation_share?collocation_id=${item.collocation_id}&origin=${item.origin}`
      });
    }
    const getBrands = async (isRefresh = false) => {
      if (isRefresh) {
        page.value = 1;
        brandsList.value = [];
        hasMore.value = true;
        cursor.value = "";
      }
      if (!hasMore.value || loading.value)
        return;
      loading.value = true;
      showLoadding.value = true;
      const params = {
        pageSize: pageSize.value
      };
      if (cursor.value) {
        params.cursor = cursor.value;
      } else if (activeSearchType.value) {
        params.searchType = activeSearchType.value;
      }
      common_vendor.index.request({
        url: common_config.websiteUrl + "/brands-info-list",
        data: params,
        success: (res) => {
          if (res.data.status !== "success") {
            common_vendor.index.showToast({
              title: "加载失败: " + res.data.message,
              icon: "none"
            });
            return;
          }
          const response = res.data.data;
          const newData = response.data;
          common_vendor.index.__f__("log", "at pages/index/index.vue:661", "newData:", newData);
          cursor.value = response.next_cursor || "";
          if (newData.length === 0) {
            hasMore.value = false;
            return;
          }
          brandsList.value = [...brandsList.value, ...newData];
          hasMore.value = response.has_more;
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/index/index.vue:674", err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        },
        complete: () => {
          loading.value = false;
          showLoadding.value = false;
        }
      });
    };
    const getTreeholeList = async (isRefresh = false) => {
      if (isRefresh)
        treeholePage.value = 1;
      if (!treeholeHasMore.value || treeholeLoading.value)
        return;
      treeholeLoading.value = true;
      showLoadding.value = true;
      common_vendor.index.request({
        url: common_config.websiteUrl + "/treehole-submissions",
        data: {
          page: treeholePage.value,
          pageSize: treeholePageSize.value
        },
        success: (res) => {
          const newData = res.data.data.submission_list.map((item) => ({
            ...item,
            images: item.images || []
          }));
          if (newData.length === 0) {
            treeholeHasMore.value = false;
            return;
          }
          treeholeList.value = [...treeholeList.value, ...newData];
          treeholeHasMore.value = treeholeList.value.length < res.data.data.total;
          treeholePage.value++;
        },
        fail: (err) => {
          common_vendor.index.showToast({
            title: "加载失败",
            icon: "none"
          });
        },
        complete: () => {
          treeholeLoading.value = false;
          showLoadding.value = false;
        }
      });
    };
    function handlePublish() {
      if (!common_config.global.isLogin) {
        common_vendor.index.showModal({
          title: "提示",
          content: "需要登录后才能发布树洞",
          success: (res) => {
            if (res.confirm)
              common_vendor.index.navigateTo({
                url: "/pages/login/login"
              });
          }
        });
        return;
      }
      common_vendor.index.navigateTo({
        url: "/pages/treehole_publish/treehole_publish"
      });
    }
    function previewImage(images, index) {
      common_vendor.index.previewImage({
        current: index,
        urls: images
      });
    }
    function handleLike(item) {
      if (!common_config.global.isLogin) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        return;
      }
      let token = common_vendor.index.getStorageSync("token");
      if (!token) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        return;
      }
      common_vendor.index.request({
        url: common_config.websiteUrl + (item.has_liked ? "/with-state/unlike" : "/with-state/add-like"),
        method: "POST",
        header: {
          Authorization: token
        },
        data: {
          id: item.id,
          type: 5
        },
        // 5表示树洞类型
        success: (res) => {
          if (res.data.status === "success") {
            item.has_liked = !item.has_liked;
            item.like_count += item.has_liked ? 1 : -1;
          } else {
            common_vendor.index.showD;
          }
        }
      });
    }
    const formatTime = (timestamp) => {
      const date = new Date(timestamp * 1e3);
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    };
    common_vendor.onLoad(() => {
      common_config.getUserInfo();
      getBrands();
      getNews();
      getHotCollocations();
      getTreeholeList();
      getArticles();
    });
    common_vendor.onReachBottom(() => {
      if (activeTab.value === "brands" && hasMore.value) {
        getBrands();
      } else if (activeTab.value === "news" && newsHasMore.value) {
        getNews();
      } else if (activeTab.value === "second" && treeholeHasMore.value) {
        getTreeholeList();
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.s(_ctx.__cssVars()),
        b: common_vendor.p({
          ["show-up-to-date-toast"]: true
        }),
        c: common_vendor.p({
          show: common_vendor.unref(showLoadding)
        }),
        d: common_assets._imports_0,
        e: common_vendor.p({
          width: "720rpx",
          hiddenIcon: false
        }),
        f: common_assets._imports_1,
        g: activeTab.value === "news" ? 1 : "",
        h: common_vendor.o(($event) => switchTab("news")),
        i: common_assets._imports_2,
        j: activeTab.value === "brands" ? 1 : "",
        k: common_vendor.o(($event) => switchTab("brands")),
        l: common_assets._imports_3,
        m: activeTab.value === "hot" ? 1 : "",
        n: common_vendor.o(($event) => switchTab("hot")),
        o: common_assets._imports_0$1,
        p: activeTab.value === "second" ? 1 : "",
        q: common_vendor.o(($event) => switchTab("second")),
        r: activeTab.value === "news"
      }, activeTab.value === "news" ? common_vendor.e({
        s: common_vendor.f(common_vendor.unref(data), (item, k0, i0) => {
          return {
            a: item.banner,
            b: common_vendor.o(($event) => handleBannerClick(item), item.id),
            c: item.id
          };
        }),
        t: common_vendor.unref(data).length === 0
      }, common_vendor.unref(data).length === 0 ? {
        v: common_assets._imports_5
      } : {}, {
        w: common_vendor.f(common_vendor.unref(newsList), (item, k0, i0) => {
          return common_vendor.e({
            a: item.image_list.length > 0
          }, item.image_list.length > 0 ? {
            b: common_vendor.f(item.image_list, (img, idx, i1) => {
              return {
                a: img,
                b: idx
              };
            })
          } : {}, {
            c: common_vendor.t(item.title),
            d: common_vendor.t(item.content),
            e: common_vendor.t(item.brand_name),
            f: common_vendor.t(formatTime(item.created_at)),
            g: item.id,
            h: common_vendor.o(($event) => jump2saleNews(item), item.id)
          });
        }),
        x: newsLoading.value
      }, newsLoading.value ? {} : {}, {
        y: !newsHasMore.value
      }, !newsHasMore.value ? {} : {}) : {}, {
        z: common_vendor.p({
          ["mode-class"]: ["fade"],
          show: activeTab.value === "news"
        }),
        A: common_vendor.p({
          width: "720rpx"
        }),
        B: common_vendor.f(tabs.value, (tab, index, i0) => {
          return {
            a: common_vendor.t(tab.label),
            b: index,
            c: activeSearchType.value === tab.value ? 1 : "",
            d: common_vendor.o(($event) => handleTabClick(tab.value), index)
          };
        }),
        C: activeSearchType.value == 1
      }, activeSearchType.value == 1 ? {} : {}, {
        D: activeSearchType.value == 2
      }, activeSearchType.value == 2 ? {} : {}, {
        E: activeSearchType.value == 3
      }, activeSearchType.value == 3 ? {} : {}, {
        F: activeTab.value === "brands"
      }, activeTab.value === "brands" ? common_vendor.e({
        G: common_vendor.f(common_vendor.unref(brandsList), (item, index, i0) => {
          return {
            a: "1cf27b2a-7-" + i0 + ",1cf27b2a-5",
            b: common_vendor.p({
              brand: item
            }),
            c: item.id
          };
        }),
        H: loading.value
      }, loading.value ? {} : {}, {
        I: !hasMore.value
      }, !hasMore.value ? {} : {}) : {}, {
        J: common_vendor.p({
          ["mode-class"]: ["fade"],
          show: activeTab.value === "brands"
        }),
        K: activeTab.value === "hot"
      }, activeTab.value === "hot" ? common_vendor.e({
        L: common_vendor.f(common_vendor.unref(hotList), (item, k0, i0) => {
          return common_vendor.e({
            a: item.image_urls.length > 0
          }, item.image_urls.length > 0 ? {
            b: common_vendor.f(item.image_urls, (img, idx, i1) => {
              return {
                a: img,
                b: idx
              };
            })
          } : {}, {
            c: common_vendor.t(item.title),
            d: common_vendor.t(item.content),
            e: common_vendor.f(item.relation_list, (tag, tIdx, i1) => {
              return {
                a: common_vendor.t(tag.relation_goods_name),
                b: common_vendor.t(tag.relation_brand_name),
                c: tIdx
              };
            }),
            f: item.avatar,
            g: common_vendor.t(item.origin == 1 ? "搭配" : "展示柜"),
            h: common_vendor.t(formatTime(item.created_at)),
            i: "1cf27b2a-9-" + i0 + ",1cf27b2a-8",
            j: common_vendor.t(item.like_count),
            k: item.collocation_id,
            l: common_vendor.o(($event) => jumpToCollocationDetail(item), item.collocation_id)
          });
        }),
        M: common_vendor.p({
          type: "heart",
          size: "18",
          color: "#ff4d4f"
        }),
        N: hotLoading.value
      }, hotLoading.value ? {} : {}, {
        O: !hotHasMore.value
      }, !hotHasMore.value ? {} : {}) : {}, {
        P: common_vendor.p({
          ["mode-class"]: ["fade"],
          show: activeTab.value === "hot"
        }),
        Q: activeTab.value === "second"
      }, activeTab.value === "second" ? common_vendor.e({
        R: common_vendor.p({
          type: "plusempty",
          size: "30",
          color: "#fff"
        }),
        S: common_vendor.o(handlePublish),
        T: common_vendor.f(common_vendor.unref(treeholeList), (item, k0, i0) => {
          return common_vendor.e({
            a: item.avatar !== ""
          }, item.avatar !== "" ? {
            b: item.avatar
          } : {
            c: common_assets._imports_6
          }, {
            d: common_vendor.t(item.is_anonymous ? "匿名用户" : item.author_name),
            e: common_vendor.t(formatTime(item.created_at)),
            f: common_vendor.t(item.id),
            g: common_vendor.o(($event) => jump2userWhenNotAnonymous(item), item.id),
            h: common_vendor.t(item.content),
            i: item.images.length > 0
          }, item.images.length > 0 ? {
            j: common_vendor.f(item.images, (img, idx, i1) => {
              return {
                a: img,
                b: common_vendor.o(($event) => previewImage(item.images, idx), idx),
                c: idx
              };
            })
          } : {}, {
            k: "1cf27b2a-12-" + i0 + ",1cf27b2a-10",
            l: common_vendor.p({
              type: item.has_liked ? "hand-up-filled" : "hand-up",
              size: "18",
              color: item.has_liked ? "#ff4d4f" : "#666"
            }),
            m: common_vendor.t(item.like_count || 0),
            n: common_vendor.o(($event) => handleLike(item), item.id),
            o: "1cf27b2a-13-" + i0 + ",1cf27b2a-10",
            p: common_vendor.t(item.comment_count || 0),
            q: "1cf27b2a-14-" + i0 + ",1cf27b2a-10",
            r: common_vendor.o(($event) => copyUrl(item), item.id),
            s: item.id,
            t: common_vendor.o(($event) => jump2treeholeDetail(item), item.id)
          });
        }),
        U: common_vendor.p({
          type: "chat",
          size: "18",
          color: "#666"
        }),
        V: common_vendor.p({
          type: "redo",
          size: "18",
          color: "#666"
        }),
        W: treeholeLoading.value
      }, treeholeLoading.value ? {} : {}, {
        X: !treeholeHasMore.value
      }, !treeholeHasMore.value ? {} : {}) : {}, {
        Y: common_vendor.p({
          ["mode-class"]: ["fade"],
          show: activeTab.value === "second"
        }),
        Z: common_vendor.s(_ctx.__cssVars())
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1cf27b2a"]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
