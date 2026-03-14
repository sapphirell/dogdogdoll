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
            <text class="card-title">{{ basicInfoTitle }}</text>
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
                    {{ selectHeadPlaceholder }}
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
                    {{ cabinetHeadPlaceholder }}
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
                    :placeholder="manualHeadPlaceholder"
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

          <!-- 毛娘专用：毛坯提供方式 -->
          <view v-if="showBlankSupplySection" class="plan-row">
            <view class="plan-row-label">
              <text class="plan-row-title">毛坯提供方式</text>
            </view>
            <view class="chip-list">
              <view
                v-for="option in blankOptions"
                :key="option.key"
                class="chip chip-column blank-chip"
                :class="[
                  { active: form.blank_supply_mode === option.key },
                  option.chipClass,
                  { 'blank-chip-with-panel': option.key === 'self' && form.blank_supply_mode === 'self' }
                ]"
                @click="selectBlankSupplyMode(option.key)"
              >
                <view class="chip-line">
                  <text class="chip-main font-alimamashuhei">{{ option.label }}</text>
                </view>
                <text class="chip-desc">{{ option.desc }}</text>

                <view
                  v-if="option.key === 'self' && form.blank_supply_mode === 'self'"
                  class="blank-inline-panel"
                  @click.stop
                >
                  <text class="blank-helper-text">请上传毛坯图片，方便毛娘提前判断毛坯状态、颜色和可操作空间。</text>
                  <view class="field-control image-field blank-image-field">
                    <view class="upload-container">
                      <view
                        v-for="(img, index) in form.blank_image_urls"
                        :key="`blank-${index}`"
                        class="image-preview"
                      >
                        <image :src="img" mode="aspectFill" class="preview-img" />
                        <view class="image-actions">
                          <uni-icons
                            type="eye"
                            size="20"
                            color="#fff"
                            @click.stop="previewBlankImage(img)"
                          />
                          <uni-icons
                            type="trash"
                            size="20"
                            color="#fff"
                            @click.stop="removeBlankImage(index)"
                          />
                        </view>
                      </view>

                      <view
                        v-if="form.blank_image_urls.length < 3"
                        class="upload-btn"
                        @click="handleUploadBlankImages"
                      >
                        <uni-icons type="plus" size="32" color="#999" />
                        <text class="upload-text">添加毛坯图</text>
                      </view>
                    </view>
                  </view>

                  <view class="field-row field-textarea-row blank-textarea-row">
                    <view class="field-label">
                      <text class="label-text">毛坯介绍</text>
                    </view>
                    <view class="field-control">
                      <textarea
                        v-model.trim="form.blank_intro"
                        class="field-textarea"
                        maxlength="300"
                        placeholder="可填写毛坯来源、颜色、是否修剪过等信息"
                      />
                      <view class="textarea-count">
                        <text>{{ form.blank_intro.length }}/300</text>
                      </view>
                    </view>
                  </view>
                </view>
              </view>
            </view>

            <view v-if="form.blank_supply_mode === 'stock'" class="blank-panel">
              <view class="blank-panel-body">
                <view v-if="hasPickedStockBlank" class="picked-blank-card">
                  <common-image
                    class="picked-blank-cover"
                    :src="pickedStockBlank.cover_image || firstBlankStockImage || '/static/default-goods.png'"
                    width="112"
                    height="112"
                    radius="12"
                    mode="aspectFill"
                  />
                  <view class="picked-blank-main">
                    <text class="picked-blank-name font-alimamashuhei">{{ pickedStockBlank.blank_name || '已选毛坯' }}</text>
                    <text class="picked-blank-meta">头围：{{ pickedStockBlank.head_circumference || '未填写' }}</text>
                    <view class="picked-blank-price font-title">¥{{ formatStockBlankPrice(pickedStockBlank.price) }}</view>
                  </view>
                </view>

                <view class="stock-pick-actions">
                  <view class="stock-pick-btn stock-pick-primary" @click="goPickStockBlank">
                    {{ hasPickedStockBlank ? '更换毛坯' : '去选择毛坯' }}
                  </view>
                  <view
                    v-if="hasPickedStockBlank"
                    class="stock-pick-btn stock-pick-remove"
                    @click="removePickedStockBlank"
                  >
                    移除
                  </view>
                </view>
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
import { ref, reactive, computed, watch } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { websiteUrl } from '@/common/config.js'
import { chooseImageList, getQiniuToken, uploadImageToQiniu } from '@/common/image.js'

/** ====== 路由参数 ====== */
const submissionId = ref(0)
const itemId = ref(0)
const planId = ref(0)

/** 用于检测 URL 是否变化（含 query） */
const lastRouteKey = ref('')

/** ====== “每次 onShow 刷新”下，为避免覆盖未保存本地改动：脏标记 + 应用锁 ====== */
const isApplyingServerData = ref(false)
const dirty = reactive({
  work_subject: false,
  size: false,
  tier_title: false,
  remark: false,
  subject_goods_id: false,
  ref_images: false,
  blank_supply_mode: false,
  blank_image_urls: false,
  blank_intro: false,
  blank_stock: false,
  headMode: false,
  addons: false,
  displayGoods: false,
  displayCabinet: false
})

function resetDirtyFlags () {
  Object.keys(dirty).forEach(function (k) {
    dirty[k] = false
  })
}
function withApplyingLock (fn) {
  isApplyingServerData.value = true
  try {
    fn && fn()
  } finally {
    isApplyingServerData.value = false
  }
}
function markDirty (key) {
  if (key && Object.prototype.hasOwnProperty.call(dirty, key)) {
    dirty[key] = true
  }
}

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
      withApplyingLock(function () {
        headMode.value = snap
      })
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
const hasLoadedItem = ref(false)

const form = reactive({
  work_subject: '',
  size: '',
  tier_title: '',
  price_text: '',
  remark: '',
  subject_goods_id: 0,
  ref_images: [],
  blank_supply_mode: '',
  blank_image_urls: [],
  blank_intro: '',
  blank_stock_id: 0,
  blank_stock_snapshot: null
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
const sizeOptions = ref([])
const tierOptions = ref([])
const addonOptions = ref([])
const planArtistType = ref(0)
const planBlankSupport = reactive({
  self: false,
  third: false,
  stock: false
})
const planConfigLoaded = ref(false)

const selectedSizeIndex = ref(-1)
const selectedTierIndex = ref(-1)
const selectedAddonIndexes = ref([])
const rawAddonTitles = ref([])

const isHairPlan = computed(() => Number(planArtistType.value) === 2)
const basicInfoTitle = computed(() => {
  return isHairPlan.value ? '选择佩戴假毛的头' : '选择投妆的娃头'
})
const selectHeadPlaceholder = computed(() => {
  return isHairPlan.value ? '请选择佩戴假毛的娃头' : '请选择投妆娃头'
})
const cabinetHeadPlaceholder = computed(() => {
  return isHairPlan.value ? '从娃柜中选择佩戴假毛的娃头' : '从娃柜中选择投妆娃头'
})
const manualHeadPlaceholder = computed(() => {
  return isHairPlan.value ? '请填写佩戴假毛的娃头名称' : '请填写投妆娃头名称'
})
const blankOptions = computed(() => {
  if (!isHairPlan.value) return []
  const rows = [
    {
      key: 'self',
      label: '自带毛坯',
      desc: '买家自带毛坯并寄送，毛娘按实物制作。',
      chipClass: 'blank-chip--self',
      enabled: !!planBlankSupport.self
    },
    {
      key: 'third',
      label: '指定购买毛坯',
      desc: '毛娘会提供给您购买第三方店铺毛坯的链接。',
      chipClass: 'blank-chip--third',
      enabled: !!planBlankSupport.third
    },
    {
      key: 'stock',
      label: '选购现有毛坯',
      desc: '在毛娘已有毛坯里选购，选中后会自动回填到投递信息。',
      chipClass: 'blank-chip--stock',
      enabled: !!planBlankSupport.stock
    }
  ]
  return rows.filter(function (row) { return row.enabled })
})
const showBlankSupplySection = computed(() => {
  return isHairPlan.value && blankOptions.value.length > 0
})
const pickedStockBlank = computed(() => {
  return normalizeBlankStockSnapshot(form.blank_stock_snapshot)
})
const hasPickedStockBlank = computed(() => {
  return Number(form.blank_stock_id || 0) > 0
})
const firstBlankStockImage = computed(() => {
  const snapshot = pickedStockBlank.value
  if (!snapshot || !Array.isArray(snapshot.image_urls) || !snapshot.image_urls.length) return ''
  return snapshot.image_urls[0]
})

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

/** ====== Watch：标记用户本地改动（用于刷新时不覆盖） ====== */
watch(() => form.work_subject, () => {
  if (isApplyingServerData.value) return
  markDirty('work_subject')
})
watch(() => form.size, () => {
  if (isApplyingServerData.value) return
  markDirty('size')
})
watch(() => form.tier_title, () => {
  if (isApplyingServerData.value) return
  markDirty('tier_title')
})
watch(() => form.remark, () => {
  if (isApplyingServerData.value) return
  markDirty('remark')
})
watch(() => form.subject_goods_id, () => {
  if (isApplyingServerData.value) return
  markDirty('subject_goods_id')
  markDirty('displayGoods')
})
watch(() => (Array.isArray(form.ref_images) ? form.ref_images.slice() : []), () => {
  if (isApplyingServerData.value) return
  markDirty('ref_images')
})
watch(() => form.blank_supply_mode, () => {
  if (isApplyingServerData.value) return
  markDirty('blank_supply_mode')
})
watch(() => (Array.isArray(form.blank_image_urls) ? form.blank_image_urls.slice() : []), () => {
  if (isApplyingServerData.value) return
  markDirty('blank_image_urls')
})
watch(() => form.blank_intro, () => {
  if (isApplyingServerData.value) return
  markDirty('blank_intro')
})
watch(() => form.blank_stock_id, () => {
  if (isApplyingServerData.value) return
  markDirty('blank_stock')
})
watch(() => form.blank_stock_snapshot, () => {
  if (isApplyingServerData.value) return
  markDirty('blank_stock')
}, { deep: true })
watch(() => headMode.value, () => {
  if (isApplyingServerData.value) return
  markDirty('headMode')
})

/** ====== 重置整条记录的状态（当切换 itemId / planId / submissionId 时用） ====== */
function resetStateForNewItem () {
  console.log('[item-form] resetStateForNewItem, oldItemId=', itemId.value)

  loading.value = false
  saving.value = false
  errorMsg.value = ''
  hasLoadedItem.value = false

  withApplyingLock(function () {
    form.work_subject = ''
    form.size = ''
    form.tier_title = ''
    form.price_text = ''
    form.remark = ''
    form.subject_goods_id = 0
    form.ref_images = []
    form.blank_supply_mode = ''
    form.blank_image_urls = []
    form.blank_intro = ''
    form.blank_stock_id = 0
    form.blank_stock_snapshot = null
  })

  selectedBrand.value = {}
  selectedGoods.value = {}
  cabinetItem.value = null

  sizeOptions.value = []
  tierOptions.value = []
  addonOptions.value = []
  planArtistType.value = 0
  planBlankSupport.self = false
  planBlankSupport.third = false
  planBlankSupport.stock = false
  planConfigLoaded.value = false

  selectedSizeIndex.value = -1
  selectedTierIndex.value = -1
  selectedAddonIndexes.value = []
  rawAddonTitles.value = []

  uploading.value = false
  uploadProgress.value = 0
  uploadStatusText.value = ''

  withApplyingLock(function () {
    headMode.value = 'select'
  })
  hasHeadModeFromStorage.value = false

  resetDirtyFlags()
}

/** ====== URL / Query 解析（不要只信 cur.options） ====== */
function buildStableQueryString (opts) {
  opts = opts || {}
  const keys = Object.keys(opts).sort()
  return keys.map(function (k) {
    return String(k) + '=' + String(opts[k])
  }).join('&')
}

function safeGetH5Hash () {
  try {
    if (typeof window !== 'undefined' && window.location) return window.location.hash || ''
    if (typeof location !== 'undefined') return location.hash || ''
  } catch (e) {}
  return ''
}

function parseQueryStringToObj (qs) {
  const out = {}
  if (!qs) return out
  const s = String(qs).replace(/^\?/, '')
  if (!s) return out

  s.split('&').forEach(function (pair) {
    if (!pair) return
    const idx = pair.indexOf('=')
    const k = idx >= 0 ? pair.slice(0, idx) : pair
    const v = idx >= 0 ? pair.slice(idx + 1) : ''
    const key = decodeURIComponent((k || '').trim())
    if (!key) return
    const val = decodeURIComponent(String(v || '').replace(/\+/g, ' '))
    out[key] = val
  })
  return out
}

function extractQueryFromUrl (urlLike) {
  const s = String(urlLike || '')
  const qIdx = s.indexOf('?')
  if (qIdx < 0) return { base: s, query: {} }
  const base = s.slice(0, qIdx)
  const tail = s.slice(qIdx + 1)
  const qs = tail.split('#')[0]
  return { base, query: parseQueryStringToObj(qs) }
}

function getCurrentPageSnapshot () {
  let pages = []
  try {
    pages = getCurrentPages && getCurrentPages()
  } catch (e) {
    console.log('[item-form] getCurrentPages error', e)
  }
  const cur = pages && pages.length ? pages[pages.length - 1] : null

  const rawOpts = (cur && cur.options) || (cur && cur.$page && cur.$page.options) || {}
  const route = (cur && (cur.route || (cur.$page && cur.$page.route))) || ''
  const fullPath = (cur && cur.$page && cur.$page.fullPath) ? cur.$page.fullPath : ''

  const h5Hash = safeGetH5Hash()
  const hashParsed = h5Hash ? extractQueryFromUrl(h5Hash) : null
  const fullParsed = fullPath ? extractQueryFromUrl(fullPath) : null

  const mergedOpts = Object.assign(
    {},
    rawOpts || {},
    (fullParsed && fullParsed.query) ? fullParsed.query : {},
    (hashParsed && hashParsed.query) ? hashParsed.query : {}
  )

  const key = h5Hash
    ? String(h5Hash)
    : (fullPath
        ? String(fullPath)
        : (String(route) + '?' + buildStableQueryString(mergedOpts)))

  return { opts: mergedOpts, route, fullPath, key }
}

/** 将 options 应用到页面，并在“URL 变化”时强制刷新内容 */
function applyRouteOptionsAndRefresh (opts, reason) {
  opts = opts || {}

  const newSubmissionId = Number(opts.submission_id || 0)
  const newItemId = Number(opts.item_id || opts.submission_item_id || 0)
  const newPlanId = Number(opts.plan_id || opts.order_plan_id || 0)
  const goodsIdFromQuery = Number(opts.goods_id || 0)

  const needReset =
    (newItemId !== itemId.value) ||
    (newPlanId !== planId.value) ||
    (newSubmissionId !== submissionId.value)

  console.log('[item-form] applyRouteOptionsAndRefresh reason=', reason,
    'opts=', opts,
    'needReset=', needReset,
    'prev={submissionId,itemId,planId}=', submissionId.value, itemId.value, planId.value,
    'next={submissionId,itemId,planId}=', newSubmissionId, newItemId, newPlanId,
    'goodsIdFromQuery=', goodsIdFromQuery
  )

  if (needReset) {
    try { uni.removeStorageSync('__pickedMyItemFromStock') } catch (e) {}
    resetStateForNewItem()
  }

  submissionId.value = newSubmissionId
  itemId.value = newItemId
  planId.value = newPlanId

  try {
    uni.setNavigationBarTitle({ title: itemId.value ? '编辑投递' : '新增投递' })
  } catch (e) {}

  if (itemId.value) {
    loadHeadModeSnapshot()
  }

  if (!itemId.value && goodsIdFromQuery) {
    withApplyingLock(function () {
      form.subject_goods_id = goodsIdFromQuery
      if (!hasHeadModeFromStorage.value) {
        headMode.value = 'select'
      }
    })
  }

  if (planId.value) {
    fetchPlanInfo()
  }

  if (itemId.value) {
    hasLoadedItem.value = false
    fetchItem(true, { silent: false })
  }
}

/** 切换娃头模式 */
function switchHeadMode (mode) {
  if (headMode.value === mode) return
  console.log('[item-form] switchHeadMode from', headMode.value, 'to', mode, 'itemId=', itemId.value)

  headMode.value = mode
  markDirty('headMode')

  if (mode !== 'select') {
    form.subject_goods_id = 0
    selectedGoods.value = {}
    selectedBrand.value = {}
    markDirty('subject_goods_id')
    markDirty('displayGoods')
  }

  if (mode !== 'cabinet') {
    cabinetItem.value = null
    markDirty('displayCabinet')
  }

  saveHeadModeSnapshot()
}

/** 选娃头入口（分步选择：品牌->商品） */
function goPickHead () {
  if (headMode.value !== 'select') {
    headMode.value = 'select'
    saveHeadModeSnapshot()
  }

  console.log('[item-form] goPickHead itemId=', itemId.value)

  uni.$once('associate:done', (payload) => {
    console.log('[item-form] associate:done payload=', payload)

    const brandInfo = payload && payload.brand
    const goodsInfo = payload && payload.goods

    selectedBrand.value = brandInfo || {}
    selectedGoods.value = goodsInfo || {}
    markDirty('displayGoods')

    if (goodsInfo && goodsInfo.id) {
      form.subject_goods_id = goodsInfo.id
      form.work_subject = goodsInfo.name || ''

      if (goodsInfo.cover) {
        form.ref_images = [goodsInfo.cover]
      }
      markDirty('subject_goods_id')
      markDirty('work_subject')
      markDirty('ref_images')
    }

    saveHeadModeSnapshot()
  })

  uni.navigateTo({
    url: '/pkg-common/brand-pick/brand-pick?scene=head',
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
  markDirty('displayCabinet')

  const name = payload.name || payload.title || ''
  if (name) {
    form.work_subject = name
    markDirty('work_subject')
  }
  if (payload.image) {
    form.ref_images = [payload.image]
    markDirty('ref_images')
  }

  headMode.value = 'cabinet'
  markDirty('headMode')
  saveHeadModeSnapshot()
}

/** 选购现有毛坯入口 */
function goPickStockBlank () {
  if (!planId.value) {
    uni.showToast({ title: '缺少接单计划，无法选择毛坯', icon: 'none' })
    return
  }
  if (!showBlankSupplySection.value) {
    uni.showToast({ title: '当前开单未开启毛坯选购', icon: 'none' })
    return
  }
  if (form.blank_supply_mode !== 'stock') {
    form.blank_supply_mode = 'stock'
  }
  const selectedId = Number(form.blank_stock_id || 0)
  uni.$once('artist-order:pick-blank-stock', function (payload) {
    applyPickedStockBlank(payload)
  })
  uni.navigateTo({
    url: `/pkg-creator/creator_order/blank_stock_pick/blank_stock_pick?plan_id=${planId.value}&selected_id=${selectedId}`
  })
}

/** 应用选中的现有毛坯 */
function applyPickedStockBlank (payload) {
  const snapshot = normalizeBlankStockSnapshot(payload)
  if (!snapshot) return
  withApplyingLock(function () {
    form.blank_stock_id = snapshot.id
    form.blank_stock_snapshot = snapshot
    if (!snapshot.cover_image && Array.isArray(snapshot.image_urls) && snapshot.image_urls.length) {
      form.blank_image_urls = [snapshot.image_urls[0]]
    } else if (snapshot.cover_image) {
      form.blank_image_urls = [snapshot.cover_image]
    }
    form.blank_supply_mode = 'stock'
  })
  markDirty('blank_stock')
  triggerRecalcPrice()
  uni.showToast({ title: '已选择毛坯', icon: 'none' })
}

/** 移除已选现有毛坯 */
function removePickedStockBlank () {
  withApplyingLock(function () {
    form.blank_stock_id = 0
    form.blank_stock_snapshot = null
    if (form.blank_supply_mode === 'stock') {
      form.blank_image_urls = []
      form.blank_intro = ''
    }
  })
  markDirty('blank_stock')
  triggerRecalcPrice()
}

/** ====== 数据归一化：ref_images / addons_json ====== */
function safeJsonParse (s) {
  try { return JSON.parse(s) } catch (e) { return null }
}

function normalizeRefImages (val) {
  // 目标：返回 string[]
  if (!val) return []

  // 1) 已经是数组
  if (Array.isArray(val)) {
    return val
      .map(function (x) {
        if (!x) return ''
        if (typeof x === 'string') return x.trim()
        if (typeof x === 'object' && x.url) return String(x.url).trim()
        return String(x).trim()
      })
      .filter(Boolean)
  }

  // 2) 字符串：可能是单 URL / 逗号分隔 / JSON 数组字符串
  if (typeof val === 'string') {
    const s = val.trim()
    if (!s) return []

    // 2.1 JSON 数组字符串： "[]" / ["a","b"]
    if ((s.startsWith('[') && s.endsWith(']')) || (s.startsWith('{') && s.endsWith('}'))) {
      const parsed = safeJsonParse(s)
      if (Array.isArray(parsed)) {
        return parsed
          .map(function (x) { return (x ? String(x).trim() : '') })
          .filter(Boolean)
      }
      // 如果是对象而不是数组，继续走兜底 split
    }

    // 2.2 逗号/换行分隔
    const parts = s
      .split(/[\s,]+/g)
      .map(function (x) { return (x || '').trim() })
      .filter(Boolean)

    // 如果只有一个且看起来像 URL，直接返回
    return parts
  }

  // 3) 其他类型兜底
  try {
    return [String(val).trim()].filter(Boolean)
  } catch (e) {
    return []
  }
}

function looksLikeBase64 (s) {
  if (!s) return false
  const t = String(s).trim()
  if (!t) return false
  // base64 一般只含这些字符且长度为 4 的倍数（不强制）
  return /^[A-Za-z0-9+/=]+$/.test(t)
}

/** 解析 addons_json：兼容 "[]"（纯 JSON 字符串）以及 Base64(JSON) 两种 */
function decodeAddonsJson (str) {
  if (!str) return []
  const s = String(str).trim()
  if (!s) return []

  // 1) 直接就是 JSON
  if ((s.startsWith('[') && s.endsWith(']')) || (s.startsWith('{') && s.endsWith('}'))) {
    const parsed = safeJsonParse(s)
    return Array.isArray(parsed) ? parsed : []
  }

  // 2) Base64(JSON)
  try {
    if (typeof atob !== 'function') return []
    if (!looksLikeBase64(s)) return []
    const text = decodeURIComponent(escape(atob(s)))
    const arr = safeJsonParse(text)
    return Array.isArray(arr) ? arr : []
  } catch (e) {
    console.error('[item-form] decodeAddonsJson failed', e, 'raw=', s)
    return []
  }
}

function normalizeBlankSupplyMode (mode) {
  const value = String(mode || '').trim()
  if (value === 'self' || value === 'third' || value === 'stock') {
    return value
  }
  return ''
}

function normalizeBlankStockSnapshot (raw) {
  if (!raw || typeof raw !== 'object') return null
  const id = Number(raw.id || raw.blank_stock_id || 0)
  if (!id) return null
  const imageURLs = Array.isArray(raw.image_urls) ? raw.image_urls : normalizeRefImages(raw.image_urls)
  return {
    id,
    blank_name: String(raw.blank_name || '').trim(),
    price: Number(raw.price || 0),
    head_circumference: String(raw.head_circumference || '').trim(),
    quantity: Number(raw.quantity || 0),
    cover_image: String(raw.cover_image || '').trim(),
    image_urls: imageURLs
  }
}

function decodeHtmlEntities (text) {
  const raw = String(text || '')
  if (!raw) return ''
  let decoded = raw
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, '\'')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
  // 兼容十进制字符实体：如 &#34;
  decoded = decoded.replace(/&#(\d+);/g, function (_, code) {
    const n = Number(code)
    if (!Number.isFinite(n)) return _
    return String.fromCharCode(n)
  })
  // 兼容十六进制字符实体：如 &#x22;
  decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, function (_, code) {
    const n = Number.parseInt(code, 16)
    if (!Number.isFinite(n)) return _
    return String.fromCharCode(n)
  })
  return decoded
}

function parseBlankStockSnapshot (text) {
  let raw = decodeHtmlEntities(text).trim()
  if (!raw) return null

  for (let i = 0; i < 2; i++) {
    try {
      const parsed = JSON.parse(raw)
      const normalized = normalizeBlankStockSnapshot(parsed)
      if (normalized) return normalized
      if (typeof parsed === 'string') {
        raw = decodeHtmlEntities(parsed).trim()
        continue
      }
      return null
    } catch (e) {
      if (raw.startsWith('"') && raw.endsWith('"')) {
        raw = raw.slice(1, -1).replace(/\\"/g, '"').trim()
        continue
      }
      return null
    }
  }
  return null
}

// buildBlankStockSnapshotFromRaw 兜底还原“现有毛坯”快照，兼容历史数据只返回 blank_stock_id 的情况。
function buildBlankStockSnapshotFromRaw (raw) {
  if (!raw || typeof raw !== 'object') return null

  const fromIntro = parseBlankStockSnapshot(raw.blank_intro || '')
  if (fromIntro) return fromIntro

  const fromObject = normalizeBlankStockSnapshot(
    raw.blank_stock_snapshot || raw.blank_stock || null
  )
  if (fromObject) return fromObject

  const stockId = Number(raw.blank_stock_id || 0)
  if (stockId <= 0) return null

  const imageURLs = normalizeRefImages(raw.blank_image_urls || raw.blank_stock_image_urls || '')
  const coverImage = String(
    raw.blank_cover_image ||
    raw.cover_image ||
    (imageURLs[0] || '')
  ).trim()
  const fallback = {
    id: stockId,
    blank_name: String(raw.blank_name || raw.blank_stock_name || '').trim() || ('已选毛坯 #' + stockId),
    price: Number(raw.blank_stock_price || 0),
    head_circumference: String(raw.blank_head_circumference || '').trim(),
    quantity: Number(raw.blank_stock_quantity || 0),
    cover_image: coverImage,
    image_urls: imageURLs
  }
  return normalizeBlankStockSnapshot(fallback)
}

function formatStockBlankPrice (v) {
  const n = Number(v || 0)
  if (!Number.isFinite(n)) return '0.00'
  return n.toFixed(2)
}

function normalizePlanBlankSupport (cfg) {
  const extra = (cfg && cfg.extra) || {}
  planBlankSupport.self = !!extra.support_self_blank
  planBlankSupport.third = !!extra.support_third_party_blank
  planBlankSupport.stock = !!extra.support_stock_blank
}

function ensureBlankSupplyMode () {
  if (!showBlankSupplySection.value) {
    // plan 配置尚未加载完成时，不要清空服务端回填值，避免编辑态闪烁覆盖
    if (!planConfigLoaded.value) return
    withApplyingLock(function () {
      form.blank_supply_mode = ''
      form.blank_image_urls = []
      form.blank_intro = ''
    })
    return
  }
  const exists = blankOptions.value.some(function (row) {
    return row.key === form.blank_supply_mode
  })
  if (exists) return
  // 编辑态：如果服务端已有历史值，先保留，不强制改成首个选项
  if (isEdit.value && String(form.blank_supply_mode || '').trim()) return
  withApplyingLock(function () {
    form.blank_supply_mode = blankOptions.value[0] && blankOptions.value[0].key
  })
}

function selectBlankSupplyMode (mode) {
  const next = normalizeBlankSupplyMode(mode)
  if (!next || form.blank_supply_mode === next) return
  form.blank_supply_mode = next
  triggerRecalcPrice()
}

/** 根据表单值 + plan 配置，同步尺寸 / 档位 / 加购的选中状态 */
function syncSelectionsFromFormAndPlan () {
  console.log('[item-form] syncSelectionsFromFormAndPlan form.size=', form.size, 'form.tier_title=', form.tier_title, 'rawAddonTitles=', rawAddonTitles.value)

  if (form.size && sizeOptions.value.length) {
    const idx1 = sizeOptions.value.findIndex(function (s) {
      return String(s.size) === String(form.size)
    })
    selectedSizeIndex.value = idx1
  }

  if (form.tier_title && tierOptions.value.length) {
    const idx2 = tierOptions.value.findIndex(function (t) {
      return String(t.title) === String(form.tier_title)
    })
    selectedTierIndex.value = idx2
  }

  if (!dirty.addons) {
    if (addonOptions.value.length && rawAddonTitles.value && rawAddonTitles.value.length) {
      const selected = []
      addonOptions.value.forEach(function (addon, idx) {
        const t = addon && addon.title
        if (t && rawAddonTitles.value.indexOf(String(t)) > -1) {
          selected.push(idx)
        }
      })
      selectedAddonIndexes.value = selected
    } else if (addonOptions.value.length) {
      selectedAddonIndexes.value = []
    }
  }

  if (selectedTierIndex.value >= 0) {
    recalcPriceFromPlan()
  }
}

function fillFormFromRaw (raw, opt) {
  opt = opt || {}
  const isFirstLoad = !!opt.isFirstLoad

  if (!raw) return
  console.log('[item-form] fillFormFromRaw id=', raw.id, 'work_subject=', raw.work_subject, 'size=', raw.size, 'isFirstLoad=', isFirstLoad)

  // 先把服务端 ref_images 归一化出来，方便打点
  const incomingImages = normalizeRefImages(raw.ref_images || raw.images || raw.ref_images_str)
  console.log('[item-form] incomingImages normalized=', incomingImages, 'raw.ref_images=', raw.ref_images)

  withApplyingLock(function () {
    if (!dirty.work_subject) {
      form.work_subject = raw.work_subject || raw.title || ''
    }

    if (!dirty.size) {
      form.size = raw.size || ''
    }
    if (!dirty.tier_title) {
      form.tier_title = raw.tier_title || raw.tier || ''
    }

    if (!(dirty.size || dirty.tier_title || dirty.addons)) {
      if (typeof raw.price_total !== 'undefined' && raw.price_total !== null) {
        const n = Number(raw.price_total)
        form.price_text = isNaN(n) ? '' : String(n)
      } else {
        form.price_text = ''
      }
    }

    if (!dirty.remark) {
      form.remark = raw.remark || raw.note || ''
    }

    if (!dirty.blank_supply_mode) {
      form.blank_supply_mode = normalizeBlankSupplyMode(raw.blank_supply_mode)
    }
    if (isFirstLoad || !dirty.blank_image_urls) {
      form.blank_image_urls = normalizeRefImages(raw.blank_image_urls)
    }
    if (!dirty.blank_intro) {
      form.blank_intro = raw.blank_intro || ''
    }
    if (isFirstLoad || !dirty.blank_stock) {
      const snapshot = buildBlankStockSnapshotFromRaw(raw)
      if (snapshot) {
        form.blank_stock_id = Number(snapshot.id || 0)
        form.blank_stock_snapshot = snapshot
      } else {
        const stockId = Number(raw.blank_stock_id || 0)
        form.blank_stock_id = stockId > 0 ? stockId : 0
        form.blank_stock_snapshot = stockId > 0
          ? normalizeBlankStockSnapshot({ id: stockId, blank_name: '已选毛坯 #' + stockId })
          : null
      }
    }

    // 关键修复点：
    // - 首次加载该 item：无条件应用服务端 ref_images
    // - 非首次加载：尊重 dirty.ref_images（避免覆盖用户正在编辑的图片）
    if (isFirstLoad || !dirty.ref_images) {
      form.ref_images = incomingImages
    }

    if (!dirty.subject_goods_id) {
      form.subject_goods_id = Number(raw.subject_goods_id || raw.goods_id || 0)
      const goodsId = form.subject_goods_id

      if (!dirty.displayGoods) {
        if (goodsId > 0) {
          selectedGoods.value = {
            id: goodsId,
            name: raw.subject_goods_name || raw.goods_name || raw.work_subject || form.work_subject,
            cover: (Array.isArray(form.ref_images) && form.ref_images.length > 0)
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
      }
    }

    if (!dirty.addons) {
      rawAddonTitles.value = []
      if (raw.addons_json) {
        const arr = decodeAddonsJson(raw.addons_json) // 兼容 "[]"
        rawAddonTitles.value = arr
          .map(function (a) {
            // 兼容 ["标题"] 或 [{title:"标题"}]
            if (!a) return ''
            if (typeof a === 'string') return a
            return a.title || ''
          })
          .filter(function (t) { return !!t })
      }
    }

    if (!hasHeadModeFromStorage.value && !dirty.headMode) {
      const goodsId = Number(raw.subject_goods_id || raw.goods_id || 0)
      if (goodsId > 0) {
        headMode.value = 'select'
      } else if (raw.from_cabinet) {
        headMode.value = 'cabinet'
      } else if ((form.work_subject || '').trim()) {
        headMode.value = 'manual'
      } else {
        headMode.value = 'select'
      }
      console.log('[item-form] fillFormFromRaw guess headMode =', headMode.value)
    }
  })

  console.log('[item-form] after fill, form.ref_images=', form.ref_images)

  if (sizeOptions.value.length || tierOptions.value.length || addonOptions.value.length) {
    syncSelectionsFromFormAndPlan()
  }
  ensureBlankSupplyMode()
}

/** 加载单个 item 详情（编辑模式） */
async function fetchItem (force, opt) {
  opt = opt || {}
  const silent = !!opt.silent
  const keepOldOnError = (typeof opt.keepOldOnError === 'boolean') ? opt.keepOldOnError : silent

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
    if (!keepOldOnError) errorMsg.value = '请先登录后再编辑投递信息'
    console.log('[item-form] fetchItem no token')
    return
  }

  // 用于决定是否“首次加载该 item”
  const isFirstLoad = !hasLoadedItem.value

  console.log('[item-form] fetchItem start, reqItemId=', reqItemId, 'force=', force, 'silent=', silent, 'isFirstLoad=', isFirstLoad, 'current itemId=', itemId.value)

  if (!silent) {
    loading.value = true
  }
  if (!silent) {
    errorMsg.value = ''
  }

  try {
    const res = await uni.request({
      url: websiteUrl.value + '/with-state/artist-order/item/detail',
      method: 'GET',
      header: { Authorization: token },
      data: { item_id: reqItemId }
    })

    const body = res.data || {}
    console.log('[item-form] fetchItem response raw body=', body, 'reqItemId=', reqItemId, 'current itemId=', itemId.value)

    if (String(body.status).toLowerCase() !== 'success') {
      throw new Error(body.msg || '接口返回失败')
    }

    const raw = body.data || {}
    console.log('[item-form] fetchItem data=', raw, 'reqItemId=', reqItemId, 'current itemId=', itemId.value)

    if (reqItemId !== itemId.value) {
      console.log('[item-form] fetchItem stale response, ignore. reqItemId=', reqItemId, 'current itemId=', itemId.value)
      return
    }

    submissionId.value = Number(raw.submission_id || submissionId.value || 0)
    if (!planId.value) {
      planId.value = Number(raw.plan_id || raw.order_plan_id || 0)
      if (planId.value) {
        fetchPlanInfo()
      }
    }

    fillFormFromRaw(raw, { isFirstLoad })
    hasLoadedItem.value = true
  } catch (e) {
    console.error('[item-form] 加载 item 详情失败', e)
    const msg = e && e.message ? e.message : '加载失败，请稍后重试'

    if (keepOldOnError && hasLoadedItem.value) {
      uni.showToast({ title: '刷新失败：' + msg, icon: 'none' })
    } else {
      errorMsg.value = msg
    }
  } finally {
    if (!silent) {
      if (reqItemId === itemId.value) {
        loading.value = false
      } else {
        console.log('[item-form] fetchItem finally: skip loading=false 因为 itemId 已切换, reqItemId=', reqItemId, 'current itemId=', itemId.value)
      }
    }
  }
}

function reloadItem () {
  console.log('[item-form] reloadItem clicked itemId=', itemId.value)
  hasLoadedItem.value = false
  fetchItem(true, { silent: false })
}

/** 加载方案 plan 信息 */
async function fetchPlanInfo () {
  if (!planId.value) return
  const reqPlanId = planId.value
  planConfigLoaded.value = false
  console.log('[item-form] fetchPlanInfo planId=', reqPlanId)
  try {
    const res = await uni.request({
      url: websiteUrl.value + '/brand-artist/order-plan-info',
      method: 'GET',
      data: { id: reqPlanId }
    })
    const body = res.data || {}
    console.log('[item-form] fetchPlanInfo body=', body, 'reqPlanId=', reqPlanId, 'current planId=', planId.value)

    if (reqPlanId !== planId.value) {
      console.log('[item-form] fetchPlanInfo stale response, ignore. reqPlanId=', reqPlanId, 'current planId=', planId.value)
      return
    }

    if (String(body.status).toLowerCase() !== 'success') {
      return
    }
    const data = body.data || {}
    planArtistType.value = Number(data.artist_type || data.artistType || 0)
    let cfg = {}
    try {
      if (typeof data.order_config === 'string') {
        cfg = data.order_config ? JSON.parse(data.order_config) : {}
      } else if (data.order_config && typeof data.order_config === 'object') {
        cfg = data.order_config
      } else {
        cfg = {}
      }
    } catch (e) {
      console.error('[item-form] 解析 order_config 失败', e)
      cfg = {}
    }
    normalizePlanBlankSupport(cfg)
    if (
      planArtistType.value === 0 &&
      (planBlankSupport.self || planBlankSupport.third || planBlankSupport.stock)
    ) {
      planArtistType.value = 2
    }

    sizeOptions.value = Array.isArray(cfg && cfg.extra && cfg.extra.size_surcharges)
      ? cfg.extra.size_surcharges
      : []
    tierOptions.value = Array.isArray(cfg && cfg.tiers) ? cfg.tiers : []
    addonOptions.value = Array.isArray(cfg && cfg.addons) ? cfg.addons : []

    console.log('[item-form] plan parsed sizeOptions=', sizeOptions.value, 'tierOptions=', tierOptions.value, 'addonOptions=', addonOptions.value)

    if (form.size || form.tier_title || (rawAddonTitles.value && rawAddonTitles.value.length) || (selectedAddonIndexes.value && selectedAddonIndexes.value.length)) {
      syncSelectionsFromFormAndPlan()
    }
    ensureBlankSupplyMode()
  } catch (e) {
    console.error('[item-form] 加载 order plan 信息失败', e)
  } finally {
    // 无论成功失败，都认为该轮 plan 拉取已结束，避免长期阻塞毛坯方式兜底逻辑
    if (reqPlanId === planId.value) {
      planConfigLoaded.value = true
    }
  }
}

/** 重新根据选项计算总价（仅前端展示） */
function recalcPriceFromPlan () {
  const tier = selectedTierIndex.value >= 0 ? tierOptions.value[selectedTierIndex.value] : null
  if (!tier) {
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

  // 现有毛坯（stock）模式下，需要将毛坯价格计入预估总价
  if (normalizeBlankSupplyMode(form.blank_supply_mode) === 'stock') {
    const stockSnapshot = normalizeBlankStockSnapshot(form.blank_stock_snapshot)
    if (stockSnapshot) {
      total += Number(stockSnapshot.price) || 0
    }
  }

  form.price_text = String(total)
  console.log('[item-form] recalcPriceFromPlan total=', total)
}

// triggerRecalcPrice 在毛坯模式/毛坯选择发生变化时触发预估总价重算。
function triggerRecalcPrice () {
  if (selectedTierIndex.value >= 0) {
    recalcPriceFromPlan()
  }
}

/** 选择尺寸 */
function handleSelectSize (idx) {
  markDirty('size')
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
  markDirty('tier_title')
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
  markDirty('addons')
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
  const headNameText = isHairPlan.value ? '佩戴假毛的头' : '投妆娃头'

  if (headMode.value === 'select') {
    if (!form.subject_goods_id) {
      uni.showToast({ title: `请选择${headNameText}`, icon: 'none' })
      return false
    }
  } else {
    if (!subject) {
      uni.showToast({ title: `请填写${headNameText}`, icon: 'none' })
      return false
    }
  }

  if (showBlankSupplySection.value) {
    if (!normalizeBlankSupplyMode(form.blank_supply_mode)) {
      uni.showToast({ title: '请选择毛坯提供方式', icon: 'none' })
      return false
    }
    if (form.blank_supply_mode === 'self') {
      if (!Array.isArray(form.blank_image_urls) || form.blank_image_urls.length === 0) {
        uni.showToast({ title: '请上传毛坯图片', icon: 'none' })
        return false
      }
      if ((form.blank_intro || '').trim().length < 2) {
        uni.showToast({ title: '请填写毛坯介绍', icon: 'none' })
        return false
      }
    } else if (form.blank_supply_mode === 'stock') {
      if (Number(form.blank_stock_id || 0) <= 0) {
        uni.showToast({ title: '请先选择现有毛坯', icon: 'none' })
        return false
      }
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
        markDirty('ref_images')
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
        markDirty('ref_images')
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    }
  })
}

async function handleUploadBlankImages () {
  try {
    const currentCount = Array.isArray(form.blank_image_urls) ? form.blank_image_urls.length : 0
    const remain = 3 - currentCount
    if (remain <= 0) {
      uni.showToast({ title: '最多上传 3 张毛坯图', icon: 'none' })
      return
    }

    const files = await chooseImageList(remain)
    if (!files || !files.length) return

    for (let i = 0; i < files.length; i++) {
      const tk = await getQiniuToken()
      if (!tk || !tk.token || !tk.path) {
        throw new Error('获取上传凭证失败')
      }
      const ret = await uploadImageToQiniu(files[i], tk.token, tk.path)
      if (ret && ret.imageUrl) {
        if (!Array.isArray(form.blank_image_urls)) {
          form.blank_image_urls = []
        }
        form.blank_image_urls.push(ret.imageUrl)
        markDirty('blank_image_urls')
      }
    }

    uni.showToast({ title: '毛坯图上传成功', icon: 'success' })
  } catch (e) {
    console.error('[item-form] 上传毛坯图片失败', e)
    uni.showToast({
      title: (e && e.message) ? e.message : '上传失败',
      icon: 'none'
    })
  }
}

function previewBlankImage (url) {
  uni.previewImage({
    current: url,
    urls: Array.isArray(form.blank_image_urls) ? form.blank_image_urls : []
  })
}

function removeBlankImage (index) {
  uni.showModal({
    title: '提示',
    content: '确定删除这张毛坯图吗？',
    success (res) {
      if (!res.confirm) return
      form.blank_image_urls.splice(index, 1)
      markDirty('blank_image_urls')
      uni.showToast({ title: '已删除', icon: 'success' })
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
  const blankSupplyModeForSave = showBlankSupplySection.value
    ? normalizeBlankSupplyMode(form.blank_supply_mode)
    : ''
  const stockSnapshotForSave = blankSupplyModeForSave === 'stock'
    ? normalizeBlankStockSnapshot(form.blank_stock_snapshot)
    : null
  const blankStockIdForSave = blankSupplyModeForSave === 'stock'
    ? Number(form.blank_stock_id || (stockSnapshotForSave && stockSnapshotForSave.id) || 0)
    : 0
  const blankImageUrlsForSave = (blankSupplyModeForSave === 'self' && Array.isArray(form.blank_image_urls))
    ? form.blank_image_urls
    : (blankSupplyModeForSave === 'stock' && stockSnapshotForSave && (stockSnapshotForSave.cover_image || firstBlankStockImage.value))
        ? [stockSnapshotForSave.cover_image || firstBlankStockImage.value]
    : []
  const blankIntroForSave = blankSupplyModeForSave === 'self'
    ? (form.blank_intro || '').trim()
    : (blankSupplyModeForSave === 'stock' && stockSnapshotForSave)
        ? JSON.stringify(stockSnapshotForSave)
    : ''

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
        remark: (form.remark || '').trim(),
        blank_supply_mode: blankSupplyModeForSave,
        blank_stock_id: blankStockIdForSave,
        blank_image_urls: blankImageUrlsForSave,
        blank_intro: blankIntroForSave
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
      resetDirtyFlags()

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
        remark: (form.remark || '').trim(),
        blank_supply_mode: blankSupplyModeForSave,
        blank_stock_id: blankStockIdForSave,
        blank_image_urls: blankImageUrlsForSave,
        blank_intro: blankIntroForSave
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
      resetDirtyFlags()

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

  const snap = getCurrentPageSnapshot()
  const merged = Object.assign({}, q, (snap && snap.opts) ? snap.opts : {})
  lastRouteKey.value = snap && snap.key ? snap.key : (buildStableQueryString(merged) || '')
  console.log('[item-form] onLoad set lastRouteKey=', lastRouteKey.value, 'snap=', snap)

  applyRouteOptionsAndRefresh(merged, 'onLoad')
})

onShow(function () {
  console.log('[item-form] onShow enter, current itemId=', itemId.value, 'planId=', planId.value, 'submissionId=', submissionId.value)

  const snap = getCurrentPageSnapshot()
  const newKey = snap && snap.key ? String(snap.key) : ''
  const snapItemId = Number((snap && snap.opts && (snap.opts.item_id || snap.opts.submission_item_id)) || 0)

  let didApplyRouteRefresh = false

  if (!lastRouteKey.value) {
    lastRouteKey.value = newKey
    console.log('[item-form] onShow init lastRouteKey=', lastRouteKey.value)
  } else if (newKey && newKey !== lastRouteKey.value) {
    console.log('[item-form] onShow URL changed, oldKey=', lastRouteKey.value, 'newKey=', newKey, 'snap=', snap)
    lastRouteKey.value = newKey
    didApplyRouteRefresh = true
    applyRouteOptionsAndRefresh(snap.opts, 'onShow-url-changed')
  } else {
    console.log('[item-form] onShow URL not changed, key=', newKey)
  }

  if (!didApplyRouteRefresh && snapItemId > 0 && snapItemId !== itemId.value) {
    console.log('[item-form] onShow id mismatch, force applyRoute. snapItemId=', snapItemId, 'current itemId=', itemId.value, 'snap=', snap)
    lastRouteKey.value = newKey || lastRouteKey.value
    didApplyRouteRefresh = true
    applyRouteOptionsAndRefresh(snap.opts, 'onShow-id-mismatch')
  }

  // 你的要求：只要编辑模式，每次 onShow 都刷新（静默刷新优先）
  if (isEdit.value) {
    if (!didApplyRouteRefresh) {
      fetchItem(true, { silent: hasLoadedItem.value, keepOldOnError: true })
    } else {
      console.log('[item-form] onShow skip extra fetchItem because route refresh already triggered')
    }
  }

  // 娃柜选择的兜底回传
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

  try {
    const cachedBlank = uni.getStorageSync('__pickedBlankStockFromOrder')
    if (cachedBlank && cachedBlank.id) {
      console.log('[item-form] onShow found cached __pickedBlankStockFromOrder=', cachedBlank)
      applyPickedStockBlank(cachedBlank)
      uni.removeStorageSync('__pickedBlankStockFromOrder')
    }
  } catch (e) {
    console.log('[item-form] onShow read __pickedBlankStockFromOrder error', e)
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

.blank-chip {
  width: 100%;
  padding: 20rpx 22rpx;
  background: #f4f8ff;
}
.blank-chip.active {
  background: #e9f9ff;
}
.blank-chip-with-panel {
  padding-bottom: 14rpx;
}
.blank-inline-panel {
  margin-top: 12rpx;
  width: 100%;
  padding: 14rpx;
  border-radius: 12rpx;
  background: rgba(255, 255, 255, 0.82);
  box-sizing: border-box;
}
.blank-panel {
  margin-top: 14rpx;
  padding: 18rpx;
  border-radius: 16rpx;
  background: #f8fbff;
}
.blank-panel-body {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.blank-helper-title {
  font-size: 24rpx;
  color: #334155;
}
.blank-helper-text {
  display: block;
  font-size: 22rpx;
  color: #64748b;
  line-height: 1.7;
}
.blank-image-field {
  background: #ffffff;
}
.blank-textarea-row {
  margin-top: 0;
}
.picked-blank-card {
  display: flex;
  gap: 16rpx;
  align-items: center;
  background: #ffffff;
  border-radius: 14rpx;
  padding: 14rpx;
}
.picked-blank-cover {
  flex-shrink: 0;
}
.picked-blank-main {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}
.picked-blank-name {
  font-size: 26rpx;
  color: #1f2b43;
  line-height: 1.35;
}
.picked-blank-meta {
  font-size: 22rpx;
  color: #6b7a93;
}
.picked-blank-price {
  margin-top: 2rpx;
  font-size: 28rpx;
  color: #334155;
}
.stock-pick-actions {
  display: flex;
  gap: 14rpx;
}
.stock-pick-btn {
  height: 68rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #2e3b57;
  background: #eef4ff;
  padding: 0 28rpx;
}
.stock-pick-primary {
  flex: 1;
  background: #e4f8ff;
  color: #227f99;
}
.stock-pick-remove {
  min-width: 140rpx;
  background: #fff1f4;
  color: #b65b77;
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
