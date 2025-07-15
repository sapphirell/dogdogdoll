"use strict";
const common_vendor = require("../../common/vendor.js");
const common_config = require("../../common/config.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_loading_toast2 = common_vendor.resolveComponent("loading-toast");
  (_easycom_uni_icons2 + _easycom_loading_toast2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_loading_toast = () => "../../components/loading-toast/loading-toast.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_loading_toast)();
}
const _sfc_main = {
  __name: "account_book_preview",
  props: ["account_book_id"],
  setup(__props) {
    const props = __props;
    const loadingSuccess = common_vendor.ref(false);
    const detail = common_vendor.ref({});
    const swiperHeight = common_vendor.ref(500);
    const imageHeights = common_vendor.ref([]);
    const screenWidth = common_vendor.ref(0);
    const handleImageLoad = (event, index) => {
      if (!screenWidth.value)
        return;
      const { width: originWidth, height: originHeight } = event.detail;
      const renderHeight = originHeight / originWidth * screenWidth.value;
      imageHeights.value[index] = renderHeight;
      const currentHeights = imageHeights.value.filter((h) => h);
      if (currentHeights.length > 0) {
        const maxHeight = Math.max(...currentHeights);
        if (maxHeight > swiperHeight.value) {
          swiperHeight.value = maxHeight;
        }
      }
    };
    const imageList = common_vendor.computed(() => {
      if (!detail.value.image_url)
        return [];
      return detail.value.image_url.split(",").map((url) => url.trim());
    });
    const fetchDetail = async (id) => {
      const token = common_vendor.index.getStorageSync("token");
      try {
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl}/with-state/account-book-detail?id=${id}`,
          method: "GET",
          header: {
            "Authorization": token
          }
        });
        if (res.data.status === "success") {
          detail.value = res.data.data;
          setTimeout(() => {
            loadingSuccess.value = true;
            common_vendor.index.setNavigationBarTitle({
              title: detail.value.name || "账本详情"
            });
          }, 600);
        } else {
          common_vendor.index.showToast({
            title: res.data.msg || "获取详情失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.showToast({
          title: "网络请求失败",
          icon: "none"
        });
      }
    };
    const navigateToEdit = () => {
      common_vendor.index.navigateTo({
        url: `/pages/stock/account_book_form/account_book_form?account_book_id=${props.account_book_id}`
      });
    };
    common_vendor.onShow(() => {
      swiperHeight.value = 300;
      imageHeights.value = [];
      const systemInfo = common_vendor.index.getSystemInfoSync();
      screenWidth.value = systemInfo.windowWidth;
      common_config.asyncGetUserInfo().then((userInfo) => {
        fetchDetail(props.account_book_id);
      });
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: loadingSuccess.value
      }, loadingSuccess.value ? common_vendor.e({
        b: common_vendor.f(imageList.value, (img, index, i0) => {
          return {
            a: img,
            b: common_vendor.o(($event) => handleImageLoad($event, index), index),
            c: index
          };
        }),
        c: swiperHeight.value + "px",
        d: common_vendor.t(detail.value.name),
        e: common_vendor.t(detail.value.type),
        f: common_vendor.p({
          type: "list",
          size: "16",
          color: "#5db7ff"
        }),
        g: detail.value.count
      }, detail.value.count ? {
        h: common_vendor.p({
          type: "number",
          size: "14",
          color: "#5db7ff"
        }),
        i: common_vendor.t(detail.value.count)
      } : {}, {
        j: detail.value.price || detail.value.final_price > 0
      }, detail.value.price || detail.value.final_price > 0 ? common_vendor.e({
        k: common_vendor.p({
          type: "money",
          size: "14",
          color: "#5db7ff"
        }),
        l: detail.value.final_price > 0
      }, detail.value.final_price > 0 ? {
        m: common_vendor.t(detail.value.price)
      } : {
        n: common_vendor.t(detail.value.price)
      }) : {}, {
        o: detail.value.final_price > 0
      }, detail.value.final_price > 0 ? common_vendor.e({
        p: common_vendor.p({
          type: "money",
          size: "14",
          color: "#5db7ff"
        }),
        q: common_vendor.t(detail.value.final_price),
        r: detail.value.final_time
      }, detail.value.final_time ? {
        s: common_vendor.t(detail.value.final_time)
      } : {}) : {}, {
        t: detail.value.shop_name
      }, detail.value.shop_name ? {
        v: common_vendor.p({
          type: "shop",
          size: "14",
          color: "#5db7ff"
        }),
        w: common_vendor.t(detail.value.shop_name)
      } : {}, {
        x: detail.value.size || detail.value.size_detail
      }, detail.value.size || detail.value.size_detail ? {
        y: common_vendor.p({
          type: "compose",
          size: "14",
          color: "#5db7ff"
        }),
        z: common_vendor.t(detail.value.size),
        A: common_vendor.t(detail.value.size_detail)
      } : {}, {
        B: detail.value.head_circumference
      }, detail.value.head_circumference ? {
        C: common_vendor.p({
          type: "circle",
          size: "14",
          color: "#5db7ff"
        }),
        D: common_vendor.t(detail.value.head_circumference)
      } : {}, {
        E: detail.value.shoulder_width
      }, detail.value.shoulder_width ? {
        F: common_vendor.p({
          type: "arrowright",
          size: "14",
          color: "#5db7ff"
        }),
        G: common_vendor.t(detail.value.shoulder_width)
      } : {}, {
        H: detail.value.makeup_artist
      }, detail.value.makeup_artist ? {
        I: common_vendor.p({
          type: "person",
          size: "14",
          color: "#5db7ff"
        }),
        J: common_vendor.t(detail.value.makeup_artist)
      } : {}, {
        K: detail.value.color
      }, detail.value.color ? {
        L: common_vendor.p({
          type: "color",
          size: "14",
          color: "#5db7ff"
        }),
        M: common_vendor.t(detail.value.color),
        N: detail.value.color
      } : {}, {
        O: detail.value.buy_date || detail.value.arrival_date
      }, detail.value.buy_date || detail.value.arrival_date ? common_vendor.e({
        P: common_vendor.p({
          type: "calendar",
          size: "16",
          color: "#5db7ff"
        }),
        Q: detail.value.buy_date
      }, detail.value.buy_date ? {
        R: common_vendor.p({
          type: "cart",
          size: "14",
          color: "#5db7ff"
        }),
        S: common_vendor.t(detail.value.buy_date)
      } : {}, {
        T: detail.value.arrival_date
      }, detail.value.arrival_date ? {
        U: common_vendor.p({
          type: "home",
          size: "14",
          color: "#5db7ff"
        }),
        V: common_vendor.t(detail.value.arrival_date)
      } : {}) : {}, {
        W: detail.value.position
      }, detail.value.position ? {
        X: common_vendor.p({
          type: "location",
          size: "16",
          color: "#5db7ff"
        }),
        Y: common_vendor.p({
          type: "map",
          size: "14",
          color: "#5db7ff"
        }),
        Z: common_vendor.t(detail.value.position)
      } : {}, {
        aa: detail.value.additional_value || detail.value.remark
      }, detail.value.additional_value || detail.value.remark ? common_vendor.e({
        ab: common_vendor.p({
          type: "info",
          size: "16",
          color: "#5db7ff"
        }),
        ac: detail.value.additional_value
      }, detail.value.additional_value ? {
        ad: common_vendor.p({
          type: "plus",
          size: "14",
          color: "#5db7ff"
        }),
        ae: common_vendor.t(detail.value.additional_value)
      } : {}, {
        af: detail.value.remark
      }, detail.value.remark ? {
        ag: common_vendor.p({
          type: "chat",
          size: "14",
          color: "#5db7ff"
        }),
        ah: common_vendor.t(detail.value.remark)
      } : {}) : {}) : {}, {
        ai: common_vendor.p({
          type: "compose",
          size: "22",
          color: "#fff"
        }),
        aj: common_vendor.o(navigateToEdit),
        ak: common_vendor.p({
          show: !loadingSuccess.value
        })
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/account_book_preview/account_book_preview.js.map
