<template>
  <view class="page">
    <!-- 顶部占位（安全区/导航）可选 -->
<!--    <view :style="{ height: headerPlaceholder }"></view> -->

    <!-- 空态 -->
    <view v-if="!loading && sessions.length === 0" class="empty">
      <text class="empty-tips">还没有消息</text>
    </view>

    <!-- 会话列表 -->
    <view v-else class="list">
      <view
        v-for="(s, idx) in sessions"
        :key="s.session_id + ':' + (s.peer_id || idx)"
        class="cell"
        @click="goChat(s)"
      >
        <image class="avatar" :src="s.avatar || defaultAvatar" mode="aspectFill" />
        <view class="meta">
          <view class="row head">
            <text class="name">{{ s.name || '陌生人' }}</text>
            <text class="time">{{ fmtTime(s.last_msg_time) }}</text>
          </view>

          <!-- 这里是消息预览行：确保垂直居中 -->
          <view class="row msg">
            <text class="preview one-line">{{ s.last_msg_preview || '…' }}</text>
            <view v-if="s.unread > 0" class="badge">{{ s.unread > 99 ? '99+' : s.unread }}</view>
          </view>
        </view>
      </view>

      <view class="loading-more" v-if="loadingMore">{{ loadingText }}</view>
      <view class="loading-more" v-else-if="noMore && sessions.length > 0">已经到底啦~</view>
    </view>

    <!-- 底部安全区 -->
    <view :style="{ height: footerPlaceholder }"></view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import {  onShow } from '@dcloudio/uni-app'
import { websiteUrl, global, getHeaderPlaceholderHeight, getFooterPlaceholderHeight } from '@/common/config.js'
import { listSessions, connectIM, closeIM, onIMEvent } from '@/common/im.js'

/** 列表数据与状态 */
const sessions = reactive([])           // 会话数组（元素结构见 upsertSession）
const page = ref(1)
const pageSize = ref(20)
const noMore = ref(false)
const loading = ref(true)
const loadingMore = ref(false)
const loadingText = ref('加载中…')
const defaultAvatar = '/static/avatar-default.png'

/** 安全区占位 */
const headerPlaceholder = ref(getHeaderPlaceholderHeight() + 'px')
const footerPlaceholder = ref(getFooterPlaceholderHeight() + 'px')

/** 自己 uid（用于归并） */
const selfId = ref(0)
try {
  const u = uni.getStorageSync('userInfo') || {}
  selfId.value = Number(u?.id || u?.Id || 0) || 0
} catch(_) {}

/**
 * 兼容后端不同返回结构：
 * 期望后端：{ status, msg, data: { sessions: [], total, page, page_size, self_uid } }
 * 兜底：{ list: [] } 或直接数组
 */
function pickSessionsPayload(res) {
  if (!res) return { list: [], total: 0 }
  if (Array.isArray(res)) return { list: res, total: res.length }
  if (Array.isArray(res?.list)) return { list: res.list, total: Number(res?.total || res.list.length || 0) }
  if (Array.isArray(res?.data?.sessions)) {
    return {
      list: res.data.sessions,
      total: Number(res.data.total || res.data.sessions.length || 0),
      page: Number(res.data.page || 1),
      page_size: Number(res.data.page_size || 0),
      self_uid: Number(res.data.self_uid || 0),
    }
  }
  return { list: [], total: 0 }
}

/** 拉取列表 */
async function fetchList (reset = false) {
  if (reset) {
    page.value = 1
    noMore.value = false
    sessions.splice(0, sessions.length)
  }
  if (noMore.value) return

  const token = uni.getStorageSync('token') || ''
  if (!token) {
    loading.value = false
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }

  if (page.value === 1) loading.value = true
  else loadingMore.value = true

  try {
    const res = await listSessions({ page: page.value, page_size: pageSize.value })
    const { list } = pickSessionsPayload(res)

    list.forEach(item => upsertSession(item))

    // 是否还有更多：后端未提供 has_more，这里用返回条数判断
    noMore.value = list.length < pageSize.value
    page.value += 1
  } catch (e) {
    console.error('fetch sessions error', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

/** 根据 session_id 或 peer_id 定位行 */
function findSessionIndex({ sid, peer_id }) {
  const sidStr = (sid === undefined || sid === null) ? '' : String(sid)
  let idx = -1
  if (sidStr) idx = sessions.findIndex(x => String(x.session_id) === sidStr)
  if (idx < 0 && peer_id) idx = sessions.findIndex(x => Number(x.peer_id || 0) === Number(peer_id))
  return idx
}

/** 远程拉取用户快照（头像/昵称），避免“无头像无名字”占位 */
async function fetchUserSnapshot(uid) {
  if (!uid) return { name: '用户', avatar: '' }
  try {
    const res = await uni.request({ url: `${websiteUrl.value}/user-info?uid=${uid}`, method: 'GET', timeout: 5000 })
    const d = res?.data?.data
    if (res?.data?.status === 'success' && d) {
      return { name: d?.username || d?.user_name || '用户', avatar: d?.avatar || '' }
    }
  } catch (_) {}
  return { name: '用户', avatar: '' }
}

/**
 * 写入/更新一条会话
 * 后端字段（示例）：
 * {
 *   "session_id":"dm-100024-103914",
 *   "peer_id":103914,
 *   "peer_name":"",
 *   "avatar":"https://...",
 *   "last_msg":"333",
 *   "last_msg_time": 1761894026167,
 *   "unread":0
 * }
 */
function upsertSession (s) {
  const sid = (s.session_id === undefined || s.session_id === null) ? '' : String(s.session_id)
  if (!sid && !s.peer_id) return

  const norm = {
    session_id: sid || String(s.id || ''), // 统一存字符串
    peer_id: Number(s.peer_id || 0),
    name: s.name || s.peer_name || s.username || '用户',
    avatar: s.avatar || s.peer_avatar || '',
    last_msg_preview: s.last_msg_preview || s.preview || s.last_msg || '',
    last_msg_time: Number(s.last_msg_time || 0),
    unread: Number(s.unread || s.unread_count || 0),
  }

  const i = findSessionIndex({ sid: norm.session_id, peer_id: norm.peer_id })
  if (i >= 0) {
    const old = sessions[i]
    const merged = { ...old, ...norm }
    sessions.splice(i, 1)
    sessions.unshift(merged)
  } else {
    sessions.unshift(norm)
  }
}

/** WebSocket 事件处理：来消息 / 已读 */
async function handleIMEvent (evt) {
  if (!evt || evt.type !== 'im.event') return
  const ev = (evt.event || '').toLowerCase()
  const data = evt.data || {}

  if (ev === 'message') {
    const sid = (data.session_id === undefined || data.session_id === null) ? '' : String(data.session_id)
    const msg = data.message || {}
    const from = Number(msg.sender_id || 0)

    // 计算预览
    const preview = previewFromContent(msg.content)
    const msgTime = Number(msg.msg_time || Date.now())

    // 先按 peer_id（sender）归并，避免出现“陌生人”临时行
    const targetPeer = (from && from !== selfId.value) ? from : Number(data.peer_id || 0)
    let idx = findSessionIndex({ sid, peer_id: targetPeer })

    if (idx < 0 && targetPeer) {
      // 不在列表中：拉取一次用户快照，创建一行
      const snap = await fetchUserSnapshot(targetPeer)
      upsertSession({
        session_id: sid || `dm-${Math.min(selfId.value, targetPeer)}-${Math.max(selfId.value, targetPeer)}`,
        peer_id: targetPeer,
        name: snap.name,
        avatar: snap.avatar,
        last_msg: preview,
        last_msg_preview: preview,
        last_msg_time: msgTime,
        unread: (from && from !== selfId.value) ? 1 : 0,
      })
      return
    }

    // 已存在：更新内容并累加未读（自己发的不+1）
    if (idx >= 0) {
      const row = sessions[idx]
      const next = {
        ...row,
        last_msg_preview: preview,
        last_msg_time: msgTime,
        unread: (from && from !== selfId.value) ? Math.min(999, Number(row.unread || 0) + 1) : row.unread,
      }
      sessions.splice(idx, 1)
      sessions.unshift(next)
    }
  }

  if (ev === 'read') {
    const sid = (data.session_id === undefined || data.session_id === null) ? '' : String(data.session_id)
    const reader = Number(data.user_id || data.reader_id || data.uid || 0)
    if (!sid || !reader) return
    if (reader === selfId.value) {
      // 我自己的 read，不影响列表；通常服务端会在下次拉列表时把我的未读置 0，这里忽略
      return
    }
    // 对方读了某会话：不动角标（按你的现有产品体验保持不动）
  }
}

/** 把 content 映射成简明预览 */
function previewFromContent (content) {
  if (!content || !content.type) return ''
  const t = content.type
  if (t === 'text') return content.text || ''
  if (t === 'emoji') return '[表情]'
  if (t === 'image') return '[图片]'
  if (t === 'other') return content?.other?.biz ? `[${content.other.biz}]` : '[其它]'
  return ''
}

/** 时间显示：今天显示 HH:mm，非今天显示 MM-DD */
function fmtTime (ms) {
  const n = Number(ms || 0)
  if (!n) return ''
  const d = new Date(n)
  const now0 = new Date()
  now0.setHours(0, 0, 0, 0)
  if (n >= now0.getTime()) {
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`
  }
  return `${pad(d.getMonth()+1)}-${pad(d.getDate())}`
}
function pad (n) { return n < 10 ? '0'+n : ''+n }

/** 进入聊天页 */
function goChat (s) {
  uni.navigateTo({
    url: `/pkg-im/chat/chat?session_id=${encodeURIComponent(String(s.session_id))}&peer_id=${Number(s.peer_id || 0)}`
  })
}

/** 生命周期 */
onMounted(async () => {

  connectIM()
  onIMEvent(handleIMEvent)
})

onShow(async () => {
	uni.setNavigationBarTitle({
		title: "聊天列表"
	})
	await fetchList(true)
})

onUnmounted(() => {
  // closeIM() // 如需离开就断开，可开启
})

/** 下拉刷新 & 暴露方法（可选） */
uni.stopPullDownRefresh?.()
defineExpose({ fetchList })
</script>

<style scoped>
.page { min-height: 100vh; background: #fff; }
.list { padding: 12px; }
.cell {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 10px 0;
}
.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #f2f2f2;
}
.meta { flex: 1; margin-left: 12px; min-width: 0; }
.row { display: flex; flex-direction: row; align-items: center; }
.row.head { margin-bottom: 4px; }
.row.msg  { min-height: 20px; align-items: center; }

.name {
  font-size: 16px;
  font-weight: 600;
  color: #111;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.time { font-size: 12px; color: #999; margin-left: 8px; }

.preview {
  flex: 1;
  font-size: 14px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 20px;
}
.one-line {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.badge {
  min-width: 18px;
  padding: 0 6px;
  height: 18px;
  line-height: 18px;
  border-radius: 9px;
  background: #ff4d4f;
  color: #fff;
  font-size: 12px;
  text-align: center;
  margin-left: 8px;
}
.loading-more { text-align: center; color: #999; font-size: 12px; padding: 12px 0; }
.empty { padding-top: 20vh; text-align: center; color: #999; }
.empty-img { width: 160px; height: 160px; margin: 0 auto 8px; opacity: 0.7; }
.empty-tips { font-size: 14px; }
</style>
