"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const common_config = require("../../common/config.js");
const common_image = require("../../common/image.js");
if (!Array) {
  const _easycom_view_logs2 = common_vendor.resolveComponent("view-logs");
  const _easycom_relation_picker2 = common_vendor.resolveComponent("relation-picker");
  (_easycom_view_logs2 + _easycom_relation_picker2)();
}
const _easycom_view_logs = () => "../../components/view-logs/view-logs.js";
const _easycom_relation_picker = () => "../../components/relation-picker/relation-picker.js";
if (!Math) {
  (_easycom_view_logs + _easycom_relation_picker)();
}
const _sfc_main = {
  __name: "collocation",
  props: ["goods_id", "goods_name", "brand_id", "brand_name", "type", "collocation_id"],
  setup(__props) {
    const props = __props;
    const isEdit = common_vendor.ref(false);
    const uploadList = common_vendor.ref([]);
    const goodsList = common_vendor.ref([]);
    const typeList = common_vendor.ref([]);
    const showSelectTab = common_vendor.ref(false);
    const saveCollocationDataList = common_vendor.ref([]);
    const title = common_vendor.ref("");
    const content = common_vendor.ref("");
    async function fetchCollocationDetail() {
      if (!props.collocation_id)
        return;
      try {
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl.value}/view-collocation?collocation_id=${props.collocation_id}&origin=1`,
          method: "GET",
          timeout: 5e3
        });
        if (res.data.status === "success") {
          const data = res.data.data;
          title.value = data.title || "";
          content.value = data.content || "";
          uploadList.value = data.image_url_list || [];
          if (data.collocation_relation_list && data.collocation_relation_list.length > 0) {
            saveCollocationDataList.value = data.collocation_relation_list.map((item) => ({
              goods_id: item.relation_goods_id,
              goods_name: item.relation_goods_name,
              brand_id: item.relation_brand_id,
              brand_name: item.relation_brand_name,
              type: item.type,
              goods_image: item.relation_goods_image || ""
            }));
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/collocation/collocation.vue:122", "获取搭配详情失败:", error);
        common_vendor.index.showToast({
          title: "加载搭配详情失败",
          icon: "none"
        });
      }
    }
    common_vendor.onMounted(() => {
      getTypes();
      if (props.collocation_id) {
        isEdit.value = true;
        fetchCollocationDetail();
      }
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
          const exists = saveCollocationDataList.value.some(
            (item) => item.goods_id === data.goods_id && item.brand_id === data.brand_id
          );
          if (!exists) {
            saveCollocationDataList.value.push(data);
          }
        });
      }
    });
    const handleRelationConfirm = (data) => {
      try {
        const relationData = {
          goods_id: data.goods.id || 0,
          goods_name: data.goods.name,
          goods_image: data.goods.image || "",
          brand_id: data.brand.id || 0,
          brand_name: data.brand.name || (data.isFuzzy ? "" : "未知品牌"),
          type: data.type || (data.isFuzzy ? "未知类型" : "")
        };
        const isExist = saveCollocationDataList.value.some(
          (item) => item.goods_id !== 0 && item.goods_id === relationData.goods_id || item.goods_name === relationData.goods_name
        );
        if (!isExist) {
          saveCollocationDataList.value.push(relationData);
        } else {
          common_vendor.index.showToast({
            title: "已存在相同关联项",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/collocation/collocation.vue:189", "保存关联数据失败:", error);
        common_vendor.index.showToast({
          title: "保存关联信息失败",
          icon: "none"
        });
      }
    };
    const handleRelationCancel = () => {
      common_vendor.index.__f__("log", "at pages/collocation/collocation.vue:199", "用户取消选择");
    };
    const showRelationPicker = () => {
      showSelectTab.value = true;
    };
    function getGoodsInfo(id) {
      return new Promise((resolve, reject) => {
        common_vendor.index.request({
          url: common_config.websiteUrl.value + "/goods?id=" + id,
          method: "GET",
          timeout: 5e3,
          success: (res) => {
            resolve(res.data);
          },
          fail: (err) => {
            common_vendor.index.__f__("log", "at pages/collocation/collocation.vue:217", err);
            common_vendor.index.showToast({
              title: "网络请求失败",
              icon: "none"
            });
            reject(err);
          }
        });
      });
    }
    function viewFullImage(index) {
      common_vendor.index.previewImage({
        current: uploadList.value[index],
        urls: uploadList.value
      });
    }
    async function selectImage() {
      try {
        const remaining = 9 - uploadList.value.length;
        if (remaining <= 0) {
          common_vendor.index.showToast({
            title: "最多只能上传9张图片",
            icon: "none"
          });
          return;
        }
        const imagePaths = await common_image.chooseImageList(remaining);
        for (const path of imagePaths) {
          const tokenData = await common_image.getQiniuToken();
          await common_image.uploadImageToQiniu(path, tokenData.token, tokenData.path);
          uploadList.value.push(common_config.image1Url + tokenData.path);
        }
        common_vendor.index.showToast({
          title: `成功上传${imagePaths.length}张图片`,
          icon: "success"
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/collocation/collocation.vue:268", "上传出错:", error);
        common_vendor.index.showToast({
          title: "部分图片上传失败",
          icon: "none"
        });
      }
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
      const postData = {
        title: title.value,
        content: content.value,
        image_url_list: uploadList.value,
        relations: saveCollocationDataList.value.map((item) => ({
          relation_goods_id: item.goods_id,
          relation_goods_name: item.goods_name,
          relation_brand_id: item.brand_id,
          relation_brand_name: item.brand_name,
          type: item.type,
          relation_origin: 1
          // 标识关联的是collocation
        }))
      };
      if (isEdit.value) {
        postData.collocation_id = parseInt(props.collocation_id);
      }
      try {
        const url = isEdit.value ? common_config.websiteUrl.value + "/with-state/update-collocation" : common_config.websiteUrl.value + "/with-state/add-collocation";
        const res = await common_vendor.index.request({
          url,
          method: "POST",
          data: postData,
          header: {
            "Content-Type": "application/json",
            "Authorization": token
          },
          timeout: 8e3
        });
        if (res.data.status === "success") {
          common_vendor.index.showToast({
            title: isEdit.value ? "更新成功" : "提交成功"
          });
          setTimeout(() => common_vendor.index.navigateBack(), 1500);
        } else {
          common_vendor.index.showToast({
            title: res[1].data.msg || (isEdit.value ? "更新失败" : "提交失败"),
            icon: "none"
          });
        }
      } catch (err) {
        common_vendor.index.__f__("log", "at pages/collocation/collocation.vue:351", err);
        common_vendor.index.showToast({
          title: "网络请求失败",
          icon: "none"
        });
      }
    }
    function getTypes() {
      common_vendor.index.request({
        url: common_config.websiteUrl.value + "/goods-types",
        method: "GET",
        timeout: 5e3,
        success: (res) => {
          if (res.data && res.data.data) {
            typeList.value = res.data.data;
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/collocation/collocation.vue:371", err);
          common_vendor.index.showToast({
            title: "获取商品类型失败",
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
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(uploadList.value, (item, index, i0) => {
          return {
            a: item,
            b: common_vendor.o(($event) => viewFullImage(index), index),
            c: common_vendor.o(($event) => deleteImage(index), index),
            d: index
          };
        }),
        b: common_assets._imports_1$5,
        c: uploadList.value.length < 9
      }, uploadList.value.length < 9 ? {
        d: common_assets._imports_1$4,
        e: common_vendor.o(selectImage)
      } : {}, {
        f: title.value,
        g: common_vendor.o(($event) => title.value = $event.detail.value),
        h: content.value,
        i: common_vendor.o(($event) => content.value = $event.detail.value),
        j: common_assets._imports_2$2,
        k: common_vendor.o(showRelationPicker),
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
        m: common_assets._imports_1$5,
        n: common_vendor.o(handleRelationConfirm),
        o: common_vendor.o(handleRelationCancel),
        p: common_vendor.o(($event) => showSelectTab.value = $event),
        q: common_vendor.p({
          typeList: typeList.value,
          goodsList: goodsList.value,
          visible: showSelectTab.value
        }),
        r: common_vendor.t(isEdit.value ? "更新" : "提交"),
        s: common_vendor.o(submitForm)
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/collocation/collocation.js.map
