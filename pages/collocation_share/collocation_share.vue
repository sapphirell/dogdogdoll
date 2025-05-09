<template>
	<view>
		<!-- 图片轮播区域 -->
		<view style="position: relative;">
			<view class="heart" @click="likeFn()">
				<!-- 				<image src="../../static/heart-w.png" v-if="!hasLike"></image>
				<image src="../../static/heart2.png" v-else></image> -->
				<uni-icons type="heart" size="28" color="#ff4d4f" v-if="!hasLike"></uni-icons>
				<uni-icons type="heart-filled" size="28" color="#ff4d4f" v-else></uni-icons>

				<text class="num">{{ detailData?.like_count ? formatNumber(detailData.like_count) : 0 }}</text>
			</view>
			<swiper class="swiper-box" :indicator-dots="true" :autoplay="false">
				<swiper-item v-for="(img, index) in detailData.image_url_list" :key="index">
					<image :src="img" mode="aspectFill" class="swiper-image" @tap="viewFullImage(index)" />
				</swiper-item>
			</swiper>

		</view>
		<!-- 新增作者信息区域 -->
		<view class="author-info" @click="jump2user(detailData.uid)">
			<image class="avatar" :src="authorInfo.avatar" mode="aspectFill" />
			<view class="user-meta">
				<text class="username">{{ authorInfo.user_name || '未知用户' }}</text>
				<!-- 新增发布时间 -->
				<text class="publish-time">发布于 {{ formatTimestamp(detailData.created_at) }}</text>
			</view>
		</view>

		<!-- 图文信息区域 -->
		<view class="content-box">
			<text class="title">{{ detailData.title }}</text>
			<text class="content">{{ detailData.content }}</text>
		</view>

		<!-- 关联商品列表 -->
		<view class="goods-list">
			<!-- <text class="about">相关商品</text> -->
			<view v-for="item in detailData.collocation_relation_list" :key="item.id" class="goods-item"
				@click="item.relation_goods_id > 0 ? navigateToGoods(item.relation_goods_id) : null">
				<!-- 商品图片 -->
				<view class="image-container">
					<template v-if="item.relation_goods_id === 0">
						<view class="placeholder-box">
							<text style="color: #fff;font-size: 45px;">?</text>
						</view>
					</template>
					<template v-else>
						<image v-if="item.imageLoaded"
							:src="item.goodsInfo?.goods_images?.[0] || '/static/goods-default.png'" mode="aspectFill"
							class="goods-image" />
						<view v-else-if="item.imageError" class="error-box">
							<text>图片加载失败</text>
						</view>
						<view v-else class="loading-box">
							<text>加载中...</text>
						</view>
					</template>
				</view>

				<view class="goods-info">
					<text class="brand">{{ item.relation_brand_name }} - {{ item.relation_goods_name }}</text>
					<view>
						<text class="category">{{ item.type }}</text>
						<text class="price">
							（{{ item.goodsInfo && item.goodsInfo.total_amount ? item.goodsInfo.total_amount + item.goodsInfo.currency : "贩售价格未收录"}}）</text>
					</view>
					<view class="see font-alimamashuhei">
						去看看 →
					</view>

				</view>
			</view>
		</view>

		<!-- 评论区（保留原有结构，需根据接口调整） -->
		<view style="padding: 10px;" v-if="origin > 0">
			<comment-list ref="commentListRef" :type="origin == 1 ? 3 : 6" :relation-id="parseInt(pageId)"
				@reply="handleReplyComment" />
		</view> <!-- 加载状态 -->


		<!-- 输入框 -->
		<comment-input ref="commentInputRef" :reply-info="replyForItem" :target-id="pageId"
			@submit="handleCommentSubmit" @update:reply-info="val => replyForItem = val" />


		<view style="width: 100%;height: 120rpx;"></view>



		<!-- 加载状态 -->
		<view v-if="loading" class="loading">加载中...</view>
		<view v-if="error" class="error">{{ errorMsg }}</view>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted,
		computed,
	} from 'vue'
	import {
		onLoad,
		onShow,
		onHide,
	} from "@dcloudio/uni-app";
	import {
		websiteUrl,
		image1Url,
		wechatSignLogin,
		getUserInfo,
		global,
		asyncGetUserInfo,
		getScene,
	} from "../../common/config.js";

	import {
		chooseImage,
		jumpToCroper,
		getQiniuToken,
		uploadImageToQiniu
	} from "../../common/image.js";

	const detailData = ref({
		title: '',
		content: '',
		image_url_list: [],
		collocation_relation_list: []
	})

	// 新增作者信息响应式数据
	const authorInfo = ref({
		userName: '',
		avatar: ''
	})

	// 获取系统信息
	const systemInfo = uni.getSystemInfoSync()



	const loading = ref(true)
	const error = ref(false)
	const errorMsg = ref('')

	const props = defineProps({

		collocation_id: {
			type: String,
			default: 0
		},
		origin: {
			type: String,
			default: 0
		},
	})
	//页面id 
	const pageId = ref(0)
	const origin = ref(0)
	//是否点赞过
	let hasLike = ref(false)

	// 回复
	const commentListRef = ref(null) // 必须与模板中的ref名称一致
	const commentInputRef = ref(null) // 输入框聚焦状态联动
	let commentsPage = ref(1)
	//引用回复
	let replyForItem = ref({})


	// 设置页面标题
	uni.setNavigationBarTitle({
		title: '搭配详情'
	})

	//跳转到用户页面
	function jump2user(uid) {
		uni.navigateTo({
			url: '/pages/user_page/user_page?uid=' + uid
		})
	}


	// 获取商品详情
	const getGoodsInfo = (id) => {
		return new Promise((resolve, reject) => {
			if (!id || id === 0) {
				reject('无效的商品ID')
				return
			}

			uni.request({
				url: `${websiteUrl}/goods?id=${id}`,
				method: 'GET',
				timeout: 5000,
				success: (res) => {
					if (res.data.status === 'success') {
						resolve(res.data.data)
					} else {
						reject(res.data.msg || '获取商品信息失败')
					}
				},
				fail: (err) => {
					console.error(err)
					uni.showToast({
						title: '网络请求失败',
						icon: 'none'
					})
					reject(err)
				}
			})
		})
	}

	//viewFullImage
	function viewFullImage(index) {
		console.log(detailData)
		uni.previewImage({
			current: detailData.value.image_url_list[index],
			urls: detailData.value.image_url_list
		})
	}

	// 修改后的数据获取逻辑
	const fetchData = async (id, origin) => {
		try {
			const res = await uni.request({
				url: websiteUrl + `/view-collocation?collocation_id=${id}&origin=${origin}`,
			})

			if (res.data.status !== 'success') {
				handleError(res.data.msg || '数据加载失败')
				return
			}

			// 处理商品数据
			const processedData = {
				...res.data.data,
				image_url_list: Array.isArray(res.data.data.image_url_list) ?
					res.data.data.image_url_list : [res.data.data.image_urls],
				collocation_relation_list: await Promise.all(
					res.data.data.collocation_relation_list.map(async (item) => {
						try {
							// 仅当relation_goods_id有效时获取商品信息
							const goodsInfo = item.relation_goods_id > 0 ?
								await getGoodsInfo(item.relation_goods_id) :
								null

							return {
								...item,
								goodsInfo,
								imageLoaded: !!goodsInfo,
								imageError: !goodsInfo
							}
						} catch (error) {
							console.error('商品信息获取失败:', error)
							return {
								...item,
								goodsInfo: null,
								imageLoaded: false,
								imageError: true
							}
						}
					})
				)
			}

			detailData.value = processedData

			// 获取作者信息
			if (res.data.data?.uid) {
				await getAuthorInfo(res.data.data.uid)
			}

		} catch (error) {
			handleError('数据加载失败')
		} finally {
			loading.value = false
		}
	}
	// 商品点击跳转
	const navigateToGoods = (goodsId) => {
		//如果goodsId是0，提示商品暂时没有录入
		if (goodsId == 0) {
			uni.showToast({
				title: '商品暂时没有录入',
				icon: 'none'
			})
			return
		}
		uni.navigateTo({
			url: `/pages/goods/goods?goods_id=${goodsId}`
		})
	}

	// 新增获取用户信息方法
	const getAuthorInfo = async (uid) => {
		try {
			const res = await uni.request({
				url: `${websiteUrl}/user-info?uid=${uid}`,
				method: 'GET'
			})

			if (res.data.status === 'success') {
				authorInfo.value = res.data.data
			} else {
				console.error('获取用户信息失败:', res.data.msg)
			}
		} catch (error) {
			console.error('用户信息请求失败:', error)
			uni.showToast({
				title: '作者信息加载失败',
				icon: 'none'
			})
		}
	}

	// 新增跳转用户主页
	const navigateToUser = (uid) => {
		if (uid) {
			uni.navigateTo({
				url: `/pages/user/profile?uid=${uid}`
			})
		}
	}

	// 错误处理
	const handleError = (msg) => {
		error.value = true
		errorMsg.value = msg
		uni.showToast({
			title: msg,
			icon: 'none'
		})
	}

	//喜欢
	function likeFn() {
		let token = uni.getStorageSync('token');
		if (!global.isLogin) {
			uni.showToast({
				title: '请先登录',
				icon: 'none'
			})
			return
		}

		//区分type, origin=1,type=3   origin=2,type=4
		let type = origin.value == 1 ? 3 : 4

		let requestData = {
			id: parseInt(detailData.value.id),
			type: type,
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
					getHasLike(detailData.value.id)
					fetchData(detailData.value.id, origin.value)
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
	function getHasLike(id) {
		let token = uni.getStorageSync('token');
		if (token == "") {
			return
		}
		//区分type, origin=1,type=3   origin=2,type=4
		let type = origin.value == 1 ? 3 : 4
		uni.request({
			url: websiteUrl + '/with-state/hasLike?id=' + id + '&type=' + type,
			method: 'POST',
			header: {
				'Authorization': token,
			},
			success: (res) => {
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
	//格式化数字
	function formatNumber(num) {
		if (num < 1000) {
			return num.toString();
		} else {
			const kValue = Math.floor(num / 1000);
			return `${kValue}k+`;
		}
	}


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
			target_id: parseInt(pageId.value),
			type: props.origin == 1 ? 3 : 6,
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

	// 生命周期
	onShow(() => {
		if (process.env.VUE_APP_PLATFORM == "h5") {
			//h5不会弹出软键盘
			return
		}
		console.log("注册键盘弹出事件")
		uni.onKeyboardHeightChange(keyboardHeightChangeHandler)
	})


	// 获取路由参数
	onLoad((options) => {
		try {
			if (!options.collocation_id) {
				error.value = true
				errorMsg.value = '缺少必要参数Id'
				return
			}
			if (!options.origin) {
				error.value = true
				errorMsg.value = '缺少必要参数Origin'
				return
			}
			pageId.value = options.collocation_id
			origin.value = options.origin
			fetchData(options.collocation_id, options.origin)
			//获取登录
			asyncGetUserInfo().then((userInfo) => {
				console.log(userInfo)
				getHasLike(options.collocation_id)

			})
		
		} catch (err) {
			console.error('onLoad Error:', err)
			uni.showToast({
				title: '加载失败',
				icon: 'none'
			})
		}
	})
</script>

<style lang="less" scoped>
	// .container {
	// 	padding: 20rpx;
	// }

	.swiper-box {
		height: 750rpx;
	}

	.swiper-image {
		width: 100%;
		height: 100%;
	}

	/* 小红心 */
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
			color: #ff4d4f;

		}
	}


	/* 页面主体 */

	.content-box {
		padding: 30rpx 0;
	}

	.title {
		font-size: 28rpx;
		font-weight: 800;
		display: block;
		margin-bottom: 20rpx;
		padding: 30rpx 30rpx 0rpx 30rpx;
	}

	.content {
		display: inline-block;
		font-size: 22rpx;
		color: #666;
		line-height: 1.6;
		padding: 30rpx 30rpx 0rpx 30rpx;
		width: 100%;
		overflow: hidden;
		box-sizing: border-box;
	}

	.goods-list {
		margin-top: 40rpx;
		padding-top: 20rpx;
		background: linear-gradient(1deg, #ffffff 0%, #f7f7f7 100%);
	}

	.goods-item {
		display: flex;
		padding: 20rpx;
		padding-left: 40rpx;
		margin-bottom: 10rpx;
		background: #fff;
		border-radius: 12rpx;
		// box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
	}

	.goods-image {
		width: 100rpx;
		height: 100rpx;
		border-radius: 8rpx;
		margin-right: 30rpx;
	}

	.goods-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		position: relative;
	}

	.brand {
		font-size: 26rpx;
		font-weight: bold;
		color: #333;
	}

	.category {
		font-size: 22rpx;
		color: #666;
		display: inline-block;
	}

	.price {
		font-size: 22rpx;
		color: #666;
		display: inline-block;
	}

	.see {
		position: absolute;
		right: 0;
		font-size: 0.6875rem;
		color: #d1d1d1;
		background: linear-gradient(90deg, #ffffff 0%, #f4f4f4 100%);
		height: 60px;
		width: 106px;
		text-align: center;
		border-radius: 0 20px 20px 0;
		line-height: 60px;
		text-align: right;
		padding-right: 15px;
	}

	.name {
		font-size: 24rpx;
		color: #444;
	}

	.loading,
	.error {
		text-align: center;
		padding: 40rpx;
		font-size: 28rpx;
		color: #999;
	}

	/* 新增样式 */
	.image-container {
		width: 100rpx;
		height: 100rpx;
		margin-right: 30rpx;
		position: relative;
	}

	.placeholder-box,
	.error-box,
	.loading-box {
		width: 100%;
		height: 100%;
		background: #f5f5f5;
		border-radius: 8rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.error-box text,
	.loading-box text {
		font-size: 24rpx;
		color: #999;
	}

	.placeholder-box {
		background: #e0e0e0;
	}

	/* 新增作者信息样式 */
	.author-info {
		display: flex;
		align-items: center;
		padding: 30rpx 30rpx 0rpx 30rpx;
		margin: 20rpx 0;

		.avatar {
			width: 40px;
			height: 40px;
			border-radius: 100%;
			margin-right: 20rpx;
		}

		.user-meta {
			display: flex;
			flex-direction: column;
		}

		.username {
			font-size: 28rpx;
			font-weight: 900;
			color: #333;
			max-width: 400rpx;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		/* 新增发布时间样式 */
		.publish-time {
			font-size: 22rpx;
			color: #999;
			margin-top: 8rpx;
		}
	}

	// 底部tab
	.bottom_tab {
		display: flex;
		align-items: center;
		/* 垂直居中 */
		gap: 8px;
		/* 元素间距 */
		padding: 10px;
		box-sizing: border-box;
		left: 0px;
		position: fixed;
		bottom: 0px;
		z-index: 100;
		width: 100vw;
		background: #fff;

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
			font-size: 30rpx;
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

	uni-button:after {
		border: none;
	}

	.load_more {
		background: #fff;
		color: #d6d6d6;
		font-size: 13px;
		margin-top: 15px;

		&::after {
			border: none;
		}
	}

	text {
		font-size: 22rpx;
	}

	.about {
		font-size: 12px;
		color: rgb(136, 136, 136);
		margin: 0.625rem 0.3125rem;
		width: 100%;
		text-align: center;
		display: block;
		margin-top: 0rpx;
		font-weight: 800;
	}

	// 遮罩层
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
</style>