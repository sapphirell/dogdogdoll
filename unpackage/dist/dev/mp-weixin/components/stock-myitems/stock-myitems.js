"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const common_config = require("../../common/config.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_shmily_drag_image2 = common_vendor.resolveComponent("shmily-drag-image");
  const _easycom_common_modal2 = common_vendor.resolveComponent("common-modal");
  (_easycom_uni_icons2 + _easycom_shmily_drag_image2 + _easycom_common_modal2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_shmily_drag_image = () => "../shmily-drag-image/shmily-drag-image.js";
const _easycom_common_modal = () => "../common-modal/common-modal.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_shmily_drag_image + _easycom_common_modal)();
}
const _sfc_main = {
  __name: "stock-myitems",
  props: {
    accountBookData: Object
  },
  emits: ["go2editor", "update-type", "init-request", "update:accountBookData"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const typeModalVisible = common_vendor.ref(false);
    const newTypeName = common_vendor.ref("");
    const customTypes = common_vendor.ref([]);
    const selectedType = common_vendor.ref(0);
    const defaultTypes = ["全部"];
    const typeOptions = common_vendor.computed(() => [
      ...defaultTypes,
      ...customTypes.value.map((t) => t.name)
    ]);
    const totalPrice = common_vendor.computed(() => {
      if (!props.accountBookData.account_books)
        return 0;
      return props.accountBookData.account_books.reduce((sum, item) => {
        return sum + (parseFloat(item.price) || 0);
      }, 0).toFixed(2);
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
        common_vendor.index.__f__("error", "at components/stock-myitems/stock-myitems.vue:77", "获取分类失败:", err);
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
                },
                data: {
                  id
                }
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
              common_vendor.index.__f__("error", "at components/stock-myitems/stock-myitems.vue:149", "删除失败:", err);
              common_vendor.index.showToast({
                title: err.errMsg || "请求失败",
                icon: "none"
              });
            }
          }
        }
      });
    };
    const updateSelectedType = (e) => {
      selectedType.value = e.detail.value;
      const selectedTypeName = typeOptions.value[selectedType.value];
      emits("update-type", selectedTypeName === "全部" ? "" : selectedTypeName);
    };
    common_vendor.onMounted(() => {
      getAccountTypes();
    });
    common_vendor.onMounted(() => {
      setTimeout(initDragSystem, 300);
    });
    return (_ctx, _cache) => {
      var _a, _b;
      return common_vendor.e({
        a: common_vendor.t(typeOptions.value[selectedType.value]),
        b: common_vendor.p({
          type: "arrowdown",
          size: "14",
          color: "#747EE5"
        }),
        c: selectedType.value,
        d: typeOptions.value,
        e: common_vendor.o(updateSelectedType),
        f: common_vendor.p({
          type: "gear",
          size: "16",
          color: "#fff"
        }),
        g: common_vendor.o(($event) => typeModalVisible.value = true),
        h: common_vendor.p({
          type: "money",
          size: "18",
          color: "#74c9e5"
        }),
        i: common_vendor.t(totalPrice.value),
        j: ((_a = __props.accountBookData.account_books) == null ? void 0 : _a.length) > 0
      }, ((_b = __props.accountBookData.account_books) == null ? void 0 : _b.length) > 0 ? {
        k: common_vendor.o(($event) => __props.accountBookData.account_books = $event),
        l: common_vendor.p({
          ["border-radius"]: "20",
          modelValue: __props.accountBookData.account_books
        })
      } : {
        m: common_assets._imports_0$3
      }, {
        n: common_vendor.o(($event) => typeModalVisible.value = false),
        o: common_vendor.p({
          type: "closeempty",
          size: "24",
          color: "#999"
        }),
        p: common_vendor.f(customTypes.value, (type, index, i0) => {
          return {
            a: "30803138-6-" + i0 + ",30803138-4",
            b: common_vendor.t(type.name),
            c: common_vendor.o(($event) => deleteType(type.id), type.id),
            d: "30803138-7-" + i0 + ",30803138-4",
            e: type.id
          };
        }),
        q: common_vendor.p({
          type: "folder",
          size: "20",
          color: "#747EE5"
        }),
        r: common_vendor.p({
          type: "trash",
          size: "20",
          color: "#ff6666"
        }),
        s: customTypes.value.length === 0
      }, customTypes.value.length === 0 ? {
        t: common_assets._imports_1$8
      } : {}, {
        v: newTypeName.value,
        w: common_vendor.o(($event) => newTypeName.value = $event.detail.value),
        x: common_vendor.p({
          type: "plus",
          size: "16",
          color: "#fff"
        }),
        y: common_vendor.o(addNewType),
        z: common_vendor.o((val) => typeModalVisible.value = val),
        A: common_vendor.p({
          visible: typeModalVisible.value,
          top: "250rpx",
          height: "65%"
        })
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-30803138"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/stock-myitems/stock-myitems.js.map
