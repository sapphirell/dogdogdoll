<template>
	<view-logs />
	<!-- 页面主体 -->
	<view class="backbody">
		<!-- 个人信息部分 -->
		<view class="pageinfo_userinfo">
			<image mode="aspectFill" class="avatar mine_avatar" src="/static/pixsun.png"></image>
			<view class="pageinfo_infobox">
				<text class="mine_username font-alimamashuhei">用户名</text>
				<view>
					<text class="mine_friends">好友 <text class="mine_info_number">10</text></text>
					<text class="mine_message">消息 <text class="mine_info_number">10</text></text>
				</view>
			</view>
		</view>
		<!-- 信息主体 -->
		<view class="pageinfo_body">
			<view>
				<view>
					<view class="uni-list-cell-db pick_size font-alimamashuhei">
						<picker @change="bindPickerChange" :value="index" :range="selectSizeArray">
							<view class="uni-input select_size">{{selectSizeArray[index]}} 
								<image class="icon_image down" src="../../static/arrow_down.png"></image>
							</view>
						</picker>
					</view>
					<icon class=""></icon>
				</view>
				<!-- 左侧边栏 -->
				<view class="left_menu">
					<view v-for="(item, key) in menuList">
						<text class="menu_text font-alimamashuhei" :key="key">{{ item.name }}</text>
					</view>
				</view>
				<!-- 右侧内容 -->
				<view class="right_body">
					<!-- 搜索框 -->
					<common-search></common-search>
					<!-- 列表 -->
					<view>
						<homepage-list-item @click="go2goods"></homepage-list-item>
					</view>
				</view>
			</view>
		</view>

	</view>
	<!-- <ddd-footer onSelect="ddd1111111"></ddd-footer> -->
</template>

<script setup>
	import { ref } from 'vue';
	import { onReachBottom } from "@dcloudio/uni-app"
	
	let selectSizeArray = ['所有尺寸', '一分', '二分', '三分', '四分',  '六分',  '八分',  '十分', '十二分', '其它大尺寸', '棉花娃']
	let index = ref(0)
	let menuList = [
		{name:'上新推送',}, 
		{name:'BJD整娃',}, 
		{name:'单头',}, 
		{name:'假发',}, 
		{name:'娃衣',}, 
		{name:'眼珠',}, 
		{name:'鞋子',}, 
		{name:'支架',}, 
		{name:'其它配件',},
	]
	function bindPickerChange(e) {
		console.log('picker发送选择改变，携带值为', e.detail.value)
		index.value = e.detail.value
	}
	
	const systemInfo = uni.getSystemInfoSync();
	const statusBarHeight = ref(systemInfo.statusBarHeight);
	console.log("状态栏高度" + statusBarHeight.value)
	
	onReachBottom(() => {
		console.log('onEachBottom!')
	})

	function go2goods() {
		uni.navigateTo({
			url: '/pages/goods/goods'
		})
	}
	
	const onShareAppMessage = () => ({
		title: 'BJD娃圈你想知道的这里都有~',
		path: '/pages/news/news',
		success(res) {
			console.log('分享成功', res)
		},
		fail(err) {
			console.log('分享失败', err)
		},
		mp: {
			wxpath: '/pages/index/index.html'
		}
	})
	
	//关闭下拉刷新加载框
	// uni.stopPullDownRefresh();
</script>
<!-- 加载global.css -->
<style lang="scss" >

	.mine_username {
		left: 166px;
		top: 20px;
		width: 122px;
		height: 29px;
		opacity: 1;
		/** 文本1 */
		font-size: 24px;
		font-weight: 400;
		letter-spacing: 0px;
		line-height: 28.8px;
		color: rgba(255, 255, 255, 1);
		text-align: left;
		vertical-align: top;

	}
	.pageinfo_userinfo {
		overflow: hidden;
		left: 0px;
		top: 0px;
		width: 430px;
		height: 100px;
		opacity: 1;
		background: linear-gradient(180deg, rgba(189, 199, 252, 1) 0%,  rgba(192, 237, 233, 1) 100%);
	}
	
	.pageinfo_body {
		width: 100vw;
		height: calc(100vh - 50px);
		opacity: 1;
		border-radius: 25px;
		background: rgba(255, 255, 255, 1);
		box-shadow: 0px 2px 4px  rgba(0, 0, 0, 0.15);
		overflow: hidden;
		
	}
	.pageinfo_infobox {
		float: right;
		width: calc(70% - 50px);
		padding-top: 15px;
	}
	.mine_friends, .mine_message {
		/*文本 1*/
		display: inline-block;
		float: left;
		margin-top: 10px;
		margin-right: 10px;
		height: 40px;
		opacity: 1;
		text-shadow: 0px 2px 4px  rgba(0, 0, 0, 0.25);
		/** 文本1 */
		font-size: 16px;
		font-weight: 400;
		letter-spacing: 0px;
		line-height: 19.2px;
		color: rgba(255, 255, 255, 1);
		text-align: left;
		vertical-align: top;

	}
	.mine_avatar {
		width: 30vw;
		height: 30vw;
		display:inline-block;
		float: left;
		/* margin: 10px 20px 15px 35px; */
		top: 10px;
		left: 35px;
		position: absolute;
		
	}
	.left_menu {
		/*左边栏背景*/
		
		left: -5px;
		top: 138px;
		width: 100px;
		height: 724px;
		opacity: 1;
		background: rgba(255, 255, 255, 1);
		box-shadow: 0px 4px 4px  rgba(0, 0, 0, 0.25);
		float: left;
 
	}
	.right_body {
		float: left;
		width: calc(100vw - 100px);
		// .search_tab {
		// 	padding: 3px 10px;
		// 	input {
		// 		display: inline-block;
		// 		margin-left: 30px;
		// 	}
		// }
		
	}
	.menu_text {
		text-align: center;
		font-size: 14px;
		padding:10px 0px;
		display: block;
		width: 100%;
		box-sizing: border-box;
		color: #444346;
	}
	.pick_size {
		float: right;
		text-align: center;
		width: 100%;
	}
	.select_size {
		opacity: 0.8;
		.down {
			position: relative;
			top: 5px;
		}
	}
</style>

