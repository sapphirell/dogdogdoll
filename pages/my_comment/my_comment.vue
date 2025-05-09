<template>
	<view class="page-container">
		<!-- 列表区域 -->
		<scroll-view class="comment-list" scroll-y @scrolltolower="loadMore" :show-scrollbar="false">
			<!-- 列表内容 -->
			<view v-for="(item, index) in commentList" :key="index" class="comment-item"
				@click="navigateToTarget(item)">
				<!-- 用户信息 -->
				<view class="user-info">
					<image class="avatar" :src="item.avatar || '/static/default-avatar.png'" mode="aspectFill" />
					<view class="user-meta">
						<text class="username">{{item.username}}</text>
						<text class="time">{{ formatTime(item.created_at) }}</text>
					</view>
				</view>

				<!-- 回复内容 -->
				<view class="content-box">
					<text class="content">{{ item.comment }}</text>
				</view>

				<!-- 关联目标 -->
				<view class="target-box" @click="navigateToTarget(item)">
					<image class="target-image" :src="item.target_image" mode="aspectFill" v-if="item.target_image" />
					<view class="target-info">
						<view class="type-tag" :class="getTypeClass(item.type)">
							{{ getTypeName(item.type) }}
						</view>
						<text class="target-name">{{ item.target_name }}</text>
					</view>
				</view>
			</view>

			<!-- 加载状态 -->
			<view class="loading-status">
				<text v-if="loading" class="loading-text">加载中...</text>
				<text v-if="noMore" class="no-more-text">没有更多了</text>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted
	} from 'vue'
	import {
		websiteUrl,
		image1Url
	} from '../../common/config.js'

	// 响应式数据
	const commentList = ref([])
	const currentPage = ref(1)
	const pageSize = ref(10)
	const total = ref(0)
	const loading = ref(false)
	const noMore = ref(false)

	// 类型映射
	const commentTypes = {
		1: {
			name: '品牌',
			class: 'brand'
		},
		2: {
			name: '商品',
			class: 'goods'
		},
		3: {
			name: '搭配',
			class: 'collocation'
		},
		4: {
			name: '资讯',
			class: 'news'
		},
		5: {
			name: '树洞',
			class: 'treehole'
		},
		6: {
			name: '展示柜',
			class: 'collocation'
		},
	}

	// 生命周期
	onMounted(() => {
		loadComments()
	})

	// 加载评论
	const loadComments = async (isLoadMore = false) => {
		if (loading.value || noMore.value) return

		loading.value = true
		try {
			const res = await uni.request({
				url: `${websiteUrl}/with-state/my-comment`,
				method: 'GET',
				header: {
					"Authorization": uni.getStorageSync('token')
				},
				data: {
					page: currentPage.value,
					page_size: pageSize.value
				}
			})

			if (res.data.status === 'success') {
				const data = res.data.data
				commentList.value = isLoadMore ?
					[...commentList.value, ...data.comment_list] :
					data.comment_list

				total.value = data.total
				currentPage.value++
				noMore.value = commentList.value.length >= total.value
			}
		} finally {
			loading.value = false
		}
	}

	// 加载更多
	const loadMore = () => {
		if (!noMore.value) loadComments(true)
	}

	// 跳转到页面
	const navigateToTarget = (item) => {
		let url = ''
		const id = item.relation_id

		// 根据类型跳转不同页面（路径需要您根据实际路由补全）
		switch (item.type) {
			case 1: // BrandComment
				url = `/pages/brand/brand?brand_id=${id}` // 品牌详情页
				break
			case 2: // GoodsComment
				url = `/pages/goods/goods?goods_id=${id}` // 商品详情页
				break
			case 3: // CollocationComment
				url = `/pages/collocation_share/collocation_share?collocation_id=${id}&origin=1` // 搭配详情页
				break
			case 4: // SaleNewsComment
				url = `/pages/sale_news/sale_news?newsId=${id}` // 资讯详情页
				break
			case 5: // TreeholeComment
				url = `/pages/treehole_detail/treehole_detail?id=${id}` // 树洞详情页
				break
			case 6: // Showcase
				url = `/pages/collocation_share/collocation_share?collocation_id=${id}&origin=2` 
				break
			default:
				uni.showToast({
					title: '未知类型',
					icon: 'none'
				})
				return
		}

		if (url) {
			uni.navigateTo({
				url: url
			})
		}
	}


	// 类型处理
	const getTypeName = (type) => commentTypes[type]?.name || '未知'
	const getTypeClass = (type) => commentTypes[type]?.class || ''

	// 文本截断
	const truncate = (text, length) => {
		return text.length > length ? text.substring(0, length) + '...' : text
	}


	//格式化时间戳
	function formatTime(timestamp) {
		const date = new Date(timestamp * 1000);
		const year = date.getFullYear();
		const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月份从0开始，需要+1
		const day = date.getDate().toString().padStart(2, '0');
		const hours = date.getHours().toString().padStart(2, '0');
		const minutes = date.getMinutes().toString().padStart(2, '0');
		const seconds = date.getSeconds().toString().padStart(2, '0');

		// 返回格式化后的日期时间
		return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
	}
	
	// 设置标题
	uni.setNavigationBarTitle({
		title: '我的评论'
	})
</script>

<style lang="less" scoped>
	.page-container {
		padding: 20rpx 30rpx;
		background-color: #f8f8f8;
		min-height: 100vh;
	}

	.comment-list {
		height: calc(100vh - 40rpx);
	}

	.comment-item {
		background: #fff;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	}

	.user-info {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;

		.avatar {
			width: 64rpx;
			height: 64rpx;
			border-radius: 50%;
			margin-right: 20rpx;
		}

		.user-meta {
			display: flex;
			flex-direction: column;
		}

		.username {
			font-size: 24rpx;
			color: #333;
			font-weight: 500;
			margin-bottom: 6rpx;
			max-width: 400rpx;
			/* 根据设计调整 */
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.time {
			font-size: 20rpx;
			color: #999;
		}
	}

	.content-box {
		margin-bottom: 24rpx;

		.content {
			font-size: 28rpx;
			line-height: 1.5;
			color: #333;
		}
	}

	.target-box {
		display: flex;
		align-items: center;
		padding: 16rpx;
		background: #f5f5f5;
		border-radius: 12rpx;

		.target-image {
			width: 80rpx;
			height: 80rpx;
			border-radius: 8rpx;
			margin-right: 20rpx;
		}

		.target-info {
			flex: 1;
			overflow: hidden;
		}

		.type-tag {
			display: inline-block;
			padding: 4rpx 12rpx;
			border-radius: 6rpx;
			font-size: 20rpx;
			margin-bottom: 8rpx;

			&.brand {
				background: #ffeaea;
				color: #ff4444;
			}

			&.goods {
				background: #e8f4ff;
				color: #409eff;
			}

			&.collocation {
				background: #fff6e6;
				color: #ff9900;
			}

			&.news {
				background: #e6f8f0;
				color: #67c23a;
			}

			&.treehole {
				background: #f0e6ff;
				color: #9254de;
			}
		}

		.target-name {
			max-width: 400rpx;
			/* 根据设计调整 */
			font-size: 24rpx;
			color: #666;
			display: block;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}

	.loading-status {
		text-align: center;
		padding: 30rpx;
		font-size: 24rpx;
		color: #999;

		.loading-text {
			&::after {
				content: '...';
				animation: loading 1s infinite;
			}
		}
	}

	@keyframes loading {
		0% {
			content: '.';
		}

		33% {
			content: '..';
		}

		66% {
			content: '...';
		}
	}
</style>