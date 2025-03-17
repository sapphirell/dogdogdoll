<template>
	<view style="padding: 15px;">
		<!-- 账单详情/添加/修改 -->
		<view>
			<text>账单名称</text>
			<input class="inputer" type="text" placeholder="名称" v-model="name" />
		</view>

		<view>
			<text>账单金额</text>
			<input class="inputer" type="digit" placeholder="金额" v-model="price" />
		</view>

		<view>
			<text>账单日期</text>
			<picker mode="date" class="inputer" :value="formattedDate" @change="updateDate">
				<view class="uni-input">{{ formattedDate }}</view>
			</picker>
		</view>

		<view>
			<text>账单状态</text>
			<picker mode="selector" class="inputer" :value="status" :range="statusList" @change="updateStatus">
				<view class="uni-input">{{ statusList[status] }}</view>
			</picker>
		</view>

		<button class="light_button" @click="postSubmit">提交</button>
	</view>
</template>

<script setup>
	import { ref, onMounted } from 'vue';
	import { websiteUrl } from "../../../common/config.js";

	const props = defineProps(["bill_id"]);

	// 判断页面是否有参数，如果有代表编辑，如果没有代表新增
	const isEdit = props.bill_id ? true : false;

	// 数据字段
	const name = ref("");
	const price = ref("");
	const date = ref("");  // 用于存储日期原始数据
	const status = ref(0); // 默认未补款
	const statusList = ['未补款', '已补款'];

	// 获取账单详情
	function getBillById(id) {
		let token = uni.getStorageSync('token');
		uni.request({
			url: websiteUrl + '/with-state/tail-bill-detail',
			method: 'GET',
			header: { 'Authorization': token },
			data: { id: id },
			success: (res) => {
				name.value = res.data.data.name;
				price.value = res.data.data.price;
				date.value = res.data.data.ymd; // 获取日期并格式化
				status.value = res.data.data.status;
				formattedDate.value = formatDate(res.data.data.ymd);
			},
			fail: (err) => {
				console.log(err);
			}
		});
	}

	// 日期格式化为y-m-d
	const formattedDate = ref("");
	function updateDate(e) {
		const selectedDate = e.detail.value;
		date.value = selectedDate;  // 存储原始日期
		formattedDate.value = formatDate(selectedDate);
	}

	function formatDate(dateStr) {
		let date = new Date(dateStr);
		const year = date.getFullYear();
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const day = date.getDate().toString().padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	// 更新账单状态
	function updateStatus(e) {
		status.value = e.detail.value;
	}

	// 页面加载时，判断是编辑还是新增
	onMounted(() => {
		if (isEdit) {
			getBillById(props.bill_id);
			uni.setNavigationBarTitle({
				title: '编辑账单'
			});
		} else {
			uni.setNavigationBarTitle({
				title: '新增账单'
			});
		}
	});

	// 提交表单
	function postSubmit() {
		if (isEdit) {
			updateBill();
		} else {
			addBill();
		}
	}

	// 新增账单
	function addBill() {
		let postData = {
			name: name.value,
			price: parseFloat(price.value),
			ymd: date.value, // 原始日期
			status: status.value
		};

		uni.request({
			url: websiteUrl + '/with-state/add-tail-bill',
			method: "POST",
			header: {
				'Authorization': uni.getStorageSync('token')
			},
			data: postData,
			success: (res) => {
				if (res.data.status == "success") {
					uni.showToast({
						title: '提交成功',
						icon: 'success'
					});
					setTimeout(() => {
						uni.navigateBack();
					}, 500);
				} else {
					uni.showToast({
						title: res.data.msg,
						icon: 'none'
					});
				}
			}
		});
	}

	// 修改账单
	function updateBill() {
		let postData = {
			id: parseInt(props.bill_id, 10),
			name: name.value,
			price: parseFloat(price.value),
			ymd: date.value, // 原始日期
			status: status.value
		};

		uni.request({
			url: websiteUrl + '/with-state/update-tail-bill',
			method: "POST",
			header: {
				'Authorization': uni.getStorageSync('token')
			},
			data: postData,
			success: (res) => {
				if (res.data.status == "success") {
					uni.showToast({
						title: '提交成功',
						icon: 'success'
					});
					setTimeout(() => {
						uni.navigateBack();
					}, 500);
				} else {
					uni.showToast({
						title: res.data.msg,
						icon: 'none'
					});
				}
			}
		});
	}
</script>

<style lang="scss">
	.container {
		background-color: #f8f8f8;
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
		margin: 20px 0px;
	}

	textarea.inputer {
		height: 120px;
		resize: none;
	}
</style>
