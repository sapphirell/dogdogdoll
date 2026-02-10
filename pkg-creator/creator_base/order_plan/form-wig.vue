<template>
  <view-logs />
  <view class="order-plan-form">
    <view class="top-panel">
      <view class="form-item">
        <text class="label">计划名称</text>
        <input class="input" v-model="form.artist_name" placeholder="请输入计划名称" />
      </view>

      <view class="form-item">
        <text class="label">接单场所</text>
        <view class="inline-control inline-control--between">
          <view class="inline-left">
            <switch :checked="form.service_scene === 2" @change="onServiceSceneSwitch" />
            <text class="inline-tip">{{ form.service_scene === 2 ? '本平台' : '其它平台' }}</text>
          </view>

          <text class="inline-warn font-alimamashuhei" v-if="showPlatformRealnameHint">
            需要先完成实名认证或受到邀请
          </text>
        </view>
        <view class="tip" v-if="isEditMode && !canEditServiceScene">
          已开始的本平台计划不能切换为其它平台。
        </view>
      </view>
	  
	  <view class="form-item" v-if="form.service_scene === 2">
	    <text class="label">收款方式</text>
	    
	    <view 
	        class="picker" 
	        v-if="isVerifiedArtist && hasPaymentCodeConfigured" 
	        @click="showPaymentPopup = true"
	    >
	      {{ selectedPaymentNames || '请选择收款方式（多选）' }}
	    </view>
	  
	    <view 
	        class="picker warning-picker" 
	        v-else-if="isVerifiedArtist && !hasPaymentCodeConfigured" 
	        @click="goToPaymentSettings"
	    >
	      <uni-icons type="info-filled" size="18" color="#ff4d4f" style="margin-right: 8rpx;"></uni-icons>
	      请先设置收款码，点击跳转设置
	    </view>
	  
	    <view class="picker disabled-picker" v-else>
	       请先进行实名认证
	    </view>
	  
	  </view>

      <view class="form-item">
        <text class="label">接单方式</text>
        <picker
          :range="orderTypes"
          range-key="text"
          :value="orderTypeIndex"
          @change="onOrderTypeChange"
          :disabled="!canEditOrderType"
        >
          <view class="picker">{{ currentOrderTypeText }}</view>
        </picker>
        <view class="tip">
          长期接单和非长期接单是互斥选项，如果存在长期接单计划，将无法创建其它计划。如果存在其它未结束的接单计划，也无法创建长期接单计划。
        </view>
        <view class="tip" v-if="form.order_type === 1">
          长期接单的选项将会常驻在日历中推送。
        </view>
        <view class="tip" v-else-if="isSpeedOrder">
          {{ speedOrderDesc }}
        </view>
        <view class="tip" v-else>
          如需「手速×5、抽选×5」，请创建两条计划；先创建一条，再在列表中“复制”并编辑。
        </view>
        <view class="tip" v-if="isEditMode && !canEditOrderType">
          接单已开始，不能修改接单方式。
        </view>
      </view>

      <view class="form-item" v-if="form.service_scene === 2">
        <text class="label">是否要求填写社交账号</text>
        <view class="inline-control">
          <switch
            :checked="!!form.require_platform_account"
            @change="e => (form.require_platform_account = !!e.detail.value)"
          />
          <text class="inline-tip">{{ form.require_platform_account ? '需要' : '不需要' }}</text>
        </view>
      </view>

      <view class="form-item" v-if="form.service_scene === 2 && isSpeedOrder">
        <text class="label">手速有效作答窗口(秒)</text>
        <uni-number-box v-model="form.queue_window_sec" :min="10" :max="600" />
      </view>

      <view class="form-item" v-if="form.service_scene === 2 && isSpeedOrder">
        <text class="label">题目类型</text>
        <picker
          :range="challengeTypes"
          range-key="text"
          :value="challengeTypeIndex"
          @change="onChallengeTypeChange"
        >
          <view class="picker">{{ challengeTypes[challengeTypeIndex].text }}</view>
        </picker>
      </view>

      <view class="form-item" v-if="form.service_scene === 2 && form.order_type === 3">
        <text class="label">展示柜/私养做门槛</text>
        <view class="inline-control">
          <switch
            :checked="form.check_showcase === 1"
            @change="e => (form.check_showcase = e.detail.value ? 1 : 0)"
          />
          <text class="inline-tip">{{ form.check_showcase ? '是' : '否' }}</text>
        </view>
      </view>

      <view class="form-item" v-if="form.order_type !== 1 && !isEditMode">
        <text class="label">最大参与人数</text>
        <uni-number-box v-model="form.max_participants" :min="0" :max="100000" />
        <view class="tip">0 表示不限量。</view>
      </view>
      <view class="form-item" v-else-if="form.order_type !== 1 && isEditMode">
        <text class="label">最大参与人数</text>
        <text class="static-value">{{ form.max_participants }}</text>
        <view class="tip">编辑时不能修改最大排单人数。</view>
      </view>

      <view class="form-item" v-if="form.order_type !== 1">
        <text class="label">每人最大投递数</text>
        <uni-number-box v-model="form.max_submissions_per_user" :min="1" :max="10" />
      </view>

      <view class="form-item" v-if="form.service_scene === 2 && !isEditMode && form.order_type !== 1">
        <text class="label">可钞吗？</text>
        <view class="inline-control">
          <switch :checked="premiumQueueEnabled" @change="onPremiumQueueSwitch" />
          <text class="inline-tip">
            {{
              premiumQueueEnabled
                ? `接受加价排队的用户在普通库存满之后仍可排队`
                : '不接受加价排队'
            }}
          </text>
        </view>

        <view class="mt-8" v-if="premiumQueueEnabled">
          <text class="label-small">加价排队最大人数</text>
          <uni-number-box v-model="form.premium_queue_limit" :min="1" :max="100000" />
        </view>

        <view class="mt-8" v-if="premiumQueueEnabled">
          <text class="label-small">钞倍率</text>
          <input
            class="input"
            type="digit"
            :value="displayPremiumMultiplier(form.premium_queue_multiplier)"
            @blur="e => onPremiumMultiplierBlur(e.detail.value)"
            placeholder="例如 2.5 表示价格 x2.5"
          />
        </view>

        <view class="tip">
          当普通库存用完后，仍允许最多 N 名接受钞的用户继续排队。
        </view>
      </view>

      <view class="form-item" v-if="isEditMode && form.service_scene === 2">
        <text class="label">库存管理</text>
        <view class="inventory-row">
          <view class="inventory-col">
            <text class="inv-label">当前普通库存</text>
            <text class="inv-value">{{ originalInventory }}</text>
          </view>
          <view class="inventory-col" v-if="!isLongTermOrder">
            <text class="inv-label">当前加价库存</text>
            <text class="inv-value">{{ originalPremiumInventory }}</text>
          </view>
        </view>
        <view class="tip">
          编辑时只允许增加库存，不能减少；提交时填写的数值视为「需要增加的名额」偏移量。
        </view>
        <view class="mt-12">
          <text class="label-small">增加普通库存</text>
          <uni-number-box v-model="form.inventory" :min="0" :max="100000" />
        </view>
        <view class="mt-12" v-if="!isLongTermOrder">
          <text class="label-small">增加加价库存</text>
          <uni-number-box v-model="form.premium_inventory" :min="0" :max="100000" />
        </view>
      </view>

      <view class="form-item">
        <text class="label">开始时间</text>
        <view class="datetime-row">
          <view class="picker-col" @click="showOpenDate = true">
            {{ form.open_date || '选择日期' }}
          </view>
          <view class="picker-col" @click="showOpenTime = true">
            {{ form.open_time || '选择时间' }}
          </view>
        </view>
        <common-date-picker v-model:show="showOpenDate" v-model="form.open_date" title="选择开始日期" />
        <common-time-picker v-model:show="showOpenTime" v-model="form.open_time" title="选择开始时间" />
        <view class="tip" v-if="isEditMode && hasStarted && form.service_scene === 2">
          已开始的本平台计划不能将开始时间改得更晚，只能维持或提前。
        </view>
      </view>

      <view class="form-item">
        <text class="label">结束时间</text>
        <view class="datetime-row">
          <view class="picker-col" @click="showCloseDate = true">
            {{ form.close_date || '选择日期' }}
          </view>
          <view class="picker-col" @click="showCloseTime = true">
            {{ form.close_time || '选择时间' }}
          </view>
        </view>
        <common-date-picker v-model:show="showCloseDate" v-model="form.close_date" title="选择结束日期" />
        <common-time-picker v-model:show="showCloseTime" v-model="form.close_time" title="选择结束时间" />
        <view class="tip" v-if="isEditMode && hasStarted && form.service_scene === 2">
          已开始的本平台计划不能将结束时间提前，只能维持或延后。
        </view>
      </view>
	  


      <block v-if="form.service_scene === 2">
        <view class="form-item" v-if="form.order_type !== 5">
          <text class="label">每顶手改毛工期（天）</text>
          <uni-number-box
            v-model="form.order_config.extra.per_head_cycle_days"
            :min="0"
            :max="365"
          />
        </view>

        <view class="form-item" v-if="form.order_type === 5">
          <text class="label">总工期（天）</text>
          <uni-number-box
            v-model="form.order_config.extra.total_cycle_days"
            :min="0"
            :max="365"
          />
          <view class="tip">
            本次自由排单将在这一段总工期内完成所有抢到的手改毛订单，例如 30 天内完成若干顶。
          </view>
        </view>

        <view class="form-item">
          <text class="label">可支持的毛坯选择方式</text>
          <view class="size-row">
            <view
              class="size-tag"
              :class="{ active: form.order_config.extra.support_self_blank }"
              @click="toggleBlankOption('self')"
            >
              自带毛坯
            </view>
            <view
              class="size-tag"
              :class="{ active: form.order_config.extra.support_third_party_blank }"
              @click="toggleBlankOption('third')"
            >
              指定购买第三方毛坯
            </view>
            <view
              class="size-tag"
              :class="{ active: form.order_config.extra.support_stock_blank }"
              @click="toggleBlankOption('stock')"
            >
              选购现有毛坯
            </view>
          </view>
          <view class="tip">
            这里勾选的是你愿意提供的毛坯方式，买家在下单时只能在你开放的方式中进行选择。
          </view>
        </view>

        <view class="form-item">
          <text class="label">接毛尺寸</text>
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
          <view class="tip">
            请选择你本次接单的尺寸范围，以及每个尺寸基于基础手改毛价格需要加的价格。
          </view>
        </view>

        <view class="size-price-list" v-if="form.order_config.extra.size_surcharges.length">
          <view
            class="size-price-item"
            v-for="(it, idx) in form.order_config.extra.size_surcharges"
            :key="it.size"
          >
            <text class="sp-label">{{ it.size }} 加价 +</text>
            <input
              class="sp-input"
              type="digit"
              :value="displayPrice(it.price)"
              @blur="e => onSizePriceBlur(idx, e.detail.value)"
              placeholder="0.00"
            />
            <uni-icons type="trash" size="20" class="sp-del" @click="removeSize(idx)" />
          </view>
        </view>
      </block>

      <view class="form-item">
        <text class="label">毛则图片</text>
        <view class="images">
          <view v-if="uploading" class="uploading-container">
            <uni-load-more status="loading"></uni-load-more>
            <text class="uploading-text">
              {{ uploadStatusText || `上传中 (${uploadedCount}/${totalToUpload})` }}
            </text>
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

    <view class="form-item">
      <view class="label-row">
        <text class="label">档位配置</text>
        <picker :range="tierOptions" range-key="label" @change="onTierPickerChange">
          <button class="btn-mini">+ 添加档位</button>
        </picker>
      </view>
      <view class="card" v-for="(tier, i) in form.order_config.tiers" :key="i">
        <view class="row">
          <input class="input" v-model="tier.title" placeholder="档位名称" />
        </view>
        <view class="row">
          <input
            class="input"
            type="digit"
            :value="displayPrice(tier.price)"
            @blur="e => (tier.price = toFixed2(e.detail.value))"
            placeholder="价格(0.00)"
          />
        </view>
        <view class="row">
          <input class="input" v-model="tier.description" placeholder="描述" />
        </view>
        <view class="row row-right">
          <button
            class="btn-danger"
            :class="{ 'btn-disabled': !canDeleteConfigItem }"
            :disabled="!canDeleteConfigItem"
            @click="handleRemoveTier(i)"
          >
            删除
          </button>
        </view>
      </view>
    </view>

    <view class="form-item">
      <view class="label-row">
        <text class="label">加购配置</text>
        <picker :range="addonOptions" range-key="label" @change="onAddonPickerChange">
          <button class="btn-mini">+ 添加加购</button>
        </picker>
      </view>
      <view class="card" v-for="(addon, i) in form.order_config.addons" :key="i">
        <view class="row">
          <input class="input" v-model="addon.title" placeholder="加购名称" />
        </view>
        <view class="row">
          <input
            class="input"
            type="digit"
            :value="displayPrice(addon.price)"
            @blur="e => (addon.price = toFixed2(e.detail.value))"
            placeholder="价格(0.00)"
          />
        </view>
        <view class="row">
          <input class="input" v-model="addon.description" placeholder="描述" />
        </view>
        <view class="row row-right">
          <button
            class="btn-danger"
            :class="{ 'btn-disabled': !canDeleteConfigItem }"
            :disabled="!canDeleteConfigItem"
            @click="handleRemoveAddon(i)"
          >
            删除
          </button>
        </view>
      </view>
    </view>

    <view 
      class="form-item" 
      v-if="form.service_scene === 2"
      :class="{ 'disabled-section': !hasAlipay }"
    >
      <view class="label-row">
        <text class="label">节点配置</text>
        <picker :range="stepOptions" range-key="label" @change="onStepPickerChange" :disabled="!canEditStepConfig">
          <button class="btn-mini">+ 添加节点</button>
        </picker>
      </view>

      <view v-if="!hasAlipay" class="tip" style="color: #ff4d4f; margin-bottom: 12rpx;">
          需要勾选「支付宝收款」方式才可以使用节点功能（平台代收才能自动分配节点违约金）。
      </view>

      <view v-if="!form.step_config_json.length" class="tip">
        可以通过「+ 添加节点」为订单添加节点；添加节点后，你可以在节点完成时与买家沟通，如果买家在通过该节点之后取消订单，您可以获得设定的节点违约金。
      </view>

      <view class="card" v-for="(step, idx) in form.step_config_json" :key="idx">
        <view class="row">
          <input
            class="input"
            v-model="form.step_config_json[idx].name"
            :disabled="!canEditStepConfig"
            placeholder="节点名称，例如：毛坯到达 / 造型中 / 已回寄"
          />
        </view>

        <view class="row">
          <text class="label-small">违约金比例(%)</text>
          <input
            class="input"
            type="digit"
            :value="displayStepPercent(step.breach_compensation_rate)"
            :disabled="!canEditStepConfig"
            @blur="e => onStepPercentBlur(idx, e.detail.value)"
            placeholder="例如 5 表示 5%"
          />
        </view>

        <view class="row row-right">
          <button
            class="btn-danger"
            :class="{ 'btn-disabled': !canDeleteConfigItem }"
            :disabled="!canDeleteConfigItem"
            @click="handleRemoveStep(idx)"
          >
            删除
          </button>
        </view>
      </view>

      <view class="tip" v-if="!canEditStepConfig">
        已开始的本平台计划节点配置已锁定，不能再修改。
      </view>
    </view>

    <view class="submit-box">
      <button class="btn-submit" :disabled="submitting" @click="submitPlan">
        {{ submitting ? '提交中...' : isEditMode ? '保存修改' : '提交新计划' }}
      </button>
    </view>

    <common-date-picker v-model:show="dummyShow" />

    <uni-popup ref="paymentPopupRef" type="bottom" @change="e => (showPaymentPopup = e.show)">
      <view class="payment-popup">
        <view class="popup-header">
          <text class="popup-title">选择收款方式</text>
          <text class="popup-close" @click="$refs.paymentPopupRef.close()">关闭</text>
        </view>
        <view class="popup-desc-box">
            您可以多选收款方式，用户在投递的时候可以在预设的收款方式中选择其一支付。
        </view>
        <scroll-view scroll-y class="popup-content">
          <view v-for="item in paymentList" :key="item.id" 
                class="payment-item" 
                :class="{ 'disabled-item': !isVerifiedArtist }"
                @click="togglePayment(item.id)">
            <view class="payment-header">
              <view class="payment-left">
                 <uni-icons 
                    :type="form.order_config.payment_methods.includes(item.id) ? 'checkbox-filled' : 'circle'" 
                    size="24" 
                    :color="form.order_config.payment_methods.includes(item.id) ? '#007aff' : '#ccc'" 
                  />
                 <text class="payment-name">{{ item.name }}</text>
              </view>
            </view>
            <view class="payment-desc">
               {{ item.description_2_artist }}
            </view>
          </view>
          
          <view v-if="!isVerifiedArtist" class="lock-tip">
             <uni-icons type="locked" size="16" color="#ff4d4f"></uni-icons>
             <text>只有实名认证艺术家才可选择收款方式</text>
          </view>
        </scroll-view>
      </view>
    </uni-popup>

  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { websiteUrl, asyncGetUserInfo } from '@/common/config.js'
import { chooseImageList, getQiniuToken, uploadImageToQiniu } from '@/common/image.js'

/* ====== 数据源 ====== */

// 默认接单方式（接口失败时兜底）
const defaultOrderTypes = [
  { value: 1, text: '长期接单', keyword: 'StatusLongTerm' },
  { value: 2, text: '限时手速投递-手速排单', keyword: 'StatusSpeedDelivery' },
  { value: 5, text: '限时手速投递-自由排单', keyword: 'StatusSpeedDeliveryFree' },
  { value: 3, text: '限时抽选投递', keyword: 'StatusLotteryDelivery' },
  { value: 4, text: '限时黑箱卡投递', keyword: 'StatusBlackCard' },
  { value: 9, text: '关闭投递', keyword: 'StatusClosed' }
]

// 动态接单方式选项（从接口获取）
const orderTypes = ref([...defaultOrderTypes])

const challengeTypes = [{ value: 1, text: '四则运算' }]

const finishingMethods = [
  { value: 'oil', text: '油性消光' },
  { value: 'varnish', text: '罩光剂' },
  { value: 'water', text: '水性消光' }
]

const shippingOptions = [
  { value: 'unified', text: '统一寄送' },
  { value: 'separate', text: '分别寄送' }
]

const allSizes = ['一分', '二分', '三分', '四分', '五分', '六分', '八分', '十二分']

/* ====== brand-artist/info：role 判定（同步妆师表单） ====== */
const userInfo = ref({})
const brandId = ref(0)
const identityLoaded = ref(false)

// role: null=未拉取；number=接口返回
const brandArtistRole = ref(null)
const brandArtistInfo = ref(null)

const showPlatformRealnameHint = computed(() => {
  const r = brandArtistRole.value
  return form.value.service_scene === 2 && typeof r === 'number' && r < 2
})

// ✅ 计算属性：是否为实名认证艺术家
const isVerifiedArtist = computed(() => {
    return brandArtistRole.value === 2
})

// ✅ 计算属性：是否配置了收款码
const hasPaymentCodeConfigured = computed(() => {
    const info = brandArtistInfo.value
    if (!info) return false
    return !!(info.wechat_payment_code || info.alipay_payment_code)
})

function extractBrandIdFromQuery(q) {
  const v = q?.brand_id ?? q?.brandId ?? q?.brandID ?? q?.bid
  if (v === undefined || v === null || v === '') return 0
  const n = Number(v)
  return Number.isNaN(n) ? 0 : n
}

async function ensureIdentityLoaded() {
  if (identityLoaded.value) return

  try {
    const u = await asyncGetUserInfo()
    userInfo.value = u || {}

    // 兜底：仅当 URL 没带 brand_id 时，才用用户信息中的 brand_id
    if (!brandId.value) {
      brandId.value = Number(userInfo.value.brand_id || 0)
    }

    // 没有 brand_id：通常代表未入驻作者
    if (!brandId.value) return
  } catch (e) {
    console.error('加载用户/身份失败:', e)
  } finally {
    identityLoaded.value = true
  }
}

function parseQueryFromPath(path) {
  if (!path) return {}
  const idx = path.indexOf('?')
  if (idx < 0) return {}
  const qs = path.slice(idx + 1)
  const obj = {}
  qs.split('&').forEach(pair => {
    if (!pair) return
    const pidx = pair.indexOf('=')
    const k = pidx >= 0 ? pair.slice(0, pidx) : pair
    const v = pidx >= 0 ? pair.slice(pidx + 1) : ''
    if (!k) return
    obj[decodeURIComponent(k)] = decodeURIComponent(v || '')
  })
  return obj
}

// 避免依赖 getCurrentPages().options：优先 fullPath / H5 hash 解析 query
function getCurrentQuerySafe() {
  try {
    const pages = getCurrentPages()
    const cur = pages && pages.length ? pages[pages.length - 1] : null
    const fullPath = cur?.$page?.fullPath
    if (fullPath) return parseQueryFromPath(fullPath)
  } catch (e) {}

  // H5 fallback
  try {
    if (typeof window !== 'undefined' && window.location && window.location.hash) {
      const hash = window.location.hash.replace(/^#/, '')
      return parseQueryFromPath(hash)
    }
  } catch (e) {}

  return {}
}

// ✅ 核心修改：请求地址改为 brand-manager/get-artist-info
async function fetchBrandArtistInfo(bid) {
  const id = Number(bid || 0)
  if (!id) return

  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/brand-manager/get-artist-info`,
      method: 'GET',
      data: { brand_id: id },
      header: {
        Authorization: getAuthorization()
      }
    })
    if (String(res.data?.status).toLowerCase() === 'success') {
      const data = res.data?.data || null
      brandArtistInfo.value = data
      const roleRaw = data?.role
      const roleNum = typeof roleRaw === 'number' ? roleRaw : Number(roleRaw)
      brandArtistRole.value = Number.isNaN(roleNum) ? 0 : roleNum
    } else {
      console.error('获取 brand-artist/info 失败：', res.data)
      brandArtistInfo.value = null
      brandArtistRole.value = null
    }
  } catch (err) {
    console.error('获取 brand-artist/info 异常：', err)
    brandArtistInfo.value = null
    brandArtistRole.value = null
  }
}

// ✅ 跳转收款码设置页面
function goToPaymentSettings() {
    uni.navigateTo({
        url: '/pkg-common/deal-setting/payment-code/payment-code'
    })
}

/* ====== 表单 ====== */
const isEditMode = ref(false)
const currentId = ref(null)
const submitting = ref(false)

const form = ref({
  id: null,
  artist_name: '',
  artist_type: 2, // 毛娘固定为 2
  order_type: 1,
  max_participants: 0,
  max_submissions_per_user: 1,
  open_date: '',
  open_time: '',
  close_date: '',
  close_time: '',
  service_scene: 1, // 1=其它平台, 2=本平台
  require_platform_account: false,
  check_showcase: 0,
  queue_window_sec: 60,
  challenge_type: 1,

  // 新字段：库存 / 加价队列
  inventory: 0, // 编辑时作为“增加库存”的偏移量使用
  premium_queue_limit: 0, // 最大加价排队人数（创建时填写）
  premium_inventory: 0, // 编辑时作为“增加加价库存”的偏移量使用
  premium_queue_multiplier: 2, // 默认 2 倍，钞排队倍率

  // 节点配置：节点对象数组 [{ name, breach_compensation_rate }]
  step_config_json: [],

  images: [],
  order_config: {
    tiers: [],
    addons: [],
    // ✅ 收款方式ID列表
    payment_methods: [],
    extra: {
      per_head_cycle_days: 0,
      // 自由排单使用的总工期（天）
      total_cycle_days: 0,
      finishing_method: 'water',
      finishing_desc: '',
      shipping: {
        mode: 'separate',
        unified_date: '',
        separate_days_before_start: 0
      },
      size_surcharges: [],
      // 毛坯提供方式默认：支持自带 + 指定第三方
      support_self_blank: true,
      support_third_party_blank: true,
      support_stock_blank: false
    }
  }
})

/** 保存原始计划关键字段 */
const originalPlan = ref({
  open_time: 0,
  close_time: 0,
  service_scene: 1,
  max_participants: 0,
  inventory: 0,
  premium_inventory: 0 // 这里用于展示“当前加价库存”
})

/* ====== 收款方式逻辑 ====== */
const paymentList = ref([])
const showPaymentPopup = ref(false)
const paymentPopupRef = ref(null)

// 监控 showPaymentPopup 变化来控制 uni-popup
watch(showPaymentPopup, (val) => {
    if (val) {
        paymentPopupRef.value.open()
    } else {
        paymentPopupRef.value.close()
    }
})

// ✅ 计算属性：是否选择了支付宝 (ID=2)
const hasAlipay = computed(() => {
    return form.value.order_config.payment_methods.includes(2)
})

async function fetchPaymentList() {
    try {
        const res = await uni.request({
            url: `${websiteUrl.value}/payment-list`, 
            method: 'GET'
        })
        if (String(res.data?.status).toLowerCase() === 'success') {
            paymentList.value = res.data.data || []
        }
    } catch (e) {
        console.error('Fetch payment list failed', e)
    }
}

function togglePayment(id) {
    if (!isVerifiedArtist.value) return 

    const idx = form.value.order_config.payment_methods.indexOf(id)
    if (idx > -1) {
        form.value.order_config.payment_methods.splice(idx, 1)
    } else {
        form.value.order_config.payment_methods.push(id)
    }
}

const selectedPaymentNames = computed(() => {
    if (!form.value.order_config.payment_methods.length) return ''
    const names = form.value.order_config.payment_methods.map(id => {
        const item = paymentList.value.find(p => p.id === id)
        return item ? item.name : ''
    }).filter(Boolean)
    return names.join('、')
})

/* ====== 选择器索引 / 计算属性 ====== */

const orderTypeIndex = computed(() => {
  const list = orderTypes.value || []
  const idx = list.findIndex(x => x.value === form.value.order_type)
  return idx >= 0 ? idx : 0
})

// 当前接单方式文字（避免 orderTypes 为空时报错）
const currentOrderTypeText = computed(() => {
  const list = orderTypes.value || []
  if (!list.length) return '请选择接单方式'
  const idx = list.findIndex(x => x.value === form.value.order_type)
  return idx >= 0 ? list[idx].text : list[0].text
})

// 是否为任一“手速模式”（手速排单 + 自由排单）
const isSpeedOrder = computed(
  () => form.value.order_type === 2 || form.value.order_type === 5
)

// 手速模式文案（根据 keyword 区分两种）
const speedOrderDesc = computed(() => {
  if (!isSpeedOrder.value) return ''
  const list = orderTypes.value || []
  const opt = list.find(x => x.value === form.value.order_type)
  const keyword = opt?.keyword
  if (keyword === 'StatusSpeedDeliveryFree') {
    return '在一次开单中，所有抢购成功的客户都将共享一段工期，例如在30天内完成若干顶手改毛。客户虽然无法要求自己的排期顺序，但是会看到其它客户的进度。'
  }
  // 默认：手速排单
  return '您的客户将以抢购顺序进行排列，每个人都享有一段独立的工期（对应每顶手改毛工期），您必须依照抢购顺序完成订单，客户也将看到在您的排期日历中的顺序。（不推荐毛娘选择）'
})

const challengeTypeIndex = computed(() =>
  Math.max(0, challengeTypes.findIndex(x => x.value === form.value.challenge_type))
)

const finishingMethodIndex = computed(() =>
  Math.max(
    0,
    finishingMethods.findIndex(x => x.value === form.value.order_config.extra.finishing_method)
  )
)

const shippingIndex = computed(() =>
  Math.max(
    0,
    shippingOptions.findIndex(x => x.value === form.value.order_config.extra.shipping.mode)
  )
)

/* ====== 时间弹层 ====== */
const showOpenDate = ref(false)
const showOpenTime = ref(false)
const showCloseDate = ref(false)
const showCloseTime = ref(false)
const showUnifiedDate = ref(false)
const dummyShow = ref(false)

const nowUnix = () => Math.floor(Date.now() / 1000)

const unifiedMinDate = computed(() => {
  const ct = toUnix(form.value.close_date, form.value.close_time)
  if (!ct) return ''
  const d = new Date((ct + 10 * 86400) * 1000)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
})

/* ====== 是否为长期接单 ====== */
const isLongTermOrder = computed(() => form.value.order_type === 1)

/* ====== 是否已进入开始时间 ====== */
const hasStarted = computed(() => {
  if (!isEditMode.value || !originalPlan.value.open_time) return false
  return nowUnix() >= originalPlan.value.open_time
})

/** 子配置（档位 / 加购 / 节点）是否允许删除 */
const canDeleteConfigItem = computed(() => !hasStarted.value || isLongTermOrder.value)

/** 接单方式是否可编辑：只要已开始，就不允许修改接单方式 */
const canEditOrderType = computed(() => !hasStarted.value)

/* ====== service_scene / 节点配置可编辑性 ====== */
const canEditServiceScene = computed(() => {
  if (!isEditMode.value) return true
  if (originalPlan.value.service_scene !== 2) return true
  if (!originalPlan.value.open_time) return true
  return nowUnix() < originalPlan.value.open_time
})

const canEditStepConfig = computed(() => {
  if (!isEditMode.value) return true
  if (!originalPlan.value.open_time) return true
  if (isLongTermOrder.value) return true
  return nowUnix() < originalPlan.value.open_time
})

const originalInventory = computed(() => originalPlan.value.inventory || 0)
const originalPremiumInventory = computed(() => originalPlan.value.premium_inventory || 0)

/* ====== 常用配置 ====== */
const tierOptions = ref([
  {
    label: '添加空白档位',
    value: 'blank'
  }
])
const addonOptions = ref([
  {
    label: '添加空白加购',
    value: 'blank'
  }
])

/* 节点模板列表：第一项是“添加空白节点” */
const stepOptions = ref([
  {
    label: '添加空白节点',
    value: 'blank'
  }
])

/* ====== 上传状态 ====== */
const uploading = ref(false)
const uploadedCount = ref(0)
const totalToUpload = ref(0)
const uploadStatusText = ref('')

/* ====== premium queue 开关 ====== */
const premiumQueueEnabled = computed({
  get() {
    return !!form.value.premium_queue_limit
  },
  set(v) {
    if (!v) {
      form.value.premium_queue_limit = 0
    } else if (!form.value.premium_queue_limit) {
      form.value.premium_queue_limit = 1
      if (!form.value.premium_queue_multiplier) {
        form.value.premium_queue_multiplier = 2
      }
    }
  }
})

/* ====== 工具函数 ====== */
const pad2 = n => (n < 10 ? '0' + n : '' + n)

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

// 专用于钞倍率：最多保留一位小数
function toFixed1(v) {
  const raw = String(v ?? '').trim()
  if (!raw) return 0
  let s = raw.replace(/[^\d.]/g, '')
  const parts = s.split('.')
  if (parts.length > 1) {
    parts[1] = parts[1].slice(0, 1)
  }
  const num = parseFloat(parts.join('.'))
  if (Number.isNaN(num)) return 0
  return Math.round(num * 10) / 10
}

// 展示用钞倍率：空/<=0 返回空字符串
function displayPremiumMultiplier(v) {
  const num = Number(v)
  if (Number.isNaN(num) || num <= 0) return ''
  return (Math.round(num * 10) / 10).toString()
}

function getAuthorization() {
  return uni.getStorageSync('token') || ''
}

/* ====== 接单方式列表拉取（新） ====== */
async function fetchOrderTypes() {
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/order-plan/artist-order-type`,
      method: 'GET',
      header: {
        Authorization: getAuthorization()
      }
    })
    if (String(res.data?.status).toLowerCase() === 'success' && Array.isArray(res.data?.data)) {
      const list = res.data.data.map(it => ({
        value: it.id,
        text: it.name,
        keyword: it.keyword
      }))
      if (list.length) {
        orderTypes.value = list
      }
      // 确保当前 order_type 在列表中
      const has = orderTypes.value.some(ot => ot.value === form.value.order_type)
      if (!has && orderTypes.value.length) {
        form.value.order_type = orderTypes.value[0].value
      }
    } else {
      console.error('获取接单方式失败，使用默认配置:', res.data)
      orderTypes.value = [...defaultOrderTypes]
    }
  } catch (err) {
    console.error('获取接单方式异常，使用默认配置:', err)
    orderTypes.value = [...defaultOrderTypes]
  }
}

/* ====== 选择器事件 ====== */

function onOrderTypeChange(e) {
  if (!canEditOrderType.value) {
    uni.showToast({
      title: '接单已开始，不能修改接单方式',
      icon: 'none'
    })
    return
  }
  const idx = Number(e.detail.value || 0)
  const opt = orderTypes.value[idx]
  if (!opt) return
  form.value.order_type = opt.value

  // 长期接单时强制分别寄送（手改毛表单不再展示寄送 UI，仅内部保持默认值）
  if (form.value.order_type === 1) {
    form.value.order_config.extra.shipping.mode = 'separate'
    form.value.order_config.extra.shipping.unified_date = ''
  }
}

function onChallengeTypeChange(e) {
  const idx = Number(e.detail.value || 0)
  form.value.challenge_type = challengeTypes[idx].value
}

function onServiceSceneSwitch(e) {
  const checked = e.detail.value
  const targetScene = checked ? 2 : 1

  if (
    isEditMode.value &&
    originalPlan.value.service_scene === 2 &&
    !canEditServiceScene.value &&
    targetScene !== originalPlan.value.service_scene
  ) {
    uni.showToast({
      title: '已开始的本平台计划不能切换为其它平台',
      icon: 'none'
    })
    return
  }

  form.value.service_scene = targetScene
  
  if (targetScene === 2 && brandId.value && brandArtistRole.value === null) {
    fetchBrandArtistInfo(brandId.value)
  }
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

function onPremiumQueueSwitch(e) {
  const checked = e.detail.value
  premiumQueueEnabled.value = checked
  if (checked && !form.value.premium_queue_multiplier) {
    form.value.premium_queue_multiplier = 2
  }
}

/* ====== 默认配置拉取（档位 / 加购） ====== */
async function fetchCommonConfigs(artistType) {
  try {
    // type: 0=妆师, 1=毛娘
    const typeParam = artistType === 2 ? 1 : 0
    const tRes = await uni.request({
      url: `${websiteUrl.value}/brand-manager/order-plan/common-tiers?type=${typeParam}`,
      method: 'GET',
      header: {
        Authorization: getAuthorization()
      }
    })
    if (String(tRes.data?.status).toLowerCase() === 'success') {
      tierOptions.value = [
        {
          label: '添加空白档位',
          value: 'blank'
        },
        ...(tRes.data?.data || []).map(it => ({
          label: it.title,
          value: it
        }))
      ]
    }
    const aRes = await uni.request({
      url: `${websiteUrl.value}/brand-manager/order-plan/common-addons?type=${typeParam}`,
      method: 'GET',
      header: {
        Authorization: getAuthorization()
      }
    })
    if (String(aRes.data?.status).toLowerCase() === 'success') {
      addonOptions.value = [
        {
          label: '添加空白加购',
          value: 'blank'
        },
        ...(aRes.data?.data || []).map(it => ({
          label: it.title,
          value: it
        }))
      ]
    }
  } catch (err) {
    console.error('获取默认配置失败：', err)
  }
}

/* ====== 默认节点模板拉取（stepOptions） ====== */
async function fetchStepOptions(artistType) {
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/brand-manager/order-plan/default-steps?artist_type=${artistType}`,
      method: 'GET',
      header: {
        Authorization: getAuthorization()
      }
    })
    if (String(res.data?.status).toLowerCase() === 'success' && Array.isArray(res.data?.data)) {
      const list = res.data.data || []
      stepOptions.value = [
        {
          label: '添加空白节点',
          value: 'blank'
        },
        ...list.map(item => ({
          label: item.name,
          value: {
            name: String(item.name || ''),
            breach_compensation_rate:
              typeof item.breach_compensation_rate === 'number'
                ? item.breach_compensation_rate
                : Number(item.breach_compensation_rate || 0)
          }
        }))
      ]
    } else {
      stepOptions.value = [
        {
          label: '添加空白节点',
          value: 'blank'
        }
      ]
    }
  } catch (err) {
    console.error('获取节点模板失败：', err)
    stepOptions.value = [
      {
        label: '添加空白节点',
        value: 'blank'
      }
    ]
  }
}

/* ====== 档位/加购 ====== */
function onTierPickerChange(e) {
  const idx = Number(e.detail.value || 0)
  const opt = tierOptions.value[idx]
  if (!opt) return
  if (opt.value === 'blank') {
    form.value.order_config.tiers.push({
      title: '',
      price: 0,
      description: ''
    })
  } else {
    form.value.order_config.tiers.push({
      title: opt.value.title || '',
      price: toFixed2(opt.value.price || 0),
      description: opt.value.description || ''
    })
  }
}

function removeTier(i) {
  form.value.order_config.tiers.splice(i, 1)
}

function handleRemoveTier(i) {
  if (!canDeleteConfigItem.value) return
  removeTier(i)
}

function onAddonPickerChange(e) {
  const idx = Number(e.detail.value || 0)
  const opt = addonOptions.value[idx]
  if (!opt) return
  if (opt.value === 'blank') {
    form.value.order_config.addons.push({
      title: '',
      price: 0,
      description: ''
    })
  } else {
    form.value.order_config.addons.push({
      title: opt.value.title || '',
      price: toFixed2(opt.value.price || 0),
      description: opt.value.description || ''
    })
  }
}

function removeAddon(i) {
  form.value.order_config.addons.splice(i, 1)
}

function handleRemoveAddon(i) {
  if (!canDeleteConfigItem.value) return
  removeAddon(i)
}

/* ====== 尺寸 ====== */
function isSizeSelected(size) {
  return form.value.order_config.extra.size_surcharges.some(x => x.size === size)
}

function handleSizeTap(size) {
  const arr = form.value.order_config.extra.size_surcharges
  const exists = arr.find(x => x.size === size)
  if (exists) {
    uni.showToast({
      title: '已选择该尺寸',
      icon: 'none'
    })
    return
  }
  arr.push({
    size,
    price: 0
  })
}

function onSizePriceBlur(idx, val) {
  form.value.order_config.extra.size_surcharges[idx].price = toFixed2(val)
}

function removeSize(idx) {
  form.value.order_config.extra.size_surcharges.splice(idx, 1)
}

/* ====== 毛坯选择方式 ====== */
function toggleBlankOption(type) {
  const extra = form.value.order_config.extra
  if (!extra) return
  if (type === 'self') {
    extra.support_self_blank = !extra.support_self_blank
  } else if (type === 'third') {
    extra.support_third_party_blank = !extra.support_third_party_blank
  } else if (type === 'stock') {
    extra.support_stock_blank = !extra.support_stock_blank
  }
}

/* ====== 违约金比例（节点）工具 ====== */
// rate 是小数形式（0.05 -> 展示为 5）
function displayStepPercent(rate) {
  const num = Number(rate)
  if (Number.isNaN(num) || num <= 0) return ''
  const v = num * 100
  return (Math.round(v * 100) / 100).toString().replace(/\.00$/, '')
}

function onStepPercentBlur(idx, val) {
  const str = String(val || '').trim()
  if (!str) {
    form.value.step_config_json[idx].breach_compensation_rate = 0
    return
  }
  const num = parseFloat(str.replace(/[^\d.]/g, ''))
  if (Number.isNaN(num) || num <= 0) {
    form.value.step_config_json[idx].breach_compensation_rate = 0
    return
  }
  const rate = num > 1 ? num / 100 : num
  form.value.step_config_json[idx].breach_compensation_rate = Math.round(rate * 10000) / 10000
}

/* ====== 钞倍率输入处理（保留一位小数） ====== */
function onPremiumMultiplierBlur(val) {
  const num = toFixed1(val)
  form.value.premium_queue_multiplier = num > 0 ? num : 2
}

/* ====== 节点配置 step_config_json，通过 picker 添加 ====== */
function onStepPickerChange(e) {
  if (!canEditStepConfig.value) return
  const idx = Number(e.detail.value || 0)
  const opt = stepOptions.value[idx]
  if (!opt) return

  if (opt.value === 'blank') {
    form.value.step_config_json.push({
      name: '',
      breach_compensation_rate: 0
    })
  } else {
    form.value.step_config_json.push({
      name: String(opt.value.name || ''),
      breach_compensation_rate: Number(opt.value.breach_compensation_rate || 0)
    })
  }
}

function removeStep(idx) {
  if (!canEditStepConfig.value) return
  form.value.step_config_json.splice(idx, 1)
}

function handleRemoveStep(idx) {
  if (!canDeleteConfigItem.value) return
  removeStep(idx)
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
        uni.showToast({
          title: `第 ${i + 1} 张上传失败`,
          icon: 'none'
        })
      }
    }
    form.value.images = [...form.value.images, ...uploadedUrls]
    if (uploadedUrls.length > 0) {
      uni.showToast({
        title: `成功上传 ${uploadedUrls.length} 张`,
        icon: 'success'
      })
    }
  } catch (e) {
    console.error('选择/上传失败：', e)
    uni.showToast({
      title: '图片上传失败',
      icon: 'none'
    })
  } finally {
    uploading.value = false
    uploadedCount.value = 0
    totalToUpload.value = 0
    uploadStatusText.value = ''
  }
}

function removeImage(i) {
  form.value.images.splice(i, 1)
}

function preview(list, current) {
  uni.previewImage({
    urls: list,
    current
  })
}

/* ====== 详情加载 ====== */
async function loadDetail(id) {
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/brand-manager/order-plan/info?id=${id}`,
      method: 'GET',
      header: {
        Authorization: getAuthorization()
      }
    })
    if (String(res.data?.status).toLowerCase() !== 'success') {
      uni.showToast({
        title: res.data?.message || '获取详情失败',
        icon: 'none'
      })
      return
    }
    const p = res.data.data || res.data

    form.value.id = p.id
    form.value.artist_name = p.artist_name || ''
    form.value.artist_type = p.artist_type || 2
    form.value.order_type = p.order_type || 1
    form.value.max_participants = p.max_participants ?? 0
    form.value.max_submissions_per_user = p.max_submissions_per_user ?? 1
    form.value.service_scene = p.service_scene || 1
    form.value.require_platform_account =
      p.require_platform_account === true ||
      p.require_platform_account === 1 ||
      p.require_platform_account === '1'
    form.value.check_showcase = p.check_showcase || 0
    form.value.queue_window_sec = p.queue_window_sec || 60
    form.value.challenge_type = p.challenge_type || 1

    form.value.premium_queue_limit = p.premium_queue_limit || 0
    form.value.inventory = 0
    form.value.premium_inventory = 0
    originalPlan.value.inventory = p.inventory || 0
    originalPlan.value.premium_inventory = p.premium_inventory || 0

    // ✅ 若详情里带 brand_id，则同步并拉取 role
    const bid = Number(p.brand_id || p.brandId || 0)
    if (bid && bid !== brandId.value) {
      brandId.value = bid
      brandArtistRole.value = null
      fetchBrandArtistInfo(bid)
    } else if (bid && brandArtistRole.value === null) {
      fetchBrandArtistInfo(bid)
    }

    // 钞倍率：优先读取 premium_rate，兼容旧字段 premium_queue_multiplier
    let rate = 0
    if (typeof p.premium_rate === 'number') {
      rate = p.premium_rate
    } else if (typeof p.premium_rate === 'string') {
      rate = Number(p.premium_rate)
    } else if (typeof p.premium_queue_multiplier === 'number') {
      rate = p.premium_queue_multiplier
    } else if (typeof p.premium_queue_multiplier === 'string') {
      rate = Number(p.premium_queue_multiplier)
    }
    rate = Number.isNaN(rate) ? 0 : rate
    form.value.premium_queue_multiplier = rate > 0 ? toFixed1(rate) : 0

    if (p.open_time) {
      const dt = new Date(p.open_time * 1000)
      form.value.open_date = `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`
      form.value.open_time = `${pad2(dt.getHours())}:${pad2(dt.getMinutes())}`
      originalPlan.value.open_time = p.open_time
    } else {
      originalPlan.value.open_time = 0
    }
    if (p.close_time) {
      const dt = new Date(p.close_time * 1000)
      form.value.close_date = `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`
      form.value.close_time = `${pad2(dt.getHours())}:${pad2(dt.getMinutes())}`
      originalPlan.value.close_time = p.close_time
    } else {
      originalPlan.value.close_time = 0
    }

    if (typeof p.images === 'string') {
      form.value.images = p.images
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
    } else if (Array.isArray(p.images)) {
      form.value.images = p.images
        .map(x => (typeof x === 'string' ? x : x.url))
        .filter(Boolean)
    } else {
      form.value.images = []
    }

    let cfg = {}
    try {
      cfg = p.order_config ? JSON.parse(p.order_config) : {}
    } catch (e) {
      cfg = {}
    }
    form.value.order_config.tiers = Array.isArray(cfg.tiers)
      ? cfg.tiers.map(t => ({
          title: t.title || '',
          price: toFixed2(t.price || 0),
          description: t.description || ''
        }))
      : [
          {
            title: '',
            price: 0,
            description: ''
          }
        ]
    form.value.order_config.addons = Array.isArray(cfg.addons)
      ? cfg.addons.map(a => ({
          title: a.title || '',
          price: toFixed2(a.price || 0),
          description: a.description || ''
        }))
      : [
          {
            title: '',
            price: 0,
            description: ''
          }
        ]
    
    // ✅ 恢复 payment_methods
    form.value.order_config.payment_methods = Array.isArray(cfg.payment_methods) 
        ? cfg.payment_methods.map(id => Number(id)) 
        : []

    form.value.order_config.extra = Object.assign(
      {
        per_head_cycle_days: 0,
        total_cycle_days: 0,
        finishing_method: 'water',
        finishing_desc: '',
        shipping: {
          mode: 'separate',
          unified_date: '',
          separate_days_before_start: 0
        },
        size_surcharges: [],
        support_self_blank: true,
        support_third_party_blank: true,
        support_stock_blank: false
      },
      cfg.extra || {}
    )
    if (form.value.order_type === 1) {
      form.value.order_config.extra.shipping.mode = 'separate'
      form.value.order_config.extra.shipping.unified_date = ''
    }

    // 兼容字符串数组 / 对象数组的 step_config_json
    let steps = []
    if (Array.isArray(p.step_config_json)) {
      steps = p.step_config_json
    } else if (typeof p.step_config_json === 'string' && p.step_config_json.trim()) {
      try {
        const parsed = JSON.parse(p.step_config_json)
        if (Array.isArray(parsed)) steps = parsed
      } catch (e) {}
    }

    form.value.step_config_json = (steps || []).map(x => {
      if (x && typeof x === 'object') {
        return {
          name: String(x.name || ''),
          breach_compensation_rate:
            typeof x.breach_compensation_rate === 'number'
              ? x.breach_compensation_rate
              : Number(x.breach_compensation_rate || 0)
        }
      }
      return {
        name: String(x || ''),
        breach_compensation_rate: 0
      }
    })

    originalPlan.value.service_scene = form.value.service_scene
    originalPlan.value.max_participants = form.value.max_participants

    // 编辑模式下，也同步拉一次模板列表（毛娘默认节点）
    fetchCommonConfigs(form.value.artist_type)
    fetchStepOptions(form.value.artist_type)
  } catch (err) {
    console.error('加载失败：', err)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  }
}

/* ====== 提交 ====== */
async function submitPlan() {
  if (!form.value.artist_name) {
    return uni.showToast({
      title: '请填写计划名称',
      icon: 'none'
    })
  }
  const openUnix = toUnix(form.value.open_date, form.value.open_time)
  const closeUnix = toUnix(form.value.close_date, form.value.close_time)
  if (!openUnix || !closeUnix) {
    return uni.showToast({
      title: '请选择开始与结束时间',
      icon: 'none'
    })
  }
  if (closeUnix <= openUnix) {
    return uni.showToast({
      title: '结束时间必须晚于开始时间',
      icon: 'none'
    })
  }

  if (isEditMode.value && originalPlan.value.service_scene === 2 && originalPlan.value.open_time) {
    const started = nowUnix() >= originalPlan.value.open_time
    if (started) {
      if (openUnix > originalPlan.value.open_time) {
        uni.showToast({
          title: '已开始的本平台计划不能将开始时间改晚',
          icon: 'none'
        })
        return
      }
      if (originalPlan.value.close_time && closeUnix < originalPlan.value.close_time) {
        uni.showToast({
          title: '已开始的本平台计划不能缩短结束时间',
          icon: 'none'
        })
        return
      }
    }
  }

  const isPlatform = form.value.service_scene === 2

  // 按接单方式切换工期：自由排单用总工期，其它模式用每顶工期
  const perHeadCycle =
    form.value.order_type === 5
      ? 0
      : Number(form.value.order_config.extra.per_head_cycle_days || 0)
  const totalCycle =
    form.value.order_type === 5
      ? Number(form.value.order_config.extra.total_cycle_days || 0)
      : 0

  // 前端兜底校验：两者不能同时大于 0
  if (perHeadCycle > 0 && totalCycle > 0) {
    uni.showToast({
      title: '每顶工期与总工期不能同时大于 0，请只填写其中一个',
      icon: 'none'
    })
    return
  }

  // ✅ 如果没有勾选支付宝，清空提交的节点配置
  const safeStepConfig = hasAlipay.value ? (form.value.step_config_json || []) : []

  const stepConfigToSend = isPlatform
    ? safeStepConfig
        .map(x => ({
          name: String(x.name || ''),
          breach_compensation_rate: Number(x.breach_compensation_rate || 0)
        }))
        .filter(it => it.name)
    : []

  if (
    !isEditMode.value &&
    isPlatform &&
    premiumQueueEnabled.value &&
    !Number(form.value.premium_queue_multiplier || 0)
  ) {
    uni.showToast({
      title: '请填写钞倍率',
      icon: 'none'
    })
    return
  }

  const payload = {
    id: form.value.id,
    artist_name: form.value.artist_name,
    artist_type: form.value.artist_type, // 固定为 2（毛娘）
    order_type: form.value.order_type,
    max_participants: form.value.order_type === 1 ? 0 : form.value.max_participants,
    max_submissions_per_user:
      form.value.order_type === 1 ? 1 : form.value.max_submissions_per_user,
    open_time: openUnix,
    close_time: closeUnix,
    service_scene: form.value.service_scene,
    require_platform_account: !!form.value.require_platform_account,
    check_showcase: !!form.value.check_showcase,
    queue_window_sec: form.value.queue_window_sec,
    challenge_type: form.value.challenge_type,
    images: form.value.images,

    inventory: isEditMode.value
      ? Number(form.value.inventory || 0)
      : isPlatform
      ? Number(form.value.max_participants || 0)
      : 0,

    premium_queue_limit: Number(form.value.premium_queue_limit || 0),
    premium_inventory: isEditMode.value ? Number(form.value.premium_inventory || 0) : 0,

    premium_rate: premiumQueueEnabled.value
      ? toFixed1(form.value.premium_queue_multiplier || 2)
      : 0,

    step_config: stepConfigToSend,

    order_config: {
      tiers: (form.value.order_config.tiers || []).map(t => ({
        title: t.title || '',
        price: toFixed2(t.price || 0),
        description: t.description || ''
      })),
      addons: (form.value.order_config.addons || []).map(a => ({
        title: a.title || '',
        price: toFixed2(a.price || 0),
        description: a.description || ''
      })),
      // ✅ 传递收款方式ID
      payment_methods: form.value.order_config.payment_methods || [],
      extra: {
        per_head_cycle_days: perHeadCycle,
        total_cycle_days: totalCycle,
        finishing_method: form.value.order_config.extra.finishing_method,
        finishing_desc: form.value.order_config.extra.finishing_desc || '',
        // 手改毛前端不展示寄送配置，这里用固定默认值占位，方便后端解包
        shipping: {
          mode: 'separate',
          unified_date: '',
          separate_days_before_start: 0
        },
        size_surcharges: (form.value.order_config.extra.size_surcharges || []).map(it => ({
          size: it.size,
          price: toFixed2(it.price || 0)
        })),
        // 毛坯方式
        support_self_blank: !!form.value.order_config.extra.support_self_blank,
        support_third_party_blank: !!form.value.order_config.extra.support_third_party_blank,
        support_stock_blank: !!form.value.order_config.extra.support_stock_blank
      }
    }
  }

  if (isEditMode.value) {
    if (!payload.inventory) delete payload.inventory
    if (!payload.premium_inventory) delete payload.premium_inventory
  }

  if (payload.inventory < 0 || payload.premium_inventory < 0) {
    uni.showToast({
      title: '库存增量不能为负数',
      icon: 'none'
    })
    return
  }

  if (!isPlatform) {
    delete payload.step_config
  }
  if (isEditMode.value && !canEditStepConfig.value) {
    delete payload.step_config
  }
  if (!premiumQueueEnabled.value) {
    delete payload.premium_rate
  }

  submitting.value = true
  try {
    const url =
      websiteUrl.value +
      (isEditMode.value
        ? '/brand-manager/order-plan/update'
        : '/brand-manager/order-plan/add')
    const res = await uni.request({
      url,
      method: 'POST',
      data: payload,
      header: {
        Authorization: getAuthorization(),
        'Content-Type': 'application/json'
      }
    })
    if (String(res.data?.status).toLowerCase() === 'success') {
      uni.showToast({
        title: isEditMode.value ? '更新成功' : '添加成功',
        icon: 'success'
      })
      setTimeout(() => uni.navigateBack(), 800)
    } else {
      const msg = res.data?.message || res.data?.msg || res.data?.error || '提交失败'
      uni.showToast({
        title: msg,
        icon: 'none'
      })
    }
  } catch (err) {
    console.error('提交失败：', err)
    uni.showToast({
      title: '请求失败',
      icon: 'none'
    })
  } finally {
    submitting.value = false
  }
}

/* ====== 生命周期 ====== */
onLoad(query => {
  // 拉取接单方式（接口版）
  fetchOrderTypes()
  // ✅ 拉取收款方式列表
  fetchPaymentList()

  // ✅ 同步 brand_id -> 拉取 role
  const bid = extractBrandIdFromQuery(query || {})
  if (bid) {
    brandId.value = bid
    brandArtistRole.value = null
    fetchBrandArtistInfo(bid)
  }

  if (query && query.id) {
    isEditMode.value = true
    currentId.value = Number(query.id)
    loadDetail(currentId.value)
  } else {
    isEditMode.value = false
    currentId.value = null
    // 毛娘：默认 artist_type = 2，拉取毛娘档位/加购 & 节点模板
    fetchCommonConfigs(form.value.artist_type)
    fetchStepOptions(form.value.artist_type)
  }
})

// ✅ 页面每次进入/返回时：尽量解析最新 query，并刷新 brand-artist/info
onShow(async () => {
  // 先从当前 URL 解析 brand_id，避免某些端 options 滞后
  const q = getCurrentQuerySafe()
  const bid = extractBrandIdFromQuery(q)
  if (bid) {
    brandId.value = bid
  }

  // 再兜底加载用户身份（无 URL 参数时）
  await ensureIdentityLoaded()
  if (!brandId.value) return

  // 你原本要请求的接口：brand-artist/info
  fetchBrandArtistInfo(brandId.value)
})

onMounted(() => {
  uni.setNavigationBarTitle({
    title: '发布毛娘接单计划'
  })
})
</script>

<style scoped>
.order-plan-form {
  padding: 24rpx;
  background: #f7f8fa;
  min-height: 100vh;
  box-sizing: border-box;
}

/* 顶部表单分组 */
.top-panel {
  background: #fff;
  border-radius: 20rpx;
  padding: 8rpx 16rpx;
  box-shadow: 0 8rpx 28rpx rgba(0, 0, 0, 0.06);
  margin-bottom: 24rpx;
}

.top-panel .form-item {
  margin: 0;
  padding: 20rpx 8rpx;
  border-bottom: 1rpx solid #f1f2f4;
}

.top-panel .form-item:last-child {
  border-bottom: none;
}

.inline-control {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.inline-control--between {
  justify-content: space-between;
  gap: 16rpx;
}

.inline-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-shrink: 0;
}

.inline-warn {
  flex: 1;
  text-align: right;
  color: #696969;
  font-size: 22rpx;
  line-height: 1.4;
}

.inline-tip {
  color: #909399;
  font-size: 24rpx;
}

/* 通用 */
.form-item {
  margin-bottom: 24rpx;
}

/* ✅ 禁用节点配置区域样式 */
.disabled-section {
    opacity: 0.6;
    pointer-events: none; /* 禁止内部一切点击 */
}

.label {
  display: block;
  margin-bottom: 12rpx;
  color: #333;
  font-size: 28rpx;
  font-weight: 600;
}

.label-small {
  display: block;
  margin-bottom: 8rpx;
  color: #666;
  font-size: 24rpx;
}

.static-value {
  display: block;
  padding: 16rpx 20rpx;
  border-radius: 12rpx;
  background: #f5f6f7;
  font-size: 28rpx;
  color: #333;
}

.input {
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 28rpx;
}

.picker {
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 28rpx;
  color: #333;
}

/* 红色警告样式选择器 */
.warning-picker {
    color: #ff4d4f;
    display: flex;
    align-items: center;
}

.disabled-picker {
    color: #999;
}

.tip {
  margin-top: 8rpx;
  color: #999;
  font-size: 24rpx;
  line-height: 1.6;
}

/* 日期+时间并排 */
.datetime-row {
  display: flex;
  gap: 12rpx;
}

.picker-col {
  flex: 1;
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 28rpx;
  color: #333;
}

/* card 风格 */
.label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.btn-mini {
  background: linear-gradient(135deg, #8fecff, #c1ddff);
  color: #2c3e50;
  border-radius: 28rpx;
  font-size: 24rpx;
  padding: 6rpx 16rpx;
  margin: 0;
}

.btn-mini::after {
  border: none;
}

.card {
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-top: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.row {
  margin-bottom: 12rpx;
}

.row-right {
  text-align: right;
}

.btn-danger {
  background: #ffeeee;
  color: #ff4d6a;
  border-radius: 24rpx;
  font-size: 24rpx;
  padding: 4rpx 16rpx;
}

.btn-danger::after {
  border: none;
}

/* 已开始阶段：删除按钮灰色禁用态 */
.btn-danger[disabled],
.btn-danger.btn-disabled {
  background: #f5f5f5;
  color: #c0c4cc;
}

/* 图片上传 */
.images {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.img-wrap {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  overflow: hidden;
  position: relative;
  background: #f5f5f5;
}

.img {
  width: 100%;
  height: 100%;
}

.del {
  position: absolute;
  right: 6rpx;
  top: 6rpx;
  background: rgba(0, 0, 0, 0.45);
  border-radius: 50%;
  padding: 4rpx;
}

.img-add {
  width: 160rpx;
  height: 160rpx;
  border: 2rpx dashed #ddd;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 24rpx;
}

.uploading-container {
  width: 100%;
  padding: 20rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.uploading-text {
  margin-top: 10rpx;
  color: #999;
  font-size: 26rpx;
}

/* 尺寸 & 毛坯 tag */
.size-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.size-tag {
  padding: 8rpx 16rpx;
  border-radius: 24rpx;
  background: #f0f0f0;
  color: #333;
  font-size: 24rpx;
}

.size-tag.active {
  background: #171e22;
  color: #fff;
}

.size-price-list {
  margin-top: 12rpx;
}

.size-price-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: #fff;
  padding: 14rpx;
  border-radius: 10rpx;
  margin-bottom: 10rpx;
}

.sp-label {
  color: #333;
  font-size: 26rpx;
}

.sp-input {
  flex: 1;
  background: #f8f8f8;
  border-radius: 8rpx;
  padding: 14rpx;
  font-size: 26rpx;
}

.sp-del {
  color: #f56c6c;
}

/* 库存展示 */
.inventory-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 24rpx;
  margin-bottom: 12rpx;
}

.inventory-col {
  flex: 1;
  padding: 12rpx 16rpx;
  border-radius: 12rpx;
  background: #f5f6f7;
}

.inv-label {
  display: block;
  font-size: 24rpx;
  color: #888;
  margin-bottom: 4rpx;
}

.inv-value {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

/* 间距工具类 */
.mt-8 {
  margin-top: 8rpx;
}

.mt-12 {
  margin-top: 12rpx;
}

/* 提交 */
.submit-box {
  padding: 20rpx 0 60rpx;
}

.btn-submit {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  font-size: 32rpx;
  background: linear-gradient(135deg, #8fecff, #c1ddff);
  color: #2c3e50;
}

.btn-submit::after {
  border: none;
}

/* ✅ 弹窗样式 */
.payment-popup {
    background-color: #fff;
    border-top-left-radius: 24rpx;
    border-top-right-radius: 24rpx;
    height: 70vh;
    display: flex;
    flex-direction: column;
}

.popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx 32rpx;
    border-bottom: 1rpx solid #eee;
}

.popup-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
}

.popup-close {
    font-size: 28rpx;
    color: #999;
}

.popup-desc-box {
    padding: 16rpx 24rpx;
    background-color: #f2faff;
    color: #007aff;
    font-size: 24rpx;
    line-height: 1.5;
    border-bottom: 1rpx solid #eef0f2;
}

.popup-content {
    flex: 1;
    overflow-y: auto;
    padding: 24rpx;
}

.payment-item {
    background: #f9f9f9;
    padding: 20rpx;
    border-radius: 12rpx;
    margin-bottom: 20rpx;
    border: 2rpx solid transparent;
}

.payment-item:active {
    background: #f0f0f0;
}

.payment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12rpx;
}

.payment-left {
    display: flex;
    align-items: center;
    gap: 16rpx;
}

.payment-name {
    font-size: 30rpx;
    font-weight: 600;
    color: #333;
}

.payment-desc {
    font-size: 26rpx;
    color: #666;
    line-height: 1.6;
    white-space: pre-wrap; 
}

/* 禁用态样式 */
.disabled-item {
    opacity: 0.4;
    pointer-events: none;
}

.lock-tip {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    margin-top: 40rpx;
    color: #ff4d4f;
    font-size: 26rpx;
}
</style>