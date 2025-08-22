"use strict";
const common_vendor = require("../../common/vendor.js");
const common_config = require("../../common/config.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_common_search2 = common_vendor.resolveComponent("common-search");
  (_easycom_uni_icons2 + _easycom_common_search2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_common_search = () => "../../components/common-search/common-search.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_common_search)();
}
const _sfc_main = {
  __name: "creator_base",
  setup(__props) {
    const isShop = common_vendor.ref(false);
    const isArtist = common_vendor.ref(false);
    const isHairstylist = common_vendor.ref(false);
    const brandData = common_vendor.ref({
      brand_name: "加载中...",
      description: "",
      country_name: "",
      nickname_list: "",
      logo_image: "",
      type: "",
      goods_count: 0,
      views: 0,
      vote_number: 0,
      score: 0,
      is_brand: 0,
      is_bjd_artist: 0,
      is_bjd_hairstylist: 0
    });
    const brandName = common_vendor.ref("");
    const selectedBrandId = common_vendor.ref(0);
    const userInfo = common_vendor.ref({});
    const hasBrand = common_vendor.computed(() => {
      return brandData.value.brand_id > 0;
    });
    const settleInfo = common_vendor.computed(() => {
      if (!brandName.value)
        return "";
      return `我的UID是${userInfo.value.id}，我的品牌是${brandName.value}，品牌ID是${selectedBrandId.value}`;
    });
    let brandId = common_vendor.ref(0);
    let updateInProgress = common_vendor.ref(false);
    const loadBrandData = async () => {
      try {
        const user = await common_config.asyncGetUserInfo();
        userInfo.value = user;
        if (!user || !user.brand_id) {
          brandData.value.brand_id = 0;
          return;
        }
        brandId.value = user.brand_id;
        common_vendor.index.request({
          url: `${common_config.websiteUrl.value}/brand-info?id=${user.brand_id}`,
          method: "GET",
          success: (res) => {
            if (res.data.status === "success") {
              brandData.value = res.data.data;
              isShop.value = res.data.data.is_brand === 1;
              isArtist.value = res.data.data.is_bjd_artist === 1;
              isHairstylist.value = res.data.data.is_bjd_hairstylist === 1;
            } else {
              common_vendor.index.showToast({
                title: res.data.msg || "获取品牌信息失败",
                icon: "none"
              });
            }
          },
          fail: (err) => {
            common_vendor.index.__f__("error", "at pages/creator_base/creator_base.vue:230", "请求失败:", err);
            common_vendor.index.showToast({
              title: "网络请求失败",
              icon: "none"
            });
          }
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/creator_base/creator_base.vue:238", "加载品牌数据出错:", error);
        common_vendor.index.showToast({
          title: "加载数据出错",
          icon: "none"
        });
      }
    };
    const updateBrandIdentity = async (field, value) => {
      if (updateInProgress.value)
        return;
      updateInProgress.value = true;
      common_vendor.index.showLoading({
        title: "更新中...",
        mask: true
      });
      try {
        const token = common_vendor.index.getStorageSync("token");
        if (!token) {
          common_vendor.index.showToast({
            title: "请先登录",
            icon: "none"
          });
          return;
        }
        const data = {};
        data[field] = value ? 1 : 0;
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl.value}/brand-manager/update-brand-identity`,
          method: "POST",
          header: {
            "Authorization": token,
            "Content-Type": "application/json"
          },
          data
        });
        if (res.data.status === "success") {
          common_vendor.index.showToast({
            title: "更新成功",
            icon: "success"
          });
          brandData.value[field] = value ? 1 : 0;
        } else {
          common_vendor.index.showToast({
            title: res.data.msg || "更新失败",
            icon: "none"
          });
          if (field === "is_brand")
            isShop.value = !value;
          if (field === "is_bjd_artist")
            isArtist.value = !value;
          if (field === "is_bjd_hairstylist")
            isHairstylist.value = !value;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/creator_base/creator_base.vue:296", "更新失败:", error);
        common_vendor.index.showToast({
          title: "网络请求失败",
          icon: "none"
        });
      } finally {
        updateInProgress.value = false;
        common_vendor.index.hideLoading();
      }
    };
    const toggleShop = (e) => {
      const newValue = e.detail.value;
      updateBrandIdentity("is_brand", newValue);
    };
    const toggleArtist = (e) => {
      const newValue = e.detail.value;
      updateBrandIdentity("is_bjd_artist", newValue);
    };
    const toggleHairstylist = (e) => {
      const newValue = e.detail.value;
      updateBrandIdentity("is_bjd_hairstylist", newValue);
    };
    const onCloseAssociate = (searchTerm) => {
      common_vendor.index.__f__("log", "at pages/creator_base/creator_base.vue:325", searchTerm);
      brandName.value = searchTerm;
      selectedBrandId.value = 0;
    };
    const onBrandSelect = (id, name) => {
      selectedBrandId.value = id;
      brandName.value = name;
    };
    const copyContact = () => {
      common_vendor.index.setClipboardData({
        data: "dogdogdoll",
        success: () => {
          common_vendor.index.showToast({
            title: "已复制联系方式",
            icon: "success"
          });
        }
      });
    };
    const copySettleInfo = () => {
      if (!settleInfo.value) {
        common_vendor.index.showToast({
          title: "请先选择品牌",
          icon: "none"
        });
        return;
      }
      common_vendor.index.setClipboardData({
        data: settleInfo.value,
        success: () => {
          common_vendor.index.showToast({
            title: "已复制入驻信息",
            icon: "success"
          });
        }
      });
    };
    const navigateTo = (type) => {
      switch (type) {
        case "info-setting":
          common_vendor.index.navigateTo({
            url: "/pages/creator_base/brand_edit/brand_edit"
          });
          break;
        case "goods-manage":
          common_vendor.index.navigateTo({
            url: "/pages/creator_base/goods_list/goods_list"
          });
          break;
        case "image-manage":
          common_vendor.index.navigateTo({
            url: "/pages/creator_base/news/news"
          });
          break;
        case "artist_info":
          common_vendor.index.navigateTo({
            url: "/pages/creator_base/artist_setting/artist_setting"
          });
          break;
      }
    };
    common_vendor.onMounted(() => {
      common_vendor.index.setNavigationBarTitle({
        title: "我的品牌"
      });
      loadBrandData();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: hasBrand.value
      }, hasBrand.value ? {
        b: brandData.value.logo_image,
        c: common_vendor.t(brandData.value.brand_name),
        d: common_vendor.t(brandData.value.type),
        e: common_vendor.t(brandData.value.country_name),
        f: common_vendor.p({
          type: "star-filled",
          size: "16",
          color: "#FFC107"
        }),
        g: common_vendor.t(brandData.value.score),
        h: common_vendor.t(brandData.value.brand_name),
        i: common_vendor.t(brandData.value.description),
        j: common_vendor.t(brandData.value.country_name),
        k: common_vendor.t(brandData.value.nickname_list),
        l: common_vendor.t(brandData.value.type),
        m: isShop.value,
        n: common_vendor.o(toggleShop),
        o: common_vendor.t(isShop.value ? "我是店铺" : "不是店铺"),
        p: isArtist.value,
        q: common_vendor.o(toggleArtist),
        r: common_vendor.t(isArtist.value ? "我是妆师" : "不是妆师"),
        s: isHairstylist.value,
        t: common_vendor.o(toggleHairstylist),
        v: common_vendor.t(isHairstylist.value ? "我是毛娘" : "不是毛娘"),
        w: common_vendor.p({
          type: "contact",
          size: "24",
          color: "#006a57"
        }),
        x: common_vendor.o(($event) => navigateTo("info-setting")),
        y: common_vendor.p({
          type: "shop",
          size: "24",
          color: "#dfd7c2"
        }),
        z: common_vendor.o(($event) => navigateTo("goods-manage")),
        A: common_vendor.p({
          type: "image",
          size: "24",
          color: "#fff6e1"
        }),
        B: common_vendor.o(($event) => navigateTo("image-manage")),
        C: common_vendor.p({
          type: "contact",
          size: "24",
          color: "#c7e1fa"
        }),
        D: common_vendor.o(($event) => navigateTo("artist_info"))
      } : common_vendor.e({
        E: common_vendor.o(copyContact),
        F: common_vendor.o(onBrandSelect),
        G: common_vendor.o(onCloseAssociate),
        H: common_vendor.p({
          mode: "fill",
          placeholder: "搜索并选择您的品牌",
          ["show-index-selector"]: true
        }),
        I: selectedBrandId.value
      }, selectedBrandId.value ? {
        J: common_vendor.t(selectedBrandId.value)
      } : {}, {
        K: settleInfo.value,
        L: common_vendor.o(copySettleInfo)
      }));
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-cc83db64"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/creator_base/creator_base.js.map
