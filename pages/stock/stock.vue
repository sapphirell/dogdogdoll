<template>
	<meta name="theme-color" content="rgb(185 195 253)">
	</meta>
	<common-page head_color="rgb(185 195 253)">
		<view class="container" style="overflow: hidden;">
			<view class="head_container">
				<view class="switch_tab">
					<button @click="switch_tab(1)" class="font-alimamashuhei" :class="{'active': activeTab === 1}">
						<text>我的物品</text>
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
						<view class="type-header">
							<picker class="type-picker" mode="selector" :value="selectedType" :range="typeOptions"
								@change="updateSelectedType">
								<view class="uni-input">{{ typeOptions[selectedType] }}</view>
							</picker>
							<text class="manage-btn" @tap="showTypeModal">管理分类</text>
						</view>
						<view class="summary-container">
							<text class="total-text">当前分类合计：¥{{ totalPrice }}</text>
						</view>

						<!-- 新增分类管理弹窗 -->
						<common-modal :visible="typeModalVisible" @update:visible="val => typeModalVisible = val"
							top="5%" height="60%">
							<view class="type-modal">
								<view class="type-list">
									<view v-for="(type, index) in customTypes" :key="type.id" class="type-item">
										<text>{{ type.name }}</text>
										<uni-icons type="trash" size="22" color="#ff6666"
											@tap="deleteType(type.id)"></uni-icons>
									</view>
								</view>
								<view class="add-type-form">
									<input v-model="newTypeName" placeholder="输入新分类名称" class="type-input" />
									<button class="add-btn" @tap="addNewType">添加分类</button>
								</view>
							</view>
						</common-modal>

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

						<view class="empty-state" v-else>
							<image class="empty-icon" src="/static/empty.png"></image>
							<text class="empty-text">空空如也～</text>
							<text class="empty-tip">点击下方按钮添加第一个物品吧！</text>
						</view>

						<view>
							<button class="jump2addButton" @tap="go2addAccountBook">+</button>
						</view>
					</view>
				</transition>
				<transition :name="transitionName()">
					<view class="tab_body_sec" v-if="activeTab === 2" :class="{ none: activeTab !== 2 }">
						<!-- 展示柜 -->
						<view v-if="showcaseData.showcases && showcaseData.showcases.length > 0"
							class="showcase-container">
							<view v-for="(item, index) in showcaseData.showcases" :key="index" class="showcase-card"
								@tap="go2editorShowCase(item.id)">
								<view v-if="item.display !== 1" class="status-overlay">
									<text class="status-text">{{ getStatusText(item.display) }}</text>
								</view>

								<view class="card-content" :class="{ 'blur-effect': item.display !== 1 }">
									<image :src="item.image_url_list[0]" mode="aspectFill" class="showcase-image">
									</image>
									<view class="showcase-info">
										<text class="showcase-title one_line_text">{{ item.name }}</text>
										<text class="showcase-description multi_line_text">{{ item.description }}</text>
										<view class="interaction-bar">
											<view class="interaction-item">
												<image src="/static/eye.png" class="interaction-icon"></image>
												<text class="interaction-count">{{ item.views || 0 }}</text>
											</view>
											<view class="interaction-item">
												<image src="/static/6.png" class="interaction-icon"></image>
												<text class="interaction-count">{{ item.likes || 0 }}</text>
											</view>
										</view>
									</view>
								</view>
							</view>
						</view>
						<view class="empty-state" v-else>
							<image class="empty-icon" src="/static/empty.png"></image>
							<text class="empty-text">展示柜空空如也</text>
							<text class="empty-tip">快来创建你的展示空间吧！</text>
						</view>
						<!-- 添加展示柜数据 -->
						<view>
							<button class="jump2addButton" @tap="go2addShowCase">+</button>
						</view>
					</view>
				</transition>
				<transition :name="transitionName()">
					<view class="tab_body_3th" v-if="activeTab === 3" :class="{ none: activeTab !== 3 }">
						<view class="calendar-container" v-if="Object.keys(billData).length > 0">
							<view v-for="(bills, month) in billData" :key="month">
								<view class="month-header-container">
									<text class="month-header font-alimamashuhei">{{ month }} 账单</text>
									<text class="month-stats">
										已补/总计：{{ countPaid(bills) }}/{{ bills.length }}
									</text>
								</view>

								<view v-for="bill in bills" :key="bill.id" class="bill-item" @tap="go2addBill(bill.id)">
									<view class="bill-left">
										<view class="bill-name-container">
											<text class="bill-name">{{ bill.name }}</text>
										</view>
										<view class="due-amount-container">
											<text class="due-label">待补款:</text>
											<text class="due-amount">¥{{ bill.price }}</text>
										</view>
									</view>

									<view class="bill-right">
										<view class="date-container">
											<text class="date-text">日期: {{ bill.ymd }}</text>
										</view>
										<view class="status-container">
											<text class="status-text" :class="{'paid': bill.status === 1}">
												{{ bill.status === 0 ? '未补款' : '已补款' }}
											</text>
										</view>
									</view>
								</view>
							</view>
						</view>

						<view class="empty-state" v-else>
							<image class="empty-icon" src="/static/empty.png"></image>
							<text class="empty-text">暂无待补尾款</text>
							<text class="empty-tip">增加添加一个到账本试试吧～</text>
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
	// 计算当月账单金额
	function countPaid(bills) {
		return bills.filter(bill => bill.status === 1).length;
	}
	// 账本下选择的下拉菜单按钮
	const selectedType = ref(0);

	const typeModalVisible = ref(false);
	const newTypeName = ref('');
	const customTypes = ref([]); // 用户自定义分类

	// 账本下选择的下拉菜单按钮
	const defaultTypes = ['全部', '娃头', '娃衣', '素体', '眼珠', '假发', '娃鞋'];

	// 组合分类选项
	const typeOptions = computed(() => [
		...defaultTypes,
		...customTypes.value.map(t => t.name)
	]);
	// 在script setup部分添加
	const showTypeModal = () => {
		typeModalVisible.value = true;
	};


	// 获取分类数据
	const getAccountTypes = async () => {
		const token = uni.getStorageSync('token');
		try {
			const res = await uni.request({
				url: websiteUrl + '/with-state/account-types',
				method: 'GET',
				header: {
					'Authorization': token
				}
			});
			customTypes.value = res.data.data || [];
		} catch (err) {
			console.error('获取分类失败:', err);
		}
	};

	// 添加分类
	const addNewType = async () => {
		if (!newTypeName.value.trim()) {
			uni.showToast({
				title: '请输入分类名称',
				icon: 'none'
			});
			return;
		}

		const token = uni.getStorageSync('token');
		try {
			await uni.request({
				url: websiteUrl + '/with-state/add-account-type',
				method: 'POST',
				header: {
					'Authorization': token
				},
				data: {
					name: newTypeName.value.trim()
				}
			});
			await getAccountTypes();
			newTypeName.value = '';
			uni.showToast({
				title: '添加成功'
			});
		} catch (err) {
			uni.showToast({
				title: '添加失败',
				icon: 'none'
			});
		}
	};


	// 删除分类
	const deleteType = async (id) => {
	  uni.showModal({
	    title: '确认删除',
	    // content: '如果该分类下存在物品，则不可以直接删除分类',
	    success: async (res) => {
	      if (res.confirm) {
	        const token = uni.getStorageSync('token');
	        try {
	          const response = await uni.request({
	            url: websiteUrl + '/with-state/delete-account-type',
	            method: 'POST',
	            header: {
	              'Authorization': token,
	              'Content-Type': 'application/json' // 添加Content-Type
	            },
	            data: { id }, // 使用JSON格式传参
	          });
	
	          const resData = response.data;
	          
	          if (resData.status === "success") { // 严格判断状态
	            await getAccountTypes();
	            uni.showToast({ title: '删除成功' });
	          } else {
	            uni.showToast({
	              title: resData.msg || '删除失败',
	              icon: 'none'
	            });
	          }
	        } catch (err) {
	          console.error('删除失败:', err);
	          uni.showToast({
	            title: err.errMsg || '请求失败',
	            icon: 'none'
	          });
	        }
	      }
	    }
	  });
	};



	// 账本数据
	const accountBookData = ref({});

	// 展示柜数据
	const showcaseData = ref({});

	// 账单数据
	const billData = ref({});


	// 添加计算属性
	const totalPrice = computed(() => {
		if (!accountBookData.value.account_books) return 0;
		return accountBookData.value.account_books.reduce((sum, item) => {
			return sum + (parseFloat(item.price) || 0);
		}, 0).toFixed(2);
	});
	// 切换账本选择类型
	function updateSelectedType(e) {
		selectedType.value = e.detail.value;
		const selectedTypeName = typeOptions.value[selectedType.value];
		getAccountBookData(selectedTypeName === "全部" ? "" : selectedTypeName);
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
	// 展示柜状态
	function getStatusClass(display) {
		const statusMap = {
			0: 'reviewing',
			2: 'rechecking',
			3: 'violation'
		}
		return statusMap[display] || '';
	}

	function getStatusText(display) {
		const textMap = {
			0: '审核中',
			2: '人工复核中',
			3: '违规隐藏中'
		}
		return textMap[display] || '';
	}

	onShow(() => {
		// 加载用户信息
		asyncGetUserInfo().then((userInfo) => {
			// 获取用户自定义分类
			getAccountTypes();
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
		z-index: 10;
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

	// 1st下的
	/* 新增样式 */
	.type-picker {
		flex: 1;
		font-size: 22rpx;
		color: #e9b6d7;
		padding: 15rpx 25rpx;
		border-radius: 10rpx;
		background: white;

		.uni-input {
			&::before {
				content: '▼ ';
				margin-left: 15rpx;
				font-size: 20rpx;
				color: #e9b6d7;
			}
		}
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
				background: rgb(255 118 105 / 65%);
				color: #fff;
				padding: 10rpx 20rpx;
				border-radius: 10rpx 0 10rpx 0;
				font-size: 26rpx;
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
					font-size: 30rpx;
					flex-shrink: 0;
					text-shadow: 0 0 3rpx #fff;
				}

				.item-name {
					font-family: 'alimamashuhei';
					color: #39110c;
					font-size: 22rpx;
					flex-grow: 1;
					text-shadow: 0 0 3rpx #fff;
				}
			}
		}
	}

	.type-header {
		display: flex;
		align-items: center;
		padding: 25rpx 30rpx;
		background: linear-gradient(135deg, rgb(255 124 124 / 10%) 0%, white 100%);
		border-radius: 16rpx;
		margin: 20rpx 30rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	}


	.manage-btn {
		font-size: 22rpx;
		color: white;
	    background: #ffbcbc;
		margin-left: 20rpx;
		padding: 10rpx 25rpx;
		border-radius: 50rpx;
		display: flex;
		align-items: center;
		transition: all 0.3s;

		&::before {
			content: '✎';
			margin-right: 8rpx;
		}

		&:active {
			transform: scale(0.95);
			opacity: 0.9;
		}
	}

	.type-modal {
		padding: 30rpx;

		.type-list {
			max-height: 500rpx;
			overflow-y: auto;
			margin-bottom: 40rpx;
		}

		.type-item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 25rpx;
			border-bottom: 1rpx solid #eee;

			text {
				font-size: 26rpx;
				color: #333;
			}
		}

		.add-type-form {
			display: flex;
			gap: 20rpx;

			.type-input {
				flex: 1;
				border: 1rpx solid #ddd;
				border-radius: 8rpx;
				padding: 15rpx;
				font-size: 26rpx;
			}

			.add-btn {
				background: #74c9e5;
				color: white;
				font-size: 26rpx;
				padding: 0 30rpx;
				border-radius: 8rpx;
			}
		}
	}
	
	

	/* 补款提醒表单样式 */
	.remind-form {
		margin-top: 40rpx;
		padding: 30rpx;
		background: #f8f8f8;
		border-radius: 16rpx;

		.form-item {
			margin-bottom: 30rpx;

			label {
				display: block;
				font-size: 26rpx;
				color: #666;
				margin-bottom: 15rpx;
			}

			input,
			picker {
				width: 100%;
				padding: 20rpx;
				border: 1rpx solid #ddd;
				border-radius: 8rpx;
				font-size: 28rpx;
			}
		}

		.hint-text {
			font-size: 24rpx;
			color: #999;
			margin-top: 20rpx;
		}
	}

	// 尾款日历

	.tab_body_3th {
		.calendar-container {
			padding: 20rpx;
		}

		.month-header-container {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 20rpx 0;
			border-bottom: 1rpx dashed #eee;
			margin-bottom: 20rpx;
		}

		.month-header {
			font-size: 32rpx;
			color: #333;
		}

		.month-stats {
			font-size: 26rpx;
			color: #999;
		}

		.bill-item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 30rpx;
			margin: 20rpx 0;
			background: #fff;
			border-radius: 16rpx;
			box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
			transition: all 0.2s ease;

			&:active {
				transform: scale(0.98);
				background: #f8f8f8;
			}
		}

		.bill-left {
			flex: 1;
			margin-right: 30rpx;
		}

		.bill-name {
			font-size: 28rpx;
			color: #333;
			font-weight: bold;
			display: block;
			margin-bottom: 15rpx;
		}

		.due-label {
			font-size: 24rpx;
			color: #999;
			margin-right: 10rpx;
		}

		.due-amount {
			color: #74c9e5;
			font-weight: bold;
			font-size: 28rpx;
		}

		.bill-right {
			text-align: right;
		}

		.date-text {
			font-size: 24rpx;
			color: #999;
			display: block;
			margin-bottom: 15rpx;
		}

		.status-text {
			font-size: 26rpx;
			color: #ff6666;

			&.paid {
				color: #74c9e5;
			}
		}
	}


	// 展示柜
	.tab_body_sec {
		.showcase-container {
			padding: 30rpx;
			display: grid;
			gap: 30rpx;
		}

		.showcase-card {
			position: relative;
			background: #fff;
			border-radius: 24rpx;
			box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.08);
			transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
			overflow: hidden;

			&:active {
				transform: scale(0.98);
				box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
			}
		}

		.status-overlay {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: rgba(0, 0, 0, 0.4);
			z-index: 2;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			backdrop-filter: blur(10rpx);

			&.reviewing {
				background: rgba(116, 202, 229, 0.8);
			}

			&.rechecking {
				background: rgba(255, 193, 7, 0.8);
			}

			&.violation {
				background: rgba(244, 67, 54, 0.8);
			}
		}

		.status-text {
			color: #fff;
			font-size: 32rpx;
			font-weight: bold;
			text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
			margin-top: 20rpx;
		}


		.card-content {
			display: flex;
			height: 320rpx;
			position: relative;
		}

		.showcase-image {
			width: 280rpx;
			height: 100%;
			flex-shrink: 0;
			border-radius: 24rpx 0 0 24rpx;
		}

		.showcase-info {
			flex: 1;
			padding: 30rpx;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
		}

		.showcase-title {
			font-size: 28rpx;
			font-weight: 700;
			color: #333;
			line-height: 1.4;
		}

		.showcase-description {
			font-size: 22rpx;
			color: #666;
			line-height: 1.6;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 3;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		.interaction-bar {
			display: flex;
			gap: 40rpx;
			margin-top: 20rpx;
		}

		.interaction-item {
			display: flex;
			align-items: center;
			gap: 12rpx;
		}

		.interaction-icon {
			width: 36rpx;
			height: 36rpx;
			opacity: 0.8;
		}

		.interaction-count {
			font-size: 24rpx;
			color: #999;
		}

		.blur-effect {
			filter: blur(8rpx);
			opacity: 0.9;
		}

		@keyframes rotating {
			from {
				transform: rotate(0deg);
			}

			to {
				transform: rotate(360deg);
			}
		}
	}

	// 空数据样式
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
		padding: 40rpx;
		text-align: center;

		.empty-icon {
			width: 240rpx;
			height: 240rpx;
			opacity: 0.8;
			margin-bottom: 40rpx;
		}

		.empty-text {
			font-size: 32rpx;
			color: #888;
			margin-bottom: 20rpx;
			font-weight: 500;
		}

		.empty-tip {
			font-size: 26rpx;
			color: #aaa;
			line-height: 1.6;
		}
	}

	/* 针对展示柜的特殊调整 */
	.tab_body_sec .empty-state {
		padding-top: 100rpx;

		.empty-icon {
			width: 280rpx;
			height: 280rpx;
		}
	}

	/* 尾款日历特殊样式 */
	.tab_body_3th .empty-state {
		.empty-icon {
			width: 260rpx;
			height: 260rpx;
		}

	}

	// 价格合计
	.summary-container {
		padding: 20rpx 30rpx;
		border-radius: 12rpx;
		margin: 20rpx 5rpx;

		.total-text {
			font-size: 24rpx;
			color: #74c9e5;
			font-weight: bold;

			&::before {
				content: '💰 ';
			}
		}
	}
</style>