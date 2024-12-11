<template>
	<view class="body">
		<view class="index_header"  :style="{ paddingTop: statusBarHeight + 'px' }" >
			<view>
				<text class="font-alimamashuhei logo" style="color: #4cbbd0;">娃圈狗狗助手</text>
				<common-search class="index_search_box"></common-search>
				<div style="clear: both;"></div>
			</view>
			<view style="position: relative;">
				<!-- 轮播图部分 -->
				<swiper :interval="3000" :duration="200" @change="onChange" class="banner_swiper">
					<block v-for="i in data">
						<swiper-item class="banner_swiper_item">
							<view class="swiper-item">
								<image :src="i" mode="aspectFill" style="width: 100%;"></image>
							</view>
						</swiper-item>
					</block>
				</swiper>
			
				<!-- 指示点 --> 
				<sdp :resdata="data" :currentIndex="swiperIndex" class="my-sdp"></sdp>
		
			</view>
			
			<view>
				<!-- 四个小方块按钮 -->
				<view class="index_page_article">
					<text>助手指南</text>
					<text>BJD洗白</text>
					<text>认领品牌</text>
					<text>信息补全</text>
				</view>
			</view>
		</view>
		

		<!-- <view style="margin: 0px 15px 30px 18px;display: block;"> -->
			<!-- <text class="font-alimamashuhei" style="color: #4cbbd0;">收录创作者：{{totalBrand}}</text> -->
			<!-- <text @click="roll">随便看看</text> -->
		<!-- </view> -->

		<view class="china_brand_box">
			<index-brand v-for="(item, index) in brandsList" key={{item.id}} :brand="item"></index-brand>
		</view>
	</view>

</template>

<script setup>
	import {onLoad} from "@dcloudio/uni-app"
	import { ref } from 'vue';
	//轮播图组件
	import sdp from '@/components/swiper-dynamic-bullets/swiper-dynamic-bullets.vue';
	let brandsList = ref([]);
	let	data = ref([
		'../../static/blurbg.jpg',
		'../../static/blurbg.jpg',
		'../../static/blurbg.jpg',
		'../../static/blurbg.jpg',
		'../../static/blurbg.jpg',
	])
	var swiperIndex = ref(0)
	const systemInfo = uni.getSystemInfoSync();
	const statusBarHeight = ref(systemInfo.statusBarHeight + 15);
	console.log("状态栏高度" + statusBarHeight.value)
	//收录Brands总数
	var totalBrand = ref(0)
	function onChange(e){
		this.swiperIndex.value = e.detail.current
	}
	function getBrands() {
		uni.showLoading()
		uni.request({
			url: 'http://localhost:8080/brands',
			method: 'GET',
			timeout: 5000,
			success: (res) => {
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
		background: #ff;
	}
	.index_header {
		background: linear-gradient(180deg, rgb(218 238 255) 0%, rgb(255 255 255) 100%);
		padding: 15px;
		color: #4cbbd0;
		display: block;
		height: 300px;
		// box-sizing: border-box;
		
		text {
			float: left;
			margin-right: 10px;
			position: relative;
			top: 5px;
		}
		
		.logo {
			width: 100px;
			position: relative;
			top: 10px;
		}
		
		.domain_text {
			font-size: 13px;
		}
		
		.index_search_box {
			/* border: 1px solid #4cbbd0; */
		
		}
		
		/* 四个小按钮 */
		.index_page_article {
			display: flex;
			justify-content: space-around;
			height: 55px;
			text {
				background: #4cbbd0;
				color: #fff;
				padding: 5px 10px;
				border-radius: 5px;
				margin-right: 10px;
				width: 32px;
			}
		}
	}
	.index_search_box {

			width: calc(100vw - 145px);
			border-radius: 15px;
			float: right;
			background-color: #fff;
			
		.icon_image {
			width:25px;
			height: 25px;
		} 
		
		.common_search_input {
			width: 75%!important;
			margin-left: 5px!important;
		}
	
	
	}
	.index_avatar {
	
		float: right;
		
		image {
			border-radius: 100%;
			width: 30px;
			height: 30px;
		}
	}
	
	.search_input {
		/* width: calc(100vw-25px); */
		display: inline;
	}
	.china_brand_box {
		display: flex;
		flex-wrap: wrap; /* 允许换行 */
		justify-content: space-evenly;
		gap: 10px; /* 设置子项之间的间距 */
		width: 100vw;
	}
	
	/*轮播图*/
	.banner_swiper {
		width: calc(100vw - 40px);
		box-sizing: border-box;
		margin: 20px 5px;
		border-radius: 10px;
		overflow: hidden;
		height:150px;
		.banner_swiper_item {
			background: #fff;
		}
	}
	

			 
</style>
