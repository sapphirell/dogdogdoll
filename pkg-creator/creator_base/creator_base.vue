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
					点击下方「去入驻」后，按步骤完成：选择身份 → 搜索自己的名字 → 复制验证信息并联系微信客服。
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
				<view class="step-bar">
					<view class="step-pill font-alimamashuhei" :class="{ active: settleStep >= 1 }">1 选择身份</view>
					<view class="step-pill font-alimamashuhei" :class="{ active: settleStep >= 2 }">2 搜索名字</view>
					<view class="step-pill font-alimamashuhei" :class="{ active: settleStep >= 3 }">3 复制验证信息</view>
				</view>

				<view v-if="settleStep === 0" class="step-start">
					<button class="start-btn font-alimamashuhei" @click="startSettleFlow">去入驻</button>
				</view>

				<view v-else>
					<view v-if="settleStep === 1" class="form-group">
						<text class="form-label font-alimamashuhei">请选择您的身份</text>
						<view class="role-options">
							<view
								v-for="item in settleRoleOptions"
								:key="item.value"
								class="role-chip font-alimamashuhei"
								:class="[`role-${item.value}`, { active: entryRole === item.value }]"
								@click="selectEntryRole(item.value)"
							>
								{{ item.label }}
							</view>
						</view>
						<text class="desc-text">请先选择您要申请入驻的身份类型。</text>
					</view>

					<view v-if="settleStep === 2" class="form-group search-form-group">
						<text class="form-label font-alimamashuhei">搜索自己的名字</text>
						<common-search
							:key="searchCompKey"
							mode="fill"
							placeholder="搜索并选择您的品牌/名字"
							:show-index-selector="false"
							:defaultIndex="searchIndexByRole"
							@select="onBrandSelect"
							@close-associate="onCloseAssociate"
						/>
						<text v-if="selectedBrandId" class="brand-id">已搜到品牌ID: {{ selectedBrandId }}</text>
						<text v-if="searchResultTip" class="search-result-tip">{{ searchResultTip }}</text>
						<text class="desc-text">请先搜索自己的名字；如果没搜到也可以继续，系统会按“未收录”生成验证信息。</text>
					</view>

					<view v-if="settleStep === 3" class="form-group">
						<text class="form-label font-alimamashuhei">验证信息</text>
						<textarea
							class="info-textarea"
							:value="settleInfo"
							disabled
							placeholder="请先完成前两步"
							auto-height
						/>
						<button class="copy-btn font-alimamashuhei" @click="copySettleInfo">复制验证信息</button>
						<text class="desc-text settle-final-tip">复制后请联系微信号 dogdogdoll 完成入驻。</text>
					</view>

					<view class="step-actions">
						<button v-if="settleStep > 1" class="step-btn ghost font-alimamashuhei" @click="goPrevStep">上一步</button>
						<button class="step-btn primary font-alimamashuhei" @click="goNextStep">
							{{ settleStep >= 3 ? '重新搜索' : '下一步' }}
						</button>
					</view>
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
	const settleStep = ref(0);
	const entryRole = ref('');

	const settleRoleOptions = [{
			label: '店铺',
			value: 'shop'
		},
		{
			label: '妆师',
			value: 'artist'
		},
		{
			label: '毛娘',
			value: 'hairstylist'
		}
	];

	const roleLabelMap = {
		shop: '店铺',
		artist: '妆师',
		hairstylist: '毛娘'
	};

	// 计算是否有品牌
	const hasBrand = computed(() => {
		return userInfo.value.brand_id > 0;
	});


	const searchCompKey = computed(() => `settle-search-${entryRole.value || 'unset'}`);

	const searchIndexByRole = computed(() => {
		if (entryRole.value === 'artist') return 'bjd_artist';
		if (entryRole.value === 'hairstylist') return 'hairstylist';
		return '';
	});

	const searchResultTip = computed(() => {
		if (!brandName.value) return '';
		if (selectedBrandId.value > 0) {
			return `已搜到您的信息，品牌ID：${selectedBrandId.value}`;
		}
		return '未搜到已收录品牌，可继续生成“未收录”验证信息。';
	});

	// 计算入驻信息（根据是否搜到分别生成）
	const settleInfo = computed(() => {
		if (!brandName.value || !entryRole.value) return "";

		const uid = (userInfo.value && userInfo.value.id) ? userInfo.value.id : '未知';
		const roleLabel = roleLabelMap[entryRole.value] || '未选择';
		if (selectedBrandId.value > 0) {
			return `您好，我申请入驻。\nUID：${uid}\n身份：${roleLabel}\n我已搜索到自己的名字：${brandName.value}\n品牌ID：${selectedBrandId.value}\n请协助我绑定该品牌并完成入驻。`;
		}
		return `您好，我申请入驻。\nUID：${uid}\n身份：${roleLabel}\n我已搜索自己的名字：${brandName.value}\n搜索结果：未搜到\n请协助我新建收录并完成入驻。`;
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

	// 开始入驻分段流程
	const startSettleFlow = () => {
		settleStep.value = 1;
	};

	const selectEntryRole = (role) => {
		entryRole.value = role;
		brandName.value = '';
		selectedBrandId.value = 0;
	};

	const goPrevStep = () => {
		if (settleStep.value > 1) {
			settleStep.value -= 1;
		}
	};

	const goNextStep = () => {
		if (settleStep.value === 1) {
			if (!entryRole.value) {
				uni.showToast({
					title: '请先选择身份',
					icon: 'none'
				});
				return;
			}
			settleStep.value = 2;
			return;
		}

		if (settleStep.value === 2) {
			if (!brandName.value) {
				uni.showToast({
					title: '请先搜索自己的名字',
					icon: 'none'
				});
				return;
			}
			settleStep.value = 3;
			return;
		}

		// 第三步点击“重新搜索”
		settleStep.value = 2;
	};

	// 处理关闭联想事件
	const onCloseAssociate = (searchTerm) => {
		// 保留用户输入的品牌名称
		brandName.value = searchTerm;
		// 清空品牌ID
		selectedBrandId.value = 0;
	};
	// 品牌选择
	const onBrandSelect = (id, name) => {
		selectedBrandId.value = id;
		brandName.value = name;
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
				title: '请先完成身份选择与搜索',
				icon: 'none'
			});
			return;
		}

		uni.setClipboardData({
			data: settleInfo.value,
			success: () => {
				uni.showToast({
					title: '已复制验证信息',
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
		padding: 18rpx 20rpx calc(30rpx + env(safe-area-inset-bottom));
		display: flex;
		flex-direction: column;
		gap: 18rpx;
		overflow: visible;
	}

	.settle-header {
		text-align: center;
		margin-bottom: 32rpx;

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

	.description,
	.contact-section,
	.form-section,
	.info-section {
		background-color: #fff;
		border-radius: 18rpx;
		box-shadow: 0 8rpx 22rpx rgba(56, 78, 108, 0.08);
	}

	.description {
		padding: 24rpx 24rpx 20rpx;
	}

	.contact-section {
		padding: 24rpx;

		.contact-label {
			display: block;
			font-size: 27rpx;
			color: #3a4456;
			font-weight: 600;
			margin-bottom: 16rpx;
		}

		.contact-content {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 16rpx;
			min-height: 66rpx;

			text {
				font-size: 30rpx;
				color: #333;
				font-weight: bold;
			}

			.copy-btn {
				margin: 0;
				height: 56rpx;
				line-height: 56rpx;
				padding: 0 24rpx;
				display: inline-flex;
				align-items: center;
				justify-content: center;
				font-size: 22rpx;
				font-weight: 600;
				color: #fff;
				border-radius: 999rpx;
				background: linear-gradient(135deg, #78cbdd 0%, #62b9d8 100%);
			}
		}
	}

	.form-section {
		padding: 24rpx;
		margin-top: 0;
		overflow: visible;
		position: relative;
		z-index: 2;

		.step-bar {
			display: flex;
			flex-wrap: wrap;
			gap: 10rpx;
			margin-top: 24rpx;
			margin-bottom: 102rpx;
		}

		.step-pill {
			height: 52rpx;
			line-height: 52rpx;
			padding: 0 20rpx;
			display: inline-flex;
			align-items: center;
			justify-content: center;
			border-radius: 999rpx;
			font-size: 23rpx;
			color: #8b97ab;
			background: #f2f5fa;
			border: 1rpx solid #e6edf5;
			font-weight: 500;
		}

		.step-pill.active {
			color: #2f5d8f;
			background: #e6f4ff;
			border-color: #c9e5ff;
		}

		.step-start {
			padding: 6rpx 0 2rpx;
		}

		.start-btn {
			width: 100%;
			height: 66rpx;
			line-height: 66rpx;
			padding: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			background: linear-gradient(135deg, #78cbdd 0%, #62b9d8 100%);
			color: #fff;
			font-size: 26rpx;
			font-weight: 600;
			border-radius: 14rpx;
			box-shadow: 0 8rpx 18rpx rgba(101, 195, 214, 0.22);
		}

		.start-btn::after,
		.step-btn::after,
		.copy-btn::after {
			border: none;
		}

		.form-group {
			margin-bottom: 90rpx;
			overflow: visible;

			&:last-child {
				margin-bottom: 0;
			}

			&.search-form-group {
				position: relative;
				z-index: 20;
				padding-bottom: 190rpx;
			}

			.form-label {
				display: block;
				font-size: 30rpx;
				color: #2f3b4f;
				font-weight: 700;
				margin-top: 18rpx;
				margin-bottom: 42rpx;
			}

			.role-options {
				display: flex;
				flex-wrap: wrap;
				gap: 14rpx;
				margin-top: 30rpx;
				margin-bottom: 54rpx;
			}

			.role-chip {
				position: relative;
				overflow: hidden;
				height: 58rpx;
				line-height: 58rpx;
				padding: 0 30rpx;
				display: inline-flex;
				align-items: center;
				justify-content: center;
				border-radius: 999rpx;
				font-size: 26rpx;
				font-weight: 600;
				color: #49566e;
				background: linear-gradient(160deg, #ffffff 0%, #f4f8fc 100%);
				border: 1rpx solid #dbe6f2;
				box-shadow: 0 4rpx 10rpx rgba(26, 42, 65, 0.06);
				transition: all 0.2s ease;
			}

			.role-chip::before {
				content: "";
				position: absolute;
				inset: 0;
				opacity: 0;
				transition: opacity 0.2s ease;
			}

			.role-chip.role-shop::before {
				background: linear-gradient(135deg, rgba(103, 182, 255, 0.18), rgba(103, 182, 255, 0.05));
			}

			.role-chip.role-artist::before {
				background: linear-gradient(135deg, rgba(130, 206, 188, 0.22), rgba(130, 206, 188, 0.06));
			}

			.role-chip.role-hairstylist::before {
				background: linear-gradient(135deg, rgba(245, 168, 200, 0.22), rgba(245, 168, 200, 0.06));
			}

			.role-chip:active {
				transform: scale(0.98);
			}

			.role-chip.active {
				color: #1f4f8c;
				border-color: #aecdff;
				box-shadow: 0 8rpx 18rpx rgba(95, 154, 220, 0.22);
				transform: translateY(-2rpx);
			}

			.role-chip.active::before {
				opacity: 1;
			}

			.brand-id {
				display: block;
				font-size: 24rpx;
				color: #667085;
				margin-top: 30rpx;
				text-align: right;
			}

			.search-result-tip {
				display: block;
				font-size: 24rpx;
				color: #5f6e84;
				margin-top: 36rpx;
			}

			.info-textarea {
				width: 100%;
				min-height: 168rpx;
				background-color: #f8fafc;
				border-radius: 14rpx;
				padding: 20rpx;
				font-size: 25rpx;
				color: #39465a;
				margin-bottom: 16rpx;
				box-sizing: border-box;
				border: 1rpx solid #e6edf5;
				line-height: 1.75;
			}

			.copy-btn {
				width: 100%;
				height: 66rpx;
				line-height: 66rpx;
				padding: 0;
				display: flex;
				align-items: center;
				justify-content: center;
				background: linear-gradient(135deg, #78cbdd 0%, #62b9d8 100%);
				color: white;
				font-size: 24rpx;
				font-weight: 600;
				border-radius: 14rpx;
				text-align: center;
				margin-top: 18rpx;
				box-shadow: 0 8rpx 18rpx rgba(101, 195, 214, 0.22);
			}

			.settle-final-tip {
				margin-top: 36rpx;
				color: #72819a;
			}
		}

		.step-actions {
			display: flex;
			align-items: center;
			gap: 14rpx;
			margin-top: 60rpx;
			margin-bottom: 18rpx;
		}

		.step-btn {
			flex: 1;
			height: 64rpx;
			min-height: 64rpx;
			line-height: 64rpx;
			padding: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			border-radius: 12rpx;
			font-size: 24rpx;
			font-weight: 600;
			text-align: center;
			box-sizing: border-box;
		}

		.step-btn.primary {
			background: linear-gradient(135deg, #78cbdd 0%, #62b9d8 100%);
			color: #fff;
			box-shadow: 0 8rpx 18rpx rgba(101, 195, 214, 0.2);
		}

		.step-btn.ghost {
			background: #f4f6fa;
			color: #5a667a;
			border: 1rpx solid #e3e9f1;
		}

		/* 防止搜索结果被后续内容覆盖或截断 */
		:deep(.search_results) {
			z-index: 999;
			max-height: 560rpx;
		}

		:deep(.search_tab) {
			position: relative;
			z-index: 30;
		}
	}

	.desc-text {
		display: block;
		font-size: 25rpx;
		color: #607086;
		line-height: 1.75;
		margin-bottom: 42rpx;

		&:last-child {
			margin-bottom: 0;
		}
	}

	.info-section {
		padding: 24rpx;
		margin: 0;

		.info-title {
			display: block;
			font-size: 30rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 16rpx;
		}

		.info-text {
			display: block;
			font-size: 24rpx;
			color: #555;
			line-height: 1.75;
			margin-bottom: 12rpx;

			&:last-child {
				margin-bottom: 0;
			}
		}
	}
</style>
