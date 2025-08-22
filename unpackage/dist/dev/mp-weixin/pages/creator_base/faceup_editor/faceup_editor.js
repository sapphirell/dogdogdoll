"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_image = require("../../../common/image.js");
const common_config = require("../../../common/config.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_cascade_multi_select2 = common_vendor.resolveComponent("cascade-multi-select");
  const _easycom_relation_picker2 = common_vendor.resolveComponent("relation-picker");
  (_easycom_uni_icons2 + _easycom_cascade_multi_select2 + _easycom_relation_picker2)();
}
const _easycom_uni_icons = () => "../../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_cascade_multi_select = () => "../../../components/cascade-multi-select/cascade-multi-select.js";
const _easycom_relation_picker = () => "../../../components/relation-picker/relation-picker.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_cascade_multi_select + _easycom_relation_picker)();
}
const _sfc_main = {
  __name: "faceup_editor",
  setup(__props) {
    const isEdit = common_vendor.ref(false);
    const form = common_vendor.ref({
      id: 0,
      title: "",
      head_name: "",
      goods_id: "",
      sex: "男",
      styles_tags: [],
      // 存储标签ID数组
      face_up_image_urls: []
      // 图片URL数组
    });
    const showRelationPicker = common_vendor.ref(false);
    const styleTags = common_vendor.ref({});
    const showTagPopup = common_vendor.ref(false);
    const tagSizeData = common_vendor.ref({});
    const initialTagSelection = common_vendor.ref([]);
    const uploading = common_vendor.ref(false);
    const uploadProgress = common_vendor.ref(0);
    const uploadStatusText = common_vendor.ref("");
    common_vendor.onLoad(async (options) => {
      await fetchStyleTags();
      if (options.id) {
        isEdit.value = true;
        fetchFaceupDetail(options.id);
      }
      common_vendor.index.setNavigationBarTitle({
        title: isEdit ? "编辑妆面" : "添加新妆面"
      });
    });
    const fetchStyleTags = async () => {
      try {
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl.value}/bjd-faceup-style-tags`,
          method: "GET"
        });
        if (res.data.status === "success") {
          styleTags.value = res.data.data;
          tagSizeData.value = {
            "风格标签": Object.values(styleTags.value)
          };
        }
      } catch (error2) {
        common_vendor.index.__f__("error", "at pages/creator_base/faceup_editor/faceup_editor.vue:223", "获取风格标签失败:", error2);
        common_vendor.index.showToast({
          title: "获取风格标签失败",
          icon: "none"
        });
      }
    };
    const fetchFaceupDetail = async (id) => {
      try {
        common_vendor.index.showLoading({ title: "加载中..." });
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl.value}/faceup/detail?id=${id}`,
          method: "GET"
        });
        if (res.data.status === "success") {
          const data = res.data.data;
          form.value = {
            id: data.id,
            title: data.title,
            head_name: data.head_name,
            goods_id: data.goods_id,
            sex: data.sex === 1 ? "男" : "女",
            styles_tags: data.styles_tags ? data.styles_tags.split(",").filter(Boolean) : [],
            // 修复图片字段处理 - 优先使用 images 数组，如果不存在则使用 face_up_image_urls 拆分
            face_up_image_urls: data.images || (data.face_up_image_urls ? data.face_up_image_urls.split(",") : [])
          };
          initialTagSelection.value = form.value.styles_tags.map((tagId) => {
            return {
              category: "风格标签",
              size: styleTags.value[tagId]
            };
          });
        } else {
          common_vendor.index.showToast({ title: res.data.msg, icon: "none" });
        }
      } catch (error2) {
        common_vendor.index.__f__("log", "at pages/creator_base/faceup_editor/faceup_editor.vue:265", error2);
        common_vendor.index.showToast({ title: "获取妆面详情失败", icon: "none" });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const handleRelationConfirm = (result) => {
      if (result.isFuzzy) {
        form.value.head_name = result.goods.name;
        form.value.goods_id = result.goods.id || "";
      } else {
        form.value.head_name = result.goods.name;
        form.value.goods_id = result.goods.id || "";
      }
      showRelationPicker.value = false;
    };
    const handleSexChange = (e) => {
      form.value.sex = e.detail.value;
    };
    const removeTag = (tagId) => {
      const index = form.value.styles_tags.indexOf(tagId);
      if (index > -1) {
        form.value.styles_tags.splice(index, 1);
      }
    };
    const handleTagConfirm = (selectedItems) => {
      const selectedIds = selectedItems.map((item) => {
        const tagName = item.size;
        for (const [id, name] of Object.entries(styleTags.value)) {
          if (name === tagName)
            return id;
        }
        return null;
      }).filter((id) => id !== null);
      form.value.styles_tags = selectedIds;
      showTagPopup.value = false;
    };
    const handleUploadImage = async () => {
      try {
        const remaining = 9 - form.value.face_up_image_urls.length;
        if (remaining <= 0) {
          common_vendor.index.showToast({ title: "最多只能上传9张图片", icon: "none" });
          return;
        }
        const tempFilePaths = await common_image.chooseImageList(remaining);
        if (!tempFilePaths || tempFilePaths.length === 0)
          return;
        uploading.value = true;
        uploadStatusText.value = "准备上传...";
        uploadStatusText.value = "获取上传凭证...";
        const qiniuTokenData = await common_image.getQiniuToken();
        if (!qiniuTokenData || !qiniuTokenData.token) {
          throw new Error("获取上传凭证失败");
        }
        for (let i = 0; i < tempFilePaths.length; i++) {
          try {
            const filePath = tempFilePaths[i];
            uploadStatusText.value = `上传中 (${i + 1}/${tempFilePaths.length})`;
            uploadProgress.value = i / tempFilePaths.length * 100;
            const fileName = qiniuTokenData.path;
            const result = await common_image.uploadImageToQiniu(
              filePath,
              qiniuTokenData.token,
              fileName
            );
            if (result && result.imageUrl) {
              form.value.face_up_image_urls.push(result.imageUrl);
              uploadProgress.value = (i + 1) / tempFilePaths.length * 100;
            }
          } catch (error2) {
            common_vendor.index.__f__("error", "at pages/creator_base/faceup_editor/faceup_editor.vue:367", `第 ${i + 1} 张图片上传失败:`, error2);
            common_vendor.index.showToast({
              title: `第 ${i + 1} 张图片上传失败`,
              icon: "none"
            });
          }
        }
        common_vendor.index.showToast({
          title: `成功上传${tempFilePaths.length}张图片`,
          icon: "success"
        });
      } catch (error2) {
        common_vendor.index.__f__("error", "at pages/creator_base/faceup_editor/faceup_editor.vue:380", "上传图片失败:", error2);
        common_vendor.index.showToast({
          title: "上传图片失败",
          icon: "none"
        });
      } finally {
        uploading.value = false;
        uploadProgress.value = 0;
      }
    };
    const previewImage = (url) => {
      common_vendor.index.previewImage({
        current: url,
        urls: form.value.face_up_image_urls
      });
    };
    const removeImage = (index) => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要删除这张图片吗？",
        success: (res) => {
          if (res.confirm) {
            form.value.face_up_image_urls.splice(index, 1);
            common_vendor.index.showToast({
              title: "已删除",
              icon: "success"
            });
          }
        }
      });
    };
    const handleSubmit = async () => {
      if (!form.value.title) {
        common_vendor.index.showToast({ title: "请输入妆面标题", icon: "none" });
        return;
      }
      if (!form.value.head_name) {
        common_vendor.index.showToast({ title: "请选择头型名称", icon: "none" });
        return;
      }
      if (!form.value.goods_id) {
        common_vendor.index.showToast({ title: "请选择关联商品", icon: "none" });
        return;
      }
      if (form.value.face_up_image_urls.length === 0) {
        common_vendor.index.showToast({ title: "请至少上传一张图片", icon: "none" });
        return;
      }
      try {
        common_vendor.index.showLoading({ title: "提交中..." });
        const submitData = {
          id: form.value.id,
          title: form.value.title,
          head_name: form.value.head_name,
          goods_id: form.value.goods_id,
          sex: form.value.sex === "男" ? 1 : 2,
          styles_tags: form.value.styles_tags.join(","),
          face_up_image_urls: form.value.face_up_image_urls.join(",")
        };
        const apiUrl = isEdit.value ? `${common_config.websiteUrl.value}/brand-manager/faceup/update` : `${common_config.websiteUrl.value}/brand-manager/faceup/add`;
        const token = common_vendor.index.getStorageSync("token");
        if (!token) {
          error.value = "未登录，请先登录";
          loading.value = false;
          loadStatus.value = "more";
          return;
        }
        const res = await common_vendor.index.request({
          url: apiUrl,
          method: "POST",
          data: submitData,
          header: {
            "Content-Type": "application/json",
            "Authorization": token
          }
        });
        if (res.data.status === "success") {
          common_vendor.index.showToast({
            title: isEdit.value ? "更新成功" : "添加成功",
            icon: "success"
          });
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1500);
        } else {
          common_vendor.index.showToast({
            title: res.data.msg || "提交失败",
            icon: "none"
          });
        }
      } catch (error2) {
        common_vendor.index.__f__("error", "at pages/creator_base/faceup_editor/faceup_editor.vue:491", "提交失败:", error2);
        common_vendor.index.showToast({
          title: "提交失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const handleCancel = () => {
      common_vendor.index.navigateBack();
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: form.value.title,
        b: common_vendor.o(($event) => form.value.title = $event.detail.value),
        c: form.value.head_name
      }, form.value.head_name ? {
        d: common_vendor.t(form.value.head_name)
      } : {}, {
        e: common_vendor.p({
          type: "arrowright",
          size: "16",
          color: "#999"
        }),
        f: common_vendor.o(($event) => showRelationPicker.value = true),
        g: form.value.goods_id,
        h: common_vendor.o(($event) => form.value.goods_id = $event.detail.value),
        i: form.value.sex === "男",
        j: form.value.sex === "女",
        k: common_vendor.o(handleSexChange),
        l: common_vendor.p({
          type: "arrowdown",
          size: "16",
          color: "#666"
        }),
        m: common_vendor.o(($event) => showTagPopup.value = true),
        n: common_vendor.f(form.value.styles_tags, (tagId, index, i0) => {
          return {
            a: common_vendor.t(styleTags.value[tagId]),
            b: common_vendor.o(($event) => removeTag(tagId), index),
            c: "1a0bcbe4-2-" + i0,
            d: index
          };
        }),
        o: common_vendor.p({
          type: "close",
          size: "16",
          color: "#999"
        }),
        p: form.value.styles_tags.length === 0
      }, form.value.styles_tags.length === 0 ? {} : {}, {
        q: common_vendor.f(form.value.face_up_image_urls, (img, index, i0) => {
          return {
            a: img,
            b: common_vendor.o(($event) => previewImage(img), index),
            c: "1a0bcbe4-3-" + i0,
            d: common_vendor.o(($event) => removeImage(index), index),
            e: "1a0bcbe4-4-" + i0,
            f: index
          };
        }),
        r: common_vendor.p({
          type: "eye",
          size: "20",
          color: "#fff"
        }),
        s: common_vendor.p({
          type: "trash",
          size: "20",
          color: "#fff"
        }),
        t: form.value.face_up_image_urls.length < 9
      }, form.value.face_up_image_urls.length < 9 ? {
        v: common_vendor.p({
          type: "plus",
          size: "32",
          color: "#999"
        }),
        w: common_vendor.o(handleUploadImage)
      } : {}, {
        x: uploading.value
      }, uploading.value ? {
        y: uploadProgress.value,
        z: common_vendor.t(uploadStatusText.value)
      } : {}, {
        A: common_vendor.o(handleCancel),
        B: common_vendor.t(isEdit.value ? "保存修改" : "添加妆面"),
        C: common_vendor.o(handleSubmit),
        D: common_vendor.o(($event) => showTagPopup.value = false),
        E: common_vendor.o(handleTagConfirm),
        F: common_vendor.p({
          show: showTagPopup.value,
          sizeData: tagSizeData.value,
          initialSelection: initialTagSelection.value,
          title: "选择风格标签"
        }),
        G: common_vendor.o(($event) => showRelationPicker.value = $event),
        H: common_vendor.o(handleRelationConfirm),
        I: common_vendor.o(($event) => showRelationPicker.value = false),
        J: common_vendor.p({
          visible: showRelationPicker.value,
          ["hide-type"]: "true"
        })
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/creator_base/faceup_editor/faceup_editor.js.map
