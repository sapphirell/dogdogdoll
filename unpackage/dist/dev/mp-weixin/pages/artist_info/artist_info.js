"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const common_config = require("../../common/config.js");
if (!Array) {
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  _easycom_uni_load_more2();
}
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
if (!Math) {
  _easycom_uni_load_more();
}
const _sfc_main = {
  __name: "artist_info",
  setup(__props) {
    const artistInfo = common_vendor.ref({
      artist_id: 0,
      brand_id: 0,
      brand_name: "",
      description: "",
      logo_image: "",
      highlight_images: [],
      status_of_artist: 0,
      status_of_artist_text: "",
      status_of_hairstylist: 0,
      status_of_hairstylist_text: "",
      base_price_of_artist: 0,
      base_price_of_hairstylist: 0
    });
    const worksList = common_vendor.ref([]);
    const activeMode = common_vendor.ref("works");
    const activePlanTab = common_vendor.ref("artist");
    const currentPage = common_vendor.ref(1);
    const pageSize = common_vendor.ref(20);
    const hasMore = common_vendor.ref(true);
    const brandId = common_vendor.ref(0);
    const orderPlans = common_vendor.ref([]);
    const plansPage = common_vendor.ref(1);
    const plansPageSize = common_vendor.ref(5);
    const hasMorePlans = common_vendor.ref(true);
    const getUrlParams = () => {
      const pages = getCurrentPages();
      const currentPage2 = pages[pages.length - 1];
      const options = currentPage2.options;
      brandId.value = options.brand_id || 0;
    };
    const getTagColor = (tag) => {
      const colors = [
        "#FFEEF2",
        "#E8F5FF",
        "#F0FFF0",
        "#FFF8E8",
        "#F5F0FF",
        "#E8FFF8",
        "#FFF0F5",
        "#F0F8FF"
      ];
      const index = tag.charCodeAt(0) % colors.length;
      return colors[index];
    };
    function jump2brand(id) {
      common_vendor.index.navigateTo({
        url: "/pages/brand/brand?brand_id=" + id
      });
    }
    const fetchArtistInfo = async () => {
      try {
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl.value}/brand-artist/info?brand_id=${brandId.value}`,
          method: "GET"
        });
        if (res.data.status === "success") {
          artistInfo.value = res.data.data;
        } else {
          common_vendor.index.showToast({
            title: "获取艺术家信息失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.showToast({
          title: "网络错误",
          icon: "none"
        });
      }
    };
    const fetchWorksList = async () => {
      try {
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl.value}/brand-artist/bjd-faceup?brand_id=${brandId.value}&page=${currentPage.value}&size=${pageSize.value}`,
          method: "GET"
        });
        if (res.data.status === "success") {
          const newList = res.data.data.list;
          if (currentPage.value === 1) {
            worksList.value = newList;
          } else {
            worksList.value = [...worksList.value, ...newList];
          }
          hasMore.value = worksList.value.length < res.data.data.total;
        } else {
          common_vendor.index.showToast({
            title: "获取作品列表失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.showToast({
          title: "网络错误",
          icon: "none"
        });
      }
    };
    const copyContactInfo = () => {
      const contactInfo = activePlanTab.value === "artist" ? artistInfo.value.contact_info_artist : artistInfo.value.contact_info_hairstylist;
      if (!contactInfo) {
        common_vendor.index.showToast({
          title: "暂无联系信息",
          icon: "none"
        });
        return;
      }
      common_vendor.index.setClipboardData({
        data: contactInfo,
        success: () => {
          common_vendor.index.showToast({
            title: "已复制联系信息",
            icon: "success"
          });
        }
      });
    };
    const fetchOrderPlans = async () => {
      try {
        const artistType = activePlanTab.value === "artist" ? 1 : 2;
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl.value}/brand-artist/order-plans?brand_id=${brandId.value}&artist_type=${artistType}&page=${plansPage.value}&size=${plansPageSize.value}`,
          method: "GET"
        });
        if (res.data.status === "success") {
          const newPlans = res.data.data;
          if (plansPage.value === 1) {
            orderPlans.value = newPlans;
          } else {
            orderPlans.value = [...orderPlans.value, ...newPlans];
          }
          hasMorePlans.value = newPlans.length === plansPageSize.value;
        } else {
          common_vendor.index.showToast({
            title: "获取开单记录失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.showToast({
          title: "网络错误",
          icon: "none"
        });
      }
    };
    const previewPlanImages = (images, currentIndex) => {
      common_vendor.index.previewImage({
        current: currentIndex,
        // 当前显示图片的索引
        urls: images,
        // 需要预览的图片链接列表
        indicator: "number",
        // 显示数字指示器
        loop: true,
        // 是否可循环播放
        success: () => {
          common_vendor.index.__f__("log", "at pages/artist_info/artist_info.vue:410", "预览图片成功");
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/artist_info/artist_info.vue:413", "预览图片失败", err);
          common_vendor.index.showToast({
            title: "预览图片失败",
            icon: "none"
          });
        }
      });
    };
    const getOrderTypeText = (type) => {
      const types = {
        1: "长期接单",
        2: "限时手速",
        3: "限时抽选",
        4: "限时黑箱卡",
        9: "关闭投递"
      };
      return types[type] || "未知类型";
    };
    const switchMode = (mode) => {
      activeMode.value = mode;
      if (mode === "plans") {
        plansPage.value = 1;
        fetchOrderPlans();
      }
    };
    const switchPlanTab = (tab) => {
      activePlanTab.value = tab;
      if (activeMode.value === "works") {
        currentPage.value = 1;
        fetchWorksList();
      } else {
        plansPage.value = 1;
        fetchOrderPlans();
      }
    };
    const formatDate = (timestamp) => {
      if (!timestamp)
        return "";
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const seconds = date.getSeconds().toString().padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };
    const navigateToGoods = (goodsId) => {
      common_vendor.index.navigateTo({
        url: `/pages/goods/goods?goods_id=${goodsId || 1576}`
      });
    };
    const navigateToFaceup = (id) => {
      common_vendor.index.navigateTo({
        url: `/pages/artwork/artwork?id=${id}`
      });
    };
    common_vendor.onMounted(() => {
      common_vendor.index.setNavigationBarTitle({
        title: "妆师毛娘主页"
      });
      getUrlParams();
      fetchArtistInfo();
      fetchWorksList();
    });
    common_vendor.index.setNavigationBarTitle({
      title: ""
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: artistInfo.value.logo_image,
        b: common_vendor.o(($event) => jump2brand(artistInfo.value.brand_id)),
        c: common_vendor.t(artistInfo.value.brand_name),
        d: common_vendor.o(($event) => jump2brand(artistInfo.value.brand_id)),
        e: common_vendor.t(artistInfo.value.description),
        f: activePlanTab.value === "artist"
      }, activePlanTab.value === "artist" ? {
        g: common_vendor.t(artistInfo.value.status_of_artist_text)
      } : {
        h: common_vendor.t(artistInfo.value.status_of_hairstylist_text)
      }, {
        i: common_vendor.t(artistInfo.value.contact ? artistInfo.value.contact : "尚未设置"),
        j: common_vendor.o(copyContactInfo),
        k: activeMode.value === "works" ? 1 : "",
        l: common_vendor.o(($event) => switchMode("works")),
        m: activeMode.value === "plans" ? 1 : "",
        n: common_vendor.o(($event) => switchMode("plans")),
        o: activeMode.value === "works"
      }, activeMode.value === "works" ? common_vendor.e({
        p: common_vendor.f(artistInfo.value.highlight_images, (img, index, i0) => {
          return {
            a: index,
            b: img
          };
        }),
        q: activePlanTab.value === "artist" ? 1 : "",
        r: common_vendor.o(($event) => switchPlanTab("artist")),
        s: activePlanTab.value === "hairstylist" ? 1 : "",
        t: common_vendor.o(($event) => switchPlanTab("hairstylist")),
        v: activePlanTab.value === "artist"
      }, activePlanTab.value === "artist" ? {
        w: common_vendor.f(worksList.value, (work, index, i0) => {
          return common_vendor.e({
            a: work.image_urls[0],
            b: common_vendor.t(work.head_name),
            c: common_vendor.o(($event) => navigateToGoods(work.goods_id), work.id),
            d: common_vendor.t(work.sex),
            e: common_vendor.n(work.sex === "男" ? "male" : "female"),
            f: work.style_tags && work.style_tags.length
          }, work.style_tags && work.style_tags.length ? {
            g: common_vendor.f(work.style_tags, (tag, idx, i1) => {
              return {
                a: common_vendor.t(tag),
                b: idx,
                c: getTagColor(tag)
              };
            })
          } : {}, {
            h: work.id,
            i: common_vendor.o(($event) => navigateToFaceup(work.id), work.id)
          });
        })
      } : {
        x: common_assets._imports_0$12
      }, {
        y: hasMore.value && activePlanTab.value === "artist"
      }, hasMore.value && activePlanTab.value === "artist" ? {
        z: common_vendor.p({
          status: "loading"
        })
      } : activePlanTab.value === "artist" && worksList.value.length > 0 ? {} : {}, {
        A: activePlanTab.value === "artist" && worksList.value.length > 0
      }) : common_vendor.e({
        B: activePlanTab.value === "artist" ? 1 : "",
        C: common_vendor.o(($event) => switchPlanTab("artist")),
        D: activePlanTab.value === "hairstylist" ? 1 : "",
        E: common_vendor.o(($event) => switchPlanTab("hairstylist")),
        F: common_vendor.f(orderPlans.value, (plan, index, i0) => {
          return common_vendor.e({
            a: common_vendor.f(plan.images, (img, imgIndex, i1) => {
              return {
                a: imgIndex,
                b: img,
                c: common_vendor.o(($event) => previewPlanImages(plan.images, imgIndex), imgIndex)
              };
            }),
            b: common_vendor.t(getOrderTypeText(plan.order_type)),
            c: common_vendor.t(plan.max_participants),
            d: common_vendor.t(plan.max_submissions_per_user),
            e: common_vendor.t(formatDate(plan.open_time * 1e3)),
            f: common_vendor.t(formatDate(plan.close_time * 1e3)),
            g: common_vendor.t(plan.is_active ? "进行中" : "已结束"),
            h: common_vendor.n(plan.is_active ? "active" : "inactive"),
            i: common_vendor.f(plan.tiers, (tier, tierIndex, i1) => {
              return {
                a: common_vendor.t(tier.title),
                b: common_vendor.t(tier.price),
                c: common_vendor.t(tier.description),
                d: tierIndex
              };
            }),
            j: plan.addons && plan.addons.length
          }, plan.addons && plan.addons.length ? {
            k: common_vendor.f(plan.addons, (addon, addonIndex, i1) => {
              return {
                a: common_vendor.t(addon.title),
                b: common_vendor.t(addon.price),
                c: common_vendor.t(addon.description),
                d: addonIndex
              };
            })
          } : {}, {
            l: plan.id
          });
        }),
        G: hasMorePlans.value
      }, hasMorePlans.value ? {
        H: common_vendor.p({
          status: "loading"
        })
      } : orderPlans.value.length > 0 ? {} : {
        J: common_assets._imports_0$12
      }, {
        I: orderPlans.value.length > 0
      }));
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d20a8a4d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/artist_info/artist_info.js.map
