<template>
	<view class="brand" :key="key">
		<view class="brand_info_tab">
			<view @tap="jumpBrand">
				<image class="index_brand_logo" :src="brand.logo_image" mode="aspectFit"></image>
				<view class="brand_info">
					<text class="font-alimamashuhei">{{brand.brand_name}} （{{brand.country_name}} {{brand.type}}）</text>
					<text class="brand_description">{{brand.description}}</text>
					<text class="font-alimamashuhei tab_text doll_record" >收录词条 ({{brand.total_goods}})</text>
				</view>
				<div style="clear: both;"></div>
			</view>
		</view>
	
		<view class="dolls">
			<view class="doll_item" v-for="(doll, index) in brand.goods" :key="doll.id">
				<view @tap="jumpGoods(doll.id)" >
					<image class="doll_images" :src="doll.goods_images[0]" mode="aspectFill"></image>
					<text class=" doll_name">{{doll.name}}</text>
				</view>
			</view>
		</view>
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
.tab_text {
	color: #806161;
	margin-left: 5px;
	font-size: 13px;
	
}
.doll_record {
	    text-align: left!important;
	    margin-top: 15px;
	    margin-left: 5px;
	    font-size: 14px;
	    color: #6eb9d2!important;
}
.doll_name {font-family: monospace; color: #806161; font-size: 22rpx;}
.dolls {
	display: flex;
	justify-content: flex-start;
	gap: 20rpx;
	.doll_item {
		width: calc(25vw - 15px);
		height: 110px;
		// margin: 5px auto;
		overflow: hidden;
		// float: left;
		image {
			width: 100%;
			// height: 120px;
			background: #ddd;
			border-radius: 5rpx;
			height: auto;             /* 高度自动调整以保持比例 */
			aspect-ratio: 1; 
		}
		text {
			text-align: center;
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
			width: 100%;
			display: block;
		}
	}
}
.brand {
	width: 90vw;
	min-height: 150px;
	margin:0px 8px 5px 8px;
	padding:15px 5px 10px 5px;
	// border: 1px solid #ddd;
	background-color: #fff;
	border-radius: 8px;
	// box-shadow: 0 1px 3px #ddd;
	// display: flex;
	float: left;
	.index_brand_logo {
		width: 100px;
		height: 80px;
		float: left;
	}
	.brand_info_tab {
		min-height: 210rpx;
	}
	.brand_info {
		width: calc(100vw - 155px);
		height: 70px;
		float: left;
		text {
			text-align: center;
			width: 100%;
			display: block;
			color: #888;
			overflow: hidden;
		}
		.brand_description {
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 3; /* 设置显示的行数 */
			overflow: hidden;
			text-overflow: ellipsis;
			line-height: 1.7; /* 行高 */
			max-height: 5.5em; /* 最大高度，行数 * 行高 */
			text-align-last: left;
			text-align: left;
			box-sizing: border-box;
			padding-left: 5px;
			padding-top: 8px;
			font-size: 22rpx;
		}
	}
	

}
</style>