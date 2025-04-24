<template>
	<view>
		<!-- 图片轮播区域 -->
		<view style="position: relative;">
			<swiper class="swiper-box" :indicator-dots="true" :autoplay="false">
				<swiper-item v-for="(img, index) in detailData.image_list" :key="index">
					<image :src="img" mode="aspectFill" class="swiper-image" @tap="viewFullImage(index)" />
				</swiper-item>
			</swiper>
		</view>

		<!-- 品牌信息区域 -->
		<view class="brand-info">
			<image class="brand-logo" :src="brand.logo_image" mode="aspectFill" @tap="jump2brand(brand.id)" />
			<view class="brand-details" @tap="jump2brand(brand.id)" >
				<text class="brand-name">{{ brand.brand_name }}</text>
				<text class="publish-time">{{ formatTimestamp(detailData.created_at) }}</text>
			</view>


			<text class="follow" @click="likeBrand"
				:style="{ background: hasLikeBrand ? '#ff6a6c' : '#65C3D6' }">{{ hasLikeBrand ? '已关注' : '+ 关注品牌' }}</text>

		</view>

		<!-- 图文信息区域 -->
		<view class="content-box">
			<view>
				<text class="title">{{ detailData.title }}</text>
			</view>
			<view style="margin: 20rpx 0rpx;">
				<text class="content">{{ detailData.content }}</text>
			</view>
		</view>

		<!-- 评论区（保留原有结构，需根据接口调整） -->
		<view style="padding: 10px;">
			<text v-if="comments.total"
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
					
				</view>
				<view v-if="!comments.total" style="font-size: 12px;color: #888;margin: 20rpx 10rpx;width: 100%;text-align: center;">-    暂无回复    -</view>
				<button v-if="comments.total" class="load_more" @click="getCollocationComments">加载更多</button>
			</view>
		</view>	<!-- 加载状态 -->
		<view v-if="loading" class="loading">加载中...</view>
		<view v-if="error" class="error">{{ errorMsg }}</view>

		<!-- 当输入框聚焦后显示的蒙版层 -->
		<view class="mask" v-show=displayMask  @tap="handleMaskTap" ></view>
		<!-- 评论框 -->
		<view class="bottom_tab" :adjust-position="false" :style="{ paddingBottom : footerBottomHeight }">
			<!-- 回复信息 -->
			<text v-if="replyForItem.id" class="replyInfo" style="">
				{{'@' + replyForItem.username}}
			</text>

			<!-- 输入框 -->
			<textarea class="comment_input" v-model="myComment"  @click="handleFocus" @focus="handleFocus" @blur="handleBlur" style="" :adjust-position="false" ></textarea>

			<!-- 按钮 -->
			<button style="flex-shrink: 0; width: 90px;" @click="addComments">写评论</button>
		</view>
		

		<view style="width: 100%;height: 120rpx;"></view>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted,
		computed,
	} from 'vue'
	import {
		onLoad, onShow
	} from "@dcloudio/uni-app";
	import {
		websiteUrl,
		global,
		asyncGetUserInfo
	} from "../../common/config.js";

	const detailData = ref({
		title: '',
		content: '',
		image_list: [],
		created_at: 0
	})

	const brand = ref({
		brand_name: '',
		logo: '',
		// 其他品牌信息字段
	})
	// 蒙版层
	const displayMask = ref(false)

	const loading = ref(true)
	const error = ref(false)
	const errorMsg = ref('')
	const pageId = ref(0)
	const brandId = ref(0)
	const hasLikeBrand = ref(false)

	const comments = ref({})
	let myComment = ref("")
	let commentsPage = ref(1)
	//引用回复
	let replyForItem = ref({})
	// 获取系统信息
	const systemInfo = uni.getSystemInfoSync()
	const keyboardHeight = ref(0)
	// 底部安全区域高度
	const footerBottomHeight = computed(() => {
		// 通过系统信息获取安全区域值
		let safeBottom = systemInfo.safeAreaInsets?.bottom || 10
		if (keyboardHeight.value > 0) {
			safeBottom += keyboardHeight.value
		}
		let bottom = `${safeBottom}px` // 直接返回计算后的像素值
		console.log("footer-brand:" + bottom)
		return bottom
	})
	
	//replyFor 引用回复
	function replyFor(item) {
		//如果重复点击，清空
		if (replyForItem.value.id == item.id) {
			replyForItem.value = {}
			return
		}
	
		replyForItem.value = item;
	}
	
	
	// 处理键盘高度变化
	const keyboardHeightChangeHandler = (res) => {
		console.log("键盘高度变化", res)
		keyboardHeight.value = res.height
	}

	//遮罩层方法
	function handleFocus() {
	  displayMask.value = true;
	}
	
	function handleBlur() {
	  displayMask.value = false;
	}
	
	// 点击蒙版关闭键盘
	const handleMaskTap = () => {
	  displayMask.value = false;
	  uni.hideKeyboard(); // 调用API关闭键盘
	};
	
	//viewFullImage
	function viewFullImage(index) {
		uni.previewImage({
			current: goods.value.goods_images['index'],
			urls: goods.value.goods_images
		})
	}

	// 设置页面标题
	uni.setNavigationBarTitle({
		title: '图透详情'
	})
	function jump2brand(id) {
		uni.navigateTo({
			url: '/pages/brand/brand?brand_id=' + id
		})
	}
	
	//跳转到用户页面
	const jump2user = (uid) => {
	    uni.navigateTo({
	        url: '/pages/user_page/user_page?uid=' + uid
	    })
	}
	// 获取图透评论
	function getCollocationComments() {
		uni.request({
			url: websiteUrl + '/sale-news-comments?id=' + pageId.value + "&page=" + commentsPage
				.value,
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

	// 获取图透详情
	const fetchNewsDetail = async (id) => {
		try {
			const res = await uni.request({
				url: `${websiteUrl}/sale-news-detail?id=${id}`,
				timeout: 5000
			})

			if (res.data.status === 'success') {
				detailData.value = {
					...res.data.data,
					image_list: res.data.data.image_list || []
				}
				getBrandsInfo()
			} else {
				handleError(res.data.msg || '数据加载失败')
			}
		} catch (err) {
			handleError('网络请求失败')
		} finally {
			loading.value = false
		}
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
			target_id: parseInt(pageId.value),
			type: 4,
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
					getCollocationComments();
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

	// 获取品牌信息
	const getBrandsInfo = () => {
		uni.request({
			url: websiteUrl + '/brand-info?id=' + brandId.value,
			success: (res) => {
				if (res.data.status === 'success') {
					brand.value = res.data.data
					uni.setNavigationBarTitle({
						title: res.data.data.brand_name
					})
					getHasLikeBrand()
				}
			},
			fail: () => handleError('品牌信息加载失败')
		})
	}

	// 品牌关注功能
	const likeBrand = async () => {
		if (!global.isLogin) {
			uni.showToast({
				title: '请先登录',
				icon: 'none'
			})
			return
		}

		const url = `/with-state/${hasLikeBrand.value ? 'unlike' : 'add-like'}`
		uni.request({
			url: websiteUrl + url,
			method: 'POST',
			header: {
				Authorization: uni.getStorageSync('token')
			},
			data: {
				id: parseInt(brandId.value),
				type: 2 // 假设2代表品牌类型
			},
			success: (res) => {
				if (res.data.status === 'success') {
					hasLikeBrand.value = !hasLikeBrand.value
					uni.showToast({
						title: hasLikeBrand.value ? '关注成功' : '已取消关注',
						icon: 'none'
					})
				}
			}
		})
	}

	// 检查关注状态
	const getHasLikeBrand = () => {
		if (!global.isLogin) return

		uni.request({
			url: `${websiteUrl}/with-state/hasLike?id=${brandId.value}&type=2`,
			method: 'POST',
			header: {
				Authorization: uni.getStorageSync('token')
			},
			success: (res) => {
				hasLikeBrand.value = res.data.data?.id > 0
			}
		})
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

	// 初始化加载
	onLoad((options) => {
		if (!options.id || !options.brand_id) {
			handleError('缺少必要参数')
			return
		}
		pageId.value = options.id
		brandId.value = options.brand_id
		fetchNewsDetail(options.id)
		getCollocationComments()
		asyncGetUserInfo().then(getHasLikeBrand)
	})
</script>

<style lang="less" scoped>
	.swiper-box {
		height: 750rpx;
	}

	.swiper-image {
		width: 100%;
		height: 100%;
	}

	.brand-info {
		display: flex;
		align-items: center;
		padding: 28rpx;
		background: #fff;
		border-bottom: 1px solid #eee;

		.brand-logo {
			width: 80rpx;
			height: 80rpx;
			border-radius: 50%;
			margin-right: 20rpx;
		}

		.brand-details {
			flex: 1;

			.brand-name {
				font-size: 28rpx;
				font-weight: bold;
				display: block;
			}

			.publish-time {
				font-size: 22rpx;
				color: #888;
			}
		}

		.follow-btn {
			padding: 0 30rpx;
			height: 60rpx;
			line-height: 60rpx;
			font-size: 28rpx;
			border-radius: 30rpx;
			background: #f0f0f0;
			color: #666;

			&[class*='active'] {
				background: #64c6dc;
				color: #fff;
			}
		}
	}

	.content-box {
		padding: 30rpx;

		.title {
			font-size: 28rpx;
			font-weight: bold;
			margin-bottom: 20rpx;
		}

		.content {
			font-size: 22rpx;
			color: #666;
			line-height: 1.6;
		}
	}

	.loading,
	.error {
		text-align: center;
		padding: 40rpx;
		font-size: 28rpx;
		color: #999;
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
			background: #f2f2f2;
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
	
	text {
		font-size: 22rpx;
	}
</style>