<template>
	<view class="brand-card" :key="key">
		<!-- 品牌信息卡片 -->
		<view class="brand-header" @tap="jumpBrand">
			<image class="brand-logo" v-if="brand.logo_image" :src="brand.logo_image" mode="aspectFit"></image>
			<view class="brand-logo" style="background: linear-gradient(180deg, #d8c1b3 0%, #d3f5ff 100%);align-items: center;" v-else>
				<text style="color: rgb(255, 255, 255);font-size: 100rpx;    display: block; text-align: center;">?</text>
			</view>
			<view class="brand-meta">
				<view class="title-row">
					<!-- <text class="brand-title">{{brand.brand_name}}</text> -->
					<image :src="brand.brand_name_image" mode="heightFix" style="height: 40rpx;"></image>
					<text class="brand-tag">{{brand.country_name}}·{{brand.type}}</text>
					<text class="goods-count">收录{{brand.total_goods}}款</text>
				</view>
				<text class="brand-desc">{{brand.description}}</text>
			</view>
		</view>

		<!-- 横向滚动商品列表 -->
		<scroll-view class="goods-scroll" scroll-x :show-scrollbar="false">
			<view class="goods-list">
				<view 
					class="goods-item" 
					v-for="(doll, index) in brand.goods" 
					:key="doll.id"
					@tap="jumpGoods(doll.id)"
				>
					<image class="goods-image" :src="doll.goods_images && doll.goods_images[0]" mode="aspectFill"></image>
					<text class="goods-name">{{doll.name}}</text>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
const props = defineProps(["brand", "key"])
function jumpBrand() {
	uni.navigateTo({
		url: '/pages/brand/brand?brand_id=' + props.brand.id
	})
}

function jumpGoods(id) {
	uni.navigateTo({
		url: '/pages/goods/goods?goods_id=' + id
	})
}
</script>


<style lang="scss" scoped>
.brand-card {
	width: 660rpx;
	background: #fff;
	border-radius: 16rpx;
	margin: 20rpx 0rpx;
	padding: 24rpx;
	box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.08);
}

.brand-header {
	display: flex;
	gap: 20rpx;
	margin-bottom: 24rpx;
	
	.brand-logo {
		flex-shrink: 0;
		width: 180rpx;
		height: 180rpx;
		border-radius: 8rpx;
		background: #f8f9fa;
	}
}

.brand-meta {
	flex: 1;
	min-width: 0; /* 防止内容溢出 */
	
	.title-row {
		display: flex;
		align-items: center;
		gap: 12rpx;
		margin-bottom: 12rpx;
		white-space: nowrap;
		overflow: hidden;
	}
	
	.brand-title {
		font-size: 28rpx;
		font-weight: 500;
		color: #2c3e50;
		max-width: 40%; /* 根据实际情况调整 */
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	
	.brand-tag {
		font-size: 20rpx;
		color: #95a5a6;
		background: #f8f9fa;
		padding: 2rpx 10rpx;
		border-radius: 6rpx;
		flex-shrink: 0;
	}
	
	.goods-count {
		font-size: 20rpx;
		color: #5dc1f3;
		margin-left: auto;
		flex-shrink: 0;
	}
	
	.brand-desc {
		font-size: 24rpx;
		color: #7f8c8d;
		line-height: 1.4;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
	}
}

/* 横向滚动样式 */
.goods-scroll {
	width: 100%;
	white-space: nowrap;
	
	.goods-list {
		display: inline-flex;
		gap: 20rpx;
	}
	
	.goods-item {
		width: 180rpx;
		flex-shrink: 0;
	}
	
	.goods-image {
		width: 180rpx;
		height: 260rpx;
		border-radius: 8rpx;
		background: #f8f9fa;
	}
	
	.goods-name {
		display: block;
		padding: 8rpx 4rpx;
		font-size: 22rpx;
		color: #666;
		white-space: normal;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
		line-height: 1.4;
	}
}

/* 隐藏滚动条 */
::-webkit-scrollbar {
	display: none;
	width: 0;
	height: 0;
	color: transparent;
}
</style>