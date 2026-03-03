import {
	websiteUrl, image1Url
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

export function chooseImageList(count = 9) {
  return new Promise((resolve, reject) => {
    uni.chooseImage({
      count: count,
      success: (res) => {
        resolve(res.tempFilePaths);
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

//裁切图片
export function jumpToCroper() {
	chooseImage().then(src => {
		const encodedSrc = encodeURIComponent(src)
		uni.navigateTo({
			url: `/pages/pop_croper/pop_croper?src=${encodedSrc}`
		})
	})
}


// 获取七牛云上传凭证
export function getQiniuToken() {
  return new Promise((resolve, reject) => {
    let token = uni.getStorageSync('token');
    uni.request({
      url: websiteUrl.value + '/with-state/qiniu-token',
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
  let authorization = uni.getStorageSync('token');
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: 'https://up-cn-east-2.qiniup.com',
      name: 'file',
      method: "POST",
      filePath: croperPath,
      fileType: 'image',
      formData: {
        token: qnToken,
        key: fileName,
        scope: "hobby-box:" + fileName,
      },
      success: async (res) => {
        try {
          // 构造完整图片URL（根据你的实际URL结构调整）
          const fullUrl = image1Url + fileName;
          
          // 调用日志接口
          const logRes = await uni.request({
            url: `${websiteUrl.value}/with-state/add-image-log`,
            method: 'POST',
            header: {
              'Content-Type': 'application/json',
              'Authorization': authorization,
            },
            data: {
              image_url: fullUrl
            }
          });
			console.log(logRes)
          if (logRes.data.status !== "success") {
            throw new Error('上传图片失败');
          }

          resolve({ qiniuRes: res, imageUrl: fullUrl });
        } catch (logErr) {
          console.error('日志记录失败:', logErr);
          uni.showToast({
            title: '日志记录失败',
            icon: 'none'
          });
          reject('日志记录失败');
        }
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
