<template>
  <view class="message-tab">
    <!-- 空状态 -->
    <view v-if="!loading && list.length === 0" class="empty-box">
      <text class="empty-text font-alimamashuhei">
        还没有收到任何站内信哦
      </text>
    </view>

    <!-- 列表 -->
    <view v-else class="list-wrap">
      <uni-swipe-action>
        <uni-swipe-action-item
          v-for="(item, index) in list"
          :key="item.id"
          :right-options="swipeOptions(item)"
          :threshold="0.4"
          @click="handleSwipeClick"
        >
          <view
            class="message-item"
            :style="itemStyle(index)"
            @tap="emit('open', item)"
          >
            <image class="cover-image" :src="item.cover_image" mode="aspectFill" />

            <view class="content">
              <text class="title font-alimamashuhei">{{ item.title }}</text>
              <text class="msg font-alimamashuhei" :class="{ unread: !item.is_read }">
                {{ item.msg }}
              </text>
            </view>

            <text class="time font-alimamashuhei">
              {{ formatTime(item.created_at) }}
            </text>
          </view>
        </uni-swipe-action-item>
      </uni-swipe-action>

      <view v-if="loading" class="loading-box">
        <loading-jump-text />
      </view>

      <view
        v-else-if="!finished && list.length > 0"
        class="load-more-box"
        @click="emit('load-more')"
      >
        <text class="load-more-text font-alimamashuhei">点击加载更多</text>
      </view>

      <view v-else-if="finished && list.length > 0" class="load-more-box">
        <text class="load-more-text font-alimamashuhei">已经到底啦</text>
      </view>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  active: { type: Boolean, default: true },
  list: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  finished: { type: Boolean, default: false }
})

const emit = defineEmits(['load-more', 'delete', 'read', 'open'])

const swipeOptions = (item) => ([
  {
    text: '删除',
    style: { backgroundColor: '#dd524d' },
    data: { type: 'delete', id: item.id }
  },
  {
    text: item.is_read ? '已读' : '标记已读',
    style: { backgroundColor: '#6fd0d4' },
    data: { type: 'read', id: item.id }
  }
])

function handleSwipeClick (e) {
  const { type, id } = e.content?.data || {}
  if (!id) return

  if (type === 'delete') emit('delete', id)
  if (type === 'read') emit('read', id)
}

function itemStyle (index) {
  const delay = index * 80
  return { animationDelay: delay + 'ms' }
}

function formatTime (timestamp) {
  if (!timestamp) return '--'
  const date = new Date(timestamp * 1000)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}`
}
</script>

<style lang="scss" scoped>
/* 原样保留你的样式（略） */
.message-tab { padding-top: 12rpx; }
.list-wrap { margin-top: 4rpx; }

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.message-item {
  position: relative;
  margin-top: 24rpx;
  padding: 24rpx 24rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.04);
  display: flex;

  opacity: 0;
  transform: translateY(16rpx);
  animation-name: fadeInUp;
  animation-duration: 0.32s;
  animation-timing-function: ease;
  animation-fill-mode: forwards;

  &:active { transform: scale(0.98); }
}

.cover-image {
  width: 96rpx;
  height: 96rpx;
  border-radius: 16rpx;
  margin-right: 24rpx;
  flex-shrink: 0;
  background: #f3f3f3;
}

.content { flex: 1; display: flex; flex-direction: column; padding-right: 24rpx; }

.title {
  font-size: 28rpx;
  color: #1a1a1a;
  font-weight: 600;
  margin-bottom: 8rpx;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.msg {
  font-size: 26rpx;
  line-height: 1.4;
  color: #666666;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  &.unread {
    color: #ff6a00;
    position: relative;
    padding-left: 30rpx;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 12rpx;
      height: 12rpx;
      background: #ff6a00;
      border-radius: 50%;
    }
  }
}

.time {
  position: absolute;
  right: 24rpx;
  top: 24rpx;
  font-size: 22rpx;
  color: #999999;
}

.empty-box { margin-top: 80rpx; text-align: center; }
.empty-text { font-size: 26rpx; color: #aaaaaa; }

.loading-box,
.load-more-box { margin: 24rpx 0 12rpx; text-align: center; }

.load-more-text { font-size: 24rpx; color: #888888; }
</style>
