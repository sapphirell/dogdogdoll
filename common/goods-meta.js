import { websiteUrl } from '@/common/config.js'

export const DEFAULT_GOODS_TYPE_OPTIONS = Object.freeze([
  '整体', '单体', '单头', '手型', '脚型', '胸型', '胸台',
  '眼珠', '假发', '娃衣', '娃鞋', '袜子', '配饰', '支架', '耳朵', '背饰', 'BJD家具', '娃包痛包'
])

export const HEAD_SCOPE_GOODS_TYPES = Object.freeze(['单头', '整体'])

export const DEFAULT_SALE_SIZE_CATEGORIES = Object.freeze([
  '四分', '六分', '三分', '其它大尺寸', '八分', '十二分', '一分', '二分', '五分', '棉花娃', '眼珠'
])

const GOODS_CATEGORY_ALIAS_PRESET = Object.freeze({
  整体: ['整娃', '全娃'],
  单体: ['身体'],
  单头: ['头', '娃头'],
  手型: ['手'],
  脚型: ['脚'],
  胸型: ['胸'],
  眼珠: ['眼'],
  假发: ['毛', '毛件'],
  娃衣: ['衣服', '服装'],
  娃鞋: ['鞋子', '鞋'],
  袜子: ['袜'],
  配饰: ['饰品', '配件'],
  耳朵: ['耳'],
  背饰: ['背件'],
  BJD家具: ['bjd家具', '家具'],
  娃包痛包: ['娃包', '痛包']
})

function uniqTrimmed(values = []) {
  const out = []
  const seen = new Set()
  values.forEach((raw) => {
    const v = String(raw || '').trim()
    if (!v || seen.has(v)) return
    seen.add(v)
    out.push(v)
  })
  return out
}

export function normalizeSizeCategoryName(raw) {
  const text = String(raw || '').trim()
  if (!text) return ''
  if (text === '全部尺寸') return text
  if (text.startsWith('眼珠')) return '眼珠'
  return text
}

export function normalizeGoodsTypeList(raw) {
  const list = Array.isArray(raw) ? raw : []
  return uniqTrimmed(list)
}

export function normalizeSaleSizeCategoryList(raw) {
  const source = Array.isArray(raw) ? raw : Object.keys(raw || {})
  const normalized = source.map(normalizeSizeCategoryName)
  return uniqTrimmed(normalized)
}

export async function requestGoodsTypes() {
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/goods-types`,
      method: 'GET'
    })
    const list = normalizeGoodsTypeList(res?.data?.status === 'success' ? res?.data?.data : [])
    return list.length ? list : [...DEFAULT_GOODS_TYPE_OPTIONS]
  } catch (err) {
    console.warn('[goods-meta] requestGoodsTypes failed:', err)
    return [...DEFAULT_GOODS_TYPE_OPTIONS]
  }
}

export async function requestSaleSizeCategories(showType = 'hot') {
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/sizes`,
      method: 'GET',
      data: { show_type: showType }
    })
    const list = normalizeSaleSizeCategoryList(res?.data?.status === 'success' ? res?.data?.data : {})
    return list.length ? list : [...DEFAULT_SALE_SIZE_CATEGORIES]
  } catch (err) {
    console.warn('[goods-meta] requestSaleSizeCategories failed:', err)
    return [...DEFAULT_SALE_SIZE_CATEGORIES]
  }
}

export async function requestSizeMap(showType = '') {
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/sizes`,
      method: 'GET',
      data: showType ? { show_type: showType } : {}
    })
    const data = res?.data?.status === 'success' ? res?.data?.data : {}
    return data && typeof data === 'object' ? data : {}
  } catch (err) {
    console.warn('[goods-meta] requestSizeMap failed:', err)
    return {}
  }
}

export async function requestMaterialOptions(goodsType = '') {
  const isHair = String(goodsType || '').trim() === '假发'
  const path = isHair ? '/hair-materials' : '/materials'
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}${path}`,
      method: 'GET'
    })
    return uniqTrimmed(res?.data?.status === 'success' ? res?.data?.data : [])
  } catch (err) {
    console.warn('[goods-meta] requestMaterialOptions failed:', err)
    return []
  }
}

export function buildHeadSocketOptions(sizeMap = {}) {
  const preferredOrder = ['一分', '二分', '三分', '四分', '五分', '六分', '八分', '十二分', '其它大尺寸']
  const sizeKeys = Object.keys(sizeMap || {})
  const disallow = new Set(['棉花娃', '眼珠', '眼珠（二次元）', '眼珠（三次元）'])
  const ordered = preferredOrder.filter(item => sizeKeys.includes(item) && !disallow.has(item))
  const rest = sizeKeys.filter(item => !disallow.has(item) && !ordered.includes(item))
  return uniqTrimmed([...ordered, ...rest])
}

export function buildEyeRecommendationOptions(sizeMap = {}) {
  const eyeList = []
  const seen = new Set()
  ;['眼珠（二次元）', '眼珠（三次元）'].forEach((category) => {
    const arr = Array.isArray(sizeMap?.[category]) ? sizeMap[category] : []
    arr.forEach((item) => {
      const val = String(item || '').trim()
      if (!val || seen.has(val)) return
      seen.add(val)
      eyeList.push(val)
    })
  })
  return eyeList
}

export function buildSizeCategoryOptions(sizeMap = {}) {
  return uniqTrimmed(Object.keys(sizeMap || {}).map(normalizeSizeCategoryName))
}

export function buildSizeDetailOptions(sizeMap = {}, category = '') {
  const key = normalizeSizeCategoryName(category)
  if (!key) return []
  return uniqTrimmed(Array.isArray(sizeMap?.[key]) ? sizeMap[key] : [])
}

export function buildGoodsCategoryDefsFromTypes(types = []) {
  const canonicalTypes = normalizeGoodsTypeList(types)
  if (!canonicalTypes.length) {
    return normalizeGoodsTypeList(DEFAULT_GOODS_TYPE_OPTIONS).map((value) => ({ value, aliases: [value] }))
  }
  return canonicalTypes.map((value) => {
    const aliases = uniqTrimmed([value, ...(GOODS_CATEGORY_ALIAS_PRESET[value] || [])])
    return { value, aliases }
  })
}

export function buildGoodsCategoryAliasMap(defs = []) {
  return (Array.isArray(defs) ? defs : []).reduce((acc, item) => {
    const value = String(item?.value || '').trim()
    if (!value) return acc
    const aliases = uniqTrimmed([...(Array.isArray(item?.aliases) ? item.aliases : []), value])
    aliases.forEach((alias) => {
      const key = String(alias || '').trim().toLowerCase()
      if (!key) return
      acc[key] = value
    })
    return acc
  }, {})
}
