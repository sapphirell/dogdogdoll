// /common/share.js
import { ref } from 'vue'
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { USE_HASH_ROUTER } from '@/common/config.js'

const H5_BASE_DOMAIN = 'https://m.dogdogdoll.com'

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
 */
export function useCrossShare(payloadFactory) {
  const scene = ref(getAppScene()) // 1=H5 2=iOS 3=Android 4=微信小程序
  const shareBtnVisible = ref(scene.value !== 4) // 小程序隐藏自定义按钮

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

    // 1) path 若已是完整 URL，直接使用
    if (p.path && /^https?:\/\//i.test(p.path)) return p.path

    // 2) 固定域名 + H5 路由拼接
    const domain = String(H5_BASE_DOMAIN || '').replace(/\/$/, '')
    const h5Path = toH5Path(p.path, p.useHashRouter)
    return domain + h5Path
  }

  const shareClick = () => {
    // 小程序：引导使用原生转发（右上角）
    if (scene.value === 4) {
      uni.showToast({ title: '请使用右上角“转发”', icon: 'none' })
      return
    }

    // 其它环境：统一复制 URL
    const href = getHref()
    uni.setClipboardData({
      data: href,
      success: () => uni.showToast({ title: '链接已复制' }),
      fail: () => uni.showToast({ title: '复制失败', icon: 'none' })
    })
  }

  return { shareBtnVisible, setupMpShare, shareClick, getHref }
}
