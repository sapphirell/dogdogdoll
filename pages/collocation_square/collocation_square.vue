<template>
	<meta name="theme-color" content="#f5f5f5"></meta>
	<common-page head_color="#f5f5f5">
		<view class="container">
			<view v-if="miniProgram" style="height: 40rpx;"></view>
			<!-- 筛选栏 -->
			<view class="filter-bar">
				<view class="filter-tags" @tap="showFilter">
					<view class="selected-goods">
						<view v-for="goods in filterGoods" :key="goods.goods_id" class="tag">
							{{ goods.goods_name }}
							<text class="remove" @tap="removeGood(goods.goods_id)">×</text>
						</view>
					</view>
					<text v-if="!filterGoods.length" class="tip">当前无筛选条件</text>
				</view>
				<button class="submit-btn" @tap="fetchCollocations(true)">筛选</button>
			</view>

			<!-- 搭配列表 -->
			<scroll-view class="card-list" scroll-y @scrolltolower="loadMore" :show-scrollbar="false">
				<view class="cards-container" :style="{ height: containerHeight + 'px' }">
					<view v-for="(item, index) in collocationList" :key="item.collocation_id" class="card"
						:id="'card-' + index" :style="cardStyle(index)" @tap="jump2collectionDetail(item.collocation_id, item.origin )">
						<image :src="item.image_urls[0]" mode="aspectFill" class="card-image" lazy-load />
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

			<!-- 筛选弹窗 -->
			<common-modal v-model:visible="showFilterModal" v-if="showFilterModal" :visible="showFilterModal">
				<view class="filter-modal">
					<view class="modal-header">
						<text class="title">筛选条件</text>
						<text class="close" @tap="showFilterModal = false">×</text>
					</view>

					<view class="filter-items">
						<view class="filter-item">
							<!-- <text class="label">品牌搜索</text> -->
							<common-search mode="fill" @select="handleBrandSelect" width="450rpx" />
						</view>

						<view class="filter-item" v-if="selectedBrand">
							<!-- <text class="label">商品选择</text> -->
							<custom-picker :dataList="goodsOptions" @select="handleGoodsSelect" multiple />

						</view>
					</view>

					<view class="action-btns">
						<button class="btn reset" @tap="resetFilter">重置</button>
						<button class="btn confirm submit-btn" @tap="confirmFilter">确认</button>
					</view>
				</view>
			</common-modal>
		</view>
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
		websiteUrl
	} from '../../common/config.js'

	// 响应式数据
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

	// 是否小程序
	const miniProgram = process.env.VUE_APP_PLATFORM === 'mp-weixin'


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


	// 初始化卡片宽度
	onMounted(() => {
		const systemInfo = uni.getSystemInfoSync()
		const padding = 30 // 容器左右padding总和（px）
		cardWidth.value = (systemInfo.windowWidth - padding) / 2
	})

	// 获取搭配列表
	const fetchCollocations = async (reset = false) => {
		if (loading.value || noMore.value) {
			console.log('正在加载中或没有更多了')
			return
		}

		try {
			loading.value = true
			if (reset) {
				collocationList.value = []
				currentPage.value = 1
			}

			const params = {
				page: currentPage.value,
				page_size: pageSize,
				filter_goods_id_list: filterGoods.value.map(g => g.goods_id) // 传递ID数组
			}

			// 如果需要品牌筛选可以添加
			// if(selectedBrand.value) params.brand_id = selectedBrand.value.id

			const res = await uni.request({
				url: `${websiteUrl}/collocation-list`,
				method: 'POST',
				data: params
			})


			if (res.data.status === 'success') {
				const data = res.data.data
				const newItems = data.collocation_relation_list

				collocationList.value = reset ?
					newItems : [...collocationList.value, ...newItems]

				noMore.value = data.total <= currentPage.value * pageSize
				currentPage.value++
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
		} finally {
			loading.value = false
		}
	}

	// 筛选处理
	const showFilter = () => showFilterModal.value = true

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


	const handleGoodsSelect = (goodsId, goodsName) => {
		if (!goodsId) {
			console.log("未选择有效goods")
			return
		}

		// 避免重复添加
		for (const g of filterGoods.value) {
			if (g.goods_id === goodsId) {
				return
			}
		}


		tempSelectGoods.value = {
			goods_id: goodsId,
			goods_name: goodsName
		}

	}
	// 移除单个商品
	const removeGood = (goodsId) => {
		// 阻止事件冒泡
		event.stopPropagation()
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
			url: '/pages/collocation_share/collocation_share?collocation_id=' + collocation_id + '&origin=' + origin
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

	// 初始化加载
	onMounted(fetchCollocations)
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
		padding-top: 50rpx;
		overflow: hidden;
	}

	.filter-bar {
		display: flex;
		align-items: center;
		padding: 10rpx 20rpx;
		background: #fff;
		font-size: 22rpx;
		border-radius: 16rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

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
					color: #333;
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
</style>