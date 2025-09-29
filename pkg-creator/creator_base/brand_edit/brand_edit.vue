<template>
	<view class="brand-edit-container">
		<view-logs />
		<view class="form-wrapper">
			<!-- 新增LOGO编辑区域 -->
			<view class="logo-editor">
				<view class="preview-title">品牌LOGO</view>
				<view class="logo-preview">
					<image :src="formData.logo_image || brandData.logo_image" mode="aspectFit" class="logo-image">
					</image>
					<button class="change-logo-btn" @click="changeLogo">更换LOGO</button>
				</view>
			</view>


			<!-- 品牌名称 -->
			<view class="input-item">
				<input class="input" type="text" placeholder=" " v-model="formData.brand_name" maxlength="20" />
				<label class="floating-label">品牌名称</label>
				<uni-icons class="input-icon" type="compose" size="18" color="#999" />
			</view>
			<view class="brand-preview" v-if="formData.brand_name && brandData.brand_name_image">
				<view class="preview-title">效果预览</view>
				<view class="preview-content">
					<image :src="brandData.brand_name_image" mode="widthFix" class="preview-image"></image>
				</view>
			</view>
			<view class="hint-text">
				<text>展示给用户的名称，尽量不要使用emoji，符号表情，我的程序会用艺术字体生成您品牌名称的粗体文字，含有特殊字符可能会导致渲染为【口】。</text>
				<text>您的名称在程序中会进行中英文分词，以便用户更快速的搜索到您，字符顺序不对也可以兼容，例如：这些搜索都可以搜索到娃圈狗狗助手 WaQuanGouGou/wqgg/娃狗手/手狗 ,
					用户输入的命中词数决定了在搜索框中的排序权重。</text>
				<text>但需要注意的是过长的名字并不会换行展示，而是压缩在一行里。</text>

			</view>

			<!-- 品牌别名 -->
			<view class="input-item">
				<input class="input" type="text" placeholder=" " v-model="formData.nickname_list" />
				<label class="floating-label">品牌别名（多个用逗号分隔）</label>
				<uni-icons class="input-icon" type="flag" size="18" color="#999" />
			</view>
			<view class="hint-text">
				<text>您的其它称呼，我们也对别名进行了分词，用户同样可以通过别名查找到您，但别名的命中词权重低于名称，您可以在搜索框中实验搜索效果;</text>
				<text>如果您的别称在圈内十分出名，我们建议放在名称后面。例如：娃圈狗狗助手（眠猫）</text>
			</view>

			<!-- 国籍 -->
			<view class="input-item">
				<input class="input" type="text" placeholder=" " v-model="formData.country_name" />
				<label class="floating-label">国籍</label>
				<uni-icons class="input-icon" type="location" size="18" color="#999" />
			</view>

			<!-- 身份类型 -->
			<view class="input-item">
				<picker :value="typeOptions.indexOf(formData.type)" :range="typeOptions" @change="onTypeChange">
					<view class="picker-view">
						<text class="picker-value">{{ formData.type || '请选择身份类型' }}</text>
						<uni-icons class="picker-icon" type="arrowdown" size="16" color="#999" />
					</view>
				</picker>
				<label class="floating-label" style="top: 0px;font-size: 14px;">身份类型</label>
				<uni-icons class="input-icon" type="person" size="18" color="#999" />
			</view>
			<view class="hint-text">
				<text>向他人展示您的身份，可选公司或个人作者，个人作者意为个人自制。</text>
			</view>

			<!-- 贩售渠道 -->
			<view class="input-item">
				<input class="input" type="text" placeholder=" " v-model="formData.website_url" />
				<label class="floating-label">贩售渠道（URL）</label>
				<uni-icons class="input-icon" type="link" size="18" color="#999" />
			</view>
			<view class="hint-text">
				<text>淘宝店URL、微店URL等，请确认是一个能打开的地址。</text>
			</view>

			<!-- 品牌描述 -->
			<view class="input-item textarea-item">
				<textarea class="textarea" placeholder=" " v-model="formData.description" maxlength="200"></textarea>
				<label class="floating-label" style="top: 60rpx;">品牌描述</label>
				<uni-icons class="input-icon" type="chat" size="18" color="#999" />
			</view>

			<!-- 提交按钮 -->
			<button class="submit-btn" :class="{active: isFormValid}" @click="submitForm"
				:disabled="!isFormValid || loading">
				更新品牌信息
			</button>

			<view class="loading-overlay" v-if="loading">
				<uni-icons type="spinner-cycle" size="32" color="#fff" class="loading-icon" />
			</view>
		</view>

	</view>
</template>

<script setup>
	import {
		ref,
		reactive,
		onMounted,
		computed
	} from 'vue';
	import {
		websiteUrl,
		global,
		asyncGetUserInfo
	} from '../../../common/config.js';
	import {
		chooseImage,
		getQiniuToken,
		uploadImageToQiniu
	} from '@/common/image.js'; // 引入图片上传工具函数
	// 表单数据
	const formData = reactive({
		id: 0,
		brand_name: '',
		nickname_list: '',
		country_name: '',
		type: '',
		website_url: '',
		description: '',
		logo_image: '' // 新增LOGO字段
	});

	const brandData = ref({});

	// 身份类型选项
	const typeOptions = ref(['公司', '个人作者']);

	// 加载状态
	const loading = ref(false);

	// 表单验证
	const isFormValid = computed(() => {
		return formData.brand_name?.trim() !== '' &&
			formData.type?.trim() !== '' &&
			formData.website_url?.trim() !== '';
	});

	// 身份类型选择变化
	const onTypeChange = (e) => {
		formData.type = typeOptions.value[e.detail.value];
	};

	// 获取品牌信息
	const fetchBrandInfo = async () => {
		try {
			loading.value = true;

			const userInfo = await asyncGetUserInfo();
			console.log(userInfo)
			if (!userInfo || !userInfo.brand_id) {
				uni.showToast({
					title: '您尚未管理任何品牌',
					icon: 'none'
				});
				return;
			}

			const brandId = userInfo?.brand_id;
			if (!brandId) {
				uni.showToast({
					title: '用户未关联品牌信息',
					icon: 'none'
				});
				return;
			}

			const res = await uni.request({
				url: `${websiteUrl.value}/brand-info?id=${brandId}`,
				method: 'GET',
				header: {
					'Authorization': uni.getStorageSync('token')
				}
			});

			if (res.data.status === 'success') {
				brandData.value = res.data.data;
				Object.assign(formData, {
					id: brandData.value.id,
					brand_name: brandData.value.brand_name || '',
					nickname_list: brandData.value.nickname_list || '',
					country_name: brandData.value.country_name || '',
					type: brandData.value.type || '',
					website_url: brandData.value.website_url || '',
					description: brandData.value.description || '',
					logo_image: brandData.value.logo_image || '',
				});
				// 赋值到formData


			} else {
				uni.showToast({
					title: '获取品牌信息失败: ' + (res.data.msg || '未知错误'),
					icon: 'none'
				});
			}
		} catch (err) {
			console.error('获取品牌信息失败:', err);
			uni.showToast({
				title: '获取品牌信息失败，请重试',
				icon: 'none'
			});
		} finally {
			loading.value = false;
		}
	};

	// 更换LOGO
	const changeLogo = async () => {
		try {
			// 选择图片
			const tempFilePath = await chooseImage();

			uni.showLoading({
				title: '上传中...',
				mask: true
			});

			// 获取七牛云上传凭证
			const qiniuTokenData = await getQiniuToken();

			if (!qiniuTokenData || !qiniuTokenData.path || !qiniuTokenData.token) {
				throw new Error('获取上传凭证失败: 缺少必要字段');
			}

			// 使用七牛云返回的 path 作为文件名
			const fileName = qiniuTokenData.path;

			// 上传图片到七牛云
			const result = await uploadImageToQiniu(
				tempFilePath,
				qiniuTokenData.token,
				fileName
			);

			if (result && result.imageUrl) {
				formData.logo_image = result.imageUrl;
				uni.showToast({
					title: '上传成功,保存生效',
					icon: 'success'
				});
			}
		} catch (error) {
			console.error('上传LOGO失败:', error);
			uni.showToast({
				title: `上传LOGO失败: ${error.message || error}`,
				icon: 'none',
				duration: 3000
			});
		} finally {
			uni.hideLoading();
		}
	};

	// 提交表单
	const submitForm = async () => {
		if (!isFormValid.value) return;

		try {
			loading.value = true;

			// 构造提交数据
			const submitData = {
				id: formData.id,
				brand_name: formData.brand_name,
				nickname_list: formData.nickname_list,
				country_name: formData.country_name,
				type: formData.type,
				website_url: formData.website_url,
				description: formData.description,
				logo_image: formData.logo_image // 新增LOGO字段
			};

			const res = await uni.request({
				url: `${websiteUrl.value}/brand-manager/update-brand`,
				method: 'POST',
				header: {
					'Content-Type': 'application/json',
					'Authorization': uni.getStorageSync('token')
				},
				data: submitData
			});

			if (res.data.status === 'success') {
				uni.showToast({
					title: '已更新',
					icon: 'success'
				});
				// 刷新品牌数据
				fetchBrandInfo();
			} else {
				uni.showToast({
					title: '更新失败: ' + (res.data.msg || '未知错误'),
					icon: 'none'
				});
			}
		} catch (err) {
			console.error('提交失败:', err);
			uni.showToast({
				title: '提交失败，请重试',
				icon: 'none'
			});
		} finally {
			loading.value = false;
		}
	};

	// 页面加载时获取品牌信息
	onMounted(() => {
		uni.setNavigationBarTitle({
			title: '编辑品牌信息'
		});

		fetchBrandInfo();
	});
</script>

<style lang="less" scoped>
	@primary-color: #65C3D6;
	@error-color: #ff5252;
	@success-color: #4CAF50;
	@bg-color: #f5f7fa;
	@border-color: #e0e0e0;
	.brand-edit-container {
		padding: 30rpx;
		background: @bg-color;
		min-height: 100vh;
	}
	.form-wrapper {
		background: #fff;
		border-radius: 24rpx;
		padding: 40rpx;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);
		position: relative;
		margin-bottom: 40rpx;
	}
	/* 新增LOGO编辑区域样式 */
	.logo-editor {
		margin-bottom: 40rpx;
		padding-bottom: 30rpx;
		border-bottom: 1px solid #eee;
		
		.preview-title {
			font-size: 32rpx;
			font-weight: bold;
			margin-bottom: 20rpx;
			color: #333;
		}
		
		.logo-preview {
			display: flex;
			align-items: center;
			justify-content: space-between;
		}
		
		.logo-image {
			width: 150rpx;
			height: 150rpx;
			border-radius: 12rpx;
			border: 1px solid #eee;
			background-color: #f9f9f9;
		}
		
		.change-logo-btn {
			height: 70rpx;
			line-height: 70rpx;
			padding: 0 30rpx;
			font-size: 26rpx;
			background-color: #f5f7fa;
			color: @primary-color;
			border: 1px solid @primary-color;
			border-radius: 35rpx;
		}
	}
	.input-item {
		margin-bottom: 48rpx;
		position: relative;
		&:last-child {
			margin-bottom: 0;
		}
		&.textarea-item {
			margin-bottom: 30rpx;
		}
	}
	.input {
		height: 100rpx;
		padding: 0 80rpx 0 40rpx;
		font-size: 32rpx;
		border: 2rpx solid @border-color;
		border-radius: 16rpx;
		transition: all 0.3s ease;
		&:focus {
			border-color: @primary-color;
			box-shadow: 0 4rpx 12rpx rgba(101, 195, 214, 0.2);
			&+.floating-label {
				transform: translateY(-220%);
				font-size: 26rpx;
				color: @primary-color;
			}
		}
	}
	.textarea {
		height: 200rpx;
		padding: 30rpx 80rpx 0 40rpx;
		font-size: 32rpx;
		border: 2rpx solid @border-color;
		border-radius: 16rpx;
		transition: all 0.3s ease;
		width: calc(100vw - 260rpx);
		&:focus {
			border-color: @primary-color;
			box-shadow: 0 4rpx 12rpx rgba(101, 195, 214, 0.2);
			&+.floating-label {
				transform: translateY(-220%);
				font-size: 26rpx;
				color: @primary-color;
			}
		}
	}
	.floating-label {
		position: absolute;
		left: 40rpx;
		top: 60%;
		transform: translateY(-50%);
		color: #999;
		font-size: 32rpx;
		pointer-events: none;
		transition: all 0.3s ease;
		background: #fff;
		padding: 0 10rpx;
		.input:not(:placeholder-shown)+&,
		.input:focus+&,
		.textarea:not(:placeholder-shown)+&,
		.textarea:focus+& {
			transform: translateY(-220%);
			font-size: 26rpx;
		}
	}
	.input-icon {
		position: absolute;
		right: 30rpx;
		top: 50%;
		transform: translateY(-50%);
	}
	.hint-text {
		text {
			font-size: 24rpx;
			color: #8e9093;
			line-height: 1.6;
			margin-top: -30rpx;
			margin-bottom: 40rpx;
			padding: 0 10rpx;
			border-radius: 12rpx;
			padding: 20rpx;
			display: block;
		}
	}
	.picker-view {
		height: 100rpx;
		padding: 0 80rpx 0 40rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 32rpx;
		border: 2rpx solid @border-color;
		border-radius: 16rpx;
		transition: all 0.3s ease;
	}
	.picker-value {
		color: #333;
	}
	.picker-icon {
		position: absolute;
		right: 30rpx;
		top: 50%;
		transform: translateY(-50%);
	}
	.submit-btn {
		width: 100%;
		height: 96rpx;
		background: #ccc;
		color: #fff;
		font-size: 32rpx;
		border-radius: 16rpx;
		border: none;
		position: relative;
		overflow: hidden;
		transition: all 0.3s ease;
		line-height: 96rpx;
		margin-top: 40rpx;
		&:active {
			transform: scale(0.98);
			opacity: 0.9;
		}
		&.active {
			background: linear-gradient(135deg, #65C3D6 0%, #4CA1AF 100%);
			box-shadow: 0 8rpx 24rpx rgba(101, 195, 214, 0.3);
		}
		&:disabled {
			opacity: 0.6;
		}
	}
	.loading-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 24rpx;
		z-index: 10;
	}
	.loading-icon {
		animation: spin 1s linear infinite;
	}
	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
	.brand-preview {
		background: #fff;
		border-radius: 24rpx;
		padding: 30rpx;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);
	}
	.preview-title {
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 20rpx;
		color: #333;
		border-bottom: 2rpx solid #eee;
		padding-bottom: 20rpx;
	}
	.preview-content {
		padding: 0 10rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.preview-image {
		width: 100%;
		max-width: 400rpx;
		margin-bottom: 20rpx;
	}
	.brand-alias-preview {
		font-size: 28rpx;
		color: #666;
		text-align: center;
	}
	
	.uni-input-placeholder, .uni-input-input{
		font-size: 22rpx!important;
	}
	.uni-textarea-textarea  {
		font-size: 26rpx!important;
	}
</style>