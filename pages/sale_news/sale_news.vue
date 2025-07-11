<template>
	<view-logs />
	<view>
		<meta name="theme-color" content="#F8F8F8"></meta>
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
			<view class="brand-details" @tap="jump2brand(brand.id)">
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
			<comment-list ref="commentListRef" :type="4" :relation-id="parseInt(pageId)" @reply="handleReplyComment" />
		</view> <!-- 加载状态 -->

		<view v-if="loading" class="loading">加载中...</view>
		<view v-if="error" class="error">{{ errorMsg }}</view>

		<!-- 输入框 -->
		<comment-input 
		  ref="commentInputRef"
		  :reply-info="replyForItem" 
		  :target-id="pageId" 
		  @submit="handleCommentSubmit"
		  @update:reply-info="val => replyForItem = val" 
		/>
		
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
		onLoad,
		onShow
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

	const loading = ref(true)
	const error = ref(false)
	const errorMsg = ref('')
	const pageId = ref(0)
	const brandId = ref(0)
	const hasLikeBrand = ref(false)
	
	const commentListRef = ref(null)  // 必须与模板中的ref名称一致
	const commentInputRef = ref(null) // 输入框聚焦状态联动
	let commentsPage = ref(1)
	//引用回复
	let replyForItem = ref({})
	// 获取系统信息
	const systemInfo = uni.getSystemInfoSync()


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

	//跳转到用户页面
	const jump2user = (uid) => {
		uni.navigateTo({
			url: '/pages/user_page/user_page?uid=' + uid
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
	
				brandId.value = res.data.data.brand_id
				getBrandsInfo()
			} else {
				handleError(res.data.msg || '数据加载失败')
			}
		} catch (err) {
			console.error('请求失败:', err)
			handleError('网络请求失败')
		} finally {
			loading.value = false
		}
	}


	
	
	// 评论提交处理
		const handleCommentSubmit = (submitData) => {
		  let token = uni.getStorageSync('token');
		  if (!global.isLogin) {
		    uni.showToast({
		      title: '请先登录',
		      icon: 'none'
		    })
		    return
		  }
		  
		  console.log("reply_info", replyForItem.value)
		  const requestData = {
		    content: submitData.content,
		    origin: submitData.origin,
		    target_id: parseInt(pageId.value),
		    type: 4, // 图透类型
		    image_url: submitData.image_url || "",
		    association_id: submitData.association_id || 0,
		    association_type: submitData.association_type || 0,
		    is_anonymous: submitData.is_anonymous || 0,
		    ...(replyForItem.value.id && {
		      reply_id: replyForItem.value.id,
		      reply_for: replyForItem.value.comment,
		      reply_uid: replyForItem.value.user_id,
		      parent_id: replyForItem.value.parent_id > 0 ? 
		        replyForItem.value.parent_id : replyForItem.value.id,
		    })
		  }
		  
		  // 创建临时评论对象
		  const tempComment = {
		    id: Date.now(), // 临时ID
		    content: submitData.content,
		    created_at: Math.floor(Date.now() / 1000),
		    like_count: 0,
		    reply_count: 0,
		    is_liked: false,
		    floor: 0, // 临时楼层数
		    
		    // 匿名处理
		    ...(submitData.is_anonymous ? {
		      avatar: "https://images1.fantuanpu.com/home/default_avatar.jpg",
		      username: "匿名用户",
		      is_anonymous: 1
		    } : {
		      avatar: global.userInfo.avatar,
		      username: global.userInfo.nickname,
		      is_anonymous: 0
		    }),
		    
		    // 关联信息
		    ...(submitData.association_id && {
		      association_id: submitData.association_id,
		      association_type: submitData.association_type
		    }),
		    
		    // 图片信息
		    ...(submitData.image_url && {
		      image_url: submitData.image_url
		    }),
		    
		    // 回复信息
		    ...(replyForItem.value.id && {
		      reply_id: replyForItem.value.id,
		      reply_for: replyForItem.value.comment,
		      reply_uid: replyForItem.value.user_id,
		      parent_id: replyForItem.value.parent_id > 0 ? 
		        replyForItem.value.parent_id : replyForItem.value.id,
		      // 处理被回复者的匿名状态
		      reply_username: replyForItem.value.is_anonymous ? 
		        "匿名用户" : replyForItem.value.username
		    })
		  }
		  
		  // 添加临时评论
		  if (!replyForItem.value.id) {
		    commentListRef.value?.addNewComment(tempComment)
		  } else if (replyForItem.value.parent_id === 0) {
		    commentListRef.value?.addReplyComment({
		      ...tempComment,
		      parent_id: replyForItem.value.id
		    })
		  } else {
		    commentListRef.value?.addReplyComment({
		      ...tempComment,
		      parent_id: replyForItem.value.parent_id
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
		        
		        // 处理匿名状态
		        const finalComment = {
		          ...newComment,
		          ...(submitData.is_anonymous ? {
		            avatar: "https://images1.fantuanpu.com/home/default_avatar.jpg",
		            username: "匿名用户",
		            is_anonymous: 1
		          } : {
		            avatar: global.userInfo.avatar,
		            username: global.userInfo.nickname,
		            is_anonymous: 0
		          })
		        }
		        
		        // 处理被回复者的匿名状态
		        if (newComment.reply_uid && replyForItem.value.is_anonymous) {
		          finalComment.reply_username = "匿名用户"
		        }
		
		        // 更新临时评论为真实评论
		        commentListRef.value?.updateTempComment(tempComment.id, finalComment)
		
		        uni.showToast({
		          title: '评论成功',
		          icon: 'success'
		        })
		
		      } else {
		        // 请求失败，移除临时评论
		        commentListRef.value?.removeTempComment(tempComment.id)
		        uni.showToast({
		          title: res.data.msg,
		          icon: 'none'
		        })
		      }
		    },
		    fail: (err) => {
		      // 请求失败，移除临时评论
		      commentListRef.value?.removeTempComment(tempComment.id)
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

	// 初始化加载
	onLoad((options) => {
		if (!options.id) {
			handleError('缺少必要参数')
			return
		}
		
		pageId.value = options.id

		
		fetchNewsDetail(options.id)
		// getCollocationComments()
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
</style>