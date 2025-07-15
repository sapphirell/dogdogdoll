<template>
	<view v-if="loadingSuccess" class="detail-container">
		<!-- 头图区域 -->
		<view class="header-image-container">
			    <!-- 使用swiper组件支持多图轮播 -->
			    <swiper class="swiper" 
					:autoplay="true" 
					:interval="3000" 
					:circular="true" 
					indicator-dots
					:style="{ height: swiperHeight + 'px' }">
			        <swiper-item v-for="(img, index) in imageList" :key="index">
			            <!-- 添加外层容器实现垂直居中 -->
			            <view class="image-container">
			                <image 
								:src="img" 
								mode="widthFix" 
								class="header-image"
								@load="handleImageLoad($event, index)"></image>
			            </view>
			        </swiper-item>
			    </swiper>
			    <view class="image-overlay"></view>
			</view>

		<!-- 标题区域 -->
		<view class="title-container">
			<text class="title">{{detail.name}}</text>
			<view class="category-tag">{{detail.type}}</view>
		</view>

		<!-- 信息列表 -->
		<view class="info-section">
			<view class="section-title">
				<uni-icons type="list" size="16" color="#5db7ff"></uni-icons>
				<text>详细信息</text>
			</view>

			<view class="info-container">
				<!-- 数量 -->
				<view class="info-line" v-if="detail.count">
					<view class="info-label">
						<uni-icons type="number" size="14" color="#5db7ff"></uni-icons>
						<text>数量</text>
					</view>
					<view class="info-value">
						{{detail.count}}
					</view>
				</view>

				<!-- 价格 -->
				<view class="info-line" v-if="detail.price || detail.final_price > 0">
					<view class="info-label">
						<uni-icons type="money" size="14" color="#5db7ff"></uni-icons>
						<text>价格</text>
					</view>
					<view class="info-value">
						<!-- 新增总价显示 -->
						<text v-if="detail.final_price > 0" class="highlight">总价: {{detail.price}}元</text>
						<text v-else>{{detail.price}}元</text>
					</view>
				</view>

				<!-- 新增尾款金额行 -->
				<view class="info-line" v-if="detail.final_price > 0">
					<view class="info-label">
						<uni-icons type="money" size="14" color="#5db7ff"></uni-icons>
						<text>尾款金额</text>
					</view>
					<view class="info-value">
						<text class="highlight">{{detail.final_price}}元</text>
						<text v-if="detail.final_time" class="time-tag">（{{detail.final_time}}）</text>
					</view>
				</view>

				<!-- 店铺 -->
				<view class="info-line" v-if="detail.shop_name">
					<view class="info-label">
						<uni-icons type="shop" size="14" color="#5db7ff"></uni-icons>
						<text>店铺</text>
					</view>
					<view class="info-value">
						{{detail.shop_name}}
					</view>
				</view>

				<!-- 尺寸 -->
				<view class="info-line" v-if="detail.size || detail.size_detail">
					<view class="info-label">
						<uni-icons type="compose" size="14" color="#5db7ff"></uni-icons>
						<text>尺寸</text>
					</view>
					<view class="info-value">
						{{detail.size}} {{detail.size_detail}}
					</view>
				</view>

				<!-- 头围 -->
				<view class="info-line" v-if="detail.head_circumference">
					<view class="info-label">
						<uni-icons type="circle" size="14" color="#5db7ff"></uni-icons>
						<text>头围</text>
					</view>
					<view class="info-value">
						{{detail.head_circumference}}
					</view>
				</view>

				<!-- 肩宽 -->
				<view class="info-line" v-if="detail.shoulder_width">
					<view class="info-label">
						<uni-icons type="arrowright" size="14" color="#5db7ff"></uni-icons>
						<text>肩宽</text>
					</view>
					<view class="info-value">
						{{detail.shoulder_width}}
					</view>
				</view>

				<!-- 妆师 -->
				<view class="info-line" v-if="detail.makeup_artist">
					<view class="info-label">
						<uni-icons type="person" size="14" color="#5db7ff"></uni-icons>
						<text>妆师</text>
					</view>
					<view class="info-value">
						{{detail.makeup_artist}}
					</view>
				</view>

				<!-- 颜色 -->
				<view class="info-line" v-if="detail.color">
					<view class="info-label">
						<uni-icons type="color" size="14" color="#5db7ff"></uni-icons>
						<text>颜色</text>
					</view>
					<view class="info-value">
						{{detail.color}}
						<view class="color-preview" :style="{backgroundColor: detail.color}"></view>
					</view>

				</view>
			</view>
		</view>

		<!-- 时间信息 -->
		<view class="info-section" v-if="detail.buy_date || detail.arrival_date">
			<view class="section-title">
				<uni-icons type="calendar" size="16" color="#5db7ff"></uni-icons>
				<text>时间信息</text>
			</view>

			<view class="info-container">
				<!-- 购入时间 -->
				<view class="info-line" v-if="detail.buy_date">
					<view class="info-label">
						<uni-icons type="cart" size="14" color="#5db7ff"></uni-icons>
						<text>购入时间</text>
					</view>
					<view class="info-value">
						{{detail.buy_date}}
					</view>
				</view>

				<!-- 到家日期 -->
				<view class="info-line" v-if="detail.arrival_date">
					<view class="info-label">
						<uni-icons type="home" size="14" color="#5db7ff"></uni-icons>
						<text>到家日期</text>
					</view>
					<view class="info-value">
						{{detail.arrival_date}}
					</view>
				</view>
			</view>
		</view>

		<!-- 位置信息 -->
		<view class="info-section" v-if="detail.position">
			<view class="section-title">
				<uni-icons type="location" size="16" color="#5db7ff"></uni-icons>
				<text>位置信息</text>
			</view>

			<view class="info-container">
				<!-- 存放位置 -->
				<view class="info-line">
					<view class="info-label">
						<uni-icons type="map" size="14" color="#5db7ff"></uni-icons>
						<text>存放位置</text>
					</view>
					<view class="info-value">
						{{detail.position}}
					</view>
				</view>
			</view>
		</view>

		<!-- 附加信息 -->
		<view class="info-section" v-if="detail.additional_value || detail.remark">
			<view class="section-title">
				<uni-icons type="info" size="16" color="#5db7ff"></uni-icons>
				<text>附加信息</text>
			</view>

			<view class="info-container">
				<!-- 附加值 -->
				<view class="info-line" v-if="detail.additional_value">
					<view class="info-label">
						<uni-icons type="plus" size="14" color="#5db7ff"></uni-icons>
						<text>附加值</text>
					</view>
					<view class="info-value">
						{{detail.additional_value}}
					</view>
				</view>

				<!-- 备注 -->
				<view class="info-line" v-if="detail.remark">
					<view class="info-label">
						<uni-icons type="chat" size="14" color="#5db7ff"></uni-icons>
						<text>备注</text>
					</view>
					<view class="info-value">
						{{detail.remark}}
					</view>
				</view>
			</view>
		</view>
	</view>

	<!-- 加载状态 -->
	<!-- 	<view v-else class="loading-container">
		<uni-icons type="spinner-cycle" size="30" color="#5db7ff" class="loading-icon"></uni-icons>
		<text class="loading-text">加载中...</text>
	</view> -->
	<!-- 编辑按钮 -->
	<view class="edit-button-container" @click="navigateToEdit">
		<view class="edit-button">
			<uni-icons type="compose" size="22" color="#fff"></uni-icons>
		</view>
	</view>
	<loading-toast :show="!loadingSuccess"></loading-toast>
</template>

<script setup>
	import {
		ref,
		computed
	} from 'vue';
	import {
		onShow
	} from '@dcloudio/uni-app';
	import {
		websiteUrl,
		wechatSignLogin,
		getUserInfo,
		global,
		asyncGetUserInfo,
	} from "../../common/config.js";
	// 
	const props = defineProps(["account_book_id"])


	const loadingSuccess = ref(false)
	const detail = ref({})

	const swiperHeight = ref(500); // 默认高度
	const imageHeights = ref([]); // 存储每张图片的高度
		const screenWidth = ref(0); // 屏幕宽度
	// 图片加载处理函数
	const handleImageLoad = (event, index) => {
			if (!screenWidth.value) return;
			
			// 获取图片原始宽高
			const { width: originWidth, height: originHeight } = event.detail;
			
			// 计算等比例缩放后的高度
			const renderHeight = (originHeight / originWidth) * screenWidth.value;
			
			// 存储计算后的高度
			imageHeights.value[index] = renderHeight;
			
			// 计算当前所有已加载图片中的最大高度
			const currentHeights = imageHeights.value.filter(h => h);
			if (currentHeights.length > 0) {
				const maxHeight = Math.max(...currentHeights);
				
				// 如果计算出的最大高度大于当前swiper高度，则更新
				if (maxHeight > swiperHeight.value) {
					swiperHeight.value = maxHeight;
				}
			}
		};
	// 在script部分添加计算属性
	const imageList = computed(() => {
		if (!detail.value.image_url) return [];
		// 使用逗号分割图片字符串
		return detail.value.image_url.split(',').map(url => url.trim());
	});
	// 获取账本详情
	const fetchDetail = async (id) => {
		const token = uni.getStorageSync('token');
		try {
			const res = await uni.request({
				url: `${websiteUrl}/with-state/account-book-detail?id=${id}`,
				method: 'GET',
				header: {
					'Authorization': token
				}
			});

			if (res.data.status === "success") {
				detail.value = res.data.data;
				// 模拟加载延迟
				setTimeout(() => {
					loadingSuccess.value = true
					uni.setNavigationBarTitle({
						title: detail.value.name || "账本详情"
					})
				}, 600);
			} else {
				uni.showToast({
					title: res.data.msg || "获取详情失败",
					icon: "none"
				});
			}
		} catch (error) {
			uni.showToast({
				title: "网络请求失败",
				icon: "none"
			});
		}
	};
	// 导航到编辑页面
	const navigateToEdit = () => {
		uni.navigateTo({
			url: `/pages/stock/account_book_form/account_book_form?account_book_id=${props.account_book_id}`
		});
	};
	onShow(() => {
		swiperHeight.value = 300; // 重置为默认高度
		imageHeights.value = [];
		
		// 重新获取屏幕宽度（考虑横竖屏切换）
		const systemInfo = uni.getSystemInfoSync();
		screenWidth.value = systemInfo.windowWidth;
				
		asyncGetUserInfo().then((userInfo) => {

			fetchDetail(props.account_book_id)
		})
	})
</script>

<style lang="less">
	.detail-container {
		padding-bottom: 40rpx;
		background: linear-gradient(to bottom, #f0f4ff, #ffffff 20%);
		min-height: 100vh;
	}

	/* 头部图片样式 */
	.header-image-container {
		position: relative;
		width: 100%;
		overflow: hidden;
		box-shadow: 0 10rpx 30rpx rgba(93, 120, 255, 0.15);
	}

	.header-image {
		width: 100%;
		height: 100%;
		display: block;
	}

	.image-overlay {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 120rpx;
		background: linear-gradient(to top, rgba(240, 244, 255, 0.9), transparent);
	}

	/* 标题区域 */
	.title-container {
		padding: 30rpx;
		position: relative;
		text-align: center;
		margin-top: -60rpx;
	}

	.title {
		font-size: 40rpx;
		font-weight: bold;
		color: #1a1a1a;
		display: block;
		margin-bottom: 15rpx;
		text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
	}

	.category-tag {
		display: inline-block;
		padding: 6rpx 24rpx;
		background-color: #eef2ff;
		color: #5db7ff;
		border-radius: 50rpx;
		font-size: 24rpx;
		font-weight: 500;
	}

	/* 分区标题 */
	.section-title {
		padding: 20rpx 30rpx;
		font-size: 30rpx;
		font-weight: bold;
		color: #333;
		display: flex;
		align-items: center;
		background-color: #f8faff;
		border-bottom: 1rpx solid #e8ecff;
		margin-top: 20rpx;

		text {
			margin-left: 10rpx;
		}
	}

	/* 信息容器 */
	.info-container {
		padding: 0 30rpx;
		background-color: #fff;
		border-radius: 20rpx;
		margin: 0 20rpx;
		box-shadow: 0 4rpx 20rpx rgba(93, 120, 255, 0.08);
	}

	/* 信息行样式 */
	.info-line {
		display: flex;
		align-items: center;
		padding: 28rpx 0;
		border-bottom: 1rpx solid #f5f7ff;
		transition: all 0.2s ease;

		&:last-child {
			border-bottom: none;
		}

		&:active {
			background-color: #f9faff;
		}
	}

	.info-label {
		width: 180rpx;
		display: flex;
		align-items: center;
		color: #666;
		font-size: 28rpx;
		font-weight: 500;

		text {
			margin-left: 10rpx;
		}
	}

	.info-value {
		flex: 1;
		font-size: 28rpx;
		color: #333;
		font-weight: 500;
		display: flex;
		align-items: center;
	}

	/* 特殊样式 */
	.highlight {
		color: #ff6b6b;
		font-weight: bold;
	}

	.time-tag {
		background-color: #f0f4ff;
		color: #5db7ff;
		padding: 4rpx 12rpx;
		border-radius: 8rpx;
		font-size: 24rpx;
		margin-left: 10rpx;
	}

	.color-preview {
		width: 30rpx;
		height: 30rpx;
		border-radius: 6rpx;
		margin-right: 12rpx;
		border: 1rpx solid #eee;
	}

	/* 加载状态 */
	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 80vh;
	}

	.loading-icon {
		animation: rotate 1.5s linear infinite;
	}

	.loading-text {
		margin-top: 30rpx;
		color: #999;
		font-size: 28rpx;
	}

	@keyframes rotate {
		from {
			transform: rotate(0deg);
		}

		to {
			transform: rotate(360deg);
		}
	}

	/* 编辑按钮样式 */
	.edit-button-container {
		position: fixed;
		right: 30rpx;
		bottom: 80rpx;
		z-index: 100;
	}

	.edit-button {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #97e7f7, #d5acd6);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 6rpx 20rpx rgba(45, 140, 240, 0.4);
		transition: all 0.3s ease;

		&:active {
			transform: scale(0.95);
			box-shadow: 0 3rpx 10rpx rgba(45, 140, 240, 0.3);
		}


	}

	.swiper {
			width: 100%;
			// transition: height 0.1s ease; /* 添加高度过渡效果 */
		}
		
		/* 新增图片容器样式 */
		.image-container {
			display: flex;
			align-items: center;
			justify-content: center;
			height: 100%;
			width: 100%;
			overflow: hidden;
		}
		
		.header-image {
			width: 100%;
			max-height: 100%;
			display: block;
		}
	
</style>