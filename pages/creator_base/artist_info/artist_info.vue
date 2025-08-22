<template>
  <view class="container">
    <!-- 顶部标签栏 - 只显示已选择的身份 -->
    <view class="tabs">
      <view class="tab-item" :class="{ active: activeTab === 'artist' }" @click="switchTab('artist')">
        妆师
      </view>
      <view class="tab-item" :class="{ active: activeTab === 'hairstylist' }" @click="switchTab('hairstylist')">
        毛娘
      </view>
    </view>

    <!-- 妆师设置 -->
    <view v-if="activeTab === 'artist'" class="form-container">
      <view class="form-section">
        <view class="section-title">接单方式</view>
        <picker class="picker" mode="selector" :range="statusOptions" range-key="label"
          :value="artistStatusIndex">
          <view class="picker-text">{{ statusOptions[artistStatusIndex].label }}</view>
        </picker>
      </view>
      <view class="form-section">
        <view class="section-title">基础价格</view>
        <view class="input-container">
          <text class="input-symbol">¥</text>
          <input class="input" type="digit" v-model="formData.base_price_of_artist" placeholder="请输入基础价格" />
        </view>
      </view>
      <view class="form-section">
        <view class="section-title">钞能力系数</view>
        <view class="input-container">
          <input class="input" type="digit" v-model="formData.overload_ratio_of_artist"
            placeholder="请输入钞能力系数" />
          <text class="input-symbol">倍</text>
        </view>
      </view>
	  <view class="form-section">
	    <view class="section-title">站外联系方式</view>
	    <view class="input-container">
	      <input class="input" type="text" v-model="formData.contact"
	        placeholder="请输入联系方式，例如【闲鱼：xxx】" />
	    </view>
	  </view>
	  
      <view class="form-section">
        <view class="section-title">展示作品</view>
        <view class="highlight-list">
          <view 
            v-for="(image, index) in formData.artist_highlight_images" 
            :key="index" 
            class="highlight-item"
          >
            <image 
              class="highlight-img" 
              :src="image" 
              mode="aspectFill" 
              @click="previewImage(image, formData.artist_highlight_images)"
            ></image>
            <view class="highlight-actions">
              <uni-icons 
                type="trash" 
                size="24" 
                color="#ff4d6a" 
                @click.stop="removeArtistImage(index)"
              ></uni-icons>
            </view>
          </view>

		  <!-- 上传按钮 -->
		  <view 
		    class="upload-btn" 
		    @click="chooseArtistImage"
		    v-if="formData.artist_highlight_images.length < 9"
		  >
		    <uni-icons type="plus" size="32" color="#999"></uni-icons>
		    <text class="upload-text">添加图片</text>
		  </view>
        </view>
        
        <!-- 上传进度提示 -->
        <view class="upload-progress" v-if="artistUploading">
          <progress 
            :percent="artistUploadProgress" 
            stroke-width="4" 
            activeColor="#4a9db5"
          />
          <text>{{ artistUploadStatusText }}</text>
        </view>
      </view>

      <view class="form-section">
        <view class="section-title">细则说明</view>
        <textarea class="textarea" v-model="formData.rule_of_artist" placeholder="请输入妆师细则说明"></textarea>
      </view>
    </view>
    
    <!-- 毛娘设置 -->
    <view v-if="activeTab === 'hairstylist'" class="form-container">
      <view class="form-section">
        <view class="section-title">接单方式</view>
        <picker class="picker" mode="selector" :range="statusOptions" range-key="label"
          :value="hairstylistStatusIndex" >
          <view class="picker-text">{{ statusOptions[hairstylistStatusIndex].label }}</view>
        </picker>
      </view>
      <view class="form-section">
        <view class="section-title">基础价格</view>
        <view class="input-container">
          <text class="input-symbol">¥</text>
          <input class="input" type="digit" v-model="formData.base_price_of_hairstylist"
            placeholder="请输入基础价格" />
        </view>
      </view>
      <view class="form-section">
        <view class="section-title">钞能力系数</view>
        <view class="input-container">
          <input class="input" type="digit" v-model="formData.overload_ratio_of_hairstylist"
            placeholder="请输入钞能力系数" />
          <text class="input-symbol">倍</text>
        </view>
      </view>
	  <view class="form-section">
	    <view class="section-title">站外联系方式</view>
	    <view class="input-container">
	      <input class="input" type="text" v-model="formData.contact"
	        placeholder="请输入联系方式，例如【闲鱼：xxx】" />
	    </view>
	  </view>
      <view class="form-section">
        <view class="section-title">展示作品</view>
        <view class="highlight-list">
          <view 
            v-for="(image, index) in formData.hairstylist_highlight_images" 
            :key="index" 
            class="highlight-item"
          >
            <image 
              class="highlight-img" 
              :src="image" 
              mode="aspectFill" 
              @click="previewImage(image, formData.hairstylist_highlight_images)"
            ></image>
            <view class="highlight-actions">
              <uni-icons 
                type="trash" 
                size="24" 
                color="#ff4d6a" 
                @click.stop="removeHairstylistImage(index)"
              ></uni-icons>
            </view>
          </view>
          <view class="add-btn" @click="chooseHairstylistImage">
            <uni-icons type="plus" size="24" color="#fff"></uni-icons>
          </view>
        </view>
        
        <!-- 上传进度提示 -->
        <view class="upload-progress" v-if="hairstylistUploading">
          <progress 
            :percent="hairstylistUploadProgress" 
            stroke-width="4" 
            activeColor="#4a9db5"
          />
          <text>{{ hairstylistUploadStatusText }}</text>
        </view>
      </view>
      
      <view class="form-section">
        <view class="section-title">细则说明</view>
        <textarea class="textarea" v-model="formData.rule_of_hairstylist" placeholder="请输入毛娘细则说明"></textarea>
      </view>
    </view>
    
    <!-- 保存按钮 -->
    <view class="save-btn" @click="saveSettings">保存设置</view>
  </view>
</template>

<script setup>
  import {
    ref,
    computed,
    onMounted
  } from 'vue'
  import {
    websiteUrl,
    asyncGetUserInfo
  } from '@/common/config.js'

  import {
    chooseImageList,
    getQiniuToken,
    uploadImageToQiniu
  } from '@/common/image.js' // 根据实际路径调整

  const activeTab = ref('artist')

  // 表单数据
  const formData = ref({
    artist_highlight_images: [],
    hairstylist_highlight_images: [],
    status_of_artist: 0,
    status_of_hairstylist: 0,
    base_price_of_artist: 0,
    base_price_of_hairstylist: 0,
    overload_ratio_of_artist: 1,
    overload_ratio_of_hairstylist: 1,
    rule_of_artist: '',
    rule_of_hairstylist: '',
	contact: '',
  })
  
  // 状态选项
  const statusOptions = ref([{
      label: '请选择状态',
      value: 0
    },
    {
      label: '长期接单',
      value: 1
    },
    {
      label: '限时手速投递',
      value: 2
    },
    {
      label: '限时抽选投递',
      value: 3
    },
    {
      label: '限时黑箱卡投递',
      value: 4
    },
    {
      label: '暂停接单',
      value: 5
    }
  ])

  // 上传状态 - 妆师
  const artistUploading = ref(false)
  const artistUploadProgress = ref(0)
  const artistUploadStatusText = ref('')
  
  // 上传状态 - 毛娘
  const hairstylistUploading = ref(false)
  const hairstylistUploadProgress = ref(0)
  const hairstylistUploadStatusText = ref('')

  // 计算当前状态的索引
  const artistStatusIndex = computed(() => {
    return statusOptions.value.findIndex(item => item.value === formData.value.status_of_artist)
  })
  const hairstylistStatusIndex = computed(() => {
    return statusOptions.value.findIndex(item => item.value === formData.value.status_of_hairstylist)
  })
  
  // 切换标签页
  const switchTab = (tab) => {
    activeTab.value = tab
  }
  
  // 预览图片
  const previewImage = (url, urls) => {
    uni.previewImage({
      current: url,
      urls: urls
    })
  };
  
  // 选择妆师图片
  const chooseArtistImage = async () => {
    try {
      const maxCount = 9 - formData.value.artist_highlight_images.length
      if (maxCount <= 0) {
        uni.showToast({ title: '最多只能上传9张图片', icon: 'none' })
        return
      }
      
      // 选择图片
      const tempFilePaths = await chooseImageList(maxCount)
      
      // 设置上传状态
      artistUploading.value = true
      artistUploadProgress.value = 0
      artistUploadStatusText.value = '准备上传...'
      
      // 获取七牛云token
      artistUploadStatusText.value = '获取上传凭证...'
      const qiniuTokenRes = await getQiniuToken()
      if (!qiniuTokenRes || !qiniuTokenRes.token) {
        throw new Error('获取上传凭证失败')
      }
      
      const qiniuTokenData = qiniuTokenRes
      
      // 上传所有图片
      for (let i = 0; i < tempFilePaths.length; i++) {
        try {
          const filePath = tempFilePaths[i]
          
          // 更新上传状态
          artistUploadStatusText.value = `上传中 (${i+1}/${tempFilePaths.length})`
          artistUploadProgress.value = Math.round((i / tempFilePaths.length) * 100)
          
          // 使用七牛云返回的path作为文件名
          const fileName = qiniuTokenData.path
          
          // 上传到七牛云
          const result = await uploadImageToQiniu(
            filePath,
            qiniuTokenData.token,
            fileName
          )
          
          if (result && result.imageUrl) {
            // 添加到展示图列表
            formData.value.artist_highlight_images.push(result.imageUrl)
          }
        } catch (error) {
          console.error(`第 ${i+1} 张图片上传失败:`, error)
          uni.showToast({
            title: `第 ${i+1} 张图片上传失败: ${error.message || error}`,
            icon: 'none',
            duration: 3000
          })
        }
      }
      
      uni.showToast({ title: '上传成功', icon: 'success' })
    } catch (error) {
      console.error('上传失败:', error)
      uni.showToast({
        title: '上传失败: ' + (error.message || '未知错误'),
        icon: 'none'
      })
    } finally {
      artistUploading.value = false
      artistUploadProgress.value = 0
    }
  }

  // 删除妆师图片
  const removeArtistImage = (index) => {
    uni.showModal({
      title: '提示',
      content: '确定要删除这张展示图吗？',
      success: (res) => {
        if (res.confirm) {
          formData.value.artist_highlight_images.splice(index, 1)
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  }
  
  // 选择毛娘图片
  const chooseHairstylistImage = async () => {
    try {
      const maxCount = 9 - formData.value.hairstylist_highlight_images.length
      if (maxCount <= 0) {
        uni.showToast({ title: '最多只能上传9张图片', icon: 'none' })
        return
      }
      
      // 选择图片
      const tempFilePaths = await chooseImageList(maxCount)
      
      // 设置上传状态
      hairstylistUploading.value = true
      hairstylistUploadProgress.value = 0
      hairstylistUploadStatusText.value = '准备上传...'
      
      // 获取七牛云token
      hairstylistUploadStatusText.value = '获取上传凭证...'
      const qiniuTokenRes = await getQiniuToken()
      if (!qiniuTokenRes || !qiniuTokenRes.token) {
        throw new Error('获取上传凭证失败')
      }
      
      const qiniuTokenData = qiniuTokenRes
      
      // 上传所有图片
      for (let i = 0; i < tempFilePaths.length; i++) {
        try {
          const filePath = tempFilePaths[i]
          
          // 更新上传状态
          hairstylistUploadStatusText.value = `上传中 (${i+1}/${tempFilePaths.length})`
          hairstylistUploadProgress.value = Math.round((i / tempFilePaths.length) * 100)
          
          // 使用七牛云返回的path作为文件名
          const fileName = qiniuTokenData.path
          
          // 上传到七牛云
          const result = await uploadImageToQiniu(
            filePath,
            qiniuTokenData.token,
            fileName
          )
          
          if (result && result.imageUrl) {
            // 添加到展示图列表
            formData.value.hairstylist_highlight_images.push(result.imageUrl)
          }
        } catch (error) {
          console.error(`第 ${i+1} 张图片上传失败:`, error)
          uni.showToast({
            title: `第 ${i+1} 张图片上传失败: ${error.message || error}`,
            icon: 'none',
            duration: 3000
          })
        }
      }
      
      uni.showToast({ title: '上传成功', icon: 'success' })
    } catch (error) {
      console.error('上传失败:', error)
      uni.showToast({
        title: '上传失败: ' + (error.message || '未知错误'),
        icon: 'none'
      })
    } finally {
      hairstylistUploading.value = false
      hairstylistUploadProgress.value = 0
    }
  }
  
  // 删除毛娘图片
  const removeHairstylistImage = (index) => {
    uni.showModal({
      title: '提示',
      content: '确定要删除这张展示图吗？',
      success: (res) => {
        if (res.confirm) {
          formData.value.hairstylist_highlight_images.splice(index, 1)
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  }
  
  // 获取创作者信息
  const fetchArtistInfo = async () => {
    const token = uni.getStorageSync('token')
    if (!token) {
      uni.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }
    uni.showLoading({
      title: '加载中...'
    })
    try {
      const res = await uni.request({
        url: `${websiteUrl.value}/brand-manager/get-artist-info`,
        method: 'GET',
        header: {
          Authorization: token
        }
      })
      if (res.data.status === 'success') {
        console.log(res.data.data)
        const data = res.data.data
        formData.value = {
          artist_highlight_images: data.artist_highlight_images || [],
          hairstylist_highlight_images: data.hairstylist_highlight_images || [],
          status_of_artist: Number(data.status_of_artist) || 0,
          status_of_hairstylist: Number(data.status_of_hairstylist) || 0,
          base_price_of_artist: parseFloat(data.base_price_of_artist) || 0,
          base_price_of_hairstylist: parseFloat(data.base_price_of_hairstylist) || 0,
          overload_ratio_of_artist: parseFloat(data.overload_ratio_of_artist) || 1,
          overload_ratio_of_hairstylist: parseFloat(data.overload_ratio_of_hairstylist) || 1,
          rule_of_artist: data.rule_of_artist || '',
          rule_of_hairstylist: data.rule_of_hairstylist || '',
		  contact: data.contact || '',
        }
      } else {
        uni.showToast({
          title: res.data.msg || '获取信息失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('获取创作者信息失败:', error)
      uni.showToast({
        title: '网络请求失败',
        icon: 'none'
      })
    } finally {
      uni.hideLoading()
    }
  }
  
  // 保存设置
  const saveSettings = async () => {
    const token = uni.getStorageSync('token')
    if (!token) {
      uni.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }

    uni.showLoading({
      title: '保存中...'
    })
    try {
      
      formData.value.base_price_of_artist = parseFloat(formData.value.base_price_of_artist)


      const res = await uni.request({
        url: `${websiteUrl.value}/brand-manager/update-artist-info`,
        method: 'POST',
        header: {
          Authorization: token,
          'Content-Type': 'application/json'
        },
        data: formData.value
      })
      if (res.data.status === 'success') {
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        })
        // 重新获取最新数据
        fetchArtistInfo()
      } else {
        uni.showToast({
          title: res.data.msg || '保存失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('保存创作者信息失败:', error)
      uni.showToast({
        title: '网络请求失败',
        icon: 'none'
      })
    } finally {
      uni.hideLoading()
    }
  }
  
  // 页面加载时获取数据
  onMounted(() => {
    fetchArtistInfo()
	uni.setNavigationBarTitle({
		title: "妆师毛娘信息设置"
	})
  })
</script>

<style lang="less" scoped>
  .container {
    padding: 20rpx;
    background: linear-gradient(135deg, #f5fbff, #e6f2ff);
    min-height: 100vh;
  }

  /* 标签栏样式 */
  .tabs {
    display: flex;
    margin-bottom: 20rpx;
    background: white;
    border-radius: 16rpx;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .tab-item {
    flex: 1;
    text-align: center;
    padding: 24rpx 0;
    font-size: 30rpx;
    color: #666;
    position: relative;
    transition: all 0.3s ease;

    &.active {
      color: #4a90e2;
      font-weight: 500;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60%;
        height: 6rpx;
        background: linear-gradient(90deg, #8fecff, #c1ddff);
        border-radius: 3rpx;
        transition: all 0.3s ease;
      }
    }
  }

  
  /* 表单容器样式 */
  .form-container {
    background: white;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 4rpx 12rpx rgba(143, 236, 255, 0.2);
    transition: all 0.3s ease;
  }

  .form-section {
    margin-bottom: 30rpx;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .section-title {
    font-size: 28rpx;
    color: #333;
    margin-bottom: 15rpx;
    font-weight: 500;
  }

  /* 选择器样式 */
  .picker {
    background-color: #f8f8f8;
    border-radius: 12rpx;
    padding: 20rpx;
    font-size: 28rpx;
    transition: all 0.3s ease;
  }

  .picker-text {
    color: #333;
  }

  /* 输入框样式 */
  .input-container {
    display: flex;
    align-items: center;
    background-color: #f8f8f8;
    border-radius: 12rpx;
    padding: 0 20rpx;
    transition: all 0.3s ease;
  }

  .input {
    flex: 1;
    height: 80rpx;
    font-size: 28rpx;
    color: #333;
    transition: all 0.3s ease;
  }

  .input-symbol {
    margin-right: 10rpx;
    color: #666;
    font-size: 28rpx;
  }

  /* 展示作品样式 */
  .highlight-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20rpx;
  }

  .highlight-item {
    position: relative;
    border-radius: 16rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
    aspect-ratio: 1/1; /* 保持正方形 */
  }

  .highlight-img {
    width: 100%;
    height: 100%;
  }

  .highlight-actions {
    position: absolute;
    bottom: 0;
    right: 0;
    padding: 10rpx;
    background-color: rgba(0, 0, 0, 0.5);
    border-top-left-radius: 16rpx;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .add-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #171e22;
    border-radius: 16rpx;
    aspect-ratio: 1/1; /* 保持正方形 */
    transition: all 0.3s ease;
    
    &:active {
      background-color: #2a3a42;
    }
  }

  /* 上传进度提示 */
  .upload-progress {
    margin-top: 20rpx;
    padding: 20rpx;
    background-color: #f5f5f5;
    border-radius: 12rpx;
    
    progress {
      width: 100%;
      margin-bottom: 10rpx;
    }
    
    text {
      display: block;
      text-align: center;
      font-size: 24rpx;
      color: #666;
    }
  }

  /* 文本域样式 */
  .textarea {
    width: 100%;
    height: 200rpx;
    background-color: #f8f8f8;
    border-radius: 12rpx;
    padding: 20rpx;
    font-size: 28rpx;
    color: #333;
    box-sizing: border-box;
    transition: all 0.3s ease;
  }

  /* 保存按钮样式 */
  .save-btn {
    background: linear-gradient(135deg, #8fecff, #c1ddff);
    color: #2c3e50;
    text-align: center;
    padding: 24rpx;
    border-radius: 16rpx;
    font-size: 32rpx;
    font-weight: 500;
    margin-top: 40rpx;
    box-shadow: 0 4rpx 12rpx rgba(143, 236, 255, 0.3);
    transition: all 0.3s ease;

    &:active {
      transform: scale(0.98);
      opacity: 0.9;
    }
  }

  /* 响应式调整 */
  @media (max-width: 600rpx) {
    .highlight-list {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .identity-item {
      flex-direction: column;
      align-items: flex-start;
    }

    .identity-status {
      margin-left: 0;
      margin-top: 10rpx;
    }
  }
  
  .upload-btn {
    width: 200rpx;
    height: 200rpx;
    border: 2rpx dashed #ddd;
    border-radius: 12rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: #f9f9f9;
    
    .upload-text {
      font-size: 24rpx;
      color: #999;
      margin-top: 10rpx;
    }
  }
  
</style>
