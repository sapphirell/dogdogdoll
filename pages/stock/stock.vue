<template>
	<common-page head_color="rgb(185 195 253)">
		<view class="container" style="overflow: hidden;">
			<view class="head_container">
				<view class="switch_tab">
					<button @click="switch_tab(1)" class="font-alimamashuhei" :class="{'active': activeTab === 1}">
						<text>账本</text>
					</button>
					<button @click="switch_tab(2)" class="font-alimamashuhei" :class="{'active': activeTab === 2}">
						<text>展示柜</text>
					</button>
					<button @click="switch_tab(3)" class="font-alimamashuhei" :class="{'active': activeTab === 3}">
						<text>尾款日历</text>
					</button>
				</view>
			</view>


			<view class="data_body">
				<transition :name="transitionName()">
					<view class="tab_body_1st" v-if="activeTab === 1" :class="{ none: activeTab !== 1 }">
						<picker class="type-picker" mode="selector" :value="selectedType" :range="accountBookTypeList"
							@change="updateSelectedType">
							<view class="uni-input">{{ accountBookTypeList[selectedType] }}</view>
						</picker>

						<view class="content" v-if="accountBookData.account_books?.length > 0">
							<view class="content-grid">
								<view v-for="(item, index) in accountBookData.account_books" :key="index"
									class="grid-item" @tap="go2editor(item.id)">
									<image :src="item.image_url" mode="aspectFill" class="item-image"></image>
									<text class="item-type">{{ item.type }}</text>
									<view class="item-info">
										<text class="item-price">{{ item.price }}￥</text>
									</view>
									<view class="item-info">
										<text class="item-name one_line_text">{{ item.name }}</text>
									</view>
								</view>
							</view>
						</view>

						<view class="content" v-else>
							<text>暂无数据</text>
						</view>

						<view>
							<button class="jump2addButton" @tap="go2addAccountBook">+</button>
						</view>
					</view>
				</transition>
				<transition :name="transitionName()">
					<view class="tab_body_sec" v-if="activeTab === 2" :class="{ none: activeTab !== 2 }">
						<!-- 展示柜 -->
						<view v-if="showcaseData.showcases && showcaseData.showcases.length > 0" class="sec_container">

							<view v-for="(item, index) in showcaseData.showcases" :key="index" class="sec_row"
								@tap="go2editorShowCase(item.id)">
								<image :src="item.image_url" mode="aspectFill" class="sec_image"></image>
								<view class="sec_content">
									<text class="font-alimamashuhei one_line_text sec_title">{{ item.name }}</text>
									<text class="sec_description">{{ item.description }}</text>
								</view>
							</view>

						</view>
						<!-- 添加展示柜数据 -->
						<view>
							<button class="jump2addButton" @tap="go2addShowCase">+</button>
						</view>
					</view>
				</transition>
				<transition :name="transitionName()">
					<view class="tab_body_3th" v-if="activeTab === 3" :class="{ none: activeTab !== 3 }">
						<view style="padding: 5rpx;">
							<!-- 遍历每个月的数据 -->
							<view v-for="(bills, month) in billData" :key="month">
								<view>
									<text class="month-header font-alimamashuhei">{{ month }} 账单</text>
								</view>

								<!-- 遍历当前月份的账单 -->
								<view v-for="bill in bills" :key="bill.id" class="bill-item" @tap="go2addBill(bill.id)">
									<view style="width: calc(60vw - 40rpx) ;display: inline-block; height: 50rpx;">
										<view style="margin: 8rpx 0rpx;">
											<text style="font-size: 20rpx;font-weight: 1000; color: #77767c;"
												class="font-alimamashuhei">{{ bill.name }}</text>
										</view>
										<view>
											<text style="color: #a6a6a6;">待补款: <text
													style="color:rgb(116 202 229);font-weight: 900;font-size: 20rpx;">¥{{ bill.price }}</text></text>
										</view>

									</view>
									<view style="width: 40vw;display: inline-block;height: 50rpx;">
										<view style="margin: 8rpx 0rpx;">
											<text style="position: relative;bottom: 6rpx;color: #a6a6a6;"
												class="font-alimamashuhei">日期: {{ bill.ymd }}</text>
										</view>
										<view>
											<text v-if="bill.status === 0 " style="color: #a6a6a6;">未补款</text>
											<text v-else style="color: #a6a6a6;">已补款</text>
										</view>

									</view>
								</view>
							</view>
						</view>
						<view>
							<button class="jump2addButton" @tap="go2addBill(false)">+</button>
						</view>
					</view>
				</transition>
			</view>
		</view>

	</common-page>
</template>

<script setup>
	import {
		ref
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

	// 状态栏高度
	const systemInfo = uni.getSystemInfoSync();
	const statusBarHeight = ref(systemInfo.statusBarHeight);

	// 当前激活的 tab
	const activeTab = ref(1);
	const previousTab = ref(1); // 记录上一次的 tab
	// 切换动画名称
	function transitionName() {
		return activeTab.value > previousTab.value ? 'slide_left' : 'slide_right';
	};

	function switch_tab(index) {
		previousTab.value = activeTab.value; // 更新上一次的 tab
		activeTab.value = index; // 切换激活 tab
		console.log(`切换到 tab ${index}`);
		switch (index) {
			case 1:
				getAccountBookData();
				activeTab.value = 1;
				break;
			case 2:
				activeTab.value = 2;
				getShowcaseData();
				break;
			case 3:
				activeTab.value = 3;
				getBillData();
				break;
		}
	}

	// 账本下选择的下拉菜单按钮
	const selectedType = ref(0);

	// 账本下选择的下拉菜单按钮
	const accountBookTypeList = ref(['全部', '娃头', '娃衣', '眼珠', '假发', '娃鞋']);

	// 账本数据
	const accountBookData = ref({});

	// 展示柜数据
	const showcaseData = ref({});

	// 账单数据
	const billData = ref({});

	// 切换账本选择类型
	function updateSelectedType(e) {
		selectedType.value = e.detail.value
		getAccountBookData(accountBookTypeList.value[selectedType.value])
	}
	//获取账本数据
	function getAccountBookData(type) {
		console.log(global)
		if (!global.isLogin) {
			return
		}
		let token = uni.getStorageSync('token');
		let url = websiteUrl + '/with-state/account-book';
		if (type && type !== "全部") {
			url = websiteUrl + '/with-state/account-book?type=' + type;
		}
		accountBookData.value = {}

		// 获取账本数据 /with-state//account-book
		uni.request({
			url: url,
			method: 'GET',
			header: {
				'Authorization': token
			},
			success: (res) => {
				console.log(res.data.data);
				accountBookData.value = res.data.data;
			},
			fail: (err) => {
				console.log(err);
			}
		});

	}
	//获取展示柜数据
	function getShowcaseData() {
		console.log(global)
		if (!global.isLogin) {
			return
		}
		let token = uni.getStorageSync('token');
		showcaseData.value = {}
		// 获取展示柜数据
		uni.request({
			url: websiteUrl + '/with-state/showcase',
			method: 'GET',
			header: {
				'Authorization': token
			},
			success: (res) => {
				console.log(res.data.data);
				showcaseData.value = res.data.data;
			},
			fail: (err) => {
				console.log(err);
			}
		});
	}

	//获取账单数据
	function getBillData() {
		console.log(global)
		if (!global.isLogin) {
			return
		}
		let token = uni.getStorageSync('token');
		billData.value = {}
		// 获取账单数据
		uni.request({
			url: websiteUrl + '/with-state/tail-bill',
			method: 'GET',
			header: {
				'Authorization': token
			},
			success: (res) => {
				console.log(res.data.data);
				billData.value = res.data.data;
			},
			fail: (err) => {
				console.log(err);
			}
		});
	}


	//跳转到添加账本数据
	function go2addAccountBook() {
		uni.navigateTo({
			url: '/pages/stock/account_book_form/account_book_form'
		})
	}
	//跳转到编辑
	function go2editor(id) {
		uni.navigateTo({
			url: '/pages/stock/account_book_form/account_book_form?account_book_id=' + id
		})
	}
	//跳转到添加展示柜数据
	function go2addShowCase() {
		uni.navigateTo({
			url: '/pages/stock/showcase_form/showcase_form'
		})
	}
	//跳转到编辑展示柜
	function go2editorShowCase(id) {
		uni.navigateTo({
			url: '/pages/stock/showcase_form/showcase_form?showcase_id=' + id
		})
	}
	//跳转到添加账单数据
	function go2addBill(id) {
		if (id == false) {
			uni.navigateTo({
				url: '/pages/stock/bill_form/bill_form',
			});
			return
		}
		uni.navigateTo({
			url: '/pages/stock/bill_form/bill_form?bill_id=' + id
		})
	}

	onShow(() => {
		// 加载用户信息
		asyncGetUserInfo().then((userInfo) => {
			// 获取我的娃物
			getAccountBookData();
			// 获取我的展示柜
			getShowcaseData();
			// 获取账单数据
			getBillData();
		})
	})
</script>

<style lang="scss">
	.container {
		background-color: #fff;
		// background: linear-gradient(180deg, #daeeff 0%, white 100%);

	}

	.content {
		margin-top: 15rpx;
	}
	
	.head_container {
		background: linear-gradient(180deg, rgb(185 195 253) 0%, rgb(211 245 255) 100%);
		overflow: hidden;
		padding-bottom: 60rpx;
	}

	.switch_tab {
		display: flex;
		justify-content: space-around;
		background: #fff;
		width: 100%;
		height: 100rpx;
		margin: 40rpx 0;
		position: relative;
		background: transparent;
		/* 移除原渐变色背景 */

		button {
			position: relative;
			background: transparent;
			color: #666;
			width: 33.3%;
			padding: 20rpx 0;
			font-size: 28rpx;
			margin: 0;
			border-radius: 0;
			transition: all 0.3s ease;

			&::after {
				content: '';
				position: absolute;
				bottom: 0;
				left: 50%;
				width: 0;
				height: 4rpx;
				background: #74c9e5;
				transition: all 0.3s ease;
				transform: translateX(-50%);
			}

			text {
				font-weight: 500;
				transition: all 0.3s ease;
			}

			&.active {
				text {
					color: #74c9e5;
					font-weight: 800;
					font-size: 32rpx;
					/* 选中时字体变大 */
				}

				&::after {
					width: 80%;
					/* 下划线宽度 */
					background: #74c9e5;
				}
			}
		}
	}

	.jump2addButton {
		background: #74c9e5;
		color: #fff;
		border-radius: 100%;
		width: 110rpx;
		height: 110rpx;
		font-size: 40rpx;
		position: fixed;
		bottom: 160rpx;
		right: 40rpx;
		box-shadow: #dadada;
	}

	.data_body {
		min-height: 80vh;
		/* 根据实际内容设置合理高度，避免父容器塌陷 */
		position: relative;
		top: -80rpx;
	}

	.tab_body_1st,
	.tab_body_sec,
	.tab_body_3th {
		border-radius: 50rpx 50rpx 0 0;
		overflow: hidden;
		background-color: #fff;
		padding: 20rpx 20rpx;
		// height: 100vh;
		box-sizing: border-box;
		margin: 20rpx 0rpx 20rpx 0rpx;
		// box-shadow: 0 0 5rpx #dadada;
		overflow: hidden;
		width: calc(100%);
		min-height: 80vh;
		/* 根据实际内容设置合理高度，避免父容器塌陷 */
	}

	.none {
		display: none;
	}

	.light_button {
		color: #fff;
		background: #65C3D6;
		box-shadow: 0 0 3rpx #1ed1e1;
		border: 0rpx;
		margin: 20rpx 0rpx;
		border-radius: 15rpx;

	}

	.light_button:active {
		background: #4e98a9;
	}


	.inputer {
		font-size: 20rpx;
		border-bottom: 1rpx #ddd solid;
		padding: 10rpx;
		margin: 40rpx 0rpx;
	}

	/* 切换动画 */
	.slide_left-enter-active,
	.slide_right-enter-active {
		// transition: transform 0.5s ease;
		// position: absolute;
		/* 注意运动时候的边距和宽度要保持和元素的一致，不然会导致动画抖动 */
		// margin-top: 10rpx;
		// width: calc(100vw - 20rpx);
	}

	.slide_left-leave-active,
	.slide_right-leave-active {
		// transition: none;
		/* 离开无动画 */
		// position: absolute;
		// width: 100%;
		// margin: 20rpx 10rpx 10rpx 10rpx;
	}

	.slide_right-enter-from,
	.-leave-to {
		// opacity: 0;
	}

	.slide_left-enter-from,
	.slide_left-leave-to,
	.slide_right-enter-from,
	.slide_right-leave-to {
		// margin: 20rpx 10rpx 10rpx 10rpx;
		/* 关键：确保动画始终使用正确宽度 */
	}

	.slide_left-enter-from {
		// transform: translateX(100%);
	}

	.slide_left-leave-to {
		// transform: translateX(-100%);
	}

	.slide_right-enter-from {
		// transform: translateX(-100%);
	}

	.slide_right-leave-to {
		// transform: translateX(100%);
	}

	// 展示柜样式
	.sec_container {
		display: flex;
		flex-direction: column;
		/* 每行垂直排列 */
		gap: 20rpx;
		/* 行间距 */
	}

	.sec_row {
		display: flex;
		/* 每行使用 Flex 布局 */
		align-items: center;
		/* 垂直居中 */
		gap: 10rpx;
		/* 图片和文字之间的间距 */
		width: 100%;
		padding: 10rpx;
		box-sizing: border-box;
	}

	.sec_image {
		width: 35vw;
		/* 图片固定宽度 */
		height: 45vw;
		object-fit: cover;
		/* 图片填充方式 */
		border-radius: 8rpx;
		/* 圆角 */
	}

	.sec_content {
		flex: 1;
		/* 文字内容占据剩余空间 */
		display: flex;
		flex-direction: column;
		gap: 5rpx;
		/* 标题和描述之间的间距 */
		max-width: 50vw;
	}

	.sec_title {
		font-size: 26rpx;
		font-weight: bold;
		color: #333;
	}

	.sec_description {
		font-size: 24rpx;
		color: #666;
		// 最多7行
		overflow: hidden;
		height: 300rpx;

	}

	// 尾款日历
	.month-header {
		font-weight: 1000;
		border-bottom: 1rpx dashed #dadada;
		width: 100%;
		display: block;
		padding-bottom: 10rpx;
	}

	.bill-item {
		margin: 20rpx 0rpx;
	}

	// 1st下的
	/* 新增样式 */
	.type-picker {
		padding-left: 25rpx;
		font-size: 35rpx;
		color: #585858;
		font-weight: 1000;
		margin-top: 10rpx;
	}

	.content-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 30rpx;
		padding: 20rpx;

		.grid-item {
			position: relative;
			width: calc(33.33% - 22rpx); // 3列布局，考虑间隙
			overflow: hidden;
			border-radius: 20rpx;
			background: #fff;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);

			.item-image {
				width: 100%;
				height: 200rpx;
				display: block;
				margin-bottom: 10rpx;
			}

			.item-type {
				position: absolute;
				top: 0;
				left: 0;
				background: rgb(255 118 105  / 65%);
				color: #fff;
				padding: 5rpx 10rpx;
				border-radius: 10rpx 0 10rpx 0;
				font-size: 30rpx;
			}

			.item-info {
				padding: 5rpx 15rpx;
				display: flex;
				align-items: center;
				gap: 10rpx;

				.item-price {
					font-family: 'alimamashuhei';
					font-weight: 900;
					color: #ff827e;
					font-size: 35rpx;
					flex-shrink: 0;
					text-shadow: 0 0 3rpx #fff;
				}

				.item-name {
					font-family: 'alimamashuhei';
					color: #39110c;
					font-size: 30rpx;
					flex-grow: 1;
					text-shadow: 0 0 3rpx #fff;
				}
			}
		}
	}
</style>