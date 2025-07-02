<template>
	<view>
		<meta name="theme-color" content="#F8F8F8">
		</meta>
		<image :src="brand.logo_image" mode="aspectFit" class="brand_logo"></image>
		<view class="body">
			<view>
				<image :src="brand.brand_name_image" mode="heightFix" style="height: 60rpx;"></image>
				<text style="float: right;margin: 5px 0px;">{{brand.country_name}} / {{brand.type}}</text>
				<view style="clear: both;"></view>
			</view>

			<!-- 优化后的评分区域 -->
			<view
				style="margin: 20rpx 0rpx;display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;">
				<view style="display: flex; align-items: center; flex-grow: 1;">
					<uni-rate style="margin-top: 5px;" :value="brand.score" allow-half="true" 
						activeColor="#65C3D6" @change="onRateChange" is-fill="false" />
					<text style="margin-left: 8rpx; position: relative; top: 5px;">
						{{brand.score}}（{{brand.vote_number}}次评分)
					</text>
				</view>
				<text class="follow" @click="likeBrand" :style="{ background: hasLikeBrand ? '#ff6a6c' : '#65C3D6' }">
					{{ hasLikeBrand ? '已关注' : '+ 关注品牌' }}
				</text>
			</view>

			<view style="margin-top: 15px;">
				<text>别名：{{brand.nickname_list}}</text>
			</view>
			<view style="margin-top: 10px;">
				<text>简介：{{brand.description}}</text>
			</view>
			<div style="clear: both;"></div>
			<!-- 品牌商品列表 -->
			<text style="color: rgb(100, 198, 220);display: block;margin: 20px 0px;">收录作品 ({{goods.total}})</text>
			<view class="brand_goods">
				<view class="brand_goods_item" style="" v-for="(item, index) in goods.goods_list" :key="item.id">
					<navigator @click="jumpGoods(item.id)" style="width: 100%;height: 100%;">
						<view style="width: 100%;height: calc(100% - 20px)">
							<image style="width: 100%;height: 100%;" :src="item.goods_images[0]" mode="aspectFill"
								class="brand_goods_image"></image>
						</view>
						<text
							style="display: block;width: 100%;text-align: center;font-weight: 900;color: #586f88">{{item.name}}</text>
					</navigator>
				</view>
			</view>
			<button class="load_more" @click="getBrandGoods">加载更多</button>

			<!-- 品牌图透模块 -->
			<text class="section-title">品牌图透 ({{newsPage.total}})</text>
			<view class="news-list">
				<view class="news-item" style="position: relative;" v-for="(item, index) in newsList" :key="item.id">
					<view class="news-header">
						<text class="news-header-title">{{item.title}}</text>
					</view>

					<!-- 添加轮播图 -->
					<view class="news-images" v-if="item.image_list && item.image_list.length > 0">
						<swiper class="image-swiper" :autoplay="true" :circular="true" indicator-dots>
							<swiper-item v-for="(img, imgIndex) in item.image_list" :key="imgIndex">
								<image :src="img" mode="aspectFill" class="swiper-image" @tap="viewFullImage(img, item.image_list)" />
							</swiper-item>
						</swiper>
					</view>

					<view class="news-content">{{item.content}}</view>

					<!-- 添加品牌标签 -->
					<view class="news-footer">
						<text class="news-time">{{formatTimestamp(item.created_at)}}</text>
						<text class="view-more" @click="jump2saleNews(item)">查看详情 →</text>
					</view>
				</view>
			</view>


			<view>
				<!-- 评论区 -->
				<comment-list ref="commentListRef" :type="1" :relation-id="parseInt(props.brand_id)"
					@reply="handleReplyComment" />

			</view>

		</view>
		<!-- 一个不可见透明元素，撑起80px高度 -->
		<view style="height: 80px;"></view>

		<!-- 输入框 -->
		<comment-input ref="commentInputRef" :reply-info="replyForItem" :target-id="props.brand_id"
			@submit="handleCommentSubmit" @update:reply-info="val => replyForItem = val" />


	</view>
</template>

<script setup>
	import {
		ref,
		watch,
		computed,

	} from 'vue';
	import {
		websiteUrl,
		wechatSignLogin,
		getUserInfo,
		global,
		voteScore,
		getScene,
	} from "../../common/config.js";
	import {
		onShow,
		onHide,
	} from "@dcloudio/uni-app";


	const props = defineProps(["brand_id"])
	console.log(props)

	const hasLikeBrand = ref(false)
	let newsList = ref([]); // 图透列表
	let newsPage = ref({
		page_index: 1, // 当前页码
		page_size: 3, // 每页数量
		total: 0, // 总数
	});

	uni.showLoading({
		title: '加载中'
	})


	// 获取系统信息
	const systemInfo = uni.getSystemInfoSync()

	let rateValue = ref(0)
	const myRateValue = ref(0)
	// 回复
	const commentListRef = ref(null) // 必须与模板中的ref名称一致
	const commentInputRef = ref(null) // 输入框聚焦状态联动
	let commentsPage = ref(1)
	//引用回复
	let replyForItem = ref({})

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
			target_id: parseInt(props.brand_id),
			type: 1,
			...(replyInfo.id && {
				reply_id: replyInfo.id,
				reply_for: replyInfo.comment,
				reply_user_id: replyInfo.user_id,
				parent_id: replyInfo.parent_id > 0 ? replyInfo.parent_id : replyInfo.id,
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
	// 新增方法：处理评分变化
	const onRateChange = (e) => {
		console.log(e)
		if (!global.isLogin) {
			uni.showToast({
				title: '请先登录',
				icon: 'none'
			})
			// 重置评分
			rateValue.value = 0;
			return
		}
		rateValue.value = e.value
		myRateValue.value = e.value
		voteScoreProxy();
	}


	// 修改后的评分提交方法
	async function voteScoreProxy() {
		if (rateValue.value == 0) {
			uni.showToast({
				title: '请先评分',
				icon: 'none'
			})
			return
		}

		try {
			// 直接使用请求代替 voteScore 函数
			let token = uni.getStorageSync('token');
			if (!token) {
				uni.showToast({
					title: '请先登录',
					icon: 'none'
				})
				return;
			}

			uni.showLoading({
				title: '提交中...'
			})

			const res = await uni.request({
				url: websiteUrl + '/with-state/add-vote-score',
				method: 'POST',
				header: {
					'Authorization': token,
					'Content-Type': 'application/json'
				},
				data: {
					type: 1,
					score: rateValue.value,
					target_id: parseInt(props.brand_id)
				}
			})

			uni.hideLoading();

			if (res.data.status === 'success') {
				// 提交成功后刷新品牌信息
				getBrandsInfo()
				uni.showToast({
					title: '评分成功',
					icon: 'success'
				})
			} else {
				uni.showToast({
					title: res.data.msg || '评分失败',
					icon: 'none'
				})
			}
		} catch (err) {
			uni.hideLoading();
			console.error('评分失败:', err)
			uni.showToast({
				title: '评分失败，请重试',
				icon: 'none'
			})
		}
	}

	// 添加获取品牌图透的方法
	function getBrandNews() {
		uni.request({
			url: `${websiteUrl}/brand-news-list?brand_id=${props.brand_id}&page=${newsPage.value.page_index}&page_size=${newsPage.value.page_size}`,
			method: 'GET',
			success: (res) => {
				if (res.data.status === "success") {
					const data = res.data.data;
					// 合并数据
					newsList.value = [...newsList.value, ...data.news_list];
					newsPage.value.total = data.total;
					// 页码增加
					if (data.news_list.length > 0) {
						newsPage.value.page_index += 1;
					}
				} else {
					uni.showToast({
						title: res.data.msg || '获取图透失败',
						icon: 'none'
					});
				}
			},
			fail: (err) => {
				uni.showToast({
					title: '网络请求失败',
					icon: 'none'
				});
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

	function getBrandsInfo() {
		uni.request({
			url: websiteUrl + '/brand-info?id=' + props.brand_id,
			method: 'GET',
			timeout: 5000,
			success: (res) => {
				console.log(res.data.data);
				brand.value = res.data.data;
				//修改页面标题
				uni.setNavigationBarTitle({
					title: res.data.data.brand_name
				})
				getHasLikeBrand() // 新增检查关注状态

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

	// 品牌关注方法
	const likeBrand = async () => {
		let token = uni.getStorageSync('token')
		if (!global.isLogin) {
			uni.showToast({
				title: '请先登录',
				icon: 'none'
			})
			return
		}

		try {
			const url = `${websiteUrl}/with-state/${hasLikeBrand.value ? 'unlike' : 'add-like'}`
			const res = await uni.request({
				url,
				method: 'POST',
				header: {
					Authorization: token
				},
				data: {
					id: parseInt(props.brand_id),
					type: 2 // 注意：品牌类型可能需要确认，这里假设2代表品牌
				}
			})

			if (res.data.status === "success") {
				hasLikeBrand.value = !hasLikeBrand.value
				uni.showToast({
					title: hasLikeBrand.value ? '关注成功' : '已取消关注',
					icon: 'none'
				})
				// 更新品牌信息
				getBrandsInfo()
			} else {
				uni.showToast({
					title: res.data.msg,
					icon: 'none'
				})
			}
		} catch (err) {
			console.error(err)
			uni.showToast({
				title: '操作失败',
				icon: 'none'
			})
		}
	}

	// 检查是否已关注
	const getHasLikeBrand = async () => {

		try {
			const res = await uni.request({
				url: `${websiteUrl}/with-state/hasLike?id=${parseInt(props.brand_id)}&type=2`,
				method: 'POST',
				header: {
					Authorization: uni.getStorageSync('token')
				},
			})

			hasLikeBrand.value = res.data.data?.id > 0
		} catch (err) {
			console.error('获取关注状态失败:', err)
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
		// return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
		return `${year}-${month}-${day} ${hours}:${minutes}`;
	}

	function getBrandGoods() {
		uni.request({
			url: websiteUrl + '/brand-goods?brand_id=' + props.brand_id + "&page=" + page.value,
			method: 'GET',
			timeout: 5000,
			success: (res) => {
				console.log(res.data.data);
				goods.value.page_index = res.data.data.page_index;
				goods.value.total = res.data.data.total;
				goods.value.goods_list = goods.value.goods_list ? goods.value.goods_list.concat(res.data.data
					.goods_list) : res.data.data.goods_list;
				//如果返回的列表size大于0，页码增加
				if (res.data.data.goods_list.length > 0) {
					page.value += 1
				}
				//如果返回的列表size等于0，且page>1提示无更多数据
				if (res.data.data.goods_list.length == 0 && page.value > 1) {
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





	//提交评论
	function addComments() {
		let token = uni.getStorageSync('token')
		if (!token) {
			uni.showToast({
				title: '请先登录',
				icon: 'none'
			})
			return
		}
		if (comment.value == "") {
			uni.showToast({
				title: '请输入评论内容',
				icon: 'none'
			})
			return
		}

		let scene = getScene()
		uni.request({
			url: websiteUrl + '/with-state/add-comment',
			method: 'POST',
			header: {
				'Authorization': token,
			},
			data: {
				//props.brand_id转为int
				target_id: parseInt(props.brand_id),
				content: comment.value,
				type: 1,
				origin: scene,
			},
			success: (res) => {
				console.log(res.data);
				if (res.data.status == "success") {
					uni.showToast({
						title: '评论成功',
						icon: 'success'
					})
					//清空评论
					comment.value = ""
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
	
	//viewFullImage
	function viewFullImage(currentUrl, allUrl) {
		uni.previewImage({
			current: currentUrl,
			urls: allUrl
		})
	}
	

	function getMyScore(type, targetId) {
		let token = uni.getStorageSync('token')
		if (!token) {
			return 0;
		}
		if (!global.isLogin) {
			return 0;
		}
		uni.request({
			url: websiteUrl + '/with-state/my-vote-record',
			method: 'GET',
			header: {
				'Authorization': token,
				'Content-Type': 'application/json',
			},
			data: {
				target_id: parseInt(targetId),
				type: type
			},
			success: (res) => {
				console.log(res.data.data);
				if (res.data.status == "success") {
					myRateValue.value = res.data.data.score;
					return res.data.data.score;
				} else {
					uni.showToast({
						title: res.data.msg,
						icon: 'none'
					})
					return 0
				}
			},
			fail: (err) => {
				console.log(err);
				uni.showToast({
					title: '网络请求失败',
					icon: 'none'
				})
				return 0
			},
		});
	}

	//跳转到商品页
	// 跳转商品页
	function jumpGoods(id) {
		uni.navigateTo({
			url: '/pages/goods/goods?goods_id=' + id
		})
	}
	//跳转到用户页面
	function jump2user(uid) {
		uni.navigateTo({
			url: '/pages/user_page/user_page?uid=' + uid
		})
	}

	function jump2saleNews(item) {
		uni.navigateTo({
			url: `/pages/sale_news/sale_news?id=${item.id}&brand_id=${item.brand_id}`
		})
	}

	let goods = ref({})
	//brand page
	let page = ref(1)
	let brand = ref({})




	// 在onShow中添加评分刷新
	onShow(() => {
		// 登录
		getUserInfo()
		// 获取品牌信息
		getBrandsInfo()
		// 获取品牌娃娃列表
		getBrandGoods()
		// 获取品牌图透
		getBrandNews();
		if (global.isLogin) {
			// 获取我的评分
			getMyScore(1, props.brand_id)
		} else {
			rateValue.value = 0
		}
	})
</script>

<style lang="less" scoped>
	.brand_logo {
		width: calc(100vw - 10px);
		display: block;
		margin: 5px;
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
		gap: 16px;
		/* 设置元素之间的间距 */
		// padding: 8px; /* 避免元素贴边 */

		.brand_goods_item {
			flex: 1 1 calc(33.33% - 12px);
			/* 固定每个元素宽度为 33.33% */
			width: calc(33.33% - 12px);
			/* 设置最大宽度 */
			max-width: calc(33.33% - 12px);
			height: 140px;
			/* 示例高度，可根据需求调整 */
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

	.follow {
		padding: 12rpx 30rpx;
		border-radius: 20rpx;
		overflow: hidden;
		display: inline-block;
		color: #ffffff;
		font-size: 11px;
		margin-left: 80rpx;
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
		box-shadow: 0px -10px 12px rgba(0, 0, 0, 0.05);
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

	.load_more::after {
		border: none;
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
			height: 30px;
			border-radius: 5px;
			min-height: 30px;
			padding: 8px;
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

	// //评分弹框
	// .modal_shadow {
	//     position: fixed;
	//     z-index: 15;
	//     background: rgba(0, 0, 0, 0.2);
	// 	backdrop-filter: blur(10px);
	// 	-webkit-backdrop-filter:blur(10px);
	//     width: 100vw;
	//     height: 100vh;
	//     top: 0;
	//     left: 0;
	// 	pointer-events: all;
	// 	.modal_box {
	// 		position: fixed;
	// 		background: rgb(255, 255, 255);
	// 		top: 15%;
	// 		width: 60vw;
	// 		height: 20vh;
	// 		margin: 0px auto;
	// 		left: 50%;
	// 		transform: translate(-50%, 0%);
	// 		padding: 20px;
	// 		box-shadow: 0 0 5px #00000045;
	// 		border-radius: 20px;
	// 	}
	// }
	.rate-container {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 0;
	}

	/* 调整关注按钮位置 */
	.follow {
		padding: 12rpx 30rpx;
		border-radius: 20rpx;
		color: #ffffff;
		font-size: 11px;
		flex-shrink: 0;
		/* 防止按钮被挤压 */
		margin-left: 20rpx;
	}

	//按钮
	.light_button {
		color: #fff;
		background: #65C3D6;
		box-shadow: 0 0 3px #1ed1e1;
		border: 0px;
		margin: 20px 0px;
		border-radius: 15px;

	}

	.light_button:active {
		background: #4e98a9;
	}

	.none {
		display: none;
	}

	// 品牌图透列表样式
	// 更新样式部分
	.news-list {

		.news-item {
			background: #fff;
			border-radius: 16rpx;
			margin-bottom: 30rpx;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

			.news-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 20rpx;
				position: absolute;
				z-index: 9;
				width: 100%;

				.news-title {
					font-size: 32rpx;
					color: #333;
					font-weight: bold;
					max-width: 70%;
				}

				.news-time {
					font-size: 24rpx;
					color: #b1b1b1;
					font-weight: bold;
					padding: 5rpx;
				}
			}

			.image-swiper {
				height: 500rpx;
				border-radius: 12rpx;
				overflow: hidden;
				margin-bottom: 20rpx;

				.swiper-image {
					width: 100%;
					height: 100%;
				}
			}

			.news-content {
				font-size: 28rpx;
				color: #666;
				line-height: 1.6;
				margin-bottom: 20rpx;
			}

			.news-footer {
				display: flex;
				justify-content: space-between;
				align-items: center;
				border-top: 1rpx solid #eee;
				padding: 15rpx;
				padding-top: 20rpx;

				.brand-tag {
					background: #4cbbd0;
					color: #fff;
					padding: 8rpx 16rpx;
					border-radius: 6rpx;
					font-size: 24rpx;
				}

				.view-more {
					color: #4cbbd0;
					font-size: 24rpx;
					padding: 8rpx 16rpx;
				}
			}
		}

		.load_more {
			background: #f8f9fa;
			color: #666;
			border: none;
			border-radius: 40rpx;
			margin: 30rpx auto;
			width: 80%;
			height: 80rpx;
			line-height: 80rpx;
			font-size: 28rpx;

			&::after {
				border: none;
			}
		}
	}

	.section-title {
		color: rgb(100, 198, 220);
		display: block;
		margin: 20px 0px;
	}

	// 图透标题样式
	.hd {
		margin: 0;
		font-family: 'Nosifer', cursive;
		font-size: 2em;
		color: transparent;
		background: linear-gradient(to right, #fff, #96c2ff, #a77a7a);
		-webkit-text-fill-color: transparent;
		background-clip: text;
		-webkit-background-clip: text;
		position: relative;
		letter-spacing: 0.4rem;
		font-style: italic;
	}

	.hd::before,
	.hd::after {
		content: attr(data-text);
		position: absolute;
		top: 0;
		left: 0;
		color: transparent;
		-webkit-text-stroke: 12px #000;
		z-index: -1;
	}

	.hd::after {
		-webkit-text-stroke: 17px #fff;
		z-index: -2;
	}

	.news-header-title {
		text-shadow: 3px 0 #000000,
			-3px 0 #000,
			0 3px #000,
			0 -3px #000,
			3px 3px #000,
			-3px -3px #000,
			3px -3px #000,
			-3px 3px #000;
		color: #fff;
		font-size: 30rpx;
		font-weight: bold;
		margin: 10rpx 20rpx;
		display: inline-block;
	}
</style>