import { websiteUrl } from '@/common/config.js'

export function searchBrands(q) {
  return uni.request({
    url: `${websiteUrl.value}/search-brand?search=${encodeURIComponent(q)}`,
    method: 'GET'
  })
}
export function getBrandInfo(id) {
  return uni.request({
    url: `${websiteUrl.value}/brand-info?id=${id}`,
    method: 'GET'
  })
}
/** 关键词 + 品牌内搜索 */
export function searchGoods(keyword, brandId) {
  return uni.request({
    url: `${websiteUrl.value}/search-goods`,
    method: 'GET',
    // 用 data 让 uni 自动拼 query，避免 [object Object]
    data: { search: keyword, brand_id: brandId }
  })
}

export function getGoodsDetail(id) {
  return uni.request({
    url: `${websiteUrl.value}/goods?id=${id}`,
    method: 'GET'
  })
}
