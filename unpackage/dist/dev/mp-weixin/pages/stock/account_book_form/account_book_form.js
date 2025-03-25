"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const common_config = require("../../../common/config.js");
const common_image = require("../../../common/image.js");
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
          common_vendor.index.__f__("log", "at pages/stock/account_book_form/account_book_form.vue:162", res.data.data);
          name.value = res.data.data.name;
          price.value = res.data.data.price;
          selectedType.value = accountBookTypeList.value.indexOf(res.data.data.type);
          accountImage.value = res.data.data.image_url;
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/stock/account_book_form/account_book_form.vue:169", err);
        }
      });
    }
    function selectImage() {
      common_image.chooseImage().then((res) => {
        common_image.getQiniuToken().then((tokenData) => {
          common_vendor.index.__f__("log", "at pages/stock/account_book_form/account_book_form.vue:178", tokenData);
          common_image.uploadImageToQiniu(res, tokenData.token, tokenData.path).then((uploadRes) => {
            if (uploadRes.statusCode != 200) {
              common_vendor.index.showToast({
                title: "上传失败",
                icon: "none"
              });
            }
            common_vendor.index.__f__("log", "at pages/stock/account_book_form/account_book_form.vue:187", common_config.image1Url + tokenData.path);
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
      common_vendor.index.__f__("log", "at pages/stock/account_book_form/account_book_form.vue:237", postData);
      common_vendor.index.request({
        url: common_config.websiteUrl + "/with-state/add-account-book",
        method: "POST",
        header: {
          "Authorization": common_vendor.index.getStorageSync("token")
        },
        data: postData,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/stock/account_book_form/account_book_form.vue:247", res.data);
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
          common_vendor.index.__f__("log", "at pages/stock/account_book_form/account_book_form.vue:285", res.data);
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
        e: common_vendor.unref(name),
        f: common_vendor.o(($event) => common_vendor.isRef(name) ? name.value = $event.detail.value : name = $event.detail.value),
        g: common_vendor.unref(price),
        h: common_vendor.o(($event) => common_vendor.isRef(price) ? price.value = $event.detail.value : price = $event.detail.value),
        i: accountImage.value
      }, accountImage.value ? {
        j: accountImage.value
      } : {
        k: common_vendor.o(selectImage)
      }, {
        l: common_assets._imports_0$6,
        m: common_vendor.unref(isEdit)
      }, common_vendor.unref(isEdit) ? {
        n: common_vendor.o((...args) => _ctx.handleDelete && _ctx.handleDelete(...args))
      } : {}, {
        o: common_vendor.t(common_vendor.unref(isEdit) ? "修改" : "新增"),
        p: common_vendor.o(postSubmit)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-0299c5b6"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/stock/account_book_form/account_book_form.js.map
