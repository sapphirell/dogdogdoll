<template>
	<view class="container">
		<meta name="theme-color" content="#F8F8F8"></meta>
		<view-logs />
		<!-- 分类导航 -->
		<view class="nav-bar">
			<view v-for="(item, index) in categories" :key="index" class="nav-item"
				:class="{ active: activeCategory === item.type }" @click="switchCategory(item.type)">
				{{ item.name }}
			</view>
		</view>

		<!-- 列表内容 -->
		<scroll-view class="scroll-view" scroll-y @scrolltolower="loadMore" :show-scrollbar="false">
			<view class="list-container">
				<block v-for="(item, index) in currentList" :key="item.id">
					<!-- 商品类型 -->
					<view v-if="activeCategory === 1 && item.goods" class="list-item goods-item"
						@click="navigateToGoods(item.goods.id)">
						<view class="goods-left">
							<image class="goods-thumb" :src="getFirstImage(item.goods.goods_images)"
								mode="aspectFill" />
							<view class="price-tag">¥{{ item.goods.total_amount }}</view>
						</view>

						<view class="goods-right">
							<view class="goods-header">
								<text class="goods-title line-clamp-2">{{ item.goods.name }}</text>
								<button class="unfollow-btn" @click.stop="unfollowGoods(item.id)">取消关注</button>
							</view>

							<view class="goods-specs">
								<text class="spec-item">{{ item.goods.brand_name }}</text>
								<text class="spec-item">{{ item.goods.size }}</text>
								<text class="spec-item">{{ item.goods.skin.split(' ')[0] }}</text>
							</view>

							<view class="goods-footer">
								<text class="goods-type">{{ item.goods.type }}</text>
								<text class="goods-material">{{ item.goods.doll_material }}</text>
							</view>
						</view>
					</view>

					<!-- 品牌类型 -->
					<view v-if="activeCategory === 2 && item.brand" class="list-item brand-item"
						@click="navigateToBrand(item.brand.id)">
						<view class="brand-content">
							<image class="brand-logo" :src="item.brand.logo_image" mode="aspectFit" />
							<view class="brand-info">
								<view class="brand-header">
									<text class="brand-name">{{ item.brand.brand_name }}</text>
									<text class="brand-country">{{ item.brand.country_name }}</text>
								</view>
								<text class="brand-description line-clamp-2">{{ item.brand.description }}</text>
								<view class="brand-actions">
									<button class="action-btn" @click.stop="unfollowBrand(item.id)">取消关注</button>
								</view>
							</view>
						</view>
					</view>

					<!-- 搭配类型 -->
					<view v-if="activeCategory === 3 && item.collocation" class="list-item"
						@click="navigateToCollocation(item.collocation.id)">
						<image class="item-image" :src="getFirstCollocationImage(item.collocation.image_urls)"
							mode="aspectFill" />
						<text class="item-title">{{ item.collocation.title }}</text>
					</view>

					<!-- 展示柜类型 -->
					<view v-if="activeCategory === 4 && item.showcase" class="list-item"
						@click="navigateToShowcase(item.showcase.id)">
						<image class="item-image" :src="getFirstImage(item.showcase.image_urls)" mode="aspectFill" />
						<text class="item-title">{{ item.showcase.name }}</text>
					</view>
				</block>

				<!-- 加载状态 -->
				<view class="loading-status">
					<text v-if="loading" class="loading-text">加载中...</text>
					<text v-if="noMore" class="no-more-text">没有更多了</text>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
	import {
		ref,
		reactive,
		onMounted
	} from 'vue'
	import {
		websiteUrl,
		image1Url,
		asyncGetUserInfo
	} from "../../common/config.js"

	const categories = ref([{
			type: 1,
			name: '商品'
		},
		{
			type: 2,
			name: '品牌'
		},
		{
			type: 3,
			name: '搭配'
		},
		{
			type: 4,
			name: '展示柜'
		}
	])

	const activeCategory = ref(1)
	const currentList = ref([])
	const loading = ref(false)
	const noMore = ref(false)

	// 分页数据
	const pagination = reactive({
		page: 1,
		page_size: 8,
		total: 0
	})

	// 初始化加载
	onMounted(async () => {
		await checkLogin()
		loadData()
	})

	// 检查登录状态
	const checkLogin = async () => {
		const userInfo = await asyncGetUserInfo()
		if (!userInfo) {
			uni.navigateTo({
				url: '/pages/login/login'
			})
		}
	}

	// 切换分类
	const switchCategory = (type) => {
		if (activeCategory.value === type) return
		activeCategory.value = type
		resetPagination()
		loadData()
	}

	// 加载数据
	const loadData = async () => {
		if (loading.value || noMore.value) return

		loading.value = true
		try {
			const res = await uni.request({
				url: `${websiteUrl.value}/with-state/user-likes`,
				method: 'GET',
				data: {
					type: activeCategory.value,
					page: pagination.page,
					page_size: pagination.page_size
				},
				header: {
					Authorization: uni.getStorageSync('token')
				}
			})

			if (res.data.status === 'success') {
				const newData = res.data.data.list
				currentList.value = [...currentList.value, ...newData]
				pagination.total = res.data.data.total

				// 如果res.data.data.list.length是0 ，则说明没有更多数据了
				if (!res.data.data.list.length) {
					noMore.value = true
				} else {
					noMore.value = false
				}

				pagination.page += 1
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
		if (!noMore.value) {
			loadData()
		} else {
			console.log("no more")
		}
	}

	// 重置分页
	const resetPagination = () => {
		pagination.page = 1
		currentList.value = []
		noMore.value = false
	}

	// 获取第一张图片
	const getFirstImage = (images) => {
		return images?.length > 0 ? images[0] : ``
	}

	// 处理搭配图片
	const getFirstCollocationImage = (images) => {
		const url = images?.split(',')[0] || ''
		return url ? url : ``
	}
	// 取消关注商品
	const unfollowGoods = async (id) => {
		try {
			const res = await uni.request({
				url: `${websiteUrl.value}/user/unfollow`,
				method: 'POST',
				data: {
					id
				},
				header: {
					Authorization: uni.getStorageSync('token')
				}
			})

			if (res.data.status === 'success') {
				currentList.value = currentList.value.filter(item => item.id !== id)
				uni.showToast({
					title: '已取消关注',
					icon: 'success'
				})
			}
		} catch (error) {
			uni.showToast({
				title: '操作失败',
				icon: 'none'
			})
		}
	}

	// 跳转方法
	const navigateToGoods = (id) => {
		uni.navigateTo({
			url: `/pages/goods/goods?goods_id=${id}`
		})
	}

	const navigateToBrand = (id) => {
		uni.navigateTo({
			url: `/pages/brand/brand?brand_id=${id}`
		})
	}

	const navigateToCollocation = (id) => {
		uni.navigateTo({
			url: `/pages/collocation/detail?id=${id}`
		})
	}

	const navigateToShowcase = (id) => {
		uni.navigateTo({
			url: `/pages/showcase/detail?id=${id}`
		})
	}

	uni.setNavigationBarTitle({
		title: "我的关注"
	})
</script>

<style lang="less" scoped>
	.container {
		height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.nav-bar {
		display: flex;
		height: 90rpx;
		background: #fff;
		border-bottom: 1rpx solid #eee;

		.nav-item {
			flex: 1;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 30rpx;
			color: #666;

			&.active {
				color: #82cfe3;
				font-weight: bold;
				position: relative;

				&::after {
					content: '';
					position: absolute;
					bottom: 0;
					left: 50%;
					transform: translateX(-50%);
					width: 60rpx;
					height: 4rpx;
					background: #ff6a6c;
				}
			}
		}
	}

	.scroll-view {
		flex: 1;
		box-sizing: border-box;
		padding: 20rpx;
		flex: 1; // 使用 flex 填充剩余空间
		height: 1px; // 兼容性写法（重要）
	}

	.list-container {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
	}

	.list-item {
		width: 345rpx;
		margin-bottom: 20rpx;
		background: #fff;
		border-radius: 12rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);

		.item-image {
			width: 100%;
			height: 345rpx;
			background: #f5f5f5;

			&.brand-image {
				width: 300rpx;
				height: 200rpx;
				padding: 40rpx;
				background: #fff;
			}
		}

		.item-title {
			display: block;
			padding: 20rpx;
			font-size: 28rpx;
			color: #333;
			line-height: 1.4;
			.line-clamp(2);
			text-align: center;
		}
	}

	.loading-status {
		width: 100%;
		padding: 30rpx 0;
		text-align: center;
		font-size: 26rpx;
		color: #999;

		.loading-text {
			// &::before {
			//   content: '⏳';
			//   margin-right: 10rpx;
			// }
		}

		.no-more-text {
			&::before {
				content: '—';
				margin-right: 10rpx;
			}

			&::after {
				content: '—';
				margin-left: 10rpx;
			}
		}
	}

	.line-clamp(@lines) {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: @lines;
		overflow: hidden;
	}

	// 公共样式
	.ellipsis() {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.line-clamp-2 {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
	}

	// 细分样式：品牌
	.brand-item {
		width: 100% !important; // 改为通栏显示
		margin-bottom: 30rpx;
		padding: 30rpx;
		border-radius: 16rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);

		.brand-content {
			display: flex;
			align-items: flex-start;
		}

		.brand-logo {
			width: 160rpx !important;
			height: 160rpx !important;
			margin-right: 30rpx;
			background: #fff;
			border: 2rpx solid #f0f0f0;
			border-radius: 12rpx;
			padding: 10rpx;
		}

		.brand-info {
			flex: 1;
			min-width: 0;
		}

		.brand-header {
			display: flex;
			align-items: baseline;
			margin-bottom: 16rpx;

			.brand-name {
				font-size: 32rpx;
				font-weight: 600;
				color: #333;
				margin-right: 20rpx;
				max-width: 60%;
				.ellipsis();
			}

			.brand-country {
				font-size: 24rpx;
				color: #999;
				background: #f5f5f5;
				border-radius: 6rpx;
				padding: 4rpx 12rpx;
			}
		}

		.brand-description {
			font-size: 26rpx;
			color: #666;
			line-height: 1.5;
			margin-bottom: 20rpx;
		}

		.brand-actions {
			display: flex;
			justify-content: flex-end;

			.action-btn {
				font-size: 24rpx;
				color: #666;
				background: #f8f8f8;
				border-radius: 30rpx;
				padding: 8rpx 24rpx;
				margin: 0;
				line-height: 1.5;

				&::after {
					border: none;
				}

				&:active {
					background: #f0f0f0;
				}
			}
		}
	}

	/* 商品项专用样式 */
	.goods-item {
		display: flex;
		padding: 24rpx;
		box-sizing: border-box;
		width: 100%;

		.goods-left {
			position: relative;
			width: 240rpx;
			height: 240rpx;
			flex-shrink: 0;
			margin-right: 24rpx;
			border-radius: 12rpx;
			overflow: hidden;

			.goods-thumb {
				width: 100%;
				height: 100%;
				background: #f5f5f5;
			}

			.price-tag {
				position: absolute;
				bottom: 0;
				left: 0;
				right: 0;
				padding: 8rpx 16rpx;
				background: rgba(0, 0, 0, 0.6);
				color: #fff;
				font-size: 26rpx;
				font-weight: 500;
			}
		}

		.goods-right {
			flex: 1;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			min-width: 0;

			.goods-header {
				display: flex;
				justify-content: space-between;
				gap: 20rpx;

				.goods-title {
					flex: 1;
					font-size: 30rpx;
					font-weight: 600;
					color: #333;
					line-height: 1.4;
				}

				.unfollow-btn {
					flex-shrink: 0;
					height: 48rpx;
					line-height: 48rpx;
					padding: 0 20rpx;
					border-radius: 24rpx;
					background: #f8f8f8;
					color: #666;
					font-size: 24rpx;

					&::after {
						border: none
					}
				}
			}

			.goods-specs {
				display: flex;
				flex-wrap: wrap;
				gap: 12rpx;

				.spec-item {
					padding: 4rpx 16rpx;
					background: #f5f5f5;
					border-radius: 6rpx;
					font-size: 24rpx;
					color: #666;
				}
			}

			.goods-footer {
				display: flex;
				justify-content: space-between;
				color: #999;
				font-size: 24rpx;

				.goods-type::before {
					content: ' '
				}

				.goods-material::before {
					content: ' '
				}
			}
		}
	}
</style>