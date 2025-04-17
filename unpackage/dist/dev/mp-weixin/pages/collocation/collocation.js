"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const common_config = require("../../common/config.js");
const common_image = require("../../common/image.js");
if (!Array) {
  const _easycom_common_name_picker2 = common_vendor.resolveComponent("common-name-picker");
  const _easycom_common_search2 = common_vendor.resolveComponent("common-search");
  const _easycom_custom_picker2 = common_vendor.resolveComponent("custom-picker");
  const _easycom_common_modal2 = common_vendor.resolveComponent("common-modal");
  const _easycom_common_page2 = common_vendor.resolveComponent("common-page");
  (_easycom_common_name_picker2 + _easycom_common_search2 + _easycom_custom_picker2 + _easycom_common_modal2 + _easycom_common_page2)();
}
const _easycom_common_name_picker = () => "../../components/common-name-picker/common-name-picker.js";
const _easycom_common_search = () => "../../components/common-search/common-search.js";
const _easycom_custom_picker = () => "../../components/custom-picker/custom-picker.js";
const _easycom_common_modal = () => "../../components/common-modal/common-modal.js";
const _easycom_common_page = () => "../../components/common-page/common-page.js";
if (!Math) {
  (_easycom_common_name_picker + _easycom_common_search + _easycom_custom_picker + _easycom_common_modal + _easycom_common_page)();
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
    const chooseBrandName = common_vendor.ref("");
    const chooseBrandId = common_vendor.ref(0);
    const chooseGoodsName = common_vendor.ref("");
    const chooseGoodsId = common_vendor.ref(0);
    const chooseType = common_vendor.ref("");
    function getGoodsInfo(id) {
      return new Promise((resolve, reject) => {
        common_vendor.index.request({
          url: common_config.websiteUrl + "/goods?id=" + id,
          method: "GET",
          timeout: 5e3,
          success: (res) => {
            common_vendor.index.__f__("log", "at pages/collocation/collocation.vue:102", res.data.data);
            resolve(res.data);
          },
          fail: (err) => {
            common_vendor.index.__f__("log", "at pages/collocation/collocation.vue:106", err);
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
        common_vendor.index.__f__("log", "at pages/collocation/collocation.vue:133", data);
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
    function selectImage() {
      common_vendor.index.__f__("log", "at pages/collocation/collocation.vue:152", "openSelect");
      common_image.chooseImage().then((res) => {
        common_image.getQiniuToken().then((tokenData) => {
          common_vendor.index.__f__("log", "at pages/collocation/collocation.vue:155", tokenData);
          common_image.uploadImageToQiniu(res, tokenData.token, tokenData.path).then((uploadRes) => {
            if (uploadRes.statusCode != 200) {
              common_vendor.index.showToast({
                title: "上传失败",
                icon: "none"
              });
            }
            common_vendor.index.__f__("log", "at pages/collocation/collocation.vue:164", common_config.image1Url + tokenData.path);
            uploadList.value.push(common_config.image1Url + tokenData.path);
            common_vendor.index.showToast({
              title: "上传成功",
              icon: "success"
            });
          });
        });
      });
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
      if (!title.value.trim() || !content.value.trim()) {
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
      const postData = {
        title: title.value,
        content: content.value,
        image_url_list: uploadList.value,
        relation_data_list: saveCollocationDataList.value.map((item) => ({
          goods_id: item.goods_id,
          goods_name: item.goods_name,
          brand_id: item.brand_id,
          brand_name: item.brand_name,
          type: item.type
        }))
      };
      common_vendor.index.__f__("log", "at pages/collocation/collocation.vue:222", postData);
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
          if (res.data.code === 200) {
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
          common_vendor.index.__f__("log", "at pages/collocation/collocation.vue:253", err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        }
      });
    }
    function handleBrandSelect(brandId, brandName) {
      common_vendor.index.__f__("log", "at pages/collocation/collocation.vue:267", "收到品牌ID:", brandId);
      common_vendor.index.__f__("log", "at pages/collocation/collocation.vue:268", "收到品牌Name:", brandName);
      chooseBrandId.value = parseInt(brandId, 10);
      chooseBrandName.value = brandName;
      getGoods(brandId);
    }
    function handleGoodsSelect(id, name) {
      common_vendor.index.__f__("log", "at pages/collocation/collocation.vue:277", "选中的 id:", id);
      common_vendor.index.__f__("log", "at pages/collocation/collocation.vue:278", "选中的 name:", name);
      chooseGoodsId.value = parseInt(id, 10);
      chooseGoodsName.value = name;
    }
    function handleTypeSelect(value) {
      common_vendor.index.__f__("log", "at pages/collocation/collocation.vue:285", "选中的值:", value);
      chooseType.value = value;
      showSelectTab.value = true;
    }
    function getGoods(id) {
      common_vendor.index.request({
        url: common_config.websiteUrl + "/goods-name-list?id=" + id,
        method: "GET",
        timeout: 5e3,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/collocation/collocation.vue:298", res.data.data);
          goodsList.value = res.data.data;
          common_vendor.index.__f__("log", "at pages/collocation/collocation.vue:300", goodsList.value);
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/collocation/collocation.vue:304", err);
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
          common_vendor.index.__f__("log", "at pages/collocation/collocation.vue:323", res.data.data);
          typeList.value = res.data.data;
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/collocation/collocation.vue:327", err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        }
      });
    }
    function saveCollocation() {
      if (chooseBrandName.value == "") {
        common_vendor.index.showToast({
          title: "请选择或填写品牌名称",
          icon: "none"
        });
        return;
      }
      if (chooseGoodsName.value == "") {
        common_vendor.index.showToast({
          title: "请选择或填写商品名称",
          icon: "none"
        });
        return;
      }
      if (chooseGoodsId.value == 0) {
        let data = {
          "brand_id": chooseBrandId.value,
          "goods_id": 0,
          "brand_name": chooseBrandName.value,
          "goods_name": chooseGoodsName.value,
          "goods_image": "",
          "type": chooseType.value
        };
        saveCollocationDataList.value.push(data);
        showSelectTab.value = false;
        chooseBrandId.value = 0;
        chooseBrandName.value = "";
        chooseGoodsId.value = 0;
        chooseGoodsName.value = "";
        chooseType.value = "";
        return;
      }
      getGoodsInfo(chooseGoodsId.value).then((res) => {
        let data = {
          "brand_id": chooseBrandId.value,
          "goods_id": chooseGoodsId.value,
          "brand_name": chooseBrandName.value,
          "goods_name": chooseGoodsName.value,
          "goods_image": res.data.goods_images[0],
          "type": chooseType.value
        };
        saveCollocationDataList.value.push(data);
        showSelectTab.value = false;
        chooseBrandId.value = 0;
        chooseBrandName.value = "";
        chooseGoodsId.value = 0;
        chooseGoodsName.value = "";
        chooseType.value = "";
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
        i: common_vendor.o(handleTypeSelect),
        j: common_vendor.p({
          dataList: typeList.value,
          placeholder: "关联娃物"
        }),
        k: common_assets._imports_2$2,
        l: common_vendor.f(saveCollocationDataList.value, (item, index, i0) => {
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
        m: common_assets._imports_1$6,
        n: common_vendor.o(handleBrandSelect),
        o: common_vendor.p({
          mode: "fill",
          width: "calc(100vw - 120px)"
        }),
        p: common_vendor.o(handleGoodsSelect),
        q: common_vendor.p({
          dataList: goodsList.value,
          margin: "10px 0 0 0px"
        }),
        r: common_vendor.o(saveCollocation),
        s: common_vendor.o(($event) => showSelectTab.value = $event),
        t: common_vendor.p({
          visible: showSelectTab.value
        }),
        v: common_vendor.o(submitForm)
      };
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/collocation/collocation.js.map
