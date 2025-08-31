<template>
  <view class="artist-container">
    <!-- 顶部 Tab，与妆图设置同风格 -->
    <view class="tabs">
      <view class="tab-item" :class="{ active: activeTab === 'list' }" @click="switchTab('list')">毛图列表</view>
      <view class="tab-item" :class="{ active: activeTab === 'highlight' }" @click="switchTab('highlight')">置顶展示图</view>
    </view>

    <!-- ===== 毛图列表（默认） ===== -->
    <view v-if="activeTab === 'list'" class="faceup-tab">
      <scroll-view class="faceup-scroll" scroll-y @scrolltolower="loadMore" :lower-threshold="60">
        <view class="faceup-list two-col">
          <view v-for="item in list" :key="item.id" class="faceup-card">
            <image :src="item.cover_image || defaultCover" mode="aspectFill" class="card-cover" @click="previewOne(item.cover_image)"></image>
            <view class="card-body">
              <view class="card-title">{{ item.wig_name || '未命名假发' }}</view>

              <view class="faceup-tags" v-if="item.style_tag_names && item.style_tag_names.length">
                <view class="tag" v-for="(t, i) in item.style_tag_names" :key="i">{{ t }}</view>
              </view>

              <view class="kv"><text class="k">材质</text><text class="v">{{ item.wig_material || '—' }}</text></view>
              <view class="kv"><text class="k">颜色</text><text class="v">{{ item.wig_color || '—' }}</text></view>

              <view class="row-actions">
                <button class="btn primary light" @tap="openEdit(item.id)">编辑</button>
                <button class="btn danger light" @tap="doDelete(item.id)">删除</button>
              </view>
            </view>
          </view>
        </view>

        <view class="list-footer">
          <text v-if="loading">加载中...</text>
          <text v-else-if="noMore && list.length">没有更多了</text>
          <text v-else-if="!list.length">暂无数据</text>
        </view>
      </scroll-view>

      <!-- 悬浮新增 -->
      <view class="add-btn" @click="openCreate">
        <uni-icons type="plus" size="24" color="#fff"></uni-icons>
        <text>新增假发</text>
      </view>
    </view>

    <!-- ===== 置顶展示图（毛娘：hairstylist_highlight_images） ===== -->
    <view v-else class="highlight-tab">
      <scroll-view class="highlight-scroll" scroll-y>
        <view class="highlight-list two-col-cards">
          <view v-for="(img, index) in artistInfo.hairstylist_highlight_images" :key="index" class="highlight-item">
            <image :src="img" mode="aspectFill" class="highlight-img" @click="previewHairImage(index)"></image>
            <view class="highlight-actions">
              <uni-icons type="trash" size="22" color="#fff" @click="deleteHairHighlight(index)"></uni-icons>
            </view>
          </view>
        </view>
      </scroll-view>

      <view class="add-btn" @click="handleUploadHairHighlight">
        <uni-icons type="plus" size="24" color="#fff"></uni-icons>
        <text>添加展示图</text>
      </view>

      <view class="upload-progress" v-if="uploading">
        <progress :percent="uploadProgress" stroke-width="4" activeColor="#4a9db5" />
        <text>{{ uploadStatusText }}</text>
      </view>
    </view>

    <!-- ===== 新增/编辑弹窗（可点击蒙版关闭） ===== -->
    <uni-popup ref="formPopup" type="center" :mask-click="true">
      <view class="popup">
        <view class="popup-title">{{ form.id ? '编辑假发' : '新增假发' }}</view>
        <view class="form">
          <view class="form-item">
            <text class="label">名称</text>
            <input class="ipt" v-model="form.wig_name" placeholder="必填：假发名称" />
          </view>

          <view class="form-item">
            <text class="label">材质</text>
            <picker :range="materials" :value="matIndex" @change="matChange">
              <view class="picker-like">{{ materials[matIndex] || '请选择材质' }}</view>
            </picker>
          </view>

          <view class="form-item">
            <text class="label">颜色</text>
            <input class="ipt" v-model="form.wig_color" placeholder="如：亚麻金 / 灰紫" />
          </view>

          <view class="form-item">
            <text class="label">风格标签</text>
            <view class="tag-box">
              <button class="btn white big" @tap="openTagSelector">选择风格</button>
              <view class="chips" v-if="selectedTagIds.length">
                <view class="chip" v-for="tid in selectedTagIds" :key="tid">
                  {{ tagName(tid) }}<text class="chip-x" @tap="removeTag(tid)">×</text>
                </view>
              </view>
              <text v-else class="hint">未选择</text>
            </view>
          </view>

          <!-- 假发图片（多图） -->
          <view class="form-item">
            <text class="label">假发图片</text>
            <view class="img-grid">
              <view class="img-box" v-for="(u,idx) in formImages" :key="idx">
                <image :src="u" mode="aspectFill" class="img" @click="previewFormImage(idx)"/>
                <view class="img-del" @click="removeFormImage(idx)">
                  <uni-icons type="closeempty" size="18" color="#fff"></uni-icons>
                </view>
              </view>
              <view class="img-add" @click="uploadFormImages">
                <uni-icons type="plus" size="28"></uni-icons>
                <text>添加</text>
              </view>
            </view>
          </view>
        </view>

        <view class="popup-actions">
          <button class="btn flat cancel" @tap="closeForm">取消</button>
          <button class="btn flat primary-strong" :disabled="saving" @tap="submitForm">{{ saving ? '提交中...' : '保存' }}</button>
        </view>
      </view>
    </uni-popup>

    <!-- ===== 风格分组多选（可点击蒙版关闭） ===== -->
    <uni-popup ref="tagPopup" type="bottom" :mask-click="true">
      <view class="tag-popup">
        <view class="tag-header">
          <text class="title">选择风格</text>
          <view class="ops">
            <button class="btn flat ghost" @tap="clearTags">清空</button>
            <button class="btn flat primary-strong" @tap="applyTags">完成</button>
          </view>
        </view>

        <scroll-view scroll-y class="tag-scroll">
          <view class="group" v-for="grp in tagGroups" :key="grp.key">
            <view class="group-title">{{ grp.title }}</view>
            <view class="tag-grid">
              <view class="tag-item" v-for="opt in grp.items" :key="opt.id" @tap="toggleCheck(opt.id)">
                <checkbox :checked="tempSelectedTagIds.includes(opt.id)" />
                <text class="name">{{ opt.name }}</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { websiteUrl } from '@/common/config.js'
import { chooseImageList, getQiniuToken, uploadImageToQiniu } from '@/common/image.js'
import uniPopup from '@/uni_modules/uni-popup/components/uni-popup/uni-popup.vue'
import uniIcons from '@/uni_modules/uni-icons/components/uni-icons/uni-icons.vue'

/** ===== 顶部 Tab ===== */
const activeTab = ref('list')
const switchTab = (t) => { activeTab.value = t; if (t==='list' && !list.value.length) reload(); if (t==='highlight' && !artistInfo.value.brand_id) fetchArtistInfo() }

/** ===== 公共：鉴权头/默认图 ===== */
const tokenHeader = () => ({ 'Authorization': `${uni.getStorageSync('token')}` })
const defaultCover = 'https://static.fantuanpu.com/placeholder/cover.png' // 替换为你们的占位图

/** ===== 置顶展示图（毛娘：hairstylist_highlight_images） ===== */
const artistInfo = ref({ brand_id: 0, hairstylist_highlight_images: [] })
const uploading = ref(false), uploadProgress = ref(0), uploadStatusText = ref('')

const fetchArtistInfo = async () => {
  const r = await uni.request({ url: `${websiteUrl.value}/brand-manager/get-artist-info`, method:'GET', header: tokenHeader() })
  if (r.data.status === 'success' && r.data.data) {
    const d = r.data.data
    artistInfo.value.brand_id = d.brand_id
    artistInfo.value.hairstylist_highlight_images = Array.isArray(d.hairstylist_highlight_images)
      ? d.hairstylist_highlight_images
      : (d.hairstylist_highlight_images||'').split(',').filter(Boolean)
  }
}
const previewHairImage = (idx) => {
  uni.previewImage({ current: artistInfo.value.hairstylist_highlight_images[idx], urls: artistInfo.value.hairstylist_highlight_images })
}
const handleUploadHairHighlight = async () => {
  const imgs = await chooseImageList(1); if (!imgs?.length) return
  try {
    uploading.value = true; uploadStatusText.value='获取上传凭证...'
    const tk = await getQiniuToken()
    uploadStatusText.value='上传中...'; uploadProgress.value=50
    const up = await uploadImageToQiniu(imgs[0], tk.token, tk.path)
    if (up?.imageUrl) {
      const arr = [...artistInfo.value.hairstylist_highlight_images, up.imageUrl]
      await uni.request({
        url: `${websiteUrl.value}/brand-manager/update-highlight-images`,
        method:'POST',
        header: tokenHeader(),
        data: { brand_id: artistInfo.value.brand_id, hairstylist_highlight_images: arr.join(',') }
      })
      artistInfo.value.hairstylist_highlight_images = arr
      uni.showToast({ title:'上传成功', icon:'success' })
    }
  } catch(e){ uni.showToast({ title:'上传失败', icon:'none' }) }
  finally { uploading.value=false; uploadProgress.value=0 }
}
const deleteHairHighlight = (index) => {
  uni.showModal({ title:'提示', content:'确定删除这张展示图吗？', success: async (res) => {
    if (!res.confirm) return
    const arr = [...artistInfo.value.hairstylist_highlight_images]; arr.splice(index,1)
    await uni.request({
      url: `${websiteUrl.value}/brand-manager/update-highlight-images`,
      method:'POST',
      header: tokenHeader(),
      data: { brand_id: artistInfo.value.brand_id, hairstylist_highlight_images: arr.join(',') }
    })
    artistInfo.value.hairstylist_highlight_images = arr
    uni.showToast({ title:'删除成功', icon:'success' })
  }})
}

/** ===== 列表：两列，无搜索 ===== */
const list = ref([]), page = ref(1), size = ref(20), total = ref(0), loading = ref(false), noMore = ref(false)
const fetchList = async () => {
  if (loading.value || noMore.value) return
  loading.value = true
  try {
    const r = await uni.request({ url: `${websiteUrl.value}/brand-manager/custom-wig/list?page=${page.value}&size=${size.value}`, method:'GET', header: tokenHeader() })
    if (r.data.status === 'success') {
      const data = r.data.data || {}
      const rows = (data.list || []).map(x => ({
        id: x.id,
        wig_name: x.wig_name,
        wig_material: x.wig_material,
        wig_color: x.wig_color,
        style_tag_names: Array.isArray(x.style_tags) ? x.style_tags : [],
        cover_image: x.cover_image || ''
      }))
      list.value = list.value.concat(rows)
      total.value = data.total || 0
      if (list.value.length >= total.value) noMore.value = true
    } else {
      uni.showToast({ title: r.data.msg || '加载失败', icon:'none' })
    }
  } catch(e) { uni.showToast({ title:'网络错误', icon:'none' }) }
  finally { loading.value = false }
}
const reload = () => { page.value=1; noMore.value=false; list.value=[]; fetchList() }
const loadMore = () => { if (!loading.value && !noMore.value) { page.value += 1; fetchList() } }
const previewOne = (url) => { if (!url) return; uni.previewImage({ current:url, urls:[url] }) }

/** ===== 删除（修复 _ctx.doDelete is not a function） ===== */
const doDelete = (id) => {
  uni.showModal({
    title: '删除确认',
    content: '删除后不可恢复，确定删除该假发？',
    success: async (res) => {
      if (!res.confirm) return
      try {
        const r = await uni.request({
          url: `${websiteUrl.value}/brand-manager/custom-wig/delete?id=${id}`,
          method: 'POST',
          header: tokenHeader()
        })
        if (r.data.status === 'success') {
          uni.showToast({ title:'删除成功', icon:'success' })
          reload()
        } else {
          uni.showToast({ title: r.data.msg || '删除失败', icon:'none' })
        }
      } catch (e) {
        uni.showToast({ title: '网络错误', icon:'none' })
      }
    }
  })
}

/** ===== 新增/编辑（对齐后端参数） ===== */
const formPopup = ref(), saving = ref(false)
const form = reactive({ id:0, wig_name:'', wig_material:'', wig_color:'' })
const formImages = ref([]) // 假发图片（多图）

// 材质/风格 来自接口
const materials = ref([]), matIndex = ref(0)
const matChange = (e) => { matIndex.value = Number(e.detail.value); form.wig_material = materials.value[matIndex.value] || '' }

const styleMap = ref({}) // map[int]string
const tagList = computed(() => Object.keys(styleMap.value).map(k => ({ id:Number(k), name: styleMap.value[k] })))
const tagNameMap = computed(() => Object.fromEntries(tagList.value.map(t => [t.id, t.name])))
const tagName = (id) => tagNameMap.value[id] || id
const groupTitle = (id) => { const g = Math.floor(id/100); return ({1:'长度与廓形',2:'卷度与质感',3:'刘海与分缝',4:'造型（编/扎/盘）',5:'氛围与主题'})[g] || '其它' }
const tagGroups = computed(() => {
  const buckets = {}; tagList.value.forEach(t => { const title = groupTitle(t.id); (buckets[title]||(buckets[title]=[])).push(t) })
  return Object.keys(buckets).map(title => ({ key:title, title, items: buckets[title] }))
})

const selectedTagIds = ref([])      // 正式选择（number[]）
const tempSelectedTagIds = ref([])  // 弹窗临时
const tagPopup = ref()
const openTagSelector = () => { tempSelectedTagIds.value = [...selectedTagIds.value]; tagPopup.value.open() }
const applyTags = () => { selectedTagIds.value = [...tempSelectedTagIds.value]; tagPopup.value.close() }
const clearTags = () => { tempSelectedTagIds.value = [] }
const toggleCheck = (id) => { const arr = tempSelectedTagIds.value; const i = arr.indexOf(id); if (i>=0) arr.splice(i,1); else arr.push(id) }
const removeTag = (tid) => { selectedTagIds.value = selectedTagIds.value.filter(id => id !== tid) }

const openCreate = () => { resetForm(); formPopup.value.open() }
const openEdit = async (id) => {
  const r = await uni.request({ url: `${websiteUrl.value}/brand-manager/custom-wig/info?id=${id}`, method:'GET', header: tokenHeader() })
  if (r.data.status !== 'success' || !r.data.data) { uni.showToast({ title:r.data.msg || '获取详情失败', icon:'none' }); return }
  const d = r.data.data
  form.id = d.id
  form.wig_name = d.wig_name || ''
  form.wig_material = d.wig_material || ''
  matIndex.value = Math.max(0, materials.value.findIndex(m => m === form.wig_material))
  form.wig_color = d.wig_color || ''
  // 风格
  let ids = []
  if (Array.isArray(d.style_tags)) {
    const name2id = Object.fromEntries(tagList.value.map(t => [t.name, t.id]))
    // d.style_tags 是标签名数组（来自用户端/控制器 List/Info），将中文名映射回ID
    ids = d.style_tags.map(n => name2id[n]).filter(Boolean)
  }
  selectedTagIds.value = ids
  // 图片
  if (Array.isArray(d.custom_wig_images)) formImages.value = d.custom_wig_images
  else if (typeof d.custom_wig_image_urls === 'string') formImages.value = d.custom_wig_image_urls.split(',').filter(Boolean)
  else formImages.value = []
  formPopup.value.open()
}
const closeForm = () => formPopup.value.close()
const resetForm = () => {
  form.id=0; form.wig_name=''; form.wig_material = materials.value[0] || ''; matIndex.value=0; form.wig_color='';
  selectedTagIds.value=[]; formImages.value=[]
}

const submitForm = async () => {
  if (!form.wig_name.trim()) { uni.showToast({ title:'请填写名称', icon:'none' }); return }
  const payload = {
    wig_name: form.wig_name.trim(),
    wig_material: form.wig_material || '',
    wig_color: (form.wig_color || '').trim(),
    style_tags: selectedTagIds.value.map(String),
    custom_wig_image_urls: formImages.value.join(',')
  }
  const isEdit = !!form.id; if (isEdit) payload.id = form.id

  saving.value = true
  try {
    const url = isEdit ? `${websiteUrl.value}/brand-manager/custom-wig/update` : `${websiteUrl.value}/brand-manager/custom-wig/add`
    const r = await uni.request({ url, method:'POST', data: payload, header: tokenHeader() })
    if (r.data.status === 'success') {
      uni.showToast({ title:'已保存', icon:'success' })
      closeForm(); reload()
    } else {
      uni.showToast({ title: r.data.msg || '保存失败', icon:'none' })
    }
  } catch(e){ uni.showToast({ title:'网络错误', icon:'none' }) }
  finally { saving.value=false }
}

/** ===== 表单内：多图上传/预览/删除 ===== */
const uploadFormImages = async () => {
  const remain = Math.max(0, 9 - formImages.value.length) // 可调上限
  if (!remain) { uni.showToast({ title:'最多上传9张', icon:'none' }); return }
  const imgs = await chooseImageList(remain); if (!imgs?.length) return
  try {
    const tk = await getQiniuToken()
    for (const filePath of imgs) {
      const up = await uploadImageToQiniu(filePath, tk.token, tk.path)
      if (up?.imageUrl) formImages.value.push(up.imageUrl)
    }
  } catch(e){ uni.showToast({ title:'上传失败', icon:'none' }) }
}
const removeFormImage = (idx) => { formImages.value.splice(idx,1) }
const previewFormImage = (idx) => { uni.previewImage({ current: formImages.value[idx], urls: formImages.value }) }

/** ===== 初始化：材质/风格（来自公开路由） ===== */
const fetchMaterials = async () => {
  const r = await uni.request({ url: `${websiteUrl.value}/hair-materials`, method:'GET' })
  if (r.data.status === 'success') {
    materials.value = Array.isArray(r.data.data) ? r.data.data : []
    form.wig_material = materials.value[0] || ''
    matIndex.value = 0
  }
}
const fetchWigStyleMap = async () => {
  const r = await uni.request({ url: `${websiteUrl.value}/custom-wig-style-tags`, method:'GET' })
  if (r.data.status === 'success') styleMap.value = r.data.data || {}
}

onMounted(async () => {
  uni.setNavigationBarTitle({ title: '假发管理' })
  await Promise.all([fetchMaterials(), fetchWigStyleMap(), fetchArtistInfo()])
  reload()
})
</script>

<style lang="less" scoped>
	
	
.artist-container { padding: 20rpx; background-color: #f8f8f8; min-height: 100vh; }

/* Tabs（沿用妆图设置） */
.tabs { display:flex; background:#fff; border-radius:16rpx; margin-bottom:20rpx; box-shadow:0 4rpx 12rpx rgba(0,0,0,.05); }
.tab-item { flex:1; text-align:center; padding:24rpx 0; font-size:30rpx; color:#666; position:relative;
  &.active { color:#333; font-weight: bold;
    &::after{ content:''; position:absolute; bottom:0; left:50%; transform:translateX(-50%); width:80rpx; height:6rpx; background:linear-gradient(90deg,#8fecff,#c1ddff); border-radius:4rpx;}
  }
}
	uni-button:after {
			border: none;
		}
/* 滚动 */
.faceup-scroll, .highlight-scroll { height: calc(100vh - 240rpx); }

/* 列表：两列卡片 */
.faceup-list.two-col { display:grid; grid-template-columns:repeat(2, 1fr); gap:20rpx; }
.faceup-card { position:relative; background:#fff; border-radius:16rpx; overflow:hidden; box-shadow:0 6rpx 16rpx rgba(0,0,0,.06); }
.card-cover { width:100%; height:280rpx; display:block; }
.card-body { padding:18rpx; }
.card-title { font-size:28rpx; font-weight:600; color:#333; margin-bottom:12rpx; }
.faceup-tags { display:flex; flex-wrap:wrap; gap:10rpx; margin-bottom:12rpx; }
.tag { font-size:22rpx; color:#666; background:#f5f5f5; padding:6rpx 14rpx; border-radius:20rpx; }
.kv { display:flex; gap:10rpx; font-size:24rpx; color:#666; margin-top:6rpx; .k{color:#999;} .v{color:#444;} }
.row-actions { display:flex; gap:12rpx; margin-top:14rpx; }

/* 统一按钮风格 */
.btn { padding:14rpx 22rpx; border-radius:12rpx; font-size:26rpx; border:none; }
.btn.light { background:#f4f6fa; }
.btn.primary { background:#e8f5ff; color:#1677ff; }
.btn.danger { background:#ffefef; color:#ff4d4f; }
.btn.primary-strong { background:linear-gradient(135deg,#8fecff,#c1ddff); color:#fff; }
.btn.flat { border:none; }
.btn.white { background:#fff; border:1rpx solid #eaeaea; color:#333; }
.btn.big { padding:16rpx 28rpx; border-radius:14rpx; }

/* 悬浮新增按钮 */
.add-btn { position:fixed; bottom:40rpx; right:40rpx; display:flex; align-items:center; background:linear-gradient(135deg,#8fecff,#c1ddff);
  color:#fff; padding:16rpx 24rpx; border-radius:40rpx; box-shadow:0 4rpx 16rpx rgba(0,0,0,.2);
  text{ margin-left:8rpx; font-size:26rpx; color:#fff; }
}

/* 弹窗：白底、留白和按钮 */
.popup { width:88vw; max-width:760rpx; padding:24rpx; background:#fff; border-radius:20rpx; box-shadow:0 6rpx 16rpx rgba(0,0,0,.08); }
.popup-title { font-size:32rpx; font-weight:600; margin-bottom:6rpx; }
.form { padding-top:6rpx; }
.form-item { margin-bottom:22rpx; }
.label { display:block; color:#333; font-weight:500; margin-bottom:10rpx; font-size:26rpx; }
.ipt {background:#f7f8fa; border-radius:12rpx; padding:16rpx 20rpx; font-size:28rpx; }
.picker-like { background:#f7f8fa; border-radius:12rpx; padding:16rpx 20rpx; font-size:28rpx; color:#333; }
.tag-box .chips { margin-top:12rpx; display:flex; flex-wrap:wrap; gap:10rpx; }
.chip { background:#f0f5ff; color:#2b5fd9; border-radius:16rpx; padding:6rpx 12rpx; font-size:22rpx; }
.chip-x { margin-left:6rpx; color:#999; }
.hint { color:#999; font-size:24rpx; }
.popup-actions { display:flex; justify-content:flex-end; gap:14rpx; margin-top:12rpx; }
.cancel { background:#eaeef3; color:#333; }

/* 表单图片网格 */
.img-grid { display:flex; flex-wrap:wrap; gap:16rpx; }
.img-box { position:relative; width: 200rpx; height: 200rpx; border-radius:12rpx; overflow:hidden; background:#f2f2f2; }
.img { width:100%; height:100%; display:block; }
.img-del { position:absolute; right:6rpx; top:6rpx; background:rgba(0,0,0,.4); border-radius:999rpx; padding:6rpx; }
.img-add { width:200rpx; height:200rpx; border-radius:12rpx; background:#f5f7fb; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6rpx; color:#999; }

/* 风格多选弹窗 */
.tag-popup { background:#fff; border-top-left-radius:20rpx; border-top-right-radius:20rpx; }
.tag-header { display:flex; justify-content:space-between; align-items:center; padding:20rpx; border-bottom:1rpx solid #f0f0f0; }
.tag-header .title { font-size:30rpx; font-weight:600; }
.tag-header .ops { display:flex; gap:10rpx; }
.tag-scroll { height:60vh; padding:10rpx 20rpx 30rpx; }
.group { margin-top:16rpx; }
.group-title { font-size:26rpx; color:#999; margin-bottom:10rpx; }
.tag-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:14rpx; }
.tag-item { padding:16rpx; border-radius:12rpx; background:#f7f9fc; display:flex; align-items:center; gap:10rpx; .name{ font-size:26rpx; color:#333; } }

/* 置顶展示图：两列卡片 */
.highlight-list.two-col-cards { display:grid; grid-template-columns:repeat(2, 1fr); gap:20rpx; }
.highlight-item { position:relative; border-radius:16rpx; overflow:hidden; box-shadow:0 6rpx 16rpx rgba(0,0,0,.06); background:#fff; }
.highlight-img { width:100%; height:320rpx; display:block; }
.highlight-actions { position:absolute; bottom:10rpx; right:10rpx; background:rgba(0,0,0,.35); border-radius:12rpx; padding:8rpx; }
.upload-progress { margin-top:20rpx; padding:20rpx; background:#f5f5f5; border-radius:12rpx; text-align:center; }

.list-footer { text-align:center; color:#999; padding:24rpx 0; }


</style>
