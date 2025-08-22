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
function chooseImageList(count = 9) {
  return new Promise((resolve, reject) => {
    common_vendor.index.chooseImage({
      count,
      success: (res) => {
        resolve(res.tempFilePaths);
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}
function getQiniuToken() {
  return new Promise((resolve, reject) => {
    let token = common_vendor.index.getStorageSync("token");
    common_vendor.index.request({
      url: common_config.websiteUrl.value + "/with-state/qiniu-token",
      method: "POST",
      header: {
        "Authorization": token
      },
      success: (res) => {
        if (res.data.data && res.data.data.token) {
          common_vendor.index.__f__("log", "at common/image.js:54", "获取到的七牛token：" + res.data.data.token);
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
  let authorization = common_vendor.index.getStorageSync("token");
  return new Promise((resolve, reject) => {
    common_vendor.index.uploadFile({
      url: "https://up-cn-east-2.qiniup.com",
      name: "file",
      method: "POST",
      filePath: croperPath,
      fileType: "image",
      formData: {
        token: qnToken,
        key: fileName,
        scope: "hobby-box:" + fileName
      },
      success: async (res) => {
        try {
          const fullUrl = common_config.image1Url + fileName;
          const logRes = await common_vendor.index.request({
            url: `${common_config.websiteUrl.value}/with-state/add-image-log`,
            method: "POST",
            header: {
              "Content-Type": "application/json",
              "Authorization": authorization
            },
            data: {
              image_url: fullUrl
            }
          });
          common_vendor.index.__f__("log", "at common/image.js:108", logRes);
          if (logRes.data.status !== "success") {
            throw new Error("上传图片失败");
          }
          resolve({ qiniuRes: res, imageUrl: fullUrl });
        } catch (logErr) {
          common_vendor.index.__f__("error", "at common/image.js:115", "日志记录失败:", logErr);
          common_vendor.index.showToast({
            title: "日志记录失败",
            icon: "none"
          });
          reject("日志记录失败");
        }
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
exports.chooseImageList = chooseImageList;
exports.getQiniuToken = getQiniuToken;
exports.uploadImageToQiniu = uploadImageToQiniu;
//# sourceMappingURL=../../.sourcemap/mp-weixin/common/image.js.map
