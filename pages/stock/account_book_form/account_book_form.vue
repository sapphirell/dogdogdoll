<template>
  <view-logs />
  <view class="container">
    <meta name="theme-color" content="#F8F8F8">
    </meta>
    <!-- 分类管理弹窗 -->
    <common-modal :visible="typeModalVisible" @update:visible="val => typeModalVisible = val" top="100rpx">
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
        <view class="form-input" style="padding:0;">
			<view class="custom-search-container">
				<goods-search :font-size="'24rpx'" mode="fill" @select="handleGoodsSelect" v-model="name"
				  :background="'#fff'" :width="'620rpx'" :show-icon="false" class="custom-search" />
			</view>
          
        </view>
      </view>

      <!-- 价值 -->
      <view class="form-item">
        <text class="form-label">价值</text>
        <input class="form-input" type="digit" placeholder="请输入价值" placeholder-class="placeholder-style"
          v-model="price" />
      </view>

      <!-- 个数 -->
      <view class="form-item">
        <text class="form-label">个数</text>
        <input class="form-input" type="number" placeholder="请输入个数" placeholder-class="placeholder-style"
          v-model="count" />
      </view>

      <!-- 图片上传 -->
      <view class="form-item">
        <text class="form-label">物品图片</text>
        <view class="upload-wrapper">
          <view class="image-grid">
            <!-- 已上传图片预览 -->
            <view v-for="(img, index) in imageList" :key="index" class="preview-image">
              <image mode="aspectFill" :src="img" class="image-preview" @tap="viewFullImage(index)">
              </image>
              <view class="image-actions">
                <uni-icons type="close" size="22" color="#fff" @tap="(e) => removeImage(index, e)"
                  class="delete-icon"></uni-icons>
              </view>
            </view>

            <!-- 添加图片按钮 -->
            <view class="add-image-box" @click="selectImage">
              <uni-icons type="plusempty" size="40" color="#ccc"></uni-icons>
              <text class="add-text">添加图片</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 尺寸选择器 -->
      <view class="form-item">
        <text class="form-label">尺寸</text>
        <uni-data-picker placeholder="请选择尺寸" :localdata="sizeOptions" :value="selectedSizePath"
          @change="onSizeChange" class="size-picker">
        </uni-data-picker>
      </view>

      <!-- 更多信息折叠区域 -->
      <view class="form-item">
        <label class="remind-label" @tap="toggleMoreInfo()">
          <view class="arrow-icon" :class="{ 'arrow-down': showMoreInfo }"></view>
          <text>更多信息</text>
        </label>
      </view>

      <view v-if="showMoreInfo" class="more-info-form">
        <!-- 尺寸详情 -->
        <view class="form-item size_detail">
          <text class="form-label">尺寸详情</text>
          <input v-model="moreInfo.sizeDetail" placeholder="请输入尺寸详情" class="form-input" />
        </view>

        <!-- 颜色 -->
        <view class="form-item">
          <text class="form-label">颜色</text>
          <input v-model="moreInfo.color" placeholder="请输入颜色" class="form-input" />
        </view>

        <!-- 新增字段开始 -->
        <!-- 店名 -->
        <view class="form-item">
          <text class="form-label">店名</text>
          <input v-model="moreInfo.shopName" placeholder="请输入店名" class="form-input" />
        </view>

        <!-- 头围 -->
        <view class="form-item">
          <text class="form-label">头围</text>
          <input v-model="moreInfo.headCircumference" placeholder="请输入头围(cm)" class="form-input"
            type="digit" />
        </view>

        <!-- 肩宽 -->
        <view class="form-item">
          <text class="form-label">肩宽</text>
          <input v-model="moreInfo.shoulderWidth" placeholder="请输入肩宽(cm)" class="form-input" type="digit" />
        </view>

        <!-- 妆师 -->
        <view class="form-item">
          <text class="form-label">妆师</text>
          <input v-model="moreInfo.makeupArtist" placeholder="请输入妆师" class="form-input" />
        </view>
        <!-- 新增字段结束 -->

        <!-- 备注 -->
        <view class="form-item">
          <text class="form-label">备注</text>
          <input v-model="moreInfo.remark" placeholder="请输入备注" class="form-input" />
        </view>

        <!-- 购入时间 -->
        <view class="form-item">
          <text class="form-label">购入时间</text>
          <view class="date-picker-wrapper">
            <picker mode="date" :value="moreInfo.buyDate"
              @change="(e) => moreInfo.buyDate = e.detail.value">
              <view class="picker-content">
                {{ moreInfo.buyDate || '选择购入日期' }}
              </view>
            </picker>
          </view>
        </view>

        <!-- 新增字段开始 -->
        <!-- 到家日期 -->
        <view class="form-item">
          <text class="form-label">到家日期</text>
          <view class="date-picker-wrapper">
            <picker mode="date" :value="moreInfo.arrivalDate"
              @change="(e) => moreInfo.arrivalDate = e.detail.value">
              <view class="picker-content">
                {{ moreInfo.arrivalDate || '选择到家日期' }}
              </view>
            </picker>
          </view>
        </view>

        <!-- 附加值 -->
        <view class="form-item">
          <text class="form-label">附加值（妆费或h了多少入）</text>
          <input v-model="moreInfo.additionalValue" placeholder="请输入附加值" class="form-input" type="digit" />
        </view>
        <!-- 新增字段结束 -->

        <!-- 存放位置 -->
        <view class="form-item">
          <text class="form-label">存放位置</text>
          <input v-model="moreInfo.position" placeholder="请输入存放位置" class="form-input" />
        </view>
      </view>

      <!-- 补款提醒 -->
      <view class="form-item">
        <label class="remind-label" @tap="toggleRemind()">
          <view class="arrow-icon" :class="{ 'arrow-down': form.isRemind }"></view>
          <text>需要补款提醒</text>
          <!-- 新增小红点 -->
          <view v-if="form.finalPrice > 0 " class="remind-dot"></view>
        </label>
      </view>

      <view v-if="form.isRemind" class="remind-form">
        <view class="form-item">
          <text class="form-label">尾款金额</text>
          <input type="number" v-model="form.finalPrice" placeholder="请输入待补款金额" class="form-input" />
        </view>

        <view class="form-item">
          <text class="form-label">补款日期</text>
          <view class="date-picker-wrapper">
            <picker mode="date" :value="form.finalTime" @change="form.finalTime = $event.detail.value">
              <view class="picker-content">
                {{ form.finalTime || '选择截止日期' }}
              </view>
            </picker>
          </view>
        </view>
      </view>
      
      <view class="info-text">
        <image src="/static/info-circle.png" mode="aspectFill"></image>
        <text>仅用于记录您所购买过的物品，其他人不会看到</text>
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
		onShow,
		onLoad
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

	// 新增：个数字段
	const count = ref(1);

	// 修改：将accountImage改为imageList数组
	const imageList = ref([]);

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
	const defaultTypes = [];

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

	// 更多信息折叠状态
	const showMoreInfo = ref(false);

	// 尺寸选择器数据
	const sizeOptions = ref([]);
	const selectedSize = ref([]);
	// 存储用户选择的尺寸路径 [大分类, 小分类]
	const selectedSizePath = ref([]);

	// 更多信息数据
	const moreInfo = ref({
		sizeDetail: '',
		color: '',
		remark: '',
		buyDate: '',
		position: '',
		shopName: '', // 店名
		headCircumference: '', // 头围
		shoulderWidth: '', // 肩宽
		makeupArtist: '', // 妆师
		arrivalDate: '', // 到家日期
		additionalValue: '' // 附加值
	});

	// 获取尺寸数据
	const fetchSizes = async () => {
		try {
			const res = await uni.request({
				url: websiteUrl.value + '/sizes',
				method: 'GET'
			});

			if (res.data.status === "success") {
				const sizesData = res.data.data;
				const formattedSizes = [];

				// 转换为正确的层级结构
				for (const [category, items] of Object.entries(sizesData)) {
					formattedSizes.push({
						text: category, // 大分类名称 (如"二分")
						value: category, // 大分类值
						children: items.map(item => ({
							text: item, // 小分类名称 (如"普通二分")
							value: item // 小分类值
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

	// 尺寸选择变化 - 修复处理逻辑
	const onSizeChange = (e) => {
		const nodes = e.detail.value;

		// 确保选择了完整路径 [大分类, 小分类]
		if (nodes.length === 2) {
			selectedSizePath.value = [
				nodes[0].value, // 大分类值
				nodes[1].value // 小分类值
			];

			// 自动填充尺寸详情
			moreInfo.value.sizeDetail = nodes[1].value;
		} else {
			selectedSizePath.value = [];
			moreInfo.value.sizeDetail = '';
		}
	};

	// 切换更多信息折叠
	const toggleMoreInfo = () => {
		showMoreInfo.value = !showMoreInfo.value;
	};

	// 获取分类数据
	const getAccountTypes = async () => {
		const token = uni.getStorageSync('token');
		try {
			const res = await uni.request({
				url: websiteUrl.value + '/with-state/account-types',
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
				url: websiteUrl.value + '/with-state/add-account-type',
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
							url: websiteUrl.value + '/with-state/delete-account-type',
							method: 'POST',
							header: {
								'Authorization': token,
								'Content-Type': 'application/json' // 添加Content-Type
							},
							data: {
								id
							}, // 使用JSON格式传参
						});

						const resData = response.data;

						if (resData.status === "success") { // 严格判断状态
							await getAccountTypes();
							uni.showToast({
								title: '删除成功'
							});
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

	// 切换账本选择类型
	function updateSelectedType(e) {
		selectedType.value = e.detail.value
	}

	//以id获取账本详情
	function getAccountBookById(id) {
		let token = uni.getStorageSync('token')
		// /with-state/account-book-detail
		uni.request({
			url: websiteUrl.value + '/with-state/account-book-detail',
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
				count.value = res.data.data.count || 1; // 新增：设置个数
				selectedType.value = typeOptions.value.indexOf(res.data.data.type);
				// 修改：处理图片字符串为数组
				if (res.data.data.image_url) {
					imageList.value = res.data.data.image_url.split(',');
				}
				form.value = {
					isRemind: res.data.data.is_remind,
					finalPrice: res.data.data.final_price,
					finalTime: res.data.data.final_time
				}
				
				// 修复：确保在分类数据加载后设置选中值
				const typeName = res.data.data.type;
				const index = typeOptions.value.findIndex(option => option === typeName);
				
				if (index !== -1) {
				  selectedType.value = index;
				} else {
				  console.warn(`未找到分类: ${typeName}`);
				  selectedType.value = 0; // 默认选择"请选择分类"
				}

				// 设置更多信息字段
				moreInfo.value = {
					sizeDetail: res.data.data.size_detail || '',
					color: res.data.data.color || '',
					remark: res.data.data.remark || '',
					buyDate: res.data.data.buy_date ? new Date(res.data.data.buy_date).toISOString().split(
						'T')[0] : '',
					position: res.data.data.position || '',
					shopName: res.data.data.shop_name || '',
					headCircumference: res.data.data.head_circumference || '',
					shoulderWidth: res.data.data.shoulder_width || '',
					makeupArtist: res.data.data.makeup_artist || '',
					arrivalDate: res.data.data.arrival_date ? new Date(res.data.data.arrival_date)
						.toISOString().split('T')[0] : '',
					additionalValue: res.data.data.additional_value || ''
				};

				// 设置尺寸选择器
				if (res.data.data.size) {
					// 正确设置尺寸路径 [大分类, 小分类]
					selectedSizePath.value = [
						res.data.data.size,
						res.data.data.size_detail || ''
					];
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
				url: websiteUrl.value + `/goods?id=${goods.id}`,
				method: 'GET'
			});

			if (res.data.status === "success") {
				const detail = res.data.data;
				// 自动填充信息
				name.value = detail.name;
				price.value = detail.fin_amount + detail.sub_amount;
				count.value = 1; // 默认个数为1

				// 添加商品图片
				if (detail.goods_images?.[0]) {
					// 清空原有图片，只添加新商品的图片
					imageList.value = [detail.goods_images[0]];
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
						uni.showToast({
							title: '参数错误',
							icon: 'none'
						});
						return;
					}

					uni.request({
						url: websiteUrl.value + '/with-state/delete-account-book',
						method: 'POST',
						header: {
							'Authorization': uni.getStorageSync('token'),
							'Content-Type': 'application/json' // 添加Content-Type
						},
						data: {
							id
						}, // 改为JSON格式传参
						success: (res) => {
							// 严格判断响应状态
							console.log(res.data.status)
							if (res.data.status === "success") {
								uni.showToast({
									title: '删除成功',
									icon: 'success'
								});
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
							uni.showToast({
								title: '网络错误',
								icon: 'none'
							});
						}
					});
				}
			}
		});
	}

	// 选择图片（支持多选）
	async function selectImage() {
		uni.chooseImage({
			count: 9,
			success: async (res) => {
				const tempFilePaths = res.tempFilePaths;

				// 依次上传所有图片（每张图片使用独立的 token）
				for (const filePath of tempFilePaths) {
					try {
						// 为每张图片获取独立的 token
						const tokenData = await getQiniuToken();
						const uploadRes = await uploadImageToQiniu(filePath, tokenData.token, tokenData
							.path);
						console.log("res:", uploadRes)
						if (uploadRes.qiniuRes.statusCode === 200) {
							const imageUrl = image1Url + tokenData.path;
							imageList.value.push(imageUrl);
						} else {
							console.error('上传失败:', filePath);
						}
					} catch (error) {
						console.error('上传错误:', error);
					}
				}

				uni.showToast({
					title: `上传了${tempFilePaths.length}张图片`,
					icon: 'success'
				});
			}
		});
	}
	// 删除图片

	function removeImage(index, event) {
		if (event && event.stopPropagation) {
			event.stopPropagation();
		}

		uni.showModal({
			title: '删除图片',
			content: '确定删除这张图片吗？',
			success: (res) => {
				if (res.confirm) {
					imageList.value.splice(index, 1);
				}
			}
		});
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
		// 新增：验证个数
		if (count.value <= 0) {
			uni.showToast({
				title: '个数必须大于0',
				icon: 'none'
			});
			return false;
		}

		if (form.value.isRemind) {
			if (!form.value.finalPrice || form.value.finalPrice <= 0) {
				uni.showToast({
					title: '请输入正确的尾款金额',
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
			count: parseInt(count.value, 10), // 新增：个数
			type: typeOptions.value[selectedType.value], // 使用合并后的分类列表
			image_url: imageList.value.join(','), // 修改：图片数组转逗号分隔字符串
			is_remind: form.value.isRemind,
			final_price: parseInt(form.value.finalPrice, 10),
			final_time: form.value.finalTime,
			// 新增更多信息字段
			size: selectedSizePath.value[0] || '', // 大分类
			size_detail: moreInfo.value.sizeDetail || '', // 小分类/尺寸详情
			color: moreInfo.value.color,
			remark: moreInfo.value.remark,
			buy_date: moreInfo.value.buyDate,
			position: moreInfo.value.position,
			shop_name: moreInfo.value.shopName,
			head_circumference: moreInfo.value.headCircumference,
			shoulder_width: moreInfo.value.shoulderWidth,
			makeup_artist: moreInfo.value.makeupArtist,
			arrival_date: moreInfo.value.arrivalDate,
			additional_value: moreInfo.value.additionalValue
		}

		console.log('提交数据:', postData)

		uni.request({
			url: websiteUrl.value + '/with-state/add-account-book',
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
			count: parseInt(count.value, 10), // 新增：个数
			type: typeOptions.value[selectedType.value], // 使用合并后的分类列表
			image_url: imageList.value.join(','), // 修改：图片数组转逗号分隔字符串
			id: parseInt(props.account_book_id, 10),
			is_remind: form.value.isRemind, // 转换为数据库需要的格式
			final_price: parseInt(form.value.finalPrice, 10),
			final_time: form.value.finalTime,
			// 新增更多信息字段
			size: selectedSizePath.value[0] || '', // 大分类
			size_detail: moreInfo.value.sizeDetail || '', // 小分类/尺寸详情
			color: moreInfo.value.color,
			remark: moreInfo.value.remark,
			buy_date: moreInfo.value.buyDate,
			position: moreInfo.value.position,
			shop_name: moreInfo.value.shopName,
			head_circumference: moreInfo.value.headCircumference,
			shoulder_width: moreInfo.value.shoulderWidth,
			makeup_artist: moreInfo.value.makeupArtist,
			arrival_date: moreInfo.value.arrivalDate,
			additional_value: moreInfo.value.additionalValue,
		}

		uni.request({
			url: websiteUrl.value + '/with-state/update-account-book',
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

	//viewFullImage
	function viewFullImage(index) {
		uni.previewImage({
			current: imageList.value['index'],
			urls: imageList.value,
		})
	}

	// 在原有onShow中添加
	onShow(async () => {
	  await asyncGetUserInfo();
	  
	  // 1. 确保分类数据优先加载
	  await getAccountTypes();
	  
	  // 2. 加载尺寸数据
	  await fetchSizes();
	  
	  // 3. 如果是编辑模式，再加载账本详情
	  if (isEdit) {
	    await getAccountBookById(props.account_book_id);
	    uni.setNavigationBarTitle({
	      title: '编辑账本'
	    });
	  } else {
	    uni.setNavigationBarTitle({
	      title: '新增账本'
	    });
	  }
	});
	// 获取商品信息
	const getGoodsInfo = (id) => {
		return new Promise((resolve, reject) => {
			uni.request({
				url: websiteUrl.value + '/goods?id=' + id,
				method: 'GET',
				timeout: 5000,
				success: (res) => {
					if (res.data.status === "success") {
						resolve(res.data.data);
					} else {
						reject(new Error(res.data.msg || '获取商品信息失败'));
					}
				},
				fail: (err) => {
					console.error('商品详情获取失败', err);
					reject(err);
				}
			})
		})
	}

	// 使用商品信息填充表单
	const fillFormWithGoodsInfo = (goodsInfo) => {
		// 填充商品名称
		name.value = goodsInfo.name;

		// 计算总价（定金+尾款）
		const totalPrice = goodsInfo.total_amount ? goodsInfo.total_amount : (parseFloat(goodsInfo.sub_amount) || 0) +
			(parseFloat(goodsInfo.fin_amount) || 0);
		price.value = totalPrice;

		// 添加商品图片
		if (goodsInfo.goods_images && goodsInfo.goods_images.length > 0) {
			imageList.value = [goodsInfo.goods_images[0]];
		}

		// 如果有尺寸信息，设置尺寸选择器
		if (goodsInfo.size) {
			// 设置尺寸选择器
			selectedSizePath.value = [
				goodsInfo.size, // 大分类
				goodsInfo.size_detail || '' // 小分类/尺寸详情
			];

			// 填充尺寸详情
			moreInfo.value.sizeDetail = goodsInfo.size_detail || '';
		}

		// 如果有货币类型，添加到名称后面
		if (goodsInfo.currency) {
			name.value += ` (${goodsInfo.currency})`;
		}

		// 如果有颜色信息，填充颜色
		if (goodsInfo.color) {
			moreInfo.value.color = goodsInfo.color;
		}
	}

	// 在setup中添加onLoad钩子
	onLoad(async (options) => {
		// 接收跳转参数
		console.log("接收到的参数:", options);

		// 如果有goods_id参数，获取商品信息
		if (options.goods_id) {
			try {
				const goodsInfo = await getGoodsInfo(options.goods_id);
				fillFormWithGoodsInfo(goodsInfo);
			} catch (error) {
				console.error('获取商品信息失败:', error);
				uni.showToast({
					title: '获取商品信息失败',
					icon: 'none'
				});
			}
		}
	});
</script>


<style lang="scss" scoped>
$primary-color: #65C3D6;
$secondary-color: #94a5f3;
$border-color: #e0e0e0;
$bg-color: #f5f7fa;
$radius: 24rpx;

.container {
  background-color: $bg-color;
  min-height: 100vh;
}

.form-card {
  background: white;
  border-radius: $radius;
  padding: 40rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);
}

.form-item {
  margin-bottom: 48rpx;
  position: relative;
}

.form-label {
  position: absolute;
  left: 20rpx;
  top: -16rpx;
  padding: 0 10rpx;
  background: white;
  font-size: 26rpx;
  color: #b8b8b8;
  z-index: 1;
  transition: all 0.3s ease;
}

.form-input {
  height: 100rpx;
  padding: 0 20rpx;
  border: 2rpx solid $border-color;
  border-radius: 16rpx;
  font-size: 28rpx;
  transition: all 0.3s;
  line-height: 100rpx;
  background: white;
  position: relative;
  
  &:focus {
    border-color: $primary-color;
    box-shadow: 0 4rpx 12rpx rgba($primary-color, 0.2);
  }
}

.type-selector {
  display: flex;
  align-items: center;
  gap: 20rpx;
  
  .form-input {
    flex: 1;
  }
}

.manage-type {
  font-size: 24rpx;
  color: $primary-color;
  padding: 8rpx 20rpx;
  border: 1rpx solid $primary-color;
  border-radius: 40rpx;
  flex-shrink: 0;
  background: linear-gradient(135deg, #97e7f7, #d5acd6);
  transition: all 0.3s;
  color: #fff;
  
  &:active {
    background: rgba($primary-color, 0.2);
    transform: scale(0.98);
  }
}

.upload-wrapper {
  border: 2rpx dashed $border-color;
  border-radius: $radius;
  padding: 30rpx;
  text-align: center;
  background: #e0e0e038;
}

.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-top: 20rpx;
}

.preview-image {
  position: relative;
  width: 180rpx;
  height: 180rpx;
  border-radius: $radius;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  
  .image-preview {
    width: 100%;
    height: 100%;
  }
  
  .image-actions {
    position: absolute;
    top: 0;
    right: 0;
    padding: 6rpx;
    border-radius: 100%;
  }
  
  .delete-icon {
    display: block;
    background: rgba(255, 102, 102, 0.8);
    border-radius: 50%;
    height: 53rpx;
    width: 53rpx;
    box-sizing: border-box;
    padding: 4rpx;
  }
}

.add-image-box {
  width: 180rpx;
  height: 180rpx;
  border: 2rpx dashed $border-color;
  border-radius: $radius;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  color: #999;
  font-size: 24rpx;
  transition: all 0.3s;
  
  &:active {
    background: rgba($primary-color, 0.1);
    border-color: $primary-color;
  }
}

.add-text {
  margin-top: 10rpx;
}

.button-group {
  display: flex;
  gap: 20rpx;
  margin-top: 60rpx;
  
  button {
    flex: 1;
  }
}
.custom-search-container {
	position: relative;
	top: 15rpx;
	left: 5rpx;
	width: 90%;
}
.submit-button {
  background: linear-gradient(135deg, $primary-color, $secondary-color);
  color: white;
  border: none;
  border-radius: 16rpx;
  font-size: 32rpx;
  height: 96rpx;
  line-height: 96rpx;
  box-shadow: 0 8rpx 24rpx rgba($primary-color, 0.3);
  transition: all 0.3s;
  
  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}

.delete-button {
  background: linear-gradient(135deg, #adadad, #ffbdbb);
  color: white;
  border: none;
  border-radius: 16rpx;
  font-size: 32rpx;
  height: 96rpx;
  line-height: 96rpx;
  box-shadow: 0 8rpx 24rpx rgba(255, 77, 79, 0.2);
  transition: all 0.3s;
  
  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}

.remind-label {
  display: flex;
  align-items: center;
  gap: 15rpx;
  font-size: 28rpx;
  color: #666;
  position: relative;
  padding-right: 40rpx;
  cursor: pointer;
  
  .remind-dot {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 16rpx;
    height: 16rpx;
    background: #ff4444;
    border-radius: 50%;
    box-shadow: 0 2rpx 8rpx rgba(255, 68, 68, 0.2);
  }
}

.arrow-icon {
  width: 5rpx;
  height: 5rpx;
  border: solid #888;
  border-width: 0 2rpx 2rpx 0;
  transform: rotate(-45deg);
  transition: transform 0.3s ease;
  padding: 5rpx;
  position: relative;
  
  
  &.arrow-down {
    transform: rotate(45deg);
	bottom: 5rpx;
  }
}

.remind-form, .more-info-form {
  background: #e0e0e038;
  border-radius: $radius;
  padding: 30rpx;
  margin-top: 20rpx;
  border: 1px solid rgba($primary-color, 0.1);
  animation: fadeIn 0.3s ease;
  margin-bottom: 20rpx;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.type-modal {
  padding: 30rpx;
  box-sizing: border-box;
  width: 80vw;
  height: 50vh;
  
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
    background: white;
    border-radius: 12rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
    
    text {
      font-size: 26rpx;
      color: #333;
    }
  }
  
  .add-type-form {
    display: flex;
    gap: 20rpx;
    margin-bottom: 30rpx;
    
    .type-input {
      flex: 1;
      border: 1rpx solid #ddd;
      border-radius: 16rpx;
      padding: 0 30rpx;
      font-size: 26rpx;
      height: 80rpx;
      line-height: 80rpx;
    }
    
    .add-btn {
      background: $primary-color;
      color: white;
      font-size: 26rpx;
      padding: 0 30rpx;
      border-radius: 16rpx;
      height: 80rpx;
      line-height: 80rpx;
      transition: all 0.3s;
      
      &:active {
        opacity: 0.9;
      }
    }
  }
}

.picker-content {
  height: 100rpx;
  line-height: 100rpx;
  color: #333;
  padding: 0 20rpx;
}

.info-text {
  color: #888;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  margin-top: 30rpx;
  
  image {
    width: 28rpx;
    height: 28rpx;
    margin-right: 10rpx;
  }
}

.size-picker {
  padding: 20rpx 0;
  
  ::v-deep .input-value-border {
    border: 2rpx solid $border-color;
    border-radius: 16rpx;
    height: 100rpx;
    padding: 0 20rpx;
    
    &:focus {
      border-color: $primary-color;
    }
  }
}

.date-picker-wrapper {
  padding: 0px 10px;
  border: 1px solid #e6e6e6; 
  border-radius: 10px;
  height: 100rpx;
  line-height: 100rpx;
}

/* 新增图标样式 */
.input-icon {
  position: absolute;
  right: 30rpx;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  color: #999;
}
</style>