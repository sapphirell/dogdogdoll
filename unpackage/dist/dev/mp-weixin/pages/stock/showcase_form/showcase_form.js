"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_config = require("../../../common/config.js");
const common_image = require("../../../common/image.js");
const _sfc_main = {
  __name: "showcase_form",
  props: ["showcase_id"],
  setup(__props) {
    const props = __props;
    const isEdit = props.showcase_id ? true : false;
    const name = common_vendor.ref("");
    const description = common_vendor.ref("");
    const image_url = common_vendor.ref("");
    function getShowcaseById(id) {
      let token = common_vendor.index.getStorageSync("token");
      common_vendor.index.request({
        url: common_config.websiteUrl + "/with-state/showcase-detail",
        method: "GET",
        header: {
          "Authorization": token
        },
        data: {
          id
        },
        success: (res) => {
          name.value = res.data.data.name;
          description.value = res.data.data.description;
          image_url.value = res.data.data.image_url;
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/stock/showcase_form/showcase_form.vue:71", err);
        }
      });
    }
    function selectImage() {
      common_image.chooseImage().then((res) => {
        common_image.getQiniuToken().then((tokenData) => {
          common_image.uploadImageToQiniu(res, tokenData.token, tokenData.path).then((uploadRes) => {
            if (uploadRes.statusCode != 200) {
              common_vendor.index.showToast({
                title: "上传失败",
                icon: "none"
              });
            }
            image_url.value = common_config.image1Url + tokenData.path;
            common_vendor.index.showToast({
              title: "上传成功",
              icon: "success"
            });
          });
        });
      });
    }
    if (isEdit) {
      getShowcaseById(props.showcase_id);
      common_vendor.index.setNavigationBarTitle({
        title: "编辑展示柜"
      });
    } else {
      common_vendor.index.setNavigationBarTitle({
        title: "新增展示柜"
      });
    }
    function postSubmit() {
      if (isEdit) {
        updateShowcase();
      } else {
        addShowcase();
      }
    }
    function addShowcase() {
      let postData = {
        name: name.value,
        description: description.value,
        image_url: image_url.value
      };
      common_vendor.index.request({
        url: common_config.websiteUrl + "/with-state/add-showcase",
        method: "POST",
        header: {
          "Authorization": common_vendor.index.getStorageSync("token")
        },
        data: postData,
        success: (res) => {
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
    function updateShowcase() {
      let postData = {
        id: parseInt(props.showcase_id, 10),
        name: name.value,
        description: description.value,
        image_url: image_url.value
      };
      common_vendor.index.request({
        url: common_config.websiteUrl + "/with-state/update-showcase",
        method: "POST",
        header: {
          "Authorization": common_vendor.index.getStorageSync("token")
        },
        data: postData,
        success: (res) => {
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
        a: name.value,
        b: common_vendor.o(($event) => name.value = $event.detail.value),
        c: description.value,
        d: common_vendor.o(($event) => description.value = $event.detail.value),
        e: image_url.value,
        f: common_vendor.o(($event) => image_url.value = $event.detail.value),
        g: image_url.value
      }, image_url.value ? {
        h: image_url.value
      } : {}, {
        i: common_vendor.o(selectImage),
        j: common_vendor.o(postSubmit)
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/stock/showcase_form/showcase_form.js.map
