<template>
	<view class="container">
		<meta name="theme-color" content="#F8F8F8">
		</meta>
		<scroll-view class="scroll-content" scroll-y @scrolltolower="loadMore" :show-scrollbar="false">
			<view v-if="list.length === 0 && !loading" class="empty-tip">
				暂无发布的搭配，快去创建吧~
			</view>

			<view v-for="(item, index) in list" :key="index" class="collocation-card">
				<!-- 头部信息 -->
				<view class="card-header">
					<image class="avatar" :src="item.avatar || `${image1Url}/default-avatar.png`" mode="aspectFill" />
					<text class="time">{{ formatTime(item.created_at) }}</text>
				</view>

				<!-- 图片展示 -->
				<view class="image-container">
					<swiper v-if="item.image_urls.length > 1" class="swiper-box" :autoplay="false" :circular="true">
						<swiper-item v-for="(img, imgIndex) in item.image_urls" :key="imgIndex">
							<image class="swiper-image" :src="img" mode="aspectFill" lazy-load
								:style="{ aspectRatio: '3/4' }" />
						</swiper-item>
					</swiper>
					<image v-else class="single-image" :src="item.image_urls[0]" mode="aspectFill" lazy-load
						:style="{ aspectRatio: '3/4' }" />
				</view>

				<!-- 内容区域 -->
				<view class="content-box">
					<text class="title">{{ item.title }}</text>
					<text class="content">{{ item.content }}</text>
				</view>

				<!-- 关联商品 -->
				<view class="relation-box" v-if="item.relation_list.length > 0">
					<text class="relation-label">搭配包含：</text>
					<scroll-view scroll-x class="tag-scroll">
						<view v-for="(rel, relIndex) in item.relation_list" :key="relIndex" class="relation-tag">
							{{ rel.type }}·{{ rel.relation_goods_name || rel.relation_brand_name }}
						</view>
					</scroll-view>
				</view>


			</view>

			<!-- 加载状态 -->
			<view v-if="loading" class="loading-box">
				<image src="/static/images/loading.gif" class="loading-icon" />
				<text>加载中...</text>
			</view>
			<view v-if="noMore" class="no-more">没有更多了～</view>
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
		image1Url,
		asyncGetUserInfo
	} from '../../common/config.js'

	const list = ref([])
	const page = ref(1)
	const pageSize = ref(10)
	const total = ref(0)
	const loading = ref(false)
	const noMore = ref(false)

	// 时间格式化
	const formatTime = (timestamp) => {
		const date = new Date(timestamp * 1000)
		return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`
	}

	// 获取数据
	const getList = async () => {
		if (noMore.value || loading.value) return

		loading.value = true
		try {
			const userInfo = await asyncGetUserInfo()
			if (!userInfo) return

			const res = await uni.request({
				url: `${websiteUrl}/with-state/my-collocation`,
				method: 'GET',
				header: {
					Authorization: uni.getStorageSync('token')
				},
				data: {
					page: page.value,
					page_size: pageSize.value
				}
			})

			if (res.data.status === 'success') {
				list.value = [...list.value, ...res.data.data.collocation_relation_list]
				total.value = res.data.data.total
				noMore.value = list.value.length >= total.value
				page.value++
			}
		} catch (error) {
			uni.showToast({
				title: '加载失败',
				icon: 'none'
			})
		} finally {
			loading.value = false
		}
	}

	// 加载更多
	const loadMore = () => {
		if (!noMore.value) getList()
	}

	uni.setNavigationBarTitle({
		title: '我的搭配'
	})

	onMounted(() => {
		getList()
	})
</script>

<style lang="less" scoped>
	.container {
		padding: 20rpx 24rpx;
		background-color: #f5f5f5;
		min-height: 100vh;
	}

	.scroll-content {
		height: calc(100vh - 40rpx);
	}

	.collocation-card {
		background: #fff;
		border-radius: 16rpx;
		margin-bottom: 24rpx;
		padding: 24rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	}

	.card-header {
		display: flex;
		align-items: center;
		margin-bottom: 24rpx;

		.avatar {
			width: 64rpx;
			height: 64rpx;
			border-radius: 50%;
			margin-right: 16rpx;
		}

		.time {
			font-size: 24rpx;
			color: #999;
		}
	}

	.image-container {
		border-radius: 20rpx;
		overflow: hidden;

		.swiper-box {
			height: 800rpx;

			.swiper-image {
				width: 100%;
				height: 100%;
			}
		}

		.single-image {
			width: 100%;
			height: 800rpx;
		}
	}

	.content-box {
		margin: 24rpx 0;

		.title {
			display: block;
			font-size: 32rpx;
			font-weight: 500;
			color: #333;
			margin: 20rpx;
			// margin-bottom: 16rpx;
		}

		.content {
			font-size: 22rpx;
			color: #666;
			line-height: 1.6;
			margin: 20rpx;
		}
	}

	.relation-box {
		background: #f8f8f8;
		border-radius: 8rpx;
		padding: 16rpx;
		margin: 24rpx 0;

		.relation-label {
			font-size: 24rpx;
			color: #999;
			margin-right: 16rpx;
		}

		.tag-scroll {
			white-space: nowrap;
			margin-top: 12rpx;

			.relation-tag {
				display: inline-block;
				background: #fff;
				border-radius: 32rpx;
				padding: 8rpx 20rpx;
				margin-right: 16rpx;
				font-size: 24rpx;
				color: #666;
				border: 1rpx solid #eee;
			}
		}
	}

	.action-bar {
		display: flex;
		align-items: center;
		justify-content: flex-end;

		.like-box {
			display: flex;
			align-items: center;

			.like-icon {
				width: 36rpx;
				height: 36rpx;
				margin-right: 8rpx;
			}

			.like-count {
				font-size: 24rpx;
				color: #999;
			}
		}
	}

	.empty-tip {
		text-align: center;
		padding: 100rpx 0;
		color: #999;
		font-size: 28rpx;
	}

	.loading-box,
	.no-more {
		text-align: center;
		padding: 30rpx 0;
		color: #999;
		font-size: 24rpx;

		.loading-icon {
			width: 40rpx;
			height: 40rpx;
			margin-right: 16rpx;
		}
	}
</style>