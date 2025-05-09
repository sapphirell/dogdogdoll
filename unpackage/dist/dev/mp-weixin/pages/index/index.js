"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const common_config = require("../../common/config.js");
if (!Array) {
  const _easycom_common_search2 = common_vendor.resolveComponent("common-search");
  const _component_transition = common_vendor.resolveComponent("transition");
  const _easycom_index_brand2 = common_vendor.resolveComponent("index-brand");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_common_page2 = common_vendor.resolveComponent("common-page");
  (_easycom_common_search2 + _component_transition + _easycom_index_brand2 + _easycom_uni_icons2 + _easycom_common_page2)();
}
const _easycom_common_search = () => "../../components/common-search/common-search.js";
const _easycom_index_brand = () => "../../components/index-brand/index-brand.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_common_page = () => "../../components/common-page/common-page.js";
if (!Math) {
  (_easycom_common_search + _easycom_index_brand + _easycom_uni_icons + _easycom_common_page)();
}
const _sfc_main = {
  __name: "index",
  setup(__props) {
    let brandsList = common_vendor.ref([]);
    let data = common_vendor.ref([
      "https://images1.fantuanpu.com/spd/log/2025_04_21/234a245d0f8963b1b9b022efe3653cfb.jpg",
      "https://images1.fantuanpu.com/box/100024/16524d8c1583feacbeebc37d37ee02a4",
      "https://images1.fantuanpu.com/spd/log/2025_04_21/d34dfe99334e9f5a82a9f63708fcfefe.jpg",
      "https://images1.fantuanpu.com/box/100024/16524d8c1583feacbeebc37d37ee02a4"
    ]);
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
    common_vendor.index.getSystemInfoSync();
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
    function jump2saleNews(item) {
      common_vendor.index.navigateTo({
        url: "/pages/sale_news/sale_news?id=" + item.id + "&brand_id=" + item.brand_id
      });
    }
    function onChange(e) {
      this.swiperIndex.value = e.detail.current;
    }
    const handleTabClick = (value) => {
      if (activeSearchType.value === value) {
        activeSearchType.value = null;
      } else {
        activeSearchType.value = value;
      }
      page.value = 1;
      hasMore.value = true;
      brandsList.value = [];
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
    function getNews() {
      if (!newsHasMore.value || newsLoading.value)
        return;
      newsLoading.value = true;
      common_vendor.index.showLoading();
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
          newsHasMore.value = newsList.value.length < res.data.data.total;
          newsPage.value++;
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/index/index.vue:411", err);
          common_vendor.index.showToast({
            title: "加载失败",
            icon: "none"
          });
        },
        complete: () => {
          newsLoading.value = false;
          common_vendor.index.hideLoading();
        }
      });
    }
    function jump2treeholeDetail(item) {
      common_vendor.index.navigateTo({
        url: "/pages/treehole_detail/treehole_detail?id=" + item.id
      });
    }
    function getHotCollocations() {
      if (!hotHasMore.value || hotLoading.value)
        return;
      hotLoading.value = true;
      common_vendor.index.showLoading();
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
          common_vendor.index.__f__("log", "at pages/index/index.vue:456", err);
          common_vendor.index.showToast({
            title: "加载失败",
            icon: "none"
          });
        },
        complete: () => {
          hotLoading.value = false;
          common_vendor.index.hideLoading();
        }
      });
    }
    function jumpToCollocationDetail(item) {
      common_vendor.index.navigateTo({
        url: `/pages/collocation_share/collocation_share?collocation_id=${item.collocation_id}&origin=${item.origin}`
      });
    }
    function getBrands() {
      if (!hasMore.value || loading.value) {
        return;
      }
      loading.value = true;
      common_vendor.index.showLoading();
      common_vendor.index.request({
        url: common_config.websiteUrl + "/brands",
        data: {
          page: page.value,
          pageSize: pageSize.value,
          ...activeSearchType.value && {
            searchType: activeSearchType.value
          }
        },
        success: (res) => {
          const newData = res.data.data.brands_list;
          if (newData.length === 0) {
            hasMore.value = false;
            return;
          }
          brandsList.value = [...brandsList.value, ...newData];
          hasMore.value = brandsList.value.length < res.data.data.total;
          page.value++;
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/index/index.vue:506", err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        },
        complete: () => {
          loading.value = false;
          common_vendor.index.hideLoading();
        }
      });
    }
    function getTreeholeList() {
      if (!treeholeHasMore.value || treeholeLoading.value)
        return;
      treeholeLoading.value = true;
      common_vendor.index.showLoading();
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
          common_vendor.index.hideLoading();
        }
      });
    }
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
    });
    common_vendor.onReachBottom(() => {
      if (activeTab.value === "brands") {
        getBrands();
      } else if (activeTab.value === "news") {
        getNews();
      } else if (activeTab.value === "second") {
        getTreeholeList();
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_assets._imports_7,
        b: common_vendor.p({
          width: "680rpx"
        }),
        c: common_vendor.f(common_vendor.unref(data), (item, k0, i0) => {
          return {
            a: item,
            b: item
          };
        }),
        d: common_vendor.o(onChange),
        e: common_assets._imports_1,
        f: activeTab.value === "news" ? 1 : "",
        g: common_vendor.o(($event) => switchTab("news")),
        h: common_assets._imports_2,
        i: activeTab.value === "brands" ? 1 : "",
        j: common_vendor.o(($event) => switchTab("brands")),
        k: common_assets._imports_3,
        l: activeTab.value === "hot" ? 1 : "",
        m: common_vendor.o(($event) => switchTab("hot")),
        n: common_assets._imports_4,
        o: activeTab.value === "second" ? 1 : "",
        p: common_vendor.o(($event) => switchTab("second")),
        q: activeTab.value === "news"
      }, activeTab.value === "news" ? common_vendor.e({
        r: common_vendor.f(common_vendor.unref(newsList), (item, k0, i0) => {
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
        s: newsLoading.value
      }, newsLoading.value ? {} : {}, {
        t: !newsHasMore.value
      }, !newsHasMore.value ? {} : {}) : {}, {
        v: common_vendor.p({
          name: "fade",
          mode: "out-in"
        }),
        w: activeTab.value === "brands"
      }, activeTab.value === "brands" ? common_vendor.e({
        x: common_vendor.f(tabs.value, (tab, index, i0) => {
          return {
            a: common_vendor.t(tab.label),
            b: index,
            c: activeSearchType.value === tab.value ? 1 : "",
            d: common_vendor.o(($event) => handleTabClick(tab.value), index)
          };
        }),
        y: activeSearchType.value == 1
      }, activeSearchType.value == 1 ? {} : {}, {
        z: activeSearchType.value == 2
      }, activeSearchType.value == 2 ? {} : {}, {
        A: activeSearchType.value == 3
      }, activeSearchType.value == 3 ? {} : {}, {
        B: common_vendor.f(common_vendor.unref(brandsList), (item, index, i0) => {
          return {
            a: "1cf27b2a-4-" + i0 + ",1cf27b2a-3",
            b: common_vendor.p({
              brand: item
            }),
            c: item.id
          };
        }),
        C: loading.value
      }, loading.value ? {} : {}, {
        D: !hasMore.value
      }, !hasMore.value ? {} : {}) : {}, {
        E: common_vendor.p({
          name: "fade",
          mode: "out-in"
        }),
        F: activeTab.value === "hot"
      }, activeTab.value === "hot" ? common_vendor.e({
        G: common_vendor.f(common_vendor.unref(hotList), (item, k0, i0) => {
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
            i: "1cf27b2a-6-" + i0 + ",1cf27b2a-5",
            j: common_vendor.t(item.like_count),
            k: item.collocation_id,
            l: common_vendor.o(($event) => jumpToCollocationDetail(item), item.collocation_id)
          });
        }),
        H: common_vendor.p({
          type: "heart",
          size: "18",
          color: "#ff4d4f"
        }),
        I: hotLoading.value
      }, hotLoading.value ? {} : {}, {
        J: !hotHasMore.value
      }, !hotHasMore.value ? {} : {}) : {}, {
        K: common_vendor.p({
          name: "fade",
          mode: "out-in"
        }),
        L: activeTab.value === "second"
      }, activeTab.value === "second" ? common_vendor.e({
        M: common_vendor.p({
          type: "plusempty",
          size: "30",
          color: "#fff"
        }),
        N: common_vendor.o(handlePublish),
        O: common_vendor.f(common_vendor.unref(treeholeList), (item, k0, i0) => {
          return common_vendor.e({
            a: item.avatar !== ""
          }, item.avatar !== "" ? {
            b: item.avatar
          } : {
            c: common_assets._imports_5
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
            k: "1cf27b2a-9-" + i0 + ",1cf27b2a-7",
            l: common_vendor.p({
              type: item.has_liked ? "hand-up-filled" : "hand-up",
              size: "18",
              color: item.has_liked ? "#ff4d4f" : "#666"
            }),
            m: common_vendor.t(item.like_count || 0),
            n: common_vendor.o(($event) => handleLike(item), item.id),
            o: "1cf27b2a-10-" + i0 + ",1cf27b2a-7",
            p: common_vendor.t(item.comment_count || 0),
            q: "1cf27b2a-11-" + i0 + ",1cf27b2a-7",
            r: common_vendor.o(($event) => copyUrl(item), item.id),
            s: item.id,
            t: common_vendor.o(($event) => jump2treeholeDetail(item), item.id)
          });
        }),
        P: common_vendor.p({
          type: "chat",
          size: "18",
          color: "#666"
        }),
        Q: common_vendor.p({
          type: "redo",
          size: "18",
          color: "#666"
        }),
        R: treeholeLoading.value
      }, treeholeLoading.value ? {} : {}, {
        S: !treeholeHasMore.value
      }, !treeholeHasMore.value ? {} : {}) : {}, {
        T: common_vendor.p({
          name: "fade",
          mode: "out-in"
        }),
        U: common_vendor.p({
          head_color: "rgb(255 230 215) "
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1cf27b2a"]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
