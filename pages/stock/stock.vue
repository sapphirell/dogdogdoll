<template>
  <meta name="theme-color" content="#d8deff"></meta>
  <view-logs />
  <bottom-popup :show="false"></bottom-popup>

  <common-page head_color="#d8deff">
    <view class="container" style="overflow: hidden;">
      <view class="head_container">
        <view class="switch_tab">
          <button @click="switch_tab(1)" class="font-alimamashuhei" :class="{'active': activeTab === 1}">
            <image class="tab_img" src="/static/new-icon/myitems.png" mode="widthFix" style="width: 160rpx;opacity: 0.9;"></image>
          </button>
          <button @click="switch_tab(2)" class="font-alimamashuhei" :class="{'active': activeTab === 2}">
            <image class="tab_img" src="/static/new-icon/showcase.png" mode="widthFix" style="width: 130rpx;opacity: 0.9;"></image>
          </button>
          <button @click="switch_tab(3)" class="font-alimamashuhei" :class="{'active': activeTab === 3}">
            <image class="tab_img" src="/static/new-icon/calendar.png" mode="widthFix" style="width: 160rpx;opacity: 0.9;"></image>
          </button>
        </view>
      </view>

      <view class="data_body">
        <!-- Tab 1：我的物品 -->
        <uni-transition :name="transitionName()" :mode-class="['fade','slide-bottom']" :duration="300" :show="activeTab === 1">
          <stock-myitems
            ref="myItemsRef"
            :accountBookData="accountBookData"
            :active-tab="activeTab"
            @go2editor="go2editor"
            @update-type="handleTypeUpdate"
            @open-type-manager="typeModalVisible = true"
          />
        </uni-transition>

        <!-- Tab 2：展示柜 -->
        <uni-transition :name="transitionName()" :mode-class="['fade','slide-bottom']" :duration="300" :show="activeTab === 2">
          <view class="tab_body_sec">
            <view v-if="showcaseData.showcases && showcaseData.showcases.length > 0" class="showcase-container">
              <view v-for="(item, index) in showcaseData.showcases" :key="index" class="showcase-card" @tap="go2editorShowCase(item.id)">
                <view v-if="item.display !== 1" class="status-overlay">
                  <text class="status-text">{{ getStatusText(item.display) }}</text>
                </view>
                <view class="card-content" :class="{ 'blur-effect': item.display !== 1 }">
                  <image :src="item.image_url_list[0]" mode="aspectFill" class="showcase-image" />
                  <view class="showcase-info">
                    <text class="showcase-title one_line_text">{{ item.name }}</text>
                    <text class="showcase-description multi_line_text">{{ item.description }}</text>
                    <view class="interaction-bar">
                      <view class="interaction-item">
                        <image src="/static/eye.png" class="interaction-icon" />
                        <text class="interaction-count">{{ item.views || 0 }}</text>
                      </view>
                      <view class="interaction-item">
                        <image src="/static/6.png" class="interaction-icon" />
                        <text class="interaction-count">{{ item.like_count || 0 }}</text>
                      </view>
                    </view>
                  </view>
                </view>
              </view>
            </view>
            <view class="empty-state" v-else>
              <image class="empty-icon" src="/static/empty.jpg" />
              <text class="empty-text">展示柜空空如也</text>
              <text class="empty-tip">快来创建你的展示空间吧！</text>
            </view>
          </view>
        </uni-transition>

        <!-- Tab 3：账单 -->
        <uni-transition :name="transitionName()" :mode-class="['fade','slide-bottom']" :duration="300" :show="activeTab === 3">
          <view class="tab_body_3th">
            <view class="calendar-container" v-if="Object.keys(billData).length > 0">
              <view v-for="(bills, month) in billData" :key="month">
                <view class="month-header-container">
                  <text class="month-header font-alimamashuhei">{{ month }} 账单</text>
                  <text class="month-stats">{{ countPaid(bills) }}</text>
                </view>
                <view v-for="bill in bills" :key="bill.id" class="bill-item" @tap="go2addBill(bill.id)">
                  <view class="bill-left">
                    <view class="bill-name-container"><text class="bill-name">{{ bill.name }}</text></view>
                    <view class="due-amount-container">
                      <text class="due-label">待补款:</text>
                      <text class="due-amount">¥{{ bill.price }}</text>
                    </view>
                  </view>
                  <view class="bill-right">
                    <view class="date-container"><text class="date-text">日期: {{ bill.ymd }}</text></view>
                    <view class="status-container">
                      <text class="status-text" :class="{'paid': bill.status === 1}">{{ bill.status === 0 ? '未补款' : '已补款' }}</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
            <view class="empty-state" v-else>
              <image class="empty-icon" src="/static/empty.jpg" />
              <text class="empty-text">暂无待补尾款</text>
              <text class="empty-tip">增加添加一个到账本试试吧～</text>
            </view>
          </view>
        </uni-transition>
      </view>
    </view>

    <!-- ✅ 分类管理弹窗：移动到 uni-transition 外层，由父级控制显隐 -->
    <item-category-manager
      v-model="typeModalVisible"
      :list="typeList"
      @updated="onTypesUpdated"
      @refresh="onTypesRefresh"
    />

    <!-- 固定悬浮按钮 -->
    <view class="unified-floating-button" @tap="handleFloatingButton">
      <uni-icons type="plusempty" size="30" color="#fff"></uni-icons>
    </view>
  </common-page>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import {
  websiteUrl, wechatSignLogin, getUserInfo, global, asyncGetUserInfo
} from "../../common/config.js"

// ===== 新增：弹窗开关与列表（由父级控制） =====
const typeModalVisible = ref(false)
const typeList = ref([]) // 仅用于给弹窗初始渲染，真正数据以弹窗组件内部拉取为准
const myItemsRef = ref(null) // 获取子组件实例以调用其 getAccountTypes()

// ===== 原有状态 =====
const systemInfo = uni.getSystemInfoSync()
const statusBarHeight = ref(systemInfo.statusBarHeight)
const activeTab = ref(1)
const previousTab = ref(1)

function transitionName() {
  return activeTab.value > 1 ? ['fade', 'slide-left'] : ['fade', 'slide-right']
}
function switch_tab(index) {
  previousTab.value = activeTab.value
  activeTab.value = index
  // 切走非 Tab1 时，保证关闭分类弹窗
  if (activeTab.value !== 1) typeModalVisible.value = false

  switch (index) {
    case 1: getAccountBookData(); break
    case 2: getShowcaseData(); break
    case 3: getBillData(); break
  }
}

// 账本、展示柜、账单数据
const accountBookData = ref({})
const showcaseData = ref({})
const billData = ref({})

// 金额统计
function countPaid(bills) {
  let totalAmount = 0, paidAmount = 0
  bills.forEach(b => {
    const p = parseFloat(b.price) || 0
    totalAmount += p
    if (b.status === 1) paidAmount += p
  })
  return `${paidAmount.toFixed(1)}/${totalAmount.toFixed(1)}`
}

// ===== 分类筛选回调（子组件触发） =====
const handleTypeUpdate = (type) => {
  getAccountBookData(type)
}

// ===== 弹窗事件回调（弹窗组件触发） =====
function onTypesUpdated(list) {
  typeList.value = list || []
  // 让子组件（我的物品）刷新自身的分类选项
  myItemsRef.value && myItemsRef.value.getAccountTypes && myItemsRef.value.getAccountTypes()
}
function onTypesRefresh() {
  // 刷新当前账本数据；筛选值仍由子组件控制并通过 @update-type 回传
  getAccountBookData()
}

// ===== 悬浮按钮 =====
function handleFloatingButton() {
  switch (activeTab.value) {
    case 1: go2addAccountBook(); break
    case 2: go2addShowCase(); break
    case 3: go2addBill(false); break
  }
}

// ===== 请求：账本/展示柜/账单 =====
function getAccountBookData(type) {
  if (!global.isLogin) { accountBookData.value = {}; showcaseData.value = {}; billData.value = {}; return }
  const token = uni.getStorageSync('token')
  let url = websiteUrl.value + '/with-state/account-book'
  if (type && type !== '全部') url = websiteUrl.value + '/with-state/account-book?type=' + encodeURIComponent(type)
  uni.request({
    url, method: 'GET', header: { 'Authorization': token },
    success: (res) => { accountBookData.value = res.data.data || {} }
  })
}
function getShowcaseData(){
  if (!global.isLogin) return
  const token = uni.getStorageSync('token')
  uni.request({
    url: websiteUrl.value + '/with-state/showcase', method:'GET', header:{'Authorization':token},
    success: (res)=> { showcaseData.value = res.data.data || {} }
  })
}
function getBillData(){
  if (!global.isLogin) return
  const token = uni.getStorageSync('token')
  uni.request({
    url: websiteUrl.value + '/with-state/tail-bill', method:'GET', header:{'Authorization':token},
    success: (res)=> { billData.value = res.data.data || {} }
  })
}

// 跳转们（保持原逻辑）
function jump2test(){ uni.navigateTo({ url: '/pages/drag-image-test/drag-image-test' }) }
function go2addAccountBook(){ uni.navigateTo({ url: '/pkg-stock/stock/account_book_form/account_book_form' }) }
function go2editor(id){ uni.navigateTo({ url: '/pkg-stock/stock/account_book_form/account_book_form?account_book_id=' + id }) }
function go2addShowCase(){ uni.navigateTo({ url: '/pkg-stock/stock/showcase_form/showcase_form' }) }
function go2editorShowCase(id){ uni.navigateTo({ url: '/pkg-stock/stock/showcase_form/showcase_form?showcase_id=' + id }) }
function go2addBill(id){
  if (id === false) return uni.navigateTo({ url: '/pkg-stock/stock/bill_form/bill_form' })
  uni.navigateTo({ url: '/pkg-stock/stock/bill_form/bill_form?bill_id=' + id })
}
function getStatusText(display){
  const map = { 0:'审核中', 2:'人工复核中', 3:'违规隐藏中' }
  return map[display] || ''
}

onShow(() => {
  asyncGetUserInfo().then(() => {
    switch (activeTab.value) {
      case 1: getAccountBookData(); break
      case 2: getShowcaseData(); break
      case 3: getBillData(); break
    }
  })
})
</script>

<style lang="scss" scoped>
	.container {
		background-color: #fff;
		// background: linear-gradient(180deg, #daeeff 0%, white 100%);

	}

	.content {
		margin-top: 15rpx;
	}

	.head_container {
		background: linear-gradient(180deg, #d8deff 0%, #d3f5ff 100%);
		overflow: hidden;
		
		// background-image: url("/static/bg/bg1.jpg");
		// background-size:cover;
	}

	.switch_tab {
		display: flex;
		justify-content: space-around;
		background: #fff;
		width: 100%;
		height: 100rpx;
		margin: 20rpx 0 30rpx 0;
		position: relative;
		background: transparent;
		/* 移除原渐变色背景 */

		button {
			position: relative;
			background: transparent;
			color: #666;
			width: 33.3%;
			padding: 20rpx 0;
			font-size: 28rpx;
			margin: 0;
			border-radius: 0;
			transition: all 0.3s ease;

			&::after {
				content: '';
				position: absolute;
				top: 60rpx;
				left: 50%;
				width: 0;
				height: 0rpx;
				background: #74c9e5;
				transition: all 0.3s ease;
				transform: translateX(-50%);
			}

			text {
				font-weight: 500;
				transition: all 0.3s ease;
				    z-index: 10;
				    position: relative;
			}

			&.active {
				text {
					color: #464646;
					font-weight: 800;
					font-size: 32rpx;
					/* 选中时字体变大 */
				}

				&::after {
					width: 80%;
					/* 下划线宽度 */
					background: #747ee5b0;
					border: none;
					height: 10px;
				}
			}
		}
	}

	/* 新增样式 */
	 
	 .unified-floating-button {
	 		position: fixed;
	 		bottom: 160rpx;
	 		left: 50%;
	 		transform: translateX(-50%);
	 		width: 100rpx;
	 		height: 100rpx;
	 		background: linear-gradient(135deg, #a6e9f7, #1ed1e1);
	 		border-radius: 50%;
	 		display: flex;
	 		align-items: center;
	 		justify-content: center;
	 		box-shadow: 0 6rpx 20rpx rgba(30, 209, 225, 0.4);
	 		z-index: 555;
	 		transition: all 0.3s ease;
	 		
	 		/* 按钮动画效果 */
	 		&::after {
	 			    content: "";
				position: absolute;
				top: 33px;
				left: 50%;
				width: 0;
				height: 0.125rem;
				background: #74c9e5;
				transition: all 0.3s ease;
				transform: translateX(-50%);
	 		}
	 		
	 		&:active {
	 			transform: translateX(-50%) scale(0.95);
	 			box-shadow: 0 4rpx 12rpx rgba(30, 209, 225, 0.3);
	 		}
	 	}


	.data_body {
		min-height: 80vh;

		/* 根据实际内容设置合理高度，避免父容器塌陷 */
		// position: relative;

	}

	.tab_body_1st,
	.tab_body_sec,
	.tab_body_3th {
		/* 添加以下内容确保显示 */
		display: block !important;
		opacity: 1 !important;
		visibility: visible !important;
		transform: none !important;


		// border-radius: 50rpx 50rpx 0 0;
		overflow: hidden;
		background-color: #fff;
		padding: 0rpx 20rpx;
		// height: 100vh;
		box-sizing: border-box;
		margin: 0rpx 0rpx 20rpx 0rpx;
		// box-shadow: 0 0 5rpx #dadada;
		overflow: hidden;
		width: calc(100%);
		// min-height: 80vh;
		min-height: 1400rpx;
		/* 根据实际内容设置合理高度，避免父容器塌陷 */
	}



	.light_button {
		color: #fff;
		background: #65C3D6;
		box-shadow: 0 0 3rpx #1ed1e1;
		border: 0rpx;
		margin: 20rpx 0rpx;
		border-radius: 15rpx;

	}

	.light_button:active {
		background: #4e98a9;
	}


	.inputer {
		font-size: 20rpx;
		border-bottom: 1rpx #ddd solid;
		padding: 10rpx;
		margin: 40rpx 0rpx;
	}


	// 1st下的
	/* 新增样式 */
	.type-picker {
		flex: 1;
		font-size: 24rpx;
		color: #e9b6d7;
		padding: 15rpx 25rpx;
		border-radius: 10rpx;
		background: white;

		.uni-input {
			&::before {
				content: '▼ ';
				margin-left: 15rpx;
				font-size: 20rpx;
				color: #e9b6d7;
			}
		}
	}

	.content-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 30rpx;
		padding: 20rpx;

		.grid-item {
			position: relative;
			width: calc(33.33% - 22rpx); // 3列布局，考虑间隙
			overflow: hidden;
			border-radius: 20rpx;
			background: #fff;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);

			.item-image {
				width: 100%;
				height: 200rpx;
				display: block;
				margin-bottom: 10rpx;
			}

			.item-type {
				position: absolute;
				top: 0;
				left: 0;
				background: rgb(122 181 255 / 65%);
				color: #fff;
				padding: 10rpx 20rpx;
				border-radius: 10rpx 0 10rpx 0;
				font-size: 22rpx;
				font-weight: 900;
			}

			.item-info {
				padding: 5rpx 15rpx;
				display: flex;
				align-items: center;
				gap: 10rpx;

				.item-price {
					font-family: 'alimamashuhei';
					font-weight: 900;
					color: #ff827e;
					font-size: 30rpx;
					flex-shrink: 0;
					text-shadow: 0 0 3rpx #fff;
				}

				.item-name {
					font-family: 'alimamashuhei';
					color: #39110c;
					font-size: 22rpx;
					flex-grow: 1;
					text-shadow: 0 0 3rpx #fff;
				}
			}
		}
	}

	.type-header {
		display: flex;
		align-items: center;
		// padding: 25rpx 30rpx;
		// background: linear-gradient(135deg, rgb(255 124 124 / 10%) 0%, white 100%);
		border-radius: 16rpx;
		margin: 20rpx 30rpx;
		// box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	}


	.manage-btn {
		font-size: 22rpx;
		color: white;
		background: linear-gradient(135deg, #a6e9f7, #1ed1e1);
		margin-left: 20rpx;
		padding: 10rpx 25rpx;
		border-radius: 50rpx;
		display: flex;
		align-items: center;
		transition: all 0.3s;

		&::before {
			content: '✎';
			margin-right: 8rpx;
		}

		&:active {
			transform: scale(0.95);
			opacity: 0.9;
		}
	}

	.type-modal {
		padding: 30rpx;
		box-sizing: border-box;
		width: 80vw;
		// height: 50vh;

		.type-list {
			max-height: 500rpx;
			overflow-y: auto;
			margin-bottom: 40rpx;
		}

		.type-item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 25rpx;
			border-bottom: 1rpx solid #eee;

			text {
				font-size: 26rpx;
				color: #333;
			}
		}

		.add-type-form {
			display: flex;
			gap: 20rpx;

			.type-input {
				flex: 1;
				border: 1rpx solid #ddd;
				border-radius: 8rpx;
				padding: 15rpx;
				font-size: 26rpx;
			}

			.add-btn {
				background: #74c9e5;
				color: white;
				font-size: 26rpx;
				padding: 0 30rpx;
				border-radius: 8rpx;
			}
		}
	}



	/* 补款提醒表单样式 */
	.remind-form {
		margin-top: 40rpx;
		padding: 30rpx;
		background: #f8f8f8;
		border-radius: 16rpx;

		.form-item {
			margin-bottom: 30rpx;

			label {
				display: block;
				font-size: 26rpx;
				color: #666;
				margin-bottom: 15rpx;
			}

			input,
			picker {
				width: 100%;
				padding: 20rpx;
				border: 1rpx solid #ddd;
				border-radius: 8rpx;
				font-size: 28rpx;
			}
		}

		.hint-text {
			font-size: 24rpx;
			color: #999;
			margin-top: 20rpx;
		}
	}

	// 尾款日历

	.tab_body_3th {
		.calendar-container {
			padding: 20rpx;
		}

		.month-header-container {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 20rpx 0;
			border-bottom: 1rpx dashed #eee;
			margin-bottom: 20rpx;
		}

		.month-header {
			font-size: 32rpx;
			color: #333;
		}

		.month-stats {
			font-size: 26rpx;
			color: #999;
		}

		.bill-item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 30rpx;
			margin: 20rpx 0;
			background: #fff;
			border-radius: 16rpx;
			box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
			transition: all 0.2s ease;

			&:active {
				transform: scale(0.98);
				background: #f8f8f8;
			}
		}

		.bill-left {
			flex: 1;
			margin-right: 30rpx;
		}

		.bill-name {
			font-size: 28rpx;
			color: #333;
			font-weight: bold;
			display: block;
			margin-bottom: 15rpx;
		}

		.due-label {
			font-size: 24rpx;
			color: #999;
			margin-right: 10rpx;
		}

		.due-amount {
			color: #74c9e5;
			font-weight: bold;
			font-size: 28rpx;
		}

		.bill-right {
			text-align: right;
		}

		.date-text {
			font-size: 24rpx;
			color: #999;
			display: block;
			margin-bottom: 15rpx;
		}

		.status-text {
			font-size: 26rpx;
			color: #ff6666;

			&.paid {
				color: #74c9e5;
			}
		}
	}


	// 展示柜
	.tab_body_sec {
		.showcase-container {
			padding: 30rpx;
			display: grid;
			gap: 30rpx;
		}

		.showcase-card {
			position: relative;
			background: #fff;
			border-radius: 24rpx;
			box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.08);
			transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
			overflow: hidden;

			&:active {
				transform: scale(0.98);
				box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
			}
		}

		.status-overlay {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: rgba(0, 0, 0, 0.4);
			z-index: 2;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			backdrop-filter: blur(10rpx);

			&.reviewing {
				background: rgba(116, 202, 229, 0.8);
			}

			&.rechecking {
				background: rgba(255, 193, 7, 0.8);
			}

			&.violation {
				background: rgba(244, 67, 54, 0.8);
			}
		}

		.status-text {
			color: #fff;
			font-size: 32rpx;
			font-weight: bold;
			text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
			margin-top: 20rpx;
		}


		.card-content {
			display: flex;
			height: 320rpx;
			position: relative;
		}

		.showcase-image {
			width: 280rpx;
			height: 100%;
			flex-shrink: 0;
			border-radius: 24rpx 0 0 24rpx;
		}

		.showcase-info {
			flex: 1;
			padding: 30rpx;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
		}

		.showcase-title {
			font-size: 28rpx;
			font-weight: 700;
			color: #333;
			line-height: 1.4;
		}

		.showcase-description {
			font-size: 22rpx;
			color: #666;
			line-height: 1.6;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 3;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		.interaction-bar {
			display: flex;
			gap: 40rpx;
			margin-top: 20rpx;
		}

		.interaction-item {
			display: flex;
			align-items: center;
			gap: 12rpx;
		}

		.interaction-icon {
			width: 36rpx;
			height: 36rpx;
			opacity: 0.8;
		}

		.interaction-count {
			font-size: 24rpx;
			color: #999;
		}

		.blur-effect {
			filter: blur(8rpx);
			opacity: 0.9;
		}

		@keyframes rotating {
			from {
				transform: rotate(0deg);
			}

			to {
				transform: rotate(360deg);
			}
		}

		/* 针对展示柜的特殊调整 */
		.tab_body_sec .empty-state {
			padding-top: 100rpx;

			.empty-icon {
				width: 380rpx;
				height: 380rpx;
			}
		}

		/* 尾款日历特殊样式 */
		.tab_body_3th .empty-state {
			.empty-icon {
				width: 360rpx;
				height: 360rpx;
			}

		}
	}
	
	// 空数据样式
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
		padding: 40rpx;
		text-align: center;
	
		.empty-icon {
			width: 340rpx;
			height: 340rpx;
			opacity: 0.8;
			margin-bottom: 40rpx;
		}
	
		.empty-text {
			font-size: 32rpx;
			color: #888;
			margin-bottom: 20rpx;
			font-weight: 500;
		}
	
		.empty-tip {
			font-size: 26rpx;
			color: #aaa;
			line-height: 1.6;
		}
	}
	// 价格合计
	.summary-container {
		padding: 20rpx 30rpx;
		border-radius: 12rpx;
		margin: 20rpx 5rpx;
	
		.total-text {
			font-size: 24rpx;
			color: #74c9e5;
			font-weight: bold;
	
			&::before {
				content: ' ';
			}
		}
	}
	
	.loading-overlay {
	  position: absolute;
	  top: 0;
	  left: 0;
	  right: 0;
	  bottom: 0;
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  background: rgba(255, 255, 255, 0.8);
	  z-index: 1000;
	}
	

</style>