<template>
	<meta name="theme-color" content="#def9ff"></meta>
	<view-logs />
	<common-page head_color="#def9ff">
		<!-- 看看 Tab 内容 --><!-- 顶部 tab 切换栏 -->
		<view class="tabs">
			<view class="tab" :class="{ active: currentTab === 'find' }" @tap="handleTabSwitch('find')">
				<image src="/static/new-icon/findfind.gif" class="tab-image"></image>
				<!-- <text>找找</text> -->
			</view>
			<view class="tab" :class="{ active: currentTab === 'view' }" @tap="handleTabSwitch('view')"> 
				<image src="/static/new-icon/sesee.png" class="tab-image" style="position: relative;bottom: 5rpx;"></image>
				<!-- <text>看看</text> -->
			</view>
		</view>

		<!-- 找找 Tab 内容 -->
		<view v-if="currentTab === 'find'">
			<!-- 分类筛选区域 -->
			<view class="category-container">
				<view style="margin: 10rpx 0 40rpx 0;">
					<goods-search :hidden-icon="false" width="670rpx"></goods-search>
				</view>
				<!-- 商品分类 -->
				<scroll-view scroll-x class="category-scroll" :show-scrollbar="false">
					<view class="category-item" v-for="(type, index) in goodsTypes" :key="index"
						:class="{ active: selectedType === type }" @tap="selectType(type)">
						{{ type }}
					</view>
				</scroll-view>

				<!-- 尺寸分类 -->
				<scroll-view scroll-x class="size-scroll" :show-scrollbar="false">
					<view class="size-item" v-for="(size, index) in sizes" :key="index"
						:class="{ active: selectedSize === size }" @tap="selectSize(size)">
						{{ size }}
					</view>
				</scroll-view>
			</view>

			<!-- 随机商品列表 -->
			<scroll-view class="goods-list" scroll-y @scrolltolower="loadMoreGoods" :show-scrollbar="false">
				<view class="goods-container">
					<view v-for="(goods, index) in randomGoodsList" :key="goods.id" class="goods-card" @tap="jumpGoods(goods.id)">
						<image :src="goods.goods_images[0]" mode="aspectFill" class="goods-image" />
						<view class="goods-info">
							<text class="goods-name">{{ goods.name }}</text>
							<text class="goods-brand">{{ goods.brand_name }}</text>
							<text class="goods-price">{{ goods.total_amount }} {{ goods.currency }}</text>
						</view>
					</view>
				</view>

				<!-- 加载状态 -->
				<view class="loading-state">
					<text v-if="goodsLoading">加载中...</text>
					<text v-if="goodsNoMore" class="no-more">没有更多了</text>
				</view>
			</scroll-view>
		</view>
		<view v-if="currentTab === 'view'">
			<!-- 筛选栏 -->
			<!-- <view class="filter-bar" :style="miniProgram ? 'width:500rpx' : ''"> -->
			<view class="filter-bar-container">
				<view class="filter-bar" >
					<view class="filter-tags" @tap="showFilter">
						<view class="selected-goods">
							<view v-for="goods in filterGoods" :key="goods.goods_id" class="tag"
								@tap.stop="(e) => removeGood(goods.goods_id, e)">
								{{ goods.goods_name }}
								<text class="remove">×</text>
							</view>
						</view>
						<text v-if="!filterGoods.length" class="tip">当前无筛选条件</text>
					</view>
					<button class="submit-btn" @tap="fetchCollocations(true)">筛选</button>
				</view>
			</view>
			
			<view class="container">
				<!-- <view v-if="miniProgram" style="height: 40rpx;"></view> -->
				
				<!-- 搭配列表 -->
				<scroll-view class="card-list" scroll-y @scrolltolower="loadMore" :show-scrollbar="false">
					<view class="cards-container" :style="{ height: containerHeight + 'px' }">
						<view v-for="(item, index) in collocationList" :key="item.collocation_id" class="card"
							:id="'card-' + index" :style="cardStyle(index)"
							@tap="jump2collectionDetail(item.collocation_id, item.origin )">

							<view class="user-info" @tap.stop="jumpToUserPage(item.uid)">
								<image :src="item.avatar || '/default_avatar.jpg'" class="avatar" mode="aspectFill" />
								<view class="user-meta">
									<text class="username">{{ getUserName(item.username) }}</text>
									<view class="like-count">
										<uni-icons type="hand-up" size="18" color="#5f85a3"></uni-icons>
										<text style="margin: 0 5rpx;color: #5f85a3;"> {{ item.like_count }}</text>
									</view>
								</view>
							</view>

							<image v-if="item.image_urls?.length > 0" :src="item.image_urls[0]" mode="aspectFill"
								class="card-image" lazy-load />
							<view class="card-content">
								<text class="title">{{ item.title }}</text>
								<text class="desc">{{ item.content }}</text>
								<view class="goods-tags">
									<view class="tag-box" v-for="(rel, index) in item.relation_list" :key="index">
										<text class="goods-tag">
											{{ rel.relation_goods_name || '未命名商品' }}
										</text>
									</view>

								</view>
							</view>
						</view>
					</view>

					<!-- 加载状态 -->
					<view class="loading-state">
						<text v-if="loading">加载中...</text>
						<text v-if="noMore" class="no-more">没有更多了</text>
					</view>
				</scroll-view>

				<!-- 悬浮发帖按钮 -->
				<view class="floating-button" @tap="togglePostMenu">
					<uni-icons type="plusempty" size="30" color="#fff"></uni-icons>
				</view>

				<!-- 发帖菜单 -->
				<uni-transition name="fade" mode="out-in" :duration="300">
					<view v-if="showPostMenu" class="post-menu-mask" @tap="closePostMenu"></view>
				</uni-transition>
				<view class="post-menu" :class="{ show: showPostMenu }">
					<view class="menu-item" @tap="goToCollocation">
						<uni-icons style="margin-right: 10rpx;" type="color" size="24" color="#5f85a3"></uni-icons>
						<text>发搭配分享</text>
					</view>
					<view class="menu-item" @tap="goToShowcase">
						<uni-icons style="margin-right: 10rpx;" type="compose" size="24" color="#5f85a3"></uni-icons>
						<text>发展示柜</text>
					</view>
				</view>

				<!-- 筛选弹窗 -->
				<common-modal v-model:visible="showFilterModal" top="0" width="100%" height="100%">
					<view class="modal-mask" @tap.stop="closeFilter"></view>
					<view class="filter-modal">
						<view class="modal-header" :style="miniProgram ? 'margin-top:60rpx' : 'margin-top:0rpx'">
							<text class="title">筛选看想要的娃物搭配吧！</text>
							<text class="close" @tap="closeFilter">×</text>
						</view>

						<!-- 商品搜索组件 -->
						<goods-search mode="fill" @select="handleGoodsSelect" :background="'#f8f8f8'" :width="'100%'" />

						<!-- 已选商品展示 -->
						<view class="selected-goods">
							<view v-for="goods in filterGoods" :key="goods.goods_id" class="goods-tag"
								@tap.stop="(e) => removeGood(goods.goods_id, e)">
								{{ goods.goods_name }}
								<text class="remove">×</text>
							</view>
						</view>

						<view class="action-btns">
							<button class="btn reset" @tap="resetFilter">重置</button>
							<button class="btn confirm" @tap="applyFilter">应用筛选</button>
						</view>
					</view>
				</common-modal>
			</view>
		</view>
		<loading-toast :show="goodsLoading||loading"></loading-toast>
	</common-page>

</template>

<script setup>
	import {
		ref,
		reactive,
		onMounted,
		nextTick,
		getCurrentInstance
	} from 'vue'

	import {
		onLoad,
		onReachBottom,
		onPullDownRefresh,
	} from "@dcloudio/uni-app"

	import {
		websiteUrl
	} from '../../common/config.js'


	// 响应式数据
	const currentTab = ref('find') // 'find' 或 'view'
	const collocationList = ref([])
	const loading = ref(false)
	const noMore = ref(false)
	const currentPage = ref(1)
	const pageSize = 10

	const containerHeight = ref(0)
	const cardWidth = ref(0)
	const columnsHeight = reactive([0, 0]) // 记录两列高度

	// 筛选相关
	const showFilterModal = ref(false)
	const filterBrand = ref('')
	const goodsOptions = ref([])
	const instance = getCurrentInstance()

	const selectedBrand = ref(null)
	const filterGoods = ref([]) // 现在存储的是 {goods_id, goods_name} 对象数组
	const tempSelectGoods = ref(null) // 临时存储选择的商品

	// 商品相关数据
	const randomGoodsList = ref([])
	const goodsLoading = ref(false)
	const goodsNoMore = ref(false)
	const goodsCursor = ref(-1)
	const selectedType = ref('全部')
	const selectedSize = ref('全部')
	const goodsTypes = ref([])
	const sizes = ref([])

	// 是否小程序
	const miniProgram = process.env.VUE_APP_PLATFORM === 'mp-weixin'
	// 新增发帖按钮相关状态
	const showPostMenu = ref(false);

	// 切换发帖菜单显示状态
	const togglePostMenu = () => {
		showPostMenu.value = !showPostMenu.value;
	};

	// 关闭发帖菜单
	const closePostMenu = () => {
		showPostMenu.value = false;
	};



	// 跳转到搭配分享页面
	const goToCollocation = () => {
		closePostMenu();
		uni.navigateTo({
			url: '/pages/collocation/collocation'
		});
	};

	// 跳转到展示柜页面
	const goToShowcase = () => {
		closePostMenu();
		uni.navigateTo({
			url: '/pages/stock/showcase_form/showcase_form'
		});
	};

	// 计算卡片样式
	const cardStyle = (index) => {
		const item = collocationList.value[index]
		if (!item.position) return {}
		return {
			left: `${item.position.left}px`,
			top: `${item.position.top}px`,
			width: `${cardWidth.value}px`
		}
	}

	// 计算布局逻辑
	const calculateLayout = (instance) => {
		// 获取组件实例的正确方式
		console.log("进入计算布局逻辑")
		if (!instance) {
			console.log("无法获取instance")
			return
		}
		console.log("获取成功")
		if (!collocationList.value) {
			console.log("无列表数据，不需要计算布局")
			return
		}
		console.log("获取成功，准备createSelectorQuery")
		console.log(instance)
		const query = uni.createSelectorQuery().in(instance.proxy)
		console.log("获取到query")
		// 收集所有查询任务
		const tasks = collocationList.value.map((_, index) => {
			return new Promise((resolve) => {
				query.select(`#card-${index}`).boundingClientRect(rect => {
					resolve({
						index,
						rect
					})
				})
			})
		})

		// 统一执行查询
		query.exec(async () => {
			console.log("进入Query")
			// 重置列高
			columnsHeight[0] = 0
			columnsHeight[1] = 0

			// 按顺序处理所有查询结果
			const results = await Promise.all(tasks)
			if (!results.length) {
				console.warn('未查询到任何卡片元素');
				return;
			}
			results.forEach(({
				index,
				rect
			}) => {
				if (!rect) {
					console.error(`卡片${index}元素查询失败`);
					return
				}

				const item = collocationList.value[index]
				const colIdx = columnsHeight[0] <= columnsHeight[1] ? 0 : 1
				const left = colIdx * (cardWidth.value + 10)
				const top = columnsHeight[colIdx] + 10

				columnsHeight[colIdx] = top + rect.height
				item.position = {
					left,
					top
				}
			})

			// 更新容器高度
			containerHeight.value = Math.max(...columnsHeight) + 20 // 添加安全边距
		})
	}
	
	const handleTabSwitch = (tab) => {
	  // 强制关闭所有可能遮挡的层
	  showPostMenu.value = false;
	  showFilterModal.value = false;
	  
	  // 清空布局计算数据（针对看看页）
	  if (currentTab.value === 'view') {
	    collocationList.value.forEach(item => {
	      delete item.position;
	    });
	    columnsHeight[0] = 0;
	    columnsHeight[1] = 0;
	  }
	  
	  // 执行原有切换逻辑
	  switchTab(tab);
	}

	// 切换标签页
	const switchTab = (tab) => {
		currentTab.value = tab;
		if (tab === 'find') {
			// 首次切换到找找标签时加载分类数据
			if (goodsTypes.value.length === 0) {
				fetchGoodsTypes();
				fetchSizes();
			}
			// 加载随机商品列表
			if (randomGoodsList.value.length === 0) {
				fetchRandomGoods(true);
			}
		}
		if (tab == 'view') {
			// 加载看看
			fetchCollocations()
		}
	}

	// 获取商品分类
	const fetchGoodsTypes = async () => {
		try {
			const res = await uni.request({
				url: `${websiteUrl}/goods-types`,
				method: 'GET'
			});

			if (res.data.status === 'success') {
				goodsTypes.value = ['全部', ...res.data.data];
			}
		} catch (error) {
			console.error('获取商品分类失败:', error);
		}
	}

	// 获取尺寸分类
	const fetchSizes = async () => {
		try {
			const res = await uni.request({
				url: `${websiteUrl}/sizes?show_type=hot`,
				method: 'GET'
			});

			if (res.data.status === 'success') {
				// 提取尺寸的一级分类
				const sizeKeys = Object.keys(res.data.data);
				sizes.value = ['全部', ...sizeKeys];
			}
		} catch (error) {
			console.error('获取尺寸分类失败:', error);
		}
	}

	// 选择商品分类
	const selectType = (type) => {
		selectedType.value = type;
		fetchRandomGoods(true);
	}

	// 选择尺寸分类
	const selectSize = (size) => {
		selectedSize.value = size;
		fetchRandomGoods(true);
	}

	// 获取随机商品列表
	const fetchRandomGoods = async (reset = false) => {
		if (reset) {
			randomGoodsList.value = [];
			goodsCursor.value = -1;
			goodsNoMore.value = false;
		}

		if (goodsLoading.value || goodsNoMore.value) return;

		try {
			goodsLoading.value = true;

			const params = {
				cursor: goodsCursor.value,
				page_size: 10,
				type: selectedType.value === '全部' ? '' : selectedType.value,
				size: selectedSize.value === '全部' ? '' : selectedSize.value
			};

			const res = await uni.request({
				url: `${websiteUrl}/random-list`,
				method: 'POST',
				data: params,
				header: {
					'content-type': 'application/json'
				}
			});

			if (res.data.status === 'success') {
				const data = res.data.data;
				const newItems = data.goods_list || [];

				randomGoodsList.value = reset ? newItems : [...randomGoodsList.value, ...newItems];
				goodsCursor.value = data.next_cursor;
				goodsNoMore.value = newItems.length < 10;
			}
		} catch (error) {
			console.error('获取随机商品失败:', error);
			uni.showToast({
				title: '加载失败',
				icon: 'none'
			});
		} finally {
			goodsLoading.value = false;
		}
	}

	// 加载更多商品
	const loadMoreGoods = () => {
		fetchRandomGoods();
	}



	// 初始化卡片宽度
	onMounted(() => {
		const systemInfo = uni.getSystemInfoSync()
		const padding = 30 // 容器左右padding总和（px）
		cardWidth.value = (systemInfo.windowWidth - padding) / 2
		
		// 默认加载找找页的数据
		fetchGoodsTypes();
		fetchSizes();
		fetchRandomGoods(true);
		
		
	})

	// 下拉刷新处理
	onPullDownRefresh(async () => {
	  try {
	    if (currentTab.value === 'view') {
	      await fetchCollocations(true);
	    } else if (currentTab.value === 'find') {
	      await fetchRandomGoods(true);
	    }
	    uni.stopPullDownRefresh();
	  } catch (error) {
	    uni.stopPullDownRefresh();
	    uni.showToast({
	      title: '刷新失败',
	      icon: 'none'
	    });
	  }
	});

	// 获取搭配列表
	const fetchCollocations = async (reset = false) => {
		if (reset) {
			collocationList.value = [];
			currentPage.value = 1; // 重置页码
			noMore.value = false; // 重置没有更多数据状态
			loading.value = false; // 重置加载状态
		}
		if (loading.value || noMore.value) {
			console.log("正在加载或没有更多数据，停止请求")
			layoutFunction()
			return
		};

		try {
			loading.value = true;
			// 构造请求参数
			const params = {
				page: currentPage.value,
				page_size: pageSize,
				filter_goods_id_list: filterGoods.value.map(g => g.goods_id)
			};

			// 添加调试信息
			console.log('请求参数:', JSON.stringify(params, null, 2));

			const res = await uni.request({
				url: `${websiteUrl}/collocation-list`,
				method: 'POST',
				data: params,
				header: {
					'content-type': 'application/json' // 确保使用JSON格式
				}
			});

			console.log('接口响应:', res);

			if (res.data.status === 'success') {
				// 添加安全解构
				const data = res.data.data || {}
				const newItems = Array.isArray(data.collocation_relation_list) ?
					data.collocation_relation_list : []

				collocationList.value = reset ?
					newItems : [...collocationList.value, ...newItems]

				noMore.value = newItems.length < pageSize
				currentPage.value++

				// 添加空数据提示
				if (reset && newItems.length === 0) {
					uni.showToast({
						title: '暂无相关搭配',
						icon: 'none'
					})
				}
				layoutFunction()

				
			}
		} catch (error) {
			console.error('请求失败:', error);
			uni.showToast({
				title: '加载失败',
				icon: 'none'
			});
		} finally {
			loading.value = false;
		}
	};
	
	const layoutFunction = async () => {
		console.log("等待next tick")
		await nextTick()
		console.log("等待完成")
		calculateLayout(instance)
		// 500ms 后再运行一次计算布局
		setTimeout(() => {
			console.log("二次计算布局")
			calculateLayout(instance)
		}, 500)
	}

	// 筛选处理
	const showFilter = () => {
		showFilterModal.value = true;
	};

	// 品牌选择处理
	const handleBrandSelect = (brandId, brandName) => {
		selectedBrand.value = {
			id: brandId,
			name: brandName
		}
		filterBrand.value = brandName
		// filterGoods.value = [] // 切换品牌时清空已选商品
		if (brandId) {
			loadGoodsOptions(brandId)
		}
	}

	// 加载商品选项
	const loadGoodsOptions = async (brandId) => {
		try {
			const res = await uni.request({
				url: `${websiteUrl}/goods-name-list?id=${brandId}`,
				method: 'GET'
			})
			console.log('商品列表:', res.data)
			if (res.data.status === 'success') {
				goodsOptions.value = res.data.data
			}
		} catch (error) {
			console.error('加载商品失败:', error)
		}
	}

	const handleGoodsSelect = (goods) => {
		console.log("选择商品:", goods)
		if (!goods?.id) return;

		// 转换数据结构
		const newGoods = {
			goods_id: goods.id,
			goods_name: `${goods.brand_name ? goods.brand_name + '·' : ''}${goods.name}`
		};

		// 检查重复
		const exists = filterGoods.value.some(
			item => item.goods_id === newGoods.goods_id
		);

		if (!exists) {
			// 使用解构赋值触发响应式更新
			filterGoods.value = [...filterGoods.value, newGoods];
		}

		// 强制更新视图（可选）
		// await nextTick(); 

	};
	function jumpGoods(id) {
		uni.navigateTo({
			url: '/pages/goods/goods?goods_id=' + id
		})
	}

	const onShareAppMessage = () => ({
		title: 'BJD娃圈你想知道的这里都有~',
		path: '/pages/news/news',
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

	// 应用筛选
	const applyFilter = async () => {
		showFilterModal.value = false;
		// 强制重置并加载第一页
		await fetchCollocations(true);
	};
	// 关闭弹窗时清空临时选择
	const closeFilter = () => {
		showFilterModal.value = false;
	};


	// 移除单个商品
	const removeGood = (goodsId, event) => {
		// 阻止事件冒泡
		event?.stopPropagation?.() // 安全调用
		filterGoods.value = filterGoods.value.filter(g => g.goods_id !== goodsId)
		noMore.value = false
		fetchCollocations(true)
	}
	// 重置筛选
	const resetFilter = () => {
		selectedBrand.value = null
		filterBrand.value = ''
		filterGoods.value = []
		goodsOptions.value = []
	}

	// 跳转到搭配
	function jump2collectionDetail(collocation_id, origin) {
		uni.navigateTo({
			url: '/pages/collocation_share/collocation_share?collocation_id=' + collocation_id + '&origin=' +
				origin
		})
	}

	// 确认筛选
	const confirmFilter = async () => {
		filterGoods.value.push(tempSelectGoods.value)
		showFilterModal.value = false
		noMore.value = false
		await fetchCollocations(true)
	}

	// 分页加载
	const loadMore = () => {
		if (!noMore.value) fetchCollocations()
	}

	// 跳转详情
	const navigateToDetail = (item) => {
		uni.navigateTo({
			url: `/pages/collocation_share/collocation_share?collocation_id=${item.collocation_id}&origin=${item.origin}`
		})
	}

	const jumpToUserPage = (uid) => {
		uni.navigateTo({
			url: `/pages/user_page/user_page?uid=${uid}`
		})
	}

	// 临时用户名缓存（实际应通过接口获取）
	const getUserName = (name) => {
		// 这里可以替换为真实的用户名获取逻辑
		return name.length > 10 ? `${name.toString().slice(-8)}...` : name
	}



</script>

<style lang="scss" scoped>
	$primary-color: #a6e9f7;
	$hover-color: #1ed1e1;
	$border-color: #e6e6e6;
	$radius: 8px;

	text {
		font-size: 22rpx;
	}

	.container {
		padding: 20rpx;
		background: #f5f5f5;
		// padding-top: 50rpx;
		overflow: hidden;
	}
	.filter-bar-container {
		background: linear-gradient(180deg, #d6e4f2, #f5f5f5);
		padding: 20rpx 30rpx 40rpx 30rpx;
	}

	.filter-bar {
		display: flex;
		align-items: center;
		padding: 10rpx 20rpx;
		background: #fff;
		font-size: 22rpx;
		border-radius: 16rpx;
		// margin-top: 20rpx;
	
		// margin-bottom: 20rpx;
		// box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		box-sizing: border-box;

		
		.filter-tags {
			flex: 1;

			.tag {
				display: inline-block;
				margin-right: 20rpx;
				padding: 8rpx 16rpx;
				background: #f0f2f5;
				border-radius: 8rpx;
				font-size: 24rpx;
				color: #666;

			}

			.tip {
				color: #999;
				font-size: 24rpx;
			}
		}

		.filter-btn {
			width: 120rpx;
			height: 40rpx;
			line-height: 40rpx;
			font-size: 24rpx;
			background: #007aff;
			color: white;
			border-radius: 8rpx;
		}
	}

	.card-list {
		height: calc(100vh - 160rpx);


		.cards-container {
			position: relative;
			width: 100%;
		}

		.card {
			position: absolute;
			background: white;
			border-radius: 16rpx;
			margin-bottom: 20rpx;
			overflow: hidden;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
			width: 330rpx;
			display: inline-block;
			margin: 0rpx;

			//顶部对齐
			vertical-align: top;
			transition: top 0.3s ease, left 0.3s ease;

			.card-image {
				width: 100%;
				height: 400rpx;
			}

			.card-content {
				padding: 24rpx;

				.title {
					font-size: 26rpx;
					font-weight: 500;
					color: #515151;
					margin-bottom: 16rpx;
					display: -webkit-box;
					-webkit-box-orient: vertical;
					-webkit-line-clamp: 1;
					overflow: hidden;
					white-space: normal;
					text-overflow: ellipsis;

				}

				.desc {
					display: -webkit-box;
					-webkit-box-orient: vertical;
					-webkit-line-clamp: 2;
					overflow: hidden;
					font-size: 22rpx;
					color: #666;
					line-height: 1.5;
				}

				.goods-tags {
					margin-top: 20rpx;
					display: flex;
					flex-wrap: wrap;
					gap: 12rpx;

					.tag-box {
						padding: 4rpx 15rpx;
						background: #f0f2f5;
						border-radius: 8rpx;

						.goods-tag {
							line-height: 20rpx;
							font-size: 20rpx;
							color: #666;
							max-width: 110rpx;
							display: inline-block;
							white-space: nowrap;
							overflow: hidden;
						}
					}


				}
			}

			// 用户信息
			.user-info {
				display: flex;
				align-items: center;
				padding: 20rpx 24rpx 0;
				margin-bottom: 16rpx;

				.avatar {
					width: 64rpx;
					height: 64rpx;
					border-radius: 50%;
					margin-right: 16rpx;
				}

				.user-meta {
					flex: 1;

					.username {
						font-size: 24rpx;
						color: #515151;
						display: block;
						max-width: 150rpx;
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
					}

					.like-count {
						font-size: 20rpx;
						color: #666;
						display: flex;
						align-items: center;

						.icon {
							color: #ff4c4c;
							margin-right: 8rpx;
						}
					}
				}
			}

			.card-image {
				height: 360rpx; // 调整图片高度
				width: calc(100% - 40rpx);
				overflow: hidden;
				border-radius: 15rpx;
				margin: 0 20rpx;
			}
		}
	}

	.modal-container {
		padding-top: 0rpx;

	}

	.search_tab {
		padding: 0px;
	}

	.submit-btn {
		background: linear-gradient(135deg, $primary-color, $hover-color);
		color: white;
		border: none;
		border-radius: 15rpx;
		font-size: 22rpx;
		font-weight: 900;
		height: 60rpx;
		line-height: 60rpx;
		box-shadow: 0 6rpx 20rpx rgba($primary-color, 0.3);
		transition: all 0.3s;

		&::after {
			border: none;
		}

		&.loading {
			opacity: 0.7;
			background: #007aff;
		}

		&[disabled] {
			background: #c8c9cc;
			color: #fff;
		}

		&:active {
			transform: translateY(2rpx);
			box-shadow: 0 4rpx 12rpx rgba($primary-color, 0.3);
		}
	}

	.filter-modal {
		padding: 40rpx;
		background: white;
		border-radius: 24rpx;
		position: relative;
		z-index: 1001;
		box-sizing: border-box;
		width: 100vw;
		height: 100vh;

		/* 添加遮罩层样式 */
		.modal-mask {
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: rgba(0, 0, 0, 0.5);
			z-index: 1000;
		}


		.modal-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 40rpx;
			padding-left: 20rpx;


			.title {
				font-size: 28rpx;
				font-weight: 500;

			}

			.close {
				font-size: 48rpx;
				color: #999;
				position: relative;
				top: -8rpx;
			}
		}

		.filter-items {
			.filter-item {
				margin-bottom: 40rpx;

				.label {
					display: block;
					font-size: 28rpx;
					color: #666;
					margin-bottom: 20rpx;
				}
			}
		}

		.action-btns {
			display: flex;
			gap: 30rpx;
			margin-top: 40rpx;

			.btn {
				flex: 1;
				height: 50rpx;
				line-height: 50rpx;
				border-radius: 12rpx;
				font-size: 22rpx;

				&::after {
					border: none;
				}

				&.reset {
					background: #f0f2f5;
					color: #666;


				}

				&.confirm {
					// background: #007aff;
					// color: white;
				}
			}
		}

		.selected-goods {
			margin-top: 20rpx;
			display: flex;
			flex-wrap: wrap;
			gap: 10rpx;
		}

		.goods-tag {
			background: #f0f2f5;
			padding: 8rpx 20rpx;
			border-radius: 30rpx;
			font-size: 24rpx;
			color: #666;
			display: flex;
			align-items: center;

			.remove {
				margin-left: 10rpx;
				color: #999;
				font-size: 28rpx;
			}
		}
	}


	.loading-state {
		text-align: center;
		padding: 40rpx;
		color: #999;
		font-size: 28rpx;

		.no-more {
			display: block;
		}
	}

	/* 找找商品列表 */
	.floating-button {
		position: fixed;
		right: 40rpx;
		bottom: 120rpx;
		width: 90rpx;
		height: 90rpx;
		background: linear-gradient(135deg, #a6e9f7, #1ed1e1);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 6rpx 20rpx rgba(30, 209, 225, 0.4);
		z-index: 99;
		transition: all 0.3s ease;

		&:active {
			transform: scale(0.95);
			box-shadow: 0 4rpx 12rpx rgba(30, 209, 225, 0.3);
		}
	}

	.post-menu-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.3);
		z-index: 100;
		backdrop-filter: blur(5rpx);
	}

	.post-menu {
		position: fixed;
		right: 40rpx;
		bottom: 240rpx;
		background: white;
		border-radius: 16rpx;
		box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.15);
		padding: 20rpx 0;
		z-index: 101;
		transform: translateY(30rpx);
		opacity: 0;
		pointer-events: none;
		transition: all 0.3s ease;

		&.show {
			transform: translateY(0);
			opacity: 1;
			pointer-events: auto;
		}

		&::before {
			content: '';
			position: absolute;
			bottom: -12rpx;
			right: 35rpx;
			width: 0;
			height: 0;
			border-left: 12rpx solid transparent;
			border-right: 12rpx solid transparent;
			border-top: 12rpx solid white;
		}

		.menu-item {
			display: flex;
			align-items: center;
			padding: 20rpx 40rpx;
			font-size: 26rpx;
			color: #333;
			transition: background 0.2s;

			&:active {
				background: #f5f5f5;
			}

			uni-icons {
				margin-right: 15rpx;
			}
		}
	}
	
	
		.tabs {
		  display: flex;
		  justify-content: center; /* 居中显示 */
		  height: 150rpx; /* 增加高度 */
		  background: #fff;
		  position: sticky;
		  top: 0;
		  z-index: 100;
		  width: 100%;
		  padding: 0 20rpx 10rpx 20rpx;
		  box-sizing: border-box;
		  background: linear-gradient(180deg, #def9ff, #d6e4f2);
		  		  
		}
		
		.tab {
		  flex: 0 0 200rpx; /* 固定宽度 */
		  display: flex;
		  flex-direction: column; /* 垂直排列 */
		  align-items: center; /* 居中对齐 */
		  justify-content: center; /* 垂直居中 */
		  height: 100%;
		  position: relative;
		  transition: all 0.3s ease;

		  text {
		    font-size: 24rpx;
		    margin-top: 6rpx; /* 文字与图片间距 */
		    color: #a8a8a8;
		    transition: color 0.3s ease;
			z-index: 10;
		  }
		  
		  &.active {
		    text {
		      color: #7aa2d6;
		      font-weight: bold;
		    }
		    
		    &::after {
		      content: '';
		      position: absolute;
		      bottom: 0rpx;
		      left: 50%;
		      transform: translateX(-50%);
		      width: 80rpx;
		      height: 6rpx;
		      background: #7aa2d6;
		      border-radius: 3rpx;
		    }
		  }
		}
		
		.tab-image {
		  width: 120rpx; /* 调整图片大小 */
		  height: 120rpx;
		  transition: transform 0.3s ease;
		  position: relative;
		}

		
		.category-container {
			padding: 40rpx 40rpx 10rpx 40rpx;
			background: linear-gradient(180deg, #d6e4f2, #fff);
		}
		
		.category-scroll, .size-scroll {
			white-space: nowrap;
			margin-bottom: 10rpx;
		}
		
		.category-item, .size-item {
			display: inline-block;
			padding: 10rpx 15rpx;
			margin-right: 20rpx;
			border-radius: 40rpx;
			background: #f5f5f5;
			font-size: 24rpx;
			color: #817f7f;
			
			&.active {
				background: #e6f7ff;
				color: #7aa2d6;
				font-weight: bold;
			}
		}
		
		.goods-list {
			height: calc(100vh - 240rpx); /* 根据实际高度调整 */
			background: #f5f5f5;
		}
		
		.goods-container {
			display: flex;
			flex-wrap: wrap;
			padding: 20rpx;
			gap:10rpx;
		}
		
		.goods-card {
			width: 350rpx;
			margin-bottom: 20rpx;
			background: #fff;
			border-radius: 16rpx;
			overflow: hidden;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
			box-sizing: border-box;
			
		}
		
		.goods-image {
			width: 320rpx;
			height: 400rpx;
			margin: 20rpx 15rpx;
			border-radius: 20rpx;
		}
		
		.goods-info {
			padding: 20rpx;
		}
		
		.goods-name {
			font-size: 26rpx;
			color: #333;
			font-weight: 500;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2;
			overflow: hidden;
			line-height: 1.4;
		}
		
		.goods-brand {
			display: block;
			font-size: 24rpx;
			color: #666;
			margin-top: 10rpx;
		}
		
		.goods-price {
			display: block;
			font-size: 26rpx;
			color: #f9a1a0;
			font-weight: bold;
			margin-top: 10rpx;
		}
		
		.loading-state {
			text-align: center;
			padding: 40rpx;
			color: #999;
			font-size: 28rpx;
			
			.no-more {
				display: block;
			}
		}
	::-webkit-scrollbar {
		width: 0!important;
		height: 0!important;
		background-color: transparent!important;
		display: none!important;
	}
</style>