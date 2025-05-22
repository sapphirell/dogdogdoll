<template>

	<view v-if="goods.name">
		<meta name="theme-color" content="#F8F8F8"></meta>
		<view>
			<!-- 轮播图部分 -->
			<view style="position: relative;">
				<view class="heart" @click="likeFn()">
<!-- 					<image src="../../static/heart-w.png" v-if="!hasLike"></image>
					<image src="../../static/heart2.png" v-else></image> -->
					
					<uni-icons type="heart" size="28" color="#ff4d4f" v-if="!hasLike"></uni-icons>
					<uni-icons type="heart-filled" size="28" color="#ff4d4f" v-else></uni-icons>
					
					<text class="num" style="color:#ff4d4f;">{{ formatNumber(goods.goods_like_count) }}</text>
				</view>
				<swiper :interval="3000" :duration="200" @change="onChange" class="banner_swiper" style="max-height: 800px;"  :style="{ height: swiperHeight + 'px' }">
					<block v-for="(item, key) in goods.goods_images" :key="key">
						<swiper-item class="banner_swiper_item">
							<view class="swiper-item">
								<image :src="item" mode="widthFix" style="width: 100%; display: block;" :class="'swiper-image-'+key" 
									@tap="viewFullImage(key)" @load="onImageLoad(key)" ></image>
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
				<text class="msg_text" v-if="goods.total_amount">{{goods.total_amount + " " + goods.currency}}</text>
				<text class="msg_text" v-else-if=" goods.goods_sales && goods.goods_sales.length > 0 ">
					{{goods.goods_sales[0].sub_amount + goods.goods_sales[0].fin_amount}}
					{{goods.goods_sales[0].currency}}
				</text>
				
				<text v-else>未知</text>
				
			</view>
			<view class="msg_block">
				<text class="lable_text">初贩时间</text>
				<text class="msg_text">{{goods.sub_time1 > 0 ? formatTimestamp(goods.sub_time1) : "未知"}}</text>
			</view>
			<view class="msg_block">
				<text class="lable_text">尺寸</text>
				<text class="msg_text">
					{{goods.size}} / {{goods.size_detail}}
				</text>
			</view>
			<view v-if="goods.type==='单体' || goods.type === '整体' || goods.type === '单头'" class="msg_block">
				<text class="lable_text">可选体型</text>
				<text class="msg_text">
					{{goods.body_size || "未知"}}
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
			
				<text v-if="goods.goods_sales == null">暂无收录贩售详细信息</text>
				<view class="msg_text">
					<text v-for="sale in goods.goods_sales" :key="sale.id"
						style="width: 100%;display: block;margin-bottom: 10px;">
						{{formatTimestamp(sale.sub_time)}},
						{{sale.sale_type}}, 总价: {{sale.sub_amount + sale.fin_amount}} ({{sale.currency}})
					</text>
				</view>

			</view>
			<view class="msg_block">
				<text class="lable_text">制作方</text>
				<text class="msg_text" style="color: #55aae5" @click="jumpBrand(goods.brand_id)">
					{{goods.brand_name}}
				</text>
			</view>
			<view class="msg_block">
				<text class="lable_text">备注</text>
				<text class="msg_text" >
					{{goods.desc_content}}
				</text>
			</view>
		</view>

		<!-- 搭配参考 -->
		<view style="padding: 40rpx;">
			<view style="display: flex;margin: 30px 5px 10px 5px;">
				<text
					style="color: rgb(100, 198, 220);font-weight: bold; display: block;width: calc(100% - 130rpx);">搭配参考</text>
				<view style="display: flex;">
					<text style="width: 110rpx;display: inline-block;color: #888;">查看更多</text>
					<image src="../../static/right2.png" style="width: 30rpx;height: 30rpx;display: inline-block;position: relative;top: 3rpx;">
					</image>
				</view>

			</view>

			<scroll-view scroll-x="true" class="collocationBox" ll-with-animation="true" :show-scrollbar="false">
				<!-- 遍历搭配参考 -->
				<view v-if="collocationList && collocationList.collocation_relation_list.length > 0"
					v-for="collocation in collocationList.collocation_relation_list" :key="collocation.collocation_id"
					style="" class="collocationItem square" @tap="jump2collectionDetail(collocation.collocation_id, collocation.relation_origin)">
					<image :src="getImageForList(collocation.image_urls)" mode="aspectFill"
						style="width: 100%;height: 100%;"></image>

				</view>
			</scroll-view>

			<view @tap="jump2collocation"
				style="border: 1px solid #eaeaea; display: flex;margin: 20rpx auto; border-radius: 15rpx;width: 400rpx;">
				<image src="../../static/paper_plane.png" style="width: 45rpx;height: 45rpx;margin: 18rpx;"></image>
				<text style=";color: rgb(184 184 184);margin: 12px auto;">上传搭配参考帮助他人</text>
			</view>
		</view>

		<!-- 评论区（保留原有结构，需根据接口调整） -->
		<view style="padding: 10px;">
			<comment-list ref="commentListRef" :type="2" :relation-id="parseInt(props.goods_id)" @reply="handleReplyComment" />
		</view> <!-- 加载状态 -->
		
		<view v-if="loading" class="loading">加载中...</view>
		<view v-if="error" class="error">{{ errorMsg }}</view>
		
		<!-- 输入框 -->
		<comment-input 
		  ref="commentInputRef"
		  :reply-info="replyForItem" 
		  :target-id="props.goods_id" 
		  @submit="handleCommentSubmit"
		  @update:reply-info="val => replyForItem = val" 
		/>
		
		<!-- 一个不可见透明元素，撑起80px高度 -->
		<view style="height: 80px;"></view>
		

	</view>


</template>

<script setup>
	import {
		ref,
		watch,
		computed,

	} from 'vue';
	import {
		asyncGetUserInfo, getScene
	} from '../../common/config';

	import {
		onShow,
		onHide,
	} from "@dcloudio/uni-app";

	import {
		websiteUrl,
		wechatSignLogin,
		getUserInfo,
		global,
	} from "../../common/config.js";

	const props = defineProps(["goods_id"])

	// 获取系统信息
	const systemInfo = uni.getSystemInfoSync()
	const loading = ref(false)       // 加载状态
	const error = ref(false)         // 错误状态
	const errorMsg = ref('')         // 错误信息
	
	// 回复
	const commentListRef = ref(null)  // 必须与模板中的ref名称一致
	const commentInputRef = ref(null) // 输入框聚焦状态联动
	let commentsPage = ref(1)
	//引用回复
	let replyForItem = ref({})



	let goods = ref({})

	let swiperIndex = ref(1)

	//是否点赞过这个商品
	let hasLike = ref(false)
	//搭配参考列表
	let collocationList = ref(false)

	
	//轮播图高度
	const swiperHeight = ref(400); // 初始高度，根据需求调整
	const imageHeights = ref([]);
	

	
	// 引用回复
	const handleReplyComment = ({
		parent,
		target
	}) => {
		console.log("parent", parent)
		console.log("target", target)
		// 判断是回复的楼主还是楼内
		let item = parent
		if (target != null) {
			item = target
		}
	
		if (replyForItem.value.id == item.id) {
			replyForItem.value = {}
			return
		}
		console.log("item", item)
		replyForItem.value = item;
		// 聚焦输入框
		commentInputRef.value?.focusInput()
	}
	const handleCommentSubmit = ({
		content,
		replyInfo,
		origin
	}) => {
		let token = uni.getStorageSync('token');
		if (!global.isLogin) {
			uni.showToast({
				title: '请先登录',
				icon: 'none'
			})
			return
		}
		console.log("reply_info", replyInfo)
		const requestData = {
			content,
			origin,
			target_id: parseInt(props.goods_id),
			type: 2,
			...(replyInfo.id && {
				reply_id: replyInfo.id,
				reply_for: replyInfo.comment,
				reply_user_id: replyInfo.user_id,
				parent_id: replyInfo.parent_id > 0  ? replyInfo.parent_id : replyInfo.id,
			})
		}
	
		uni.request({
			url: websiteUrl + '/with-state/add-comment',
			method: 'POST',
			header: {
				'Authorization': token
			},
			data: requestData,
			success: (res) => {
				if (res.data.status == "success") {
					const newComment = res.data.data
					if (newComment.parent_id === 0) {
						// 主评论
						commentListRef.value?.addNewComment(newComment)
					} else {
						// 子评论
						commentListRef.value?.addReplyComment(newComment)
					}
	
					uni.showToast({
						title: '评论成功',
						icon: 'success'
					})
	
				} else {
					uni.showToast({
						title: res.data.msg,
						icon: 'none'
					})
				}
			},
			fail: (err) => {
				uni.showToast({
					title: '网络请求失败',
					icon: 'none'
				})
			}
		});
	}
	
	
	const onShareAppMessage = () => ({
		title: 'BJD娃圈你想知道的这里都有~',
		path: '/pages/news/news',
		success(res) {
			console.log('分享成功', res)
		},
		fail(err) {
			console.log('分享失败', err)
		},
		mp: {
			wxpath: '/pages/index/index.html'
		}
	})
	

	// 图片加载完成回调
	function onImageLoad(index) {
		console.log('图片加载完成', index);
	  const query = uni.createSelectorQuery();
	  setTimeout(() => {
		  query.select(`.swiper-image-${index}`)
		  		.boundingClientRect(rect => {
		  		  try {
		  			if (!rect) {
		  			  console.warn('未找到图片元素');
		  			  return;
		  			}
		  			console.log(rect)
		  			imageHeights.value[index] = rect.height;
		  			const validHeights = imageHeights.value.filter(h => h > 0);
		  			if (validHeights.length === 0) return;
		  			swiperHeight.value = Math.max(...validHeights);
		  		  } catch (e) {
		  			console.error('高度计算异常:', e);
		  		  }
		  		}).exec();
	  }, 20);
	 
	}

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
	//格式化数字
	function formatNumber(num) {
		if (num < 1000) {
			return num.toString();
		} else {
			const kValue = Math.floor(num / 1000);
			return `${kValue}k+`;
		}
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
	//replyFor 引用回复
	function replyFor(item) {
		//如果重复点击，清空
		if (replyForItem.value.id == item.id) {
			replyForItem.value = {}
			return
		}

		replyForItem.value = item;
	}


	
	//
	function likeFn() {
		let token = uni.getStorageSync('token');
		if (!global.isLogin) {
			uni.showToast({
				title: '请先登录',
				icon: 'none'
			})
			return
		}
		let requestData = {
			id: parseInt(props.goods_id),
			type: 1,
		}
		// 判断是请求点赞接口还是取消点赞接口 add-like unlike
		let url = hasLike.value ? '/with-state/unlike' : '/with-state/add-like';
		uni.request({
			url: websiteUrl + url,
			method: 'POST',
			header: {
				'Authorization': token,
			},
			data: requestData,
			success: (res) => {
				console.log(res.data);
				if (res.data.status == "success") {
					uni.showToast({
						title: '操作成功',
						icon: 'success'
					})
					hasLike.value = !hasLike.value
					getHasLike()
					getGoods()
					return
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
	//获取是否点赞
	function getHasLike() {
		let token = uni.getStorageSync('token');
		if (token == "") {
			return
		}

		uni.request({
			url: websiteUrl + '/with-state/hasLike?id=' + props.goods_id + '&type=1',
			method: 'POST',
			header: {
				'Authorization': token,
			},
			success: (res) => {
				console.log(res.data);
				if (res.data.status == "success") {
					// goods.value = res.data.data;
					if (res.data.data.id > 0) {
						hasLike.value = true
					} else {
						hasLike.value = false
					}

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

	//跳转到收藏上传页面，并携带商品参数和品牌参数
	function jump2collocation() {
		uni.navigateTo({
			url: '/pages/collocation/collocation?goods_id=' + props.goods_id + '&brand_id=' + goods.value
				.brand_id + '&goods_name=' + goods.value.name + '&brand_name=' + goods.value.brand_name +
				'&type=' + goods.value.type
		})
	}
	//跳转到收藏详情页面
	function jump2collectionDetail(collocation_id, origin) {
		uni.navigateTo({
			url: '/pages/collocation_share/collocation_share?collocation_id=' + collocation_id + '&origin=' + origin
		})
	}

	//获取搭配集合
	function getCollocation() {
		uni.request({
			url: websiteUrl + '/goods-collocation?goods_id=' + props.goods_id,
			method: 'GET',
			timeout: 5000,
			success: (res) => {
				console.log(res.data.data);
				collocationList.value = res.data.data;
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
	//getImageForList，传入一个以逗号分割的图片链接列表，截取返回第一个链接
	function getImageForList(urlList) {
		if (!urlList) {
			return '';
		}
		// 将urlList按逗号分割成数组
		let urls = urlList.split(',');

		// 返回第一个链接
		return urls[0].trim(); // 使用 trim() 去除前后空格
	}
	//viewFullImage
	function viewFullImage(index) {
		uni.previewImage({
			current: goods.value.goods_images['index'],
			urls: goods.value.goods_images
		})
	}
	//跳转到用户页面
	function jump2user(uid) {
		uni.navigateTo({
			url: '/pages/user_page/user_page?uid=' + uid
		})
	}
	//加载商品
	getGoods();

	//加载搭配参考
	getCollocation()
	//获取登录
	asyncGetUserInfo().then((userInfo) => {
		console.log(userInfo)
		getHasLike()

	})
	// getUserInfo();
</script>

<style lang="scss" scoped>
	.collocationBox {
		width: 100%; // 避免使用 100vw（可能因滚动条导致宽度溢出）
		white-space: nowrap; // 强制子元素不换行
		overflow-x: auto; // 确保横向滚动生效（UniApp的scroll-view组件已封装滚动逻辑，此处为保险可保留）
		display: block; // 明确容器为块级元素
		margin-top: 15px;
		padding: 10px 0px;

		.collocationItem {
			position: relative;
			height: auto;
			/* 高度自动调整以保持比例 */
			aspect-ratio: 0.7;
			color: white;
			width: 22vw;
			display: inline-block;
			margin: 0px 20px 0px 0px;
			border-radius: 10px;
			overflow: hidden;

		}
	}

	.banner_swiper {
		// min-height: 45vh;
		// max-height: 55vh;
		position: relative;
	}

	.heart {
		position: absolute;
		top: 10px;
		right: 20px;
		z-index: 10;
		width: 50px;
		height: 30px;
		.uni-icons {
			width: 30px;
			height: 30px;
		}

		image {
			width: 30px;
			height: 30px;
		}

		.num {
			color: #888;
			font-size: 14px;
			display: inline-block;
			position: relative;
			margin: 10rpx;
			top: -5px;
			// left: 35px;
			font-weight: 1000;

		}
	}


	.banner_swiper_item {
	  height: auto; /* 允许高度自适应 */
	  
	}

	.swiper-item {
	  height: auto; /* 允许内容撑开高度 */
	  uni-image {
		      position: absolute;
		      top: -30rpx;
		      bottom: 0;
		      margin: auto;
	  }

	}
	  .banner_swiper_item {
		  // 图片不足高度时用灰色波点背景
		      height: auto;
		      background: #ffffff;
		    background-image: radial-gradient(#dfdfdf 20%, transparent 0);
		    background-size: 20px 20px;
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
	.mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: #fff;
		opacity: 0;
		z-index: 99;
		width: 100vw;
		height: 100vh;
	}
	// 底部tab
	.bottom_tab {
		display: flex;
		align-items: center;
		/* 垂直居中 */
		gap: 8px;
		/* 元素间距 */
		box-sizing: border-box;
		display: flex;
		align-items: center;
		padding: 10px;
		position: fixed;
		bottom: 0px;
		z-index: 100;
		width: 100vw;
		background: #fff;
		left: 0px;

		.replyInfo {
			flex-shrink: 0;
			/* 禁止缩小 */
			max-width: 50px;
			/* 最大宽度限制 */
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			flex-shrink: 0;
			max-width: 50px;
			margin-right: 8px;
		}

		.comment_input {
			flex: 1;
			/* 占据剩余空间 */
			min-width: 0;
			/* 允许缩小 */
			flex: 1;
			margin-right: 8px;
			height: 40px;
			border-radius: 5px;
			min-height: 30px;
			padding: 8px;
			box-sizing: border-box;
			background: #f2f2f2;
		}

		button {
			flex-shrink: 0;
			/* 固定宽度 */
			width: 90px;
			/* 按钮固定宽度 */
			background: rgb(100, 198, 220);
			border-radius: 10px;
			width: 90px;
			color: rgb(255, 255, 255);
			font-size: 14px;
		}
		
		uni-button:after {
			border: none;
		}
	}

	.uni-page-head {
		background: #ffffff00 !important;
	}

	.msg_body {
		border-radius: 30px;
		overflow: hidden;
		position: relative;
		top: -25px;
		background: #fff;
		padding: 20px;
		box-shadow: 0px -10px 10px #0000000d;

		.msg_block {
			font-size: 17px;
			color: #4cbbd0;
			margin: 20px 0px;
			display: flex;
			align-items: flex-start;

			.lable_text {
				width: 45%;
				font-size: 24rpx;
				display: inline-block;
				color: #4cbbd0;
				font-weight: bold;
			}

			.msg_text {
				width: 70%;
				font-size: 24rpx;
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