<template>
	<view class="container" :style="{ paddingTop: statusBarHeight + 'px' }">
		<view class="switch_tab">
			<button @click="switch_tab(1)">
				<text>账本</text>
			</button>
			<button @click="switch_tab(2)">
				<text>展示柜</text>
			</button>
			<button @click="switch_tab(3)">
				<text>尾款日历</text>
			</button>
		</view>

		<view class="data_body">
			<view class="tab_body_1st" :class="{ none: activeTab !== 1 }">
				<!-- 账本 -->
				<picker mode="selector" :value="selectedType" :range="accountBookTypeList" @change="updateSelectedType">
					<view class="uni-input">{{ accountBookTypeList[selectedType] }}</view>

				</picker>
				<view v-if="accountBookData.account_books && accountBookData.account_books.length > 0">
					<view>
						<text>总价</text>
						<text>{{ accountBookData.total_price }}￥</text>
					</view>
					<view style="display: flex; flex-wrap: wrap;  justify-content: space-between; margin: 0px 10px;   ">
						<view v-for="(item, index) in accountBookData.account_books" :key="index"
							style="position: relative;width: 35vw;" @tap="go2editor(item.id)">
							<image :src="item.image_url" mode="aspectFill" class="square"
								style="width: 35vw;display: block;border-radius: 20px;"></image>
							<view
								style="display: block;width: 35vw;overflow: hidden;margin: 5px 0px;display:flex;align-items: flex-end;">
								<text class="font-alimamashuhei"
									style="font-weight: 900;color:#ff827e;text-shadow: 0px 0px 3px #fff;font-size: 25px;margin-right: 3px;flex-shrink: 0;">{{ item.price }}￥</text>
								<text class="font-alimamashuhei one_line_text"
									style="text-align: center;color:#39110c;text-shadow: 0px 0px 3px #fff;font-size: 18px;flex-grow: 1;flex-shrink: 1;">{{ item.name }}</text>
							</view>
						</view>
					
					</view>
					
				</view>

				<view v-else>
					<text>暂无数据</text>
				</view>

				<view>
					<button @tap="go2addAccountBook">+</button>
				</view>
			</view>
			<view class="tab_body_sec" :class="{ none: activeTab !== 2 }">
				<!-- 展示柜 -->
			</view>
			<view class="tab_body_3th" :class="{ none: activeTab !== 3 }">3</view>
		</view>
	</view>
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

	function switch_tab(index) {
		activeTab.value = index; // 切换激活 tab
		console.log(`切换到 tab ${index}`);
	}

	// 账本下选择的下拉菜单按钮
	const selectedType = ref(0);

	// 账本下选择的下拉菜单按钮
	const accountBookTypeList = ref(['全部', '娃头', '娃衣', '眼珠', '假发', '娃鞋']);

	// 账本数据
	const accountBookData = ref({});


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
	// 加载用户信息
	asyncGetUserInfo().then((userInfo) => {
		// 获取我的娃物
		getAccountBookData();
		// 获取我的展示柜
	})
</script>

<style lang="scss">
	.container {
		background-color: #f8f8f8;
	}

	.switch_tab {
		display: flex;
		justify-content: space-around;

		button {
			background: #fff;
			color: #888;
			width: 25vw;
			text-align: center;
			padding: 10px;
			border-radius: 5px;
		}

		button:after {
			border: none;
		}

		button:active {
			background: #e5e5e5;
			color: #000;
		}
	}

	.data_body {
		margin-top: 20px;
	}

	.tab_body_1st,
	.tab_body_sec,
	.tab_body_3th {
		background-color: #fff;
		padding: 20px;
		border-radius: 5px;
	}

	.none {
		display: none;
	}

	.light_button {
		color: #fff;
		background: #65C3D6;
		box-shadow: 0 0 3px #1ed1e1;
		border: 0px;
		margin: 20px 0px;
		border-radius: 15px;

	}

	.light_button:active {
		background: #4e98a9;
	}


	.inputer {
		font-size: 20px;
		border-bottom: 1px #ddd solid;
		padding: 10px;
		margin: 40px 0px;
	}
</style>