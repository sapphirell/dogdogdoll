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
          <view class="head-right">
            <view v-if="item.is_default === 1" class="default-tag">默认</view>
            <view class="edit-tag" @tap.stop="goEditAddress(item.id)">编辑</view>
          </view>
        </view>
        <text class="address-line">{{ formatArea(item) }} {{ item.detail || '' }}</text>
        <view v-if="item.suggested_express && item.suggested_express.length" class="express-row">
          <text class="express-label">勾选快递</text>
          <view class="express-tags">
            <text
              v-for="(name, idx) in item.suggested_express"
              :key="`${item.id}-${name}-${idx}`"
              class="express-tag"
            >
              {{ name }}
            </text>
          </view>
        </view>
      </view>
      <view class="list-bottom-gap"></view>
    </scroll-view>

    <view class="footer-bar">
      <button class="footer-btn plain" @tap="goAddAddress">新增地址</button>
      <button
        class="footer-btn submit"
        :class="{ disabled: !canSubmit || submitting }"
        :disabled="!canSubmit || submitting"
        @tap="submitReturnAddress"
      >
        {{ submitting ? '提交中...' : '选择此地址' }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { websiteUrl } from '@/common/config.js'

const FinalConfirmResumeStorageKey = 'artist_order:final_confirm_resume'

const submissionID = ref(0)
const loading = ref(false)
const submitting = ref(false)
const addressList = ref([])
const selectedAddressID = ref(0)
const autoConfirmFinal = ref(false)
const autoConfirmItemID = ref(0)

const canSubmit = computed(() => Number(submissionID.value) > 0 && Number(selectedAddressID.value) > 0)

function formatArea(item) {
  return [
    item?.province_name || '',
    item?.city_name || '',
    item?.district_name || ''
  ].filter(Boolean).join(' ')
}

function normalizeSuggestedExpressList(list) {
  if (!Array.isArray(list) || !list.length) return []
  const uniq = []
  list.forEach((item) => {
    const txt = String(item || '').trim()
    if (!txt) return
    if (uniq.includes(txt)) return
    uniq.push(txt)
  })
  return uniq
}

function parseSuggestedExpressField(value) {
  if (Array.isArray(value)) return normalizeSuggestedExpressList(value)
  const txt = String(value || '').trim()
  if (!txt) return []
  if (txt.startsWith('[') && txt.endsWith(']')) {
    try {
      const parsed = JSON.parse(txt)
      if (Array.isArray(parsed)) return normalizeSuggestedExpressList(parsed)
    } catch (_) {}
  }
  return normalizeSuggestedExpressList(txt.split(','))
}

function normalizeAddressItem(item) {
  if (!item || typeof item !== 'object') return item
  return {
    ...item,
    suggested_express: parseSuggestedExpressField(item.suggested_express)
  }
}

function pickAddress(id) {
  const n = Number(id || 0)
  if (n > 0) selectedAddressID.value = n
}

function goAddAddress() {
  uni.navigateTo({ url: '/pkg-common/address/address-form' })
}

function goEditAddress(id) {
  const n = Number(id || 0)
  if (!n) return
  uni.navigateTo({ url: `/pkg-common/address/address-form?id=${n}` })
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
    const list = Array.isArray(body.data) ? body.data.map(normalizeAddressItem) : []
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
    let finalConfirmDone = false
    if (autoConfirmFinal.value && Number(autoConfirmItemID.value || 0) > 0) {
      try {
        const finalRes = await uni.request({
          url: `${websiteUrl.value}/with-state/artist-order/item/confirm-final`,
          method: 'POST',
          header: {
            Authorization: token,
            'Content-Type': 'application/json'
          },
          data: {
            item_id: Number(autoConfirmItemID.value || 0)
          }
        })
        const finalBody = finalRes?.data || {}
        if (String(finalBody.status).toLowerCase() === 'success') {
          finalConfirmDone = true
          uni.removeStorageSync(FinalConfirmResumeStorageKey)
        } else {
          uni.setStorageSync(FinalConfirmResumeStorageKey, {
            submission_id: Number(submissionID.value || 0),
            item_id: Number(autoConfirmItemID.value || 0),
            ts: Date.now()
          })
        }
      } catch (_) {
        uni.setStorageSync(FinalConfirmResumeStorageKey, {
          submission_id: Number(submissionID.value || 0),
          item_id: Number(autoConfirmItemID.value || 0),
          ts: Date.now()
        })
      }
    }
    uni.showToast({ title: finalConfirmDone ? '已确认最终状态' : '已选择寄回地址', icon: 'success' })
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
  autoConfirmFinal.value = String(options?.auto_confirm_final || '') === '1'
  autoConfirmItemID.value = Number(options?.item_id || 0)
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
  padding-bottom: calc(constant(safe-area-inset-bottom) + 170rpx);
  padding-bottom: calc(env(safe-area-inset-bottom) + 170rpx);
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
  background: linear-gradient(135deg, #8fdcf8 0%, #72c7ec 100%);
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
  border-color: #acedff;
  box-shadow: 0 8rpx 20rpx rgba(114, 199, 236, 0.2);
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

.head-right {
  display: flex;
  align-items: center;
  gap: 10rpx;
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
  border: 1rpx solid #72c7ec;
}

.edit-tag {
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
  background: #f1f5fb;
  color: #5f7291;
  font-size: 20rpx;
}

.address-line {
  margin-top: 10rpx;
  display: block;
  font-size: 23rpx;
  line-height: 1.6;
  color: #6f7f98;
}

.express-row {
  margin-top: 10rpx;
  display: flex;
  align-items: flex-start;
  gap: 10rpx;
}

.express-label {
  flex-shrink: 0;
  margin-top: 2rpx;
  font-size: 21rpx;
  color: #7f8ea6;
}

.express-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.express-tag {
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  background: #7accef;
  color: #fff;
  font-size: 20rpx;
  line-height: 1.2;
}

.list-bottom-gap {
  height: 180rpx;
}

.footer-bar {
  position: fixed;
  left: 20rpx;
  right: 20rpx;
  bottom: calc(constant(safe-area-inset-bottom) + 16rpx);
  bottom: calc(env(safe-area-inset-bottom) + 16rpx);
  padding-top: 12rpx;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  box-sizing: border-box;
  z-index: 30;
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
  background: #f8d6e7;
  color: #fff;
}

.footer-btn.submit {
  background: linear-gradient(135deg, #8fdcf8 0%, #72c7ec 100%);
  color: #fff;
}

.footer-btn.submit.disabled {
  background: #d8dfec;
  color: #97a4bc;
}
</style>
