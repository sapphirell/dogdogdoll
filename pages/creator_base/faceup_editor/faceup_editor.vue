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
        
        <!-- 头型名称 - 使用关联搜索组件 -->
        <view class="form-item">
          <text class="label">头型名称</text>
          <view class="relation-picker-trigger" @click="showRelationPicker = true">
            <text v-if="form.head_name" class="selected-value">{{ form.head_name }}</text>
            <text v-else class="placeholder">请选择头型</text>
            <uni-icons type="arrowright" size="16" color="#999"></uni-icons>
          </view>
        </view>
        
        <!-- 关联商品ID - 隐藏但保留数据 -->
        <input 
          v-model="form.goods_id" 
          type="hidden"
		  style="visibility: hidden;"
        />
        
        <!-- 性别 -->
        <view class="form-item">
          <text class="label">性别</text>
          <radio-group class="radio-group" @change="handleSexChange">
            <label class="radio-label">
              <radio value="男" :checked="form.sex === '男'" color="#8fecff" />
              <text>男</text>
            </label>
            <label class="radio-label">
              <radio value="女" :checked="form.sex === '女'" color="#ffc3c6" />
              <text>女</text>
            </label>
          </radio-group>
        </view>
        
        <!-- 风格标签 - 使用级联多选组件 -->
        <view class="form-item">
          <view class="tag-header">
            <text class="label">风格标签</text>
            <view class="tag-selector-btn" @click="showTagPopup = true">
              <text>管理风格标签</text>
              <uni-icons type="arrowdown" size="16" color="#666"></uni-icons>
            </view>
          </view>
          <view class="tags-container">
            <view 
              v-for="(tagId, index) in form.styles_tags" 
              :key="index" 
              class="tag-item"
            >
              <text>{{ styleTags[tagId] }}</text>
              <uni-icons 
                type="close" 
                size="16" 
                color="#999" 
                @click="removeTag(tagId)"
              ></uni-icons>
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
            <!-- 已上传图片预览 -->
            <view 
              v-for="(img, index) in form.face_up_image_urls" 
              :key="index" 
              class="image-preview"
            >
              <image :src="img" mode="aspectFill" class="preview-img"></image>
              <view class="image-actions">
                <uni-icons 
                  type="eye" 
                  size="20" 
                  color="#fff" 
                  @click="previewImage(img)"
                ></uni-icons>
                <uni-icons 
                  type="trash" 
                  size="20" 
                  color="#fff" 
                  @click="removeImage(index)"
                ></uni-icons>
              </view>
            </view>
            
            <!-- 上传按钮 -->
            <view 
              class="upload-btn" 
              @click="handleUploadImage"
              v-if="form.face_up_image_urls.length < 9"
            >
              <uni-icons type="plus" size="32" color="#999"></uni-icons>
              <text class="upload-text">添加图片</text>
            </view>
          </view>
          
          <!-- 上传进度提示 -->
          <view class="upload-progress" v-if="uploading">
            <progress 
              :percent="uploadProgress" 
              stroke-width="4" 
              activeColor="#4a9db5"
            />
            <text>{{ uploadStatusText }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 底部操作按钮 -->
    <view class="form-footer">
      <button class="btn cancel" @click="handleCancel">取消</button>
      <button class="btn submit" @click="handleSubmit">{{ isEdit ? '保存修改' : '添加妆面' }}</button>
    </view>
    
    <!-- 风格标签选择弹窗 - 使用级联多选组件 -->
    <cascade-multi-select 
      :show="showTagPopup"
      :sizeData="tagSizeData"
      :initialSelection="initialTagSelection"
      @close="showTagPopup = false"
      @confirm="handleTagConfirm"
      title="选择风格标签"
    />
    
    <!-- 关联搜索组件 -->
    <relation-picker 
      :visible="showRelationPicker" 
      @update:visible="showRelationPicker = $event"
      @confirm="handleRelationConfirm"
      @cancel="showRelationPicker = false"
      hide-type="true"
    />
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { chooseImageList, getQiniuToken, uploadImageToQiniu } from '@/common/image.js';
import { websiteUrl } from '@/common/config.js';

// 表单数据
const isEdit = ref(false);
const form = ref({
  id: 0,
  title: '',
  head_name: '',
  goods_id: '',
  sex: '男',
  styles_tags: [], // 存储标签ID数组
  face_up_image_urls: [] // 图片URL数组
});

// 关联搜索
const showRelationPicker = ref(false);

// 风格标签
const styleTags = ref({});
const showTagPopup = ref(false);
const tagSizeData = ref({}); // 级联选择器所需的数据格式
const initialTagSelection = ref([]); // 初始选中的标签

// 上传状态
const uploading = ref(false);
const uploadProgress = ref(0);
const uploadStatusText = ref('');

// 页面加载时获取编辑数据和风格标签
onLoad(async (options) => {
  // 获取风格标签
  await fetchStyleTags();
  
  if (options.id) {
    isEdit.value = true;
    fetchFaceupDetail(options.id);
  }
  
  uni.setNavigationBarTitle({
  	title: isEdit ? '编辑妆面' : '添加新妆面' 
  })
});

// 获取风格标签
const fetchStyleTags = async () => {
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/bjd-faceup-style-tags`,
      method: 'GET'
    });
    
    if (res.data.status === 'success') {
      styleTags.value = res.data.data;
      
      // 为级联选择器准备数据
      tagSizeData.value = {
        '风格标签': Object.values(styleTags.value)
      };
    }
  } catch (error) {
    console.error('获取风格标签失败:', error);
    uni.showToast({
      title: '获取风格标签失败',
      icon: 'none'
    });
  }
};

// 获取妆面详情
const fetchFaceupDetail = async (id) => {
  try {
    uni.showLoading({ title: '加载中...' });
    const res = await uni.request({
      url: `${websiteUrl.value}/faceup/detail?id=${id}`,
      method: 'GET'
    });
    
    if (res.data.status === 'success') {
      const data = res.data.data;
      form.value = {
        id: data.id,
        title: data.title,
        head_name: data.head_name,
        goods_id: data.goods_id,
        sex: data.sex === 1 ? '男' : '女',
        styles_tags: data.styles_tags ? data.styles_tags.split(',').filter(Boolean) : [],
        
        // 修复图片字段处理 - 优先使用 images 数组，如果不存在则使用 face_up_image_urls 拆分
        face_up_image_urls: data.images || (data.face_up_image_urls ? data.face_up_image_urls.split(',') : [])
      };
      
      // 设置初始选中的标签
      initialTagSelection.value = form.value.styles_tags.map(tagId => {
        return {
          category: '风格标签',
          size: styleTags.value[tagId]
        };
      });
    } else {
      uni.showToast({ title: res.data.msg, icon: 'none' });
    }
  } catch (error) {
    console.log(error);
    uni.showToast({ title: '获取妆面详情失败', icon: 'none' });
  } finally {
    uni.hideLoading();
  }
};

// 处理关联搜索确认
const handleRelationConfirm = (result) => {
  // 处理模糊模式
  if (result.isFuzzy) {
    form.value.head_name = result.goods.name;
    form.value.goods_id = result.goods.id || '';
  } 
  // 处理精确模式
  else {
    form.value.head_name = result.goods.name;
    form.value.goods_id = result.goods.id || '';
  }
  
  showRelationPicker.value = false;
};

// 性别选择
const handleSexChange = (e) => {
  form.value.sex = e.detail.value;
};

// 移除标签
const removeTag = (tagId) => {
  const index = form.value.styles_tags.indexOf(tagId);
  if (index > -1) {
    form.value.styles_tags.splice(index, 1);
  }
};

// 处理标签选择确认
const handleTagConfirm = (selectedItems) => {
  // 将选中的标签转换为ID
  const selectedIds = selectedItems.map(item => {
    // 找到标签名对应的ID
    const tagName = item.size;
    for (const [id, name] of Object.entries(styleTags.value)) {
      if (name === tagName) return id;
    }
    return null;
  }).filter(id => id !== null);
  
  form.value.styles_tags = selectedIds;
  showTagPopup.value = false;
};

// 处理图片上传
const handleUploadImage = async () => {
  try {
    // 计算还能上传几张图片
    const remaining = 9 - form.value.face_up_image_urls.length;
    if (remaining <= 0) {
      uni.showToast({ title: '最多只能上传9张图片', icon: 'none' });
      return;
    }

    // 选择图片
    const tempFilePaths = await chooseImageList(remaining);
    if (!tempFilePaths || tempFilePaths.length === 0) return;

    // 开始上传
    uploading.value = true;
    uploadStatusText.value = '准备上传...';

    // 获取七牛云token
    uploadStatusText.value = '获取上传凭证...';
    const qiniuTokenData = await getQiniuToken();
    if (!qiniuTokenData || !qiniuTokenData.token) {
      throw new Error('获取上传凭证失败');
    }

    // 上传所有图片
    for (let i = 0; i < tempFilePaths.length; i++) {
      try {
        const filePath = tempFilePaths[i];
        
        // 更新上传状态
        uploadStatusText.value = `上传中 (${i+1}/${tempFilePaths.length})`;
        uploadProgress.value = (i / tempFilePaths.length) * 100;

        // 使用七牛云返回的path作为文件名
        const fileName = qiniuTokenData.path;

        // 上传到七牛云
        const result = await uploadImageToQiniu(
          filePath,
          qiniuTokenData.token,
          fileName
        );

        if (result && result.imageUrl) {
          // 添加到图片列表
          form.value.face_up_image_urls.push(result.imageUrl);
          uploadProgress.value = ((i + 1) / tempFilePaths.length) * 100;
        }
      } catch (error) {
        console.error(`第 ${i+1} 张图片上传失败:`, error);
        uni.showToast({
          title: `第 ${i+1} 张图片上传失败`,
          icon: 'none'
        });
      }
    }

    uni.showToast({
      title: `成功上传${tempFilePaths.length}张图片`,
      icon: 'success'
    });
  } catch (error) {
    console.error('上传图片失败:', error);
    uni.showToast({
      title: '上传图片失败',
      icon: 'none'
    });
  } finally {
    uploading.value = false;
    uploadProgress.value = 0;
  }
};

// 预览图片
const previewImage = (url) => {
  uni.previewImage({
    current: url,
    urls: form.value.face_up_image_urls
  });
};

// 删除图片
const removeImage = (index) => {
  uni.showModal({
    title: '提示',
    content: '确定要删除这张图片吗？',
    success: (res) => {
      if (res.confirm) {
        form.value.face_up_image_urls.splice(index, 1);
        uni.showToast({
          title: '已删除',
          icon: 'success'
        });
      }
    }
  });
};

// 提交表单
const handleSubmit = async () => {
  // 表单验证
  if (!form.value.title) {
    uni.showToast({ title: '请输入妆面标题', icon: 'none' });
    return;
  }
  
  if (!form.value.head_name) {
    uni.showToast({ title: '请选择头型名称', icon: 'none' });
    return;
  }
  
  if (!form.value.goods_id) {
    uni.showToast({ title: '请选择关联商品', icon: 'none' });
    return;
  }
  
  if (form.value.face_up_image_urls.length === 0) {
    uni.showToast({ title: '请至少上传一张图片', icon: 'none' });
    return;
  }
  
  try {
    uni.showLoading({ title: '提交中...' });
    
    // 准备提交数据
    const submitData = {
      id: form.value.id,
      title: form.value.title,
      head_name: form.value.head_name,
      goods_id: form.value.goods_id,
      sex: form.value.sex === '男' ? 1 : 2,
      styles_tags: form.value.styles_tags.join(','),
      face_up_image_urls: form.value.face_up_image_urls.join(','),
    };
    
    const apiUrl = isEdit.value 
      ? `${websiteUrl.value}/brand-manager/faceup/update`
      : `${websiteUrl.value}/brand-manager/faceup/add`;
	  
	  const token = uni.getStorageSync('token');
	  if (!token) {
	  	error.value = '未登录，请先登录';
	  	loading.value = false;
	  	loadStatus.value = 'more';
	  	return;
	  }
      
    const res = await uni.request({
      url: apiUrl,
      method: 'POST',
      data: submitData,
      header: {
        'Content-Type': 'application/json',
		'Authorization': token
      }
    });
    
    if (res.data.status === 'success') {
      uni.showToast({
        title: isEdit.value ? '更新成功' : '添加成功',
        icon: 'success'
      });
      
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    } else {
      uni.showToast({
        title: res.data.msg || '提交失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('提交失败:', error);
    uni.showToast({
      title: '提交失败',
      icon: 'none'
    });
  } finally {
    uni.hideLoading();
  }
};

// 取消
const handleCancel = () => {
  uni.navigateBack();
};
</script>

<style lang="less">
.faceup-form-container {
  padding: 20rpx;
  background-color: #f8f8f8;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.form-header {
  padding: 20rpx 0;
  text-align: center;
  
  .title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
  }
}

.form-scroll {
  flex: 1;
  padding-bottom: 20rpx;
}

.form-body {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.form-item {
  margin-bottom: 30rpx;
  
  .label {
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
    margin-bottom: 12rpx;
    display: block;
  }
  
  .hint {
    font-size: 24rpx;
    color: #999;
    margin-bottom: 12rpx;
    display: block;
  }
  
  /* 修复输入框padding问题 */
  .input {
    border: 1rpx solid #eee;
    border-radius: 8rpx;
    padding: 16rpx 20rpx; /* 增加左右padding */
    font-size: 28rpx;
    background-color: #fafafa;
    width: 100%;
    box-sizing: border-box;
    height: 80rpx; /* 固定高度确保内容可见 */
    line-height: 48rpx; /* 调整行高 */
  }
}

.radio-group {
  display: flex;
  gap: 40rpx;
  
  .radio-label {
    display: flex;
    align-items: center;
    font-size: 28rpx;
    
    text {
      margin-left: 8rpx;
    }
  }
}

/* 关联搜索触发样式 */
.relation-picker-trigger {
  border: 1rpx solid #eee;
  border-radius: 8rpx;
  padding: 16rpx 20rpx; /* 增加左右padding */
  background-color: #fafafa;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80rpx; /* 固定高度 */
  
  .selected-value {
    font-size: 28rpx;
    color: #333;
  }
  
  .placeholder {
    font-size: 28rpx;
    color: #999;
  }
}

/* 风格标签头部样式 */
.tag-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

/* 标签选择器样式 */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  min-height: 60rpx;
  padding: 10rpx;
  border: 1rpx solid #eee;
  border-radius: 8rpx;
  background-color: #fafafa;
  
  .tag-item {
    background-color: #f5f5f5;
    border-radius: 20rpx;
    padding: 8rpx 16rpx;
    display: flex;
    align-items: center;
    gap: 6rpx;
    
    text {
      font-size: 24rpx;
      color: #666;
    }
  }
  
  .no-tags-hint {
    font-size: 26rpx;
    color: #999;
    padding: 8rpx;
  }
}

.tag-selector-btn {
  border: 1rpx solid #eee;
  border-radius: 8rpx;
  padding: 12rpx 16rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  background-color: #f8f8f8;
  
  text {
    font-size: 26rpx;
    color: #666;
  }
}

/* 图片上传区域样式 */
.upload-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-top: 20rpx;
}

.image-preview {
  width: 200rpx;
  height: 200rpx;
  border-radius: 12rpx;
  overflow: hidden;
  position: relative;
  
  .preview-img {
    width: 100%;
    height: 100%;
  }
  
  .image-actions {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: space-around;
    padding: 12rpx 0;
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

.form-footer {
  display: flex;
  gap: 20rpx;
  padding: 20rpx;
  background-color: #fff;
  position: sticky;
  bottom: 0;
  
  .btn {
    flex: 1;
    border-radius: 40rpx;
    font-size: 28rpx;
    padding: 20rpx 0;
    &::after {
		border: none;
	}
    &.cancel {
      background-color: #f5f5f5;
      color: #666;
    }
    
    &.submit {
          background: linear-gradient(135deg, #8fecff, #c1ddff);
          color: #2c3e50;
    }
  }
}
</style>
