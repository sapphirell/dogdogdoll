<!-- components/relation-picker/relation-picker.vue -->
<template>
	<common-modal :visible="internalVisible" @update:visible="handleModalVisibilityChange">
		<view class="relation-picker-container">
			<view class="picker-header">
				<text class="title">关联娃物</text>
			</view>

			<view class="picker-body">
				<!-- 类型选择 -->
				<common-name-picker :dataList="typeList" placeholder="选择类型" @select="handleTypeSelect"
					class="type-picker" />

				<!-- 品牌搜索 -->
				<common-search mode="fill" @select="handleBrandSelect" width="520rpx" background="#f8f8f8" class="brand-search" />

				<!-- 商品选择 -->
				<custom-picker :dataList="goodsList" @select="handleGoodsSelect" class="goods-picker" />
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
		watch
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
		}
	})

	const emit = defineEmits([
		'update:visible',
		'confirm',
		'cancel'
	])

	const goodsList = ref([])

	// 使用内部状态管理可见性
	const internalVisible = ref(false)

	// 监听父组件传来的 visible 变化
	watch(() => props.visible, (val) => {
		internalVisible.value = val
	})

	// 监听内部状态变化通知父组件
	watch(internalVisible, (val) => {
		emit('update:visible', val)
	})

	// 选择数据存储
	const selectedData = ref({
		type: null,
		brand: null,
		goods: null
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
				url: websiteUrl + '/goods?id=' + id,
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
	const handleBrandSelect = (brandId, brandName) => {
		selectedData.value.brand = {
			id: brandId,
			name: brandName
		}
		// 添加商品加载逻辑
		try {
			getGoods(brandId)
		} catch (error) {
			console.error('获取商品失败', error)
		}
	}

	// 商品选择
	const handleGoodsSelect = async (goodsId, goodsName) => {
		try {
			const detail = await getGoodsInfo(goodsId)
			selectedData.value.goods = {
				id: goodsId,
				name: goodsName,
				image: detail.goods_images?.[0] || ''
			}
		} catch (error) {
			console.error('商品选择失败', error)
		}
	}

	function getGoods(id) {
		// 请求 /goods-name-list 并赋值goodsList
		uni.request({
			url: websiteUrl + '/goods-name-list?id=' + id,
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
	const handleConfirm = async () => {
		try {
			// 获取商品图片信息
			const goodsDetail = await getGoodsInfo(selectedData.value.goods.id)

			// 构建完整数据对象
			const resultData = {
				...selectedData.value,
				goods_image: goodsDetail.goods_images?.[0] || '',
				goods_id: selectedData.value.goods.id,
				brand_id: selectedData.value.brand.id,
				brand_name: selectedData.value.brand.name,
				type: selectedData.value.type
			}

			emit('confirm', resultData)
			closePicker()
		} catch (error) {
			uni.showToast({
				title: '商品信息获取失败',
				icon: 'none'
			})
		}
	}


	// 取消操作
	const handleCancel = () => {
		emit('cancel')
		closePicker()
	}

	// 关闭弹窗
	const closePicker = () => {
		internalVisible.value = false
		// 重置选择数据
		selectedData.value = {
			type: null,
			brand: null,
			goods: null
		}
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
				// padding: 12rpx 24rpx !important;
				min-height: 72rpx; // 新增固定高度

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
		// padding: 12rpx 24rpx !important;
		min-height: 72rpx; // 新增固定高度
		margin-bottom: 20rpx;
		display: block;

		.common_search_input {
			font-size: 22rpx !important;
			color: #333 !important;
			background: #f8f8f8 !important;
			// padding: 0 16rpx !important;
			flex: 1;
		}

		.icon_image {
			width: 36rpx !important;
			height: 36rpx !important;
			margin: 0 12rpx !important;
		}


		.search_results {
			margin-top: 0rpx!important;
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
</style>