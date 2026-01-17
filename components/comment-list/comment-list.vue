<!-- components/comment-list.vue -->
<template>
  <view class="comment-container">
    <view class="comment-count" v-if="commentList.length > 0">
      共{{ mainCommentsTotal }}条回复
    </view>
    <view class="empty-tips" v-else>
      <text>-- 暂无回复 --</text>
    </view>
    <!-- 评论列表 -->
    <view v-for="comment in commentList" :key="comment.id" class="comment-card">
      <!-- 主评论 -->
      <view class="main-comment">
        <image @tap="jump2user(comment.uid)" :src="comment.avatar" class="avatar" mode="aspectFill" />
        <view class="content">
          <view class="header">
            <view class="header-left">
              <text class="username" @tap="jump2user(comment.uid)">
                {{ formatUsername(comment.username) }}
              </text>
              <text class="floor">#{{ comment.floor }}</text>
            </view>

            <report-button
              :report-type="5"
              :relation-id="comment.id"
              button-text="举报"
              icon-color="#999"
              theme-color="#64c6dc"
              icon-size="24"
            />
          </view>

          <!-- 评论图片展示 -->
          <view v-if="comment.image_url" class="comment-images">
            <image
              :src="comment.image_url"
              mode="aspectFill"
              class="comment-image"
              @tap="previewImage(comment.image_url)"
            />
          </view>

          <text class="comment-text" @click="handleReply(comment)">
            {{ comment.comment }}
          </text>

          <!-- 关联信息展示 -->
          <view
            v-if="comment.association_id"
            class="association-card"
            @click="navigateToAssociation(comment)"
          >
            <image
              :src="comment.association_image"
              mode="aspectFill"
              class="association-image"
            />
            <view class="association-info">
              <text class="association-name">{{ comment.association_name }}</text>
              <text class="association-type">
                {{ getAssociationTypeText(comment.association_type) }}
              </text>
            </view>
            <uni-icons
              type="arrow-right"
              size="20"
              color="#999"
              class="association-arrow"
            />
          </view>

          <view class="footer">
            <view class="left-actions">
              <text class="time">{{ formatTime(comment.created_at) }}</text>
              <view class="like-container">
                <view class="like-btn" @click="handleLike(comment)">
                  <uni-icons
                    :type="comment.user_like ? 'hand-up-filled' : 'hand-up'"
                    size="18"
                    :color="comment.user_like ? 'rgb(100 198 220)' : '#999'"
                  />
                  <text class="like-count" :class="{ liked: comment.user_like }">
                    {{ comment.like_count || 0 }}
                  </text>
                </view>
              </view>
            </view>

            <view class="right-actions">
              <!-- 表态按钮组 -->
              <attitude-widget
                :target-id="comment.id"
                :type="6"
                :attitude-status="comment.attitudeStatus"
                :attitude-counts="comment.attitudeCounts"
                @change="handleAttitudeChange(comment, $event)"
              />

              <text class="reply-btn" @click="handleReply(comment)">回复</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 子评论 -->
      <view
        v-if="comment.localChildren && comment.localChildren.length"
        class="sub-comments"
      >
        <view
          v-for="(child, index) in visibleChildren(comment)"
          :key="child.id"
          class="sub-comment"
        >
          <image
            @tap="jump2user(child.uid)"
            :src="child.avatar"
            class="avatar"
            mode="aspectFill"
          />
          <view class="content">
            <view class="header">
              <view class="header-left">
                <text
                  @tap="jump2user(child.uid)"
                  class="username"
                >
                  {{ formatUsername(child.username) }}
                </text>
              </view>

              <report-button
                :report-type="5"
                :relation-id="child.id"
                button-text="举报"
                icon-color="#999"
                theme-color="#64c6dc"
              />
            </view>

            <!-- 子评论图片 -->
            <view v-if="child.image_url" class="comment-images">
              <image
                :src="child.image_url"
                mode="aspectFill"
                class="comment-image"
                @tap="previewImage(child.image_url)"
              />
            </view>

            <text class="comment-text" @click="handleReply(comment)">
              {{ child.comment }}
            </text>

            <view
              v-if="child.association_id"
              class="association-card"
              @click="navigateToAssociation(child)"
            >
              <image
                :src="child.association_image"
                mode="aspectFill"
                class="association-image"
              />
              <view class="association-info">
                <text class="association-name">
                  {{ child.association_name }}
                </text>
                <text class="association-type">
                  {{ getAssociationTypeText(child.association_type) }}
                </text>
              </view>
              <uni-icons
                type="arrow-right"
                size="20"
                color="#999"
                class="association-arrow"
              />
            </view>

            <view class="footer">
              <view class="left-actions">
                <text class="time">{{ formatTime(child.created_at) }}</text>
                <view class="like-container">
                  <view class="like-btn" @click="handleLike(child)">
                    <uni-icons
                      :type="child.user_like ? 'hand-up-filled' : 'hand-up'"
                      size="18"
                      :color="child.user_like ? 'rgb(100 198 220)' : '#999'"
                    />
                    <text class="like-count" :class="{ liked: child.user_like }">
                      {{ child.like_count || 0 }}
                    </text>
                  </view>
                </view>
              </view>

              <view class="right-actions">
                <attitude-widget
                  :target-id="child.id"
                  :type="6"
                  :attitude-status="comment.attitudeStatus"
                  :attitude-counts="comment.attitudeCounts"
                  @change="handleAttitudeChange(comment, $event)"
                />

                <text class="reply-btn" @click="handleReply(comment, child)">
                  回复
                </text>
              </view>
            </view>
          </view>
        </view>

        <!-- 展开更多子回复 -->
        <view
          v-if="shouldShowMore(comment)"
          class="load-more"
          @click="loadMore(comment)"
        >
          <text>展开{{ remainingCount(comment) }}条回复</text>
          <uni-icons type="arrow-down" size="18" color="#007AFF" />
        </view>
      </view>
    </view>

    <!-- 主评论加载更多 -->
    <view class="load-more-box" v-if="commentList.length > 0">
      <view
        v-if="hasMore"
        class="load-more-btn"
        @click="loadMoreMainComments"
        :class="{ loading: loading }"
      >
        <view v-if="!loading">
          <text> 加载更多 </text>
          <uni-icons type="arrow-down" size="18" color="#007AFF" />
        </view>
        <view v-else>
          <uni-icons type="spinner-cycle" size="16" color="#888" />
        </view>
      </view>
      <view v-else class="no-more">
        <text>-- 没有更多了 --</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import {
  websiteUrl,
  asyncGetUserInfo,
  wechatSignLogin,
  getScene,
  global,
} from '../../common/config.js'

const props = defineProps({
  type: {
    type: Number,
    required: true,
  },
  relationId: {
    type: Number,
    required: true,
  },
})

const commentList = ref([])
const currentPage = ref(1)
const mainCommentsTotal = ref(0)
const hasMore = ref(true)

const subCommentPages = reactive({})
const emit = defineEmits(['reply'])

const loading = ref(false)
const tempCommentMap = ref({})

// 表态状态变更
const handleAttitudeChange = (comment, { status, counts }) => {
  comment.attitudeStatus = status
  comment.attitudeCounts = counts
}

// 暴露给父组件的方法
defineExpose({
  // 添加主评论（支持临时评论）
  addNewComment: comment => {
    const tempComment = {
      ...comment,
      isTemp: true,
      showAll: false,
      localChildren: [],
      childTotal: 0,
    }

    tempCommentMap.value[comment.id] = tempComment
    commentList.value.unshift(tempComment)
  },

  // 添加回复评论（支持临时评论）
  addReplyComment: reply => {
    const parentId = reply.parent_id
    const parent = commentList.value.find(c => c.id === parentId)

    if (parent) {
      const tempReply = {
        ...reply,
        isTemp: true,
      }

      tempCommentMap.value[reply.id] = tempReply

      if (!parent.localChildren) {
        parent.localChildren = []
      }
      if (typeof parent.childTotal !== 'number') {
        parent.childTotal = 0
      }

      parent.localChildren.unshift(tempReply)
      parent.childTotal += 1

      if (!parent.showAll && parent.childTotal <= 5) {
        parent.showAll = true
      }
    }
  },

  // 更新临时评论为真实评论
  updateTempComment: (tempId, newComment) => {
    const mainIndex = commentList.value.findIndex(c => c.id === tempId)
    if (mainIndex !== -1) {
      commentList.value[mainIndex] = {
        ...newComment,
        showAll: commentList.value[mainIndex].showAll,
        localChildren: commentList.value[mainIndex].localChildren || [],
        childTotal: commentList.value[mainIndex].childTotal || 0,
      }
      delete tempCommentMap.value[tempId]
      return
    }

    for (const parent of commentList.value) {
      if (parent.localChildren && parent.localChildren.length) {
        const childIndex = parent.localChildren.findIndex(c => c.id === tempId)
        if (childIndex !== -1) {
          parent.localChildren[childIndex] = {
            ...newComment,
            parent_id: parent.localChildren[childIndex].parent_id,
          }
          delete tempCommentMap.value[tempId]
          return
        }
      }
    }
  },

  // 移除临时评论
  removeTempComment: tempId => {
    const mainIndex = commentList.value.findIndex(c => c.id === tempId)
    if (mainIndex !== -1) {
      commentList.value.splice(mainIndex, 1)
      delete tempCommentMap.value[tempId]
      return
    }

    for (const parent of commentList.value) {
      if (parent.localChildren && parent.localChildren.length) {
        const childIndex = parent.localChildren.findIndex(c => c.id === tempId)
        if (childIndex !== -1) {
          parent.localChildren.splice(childIndex, 1)
          parent.childTotal = Math.max(0, parent.childTotal - 1)
          delete tempCommentMap.value[tempId]
          return
        }
      }
    }
  },
})

// 初始化加载评论
onMounted(() => {
  loadMainComments()
})

// 子评论可见列表
const visibleChildren = comment => {
  if (!comment.showAll && comment.localChildren.length > 5) {
    return comment.localChildren.slice(0, 5)
  }
  return comment.localChildren
}

// 加载更多主评论
const loadMoreMainComments = async () => {
  if (loading.value || !hasMore.value) return
  try {
    loading.value = true
    currentPage.value += 1
    await loadMainComments()
  } finally {
    loading.value = false
  }
}

// 预览评论图片
const previewImage = url => {
  uni.previewImage({
    urls: [url],
    current: url,
  })
}

// 点赞
const handleLike = async comment => {
  if (!global.isLogin) {
    uni.showToast({
      title: '请先登录',
      icon: 'none',
    })
    return
  }

  try {
    const token = uni.getStorageSync('token')
    const url = `${websiteUrl.value}/with-state/${
      comment.user_like ? 'unlike' : 'add-like'
    }`
    const res = await uni.request({
      url,
      method: 'POST',
      header: {
        Authorization: token,
      },
      data: {
        id: comment.id,
        type: 6,
      },
    })

    if (res.data.status === 'success') {
      comment.user_like = !comment.user_like
      if (comment.user_like) {
        comment.like_count = (comment.like_count || 0) + 1
      } else {
        comment.like_count = Math.max(0, (comment.like_count || 0) - 1)
      }

      uni.showToast({
        title: comment.user_like ? '点赞成功' : '已取消点赞',
        icon: 'none',
      })
    } else {
      uni.showToast({
        title: res.data.msg || '操作失败',
        icon: 'none',
      })
    }
  } catch (err) {
    console.error('点赞失败:', err)
    uni.showToast({
      title: '操作失败',
      icon: 'none',
    })
  }
}

const jump2user = uid => {
  uni.navigateTo({
    url: '/pages/user_page/user_page?uid=' + uid,
  })
}

// 时间格式化
const formatTime = timestamp => {
  const date = new Date(timestamp * 1000)
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const mi = String(date.getMinutes()).padStart(2, '0')
  return `${mm}-${dd} ${hh}:${mi}`
}

const formatUsername = name => {
  if (!name) return '未知用户'
  return name.length > 12 ? name.slice(0, 12) + '...' : name
}

// 加载主评论
const loadMainComments = async () => {
  try {
    loading.value = true
    const token = uni.getStorageSync('token')
    const res = await uni.request({
      url: `${websiteUrl.value}/get-comments`,
      data: {
        relation_id: props.relationId,
        type: props.type,
        page: currentPage.value,
        page_size: 10,
      },
      header: {
        Authorization: token,
      },
    })

    if (res.data.status === 'success') {
      const data = res.data.data
      const newComments = data.comment_list.map(c => ({
        ...c,
        showAll: false,
        localChildren: c.children || [],
        childTotal: c.childTotal || (c.children ? c.children.length : 0),
        attitudeStatus: c.user_attitude || 0,
        attitudeCounts:
          c.attitude_counts || {
            1: c.count_1 || 0,
            2: c.count_2 || 0,
            3: c.count_3 || 0,
            4: c.count_4 || 0,
            5: c.count_5 || 0,
          },
      }))

      if (currentPage.value === 1) {
        commentList.value = newComments
      } else {
        commentList.value.push(...newComments)
      }

      hasMore.value = data.total > commentList.value.length
      mainCommentsTotal.value = data.total
    }
  } catch (err) {
    uni.showToast({
      title: '加载失败',
      icon: 'none',
    })
  } finally {
    loading.value = false
  }
}

// 回复
const handleReply = (parent, target = null) => {
  emit('reply', {
    parent,
    target,
    relationId: props.relationId,
  })
}

// 关联类型文本
const getAssociationTypeText = type => {
  return type === 1 ? '娃物' : type === 2 ? '店铺' : '关联内容'
}

// 跳转到关联页面
const navigateToAssociation = comment => {
  if (!comment.association_id) return

  if (comment.association_type === 1) {
    uni.navigateTo({
      url: `/pages/goods/goods?goods_id=${comment.association_id}`,
    })
  } else if (comment.association_type === 2) {
    uni.navigateTo({
      url: `/pages/brand/brand?brand_id=${comment.association_id}`,
    })
  }
}

const shouldShowMore = comment => {
  return comment.childTotal > 5 && !comment.showAll
}

// 剩余子评论数
const remainingCount = comment => {
  return comment.childTotal - Math.min(comment.localChildren.length, 5)
}

// 加载更多子评论
const loadMore = async comment => {
  if (comment.localChildren.length < comment.childTotal) {
    const nextPage = Math.ceil(comment.localChildren.length / 5) + 1
    try {
      const res = await uni.request({
        url: `${websiteUrl.value}/get-comments-by-parent-id`,
        data: {
          parent_id: comment.id,
          page: nextPage,
        },
      })

      if (res.data.status === 'success') {
        comment.localChildren = [
          ...comment.localChildren,
          ...res.data.data.comment_list,
        ]
        comment.childTotal = res.data.data.total

        if (comment.localChildren.length >= 5 && !comment.showAll) {
          comment.showAll = true
        }
      }
    } catch (err) {
      uni.showToast({
        title: '加载失败',
        icon: 'none',
      })
    }
  } else {
    comment.showAll = !comment.showAll
  }
}
</script>

<style lang="less">
.comment-container {
  // padding: 20rpx;

  .comment-count {
    padding: 20rpx 24rpx;
    font-size: 24rpx;
    color: #999;
    margin-bottom: 20rpx;
  }

  .empty-tips {
    text-align: center;
    padding: 100rpx 0;

    text {
      color: #999;
      font-size: 22rpx;
    }
  }
}

.comment-card {
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  padding: 24rpx;
}

/* 主评论 & 子评论通用布局 */
.main-comment,
.sub-comment {
  display: flex;

  .avatar {
    width: 72rpx;
    height: 72rpx;
    border-radius: 50%;
    margin-right: 24rpx;
    flex-shrink: 0;
    border: 2rpx solid #f0f0f0;
  }

  .content {
    flex: 1;
    min-height: 120rpx;
    display: flex;
    flex-direction: column;

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12rpx;

      .header-left {
        display: flex;
        align-items: center;
      }

      .username {
        font-size: 22rpx;
        color: #b2b8bc;
        font-weight: 500;
        max-width: 400rpx;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .floor {
        font-size: 22rpx; /* 与用户名统一 */
        color: #999;
        margin-left: 12rpx;
      }
    }

    .comment-text {
      font-size: 26rpx;
      color: #494b4b;
      line-height: 1.6;
      margin-bottom: 10rpx;
      flex: 1;
      min-height: 60rpx;
    }
  }
}

/* 子评论区域 */
.sub-comments {
  margin-left: 72rpx;
  padding-left: 24rpx;
  border-left: 2rpx solid #eee;

  .sub-comment {
    margin-top: 24rpx;

    .avatar {
      width: 56rpx;
      height: 56rpx;
    }

    &.folded {
      display: none;
    }
  }

  .load-more {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16rpx;
    margin-top: 16rpx;
    background: none;
    border-radius: 8rpx;

    text {
      font-size: 22rpx;
    }

    uni-icons {
      margin-left: 8rpx;
    }
  }
}

.load-more-box {
  text-align: center;
  padding: 30rpx 0;

  text {
    font-size: 22rpx;
  }

  .load-more-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 64rpx;
    padding: 0 40rpx;
    font-size: 26rpx;
    border-radius: 64rpx;
    transition: all 0.3s;

    &.loading {
      color: #494b4b;
      opacity: 0.8;
      padding: 0 30rpx;
    }

    uni-icons {
      font-size: 24rpx;
      margin-left: 8rpx;
      animation: rotating 1s linear infinite;
    }
  }

  .no-more {
    color: #999;
    font-size: 24rpx;
    padding: 20rpx 0;
  }
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 子评论内的 header 也保持一致风格 */
.sub-comment {
  display: flex;
  margin-top: 24rpx;

  .avatar {
    width: 56rpx !important;
    height: 56rpx !important;
    margin-right: 20rpx;
    flex-shrink: 0;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10rpx;

    .header-left {
      display: flex;
      align-items: center;
    }

    .username {
      font-size: 22rpx;
      color: #888;
      max-width: 180rpx;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .comment-text {
    font-size: 26rpx !important;
    color: #666 !important;
    line-height: 1.5;
  }
}

/* footer：时间 / 点赞 / 回复 对齐 & 字号统一 */
.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16rpx;

  .left-actions {
    display: flex;
    align-items: center;
    gap: 20rpx;

    .time {
      font-size: 22rpx;
      color: #999;
    }

    .like-container {
      .like-btn {
        display: flex;
        align-items: center;
        gap: 8rpx;
        padding: 6rpx 16rpx;
        border-radius: 20rpx;

        .like-count {
          font-size: 22rpx;
          color: #999;

          &.liked {
            color: rgb(100 198 220);
          }
        }
      }
    }
  }

  .right-actions {
    display: flex;
    align-items: center;
    gap: 10rpx;

    .reply-btn {
      font-size: 22rpx;
      color: #999; /* 改为灰色 */
      padding: 6rpx 20rpx;
      border-radius: 24rpx;
    }
  }
}

/* 子评论 footer 适配 */
.sub-comment .footer {
  margin-top: 10rpx;

  .like-btn {
    padding: 4rpx 12rpx;
  }
}

/* 全局 reply-btn 左对齐辅助（不改颜色） */
.reply-btn {
  margin-left: auto;
}

/* 评论图片样式 */
.comment-images {
  margin: 15rpx 0;

  .comment-image {
    width: 200rpx;
    height: 200rpx;
    border-radius: 10rpx;
  }
}

/* 关联卡片 */
.association-card {
  display: flex;
  align-items: center;
  padding: 16rpx;
  background: #fff;
  border-radius: 16rpx;
  margin: 16rpx 0;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
  border: 1rpx solid #f0f0f0;

  .association-image {
    width: 100rpx;
    height: 100rpx;
    border-radius: 12rpx;
    margin-right: 20rpx;
    background: #f8f8f8;
  }

  .association-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .association-name {
      font-size: 28rpx;
      color: #333;
      font-weight: bold;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-bottom: 6rpx;
    }

    .association-type {
      font-size: 22rpx;
      color: #999;
      background: #f7f7f7;
      padding: 4rpx 12rpx;
      border-radius: 20rpx;
      align-self: flex-start;
    }
  }

  .association-arrow {
    margin-left: 10rpx;
    flex-shrink: 0;
  }
}

.association-link {
  display: none;
}

/* 移动端表态按钮微调 */
@media (max-width: 480px) {
  .attitude-actions {
    .attitude-btn {
      padding: 4rpx 8rpx;
      margin-right: 6rpx;

      .emoji {
        font-size: 24rpx;
      }

      .count {
        font-size: 18rpx;
      }
    }
  }
}
</style>
