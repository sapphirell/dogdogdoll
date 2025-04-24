<template>
	<view>
		<image :src="brand.logo_image" mode="aspectFit" class="brand_logo"></image>
		<view class="body">
			<view>
				<text style="float: left;font-size: 20px;" selectable="true" user-select="true">{{brand.brand_name}}</text>
				<text style="float: right;margin: 5px 0px;">{{brand.country_name}} / {{brand.type}}</text>
				<view style="clear: both;"></view>
			</view>
			
			<view style="margin: 20rpx 0rpx;display: flex;justify-content: space-between;">
				<view  @click="openRate(1)" style="display: inline-block;position: relative;left: -8rpx;">
					<uni-rate style="margin-top: 5px;float: left;" :value="brand.score" allow-half="true" disabled-color="rgb(255 157 219)"/>
					<text style="float: left;position: relative;top: 5px;">{{brand.score}}（{{brand.vote_number}}次评分）</text>
					<view style="clear: both;"></view>
				</view>
				<text class="follow"   @click="likeBrand" :style="{ background: hasLikeBrand ? '#ff6a6c' : '#65C3D6' }">{{ hasLikeBrand ? '已关注' : '+ 关注品牌' }}</text>
				
			</view>
			<view style="margin-top: 15px;">
				<text>别名：{{brand.nickname_list}}</text>
			</view>
			<view style="margin-top: 10px;">
				<text>简介：{{brand.description}}</text>
			</view>
			<div style="clear: both;"></div>
			<!-- 品牌商品列表 -->
			<text style="color: rgb(100, 198, 220);display: block;margin: 20px 0px;">收录作品 ({{goods.total}})</text>
			<view class="brand_goods">
				<view class="brand_goods_item" style="" v-for="(item, index) in goods.goods_list" :key="item.id">
					<navigator @click="jumpGoods(item.id)" style="width: 100%;height: 100%;">
						<view style="width: 100%;height: calc(100% - 20px)">
							<image style="width: 100%;height: 100%;" :src="item.goods_images[0]" mode="aspectFill" class="brand_goods_image"></image>
						</view>
						<text style="display: block;width: 100%;text-align: center;font-weight: 900;color: #586f88">{{item.name}}</text>
					</navigator>
				</view>
			</view>
			<button class="load_more" @click="getBrandGoods">加载更多</button>
			<view>
				<text style="color: rgb(100, 198, 220);display: block;margin: 20px 0px;">讨论 ({{comments.total}})</text>
				<view v-if="comments.comment_list">
					<view class="comment_item" v-for="(item,index) in comments.comment_list" :key="item.id" style="margin-bottom: 20px;">
						<view style="float: left; width: 80px;padding: 0px 10px 10px 0px;" @tap="jump2user(item.uid)">
							<image style="width: 50px;height: 50px;border-radius: 100%;display: block;margin: 10px;" :src="item.avatar" mode="aspectFill"></image>
							<text style="display: block;white-space: nowrap;overflow: hidden;text-overflow: ellipsis; ">{{item.username}}</text>
						</view>
			
						<view style="float: left;padding: 15px 15px 30px 15px;background: rgb(245 245 245);width: calc(100vw - 170px);min-height: 60px;border-radius: 15px;position: relative;top:2px;">
							<!-- <text class="floor" style="position: absolute;top: -12px;right: 10px;color: #888;font-size: 20px;">#{{item.floor}}</text> -->
							<text style="width: 100%; white-space: normal;word-break: break-all;">{{item.comment}}</text>
						
							<!-- 格式化时间戳created_at为日期 -->
							<text style="color: #888;font-size: 12px;position: absolute;bottom: 3px;left: 15px;">{{formatTimestamp(item.created_at)}} floor#{{item.floor}}</text>
						</view>
						<view style="clear: both;"></view>
					</view>
					<button class="load_more" @click="getBrandComments">加载更多</button>
				</view>
			</view>
			
		</view>
		<!-- 一个不可见透明元素，撑起80px高度 -->
		<view style="height: 80px;"></view>
		<!-- 评分悬浮窗 -->
		<view class="modal_shadow" :class="{ none: !activeModal }" @tap="openRate(2)">
			<view class="modal_box">
				<view>
					<text style="font-size: 25px;color:#7b6d6d;width: 100%;text-align: center;margin-bottom: 13px;display: block;">您的评分 {{rateValue}}</text>
					<uni-rate v-model="rateValue"  allow-half="true"  style="margin-top: 5px;float: left;" size="45"/>
					<!-- <text style="float: left;margin-left: 20px;position: relative;top: 5px;">触摸评分</text> -->
				</view>
				
				<view style="clear: both;"></view>
				<button style="display: block; width: 100px; position: absolute;bottom: 0px;right: 20px;" class="light_button"  @click="voteScoreProxy">
					<text style="color: #fff;">提交</text>
				</button>
			</view>
			
		</view>

		<!-- 当输入框聚焦后显示的蒙版层 -->
		<view class="mask" v-show=displayMask  @tap="handleMaskTap" ></view>

		<view class="bottom_tab" :style="{ paddingBottom : footerBottomHeight }">
			<!-- 输入框 -->
			<textarea class="comment_input" v-model="comment" style="" :adjust-position="false"  @click="handleFocus" @focus="handleFocus" @blur="handleBlur" ></textarea>

			<!-- 按钮 -->
			<button style="flex-shrink: 0; width: 90px;" @click="addComments">写评论</button>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		watch,
		computed,

	} from 'vue';
	import {
		websiteUrl,
		wechatSignLogin,
		getUserInfo, 
		global, 
		voteScore,
		getScene,
	} from "../../common/config.js";
	import {
		onShow,
		onHide,
	} from "@dcloudio/uni-app";

	
	const props = defineProps(["brand_id"])
	console.log(props)
	
	const hasLikeBrand = ref(false)
	

	uni.showLoading({
		title: '加载中'
	})
	
	
	// 获取系统信息
	const systemInfo = uni.getSystemInfoSync()
	const keyboardHeight = ref(0)
	
	// 蒙版层
	const displayMask = ref(false)
	
	function handleFocus() {
	  displayMask.value = true;
	}
	
	function handleBlur() {
	  displayMask.value = false;
	}
	
	// 点击蒙版关闭键盘
	const handleMaskTap = () => {
	  displayMask.value = false;
	  uni.hideKeyboard(); // 调用API关闭键盘
	};
	
	
	// 处理键盘高度变化
	const keyboardHeightChangeHandler = (res) => {
		console.log(res)
		keyboardHeight.value = res.height
	}
	
	// 生命周期
	onShow(() => {
		if (process.env.VUE_APP_PLATFORM == "h5") {
			//h5不会弹出软键盘
			return
		}
		uni.onKeyboardHeightChange(keyboardHeightChangeHandler)
	})

	onHide(() => {
		if (process.env.VUE_APP_PLATFORM == "h5") {
			//h5不会弹出软键盘
			return
		}
		uni.offKeyboardHeightChange?.(keyboardHeightChangeHandler) // 更精准的卸载
	})
	
	// 底部安全区域高度
	const footerBottomHeight = computed(() => {
		// 通过系统信息获取安全区域值
		let safeBottom = systemInfo.safeAreaInsets?.bottom || 10
		if (keyboardHeight.value > 0) {
			safeBottom += keyboardHeight.value
		}
		let bottom = `${safeBottom}px` // 直接返回计算后的像素值
		console.log("footer-brand:" + bottom)
		return bottom
	})
	
	
	
	let comment = ref('')
	let rateValue = ref(0)
	
	//是否打开弹窗
	let activeModal = ref(false)
	
	function voteScoreProxy() {
		if (rateValue.value == 0) {
			uni.showToast({
				title: '请先评分',
				icon: 'none'
			})
			return
		}
		if (rateValue.value > 5) {
			uni.showToast({
				title: '评分不能大于5',
				icon: 'none'
			})
			return
		}
		
		console.log(rateValue.value, props.brand_id)
		voteScore(1, rateValue.value, props.brand_id)
	
	}

	function getBrandsInfo() {
		uni.request({
			url: websiteUrl + '/brand-info?id=' + props.brand_id ,
			method: 'GET',
			timeout: 5000,
			success: (res) => {
				console.log(res.data.data);
				brand.value = res.data.data;
				//修改页面标题
				uni.setNavigationBarTitle({
					title: res.data.data.brand_name
				})
				 getHasLikeBrand() // 新增检查关注状态
		
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
	
	// 品牌关注方法
	const likeBrand = async () => {
	    let token = uni.getStorageSync('token')
	    if (!global.isLogin) {
	        uni.showToast({ title: '请先登录', icon: 'none' })
	        return
	    }
	    
	    try {
	        const url = `${websiteUrl}/with-state/${hasLikeBrand.value ? 'unlike' : 'add-like'}`
	        const res = await uni.request({
	            url,
	            method: 'POST',
	            header: { Authorization: token },
	            data: {
	                id: parseInt(props.brand_id),
	                type: 2 // 注意：品牌类型可能需要确认，这里假设2代表品牌
	            }
	        })
	
	        if (res.data.status === "success") {
	            hasLikeBrand.value = !hasLikeBrand.value
	            uni.showToast({ title: hasLikeBrand.value ? '关注成功' : '已取消关注', icon: 'none' })
	            // 更新品牌信息
	            getBrandsInfo()
	        } else {
	            uni.showToast({ title: res.data.msg, icon: 'none' })
	        }
	    } catch (err) {
	        console.error(err)
	        uni.showToast({ title: '操作失败', icon: 'none' })
	    }
	}
	
	// 检查是否已关注
	const getHasLikeBrand = async () => {
	    
	    try {
	        const res = await uni.request({
	            url: `${websiteUrl}/with-state/hasLike?id=${parseInt(props.brand_id)}&type=2`,
	            method: 'POST',
	            header: { Authorization: uni.getStorageSync('token') },
	        })
	
	        hasLikeBrand.value = res.data.data?.id > 0
	    } catch (err) {
	        console.error('获取关注状态失败:', err)
	    }
	}

	//格式化时间戳
	function formatTimestamp(timestamp) {
	      const date = new Date(timestamp * 1000);
	      const year = date.getFullYear();
	      const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月份从0开始，需要+1
	      const day = date.getDate().toString().padStart(2, '0');
	      const hours = date.getHours().toString().padStart(2, '0');
	      const minutes = date.getMinutes().toString().padStart(2, '0');
	      const seconds = date.getSeconds().toString().padStart(2, '0');
	      
	      // 返回格式化后的日期时间
	      // return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
	      return `${year}-${month}-${day} ${hours}:${minutes}`;
	}
	function getBrandGoods() {
		uni.request({
			url: websiteUrl + '/brand-goods?brand_id=' + props.brand_id + "&page=" + page.value,
			method: 'GET',
			timeout: 5000,
			success: (res) => {
				console.log(res.data.data);
				goods.value.page_index = res.data.data.page_index;
				goods.value.total = res.data.data.total;
				goods.value.goods_list = goods.value.goods_list ? goods.value.goods_list.concat(res.data.data.goods_list) : res.data.data.goods_list;
				//如果返回的列表size大于0，页码增加
				if(res.data.data.goods_list.length > 0) {
					page.value += 1
				}
				//如果返回的列表size等于0，且page>1提示无更多数据
				if(res.data.data.goods_list.length == 0 && page.value > 1) {
					uni.showToast({
						title: '没有更多数据了',
						icon: 'none'
					})
				}
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
	
	
	function getBrandComments() {
		uni.request({
			url: websiteUrl + '/brand-comment?brand_id=' + props.brand_id + "&page=" + commentsPage.value,
			method: 'GET',
			timeout: 5000,
			success: (res) => {
				console.log(res.data.data);
				comments.value.page_index = res.data.data.page_index;
				comments.value.total = res.data.data.total;
				comments.value.comment_list = comments.value.comment_list ? comments.value.comment_list.concat(res.data.data.comment_list) : res.data.data.comment_list;
				//如果返回的列表size大于0，页码增加
				if(res.data.data.comment_list != null) {
					if(res.data.data.comment_list.length > 0) {
						commentsPage.value += 1
					}
					//如果返回的列表size等于0，且page>1提示无更多数据
					if(res.data.data.comment_list.length == 0 && commentsPage.value > 1) {
						uni.showToast({
							title: '没有更多数据了',
							icon: 'none'
						})
					}
				}
				
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
	
	//打开弹窗
	function openRate(i) {
		activeModal.value = !activeModal.value
		

	}
	
	//提交评论
	function addComments() {
		let token = uni.getStorageSync('token')
		if (!token) {
			uni.showToast({
				title: '请先登录',
				icon: 'none'
			})
			return
		}
		if (comment.value == "") {
			uni.showToast({
				title: '请输入评论内容',
				icon: 'none'
			})
			return
		}
		
		let scene = getScene()		
		uni.request({
			url: websiteUrl + '/with-state/add-comment',
			method: 'POST',
			header: {
				'Authorization': token,
			},
			data: {
				//props.brand_id转为int
				target_id: parseInt(props.brand_id),
				content: comment.value,
				type: 1,
				origin: scene,
			},
			success: (res) => {
				console.log(res.data);
				if (res.data.status == "success") {
					uni.showToast({
						title: '评论成功',
						icon: 'success'
					})
					//清空评论
					comment.value = ""
					//重新获取评论
					commentsPage.value = 1;
					comments.value = {}
					getBrandComments();
					return;
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
	
	function getMyScore(type, targetId) {
		let token = uni.getStorageSync('token')
		if (!token) {
			return 0;
		}
		if(!global.isLogin) {
			return 0;
		}
		uni.request({
			url: websiteUrl + '/with-state/my-vote-record',
			method: 'GET',
			header: {
				'Authorization': token,
				'Content-Type': 'application/json',
			},
			data: {
				target_id: parseInt(targetId),
				type: type
			},
			success: (res) => {
				console.log(res.data.data);
				if (res.data.status == "success") {
					rateValue.value = res.data.data.score;
					return res.data.data.score;
				} else {
					uni.showToast({
						title: res.data.msg,
						icon: 'none'
					})
					return 0
				}
			},
			fail: (err) => {
				console.log(err);
				uni.showToast({
					title: '网络请求失败',
					icon: 'none'
				})
				return 0
			},
		});
	}
	
	//跳转到商品页
	// 跳转商品页
	function jumpGoods(id) {
		uni.navigateTo({
			url: '/pages/goods/goods?goods_id=' + id
		})
	}
	//跳转到用户页面
	function jump2user(uid) {
		uni.navigateTo({
			url: '/pages/user_page/user_page?uid=' + uid
		})
	}
	let goods = ref({})
	//brand page
	let page = ref(1)
	let brand = ref({})
	let comments = ref({})
	let commentsPage = ref(1)
	// 获取品牌信息
	getBrandsInfo()
	// 获取品牌娃娃列表
	getBrandGoods()
	//获取品牌评论
	getBrandComments()

	//获取我的评分
	getMyScore(1, props.brand_id)
</script>

<style lang="less" scoped>

.brand_logo {
	width: calc(100vw - 10px);
	display: block;
	margin:5px;
	float: left;
}

.brand_info_body {
	width: calc(70vw - 10px);
	box-sizing: border-box;
	padding: 5px;
	float: right;
	  justify-content: flex-start;
	  
	text {
		display: block;
		width: 100%;
	}
}

.brand_goods {
      display: flex;
      flex-wrap: wrap;
      gap: 16px; /* 设置元素之间的间距 */
      // padding: 8px; /* 避免元素贴边 */
	  
	 .brand_goods_item {
		  flex: 1 1 calc(33.33% - 12px); /* 固定每个元素宽度为 33.33% */
		  width: calc(33.33% - 12px); /* 设置最大宽度 */
		  max-width: calc(33.33% - 12px);
		  height: 140px; /* 示例高度，可根据需求调整 */
		  // background-color: #4CAF50;
		  // height: auto;             /* 高度自动调整以保持比例 */
		   aspect-ratio: 1; 
		  color: white;
		  display: flex;
		  align-items: center;
		  justify-content: center;
		  font-size: 20px;
		  border-radius: 8px;
		  overflow: hidden;
	}
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
.body {
	width: 100vw;
    // height: calc(100vh - 50px);
    opacity: 1;
    border-radius: 25px;
    background: white;
    box-shadow: 0px 0px 5px rgb(0 0 0 / 24%);
    // overflow: hidden;
	width: 100vw;
	// height: calc(100vh - 50px);
	opacity: 1;
	border-radius: 25px;
	background: white;
	box-shadow: 0px -10px 12px rgba(0, 0, 0, 0.05);
	overflow: hidden;
	padding: 20px;
	box-sizing: border-box;
}
//加载更多goods
.load_more {
	background: #fff;
	color: #d6d6d6;
	font-size: 13px;
	margin-top: 15px;

}
.load_more::after {
	border: none;
}

.mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: #fff;
		opacity: 0;
		z-index: 99;
		width: 100vw;
		height: 100vh;
	}
// 底部tab
	.bottom_tab {
		display: flex;
		align-items: center;
		/* 垂直居中 */
		gap: 8px;
		/* 元素间距 */
		box-sizing: border-box;
		display: flex;
		align-items: center;
		padding: 10px;
		position: fixed;
		bottom: 0px;
		z-index: 100;
		width: 100vw;
		background: #fff;
		left: 0px;

		.replyInfo {
			flex-shrink: 0;
			/* 禁止缩小 */
			max-width: 50px;
			/* 最大宽度限制 */
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			flex-shrink: 0;
			max-width: 50px;
			margin-right: 8px;
		}

		.comment_input {
			flex: 1;
			/* 占据剩余空间 */
			min-width: 0;
			/* 允许缩小 */
			flex: 1;
			margin-right: 8px;
			height: 30px;
			border-radius: 5px;
			min-height: 30px;
			padding: 8px;
			background: #f2f2f2;
		}

		button {
			flex-shrink: 0;
			/* 固定宽度 */
			width: 90px;
			/* 按钮固定宽度 */
			background: rgb(100, 198, 220);
			border-radius: 10px;
			width: 90px;
			color: rgb(255, 255, 255);
			font-size: 14px;
		}
		uni-button:after {
			border: none;
		}
	}

//评分弹框
.modal_shadow {
    position: fixed;
    z-index: 15;
    background: rgba(0, 0, 0, 0.2);
	backdrop-filter: blur(10px);
	-webkit-backdrop-filter:blur(10px);
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
	pointer-events: all;
	.modal_box {
		position: fixed;
		background: rgb(255, 255, 255);
		top: 15%;
		width: 60vw;
		height: 20vh;
		margin: 0px auto;
		left: 50%;
		transform: translate(-50%, 0%);
		padding: 20px;
		box-shadow: 0 0 5px #00000045;
		border-radius: 20px;
	}
}
//按钮
	.light_button {
		color: #fff;
		background: #65C3D6;
		box-shadow:0 0 3px #1ed1e1;
		border: 0px;
		margin: 20px 0px;
		border-radius: 15px;
		
	}
	.light_button:active {
		background: #4e98a9;
	}
	
	.none {
		display: none;
	}
	

</style>
