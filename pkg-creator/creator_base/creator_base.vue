<template>
	<view class="container">
		<view-logs />
		<!-- 有品牌时显示的品牌管理页面 -->
		<view v-if="hasBrand">
			<!-- 头部品牌信息 -->
			<view class="header">
				<image class="logo" :src="brandData.logo_image" mode="aspectFit" />
				<view class="brand-info">
					<text class="brand-name">{{ brandData.brand_name }}</text>
					<text class="brand-type">{{ brandData.type }} · {{ brandData.country_name }}</text>
				</view>
			</view>

			<!-- 品牌信息卡片 -->
			<view class="card">
				<view class="card-header">
					<text class="title">品牌信息</text>
					<view class="score-box">
						<uni-icons type="star-filled" size="16" color="#FFC107"></uni-icons>
						<text class="score">{{ brandData.score }}</text>
					</view>
				</view>

				<view class="info-item">
					<text class="label">名称：</text>
					<text class="value">{{ brandData.brand_name }}</text>
				</view>

				<view class="info-item">
					<text class="label">简介：</text>
					<text class="value">{{ brandData.description }}</text>
				</view>

				<view class="info-item">
					<text class="label">国籍：</text>
					<text class="value">{{ brandData.country_name }}</text>
				</view>

				<view class="info-item">
					<text class="label">别名：</text>
					<text class="value">{{ brandData.nickname_list }}</text>
				</view>

				<view class="info-item">
					<text class="label">身份：</text>
					<text class="value">{{ brandData.type }}</text>
				</view>
			</view>

			<!-- 身份选择区域 -->
			<view class="identity-section">
				<view class="identity-item">
					<view class="identity-title">店铺身份</view>
					<switch :checked="isShop" @change="toggleShop" color="#8fecff" />
					<text class="identity-status">{{ isShop ? '我是店铺' : '不是店铺' }}</text>
				</view>

				<view class="identity-item">
					<view class="identity-title">妆师身份</view>
					<switch :checked="isArtist" @change="toggleArtist" color="#8fecff" />
					<text class="identity-status">{{ isArtist ? '我是妆师' : '不是妆师' }}</text>
				</view>

				<view class="identity-item">
					<view class="identity-title">毛娘身份</view>
					<switch :checked="isHairstylist" @change="toggleHairstylist" color="#8fecff" />
					<text class="identity-status">{{ isHairstylist ? '我是毛娘' : '不是毛娘' }}</text>
				</view>
			</view>

			<!-- 操作按钮区域 -->
			<view class="action-buttons">
				<view class="btn info-setting" @click="navigateTo('info-setting')">
					<uni-icons type="contact" size="24" color="#006a57"></uni-icons>
					<text>信息设置</text>
				</view>

				<view class="btn goods-manage" @click="navigateTo('goods-manage')">
					<uni-icons type="shop" size="24" color="#dfd7c2"></uni-icons>
					<text>商品管理</text>
				</view>

				<view class="btn image-manage" @click="navigateTo('image-manage')">
					<uni-icons type="image" size="24" color="#fff6e1"></uni-icons>
					<text>文章管理</text>
				</view>
				<view class="btn info-artist" @click="navigateTo('artist_info')">
					<uni-icons type="contact" size="24" color="#c7e1fa"></uni-icons>
					<text>妆师/毛娘</text>
				</view>
			</view>
			
			<!-- 信息说明 -->
			<view class="info-section">
			  <text class="info-title">功能说明</text>
			  <text class="info-text">开启对应身份开关后，您的品牌名称将会出现在相关的搜索结果中，方便更多用户找到您。</text>
			  <text class="info-text">您可以在「信息设置」中完善头像、品牌介绍及贩售渠道（仅限贩售类身份）。</text>
			  <text class="info-text">「商品管理」用于创建和编辑您发布的商品信息。</text>
			  <text class="info-text">「文章管理」用于发布图透、成品展示或宣传内容。</text>
			  <text class="info-text">「妆师/毛娘」页面可编辑定制类服务（如妆面、手改毛）的接单信息。若为量产类手改毛或成品妆头，请在「商品管理」中创建；</text>
			</view>
		</view>

		<!-- 没有品牌时显示的入驻申请页面 -->
		<view v-else class="settle-container">

			<view class="description">
				<text class="desc-text">
					如果您是娃圈贩售方、BJD妆师或毛娘，并希望管理和展示自己的品牌信息，欢迎申请入驻。通过认证后，您可以发布商品词条、图透、妆图等相关内容。除特殊情况外，我们的官方账号会在小红书和微博每日定期汇总并发布当日的贩售信息；妆师与毛娘的开单信息也将提前进行集中同步。
				</text>
				<text class="desc-text">
					入驻认证流程如下：
				</text>
				<text class="desc-text">
					1：添加官方客服微信 dogdogdoll，在下方输入或搜索自己的名称。复制并发送给客服微信 dogdogdoll；
				</text>
				<text class="desc-text">
					2：使用您在小红书或微博的官方账号向我们的官方账号发送一条验证消息，即可完成认证；
				</text>
				<text class="desc-text">
					入驻及代宣传服务均为无偿。后续的使用体验与意见，您可直接通过该微信号反馈给我们。
				</text>
				<text class="desc-text">
					此外，我们计划于明年推出线上交易平台服务，若您对此感兴趣，也欢迎提出宝贵建议。
				</text>
			</view>

			<view class="contact-section">
				<text class="contact-label">联系方式</text>
				<view class="contact-content">
					<text>dogdogdoll</text>
					<button class="copy-btn" @click="copyContact">点击复制</button>
				</view>
			</view>

			<view class="form-section">
				<view class="form-group">
					<text class="form-label">品牌名称</text>
					<common-search mode="fill" @select="onBrandSelect" placeholder="搜索并选择您的品牌/名字" show-index-selector  @close-associate="onCloseAssociate"/>
					<text v-if="selectedBrandId" class="brand-id">品牌ID: {{ selectedBrandId }}</text>
					<text class="desc-text">
						您的信息可能已经被录入，可以在尝试这里搜索您的品牌名称。需要在搜索框左边勾选【店铺】【毛娘】【妆师】身份后，才能搜索到您的名字。
					</text>
				</view>

				<view class="form-group">
					<text class="form-label">入驻信息</text>
					<textarea class="info-textarea" :value="settleInfo" disabled placeholder="请先选择品牌"
						 auto-height />
					<button class="copy-btn" @click="copySettleInfo">复制信息</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted,
		computed
	} from 'vue';
	import {
		websiteUrl,
		asyncGetUserInfo
	} from "@/common/config.js";

	const isShop = ref(false)
	const isArtist = ref(false)
	const isHairstylist = ref(false)
	// 品牌数据
	const brandData = ref({
		brand_name: "加载中...",
		description: "",
		country_name: "",
		nickname_list: "",
		logo_image: "",
		type: "",
		goods_count: 0,
		views: 0,
		vote_number: 0,
		score: 0,
		is_brand: 0,
		is_bjd_artist: 0,
		is_bjd_hairstylist: 0
	});

	// 入驻申请相关数据
	const brandName = ref("");
	const selectedBrandId = ref(0);
	const userInfo = ref({});

	// 计算是否有品牌
	const hasBrand = computed(() => {
		return userInfo.value.brand_id > 0;
	});


	// 计算入驻信息
	const settleInfo = computed(() => {
		if (!brandName.value) return "";
		
		let isBrand = selectedBrandId.value > 0 ? selectedBrandId.value : "尚未收录"
		return `我的UID是${userInfo.value.id}，我的品牌/名字是${brandName.value}，品牌ID是${isBrand}`;
	});

	let brandId = ref(0); // 存储品牌ID
	let updateInProgress = ref(false); // 防止重复提交

	// 加载品牌数据
	const loadBrandData = async () => {
		try {
			// 获取用户信息
			const user = await asyncGetUserInfo();
			userInfo.value = user;

			if (!user || !user.brand_id) {
				brandData.value.brand_id = 0;
				return;
			}

			brandId.value = user.brand_id;
			// 请求品牌数据
			uni.request({
				url: `${websiteUrl.value}/brand-info?id=${user.brand_id}`,
				method: 'GET',
				success: (res) => {
					if (res.data.status === 'success') {
						brandData.value = res.data.data;
						// 设置初始身份状态
						isShop.value = res.data.data.is_brand === 1;
						isArtist.value = res.data.data.is_bjd_artist === 1;
						isHairstylist.value = res.data.data.is_bjd_hairstylist === 1;
					} else {
						uni.showToast({
							title: res.data.msg || '获取品牌信息失败',
							icon: 'none'
						});
					}
				},
				fail: (err) => {
					console.error('请求失败:', err);
					uni.showToast({
						title: '网络请求失败',
						icon: 'none'
					});
				}
			});
		} catch (error) {
			console.error('加载品牌数据出错:', error);
			uni.showToast({
				title: '加载数据出错',
				icon: 'none'
			});
		}
	};

	// 更新品牌身份接口
	const updateBrandIdentity = async (field, value) => {
		if (updateInProgress.value) return;

		updateInProgress.value = true;
		uni.showLoading({
			title: '更新中...',
			mask: true
		});

		try {
			const token = uni.getStorageSync('token');
			if (!token) {
				uni.showToast({
					title: '请先登录',
					icon: 'none'
				});
				return;
			}
			const data = {};
			data[field] = value ? 1 : 0;

			const res = await uni.request({
				url: `${websiteUrl.value}/brand-manager/update-brand-identity`,
				method: 'POST',
				header: {
					'Authorization': token,
					'Content-Type': 'application/json'
				},
				data
			});

			if (res.data.status === 'success') {
				uni.showToast({
					title: '更新成功',
					icon: 'success'
				});
				// 更新本地品牌数据
				brandData.value[field] = value ? 1 : 0;
			} else {
				uni.showToast({
					title: res.data.msg || '更新失败',
					icon: 'none'
				});
				// 回退UI状态
				if (field === 'is_brand') isShop.value = !value;
				if (field === 'is_bjd_artist') isArtist.value = !value;
				if (field === 'is_bjd_hairstylist') isHairstylist.value = !value;
			}
		} catch (error) {
			console.error('更新失败:', error);
			uni.showToast({
				title: '网络请求失败',
				icon: 'none'
			});
		} finally {
			updateInProgress.value = false;
			uni.hideLoading();
		}
	};

	// 切换店铺身份
	const toggleShop = (e) => {
		const newValue = e.detail.value;
		updateBrandIdentity('is_brand', newValue);
	};
	// 切换妆师身份
	const toggleArtist = (e) => {
		const newValue = e.detail.value;
		updateBrandIdentity('is_bjd_artist', newValue);
	};
	// 切换毛娘身份
	const toggleHairstylist = (e) => {
		const newValue = e.detail.value;
		updateBrandIdentity('is_bjd_hairstylist', newValue);
	};

	// 处理关闭联想事件
	const onCloseAssociate = (searchTerm) => {
		 console.log(searchTerm)
	  // 保留用户输入的品牌名称
	  brandName.value = searchTerm;
	  // 清空品牌ID
	  selectedBrandId.value = 0;
	};
	// 品牌选择
	const onBrandSelect = (id, name) => {
	  selectedBrandId.value = id;
	  brandName.value = name; // 注意这里使用 brandName.value 而不是 brandName
	};
	// 复制联系方式
	const copyContact = () => {
		uni.setClipboardData({
			data: 'dogdogdoll',
			success: () => {
				uni.showToast({
					title: '已复制联系方式',
					icon: 'success'
				});
			}
		});
	};

	// 复制入驻信息
	const copySettleInfo = () => {
		if (!settleInfo.value) {
			uni.showToast({
				title: '请先选择品牌',
				icon: 'none'
			});
			return;
		}

		uni.setClipboardData({
			data: settleInfo.value,
			success: () => {
				uni.showToast({
					title: '已复制入驻信息',
					icon: 'success'
				});
			}
		});
	};

	// 打开外部链接
	const openLink = (url) => {
		if (!url) return;

		// 在微信小程序中使用web-view打开，其他环境直接打开
		if (process.env.VUE_APP_PLATFORM === 'mp-weixin') {
			uni.navigateTo({
				url: `/pages/webview/webview?url=${encodeURIComponent(url)}`
			});
		} else {
			window.open(url, '_blank');
		}
	};

	// 导航到指定页面
	const navigateTo = (type) => {
		switch (type) {
			case 'info-setting':
				uni.navigateTo({
					url: '/pkg-creator/creator_base/brand_edit/brand_edit'
				});
				break;
			case 'goods-manage':
				uni.navigateTo({
					url: '/pkg-creator/creator_base/goods_list/goods_list'
				});
				break;
			case 'image-manage':
				uni.navigateTo({
					url: '/pkg-creator/creator_base/news/news'
				});
				break;
			case 'artist_info':
				uni.navigateTo({
					url: '/pkg-creator/creator_base/artist_setting/artist_setting'
				});
				break;
		}
	};

	// 页面加载时获取品牌数据
	onMounted(() => {
		uni.setNavigationBarTitle({
			title: "我的品牌"
		});
		loadBrandData();
	});
</script>

<style lang="less" scoped>
	@primary-color: #65C3D6;
	@error-color: #ff5252;
	@success-color: #4CAF50;
	@bg-color: #f5f7fa;

	.container {
		padding: 20rpx;
		background-color: #f8f9fa;
		min-height: 100vh;
	}

	/* 有品牌时的样式保持不变 */
	.header {
		display: flex;
		align-items: center;
		padding: 30rpx;
		background: linear-gradient(135deg, #8fecff, #c1ddff);
		border-radius: 20rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);

		.logo {
			width: 140rpx;
			height: 140rpx;
			border-radius: 16rpx;
			background-color: #fff;
			padding: 10rpx;
			margin-right: 30rpx;
			border: 2rpx solid rgba(255, 255, 255, 0.3);
		}

		.brand-info {
			flex: 1;
			display: flex;
			flex-direction: column;

			.brand-name {
				font-size: 38rpx;
				font-weight: bold;
				color: white;
				margin-bottom: 10rpx;
			}

			.brand-type {
				font-size: 26rpx;
				color: rgba(255, 255, 255, 0.9);
			}
		}
	}

	.card {
		background-color: #fff;
		border-radius: 20rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

		.card-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 30rpx;
			padding-bottom: 20rpx;
			border-bottom: 1rpx solid #eee;

			.title {
				font-size: 36rpx;
				font-weight: bold;
				color: #333;
			}

			.score-box {
				display: flex;
				align-items: center;
				background: rgba(255, 193, 7, 0.1);
				padding: 6rpx 16rpx;
				border-radius: 40rpx;

				.score {
					font-size: 30rpx;
					font-weight: bold;
					color: #FFC107;
					margin-left: 8rpx;
				}
			}
		}

		.info-item {
			display: flex;
			margin-bottom: 24rpx;

			.label {
				width: 160rpx;
				font-size: 28rpx;
				color: #666;
				font-weight: 500;
			}

			.value {
				flex: 1;
				font-size: 28rpx;
				color: #333;
			}
		}
	}

	.action-buttons {
		display: flex;
		justify-content: space-between;
		margin-bottom: 30rpx;
		opacity: 0.8;

		.btn {
			flex: 1;
			margin: 0 10rpx;
			height: 120rpx;
			border-radius: 16rpx;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			color: white;
			font-size: 28rpx;
			font-weight: 500;
			box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.15);

			text {
				margin-top: 10rpx;
				color: #fff;
			}
		}

		.info-setting {
			background-color: #ffb400;

			text {
				color: #006a57;
			}
		}

		.goods-manage {
			background-color: #ef856d;

			text {
				color: #dfd7c2;
			}
		}

		.image-manage {

			background-color: #81D8cf;

			text {
				color: #fff6e1;
			}

		}


		.info-artist {

			background-color: #28517f;

			text {
				color: #c7e1fa;
			}

		}
	}

	.social-links {
		display: flex;
		flex-wrap: wrap;
		background-color: #fff;
		border-radius: 20rpx;
		padding: 20rpx;
		margin-bottom: 30rpx;

		.link {
			display: flex;
			align-items: center;
			padding: 20rpx 30rpx;
			margin: 10rpx;
			background-color: #f8f9fa;
			border-radius: 12rpx;
			font-size: 28rpx;

			text {
				margin-left: 10rpx;
			}
		}
	}

	.stats {
		display: flex;
		justify-content: space-around;
		background-color: #fff;
		border-radius: 20rpx;
		padding: 30rpx 20rpx;

		.stat-item {
			display: flex;
			flex-direction: column;
			align-items: center;

			.number {
				font-size: 42rpx;
				font-weight: bold;
				color: @primary-color;
				margin-bottom: 10rpx;
			}

			.label {
				font-size: 26rpx;
				color: #666;
			}
		}
	}

	/* 身份选择区域样式 */
	.identity-section {
		background: white;
		border-radius: 16rpx;
		padding: 20rpx;
		margin: 20rpx;
		box-shadow: 0 4rpx 12rpx rgba(143, 236, 255, 0.2);
		transition: all 0.3s ease;
	}

	.identity-item {
		display: flex;
		align-items: center;
		padding: 20rpx 0;
		border-bottom: 1rpx solid #f0f0f0;

		&:last-child {
			border-bottom: none;
		}
	}

	.identity-title {
		flex: 1;
		font-size: 30rpx;
		color: #333;
		font-weight: 500;
	}

	.identity-status {
		margin-left: 20rpx;
		font-size: 28rpx;
		color: #666;
	}

	/* 响应式适配 */
	@media (min-width: 768px) {
		.container {
			max-width: 750px;
			margin: 0 auto;
		}
	}

	/* 入驻申请页面样式 */
	.settle-container {
		padding: 20rpx;
	}

	.settle-header {
		text-align: center;
		margin-bottom: 40rpx;

		.title {
			font-size: 40rpx;
			font-weight: bold;
			color: #333;
			display: block;
			margin-bottom: 10rpx;
		}

		.subtitle {
			font-size: 28rpx;
			color: #666;
		}
	}

	.description {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

		
	}

	.contact-section {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

		.contact-label {
			display: block;
			font-size: 28rpx;
			color: #333;
			font-weight: 500;
			margin-bottom: 20rpx;
		}

		.contact-content {
			display: flex;
			align-items: center;
			justify-content: space-between;

			text {
				font-size: 30rpx;
				color: #333;
				font-weight: bold;
			}

			.copy-btn {
				background-color: #65C3D6;
				color: white;
				font-size: 26rpx;
				padding: 10rpx 30rpx;
				border-radius: 40rpx;
				margin: 0;
			}
		}
	}

	.form-section {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 30rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

		.form-group {
			margin-bottom: 40rpx;

			&:last-child {
				margin-bottom: 0;
			}

			.form-label {
				display: block;
				font-size: 28rpx;
				color: #333;
				font-weight: 500;
				margin-bottom: 20rpx;
			}

			.brand-id {
				display: block;
				font-size: 26rpx;
				color: #666;
				margin-top: 10rpx;
				text-align: right;
			}

			.info-textarea {
				width: 100%;
				min-height: 200rpx;
				background-color: #f8f9fa;
				border-radius: 12rpx;
				padding: 20rpx;
				font-size: 26rpx;
				color: #333;
				margin-bottom: 20rpx;
				box-sizing: border-box;
			}

			.copy-btn {
				width: 100%;
				background-color: #65C3D6;
				color: white;
				font-size: 28rpx;
				padding: 20rpx 0;
				border-radius: 12rpx;
				text-align: center;
			}
		}
	}
	
	.desc-text {
		display: block;
		font-size: 26rpx;
		color: #666;
		line-height: 1.8;
		margin-bottom: 20rpx;
	
		&:last-child {
			margin-bottom: 0;
		}
	}
	
	.info-section {
	  background: #fff;
	  border-radius: 16rpx;
	  padding: 30rpx;
	  margin: 20rpx 0;
	  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
	
	  .info-title {
	    display: block;
	    font-size: 32rpx;
	    font-weight: bold;
	    color: #333;
	    margin-bottom: 20rpx;
	  }
	
	  .info-text {
	    display: block;
	    font-size: 26rpx;
	    color: #555;
	    line-height: 1.8;
	    margin-bottom: 16rpx;
	
	    &:last-child {
	      margin-bottom: 0;
	    }
	  }
	}
</style>