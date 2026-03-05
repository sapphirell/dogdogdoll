<!-- components/comment-list.vue -->
<template>
  <view class="comment-container">
    <view class="empty-tips" v-if="commentList.length === 0">
      <text>-- 暂无回复 --</text>
    </view>

    <view v-for="comment in commentList" :key="comment.id" class="comment-card">
      <view class="main-comment" @tap="handleCardTap(comment)" @longpress.stop.prevent="openActionPopup(comment)">
        <image
          @tap.stop="jump2user(comment.uid)"
          :src="comment.avatar"
          class="avatar"
          mode="aspectFill"
        />
        <view class="content">
          <view class="header">
            <view class="header-left">
              <text class="username" @tap.stop="jump2user(comment.uid)">
                {{ formatUsername(comment.username) }}
              </text>
              <text class="floor">#{{ comment.floor }}</text>
            </view>
          </view>

          <view v-if="comment.image_url" class="comment-images">
            <image
              :src="comment.image_url"
              mode="aspectFill"
              class="comment-image"
              @tap.stop="previewImage(comment.image_url)"
            />
          </view>

          <text class="comment-text app-readable-text">
            {{ comment.comment }}
          </text>

          <view
            v-if="comment.association_id"
            class="association-card"
            @tap.stop="navigateToAssociation(comment)"
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
            <uni-icons type="arrow-right" size="20" color="#999" class="association-arrow" />
          </view>

          <view class="footer">
            <view class="left-actions">
              <text class="time">{{ formatTime(comment.created_at) }}</text>
              <view class="like-container">
                <view class="like-btn" @tap.stop="handleLike(comment)">
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
          </view>
        </view>
      </view>

      <view
        v-if="comment.localChildren && comment.localChildren.length"
        class="sub-comments"
      >
        <view
          v-for="child in visibleChildren(comment)"
          :key="child.id"
          class="sub-comment"
          @tap="handleCardTap(comment, child)"
          @longpress.stop.prevent="openActionPopup(comment, child)"
        >
          <image
            @tap.stop="jump2user(child.uid)"
            :src="child.avatar"
            class="avatar"
            mode="aspectFill"
          />
          <view class="content">
            <view class="header">
              <view class="header-left">
                <text @tap.stop="jump2user(child.uid)" class="username">
                  {{ formatUsername(child.username) }}
                </text>
              </view>
            </view>

            <view v-if="child.image_url" class="comment-images">
              <image
                :src="child.image_url"
                mode="aspectFill"
                class="comment-image"
                @tap.stop="previewImage(child.image_url)"
              />
            </view>

            <text class="comment-text app-readable-text">
              {{ child.comment }}
            </text>

            <view
              v-if="child.association_id"
              class="association-card"
              @tap.stop="navigateToAssociation(child)"
            >
              <image
                :src="child.association_image"
                mode="aspectFill"
                class="association-image"
              />
              <view class="association-info">
                <text class="association-name">{{ child.association_name }}</text>
                <text class="association-type">
                  {{ getAssociationTypeText(child.association_type) }}
                </text>
              </view>
              <uni-icons type="arrow-right" size="20" color="#999" class="association-arrow" />
            </view>

            <view class="footer">
              <view class="left-actions">
                <text class="time">{{ formatTime(child.created_at) }}</text>
                <view class="like-container">
                  <view class="like-btn" @tap.stop="handleLike(child)">
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
            </view>
          </view>
        </view>

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

    <view class="load-more-box" v-if="commentList.length > 0">
      <view
        v-if="hasMore"
        class="load-more-btn"
        @click="loadMoreMainComments"
        :class="{ loading: loading }"
      >
        <view v-if="!loading">
          <text>加载更多</text>
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

    <bottom-popup :show="actionPopupVisible" @close="closeActionPopup">
      <view class="action-popup-panel">
        <view class="action-popup-title">评论操作</view>
        <view class="action-popup-item" @tap="handlePopupReply">回复</view>
        <view class="action-popup-item" @tap="handlePopupAttitude">表态</view>
        <view class="action-popup-item danger" @tap="handlePopupReport">举报</view>
        <view class="action-popup-cancel" @tap="closeActionPopup">取消</view>
      </view>
    </bottom-popup>

    <report-button
      ref="reportActionRef"
      :report-type="5"
      :relation-id="reportTargetId"
      button-text="举报"
      class="report-action-trigger"
    />
  </view>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { websiteUrl, global } from '../../common/config.js'

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

const emit = defineEmits(['reply'])

const commentList = ref([])
const currentPage = ref(1)
const hasMore = ref(true)
const loading = ref(false)
const tempCommentMap = ref({})

const actionPopupVisible = ref(false)
const actionParent = ref(null)
const actionTarget = ref(null)
const reportTargetId = ref(0)
const reportActionRef = ref(null)
const lastLongpressAt = ref(0)

const ATTITUDE_OPTIONS = [
  { emoji: '😝', value: 1, label: '很有趣' },
  { emoji: '😨', value: 2, label: '这个...' },
  { emoji: '🤤', value: 3, label: '我也想要' },
  { emoji: '🤦‍♀️', value: 4, label: '难以直视' },
  { emoji: '🔴', value: 5, label: '谁的鼻子掉了?' },
]

const normalizeUsername = comment => {
  if (!comment) return '未知用户'
  const name =
    comment.username ||
    comment.nickname ||
    comment.user_name ||
    comment.author_name ||
    comment.name ||
    ''
  if (name) return name
  return Number(comment.is_anonymous) === 1 ? '匿名用户' : '未知用户'
}

const normalizeAttitudeCounts = source => ({
  1: Number(source?.[1] ?? source?.count_1 ?? 0),
  2: Number(source?.[2] ?? source?.count_2 ?? 0),
  3: Number(source?.[3] ?? source?.count_3 ?? 0),
  4: Number(source?.[4] ?? source?.count_4 ?? 0),
  5: Number(source?.[5] ?? source?.count_5 ?? 0),
})

const normalizeCommentBase = comment => ({
  ...comment,
  uid: comment?.uid || comment?.user_id || 0,
  comment: comment?.comment || comment?.content || '',
  username: normalizeUsername(comment),
  attitudeStatus: Number(comment?.attitudeStatus ?? comment?.user_attitude ?? 0),
  attitudeCounts: normalizeAttitudeCounts(
    comment?.attitudeCounts || comment?.attitude_counts || comment
  ),
})

const normalizeMainComment = comment => {
  const base = normalizeCommentBase(comment)
  const localChildren = (comment.children || []).map(child => normalizeCommentBase(child))
  return {
    ...base,
    showAll: false,
    localChildren,
    childTotal: comment.childTotal || localChildren.length,
  }
}

defineExpose({
  reloadList: async () => {
    if (loading.value) return
    currentPage.value = 1
    hasMore.value = true
    tempCommentMap.value = {}
    await loadMainComments()
  },

  addNewComment: comment => {
    const tempComment = {
      ...normalizeCommentBase(comment),
      isTemp: true,
      showAll: false,
      localChildren: [],
      childTotal: 0,
    }

    tempCommentMap.value[comment.id] = tempComment
    commentList.value.unshift(tempComment)
  },

  addReplyComment: reply => {
    const parentId = reply.parent_id
    const parent = commentList.value.find(c => c.id === parentId)

    if (parent) {
      const tempReply = {
        ...normalizeCommentBase(reply),
        isTemp: true,
      }

      tempCommentMap.value[reply.id] = tempReply

      if (!parent.localChildren) parent.localChildren = []
      if (typeof parent.childTotal !== 'number') parent.childTotal = 0

      parent.localChildren.unshift(tempReply)
      parent.childTotal += 1

      if (!parent.showAll && parent.childTotal <= 5) {
        parent.showAll = true
      }
    }
  },

  updateTempComment: (tempId, newComment) => {
    const mainIndex = commentList.value.findIndex(c => c.id === tempId)
    if (mainIndex !== -1) {
      const old = commentList.value[mainIndex]
      commentList.value[mainIndex] = {
        ...normalizeCommentBase(newComment),
        showAll: old.showAll,
        localChildren: old.localChildren || [],
        childTotal: old.childTotal || 0,
      }
      delete tempCommentMap.value[tempId]
      return
    }

    for (const parent of commentList.value) {
      if (parent.localChildren && parent.localChildren.length) {
        const childIndex = parent.localChildren.findIndex(c => c.id === tempId)
        if (childIndex !== -1) {
          parent.localChildren[childIndex] = {
            ...normalizeCommentBase(newComment),
            parent_id: parent.localChildren[childIndex].parent_id,
          }
          delete tempCommentMap.value[tempId]
          return
        }
      }
    }
  },

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

onMounted(() => {
  loadMainComments()
})

const handleCardTap = (parent, target = null) => {
  if (Date.now() - lastLongpressAt.value < 900) return
  handleReply(parent, target && target.id !== parent.id ? target : null)
}

const openActionPopup = (parent, target = null) => {
  lastLongpressAt.value = Date.now()
  actionParent.value = parent
  actionTarget.value = target || parent
  reportTargetId.value = Number((target || parent)?.id || 0)
  actionPopupVisible.value = true
}

const closeActionPopup = () => {
  actionPopupVisible.value = false
}

const handlePopupReply = () => {
  const parent = actionParent.value
  const target = actionTarget.value
  if (!parent) return

  closeActionPopup()
  handleReply(parent, target && target.id !== parent.id ? target : null)
}

const applyAttitude = async (comment, actionType) => {
  const token = uni.getStorageSync('token')
  if (!token || !global.isLogin) {
    uni.showToast({
      title: '请先登录',
      icon: 'none',
    })
    return
  }

  try {
    const currentStatus = Number(comment.attitudeStatus || 0)
    const isActive = currentStatus === actionType
    const apiUrl = `${websiteUrl.value}/with-state/attitude/${isActive ? 'remove' : 'add'}`

    const res = await uni.request({
      url: apiUrl,
      method: 'POST',
      data: {
        target_id: comment.id,
        type: 6,
        action_type: actionType,
      },
      header: {
        Authorization: token,
      },
    })

    if (res.data.status !== 'success') {
      uni.showToast({
        title: res.data.msg || '操作失败',
        icon: 'none',
      })
      return
    }

    const counts = normalizeAttitudeCounts(comment.attitudeCounts || {})
    if (isActive) {
      counts[actionType] = Math.max(0, (counts[actionType] || 0) - 1)
      comment.attitudeStatus = 0
    } else {
      if (currentStatus > 0) {
        counts[currentStatus] = Math.max(0, (counts[currentStatus] || 0) - 1)
      }
      counts[actionType] = (counts[actionType] || 0) + 1
      comment.attitudeStatus = actionType
    }
    comment.attitudeCounts = counts

    uni.showToast({
      title: isActive ? '已取消表态' : '表态成功',
      icon: 'none',
    })
  } catch (error) {
    uni.showToast({
      title: '操作失败',
      icon: 'none',
    })
  }
}

const handlePopupAttitude = () => {
  const target = actionTarget.value
  if (!target) return
  closeActionPopup()

  uni.showActionSheet({
    itemList: ATTITUDE_OPTIONS.map(item => `${item.emoji} ${item.label}`),
    success: async ({ tapIndex }) => {
      const selected = ATTITUDE_OPTIONS[tapIndex]
      if (selected) {
        await applyAttitude(target, selected.value)
      }
    },
  })
}

const handlePopupReport = async () => {
  if (!reportTargetId.value) return
  closeActionPopup()
  await nextTick()
  reportActionRef.value?.openReport?.()
}

const visibleChildren = comment => {
  if (!comment.showAll && comment.localChildren.length > 5) {
    return comment.localChildren.slice(0, 5)
  }
  return comment.localChildren
}

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

const previewImage = url => {
  uni.previewImage({
    urls: [url],
    current: url,
  })
}

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
    const url = `${websiteUrl.value}/with-state/${comment.user_like ? 'unlike' : 'add-like'}`
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
  } catch (error) {
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
  return name.length > 12 ? `${name.slice(0, 12)}...` : name
}

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
      const newComments = (data.comment_list || []).map(c => normalizeMainComment(c))

      if (currentPage.value === 1) {
        commentList.value = newComments
      } else {
        commentList.value.push(...newComments)
      }

      hasMore.value = data.total > commentList.value.length
    }
  } catch (error) {
    uni.showToast({
      title: '加载失败',
      icon: 'none',
    })
  } finally {
    loading.value = false
  }
}

const handleReply = (parent, target = null) => {
  emit('reply', {
    parent,
    target,
    relationId: props.relationId,
  })
}

const getAssociationTypeText = type => {
  return type === 1 ? '娃物' : type === 2 ? '店铺' : '关联内容'
}

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

const remainingCount = comment => {
  return comment.childTotal - Math.min(comment.localChildren.length, 5)
}

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
        const extraChildren = (res.data.data.comment_list || []).map(item =>
          normalizeCommentBase(item)
        )
        comment.localChildren = [...comment.localChildren, ...extraChildren]
        comment.childTotal = res.data.data.total

        if (comment.localChildren.length >= 5 && !comment.showAll) {
          comment.showAll = true
        }
      }
    } catch (error) {
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
  padding-top: 6rpx;

  .empty-tips {
    text-align: center;
    padding: 96rpx 0;

    text {
      color: #98a2ad;
      font-size: 24rpx;
    }
  }
}

.comment-card {
  background: #fff;
  border-radius: 20rpx;
  margin-bottom: 18rpx;
  padding: 24rpx 22rpx;
}

.main-comment,
.sub-comment {
  display: flex;
  align-items: flex-start;

  .avatar {
    width: 72rpx;
    height: 72rpx;
    border-radius: 50%;
    margin-right: 20rpx;
    flex-shrink: 0;
    border: 2rpx solid #f0f0f0;
  }

  .content {
    flex: 1;
    min-height: 96rpx;
    display: flex;
    flex-direction: column;

    .header {
      display: flex;
      align-items: center;
      min-height: 40rpx;
      margin-bottom: 10rpx;

      .header-left {
        display: flex;
        align-items: center;
      }

      .username {
        font-size: 22rpx;
        color: #7f8892;
        font-weight: 500;
        max-width: 400rpx;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .floor {
        font-size: 22rpx;
        color: #9ea6af;
        margin-left: 10rpx;
      }
    }

    .comment-text {
      margin: 4rpx 0 10rpx;
      flex: 1;
      min-height: 54rpx;
      word-break: break-all;
    }
  }
}

.sub-comments {
  margin-left: 86rpx;
  margin-top: 14rpx;
  padding: 10rpx 14rpx 6rpx;
  border-radius: 14rpx;
  background: #f8fafc;

  .sub-comment {
    .avatar {
      width: 52rpx;
      height: 52rpx;
      margin-right: 16rpx;
    }
  }

  .sub-comment + .sub-comment {
    margin-top: 16rpx;
    padding-top: 16rpx;
    border-top: 1rpx solid #edf1f5;
  }

  .load-more {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 14rpx;
    margin-top: 8rpx;
    border-radius: 10rpx;

    text {
      font-size: 22rpx;
      color: #6b7a8c;
    }

    uni-icons {
      margin-left: 8rpx;
    }
  }
}

.footer {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-top: 10rpx;

  .left-actions {
    display: flex;
    align-items: center;
    gap: 16rpx;

    .time {
      font-size: 22rpx;
      color: #98a2ad;
    }

    .like-container {
      .like-btn {
        display: flex;
        align-items: center;
        gap: 8rpx;
        padding: 6rpx 12rpx;
        border-radius: 24rpx;
        background: #f6f8fb;

        .like-count {
          font-size: 22rpx;
          color: #98a2ad;

          &.liked {
            color: rgb(100 198 220);
          }
        }
      }
    }
  }

}

.sub-comment .footer {
  margin-top: 8rpx;
}

.comment-images {
  margin: 12rpx 0;

  .comment-image {
    width: 200rpx;
    height: 200rpx;
    border-radius: 10rpx;
  }
}

.association-card {
  display: flex;
  align-items: center;
  padding: 14rpx;
  background: #f9fbfd;
  border-radius: 14rpx;
  margin: 14rpx 0 8rpx;
  border: 1rpx solid #edf1f5;

  .association-image {
    width: 96rpx;
    height: 96rpx;
    border-radius: 10rpx;
    margin-right: 18rpx;
    background: #f4f6f8;
  }

  .association-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .association-name {
      font-size: 27rpx;
      color: #333;
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-bottom: 6rpx;
    }

    .association-type {
      font-size: 21rpx;
      color: #7f8a95;
      background: #eff3f7;
      padding: 4rpx 12rpx;
      border-radius: 20rpx;
      align-self: flex-start;
    }
  }

  .association-arrow {
    margin-left: 8rpx;
    flex-shrink: 0;
  }
}

.load-more-box {
  text-align: center;
  padding: 26rpx 0;

  text {
    font-size: 22rpx;
  }

  .load-more-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 64rpx;
    padding: 0 40rpx;
    border-radius: 64rpx;
    transition: all 0.2s;

    &.loading {
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
    color: #98a2ad;
    font-size: 24rpx;
    padding: 20rpx 0;
  }
}

.action-popup-panel {
  .action-popup-title {
    text-align: center;
    font-size: 24rpx;
    color: #9aa3ad;
    margin-bottom: 12rpx;
  }

  .action-popup-item {
    height: 92rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30rpx;
    color: #2f3945;
    border-bottom: 1rpx solid #f1f4f7;

    &.danger {
      color: #e55d62;
      border-bottom: none;
    }
  }

  .action-popup-cancel {
    height: 92rpx;
    margin-top: 18rpx;
    border-radius: 16rpx;
    background: #f7f8fa;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30rpx;
    color: #5f6975;
  }
}

.report-action-trigger {
  position: fixed;
  left: -9999px;
  top: -9999px;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
