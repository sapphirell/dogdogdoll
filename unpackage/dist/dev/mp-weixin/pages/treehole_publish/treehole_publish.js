"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const common_config = require("../../common/config.js");
const common_image = require("../../common/image.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_common_page2 = common_vendor.resolveComponent("common-page");
  (_easycom_uni_icons2 + _easycom_common_page2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_common_page = () => "../../components/common-page/common-page.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_common_page)();
}
const _sfc_main = {
  __name: "treehole_publish",
  setup(__props) {
    const content = common_vendor.ref("");
    const isAnonymous = common_vendor.ref(0);
    const uploadList = common_vendor.ref([]);
    const categories = common_vendor.ref({});
    const selectedCategory = common_vendor.ref("");
    const selectedIndex = common_vendor.ref(-1);
    const selectedCategoryLabel = common_vendor.ref("");
    function viewFullImage(index) {
      common_vendor.index.previewImage({
        current: uploadList.value[index],
        urls: uploadList.value
      });
    }
    function handleAnonymous(e) {
      isAnonymous.value = e.detail.value.length > 0 ? 1 : 0;
    }
    common_vendor.index.setNavigationBarTitle({
      title: "投稿树洞"
    });
    function selectImage() {
      common_vendor.index.__f__("log", "at pages/treehole_publish/treehole_publish.vue:108", "openSelect");
      common_image.chooseImage().then((res) => {
        common_image.getQiniuToken().then((tokenData) => {
          common_vendor.index.__f__("log", "at pages/treehole_publish/treehole_publish.vue:111", tokenData);
          common_image.uploadImageToQiniu(res, tokenData.token, tokenData.path).then((uploadRes) => {
            if (uploadRes.statusCode != 200) {
              common_vendor.index.showToast({
                title: "上传失败",
                icon: "none"
              });
            }
            common_vendor.index.__f__("log", "at pages/treehole_publish/treehole_publish.vue:120", common_config.image1Url + tokenData.path);
            uploadList.value.push(common_config.image1Url + tokenData.path);
            common_vendor.index.showToast({
              title: "上传成功",
              icon: "success"
            });
          });
        });
      });
    }
    const fetchCategories = async () => {
      try {
        const res = await common_vendor.index.request({
          url: common_config.websiteUrl + "/treehole-typelist",
          method: "GET"
        });
        if (res.data.status === "success") {
          categories.value = Object.entries(res.data.data).map(([value, label]) => ({
            value: Number(value),
            label
          }));
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/treehole_publish/treehole_publish.vue:150", "获取分类失败:", err);
      }
    };
    function handleCategoryChange(e) {
      const index = e.detail.value;
      if (index >= 0 && categories.value[index]) {
        selectedIndex.value = index;
        selectedCategory.value = categories.value[index].value;
        selectedCategoryLabel.value = categories.value[index].label;
      }
    }
    const canSubmit = common_vendor.computed(() => {
      return content.value.trim().length > 0 && selectedCategory.value !== null;
    });
    async function handleSubmit() {
      if (!canSubmit.value)
        return;
      if (!selectedCategory.value) {
        common_vendor.index.showToast({
          title: "请选择分类",
          icon: "none"
        });
        return;
      }
      try {
        common_vendor.index.showLoading({
          title: "提交中..."
        });
        const token = common_vendor.index.getStorageSync("token");
        if (!token) {
          common_vendor.index.showToast({
            title: "请先登录",
            icon: "none"
          });
          return;
        }
        const postData = {
          content: content.value.trim(),
          images: uploadList.value,
          is_anonymous: isAnonymous.value,
          category_id: selectedCategory.value
        };
        const res = await common_vendor.index.request({
          url: common_config.websiteUrl + "/with-state/add-submission",
          method: "POST",
          data: postData,
          header: {
            "Content-Type": "application/json",
            "Authorization": token
          }
        });
        common_vendor.index.hideLoading();
        if (res.data.status == "success") {
          common_vendor.index.showToast({
            title: "我们很快审核完成",
            icon: "success"
          });
          setTimeout(() => {
            content.value = "";
            uploadList.value = [];
            isAnonymous.value = 0;
            common_vendor.index.navigateBack();
          }, 1500);
        } else {
          common_vendor.index.showToast({
            title: res.data.msg || "提交失败",
            icon: "none"
          });
        }
      } catch (err) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/treehole_publish/treehole_publish.vue:236", "提交失败:", err);
        common_vendor.index.showToast({
          title: "网络请求失败",
          icon: "none"
        });
      }
    }
    common_vendor.onMounted(() => {
      fetchCategories();
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(selectedCategoryLabel.value || "请选择分类（必选）"),
        b: common_vendor.n(selectedCategory.value ? "" : "placeholder"),
        c: common_vendor.p({
          type: "right",
          size: "22",
          color: "#888"
        }),
        d: categories.value,
        e: common_vendor.o(handleCategoryChange),
        f: selectedIndex.value,
        g: common_vendor.f(uploadList.value, (item, index, i0) => {
          return {
            a: item,
            b: common_vendor.o(viewFullImage, index),
            c: common_vendor.o(($event) => _ctx.deleteImage(index), index),
            d: index
          };
        }),
        h: common_assets._imports_1$6,
        i: common_assets._imports_1$5,
        j: common_vendor.o(($event) => selectImage(_ctx.index)),
        k: content.value,
        l: common_vendor.o(($event) => content.value = $event.detail.value),
        m: isAnonymous.value === 1,
        n: common_vendor.o(handleAnonymous),
        o: !canSubmit.value ? 1 : "",
        p: common_vendor.o(handleSubmit),
        q: common_vendor.p({
          title: "发布树洞"
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-07f0d6e5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/treehole_publish/treehole_publish.js.map
