<template>
  <view-logs />
  <view class="setting-page">
    <zhouWei-navBar
      type="transparentFixed"
      :backState="2000"
      :homeState="2000"
      fontColor="#586478"
      transparentFixedFontColor="#586478"
      :scrollTop="scrollTop"
      :titleCenter="true"
      title="物品显示设置"
    >
      <template #left>
        <view class="nav-back-pill" @click="goBack">
          <uni-icons type="left" size="22" color="#586478" />
        </view>
      </template>
      <template #transparentFixedLeft>
        <view class="nav-back-pill" @click="goBack">
          <uni-icons type="left" size="22" color="#586478" />
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
        <view class="setting-row setting-row-action" @tap="openViewModePopup">
          <view class="setting-main">
            <text class="setting-name font-alimamashuhei">切换视图</text>
            <text class="setting-desc">可切换为物品视图或柜子视图</text>
          </view>
          <view class="setting-action-pill">
            <text class="setting-action-text">{{ currentViewModeLabel }}</text>
            <uni-icons type="right" size="15" color="#7f97ae" />
          </view>
        </view>

        <view class="setting-row">
          <view class="setting-main">
            <text class="setting-name font-alimamashuhei">显示尺寸标签</text>
            <text class="setting-desc">在物品卡片上显示尺寸（如四分/六分）</text>
          </view>
          <switch :checked="form.show_size_tag" color="#78daf5" @change="onSwitch('show_size_tag', $event)" />
        </view>

        <view class="setting-row">
          <view class="setting-main">
            <text class="setting-name font-alimamashuhei">显示类型标签</text>
            <text class="setting-desc">在图片左上角显示物品类型标签</text>
          </view>
          <switch :checked="form.show_type_tag" color="#78daf5" @change="onSwitch('show_type_tag', $event)" />
        </view>

        <view class="setting-row">
          <view class="setting-main">
            <text class="setting-name font-alimamashuhei">显示价格标签</text>
            <text class="setting-desc">在物品卡片上显示价格文本</text>
          </view>
          <switch :checked="form.show_price_tag" color="#78daf5" @change="onSwitch('show_price_tag', $event)" />
        </view>

        <view class="setting-row">
          <view class="setting-main">
            <text class="setting-name font-alimamashuhei">显示物品信息</text>
            <text class="setting-desc">显示名称与价格区域</text>
          </view>
          <switch :checked="form.show_item_info" color="#78daf5" @change="onSwitch('show_item_info', $event)" />
        </view>

        <view class="setting-row">
          <view class="setting-main">
            <text class="setting-name font-alimamashuhei">显示全款标签</text>
            <text class="setting-desc">显示全款/定金/未买状态标签</text>
          </view>
          <switch :checked="form.show_payment_tag" color="#78daf5" @change="onSwitch('show_payment_tag', $event)" />
        </view>

        <view class="setting-row">
          <view class="setting-main">
            <text class="setting-name font-alimamashuhei">列表价格包含附加价值</text>
            <text class="setting-desc">如附加值中包含数值，将计入卡片价格显示</text>
          </view>
          <switch :checked="form.include_additional_in_item_price" color="#78daf5" @change="onSwitch('include_additional_in_item_price', $event)" />
        </view>

        <view class="setting-row">
          <view class="setting-main">
            <text class="setting-name font-alimamashuhei">列表价格按数量计算</text>
            <text class="setting-desc">外层卡片价格按单价乘以个数后显示</text>
          </view>
          <switch :checked="form.include_count_in_item_price" color="#78daf5" @change="onSwitch('include_count_in_item_price', $event)" />
        </view>

        <view class="setting-row">
          <view class="setting-main">
            <text class="setting-name font-alimamashuhei">总价包含附加价值</text>
            <text class="setting-desc">将附加值中的数值计入当前分类合计</text>
          </view>
          <switch :checked="form.include_additional_in_total" color="#78daf5" @change="onSwitch('include_additional_in_total', $event)" />
        </view>

        <view class="setting-row no-border">
          <view class="setting-main">
            <text class="setting-name font-alimamashuhei">合计按数量计算</text>
            <text class="setting-desc">当前分类合计按单价乘以个数后统计</text>
          </view>
          <switch :checked="form.include_count_in_total" color="#78daf5" @change="onSwitch('include_count_in_total', $event)" />
        </view>
      </view>

      <view class="bottom-space"></view>
    </view>

    <view class="dock">
      <button class="save-btn font-alimamashuhei" :loading="saving" :disabled="saving || loading" @tap="saveSetting">
        保存设置
      </button>
    </view>

    <bottom-popup :show="showViewModePopup" @close="closeViewModePopup">
      <view class="view-mode-popup">
        <view class="view-mode-head">
          <text class="view-mode-title font-alimamashuhei">切换视图</text>
          <text class="view-mode-close font-title" @tap="closeViewModePopup">关闭</text>
        </view>
        <view class="view-mode-list">
          <view
            v-for="option in viewModeOptions"
            :key="option.value"
            class="view-mode-item"
            :class="{ active: viewMode === option.value }"
            @tap="selectViewMode(option.value)"
          >
            <view class="view-mode-item-main">
              <text class="view-mode-item-name font-alimamashuhei">{{ option.label }}</text>
              <text class="view-mode-item-desc">{{ option.desc }}</text>
            </view>
            <uni-icons v-if="viewMode === option.value" type="checkmarkempty" size="18" color="#78daf5" />
            <uni-icons v-else type="right" size="15" color="#8ea3b8" />
          </view>
        </view>
      </view>
    </bottom-popup>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onShow, onPageScroll } from '@dcloudio/uni-app'
import { websiteUrl, getStatusBarHeight, getNavBarHeight, toPx } from '@/common/config.js'

const DEFAULT_FORM = Object.freeze({
  show_size_tag: true,
  show_type_tag: true,
  show_price_tag: true,
  show_item_info: true,
  show_payment_tag: true,
  include_additional_in_item_price: false,
  include_additional_in_total: false,
  include_count_in_item_price: false,
  include_count_in_total: false
})

const scrollTop = ref(0)
const loading = ref(false)
const saving = ref(false)
const showViewModePopup = ref(false)

const form = ref({ ...DEFAULT_FORM })
const headerPadPx = computed(() => toPx(getStatusBarHeight() + getNavBarHeight()))
const ACCOUNT_BOOK_VIEW_MODE_KEY = 'accountBookViewMode'
const VIEW_MODE_ITEM = 'item'
const VIEW_MODE_CABINET = 'cabinet'
const viewMode = ref(loadStoredViewMode())
const viewModeOptions = Object.freeze([
  { value: VIEW_MODE_ITEM, label: '物品视图', desc: '按当前分类显示并支持拖拽排序' },
  { value: VIEW_MODE_CABINET, label: '柜子视图', desc: '首页展示全部分类，每类最多显示 5 条' }
])
const currentViewModeLabel = computed(() => {
  const matched = viewModeOptions.find(item => item.value === viewMode.value)
  return matched?.label || '物品视图'
})

function normalizeViewMode(raw) {
  const txt = String(raw || '').trim().toLowerCase()
  if (txt === VIEW_MODE_CABINET) return VIEW_MODE_CABINET
  return VIEW_MODE_ITEM
}

function loadStoredViewMode() {
  return normalizeViewMode(uni.getStorageSync(ACCOUNT_BOOK_VIEW_MODE_KEY))
}

function saveViewMode(mode) {
  viewMode.value = normalizeViewMode(mode)
  uni.setStorageSync(ACCOUNT_BOOK_VIEW_MODE_KEY, viewMode.value)
}

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
    show_type_tag: boolOf(p.show_type_tag, true),
    show_price_tag: boolOf(p.show_price_tag, true),
    show_item_info: boolOf(p.show_item_info, true),
    show_payment_tag: boolOf(p.show_payment_tag, true),
    include_additional_in_item_price: boolOf(p.include_additional_in_item_price, false),
    include_additional_in_total: boolOf(p.include_additional_in_total, false),
    include_count_in_item_price: boolOf(p.include_count_in_item_price, false),
    include_count_in_total: boolOf(p.include_count_in_total, false)
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

function openViewModePopup() {
  showViewModePopup.value = true
}

function closeViewModePopup() {
  showViewModePopup.value = false
}

function selectViewMode(mode) {
  saveViewMode(mode)
  closeViewModePopup()
}

async function saveSetting() {
  if (saving.value) return
  saving.value = true
  try {
    const payload = {
      show_size_tag: !!form.value.show_size_tag,
      show_type_tag: !!form.value.show_type_tag,
      show_price_tag: !!form.value.show_price_tag,
      show_item_info: !!form.value.show_item_info,
      show_payment_tag: !!form.value.show_payment_tag,
      include_additional_in_item_price: !!form.value.include_additional_in_item_price,
      include_additional_in_total: !!form.value.include_additional_in_total,
      include_count_in_item_price: !!form.value.include_count_in_item_price,
      include_count_in_total: !!form.value.include_count_in_total
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
    saveViewMode(viewMode.value)
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
  viewMode.value = loadStoredViewMode()
  fetchSetting()
})
</script>

<style lang="scss" scoped>
.setting-page {
  min-height: 100vh;
  background:
    radial-gradient(680rpx 300rpx at 100% -10%, rgba(73, 202, 238, 0.08), rgba(73, 202, 238, 0)),
    linear-gradient(180deg, #fbfcfe 0%, #ffffff 46%);
}

.page-body {
  padding-left: 24rpx;
  padding-right: 24rpx;
}

.hero-card {
  margin-top: 14rpx;
  border-radius: 24rpx;
  padding: 28rpx 24rpx;
  background: #ffffff;
  box-shadow: 0 10rpx 26rpx rgba(33, 50, 71, 0.08);
}

.hero-tag {
  display: inline-flex;
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  background: rgba(73, 202, 238, 0.12);
  color: #3f97b2;
  font-size: 18rpx;
}

.hero-title {
  display: block;
  margin-top: 12rpx;
  font-size: 38rpx;
  color: #586478;
}

.hero-tip {
  display: block;
  margin-top: 10rpx;
  font-size: 23rpx;
  color: #738195;
  line-height: 1.6;
}

.setting-card {
  margin-top: 22rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 20rpx rgba(33, 50, 71, 0.07);
  padding: 8rpx 0;
}

.setting-row {
  padding: 26rpx 22rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
}

.setting-row-action {
  padding-top: 24rpx;
  padding-bottom: 18rpx;
}

.setting-row.no-border {
  padding-bottom: 30rpx;
}

.setting-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.setting-name {
  color: #586478;
  font-size: 30rpx;
  line-height: 1.25;
}

.setting-desc {
  color: #7d8798;
  font-size: 22rpx;
  line-height: 1.4;
}

.setting-action-pill {
  height: 62rpx;
  padding: 0 16rpx;
  border-radius: 999rpx;
  background: #f2f9fc;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 10rpx;
  box-shadow: 0 6rpx 14rpx rgba(73, 202, 238, 0.14);
}

.setting-action-text {
  font-size: 24rpx;
  color: #4e657d;
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
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(10rpx);
}

.save-btn {
  height: 82rpx;
  border-radius: 16rpx;
  border: none;
  background: #78daf5;
  color: #fff;
  font-size: 30rpx;
  line-height: 82rpx;
  box-shadow: 0 8rpx 18rpx rgba(73, 202, 238, 0.28);
}

.save-btn::after {
  border: none;
}

.view-mode-popup {
  background: #fff;
  border-top-left-radius: 26rpx;
  border-top-right-radius: 26rpx;
  padding: 16rpx 24rpx calc(24rpx + env(safe-area-inset-bottom));
  padding: 16rpx 24rpx calc(24rpx + constant(safe-area-inset-bottom));
}

.view-mode-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14rpx;
}

.view-mode-title {
  font-size: 32rpx;
  color: #586478;
}

.view-mode-close {
  font-size: 22rpx;
  color: #8a94a4;
  padding: 8rpx 6rpx;
}

.view-mode-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.view-mode-item {
  min-height: 92rpx;
  border-radius: 18rpx;
  padding: 16rpx 18rpx;
  background: #f7f9fc;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14rpx;
  box-shadow: 0 6rpx 14rpx rgba(33, 50, 71, 0.08);
}

.view-mode-item.active {
  background: rgba(73, 202, 238, 0.12);
  box-shadow: 0 8rpx 18rpx rgba(73, 202, 238, 0.18);
}

.view-mode-item-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.view-mode-item-name {
  font-size: 27rpx;
  color: #586478;
}

.view-mode-item-desc {
  font-size: 21rpx;
  color: #7f8a9a;
}
</style>
