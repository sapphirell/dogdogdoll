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
  __name: "set_showcase",
  setup(__props) {
    const activeTab = common_vendor.ref("highlight");
    const artistInfo = common_vendor.ref({
      artist_id: 0,
      brand_id: 0,
      brand_name: "",
      description: "",
      logo_image: "",
      artist_highlight_images: [],
      status_of_artist: 0,
      status_of_artist_text: "",
      status_of_hairstylist: 0,
      status_of_hairstylist_text: ""
    });
    const faceupList = common_vendor.ref([]);
    const currentPage = common_vendor.ref(1);
    const pageSize = common_vendor.ref(20);
    const hasMore = common_vendor.ref(true);
    const brandId = common_vendor.ref(0);
    const uploading = common_vendor.ref(false);
    const uploadProgress = common_vendor.ref(0);
    const uploadStatusText = common_vendor.ref("");
    const switchTab = (tab) => {
      activeTab.value = tab;
      if (tab === "faceup" && faceupList.value.length === 0) {
        fetchFaceupList();
      }
    };
    const fetchArtistInfo = async () => {
      try {
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl.value}/brand-manager/get-artist-info`,
          method: "GET",
          header: {
            "Authorization": `${common_vendor.index.getStorageSync("token")}`
          }
        });
        if (res.data.status === "success" && res.data.data) {
          const data = res.data.data;
          artistInfo.value = {
            ...artistInfo.value,
            brand_id: data.brand_id,
            artist_highlight_images: data.artist_highlight_images || []
          };
          brandId.value = data.brand_id;
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
    const fetchFaceupList = async () => {
      if (!brandId.value) {
        common_vendor.index.__f__("log", "at pages/creator_base/set_showcase/set_showcase.vue:218", "无Brand_id");
        return;
      }
      try {
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl.value}/brand-artist/bjd-faceup?brand_id=${brandId.value}&page=${currentPage.value}&size=${pageSize.value}`,
          method: "GET"
        });
        if (res.data.status === "success") {
          const newList = res.data.data.list.map((item) => ({
            ...item,
            // 确保image_urls是数组格式
            image_urls: Array.isArray(item.image_urls) ? item.image_urls : (item.image_urls || "").split(",")
          }));
          if (currentPage.value === 1) {
            faceupList.value = newList;
          } else {
            faceupList.value = [...faceupList.value, ...newList];
          }
          hasMore.value = faceupList.value.length < res.data.data.total;
        } else {
          common_vendor.index.showToast({
            title: "获取妆图列表失败",
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
    const handleUploadHighlight = async () => {
      try {
        const tempFilePaths = await common_image.chooseImageList(1);
        if (!tempFilePaths || tempFilePaths.length === 0)
          return;
        uploading.value = true;
        uploadStatusText.value = "准备上传...";
        uploadStatusText.value = "获取上传凭证...";
        const qiniuTokenData = await common_image.getQiniuToken();
        if (!qiniuTokenData || !qiniuTokenData.token) {
          throw new Error("获取上传凭证失败");
        }
        const filePath = tempFilePaths[0];
        uploadStatusText.value = "上传中...";
        uploadProgress.value = 50;
        const fileName = qiniuTokenData.path;
        const result = await common_image.uploadImageToQiniu(
          filePath,
          qiniuTokenData.token,
          fileName
        );
        if (result && result.imageUrl) {
          artistInfo.value.artist_highlight_images.push(result.imageUrl);
          uploadProgress.value = 100;
          await updateArtistHighlights();
          common_vendor.index.showToast({
            title: "上传成功",
            icon: "success"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/creator_base/set_showcase/set_showcase.vue:291", "上传图片失败:", error);
        common_vendor.index.showToast({
          title: "上传图片失败",
          icon: "none"
        });
      } finally {
        uploading.value = false;
        uploadProgress.value = 0;
      }
    };
    const updateArtistHighlights = async () => {
      try {
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl.value}/brand-manager/update-highlight-images`,
          method: "POST",
          data: {
            brand_id: artistInfo.value.brand_id,
            artist_highlight_images: artistInfo.value.artist_highlight_images.join(",")
          },
          header: {
            "Authorization": `${common_vendor.index.getStorageSync("token")}`
          }
        });
        if (res.data.status !== "success") {
          common_vendor.index.__f__("error", "at pages/creator_base/set_showcase/set_showcase.vue:318", "更新展示图失败:", res.data.msg);
        }
        fetchArtistInfo();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/creator_base/set_showcase/set_showcase.vue:322", "更新展示图失败:", error);
      }
    };
    const previewImage = (url) => {
      common_vendor.index.previewImage({
        current: url,
        urls: artistInfo.value.artist_highlight_images
      });
    };
    const deleteHighlight = async (index) => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要删除这张展示图吗？",
        success: async (res) => {
          if (res.confirm) {
            artistInfo.value.artist_highlight_images.splice(index, 1);
            await updateArtistHighlights();
            common_vendor.index.showToast({
              title: "删除成功",
              icon: "success"
            });
          }
        }
      });
    };
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
    };
    const navigateToAddFaceup = () => {
      common_vendor.index.navigateTo({
        url: `/pages/creator_base/faceup_editor/faceup_editor`
      });
    };
    const navigateToEditFaceup = (id) => {
      common_vendor.index.navigateTo({
        url: `/pages/creator_base/faceup_editor/faceup_editor?id=${id}`
      });
    };
    common_vendor.onMounted(() => {
      common_vendor.index.setNavigationBarTitle({
        title: "作品展示设置"
      });
      fetchArtistInfo();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: activeTab.value === "highlight" ? 1 : "",
        b: common_vendor.o(($event) => switchTab("highlight")),
        c: activeTab.value === "faceup" ? 1 : "",
        d: common_vendor.o(($event) => switchTab("faceup")),
        e: activeTab.value === "highlight"
      }, activeTab.value === "highlight" ? common_vendor.e({
        f: common_vendor.f(artistInfo.value.artist_highlight_images, (img, index, i0) => {
          return {
            a: img,
            b: common_vendor.o(($event) => previewImage(img), index),
            c: common_vendor.o(($event) => deleteHighlight(index), index),
            d: "c25da532-0-" + i0,
            e: index
          };
        }),
        g: common_vendor.p({
          type: "trash",
          size: "24",
          color: "#ff4d6a"
        }),
        h: common_vendor.p({
          type: "plus",
          size: "24",
          color: "#fff"
        }),
        i: common_vendor.o(handleUploadHighlight),
        j: uploading.value
      }, uploading.value ? {
        k: uploadProgress.value,
        l: common_vendor.t(uploadStatusText.value)
      } : {}) : {
        m: common_vendor.f(faceupList.value, (item, index, i0) => {
          return {
            a: item.image_urls[0],
            b: common_vendor.t(item.head_name),
            c: common_vendor.f(item.style_tags, (tag, tagIndex, i1) => {
              return {
                a: common_vendor.t(tag),
                b: tagIndex
              };
            }),
            d: common_vendor.t(item.sex),
            e: common_vendor.n(item.sex === "男" ? "male" : "female"),
            f: common_vendor.t(formatDate(item.created_at)),
            g: "c25da532-2-" + i0,
            h: item.id,
            i: common_vendor.o(($event) => navigateToEditFaceup(item.id), item.id)
          };
        }),
        n: common_vendor.p({
          type: "arrowright",
          size: "20",
          color: "#999"
        }),
        o: common_vendor.p({
          type: "plus",
          size: "24",
          color: "#fff"
        }),
        p: common_vendor.o(navigateToAddFaceup)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c25da532"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/creator_base/set_showcase/set_showcase.js.map
