<template>
  <view class="item-form-page">
    <view-logs />
    <!-- 主体：可滚动 -->
    <scroll-view
      class="scroll-body"
      scroll-y
      :show-scrollbar="false"
    >
      <!-- 未登录 -->
      <view v-if="!isLogin" class="state-box">
        <text class="state-title">请先登录</text>
        <text class="state-desc">登录后可以编辑本次投递的娃头信息。</text>
      </view>

      <!-- 缺少 plan_id（新增模式下） -->
      <view v-else-if="!isEdit && !planId" class="state-box state-error">
        <text class="state-title">缺少必要参数</text>
        <text class="state-desc">新增投递时必须携带 plan_id。</text>
      </view>

      <!-- 加载中（编辑模式首次进入） -->
      <view v-else-if="loading && isEdit" class="state-box">
        <text class="state-title">加载中…</text>
        <text class="state-desc">正在加载投递详情</text>
      </view>

      <!-- 其他错误 -->
      <view v-else-if="errorMsg" class="state-box state-error">
        <text class="state-title">加载失败</text>
        <text class="state-desc">{{ errorMsg }}</text>
        <button class="primary-btn" type="default" @click="reloadItem">重试</button>
      </view>

      <!-- 表单内容 -->
      <view v-else class="content">
        <!-- 基本信息卡片 -->
        <view class="card">
          <view class="card-header">
            <text class="card-title">基本信息</text>
          </view>

          <!-- 娃头：分步选择 / 从娃柜中添加 / 手动输入 -->
          <view class="field-row">

            <!-- 模式切换 -->
            <view class="head-mode-toggle">
              <view
                class="head-mode-chip font-alimamashuhei"
                :class="{ active: headMode === 'select' }"
                @click="switchHeadMode('select')"
              >
                分步选择
                <image src="/static/new-icon/20gf-pointer-copy.png" style="width: 16rpx;height: 16rpx;"></image>
              </view>
              <view
                class="head-mode-chip font-alimamashuhei"
                :class="{ active: headMode === 'cabinet' }"
                @click="switchHeadMode('cabinet')"
              >
                从娃柜中添加
                <image src="/static/new-icon/thinking.png" style="width: 22rpx;height: 22rpx;"></image>
              </view>
              <view
                class="head-mode-chip font-alimamashuhei"
                :class="{ active: headMode === 'manual' }"
                @click="switchHeadMode('manual')"
              >
                手动输入
                <image src="/static/new-icon/input.png" style="width: 22rpx;height: 22rpx; position: relative;top: 1px;"></image>
              </view>
            </view>

            <!-- 分步选择：品牌 → 商品 -->
            <view
              v-if="headMode === 'select'"
              class="field-control relation-trigger"
              @click="goPickHead"
            >
              <view class="rt-left">
                <image
                  v-if="selectedGoods.cover || firstRefImage"
                  :src="selectedGoods.cover || firstRefImage"
                  mode="aspectFill"
                  class="thumb"
                />
                <view class="rt-texts">
                  <text v-if="selectedGoods.name" class="selected-text">
                    {{ selectedGoods.name }}
                  </text>
                  <text v-else class="placeholder-text">
                    可选择娃头（先选品牌再选商品）
                  </text>
                  <text v-if="selectedBrand.brand_name" class="sub-text">
                    {{ selectedBrand.brand_name }}
                  </text>
                </view>
              </view>
              <uni-icons type="arrowright" size="16" color="#999" />
            </view>

            <!-- 从娃柜中添加 -->
            <view
              v-else-if="headMode === 'cabinet'"
              class="field-control relation-trigger"
              @click="goPickFromCabinet"
            >
              <view class="rt-left">
                <image
                  v-if="(cabinetItem && cabinetItem.image) || firstRefImage"
                  :src="(cabinetItem && cabinetItem.image) || firstRefImage"
                  mode="aspectFill"
                  class="thumb"
                />
                <view class="rt-texts">
                  <text v-if="form.work_subject" class="selected-text">
                    {{ form.work_subject }}
                  </text>
                  <text v-else class="placeholder-text">
                    可从娃柜中选择娃头
                  </text>
                  <text v-if="cabinetItem && cabinetItem.name" class="sub-text">
                    {{ cabinetItem.name }}
                  </text>
                </view>
              </view>
              <uni-icons type="arrowright" size="16" color="#999" />
            </view>

            <!-- 手动输入（样式与分步选择同步，有小缩略图） -->
            <view v-else class="field-control relation-trigger manual-trigger">
              <view class="rt-left">
                <image
                  v-if="firstRefImage"
                  :src="firstRefImage"
                  mode="aspectFill"
                  class="thumb"
                />
                <view class="rt-texts">
                  <input
                    v-model.trim="form.work_subject"
                    class="field-input manual-input"
                    type="text"
                    placeholder="请输入娃头名称"
                  />
                </view>
              </view>
            </view>
          </view>

          <!-- 娃头图片（最多3张） -->
          <view class="field-row">
            <view class="field-label">
              <text class="label-text">图片（最多3张）</text>
            </view>
            <view class="field-control image-field">
              <view class="upload-container">
                <view
                  v-for="(img, index) in form.ref_images"
                  :key="index"
                  class="image-preview"
                >
                  <image :src="img" mode="aspectFill" class="preview-img" />
                  <view class="image-actions">
                    <uni-icons
                      type="eye"
                      size="20"
                      color="#fff"
                      @click.stop="previewRefImage(img)"
                    />
                    <uni-icons
                      type="trash"
                      size="20"
                      color="#fff"
                      @click.stop="removeRefImage(index)"
                    />
                  </view>
                </view>

                <view
                  v-if="form.ref_images.length < 3"
                  class="upload-btn"
                  @click="handleUploadRefImages"
                >
                  <uni-icons type="plus" size="32" color="#999" />
                  <text class="upload-text">添加图片</text>
                </view>
              </view>

              <view class="upload-progress" v-if="uploading">
                <progress :percent="uploadProgress" stroke-width="4" activeColor="#4a9db5" />
                <text class="upload-status">
                  {{ uploadStatusText || '上传中…' }}
                </text>
              </view>
            </view>
          </view>

          <!-- 可投递尺寸（来自 plan 的 size_surcharges） -->
          <view v-if="sizeOptions.length" class="plan-row">
            <view class="plan-row-label">
              <text class="plan-row-title">可投递尺寸</text>
            </view>
            <view class="chip-list">
              <view
                v-for="(opt, idx) in sizeOptions"
                :key="idx"
                class="chip"
                :class="{ active: selectedSizeIndex === idx }"
                @click="handleSelectSize(idx)"
              >
                <text class="chip-main font-alimamashuhei">{{ opt.size || '未命名尺寸' }}</text>
                <text v-if="Number(opt.price) > 0" class="chip-tag font-title">+{{ Number(opt.price) }} 元</text>
              </view>
            </view>
          </view>

          <!-- 可选档位 / 套餐（来自 plan 的 tiers） -->
          <view v-if="tierOptions.length" class="plan-row">
            <view class="plan-row-label">
              <text class="plan-row-title">可选档位 / 套餐</text>
            </view>
            <view class="chip-list">
              <view
                v-for="(tier, idx) in tierOptions"
                :key="idx"
                class="chip chip-column"
                :class="{ active: selectedTierIndex === idx }"
                @click="handleSelectTier(idx)"
              >
                <view class="chip-line">
                  <text class="chip-main font-alimamashuhei">{{ tier.title || '未命名档位' }}</text>
                  <text class="chip-tag font-title">{{ Number(tier.price) }} 元</text>
                </view>
                <text v-if="tier.description" class="chip-desc">{{ tier.description }}</text>
              </view>
            </view>
          </view>

          <!-- 可选加购（来自 plan 的 addons） -->
          <view v-if="addonOptions.length" class="plan-row">
            <view class="plan-row-label">
              <text class="plan-row-title">可选加购</text>
            </view>
            <view class="chip-list">
              <view
                v-for="(addon, idx) in addonOptions"
                :key="idx"
                class="chip chip-column"
                :class="{ active: selectedAddonIndexes.includes(idx) }"
                @click="toggleAddon(idx)"
              >
                <view class="chip-line">
                  <text class="chip-main font-alimamashuhei">{{ addon.title || '未命名加购' }}</text>
                  <text class="chip-tag font-title">+{{ Number(addon.price) }} 元</text>
                </view>
                <text v-if="addon.description" class="chip-desc">{{ addon.description }}</text>
              </view>
            </view>
          </view>

          <!-- 总价预估：放在所有选择下面 -->
          <view class="field-row">
            <view class="field-label">
              <text class="label-text">总价预估（元）</text>
            </view>
            <view class="field-control price-row">
              <input
                v-model="form.price_text"
                class="field-input font-title"
                type="digit"
                disabled
              />
            </view>
            <view v-if="tierOptions.length || addonOptions.length || sizeOptions.length" class="price-hint">
              <text class="price-hint-text">
                将根据所选尺寸 / 档位 / 加购自动预估，仅供参考（最终价格以创作者确认为准）。
              </text>
            </view>
          </view>
        </view>

        <!-- 补充信息卡片 -->
        <view class="card">
          <view class="card-header">
            <text class="card-title">补充说明</text>
            <text class="card-sub">如果您选择的档位可以指定要求，请在这里填写（选填）</text>
          </view>

          <view class="field-row field-textarea-row">
            <view class="field-label">
              <text class="label-text">备注</text>
            </view>
            <view class="field-control">
              <textarea
                v-model.trim="form.remark"
                class="field-textarea"
                maxlength="500"
              />
              <view class="textarea-count">
                <text>{{ form.remark.length }}/500</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 提示 -->
        <view class="hint-box">
          <text class="hint-text">
            提示：本页面只编辑本次投递下的单个投递信息。
          </text>
        </view>

        <!-- 底部留白 -->
        <view style="height: 140rpx;"></view>
      </view>
    </scroll-view>

    <!-- 底部操作栏：编辑模式 or 新增模式只要有 plan_id 就能保存（submission_id 允许为 0） -->
    <view class="bottom-bar" v-if="isLogin && (isEdit || planId)">
      <button
        class="save-btn"
        type="default"
        :disabled="saving"
        @click="handleSave"
      >
        <text class="save-text">
          {{ saving ? '保存中…' : (isEdit ? '保存修改' : '保存投递') }}
        </text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { websiteUrl } from '@/common/config.js'
import { chooseImageList, getQiniuToken, uploadImageToQiniu } from '@/common/image.js'

/** ====== 路由参数 ====== */
const submissionId = ref(0)        // 父投递 ID（允许为 0，用于草稿）
const itemId = ref(0)              // 子项 ID（编辑时使用，参数名：submission_item_id / item_id）
const planId = ref(0)              // 投递所属的方案 ID（用于加载 plan 信息）

/** 娃头选择模式：select 分步选择 / cabinet 从娃柜中添加 / manual 手动输入 */
const headMode = ref('select')
const HEAD_MODE_KEY_PREFIX = '__artist_item_head_mode_'
const hasHeadModeFromStorage = ref(false)

function loadHeadModeSnapshot () {
  if (!itemId.value) return
  try {
    const key = HEAD_MODE_KEY_PREFIX + itemId.value
    const snap = uni.getStorageSync(key)
    console.log('[item-form] loadHeadModeSnapshot key=', key, 'snap=', snap)
    if (snap === 'select' || snap === 'cabinet' || snap === 'manual') {
      headMode.value = snap
      hasHeadModeFromStorage.value = true
    }
  } catch (e) {
    console.log('[item-form] loadHeadModeSnapshot error', e)
    hasHeadModeFromStorage.value = false
  }
}
function saveHeadModeSnapshot () {
  if (!itemId.value) return
  try {
    const key = HEAD_MODE_KEY_PREFIX + itemId.value
    console.log('[item-form] saveHeadModeSnapshot key=', key, 'mode=', headMode.value)
    uni.setStorageSync(key, headMode.value)
  } catch (e) {
    console.log('[item-form] saveHeadModeSnapshot error', e)
  }
}

/** ====== 状态 ====== */
const loading = ref(false)
const saving = ref(false)
const errorMsg = ref('')
const hasLoadedItem = ref(false)   // 当前 page 实例是否已经拉过这个 item 的数据

const form = reactive({
  work_subject: '',       // 娃头名称（手动输入 or 从商品 / 娃柜名称带出）
  size: '',               // 尺寸
  tier_title: '',         // 档位标题
  price_text: '',         // 价格预估，仅前端展示
  remark: '',             // 补充说明
  subject_goods_id: 0,    // 选中的娃物 ID（分步选择模式下）
  ref_images: []          // 参考图（最多 3 张）
})

/** 选择品牌 / 娃物（用于展示） */
const selectedBrand = ref({})
const selectedGoods = ref({})

/** 娃柜选择的物品（用于展示） */
const cabinetItem = ref(null)

/** 参考图第一张，用于缩略图展示 */
const firstRefImage = computed(() => {
  if (Array.isArray(form.ref_images) && form.ref_images.length > 0) {
    return form.ref_images[0]
  }
  return ''
})

/** plan 相关状态 */
const sizeOptions = ref([])      // [{ size, price }]
const tierOptions = ref([])      // [{ title, price, description }]
const addonOptions = ref([])     // [{ title, price, description }]

const selectedSizeIndex = ref(-1)
const selectedTierIndex = ref(-1)
const selectedAddonIndexes = ref([])

/** 从 item 详情解析出来的“已选加购标题列表”（用于和 addonOptions 对齐） */
const rawAddonTitles = ref([])

const hasPlanConfig = computed(() => {
  return sizeOptions.value.length || tierOptions.value.length || addonOptions.value.length
})

/** 是否处于编辑模式 */
const isEdit = computed(() => itemId.value > 0)

/** 登录状态（直接看 token） */
const isLogin = computed(() => {
  const token = uni.getStorageSync('token') || ''
  return !!token
})

/** 上传状态（参考图片） */
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadStatusText = ref('')

/** ====== 重置整条记录的状态（当切换 itemId 时用） ====== */
function resetStateForNewItem () {
  console.log('[item-form] resetStateForNewItem, oldItemId=', itemId.value)

  loading.value = false
  saving.value = false
  errorMsg.value = ''
  hasLoadedItem.value = false

  form.work_subject = ''
  form.size = ''
  form.tier_title = ''
  form.price_text = ''
  form.remark = ''
  form.subject_goods_id = 0
  form.ref_images = []

  selectedBrand.value = {}
  selectedGoods.value = {}
  cabinetItem.value = null

  sizeOptions.value = []
  tierOptions.value = []
  addonOptions.value = []

  selectedSizeIndex.value = -1
  selectedTierIndex.value = -1
  selectedAddonIndexes.value = []
  rawAddonTitles.value = []

  uploading.value = false
  uploadProgress.value = 0
  uploadStatusText.value = ''

  headMode.value = 'select'
  hasHeadModeFromStorage.value = false
}

/** ====== 从当前 page 的 options 同步一遍路由参数（主要给 H5 复用组件时用） ====== */
function syncRouteParamsFromCurrentPage () {
  let pages = []
  try {
    pages = getCurrentPages && getCurrentPages()
  } catch (e) {
    console.log('[item-form] syncRouteParams getCurrentPages error', e)
  }
  const cur = pages && pages.length ? pages[pages.length - 1] : null
  const opts = (cur && cur.options) || {}

  const newSubmissionId = Number(opts.submission_id || 0)
  const newItemId = Number(opts.item_id || opts.submission_item_id || 0)
  const newPlanId = Number(opts.plan_id || opts.order_plan_id || 0)

  console.log('[item-form] syncRouteParamsFromCurrentPage opts=', opts,
    'prevSubmissionId=', submissionId.value,
    'prevItemId=', itemId.value,
    'prevPlanId=', planId.value,
    'newSubmissionId=', newSubmissionId,
    'newItemId=', newItemId,
    'newPlanId=', newPlanId
  )

  // 检测是否切换到另一条记录
  if (newItemId && newItemId !== itemId.value) {
    console.log('[item-form] detect item switch, oldItemId=', itemId.value, 'newItemId=', newItemId)
    resetStateForNewItem()
    submissionId.value = newSubmissionId
    itemId.value = newItemId
    planId.value = newPlanId

    if (itemId.value) {
      loadHeadModeSnapshot()
    }
    if (planId.value) {
      fetchPlanInfo()
    }
  } else {
    // 新建 or 同一条记录（比如从子页面返回）
    if (!itemId.value && newItemId) {
      console.log('[item-form] syncRouteParams: init itemId from opts, newItemId=', newItemId)
      itemId.value = newItemId
    }
    if (!planId.value && newPlanId) {
      console.log('[item-form] syncRouteParams: init planId from opts, newPlanId=', newPlanId)
      planId.value = newPlanId
    }
    if (!submissionId.value && newSubmissionId) {
      console.log('[item-form] syncRouteParams: init submissionId from opts, newSubmissionId=', newSubmissionId)
      submissionId.value = newSubmissionId
    }
  }
}

/** 切换娃头模式 */
function switchHeadMode (mode) {
  if (headMode.value === mode) return
  console.log('[item-form] switchHeadMode from', headMode.value, 'to', mode, 'itemId=', itemId.value)
  headMode.value = mode

  // 分步选择模式以外，清空商品绑定（id + 展示），避免误用
  if (mode !== 'select') {
    form.subject_goods_id = 0
    selectedGoods.value = {}
    selectedBrand.value = {}
  }

  // 娃柜以外，清空娃柜展示
  if (mode !== 'cabinet') {
    cabinetItem.value = null
  }

  saveHeadModeSnapshot()
}


/** 选娃头入口（分步选择：品牌->商品） */
function goPickHead () {
  // 进入分步选择时，强制切到 select 模式，并保存快照
  if (headMode.value !== 'select') {
    headMode.value = 'select'
    saveHeadModeSnapshot()
  }

  console.log('[item-form] goPickHead itemId=', itemId.value)

  // 只监听一次分步选择返回
  uni.$once('associate:done', (payload) => {
    console.log('[item-form] associate:done payload=', payload)

    const brandInfo = payload && payload.brand
    const goodsInfo = payload && payload.goods

    // 回填品牌、商品展示用信息
    selectedBrand.value = brandInfo || {}
    selectedGoods.value = goodsInfo || {}

    // ★ 关键：根据回跳携带的 goods 信息填充表单
    if (goodsInfo && goodsInfo.id) {
      // 保存选中的商品 ID
      form.subject_goods_id = goodsInfo.id

      // 用商品名覆盖娃头标题（按你的需求：根据 goods 填充表单）
      form.work_subject = goodsInfo.name || ''

      // 如果有封面图，用封面图作为第一张参考图
      if (goodsInfo.cover) {
        form.ref_images = [goodsInfo.cover]
      }
    }

    // 记录当前是分步选择模式
    saveHeadModeSnapshot()
  })

  // 跳转到品牌选择入口（后面会再进到你给的分步选择页）
  uni.navigateTo({
    url: '/pkg-common/brand-pick/brand-pick',
    success (res) {
      res.eventChannel && res.eventChannel.emit('associate:init', {
        preselect: {
          brand: selectedBrand.value && selectedBrand.value.id ? selectedBrand.value : null,
          goods: selectedGoods.value && selectedGoods.value.id ? selectedGoods.value : null
        }
      })
    }
  })
}


/** 从娃柜中选择入口 */
function goPickFromCabinet () {
  if (headMode.value !== 'cabinet') {
    headMode.value = 'cabinet'
    saveHeadModeSnapshot()
  }

  console.log('[item-form] goPickFromCabinet itemId=', itemId.value)

  try {
    uni.removeStorageSync('__pickedMyItemFromStock')
  } catch (e) {}

  uni.navigateTo({
    url: '/pkg-stock/stock-myitems-search/stock-myitems-search?pickMode=1',
    events: {
      pickMyItemFromStock (payload) {
        console.log('[item-form] eventChannel pickMyItemFromStock payload=', payload)
        applyPickedCabinetItem(payload)
      }
    }
  })
}

/** 应用娃柜选择返回的数据 */
function applyPickedCabinetItem (payload) {
  if (!payload) return
  console.log('[item-form] applyPickedCabinetItem payload=', payload)
  cabinetItem.value = payload

  const name = payload.name || payload.title || ''
  if (name) {
    form.work_subject = name
  }
  if (payload.image) {
    form.ref_images = [payload.image]
  }

  headMode.value = 'cabinet'
  saveHeadModeSnapshot()
}

/** 将接口数据填充到表单 */
function normalizeRefImages (val) {
  if (!val) return []
  if (Array.isArray(val)) {
    return val.filter(Boolean)
  }
  if (typeof val === 'string') {
    return val.split(',').map(function (s) { return s.trim() }).filter(Boolean)
  }
  return []
}

/** 解析 addons_json（Base64）为数组 */
function decodeAddonsJson (base64Str) {
  if (!base64Str) return []
  try {
    if (typeof atob !== 'function') {
      console.warn('[item-form] atob not found, skip decode addons_json')
      return []
    }
    // 兼容中文：Base64 -> UTF8 字符串
    const text = decodeURIComponent(escape(atob(base64Str)))
    const arr = JSON.parse(text)
    return Array.isArray(arr) ? arr : []
  } catch (e) {
    console.error('[item-form] decode addons_json failed', e, 'base64=', base64Str)
    return []
  }
}

/** 根据表单值 + plan 配置，同步尺寸 / 档位 / 加购的选中状态 */
function syncSelectionsFromFormAndPlan () {
  console.log('[item-form] syncSelectionsFromFormAndPlan form.size=', form.size, 'form.tier_title=', form.tier_title, 'rawAddonTitles=', rawAddonTitles.value)

  // 尺寸
  if (form.size && sizeOptions.value.length) {
    const idx1 = sizeOptions.value.findIndex(function (s) {
      return String(s.size) === String(form.size)
    })
    selectedSizeIndex.value = idx1
  }

  // 档位
  if (form.tier_title && tierOptions.value.length) {
    const idx2 = tierOptions.value.findIndex(function (t) {
      return String(t.title) === String(form.tier_title)
    })
    selectedTierIndex.value = idx2
  }

  // 加购：用“标题”对齐
  if (addonOptions.value.length && rawAddonTitles.value && rawAddonTitles.value.length) {
    const selected = []
    addonOptions.value.forEach(function (addon, idx) {
      const t = addon && addon.title
      if (t && rawAddonTitles.value.indexOf(String(t)) > -1) {
        selected.push(idx)
      }
    })
    selectedAddonIndexes.value = selected
  }

  // 是否需要立刻根据 plan 重算一次价格：这里保持原有逻辑，仅在已有档位时计算
  if (selectedTierIndex.value >= 0) {
    recalcPriceFromPlan()
  }
}

function fillFormFromRaw (raw) {
  if (!raw) return
  console.log('[item-form] fillFormFromRaw id=', raw.id, 'work_subject=', raw.work_subject, 'size=', raw.size)

  form.work_subject = raw.work_subject || raw.title || ''
  form.size = raw.size || ''
  form.tier_title = raw.tier_title || raw.tier || ''
  if (typeof raw.price_total !== 'undefined' && raw.price_total !== null) {
    const n = Number(raw.price_total)
    form.price_text = isNaN(n) ? '' : String(n)
  } else {
    form.price_text = ''
  }
  form.remark = raw.remark || raw.note || ''

  // 参考图片：优先用 ref_images
  form.ref_images = normalizeRefImages(raw.ref_images || raw.images || raw.ref_images_str)

  // 兼容 subject_goods_id / goods_id
  form.subject_goods_id = Number(raw.subject_goods_id || raw.goods_id || 0)
  const goodsId = form.subject_goods_id

  if (goodsId > 0) {
    selectedGoods.value = {
      id: goodsId,
      name: raw.subject_goods_name || raw.goods_name || raw.work_subject || form.work_subject,
      cover: (form.ref_images && form.ref_images.length > 0)
        ? form.ref_images[0]
        : (raw.subject_goods_cover || raw.goods_cover || '')
    }
    selectedBrand.value = {
      id: raw.subject_brand_id || raw.brand_id || 0,
      brand_name: raw.subject_brand_name || raw.brand_name || ''
    }
  } else {
    selectedGoods.value = {}
    selectedBrand.value = {}
  }

  // 已选加购：解析 addons_json -> 取出 title 列表
  rawAddonTitles.value = []
  if (raw.addons_json) {
    const arr = decodeAddonsJson(raw.addons_json)
    rawAddonTitles.value = arr
      .map(function (a) { return a && a.title })
      .filter(function (t) { return !!t })
  }

  if (!hasHeadModeFromStorage.value) {
    if (goodsId > 0) {
      headMode.value = 'select'
    } else if (raw.from_cabinet) {
      headMode.value = 'cabinet'
    } else if (form.work_subject) {
      headMode.value = 'manual'
    } else {
      headMode.value = 'select'
    }
    console.log('[item-form] fillFormFromRaw guess headMode =', headMode.value)
  }

  // 如果 plan 已经加载完成，则根据当前表单值同步一次选中状态（尺寸 / 档位 / 加购）
  if (sizeOptions.value.length || tierOptions.value.length || addonOptions.value.length) {
    syncSelectionsFromFormAndPlan()
  }
}

/** 加载单个 item 详情（编辑模式） */
async function fetchItem (force) {
  // 记录当前这次请求针对的 itemId，防止异步竞态覆盖
  const reqItemId = itemId.value

  if (!reqItemId) {
    console.log('[item-form] fetchItem skip, no reqItemId')
    return
  }

  if (!isEdit.value) {
    console.log('[item-form] fetchItem skip, not edit mode, itemId=', reqItemId)
    return
  }
  if (hasLoadedItem.value && !force) {
    console.log('[item-form] fetchItem skip, hasLoadedItem=true & force=false, itemId=', reqItemId)
    return
  }

  const token = uni.getStorageSync('token') || ''
  if (!token) {
    errorMsg.value = '请先登录后再编辑投递信息'
    console.log('[item-form] fetchItem no token')
    return
  }

  console.log('[item-form] fetchItem start, reqItemId=', reqItemId, 'force=', force, 'current itemId=', itemId.value)

  loading.value = true
  errorMsg.value = ''

  try {
    const res = await uni.request({
      url: websiteUrl.value + '/with-state/artist-order/item/detail',
      method: 'GET',
      header: {
        Authorization: token
      },
      data: {
        // 这里用的是当时记录下来的 reqItemId，而不是直接用 itemId.value
        item_id: reqItemId
      }
    })

    const body = res.data || {}
    console.log('[item-form] fetchItem response raw body=', body, 'reqItemId=', reqItemId, 'current itemId=', itemId.value)

    if (String(body.status).toLowerCase() !== 'success') {
      throw new Error(body.msg || '接口返回失败')
    }

    const raw = body.data || {}
    console.log('[item-form] fetchItem data=', raw, 'reqItemId=', reqItemId, 'current itemId=', itemId.value)

    // ★ 关键：如果这时候当前页面的 itemId 已经不是这次请求的 reqItemId 了，
    // 说明用户已经切换到另一个子项（例如从 1 切到 2），
    // 这次响应是“过期”的，不能再覆盖掉当前表单
    if (reqItemId !== itemId.value) {
      console.log('[item-form] fetchItem stale response, ignore. reqItemId=', reqItemId, 'current itemId=', itemId.value)
      return
    }

    // ===== 下面的逻辑只在“响应仍然匹配当前 itemId”时才执行 =====

    submissionId.value = Number(raw.submission_id || submissionId.value || 0)
    if (!planId.value) {
      planId.value = Number(raw.plan_id || raw.order_plan_id || 0)
      if (planId.value) {
        fetchPlanInfo()
      }
    }

    fillFormFromRaw(raw)
    hasLoadedItem.value = true
  } catch (e) {
    console.error('[item-form] 加载 item 详情失败', e)
    errorMsg.value = e && e.message ? e.message : '加载失败，请稍后重试'
  } finally {
    // 这里也要判断一下，避免把别的 item 的 loading 状态给关错
    if (reqItemId === itemId.value) {
      loading.value = false
    } else {
      console.log('[item-form] fetchItem finally: skip loading=false 因为 itemId 已切换, reqItemId=', reqItemId, 'current itemId=', itemId.value)
    }
  }
}

function reloadItem () {
  console.log('[item-form] reloadItem clicked itemId=', itemId.value)
  hasLoadedItem.value = false
  fetchItem(true)
}

/** 加载方案 plan 信息 */
async function fetchPlanInfo () {
  if (!planId.value) return
  console.log('[item-form] fetchPlanInfo planId=', planId.value)
  try {
    const res = await uni.request({
      url: websiteUrl.value + '/brand-artist/order-plan-info',
      method: 'GET',
      data: { id: planId.value }
    })
    const body = res.data || {}
    console.log('[item-form] fetchPlanInfo body=', body)
    if (String(body.status).toLowerCase() !== 'success') {
      return
    }
    const data = body.data || {}
    let cfg = {}
    try {
      cfg = data.order_config ? JSON.parse(data.order_config) : {}
    } catch (e) {
      console.error('[item-form] 解析 order_config 失败', e)
      cfg = {}
    }

    sizeOptions.value = Array.isArray(cfg && cfg.extra && cfg.extra.size_surcharges)
      ? cfg.extra.size_surcharges
      : []
    tierOptions.value = Array.isArray(cfg && cfg.tiers) ? cfg.tiers : []
    addonOptions.value = Array.isArray(cfg && cfg.addons) ? cfg.addons : []

    console.log('[item-form] plan parsed sizeOptions=', sizeOptions.value, 'tierOptions=', tierOptions.value, 'addonOptions=', addonOptions.value)

    // 统一用一个函数，根据“已填表单 + plan 配置”来做高亮 & 价格
    if (form.size || form.tier_title || (rawAddonTitles.value && rawAddonTitles.value.length)) {
      syncSelectionsFromFormAndPlan()
    }
  } catch (e) {
    console.error('[item-form] 加载 order plan 信息失败', e)
  }
}

/** 重新根据选项计算总价（仅前端展示） */
function recalcPriceFromPlan () {
  const tier = selectedTierIndex.value >= 0 ? tierOptions.value[selectedTierIndex.value] : null
  if (!tier) {
    // 没选档位时，不强制覆盖后端返回的 price_text
    return
  }

  let total = Number(tier.price) || 0

  const size = selectedSizeIndex.value >= 0 ? sizeOptions.value[selectedSizeIndex.value] : null
  if (size) {
    total += Number(size.price) || 0
  }

  if (selectedAddonIndexes.value.length) {
    selectedAddonIndexes.value.forEach(function (idx) {
      const addon = addonOptions.value[idx]
      if (addon) total += Number(addon.price) || 0
    })
  }

  form.price_text = String(total)
  console.log('[item-form] recalcPriceFromPlan total=', total)
}

/** 选择尺寸 */
function handleSelectSize (idx) {
  if (selectedSizeIndex.value === idx) {
    selectedSizeIndex.value = -1
    form.size = ''
  } else {
    selectedSizeIndex.value = idx
    const opt = sizeOptions.value[idx]
    form.size = (opt && opt.size) || ''
  }
  console.log('[item-form] handleSelectSize idx=', idx, 'size=', form.size)
  if (selectedTierIndex.value >= 0) {
    recalcPriceFromPlan()
  }
}

/** 选择档位 */
function handleSelectTier (idx) {
  if (selectedTierIndex.value === idx) {
    selectedTierIndex.value = -1
    form.tier_title = ''
  } else {
    selectedTierIndex.value = idx
    const tier = tierOptions.value[idx]
    form.tier_title = (tier && tier.title) || ''
  }
  console.log('[item-form] handleSelectTier idx=', idx, 'tier_title=', form.tier_title)
  recalcPriceFromPlan()
}

/** 勾选/取消勾选加购 */
function toggleAddon (idx) {
  const list = selectedAddonIndexes.value.slice()
  const i = list.indexOf(idx)
  if (i > -1) {
    list.splice(i, 1)
  } else {
    list.push(idx)
  }
  selectedAddonIndexes.value = list
  console.log('[item-form] toggleAddon idx=', idx, 'selectedAddonIndexes=', selectedAddonIndexes.value)
  if (selectedTierIndex.value >= 0) {
    recalcPriceFromPlan()
  }
}

/** 表单校验 */
function validateForm () {
  const subject = (form.work_subject || '').trim()

  if (headMode.value === 'select') {
    if (!form.subject_goods_id) {
      uni.showToast({ title: '请选择娃头（分步选择）', icon: 'none' })
      return false
    }
  } else {
    if (!subject) {
      uni.showToast({ title: '请填写娃头名称', icon: 'none' })
      return false
    }
  }

  if (!isEdit.value && !planId.value) {
    uni.showToast({ title: '缺少 plan_id，无法保存', icon: 'none' })
    return false
  }

  return true
}

/** 上传参考图片（最多3张） */
async function handleUploadRefImages () {
  try {
    const currentCount = Array.isArray(form.ref_images) ? form.ref_images.length : 0
    const remain = 3 - currentCount
    if (remain <= 0) {
      uni.showToast({ title: '最多上传 3 张图片', icon: 'none' })
      return
    }

    const files = await chooseImageList(remain)
    if (!files || !files.length) return

    uploading.value = true
    uploadProgress.value = 0

    for (let i = 0; i < files.length; i++) {
      uploadStatusText.value = '获取上传凭证...'
      const tk = await getQiniuToken()
      if (!tk || !tk.token || !tk.path) {
        throw new Error('获取上传凭证失败')
      }

      const filePath = files[i]
      uploadStatusText.value = '上传中 (' + (i + 1) + '/' + files.length + ')'
      uploadProgress.value = Math.round((i / files.length) * 100)

      const ret = await uploadImageToQiniu(filePath, tk.token, tk.path)
      if (ret && ret.imageUrl) {
        if (!Array.isArray(form.ref_images)) {
          form.ref_images = []
        }
        form.ref_images.push(ret.imageUrl)
        uploadProgress.value = Math.round(((i + 1) / files.length) * 100)
      }
    }

    uploadStatusText.value = '上传完成'
    uni.showToast({ title: '图片上传成功', icon: 'success' })
  } catch (e) {
    console.error('[item-form] 上传参考图片失败', e)
    const msg = e && e.message ? e.message : '上传失败'
    uni.showToast({ title: msg, icon: 'none' })
  } finally {
    uploading.value = false
    setTimeout(function () {
      uploadProgress.value = 0
      uploadStatusText.value = ''
    }, 500)
  }
}

function previewRefImage (url) {
  uni.previewImage({
    current: url,
    urls: form.ref_images
  })
}

function removeRefImage (index) {
  uni.showModal({
    title: '提示',
    content: '确定删除这张图片吗？',
    success (res) {
      if (res.confirm) {
        form.ref_images.splice(index, 1)
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    }
  })
}

/** 保存（新增 / 编辑） */
async function handleSave () {
  if (!isLogin.value) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }

  if (!validateForm()) return

  const token = uni.getStorageSync('token') || ''
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }

  const subjectText = (form.work_subject || '').trim()
  const subjectGoodsIdForSave = headMode.value === 'select'
    ? (form.subject_goods_id || 0)
    : 0

  const addonTitles = selectedAddonIndexes.value
    .map(function (idx) {
      return addonOptions.value[idx] && addonOptions.value[idx].title
    })
    .filter(function (t) { return !!t })

  saving.value = true
  try {
    uni.showLoading({ title: '保存中...', mask: true })

    console.log('[item-form] handleSave isEdit=', isEdit.value, 'itemId=', itemId.value)

    if (isEdit.value) {
      const payload = {
        item_id: itemId.value,
        subject_goods_id: subjectGoodsIdForSave,
        work_subject: subjectText,
        size: (form.size || '').trim(),
        ref_images: Array.isArray(form.ref_images) ? form.ref_images : [],
        tier_title: (form.tier_title || '').trim(),
        addons: addonTitles,
        remark: (form.remark || '').trim()
      }
      console.log('[item-form] update payload=', payload)

      const res = await uni.request({
        url: websiteUrl.value + '/with-state/artist-order/item/update',
        method: 'POST',
        header: {
          Authorization: token,
          'Content-Type': 'application/json'
        },
        data: payload
      })

      const body = res.data || {}
      console.log('[item-form] update response body=', body)
      if (String(body.status).toLowerCase() !== 'success') {
        uni.showToast({ title: body.msg || '保存失败', icon: 'none' })
        return
      }

      saveHeadModeSnapshot()

      uni.showToast({
        title: '保存成功',
        icon: 'none'
      })
    } else {
      const createPayload = {
        plan_id: planId.value,
        subject_goods_id: subjectGoodsIdForSave,
        work_subject: subjectText,
        size: (form.size || '').trim(),
        ref_images: Array.isArray(form.ref_images) ? form.ref_images : [],
        tier_title: (form.tier_title || '').trim(),
        addons: addonTitles,
        remark: (form.remark || '').trim()
      }

      console.log('[item-form] create payload=', createPayload)

      const createRes = await uni.request({
        url: websiteUrl.value + '/with-state/artist-order/item/create',
        method: 'POST',
        header: {
          Authorization: token,
          'Content-Type': 'application/json'
        },
        data: createPayload
      })

      const createBody = createRes.data || {}
      console.log('[item-form] create response body=', createBody)
      if (String(createBody.status).toLowerCase() !== 'success') {
        uni.showToast({ title: createBody.msg || '保存失败', icon: 'none' })
        return
      }

      const newItemId = Number(createBody.data && createBody.data.item_id || 0)
      if (!newItemId) {
        uni.showToast({ title: '返回的子项 ID 异常', icon: 'none' })
        return
      }

      itemId.value = newItemId
      saveHeadModeSnapshot()

      if (submissionId.value > 0) {
        const attachRes = await uni.request({
          url: websiteUrl.value + '/with-state/artist-order/item/attach',
          method: 'POST',
          header: {
            Authorization: token,
            'Content-Type': 'application/json'
          },
          data: {
            submission_id: submissionId.value,
            item_ids: [newItemId]
          }
        })

        const attachBody = attachRes.data || {}
        console.log('[item-form] attach response body=', attachBody)
        if (String(attachBody.status).toLowerCase() !== 'success') {
          uni.showToast({ title: attachBody.msg || '绑定失败', icon: 'none' })
          return
        }
      }

      uni.showToast({
        title: '新增成功',
        icon: 'none'
      })
    }

    uni.hideLoading()

    setTimeout(function () {
      uni.navigateBack({ delta: 1 })
    }, 500)
  } catch (e) {
    console.error('[item-form] 保存 submission item 失败', e)
    uni.hideLoading()
    uni.showToast({ title: '网络异常，保存失败', icon: 'none' })
  } finally {
    saving.value = false
  }
}

/** ====== 生命周期 ====== */
onLoad(function (q) {
  q = q || {}
  console.log('[item-form] onLoad q=', q)
  uni.setNavigationBarTitle({ title: '新增投递' })

  submissionId.value = Number(q.submission_id || 0)
  itemId.value = Number(q.item_id || q.submission_item_id || 0)
  planId.value = Number(q.plan_id || q.order_plan_id || 0)

  console.log('[item-form] onLoad parsed submissionId=', submissionId.value, 'itemId=', itemId.value, 'planId=', planId.value)

  if (itemId.value) {
    loadHeadModeSnapshot()
  }

  const goodsIdFromQuery = Number(q.goods_id || 0)
  if (goodsIdFromQuery) {
    form.subject_goods_id = goodsIdFromQuery
    if (!hasHeadModeFromStorage.value) {
      headMode.value = 'select'
    }
  }

  if (planId.value) {
    fetchPlanInfo()
  }

  if (itemId.value) {
    fetchItem(true)
  }
})

onShow(function () {
  console.log('[item-form] onShow enter, current itemId=', itemId.value, 'planId=', planId.value, 'submissionId=', submissionId.value)

  // H5 场景里，同一路径不同 query 会复用组件，在这里再同步一遍当前路由的参数
  syncRouteParamsFromCurrentPage()

  console.log('[item-form] onShow after sync, itemId=', itemId.value, 'planId=', planId.value, 'submissionId=', submissionId.value)

  // ★ 修正点：只有当前 item 还没加载过的时候才重新拉详情，
  // 避免从子页面返回时再次切换到「加载中」导致 ResizeSensor 报错、
  // 以及覆盖从娃柜/品牌页带回来的本地修改
  if (isEdit.value && !hasLoadedItem.value) {
    fetchItem(true)
  }

  // 娃柜选择的兜底回传（H5 / 其他端通过 storage）
  try {
    const cached = uni.getStorageSync('__pickedMyItemFromStock')
    if (cached && cached.id) {
      console.log('[item-form] onShow found cached __pickedMyItemFromStock=', cached)
      applyPickedCabinetItem(cached)
      uni.removeStorageSync('__pickedMyItemFromStock')
    }
  } catch (e) {
    console.log('[item-form] onShow read __pickedMyItemFromStock error', e)
  }
})
</script>

<style scoped>
.item-form-page {
  min-height: 100vh;
  background: #f6f7fb;
}

/* 滚动容器 */
.scroll-body {
  height: 100vh;
}

/* 主体内容 */
.content {
  padding-bottom: 40rpx;
}

/* ====== 通用卡片 ====== */
.card {
  margin: 24rpx 24rpx 0;
  padding: 24rpx;
  background: #ffffff;
  border-radius: 20rpx;
  box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.06);
}

.card-header {
  margin-bottom: 16rpx;
}
.card-title {
  font-size: 28rpx;
  color: #222;
  font-weight: 600;
}
.card-sub {
  font-size: 24rpx;
  color: #999;
  margin-top: 4rpx;
  margin: 10px;
}

/* ====== 字段行 ====== */
.field-row {
  margin-top: 12rpx;
}
.field-row:first-of-type {
  margin-top: 0;
}

.field-label {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}
.label-text {
  font-size: 26rpx;
  color: #555;
}
.label-required {
  margin-left: 6rpx;
  font-size: 26rpx;
  color: #f43f5e;
}

.field-control {
  background: #f7f8fc;
  border-radius: 14rpx;
  padding: 16rpx 18rpx;
  border: 1rpx solid transparent;
}
.field-input {
  width: 100%;
  font-size: 26rpx;
  color: #111827;
}

/* 娃头模式切换 */
.head-mode-toggle {
  display: flex;
  gap: 16rpx;
  margin-bottom: 12rpx;
}
.head-mode-chip {
  flex: 1;
  text-align: center;
  padding: 12rpx 0;
  border-radius: 999rpx;
  font-size: 24rpx;
  color: #6b7280;
  background: #f9fafb;
}
.head-mode-chip.active {
  background: #8afdff;
  color: #000000;
}

/* 价格行 */
.price-row {
  display: flex;
  align-items: center;
}
.price-row .field-input[disabled] {
  color: #6b7280;
}
.price-hint {
  margin-top: 6rpx;
}
.price-hint-text {
  font-size: 22rpx;
  color: #9ca3af;
}

/* 文本域 */
.field-textarea-row .field-control {
  padding: 12rpx 18rpx 8rpx;
}
.field-textarea {
  width: 100%;
  min-height: 140rpx;
  font-size: 26rpx;
  color: #111827;
  line-height: 1.7;
}
.textarea-count {
  text-align: right;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #9ca3af;
}

/* plan 选项行 */
.plan-row {
  margin-top: 18rpx;
}
.plan-row-label {
  margin-bottom: 8rpx;
}
.plan-row-title {
  font-size: 24rpx;
  color: #374151;
  font-weight: 500;
}

/* 芯片列表 */
.chip-list {
  flex-direction: row;
  flex-wrap: wrap;
  display: flex;
  gap: 12rpx;
}
.chip {
  padding: 20rpx 30rpx;
  /* border-radius: 999rpx; */
  /* border: 1rpx solid #d1d5db; */
  background: #f9fafb;
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
}
.chip-column {
  border-radius: 14rpx;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
}
.chip-line {
  display: flex;
  align-items: center;
  gap: 8rpx;
}
.chip-main {
  font-size: 24rpx;
  color: #374151;
}
.chip-tag {
  font-size: 22rpx;
  color: #2563eb;
}
.chip-desc {
  margin-top: 4rpx;
  font-size: 22rpx;
  color: #6b7280;
}
.chip.active {
  background: #def3ff;
}

/* 娃头选择触发区域 */
.relation-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.rt-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
  min-width: 0;
}
.thumb {
  width: 72rpx;
  height: 72rpx;
  border-radius: 12rpx;
  background: #e5e7eb;
}
.rt-texts {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.selected-text {
  font-size: 26rpx;
  color: #111827;
}
.placeholder-text {
  font-size: 26rpx;
  color: #9ca3af;
}
.sub-text {
  font-size: 22rpx;
  color: #9ca3af;
  margin-top: 4rpx;
}

/* 手动模式下的输入 */
.manual-trigger {
  padding-right: 18rpx;
}
.manual-input {
  border: none;
  background: transparent;
  padding: 0;
}

/* 参考图片上传区域 */
.image-field {
  padding: 16rpx 10rpx 10rpx;
}

.upload-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}
.image-preview {
  width: 200rpx;
  height: 200rpx;
  border-radius: 12rpx;
  overflow: hidden;
  position: relative;
}
.preview-img {
  width: 100%;
  height: 100%;
}
.image-actions {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: space-around;
  padding: 12rpx 0;
}
.upload-btn {
  width: 200rpx;
  height: 200rpx;
  border: 2rpx dashed #ddd;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #f9f9f9;
}
.upload-text {
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
}
.upload-progress {
  margin-top: 20rpx;
  padding: 20rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
}
.upload-progress progress {
  width: 100%;
  margin-bottom: 10rpx;
}
.upload-status {
  display: block;
  text-align: center;
  font-size: 24rpx;
  color: #666;
}

/* 提示文本 */
.hint-box {
  margin: 18rpx 24rpx 0;
}
.hint-text {
  font-size: 24rpx;
  color: #888;
  line-height: 1.7;
}

/* ====== 底部操作栏 ====== */
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 10rpx 24rpx calc(22rpx + env(safe-area-inset-bottom));
  display: flex;
  justify-content: center;
}

.save-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 999rpx;
  border: none;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(90deg, #89d4ff 0%, #abe1ff 45%, #d5cbff 75%, #8afdff 100%);
  box-shadow: 0 0.1875rem 0.625rem rgba(24, 144, 255, 0.25);
  border: none;
  box-shadow: 0 6rpx 20rpx rgba(24, 144, 255, 0.25);
}
.save-btn::after {
  border: none;
}
.save-text {
  font-size: 28rpx;
  color: #374151;
  font-weight: 700;
}

/* ====== 通用状态视图 ====== */
.state-box {
  margin: 120rpx 24rpx 0;
  padding: 24rpx;
  text-align: center;
  color: #555;
}
.state-title {
  font-size: 30rpx;
  font-weight: 600;
  margin-bottom: 8rpx;
}
.state-desc {
  font-size: 24rpx;
  color: #888;
}
.state-error .state-title {
  color: #f43f5e;
}
.primary-btn {
  margin-top: 20rpx;
  border-radius: 999rpx;
  padding: 10rpx 40rpx;
  font-size: 26rpx;
  background: linear-gradient(
    90deg,
    #89d4ff 0%,
    #64c7ff 45%,
    #2fb1ff 75%,
    #1499f0 100%
  );
  color: #ffffff;
}

/* 隐藏 H5 滚动条 */
::-webkit-scrollbar {
  width: 0 !important;
  height: 0 !important;
  background: transparent !important;
  display: none !important;
}
</style>
