<template>
	<view class="order-plan-page">
		

		<!-- 状态筛选 -->
		<view class="filter-tabs">
			<view v-for="tab in tabs" :key="tab.value" class="tab-item" :class="{ active: activeTab === tab.value }"
				@click="switchTab(tab.value)">
				{{ tab.label }}
			</view>
		</view>

		<!-- 开单计划列表 -->
		<scroll-view class="plan-list" scroll-y @scrolltolower="loadMore" :style="{ height: scrollHeight + 'px' }">
			<!-- 加载状态 -->
			<view v-if="loading" class="loading-container">
				<uni-load-more status="loading"></uni-load-more>
			</view>

			<!-- 列表内容 -->
			    <view v-for="plan in planList" :key="plan.id" class="plan-item" v-else-if="planList.length > 0">
			      <!-- 头部区域 -->
			      <view class="plan-header">
			        <view class="header-left">
			          <text class="plan-title">{{ plan.artist_name }} - {{ getOrderTypeText(plan.order_type) }}</text>
			          <view class="plan-status" :class="getStatusClass(plan)">
			            {{ getStatusText(plan) }}
			          </view>
			        </view>
			        <!-- 操作按钮移到标题右侧 -->
			        <view class="action-btns">
			          <button class="edit-btn" @click="editPlan(plan)">编辑</button>
			          <button class="delete-btn" @click="confirmDelete(plan.id)">删除</button>
			        </view>
			      </view>
			      <!-- 图片区域 -->
			      <view class="plan-images" v-if="plan.images && plan.images.length">
			        <image v-for="(img, index) in plan.images" :key="index" :src="img" mode="aspectFill"
			                class="plan-image" @click="previewImages(plan.images, index)"></image>
			      </view>
			      <!-- 信息区域 -->
			      <view class="plan-info">
			        <view class="info-row">
			          <uni-icons type="person" size="16" color="#666"></uni-icons>
			          <text class="info-item">名额: {{ plan.max_participants }}人/每人{{ plan.max_submissions_per_user }}单</text>
			        </view>
			        <view class="info-row">
			          <uni-icons type="calendar" size="16" color="#666"></uni-icons>
			          <text class="info-item">
			            {{ formatDate(plan.open_time * 1000) }} 至 {{ formatDate(plan.close_time * 1000) }}
			          </text>
			        </view>
			      </view>
			      <!-- 档位展示 -->
			      <view class="tiers-section"
			            v-if="plan.order_config && plan.order_config.tiers && plan.order_config.tiers.length">
			        <text class="section-title">档位选择</text>
			        <view class="tiers-container">
			          <view v-for="(tier, index) in plan.order_config.tiers" :key="index" class="tier-item">
			            <text class="tier-title">{{ tier.title }}</text>
			            <text class="tier-price">¥{{ tier.price }}</text>
			            <text class="tier-desc">{{ tier.description }}</text>
			          </view>
			        </view>
			      </view>
			    </view>

			<!-- 加载更多 -->
			<view class="load-more" v-if="!loading">
				<text v-if="loadingStatus === 'loading'">加载中...</text>
				<text v-if="loadingStatus === 'noMore' && planList.length !== 0">— 没有更多了 —</text>
			</view>

			<!-- 空状态 -->
			<view class="empty" v-if="planList.length === 0 && !loading">
				<image class="empty-icon" src="/static/images/empty.png"></image>
				<text class="empty-text">暂无开单计划</text>
				<text class="empty-tip">点击加号按钮创建您的第一个开单计划</text>
			</view>
		</scroll-view>
		<button class="add-btn" @click="showAddDialog">
			<uni-icons type="plusempty" size="30" color="#fff"></uni-icons>
		</button>
		<!-- 新增/编辑弹窗 -->
		<uni-popup ref="popup" type="bottom">
			<view class="popup-content">
				<view class="popup-header">
					<text class="popup-title">{{ isEditMode ? '编辑开单计划' : '新增开单计划' }}</text>
					<uni-icons type="closeempty" size="24" color="#999" @click="closeDialog"></uni-icons>
				</view>

				<scroll-view scroll-y class="form-container">
					<view class="form-group">
						<text class="form-label">计划名称</text>
						<input class="form-input" v-model="formData.artist_name" placeholder="请输入计划名称" />
					</view>

					<view class="form-group">
						<text class="form-label">接单类型</text>
						<picker @change="onArtistTypeChange" :value="formData.artist_type" :range="artistTypes"
							range-key="text">
							<view class="picker">
								{{ artistTypes[formData.artist_type - 1]?.text || '请选择接单类型' }}
							</view>
						</picker>
					</view>

					<view class="form-group">
						<text class="form-label">接单方式</text>
						<picker @change="onOrderTypeChange" :value="getOrderTypeIndex(formData.order_type)" :range="orderTypes" range-key="text">
						      <view class="picker">
						        {{ orderTypes.find(t => t.value === formData.order_type)?.text || '请选择接单方式' }}
						      </view>
						    </picker>
					</view>

					<view class="form-group">
						<text class="form-label">最大参与人数</text>
						<uni-number-box v-model="formData.max_participants" :min="1" :max="1000" />
					</view>

					<view class="form-group">
						<text class="form-label">每人最大投递数</text>
						<uni-number-box v-model="formData.max_submissions_per_user" :min="1" :max="10" />
					</view>

					<!-- 开始时间选择器 -->
					<view class="form-group">
						<text class="form-label">开始时间</text>
						<picker mode="date" :value="formData.open_date" @change="onOpenDateChange">
							<view class="picker">
								{{ formData.open_date || '选择日期' }}
							</view>
						</picker>
						<picker mode="time" :value="formData.open_time" @change="onOpenTimeChange">
							<view class="picker">
								{{ formData.open_time || '选择时间' }}
							</view>
						</picker>
					</view>

					<!-- 结束时间选择器 -->
					<view class="form-group">
						<text class="form-label">结束时间</text>
						<picker mode="date" :value="formData.close_date" @change="onCloseDateChange">
							<view class="picker">
								{{ formData.close_date || '选择日期' }}
							</view>
						</picker>
						<picker mode="time" :value="formData.close_time" @change="onCloseTimeChange">
							<view class="picker">
								{{ formData.close_time || '选择时间' }}
							</view>
						</picker>
					</view>

					<view class="form-group">
						<text class="form-label">展示图片</text>
						<view class="image-uploader">


							<!-- 上传状态提示 -->
							<view v-if="uploading" class="uploading-container">
								<uni-load-more status="loading"></uni-load-more>
								<text class="uploading-text">上传中 ({{ uploadedCount }}/{{ totalToUpload }})</text>
							</view>

							<!-- 图片预览 -->
							<view v-for="(img, index) in formData.images" :key="index" class="image-preview">
								<image :src="img" mode="aspectFill" class="preview-image"></image>
								<uni-icons type="close" size="18" color="#fff" class="delete-icon"
									@click="removeImage(index)"></uni-icons>
							</view>

							<!-- 上传按钮 -->
							<view class="upload-btn" @click="chooseAndUploadImages"
								v-if="formData.images.length < 9 && !uploading">
								<uni-icons type="plusempty" size="28" color="#999"></uni-icons>
								<text>添加图片</text>
							</view>
						</view>
					</view>


					<!-- 档位配置 -->
					<view class="form-group">
						<view class="form-label-row">
							<text class="form-label">档位配置</text>
							<view class="header-buttons">
								<picker :range="tierOptions" range-key="label" @change="onTierPickerChange">
									<button class="small-btn">+ 添加档位</button>
								</picker>
							</view>
						</view>
						<view class="tier-config">
							<view v-for="(tier, index) in formData.order_config.tiers" :key="index" class="tier-item">
								<view class="tier-header">
									<!-- <text>可选 {{ index + 1 }}</text> -->
									<uni-icons type="trash" size="18" color="#f56c6c" @click="removeTier(index)"
										v-if="formData.order_config.tiers.length > 1"></uni-icons>
								</view>
								<view class="tier-inputs">
									<input class="tier-input" v-model="tier.title" placeholder="档位名称" />
									<input class="tier-input" v-model="tier.price" placeholder="价格" type="number" />
									<input class="tier-input" v-model="tier.description" placeholder="描述" />
								</view>
							</view>
						</view>
					</view>
					<!-- 加购配置 -->
					<view class="form-group">
						<view class="form-label-row">
							<text class="form-label">加购配置</text>
							<view class="header-buttons">
								<picker :range="addonOptions" range-key="label" @change="onAddonPickerChange">
									<button class="small-btn">+ 添加加购</button>
								</picker>
							</view>
						</view>
						<view class="tier-config">
							<view v-for="(addon, index) in formData.order_config.addons" :key="index" class="tier-item">
								<view class="tier-header">
									<text>加购 {{ index + 1 }}</text>
									<uni-icons type="trash" size="18" color="#f56c6c" @click="removeAddon(index)"
										v-if="formData.order_config.addons.length > 1"></uni-icons>
								</view>
								<view class="tier-inputs">
									<input class="tier-input" v-model="addon.title" placeholder="加购名称" />
									<input class="tier-input" v-model="addon.price" placeholder="价格" type="number" />
									<input class="tier-input" v-model="addon.description" placeholder="描述" />
								</view>
							</view>
						</view>
					</view>



				</scroll-view>

				<button class="submit-btn" @click="submitPlan" :disabled="submitting">
					{{ submitting ? '提交中...' : '提交' }}
				</button>
			</view>
		</uni-popup>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted,
		watch
	} from 'vue'
	import {
		onShow
	} from '@dcloudio/uni-app'
	import {
		chooseImageList,
		getQiniuToken,
		uploadImageToQiniu
	} from '@/common/image.js';
	import {
		websiteUrl
	} from '@/common/config.js';

	// 状态筛选选项
	const tabs = [{
			label: '全部',
			value: 'all'
		},
		{
			label: '进行中',
			value: 'active'
		},
		{
			label: '未开始',
			value: 'upcoming'
		},
		{
			label: '已结束',
			value: 'inactive'
		}
	]
	const activeTab = ref('all')

	// 列表数据
	const planList = ref([])
	const currentPage = ref(1)
	const pageSize = ref(10)
	const total = ref(0)
	const loading = ref(false)
	const submitting = ref(false)
	const loadingStatus = ref('more')
	const scrollHeight = ref(0)

	// 表单相关
	const popup = ref(null)
	const isEditMode = ref(false)
	const currentPlanId = ref(null)

	// 上传相关状态
	const uploading = ref(false)
	const uploadedCount = ref(0)
	const totalToUpload = ref(0)
	const uploadStatusText = ref('')

	// 新增状态变量
	const tierPicker = ref(null)
	const showTierPicker = ref(false)
	const showAddonPicker = ref(false)
	const commonTiers = ref([])
	const commonAddons = ref([])

	const tierOptions = ref([{
		label: "添加空白档位",
		value: "blank"
	}])
	const addonOptions = ref([{
		label: "添加空白加购",
		value: "blank"
	}])

	const formData = ref({
		artist_name: '',
		artist_type: 1, // 1: 妆师, 2: 毛娘
		order_type: 1, // 1: 长期接单, 2: 限时手速, 3: 限时抽选
		max_participants: 10,
		max_submissions_per_user: 1,
		open_date: '',
		open_time: '',
		close_date: '',
		close_time: '',
		images: [],
		order_config: {
			tiers: [],
			// 新增加购配置
			addons: []
		}
	})

	const artistTypes = [{
			value: 1,
			text: '妆师'
		},
		// {
		// 	value: 2,
		// 	text: '毛娘'
		// }
	]

	const orderTypes = [{
			value: 1,
			text: '长期接单'
		},
		{
			value: 2,
			text: '限时手速'
		},
		{
			value: 3,
			text: '限时抽选'
		},
		{
			value: 4,
			text: '限时黑箱卡'
		},
		{
			value: 9,
			text: '关闭投递'
		}
	]

	// 初始化页面
	onMounted(() => {
		calcScrollHeight()
		fetchCommonConfigs() // 加载默认配置
		uni.setNavigationBarTitle({
			title: "接单计划管理"
		})
	})

	onShow(() => {
		fetchPlanList(true)
	})

	// 监听选择器显示状态
	watch(showTierPicker, (newVal) => {
		if (newVal) {
			popup.value.close() // 关闭主弹窗
			tierPicker.value.open() // 打开档位选择器
		} else {
			tierPicker.value.close()
		}
	})

	watch(showAddonPicker, (newVal) => {
		if (newVal) {
			popup.value.close() // 关闭主弹窗
			addonPicker.value.open() // 打开加购选择器
		} else {
			addonPicker.value.close()
		}
	})

	// 获取默认配置
	const fetchCommonConfigs = async () => {
		try {
			// 获取默认档位配置
			const tierRes = await uni.request({
				url: websiteUrl.value + '/brand-manager/order-plane/common-tiers',
				method: 'GET',
				header: {
					'Authorization': getAuthorization()
				}
			})

			if (tierRes.data.status === 'success') {
				tierOptions.value = [{
						label: "添加空白档位",
						value: "blank"
					},
					...tierRes.data.data.map(item => ({
						label: item.title,
						value: item
					}))
				]
			}

			// 获取默认加购配置
			const addonRes = await uni.request({
				url: websiteUrl.value + '/brand-manager/order-plane/common-addons',
				method: 'GET',
				header: {
					'Authorization': getAuthorization()
				}
			})

			if (addonRes.data.status === 'success') {
				addonOptions.value = [{
						label: "添加空白加购",
						value: "blank"
					},
					...addonRes.data.data.map(item => ({
						label: item.title,
						value: item
					}))
				]
			}
		} catch (error) {
			console.error('获取默认配置失败:', error)
		}
	}
	// 档位选择器变化
	const onTierPickerChange = (e) => {
		const index = e.detail.value
		const option = tierOptions.value[index]

		if (option.value === "blank") {
			// 添加空白档位
			formData.value.order_config.tiers.push({
				title: '',
				price: 0,
				description: ''
			})
		} else {
			// 添加默认档位
			formData.value.order_config.tiers.push({
				...option.value,
				price: parseFloat(option.value.price) || 0
			})
		}
	}
	// 加购选择器变化
	const onAddonPickerChange = (e) => {
		const index = e.detail.value
		const option = addonOptions.value[index]

		if (option.value === "blank") {
			// 添加空白加购
			formData.value.order_config.addons.push({
				title: '',
				price: 0,
				description: ''
			})
		} else {
			// 添加默认加购
			formData.value.order_config.addons.push({
				...option.value,
				price: parseFloat(option.value.price) || 0
			})
		}
	}

	// 添加档位选项
	const addTierOption = (option) => {
		if (option === 'blank') {
			// 添加空白档位
			formData.value.order_config.tiers.push({
				title: '',
				price: 0,
				description: ''
			})
		} else {
			// 添加默认档位
			formData.value.order_config.tiers.push({
				...option,
				price: parseFloat(option.price) || 0
			})
		}
		showTierPicker.value = false
		popup.value.open() // 重新打开主弹窗
	}

	// 添加加购选项
	const addAddonOption = (option) => {
		if (option === 'blank') {
			// 添加空白加购
			formData.value.order_config.addons.push({
				title: '',
				price: 0,
				description: ''
			})
		} else {
			// 添加默认加购
			formData.value.order_config.addons.push({
				...option,
				price: parseFloat(option.price) || 0
			})
		}
		showAddonPicker.value = false
		popup.value.open() // 重新打开主弹窗
	}

	// 计算滚动区域高度
	const calcScrollHeight = () => {
		const systemInfo = uni.getSystemInfoSync()
		scrollHeight.value = systemInfo.windowHeight - 180 // 减去头部和筛选栏高度
	}

	// 获取Authorization
	const getAuthorization = () => {
		const token = uni.getStorageSync('token') || ''
		return token
	}
	// 加载默认档位配置
	const loadCommonTiers = async () => {
		try {
			const res = await uni.request({
				url: websiteUrl.value + '/brand-manager/order-plane/common-tiers',
				method: 'GET',
				header: {
					'Authorization': getAuthorization()
				}
			})

			if (res.data.status === 'success') {
				const commonTiers = res.data.data || []
				// 追加到现有配置
				formData.value.order_config.tiers = [
					...formData.value.order_config.tiers,
					...commonTiers
				]
				uni.showToast({
					title: '默认档位已添加',
					icon: 'success'
				})
			} else {
				uni.showToast({
					title: res.data.message || '获取默认档位失败',
					icon: 'none'
				})
			}
		} catch (error) {
			console.error('获取默认档位失败:', error)
			uni.showToast({
				title: '获取默认档位失败',
				icon: 'none'
			})
		}
	}

	// 加载默认加购配置
	const loadCommonAddons = async () => {
		try {
			const res = await uni.request({
				url: websiteUrl.value + '/brand-manager/order-plane/common-addons',
				method: 'GET',
				header: {
					'Authorization': getAuthorization()
				}
			})

			if (res.data.status === 'success') {
				const commonAddons = res.data.data || []
				// 追加到现有配置
				formData.value.order_config.addons = [
					...formData.value.order_config.addons,
					...commonAddons
				]
				uni.showToast({
					title: '默认加购已添加',
					icon: 'success'
				})
			} else {
				uni.showToast({
					title: res.data.message || '获取默认加购失败',
					icon: 'none'
				})
			}
		} catch (error) {
			console.error('获取默认加购失败:', error)
			uni.showToast({
				title: '获取默认加购失败',
				icon: 'none'
			})
		}
	}
	// 选择并上传图片
	const chooseAndUploadImages = async () => {
		try {
			// 计算还能上传的数量
			const remaining = 9 - formData.value.images.length
			if (remaining <= 0) return

			// 选择图片
			const tempFilePaths = await chooseImageList(remaining)
			if (!tempFilePaths || tempFilePaths.length === 0) return

			// 获取七牛云凭证
			const qiniuData = await getQiniuToken()
			const token = qiniuData.token
			const basePath = qiniuData.path // 使用返回的path作为基础路径

			// 设置上传状态
			uploading.value = true
			totalToUpload.value = tempFilePaths.length
			uploadedCount.value = 0

			// 依次上传每张图片
			const uploadedUrls = []
			for (let i = 0; i < tempFilePaths.length; i++) {
				try {
					const filePath = tempFilePaths[i]

					// 更新上传状态
					uploadStatusText.value = `上传中 (${i+1}/${tempFilePaths.length})`
					uploadedCount.value = i + 1

					// 使用七牛云返回的path作为文件名基础


					// 上传到七牛云
					const result = await uploadImageToQiniu(
						filePath,
						token,
						basePath
					)

					if (result && result.imageUrl) {
						uploadedUrls.push(result.imageUrl)
					}
				} catch (uploadError) {
					console.error(`第 ${i+1} 张图片上传失败:`, uploadError)
					uni.showToast({
						title: `第 ${i+1} 张图片上传失败`,
						icon: 'none'
					})
				}
			}

			// 更新表单中的图片列表
			formData.value.images = [...formData.value.images, ...uploadedUrls]

			// 显示上传结果
			if (uploadedUrls.length > 0) {
				uni.showToast({
					title: `成功上传 ${uploadedUrls.length} 张图片`,
					icon: 'success'
				})
			}
		} catch (error) {
			console.error('图片选择或上传失败:', error)
			uni.showToast({
				title: '图片上传失败: ' + (error.message || '未知错误'),
				icon: 'none'
			})
		} finally {
			uploading.value = false
			uploadedCount.value = 0
			totalToUpload.value = 0
		}
	}


	// 获取开单计划列表
	const fetchPlanList = async (reset = false) => {
		if (loading.value) return

		if (reset) {
			currentPage.value = 1
			planList.value = []
			loadingStatus.value = 'more'
		}

		loading.value = true
		loadingStatus.value = 'loading'

		try {
			const res = await uni.request({
				url: websiteUrl.value + '/brand-manager/order-plan/list',
				method: 'GET',
				data: {
					page: currentPage.value,
					page_size: pageSize.value,
					status: activeTab.value
				},
				header: {
					'Authorization': getAuthorization()
				}
			})

			if (res.data.status === 'success') {
				const data = res.data.data
				const newList = data.list || []
				total.value = data.total

				// 处理图片数据
				const processedList = newList.map(plan => {
				  // 处理图片数据：将逗号分隔的字符串转为数组
				  const images = typeof plan.images === 'string' 
				    ? plan.images.split(',').filter(url => url.trim() !== '') 
				    : plan.images || [];
				  
				  // 处理 order_config 数据
				  let orderConfig = {};
				  try {
				    orderConfig = plan.order_config ? JSON.parse(plan.order_config) : {};
				  } catch (e) {
				    console.error('解析 order_config 失败:', e);
				  }
				  
				  return {
				    ...plan,
				    images,
				    order_config: orderConfig
				  }
				})

				if (reset) {
					planList.value = processedList
				} else {
					planList.value = [...planList.value, ...processedList]
				}

				if (planList.value.length >= total.value) {
					loadingStatus.value = 'noMore'
				} else {
					loadingStatus.value = 'more'
					currentPage.value++
				}
			} else {
				uni.showToast({
					title: res.data.message || '获取列表失败',
					icon: 'none'
				})
			}
		} catch (error) {
			uni.showToast({
				title: '网络错误',
				icon: 'none'
			})
		} finally {
			loading.value = false
		}
	}

	// 加载更多
	const loadMore = () => {
		if (loadingStatus.value === 'noMore') return
		fetchPlanList()
	}

	// 切换状态筛选
	const switchTab = (tab) => {
		activeTab.value = tab
		fetchPlanList(true)
	}

	// 显示新增弹窗
	const showAddDialog = () => {
		resetForm()
		isEditMode.value = false
		popup.value.open()
	}

	// 编辑开单计划
	const editPlan = (plan) => {
		resetForm()
		isEditMode.value = true
		currentPlanId.value = plan.id

		// 填充表单数据
		formData.value = {
			artist_name: plan.artist_name,
			artist_type: plan.artist_type,
			order_type: plan.order_type,
			max_participants: plan.max_participants,
			max_submissions_per_user: plan.max_submissions_per_user,
			images: [...(plan.images || [])],
			order_config: {
				tiers: [...(plan.order_config?.tiers || [])],
				addons: [...(plan.order_config?.addons || [])] 
			}
		}

		// 设置时间
		if (plan.open_time) {
			formData.value.open_date = formatDate(plan.open_time * 1000, 'yyyy-MM-dd')
			formData.value.open_time = formatDate(plan.open_time * 1000, 'HH:mm')
		}

		if (plan.close_time) {
			formData.value.close_date = formatDate(plan.close_time * 1000, 'yyyy-MM-dd')
			formData.value.close_time = formatDate(plan.close_time * 1000, 'HH:mm')
		}

		popup.value.open()
	}

	// 重置表单
	const resetForm = () => {
		formData.value = {
			artist_name: '',
			artist_type: 1,
			order_type: 1,
			max_participants: 10,
			max_submissions_per_user: 1,
			open_date: '',
			open_time: '',
			close_date: '',
			close_time: '',
			images: [],
			order_config: {
				tiers: [],
				// 确保addons有初始值
				addons: []
			}
		}
		currentPlanId.value = null
		submitting.value = false
	}

	// 时间选择器事件处理
	const onOpenDateChange = (e) => {
		formData.value.open_date = e.detail.value
	}

	const onOpenTimeChange = (e) => {
		formData.value.open_time = e.detail.value
	}

	const onCloseDateChange = (e) => {
		formData.value.close_date = e.detail.value
	}

	const onCloseTimeChange = (e) => {
		formData.value.close_time = e.detail.value
	}

	// 提交表单
	const submitPlan = async () => {
		if (!formData.value.artist_name) {
			uni.showToast({
				title: '请填写计划名称',
				icon: 'none'
			})
			return
		}

		if (!formData.value.open_date || !formData.value.open_time ||
			!formData.value.close_date || !formData.value.close_time) {
			uni.showToast({
				title: '请选择开始和结束时间',
				icon: 'none'
			})
			return
		}

		// 处理时间格式
		const openTime = new Date(`${formData.value.open_date} ${formData.value.open_time}`).getTime() / 1000
		const closeTime = new Date(`${formData.value.close_date} ${formData.value.close_time}`).getTime() / 1000

		if (closeTime <= openTime) {
			uni.showToast({
				title: '结束时间必须晚于开始时间',
				icon: 'none'
			})
			return
		}

		// 准备请求参数
		const params = {
			artist_name: formData.value.artist_name,
			artist_type: formData.value.artist_type,
			order_type: formData.value.order_type,
			max_participants: formData.value.max_participants,
			max_submissions_per_user: formData.value.max_submissions_per_user,
			open_time: openTime,
			close_time: closeTime,
			images: formData.value.images,
			order_config: {
				// 确保价格是浮点数
				tiers: formData.value.order_config.tiers.map(tier => ({
					...tier,
					price: parseFloat(tier.price) || 0
				})),
				// 新增加购配置，确保价格是浮点数
				addons: formData.value.order_config.addons.map(addon => ({
					...addon,
					price: parseFloat(addon.price) || 0
				}))
			}
		}

		if (isEditMode.value) {
			params.id = currentPlanId.value
		}

		submitting.value = true

		try {
			const url = websiteUrl.value + (isEditMode.value ?
				'/brand-manager/order-plan/update' :
				'/brand-manager/order-plan/add')

			const method = 'POST'

			const res = await uni.request({
				url,
				method,
				data: params,
				header: {
					'Authorization': getAuthorization(),
					'Content-Type': 'application/json'
				}
			})

			if (res.data.status === 'success') {
				uni.showToast({
					title: isEditMode.value ? '更新成功' : '添加成功',
					icon: 'success'
				})
				popup.value.close()
				fetchPlanList(true)
			} else {
				uni.showToast({
					title: res.data.message || (isEditMode.value ? '更新失败' : '添加失败'),
					icon: 'none'
				})
			}
		} catch (error) {
			console.error('提交失败:', error)
			uni.showToast({
				title: '请求失败，请稍后重试',
				icon: 'none'
			})
		} finally {
			submitting.value = false
		}
	}

	// 关闭弹窗
	const closeDialog = () => {
		popup.value.close()
	}

	// 确认删除
	const confirmDelete = (id) => {
		uni.showModal({
			title: '提示',
			content: '确定要删除该开单计划吗？',
			success: (res) => {
				if (res.confirm) {
					deletePlan(id)
				}
			}
		})
	}

	// 删除开单计划
	const deletePlan = async (id) => {
		try {
			const res = await uni.request({
				url: websiteUrl.value + '/brand-manager/order-plan/delete?id=' + id,
				method: 'POST',
				header: {
					'Authorization': getAuthorization(),
					'Content-Type': 'application/json'
				}
			})

			if (res.data.status === 'success') {
				uni.showToast({
					title: '删除成功',
					icon: 'success'
				})
				fetchPlanList(true)
			} else {
				uni.showToast({
					title: res.data.message || '删除失败',
					icon: 'none'
				})
			}
		} catch (error) {
			console.error('删除失败:', error)
			uni.showToast({
				title: '网络错误',
				icon: 'none'
			})
		}
	}

	// 选择图片
	const chooseImage = () => {
		uni.chooseImage({
			count: 9 - formData.value.images.length,
			success: (res) => {
				formData.value.images = [...formData.value.images, ...res.tempFilePaths]
			}
		})
	}

	// 删除图片
	const removeImage = (index) => {
		formData.value.images.splice(index, 1)
	}

	// 添加档位
	const addTier = () => {
		formData.value.order_config.tiers.push({
			title: '',
			price: 0,
			description: ''
		})
	}

	// 删除档位
	const removeTier = (index) => {
		if (formData.value.order_config.tiers.length > 1) {
			formData.value.order_config.tiers.splice(index, 1)
		}
	}
	// 添加加购
	const addAddon = () => {
		formData.value.order_config.addons.push({
			title: '',
			price: 0, // 初始化为数字类型
			description: ''
		})
	}

	// 删除加购
	const removeAddon = (index) => {
		if (formData.value.order_config.addons.length > 1) {
			formData.value.order_config.addons.splice(index, 1)
		}
	}
	// 接单类型选择
	const onArtistTypeChange = (e) => {
		formData.value.artist_type = parseInt(e.detail.value) + 1
	}

	// 订单类型选择
	const onOrderTypeChange = (e) => {
	  // 直接使用索引从orderTypes数组中获取对应的值
	  const selectedIndex = parseInt(e.detail.value);
	  formData.value.order_type = orderTypes[selectedIndex].value;
	}

	// 添加获取订单类型索引的方法
	const getOrderTypeIndex = (type) => {
	  return orderTypes.findIndex(item => item.value === type);
	}

	// 预览图片
	const previewImages = (images, current) => {
		uni.previewImage({
			current,
			urls: images,
			indicator: 'number'
		})
	}

	// 格式化日期
	const formatDate = (timestamp, format = 'yyyy-MM-dd HH:mm') => {
		if (!timestamp) return ''
		const date = new Date(timestamp)

		const year = date.getFullYear()
		const month = (date.getMonth() + 1).toString().padStart(2, '0')
		const day = date.getDate().toString().padStart(2, '0')
		const hours = date.getHours().toString().padStart(2, '0')
		const minutes = date.getMinutes().toString().padStart(2, '0')

		if (format === 'yyyy-MM-dd') {
			return `${year}-${month}-${day}`
		}

		if (format === 'HH:mm') {
			return `${hours}:${minutes}`
		}

		return `${year}-${month}-${day} ${hours}:${minutes}`
	}

	// 获取订单类型文本
	const getOrderTypeText = (type) => {
		const map = {
			1: '长期接单',
			2: '限时手速',
			3: '限时抽选',
			4: '限时黑箱卡',
			9: '关闭投递'
		}
		return map[type] || '未知类型'
	}

	// 获取状态文本
	const getStatusText = (plan) => {
		const now = Math.floor(Date.now() / 1000)
		if (now < plan.open_time) return '未开始'
		if (now > plan.close_time) return '已结束'
		return '进行中'
	}

	// 获取状态样式类
	const getStatusClass = (plan) => {
		const now = Math.floor(Date.now() / 1000)
		if (now < plan.open_time) return 'upcoming'
		if (now > plan.close_time) return 'inactive'
		return 'active'
	}
</script>

<style lang="less" scoped>
	.order-plan-page {
		padding: 20rpx;
		background-color: #f8f8f8;
		min-height: 100vh;
		box-sizing: border-box;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
		padding: 20rpx 0;

		.title {
			font-size: 36rpx;
			font-weight: bold;
			color: #333;
		}

		.add-btn {
			background-color: #171e22;
			color: white;
			border-radius: 40rpx;
			font-size: 28rpx;
			padding: 8rpx 24rpx;
			line-height: 1.5;

			&::after {
				border: none;
			}
		}
	}


	/* 新增上传状态样式 */
	.uploading-container {
		width: 100%;
		padding: 20rpx 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		.uploading-text {
			margin-top: 10rpx;
			color: #999;
			font-size: 26rpx;
		}
	}

	.filter-tabs {
		display: flex;
		background: white;
		border-radius: 12rpx;
		padding: 10rpx 0;
		margin-bottom: 20rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

		.tab-item {
			flex: 1;
			text-align: center;
			padding: 20rpx 0;
			font-size: 28rpx;
			color: #666;
			position: relative;

			&.active {
				color: #171e22;
				font-weight: 600;

				&::after {
					content: '';
					position: absolute;
					bottom: 0;
					left: 50%;
					transform: translateX(-50%);
					width: 80rpx;
					height: 6rpx;
					background-color: #171e22;
					border-radius: 4rpx;
				}
			}
		}
	}

	.plan-list {
		background-color: #fff;
		border-radius: 16rpx;

		.loading-container {
			padding: 40rpx 0;
			text-align: center;
		}

		.plan-item {
		  padding: 30rpx;
		  border-radius: 16rpx;
		  background-color: #fff;
		  margin-bottom: 20rpx;
		  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);

			&:last-child {
				border-bottom: none;
			}
		}

		

/* 图片区域调整 */
.plan-images {
  display: flex;
  overflow-x: auto;
  gap: 16rpx;
  margin-bottom: 24rpx;
  padding-bottom: 8rpx;
  
  .plan-image {
    width: 180rpx;
    height: 180rpx;
    border-radius: 12rpx;
    flex-shrink: 0;
    background-color: #f5f5f5;
  }
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
  padding-bottom: 20rpx;
  
  .header-left {
    flex: 1;
  }
  
  .plan-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 10rpx;
    display: block;
  }
  
  .plan-status {
    display: inline-block;
    font-size: 24rpx;
    padding: 6rpx 16rpx;
    border-radius: 20rpx;
    font-weight: 500;
    
    &.active {
      background-color: #e8f5ff;
      color: #1890ff;
    }
    
    &.inactive {
      background-color: #f5f5f5;
      color: #999;
    }
    
    &.upcoming {
      background-color: #fff8e8;
      color: #ff9c00;
    }
  }
}
.plan-info {
  margin-bottom: 24rpx;
  
  .info-row {
    display: flex;
    align-items: center;
    gap: 10rpx;
    margin-bottom: 12rpx;
    
    .info-item {
      font-size: 26rpx;
      color: #666;
    }
  }
}

/* 档位区域调整 */
.tiers-section {
  margin-bottom: 10rpx;
  
  .section-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 16rpx;
    display: block;
  }
  
  .tiers-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16rpx;
  }
  
  .tier-item {
    background-color: #f9f9f9;
    border-radius: 12rpx;
    padding: 20rpx;
    
    .tier-title {
      font-size: 26rpx;
      font-weight: 500;
      color: #333;
      display: block;
    }
    
    .tier-price {
      font-size: 28rpx;
      font-weight: bold;
      color: #ff4d6a;
      display: block;
      margin: 8rpx 0;
    }
    
    .tier-desc {
      font-size: 24rpx;
      color: #999;
      display: block;
    }
  }
}


		.action-btns {
		  display: flex;
		  gap: 12rpx;
		  
		  .edit-btn, .delete-btn {
		    height: 50rpx;
		    line-height: 50rpx;
		    font-size: 24rpx;
		    padding: 0 20rpx;
		    border-radius: 25rpx;
		    margin: 0;
		    
		    &::after {
		      border: none;
		    }
		  }
		  
		  .edit-btn {
		    background-color: #e8f5ff;
		    color: #1890ff;
		    
		    &:active {
		      background-color: #d1e9ff;
		    }
		  }
		  
		  .delete-btn {
		    background-color: #ffeeee;
		    color: #ff4d6a;
		    
		    &:active {
		      background-color: #ffe0e0;
		    }
		  }
		}

		.load-more {
			text-align: center;
			padding: 30rpx 0;
			color: #999;
			font-size: 26rpx;
		}

		.empty {
			display: flex;
			flex-direction: column;
			align-items: center;
			padding: 80rpx 0;

			.empty-icon {
				width: 200rpx;
				height: 200rpx;
				opacity: 0.6;
				margin-bottom: 30rpx;
			}

			.empty-text {
				color: #999;
				font-size: 30rpx;
				margin-bottom: 16rpx;
			}

			.empty-tip {
				color: #aaa;
				font-size: 26rpx;
			}
		}
	}

	.popup-content {
		background-color: #fff;
		border-radius: 30rpx 30rpx 0 0;
		padding: 40rpx;
		max-height: 80vh;

		.popup-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 30rpx;

			.popup-title {
				font-size: 36rpx;
				font-weight: bold;
				color: #333;
			}
		}

		.form-container {
			max-height: 60vh;

			.form-group {
				margin-bottom: 30rpx;

				.form-label {
					display: block;
					font-size: 28rpx;
					color: #333;
					margin-bottom: 16rpx;
					font-weight: 500;
				}

				.form-input {
					background-color: #f8f8f8;
					border-radius: 12rpx;
					padding: 20rpx;
					font-size: 28rpx;
				}

				.picker {
					background-color: #f8f8f8;
					border-radius: 12rpx;
					padding: 20rpx;
					font-size: 28rpx;
					color: #333;
					margin-bottom: 10rpx;

					&:last-child {
						margin-bottom: 0;
					}
				}
			}

			.image-uploader {
				display: flex;
				flex-wrap: wrap;
				gap: 20rpx;

				.image-preview {
					width: 150rpx;
					height: 150rpx;
					border-radius: 12rpx;
					overflow: hidden;
					position: relative;

					.preview-image {
						width: 100%;
						height: 100%;
					}

					.delete-icon {
						position: absolute;
						top: 6rpx;
						right: 6rpx;
						background: rgba(0, 0, 0, 0.5);
						border-radius: 50%;
						padding: 4rpx;
					}
				}

				.upload-btn {
					width: 150rpx;
					height: 150rpx;
					border: 2rpx dashed #ddd;
					border-radius: 12rpx;
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: center;
					color: #999;
					font-size: 24rpx;
				}
			}

			.tier-config {
				.tier-item {
					background-color: #f8f8f8;
					border-radius: 12rpx;
					padding: 20rpx;
					margin-bottom: 20rpx;

					.tier-header {
						display: flex;
						justify-content: space-between;
						align-items: center;
						margin-bottom: 16rpx;
						font-size: 26rpx;
						color: #333;
						font-weight: 500;
					}

					.tier-inputs {
						display: flex;
						flex-direction: column;
						gap: 16rpx;

						.tier-input {
							background-color: #fff;
							border-radius: 8rpx;
							padding: 16rpx;
							font-size: 26rpx;
						}
					}
				}

				.add-tier {
					background-color: #e8f5ff;
					color: #1890ff;
					border-radius: 40rpx;
					padding: 12rpx 0;
					font-size: 28rpx;
					text-align: center;
					margin-top: 10rpx;

					&::after {
						border: none;
					}
				}
			}
		}

		.submit-btn {
			border-radius: 40rpx;
			font-size: 32rpx;
			padding: 20rpx 0;
			margin-top: 30rpx;
			background: linear-gradient(135deg, #8fecff, #c1ddff);
			color: #2c3e50;
			box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.2);
			
			
			&:disabled {
				background-color: #cccccc;
				opacity: 0.7;
			}

			&::after {
				border: none;
			}
			
			
		}
	}

	/* 新增配置按钮样式 */
	.config-buttons {
		display: flex;
		gap: 10rpx;
		margin-top: 10rpx;

		.add-tier {
			flex: 1;
			background-color: #e8f5ff;
			color: #1890ff;
			border-radius: 40rpx;
			padding: 12rpx 0;
			font-size: 24rpx;
			text-align: center;
			margin-top: 10rpx;
			line-height: 1.5;

			&::after {
				border: none;
			}
		}
	}

	/* 新增标题行样式 */
	.form-label-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16rpx;

		.form-label {
			font-size: 28rpx;
			color: #333;
			font-weight: 500;
		}

		.header-buttons {
			display: flex;
			gap: 10rpx;
		}
	}

	/* 小按钮样式 */
	.small-btn {
		background-color: #171e22;
		color: white;
		border-radius: 30rpx;
		font-size: 24rpx;
		padding: 6rpx 16rpx;
		line-height: 1.4;
		margin: 0;

		&::after {
			border: none;
		}
	}

	/* 调整档位项样式 */
	.tier-item {
		margin-bottom: 20rpx;
		background-color: #f8f8f8;
		border-radius: 12rpx;
		padding: 20rpx;

		.tier-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 16rpx;
			font-size: 26rpx;
			color: #333;
			font-weight: 500;
		}

		.tier-inputs {
			display: flex;
			flex-direction: column;
			gap: 16rpx;

			.tier-input {
				background-color: #fff;
				border-radius: 8rpx;
				padding: 16rpx;
				font-size: 26rpx;
			}
		}
	}

	/* 移除底部按钮区域 */
	.config-buttons {
		display: none;
	}
	
	.add-btn {
		position: fixed;
		right: 40rpx;
		bottom: 120rpx;
		width: 90rpx;
		height: 90rpx;
		background: linear-gradient(135deg, #a6e9f7, #1ed1e1);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 6rpx 20rpx rgba(30, 209, 225, 0.4);
		z-index: 99;
		transition: all 0.3s ease;
	
		&:active {
			transform: scale(0.95);
			box-shadow: 0 4rpx 12rpx rgba(30, 209, 225, 0.3);
		}
	}
</style>