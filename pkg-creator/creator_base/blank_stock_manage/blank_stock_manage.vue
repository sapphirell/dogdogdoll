<template>
  <view class="blank-page font-alimamashuhei">
    <view-logs />

    <view class="hero-card">
      <text class="hero-title">毛坯设置</text>
      <text class="hero-desc">管理您可提供的毛坯，便于买家快速选购。</text>
    </view>

    <view class="search-row">
      <input
        v-model="keyword"
        class="search-input"
        placeholder="搜索毛坯名称 / 头围"
        confirm-type="search"
        @confirm="onSearchConfirm"
      />
      <view class="search-btn font-title" @tap="onSearchConfirm">搜索</view>
    </view>

    <view v-if="loading && !list.length" class="loading-wrap">
      <loading-jump-text />
    </view>
    <view v-else-if="!list.length" class="empty-card">
      <text class="empty-title">还没有毛坯</text>
      <text class="empty-desc">点击右下角按钮，先添加一条毛坯库存吧。</text>
    </view>

    <view v-else class="list-wrap">
      <view v-for="item in list" :key="item.id" class="blank-card">
        <common-image
          class="blank-cover"
          :src="item.cover_image || defaultCover"
          width="190"
          height="190"
          radius="18"
          mode="aspectFill"
        />
        <view class="blank-info">
          <view class="name-row">
            <text class="blank-name">{{ item.blank_name || '未命名毛坯' }}</text>
            <view class="qty-tag font-title">库存 {{ item.quantity }}</view>
          </view>
          <view class="price-row">
            <text class="price-symbol font-title">¥</text>
            <text class="price-value font-title">{{ formatPrice(item.price) }}</text>
          </view>
          <text class="blank-head">头围：{{ item.head_circumference || '未填写' }}</text>
          <text class="blank-intro">{{ item.intro || '暂无简介' }}</text>

          <view class="action-row">
            <view class="action-btn edit-btn" @tap="openEdit(item.id)">编辑</view>
            <view class="action-btn delete-btn" @tap="removeItem(item.id)">删除</view>
          </view>
        </view>
      </view>
    </view>

    <view v-if="loading && list.length" class="loading-more">加载中...</view>
    <view v-else-if="!hasMore && list.length" class="loading-more">没有更多了</view>

    <view class="fab" @tap="openCreate">
      <uni-icons type="plusempty" size="28" color="#fff" />
    </view>

    <uni-popup ref="formPopupRef" type="bottom" :mask-click="true">
      <view class="form-sheet">
        <view class="sheet-header">
          <text class="sheet-title">{{ formTitle }}</text>
          <view class="sheet-close" @tap="closeForm">
            <uni-icons type="closeempty" size="20" color="#4c5a73" />
          </view>
        </view>

        <scroll-view scroll-y class="sheet-scroll">
          <view class="field-card">
            <text class="field-label">毛坯名称</text>
            <input
              v-model="form.blank_name"
              class="field-input"
              maxlength="64"
              placeholder="例如蓝色高温丝毛坯"
            />
          </view>

          <view class="field-grid">
            <view class="field-card">
              <text class="field-label">价格</text>
              <input
                v-model="form.price"
                class="field-input"
                type="digit"
                maxlength="12"
                placeholder="0.00"
              />
            </view>

            <view class="field-card">
              <text class="field-label">库存数量</text>
              <input
                v-model="form.quantity"
                class="field-input"
                type="number"
                maxlength="8"
                placeholder="0"
              />
            </view>
          </view>

          <view class="field-card">
            <text class="field-label">头围</text>
            <input
              v-model="form.head_circumference"
              class="field-input"
              maxlength="32"
              placeholder="例如：21.5cm / 22cm"
            />
          </view>

          <view class="field-card">
            <text class="field-label">毛坯简介</text>
            <textarea
              v-model="form.intro"
              class="field-textarea"
              maxlength="300"
              placeholder="可填写毛坯特点、适配说明等"
            />
          </view>

          <view class="field-card">
            <view class="img-header">
              <text class="field-label">毛坯图片</text>
              <text class="img-count font-title">{{ form.image_urls.length }}/9</text>
            </view>
            <view class="img-grid">
              <view v-for="(url, idx) in form.image_urls" :key="`${url}_${idx}`" class="img-box">
                <common-image
                  class="img-preview"
                  :src="url"
                  width="100%"
                  height="100%"
                  radius="14"
                  mode="aspectFill"
                  @click="previewFormImage(idx)"
                />
                <view class="img-del" @tap="removeFormImage(idx)">
                  <uni-icons type="closeempty" size="16" color="#fff" />
                </view>
              </view>
              <view v-if="form.image_urls.length < 9" class="img-add" @tap="uploadFormImages">
                <uni-icons type="plusempty" size="26" color="#4c5a73" />
                <text class="img-add-text">添加图片</text>
              </view>
            </view>
          </view>
        </scroll-view>

        <view class="sheet-actions">
          <view class="sheet-btn cancel-btn" @tap="closeForm">取消</view>
          <view class="sheet-btn save-btn font-title" @tap="submitForm">{{ saving ? '保存中...' : '保存' }}</view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { onReachBottom, onShow } from '@dcloudio/uni-app'
import { websiteUrl } from '@/common/config.js'
import { chooseImageList, getQiniuToken, uploadImageToQiniu } from '@/common/image.js'

const defaultCover = '/static/default-goods.png'
const formPopupRef = ref(null)

const keyword = ref('')
const list = ref([])
const page = ref(1)
const size = 20
const total = ref(0)
const loading = ref(false)
const saving = ref(false)

const editingId = ref(0)
const form = reactive({
  blank_name: '',
  price: '',
  head_circumference: '',
  intro: '',
  quantity: '0',
  image_urls: []
})

const formTitle = computed(() => (editingId.value > 0 ? '编辑毛坯' : '新增毛坯'))
const hasMore = computed(() => list.value.length < total.value)

function tokenHeader () {
  return { Authorization: uni.getStorageSync('token') || '' }
}

function formatPrice (v) {
  const n = Number(v || 0)
  if (!Number.isFinite(n)) return '0.00'
  return n.toFixed(2)
}

function normalizeImageURLs (arr = []) {
  const seen = new Set()
  const out = []
  arr.forEach((item) => {
    const text = String(item || '').trim()
    if (!text || seen.has(text)) return
    seen.add(text)
    out.push(text)
  })
  return out
}

function resetForm () {
  editingId.value = 0
  form.blank_name = ''
  form.price = ''
  form.head_circumference = ''
  form.intro = ''
  form.quantity = '0'
  form.image_urls = []
}

async function fetchList (reset = false) {
  if (loading.value) return
  if (reset) {
    page.value = 1
    total.value = 0
    list.value = []
  }
  loading.value = true
  try {
    const url = `${websiteUrl.value}/brand-manager/blank-stock/list?page=${page.value}&size=${size}&search=${encodeURIComponent(keyword.value || '')}`
    const res = await uni.request({
      url,
      method: 'GET',
      header: tokenHeader()
    })
    const resp = res?.data || {}
    if (String(resp.status || '').toLowerCase() !== 'success') {
      uni.showToast({ title: resp.msg || '加载失败', icon: 'none' })
      return
    }
    const data = resp.data || {}
    const rows = Array.isArray(data.list) ? data.list : []
    total.value = Number(data.total || 0)
    if (reset) list.value = rows
    else list.value = list.value.concat(rows)
  } catch (e) {
    uni.showToast({ title: '网络开小差了…', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function onSearchConfirm () {
  fetchList(true)
}

function openCreate () {
  resetForm()
  formPopupRef.value?.open()
}

async function openEdit (id) {
  if (!id) return
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/brand-manager/blank-stock/info?id=${id}`,
      method: 'GET',
      header: tokenHeader()
    })
    const resp = res?.data || {}
    if (String(resp.status || '').toLowerCase() !== 'success') {
      uni.showToast({ title: resp.msg || '加载失败', icon: 'none' })
      return
    }
    const data = resp.data || {}
    editingId.value = Number(data.id || 0)
    form.blank_name = String(data.blank_name || '')
    form.price = formatPrice(data.price)
    form.head_circumference = String(data.head_circumference || '')
    form.intro = String(data.intro || '')
    form.quantity = String(data.quantity || 0)
    form.image_urls = normalizeImageURLs(data.image_urls || [])
    formPopupRef.value?.open()
  } catch (e) {
    uni.showToast({ title: '网络开小差了…', icon: 'none' })
  }
}

function closeForm () {
  formPopupRef.value?.close()
}

async function submitForm () {
  if (saving.value) return

  const blankName = String(form.blank_name || '').trim()
  if (!blankName) {
    uni.showToast({ title: '请填写毛坯名称', icon: 'none' })
    return
  }
  const price = Number(form.price || 0)
  if (!Number.isFinite(price) || price < 0) {
    uni.showToast({ title: '请填写正确的价格', icon: 'none' })
    return
  }
  const quantity = Number.parseInt(String(form.quantity || '0'), 10)
  if (!Number.isInteger(quantity) || quantity < 0) {
    uni.showToast({ title: '请填写正确的库存数量', icon: 'none' })
    return
  }
  const imageURLs = normalizeImageURLs(form.image_urls)
  if (!imageURLs.length) {
    uni.showToast({ title: '请至少上传 1 张毛坯图片', icon: 'none' })
    return
  }
  if (imageURLs.length > 9) {
    uni.showToast({ title: '毛坯图片最多 9 张', icon: 'none' })
    return
  }

  const payload = {
    id: editingId.value || 0,
    blank_name: blankName,
    price,
    head_circumference: String(form.head_circumference || '').trim(),
    intro: String(form.intro || '').trim(),
    quantity,
    image_urls: imageURLs
  }

  saving.value = true
  try {
    const url = editingId.value > 0
      ? `${websiteUrl.value}/brand-manager/blank-stock/update`
      : `${websiteUrl.value}/brand-manager/blank-stock/add`
    const res = await uni.request({
      url,
      method: 'POST',
      header: {
        ...tokenHeader(),
        'Content-Type': 'application/json'
      },
      data: payload
    })
    const resp = res?.data || {}
    if (String(resp.status || '').toLowerCase() !== 'success') {
      uni.showToast({ title: resp.msg || '保存失败', icon: 'none' })
      return
    }
    uni.showToast({ title: '保存成功', icon: 'success' })
    closeForm()
    fetchList(true)
  } catch (e) {
    uni.showToast({ title: '网络开小差了…', icon: 'none' })
  } finally {
    saving.value = false
  }
}

async function removeItem (id) {
  if (!id) return
  uni.showModal({
    title: '删除确认',
    content: '确认删除这个毛坯吗？',
    success: async (res) => {
      if (!res.confirm) return
      try {
        const ret = await uni.request({
          url: `${websiteUrl.value}/brand-manager/blank-stock/delete?id=${id}`,
          method: 'POST',
          header: tokenHeader()
        })
        const resp = ret?.data || {}
        if (String(resp.status || '').toLowerCase() !== 'success') {
          uni.showToast({ title: resp.msg || '删除失败', icon: 'none' })
          return
        }
        uni.showToast({ title: '删除成功', icon: 'success' })
        fetchList(true)
      } catch (e) {
        uni.showToast({ title: '网络开小差了…', icon: 'none' })
      }
    }
  })
}

async function uploadFormImages () {
  if (saving.value) return
  const remain = 9 - form.image_urls.length
  if (remain <= 0) {
    uni.showToast({ title: '最多可上传 9 张', icon: 'none' })
    return
  }

  let localPaths = []
  try {
    localPaths = await chooseImageList(remain)
  } catch (e) {
    return
  }
  if (!Array.isArray(localPaths) || !localPaths.length) return

  uni.showLoading({ title: '上传中...', mask: true })
  try {
    const next = [...form.image_urls]
    for (const p of localPaths) {
      const tokenData = await getQiniuToken()
      const up = await uploadImageToQiniu(p, tokenData.token, tokenData.path)
      if (up?.imageUrl) {
        next.push(up.imageUrl)
      }
    }
    form.image_urls = normalizeImageURLs(next).slice(0, 9)
  } catch (e) {
    uni.showToast({ title: '上传失败，请重试', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

function removeFormImage (idx) {
  const next = [...form.image_urls]
  next.splice(idx, 1)
  form.image_urls = next
}

function previewFormImage (idx) {
  const urls = normalizeImageURLs(form.image_urls)
  if (!urls.length) return
  uni.previewImage({
    current: urls[idx],
    urls
  })
}

onShow(() => {
  fetchList(true)
})

onReachBottom(() => {
  if (loading.value || !hasMore.value) return
  page.value += 1
  fetchList(false)
})
</script>

<style lang="scss" scoped>
.blank-page {
  min-height: 100vh;
  background: #f7fbff;
  padding: 24rpx;
  box-sizing: border-box;
}

.hero-card {
  border-radius: 24rpx;
  background: linear-gradient(135deg, rgba(73, 202, 238, 0.18) 0%, rgba(255, 255, 255, 0.95) 100%);
  padding: 28rpx 24rpx;
  box-shadow: 0 10rpx 30rpx rgba(73, 202, 238, 0.14);
}

.hero-title {
  font-size: 34rpx;
  color: #25324a;
  font-weight: 700;
}

.hero-desc {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #5f6f89;
  line-height: 1.65;
}

.search-row {
  margin-top: 20rpx;
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.search-input {
  flex: 1;
  height: 84rpx;
  background: #ffffff;
  border-radius: 18rpx;
  padding: 0 24rpx;
  box-sizing: border-box;
  color: #2f3a52;
  font-size: 28rpx;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
  box-shadow: 0 8rpx 26rpx rgba(24, 39, 75, 0.06);
}

.search-btn {
  min-width: 130rpx;
  height: 84rpx;
  border-radius: 18rpx;
  background: #78daf5;
  color: #ffffff;
  font-size: 28rpx;
  text-align: center;
  line-height: 84rpx;
  box-shadow: 0 10rpx 24rpx rgba(73, 202, 238, 0.24);
  padding: 0 20rpx;
  box-sizing: border-box;
}

.loading-wrap,
.empty-card {
  margin-top: 20rpx;
  background: #ffffff;
  border-radius: 22rpx;
  padding: 56rpx 24rpx;
  text-align: center;
  box-shadow: 0 10rpx 30rpx rgba(24, 39, 75, 0.06);
}

.empty-title {
  display: block;
  color: #2e3c57;
  font-size: 30rpx;
  font-weight: 700;
}

.empty-desc {
  display: block;
  margin-top: 12rpx;
  color: #71809c;
  font-size: 24rpx;
  line-height: 1.7;
}

.list-wrap {
  margin-top: 16rpx;
  padding-bottom: calc(160rpx + env(safe-area-inset-bottom));
}

.blank-card {
  background: #ffffff;
  border-radius: 22rpx;
  padding: 20rpx;
  box-shadow: 0 10rpx 28rpx rgba(24, 39, 75, 0.08);
  display: flex;
  gap: 18rpx;
  margin-top: 16rpx;
}

.blank-cover {
  flex-shrink: 0;
}

.blank-info {
  min-width: 0;
  flex: 1;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.blank-name {
  flex: 1;
  min-width: 0;
  color: #22314d;
  font-size: 30rpx;
  font-weight: 700;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.qty-tag {
  flex-shrink: 0;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(73, 202, 238, 0.16);
  color: #2c93b2;
  font-size: 22rpx;
}

.price-row {
  margin-top: 10rpx;
  display: flex;
  align-items: baseline;
  gap: 6rpx;
}

.price-symbol {
  color: #ff80a0;
  font-size: 22rpx;
}

.price-value {
  color: #ff6b95;
  font-size: 38rpx;
  line-height: 1;
}

.blank-head {
  display: block;
  margin-top: 10rpx;
  color: #49607f;
  font-size: 25rpx;
}

.blank-intro {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-top: 8rpx;
  color: #6d7a92;
  font-size: 24rpx;
  line-height: 1.6;
}

.action-row {
  margin-top: 14rpx;
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.action-btn {
  min-width: 118rpx;
  height: 56rpx;
  border-radius: 999rpx;
  text-align: center;
  line-height: 56rpx;
  font-size: 24rpx;
}

.edit-btn {
  color: #1f90b0;
  background: rgba(73, 202, 238, 0.16);
}

.delete-btn {
  color: #d16a82;
  background: rgba(255, 170, 190, 0.22);
}

.loading-more {
  padding: 18rpx 0 12rpx;
  text-align: center;
  color: #8b97ad;
  font-size: 24rpx;
}

.fab {
  position: fixed;
  right: 32rpx;
  bottom: calc(44rpx + env(safe-area-inset-bottom));
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #78daf5 0%, #6fd6ff 100%);
  box-shadow: 0 18rpx 30rpx rgba(73, 202, 238, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 25;
}

.form-sheet {
  background: #f8fcff;
  border-radius: 28rpx 28rpx 0 0;
  max-height: 86vh;
  min-height: 60vh;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
}

.sheet-header {
  padding: 24rpx 24rpx 16rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sheet-title {
  font-size: 32rpx;
  color: #24324d;
  font-weight: 700;
}

.sheet-close {
  width: 54rpx;
  height: 54rpx;
  border-radius: 50%;
  background: #e9f3fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sheet-scroll {
  flex: 1;
  padding: 0 24rpx 12rpx;
  box-sizing: border-box;
}

.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14rpx;
}

.field-card {
  margin-top: 14rpx;
  background: #ffffff;
  border-radius: 18rpx;
  padding: 18rpx;
  box-shadow: 0 8rpx 20rpx rgba(24, 39, 75, 0.06);
}

.field-label {
  display: block;
  font-size: 24rpx;
  color: #60708e;
}

.field-input {
  margin-top: 12rpx;
  height: 76rpx;
  background: #f3f4f7;
  border-radius: 14rpx;
  padding: 0 18rpx;
  box-sizing: border-box;
  font-size: 27rpx;
  color: #25314a;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
}

.field-textarea {
  margin-top: 12rpx;
  width: 100%;
  height: 170rpx;
  background: #f3f4f7;
  border-radius: 14rpx;
  padding: 16rpx 18rpx;
  box-sizing: border-box;
  font-size: 26rpx;
  color: #25314a;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
}

.img-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.img-count {
  color: #8f9bb4;
  font-size: 22rpx;
}

.img-grid {
  margin-top: 14rpx;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14rpx;
}

.img-box,
.img-add {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 14rpx;
  overflow: hidden;
  background: #eef6fd;
}

.img-preview {
  width: 100%;
  height: 100%;
}

.img-del {
  position: absolute;
  right: 6rpx;
  top: 6rpx;
  width: 34rpx;
  height: 34rpx;
  border-radius: 50%;
  background: rgba(26, 36, 52, 0.62);
  display: flex;
  align-items: center;
  justify-content: center;
}

.img-add {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #4c5a73;
}

.img-add-text {
  margin-top: 6rpx;
  font-size: 22rpx;
}

.sheet-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14rpx;
  padding: 18rpx 24rpx 0;
}

.sheet-btn {
  height: 84rpx;
  border-radius: 999rpx;
  text-align: center;
  line-height: 84rpx;
  font-size: 28rpx;
}

.cancel-btn {
  color: #4f5e79;
  background: #e9f2f9;
}

.save-btn {
  color: #ffffff;
  background: #78daf5;
}
</style>
