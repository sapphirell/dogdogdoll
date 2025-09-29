<template>
	<view class="container">
		<view-logs />
		<!-- 表单区域 -->
		<scroll-view scroll-y class="form-container">
			<view class="form-item">
				<text class="label">商品名称</text>
				<input v-model="goodsInfo.name" placeholder="请输入商品名称" class="input" />
			</view>

			<view class="form-item" v-if="goodsInfo.brand_name">
				<text class="label">品牌</text>
				<input v-model="goodsInfo.brand_name" disabled class="input disabled" />
			</view>

			<view class="form-item">
				<text class="label">价格</text>
				<input v-model="goodsInfo.total_amount" type="number" placeholder="请输入价格" class="input" />
				<!-- 货币选择器 -->
				<picker class="currency-picker" @change="updateCurrency" :value="currencyIndex"
					:range="currencyOptions">
					<view class="currency">{{goodsInfo.currency}}</view>
				</picker>

				<text class="hint">暂不支持小数点，如有加购项、不同售价，可以写在描述里</text>
			</view>


			<view class="form-item">
				<text class="label">尺寸</text>

				<!-- 尺寸选择按钮 -->
				<view class="selected-sizes" @tap="openSizeSelector">
					<text v-if="selectedSizeDisplay.length === 0">选择尺寸</text>
					<view v-else class="size-tags">
						<view v-for="(size, index) in selectedSizeDisplay" :key="index" class="size-tag">
							{{ size }}
						</view>
					</view>

					<text class="hint">可以多选您支持的尺寸，可以选择多个分类；我们推荐不同的大分类建多个词条，并在名称后面加入（x分）的描述。</text>
				</view>

				<!-- 尺寸选择器组件 -->
				<cascade-multi-select ref="sizeSelector" :show="showSizeSelector" :sizeData="sizeData"
					:initialSelection="initialSizeSelection" @close="showSizeSelector = false"
					@confirm="handleSizeSelection"></cascade-multi-select>
			</view>
			
			<!-- 类型选择器 -->
			<view class="form-item">
				<text class="label">类型</text>
				<picker @change="updateType" :value="typeIndex" :range="typeOptions">
					<view class="picker-content">{{goodsInfo.type || '请选择类型'}}</view>
				</picker>
			</view>
			

			<view class="form-item">
				<text class="label">肤色</text>
				<input v-model="goodsInfo.skin" placeholder="请输入肤色" class="input" />
				<!-- 肤色快捷选择 -->
				<view v-if="showSkinQuickSelector" class="skin-quick-selector">
					<view v-for="(skin, index) in skinQuickOptions" :key="index" class="skin-tag"
						@click="addSkin(skin)">
						{{ skin }}
					</view>
				</view>
			</view>

	
			<!-- 材质选择器 -->
			<view class="form-item">
				<text class="label">材质</text>
				<picker @change="updateMaterial" :value="materialIndex" :range="materialOptions">
					<view class="picker-content">{{goodsInfo.doll_material || '请选择材质'}}</view>
				</picker>
			</view>

			<!-- 			<view class="form-item">
				<text class="label">跳转口令</text>
				<input v-model="goodsInfo.short_link" placeholder="请自定义跳转口令" class="input" />
				<text class="hint">您可以在小红书微博等平台告诉您的用户跳转口令，用户在搜索框内输入完整口令即可跳转到您的商品详情页面，之后您可以通过描述字段告诉用户该如何购买。</text>
				<text class="hint">口令唯一不可重复，且不要包含特殊字符，以便用户输入。例如这样告诉用户：狗狗助手神秘咒语 → 眠猫123</text>
				<text class="hint">最低支持口令跳转版本 1.1.0</text>
			</view> -->

			<view class="form-item">
				<text class="label">描述</text>
				<textarea v-model="goodsInfo.desc_content" placeholder="请输入商品描述" class="textarea" auto-height />
				<text class="hint">可以填写加购项目或不同肤色的价格。</text>
			</view>

			<!-- 图片编辑区域 -->
			<view class="form-item">
				<text class="label">商品图片</text>
				<text class="hint">长按图片可拖拽排序{{ showDelete ? "，点击图片右上角可删除。" : "" }} </text>
				<text class="hint">为了保持版面美观，
					请将最好看的一张图放在第一张，第一张不要用大字报。为了保证用户最佳观看效果，请不要上传过大图片和长宽比效果不佳的图片（3:4最优)。
				</text>
				<text class="hint">同时为了保护平台数据安全，我们会在一段时间后自动添加水印，但您仍然能看到无水印原图。</text>

				<view v-if="goodsInfo.goods_images.length < 9" class="add-image-btn" @click="addImages">
					<uni-icons type="plusempty" size="30" color="#999"></uni-icons>
					<text>添加图片</text>
				</view>
			</view>

			<view class="image-edit-container">
				<shmily-drag-image v-model="goodsInfo.goods_images" :cols="3" :showItemInfo="false" :itemMargin="10"
					:showDelete="true" border-radius="0" @sort-change="handleImageSortChange"
					@item-click="handleItemClick" :custom-click="true" @delete="handleDeleteImage" keyName="src" />
			</view>
		</scroll-view>

		<!-- 底部操作按钮 -->
		<view class="footer">
			<button class="btn save-btn" @click="saveGoods">{{ isEditMode ? '保存修改' : '添加商品' }}</button>
		</view>


	</view>
</template>

<script setup>
	import {
		ref,
		onMounted,
		computed
	} from 'vue';
	import {
		websiteUrl
	} from '@/common/config.js';
	import {
		chooseImageList,
		getQiniuToken,
		uploadImageToQiniu
	} from '@/common/image.js'; // 引入工具函数
	const props = defineProps({
		goods_id: {
			type: String
		}
	})
	
	// 判断是编辑模式还是新增模式
	const isEditMode = computed(() => {
		return props.goods_id && props.goods_id !== '0' && props.goods_id !== 'new';
	});
	
	// 商品信息
	const goodsInfo = ref({
		id: 0,
		name: '',
		brand_id: 0,
		brand_name: '',
		total_amount: 0,
		currency: 'CNY',
		size: '',
		size_detail: '',
		skin: '',
		type: '',
		desc_content: '',
		doll_material: '',
		goods_images: [],
		sizes: [] // 尺寸数组
	});
	
	// 控制是否显示删除按钮
	const showDelete = ref(true);

	// 尺寸选择器相关
	const sizeData = ref([])
	const sizeOptions = ref([]);
	const selectedSizePath = ref([]);

	const showSizeSelector = ref(false);
	const sizeSelector = ref(null);

	// 类型选项
	const typeOptions = ref([]);
	const typeIndex = ref(-1);

	// 货币选项
	const currencyOptions = ref([]);
	const currencyIndex = ref(-1);
	const currencyMap = ref({});

	// 材质选项
	const materialOptions = ref([]);
	const materialIndex = ref(-1);

	// 肤色快捷选项
	const skinQuickOptions = ref(['白肌', '浅烧', '牡丹白', '奶油', '半白', '粉白', '普肌', '粉普', '烧肌']);
	const showSkinQuickSelector = computed(() => {
		return ['整体', '单体', '单头'].includes(goodsInfo.value.type);
	});


	// 初始尺寸选择
	const initialSizeSelection = ref([]);

	// 选中的尺寸显示格式
	const selectedSizeDisplay = computed(() => {
		// 确保 sizes 存在且为数组
		if (!goodsInfo.value.sizes || !Array.isArray(goodsInfo.value.sizes)) {
			return [];
		}

		return goodsInfo.value.sizes.map(item => {
			return `${item.goods_size}/${item.size_detail}`;
		});
	});
	
	// 打开尺寸选择器
	const openSizeSelector = () => {
		// 设置初始选择值
		initialSizeSelection.value = (goodsInfo.value.sizes || []).map(item => ({
			category: item.goods_size,
			size: item.size_detail
		}));

		showSizeSelector.value = true;
	};

	// 处理尺寸选择结果
	const handleSizeSelection = (sizes) => {
		goodsInfo.value.sizes = sizes.map(item => ({
			goods_size: item.category,
			size_detail: item.size
		}));
	};


	// 获取商品信息
	const fetchGoodsInfo = async () => {
		try {
			// 如果是新增模式，不需要获取商品信息
			if (!isEditMode.value) {
				// 初始化品牌信息（从用户信息或全局状态获取）
				const userInfo = uni.getStorageSync('userInfo');
				if (userInfo && userInfo.brand) {
					goodsInfo.value.brand_id = userInfo.brand.id;
					goodsInfo.value.brand_name = userInfo.brand.name;
				}
				return;
			}
			
			uni.showLoading({
				title: '加载中...'
			});
			const token = uni.getStorageSync('token');
			if (!token) {
				error.value = '未登录，请先登录';
				loading.value = false;
				loadStatus.value = 'more';
				return;
			}

			const res = await uni.request({
				url: `${websiteUrl.value}/brand-manager/get-goods-info-by-id`,
				method: 'GET',
				data: {
					id: props.goods_id
				},
				header: {
					Authorization: token
				},
			});

			if (res.data.status === 'success') {
				const data = res.data.data;

				goodsInfo.value = {
					...data,
					// 确保 sizes 数组存在
					sizes: data.sizes || [],
					goods_images: data.goods_images.map(img => ({
						id: img.id,
						src: img.url,
						name: '',
						price: '',
						type: '',
					})),
				};

				// 设置类型索引
				typeIndex.value = typeOptions.value.indexOf(goodsInfo.value.type);

				// 设置货币索引
				currencyIndex.value = currencyOptions.value.findIndex(
					item => item === goodsInfo.value.currency
				);

				// 设置材质索引
				materialIndex.value = materialOptions.value.indexOf(
					goodsInfo.value.doll_material
				);
			} else {
				uni.showToast({
					title: res.data.msg,
					icon: 'none'
				});
			}
		} catch (error) {
			console.error('获取商品信息失败', error);
			uni.showToast({
				title: '获取商品信息失败',
				icon: 'none'
			});
		} finally {
			uni.hideLoading();
		}
	};


	// 获取尺寸数据
	const fetchSizes = async () => {
		try {
			const res = await uni.request({
				url: `${websiteUrl.value}/sizes`,
				method: 'GET'
			});

			if (res.data.status === "success") {
				sizeData.value = res.data.data;
				const formattedSizes = [];

				for (const [category, items] of Object.entries(sizeData.value)) {
					formattedSizes.push({
						text: category,
						value: category,
						children: items.map(item => ({
							text: item,
							value: item
						}))
					});
				}

				sizeOptions.value = formattedSizes;
			}
		} catch (err) {
			console.error('获取尺寸数据失败:', err);
			uni.showToast({
				title: '获取尺寸数据失败',
				icon: 'none'
			});
		}
	};

	// 获取类型数据
	const fetchTypes = async () => {
		try {
			const res = await uni.request({
				url: `${websiteUrl.value}/goods-types`,
				method: 'GET'
			});

			if (res.data.status === "success") {
				typeOptions.value = res.data.data;
			}
		} catch (err) {
			console.error('获取类型数据失败:', err);
			uni.showToast({
				title: '获取类型数据失败',
				icon: 'none'
			});
		}
	};

	// 获取货币数据
	const fetchCurrencies = async () => {
		try {
			const res = await uni.request({
				url: `${websiteUrl.value}/currency`,
				method: 'GET'
			});

			if (res.data.status === "success") {
				currencyMap.value = res.data.data;
				currencyOptions.value = Object.keys(res.data.data);
			}
		} catch (err) {
			console.error('获取货币数据失败:', err);
			uni.showToast({
				title: '获取货币数据失败',
				icon: 'none'
			});
		}
	};
	
	const handleItemClick = (item) => {
	  console.log("点击了图片", item);
	  
	  // 构建预览所需的图片 URL 列表
	  const urls = goodsInfo.value.goods_images.map(img => img.src);
	  
	  // 查找当前点击图片在列表中的索引
	  const currentIndex = goodsInfo.value.goods_images.findIndex(img => img.id === item.id);
	  
	  // 调用预览接口
	  uni.previewImage({
		urls: urls, // 所有图片的 URL 列表
		current: currentIndex >= 0 ? currentIndex : 0, // 当前点击图片的索引
		indicator: "default", // 显示指示器
		loop: true // 支持循环预览
	  });
	  
	  // 返回 false 阻止默认的跳转行为
	  return false;
	};
	// 获取材质数据
	const fetchMaterials = async () => {
		try {
			let url = `${websiteUrl.value}/materials`;
			if (goodsInfo.value.type === '假发') {
				url = `${websiteUrl.value}/hair-materials`;
			}

			const res = await uni.request({
				url,
				method: 'GET'
			});

			if (res.data.status === "success") {
				materialOptions.value = res.data.data;
			}
		} catch (err) {
			console.error('获取材质数据失败:', err);
			uni.showToast({
				title: '获取材质数据失败',
				icon: 'none'
			});
		}
	};

	// 尺寸选择变化
	const onSizeChange = (e) => {
		const nodes = e.detail.value;

		if (nodes.length === 2) {
			goodsInfo.value.size = nodes[0].value;
			goodsInfo.value.size_detail = nodes[1].value;
		} else {
			goodsInfo.value.size = '';
			goodsInfo.value.size_detail = '';
		}
	};

	// 更新类型
	const updateType = (e) => {
		const index = e.detail.value;
		typeIndex.value = index;
		goodsInfo.value.type = typeOptions.value[index];

		// 类型改变时重新获取材质
		fetchMaterials();
	};

	// 更新货币
	const updateCurrency = (e) => {
		const index = e.detail.value;
		currencyIndex.value = index;
		goodsInfo.value.currency = currencyOptions.value[index];
	};

	// 更新材质
	const updateMaterial = (e) => {
		const index = e.detail.value;
		materialIndex.value = index;
		goodsInfo.value.doll_material = materialOptions.value[index];
	};

	// 添加肤色快捷选项
	const addSkin = (skin) => {
		if (goodsInfo.value.skin) {
			goodsInfo.value.skin += ` ${skin}`;
		} else {
			goodsInfo.value.skin = skin;
		}
	};


	// 处理图片排序变化
	const handleImageSortChange = (sortedIds) => {
		// 根据排序后的ID重新排序图片数组
		const sortedImages = [];
		sortedIds.forEach(id => {
			const image = goodsInfo.value.goods_images.find(img => img.id === id);
			if (image) sortedImages.push(image);
		});
		goodsInfo.value.goods_images = sortedImages;
	};

	// 保存商品信息
	const saveGoods = async () => {
		try {
			uni.showLoading({
				title: '保存中...'
			});

			// 表单验证
			if (!goodsInfo.value.name) {
				uni.showToast({
					title: '请填写商品名称',
					icon: 'none'
				});
				return;
			}
			
			if (!goodsInfo.value.type) {
				uni.showToast({
					title: '请选择商品类型',
					icon: 'none'
				});
				return;
			}
			
			if (!goodsInfo.value.goods_images || goodsInfo.value.goods_images.length === 0) {
				uni.showToast({
					title: '请至少上传一张商品图片',
					icon: 'none'
				});
				return;
			}

			// 准备要提交的数据
			const submitData = {
				...goodsInfo.value,
				// 转换图片格式为后端需要的格式
				goods_images: goodsInfo.value.goods_images.map(img => ({
					id: img.id,
					url: img.src
				})),
				// 尺寸数据已经是后端需要的格式
				sizes: goodsInfo.value.sizes,
				total_amount: parseInt(goodsInfo.value.total_amount)
			};

			const token = uni.getStorageSync('token');
			if (!token) {
				error.value = '未登录，请先登录';
				loading.value = false;
				loadStatus.value = 'more';
				return;
			}

			// 根据模式选择接口
			const apiUrl = isEditMode.value ? 
				`${websiteUrl.value}/brand-manager/update-goods` : 
				`${websiteUrl.value}/brand-manager/add-goods`;
				
			const method = isEditMode.value ? 'POST' : 'POST';

			// 调用接口
			const res = await uni.request({
				url: apiUrl,
				method: method,
				data: submitData,
				header: {
					Authorization: token
				},
			});

			if (res.data.status === 'success') {
				uni.showToast({
					title: isEditMode.value ? '保存成功' : '添加成功'
				});
				setTimeout(() => {
					uni.navigateBack();
				}, 1500);
			} else {
				uni.showToast({
					title: res.data.msg || (isEditMode.value ? '保存失败' : '添加失败'),
					icon: 'none'
				});
			}
		} catch (error) {
			console.error('操作失败', error);
			uni.showToast({
				title: isEditMode.value ? '保存失败' : '添加失败',
				icon: 'none'
			});
		} finally {
			uni.hideLoading();
		}
	};

	// 添加图片方法
	const addImages = async () => {
		try {
			// 计算还能添加几张图片
			const remaining = 9 - goodsInfo.value.goods_images.length;
			if (remaining <= 0) {
				uni.showToast({
					title: '最多只能添加9张图片',
					icon: 'none'
				});
				return;
			}

			// 选择图片
			const tempFilePaths = await chooseImageList(remaining);

			// 显示上传进度
			uni.showLoading({
				title: '上传中...',
				mask: true
			});

			// 上传所有图片
			for (let i = 0; i < tempFilePaths.length; i++) {
				try {
					// 更新上传状态
					uni.showLoading({
						title: `上传中 (${i+1}/${tempFilePaths.length})`,
						mask: true
					});

					// 获取七牛云上传凭证
					const qiniuTokenData = await getQiniuToken();

					// 检查返回的数据结构
					if (!qiniuTokenData || !qiniuTokenData.path || !qiniuTokenData.token) {
						throw new Error('获取上传凭证失败: 缺少必要字段');
					}

					// 使用七牛云返回的 path 作为文件名
					const fileName = qiniuTokenData.path;

					// 上传图片到七牛云
					const result = await uploadImageToQiniu(
						tempFilePaths[i],
						qiniuTokenData.token,
						fileName
					);

					if (result && result.imageUrl) {
						// 将新图片添加到商品图片列表
						goodsInfo.value.goods_images.push({
							id: Date.now() + i, // 临时ID
							src: result.imageUrl,
							name: '',
							price: '',
							type: '',
						});
					}
				} catch (error) {
					console.error(`第 ${i+1} 张图片上传失败:`, error);
					uni.showToast({
						title: `第 ${i+1} 张图片上传失败: ${error.message || error}`,
						icon: 'none',
						duration: 3000
					});
				}
			}

			uni.hideLoading();
			uni.showToast({
				title: `成功添加${tempFilePaths.length}张图片`,
				icon: 'success'
			});
		} catch (error) {
			console.error('添加图片失败', error);
			uni.hideLoading();
			uni.showToast({
				title: `添加图片失败: ${error.message || error}`,
				icon: 'none',
				duration: 3000
			});
		}
	};


	// 处理图片删除事件
	const handleDeleteImage = (imageId) => {
		uni.showModal({
			title: '删除确认',
			content: '确定要删除这张图片吗？',
			confirmText: '删除',
			confirmColor: '#ff3b30',
			success: (res) => {
				if (res.confirm) {
					// 从商品图片列表中删除该图片
					goodsInfo.value.goods_images = goodsInfo.value.goods_images.filter(
						img => img.id !== imageId
					);

					uni.showToast({
						title: '图片已删除',
						icon: 'success'
					});

					// 这里可以添加调用后台接口删除图片的逻辑
					// deleteImageFromServer(imageId);
				}
			}
		});
	};

	onMounted(async () => {
		// 设置页面标题
		uni.setNavigationBarTitle({
			title: isEditMode.value ? "编辑商品信息" : "添加新商品"
		})
		
		// 先获取基础数据
		await fetchSizes();
		await fetchTypes();
		await fetchCurrencies();

		// 然后获取商品信息
		await fetchGoodsInfo();

		// 最后获取材质（需要商品类型信息）
		await fetchMaterials();
	});
</script>

<style lang="less" scoped>
	.container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: #f8f8f8;
	}

	.form-container {
		flex: 1;
		padding: 20rpx 30rpx;
		box-sizing: border-box;
	}

	.form-item {
		margin-bottom: 30rpx;
		background-color: #fff;
		border-radius: 16rpx;
		padding: 24rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		position: relative;

		.label {
			display: block;
			font-size: 28rpx;
			font-weight: 600;
			color: #333;
			margin-bottom: 16rpx;
		}

		.hint {
			display: block;
			font-size: 24rpx;
			color: #999;
			margin: 16rpx 0;
			letter-spacing: 1rpx;
		}

		.input {
			height: 80rpx;
			background-color: #f9f9f9;
			border-radius: 12rpx;
			padding: 0 20rpx;
			font-size: 28rpx;
			color: #333;

			&.disabled {
				background-color: #f0f0f0;
				color: #999;
			}
		}

		.textarea {
			min-height: 160rpx;
			background-color: #f9f9f9;
			border-radius: 12rpx;
			padding: 20rpx;
			font-size: 28rpx;
			color: #333;
			width: calc(100% - 40rpx);
		}

		.currency {
			position: absolute;
			right: 50rpx;
			bottom: 30rpx;
			transform: translateY(-50%);
			font-size: 28rpx;
			color: #333;
		}
	}

	.image-edit-container {
		margin-top: 20rpx;
		display: flex;
		flex-wrap: wrap;
		margin-top: 20rpx;
	}

	.footer {
		padding: 20rpx 30rpx;
		background-color: #fff;
		box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.05);

		.btn {
			height: 88rpx;
			border-radius: 44rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 32rpx;
			font-weight: 500;

			&.save-btn {
				background: linear-gradient(to right, #65c6d9, #4a9db5);
				color: #fff;
			}
		}
	}

	/* 添加图片按钮样式 */
	.add-image-btn {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 200rpx;
		height: 200rpx;
		background-color: #f9f9f9;
		border: 2rpx dashed #ddd;
		border-radius: 16rpx;
		margin: 10rpx;
		cursor: pointer;
		transition: all 0.3s;

		&:active {
			background-color: #f0f0f0;
			transform: scale(0.98);
		}

		text {
			font-size: 26rpx;
			color: #999;
			margin-top: 10rpx;
		}
	}


	/* 添加图片按钮样式 */
	.add-image-btn {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 200rpx;
		height: 200rpx;
		background-color: #f9f9f9;
		border: 2rpx dashed #ddd;
		border-radius: 16rpx;
		margin: 10rpx;
		cursor: pointer;
		transition: all 0.3s;

		&:active {
			background-color: #f0f0f0;
			transform: scale(0.98);
		}

		text {
			font-size: 26rpx;
			color: #999;
			margin-top: 10rpx;
		}
	}

	/* 尺寸选择器样式 */
	.size-picker {
		border: none;
		border-radius: 12rpx;
		padding: 0 20rpx;
		height: 80rpx;
		line-height: 80rpx;
		background-color: #f9f9f9;
		margin-top: 15rpx;

		/deep/.input-value-border {
			border: none;
			position: relative;
			top: 10rpx;
		}
	}

	/* 肤色快速选择器 */
	.skin-quick-selector {
		display: flex;
		flex-wrap: wrap;
		margin-top: 20rpx;
		gap: 10rpx;

		.skin-tag {
			padding: 8rpx 20rpx;
			background-color: #f0f8ff;
			border-radius: 40rpx;
			font-size: 24rpx;
			color: #4a9db5;
			border: 1rpx solid #65c6d9;

			&:active {
				background-color: #d1e8f0;
			}
		}
	}

	/* 选择器内容样式 */
	.picker-content {
		height: 80rpx;
		line-height: 80rpx;
		padding: 0 20rpx;
		background-color: #f9f9f9;
		border-radius: 12rpx;
		color: #333;
	}

	.currency-picker {
		width: 150rpx;
		position: absolute;
		right: 10rpx;
		bottom: 60rpx;
	}
</style>