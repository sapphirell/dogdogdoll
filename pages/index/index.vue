<template>
	<meta name="theme-color" content="#def9ff">
	</meta>
	<view-logs />
	<view>
		<privacy-permission-modal></privacy-permission-modal>
		<loading-toast :show="showLoadding"></loading-toast>
		<view-logs></view-logs>
		<version-check ref="versionCheckRef" :show-up-to-date-toast="true" />



		<view class="body">
			<view class="index_header">
				<view class="header-placeholders"></view>
				<!-- 	<button @click="open">打开弹窗</button>
					<uni-popup ref="popup" type="bottom" border-radius="10px 10px 0 0">底部弹出 Popup 自定义圆角</uni-popup>
				 -->
				<view>
					<!-- <image src="/static/new-icon/logo-with-img.jpg" style="width: 380rpx;height: 120rpx;"></image> -->
					<!-- <image src="/static/main/2.png"
						style="width: 170rpx;height: 170rpx;display: inline-block;  vertical-align: top; "
						mode="aspectFill"></image> -->
					<view style="display: inline-block;margin-left: 20rpx;">
						<!-- <text class="font-alimamashuhei logo"
							style="">娃圈狗狗助手</text> -->
						<image src="/static/new-icon/title.gif" mode="widthFix"
							style="width: 300rpx;max-height: 150rpx;  position: relative;left: -20rpx;margin-bottom: 10rpx;">
						</image>
						<server-selector @server-change="handleServerChange"></server-selector>
					</view>
					<!-- 调试按钮：清空忽略期 -->
					<!-- <button class="debug-btn" @tap="debugClearIgnore">清空忽略期</button> -->
					
					<!-- <goods-search width="720rpx" :hiddenIcon="false"></goods-search> -->
					<!-- <switch-search @select="handleSearchSelect" mode="jump" width="95%" background="#f8f8f8" /> -->
					<!-- 假搜索框：点击跳转到搜索页 -->
					<view class="fake-search" @tap="goSearch" hover-class="fake-search--hover">
					  <uni-icons type="search" size="18" color="#9aa0a6" />
					  <text class="fake-search__placeholder">搜索娃物 / 店铺 / 妆师 / 毛娘</text>
					</view>
				</view>
				<view style="margin: 20rpx 0rpx 0rpx 0rpx; padding: 5px 10px 0px 10px;border-radius: 20px 20px 0 0;">
					<!-- 四个小方块按钮 -->
					<view class="index_page_article">
						<view class="swich_box" :class="{ 'active': activeTab === 'news' }" @click="switchTab('news')">
							<image src="/static/new-icon/telphone.gif" mode="aspectFill"></image>
							<text class="font-cute">新情报！</text>
						</view>
						<view class="swich_box" :class="{ 'active': activeTab === 'brands' }"
							@click="switchTab('brands')">
							<image src="/static/new-icon/read.gif" mode="aspectFill"></image>
							<text class="font-cute">娃物图鉴</text>
						</view>
						<view class="swich_box" :class="{ 'active': activeTab === 'hot' }" @click="switchTab('hot')">
							<image src="/static/new-icon/collocation.gif" mode="aspectFill"
								style="width: 90rpx;height: 90rpx;position: relative;bottom: 0rpx;"></image>
							<!-- <text class="font-cute" style="position: relative;bottom: 5rpx;">热门搭配</text> -->
							<text class="font-cute" style="position: relative;bottom: 5rpx;">妆师毛娘</text>
						</view>
						<view class="swich_box" :class="{ 'active': activeTab === 'second' }"
							@click="switchTab('second')">
							<image src="/static/new-icon/write.gif" mode="aspectFill"></image>
							<text class="font-cute">匿名版</text>
						</view>

					</view>
				</view>



			</view>
			<view class="body_container">
				<view style="height: 40rpx;"></view>
				<!-- <transition name="fade" mode="out-in"> -->
				<uni-transition :mode-class="['fade']" :show="activeTab === 'news'">
					<!-- 品牌图透 -->
					<view class="body_list news-box" v-if="activeTab === 'news'">

						<view style="position: relative;height: 250rpx;margin-bottom: 20rpx; display: none;">
							<!-- 轮播图部分 -->
							<swiper :interval="3000" :duration="200" class="banner_swiper"
								indicator-active-color="#4cbbd0" indicator-color="rgba(255,255,255,0.5)">
								<swiper-item v-for="item in data" :key="item.id" class="banner_swiper_item">
									<!-- <view>{{item}}</view> -->
									<view class="swiper-item">
										<image :src="item.banner" mode="aspectFill" style="width: 100%;height: 250rpx;"
											@click="handleBannerClick(item)" />
									</view>
								</swiper-item>

								<!-- 空状态 -->
								<swiper-item v-if="data.length === 0">
									<view class="empty-banner">
										<image src="/static/default-banner.jpg" mode="aspectFill"
											style="width: 100%;height: 250rpx;" />
									</view>
								</swiper-item>
							</swiper>
						</view>
						<view v-for="item in newsList" :key="item.id" class="news-item" @tap="jump2saleNews(item)">
							<view class="news-images">
								<swiper v-if="item.image_list.length > 0" class="image-swiper"
									:autoplay="item.imagesLoaded" :circular="true">
									<swiper-item v-for="(img, idx) in item.image_list" :key="idx">
										<!-- 添加加载状态层 -->
										<view class="image-container">
											<image :src="img" mode="aspectFill" class="swiper-image"
												:class="{loaded: item.imagesLoaded}" @load="handleNewsImageLoad(item)"
												@error="handleNewsImageError(item, idx)" />
											<view v-if="!item.imagesLoaded" class="loading-overlay">
												<uni-icons type="loop" size="28" color="rgb(185 185 185)"
													class="loading-icon"></uni-icons>
											</view>
										</view>
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
					<!-- </transition> -->
				</uni-transition>

				<!-- 品牌图鉴 -->
				<!-- <transition name="fade" mode="out-in"> -->
				<uni-transition :mode-class="['fade']" :show="activeTab === 'brands'">
					<view class="body_list brand_box" style="position: relative;" v-if="activeTab === 'brands'">

						<view class="filter-tabs">
							<view v-for="(tab, index) in tabs" :key="index" class="tab-item"
								:class="{ 'active': activeSearchType === tab.value }"
								@click="handleTabClick(tab.value)">
								{{ tab.label }}
							</view>
						</view>
						<view class="brand_type_description" style="display: block;">
							<text v-if="activeSearchType == 1">中国公司制作的BJD在打磨、分模线等工艺的处理上比较优秀，价格也比外社低很多。</text>
							<text v-if="activeSearchType == 2">个人作者在贩售娃物前基本都是圈内玩家，在设计方面花的心思很多。</text>
							<text v-if="activeSearchType == 3">国外娃社起步较早，风格设计也比较多样化。</text>
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
				</uni-transition>
				<!-- </transition> -->
				<!-- 热门搭配 -->
				<!-- <transition name="fade" mode="out-in"> -->
				<uni-transition :mode-class="['fade']" :show="activeTab === 'hot'">
					<view class="body_list hot-box" v-if="activeTab === 'hot'">
						<index-artist></index-artist>
					</view>
					<!-- </transition> -->
				</uni-transition>
				<!-- 说给树洞 -->
				<!-- <transition name="fade" mode="out-in"> -->
				<uni-transition :mode-class="['fade']" :show="activeTab === 'second'">
					<view class="body_list treehole-box" v-if="activeTab === 'second'">
						<!-- 发布按钮 -->
						<view class="publish-btn" @click="handlePublish">
							<uni-icons type="plusempty" size="30" color="#fff"></uni-icons>
						</view>
						<!-- 树洞列表 -->
						<view v-for="item in treeholeList" :key="item.id" class="treehole-item"
							@tap="jump2treeholeDetail(item)">
							<!-- 用户信息 -->
							<view class="user-info" @tap.stop="jump2userWhenNotAnonymous(item)">

								<image v-if="item.avatar !== ''" :src="item.avatar" class="avatar" mode="aspectFill">
								</image>
								<image v-else src="/static/noname.png" class="avatar" mode="scaleToFill"></image>
								<text class="username">{{ item.is_anonymous ? '匿名用户' : item.author_name }}</text>
								<text class="time">{{ formatTime(item.created_at) }}</text>
								<text class="cid">【{{item.id}}】</text>
							</view>

							<!-- 内容 -->
							<text class="content">{{ item.content }}</text>

							<!-- 图片 -->
							<view v-if="item.images.length > 0" class="image-grid">
								<swiper class="image-swiper" :autoplay="item.imagesLoaded" :circular="true"
									:indicator-dots="item.images.length > 1" :duration="300">
									<swiper-item v-for="(img, idx) in item.images" :key="idx">
										<!-- 添加加载状态层 -->
										<view class="image-container">
											<image :src="img" mode="aspectFill" class="swiper-image"
												:class="{loaded: item.imagesLoaded}"
												@tap.stop="previewImage(item.images, idx)" @load="handleImageLoad(item)"
												@error="handleImageError(item, idx)" />
											<view v-if="!item.imagesLoaded" class="loading-overlay">
												<uni-icons type="spinner-cycle" size="28" color="#4cbbd0"
													class="loading-icon"></uni-icons>
											</view>
										</view>
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
								<view class="action-item">
									<uni-icons type="chat" size="18" color="#666"></uni-icons>
									<text class="count">{{ item.comment_count || 0 }}</text>
								</view>
								<view class="action-item" @click.stop="copyUrl(item)">
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
				</uni-transition>
				<!-- </transition> -->
			</view>


		</view>
	</view>


</template>

<script setup>
	import {
		onLoad,
		onReachBottom,
		onPullDownRefresh,
	} from "@dcloudio/uni-app"
	import {
		ref,
		computed
	} from 'vue';
	import {
		websiteUrl,
		wechatSignLogin,
		getUserInfo,
		global,
	} from "../../common/config.js";
	import uniPopup from "@/uni_modules/uni-popup/components/uni-popup/uni-popup.vue"
	//轮播图组件
	import sdp from '@/components/swiper-dynamic-bullets/swiper-dynamic-bullets.vue';
	let brandsList = ref([]);
	let data = ref({})


	// 定义游标变量
	let cursor = ref('') // 存储分页游标
	let showLoadding = ref(false)

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


	// 获取系统信息
	const navBarHeight = computed(() => {
		// #ifdef MP-WEIXIN
		const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
		// 确保状态栏高度存在（iOS可能为0）
		const statusBarHeight = systemInfo.statusBarHeight || 32
		return menuButtonInfo.bottom + menuButtonInfo.top - 2 * statusBarHeight
		// #endif
		return 0
	})
	// 计算顶部占位高度
	const headerHeight = computed(() => {
		// 小程序需要包含状态栏和导航栏高度
		// #ifdef MP-WEIXIN
		return navBarHeight.value + 'px'
		// #endif

		// // H5/App使用安全区域计算
		// return `calc(constant(safe-area-inset-top) + 20px)` // 默认值20px作为fallback
		// #ifdef H5 || APP
		// 直接获取状态栏高度（iOS 安卓通用）
		const statusBarHeight = systemInfo.statusBarHeight || 0
		return `${statusBarHeight}px` // 44px 为 iOS 导航栏标准高度
		// #endif
	})

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
	// 下拉刷新处理
	onPullDownRefresh(async () => {
		try {
			await refreshData();
			uni.stopPullDownRefresh();
		} catch (error) {
			uni.stopPullDownRefresh();
			uni.showToast({
				title: '刷新失败',
				icon: 'none'
			});
		}
	});

	// 统一刷新方法
	const refreshData = async () => {
		showLoadding.value = true
		// 等待0.3s
		setTimeout(async () => {

			// 根据当前选项卡刷新对应数据
			const refreshActions = {
				'brands': () => {
					page.value = 1;
					brandsList.value = [];
					hasMore.value = true;
					getBrands(true)

				},
				'news': () => {
					newsPage.value = 1;
					newsList.value = [];
					newsHasMore.value = true;
					getNews(true)

				},
				'hot': () => {

					hotPage.value = 1;
					hotList.value = [];
					hotHasMore.value = true;
					getHotCollocations(true)
				},
				'second': () => {
					treeholePage.value = 1;
					treeholeList.value = [];
					treeholeHasMore.value = true;
					getTreeholeList(true)
				}
			};

			await refreshActions[activeTab.value]();
			// getArticles(); // 始终刷新轮播图
		}, 800)

	};


	function jump2collocationSquare() {
		uni.navigateTo({
			url: "/pages/collocation_square/collocation_square"
		})
	}

	const handleBannerClick = (item) => {
		// console.log(item)
		uni.navigateTo({
			url: `/pages/article_detail/article_detail?id=${item.id}`
		})
	}

	function jump2saleNews(item) {
		uni.navigateTo({
			url: "/pages/sale_news/sale_news?id=" + item.id + "&brand_id=" + item.brand_id
		})
	}
	
	const goSearch = () => {
	  uni.navigateTo({
	    url: '/pages/search/search?tabs=1,2,3,4&mode=jump'
	  })
	}

	// 新增获取文章列表方法
	const getArticles = () => {
		uni.request({
			url: websiteUrl.value + '/articles',
			data: {
				page: 1,
				page_size: 10,
				status: 1 // 只获取已发布文章
			},
			success: (res) => {
				if (res.data.status === 'success') {
					// 过滤有效banner并更新数据
					data.value = res.data.data.list
				}
			},
			fail: (err) => {
				console.error('获取Banner失败:', err)
				data.value = {}
			}
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
		cursor.value = ''; // 重置游标
		getBrands();
	}
	const popup = ref(null)

	const open = async () => {

		await showModal({});
		uni.showToast({
			title: "你点击了确定按钮",
			position: "bottom"
		})
	}

	function jump2userWhenNotAnonymous(item) {
		if (item.is_anonymous == 1) {
			return
		}
		uni.navigateTo({
			url: '/pages/user_page/user_page?uid=' + item.uid
		})
	}

	function copyUrl(item) {
		let url = "http://m.dogdogdoll.com/#/" + "pages/treehole_detail/treehole_detail?id=" + item.id
		// 复制到剪贴板
		uni.setClipboardData({
			data: url,
			success: function() {
				uni.showToast({
					title: '复制链接成功',
					icon: 'none'
				});
			}
		});
	}

	const getNews = async (isRefresh = false) => {
		if (isRefresh) newsPage.value = 1;
		if (!newsHasMore.value || newsLoading.value) return

		newsLoading.value = true
		showLoadding.value = true
		uni.request({
			url: websiteUrl.value + '/sale-news',
			data: {
				page: newsPage.value,
				pageSize: newsPageSize.value
			},
			success: (res) => {
				const newData = res.data.data.news_list.map(item => ({
					...item,
					// 新增加载状态字段
					imagesLoaded: false,
					loadCount: 0
				}))
				if (newData.length === 0) {
					newsHasMore.value = false
					return
				}
				newsList.value = [...newsList.value, ...newData]
				newsHasMore.value = res.data.data.news_list.length === newsPageSize.value
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
				showLoadding.value = false
			}
		})
	}

	function jump2treeholeDetail(item) {

		uni.navigateTo({
			url: '/pages/treehole_detail/treehole_detail?id=' + item.id
		})
	}

	// 获取热门搭配数据
	const getHotCollocations = async (isRefresh = false) => {
		if (isRefresh) hotPage.value = 1;
		if (!hotHasMore.value || hotLoading.value) return

		hotLoading.value = true
		showLoadding.value = true
		uni.request({
			url: websiteUrl.value + '/hot-collocation',
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
				showLoadding.value = false
			}
		})
	}

	// 跳转到搭配详情
	function jumpToCollocationDetail(item) {
		uni.navigateTo({
			url: `/pages/collocation_share/collocation_share?collocation_id=${item.collocation_id}&origin=${item.origin}`
		})
	}



	const getBrands = async (isRefresh = false) => {
		if (isRefresh) {
			page.value = 1;
			brandsList.value = [];
			hasMore.value = true;
			cursor.value = ''; // 重置游标
		}

		if (!hasMore.value || loading.value) return;

		loading.value = true;
		showLoadding.value = true

		// 构造请求参数
		const params = {
			pageSize: pageSize.value
		};

		// 添加游标或搜索类型参数
		if (cursor.value) {
			params.cursor = cursor.value;
		} else if (activeSearchType.value) {
			params.searchType = activeSearchType.value;
		}

		uni.request({
			url: websiteUrl.value + '/brands-info-list',
			data: params,
			success: (res) => {
				if (res.data.status !== 'success') {
					uni.showToast({
						title: '加载失败: ' + res.data.message,
						icon: 'none'
					});
					return;
				}

				const response = res.data.data;
				const newData = response.data;
				console.log("newData:", newData)
				// 更新游标
				cursor.value = response.next_cursor || '';

				if (newData.length === 0) {
					hasMore.value = false;
					return;
				}

				brandsList.value = [...brandsList.value, ...newData];
				hasMore.value = response.has_more;
			},
			fail: (err) => {
				console.log(err);
				uni.showToast({
					title: '网络请求失败',
					icon: 'none'
				});
			},
			complete: () => {
				loading.value = false;
				showLoadding.value = false;
			}
		});
	}



	// 在getTreeholeList方法中初始化加载状态
	const getTreeholeList = async (isRefresh = false) => {
		if (isRefresh) treeholePage.value = 1;
		if (!treeholeHasMore.value || treeholeLoading.value) return

		treeholeLoading.value = true
		showLoadding.value = true
		uni.request({
			url: websiteUrl.value + '/treehole-submissions',
			data: {
				page: treeholePage.value,
				pageSize: treeholePageSize.value
			},
			success: (res) => {
				const newData = res.data.data.submission_list.map(item => ({
					...item,
					images: item.images || [],
					// 新增加载状态字段
					imagesLoaded: false,
					loadCount: 0
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
				showLoadding.value = false
			}
		})
	}

	// 图片加载完成处理
	const handleImageLoad = (item) => {
		// console.log("图片加载完成", item)
		item.loadCount++;
		// 所有图片加载完成后再启用轮播
		if (item.loadCount >= item.images.length) {
			item.imagesLoaded = true;
		}
	}
	// 热门搭配图片加载完成处理
	const handleHotImageLoad = (item) => {
		console.log("搭配图片加载完成", item)
		if (!item.loadCount) {
			item.loadCount = 0
		}
		item.loadCount++;
		console.log(item.id, "加载进度:", item.loadCount, "/", item.image_urls.length)
		// 所有图片加载完成后再启用轮播
		// if (item.loadCount >= item.image_urls.length) {
		// 	item.imagesLoaded = true;
		// }
		setTimeout(() => {
			item.imagesLoaded = true;
		}, 300)
	}



	// 图片加载失败处理
	const handleImageError = (item, idx) => {
		console.error(`图片加载失败: ${item.images[idx]}`);
		// 标记为加载完成（即使失败也要继续）
		item.loadCount++;
		if (item.loadCount >= item.images.length) {
			item.imagesLoaded = true;
		}

		// 可选：替换为占位图
		// item.images[idx] = '/static/image-error.png';
	}
	// 新闻图片加载完成处理
	const handleNewsImageLoad = (item) => {
		item.loadCount++;
		// 所有图片加载完成后再启用轮播

		if (item.loadCount >= item.image_list.length) {
			item.imagesLoaded = true;
		}
	}

	// 新闻图片加载失败处理
	const handleNewsImageError = (item, idx) => {
		console.error(`新闻图片加载失败: ${item.image_list[idx]}`);
		// 标记为加载完成（即使失败也要继续）
		if (!item.loadCount) {
			item.loadCount = 0
		}
		item.loadCount++;
		if (item.loadCount >= item.image_list.length) {
			item.imagesLoaded = true;
		}

		// 可选：替换为占位图
		// item.image_list[idx] = '/static/image-error.png';
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
			url: websiteUrl.value + (item.has_liked ? '/with-state/unlike' : '/with-state/add-like'),
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


	// 版本检查组件实例（用于调用子组件暴露的方法）
	const versionCheckRef = ref(null)

	// 调试：清空忽略期并提示
	function debugClearIgnore () {
	  try {
		versionCheckRef.value?.debugClearIgnore?.()
		console.log('[Debug] 手动清空忽略期成功')
		uni.showToast({ title: '已清空忽略期', icon: 'none' })
	  } catch (e) {
		console.error('[Debug] 清空忽略期失败', e)
		uni.showToast({ title: '清空失败', icon: 'none' })
	  }
	}
	// 时间格式化方法
	const formatTime = (timestamp) => {
		const date = new Date(timestamp * 1000)
		return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`
	}

	// 在父组件的script中添加处理函数
	const handleServerChange = (event) => {
		console.log('服务器已切换', event.server);

		// 在这里执行刷新数据的操作
		refreshData();

		// 示例：刷新当前标签页的数据
		switch (activeTab.value) {
			case 'brands':
				page.value = 1;
				brandsList.value = [];
				hasMore.value = true;
				getBrands(true);
				break;
			case 'news':
				newsPage.value = 1;
				newsList.value = [];
				newsHasMore.value = true;
				getNews(true);
				break;
			case 'hot':
				hotPage.value = 1;
				hotList.value = [];
				hotHasMore.value = true;
				getHotCollocations(true);
				break;
			case 'second':
				treeholePage.value = 1;
				treeholeList.value = [];
				treeholeHasMore.value = true;
				getTreeholeList(true);
				break;
		}

		// uni.showToast({
		//   title: '已刷新数据',
		//   icon: 'success'
		// });
	};

	// 初始化加载
	onLoad(() => {
		getUserInfo()
		getBrands()
		getNews() // 新增初始化加载
		getHotCollocations()
		//加载树洞
		getTreeholeList()
		//获取轮播图
		getArticles()
	})



	// 上拉加载更多
	onReachBottom(() => {
		if (activeTab.value === 'brands' && hasMore.value) {
			getBrands();
		} else if (activeTab.value === 'news' && newsHasMore.value) {
			getNews();
		} else if (activeTab.value === 'second' && treeholeHasMore.value) {
			getTreeholeList();
		}
	})
</script>

<style lang="scss" scoped>
	.body {
		position: relative;
		min-height: 100vh;
		/* 确保有足够的高度 */
		// background: #575568;
		background: #d6e4f2;

	}

	// 适配区域
	.header-placeholders {
		height: v-bind(headerHeight);
	}

	.index_header {
		// background: linear-gradient(180deg, rgb(218 238 255) 0%, rgb(255 255 255) 100%);
		// background: linear-gradient(180deg, rgb(255 230 215) 0%, #ffffff 100%);
		// background: linear-gradient(180deg, #fbdfe8 0%, #ffffff 100%);
		// background: url("/static/bg.jpg");
		// background-size: cover;
		// background: linear-gradient(180deg, rgb(218 238 255) 0%, rgb(255 255 255) 100%); 
		// background-image: radial-gradient(#fff 20%, transparent 0);
		// background-size: 20px 20px;

		// background-image: url("https://images1.fantuanpu.com/bd/bg1.jpg");
		// background-size:cover;

		// background: transparent;
		// background-image: radial-gradient(#dbdbdb 20%, #ffffff00 0);
		// background-size: 6px 6px;
		padding: 0.46875rem;
		padding-bottom: 0.03125rem;
		color: #4cbbd0;
		display: block;
		// background-color: #575568;
		background: linear-gradient(180deg, #def9ff, #d6e4f2);

		.logo {
			margin: 20rpx 10rpx;
			display: block;
			width: 100rpx;
			font-size: 30rpx;
			font-weight: 1000;
			color: #8fa0b5;
			width: 250rpx;
			padding-top: 10rpx;
			vertical-align: top;
			position: relative;
		}

		.domain_text {
			font-size: 13rpx;
		}


		/* 四个小按钮 */
		.index_page_article {
			height: 180rpx;
			/* 增加高度以适应图片和文字 */
			width: 100%;
			display: flex;
			justify-content: space-around;
			/* 均匀分布四个按钮 */
			padding: 10rpx 0;
			margin-bottom: 20rpx;

			.swich_box {
				width: 150rpx;
				/* 增加宽度 */
				height: 160rpx;
				/* 增加高度 */
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				position: relative;
				transition: all 0.3s ease;
				border-radius: 30rpx;
				padding: 15rpx 0;

				image {
					width: 80rpx;
					/* 统一图片大小 */
					height: 80rpx;
					display: block;
					margin-bottom: 15rpx;
					/* 图片和文字间距 */
					transition: all 0.3s ease;
				}

				text {
					font-size: 23rpx;
					font-weight: bold;
					transition: all 0.3s ease;
					color: #fff;
					text-align: center;
					display: block;
					width: 100%;
				}

				/* 激活状态样式 */
				&.active {
					position: relative;
					bottom: 20rpx;
					background: #fff;
					border-radius: 40rpx;
					// box-shadow: 0 -5rpx 10rpx rgba(0,0,0,0.05);
					box-shadow: 0 0 10px #0000001a;

					// image {
					//     transform: translateY(-10rpx); /* 图片上移 */
					// }

					text {
						color: #7ab6c6;
						// transform: translateY(5rpx); /* 文字下移 */
					}
				}
			}
		}
	}

	.body_container {
		border-radius: 1.25rem 1.25rem 0 0;
		overflow: hidden;
		background: #fff;
		width: calc(100vw - 20rpx);
		margin: 0 auto;
	}

	.body_list {
		position: relative;
		min-height: 110vh;

		// top: -60rpx;
		transition: all 0.3s ease;
		transform-origin: top center;

		// 保证初始状态样式
		// &::before {
		// 	content: '';
		// 	position: absolute;
		// 	top: 0;
		// 	left: 0;
		// 	right: 0;
		// 	height: 30rpx;
		// 	background: inherit;
		// 	border-radius: 1.25rem 1.25rem 0 0;
		// }
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
		// border: 1rpx solid #69def4;;
		color: #aa9ab9;
		font-size: 26rpx;
		transition: all 0.3s;
		margin: 0 20rpx;
		height: 26rpx;
		line-height: 26rpx;

		&.active {
			background: linear-gradient(135deg, #97e7f7, #d5acd6);
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
		// display: flex;
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
		position: relative;


		&::after {
			content: '';
			position: absolute;
			bottom: 0;
			left: 0;
			right: 0;
			height: 60rpx;
			background: linear-gradient(transparent, rgba(0, 0, 0, 0.2));
			z-index: 1;
		}

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
		padding-top: 0rpx;

		.news-item {
			margin-bottom: 30rpx;
			margin: 0rpx 0rpx 30rpx 00rpx;
			border-radius: 16rpx;
			overflow: hidden;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
			display: flex;

			.news-images {
				display: inline-block;
				// width: 280rpx;
				min-height: 250rpx;
				padding: 10rpx;

			}

			.image-swiper {
				width: 200rpx;

				.swiper-image {
					width: 100%;
					height: 100%;
					border-radius: 15rpx;
				}
			}

			.news-content {
				padding: 10rpx 20rpx 20rpx 20rpx;
				width: 420rpx;
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
					text-overflow: ellipsis;
					-webkit-box-orient: vertical;
					-webkit-line-clamp: 1;
				}

				.news-desc {
					font-size: 23rpx;
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
						background: linear-gradient(135deg, #97e7f7, #d5acd6);
						;
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
		// padding-top: 50rpx;

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
			display: inline-block;

			// 只显示一行
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
			// display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 1;
		}

		.time {
			font-size: 24rpx;
			color: #999;
		}
	}

	.content {
		font-size: 23rpx;
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
		bottom: 280rpx;
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


	.brand_type_description {
		text {
			font-size: 22rpx;
			color: #888;
			padding: 10rpx 30rpx;
		}
	}


	.brand_type_description {
		background: rgba(76, 187, 208, 0.05);
		border-radius: 12rpx;
		padding: 24rpx;
		margin: 20rpx 0;
		position: relative;
		overflow: hidden;

		&::before {
			content: "";
			position: absolute;
			left: 0;
			top: 50%;
			transform: translateY(-50%);
			width: 4rpx;
			height: 70%;
			background: #4cbbd0;
			border-radius: 4rpx;
		}

		text {
			font-size: 24rpx;
			color: #7f8c8d;
			line-height: 1.6;
			display: block;
			padding-left: 16rpx;
			position: relative;
			text-align: justify;

			&::after {
				content: "  ";
				color: rgba(76, 187, 208, 0.2);
				position: absolute;
				font-size: 40rpx;
				right: -10rpx;
				bottom: -20rpx;
				transform: rotate(15deg);
			}
		}
	}

	/* 自定义下拉刷新样式 */
	::v-deep .uni-scroll-view-refresh {
		.uni-scroll-view-refresh-inner {
			transform: none !important;
			flex-direction: column;

			.uni-load-more {
				display: none !important;
			}

			&::before {
				content: "↓ 下拉刷新";
				font-size: 26rpx;
				color: #4cbbd0;
				transition: all 0.3s;
			}

			&[refreshing]::before {
				content: "正在刷新...";
				color: #4cbbd0;
			}

			&[refreshing]::after {
				content: "";
				display: block;
				width: 40rpx;
				height: 40rpx;
				border: 4rpx solid #4cbbd0;
				border-top-color: transparent;
				border-radius: 50%;
				animation: spin 0.8s linear infinite;
				margin-top: 10rpx;
			}
		}
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	::-webkit-scrollbar {
		width: 0 !important;
		height: 0 !important;
		background-color: transparent !important;
		display: none !important;
	}

	// 新增图片容器样式
	.image-container {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.loading-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(255, 255, 255, 0.7);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 10;
	}

	.loading-icon {
		animation: rotate 1s linear infinite;
	}

	@keyframes rotate {
		from {
			transform: rotate(0deg);
		}

		to {
			transform: rotate(360deg);
		}
	}

	// 图片加载完成后的动画
	.swiper-image {
		opacity: 0;
		transition: opacity 0.5s ease;

		&.loaded {
			opacity: 1;
		}
	}
	
	.fake-search{
	  width: 670rpx;
	  height: 72rpx;
	  margin: 12rpx 0 8rpx;
	  padding: 0 24rpx;
	  background: #f8f8f8;
	  border-radius: 40rpx;
	  display: flex;
	  align-items: center;
	  gap: 14rpx;
	  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.03);
	}
	.fake-search__placeholder{
	  font-size: 26rpx;
	  color: #9aa0a6;
	}
	.fake-search--hover{
	  opacity: .9;
	}
</style>