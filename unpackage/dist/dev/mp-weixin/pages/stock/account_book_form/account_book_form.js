"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const common_config = require("../../../common/config.js");
const common_image = require("../../../common/image.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_common_modal2 = common_vendor.resolveComponent("common-modal");
  const _easycom_goods_search2 = common_vendor.resolveComponent("goods-search");
  const _easycom_uni_data_picker2 = common_vendor.resolveComponent("uni-data-picker");
  (_easycom_uni_icons2 + _easycom_common_modal2 + _easycom_goods_search2 + _easycom_uni_data_picker2)();
}
const _easycom_uni_icons = () => "../../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_common_modal = () => "../../../components/common-modal/common-modal.js";
const _easycom_goods_search = () => "../../../components/goods-search/goods-search.js";
const _easycom_uni_data_picker = () => "../../../uni_modules/uni-data-picker/components/uni-data-picker/uni-data-picker.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_common_modal + _easycom_goods_search + _easycom_uni_data_picker)();
}
const _sfc_main = {
  __name: "account_book_form",
  props: ["account_book_id"],
  setup(__props) {
    const props = __props;
    const isEdit = props.account_book_id ? true : false;
    const count = common_vendor.ref(1);
    const imageList = common_vendor.ref([]);
    const systemInfo = common_vendor.index.getSystemInfoSync();
    common_vendor.ref(systemInfo.statusBarHeight);
    let name = common_vendor.ref("");
    let price = common_vendor.ref("");
    common_vendor.ref(1);
    const typeModalVisible = common_vendor.ref(false);
    const newTypeName = common_vendor.ref("");
    const customTypes = common_vendor.ref([]);
    const defaultTypes = ["请选择", "娃衣", "娃头", "眼珠", "假发", "娃鞋", "其它"];
    const typeOptions = common_vendor.computed(() => [
      ...defaultTypes,
      ...customTypes.value.map((t) => t.name)
    ]);
    const form = common_vendor.ref({
      isRemind: false,
      finalPrice: 0,
      finalTime: ""
    });
    const showMoreInfo = common_vendor.ref(false);
    const sizeOptions = common_vendor.ref([]);
    common_vendor.ref([]);
    const selectedSizePath = common_vendor.ref([]);
    const moreInfo = common_vendor.ref({
      sizeDetail: "",
      color: "",
      remark: "",
      buyDate: "",
      position: ""
    });
    const fetchSizes = async () => {
      try {
        const res = await common_vendor.index.request({
          url: common_config.websiteUrl + "/sizes",
          method: "GET"
        });
        if (res.data.status === "success") {
          const sizesData = res.data.data;
          const formattedSizes = [];
          for (const [category, items] of Object.entries(sizesData)) {
            formattedSizes.push({
              text: category,
              // 大分类名称 (如"二分")
              value: category,
              // 大分类值
              children: items.map((item) => ({
                text: item,
                // 小分类名称 (如"普通二分")
                value: item
                // 小分类值
              }))
            });
          }
          sizeOptions.value = formattedSizes;
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/stock/account_book_form/account_book_form.vue:302", "获取尺寸数据失败:", err);
        common_vendor.index.showToast({
          title: "获取尺寸数据失败",
          icon: "none"
        });
      }
    };
    const onSizeChange = (e) => {
      const nodes = e.detail.value;
      if (nodes.length === 2) {
        selectedSizePath.value = [
          nodes[0].value,
          // 大分类值
          nodes[1].value
          // 小分类值
        ];
        moreInfo.value.sizeDetail = nodes[1].value;
      } else {
        selectedSizePath.value = [];
        moreInfo.value.sizeDetail = "";
      }
    };
    const toggleMoreInfo = () => {
      showMoreInfo.value = !showMoreInfo.value;
    };
    const getAccountTypes = async () => {
      const token = common_vendor.index.getStorageSync("token");
      try {
        const res = await common_vendor.index.request({
          url: common_config.websiteUrl + "/with-state/account-types",
          method: "GET",
          header: {
            "Authorization": token
          }
        });
        customTypes.value = res.data.data || [];
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/stock/account_book_form/account_book_form.vue:347", "获取分类失败:", err);
      }
    };
    const addNewType = async () => {
      if (!newTypeName.value.trim()) {
        common_vendor.index.showToast({
          title: "请输入分类名称",
          icon: "none"
        });
        return;
      }
      const token = common_vendor.index.getStorageSync("token");
      try {
        await common_vendor.index.request({
          url: common_config.websiteUrl + "/with-state/add-account-type",
          method: "POST",
          header: {
            "Authorization": token
          },
          data: {
            name: newTypeName.value.trim()
          }
        });
        await getAccountTypes();
        newTypeName.value = "";
        common_vendor.index.showToast({
          title: "添加成功"
        });
      } catch (err) {
        common_vendor.index.showToast({
          title: "添加失败",
          icon: "none"
        });
      }
    };
    const deleteType = async (id) => {
      common_vendor.index.showModal({
        title: "确认删除",
        // content: '如果该分类下存在物品，则不可以直接删除分类',
        success: async (res) => {
          if (res.confirm) {
            const token = common_vendor.index.getStorageSync("token");
            try {
              const response = await common_vendor.index.request({
                url: common_config.websiteUrl + "/with-state/delete-account-type",
                method: "POST",
                header: {
                  "Authorization": token,
                  "Content-Type": "application/json"
                  // 添加Content-Type
                },
                data: {
                  id
                }
                // 使用JSON格式传参
              });
              const resData = response.data;
              if (resData.status === "success") {
                await getAccountTypes();
                common_vendor.index.showToast({
                  title: "删除成功"
                });
              } else {
                common_vendor.index.showToast({
                  title: resData.msg || "删除失败",
                  icon: "none"
                });
              }
            } catch (err) {
              common_vendor.index.__f__("error", "at pages/stock/account_book_form/account_book_form.vue:421", "删除失败:", err);
              common_vendor.index.showToast({
                title: err.errMsg || "请求失败",
                icon: "none"
              });
            }
          }
        }
      });
    };
    const toggleRemind = () => {
      form.value.isRemind = !form.value.isRemind;
      if (!form.value.isRemind) {
        form.value.finalPrice = 0;
        form.value.finalTime = "";
      }
    };
    const selectedType = common_vendor.ref(0);
    common_vendor.ref(["请选择", "娃衣", "娃头", "眼珠", "假发", "娃鞋", "其它"]);
    common_vendor.ref({});
    function updateSelectedType(e) {
      selectedType.value = e.detail.value;
    }
    function getAccountBookById(id) {
      let token = common_vendor.index.getStorageSync("token");
      common_vendor.index.request({
        url: common_config.websiteUrl + "/with-state/account-book-detail",
        method: "GET",
        header: {
          "Authorization": token
        },
        data: {
          id
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/stock/account_book_form/account_book_form.vue:469", res.data.data);
          name.value = res.data.data.name;
          price.value = parseInt(res.data.data.price);
          count.value = res.data.data.count || 1;
          selectedType.value = typeOptions.value.indexOf(res.data.data.type);
          if (res.data.data.image_url) {
            imageList.value = res.data.data.image_url.split(",");
          }
          form.value = {
            isRemind: res.data.data.is_remind,
            finalPrice: res.data.data.final_price,
            finalTime: res.data.data.final_time
          };
          moreInfo.value = {
            sizeDetail: res.data.data.size_detail || "",
            color: res.data.data.color || "",
            remark: res.data.data.remark || "",
            buyDate: res.data.data.buy_date ? new Date(res.data.data.buy_date).toISOString().split(
              "T"
            )[0] : "",
            position: res.data.data.position || ""
          };
          if (res.data.data.size) {
            selectedSizePath.value = [
              res.data.data.size,
              res.data.data.size_detail || ""
            ];
          }
          common_vendor.index.__f__("log", "at pages/stock/account_book_form/account_book_form.vue:502", "f:", form);
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/stock/account_book_form/account_book_form.vue:505", err);
        }
      });
    }
    const handleGoodsSelect = async (goods) => {
      var _a;
      try {
        const res = await common_vendor.index.request({
          url: common_config.websiteUrl + `/goods?id=${goods.id}`,
          method: "GET"
        });
        if (res.data.status === "success") {
          const detail = res.data.data;
          name.value = detail.name;
          price.value = detail.fin_amount + detail.sub_amount;
          count.value = 1;
          if ((_a = detail.goods_images) == null ? void 0 : _a[0]) {
            imageList.value = [detail.goods_images[0]];
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/stock/account_book_form/account_book_form.vue:533", "获取商品详情失败:", error);
        common_vendor.index.showToast({
          title: "获取商品信息失败",
          icon: "none"
        });
      }
    };
    function handleDelete() {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定删除该账本吗？",
        success: (res) => {
          if (res.confirm) {
            const id = Number(props.account_book_id);
            if (isNaN(id) || id <= 0) {
              common_vendor.index.showToast({
                title: "参数错误",
                icon: "none"
              });
              return;
            }
            common_vendor.index.request({
              url: common_config.websiteUrl + "/with-state/delete-account-book",
              method: "POST",
              header: {
                "Authorization": common_vendor.index.getStorageSync("token"),
                "Content-Type": "application/json"
                // 添加Content-Type
              },
              data: {
                id
              },
              // 改为JSON格式传参
              success: (res2) => {
                common_vendor.index.__f__("log", "at pages/stock/account_book_form/account_book_form.vue:571", res2.data.status);
                if (res2.data.status === "success") {
                  common_vendor.index.showToast({
                    title: "删除成功",
                    icon: "success"
                  });
                  setTimeout(() => common_vendor.index.navigateBack(), 500);
                } else {
                  common_vendor.index.showToast({
                    title: res2.data.msg || "删除失败",
                    icon: "none"
                  });
                }
              },
              fail: (err) => {
                common_vendor.index.__f__("error", "at pages/stock/account_book_form/account_book_form.vue:586", "请求失败:", err);
                common_vendor.index.showToast({
                  title: "网络错误",
                  icon: "none"
                });
              }
            });
          }
        }
      });
    }
    async function selectImage() {
      common_vendor.index.chooseImage({
        count: 9,
        success: async (res) => {
          const tempFilePaths = res.tempFilePaths;
          for (const filePath of tempFilePaths) {
            try {
              const tokenData = await common_image.getQiniuToken();
              const uploadRes = await common_image.uploadImageToQiniu(filePath, tokenData.token, tokenData.path);
              common_vendor.index.__f__("log", "at pages/stock/account_book_form/account_book_form.vue:612", "res:", uploadRes);
              if (uploadRes.qiniuRes.statusCode === 200) {
                const imageUrl = common_config.image1Url + tokenData.path;
                imageList.value.push(imageUrl);
              } else {
                common_vendor.index.__f__("error", "at pages/stock/account_book_form/account_book_form.vue:617", "上传失败:", filePath);
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/stock/account_book_form/account_book_form.vue:620", "上传错误:", error);
            }
          }
          common_vendor.index.showToast({
            title: `上传了${tempFilePaths.length}张图片`,
            icon: "success"
          });
        }
      });
    }
    function removeImage(index, event) {
      if (event && event.stopPropagation) {
        event.stopPropagation();
      }
      common_vendor.index.showModal({
        title: "删除图片",
        content: "确定删除这张图片吗？",
        success: (res) => {
          if (res.confirm) {
            imageList.value.splice(index, 1);
          }
        }
      });
    }
    common_config.asyncGetUserInfo().then((userInfo) => {
      if (isEdit) {
        getAccountBookById(props.account_book_id);
        common_vendor.index.setNavigationBarTitle({
          title: "编辑账本"
        });
      } else {
        common_vendor.index.setNavigationBarTitle({
          title: "新增账本"
        });
      }
    });
    function postSubmit() {
      if (!validateForm())
        return;
      if (isEdit) {
        updateAccountBook();
      } else {
        addAccountBook();
      }
    }
    const validateForm = () => {
      if (count.value <= 0) {
        common_vendor.index.showToast({
          title: "个数必须大于0",
          icon: "none"
        });
        return false;
      }
      if (form.value.isRemind) {
        if (!form.value.finalPrice || form.value.finalPrice <= 0) {
          common_vendor.index.showToast({
            title: "请输入正确的尾款金额",
            icon: "none"
          });
          return false;
        }
      }
      return true;
    };
    function addAccountBook() {
      let postData = {
        name: name.value,
        price: parseInt(price.value, 10),
        count: parseInt(count.value, 10),
        // 新增：个数
        type: typeOptions.value[selectedType.value],
        // 使用合并后的分类列表
        image_url: imageList.value.join(","),
        // 修改：图片数组转逗号分隔字符串
        is_remind: form.value.isRemind,
        final_price: parseInt(form.value.finalPrice, 10),
        final_time: form.value.finalTime,
        // 新增更多信息字段
        size: selectedSizePath.value[0] || "",
        // 大分类
        size_detail: moreInfo.value.sizeDetail || "",
        // 小分类/尺寸详情
        color: moreInfo.value.color,
        remark: moreInfo.value.remark,
        buy_date: moreInfo.value.buyDate,
        position: moreInfo.value.position
      };
      common_vendor.index.__f__("log", "at pages/stock/account_book_form/account_book_form.vue:724", "提交数据:", postData);
      common_vendor.index.request({
        url: common_config.websiteUrl + "/with-state/add-account-book",
        method: "POST",
        header: {
          "Authorization": common_vendor.index.getStorageSync("token")
        },
        data: postData,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/stock/account_book_form/account_book_form.vue:734", res.data);
          if (res.data.status == "success") {
            common_vendor.index.showToast({
              title: "提交成功",
              icon: "success"
            });
            setTimeout(() => {
              common_vendor.index.navigateBack();
            }, 500);
          } else {
            common_vendor.index.showToast({
              title: res.data.msg,
              icon: "none"
            });
          }
        }
      });
    }
    function updateAccountBook() {
      let postData = {
        name: name.value,
        price: parseInt(price.value, 10),
        count: parseInt(count.value, 10),
        // 新增：个数
        type: typeOptions.value[selectedType.value],
        // 使用合并后的分类列表
        image_url: imageList.value.join(","),
        // 修改：图片数组转逗号分隔字符串
        id: parseInt(props.account_book_id, 10),
        is_remind: form.value.isRemind,
        // 转换为数据库需要的格式
        final_price: parseInt(form.value.finalPrice, 10),
        final_time: form.value.finalTime,
        // 新增更多信息字段
        size: selectedSizePath.value[0] || "",
        // 大分类
        size_detail: moreInfo.value.sizeDetail || "",
        // 小分类/尺寸详情
        color: moreInfo.value.color,
        remark: moreInfo.value.remark,
        buy_date: moreInfo.value.buyDate,
        position: moreInfo.value.position
      };
      common_vendor.index.request({
        url: common_config.websiteUrl + "/with-state/update-account-book",
        method: "POST",
        header: {
          "Authorization": common_vendor.index.getStorageSync("token")
        },
        data: postData,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/stock/account_book_form/account_book_form.vue:783", res.data);
          if (res.data.status == "success") {
            common_vendor.index.showToast({
              title: "提交成功",
              icon: "success"
            });
            setTimeout(() => {
              common_vendor.index.navigateBack();
            }, 500);
          } else {
            common_vendor.index.showToast({
              title: res.data.msg,
              icon: "none"
            });
          }
        }
      });
    }
    function viewFullImage(index) {
      common_vendor.index.previewImage({
        current: imageList.value["index"],
        urls: imageList.value
      });
    }
    common_vendor.onShow(() => {
      common_config.asyncGetUserInfo().then(() => {
        getAccountTypes();
        fetchSizes();
      });
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: newTypeName.value,
        b: common_vendor.o(($event) => newTypeName.value = $event.detail.value),
        c: common_vendor.o(addNewType),
        d: common_vendor.f(customTypes.value, (type, index, i0) => {
          return {
            a: common_vendor.t(type.name),
            b: common_vendor.o(($event) => deleteType(type.id), type.id),
            c: "0299c5b6-1-" + i0 + ",0299c5b6-0",
            d: type.id
          };
        }),
        e: common_vendor.p({
          type: "trash",
          size: "22",
          color: "#ff6666"
        }),
        f: common_vendor.o((val) => typeModalVisible.value = val),
        g: common_vendor.p({
          visible: typeModalVisible.value,
          top: "100rpx",
          height: "60%"
        }),
        h: common_vendor.t(typeOptions.value[selectedType.value] || "请选择分类"),
        i: selectedType.value,
        j: typeOptions.value,
        k: common_vendor.o(updateSelectedType),
        l: common_vendor.o(($event) => typeModalVisible.value = true),
        m: common_vendor.o(handleGoodsSelect),
        n: common_vendor.o(($event) => common_vendor.isRef(name) ? name.value = $event : name = $event),
        o: common_vendor.p({
          ["font-size"]: "24rpx",
          mode: "fill",
          background: "#fff",
          width: "640rpx",
          ["show-icon"]: false,
          modelValue: common_vendor.unref(name)
        }),
        p: common_vendor.unref(price),
        q: common_vendor.o(($event) => common_vendor.isRef(price) ? price.value = $event.detail.value : price = $event.detail.value),
        r: count.value,
        s: common_vendor.o(($event) => count.value = $event.detail.value),
        t: common_vendor.f(imageList.value, (img, index, i0) => {
          return {
            a: img,
            b: common_vendor.o(($event) => viewFullImage(), index),
            c: common_vendor.o((e) => removeImage(index, e), index),
            d: "0299c5b6-3-" + i0,
            e: index
          };
        }),
        v: common_vendor.p({
          type: "close",
          size: "22",
          color: "#fff"
        }),
        w: common_vendor.p({
          type: "plusempty",
          size: "40",
          color: "#ccc"
        }),
        x: common_vendor.o(selectImage),
        y: common_vendor.o(onSizeChange),
        z: common_vendor.p({
          placeholder: "请选择尺寸",
          localdata: sizeOptions.value,
          value: selectedSizePath.value
        }),
        A: !showMoreInfo.value
      }, !showMoreInfo.value ? {
        B: common_vendor.p({
          type: "right",
          size: "20",
          color: "#888"
        })
      } : {
        C: common_vendor.p({
          type: "down",
          size: "20",
          color: "#888"
        })
      }, {
        D: common_vendor.o(($event) => toggleMoreInfo()),
        E: showMoreInfo.value
      }, showMoreInfo.value ? {
        F: moreInfo.value.sizeDetail,
        G: common_vendor.o(($event) => moreInfo.value.sizeDetail = $event.detail.value),
        H: moreInfo.value.color,
        I: common_vendor.o(($event) => moreInfo.value.color = $event.detail.value),
        J: moreInfo.value.remark,
        K: common_vendor.o(($event) => moreInfo.value.remark = $event.detail.value),
        L: common_vendor.t(moreInfo.value.buyDate || "选择购入日期"),
        M: moreInfo.value.buyDate,
        N: common_vendor.o((e) => moreInfo.value.buyDate = e.detail.value),
        O: moreInfo.value.position,
        P: common_vendor.o(($event) => moreInfo.value.position = $event.detail.value)
      } : {}, {
        Q: !form.value.isRemind
      }, !form.value.isRemind ? {
        R: common_vendor.p({
          type: "right",
          size: "20",
          color: "#888"
        })
      } : {
        S: common_vendor.p({
          type: "down",
          size: "20",
          color: "#888"
        })
      }, {
        T: form.value.finalPrice > 0
      }, form.value.finalPrice > 0 ? {} : {}, {
        U: common_vendor.o(($event) => toggleRemind()),
        V: form.value.isRemind
      }, form.value.isRemind ? {
        W: form.value.finalPrice,
        X: common_vendor.o(($event) => form.value.finalPrice = $event.detail.value),
        Y: common_vendor.t(form.value.finalTime || "选择截止日期"),
        Z: form.value.finalTime,
        aa: common_vendor.o(($event) => form.value.finalTime = $event.detail.value)
      } : {}, {
        ab: common_assets._imports_0$7,
        ac: common_vendor.unref(isEdit)
      }, common_vendor.unref(isEdit) ? {
        ad: common_vendor.o(handleDelete)
      } : {}, {
        ae: common_vendor.t(common_vendor.unref(isEdit) ? "修改" : "新增"),
        af: common_vendor.o(postSubmit)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-0299c5b6"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/stock/account_book_form/account_book_form.js.map
