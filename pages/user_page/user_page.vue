<template>
	<view class="page-container">
		<view class="header_container">
			<!-- 头部区域 -->
			<view class="header">
				<image class="avatar" :src="userInfo.avatar" mode="aspectFill" />
				<text class="username">{{ userInfo.user_name }}</text>
			</view>

			<!-- Tab切换 -->
			<view class="tabs">
				<view v-for="(tab, index) in tabs" :key="index" class="tab-item font-alimamashuhei"
					:class="{ active: currentTab === index }" @click="currentTab = index">
					{{ tab }}
				</view>
			</view>
		</view>


		<!-- 内容区域 -->
		<view class="content">
			<!-- 搭配列表 -->
			<view v-if="currentTab === 0" class="collocation-list">
				<view v-for="(item, index) in collocations" :key="index" class="collocation-item item-image-container"
					@click="navigateTo(`/pages/collocation_share/collocation_share?collocation_id=${item.id}`)">
					<image class="item-image" :src="item.cover" mode="aspectFill" />
					<text class="item-title">{{ item.title }}</text>
				</view>
			</view>

			<!-- 娃柜列表 -->
			<view v-if="currentTab === 1" class="doll-list">
				<view v-for="(item, index) in dolls" :key="index" class="doll-item item-image-container"
					@click="navigateTo(`/pages/user_doll/user_doll?id=${item.id}`)">
					<image class="item-image" :src="item.cover" mode="aspectFill" />
					<text class="item-title">{{ item.title }}</text>
					<text class="item-price">¥{{ item.price }}</text>
				</view>
			</view>

			<!-- 点评列表 -->
			<view v-if="currentTab === 2" class="review-list">
				<view v-for="(item, index) in reviews" :key="index" class="review-item ">
					<image class="product-thumb" :src="item.product_thumb" mode="aspectFill" />
					<view class="review-content">
						<text class="product-name">{{ item.product_name }}</text>
						<text class="review-text">{{ item.content }}</text>
						<text class="review-time">{{ item.create_time }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		watch,
		onMounted,

	} from 'vue';
	import {
		onShow,
		onReachBottom,
	} from "@dcloudio/uni-app";
	import {
		websiteUrl,
		wechatSignLogin,
		getUserInfo,
		global,
	} from "../../common/config.js";


	const currentTab = ref(0);
	const tabs = ref(['搭配', '娃柜', '点评']);
	const props = defineProps(["uid"]);

	// 用户信息
	const userInfo = ref({
		avatar: '',
		user_name: '加载中...'
	});

	// 各列表数据
	const collocations = ref([]);
	const dolls = ref([]);
	const reviews = ref([]);

	// 修改后的分页参数（每个tab独立）
	const paginations = ref([{ // 搭配
			page: 1,
			pageSize: 10,
			total: 0,
			loading: false,
			finished: false
		},
		{ // 娃柜
			page: 1,
			pageSize: 10,
			total: 0,
			loading: false,
			finished: false
		},
		{ // 点评
			page: 1,
			pageSize: 10,
			total: 0,
			loading: false,
			finished: false
		}
	]);
	// 监听tab切换
	watch(currentTab, (newVal) => {
		const currentPagination = paginations.value[newVal];
		// currentPagination.page = 1;
		// currentPagination.finished = false;

		const currentData = [collocations, dolls, reviews][newVal].value;
		if (currentData.length === 0) {
			loadData();
		}
	});


	// 统一数据加载方法
	const loadData = async () => {
		const currentPagination = paginations.value[currentTab.value];
		if (currentPagination.loading || currentPagination.finished) {
			return;
		}

		currentPagination.loading = true;
		try {
			let url, listKey;
			switch (currentTab.value) {
				case 0:
					url = `/user-info/collection?user_id=${props.uid}&page=${currentPagination.page}`;
					listKey = 'List';
					break;
				case 1:
					url = `/user-info/show-case?user_id=${props.uid}&page=${currentPagination.page}`;
					listKey = 'List';
					break;
				case 2:
					url = `/user-info/posts?user_id=${props.uid}&page=${currentPagination.page}`;
					listKey = 'comment_list';
					break;
			}
			console.log(`${websiteUrl}${url}`)
			const res = await uni.request({
				url: `${websiteUrl}${url}`
			});

			if (res.data.status === 'success') {
				const data = res.data.data;
				const list = data[listKey];

				// 数据转换
				const transformed = list.map(item => {
					switch (currentTab.value) {
						case 0: // 搭配
							return {
								id: item.id,
									cover: item.image_urls?.split(',')[0] || '',
									images: item.image_urls?.split(',') || [],
									title: item.title,
									time: item.created_at
							};
						case 1: // 娃柜
							return {
								id: item.id,
									cover: item.image_urls?.split(',')[0] || '',
									title: item.name,
									desc: item.description,
									time: item.created_at
							};
						case 2: // 点评
							return {
								id: item.id,
									product_thumb: item.target_image,
									product_name: item.target_name,
									content: item.comment,
									create_time: formatTime(item.created_at)
							};
					}
				});

				// 更新数据
				const target = [collocations, dolls, reviews][currentTab.value];
				target.value = [...target.value, ...transformed];

				// 更新当前tab的分页状态
				currentPagination.total = data.total;
				currentPagination.finished = target.value.length >= data.total;
				currentPagination.page++;
			}
		} catch (error) {
			console.log(error)
			uni.showToast({
				title: '数据加载失败',
				icon: 'none'
			});
		} finally {
			currentPagination.loading = false;
		}
	};

	// 获取用户信息
	const getAuthorInfo = async () => {
		try {
			const res = await uni.request({
				url: `${websiteUrl}/user-info?uid=${props.uid}`,
			});

			if (res.data.status === 'success') {
				userInfo.value = res.data.data
			}
		} catch (error) {
			uni.showToast({
				title: '用户信息加载失败',
				icon: 'none'
			});
		}
	};

	// 时间格式化
	const formatTime = (timestamp) => {
		const date = new Date(timestamp * 1000);
		return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
	};
	
	// 设置标题
	uni.setNavigationBarTitle({
		title: '用户主页',
	})

	// 初始化加载
	onShow(() => {
		getAuthorInfo();
		loadData();
	});

	// 上拉加载更多
	onReachBottom(() => {
		loadData();
	});
</script>
<style lang="less" scoped>
	.page-container {
		background-color: #f5f5f5;
	}

	.header_container {
		// background: #e0f3ff;
		// background-image: radial-gradient(#fff 20%, transparent 0);
		// background-size: 20px 20px;
		background: linear-gradient(180deg, rgb(235 240 255) 0%, rgb(255 235 239) 100%);

		.header {
			display: flex;
			align-items: center;
			padding: 90rpx 40rpx 50rpx 40rpx;
			// background-color: #fff;

			.avatar {
				width: 120rpx;
				height: 120rpx;
				border-radius: 50%;
				margin-right: 30rpx;
			}

			.username {
				display: block;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
				// margin: 20rpx 0 40rpx 0;
				font-weight: bold;
				color: #606060;
				font-size: 30rpx;
				max-width: 400rpx;
			}
		}

		.tabs {
			display: flex;
			// background-color: #fff;
			border-bottom: 1rpx solid #eee;

			.tab-item {
				flex: 1;
				text-align: center;
				padding: 20rpx 0;
				font-size: 32rpx;
				color: #666;
				font-size: 28rpx;

				&.active {
					color: #5792d3;
					font-weight: bold;
					border-bottom: 4rpx solid #5792d3;
				}
			}
		}
	}


	.content {
		padding: 20rpx;
		box-sizing: border-box;
		background: #fff
	}

	// 通用图片容器样式
	.item-image-container {
		position: relative;
		width: 100%;
		padding-top: 100%; // 通过padding实现正方形
		border-radius: 16rpx;
		overflow: hidden;
		background: #fff;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

		.item-image {
			height: calc(100% - 55rpx);
		}
	}

	// 图片绝对定位填充容器
	.item-image {
		width: 100%;
		height: 100%;
	}

	// 搭配列表（一行三个）
	.collocation-list {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20rpx;

		.collocation-item {
			position: relative;
			padding: 8rpx; // 增加内边距
			height: 250rpx;
			width: 200rpx;

			.item-title {
				padding: 10rpx;
				color: #4c4c4c;
				font-weight: 600;
				display: block;
			}
		}
	}


	// 娃柜列表（一行两个）
	.doll-list {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 20rpx;

		.doll-item {
			padding: 15rpx;
			background: #fff;
			border-radius: 16rpx;
			width: 300rpx;
			height: 450rpx;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

			.item-title {
				display: block;
				font-size: 26rpx;
				margin: 15rpx 0 8rpx;
				padding: 0 10rpx;
				.ellipsis();
			}

			.item-price {
				display: block;
				color: #ff4444;
				font-size: 28rpx;
				font-weight: 600;
				padding: 0 10rpx 15rpx;
			}
		}
	}

	// 点评列表
	.review-list {
		.review-item {
			display: flex;
			padding: 20rpx;
			background-color: #fff;
			border-radius: 12rpx;
			margin-bottom: 20rpx;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
			

			.product-thumb {
				width: 120rpx;
				height: 120rpx;
				border-radius: 12rpx;
			}

			.review-content {
				flex: 1;
				display: flex;
				flex-direction: column;
				padding-left: 20rpx;
			}

			.product-name {
				font-size: 28rpx;
				font-weight: bold;
				margin-bottom: 10rpx;
			}

			.review-text {
				font-size: 26rpx;
				color: #666;
				margin-bottom: 10rpx;
				.multi-ellipsis(2);
			}

			.review-time {
				font-size: 24rpx;
				color: #999;
			}
		}
	}

	// 文字截取 mixin
	.ellipsis() {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.multi-ellipsis(@lines) {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: @lines;
		overflow: hidden;
	}


</style>