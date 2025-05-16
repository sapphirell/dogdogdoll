"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const common_config = require("../../../common/config.js");
const common_image = require("../../../common/image.js");
if (!Array) {
  const _easycom_relation_picker2 = common_vendor.resolveComponent("relation-picker");
  _easycom_relation_picker2();
}
const _easycom_relation_picker = () => "../../../components/relation-picker/relation-picker.js";
if (!Math) {
  _easycom_relation_picker();
}
const _sfc_main = {
  __name: "showcase_form",
  props: ["showcase_id"],
  setup(__props) {
    const props = __props;
    const uploadList = common_vendor.ref([]);
    const goodsList = common_vendor.ref([
      // {"name":"aa", "id":1}
    ]);
    const typeList = common_vendor.ref([]);
    const showSelectTab = common_vendor.ref(false);
    common_vendor.ref("");
    common_vendor.ref(0);
    common_vendor.ref("");
    common_vendor.ref(0);
    common_vendor.ref("");
    const handleRelationConfirm = (selectedData) => {
      common_vendor.index.__f__("log", "at pages/stock/showcase_form/showcase_form.vue:111", "收到选择数据:", selectedData);
      saveCollocationDataList.value.push({
        brand_id: selectedData.brand_id,
        goods_id: selectedData.goods.id,
        brand_name: selectedData.brand.name,
        goods_name: selectedData.goods.name,
        goods_image: selectedData.goods.image,
        type: selectedData.type
      });
    };
    const handleRelationCancel = () => {
      common_vendor.index.__f__("log", "at pages/stock/showcase_form/showcase_form.vue:125", "用户取消选择");
    };
    const showRelationPicker = () => {
      showSelectTab.value = true;
    };
    const isEditable = common_vendor.computed(() => [-1, 1, 3].includes(display.value));
    const showDelete = common_vendor.computed(() => {
      if (props.showcase_id > 0) {
        return true;
      }
      return false;
    });
    const name = common_vendor.ref("");
    const description = common_vendor.ref("");
    const display = common_vendor.ref(-1);
    const saveCollocationDataList = common_vendor.ref([]);
    async function getShowCaseInfo() {
      var _a;
      if (!props.showcase_id)
        return;
      try {
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl}/with-state/showcase-detail?id=${props.showcase_id}`,
          method: "GET",
          header: {
            "Authorization": common_vendor.index.getStorageSync("token")
          }
        });
        const data = res.data.data;
        name.value = data.name;
        description.value = data.description;
        display.value = data.display;
        uploadList.value = ((_a = data.image_urls) == null ? void 0 : _a.split(",")) || [];
        common_vendor.index.__f__("log", "at pages/stock/showcase_form/showcase_form.vue:198", data);
        if (data.relations) {
          saveCollocationDataList.value = data.relations.map((r) => ({
            goods_id: r.relation_goods_id,
            goods_name: r.relation_goods_name,
            brand_id: r.relation_brand_id,
            brand_name: r.relation_brand_name,
            type: r.type,
            goods_image: r.relation_goods_image
          }));
        }
      } catch (err) {
        common_vendor.index.showToast({
          title: "加载失败",
          icon: "none"
        });
      }
    }
    function viewFullImage(index) {
      common_vendor.index.previewImage({
        current: uploadList.value[index],
        urls: uploadList.value
      });
    }
    async function selectImage() {
      try {
        const imagePaths = await common_image.chooseImageList(9);
        for (const path of imagePaths) {
          const tokenData = await common_image.getQiniuToken();
          await common_image.uploadImageToQiniu(path, tokenData.token, tokenData.path);
          uploadList.value.push(common_config.image1Url + tokenData.path);
        }
        common_vendor.index.showToast({ title: `成功上传${imagePaths.length}张图片`, icon: "success" });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/stock/showcase_form/showcase_form.vue:245", "上传出错:", error);
        common_vendor.index.showToast({ title: "部分图片上传失败", icon: "none" });
      }
    }
    async function handleDelete() {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "确定要删除这个展示吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              const res2 = await common_vendor.index.request({
                url: `${common_config.websiteUrl}/with-state/delete-showcase?id=` + props.showcase_id,
                method: "POST",
                header: {
                  "Authorization": common_vendor.index.getStorageSync("token")
                }
              });
              if (res2.data.status === "success") {
                common_vendor.index.showToast({
                  title: "删除成功"
                });
                setTimeout(() => common_vendor.index.navigateBack(), 1e3);
              }
            } catch (err) {
              common_vendor.index.showToast({
                title: "删除失败",
                icon: "none"
              });
            }
          }
        }
      });
    }
    async function submitForm() {
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        return;
      }
      if (!name.value.trim() || !description.value.trim()) {
        common_vendor.index.showToast({
          title: "标题和正文不能为空",
          icon: "none"
        });
        return;
      }
      if (uploadList.value.length === 0) {
        common_vendor.index.showToast({
          title: "请至少上传一张图片",
          icon: "none"
        });
        return;
      }
      let scene = common_config.getScene();
      let postData = {
        name: name.value,
        description: description.value,
        image_urls: uploadList.value.join(","),
        display: display.value,
        origin: scene,
        relations: saveCollocationDataList.value.map((item) => ({
          relation_goods_id: item.goods_id,
          relation_goods_name: item.goods_name,
          relation_brand_id: item.brand_id,
          relation_brand_name: item.brand_name,
          type: item.type,
          relation_origin: 2
          // 标识关联的是showcase
        }))
      };
      try {
        let url = `${common_config.websiteUrl}/with-state/add-showcase`;
        if (props.showcase_id) {
          url = `${common_config.websiteUrl}/with-state/update-showcase`;
          postData = {
            ...postData,
            id: parseInt(props.showcase_id, 10)
          };
        }
        const res = await common_vendor.index.request({
          url,
          method: "POST",
          data: postData,
          header: {
            "Content-Type": "application/json",
            "Authorization": common_vendor.index.getStorageSync("token")
          }
        });
        if (res.data.code !== "failed") {
          common_vendor.index.showToast({
            title: "提交成功"
          });
          setTimeout(() => common_vendor.index.navigateBack(), 1500);
        } else {
          common_vendor.index.showToast({
            title: "提交失败",
            icon: "none"
          });
          return;
        }
      } catch (err) {
        common_vendor.index.__f__("log", "at pages/stock/showcase_form/showcase_form.vue:360", err);
        common_vendor.index.showToast({
          title: "提交失败",
          icon: "none"
        });
      }
    }
    function getTypes() {
      common_vendor.index.request({
        url: common_config.websiteUrl + "/goods-types",
        method: "GET",
        timeout: 5e3,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/stock/showcase_form/showcase_form.vue:380", res.data.data);
          typeList.value = res.data.data;
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/stock/showcase_form/showcase_form.vue:384", err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        }
      });
    }
    function deleteImage(index) {
      uploadList.value.splice(index, 1);
    }
    function deleteCollcation(index) {
      saveCollocationDataList.value.splice(index, 1);
    }
    common_vendor.index.setNavigationBarTitle({
      title: "展示柜"
    });
    common_vendor.onMounted(() => {
      getTypes();
      getShowCaseInfo();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: !isEditable.value
      }, !isEditable.value ? {} : {}, {
        b: common_vendor.f(uploadList.value, (item, index, i0) => {
          return common_vendor.e({
            a: item,
            b: common_vendor.o(viewFullImage, index)
          }, isEditable.value ? {
            c: common_assets._imports_1$6,
            d: common_vendor.o(($event) => deleteImage(index), index)
          } : {}, {
            e: index
          });
        }),
        c: isEditable.value,
        d: isEditable.value
      }, isEditable.value ? {
        e: common_assets._imports_1$5,
        f: common_vendor.o(($event) => selectImage(_ctx.index))
      } : {}, {
        g: !isEditable.value,
        h: name.value,
        i: common_vendor.o(($event) => name.value = $event.detail.value),
        j: !isEditable.value,
        k: description.value,
        l: common_vendor.o(($event) => description.value = $event.detail.value),
        m: isEditable.value
      }, isEditable.value ? {
        n: common_assets._imports_2$3,
        o: common_vendor.o(showRelationPicker)
      } : {}, {
        p: common_vendor.f(saveCollocationDataList.value, (item, index, i0) => {
          return common_vendor.e({
            a: item.goods_image
          }, item.goods_image ? {
            b: item.goods_image
          } : {}, {
            c: common_vendor.t(item.type),
            d: common_vendor.t(item.brand_name),
            e: common_vendor.t(item.goods_name)
          }, isEditable.value ? {
            f: common_assets._imports_1$6,
            g: common_vendor.o(($event) => deleteCollcation(index), index)
          } : {}, {
            h: index
          });
        }),
        q: isEditable.value,
        r: common_vendor.o(handleRelationConfirm),
        s: common_vendor.o(handleRelationCancel),
        t: common_vendor.o(($event) => showSelectTab.value = $event),
        v: common_vendor.p({
          typeList: typeList.value,
          goodsList: goodsList.value,
          visible: showSelectTab.value
        }),
        w: showDelete.value
      }, showDelete.value ? {
        x: common_vendor.o(handleDelete)
      } : {}, {
        y: common_vendor.o(submitForm)
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/stock/showcase_form/showcase_form.js.map
