<!-- components/relation-picker/relation-picker.vue -->
<template>
	<common-modal :visible="internalVisible" @update:visible="handleModalVisibilityChange" top="100rpx">
		<view class="relation-picker-container">
			<view class="picker-header">
				<view class="mode-switch">
					<!-- 模式切换按钮 -->
					<view v-if="isFuzzyMode" class="switch-btn precision-mode" @tap="switchMode(false)">
						<uni-icons type="search" size="18" color="#fff"></uni-icons>
						<text>切换到精确关联</text>
					</view>
					<view v-if="!isFuzzyMode" class="switch-btn fuzzy-mode" @tap="switchMode(true)">
						<uni-icons type="list" size="18" color="#fff"></uni-icons>
						<text>切换到模糊关联</text>
					</view>
				</view>
			</view>

			<view class="picker-body">
				<!-- 精确模式 -->
				<template v-if="!isFuzzyMode">
					<common-name-picker ref="typePicker"  v-if="!hideType" :dataList="typeList" @select="handleTypeSelect"
						@toggle="handleComponentToggle('type')" class="type-picker" />

					<common-search ref="brandSearch" background="#f8f8f8" mode="fill" @select="handleBrandSelect"
						@toggle="handleComponentToggle('brand')" class="brand-search"  style="padding: 0px!important;" />

					<custom-picker ref="goodsPicker" background="#f8f8f8"  :dataList="goodsList" @select="handleGoodsSelect"
						@toggle="handleComponentToggle('goods')" class="goods-picker" />
				</template>

				<!-- 模糊模式 -->
				<template v-else>
					<goods-search ref="fuzzySearch" mode="fill" @select="handleFuzzySelect" v-model="searchKeyword" width="550rpx"
						@toggle="handleComponentToggle('fuzzy')" class="fuzzy-search" />
				</template>
			</view>

			<view class="picker-footer">
				<button class="cancel-btn" @tap="handleCancel">取消</button>
				<button class="confirm-btn" @tap="handleConfirm">确认</button>
			</view>
		</view>
	</common-modal>
</template>

<script setup>
	import {
		ref,
		watch,
		nextTick
	} from 'vue';

	import {
		websiteUrl,
		image1Url,
		wechatSignLogin,
		getUserInfo,
		global,
		asyncGetUserInfo,
		getScene,
	} from "../../common/config.js"


	const props = defineProps({
		typeList: {
			type: Array,
			default: () => []
		},
		visible: {
			type: Boolean,
			default: false
		},
	  hideType: {
		type: Boolean,
		default: false
	  }
	})
	const emit = defineEmits([
		'update:visible',
		'confirm',
		'cancel'
	])
	const goodsList = ref([])

	// 组件refs
	const typePicker = ref()
	const brandSearch = ref()
	const goodsPicker = ref()
	const fuzzySearch = ref()

	// 使用内部状态管理可见性
	const internalVisible = ref(false)
	// 状态管理
	const isFuzzyMode = ref(true)
	const selectedData = ref({
		type: null,
		brand: {
			id: 0,
			name: ''
		},
		goods: {
			id: 0,
			name: '',
			image: ''
		}
	})


	// 搜索关键词
	const searchKeyword = ref('')

	// 模式切换
	// const switchMode = (isFuzzy) => {
	// 	console.log(isFuzzy)
	// 	isFuzzyMode.value = isFuzzy
	// 	// 切换时重置所有状态
	// 	searchKeyword.value = ''
	// 	selectedData.value = {
	// 		type: null,
	// 		brand: null,
	// 		goods: null
	// 	}
	// 	goodsList.value = []
	// }
	const switchMode = (isFuzzy) => {
		isFuzzyMode.value = isFuzzy
		resetAllComponents()
		selectedData.value = {
			type: null,
			brand: {
				id: 0,
				name: ''
			},
			goods: {
				id: 0,
				name: '',
				image: ''
			}
		}
	}

	// 处理组件展开状态
	const handleComponentToggle = (component) => {
		const components = {
			type: typePicker,
			brand: brandSearch,
			goods: goodsPicker,
			fuzzy: fuzzySearch
		}

		Object.entries(components).forEach(([key, ref]) => {
			if (key !== component && ref.value?.close) {
				ref.value.close()
			}
		})
	}

	// 重置所有子组件
	const resetAllComponents = () => {
		;
		[typePicker, brandSearch, goodsPicker, fuzzySearch].forEach(comp => {
			if (comp.value?.reset) comp.value.reset()
		})
	}



	// 模糊搜索选择处理
	const handleFuzzySelect = async (goods) => {
		try {
			// 处理手动输入的情况
			if (!goods?.id) {
				searchKeyword.value = goods.name
				selectedData.value = {
					type: '未知类型',
					brand: {
						id: 0,
						name: ''
					},
					goods: {
						id: 0,
						name: goods.name,
						image: ''
					}
				}
				return
			}

			const detail = await getGoodsInfo(goods.id)
			searchKeyword.value = goods.name

			selectedData.value = {
				type: detail.type || '未知类型',
				brand: {
					id: detail.brand_id || 0,
					name: detail.brand_name || ''
				},
				goods: {
					id: goods.id,
					name: goods.name,
					image: detail?.goods_images?.[0] || ''
				}
			}
		} catch (error) {
			console.error('商品信息获取失败', error)
			uni.showToast({
				title: '详细信息获取失败，已保存基本信息',
				icon: 'none'
			})
			searchKeyword.value = goods.name
			selectedData.value = {
				type: '未知类型',
				brand: {
					id: 0,
					name: ''
				},
				goods: {
					id: goods?.id || 0,
					name: goods.name,
					image: ''
				}
			}
		}
	}
	// 在关闭弹窗时重置搜索关键词
	// const closePicker = () => {
	// 	internalVisible.value = false
	// 	searchKeyword.value = ''
	// 	selectedData.value = {
	// 		type: null,
	// 		brand: null,
	// 		goods: null
	// 	}
	// }
	const closePicker = () => {
		internalVisible.value = false
		searchKeyword.value = ''
		resetAllComponents()
		nextTick(() => {
			selectedData.value = {
				type: null,
				brand: {
					id: 0,
					name: ''
				},
				goods: {
					id: 0,
					name: '',
					image: ''
				}
			}
		})
	}


	// 监听父组件传来的 visible 变化
	watch(() => props.visible, (val) => {
		internalVisible.value = val
	})

	// 监听内部状态变化通知父组件
	watch(internalVisible, (val) => {
		emit('update:visible', val)
	})


	// 新增 modal 可见性变化处理
	const handleModalVisibilityChange = (newVal) => {
		internalVisible.value = newVal
		// 当 modal 自身触发关闭时（如点击遮罩层）
		if (!newVal) {
			closePicker()
		}
	}
	// 类型选择
	const handleTypeSelect = (type) => {
		selectedData.value.type = type
	}
	const getGoodsInfo = (id) => {
		return new Promise((resolve, reject) => {
			uni.request({
				url: websiteUrl.value + '/goods?id=' + id,
				method: 'GET',
				timeout: 5000,
				success: (res) => {
					resolve(res.data.data)
				},
				fail: (err) => {
					console.error('商品详情获取失败', err)
					reject(err)
				}
			})
		})
	}

	// 品牌选择
	// const handleBrandSelect = (brandId, brandName) => {
	// 	selectedData.value.brand = {
	// 		id: brandId,
	// 		name: brandName
	// 	}
	// 	// 添加商品加载逻辑
	// 	try {
	// 		getGoods(brandId)
	// 	} catch (error) {
	// 		console.error('获取商品失败', error)
	// 	}
	// }
	const handleBrandSelect = (id, name) => {
		selectedData.value.brand = {
			id: id || 0,
			name
		}
		if (id) getGoods(id)
	}


	// 商品选择
	// const handleGoodsSelect = async (goodsId, goodsName) => {
	// 	try {
	// 		// 先清空旧数据避免残留
	// 		selectedData.value.goods = null
	// 		const detail = await getGoodsInfo(goodsId)
	// 		if (!detail) {
	// 			throw new Error('未找到商品信息')
	// 		}
	// 		selectedData.value.goods = {
	// 			id: goodsId,
	// 			name: goodsName,
	// 			image: detail?.goods_images?.[0] || ''
	// 		}
	// 	} catch (error) {
	// 		console.error('商品选择失败', error)
	// 		uni.showToast({
	// 			title: '商品信息获取失败，请重新选择',
	// 			icon: 'none'
	// 		})
	// 	}
	// }

	const handleGoodsSelect = async (id, name) => {
		try {
			selectedData.value.goods = { // 先设置默认值
				id: id || 0,
				name,
				image: ''
			}

			// 只有有效ID才请求接口
			if (id && id !== 0) {
				const detail = await getGoodsInfo(id)
				selectedData.value.goods.image = detail?.goods_images?.[0] || ''
			}
		} catch (error) {
			console.error('商品信息获取失败', error)
			uni.showToast({
				title: '图片信息获取失败，已保存基本信息',
				icon: 'none'
			})
		}
	}

	function getGoods(id) {
		// 请求 /goods-name-list 并赋值goodsList
		uni.request({
			url: websiteUrl.value + '/goods-name-list?id=' + id,
			method: 'GET',
			timeout: 5000,
			success: (res) => {
				console.log(res.data.data);
				goodsList.value = res.data.data
				console.log(goodsList.value)
			},

			fail: (err) => {
				console.log(err);
				uni.showToast({
					title: '网络请求失败',
					icon: 'none'
				})
			}
		})

	}
	// 确认操作
	// const handleConfirm = async () => {
	// 	try {
	// 		// 获取商品图片信息
	// 		const goodsDetail = await getGoodsInfo(selectedData.value.goods.id)

	// 		// 构建完整数据对象
	// 		const resultData = {
	// 			...selectedData.value,
	// 			goods_image: goodsDetail?.goods_images?.[0] || '',
	// 			goods_id: selectedData.value.goods.id,
	// 			brand_id: selectedData.value.brand.id,
	// 			brand_name: selectedData.value.brand.name,
	// 			type: selectedData.value.type
	// 		}

	// 		emit('confirm', resultData)
	// 		closePicker()
	// 	} catch (error) {
	// 		console.error('商品信息获取失败', error)
	// 		uni.showToast({
	// 			title: '商品信息获取失败',
	// 			icon: 'none'
	// 		})
	// 	}
	// }

	const handleConfirm = async () => {
		try {
			let result = null;

			if (isFuzzyMode.value) {
				// 模糊模式处理
				if (selectedData.value.goods.id && selectedData.value.goods.id !== 0) {
					// 修改这里：添加默认类型处理
					try {
						const detail = await getGoodsInfo(selectedData.value.goods.id);
						result = {
							isFuzzy: true,
							keyword: searchKeyword.value,
							goods: {
								id: detail.id || selectedData.value.goods.id,
								name: detail.goods_name || selectedData.value.goods.name,
								image: detail?.goods_images?.[0] || ''
							},
							brand: {
								id: detail.brand_id || 0,
								name: detail.brand_name || ''
							},
							// 添加默认类型
							type: detail.type || '未知类型' // 确保这里使用默认值
						};
					} catch (error) {
						console.error('商品信息获取失败，使用缓存数据', error);
						result = {
							isFuzzy: true,
							keyword: searchKeyword.value,
							goods: selectedData.value.goods,
							brand: selectedData.value.brand,
							// 确保这里使用默认值
							type: selectedData.value.type || '未知类型'
						};
					}
				} else {
					// 无商品ID时使用默认值
					result = {
						isFuzzy: true,
						keyword: searchKeyword.value,
						goods: {
							id: 0,
							name: searchKeyword.value,
							image: ''
						},
						brand: {
							id: 0,
							name: ''
						},
						// 明确设置默认类型
						type: '未知类型'
					};
				}
			} else {
				
				console.log("jjjjjjjjjjjjjjjj")
				// 精确模式处理
				if (selectedData.value.goods.id && selectedData.value.goods.id !== 0) {
					// 获取最新商品信息
					try {
						const detail = await getGoodsInfo(selectedData.value.goods.id);
						selectedData.value.goods.image = detail?.goods_images?.[0] || '';
						selectedData.value.type = detail.type || selectedData.value.type;
					} catch (error) {
						console.error('商品信息获取失败，使用缓存数据', error);
					}
				}

				// 数据校验
				if (!selectedData.value.type) throw new Error('请选择商品类型');
				if (!selectedData.value.brand.name) throw new Error('请填写或选择品牌');
				if (!selectedData.value.goods.name) throw new Error('请填写或选择商品');

				result = {
					isFuzzy: false,
					type: selectedData.value.type,
					brand: selectedData.value.brand,
					goods: selectedData.value.goods
				};
			}
			console.log('确认数据:', result);

			emit('confirm', result);
			closePicker();
		} catch (error) {
			uni.showToast({
				title: error.message,
				icon: 'none'
			});
		}
	};


	// 取消操作
	const handleCancel = () => {
		emit('cancel')
		closePicker()
	}
</script>

<style lang="less" scoped>
	.relation-picker-container {
		padding: 24rpx;
		background: #fff;
		border-radius: 16rpx;
		width: 600rpx;
		box-sizing: border-box;

		.picker-header {
			margin-bottom: 24rpx;
			border-bottom: 1rpx solid #eee;
			padding-bottom: 24rpx;

			.title {
				font-size: 24rpx; // 标题字号调整
				font-weight: 700; // 加粗程度提升
				color: #333;
				display: block;
				text-align: center;
			}
		}

		.picker-body {


			/deep/ .type-picker {
				margin-bottom: 40rpx;
				display: block;
				.select-input {
					background: #f8f8f8;
					border-radius: 12rpx;
					padding: 16rpx 24rpx;
					font-size: 22rpx;
					color: #333;
				}
			}

			/* 品牌搜索样式加强 */
			/deep/ .brand-search {

				background: #f8f8f8 !important;
				border-radius: 12rpx !important;
				padding: 16rpx 24rpx !important;
				min-height: 72rpx; // 新增固定高度
				// padding: 0px!important;

				.common_search_input {
					font-size: 22rpx !important;
					color: #333 !important;
					flex: 1;
				}

				.icon_image {
					width: 36rpx !important;
					height: 36rpx !important;
					margin: 0 12rpx !important;
				}

				.search_results {
					background: #fff !important;
					border: 1rpx solid #eee !important;
					box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.08) !important;

					.result_item {
						font-size: 22rpx !important;
						padding: 24rpx !important;
						color: #666 !important;

						&:active {
							background: #f8f8f8 !important;
						}
					}
				}
			}

			/* 按钮尺寸优化 */
			.picker-footer {
				button {
					height: 64rpx !important; // 缩小按钮高度
					line-height: 64rpx !important;
					font-size: 22rpx !important;
					padding: 0 24rpx !important;

				}
			}

			/deep/ .goods-picker {
				.select-input {
					background: #f8f8f8;
					border-radius: 12rpx;
					padding: 16rpx 24rpx;
					font-size: 22rpx;
					color: #333;
				}
			}
		}

		.picker-footer {
			display: flex;
			justify-content: space-between;
			margin-top: 32rpx;
			gap: 20rpx;

			button {
				flex: 1;
				height: 72rpx;
				line-height: 72rpx;
				border-radius: 12rpx;
				font-size: 22rpx; // 字号统一调整
				transition: all 0.3s;
				margin: 0;

				&::after {
					border: none;
				}
			}

			.cancel-btn {
				background: #f5f5f5;
				color: #666;

				&:active {
					background: #e8e8e8;
					opacity: 0.8;
				}
			}

			.confirm-btn {
				background: #78d0dd;
				color: #fff;

				&:active {
					opacity: 0.8;
				}
			}
		}
	}

	/* 品牌搜索样式加强 */
	/deep/ .brand-search {


		background: #f8f8f8 !important;
		border-radius: 12rpx !important;
		padding: 16rpx 24rpx !important;
		min-height: 72rpx; // 新增固定高度
		margin-bottom: 20rpx;
		display: block;

		.common_search_input {
			font-size: 22rpx !important;
			color: #333 !important;
			background: #f8f8f8 !important;
			padding: 0rpx !important;
			flex: 1;
		}

		.icon_image {
			width: 36rpx !important;
			height: 36rpx !important;
			margin: 0 12rpx !important;
		}


		.search_results {
			margin-top: 0rpx !important;
			background: #fff !important;
			border: 1rpx solid #eee !important;
			box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.08) !important;

			.result_item {
				font-size: 22rpx !important;
				padding: 24rpx !important;
				color: #666 !important;

				&:active {
					background: #f8f8f8 !important;
				}
			}
		}
	}

	/* 按钮尺寸优化 */
	.picker-footer {
		button {
			height: 64rpx !important; // 缩小按钮高度
			line-height: 64rpx !important;
			font-size: 22rpx !important;
			padding: 0 24rpx !important;
		}
	}

	.search_tab {
		background: #f8f8f8 !important;
	}

	.mode-switch {
		position: relative;
		height: 72rpx;
		margin-bottom: 24rpx;

		.switch-btn {
			position: absolute;
			width: 100%;
			height: 100%;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 12rpx;
			border-radius: 36rpx;
			transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
			box-shadow: 0 4rpx 16rpx rgba(120, 208, 221, 0.2);

			text {
				color: #fff;
				font-size: 26rpx;
				font-weight: 500;
			}

			&.precision-mode {
				background: linear-gradient(135deg, #78d0dd, #94a5f3);
			}

			&.fuzzy-mode {
				background: linear-gradient(135deg, #ff9a9e, #fad0c4);
			}

			// 入场动画
			&-enter-active,
			&-leave-active {
				transition: all 0.3s ease;
			}

			&-enter-from,
			&-leave-to {
				opacity: 0;
				transform: scale(0.9);
			}
		}
	}
</style>