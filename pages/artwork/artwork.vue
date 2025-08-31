<template>
	<view-logs />
  <view>
    <!-- 图片轮播区域 -->
    <view style="position: relative;">
      <view class="heart" @click="likeFn()">
        <uni-icons type="heart" size="28" color="#ff4d4f" v-if="!hasLike"></uni-icons>
        <uni-icons type="heart-filled" size="28" color="#ff4d4f" v-else></uni-icons>
        <text class="num">{{ detailData?.like_count ? formatNumber(detailData.like_count) : 0 }}</text>
      </view>
      <swiper class="swiper-box" :indicator-dots="true" :autoplay="false">
        <swiper-item v-for="(img, index) in detailData.images" :key="index">
          <image :src="img" mode="aspectFill" class="swiper-image" @tap="viewFullImage(index)" />
        </swiper-item>
      </swiper>
    </view>

    <!-- 作者信息区域 -->
    <view class="author-info" @click="navigateToBrand(detailData.brand_id)" v-if="brandInfo">
      <image :src="brandInfo.logo_image" mode="aspectFill" class="author-avatar" />
      <view class="author-details">
        <text class="author-name">{{ brandInfo.brand_name }}</text>
        <text class="publish-time">发布于 {{ formatTimestamp(detailData.created_at) }}</text>
      </view>
    </view>

    <!-- 作品信息区域 -->
    <view class="content-box">
      <text class="title">{{ detailData.title }}</text>
      <text class="head-name">头名: {{ detailData.head_name }}</text>
      
      <!-- 作品元信息 -->
      <view class="meta-info">
        <text class="meta-item">性别: {{ getSexText(detailData.sex) }}</text>
        <text class="meta-item">类型: {{ getArtTypeText(detailData.art_type) }}</text>
      </view>
      
      <!-- 风格标签 -->
      <view class="tags-container" v-if="detailData.faceup_tag_content && detailData.faceup_tag_content.length">
        <text class="tags-title">风格:</text>
        <view class="tags-list">
          <view v-for="(tag, index) in detailData.faceup_tag_content" :key="index" class="tag-item">
            {{ tag }}
          </view>
        </view>
      </view>
    </view>

    <!-- 关联商品 -->
    <view class="goods-section" v-if="detailData.goods_id && goodsInfo">
      <text class="section-title">关联商品</text>
      <view class="goods-item" @click="navigateToGoods(detailData.goods_id)">
        <view class="image-container">
          <image :src="goodsInfo.goods_images?.[0] || '/static/goods-default.png'" mode="aspectFill" class="goods-image" />
        </view>
        <view class="goods-info">
          <text class="goods-name">{{ goodsInfo.name }}</text>
          <text class="goods-brand">{{ goodsInfo.brand_name }}</text>
          <view class="see">去看看 →</view>
        </view>
      </view>
    </view>

    <!-- 评论区 -->
    <view style="padding: 10px;">
      <comment-list ref="commentListRef" :type="commentType" :relation-id="parseInt(pageId)" @reply="handleReplyComment" />
    </view>

    <!-- 输入框 -->
    <comment-input ref="commentInputRef" :reply-info="replyForItem" :target-id="pageId"
      @submit="handleCommentSubmit" @update:reply-info="val => replyForItem = val" />

    <view style="width: 100%;height: 120rpx;"></view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading">加载中...</view>
    <view v-if="error" class="error">{{ errorMsg }}</view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from "@dcloudio/uni-app";
import { websiteUrl, asyncGetUserInfo, global } from "../../common/config.js";

// 页面数据
const detailData = ref({
  id: 0,
  title: '',
  head_name: '',
  faceup_tag_content: [],
  sex: 0,
  created_at: 0,
  brand_id: 0,
  art_type: 1,
  goods_id: 0,
  images: [],
  like_count: 0
})

// 商品和品牌信息
const goodsInfo = ref(null)
const brandInfo = ref(null)

// 页面状态
const loading = ref(true)
const error = ref(false)
const errorMsg = ref('')
const hasLike = ref(false)
const pageId = ref(0)
const commentType = ref(8) // 妆师作品的评论类型为8

// 评论相关
const commentListRef = ref(null)
const commentInputRef = ref(null)
const replyForItem = ref({})

// 格式化数字
function formatNumber(num) {
  if (!num) return '0'
  if (num < 1000) return num.toString()
  return `${Math.floor(num / 1000)}k+`
}

// 获取性别文本
function getSexText(sex) {
  const sexMap = {
    0: '未知',
    1: '男',
    2: '女'
  }
  return sexMap[sex] || '未知'
}

// 获取艺术类型文本
function getArtTypeText(type) {
  const typeMap = {
    1: '妆师',
    2: '毛娘'
  }
  return typeMap[type] || '未知类型'
}

// 格式化时间戳
function formatTimestamp(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp * 1000)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
}

// 查看大图
function viewFullImage(index) {
  uni.previewImage({
    current: detailData.value.images[index],
    urls: detailData.value.images
  })
}

// 获取作品详情
const fetchData = async (id) => {
  try {
    loading.value = true
    const res = await uni.request({
      url: websiteUrl.value + `/faceup/detail?id=${id}`,
    })

    if (res.data.status !== 'success') {
      handleError(res.data.msg || '数据加载失败')
      return
    }

    // 使用返回的数据
    detailData.value = res.data.data
    
    // 确保images是数组
    if (!Array.isArray(detailData.value.images)) {
      detailData.value.images = detailData.value.face_up_image_urls ? 
        detailData.value.face_up_image_urls.split(',') : []
    }

    // 获取关联商品信息
    if (detailData.value.goods_id) {
      fetchGoodsInfo(detailData.value.goods_id)
    }

    // 获取关联品牌信息
    if (detailData.value.brand_id) {
      fetchBrandInfo(detailData.value.brand_id)
    }

  } catch (err) {
    console.error('获取作品详情失败:', err)
    handleError('数据加载失败')
  } finally {
    loading.value = false
  }
}

// 获取商品信息
const fetchGoodsInfo = async (goodsId) => {
  try {
    const res = await uni.request({
      url: websiteUrl.value + `/goods?id=${goodsId}`,
      method: 'GET'
    })

    if (res.data.status === 'success') {
      goodsInfo.value = res.data.data
    }
  } catch (e) {
    console.error('获取商品信息失败:', e)
  }
}

// 获取品牌信息
const fetchBrandInfo = async (brandId) => {
  try {
    const res = await uni.request({
      url: websiteUrl.value + `/brand-info?id=${brandId}`,
      method: 'GET'
    })

    if (res.data.status === 'success') {
      brandInfo.value = res.data.data
    }
  } catch (e) {
    console.error('获取品牌信息失败:', e)
  }
}

// 错误处理
const handleError = (msg) => {
  error.value = true
  errorMsg.value = msg
  uni.showToast({
    title: msg,
    icon: 'none'
  })
}

// 跳转到商品
function navigateToGoods(goodsId) {
  uni.navigateTo({
    url: `/pages/goods/goods?goods_id=${goodsId}`
  })
}

// 跳转到品牌
function navigateToBrand(brandId) {
  uni.navigateTo({
    url: `/pages/brand/brand?brand_id=${brandId}`
  })
}

// 点赞功能 - 妆师作品点赞类型为7
function likeFn() {
  let token = uni.getStorageSync('token');
  if (!global.isLogin) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    return
  }
  
  const requestData = {
    id: parseInt(pageId.value),
    type: 7, // 妆师作品点赞类型为7
  }
  
  // 判断是请求点赞接口还是取消点赞接口
  let url = hasLike.value ? '/with-state/unlike' : '/with-state/add-like';
  uni.request({
    url: websiteUrl.value + url,
    method: 'POST',
    header: {
      'Authorization': token,
    },
    data: requestData,
    success: (res) => {
      if (res.data.status == "success") {
        uni.showToast({
          title: hasLike.value ? '取消点赞' : '点赞成功',
          icon: 'success'
        })
        hasLike.value = !hasLike.value
        
        // 更新点赞数
        if (hasLike.value) {
          detailData.value.like_count += 1;
        } else {
          detailData.value.like_count -= 1;
        }
      } else {
        uni.showToast({
          title: res.data.msg || '操作失败',
          icon: 'none'
        })
      }
    },
    fail: (err) => {
      console.log(err);
      uni.showToast({
        title: '网络请求失败',
        icon: 'none'
      })
    },
  });
}

// 获取是否点赞
function getHasLike() {
  let token = uni.getStorageSync('token');
  if (!token) {
    return
  }

  uni.request({
    url: websiteUrl.value + '/with-state/hasLike?id=' + pageId.value + '&type=7', // 类型7
    method: 'POST',
    header: {
      'Authorization': token,
    },
    success: (res) => {
      if (res.data.status == "success") {
        hasLike.value = res.data.data.id > 0
      }
    }
  });
}

// 评论相关函数
const handleReplyComment = ({ parent, target }) => {
  let item = parent
  if (target != null) {
    item = target
  }

  if (replyForItem.value.id == item.id) {
    replyForItem.value = {}
    return
  }
  
  replyForItem.value = item;
  commentInputRef.value?.focusInput()
}

// 评论提交处理 - 妆师作品评论类型为8
const handleCommentSubmit = (submitData) => {
  let token = uni.getStorageSync('token');
  if (!global.isLogin) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    return
  }
  
  const requestData = {
    content: submitData.content,
    origin: submitData.origin,
    target_id: parseInt(pageId.value),
    type: 8, // 妆师作品评论类型为8
    image_url: submitData.image_url || "",
    association_id: submitData.association_id || 0,
    association_type: submitData.association_type || 0,
    is_anonymous: submitData.is_anonymous || 0,
    ...(replyForItem.value.id && {
      reply_id: replyForItem.value.id,
      reply_for: replyForItem.value.comment,
      reply_uid: replyForItem.value.user_id,
      parent_id: replyForItem.value.parent_id > 0 ? 
        replyForItem.value.parent_id : replyForItem.value.id,
    })
  }
  
  // 创建临时评论对象
  const tempComment = {
    id: Date.now(),
    content: submitData.content,
    created_at: Math.floor(Date.now() / 1000),
    like_count: 0,
    reply_count: 0,
    is_liked: false,
    floor: 0,
    ...(submitData.is_anonymous ? {
      avatar: "https://images1.fantuanpu.com/home/default_avatar.jpg",
      username: "匿名用户",
      is_anonymous: 1
    } : {
      avatar: global.userInfo.avatar,
      username: global.userInfo.nickname,
      is_anonymous: 0
    }),
    ...(submitData.image_url && {
      image_url: submitData.image_url
    }),
    ...(replyForItem.value.id && {
      reply_id: replyForItem.value.id,
      reply_for: replyForItem.value.comment,
      reply_uid: replyForItem.value.user_id,
      parent_id: replyForItem.value.parent_id > 0 ? 
        replyForItem.value.parent_id : replyForItem.value.id,
      reply_username: replyForItem.value.is_anonymous ? 
        "匿名用户" : replyForItem.value.username
    })
  }
  
  // 添加临时评论
  if (!replyForItem.value.id) {
    commentListRef.value?.addNewComment(tempComment)
  } else if (replyForItem.value.parent_id === 0) {
    commentListRef.value?.addReplyComment({
      ...tempComment,
      parent_id: replyForItem.value.id
    })
  } else {
    commentListRef.value?.addReplyComment({
      ...tempComment,
      parent_id: replyForItem.value.parent_id
    })
  }

  uni.request({
    url: websiteUrl.value + '/with-state/add-comment',
    method: 'POST',
    header: {
      'Authorization': token
    },
    data: requestData,
    success: (res) => {
      if (res.data.status == "success") {
        const newComment = res.data.data
        const finalComment = {
          ...newComment,
          ...(submitData.is_anonymous ? {
            avatar: "https://images1.fantuanpu.com/home/default_avatar.jpg",
            username: "匿名用户",
            is_anonymous: 1
          } : {
            avatar: global.userInfo.avatar,
            username: global.userInfo.nickname,
            is_anonymous: 0
          })
        }
        
        if (newComment.reply_uid && replyForItem.value.is_anonymous) {
          finalComment.reply_username = "匿名用户"
        }

        // 更新临时评论为真实评论
        commentListRef.value?.updateTempComment(tempComment.id, finalComment)

        uni.showToast({
          title: '评论成功',
          icon: 'success'
        })
      } else {
        commentListRef.value?.removeTempComment(tempComment.id)
        uni.showToast({
          title: res.data.msg,
          icon: 'none'
        })
      }
    },
    fail: (err) => {
      commentListRef.value?.removeTempComment(tempComment.id)
      uni.showToast({
        title: '网络请求失败',
        icon: 'none'
      })
    }
  });
}

// 页面加载
onLoad((options) => {
  if (!options.id) {
    handleError('缺少必要参数')
    return
  }
  
  pageId.value = options.id
  fetchData(options.id)
  
  // 检查登录状态
  asyncGetUserInfo().then(() => {
    // 获取点赞状态
    getHasLike()
  })
})
</script>

<style lang="less" scoped>
.swiper-box {
  height: 750rpx;
}

.swiper-image {
  width: 100%;
  height: 100%;
}

.heart {
  position: absolute;
  top: 10px;
  right: 20px;
  z-index: 10;
  width: 50px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 15px;
  padding: 5px;

  .uni-icons {
    width: 30px;
    height: 30px;
  }

  .num {
    color: white;
    font-size: 14px;
    margin-left: 5px;
    font-weight: bold;
  }
}

/* 作者信息区域 */
.author-info {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
  
  .author-avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    margin-right: 20rpx;
  }
  
  .author-details {
    display: flex;
    flex-direction: column;
  }
  
  .author-name {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }
  
  .publish-time {
    font-size: 26rpx;
    color: #999;
    margin-top: 8rpx;
  }
}

.content-box {
  padding: 30rpx;
  background: #fff;
  border-radius: 0 0 16rpx 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.title {
  font-size: 36rpx;
  font-weight: 800;
  margin-bottom: 20rpx;
  display: block;
  color: #333;
}

.head-name {
  display: block;
  font-size: 30rpx;
  color: #666;
  margin-bottom: 20rpx;
}

.meta-info {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
  margin-bottom: 20rpx;
}

.meta-item {
  font-size: 28rpx;
  color: #666;
  padding: 8rpx 20rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
}

/* 风格标签区域 */
.tags-container {
  display: flex;
  margin-top: 20rpx;
  
  .tags-title {
    font-size: 28rpx;
    color: #666;
    margin-right: 20rpx;
    line-height: 50rpx;
  }
  
  .tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 15rpx;
    flex: 1;
  }
  
  .tag-item {
    font-size: 26rpx;
    color: #1ed1e1;
    padding: 8rpx 20rpx;
    background: #e8f7ff;
    border-radius: 8rpx;
    border: 1rpx solid #b3e5fc;
  }
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #333;
  margin: 30rpx 20rpx 20rpx;
  padding-left: 20rpx;
  border-left: 8rpx solid #1ed1e1;
}

.goods-section {
  background: #fff;
  border-radius: 16rpx;
  margin: 20rpx;
  padding: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.goods-item {
  display: flex;
  padding: 20rpx;
  background: #f9f9f9;
  border-radius: 12rpx;
  align-items: center;
}

.image-container {
  width: 180rpx;
  height: 180rpx;
  margin-right: 30rpx;
  flex-shrink: 0;
}

.goods-image {
  width: 100%;
  height: 100%;
  border-radius: 8rpx;
  object-fit: cover;
}

.goods-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.goods-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.goods-brand {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 20rpx;
}

.see {
  color: #1ed1e1;
  font-size: 26rpx;
  font-weight: bold;
  align-self: flex-start;
}

.loading, .error {
  text-align: center;
  padding: 40rpx;
  font-size: 28rpx;
  color: #999;
}
</style>
