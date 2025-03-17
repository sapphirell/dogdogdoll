<template>
	<view style="padding: 15px;">
		<!-- 展示柜 -->
		<view>
			<text>展示柜名称</text>
			<input class="inputer" type="text" placeholder="名称" v-model="name" />
		</view>

		<view>
			<text>展示柜描述</text>
			<textarea class="inputer" placeholder="描述" v-model="description"></textarea>
		</view>

		<view>
			<text>展示柜图片</text>
			<input class="inputer" type="text" placeholder="图片URL" v-model="image_url" />
			<view v-if="image_url">
				<image mode="aspectFill" :src="image_url"></image>
			</view>
			<button class="" @click="selectImage">选择图片</button>
		</view>

		<button class="light_button" @click="postSubmit">提交</button>
	</view>
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
	} from "../../../common/config.js";
	import {
		chooseImage,
		jumpToCroper,
		getQiniuToken,
		uploadImageToQiniu
	} from "../../../common/image.js";

	const props = defineProps(["showcase_id"]);
	const isEdit = props.showcase_id ? true : false;

	const name = ref("");
	const description = ref("");
	const image_url = ref("");

	// 获取展示柜详情
	function getShowcaseById(id) {
		let token = uni.getStorageSync('token');
		uni.request({
			url: websiteUrl + '/with-state/showcase-detail',
			method: 'GET',
			header: {
				'Authorization': token
			},
			data: {
				id: id
			},
			success: (res) => {
				name.value = res.data.data.name;
				description.value = res.data.data.description;
				image_url.value = res.data.data.image_url;
			},
			fail: (err) => {
				console.log(err);
			}
		});
	}

	// 选择图片
	function selectImage() {
		chooseImage().then((res) => {
			getQiniuToken().then((tokenData) => {
				uploadImageToQiniu(res, tokenData.token, tokenData.path).then((uploadRes) => {
					if (uploadRes.statusCode != 200) {
						uni.showToast({
							title: '上传失败',
							icon: 'none'
						});
					}
					image_url.value = image1Url + tokenData.path;
					uni.showToast({
						title: '上传成功',
						icon: 'success'
					});
				});
			});
		});
	}

	// 页面加载时，判断是编辑还是新增
	if (isEdit) {
		getShowcaseById(props.showcase_id);
		uni.setNavigationBarTitle({
			title: '编辑展示柜'
		});
	} else {
		uni.setNavigationBarTitle({
			title: '新增展示柜'
		});
	}

	// 提交表单
	function postSubmit() {
		if (isEdit) {
			updateShowcase();
		} else {
			addShowcase();
		}
	}

	// 新增展示柜
	function addShowcase() {
		let postData = {
			name: name.value,
			description: description.value,
			image_url: image_url.value
		};

		uni.request({
			url: websiteUrl + '/with-state/add-showcase',
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
			},
		});
	}

	// 修改展示柜
	function updateShowcase() {
		let postData = {
			id: parseInt(props.showcase_id, 10),
			name: name.value,
			description: description.value,
			image_url: image_url.value
		};

		uni.request({
			url: websiteUrl + '/with-state/update-showcase',
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
			},
		});
	}
</script>

<style lang="scss">
	.container {
		background-color: #f8f8f8;
	}

	.light_button {
		color: #fff;
		background: #65C3D6;
		box-shadow: 0 0 3px #1ed1e1;
		border: 0px;
		margin: 20px 0px;
		border-radius: 15px;
	}

	.light_button:active {
		background: #4e98a9;
	}

	.inputer {
		font-size: 20px;
		border-bottom: 1px #ddd solid;
		padding: 10px;
		margin: 40px 0px;
	}

	textarea.inputer {
		height: 120px;
		resize: none;
	}
</style>