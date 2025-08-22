<template>
	<view class="container">
		<!-- 分类导航栏 -->
		<scroll-view scroll-x="true" class="category-scroll" :scroll-with-animation="true">
			<view class="category-list">
				<!-- 单独处理"全部"项 -->
				<view class="category-item" :class="{ active: currentType === 'all' }" @click="changeType('all')">
					<text>全部</text>
					<text class="count">({{ typeCount.all || 0 }})</text>
				</view>

				<!-- 循环其他分类项 -->
				<view v-for="(count, e_type) in typeCount" v-if="e_type !== 'all'" :key="e_type" class="category-item"
					:class="{ active: currentType === e_type }" @click="changeType(e_type)">
					<text>{{ e_type }}</text>
					<text class="count">({{ count }})</text>
				</view>
			</view>
		</scroll-view>

		<!-- 商品列表 -->
		<view v-if="loading" class="loading">加载中...</view>
		<view v-else-if="goodsList.length === 0" class="empty">暂无商品</view>

		<scroll-view v-else scroll-y="true" class="scroll-view" @scrolltolower="loadMore">
			<view class="goods-list">
				<view v-for="(item, index) in goodsList" :key="item.id" class="goods-item"
					:class="{'last-item': index === goodsList.length - 1}">
					<!-- 商品图片和信息区域 -->
					<view class="goods-main">
						<!-- 商品图片 - 宽高比3:4 -->
						<view class="image-container">
							<image class="goods-image" :src="item.goods_images[0] || '/static/default-goods.png'"
								mode="aspectFill" />
						</view>

						<!-- 商品信息 -->
						<view class="goods-info">
							<view class="title-row">
								<text class="goods-name">{{ item.name }}</text>
								<view class="tag" v-if="item.is_hot">热销</view>
							</view>

							<view class="goods-details">
								<view class="detail-item">
									<text class="detail-label">尺寸:</text>
									<text class="detail-value">{{ item.size || '无' }}</text>
								</view>
								<view class="detail-item">
									<text class="detail-label">肤色:</text>
									<text class="detail-value">{{ item.skin || '无' }}</text>
								</view>
							</view>

							<!-- 价格显示 -->
							<view class="price-container">
								<text class="goods-price">¥{{ item.total_amount }}</text>
								<text class="goods-currency">{{ item.currency }}</text>
							</view>
						</view>
					</view>

					<!-- 操作按钮 - 单独一行四个按钮 -->
					<view class="action-buttons-single-row">
						<button class="btn preview" @click="previewGoods(item.id)">
							<uni-icons type="eye" size="14" color="#3a3a3a"></uni-icons>
							预览
						</button>
						<button class="btn edit" @click="editGoods(item.id)">
							<uni-icons type="compose" size="14" color="#3a3a3a"></uni-icons>
							编辑
						</button>
						<button class="btn collocation" @click="openCollocation(item.id)">
							<uni-icons type="star" size="14" color="#3a3a3a"></uni-icons>
							搭配参考
						</button>
						<button class="btn sales" @click="openSalesPlan(item.id)">
							<uni-icons type="shop" size="14" color="#3a3a3a"></uni-icons>
							贩售计划
						</button>
					</view>
				</view>
			</view>

			<!-- 加载更多提示 -->
			<view class="load-more">
				<uni-load-more :status="loadStatus" :contentText="{
            contentdown: '上拉加载更多',
            contentrefresh: '正在加载...',
            contentnomore: '没有更多了'
          }" />
			</view>
		</scroll-view>
		<!-- 贩售计划弹窗 -->
		<uni-popup ref="salesPopup" type="bottom" background-color="#fff">
			<view class="sales-popup">
				<!-- 整个弹窗内容包裹在scroll-view中 -->
				<scroll-view scroll-y="true" class="popup-scroll-view">
					<!-- 固定标题 -->
					<view class="popup-header">
						<text class="title">贩售计划管理</text>
						<uni-icons type="close" size="20" color="#999" @click="closeSalesPopup"></uni-icons>
					</view>

					<!-- 贩售记录列表 -->
					<view class="sales-list" v-if="salesList.length > 0">
						<view class="sales-item" v-for="sale in salesList" :key="sale.id">
							<view class="sale-info">
								<text class="sale-type">{{ saleTypeMap[sale.sale_type] || sale.sale_type }}</text>
								<text class="sale-time">
								  {{ formatDateString(sale.sub_time) }} {{ formatHourMinute(sale.sub_time) }} - 
								  {{ formatDateString(sale.sub_time_end) }} {{ formatHourMinute(sale.sub_time_end) }}
								</text>
								<text class="sale-amount">定金: ¥{{ sale.sub_amount }} 尾款: ¥{{ sale.fin_amount }}</text>
							</view>
							<view class="sale-actions">
								<uni-icons type="compose" size="18" color="#666" @click="editSale(sale)"></uni-icons>
								<uni-icons type="trash" size="18" color="#f56c6c"
									@click="deleteSale(sale.id)"></uni-icons>
							</view>
						</view>
					</view>
					<view v-else class="no-sales">
						<text>暂无贩售计划</text>
					</view>

					<!-- 添加按钮 -->
					<button class="add-btn" @click="addSale">
						<uni-icons type="plus" size="16" color="#fff"></uni-icons>
						添加贩售计划
					</button>

					<!-- 编辑/添加表单 -->
					<view class="sale-form" v-if="showSaleForm">
						<!-- 贩售模式选择 -->
						<view class="form-item">
							<text class="label">贩售模式</text>
							<picker mode="selector" :range="saleTypeOptions" :value="saleTypeIndex"
								@change="changeSaleType">
								<view class="picker">
									{{ saleTypeMap[currentSale.sale_type] || '请选择贩售模式' }}
								</view>
							</picker>
						</view>

						<!-- 定金金额 -->
						<view class="form-item">
							<text class="label">定金金额</text>
							<input type="number" v-model="currentSale.sub_amount" placeholder="请输入定金金额" />
						</view>

						<!-- 尾款金额 -->
						<view class="form-item">
							<text class="label">尾款金额</text>
							<input type="number" v-model="currentSale.fin_amount" placeholder="请输入尾款金额" />
						</view>

	
						<!-- 定金时间 -->
						<view class="form-item">
						  <text class="label">定金时间</text>
						  <picker mode="date" :value="subDate" @change="onSubDateChange">
						    <view class="picker">{{ subDate || '选择日期' }}</view>
						  </picker>
						  <picker mode="time" :value="subTime" @change="onSubTimeChange">
						    <view class="picker">{{ subTime || '选择时间' }}</view>
						  </picker>
						</view>
						
						<!-- 预定/购买截止时间 -->
						<view class="form-item">
						  <text class="label">预定/购买截止时间</text>
						  <picker mode="date" :value="endDate" @change="onEndDateChange">
						    <view class="picker">{{ endDate || '选择日期' }}</view>
						  </picker>
						  <picker mode="time" :value="endTime" @change="onEndTimeChange">
						    <view class="picker">{{ endTime || '选择时间' }}</view>
						  </picker>
						</view>
						
						<!-- 币种选择 -->
						<view class="form-item">
							<text class="label">币种</text>
							<picker mode="selector" :range="currencyOptions" :value="currencyIndex"
								@change="changeCurrency">
								<view class="picker">
									{{ currentSale.currency || '请选择币种' }}
								</view>
							</picker>
						</view>

						<!-- 表单按钮 -->
						<view class="form-buttons">
							<button class="btn cancel" @click="cancelForm">取消</button>
							<button class="btn save" @click="saveSale">保存</button>
						</view>
					</view>
				</scroll-view>
			</view>
		</uni-popup>



		<view class="floating-button" @tap="jump2postGoods">
			<uni-icons type="plusempty" size="30" color="#fff"></uni-icons>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted,
		computed
	} from 'vue';
	import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
	import {
		websiteUrl,
		asyncGetUserInfo
	} from "@/common/config.js";

	// 商品列表数据
	const goodsList = ref([]);
	const loading = ref(true);
	const loadStatus = ref('more'); // more / loading / noMore
	const error = ref(null);
	const pageInfo = ref(null);
	const currentPage = ref(1);

	// 新增：分类相关状态
	const typeCount = ref({}); // 存储分类数量 { '全部': 10, '整体': 5, ... }
	const currentType = ref('all'); // 当前选中的分类
	const allCount = ref(0)

	// 贩售计划相关数据
	const salesPopup = ref(null); // popup组件引用
	const salesList = ref([]); // 贩售记录列表
	const currentGoodsId = ref(0); // 当前操作的商品ID
	const showSaleForm = ref(false); // 是否显示表单

	// 表单选择器状态
	const showSaleTypePicker = ref(false);
	const saleTypeIndex = ref(0);
	const showCurrencyPicker = ref(false);
	const currencyIndex = ref(0);

	// 贩售模式
	const saleTypeMap = ref({
		'限量预定': '限量预定',
		'限时预定': '限时预定',
		'限时限量预定': '限时限量预定',
		'限量现货': '限量现货',
		'现货': '现货'
	});

	// 贩售模式选项
	const saleTypeOptions = ref([
		'限量预定',
		'限时预定',
		'限时限量预定',
		'限量现货',
		'现货'
	]);



	// 修改changeSaleType方法
	const changeSaleType = (e) => {
		const index = e.detail.value;
		saleTypeIndex.value = index;
		// 直接存储中文值
		currentSale.value.sale_type = saleTypeOptions.value[index];
	};

	// 币种选项
	const currencies = ref([{
			value: 'CNY',
			text: '人民币 (CNY)'
		},
		{
			value: 'USD',
			text: '美元 (USD)'
		},
		{
			value: 'JPY',
			text: '日元 (JPY)'
		},
		{
			value: 'KRW',
			text: '韩元 (KRW)'
		}
	]);
	// 新增响应式变量
	const subDate = ref('');
	const subTime = ref('');
	const finDate = ref('');
	const finTime = ref('');
	const endDate = ref('');
	const endTime = ref('');

	// 在数据部分添加日期和时间字段
	const currentSale = ref({
		goods_id: 0,
		sale_type: '',
		sub_amount: '',
		fin_amount: '',
		sub_date: '', // 新增：日期部分
		sub_time: '', // 新增：时间部分
		fin_date: '', // 新增：日期部分
		fin_time: '', // 新增：时间部分
		currency: 'CNY'
	});


	// 获取分类数量统计
	const fetchTypeCount = async () => {
		try {
			const token = uni.getStorageSync('token');
			const res = await uni.request({
				url: `${websiteUrl.value}/brand-manager/get-goods-count`,
				method: 'GET',
				header: {
					Authorization: token
				},
				data: {
					brand_id: 1 // 这里需要替换为实际的品牌ID
				}
			});

			if (res.data.status === 'success') {
				// 计算全部商品的总数
				let total = 0;
				const counts = res.data.data;
				for (const key in counts) {
					total += counts[key];
				}

				// 只存储原始分类数据，不包含all属性
				typeCount.value = counts;
				// 单独存储全部的总数
				allCount.value = total;
			} else {
				uni.showToast({
					title: res.data.msg || '获取分类数量失败',
					icon: 'none'
				});
			}
		} catch (err) {
			console.error('获取分类数量失败:', err);
			uni.showToast({
				title: '获取分类数量失败',
				icon: 'none'
			});
		}
	};

	// 跳转到发布商品
	const jump2postGoods = () => {
		uni.navigateTo({
			url: `/pages/creator_base/goods_editor/goods_editor`
		});
	}
	// 添加币种选项文本数组
	const currencyOptions = computed(() => {
	  return currencies.value.map(item => item.text);
	});
	// 切换分类
	const changeType = (type) => {
		currentType.value = type;
		// 重置分页，重新加载商品列表
		currentPage.value = 1;
		goodsList.value = [];
		fetchGoodsList(1);
	};
	// 预览商品
	const previewGoods = (goodsId) => {
		uni.navigateTo({
			url: `/pages/goods/goods?goods_id=${goodsId}`
		});
	};

	// 编辑商品
	const editGoods = (goodsId) => {
		uni.navigateTo({
			url: `/pages/creator_base/goods_editor/goods_editor?goods_id=${goodsId}`
		});
	};

	// 打开官方搭配
	const openCollocation = (goodsId) => {
		uni.navigateTo({
			url: `/pages/creator_base/collocation_list/collocation_list?goods_id=${goodsId}`
		});
	};

	// 打开贩售计划
	const openSalesPlan = async (goodsId) => {
		currentGoodsId.value = goodsId;
		await fetchSalesList(goodsId);
		salesPopup.value.open();
	};

	// 关闭贩售计划弹窗
	const closeSalesPopup = () => {
		salesPopup.value.close();
		resetSalesForm();
	};

	// 重置贩售表单
	const resetSalesForm = () => {
		currentSale.value = {};
		showSaleForm.value = false;
		showSaleTypePicker.value = false;
		showCurrencyPicker.value = false;

		subDate.value = '';
		subTime.value = '';
		finDate.value = '';
		finTime.value = '';
		endDate.value = '';
		endTime.value = '';
	};

	// 取消表单编辑
	const cancelForm = () => {
		resetSalesForm();
	};

	// 添加贩售计划
	const addSale = () => {
		currentSale.value = {
			goods_id: currentGoodsId.value,
			sale_type: '',
			sub_amount: '',
			fin_amount: '',
			sub_time: '',
			fin_time: '',
			currency: 'CNY'
		};
		showSaleForm.value = true;
	};
	// 日期时间格式化辅助函数
	const formatDate = (date) => {
		return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
	};



	// 编辑贩售计划
	const editSale = (sale) => {
	  currentSale.value = { ...sale };
	
	  // 转换时间戳为日期和时间字符串
	  if (sale.sub_time && sale.sub_time > 0) {
	    subDate.value = formatDateString(sale.sub_time);
	    subTime.value = formatHourMinute(sale.sub_time);
	  } else {
	    subDate.value = '';
	    subTime.value = '';
	  }
	
	  if (sale.sub_time_end && sale.sub_time_end > 0) {
	    endDate.value = formatDateString(sale.sub_time_end);
	    endTime.value = formatHourMinute(sale.sub_time_end);
	  } else {
	    endDate.value = '';
	    endTime.value = '';
	  }
	
	  showSaleForm.value = true;
	};

	// 删除贩售计划
	const deleteSale = async (saleId) => {
		uni.showModal({
			title: '删除确认',
			content: '确定要删除这条贩售计划吗？',
			success: async (res) => {
				if (res.confirm) {
					try {
						const token = uni.getStorageSync('token');
						const res = await uni.request({
							url: `${websiteUrl.value}/brand-manager/sale`,
							method: 'DELETE',
							header: {
								Authorization: token
							},
							data: {
								id: saleId
							}
						});

						if (res.data.status === 'success') {
							uni.showToast({
								title: '删除成功',
								icon: 'success'
							});
							// 刷新列表
							await fetchSalesList(currentGoodsId.value);
						} else {
							uni.showToast({
								title: res.data.msg || '删除失败',
								icon: 'none'
							});
						}
					} catch (err) {
						console.error('删除贩售计划失败:', err);
						uni.showToast({
							title: '删除失败',
							icon: 'none'
						});
					}
				}
			}
		});
	};



	// 币种选择器变化
	const changeCurrency = (e) => {
		const index = e.detail.value;
		currencyIndex.value = index;
		currentSale.value.currency = currencies.value[index].value;
	};

	// 日期和时间变化处理
	const onSubDateChange = (e) => {
	  subDate.value = e.detail.value; // 直接更新响应式变量
	};
	
	const onSubTimeChange = (e) => {
	  subTime.value = e.detail.value; // 直接更新响应式变量
	};
	
	const onEndDateChange = (e) => {
	  endDate.value = e.detail.value; // 直接更新响应式变量
	};
	
	const onEndTimeChange = (e) => {
	  endTime.value = e.detail.value; // 直接更新响应式变量
	};


	// 保存贩售计划
	const saveSale = async () => {
		try {
			// 表单验证
			if (!currentSale.value.sale_type) {
				uni.showToast({
					title: '请选择贩售模式',
					icon: 'none'
				});
				return;
			}
			if (!currentSale.value.sub_amount) {
				uni.showToast({
					title: '请输入定金金额',
					icon: 'none'
				});
				return;
			}
			if (!currentSale.value.fin_amount) {
				uni.showToast({
					title: '请输入尾款金额',
					icon: 'none'
				});
				return;
			}
			if (!currentSale.value.currency) {
				uni.showToast({
					title: '请选择币种',
					icon: 'none'
				});
				return;
			}

			// 验证开始时间
			if (!subDate.value || !subTime.value) {
				uni.showToast({
					title: '请选择完整的开始时间',
					icon: 'none'
				});
				return;
			}

			// 验证预定/购买截止时间
			if (!endDate.value || !endTime.value) {
				uni.showToast({
					title: '请选择完整的预定/购买截止时间',
					icon: 'none'
				});
				return;
			}


			// 组合开始时间并转换为时间戳（秒）
			const startDateTime = `${subDate.value} ${subTime.value}`;
			currentSale.value.sub_time = Math.floor(new Date(startDateTime).getTime() / 1000);

			// 组合结束时间并转换为时间戳（秒）
			const endDateTime = `${endDate.value} ${endTime.value}`;
			currentSale.value.sub_time_end = Math.floor(new Date(endDateTime).getTime() / 1000);



			const token = uni.getStorageSync('token');
			const method = 'POST';
			const url = currentSale.value.id ?
				`${websiteUrl.value}/brand-manager/update-sales` :
				`${websiteUrl.value}/brand-manager/create-sales`;

			// 准备提交数据
			const saleData = {
				...currentSale.value,
				sub_amount: parseInt(currentSale.value.sub_amount),
				fin_amount: parseInt(currentSale.value.fin_amount),
				// 不再需要单独传递 fin_time 和 fin_time_end
			};

			// 发送请求
			const res = await uni.request({
				url: url,
				method: method,
				header: {
					Authorization: token,
					'Content-Type': 'application/json'
				},
				data: saleData
			});

			if (res.data.status === 'success') {
				uni.showToast({
					title: '保存成功',
					icon: 'success'
				});
				// 刷新列表
				await fetchSalesList(currentGoodsId.value);
				resetSalesForm();
			} else {
				uni.showToast({
					title: res.data.msg || '保存失败',
					icon: 'none'
				});
			}
		} catch (err) {
			console.error('保存贩售计划失败:', err);
			uni.showToast({
				title: '保存失败',
				icon: 'none'
			});
		}
	};

	// 获取贩售计划列表
	const fetchSalesList = async (goodsId) => {
		try {
			const token = uni.getStorageSync('token');
			const res = await uni.request({
				url: `${websiteUrl.value}/brand-manager/goods-sales`,
				method: 'GET',
				header: {
					Authorization: token
				},
				data: {
					goods_id: goodsId
				}
			});

			if (res.data.status === 'success') {
				salesList.value = res.data.data || [];
			} else {
				uni.showToast({
					title: res.data.msg || '获取贩售计划失败',
					icon: 'none'
				});
				salesList.value = [];
			}
		} catch (err) {
			console.error('获取贩售计划失败:', err);
			salesList.value = [];
			uni.showToast({
				title: '获取贩售计划失败',
				icon: 'none'
			});
		}
	};

	// 格式化时间
	const formatTimeOnly = (date) => {
		return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
	};
	const formatHourMinute = (timestamp) => {
	  if (!timestamp) return '';
	  const date = new Date(timestamp * 1000); // 秒转毫秒
	  return formatTimeOnly(date);
	};
	
	const formatDateString = (timestamp) => {
	  if (!timestamp) return '';
	  const date = new Date(timestamp * 1000);
	  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
	};
	
	// 获取商品列表（修改：添加分类参数）
	const fetchGoodsList = async (page = 1) => {
		try {
			// 更新加载状态
			if (page > 1) {
				loadStatus.value = 'loading';
			} else {
				loading.value = true;
			}

			const token = uni.getStorageSync('token');
			if (!token) {
				error.value = '未登录，请先登录';
				loading.value = false;
				loadStatus.value = 'more';
				return;
			}

			const res = await uni.request({
				url: `${websiteUrl.value}/brand-manager/get-goods-list`,
				method: 'GET',
				header: {
					Authorization: token
				},
				data: {
					page: page,
					page_size: 10,
					type: currentType.value === 'all' ? '' : currentType.value // 如果选中的是全部，则传空字符串
				}
			});

			// 处理响应数据
			const responseData = res.data;
			if (responseData.status === 'success') {
				const newGoods = responseData.data.goods_list || [];

				// 更新当前页码
				currentPage.value = page;

				// 如果是第一页，直接赋值
				if (page === 1) {
					goodsList.value = newGoods;
				} else {
					// 加载更多时追加数据
					goodsList.value = [...goodsList.value, ...newGoods];
				}

				pageInfo.value = {
					page_index: responseData.data.page_index,
					page_size: responseData.data.page_size,
					total: responseData.data.total
				};

				// 检查是否还有更多数据
				const totalPages = Math.ceil(pageInfo.value.total / pageInfo.value.page_size);
				loadStatus.value = pageInfo.value.page_index < totalPages ? 'more' : 'noMore';
			} else {
				error.value = responseData.msg || '获取商品列表失败';
				uni.showToast({
					title: error.value,
					icon: 'none'
				});
				loadStatus.value = 'more';
			}
		} catch (err) {
			error.value = '网络请求失败';
			console.error('获取商品列表失败:', err);
			uni.showToast({
				title: '网络请求失败',
				icon: 'none'
			});
			loadStatus.value = 'more';
		} finally {
			loading.value = false;
		}
	};

	// 加载更多
	const loadMore = () => {
		if (loadStatus.value === 'more') {
			fetchGoodsList(currentPage.value + 1);
		}
	};

	// 页面加载时获取数据
	onShow(async () => {
		uni.setNavigationBarTitle({
			title: "作品管理"
		});

		// 检查登录状态
		const userInfo = await asyncGetUserInfo();
		if (!userInfo) {
			uni.showToast({
				title: '请先登录',
				icon: 'none'
			});
			setTimeout(() => {
				uni.reLaunch({
					url: '/pages/login/login'
				});
			}, 1500);
			return;
		}

		// 先获取分类数量
		await fetchTypeCount();
		// 再获取商品列表
		fetchGoodsList(1);
	});
</script>

<style lang="less" scoped>
	.container {
		padding: 20rpx;
		background: linear-gradient(to bottom, #f8f9fc, #ffffff);
		min-height: 100vh;
	}

	/* 分类导航栏样式 */
	.category-scroll {
		width: 100%;
		white-space: nowrap;
		background: #fff;
		border-bottom: 1px solid #f1f1f1;
		padding: 10rpx 0;
		/* 减少上下内边距 */
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
		height: 70rpx;
		/* 固定高度 */
	}

	.category-list {
		display: inline-flex;
		padding: 0 20rpx;
		height: 100%;
		/* 确保高度一致 */
	}

	.category-item {
		display: inline-flex;
		align-items: center;
		padding: 0 25rpx;
		/* 减少上下内边距 */
		margin-right: 20rpx;
		background: #f5f5f7;
		border-radius: 40rpx;
		font-size: 26rpx;
		/* 稍微减小字体 */
		color: #666;
		height: 50rpx;
		/* 固定高度 */
		flex-shrink: 0;
		/* 防止压缩 */

		/* 激活状态 */
		&.active {
			// background: linear-gradient(135deg, #a6e9f7, #1ed1e1);
			// color: #fff;

			background-color: #81D8cf;
			color: #fff6e1;

			text {
				color: #fff6e1;
			}

			.count {
				color: #fff6e1;
			}
		}

		.count {
			font-size: 22rpx;
			/* 减小计数字体 */
			color: #999;
			margin-left: 8rpx;
		}
	}


	.loading,
	.empty {
		text-align: center;
		padding: 40rpx;
		color: #999;
		font-size: 28rpx;
	}

	.scroll-view {
		width: 100%;
		height: calc(100vh - 100rpx);
		/* 减去分类导航栏高度 */
	}

	.goods-list {

		.goods-item {
			display: flex;
			flex-direction: column;
			margin-bottom: 30rpx;
			background: #fff;
			border-radius: 24rpx;
			overflow: hidden;
			box-shadow: 0 6rpx 30rpx rgba(0, 0, 100, 0.05);
			transition: all 0.3s ease;
			position: relative;

			&:active {
				// transform: translateY(4rpx);
				box-shadow: 0 4rpx 15rpx rgba(0, 0, 100, 0.03);
			}

			&.last-item {
				margin-bottom: 60rpx;
			}

			/* 商品图片和信息区域 */
			.goods-main {
				display: flex;
				padding: 20rpx;
			}

			.image-container {
				width: 180rpx;
				height: 230rpx;
				position: relative;
				overflow: hidden;
				border-radius: 16rpx;
				background: #f9f9f9;
				overflow: hidden;
				margin-right: 20rpx;
			}

			.goods-image {
				width: 100%;
				height: 100%;
				display: block;
			}

			.goods-info {
				flex: 1;
				display: flex;
				flex-direction: column;

				.title-row {
					display: flex;
					align-items: center;
					margin-bottom: 12rpx;
				}

				.goods-name {
					font-size: 26rpx;
					font-weight: bold;
					color: #333;
					line-height: 1.4;
					flex: 1;
					overflow: hidden;
					text-overflow: ellipsis;
					display: -webkit-box;
					-webkit-line-clamp: 2;
					-webkit-box-orient: vertical;
				}

				.tag {
					background: linear-gradient(to right, #FFD1DC, #FFB6C1);
					color: white;
					font-size: 22rpx;
					padding: 4rpx 12rpx;
					border-radius: 6rpx;
					margin-left: 15rpx;
				}

				.goods-details {
					display: flex;
					flex-direction: column;
					margin-bottom: 18rpx;
					background: #f9fafd;
					border-radius: 12rpx;
					padding: 15rpx;

					.detail-item {
						display: flex;
						margin-bottom: 8rpx;
						font-size: 26rpx;

						&:last-child {
							margin-bottom: 0;
						}
					}

					.detail-label {
						color: #888;
						width: 100rpx;
						flex-shrink: 0;
					}

					.detail-value {
						color: #555;
						font-weight: 500;
					}
				}

				.price-container {
					display: flex;
					align-items: baseline;
					margin-top: auto;

					.goods-price {
						font-size: 36rpx;
						color: #FF9EB5;
						font-weight: bold;
						margin-right: 12rpx;
						font-family: 'Helvetica Neue', sans-serif;
					}

					.goods-currency {
						font-size: 26rpx;
						color: #999;
						transform: translateY(2rpx);
					}
				}
			}

			/* 单行四个按钮样式 - 放在商品卡片底部 */
			.action-buttons-single-row {
				display: flex;
				justify-content: space-between;
				padding: 0 20rpx 20rpx;
				margin-top: 10rpx;
				gap: 15rpx;

				.btn {
					flex: 1;
					height: 70rpx;
					line-height: 70rpx;
					font-size: 22rpx;
					border-radius: 10rpx;
					margin: 0 4rpx;
					padding: 0;
					display: flex;
					align-items: center;
					justify-content: center;
					transition: all 0.2s ease;
					box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.08);


					&:active {
						opacity: 0.85;
						transform: scale(0.95);
						box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
					}

					&:after {
						border: none;
					}

					/* 低饱和糖果色按钮 */
					&.preview {
						// background: linear-gradient(135deg, #A8E6CF, #8ED2C8);
						color: #3a3a3a;
					}

					&.edit {
						// background: linear-gradient(135deg, #FFD3B6, #FFAAA5);
						color: #3a3a3a;
					}

					&.collocation {
						// background: linear-gradient(135deg, #B5C6E0, #9FB8E4);
						color: #3a3a3a;
					}

					&.sales {
						// background: linear-gradient(135deg, #FFB7D5, #FF9EC1);
						color: #3a3a3a;
					}

					.uni-icons {
						margin-right: 6rpx;
					}
				}
			}
		}
	}

	.load-more {
		padding: 30rpx 0;
		text-align: center;
		color: #999;
		font-size: 26rpx;
	}

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

	/* 贩售计划弹窗样式 */
	.sales-popup {
		background-color: #fff;
		border-radius: 30rpx 30rpx 0 0;
		padding: 30rpx;
		max-height: 80vh;
		display: flex;
		flex-direction: column;

		.popup-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding-bottom: 20rpx;
			border-bottom: 1rpx solid #eee;
			margin-bottom: 20rpx;

			.title {
				font-size: 32rpx;
				font-weight: bold;
				color: #333;
			}
		}

		.sales-list {
			flex: 1;
			max-height: 50vh;
			margin-bottom: 20rpx;

			.sales-item {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 20rpx;
				border-bottom: 1rpx solid #f5f5f5;

				.sale-info {
					flex: 1;
					display: flex;
					flex-direction: column;

					.sale-type {
						font-size: 28rpx;
						font-weight: bold;
						color: #333;
						margin-bottom: 10rpx;
					}

					.sale-time {
						font-size: 24rpx;
						color: #666;
						margin-bottom: 8rpx;
					}

					.sale-amount {
						font-size: 24rpx;
						color: #e74c3c;
					}
				}

				.sale-actions {
					display: flex;
					gap: 30rpx;

					.uni-icons {
						padding: 10rpx;
					}
				}
			}
		}

		.no-sales {
			text-align: center;
			padding: 40rpx 0;
			color: #999;
			font-size: 28rpx;
		}

		.add-btn {
			background: linear-gradient(135deg, #a6e9f7, #1ed1e1);
			color: #fff;
			height: 80rpx;
			line-height: 80rpx;
			border-radius: 40rpx;
			font-size: 28rpx;
			margin-top: 20rpx;
			display: flex;
			justify-content: center;
			align-items: center;

			.uni-icons {
				margin-right: 10rpx;
			}
		}

		/* 贩售计划弹窗样式 - 表单部分修改 */
		.sale-form {
			padding: 20rpx;
			background: #f9f9f9;
			border-radius: 16rpx;
			margin-top: 20rpx;

			.form-item {
				margin-bottom: 30rpx;
				display: flex;
				flex-direction: column;

				.label {
					font-size: 28rpx;
					font-weight: 500;
					color: #555;
					margin-bottom: 15rpx;
				}

				input,
				.picker {
					height: 80rpx;
					background: #fff;
					border: 1rpx solid #e0e0e0;
					border-radius: 12rpx;
					padding: 0 20rpx;
					font-size: 28rpx;
					color: #333;
					display: flex;
					align-items: center;

					&:focus {
						border-color: #1ed1e1;
					}
				}

				.picker {
					margin-top: 10rpx;
					position: relative;
					justify-content: space-between;

					&:after {
						content: ">";
						transform: rotate(90deg);
						color: #999;
						font-size: 24rpx;
					}
				}
			}

			.form-buttons {
				display: flex;
				justify-content: space-between;
				margin-top: 40rpx;
				gap: 20rpx;

				.btn {
					flex: 1;
					height: 90rpx;
					line-height: 90rpx;
					border-radius: 12rpx;
					font-size: 30rpx;
					font-weight: 500;
					transition: all 0.3s;

					&.cancel {
						background-color: #f5f5f7;
						color: #666;
						border: 1rpx solid #e0e0e0;

						&:active {
							background-color: #eaeaea;
						}
					}

					&.save {
						background: linear-gradient(135deg, #a6e9f7, #1ed1e1);
						color: #fff;
						border: none;

						&:active {
							opacity: 0.9;
						}
					}
				}
			}
		}

		/* 选择器弹窗样式 */
		.picker-view {
			height: 400rpx;
			background-color: #fff;

			.picker-item {
				height: 80rpx;
				line-height: 80rpx;
				text-align: center;
				font-size: 30rpx;
				color: #333;
			}
		}


	}

	.popup-scroll-view {
		height: 1200rpx;
	}
</style>