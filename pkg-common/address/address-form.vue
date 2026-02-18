<template>
  <view-logs />
  <view class="form-page font-alimamashuhei">
    <view class="form-card">
      <view class="field-block">
        <view class="form-item" :class="{ 'form-item-error': !!errorFields.receiver_name }">
          <text class="form-label">收货人</text>
          <input
            v-model.trim="form.receiver_name"
            class="form-input"
            type="text"
            maxlength="30"
            placeholder="请输入收货人姓名"
            @input="clearFieldError('receiver_name')"
          />
        </view>
        <text v-if="errorFields.receiver_name" class="field-error">{{ errorFields.receiver_name }}</text>
      </view>

      <view class="field-block">
        <view class="form-item" :class="{ 'form-item-error': !!errorFields.receiver_phone }">
          <text class="form-label">手机号</text>
          <input
            v-model.trim="form.receiver_phone"
            class="form-input"
            type="number"
            maxlength="11"
            placeholder="请输入收货手机号"
            @input="clearFieldError('receiver_phone')"
          />
        </view>
        <view
          v-if="showPhoneQuickFill"
          class="quick-fill-phone"
          @click="fillReceiverPhoneFromProfile"
        >
          <text class="quick-fill-text">使用账号手机号 {{ profilePhoneMasked }}</text>
        </view>
        <text v-if="errorFields.receiver_phone" class="field-error">{{ errorFields.receiver_phone }}</text>
      </view>

      <view class="field-block">
        <picker
          mode="selector"
          :range="provinceOptions"
          range-key="name"
          :value="provincePickerIndex"
          @change="onProvinceChange"
        >
          <view class="form-item picker-item" :class="{ 'form-item-error': !!errorFields.province_code }">
            <text class="form-label">省份</text>
            <view class="picker-value-wrap">
              <text class="picker-value" :class="{ placeholder: !provinceName }">
                {{ provinceName || '请选择省份' }}
              </text>
              <uni-icons type="right" size="16" color="#b7c0c7" />
            </view>
          </view>
        </picker>
        <text v-if="errorFields.province_code" class="field-error">{{ errorFields.province_code }}</text>
      </view>

      <view class="field-block">
        <picker
          mode="selector"
          :range="cityOptions"
          range-key="name"
          :value="cityPickerIndex"
          :disabled="!form.province_code || cityOptions.length === 0"
          @change="onCityChange"
        >
          <view class="form-item picker-item" :class="{ 'form-item-error': !!errorFields.city_code }">
            <text class="form-label">城市</text>
            <view class="picker-value-wrap">
              <text class="picker-value" :class="{ placeholder: !cityName }">
                {{ cityName || '请选择城市' }}
              </text>
              <uni-icons type="right" size="16" color="#b7c0c7" />
            </view>
          </view>
        </picker>
        <text v-if="errorFields.city_code" class="field-error">{{ errorFields.city_code }}</text>
      </view>

      <view class="field-block">
        <picker
          mode="selector"
          :range="districtOptions"
          range-key="name"
          :value="districtPickerIndex"
          :disabled="!form.city_code || districtOptions.length === 0"
          @change="onDistrictChange"
        >
          <view class="form-item picker-item" :class="{ 'form-item-error': !!errorFields.district_code }">
            <text class="form-label">区县</text>
            <view class="picker-value-wrap">
              <text class="picker-value" :class="{ placeholder: !districtName }">
                {{ districtName || '请选择区县' }}
              </text>
              <uni-icons type="right" size="16" color="#b7c0c7" />
            </view>
          </view>
        </picker>
        <text v-if="errorFields.district_code" class="field-error">{{ errorFields.district_code }}</text>
      </view>

      <view class="field-block">
        <view class="form-item textarea-item" :class="{ 'form-item-error': !!errorFields.detail }">
          <text class="form-label">详细地址</text>
          <textarea
            v-model.trim="form.detail"
            class="detail-textarea"
            maxlength="120"
            placeholder="请输入门牌号等详细地址"
            @input="clearFieldError('detail')"
          />
        </view>
        <text v-if="errorFields.detail" class="field-error">{{ errorFields.detail }}</text>
      </view>

      <view class="field-block express-block">
        <view class="express-header">
          <text class="express-title">建议快递</text>
        </view>
        <text class="express-desc">
          您希望的收件快递是哪些。产生交易的另一方向您发快递时，会尽量使用您所选的快递，但不会对对方有强制约束，仅作为建议。
        </text>

        <view class="express-chip-list">
          <view
            v-for="item in suggestedExpressOptions"
            :key="item"
            class="express-chip"
            :class="{ active: hasSuggestedExpress(item) }"
            @click="toggleSuggestedExpress(item)"
          >
            {{ item }}
          </view>
        </view>

        <view class="form-item express-custom-item">
          <text class="form-label">自定义</text>
          <input
            v-model.trim="suggestedExpressInput"
            class="form-input"
            type="text"
            maxlength="20"
            placeholder="输入快递名后点击添加"
            @confirm="addCustomSuggestedExpress"
          />
          <text class="express-add-btn" @click="addCustomSuggestedExpress">添加</text>
        </view>

        <view v-if="form.suggested_express.length > 0" class="express-selected-list">
          <view
            v-for="item in form.suggested_express"
            :key="item"
            class="express-selected-chip"
            @click="removeSuggestedExpress(item)"
          >
            <text class="chip-name">{{ item }}</text>
            <uni-icons type="closeempty" size="12" color="#6d7c85" />
          </view>
        </view>
      </view>

      <view class="default-line">
        <text class="default-text">设为默认地址</text>
        <switch
          :checked="form.is_default === 1"
          color="#7cc1d2"
          @change="onDefaultChange"
        />
      </view>
    </view>

    <view v-if="submitErrorMessage" class="submit-error-tip">{{ submitErrorMessage }}</view>

    <button
      class="submit-btn"
      :disabled="submitting || pageLoading"
      @click="submitForm"
    >
      {{ submitting ? '保存中...' : (isEdit ? '保存修改' : '保存地址') }}
    </button>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { websiteUrl, asyncGetUserInfo, global } from '@/common/config.js'

const isEdit = ref(false)
const pageLoading = ref(false)
const submitting = ref(false)

const form = ref({
  id: 0,
  receiver_name: '',
  receiver_phone: '',
  province_code: 0,
  city_code: 0,
  district_code: 0,
  detail: '',
  suggested_express: [],
  is_default: 0
})
const suggestedExpressInput = ref('')
const suggestedExpressOptions = [
  '顺丰',
  '京东',
  '中通',
  '圆通',
  '申通',
  '韵达',
  '极兔',
  'EMS'
]

const provinceOptions = ref([])
const cityOptions = ref([])
const districtOptions = ref([])

const provinceName = ref('')
const cityName = ref('')
const districtName = ref('')
const DETAIL_MIN_LENGTH = 4
const profilePhone = ref('')

const errorFields = ref({
  receiver_name: '',
  receiver_phone: '',
  province_code: '',
  city_code: '',
  district_code: '',
  detail: ''
})
const submitErrorMessage = ref('')

function resetErrors () {
  Object.keys(errorFields.value).forEach((key) => {
    errorFields.value[key] = ''
  })
  submitErrorMessage.value = ''
}

function setFieldError (field, message) {
  errorFields.value[field] = message
  if (!submitErrorMessage.value) submitErrorMessage.value = message
}

function refreshSubmitErrorMessage () {
  const firstError = Object.values(errorFields.value).find(msg => !!msg)
  submitErrorMessage.value = firstError || ''
}

function clearFieldError (field) {
  if (!field) return
  errorFields.value[field] = ''
  refreshSubmitErrorMessage()
}

function normalizeSuggestedExpressList (list) {
  if (!Array.isArray(list) || list.length === 0) return []
  const uniq = []
  list.forEach((item) => {
    const txt = String(item || '').trim()
    if (!txt) return
    if (uniq.includes(txt)) return
    uniq.push(txt)
  })
  return uniq
}

function parseSuggestedExpressField (value) {
  if (Array.isArray(value)) return normalizeSuggestedExpressList(value)
  const txt = String(value || '').trim()
  if (!txt) return []
  if (txt.startsWith('[') && txt.endsWith(']')) {
    try {
      const parsed = JSON.parse(txt)
      if (Array.isArray(parsed)) return normalizeSuggestedExpressList(parsed)
    } catch (e) {}
  }
  return normalizeSuggestedExpressList(txt.split(','))
}

function hasSuggestedExpress (name) {
  return form.value.suggested_express.includes(name)
}

function toggleSuggestedExpress (name) {
  const current = normalizeSuggestedExpressList(form.value.suggested_express)
  if (current.includes(name)) {
    form.value.suggested_express = current.filter(item => item !== name)
    return
  }
  form.value.suggested_express = normalizeSuggestedExpressList([...current, name])
}

function removeSuggestedExpress (name) {
  form.value.suggested_express = normalizeSuggestedExpressList(
    form.value.suggested_express.filter(item => item !== name)
  )
}

function addCustomSuggestedExpress () {
  const custom = String(suggestedExpressInput.value || '').trim()
  if (!custom) return
  form.value.suggested_express = normalizeSuggestedExpressList([
    ...form.value.suggested_express,
    custom
  ])
  suggestedExpressInput.value = ''
}

function maskPhone (phone) {
  const txt = String(phone || '')
  if (txt.length < 7) return txt
  return txt.replace(/^(\d{3})\d{4}(\d+)$/, '$1****$2')
}

const profilePhoneMasked = computed(() => maskPhone(profilePhone.value))
const showPhoneQuickFill = computed(() => {
  return !isEdit.value && !!profilePhone.value
})

function fillReceiverPhoneFromProfile () {
  if (!profilePhone.value) return
  form.value.receiver_phone = profilePhone.value
  clearFieldError('receiver_phone')
  uni.showToast({ title: '已填入账号手机号', icon: 'none' })
}

async function initProfilePhoneSuggestion () {
  if (isEdit.value) return
  if (!getToken()) return

  let phone = (global.userInfo?.tel_phone || '').toString().trim()
  if (!/^\d{11}$/.test(phone)) {
    const user = await asyncGetUserInfo()
    phone = (user?.tel_phone || global.userInfo?.tel_phone || '').toString().trim()
  }

  if (/^\d{11}$/.test(phone)) {
    profilePhone.value = phone
  } else {
    profilePhone.value = ''
  }
}

const provincePickerIndex = computed(() => {
  const idx = provinceOptions.value.findIndex(item => Number(item.area_code) === Number(form.value.province_code))
  return idx > -1 ? idx : 0
})

const cityPickerIndex = computed(() => {
  const idx = cityOptions.value.findIndex(item => Number(item.area_code) === Number(form.value.city_code))
  return idx > -1 ? idx : 0
})

const districtPickerIndex = computed(() => {
  const idx = districtOptions.value.findIndex(item => Number(item.area_code) === Number(form.value.district_code))
  return idx > -1 ? idx : 0
})

function getToken () {
  return uni.getStorageSync('token')
}

async function fetchAreaList (parentCode = 0) {
  const url = parentCode
    ? `${websiteUrl.value}/area/children?parent_code=${parentCode}`
    : `${websiteUrl.value}/area/provinces`

  const res = await uni.request({
    url,
    method: 'GET'
  })

  const resp = res?.data || {}
  if (resp.status === 'success' && Array.isArray(resp.data)) {
    return resp.data
  }
  return []
}

async function loadProvinces () {
  provinceOptions.value = await fetchAreaList()
}

async function loadCities (provinceCode) {
  if (!provinceCode) {
    cityOptions.value = []
    return
  }
  cityOptions.value = await fetchAreaList(provinceCode)
}

async function loadDistricts (cityCode) {
  if (!cityCode) {
    districtOptions.value = []
    return
  }
  districtOptions.value = await fetchAreaList(cityCode)
}

function onProvinceChange (e) {
  const index = Number(e?.detail?.value || 0)
  const selected = provinceOptions.value[index]
  if (!selected) return

  form.value.province_code = Number(selected.area_code)
  provinceName.value = selected.name || ''

  form.value.city_code = 0
  cityName.value = ''
  cityOptions.value = []

  form.value.district_code = 0
  districtName.value = ''
  districtOptions.value = []

  clearFieldError('province_code')
  clearFieldError('city_code')
  clearFieldError('district_code')
  loadCities(form.value.province_code)
}

function onCityChange (e) {
  const index = Number(e?.detail?.value || 0)
  const selected = cityOptions.value[index]
  if (!selected) return

  form.value.city_code = Number(selected.area_code)
  cityName.value = selected.name || ''

  form.value.district_code = 0
  districtName.value = ''
  districtOptions.value = []

  clearFieldError('city_code')
  clearFieldError('district_code')
  loadDistricts(form.value.city_code)
}

function onDistrictChange (e) {
  const index = Number(e?.detail?.value || 0)
  const selected = districtOptions.value[index]
  if (!selected) return
  form.value.district_code = Number(selected.area_code)
  districtName.value = selected.name || ''
  clearFieldError('district_code')
}

function onDefaultChange (e) {
  form.value.is_default = e?.detail?.value ? 1 : 0
}

async function fillFormById (id) {
  const token = getToken()
  if (!token) return

  const res = await uni.request({
    url: `${websiteUrl.value}/with-state/address/list`,
    method: 'GET',
    header: { Authorization: token }
  })

  const resp = res?.data || {}
  if (resp.status !== 'success' || !Array.isArray(resp.data)) {
    uni.showToast({ title: resp.msg || '加载地址失败', icon: 'none' })
    return
  }

  const current = resp.data.find(item => Number(item.id) === Number(id))
  if (!current) {
    uni.showToast({ title: '地址不存在或已删除', icon: 'none' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1200)
    return
  }

  form.value = {
    id: Number(current.id),
    receiver_name: current.receiver_name || '',
    receiver_phone: current.receiver_phone || '',
    province_code: Number(current.province_code || 0),
    city_code: Number(current.city_code || 0),
    district_code: Number(current.district_code || 0),
    detail: current.detail || '',
    suggested_express: parseSuggestedExpressField(current.suggested_express),
    is_default: Number(current.is_default || 0)
  }

  provinceName.value = current.province_name || ''
  cityName.value = current.city_name || ''
  districtName.value = current.district_name || ''

  await loadCities(form.value.province_code)
  await loadDistricts(form.value.city_code)
}

function validateForm () {
  resetErrors()

  form.value.receiver_name = (form.value.receiver_name || '').trim()
  form.value.receiver_phone = (form.value.receiver_phone || '').trim()
  form.value.detail = (form.value.detail || '').trim()

  if (!form.value.receiver_name) {
    setFieldError('receiver_name', '请填写收货人姓名')
  }

  if (!/^\d{11}$/.test(form.value.receiver_phone)) {
    setFieldError('receiver_phone', '请输入11位手机号')
  }

  if (!form.value.province_code) {
    setFieldError('province_code', '请选择省份')
  }

  if (!form.value.city_code) {
    setFieldError('city_code', '请选择城市')
  }

  if (!form.value.district_code) {
    setFieldError('district_code', '请选择区县')
  }

  if (!form.value.detail) {
    setFieldError('detail', '请填写详细地址')
  } else if (form.value.detail.length < DETAIL_MIN_LENGTH) {
    setFieldError(
      'detail',
      `详细地址至少${DETAIL_MIN_LENGTH}个字，当前${form.value.detail.length}个字`
    )
  }

  const valid = Object.values(errorFields.value).every(msg => !msg)
  if (!valid) {
    uni.showToast({ title: submitErrorMessage.value || '请完善地址信息', icon: 'none' })
  }
  return valid
}

async function submitForm () {
  if (submitting.value || pageLoading.value) return
  addCustomSuggestedExpress()
  if (!validateForm()) return

  const token = getToken()
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }

  submitting.value = true
  try {
    const payload = {
      receiver_name: form.value.receiver_name,
      receiver_phone: form.value.receiver_phone,
      province_code: form.value.province_code,
      city_code: form.value.city_code,
      district_code: form.value.district_code,
      detail: form.value.detail,
      suggested_express: normalizeSuggestedExpressList(form.value.suggested_express),
      is_default: form.value.is_default
    }
    if (isEdit.value) payload.id = form.value.id

    const res = await uni.request({
      url: `${websiteUrl.value}${isEdit.value ? '/with-state/address/update' : '/with-state/address/add'}`,
      method: 'POST',
      header: { Authorization: token },
      data: payload
    })

    const resp = res?.data || {}
    if (resp.status === 'success') {
      uni.showToast({ title: isEdit.value ? '修改成功' : '新增成功', icon: 'success' })
      setTimeout(() => {
        uni.navigateBack()
      }, 1200)
      return
    }
    uni.showToast({ title: resp.msg || '保存失败', icon: 'none' })
  } catch (e) {
    uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
  } finally {
    submitting.value = false
  }
}

onLoad(async (options) => {
  resetErrors()
  const id = Number(options?.id || 0)
  isEdit.value = id > 0
  uni.setNavigationBarTitle({ title: isEdit.value ? '编辑收货地址' : '新增收货地址' })

  pageLoading.value = true
  try {
    await loadProvinces()
    if (isEdit.value) {
      await fillFormById(id)
    }
    await initProfilePhoneSuggestion()
  } catch (e) {
    uni.showToast({ title: '页面初始化失败', icon: 'none' })
  } finally {
    pageLoading.value = false
  }
})
</script>

<style lang="less" scoped>
.form-page {
  min-height: 100vh;
  background: #f5f7f8;
  padding: 24rpx;
  box-sizing: border-box;
}

.form-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 12rpx 24rpx;
  box-shadow: 0 8rpx 28rpx rgba(100, 131, 143, 0.08);
}

.field-block {
  width: 100%;
}

.form-item {
  min-height: 100rpx;
  border-bottom: 1px solid #edf1f3;
  display: flex;
  align-items: center;
}

.form-item-error {
  border-bottom-color: #f2b5b5;
  background: #fff7f7;
}

.form-label {
  width: 150rpx;
  font-size: 28rpx;
  color: #3f4b53;
}

.form-item-error .form-label,
.form-item-error .form-input,
.form-item-error .picker-value {
  color: #d95a5a;
}

.form-item-error .picker-value.placeholder {
  color: #dc9a9a;
}

.form-input {
  flex: 1;
  height: 84rpx;
  font-size: 28rpx;
  color: #273138;
}

.quick-fill-phone {
  display: inline-flex;
  margin-top: 10rpx;
  margin-left: 150rpx;
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  background: #f1f9fc;
  border: 1px solid #cbe9f1;
}

.quick-fill-text {
  font-size: 24rpx;
  color: #4b9cb1;
}

.picker-item {
  justify-content: space-between;
}

.picker-value-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.picker-value {
  margin-right: 10rpx;
  font-size: 28rpx;
  color: #273138;
}

.picker-value.placeholder {
  color: #aab4ba;
}

.field-error {
  display: block;
  padding: 8rpx 0 12rpx 150rpx;
  font-size: 24rpx;
  line-height: 1.4;
  color: #df6262;
}

.textarea-item {
  align-items: flex-start;
  padding: 20rpx 0;
}

.detail-textarea {
  flex: 1;
  height: 170rpx;
  font-size: 28rpx;
  line-height: 1.5;
  color: #273138;
}

.express-block {
  padding: 20rpx 0 8rpx;
}

.express-header {
  display: flex;
  align-items: center;
}

.express-title {
  font-size: 28rpx;
  color: #3f4b53;
  font-weight: 600;
}

.express-desc {
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #8b97a0;
  line-height: 1.55;
}

.express-chip-list {
  margin-top: 16rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.express-chip {
  min-width: 104rpx;
  height: 54rpx;
  padding: 0 20rpx;
  border-radius: 999rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f3f6f8;
  color: #5e6c75;
  font-size: 24rpx;
  border: 1px solid #e2e9ee;
}

.express-chip.active {
  background: #eef8fb;
  border-color: #a7d8e6;
  color: #3f93ab;
}

.express-custom-item {
  margin-top: 16rpx;
  border-bottom: 0;
  border-radius: 14rpx;
  background: #f8fafb;
  padding: 0 16rpx;
}

.express-add-btn {
  margin-left: 12rpx;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: #e6f3f8;
  color: #428ba0;
  font-size: 24rpx;
}

.express-selected-list {
  margin-top: 12rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.express-selected-chip {
  height: 52rpx;
  padding: 0 16rpx;
  border-radius: 999rpx;
  background: #f2f5f7;
  border: 1px solid #dde6eb;
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
}

.chip-name {
  font-size: 23rpx;
  color: #54636c;
}

.default-line {
  margin-top: 26rpx;
  padding: 24rpx;
  border-radius: 16rpx;
  background: #fff;
  box-shadow: 0 8rpx 28rpx rgba(100, 131, 143, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.default-text {
  font-size: 28rpx;
  color: #3f4b53;
}

.submit-error-tip {
  margin-top: 20rpx;
  padding: 18rpx 22rpx;
  border-radius: 14rpx;
  background: #fff1f1;
  color: #df6262;
  font-size: 26rpx;
  line-height: 1.4;
}

.submit-btn {
  margin-top: 36rpx;
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
