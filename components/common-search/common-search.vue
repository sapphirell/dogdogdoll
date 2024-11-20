<template>
	<view class="search_tab">
		<image class="icon_image" src="../../static/search.png"></image>
		<input class="common_search_input" placeholder="… 请输入搜索词 …"/>
	</view>
</template>

<script setup>

</script>

<style lang="less">
.search_tab {
	padding: 3px 10px;
	box-sizing: border-box;
	
	image {
		position: relative;
		margin-left: 5px;
		top: 3px;
	}
	.common_search_input {
		display: inline-block;
		margin-left: 30px;
		width: calc(100% - 85px);
		text-align: center;
		top: 3px;
		position: relative;
	}
}
</style>