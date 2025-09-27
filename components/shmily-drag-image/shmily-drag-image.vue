<template>
  <view class="con">
    <template v-if="viewWidth">
      <movable-area
        class="area"
        :style="{ height: areaHeight }"
        @mouseenter="mouseenter"
        @mouseleave="mouseleave"
      >
        <movable-view
          v-for="(item, index) in imageList"
          :key="item.id"
          class="view"
          direction="all"
          :y="item.y"
          :x="item.x"
          :damping="40"
          :disabled="item.disable || !item.ready"
          @change="onChange($event, item)"
          @touchstart="onLongPressStart(item, $event)"
          @touchend="touchend(item)"
          @tap="handleItemClick(item)"
          @touchmove="onTouchMove($event, item)"
          :style="{
            width: viewWidth + 'px',
            height: viewHeight + 'px',
            'z-index': item.zIndex,
            opacity: item.opacity
          }"
        >
          <view
            class="area-con"
            :style="{
              width: childWidth,
              height: childHeight,
              borderRadius: borderRadius + 'rpx',
              transform: 'scale(' + item.scale + ')',
              margin: itemMargin + 'px'
            }"
            :class="{ 'ready': !item.disable && item.ready }"
          >
            <view v-if="props.showDelete" class="delete-btn" @click.stop="deleteImage(item)">
              <uni-icons type="clear" color="#9b9b9b" size="30" />
            </view>

            <!-- 图片 -->
            <image
              class="pre-image"
              :src="getDisplayImg(item)"
              mode="aspectFill"
              @error="onImgError(item)"
            />

            <!-- 底部信息 + 左上角分类 -->
            <view class="info-container" v-if="props.showItemInfo">
              <text class="name">{{ item.name }}</text>
              <!-- ✅ 价格清洗，去掉【...】后缀 -->
              <text class="price">{{ getDisplayPrice(item.price) }}</text>
              <text class="type">{{ item.type }}</text>
            </view>

            <!-- ✅ 付款状态“糖果色”小标签：放在分类标签正下方 -->
            <view
              v-if="props.showPaymentTag && getPaymentText(item)"
              class="pay-badge candy"
              :class="['s-' + (item.payStatus || 1)]"
            >
              {{ getPaymentText(item) }}
            </view>
          </view>
        </movable-view>
      </movable-area>
    </template>
  </view>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, getCurrentInstance } from 'vue'

const props = defineProps({
  value: { type: Array, default: () => [] },
  customClick: { type: Boolean, default: false },
  modelValue: { type: Array, default: () => [] },
  keyName: { type: String, default: 'image_url' },
  number: { type: Number, default: 6 },
  imageWidth: { type: Number, default: 0 },
  cols: { type: Number, default: 3 },
  borderRadius: { type: String, default: '0' },
  padding: { type: Number, default: 10 },
  scale: { type: Number, default: 1.1 },
  opacity: { type: Number, default: 0.7 },
  itemMargin: { type: Number, default: 10 },
  imageRatio: { type: Number, default: 0.7 },
  showItemInfo: { type: Boolean, default: true },
  showDelete: { type: Boolean, default: false },

  /* 付款状态标签（可选，默认关闭） */
  showPaymentTag: { type: Boolean, default: false },
  paymentField: { type: String, default: 'payment_status' },
  paymentMap: {
    type: Object,
    default: () => ({ 1: '全款', 2: '定金', 3: '未买' })
  }
})
const emit = defineEmits(['input', 'update:modelValue', 'sort-change', 'delete', 'item-click'])

/* ===== 无图兜底 ===== */
const NO_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
      <rect width="100%" height="100%" fill="#e9ebef"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        fill="#9aa0a6" font-size="40" font-family="Arial">No Image</text>
    </svg>`
  )
const getSrc = (item) => (props.keyName !== null ? item[props.keyName] : item)
function normalizeFirstImage(s) {
  if (!s) return ''
  const first = String(s).split(',')[0].trim()
  const low = first.toLowerCase()
  if (!first || low.includes('/default') || low.endsWith('default.png') || low.includes('noimage')) return ''
  return first
}
function getDisplayImg(item) {
  if (item.__imgBroken) return NO_IMG
  const src = normalizeFirstImage(item.src)
  return src || NO_IMG
}
function onImgError(item) { item.__imgBroken = true }

/* ===== 拖拽与布局（保持原逻辑） ===== */
const imageList = ref([])
const width = ref(0)
const add = ref({ x: 0, y: 0 })
const colsValue = ref(0)
const viewWidth = ref(0)
const viewHeight = ref(0)
const tempItem = ref(null)
const timer = ref(null)
const changeStatus = ref(true)
const preStatus = ref(true)
const first = ref(true)
const touchStartY = ref(0)
const longPressTimer = ref(null)
const isDragging = ref(false)
const isMounted = ref(false)

const areaHeight = computed(() => {
  if (imageList.value.length < props.number) return Math.ceil((imageList.value.length + 1) / colsValue.value) * viewHeight.value + 'px'
  return Math.ceil(imageList.value.length / colsValue.value) * viewHeight.value + 'px'
})
const childWidth = computed(() => (viewWidth.value - rpx2px(props.padding) * 2) + 'px')
const childHeight = computed(() => (viewHeight.value - rpx2px(props.padding) * 2) + 'px')

const deleteImage = (item) => {
  emit('delete', item.id)
  const idx = imageList.value.findIndex(img => img.id === item.id)
  if (idx !== -1) {
    imageList.value.splice(idx, 1)
    updateItemsPosition()
    sortList()
  }
}

/* 统一装配数据：增加 payStatus */
const getItemData = (item) => ({
  id: item.id,
  src: getSrc(item),
  name: item.name,
  price: item.price,
  type: item.type,
  payStatus: item[props.paymentField] ?? 1
})

/* —— 省略：拖拽/移动/事件的原有函数（未变动） —— */
const onChange = (e, item) => {
  if (!item) return
  item.oldX = e.detail.x; item.oldY = e.detail.y
  if (e.detail.source === 'touch') {
    if (item.moveEnd) {
      item.offset = Math.sqrt(Math.pow(item.oldX - item.absX * viewWidth.value, 2) + Math.pow(item.oldY - item.absY * viewHeight.value, 2))
    }
    const x = Math.floor((e.detail.x + viewWidth.value / 2) / viewWidth.value)
    if (x >= colsValue.value) return
    const y = Math.floor((e.detail.y + viewHeight.value / 2) / viewHeight.value)
    const index = colsValue.value * y + x
    if (item.index !== index && index < imageList.value.length) {
      changeStatus.value = false
      imageList.value.forEach(obj => {
        if (item.index > index && obj.index >= index && obj.index < item.index) changeObj(obj, 1)
        else if (item.index < index && obj.index <= index && obj.index > item.index) changeObj(obj, -1)
        else if (obj.id !== item.id) {
          obj.offset = 0; obj.x = obj.oldX; obj.y = obj.oldY
          setTimeout(() => { nextTick(() => { obj.x = obj.absX * viewWidth.value; obj.y = obj.absY * viewHeight.value }) }, 0)
        }
      })
      moveItem(item, index)
      item.index = index; item.absX = x; item.absY = y
      if (!item.moveEnd) setTimeout(() => nextTick(() => { item.x = item.absX * viewWidth.value; item.y = item.absY * viewHeight.value }), 0)
      sortList()
    }
  }
}
const moveItem = (item, newIndex) => {
  const oldIndex = imageList.value.findIndex(i => i.id === item.id)
  if (oldIndex === -1 || oldIndex === newIndex) return
  imageList.value.splice(newIndex, 0, imageList.value.splice(oldIndex, 1)[0])
  imageList.value.forEach((it, idx) => { it.index = idx })
  sortList()
}
const changeObj = (obj, i) => {
  obj.index += i; obj.offset = 0; obj.x = obj.oldX; obj.y = obj.oldY
  obj.absX = obj.index % colsValue.value; obj.absY = Math.floor(obj.index / colsValue.value)
  setTimeout(() => nextTick(() => { obj.x = obj.absX * viewWidth.value; obj.y = obj.absY * viewHeight.value }), 0)
}
const onLongPressStart = (item, e) => {
  touchStartY.value = e.touches[0].clientY
  if (longPressTimer.value) clearTimeout(longPressTimer.value)
  imageList.value.forEach(i => { i.ready = false; i.disable = true })
  longPressTimer.value = setTimeout(() => {
    uni.vibrateShort?.()
    item.ready = true; item.disable = false; isDragging.value = true; touchstart(item)
  }, 240)
}
const touchstart = (item) => {
  imageList.value.forEach(v => { v.zIndex = v.index + 9 })
  item.zIndex = 99; item.moveEnd = true; tempItem.value = item
  timer.value = setTimeout(() => { item.scale = props.scale; item.opacity = props.opacity; clearTimeout(timer.value); timer.value = null }, 200)
}
const touchend = (item) => {
  item.scale = 1; item.opacity = 1; item.x = item.oldX; item.y = item.oldY
  item.offset = 0; item.moveEnd = false
  imageList.value.forEach(i => { i.ready = false; i.disable = true })
  if (isDragging.value) emit('sort-change', imageList.value.map(i => i.id))
  isDragging.value = false
  if (longPressTimer.value) { clearTimeout(longPressTimer.value); longPressTimer.value = null }
  setTimeout(() => {
    imageList.value.forEach(obj => {
      if (obj.ready) return
      obj.x = obj.absX * viewWidth.value; obj.y = obj.absY * viewHeight.value
      obj.offset = 0; obj.moveEnd = false
    })
    nextTick(() => { item.x = item.absX * viewWidth.value; item.y = item.absY * viewHeight.value; tempItem.value = null; changeStatus.value = true })
  }, 50)
}
const previewImage = (item) => {}
const mouseenter = () => { /* #ifdef H5 */ imageList.value.forEach(v => { v.disable = false }) /* #endif */ }
const mouseleave = () => { /* #ifdef H5 */ if (tempItem.value) { imageList.value.forEach(v => {
  v.disable = true; v.zIndex = v.index + 9; v.offset = 0; v.moveEnd = false
  if (v.id === tempItem.value.id) { if (timer.value) { clearTimeout(timer.value); timer.value = null }
    v.scale = 1; v.opacity = 1; v.x = v.oldX; v.y = v.oldY
    nextTick(() => { v.x = v.absX * viewWidth.value; v.y = v.absY * viewHeight.value; tempItem.value = null })
  }
}); changeStatus.value = true } /* #endif */ }
const onTouchMove = (e) => {
  if (isDragging.value) return
  const deltaY = Math.abs(e.touches[0].clientY - touchStartY.value)
  if (deltaY > 10 && longPressTimer.value) { clearTimeout(longPressTimer.value); longPressTimer.value = null }
}
const delImageHandle = (item, index) => {
  imageList.value.splice(index, 1)
  imageList.value.forEach(obj => {
    if (obj.index > item.index) {
      obj.index -= 1; obj.x = obj.oldX; obj.y = obj.oldY
      obj.absX = obj.index % colsValue.value; obj.absY = Math.floor(obj.index / colsValue.value)
      nextTick(() => { obj.x = obj.absX * viewWidth.value; obj.y = obj.absY * viewHeight.value })
    }
  })
  add.value.x = (imageList.value.length % colsValue.value) * viewWidth.value
  add.value.y = Math.floor(imageList.value.length / colsValue.value) * viewHeight.value
  sortList()
}
const delImageMp = (item, index) => {}
function go2preview(id) { uni.navigateTo({ url: '/pages/account_book_preview/account_book_preview?account_book_id=' + id }) }
const handleItemClick = (item) => { emit('item-click', item); if (!props.customClick) go2preview(item.id) }

const rpx2px = (v) => width.value * v / 750
const instanceRef = ref(null)
onMounted(() => {
  width.value = uni.getSystemInfoSync().windowWidth
  instanceRef.value = getCurrentInstance()
  nextTick(() => {
    const query = uni.createSelectorQuery().in(instanceRef.value.proxy)
    query.select('.con').boundingClientRect(data => {
      if (!data) return
      colsValue.value = props.cols
      viewWidth.value = data.width / props.cols
      viewHeight.value = viewWidth.value * 1.3
      if (props.imageWidth > 0) {
        viewWidth.value = rpx2px(props.imageWidth)
        viewHeight.value = viewWidth.value * 1.3
        colsValue.value = Math.floor(data.width / viewWidth.value)
      }
      const list = props.modelValue.length ? props.modelValue : props.value
      list.forEach(item => addProperties(item))
      first.value = false; isMounted.value = true
    }).exec()
  })
})
const addProperties = (item) => {
  const data = getItemData(item)
  const absX = imageList.value.length % colsValue.value
  const absY = Math.floor(imageList.value.length / colsValue.value)
  const x = absX * viewWidth.value
  const y = absY * viewHeight.value
  imageList.value.push({
    ...data,
    x, y, oldX: x, oldY: y,
    absX, absY, scale: 1, zIndex: 9, opacity: 1,
    index: imageList.value.length, id: item.id,
    disable: false, offset: 0, moveEnd: false,
    ready: false, __imgBroken: false
  })
  add.value.x = (imageList.value.length % colsValue.value) * viewWidth.value
  add.value.y = Math.floor(imageList.value.length / colsValue.value) * viewHeight.value
}
const updateItemsPosition = () => {
  imageList.value.forEach((item, index) => {
    item.index = index
    const newAbsX = index % colsValue.value
    const newAbsY = Math.floor(index / colsValue.value)
    item.x = newAbsX * viewWidth.value
    item.y = newAbsY * viewHeight.value
    item.oldX = item.x; item.oldY = item.y
    item.absX = newAbsX; item.absY = newAbsY
  })
}
const initViewSize = () => new Promise(resolve => {
  if (!instanceRef.value || !instanceRef.value.proxy) return resolve()
  const query = uni.createSelectorQuery().in(instanceRef.value.proxy)
  query.select('.con').boundingClientRect(data => {
    if (!data) return resolve()
    colsValue.value = props.cols
    viewWidth.value = data.width / props.cols
    viewHeight.value = viewWidth.value * 1.3
    if (props.imageWidth > 0) {
      viewWidth.value = rpx2px(props.imageWidth)
      viewHeight.value = viewWidth.value * 1.3
      colsValue.value = Math.floor(data.width / viewWidth.value)
    }
    resolve()
  }).exec()
})
watch(() => props.modelValue, (newVal) => {
  if (isDragging.value) return
  if (isMounted.value) nextTick(() => { initViewSize().then(() => updateImageList(newVal)) })
}, { deep: true, immediate: true })
const updateImageList = (newList) => {
  const oldItems = imageList.value.reduce((map, item) => (map[item.id] = item, map), {})
  imageList.value = newList.map(item => {
    const existing = oldItems[item.id]
    const fresh = getItemData(item)
    return existing ? { ...existing, ...fresh } : createNewItem(item)
  })
  updateItemsPosition()
}
const createNewItem = (item) => {
  const data = getItemData(item)
  const absX = imageList.value.length % colsValue.value
  const absY = Math.floor(imageList.value.length / colsValue.value)
  return {
    ...data,
    x: absX * viewWidth.value,
    y: absY * viewHeight.value,
    oldX: absX * viewWidth.value,
    oldY: absY * viewHeight.value,
    absX, absY, scale: 1, zIndex: 9, opacity: 1,
    index: imageList.value.length, disable: false, offset: 0, moveEnd: false,
    ready: false, __imgBroken: false
  }
}

/* ===== 文本与颜色 ===== */
function getPaymentText(item){
  const st = Number(item?.payStatus ?? 1)
  return props.paymentMap?.[st] || props.paymentMap?.[1] || '已全款'
}
/* 清洗价格字符串，去掉类似 “365【已全款】” 的后缀 */
function getDisplayPrice(price){
  if (price === null || price === undefined) return ''
  return String(price).replace(/【.*?】/g, '').trim()
}
</script>

<style lang="scss" scoped>
.con { width: 100%; box-sizing: border-box; }
.area { width: 100%; position: relative; background-color: #fff; border-radius: 16rpx; overflow: hidden; }
.view { display: flex; justify-content: center; align-items: center; }
.ready { border: 3px solid #65c6d9; box-shadow: 0 0 5px #65c6d9; }

.area-con { position: relative; overflow: hidden; background-color: #fff; box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.08); display: flex; flex-direction: column; }
.pre-image { width: 100%; height: 85%; display: block; }
.info-container {
  padding: 8rpx; display: flex; flex-direction: column; height: 30%;
  .name { font-size: 24rpx; font-weight: bold; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: center; }
  .price { font-size: 26rpx; color: #ff9c9a; margin-top: 4rpx; text-align: center; font-weight: 1000; }
  .type {
    position: absolute; top: 8rpx; left: 8rpx;
    background: linear-gradient(135deg, #91c9ffa3, #7aa6ffa1);
    color: #fff; padding: 8rpx 18rpx; border-radius: 12rpx;
    font-size: 22rpx; font-weight: 700;
    box-shadow: 0 2rpx 8rpx rgba(122,166,255,.18);
  }
}

/* ✅ 糖果配色的小标签：位于“分类标签”正下方（左上角对齐） */
.pay-badge.candy{
  position: absolute; left: 8rpx; top: 56rpx;  /* 放到分类标签下方 */
  padding: 8rpx 16rpx; border-radius: 20rpx;
  font-size: 22rpx; font-weight: 800; line-height: 1;
  letter-spacing: 1rpx;
  transform: translateZ(0);  /* 更锐利的阴影 */
  opacity: 6;
  backdrop-filter: blur(6px);
}

/* 三种状态的糖果色 */
.s-1{  /* 已全款 - 薄荷糖绿 */
	box-shadow: 0 2rpx 10rpx rgba(26,155,86,.18);
      background: linear-gradient(135deg, #e3e3e3, #d6ecdf);
      color: #686868;

}
.s-2{  /* 已付定金 - 蜜桃橙 */
  background: linear-gradient(135deg,#ffe9d6,#ffd2ad);
  color: #686868; box-shadow: 0 2rpx 10rpx rgba(201,116,0,.18);
}
.s-3{  /* 未购买 - 草莓粉 */
  background: linear-gradient(135deg,#ffe0ea,#ffc2d4);
  color: #686868;box-shadow: 0 2rpx 10rpx rgba(216,58,86,.18);
}

/* 删除按钮 */
.delete-btn{
  position: absolute; top: 0rpx; right: 0rpx; border-radius: 50%;
  display:flex; justify-content:center; align-items:center; z-index:100; font-size:30rpx; cursor: pointer;
}
</style>
