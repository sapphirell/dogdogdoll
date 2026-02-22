<template>
  <view-logs />
  <view class="return-address-page font-alimamashuhei">
    <view class="header-card">
      <text class="header-title">填写寄回地址</text>
      <text class="header-desc">请选择一个收货地址作为本订单的寄回地址</text>
    </view>

    <view v-if="loading" class="state-box">
      <text class="state-text">加载地址中...</text>
    </view>

    <view v-else-if="!addressList.length" class="state-box">
      <text class="state-text">您还没有收货地址</text>
      <button class="state-btn" @tap="goAddAddress">去新增地址</button>
    </view>

    <scroll-view v-else class="list-scroll" scroll-y>
      <view
        v-for="item in addressList"
        :key="item.id"
        class="address-card"
        :class="{ active: Number(selectedAddressID) === Number(item.id) }"
        @tap="pickAddress(item.id)"
      >
        <view class="card-head">
          <view class="head-left">
            <text class="receiver-name">{{ item.receiver_name || '-' }}</text>
            <text class="receiver-phone">{{ item.receiver_phone || '-' }}</text>
          </view>
          <view v-if="item.is_default === 1" class="default-tag">默认</view>
        </view>
        <text class="address-line">{{ formatArea(item) }} {{ item.detail || '' }}</text>
      </view>
      <view class="list-bottom-gap"></view>
    </scroll-view>

    <view class="footer-bar">
      <button class="footer-btn plain" @tap="goManageAddress">管理地址</button>
      <button
        class="footer-btn submit"
        :class="{ disabled: !canSubmit || submitting }"
        :disabled="!canSubmit || submitting"
        @tap="submitReturnAddress"
      >
        {{ submitting ? '提交中...' : '保存地址' }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { websiteUrl } from '@/common/config.js'

const submissionID = ref(0)
const loading = ref(false)
const submitting = ref(false)
const addressList = ref([])
const selectedAddressID = ref(0)

const canSubmit = computed(() => Number(submissionID.value) > 0 && Number(selectedAddressID.value) > 0)

function formatArea(item) {
  return [
    item?.province_name || '',
    item?.city_name || '',
    item?.district_name || ''
  ].filter(Boolean).join(' ')
}

function pickAddress(id) {
  const n = Number(id || 0)
  if (n > 0) selectedAddressID.value = n
}

function goManageAddress() {
  uni.navigateTo({ url: '/pkg-common/address/address-list' })
}

function goAddAddress() {
  uni.navigateTo({ url: '/pkg-common/address/address-form' })
}

async function fetchAddressList() {
  const token = uni.getStorageSync('token') || ''
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  loading.value = true
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/address/list`,
      method: 'GET',
      header: { Authorization: token }
    })
    const body = res?.data || {}
    if (String(body.status).toLowerCase() !== 'success') {
      addressList.value = []
      uni.showToast({ title: body.msg || '地址加载失败', icon: 'none' })
      return
    }
    const list = Array.isArray(body.data) ? body.data : []
    addressList.value = list
    if (!list.length) {
      selectedAddressID.value = 0
      return
    }
    const current = Number(selectedAddressID.value || 0)
    const exists = list.some((row) => Number(row?.id || 0) === current)
    if (exists) return
    const def = list.find((row) => Number(row?.is_default || 0) === 1)
    selectedAddressID.value = Number(def?.id || list[0]?.id || 0)
  } catch (_) {
    addressList.value = []
    uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}

async function submitReturnAddress() {
  if (submitting.value || !canSubmit.value) return
  const token = uni.getStorageSync('token') || ''
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  submitting.value = true
  uni.showLoading({ title: '保存中' })
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/artist-order/submission/return-address`,
      method: 'POST',
      header: {
        Authorization: token,
        'Content-Type': 'application/json'
      },
      data: {
        submission_id: Number(submissionID.value || 0),
        address_id: Number(selectedAddressID.value || 0)
      }
    })
    const body = res?.data || {}
    if (String(body.status).toLowerCase() !== 'success') {
      uni.showToast({ title: body.msg || '保存失败', icon: 'none' })
      return
    }
    uni.showToast({ title: '已保存', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack({ delta: 1 })
    }, 350)
  } catch (_) {
    uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
  } finally {
    uni.hideLoading()
    submitting.value = false
  }
}

onLoad((options) => {
  uni.setNavigationBarTitle({ title: '寄回地址' })
  submissionID.value = Number(options?.submission_id || 0)
  if (!submissionID.value) {
    uni.showToast({ title: '缺少 submission_id', icon: 'none' })
  }
})

onShow(() => {
  fetchAddressList()
})
</script>

<style scoped lang="scss">
.return-address-page {
  min-height: 100vh;
  background: #f6f8fc;
  padding: 20rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.header-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 20rpx;
}

.header-title {
  display: block;
  font-size: 30rpx;
  color: #2d3b50;
}

.header-desc {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #8190a7;
}

.state-box {
  margin-top: 18rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx 20rpx;
  text-align: center;
}

.state-text {
  font-size: 24rpx;
  color: #6f7f98;
}

.state-btn {
  margin-top: 16rpx;
  width: 280rpx;
  height: 70rpx;
  line-height: 70rpx;
  border-radius: 999rpx;
  border: none;
  background: #7ea0ef;
  color: #fff;
  font-size: 24rpx;
}

.list-scroll {
  flex: 1;
  margin-top: 18rpx;
}

.address-card {
  background: #fff;
  border-radius: 18rpx;
  padding: 18rpx;
  margin-bottom: 12rpx;
  border: 2rpx solid transparent;
}

.address-card.active {
  border-color: #9ab8ff;
  box-shadow: 0 8rpx 20rpx rgba(122, 154, 223, 0.16);
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.head-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.receiver-name {
  font-size: 28rpx;
  color: #2d3b50;
}

.receiver-phone {
  font-size: 24rpx;
  color: #64758f;
}

.default-tag {
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  background: #eef4ff;
  color: #6d88bb;
  font-size: 20rpx;
}

.address-line {
  margin-top: 10rpx;
  display: block;
  font-size: 23rpx;
  line-height: 1.6;
  color: #6f7f98;
}

.list-bottom-gap {
  height: 120rpx;
}

.footer-bar {
  padding-top: 12rpx;
  display: flex;
  gap: 12rpx;
}

.footer-btn {
  flex: 1;
  height: 72rpx;
  line-height: 72rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  font-weight: 600;
  border: none;
  margin: 0;
}

.footer-btn::after {
  border: none;
}

.footer-btn.plain {
  background: #e9eff9;
  color: #5f7291;
}

.footer-btn.submit {
  background: linear-gradient(135deg, #9ab8ff 0%, #7ea0ef 100%);
  color: #fff;
}

.footer-btn.submit.disabled {
  background: #d8dfec;
  color: #97a4bc;
}
</style>
