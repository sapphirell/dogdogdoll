<template>
	<common-page head_color="rgb(255 230 215) ">
		<view class="body">
			<view class="index_header">
				<text class="font-alimamashuhei logo"
					style="color: #4cbbd0;width: 180rpx;padding-top: 10rpx;">娃圈狗狗助手</text>
				<view>
					<common-search></common-search>
					<div style="clear: both;"></div>
				</view>
				<view style="position: relative;height: 250rpx;">
					<!-- 轮播图部分 -->
					<swiper :interval="3000" :duration="200" @change="onChange" class="banner_swiper">
						<block v-for="(item) in data" :key="item">
							<swiper-item class="banner_swiper_item">
								<view class="swiper-item">
									<image :src="item" mode="aspectFill" style="width: 100%;"></image>
								</view>
							</swiper-item>
						</block>
					</swiper>


				</view>

				<view style="margin: 40rpx 0rpx">
					<!-- 四个小方块按钮 -->
					<view class="index_page_article">
						<view>
							<image src="../../static/cat-1.png" mode="aspectFill"></image>
							<text>助手指南</text>
						</view>
						<view>
							<image src="../../static/cat-2.png" mode="aspectFill"></image>
							<text>BJD洗白</text>
						</view>
						<view>
							<image src="../../static/cat-3.png" mode="aspectFill"></image>
							<text>认领品牌</text>
						</view>
						<view>
							<image src="../../static/cat-10.png" mode="aspectFill"></image>
							<text>信息补全</text>
						</view>
						
					</view>
				</view>
			</view>


			<!-- <view style="margin: 0px 15px 30px 18px;display: block;"> -->
			<!-- <text class="font-alimamashuhei" style="color: #4cbbd0;">收录创作者：{{totalBrand}}</text> -->
			<!-- <text @click="roll">随便看看</text> -->
			<!-- </view> -->

			<view class="china_brand_box" style="position: relative;">
				<view v-for="(item, index) in brandsList" :key="item.id">
					<index-brand :brand="item"></index-brand>
				</view>
			
			</view>
		</view>
	</common-page>


</template>

<script setup>
	import {
		onLoad
	} from "@dcloudio/uni-app"
	import {
		ref
	} from 'vue';
	import {
		websiteUrl,
		wechatSignLogin,
		getUserInfo,
		global,
	} from "../../common/config.js";

	//轮播图组件
	import sdp from '@/components/swiper-dynamic-bullets/swiper-dynamic-bullets.vue';
	let brandsList = ref([]);
	let data = ref([
		'../../static/blurbg.jpg',
		'../../static/blurbg.jpg',
		'../../static/blurbg.jpg',
		'../../static/blurbg.jpg',
		'../../static/blurbg.jpg',
	])
	var swiperIndex = ref(0)
	const systemInfo = uni.getSystemInfoSync();
	// const statusBarHeight = ref(systemInfo.statusBarHeight + 15);
	// console.log("状态栏高度" + statusBarHeight.value)

	//收录Brands总数
	var totalBrand = ref(0)

	function onChange(e) {
		this.swiperIndex.value = e.detail.current
	}

	function getBrands() {
		uni.showLoading()
		uni.request({
			url: websiteUrl + '/brands',
			method: 'GET',
			timeout: 5000,
			success: (res) => {
				console.log(websiteUrl)
				console.log(res)
				console.log(res.data.data.brands_list);
				brandsList.value = res.data.data.brands_list;
				totalBrand.value = res.data.data.total
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

	getBrands();
</script>

<style lang="scss" scoped>
	.body {
		/* background: linear-gradient(180deg, rgb(218 238 255) 0%, rgb(255 255 255) 100%); */
		// background: #fff;
	}

	.index_header {
		// background: linear-gradient(180deg, rgb(218 238 255) 0%, rgb(255 255 255) 100%);
		background: linear-gradient(180deg, rgb(255 230 215) 0%, rgb(211 245 255) 100%);
		// background: transparent;
		padding: 15rpx;
		padding-bottom: 80rpx;
		color: #4cbbd0;
		display: block;
		// height: 300rpx;
		// box-sizing: border-box;

		text {
			// float: left;
			// margin-right: 10rpx;
			// position: relative;
			// top: 5rpx;
		}

		.logo {
			margin: 20rpx 10rpx;
			display: block;
			width: 100rpx;
			font-size: 30rpx;
			font-weight: 1000;
			// position: relative;
			// top: 10rpx;
		}

		.domain_text {
			font-size: 13rpx;
		}


		/* 四个小按钮 */
		.index_page_article {
			display: flex;
			justify-content: space-around;
			height: 100rpx;
			width: 100%;
			
			
			view {
				background: #fff;
				width: 150rpx;
				height: 120rpx;
				align-items: center;
				border-radius: 10rpx;
				image {
					width: 50rpx;
					height: 50rpx;
					margin: auto;
					display: block;
					padding: 10rpx;
				}
				
				text {
					text-align: center;
					display: block;
					color: #4cbbd0;
					border-radius: 5rpx;
					margin-right: 10rpx;
					width: 100%;
				}
			}
			
		}
	}

	.index_search_box {
		width: calc(100vw - 145rpx);
		border-radius: 15rpx;
		background-color: #fff;

		.icon_image {
			width: 25rpx;
			height: 25rpx;
		}

		.common_search_input {
			width: 75% !important;
			margin-left: 5rpx !important;
		}


	}

	.index_avatar {

		float: right;

		image {
			border-radius: 100%;
			width: 30rpx;
			height: 30rpx;
		}
	}

	.search_input {
		/* width: calc(100vw-25rpx); */
		display: inline;
	}

	.china_brand_box {
		display: flex;
		flex-wrap: wrap;
		/* 允许换行 */
		justify-content: space-evenly;
		gap: 10rpx;
		/* 设置子项之间的间距 */
		width: 100vw;
		margin-top: 30rpx;
		
		border-radius: 30px;
		overflow: hidden;
		position: relative;
		top: -70rpx;
		background: #fff;
		box-shadow: 0 0px 10px #ffffff30;
	}

	/*轮播图*/
	.banner_swiper {
		width: calc(100vw - 40rpx);
		box-sizing: border-box;
		margin: 20rpx 5rpx;
		border-radius: 10rpx;
		overflow: hidden;
		height: 250rpx;

		.banner_swiper_item {
			background: #fff;
		}
	}
</style>