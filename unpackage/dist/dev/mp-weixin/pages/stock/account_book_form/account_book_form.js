"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const common_config = require("../../../common/config.js");
const common_image = require("../../../common/image.js");
if (!Array) {
  const _easycom_goods_search2 = common_vendor.resolveComponent("goods-search");
  _easycom_goods_search2();
}
const _easycom_goods_search = () => "../../../components/goods-search/goods-search.js";
if (!Math) {
  _easycom_goods_search();
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
    const selectedType = common_vendor.ref(0);
    const accountBookTypeList = common_vendor.ref(["请选择", "娃衣", "娃头", "眼珠", "假发", "娃鞋", "其它"]);
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
          common_vendor.index.__f__("log", "at pages/stock/account_book_form/account_book_form.vue:170", res.data.data);
          name.value = res.data.data.name;
          price.value = res.data.data.price;
          selectedType.value = accountBookTypeList.value.indexOf(res.data.data.type);
          accountImage.value = res.data.data.image_url;
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/stock/account_book_form/account_book_form.vue:177", err);
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
        common_vendor.index.__f__("error", "at pages/stock/account_book_form/account_book_form.vue:201", "获取商品详情失败:", error);
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
            common_vendor.index.request({
              url: common_config.websiteUrl + "/with-state/delete-account-book?id=" + parseInt(props.account_book_id, 10),
              method: "POST",
              header: {
                "Authorization": common_vendor.index.getStorageSync("token")
              },
              success: (res2) => {
                common_vendor.index.__f__("log", "at pages/stock/account_book_form/account_book_form.vue:224", res2.data);
                if (res2.data.status == "success") {
                  common_vendor.index.showToast({
                    title: "删除成功",
                    icon: "success"
                  });
                  setTimeout(() => {
                    common_vendor.index.navigateBack();
                  }, 500);
                } else {
                  common_vendor.index.showToast({
                    title: res2.data.msg,
                    icon: "none"
                  });
                }
              }
            });
          }
        }
      });
    }
    function selectImage() {
      common_image.chooseImage().then((res) => {
        common_image.getQiniuToken().then((tokenData) => {
          common_vendor.index.__f__("log", "at pages/stock/account_book_form/account_book_form.vue:251", tokenData);
          common_image.uploadImageToQiniu(res, tokenData.token, tokenData.path).then((uploadRes) => {
            if (uploadRes.statusCode != 200) {
              common_vendor.index.showToast({
                title: "上传失败",
                icon: "none"
              });
            }
            common_vendor.index.__f__("log", "at pages/stock/account_book_form/account_book_form.vue:260", common_config.image1Url + tokenData.path);
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
      if (isEdit) {
        updateAccountBook();
      } else {
        addAccountBook();
      }
    }
    function addAccountBook() {
      let postData = {
        name: name.value,
        price: parseInt(price.value, 10),
        type: accountBookTypeList.value[selectedType.value],
        image_url: accountImage.value
      };
      common_vendor.index.__f__("log", "at pages/stock/account_book_form/account_book_form.vue:310", postData);
      common_vendor.index.request({
        url: common_config.websiteUrl + "/with-state/add-account-book",
        method: "POST",
        header: {
          "Authorization": common_vendor.index.getStorageSync("token")
        },
        data: postData,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/stock/account_book_form/account_book_form.vue:320", res.data);
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
        type: accountBookTypeList.value[selectedType.value],
        image_url: accountImage.value,
        id: parseInt(props.account_book_id, 10)
      };
      common_vendor.index.request({
        url: common_config.websiteUrl + "/with-state/update-account-book",
        method: "POST",
        header: {
          "Authorization": common_vendor.index.getStorageSync("token")
        },
        data: postData,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/stock/account_book_form/account_book_form.vue:358", res.data);
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
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(accountBookTypeList.value[selectedType.value] || "请选择分类"),
        b: selectedType.value,
        c: accountBookTypeList.value,
        d: common_vendor.o(updateSelectedType),
        e: common_vendor.o(handleGoodsSelect),
        f: common_vendor.o(($event) => common_vendor.isRef(name) ? name.value = $event : name = $event),
        g: common_vendor.p({
          ["font-size"]: "24rpx",
          mode: "fill",
          background: "#fff",
          width: "640rpx",
          ["show-icon"]: false,
          modelValue: common_vendor.unref(name)
        }),
        h: common_vendor.unref(price),
        i: common_vendor.o(($event) => common_vendor.isRef(price) ? price.value = $event.detail.value : price = $event.detail.value),
        j: accountImage.value
      }, accountImage.value ? {
        k: accountImage.value
      } : {
        l: common_vendor.o(selectImage)
      }, {
        m: common_assets._imports_0$4,
        n: common_vendor.unref(isEdit)
      }, common_vendor.unref(isEdit) ? {
        o: common_vendor.o(handleDelete)
      } : {}, {
        p: common_vendor.t(common_vendor.unref(isEdit) ? "修改" : "新增"),
        q: common_vendor.o(postSubmit)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-0299c5b6"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/stock/account_book_form/account_book_form.js.map
