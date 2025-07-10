<template>
	<common-page head_color="rgb(185 195 253)">
		<view-logs></view-logs>
		<!-- 顶部搜索和分类区域 -->
		<view class="header-container">
			<view class="search-container"  :style="miniProgram ? 'width:500rpx; margin:0rpx 20rpx 10rpx 20rpx;' : ''">
				<common-search width="560rpx" ></common-search>
			</view>
			
			<view class="category-container">
				<scroll-view scroll-x="true" class="category-scroll" :show-scrollbar="false">
					<view class="category-item" 
						v-for="(item, index) in tabList" 
						:key="index" 
						:class="{ active: activeType === item }"
						@click="handleTabClick(item)">
						{{ item }}
					</view>
				</scroll-view>
			</view>
		</view>
		
		<!-- 日期选择区域 -->
		<view class="date-picker-container">
			<scroll-view class="date-scroll" scroll-x="true" ref="scrollView" 
				:scroll-left="scrollLeft" :show-scrollbar="false">
				<view v-for="(item, date) in news" :key="item.id" 
					class="date-item" @click="selectDate(date, item)">
					
					<view class="date-badge" v-if="item.goods_number > 0">
						{{ item.goods_number }}
					</view>
					
					<view class="weekday" :class="{'weekend': item.weekday==='周日'||item.weekday==='周六'}">
						{{ item.weekday }}
					</view>
					
					<!-- <view class="day-number" :class="{'selected': chooseDate === date}"> -->
						<!-- {{ item.day_number }} -->
					<!-- </view> -->
					 <view class="day-number" :class="{'selected': chooseDate === date}">
					          {{ isToday(date) ? '今天' : item.day_number }}
					  </view>
				</view>
			</scroll-view>
		</view>
		
		<!-- 商品展示区域 -->
		<view class="goods-container">
			<view class="date-title">
				<text class="highlight">{{chooseDate}} 日</text>
				<text> 星期{{chooseItem.weekday}}上新</text>
			</view>
			
			<view v-if="chooseItem.goods == null" class="empty-tip">
				<image src="/static/empty-box.png" class="empty-icon"></image>
				<text>这天没有上新呢...</text>
			</view>
			
			<view v-else>
				<view v-for="good in chooseItem.goods" :key="good.id" class="goods-card" @click="jumpGoods(good.id, good.goods_id)">
					<view class="goods-image-container" >
						<image :src="good.goods_image" mode="aspectFill" class="goods-image"></image>
						<view class="goods-tags">
							<text class="tag sale-type">{{good.sale_type}}</text>
							<text class="tag first-day" v-if="good.is_first_sale_day == 1">首日</text>
						</view>
					</view>
					
					<view class="goods-info">
						<view>
							<text class="brand-name">{{good.brand_name}}</text>
							<text class="goods-name">{{good.goods_name}}</text>
							
						</view>
						
						<view class="goods-details">
							<text>{{good.size}} · {{good.size_detail}} · {{good.type}}</text>
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
		</view>
		<loading-toast :show="loading"></loading-toast>
	</common-page>
</template>

<script setup>
	import {
		ref,
		onMounted
	} from 'vue';
	
	import {
		onLoad,
		onReachBottom,
		onPullDownRefresh,
	} from "@dcloudio/uni-app"
	
	import {
		websiteUrl,
		wechatSignLogin,
		getUserInfo,
		global,
	} from "../../common/config.js";
	
	// 标签列表
	const tabList = ref([
		'全部', '整体', '单头', '单体', '娃衣',
		'眼珠', '娃鞋', '手型', '脚型', '袜子', '配饰'
	])
	
	let activeType = ref('全部')
	let originalNews = ref({}) 
	let news = ref({}) 
	
	const today = new Date();
	const year = today.getFullYear();
	const month = String(today.getMonth() + 1).padStart(2, '0');
	const day = String(today.getDate()).padStart(2, '0');
	const todayFormat = `${year}-${month}-${day}`;
	
	const scrollView = ref(null);
	const systemInfo = uni.getSystemInfoSync();
	const screenWidth = systemInfo.screenWidth;
	const itemWidth = screenWidth / 7
	let scrollLeft = ref(0)
	
	const miniProgram = process.env.VUE_APP_PLATFORM === 'mp-weixin'
	const statusBarHeight = ref(systemInfo.statusBarHeight);
	
	let chooseDate = ref(todayFormat)
	let chooseItem = ref({})
	let loading = ref(true)

	
	const onShareAppMessage = () => ({
		title: '快来看娃圈上新！',
		path: '/pages/news/news',
		imageUrl: '/static/share',
		success(res) {
			console.log('分享成功', res)
		},
		fail(err) {
			console.log('分享失败', err)
		},
		mp: {
			wxpath: '/pages/news/news.html'
		}
	})
	
	function getDateMap() {
		loading.value = true
		uni.request({
			url: websiteUrl + `/goods-news`,
			method: 'GET',
			timeout: 5000,
			success: (res) => {
				console.log(res.data.data);
				originalNews.value = res.data.data
				news.value = filterNews('全部')
				for (let [key, value] of Object.entries(news.value)) {
					if (key === todayFormat) {
						chooseItem.value = value
					}
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
				console.log("left:" + scrollLeft.value)
				loading.value = false
			}
		})
	}
	  function isToday(date) {
	    return date === todayFormat;
	  }
	function filterNews(type) {
		const filtered = {}
		Object.entries(originalNews.value).forEach(([date, info]) => {
			const copy = {
				...info
			}
			if (copy.goods) {
				copy.goods = type === '全部' ?
					copy.goods :
					copy.goods.filter(g => g.type === type)
				if (copy.goods.length === 0) copy.goods = null
			}
			filtered[date] = copy
		})
		return filtered
	}
	
	const handleTabClick = (type) => {
		activeType.value = type
		const filtered = filterNews(type)
		news.value = {
			...filtered
		}
		const firstValidEntry = Object.entries(filtered).find(([_, v]) => v.goods)
		if (firstValidEntry) {
			chooseDate.value = firstValidEntry[0]
			chooseItem.value = firstValidEntry[1]
		} else {
			chooseItem.value = {
				goods: null
			}
		}
	}
	
	function jumpGoods(id, goodsId) {
		// 记录一次点击
		uni.request({
			url: websiteUrl + '/sale-record-click?id=' + id,
			method: 'POST',
			header: {
				'Content-Type': 'application/json',
			},

			success: () => {
				console.log('点击记录成功');
			},
			fail: (err) => {
				console.error('点击记录失败:', err);
			}
		});
		
		uni.navigateTo({
			url: '/pages/goods/goods?goods_id=' + goodsId
		})
	}
	
	
	function selectDate(date, item) {
		console.log(item)
		chooseDate.value = date
		chooseItem.value = item
	}
	
	function formatTimestamp(timestamp) {
		const date = new Date(timestamp * 1000);
		const year = date.getFullYear();
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const day = date.getDate().toString().padStart(2, '0');
		const hours = date.getHours().toString().padStart(2, '0');
		const minutes = date.getMinutes().toString().padStart(2, '0');
		return `${month}-${day} ${hours}:${minutes}`;
	}
	

	
	getDateMap()
	
	onPullDownRefresh(async () => {
		try {
			getDateMap();
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
	/* 顶部区域 */
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
		padding: 20rpx 20rpx 10rpx;
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
	
	/* 日期选择区域 */
	.date-picker-container {
		padding: 20rpx 0;
		background: white;
		margin: -20rpx 20rpx 0;
		border-radius: 30rpx;
		box-shadow: 0 5rpx 15rpx rgba(0, 0, 0, 0.05);
		position: relative;
		z-index: 10;
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
	
	/* 商品展示区域 */
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
		margin:20rpx 10rpx;
		
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
	
	.goods-details {
		text {
			font-size: 24rpx;
			color: #888;
			margin-bottom: 20rpx;
		}
	
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

	/* 价格信息样式 */
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
	::-webkit-scrollbar {
		width: 0!important;
		height: 0!important;
		background-color: transparent!important;
		display: none!important;
	}
</style>
