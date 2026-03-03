<template>
  <view-logs />
  <view class="setting-page">
    <zhouWei-navBar
      type="transparentFixed"
      :backState="2000"
      :homeState="2000"
      fontColor="#1f2b3b"
      transparentFixedFontColor="#1f2b3b"
      :scrollTop="scrollTop"
      :titleCenter="true"
      title="物品显示设置"
    >
      <template #left>
        <view class="nav-back-pill" @click="goBack">
          <uni-icons type="left" size="22" color="#1f2b3b" />
        </view>
      </template>
      <template #transparentFixedLeft>
        <view class="nav-back-pill" @click="goBack">
          <uni-icons type="left" size="22" color="#1f2b3b" />
        </view>
      </template>
    </zhouWei-navBar>

    <view class="page-body" :style="{ paddingTop: headerPadPx }">
      <view class="hero-card">
        <text class="hero-tag font-title">DISPLAY</text>
        <text class="hero-title font-alimamashuhei">我的物品显示设置</text>
        <text class="hero-tip">你可以控制标签显示与价格计算方式，保存后立即生效。</text>
      </view>

      <view class="setting-card">
        <view class="setting-row">
          <view class="setting-main">
            <text class="setting-name font-alimamashuhei">显示尺寸标签</text>
            <text class="setting-desc">在物品卡片上显示尺寸（如四分/六分）</text>
          </view>
          <switch :checked="form.show_size_tag" color="#52b4e8" @change="onSwitch('show_size_tag', $event)" />
        </view>

        <view class="setting-row">
          <view class="setting-main">
            <text class="setting-name font-alimamashuhei">显示价格标签</text>
            <text class="setting-desc">在物品卡片上显示价格文本</text>
          </view>
          <switch :checked="form.show_price_tag" color="#52b4e8" @change="onSwitch('show_price_tag', $event)" />
        </view>

        <view class="setting-row">
          <view class="setting-main">
            <text class="setting-name font-alimamashuhei">显示全款标签</text>
            <text class="setting-desc">显示全款/定金/未买状态标签</text>
          </view>
          <switch :checked="form.show_payment_tag" color="#52b4e8" @change="onSwitch('show_payment_tag', $event)" />
        </view>

        <view class="setting-row">
          <view class="setting-main">
            <text class="setting-name font-alimamashuhei">列表价格包含附加价值</text>
            <text class="setting-desc">如附加值中包含数值，将计入卡片价格显示</text>
          </view>
          <switch :checked="form.include_additional_in_item_price" color="#52b4e8" @change="onSwitch('include_additional_in_item_price', $event)" />
        </view>

        <view class="setting-row no-border">
          <view class="setting-main">
            <text class="setting-name font-alimamashuhei">总价包含附加价值</text>
            <text class="setting-desc">将附加值中的数值计入当前分类合计</text>
          </view>
          <switch :checked="form.include_additional_in_total" color="#52b4e8" @change="onSwitch('include_additional_in_total', $event)" />
        </view>
      </view>

      <view class="bottom-space"></view>
    </view>

    <view class="dock">
      <button class="save-btn font-alimamashuhei" :loading="saving" :disabled="saving || loading" @tap="saveSetting">
        保存设置
      </button>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onShow, onPageScroll } from '@dcloudio/uni-app'
import { websiteUrl, getStatusBarHeight, getNavBarHeight, toPx } from '@/common/config.js'

const DEFAULT_FORM = Object.freeze({
  show_size_tag: true,
  show_price_tag: true,
  show_payment_tag: true,
  include_additional_in_item_price: false,
  include_additional_in_total: false
})

const scrollTop = ref(0)
const loading = ref(false)
const saving = ref(false)

const form = ref({ ...DEFAULT_FORM })
const headerPadPx = computed(() => toPx(getStatusBarHeight() + getNavBarHeight()))

onPageScroll((e) => {
  scrollTop.value = e?.scrollTop || 0
})

function token() {
  return uni.getStorageSync('token') || ''
}

function normalizePayload(payload) {
  const p = payload || {}
  const boolOf = (v, fallback) => {
    if (typeof v === 'boolean') return v
    if (typeof v === 'number') return v === 1
    if (typeof v === 'string') {
      const txt = v.trim().toLowerCase()
      if (txt === '1' || txt === 'true' || txt === 'yes' || txt === 'on') return true
      if (txt === '0' || txt === 'false' || txt === 'no' || txt === 'off' || txt === '') return false
    }
    return fallback
  }
  return {
    show_size_tag: boolOf(p.show_size_tag, true),
    show_price_tag: boolOf(p.show_price_tag, true),
    show_payment_tag: boolOf(p.show_payment_tag, true),
    include_additional_in_item_price: boolOf(p.include_additional_in_item_price, false),
    include_additional_in_total: boolOf(p.include_additional_in_total, false)
  }
}

async function fetchSetting() {
  loading.value = true
  try {
    const res = await uni.request({
      url: websiteUrl.value + '/with-state/account-book-display-setting',
      method: 'GET',
      header: { Authorization: token() }
    })
    if (String(res?.data?.status || '').toLowerCase() !== 'success') {
      throw new Error(res?.data?.msg || res?.data?.message || res?.data?.error || '加载失败')
    }
    form.value = normalizePayload(res?.data?.data || {})
  } catch (err) {
    form.value = { ...DEFAULT_FORM }
    uni.showToast({ title: err?.message || '加载设置失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function onSwitch(key, e) {
  if (!key) return
  const raw = e?.detail?.value
  if (typeof raw === 'boolean') {
    form.value[key] = raw
    return
  }
  if (typeof raw === 'number') {
    form.value[key] = raw === 1
    return
  }
  if (typeof raw === 'string') {
    const txt = raw.trim().toLowerCase()
    form.value[key] = txt === '1' || txt === 'true' || txt === 'on' || txt === 'yes'
    return
  }
  form.value[key] = !!raw
}

async function saveSetting() {
  if (saving.value) return
  saving.value = true
  try {
    const payload = {
      show_size_tag: !!form.value.show_size_tag,
      show_price_tag: !!form.value.show_price_tag,
      show_payment_tag: !!form.value.show_payment_tag,
      include_additional_in_item_price: !!form.value.include_additional_in_item_price,
      include_additional_in_total: !!form.value.include_additional_in_total
    }
    const res = await uni.request({
      url: websiteUrl.value + '/with-state/account-book-display-setting',
      method: 'POST',
      header: {
        Authorization: token(),
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(payload)
    })
    if (String(res?.data?.status || '').toLowerCase() !== 'success') {
      throw new Error(res?.data?.msg || res?.data?.message || res?.data?.error || '保存失败')
    }
    form.value = normalizePayload(res?.data?.data || payload)
    uni.showToast({ title: '设置已保存', icon: 'none' })
  } catch (err) {
    uni.showToast({ title: err?.message || '保存失败', icon: 'none' })
  } finally {
    saving.value = false
  }
}

function goBack() {
  uni.navigateBack({ delta: 1 })
}

onShow(() => {
  fetchSetting()
})
</script>

<style lang="scss" scoped>
.setting-page {
  min-height: 100vh;
  background:
    radial-gradient(1200rpx 620rpx at 100% -8%, rgba(146, 196, 235, 0.28), rgba(146, 196, 235, 0)),
    linear-gradient(180deg, #d8deff 0%, #d3f5ff 42%, #f4fbff 100%);
}

.page-body {
  padding-left: 24rpx;
  padding-right: 24rpx;
}

.hero-card {
  margin-top: 14rpx;
  border-radius: 24rpx;
  padding: 28rpx 24rpx;
  background: linear-gradient(145deg, rgba(213, 233, 255, 0.96), rgba(226, 244, 255, 0.96));
  border: 1rpx solid #d6e8f9;
  box-shadow: 0 12rpx 28rpx rgba(76, 129, 170, 0.12);
}

.hero-tag {
  display: inline-flex;
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  background: rgba(86, 158, 205, 0.16);
  color: #4b78a3;
  font-size: 18rpx;
}

.hero-title {
  display: block;
  margin-top: 12rpx;
  font-size: 38rpx;
  color: #1f3f5d;
}

.hero-tip {
  display: block;
  margin-top: 10rpx;
  font-size: 23rpx;
  color: #5f86aa;
  line-height: 1.6;
}

.setting-card {
  margin-top: 22rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.95);
  border: 1rpx solid #dbeaf8;
  box-shadow: 0 10rpx 24rpx rgba(84, 130, 166, 0.08);
  overflow: hidden;
}

.setting-row {
  padding: 26rpx 22rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  border-bottom: 1rpx solid #e5eef8;
}

.setting-row.no-border {
  border-bottom: none;
}

.setting-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.setting-name {
  color: #275074;
  font-size: 30rpx;
  line-height: 1.25;
}

.setting-desc {
  color: #6d8daa;
  font-size: 22rpx;
  line-height: 1.4;
}

.bottom-space {
  height: 180rpx;
}

.dock {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 14rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));
  padding: 14rpx 24rpx calc(16rpx + constant(safe-area-inset-bottom));
  background: rgba(244, 251, 255, 0.92);
  backdrop-filter: blur(10rpx);
  border-top: 1rpx solid #dce9f6;
}

.save-btn {
  height: 82rpx;
  border-radius: 16rpx;
  border: none;
  background: linear-gradient(140deg, #52b4e8 0%, #4aa8de 60%, #59b8ef 100%);
  color: #fff;
  font-size: 30rpx;
  line-height: 82rpx;
  box-shadow: 0 10rpx 20rpx rgba(68, 127, 172, 0.25);
}

.save-btn::after {
  border: none;
}
</style>
