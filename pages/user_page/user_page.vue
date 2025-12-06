<template>
	<view class="page-container">
		<meta name="theme-color" content="#F8F8F8">
			<view-logs />
		</meta>

		<view class="header_container">
			<!-- 头像和用户名区域 -->
			<view class="user-info-container">
				<view class="user-info-box">
					<image class="avatar" :src="userInfo.avatar" mode="aspectFill" />
					<text class="username">{{ userInfo.user_name }}</text>

					<!-- 操作按钮：私信 + 拉黑（放在用户名下方一排） -->
					<view class="action-buttons-inline">
						<view class="action-btn dm-btn" @click="startDM">
							<uni-icons type="chat" size="16" color="#fff"></uni-icons>
							<text>私信</text>
						</view>
						<view class="action-btn block-btn" :class="{ 'blocked': is_blocked }" @click="toggleBlock">
							<uni-icons :type="is_blocked ? 'minus' : 'minus'" size="16" color="#fff"></uni-icons>
							<text>{{ is_blocked ? '已拉黑' : '拉黑' }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 内容区域 -->
		<view class="content" v-if="!is_blocked && !they_blocked">
			<!-- Tab切换 -->
			<view class="tabs-container">
				<view class="tabs">
					<view
						v-for="(tab, index) in tabs"
						:key="index"
						class="tab-item font-alimamashuhei"
						:class="{ active: currentTab === index }"
						@click="currentTab = index"
					>
						{{ tab }}
					</view>
				</view>
			</view>

			<!-- 搭配列表 -->
			<view v-if="currentTab === 0" class="collocation-list">
				<view
					v-for="(item, index) in collocations"
					:key="index"
					class="collocation-item item-image-container"
					@click="navigateTo(`/pages/collocation_share/collocation_share?collocation_id=${item.id}&origin=1`)"
				>
					<image class="item-image" :src="item.cover" mode="aspectFill" />
					<text class="item-title">{{ item.title }}</text>
				</view>
			</view>

			<!-- 娃柜列表 -->
			<view v-if="currentTab === 1" class="doll-list">
				<view
					v-for="(item, index) in dolls"
					:key="index"
					class="doll-item item-image-container"
					@click="navigateTo(`/pages/collocation_share/collocation_share?collocation_id=${item.id}&origin=2`)"
				>
					<image class="item-image" :src="item.cover" mode="aspectFill" />
					<text class="item-title">{{ item.title }}</text>
					<text class="item-price">¥{{ item.price }}</text>
				</view>
			</view>

			<!-- 点评列表 -->
			<view v-if="currentTab === 2" class="review-list">
				<view
					v-for="(item, index) in reviews"
					:key="index"
					class="review-item"
					@click="navigateTo(`/pages/goods/goods?goods_id=${item.target_id}`)"
				>
					<image class="product-thumb" :src="item.product_thumb" mode="aspectFill" />
					<view class="review-content">
						<text class="product-name">{{ item.product_name }}</text>
						<text class="review-text">{{ item.content }}</text>
						<text class="review-time">{{ item.create_time }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 无权限提示 -->
		<view class="empty-state" v-if="is_blocked || they_blocked">
			<uni-icons type="minus" size="48" color="#ccc"></uni-icons>
			<text>你无法查看该用户的主页</text>
		</view>
	</view>
</template>

<script setup>
import { ref, watch } from 'vue'
import { onShow, onReachBottom } from '@dcloudio/uni-app'
import { websiteUrl } from '../../common/config.js'

const currentTab = ref(0)
const tabs = ref(['搭配', '娃柜', '点评'])
const props = defineProps(['uid'])

// 用户信息
const userInfo = ref({
  avatar: '',
  user_name: '加载中...'
})

// 黑名单状态
const is_blocked = ref(false)    // 我是否拉黑了对方
const they_blocked = ref(false)  // 对方是否拉黑了我

// 各列表数据
const collocations = ref([])
const dolls = ref([])
const reviews = ref([])

// 分页（每个tab独立）
const paginations = ref([
  { page: 1, pageSize: 10, total: 0, loading: false, finished: false }, // 搭配
  { page: 1, pageSize: 10, total: 0, loading: false, finished: false }, // 娃柜
  { page: 1, pageSize: 10, total: 0, loading: false, finished: false }  // 点评
])

// 监听tab切换
watch(currentTab, (newVal) => {
  const currentData = [collocations, dolls, reviews][newVal].value
  if (currentData.length === 0) {
    loadData()
  }
})

const navigateTo = (url) => {
  uni.navigateTo({ url })
}

// 统一数据加载方法
const loadData = async () => {
  if (is_blocked.value || they_blocked.value) return

  const pg = paginations.value[currentTab.value]
  if (pg.loading || pg.finished) return

  pg.loading = true
  try {
    let url, listKey
    switch (currentTab.value) {
      case 0:
        url = `/user-info/collection?user_id=${props.uid}&page=${pg.page}`
        listKey = 'List'
        break
      case 1:
        url = `/user-info/show-case?user_id=${props.uid}&page=${pg.page}`
        listKey = 'List'
        break
      case 2:
        url = `/user-info/posts?user_id=${props.uid}&page=${pg.page}`
        listKey = 'comment_list'
        break
    }
    const res = await uni.request({ url: `${websiteUrl.value}${url}` })
    if (res.data.status === 'success') {
      const data = res.data.data
      const list = data[listKey] || []

      // 数据转换
      const transformed = list.map(item => {
        switch (currentTab.value) {
          case 0: // 搭配
            return {
              id: item.id,
              cover: item.image_urls?.split(',')[0] || '',
              images: item.image_urls?.split(',') || [],
              title: item.title,
              time: item.created_at
            }
          case 1: // 娃柜
            return {
              id: item.id,
              cover: item.image_urls?.split(',')[0] || '',
              title: item.name,
              desc: item.description,
              time: item.created_at,
              price: item.price || 0
            }
          case 2: // 点评
            return {
              id: item.id,
              product_thumb: item.target_image,
              product_name: item.target_name,
              content: item.comment,
              create_time: formatTime(item.created_at),
              target_id: item.relation_id
            }
        }
      })

      // 更新数据
      const target = [collocations, dolls, reviews][currentTab.value]
      target.value = [...target.value, ...transformed]

      // 更新分页
      pg.total = Number(data.total || 0)
      pg.finished = target.value.length >= pg.total
      pg.page++
    }
  } catch (error) {
    console.log(error)
    uni.showToast({ title: '数据加载失败', icon: 'none' })
  } finally {
    pg.loading = false
  }
}

// 获取用户信息
const getAuthorInfo = async () => {
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/user-info?uid=${props.uid}`
    })
    if (res.data.status === 'success') {
      userInfo.value = res.data.data
    }
  } catch (error) {
    uni.showToast({ title: '用户信息加载失败', icon: 'none' })
  }
}

// 获取黑名单状态
const getBlockStatus = async () => {
  const token = uni.getStorageSync('token')
  if (!token) {
    console.log('未登录')
    return
  }
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/blacklist/status`,
      method: 'GET',
      data: { target_user_id: props.uid },
      header: { Authorization: token }
    })
    if (res.data.status === 'success') {
      is_blocked.value = !!res.data.data.is_blocked
      they_blocked.value = !!res.data.data.they_blocked
    }
  } catch (error) {
    console.log('获取黑名单状态失败', error)
  }
}

// 切换拉黑状态
const toggleBlock = async () => {
  try {
    const token = uni.getStorageSync('token')
    if (!token) {
      console.log('未登录')
      return
    }
    const action = is_blocked.value ? 'remove' : 'add'
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/blacklist/${action}?target_user_id=${props.uid}`,
      method: 'POST',
      header: { Authorization: token }
    })
    if (res.data.status === 'success') {
      is_blocked.value = !is_blocked.value
      uni.showToast({
        title: is_blocked.value ? '已加入黑名单' : '已移除黑名单',
        icon: 'none'
      })
      if (is_blocked.value || they_blocked.value) {
        collocations.value = []
        dolls.value = []
        reviews.value = []
      }
    } else {
      uni.showToast({ title: res.data.msg, icon: 'none' })
    }
  } catch (error) {
    console.log('操作失败', error)
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

// 发起私信：创建/获取会话并跳转聊天页
const startDM = async () => {
  if (is_blocked.value) {
    return uni.showToast({ title: '你已拉黑对方，无法私信', icon: 'none' })
  }
  if (they_blocked.value) {
    return uni.showToast({ title: '对方已拉黑你，无法私信', icon: 'none' })
  }
  const token = uni.getStorageSync('token')
  if (!token) {
    return uni.showToast({ title: '请先登录', icon: 'none' })
  }
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/im/start-session?peer_id=${props.uid}`,
      method: 'POST',
      header: { Authorization: token }
    })
    if (res?.data?.status === 'success') {
      const sid = res?.data?.data?.session_id
      if (!sid) throw new Error('no session_id')
      navigateToChat(sid)
    } else {
      uni.showToast({ title: res?.data?.msg || '发起私信失败', icon: 'none' })
    }
  } catch (e) {
    console.log('startDM error', e)
    uni.showToast({ title: '发起私信失败', icon: 'none' })
  }
}

// 跳转到聊天页（按你的项目实际路径修改）
const navigateToChat = (sessionId) => {
  const url = `/pkg-im/chat/chat?session_id=${encodeURIComponent(sessionId)}&peer_id=${props.uid}`
  uni.navigateTo({ url })
}

// 时间格式化
const formatTime = (timestamp) => {
  const date = new Date(timestamp * 1000)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// 设置标题
uni.setNavigationBarTitle({ title: '用户主页' })

// 初始化加载
onShow(() => {
  getAuthorInfo()
  getBlockStatus().then(() => {
    if (!is_blocked.value && !they_blocked.value) {
      loadData()
    }
  })
})

// 上拉加载更多
onReachBottom(() => {
  loadData()
})
</script>

<style lang="less" scoped>
.page-container {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 20rpx;
}

.header_container {
  position: relative;
  background-image: url('https://images1.fantuanpu.com/bd/bg2.jpg');
  background-size: cover;
  padding-bottom: 40rpx;
  border-bottom-left-radius: 30rpx;
  border-bottom-right-radius: 30rpx;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.1);
  margin-bottom: 20rpx;
  background-position: 0px -293rpx;
}

.user-info-container {
  align-items: center;
  padding-top: 70rpx;
  padding-bottom: 0rpx;
}

.user-info-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 10;
}

.avatar {
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  border: 6rpx solid white;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.2);
  margin-bottom: 20rpx;
  background-color: white;
}

.username {
  font-size: 32rpx;
  font-weight: bold;
  color: #5f5f5f;
  text-align: center;
}

/* 新增：按钮在用户名下方同排 */
.action-buttons-inline {
  margin-top: 16rpx;
  display: flex;
  gap: 16rpx;
  justify-content: center;
}

.action-btn {
  padding: 10rpx 24rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: rgba(0, 0, 0, 0.25);
  color: #fff;

  &.blocked {
    background: rgba(255, 87, 87, 0.9);
  }
}

.dm-btn {
  background: linear-gradient(135deg, #59dcef, #7ad6ff);
  color: #fff;
  font-weight: 600;
  box-shadow: 0 4rpx 10rpx rgba(89, 220, 239, 0.35);
}

/* 废弃：右上角绝对定位按钮（已不再使用）
.action-buttons {
  position: absolute;
  right: 30rpx;
  top: 30rpx;
  z-index: 20;
} */

.block-info {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8rpx;
  padding: 15rpx;
  margin: 15rpx 30rpx;
  text-align: center;
  color: white;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.empty-state {
  text-align: center;
  padding: 80rpx 30rpx;
  color: #999;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
}

.tabs-container {
  position: relative;
  margin: 20rpx 0 40rpx 0;
  padding: 0 20rpx;
}

.tabs {
  display: flex;
  background-color: white;
  border-radius: 60rpx;
  padding: 12rpx;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.08);
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 10rpx 0;
  font-size: 25rpx;
  color: #666;
  border-radius: 50rpx;
  transition: all 0.3s ease;

  &.active {
    color: #59dcef;
    font-weight: bold;
    background: #dffbff;
    box-shadow: 0 2rpx 8rpx rgba(87, 146, 211, 0.2);
  }
}

.content {
  padding: 20rpx;
  box-sizing: border-box;
  background: #f5f5f5;
  border-radius: 20rpx;
}

/* 通用图片容器样式 */
.item-image-container {
  position: relative;
  width: 100%;
  padding-top: 100%;
  border-radius: 16rpx;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

  .item-image {
    height: calc(100% - 55rpx);
  }
}

/* 图片绝对定位填充容器 */
.item-image {
  width: 100%;
  height: 100%;
}

/* 搭配列表（一行三个） */
.collocation-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;

  .collocation-item {
    position: relative;
    padding: 8rpx;
    height: 250rpx;
    width: 200rpx;

    .item-title {
      padding: 10rpx;
      color: #4c4c4c;
      font-weight: 600;
      display: block;
    }
  }
}

/* 娃柜列表（一行两个） */
.doll-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;

  .doll-item {
    padding: 15rpx;
    background: #fff;
    border-radius: 16rpx;
    width: 300rpx;
    height: 450rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

    .item-title {
      display: block;
      font-size: 26rpx;
      margin: 15rpx 0 8rpx;
      padding: 0 10rpx;
      .ellipsis();
    }

    .item-price {
      display: block;
      color: #ff4444;
      font-size: 28rpx;
      font-weight: 600;
      padding: 0 10rpx 15rpx;
    }
  }
}

/* 点评列表 */
.review-list {
  .review-item {
    display: flex;
    padding: 20rpx;
    background-color: #fff;
    border-radius: 12rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
    cursor: pointer;
    transition: all 0.2s ease;

    &:active {
      transform: scale(0.98);
      background-color: #f9f9f9;
    }

    .product-thumb {
      width: 120rpx;
      height: 120rpx;
      border-radius: 12rpx;
    }

    .review-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding-left: 20rpx;
    }

    .product-name {
      font-size: 28rpx;
      font-weight: bold;
      margin-bottom: 10rpx;
    }

    .review-text {
      font-size: 26rpx;
      color: #666;
      margin-bottom: 10rpx;
      .multi-ellipsis(2);
    }

    .review-time {
      font-size: 24rpx;
      color: #999;
    }
  }
}

/* 文字截取 mixin */
.ellipsis() {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.multi-ellipsis(@lines) {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: @lines;
  overflow: hidden;
}
</style>
