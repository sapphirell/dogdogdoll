// /common/share.js
import { ref } from 'vue'
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { SHARE_H5_BASE, USE_HASH_ROUTER } from '@/common/config.js'

function getAppScene() { 
  const platform = process.env.UNI_PLATFORM
  // 微信小程序
  if (platform === 'mp-weixin') return 4
  // H5
  if (platform === 'h5') return 1
  // App
  if (platform === 'app-plus' || platform === 'app') {
    const systemInfo = uni.getSystemInfoSync()
    if (systemInfo.osName === 'ios') return 2
    if (systemInfo.osName === 'android') return 3
  }
  return 1
}


const toH5Path = (path, useHash = USE_HASH_ROUTER) => {
  if (!path) return '/#/'
  // 如果已经是完整 http(s) 链接，直接返回
  if (/^https?:\/\//i.test(path)) return path
  // 统一清洗开头斜杠
  const clean = '/' + String(path).replace(/^\/+/, '')
  // 默认 H5 使用 hash 路由：域名 + "/#"+path
  return useHash ? '/#' + clean : clean
}

/**
 * 跨端分享逻辑（运行时判断场景）
 * @param {Function} payloadFactory -> { title, summary?, imageUrl?, path, h5Base? }
 *   - path: 形如 /pages/faceup/detail?id=1
 *   - h5Base: H5 域名，H5 下拼接完整分享链接（默认 location.origin）
 */
export function useCrossShare(payloadFactory) {
  const scene = ref(getAppScene()) // 1=H5 2=iOS 3=Android 4=微信小程序
  const shareBtnVisible = ref(scene.value !== 4) // 小程序隐藏自定义按钮
  const providers = ref([]) // APP 可用的分享渠道

  // APP 端预拉可用 provider（微信/QQ 是否可分享）
  if (scene.value === 2 || scene.value === 3) {
    uni.getProvider({
      service: 'share',
      success: (res) => { providers.value = res.provider || [] },
      fail: () => { providers.value = [] }
    })
  }

  // 小程序：注册原生右上角转发
  const setupMpShare = () => {
    if (scene.value === 4) {
      onShareAppMessage(() => {
        const { title = '', imageUrl = '', path = '/' } = payloadFactory() || {}
        return { title, imageUrl, path }
      })
      // 朋友圈（仅 mp-weixin）
      onShareTimeline(() => {
        const { title = '', imageUrl = '', path = '/' } = payloadFactory() || {}
        const query = path.includes('?') ? path.split('?')[1] : ''
        return { title, imageUrl, query }
      })
    }
  }

	const getHref = () => {
	  const p = payloadFactory() || {}
	  // 1. 先确定域名（优先顺序：入参h5Base > 全局配置 > H5环境location.origin）
	  const domain =
		(p.h5Base || SHARE_H5_BASE || (scene.value === 1 && typeof location !== 'undefined' && location.origin) || '')
		  .replace(/\/$/, '') // 去掉末尾斜杠

	  // 2. 生成 H5 访问路径（/#/pages/...  或  /pages/...）
	  const h5Path = toH5Path(p.path, p.useHashRouter)

	  // 3. 如果 p.path 已经是完整URL就直接用；否则用 domain 拼接
	  return /^https?:\/\//i.test(p.path) ? p.path : (domain + h5Path)
	}
  const shareClick = () => {
    const p = payloadFactory() || {}
    const href = getHref()

    // ===== APP：优先走原生分享 =====
    if (scene.value === 2 || scene.value === 3) {
      const items = []
      const map = []
      if (providers.value.includes('weixin')) {
        items.push('微信好友', '朋友圈')
        map.push(
          { provider: 'weixin', scene: 'WXSceneSession' },
          { provider: 'weixin', scene: 'WXSceneTimeline' }
        )
      }
      if (providers.value.includes('qq')) {
        items.push('QQ')
        map.push({ provider: 'qq', scene: '' })
      }

      // 没有可用 provider：兜底复制链接（只在 APP 真没装/没配时才会触发）
      if (!items.length) {
        uni.setClipboardData({
          data: href,
          success: () => uni.showToast({ title: '链接已复制' })
        })
        return
      }

      uni.showActionSheet({
        itemList: items,
        success: ({ tapIndex }) => {
          const opt = map[tapIndex]
          if (!opt) return
          uni.share({
            provider: opt.provider,
            scene: opt.scene,
            type: 0,              // 图文链接
            href,                 // 点击后打开的链接（建议给 H5 页面）
            title: p.title || '',
            summary: p.summary || '',
            imageUrl: p.imageUrl || '',
            success: () => uni.showToast({ title: '已分享' }),
            fail: (e) => uni.showToast({ title: e?.errMsg || '分享失败', icon: 'none' })
          })
        }
      })
      return
    }

    // ===== H5：Web Share API 优先，其次复制链接 =====
    if (scene.value === 1) {
      if (typeof navigator !== 'undefined' && navigator.share) {
        navigator.share({ title: p.title || '', text: p.summary || '', url: href })
          .catch(() => {}) // 用户取消不提示
      } else {
        uni.setClipboardData({
          data: href,
          success: () => uni.showToast({ title: '链接已复制' })
        })
      }
      return
    }

    // ===== 小程序：引导使用原生转发 =====
    uni.showToast({ title: '请使用右上角“转发”', icon: 'none' })
  }

  return { shareBtnVisible, setupMpShare, shareClick, getHref }
}