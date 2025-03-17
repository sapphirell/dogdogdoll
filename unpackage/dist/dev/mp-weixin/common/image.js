"use strict";
const common_vendor = require("./vendor.js");
const common_config = require("./config.js");
function chooseImage() {
  return new Promise((resolve) => {
    common_vendor.index.chooseImage({
      count: 1,
      success: (res) => {
        resolve(res.tempFilePaths[0]);
      }
    });
  });
}
function getQiniuToken() {
  return new Promise((resolve, reject) => {
    let token = common_vendor.index.getStorageSync("token");
    common_vendor.index.request({
      url: common_config.websiteUrl + "/with-state/qiniu-token",
      method: "POST",
      header: {
        "Authorization": token
      },
      success: (res) => {
        if (res.data.data && res.data.data.token) {
          common_vendor.index.__f__("log", "at common/image.js:40", "获取到的七牛token：" + res.data.data.token);
          resolve(res.data.data);
        } else {
          common_vendor.index.showToast({
            title: "获取上传凭证失败",
            icon: "none"
          });
          reject("获取上传凭证失败");
        }
      },
      fail: (err) => {
        common_vendor.index.showToast({
          title: "获取上传凭证失败",
          icon: "none"
        });
        reject("获取上传凭证失败");
      }
    });
  });
}
function uploadImageToQiniu(croperPath, qnToken, fileName) {
  return new Promise((resolve, reject) => {
    common_vendor.index.uploadFile({
      url: "https://up-cn-east-2.qiniup.com",
      name: "file",
      method: "POST",
      filePath: croperPath,
      fileType: "image",
      // 仅支付宝小程序，且必填
      formData: {
        token: qnToken,
        key: fileName,
        scope: "hobby-box:" + fileName
        // 覆盖上传
      },
      success: (res) => {
        common_vendor.index.__f__("log", "at common/image.js:77", "上传成功");
        resolve(res);
      },
      fail: (err) => {
        common_vendor.index.showToast({
          title: "上传失败",
          icon: "none"
        });
        reject("上传失败");
      }
    });
  });
}
exports.chooseImage = chooseImage;
exports.getQiniuToken = getQiniuToken;
exports.uploadImageToQiniu = uploadImageToQiniu;
//# sourceMappingURL=../../.sourcemap/mp-weixin/common/image.js.map
