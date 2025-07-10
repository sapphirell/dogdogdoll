<template>
  <view class="article-container">
	  <view-logs></view-logs>
    <!-- 文章封面 -->
    <image 
      v-if="article.banner" 
      :src="article.banner" 
      mode="widthFix" 
      class="banner"
    />

    <!-- 文章主体 -->
    <view class="content-wrapper">
      <text class="title">{{ article.title }}</text>
      
      <!-- HTML内容渲染 -->
      <mp-html
        :content="article.content" 
        class="content-html"
      />

       <!-- 评论区组件 -->
	   <view v-if="article.id > 0">
		   <view>
		       <comment-list 
		         ref="commentListRef"
		         :type="7"
		         :relation-id="parseInt(article.id)" 
		         @reply="handleReplyComment"
		       />
		     </view>
		      
		     <!-- 评论输入框组件 -->
		     <comment-input 
		       ref="commentInputRef"
		       :reply-info="replyForItem" 
		       :target-id="article.id.toString()" 
		       @submit="handleCommentSubmit"
		       @update:reply-info="val => replyForItem = val"
		     />
		   </view>
	   </view>
      


  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { websiteUrl, global, asyncGetUserInfo } from '../../common/config.js'



const article = ref({
  title: '',
  content: '',
  banner: '',
  created_at: 0
})

const currentPage = ref(1)
const loading = ref(false)
const noMore = ref(false)
const replyComment = ref(null)

const commentListRef = ref(null)
const commentInputRef = ref(null)
const replyForItem = ref({})

// 处理评论提交
const handleCommentSubmit = async ({ content, replyInfo, origin }) => {
  if (!await checkLogin(true)) return
  const requestData = {
  	content,
  	origin,
  	target_id: parseInt(article.value.id),
  	type: 7,
  	...(replyInfo.id && {
  		reply_id: replyInfo.id,
  		reply_for: replyInfo.comment,
  		reply_user_id: replyInfo.user_id,
  		parent_id: replyInfo.parent_id > 0  ? replyInfo.parent_id : replyInfo.id,
  	})
  }
  
  try {
    const { data } = await uni.request({
      url: `${websiteUrl}/with-state/add-comment`,
      method: 'POST',
      header: { Authorization: uni.getStorageSync('token') },
      data: requestData,
    })

    if (data.status === 'success') {
      // 更新评论列表
      if (data.data.parent_id === 0) {
        commentListRef.value?.addNewComment(data.data)
      } else {
        commentListRef.value?.addReplyComment(data.data)
      }
      uni.showToast({ title: '评论成功' })
    }
  } catch (error) {
    uni.showToast({ title: '评论失败', icon: 'none' })
  }
}

// 处理回复事件
const handleReplyComment = ({ parent, target }) => {
  const item = target || parent
  replyForItem.value = item
  commentInputRef.value?.focusInput()
}


onLoad(async (options) => {
  if (!options.id) return uni.navigateBack()
  asyncGetUserInfo()
  await fetchArticle(options.id)
})

// 获取文章详情
const fetchArticle = async (id) => {
  try {
    const { data } = await uni.request({
      url: `${websiteUrl}/article-detail?id=${id}`
    })
    if (data.status === 'success') {
      article.value = data.data
      uni.setNavigationBarTitle({ title: data.data.title })
    }
  } catch (error) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}


// 登录检查
const checkLogin = async (showToast = false) => {
  if (global.isLogin) return true
  if (showToast) {
    uni.showToast({ title: '请先登录', icon: 'none' })
  }
  return false
}

// 时间格式化
const formatTime = (timestamp) => {
  const date = new Date(timestamp * 1000)
  return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`
}
</script>

<style lang="less" scoped>
.article-container {
  background: #fff;
  min-height: 100vh;
  padding-bottom: 120rpx;

  .banner {
    width: 100%;
    height: 420rpx;
  }

  .content-wrapper {
    padding: 30rpx;

    .title {
      font-size: 36rpx;
      font-weight: 600;
      color: #333;
      line-height: 1.4;
      margin-bottom: 20rpx;
    }

    .content-html {
      font-size: 28rpx;
      line-height: 1.6;
      color: #444;
    }
  }

  .comment-section {
    margin-top: 40rpx;
    border-top: 1rpx solid #eee;

    .section-title {
      display: block;
      padding: 30rpx 0;
      font-size: 28rpx;
      color: #666;
    }

    .comment-item {
      display: flex;
      padding: 20rpx 0;
      border-bottom: 1rpx solid #f5f5f5;

      .avatar {
        width: 64rpx;
        height: 64rpx;
        border-radius: 50%;
        margin-right: 20rpx;
      }

      .comment-main {
        flex: 1;

        .user-info {
          display: flex;
          align-items: center;
          margin-bottom: 10rpx;

          .username {
            font-size: 22rpx;
            color: #666;
            margin-right: 20rpx;
          }

          .time {
            font-size: 20rpx;
            color: #999;
          }
        }

        .comment-content {
          font-size: 22rpx;
          color: #333;
          line-height: 1.4;
        }

        .comment-actions {
          margin-top: 15rpx;

          .reply-btn {
            font-size: 20rpx;
            color: #4cbbd0;
            padding: 6rpx 12rpx;
          }
        }
      }
    }

    .loading-status {
      text-align: center;
      padding: 30rpx;
      color: #999;
      font-size: 22rpx;
    }
  }

  .comment-input-wrapper {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    padding: 20rpx 30rpx;
    display: flex;
    align-items: center;
    border-top: 1rpx solid #eee;

    .input {
      flex: 1;
      height: 72rpx;
      background: #f5f5f5;
      border-radius: 36rpx;
      padding: 0 30rpx;
      font-size: 22rpx;
    }

    .submit-btn {
      width: 120rpx;
      text-align: center;
      color: #4cbbd0;
      font-size: 22rpx;
      margin-left: 20rpx;
    }
  }
}
</style>
