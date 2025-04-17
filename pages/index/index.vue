<template>
	<common-page head_color="rgb(255 230 215) ">
		<view class="body">
			<view class="index_header">
				<text class="font-alimamashuhei logo"
					style="color: #4cbbd0;width: 180rpx;padding-top: 10rpx;">娃圈狗狗助手</text>
				<view>
					<common-search width="680rpx"></common-search>
					<div style="clear: both;"></div>
				</view>
				<view style="position: relative;height: 250rpx;">
					<!-- 轮播图部分 -->
					<swiper :interval="3000" :duration="200" @change="onChange" class="banner_swiper">
						<block v-for="(item) in data" :key="item">
							<swiper-item class="banner_swiper_item">
								<view class="swiper-item">
									<image :src="item" mode="aspectFill" style="width: 100%;"></image>
								</view>
							</swiper-item>
						</block>
					</swiper>


				</view>

				<view style="margin: 40rpx 0rpx">
					<!-- 四个小方块按钮 -->
					<view class="index_page_article">
						<view class="swich_box" :class="{ 'active': activeTab === 'news' }" @click="switchTab('news')">
							<image src="../../static/cat-1.png" mode="aspectFill"></image>
							<text>品牌图透</text>
						</view>
						<view class="swich_box" :class="{ 'active': activeTab === 'brands' }"
							@click="switchTab('brands')">
							<image src="../../static/cat-2.png" mode="aspectFill"></image>
							<text>品牌图鉴</text>
						</view>
						<view class="swich_box" :class="{ 'active': activeTab === 'hot' }" @click="switchTab('hot')">
							<image src="../../static/cat-3.png" mode="aspectFill"></image>
							<text>热门搭配</text>
						</view>
						<view class="swich_box" :class="{ 'active': activeTab === 'second' }"
							@click="switchTab('second')">
							<image src="../../static/cat-10.png" mode="aspectFill"></image>
							<text>扩列广场</text>
						</view>

					</view>
				</view>
			</view>

			<!-- 品牌图透 -->
			<view class="body_list news-box" v-if="activeTab === 'news'">
				<view v-for="item in newsList" :key="item.id" class="news-item" @tap="jump2saleNews(item)">
					<view class="news-images">
						<swiper v-if="item.image_list.length > 0" class="image-swiper" :autoplay="true"
							:circular="true">
							<swiper-item v-for="(img, idx) in item.image_list" :key="idx">
								<image :src="img" mode="aspectFill" class="swiper-image" />
							</swiper-item>
						</swiper>
					</view>
					<view class="news-content">
						<text class="news-title">{{ item.title }}</text>
						<text class="news-desc">{{ item.content }}</text>
						<view class="news-footer">
							<text class="brand-tag">{{ item.brand_name }}</text>
							<text class="news-time">{{ formatTime(item.created_at) }}</text>
						</view>
					</view>
				</view>

				<!-- 加载状态 -->
				<view class="loading-more">
					<text v-if="newsLoading">加载中...</text>
					<text v-if="!newsHasMore">没有更多了~</text>
				</view>
			</view>

			<!-- 品牌图鉴 -->
			<view class="body_list brand_box" style="position: relative;" v-if="activeTab === 'brands'">
				<view class="filter-tabs">
					<view v-for="(tab, index) in tabs" :key="index" class="tab-item"
						:class="{ 'active': activeSearchType === tab.value }" @click="handleTabClick(tab.value)">
						{{ tab.label }}
					</view>
				</view>
				<view v-for="(item, index) in brandsList" :key="item.id">
					<index-brand :brand="item"></index-brand>
				</view>
				<!-- 添加加载状态提示 -->
				<view class="loading-more">
					<text v-if="loading">加载中...</text>
					<text v-if="!hasMore">没有更多数据了</text>
				</view>

			</view>

			<!-- 热门搭配 -->
			<view class="body_list" v-if="activeTab === 'hot'"></view>

			<!-- 二手广场 -->
			<view class="body_list" v-if="activeTab === 'second'"></view>
		</view>
	</common-page>


</template>

<script setup>
	import {
		onLoad,
		onReachBottom,
	} from "@dcloudio/uni-app"
	import {
		ref
	} from 'vue';
	import {
		websiteUrl,
		wechatSignLogin,
		getUserInfo,
		global,
	} from "../../common/config.js";

	//轮播图组件
	import sdp from '@/components/swiper-dynamic-bullets/swiper-dynamic-bullets.vue';
	let brandsList = ref([]);
	let data = ref([
		'https://images1.fantuanpu.com/box/100024/28a0d23e82607d47a56edb08daa85d0f',
		'https://images1.fantuanpu.com/box/100024/28a0d23e82607d47a56edb08daa85d0f',
		'https://images1.fantuanpu.com/box/100024/28a0d23e82607d47a56edb08daa85d0f',
	])

	// 筛选相关代码
	const tabs = ref([{
			label: '中国娃社',
			value: 1
		},
		{
			label: '个人作者',
			value: 2
		},
		{
			label: '外国娃社',
			value: 3
		},
	]);
	// 默认选中中国娃社
	const activeSearchType = ref(1);

	//轮播
	var swiperIndex = ref(0)
	const systemInfo = uni.getSystemInfoSync();
	// const statusBarHeight = ref(systemInfo.statusBarHeight + 15);
	// console.log("状态栏高度" + statusBarHeight.value)

	//收录Brands总数
	var totalBrand = ref(0)

	//分页相关变量
	const page = ref(1)
	const pageSize = ref(10)
	const hasMore = ref(true)
	const loading = ref(false)

	// 图透部分
	let newsList = ref([])
	const newsPage = ref(1)
	const newsPageSize = ref(10)
	const newsHasMore = ref(true)
	const newsLoading = ref(false)

	// 新增切换状态
	const activeTab = ref('news')
	// 切换选项卡方法
	const switchTab = (tab) => {
		activeTab.value = tab
		// 这里可以添加切换时加载对应数据的逻辑
	}

	const onShareAppMessage = () => ({
		title: 'BJD娃圈你想知道的这里都有~',
		path: '/pages/news/news',
		imageUrl: '/static/share',
		success(res) {
			console.log('分享成功', res)
		},
		fail(err) {
			console.log('分享失败', err)
		},
		mp: {
			wxpath: '/pages/index/index.html'
		}
	})

	function jump2collocationSquare() {
		uni.navigateTo({
			url: "/pages/collocation_square/collocation_square"
		})
	}
	
	function jump2saleNews(item) {
		uni.navigateTo({
			url: "/pages/sale_news/sale_news?id=" + item.id + "&brand_id=" + item.brand_id
		})
	}

	function onChange(e) {
		this.swiperIndex.value = e.detail.current
	}

	const handleTabClick = (value) => {
		// 切换筛选类型时重置分页和数据
		if (activeSearchType.value === value) {
			activeSearchType.value = null; // 点击已选中的tab取消筛选
		} else {
			activeSearchType.value = value;
		}
		page.value = 1;
		hasMore.value = true;
		brandsList.value = [];
		getBrands();
	}

	function getNews() {
		if (!newsHasMore.value || newsLoading.value) return

		newsLoading.value = true
		uni.showLoading()
		uni.request({
			url: websiteUrl + '/sale-news',
			data: {
				page: newsPage.value,
				pageSize: newsPageSize.value
			},
			success: (res) => {
				const newData = res.data.data.news_list
				if (newData.length === 0) {
					newsHasMore.value = false
					return
				}
				newsList.value = [...newsList.value, ...newData]
				newsHasMore.value = newsList.value.length < res.data.data.total
				newsPage.value++
			},
			fail: (err) => {
				console.log(err)
				uni.showToast({
					title: '加载失败',
					icon: 'none'
				})
			},
			complete: () => {
				newsLoading.value = false
				uni.hideLoading()
			}
		})
	}


	function getBrands() {
		if (!hasMore.value || loading.value) {
			return
		}

		loading.value = true;
		uni.showLoading();
		uni.request({
			url: websiteUrl + '/brands',
			data: {
				page: page.value,
				pageSize: pageSize.value,
				...(activeSearchType.value && {
					searchType: activeSearchType.value
				})
			},
			success: (res) => {
				const newData = res.data.data.brands_list;
				if (newData.length === 0) {
					hasMore.value = false;
					return;
				}
				brandsList.value = [...brandsList.value, ...newData];
				//是否还有更多数据
				hasMore.value = brandsList.value.length < res.data.data.total;
				page.value++;
			},
			fail: (err) => {
				console.log(err);
				uni.showToast({
					title: '网络请求失败',
					icon: 'none'
				})
			},
			complete: () => {
				loading.value = false
				uni.hideLoading()
			}
		})
	}

	// 时间格式化方法
	const formatTime = (timestamp) => {
		const date = new Date(timestamp * 1000)
		return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`
	}

	// 初始化加载
	onLoad(() => {
		getBrands()
		getNews() // 新增初始化加载
	})



	// 上拉加载更多
	onReachBottom(() => {
		if (activeTab.value === 'brands') {
			getBrands()
		} else if (activeTab.value === 'news') {
			getNews()
		}
	})
</script>

<style lang="scss" scoped>
	.body {
		/* background: linear-gradient(180deg, rgb(218 238 255) 0%, rgb(255 255 255) 100%); */
		// background: #fff;
	}

	.index_header {
		// background: linear-gradient(180deg, rgb(218 238 255) 0%, rgb(255 255 255) 100%);
		background: linear-gradient(180deg, rgb(255 230 215) 0%, rgb(211 245 255) 100%);
		// background: transparent;
		padding: 15rpx;
		padding-bottom: 80rpx;
		color: #4cbbd0;
		display: block;

		.logo {
			margin: 20rpx 10rpx;
			display: block;
			width: 100rpx;
			font-size: 30rpx;
			font-weight: 1000;
			// position: relative;
			// top: 10rpx;
		}

		.domain_text {
			font-size: 13rpx;
		}


		/* 四个小按钮 */
		.index_page_article {
			display: flex;
			justify-content: space-around;
			height: 100rpx;
			width: 100%;

			.swich_box {
				background: #fff;
				width: 150rpx;
				height: 150rpx;
				align-items: center;
				border-radius: 10rpx;

				/* 基础样式 */
				position: relative;
				transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
				transform: scale(1);

				/* 初始状态 */
				background: rgba(255, 255, 255, 0.9);
				box-shadow: 0 4rpx 12rpx rgba(76, 187, 208, 0.1);

				&::after {
					content: '';
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					// background: linear-gradient(180deg, #f3ebff 0%, #9dc4cf 100%);
					background: linear-gradient(180deg, #e0cbff 0%, #a5ceda 100%);
					opacity: 0;
					transition: opacity 0.3s ease;
					border-radius: 100%;
				}

				/* 激活状态 */
				&.active {
					transform: scale(0.98);
					border-radius: 100%;

					&::after {
						opacity: 1;
					}

					text {
						transform: translateY(2rpx);
						color: #fff;
					}

					image {
						transform: scale(1.05) translateY(-4rpx);
					}
				}

				text {
					transition: all 0.3s ease;
					position: relative;
					z-index: 1;
					text-align: center;
					display: block;
					color: #4cbbd0;
					border-radius: 5rpx;
					margin-right: 10rpx;
					width: 100%;
					font-size: 23rpx;
					font-weight: 800;
				}

				image {
					transition: all 0.3s ease;
					position: relative;
					z-index: 1;
					width: 50rpx;
					height: 50rpx;
					margin: auto;
					margin-top: 20rpx;
					display: block;
					padding: 10rpx;
					background: #fff;
					border-radius: 100%;
				}

				/* 点击涟漪效果 */
				&:active:not(.active) {
					transform: scale(0.95);
				}
			}


		}
	}

	.body_list {
		position: relative;
	}

	// 选项卡
	.filter-tabs {
		display: flex;
		justify-content: space-around;
		padding: 20rpx 0;
		background: #fff;
		position: sticky;
		top: 0;
		z-index: 1;
	}

	.tab-item {
		padding: 10rpx 20rpx;
		border-radius: 30rpx;
		border: 1rpx solid #4cbbd0;
		color: #4cbbd0;
		font-size: 28rpx;
		transition: all 0.3s;
		margin: 0 20rpx;

		&.active {
			background: #4cbbd0;
			color: #fff;
		}
	}

	.index_search_box {
		width: calc(100vw - 145rpx);
		border-radius: 15rpx;
		background-color: #fff;

		.icon_image {
			width: 25rpx;
			height: 25rpx;
		}

		.common_search_input {
			width: 75% !important;
			margin-left: 5rpx !important;
		}


	}

	.index_avatar {

		float: right;

		image {
			border-radius: 100%;
			width: 30rpx;
			height: 30rpx;
		}
	}

	.search_input {
		/* width: calc(100vw-25rpx); */
		display: inline;
	}

	.brand_box {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-start;
		/* 修改为从左开始 */
		gap: 10rpx;
		width: 100vw;
		margin-top: 30rpx;
		padding: 0 15rpx;
		/* 添加两侧间距 */
		box-sizing: border-box;

		border-radius: 30px;
		overflow: hidden;
		position: relative;
		top: -70rpx;
		background: #fff;
		box-shadow: 0 0px 10px #ffffff30;

		.dolls {
			/* 计算宽度：屏幕宽度减去两侧padding后分4列 */
			width: calc((100% - 30rpx - 3*10rpx) / 4);
			/* 解释：
		   100% = 父容器宽度
		   30rpx = 两侧padding（15rpx*2）
		   3*10rpx = 3个间隙（4列有3个间隙）
		*/
			box-sizing: border-box;

			/* 如果内容需要保持宽高比可以添加 */
			aspect-ratio: 1/1;
			/* 可选：保持正方形 */
		}
	}

	/*轮播图*/
	.banner_swiper {
		width: calc(100vw - 40rpx);
		box-sizing: border-box;
		margin: 20rpx 5rpx;
		border-radius: 10rpx;
		overflow: hidden;
		height: 250rpx;

		.banner_swiper_item {
			background: #fff;
		}
	}

	.loading-more {
		display: block;
		width: 100vw;

		text {
			display: block;
			text-align: center;
			width: 100%;
			color: #888;
		}
	}

	//  图透样式

	.news-box {
		padding: 20rpx;
		background: #fff;
		position: relative;
		top: -40rpx;
		padding-top: 50rpx;
		border-radius: 40rpx 40rpx 0 0;

		.news-item {
			margin-bottom: 30rpx;
			margin: 0rpx 20rpx 30rpx 20rpx;
			border-radius: 16rpx;
			overflow: hidden;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

			.image-swiper {
				height: 400rpx;

				.swiper-image {
					width: 100%;
					height: 100%;
				}
			}

			.news-content {
				padding: 20rpx;

				.news-title {
					font-size: 32rpx;
					color: #333;
					font-weight: bold;
					display: block;
					margin-bottom: 10rpx;
				}

				.news-desc {
					font-size: 26rpx;
					color: #666;
					line-height: 1.6;
					display: -webkit-box;
					-webkit-box-orient: vertical;
					-webkit-line-clamp: 2;
					overflow: hidden;
				}

				.news-footer {
					margin-top: 20rpx;
					display: flex;
					justify-content: space-between;
					align-items: center;

					.brand-tag {
						background: #4cbbd0;
						color: #fff;
						padding: 4rpx 12rpx;
						border-radius: 6rpx;
						font-size: 24rpx;
					}

					.news-time {
						color: #999;
						font-size: 24rpx;
					}
				}
			}
		}

		.loading-more {
			padding: 30rpx 0;
			text-align: center;
			color: #888;
		}
	}
</style>