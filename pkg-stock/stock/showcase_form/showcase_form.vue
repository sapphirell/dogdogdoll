<template>
  <view>
    <meta name="theme-color" content="#F8F8F8">
      <view-logs />
    </meta>

    <view v-if="!isEditable" class="edit-tip">
      <text>当前状态不可编辑</text>
    </view>

    <!-- ========== 图片（长按拖拽排序） ========== -->
    <view class="image-block">
      <shmily-drag-image
        :model-value="dragItems"
        keyName="image_url"
        :showDelete="isEditable"
        :showItemInfo="false"
        :cols="3"
        :imageWidth="0"
        :padding="12"
        :scale="1.06"
        :opacity="0.88"
        :customClick="true"
        @update:modelValue="onDragUpdate"
        @sort-change="onDragSort"
        @delete="onDragDelete"
        @item-click="onDragItemClick"
      />
      <view class="add-row" v-if="isEditable">
        <button class="add-btn" @tap="selectImage">
          <image src="/static/add2.png" class="add-icon" />
          <text>添加图片</text>
        </button>
      </view>
    </view>

    <!-- ========== Tabs（基本 / 人设 / 关联） ========== -->
    <view class="tabs-underline" id="tabs-underline">
      <view
        v-for="t in tabs"
        :key="t.key"
        class="tab-item"
        :id="`tab-${t.key}`"
        :class="{ active: activeTab === t.key }"
        @tap="switchTab(t.key)"
      >
        {{ t.label }}
      </view>
      <view class="underline" :style="underlineStyle"></view>
    </view>

    <!-- ========== Tab 面板：基本 ========== -->
    <view v-show="activeTab==='basic'">
      <!-- 标题 -->
      <input
        v-model="name"
        type="text"
        :disabled="!isEditable"
        placeholder="请输入标题"
        class="field-input"
      />

      <!-- 描述 -->
      <textarea
        v-model="description"
        :disabled="!isEditable"
        placeholder="请输入内容"
        class="desc-area"
      ></textarea>

      <view class="publish-detail">
        <text>* 展示您的宝宝们。🩵</text>
        <text>* 不关联商品的展示柜不会出现在广场中。</text>
      </view>
    </view>

    <!-- ========== Tab 面板：人设（出生日期/性别/性格） ========== -->
    <view v-show="activeTab==='persona'">
      <view class="card-block">
        <!-- 出生日期（使用现成日期组件） -->
        <view class="form-row equal">
          <text class="label">出生日期</text>
          <view
            class="cell"
            :class="{disabled:!isEditable}"
            @tap="isEditable && (showBirthSheet = true)"
          >
            <text class="cell-value" :class="{ placeholder: !birthDate }">
              {{ birthDate || '请选择出生日期' }}
            </text>
            <uni-icons type="right" size="16" color="#bbb" />
          </view>
        </view>

        <!-- 性别 -->
        <view class="form-row equal">
          <text class="label">性别</text>
          <picker
            mode="selector"
            :range="genderOptions"
            range-key="label"
            :value="genderIndex"
            :disabled="!isEditable"
            @change="onGenderChange"
            class="cell"
          >
            <view class="cell-value" :class="{ placeholder: genderIndex === -1 }">
              {{ genderIndex === -1 ? '请选择性别' : genderOptions[genderIndex].label }}
            </view>
          </picker>
        </view>

        <!-- 性格（同等长度、灰底无边框） -->
        <view class="form-row equal">
          <text class="label">性格</text>
          <input
            v-model="personality"
            :disabled="!isEditable"
            placeholder="设定中的性格"
            class="cell-input"
            type="text"
            maxlength="50"
          />
        </view>
      </view>
    </view>

    <!-- ========== Tab 面板：关联（妆师 / 关联娃物） ========== -->
    <view v-show="activeTab==='relation'">
      <!-- 妆师 -->
      <view class="card-block">
        <view class="form-row" :class="{ disabled: !isEditable }" style="border-bottom:none;">
          <text class="label">妆师</text>
          <view style="flex:1;">
            <common-search
              v-if="isEditable"
              mode="fill"
              :showIndexSelector="false"
              defaultIndex="bjd_artist"
              background="#f8f8f8"
              :hideHintText="true"
              @select="onArtistSelect"
              @close-associate="onArtistClose"
              class="artist-search"
            />
            <view v-else class="readonly-row">
              <text class="readonly-name">{{ makeupArtist || '（未填写）' }}</text>
            </view>
  <!--          <view class="mini-hint">
              选中即填入ID；若没有匹配，点“关闭联想”
            </view> -->
          </view>
        </view>
      </view>

      <!-- 关联娃物 -->
      <view>
        <view class="relation-trigger" v-if="isEditable" @tap="showRelationPicker">
          <text class="placeholder">点击关联娃物</text>
          <image src="/static/right2.png" class="arrow-icon" />
        </view>
      </view>

      <view class="saveCollocationDataList">
        <view v-for="(item, index) in saveCollocationDataList" :key="index">
          <view class="saveCollocationDataItem">
            <image
              v-if="item.goods_image"
              :src="item.goods_image"
              mode="aspectFill"
              style="width: 70px;height: 70px;"
            />
            <text v-else class="no-image">?</text>
            <text class="info-tap" style="width: calc(100% - 120px);display: inline-block;">
              {{item.type}} {{item.brand_name}} - {{item.goods_name}}
            </text>
            <image src="/static/cancel.png" v-if="isEditable" class="close_icon" @tap="deleteCollcation(index)" />
          </view>
        </view>
      </view>
    </view>

    <!-- 关联弹窗 -->
    <relation-picker
      v-model:visible="showSelectTab"
      :typeList="typeList"
      :goodsList="goodsList"
      @confirm="handleRelationConfirm"
      @cancel="handleRelationCancel"
    />

    <!-- 日期弹层 -->
    <common-date-picker
      v-model:show="showBirthSheet"
      v-model="birthDate"
      title="选择出生日期"
      minDate="1970-01-01"
      maxDate="2035-12-31"
      @confirm="onBirthConfirm"
    />

    <!-- 底部操作 -->
    <view class="footer">
      <text
        v-if="showDelete"
        class="delete-link"
        @tap="handleDelete"
      >删除</text>
      <button class="publish-btn" @click="submitForm">发表</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch, nextTick, getCurrentInstance, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { websiteUrl, image1Url, getScene } from "../../../common/config.js"
import { getQiniuToken, uploadImageToQiniu, chooseImageList } from "../../../common/image.js"

/* ================= 图片：长按拖拽排序 ================= */
const uploadList = ref([]) // string[]（URL）

// 用 URL 生成稳定 id，顺序变化 id 不变，避免内部 movable 失配
const hash = (s) => String(s).split('').reduce((a,c)=>((a<<5)-a+c.charCodeAt(0))|0,0)

// 拖拽组件的数据：只传必要字段（不传 name/引导字符）
const dragItems = computed(() =>
  uploadList.value.map((url, i) => ({
    id: `img_${hash(url)}`,     // ⚠️ 仅用 url 生成，顺序变化 id 也稳定
    image_url: url
  }))
)

// 拖拽：根据 sortedIds 重新排列 uploadList
function onDragSort(sortedIds) {
  const idToUrl = new Map(dragItems.value.map(it => [it.id, it.image_url]))
  const newList = sortedIds.map(id => idToUrl.get(id)).filter(Boolean)
  // 使用新数组，避免同引用导致的渲染抖动
  uploadList.value = [...newList]
}

// 拖拽：组件整批更新（新增/删除/换序）
function onDragUpdate(newItems) {
  uploadList.value = newItems.map(it => it.image_url)
}

// 删除单张
function onDragDelete(id) {
  const idx = dragItems.value.findIndex(it => it.id === id)
  if (idx >= 0) {
    const list = [...uploadList.value]
    list.splice(idx, 1)
    uploadList.value = list
  }
}

// 点击仅预览，不跳转
function onDragItemClick(item) {
  const idx = dragItems.value.findIndex(x => x.id === item.id)
  if (idx >= 0) viewFullImage(idx)
}

/* ============== Tabs ============== */
const tabs = [
  { key: 'basic',   label: '基本' },
  { key: 'persona', label: '人设' },
  { key: 'relation',label: '关联' },
]
const activeTab = ref('basic')
const underlineStyle = ref('')          // 用 px 精准定位
const instance = getCurrentInstance()

function updateUnderline() {
  nextTick(() => {
    const q = uni.createSelectorQuery().in(instance)
    q.select(`#tab-${activeTab.value}`).boundingClientRect()
     .select('#tabs-underline').boundingClientRect()
     .exec((res) => {
        const tabRect = res?.[0]
        const wrapRect = res?.[1]
        if (tabRect && wrapRect) {
          const left = tabRect.left - wrapRect.left
          const width = tabRect.width
          underlineStyle.value = `left:${left}px;width:${width}px;`
        }
     })
  })
}
function switchTab(key) { activeTab.value = key; updateUnderline() }
onMounted(updateUnderline)
watch(activeTab, updateUnderline)

/* ============== 表单字段 ============== */
const display = ref(-1) // 0=审核中
const isEditable = computed(() => [-1, 1, 3].includes(display.value))
const showDelete = computed(() => Number(props.showcase_id) > 0)

const props = defineProps(["showcase_id"])

const name = ref('')
const description = ref('')

// 人设
const birthDate = ref('')      // YYYY-MM-DD
const showBirthSheet = ref(false)
function onBirthConfirm(val) { birthDate.value = val }

// 性别
const gender = ref('') // 'male' | 'female' | 'other' | ''
const genderOptions = [
  { value: "male", label: "男" },
  { value: "female", label: "女" },
  { value: "other", label: "其他" },
]
const genderIndex = computed(() => {
  const idx = genderOptions.findIndex(g => g.value === gender.value)
  return idx >= 0 ? idx : -1
})
const onGenderChange = (e) => {
  const idx = Number(e.detail.value)
  if (idx >= 0 && idx < genderOptions.length) {
    gender.value = genderOptions[idx].value
  }
}

// 性格
const personality = ref('')

// 妆师/关联
const makeupArtist = ref('')
const makeupArtistBrandId = ref(0)
const saveCollocationDataList = ref([])
const goodsList = ref([])
const typeList = ref([])
const showSelectTab = ref(false)

/* ============== 工具：性别/日期映射 ============== */
function toGenderInt(v) { if (!v) return undefined; switch (v) { case 'male': return 1; case 'female': return 2; case 'other': return 3; default: return 0 } }
function toGenderStr(v) { if (v===1) return 'male'; if (v===2) return 'female'; if (v===3) return 'other'; return '' }
function dateToUnixSec(d){ if(!d) return undefined; const t=new Date(String(d).replace(/-/g,'/')); if(isNaN(t)) return undefined; return Math.floor(t.getTime()/1000) }
function unixSecToDate(s){
  if (s===null || s===undefined) return ""
  const sec=Number(s); const ms=sec>2147483647?sec:sec*1000
  const d=new Date(ms); if(isNaN(d)) return ""
  const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,'0'); const day=String(d.getDate()).padStart(2,'0')
  return `${y}-${m}-${day}`
}

/* ============== 妆师搜索联动 ============== */
function onArtistSelect(id, name) {
  if (!isEditable.value) return
  if (id && Number(id) > 0) {
    makeupArtistBrandId.value = Number(id)
    makeupArtist.value = name || ""
  } else {
    makeupArtist.value = name || ""
  }
}
function onArtistClose(currentInput) {
  if (!isEditable.value) return
  makeupArtistBrandId.value = 0
  makeupArtist.value = (currentInput || "").trim()
}

/* ============== 关联 ============== */
const handleRelationConfirm = (data) => {
  try {
    const relationData = {
      goods_id: data.goods.id || 0,
      goods_name: data.goods.name,
      goods_image: data.goods.image || '',
      brand_id: data.brand.id || 0,
      brand_name: data.brand.name || (data.isFuzzy ? '' : '未知品牌'),
      type: data.type || (data.isFuzzy ? '未知类型' : '')
    }
    const isExist = saveCollocationDataList.value.some(item =>
      (item.goods_id !== 0 && item.goods_id === relationData.goods_id) ||
      item.goods_name === relationData.goods_name
    )
    if (!isExist) saveCollocationDataList.value.push(relationData)
    else uni.showToast({ title: '已存在相同关联项', icon: 'none' })
  } catch {
    uni.showToast({ title: '保存关联信息失败', icon: 'none' })
  }
}
const handleRelationCancel = () => {}
const showRelationPicker = () => { showSelectTab.value = true }

/* ============== 详情回填 ============== */
async function getShowCaseInfo() {
  if (!props.showcase_id) return
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/showcase-detail?id=${props.showcase_id}`,
      method: 'GET',
      header: { 'Authorization': uni.getStorageSync('token') },
    })
    const data = res.data?.data || {}

    name.value = data.name || ""
    description.value = data.description || ""
    display.value = data.display

    uploadList.value = data.image_urls ? data.image_urls.split(',').filter(Boolean) : []

    if (Array.isArray(data.relations)) {
      saveCollocationDataList.value = data.relations.map(r => ({
        goods_id: r.relation_goods_id,
        goods_name: r.relation_goods_name,
        brand_id: r.relation_brand_id,
        brand_name: r.relation_brand_name,
        type: r.type,
        goods_image: r.relation_goods_image
      }))
    }

    birthDate.value = (data.birth_at !== undefined && data.birth_at !== null) ? unixSecToDate(data.birth_at) : ""
    gender.value = toGenderStr(data.gender)
    personality.value = data.personality || ""
    makeupArtist.value = data.makeup_artist || ""
    makeupArtistBrandId.value = data.makeup_artist_id ? Number(data.makeup_artist_id) : 0

    updateUnderline()
  } catch {
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

/* ============== 预览 / 新增图片 ============== */
function viewFullImage(index) {
  uni.previewImage({ current: uploadList.value[index], urls: uploadList.value })
}
async function selectImage() {
  try {
    const imagePaths = await chooseImageList(9)
    for (const path of imagePaths) {
      const tokenData = await getQiniuToken()
      await uploadImageToQiniu(path, tokenData.token, tokenData.path)
      uploadList.value.push(image1Url + tokenData.path)
    }
    uni.showToast({ title: `成功上传${imagePaths.length}张图片`, icon: 'success' })
  } catch {
    uni.showToast({ title: '部分图片上传失败', icon: 'none' })
  }
}

/* ============== 删除当前展示 ============== */
async function handleDelete() {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个展示吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const resp = await uni.request({
            url: `${websiteUrl.value}/with-state/delete-showcase?id=${props.showcase_id}`,
            method: 'POST',
            header: { 'Authorization': uni.getStorageSync('token') }
          })
          if ((resp.data || {}).status === "success") {
            uni.showToast({ title: '删除成功' })
            setTimeout(() => uni.navigateBack(), 800)
          } else {
            uni.showToast({ title: (resp.data || {}).msg || '删除失败', icon: 'none' })
          }
        } catch {
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    }
  })
}

/* ============== 提交 ============== */
async function submitForm() {
  const token = uni.getStorageSync('token')
  if (!token) return uni.showToast({ title: '请先登录', icon: 'none' })
  if (!name.value.trim()) return uni.showToast({ title: '名字不能为空', icon: 'none' })
  if (!description.value.trim()) return uni.showToast({ title: '描述不能为空', icon: 'none' })
  if (uploadList.value.length === 0) return uni.showToast({ title: '请至少上传一张图片', icon: 'none' })

  const genderVal = toGenderInt(gender.value)
  const birthAtVal = dateToUnixSec(birthDate.value)

  let postData = {
    name: name.value,
    description: description.value,
    image_urls: uploadList.value.join(','), // 已按拖拽顺序
    origin: getScene(),
    relations: saveCollocationDataList.value.map(item => ({
      relation_goods_id: item.goods_id,
      relation_goods_name: item.goods_name,
      relation_brand_id: item.brand_id,
      relation_brand_name: item.brand_name,
      type: item.type,
      relation_origin: 2
    })),
    personality: personality.value || "",
    makeup_artist: makeupArtist.value || "",
    makeup_artist_id: Number(makeupArtistBrandId.value) || 0
  }
  if (typeof genderVal === 'number') postData.gender = genderVal
  if (birthAtVal !== undefined) postData.birth_at = birthAtVal

  try {
    let url = `${websiteUrl.value}/with-state/add-showcase`
    if (props.showcase_id) {
      url = `${websiteUrl.value}/with-state/update-showcase`
      postData = { ...postData, id: parseInt(props.showcase_id, 10) }
    }
    const res = await uni.request({
      url, method: 'POST', data: postData,
      header: { 'Content-Type': 'application/json', 'Authorization': token }
    })
    const resp = res.data || {}
    const ok = resp.status === 'success' || resp.code === 'success' || resp.code === 0 || resp.success === true
    if (ok) {
      uni.showToast({ title: '提交成功' })
      setTimeout(() => uni.navigateBack(), 1000)
    } else {
      uni.showToast({ title: resp.msg || '提交失败', icon: 'none' })
    }
  } catch {
    uni.showToast({ title: '提交失败', icon: 'none' })
  }
}

/* ============== 其它 ============== */
function getTypes() {
  uni.request({
    url: websiteUrl.value + '/goods-types',
    method: 'GET',
    timeout: 5000,
    success: (res) => { typeList.value = res.data?.data || [] },
    fail: () => uni.showToast({ title: '网络请求失败', icon: 'none' })
  })
}
function deleteCollcation(index) { saveCollocationDataList.value.splice(index, 1) }

uni.setNavigationBarTitle({ title: '私养展示' })
onLoad(async (options) => {
  // 从搭配页带参数回填
  if (options.goods_id && options.goods_name && options.brand_id && options.brand_name && options.type) {
    let goodsImage = ''
    try {
      const res = await uni.request({ url: websiteUrl.value + '/goods?id=' + parseInt(options.goods_id), method: 'GET' })
      const gi = (res.data || {}).data || {}
      goodsImage = Array.isArray(gi.goods_images) ? gi.goods_images[0] : (gi.goods_images?.[0] || '')
    } catch {}
    saveCollocationDataList.value.push({
      brand_id: parseInt(options.brand_id, 10),
      goods_id: parseInt(options.goods_id, 10),
      brand_name: options.brand_name,
      goods_name: options.goods_name,
      goods_image: goodsImage,
      type: options.type
    })
  }
  getTypes()
  getShowCaseInfo()
})
</script>

<style lang="less" scoped>
/* 顶部提示 */
.edit-tip {
  padding: 10px;
  background: #fff3cd;
  color: #856404;
  text-align: center;
  font-size: 14px;
}

/* 图片块 */
.image-block { padding: 10px 12px 0; background:#fff; }
.add-row { padding: 8px 6px 2px; display:flex; justify-content:flex-end; }
.add-btn {
  display:flex; align-items:center; gap:8px;
  height: 40px; line-height: 40px; padding: 0 12px;
  background: #f3f5f7; border-radius: 10px; color:#333; font-size:14px; border:none;
}
.add-btn::after{ border:none; }
.add-icon { width:20px; height:20px; }

/* Tabs（精准下划线） */
.tabs-underline {
  display: flex;
  position: relative;
  background:#fff;
  margin-top: 10px;
  border-bottom: 1px solid #eee;
}
.tab-item{
  flex: 1;
  text-align: center;
  padding: 12px 0;
  font-size: 15px;
  font-weight: 700;
  color: #666;
}
.tab-item.active{ color: #222; }
.tabs-underline .underline{
  position: absolute; bottom: 0;
  height: 2px; background: linear-gradient(90deg, #63cce7, #63cce7);
  transition: left .2s ease, width .2s ease;
}

/* 基本文字输入：灰底无边框 */
.field-input{
  padding: 10px; margin: 12px 15px 6px; display: block;
  background:#f8f8f8; border-radius: 10px; border:none;
  font-size: 15px;
}
.field-input::placeholder{ color:#999; }

.desc-area{
  padding: 10px; margin:10px 15px 6px; display: block;
  line-height: 28px; width: calc(100% - 50px);
  background:#f8f8f8; border-radius: 10px; border:none;
  min-height: 120px; font-size: 14px;
}
.desc-area::placeholder{ color:#999; }

.publish-detail {
  margin: 30rpx 20rpx;
  text { display: block; color: #888; margin: 18rpx 40rpx; }
}

/* 卡片与表单（人设/关联） */
.card-block {
  background: #fff;
  margin: 10px 15px 12px;
  border-radius: 12px;
  padding: 6px 10px;
}
.form-row{
  display:flex; align-items:center; padding: 8px 2px; gap: 10px;
  &.disabled { opacity:.7; }
}
.form-row.equal .label{
  width: 80px; flex-shrink: 0; color:#666; font-size:14px;
  font-weight: 600;
}
.form-row .cell,
.form-row .cell-input{
  flex:1; height: 44px; line-height: 44px;
  background:#f8f8f8; border-radius: 8px; padding: 0 12px;
  display:flex; align-items:center; justify-content:space-between;
  border:none;                     /* ✅ 无边框 */
}
.cell-input{ outline: none; border:none; }
.cell-input::placeholder{ color:#999; }
.cell-value{ color:#222; font-size:14px; }
.cell-value.placeholder{ color:#999; }

/* 妆师块 */
.artist-search { width: 100%; }
.mini-hint { margin-top: 6px; color: #999; font-size: 12px; }
.readonly-row .readonly-name { color: #333; }

/* 关联娃物 */
.relation-trigger {
  display: flex; align-items: center;
  padding: 20rpx 30rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
  margin: 20rpx;
  .placeholder { flex:1; color:#999; font-size: 28rpx; }
  .arrow-icon { width: 30rpx; height: 30rpx; }
}
.saveCollocationDataList {
  padding-bottom: 100px; min-height: 300rpx;
  .saveCollocationDataItem {
    position: relative; background: #fafafa;
    width: 90vw; margin: 10px auto; border-radius: 10px; overflow:hidden;
    .info-tap { position: absolute; bottom: 30px; margin-left: 10px; }
    .no-image {
      display: inline-block; width: 70px; height: 70px;
      color: #fda7a7; font-size: 30px; text-align: center; line-height: 70px; font-weight: 1000;
    }
    .close_icon {
      width: 20px; height: 20px; position: absolute; bottom: 30px; right: 10px;
      background:#fff; border-radius: 100%;
    }
  }
}

/* 底部操作：贴右 */
.footer {
  position: fixed; bottom: 0; left: 0; right: 0;
  display: flex; align-items: center; justify-content: flex-end;
  gap: 12px; padding: 10px 16px env(safe-area-inset-bottom);margin-bottom: 10rpx;
  background: #ffffffd9; backdrop-filter: blur(4px);
}
.publish-btn {
  flex: 0 0 80%;
  height: 44px; line-height: 44px; width: 500rpx;
  background: linear-gradient(135deg, #97e7f7, #d5acd6);
  color: #fff; font-size: 16px; text-align: center;
  border-radius: 18px; font-weight: 600; margin: auto 0;
  width: 600rpx;border: none!important;
}
.publish-btn:after {
	border: none!important;
}
.delete-link { flex: 0 0 auto; color: #999; font-size: 15px; padding: 6px 4px; }
</style>
