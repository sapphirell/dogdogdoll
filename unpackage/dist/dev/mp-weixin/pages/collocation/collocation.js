"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const common_config = require("../../common/config.js");
const common_image = require("../../common/image.js");
if (!Array) {
  const _easycom_relation_picker2 = common_vendor.resolveComponent("relation-picker");
  const _easycom_common_page2 = common_vendor.resolveComponent("common-page");
  (_easycom_relation_picker2 + _easycom_common_page2)();
}
const _easycom_relation_picker = () => "../../components/relation-picker/relation-picker.js";
const _easycom_common_page = () => "../../components/common-page/common-page.js";
if (!Math) {
  (_easycom_relation_picker + _easycom_common_page)();
}
const _sfc_main = {
  __name: "collocation",
  props: ["goods_id", "goods_name", "brand_id", "brand_name", "type"],
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
      common_vendor.index.__f__("log", "at pages/collocation/collocation.vue:97", "收到选择数据:", selectedData);
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
      common_vendor.index.__f__("log", "at pages/collocation/collocation.vue:110", "用户取消选择");
    };
    const showRelationPicker = () => {
      showSelectTab.value = true;
    };
    function getGoodsInfo(id) {
      return new Promise((resolve, reject) => {
        common_vendor.index.request({
          url: common_config.websiteUrl + "/goods?id=" + id,
          method: "GET",
          timeout: 5e3,
          success: (res) => {
            common_vendor.index.__f__("log", "at pages/collocation/collocation.vue:125", res.data.data);
            resolve(res.data);
          },
          fail: (err) => {
            common_vendor.index.__f__("log", "at pages/collocation/collocation.vue:129", err);
            common_vendor.index.showToast({
              title: "网络请求失败",
              icon: "none"
            });
            reject(err);
          },
          complete: () => {
            common_vendor.index.hideLoading();
          }
        });
      });
    }
    const saveCollocationDataList = common_vendor.ref([]);
    if (props.goods_id && props.goods_name && props.brand_id && props.brand_name && props.type) {
      getGoodsInfo(props.goods_id).then((res) => {
        let data = {
          "brand_id": parseInt(props.brand_id, 10),
          "goods_id": parseInt(props.goods_id, 10),
          "brand_name": props.brand_name,
          "goods_name": props.goods_name,
          "goods_image": res.data.goods_images[0],
          "type": props.type
        };
        common_vendor.index.__f__("log", "at pages/collocation/collocation.vue:156", data);
        saveCollocationDataList.value.push(data);
      });
    }
    const title = common_vendor.ref("");
    const content = common_vendor.ref("");
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
        common_vendor.index.__f__("error", "at pages/collocation/collocation.vue:194", "上传出错:", error);
        common_vendor.index.showToast({ title: "部分图片上传失败", icon: "none" });
      }
    }
    function submitForm() {
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        return;
      }
      if (!title.value.trim()) {
        common_vendor.index.showToast({
          title: "标题不能为空",
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
      const postData = {
        title: title.value,
        content: content.value,
        image_url_list: uploadList.value,
        scene,
        relation_data_list: saveCollocationDataList.value.map((item) => ({
          goods_id: item.goods_id,
          goods_name: item.goods_name,
          brand_id: item.brand_id,
          brand_name: item.brand_name,
          type: item.type
        }))
      };
      common_vendor.index.__f__("log", "at pages/collocation/collocation.vue:245", postData);
      common_vendor.index.request({
        url: common_config.websiteUrl + "/with-state/add-collocation",
        method: "POST",
        data: postData,
        header: {
          "Content-Type": "application/json",
          "Authorization": token
        },
        timeout: 5e3,
        success: (res) => {
          if (res.data.status === "success") {
            common_vendor.index.showToast({
              title: "提交成功"
            });
            title.value = "";
            content.value = "";
            uploadList.value = [];
            saveCollocationDataList.value = [];
            common_vendor.index.navigateBack();
          } else {
            common_vendor.index.showToast({
              title: res.data.msg || "提交失败",
              icon: "none"
            });
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/collocation/collocation.vue:276", err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        }
      });
    }
    function getTypes() {
      common_vendor.index.request({
        url: common_config.websiteUrl + "/goods-types",
        method: "GET",
        timeout: 5e3,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/collocation/collocation.vue:322", res.data.data);
          typeList.value = res.data.data;
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/collocation/collocation.vue:326", err);
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
    getTypes();
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(uploadList.value, (item, index, i0) => {
          return {
            a: item,
            b: common_vendor.o(viewFullImage, index),
            c: common_vendor.o(($event) => deleteImage(index), index),
            d: index
          };
        }),
        b: common_assets._imports_1$6,
        c: common_assets._imports_1$5,
        d: common_vendor.o(($event) => selectImage(_ctx.index)),
        e: title.value,
        f: common_vendor.o(($event) => title.value = $event.detail.value),
        g: content.value,
        h: common_vendor.o(($event) => content.value = $event.detail.value),
        i: common_assets._imports_2$3,
        j: common_vendor.o(showRelationPicker),
        k: common_vendor.f(saveCollocationDataList.value, (item, index, i0) => {
          return common_vendor.e({
            a: item.goods_image
          }, item.goods_image ? {
            b: item.goods_image
          } : {}, {
            c: common_vendor.t(item.type),
            d: common_vendor.t(item.brand_name),
            e: common_vendor.t(item.goods_name),
            f: common_vendor.o(($event) => deleteCollcation(index), index),
            g: index
          });
        }),
        l: common_assets._imports_1$6,
        m: common_vendor.o(handleRelationConfirm),
        n: common_vendor.o(handleRelationCancel),
        o: common_vendor.o(($event) => showSelectTab.value = $event),
        p: common_vendor.p({
          typeList: typeList.value,
          goodsList: goodsList.value,
          visible: showSelectTab.value
        }),
        q: common_vendor.o(submitForm)
      };
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/collocation/collocation.js.map
