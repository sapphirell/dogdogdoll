<template>
	<common-page head_color="rgb(185 195 253)">
		<view class="goods_renew_header_content">
			<view style="width: 80%;margin: 80rpx auto 20rpx auto;">
				<common-search width="560rpx"></common-search>
			</view>
			<scroll-view scroll-x="true" class="choose_tab" :show-scrollbar="false">
				<text v-for="(item, index) in tabList" :key="index" :class="{ active: activeType === item }"
					@click="handleTabClick(item)">
					{{ item }}
				</text>
			</scroll-view>

		</view>
		<view class="content-box">
			<scroll-view class="scroll-view_H" scroll-x="true" ref="scrollView" :scroll-left="scrollLeft"
				:show-scrollbar="false">
				<view v-for="(item,date) in news" :key="item.id" class="scroll-view-item_H"
					@click="selectDate(date, item)">
					<view v-if="item.goods_number > 0">
						<view v-if="item.weekday==='周日'||item.weekday==='周六'" class="float-number-red">
							{{ item.goods_number }}
						</view>
						<view v-if="item.weekday!=='周日' && item.weekday!=='周六'" class="float-number-blue">
							{{ item.goods_number }}
						</view>
					</view>
					
					<text style="display: block;margin:10px 0px 15px; 0px;color: #e65555;"
						v-if="item.weekday==='周日' || item.weekday==='周六' ">
						{{item.weekday}}
					</text>
				
					<text style="display: block;margin:10px 0px 15px; 0px;;"
						v-if="item.weekday!=='周日'&&item.weekday!=='周六'">
						{{item.weekday}}
					</text>
					<text v-if="chooseDate !== date"
						style="display: block;border-radius: 100%;padding: 10px;box-sizing: border-box;width: 60px;height: 47px;">{{item.day_number}}</text>
					<text v-else
						style="display: block;background: #7dc3d3;color: #fff;border-radius: 5px;padding: 10px;box-sizing: border-box;width: 60px;height: 45px;">{{item.day_number}}</text>
				</view>
			</scroll-view>
			<view style="padding: 5px 0px;">
				<text class="font-alimamashuhei"
					style="color: #7dc3d3;margin: 15px 0px 15px 0px;display: block;">{{chooseDate}} 日
					星期{{chooseItem.weekday}}上新</text>
				<view v-if="chooseItem.goods == null">
					<text>这天没有上新呢...</text>
				</view>
			</view>
			<!-- 遍历chooseItem.goods -->

			<view v-if="chooseItem.goods" v-for="good in chooseItem.goods" :key="good.id"
				style="margin: 10px 0px 10px 0px;box-sizing: border-box;padding: 10px 0px;">
				<view style="width: 30vw;float: left;position: relative;">
					<navigator @click="jumpGoods(good.goods_id)">
						<image :src="good.goods_image" mode="aspectFill" style="width: 30vw; height: auto;height: auto;
						aspect-ratio: 1; "></image>
						<text
							style="left: 0px;position: absolute;top: 5px;width: 100px;background: rgb(82 104 138);color: #fff;text-align: center;opacity: 0.8;font-size: 13px;padding: 5rpx;">{{good.sale_type}}</text>
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

						<text class="line-height" style="color: rgb(255 150 178);"
							v-if="good.sale_type != '限量现货' && good.sale_type != '不限量现货'  ">
							定金 <text
								style="font-size: 25px;color: rgb(255 150 178);font-weight: 900;">{{good.sub_amount}}</text>
							({{good.currency}}) 尾款 <text
								style="color: rgb(255 150 178);font-weight: 900;">{{good.fin_amount}}</text>
						</text>
						<text class="line-height" style="color: rgb(255 150 178);"
							v-if="good.sale_type == '限量现货' || good.sale_type == '不限量现货'  ">
							全款 <text
								style="font-size: 25px;color: rgb(255 150 178);font-weight: 900;">{{good.sub_amount + good.fin_amount}}</text>
							({{good.currency}})
						</text>
					</navigator>

				</view>
				<view style="clear: both;"></view>
			</view>
		</view>

	</common-page>


</template>

<script setup>
	import {
		ref,
		onMounted
	} from 'vue';
	import {
		websiteUrl,
		wechatSignLogin,
		getUserInfo,
		global,
	} from "../../common/config.js";
	//标签列表
	const tabList = ref([
		'全部', '整体', '单头', '单体', '娃衣',
		'眼珠', '娃鞋', '手型', '脚型', '袜子', '配饰'
	])
	let activeType = ref('全部')
	let originalNews = ref({}) // 存储原始数据
	// 获取当前年月日
	let news = ref({}) // 存储筛选后的数据
	const today = new Date();
	const year = today.getFullYear();
	const month = String(today.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需要加1
	const day = String(today.getDate()).padStart(2, '0');

	const todayFormat = `${year}-${month}-${day}`;
	// 计算scroll-view宽度
	const scrollView = ref(null);
	const systemInfo = uni.getSystemInfoSync();
	const screenWidth = systemInfo.screenWidth;
	const itemWidth = screenWidth / 7
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
		uni.request({
			url: websiteUrl + `/goods-news`,
			method: 'GET',
			timeout: 5000,
			success: (res) => {
				console.log(res.data.data);
				originalNews.value = res.data.data
				news.value = filterNews('全部')
				// news.value = res.data.data
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

	// 新增筛选方法
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
				// 如果筛选后没有商品，设为null保持数据格式
				if (copy.goods.length === 0) copy.goods = null
			}
			filtered[date] = copy
		})
		return filtered
	}


	// 修改handleTabClick方法
	const handleTabClick = (type) => {
		activeType.value = type
		const filtered = filterNews(type)
		news.value = {
			...filtered
		} // 使用扩展运算符触发响应式更新

		// 自动选择第一个有效日期
		const firstValidEntry = Object.entries(filtered).find(([_, v]) => v.goods)
		if (firstValidEntry) {
			chooseDate.value = firstValidEntry[0]
			chooseItem.value = firstValidEntry[1]
		} else {
			// 如果没有有效数据，保持当前选择但清空内容
			chooseItem.value = {
				goods: null
			}
		}
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

	.goods_renew_header_content {
		background: linear-gradient(180deg, rgb(185 195 253) 0%, rgb(211 245 255) 100%);
		overflow: hidden;

		.choose_tab {
			display: block;
			white-space: nowrap;
			height: 170rpx;

			text {
				vertical-align: bottom; // 确保所有状态底部对齐
				line-height: 1; // 统一行高计算
				transition: all 0.3s ease;
				font-size: 32rpx;
				display: inline-block;
				margin: 10rpx 20rpx;
				padding: 10rpx 0rpx;
				font-weight: 1000;
				width: 100rpx;
				height: 85rpx;
				text-align: center;
				line-height: 85rpx;
				/* 垂直居中 */
				display: inline-flex;
				align-items: center;
				justify-content: center;

				&.active {
					font-size: 40rpx !important;
					font-weight: bold;
					color: #7dc3d3;
					position: relative;

					&::after {
						content: '';
						position: absolute;
						bottom: 0rpx;
						left: 50%;
						transform: translateX(-50%);
						width: 60%;
						height: 6rpx;
						background: #7dc3d3;
						border-radius: 3rpx;
					}
				}
			}
		}
	}

	.scroll-view_H {
		white-space: nowrap;
		width: 100%;
		display: flex;
		padding-top: 10px;
	}

	.scroll-view-item_H {
		display: inline-block;
		text-align: center;
		font-size: 36rpx;
		width: calc(100vw/7);
		padding-bottom: 15px;
		position: relative;
		padding-top: 15rpx;
	}

	.line-height {
		margin: 9px 0px 9px 0px;
		display: block;

	}

	.content-box {
		border-radius: 30px;
		overflow: hidden;
		position: relative;
		top: -20px;
		background: #fff;
		padding: 20px;
		box-shadow: 0 0px 10px #ffffff30;
	}
	
	.float-number-red {
		position: absolute; top: 1px; right: -5px;
		    background:#ffb1b1; color: white; border-radius: 50%;
		    width: 20px; height: 20px; line-height: 20px; 
		    font-size: 12px; text-align: center;font-weight: 1000;
	}
	.float-number-blue {
		position: absolute; top: 1px; right: -5px;
		    background: #afe7ff; color: white; border-radius: 50%;
		    width: 20px; height: 20px; line-height: 20px; 
		    font-size: 12px; text-align: center;font-weight: 1000;
	}
</style>