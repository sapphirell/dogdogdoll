import {
	websiteUrl,
} from "./config.js";


//选择图片
export function chooseImage() {
	return new Promise(resolve => {
		uni.chooseImage({
			count: 1,
			success: (res) => {
				resolve(res.tempFilePaths[0])
			}
		})
	})
}

//裁切图片
export function jumpToCroper() {
	chooseImage().then(src => {
		uni.navigateTo({
			url: `/pages/pop_croper/pop_croper?src=${decodeURIComponent(src)}`
		})
	})
}


// 获取七牛云上传凭证
export function getQiniuToken() {
  return new Promise((resolve, reject) => {
    let token = uni.getStorageSync('token');
    uni.request({
      url: websiteUrl + '/with-state/qiniu-token',
      method: "POST",
      header: {
        'Authorization': token,
      },
      success: (res) => {
        if (res.data.data && res.data.data.token) {
          console.log("获取到的七牛token：" + res.data.data.token);
          resolve(res.data.data);
        } else {
          uni.showToast({
            title: '获取上传凭证失败',
            icon: 'none',
          });
          reject('获取上传凭证失败');
        }
      },
      fail: (err) => {
        uni.showToast({
          title: '获取上传凭证失败',
          icon: 'none',
        });
        reject('获取上传凭证失败');
      }
    });
  });
}


// 上传图片到七牛云
export function uploadImageToQiniu(croperPath, qnToken, fileName) {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: 'https://up-cn-east-2.qiniup.com',
      name: 'file',
      method: "POST",
      filePath: croperPath,
      fileType: 'image', // 仅支付宝小程序，且必填
      formData: {
        token: qnToken,
        key: fileName,
        scope: "hobby-box:" + fileName, // 覆盖上传
      },
      success: (res) => {
        console.log("上传成功");
        resolve(res);
      },
      fail: (err) => {
        uni.showToast({
          title: '上传失败',
          icon: 'none',
        });
        reject('上传失败');
      }
    });
  });
}
