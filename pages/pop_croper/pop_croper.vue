<template>
  <view-logs />
<view class="container">
		<!-- <image v-if="dist" :src="dist" class="dist" mode="widthFix"></image> -->
		<uni-popup ref="pop">
			<view class="content">
				<!-- <view @click="close" class="close">X</view> -->
				<bt-cropper ref="cropper" :imageSrc="imageSrc" :mask="mask" :ratio="ratio" :initPosition="initPosition"
					:dWidth="800" fileType="png" :containerSize="containerSize" @change="onChange"></bt-cropper>
				<view class="btns">
					<!-- <button class="button" @click="change">换张图</button> -->
					<button class="button" @click="crop">裁剪</button>
					<button class="button" @click="undo">撤销</button>
					<!-- <button class="button" @click="resume">重做</button> -->
				</view>
			</view>
		</uni-popup>
		<!-- <button @click="openPopup">打开编辑器</button> -->
	</view>
</template>

<script>
	export default {
		data() {
			return {
				imageSrc: '',
				// mask: "https://vkceyugu.cdn.bspapp.com/VKCEYUGU-a3b890b4-7cb2-4b29-aa78-e652572bdef6/d6bc69ee-cdc0-4a13-a744-d79db42e0dbe.png",
				dist: '',
				mask: "",
				ratio: 1,
				// 如果在弹窗中使用，必须手动指定裁剪器的大小
				containerSize: {
					width: 600,
					height: 600
				},
				// 保存操作后的状态以供下次编辑
				initPosition: null
			};
		},
		onLoad(options) {
		    this.imageSrc = decodeURIComponent(options.src)
		    console.log(this.imageSrc)
		    
		    // 在onLoad中调用打开弹窗的方法
		    this.$nextTick(() => {
		        this.openPopup();
		    });
		},
		onPullDownRefresh() {
			// 阻止下拉刷新
			uni.stopPullDownRefresh();
		},
		methods: {
			openPopup() {
				this.$refs.pop.open();
			},
			change() {
				uni.chooseImage({
					count: 1,
					sizeType: ['original'],
					success: res => {
						let tempFilePaths = res.tempFilePaths[0];
						this.src = tempFilePaths;
						this.initPosition = null;
					}
				});
			},
			close() {
				this.$refs.pop.close();
			},
			onChange(ev) {
				this.initPosition = ev;
			},
			// 撤销
			undo() {
				this.$refs.cropper.undo();
			},
			// 重做
			resume() {
				this.$refs.cropper.resume();
			},
			crop() {
				this.$refs.cropper.crop().then(res => {
					this.dist = res;
					//返回
					const pages = getCurrentPages(); // 获取页面栈
					const parentPage = pages[pages.length - 2]; // 获取上一页面实例
					console.log(parentPage)
					// 将裁剪结果存到父页面的 `returnParam`
					parentPage.returnParam = res;
					// 携带参数 res 
					uni.navigateBack({
						delta: 1,
					});

				});

			}
		}
	};
</script>

<style lang="scss" scoped>

	.dist {
		width: 600rpx;
	}

	.content {
		background-color: #fff;
		padding: 20rpx;
		border-radius: 20rpx;
		position: relative;

		.title {
			font-size: 36rpx;
			font-weight: bold;
			text-align: center;
			margin-bottom: 20rpx;
		}

		.close {
			position: absolute;
			top: 0rpx;
			right: 0;
			padding: 20rpx;
		}
	}
	.button {
		margin: 20px;
		display: block;
	}
</style>