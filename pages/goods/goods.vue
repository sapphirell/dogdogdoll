<template>
	<view v-if="goods.name" class="goods-detail-container">
		<meta name="theme-color" content="#F8F8F8">
		</meta>
		<view-logs />

		<!-- 轮播图部分 -->
		<view class="swiper-container">
			<view class="heart" @click="likeFn()">
				<uni-icons :type="hasLike ? 'heart-filled' : 'heart'" size="28" color="#ff4d4f"
					style="position: relative;top: 5rpx;"></uni-icons>
				<text class="num" style="color:#ff4d4f;">{{ formatNumber(goods.goods_like_count) }}</text>
			</view>

			<swiper :interval="3000" :duration="200" @change="onChange" class="banner-swiper"
				:style="{ height: swiperHeight + 'px', 'min-height': '200px', 'max-height': maxHeight + 'px' }">
				<block v-for="(item, key) in goods.goods_images" :key="key">
					<swiper-item class="swiper-item-container">
						<view class="swiper-item">
							<image :src="item" mode="widthFix" :class="'swiper-image-'+key" @tap="viewFullImage(key)"
								@load="onImageLoad(key)"></image>
						</view>
					</swiper-item>
				</block>
			</swiper>

			<view class="swiper-index">
				<text>{{swiperIndex}} / {{goods.goods_images.length}}</text>
			</view>
		</view>

		<!-- 商品基本信息 -->
		<view class="goods-info">
			<view class="action-buttons">
			  <button class="action-btn add-to-stock" @click="addToStock">
			    <view class="btn-content">
			      <uni-icons type="plus" size="18" color="#fff" style="height: 36rpx;margin-bottom: 10rpx;"></uni-icons>
			      <text>放入物品栏</text>
			    </view>
			  </button>
			  <button class="action-btn wish-resale" @click="wishResale">
			    <view class="btn-content">
			      <uni-icons type="star" size="18" color="#fff" style="height: 36rpx;margin-bottom: 10rpx;"></uni-icons>
			      <text>期望再贩</text>
			    </view>
			  </button>
			  <button class="action-btn add-showcase" @click="addToShowcase">
			    <view class="btn-content">
			      <uni-icons type="vip" size="18" color="#fff" style="height: 36rpx;margin-bottom: 10rpx;"></uni-icons>
			      <text>加入展示柜</text>
			    </view>
			  </button>
			</view>

			<view class="info-item">
				<text class="label">名称</text>
				<!-- <text class="value">{{goods.name}}</text> -->
				<image :src="goods.goods_name_image" mode="heightFix" class="img_info"></image>
			</view>
			<view class="info-item" @click="selectType(goods.type)">
				<text class="label">类型</text>
				<text class="value">{{goods.type}}</text>
			</view>


			<view class="info-item">
				<text class="label">初贩定价</text>
				<!-- <text class="value" v-if="goods.total_amount">{{goods.total_amount + " " + goods.currency}}</text> -->
				<image :src="goods.goods_price_image" v-if="goods.goods_price_image" mode="heightFix" class="img_info">
				</image>
				<text class="value" v-else-if="goods.goods_sales && goods.goods_sales.length > 0">
					{{goods.goods_sales[0].sub_amount + goods.goods_sales[0].fin_amount}}
					{{goods.goods_sales[0].currency}}
				</text>
				<text class="value" v-else>未知</text>
			</view>

			<view class="info-item">
				<text class="label">初贩时间</text>
				<text class="value">{{goods.sub_time1 > 0 ? formatTimestamp(goods.sub_time1) : "未知"}}</text>
			</view>

			<view class="info-item" @click="selectSize(goods.size)">
				<text class="label">尺寸</text>
				<text class="value">
					{{goods.size}} / {{goods.size_detail}}
				</text>
			</view>

			<view v-if="goods.type==='单体' || goods.type === '整体' || goods.type === '单头'" class="info-item">
				<text class="label">可选体型</text>
				<text class="value">
					{{goods.body_size || "未知"}}
				</text>
			</view>

			<view class="info-item">
				<text class="label">可选颜色</text>
				<text class="value">
					{{goods.skin}}
				</text>
			</view>

			<view class="info-item">
				<text class="label">制作方</text>

				<image @click="jumpBrand(goods.brand_id)" :src="goods.goods_brand_name_image"
					v-if="goods.goods_brand_name_image" mode="heightFix" class="img_info"
					style="background: rgb(169 231 255);padding: 0rpx 20rpx;"></image>

			</view>

			<view class="info-item">
				<text class="label">材质</text>

				<text class="value">
					{{goods.doll_material}}
				</text>

			</view>

			<view class="info-item">
				<text class="label">备注</text>
				<text class="value">
					{{goods.desc_content || '暂无备注信息'}}
				</text>
			</view>


		</view>

		<!-- 贩售情报 -->
		<view class="sales-info" v-if="goods.goods_sales && goods.goods_sales.length > 0">
			<text class="section-title">贩售情报</text>

			<view class="sales-list">
				<view v-for="(sale, index) in goods.goods_sales" :key="sale.id" class="sale-item">
					<view class="sale-header">
						<text class="sale-type">{{sale.sale_type}}</text>
						<text class="sale-price">{{sale.sub_amount + sale.fin_amount}} {{sale.currency}}</text>
					</view>

					<view class="sale-period">
						<text>{{formatTimestamp(sale.sub_time)}}</text>
						<text v-if="sale.sub_time_end > 0" class="separator">至</text>
						<text v-if="sale.sub_time_end > 0">{{formatTimestamp(sale.sub_time_end)}}</text>
						<text v-else class="separator">开定</text>
					</view>

					<view class="sale-size">
						<text>{{sale.size}} · {{sale.size_detail}}</text>
					</view>

					<!-- 新增尾款账单按钮 -->
					<view class="bill-action" @click="createBill(sale)">
						<uni-icons type="plus" size="16" color="#64c6dc"></uni-icons>
						<text>创建一个尾款账单</text>
					</view>
				</view>
			</view>
		</view>
		<view v-else class="no-sales">
			<text class="section-title">贩售情报</text>
			<text class="empty-text">暂无贩售信息</text>
		</view>

		<!-- 表态组件 -->
		<item-impression :target_id="props.goods_id" type="2" :goods-type="goods.type"></item-impression>

		<!-- 搭配参考 -->
		<view class="collocation-section">
			<view class="section-header">
				<text class="section-title">搭配参考</text>
				<view class="more-link" @tap="jump2collocation">
					<text>查看更多</text>
					<image src="../../static/right2.png"></image>
				</view>
			</view>

			<scroll-view scroll-x="true" class="collocation-list">
				<view v-for="collocation in collocationList.collocation_relation_list" :key="collocation.collocation_id"
					class="collocation-item"
					@tap="jump2collectionDetail(collocation.collocation_id, collocation.relation_origin)">
					<image :src="getImageForList(collocation.image_urls)" mode="aspectFill"></image>
				</view>
			</scroll-view>

			<view @tap="jump2collocation" class="upload-collocation">
				<text>返图帮助其它娃友?</text>
				<uni-icons type="upload" size="20" color="#ccc" style="margin-left: 10rpx;"></uni-icons>
			</view>
		</view>

		<!-- 评论区 -->
		<view class="comment-section">
			<comment-list ref="commentListRef" :type="2" :relation-id="parseInt(props.goods_id)"
				@reply="handleReplyComment" />
		</view>

		<!-- 输入框 -->
		<comment-input ref="commentInputRef" :reply-info="replyForItem" :target-id="props.goods_id"
			@submit="handleCommentSubmit" @update:reply-info="val => replyForItem = val" />

		<!-- 底部占位 -->
		<view class="bottom-placeholder"></view>
	</view>
</template>

<script setup>
	import {
		ref,
		watch,
		computed,

	} from 'vue';
	import {
		asyncGetUserInfo,
		getScene
	} from '../../common/config';

	import {
		onShow,
		onHide,
	} from "@dcloudio/uni-app";

	import {
		websiteUrl,
		wechatSignLogin,
		getUserInfo,
		global,
	} from "../../common/config.js";

	const props = defineProps(["goods_id"])

	// 获取系统信息
	const systemInfo = uni.getSystemInfoSync()
	const loading = ref(false) // 加载状态
	const error = ref(false) // 错误状态
	const errorMsg = ref('') // 错误信息

	// 回复
	const commentListRef = ref(null) // 必须与模板中的ref名称一致
	const commentInputRef = ref(null) // 输入框聚焦状态联动
	let commentsPage = ref(1)
	//引用回复
	let replyForItem = ref({})



	let goods = ref({})

	let swiperIndex = ref(1)

	//是否点赞过这个商品
	let hasLike = ref(false)
	//搭配参考列表
	let collocationList = ref(false)
	// 是否正在加载许愿状态
	let wishLoading = ref(false);
	// 在组件中新增的状态变量
	let hasWish = ref(false);
	let wishCount = ref(0);

	//轮播图高度
	const swiperHeight = ref(400); // 初始高度，根据需求调整
	const imageHeights = ref([]);

	const maxHeight = ref(uni.upx2px(1000)); // 将1000rpx转换为px单位


	// 引用回复
	const handleReplyComment = ({
		parent,
		target
	}) => {
		console.log("parent", parent)
		console.log("target", target)
		// 判断是回复的楼主还是楼内
		let item = parent
		if (target != null) {
			item = target
		}

		if (replyForItem.value.id == item.id) {
			replyForItem.value = {}
			return
		}
		console.log("item", item)
		replyForItem.value = item;
		// 聚焦输入框
		commentInputRef.value?.focusInput()
	}
	const handleCommentSubmit = ({
		content,
		replyInfo,
		origin
	}) => {
		let token = uni.getStorageSync('token');
		if (!global.isLogin) {
			uni.showToast({
				title: '请先登录',
				icon: 'none'
			})
			return
		}
		console.log("reply_info", replyInfo)
		const requestData = {
			content,
			origin,
			target_id: parseInt(props.goods_id),
			type: 2,
			...(replyInfo.id && {
				reply_id: replyInfo.id,
				reply_for: replyInfo.comment,
				reply_user_id: replyInfo.user_id,
				parent_id: replyInfo.parent_id > 0 ? replyInfo.parent_id : replyInfo.id,
			})
		}

		uni.request({
			url: websiteUrl + '/with-state/add-comment',
			method: 'POST',
			header: {
				'Authorization': token
			},
			data: requestData,
			success: (res) => {
				if (res.data.status == "success") {
					const newComment = res.data.data
					if (newComment.parent_id === 0) {
						// 主评论
						commentListRef.value?.addNewComment(newComment)
					} else {
						// 子评论
						commentListRef.value?.addReplyComment(newComment)
					}

					uni.showToast({
						title: '评论成功',
						icon: 'success'
					})

				} else {
					uni.showToast({
						title: res.data.msg,
						icon: 'none'
					})
				}
			},
			fail: (err) => {
				uni.showToast({
					title: '网络请求失败',
					icon: 'none'
				})
			}
		});
	}


	const onShareAppMessage = () => ({
		title: 'BJD娃圈你想知道的这里都有~',
		path: '/pages/news/news',
		success(res) {
			console.log('分享成功', res)
		},
		fail(err) {
			console.log('分享失败', err)
		},
		mp: {
			wxpath: '/pages/index/index.html'
		}
	})


	// 图片加载完成回调
	function onImageLoad(index) {
		console.log('图片加载完成', index);
		const query = uni.createSelectorQuery();
		setTimeout(() => {
			query.select(`.swiper-image-${index}`)
				.boundingClientRect(rect => {
					try {
						if (!rect) {
							console.warn('未找到图片元素');
							return;
						}
						console.log(rect)
						imageHeights.value[index] = rect.height;
						const validHeights = imageHeights.value.filter(h => h > 0);
						if (validHeights.length === 0) return;

						// 计算高度时加入上限限制
						const calculatedHeight = Math.max(...validHeights);
						swiperHeight.value = Math.min(calculatedHeight, maxHeight.value);
					} catch (e) {
						console.error('高度计算异常:', e);
					}
				}).exec();
		}, 20);
	}

	uni.showLoading({
		title: '加载中'
	})
	//跳转到品牌页
	function jumpBrand(id) {
		uni.navigateTo({
			url: '/pages/brand/brand?brand_id=' + id
		})
	}
	//滑动商品图片
	function onChange(e) {
		console.log(e.detail.current)
		swiperIndex.value = e.detail.current + 1
	}
	//获取商品详情
	function getGoods() {
		uni.request({
			url: websiteUrl + '/goods?id=' + props.goods_id,
			method: 'GET',
			timeout: 5000,
			success: (res) => {
				console.log(res.data.data);
				goods.value = res.data.data;
				// 获取祈愿状态
				getWishInfo();
			},
			fail: (err) => {
				console.log(err);
				uni.showToast({
					title: '网络请求失败',
					icon: 'none'
				})
			},
			complete: () => {
				uni.hideLoading()
			}
		})
	}
	//格式化数字
	function formatNumber(num) {
		if (num < 1000) {
			return num.toString();
		} else {
			const kValue = Math.floor(num / 1000);
			return `${kValue}k+`;
		}
	}
	//格式化时间戳
	function formatTimestamp(timestamp) {
		if (!timestamp || timestamp <= 0) return '未知'

		const date = new Date(timestamp * 1000);
		const year = date.getFullYear();
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const day = date.getDate().toString().padStart(2, '0');
		const hours = date.getHours().toString().padStart(2, '0');
		const minutes = date.getMinutes().toString().padStart(2, '0');

		return `${year}-${month}-${day} ${hours}:${minutes}`;
	}
	//replyFor 引用回复
	function replyFor(item) {
		//如果重复点击，清空
		if (replyForItem.value.id == item.id) {
			replyForItem.value = {}
			return
		}

		replyForItem.value = item;
	}



	//
	function likeFn() {
		let token = uni.getStorageSync('token');
		if (!global.isLogin) {
			uni.showToast({
				title: '请先登录',
				icon: 'none'
			})
			return
		}
		let requestData = {
			id: parseInt(props.goods_id),
			type: 1,
		}
		// 判断是请求点赞接口还是取消点赞接口 add-like unlike
		let url = hasLike.value ? '/with-state/unlike' : '/with-state/add-like';
		uni.request({
			url: websiteUrl + url,
			method: 'POST',
			header: {
				'Authorization': token,
			},
			data: requestData,
			success: (res) => {
				console.log(res.data);
				if (res.data.status == "success") {
					uni.showToast({
						title: '操作成功',
						icon: 'success'
					})
					hasLike.value = !hasLike.value
					getHasLike()
					getGoods()
					return
				} else {
					uni.showToast({
						title: res.data.msg,
						icon: 'none'
					})
					return
				}
			},
			fail: (err) => {
				console.log(err);
				uni.showToast({
					title: '网络请求失败',
					icon: 'none'
				})
			},
		});
	}
	//获取是否点赞
	function getHasLike() {
		let token = uni.getStorageSync('token');
		if (token == "") {
			return
		}

		uni.request({
			url: websiteUrl + '/with-state/hasLike?id=' + props.goods_id + '&type=1',
			method: 'POST',
			header: {
				'Authorization': token,
			},
			success: (res) => {
				console.log(res.data);
				if (res.data.status == "success") {
					// goods.value = res.data.data;
					if (res.data.data.id > 0) {
						hasLike.value = true
					} else {
						hasLike.value = false
					}

				} else {
					uni.showToast({
						title: res.data.msg,
						icon: 'none'
					})
					return
				}
			},
			fail: (err) => {
				console.log(err);
				uni.showToast({
					title: '网络请求失败',
					icon: 'none'
				})
			},
		});
	}

	//跳转到收藏上传页面，并携带商品参数和品牌参数
	function jump2collocation() {
		uni.navigateTo({
			url: '/pages/collocation/collocation?goods_id=' + props.goods_id + '&brand_id=' + goods.value
				.brand_id + '&goods_name=' + goods.value.name + '&brand_name=' + goods.value.brand_name +
				'&type=' + goods.value.type
		})
	}
	//跳转到收藏详情页面
	function jump2collectionDetail(collocation_id, origin) {
		uni.navigateTo({
			url: '/pages/collocation_share/collocation_share?collocation_id=' + collocation_id + '&origin=' +
				origin
		})
	}

	function addToShowcase() {
		if (!goods.value.id || !goods.value.name || !goods.value.brand_id || !goods.value.brand_name || !goods.value
			.type) {
			uni.showToast({
				title: '商品信息不完整',
				icon: 'none'
			});
			return;
		}



		const params = {
			goods_id: goods.value.id,
			goods_name: goods.value.name,
			brand_id: goods.value.brand_id,
			brand_name: goods.value.brand_name,
			type: goods.value.type
		};

		const query = Object.keys(params)
			.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
			.join('&');

		uni.navigateTo({
			url: `/pages/stock/showcase_form/showcase_form?${query}`
		});
	}
	// 选择类型跳转
	function selectType(type) {
	 //  if (!type || type === '未知') {
		// uni.showToast({
		//   title: '暂无类型信息',
		//   icon: 'none'
		// });
		// return;
	 //  }
	  
	 //  // 使用 switchTab 替代 navigateTo
	 //  uni.switchTab({
		// url: `/pages/collocation_square/collocation_square?type=${encodeURIComponent(type)}`
	 //  });
	}

	// 选择尺寸跳转
	function selectSize(size) {
	 //  if (!size || size === '未知') {
		// uni.showToast({
		//   title: '暂无尺寸信息',
		//   icon: 'none'
		// });
		// return;
	 //  }

	 //  const sizeValue = size.replace('分体', '')
		// .replace('分', '')
		// .replace('体', '')
		// .trim();

	 //  // 使用 switchTab 替代 navigateTo
	 //  uni.switchTab({
		// url: `/pages/collocation_square/collocation_square?size=${encodeURIComponent(sizeValue)}`
	 //  });
	}
	//获取搭配集合
	function getCollocation() {
		uni.request({
			url: websiteUrl + '/goods-collocation?goods_id=' + props.goods_id,
			method: 'GET',
			timeout: 5000,
			success: (res) => {
				console.log(res.data.data);
				collocationList.value = res.data.data;
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
	//getImageForList，传入一个以逗号分割的图片链接列表，截取返回第一个链接
	function getImageForList(urlList) {
		if (!urlList) {
			return '';
		}
		// 将urlList按逗号分割成数组
		let urls = urlList.split(',');

		// 返回第一个链接
		return urls[0].trim(); // 使用 trim() 去除前后空格
	}
	//viewFullImage
	function viewFullImage(index) {
		uni.previewImage({
			current: goods.value.goods_images['index'],
			urls: goods.value.goods_images
		})
	}
	//跳转到用户页面
	function jump2user(uid) {
		uni.navigateTo({
			url: '/pages/user_page/user_page?uid=' + uid
		})
	}

	//放入物品栏
	function addToStock() {
		uni.navigateTo({
			url: `/pages/stock/account_book_form/account_book_form?goods_id=${props.goods_id}`
		});
	}


	// 创建尾款账单
	function createBill(sale) {
		const params = {
			amount: sale.fin_amount,
			currency: sale.currency,
			name: goods.value.name,
			sale_id: sale.id
		}

		// 编码参数
		const query = Object.keys(params)
			.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
			.join('&');

		uni.navigateTo({
			url: `/pages/stock/bill_form/bill_form?${query}`
		});
	}
	
	// 期望再贩功能
	function wishResale() {
	  if (wishLoading.value) return;
	  
	  let token = uni.getStorageSync('token');
	  if (!global.isLogin) {
	    uni.showToast({
	      title: '请先登录',
	      icon: 'none'
	    });
	    return;
	  }
	  
	  wishLoading.value = true;
	  
	  uni.request({
	    url: websiteUrl + '/with-state/wish-restock',
	    method: 'POST',
	    header: {
	      'Authorization': token,
	      'Content-Type': 'application/json'
	    },
	    data: {
	      goods_id: parseInt(props.goods_id)
	    },
	    success: (res) => {
	      if (res.data.status === "success") {
	        uni.showToast({
	          title: '许愿成功',
	          icon: 'success'
	        });
	        
	        // 更新UI状态
	        hasWish.value = true;
	        wishCount.value = res.data.data.wish_count || wishCount.value + 1;
	      } else {
	        uni.showToast({
	          title: res.data.msg || '许愿失败',
	          icon: 'none'
	        });
	      }
	    },
	    fail: (err) => {
	      console.error('许愿请求失败:', err);
	      uni.showToast({
	        title: '网络请求失败',
	        icon: 'none'
	      });
	    },
	    complete: () => {
	      wishLoading.value = false;
	    }
	  });
	}
	
	// 获取许愿信息
	function getWishInfo() {
	  let token = uni.getStorageSync('token');
	  
	  uni.request({
	    url: websiteUrl + '/with-state/wish-info?goods_id=' + props.goods_id,
	    method: 'GET',
	    header: token ? { 'Authorization': token } : {},
	    success: (res) => {
	      if (res.data.status === "success") {
	        hasWish.value = res.data.data.user_has_wished;
	        wishCount.value = res.data.data.wish_count;
	      }
	    }
	  });
	}
	
	//加载商品
	getGoods();

	//加载搭配参考
	getCollocation()
	//获取登录
	asyncGetUserInfo().then((userInfo) => {
		console.log(userInfo)
		getHasLike()

	})
	// getUserInfo();
</script>

<style lang="scss" scoped>
	/* 整体字体调整 */
	.goods-detail-container {
		background-color: #f8f8f8;
		padding-bottom: 20px;
		font-size: 24rpx;
		/* 整体字体调小 */
	}

	/* 轮播图样式优化 */
	.swiper-container {
		position: relative;
		background-color: #fff;
		border-radius: 0 0 20rpx 20rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	}

	.heart {
		position: absolute;
		top: 20rpx;
		right: 30rpx;
		z-index: 10;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 70rpx;
		height: 70rpx;
		background: rgba(255, 255, 255, 0.8);
		border-radius: 50%;
		padding: 5rpx;



		.num {
			font-size: 20rpx;
			/* 调小 */
			font-weight: bold;
			margin-top: 5rpx;
			width: 100%;
			text-align: center;
		}
	}

	.banner-swiper {
		width: 100%;
	}

	.swiper-item-container {
		display: flex;
		justify-content: center;
		align-items: center;
		background: #ffffff;
		background-image: radial-gradient(#c6c6c6 15%, #00000000 0);
		background-size: 20rpx 20rpx;
	}

	.swiper-item {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
	}

	.swiper-index {
		position: absolute;
		bottom: 30rpx;
		right: 30rpx;
		background: rgba(0, 0, 0, 0.4);
		padding: 6rpx 20rpx;
		border-radius: 30rpx;
		color: #fff;
		font-size: 24rpx;
		/* 调小 */
	}

	/* 商品信息样式 */
	.goods-info {
		background: #fff;
		border-radius: 20rpx;
		margin: 20rpx;
		padding: 30rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

		.info-item {
			display: flex;
			padding: 18rpx 0;
			/* 调小内边距 */
			border-bottom: 1rpx solid #f5f5f5;

			&:last-child {
				border-bottom: none;
			}
		}

		.label {
			width: 180rpx;
			font-size: 26rpx;
			/* 调小 */
			color: #999;
			flex-shrink: 0;
		}

		.value {
			flex: 1;
			font-size: 26rpx;
			/* 调小 */
			color: #333;
			word-break: break-all;
		}

		.brand {
			color: #64c6dc;
			font-weight: bold;
		}
	}

	/* 贩售情报样式 */
	.sales-info,
	.no-sales {
		background: #fff;
		border-radius: 20rpx;
		margin: 20rpx;
		padding: 30rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

		.section-title {
			display: block;
			font-size: 28rpx;
			/* 调小 */
			font-weight: bold;
			color: #64c6dc;
			margin-bottom: 25rpx;
			/* 调小 */
			padding-left: 10rpx;
			border-left: 8rpx solid #64c6dc;
		}
	}

	.sales-list {
		.sale-item {
			padding: 20rpx 0;
			/* 调小 */
			border-bottom: 1rpx solid #f5f5f5;

			&:last-child {
				border-bottom: none;
			}
		}

		.sale-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 12rpx;
			/* 调小 */
		}

		.sale-type {
			font-size: 26rpx;
			/* 调小 */
			font-weight: bold;
			color: #333;
			background: #f0f9ff;
			padding: 5rpx 12rpx;
			/* 调小 */
			border-radius: 8rpx;
		}

		.sale-price {
			font-size: 26rpx;
			/* 调小 */
			font-weight: bold;
			color: #ff6b6b;
		}

		.sale-period {
			display: flex;
			align-items: center;
			font-size: 24rpx;
			/* 调小 */
			color: #666;
			margin-bottom: 12rpx;
			/* 调小 */

			.separator {
				margin: 0 12rpx;
				/* 调小 */
				color: #ccc;
			}
		}

		.sale-size {
			font-size: 24rpx;
			/* 调小 */
			color: #888;
		}
	}

	/* 尾款账单按钮样式 */
	.bill-action {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		margin-top: 15rpx;
		padding-top: 15rpx;
		border-top: 1rpx dashed #eee;

		text {
			font-size: 24rpx;
			color: #64c6dc;
			margin-left: 8rpx;
		}

		&:active {
			opacity: 0.7;
		}
	}

	/* 调整贩售情报项的内边距 */
	.sale-item {
		padding: 20rpx 0 15rpx;
		/* 底部减少内边距 */
	}

	.empty-text {
		font-size: 26rpx;
		/* 调小 */
		color: #999;
		text-align: center;
		padding: 30rpx 0;
		/* 调小 */
		display: block;
	}

	/* 搭配参考样式 */
	.collocation-section {
		background: #fff;
		border-radius: 20rpx;
		margin: 20rpx;
		padding: 30rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

		.section-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 25rpx;
			/* 调小 */
		}

		.section-title {
			font-size: 28rpx;
			/* 调小 */
			font-weight: bold;
			color: #64c6dc;
			padding-left: 10rpx;
			border-left: 8rpx solid #64c6dc;
		}

		.more-link {
			display: flex;
			align-items: center;
			color: #888;
			font-size: 24rpx;
			/* 调小 */

			image {
				width: 25rpx;
				/* 调小 */
				height: 25rpx;
				/* 调小 */
				margin-left: 8rpx;
				/* 调小 */
			}
		}

		.collocation-list {
			width: 100%;
			white-space: nowrap;
			margin-top: 15rpx;
			/* 调小 */
			padding: 8rpx 0;
			/* 调小 */
		}

		.collocation-item {
			display: inline-block;
			width: 200rpx;
			/* 调小 */
			height: 280rpx;
			/* 调小 */
			border-radius: 12rpx;
			overflow: hidden;
			margin-right: 18rpx;
			/* 调小 */
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);

			image {
				width: 100%;
				height: 100%;
			}
		}

		.upload-collocation {
			display: flex;
			align-items: center;
			justify-content: center;
			border: 1rpx solid #eaeaea;
			border-radius: 15rpx;
			padding: 18rpx;
			/* 调小 */
			margin-top: 25rpx;
			/* 调小 */

			image {
				width: 40rpx;
				/* 调小 */
				height: 40rpx;
				/* 调小 */
				margin-right: 12rpx;
				/* 调小 */
			}

			text {
				color: #b8b8b8;
				font-size: 24rpx;
				/* 调小 */
			}
		}
	}

	/* 评论区样式 */
	.comment-section {
		background: #fff;
		border-radius: 20rpx;
		margin: 20rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		font-size: 24rpx;
		/* 调小 */
	}

	/* 底部占位 */
	.bottom-placeholder {
		width: 100%;
		height: 120rpx
	}

	.img_info {
		height: 42rpx;
		position: relative;
		left: -5rpx;
	}

	.action-buttons {
		display: flex;
		gap: 15rpx;
		/* 进一步减少间距 */
		padding: 0;
		margin: 20rpx 0 30rpx;
		/* 调整上下边距 */
		justify-content: space-between;
		/* 均匀分布 */
	}

	.action-btn {
		  /* 添加这行解决按钮高度问题 */
		  line-height: normal !important;
		flex: 1;
		/* 等宽分布 */
		height: 100rpx;
		/* 增加高度 */
		display: flex;
		flex-direction: column;
		/* 垂直排列 */
		align-items: center;
		justify-content: center;
		gap: 8rpx;
		/* 图标文字间距 */
		border-radius: 16rpx;
		font-size: 24rpx;
		/* 减小字体 */
		font-weight: 600;
		/* 加粗 */
		border: none;
		/* 移除边框 */
		transition: all 0.2s ease;
		position: relative;
		overflow: hidden;
		padding: 10rpx 0;
		/* 增加内边距 */
		box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.15);
		/* 增强阴影 */
		text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1);
		/* 文字阴影 */

		/* 移除伪元素边框 */
		&::before {
			content: none;
		}

		&:active {
			transform: scale(0.96);
			box-shadow: 0 3rpx 8rpx rgba(0, 0, 0, 0.15);
		}

		&::after {
			border: none;
			/* 移除默认边框 */
		}

		text {
			color: #fff;
			line-height: 1.2;
		}

		/* 图标样式 */
		.uni-icons {
			filter: drop-shadow(0 1rpx 2rpx rgba(0, 0, 0, 0.2));
			/* 图标阴影 */
		}
	}
	/* 新增的按钮内容容器 */
	.btn-content {
	  display: flex;
	  flex-direction: column;
	  align-items: center;
	  justify-content: center;
	  height: 100%;
	}

	/* 糖果配色方案 */
	.add-to-stock {
		background: linear-gradient(135deg, #64c6dc, #4aa5c0);
		box-shadow: 0 6rpx 16rpx rgba(74, 165, 192, 0.3);
	}

	.wish-resale {
		background: linear-gradient(135deg, #ff9a9e, #f78ca0);
		box-shadow: 0 6rpx 16rpx rgba(247, 140, 160, 0.3);
	}

	.add-showcase {
		background: linear-gradient(135deg, #a18cd1, #fbc2eb);
		box-shadow: 0 6rpx 16rpx rgba(161, 140, 209, 0.3);
	}

	/* 调整商品信息间距 */
	.goods-info {
		margin-bottom: 10rpx;

		.info-item:first-child {
			padding-top: 10rpx;
			/* 第一个信息项顶部留空 */
		}
	}

	/* 确保按钮与上方内容有间距 */
	.swiper-container {
		margin-bottom: 0;
	}
</style>