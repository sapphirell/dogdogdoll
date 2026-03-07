/**
 * 统一创作者主页角色类型。
 * @param {string|number} type 页面参数或业务类型
 * @returns {'artist'|'hair'} 标准化后的角色类型
 */
export function normalizeCreatorRole(type) {
  return String(type || '').toLowerCase() === 'hair' || Number(type) === 2 ? 'hair' : 'artist'
}

/**
 * 根据角色类型生成创作者主页路由。
 * @param {string|number} brandId 品牌 ID
 * @param {string|number} type 创作者类型
 * @returns {string} 统一创作者主页地址
 */
export function buildCreatorProfileUrl(brandId, type = 'artist') {
  const role = normalizeCreatorRole(type)
  return `/pkg-creator/creator_base/creator_profile/creator_profile?brand_id=${brandId}&type=${role}`
}
