"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const common_config = require("../../../common/config.js");
const common_image = require("../../../common/image.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_common_modal2 = common_vendor.resolveComponent("common-modal");
  const _easycom_goods_search2 = common_vendor.resolveComponent("goods-search");
  (_easycom_uni_icons2 + _easycom_common_modal2 + _easycom_goods_search2)();
}
const _easycom_uni_icons = () => "../../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_common_modal = () => "../../../components/common-modal/common-modal.js";
const _easycom_goods_search = () => "../../../components/goods-search/goods-search.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_common_modal + _easycom_goods_search)();
}
const _sfc_main = {
  __name: "account_book_form",
  props: ["account_book_id"],
  setup(__props) {
    const props = __props;
    const isEdit = props.account_book_id ? true : false;
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
        common_vendor.index.__f__("error", "at pages/stock/account_book_form/account_book_form.vue:190", "获取分类失败:", err);
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
                data: { id }
                // 使用JSON格式传参
              });
              const resData = response.data;
              if (resData.status === "success") {
                await getAccountTypes();
                common_vendor.index.showToast({ title: "删除成功" });
              } else {
                common_vendor.index.showToast({
                  title: resData.msg || "删除失败",
                  icon: "none"
                });
              }
            } catch (err) {
              common_vendor.index.__f__("error", "at pages/stock/account_book_form/account_book_form.vue:260", "删除失败:", err);
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
    const accountImage = common_vendor.ref("");
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
          common_vendor.index.__f__("log", "at pages/stock/account_book_form/account_book_form.vue:313", res.data.data);
          name.value = res.data.data.name;
          price.value = parseInt(res.data.data.price);
          selectedType.value = typeOptions.value.indexOf(res.data.data.type);
          accountImage.value = res.data.data.image_url;
          form.value = {
            isRemind: res.data.data.is_remind,
            finalPrice: res.data.data.final_price,
            finalTime: res.data.data.final_time
          };
          common_vendor.index.__f__("log", "at pages/stock/account_book_form/account_book_form.vue:324", "f:", form);
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/stock/account_book_form/account_book_form.vue:327", err);
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
          if ((_a = detail.goods_images) == null ? void 0 : _a[0]) {
            accountImage.value = detail.goods_images[0];
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/stock/account_book_form/account_book_form.vue:351", "获取商品详情失败:", error);
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
              common_vendor.index.showToast({ title: "参数错误", icon: "none" });
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
              data: { id },
              // 改为JSON格式传参
              success: (res2) => {
                common_vendor.index.__f__("log", "at pages/stock/account_book_form/account_book_form.vue:384", res2.data.status);
                if (res2.data.status === "success") {
                  common_vendor.index.showToast({ title: "删除成功", icon: "success" });
                  setTimeout(() => common_vendor.index.navigateBack(), 500);
                } else {
                  common_vendor.index.showToast({
                    title: res2.data.msg || "删除失败",
                    icon: "none"
                  });
                }
              },
              fail: (err) => {
                common_vendor.index.__f__("error", "at pages/stock/account_book_form/account_book_form.vue:396", "请求失败:", err);
                common_vendor.index.showToast({ title: "网络错误", icon: "none" });
              }
            });
          }
        }
      });
    }
    function selectImage() {
      common_image.chooseImage().then((res) => {
        common_image.getQiniuToken().then((tokenData) => {
          common_vendor.index.__f__("log", "at pages/stock/account_book_form/account_book_form.vue:408", tokenData);
          common_image.uploadImageToQiniu(res, tokenData.token, tokenData.path).then((uploadRes) => {
            if (uploadRes.statusCode != 200) {
              common_vendor.index.showToast({
                title: "上传失败",
                icon: "none"
              });
            }
            common_vendor.index.__f__("log", "at pages/stock/account_book_form/account_book_form.vue:417", common_config.image1Url + tokenData.path);
            accountImage.value = common_config.image1Url + tokenData.path;
            common_vendor.index.showToast({
              title: "上传成功",
              icon: "success"
            });
          });
        });
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
      if (form.value.isRemind) {
        if (!form.value.finalPrice || form.value.finalPrice <= 0) {
          common_vendor.index.showToast({
            title: "请输入正确的尾款金额",
            icon: "none"
          });
          return false;
        }
        if (!form.value.finalTime || new Date(form.value.finalTime) < /* @__PURE__ */ new Date()) {
          common_vendor.index.showToast({
            title: "请选择未来的日期",
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
        type: typeOptions.value[selectedType.value],
        // 使用合并后的分类列表
        image_url: accountImage.value,
        is_remind: form.value.isRemind,
        final_price: parseInt(form.value.finalPrice, 10),
        final_time: form.value.finalTime
      };
      common_vendor.index.__f__("log", "at pages/stock/account_book_form/account_book_form.vue:493", "提交数据:", postData);
      common_vendor.index.request({
        url: common_config.websiteUrl + "/with-state/add-account-book",
        method: "POST",
        header: {
          "Authorization": common_vendor.index.getStorageSync("token")
        },
        data: postData,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/stock/account_book_form/account_book_form.vue:503", res.data);
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
        type: typeOptions.value[selectedType.value],
        // 使用合并后的分类列表
        image_url: accountImage.value,
        id: parseInt(props.account_book_id, 10),
        is_remind: form.value.isRemind,
        // 转换为数据库需要的格式
        final_price: parseInt(form.value.finalPrice, 10),
        final_time: form.value.finalTime
      };
      common_vendor.index.request({
        url: common_config.websiteUrl + "/with-state/update-account-book",
        method: "POST",
        header: {
          "Authorization": common_vendor.index.getStorageSync("token")
        },
        data: postData,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/stock/account_book_form/account_book_form.vue:544", res.data);
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
    common_vendor.onShow(() => {
      common_config.asyncGetUserInfo().then(() => {
        getAccountTypes();
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
          top: "5%",
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
        r: accountImage.value
      }, accountImage.value ? {
        s: accountImage.value,
        t: common_vendor.o(selectImage)
      } : {
        v: common_vendor.o(selectImage)
      }, {
        w: !form.value.isRemind
      }, !form.value.isRemind ? {
        x: common_vendor.p({
          type: "right",
          size: "20",
          color: "#888"
        })
      } : {
        y: common_vendor.p({
          type: "down",
          size: "20",
          color: "#888"
        })
      }, {
        z: form.value.finalPrice > 0
      }, form.value.finalPrice > 0 ? {} : {}, {
        A: common_vendor.o(($event) => toggleRemind()),
        B: form.value.isRemind
      }, form.value.isRemind ? {
        C: form.value.finalPrice,
        D: common_vendor.o(($event) => form.value.finalPrice = $event.detail.value),
        E: common_vendor.t(form.value.finalTime || "选择截止日期"),
        F: form.value.finalTime,
        G: common_vendor.o(($event) => form.value.finalTime = $event.detail.value)
      } : {}, {
        H: common_assets._imports_0$4,
        I: common_vendor.unref(isEdit)
      }, common_vendor.unref(isEdit) ? {
        J: common_vendor.o(handleDelete)
      } : {}, {
        K: common_vendor.t(common_vendor.unref(isEdit) ? "修改" : "新增"),
        L: common_vendor.o(postSubmit)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-0299c5b6"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/stock/account_book_form/account_book_form.js.map
