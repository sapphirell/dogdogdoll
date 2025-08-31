<template>
  <bottom-popup :show="modelValue" @close="onClose">
    <view class="popup-panel">
      <!-- 顶部栏 -->
      <view class="popup-header">
        <text class="popup-title">分类管理</text>
        <view class="header-actions">
          <!-- 关闭按钮：无背景色 -->
          <button class="btn ghost plain sm" @tap="onClose">
            <uni-icons type="closeempty" size="16" color="#5f6b8a"></uni-icons>
            <text>关闭</text>
          </button>
        </view>
      </view>

      <!-- 新增行 -->
      <view class="add-row">
        <input
          v-model.trim="newTypeName"
          placeholder="输入新分类名称（≤10字）"
          class="input"
          maxlength="10"
        />
        <!-- 添加按钮：白色文字 -->
        <button class="btn primary" @tap="addNewType" :disabled="!newTypeName">
          <uni-icons type="plus" size="16" color="#fff"></uni-icons>
          <text>添加</text>
        </button>
      </view>

      <!-- 列表（指定固定高度，保证可滚动） -->
      <scroll-view
        scroll-y
        class="list-scroll"
        :style="{ height: listScrollHeight }"
      >
        <view class="type-list-modern">
          <view
            v-for="(type, index) in customTypes"
            :key="type.id"
            class="type-card"
          >
            <view class="type-main">
              <template v-if="editId === type.id">
                <input
                  v-model.trim="editName"
                  class="edit-input"
                  maxlength="10"
                  confirm-type="done"
                  @confirm="saveEdit(type)"
                  @blur="onEditBlur(type)"
                  placeholder="输入分类名称"
                />
              </template>
              <template v-else>
                <text class="type-name">{{ type.name }}</text>
                <text class="type-sub">ID: {{ type.id }}</text>
              </template>
            </view>

            <view class="type-actions-modern">
              <template v-if="editId === type.id">
                <!-- 保存按钮：白色文字 -->
                <button class="btn ok sm" :loading="savingOne" :disabled="savingOne" @tap="saveEdit(type)">
                  <uni-icons type="checkmarkempty" size="14" color="#fff"></uni-icons><text>保存</text>
                </button>
                <button class="btn ghost sm" :disabled="savingOne" @tap="cancelEdit">
                  <uni-icons type="closeempty" size="14" color="#5f6b8a"></uni-icons><text>取消</text>
                </button>
              </template>
              <template v-else>
                <button class="icon-btn" :disabled="index===0 || savingSort" @tap="moveUp(index)">
                  <uni-icons type="arrow-up" size="18" color="#74c9e5"></uni-icons>
                </button>
                <button class="icon-btn" :disabled="index===customTypes.length-1 || savingSort" @tap="moveDown(index)">
                  <uni-icons type="arrow-down" size="18" color="#74c9e5"></uni-icons>
                </button>
                <button class="icon-btn" @tap="startEdit(type)">
                  <uni-icons type="compose" size="18" color="#5f6b8a"></uni-icons>
                </button>
                <button class="icon-btn" @tap="deleteType(type.id)">
                  <uni-icons type="trash" size="18" color="#ff7777"></uni-icons>
                </button>
              </template>
            </view>
          </view>

          <view v-if="customTypes.length === 0" class="empty-types">
            <image class="empty-folder" src="/static/folder-empty.png"></image>
            <text class="empty-text">暂无自定义分类</text>
            <text class="empty-tip">请在上方输入后点击“添加”</text>
          </view>
        </view>
        <view style="height: 120rpx;"></view>
      </scroll-view>

      <!-- 吸底操作条：信息+保存排序，保存贴右侧边缘 -->
      <view class="dock">
        <text class="dock-info">共 {{ customTypes.length }} 个分类</text>
        <button
          class="btn primary strong dock-save"
          :loading="savingSort"
          :disabled="savingSort || !hasSortChanged"
          @tap="saveSort"
        >
          <uni-icons type="save" size="16" color="#fff"></uni-icons>
          <text>保存排序</text>
        </button>
      </view>
    </view>
  </bottom-popup>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { websiteUrl } from '@/common/config.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  list: { type: Array, default: () => [] }
})
const emit = defineEmits(['update:modelValue', 'updated', 'refresh'])

/** 本地状态 */
const customTypes = ref([])
const newTypeName = ref('')
const editId = ref(null)
const editName = ref('')
const savingOne = ref(false)
const savingSort = ref(false)
const originalOrder = ref([])

/** 滚动高度（必须指定） */
const listScrollHeight = ref('60vh') // 默认 60vh，确保 scroll-view 可滚动

onMounted(() => {
  // 也可按屏幕高度动态换算，例如 86vh（弹层高度） - 顶部/底部已知占位
  // 这里保持简单的 60vh，兼容小程序/APP/H5
  listScrollHeight.value = '60vh'
})

/** 同步父传入列表 */
watch(() => props.list, (val) => {
  customTypes.value = JSON.parse(JSON.stringify(val || []))
  originalOrder.value = customTypes.value.map(t => t.id)
}, { immediate: true })

/** 打开时拉取最新 */
watch(() => props.modelValue, async (show) => {
  if (show) {
    await fetchTypes()
  }
})

/** 工具 */
const token = () => uni.getStorageSync('token') || ''

/** 拉取列表 */
const fetchTypes = async () => {
  try {
    const res = await uni.request({
      url: websiteUrl.value + '/with-state/account-types',
      method: 'GET',
      header: { 'Authorization': token() }
    })
    const list = res?.data?.data || []
    customTypes.value = list
    originalOrder.value = customTypes.value.map(t => t.id)
    emit('updated', list)     // 传给父级最新数据（用于本地展示）
    emit('refresh')           // 通知父级自行按接口逻辑重新拉取
  } catch (err) {
    console.error('获取分类失败:', err)
    uni.showToast({ title: '获取分类失败', icon: 'none' })
  }
}

/** 新增 */
const addNewType = async () => {
  if (!newTypeName.value) {
    uni.showToast({ title: '请输入分类名称', icon: 'none' })
    return
  }
  if (newTypeName.value.length > 10) {
    uni.showToast({ title: '不能超过10个字符', icon: 'none' })
    return
  }
  try {
    const res = await uni.request({
      url: websiteUrl.value + '/with-state/add-account-type',
      method: 'POST',
      header: { 'Authorization': token() },
      data: { name: newTypeName.value }
    })
    if (res?.data?.status !== 'success') {
      throw new Error(res?.data?.msg || '添加失败')
    }
    newTypeName.value = ''
    await fetchTypes() // 内部会 emit('updated') & emit('refresh')
    uni.showToast({ title: '添加成功' })
  } catch (err) {
    uni.showToast({ title: err?.message || '添加失败', icon: 'none' })
  }
}

/** 编辑 */
const startEdit = (type) => {
  editId.value = type.id
  editName.value = type.name
}
const cancelEdit = () => {
  editId.value = null
  editName.value = ''
}
const onEditBlur = (type) => {
  if (editId.value === type.id) saveEdit(type)
}
const saveEdit = async (type) => {
  if (savingOne.value) return
  const name = (editName.value || '').trim()
  if (!name) {
    uni.showToast({ title: '请输入分类名称', icon: 'none' })
    return
  }
  if (name.length > 10) {
    uni.showToast({ title: '不能超过10个字符', icon: 'none' })
    return
  }
  savingOne.value = true
  try {
    const res = await uni.request({
      url: websiteUrl.value + '/with-state/update-account-book-type',
      method: 'POST',
      header: { 'Authorization': token(), 'Content-Type': 'application/json' },
      data: { id: type.id, name }
    })
    if (res?.data?.status !== 'success') {
      throw new Error(res?.data?.msg || '更新失败')
    }
    await fetchTypes() // 内部会 emit('updated') & emit('refresh')
    uni.showToast({ title: '修改成功' })
  } catch (err) {
    uni.showToast({ title: err?.message || '修改失败', icon: 'none' })
  } finally {
    savingOne.value = false
    cancelEdit()
  }
}

/** 删除 */
const deleteType = async (id) => {
  uni.showModal({
    title: '提示',
    content: '确定要删除该分类吗？',
    success: async (ret) => {
      if (!ret.confirm) return
      try {
        const res = await uni.request({
          url: websiteUrl.value + '/with-state/delete-account-type',
          method: 'POST',
          header: { 'Authorization': token(), 'Content-Type': 'application/json' },
          data: { id }
        })
        if (res?.data?.status !== 'success') {
          throw new Error(res?.data?.msg || '删除失败')
        }
        await fetchTypes() // 内部会 emit('updated') & emit('refresh')
        uni.showToast({ title: '删除成功' })
      } catch (err) {
        uni.showToast({ title: err?.message || '删除失败', icon: 'none' })
      }
    }
  })
}

/** 上/下移（本地移动，保存时一次写入） */
const move = (arr, from, to) => {
  if (from === to) return
  const item = arr.splice(from, 1)[0]
  arr.splice(to, 0, item)
}
const moveUp = (i) => { if (i > 0) move(customTypes.value, i, i - 1) }
const moveDown = (i) => { if (i < customTypes.value.length - 1) move(customTypes.value, i, i + 1) }

/** 排序保存 */
const hasSortChanged = computed(() => {
  const now = customTypes.value.map(t => t.id)
  if (now.length !== originalOrder.value.length) return true
  for (let i = 0; i < now.length; i++) {
    if (now[i] !== originalOrder.value[i]) return true
  }
  return false
})
const saveSort = async () => {
  if (!hasSortChanged.value || savingSort.value) return
  savingSort.value = true
  try {
    const sorted_ids = customTypes.value.map(t => t.id)
    const res = await uni.request({
      url: websiteUrl.value + '/with-state/sort-account-book-type',
      method: 'POST',
      header: { 'Authorization': token(), 'Content-Type': 'application/json' },
      data: { sorted_ids }
    })
    if (res?.data?.status !== 'success') {
      throw new Error(res?.data?.msg || '保存失败')
    }
    originalOrder.value = [...sorted_ids]
    emit('updated', JSON.parse(JSON.stringify(customTypes.value)))
    emit('refresh') // 同时通知父级重新拉取接口
    uni.showToast({ title: '排序已保存' })
  } catch (err) {
    uni.showToast({ title: err?.message || '保存失败', icon: 'none' })
  } finally {
    savingSort.value = false
  }
}

/** 关闭 */
const onClose = () => emit('update:modelValue', false)
</script>

<style lang="scss" scoped>
.popup-panel {
  background: #fff;
  border-top-left-radius: 24rpx;
  border-top-right-radius: 24rpx;
  /* 不要阴影 */
  box-shadow: none;
  display: flex; flex-direction: column;
}

.popup-header {
  padding: 24rpx 28rpx 12rpx;
  display:flex; align-items:center; justify-content:space-between;
}
.popup-title { font-size: 32rpx; color:#2e3142; font-weight: 650; }
.header-actions { display:flex; align-items:center; gap: 12rpx; }

.add-row { padding: 0 28rpx 18rpx; display:flex; gap:16rpx; }
.input {
  flex:1; background:#f7f9fc; border-radius:14rpx; padding:18rpx 20rpx; font-size:28rpx; color:#333;
  border:none; box-shadow: inset 0 0 0 1rpx #eef2f7;
}

/* 列表：去除点击下沉效果（无 hover-class，无 :active） */
.type-list-modern { padding: 8rpx 20rpx; }
.type-card {
  display:flex; align-items:center; justify-content:space-between; gap:16rpx;
  background:#fff; border-radius:16rpx; padding:22rpx 20rpx; margin-bottom:16rpx;
  box-shadow: 0 6rpx 18rpx rgba(10, 41, 61, .06);
}
.type-main { min-width:0; flex:1; }
.type-name { display:block; font-size:28rpx; color:#1f2937; font-weight:600; }
.type-sub { display:block; font-size:22rpx; color:#9aa0b4; margin-top:6rpx; }
.edit-input {
  width:100%; background:#f7f9fc; border-radius:12rpx; padding:16rpx 18rpx; font-size:28rpx; color:#1f2937;
  border:none; box-shadow: inset 0 0 0 1rpx #eef2f7;
}

.type-actions-modern { display:flex; align-items:center; gap:10rpx; }
.icon-btn {
  width:64rpx; height:64rpx; border-radius:999rpx; background:#f3f7fb;
  display:flex; align-items:center; justify-content:center;
  box-shadow: 0 2rpx 8rpx rgba(10,41,61,.06);
}

/* 指定固定高度，确保 scroll-view 可滚动 */
.list-scroll { width: 100%; }

/* 吸底操作条：保存排序按钮贴右侧 */
.dock {
  position: sticky; bottom: 0;
  padding: 14rpx 16rpx 26rpx 20rpx;  /* 右侧更靠边 */
  background:#fff;
  display:flex; align-items:center;
  box-shadow: 0 -6rpx 22rpx rgba(10,41,61,.06);
  justify-content: space-between;
}
.dock-info { font-size:24rpx; color:#7d869e; }
.dock-save { margin-left: auto; }

/* 统一按钮风格 */
.btn {
  display:inline-flex; align-items:center; gap:8rpx;
  padding: 0 28rpx; height:72rpx; border-radius:999rpx;
  background:#f3f6ff; color:#4b5ac8; font-size:26rpx; border:none;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,.06);
}
.btn text { color: inherit; } /* 让内部文字跟随按钮颜色 */
.btn.primary { background:#74c9e5; color:#fff; }
.btn.primary.strong { height:80rpx; padding:0 36rpx; font-weight:600;margin: 20rpx 0; }
.btn.ok { background:#10b981; color:#fff; }
.btn.ghost { background:#eef2ff; color:#5f6b8a; }
.btn.ghost.plain { background: transparent; box-shadow: none; } /* 关闭按钮：无背景 */
.btn.sm { height:60rpx; padding:0 20rpx; font-size:24rpx; }
.btn::after, .icon-btn::after, button::after { border: none !important; }

/* 空态 */
.empty-types { padding: 60rpx 0; display:flex; flex-direction:column; align-items:center; }
.empty-folder { width:160rpx; height:160rpx; opacity:.6; margin-bottom:24rpx; }
.empty-text { font-size:28rpx; color:#4b5ac8; margin-bottom:8rpx; font-weight:600; }
.empty-tip { font-size:24rpx; color:#9aa0b4; }
</style>
