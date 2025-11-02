<template>
  <view class="order-plan-form">
    <!-- 顶部表单（分组列表外观） -->
    <view class="top-panel">
      <!-- 计划名称 -->
      <view class="form-item">
        <text class="label">计划名称</text>
        <input class="input" v-model="form.artist_name" placeholder="请输入计划名称" />
      </view>


      <!-- 接单方式 -->
      <view class="form-item">
        <text class="label">接单方式</text>
        <picker :range="orderTypes" range-key="text" :value="orderTypeIndex" @change="onOrderTypeChange">
          <view class="picker">{{ orderTypes[orderTypeIndex].text }}</view>
        </picker>
        <!-- 多行提示 -->
        <view class="tip">
          长期接单和非长期接单是互斥选项，如果存在长期接单计划，将无法创建其它计划。如果存在其它未结束的接单计划，也无法创建长期接单计划。
        </view>
        <view class="tip" v-if="form.order_type === 1">
          长期接单的选项将会常驻在日历中推送。
        </view>
        <view class="tip" v-else>
          如需「手速×5、抽选×5」，请创建两条计划；先创建一条，再在列表中“复制”并编辑。
        </view>
      </view>

      <!-- 接单场所：switch -->
      <view class="form-item">
        <text class="label">接单场所</text>
        <view class="inline-control">
          <switch :checked="form.service_scene === 2" @change="onServiceSceneSwitch" />
          <text class="inline-tip">{{ form.service_scene === 2 ? '本平台' : '其它平台' }}</text>
        </view>
      </view>

      <!-- 本平台：是否要求填写社交账号 -->
      <view class="form-item" v-if="form.service_scene === 2">
        <text class="label">是否要求填写社交账号</text>
        <view class="inline-control">
			<switch
			  :checked="!!form.require_platform_account"
			  @change="e => form.require_platform_account = !!e.detail.value"
			/>
			<text class="inline-tip">{{ form.require_platform_account ? '需要' : '不需要' }}</text>
        </view>
      </view>

		<!-- 手速专属：仅在 本平台 且 接单方式=手速 时显示 -->
		<view class="form-item" v-if="form.service_scene === 2 && form.order_type === 2">
		  <text class="label">手速有效作答窗口(秒)</text>
		  <uni-number-box v-model="form.queue_window_sec" :min="10" :max="600" />
		</view>

		<view class="form-item" v-if="form.service_scene === 2 && form.order_type === 2">
		  <text class="label">题目类型</text>
		  <picker :range="challengeTypes" range-key="text" :value="challengeTypeIndex" @change="onChallengeTypeChange">
			<view class="picker">{{ challengeTypes[challengeTypeIndex].text }}</view>
		  </picker>
		</view>

		<!-- 抽选专属：仅在 本平台 且 接单方式=抽选 时显示 -->
		<view class="form-item" v-if="form.service_scene === 2 && form.order_type === 3">
		  <text class="label">展示柜/私养做门槛</text>
		  <view class="inline-control">
			<switch :checked="form.check_showcase === 1" @change="e => form.check_showcase = e.detail.value ? 1 : 0" />
			<text class="inline-tip">{{ form.check_showcase ? '是' : '否' }}</text>
		  </view>
		</view>

      <!-- 长期接单隐藏人数与每人限投 -->
      <view class="form-item" v-if="form.order_type !== 1">
        <text class="label">最大参与人数</text>
        <uni-number-box v-model="form.max_participants" :min="0" :max="100000" />
        <view class="tip">0 表示不限量</view>
      </view>
      <view class="form-item" v-if="form.order_type !== 1">
        <text class="label">每人最大投递数</text>
        <uni-number-box v-model="form.max_submissions_per_user" :min="1" :max="10" />
      </view>

      <!-- 开始时间：日期 + 时间 并排 -->
      <view class="form-item">
        <text class="label">开始时间</text>
        <view class="datetime-row">
          <view class="picker-col" @click="showOpenDate = true">{{ form.open_date || '选择日期' }}</view>
          <view class="picker-col" @click="showOpenTime = true">{{ form.open_time || '选择时间' }}</view>
        </view>
        <common-date-picker v-model:show="showOpenDate" v-model="form.open_date" title="选择开始日期" />
        <common-time-picker v-model:show="showOpenTime" v-model="form.open_time" title="选择开始时间" />
      </view>

      <!-- 结束时间：日期 + 时间 并排 -->
      <view class="form-item">
        <text class="label">结束时间</text>
        <view class="datetime-row">
          <view class="picker-col" @click="showCloseDate = true">{{ form.close_date || '选择日期' }}</view>
          <view class="picker-col" @click="showCloseTime = true">{{ form.close_time || '选择时间' }}</view>
        </view>
        <common-date-picker v-model:show="showCloseDate" v-model="form.close_date" title="选择结束日期" />
        <common-time-picker v-model:show="showCloseTime" v-model="form.close_time" title="选择结束时间" />
      </view>

      <!-- 平台扩展（妆期/定妆/寄送/尺寸） -->
      <block v-if="form.service_scene === 2">
        <!-- 每颗头妆期 -->
        <view class="form-item">
          <text class="label">每颗头妆期（天）</text>
          <uni-number-box v-model="form.order_config.extra.per_head_cycle_days" :min="0" :max="365" />
        </view>

        <!-- 定妆方式 -->
        <view class="form-item">
          <text class="label">定妆方式</text>
          <picker :range="finishingMethods" range-key="text" :value="finishingMethodIndex" @change="onFinishingChange">
            <view class="picker">{{ finishingMethods[finishingMethodIndex].text }}</view>
          </picker>
          <view class="tip" v-if="form.order_config.extra.finishing_method === 'oil'">
            打底和定妆将会受到天气湿度的影响，因此原因产生的延期将不计入准时率统计
          </view>
        </view>
        <view class="form-item">
          <text class="label">定妆方式描述</text>
          <input class="input" v-model="form.order_config.extra.finishing_desc" placeholder="选填：定妆的补充说明" />
        </view>

        <!-- 寄送约定（长期接单固定分别寄送 + 禁用） -->
        <view class="form-item">
          <text class="label">寄送约定</text>
          <picker :range="shippingOptions"
                  range-key="text"
                  :value="shippingIndex"
                  :disabled="form.order_type === 1"
                  @change="onShippingChange">
            <view class="picker">
              {{ shippingOptions[shippingIndex].text + (form.order_type === 1 ? '（长期接单固定为分别寄送）' : '') }}
            </view>
          </picker>
          <view class="tip" v-if="form.order_config.extra.shipping.mode === 'unified'">
            统一寄送：要求本次投递的单主统一在一个日期之前寄送到（仅可选“接单截止后 ≥10 天”的日期）。
          </view>
          <view class="tip" v-if="form.order_config.extra.shipping.mode === 'unified'">
            若使用油性消光，建议统一寄送，便于统一打底；全部订单的时间计算以打底结束开始。
          </view>
          <view class="tip" v-else>
            分别寄送：每个单主需在订单开始前的 N 天发出快递（注意是发出，不是寄到），请预留物流时间；未按要求寄出的订单不计入超时计算。
          </view>
        </view>

        <!-- 统一寄送日期 -->
        <view class="form-item" v-if="form.order_config.extra.shipping.mode === 'unified'">
          <text class="label">统一寄送截止日</text>
          <view class="picker" @click="showUnifiedDate = true">
            {{ form.order_config.extra.shipping.unified_date || '选择日期（≥ 截止后10天）' }}
          </view>
          <common-date-picker
            v-model:show="showUnifiedDate"
            v-model="form.order_config.extra.shipping.unified_date"
            :minDate="unifiedMinDate"
            title="选择统一寄送日期"
          />
        </view>

        <!-- 分别寄送：开始前 N 天 -->
        <view class="form-item" v-if="form.order_config.extra.shipping.mode === 'separate'">
          <text class="label">开始前 N 天发出</text>
          <uni-number-box v-model="form.order_config.extra.shipping.separate_days_before_start" :min="0" :max="60" />
        </view>

        <!-- ✅ 接妆尺寸（恢复并保留旧逻辑） -->
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
          <view class="tip">请选择你本次接单的尺寸范围，以及每个尺寸基于基础妆费需要加的价格。</view>
        </view>

        <!-- 尺寸加价列表 -->
        <view class="size-price-list" v-if="form.order_config.extra.size_surcharges.length">
          <view class="size-price-item" v-for="(it, idx) in form.order_config.extra.size_surcharges" :key="it.size">
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
      </block>

      <!-- 图片（复原旧上传逻辑+进度） -->
      <view class="form-item">
        <text class="label">{{ form.artist_type === 2 ? '毛则图片' : '妆则图片' }}</text>
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
    <common-date-picker v-model:show="dummyShow" /> <!-- 防 HMR 首次装载空白，可忽略 -->
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { websiteUrl } from '@/common/config.js'
import { chooseImageList, getQiniuToken, uploadImageToQiniu } from '@/common/image.js'

/* ====== 数据源 ====== */
const artistTypes = [
  { value: 1, text: '妆师' },
  { value: 2, text: '毛娘' }
]
const orderTypes = [
  { value: 1, text: '长期接单' },
  { value: 2, text: '限时手速' },
  { value: 3, text: '限时抽选' },
  { value: 4, text: '限时黑箱卡' },
  { value: 9, text: '关闭投递' }
]
const challengeTypes = [{ value: 1, text: '四则运算' }]

const finishingMethods = [
  { value: 'oil',     text: '油性消光' },
  { value: 'varnish', text: '罩光剂' },
  { value: 'water',   text: '水性消光' }
]
const shippingOptions = [
  { value: 'unified',  text: '统一寄送' },
  { value: 'separate', text: '分别寄送' }
]
const allSizes = ['一分', '二分', '三分', '四分', '五分', '六分', '八分', '十二分']

/* ====== 表单 ====== */
const isEditMode = ref(false)
const currentId = ref(null)
const submitting = ref(false)

const form = ref({
  id: null,
  artist_name: '',
  artist_type: 1,
  order_type: 1,
  max_participants: 0,
  max_submissions_per_user: 1,
  open_date: '',
  open_time: '',
  close_date: '',
  close_time: '',
  service_scene: 1,                 // 1=其它平台, 2=本平台
  require_platform_account: false,      // 平台社交必填
  check_showcase: 0,                // 抽选门槛
  queue_window_sec: 60,             // 手速窗口
  challenge_type: 1,
  images: [],
  order_config: {
    tiers: [],
    addons: [],
    extra: {
      per_head_cycle_days: 0,
      finishing_method: 'water',
      finishing_desc: '',
      shipping: { mode: 'separate', unified_date: '', separate_days_before_start: 0 },
      size_surcharges: []          // [{ size:'一分', price: 0 }]
    }
  }
})

/* ====== 选择器索引 ====== */
const artistTypeIndex      = computed(() => Math.max(0, artistTypes.findIndex(x => x.value === form.value.artist_type)))
const orderTypeIndex       = computed(() => Math.max(0, orderTypes.findIndex(x => x.value === form.value.order_type)))
const challengeTypeIndex   = computed(() => Math.max(0, challengeTypes.findIndex(x => x.value === form.value.challenge_type)))
const finishingMethodIndex = computed(() => Math.max(0, finishingMethods.findIndex(x => x.value === form.value.order_config.extra.finishing_method)))
const shippingIndex        = computed(() => Math.max(0, shippingOptions.findIndex(x => x.value === form.value.order_config.extra.shipping.mode)))

/* ====== 时间弹层 ====== */
const showOpenDate  = ref(false)
const showOpenTime  = ref(false)
const showCloseDate = ref(false)
const showCloseTime = ref(false)
const showUnifiedDate = ref(false)
const dummyShow = ref(false)

const unifiedMinDate = computed(() => {
  const ct = toUnix(form.value.close_date, form.value.close_time)
  if (!ct) return ''
  const d = new Date((ct + 10 * 86400) * 1000)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
})

/* ====== 常用配置 ====== */
const tierOptions  = ref([{ label: '添加空白档位', value: 'blank' }])
const addonOptions = ref([{ label: '添加空白加购', value: 'blank' }])

/* ====== 上传状态（旧逻辑） ====== */
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
})
onMounted(() => { 
	fetchCommonConfigs(form.value.artist_type) 
	uni.setNavigationBarTitle({
		title: "发布BJD接妆计划"
	})
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
function onArtistTypeChange(e) {
  const idx = Number(e.detail.value || 0)
  form.value.artist_type = artistTypes[idx].value
  form.value.order_config.tiers = []
  form.value.order_config.addons = []
  fetchCommonConfigs(form.value.artist_type)
}
function onOrderTypeChange(e) {
  const idx = Number(e.detail.value || 0)
  form.value.order_type = orderTypes[idx].value
  if (form.value.order_type === 1) {
    // 长期接单固定分别寄送
    form.value.order_config.extra.shipping.mode = 'separate'
    form.value.order_config.extra.shipping.unified_date = ''
  }
}
function onChallengeTypeChange(e) {
  const idx = Number(e.detail.value || 0)
  form.value.challenge_type = challengeTypes[idx].value
}
function onServiceSceneSwitch(e) { form.value.service_scene = e.detail.value ? 2 : 1 }
function onFinishingChange(e) {
  const idx = Number(e.detail.value || 0)
  form.value.order_config.extra.finishing_method = finishingMethods[idx].value
}
function onShippingChange(e) {
  const idx = Number(e.detail.value || 0)
  form.value.order_config.extra.shipping.mode = shippingOptions[idx].value
  if (shippingOptions[idx].value === 'unified') {
    form.value.order_config.extra.shipping.separate_days_before_start = 0
  } else {
    form.value.order_config.extra.shipping.unified_date = ''
  }
}

/* ====== 默认配置拉取（妆师/毛娘不同参数） ====== */
async function fetchCommonConfigs(artistType) {
  try {
    const typeParam = artistType === 2 ? 1 : 0
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

/* ====== 尺寸（保持旧逻辑 + 重复提示） ====== */
function isSizeSelected(size) {
  return form.value.order_config.extra.size_surcharges.some(x => x.size === size)
}
function handleSizeTap(size) {
  const arr = form.value.order_config.extra.size_surcharges
  const exists = arr.find(x => x.size === size)
  if (exists) {
    // 旧逻辑你如果是“点一次选中、再点取消”，把下面两行改成“arr.splice(idx,1)”
    uni.showToast({ title: '已选择该尺寸', icon: 'none' })
    return
  }
  arr.push({ size, price: 0 })
}
function onSizePriceBlur(idx, val) {
  form.value.order_config.extra.size_surcharges[idx].price = toFixed2(val)
}
function removeSize(idx) {
  form.value.order_config.extra.size_surcharges.splice(idx, 1)
}

/* ====== 上传（复原旧逻辑） ====== */
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
    form.value.artist_type = p.artist_type || 1
    form.value.order_type = p.order_type || 1
    form.value.max_participants = p.max_participants ?? 0
    form.value.max_submissions_per_user = p.max_submissions_per_user ?? 1
    form.value.service_scene = p.service_scene || 1
    form.value.require_platform_account = p.require_platform_account === true || p.require_platform_account === 1 || p.require_platform_account === '1'
    form.value.check_showcase = p.check_showcase || 0
    form.value.queue_window_sec = p.queue_window_sec || 60
    form.value.challenge_type = p.challenge_type || 1
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
    let cfg = {}
    try { cfg = p.order_config ? JSON.parse(p.order_config) : {} } catch (e) { cfg = {} }
    form.value.order_config.tiers = Array.isArray(cfg.tiers) ? cfg.tiers.map(t => ({
      title: t.title || '', price: toFixed2(t.price || 0), description: t.description || ''
    })) : [{ title: '', price: 0, description: '' }]
    form.value.order_config.addons = Array.isArray(cfg.addons) ? cfg.addons.map(a => ({
      title: a.title || '', price: toFixed2(a.price || 0), description: a.description || ''
    })) : [{ title: '', price: 0, description: '' }]
    form.value.order_config.extra = Object.assign({
      per_head_cycle_days: 0,
      finishing_method: 'water',
      finishing_desc: '',
      shipping: { mode: 'separate', unified_date: '', separate_days_before_start: 0 },
      size_surcharges: []
    }, cfg.extra || {})
    if (form.value.order_type === 1) {
      form.value.order_config.extra.shipping.mode = 'separate'
      form.value.order_config.extra.shipping.unified_date = ''
    }
    fetchCommonConfigs(form.value.artist_type)
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

  const payload = {
    id: form.value.id,
    artist_name: form.value.artist_name,
    artist_type: form.value.artist_type,
    order_type: form.value.order_type,
    max_participants: form.value.order_type === 1 ? 0 : form.value.max_participants,
    max_submissions_per_user: form.value.order_type === 1 ? 1 : form.value.max_submissions_per_user,
    open_time: openUnix,
    close_time: closeUnix,
    service_scene: form.value.service_scene,
    require_platform_account: !!form.value.require_platform_account,
    check_showcase: !!form.value.check_showcase,
    queue_window_sec: form.value.queue_window_sec,
    challenge_type: form.value.challenge_type,
    images: form.value.images,
    order_config: {
      tiers: (form.value.order_config.tiers || []).map(t => ({
        title: t.title || '', price: toFixed2(t.price || 0), description: t.description || ''
      })),
      addons: (form.value.order_config.addons || []).map(a => ({
        title: a.title || '', price: toFixed2(a.price || 0), description: a.description || ''
      })),
      extra: {
        per_head_cycle_days: Number(form.value.order_config.extra.per_head_cycle_days || 0),
        finishing_method: form.value.order_config.extra.finishing_method,
        finishing_desc: form.value.order_config.extra.finishing_desc || '',
        shipping: {
          mode: form.value.order_config.extra.shipping.mode,
          unified_date: form.value.order_config.extra.shipping.mode === 'unified'
            ? (form.value.order_config.extra.shipping.unified_date || '')
            : '',
          separate_days_before_start: form.value.order_config.extra.shipping.mode === 'separate'
            ? Number(form.value.order_config.extra.shipping.separate_days_before_start || 0)
            : 0
        },
        size_surcharges: (form.value.order_config.extra.size_surcharges || []).map(it => ({
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

/* 图片上传（旧逻辑样式） */
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

/* 尺寸 */
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
