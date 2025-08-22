<template>
	<common-page head_color="rgb(185 195 253)">
		<view-logs></view-logs>
		<!-- 顶部Tab切换区域 -->
		<view class="tab-container">
			<view class="tab-item" :class="{ active: activeTab === 'sale' }" @click="switchTab('sale')">
				<text>贩售</text>
				<view class="tab-indicator" v-if="activeTab === 'sale'"></view>
			</view>
			<view class="tab-item" :class="{ active: activeTab === 'makeup' }" @click="switchTab('makeup')">
				<text>约妆</text>
				<view class="tab-indicator" v-if="activeTab === 'makeup'"></view>
			</view>
		</view>

		<!-- 分类筛选（仅贩售Tab显示） -->
		<view class="category-container" v-if="activeTab === 'sale'">
			<scroll-view scroll-x="true" class="category-scroll" :show-scrollbar="false">
				<view class="category-item" v-for="(item, index) in tabList" :key="index"
					:class="{ active: activeType === item }" @click="handleTabClick(item)">
					{{ item }}
				</view>
			</scroll-view>
		</view>

		<!-- 尺寸筛选（仅贩售Tab显示） -->
		<view class="size-container" v-if="activeTab === 'sale'">
			<scroll-view scroll-x="true" class="size-scroll" :show-scrollbar="false">
				<view class="size-item" v-for="(item, index) in sizeList" :key="index"
					:class="{ active: activeSize === item }" @click="handleSizeClick(item)">
					{{ item }}
				</view>
			</scroll-view>
		</view>
		
		<view  v-if="activeTab === 'makeup'" style="height: 50rpx;    background: rgb(211 245 255);"></view>

		<!-- 日期选择区域（复用部分） -->
		<view class="date-picker-container">
			<scroll-view class="date-scroll" scroll-x="true" :scroll-left="scrollLeft" :show-scrollbar="false">
				<view v-for="(item, date) in currentCalendar" :key="date" class="date-item"
					@click="selectDate(date, item)">

					<!-- 根据当前Tab显示不同的徽章 -->
					<view class="date-badge" v-if="activeTab === 'sale' && item.goods_number > 0">
						{{ item.goods_number }}
					</view>
					<view class="date-badge" v-else-if="activeTab === 'makeup' && item.plans_number > 0">
						{{ item.plans_number }}
					</view>

					<view class="weekday" :class="{'weekend': item.weekday==='周日'||item.weekday==='周六'}">
						{{ item.weekday }}
					</view>

					<view class="day-number" :class="{'selected': chooseDate === date}">
						{{ isToday(date) ? '今天' : item.day_number }}
					</view>
				</view>
			</scroll-view>
		</view>

		<!-- 内容展示区域 -->
		<view class="goods-container">
			<!-- 贩售日历内容 -->
			<template v-if="activeTab === 'sale'">
				<view class="date-title">
					<text class="highlight">{{chooseDate}} 日</text>
					<text> 星期{{chooseItem.weekday}}上新</text>
				</view>

				<view v-if="chooseItem.goods == null" class="empty-tip">
					<image src="/static/empty-box.png" class="empty-icon"></image>
					<text>这天没有上新呢...</text>
				</view>

				<view v-else>
					<view v-for="good in chooseItem.goods" :key="good.id" class="goods-card"
						@click="jumpGoods(good.id, good.goods_id)">
						<view class="goods-image-container">
							<image :src="good.goods_image" mode="aspectFill" class="goods-image"></image>
							<view class="goods-tags">
								<text class="tag sale-type">{{good.type}} · {{good.sale_type}}</text>
								<text class="tag first-day" v-if="good.is_first_sale_day == 1">首日</text>
							</view>
						</view>

						<view class="goods-info">
							<view>
								<text class="brand-name">{{good.brand_name}}</text>
								<text class="goods-name">{{good.goods_name}}</text>
							</view>

							<!-- 修改尺寸显示部分 -->
							<view class="goods-details">
								<!-- 如果有sizes数组，显示分组后的尺寸 -->
								<view v-if="good.sizes && good.sizes.length > 0">
									<view v-for="(group, index) in getSizeGroups(good.sizes)" :key="index" class="size-group">
										<text class="size-category">{{ group.category }}：</text>
										<text class="size-details">{{ group.details.join('、') }}</text>
									</view>
								</view>
								<!-- 如果没有sizes数组，显示旧的单个尺寸信息 -->
								<text v-else>
									{{good.size}} · {{good.size_detail}}
								</text>
								
							</view>

							<!-- 时间信息区域 -->
							<view class="time-info">
								<text>开定 {{ formatTimestamp(good.sub_time) }}</text>
								<text v-if="good.sub_time_end">截止 {{ formatTimestamp(good.sub_time_end)}}</text>
							</view>

							<!-- 价格信息区域 -->
							<view class="price-info">
								<view v-if="good.sale_type != '限量现货' && good.sale_type != '不限量现货'">
									<view class="price-group">
										<text class="price-label">定金</text>
										<text class="deposit-price">{{good.sub_amount}}</text>
										<text class="currency">({{good.currency}})</text>
									</view>
									<view class="price-group">
										<text class="price-label">尾款</text>
										<text class="final-price">{{good.fin_amount}}</text>
									</view>
								</view>

								<view v-else>
									<view class="price-group">
										<text class="price-label">全款</text>
										<text class="full-price">{{good.sub_amount + good.fin_amount}}</text>
										<text class="currency">({{good.currency}})</text>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>
			</template>

			<!-- 约妆日历内容 -->
			<template v-else>
				<view class="date-title">
					<text class="highlight">{{chooseDate}} 日</text>
					<text> 星期{{chooseItem.weekday}}约妆</text>
				</view>
				<view v-if="chooseItem.plans == null || chooseItem.plans.length === 0" class="empty-tip">
					<image src="/static/empty-box.png" class="empty-icon"></image>
					<text>这天没有开妆计划呢...</text>
				</view>
				<view v-else>
					<view v-for="plan in chooseItem.plans" :key="plan.id" class="plan-card" @tap="navigateToArtistDetail(plan.artist_info)">

						<!-- 艺术家信息区域 -->
						<view class="artist-header">
							<view class="artist-info">
								<image v-if="plan.artist_info && plan.artist_info.LogoImage" 
										:src="plan.artist_info.LogoImage" 
										mode="aspectFill" 
										class="artist-avatar"></image>
								<view class="artist-details">
									<text class="artist-name">{{plan.artist_name}}</text>
									<!-- 妆费区间显示在这里 -->
									<view class="makeup-price-range">
										<text>妆费: {{ getPriceRange(plan) }}</text>
									</view>
								</view>
							</view>
						</view>
						
						<!-- 艺术家描述 -->
						<view class="artist-description" v-if="plan.artist_info && plan.artist_info.Description">
							{{plan.artist_info.Description}}
						</view>
						
						<!-- 例图展示区域 -->
						<view class="highlight-images" v-if="plan.artist_info && plan.artist_info.artist_highlight_images">
							<scroll-view scroll-x="true" class="image-scroll">
								<image 
									v-for="(img, index) in getHighlightImages(plan.artist_info.artist_highlight_images)" 
									:key="index" 
									:src="img" 
									mode="aspectFill" 
									class="highlight-image"
									@click="previewImage(img)">
								</image>
							</scroll-view>
						</view>
						
						<!-- 折叠区域 -->
						<view class="foldable-section" :class="{ expanded: expandStates[plan.id] }">
							<!-- 计划信息 -->
							<view class="plan-info">
								<view class="info-row">
									<text class="label">开放时间:</text>
									<text class="value">{{formatTimestamp(plan.open_time)}} - {{formatTimestamp(plan.close_time)}}</text>
								</view>
								<view class="info-row">
									<text class="label">接单类型:</text>
									<text class="value">{{getOrderTypeText(plan.order_type)}}</text>
								</view>
								<view class="info-row">
									<text class="label">最大人数:</text>
									<text class="value">{{plan.max_participants === 0 ? '不限量' : plan.max_participants}}</text>
								</view>
								<view class="info-row">
									<text class="label">每人限投:</text>
									<text class="value">{{plan.max_submissions_per_user}}次</text>
								</view>
							</view>
							
							<!-- 档位选择 -->
							<view class="plan-config">
								<view class="config-section">
									<text class="section-title">档位选择</text>
									<view v-for="tier in getTiers(plan)" :key="tier.title" class="tier-item">
										<text class="tier-title">{{tier.title}}</text>
										<text class="tier-price">{{tier.price}}元</text>
										<text class="tier-desc">{{tier.description}}</text>
									</view>
								</view>
								
								<!-- 加购服务 -->
								<view class="config-section" v-if="getAddons(plan).length > 0">
									<text class="section-title">加购服务</text>
									<view v-for="addon in getAddons(plan)" :key="addon.title" class="addon-item">
										<text class="addon-title">{{addon.title}}</text>
										<text class="addon-price">{{addon.price}}元</text>
										<text class="addon-desc">{{addon.description}}</text>
									</view>
								</view>
							</view>
						</view>
						
						<!-- 折叠按钮 -->
						<view class="fold-toggle" @click.stop="toggleFold(plan.id)">
							<text>{{ expandStates[plan.id] ? '收起' : '展开' }}</text>
							<uni-icons :type="expandStates[plan.id] ? 'arrowup' : 'arrowdown'" size="16" color="#81D8cf"></uni-icons>
						</view>
					</view>
				</view>
			</template>
		</view>
		<loading-toast :show="loading"></loading-toast>
	</common-page>
</template>

<script setup>
	import {
		ref,
		computed,
		watch,
	} from 'vue';

	import {
		onLoad,
		onPullDownRefresh,

	} from "@dcloudio/uni-app"

	import {
		websiteUrl,
	} from "../../common/config.js";

	// Tab相关
	const activeTab = ref('sale') // 'sale' 或 'makeup'

	// 贩售日历相关
	const tabList = ref([
		'全部', '整体', '单头', '单体', '娃衣',
		'眼珠', '娃鞋', '手型', '脚型', '袜子', '配饰'
	])
	const sizeList = ref([
		"全部尺寸",
		"四分",
		"六分",
		"三分",
		"其它大尺寸",
		"八分",
		"十二分",
		"一分",
		"二分",
		"五分",
		"棉花娃",
		"眼珠",
	])
	
	// 获取艺术家状态文本
	const getArtistStatusText = (status) => {
	  const statusMap = {
	    1: "长期接单",
	    2: "限时手速投递",
	    3: "限时抽选投递",
	    4: "限时黑箱卡投递",
	    9: "关闭投递"
	  };
	  return statusMap[status] || "未知状态";
	};
	// 获取接单类型文本
	const getOrderTypeText = (type) => {
	  const typeMap = {
	    1: "限时手速",
	    2: "抽选投递",
	    3: "黑箱卡投递"
	  };
	  return typeMap[type] || "未知类型";
	};
	
	let activeType = ref('全部')
	let activeSize = ref('全部尺寸')
	const saleCalendar = ref({})

	// 约妆日历相关
	const makeupCalendar = ref({})
	const brandNames = ref({})
	
	 // 新增的折叠状态管理
	  const expandStates = ref({});
	  
	  // 切换折叠状态
	  const toggleFold = (planId) => {
	    expandStates.value[planId] = !expandStates.value[planId];
	  };
	  
	  // 处理例图字符串
	  const getHighlightImages = (imagesString) => {
	    if (!imagesString) return [];
	    return imagesString.split(',').filter(img => img.trim() !== '');
	  };
	  
	  // 图片预览
	  const previewImage = (url) => {
	    uni.previewImage({
	      urls: [url],
	      current: url
	    });
	  };

	// 共用数据
	const today = new Date();
	const year = today.getFullYear();
	const month = String(today.getMonth() + 1).padStart(2, '0');
	const day = String(today.getDate()).padStart(2, '0');
	const todayFormat = ref(`${year}-${month}-${day}`);

	const scrollView = ref(null);
	const systemInfo = uni.getSystemInfoSync();
	const screenWidth = systemInfo.screenWidth;
	const itemWidth = screenWidth / 7
	let scrollLeft = ref(0)

	const miniProgram = process.env.VUE_APP_PLATFORM === 'mp-weixin'

	let chooseDate = ref(todayFormat.value)
	let chooseItem = ref({})
	let loading = ref(true)

	// 当前显示的日历数据（考虑筛选条件）
	const currentCalendar = computed(() => {
		if (activeTab.value === 'sale') {
			return filteredSaleCalendar.value
		}
		return makeupCalendar.value
	})
	
	  // 新增：获取妆费价格区间
	  const getPriceRange = (plan) => {
	    const tiers = getTiers(plan);
	    if (!tiers || tiers.length === 0) {
	      return '待定';
	    }
	    
	    const prices = tiers.map(tier => parseFloat(tier.price)).filter(price => !isNaN(price));
	    if (prices.length === 0) {
	      return '待定';
	    }
	    
	    const min = Math.min(...prices);
	    const max = Math.max(...prices);
	    
	    if (min === max) {
	      return `${min}元`;
	    }
	    return `${min}-${max}元`;
	  };

	// Tab切换
	const switchTab = (tab) => {
		if (activeTab.value === tab) return
		activeTab.value = tab

		// 重置为今天
		chooseDate.value = todayFormat.value

		// 如果切换到约妆且数据未加载，则加载数据
		if (tab === 'makeup' && Object.keys(makeupCalendar.value).length === 0) {
			fetchMakeupCalendar()
		} else {
			// 更新选中项
			updateSelectedItem()
		}
	}

	// 使用计算属性实现组合筛选
	const filteredSaleCalendar = computed(() => {
		const filtered = {}
		Object.entries(saleCalendar.value).forEach(([date, info]) => {
			const copy = {
				...info
			}

			if (copy.goods) {
				copy.goods = copy.goods.filter(g => {
					// 组合筛选条件
					const typeMatch = activeType.value === '全部' || g.type === activeType.value;
					
					// 修改尺寸筛选逻辑，支持多尺寸
					let sizeMatch = activeSize.value === '全部尺寸';
					if (!sizeMatch && g.sizes && g.sizes.length > 0) {
						// 检查商品的所有尺寸中是否有匹配的
						sizeMatch = g.sizes.some(size => size.goods_size === activeSize.value);
					} else if (!sizeMatch) {
						// 兼容旧数据，使用单个尺寸字段
						sizeMatch = g.size === activeSize.value;
					}
					
					return typeMatch && sizeMatch;
				});
				// 更新商品数量
				copy.goods_number = copy.goods.length;

				// 如果没有商品，设置为null
				if (copy.goods.length === 0) {
					copy.goods = null;
				}
			}
			filtered[date] = copy
		})
		return filtered
	})

	// 贩售日历数据获取
	const fetchSaleCalendar = () => {
		loading.value = true
		uni.request({
			url: websiteUrl.value + `/goods-news`,
			method: 'GET',
			timeout: 5000,
			success: (res) => {
				saleCalendar.value = res.data.data
				chooseItem.value = saleCalendar.value[todayFormat.value] || {
					goods: null
				}
			},
			fail: (err) => {
				console.log(err);
				uni.showToast({
					title: '网络请求失败',
					icon: 'none'
				})
			},
			complete: () => {
				scrollLeft.value = itemWidth * 7 - 5
				loading.value = false
			}
		})
	}

	// 约妆日历数据获取
	const fetchMakeupCalendar = () => {
		loading.value = true
		uni.request({
			url: websiteUrl.value + `/bjd-makeup-news`,
			method: 'GET',
			timeout: 5000,
			success: (res) => {
				makeupCalendar.value = res.data.data
				chooseItem.value = makeupCalendar.value[todayFormat.value] || {
					plans: null
				}
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
			}
		})
	}

	// 品牌名称获取
	const fetchBrandNames = () => {
		// 这里应该有获取品牌名称的API调用
		// 暂时使用模拟数据
		brandNames.value = {
			938: "小圆点儿工作室"
		}
	}

	function isToday(date) {
		return date === todayFormat.value;
	}

	// 尺寸分组方法
	const getSizeGroups = (sizes) => {
		if (!sizes || sizes.length === 0) return [];
		
		// 按大尺寸分组
		const groups = {};
		sizes.forEach(item => {
			const category = item.goods_size;
			if (!groups[category]) {
				groups[category] = [];
			}
			if (item.size_detail) {
				groups[category].push(item.size_detail);
			}
		});
		
		// 转换为数组格式
		return Object.keys(groups).map(category => ({
			category,
			details: groups[category]
		}));
	}

	// 尺寸筛选处理 - 只需更新筛选状态
	const handleSizeClick = (size) => {
		activeSize.value = size
		// 不需要额外操作，计算属性会自动更新
	}


	// 类型筛选处理 - 只需更新筛选状态
	const handleTabClick = (type) => {
		activeType.value = type
		// 不需要额外操作，计算属性会自动更新
	}

	// 更新选中的商品项
	function updateSelectedItem() {
		const calendar = currentCalendar.value

		// 优先检查当前选中的日期是否还有内容
		if (calendar[chooseDate.value]) {
			chooseItem.value = calendar[chooseDate.value]
			return
		}

		// 否则查找第一个有内容的日期
		const firstValidEntry = Object.entries(calendar).find(([_, v]) =>
			(activeTab.value === 'sale' && v.goods) ||
			(activeTab.value === 'makeup' && v.plans)
		)

		if (firstValidEntry) {
			chooseDate.value = firstValidEntry[0]
			chooseItem.value = firstValidEntry[1]
		} else {
			chooseItem.value = activeTab.value === 'sale' ? {
				goods: null
			} : {
				plans: null
			}
		}
	}

	function jumpGoods(id, goodsId) {
		// 记录一次点击
		uni.request({
			url: websiteUrl.value + '/sale-record-click?id=' + id,
			method: 'POST',
			header: {
				'Content-Type': 'application/json',
			},
			success: () => console.log('点击记录成功'),
			fail: (err) => console.error('点击记录失败:', err)
		});

		uni.navigateTo({
			url: '/pages/goods/goods?goods_id=' + goodsId
		})
	}
	// 导航到妆师详情页
	const navigateToArtistDetail = (artist) => {
		uni.navigateTo({
			url: "/pages/artist_info/artist_info?brand_id=" + artist.brand_id
		})
	};


	function selectDate(date, item) {
		chooseDate.value = date
		chooseItem.value = item
	}

	function formatTimestamp(timestamp) {
		const date = new Date(timestamp * 1000);
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const day = date.getDate().toString().padStart(2, '0');
		const hours = date.getHours().toString().padStart(2, '0');
		const minutes = date.getMinutes().toString().padStart(2, '0');
		return `${month}/${day} ${hours}:${minutes}`;
	}

	// 约妆相关方法
	const getTiers = (plan) => {
		try {
			const config = JSON.parse(plan.order_config)
			return config.tiers || []
		} catch {
			return []
		}
	}

	const getAddons = (plan) => {
		try {
			const config = JSON.parse(plan.order_config)
			return config.addons || []
		} catch {
			return []
		}
	}

	const getBrandName = (brandId) => {
		return brandNames.value[brandId] || "未知品牌"
	}

	const viewPlanDetail = (planId) => {
		uni.navigateTo({
			url: `/pages/makeup/detail?id=${planId}`
		})
	}

	const bookPlan = (planId) => {
		uni.navigateTo({
			url: `/pages/makeup/book?id=${planId}`
		})
	}

	// 在计算属性变化时更新选中项
	watch([filteredSaleCalendar, makeupCalendar], () => {
		updateSelectedItem()
	})

	onLoad(() => {
		fetchSaleCalendar()
		fetchBrandNames()
	})

	onPullDownRefresh(async () => {
		try {
			if (activeTab.value === 'sale') {
				fetchSaleCalendar()
			} else {
				fetchMakeupCalendar()
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
</script>

<style lang="less" scoped>
/* ======================== 顶部Tab样式 ======================== */
.tab-container {
  display: flex;
  padding: 20rpx 30rpx 0;
  background: linear-gradient(180deg, rgb(185 195 253) 0%, rgb(211 245 255) 100%);
  
  .tab-item {
    flex: 1;
    text-align: center;
    padding: 20rpx 0;
    font-size: 32rpx;
    color: #666;
    position: relative;
    
    &.active {
      color: #7dc3d3;
      font-weight: bold;
    }
    
    .tab-indicator {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 80rpx;
      height: 6rpx;
      background: #7dc3d3;
      border-radius: 3rpx;
    }
  }
}

/* ======================== 顶部区域 ======================== */
.header-container {
  background: linear-gradient(180deg, rgb(185 195 253) 0%, rgb(211 245 255) 100%);
  padding-bottom: 20rpx;
  border-radius: 0 0 30rpx 30rpx;
  box-shadow: 0 10rpx 20rpx rgba(185, 195, 253, 0.2);
}

.search-container {
  padding: 20rpx 30rpx;
}

.category-container {
  padding: 20rpx 20rpx 0rpx;
  background: rgb(211 245 255);
}

.category-scroll {
  white-space: nowrap;
  height: 100rpx;
}

.category-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  margin: 0 15rpx;
  padding: 10rpx 25rpx;
  border-radius: 50rpx;
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.05);
  color: #666;
  font-weight: 500;
  position: relative;
  top: 10rpx;

  &.active {
    background: #7dc3d3;
    color: white;
    font-weight: bold;
    box-shadow: 0 4rpx 10rpx rgba(125, 195, 211, 0.4);
    transform: translateY(-4rpx);
  }
}

/* ======================== 日期选择区域 ======================== */
.date-picker-container {
  padding: 20rpx 20rpx;
  background: white;
  margin: -20rpx 20rpx 0;
  border-radius: 30rpx;
  box-shadow: 0 5rpx 15rpx rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 10;
  // border: 1px solid #d8c6ce;
}

.date-scroll {
  white-space: nowrap;
  width: 100%;
  display: flex;
  padding: 10rpx 0;
}

.date-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: calc(100vw / 7);
  padding: 50rpx 0 10rpx 0;
  position: relative;
}

.date-badge {
  position: absolute;
  top: 0rpx;
  right: 35rpx;
  background: #ff9ab2;
  color: white;
  border-radius: 50%;
  width: 36rpx;
  height: 36rpx;
  line-height: 36rpx;
  font-size: 22rpx;
  text-align: center;
  font-weight: bold;
  z-index: 2;
}

.weekday {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 10rpx;

  &.weekend {
    color: #ff6b6b;
    font-weight: bold;
  }
}

.day-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 70rpx;
  height: 70rpx;
  border-radius: 50%;
  font-size: 24rpx;
  color: #333;
  background: #f5f9ff;
  transition: all 0.3s ease;
  font-weight: 500;

  &.selected {
    background: linear-gradient(135deg, #7dc3d3, #89d1e1);
    color: white;
    font-weight: bold;
    transform: scale(1.1);
    box-shadow: 0 5rpx 15rpx rgba(125, 195, 211, 0.3);
  }
}

/* ======================== 尺寸筛选区域样式 ======================== */
.size-container {
  padding: 0 20rpx 10rpx;
    background: rgb(211 245 255);
}

.size-scroll {
  white-space: nowrap;
  height: 80rpx;
}

.size-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  margin: 0 12rpx;
  padding: 8rpx 20rpx;
  border-radius: 50rpx;
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.05);
  color: #666;
  font-weight: 500;

  &.active {
    background: #ff9ab2;
    color: white;
    font-weight: bold;
    box-shadow: 0 4rpx 10rpx rgba(255, 154, 178, 0.4);
  }
}

/* ======================== 内容展示区域 ======================== */
.goods-container {
  padding: 40rpx 30rpx;
  background: #f8faff;
  border-radius: 40rpx 40rpx 0 0;
  min-height: 70vh;
}

.date-title {
  font-size: 32rpx;
  color: #555;
  margin-bottom: 30rpx;
  padding-left: 15rpx;
  border-left: 8rpx solid #7dc3d3;

  .highlight {
    color: #7dc3d3;
    font-weight: bold;
    margin-right: 10rpx;
  }
}

/* ======================== 空状态样式 ======================== */
.empty-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
  color: #999;
  font-size: 32rpx;

  .empty-icon {
    width: 180rpx;
    height: 180rpx;
    margin-bottom: 30rpx;
    opacity: 0.6;
  }
}

/* ======================== 贩售商品卡片样式 ======================== */
.goods-card {
  display: flex;
  background: white;
  border-radius: 24rpx;
  overflow: hidden;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 25rpx rgba(185, 195, 253, 0.15);
  transition: transform 0.3s ease;

  &:active {
    transform: scale(0.98);
  }
}

.goods-image-container {
  position: relative;
  width: 260rpx;
  flex-shrink: 0;
}

.goods-image {
  width: 100%;
  height: 10.625rem;
  display: block;
  overflow: hidden;
  border-radius: 10px;
  margin: 20rpx 10rpx;
}

.goods-tags {
  position: absolute;
  top: 35rpx;
  left: 10rpx;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.tag {
  font-size: 24rpx;
  padding: 6rpx 18rpx;
  border-radius: 0 10rpx 10rpx 0;
  margin-bottom: 10rpx;
  color: white;
  font-weight: 500;
}

.sale-type {
  background: linear-gradient(90deg, rgba(52, 68, 160, 0.8), rgba(52, 68, 160, 0.6));
}

.first-day {
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5));
}

.goods-info {
  flex: 1;
  padding: 25rpx;
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-size: 22rpx;
  color: #fff;
  font-weight: bold;
  margin-bottom: 8rpx;
  display: inline-block;
  background: #7dc3d3;
  padding: 5rpx 10rpx;
  border-radius: 10rpx;
  margin-right: 15rpx;
}

.goods-name {
  font-size: 26rpx;
  color: #38374c;
  font-weight: bold;
  margin-bottom: 8rpx;
  display: inline-block;
}

/* ======================== 尺寸显示样式 ======================== */
.goods-details {
  margin-bottom: 20rpx;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}
.size-group {
  display: flex;
  align-items: flex-start; /* 顶部对齐 */
  margin-right: 10rpx;
  margin-bottom: 5rpx;
  /* 添加以下属性防止换行 */
  white-space: nowrap;
}
.size-category {
  font-weight: bold;
  color: #555;
  margin-right: 5rpx;
  /* 确保分类不换行 */
  flex-shrink: 0; /* 防止收缩 */
}
.size-details {
  color: #777;
  /* 允许详情换行，但限制最大宽度 */
  word-break: break-word;
  max-width: 200rpx; /* 根据实际情况调整 */
}
.goods-type {
  color: #777;
}

.time-info {
  background: #f8f9ff;
  border-radius: 12rpx;
  padding: 15rpx;
  color: #666;
  margin-bottom: 20rpx;

  text {
    flex: 1;
    min-width: 45%;
    display: flex;
    align-items: center;
    display: block;
    font-size: 22rpx;
    margin-bottom: 10rpx;

    &::before {
      content: '';
      display: inline-block;
      width: 10rpx;
      height: 10rpx;
      background: #7dc3d3;
      border-radius: 50%;
      margin-right: 12rpx;
    }
  }
}

/* ======================== 价格信息样式 ======================== */
.price-info {
  margin-top: auto;
  display: flex;
  gap: 25rpx;
}

.price-group {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
}

.price-label {
  font-size: 26rpx;
  color: #ff9ab2;
  margin-right: 8rpx;
  white-space: nowrap;
}

.deposit-price {
  font-size: 36rpx;
  color: #ff6b9c;
  font-weight: bold;
  margin-right: 6rpx;
}

.final-price {
  font-size: 32rpx;
  color: #ff6b9c;
  font-weight: bold;
}

.full-price {
  font-size: 36rpx;
  color: #ff6b9c;
  font-weight: bold;
  margin: 0 5rpx;
}

.currency {
  font-size: 24rpx;
  color: #999;
  transform: translateY(-2rpx);
}

/* ======================== 约妆计划卡片样式 ======================== */
.plan-card {
  background: white;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 25rpx rgba(125, 195, 211, 0.15); /* 蓝色阴影 */
  position: relative;
}
/* 艺术家头部区域 */
.artist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}
 .artist-info {
    display: flex;
    align-items: center;
    
    .artist-avatar {
      width: 100rpx;
      height: 100rpx;
      border-radius: 50%;
      margin-right: 20rpx;
      border: 2rpx solid #e6f7ff;
    }
    
    .artist-details {
      display: flex;
      flex-direction: column;
      
      .artist-name {
        font-size: 28rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 5rpx;
		padding-left: 8rpx;
      }
      
      /* 妆费区间样式 */
      .makeup-price-range {
    
        font-weight: bold;
        background: linear-gradient(135deg, #97e7f7, #d5acd6);
        padding: 4rpx 12rpx;
        border-radius: 20rpx;
        align-self: flex-start;
		text {
			font-size: 24rpx;
			color: #fff;
		}
      }
    }
  }
.artist-status {
  background: linear-gradient(90deg, #7dc3d3, #5da8c0); /* 蓝色渐变 */
  color: white;
  font-size: 24rpx;
  padding: 6rpx 15rpx;
  border-radius: 20rpx;
}
/* 艺术家描述 */
.artist-description {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 20rpx;
  padding: 15rpx;
  background: #f8f9ff; /* 浅蓝色背景 */
  border-radius: 12rpx;
}
/* 基础价格 */
.base-price {
    font-size: 0.8125rem;
    color: #ffffff;
    font-weight: bold;
    margin-bottom: 0.625rem;
    text-align: center;
    padding: 0.3125rem;
    background: #95a5ac;
    border-radius: 0.3125rem;
}
/* ======================== 计划信息区域 ======================== */
.plan-info {
  background: #f0f9ff;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  
  .info-row {
    display: flex;
    margin-bottom: 15rpx;
    font-size: 26rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .label {
      color: #5da8c0;
      font-weight: bold;
      width: 140rpx;
    }
    
    .value {
      color: #333;
      flex: 1;
    }
  }
}
/* 配置部分 */
.config-section {
  margin-bottom: 25rpx;
  
  .section-title {
    display: block;
    font-size: 26rpx;
    font-weight: bold;
    color: #5da8c0; /* 深蓝色 */
    margin-bottom: 15rpx;
    padding-bottom: 8rpx;
    border-bottom: 1rpx solid #e6f7ff; /* 浅蓝色 */
  }
  
  .tier-item, .addon-item {
    display: flex;
    align-items: center;
    padding: 12rpx 0;
    border-bottom: 1rpx dashed #e6f7ff; /* 浅蓝色虚线 */
    
    &:last-child {
      border-bottom: none;
    }
    
    .tier-title, .addon-title {
      font-size: 26rpx;
      color: #333;
      width: 140rpx;
      font-weight: 500;
    }
    
    .tier-price, .addon-price {
      font-size: 26rpx;
      color: #5da8c0; /* 深蓝色 */
      font-weight: bold;
      width: 120rpx;
      text-align: right;
    }
    
    .tier-desc, .addon-desc {
      font-size: 24rpx;
      color: #888;
      flex: 1;
      margin-left: 20rpx;
    }
  }
}
/* 操作按钮 - 优化版 */
.plan-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #e6f7ff; /* 浅蓝色分割线 */
  
  button {
    height: 70rpx;
    line-height: 70rpx;
    font-size: 26rpx;
    border-radius: 35rpx;
    background: none;
    border: none;
    position: relative;
    overflow: hidden;
    transition: all 0.2s ease;
    background: white;
    
    /* 移除默认按钮样式 */
    &::after {
      border: none;
    }
    
    &.btn-view-detail {
      color: #5da8c0; /* 深蓝色文字 */
      box-shadow: 0 2rpx 8rpx rgba(93, 168, 192, 0.2);
      
      /* 点击效果 */
      &:active {
        background: #f0f9ff;
        box-shadow: 0 1rpx 4rpx rgba(93, 168, 192, 0.1);
      }
    }
    
    &.btn-book {
      color: #5da8c0; /* 深蓝色文字 */
      box-shadow: 0 2rpx 8rpx rgba(93, 168, 192, 0.2);
      
      /* 点击效果 */
      &:active {
        background: #f0f9ff;
        box-shadow: 0 1rpx 4rpx rgba(93, 168, 192, 0.1);
      }
    }
    
    /* 按钮悬浮效果 */
    &:not([disabled]):hover {
      transform: translateY(-2rpx);
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
    }
  }
}
/* 响应式调整 */
@media (max-width: 480px) {
  .artist-header {
    flex-direction: column;
    align-items: flex-start;
    
    .artist-status {
      margin-top: 10rpx;
      align-self: flex-start;
    }
  }
  
  .plan-actions {
    flex-direction: column;
    
    button {
      width: 100%;
      margin-bottom: 15rpx;
      
      &.btn-view-detail {
        margin-right: 0;
        margin-bottom: 15rpx;
      }
    }
  }
}

/* ======================== 例图展示区域 ======================== */
.highlight-images {
  margin: 20rpx 0;
  padding: 10rpx 0;
  overflow: hidden;
  
  .image-scroll {
    white-space: nowrap;
  }
  
  .highlight-image {
    display: inline-block;
    width: 240rpx;
    height: 300rpx;
    border-radius: 12rpx;
    margin-right: 15rpx;
    background: #f5f9ff;
    box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.05);
    transition: transform 0.3s ease;
    
    &:active {
      transform: scale(0.95);
    }
    
    &:last-child {
      margin-right: 0;
    }
  }
}
/* ======================== 折叠区域 ======================== */
.foldable-section {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.5s ease, opacity 0.3s ease;
  opacity: 0;
  
  &.expanded {
    max-height: 1500rpx; /* 足够大的值容纳内容 */
    opacity: 1;
  }
}
.fold-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx 0;
  color: #81D8cf;
  font-size: 26rpx;
  font-weight: 500;
  margin-top: 10rpx;
  
  text {
    margin-right: 10rpx;
  }
  
  &:active {
    opacity: 0.8;
  }
}

/* ======================== 其他通用样式 ======================== */
::-webkit-scrollbar {
  width: 0 !important;
  height: 0 !important;
  background-color: transparent !important;
  display: none !important;
}

/* 响应式调整 */
@media (max-width: 480px) {
  .artist-header {
    flex-direction: column;
    align-items: flex-start;
    
    .artist-status {
      margin-top: 10rpx;
      align-self: flex-start;
    }
  }
  
  .plan-actions {
    flex-direction: column;
    
    button {
      width: 100%;
      margin-bottom: 15rpx;
      
      &.btn-view-detail {
        margin-right: 0;
      }
    }
  }
}
</style>
