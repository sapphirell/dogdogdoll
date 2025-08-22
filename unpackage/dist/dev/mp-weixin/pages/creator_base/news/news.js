"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const common_image = require("../../../common/image.js");
const common_config = require("../../../common/config.js");
if (!Array) {
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_goods_search2 = common_vendor.resolveComponent("goods-search");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_load_more2 + _easycom_uni_icons2 + _easycom_goods_search2 + _easycom_uni_popup2)();
}
const _easycom_uni_load_more = () => "../../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
const _easycom_uni_icons = () => "../../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_goods_search = () => "../../../components/goods-search/goods-search.js";
const _easycom_uni_popup = () => "../../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_load_more + _easycom_uni_icons + _easycom_goods_search + _easycom_uni_popup)();
}
const _sfc_main = {
  __name: "news",
  setup(__props) {
    const newsList = common_vendor.ref([]);
    const currentPage = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const total = common_vendor.ref(0);
    const loading = common_vendor.ref(false);
    const submitting = common_vendor.ref(false);
    const loadingStatus = common_vendor.ref("more");
    const scrollHeight = common_vendor.ref(0);
    const popup = common_vendor.ref(null);
    const isEditMode = common_vendor.ref(false);
    const currentNewsId = common_vendor.ref(null);
    const uploading = common_vendor.ref(false);
    const uploadedCount = common_vendor.ref(0);
    const totalToUpload = common_vendor.ref(0);
    const uploadStatusText = common_vendor.ref("");
    const formData = common_vendor.ref({
      title: "",
      content: "",
      image_list: [],
      news_type: 1,
      // 默认图透
      subscribe_goods_id: 0,
      subscribe_goods_name: ""
    });
    const newsTypes = common_vendor.ref([
      {
        value: 1,
        label: "图透"
      },
      {
        value: 2,
        label: "尾款"
      },
      {
        value: 3,
        label: "截定"
      },
      {
        value: 4,
        label: "公告"
      }
    ]);
    const currentBrandId = common_vendor.ref(1);
    const onGoodsSelect = (goods) => {
      formData.value.subscribe_goods_id = goods.id;
      formData.value.subscribe_goods_name = goods.name;
    };
    const onNewsTypeChange = (e) => {
      formData.value.news_type = parseInt(e.detail.value) + 1;
    };
    common_vendor.onMounted(() => {
      calcScrollHeight();
      common_vendor.index.setNavigationBarTitle({
        title: "品牌文章管理"
      });
    });
    common_vendor.onShow(() => {
      fetchNewsList(true);
    });
    const calcScrollHeight = () => {
      const systemInfo = common_vendor.index.getSystemInfoSync();
      scrollHeight.value = systemInfo.windowHeight - 50;
    };
    const getAuthorization = () => {
      const token = common_vendor.index.getStorageSync("token") || "";
      return token;
    };
    const chooseAndUploadImages = async () => {
      try {
        const remaining = 9 - formData.value.image_list.length;
        if (remaining <= 0)
          return;
        const tempFilePaths = await common_image.chooseImageList(remaining);
        if (!tempFilePaths || tempFilePaths.length === 0)
          return;
        const qiniuData = await common_image.getQiniuToken();
        const token = qiniuData.token;
        const basePath = qiniuData.path;
        uploading.value = true;
        totalToUpload.value = tempFilePaths.length;
        uploadedCount.value = 0;
        const uploadedUrls = [];
        for (let i = 0; i < tempFilePaths.length; i++) {
          try {
            const filePath = tempFilePaths[i];
            uploadStatusText.value = `上传中 (${i + 1}/${tempFilePaths.length})`;
            uploadedCount.value = i + 1;
            const result = await common_image.uploadImageToQiniu(
              filePath,
              token,
              basePath
            );
            if (result && result.imageUrl) {
              uploadedUrls.push(result.imageUrl);
            }
          } catch (uploadError) {
            common_vendor.index.__f__("error", "at pages/creator_base/news/news.vue:253", `第 ${i + 1} 张图片上传失败:`, uploadError);
            common_vendor.index.showToast({
              title: `第 ${i + 1} 张图片上传失败`,
              icon: "none"
            });
          }
        }
        formData.value.image_list = [...formData.value.image_list, ...uploadedUrls];
        if (uploadedUrls.length > 0) {
          common_vendor.index.showToast({
            title: `成功上传 ${uploadedUrls.length} 张图片`,
            icon: "success"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/creator_base/news/news.vue:270", "图片选择或上传失败:", error);
        common_vendor.index.showToast({
          title: "图片上传失败: " + (error.message || "未知错误"),
          icon: "none"
        });
      } finally {
        uploading.value = false;
        uploadedCount.value = 0;
        totalToUpload.value = 0;
      }
    };
    const fetchNewsList = async (reset = false) => {
      if (loading.value)
        return;
      if (reset) {
        currentPage.value = 1;
        newsList.value = [];
        loadingStatus.value = "more";
      }
      loading.value = true;
      loadingStatus.value = "loading";
      try {
        const res = await common_vendor.index.request({
          url: common_config.websiteUrl.value + "/brand-manager/news/list",
          method: "GET",
          data: {
            page_index: currentPage.value,
            page_size: pageSize.value
          },
          header: {
            "Authorization": getAuthorization()
          }
        });
        if (res.data.status === "success") {
          const data = res.data.data;
          const newList = data.news_list || [];
          total.value = data.total;
          const processedList = newList.map((news) => {
            const image_list = news.image_urls ? news.image_urls.split(",").filter((url) => url.trim() !== "") : news.image_list || [];
            return {
              ...news,
              image_list
            };
          });
          if (reset) {
            newsList.value = processedList;
          } else {
            newsList.value = [...newsList.value, ...processedList];
          }
          if (newsList.value.length >= total.value) {
            loadingStatus.value = "noMore";
          } else {
            loadingStatus.value = "more";
            currentPage.value++;
          }
        } else {
          common_vendor.index.showToast({
            title: res.data.message || "获取列表失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.showToast({
          title: "网络错误",
          icon: "none"
        });
      } finally {
        loading.value = false;
      }
    };
    const loadMore = () => {
      if (loadingStatus.value === "noMore")
        return;
      fetchNewsList();
    };
    const showAddDialog = () => {
      resetForm();
      isEditMode.value = false;
      popup.value.open();
    };
    const editNews = (news) => {
      resetForm();
      isEditMode.value = true;
      currentNewsId.value = news.id;
      formData.value = {
        title: news.title,
        content: news.content,
        image_list: [...news.image_list || []],
        news_type: news.news_type || 1,
        subscribe_goods_id: news.subscribe_goods_id || 0,
        subscribe_goods_name: news.subscribe_goods_name || ""
      };
      popup.value.open();
    };
    const resetForm = () => {
      formData.value = {
        title: "",
        content: "",
        image_list: []
      };
      currentNewsId.value = null;
      submitting.value = false;
    };
    const submitNews = async () => {
      if (!formData.value.title) {
        common_vendor.index.showToast({
          title: "请填写文章标题",
          icon: "none"
        });
        return;
      }
      if (!formData.value.content) {
        common_vendor.index.showToast({
          title: "请填写文章内容",
          icon: "none"
        });
        return;
      }
      const params = {
        title: formData.value.title,
        content: formData.value.content,
        image_urls: formData.value.image_list,
        news_type: formData.value.news_type,
        subscribe_goods_id: formData.value.subscribe_goods_id,
        subscribe_goods_name: formData.value.subscribe_goods_name
      };
      if (isEditMode.value) {
        params.id = currentNewsId.value;
      }
      submitting.value = true;
      try {
        const url = common_config.websiteUrl.value + (isEditMode.value ? "/brand-manager/news/update" : "/brand-manager/news/create");
        const method = "POST";
        const res = await common_vendor.index.request({
          url,
          method,
          data: params,
          header: {
            "Authorization": getAuthorization(),
            "Content-Type": "application/json"
          }
        });
        if (res.data.status === "success") {
          common_vendor.index.showToast({
            title: isEditMode.value ? "更新成功" : "添加成功",
            icon: "success"
          });
          popup.value.close();
          fetchNewsList(true);
        } else {
          common_vendor.index.showToast({
            title: res.data.message || (isEditMode.value ? "更新失败" : "添加失败"),
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/creator_base/news/news.vue:439", "提交失败:", error);
        common_vendor.index.showToast({
          title: "请求失败，请稍后重试",
          icon: "none"
        });
      } finally {
        submitting.value = false;
      }
    };
    const closeDialog = () => {
      popup.value.close();
    };
    const confirmDelete = (id) => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要删除该文章吗？",
        success: (res) => {
          if (res.confirm) {
            deleteNews(id);
          }
        }
      });
    };
    const deleteNews = async (id) => {
      try {
        const res = await common_vendor.index.request({
          url: common_config.websiteUrl.value + "/brand-manager/news/delete?id=" + id,
          method: "GET",
          header: {
            "Authorization": getAuthorization()
          }
        });
        if (res.data.status === "success") {
          common_vendor.index.showToast({
            title: "删除成功",
            icon: "success"
          });
          fetchNewsList(true);
        } else {
          common_vendor.index.showToast({
            title: res.data.message || "删除失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/creator_base/news/news.vue:487", "删除失败:", error);
        common_vendor.index.showToast({
          title: "网络错误",
          icon: "none"
        });
      }
    };
    const removeImage = (index) => {
      formData.value.image_list.splice(index, 1);
    };
    const previewImages = (images, current) => {
      common_vendor.index.previewImage({
        current,
        urls: images,
        indicator: "number"
      });
    };
    const formatDate = (timestamp, format = "yyyy-MM-dd HH:mm") => {
      if (!timestamp)
        return "";
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      if (format === "yyyy-MM-dd") {
        return `${year}-${month}-${day}`;
      }
      if (format === "HH:mm") {
        return `${hours}:${minutes}`;
      }
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    };
    return (_ctx, _cache) => {
      var _a;
      return common_vendor.e({
        a: loading.value
      }, loading.value ? {
        b: common_vendor.p({
          status: "loading"
        })
      } : newsList.value.length > 0 ? {
        d: common_vendor.f(newsList.value, (item, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.title),
            b: common_vendor.t(formatDate(item.created_at * 1e3)),
            c: common_vendor.o(($event) => editNews(item), item.id),
            d: common_vendor.o(($event) => confirmDelete(item.id), item.id),
            e: item.image_list && item.image_list.length
          }, item.image_list && item.image_list.length ? {
            f: common_vendor.f(item.image_list, (img, index, i1) => {
              return {
                a: index,
                b: img,
                c: common_vendor.o(($event) => previewImages(item.image_list, index), index)
              };
            })
          } : {}, {
            g: common_vendor.t(item.content.length > 50 ? item.content.substring(0, 50) + "..." : item.content),
            h: item.id
          });
        })
      } : {}, {
        c: newsList.value.length > 0,
        e: !loading.value
      }, !loading.value ? common_vendor.e({
        f: loadingStatus.value === "loading"
      }, loadingStatus.value === "loading" ? {} : {}, {
        g: loadingStatus.value === "noMore" && newsList.value.length !== 0
      }, loadingStatus.value === "noMore" && newsList.value.length !== 0 ? {} : {}) : {}, {
        h: newsList.value.length === 0 && !loading.value
      }, newsList.value.length === 0 && !loading.value ? {
        i: common_assets._imports_0$12
      } : {}, {
        j: common_vendor.o(loadMore),
        k: scrollHeight.value + "px",
        l: common_vendor.p({
          type: "plusempty",
          size: "30",
          color: "#fff"
        }),
        m: common_vendor.o(showAddDialog),
        n: common_vendor.t(isEditMode.value ? "编辑文章" : "新增文章"),
        o: common_vendor.o(closeDialog),
        p: common_vendor.p({
          type: "closeempty",
          size: "24",
          color: "#999"
        }),
        q: common_vendor.t(((_a = newsTypes.value.find((t) => t.value === formData.value.news_type)) == null ? void 0 : _a.label) || "请选择文章类型"),
        r: common_vendor.o(onNewsTypeChange),
        s: formData.value.news_type,
        t: newsTypes.value,
        v: formData.value.title,
        w: common_vendor.o(($event) => formData.value.title = $event.detail.value),
        x: formData.value.content,
        y: common_vendor.o(($event) => formData.value.content = $event.detail.value),
        z: common_vendor.o(onGoodsSelect),
        A: common_vendor.p({
          mode: "fill",
          modelValue: formData.value.subscribe_goods_name,
          brandId: currentBrandId.value
        }),
        B: uploading.value
      }, uploading.value ? {
        C: common_vendor.p({
          status: "loading"
        }),
        D: common_vendor.t(uploadedCount.value),
        E: common_vendor.t(totalToUpload.value)
      } : {}, {
        F: common_vendor.f(formData.value.image_list, (img, index, i0) => {
          return {
            a: img,
            b: common_vendor.o(($event) => removeImage(index), index),
            c: "7f1bac04-6-" + i0 + ",7f1bac04-2",
            d: index
          };
        }),
        G: common_vendor.p({
          type: "close",
          size: "18",
          color: "#fff"
        }),
        H: formData.value.image_list.length < 9 && !uploading.value
      }, formData.value.image_list.length < 9 && !uploading.value ? {
        I: common_vendor.p({
          type: "plusempty",
          size: "28",
          color: "#999"
        }),
        J: common_vendor.o(chooseAndUploadImages)
      } : {}, {
        K: common_vendor.t(submitting.value ? "提交中..." : "提交"),
        L: common_vendor.o(submitNews),
        M: submitting.value,
        N: common_vendor.sr(popup, "7f1bac04-2", {
          "k": "popup"
        }),
        O: common_vendor.p({
          type: "bottom"
        })
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/creator_base/news/news.js.map
