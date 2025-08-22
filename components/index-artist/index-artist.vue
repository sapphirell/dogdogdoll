<template>
	<view class="artist-list-container">
		<!-- 顶部操作栏 -->
		<view class="top-actions">
			<view class="filter-btn" @click="showFilterPopup">
				<uni-icons type="tune" size="18" color="#fff"></uni-icons>
				<text style="color: #fff;font-size: 24rpx;">筛选</text>
			</view>
			<view class="help-btn" @click="showHelpModal">
				<uni-icons type="help" size="24" color="#808080"></uni-icons>
			</view>
		</view>

		<!-- 妆师列表 -->
		<view class="artist-list">
			<view 
				v-for="(artist, index) in filteredArtists" 
				:key="index" 
				class="artist-card"
				@click="navigateToArtistDetail(artist)"
			>
				<!-- 妆师基本信息 -->
				<view class="artist-info">
					<image :src="artist.logo_image" class="artist-avatar" mode="aspectFill"></image>
					<view class="artist-details">
						<view class="artist-name">{{ artist.brand_name }}</view>
						<view class="artist-status">
							<text :class="['status-badge', statusClass(artist.status)]">
								{{ artist.status_text }}
							</text>
						</view>
						<view class="artist-price">
							<text class="price-label">基础价格:</text>
							<text class="price-value">¥{{ artist.base_price }}</text>
						</view>
						<view class="artist-desc" v-if="artist.description">
							{{ artist.description }}
						</view>
					</view>
				</view>
				
				<!-- 高亮作品展示 -->
				<view class="highlight-works" v-if="artist.highlight_img && artist.highlight_img.length > 0">
					<scroll-view scroll-x class="works-scroll">
						<view 
							v-for="(img, imgIndex) in artist.highlight_img" 
							:key="imgIndex" 
							class="work-item"
						>
							<image :src="img" class="work-image" mode="aspectFill"></image>
						</view>
					</scroll-view>
				</view>
				<view class="no-works" v-else>
					暂无作品展示
				</view>
			</view>
		</view>
		
		<!-- 加载更多 -->
		<view class="load-more" v-if="showLoadMore">
			<text v-if="loading">加载中...</text>
			<text v-else>上拉加载更多</text>
		</view>
		
		<!-- 空状态 -->
		<view class="empty-state" v-if="filteredArtists.length === 0 && !loading">
			<image src="/static/empty-artist.png" class="empty-image"></image>
			<text class="empty-text">未找到符合条件的妆师</text>
			<button class="reset-btn" @click="resetFilters">重置筛选</button>
		</view>
		
		<!-- 帮助声明弹窗 -->
		<common-modal :visible="helpModalVisible" @update:visible="helpModalVisible = $event" top="15vh">
			<scroll-view scroll-y="true" class="help-modal-content">
				<view class="modal-title">妆师/毛娘信息说明</view>
				<view class="modal-text">
					<text class="bold">基础妆费说明：</text>
					<text>基础妆费是妆师妆则中费用最低的一个选项，例如：自由妆200、半指定300、全指定400，选取自由妆费作为展示。</text>
				</view>
				<view class="modal-text">
					<text class="bold">价格说明：</text>
					<text>受限于数据收集困难等原因，妆师妆费价格与实际价格可能存在差距，如有错误请在妆师主页留言订正，我们会很快核对更新。</text>
				</view>
				<view class="modal-text">
					<text class="bold">交易说明：</text>
					<text>当前软件版本暂不支持在线交易，交易详情、责任与规则以联系本人为准。</text>
				</view>
				<view class="modal-text">
					<text class="bold">接管词条：</text>
					<text>在【我的-作者入驻】中申请</text>
				</view>
				<view class="modal-close" @click="helpModalVisible = false">我知道了</view>
			</scroll-view>
		</common-modal>
		
		<!-- 筛选弹窗 -->
		<bottom-popup :show="filterPopupVisible" @close="filterPopupVisible = false">
			<view class="filter-popup-content">
				<view class="popup-header">
					<text class="popup-title">筛选条件</text>
					<uni-icons type="closeempty" size="24" color="#666" @click="filterPopupVisible = false"></uni-icons>
				</view>
				
				<view class="filter-section">
					<view class="section-title">接单状态</view>
					<view class="status-buttons">
						<view 
							v-for="(status, index) in statusFilters" 
							:key="index"
							:class="['status-btn', {active: activeStatus === status.value}]"
							@click="activeStatus = status.value"
						>
							{{ status.label }}
						</view>
					</view>
				</view>
				
				<view class="filter-section">
					<view class="section-title">价格区间</view>
					<view class="price-inputs">
						<input v-model="minPrice" type="number" placeholder="最低价" class="price-input" />
						<text class="price-separator">-</text>
						<input v-model="maxPrice" type="number" placeholder="最高价" class="price-input" />
					</view>
				</view>
				
				<view class="popup-actions">
					<button class="popup-btn reset" @click="resetFilters">重置</button>
					<button class="popup-btn apply" @click="applyFilter">应用</button>
				</view>
			</view>
		</bottom-popup>
	</view>
</template>

<script setup>
	import {
		ref,
		computed,
		onMounted
	} from 'vue';
	import {
		websiteUrl,
		image1Url
	} from '@/common/config.js';
	import {
		onLoad,
		onReachBottom,
		onPullDownRefresh,
	} from "@dcloudio/uni-app"

	// 状态筛选选项
	const statusFilters = ref([{
			label: '全部',
			value: 0
		},
		{
			label: '长期接单',
			value: 1
		},
		{
			label: '限时手速',
			value: 2
		},
		{
			label: '限时抽选',
			value: 3
		},
		{
			label: '黑箱卡',
			value: 4
		},
		{
			label: '关闭接单',
			value: 9
		}
	]);
	
	// 组件数据
	const artists = ref([]);
	const filteredArtists = ref([]);
	const activeStatus = ref(0); // 0表示全部
	const minPrice = ref('');
	const maxPrice = ref('');
	const page = ref(1);
	const size = ref(20);
	const total = ref(0);
	const loading = ref(false);
	const showLoadMore = ref(true);
	const helpModalVisible = ref(false); // 帮助弹窗显示状态
	const filterPopupVisible = ref(false); // 筛选弹窗显示状态

	// 初始化加载数据
	onMounted(() => {
		fetchArtistList();
	});

	// 获取妆师列表
	const fetchArtistList = async () => {
		try {
			loading.value = true;
			
			// 构造请求参数
			const params = {
				page: page.value,
				size: size.value
			};
			
			// 添加状态筛选参数（如果不为0）
			if (activeStatus.value !== 0) {
				params.status = activeStatus.value;
			}
			
			// 添加价格筛选参数
			if (minPrice.value) {
				params.min_price = minPrice.value;
			}
			if (maxPrice.value) {
				params.max_price = maxPrice.value;
			}
			
			const response = await uni.request({
				url: `${websiteUrl.value}/brand-artist-list`,
				method: 'GET',
				data: params
			});

			const data = response.data;
			if (data.status === 'success') {
				// 如果是第一页，重置列表
				if (page.value === 1) {
					artists.value = [];
				}
				
				artists.value = [...artists.value, ...data.data.list];
				total.value = data.data.total;

				// 应用当前筛选条件
				applyFilters();

				// 检查是否还有更多数据
				showLoadMore.value = artists.value.length < total.value;
			} else {
				uni.showToast({
					title: data.msg || '获取数据失败',
					icon: 'none'
				});
			}
		} catch (error) {
			console.error('获取妆师列表失败:', error);
			uni.showToast({
				title: '网络请求失败',
				icon: 'none'
			});
		} finally {
			loading.value = false;
		}
	};
	
	// 显示筛选弹窗
	const showFilterPopup = () => {
		filterPopupVisible.value = true;
	};
	
	// 应用筛选条件
	const applyFilter = () => {
		filterPopupVisible.value = false;
		page.value = 1;
		fetchArtistList();
	};

	// 显示帮助弹窗
	const showHelpModal = () => {
		helpModalVisible.value = true;
	};

	// 应用关键词筛选
	const applyFilters = () => {
		filteredArtists.value = artists.value;
	};

	// 重置筛选条件
	const resetFilters = () => {
		activeStatus.value = 0;
		minPrice.value = '';
		maxPrice.value = '';
		page.value = 1;
		fetchArtistList();
		filterPopupVisible.value = false;
	};

	// 导航到妆师详情页
	const navigateToArtistDetail = (artist) => {
		uni.navigateTo({
			url: "/pages/artist_info/artist_info?brand_id=" + artist.brand_id
		})
	};


	// 状态标签样式
	const statusClass = (status) => {
		switch (status) {
			case 1:
				return 'status-long-term';
			case 2:
				return 'status-speed';
			case 3:
				return 'status-lottery';
			case 4:
				return 'status-black-card';
			case 9:
				return 'status-closed';
			default:
				return '';
		}
	};

	// 上拉加载更多
	onReachBottom(() => {
		if (!loading.value && showLoadMore.value) {
			page.value += 1;
			fetchArtistList();
		}
	});

	// 下拉刷新
	onPullDownRefresh(() => {
		artists.value = [];
		page.value = 1;
		fetchArtistList().then(() => {
			uni.stopPullDownRefresh();
		});
	});
</script>

<style lang="less">
	.artist-list-container {
		min-height: 100vh;
	}
	
	/* 顶部操作栏 */
	.top-actions {
		display: flex;
		justify-content: space-between;
		margin-bottom: 20rpx;
		height: 60rpx;
		
		.filter-btn {
			display: flex;
			align-items: center;
			padding: 0rpx 25rpx;
			border-radius: 40rpx;
			background: linear-gradient(135deg, #97e7f7, #d5acd6);
			color: #fff;
			font-size: 28rpx;
			box-shadow: 0 4rpx 10rpx rgba(151, 231, 247, 0.4);
			margin-left: 20rpx;
			text {
				margin-left: 10rpx;
			}
		}
		
		.help-btn {
			width: 80rpx;
			height: 80rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			// background: #818181;
			border-radius: 50%;
			// box-shadow: 0 4rpx 10rpx rgba(151, 231, 247, 0.4);
		}
	}

	/* 筛选弹窗内容 */
	.filter-popup-content {
		padding: 30rpx;
		
		.popup-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 40rpx;
			
			.popup-title {
				font-size: 32rpx;
				font-weight: bold;
				color: #333;
			}
		}
		
		.filter-section {
			margin-bottom: 40rpx;
			
			.section-title {
				font-size: 28rpx;
				color: #666;
				margin-bottom: 20rpx;
				font-weight: 500;
			}
			
			.status-buttons {
				display: flex;
				flex-wrap: wrap;
				gap: 20rpx;
				
				.status-btn {
					padding: 15rpx 30rpx;
					border-radius: 40rpx;
					background-color: #f5f5f5;
					color: #666;
					font-size: 26rpx;
					
					&.active {
						background: linear-gradient(135deg, #97e7f7, #d5acd6);
						color: #fff;
					}
				}
			}
			
			.price-inputs {
				display: flex;
				align-items: center;
				
				.price-input {
					flex: 1;
					height: 80rpx;
					padding: 0 30rpx;
					background-color: #f5f5f5;
					border-radius: 40rpx;
					font-size: 28rpx;
					text-align: center;
				}
				
				.price-separator {
					margin: 0 20rpx;
					color: #666;
				}
			}
		}
		
		.popup-actions {
			display: flex;
			justify-content: space-between;
			margin-top: 30rpx;
			
			.popup-btn {
				flex: 1;
				height: 70rpx;
				border-radius: 40rpx;
				font-size: 26rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				
				&.reset {
					background-color: #f5f5f5;
					color: #666;
					margin-right: 20rpx;
				}
				
				&.apply {
					background: linear-gradient(135deg, #97e7f7, #d5acd6);
					color: #fff;
				}
				
				&::after {
					border: none;
				}
			}
		}
	}

	.artist-list {
		.artist-card {
			background-color: #fff;
			border-radius: 16rpx;
			margin-bottom: 24rpx;
			padding: 24rpx;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		}

		.artist-info {
			display: flex;
			margin-bottom: 20rpx;

			.artist-avatar {
				width: 120rpx;
				height: 120rpx;
				border-radius: 12rpx;
				margin-right: 24rpx;
				background-color: #f0f0f0;
			}

			.artist-details {
				flex: 1;

				.artist-name {
					font-size: 32rpx;
					font-weight: bold;
					color: #333;
					margin-bottom: 8rpx;
				}

				.artist-status {
					margin-bottom: 8rpx;

					.status-badge {
						display: inline-block;
						padding: 4rpx 16rpx;
						border-radius: 8rpx;
						font-size: 22rpx;

						&.status-long-term {
							background-color: #e6f7ff;
							color: #1890ff;
						}

						&.status-speed {
							background-color: #fff7e6;
							color: #fa8c16;
						}

						&.status-lottery {
							background-color: #f6ffed;
							color: #52c41a;
						}

						&.status-black-card {
							background-color: #f9f0ff;
							color: #722ed1;
						}

						&.status-closed {
							background-color: #f5f5f5;
							color: #bfbfbf;
						}
					}
				}

				.artist-price {
					font-size: 26rpx;
					color: #666;
					margin-bottom: 8rpx;

					.price-label {
						margin-right: 8rpx;
					}

					.price-value {
						color: #ff9c9a;
						font-weight: bold;
					}
				}

				.artist-desc {
					font-size: 26rpx;
					color: #999;
					margin-top: 8rpx;
					overflow: hidden;
					text-overflow: ellipsis;
					display: -webkit-box;
					-webkit-line-clamp: 2;
					-webkit-box-orient: vertical;
				}
			}
		}

		.highlight-works {
			.works-scroll {
				white-space: nowrap;

				.work-item {
					display: inline-block;
					width: 220rpx;
					height: 220rpx;
					margin-right: 20rpx;
					border-radius: 8rpx;
					overflow: hidden;

					&:last-child {
						margin-right: 0;
					}

					.work-image {
						width: 100%;
						height: 100%;
					}
				}
			}
		}

		.no-works {
			text-align: center;
			padding: 40rpx 0;
			color: #999;
			font-size: 26rpx;
			background-color: #f9f9f9;
			border-radius: 8rpx;
		}
	}

	.load-more {
		text-align: center;
		padding: 30rpx 0;
		color: #999;
		font-size: 26rpx;
	}

	.empty-state {
		text-align: center;
		padding: 100rpx 0;

		.empty-image {
			width: 300rpx;
			height: 300rpx;
			margin-bottom: 40rpx;
		}

		.empty-text {
			display: block;
			color: #999;
			font-size: 28rpx;
			margin-bottom: 40rpx;
		}

		.reset-btn {
			width: 60%;
			background-color: #ff7a7a;
			color: #fff;
			border-radius: 50rpx;
		}
	}
	
	/* 帮助弹窗样式 */
	.help-modal-content {
		padding: 30rpx;
		width: 580rpx;
		
		.modal-title {
			font-size: 32rpx;
			font-weight: bold;
			text-align: center;
			margin-bottom: 30rpx;
			color: #333;
		}
		
		.modal-text {
			margin-bottom: 20rpx;
			font-size: 26rpx;
			line-height: 1.6;
			color: #555;
			
			.bold {
				font-weight: bold;
				color: #333;
				display: block;
				margin-bottom: 5rpx;
			}
		}
		
		.modal-close {
			margin-top: 30rpx;
			text-align: center;
			color: #ff7a7a;
			font-size: 28rpx;
			font-weight: bold;
			padding: 15rpx;
		}
	}
</style>
