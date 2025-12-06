<template>
  <view class="order-plan-form">
    <!-- 顶部表单（分组列表外观） -->
    <view class="top-panel">
      <!-- 计划名称 -->
      <view class="form-item">
        <text class="label">计划名称</text>
        <input class="input" v-model="form.artist_name" placeholder="请输入计划名称" />
      </view>

      <!-- 作者类型（只展示，不能修改） -->
      <view class="form-item">
        <text class="label">作者类型</text>
        <view class="readonly-field">
          <text class="readonly-text">毛娘</text>
        </view>
      </view>

      <!-- 接单方式 -->
      <view class="form-item">
        <text class="label">接单方式</text>
        <picker :range="orderTypes" range-key="text" :value="orderTypeIndex" @change="onOrderTypeChange">
          <view class="picker">{{ orderTypes[orderTypeIndex].text }}</view>
        </picker>
        <view class="tip">
          如果本次开单包含不同接单方式如：手速×5、抽选×5，需要创建两条计划；先创建一条，再在列表中“复制”并编辑。
        </view>
      </view>

      <!-- 接单场所：只展示为“其它平台” -->
      <view class="form-item">
        <text class="label">接单场所</text>
        <view class="readonly-field">
          <text class="readonly-text">其它平台</text>
        </view>
        <view class="tip">暂时不支持在线约毛，请等待下一版本支持</view>
      </view>

      <!-- 长期接单隐藏人数与每人限投：与妆师保持一致 -->
      <view class="form-item" v-if="form.order_type !== 1">
        <text class="label">最大参与人数</text>
        <uni-number-box v-model="form.max_participants" :min="0" :max="100000" />
        <view class="tip">0 表示不限量</view>
      </view>
      <view class="form-item" v-if="form.order_type !== 1">
        <text class="label">每人最大投递数</text>
        <uni-number-box v-model="form.max_submissions_per_user" :min="1" :max="10" />
      </view>

      <!-- 开始时间：日期 + 时间 -->
      <view class="form-item">
        <text class="label">开始时间</text>
        <view class="datetime-row">
          <view class="picker-col" @click="showOpenDate = true">{{ form.open_date || '选择日期' }}</view>
          <view class="picker-col" @click="showOpenTime = true">{{ form.open_time || '选择时间' }}</view>
        </view>
        <common-date-picker v-model:show="showOpenDate" v-model="form.open_date" title="选择开始日期" />
        <common-time-picker v-model:show="showOpenTime" v-model="form.open_time" title="选择开始时间" />
      </view>

      <!-- 结束时间：日期 + 时间 -->
      <view class="form-item">
        <text class="label">结束时间</text>
        <view class="datetime-row">
          <view class="picker-col" @click="showCloseDate = true">{{ form.close_date || '选择日期' }}</view>
          <view class="picker-col" @click="showCloseTime = true">{{ form.close_time || '选择时间' }}</view>
        </view>
        <common-date-picker v-model:show="showCloseDate" v-model="form.close_date" title="选择结束日期" />
        <common-time-picker v-model:show="showCloseTime" v-model="form.close_time" title="选择结束时间" />
      </view>

      <!-- 图片（上传逻辑与样式保持一致） -->
      <view class="form-item">
        <text class="label">毛则图片</text>
        <view class="images">
          <view v-if="uploading" class="uploading-container">
            <uni-load-more status="loading"></uni-load-more>
            <text class="uploading-text">{{ uploadStatusText || `上传中 (${uploadedCount}/${totalToUpload})` }}</text>
          </view>
          <view v-for="(img, i) in form.images" :key="i" class="img-wrap">
            <image :src="img" mode="aspectFill" class="img" @click="preview(form.images, i)" />
            <uni-icons class="del" type="close" size="18" color="#fff" @click="removeImage(i)" />
          </view>
          <view class="img-add" v-if="form.images.length < 9 && !uploading" @click="chooseAndUpload">
            <uni-icons type="plusempty" size="28" color="#999" />
            <text>添加</text>
          </view>
        </view>
      </view>

      <!-- 接妆尺寸（随 order_config.extra 提交） -->
      <view class="form-item">
        <text class="label">接妆尺寸</text>
        <view class="size-row">
          <view
            v-for="s in allSizes"
            :key="s"
            class="size-tag"
            :class="{ active: isSizeSelected(s) }"
            @click="handleSizeTap(s)"
          >
            {{ s }}
          </view>
        </view>
        <view class="tip">请选择本次接单的尺寸范围，并为所选尺寸设置加价。</view>
      </view>

      <!-- 尺寸加价列表（提交到 order_config.extra.size_surcharges） -->
      <view class="size-price-list" v-if="sizeSurcharges.length">
        <view class="size-price-item" v-for="(it, idx) in sizeSurcharges" :key="it.size">
          <text class="sp-label">{{ it.size }} 加价 +</text>
          <input
            class="sp-input"
            type="digit"
            :value="displayPrice(it.price)"
            @blur="e => onSizePriceBlur(idx, e.detail.value)"
            placeholder="0.00"
          />
          <uni-icons type="trash" color="#f56c6c" size="20" @click="removeSize(idx)" />
        </view>
      </view>
    </view>

    <!-- 档位配置（保持 card 样式） -->
    <view class="form-item">
      <view class="label-row">
        <text class="label">档位配置</text>
        <picker :range="tierOptions" range-key="label" @change="onTierPickerChange">
          <button class="btn-mini">+ 添加档位</button>
        </picker>
      </view>
      <view class="card" v-for="(tier, i) in form.order_config.tiers" :key="i">
        <view class="row"><input class="input" v-model="tier.title" placeholder="档位名称" /></view>
        <view class="row">
          <input class="input" type="digit" :value="displayPrice(tier.price)"
                 @blur="e => tier.price = toFixed2(e.detail.value)" placeholder="价格(0.00)" />
        </view>
        <view class="row"><input class="input" v-model="tier.description" placeholder="描述" /></view>
        <view class="row row-right" v-if="form.order_config.tiers.length > 1">
          <button class="btn-danger" @click="removeTier(i)">删除</button>
        </view>
      </view>
    </view>

    <!-- 加购配置（保持 card 样式） -->
    <view class="form-item">
      <view class="label-row">
        <text class="label">加购配置</text>
        <picker :range="addonOptions" range-key="label" @change="onAddonPickerChange">
          <button class="btn-mini">+ 添加加购</button>
        </picker>
      </view>
      <view class="card" v-for="(addon, i) in form.order_config.addons" :key="i">
        <view class="row"><input class="input" v-model="addon.title" placeholder="加购名称" /></view>
        <view class="row">
          <input class="input" type="digit" :value="displayPrice(addon.price)"
                 @blur="e => addon.price = toFixed2(e.detail.value)" placeholder="价格(0.00)" />
        </view>
        <view class="row"><input class="input" v-model="addon.description" placeholder="描述" /></view>
        <view class="row row-right" v-if="form.order_config.addons.length > 1">
          <button class="btn-danger" @click="removeAddon(i)">删除</button>
        </view>
      </view>
    </view>

    <!-- 提交 -->
    <view class="submit-box">
      <button class="btn-submit" :disabled="submitting" @click="submitPlan">
        {{ submitting ? '提交中...' : (isEditMode ? '保存修改' : '提交新计划') }}
      </button>
    </view>

    <!-- 弹层组件 -->
    <common-date-picker v-model:show="dummyShow" />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { websiteUrl } from '@/common/config.js'
import { chooseImageList, getQiniuToken, uploadImageToQiniu } from '@/common/image.js'

/* ====== 常量 ====== */
const orderTypes = [
  { value: 1, text: '长期接单' },
  { value: 2, text: '限时手速' },
  { value: 3, text: '限时抽选' },
  { value: 4, text: '限时黑箱卡' },
  { value: 9, text: '关闭投递' }
]
const allSizes = ['一分', '二分', '三分', '四分', '五分', '六分', '八分', '十二分']

/* ====== 表单状态 ====== */
const isEditMode = ref(false)
const currentId = ref(null)
const submitting = ref(false)

/** 尺寸与加价（会随 order_config.extra 提交） */
const sizeSurcharges = ref([]) // [{ size, price }]

const form = ref({
  id: null,
  artist_name: '',
  artist_type: 2, // 固定毛娘
  order_type: 1,
  max_participants: 0,
  max_submissions_per_user: 1,
  open_date: '',
  open_time: '',
  close_date: '',
  close_time: '',
  service_scene: 1,   // 固定其它平台
  images: [],
  order_config: {
    tiers: [],
    addons: [],
    extra: {
      // 仅携带尺寸附加
      size_surcharges: [] // [{size:'一分', price: 0}]
    }
  }
})

/* ====== 派生索引 ====== */
const orderTypeIndex = computed(() =>
  Math.max(0, orderTypes.findIndex(x => x.value === form.value.order_type))
)

/* ====== 时间弹层 ====== */
const showOpenDate  = ref(false)
const showOpenTime  = ref(false)
const showCloseDate = ref(false)
const showCloseTime = ref(false)
const dummyShow = ref(false)

/* ====== 常用配置 ====== */
const tierOptions  = ref([{ label: '添加空白档位', value: 'blank' }])
const addonOptions = ref([{ label: '添加空白加购', value: 'blank' }])

/* ====== 上传状态 ====== */
const uploading = ref(false)
const uploadedCount = ref(0)
const totalToUpload = ref(0)
const uploadStatusText = ref('')

/* ====== 生命周期 ====== */
onLoad((query) => {
  if (query && query.id) {
    isEditMode.value = true
    currentId.value = Number(query.id)
    loadDetail(currentId.value)
  } else {
    isEditMode.value = false
    currentId.value = null
  }

  // 复制入口：从列表页 copyPlan 传入
  const channel = getOpenerEventChannel && getOpenerEventChannel()
  if (channel) {
    channel.on && channel.on('copyFromPlan', (plan) => {
      // 清空时间，切到新增模式
      isEditMode.value = false
      currentId.value = null
      form.value.id = null
      form.value.artist_name = plan.artist_name || ''
      form.value.artist_type = 2 // 固定毛娘
      form.value.order_type = plan.order_type || 1
      form.value.max_participants = plan.max_participants ?? 0
      form.value.max_submissions_per_user = plan.max_submissions_per_user ?? 1
      form.value.open_date = ''
      form.value.open_time = ''
      form.value.close_date = ''
      form.value.close_time = ''
      form.value.service_scene = 1
      form.value.images = Array.isArray(plan.images) ? [...plan.images] : []

      // 回填 tiers/addons
      let tiers = []
      let addons = []
      try {
        const cfg = plan.order_config || {}
        tiers = Array.isArray(cfg.tiers) ? cfg.tiers.map(t => ({
          title: t.title || '', price: toFixed2(t.price || 0), description: t.description || ''
        })) : [{ title: '', price: 0, description: '' }]
        addons = Array.isArray(cfg.addons) ? cfg.addons.map(a => ({
          title: a.title || '', price: toFixed2(a.price || 0), description: a.description || ''
        })) : [{ title: '', price: 0, description: '' }]
      } catch (e) { /* ignore */ }

      form.value.order_config.tiers = tiers
      form.value.order_config.addons = addons

      // 复制时带上尺寸（如源数据有 extra.size_surcharges）
      sizeSurcharges.value = []
      if (plan.order_config && plan.order_config.extra && Array.isArray(plan.order_config.extra.size_surcharges)) {
        sizeSurcharges.value = plan.order_config.extra.size_surcharges.map(it => ({
          size: it.size, price: toFixed2(it.price || 0)
        }))
      }

      uni.showToast({ title: '已复制到新增表单', icon: 'success' })
    })
  }
})
onMounted(() => {
  fetchCommonConfigs() // 固定毛娘
  uni.setNavigationBarTitle({ title: '毛娘订单管理' })
})

/* ====== 工具 ====== */
const pad2 = (n) => (n < 10 ? '0' + n : '' + n)
function toUnix(dateStr, timeStr) {
  if (!dateStr || !timeStr) return 0
  const ts = new Date(`${dateStr} ${timeStr}`).getTime()
  if (Number.isNaN(ts)) return 0
  return Math.floor(ts / 1000)
}
function displayPrice(v) {
  const num = Number(v)
  if (Number.isNaN(num)) return ''
  return (Math.round(num * 100) / 100).toFixed(2)
}
function toFixed2(v) {
  const num = parseFloat(String(v).replace(/[^\d.]/g, ''))
  if (Number.isNaN(num)) return 0
  return Math.round(num * 100) / 100
}
function getAuthorization() { return uni.getStorageSync('token') || '' }

/* ====== 选择器事件 ====== */
function onOrderTypeChange(e) {
  const idx = Number(e.detail.value || 0)
  form.value.order_type = orderTypes[idx].value
}

/* ====== 默认配置拉取（固定毛娘：typeParam=1） ====== */
async function fetchCommonConfigs() {
  try {
    const typeParam = 1 // 毛娘
    const tRes = await uni.request({
      url: `${websiteUrl.value}/brand-manager/order-plane/common-tiers?type=${typeParam}`,
      method: 'GET',
      header: { Authorization: getAuthorization() }
    })
    if (String(tRes.data?.status).toLowerCase() === 'success') {
      tierOptions.value = [
        { label: '添加空白档位', value: 'blank' },
        ...((tRes.data?.data || []).map(it => ({ label: it.title, value: it })))
      ]
    }
    const aRes = await uni.request({
      url: `${websiteUrl.value}/brand-manager/order-plane/common-addons?type=${typeParam}`,
      method: 'GET',
      header: { Authorization: getAuthorization() }
    })
    if (String(aRes.data?.status).toLowerCase() === 'success') {
      addonOptions.value = [
        { label: '添加空白加购', value: 'blank' },
        ...((aRes.data?.data || []).map(it => ({ label: it.title, value: it })))
      ]
    }
  } catch (err) { console.error('获取默认配置失败：', err) }
}

/* ====== 档位/加购 ====== */
function onTierPickerChange(e) {
  const idx = Number(e.detail.value || 0)
  const opt = tierOptions.value[idx]
  if (!opt) return
  if (opt.value === 'blank') {
    form.value.order_config.tiers.push({ title: '', price: 0, description: '' })
  } else {
    form.value.order_config.tiers.push({
      title: opt.value.title || '',
      price: toFixed2(opt.value.price || 0),
      description: opt.value.description || ''
    })
  }
}
function removeTier(i) {
  if (form.value.order_config.tiers.length > 1) form.value.order_config.tiers.splice(i, 1)
}
function onAddonPickerChange(e) {
  const idx = Number(e.detail.value || 0)
  const opt = addonOptions.value[idx]
  if (!opt) return
  if (opt.value === 'blank') {
    form.value.order_config.addons.push({ title: '', price: 0, description: '' })
  } else {
    form.value.order_config.addons.push({
      title: opt.value.title || '',
      price: toFixed2(opt.value.price || 0),
      description: opt.value.description || ''
    })
  }
}
function removeAddon(i) {
  if (form.value.order_config.addons.length > 1) form.value.order_config.addons.splice(i, 1)
}

/* ====== 尺寸（提交到 order_config.extra.size_surcharges） ====== */
function isSizeSelected(size) {
  return sizeSurcharges.value.some(x => x.size === size)
}
function handleSizeTap(size) {
  const arr = sizeSurcharges.value
  const exists = arr.find(x => x.size === size)
  if (exists) {
    uni.showToast({ title: '已选择该尺寸', icon: 'none' })
    return
  }
  arr.push({ size, price: 0 })
}
function onSizePriceBlur(idx, val) {
  sizeSurcharges.value[idx].price = toFixed2(val)
}
function removeSize(idx) {
  sizeSurcharges.value.splice(idx, 1)
}

/* ====== 上传 ====== */
async function chooseAndUpload() {
  try {
    const remaining = 9 - form.value.images.length
    if (remaining <= 0) return
    const tempFilePaths = await chooseImageList(remaining)
    if (!tempFilePaths || tempFilePaths.length === 0) return
    uploading.value = true
    totalToUpload.value = tempFilePaths.length
    uploadedCount.value = 0
    const uploadedUrls = []
    for (let i = 0; i < tempFilePaths.length; i++) {
      try {
        const q = await getQiniuToken()
        const token = q.token
        const basePath = q.path
        const filePath = tempFilePaths[i]
        uploadStatusText.value = `上传中 (${i + 1}/${tempFilePaths.length})`
        uploadedCount.value = i + 1
        const ret = await uploadImageToQiniu(filePath, token, basePath)
        if (ret && ret.imageUrl) uploadedUrls.push(ret.imageUrl)
      } catch (err) {
        console.error(`第 ${i + 1} 张上传失败：`, err)
        uni.showToast({ title: `第 ${i + 1} 张上传失败`, icon: 'none' })
      }
    }
    form.value.images = [...form.value.images, ...uploadedUrls]
    if (uploadedUrls.length > 0) uni.showToast({ title: `成功上传 ${uploadedUrls.length} 张`, icon: 'success' })
  } catch (e) {
    console.error('选择/上传失败：', e)
    uni.showToast({ title: '图片上传失败', icon: 'none' })
  } finally {
    uploading.value = false
    uploadedCount.value = 0
    totalToUpload.value = 0
    uploadStatusText.value = ''
  }
}
function removeImage(i) { form.value.images.splice(i, 1) }
function preview(list, current) { uni.previewImage({ urls: list, current }) }

/* ====== 详情加载 ====== */
async function loadDetail(id) {
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/brand-manager/order-plan/info?id=${id}`,
      method: 'GET',
      header: { Authorization: getAuthorization() }
    })
    if (String(res.data?.status).toLowerCase() !== 'success') {
      uni.showToast({ title: res.data?.message || '获取详情失败', icon: 'none' }); return
    }
    const p = res.data.data || res.data

    form.value.id = p.id
    form.value.artist_name = p.artist_name || ''
    form.value.artist_type = 2 // 固定毛娘
    form.value.order_type = p.order_type || 1
    form.value.max_participants = p.max_participants ?? 0
    form.value.max_submissions_per_user = p.max_submissions_per_user ?? 1
    form.value.service_scene = 1 // 固定其它平台
    if (p.open_time) {
      const dt = new Date(p.open_time * 1000)
      form.value.open_date = `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`
      form.value.open_time = `${pad2(dt.getHours())}:${pad2(dt.getMinutes())}`
    }
    if (p.close_time) {
      const dt = new Date(p.close_time * 1000)
      form.value.close_date = `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`
      form.value.close_time = `${pad2(dt.getHours())}:${pad2(dt.getMinutes())}`
    }
    if (typeof p.images === 'string') {
      form.value.images = p.images.split(',').map(s => s.trim()).filter(Boolean)
    } else if (Array.isArray(p.images)) {
      form.value.images = p.images.map(x => (typeof x === 'string' ? x : x.url)).filter(Boolean)
    } else { form.value.images = [] }

    // 回填 tiers/addons/extra.size_surcharges
    let cfg = {}
    try { cfg = p.order_config ? JSON.parse(p.order_config) : {} } catch (e) { cfg = {} }
    form.value.order_config.tiers = Array.isArray(cfg.tiers) ? cfg.tiers.map(t => ({
      title: t.title || '', price: toFixed2(t.price || 0), description: t.description || ''
    })) : [{ title: '', price: 0, description: '' }]
    form.value.order_config.addons = Array.isArray(cfg.addons) ? cfg.addons.map(a => ({
      title: a.title || '', price: toFixed2(a.price || 0), description: a.description || ''
    })) : [{ title: '', price: 0, description: '' }]

    sizeSurcharges.value = Array.isArray(cfg?.extra?.size_surcharges)
      ? cfg.extra.size_surcharges.map(it => ({ size: it.size, price: toFixed2(it.price || 0) }))
      : []

    fetchCommonConfigs()
  } catch (err) {
    console.error('加载失败：', err)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

/* ====== 提交 ====== */
async function submitPlan() {
  if (!form.value.artist_name) return uni.showToast({ title: '请填写计划名称', icon: 'none' })
  const openUnix = toUnix(form.value.open_date, form.value.open_time)
  const closeUnix = toUnix(form.value.close_date, form.value.close_time)
  if (!openUnix || !closeUnix) return uni.showToast({ title: '请选择开始与结束时间', icon: 'none' })
  if (closeUnix <= openUnix) return uni.showToast({ title: '结束时间必须晚于开始时间', icon: 'none' })

  // 仅提交后端接受字段 + order_config.extra.size_surcharges
  const payload = {
    id: form.value.id,
    artist_name: form.value.artist_name,
    artist_type: 2,
    order_type: form.value.order_type,
    max_participants: form.value.order_type === 1 ? 0 : form.value.max_participants,
    max_submissions_per_user: form.value.order_type === 1 ? 1 : form.value.max_submissions_per_user,
    open_time: openUnix,
    close_time: closeUnix,
    service_scene: 1, // 固定其它平台
    images: form.value.images,
    order_config: {
      tiers: (form.value.order_config.tiers || []).map(t => ({
        title: t.title || '', price: toFixed2(t.price || 0), description: t.description || ''
      })),
      addons: (form.value.order_config.addons || []).map(a => ({
        title: a.title || '', price: toFixed2(a.price || 0), description: a.description || ''
      })),
      extra: {
        size_surcharges: sizeSurcharges.value.map(it => ({
          size: it.size, price: toFixed2(it.price || 0)
        }))
      }
    }
  }

  submitting.value = true
  try {
    const url = websiteUrl.value + (isEditMode.value ? '/brand-manager/order-plan/update' : '/brand-manager/order-plan/add')
    const res = await uni.request({
      url, method: 'POST', data: payload,
      header: { Authorization: getAuthorization(), 'Content-Type': 'application/json' }
    })
    if (String(res.data?.status).toLowerCase() === 'success') {
      uni.showToast({ title: isEditMode.value ? '更新成功' : '添加成功', icon: 'success' })
      setTimeout(() => uni.navigateBack(), 800)
    } else {
      uni.showToast({ title: res.data?.message || '提交失败', icon: 'none' })
    }
  } catch (err) {
    console.error('提交失败：', err)
    uni.showToast({ title: '请求失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.order-plan-form{
  padding: 24rpx;
  background: #f7f8fa;
  min-height: 100vh;
  box-sizing: border-box;
}

/* 顶部表单分组 */
.top-panel{
  background: #fff;
  border-radius: 20rpx;
  padding: 8rpx 16rpx;
  box-shadow: 0 8rpx 28rpx rgba(0,0,0,0.06);
  margin-bottom: 24rpx;
}
.top-panel .form-item{
  margin: 0;
  padding: 20rpx 8rpx;
  border-bottom: 1rpx solid #f1f2f4;
}
.top-panel .form-item:last-child{
  border-bottom: none;
}

/* 只读行 */
.readonly-field{
  background:#fff; border-radius:12rpx; padding: 20rpx;
}
.readonly-text{ color:#333; font-size: 28rpx; }

.inline-control{ display:flex; align-items:center; gap:12rpx; }
.inline-tip{ color:#909399; font-size: 24rpx; }

/* 通用 */
.form-item{ margin-bottom: 24rpx; }
.label{
  display:block; margin-bottom: 12rpx; color:#333; font-size: 28rpx; font-weight: 600;
}
.input{
  background:#fff; border-radius: 12rpx; padding: 20rpx; font-size: 28rpx;
}
.picker{
  background:#fff; border-radius: 12rpx; padding: 20rpx; font-size: 28rpx; color:#333;
}
.tip{ margin-top: 8rpx; color:#999; font-size: 24rpx; line-height: 1.6; }

/* 日期+时间并排 */
.datetime-row{ display:flex; gap:12rpx; }
.picker-col{
  flex:1; background:#fff; border-radius:12rpx; padding:20rpx; font-size:28rpx; color:#333;
}

/* 你喜欢的 card 样式保留 */
.label-row{ display:flex; align-items:center; justify-content:space-between; }
.btn-mini{
  background: linear-gradient(135deg, #8fecff, #c1ddff);
  color: #2c3e50;
  border-radius: 28rpx; font-size: 24rpx; padding: 6rpx 16rpx; margin: 0;
}
.btn-mini::after{ border:none; }
.card{
  background:#fff; border-radius: 12rpx; padding: 20rpx; margin-top: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
}
.row{ margin-bottom: 12rpx; }
.row-right{ text-align: right; }
.btn-danger{ background:#ffeeee; color:#ff4d6a; border-radius: 24rpx; font-size: 24rpx; padding: 4rpx 16rpx; }
.btn-danger::after{ border:none; }

/* 图片上传 */
.images{ display:flex; flex-wrap: wrap; gap: 16rpx; }
.img-wrap{ width: 160rpx; height: 160rpx; border-radius: 12rpx; overflow: hidden; position: relative; background:#f5f5f5; }
.img{ width:100%; height:100%; }
.del{ position:absolute; right:6rpx; top:6rpx; background: rgba(0,0,0,0.45); border-radius: 50%; padding: 4rpx; }
.img-add{
  width:160rpx; height:160rpx; border:2rpx dashed #ddd; border-radius:12rpx;
  display:flex; flex-direction:column; align-items:center; justify-content:center; color:#999; font-size:24rpx;
}
.uploading-container{
  width:100%; padding:20rpx 0; display:flex; flex-direction:column; align-items:center; justify-content:center;
}
.uploading-text{ margin-top: 10rpx; color:#999; font-size: 26rpx; }

/* 尺寸（提交到 order_config.extra） */
.size-row{ display:flex; flex-wrap: wrap; gap: 12rpx; }
.size-tag{
  padding: 8rpx 16rpx; border-radius: 24rpx; background:#f0f0f0; color:#333; font-size: 24rpx;
}
.size-tag.active{ background:#171e22; color:#fff; }
.size-price-list{ margin-top: 12rpx; }
.size-price-item{
  display:flex; align-items:center; gap: 12rpx; background:#fff; padding: 14rpx; border-radius: 10rpx; margin-bottom: 10rpx;
}
.sp-label{ color:#333; font-size: 26rpx; }
.sp-input{ flex:1; background:#f8f8f8; border-radius: 8rpx; padding: 14rpx; font-size: 26rpx; }

/* 提交 */
.submit-box{ padding: 20rpx 0 60rpx; }
.btn-submit{
  width:100%; height:88rpx; line-height:88rpx; border-radius:44rpx; font-size:32rpx;
  background: linear-gradient(135deg, #8fecff, #c1ddff); color:#2c3e50;
}
.btn-submit::after{ border:none; }
</style>
