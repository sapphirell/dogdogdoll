<template>
  <view class="container">
	  <view-logs />
    <!-- 分类导航栏 -->
    <scroll-view scroll-x="true" class="category-scroll" :scroll-with-animation="true">
      <view class="category-list">
        <!-- 全部 -->
        <view class="category-item" :class="{ active: currentType === 'all' }" @click="changeType('all')">
          <text>全部</text>
          <text class="count">({{ allCount || 0 }})</text>
        </view>
        <!-- 其他分类 -->
        <view
          v-for="(count, e_type) in typeCount"
          v-if="e_type !== 'all'"
          :key="e_type"
          class="category-item"
          :class="{ active: currentType === e_type }"
          @click="changeType(e_type)"
        >
          <text>{{ e_type }}</text>
          <text class="count">({{ count }})</text>
        </view>
      </view>
    </scroll-view>

    <!-- 商品列表 -->
    <view v-if="loading" class="loading">加载中...</view>
    <view v-else-if="goodsList.length === 0" class="empty">暂无商品</view>

    <scroll-view v-else scroll-y="true" class="scroll-view" @scrolltolower="loadMore">
      <view class="goods-list">
        <view
          v-for="(item, index) in goodsList"
          :key="item.id"
          class="goods-item"
          :class="{'last-item': index === goodsList.length - 1}"
        >
          <!-- 商品图片和信息区域 -->
          <view class="goods-main">
            <!-- 商品图片 - 宽高比3:4 -->
            <view class="image-container">
              <image
                class="goods-image"
                :src="(item.goods_images && item.goods_images[0]) || '/static/default-goods.png'"
                mode="aspectFill"
              />
            </view>

            <!-- 商品信息 -->
            <view class="goods-info">
              <view class="title-row">
                <text class="goods-name">{{ item.name }}</text>
                <view class="tag" v-if="item.is_hot">热销</view>
              </view>

              <view class="goods-details">
                <view class="detail-item">
                  <text class="detail-label">尺寸:</text>
                  <text class="detail-value">{{ item.size || '无' }}</text>
                </view>
                <view class="detail-item">
                  <text class="detail-label">肤色:</text>
                  <text class="detail-value">{{ item.skin || '无' }}</text>
                </view>
              </view>

              <!-- 价格显示 -->
              <view class="price-container">
                <text class="goods-price">¥{{ item.total_amount }}</text>
                <text class="goods-currency">{{ item.currency }}</text>
              </view>
            </view>
          </view>

          <!-- 操作按钮 - 单独一行四个按钮 -->
          <view class="action-buttons-single-row">
            <button class="btn preview" @click="previewGoods(item.id)">
              <uni-icons type="eye" size="14" color="#3a3a3a"></uni-icons>
              预览
            </button>
            <button class="btn edit" @click="editGoods(item.id)">
              <uni-icons type="compose" size="14" color="#3a3a3a"></uni-icons>
              编辑
            </button>
            <button class="btn collocation" @click="openCollocation(item.id)">
              <uni-icons type="star" size="14" color="#3a3a3a"></uni-icons>
              搭配参考
            </button>
            <button class="btn sales" @click="openSalesPlan(item.id)">
              <uni-icons type="shop" size="14" color="#3a3a3a"></uni-icons>
              贩售计划
            </button>
          </view>
        </view>
      </view>

      <!-- 加载更多提示 -->
      <view class="load-more">
        <uni-load-more
          :status="loadStatus"
          :contentText="{
            contentdown: '上拉加载更多',
            contentrefresh: '正在加载...',
            contentnomore: '没有更多了'
          }"
        />
      </view>
    </scroll-view>

    <!-- 贩售计划弹窗 -->
    <uni-popup ref="salesPopup" type="bottom" background-color="#fff">
      <view class="sales-popup">
        <scroll-view scroll-y="true" class="popup-scroll-view">
          <!-- 固定标题 -->
          <view class="popup-header">
            <text class="title">贩售计划管理</text>
            <uni-icons type="close" size="20" color="#999" @click="closeSalesPopup"></uni-icons>
          </view>

          <!-- 贩售记录列表 -->
          <view class="sales-list" v-if="salesList.length > 0">
            <view class="sales-item" v-for="sale in salesList" :key="sale.id">
              <view class="sale-info">
                <text class="sale-type">{{ saleTypeMap[sale.sale_type] || sale.sale_type }}</text>
                <text class="sale-time">
                  {{ formatDateString(sale.sub_time) }} {{ formatHourMinute(sale.sub_time) }} -
                  {{ formatDateString(sale.sub_time_end) }} {{ formatHourMinute(sale.sub_time_end) }}
                </text>
                <text class="sale-amount">定金: ¥{{ sale.sub_amount }} 尾款: ¥{{ sale.fin_amount }}</text>
              </view>
              <view class="sale-actions">
                <uni-icons type="compose" size="18" color="#666" @click="editSale(sale)"></uni-icons>
                <uni-icons type="trash" size="18" color="#f56c6c" @click="deleteSale(sale.id)"></uni-icons>
              </view>
            </view>
          </view>
          <view v-else class="no-sales">
            <text>暂无贩售计划</text>
          </view>

          <!-- 添加按钮 -->
          <button class="add-btn" @click="addSale">
            <uni-icons type="plus" size="16" color="#fff"></uni-icons>
            添加贩售计划
          </button>

          <!-- 编辑/添加表单 -->
          <view class="sale-form" v-if="showSaleForm">
            <!-- 贩售模式选择 -->
            <view class="form-item">
              <text class="label">贩售模式</text>
              <picker mode="selector" :range="saleTypeOptions" :value="saleTypeIndex" @change="changeSaleType">
                <view class="picker">
                  {{ saleTypeMap[currentSale.sale_type] || currentSale.sale_type || '请选择贩售模式' }}
                </view>
              </picker>
            </view>

            <!-- 定金金额 -->
            <view class="form-item">
              <text class="label">定金金额</text>
              <input type="number" v-model="currentSale.sub_amount" placeholder="请输入定金金额" />
            </view>

            <!-- 尾款金额 -->
            <view class="form-item">
              <text class="label">尾款金额</text>
              <input type="number" v-model="currentSale.fin_amount" placeholder="请输入尾款金额" />
            </view>

            <!-- 定金时间（开始） -->
            <view class="form-item">
              <text class="label">定金时间</text>
              <picker mode="date" :value="subDate" @change="onSubDateChange">
                <view class="picker">{{ subDate || '选择日期' }}</view>
              </picker>
              <picker mode="time" :value="subTime" @change="onSubTimeChange">
                <view class="picker">{{ subTime || '选择时间' }}</view>
              </picker>
            </view>

            <!-- 预定/购买截止时间（结束） -->
            <view class="form-item">
              <text class="label">预定/购买截止时间</text>
              <picker mode="date" :value="endDate" @change="onEndDateChange">
                <view class="picker">{{ endDate || '选择日期' }}</view>
              </picker>
              <picker mode="time" :value="endTime" @change="onEndTimeChange">
                <view class="picker">{{ endTime || '选择时间' }}</view>
              </picker>
            </view>

            <!-- 币种选择 -->
            <view class="form-item">
              <text class="label">币种</text>
              <picker mode="selector" :range="currencyOptions" :value="currencyIndex" @change="changeCurrency">
                <view class="picker">
                  {{ currencies[currencyIndex]?.value || currentSale.currency || '请选择币种' }}
                </view>
              </picker>
            </view>

            <!-- 表单按钮 -->
            <view class="form-buttons">
              <button class="btn cancel" @click="cancelForm">取消</button>
              <button class="btn save" @click="saveSale">保存</button>
            </view>
          </view>
        </scroll-view>
      </view>
    </uni-popup>

    <view class="floating-button" @tap="jump2postGoods">
      <uni-icons type="plusempty" size="30" color="#fff"></uni-icons>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { websiteUrl, asyncGetUserInfo } from '@/common/config.js'

// 列表 & 分页
const goodsList = ref([])
const loading = ref(true)
const loadStatus = ref('more') // more / loading / noMore
const error = ref(null)
const pageInfo = ref(null)
const currentPage = ref(1)

// 分类
const typeCount = ref({})   // 不包含 all
const currentType = ref('all')
const allCount = ref(0)

// 贩售计划
const salesPopup = ref(null)
const salesList = ref([])
const currentGoodsId = ref(0)
const showSaleForm = ref(false)

// 选择器
const saleTypeIndex = ref(0)
const currencyIndex = ref(0)

// 贩售模式
const saleTypeMap = {
  '限量预定': '限量预定',
  '限时预定': '限时预定',
  '限时限量预定': '限时限量预定',
  '限量现货': '限量现货',
  '现货': '现货'
}
const saleTypeOptions = ['限量预定', '限时预定', '限时限量预定', '限量现货', '现货']

// 币种
const currencies = ref([
  { value: 'CNY', text: '人民币 (CNY)' },
  { value: 'USD', text: '美元 (USD)' },
  { value: 'JPY', text: '日元 (JPY)' },
  { value: 'KRW', text: '韩元 (KRW)' }
])
const currencyOptions = computed(() => currencies.value.map(i => i.text))

// 表单 - 时间分离字段
const subDate = ref('')
const subTime = ref('')
const endDate = ref('')
const endTime = ref('')

// 当前编辑/新增的贩售记录（**不要放 fin_time 等未使用字段**）
const currentSale = ref({
  id: undefined,
  goods_id: 0,
  sale_type: '',
  sub_amount: '',
  fin_amount: '',
  sub_time: undefined,      // 秒
  sub_time_end: undefined,  // 秒
  currency: 'CNY'
})

// ---- 分类数量 ----
const fetchTypeCount = async () => {
  try {
    const token = uni.getStorageSync('token')
    const res = await uni.request({
      url: `${websiteUrl.value}/brand-manager/get-goods-count`,
      method: 'GET',
      header: { Authorization: token },
      data: {
        brand_id: 1 // TODO: 替换为真实品牌ID
      }
    })
    if (res.data.status === 'success') {
      // 原始各分类统计
      typeCount.value = res.data.data || {}
      // 单独统计全部
      let total = 0
      Object.keys(typeCount.value).forEach(k => total += Number(typeCount.value[k] || 0))
      allCount.value = total
    } else {
      uni.showToast({ title: res.data.msg || '获取分类数量失败', icon: 'none' })
    }
  } catch (e) {
    console.error(e)
    uni.showToast({ title: '获取分类数量失败', icon: 'none' })
  }
}

// ---- 跳转 ----
const jump2postGoods = () => {
  uni.navigateTo({ url: `/pkg-creator/creator_base/goods_editor/goods_editor` })
}
const previewGoods = (goodsId) => {
  uni.navigateTo({ url: `/pages/goods/goods?goods_id=${goodsId}` })
}
const editGoods = (goodsId) => {
  uni.navigateTo({ url: `/pkg-creator/creator_base/goods_editor/goods_editor?goods_id=${goodsId}` })
}
const openCollocation = (goodsId) => {
  uni.navigateTo({ url: `/pkg-creator/creator_base/collocation_list/collocation_list?goods_id=${goodsId}` })
}

// ---- 分类切换 ----
const changeType = (type) => {
  currentType.value = type
  currentPage.value = 1
  goodsList.value = []
  fetchGoodsList(1)
}

// ---- 列表 ----
const fetchGoodsList = async (page = 1) => {
  try {
    if (page > 1) loadStatus.value = 'loading'
    else loading.value = true

    const token = uni.getStorageSync('token')
    if (!token) {
      error.value = '未登录，请先登录'
      loading.value = false
      loadStatus.value = 'more'
      return
    }

    const res = await uni.request({
      url: `${websiteUrl.value}/brand-manager/get-goods-list`,
      method: 'GET',
      header: { Authorization: token },
      data: {
        page,
        page_size: 10,
        type: currentType.value === 'all' ? '' : currentType.value
      }
    })

    const resp = res.data
    if (resp.status === 'success') {
      const newGoods = resp.data.goods_list || []
      currentPage.value = page
      goodsList.value = page === 1 ? newGoods : goodsList.value.concat(newGoods)

      pageInfo.value = {
        page_index: resp.data.page_index,
        page_size: resp.data.page_size,
        total: resp.data.total
      }

      const totalPages = Math.ceil(pageInfo.value.total / pageInfo.value.page_size)
      loadStatus.value = pageInfo.value.page_index < totalPages ? 'more' : 'noMore'
    } else {
      error.value = resp.msg || '获取商品列表失败'
      uni.showToast({ title: error.value, icon: 'none' })
      loadStatus.value = 'more'
    }
  } catch (e) {
    error.value = '网络请求失败'
    console.error('获取商品列表失败:', e)
    uni.showToast({ title: '网络请求失败', icon: 'none' })
    loadStatus.value = 'more'
  } finally {
    loading.value = false
  }
}
const loadMore = () => {
  if (loadStatus.value === 'more') fetchGoodsList(currentPage.value + 1)
}

// ---- 弹窗 ----
const openSalesPlan = async (goodsId) => {
  currentGoodsId.value = goodsId
  await fetchSalesList(goodsId)
  salesPopup.value.open()
}
const closeSalesPopup = () => {
  salesPopup.value.close()
  resetSalesForm()
}

// ---- 贩售列表 ----
const fetchSalesList = async (goodsId) => {
  try {
    const token = uni.getStorageSync('token')
    const res = await uni.request({
      url: `${websiteUrl.value}/brand-manager/goods-sales`,
      method: 'GET',
      header: { Authorization: token },
      data: { goods_id: goodsId }
    })
    if (res.data.status === 'success') {
      salesList.value = res.data.data || []
    } else {
      salesList.value = []
      uni.showToast({ title: res.data.msg || '获取贩售计划失败', icon: 'none' })
    }
  } catch (e) {
    console.error('获取贩售计划失败:', e)
    salesList.value = []
    uni.showToast({ title: '获取贩售计划失败', icon: 'none' })
  }
}

// ---- 表单：新增/编辑 ----
const addSale = () => {
  currentSale.value = {
    id: undefined,
    goods_id: currentGoodsId.value,
    sale_type: '',
    sub_amount: '',
    fin_amount: '',
    sub_time: undefined,
    sub_time_end: undefined,
    currency: 'CNY'
  }
  subDate.value = ''
  subTime.value = ''
  endDate.value = ''
  endTime.value = ''
  showSaleForm.value = true
}

// 从列表进入编辑
const editSale = (sale) => {
  // 不直接使用 sale 引用，浅拷贝后过滤无关字段
  currentSale.value = {
    id: sale.id,
    goods_id: sale.goods_id,
    sale_type: sale.sale_type || '',
    sub_amount: sale.sub_amount ?? '',
    fin_amount: sale.fin_amount ?? '',
    sub_time: sale.sub_time,
    sub_time_end: sale.sub_time_end,
    currency: sale.currency || 'CNY'
  }

  // 分解已有时间
  if (sale.sub_time && sale.sub_time > 0) {
    subDate.value = formatDateString(sale.sub_time)
    subTime.value = formatHourMinute(sale.sub_time)
  } else {
    subDate.value = ''
    subTime.value = ''
  }
  if (sale.sub_time_end && sale.sub_time_end > 0) {
    endDate.value = formatDateString(sale.sub_time_end)
    endTime.value = formatHourMinute(sale.sub_time_end)
  } else {
    endDate.value = ''
    endTime.value = ''
  }

  // 选择器索引回显（可选）
  saleTypeIndex.value = Math.max(0, saleTypeOptions.indexOf(currentSale.value.sale_type))
  currencyIndex.value = Math.max(0, currencies.value.findIndex(c => c.value === currentSale.value.currency))

  showSaleForm.value = true
}

// 删除
const deleteSale = async (saleId) => {
  uni.showModal({
    title: '删除确认',
    content: '确定要删除这条贩售计划吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const token = uni.getStorageSync('token')
          const resp = await uni.request({
            url: `${websiteUrl.value}/brand-manager/sale`,
            method: 'DELETE',
            header: { Authorization: token },
            data: { id: saleId }
          })
          if (resp.data.status === 'success') {
            uni.showToast({ title: '删除成功', icon: 'success' })
            await fetchSalesList(currentGoodsId.value)
          } else {
            uni.showToast({ title: resp.data.msg || '删除失败', icon: 'none' })
          }
        } catch (e) {
          console.error('删除贩售计划失败:', e)
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    }
  })
}

// 选择器回调
const changeSaleType = (e) => {
  const index = Number(e.detail.value)
  saleTypeIndex.value = index
  currentSale.value.sale_type = saleTypeOptions[index]
}
const changeCurrency = (e) => {
  const index = Number(e.detail.value)
  currencyIndex.value = index
  currentSale.value.currency = currencies.value[index].value
}

// 日期/时间选择
const onSubDateChange = (e) => { subDate.value = e.detail.value }
const onSubTimeChange = (e) => { subTime.value = e.detail.value }
const onEndDateChange = (e) => { endDate.value = e.detail.value }
const onEndTimeChange = (e) => { endTime.value = e.detail.value }

// 保存
const saveSale = async () => {
  try {
    // 基础校验
    if (!currentSale.value.sale_type) return uni.showToast({ title: '请选择贩售模式', icon: 'none' })
    if (currentSale.value.sub_amount === '' || isNaN(Number(currentSale.value.sub_amount))) {
      return uni.showToast({ title: '请输入定金金额', icon: 'none' })
    }
    if (currentSale.value.fin_amount === '' || isNaN(Number(currentSale.value.fin_amount))) {
      return uni.showToast({ title: '请输入尾款金额', icon: 'none' })
    }
    if (!currentSale.value.currency) return uni.showToast({ title: '请选择币种', icon: 'none' })

    // 时间必填（开始 & 结束）
    if (!subDate.value || !subTime.value) {
      return uni.showToast({ title: '请选择完整的开始时间', icon: 'none' })
    }
    if (!endDate.value || !endTime.value) {
      return uni.showToast({ title: '请选择完整的预定/购买截止时间', icon: 'none' })
    }

    // 组合并转为秒级时间戳（Number）
    const startSec = Math.floor(new Date(`${subDate.value} ${subTime.value}`).getTime() / 1000)
    const endSec   = Math.floor(new Date(`${endDate.value} ${endTime.value}`).getTime() / 1000)

    // 仅组装需要的字段（避免 fin_time: "" 之类字符串进入请求体）
    const saleData = {
      ...(currentSale.value.id ? { id: currentSale.value.id } : {}),
      goods_id: Number(currentGoodsId.value),
      sale_type: currentSale.value.sale_type,
      sub_amount: Number(currentSale.value.sub_amount),
      fin_amount: Number(currentSale.value.fin_amount),
      currency: currentSale.value.currency,
      sub_time: Number(startSec),
      sub_time_end: Number(endSec)
    }

    const token = uni.getStorageSync('token')
    const isUpdate = !!currentSale.value.id
    const url = isUpdate
      ? `${websiteUrl.value}/brand-manager/update-sales`
      : `${websiteUrl.value}/brand-manager/create-sales`

    const resp = await uni.request({
      url,
      method: 'POST',
      header: { Authorization: token, 'Content-Type': 'application/json' },
      data: saleData
    })

    if (resp.data.status === 'success') {
      uni.showToast({ title: '保存成功', icon: 'success' })
      await fetchSalesList(currentGoodsId.value)
      resetSalesForm()
    } else {
      uni.showToast({ title: resp.data.msg || '保存失败', icon: 'none' })
    }
  } catch (e) {
    console.error('保存贩售计划失败:', e)
    uni.showToast({ title: '保存失败', icon: 'none' })
  }
}

// 重置
const resetSalesForm = () => {
  currentSale.value = {
    id: undefined,
    goods_id: 0,
    sale_type: '',
    sub_amount: '',
    fin_amount: '',
    sub_time: undefined,
    sub_time_end: undefined,
    currency: 'CNY'
  }
  subDate.value = ''
  subTime.value = ''
  endDate.value = ''
  endTime.value = ''
  showSaleForm.value = false
  saleTypeIndex.value = 0
  currencyIndex.value = 0
}

// ---- 时间格式化 ----
const formatTimeOnly = (date) =>
  `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
const formatHourMinute = (timestamp) => {
  if (!timestamp) return ''
  const d = new Date(timestamp * 1000)
  return formatTimeOnly(d)
}
const formatDateString = (timestamp) => {
  if (!timestamp) return ''
  const d = new Date(timestamp * 1000)
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
}

// ---- 生命周期 ----
onShow(async () => {
  uni.setNavigationBarTitle({ title: '作品管理' })

  const userInfo = await asyncGetUserInfo()
  if (!userInfo) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/login/login' })
    }, 1500)
    return
  }

  await fetchTypeCount()
  fetchGoodsList(1)
})
</script>

<style lang="less" scoped>
.container {
  padding: 20rpx;
  background: linear-gradient(to bottom, #f8f9fc, #ffffff);
  min-height: 100vh;
}

/* 分类导航栏 */
.category-scroll {
  width: 100%;
  white-space: nowrap;
  background: #fff;
  border-bottom: 1px solid #f1f1f1;
  padding: 10rpx 0;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  height: 70rpx;
}
.category-list {
  display: inline-flex;
  padding: 0 20rpx;
  height: 100%;
}
.category-item {
  display: inline-flex;
  align-items: center;
  padding: 0 25rpx;
  margin-right: 20rpx;
  background: #f5f5f7;
  border-radius: 40rpx;
  font-size: 26rpx;
  color: #666;
  height: 50rpx;
  flex-shrink: 0;

  &.active {
    background-color: #81D8cf;
    color: #fff6e1;
    text { color: #fff6e1; }
    .count { color: #fff6e1; }
  }

  .count {
    font-size: 22rpx;
    color: #999;
    margin-left: 8rpx;
  }
}

.loading, .empty {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 28rpx;
}
.scroll-view {
  width: 100%;
  height: calc(100vh - 100rpx);
}

/* 列表 */
.goods-list {
  .goods-item {
    display: flex;
    flex-direction: column;
    margin-bottom: 30rpx;
    background: #fff;
    border-radius: 24rpx;
    overflow: hidden;
    box-shadow: 0 6rpx 30rpx rgba(0, 0, 100, 0.05);
    transition: all 0.3s ease;
    position: relative;

    &.last-item { margin-bottom: 60rpx; }

    .goods-main { display: flex; padding: 20rpx; }

    .image-container {
      width: 180rpx;
      height: 240rpx; /* 3:4 */
      position: relative;
      overflow: hidden;
      border-radius: 16rpx;
      background: #f9f9f9;
      margin-right: 20rpx;
    }
    .goods-image { width: 100%; height: 100%; display: block; }

    .goods-info {
      flex: 1; display: flex; flex-direction: column;

      .title-row { display: flex; align-items: center; margin-bottom: 12rpx; }
      .goods-name {
        font-size: 26rpx; font-weight: bold; color: #333; line-height: 1.4; flex: 1;
        overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
      }
      .tag {
        background: linear-gradient(to right, #FFD1DC, #FFB6C1);
        color: white; font-size: 22rpx; padding: 4rpx 12rpx; border-radius: 6rpx; margin-left: 15rpx;
      }

      .goods-details {
        display: flex; flex-direction: column; margin-bottom: 18rpx; background: #f9fafd; border-radius: 12rpx; padding: 15rpx;
        .detail-item { display: flex; margin-bottom: 8rpx; font-size: 26rpx; &:last-child{ margin-bottom: 0; } }
        .detail-label { color: #888; width: 100rpx; flex-shrink: 0; }
        .detail-value { color: #555; font-weight: 500; }
      }

      .price-container {
        display: flex; align-items: baseline; margin-top: auto;
        .goods-price { font-size: 36rpx; color: #FF9EB5; font-weight: bold; margin-right: 12rpx; }
        .goods-currency { font-size: 26rpx; color: #999; transform: translateY(2rpx); }
      }
    }

    .action-buttons-single-row {
      display: flex; justify-content: space-between; padding: 0 20rpx 20rpx; margin-top: 10rpx; gap: 15rpx;
      .btn {
        flex: 1; height: 70rpx; line-height: 70rpx; font-size: 22rpx; border-radius: 10rpx; margin: 0 4rpx; padding: 0;
        display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;
        box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.08);
        &:active { opacity: 0.85; transform: scale(0.95); box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05); }
        &:after { border: none; }
        .uni-icons { margin-right: 6rpx; }
      }
    }
  }
}

.load-more { padding: 30rpx 0; text-align: center; color: #999; font-size: 26rpx; }

/* 弹窗 */
.sales-popup {
  background-color: #fff;
  border-radius: 30rpx 30rpx 0 0;
  padding: 30rpx;
  max-height: 80vh;
  display: flex;
  flex-direction: column;

  .popup-header {
    display: flex; justify-content: space-between; align-items: center;
    padding-bottom: 20rpx; border-bottom: 1rpx solid #eee; margin-bottom: 20rpx;
    .title { font-size: 32rpx; font-weight: bold; color: #333; }
  }

  .sales-list {
    flex: 1; max-height: 50vh; margin-bottom: 20rpx;
    .sales-item {
      display: flex; justify-content: space-between; align-items: center; padding: 20rpx; border-bottom: 1rpx solid #f5f5f5;
      .sale-info {
        flex: 1; display: flex; flex-direction: column;
        .sale-type { font-size: 28rpx; font-weight: bold; color: #333; margin-bottom: 10rpx; }
        .sale-time { font-size: 24rpx; color: #666; margin-bottom: 8rpx; }
        .sale-amount { font-size: 24rpx; color: #e74c3c; }
      }
      .sale-actions { display: flex; gap: 30rpx; .uni-icons{ padding: 10rpx; } }
    }
  }

  .no-sales { text-align: center; padding: 40rpx 0; color: #999; font-size: 28rpx; }

  .add-btn {
    background: linear-gradient(135deg, #a6e9f7, #1ed1e1);
    color: #fff; height: 80rpx; line-height: 80rpx; border-radius: 40rpx; font-size: 28rpx; margin-top: 20rpx;
    display: flex; justify-content: center; align-items: center; .uni-icons{ margin-right: 10rpx; }
  }

  .sale-form {
    padding: 20rpx; background: #f9f9f9; border-radius: 16rpx; margin-top: 20rpx;

    .form-item {
      margin-bottom: 30rpx; display: flex; flex-direction: column;
      .label { font-size: 28rpx; font-weight: 500; color: #555; margin-bottom: 15rpx; }
      input, .picker {
        height: 80rpx; background: #fff; border: 1rpx solid #e0e0e0; border-radius: 12rpx; padding: 0 20rpx;
        font-size: 28rpx; color: #333; display: flex; align-items: center;
      }
      .picker { margin-top: 10rpx; justify-content: space-between;
        &:after{ content: ">"; transform: rotate(90deg); color: #999; font-size: 24rpx; }
      }
    }

    .form-buttons {
      display: flex; justify-content: space-between; margin-top: 40rpx; gap: 20rpx;
      .btn {
        flex: 1; height: 90rpx; line-height: 90rpx; border-radius: 12rpx; font-size: 30rpx; font-weight: 500; transition: all 0.3s;
        &.cancel { background-color: #f5f5f7; color: #666; border: 1rpx solid #e0e0e0; &:active{ background-color: #eaeaea; } }
        &.save   { background: linear-gradient(135deg, #a6e9f7, #1ed1e1); color: #fff; border: none; &:active{ opacity: 0.9; } }
      }
    }
  }
}

.popup-scroll-view { height: 1200rpx; }
.floating-button {
  position: fixed; right: 40rpx; bottom: 120rpx; width: 90rpx; height: 90rpx;
  background: linear-gradient(135deg, #a6e9f7, #1ed1e1);
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 6rpx 20rpx rgba(30, 209, 225, 0.4); z-index: 99; transition: all 0.3s ease;
  &:active { transform: scale(0.95); box-shadow: 0 4rpx 12rpx rgba(30, 209, 225, 0.3); }
}
</style>
