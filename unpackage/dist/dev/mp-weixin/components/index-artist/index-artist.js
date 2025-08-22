"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const common_config = require("../../common/config.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_common_modal2 = common_vendor.resolveComponent("common-modal");
  const _easycom_bottom_popup2 = common_vendor.resolveComponent("bottom-popup");
  (_easycom_uni_icons2 + _easycom_common_modal2 + _easycom_bottom_popup2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_common_modal = () => "../common-modal/common-modal.js";
const _easycom_bottom_popup = () => "../bottom-popup/bottom-popup.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_common_modal + _easycom_bottom_popup)();
}
const _sfc_main = {
  __name: "index-artist",
  setup(__props) {
    const statusFilters = common_vendor.ref([
      {
        label: "全部",
        value: 0
      },
      {
        label: "长期接单",
        value: 1
      },
      {
        label: "限时手速",
        value: 2
      },
      {
        label: "限时抽选",
        value: 3
      },
      {
        label: "黑箱卡",
        value: 4
      },
      {
        label: "关闭接单",
        value: 9
      }
    ]);
    const artists = common_vendor.ref([]);
    const filteredArtists = common_vendor.ref([]);
    const activeStatus = common_vendor.ref(0);
    const minPrice = common_vendor.ref("");
    const maxPrice = common_vendor.ref("");
    const page = common_vendor.ref(1);
    const size = common_vendor.ref(20);
    const total = common_vendor.ref(0);
    const loading = common_vendor.ref(false);
    const showLoadMore = common_vendor.ref(true);
    const helpModalVisible = common_vendor.ref(false);
    const filterPopupVisible = common_vendor.ref(false);
    common_vendor.onMounted(() => {
      fetchArtistList();
    });
    const fetchArtistList = async () => {
      try {
        loading.value = true;
        const params = {
          page: page.value,
          size: size.value
        };
        if (activeStatus.value !== 0) {
          params.status = activeStatus.value;
        }
        if (minPrice.value) {
          params.min_price = minPrice.value;
        }
        if (maxPrice.value) {
          params.max_price = maxPrice.value;
        }
        const response = await common_vendor.index.request({
          url: `${common_config.websiteUrl.value}/brand-artist-list`,
          method: "GET",
          data: params
        });
        const data = response.data;
        if (data.status === "success") {
          if (page.value === 1) {
            artists.value = [];
          }
          artists.value = [...artists.value, ...data.data.list];
          total.value = data.data.total;
          applyFilters();
          showLoadMore.value = artists.value.length < total.value;
        } else {
          common_vendor.index.showToast({
            title: data.msg || "获取数据失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at components/index-artist/index-artist.vue:251", "获取妆师列表失败:", error);
        common_vendor.index.showToast({
          title: "网络请求失败",
          icon: "none"
        });
      } finally {
        loading.value = false;
      }
    };
    const showFilterPopup = () => {
      filterPopupVisible.value = true;
    };
    const applyFilter = () => {
      filterPopupVisible.value = false;
      page.value = 1;
      fetchArtistList();
    };
    const showHelpModal = () => {
      helpModalVisible.value = true;
    };
    const applyFilters = () => {
      filteredArtists.value = artists.value;
    };
    const resetFilters = () => {
      activeStatus.value = 0;
      minPrice.value = "";
      maxPrice.value = "";
      page.value = 1;
      fetchArtistList();
      filterPopupVisible.value = false;
    };
    const navigateToArtistDetail = (artist) => {
      common_vendor.index.navigateTo({
        url: "/pages/artist_info/artist_info?brand_id=" + artist.brand_id
      });
    };
    const statusClass = (status) => {
      switch (status) {
        case 1:
          return "status-long-term";
        case 2:
          return "status-speed";
        case 3:
          return "status-lottery";
        case 4:
          return "status-black-card";
        case 9:
          return "status-closed";
        default:
          return "";
      }
    };
    common_vendor.onReachBottom(() => {
      if (!loading.value && showLoadMore.value) {
        page.value += 1;
        fetchArtistList();
      }
    });
    common_vendor.onPullDownRefresh(() => {
      artists.value = [];
      page.value = 1;
      fetchArtistList().then(() => {
        common_vendor.index.stopPullDownRefresh();
      });
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "tune",
          size: "18",
          color: "#fff"
        }),
        b: common_vendor.o(showFilterPopup),
        c: common_vendor.p({
          type: "help",
          size: "24",
          color: "#808080"
        }),
        d: common_vendor.o(showHelpModal),
        e: common_vendor.f(filteredArtists.value, (artist, index, i0) => {
          return common_vendor.e({
            a: artist.logo_image,
            b: common_vendor.t(artist.brand_name),
            c: common_vendor.t(artist.status_text),
            d: common_vendor.n(statusClass(artist.status)),
            e: common_vendor.t(artist.base_price),
            f: artist.description
          }, artist.description ? {
            g: common_vendor.t(artist.description)
          } : {}, {
            h: artist.highlight_img && artist.highlight_img.length > 0
          }, artist.highlight_img && artist.highlight_img.length > 0 ? {
            i: common_vendor.f(artist.highlight_img, (img, imgIndex, i1) => {
              return {
                a: img,
                b: imgIndex
              };
            })
          } : {}, {
            j: index,
            k: common_vendor.o(($event) => navigateToArtistDetail(artist), index)
          });
        }),
        f: showLoadMore.value
      }, showLoadMore.value ? common_vendor.e({
        g: loading.value
      }, loading.value ? {} : {}) : {}, {
        h: filteredArtists.value.length === 0 && !loading.value
      }, filteredArtists.value.length === 0 && !loading.value ? {
        i: common_assets._imports_0$14,
        j: common_vendor.o(resetFilters)
      } : {}, {
        k: common_vendor.o(($event) => helpModalVisible.value = false),
        l: common_vendor.o(($event) => helpModalVisible.value = $event),
        m: common_vendor.p({
          visible: helpModalVisible.value,
          top: "15vh"
        }),
        n: common_vendor.o(($event) => filterPopupVisible.value = false),
        o: common_vendor.p({
          type: "closeempty",
          size: "24",
          color: "#666"
        }),
        p: common_vendor.f(statusFilters.value, (status, index, i0) => {
          return {
            a: common_vendor.t(status.label),
            b: index,
            c: common_vendor.n({
              active: activeStatus.value === status.value
            }),
            d: common_vendor.o(($event) => activeStatus.value = status.value, index)
          };
        }),
        q: minPrice.value,
        r: common_vendor.o(($event) => minPrice.value = $event.detail.value),
        s: maxPrice.value,
        t: common_vendor.o(($event) => maxPrice.value = $event.detail.value),
        v: common_vendor.o(resetFilters),
        w: common_vendor.o(applyFilter),
        x: common_vendor.o(($event) => filterPopupVisible.value = false),
        y: common_vendor.p({
          show: filterPopupVisible.value
        })
      });
    };
  }
};
wx.createComponent(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/index-artist/index-artist.js.map
