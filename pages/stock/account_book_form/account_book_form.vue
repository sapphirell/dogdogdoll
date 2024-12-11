<template>

	<view style="padding: 15px;">
		<!-- 账本 -->
		<view>
			<text>分类</text>
			<picker mode="selector" class="inputer" :value="selectedType" :range="accountBookTypeList"
				@change="updateSelectedType">
				<view class="uni-input">{{ accountBookTypeList[selectedType] }}</view>

			</picker>

		</view>
		<input class="inputer" type="text" placeholder="名称" v-model="name" />
		<input class="inputer" type="digit" placeholder="价值" v-model="price" />
		<view v-if="accountImage">
			<image mode="aspectFill" :src="accountImage"></image>
		</view>
		<button class="" @click="selectImage">选择图片</button>
		<button class="light_button" @click="postSubmit">提交</button>
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
		image1Url,
		wechatSignLogin,
		getUserInfo,
		global,
		asyncGetUserInfo,
	} from "../../../common/config.js";

	import {
		chooseImage,
		jumpToCroper,
		getQiniuToken,
		uploadImageToQiniu
	} from "../../../common/image.js";


	const props = defineProps(["account_book_id"])
	//判断页面是否有参数，如果有代表编辑，如果没有代表新增
	const isEdit = props.account_book_id ? true : false;


	// 状态栏高度
	const systemInfo = uni.getSystemInfoSync();
	const statusBarHeight = ref(systemInfo.statusBarHeight);

	// 提交表单数据
	let name = ref("");
	let price = ref("");
	// 当前激活的 tab
	const activeTab = ref(1);

	function switch_tab(index) {
		activeTab.value = index; // 切换激活 tab
		console.log(`切换到 tab ${index}`);
	}

	// 账本下选择的下拉菜单按钮
	const selectedType = ref(0);

	// 账本下选择的下拉菜单按钮
	const accountBookTypeList = ref(['请选择', '娃衣', '娃头', '眼珠', '假发', '娃鞋', '其它', ]);

	// 账本数据
	const accountBookData = ref({});

	// 上传的图片数据
	const accountImage = ref("");


	// 切换账本选择类型
	function updateSelectedType(e) {
		selectedType.value = e.detail.value
	}

	//以id获取账本详情
	function getAccountBookById(id) {
		let token = uni.getStorageSync('token')
		// /with-state/account-book-detail
		uni.request({
			url: websiteUrl + '/with-state/account-book-detail',
			method: 'GET',
			header: {
				'Authorization': token,
			},
			data: {
				id: id
			},
			success: (res) => {
				console.log(res.data.data);
				name.value = res.data.data.name;
				price.value = res.data.data.price;
				selectedType.value = accountBookTypeList.value.indexOf(res.data.data.type);
				accountImage.value = res.data.data.image_url;
			},
			fail: (err) => {
				console.log(err);
			}
		});
	}

	//选择图片
	function selectImage() {
		chooseImage().then((res) => {
			getQiniuToken().then((tokenData) => {
				console.log(tokenData)

				uploadImageToQiniu(res, tokenData.token, tokenData.path).then((uploadRes) => {
					if (uploadRes.statusCode != 200) {
						uni.showToast({
							title: '上传失败',
							icon: 'none'
						})
					}
					console.log(image1Url + tokenData.path)
					accountImage.value = image1Url + tokenData.path;
					uni.showToast({
						title: '上传成功',
						icon: 'success'
					})
				}) //uploadImageToQiniu
			}) //getQiniuToken
		}) //chooseImage
	}

	// 加载用户信息
	asyncGetUserInfo().then((userInfo) => {
		if (isEdit) {
			//编辑
			getAccountBookById(props.account_book_id)
			uni.setNavigationBarTitle({
				title: '编辑账本'
			})
		} else {
			uni.setNavigationBarTitle({
				title: '新增账本'
			})
		}

	})

	//提交表单
	function postSubmit() {
		// 区分是新增还是提交，新增 post /with-state/account-book  提交 post /with-state/update-account-book
		if (isEdit) {
			//编辑
			updateAccountBook()
		} else {
			//新增
			addAccountBook()
		}


	}
	//新增
	function addAccountBook() {
		let postData = {
			name: name.value,
			price: parseInt(price.value, 10),
			type: accountBookTypeList.value[selectedType.value],
			image_url: accountImage.value
		}

		console.log(postData)

		uni.request({
			url: websiteUrl + '/with-state/add-account-book',
			method: "POST",
			header: {
				'Authorization': uni.getStorageSync('token'),
			},
			data: postData,
			success: (res) => {
				console.log(res.data)
				if (res.data.status == "success") {
					uni.showToast({
						title: '提交成功',
						icon: 'success'
					})
					//一秒后返回上级页面
					setTimeout(() => {
						uni.navigateBack()
					}, 500)
				} else {
					uni.showToast({
						title: res.data.msg,
						icon: 'none'
					})
				}
			},
		})
	}
	//修改
	function updateAccountBook() {

		let postData = {
			name: name.value,
			price: parseInt(price.value, 10),
			type: accountBookTypeList.value[selectedType.value],
			image_url: accountImage.value,
			id: parseInt(props.account_book_id, 10),
		}

		uni.request({
			url: websiteUrl + '/with-state/update-account-book',
			method: "POST",
			header: {
				'Authorization': uni.getStorageSync('token'),
			},
			data: postData,
			success: (res) => {
				console.log(res.data)
				if (res.data.status == "success") {
					uni.showToast({
						title: '提交成功',
						icon: 'success'
					})
					//一秒后返回上级页面
					setTimeout(() => {
						uni.navigateBack()
					}, 500)
				} else {
					uni.showToast({
						title: res.data.msg,
						icon: 'none'
					})
				}
			},
		})
	}
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
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
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