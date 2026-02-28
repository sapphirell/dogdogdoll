<template>
	<view-logs />
  <view class="page" :style="{ transform: `translateY(-${liftPx}px)` }">
    <!-- 顶部大图背景：未选商品时为空背景；选中后展示商品图，并加底部白色渐变 -->
    <view class="hero" :style="{ height: heroHeight }">
      <image
        v-if="hasGoods"
        class="hero-bg"
        :src="goods.cover"
        mode="aspectFill"
      />
      <view v-if="hasGoods" class="hero-fade"></view>

      <!-- 未选商品：中间显示品牌头像 + 名称 + 提示，全部居中 -->
      <view v-if="!hasGoods" class="brand-center">
        <image v-if="brand.logo_image" :src="brand.logo_image" class="brand-logo" mode="aspectFill" />
        <view class="brand-name">{{ brand.brand_name || '未选择品牌' }}</view>
        <view class="brand-sub">{{ brandSubText }}</view>
      </view>
    </view>

    <!-- 输入与联想、操作按钮（统一在 field 内，保证同宽对齐） -->
    <view class="field">
      <view class="input-row">
        <input
          v-model="keyword"
          placeholder="请输入娃物名称"
          :maxlength="30"
          confirm-type="search"
          @confirm="doSearch"
          @input="onInput"
          @focus="onFocus"
          @blur="onBlur"
          :adjust-position="false" 
          :cursor-spacing="0"
        />
        <text class="count">{{ (keyword||'').length }}/30</text>
      </view>
      <view class="hint">（{{ hintText }}）</view>

      <!-- 品类过滤：可默认指定，也可手动清除 -->
      <view v-if="!shouldHideTypeFilter" class="type-filter-wrap">
        <view class="type-filter-scroll">
          <text
            v-if="allowClearType"
            class="type-chip"
            :class="{ active: !selectedGoodsType }"
            @tap="selectGoodsType('')"
          >
            全部
          </text>
          <text
            v-for="type in goodsTypeOptions"
            :key="type"
            class="type-chip"
            :class="{ active: selectedGoodsType === type }"
            @tap="selectGoodsType(type)"
          >
            {{ type }}
          </text>
        </view>
      </view>

      <!-- 联想列表（与输入框同宽） -->
      <scroll-view v-if="results.length" class="assoc" scroll-y>
        <view class="item" v-for="it in results" :key="it.id" @tap="pickGoods(it)">
          <text class="gname">{{ it.name }}</text>
        </view>
      </scroll-view>

      <!-- 操作按钮：紧跟输入区，不再固定在页面底部 -->
      <view class="actions">
        <button class="ghost" @tap="goBack">返回上一步</button>
        <button class="primary" :disabled="!goods.id" @tap="confirm">确认</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { searchGoods, getGoodsDetail } from '@/api/associate.js'
import {
  DEFAULT_GOODS_TYPE_OPTIONS,
  HEAD_SCOPE_GOODS_TYPES,
  requestGoodsTypes
} from '@/common/goods-meta.js'

// ------- state -------
const brand = ref({ id: 0, brand_name: '', logo_image: '' })
const goods = ref({ id: 0, name: '', type: '', cover: '', price: 0, currency: '' })
const keyword = ref('')
const results = ref([])
const hasGoods = computed(() => !!goods.value.id)
const liftPx = ref(0) // JS 计算抬起像素（px）
const selectedGoodsType = ref('')
const allowClearType = ref(true)
const hideTypeFilter = ref(false)
const scene = ref('')
const fixedGoodsTypes = ref([])
const goodsTypeOptions = ref([...DEFAULT_GOODS_TYPE_OPTIONS])
const shouldHideTypeFilter = computed(() => hideTypeFilter.value || fixedGoodsTypes.value.length > 0)
const isHeadScope = computed(() => {
  const headTypes = [...HEAD_SCOPE_GOODS_TYPES]
  if (scene.value === 'head') return true
  if (fixedGoodsTypes.value.length !== headTypes.length) return false
  return headTypes.every(type => fixedGoodsTypes.value.includes(type))
})
const brandSubText = computed(() => (isHeadScope.value ? '仅在该品牌下搜索娃头' : '仅在该品牌下搜索商品'))
const hintText = computed(() => {
  if (isHeadScope.value) return '仅搜索该品牌下的娃头（单头/整体）'
  if (fixedGoodsTypes.value.length > 0) return `仅搜索该品牌下的商品（${fixedGoodsTypes.value.join(' / ')}）`
  return '仅搜索该品牌下的商品'
})

// ★ 新增：根据是否已选中商品，动态控制 hero 高度（rpx）
const heroHeight = computed(() => (hasGoods.value ? '650rpx' : '400rpx'))

function normalizeTypeList(list) {
  if (!Array.isArray(list)) return []
  const seen = new Set()
  return list
    .map(v => String(v || '').trim())
    .filter(v => !!v)
    .filter(v => {
      if (seen.has(v)) return false
      seen.add(v)
      return true
    })
}

function ensureSelectedTypeVisible() {
  const selected = String(selectedGoodsType.value || '').trim()
  if (!selected) return
  if (goodsTypeOptions.value.includes(selected)) return
  goodsTypeOptions.value = [selected, ...goodsTypeOptions.value]
}

async function fetchGoodsTypeOptions() {
  try {
    const remote = normalizeTypeList(await requestGoodsTypes())
    goodsTypeOptions.value = remote.length > 0 ? remote : [...DEFAULT_GOODS_TYPE_OPTIONS]
  } catch (err) {
    console.warn('[goods-pick] fetch goods types failed, use fallback:', err)
    goodsTypeOptions.value = [...DEFAULT_GOODS_TYPE_OPTIONS]
  } finally {
    ensureSelectedTypeVisible()
  }
}

// 接收上个页面传来的 brand 参数
onLoad(async (opts) => {
  scene.value = String(opts?.scene || '').trim()
  brand.value.id = Number(opts?.brand_id || 0)
  brand.value.brand_name = decodeURIComponent(opts?.brand_name || '')
  brand.value.logo_image = decodeURIComponent(opts?.brand_logo || '')
  selectedGoodsType.value = decodeURIComponent(opts?.default_goods_type || '')
  allowClearType.value = opts?.allow_clear_type !== '0'
  hideTypeFilter.value = opts?.hide_type_filter === '1'
  const parsedGoodsTypes = decodeURIComponent(opts?.goods_types || '')
    .split(/[\s,，、/|]+/g)
    .map(v => v.trim())
    .filter(Boolean)
  fixedGoodsTypes.value = Array.from(new Set(parsedGoodsTypes))
  // 娃头场景兜底：固定类型；兼容旧链接（仅传 default_goods_type=单头/整体）
  const isHeadByDefaultType = HEAD_SCOPE_GOODS_TYPES.includes(selectedGoodsType.value)
  if (fixedGoodsTypes.value.length === 0 && (scene.value === 'head' || isHeadByDefaultType)) {
    fixedGoodsTypes.value = [...HEAD_SCOPE_GOODS_TYPES]
    selectedGoodsType.value = ''
    hideTypeFilter.value = true
    allowClearType.value = false
  }

  await fetchGoodsTypeOptions()

  if (brand.value.id && (selectedGoodsType.value || fixedGoodsTypes.value.length > 0)) {
    fetchList()
  }
})

// ------- keyboard lift -------
function onFocus () {
  try {
    liftPx.value = typeof uni?.upx2px === 'function' ? uni.upx2px(300) : 300
  } catch (_) {
    liftPx.value = 300
  }
}
function onBlur () {
  liftPx.value = 0
}

// ------- search -------
let timer = null
function doSearch(){ fetchList() }
function onInput(e){
  keyword.value = typeof e === 'string' ? e : (e?.detail?.value || '')
  if (!keyword.value.trim()) { results.value = []; return }
  fetchList()
}
function fetchList(){
  clearTimeout(timer)
  timer = setTimeout(async () => {
    if (!brand.value.id) return
    const requestType = fixedGoodsTypes.value.length > 0
      ? fixedGoodsTypes.value.join(',')
      : selectedGoodsType.value
    const { data } = await searchGoods(keyword.value.trim(), brand.value.id, requestType)
    results.value = data?.status === 'success' ? (data?.data || []) : []
  }, 150)
}
onUnmounted(() => clearTimeout(timer))

function selectGoodsType(type) {
  if (!allowClearType.value && !type) return
  if (selectedGoodsType.value === type) return
  selectedGoodsType.value = type
  if (!brand.value.id) return
  fetchList()
}

async function pickGoods(item){
  keyword.value = item.name
  results.value = []
  const { data } = await getGoodsDetail(item.id)
  const g = data?.data || {}
  const cover =
    g.goods_image ||
    (Array.isArray(g.goods_images) && g.goods_images.length ? g.goods_images[0] : '')
  goods.value = {
    id: g.id,
    name: g.name || item.name,
    type: g.type || '',
    cover,
    price: g.total_amount || 0,
    currency: g.currency || ''
  }
}

// ------- nav -------
function goBack(){ uni.navigateBack() }
function confirm(){
  if (!goods.value.id) return
  const payload = {
    brand: {
      id: brand.value.id,
      brand_name: brand.value.brand_name,
      logo_image: brand.value.logo_image
    },
    goods: {
      id: goods.value.id,
      name: goods.value.name,
      type: goods.value.type,
      cover: goods.value.cover,
      price: goods.value.price,
      currency: goods.value.currency
    }
  }
  uni.$emit('associate:done', payload)
  uni.navigateBack({ delta: 2 })
}
</script>

<style scoped lang="less">
.page{
  min-height: 100vh;
  background:#fff;
  transition: transform .22s ease;
  will-change: transform;
}

/* 顶部大图区域（高度随是否选中商品而变，默认 400rpx；选中后由内联样式设为 650rpx） */
.hero{
  position: relative;
  height: 400rpx;                 /* 默认高度，未选中时 */
  background: linear-gradient(180deg,#f6f8fb,#ffffff);
  overflow: hidden;
  transition: height .24s ease;   /* 平滑过渡高度变化 */
}
.hero-bg{
  position:absolute; left:0; top:0; right:0; bottom:0;
  width:100%; height:100%;
}
.hero-fade{
  position:absolute; left:0; right:0; bottom:0;
  height: 160rpx;
  background: linear-gradient(180deg, rgba(255,255,255,0) 0%, #ffffff 85%);
}

/* 未选商品时，品牌信息居中显示 */
.brand-center{
  position: absolute; inset: 0;
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap: 10rpx;
}
.brand-logo{
  width: 120rpx; height: 120rpx; border-radius: 50%;
  background:#f2f3f5;
}
.brand-name{ font-size: 32rpx; font-weight: 700; color:#2c3e50; }
.brand-sub{ font-size: 24rpx; color:#9aa4b2; }

/* 输入区整体上移一点，进一步缩短距离；并保证层级盖住渐变 */
.field{
  position: relative; z-index: 2;
  margin-top: -40rpx;      /* 关键：上移靠近品牌信息 */
  padding: 12rpx 40rpx 0;  /* 顶部内边距更紧凑 */
}

/* 输入框 */
.input-row{
  position:relative; display:flex; align-items:center;
  background:#fff; border:2rpx solid #c8b98d; border-radius: 16rpx;
  padding:22rpx;
}
.input-row input{ flex:1; font-size:28rpx; }
.input-row .count{ color:#c0c4cc; margin-left:8rpx; font-size:24rpx; }
.hint{ text-align:center; color:#c0c4cc; font-size:24rpx; margin-top:42rpx;margin-bottom: 60rpx; }

.type-filter-wrap{
  margin-bottom: 18rpx;
}
.type-filter-scroll{
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}
.type-chip{
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 94rpx;
  height: 52rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  color: #66758a;
  background: #f3f6fb;
}
.type-chip.active{
  color: #2f6fa0;
  background: #dff0ff;
}

/* 联想列表：与输入同宽 */
.assoc{
  width: 100%;
  max-height: 50vh;
  margin-top: 12rpx;
  background:#fff; border-radius:12rpx; box-shadow:0 8rpx 24rpx rgba(0,0,0,.06);
  overflow: hidden;
}
.assoc .item{ padding:24rpx; border-bottom:1rpx solid #f2f3f5; font-size:28rpx; }
.assoc .item:last-child{ border-bottom:none; }
.gname{ color:#333; }

/* 操作按钮：跟随输入区，不固定底部 */
.actions{
  display:flex; gap:16rpx;
  margin: 24rpx 0 40rpx;
}
.actions .ghost, .actions .primary{
  flex:1; height:88rpx; line-height:88rpx; border-radius:999rpx; font-weight:600;
}
.actions .ghost{ background:#f5f5f5; color:#666; }
.actions .primary{ background: #a0e8ff; color: #fff;     box-shadow: 0 0 30px #00c1ff40; }
.actions .primary:disabled{ background:#f0f0f0; color:#bbb; }
/* 去除 uni-button 默认::after 边框 */
.actions .ghost::after, .actions .primary::after { border: none; }
</style>
