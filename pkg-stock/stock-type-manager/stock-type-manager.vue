<template>
  <view-logs />
  <view class="type-manager-page">
    <zhouWei-navBar
      type="transparentFixed"
      :backState="2000"
      :homeState="2000"
      fontColor="#1f2b3b"
      transparentFixedFontColor="#1f2b3b"
      :scrollTop="scrollTop"
      :titleCenter="true"
      title="分类管理"
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
        <text class="hero-tag font-title">CATEGORY LAB</text>
        <text class="hero-title font-alimamashuhei">分类管理</text>
        <text class="hero-tip">支持新增、重命名、删除与排序，修改后会同步到我的物品页面。</text>
      </view>

      <view class="composer-card">
        <view class="composer-input-wrap">
          <text class="composer-label font-title">NEW</text>
          <input
            v-model.trim="newTypeName"
            class="composer-input font-alimamashuhei"
            placeholder="输入新分类名称（最多10字）"
            maxlength="10"
            confirm-type="done"
            @confirm="addNewType"
          />
        </view>
        <view class="composer-actions">
          <button class="action-btn ghost font-title" :disabled="loading" @tap="fetchTypes(true)">刷新</button>
          <button class="action-btn primary font-alimamashuhei" :disabled="!newTypeName || adding" :loading="adding" @tap="addNewType">
            添加分类
          </button>
        </view>
      </view>

      <view class="list-card">
        <view class="list-head">
          <text class="list-title font-alimamashuhei">分类列表</text>
          <text class="list-desc font-title">按从上到下顺序展示</text>
        </view>

        <view v-if="customTypes.length === 0" class="empty-wrap">
          <text class="empty-title font-alimamashuhei">还没有自定义分类</text>
          <text class="empty-desc">先在上方新增一个分类吧。</text>
        </view>

        <view v-else class="type-list">
          <view
            v-for="(type, index) in customTypes"
            :key="type.id"
            class="type-item"
          >
            <view class="type-index font-title">{{ String(index + 1).padStart(2, '0') }}</view>

            <view class="type-main">
              <template v-if="editId === type.id">
                <input
                  v-model.trim="editName"
                  class="edit-input font-alimamashuhei"
                  maxlength="10"
                  confirm-type="done"
                  placeholder="输入分类名称"
                  @confirm="saveEdit(type)"
                  @blur="onEditBlur(type)"
                />
              </template>
              <template v-else>
                <text class="type-name font-alimamashuhei">{{ type.name }}</text>
                <text class="type-meta font-title">ID {{ type.id }}</text>
              </template>
            </view>

            <view class="type-actions">
              <template v-if="editId === type.id">
                <button class="mini-btn ok font-title" :disabled="savingOne" @tap="saveEdit(type)">保存</button>
                <button class="mini-btn ghost font-title" :disabled="savingOne" @tap="cancelEdit">取消</button>
              </template>
              <template v-else>
                <button class="icon-btn" :disabled="index === 0 || savingSort" @tap="moveUp(index)">
                  <uni-icons type="arrow-up" size="16" color="#5a7896" />
                </button>
                <button class="icon-btn" :disabled="index === customTypes.length - 1 || savingSort" @tap="moveDown(index)">
                  <uni-icons type="arrow-down" size="16" color="#5a7896" />
                </button>
                <button class="icon-btn" @tap="startEdit(type)">
                  <uni-icons type="compose" size="16" color="#5a7896" />
                </button>
                <button class="icon-btn danger" @tap="deleteType(type.id)">
                  <uni-icons type="trash" size="16" color="#c96868" />
                </button>
              </template>
            </view>
          </view>
        </view>
      </view>

      <view class="bottom-space"></view>
    </view>

    <view class="dock">
      <text class="dock-info font-title">共 {{ customTypes.length }} 个分类</text>
      <button class="dock-btn font-alimamashuhei" :disabled="savingSort || !hasSortChanged" :loading="savingSort" @tap="saveSort">
        保存排序
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow, onPageScroll } from '@dcloudio/uni-app'
import { websiteUrl, getStatusBarHeight, getNavBarHeight, toPx } from '@/common/config.js'

const scrollTop = ref(0)
onPageScroll((e) => {
  scrollTop.value = e?.scrollTop || 0
})

const headerPadPx = computed(() => toPx(getStatusBarHeight() + getNavBarHeight()))

const customTypes = ref([])
const originalOrder = ref([])
const loading = ref(false)
const adding = ref(false)
const savingOne = ref(false)
const savingSort = ref(false)

const newTypeName = ref('')
const editId = ref(null)
const editName = ref('')

function token() {
  return uni.getStorageSync('token') || ''
}

function markTypeDirty() {
  uni.setStorageSync('stockAccountTypesDirtyAt', Date.now())
}

function goBack() {
  const pages = getCurrentPages?.() || []
  if (pages.length > 1) {
    uni.navigateBack({ delta: 1 })
    return
  }
  uni.switchTab({ url: '/pages/stock/stock' })
}

async function fetchTypes(showToast = false) {
  loading.value = true
  try {
    const res = await uni.request({
      url: websiteUrl.value + '/with-state/account-types',
      method: 'GET',
      header: { Authorization: token() }
    })
    customTypes.value = res?.data?.data || []
    originalOrder.value = customTypes.value.map((t) => t.id)
    if (showToast) {
      uni.showToast({ title: '分类已刷新', icon: 'none' })
    }
  } catch (err) {
    console.error('[stock-type-manager] fetch types fail:', err)
    uni.showToast({ title: '获取分类失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

async function addNewType() {
  const name = (newTypeName.value || '').trim()
  if (!name) {
    uni.showToast({ title: '请输入分类名称', icon: 'none' })
    return
  }
  if (name.length > 10) {
    uni.showToast({ title: '不能超过10个字符', icon: 'none' })
    return
  }
  if (adding.value) return
  adding.value = true
  try {
    const res = await uni.request({
      url: websiteUrl.value + '/with-state/add-account-type',
      method: 'POST',
      header: { Authorization: token() },
      data: { name }
    })
    if (res?.data?.status !== 'success') {
      throw new Error(res?.data?.msg || '添加失败')
    }
    newTypeName.value = ''
    markTypeDirty()
    await fetchTypes(false)
    uni.showToast({ title: '添加成功', icon: 'none' })
  } catch (err) {
    uni.showToast({ title: err?.message || '添加失败', icon: 'none' })
  } finally {
    adding.value = false
  }
}

function startEdit(type) {
  editId.value = type.id
  editName.value = type.name
}

function cancelEdit() {
  editId.value = null
  editName.value = ''
}

function onEditBlur(type) {
  if (editId.value === type.id) {
    saveEdit(type)
  }
}

async function saveEdit(type) {
  const name = (editName.value || '').trim()
  if (!name) {
    uni.showToast({ title: '请输入分类名称', icon: 'none' })
    return
  }
  if (name.length > 10) {
    uni.showToast({ title: '不能超过10个字符', icon: 'none' })
    return
  }
  if (savingOne.value) return
  savingOne.value = true
  try {
    const res = await uni.request({
      url: websiteUrl.value + '/with-state/update-account-book-type',
      method: 'POST',
      header: {
        Authorization: token(),
        'Content-Type': 'application/json'
      },
      data: { id: type.id, name }
    })
    if (res?.data?.status !== 'success') {
      throw new Error(res?.data?.msg || '更新失败')
    }
    markTypeDirty()
    await fetchTypes(false)
    uni.showToast({ title: '修改成功', icon: 'none' })
  } catch (err) {
    uni.showToast({ title: err?.message || '修改失败', icon: 'none' })
  } finally {
    savingOne.value = false
    cancelEdit()
  }
}

async function deleteType(id) {
  uni.showModal({
    title: '删除分类',
    content: '确定删除该分类吗？分类内物品不会被删除。',
    success: async (ret) => {
      if (!ret.confirm) return
      try {
        const res = await uni.request({
          url: websiteUrl.value + '/with-state/delete-account-type',
          method: 'POST',
          header: {
            Authorization: token(),
            'Content-Type': 'application/json'
          },
          data: { id }
        })
        if (res?.data?.status !== 'success') {
          throw new Error(res?.data?.msg || '删除失败')
        }
        markTypeDirty()
        await fetchTypes(false)
        uni.showToast({ title: '删除成功', icon: 'none' })
      } catch (err) {
        uni.showToast({ title: err?.message || '删除失败', icon: 'none' })
      }
    }
  })
}

function move(arr, from, to) {
  if (from === to) return
  const item = arr.splice(from, 1)[0]
  arr.splice(to, 0, item)
}

function moveUp(index) {
  if (index > 0) move(customTypes.value, index, index - 1)
}

function moveDown(index) {
  if (index < customTypes.value.length - 1) move(customTypes.value, index, index + 1)
}

const hasSortChanged = computed(() => {
  const now = customTypes.value.map((t) => t.id)
  if (now.length !== originalOrder.value.length) return true
  for (let i = 0; i < now.length; i += 1) {
    if (now[i] !== originalOrder.value[i]) return true
  }
  return false
})

async function saveSort() {
  if (!hasSortChanged.value || savingSort.value) return
  savingSort.value = true
  try {
    const sortedIds = customTypes.value.map((t) => t.id)
    const res = await uni.request({
      url: websiteUrl.value + '/with-state/sort-account-book-type',
      method: 'POST',
      header: {
        Authorization: token(),
        'Content-Type': 'application/json'
      },
      data: { sorted_ids: sortedIds }
    })
    if (res?.data?.status !== 'success') {
      throw new Error(res?.data?.msg || '保存失败')
    }
    originalOrder.value = [...sortedIds]
    markTypeDirty()
    uni.showToast({ title: '排序已保存', icon: 'none' })
  } catch (err) {
    uni.showToast({ title: err?.message || '保存失败', icon: 'none' })
  } finally {
    savingSort.value = false
  }
}

onShow(() => {
  fetchTypes(false)
})
</script>

<style lang="scss" scoped>
.type-manager-page {
  min-height: 100vh;
  background:
    radial-gradient(1200rpx 620rpx at 100% -8%, rgba(146, 196, 235, 0.28), rgba(146, 196, 235, 0)),
    linear-gradient(180deg, #d8deff 0%, #d3f5ff 42%, #f4fbff 100%);
}

.nav-back-pill {
  margin-left: 15rpx;
}

.page-body {
  padding-left: 24rpx;
  padding-right: 24rpx;
  padding-bottom: calc(176rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(176rpx + env(safe-area-inset-bottom));
}

.hero-card {
  margin-top: 14rpx;
  background: linear-gradient(145deg, rgba(213, 233, 255, 0.96), rgba(226, 244, 255, 0.96));
  border-radius: 26rpx;
  padding: 30rpx 28rpx;
  border: 1rpx solid #d6e8f9;
  box-shadow: 0 12rpx 26rpx rgba(102, 140, 178, 0.12);
}

.hero-tag {
  display: inline-flex;
  height: 40rpx;
  align-items: center;
  padding: 0 16rpx;
  border-radius: 999rpx;
  background: rgba(116, 166, 219, 0.22);
  color: #4c79a7;
  font-size: 20rpx;
  letter-spacing: 0.8rpx;
}

.hero-title {
  display: block;
  margin-top: 16rpx;
  font-size: 42rpx;
  color: #29476a;
  letter-spacing: 0.5rpx;
}

.hero-tip {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #63809f;
  line-height: 1.55;
}

.composer-card,
.list-card {
  margin-top: 20rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.97);
  border: 1rpx solid #deebf8;
  box-shadow: 0 10rpx 22rpx rgba(95, 131, 168, 0.1);
}

.composer-card {
  padding: 22rpx;
}

.composer-input-wrap {
  height: 86rpx;
  border-radius: 16rpx;
  background: #f1f8ff;
  border: 1rpx solid #dbe8f6;
  display: flex;
  align-items: center;
  padding: 0 18rpx;
}

.composer-label {
  font-size: 19rpx;
  color: #87a3c4;
  letter-spacing: 0.9rpx;
}

.composer-input {
  flex: 1;
  margin-left: 14rpx;
  font-size: 28rpx;
  color: #345372;
}

.composer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12rpx;
  margin-top: 16rpx;
}

.action-btn {
  height: 70rpx;
  border-radius: 999rpx;
  padding: 0 28rpx;
  font-size: 24rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: none;
}

.action-btn.ghost {
  background: #edf6ff;
  color: #5f83ab;
}

.action-btn.primary {
  background: linear-gradient(135deg, #8bb2d7, #7f9fc7);
  color: #ffffff;
  box-shadow: 0 8rpx 16rpx rgba(116, 145, 179, 0.24);
}

.list-card {
  padding: 22rpx;
}

.list-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 14rpx;
}

.list-title {
  font-size: 34rpx;
  color: #2c4a6c;
}

.list-desc {
  font-size: 21rpx;
  color: #8da6c3;
}

.empty-wrap {
  border-radius: 18rpx;
  background: #f3f9ff;
  padding: 44rpx 24rpx;
  text-align: center;
  border: 1rpx solid #dfebf8;
}

.empty-title {
  font-size: 30rpx;
  color: #3d5d82;
}

.empty-desc {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #90a8c3;
}

.type-list {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.type-item {
  display: flex;
  align-items: center;
  gap: 14rpx;
  border-radius: 18rpx;
  background: #f4f9ff;
  border: 1rpx solid #e0ebf8;
  padding: 16rpx 14rpx 16rpx 16rpx;
}

.type-index {
  width: 56rpx;
  height: 56rpx;
  border-radius: 16rpx;
  background: linear-gradient(135deg, #d6e7fa, #c4dcf6);
  color: #56789f;
  font-size: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.type-main {
  flex: 1;
  min-width: 0;
}

.type-name {
  display: block;
  font-size: 30rpx;
  color: #2f4d70;
}

.type-meta {
  display: block;
  margin-top: 6rpx;
  font-size: 20rpx;
  color: #91a9c3;
}

.edit-input {
  height: 70rpx;
  border-radius: 14rpx;
  background: #ffffff;
  border: 1rpx solid #d7e7f7;
  padding: 0 16rpx;
  font-size: 28rpx;
  color: #2f4d70;
}

.type-actions {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.icon-btn {
  width: 58rpx;
  height: 58rpx;
  border-radius: 16rpx;
  background: #e8f2fd;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.icon-btn.danger {
  background: #fbeef0;
}

.mini-btn {
  height: 58rpx;
  border-radius: 999rpx;
  padding: 0 20rpx;
  font-size: 22rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.mini-btn.ok {
  background: linear-gradient(135deg, #7fa7d0, #6f98c4);
  color: #fff;
  box-shadow: 0 8rpx 16rpx rgba(111, 152, 196, 0.22);
}

.mini-btn.ghost {
  background: #eef6ff;
  color: #6488af;
}

.bottom-space {
  height: 40rpx;
}

.dock {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40;
  padding: 16rpx 24rpx calc(20rpx + constant(safe-area-inset-bottom));
  padding: 16rpx 24rpx calc(20rpx + env(safe-area-inset-bottom));
  background: rgba(243, 250, 255, 0.97);
  backdrop-filter: blur(10rpx);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1rpx solid #d9e9f8;
  box-shadow: 0 -8rpx 20rpx rgba(116, 145, 179, 0.12);
}

.dock-info {
  font-size: 22rpx;
  color: #7f9bb9;
}

.dock-btn {
  height: 78rpx;
  border-radius: 999rpx;
  padding: 0 34rpx;
  color: #fff;
  background: linear-gradient(135deg, #8bb2d7, #7f9fc7);
  font-size: 28rpx;
  box-shadow: 0 10rpx 18rpx rgba(116, 145, 179, 0.24);
}

button::after {
  border: none !important;
}
</style>
