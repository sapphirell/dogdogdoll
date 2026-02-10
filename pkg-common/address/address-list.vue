<template>
  <view-logs />
  <view class="address-page font-alimamashuhei">
    <view v-if="loading" class="loading-wrap">
      <uni-icons type="spinner-cycle" size="22" color="#7cc1d2" />
      <text class="loading-text">加载地址中...</text>
    </view>

    <view v-else-if="addressList.length === 0" class="empty-wrap">
      <uni-icons type="location-filled" size="42" color="#c7d8df" />
      <text class="empty-title">还没有收货地址</text>
      <text class="empty-desc">添加后可在下单时快速选择</text>
      <button class="empty-add-btn" @click="goAdd">新增地址</button>
    </view>

    <scroll-view v-else class="list-scroll" scroll-y>
      <view
        v-for="item in addressList"
        :key="item.id"
        class="address-card"
      >
        <view class="card-head">
          <view class="receiver-line">
            <text class="receiver-name">{{ item.receiver_name }}</text>
            <text class="receiver-phone">{{ maskPhone(item.receiver_phone) }}</text>
          </view>
          <text v-if="item.is_default === 1" class="default-tag">默认</text>
        </view>

        <view class="card-address">
          {{ formatArea(item) }} {{ item.detail }}
        </view>

        <view class="card-actions">
          <view
            class="action-item"
            :class="{ disabled: item.is_default === 1 }"
            @click="setDefault(item)"
          >
            {{ item.is_default === 1 ? '默认地址' : '设为默认' }}
          </view>
          <view class="action-item" @click="goEdit(item)">编辑</view>
          <view class="action-item danger" @click="confirmDelete(item)">删除</view>
        </view>
      </view>
      <view class="scroll-bottom-spacer"></view>
    </scroll-view>

    <view class="bottom-bar">
      <button class="add-btn" @click="goAdd">+ 新增收货地址</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { websiteUrl } from '@/common/config.js'

uni.setNavigationBarTitle({ title: '收货地址管理' })

const loading = ref(false)
const addressList = ref([])

function getToken () {
  return uni.getStorageSync('token')
}

function maskPhone (phone) {
  if (!phone) return ''
  const txt = String(phone)
  if (txt.length < 7) return txt
  return txt.replace(/^(\d{3})\d{4}(\d+)/, '$1****$2')
}

function formatArea (item) {
  return [
    item?.province_name || '',
    item?.city_name || '',
    item?.district_name || ''
  ].filter(Boolean).join(' ')
}

async function fetchAddressList () {
  const token = getToken()
  if (!token) {
    addressList.value = []
    return
  }

  loading.value = true
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/address/list`,
      method: 'GET',
      header: { Authorization: token }
    })

    const resp = res?.data || {}
    if (resp.status === 'success' && Array.isArray(resp.data)) {
      addressList.value = resp.data
      return
    }
    addressList.value = []
    uni.showToast({ title: resp.msg || '加载地址失败', icon: 'none' })
  } catch (e) {
    addressList.value = []
    uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function goAdd () {
  uni.navigateTo({ url: '/pkg-common/address/address-form' })
}

function goEdit (item) {
  uni.navigateTo({ url: `/pkg-common/address/address-form?id=${item.id}` })
}

async function setDefault (item) {
  if (item.is_default === 1) return

  const token = getToken()
  if (!token) return

  try {
    uni.showLoading({ title: '设置中...' })
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/address/set-default`,
      method: 'POST',
      header: { Authorization: token },
      data: { id: item.id }
    })
    uni.hideLoading()

    const resp = res?.data || {}
    if (resp.status === 'success') {
      uni.showToast({ title: '默认地址已更新', icon: 'none' })
      fetchAddressList()
      return
    }
    uni.showToast({ title: resp.msg || '设置失败', icon: 'none' })
  } catch (e) {
    uni.hideLoading()
    uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
  }
}

function confirmDelete (item) {
  uni.showModal({
    title: '删除地址',
    content: `确认删除 ${item.receiver_name || ''} 的收货地址吗？`,
    success: async (res) => {
      if (!res.confirm) return
      await deleteAddress(item.id)
    }
  })
}

async function deleteAddress (id) {
  const token = getToken()
  if (!token) return

  try {
    uni.showLoading({ title: '删除中...' })
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/address/delete`,
      method: 'POST',
      header: { Authorization: token },
      data: { id }
    })
    uni.hideLoading()

    const resp = res?.data || {}
    if (resp.status === 'success') {
      uni.showToast({ title: '已删除', icon: 'none' })
      fetchAddressList()
      return
    }
    uni.showToast({ title: resp.msg || '删除失败', icon: 'none' })
  } catch (e) {
    uni.hideLoading()
    uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
  }
}

onShow(() => {
  fetchAddressList()
})
</script>

<style lang="less" scoped>
.address-page {
  min-height: 100vh;
  background: #f5f7f8;
  box-sizing: border-box;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
}

.loading-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18rpx;
  color: #7c9098;
  font-size: 28rpx;
}

.empty-wrap {
  flex: 1;
  margin-top: 120rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.empty-title {
  margin-top: 20rpx;
  font-size: 34rpx;
  color: #44515a;
  font-weight: 600;
}

.empty-desc {
  margin-top: 12rpx;
  font-size: 26rpx;
  color: #95a4ad;
}

.empty-add-btn {
  margin-top: 42rpx;
  width: 300rpx;
  height: 84rpx;
  line-height: 84rpx;
  border-radius: 42rpx;
  background: #7cc1d2;
  color: #fff;
  font-size: 30rpx;
}

.list-scroll {
  flex: 1;
}

.address-card {
  margin-bottom: 18rpx;
  padding: 24rpx;
  border-radius: 20rpx;
  background: #fff;
  box-shadow: 0 8rpx 24rpx rgba(100, 131, 143, 0.08);
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.receiver-line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14rpx;
}

.receiver-name {
  font-size: 32rpx;
  color: #29343b;
  font-weight: 600;
}

.receiver-phone {
  font-size: 28rpx;
  color: #667782;
}

.default-tag {
  padding: 4rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(124, 193, 210, 0.18);
  color: #3a8da2;
  font-size: 24rpx;
  font-weight: 600;
}

.card-address {
  margin-top: 18rpx;
  color: #4e5b64;
  font-size: 28rpx;
  line-height: 1.5;
  word-break: break-all;
}

.card-actions {
  margin-top: 20rpx;
  padding-top: 16rpx;
  border-top: 1px solid #eef2f4;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 30rpx;
}

.action-item {
  font-size: 26rpx;
  color: #5c6d77;
}

.action-item.disabled {
  color: #a6b2b9;
}

.action-item.danger {
  color: #df6262;
}

.scroll-bottom-spacer {
  height: 120rpx;
}

.bottom-bar {
  padding-top: 14rpx;
}

.add-btn {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  border-radius: 45rpx;
  background: #7cc1d2;
  color: #fff;
  font-size: 30rpx;
  font-weight: 600;
  box-shadow: 0 10rpx 24rpx rgba(124, 193, 210, 0.25);
}
</style>
