<template>
	<view class="container">
		<view-logs />
		<!-- 顶部天蓝色半圆背景 -->
		<view class="top-bg"></view>

		<!-- 添加按钮和描述 -->
		<view class="header">
			<button class="add-btn" @click="handleAddCollocation">添加您的搭配参考</button>
			<view class="description">
				<text class="hint">搭配参考可以帮助您的购买者快速知晓体型适配问题，优秀的搭配参考图会显著提升买家购买欲望。</text>
				<text class="hint">同时，您在搭配参考中发布的关联，将被推送到其它娃物词条下方，他人在购买其它娃物时，也会通过了解到您发布关联的搭配参考，导航到您的词条。</text>
			</view>
		</view>

		<!-- 搭配列表 -->
		<view class="collocation-list" v-if="collocationList.length > 0">
			<view class="collocation-item" v-for="item in collocationList" :key="item.relation_id">
				<!-- 标题和描述 -->
				<view class="item-header">
					<text class="title">{{ item.title }}</text>
					<text class="type-tag">{{ formatTime(item.created_at) }}</text>
				</view>
				<view class="content">{{ item.content }}</view>

				<!-- 图片横向滚动 -->
				<scroll-view class="image-scroll" scroll-x="true" style="width: 100%;">
				  <view class="image-wrapper">
				    <image 
				      v-for="(img, index) in item.imageList" 
				      :key="index" 
				      :src="img" 
				      mode="aspectFill"
				      class="collocation-image" 
				      @click="previewImage(item.imageList, index)" 
				      style="width: 300rpx; height: 300rpx; margin-right: 20rpx; flex-shrink: 0;"
				    />
				  </view>
				</scroll-view>
				<!-- 操作按钮 -->
				<!--  <view class="action-btns">
          <button class="btn" @click="goToPreview(item)">预览</button>
          <button class="btn"  @click="handleEdit(item)">编辑</button>
          <button class="btn"  @click="handleDelete(item)">删除</button>
        </view>
		 -->
				<view class="action-buttons-single-row">
					<button class="btn preview" @click="goToPreview(item.collocation_id)">
						<uni-icons type="eye" size="14" color="#3a3a3a"></uni-icons>
						预览
					</button>
					<button class="btn edit" @click="handleEdit(item.collocation_id)">
						<uni-icons type="compose" size="14" color="#3a3a3a"></uni-icons>
						编辑
					</button>
					<button class="btn collocation" @click="handleDelete(item)">
						<uni-icons type="closeempty" size="14" color="#3a3a3a"></uni-icons>
						删除
					</button>

				</view>

				<!-- 分隔线 -->
				<view class="divider"></view>
			</view>
		</view>

		<!-- 空状态 -->
		<view class="empty-state" v-else>
			<image src="/static/empty.png" class="empty-img" />
			<text class="empty-text">暂无搭配参考</text>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { websiteUrl, global, asyncGetUserInfo } from '@/common/config.js'

const goodsId = ref('')
const collocationList = ref([])
const loading = ref(true)
const goodsInfo = ref(null)

const fetchCollocations = async () => {
  if (!goodsId.value) {
    uni.showToast({ title: '商品ID缺失', icon: 'none' })
    return
  }
  try {
    loading.value = true
    const res = await uni.request({
      url: `${websiteUrl.value}/goods-collocation`,
      method: 'GET',
      data: { goods_id: goodsId.value, official: true }
    })
    if (res.data?.status === 'success') {
      const data = res.data.data || {}
      const list = data.collocation_relation_list || []
      collocationList.value = list.map(item => ({
        ...item,
        imageList: (item.image_urls || '')
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
      }))
    } else {
      throw new Error(res.data?.msg || '获取搭配数据失败')
    }
  } catch (err) {
    console.error('获取搭配数据失败:', err)
    uni.showToast({ title: err.message || '请求失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// 预览图片
const previewImage = (urls, index) => {
  uni.previewImage({ current: index, urls })
}

// 跳转到预览页面
const goToPreview = (collocationId) => {
  uni.navigateTo({
    url: `/pages/collocation_share/collocation_share?collocation_id=${encodeURIComponent(collocationId)}&origin=1`
  })
}

// 添加
const handleAddCollocation = async () => {
  if (!goodsInfo.value && goodsId.value) {
    try {
      const res = await uni.request({
        url: `${websiteUrl.value}/goods`,
        method: 'GET',
        data: { id: goodsId.value }
      })
      if (res.data?.status === 'success') {
        goodsInfo.value = res.data.data
      }
    } catch (e) {
      console.error('获取商品信息失败:', e)
    }
  }
  const queryParams = {
    goods_id: goodsId.value,
    ...(goodsInfo.value ? {
      brand_id: goodsInfo.value.brand_id,
      goods_name: goodsInfo.value.name,
      brand_name: goodsInfo.value.brand_name,
      type: goodsInfo.value.type
    } : {})
  }
  const queryString = Object.entries(queryParams)
    .map(([k, v]) => `${k}=${(v ?? '')}`)
    .join('&')
  uni.navigateTo({ url: `/pages/collocation/collocation?${queryString}` })
}

// 编辑
const handleEdit = (collocationId) => {
  uni.navigateTo({
    url: `/pages/collocation/collocation?collocation_id=${encodeURIComponent(collocationId)}`
  })
}

// 删除
const handleDelete = (item) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个搭配参考吗？',
    success: async (r) => {
      if (!r.confirm) return
      try {
        const token = uni.getStorageSync('token')
        const res = await uni.request({
          url: `${websiteUrl.value}/with-state/delete-collocation?collocation_id=${encodeURIComponent(item.collocation_id)}`,
          method: 'POST',
          header: { Authorization: token },
          data: { collocation_id: item.collocation_id }
        })
        if (res.data?.status === 'success') {
          uni.showToast({ title: '删除成功' })
          fetchCollocations()
        } else {
          throw new Error(res.data?.msg || '删除失败')
        }
      } catch (e) {
        uni.showToast({ title: e.message || '删除失败', icon: 'none' })
      }
    }
  })
}

const pad2 = (n) => String(n).padStart(2, '0')
const formatTime = (timestamp) => {
  const d = new Date((Number(timestamp) || 0) * 1000)
  const M = pad2(d.getMonth() + 1)
  const D = pad2(d.getDate())
  const h = pad2(d.getHours())
  const m = pad2(d.getMinutes())
  return `${M}-${D} ${h}:${m}`
}

// 入口：用 onLoad 拿到路由参数（跨 H5/小程序/App 通用）
onLoad(async (options) => {
  uni.setNavigationBarTitle({ title: '官方搭配管理' })
  goodsId.value = options?.goods_id || ''
  if (!global.isLogin) {
    await asyncGetUserInfo()
  }
  fetchCollocations()
})
</script>


<style lang="less" scoped>
	.container {
		position: relative;
		padding: 20rpx;
		min-height: 100vh;
		background-color: #f8f8f8;
	}

	.top-bg {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 300rpx;
		border-bottom-left-radius: 50% 40%;
		border-bottom-right-radius: 50% 40%;
		z-index: 0;
	}

	.header {
		position: relative;
		z-index: 1;
		margin-bottom: 30rpx;

		.add-btn {
			// background: linear-gradient(135deg, #a6e9f7, #1ed1e1);
			background-color: #81D8cf;
			color: #fff6e1;
			line-height: 80rpx;
			border-radius: 20rpx;
			font-size: 26rpx;
			font-weight: 1000;
			margin: 30rpx 0;

			&::after {
				border: none;
			}

			&::after {
				border: none !important;
			}
		}

		.description {
			color: #888;
			font-size: 26rpx;
			line-height: 1.6;
			background-color: rgba(255, 255, 255, 0.8);
			padding: 20rpx;
			border-radius: 12rpx;
		}
	}

	.collocation-list {
		position: relative;
		z-index: 1;
	}

	.collocation-item {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

		.item-header {
			display: flex;
			align-items: center;
			margin-bottom: 20rpx;

			.title {
				font-size: 32rpx;
				font-weight: bold;
				color: #333;
			}

			.type-tag {
				margin-left: 20rpx;
				padding: 4rpx 12rpx;
		    background-color: #81D8cf;
		    color: #fff6e1;
				border-radius: 8rpx;
				font-size: 24rpx;
			}
		}

		.content {
			font-size: 28rpx;
			color: #666;
			line-height: 1.5;
			margin-bottom: 30rpx;
		}

		.image-scroll {
			  width: 100%;
			  white-space: nowrap; // 确保内容不换行
			  overflow-x: auto;   // 允许横向滚动
			  -webkit-overflow-scrolling: touch; // 平滑滚动
			.image-wrapper {
			  display: flex;      // 使用flex布局
			  flex-wrap: nowrap;  // 确保图片不换行
			  padding: 10rpx 0;   // 添加垂直内边距
			}

			.collocation-image {
				width: 300rpx;
				height: 300rpx;
				border-radius: 12rpx;
				margin-right: 20rpx;
				background-color: #f0f0f0;
			}
		}

		.action-btns {
			display: flex;
			justify-content: space-between;

			button {
				flex: 1;
				height: 70rpx;
				line-height: 70rpx;
				font-size: 28rpx;
				margin: 0 10rpx;
				border-radius: 8rpx;
			}

			.preview-btn {
				background-color: #4a90e2;
				color: white;
			}

			.edit-btn {
				background-color: #f0f0f0;
				color: #666;
			}

			.delete-btn {
				background-color: #ff4d4f;
				color: white;
			}
		}

		.divider {
			height: 2rpx;
			background-color: #eee;
			margin-top: 30rpx;
		}
	}

	.action-buttons-single-row {
		display: flex;
		justify-content: space-between;
		padding: 0 20rpx 20rpx;
		margin-top: 10rpx;
		gap: 15rpx;

		.btn {
			flex: 1;
			height: 70rpx;
			line-height: 70rpx;
			font-size: 22rpx;
			border-radius: 10rpx;
			margin: 0 4rpx;
			padding: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			transition: all 0.2s ease;
			box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.08);


			&:active {
				opacity: 0.85;
				transform: scale(0.95);
				box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
			}

			&:after {
				border: none;
			}

			/* 低饱和糖果色按钮 */
			&.preview {
				// background: linear-gradient(135deg, #A8E6CF, #8ED2C8);
				color: #3a3a3a;
			}

			&.edit {
				// background: linear-gradient(135deg, #FFD3B6, #FFAAA5);
				color: #3a3a3a;
			}

			&.collocation {
				// background: linear-gradient(135deg, #B5C6E0, #9FB8E4);
				color: #3a3a3a;
			}

			&.sales {
				// background: linear-gradient(135deg, #FFB7D5, #FF9EC1);
				color: #3a3a3a;
			}

			.uni-icons {
				margin-right: 6rpx;
			}
		}
	}

	.hint {
		display: block;
		font-size: 24rpx;
		color: #999;
		margin: 16rpx 0;
		letter-spacing: 1rpx;
	}


	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding-top: 100rpx;

		.empty-img {
			width: 300rpx;
			height: 300rpx;
			opacity: 0.6;
		}

		.empty-text {
			font-size: 32rpx;
			color: #999;
			margin: 30rpx 0;
		}

		.empty-btn {
			width: 60%;
			background-color: #4a90e2;
			color: white;
			font-size: 30rpx;
			height: 80rpx;
			line-height: 80rpx;
			border-radius: 40rpx;
		}
	}
</style>