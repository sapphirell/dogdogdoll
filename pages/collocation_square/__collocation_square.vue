<template>
  <view class="container">
    <!-- 筛选条件展示 -->
    <view class="filter-bar" v-if="filterConditions.length">
      <text class="filter-tag" v-for="(condition, index) in filterConditions" :key="index">
        {{ condition }}
        <text class="close" @tap="clearFilter(index)">×</text>
      </text>
    </view>

    <!-- 瀑布流列表 -->
    <uv-waterfall
      v-model="collocationList"
      ref="uvWaterfall"
      :add-time="10"
      @change="onWaterfallChange"
      @remove="onWaterfallRemove"
    >
      <template v-slot:left="{ leftList }">
        <view v-for="item in leftList" :key="item.collocation_id" class="card" @tap="navigateToDetail(item)">
          <image
            v-for="(img, idx) in item.image_urls"
            :key="idx"
            :src="img"
            mode="aspectFill"
            class="card-image"
          />
          <view class="card-content">
            <text class="title">{{ item.title }}</text>
            <text class="content">{{ item.content }}</text>
            <view class="relation-list">
              <text
                v-for="relation in item.relation_list"
                :key="relation.relation_id"
                class="relation-tag"
              >
                {{ relation.relation_goods_name }}
              </text>
            </view>
          </view>
        </view>
      </template>

      <template v-slot:right="{ rightList }">
        <view v-for="item in rightList" :key="item.collocation_id" class="card" @tap="navigateToDetail(item)">
          <!-- 右侧列内容同上 -->
          <image
            v-for="(img, idx) in item.image_urls"
            :key="idx"
            :src="img"
            mode="aspectFill"
            class="card-image"
          />
          <view class="card-content">
            <text class="title">{{ item.title }}</text>
            <text class="content">{{ item.content }}</text>
            <view class="relation-list">
              <text
                v-for="relation in item.relation_list"
                :key="relation.relation_id"
                class="relation-tag"
              >
                {{ relation.relation_goods_name }}
              </text>
            </view>
          </view>
        </view>
      </template>
    </uv-waterfall>

    <!-- 筛选弹窗 -->
    <common-modal v-model:visible="showFilterModal">
      <view class="filter-modal">
        <common-search mode="fill" @select="handleBrandSelect" width="calc(100% - 40px)"/>
        <custom-picker 
          :dataList="goodsList" 
          @select="handleGoodsSelect"
          placeholder="选择商品"
          style="margin-top: 15px;"
        />
        <button class="confirm-btn" @tap="confirmFilter">确认筛选</button>
      </view>
    </common-modal>

    <!-- 筛选按钮 -->
    <view class="filter-btn" @tap="showFilterModal = true">
      <text class="iconfont icon-filter"></text>
      <text>筛选</text>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { websiteUrl } from "../../common/config.js"
import { onReachBottom } from "@dcloudio/uni-app"

// 组件引用
const uvWaterfall = ref(null)
const showFilterModal = ref(false)
const collocationList = ref([])
const filterConditions = ref([])

// 筛选相关
const selectedBrand = reactive({
  id: null,
  name: ''
})
const selectedGoods = reactive({
  id: null,
  name: ''
})
const goodsList = ref([])

// 分页参数
const pagination = reactive({
  page: 1,
  page_size: 10,
  total: 0,
  loading: false,
  finished: false
})

// 初始化加载
onMounted(() => {
  loadData()
})

// 加载数据
const loadData = async (reset = false) => {
  if (pagination.loading) return
  
  pagination.loading = true
  if (reset) {
    collocationList.value = []
    pagination.page = 1
  }

  try {
    const params = {
      page: pagination.page,
      page_size: pagination.page_size,
      filter_goods_id_list: selectedGoods.id ? [selectedGoods.id] : []
    }

    const res = await uni.request({
      url: `${websiteUrl}/collocation-list`,
      method: 'POST',
      data: params
    })

    if (res.data.status === 'success') {
      const data = res.data.data
      collocationList.value = [...collocationList.value, ...data.collocation_relation_list]
      pagination.total = data.total
      pagination.finished = collocationList.value.length >= data.total
      pagination.page++
    }
  } finally {
    pagination.loading = false
  }
}

// 筛选处理
const handleBrandSelect = (brandId, brandName) => {
  selectedBrand.id = brandId
  selectedBrand.name = brandName
  getGoods(brandId)
}

const handleGoodsSelect = (goods) => {
  selectedGoods.id = goods.id
  selectedGoods.name = goods.name
}

const confirmFilter = () => {
  filterConditions.value = []
  if (selectedBrand.name) filterConditions.value.push(selectedBrand.name)
  if (selectedGoods.name) filterConditions.value.push(selectedGoods.name)
  showFilterModal.value = false
  loadData(true)
}

// 清除筛选
const clearFilter = (index) => {
  filterConditions.value.splice(index, 1)
  if (index === 0) selectedBrand.id = null
  if (index === 1) selectedGoods.id = null
  loadData(true)
}

// 跳转处理
const navigateToDetail = (item) => {
  uni.navigateTo({
    url: `/pages/collocation_share/collocation_share?collocation_id=${item.collocation_id}&origin=${item.origin}`
  })
}

// 获取商品列表
const getGoods = async (brandId) => {
  try {
    const res = await uni.request({
      url: `${websiteUrl}/goods-name-list?id=${brandId}`,
      method: 'GET'
    })
    goodsList.value = res.data.data || []
  } catch (error) {
    console.error('获取商品列表失败', error)
  }
}

// 加载更多
onReachBottom(() => {
  if (!pagination.finished) loadData()
})
</script>

<style lang="less">
.container {
  padding: 15px;
  background-color: #f5f5f5;
}

.filter-bar {
  margin-bottom: 15px;
  .filter-tag {
    display: inline-block;
    padding: 6px 12px;
    margin-right: 10px;
    background-color: #fff;
    border-radius: 16px;
    font-size: 12px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    .close {
      margin-left: 6px;
      color: #999;
      font-size: 16px;
    }
  }
}

.card {
  background: #fff;
  border-radius: 12px;
  margin-bottom: 15px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  
  &-image {
    width: 100%;
    height: 200px;
  }
  
  &-content {
    padding: 12px;
    .title {
      display: block;
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 8px;
    }
    .content {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
      font-size: 13px;
      color: #666;
      line-height: 1.4;
    }
  }
}

.relation-list {
  margin-top: 10px;
  .relation-tag {
    display: inline-block;
    padding: 4px 8px;
    margin: 4px;
    background-color: #f0f0f0;
    border-radius: 8px;
    font-size: 12px;
    color: #666;
  }
}

.filter-btn {
  position: fixed;
  right: 20px;
  bottom: 40px;
  padding: 12px 20px;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  display: flex;
  align-items: center;
  z-index: 100;
  .icon-filter {
    margin-right: 6px;
  }
}

.filter-modal {
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  .confirm-btn {
    margin-top: 20px;
    background: #007aff;
    color: #fff;
    border-radius: 8px;
  }
}
</style>
