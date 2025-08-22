<template>
	<view class="artist-detail">
		<!-- 头部信息 -->
		<view class="artist-header">
			<view class="avatar-container">
				<image class="avatar" :src="artistInfo.logo_image" mode="aspectFill" @click="jump2brand(artistInfo.brand_id)"></image>
			</view>
			<view class="info-container">
				<view class="name-container">
					<text class="brand-name"
						@click="jump2brand(artistInfo.brand_id)">{{ artistInfo.brand_name }}</text>
		
				</view>
				<text class="description">{{ artistInfo.description }}</text>
				<view class="status-container">
					<text class="status" v-if="activePlanTab === 'artist'">妆师接单方式:
						{{ artistInfo.status_of_artist_text }}</text>
					<text class="status" v-else>毛娘接单方式: {{ artistInfo.status_of_hairstylist_text }}</text>
				</view>

				<view class="contact-container">
					<text class="contact-info">
						联系方式：{{  artistInfo.contact ? artistInfo.contact : "尚未设置" }}
					</text>
					<text class="copy-tip" @click="copyContactInfo">复制</text>
					<!-- <text class="delivery-btn" @click="onlineDelivery">在线投递</text> -->
				</view>
			</view>
		</view>

		<!-- 主Tab切换 -->
		<view class="main-tabs">
			<view class="tab-item" :class="{ active: activeMode === 'works' }" @click="switchMode('works')">
				作品展示
			</view>
			<view class="tab-item" :class="{ active: activeMode === 'plans' }" @click="switchMode('plans')">
				开单记录
			</view>
		</view>

		<!-- 作品展示模式 -->
		<view v-if="activeMode === 'works'">
			<view class="showcase-header">
				<text class="showcase-title">作品展示</text>
				<view class="showcase-divider"></view>
			</view>

			<!-- 高亮图片展示 -->
			<scroll-view class="highlight-scroll" scroll-x>
				<view class="highlight-container">
					<image v-for="(img, index) in artistInfo.highlight_images" :key="index" :src="img" mode="aspectFill"
						class="highlight-img"></image>
				</view>
			</scroll-view>

			<!-- Tab切换 -->
			<view class="tabs">
				<view class="tab-item" :class="{ active: activePlanTab === 'artist' }" @click="switchPlanTab('artist')">
					妆师作品
				</view>
				<view class="tab-item" :class="{ active: activePlanTab === 'hairstylist' }"
					@click="switchPlanTab('hairstylist')">
					毛娘作品
				</view>
			</view>

			<!-- 作品列表 -->
			<view class="works-list">
				<!-- 妆师作品 -->
				<template v-if="activePlanTab === 'artist'">
					<view class="work-item" v-for="(work, index) in worksList" :key="work.id"
						@click="navigateToFaceup(work.id)">
						<image class="work-cover" :src="work.image_urls[0]" mode="aspectFill"></image>
						<view class="work-info">
							<view class="work-header">
								<text class="work-head" @click.stop="navigateToGoods(work.goods_id)">
									{{ work.head_name }}</text>
								<view class="sex-tag" :class="work.sex === '男' ? 'male' : 'female'">
									{{ work.sex }}
								</view>
							</view>


							<!-- 风格标签 -->
							<view class="style-tags" v-if="work.style_tags && work.style_tags.length">
								<view class="style-tag" v-for="(tag, idx) in work.style_tags" :key="idx"
									:style="{ backgroundColor: getTagColor(tag) }">
									{{ tag }}
								</view>
							</view>
						</view>
					</view>
				</template>

				<!-- 毛娘作品 -->
				<template v-else>
					<view class="no-works">
						<image class="empty-icon" src="/static/images/empty.png" mode="aspectFit"></image>
						<text class="empty-text">暂无作品</text>
					</view>
				</template>
			</view>

			<!-- 加载更多 -->
			<view class="load-more" v-if="hasMore && activePlanTab === 'artist'">
				<uni-load-more status="loading"></uni-load-more>
			</view>
			<view class="no-more" v-else-if="activePlanTab === 'artist' && worksList.length > 0">
				<text>— 已经到底了 —</text>
			</view>
		</view>

		<!-- 开单记录模式 -->
		<view v-else>
			<view class="showcase-header">
				<text class="showcase-title">开单记录</text>
				<view class="showcase-divider"></view>
			</view>

			<!-- 开单Tab切换 -->
			<view class="tabs">
				<view class="tab-item" :class="{ active: activePlanTab === 'artist' }" @click="switchPlanTab('artist')">
					妆师开单
				</view>
				<view class="tab-item" :class="{ active: activePlanTab === 'hairstylist' }"
					@click="switchPlanTab('hairstylist')">
					毛娘开单
				</view>
			</view>

			<!-- 开单记录列表 -->
			<view class="plans-list">
				<view v-for="(plan, index) in orderPlans" :key="plan.id" class="plan-item">


					<view class="plan-images">
						<image v-for="(img, imgIndex) in plan.images" :key="imgIndex" :src="img" mode="aspectFill"
							class="plan-image" @click="previewPlanImages(plan.images, imgIndex)"></image>
					</view>

					<view class="plan-info">
						<text class="info-item">接单类型: {{ getOrderTypeText(plan.order_type) }}</text>
						<text class="info-item">名额:
							{{ plan.max_participants }}人/每人{{ plan.max_submissions_per_user }}单</text>
						<text class="info-item">
							{{ formatDate(plan.open_time * 1000) }} 至 {{ formatDate(plan.close_time * 1000) }}
							<view class="plan-status" :class="plan.is_active ? 'active' : 'inactive'">
								{{ plan.is_active ? '进行中' : '已结束' }}
							</view>
						</text>

					</view>

					<!-- 档位展示 -->
					<view class="tiers-section">
						<text class="section-title">档位选择</text>
						<view class="tiers-container">
							<view v-for="(tier, tierIndex) in plan.tiers" :key="tierIndex" class="tier-item">
								<text class="tier-title">{{ tier.title }}</text>
								<text class="tier-price">¥{{ tier.price }}</text>
								<text class="tier-desc">{{ tier.description }}</text>
							</view>
						</view>
					</view>

					<!-- 加购服务 -->
					<view class="addons-section" v-if="plan.addons && plan.addons.length">
						<text class="section-title">加购服务</text>
						<view class="addons-container">
							<view v-for="(addon, addonIndex) in plan.addons" :key="addonIndex" class="addon-item">
								<text class="addon-title">{{ addon.title }}</text>
								<text class="addon-price">+¥{{ addon.price }}</text>
								<text class="addon-desc">{{ addon.description }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 加载更多 -->
			<view class="load-more" v-if="hasMorePlans">
				<uni-load-more status="loading"></uni-load-more>
			</view>
			<view class="no-more" v-else-if="orderPlans.length > 0">
				<text>— 没有更多开单记录了 —</text>
			</view>
			<view class="no-works" v-else>
				<image class="empty-icon" src="/static/images/empty.png" mode="aspectFit"></image>
				<text class="empty-text">暂无开单记录</text>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted
	} from 'vue';
	import { onLaunch, onShow, onLoad } from '@dcloudio/uni-app'
	import {
		websiteUrl
	} from "@/common/config.js";

	// 艺术家信息
	const artistInfo = ref({
		artist_id: 0,
		brand_id: 0,
		brand_name: '',
		description: '',
		logo_image: '',
		highlight_images: [],
		status_of_artist: 0,
		status_of_artist_text: '',
		status_of_hairstylist: 0,
		status_of_hairstylist_text: '',
		base_price_of_artist: 0,
		base_price_of_hairstylist: 0
	});

	// 作品列表
	const worksList = ref([]);
	const activeMode = ref('works'); // works: 作品展示, plans: 开单记录
	const activePlanTab = ref('artist'); // artist: 妆师, hairstylist: 毛娘
	const currentPage = ref(1);
	const pageSize = ref(20);
	const hasMore = ref(true);
	const brandId = ref(0);

	// 开单记录相关
	const orderPlans = ref([]);
	const plansPage = ref(1);
	const plansPageSize = ref(5);
	const hasMorePlans = ref(true);

	// 获取URL参数
	const getUrlParams = (options) => {
		console.log(options)
		brandId.value = options?.brand_id || 0;
	};

	const getTagColor = (tag) => {
		const colors = [
			'#FFEEF2', '#E8F5FF', '#F0FFF0', '#FFF8E8',
			'#F5F0FF', '#E8FFF8', '#FFF0F5', '#F0F8FF'
		];
		const index = tag.charCodeAt(0) % colors.length;
		return colors[index];
	};
	
	function jump2brand(id) {
		uni.navigateTo({
			url: '/pages/brand/brand?brand_id=' + id
		})
	}

	// 获取艺术家信息
	const fetchArtistInfo = async () => {
		try {
			const res = await uni.request({
				url: `${websiteUrl.value}/brand-artist/info?brand_id=${brandId.value}`,
				method: 'GET'
			});

			if (res.data.status === 'success') {
				artistInfo.value = res.data.data;
			} else {
				uni.showToast({
					title: '获取创作者信息失败',
					icon: 'none'
				});
			}
		} catch (error) {
			uni.showToast({
				title: '网络错误',
				icon: 'none'
			});
		}
	};

	// 获取作品列表
	const fetchWorksList = async () => {
		try {
			const res = await uni.request({
				url: `${websiteUrl.value}/brand-artist/bjd-faceup?brand_id=${brandId.value}&page=${currentPage.value}&size=${pageSize.value}`,
				method: 'GET'
			});

			if (res.data.status === 'success') {
				const newList = res.data.data.list;
				if (currentPage.value === 1) {
					worksList.value = newList;
				} else {
					worksList.value = [...worksList.value, ...newList];
				}

				// 检查是否还有更多数据
				hasMore.value = worksList.value.length < res.data.data.total;
			} else {
				console.log(res)
				uni.showToast({
					title: '获取作品列表失败',
					icon: 'none'
				});
			}
		} catch (error) {
			uni.showToast({
				title: '网络错误',
				icon: 'none'
			});
		}
	};

	// 复制联系信息
	const copyContactInfo = () => {
		const contactInfo = activePlanTab.value === 'artist' ?
			artistInfo.value.contact_info_artist :
			artistInfo.value.contact_info_hairstylist;

		if (!contactInfo) {
			uni.showToast({
				title: '暂无联系信息',
				icon: 'none'
			});
			return;
		}

		uni.setClipboardData({
			data: contactInfo,
			success: () => {
				uni.showToast({
					title: '已复制联系信息',
					icon: 'success'
				});
			}
		});
	};

	// 在线投递
	const onlineDelivery = () => {
		uni.showToast({
			title: '当前版本暂未开放在线投递功能',
			icon: 'none',
			duration: 3000
		});
	};

	// 获取开单记录
	const fetchOrderPlans = async () => {
		try {
			const artistType = activePlanTab.value === 'artist' ? 1 : 2;
			const res = await uni.request({
				url: `${websiteUrl.value}/brand-artist/order-plans?brand_id=${brandId.value}&artist_type=${artistType}&page=${plansPage.value}&size=${plansPageSize.value}`,
				method: 'GET'
			});

			if (res.data.status === 'success') {
				const newPlans = res.data.data;
				if (plansPage.value === 1) {
					orderPlans.value = newPlans;
				} else {
					orderPlans.value = [...orderPlans.value, ...newPlans];
				}

				// 检查是否还有更多数据
				hasMorePlans.value = newPlans.length === plansPageSize.value;
			} else {
				uni.showToast({
					title: '获取开单记录失败',
					icon: 'none'
				});
			}
		} catch (error) {
			uni.showToast({
				title: '网络错误',
				icon: 'none'
			});
		}
	};

	// 复制到剪贴板
	const copyToClipboard = (text) => {
		uni.setClipboardData({
			data: text,
			success: () => {
				uni.showToast({
					title: '已复制',
					icon: 'success',
					duration: 1500
				});
			},
			fail: () => {
				uni.showToast({
					title: '复制失败',
					icon: 'none',
					duration: 1500
				});
			}
		});
	};

	// 预览开单记录图片
	const previewPlanImages = (images, currentIndex) => {
		uni.previewImage({
			current: currentIndex, // 当前显示图片的索引
			urls: images, // 需要预览的图片链接列表
			indicator: "number", // 显示数字指示器
			loop: true, // 是否可循环播放
			success: () => {
				console.log('预览图片成功');
			},
			fail: (err) => {
				console.log('预览图片失败', err);
				uni.showToast({
					title: '预览图片失败',
					icon: 'none'
				});
			}
		});
	};

	// 获取接单类型文本
	const getOrderTypeText = (type) => {
		const types = {
			1: '长期接单',
			2: '限时手速',
			3: '限时抽选',
			4: '限时黑箱卡',
			9: '关闭投递'
		};
		return types[type] || '未知类型';
	};

	// 切换主模式
	const switchMode = (mode) => {
		activeMode.value = mode;
		if (mode === 'plans') {
			plansPage.value = 1;
			fetchOrderPlans();
		}
	};

	// 切换计划Tab
	const switchPlanTab = (tab) => {
		activePlanTab.value = tab;
		if (activeMode.value === 'works') {
			currentPage.value = 1;
			fetchWorksList();
		} else {
			plansPage.value = 1;
			fetchOrderPlans();
		}
	};

	// 格式化日期
	const formatDate = (timestamp) => {
		if (!timestamp) return '';
		const date = new Date(timestamp);

		// 获取年月日时分秒
		const year = date.getFullYear();
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const day = date.getDate().toString().padStart(2, '0');
		const hours = date.getHours().toString().padStart(2, '0');
		const minutes = date.getMinutes().toString().padStart(2, '0');
		const seconds = date.getSeconds().toString().padStart(2, '0');

		return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
	};

	// 跳转到商品页面
	const navigateToGoods = (goodsId) => {
		uni.navigateTo({
			url: `/pages/goods/goods?goods_id=${goodsId || 1576}`
		});
	};

	// 跳转到妆面详情页面
	const navigateToFaceup = (id) => {
		uni.navigateTo({
			url: `/pages/artwork/artwork?id=${id}`
		});
	};

	// 触底加载更多
	const onReachBottom = () => {
		if (activeMode.value === 'works' && activePlanTab.value === 'artist' && hasMore.value) {
			currentPage.value += 1;
			fetchWorksList();
		} else if (activeMode.value === 'plans' && hasMorePlans.value) {
			plansPage.value += 1;
			fetchOrderPlans();
		}
	};

	// 初始化
	onLoad((options) => {
		console.log('页面加载', options);
		uni.setNavigationBarTitle({
			title: "妆师毛娘主页"
		})
		getUrlParams(options);
		fetchArtistInfo();
		fetchWorksList();
	});

	// 隐藏导航栏
	uni.setNavigationBarTitle({
		title: ''
	});
</script>

<style lang="less" scoped>
	.artist-detail {
		background-color: #f8f8f8;
		min-height: 100vh;
		padding: 24rpx;
		padding-bottom: 120rpx;
	}

	.artist-header {
		display: flex;
		margin-bottom: 32rpx;
		padding: 24rpx;
		background-color: #fff;
		border-radius: 16rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
	}

	.avatar-container {
		width: 160rpx;
		height: 160rpx;
		border-radius: 50%;
		overflow: hidden;
		border: 2rpx solid #f5f5f5;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
		flex-shrink: 0;
	}

	.avatar {
		width: 100%;
		height: 100%;
		border-radius: 50%;
	}

	.info-container {
		flex: 1;
		margin-left: 24rpx;
		display: flex;
		flex-direction: column;
		justify-content: center;
		overflow: hidden;
	}

	.brand-name {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 12rpx;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.description {
		font-size: 28rpx;
		color: #666;
		margin-bottom: 12rpx;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.status-container {
		display: flex;
		align-items: center;
	}

	.status {
		font-size: 24rpx;
		color: #666;
		background-color: #f5f5f5;
		padding: 6rpx 16rpx;
		border-radius: 20rpx;
	}

	/* 主Tab样式 */
	.main-tabs {
		display: flex;
		border-bottom: 1rpx solid #eee;
		margin-bottom: 32rpx;
		padding: 0 24rpx;
		background-color: #fff;
		border-radius: 16rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	}

	.main-tabs .tab-item {
		flex: 1;
		text-align: center;
		padding: 28rpx 0;
		font-size: 32rpx;
		color: #666;
		position: relative;
		font-weight: 500;
	}

	.main-tabs .tab-item.active {
		color: #171e22;
		font-weight: 600;
	}

	.main-tabs .tab-item.active::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 100rpx;
		height: 6rpx;
		background-color: #171e22;
		border-radius: 4rpx;
	}

	.highlight-scroll {
		width: auto;
		white-space: nowrap;
		margin: 0 24rpx 32rpx;
		border-radius: 20rpx;
		overflow: hidden;
	}

	.highlight-container {
		display: inline-flex;
		padding-right: 24rpx;
	}

	.highlight-img {
		width: 240rpx;
		height: 240rpx;
		border-radius: 16rpx;
		margin-right: 20rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
		transition: transform 0.3s ease;
	}

	.highlight-img:active {
		transform: scale(0.98);
	}

	.tabs {
		display: flex;
		border-bottom: 1rpx solid #eee;
		margin-bottom: 32rpx;
		padding: 0 24rpx;
	}

	.tabs .tab-item {
		flex: 1;
		text-align: center;
		padding: 24rpx 0;
		font-size: 30rpx;
		color: #666;
		position: relative;
		font-weight: 500;

		&.active {
			color: #333;
			font-weight: 600;

			&::after {
				content: '';
				position: absolute;
				bottom: 0;
				left: 50%;
				transform: translateX(-50%);
				width: 80rpx;
				height: 6rpx;
				background-color: #171e22;
				border-radius: 4rpx;
			}
		}
	}

	.works-list {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 24rpx;
		padding: 0 8rpx;
	}

	.work-item {
		background-color: #fff;
		border-radius: 16rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
		transition: transform 0.3s ease, box-shadow 0.3s ease;
	}

	.work-item:active {
		transform: translateY(4rpx);
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
	}

	.work-cover {
		width: calc(100% - 20rpx);
		height: 320rpx;
		border-radius: 16rpx;
		margin: 10rpx;
		box-sizing: border-box;
	}

	.work-info {
		padding: 20rpx;
	}

	.work-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12rpx;
	}

	.work-title {
		font-size: 28rpx;
		color: #333;
		font-weight: 600;
		flex: 1;
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
		margin-right: 12rpx;
	}

	.sex-tag {
		font-size: 20rpx;
		padding: 4rpx 12rpx;
		border-radius: 20rpx;
		font-weight: 500;

		&.male {
			background-color: #E8F5FF;
			color: #1890FF;
		}

		&.female {
			background-color: #FFEEF2;
			color: #FF4D6A;
		}
	}

	.work-head {
		font-size: 24rpx;
		color: #666;
		display: block;
		margin-bottom: 12rpx;
		padding-left: 8rpx;
		padding-right: 18rpx;
	}

	.style-tags {
		display: flex;
		flex-wrap: wrap;
		margin: 12rpx 0;
		gap: 8rpx;
	}

	.style-tag {
		font-size: 20rpx;
		padding: 4rpx 12rpx;
		border-radius: 20rpx;
		color: #666;
		font-weight: 400;
	}

	.work-date {
		font-size: 22rpx;
		color: #999;
		display: block;
		margin-top: 8rpx;
	}

	.load-more {
		text-align: center;
		padding: 40rpx 0;
	}

	.no-more {
		text-align: center;
		padding: 40rpx 0;
		color: #999;
		font-size: 26rpx;
	}

	.no-works {
		text-align: center;
		padding: 80rpx 0;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.empty-icon {
		width: 200rpx;
		height: 200rpx;
		margin-bottom: 24rpx;
		opacity: 0.6;
	}

	.empty-text {
		color: #999;
		font-size: 28rpx;
	}

	.showcase-header {
		margin: 32rpx 24rpx 24rpx;
		position: relative;
	}

	.showcase-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
		position: relative;
		padding-left: 16rpx;
		z-index: 1;
	}

	.showcase-title::before {
		content: '';
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%);
		width: 6rpx;
		height: 28rpx;
		background-color: #171e22;
		border-radius: 3rpx;
	}

	.showcase-divider {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 8rpx;
		height: 1rpx;
		background-color: #eee;
		z-index: 0;
	}

	/* 开单记录样式 */
	.plans-list {
		padding: 0 24rpx;
	}

	.plan-item {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
	}

	.plan-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.plan-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}

	.plan-status {
		font-size: 24rpx;
		padding: 6rpx 16rpx;
		border-radius: 20rpx;
		font-weight: 500;
		display: inline-block;

		&.active {
			background-color: #E8F5FF;
			color: #1890FF;
		}

		&.inactive {
			background-color: #f5f5f5;
			color: #999;
		}
	}

	.plan-images {
		display: flex;
		overflow-x: auto;
		gap: 16rpx;
		margin-bottom: 20rpx;
		padding-bottom: 8rpx;
	}

	.plan-image {
		width: 200rpx;
		height: 200rpx;
		border-radius: 12rpx;
		flex-shrink: 0;
	}

	.plan-info {
		display: flex;
		flex-direction: column;
		gap: 12rpx;
		margin-bottom: 24rpx;
	}

	.info-item {
		font-size: 26rpx;
		color: #666;
	}

	.section-title {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 16rpx;
		display: block;
	}

	.tiers-section,
	.addons-section {
		margin-bottom: 24rpx;
	}

	.tiers-container,
	.addons-container {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 16rpx;
	}

	.tier-item,
	.addon-item {
		background-color: #f9f9f9;
		border-radius: 12rpx;
		padding: 16rpx;
	}

	.tier-title,
	.addon-title {
		font-size: 26rpx;
		font-weight: 500;
		color: #333;
		display: block;
	}

	.tier-price,
	.addon-price {
		font-size: 28rpx;
		font-weight: bold;
		color: #ff4d6a;
		display: block;
		margin: 8rpx 0;
	}

	.tier-desc,
	.addon-desc {
		font-size: 24rpx;
		color: #999;
		display: block;
	}

	/* 新增的联系信息样式 */
	.contact-container {
		display: flex;
		align-items: center;
		margin-top: 16rpx;
		padding: 12rpx 0;
		font-size: 26rpx;
		color: #333;
		border-top: 1rpx dashed #eee;
		flex-wrap: wrap;
	}

	.contact-info {
		flex: 1;
		padding-right: 16rpx;
		word-break: break-all;
	}

	.copy-tip {
		color: #1890FF;
		padding: 4rpx 12rpx;
		background-color: #E8F5FF;
		border-radius: 8rpx;
		margin-right: 16rpx;
		font-size: 24rpx;
	}

	.delivery-btn {
		color: #fff;
		background-color: #171e22;
		padding: 8rpx 24rpx;
		border-radius: 8rpx;
		font-size: 24rpx;
	}

	/* 调整头部信息容器间距 */
	.info-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		overflow: hidden;
		gap: 12rpx;
		/* 增加元素间间距 */
	}

	/* 调整状态容器样式 */
	.status-container {
		display: flex;
		align-items: center;
		margin-top: 4rpx;
	}
</style>