<template>
  <view-logs />
  <view class="skin-page font-alimamashuhei">
    <view class="page-desc">选择你喜欢的页面皮肤</view>

    <view v-if="loading" class="state-text">加载中...</view>
    <view v-else-if="skinList.length === 0" class="state-text">暂无可用皮肤</view>

    <view v-else class="skin-list">
      <view
        v-for="skin in skinList"
        :key="skin.id"
        class="skin-card"
        :class="{ 'skin-card-active': Number(selectedSkinId) === Number(skin.id) }"
        @tap="onSelectSkin(skin)"
      >
        <view class="preview" :style="previewStyle(skin)"></view>

        <view class="meta">
          <text class="name">{{ skin.name || '-' }}</text>
          <text class="desc">{{ skin.description || '支持背景色/背景图/背景动画' }}</text>
        </view>

        <view class="action">
          <text class="action-text">
            {{ Number(selectedSkinId) === Number(skin.id) ? '已使用' : '使用' }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { websiteUrl, asyncGetUserInfo } from '@/common/config.js'

uni.setNavigationBarTitle({ title: '个性皮肤' })

const loading = ref(false)
const saving = ref(false)
const skinList = ref([])
const selectedSkinId = ref(0)
const noneSkinOption = {
  id: 0,
  name: '无皮肤',
  description: '关闭背景图与背景动画，使用默认白色背景',
  preview_image: '',
  background_color: '#ffffff',
  background_image: '',
  background_animation: ''
}

function requestWithToken ({ url, method = 'GET', data }) {
  return new Promise((resolve) => {
    const token = uni.getStorageSync('token')
    if (!token) {
      resolve({ ok: false, data: null })
      return
    }
    uni.request({
      url,
      method,
      data,
      timeout: 15000,
      header: { Authorization: token },
      success: (res) => resolve({ ok: true, data: res?.data }),
      fail: () => resolve({ ok: false, data: null })
    })
  })
}

function normalizeSkin (raw) {
  if (!raw || typeof raw !== 'object') return null
  return {
    id: Number(raw.id || 0),
    name: String(raw.name || ''),
    description: String(raw.description || ''),
    preview_image: normalizePreviewImage(raw.preview_image),
    background_color: String(raw.background_color || ''),
    background_image: String(raw.background_image || ''),
    background_animation: String(raw.background_animation || '')
  }
}

function normalizePreviewImage (value) {
  const txt = String(value || '').trim()
  if (!txt) return ''
  if (/^https?:\/\//i.test(txt) || txt.startsWith('data:')) return txt
  if (txt.startsWith('//')) return `https:${txt}`
  if (txt.startsWith('/')) return txt
  return `https://images1.fantuanpu.com/${txt.replace(/^\/+/, '')}`
}

async function fetchSkinList () {
  loading.value = true
  const ret = await requestWithToken({
    url: `${websiteUrl.value}/with-state/skin/list`,
    method: 'GET'
  })
  loading.value = false

  const resp = ret?.data || {}
  if (!ret.ok || String(resp.status || '').toLowerCase() !== 'success') {
    skinList.value = []
    selectedSkinId.value = 0
    uni.showToast({ title: '加载皮肤失败', icon: 'none' })
    return
  }

  const list = Array.isArray(resp?.data?.skins) ? resp.data.skins : []
  const enabledSkins = list.map(normalizeSkin).filter(Boolean)
  skinList.value = [noneSkinOption, ...enabledSkins]
  selectedSkinId.value = Number(resp?.data?.selected_skin_id || 0)
}

async function onSelectSkin (skin) {
  if (!skin || saving.value) return
  if (Number(selectedSkinId.value) === Number(skin.id)) return

  saving.value = true
  const ret = await requestWithToken({
    url: `${websiteUrl.value}/with-state/skin/select`,
    method: 'POST',
    data: { skin_id: Number(skin.id) }
  })
  saving.value = false

  const resp = ret?.data || {}
  if (!ret.ok || String(resp.status || '').toLowerCase() !== 'success') {
    uni.showToast({ title: resp.msg || '保存失败', icon: 'none' })
    return
  }

  selectedSkinId.value = Number(skin.id)
  uni.showToast({ title: '已切换皮肤', icon: 'none' })
  await asyncGetUserInfo()
}

function previewStyle (skin) {
  const style = {
    backgroundColor: '#ffffff',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }
  const previewImage = normalizePreviewImage(skin?.preview_image)
  if (previewImage) style.backgroundImage = `url('${previewImage}')`
  return style
}

onShow(() => {
  fetchSkinList()
})
</script>

<style lang="scss" scoped>
.skin-page {
  min-height: 100vh;
  background: #f6f8fb;
  padding: 24rpx 24rpx 40rpx;
  box-sizing: border-box;
}

.page-desc {
  font-size: 26rpx;
  color: #6f7785;
  margin-bottom: 18rpx;
}

.state-text {
  margin-top: 180rpx;
  text-align: center;
  color: #97a0af;
  font-size: 26rpx;
}

.skin-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.skin-card {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 18rpx;
  border-radius: 20rpx;
  background: #ffffff;
  border: 2rpx solid transparent;
  transition: all 0.18s ease;
}

.skin-card-active {
  border-color: #88d6ea;
  box-shadow: 0 10rpx 24rpx rgba(112, 193, 220, 0.14);
}

.preview {
  width: 148rpx;
  height: 104rpx;
  border-radius: 16rpx;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  border: 1rpx solid #edf1f5;
}

.skin-card-active .preview {
  box-shadow: inset 0 0 0 2rpx rgba(127, 196, 222, 0.45);
}

.meta {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.name {
  font-size: 30rpx;
  color: #1f2430;
}

.desc {
  margin-top: 8rpx;
  font-size: 23rpx;
  line-height: 1.45;
  color: #8690a0;
}

.action {
  flex-shrink: 0;
  border-radius: 999rpx;
  background: #eef6fb;
  padding: 10rpx 18rpx;
}

.action-text {
  color: #5a97bb;
  font-size: 22rpx;
}
</style>
