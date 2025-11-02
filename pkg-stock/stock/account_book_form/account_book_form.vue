<template>
  <view-logs />
  <view class="container" @tap="showPayPopup = false">
    <meta name="theme-color" content="#F8F8F8"></meta>

    <!-- 分类管理组件 -->
    <item-category-manager
      v-model="typeModalVisible"
      :list="customTypes"
      @updated="onTypesUpdated"
      @update:modelValue="onTypeMgrVisibleChange"
    />

    <!-- 表单卡片容器 -->
    <view class="form-card">
      <!-- 分类选择 -->
      <view class="form-item">
        <text class="form-label">分类</text>
        <view class="type-selector">
          <picker mode="selector" class="form-input" :value="selectedType" :range="typeOptions" @change="updateSelectedType">
            <view class="picker-content">{{ typeOptions[selectedType] || '请选择分类' }}</view>
          </picker>
          <text class="manage-type" @tap="typeModalVisible = true">管理分类</text>
        </view>
      </view>

      <!-- 名称 -->
      <view class="form-item">
        <text class="form-label">名称</text>
        <view class="form-input" style="padding:0;">
          <view class="custom-search-container">
            <goods-search
              :font-size="'24rpx'"
              mode="fill"
              @select="handleGoodsSelect"
              v-model="name"
              :background="'#fff'"
              :width="'620rpx'"
              :show-icon="false"
              class="custom-search"
            />
          </view>
        </view>
      </view>

      <!-- 价值 -->
      <view class="form-item">
        <text class="form-label">价值(一位小数)</text>
        <!-- 允许输入小数，最多一位；若为整数不补 .0 -->
        <input
          class="form-input"
          type="text"
          inputmode="decimal"
          placeholder="请输入价值"
          placeholder-class="placeholder-style"
          v-model="price"
          @input="onPriceInput"
          @blur="onPriceBlur"
        />
      </view>

      <!-- 付款状态 -->
      <view class="form-item">
        <text class="form-label">付款状态</text>
        <view class="form-input" @tap.stop="openPayPopup">
          <view class="picker-content">{{ paymentLabel }}</view>
          <uni-icons type="right" size="20" class="input-icon"></uni-icons>
        </view>

        <view v-if="showPayPopup" class="dropdown-popup" @tap.stop>
          <view
            v-for="opt in PAYMENT_OPTIONS"
            :key="opt.value"
            class="option-item"
            :class="{ active: paymentStatus === opt.value }"
            @tap="choosePayment(opt.value)"
          >
            <text>{{ opt.label }}</text>
            <uni-icons v-if="paymentStatus === opt.value" type="checkmarkempty" size="18"></uni-icons>
          </view>
        </view>
      </view>

      <!-- 个数 -->
      <view class="form-item">
        <text class="form-label">个数</text>
        <input class="form-input" type="number" placeholder="请输入个数" placeholder-class="placeholder-style" v-model="count" />
      </view>

      <!-- 图片上传 -->
      <view class="form-item">
        <text class="form-label">物品图片</text>
        <view class="upload-wrapper">
          <view class="image-grid">
            <view v-for="(img, index) in imageList" :key="index" class="preview-image">
              <image mode="aspectFill" :src="img" class="image-preview" @tap="viewFullImage(index)"></image>
              <view class="image-actions">
                <uni-icons type="close" size="22" color="#fff" @tap="(e) => removeImage(index, e)" class="delete-icon"></uni-icons>
              </view>
            </view>
            <view class="add-image-box" @click="selectImage">
              <uni-icons type="plusempty" size="40" color="#ccc"></uni-icons>
              <text class="add-text">添加图片</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 尺寸选择器 -->
      <view class="form-item">
        <text class="form-label">尺寸</text>
        <uni-data-picker placeholder="请选择尺寸" :localdata="sizeOptions" :value="selectedSizePath" @change="onSizeChange" class="size-picker" />
      </view>

      <!-- 更多信息折叠区域 -->
      <view class="form-item">
        <label class="remind-label" @tap="toggleMoreInfo()">
          <view class="arrow-icon" :class="{ 'arrow-down': showMoreInfo }"></view>
          <text>更多信息</text>
        </label>
      </view>

      <view v-if="showMoreInfo" class="more-info-form">
        <view class="form-item size_detail">
          <text class="form-label">尺寸详情</text>
          <input v-model="moreInfo.sizeDetail" placeholder="请输入尺寸详情" class="form-input" />
        </view>

        <view class="form-item">
          <text class="form-label">颜色</text>
          <input v-model="moreInfo.color" placeholder="请输入颜色" class="form-input" />
        </view>

        <view class="form-item">
          <text class="form-label">店名</text>
          <input v-model="moreInfo.shopName" placeholder="请输入店名" class="form-input" />
        </view>

        <view class="form-item">
          <text class="form-label">头围</text>
          <input v-model="moreInfo.headCircumference" placeholder="请输入头围(cm)" class="form-input" type="digit" />
        </view>

        <view class="form-item">
          <text class="form-label">肩宽</text>
          <input v-model="moreInfo.shoulderWidth" placeholder="请输入肩宽(cm)" class="form-input" type="digit" />
        </view>

        <view class="form-item">
          <text class="form-label">妆师</text>
          <input v-model="moreInfo.makeupArtist" placeholder="请输入妆师" class="form-input" />
        </view>

        <view class="form-item">
          <text class="form-label">备注</text>
          <input v-model="moreInfo.remark" placeholder="请输入备注" class="form-input" />
        </view>

        <view class="form-item">
          <text class="form-label">购入时间</text>
          <view class="date-picker-wrapper" @tap="showBuyPicker = true">
            <view class="picker-content">{{ moreInfo.buyDate || '选择购入日期' }}</view>
          </view>
        </view>

        <view class="form-item">
          <text class="form-label">到家日期</text>
          <view class="date-picker-wrapper" @tap="showArrivalPicker = true">
            <view class="picker-content">{{ moreInfo.arrivalDate || '选择到家日期' }}</view>
          </view>
        </view>

        <view class="form-item">
          <text class="form-label">附加值（妆费或h了多少入）</text>
          <input v-model="moreInfo.additionalValue" placeholder="请输入附加值" class="form-input" type="digit" />
        </view>

        <view class="form-item">
          <text class="form-label">存放位置</text>
          <input v-model="moreInfo.position" placeholder="请输入存放位置" class="form-input" />
        </view>
      </view>

      <!-- 补款提醒 -->
      <view class="form-item">
        <label class="remind-label" @tap="toggleRemind()">
          <view class="arrow-icon" :class="{ 'arrow-down': form.isRemind }"></view>
          <text>需要补款提醒</text>
          <view v-if="form.finalPrice > 0 " class="remind-dot"></view>
        </label>
      </view>

      <view v-if="form.isRemind" class="remind-form">
        <view class="form-item">
          <text class="form-label">尾款金额</text>
          <input type="number" v-model="form.finalPrice" placeholder="请输入待补款金额" class="form-input" />
        </view>

        <view class="form-item">
          <text class="form-label">补款日期</text>
          <view class="date-picker-wrapper" @tap="showFinalPicker = true">
            <view class="picker-content">{{ form.finalTime || '选择截止日期' }}</view>
          </view>
        </view>
      </view>

      <view class="info-text">
        <image src="/static/info-circle.png" mode="aspectFill"></image>
        <text>仅用于记录您所购买过的物品，其他人不会看到</text>
      </view>

      <view class="button-group">
        <button class="delete-button" v-if="isEdit" @click="handleDelete">删除账本</button>
        <button class="submit-button" @click="postSubmit">记录{{ isEdit ? '修改' : '新增' }}</button>
      </view>
    </view>

    <!-- 日期选择器 -->
    <common-date-picker
      v-model:show="showBuyPicker"
      v-model="moreInfo.buyDate"
      title="选择购入日期"
      :min-date="'2000-01-01'"
      :max-date="'2035-12-31'"
    />
    <common-date-picker
      v-model:show="showArrivalPicker"
      v-model="moreInfo.arrivalDate"
      title="选择宠物到家日期"
      :min-date="'2000-01-01'"
      :max-date="'2035-12-31'"
    />
    <common-date-picker
      v-model:show="showFinalPicker"
      v-model="form.finalTime"
      title="选择补款截止日期"
      :min-date="'2000-01-01'"
      :max-date="'2035-12-31'"
    />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow, onLoad } from '@dcloudio/uni-app'
import { websiteUrl, image1Url, asyncGetUserInfo } from "../../../common/config.js"
import { getQiniuToken, uploadImageToQiniu } from "../../../common/image.js"

const props = defineProps(["account_book_id"])
const isEdit = props.account_book_id ? true : false

// 日期选择器开关
const showBuyPicker = ref(false)
const showArrivalPicker = ref(false)
const showFinalPicker = ref(false)

// —— 分类管理开关 & 列表 ——
const typeModalVisible = ref(false)
const customTypes = ref([])
const defaultTypes = []
const typeOptions = computed(() => [...defaultTypes, ...customTypes.value.map(t => t.name)])
const selectedType = ref(0)
const updateSelectedType = (e) => { selectedType.value = e.detail.value }
const onTypeMgrVisibleChange = (visible) => { typeModalVisible.value = visible; if (!visible) getAccountTypes() }
const onTypesUpdated = (list) => { customTypes.value = list || []; if (selectedType.value >= typeOptions.value.length) selectedType.value = 0 }

// —— 其它表单状态 ——
const count = ref(1)
const imageList = ref([])
let name = ref("")
let price = ref("") // 用字符串控制展示格式（整数或一位小数）
const form = ref({ isRemind: false, finalPrice: 0, finalTime: '' })

// —— 付款状态 ——
const PAYMENT_OPTIONS = [
  { value: 1, label: '已全款' },
  { value: 2, label: '已付定金' },
  { value: 3, label: '未购买' }
]
const paymentStatus = ref(1)
const showPayPopup = ref(false)
const paymentLabel = computed(() => (PAYMENT_OPTIONS.find(o => o.value === paymentStatus.value)?.label) || '已全款')
const openPayPopup = () => { showPayPopup.value = !showPayPopup.value }
const choosePayment = (v) => { paymentStatus.value = v; showPayPopup.value = false }

const showMoreInfo = ref(false)
const sizeOptions = ref([])
const selectedSizePath = ref([])
const moreInfo = ref({
  sizeDetail: '',
  color: '',
  remark: '',
  buyDate: '',
  position: '',
  shopName: '',
  headCircumference: '',
  shoulderWidth: '',
  makeupArtist: '',
  arrivalDate: '',
  additionalValue: ''
})

// —— 尺寸相关 ——
const fetchSizes = async () => {
  try {
    const res = await uni.request({ url: websiteUrl.value + '/sizes', method: 'GET' })
    if (res.data.status === "success") {
      const sizesData = res.data.data
      const formatted = []
      for (const [category, items] of Object.entries(sizesData)) {
        formatted.push({ text: category, value: category, children: items.map(it => ({ text: it, value: it })) })
      }
      sizeOptions.value = formatted
    }
  } catch (e) { uni.showToast({ title: '获取尺寸数据失败', icon: 'none' }) }
}
const onSizeChange = (e) => {
  const nodes = e.detail.value
  if (nodes.length === 2) {
    selectedSizePath.value = [nodes[0].value, nodes[1].value]
    moreInfo.value.sizeDetail = nodes[1].value
  } else {
    selectedSizePath.value = []
    moreInfo.value.sizeDetail = ''
  }
}
const toggleMoreInfo = () => { showMoreInfo.value = !showMoreInfo.value }

// —— 分类接口 ——
const getAccountTypes = async () => {
  const token = uni.getStorageSync('token')
  try {
    const res = await uni.request({
      url: websiteUrl.value + '/with-state/account-types',
      method: 'GET',
      header: { 'Authorization': token }
    })
    customTypes.value = res.data.data || []
  } catch (err) { console.error('获取分类失败:', err) }
}
const addNewType = async () => {}
const deleteType = async () => {}

// —— 提醒 —— 
const toggleRemind = () => {
  form.value.isRemind = !form.value.isRemind
  if (!form.value.isRemind) { form.value.finalPrice = 0; form.value.finalTime = '' }
}

/** ================== 价格相关 ================== */
/** 输入限制：仅数字与一个小数点，小数位最多 1 位（截断不四舍五入） */
function onPriceInput(e) {
  let s = String(e?.detail?.value ?? '')
  s = s.replace(/[^0-9.]/g, '')
  const firstDot = s.indexOf('.')
  if (firstDot !== -1) {
    s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, '')
    const parts = s.split('.')
    s = parts[0] + (parts[1] !== undefined ? ('.' + parts[1].slice(0, 1)) : '')
  }
  if (s.startsWith('.')) s = '0' + s
  price.value = s
}
/** 失焦时去掉末尾孤立的小数点（如 "12." -> "12"） */
function onPriceBlur() {
  if (typeof price.value === 'string' && price.value.endsWith('.')) {
    price.value = price.value.slice(0, -1)
  }
}
/** 展示为：整数或 1 位小数；不强制补 .0 */
function formatPriceDisplay(val) {
  const n = Number(val)
  if (!isFinite(n)) return ''
  if (Math.floor(n) === n) return String(Math.trunc(n))
  const trimmed = Math.sign(n) * Math.floor(Math.abs(n) * 10) / 10
  return String(trimmed)
}
/** 提交用：转 number，最多 1 位小数；不返回字符串，不带 .0 */
function normalizePriceForSubmit(s) {
  if (!s) return 0
  const n = parseFloat(s)
  if (!isFinite(n)) return 0
  const trimmed = Math.sign(n) * Math.floor(Math.abs(n) * 10) / 10
  return Number(String(trimmed))
}
/** ================== /价格相关 ================== */

// —— 获取详情（编辑态） ——
function getAccountBookById(id) {
  let token = uni.getStorageSync('token')
  uni.request({
    url: websiteUrl.value + '/with-state/account-book-detail',
    method: 'GET',
    header: { 'Authorization': token },
    data: { id },
    success: (res) => {
      const d = res.data.data
      name.value = d.name
      price.value = formatPriceDisplay(d.price)
      count.value = d.count || 1
      if (d.image_url) imageList.value = d.image_url.split(',')
      form.value = { isRemind: d.is_remind, finalPrice: d.final_price, finalTime: d.final_time }

      const typeName = d.type
      const idx = typeOptions.value.findIndex(opt => opt === typeName)
      selectedType.value = idx !== -1 ? idx : 0

      moreInfo.value = {
        sizeDetail: d.size_detail || '',
        color: d.color || '',
        remark: d.remark || '',
        buyDate: d.buy_date ? new Date(d.buy_date).toISOString().split('T')[0] : '',
        position: d.position || '',
        shopName: d.shop_name || '',
        headCircumference: d.head_circumference || '',
        shoulderWidth: d.shoulder_width || '',
        makeupArtist: d.makeup_artist || '',
        arrivalDate: d.arrival_date ? new Date(d.arrival_date).toISOString().split('T')[0] : '',
        additionalValue: d.additional_value || ''
      }
      if (d.size) { selectedSizePath.value = [d.size, d.size_detail || '']; moreInfo.value.sizeDetail = d.size_detail || '' }

      paymentStatus.value = d.payment_status || 1
    }
  })
}

// —— 选择商品自动填充 —— 
const handleGoodsSelect = async (goods) => {
  try {
    const res = await uni.request({ url: websiteUrl.value + `/goods?id=${goods.id}`, method: 'GET' })
    if (res.data.status === "success") {
      const detail = res.data.data
      name.value = detail.name
      const sub = Number(detail.sub_amount) || 0
      const fin = Number(detail.fin_amount) || 0
      price.value = formatPriceDisplay(sub + fin)
      if (detail.goods_images?.[0]) imageList.value = [detail.goods_images[0]]
    }
  } catch (e) {
    uni.showToast({ title: '获取商品信息失败', icon: 'none' })
  }
}

// —— 删除账本 —— 
function handleDelete() {
  uni.showModal({
    title: '提示',
    content: '确定删除该账本吗？',
    success: (res) => {
      if (!res.confirm) return
      const id = Number(props.account_book_id)
      if (isNaN(id) || id <= 0) { uni.showToast({ title: '参数错误', icon: 'none' }); return }
      uni.request({
        url: websiteUrl.value + '/with-state/delete-account-book',
        method: 'POST',
        header: { 'Authorization': uni.getStorageSync('token'), 'Content-Type': 'application/json' },
        data: { id },
        success: (r) => {
          if (r.data.status === 'success') { uni.showToast({ title: '删除成功', icon: 'success' }); setTimeout(() => uni.navigateBack(), 500) }
          else { uni.showToast({ title: r.data.msg || '删除失败', icon: 'none' }) }
        },
        fail: () => uni.showToast({ title: '网络错误', icon: 'none' })
      })
    }
  })
}

// —— 图片上传 —— 
async function selectImage() {
  uni.chooseImage({
    count: 9,
    success: async (res) => {
      const files = res.tempFilePaths
      for (const filePath of files) {
        try {
          const tokenData = await getQiniuToken()
          const uploadRes = await uploadImageToQiniu(filePath, tokenData.token, tokenData.path)
          if (uploadRes.qiniuRes.statusCode === 200) imageList.value.push(image1Url + tokenData.path)
        } catch (e) {}
      }
      uni.showToast({ title: `上传了${files.length}张图片`, icon: 'success' })
    }
  })
}
function removeImage(index, event) {
  event?.stopPropagation?.()
  uni.showModal({
    title: '删除图片',
    content: '确定删除这张图片吗？',
    success: (res) => { if (res.confirm) imageList.value.splice(index, 1) }
  })
}
function viewFullImage(index) { uni.previewImage({ current: index, urls: imageList.value }) }

// —— 提交 —— 
function validateForm() {
  if (count.value <= 0) { uni.showToast({ title: '个数必须大于0', icon: 'none' }); return false }
  if (form.value.isRemind && (!form.value.finalPrice || form.value.finalPrice <= 0)) {
    uni.showToast({ title: '请输入正确的尾款金额', icon: 'none' }); return false
  }
  return true
}
function addAccountBook() {
  const data = buildPostData()
  uni.request({
    url: websiteUrl.value + '/with-state/add-account-book',
    method: 'POST',
    header: { 'Authorization': uni.getStorageSync('token') },
    data,
    success: (res) => {
      if (res.data.status === 'success') { uni.showToast({ title: '提交成功', icon: 'success' }); setTimeout(() => uni.navigateBack(), 500) }
      else { uni.showToast({ title: res.data.msg || '提交失败', icon: 'none' }) }
    }
  })
}
function updateAccountBook() {
  const data = buildPostData()
  data.id = parseInt(props.account_book_id, 10)
  uni.request({
    url: websiteUrl.value + '/with-state/update-account-book',
    method: 'POST',
    header: { 'Authorization': uni.getStorageSync('token') },
    data,
    success: (res) => {
      if (res.data.status === 'success') { uni.showToast({ title: '提交成功', icon: 'success' }); setTimeout(() => uni.navigateBack(), 500) }
      else { uni.showToast({ title: res.data.msg || '提交失败', icon: 'none' }) }
    }
  })
}
function buildPostData() {
  return {
    name: name.value,
    // 改为保留最多 1 位小数的 number
    price: normalizePriceForSubmit(price.value),
    count: parseInt(count.value, 10),
    type: typeOptions.value[selectedType.value],
    image_url: imageList.value.join(','),
    payment_status: paymentStatus.value,
    is_remind: form.value.isRemind,
    final_price: parseInt(form.value.finalPrice || 0, 10),
    final_time: form.value.finalTime,
    size: selectedSizePath.value[0] || '',
    size_detail: moreInfo.value.sizeDetail || '',
    color: moreInfo.value.color,
    remark: moreInfo.value.remark,
    buy_date: moreInfo.value.buyDate,
    position: moreInfo.value.position,
    shop_name: moreInfo.value.shopName,
    head_circumference: moreInfo.value.headCircumference,
    shoulder_width: moreInfo.value.shoulderWidth,
    makeup_artist: moreInfo.value.makeupArtist,
    arrival_date: moreInfo.value.arrivalDate,
    additional_value: moreInfo.value.additionalValue
  }
}
function postSubmit() { if (!validateForm()) return; isEdit ? updateAccountBook() : addAccountBook() }

// —— 生命周期 —— 
onShow(async () => {
  await asyncGetUserInfo()
  await getAccountTypes()
  await fetchSizes()
  if (isEdit) { await getAccountBookById(props.account_book_id); uni.setNavigationBarTitle({ title: '编辑账本' }) }
  else { uni.setNavigationBarTitle({ title: '新增账本' }) }
})
onLoad(async (options) => {
  if (options.goods_id) {
    try {
      const goodsInfo = await getGoodsInfo(options.goods_id)
      fillFormWithGoodsInfo(goodsInfo)
    } catch (e) { uni.showToast({ title: '获取商品信息失败', icon: 'none' }) }
  }
})
const getGoodsInfo = (id) => new Promise((resolve, reject) => {
  uni.request({
    url: websiteUrl.value + '/goods?id=' + id, method: 'GET', timeout: 5000,
    success: (res) => res.data.status === 'success' ? resolve(res.data.data) : reject(new Error(res.data.msg || '获取商品信息失败')),
    fail: reject
  })
})
const fillFormWithGoodsInfo = (g) => {
  name.value = g.name
  const totalPrice = g.total_amount ? Number(g.total_amount) : (Number(g.sub_amount) || 0) + (Number(g.fin_amount) || 0)
  price.value = formatPriceDisplay(totalPrice)
  if (g.goods_images?.length) imageList.value = [g.goods_images[0]]
  if (g.size) { selectedSizePath.value = [g.size, g.size_detail || '']; moreInfo.value.sizeDetail = g.size_detail || '' }
}
</script>

<style lang="scss" scoped>
$primary-color: #65C3D6;
$secondary-color: #94a5f3;
$border-color: #e0e0e0;
$bg-color: #f5f7fa;
$radius: 24rpx;

.container { background-color: $bg-color; min-height: 100vh; }
.form-card { background: white; border-radius: $radius; padding: 40rpx; box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04); }
.form-item { margin-bottom: 48rpx; position: relative; }

.form-label {
  position: absolute; left: 20rpx; top: -16rpx; padding: 0 10rpx; background: white;
  font-size: 26rpx; color: #b8b8b8; z-index: 1; transition: all 0.3s ease;
}
.form-input {
  height: 100rpx; padding: 0 20rpx; border: 2rpx solid $border-color; border-radius: 16rpx;
  font-size: 28rpx; transition: all 0.3s; line-height: 100rpx; background: white; position: relative;
  &:focus { border-color: $primary-color; box-shadow: 0 4rpx 12rpx rgba($primary-color, 0.2); }
}

.type-selector { display: flex; align-items: center; gap: 20rpx; .form-input { flex: 1; } }

.manage-type {
  font-size: 24rpx; color: #fff; padding: 8rpx 20rpx; border-radius: 40rpx; flex-shrink: 0;
  background: linear-gradient(135deg, #97e7f7, #d5acd6); transition: all 0.3s;
  &:active { background: rgba($primary-color, 0.2); transform: scale(0.98); }
}

.upload-wrapper { border: 2rpx dashed $border-color; border-radius: $radius; padding: 30rpx; text-align: center; background: #e0e0e038; }
.image-grid { display: flex; flex-wrap: wrap; gap: 20rpx; margin-top: 20rpx; }
.preview-image {
  position: relative; width: 180rpx; height: 180rpx; border-radius: $radius; overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  .image-preview { width: 100%; height: 100%; }
  .image-actions { position: absolute; top: 0; right: 0; padding: 6rpx; border-radius: 100%; }
  .delete-icon { display: block; background: rgba(255, 102, 102, 0.8); border-radius: 50%; height: 53rpx; width: 53rpx; box-sizing: border-box; padding: 4rpx; }
}
.add-image-box {
  width: 180rpx; height: 180rpx; border: 2rpx dashed $border-color; border-radius: $radius;
  display: flex; flex-direction: column; align-items: center; justify-content: center; background: white; color: #999; font-size: 24rpx; transition: all 0.3s;
  &:active { background: rgba($primary-color, 0.1); border-color: $primary-color; }
}
.add-text { margin-top: 10rpx; }
.button-group { display: flex; gap: 20rpx; margin-top: 60rpx; button { flex: 1; } }
.custom-search-container { position: relative; top: 15rpx; left: 5rpx; width: 90%; }

.submit-button {
  background: linear-gradient(135deg, $primary-color, $secondary-color); color: white; border: none; border-radius: 16rpx;
  font-size: 32rpx; height: 96rpx; line-height: 96rpx; box-shadow: 0 8rpx 24rpx rgba($primary-color, 0.3); transition: all 0.3s;
  &:active { transform: scale(0.98); opacity: 0.9; }
}
.delete-button {
  background: linear-gradient(135deg, #adadad, #ffbdbb); color: white; border: none; border-radius: 16rpx;
  font-size: 32rpx; height: 96rpx; line-height: 96rpx; box-shadow: 0 8rpx 24rpx rgba(255, 77, 79, 0.2); transition: all 0.3s;
  &:active { transform: scale(0.98); opacity: 0.9; }
}

.remind-label {
  display: flex; align-items: center; gap: 15rpx; font-size: 28rpx; color: #666; position: relative; padding-right: 40rpx; cursor: pointer;
  .remind-dot { position: absolute; right: 0; top: 50%; transform: translateY(-50%); width: 16rpx; height: 16rpx; background: #ff4444; border-radius: 50%; box-shadow: 0 2rpx 8rpx rgba(255, 68, 68, 0.2); }
}
.arrow-icon {
  width: 5rpx; height: 5rpx; border: solid #888; border-width: 0 2rpx 2rpx 0; transform: rotate(-45deg); transition: transform 0.3s ease; padding: 5rpx; position: relative;
  &.arrow-down { transform: rotate(45deg); bottom: 5rpx; }
}
.remind-form, .more-info-form {
  background: #e0e0e038; border-radius: $radius; padding: 30rpx; margin-top: 20rpx; border: 1px solid rgba($primary-color, 0.1); animation: fadeIn 0.3s ease; margin-bottom: 20rpx;
}
@keyframes fadeIn { from { opacity: 0; transform: translateY(-10rpx); } to { opacity: 1; transform: translateY(0); } }

.picker-content { height: 100rpx; line-height: 100rpx; color: #333; padding: 0 20rpx; }
.info-text { color: #888; font-size: 24rpx; display: flex; align-items: center; margin-top: 30rpx;
  image { width: 28rpx; height: 28rpx; margin-right: 10rpx; }
}
.size-picker { padding: 20rpx 0; ::v-deep .input-value-border { border: 2rpx solid $border-color; border-radius: 16rpx; height: 100rpx; padding: 0 20rpx; } }
.date-picker-wrapper { padding: 0px 10px; border: 1px solid #e6e6e6; border-radius: 10px; height: 100rpx; line-height: 100rpx; }
.input-icon { position: absolute; right: 30rpx; top: 50%; transform: translateY(-50%); z-index: 2; color: #999; }

.form-item { position: relative; }
.dropdown-popup {
  position: absolute;
  left: 0; right: 0;
  top: 110rpx;
  background: #fff;
  border: 2rpx solid $border-color;
  border-radius: 16rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
  overflow: hidden;
  z-index: 10;
}
.option-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 26rpx 28rpx; font-size: 28rpx; color: #333;
  &:active { background: rgba(0,0,0,0.03); }
  &.active { background: rgba($primary-color, 0.06); }
}
</style>
