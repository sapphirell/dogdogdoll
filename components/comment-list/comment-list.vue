<!-- components/comment-list.vue -->
<template>
	<view class="comment-container">
		<view class="comment-count" v-if="commentList.length > 0">
			共{{ mainCommentsTotal }}条回复
		</view>
		<view class="empty-tips" v-else>
			<text>-- 暂无回复 --</text>
		</view>
		<!-- 评论列表 -->
		<view v-for="comment in commentList" :key="comment.id" class="comment-card">
			<!-- 主评论 -->
			<view class="main-comment">
				<image @tap="jump2user(comment.uid)" :src="comment.avatar" class="avatar" mode="aspectFill" />
				<view class="content">
					<view class="header">
						<text class="username"
							@tap="jump2user(comment.uid)">{{ formatUsername(comment.username) }}</text>
						<text class="floor">#{{ comment.floor }}</text>
						<report-button :report-type="5" :relation-id="comment.id" button-text="举报" icon-color="#999"
							theme-color="#64c6dc" />

					</view>
					<text class="comment-text" @click="handleReply(comment)">{{ comment.comment }}</text>


					<view class="footer">
						<view class="left-actions">
							<text class="time">{{ formatTime(comment.created_at) }}</text>
							<view class="like-container">
								<view class="like-btn" @click="handleLike(comment)">
									<uni-icons :type="comment.user_like ? 'hand-up-filled' : 'hand-up'" size="18"
										:color="comment.user_like ? 'rgb(100 198 220)' : '#999'" />
									<text class="like-count" :class="{ liked: comment.user_like }">
										{{ comment.like_count || 0 }}
									</text>
								</view>
							</view>
						</view>

						
						<view class="right-actions">
							<!-- 新增表态按钮组 -->
							<attitude-widget :target-id="comment.id" :type="6" :attitude-status="comment.attitudeStatus"
								:attitude-counts="comment.attitudeCounts" @change="handleAttitudeChange(comment, $event)" />
							
							<text class="reply-btn" @click="handleReply(comment)">回复</text>
						</view>

					</view>
				</view>
			</view>

			<!-- 子评论 -->
			<view v-if="comment.localChildren && comment.localChildren.length" class="sub-comments">
				<view v-for="(child, index) in visibleChildren(comment)" :key="child.id" class="sub-comment">
					<image @tap="jump2user(child.uid)" :src="child.avatar" class="avatar" mode="aspectFill" />
					<view class="content">
						<view class="header">
							<text @tap="jump2user(child.uid)"
								class="username">{{ formatUsername(child.username) }}</text>
							<text v-if="child.reply_for" class="reply-to">@{{ child.reply_for }}</text>
							<report-button :report-type="5" :relation-id="child.id" button-text="举报" icon-color="#999"
								theme-color="#64c6dc" />
						</view>

						<text class="comment-text" @click="handleReply(comment)">{{ child.comment }}</text>

						


						<view class="footer">
							<view class="left-actions">
								<text class="time">{{ formatTime(child.created_at) }}</text>
								<view class="like-container">
									<view class="like-btn" @click="handleLike(child)">
										<uni-icons :type="child.user_like ? 'hand-up-filled' : 'hand-up'" size="18"
											:color="child.user_like ? 'rgb(100 198 220)' : '#999'" />
										<text class="like-count" :class="{ liked: child.user_like }">
											{{ child.like_count || 0 }}
										</text>
									</view>
								</view>
							</view>

							<view class="right-actions">
								<!-- 新增表态按钮组 -->
								<attitude-widget :target-id="child.id" :type="6" :attitude-status="comment.attitudeStatus"
									:attitude-counts="comment.attitudeCounts" @change="handleAttitudeChange(comment, $event)" />
								
								<text class="reply-btn" @click="handleReply(comment, child)">回复</text>

							</view>
						</view>
					</view>
				</view>

				<!-- 加载更多 -->
				<view v-if="shouldShowMore(comment)" class="load-more" @click="loadMore(comment)">
					<text>展开{{ remainingCount(comment) }}条回复</text>
					<uni-icons type="arrow-down" size="18" color="#007AFF" />
				</view>
			</view>
		</view>


		<!-- 加载更多按钮 -->
		<view class="load-more-box" v-if="commentList.length > 0">
			<view v-if="hasMore" class="load-more-btn" @click="loadMoreMainComments" :class="{loading: loading}">
				<view v-if="!loading">
					<text> 加载更多 </text>
					<uni-icons type="arrow-down" size="18" color="#007AFF" />
				</view>
				<view v-else>
					<uni-icons type="spinner-cycle" size="16" color="#888" />
				</view>

			</view>
			<view v-else class="no-more">
				<text>-- 没有更多了 --</text>
			</view>
		</view>


	</view>
</template>

<script setup>
	import {
		ref,
		computed,
		onMounted,
		reactive
	} from 'vue'
	import {
		websiteUrl,
		asyncGetUserInfo,
		wechatSignLogin,
		getScene,
		global,
	} from '../../common/config.js'


	const props = defineProps({
		type: {
			type: Number,
			required: true
		},
		relationId: {
			type: Number,
			required: true
		},
	})

	const commentList = ref([])
	const currentPage = ref(1)
	const mainCommentsTotal = ref(0)
	// 主贴是否有更多
	const hasMore = ref(true)

	const subCommentPages = reactive({})
	const emit = defineEmits(['reply'])

	const loading = ref(false)

	// 处理状态变化
	const handleAttitudeChange = (comment, {
		status,
		counts
	}) => {
		comment.attitudeStatus = status
		comment.attitudeCounts = counts
	}


	// 暴露给父组件的方法
	defineExpose({
		// 添加主评论
		addNewComment: (comment) => {
			commentList.value.unshift({
				...comment,
				showAll: false,
				localChildren: [],
				childTotal: 0
			})
		},

		// 添加子评论
		addReplyComment: (reply) => {
			const parent = commentList.value.find(c => c.id === reply.parent_id)
			if (parent) {
				// 确保 localChildren 数组存在
				if (!parent.localChildren) {
					parent.localChildren = []
				}
				// 确保 childTotal 存在
				if (typeof parent.childTotal !== 'number') {
					parent.childTotal = 0
				}

				parent.localChildren.unshift(reply)
				parent.childTotal += 1

				// 自动展开子评论列表
				if (!parent.showAll && parent.childTotal <= 5) {
					parent.showAll = true
				}
			}
		},



	})

	// 初始化加载评论
	onMounted(() => {
		loadMainComments()
	})
	// 增加缺失的visibleChildren计算属性
	const visibleChildren = (comment) => {
		if (!comment.showAll && comment.localChildren.length > 5) {
			return comment.localChildren.slice(0, 5)
		}
		return comment.localChildren
	}
	// 加载更多主评论
	const loadMoreMainComments = async () => {
		if (loading.value || !hasMore.value) {
			return
		}
		try {
			loading.value = true
			currentPage.value += 1
			await loadMainComments()
		} finally {
			loading.value = false
		}
	}

	// 处理点赞
	const handleLike = async (comment) => {
		if (!global.isLogin) {
			uni.showToast({
				title: '请先登录',
				icon: 'none'
			})
			return
		}

		try {
			const token = uni.getStorageSync('token')
			const url = `${websiteUrl}/with-state/${comment.user_like ? 'unlike' : 'add-like'}`
			const res = await uni.request({
				url,
				method: 'POST',
				header: {
					Authorization: token
				},
				data: {
					id: comment.id,
					type: 6 // 评论类型
				}
			})

			if (res.data.status === "success") {
				// 更新点赞状态和数量
				comment.user_like = !comment.user_like
				if (comment.user_like) {
					comment.like_count = (comment.like_count || 0) + 1
				} else {
					comment.like_count = Math.max(0, (comment.like_count || 0) - 1)
				}

				uni.showToast({
					title: comment.user_like ? '点赞成功' : '已取消点赞',
					icon: 'none'
				})
			} else {
				uni.showToast({
					title: res.data.msg || '操作失败',
					icon: 'none'
				})
			}
		} catch (err) {
			console.error('点赞失败:', err)
			uni.showToast({
				title: '操作失败',
				icon: 'none'
			})
		}
	}

	const jump2user = (uid) => {
		uni.navigateTo({
			url: '/pages/user_page/user_page?uid=' + uid
		})
	}
	// 格式化显示
	const formatTime = (timestamp) => {
		const date = new Date(timestamp * 1000)
		return `${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`
	}

	const formatUsername = (name) => {
		return name.length > 12 ? name.slice(0, 12) + '...' : name
	}

	// 加载主评论
	const loadMainComments = async () => {
		try {
			loading.value = true
			let token = uni.getStorageSync('token');
			const res = await uni.request({
				url: `${websiteUrl}/get-comments`,
				data: {
					relation_id: props.relationId,
					type: props.type,
					page: currentPage.value,
					page_size: 10 // 添加分页大小
				},
				header: {
					'Authorization': token
				},
			})

			if (res.data.status === 'success') {
				const data = res.data.data
				const newComments = data.comment_list.map(c => ({
					...c,
					showAll: false,
					localChildren: c.children || [],
					childTotal: c.childTotal || (c.children ? c.children.length : 0),
					// 新增表态相关字段
					attitudeStatus: c.user_attitude || 0, // 当前用户表态状态
					attitudeCounts: c.attitude_counts || {
						1: c.count_1 || 0,
						2: c.count_2 || 0,
						3: c.count_3 || 0,
						4: c.count_4 || 0,
						5: c.count_5 || 0
					},
				}))

				// 第一页替换，后续追加
				if (currentPage.value === 1) {
					commentList.value = newComments
				} else {
					commentList.value.push(...newComments)
				}
				console.log("total", data.total)
				// 判断是否还有更多
				hasMore.value = data.total > commentList.value.length
				mainCommentsTotal.value = data.total
				console.log("是否还有更多?", hasMore.value)
			}
		} catch (err) {
			uni.showToast({
				title: '加载失败',
				icon: 'none'
			})
		} finally {
			loading.value = false
		}
	}

	// 处理回复
	const handleReply = (parent, target = null) => {
		emit('reply', {
			parent,
			target,
			relationId: props.relationId
		})
	}



	const shouldShowMore = (comment) => {
		return comment.childTotal > 5 && !comment.showAll
	}
	// 剩余数量计算
	const remainingCount = (comment) => {
		return comment.childTotal - Math.min(comment.localChildren.length, 5)
	}

	// 修正后的加载更多逻辑
	const loadMore = async (comment) => {
		if (comment.localChildren.length < comment.childTotal) {
			const nextPage = Math.ceil(comment.localChildren.length / 5) + 1
			try {
				const res = await uni.request({
					url: `${websiteUrl}/get-comments-by-parent-id`,
					data: {
						parent_id: comment.id,
						page: nextPage
					}
				})

				if (res.data.status === 'success') {
					comment.localChildren = [
						...comment.localChildren,
						...res.data.data.comment_list
					]
					comment.childTotal = res.data.data.total

					// 如果加载后仍然未完全展开，保持折叠状态
					if (comment.localChildren.length >= 5 && !comment.showAll) {
						comment.showAll = true
					}
				}
			} catch (err) {
				uni.showToast({
					title: '加载失败',
					icon: 'none'
				})
			}
		} else {
			comment.showAll = !comment.showAll
		}
	}
</script>

<style lang="less">
	.comment-container {
		padding: 20rpx;
		// background: #f8f8f8;

		.comment-count {
			padding: 20rpx 24rpx;
			font-size: 24rpx;
			color: #999;
			margin-bottom: 20rpx;
		}

		.empty-tips {
			text-align: center;
			padding: 100rpx 0;

			text {
				color: #999;
				font-size: 22rpx;
			}

		}
	}

	.comment-card {
		background: #fff;
		border-radius: 16rpx;
		margin-bottom: 24rpx;
		padding: 24rpx;
		box-shadow: 0 4rpx 22rpx rgba(0, 0, 0, 0.05);
	}

	.main-comment,
	.sub-comment {
		display: flex;

		.avatar {
			width: 72rpx;
			height: 72rpx;
			border-radius: 50%;
			margin-right: 24rpx;
			flex-shrink: 0;
			border: 2rpx solid #f0f0f0;
		}

		.content {
			flex: 1;
			min-height: 120rpx; // 添加最小高度
			display: flex;
			flex-direction: column; // 改为纵向布局

			.header {
				display: flex;
				align-items: center;
				margin-bottom: 12rpx;

				.username {
					font-size: 22rpx;
					color: #b2b8bc;
					font-weight: 500;
					max-width: 400rpx;
					overflow: hidden;
					text-overflow: ellipsis;
				}

				.floor {
					font-size: 20rpx;
					color: #999;
					margin-left: 16rpx;
				}
			}

			.comment-text {
				font-size: 22rpx;
				color: #494b4b;
				line-height: 1.6;
				margin-bottom: 16rpx;
				flex: 1; // 内容区域撑满空间
				margin-bottom: 10rpx;
				min-height: 60rpx; // 内容最小高度
			}


		}
	}

	.sub-comments {
		margin-left: 72rpx;
		padding-left: 24rpx;
		border-left: 2rpx solid #eee;

		.sub-comment {
			margin-top: 24rpx;

			.avatar {
				width: 56rpx;
				height: 56rpx;
			}

			.header {
				.reply-to {
					color: #00aadb;
					margin-left: 12rpx;
					font-size: 20rpx;
				}
			}

			&.folded {
				display: none;
			}
		}

		.load-more {
			display: flex;
			align-items: center;
			justify-content: center;

			text {
				font-size: 22rpx;
			}

			padding: 16rpx;
			margin-top: 16rpx;
			background: none;
			border-radius: 8rpx;

			uni-icons {
				margin-left: 8rpx;
			}
		}
	}

	.load-more-box {
		text-align: center;
		padding: 30rpx 0;

		.load-more-btn {
			padding: 12rpx 24rpx;
			border-radius: 40rpx;
		}

		.no-more {
			color: #999;
			font-size: 24rpx;
		}
	}


	// 优化子评论布局
	.sub-comment {
		display: flex;
		margin-top: 24rpx;

		.avatar {
			width: 56rpx !important; // 强制覆盖
			height: 56rpx !important;
			margin-right: 20rpx;
			flex-shrink: 0;
		}

		.header {
			display: flex;
			align-items: center;
			margin-bottom: 10rpx;

			.username {
				font-size: 22rpx;
				color: #888;
				max-width: 180rpx;
			}

			.reply-to {
				color: #007AFF;
				margin-left: 12rpx;
				font-size: 20rpx;
				max-width: 200rpx;
				overflow: hidden;
				text-overflow: ellipsis;
			}
		}

		.comment-text {
			font-size: 22rpx !important;
			color: #666 !important;
			line-height: 1.5;
		}

	}


	// 加载更多样式优化
	.load-more {
		margin-top: 24rpx !important;
		// background: rgba(0, 122, 255, 0.05) !important;
		border-radius: 8rpx !important;
	}

	.load-more-box {
		padding: 30rpx 0;
		text-align: center;

		text {
			font-size: 22rpx;
		}

		.load-more-btn {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			height: 64rpx;
			padding: 0 40rpx;
			font-size: 26rpx;
			border-radius: 64rpx;
			transition: all 0.3s;



			&.loading {
				color: #494b4b;
				opacity: 0.8;
				padding: 0 30rpx;
			}

			uni-icons {
				font-size: 24rpx;
				margin-left: 8rpx;
				animation: rotating 1s linear infinite;
			}
		}

		.no-more {
			color: #999;
			font-size: 24rpx;
			padding: 20rpx 0;
		}
	}

	@keyframes rotating {
		from {
			transform: rotate(0deg);
		}

		to {
			transform: rotate(360deg);
		}
	}


	// 新增表态按钮样式
	.attitude-actions {
		display: flex;
		align-items: center;
		margin-right: 20rpx;

		.attitude-btn {
			display: flex;
			align-items: center;
			padding: 6rpx 12rpx;
			margin-right: 10rpx;
			border-radius: 20rpx;
			background: #f5f5f5;
			transition: all 0.3s;

			&.active {
				background: #e0f0ff;

				.emoji,
				.count {
					color: #fff;
				}
			}

			.emoji {
				font-size: 28rpx;
				margin-right: 4rpx;
			}

			.count {
				font-size: 22rpx;
				color: #666;
			}
		}
	}

	// 调整原有回复按钮位置
	.reply-btn {
		margin-left: auto;
	}

	// 移动端适配
	@media (max-width: 480px) {
		.attitude-actions {
			.attitude-btn {
				padding: 4rpx 8rpx;
				margin-right: 6rpx;

				.emoji {
					font-size: 24rpx;
				}

				.count {
					font-size: 18rpx;
				}
			}
		}
	}


	.footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 16rpx;

		.left-actions {
			display: flex;
			align-items: center;
			gap: 20rpx;

			.time {
				font-size: 20rpx;
				color: #999;
			}

			.like-container {
				.like-btn {
					display: flex;
					align-items: center;
					gap: 8rpx;
					padding: 6rpx 16rpx;
					border-radius: 20rpx;


					.like-count {
						font-size: 20rpx;
						color: #999;

						&.liked {
							color: rgb(100 198 220);
						}
					}
				}
			}
		}

		.right-actions {
			display: flex;
			align-items: center;
			/* 添加这行确保垂直居中 */
			gap: 10rpx;
			/* 添加间距使两个按钮分开 */

			.reply-btn {
				font-size: 22rpx;
				color: #97b7df;
				padding: 6rpx 20rpx;
				border-radius: 24rpx;
			}
		}
	}

	/* 子评论操作栏微调 */
	.sub-comment .footer {
		margin-top: 10rpx;

		.like-btn {
			padding: 4rpx 12rpx;
		}
	}
</style>