<template>
	<view class="tab_body_1st">
		<!-- 分类选择器区域 -->
		<view class="type-header">
			<view class="selector-container">
				<picker class="type-picker" mode="selector" :value="selectedType" :range="typeOptions"
					@change="updateSelectedType">
					<view class="selector-content">
						<text class="selector-label">分类:</text>
						<text class="selector-value">{{ typeOptions[selectedType] }}</text>
						<uni-icons type="arrowdown" size="14" color="#747EE5" class="selector-icon"></uni-icons>
					</view>
				</picker>
				<text class="manage-btn" @tap="typeModalVisible = true">
					<uni-icons type="gear" size="16" color="#fff"></uni-icons>
					<text>管理分类</text>
				</text>
			</view>
		</view>

		<!-- 合计金额 -->
		<view class="summary-container">
			<view class="summary-content">
				<uni-icons type="money" size="18" color="#74c9e5"></uni-icons>
				<text class="total-text">当前分类合计：
					<text v-if="isPriceVisible">¥{{ totalPrice }}</text>
					<text v-else>******</text>
				</text>
				<!-- 新增：切换显示/隐藏的小眼睛按钮 -->
				<uni-icons :type="isPriceVisible ? 'eye' : 'eye-slash'" size="18" color="#74c9e5" class="toggle-eye"
					@tap="isPriceVisible = !isPriceVisible"></uni-icons>
				<text style="position: absolute;right: 30px;">长按排序</text>
			</view>
		</view>

		<!-- 内容区域 -->
		<view class="content" v-if="accountBookData.account_books?.length > 0">
			<shmily-drag-image v-model="accountBookData.account_books" border-radius="20"
				@sort-change="handleSortChange"></shmily-drag-image>
		</view>

		<!-- 空状态 -->
		<view class="empty-state" v-else>
			<image class="empty-icon" src="/static/empty.jpg"></image>
			<text class="empty-text">空空如也～</text>
			<text class="empty-tip">点击下方按钮添加第一个物品吧！</text>
		</view>
	</view>


	<!-- 分类管理弹窗 -->
	<common-modal :visible="typeModalVisible" @update:visible="val => typeModalVisible = val" top="10%">
		<view class="type-modal">
			<!-- 			<view class="modal-header">
				<text class="modal-title">分类管理</text>
				<uni-icons type="closeempty" size="24" color="#999" @tap="typeModalVisible = false"></uni-icons>
			</view> -->

			<scroll-view scroll-y style="height: 600rpx;">
				<view class="type-list">
					<view v-for="(type, index) in customTypes" :key="type.id" class="type-item">
						<!-- <view class="type-icon">
							<uni-icons type="folder-add" size="20" color="#3db5c7"></uni-icons>
						</view> -->

						<!-- 名称 / 编辑输入 -->
						<input v-if="editId === type.id" v-model.trim="editName" class="type-input" maxlength="10"
							confirm-type="done" @confirm="saveEdit(type)" @blur="onEditBlur(type)"
							placeholder="输入分类名称" />
						<text v-else class="type-name">{{ type.name }}</text>

						<!-- 排序按钮（非拖拽） -->
						<view class="sort-actions" v-if="editId !== type.id">
							<!-- <button class="mini-btn" size="mini" :disabled="index===0 || savingSort"
								@tap="moveTop(index)">置顶</button> -->
							<button class="mini-btn" size="mini" :disabled="index===0 || savingSort"
								@tap="moveUp(index)">上移</button>
							<button class="mini-btn" size="mini" :disabled="index===customTypes.length-1 || savingSort"
								@tap="moveDown(index)">下移</button>
							<!-- <button class="mini-btn" size="mini" :disabled="index===customTypes.length-1 || savingSort"
								@tap="moveBottom(index)">置底</button> -->
						</view>

						<!-- 右侧操作：编辑 / 删除 或 保存 / 取消 -->
						<view class="type-actions">
							<template v-if="editId === type.id">
								<button class="act-btn primary" size="mini" :loading="savingOne" :disabled="savingOne"
									@tap="saveEdit(type)">保存</button>
								<button class="act-btn" size="mini" :disabled="savingOne" @tap="cancelEdit">取消</button>
							</template>
							<template v-else>
								<uni-icons type="compose" size="20" color="#74c9e5" @tap="startEdit(type)"></uni-icons>
								<uni-icons type="trash" size="20" color="#ff6666"
									@tap="deleteType(type.id)"></uni-icons>
							</template>
						</view>
					</view>

					<view v-if="customTypes.length === 0" class="empty-types">
						<image class="empty-folder" src="/static/folder-empty.png"></image>
						<text class="empty-text">暂无自定义分类</text>
						<text class="empty-tip">请在下方添加新分类</text>
					</view>
				</view>
				<view style="height: 120rpx;"></view>
			</scroll-view>

			<view class="add-type-container">
				<view class="add-type-form">
					<input v-model.trim="newTypeName" placeholder="输入新分类名称（≤10字）" class="type-input" maxlength="10" />
					<button class="add-btn" @tap="addNewType">
						<uni-icons type="plus" size="16" color="#fff"></uni-icons>
						<text>添加分类</text>
					</button>
				</view>

				<button class="add-btn" style="margin-top:10rpx;" :loading="savingSort"
					:disabled="savingSort || !hasSortChanged" @tap="saveSort" v-if="hasSortChanged">
					<uni-icons type="save" size="16" color="#fff"></uni-icons>
					<text>保存排序</text>
				</button>
				<text class="hint-text">提示：用「上移/下移/置顶/置底」调整顺序，然后点“保存排序”。</text>
			</view>
		</view>
	</common-modal>
</template>
<script setup>
	import {
		ref,
		computed,
		onMounted,
		watch
	} from 'vue'
	import {
		websiteUrl
	} from '../../common/config.js'
	import {
		onShow
	} from '@dcloudio/uni-app'

	const props = defineProps({
		accountBookData: Object
	})
	const emits = defineEmits(['go2editor', 'update-type', 'init-request', 'update:accountBookData'])

	// ===== 显示/隐藏金额（保留你原来的逻辑） =====
	const isPriceVisible = ref(true)
	const PRICE_VISIBLE_KEY = 'accountBookPriceVisible'
	// 上次勾选的分类
	const SELECTED_TYPE_KEY = 'accountBookSelectedType'

	// ===== 分类管理状态 =====
	const typeModalVisible = ref(false)
	const newTypeName = ref('')
	const customTypes = ref([])

	// 选中项用“名称”来记忆，避免重排后索引错乱
	const selectedType = ref(0)
	const selectedTypeName = ref('全部')

	// 用于编辑单项
	const editId = ref(null)
	const editName = ref('')
	const savingOne = ref(false)

	// 排序保存防抖
	const savingSort = ref(false)
	// 记录服务端下发时的原始顺序，判断是否变更
	const originalOrder = ref([])

	const defaultTypes = ['全部']
	const typeOptions = computed(() => [...defaultTypes, ...customTypes.value.map(t => t.name)])

	// 同步 selector 的 index
	watch([customTypes, selectedTypeName], () => {
		const list = typeOptions.value
		const want = selectedTypeName.value || '全部'
		const idx = list.findIndex(n => n === want)
		selectedType.value = idx >= 0 ? idx : 0
	})

	// 合计金额（保留你原来的逻辑）
	const totalPrice = computed(() => {
		if (!props.accountBookData.account_books) return 0
		return props.accountBookData.account_books
			.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0)
			.toFixed(2)
	})

	// ===== 获取分类 =====
	const getAccountTypes = async () => {
		const token = uni.getStorageSync('token')
		try {
			const res = await uni.request({
				url: websiteUrl.value + '/with-state/account-types',
				method: 'GET',
				header: {
					'Authorization': token
				}
			})
			customTypes.value = res.data.data || []
			originalOrder.value = customTypes.value.map(t => t.id)
		} catch (err) {
			console.error('获取分类失败:', err)
		}
	}
	// 保存选中的分类到本地存储
	const saveSelectedType = () => {
		uni.setStorageSync(SELECTED_TYPE_KEY, selectedTypeName.value)
	}

	// 从本地存储加载选中的分类
	const loadSelectedType = () => {
		const savedType = uni.getStorageSync(SELECTED_TYPE_KEY)
		if (savedType && savedType !== '') {
			selectedTypeName.value = savedType
		} else {
			selectedTypeName.value = '全部'
		}
	}
	// ===== 新增 =====
	const addNewType = async () => {
		if (!newTypeName.value) {
			uni.showToast({
				title: '请输入分类名称',
				icon: 'none'
			})
			return
		}
		if (newTypeName.value.length > 10) {
			uni.showToast({
				title: '不能超过10个字符',
				icon: 'none'
			})
			return
		}
		const token = uni.getStorageSync('token')
		try {
			await uni.request({
				url: websiteUrl.value + '/with-state/add-account-type',
				method: 'POST',
				header: {
					'Authorization': token
				},
				data: {
					name: newTypeName.value
				}
			})
			newTypeName.value = ''
			await getAccountTypes()
			uni.showToast({
				title: '添加成功'
			})
		} catch (err) {
			uni.showToast({
				title: '添加失败',
				icon: 'none'
			})
		}
	}
	// 处理排序事件
	const handleSortChange = (sortedIds) => {
		const token = uni.getStorageSync('token');
		uni.request({
			url: websiteUrl.value + '/with-state/sort-account-book',
			method: 'POST',
			header: {
				'Authorization': token,
				'Content-Type': 'application/json'
			},
			data: {
				sorted_ids: sortedIds
			},
			success: (res) => {

			},
			fail: (err) => {

				console.error('排序失败:', err);
			}
		});
	}

	// ===== 编辑单项 =====
	const startEdit = (type) => {
		editId.value = type.id
		editName.value = type.name
	}
	const cancelEdit = () => {
		editId.value = null
		editName.value = ''
	}
	const onEditBlur = (type) => {
		// 失焦即保存，避免误触；如不需要可删
		if (editId.value === type.id) saveEdit(type)
	}
	const saveEdit = async (type) => {
		if (savingOne.value) return
		const name = (editName.value || '').trim()
		if (!name) {
			uni.showToast({
				title: '请输入分类名称',
				icon: 'none'
			})
			return
		}
		if (name.length > 10) {
			uni.showToast({
				title: '不能超过10个字符',
				icon: 'none'
			})
			return
		}
		savingOne.value = true
		const token = uni.getStorageSync('token')
		const oldName = type.name
		try {
			const res = await uni.request({
				url: websiteUrl.value + '/with-state/update-account-book-type',
				method: 'POST',
				header: {
					'Authorization': token,
					'Content-Type': 'application/json'
				},
				data: {
					id: type.id,
					name
				}
			})
			// 兼容后端返回结构
			if (res.data?.status && res.data.status !== 'success') {
				throw new Error(res.data?.msg || '更新失败')
			}
			// 如果当前筛选的是这个分类名，改名后同步
			if (selectedTypeName.value === oldName) {
				selectedTypeName.value = name
				emits('update-type', name)
			}
			await getAccountTypes()
			uni.showToast({
				title: '修改成功'
			})
		} catch (err) {
			uni.showToast({
				title: err?.message || '修改失败',
				icon: 'none'
			})
		} finally {
			savingOne.value = false
			cancelEdit()
		}
	}

	// ===== 无拖拽排序：上移/下移/置顶/置底 =====
	const move = (arr, from, to) => {
		if (from === to) return
		const item = arr.splice(from, 1)[0]
		arr.splice(to, 0, item)
	}
	const moveUp = (i) => {
		if (i > 0) move(customTypes.value, i, i - 1)
	}
	const moveDown = (i) => {
		if (i < customTypes.value.length - 1) move(customTypes.value, i, i + 1)
	}
	const moveTop = (i) => {
		move(customTypes.value, i, 0)
	}
	const moveBottom = (i) => {
		move(customTypes.value, i, customTypes.value.length - 1)
	}

	// 判断是否修改过顺序
	const hasSortChanged = computed(() => {
		const now = customTypes.value.map(t => t.id)
		if (now.length !== originalOrder.value.length) return true
		for (let i = 0; i < now.length; i++) {
			if (now[i] !== originalOrder.value[i]) return true
		}
		return false
	})

	// 保存排序
	const saveSort = async () => {
		if (!hasSortChanged.value || savingSort.value) return
		savingSort.value = true
		const token = uni.getStorageSync('token')
		const sortedIds = customTypes.value.map(t => t.id)
		try {
			const res = await uni.request({
				url: websiteUrl.value + '/with-state/sort-account-book-type',
				method: 'POST',
				header: {
					'Authorization': token,
					'Content-Type': 'application/json'
				},
				data: {
					sorted_ids: sortedIds
				}
			})
			if (res.data?.status && res.data.status !== 'success') {
				throw new Error(res.data?.msg || '保存失败')
			}
			originalOrder.value = [...sortedIds]
			uni.showToast({
				title: '排序已保存'
			})
		} catch (err) {
			uni.showToast({
				title: err?.message || '保存失败',
				icon: 'none'
			})
		} finally {
			savingSort.value = false
		}
	}

	// ===== 删除（保留你原逻辑，略做健壮） =====
	const deleteType = async (id) => {
		uni.showModal({
			title: '确认删除',
			success: async (res) => {
				if (!res.confirm) return
				const token = uni.getStorageSync('token')
				try {
					const response = await uni.request({
						url: websiteUrl.value + '/with-state/delete-account-type',
						method: 'POST',
						header: {
							'Authorization': token,
							'Content-Type': 'application/json'
						},
						data: {
							id
						}
					})
					const resData = response.data
					if (resData?.status && resData.status !== 'success') {
						uni.showToast({
							title: resData?.msg || '删除失败',
							icon: 'none'
						})
						return
					}
					await getAccountTypes()
					// 如果删掉的是当前选择的分类，回到“全部”
					if (selectedTypeName.value !== '全部' && !customTypes.value.some(t => t.name ===
							selectedTypeName.value)) {
						selectedTypeName.value = '全部'
						emits('update-type', '')
					}
					uni.showToast({
						title: '删除成功'
					})
				} catch (err) {
					console.error('删除失败:', err)
					uni.showToast({
						title: err.errMsg || '请求失败',
						icon: 'none'
					})
				}
			}
		})
	}

	// ===== 外层分类切换（保持你的对外事件） =====
	const updateSelectedType = (e) => {
		selectedType.value = e.detail.value
		selectedTypeName.value = typeOptions.value[selectedType.value]

		// 保存到本地存储
		saveSelectedType()

		emits('update-type', selectedTypeName.value === '全部' ? '' : selectedTypeName.value)
	}
	// ===== 生命周期 =====
	watch(isPriceVisible, (v) => uni.setStorageSync(PRICE_VISIBLE_KEY, String(v)))
	onShow(async () => {
		// 加载保存的显示状态
		const saved = uni.getStorageSync(PRICE_VISIBLE_KEY)
		if (saved !== '') isPriceVisible.value = (saved === 'true')

		// 加载保存的分类
		loadSelectedType()

		// 获取分类数据
		await getAccountTypes()

		// 触发初始分类更新
		emits('update-type', selectedTypeName.value === '全部' ? '' : selectedTypeName.value)
	})
</script>
<style lang="scss" scoped>
	/* 调整原有样式 */
	.content {
		padding: 0 20rpx;
	}

	/* 其他原有样式保持不变 */
	.type-header {
		padding: 15rpx 30rpx;
		background: linear-gradient(135deg, #f8f9ff, #eef2ff);
		border-radius: 16rpx;
		margin: 20rpx 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(116, 126, 229, 0.15);
	}

	.selector-container {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.type-picker {
		flex: 1;
	}

	.selector-content {
		display: flex;
		align-items: center;
		padding: 20rpx 25rpx;
		background: #fff;
		border-radius: 12rpx;
		box-shadow: 0 2rpx 10rpx rgba(116, 126, 229, 0.1);
		transition: all 0.3s ease;

		&:active {
			transform: translateY(2rpx);
			box-shadow: 0 1rpx 5rpx rgba(116, 126, 229, 0.15);
		}
	}

	.selector-label {
		font-size: 26rpx;
		color: #747EE5;
		font-weight: 600;
		margin-right: 15rpx;
	}

	.selector-value {
		font-size: 28rpx;
		color: #464646;
		font-weight: 600;
		flex: 1;
	}

	.selector-icon {
		margin-left: 10rpx;
	}

	.manage-btn {
		display: flex;
		align-items: center;
		font-size: 26rpx;
		color: white;
		background: linear-gradient(135deg, #97e7f7, #d5acd6);
		padding: 20rpx 30rpx;
		border-radius: 12rpx;
		margin-left: 20rpx;
		transition: all 0.3s ease;

		&:active {
			transform: translateY(2rpx);
			box-shadow: 0 2rpx 8rpx rgba(116, 126, 229, 0.3);
		}

		text {
			color: #fff;
			margin-left: 10rpx;
		}
	}

	.summary-container {
		margin: 0 30rpx 20rpx;
	}

	.summary-content {
		display: flex;
		align-items: center;
		padding: 20rpx 25rpx;
		background: linear-gradient(135deg, #f0f9ff, #e6f7ff);
		border-radius: 12rpx;
		box-shadow: 0 2rpx 10rpx rgba(116, 202, 229, 0.15);
	}

	.total-text {
		font-size: 28rpx;
		color: #74c9e5;
		font-weight: bold;
		margin-left: 12rpx;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 50vh;
		padding: 40rpx;
		text-align: center;

		.empty-icon {
			width: 300rpx;
			height: 300rpx;
			opacity: 0.8;
			margin-bottom: 40rpx;
		}

		.empty-text {
			font-size: 32rpx;
			color: #747EE5;
			margin-bottom: 15rpx;
			font-weight: 600;
		}

		.empty-tip {
			font-size: 26rpx;
			color: #999;
			line-height: 1.6;
		}
	}

	.type-modal {
		padding: 10rpx;
		box-sizing: border-box;
		width: 85vw;
		height: 900rpx;
		display: flex;
		flex-direction: column;

		.modal-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding-bottom: 25rpx;
			border-bottom: 1rpx solid #eee;
			margin-bottom: 25rpx;

			.modal-title {
				font-size: 32rpx;
				color: #464646;
				font-weight: 600;
			}
		}

		.type-list {
			flex: 1;
			overflow-y: auto;
			margin-bottom: 30rpx;

			.type-item {
				display: flex;
				align-items: center;
				padding: 25rpx;
				margin-bottom: 20rpx;
				background: #f8f9ff;
				border-radius: 16rpx;
				box-shadow: 0 2rpx 10rpx rgba(116, 126, 229, 0.1);
				transition: all 0.3s ease;
				gap: 20rpx;

				&:active {
					transform: translateY(2rpx);
					box-shadow: 0 1rpx 5rpx rgba(116, 126, 229, 0.15);
				}

				.type-icon {
					width: 60rpx;
					height: 60rpx;
					background: rgba(116, 126, 229, 0.1);
					border-radius: 12rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					margin-right: 20rpx;
				}

				.type-name {
					flex: 1;
					font-size: 28rpx;
					color: #464646;
					font-weight: 500;
				}

				.type-actions {
					width: 180rpx;
					display: flex;
					justify-content: flex-end;
				}
			}

			.empty-types {
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				height: 300rpx;
				text-align: center;

				.empty-folder {
					width: 160rpx;
					height: 160rpx;
					opacity: 0.5;
					margin-bottom: 25rpx;
				}

				.empty-text {
					font-size: 28rpx;
					color: #747EE5;
					margin-bottom: 10rpx;
					font-weight: 500;
				}

				.empty-tip {
					font-size: 24rpx;
					color: #999;
				}
			}
		}

		.add-type-container {
			border-top: 1rpx solid #f0f0f0;
			padding-top: 25rpx;
			position: absolute;
			bottom: 30px;
			background-color: #fff;
			width: 600rpx;

			.add-type-form {
				display: flex;
				gap: 20rpx;
				margin-bottom: 20rpx;

				.type-input {
					flex: 1;
					border: 1rpx solid #e0e0e0;
					border-radius: 12rpx;
					padding: 20rpx;
					font-size: 28rpx;
					background: #fff;
					box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
				}

				.add-btn {
					display: flex;
					align-items: center;
					justify-content: center;
					background: linear-gradient(135deg, #747EE5, #9BA3EB);
					color: white;
					font-size: 26rpx;
					padding: 0 35rpx;
					border-radius: 12rpx;
					box-shadow: 0 4rpx 15rpx rgba(116, 126, 229, 0.3);
					transition: all 0.3s ease;

					&:active {
						transform: translateY(2rpx);
						box-shadow: 0 2rpx 8rpx rgba(116, 126, 229, 0.3);
					}

					text {
						margin-left: 8rpx;
					}
				}
			}

			.hint-text {
				font-size: 24rpx;
				color: #aaa;
				text-align: center;
			}
		}
	}

	.summary-content {
		position: relative;
		display: flex;
		align-items: center;
		/* 其他样式保持不变 */

		.toggle-eye {
			margin-left: 15rpx;
			padding: 8rpx;
			border-radius: 50%;
			background-color: rgba(116, 201, 229, 0.1);
			transition: all 0.3s ease;

			&:active {
				transform: scale(0.9);
				background-color: rgba(116, 201, 229, 0.2);
			}
		}
	}

	/* 调整总价文本的间距 */
	.total-text {
		display: flex;
		align-items: center;
		gap: 8rpx;
	}

	.sort-actions {
		display: flex;
		gap: 10rpx;
		margin-right: 20rpx;
		flex-wrap: nowrap;
	}

	.mini-btn {
		padding: 6rpx 16rpx;
		line-height: 1.8;
		border-radius: 10rpx;
		font-size: 22rpx;
		background: #f3f6ff;
	}

	.type-actions {
		width: 180rpx;
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 16rpx;
	}

	.act-btn {
		padding: 6rpx 16rpx;
		border-radius: 10rpx;
		font-size: 22rpx;
		background: #eef2ff;
	}

	.act-btn.primary {
		background: linear-gradient(135deg, #747EE5, #9BA3EB);
		color: #fff;
	}

	.type-input {
		flex: 1;
		border: 1rpx solid #e0e0e0;
		border-radius: 12rpx;
		padding: 16rpx 20rpx;
		font-size: 28rpx;
		background: #fff;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	}
</style>