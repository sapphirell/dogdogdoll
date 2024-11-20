<template>
	<view>
		<image :src="brand.logo_image" mode="aspectFit" class="brand_logo"></image>
		<view class="body">
			<view>
				<text style="float: left;font-size: 20px;">{{brand.brand_name}}</text>
				<text style="float: right;">{{brand.country_name}} / 	{{brand.type}}</text>
				<view style="clear: both;"></view>
			</view>
			
		
			<view>
				<uni-rate style="margin-top: 5px;float: left;" v-model="rateValue" @change="onChange" :value="4.2" allow-half="true" />
				<text style="float: left;margin-left: 20px;position: relative;top: 5px;">4.2（1348次评分）</text>
				<view style="clear: both;"></view>
			</view>
			
			<view style="margin-top: 10px;">
				<text>简介：{{brand.description}}</text>
			</view>
			<div style="clear: both;"></div>
			<!-- 品牌商品列表 -->
			<text style="color: rgb(100, 198, 220);display: block;margin: 20px 0px;">收录作品 ({{goods.total}})</text>
			<view class="brand_goods">
				<view class="brand_goods_item" style="" v-for="(item, index) in goods.goods_list" :key="item.id">
					<navigator @click="jumpGoods(item.id)">
						<image style="" :src="item.goods_images[0]" mode="aspectFit" class="brand_goods_image"></image>
						
					</navigator>
				</view>
			</view>
			<button class="load_more" @click="getBrandGoods">加载更多</button>
			<view>
				<text style="color: rgb(100, 198, 220);display: block;margin: 20px 0px;">讨论 ({{comments.total}})</text>
				<view>
					<view class="comment_item" v-for="(item,index) in comments.comment_list" :key="item.id" style="margin-bottom: 10px;">
						<view style="float: left; width: 80px;padding: 0px 10px 10px 0px;">
							<image style="width: 50px;height: 50px;border-radius: 100%;display: block;margin: 10px;" :src="item.avatar" mode="aspectFill"></image>
							<text style="display: block;white-space: nowrap;overflow: hidden;text-overflow: ellipsis; ">{{item.username}}</text>
						</view>
			
						<view style="float: left;padding: 10px;background: rgb(245 245 245);width: calc(100vw - 170px);min-height: 60px;border-radius: 15px;position: relative;">
							<text class="floor" style="position: absolute;top: -12px;right: 10px;color: #888;font-size: 20px;">#{{item.floor}}</text>
							<text style="width: 100%; white-space: normal;word-break: break-all;">{{item.comment}}</text>
						</view>
						<view style="clear: both;"></view>
					</view>
				</view>
			</view>
			
		</view>
		<!-- 一个不可见透明元素，撑起80px高度 -->
		<view style="height: 80px;"></view>

		<view class="bottom_tab" style="">
			<textarea class="comment_input"></textarea>
			<button style="" @click="addComments">写评论</button>
		</view>
	</view>
</template>

<script setup>
	import { ref } from 'vue';
	const props = defineProps(["brand_id"])
	console.log(props)
	uni.showLoading({
		
	})
	

	function getBrandsInfo() {
		uni.request({
			url: 'http://localhost:8080/brand-info?id=' + props.brand_id ,
			method: 'GET',
			timeout: 5000,
			success: (res) => {
				console.log(res.data.data);
				brand.value = res.data.data;
				//修改页面标题
				uni.setNavigationBarTitle({
					title: res.data.data.brand_name
				})
		
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
	
	function getBrandGoods() {
		uni.request({
			url: 'http://localhost:8080/brand-goods?brand_id=' + props.brand_id + "&page=" + page.value,
			method: 'GET',
			timeout: 5000,
			success: (res) => {
				console.log(res.data.data);
				goods.value.page_index = res.data.data.page_index;
				goods.value.total = res.data.data.total;
				goods.value.goods_list = goods.value.goods_list ? goods.value.goods_list.concat(res.data.data.goods_list) : res.data.data.goods_list;
				//如果返回的列表size大于0，页码增加
				if(res.data.data.goods_list.length > 0) {
					page.value += 1
				}
				//如果返回的列表size等于0，且page>1提示无更多数据
				if(res.data.data.goods_list.length == 0 && page.value > 1) {
					uni.showToast({
						title: '没有更多数据了',
						icon: 'none'
					})
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
	
	
	function getBrandComments() {
		uni.request({
			url: 'http://localhost:8080/brand-comment?brand_id=' + props.brand_id + "&page=" + commentsPage.value,
			method: 'GET',
			timeout: 5000,
			success: (res) => {
				console.log(res.data.data);
				comments.value.page_index = res.data.data.page_index;
				comments.value.total = res.data.data.total;
				comments.value.comment_list = comments.value.comment_list ? comments.value.comment_list.concat(res.data.data.comments) : res.data.data.comment_list;
				//如果返回的列表size大于0，页码增加
				if(res.data.data.comments != null) {
					if(res.data.data.comments.length > 0) {
						commentsPage.value += 1
					}
					//如果返回的列表size等于0，且page>1提示无更多数据
					if(res.data.data.comments.length == 0 && commentsPage.value > 1) {
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
		
	}
	
	//跳转到商品页
	// 跳转商品页
	function jumpGoods(id) {
		uni.navigateTo({
			url: '/pages/goods/goods?goods_id=' + id
		})
	}
	
	let goods = ref({})
	//brand page
	let page = ref(1)
	let brand = ref({})
	let comments = ref({})
	let commentsPage = ref(1)
	// 获取品牌信息
	getBrandsInfo()
	// 获取品牌娃娃列表
	getBrandGoods()
	//获取品牌评论
	getBrandComments()
	
</script>

<style lang="less" scoped>

.brand_logo {
	width: calc(100vw - 10px);
	display: block;
	margin:5px;
	float: left;
}

.brand_info_body {
	width: calc(70vw - 10px);
	box-sizing: border-box;
	padding: 5px;
	float: right;
	  justify-content: flex-start;
	  
	text {
		display: block;
		width: 100%;
	}
}

.brand_goods {
      display: flex;
      flex-wrap: wrap;
      gap: 16px; /* 设置元素之间的间距 */
      // padding: 8px; /* 避免元素贴边 */
	  
	 .brand_goods_item {
		  flex: 1 1 calc(33.33% - 16px); /* 固定每个元素宽度为 33.33% */
		  max-width: calc(33.33% - 16px); /* 设置最大宽度 */
		  height: 110px; /* 示例高度，可根据需求调整 */
		  // background-color: #4CAF50;
		  // height: auto;             /* 高度自动调整以保持比例 */
		   aspect-ratio: 1; 
		  color: white;
		  display: flex;
		  align-items: center;
		  justify-content: center;
		  font-size: 20px;
		  border-radius: 8px;
		  overflow: hidden;
	}
}

.body {
	width: 100vw;
    // height: calc(100vh - 50px);
    opacity: 1;
    border-radius: 25px;
    background: white;
    box-shadow: 0px 0px 5px rgb(0 0 0 / 24%);
    // overflow: hidden;
	width: 100vw;
	// height: calc(100vh - 50px);
	opacity: 1;
	border-radius: 25px;
	background: white;
	box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.15);
	overflow: hidden;
	padding: 20px;
	box-sizing: border-box;
}
//加载更多goods
.load_more {
	background: #fff;
	color: #d6d6d6;
	font-size: 13px;
	margin-top: 15px;
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
</style>
