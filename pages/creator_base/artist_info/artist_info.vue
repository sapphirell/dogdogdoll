<template>
  <view class="container">
    <!-- 顶部标签栏 -->
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
        <view class="section-title">最近的接单方式</view>
        <picker class="picker" mode="selector" :range="statusOptions" range-key="label"
          :value="artistStatusIndex" @change="onArtistStatusChange">
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
          <input class="input" type="digit" v-model="formData.overload_ratio_of_artist" placeholder="请输入钞能力系数" />
          <text class="input-symbol">倍</text>
        </view>
      </view>

      <view class="form-section">
        <view class="section-title">站外联系方式</view>
        <view class="input-container">
          <input class="input" type="text" v-model="formData.contact" placeholder="请输入联系方式，例如【闲鱼：xxx】" />
        </view>
      </view>

      <!-- 可接妆面类型（使用 uni-app switch） -->
      <view class="form-section">
        <view class="section-title">可接妆面类型</view>
        <view class="switch-row">
          <text class="switch-label">二次元妆面</text>
          <switch :checked="formData.accept_2d_faceup === 1" @change="onSwitch2D" color="#74bfff" />
        </view>
        <view class="switch-row">
          <text class="switch-label">三次元妆面</text>
          <switch :checked="formData.accept_3d_faceup === 1" @change="onSwitch3D" color="#74bfff" />
        </view>
      </view>

      <view class="form-section">
        <view class="section-title">置顶展示图</view>
        <view class="highlight-list">
          <view v-for="(image, index) in formData.artist_highlight_images" :key="index" class="highlight-item">
            <image class="highlight-img" :src="image" mode="aspectFill"
              @click="previewImage(image, formData.artist_highlight_images)"></image>
            <view class="highlight-actions">
              <uni-icons type="trash" size="24" color="#ff4d6a" @click.stop="removeArtistImage(index)"></uni-icons>
            </view>
          </view>

          <!-- 上传按钮（妆师） -->
          <view class="upload-btn" v-if="formData.artist_highlight_images.length < 9" @click="chooseArtistImage">
            <uni-icons type="plus" size="32" color="#999"></uni-icons>
            <text class="upload-text">添加图片</text>
          </view>
        </view>

        <!-- 上传进度提示 -->
        <view class="upload-progress" v-if="artistUploading">
          <progress :percent="artistUploadProgress" stroke-width="4" activeColor="#4a9db5" />
          <text>{{ artistUploadStatusText }}</text>
        </view>
      </view>

      <view class="form-section">
        <view class="section-title">细则说明</view>
        <textarea class="textarea textarea-long" v-model="formData.rule_of_artist" placeholder="请输入妆师细则说明"></textarea>
      </view>
    </view>

    <!-- 毛娘设置 -->
    <view v-if="activeTab === 'hairstylist'" class="form-container">
      <view class="form-section">
        <view class="section-title">最近的接单方式</view>
        <picker class="picker" mode="selector" :range="statusOptions" range-key="label"
          :value="hairstylistStatusIndex" @change="onHairstylistStatusChange">
          <view class="picker-text">{{ statusOptions[hairstylistStatusIndex].label }}</view>
        </picker>
      </view>

      <view class="form-section">
        <view class="section-title">基础价格</view>
        <view class="input-container">
          <text class="input-symbol">¥</text>
          <input class="input" type="digit" v-model="formData.base_price_of_hairstylist" placeholder="请输入基础价格" />
        </view>
      </view>

      <view class="form-section">
        <view class="section-title">钞能力系数</view>
        <view class="input-container">
          <input class="input" type="digit" v-model="formData.overload_ratio_of_hairstylist" placeholder="请输入钞能力系数" />
          <text class="input-symbol">倍</text>
        </view>
      </view>

      <view class="form-section">
        <view class="section-title">站外联系方式</view>
        <view class="input-container">
          <input class="input" type="text" v-model="formData.contact" placeholder="请输入联系方式，例如【闲鱼：xxx】" />
        </view>
      </view>

      <view class="form-section">
        <view class="section-title">置顶展示图</view>
        <view class="highlight-list">
          <view v-for="(image, index) in formData.hairstylist_highlight_images" :key="index" class="highlight-item">
            <image class="highlight-img" :src="image" mode="aspectFill"
              @click="previewImage(image, formData.hairstylist_highlight_images)"></image>
            <view class="highlight-actions">
              <uni-icons type="trash" size="24" color="#ff4d6a" @click.stop="removeHairstylistImage(index)"></uni-icons>
            </view>
          </view>

          <!-- 上传按钮（毛娘，同步为妆师样式） -->
          <view class="upload-btn" v-if="formData.hairstylist_highlight_images.length < 9" @click="chooseHairstylistImage">
            <uni-icons type="plus" size="32" color="#999"></uni-icons>
            <text class="upload-text">添加图片</text>
          </view>
        </view>

        <!-- 上传进度提示 -->
        <view class="upload-progress" v-if="hairstylistUploading">
          <progress :percent="hairstylistUploadProgress" stroke-width="4" activeColor="#4a9db5" />
          <text>{{ hairstylistUploadStatusText }}</text>
        </view>
      </view>

      <view class="form-section">
        <view class="section-title">细则说明</view>
        <textarea class="textarea textarea-long" v-model="formData.rule_of_hairstylist" placeholder="请输入毛娘细则说明"></textarea>
      </view>
    </view>

    <!-- 保存按钮（字体为白色） -->
    <view class="save-btn" @click="saveSettings">保存设置</view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { websiteUrl } from '@/common/config.js'
import { chooseImageList, getQiniuToken, uploadImageToQiniu } from '@/common/image.js'

const activeTab = ref('artist')

// 表单数据（包含 accept_2d_faceup / accept_3d_faceup）
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
  accept_2d_faceup: 0,
  accept_3d_faceup: 0
})

// 状态选项
const statusOptions = ref([
  { label: '请选择状态', value: 0 },
  { label: '长期接单', value: 1 },
  { label: '限时手速投递', value: 2 },
  { label: '限时抽选投递', value: 3 },
  { label: '限时黑箱卡投递', value: 4 },
  { label: '关闭投递', value: 9 }
])

// 上传状态
const artistUploading = ref(false)
const artistUploadProgress = ref(0)
const artistUploadStatusText = ref('')

const hairstylistUploading = ref(false)
const hairstylistUploadProgress = ref(0)
const hairstylistUploadStatusText = ref('')

// 索引
const artistStatusIndex = computed(() =>
  Math.max(0, statusOptions.value.findIndex(item => item.value === formData.value.status_of_artist))
)
const hairstylistStatusIndex = computed(() =>
  Math.max(0, statusOptions.value.findIndex(item => item.value === formData.value.status_of_hairstylist))
)

// 切换标签页
const switchTab = (tab) => { activeTab.value = tab }

// 预览图片
const previewImage = (url, urls) => { uni.previewImage({ current: url, urls }) }

// 状态改变
const onArtistStatusChange = (e) => {
  const index = Number(e.detail.value)
  formData.value.status_of_artist = statusOptions.value[index].value
}
const onHairstylistStatusChange = (e) => {
  const index = Number(e.detail.value)
  formData.value.status_of_hairstylist = statusOptions.value[index].value
}

// switch 切换（转为 0/1）
const onSwitch2D = (e) => { formData.value.accept_2d_faceup = e.detail.value ? 1 : 0 }
const onSwitch3D = (e) => { formData.value.accept_3d_faceup = e.detail.value ? 1 : 0 }

// 选择妆师图片
const chooseArtistImage = async () => {
  try {
    const maxCount = 9 - formData.value.artist_highlight_images.length
    if (maxCount <= 0) return uni.showToast({ title: '最多只能上传9张图片', icon: 'none' })
    const tempFilePaths = await chooseImageList(maxCount)
    artistUploading.value = true
    artistUploadProgress.value = 0
    artistUploadStatusText.value = '准备上传...'

    for (let i = 0; i < tempFilePaths.length; i++) {
      try {
        const filePath = tempFilePaths[i]
        artistUploadStatusText.value = `获取上传凭证 (${i + 1}/${tempFilePaths.length})`
        const tk = await getQiniuToken()
        if (!tk?.token) throw new Error('获取上传凭证失败')
        artistUploadProgress.value = Math.round((i / tempFilePaths.length) * 100)
        artistUploadStatusText.value = `上传中 (${i + 1}/${tempFilePaths.length})`
        const result = await uploadImageToQiniu(filePath, tk.token, tk.path)
        if (result?.imageUrl) formData.value.artist_highlight_images.push(result.imageUrl)
      } catch (err) {
        uni.showToast({ title: `第 ${i + 1} 张上传失败`, icon: 'none' })
      }
    }
    uni.showToast({ title: '上传成功', icon: 'success' })
  } catch (error) {
    uni.showToast({ title: '上传失败', icon: 'none' })
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
        uni.showToast({ title: '删除成功', icon: 'success' })
      }
    }
  })
}

// 选择毛娘图片
const chooseHairstylistImage = async () => {
  try {
    const maxCount = 9 - formData.value.hairstylist_highlight_images.length
    if (maxCount <= 0) return uni.showToast({ title: '最多只能上传9张图片', icon: 'none' })
    const tempFilePaths = await chooseImageList(maxCount)
    hairstylistUploading.value = true
    hairstylistUploadProgress.value = 0
    hairstylistUploadStatusText.value = '准备上传...'

    for (let i = 0; i < tempFilePaths.length; i++) {
      try {
        const filePath = tempFilePaths[i]
        hairstylistUploadStatusText.value = `获取上传凭证 (${i + 1}/${tempFilePaths.length})`
        const tk = await getQiniuToken()
        if (!tk?.token) throw new Error('获取上传凭证失败')
        hairstylistUploadProgress.value = Math.round((i / tempFilePaths.length) * 100)
        hairstylistUploadStatusText.value = `上传中 (${i + 1}/${tempFilePaths.length})`
        const result = await uploadImageToQiniu(filePath, tk.token, tk.path)
        if (result?.imageUrl) formData.value.hairstylist_highlight_images.push(result.imageUrl)
      } catch (err) {
        uni.showToast({ title: `第 ${i + 1} 张上传失败`, icon: 'none' })
      }
    }
    uni.showToast({ title: '上传成功', icon: 'success' })
  } catch (error) {
    uni.showToast({ title: '上传失败', icon: 'none' })
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
        uni.showToast({ title: '删除成功', icon: 'success' })
      }
    }
  })
}

// 获取创作者信息
const fetchArtistInfo = async () => {
  const token = uni.getStorageSync('token')
  if (!token) return uni.showToast({ title: '请先登录', icon: 'none' })
  uni.showLoading({ title: '加载中...' })
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/brand-manager/get-artist-info`,
      method: 'GET',
      header: { Authorization: token }
    })
    if (res.data.status === 'success') {
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
        // 新字段回填（后端若未返回则默认为 0）
        accept_2d_faceup: Number(data.accept_2d_faceup ?? 0),
        accept_3d_faceup: Number(data.accept_3d_faceup ?? 0)
      }
    } else {
      uni.showToast({ title: res.data.msg || '获取信息失败', icon: 'none' })
    }
  } catch (error) {
    uni.showToast({ title: '网络请求失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

// 保存设置
const saveSettings = async () => {
  const token = uni.getStorageSync('token')
  if (!token) return uni.showToast({ title: '请先登录', icon: 'none' })

  uni.showLoading({ title: '保存中...' })
  try {
    formData.value.base_price_of_artist = parseFloat(formData.value.base_price_of_artist)
    const res = await uni.request({
      url: `${websiteUrl.value}/brand-manager/update-artist-info`,
      method: 'POST',
      header: { Authorization: token, 'Content-Type': 'application/json' },
      data: formData.value
    })
    if (res.data.status === 'success') {
      uni.showToast({ title: '保存成功', icon: 'success' })
      fetchArtistInfo()
    } else {
      uni.showToast({ title: res.data.msg || '保存失败', icon: 'none' })
    }
  } catch (error) {
    uni.showToast({ title: '网络请求失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

onMounted(() => {
  fetchArtistInfo()
  uni.setNavigationBarTitle({ title: "妆师毛娘信息设置" })
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
.form-section { margin-bottom: 30rpx; }
.form-section:last-child { margin-bottom: 0; }

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
.picker-text { color: #333; }

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
.input-symbol { margin-right: 10rpx; color: #666; font-size: 28rpx; }

/* switch 行样式 */
.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18rpx 22rpx;
  background: #f8fafc;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
}
.switch-label {
  font-size: 28rpx;
  color: #374151;
}

/* 展示图网格 */
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
  aspect-ratio: 1/1;
}
.highlight-img { width: 100%; height: 100%; }
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

/* 统一上传按钮 */
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
  .upload-text { font-size: 24rpx; color: #999; margin-top: 10rpx; }
}

/* 上传进度提示 */
.upload-progress {
  margin-top: 20rpx;
  padding: 20rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  progress { width: 100%; margin-bottom: 10rpx; }
  text { display: block; text-align: center; font-size: 24rpx; color: #666; }
}

/* 文本域样式（高度延长） */
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
.textarea-long { height: 360rpx; }

/* 保存按钮（白字） */
.save-btn {
  background: linear-gradient(135deg, #8fecff, #74bfff);
  color: #fff;
  text-align: center;
  padding: 24rpx;
  border-radius: 16rpx;
  font-size: 32rpx;
  font-weight: 500;
  margin-top: 40rpx;
  box-shadow: 0 4rpx 12rpx rgba(116, 191, 255, 0.3);
  transition: all 0.3s ease;
  &:active { transform: scale(0.98); opacity: 0.9; }
}

/* 响应式 */
@media (max-width: 600rpx) {
  .highlight-list { grid-template-columns: repeat(2, 1fr); }
}
</style>
