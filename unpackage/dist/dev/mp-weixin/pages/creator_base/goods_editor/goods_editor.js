"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_config = require("../../../common/config.js");
const common_image = require("../../../common/image.js");
if (!Array) {
  const _easycom_cascade_multi_select2 = common_vendor.resolveComponent("cascade-multi-select");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_shmily_drag_image2 = common_vendor.resolveComponent("shmily-drag-image");
  (_easycom_cascade_multi_select2 + _easycom_uni_icons2 + _easycom_shmily_drag_image2)();
}
const _easycom_cascade_multi_select = () => "../../../components/cascade-multi-select/cascade-multi-select.js";
const _easycom_uni_icons = () => "../../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_shmily_drag_image = () => "../../../components/shmily-drag-image/shmily-drag-image.js";
if (!Math) {
  (_easycom_cascade_multi_select + _easycom_uni_icons + _easycom_shmily_drag_image)();
}
const _sfc_main = {
  __name: "goods_editor",
  props: {
    goods_id: {
      type: String
    }
  },
  setup(__props) {
    const props = __props;
    const showDelete = common_vendor.ref(true);
    const goodsInfo = common_vendor.ref({
      id: 0,
      name: "",
      brand_id: 0,
      brand_name: "",
      total_amount: 0,
      currency: "CNY",
      size: "",
      size_detail: "",
      skin: "",
      type: "",
      desc_content: "",
      doll_material: "",
      goods_images: []
    });
    const sizeData = common_vendor.ref([]);
    const sizeOptions = common_vendor.ref([]);
    common_vendor.ref([]);
    const showSizeSelector = common_vendor.ref(false);
    const sizeSelector = common_vendor.ref(null);
    const typeOptions = common_vendor.ref([]);
    const typeIndex = common_vendor.ref(-1);
    const currencyOptions = common_vendor.ref([]);
    const currencyIndex = common_vendor.ref(-1);
    const currencyMap = common_vendor.ref({});
    const materialOptions = common_vendor.ref([]);
    const materialIndex = common_vendor.ref(-1);
    const skinQuickOptions = common_vendor.ref(["白肌", "浅烧", "牡丹白", "奶油", "半白", "粉白", "普肌", "粉普", "烧肌"]);
    const showSkinQuickSelector = common_vendor.computed(() => {
      return ["整体", "单体", "单头"].includes(goodsInfo.value.type);
    });
    const initialSizeSelection = common_vendor.ref([]);
    const selectedSizeDisplay = common_vendor.computed(() => {
      common_vendor.index.__f__("log", "at pages/creator_base/goods_editor/goods_editor.vue:198", "goods:", goodsInfo.value.sizes);
      if (!goodsInfo.value.sizes || !Array.isArray(goodsInfo.value.sizes)) {
        return [];
      }
      return goodsInfo.value.sizes.map((item) => {
        return `${item.goods_size}/${item.size_detail}`;
      });
    });
    const openSizeSelector = () => {
      initialSizeSelection.value = goodsInfo.value.sizes.map((item) => ({
        category: item.goods_size,
        size: item.size_detail
      }));
      showSizeSelector.value = true;
    };
    const handleSizeSelection = (sizes) => {
      goodsInfo.value.sizes = sizes.map((item) => ({
        goods_size: item.category,
        size_detail: item.size
      }));
    };
    const fetchGoodsInfo = async () => {
      try {
        common_vendor.index.showLoading({
          title: "加载中..."
        });
        const token = common_vendor.index.getStorageSync("token");
        if (!token) {
          error.value = "未登录，请先登录";
          loading.value = false;
          loadStatus.value = "more";
          return;
        }
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl.value}/brand-manager/get-goods-info-by-id`,
          method: "GET",
          data: {
            id: props.goods_id
          },
          header: {
            Authorization: token
          }
        });
        if (res.data.status === "success") {
          const data = res.data.data;
          goodsInfo.value = {
            ...data,
            // 确保 sizes 数组存在
            sizes: data.sizes || [],
            goods_images: data.goods_images.map((img) => ({
              id: img.id,
              src: img.url,
              name: "",
              price: "",
              type: ""
            }))
          };
          typeIndex.value = typeOptions.value.indexOf(goodsInfo.value.type);
          currencyIndex.value = currencyOptions.value.findIndex(
            (item) => item === goodsInfo.value.currency
          );
          materialIndex.value = materialOptions.value.indexOf(
            goodsInfo.value.doll_material
          );
        } else {
          common_vendor.index.showToast({
            title: res.data.msg,
            icon: "none"
          });
        }
      } catch (error2) {
        common_vendor.index.__f__("error", "at pages/creator_base/goods_editor/goods_editor.vue:288", "获取商品信息失败", error2);
        common_vendor.index.showToast({
          title: "获取商品信息失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const fetchSizes = async () => {
      try {
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl.value}/sizes`,
          method: "GET"
        });
        if (res.data.status === "success") {
          sizeData.value = res.data.data;
          const formattedSizes = [];
          for (const [category, items] of Object.entries(sizeData.value)) {
            formattedSizes.push({
              text: category,
              value: category,
              children: items.map((item) => ({
                text: item,
                value: item
              }))
            });
          }
          sizeOptions.value = formattedSizes;
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/creator_base/goods_editor/goods_editor.vue:325", "获取尺寸数据失败:", err);
        common_vendor.index.showToast({
          title: "获取尺寸数据失败",
          icon: "none"
        });
      }
    };
    const fetchTypes = async () => {
      try {
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl.value}/goods-types`,
          method: "GET"
        });
        if (res.data.status === "success") {
          typeOptions.value = res.data.data;
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/creator_base/goods_editor/goods_editor.vue:345", "获取类型数据失败:", err);
        common_vendor.index.showToast({
          title: "获取类型数据失败",
          icon: "none"
        });
      }
    };
    const fetchCurrencies = async () => {
      try {
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl.value}/currency`,
          method: "GET"
        });
        if (res.data.status === "success") {
          currencyMap.value = res.data.data;
          currencyOptions.value = Object.keys(res.data.data);
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/creator_base/goods_editor/goods_editor.vue:366", "获取货币数据失败:", err);
        common_vendor.index.showToast({
          title: "获取货币数据失败",
          icon: "none"
        });
      }
    };
    const fetchMaterials = async () => {
      try {
        let url = `${common_config.websiteUrl.value}/materials`;
        if (goodsInfo.value.type === "假发") {
          url = `${common_config.websiteUrl.value}/hair-materials`;
        }
        const res = await common_vendor.index.request({
          url,
          method: "GET"
        });
        if (res.data.status === "success") {
          materialOptions.value = res.data.data;
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/creator_base/goods_editor/goods_editor.vue:391", "获取材质数据失败:", err);
        common_vendor.index.showToast({
          title: "获取材质数据失败",
          icon: "none"
        });
      }
    };
    const updateType = (e) => {
      const index = e.detail.value;
      typeIndex.value = index;
      goodsInfo.value.type = typeOptions.value[index];
      fetchMaterials();
    };
    const updateCurrency = (e) => {
      const index = e.detail.value;
      currencyIndex.value = index;
      goodsInfo.value.currency = currencyOptions.value[index];
    };
    const updateMaterial = (e) => {
      const index = e.detail.value;
      materialIndex.value = index;
      goodsInfo.value.doll_material = materialOptions.value[index];
    };
    const addSkin = (skin) => {
      if (goodsInfo.value.skin) {
        goodsInfo.value.skin += ` ${skin}`;
      } else {
        goodsInfo.value.skin = skin;
      }
    };
    const handleImageSortChange = (sortedIds) => {
      const sortedImages = [];
      sortedIds.forEach((id) => {
        const image = goodsInfo.value.goods_images.find((img) => img.id === id);
        if (image)
          sortedImages.push(image);
      });
      goodsInfo.value.goods_images = sortedImages;
    };
    const saveGoods = async () => {
      try {
        common_vendor.index.showLoading({
          title: "保存中..."
        });
        const submitData = {
          ...goodsInfo.value,
          // 转换图片格式为后端需要的格式
          goods_images: goodsInfo.value.goods_images.map((img) => ({
            id: img.id,
            url: img.src
          })),
          // 尺寸数据已经是后端需要的格式
          sizes: goodsInfo.value.sizes
        };
        const token = common_vendor.index.getStorageSync("token");
        if (!token) {
          error.value = "未登录，请先登录";
          loading.value = false;
          loadStatus.value = "more";
          return;
        }
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl.value}/brand-manager/update-goods`,
          method: "POST",
          data: submitData,
          header: {
            Authorization: token
          }
        });
        if (res.data.status === "success") {
          common_vendor.index.showToast({
            title: "保存成功"
          });
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1500);
        } else {
          common_vendor.index.showToast({
            title: res.data.msg,
            icon: "none"
          });
        }
      } catch (error2) {
        common_vendor.index.__f__("error", "at pages/creator_base/goods_editor/goods_editor.vue:508", "保存失败", error2);
        common_vendor.index.showToast({
          title: "保存失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const addImages = async () => {
      try {
        const remaining = 9 - goodsInfo.value.goods_images.length;
        if (remaining <= 0) {
          common_vendor.index.showToast({
            title: "最多只能添加9张图片",
            icon: "none"
          });
          return;
        }
        const tempFilePaths = await common_image.chooseImageList(remaining);
        common_vendor.index.showLoading({
          title: "上传中...",
          mask: true
        });
        for (let i = 0; i < tempFilePaths.length; i++) {
          try {
            common_vendor.index.showLoading({
              title: `上传中 (${i + 1}/${tempFilePaths.length})`,
              mask: true
            });
            const qiniuTokenData = await common_image.getQiniuToken();
            if (!qiniuTokenData || !qiniuTokenData.path || !qiniuTokenData.token) {
              throw new Error("获取上传凭证失败: 缺少必要字段");
            }
            const fileName = qiniuTokenData.path;
            const result = await common_image.uploadImageToQiniu(
              tempFilePaths[i],
              qiniuTokenData.token,
              fileName
            );
            if (result && result.imageUrl) {
              goodsInfo.value.goods_images.push({
                id: Date.now() + i,
                // 临时ID
                src: result.imageUrl,
                name: "",
                price: "",
                type: ""
              });
            }
          } catch (error2) {
            common_vendor.index.__f__("error", "at pages/creator_base/goods_editor/goods_editor.vue:578", `第 ${i + 1} 张图片上传失败:`, error2);
            common_vendor.index.showToast({
              title: `第 ${i + 1} 张图片上传失败: ${error2.message || error2}`,
              icon: "none",
              duration: 3e3
            });
          }
        }
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: `成功添加${tempFilePaths.length}张图片`,
          icon: "success"
        });
      } catch (error2) {
        common_vendor.index.__f__("error", "at pages/creator_base/goods_editor/goods_editor.vue:593", "添加图片失败", error2);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: `添加图片失败: ${error2.message || error2}`,
          icon: "none",
          duration: 3e3
        });
      }
    };
    const handleDeleteImage = (imageId) => {
      common_vendor.index.showModal({
        title: "删除确认",
        content: "确定要删除这张图片吗？",
        confirmText: "删除",
        confirmColor: "#ff3b30",
        success: (res) => {
          if (res.confirm) {
            goodsInfo.value.goods_images = goodsInfo.value.goods_images.filter(
              (img) => img.id !== imageId
            );
            common_vendor.index.showToast({
              title: "图片已删除",
              icon: "success"
            });
          }
        }
      });
    };
    common_vendor.onMounted(async () => {
      common_vendor.index.setNavigationBarTitle({
        title: "编辑商品信息"
      });
      await fetchSizes();
      await fetchTypes();
      await fetchCurrencies();
      await fetchGoodsInfo();
      await fetchMaterials();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: goodsInfo.value.name,
        b: common_vendor.o(($event) => goodsInfo.value.name = $event.detail.value),
        c: goodsInfo.value.brand_name,
        d: common_vendor.o(($event) => goodsInfo.value.brand_name = $event.detail.value),
        e: goodsInfo.value.total_amount,
        f: common_vendor.o(($event) => goodsInfo.value.total_amount = $event.detail.value),
        g: common_vendor.t(goodsInfo.value.currency),
        h: common_vendor.o(updateCurrency),
        i: currencyIndex.value,
        j: currencyOptions.value,
        k: selectedSizeDisplay.value.length === 0
      }, selectedSizeDisplay.value.length === 0 ? {} : {
        l: common_vendor.f(selectedSizeDisplay.value, (size, index, i0) => {
          return {
            a: common_vendor.t(size),
            b: index
          };
        })
      }, {
        m: common_vendor.o(openSizeSelector),
        n: common_vendor.sr(sizeSelector, "b2f6a6c9-0", {
          "k": "sizeSelector"
        }),
        o: common_vendor.o(($event) => showSizeSelector.value = false),
        p: common_vendor.o(handleSizeSelection),
        q: common_vendor.p({
          show: showSizeSelector.value,
          sizeData: sizeData.value,
          initialSelection: initialSizeSelection.value
        }),
        r: goodsInfo.value.skin,
        s: common_vendor.o(($event) => goodsInfo.value.skin = $event.detail.value),
        t: showSkinQuickSelector.value
      }, showSkinQuickSelector.value ? {
        v: common_vendor.f(skinQuickOptions.value, (skin, index, i0) => {
          return {
            a: common_vendor.t(skin),
            b: index,
            c: common_vendor.o(($event) => addSkin(skin), index)
          };
        })
      } : {}, {
        w: common_vendor.t(goodsInfo.value.type || "请选择类型"),
        x: common_vendor.o(updateType),
        y: typeIndex.value,
        z: typeOptions.value,
        A: common_vendor.t(goodsInfo.value.doll_material || "请选择材质"),
        B: common_vendor.o(updateMaterial),
        C: materialIndex.value,
        D: materialOptions.value,
        E: goodsInfo.value.short_link,
        F: common_vendor.o(($event) => goodsInfo.value.short_link = $event.detail.value),
        G: goodsInfo.value.desc_content,
        H: common_vendor.o(($event) => goodsInfo.value.desc_content = $event.detail.value),
        I: common_vendor.t(showDelete.value ? "，点击图片右上角可删除。" : ""),
        J: goodsInfo.value.goods_images.length < 9
      }, goodsInfo.value.goods_images.length < 9 ? {
        K: common_vendor.p({
          type: "plusempty",
          size: "30",
          color: "#999"
        }),
        L: common_vendor.o(addImages)
      } : {}, {
        M: common_vendor.o(handleImageSortChange),
        N: common_vendor.o(handleDeleteImage),
        O: common_vendor.o(($event) => goodsInfo.value.goods_images = $event),
        P: common_vendor.p({
          cols: 3,
          showItemInfo: false,
          itemMargin: 10,
          showDelete: true,
          ["border-radius"]: "0",
          keyName: "src",
          modelValue: goodsInfo.value.goods_images
        }),
        Q: common_vendor.o(saveGoods)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-b2f6a6c9"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/creator_base/goods_editor/goods_editor.js.map
