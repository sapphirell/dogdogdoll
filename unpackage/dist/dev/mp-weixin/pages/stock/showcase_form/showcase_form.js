"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const common_config = require("../../../common/config.js");
const common_image = require("../../../common/image.js");
if (!Array) {
  const _easycom_common_name_picker2 = common_vendor.resolveComponent("common-name-picker");
  const _easycom_common_search2 = common_vendor.resolveComponent("common-search");
  const _easycom_custom_picker2 = common_vendor.resolveComponent("custom-picker");
  const _easycom_common_modal2 = common_vendor.resolveComponent("common-modal");
  const _easycom_common_page2 = common_vendor.resolveComponent("common-page");
  (_easycom_common_name_picker2 + _easycom_common_search2 + _easycom_custom_picker2 + _easycom_common_modal2 + _easycom_common_page2)();
}
const _easycom_common_name_picker = () => "../../../components/common-name-picker/common-name-picker.js";
const _easycom_common_search = () => "../../../components/common-search/common-search.js";
const _easycom_custom_picker = () => "../../../components/custom-picker/custom-picker.js";
const _easycom_common_modal = () => "../../../components/common-modal/common-modal.js";
const _easycom_common_page = () => "../../../components/common-page/common-page.js";
if (!Math) {
  (_easycom_common_name_picker + _easycom_common_search + _easycom_custom_picker + _easycom_common_modal + _easycom_common_page)();
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
    const chooseBrandName = common_vendor.ref("");
    const chooseBrandId = common_vendor.ref(0);
    const chooseGoodsName = common_vendor.ref("");
    const chooseGoodsId = common_vendor.ref(0);
    const chooseType = common_vendor.ref("");
    const isEditable = common_vendor.computed(() => [-1, 1, 3].includes(display.value));
    const showDelete = common_vendor.computed(() => !!props.showcase_id);
    const name = common_vendor.ref("");
    const description = common_vendor.ref("");
    const display = common_vendor.ref(-1);
    function getGoodsInfo(id) {
      return new Promise((resolve, reject) => {
        common_vendor.index.request({
          url: common_config.websiteUrl + "/goods?id=" + id,
          method: "GET",
          timeout: 5e3,
          success: (res) => {
            common_vendor.index.__f__("log", "at pages/stock/showcase_form/showcase_form.vue:126", res.data.data);
            resolve(res.data);
          },
          fail: (err) => {
            common_vendor.index.__f__("log", "at pages/stock/showcase_form/showcase_form.vue:130", err);
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
        common_vendor.index.__f__("log", "at pages/stock/showcase_form/showcase_form.vue:167", data);
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
    function selectImage() {
      common_vendor.index.__f__("log", "at pages/stock/showcase_form/showcase_form.vue:196", "openSelect");
      common_image.chooseImage().then((res) => {
        common_image.getQiniuToken().then((tokenData) => {
          common_vendor.index.__f__("log", "at pages/stock/showcase_form/showcase_form.vue:199", tokenData);
          common_image.uploadImageToQiniu(res, tokenData.token, tokenData.path).then((uploadRes) => {
            if (uploadRes.statusCode != 200) {
              common_vendor.index.showToast({
                title: "上传失败",
                icon: "none"
              });
            }
            common_vendor.index.__f__("log", "at pages/stock/showcase_form/showcase_form.vue:208", common_config.image1Url + tokenData.path);
            uploadList.value.push(common_config.image1Url + tokenData.path);
            common_vendor.index.showToast({
              title: "上传成功",
              icon: "success"
            });
          });
        });
      });
    }
    async function handleDelete() {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "确定要删除这个展示吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              const res2 = await common_vendor.index.request({
                url: `${common_config.websiteUrl}/with-state/delete-showcase`,
                method: "DELETE",
                data: {
                  id: props.showcase_id
                },
                header: {
                  "Authorization": common_vendor.index.getStorageSync("token")
                }
              });
              if (res2.data.code === 200) {
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
      let postData = {
        name: name.value,
        description: description.value,
        image_urls: uploadList.value.join(","),
        display: display.value,
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
        const url = `${common_config.websiteUrl}/with-state/update-showcase`;
        if (props.showcase_id) {
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
        common_vendor.index.__f__("log", "at pages/stock/showcase_form/showcase_form.vue:332", err);
        common_vendor.index.showToast({
          title: "提交失败",
          icon: "none"
        });
      }
    }
    function handleBrandSelect(brandId, brandName) {
      common_vendor.index.__f__("log", "at pages/stock/showcase_form/showcase_form.vue:344", "收到品牌ID:", brandId);
      common_vendor.index.__f__("log", "at pages/stock/showcase_form/showcase_form.vue:345", "收到品牌Name:", brandName);
      chooseBrandId.value = parseInt(brandId, 10);
      chooseBrandName.value = brandName;
      getGoods(brandId);
    }
    function handleGoodsSelect(id, name2) {
      common_vendor.index.__f__("log", "at pages/stock/showcase_form/showcase_form.vue:354", "选中的 id:", id);
      common_vendor.index.__f__("log", "at pages/stock/showcase_form/showcase_form.vue:355", "选中的 name:", name2);
      chooseGoodsId.value = parseInt(id, 10);
      chooseGoodsName.value = name2;
    }
    function handleTypeSelect(value) {
      common_vendor.index.__f__("log", "at pages/stock/showcase_form/showcase_form.vue:362", "选中的值:", value);
      chooseType.value = value;
      showSelectTab.value = true;
    }
    function getGoods(id) {
      common_vendor.index.request({
        url: common_config.websiteUrl + "/goods-name-list?id=" + id,
        method: "GET",
        timeout: 5e3,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/stock/showcase_form/showcase_form.vue:375", res.data.data);
          goodsList.value = res.data.data;
          common_vendor.index.__f__("log", "at pages/stock/showcase_form/showcase_form.vue:377", goodsList.value);
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/stock/showcase_form/showcase_form.vue:381", err);
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
          common_vendor.index.__f__("log", "at pages/stock/showcase_form/showcase_form.vue:400", res.data.data);
          typeList.value = res.data.data;
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/stock/showcase_form/showcase_form.vue:404", err);
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
      getGoodsInfo(chooseBrandId.value).then((res) => {
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
        n: common_vendor.o(handleTypeSelect),
        o: common_vendor.p({
          dataList: typeList.value,
          placeholder: "关联娃物"
        }),
        p: common_assets._imports_2$2
      } : {}, {
        q: common_vendor.f(saveCollocationDataList.value, (item, index, i0) => {
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
        r: isEditable.value,
        s: common_vendor.o(handleBrandSelect),
        t: common_vendor.p({
          mode: "fill",
          width: "calc(100vw - 120px)"
        }),
        v: common_vendor.o(handleGoodsSelect),
        w: common_vendor.p({
          dataList: goodsList.value,
          margin: "10px 0 0 8px"
        }),
        x: common_vendor.o(saveCollocation),
        y: common_vendor.o(($event) => showSelectTab.value = $event),
        z: common_vendor.p({
          visible: showSelectTab.value
        }),
        A: showDelete.value
      }, showDelete.value ? {
        B: common_vendor.o(handleDelete)
      } : {}, {
        C: common_vendor.o(submitForm)
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/stock/showcase_form/showcase_form.js.map
