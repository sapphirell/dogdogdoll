<template>
	<view v-if="goods.name">
		<view>
			<!-- 轮播图部分 -->
			<swiper :interval="3000" :duration="200" @change="onChange" class="banner_swiper">
				<block v-for="(item, key) in goods.goods_images" :key="key">
					<swiper-item class="banner_swiper_item">
						<view class="swiper-item">
							<image :src="item" mode="aspectFit" style="width: 100vw;height: 45vh;"></image>
						</view>
					</swiper-item>
				</block>
			</swiper>
						
			<!-- 指示点 --> 
			<!-- <sdp :resdata="goods.GoodsImages" :currentIndex="swiperIndex" class="my-sdp"></sdp> -->
		</view>
		<view class="msg_block">
			<text class="lable_text">名称:</text>
			<text class="msg_text">{{goods.name}}</text>
		</view>
		<view class="msg_block">
			<text class="lable_text">类型:</text>
			<text class="msg_text">{{goods.type}}</text>
		</view>
		<view class="msg_block">
			<text class="lable_text">初贩定价:</text>
			<text class="msg_text" v-if=" goods.goods_sales && goods.goods_sales.length > 0 ">
				{{goods.goods_sales[0].sub_amount + goods.goods_sales[0].fin_amount}}
				{{goods.goods_sales[0].currency}}
			</text>
			<text v-else>
				未知
			</text>
		</view>
		<view class="msg_block">
			<text class="lable_text">尺寸/详细尺寸:</text>
			<text class="msg_text">
				{{goods.size}} / {{goods.size_detail}}
			</text>
		</view>
		<view class="msg_block">
			<text class="lable_text">可选颜色:</text>
			<text class="msg_text">
				{{goods.skin}}
			</text>
		</view>
		<view class="msg_block">
			<text class="lable_text">贩售:</text>
			<text v-if="goods.goods_sales == null">暂无收录贩售信息</text>
			<text class="msg_text" v-for="sale in goods.goods_sales" :key="sale.id">
				{{formatTimestamp(sale.sub_time)}},
				{{sale.sale_type}}, 总价: {{sale.sub_amount + sale.fin_amount}} ({{sale.currency}}) 
			</text>
		</view>
		<view class="msg_block">
			<text class="lable_text">制作方:</text>
			<text class="msg_text">
				<navigator @click="jumpBrand(goods.brand_id)" style="display: inline;">
					<text>{{goods.brand_name}}</text>
				</navigator>
			</text>
		</view>

		<!-- 讨论 -->
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
		
		<view class="bottom_tab" style="">
			<textarea class="comment_input"></textarea>
			<button style="" @click="addComments">写评论</button>
		</view>
	</view>
</template>

<script setup>
	import { ref } from 'vue';
	const props = defineProps(["goods_id"])
	let goods = ref({})
	let comments = ref({})
	let commentsPage = ref(1)
	
	uni.showLoading({
		title: '加载中'
	})
	//跳转到品牌页
	function jumpBrand(id) {
		uni.navigateTo({
			url: '/pages/brand/brand?brand_id=' + id
		})
	}
	
	//获取商品详情
	function getGoods() {
		uni.request({
			url: 'http://localhost:8080/goods?id=' + props.goods_id,
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
	      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
	}
	function getBrandComments() {
		uni.request({
			url: 'http://localhost:8080/goods-comment?goods_id=' + props.goods_id + "&page=" + commentsPage.value,
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
	//加载商品
	getGoods();
	//加载评论
	getBrandComments();
</script>

<style lang="scss">
.banner_swiper {
	height: 45vh;
}
.swiper-item {
	height: 45vh;
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
