<template>
	<view>
		<view-logs />
		<!-- 上传图片列表 -->
		<view style="width: 100%;overflow: hidden;">
			<scroll-view scroll-x="true" class="upload_box" ll-with-animation="true" :show-scrollbar="false">
				<view class="upload_item" v-for="(item, index) in uploadList" :key="index">
					<image :src="item" class="uploaded_image" @tap="viewFullImage(index)" mode="aspectFill" />
					<image src="../../static/cancel.png" class="close_icon" @tap="deleteImage(index)" />
				</view>
				<view class="uploadImageBox" style="background: #f8f8f8;" v-if="uploadList.length < 9">
					<image src="../../static/add2.png" class="upload_img" @tap="selectImage"
						style="width: 50px;height: 50px;margin: 25px;" />
				</view>

			</scroll-view>
		</view>
		<!-- 标题 -->
		<input v-model="title" type="text" placeholder="请输入标题"
			style="padding: 10px;margin: 20px 15px 5px 15px;display: block;">
		<view class="oneLine"></view>
		<textarea v-model="content" placeholder="请输入正文"
			style="padding: 10px;margin:10px 15px 5px 15px;display: block;line-height: 28px;width: calc(100% - 50px);"></textarea>
		<view class="oneLine"></view>
		<view class="">
			<view class="relation-trigger" @tap="showRelationPicker">
				<text class="placeholder">点击关联娃物</text>
				<image src="/static/right2.png" class="arrow-icon" />
			</view>
		</view>
		<view class="publish-detail">
			<text>* 分享您对于打扮BJD的想法✨。</text>
			<text>* 不关联商品的搭配不会出现在广场中。</text>
			<text>* 可以是BJD相关的贩售广告，但不可以滥用关联。</text>
		</view>
		<!-- 相关 -->
		<view class="saveCollocationDataList">
			<view v-for="(item, index) in saveCollocationDataList" :key="index">
				<view class="saveCollocationDataItem">
					<image v-if="item.goods_image" :src="item.goods_image" mode="aspectFill"
						style="width: 70px;height: 70px;"></image>
					<text v-else class="no-image">?</text>
					<text class="info-tap" style="width: calc(100% - 120px);display: inline-block;">{{item.type}}
						{{item.brand_name}} -
						{{item.goods_name}} </text>
					<image src="../../static/cancel.png" class="close_icon" @tap="deleteCollcation(index)" />
				</view>
			</view>
		</view>

		<relation-picker v-model:visible="showSelectTab" :typeList="typeList" :goodsList="goodsList"
			@confirm="handleRelationConfirm" @cancel="handleRelationCancel" />

		<view class="footer">
			<button @click="submitForm">{{ isEdit ? '更新' : '提交' }}</button>
		</view>

	</view>
</template>

<script setup>
	import {
		ref,
		onMounted
	} from 'vue';
	import {
		websiteUrl,
		image1Url,
	} from "../../common/config.js";
	import {
		getQiniuToken,
		uploadImageToQiniu,
		chooseImageList,
	} from "../../common/image.js";

	// 接受参数 propsGoodsId propsGoodsName propsBrandId propsBrandName如果是非空或非0，添加一条
	// 新增collocation_id参数用于编辑模式
	const props = defineProps(["goods_id", "goods_name", "brand_id", "brand_name", "type", "collocation_id"])

	// 标记是否为编辑模式
	const isEdit = ref(false);
	const uploadList = ref([]);
	const goodsList = ref([]);
	const typeList = ref([]);
	const showSelectTab = ref(false);
	const saveCollocationDataList = ref([])
	
	//表单信息
	const title = ref("")
	const content = ref("")

	// 获取搭配详情
	async function fetchCollocationDetail() {
		if (!props.collocation_id) return;
		
		try {
			const res = await uni.request({
				url: `${websiteUrl.value}/view-collocation?collocation_id=${props.collocation_id}&origin=1`,
				method: 'GET',
				timeout: 5000
			});
			
			if (res.data.status === "success") {
				const data = res.data.data;
				title.value = data.title || "";
				content.value = data.content || "";
				uploadList.value = data.image_url_list || [];
				
				// 处理关联商品
				if (data.collocation_relation_list && data.collocation_relation_list.length > 0) {
					saveCollocationDataList.value = data.collocation_relation_list.map(item => ({
						goods_id: item.relation_goods_id,
						goods_name: item.relation_goods_name,
						brand_id: item.relation_brand_id,
						brand_name: item.relation_brand_name,
						type: item.type,
						goods_image: item.relation_goods_image || ""
					}));
				}
			}
		} catch (error) {
			console.error('获取搭配详情失败:', error);
			uni.showToast({
				title: '加载搭配详情失败',
				icon: 'none'
			});
		}
	}

	onMounted(() => {
		// 初始化商品类型
		getTypes();
		
		// 检查是否是编辑模式
		if (props.collocation_id) {
			isEdit.value = true;
			fetchCollocationDetail();
		}
		
		// 处理直接关联商品
		if (props.goods_id && props.goods_name && props.brand_id && props.brand_name && props.type) {
			getGoodsInfo(props.goods_id).then((res) => {
				let data = {
					"brand_id": parseInt(props.brand_id, 10),
					"goods_id": parseInt(props.goods_id, 10),
					"brand_name": props.brand_name,
					"goods_name": props.goods_name,
					"goods_image": res.data.goods_images[0],
					"type": props.type
				}
				// 避免重复添加
				const exists = saveCollocationDataList.value.some(item => 
					item.goods_id === data.goods_id && item.brand_id === data.brand_id
				);
				if (!exists) {
					saveCollocationDataList.value.push(data);
				}
			});
		}
	});

	// 处理确认事件
	const handleRelationConfirm = (data) => {
		try {
			const relationData = {
				goods_id: data.goods.id || 0,
				goods_name: data.goods.name,
				goods_image: data.goods.image || '',
				brand_id: data.brand.id || 0,
				brand_name: data.brand.name || (data.isFuzzy ? '' : '未知品牌'),
				type: data.type || (data.isFuzzy ? '未知类型' : '')
			}

			// 去重检查（同时匹配ID和名称）
			const isExist = saveCollocationDataList.value.some(item =>
				(item.goods_id !== 0 && item.goods_id === relationData.goods_id) ||
				item.goods_name === relationData.goods_name
			)

			if (!isExist) {
				saveCollocationDataList.value.push(relationData)
			} else {
				uni.showToast({
					title: '已存在相同关联项',
					icon: 'none'
				})
			}
		} catch (error) {
			console.error('保存关联数据失败:', error)
			uni.showToast({
				title: '保存关联信息失败',
				icon: 'none'
			})
		}
	}
	
	// 处理取消事件
	const handleRelationCancel = () => {
		console.log('用户取消选择')
	}

	const showRelationPicker = () => {
		showSelectTab.value = true;
	}

	//获取商品详情
	function getGoodsInfo(id) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: websiteUrl.value + '/goods?id=' + id,
				method: 'GET',
				timeout: 5000,
				success: (res) => {
					resolve(res.data); // 请求成功，返回数据
				},
				fail: (err) => {
					console.log(err);
					uni.showToast({
						title: '网络请求失败',
						icon: 'none'
					})
					reject(err);
				}
			})
		});
	}

	function viewFullImage(index) {
		uni.previewImage({
			current: uploadList.value[index],
			urls: uploadList.value
		});
	}

	//选择图片
	async function selectImage() {
		try {
			// 计算还能上传几张图片
			const remaining = 9 - uploadList.value.length;
			if (remaining <= 0) {
				uni.showToast({
					title: '最多只能上传9张图片',
					icon: 'none'
				});
				return;
			}
			
			// 选择多张图片
			const imagePaths = await chooseImageList(remaining);

			// 逐个上传
			for (const path of imagePaths) {
				// 为每个图片获取独立token
				const tokenData = await getQiniuToken();

				// 上传到七牛云
				await uploadImageToQiniu(path, tokenData.token, tokenData.path);

				// 添加到展示列表
				uploadList.value.push(image1Url + tokenData.path);
			}

			uni.showToast({
				title: `成功上传${imagePaths.length}张图片`,
				icon: 'success'
			});
		} catch (error) {
			console.error('上传出错:', error);
			uni.showToast({
				title: '部分图片上传失败',
				icon: 'none'
			});
		}
	}

	// 实现提交方法
	async function submitForm() {
		const token = uni.getStorageSync('token');
		if (!token) {
			uni.showToast({
				title: '请先登录',
				icon: 'none'
			});
			return;
		}
		// 基本验证
		if (!title.value.trim()) {
			uni.showToast({
				title: '标题不能为空',
				icon: 'none'
			});
			return;
		}
		if (uploadList.value.length === 0) {
			uni.showToast({
				title: '请至少上传一张图片',
				icon: 'none'
			});
			return;
		}

		// 构造请求数据
		const postData = {
			title: title.value,
			content: content.value,
			image_url_list: uploadList.value,
			relations: saveCollocationDataList.value.map(item => ({
				relation_goods_id: item.goods_id,
				relation_goods_name: item.goods_name,
				relation_brand_id: item.brand_id,
				relation_brand_name: item.brand_name,
				type: item.type,
				relation_origin: 1 // 标识关联的是collocation
			}))
		};
		
		// 编辑模式添加collocation_id
		if (isEdit.value) {
			postData.collocation_id = parseInt(props.collocation_id);
		}

		try {
			const url = isEdit.value 
				? websiteUrl.value + '/with-state/update-collocation'
				: websiteUrl.value + '/with-state/add-collocation';
				
			const res = await uni.request({
				url: url,
				method: 'POST',
				data: postData,
				header: {
					'Content-Type': 'application/json',
					'Authorization': token,
				},
				timeout: 8000
			});
			
			if (res.data.status === "success") {
				uni.showToast({
					title: isEdit.value ? '更新成功' : '提交成功'
				});
				// 返回上一页
				setTimeout(() => uni.navigateBack(), 1500);
			} else {
				uni.showToast({
					title: res[1].data.msg || (isEdit.value ? '更新失败' : '提交失败'),
					icon: 'none'
				});
			}
		} catch (err) {
			console.log(err);
			uni.showToast({
				title: '网络请求失败',
				icon: 'none'
			});
		}
	}

	// 获取types列表
	function getTypes() {
		uni.request({
			url: websiteUrl.value + '/goods-types',
			method: 'GET',
			timeout: 5000,
			success: (res) => {
				if (res.data && res.data.data) {
					typeList.value = res.data.data;
				}
			},
			fail: (err) => {
				console.log(err);
				uni.showToast({
					title: '获取商品类型失败',
					icon: 'none'
				})
			}
		})
	}

	function deleteImage(index) {
		uploadList.value.splice(index, 1)
	}

	function deleteCollcation(index) {
		saveCollocationDataList.value.splice(index, 1)
	}
</script>

<style lang="less">
	/* 样式保持不变，与之前相同 */
	.uploaded_image {
		width: 100px;
		height: 100px;
		margin-right: 10px;
	}

	.upload_box {
		width: 100%;
		white-space: nowrap;
		overflow-x: auto;
		display: block;
		margin-top: 15px;
		padding: 10px;
		margin-left: 10px;

		view {
			display: inline-block;
			vertical-align: top;
		}

		.upload_item {
			position: relative;
			width: 100px;
			margin-right: 10px;
			border-radius: 5px;
			overflow: hidden;

			.uploaded_image {
				width: 100px;
				height: 100px;
			}

			.close_icon {
				position: absolute;
				right: 0;
				top: 0;
				width: 20px;
				height: 20px;
			}
		}
	}

	.saveCollocationDataList {
		padding-bottom: 80px;
		min-height: 300rpx;

		.saveCollocationDataItem {
			position: relative;
			background: #fafafa;
			width: 90vw;
			margin: 10px auto;

			.info-tap {
				position: absolute;
				bottom: 30px;
				margin-left: 10px;
			}

			.no-image {
				display: inline-block;
				width: 70px;
				height: 70px;
				bottom: 0px;
				margin-left: 0px;
				color: #fda7a7;
				font-size: 30px;
				text-align: center;
				line-height: 70px;
				font-weight: 1000;
			}

			.close_icon {
				width: 20px;
				height: 20px;
				position: absolute;
				bottom: 30px;
				right: 10px;
				margin-left: 10px;
				background: #f2f2f2;
				border-radius: 100%;
			}
		}
	}

	.footer {
		position: fixed;
		bottom: 0px;
		width: 100%;
		box-shadow: 0 0 5px rbga(0, 0, 0, 0.2);
		align-items: center;

		button {
			width: 80%;
			background-color: #78d0dd;
			color: #fff;
			font-size: 16px;
			text-align: center;
			padding: 10px;
			border-radius: 30px;
			margin-bottom: 10px;
		}
	}

	.oneLine {
		border-bottom: 1px solid #dadada;
		width: calc(100vw - 50px);
		margin: 0px 25px;
		box-sizing: border-box;
	}

	// 关联娃物
	.relation-trigger {
		display: flex;
		align-items: center;
		padding: 20rpx 30rpx;
		background: #f8f8f8;
		border-radius: 12rpx;
		margin: 20rpx;

		.placeholder {
			flex: 1;
			color: #999;
			font-size: 28rpx;
		}

		.arrow-icon {
			width: 30rpx;
			height: 30rpx;
		}
	}

	.publish-detail {
		text {
			display: block;
			color: #888;
			margin: 20rpx 40rpx;
		}
	}
</style>
