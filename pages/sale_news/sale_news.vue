<template>
	<view>
		<!-- 图片轮播区域 -->
		<view style="position: relative;">
			<swiper class="swiper-box" :indicator-dots="true" :autoplay="false">
				<swiper-item v-for="(img, index) in detailData.image_list" :key="index">
					<image :src="img" mode="aspectFill" class="swiper-image" @tap="viewFullImage(index)" />
				</swiper-item>
			</swiper>
		</view>

		<!-- 品牌信息区域 -->
		<view class="brand-info">
			<image class="brand-logo" :src="brand.logo" mode="aspectFill" />
			<view class="brand-details">
				<text class="brand-name">{{ brand.brand_name }}</text>
				<text class="publish-time">{{ formatTimestamp(detailData.created_at) }}</text>
			</view>

			
			<text class="follow"   @click="likeBrand" :style="{ background: hasLikeBrand ? '#ff6a6c' : '#65C3D6' }">{{ hasLikeBrand ? '已关注' : '+ 关注品牌' }}</text>
			
		</view>

		<!-- 图文信息区域 -->
		<view class="content-box">
			<view>
				<text class="title">{{ detailData.title }}</text>
			</view>
			<view style="margin: 20rpx 0rpx;">
				<text class="content">{{ detailData.content }}</text>
			</view>
		</view>

		<!-- 评论区（保留原有结构，需根据接口调整） -->
		<view style="padding: 10px;">
			<text
				style="color: rgb(100, 198, 220);font-weight: bold; isplay: block;margin: 30px 5px;display: block;">评论区
				({{comments.total || 0}})</text>
			<view>
				<view v-if="comments.comment_list">
					<view class="comment_item" v-for="(item,index) in comments.comment_list" :key="item.id"
						style="margin-bottom: 20px;">
						<view style="float: left; width: 80px;padding: 0px 10px 10px 0px;">
							<image style="width: 50px;height: 50px;border-radius: 100%;display: block;margin: 10px;"
								:src="item.avatar" mode="aspectFill"></image>
							<text
								style="display: block;white-space: nowrap;overflow: hidden;text-overflow: ellipsis; ">{{item.username}}</text>
						</view>
		
						<view
							style="float: left;padding: 15px 15px 30px 15px;background: rgb(245 245 245);width: calc(100vw - 170px);min-height: 60px;border-radius: 15px;position: relative;top:2px;">
							<!-- <text class="floor" style="position: absolute;top: -12px;right: 10px;color: #888;font-size: 20px;">#{{item.floor}}</text> -->
							<text
								style="width: 100%; white-space: normal;word-break: break-all;">{{item.comment}}</text>
		
							<!-- 格式化时间戳created_at为日期 -->
							<text
								style="color: #888;font-size: 12px;position: absolute;bottom: 3px;left: 15px;">{{formatTimestamp(item.created_at)}}
								floor#{{item.floor}}</text>
							<!-- 引用此回复 -->
							<text :style="[
								{ fontSize: '12px', position: 'absolute', bottom: '3px', right: '15px' ,fontWeight: '1000'},
								replyForItem.id === item.id ? { color: '#fd6669' } : { color: '#888' }
							  ]" @tap="replyFor(item)">
								引用此回复
							</text>
						</view>
						<view style="clear: both;"></view>
					</view>
					<button class="load_more" @click="getCollocationComments">加载更多</button>
				</view>
				<view v-else style="font-size: 12px;color: #888;margin: 20rpx 10rpx;">一片空地无人回复...</view>
			</view>
		</view>

		<!-- 加载状态 -->
		<view v-if="loading" class="loading">加载中...</view>
		<view v-if="error" class="error">{{ errorMsg }}</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onLoad } from "@dcloudio/uni-app";
import { websiteUrl, global, asyncGetUserInfo } from "../../common/config.js";

const detailData = ref({
    title: '',
    content: '',
    image_list: [],
    created_at: 0
})

const brand = ref({
    brand_name: '',
    logo: '',
    // 其他品牌信息字段
})

const loading = ref(true)
const error = ref(false)
const errorMsg = ref('')
const pageId = ref(0)
const brandId = ref(0)
const hasLikeBrand = ref(false)

const comments = ref({})

// 设置页面标题
uni.setNavigationBarTitle({ title: '图透详情' })

// 获取图透详情
const fetchNewsDetail = async (id) => {
    try {
        const res = await uni.request({
            url: `${websiteUrl}/sale-news-detail?id=${id}`,
            timeout: 5000
        })

        if (res.data.status === 'success') {
            detailData.value = {
                ...res.data.data,
                image_list: res.data.data.image_list || []
            }
            getBrandsInfo()
        } else {
            handleError(res.data.msg || '数据加载失败')
        }
    } catch (err) {
        handleError('网络请求失败')
    } finally {
        loading.value = false
    }
}

// 获取品牌信息
const getBrandsInfo = () => {
    uni.request({
        url: websiteUrl + '/brand-info?id=' + brandId.value,
        success: (res) => {
            if (res.data.status === 'success') {
                brand.value = res.data.data
                uni.setNavigationBarTitle({ title: res.data.data.brand_name })
                getHasLikeBrand()
            }
        },
        fail: () => handleError('品牌信息加载失败')
    })
}

// 品牌关注功能
const likeBrand = async () => {
    if (!global.isLogin) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        return
    }

    const url = `/with-state/${hasLikeBrand.value ? 'unlike' : 'add-like'}`
    uni.request({
        url: websiteUrl + url,
        method: 'POST',
        header: { Authorization: uni.getStorageSync('token') },
        data: {
            id:  parseInt( brandId.value),
            type: 2 // 假设2代表品牌类型
        },
        success: (res) => {
            if (res.data.status === 'success') {
                hasLikeBrand.value = !hasLikeBrand.value
                uni.showToast({
                    title: hasLikeBrand.value ? '关注成功' : '已取消关注',
                    icon: 'none'
                })
            }
        }
    })
}

// 检查关注状态
const getHasLikeBrand = () => {
    if (!global.isLogin) return
    
    uni.request({
        url: `${websiteUrl}/with-state/hasLike?id=${brandId.value}&type=2`,
        method: 'POST',
        header: { Authorization: uni.getStorageSync('token') },
        success: (res) => {
            hasLikeBrand.value = res.data.data?.id > 0
        }
    })
}

// 初始化加载
onLoad((options) => {
    if (!options.id || !options.brand_id) {
        handleError('缺少必要参数')
        return
    }
    pageId.value = options.id
    brandId.value = options.brand_id
    fetchNewsDetail(options.id)
    asyncGetUserInfo().then(getHasLikeBrand)
})
</script>

<style lang="less" scoped>
.swiper-box {
    height: 750rpx;
}

.swiper-image {
    width: 100%;
    height: 100%;
}

.brand-info {
    display: flex;
    align-items: center;
    padding: 30rpx;
    background: #fff;
    border-bottom: 1px solid #eee;

    .brand-logo {
        width: 80rpx;
        height: 80rpx;
        border-radius: 50%;
        margin-right: 20rpx;
    }

    .brand-details {
        flex: 1;
        
        .brand-name {
            font-size: 32rpx;
            font-weight: bold;
            display: block;
        }

        .publish-time {
            font-size: 24rpx;
            color: #888;
        }
    }

    .follow-btn {
        padding: 0 30rpx;
        height: 60rpx;
        line-height: 60rpx;
        font-size: 28rpx;
        border-radius: 30rpx;
        background: #f0f0f0;
        color: #666;
        
        &[class*='active'] {
            background: #64c6dc;
            color: #fff;
        }
    }
}

.content-box {
    padding: 30rpx;
    
    .title {
        font-size: 36rpx;
        font-weight: bold;
        margin-bottom: 20rpx;
    }

    .content {
        font-size: 28rpx;
        color: #666;
        line-height: 1.6;
    }
}

.loading, .error {
    text-align: center;
    padding: 40rpx;
    font-size: 28rpx;
    color: #999;
}

.follow {
	padding: 12rpx 30rpx;
    border-radius: 20rpx;
    overflow: hidden;
    display: inline-block;
    color: #ffffff;
    font-size: 11px;
	margin-left: 80rpx;
}
</style>
