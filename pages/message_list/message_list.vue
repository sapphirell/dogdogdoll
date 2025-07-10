<template>
	<view class="container">
		<view-logs />
		<meta name="theme-color" content="#F8F8F8"></meta>
		<!-- 顶部未读消息 -->
		<!--    <view class="header">
      <text class="unread-count">未读消息：{{ unreadCount }}</text>
    </view> -->

		<!-- 消息列表 -->
		<scroll-view class="message-list" scroll-y  @scrolltolower="loadMore" :show-scrollbar=false>
			<uni-swipe-action>
				<uni-swipe-action-item v-for="item in messageList" :key="item.id" :right-options="swipeOptions(item)"
					:threshold="0.4" @click="handleSwipeClick">
					<view class="message-item" @tap="gotoDetail(item.id)">
						<!-- 头图 -->
						<image class="cover-image" :src="item.cover_image" mode="aspectFill" />

						<!-- 消息内容 -->
						<view class="content">
							<text class="title">{{ item.title }}</text>
							<text class="msg" :class="{unread: !item.is_read}">{{ item.msg }}</text>
						</view>

						<!-- 时间 -->
						<text class="time">{{ formatTime(item.created_at) }}</text>
					</view>
				</uni-swipe-action-item>
			</uni-swipe-action>
			<view class="loading-wrapper">
				<text v-if="loading" class="loading-text">加载中...</text>
				<text v-if="!hasMore" class="loading-text">没有更多数据了</text>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted
	} from 'vue';
	import {
		websiteUrl,
		global,
		asyncGetUserInfo
	} from '../../common/config.js';

	const messageList = ref([]);
	const unreadCount = ref(0);
	const page = ref(1);
	const isRefreshing = ref(false);
	const hasMore = ref(true);
	const loading = ref(false);
	// 滑动选项配置
	const swipeOptions = (item) => {
		return [{
				text: '删除',
				style: {
					backgroundColor: '#dd524d'
				},
				data: {
					type: 'delete',
					id: item.id
				}
			},
			{
				text: item.is_read ? '已读' : '标记已读',
				style: {
					backgroundColor: '#6fd0d4'
				},
				data: {
					type: 'read',
					id: item.id
				}
			}
		];
	};

	// 初始化数据
	onMounted(async () => {
		await asyncGetUserInfo();
		fetchMessages();
		fetchUnreadCount();
		uni.setNavigationBarTitle({
			title: "消息"
		})
	});

	// 获取消息列表
	const fetchMessages = async (isLoadMore = false) => {
		try {
			loading.value = true;
			const targetPage = isLoadMore ? page.value : 1;

			const res = await uni.request({
				url: `${websiteUrl}/with-state/user-messages?page=${targetPage}`,
				header: {
					Authorization: uni.getStorageSync('token')
				}
			});

			if (res.data.status === 'success') {
				const newMessages = res.data.data.message_list;

				if (isLoadMore) {
					messageList.value = [...messageList.value, ...newMessages];
				} else {
					messageList.value = newMessages;
				}

				// 判断是否还有更多数据
				hasMore.value = newMessages.length >= 10; // 假设每页10条
				page.value = targetPage + (hasMore.value ? 1 : 0);
			}
		} catch (error) {
			uni.showToast({
				title: '消息加载失败',
				icon: 'none'
			});
		} finally {
			loading.value = false;
			isRefreshing.value = false;
		}
	};

	// 新增下拉刷新处理
	const onRefresh = () => {
		if (loading.value) return;
		isRefreshing.value = true;
		page.value = 1;
		hasMore.value = true;
		fetchMessages();
	};

	// 新增上拉加载更多处理
	const loadMore = () => {
	  console.log('触发加载更多', loading.value, hasMore.value);
	  if (loading.value || !hasMore.value) return;
	  fetchMessages(true);
	};

	// 获取未读数量
	const fetchUnreadCount = async () => {
		try {
			const res = await uni.request({
				url: `${websiteUrl}/with-state/unread-message-count`,
				header: {
					Authorization: uni.getStorageSync('token')
				}
			});

			if (res.data.status === 'success') {
				unreadCount.value = res.data.data.count;
			}
		} catch (error) {
			uni.showToast({
				title: '未读数获取失败',
				icon: 'none'
			});
		}
	};

	// 处理滑动按钮点击
	const handleSwipeClick = (e) => {
		const {
			type,
			id
		} = e.content.data;

		if (type === 'delete') {
			showDeleteConfirm(id);
		} else if (type === 'read') {
			markAsRead(id);
		}
	};

	// 显示删除确认弹窗
	const showDeleteConfirm = (messageId) => {
		uni.showModal({
			title: '删除确认',
			content: '确定要删除这条消息吗？',
			success: (res) => {
				if (res.confirm) {
					deleteMessage(messageId);
				}
			}
		});
	};

	// 删除消息
	const deleteMessage = async (messageId) => {
		try {
			await uni.request({
				url: `${websiteUrl}/with-state/delete-message`,
				method: 'POST',
				header: {
					'Authorization': uni.getStorageSync('token'),
					'Content-Type': 'application/json'
				},
				data: {
					message_id: messageId
				}
			});

			messageList.value = messageList.value.filter(item => item.id !== messageId);
			fetchUnreadCount();
			uni.showToast({
				title: '删除成功'
			});
		} catch (error) {
			uni.showToast({
				title: '删除失败',
				icon: 'none'
			});
		}
	};

	// 标记为已读
	const markAsRead = async (messageId) => {
		try {
			await uni.request({
				url: `${websiteUrl}/with-state/mark-message-read`,
				method: 'POST',
				header: {
					'Authorization': uni.getStorageSync('token'),
					'Content-Type': 'application/json'
				},
				data: {
					message_id: messageId
				}
			});

			const item = messageList.value.find(i => i.id === messageId);
			if (item && !item.is_read) {
				item.is_read = 1;
				unreadCount.value--;
			}
		} catch (error) {
			uni.showToast({
				title: '标记失败',
				icon: 'none'
			});
		}
	};

	// 跳转详情页
	const gotoDetail = (id) => {
		uni.navigateTo({
			url: `/pages/message_info/message_info?message_id=${id}`
		});
	};

	// 时间格式化
	const formatTime = (timestamp) => {
		const date = new Date(timestamp * 1000);
		return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
	};
	
	
</script>

<style lang="less">
	@primary-color: #2a6af4; // 主色调
	@unread-color: #ff6a00; // 未读提示色
	@delete-color: #ff4458; // 删除按钮色
	@read-color: #00c777; // 已读按钮色

	.container {
		background: #f8f9fb;
		// height: calc(100vh - 100rpx);

		.header {
			padding: 24rpx 32rpx;
			background: #fff;
			box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);

			.unread-count {
				font-size: 28rpx;
				color: @primary-color;
				font-weight: 500;
				display: flex;
				align-items: center;

				&::before {
					content: '';
					display: block;
					width: 36rpx;
					height: 36rpx;
					background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%232a6af4" d="M20 8H4v10h16zm0 2l-8 5-8-5V8l8 5 8-5zM4 6h16v12H4z"/></svg>');
					background-size: contain;
					margin-right: 12rpx;
				}
			}
		}

		.uni-swipe_button-group {
			border-radius: 0 24rpx 24rpx 0;
			overflow: hidden;
		}

		.message-list {
			padding: 24rpx 32rpx;
			width: 680rpx;
			height: 90vh;

			.message-item {
				padding: 32rpx;
				// margin-bottom: 24rpx;
				background: #fff;
				border-radius: 24rpx;
				box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.03);
				transition: transform 0.2s;
				display: flex;

				&:active {
					transform: scale(0.98);
				}

				.cover-image {
					width: 96rpx;
					height: 96rpx;
					border-radius: 16rpx;
					margin-right: 32rpx;
					flex-shrink: 0;
				}

				.content {
					width: 360rpx;

					.title {
						font-size: 32rpx;
						color: #1a1a1a;
						font-weight: 600;
						margin-bottom: 8rpx;
						display: -webkit-box;
						-webkit-line-clamp: 1;
						-webkit-box-orient: vertical;
						overflow: hidden;
					}

					.msg {
						font-size: 28rpx;
						line-height: 1.4;
						color: #666;
						display: -webkit-box;
						-webkit-line-clamp: 2;
						-webkit-box-orient: vertical;
						overflow: hidden;

						&.unread {
							color: @unread-color;
							position: relative;
							padding-left: 36rpx;

							&::before {
								content: '';
								position: absolute;
								left: 0;
								top: 50%;
								transform: translateY(-50%);
								width: 12rpx;
								height: 12rpx;
								background: @unread-color;
								border-radius: 50%;
							}
						}
					}
				}

				.time {
					font-size: 24rpx;
					color: #999;
					position: absolute;
					right: 32rpx;
					top: 32rpx;
				}
			}
		}
	}

	// 滑动按钮样式优化
	.uni-swipe {
		&-action {
			border-radius: 24rpx;
			overflow: hidden;

			&__content {
				padding: 0 24rpx;
			}

			&__btn {
				width: 160rpx !important;
				font-size: 28rpx !important;
				font-weight: 500 !important;

				&[style*="background-color: #dd524d"] {
					background: @delete-color !important;
				}

				&[style*="background-color: #4cd964"] {
					background: @read-color !important;
				}
			}
		}
	}

	.uni-swipe {
		margin-bottom: 24rpx;
	}

	.uni-swipe-action {
		margin-bottom: 24rpx;

		&__btn-group {
			height: calc(100% - 24rpx);
			margin-bottom: 24rpx;
		}
	}

	.loading-wrapper {
		padding: 24rpx 0;
		text-align: center;

		.loading-text {
			font-size: 24rpx;
			color: #999;
		}
	}
</style>