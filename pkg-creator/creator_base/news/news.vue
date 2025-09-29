<template>
  <view class="brand-news-page">
	  <view-logs />
    <!-- 文章列表 -->
    <scroll-view
      class="news-list"
      scroll-y
      :style="{ height: scrollHeight + 'px' }"
      @scrolltolower="loadMore"
    >
      <!-- 加载状态 -->
      <view v-if="loading" class="loading-container">
        <uni-load-more status="loading"></uni-load-more>
      </view>

      <!-- 列表内容 -->
      <view
        v-for="item in newsList"
        :key="item.id"
        class="news-item"
        v-else-if="newsList.length > 0"
      >
        <view class="news-header">
          <view class="header-left">
            <text class="news-title">{{ item.title }}</text>
            <text class="news-time">{{ formatDate(item.created_at * 1000) }}</text>
          </view>
          <view class="action-btns">
            <button class="edit-btn" @click="editNews(item)">编辑</button>
            <button class="delete-btn" @click="confirmDelete(item.id)">删除</button>
          </view>
        </view>

        <!-- 图片区域 -->
        <view class="news-images" v-if="item.image_list && item.image_list.length">
          <image
            v-for="(img, index) in item.image_list"
            :key="index"
            :src="img"
            mode="aspectFill"
            class="news-image"
            @click="previewImages(item.image_list, index)"
          />
        </view>

        <!-- 内容预览 -->
        <view class="news-content-preview">
          {{ item.content.length > 50 ? item.content.substring(0, 50) + '...' : item.content }}
        </view>
      </view>

      <!-- 加载更多 -->
      <view class="load-more" v-if="!loading">
        <text v-if="loadingStatus === 'loading'">加载中...</text>
        <text v-if="loadingStatus === 'noMore' && newsList.length !== 0">— 没有更多了 —</text>
      </view>

      <!-- 空状态 -->
      <view class="empty" v-if="newsList.length === 0 && !loading">
        <image class="empty-icon" src="/static/images/empty.png" />
        <text class="empty-text">暂无品牌文章</text>
        <text class="empty-tip">点击加号按钮创建您的第一篇文章</text>
      </view>
    </scroll-view>

    <!-- 新增按钮 -->
    <button class="add-btn" @click="showAddDialog">
      <uni-icons type="plusempty" size="30" color="#fff"></uni-icons>
    </button>

    <!-- 使用自定义底部弹窗 -->
    <bottom-popup :show="dialogVisible" @close="closeDialog">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">{{ isEditMode ? '编辑文章' : '新增文章' }}</text>
          <uni-icons type="closeempty" size="24" color="#999" @click="closeDialog"></uni-icons>
        </view>

        <!-- 表单滚动区 -->
        <scroll-view scroll-y class="form-container">
          <!-- 文章类型选择器 -->
          <view class="form-group">
            <text class="form-label">文章类型</text>
            <picker @change="onNewsTypeChange" :value="formData.news_type" :range="newsTypes" range-key="label">
              <view class="picker">
                {{ newsTypes.find(t => t.value === formData.news_type)?.label || '请选择文章类型' }}
              </view>
            </picker>
            <view class="goods-search-tip">
              只可以发布与【贩售】相关内容；半成品->图透、即将截止贩售->截定、开始贩售以及其它->公告
            </view>
            <view class="goods-search-tip">
              我们每天上午和晚上10点左右会搬运一次小红书里发布的和贩售相关的新消息，如果有重复可以自行编辑或删除。
            </view>
          </view>

          <view class="form-group">
            <text class="form-label">文章标题</text>
            <input class="form-input" v-model="formData.title" placeholder="请输入文章标题" />
          </view>

          <view class="form-group">
            <text class="form-label">文章内容</text>
            <textarea class="form-textarea" v-model="formData.content" placeholder="请输入文章内容" auto-height />
          </view>

          <!-- 商品关联搜索 -->
          <view class="form-group">
            <text class="form-label">关联商品</text>
            <view class="goods-search-container">
              <goods-search
                mode="fill"
                :modelValue="formData.subscribe_goods_name"
                @select="onGoodsSelect"
                :brandId="currentBrandId"
              />
              <view class="goods-search-tip">
                关联商品，用户可以订阅消息，如果该商品下次发布贩售消息，订阅用户将收到弹窗提醒
              </view>
            </view>
          </view>

          <view class="form-group">
            <text class="form-label">展示图片</text>
            <view class="image-uploader">
              <!-- 上传状态提示 -->
              <view v-if="uploading" class="uploading-container">
                <uni-load-more status="loading"></uni-load-more>
                <text class="uploading-text">上传中 ({{ uploadedCount }}/{{ totalToUpload }})</text>
              </view>

              <!-- 图片预览 -->
              <view v-for="(img, index) in formData.image_list" :key="index" class="image-preview">
                <image :src="img" mode="aspectFill" class="preview-image" />
                <uni-icons
                  type="close"
                  size="18"
                  color="#fff"
                  class="delete-icon"
                  @click="removeImage(index)"
                />
              </view>

              <!-- 上传按钮 -->
              <view class="upload-btn" @click="chooseAndUploadImages" v-if="formData.image_list.length < 9 && !uploading">
                <uni-icons type="plusempty" size="28" color="#999"></uni-icons>
                <text>添加图片</text>
              </view>
            </view>
          </view>
        </scroll-view>

        <!-- 底部固定提交按钮 -->
        <view class="popup-footer">
          <button class="submit-btn" @click="submitNews" :disabled="submitting">
            {{ submitting ? '提交中...' : '提交' }}
          </button>
        </view>
      </view>
    </bottom-popup>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { chooseImageList, getQiniuToken, uploadImageToQiniu } from '@/common/image.js'
import { websiteUrl } from '@/common/config.js'

/* 列表状态 */
const newsList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)
const submitting = ref(false)
const loadingStatus = ref('more')
const scrollHeight = ref(0)

/* 弹窗 & 表单 */
const dialogVisible = ref(false)
const isEditMode = ref(false)
const currentNewsId = ref(null)

const uploading = ref(false)
const uploadedCount = ref(0)
const totalToUpload = ref(0)

const formData = ref({
  title: '',
  content: '',
  image_list: [],
  news_type: 1, // 默认图透
  subscribe_goods_id: 0,
  subscribe_goods_name: ''
})

/* 文章类型 */
const newsTypes = ref([
  { value: 1, label: '图透' },
  { value: 2, label: '尾款' },
  { value: 3, label: '截定' },
  { value: 4, label: '公告' }
])

/* 当前品牌ID（按实际获取） */
const currentBrandId = ref(1)

/* 选择商品 */
const onGoodsSelect = (goods) => {
  formData.value.subscribe_goods_id = goods.id
  formData.value.subscribe_goods_name = goods.name
}

/* 类型选择（picker 返回索引，从 0 开始） */
const onNewsTypeChange = (e) => {
  formData.value.news_type = parseInt(e.detail.value) + 1
}

/* 初始化 */
onMounted(() => {
  calcScrollHeight()
  uni.setNavigationBarTitle({ title: '品牌文章管理' })
})
onShow(() => {
  fetchNewsList(true)
})

/* 计算列表滚动高 */
const calcScrollHeight = () => {
  const systemInfo = uni.getSystemInfoSync()
  scrollHeight.value = systemInfo.windowHeight - 50
}

/* 取 token */
const getAuthorization = () => uni.getStorageSync('token') || ''

/* 选择并上传图片 */
const chooseAndUploadImages = async () => {
  try {
    const remaining = 9 - formData.value.image_list.length
    if (remaining <= 0) return

    const tempFilePaths = await chooseImageList(remaining)
    if (!tempFilePaths || tempFilePaths.length === 0) return

    const qiniuData = await getQiniuToken()
    const token = qiniuData.token
    const basePath = qiniuData.path

    uploading.value = true
    totalToUpload.value = tempFilePaths.length
    uploadedCount.value = 0

    const uploadedUrls = []
    for (let i = 0; i < tempFilePaths.length; i++) {
      try {
        uploadedCount.value = i + 1
        const result = await uploadImageToQiniu(tempFilePaths[i], token, basePath)
        if (result && result.imageUrl) uploadedUrls.push(result.imageUrl)
      } catch (e) {
        console.error(`第 ${i + 1} 张图片上传失败:`, e)
        uni.showToast({ title: `第 ${i + 1} 张图片上传失败`, icon: 'none' })
      }
    }

    formData.value.image_list = [...formData.value.image_list, ...uploadedUrls]
    if (uploadedUrls.length > 0) {
      uni.showToast({ title: `成功上传 ${uploadedUrls.length} 张图片`, icon: 'success' })
    }
  } catch (error) {
    console.error('图片选择或上传失败:', error)
    uni.showToast({ title: '图片上传失败', icon: 'none' })
  } finally {
    uploading.value = false
    uploadedCount.value = 0
    totalToUpload.value = 0
  }
}

/* 获取文章列表 */
const fetchNewsList = async (reset = false) => {
  if (loading.value) return
  if (reset) {
    currentPage.value = 1
    newsList.value = []
    loadingStatus.value = 'more'
  }
  loading.value = true
  loadingStatus.value = 'loading'
  try {
    const res = await uni.request({
      url: websiteUrl.value + '/brand-manager/news/list',
      method: 'GET',
      data: { page_index: currentPage.value, page_size: pageSize.value },
      header: { Authorization: getAuthorization() }
    })
    if (res.data.status === 'success') {
      const data = res.data.data
      const newList = data.news_list || []
      total.value = data.total

      const processedList = newList.map(news => {
        const image_list = news.image_urls
          ? news.image_urls.split(',').filter(url => url.trim() !== '')
          : (news.image_list || [])
        return { ...news, image_list }
      })

      if (reset) newsList.value = processedList
      else newsList.value = [...newsList.value, ...processedList]

      if (newsList.value.length >= total.value) {
        loadingStatus.value = 'noMore'
      } else {
        loadingStatus.value = 'more'
        currentPage.value++
      }
    } else {
      uni.showToast({ title: res.data.message || '获取列表失败', icon: 'none' })
    }
  } catch (error) {
    uni.showToast({ title: '网络错误', icon: 'none' })
  } finally {
    loading.value = false
  }
}

/* 加载更多 */
const loadMore = () => {
  if (loadingStatus.value === 'noMore') return
  fetchNewsList()
}

/* 新增 */
const showAddDialog = () => {
  resetForm()
  isEditMode.value = false
  dialogVisible.value = true
}

/* 编辑 */
const editNews = (news) => {
  resetForm()
  isEditMode.value = true
  currentNewsId.value = news.id
  formData.value = {
    title: news.title,
    content: news.content,
    image_list: [...(news.image_list || [])],
    news_type: news.news_type || 1,
    subscribe_goods_id: news.subscribe_goods_id || 0,
    subscribe_goods_name: news.subscribe_goods_name || ''
  }
  dialogVisible.value = true
}

/* 重置表单 */
const resetForm = () => {
  formData.value = {
    title: '',
    content: '',
    image_list: [],
    news_type: 1,
    subscribe_goods_id: 0,
    subscribe_goods_name: ''
  }
  currentNewsId.value = null
  submitting.value = false
}

/* 提交 */
const submitNews = async () => {
  if (!formData.value.title) {
    uni.showToast({ title: '请填写文章标题', icon: 'none' })
    return
  }
  if (!formData.value.content) {
    uni.showToast({ title: '请填写文章内容', icon: 'none' })
    return
  }

  const params = {
    title: formData.value.title,
    content: formData.value.content,
    image_urls: formData.value.image_list, // 如果后端要字符串：.join(',')
    news_type: formData.value.news_type,
    subscribe_goods_id: formData.value.subscribe_goods_id,
    subscribe_goods_name: formData.value.subscribe_goods_name
  }
  if (isEditMode.value) params.id = currentNewsId.value

  submitting.value = true
  try {
    const url = websiteUrl.value + (isEditMode.value ? '/brand-manager/news/update' : '/brand-manager/news/create')
    const res = await uni.request({
      url,
      method: 'POST',
      data: params,
      header: {
        Authorization: getAuthorization(),
        'Content-Type': 'application/json'
      }
    })
    if (res.data.status === 'success') {
      uni.showToast({ title: isEditMode.value ? '更新成功' : '添加成功', icon: 'success' })
      dialogVisible.value = false
      fetchNewsList(true)
    } else {
      uni.showToast({ title: res.data.message || (isEditMode.value ? '更新失败' : '添加失败'), icon: 'none' })
    }
  } catch (error) {
    console.error('提交失败:', error)
    uni.showToast({ title: '请求失败，请稍后重试', icon: 'none' })
  } finally {
    submitting.value = false
  }
}

/* 关闭弹窗 */
const closeDialog = () => { dialogVisible.value = false }

/* 确认删除 */
const confirmDelete = (id) => {
  uni.showModal({
    title: '提示',
    content: '确定要删除该文章吗？',
    success: (res) => { if (res.confirm) deleteNews(id) }
  })
}

/* 删除 */
const deleteNews = async (id) => {
  try {
    const res = await uni.request({
      url: websiteUrl.value + '/brand-manager/news/delete?id=' + id,
      method: 'GET',
      header: { Authorization: getAuthorization() }
    })
    if (res.data.status === 'success') {
      uni.showToast({ title: '删除成功', icon: 'success' })
      fetchNewsList(true)
    } else {
      uni.showToast({ title: res.data.message || '删除失败', icon: 'none' })
    }
  } catch (error) {
    console.error('删除失败:', error)
    uni.showToast({ title: '网络错误', icon: 'none' })
  }
}

/* 删除预览图 */
const removeImage = (index) => {
  formData.value.image_list.splice(index, 1)
}

/* 预览图片 */
const previewImages = (images, current) => {
  uni.previewImage({ current, urls: images, indicator: 'number' })
}

/* 日期格式化 */
const formatDate = (ts, fmt = 'yyyy-MM-dd HH:mm') => {
  if (!ts) return ''
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  const hh = d.getHours().toString().padStart(2, '0')
  const mm = d.getMinutes().toString().padStart(2, '0')
  if (fmt === 'yyyy-MM-dd') return `${y}-${m}-${day}`
  if (fmt === 'HH:mm') return `${hh}:${mm}`
  return `${y}-${m}-${day} ${hh}:${mm}`
}
</script>

<style lang="less">
.brand-news-page {
  padding: 15px;
  background-color: #f5f5f5;
  min-height: 100vh;
  box-sizing: border-box;

  .news-list {
    margin-bottom: 20px;
    -webkit-overflow-scrolling: touch;

    .news-item {
      background-color: #fff;
      border-radius: 12px;
      padding: 15px;
      margin-bottom: 15px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      transition: all 0.2s ease;

      &:active {
        transform: translateY(1px);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
      }

      .news-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .header-left {
          flex: 1;
          min-width: 0; /* 让省略号生效 */

          .news-title {
            font-size: 16px;
            font-weight: 600;
            color: #333;
            display: block;
            margin-bottom: 6px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .news-time {
            font-size: 12px;
            color: #999;
            display: block;
          }
        }

        .action-btns {
          display: flex;
          margin-left: 10px;

          button {
            margin-left: 8px;
            padding: 6px 14px;
            font-size: 12px;
            border-radius: 20px;
            border: none;
            line-height: 1.5;

            &.edit-btn {
              background-color: #409eff;
              color: #fff;
              box-shadow: 0 2px 4px rgba(64, 158, 255, 0.26);
            }

            &.delete-btn {
              background-color: #f56c6c;
              color: #fff;
              box-shadow: 0 2px 4px rgba(245, 108, 108, 0.26);
            }

            &:active {
              opacity: 0.86;
            }
          }
        }
      }

      .news-images {
        display: flex;
        flex-wrap: wrap;
        margin: 10px -4px 6px;

        .news-image {
          width: calc(33.33% - 8px);
          height: 100px;
          margin: 4px;
          border-radius: 8px;
          background-color: #f0f0f0;
          overflow: hidden;
        }
      }

      .news-content-preview {
        font-size: 14px;
        color: #666;
        line-height: 1.6;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-top: 8px;
      }
    }

    .loading-container {
      padding: 20px 0;
      text-align: center;
      color: #999;
    }

    .load-more {
      text-align: center;
      padding: 20px 0;
      font-size: 12px;
      color: #999;
    }

    .empty {
      text-align: center;
      padding: 50px 0;

      .empty-icon {
        width: 120px;
        height: 120px;
        margin-bottom: 15px;
        opacity: 0.6;
      }

      .empty-text {
        display: block;
        font-size: 16px;
        color: #666;
        margin-bottom: 8px;
      }

      .empty-tip {
        display: block;
        font-size: 13px;
        color: #999;
      }
    }
  }

  .add-btn {
    position: fixed;
    right: 20px;
    bottom: 80px;
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, #a6e9f7, #1ed1e1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 6px 16px rgba(30, 209, 225, 0.36);
    z-index: 1001;
    border: none;

    &:active {
      transform: scale(0.96);
      box-shadow: 0 3px 8px rgba(30, 209, 225, 0.28);
    }
  }

  /* ====== 弹窗中的内容容器（插到 bottom-popup 的 slot 里） ====== */
  .popup-content {
    background-color: #fff;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    padding: 20px 20px 0;
    height: 80vh; /* 固定可视高度，保证下方按钮不被遮挡 */
    display: flex;
    flex-direction: column;

    /* iOS 安全区 */
    padding-bottom: calc(env(safe-area-inset-bottom, 0px));

    .popup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 15px;
      border-bottom: 1px solid #eee;
      margin-bottom: 15px;

      .popup-title {
        font-size: 18px;
        font-weight: 600;
        color: #333;
      }
    }

    /* 表单滚动区 */
    .form-container {
      flex: 1;
      min-height: 0;
      overflow: hidden;      /* 交给 scroll-view 管 */
      -webkit-overflow-scrolling: touch;

      .form-group {
        margin-bottom: 20px;
      }

      .form-label {
        display: block;
        font-size: 14px;
        color: #666;
        margin-bottom: 8px;
        font-weight: 500;
      }

      .form-input,
      .form-textarea {
        background-color: #f8f8f8;
        border-radius: 8px;
        padding: 12px 15px;
        font-size: 14px;
        color: #333;
        border: 1px solid #eee;
      }

      .form-textarea {
        min-height: 100px;
      }

      .image-uploader {
        display: flex;
        flex-wrap: wrap;
        margin: -4px;

        .uploading-container {
          width: 100%;
          text-align: center;
          padding: 20px 0;
          color: #999;

          .uploading-text {
            display: block;
            margin-top: 10px;
            font-size: 12px;
          }
        }

        .image-preview {
          width: calc(33.33% - 8px);
          height: 100px;
          margin: 4px;
          border-radius: 8px;
          position: relative;
          overflow: hidden;

          .preview-image {
            width: 100%;
            height: 100%;
          }

          .delete-icon {
            position: absolute;
            top: 5px;
            right: 5px;
            background-color: rgba(0, 0, 0, 0.5);
            border-radius: 50%;
            padding: 2px;
          }
        }

        .upload-btn {
          width: calc(33.33% - 8px);
          height: 100px;
          margin: 4px;
          border: 1px dashed #ddd;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #999;
          font-size: 12px;
          background-color: #fafafa;

          text {
            margin-top: 5px;
          }
        }
      }
    }

    /* 底部固定提交按钮 */
    .popup-footer {
      position: relative;
      z-index: 1;
      padding: 12px 0 16px;
      background: #fff;
      box-shadow: 0 -6px 18px rgba(0, 0, 0, 0.06);
      border-bottom-left-radius: 20px;
      border-bottom-right-radius: 20px;

      .submit-btn {
        width: 100%;
        background: linear-gradient(to right, #1ed1e1, #2a8cff);
        color: #fff;
        border-radius: 30px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        font-weight: 500;
        border: none;
        box-shadow: 0 4px 10px rgba(42, 140, 255, 0.3);

        &:active {
          opacity: 0.92;
        }

        &[disabled] {
          opacity: 0.7;
        }
      }
    }
  }
}

/* 关联商品搜索区域 */
.goods-search-container {
  position: relative;
  margin-top: 10px;
}

.goods-search-tip {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
  line-height: 1.4;
}

/* 选择器样式（文章类型 picker） */
.picker {
  background-color: #f8f8f8;
  border-radius: 8px;
  padding: 12px 15px;
  font-size: 14px;
  color: #333;
  border: 1px solid #eee;
}

</style>
