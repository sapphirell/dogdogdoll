<template>
	<view v-if="goods.name">
		<view>
			<!-- 轮播图部分 -->
			<view style="position: relative;">
				<view class="heart">
					<image src="../../static/heart1.png"></image>
				</view>
				<swiper :interval="3000" :duration="200" @change="onChange" class="banner_swiper">
					<block v-for="(item, key) in goods.goods_images" :key="key">
						<swiper-item class="banner_swiper_item">
							<view class="swiper-item">
								<image :src="item" mode="aspectFill" style="width: 100vw;min-height: 45vh;"></image>
							</view>
						</swiper-item>
					</block>
				</swiper>
				<view class="swiper-index-box">
					<text class="font-alimamashuhei">{{swiperIndex}} / {{goods.goods_images.length}}</text>
				</view>
			</view>


		</view>
		<view class="msg_body">
			<view class="msg_block">
				<text class="lable_text">名称</text>
				<text class="msg_text">{{goods.name}}</text>
			</view>
			<view class="msg_block">
				<text class="lable_text">类型</text>
				<text class="msg_text">{{goods.type}}</text>
			</view>
			<view class="msg_block">
				<text class="lable_text">初贩定价</text>
				<text class="msg_text" v-if=" goods.goods_sales && goods.goods_sales.length > 0 ">
					{{goods.goods_sales[0].sub_amount + goods.goods_sales[0].fin_amount}}
					{{goods.goods_sales[0].currency}}
				</text>
				<text v-else>未知</text>
			</view>
			<view class="msg_block">
				<text class="lable_text">尺寸</text>
				<text class="msg_text">
					{{goods.size}} / {{goods.size_detail}}
				</text>
			</view>
			<view v-if="goods.type==='单体' || goods.type === '整体'" class="msg_block">
				<text class="lable_text">胸型</text>
				<text class="msg_text">
					{{goods.body_size}}
				</text>
			</view>
			<view class="msg_block">
				<text class="lable_text">可选颜色</text>
				<text class="msg_text">
					{{goods.skin}}
				</text>
			</view>
			<view class="msg_block">
				<text class="lable_text">贩售情报</text>
				<text v-if="goods.goods_sales == null">暂无收录贩售信息</text>
				<view class="msg_text">
					<text v-for="sale in goods.goods_sales" :key="sale.id" style="width: 100%;display: block;margin-bottom: 10px;">
						{{formatTimestamp(sale.sub_time)}},
						{{sale.sale_type}}, 总价: {{sale.sub_amount + sale.fin_amount}} ({{sale.currency}})
					</text>
				</view>
				
			</view>
			<view class="msg_block">
				<text class="lable_text">制作方</text>
				<text class="msg_text">
					<navigator @click="jumpBrand(goods.brand_id)" style="display: inline;">
						<text>{{goods.brand_name}}</text>
					</navigator>
				</text>
			</view>
		</view>
		
		<!-- 搭配参考 -->
		<view style="padding: 20px;">
			<text style="color: rgb(100, 198, 220);font-weight: bold; isplay: block;margin: 30px 5px;display: block;">搭配参考</text>
			<view style="display: flex;flex-wrap: wrap;">
			
			</view>
			<view>
				<button class="light_button">上传搭配参考帮助他人</button>
			</view>
		</view>

		<!-- 讨论 -->
		<view style="padding: 20px;">
			<text style="color: rgb(100, 198, 220);font-weight: bold; isplay: block;margin: 30px 5px;display: block;">评论区 ({{comments.total}})</text>
			<view>
				<view v-if="comments.comment_list">
					<view class="comment_item" v-for="(item,index) in comments.comment_list" :key="item.id" style="margin-bottom: 20px;">
						<view style="float: left; width: 80px;padding: 0px 10px 10px 0px;">
							<image style="width: 50px;height: 50px;border-radius: 100%;display: block;margin: 10px;" :src="item.avatar" mode="aspectFill"></image>
							<text style="display: block;white-space: nowrap;overflow: hidden;text-overflow: ellipsis; ">{{item.username}}</text>
						</view>
			
						<view style="float: left;padding: 15px 15px 30px 15px;background: rgb(245 245 245);width: calc(100vw - 170px);min-height: 60px;border-radius: 15px;position: relative;top:2px;">
							<!-- <text class="floor" style="position: absolute;top: -12px;right: 10px;color: #888;font-size: 20px;">#{{item.floor}}</text> -->
							<text style="width: 100%; white-space: normal;word-break: break-all;">{{item.comment}}</text>
						
							<!-- 格式化时间戳created_at为日期 -->
							<text style="color: #888;font-size: 12px;position: absolute;bottom: 3px;left: 15px;">{{formatTimestamp(item.created_at)}} floor#{{item.floor}}</text>
						</view>
						<view style="clear: both;"></view>
					</view>
					<button class="load_more" @click="getBrandComments">加载更多</button>
				</view>
			</view>
		</view>
		<!-- 一个不可见透明元素，撑起80px高度 -->
		<view style="height: 80px;"></view>

		<view class="bottom_tab" style="">
			<textarea class="comment_input" v-model="myComment"></textarea>
			<button style="" @click="addComments">写评论</button>
		</view>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue';
	const props = defineProps(["goods_id"])


	import {
		websiteUrl,
		wechatSignLogin,
		getUserInfo,
		global,
	} from "../../common/config.js";


	let goods = ref({})
	let comments = ref({})
	let commentsPage = ref(1)
	let swiperIndex = ref(1)
	let myComment = ref("")
	uni.showLoading({
		title: '加载中'
	})
	//跳转到品牌页
	function jumpBrand(id) {
		uni.navigateTo({
			url: '/pages/brand/brand?brand_id=' + id
		})
	}
	//滑动商品图片
	function onChange(e) {
		console.log(e.detail.current)
		swiperIndex.value = e.detail.current + 1
	}
	//获取商品详情
	function getGoods() {
		uni.request({
			url: websiteUrl + '/goods?id=' + props.goods_id,
			method: 'GET',
			timeout: 5000,
			success: (res) => {
				console.log(res.data.data);
				goods.value = res.data.data;
			},
			fail: (err) => {
				console.log(err);
				uni.showToast({
					title: '网络请求失败',
					icon: 'none'
				})
			},
			complete: () => {
				uni.hideLoading()
			}
		})
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
		return `${year}-${month}-${day} ${hours}:${minutes}`;
	}

	function getBrandComments() {
		uni.request({
			url: websiteUrl + '/goods-comment?goods_id=' + props.goods_id + "&page=" + commentsPage.value,
			method: 'GET',
			timeout: 5000,
			success: (res) => {
				console.log(res.data.data);
				comments.value.page_index = res.data.data.page_index;
				comments.value.total = res.data.data.total;
				comments.value.comment_list = comments.value.comment_list ? comments.value.comment_list.concat(res.data.data.comment_list) : res.data.data.comment_list;
				//如果返回的列表size大于0，页码增加
				if(res.data.data.comment_list != null) {
					if(res.data.data.comment_list.length > 0) {
						commentsPage.value += 1
					}
					//如果返回的列表size等于0，且page>1提示无更多数据
					if(res.data.data.comment_list.length == 0 && commentsPage.value > 1) {
						uni.showToast({
							title: '没有更多数据了',
							icon: 'none'
						})
					}
				}

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

	//提交评论
	function addComments() {
		let token = uni.getStorageSync('token');
		if (!global.isLogin) {
			uni.showToast({
				title: '请先登录',
				icon: 'none'
			})
			return
		}
		if (myComment.value == "") {
			uni.showToast({
				title: '请输入评论内容',
				icon: 'none'
			})
			return
		}
		let requestData =  {
			content: myComment.value,
			target_id: parseInt(props.goods_id),
			type: 2,
		}
		console.log(requestData)
		uni.request({
			url: websiteUrl + '/with-state/add-comment',
			method: 'POST',
			header: {
				'Authorization': token,
			},
			data: requestData,
			success: (res) => {
				console.log(res.data);
				if (res.data.status == "success") {
					uni.showToast({
						title: '评论成功',
						icon: 'success'
					})
					//清空评论
					myComment.value = ""
					//重新获取评论
					commentsPage.value = 1;
					comments.value = {}
					getBrandComments();
					return;
				} else {
					uni.showToast({
						title: res.data.msg,
						icon: 'none'
					})
					return
				}
			},
			fail: (err) => {
				console.log(err);
				uni.showToast({
					title: '网络请求失败',
					icon: 'none'
				})
			},
		});
	}
	//加载商品
	getGoods();
	//加载评论
	getBrandComments();
	//获取登录
	getUserInfo();
</script>

<style lang="scss" scoped>
	.banner_swiper {
		height: 45vh;
		position: relative;
	}

	.heart {
		position: absolute;
		top: 10px;
		right: 20px;
		z-index: 10;
		width: 30px;
		height: 30px;

		image {
			width: 100%;
			height: 100%;
		}
	}

	.swiper-item {
		height: 45vh;
	}
	.swiper-index-box {
		position: absolute;
		bottom: 30px;
		right: 10px;
		background: rgb(0 0 0 / 64%);
		padding: 6px 15px;
		border-radius: 20px;
		text {
			font-size: 14px;
			color: #fff;
		}
	}

	// 底部tab
	.bottom_tab {
		position: fixed;
		bottom: 0px;
		z-index: 10;
		background: #ffffffeb;
		padding: 10px;
		width: 100vw;
		box-sizing: border-box;
		border-top: 1px solid rgb(221, 221, 221);
		height: 60px;

		button {
			background: rgb(100, 198, 220);
			border-radius: 10px;
			width: 90px;
			color: rgb(255, 255, 255);
			position: absolute;
			right: 20px;
			font-size: 14px;
		}

		.comment_input {
			display: inline;
			border: 1px solid rgb(219 219 219);
			width: calc(100vw - 140px);
			position: absolute;
			bottom: 14px;
			padding: 5px;
			border-radius: 5px;
			height: 20px;
		}
	}

	.uni-page-head {
		background: #ffffff00 !important;
	}
	.msg_body {
	    border-radius: 30px;
	    overflow: hidden;
	    position: relative;
	    top: -20px;
	    background: #fff;
	    padding: 20px;
		box-shadow: 0 0px 10px #ffffff30;
		.msg_block {
			font-size: 17px;
			color: #4cbbd0;
			margin: 20px 0px;
			display: flex;
			align-items: flex-start;
			
			.lable_text {
				width: 30%;
				display: inline-block;
				color: #4cbbd0;
				font-weight: bold;
			}
			.msg_text {
				width: 70%;
				display: inline-block;
				// color: #4cbbd0;
			}
		}
	}
	
	//加载更多goods
	.load_more {
		border: none;
		background: #fff;
		color: #d6d6d6;
		font-size: 13px;
		margin-top: 15px;
	}
	.load_more::after {
		border: none;
	}
</style>