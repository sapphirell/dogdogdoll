"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_config = require("../../../common/config.js");
const common_image = require("../../../common/image.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "brand_edit",
  setup(__props) {
    const formData = common_vendor.reactive({
      id: 0,
      brand_name: "",
      nickname_list: "",
      country_name: "",
      type: "",
      website_url: "",
      description: "",
      logo_image: ""
      // 新增LOGO字段
    });
    const brandData = common_vendor.ref({});
    const typeOptions = common_vendor.ref(["公司", "个人作者"]);
    const loading = common_vendor.ref(false);
    const isFormValid = common_vendor.computed(() => {
      var _a, _b, _c;
      return ((_a = formData.brand_name) == null ? void 0 : _a.trim()) !== "" && ((_b = formData.type) == null ? void 0 : _b.trim()) !== "" && ((_c = formData.website_url) == null ? void 0 : _c.trim()) !== "";
    });
    const onTypeChange = (e) => {
      formData.type = typeOptions.value[e.detail.value];
    };
    const fetchBrandInfo = async () => {
      try {
        loading.value = true;
        const userInfo = await common_config.asyncGetUserInfo();
        common_vendor.index.__f__("log", "at pages/creator_base/brand_edit/brand_edit.vue:154", userInfo);
        if (!userInfo || !userInfo.brand_id) {
          common_vendor.index.showToast({
            title: "您尚未管理任何品牌",
            icon: "none"
          });
          return;
        }
        const brandId = userInfo == null ? void 0 : userInfo.brand_id;
        if (!brandId) {
          common_vendor.index.showToast({
            title: "用户未关联品牌信息",
            icon: "none"
          });
          return;
        }
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl.value}/brand-info?id=${brandId}`,
          method: "GET",
          header: {
            "Authorization": common_vendor.index.getStorageSync("token")
          }
        });
        if (res.data.status === "success") {
          brandData.value = res.data.data;
          Object.assign(formData, {
            id: brandData.value.id,
            brand_name: brandData.value.brand_name || "",
            nickname_list: brandData.value.nickname_list || "",
            country_name: brandData.value.country_name || "",
            type: brandData.value.type || "",
            website_url: brandData.value.website_url || "",
            description: brandData.value.description || "",
            logo_image: brandData.value.logo_image || ""
          });
        } else {
          common_vendor.index.showToast({
            title: "获取品牌信息失败: " + (res.data.msg || "未知错误"),
            icon: "none"
          });
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/creator_base/brand_edit/brand_edit.vue:202", "获取品牌信息失败:", err);
        common_vendor.index.showToast({
          title: "获取品牌信息失败，请重试",
          icon: "none"
        });
      } finally {
        loading.value = false;
      }
    };
    const changeLogo = async () => {
      try {
        const tempFilePath = await common_image.chooseImage();
        common_vendor.index.showLoading({
          title: "上传中...",
          mask: true
        });
        const qiniuTokenData = await common_image.getQiniuToken();
        if (!qiniuTokenData || !qiniuTokenData.path || !qiniuTokenData.token) {
          throw new Error("获取上传凭证失败: 缺少必要字段");
        }
        const fileName = qiniuTokenData.path;
        const result = await common_image.uploadImageToQiniu(
          tempFilePath,
          qiniuTokenData.token,
          fileName
        );
        if (result && result.imageUrl) {
          formData.logo_image = result.imageUrl;
          common_vendor.index.showToast({
            title: "上传成功,保存生效",
            icon: "success"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/creator_base/brand_edit/brand_edit.vue:248", "上传LOGO失败:", error);
        common_vendor.index.showToast({
          title: `上传LOGO失败: ${error.message || error}`,
          icon: "none",
          duration: 3e3
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const submitForm = async () => {
      if (!isFormValid.value)
        return;
      try {
        loading.value = true;
        const submitData = {
          id: formData.id,
          brand_name: formData.brand_name,
          nickname_list: formData.nickname_list,
          country_name: formData.country_name,
          type: formData.type,
          website_url: formData.website_url,
          description: formData.description,
          logo_image: formData.logo_image
          // 新增LOGO字段
        };
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl.value}/brand-manager/update-brand`,
          method: "POST",
          header: {
            "Content-Type": "application/json",
            "Authorization": common_vendor.index.getStorageSync("token")
          },
          data: submitData
        });
        if (res.data.status === "success") {
          common_vendor.index.showToast({
            title: "已更新",
            icon: "success"
          });
          fetchBrandInfo();
        } else {
          common_vendor.index.showToast({
            title: "更新失败: " + (res.data.msg || "未知错误"),
            icon: "none"
          });
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/creator_base/brand_edit/brand_edit.vue:302", "提交失败:", err);
        common_vendor.index.showToast({
          title: "提交失败，请重试",
          icon: "none"
        });
      } finally {
        loading.value = false;
      }
    };
    common_vendor.onMounted(() => {
      common_vendor.index.setNavigationBarTitle({
        title: "编辑品牌信息"
      });
      fetchBrandInfo();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: formData.logo_image || brandData.value.logo_image,
        b: common_vendor.o(changeLogo),
        c: formData.brand_name,
        d: common_vendor.o(($event) => formData.brand_name = $event.detail.value),
        e: common_vendor.p({
          type: "compose",
          size: "18",
          color: "#999"
        }),
        f: formData.brand_name && brandData.value.brand_name_image
      }, formData.brand_name && brandData.value.brand_name_image ? {
        g: brandData.value.brand_name_image
      } : {}, {
        h: formData.nickname_list,
        i: common_vendor.o(($event) => formData.nickname_list = $event.detail.value),
        j: common_vendor.p({
          type: "flag",
          size: "18",
          color: "#999"
        }),
        k: formData.country_name,
        l: common_vendor.o(($event) => formData.country_name = $event.detail.value),
        m: common_vendor.p({
          type: "location",
          size: "18",
          color: "#999"
        }),
        n: common_vendor.t(formData.type || "请选择身份类型"),
        o: common_vendor.p({
          type: "arrowdown",
          size: "16",
          color: "#999"
        }),
        p: typeOptions.value.indexOf(formData.type),
        q: typeOptions.value,
        r: common_vendor.o(onTypeChange),
        s: common_vendor.p({
          type: "person",
          size: "18",
          color: "#999"
        }),
        t: formData.website_url,
        v: common_vendor.o(($event) => formData.website_url = $event.detail.value),
        w: common_vendor.p({
          type: "link",
          size: "18",
          color: "#999"
        }),
        x: formData.description,
        y: common_vendor.o(($event) => formData.description = $event.detail.value),
        z: common_vendor.p({
          type: "chat",
          size: "18",
          color: "#999"
        }),
        A: isFormValid.value ? 1 : "",
        B: common_vendor.o(submitForm),
        C: !isFormValid.value || loading.value,
        D: loading.value
      }, loading.value ? {
        E: common_vendor.p({
          type: "spinner-cycle",
          size: "32",
          color: "#fff"
        })
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-89ac6237"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/creator_base/brand_edit/brand_edit.js.map
