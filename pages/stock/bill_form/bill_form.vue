<template>
	<view-logs />
	<view class="container">
		<meta name="theme-color" content="#F8F8F8"></meta>
		<!-- 表单卡片容器 -->
		<view class="form-card">
			<!-- 账单名称 -->
			<view class="form-item">
				<text class="form-label">账单名称</text>
				<input 
					class="form-input" 
					type="text" 
					placeholder="请输入名称"
					placeholder-class="placeholder-style"
					v-model="name" />
			</view>

			<!-- 账单金额 -->
			<view class="form-item">
				<text class="form-label">账单金额</text>
				<input 
					class="form-input" 
					type="digit" 
					placeholder="请输入金额"
					placeholder-class="placeholder-style"
					v-model="price" />
			</view>

			<!-- 账单日期 -->
			<view class="form-item">
				<text class="form-label">账单日期</text>
				<view style="padding: 0px 10px;border: 1px solid #e6e6e6; border-radius: 10px;">
					<picker
						mode="date" 
						:value="formattedDate" 
						@change="updateDate">
						<view class="picker-content" style="color: #2c2c2c;font-size: 26rpx;">
							{{ formattedDate || '请选择日期' }}
						</view>
					</picker>
				</view>
				
			</view>
			
			<!-- 账单状态 -->
			<view class="form-item">
				<text class="form-label">账单状态</text>
				<view style="padding: 0px 10px;border: 1px solid #e6e6e6; border-radius: 10px;">
					<picker 
						mode="selector" 
						:value="status" 
						:range="statusList"
						@change="updateStatus">
						<view class="picker-content">
							{{ statusList[status] || '请选择状态' }}
						</view>
					</picker>
				</view>
			</view>
			
			
			
			<view style="overflow: hidden;">
				<image src="/static/info-circle.png" mode="aspectFill" style="width: 28rpx;height: 28rpx;margin-right: 10rpx; position: relative;top: 3rpx;"></image>
				<text style="color: #888;">仅用于您的记账，其他人不会看到</text>
			</view>
		</view>

		<!-- 操作按钮 -->
		<view class="button-group">
			<button 
				class="submit-button" 
				@click="postSubmit">
				记录{{ isEdit ? '修改' : '新增' }}
			</button>
			<button 
				class="delete-button" 
				v-if="isEdit"
				@click="handleDelete">
				删除账单
			</button>
		</view>
	</view>
</template>


<script setup>
	import { ref, onMounted, computed } from 'vue';
	import { websiteUrl } from "../../../common/config.js";
	import { onLoad } from '@dcloudio/uni-app'; 
	
	const props = defineProps(["bill_id"]);
	const routeParams = ref({});
	// 判断页面是否有参数，如果有代表编辑，如果没有代表新增
	const isEdit = props.bill_id ? true : false;

	// 数据字段
	const name = ref("");
	const price = ref("");
	const date = ref("");  // 用于存储日期原始数据
	const status = ref(0); // 默认未补款
	const statusList = ['未补款', '已补款'];

	// 在 onLoad 中获取跳转参数
	onLoad((options) => {
		// 保存所有路由参数
		routeParams.value = options;
		
		// 如果有名称参数，设置名称
		if (options.name) {
			name.value = decodeURIComponent(options.name);
		}
		
		// 如果有金额参数，设置金额
		if (options.amount) {
			price.value = options.amount;
		}
		
		// // 设置当前日期为默认日期
		// const today = new Date();
		// date.value = today.toISOString().split('T')[0];
		// formattedDate.value = formatDate(date.value);
	});
	
	// 获取账单详情
	function getBillById(id) {
		let token = uni.getStorageSync('token');
		uni.request({
			url: websiteUrl.value + '/with-state/tail-bill-detail',
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
	//handleDelete POST /delete-tail-bill
	function handleDelete() {
		uni.showModal({
			title: '提示',
			content: '确定删除该账单吗？',
			success: (res) => {
				if (res.confirm) {
					uni.request({
						url: websiteUrl.value + '/with-state/delete-tail-bill?id=' + parseInt(props.bill_id, 10),
						method: 'POST',
						header: { 'Authorization': uni.getStorageSync('token') },
						success: (res) => {
							if (res.data.status == "success") {
								uni.showToast({
									title: '删除成功',
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
			}
		});
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
			url: websiteUrl.value + '/with-state/add-tail-bill',
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
			url: websiteUrl.value + '/with-state/update-tail-bill',
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

<style lang="scss" scoped>
	$primary-color: #a6e9f7;
	$hover-color: #94a5f3;
	$border-color: #e6e6e6;
	$radius: 8px;

	.container {
		padding: 20rpx;
		background-color: #f5f5f5;
		min-height: 100vh;
	}

	.form-card {
		background: white;
		border-radius: $radius;
		padding: 30rpx;
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
	}

	.form-item {
		margin-bottom: 40rpx;
	}

	.form-label {
		display: block;
		font-size: 28rpx;
		color: #666;
		margin-bottom: 16rpx;
		font-weight: 500;
	}

	.form-input {
		height: 80rpx;
		padding: 0 20rpx;
		border: 2rpx solid $border-color;
		border-radius: $radius;
		font-size: 28rpx;
		transition: all 0.3s;
		line-height: 80rpx;
		
		&:focus {
			border-color: $primary-color;
			box-shadow: 0 0 8rpx rgba($primary-color, 0.2);
		}
	}

	.picker-content {
		height: 80rpx;
		line-height: 80rpx;
		color: #333;
		display: inline-block;
	}

	.submit-button {
		margin-top: 60rpx;
		background: linear-gradient(135deg, $primary-color, $hover-color);
		color: white;
		border: none;
		border-radius: 50rpx;
		font-size: 32rpx;
		height: 90rpx;
		line-height: 90rpx;
		box-shadow: 0 6rpx 20rpx rgba($primary-color, 0.3);
		transition: all 0.3s;
		width: 100%;
		
		&:active {
			transform: translateY(2rpx);
			box-shadow: 0 4rpx 12rpx rgba($primary-color, 0.3);
		}
	}

	.placeholder-style {
		color: #ccc;
		font-size: 28rpx;
	}

	.button-group {
		margin-top: 60rpx;
	}

	// 如果需要删除按钮
	.delete-button {
		background: linear-gradient(135deg, #adadad, #ffbdbb);
		color: white;
		border: none;
		border-radius: 50rpx;
		font-size: 32rpx;
		height: 90rpx;
		line-height: 90rpx;
		box-shadow: 0 6rpx 20rpx rgba(255,77,79,0.3);
		transition: all 0.3s;
		margin-top: 30rpx;
		
		&:active {
			transform: translateY(2rpx);
			box-shadow: 0 4rpx 12rpx rgba(255,77,79,0.3);
		}
	}
	.picker-content {
		height: 80rpx;
		line-height: 80rpx;
		color: #333;
		/* 添加以下关键属性 */
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		display: block;
		width: 100%;
	}
	
	/* 针对原生picker的特殊处理 */
	::v-deep uni-picker .picker-view {
		height: 80rpx !important;
		line-height: 80rpx !important;
	}
	
	::v-deep uni-picker .picker-view-column {
		height: 80rpx !important;
		line-height: 80rpx !important;
	}
	
	::v-deep .picker-item {
		height: 80rpx !important;
		line-height: 80rpx !important;
		font-size: 28rpx !important;
	}
</style>