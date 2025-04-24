<template>
	<meta name="theme-color" content="#ffe6d7">
	</meta>
	<common-page head_color="rgb(255 230 215) ">
		<view class="body">
			<view class="index_header">
				<view>
					<image src="/static/main/2.png"
						style="width: 100rpx;height: 100rpx;display: inline-block;  vertical-align: top; "
						mode="aspectFill"></image>
					<view style="display: inline-block;">
						<text class="font-alimamashuhei logo"
							style="color: #4cbbd0;width: 250rpx;padding-top: 10rpx; vertical-align: top;position: relative;">娃圈狗狗助手</text>
						<!-- <text style="display: inline-block;font-size: 20rpx;font-weight: 1000;color: #888;">新鲜事早知道</text> -->
					</view>

				</view>

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
							<text>树洞投稿</text>
						</view>

					</view>
				</view>
			</view>
			<view class="body_container">
				<transition name="fade" mode="out-in">
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
				</transition>


				<!-- 品牌图鉴 -->
				<transition name="fade" mode="out-in">
					<view class="body_list brand_box" style="position: relative;" v-if="activeTab === 'brands'">
						<view class="filter-tabs">
							<view v-for="(tab, index) in tabs" :key="index" class="tab-item"
								:class="{ 'active': activeSearchType === tab.value }"
								@click="handleTabClick(tab.value)">
								{{ tab.label }}
							</view>
						</view>
						<view class="brand_type_description" style="display: block;width: 100%;">
							<text
								v-if="activeSearchType == 1">中国公司制作的BJD在打磨、分模线等工艺的处理上比较优秀，价格也比外社低很多，但设计和审美上还是比较单一的。</text>
							<text
								v-if="activeSearchType == 2">个人作者在贩售娃物前基本都是圈内玩家，在设计方面花样非常多。但需要注意存在工期拖延，品控不良的可能性。</text>
							<text v-if="activeSearchType == 3">国外娃社起步较早，风格设计多样化。但价格较高，并且一些知名的大娃社的品控也没有很高。</text>
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
				</transition>
				<!-- 热门搭配 -->
				<transition name="fade" mode="out-in">
					<view class="body_list hot-box" v-if="activeTab === 'hot'">
						<view v-for="item in hotList" :key="item.collocation_id" class="hot-item"
							@tap="jumpToCollocationDetail(item)">
							<view class="images-box">
								<swiper v-if="item.image_urls.length > 0" class="image-swiper" :autoplay="true"
									:circular="true">
									<swiper-item v-for="(img, idx) in item.image_urls" :key="idx">
										<image :src="img" mode="aspectFill" class="swiper-image" />
									</swiper-item>
								</swiper>
							</view>
							<view class="content-box">
								<text class="title">{{ item.title }}</text>
								<text class="desc">{{ item.content }}</text>
								<view class="tags-box">
									<view v-for="(tag, tIdx) in item.relation_list" :key="tIdx" class="tag-item">
										<text class="tag-text">{{ tag.relation_goods_name }}</text>
										<text class="brand-text">{{ tag.relation_brand_name }}</text>
									</view>
								</view>
								<view class="footer">
									<view class="user-info">
										<image :src="item.avatar" class="avatar" mode="aspectFill"></image>
										<text class="time"> 发布{{ item.origin == 1? "搭配" : "展示柜" }}于
											{{ formatTime(item.created_at) }}</text>
									</view>
									<view class="like-box">
										<uni-icons type="heart" size="18" color="#ff4d4f"></uni-icons>
										<text class="like-count">{{ item.like_count }}</text>
									</view>
								</view>
							</view>
						</view>

						<!-- 加载状态 -->
						<view class="loading-more">
							<text v-if="hotLoading">加载中...</text>
							<text v-if="!hotHasMore">没有更多了~</text>
						</view>
					</view>
				</transition>
				<!-- 说给树洞 -->
				<transition name="fade" mode="out-in">
					<view class="body_list treehole-box" v-if="activeTab === 'second'">
						<!-- 发布按钮 -->
						<view class="publish-btn" @click="handlePublish">
							<uni-icons type="plusempty" size="30" color="#fff"></uni-icons>
						</view>
						<!-- 树洞列表 -->
						<view v-for="item in treeholeList" :key="item.id" class="treehole-item">
							<!-- 用户信息 -->
							<view class="user-info">
								
								<image v-if="item.avatar !== ''" :src="item.avatar" class="avatar" mode="aspectFill">
								</image>
								<image v-else src="/static/noname.png" class="avatar" mode="scaleToFill"></image>
								<text class="username">{{ item.is_anonymous ? '匿名用户' : item.author_name }}</text>
								<text class="time">{{ formatTime(item.created_at) }}</text>
								<text class="cid">【{{item.id}}】</text>
							</view>

							<!-- 内容 -->
							<text class="content" @tap="jump2treeholeDetail(item)">{{ item.content }}</text>

							<!-- 图片 -->
							<view v-if="item.images.length > 0" class="image-grid">
								<swiper class="image-swiper" :autoplay="true" :circular="true" indicator-dots>
									<swiper-item v-for="(img, idx) in item.images" :key="idx">
										<image :src="img" mode="aspectFill" class="swiper-image"
											@click="previewImage(item.images, idx)" />
									</swiper-item>
								</swiper>
							</view>

							<!-- 操作栏 -->
							<view class="action-bar">
								<view class="action-item" @click="handleLike(item)">
									<uni-icons :type="item.has_liked ? 'hand-up-filled' : 'hand-up'" size="18"
										:color="item.has_liked ? '#ff4d4f' : '#666'"></uni-icons>
									<text class="count">{{ item.like_count || 0 }}</text>
								</view>
								<view class="action-item" @click="handleComment(item)">
									<uni-icons type="chat" size="18" color="#666"></uni-icons>
									<text class="count">{{ item.comment_count || 0 }}</text>
								</view>
								<view class="action-item" @click="copyUrl(item)">
									<uni-icons type="redo" size="18" color="#666"></uni-icons>
									<text class="count">分享</text>
								</view>
								
							</view>
						</view>

						<!-- 加载状态 -->
						<view class="loading-more">
							<text v-if="treeholeLoading">加载中...</text>
							<text v-if="!treeholeHasMore">没有更多了~</text>
						</view>
					</view>
				</transition>
			</view>


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
		'https://images1.fantuanpu.com/spd/log/2025_04_21/234a245d0f8963b1b9b022efe3653cfb.jpg',
		'https://images1.fantuanpu.com/box/100024/16524d8c1583feacbeebc37d37ee02a4',
		'https://images1.fantuanpu.com/spd/log/2025_04_21/d34dfe99334e9f5a82a9f63708fcfefe.jpg',
		'https://images1.fantuanpu.com/box/100024/16524d8c1583feacbeebc37d37ee02a4',
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

	// 新增热门搭配相关变量
	let hotList = ref([])
	const hotPage = ref(1)
	const hotPageSize = ref(10)
	const hotHasMore = ref(true)
	const hotLoading = ref(false)

	// 树洞相关变量
	let treeholeList = ref([])
	const treeholePage = ref(1)
	const treeholePageSize = ref(10)
	const treeholeHasMore = ref(true)
	const treeholeLoading = ref(false)


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
	
	function copyUrl(item) {
		let url = "http://m.dogdogdoll.com/#/" + "pages/treehole_detail/treehole_detail?id=" + item.id
		// 复制到剪贴板
		uni.setClipboardData({
			data: url,
			success: function () {
				uni.showToast({
					title: '复制链接成功',
					icon: 'none'
				});
			}
		});
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
	
	function jump2treeholeDetail(item) {
	
		uni.navigateTo({
		  url: '/pages/treehole_detail/treehole_detail?id=' + item.id
		})
	}

	// 获取热门搭配数据
	function getHotCollocations() {
		if (!hotHasMore.value || hotLoading.value) return

		hotLoading.value = true
		uni.showLoading()
		uni.request({
			url: websiteUrl + '/hot-collocation',
			data: {
				page: hotPage.value,
				pageSize: hotPageSize.value
			},
			success: (res) => {
				const newData = res.data.data.collocation_relation_list
				if (newData.length === 0) {
					hotHasMore.value = false
					return
				}
				hotList.value = [...hotList.value, ...newData.map(item => ({
					...item,
				}))]
				hotHasMore.value = hotList.value.length < res.data.data.total
				hotPage.value++
			},
			fail: (err) => {
				console.log(err)
				uni.showToast({
					title: '加载失败',
					icon: 'none'
				})
			},
			complete: () => {
				hotLoading.value = false
				uni.hideLoading()
			}
		})
	}

	// 跳转到搭配详情
	function jumpToCollocationDetail(item) {
		uni.navigateTo({
			url: `/pages/collocation_share/collocation_share?collocation_id=${item.collocation_id}&origin=${item.origin}`
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


	// 获取树洞列表
	function getTreeholeList() {
		if (!treeholeHasMore.value || treeholeLoading.value) return

		treeholeLoading.value = true
		uni.showLoading()
		uni.request({
			url: websiteUrl + '/treehole-submissions',
			data: {
				page: treeholePage.value,
				pageSize: treeholePageSize.value
			},
			success: (res) => {
				const newData = res.data.data.submission_list.map(item => ({
					...item,
					images: item.images || []
				}))

				if (newData.length === 0) {
					treeholeHasMore.value = false
					return
				}

				treeholeList.value = [...treeholeList.value, ...newData]
				treeholeHasMore.value = treeholeList.value.length < res.data.data.total
				treeholePage.value++
			},
			fail: (err) => {
				uni.showToast({
					title: '加载失败',
					icon: 'none'
				})
			},
			complete: () => {
				treeholeLoading.value = false
				uni.hideLoading()
			}
		})
	}

	// 处理发布
	function handlePublish() {
		// 检查登录状态
		if (!global.isLogin) {
			uni.showModal({
				title: '提示',
				content: '需要登录后才能发布树洞',
				success: res => {
					if (res.confirm) uni.navigateTo({
						url: '/pages/login/login'
					})
				}
			})
			return
		}

		uni.navigateTo({
			url: '/pages/treehole_publish/treehole_publish'
		})
	}

	// 图片预览
	function previewImage(images, index) {
		uni.previewImage({
			current: index,
			urls: images
		})
	}

	// 处理点赞
	function handleLike(item) {
		if (!global.isLogin) {
			uni.showToast({
				title: '请先登录',
				icon: 'none'
			})
			return
		}
		let token = uni.getStorageSync('token')
		if (!token) {
			uni.showToast({
				title: '请先登录',
				icon: 'none'
			})
			return
		}
		uni.request({
			url: websiteUrl + (item.has_liked ? '/with-state/unlike' : '/with-state/add-like'),
			method: 'POST',
			header: {
				Authorization: token, 
			},
			data: {
				id: item.id,
				type: 5
			}, // 5表示树洞类型
			success: (res) => {
				if (res.data.status === "success") {
					item.has_liked = !item.has_liked
					item.like_count += item.has_liked ? 1 : -1
				} else {
					uni.showD
				}
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
		getUserInfo()
		getBrands()
		getNews() // 新增初始化加载
		getHotCollocations()
		//加载树洞
		getTreeholeList()
	})



	// 上拉加载更多
	onReachBottom(() => {
		if (activeTab.value === 'brands') {
			getBrands()
		} else if (activeTab.value === 'news') {
			getNews()
		} else if (activeTab.value === 'second') {
			getTreeholeList()
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
		padding-bottom: 30rpx;
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
				width: 130rpx;
				height: 130rpx;
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
					font-size: 20rpx;
					font-weight: 1000;
				}

				image {
					transition: all 0.3s ease;
					position: relative;
					z-index: 1;
					width: 40rpx;
					height: 40rpx;
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

	.body_container {
		border-radius: 1.25rem 1.25rem 0 0;
		overflow: hidden;
		background: #fff;
	}

	.body_list {
		position: relative;
		min-height: 60vh;

		// top: -60rpx;
		transition: all 0.3s ease;
		transform-origin: top center;

		// 保证初始状态样式
		&::before {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			height: 30rpx;
			background: inherit;
			border-radius: 1.25rem 1.25rem 0 0;
		}
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
		font-size: 26rpx;
		transition: all 0.3s;
		margin: 0 20rpx;
		height: 26rpx;
		line-height: 26rpx;

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
		padding: 0 15rpx;
		/* 添加两侧间距 */
		box-sizing: border-box;

		overflow: hidden;
		position: relative;
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
		position: relative;
		padding-top: 50rpx;

		.news-item {
			margin-bottom: 30rpx;
			margin: 0rpx 20rpx 30rpx 20rpx;
			border-radius: 16rpx;
			overflow: hidden;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
			display: flex;

			.news-images {
				display: inline-block;
				width: 200rpx;
				min-height: 250rpx;

			}

			.image-swiper {

				.swiper-image {
					width: 100%;
					height: 100%;
				}
			}

			.news-content {
				padding: 10rpx 20rpx 20rpx 20rpx;
				width: 400rpx;
				display: inline-block;
				position: relative;

				.news-title {
					font-size: 28rpx;
					color: #333;
					font-weight: bold;
					display: block;
					margin-bottom: 10rpx;
					white-space: nowrap;
					overflow: hidden;
					-webkit-box-orient: vertical;
					-webkit-line-clamp: 1;
				}

				.news-desc {
					font-size: 22rpx;
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
					position: absolute;
					bottom: 20rpx;

					.brand-tag {
						background: #4cbbd0;
						color: #fff;
						padding: 4rpx 12rpx;
						border-radius: 6rpx;
						font-size: 20rpx;
						margin-right: 15rpx;
					}

					.news-time {
						color: #999;
						font-size: 20rpx;
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


	.hot-box {
		padding: 20rpx;
		padding-top: 50rpx;

		.hot-item {
			margin: 0 20rpx 30rpx;
			background: #fff;
			border-radius: 16rpx;
			overflow: hidden;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

			.images-box {
				height: 400rpx;

				.image-swiper {
					height: 100%;

					.swiper-image {
						width: 100%;
						height: 100%;
					}
				}
			}

			.content-box {
				padding: 20rpx;

				.title {
					font-size: 32rpx;
					color: #333;
					font-weight: bold;
					display: block;
					margin-bottom: 10rpx;
				}

				.desc {
					font-size: 26rpx;
					color: #666;
					line-height: 1.4;
					display: -webkit-box;
					-webkit-box-orient: vertical;
					-webkit-line-clamp: 2;
					overflow: hidden;
					margin-bottom: 20rpx;
				}

				.tags-box {
					display: flex;
					flex-wrap: wrap;
					gap: 10rpx;
					margin-bottom: 20rpx;

					.tag-item {
						background: #f5f5f5;
						border-radius: 6rpx;
						padding: 6rpx 12rpx;
						display: flex;
						align-items: center;

						.tag-text {
							font-size: 24rpx;
							color: #4cbbd0;
							margin-right: 8rpx;
						}

						.brand-text {
							font-size: 22rpx;
							color: #999;
						}
					}
				}

				.footer {
					display: flex;
					justify-content: space-between;
					align-items: center;

					.user-info {
						display: flex;
						align-items: center;

						.avatar {
							width: 40rpx;
							height: 40rpx;
							border-radius: 50%;
							margin-right: 10rpx;
						}

						.time {
							font-size: 24rpx;
							color: #999;
						}
					}

					.like-box {
						display: flex;
						align-items: center;

						.like-count {
							font-size: 24rpx;
							color: #ff4d4f;
							margin-left: 6rpx;
						}
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

	// 说给树洞
	/* 在style部分新增以下样式 */
	.treehole-box {
		padding: 20rpx;
		padding-top: 50rpx;
	}

	.treehole-item {
		background: #fff;
		border-radius: 16rpx;
		margin: 0 20rpx 30rpx;
		padding: 20rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	}

	.user-info {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;

		.avatar {
			width: 60rpx;
			height: 60rpx;
			border-radius: 50%;
			margin-right: 15rpx;
		}
		.cid {
			font-size: 24rpx;
			color: #666;
			margin-left: 20rpx;
		}
		.username {
			font-size: 24rpx;
			color: #333;
			margin-right: 60rpx;
			width: 250rpx;
			overflow: hidden;
			margin-left: 10rpx;
			margin-right: 40rpx;
			font-weight: 800;
			
			// 只显示一行
			overflow: hidden;
			white-space: nowrap;
			    display: -webkit-box;
			    -webkit-box-orient: vertical;
				-webkit-line-clamp: 1;
		}

		.time {
			font-size: 24rpx;
			color: #999;
		}
	}

	.content {
		font-size: 22rpx;
		color: #888;
		line-height: 1.6;
		margin-bottom: 30rpx;
		display: inline-block;
	}

	.image-grid {
		margin-bottom: 20rpx;

		.image-swiper {
			height: 400rpx;
			border-radius: 12rpx;
			overflow: hidden;

			.swiper-image {
				width: 100%;
				height: 100%;
			}
		}
	}

	.action-bar {
		display: flex;
		align-items: center;
		padding-top: 20rpx;
		border-top: 1rpx solid #eee;

		.action-item {
			display: flex;
			align-items: center;
			margin-right: 40rpx;

			.count {
				font-size: 24rpx;
				color: #666;
				margin-left: 8rpx;
			}
		}
	}

	.publish-btn {
		position: fixed;
		right: 40rpx;
		bottom: 120rpx;
		width: 100rpx;
		height: 100rpx;
		background: #4cbbd0;
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		box-shadow: 0 8rpx 20rpx rgba(76, 187, 208, 0.3);
		z-index: 999;
	}




	/* 全局过渡动画 */
	.fade-enter-active,
	.fade-leave-active {
		transition:
			opacity 0.3s ease,
			transform 0.3s ease;
	}

	.fade-enter-from {
		opacity: 0;
		transform: translateY(20rpx) scale(0.98);
	}

	.fade-leave-to {
		opacity: 0;
		transform: translateY(-20rpx) scale(0.98);
	}

	.body {
		position: relative;
		min-height: 100vh;
		/* 确保有足够的高度 */
		background: #d3f5ff;
	}

	.brand_type_description {
		text {
			font-size: 22rpx;
			color: #888;
			padding: 10rpx 30rpx;
		}
	}
</style>