<template>
  <view class="faceup-form-container">
    <scroll-view class="form-scroll" scroll-y>
      <view class="form-body">
        <!-- 标题 -->
        <view class="form-item">
          <text class="label">妆面标题</text>
          <input
            class="input"
            v-model="form.title"
            placeholder="请输入妆面标题"
            maxlength="50"
          />
        </view>

        <!-- 头型名称（品牌→商品，可选） -->
        <view class="form-item">
          <text class="label">头型名称（可选）</text>
          <view class="relation-picker-trigger" @click="goPickHead">
            <view class="rp-left">
              <image v-if="selectedGoods.cover" :src="selectedGoods.cover" mode="aspectFill" class="thumb" />
              <view class="rp-texts">
                <text v-if="form.head_name" class="selected-value">{{ form.head_name }}</text>
                <text v-else class="placeholder">可选择头型（先选品牌再选商品）</text>
                <text v-if="selectedBrand.brand_name" class="sub">{{ selectedBrand.brand_name }}</text>
              </view>
            </view>
            <uni-icons type="arrowright" size="16" color="#999"></uni-icons>
          </view>
        </view>

        <!-- 关联商品ID（隐藏，可选） -->
        <input v-model="form.goods_id" type="hidden" style="visibility:hidden;" />

        <!-- 性别 -->
        <view class="form-item">
          <text class="label">性别</text>
          <radio-group class="radio-group" @change="handleSexChange">
            <label class="radio-label">
              <radio value="男" :checked="form.sex==='男'" color="#8fecff" />
              <text>男</text>
            </label>
            <label class="radio-label">
              <radio value="女" :checked="form.sex==='女'" color="#ffc3c6" />
              <text>女</text>
            </label>
          </radio-group>
        </view>

        <!-- 风格标签 -->
        <view class="form-item">
          <view class="tag-header">
            <text class="label">风格标签</text>
            <view class="tag-selector-btn" @click="showTagPopup = true">
              <text>管理风格标签</text>
              <uni-icons type="arrowdown" size="16" color="#666"></uni-icons>
            </view>
          </view>
          <view class="tags-container">
            <view v-for="(tagId, idx) in form.styles_tags" :key="idx" class="tag-item">
              <text>{{ styleTags[tagId] }}</text>
              <uni-icons type="close" size="16" color="#999" @click="removeTag(tagId)"></uni-icons>
            </view>
            <view v-if="form.styles_tags.length === 0" class="no-tags-hint">
              <text>未选择风格标签</text>
            </view>
          </view>
        </view>

        <!-- 图片上传 -->
        <view class="form-item">
          <text class="label">妆面图片</text>
          <text class="hint">请上传清晰的妆面图片，最多9张</text>

          <view class="upload-container">
            <view v-for="(img, index) in form.face_up_image_urls" :key="index" class="image-preview">
              <image :src="img" mode="aspectFill" class="preview-img"></image>
              <view class="image-actions">
                <uni-icons type="eye" size="20" color="#fff" @click="previewImage(img)"></uni-icons>
                <uni-icons type="trash" size="20" color="#fff" @click="removeImage(index)"></uni-icons>
              </view>
            </view>

            <view class="upload-btn" @click="handleUploadImage" v-if="form.face_up_image_urls.length < 9">
              <uni-icons type="plus" size="32" color="#999"></uni-icons>
              <text class="upload-text">添加图片</text>
            </view>
          </view>

          <view class="upload-progress" v-if="uploading">
            <progress :percent="uploadProgress" stroke-width="4" activeColor="#4a9db5" />
            <text>{{ uploadStatusText }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部操作 -->
    <view class="form-footer">
      <text v-if="isEdit" class="delete-link" @click="handleDelete">删除</text>
      <button class="btn cancel" @click="handleCancel">取消</button>
      <button class="btn submit" @click="handleSubmit">{{ isEdit ? '保存修改' : '添加妆面' }}</button>
    </view>

    <!-- 风格标签选择弹窗 -->
    <cascade-multi-select
      :show="showTagPopup"
      :sizeData="tagSizeData"
      :initialSelection="initialTagSelection"
      @close="showTagPopup = false"
      @confirm="handleTagConfirm"
      title="选择风格标签"
    />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { chooseImageList, getQiniuToken, uploadImageToQiniu } from '@/common/image.js'
import { websiteUrl } from '@/common/config.js'

const isEdit = ref(false)
const form = ref({
  id: 0,
  title: '',
  head_name: '',
  goods_id: '',           // 可选
  sex: '男',
  styles_tags: [],
  face_up_image_urls: []
})

/** 本地已选品牌/商品（展示用，可空） */
const selectedBrand = ref({})
const selectedGoods = ref({})

/** 风格标签 */
const styleTags = ref({})
const showTagPopup = ref(false)
const tagSizeData = ref({})
const initialTagSelection = ref([])

/** 上传状态 */
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadStatusText = ref('')

onLoad(async (options) => {
  await fetchStyleTags()
  if (options.id) {
    isEdit.value = true
    await fetchFaceupDetail(options.id)
  }
  uni.setNavigationBarTitle({
    title: isEdit.value ? '编辑妆面' : '添加新妆面'
  })
})

/** —— 关联选择入口（可选）—— */
function goPickHead () {
  uni.$once('associate:done', (payload) => {
    selectedBrand.value = payload?.brand || {}
    selectedGoods.value = payload?.goods || {}
    form.value.head_name = selectedGoods.value?.name || ''
    form.value.goods_id  = selectedGoods.value?.id   || ''
  })

  uni.navigateTo({
    url: '/pkg-common/brand-pick/brand-pick',
    success(res) {
      res.eventChannel.emit('associate:init', {
        preselect: {
          brand: selectedBrand.value?.id ? selectedBrand.value : null,
          goods: selectedGoods.value?.id ? selectedGoods.value : null
        }
      })
    }
  })
}

/** 获取风格标签 */
async function fetchStyleTags () {
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/bjd-faceup-style-tags`,
      method: 'GET'
    })
    if (res.data.status === 'success') {
      styleTags.value = res.data.data
      tagSizeData.value = { '风格标签': Object.values(styleTags.value) }
    }
  } catch (e) {
    uni.showToast({ title: '获取风格标签失败', icon: 'none' })
  }
}

/** 详情 */
async function fetchFaceupDetail (id) {
  try {
    uni.showLoading({ title: '加载中...' })
    const res = await uni.request({
      url: `${websiteUrl.value}/faceup/detail?id=${id}`,
      method: 'GET'
    })
    if (res.data.status === 'success') {
      const d = res.data.data
      form.value = {
        id: d.id,
        title: d.title,
        head_name: d.head_name || '',
        goods_id: d.goods_id || '',
        sex: d.sex === 1 ? '男' : '女',
        styles_tags: d.styles_tags ? d.styles_tags.split(',').filter(Boolean) : [],
        face_up_image_urls: d.images || (d.face_up_image_urls ? d.face_up_image_urls.split(',') : [])
      }
    } else {
      uni.showToast({ title: res.data.msg || '加载失败', icon: 'none' })
    }
  } finally {
    uni.hideLoading()
  }
}

/** 性别 */
function handleSexChange (e) { form.value.sex = e.detail.value }

/** 标签 */
function removeTag (tagId) {
  const i = form.value.styles_tags.indexOf(tagId)
  if (i > -1) form.value.styles_tags.splice(i, 1)
}
function handleTagConfirm (selectedItems) {
  const names = selectedItems.map(i => i.size)
  const ids = []
  for (const [id, n] of Object.entries(styleTags.value)) {
    if (names.includes(n)) ids.push(id)
  }
  form.value.styles_tags = ids
  showTagPopup.value = false
}

/** 上传 */
async function handleUploadImage () {
  try {
    const remain = 9 - form.value.face_up_image_urls.length
    if (remain <= 0) { uni.showToast({ title: '最多9张', icon: 'none' }); return }
    const files = await chooseImageList(remain)
    if (!files || !files.length) return

    uploading.value = true
    for (let i = 0; i < files.length; i++) {
      uploadStatusText.value = '获取上传凭证...'
      const tk = await getQiniuToken()
      if (!tk?.token) throw new Error('获取上传凭证失败')

      const filePath = files[i]
      uploadStatusText.value = `上传中 (${i + 1}/${files.length})`
      uploadProgress.value = (i / files.length) * 100

      const ret = await uploadImageToQiniu(filePath, tk.token, tk.path)
      if (ret?.imageUrl) {
        form.value.face_up_image_urls.push(ret.imageUrl)
        uploadProgress.value = ((i + 1) / files.length) * 100
      }
    }
    uni.showToast({ title: `成功上传${files.length}张`, icon: 'success' })
  } catch (e) {
    uni.showToast({ title: e?.message || '上传失败', icon: 'none' })
  } finally {
    uploading.value = false
    uploadProgress.value = 0
  }
}

function previewImage (url) {
  uni.previewImage({ current: url, urls: form.value.face_up_image_urls })
}
function removeImage (index) {
  uni.showModal({
    title: '提示',
    content: '确定要删除这张图片吗？',
    success: (res) => {
      if (res.confirm) {
        form.value.face_up_image_urls.splice(index, 1)
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    }
  })
}

/** 删除（编辑态），id 改为拼接到 URL，并回显后端 msg */
async function handleDelete () {
  if (!isEdit.value) return
  uni.showModal({
    title: '删除确认',
    content: '确定删除该妆面吗？删除后不可恢复',
    success: async (res) => {
      if (!res.confirm) return
      const token = uni.getStorageSync('token')
      if (!token) { uni.showToast({ title: '未登录', icon: 'none' }); return }
      try {
        uni.showLoading({ title: '删除中...' })
        const resp = await uni.request({
          // 👇 id 拼接到 URL
          url: `${websiteUrl.value}/brand-manager/faceup/delete?id=${encodeURIComponent(form.value.id)}`,
          method: 'POST', // 若后端支持 DELETE，可改为 method: 'DELETE'
          header: { 'Content-Type': 'application/json', 'Authorization': token }
        })
        if (resp.statusCode >= 200 && resp.statusCode < 300 && resp.data?.status === 'success') {
          uni.showToast({ title: resp.data?.msg || '已删除', icon: 'success' })
          setTimeout(() => uni.navigateBack(), 800)
        } else {
          // 显示后端返回的 msg
          uni.showToast({ title: resp.data?.msg || `删除失败(${resp.statusCode})`, icon: 'none' })
        }
      } catch (e) {
        uni.showToast({ title: e?.message || '删除失败', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    }
  })
}

/** 提交：关联娃头可选；失败时回显后端 msg */
async function handleSubmit () {
  if (!form.value.title?.trim()) {
    return uni.showToast({ title: '请输入妆面标题', icon: 'none' })
  }
  if (!form.value.face_up_image_urls.length) {
    return uni.showToast({ title: '请至少上传一张图片', icon: 'none' })
  }

  try {
    uni.showLoading({ title: '提交中...' })

    // 基础必传
    const submitData = {
      id: form.value.id,
      title: form.value.title.trim(),
      sex: form.value.sex === '男' ? 1 : 2,
      styles_tags: form.value.styles_tags.join(','),                // 可空字符串
      face_up_image_urls: form.value.face_up_image_urls.join(',')   // 至少1张
    }
    // 关联娃头：可选，有就带上，没有就不发这个字段
    if (form.value.head_name?.trim()) submitData.head_name = form.value.head_name.trim()
    if (form.value.goods_id) submitData.goods_id = form.value.goods_id

    const apiUrl = isEdit.value
      ? `${websiteUrl.value}/brand-manager/faceup/update`
      : `${websiteUrl.value}/brand-manager/faceup/add`

    const token = uni.getStorageSync('token')
    if (!token) { uni.showToast({ title: '未登录，请先登录', icon: 'none' }); return }

    const res = await uni.request({
      url: apiUrl,
      method: 'POST',
      data: submitData,
      header: { 'Content-Type': 'application/json', 'Authorization': token }
    })

    // 成功与失败均回显后端 msg
    if (res.statusCode >= 200 && res.statusCode < 300 && res.data?.status === 'success') {
      uni.showToast({ title: res.data?.msg || (isEdit.value ? '更新成功' : '添加成功'), icon: 'success' })
      setTimeout(() => uni.navigateBack(), 1200)
    } else {
      // 典型失败示例：{"data":null,"msg":"参数错误: 缺少id","status":"failed"}
      uni.showToast({ title: res.data?.msg || `提交失败(${res.statusCode})`, icon: 'none' })
    }
  } catch (e) {
    uni.showToast({ title: e?.message || '提交失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

function handleCancel () { uni.navigateBack() }
</script>

<style lang="less" scoped>
.faceup-form-container {
  padding: 20rpx;
  background-color: #f8f8f8;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.form-scroll { flex: 1; padding-bottom: 20rpx; }
.form-body { background:#fff; border-radius:16rpx; padding:20rpx; margin-bottom:20rpx; }

.form-item { margin-bottom: 30rpx;
  .label { font-size: 28rpx; color:#333; font-weight: 500; margin-bottom: 12rpx; display:block; }
  .hint  { font-size: 24rpx; color:#999; margin-bottom: 12rpx; display:block; }
  .input { border:1rpx solid #eee; border-radius:8rpx; padding:16rpx 20rpx; font-size:28rpx; background:#fafafa; width:100%; height:80rpx; line-height:48rpx; box-sizing:border-box; }
}

.radio-group { display:flex; gap:40rpx;
  .radio-label { display:flex; align-items:center; font-size:28rpx; text{ margin-left:8rpx; } }
}

/* 关联选择触发样式 */
.relation-picker-trigger {
  border: 1rpx solid #eee;
  border-radius: 8rpx;
  padding: 16rpx 20rpx;
  background-color: #fafafa;
  display: flex; justify-content: space-between; align-items: center; height: 100rpx;

  .rp-left { display:flex; align-items:center; gap: 16rpx; min-width: 0; }
  .thumb { width: 68rpx; height: 68rpx; border-radius: 10rpx; background:#f0f0f0; }
  .rp-texts { display:flex; flex-direction:column; min-width:0; }
  .selected-value { font-size: 28rpx; color:#333; }
  .placeholder     { font-size: 28rpx; color:#999; }
  .sub { font-size: 22rpx; color:#9aa4b2; margin-top: 4rpx; }
}

.tag-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12rpx; }
.tags-container { display:flex; flex-wrap:wrap; gap:12rpx; min-height:60rpx; padding:10rpx; border:1rpx solid #eee; border-radius:8rpx; background:#fafafa;
  .tag-item { background:#f5f5f5; border-radius:20rpx; padding:8rpx 16rpx; display:flex; align-items:center; gap:6rpx;
    text{ font-size:24rpx; color:#666; }
  }
  .no-tags-hint{ font-size:26rpx; color:#999; padding:8rpx; }
}
.tag-selector-btn{ border:1rpx solid #eee; border-radius:8rpx; padding:12rpx 16rpx; display:flex; align-items:center; gap:8rpx; background:#f8f8f8;
  text{ font-size:26rpx; color:#666; }
}

/* 图片上传 */
.upload-container{ display:flex; flex-wrap:wrap; gap:20rpx; margin-top:20rpx; }
.image-preview{ width:200rpx; height:200rpx; border-radius:12rpx; overflow:hidden; position:relative;
  .preview-img{ width:100%; height:100%; }
  .image-actions{ position:absolute; left:0; right:0; bottom:0; background:rgba(0,0,0,.5); display:flex; justify-content:space-around; padding:12rpx 0; }
}
.upload-btn{ width:200rpx; height:200rpx; border:2rpx dashed #ddd; border-radius:12rpx; display:flex; flex-direction:column; justify-content:center; align-items:center; background:#f9f9f9;
  .upload-text{ font-size:24rpx; color:#999; margin-top:10rpx; }
}
.upload-progress{ margin-top:20rpx; padding:20rpx; background:#f5f5f5; border-radius:12rpx;
  progress{ width:100%; margin-bottom:10rpx; }
  text{ display:block; text-align:center; font-size:24rpx; color:#666; }
}

/* 底部操作：新增“删除”小字 */
.form-footer{
  display:flex; align-items:center; gap:20rpx; padding:20rpx; background:#fff; position:sticky; bottom:0;
  .delete-link{ color:#999; font-size:26rpx; line-height:1; }
  .btn{
    flex:1; border-radius:40rpx; font-size:28rpx; padding:20rpx 0;
    &::after{ border:none; }
    &.cancel{ background:#f5f5f5; color:#666; }
    &.submit{ background:linear-gradient(135deg, #8fecff, #c1ddff); color:#2c3e50; }
  }
}
</style>
