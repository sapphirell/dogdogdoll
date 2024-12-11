<template>
	<view class="container" :style="{ paddingTop: statusBarHeight + 'px' }" >
		<scroll-view class="scroll-view_H" scroll-x="true" ref="scrollView"  :scroll-left="scrollLeft">
			<view v-for="(item,date) in news" :key="item.id" class="scroll-view-item_H" @click="selectDate(date, item)">
				<view style="display: inline-block;margin: 0px;position: relative;">
					<text style="display: block;margin:10px 0px 25px; 0px;color: #7dc3d3;" v-if="item.weekday==='日'||item.weekday==='六' ">{{item.weekday}}</text>
					<text style="display: block;margin:10px 0px 25px; 0px;;" v-if="item.weekday!=='日' && item.weekday!=='六' ">{{item.weekday}}</text>
					<text v-if="chooseDate !==date" style="display: block;border-radius: 100%;padding: 10px;box-sizing: border-box;width: 47px;height: 47px;">{{item.day_number}}</text>
					<text v-if="chooseDate ===date" style="display: block;background: #7dc3d3;color: #fff;border-radius: 100%;padding: 10px;box-sizing: border-box;width: 45px;height: 45px;">{{item.day_number}}</text>
					<view style="position: absolute;bottom: -10px;  left: 50%;transform: translateX(-50%); ">
						<view v-if="item.goods != null" style="color: rgb(255 151 151);font-size: xx-large;display: inline-block;">.</view>
					</view>
				
				</view>
			</view>
		</scroll-view>
		<view style="padding: 5px 20px;">
			<text class="font-alimamashuhei" style="color: #7dc3d3;margin: 15px 0px 15px 0px;display: block;">{{chooseDate}} 日 星期{{chooseItem.weekday}}上新</text>
			<view v-if="chooseItem.goods == null">
				<text>这天没有上新呢...</text>
			</view>
		</view>
		<!-- 遍历chooseItem.goods -->
		
		<view v-for="good in chooseItem.goods" :key="good.id" style="margin: 10px 0px 10px 0px;box-sizing: border-box;padding: 10px 20px;">
			<view style="width: 30vw;float: left;position: relative;">
				<navigator @click="jumpGoods(good.goods_id)">
					<image :src="good.goods_image" mode="aspectFill" style="width: 30vw; height: auto;height: auto;
					aspect-ratio: 1; "></image>
					<text style="left: 0px;position: absolute;top: 5px;width: 100px;background: #7dc4d3;color: #fff;text-align: center;opacity: 0.8;font-size: 13px;">{{good.sale_type}}</text>
				</navigator>
			
			</view>

			<view class="brand_goods_item" style="width: calc(70vw - 70px);float: left;margin-left: 15px;">
				<navigator @click="jumpGoods(good.goods_id)">
					<text class="font-alimamashuhei">{{good.brand_name}} {{good.goods_name}}</text>
					<view>
						<text class="line-height">{{good.size}}·{{good.size_detail}}·{{good.type}}</text>
					</view>
					<view>
						<text class="line-height">开定时间 {{ formatTimestamp(good.sub_time) }}</text>
					</view>
					
					<text class="line-height" style="color: rgb(255 150 178);" v-if="good.sale_type != '限量现货' && good.sale_type != '不限量现货'  " >
						定金 <text style="font-size: 25px;color: rgb(255 150 178);font-weight: 900;">{{good.sub_amount}}</text>
						 ({{good.currency}}) 尾款 <text style="color: rgb(255 150 178);font-weight: 900;">{{good.fin_amount}}</text>
					</text>
					<text class="line-height" style="color: rgb(255 150 178);" v-if="good.sale_type == '限量现货' || good.sale_type == '不限量现货'  " >
						全款 <text style="font-size: 25px;color: rgb(255 150 178);font-weight: 900;">{{good.sub_amount + good.fin_amount}}</text> ({{good.currency}})
					</text>
				</navigator>
				
			</view>
			<view style="clear: both;"></view>
		</view>
	</view>
	


</template>

<script setup>
	import { ref, onMounted } from 'vue'
	// 获取当前年月日
	let news = ref({})
	const today = new Date();
	const year = today.getFullYear();
	const month = String(today.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需要加1
	const day = String(today.getDate()).padStart(2, '0');

	const todayFormat = `${year}-${month}-${day}`;
	// 计算scroll-view宽度
	const scrollView = ref(null);
	const systemInfo = uni.getSystemInfoSync();
	const screenWidth = systemInfo.screenWidth;
	const itemWidth = screenWidth/7
	let scrollLeft = ref(0)

	//状态栏高度
	const statusBarHeight = ref(systemInfo.statusBarHeight);
	console.log("状态栏高度" + statusBarHeight.value)
	// 当前选择日期
	let chooseDate = ref(todayFormat)
	let chooseItem = ref({})
	uni.showLoading({
		title: '加载中'
	})


	function getDateMap() {
		uni.request({
			url: 'http://localhost:8080/goods-news',
			method: 'GET',
			timeout: 5000,
			success: (res) => {
				console.log(res.data.data);
				news.value = res.data.data
				//遍历，找到与今天相等的日期
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
				uni.hideLoading()
			}
		})
	}

	//点击日期
	function selectDate(date, item) {
		console.log(item)
		chooseDate.value = date
		chooseItem.value = item
	}

	//格式化时间戳
	function formatTimestamp(timestamp) {
		  const date = new Date(timestamp * 1000);
		  const year = date.getFullYear();
		  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月份从0开始，需要+1
		  const day = date.getDate().toString().padStart(2, '0');
		  const hours = date.getHours().toString().padStart(2, '0');
		  const minutes = date.getMinutes().toString().padStart(2, '0');
		  const seconds = date.getSeconds().toString().padStart(2, '0');
		  
		  // 返回格式化后的日期时间
		  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
	}
	// 跳转商品页
	function jumpGoods(id) {
		uni.navigateTo({
			url: '/pages/goods/goods?goods_id=' + id
		})
	}
	//加载日历数据
	getDateMap()
</script>

<style lang="less" scoped>
.container {
    // background: linear-gradient(180deg, rgb(218 238 255) 0%, rgb(255 255 255) 100%);
}

.scroll-view_H {
	white-space: nowrap;
	width: 100%;
	display: flex;
	padding-top: 10px;
}

.scroll-view-item_H {
	display: inline-block;
	// width: 100%;
	// height: 300rpx;
	// line-height: 300rpx;
	text-align: center;
	font-size: 36rpx;
	width: calc(100vw/7);
	padding-bottom: 15px;
}
.line-height {
    margin: 9px 0px 9px 0px;
    display: block;
}
</style>
