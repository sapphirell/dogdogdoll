<template>
  <view>
    <zhouWei-navBar
      type="transparentFixed"
      :backState="2000"
      :homeState="2000"
      fontColor="#000"
      transparentFixedFontColor="#000"
      :scrollTop="scrollTop"
      :titleCenter="true"
      title="收款设置"
    >
      <template #left>
        <view class="nav-back-pill" @click="goBack">
          <uni-icons type="left" size="22" color="#000" />
        </view>
      </template>

      <template #transparentFixedLeft>
        <view class="nav-back-pill" @click="goBack">
          <uni-icons type="left" size="22" color="#000" />
        </view>
      </template>
    </zhouWei-navBar>

    <view-logs />
    
    <view 
      class="notebook-container font-alimamashuhei"
      :style="{ paddingTop: headerPad }"
    >
      
      <view class="notebook-body">
        <view class="notebook-binders">
          <view 
            class="binder-tab" 
            :class="{ active: activeTab === 'wechat' }"
            @click="switchTab('wechat')"
          >
            <uni-icons v-if="activeTab === 'wechat'" type="heart-filled" size="16" color="#ffffff" />
            <view v-else class="tab-ring"></view>
            <text>微信</text>
          </view>

          <view 
            class="binder-tab" 
            :class="{ active: activeTab === 'alipay' }"
            @click="switchTab('alipay')"
          >
            <uni-icons v-if="activeTab === 'alipay'" type="heart-filled" size="16" color="#ffffff" />
            <view v-else class="tab-ring"></view>
            <text>支付宝</text>
          </view>
          
          <view class="binder-ring"></view>
          <view class="binder-ring"></view>
          <view class="binder-ring"></view>
        </view>

        <view class="notebook-pages">
          
          <view 
            class="page-card"
            :class="getCardClass('wechat')"
          >
            <view class="page-content">
              <view class="upload-frame-container">
                <view class="upload-area" @click="handleUpload('wechat')">
                  
                  <block v-if="wechatImg">
                    <image 
                      :src="wechatImg" 
                      mode="aspectFit" 
                      class="preview-img"
                    />
                    <view class="mask"><text>更换图片</text></view>
                  </block>

                  <view v-else class="empty-state">
                    <image src="/static/deal/wechatpay.png" mode="widthFix" class="empty-icon" />
                    <text>点击上传微信收款码</text>
                  </view>

                </view>
              </view>
              <view class="page-footer">
                <text class="cute-text">请提醒客人转账请截图哦</text>
                <view class="cute-sticker sticker-bottom-right">
                  <uni-icons type="paw" size="20" color="#9FB8CF"/>
                </view>
              </view>
            </view>
          </view>

          <view 
            class="page-card"
            :class="getCardClass('alipay')"
          >
            <view class="page-content">
              <view class="upload-frame-container">
                <view class="upload-area" @click="handleUpload('alipay')">
                  
                  <block v-if="alipayImg">
                    <image 
                      :src="alipayImg" 
                      mode="aspectFit" 
                      class="preview-img"
                    />
                    <view class="mask"><text>更换图片</text></view>
                  </block>

                  <view v-else class="empty-state">
                    <image src="/static/deal/alipay.png" mode="widthFix" class="empty-icon" />
                    <text>点击上传支付宝收款码</text>
                  </view>

                </view>
              </view>
              <view class="page-footer">
                <text class="cute-text">请提醒客人转账请截图哦</text>
                <view class="cute-sticker sticker-bottom-right">
                  <uni-icons type="paw" size="20" color="#9FB8CF"/>
                </view>
              </view>
            </view>
          </view>

        </view>
      </view>

      <view class="bottom-action-area">
        <view class="password-section">
          <view class="input-label">
            <uni-icons type="locked-filled" size="18" color="#9FB8CF" />
            验证交易密码
          </view>
          <input 
            class="pwd-input" 
            type="number" 
            password 
            v-model="tradePassword" 
            placeholder="请输入6位交易密码"
            maxlength="6"
          />
        </view>

        <button 
          class="save-btn" 
          :class="{ disabled: !canSubmit }" 
          @click="handleSubmit"
          :disabled="!canSubmit || isLoading"
        >
          {{ isLoading ? '保存中...' : '确认保存设置' }}
        </button>
      </view>

    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow, onPageScroll } from '@dcloudio/uni-app'
import { 
  websiteUrl, 
  global, 
  asyncGetUserInfo, 
  getStatusBarHeight, 
  getNavBarHeight, 
  toPx 
} from "@/common/config.js"
import { chooseImage, getQiniuToken, uploadImageToQiniu } from "@/common/image.js" 

// --- 计算安全距离 ---
const safeTop = getStatusBarHeight() + getNavBarHeight() + 20
const headerPad = ref(toPx(safeTop))

// --- 导航栏滚动逻辑 ---
const scrollTop = ref(0)
onPageScroll(e => { scrollTop.value = e?.scrollTop || 0 })

function goBack() {
  const pages = getCurrentPages?.() || []
  if (pages.length > 1) uni.navigateBack({ delta: 1 })
  else uni.switchTab({ url: '/pages/index/index' })
}

// 状态管理
const activeTab = ref('wechat') 
const isAnimating = ref(false) 

// 表单数据
const wechatImg = ref('')
const alipayImg = ref('')
const tradePassword = ref('')
const isLoading = ref(false)

const canSubmit = computed(() => {
  return tradePassword.value.length === 6
})

// 计算每个卡片的样式类名
const getCardClass = (type) => {
  if (activeTab.value === type) {
    return isAnimating.value ? 'anim-entry-top' : 'static-top'
  } else {
    return isAnimating.value ? 'anim-exit-bottom' : 'static-bottom'
  }
}

function switchTab(type) {
  if (activeTab.value === type || isAnimating.value) return;
  
  isAnimating.value = true;
  activeTab.value = type;

  setTimeout(() => {
    isAnimating.value = false;
  }, 800);
}

// [新增] 获取后端存储的艺术家详情（包含收款码）
async function fetchArtistInfo() {
  const token = uni.getStorageSync('token')
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/brand-manager/get-artist-info`,
      method: 'GET',
      header: { 'Authorization': token }
    })
    
    // api.Base.Success 返回结构通常为 { code: 200, data: {...}, msg: ... }
    if (res.data && (res.data.code === 200 || res.data.status === 'success')) {
      const data = res.data.data
      if (data) {
        // 后端 Go 结构体字段映射到 JSON 是 snake_case
        wechatImg.value = data.wechat_payment_code || ''
        alipayImg.value = data.alipay_payment_code || ''
      }
    }
  } catch (err) {
    console.error('获取收款设置失败', err)
  }
}

onShow(async () => {
  // 并行获取用户信息和艺术家收款信息
  await Promise.all([
    asyncGetUserInfo(),
    fetchArtistInfo()
  ])
})

async function handleUpload(type) {
  try {
    const filePath = await chooseImage()
    uni.showLoading({ title: '上传处理中...' })
    const tokenData = await getQiniuToken()
    const fileName = tokenData.path 
    const token = tokenData.token

    if (!fileName || !token) throw new Error('获取上传凭证异常')

    const result = await uploadImageToQiniu(filePath, token, fileName)
    
    if (type === 'wechat') {
      wechatImg.value = result.imageUrl
    } else {
      alipayImg.value = result.imageUrl
    }
    
    uni.hideLoading()
    uni.showToast({ title: '上传成功', icon: 'success' })

  } catch (error) {
    uni.hideLoading()
    console.error('上传流程失败:', error)
  }
}

async function handleSubmit() {
  if (!canSubmit.value) return
  
  isLoading.value = true
  const token = uni.getStorageSync('token')

  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/brand-manager/update-payment-codes`,
      method: 'POST',
      header: { 'Authorization': token },
      data: {
        wechat_payment_code: wechatImg.value,
        alipay_payment_code: alipayImg.value,
        trade_password: tradePassword.value
      }
    })

    if (res.data.status === 'success' || res.data.code === 200) {
      uni.showToast({ title: '设置成功', icon: 'success' })
      // 更新全局用户信息缓存（如果需要）
      if (global.userInfo) {
        global.userInfo.wechat_payment_code = wechatImg.value
        global.userInfo.alipay_payment_code = alipayImg.value
      }
      setTimeout(() => { uni.navigateBack() }, 1500)
    } else {
      uni.showToast({ title: res.data.msg || '保存失败', icon: 'none' })
    }
  } catch (err) {
    uni.showToast({ title: '网络请求失败', icon: 'none' })
  } finally {
    isLoading.value = false
  }
}
</script>

<style lang="less" scoped>
/* ==================== 配色方案：白色主体 + 莫兰迪灰蓝 ==================== */

@white: #ffffff;
@bg-base: #F4F5F7;        /* 整体背景纯白 */
@bg-secondary: #f9fbfd;   /* 极淡的灰蓝背景，用于底部层叠 */
@accent-blue: #BCD9ED;    /* 核心点缀色：灰调淡蓝 (Morandi Blue) */
@accent-dark: #8CA6BF;    /* 稍微深一点的点击态 */
@border-light: #F0F4F8;   /* 似有若无的边框线 */
@text-main: #5F6C7B;      /* 深灰蓝文字，高级感 */
@text-light: #BCD9ED;     /* 浅灰蓝文字 */

.nav-back-pill {
  margin-left: 15rpx;
  display: flex;
  align-items: center;
}

.notebook-container {
  min-height: 100vh;
  background-color: @bg-base;
  /* 极淡的圆点装饰 */
  background-image: radial-gradient(#d9d9d9 2px, transparent 2px);
  background-size: 30rpx 30rpx; 
  padding: 0 30rpx 40rpx; 
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.notebook-body {
  position: relative;
  width: 100%;
  height: 800rpx; 
  background: @bg-base;
  border-radius: 40rpx;
  border: 4rpx solid @border-light;
  /* 阴影非常克制，营造悬浮感 */
  box-shadow: 0 12rpx 40rpx rgba(159, 184, 207, 0.15);
  padding-left: 100rpx; 
  box-sizing: border-box;
  display: flex;
}

.notebook-binders {
  position: absolute;
  left: 0;
  top: 60rpx;
  bottom: 60rpx;
  width: 100rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40rpx;
  padding-top: 40rpx;
  z-index: 50; 

  .binder-tab {
    width: 110rpx; 
    height: 80rpx;
    /* 未选中：纯白背景，带一点边框 */
    background: @white;
    border-radius: 20rpx 0 0 20rpx;
    margin-left: -5rpx; 
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 22rpx;
    color: @text-light; 
    box-shadow: -4rpx 4rpx 10rpx rgba(0,0,0,0.03);
    transition: all 0.3s ease;
    border: 2rpx solid @border-light;
    border-right: none;
    text {
      color: @text-light;
    }

    .tab-ring {
      width: 0.9375rem;
      height: 0.9375rem;
      background: @bg-base;
      border-radius: 50%;
      box-shadow: inset 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
      margin-top: auto;
    }

    &.active {
      /* 选中状态：使用灰调淡蓝 */
      background: @accent-blue;
      width: 120rpx; 
      margin-left: -20rpx;
      font-weight: bold;
      color: @white; 
      border-color: @accent-blue;
      text {
        color: @white;
      }
    }

    text {
      margin-top: 4rpx;
    }
  }

  .binder-ring {
    width: 30rpx;
    height: 30rpx;
    background: @white;
    border: 4rpx solid @border-light;
    border-radius: 50%;
    box-shadow: inset 0 2rpx 6rpx rgba(0,0,0,0.05);
    margin-top: auto; 
    &:first-of-type { margin-top: 80rpx;} 
    margin-bottom: 30rpx;
  }
}

.notebook-pages {
  position: relative;
  flex: 1;
  height: 100%;
  perspective: 1000px;
}

/* ==================== 卡片通用样式 ==================== */
.page-card {
  position: absolute;
  top: 30rpx;
  left: 10rpx;
  right: 30rpx;
  bottom: 30rpx;
  border-radius: 30rpx;
  background: @white;
  /* 阴影改为极淡的冷灰色 */
  box-shadow: 0 8rpx 20rpx rgba(159, 184, 207, 0.1);
  transform-origin: center center;
  transform-style: preserve-3d;
}

/* ==================== 4种状态 ==================== */
.static-top {
  z-index: 10;
  transform: scale(1) rotate(0deg) translate(0, 0);
  background-color: @white;
}

.static-bottom {
  z-index: 1;
  transform: scale(1) rotate(3deg) translate(0, 0);
  background: @bg-secondary; 
  border: none;
}

.anim-exit-bottom {
  animation: shuffleRound 0.5s cubic-bezier(0.45, 0.05, 0.55, 0.95) forwards;
}

.anim-entry-top {
  animation: straightenUp 0.8s cubic-bezier(0.4, 0.0, 0.2, 1) forwards;
}

/* ==================== 关键帧定义 ==================== */
@keyframes shuffleRound {
  0% {
    z-index: 10;
    transform: scale(1) rotate(0deg) translate(0, 0);
    background-color: @white;
  }
  50% {
    transform: scale(0.85) rotate(-15deg) translate(-180rpx, 150rpx);
    z-index: 1; 
    background-color: @bg-secondary;
  }
  100% {
    transform: scale(1) rotate(3deg) translate(0, 0);
    z-index: 1;
    background-color: @bg-secondary; 
    border: none;
  }
}

@keyframes straightenUp {
  0% {
    z-index: 2;
    transform: scale(1) rotate(3deg) translate(0, 0);
    background-color: @bg-secondary;
  }
  100% {
    z-index: 10;
    transform: scale(1) rotate(0deg) translate(0, 0);
    background-color: @white;
  }
}

/* ==================== 页面内容 ==================== */

.page-content {
  height: 100%;
  padding: 40rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  position: relative;

  .cute-sticker {
    position: absolute;
    opacity: 0.8;
    filter: drop-shadow(0 2rpx 4rpx rgba(159, 184, 207, 0.4));
  }
  .sticker-bottom-right { bottom: 0; right: 20rpx; transform: rotate(-10deg); }

  .upload-frame-container {
    flex: 1;
    padding: 20rpx;
    border-radius: 30rpx;
    /* 虚线框改为灰调淡蓝 */
    border: 4rpx dashed @accent-blue; 
    background: #fcfdfe;
    display: flex;
    margin-top: 20rpx; 
  }

  .upload-area {
    flex: 1;
    background-color: #dde5ee;
    border-radius: 24rpx;
    position: relative;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;

    .preview-img {
      width: 100%;
      height: 100%;
    }
    
    .mask {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      opacity: 0;
      transition: opacity 0.3s;
      
      text {
        color: @accent-blue;
        font-size: 28rpx;
        font-weight: bold;
        border: 4rpx solid @accent-blue;
        padding: 10rpx 30rpx;
        border-radius: 40rpx;
        background: rgba(255,255,255,0.9);
      }
    }
    &:active .mask { opacity: 1; }
    
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 20rpx;
      
      .empty-icon {
        width: 120rpx;
        height: auto;
        opacity: 0.8;
        /* 增加灰度滤镜，让图标没那么刺眼，融入背景 */
        filter: grayscale(30%); 
      }
      
      text {
        font-size: 26rpx;
        color: @accent-blue;
        font-weight: bold;
      }
    }
  }

  .page-footer {
    margin-top: 30rpx;
    text-align: center;
    position: relative;
    padding-bottom: 20rpx;
    .cute-text {
      font-size: 28rpx;
      color: @accent-blue;
      font-weight: bold;
      letter-spacing: 2rpx;
    }
  }
}

.bottom-action-area {
  width: 100%;
  margin-top: 50rpx;
  padding: 0 20rpx;
  box-sizing: border-box;

  .password-section {
    background: @white;
    border-radius: 30rpx;
    padding: 30rpx;
    margin-bottom: 40rpx;
    box-shadow: 0 8rpx 24rpx rgba(159, 184, 207, 0.1);

    .input-label {
      font-size: 28rpx;
      color: @text-main;
      margin-bottom: 24rpx;
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 10rpx;
    }

    .pwd-input {
      height: 88rpx;
      background: @bg-secondary;
      border-radius: 20rpx;
      padding: 0 30rpx;
      font-size: 28rpx;
      color: @text-main;
      border: 2rpx solid transparent;
      transition: all 0.3s;
      &:focus {
        border-color: @accent-blue;
        background: @white;
      }
    }
  }
  
  .save-btn {
    width: 100%;
    height: 100rpx;
    line-height: 100rpx;
    /* 渐变色改为灰调蓝系 */
    background: linear-gradient(135deg, @accent-blue, #C2D6E6);
    color: @white;
    font-size: 34rpx;
    font-weight: bold;
    border-radius: 50rpx;
    border: none;
    box-shadow: 0 10rpx 24rpx rgba(159, 184, 207, 0.4);
    letter-spacing: 4rpx;
    
    &::after { border: none; }
    &:active { opacity: 0.9; transform: scale(0.99); }
    &.disabled {
      background: #ffffff;
      /* 禁用文字改为极淡的灰色 */
      color: #DDE4EB;
      box-shadow: none;
    }
  }
}
</style>