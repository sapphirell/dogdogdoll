<template>
	<view>
		<meta name="theme-color" content="#F8F8F8"></meta>
		<view v-if="!isEditable" class="edit-tip">
			<text>当前状态不可编辑</text>
		</view>

		<!-- 上传图片列表 -->
		<scroll-view scroll-x="true" class="upload_box" ll-with-animation="true" :show-scrollbar="false">
			<view class="upload_item" v-for="(item, index) in uploadList" :key="index">
				<image :src="item" class="uploaded_image" @tap="viewFullImage" mode="aspectFill" />
				<image v-if="isEditable" src="/static/cancel.png" class="close_icon" @tap="deleteImage(index)" />
			</view>
			<view class="uploadImageBox" style="background: #f8f8f8;" v-if="isEditable">
				<image src="/static/add2.png" class="upload_img" @tap="selectImage(index)"
					style="width: 50px;height: 50px;margin: 25px;" />
			</view>

		</scroll-view>
		<!-- 标题 -->
		<input v-model="name" type="text" :disabled="!isEditable" placeholder="请输入标题"
			style="padding: 10px;margin: 20px 15px 5px 15px;display: block;">
		<view class="oneLine"></view>
		<textarea v-model="description" :disabled="!isEditable" placeholder="请输入描述"
			style="padding: 10px;margin:10px 15px 5px 15px;display: block;line-height: 28px;width: calc(100% - 50px);"></textarea>
		<view class="oneLine"></view>
		<view class="">
			<view class="relation-trigger" v-if="isEditable" @tap="showRelationPicker">
			  <text class="placeholder">点击关联娃物</text>
			  <image src="/static/right2.png" class="arrow-icon" />
			</view>
		</view>

		<!-- 相关 -->
		<view class="saveCollocationDataList">
			<view v-for="(item, index) in saveCollocationDataList" :key="index">
				<view class="saveCollocationDataItem">
					<image v-if="item.goods_image" :src="item.goods_image" mode="aspectFill" style="width: 70px;height: 70px;"></image>
					<text v-else class="no-image">?</text>
					<text class="info-tap" style="width: calc(100% - 120px);display: inline-block;">{{item.type}} {{item.brand_name}} -
						{{item.goods_name}} </text>
					<image src="/static/cancel.png" v-if="isEditable" class="close_icon"
						@tap="deleteCollcation(index)" />
				</view>
			</view>
		</view>


		 <relation-picker
		   v-model:visible="showSelectTab"
		    :typeList="typeList"
		    :goodsList="goodsList"
		    @confirm="handleRelationConfirm"
		    @cancel="handleRelationCancel"
		  />


		<view class="footer">
			<button v-if="showDelete" @click="handleDelete" class="delete-btn">删除</button>
			<button @click="submitForm">发表</button>
		</view>

	</view>
</template>

<script setup>
	import {
		onMounted,
		ref,
		computed,
	} from 'vue';
	import {
		websiteUrl,
		image1Url,
		wechatSignLogin,
		getUserInfo,
		global,
		asyncGetUserInfo,
		getScene,
	} from "../../../common/config.js";

	import {
		chooseImage,
		jumpToCroper,
		getQiniuToken,
		uploadImageToQiniu,
		chooseImageList,
	} from "../../../common/image.js";

	//接受参数 propsGoodsId propsGoodsName propsBrandId propsBrandName如果是非空或非0，添加一条
	const props = defineProps(["showcase_id"])

	const uploadList = ref([]);
	const goodsList = ref([
		// {"name":"aa", "id":1}
	]);
	const typeList = ref([]);
	const showSelectTab = ref(false);
	// // 信息输入框临时信息
	const chooseBrandName = ref("")
	const chooseBrandId = ref(0)
	const chooseGoodsName = ref("")
	const chooseGoodsId = ref(0)
	const chooseType = ref("")
	


	// 处理确认事件
	const handleRelationConfirm = (selectedData) => {
	  // 这里处理选择后的数据保存逻辑
	  console.log('收到选择数据:', selectedData)
	  // 将数据添加到 saveCollocationDataList
	  saveCollocationDataList.value.push({
		brand_id: selectedData.brand_id,
		goods_id: selectedData.goods.id,
		brand_name: selectedData.brand.name,
		goods_name: selectedData.goods.name,
		goods_image: selectedData.goods.image,
		type: selectedData.type
	  })
	}

	// 处理取消事件
	const handleRelationCancel = () => {
	  console.log('用户取消选择')
	}
	
	const showRelationPicker = () => {
	  showSelectTab.value = true;
	}
	
	// 是否可编辑
	const isEditable = computed(() => [-1, 1, 3].includes(display.value));
	// const displayText = computed(() => displayOptions.value[display.value]);
	const showDelete = computed(() => {
		if (props.showcase_id > 0) {
			return true
		} 
		return false
	});


	// 修改响应式数据
	const name = ref("")
	const description = ref("")
	const display = ref(-1) // 0=审核中


	//获取商品详情
	function getGoodsInfo(id) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: websiteUrl + '/goods?id=' + id,
				method: 'GET',
				timeout: 5000,
				success: (res) => {
					console.log(res.data.data);
					resolve(res.data); // 请求成功，返回数据
				},
				fail: (err) => {
					console.log(err);
					uni.showToast({
						title: '网络请求失败',
						icon: 'none'
					})
					reject(err); // 请求失败，抛出错误
				},
				complete: () => {
					uni.hideLoading()
				}
			})
		});
	}

	//存储的信息框内容列表
	const saveCollocationDataList = ref([])


	// 获取Showcase详情
	async function getShowCaseInfo() {
		if (!props.showcase_id) return
		

		try {
			const res = await uni.request({
				url: `${websiteUrl}/with-state/showcase-detail?id=${props.showcase_id}`,
				method: 'GET',
				header: {
					'Authorization': uni.getStorageSync('token'),
				},
			})

			const data = res.data.data
			name.value = data.name
			description.value = data.description
			display.value = data.display
			uploadList.value = data.image_urls?.split(',') || [] // 确保处理空值
			console.log(data)
			// 如果有关联商品需要加载
			if (data.relations) {
				saveCollocationDataList.value = data.relations.map(r => ({
					goods_id: r.relation_goods_id,
					goods_name: r.relation_goods_name,
					brand_id: r.relation_brand_id,
					brand_name: r.relation_brand_name,
					type: r.type,
					goods_image: r.relation_goods_image
				}))
			}
		} catch (err) {
			uni.showToast({
				title: '加载失败',
				icon: 'none'
			})
		}
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
	    // 选择多张图片
	    const imagePaths = await chooseImageList(9);
	    
	    // 逐个上传
	    for (const path of imagePaths) {
	      // 为每个图片获取独立token
	      const tokenData = await getQiniuToken();
	      
	      // 上传到七牛云
	      await uploadImageToQiniu(path, tokenData.token, tokenData.path);
	      
	      // 添加到展示列表
	      uploadList.value.push(image1Url + tokenData.path);
	    }
	    
	    uni.showToast({ title: `成功上传${imagePaths.length}张图片`, icon: 'success' });
	  } catch (error) {
	    console.error('上传出错:', error);
	    uni.showToast({ title: '部分图片上传失败', icon: 'none' });
	  }
	}

	async function handleDelete() {
		uni.showModal({
			title: '确认删除',
			content: '确定要删除这个展示吗？',
			success: async (res) => {
				if (res.confirm) {
					try {
						const res = await uni.request({
							url: `${websiteUrl}/with-state/delete-showcase?id=` + props.showcase_id,
							method: 'POST',
						
							header: {
								'Authorization': uni.getStorageSync('token'),
							}
						})

						if (res.data.status === "success") {
							uni.showToast({
								title: '删除成功'
							})
							setTimeout(() => uni.navigateBack(), 1000)
						}
					} catch (err) {
						uni.showToast({
							title: '删除失败',
							icon: 'none'
						})
					}
				}
			}
		})
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
		if (!name.value.trim() || !description.value.trim()) {
			uni.showToast({
				title: '标题和正文不能为空',
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
		let scene = getScene()		
		let postData = {
			name: name.value,
			description: description.value,
			image_urls: uploadList.value.join(','),
			display: display.value,
			origin: scene,
			relations: saveCollocationDataList.value.map(item => ({
				relation_goods_id: item.goods_id,
				relation_goods_name: item.goods_name,
				relation_brand_id: item.brand_id,
				relation_brand_name: item.brand_name,
				type: item.type,
				relation_origin: 2 // 标识关联的是showcase
			}))
		};

		try {
			let url = `${websiteUrl}/with-state/add-showcase`
			// id 转int
			if (props.showcase_id) {
				url = `${websiteUrl}/with-state/update-showcase`
				postData = {
					...postData,
					id: parseInt(props.showcase_id, 10)
				}
			} 

			const res = await uni.request({
				url,
				method: 'POST',
				data: postData,
				header: {
					'Content-Type': 'application/json',
					'Authorization': uni.getStorageSync('token'),
				}
			})

			if (res.data.code !== "failed") {
				uni.showToast({
					title: '提交成功'
				})
				setTimeout(() => uni.navigateBack(), 1500)
			} else {
				uni.showToast({
					title: '提交失败',
					icon: 'none'
				})
				return
			}
		} catch (err) {
			console.log(err)
			uni.showToast({
				title: '提交失败',
				icon: 'none'
			})
		}


	}



	// 获取types列表
	function getTypes() {
		///goods-types
		uni.request({
			url: websiteUrl + '/goods-types',
			method: 'GET',
			timeout: 5000,
			success: (res) => {
				console.log(res.data.data);
				typeList.value = res.data.data
			},
			fail: (err) => {
				console.log(err);
				uni.showToast({
					title: '网络请求失败',
					icon: 'none'
				})
			}
		})
	}

	// 存储一条搭配信息
	function saveCollocation() {
		if (chooseBrandName.value == "") {
			uni.showToast({
				title: '请选择或填写品牌名称',
				icon: 'none'
			})
			return
		}
		if (chooseGoodsName.value == "") {
			uni.showToast({
				title: '请选择或填写商品名称',
				icon: 'none'
			})
			return
		}
		
		//如果没有goods_id，存储goods_name进去即可
		if (chooseGoodsId.value == 0) {
			let data  = {
				"brand_id": chooseBrandId.value,
				"goods_id": 0,
				"brand_name": chooseBrandName.value,
				"goods_name": chooseGoodsName.value,
				"goods_image": "",
				"type": chooseType.value,
			}
			saveCollocationDataList.value.push(data)
			showSelectTab.value = false
			chooseBrandId.value = 0
			chooseBrandName.value = ""
			chooseGoodsId.value = 0
			chooseGoodsName.value = ""
			chooseType.value = ""
			return
		}
		
		
		getGoodsInfo(chooseGoodsId.value).then((res) => {
			let data = {
				"brand_id": chooseBrandId.value,
				"goods_id": chooseGoodsId.value,
				"brand_name": chooseBrandName.value,
				"goods_name": chooseGoodsName.value,
				"goods_image": res.data.goods_images[0],
				"type": chooseType.value,
			}
			saveCollocationDataList.value.push(data)
			showSelectTab.value = false
			chooseBrandId.value = 0
			chooseBrandName.value = ""
			chooseGoodsId.value = 0
			chooseGoodsName.value = ""
			chooseType.value = ""
		})
	}

	function deleteImage(index) {
		uploadList.value.splice(index, 1)
	}

	function deleteCollcation(index) {
		saveCollocationDataList.value.splice(index, 1)
	}
	// 设置标题
	uni.setNavigationBarTitle({
		title: '展示柜'
	})
	
	

	
	onMounted(() => {
		getTypes()
		getShowCaseInfo()
	})
</script>

<style lang="less">
	.uploaded_image {
		width: 100px;
		height: 100px;
		margin-right: 10px;

	}

	.upload_box {
		// 核心修改点：
		width: 100%; // 避免使用 100vw（可能因滚动条导致宽度溢出）
		white-space: nowrap; // 强制子元素不换行
		overflow-x: auto; // 确保横向滚动生效（UniApp的scroll-view组件已封装滚动逻辑，此处为保险可保留）
		display: block; // 明确容器为块级元素
		margin-top: 15px;
		padding: 10px;
		margin-left: 10px;

		view {
			display: inline-block; // 关键！强制子元素横向排列（替代 float）
			vertical-align: top; // 对齐方式（避免图片底部留白）
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
				background: #fff;
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
		display: flex;
		justify-content: space-around;
		gap: 20px;
		margin-bottom: 20rpx;

		button {

			background-color: #78d0dd;
			color: #fff;
			font-size: 16px;
			text-align: center;
			padding: 10px;
			border-radius: 30px;
			margin-bottom: 10px;
			flex: 1;
			max-width: 45%;
		}

		.delete-btn {
			// opacity: 0.6;
			// pointer-events: none;
		}
	}

	.oneLine {
		border-bottom: 1px solid #dadada;
		width: calc(100vw - 50px);
		margin: 0px 25px;
		box-sizing: border-box;
	}


	.edit-tip {
		padding: 10px;
		background: #fff3cd;
		color: #856404;
		text-align: center;
		font-size: 14px;
	}
	
	//  弹窗样式
	// .selectTab-container {
	//   padding: 30rpx;
	//   background: #fff;
	//   border-radius: 16rpx;
	//   box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.1);
	  
	//   .selectTab-content {
	//     max-height: 70vh;
	//     overflow-y: auto;
	    
	//     .modal-search {
	//       margin: 0 20rpx;
	//       background: #f5f5f5;
	//       border-radius: 12rpx;
	      
	//       /deep/ .search_tab {
	//         padding: 15rpx 20rpx;
	//         background: #f5f5f5 !important;
	        
	//         .common_search_input {
	//           font-size: 28rpx;
	//           color: #333;
	//         }
	//       }
	//     }
	
	//     .modal-picker {
	//       margin: 30rpx 20rpx 0;
	      
	//       /deep/ .select-input {
	//         background: #f5f5f5;
	//         border-radius: 12rpx;
	//         padding: 20rpx;
	//         font-size: 28rpx;
	//       }
	//     }
	
	//     .confirm-btn {
	//       margin: 40rpx 20rpx 20rpx;
	//       background: #78d0dd !important;
	//       color: #fff !important;
	//       border-radius: 12rpx;
	//       font-size: 32rpx;
	//       height: 88rpx;
	//       line-height: 88rpx;
	//       transition: all 0.3s;
	      
	//       &::after {
	//         border: none;
	//       }
	      
	//       &:active {
	//         opacity: 0.9;
	//         transform: scale(0.98);
	//       }
	//     }
	//   }
	// }
	
	// /* 优化子组件内部样式 */
	// /deep/ .search_results {
	//   max-height: 400rpx !important;
	//   margin-top: 20rpx !important;
	//   border-radius: 12rpx !important;
	  
	//   .result_item {
	//     padding: 24rpx 32rpx !important;
	//     font-size: 28rpx;
	//     color: #333;
	//     transition: all 0.2s;
	    
	//     &:active {
	//       background: #f0f0f0;
	//     }
	//   }
	// }
	
	// /deep/ .dropdown {
	//   border-radius: 12rpx !important;
	//   box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.1) !important;
	  
	//   .dropdown-item {
	//     padding: 24rpx 32rpx !important;
	//     font-size: 28rpx;
	//   }
	// }
	
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
</style>