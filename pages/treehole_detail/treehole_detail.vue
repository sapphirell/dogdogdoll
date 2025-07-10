<template>
	<view class="container" v-if="detailData">
		<meta name="theme-color" content="#F8F8F8"></meta>
		<view-logs />
		<!-- 头部作者信息 -->
		<view class="header">
			<view class="author-info">
				<image :src="detailData.avatar || '/static/noname.png' " class="avatar" mode="aspectFill" />
				<view style="width: 500rpx;">
					<text class="author-name">{{ detailData.author_name }}</text>
					<view class="time">{{ formatTime(detailData.created_at) }}</view>
				</view>
				<!-- 举报按钮 -->
				<view style="width: 120rpx;">
					<report-button
						report-type="3" 
						:relation-id="parseInt(props.id)" 
						button-text="举报" 
						icon-type="flag" 
						icon-size="24"
						icon-color="#666"
					/>
				</view>
			  

			</view>
			<!-- 			<button class="share-btn" open-type="share">
				<image src="/static/images/share-icon.png" class="share-icon" />
			</button> -->
		</view>

		<!-- 正文内容 -->
		<view class="content">{{ detailData.content }}</view>

		<!-- 图片展示区域 -->
		<view class="image-container" :class="layoutClass">
			<view v-for="(img, index) in displayImages" :key="index" class="image-wrapper">
				<image :src="img" mode="aspectFill" class="image-item" @click="previewImage(index)" />
				<view v-if="showOverlay && index === 8" class="image-overlay">
					+{{ remainingCount }}
				</view>
			</view>
		</view>

		<view class="action-bar">
			<view class="action-group">
				<view class="action-item" @tap="handleLike">
					<uni-icons :type="hasLiked ? 'hand-up-filled' : 'hand-up'" size="24"
						:color="hasLiked ? '#ff4d4f' : '#666'" />
					<text class="action-text">{{ detailData.like_count || 0 }}</text>
				</view>
				<view class="action-item" @tap="copyUrl(detailData)">
					<uni-icons type="redo" size="24" color="#666" />
					<text class="action-text">分享</text>
				</view>
			</view>
			<text class="time-text" v-if="detailData.approve_time > 0">审核于 {{ formatTime(detailData.approve_time) }}</text>
			
		</view>
	</view>

	<!-- 加载状态 -->
	<view v-else class="loading">加载中...</view>

	<!-- 评论区（保留原有结构，需根据接口调整） -->
	<view style="padding: 10px;">
		<comment-list ref="commentListRef" :type="5" :relation-id="parseInt(props.id)" @reply="handleReplyComment" />
	</view> <!-- 加载状态 --
	
	<view v-if="error" class="error">{{ errorMsg }}</view>


		
		<!-- 输入框 -->
	<comment-input ref="commentInputRef" :reply-info="replyForItem" :target-id="pageId" @submit="handleCommentSubmit"
		@update:reply-info="val => replyForItem = val" />
	<view style="width: 100%;height: 120rpx;"></view>
</template>

<script setup>
	import {
		ref,
		computed,
		onMounted
	} from 'vue';

	import {
		websiteUrl,
		image1Url,
		global,
		asyncGetUserInfo,
	} from '../../common/config.js';


	const loading = ref(true)
	const error = ref(false)
	const errorMsg = ref('')
	const pageId = ref(0)
	const detailData = ref(null);
	// 回复
	const commentListRef = ref(null) // 必须与模板中的ref名称一致
	const commentInputRef = ref(null) // 输入框聚焦状态联动
	let commentsPage = ref(1)
	//引用回复
	let replyForItem = ref({})


	// 点赞
	const hasLiked = ref(false);


	const props = defineProps({
		id: {
			type: String,
			required: true
		}
	});

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
			type: 5,
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
						console.log("添加主评论")
						// 主评论
						commentListRef.value?.addNewComment(newComment)
					} else {
						console.log("添加子评论")
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



	// 复制分享
	function copyUrl(item) {
		let url = "http://m.dogdogdoll.com/#/" + "pages/treehole_detail/treehole_detail?id=" + item.id
		// 复制到剪贴板
		uni.setClipboardData({
			data: url,
			success: function() {
				uni.showToast({
					title: '复制链接成功',
					icon: 'none'
				});
			}
		});
	}

	// 处理点赞
	const handleLike = () => {
		if (!global.isLogin) {
			uni.showModal({
				title: '提示',
				content: '需要登录后才能点赞',
				success: res => {
					if (res.confirm) uni.navigateTo({
						url: '/pages/login/login'
					})
				}
			})
			return
		}

		const token = uni.getStorageSync('token');
		const url = websiteUrl + (hasLiked.value ? '/with-state/unlike' : '/with-state/add-like');

		uni.request({
			url: url,
			method: 'POST',
			header: {
				Authorization: token
			},
			data: {
				id: parseInt(props.id),
				type: 5 // 假设树洞类型为5
			},
			success: (res) => {
				if (res.data.status === "success") {
					hasLiked.value = !hasLiked.value;
					detailData.value.like_count += hasLiked.value ? 1 : -1;
				}
			}
		})
	}

	//获取是否点赞
	function getHasLike() {
		let token = uni.getStorageSync('token');
		if (token == "") {
			return
		}

		uni.request({
			url: websiteUrl + '/with-state/hasLike?id=' + props.id + '&type=5',
			method: 'POST',
			header: {
				'Authorization': token,
			},
			success: (res) => {
				console.log(res.data);
				if (res.data.status == "success") {
					// goods.value = res.data.data;
					if (res.data.data.id > 0) {
						hasLiked.value = true
					} else {
						hasLiked.value = false
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


	// 图片显示逻辑
	const displayImages = computed(() => {
		return detailData.value?.images?.slice(0, 9) || [];
	});

	const remainingCount = computed(() => {
		return (detailData.value?.images?.length || 0) - 9;
	});

	const showOverlay = computed(() => {
		return (detailData.value?.images?.length || 0) > 9;
	});

	// 设置标题
	uni.setNavigationBarTitle({
		title: '投稿详情'
	})
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

	const layoutClass = computed(() => {
		const count = displayImages.value.length;
		if (count === 1) return 'single';
		if (count === 2) return 'double';
		return 'multi';
	});

	// 时间格式化
	const formatTime = (timestamp) => {
		const date = new Date(timestamp * 1000);
		return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
	};

	// 预览图片
	const previewImage = (index) => {
		uni.previewImage({
			current: index,
			urls: detailData.value.images
		});
	};


	// 获取数据
	onMounted(async () => {
		pageId.value = props.id
		console.log("pageId", pageId.value)

		try {
			const res = await uni.request({
				url: `${websiteUrl}/treehole-detail?id=${props.id}`
			});

			if (res.data.status === 'success') {
				detailData.value = res.data.data;
			}
		} catch (error) {
			console.log(error)
			uni.showToast({
				title: '加载失败',
				icon: 'none'
			});
		}


		asyncGetUserInfo()
		getHasLike()
	});

	// 分享功能
	// uni.onShareAppMessage(() => {
	//   return {
	//     title: detailData.value?.author_name + '的树洞',
	//     path: `/pages/treehole/detail?id=${props.id}`
	//   };
	// });
</script>

<style lang="less">
	.container {
		padding: 30rpx;
		background: #fff;
	}

	.loading {
		text-align: center;
		padding: 40rpx;
		color: #999;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30rpx;
	}

	.author-info {
		display: flex;
		align-items: center;
		flex: 1;
		overflow: hidden;
		padding-bottom: 10rpx;

		.avatar {
			width: 80rpx;
			height: 80rpx;
			border-radius: 50%;
			margin-right: 20rpx;
		}

		.author-name {
			font-size: 24rpx;
			font-weight: 800;
			color: #333;
			max-width: 70%;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
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


	.share-btn {
		background: none;
		padding: 0;
		margin: 0;

		.share-icon {
			width: 40rpx;
			height: 40rpx;
		}

		&::after {
			border: none;
		}
	}

	.content {
		font-size: 22rpx;
		color: #333;
		line-height: 1.6;
		margin-bottom: 30rpx;
	}

	.image-container {
		margin-bottom: 30rpx;

		&.single {
			.image-wrapper {
				width: 100%;
				padding-bottom: 100%;
			}
		}

		&.double {
			display: flex;
			flex-wrap: wrap;
			gap: 10rpx;

			.image-wrapper {
				width: calc(50% - 5rpx);
				padding-bottom: 50%;
			}
		}

		&.multi {
			display: flex;
			flex-wrap: wrap;
			gap: 10rpx;

			.image-wrapper {
				width: calc(33.333% - 12rpx);
				padding-bottom: 33.333%;
				position: relative;
			}
		}
	}

	.image-wrapper {
		position: relative;
		border-radius: 10rpx;
		overflow: hidden;
		background: #f5f5f5;
	}

	.image-item {
		position: absolute;
		width: 100%;
		height: 100%;
	}

	.image-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		color: #fff;
		font-size: 36rpx;
	}

	.time {
		font-size: 24rpx;
		color: #999;
	}

	.action-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin: 40rpx 0;
		padding: 20rpx 0;
		border-top: 1rpx solid #f5f5f5;
		border-bottom: 1rpx solid #f5f5f5;

		.action-group {
			display: flex;
			align-items: center;
			gap: 40rpx;

			.action-item {
				display: flex;
				align-items: center;
				padding: 12rpx 24rpx;
				border-radius: 40rpx;
				background: #f8f8f8;
				transition: all 0.2s;

				&:active {
					transform: scale(0.96);
					background: #f0f0f0;
				}

				.action-text {
					margin-left: 12rpx;
					font-size: 26rpx;
					color: #666;
					font-weight: 500;
				}
			}
		}

		.time-text {
			font-size: 24rpx;
			color: #999;
			padding-right: 20rpx;
		}
	}
</style>