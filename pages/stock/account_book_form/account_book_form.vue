<template>
	<view class="container">
		<meta name="theme-color" content="#F8F8F8">
		</meta>
		<!-- 分类管理弹窗 -->
		<common-modal :visible="typeModalVisible" @update:visible="val => typeModalVisible = val" top="5%" height="60%">
			<view class="type-modal">
				<view class="add-type-form">
					<input v-model="newTypeName" placeholder="输入新分类名称" class="type-input" />
					<button class="add-btn" @tap="addNewType">添加分类</button>
				</view>
				<view class="type-list">
					<view v-for="(type, index) in customTypes" :key="type.id" class="type-item">
						<text>{{ type.name }}</text>
						<uni-icons type="trash" size="22" color="#ff6666" @tap="deleteType(type.id)"></uni-icons>
					</view>
				</view>
			</view>
		</common-modal>
		<!-- 表单卡片容器 -->
		<view class="form-card">
			<!-- 分类选择 -->
			<view class="form-item">
				<text class="form-label">分类</text>
				<view class="type-selector">
					<picker mode="selector" class="form-input" :value="selectedType" :range="typeOptions"
						@change="updateSelectedType">
						<view class="picker-content">
							{{ typeOptions[selectedType] || '请选择分类' }}
						</view>
					</picker>
					<text class="manage-type" @tap="typeModalVisible = true">管理分类</text>
				</view>
			</view>

			<!-- 名称 -->
			<view class="form-item">
				<text class="form-label">名称</text>
				<view class="form-input" style="padding: 0;">
					<goods-search :font-size="'24rpx'" mode="fill" @select="handleGoodsSelect" v-model="name"
						:background="'#fff'" :width="'640rpx'" :show-icon="false" class="custom-search" />
				</view>
			</view>

			<!-- 价值 -->
			<view class="form-item">
				<text class="form-label">价值</text>
				<input class="form-input" type="digit" placeholder="请输入价值" placeholder-class="placeholder-style"
					v-model="price" />
			</view>

			<!-- 图片上传 -->
			<view class="form-item">
				<text class="form-label">物品图片</text>
				<view class="upload-wrapper">
					<view v-if="accountImage" class="preview-image" @click.stop="selectImage">
						<image mode="aspectFill" :src="accountImage" class="image-preview"></image>
						<text class="image-tip">点击更换图片</text>
					</view>
					<button class="upload-button" @click="selectImage" v-else>
						<text class="iconfont icon-camera"></text>
						选择图片
					</button>
				</view>
			</view>
			<!-- 补款提醒 -->
			<view class="form-item">
				<label class="remind-label" @tap="toggleRemind()">
					<uni-icons type="right" size="20" v-if="!form.isRemind" color="#888"></uni-icons>
					<uni-icons type="down" size="20" color="#888" v-else></uni-icons>
					<text>需要补款提醒</text>
					<!-- 新增小红点 -->
					<view v-if="form.finalPrice > 0 " class="remind-dot"></view>
				</label>
			</view>

			<view v-if="form.isRemind" class="remind-form" style="margin-bottom: 40rpx;">
				<view class="form-item">
					<text class="form-label">尾款金额</text>
					<input type="number" v-model="form.finalPrice" placeholder="请输入待补款金额" class="form-input" />
				</view>

				<view class="form-item">
					<text class="form-label">补款日期</text>
					<picker mode="date" :value="form.finalTime" @change="form.finalTime = $event.detail.value"
						class="form-input">
						<view class="picker-content">
							{{ form.finalTime || '选择截止日期' }}
						</view>
					</picker>
				</view>
			</view>
			<view style="overflow: hidden;">
				<image src="/static/info-circle.png" mode="aspectFill"
					style="width: 28rpx;height: 28rpx;margin-right: 10rpx; position: relative;top: 3rpx;"></image>
				<text style="color: #888;">仅用于记录您所购买过的物品，其他人不会看到</text>
			</view>

			<!-- 操作按钮 -->
			<view class="button-group">
				<button class="delete-button" v-if="isEdit" @click="handleDelete">
					删除账本
				</button>
				<button class="submit-button" @click="postSubmit">
					记录{{ isEdit ? '修改' : '新增' }}
				</button>
			</view>
		</view>


	</view>
</template>
<script setup>
	import {
		ref,
		computed,
		onMounted
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
	// 新增状态
	const typeModalVisible = ref(false);
	const newTypeName = ref('');
	const customTypes = ref([]);
	const defaultTypes = ['请选择', '娃衣', '娃头', '眼珠', '假发', '娃鞋', '其它'];

	// 组合分类选项
	const typeOptions = computed(() => [
		...defaultTypes,
		...customTypes.value.map(t => t.name)
	]);

	// 表单数据
	const form = ref({
		isRemind: false,
		finalPrice: 0,
		finalTime: ''
	});

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

	// 切换补款提醒
	const toggleRemind = () => {

		form.value.isRemind = !form.value.isRemind
		if (!form.value.isRemind) {
			form.value.finalPrice = 0;
			form.value.finalTime = '';
		}
	};
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
				price.value = parseInt(res.data.data.price);
				selectedType.value = typeOptions.value.indexOf(res.data.data.type);
				accountImage.value = res.data.data.image_url;
				 form.value = {
						isRemind: res.data.data.is_remind,
						finalPrice: res.data.data.final_price,
						finalTime: res.data.data.final_time
					}
			    
				console.log("f:", form)
			},
			fail: (err) => {
				console.log(err);
			}
		});
	}

	// 在script中添加商品选择处理
	const handleGoodsSelect = async (goods) => {
		try {
			const res = await uni.request({
				url: websiteUrl + `/goods?id=${goods.id}`,
				method: 'GET'
			});

			if (res.data.status === "success") {
				const detail = res.data.data;
				// 自动填充信息
				name.value = detail.name;
				price.value = detail.fin_amount + detail.sub_amount;
				if (detail.goods_images?.[0]) {
					accountImage.value = detail.goods_images[0];
				}

			}
		} catch (error) {
			console.error('获取商品详情失败:', error);
			uni.showToast({
				title: '获取商品信息失败',
				icon: 'none'
			});
		}
	};


	// 删除账本 /delete-account-book
	function handleDelete() {
	  uni.showModal({
	    title: '提示',
	    content: '确定删除该账本吗？',
	    success: (res) => {
	      if (res.confirm) {
	        // 参数校验
	        const id = Number(props.account_book_id);
	        if (isNaN(id) || id <= 0) {
	          uni.showToast({ title: '参数错误', icon: 'none' });
	          return;
	        }
	
	        uni.request({
	          url: websiteUrl + '/with-state/delete-account-book',
	          method: 'POST',
	          header: {
	            'Authorization': uni.getStorageSync('token'),
	            'Content-Type': 'application/json' // 添加Content-Type
	          },
	          data: { id }, // 改为JSON格式传参
	          success: (res) => {
	            // 严格判断响应状态
				console.log(res.data.status)
	            if (res.data.status === "success") {
	              uni.showToast({ title: '删除成功', icon: 'success' });
	              setTimeout(() => uni.navigateBack(), 500);
	            } else {
	              uni.showToast({ 
	                title: res.data.msg || '删除失败',
	                icon: 'none'
	              });
	            }
	          },
	          fail: (err) => {
	            console.error('请求失败:', err);
	            uni.showToast({ title: '网络错误', icon: 'none' });
	          }
	        });
	      }
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
		if (!validateForm()) return;

		// 区分是新增还是提交，新增 post /with-state/account-book  提交 post /with-state/update-account-book
		if (isEdit) {
			//编辑
			updateAccountBook()
		} else {
			//新增
			addAccountBook()
		}


	}

	// 修改提交逻辑
	const validateForm = () => {
		if (form.value.isRemind) {
			if (!form.value.finalPrice || form.value.finalPrice <= 0) {
				uni.showToast({
					title: '请输入正确的尾款金额',
					icon: 'none'
				});
				return false;
			}
			if (!form.value.finalTime || new Date(form.value.finalTime) < new Date()) {
				uni.showToast({
					title: '请选择未来的日期',
					icon: 'none'
				});
				return false;
			}
		}
		return true;
	};

	//新增
	function addAccountBook() {
		let postData = {
			name: name.value,
			price: parseInt(price.value, 10),
			type: typeOptions.value[selectedType.value], // 使用合并后的分类列表
			image_url: accountImage.value,
			is_remind: form.value.isRemind,
			final_price: parseInt(form.value.finalPrice, 10),
			final_time: form.value.finalTime
		}

		console.log('提交数据:', postData)

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
			type: typeOptions.value[selectedType.value], // 使用合并后的分类列表
			image_url: accountImage.value,
			id: parseInt(props.account_book_id, 10),
			is_remind: form.value.isRemind, // 转换为数据库需要的格式
			final_price: parseInt(form.value.finalPrice, 10),
			final_time: form.value.finalTime
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


	// 在原有onShow中添加
	onShow(() => {
		asyncGetUserInfo().then(() => {
			getAccountTypes();
			// 原有其他逻辑...
		});
	});
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
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
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
	}

	.upload-wrapper {
		border: 2rpx dashed $border-color;
		border-radius: $radius;
		padding: 30rpx;
		text-align: center;
	}

	.preview-image {
		position: relative;
		margin: 0 auto;
		max-width: 400rpx;

		.image-preview {
			width: 100%;
			height: 300rpx;
			border-radius: $radius;
		}

		.image-tip {
			position: absolute;
			bottom: 20rpx;
			left: 50%;
			transform: translateX(-50%);
			color: white;
			font-size: 24rpx;
			background: rgba(0, 0, 0, 0.5);
			padding: 8rpx 20rpx;
			border-radius: 20rpx;
		}
	}

	.upload-button {
		background: rgba($primary-color, 0.1);
		color: $primary-color;
		border: none;
		font-size: 28rpx;
		height: auto;
		line-height: 1.5;
		padding: 20rpx;
		border-radius: $radius;
		transition: all 0.3s;

		.iconfont {
			margin-right: 12rpx;
		}

		&:active {
			background: rgba($primary-color, 0.2);
		}
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

	.delete-button {
		background: linear-gradient(135deg, #adadad, #ffbdbb);
		color: white;
		border: none;
		border-radius: 50rpx;
		font-size: 32rpx;
		height: 90rpx;
		line-height: 90rpx;
		box-shadow: 0 6rpx 20rpx rgba(255, 77, 79, 0.3);
		transition: all 0.3s;
		margin-top: 30rpx;

		&:active {
			transform: translateY(2rpx);
			box-shadow: 0 4rpx 12rpx rgba(255, 77, 79, 0.3);
		}
	}

	.form-input {
		// 原有样式保持不变
		// padding: 0 !important;  // 移除内边距让搜索组件填满

		.custom-search {
			border: none !important; // 移除组件自身边框
			height: 80rpx;

			.search_tab {
				border: 2rpx solid $border-color;
				border-radius: $radius;
				height: 100%;
			}
		}
	}

	.type-selector {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.manage-type {
		font-size: 24rpx;
		color: #74c9e5;
		padding: 8rpx 20rpx;
		border: 1rpx solid #74c9e5;
		border-radius: 40rpx;
		flex-shrink: 0;
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
			margin-bottom: 10rpx;

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

	.remind-label {
		display: flex;
		align-items: center;
		gap: 15rpx;
		font-size: 28rpx;
		color: #666;
	}

	.remind-form {
		background: #f8f8f8;
		border-radius: 16rpx;
		padding: 20rpx;
		margin-top: 20rpx;
	}

	.remind-label {
		position: relative; // 添加相对定位
		display: flex;
		align-items: center;
		gap: 15rpx;
		font-size: 28rpx;
		color: #666;
		padding-right: 40rpx; // 为小红点留出空间

		.remind-dot {
			position: relative;
			right: 0;
			top: 7rpx;
			transform: translateY(-50%);
			width: 16rpx;
			height: 16rpx;
			background: #ff4444;
			border-radius: 50%;
			box-shadow: 0 2rpx 8rpx rgba(255, 68, 68, 0.2);
		}
	}
</style>