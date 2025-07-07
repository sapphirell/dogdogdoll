<template>
	<view>
		<view class="list_item_main_info">
			<text>Puypoodoll - momo</text>
			<text>21分钟前</text>
			<view class="list_view_and_like_box">
				<view class="posion_bottom">
					<view class="icon_inline_text">
						<image class="icon_image" src="../../static/message.png"></image>
						<text>10</text>
					</view>
					<view class="icon_inline_text">
						<image class="icon_image" src="../../static/like.png"></image>
						<text>20</text>
					</view>
				</view>
				
			
			</view>
		</view>
	</view>
</template>

<script setup>

</script>

<style lang="scss" scoped>
.list_item_main_image {
	width: 80px;
	height: 80px;
	padding: 10px;
	float: left;
}
.list_item_main_info{
	float: left;
	width: calc(100vw -  200px);
	box-sizing: border-box;
	padding-top: 10px;
	padding-bottom: 10px;
	height: 100px;
	overflow: hidden;
	position: relative;
	.posion_bottom {
		position: absolute;
		bottom:10px;
		.icon_inline_text {
			margin-right: 10px;
	
		}
	}
	
}
.list_view_and_like_box {
	view {
		float: left;
		opacity: 0.5;
	}
}

</style>