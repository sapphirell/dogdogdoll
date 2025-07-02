<template>
	<view class="container">
		<view class="content">
			<view class="section">
				<text class="section-title">数据保护条款</text>
				<view class="permission-item">
					<text class="permission-text">严格禁止任何未经授权的的人工转载、复制或传播平台内容</text>
				</view>
				<view class="permission-item">
					<text class="permission-text">未经授权禁止使用爬虫工具获取平台数据</text>
				</view>
				<view class="permission-item">
					<text class="permission-text">所有用户生成内容均受版权保护，未经授权不得使用</text>
				</view>
				<view class="permission-item">
					<text class="permission-text">我们部署了反爬虫系统，实时监控数据访问行为</text>
				</view>
				<view class="permission-item">
					<text class="permission-text">我们保留对侵权行为采取法律手段的权利</text>
				</view>
			</view>
			<view class="section">
				<text class="section-title">用户行为规范与内容管理</text>
				<view class="permission-item">
					<text class="permission-text">
						您在使用本应用过程中所发布的任何文字、图片、音视频、评论等内容，均需遵守相关法律法规及本协议的约定，不得包含以下内容（包括但不限于）：
						淫秽、暴力、威胁、骚扰、辱骂、恐吓、恶意中伤他人；
						散布谣言、虚假信息、诈骗、钓鱼链接；
						仇恨言论、歧视性言论或可能引发社会不安的内容；
						其他违反法律法规、社会公序良俗或平台管理规范的内容。
					</text>
				</view>
				<view class="permission-item">
					<text class="permission-text">我们对不良内容和滥用行为采取“零容忍”政策，包括但不限于恶意骚扰、辱骂他人、发送垃圾内容、冒充他人等。一经发现，我们有权立即删除相关内容，并封禁发布者账号，且无需另行通知。</text>
				</view>
				<view class="permission-item">
					<text class="permission-text">用户可通过本应用提供的“举报”功能对不良信息进行举报，我们将在 24 小时内处理并视情况采取禁言、删除、封号等措施。</text>
				</view>
	
			</view>
			<view class="section">
				<text class="section-title">相机权限</text>
				<view class="permission-item">
					<text class="permission-text">• 用于扫描二维码、拍摄照片与上传图片</text>
				</view>
				<view class="permission-item">
					<text class="permission-text">• 仅在您主动使用拍照功能时申请</text>
				</view>
				<view class="permission-item">
					<text class="permission-text">• 不会在后台访问您的相机</text>
				</view>
			</view>

			<view class="section">
				<text class="section-title">位置权限</text>
				<view class="permission-item">
					<text class="permission-text">• 用于查找附近的娃店</text>
				</view>
				<view class="permission-item">
					<text class="permission-text">• 仅在您使用基于位置的服务时申请</text>
				</view>
				<view class="permission-item">
					<text class="permission-text">• 您可以随时在系统设置中关闭此权限</text>
				</view>
			</view>

			<view class="section">
				<text class="section-title">通知权限</text>
				<view class="permission-item">
					<text class="permission-text">• 用于接受BJD娃圈关注品牌的上新通知</text>
				</view>
				<view class="permission-item">
					<text class="permission-text">• 您可以自定义接收的通知类型</text>
				</view>
				<view class="permission-item">
					<text class="permission-text">• 可以在系统设置中随时关闭通知</text>
				</view>
			</view>

			<view class="section">
				<text class="section-title">存储权限</text>
				<view class="permission-item">
					<text class="permission-text">• 用于保存照片和下载内容</text>
				</view>
				<view class="permission-item">
					<text class="permission-text">• 用于缓存应用数据以提升加载速度</text>
				</view>
				<view class="permission-item">
					<text class="permission-text">• 不会访问您设备上的其他文件</text>
				</view>
			</view>

			<view class="section">
				<text class="section-title">设备信息</text>
				<view class="permission-item">
					<text class="permission-text">• 用于适配不同设备，提供更好的兼容性</text>
				</view>
				<view class="permission-item">
					<text class="permission-text">• 用于统计分析，改进产品质量</text>
				</view>
				<view class="permission-item">
					<text class="permission-text">• 收集的信息包括设备型号、操作系统版本等</text>
				</view>
			</view>
			


		</view>
	</view>
</template>

<script setup>
	import {
		onMounted
	} from 'vue';

	onMounted(() => {
		uni.setNavigationBarTitle({
			title: "用户协议"
		});
	});
</script>

<style lang="less">
	.container {
		padding: 20rpx;
		min-height: 100vh;
	}

	.header {
		padding: 40rpx 0;
		text-align: center;

		.title {
			font-size: 36rpx;
			font-weight: bold;
			color: #333;
		}
	}

	.content {
		padding: 0 10rpx;
	}

	.section {
		margin-bottom: 40rpx;

		.section-title {
			font-size: 26rpx;
			font-weight: bold;
			color: #333;
			display: block;
			margin-bottom: 20rpx;
			padding-bottom: 10rpx;
		}
	}

	.permission-item {
		margin-bottom: 15rpx;

		.permission-text {
			font-size: 28rpx;
			color: #555;
			line-height: 1.6;
		}
	}

	.important-note {
		margin-top: 40rpx;
		padding-top: 20rpx;
		border-top: 1rpx solid #e0e0e0;

		.note-title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
			display: block;
			margin-bottom: 20rpx;
		}
	}

	.contact-box {
		margin-top: 50rpx;
		padding-top: 20rpx;
		border-top: 1rpx solid #e0e0e0;
		text-align: center;

		.company-name {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
			display: block;
			margin-bottom: 25rpx;
		}

		.contact-info {
			margin-bottom: 15rpx;

			.contact-text {
				font-size: 28rpx;
				color: #666;
			}
		}
	}
</style>