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
      common_config.asyncGetUserInfo().then((userInfo) => {
        fetchDetail(props.account_book_id);
      });
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: loadingSuccess.value
      }, loadingSuccess.value ? common_vendor.e({
        b: detail.value.image_url,
        c: common_vendor.t(detail.value.name),
        d: common_vendor.t(detail.value.type),
        e: common_vendor.p({
          type: "list",
          size: "16",
          color: "#5db7ff"
        }),
        f: detail.value.count
      }, detail.value.count ? {
        g: common_vendor.p({
          type: "number",
          size: "14",
          color: "#5db7ff"
        }),
        h: common_vendor.t(detail.value.count)
      } : {}, {
        i: detail.value.price || detail.value.final_price > 0
      }, detail.value.price || detail.value.final_price > 0 ? common_vendor.e({
        j: common_vendor.p({
          type: "money",
          size: "14",
          color: "#5db7ff"
        }),
        k: detail.value.final_price > 0
      }, detail.value.final_price > 0 ? {
        l: common_vendor.t(detail.value.final_price)
      } : {
        m: common_vendor.t(detail.value.price)
      }, {
        n: detail.value.final_price > 0 && detail.value.final_time
      }, detail.value.final_price > 0 && detail.value.final_time ? {
        o: common_vendor.t(detail.value.final_time)
      } : {}) : {}, {
        p: detail.value.shop_name
      }, detail.value.shop_name ? {
        q: common_vendor.p({
          type: "shop",
          size: "14",
          color: "#5db7ff"
        }),
        r: common_vendor.t(detail.value.shop_name)
      } : {}, {
        s: detail.value.size || detail.value.size_detail
      }, detail.value.size || detail.value.size_detail ? {
        t: common_vendor.p({
          type: "compose",
          size: "14",
          color: "#5db7ff"
        }),
        v: common_vendor.t(detail.value.size),
        w: common_vendor.t(detail.value.size_detail)
      } : {}, {
        x: detail.value.head_circumference
      }, detail.value.head_circumference ? {
        y: common_vendor.p({
          type: "circle",
          size: "14",
          color: "#5db7ff"
        }),
        z: common_vendor.t(detail.value.head_circumference)
      } : {}, {
        A: detail.value.shoulder_width
      }, detail.value.shoulder_width ? {
        B: common_vendor.p({
          type: "arrowright",
          size: "14",
          color: "#5db7ff"
        }),
        C: common_vendor.t(detail.value.shoulder_width)
      } : {}, {
        D: detail.value.makeup_artist
      }, detail.value.makeup_artist ? {
        E: common_vendor.p({
          type: "person",
          size: "14",
          color: "#5db7ff"
        }),
        F: common_vendor.t(detail.value.makeup_artist)
      } : {}, {
        G: detail.value.color
      }, detail.value.color ? {
        H: common_vendor.p({
          type: "color",
          size: "14",
          color: "#5db7ff"
        }),
        I: common_vendor.t(detail.value.color),
        J: detail.value.color
      } : {}, {
        K: detail.value.buy_date || detail.value.arrival_date
      }, detail.value.buy_date || detail.value.arrival_date ? common_vendor.e({
        L: common_vendor.p({
          type: "calendar",
          size: "16",
          color: "#5db7ff"
        }),
        M: detail.value.buy_date
      }, detail.value.buy_date ? {
        N: common_vendor.p({
          type: "cart",
          size: "14",
          color: "#5db7ff"
        }),
        O: common_vendor.t(detail.value.buy_date)
      } : {}, {
        P: detail.value.arrival_date
      }, detail.value.arrival_date ? {
        Q: common_vendor.p({
          type: "home",
          size: "14",
          color: "#5db7ff"
        }),
        R: common_vendor.t(detail.value.arrival_date)
      } : {}) : {}, {
        S: detail.value.position
      }, detail.value.position ? {
        T: common_vendor.p({
          type: "location",
          size: "16",
          color: "#5db7ff"
        }),
        U: common_vendor.p({
          type: "map",
          size: "14",
          color: "#5db7ff"
        }),
        V: common_vendor.t(detail.value.position)
      } : {}, {
        W: detail.value.additional_value || detail.value.remark
      }, detail.value.additional_value || detail.value.remark ? common_vendor.e({
        X: common_vendor.p({
          type: "info",
          size: "16",
          color: "#5db7ff"
        }),
        Y: detail.value.additional_value
      }, detail.value.additional_value ? {
        Z: common_vendor.p({
          type: "plus",
          size: "14",
          color: "#5db7ff"
        }),
        aa: common_vendor.t(detail.value.additional_value)
      } : {}, {
        ab: detail.value.remark
      }, detail.value.remark ? {
        ac: common_vendor.p({
          type: "chat",
          size: "14",
          color: "#5db7ff"
        }),
        ad: common_vendor.t(detail.value.remark)
      } : {}) : {}) : {}, {
        ae: common_vendor.p({
          type: "compose",
          size: "22",
          color: "#fff"
        }),
        af: common_vendor.o(navigateToEdit),
        ag: common_vendor.p({
          show: !loadingSuccess.value
        })
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/account_book_preview/account_book_preview.js.map
