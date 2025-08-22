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
  __name: "artist_info",
  setup(__props) {
    const activeTab = common_vendor.ref("artist");
    const formData = common_vendor.ref({
      artist_highlight_images: [],
      hairstylist_highlight_images: [],
      status_of_artist: 0,
      status_of_hairstylist: 0,
      base_price_of_artist: 0,
      base_price_of_hairstylist: 0,
      overload_ratio_of_artist: 1,
      overload_ratio_of_hairstylist: 1,
      rule_of_artist: "",
      rule_of_hairstylist: "",
      contact: ""
    });
    const statusOptions = common_vendor.ref([
      {
        label: "请选择状态",
        value: 0
      },
      {
        label: "长期接单",
        value: 1
      },
      {
        label: "限时手速投递",
        value: 2
      },
      {
        label: "限时抽选投递",
        value: 3
      },
      {
        label: "限时黑箱卡投递",
        value: 4
      },
      {
        label: "暂停接单",
        value: 5
      }
    ]);
    const artistUploading = common_vendor.ref(false);
    const artistUploadProgress = common_vendor.ref(0);
    const artistUploadStatusText = common_vendor.ref("");
    const hairstylistUploading = common_vendor.ref(false);
    const hairstylistUploadProgress = common_vendor.ref(0);
    const hairstylistUploadStatusText = common_vendor.ref("");
    const artistStatusIndex = common_vendor.computed(() => {
      return statusOptions.value.findIndex((item) => item.value === formData.value.status_of_artist);
    });
    const hairstylistStatusIndex = common_vendor.computed(() => {
      return statusOptions.value.findIndex((item) => item.value === formData.value.status_of_hairstylist);
    });
    const switchTab = (tab) => {
      activeTab.value = tab;
    };
    const previewImage = (url, urls) => {
      common_vendor.index.previewImage({
        current: url,
        urls
      });
    };
    const chooseArtistImage = async () => {
      try {
        const maxCount = 9 - formData.value.artist_highlight_images.length;
        if (maxCount <= 0) {
          common_vendor.index.showToast({ title: "最多只能上传9张图片", icon: "none" });
          return;
        }
        const tempFilePaths = await common_image.chooseImageList(maxCount);
        artistUploading.value = true;
        artistUploadProgress.value = 0;
        artistUploadStatusText.value = "准备上传...";
        artistUploadStatusText.value = "获取上传凭证...";
        const qiniuTokenRes = await common_image.getQiniuToken();
        if (!qiniuTokenRes || !qiniuTokenRes.token) {
          throw new Error("获取上传凭证失败");
        }
        const qiniuTokenData = qiniuTokenRes;
        for (let i = 0; i < tempFilePaths.length; i++) {
          try {
            const filePath = tempFilePaths[i];
            artistUploadStatusText.value = `上传中 (${i + 1}/${tempFilePaths.length})`;
            artistUploadProgress.value = Math.round(i / tempFilePaths.length * 100);
            const fileName = qiniuTokenData.path;
            const result = await common_image.uploadImageToQiniu(
              filePath,
              qiniuTokenData.token,
              fileName
            );
            if (result && result.imageUrl) {
              formData.value.artist_highlight_images.push(result.imageUrl);
            }
          } catch (error) {
            common_vendor.index.__f__("error", "at pages/creator_base/artist_info/artist_info.vue:321", `第 ${i + 1} 张图片上传失败:`, error);
            common_vendor.index.showToast({
              title: `第 ${i + 1} 张图片上传失败: ${error.message || error}`,
              icon: "none",
              duration: 3e3
            });
          }
        }
        common_vendor.index.showToast({ title: "上传成功", icon: "success" });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/creator_base/artist_info/artist_info.vue:332", "上传失败:", error);
        common_vendor.index.showToast({
          title: "上传失败: " + (error.message || "未知错误"),
          icon: "none"
        });
      } finally {
        artistUploading.value = false;
        artistUploadProgress.value = 0;
      }
    };
    const removeArtistImage = (index) => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要删除这张展示图吗？",
        success: (res) => {
          if (res.confirm) {
            formData.value.artist_highlight_images.splice(index, 1);
            common_vendor.index.showToast({
              title: "删除成功",
              icon: "success"
            });
          }
        }
      });
    };
    const chooseHairstylistImage = async () => {
      try {
        const maxCount = 9 - formData.value.hairstylist_highlight_images.length;
        if (maxCount <= 0) {
          common_vendor.index.showToast({ title: "最多只能上传9张图片", icon: "none" });
          return;
        }
        const tempFilePaths = await common_image.chooseImageList(maxCount);
        hairstylistUploading.value = true;
        hairstylistUploadProgress.value = 0;
        hairstylistUploadStatusText.value = "准备上传...";
        hairstylistUploadStatusText.value = "获取上传凭证...";
        const qiniuTokenRes = await common_image.getQiniuToken();
        if (!qiniuTokenRes || !qiniuTokenRes.token) {
          throw new Error("获取上传凭证失败");
        }
        const qiniuTokenData = qiniuTokenRes;
        for (let i = 0; i < tempFilePaths.length; i++) {
          try {
            const filePath = tempFilePaths[i];
            hairstylistUploadStatusText.value = `上传中 (${i + 1}/${tempFilePaths.length})`;
            hairstylistUploadProgress.value = Math.round(i / tempFilePaths.length * 100);
            const fileName = qiniuTokenData.path;
            const result = await common_image.uploadImageToQiniu(
              filePath,
              qiniuTokenData.token,
              fileName
            );
            if (result && result.imageUrl) {
              formData.value.hairstylist_highlight_images.push(result.imageUrl);
            }
          } catch (error) {
            common_vendor.index.__f__("error", "at pages/creator_base/artist_info/artist_info.vue:410", `第 ${i + 1} 张图片上传失败:`, error);
            common_vendor.index.showToast({
              title: `第 ${i + 1} 张图片上传失败: ${error.message || error}`,
              icon: "none",
              duration: 3e3
            });
          }
        }
        common_vendor.index.showToast({ title: "上传成功", icon: "success" });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/creator_base/artist_info/artist_info.vue:421", "上传失败:", error);
        common_vendor.index.showToast({
          title: "上传失败: " + (error.message || "未知错误"),
          icon: "none"
        });
      } finally {
        hairstylistUploading.value = false;
        hairstylistUploadProgress.value = 0;
      }
    };
    const removeHairstylistImage = (index) => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要删除这张展示图吗？",
        success: (res) => {
          if (res.confirm) {
            formData.value.hairstylist_highlight_images.splice(index, 1);
            common_vendor.index.showToast({
              title: "删除成功",
              icon: "success"
            });
          }
        }
      });
    };
    const fetchArtistInfo = async () => {
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "加载中..."
      });
      try {
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl.value}/brand-manager/get-artist-info`,
          method: "GET",
          header: {
            Authorization: token
          }
        });
        if (res.data.status === "success") {
          common_vendor.index.__f__("log", "at pages/creator_base/artist_info/artist_info.vue:471", res.data.data);
          const data = res.data.data;
          formData.value = {
            artist_highlight_images: data.artist_highlight_images || [],
            hairstylist_highlight_images: data.hairstylist_highlight_images || [],
            status_of_artist: Number(data.status_of_artist) || 0,
            status_of_hairstylist: Number(data.status_of_hairstylist) || 0,
            base_price_of_artist: parseFloat(data.base_price_of_artist) || 0,
            base_price_of_hairstylist: parseFloat(data.base_price_of_hairstylist) || 0,
            overload_ratio_of_artist: parseFloat(data.overload_ratio_of_artist) || 1,
            overload_ratio_of_hairstylist: parseFloat(data.overload_ratio_of_hairstylist) || 1,
            rule_of_artist: data.rule_of_artist || "",
            rule_of_hairstylist: data.rule_of_hairstylist || "",
            contact: data.contact || ""
          };
        } else {
          common_vendor.index.showToast({
            title: res.data.msg || "获取信息失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/creator_base/artist_info/artist_info.vue:493", "获取创作者信息失败:", error);
        common_vendor.index.showToast({
          title: "网络请求失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const saveSettings = async () => {
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "保存中..."
      });
      try {
        formData.value.base_price_of_artist = parseFloat(formData.value.base_price_of_artist);
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl.value}/brand-manager/update-artist-info`,
          method: "POST",
          header: {
            Authorization: token,
            "Content-Type": "application/json"
          },
          data: formData.value
        });
        if (res.data.status === "success") {
          common_vendor.index.showToast({
            title: "保存成功",
            icon: "success"
          });
          fetchArtistInfo();
        } else {
          common_vendor.index.showToast({
            title: res.data.msg || "保存失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/creator_base/artist_info/artist_info.vue:545", "保存创作者信息失败:", error);
        common_vendor.index.showToast({
          title: "网络请求失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    common_vendor.onMounted(() => {
      fetchArtistInfo();
      common_vendor.index.setNavigationBarTitle({
        title: "妆师毛娘信息设置"
      });
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: activeTab.value === "artist" ? 1 : "",
        b: common_vendor.o(($event) => switchTab("artist")),
        c: activeTab.value === "hairstylist" ? 1 : "",
        d: common_vendor.o(($event) => switchTab("hairstylist")),
        e: activeTab.value === "artist"
      }, activeTab.value === "artist" ? common_vendor.e({
        f: common_vendor.t(statusOptions.value[artistStatusIndex.value].label),
        g: statusOptions.value,
        h: artistStatusIndex.value,
        i: formData.value.base_price_of_artist,
        j: common_vendor.o(($event) => formData.value.base_price_of_artist = $event.detail.value),
        k: formData.value.overload_ratio_of_artist,
        l: common_vendor.o(($event) => formData.value.overload_ratio_of_artist = $event.detail.value),
        m: formData.value.contact,
        n: common_vendor.o(($event) => formData.value.contact = $event.detail.value),
        o: common_vendor.f(formData.value.artist_highlight_images, (image, index, i0) => {
          return {
            a: image,
            b: common_vendor.o(($event) => previewImage(image, formData.value.artist_highlight_images), index),
            c: common_vendor.o(($event) => removeArtistImage(index), index),
            d: "c32993bd-0-" + i0,
            e: index
          };
        }),
        p: common_vendor.p({
          type: "trash",
          size: "24",
          color: "#ff4d6a"
        }),
        q: formData.value.artist_highlight_images.length < 9
      }, formData.value.artist_highlight_images.length < 9 ? {
        r: common_vendor.p({
          type: "plus",
          size: "32",
          color: "#999"
        }),
        s: common_vendor.o(chooseArtistImage)
      } : {}, {
        t: artistUploading.value
      }, artistUploading.value ? {
        v: artistUploadProgress.value,
        w: common_vendor.t(artistUploadStatusText.value)
      } : {}, {
        x: formData.value.rule_of_artist,
        y: common_vendor.o(($event) => formData.value.rule_of_artist = $event.detail.value)
      }) : {}, {
        z: activeTab.value === "hairstylist"
      }, activeTab.value === "hairstylist" ? common_vendor.e({
        A: common_vendor.t(statusOptions.value[hairstylistStatusIndex.value].label),
        B: statusOptions.value,
        C: hairstylistStatusIndex.value,
        D: formData.value.base_price_of_hairstylist,
        E: common_vendor.o(($event) => formData.value.base_price_of_hairstylist = $event.detail.value),
        F: formData.value.overload_ratio_of_hairstylist,
        G: common_vendor.o(($event) => formData.value.overload_ratio_of_hairstylist = $event.detail.value),
        H: formData.value.contact,
        I: common_vendor.o(($event) => formData.value.contact = $event.detail.value),
        J: common_vendor.f(formData.value.hairstylist_highlight_images, (image, index, i0) => {
          return {
            a: image,
            b: common_vendor.o(($event) => previewImage(image, formData.value.hairstylist_highlight_images), index),
            c: common_vendor.o(($event) => removeHairstylistImage(index), index),
            d: "c32993bd-2-" + i0,
            e: index
          };
        }),
        K: common_vendor.p({
          type: "trash",
          size: "24",
          color: "#ff4d6a"
        }),
        L: common_vendor.p({
          type: "plus",
          size: "24",
          color: "#fff"
        }),
        M: common_vendor.o(chooseHairstylistImage),
        N: hairstylistUploading.value
      }, hairstylistUploading.value ? {
        O: hairstylistUploadProgress.value,
        P: common_vendor.t(hairstylistUploadStatusText.value)
      } : {}, {
        Q: formData.value.rule_of_hairstylist,
        R: common_vendor.o(($event) => formData.value.rule_of_hairstylist = $event.detail.value)
      }) : {}, {
        S: common_vendor.o(saveSettings)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c32993bd"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/creator_base/artist_info/artist_info.js.map
