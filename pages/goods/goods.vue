<template>

	<view v-if="goods.name">
		<view>
			<!-- 轮播图部分 -->
			<view style="position: relative;">
				<view class="heart" @click="likeFn()">
					<image src="../../static/heart-w.png" v-if="!hasLike"></image>
					<image src="../../static/heart2.png" v-else></image>
					<text>{{ formatNumber(goods.goods_like_count) }}</text>
				</view>
				<swiper :interval="3000" :duration="200" @change="onChange" class="banner_swiper">
					<block v-for="(item, key) in goods.goods_images" :key="key">
						<swiper-item class="banner_swiper_item">
							<view class="swiper-item">
								<image :src="item" mode="widthFix" style="width: 100vw;min-height: 25vh;"
									@tap="viewFullImage(key)"></image>
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
					<text v-for="sale in goods.goods_sales" :key="sale.id"
						style="width: 100%;display: block;margin-bottom: 10px;">
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
			<view style="display: flex;margin: 30px 5px 10px 5px;">
				<text
					style="color: rgb(100, 198, 220);font-weight: bold; display: block;width: calc(100% - 85px);">搭配参考</text>
				<view style="display: flex;">
					<text style="width: 70px;display: inline-block;color: #888;">查看更多</text>
					<image src="../../static/right2.png" style="width: 20px;height: 20px;display: inline-block;">
					</image>
				</view>

			</view>

			<scroll-view scroll-x="true" class="collocationBox" ll-with-animation="true" :show-scrollbar="false">
				<!-- 遍历搭配参考 -->
				<view v-if="collocationList && collocationList.collocation_relation_list.length > 0"
					v-for="collocation in collocationList.collocation_relation_list" :key="collocation.collocation_id"
					style="" class="collocationItem square" @tap="jump2collectionDetail(collocation.collocation_id)">
					<image :src="getImageForList(collocation.image_urls)" mode="aspectFill"
						style="width: 100%;height: 100%;"></image>

				</view>
			</scroll-view>

			<view @tap="jump2collocation"
				style="border: 1px solid #eaeaea; display: flex;margin: 20px 60px; 0px 0px 0px;border-radius: 15px;">
				<image src="../../static/paper_plane.png" style="width: 25px;height: 25px;margin: 13px;"></image>
				<text style=";color: rgb(184 184 184);margin: 15px auto;">上传搭配参考帮助他人</text>
			</view>
		</view>

		<!-- 讨论 -->
		<view style="padding: 20px;">
			<text
				style="color: rgb(100, 198, 220);font-weight: bold; isplay: block;margin: 30px 5px;display: block;">评论区
				({{comments.total || 0}})</text>
			<view>
				<view v-if="comments.comment_list">
					<view class="comment_item" v-for="(item,index) in comments.comment_list" :key="item.id"
						style="margin-bottom: 20px;">
						<view style="float: left; width: 80px;padding: 0px 10px 10px 0px;" @tap="jump2user(item.uid)">
							<image style="width: 50px;height: 50px;border-radius: 100%;display: block;margin: 10px;"
								:src="item.avatar" mode="aspectFill"></image>
							<text
								style="display: block;white-space: nowrap;overflow: hidden;text-overflow: ellipsis; ">{{item.username}}</text>
						</view>

						<view
							style="float: left;padding: 15px 15px 30px 15px;background: rgb(245 245 245);width: calc(100vw - 170px);min-height: 60px;border-radius: 15px;position: relative;top:2px;">
							<!-- <text class="floor" style="position: absolute;top: -12px;right: 10px;color: #888;font-size: 20px;">#{{item.floor}}</text> -->
							<text
								style="width: 100%; white-space: normal;word-break: break-all;">{{item.comment}}</text>

							<!-- 格式化时间戳created_at为日期 -->
							<text
								style="color: #888;font-size: 12px;position: absolute;bottom: 3px;left: 15px;">{{formatTimestamp(item.created_at)}}
								floor#{{item.floor}}</text>
							<!-- 引用此回复 -->
							<text :style="[
									{ fontSize: '12px', position: 'absolute', bottom: '3px', right: '15px' ,fontWeight: '1000'},
									replyForItem.id === item.id ? { color: '#fd6669' } : { color: '#888' }
								  ]" @tap="replyFor(item)">
								引用此回复
							</text>
						</view>
						<view style="clear: both;"></view>
					</view>
					<button class="load_more" @click="getBrandComments">加载更多</button>
				</view>
			</view>
		</view>
		<!-- 一个不可见透明元素，撑起80px高度 -->
		<view style="height: 80px;"></view>

		<view class="bottom_tab" :style="{ paddingBottom : footerBottomHeight }">
			<!-- 回复信息 -->
			<text v-if="replyForItem.id" class="replyInfo" style="">
				{{'@' + replyForItem.username}}
			</text>

			<!-- 输入框 -->
			<textarea class="comment_input" v-model="myComment" style="" :adjust-position="false" ></textarea>

			<!-- 按钮 -->
			<button style="flex-shrink: 0; width: 90px;" @click="addComments">写评论</button>
		</view>
	</view>


</template>

<script setup>
	import {
		ref,
		watch,
		computed,

	} from 'vue';
	import {
		asyncGetUserInfo
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
	const keyboardHeight = ref(0)

	// 处理键盘高度变化
	const keyboardHeightChangeHandler = (res) => {
		console.log(res)
		keyboardHeight.value = res.height
	}

	// 生命周期
	onShow(() => {
		if (process.env.VUE_APP_PLATFORM) {
			//h5不会弹出软键盘
			return
		}
		uni.onKeyboardHeightChange(keyboardHeightChangeHandler)
	})

	onHide(() => {
		if (process.env.VUE_APP_PLATFORM) {
			//h5不会弹出软键盘
			return
		}
		uni.offKeyboardHeightChange?.(keyboardHeightChangeHandler) // 更精准的卸载
	})
	// 底部安全区域高度
	const footerBottomHeight = computed(() => {
		// 通过系统信息获取安全区域值
		let safeBottom = systemInfo.safeAreaInsets?.bottom || 10
		if (keyboardHeight.value > 0) {
			safeBottom += keyboardHeight.value
		}
		let bottom = `${safeBottom}px` // 直接返回计算后的像素值
		console.log("footer:" + bottom)
		return bottom
	})


	let goods = ref({})
	let comments = ref({})
	let commentsPage = ref(1)
	let swiperIndex = ref(1)
	let myComment = ref("")
	//是否点赞过这个商品
	let hasLike = ref(false)
	//搭配参考列表
	let collocationList = ref(false)

	//引用回复
	let replyForItem = ref({})


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

	function getBrandComments() {
		uni.request({
			url: websiteUrl + '/goods-comment?goods_id=' + props.goods_id + "&page=" + commentsPage.value,
			method: 'GET',
			timeout: 5000,
			success: (res) => {
				console.log(res.data.data);
				comments.value.page_index = res.data.data.page_index;
				comments.value.total = res.data.data.total;
				comments.value.comment_list = comments.value.comment_list ? comments.value.comment_list.concat(
					res.data.data.comment_list) : res.data.data.comment_list;
				//如果返回的列表size大于0，页码增加
				if (res.data.data.comment_list != null) {
					if (res.data.data.comment_list.length > 0) {
						commentsPage.value += 1
					}
					//如果返回的列表size等于0，且page>1提示无更多数据
					if (res.data.data.comment_list.length == 0 && commentsPage.value > 1) {
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
		let requestData = {
			content: myComment.value,
			target_id: parseInt(props.goods_id),
			type: 2,
		}
		//是否有引用内容，如果有引用内容，需要同步
		if (replyForItem.value.id) {
			requestData.reply_id = replyForItem.value.id
			requestData.reply_for = replyForItem.value.comment
			requestData.reply_user_id = replyForItem.value.user_id
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
	function jump2collectionDetail(collocation_id) {
		uni.navigateTo({
			url: '/pages/collocation_share/collocation_share?collocation_id=' + collocation_id
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
	//加载评论
	getBrandComments();
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
		height: 45vh;
		position: relative;
	}

	.heart {
		position: absolute;
		top: 10px;
		right: 20px;
		z-index: 10;
		width: 50px;
		height: 30px;

		image {
			width: 30px;
			height: 30px;
		}

		text {
			color: #fff;
			font-size: 14px;
			position: absolute;
			top: 5px;
			left: 35px;
			font-weight: 1000;

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
			height: 30px;
			border: 1px solid #ddd;
			border-radius: 5px;
			min-height: 30px;
			padding: 8px;
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