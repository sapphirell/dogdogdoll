<template>
	<common-page>
		<!-- 上传图片列表 -->
		<scroll-view scroll-x="true" class="upload_box" ll-with-animation="true" :show-scrollbar="false">
			<view class="upload_item" v-for="(item, index) in uploadList" :key="index">
				<image :src="item" class="uploaded_image" @tap="viewFullImage" mode="aspectFill" />
				<image src="../../static/cancel.png" class="close_icon" @tap="deleteImage(index)" />
			</view>
			<view class="uploadImageBox" style="background: #f8f8f8;">
				<image src="../../static/add2.png" class="upload_img" @tap="selectImage(index)"
					style="width: 50px;height: 50px;margin: 25px;" />
			</view>

		</scroll-view>
		<!-- 标题 -->
		<input v-model="title" type="text" placeholder="请输入标题" style="padding: 10px;margin: 20px 15px 5px 15px;display: block;">
		<view class="oneLine"></view>
		<textarea v-model="content" placeholder="请输入正文" style="padding: 10px;margin:10px 15px 5px 15px;display: block;line-height: 28px;width: calc(100% - 50px);"></textarea>
		<view class="oneLine"></view>
		<view class="">
			<view style="display: flex;padding: 10px 15px;position: relative;">
				<common-name-picker style="width:650rpx" :dataList="typeList" placeholder="关联娃物" @select="handleTypeSelect"></common-name-picker>
				<image src="../../static/right2.png" style="width: 20px; height: 20px;margin: 10px;position: absolute;right: 40rpx;" mode="aspectFill"></image>
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
					<image src="../../static/cancel.png" class="close_icon" @tap="deleteCollcation(index)" />
				</view>
			</view>
		</view>


		<common-modal v-model:visible="showSelectTab">
			<view class="selectTab" style="border: 1px sold #b2b0b4;padding-top: 60rpx;">
				<common-search mode="fill" @select="handleBrandSelect" width="calc(100vw - 120px)"></common-search>
				<view style="height: 30rpx;"></view>
				<custom-picker :dataList="goodsList" @select="handleGoodsSelect" margin="10px 0 0 0px"></custom-picker>
				<button @tap="saveCollocation" style="margin-top: 20px;background-color: #fff;">确认</button>
			</view>
		</common-modal>


		<view class="footer">
			<button @click="submitForm">提交</button>
		</view>

	</common-page>
</template>

<script setup>
	import {
		ref
	} from 'vue';
	import {
		websiteUrl,
		image1Url,
		wechatSignLogin,
		getUserInfo,
		global,
		asyncGetUserInfo,
	} from "../../common/config.js";

	import {
		chooseImage,
		jumpToCroper,
		getQiniuToken,
		uploadImageToQiniu
	} from "../../common/image.js";
	
	//接受参数 propsGoodsId propsGoodsName propsBrandId propsBrandName如果是非空或非0，添加一条
	const props = defineProps(["goods_id", "goods_name", "brand_id", "brand_name", "type"])

	const uploadList = ref([]);
	const goodsList = ref([
		// {"name":"aa", "id":1}
	]);
	const typeList = ref([]);
	const showSelectTab = ref(false);
	// 信息输入框临时信息
	const chooseBrandName = ref("")
	const chooseBrandId = ref(0)
	const chooseGoodsName = ref("")
	const chooseGoodsId = ref(0)
	const chooseType = ref("")
	
	//获取商品详情
	function getGoodsInfo(id) {
	  return new Promise((resolve, reject) => {
		uni.request({
		  url: websiteUrl + '/goods?id=' + id,
		  method: 'GET',
		  timeout: 5000,
		  success: (res) => {
			console.log(res.data.data);
			resolve(res.data);  // 请求成功，返回数据
		  },
		  fail: (err) => {
			console.log(err);
			uni.showToast({
			  title: '网络请求失败',
			  icon: 'none'
			})
			reject(err);  // 请求失败，抛出错误
		  },
		  complete: () => {
			uni.hideLoading()
		  }
		})
	  });
	}

	//存储的信息框内容列表
	const saveCollocationDataList = ref([])
	if (props.goods_id && props.goods_name && props.brand_id && props.brand_name && props.type) {
		getGoodsInfo(props.goods_id).then((res) => {
			// console.log(res.data)
			let data = {
				"brand_id": parseInt(props.brand_id, 10),
				"goods_id": parseInt(props.goods_id, 10) ,
				"brand_name": props.brand_name,
				"goods_name": props.goods_name,
				"goods_image": res.data.goods_images[0],
				"type": props.type
			}
			console.log(data)
			saveCollocationDataList.value.push(data)
		})

	}
	
	//表单信息
	const title = ref("")
	const content = ref("")

	function viewFullImage(index) {
		uni.previewImage({
			current: uploadList.value[index],
			urls: uploadList.value
		});
	}

	//选择图片
	function selectImage() {
		console.log("openSelect")
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
					//image1Url + tokenData.path;
					uploadList.value.push(image1Url + tokenData.path);

					uni.showToast({
						title: '上传成功',
						icon: 'success'
					})

				}) //uploadImageToQiniu
			}) //getQiniuToken
		}) //chooseImage
	}
	
	function addRelated() {}
	
	

	// 实现提交方法
	function submitForm() {
		const token = uni.getStorageSync('token');
		if (!token) {
			uni.showToast({
				title: '请先登录',
				icon: 'none'
			});
			return;
		}
		// 基本验证
		if (!title.value.trim() || !content.value.trim()) {
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


		// 构造请求数据
		const postData = {
			title: title.value,
			content: content.value,
			image_url_list: uploadList.value,
			relation_data_list: saveCollocationDataList.value.map(item => ({
				goods_id: item.goods_id,
				goods_name: item.goods_name,
				brand_id: item.brand_id,
				brand_name: item.brand_name,
				type: item.type
			}))
		};
		console.log(postData)

		uni.request({
			url: websiteUrl + '/with-state/add-collocation',
			method: 'POST',
			data: postData,
			header: {
				'Content-Type': 'application/json',
				'Authorization': token,
			},
			timeout: 5000,
			success: (res) => {
				if (res.data.code === 200) {
					uni.showToast({
						title: '提交成功'
					});
					// 清空表单
					title.value = '';
					content.value = '';
					uploadList.value = [];
					saveCollocationDataList.value = [];
					// 返回上一页
					uni.navigateBack();
				} else {
					uni.showToast({
						title: res.data.msg || '提交失败',
						icon: 'none'
					});
				}
			},
			fail: (err) => {
				console.log(err);
				uni.showToast({
					title: '网络请求失败',
					icon: 'none'
				});
			},
		});



	}

	// 父组件处理选择事件
	function handleBrandSelect(brandId, brandName) {
		console.log('收到品牌ID:', brandId);
		console.log('收到品牌Name:', brandName);
		chooseBrandId.value = parseInt(brandId, 10)
		chooseBrandName.value = brandName
		// 可以在此处更新表单数据等操作
		getGoods(brandId)
	};

	// Goods选择事件
	function handleGoodsSelect(id, name) {
		console.log('选中的 id:', id);
		console.log('选中的 name:', name);
		chooseGoodsId.value = parseInt(id, 10)
		chooseGoodsName.value = name
	}
	// Type选择事件
	function handleTypeSelect(value) {

		console.log('选中的值:', value)
		chooseType.value = value
		//显示弹窗
		showSelectTab.value = true
	}
	// 获取goods列表
	function getGoods(id) {
		// 请求 /goods-name-list 并赋值goodsList
		uni.request({
			url: websiteUrl + '/goods-name-list?id=' + id,
			method: 'GET',
			timeout: 5000,
			success: (res) => {
				console.log(res.data.data);
				goodsList.value = res.data.data
				console.log(goodsList.value)
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
		if (chooseBrandName.value == "" ) {
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
	getTypes()
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
	.saveCollocationDataList{
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
</style>