<template>
  <!-- 版本检查组件 -->
  <view>
    <!-- 新版本提示弹窗（仅用于“壳升级”提示；wgt 升级静默不弹窗） -->
    <common-modal :visible="modalVisible" @update:visible="modalVisible = $event" top="15vh">
      <view class="version-update-container">
        <view class="update-title">
          发现新版本 v{{ newVersionInfo?.version || '-' }} 当前 v{{ dogdogdollVersion }}
        </view>

        <scroll-view class="update-content" scroll-y>
          <view class="update-section">
            <view class="section-title">更新内容</view>
            <view class="section-content">
              {{ newVersionInfo?.note || '优化用户体验，修复已知问题' }}
            </view>
          </view>
          <view class="update-section">
            <view class="section-title">更新日期</view>
            <view class="section-content">{{ formatTime(newVersionInfo?.created_at) }}</view>
          </view>
        </scroll-view>

        <!-- 下载中：显示进度条面板（Android 整包） -->
        <view v-if="isApkDownloading" class="download-panel">
          <view class="progress-row">
            <view class="progress-bar">
              <view class="progress-inner" :style="{ width: apkProgress + '%' }"></view>
            </view>
            <text class="progress-percent">{{ apkProgress }}%</text>
          </view>

          <view class="progress-meta">
            <text class="meta-item">{{ apkDownloadedText }} / {{ apkTotalText }}</text>
            <text class="meta-dot">·</text>
            <text class="meta-item">{{ apkSpeedText }}</text>
            <text class="meta-dot" v-if="apkEtaText">·</text>
            <text class="meta-item" v-if="apkEtaText">约 {{ apkEtaText }} 完成</text>
          </view>

          <view class="progress-tips">请勿退出应用或锁屏，以免下载被系统暂停</view>
        </view>

        <!-- 未下载：显示按钮 -->
        <view class="update-buttons" v-else>
          <button class="update-btn ignore" @tap="ignoreUpdate">暂不更新</button>
          <button class="update-btn confirm" @tap="handleUpdate">立即更新</button>
        </view>
      </view>
    </common-modal>

    <!-- 已是最新版本提示 -->
    <view v-if="showUpToDateToast" class="toast-message">
      <text>已是最新版本</text>
    </view>
  </view>
</template>

<script setup>
/**
 * 版本检查（含 wgt 热更新 + 壳整包）
 * 规则：
 *  - H5、小程序：不检查/不弹窗
 *  - App：
 *      1) 请求 /latest-version/v2?shell_version=&wgt_version=
 *      2) 若 update_type === 'wgt'：静默下载 wgt -> 安装 -> restart
 *      3) 若 update_type === 'shell'：先静默下载 wgt -> 安装 -> restart
 *         重启后读取 pendingShellUpdate（本地存储）-> 弹出壳升级
 *         点击“立即更新”：Android 打开 APK 安装；iOS 跳 App Store
 *         点击“暂不更新”：记录忽略期 3 天
 *  - 兼容旧后端：v2 调用失败时回退 /latest-version?version=
 */

import { ref, onMounted, computed } from 'vue'
import {
  websiteUrl,
  getScene,
  dogdogdollVersion,      // 作为 WGT 版本
  getAppShellVersion,     // 从你的 config.js 中引入
} from '../../common/config.js'

// 组件入参：保持与旧逻辑一致
const props = defineProps({
  // 是否显示“已是最新版本”的提示
  showUpToDateToast: { type: Boolean, default: false },
  // 当前版本号（可选，未使用，保留兼容）
  currentVersion: { type: String, required: false },
  // 是否自动检查
  autoCheck: { type: Boolean, default: true },
})

// --- UI/状态 ---
const modalVisible = ref(false)         // 壳升级弹窗
const newVersionInfo = ref(null)        // 后端返回版本信息（用于弹窗）
const showUpToDateToast = ref(false)    // 已是最新提示
const cv = ref('1.0.0')                 // 仅展示/调试

// 下载进度（仅 Android 整包）
const isApkDownloading = ref(false)
const apkProgress = ref(0)                 // 0~100
const apkDownloaded = ref(0)               // bytes
const apkTotal = ref(0)                    // bytes
const apkSpeedText = ref('')               // 如 "1.2 MB/s"
const apkEtaText = ref('')                 // 如 "1分23秒"
let _lastBytes = 0
let _lastTs = 0

// 平台信息（保留旧逻辑）
const platform = computed(() => {
  const s = uni.getSystemInfoSync()
  return (s.platform || 'unknown').toLowerCase()
})

// 常量 Key（本地存储）
const IGNORE_SHELL_KEY = 'ignoreShellUpdateUntil'     // 仅对“壳升级弹窗”生效
const IGNORE_COMPAT_KEY = 'ignoreUpdateTime'          // 兼容旧逻辑的 key
const PENDING_SHELL_INFO_KEY = 'pendingShellUpdate'   // 用于重启后弹出壳升级

// App Store 链接（iOS 整包）
const IOS_APPSTORE_URL = 'https://apps.apple.com/app/id6747564362'

// ============ 工具函数 ============
const formatTime = (timestamp) => {
  if (!timestamp) return '未知日期'
  const date = new Date(Number(timestamp) * 1000)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** 字节格式化 */
function formatSize(bytes = 0) {
  if (!bytes || bytes <= 0) return '0 B'
  const kb = 1024
  const mb = kb * 1024
  const gb = mb * 1024
  if (bytes >= gb) return (bytes / gb).toFixed(2) + ' GB'
  if (bytes >= mb) return (bytes / mb).toFixed(2) + ' MB'
  if (bytes >= kb) return (bytes / kb).toFixed(2) + ' KB'
  return bytes + ' B'
}

/** 速度格式化（B/s -> 文本） */
function formatSpeed(bps = 0) {
  if (bps <= 0) return '0 B/s'
  const kb = 1024
  const mb = kb * 1024
  if (bps >= mb) return (bps / mb).toFixed(2) + ' MB/s'
  if (bps >= kb) return (bps / kb).toFixed(2) + ' KB/s'
  return bps.toFixed(0) + ' B/s'
}

/** 剩余时间格式化（秒） */
function formatETA(sec = 0) {
  if (!isFinite(sec) || sec <= 0) return ''
  const s = Math.round(sec)
  const m = Math.floor(s / 60)
  const r = s % 60
  if (m <= 0) return `${r}秒`
  return `${m}分${r}秒`
}

/** 忽略期检查（仅对“壳升级弹窗”有效；wgt 不受忽略期影响） */
function isIgnoredShell() {
  const now = Date.now()
  const v1 = Number(uni.getStorageSync(IGNORE_SHELL_KEY) || 0)
  const v2 = Number(uni.getStorageSync(IGNORE_COMPAT_KEY) || 0) // 兼容旧 key
  const until = Math.max(v1, v2) || 0

  // ===== 新增详细日志 =====
  console.log('[Update][Ignore] isIgnoredShell() -> now=', now, 'v1=', v1, 'v2=', v2, 'pickedUntil=', until, 'ignored=', until > now)
  if (until > 0) {
    console.log('[Update][Ignore] untilReadable=', new Date(until).toISOString())
    console.log('[Update][Ignore] sourceKey=', (v1 >= v2 ? IGNORE_SHELL_KEY : IGNORE_COMPAT_KEY))
  } else {
    console.log('[Update][Ignore] no ignore timestamp stored')
  }
  // ===== 日志结束 =====

  return until > now
}

/** 设置忽略期：3 天 */
function setIgnoreShell3Days() {
  const until = Date.now() + 3 * 24 * 60 * 60 * 1000
  uni.setStorageSync(IGNORE_SHELL_KEY, until)
  // 同时写入旧 key，兼容你的老逻辑
  uni.setStorageSync(IGNORE_COMPAT_KEY, until)

  // ===== 新增详细日志 =====
  console.log('[Update][Ignore] setIgnoreShell3Days() -> set until:', until, '(', new Date(until).toISOString(), ')')
  console.log('[Update][Ignore] keys written:', IGNORE_SHELL_KEY, ',', IGNORE_COMPAT_KEY)
  // ===== 日志结束 =====
}

/** 兜底获取壳版本（如果未引入新方法，也能工作） */
function safeGetShellVersion() {
  try {
    if (typeof getAppShellVersion === 'function') {
      const v = getAppShellVersion()
      console.log('[Update] safeGetShellVersion() ->', v)
      return v
    }
  } catch (e) {
    console.warn('[Update] safeGetShellVersion() fallback error:', e)
  }
  const info = uni.getAppBaseInfo?.() || {}
  const v = info.appVersion || dogdogdollVersion
  console.log('[Update] safeGetShellVersion() fallback ->', v)
  return v
}

/** plus 可用性检查 */
function ensurePlusAvailable() {
  if (typeof plus === 'undefined' || !plus.runtime) {
    uni.showToast({ title: '仅 App 内可更新', icon: 'none' })
    console.warn('[Update] ensurePlusAvailable(): plus.runtime is not available')
    return false
  }
  return true
}

// ============ 下载/安装动作 ============

/** 下载并安装 wgt（静默） */
function downloadAndInstallWGT(wgtUrl, onSuccess) {
  console.log(`[热更新] 进入逻辑, 目标地址: ${wgtUrl}`);

  if (!wgtUrl) {
    console.warn("[热更新] 未提供 wgtUrl, 跳过更新逻辑");
    onSuccess && onSuccess();
    return;
  }

  if (!ensurePlusAvailable()) {
    console.error("[热更新] plus 环境不可用，终止执行");
    return;
  }

  console.log(`[热更新] 准备开始下载 wgt 包: ${wgtUrl}`);

  const dtask = plus.downloader.createDownload(
    wgtUrl,
    { filename: "_doc/update/" }, // 可指定临时目录
    (d, status) => {
      console.log(`[热更新] 下载任务回调触发, 状态码: ${status}`);

      if (status === 200) {
        console.log(`[热更新] 下载完成, 文件路径: ${d.filename}`);
        console.log("[热更新] 开始执行安装...");

        plus.runtime.install(
          d.filename,
          { force: true },
          () => {
            console.log("[热更新] 安装成功, 即将重启应用");
            onSuccess && onSuccess();
            plus.runtime.restart();
          },
          (e) => {
            console.error("[热更新] wgt 安装失败:", JSON.stringify(e));
            uni.showToast({ title: "热更安装失败", icon: "none" });
          }
        );
      } else {
        console.error(`[热更新] wgt 下载失败, HTTP 状态码: ${status}`);
        uni.showToast({ title: "热更下载失败", icon: "none" });
      }
    }
  );

  // 添加进度监听
  dtask.addEventListener("statechanged", (download) => {
    switch (download.state) {
      case 1:
        console.log("[热更新] 下载任务已开始");
        break;
      case 2:
        console.log("[热更新] 已连接服务器");
        break;
      case 3:
        console.log(`[热更新] 下载中... 已完成: ${download.downloadedSize}/${download.totalSize}`);
        break;
      case 4:
        console.log("[热更新] 下载完成，等待回调处理");
        break;
    }
  });

  console.log("[热更新] 开始执行下载任务");
  dtask.start();
}


/** 打开 APK 安装界面（Android）或跳 App Store（iOS） —— 带进度条 */
function installShellPackage(androidApkUrl) {
  const scene = getScene()
  if (scene === 2) {
    // iOS：跳转 App Store
    console.log('[Update] installShellPackage(): iOS -> open App Store')
    plus.runtime.openURL(IOS_APPSTORE_URL)
    return
  }
  if (scene === 3) {
    // Android：下载并打开安装界面（带进度条）
    if (!androidApkUrl) {
      console.warn('[Update] installShellPackage(): androidApkUrl empty, open website fallback')
      plus.runtime.openURL('https://www.dogdogdoll.com/')
      return
    }
    if (!ensurePlusAvailable()) return

    // 打开下载面板
    isApkDownloading.value = true
    apkProgress.value = 0
    apkDownloaded.value = 0
    apkTotal.value = 0
    apkSpeedText.value = ''
    apkEtaText.value = ''
    _lastBytes = 0
    _lastTs = Date.now()

    console.log('[Update][APK] start download ->', androidApkUrl)

    const dtask = plus.downloader.createDownload(androidApkUrl, { filename: "_doc/update/" }, (d, status) => {
      // 结束下载态
      isApkDownloading.value = false
      console.log('[Update][APK] download finished, status=', status, 'file=', d?.filename)

      if (status === 200) {
        try {
          plus.runtime.openFile(d.filename)
          console.log('[Update][APK] openFile success')
        } catch (e) {
          console.error('[Update][APK] openFile fail:', e)
          plus.runtime.openURL(androidApkUrl)
        }
      } else {
        console.error('[Update][APK] 下载失败', status)
        uni.showToast({ title: '整包下载失败', icon: 'none' })
      }
    })

    // 进度监听
    dtask.addEventListener('statechanged', (download) => {
      if (download.state === 3) {
        const total = download.totalSize || 0
        const done = download.downloadedSize || 0
        apkTotal.value = total
        apkDownloaded.value = done

        if (total > 0) {
          apkProgress.value = Math.max(0, Math.min(100, Math.floor(done * 100 / total)))
        } else {
          // 某些服务器不返回 Content-Length
          apkProgress.value = 0
        }

        const now = Date.now()
        const deltaB = done - _lastBytes
        const deltaT = (now - _lastTs) / 1000
        if (deltaT > 0 && deltaB >= 0) {
          const bps = deltaB / deltaT
          apkSpeedText.value = formatSpeed(bps)
          const remain = total > 0 ? (total - done) / (bps || 1) : 0
          apkEtaText.value = formatETA(remain)
          _lastBytes = done
          _lastTs = now
        }
      }
    })

    dtask.start()
    return
  }

  // 其它场景（理论不会走到）
  console.warn('[Update] installShellPackage(): unexpected scene -> show modal')
  uni.showModal({
    title: '更新提示',
    content: '请前往应用商店更新最新版本',
    showCancel: false,
  })
}

// ============ 核心：检查逻辑（含回退旧接口） ============

/**
 * 旧接口回退（/latest-version?version=）
 * 仅用于兼容非常老的服务端；不能区分 wgt/shell，只能提示有新版本。
 */
async function fallbackCheckOld() {
  console.log('[Update] fallbackCheckOld(): call /latest-version')
  const res = await uni.request({
    url: `${websiteUrl.value}/latest-version?version=${dogdogdollVersion}`,
    method: 'GET',
  })
  const ok = res?.data?.status === 'success' && res.data.data
  console.log('[Update] fallbackCheckOld() -> ok=', ok)
  if (ok) {
    newVersionInfo.value = res.data.data
    modalVisible.value = true
  } else if (props.showUpToDateToast) {
    showUpToDateToast.value = true
    setTimeout(() => (showUpToDateToast.value = false), 2000)
  }
}

/**
 * v2 新接口（/latest-version/v2）
 * 依据 update_type = 'wgt' | 'shell' 执行不同策略
 */
async function checkV2(shellVersion, wgtVersion) {
  console.log('[Update] checkV2(): shell=', shellVersion, 'wgt=', wgtVersion, 'url=', websiteUrl.value)
  const res = await uni.request({
    url: `${websiteUrl.value}/latest-version/v2?shell_version=${encodeURIComponent(shellVersion)}&wgt_version=${encodeURIComponent(wgtVersion)}`,
    method: 'GET',
  })
  const ok = res?.data?.status === 'success'
  const data = res?.data?.data
  console.log('[Update] checkV2() -> ok=', ok, 'data=', data)

  if (!ok || !data) {
    await fallbackCheckOld()
    return
  }

  const type = String(data.update_type || '').toLowerCase()
  console.log('[Update] checkV2() -> update_type=', type)

  if (type === 'wgt') {
    console.log('[Update] wgt only: start download+install')
    downloadAndInstallWGT(data.wgt_url)
    return
  }

  if (type === 'shell') {
    // 壳升级：先同步 wgt（若有），重启后再弹壳升级（通过本地标记）
    const payloadForNextLaunch = {
      version: data.version,
      note: data.note,
      created_at: data.created_at,
      android_pkg_url: data.android_pkg_url || '',
      wgt_url: data.wgt_url || '',
      // 用于本地“立即更新”判断
      update_type: 'shell',
    }
    uni.setStorageSync(PENDING_SHELL_INFO_KEY, JSON.stringify(payloadForNextLaunch))
    console.log('[Update] shell update: write pending ->', payloadForNextLaunch)

    if (data.wgt_url) {
      console.log('[Update] shell+WGT: first apply WGT then restart (pending kept)')
      downloadAndInstallWGT(data.wgt_url, () => {
        // onSuccess 内已 restart
      })
    } else {
      // 无 wgt：直接当前会话弹窗（受忽略期控制）
      const ignored = isIgnoredShell()
      console.log('[Update] shell(no wgt): ignored=', ignored)
      if (!ignored) {
        newVersionInfo.value = payloadForNextLaunch
        modalVisible.value = true
        console.log('[Update] shell(no wgt): show modal immediately')
      } else {
        console.log('[Update] shell(no wgt): ignored by window')
      }
    }
    return
  }

  // 没有需要更新
  if (props.showUpToDateToast) {
    showUpToDateToast.value = true
    setTimeout(() => (showUpToDateToast.value = false), 2000)
  }
}

/** 公共入口：检查版本（供父组件调用） */
const checkVersion = async () => {
  try {
    // 场景限制：H5 / 小程序 不检查
    const scene = getScene()
    console.log('[Update] checkVersion(): scene=', scene)
    if (scene === 1 || scene === 4) {
      console.log('H5/MP 场景不检查版本，scene=', scene)
      return
    }

    // 壳弹窗的忽略期（仅影响“壳升级弹窗”，不影响 wgt 静默）
    // 需要在“检查”前就处理 pending-shell（因为 pending 是“重启后立刻提示”）
    const ignored = isIgnoredShell()
    console.log('[Update] checkVersion(): ignored=', ignored)

    if (!ignored) {
      // 若存在“待壳升级信息”，优先弹窗
      const text = uni.getStorageSync(PENDING_SHELL_INFO_KEY)
      console.log('[Update] checkVersion(): pendingText exists=', !!text)
      if (text) {
        try {
          const info = JSON.parse(text || '{}')
          console.log('[Update] checkVersion(): parsed pending ->', info)
          // 用于弹窗展示
          newVersionInfo.value = info || {}
          modalVisible.value = true
          // 不在此处清除标记；待用户点击“更新/忽略”后清理
          return
        } catch (e) {
          console.warn('[Update] checkVersion(): pending parse error -> clear key', e)
          uni.removeStorageSync(PENDING_SHELL_INFO_KEY)
        }
      }
    } else {
      console.log('[Update] checkVersion(): ignored -> skip pending-shell showing at this time')
    }

    // 到这里表示：没有 pending-shell，需要发起真正的“在线检查”
    const shellVersion = safeGetShellVersion()     // 外壳版本（App Store / APK）
    const wgtVersion = dogdogdollVersion           // WGT 版本（config.js 中维护）
    await checkV2(shellVersion, wgtVersion)
  } catch (err) {
    console.error('版本检查失败：', err)
  }
}

// ============ 弹窗按钮事件 ============

/** 立即更新（仅壳升级弹窗会出现） */
function handleUpdate() {
  // 记录忽略期（避免用户来回点），但真正安装会引导系统安装
  setIgnoreShell3Days()
  // 不关闭弹窗，切换为下载进度面板（Android）
  const info = newVersionInfo.value || {}
  const pendingText = uni.getStorageSync(PENDING_SHELL_INFO_KEY)
  if (pendingText && !info.android_pkg_url) {
    try {
      const p = JSON.parse(pendingText)
      // 兜底填充
      info.android_pkg_url = info.android_pkg_url || p.android_pkg_url
    } catch (e) {
      console.warn('[Update] handleUpdate(): parse pending error', e)
    }
  }
  console.log('[Update] handleUpdate(): start install shell package ->', info.android_pkg_url)
  // Android：下载 APK 并打开安装界面；iOS：跳 App Store
  installShellPackage(info.android_pkg_url)

  // 清除 pending 标记（避免下次启动继续弹）
  uni.removeStorageSync(PENDING_SHELL_INFO_KEY)
  console.log('[Update] handleUpdate(): remove PENDING key')
}

/** 暂不更新（仅壳升级弹窗） */
function ignoreUpdate() {
  setIgnoreShell3Days()
  modalVisible.value = false
  // 清除 pending 标记
  uni.removeStorageSync(PENDING_SHELL_INFO_KEY)
  console.log('[Update] ignoreUpdate(): set ignore & remove PENDING key')
}

// ============ 生命周期 ============

onMounted(() => {
  cv.value = uni.getAppBaseInfo?.().appVersion || cv.value
  if (props.autoCheck) {
    // 稍作延迟，避免与首页重型请求、首屏动画等冲突
    setTimeout(() => {
      checkVersion()
    }, 1500)
  }
})

// —— 供模板展示的计算文本 —— //
const apkDownloadedText = computed(() => formatSize(apkDownloaded.value))
const apkTotalText = computed(() => apkTotal.value > 0 ? formatSize(apkTotal.value) : '未知大小')

// ============ 调试/强制弹窗辅助（可在控制台调用） ============
/** 清空忽略期（下次检查不再受限） */
function debugClearIgnore() {
  uni.removeStorageSync(IGNORE_SHELL_KEY)
  uni.removeStorageSync(IGNORE_COMPAT_KEY)
  console.log('[Debug] debugClearIgnore(): removed keys ->', IGNORE_SHELL_KEY, ',', IGNORE_COMPAT_KEY)
}
/** 把忽略期设置为“过去”（立即视为过期） */
function debugExpireIgnoreNow() {
  const past = Date.now() - 1000
  uni.setStorageSync(IGNORE_SHELL_KEY, past)
  uni.setStorageSync(IGNORE_COMPAT_KEY, past)
  console.log('[Debug] debugExpireIgnoreNow(): set past ->', past, new Date(past).toISOString())
}
/** 强制写入一个 pending-shell 并立刻尝试弹窗（用于无后端配合的 UI 自测） */
function debugForceShowShellUpdate() {
  const mock = {
    version: '9.9.9',
    note: '【调试】这是一个模拟的版本说明',
    created_at: Math.floor(Date.now() / 1000),
    android_pkg_url: 'https://images1.fantuanpu.com/apk/dogdogdoll-v1.1.4.apk',
    wgt_url: '',
    update_type: 'shell',
  }
  uni.setStorageSync(PENDING_SHELL_INFO_KEY, JSON.stringify(mock))
  debugExpireIgnoreNow()
  console.log('[Debug] debugForceShowShellUpdate(): write mock pending & expire ignore, then show modal')
  // 直接弹窗
  newVersionInfo.value = mock
  modalVisible.value = true
}

// 暴露方法给父组件或控制台
defineExpose({
  checkVersion,
  debugClearIgnore,
  debugExpireIgnoreNow,
  debugForceShowShellUpdate
})
</script>

<style lang="less">
.version-update-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30rpx;
  width: 600rpx;
  box-sizing: border-box;

  .update-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 30rpx;
    text-align: center;
  }

  .update-content {
    width: 100%;
    max-height: 300rpx;
    margin-bottom: 40rpx;
    border-radius: 12rpx;
    background-color: #f8f9fa;
    padding: 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

    .update-section {
      margin-bottom: 40rpx;

      .section-title {
        font-size: 26rpx;
        font-weight: bold;
        color: #4a90e2;
        margin-bottom: 10rpx;
        position: relative;
        padding-left: 20rpx;

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 8rpx;
          height: 26rpx;
          background: linear-gradient(to bottom, #4facfe, #00f2fe);
          border-radius: 4rpx;
        }
      }

      .section-content {
        font-size: 24rpx;
        color: #666;
        line-height: 1.6;
        padding-left: 20rpx;
        word-break: break-word;
		white-space: pre-wrap;
      }
    }
  }

  /* 下载进度面板 */
  .download-panel {
    width: 100%;
    margin-top: 10rpx;

    .progress-row {
      display: flex;
      align-items: center;
      gap: 16rpx;
      margin-bottom: 16rpx;

      .progress-bar {
        flex: 1;
        height: 16rpx;
        background: #eef2f6;
        border-radius: 12rpx;
        overflow: hidden;
      }
      .progress-inner {
        height: 100%;
        background: linear-gradient(90deg, #a6e9f7, #1ed1e1);
        width: 0%;
        transition: width .15s linear;
      }
      .progress-percent {
        width: 90rpx;
        text-align: right;
        font-size: 24rpx;
        color: #333;
      }
    }

    .progress-meta {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12rpx;
      margin-bottom: 10rpx;
      font-size: 24rpx;
      color: #666;

      .meta-item { }
      .meta-dot { color: #999; }
    }

    .progress-tips {
      font-size: 22rpx;
      color: #999;
      text-align: center;
    }
  }

  .update-buttons {
    display: flex;
    justify-content: space-between;
    width: 100%;
    gap: 20rpx;

    .update-btn {
      flex: 1;
      height: 60rpx;
      border-radius: 40rpx;
      font-size: 24rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;
      position: relative;
      overflow: hidden;

      &::after { border: none; }

      &.ignore {
        background-color: #f5f5f5;
        color: #666;
        border: 1rpx solid #e5e5e5;
        &:active { background-color: #e5e5e5; transform: translateY(2rpx); }
      }

      &.confirm {
        background: linear-gradient(135deg, #a6e9f7, #1ed1e1);
        color: white;
        box-shadow: 0 4rpx 12rpx rgba(30, 209, 225, 0.4);
        &:active {
          opacity: 0.9;
          transform: translateY(2rpx);
          box-shadow: 0 2rpx 6rpx rgba(30, 209, 0.4);
        }
      }
    }
  }
}

.toast-message {
  position: fixed;
  bottom: 150rpx;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 20rpx 40rpx;
  border-radius: 50rpx;
  font-size: 26rpx;
  z-index: 9999;
  animation: fadeInOut 2s forwards;
}

@keyframes fadeInOut {
  0% { opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { opacity: 0; }
}
</style>
