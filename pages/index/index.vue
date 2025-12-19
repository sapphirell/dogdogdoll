<template>
  <meta name="theme-color" content="#def9ff"></meta>
  <view-logs />
  <view>
    <privacy-permission-modal></privacy-permission-modal>
    <loading-toast :show="showLoadding"></loading-toast>
    <view-logs></view-logs>
   <version-check
      ref="versionCheckRef"
      :show-up-to-date-toast="true"
    />

    <view class="body">
      <!-- 整个可滚区域交给 z-paging 管 -->
      <z-paging
        ref="paging"
        v-model="pagingList"
        :refresher-enabled="true"
        :auto="false"
        :loading-more-enabled="true"
        :to-bottom-loading-more-enabled="true"
        :lower-threshold="200"
        :inside-more="true"
        @query="queryPaging"
        @scroll="handlePagingScroll"
      >
        <!-- 头部（跟着列表滚动，因为不在 slot="top" 里） -->
        <view class="index_header">
          <view class="header-placeholders"></view>

          <view>
            <view style="display: inline-block;margin-left: 20rpx;">
              <image
                src="/static/new-icon/title.gif"
                mode="widthFix"
                style="width: 300rpx;max-height: 150rpx;  position: relative;left: -20rpx;margin-bottom: 10rpx;"
              />
              <server-selector @server-change="handleServerChange"></server-selector>
            </view>

            <!-- 假搜索框 -->
            <view
              class="fake-search"
              @tap="goSearch"
              hover-class="fake-search--hover"
            >
              <uni-icons type="search" size="18" color="#9aa0a6" />
              <text class="fake-search__placeholder">搜索娃物 / 店铺 / 妆师 / 毛娘</text>
            </view>
          </view>

          <!-- 四个 Tab 按钮 -->
          <view
            style="margin: 20rpx 0rpx 0rpx 0rpx; padding: 5px 10px 0px 10px;border-radius: 20px 20px 0 0;"
          >
            <view class="index_page_article">
              <view
                class="swich_box"
                :class="{ active: activeTab === 'news' }"
                @click="switchTab('news')"
              >
                <image src="/static/new-icon/telphone.gif" mode="aspectFill"></image>
                <text class="font-alimamashuhei">新情报！</text>
              </view>
              <view
                class="swich_box"
                :class="{ active: activeTab === 'brands' }"
                @click="switchTab('brands')"
              >
                <image src="/static/new-icon/read.gif" mode="aspectFill"></image>
                <text class="font-alimamashuhei">娃物图鉴</text>
              </view>
              <view
                class="swich_box"
                :class="{ active: activeTab === 'hot' }"
                @click="switchTab('hot')"
              >
                <image
                  src="/static/new-icon/collocation.gif"
                  mode="aspectFill"
                  style="width: 90rpx;height: 90rpx;position: relative;bottom: 0rpx;"
                />
                <text
                  class="font-alimamashuhei"
                  style="position: relative;bottom: 5rpx;"
                >妆师毛娘</text>
              </view>
              <view
                class="swich_box"
                :class="{ active: activeTab === 'second' }"
                @click="switchTab('second')"
              >
                <image src="/static/new-icon/write.gif" mode="aspectFill"></image>
                <text class="font-alimamashuhei">匿名版</text>
              </view>
            </view>
          </view>
        </view>
		

        <!-- 白色圆角容器 + 列表（列表“物理上”就在 body_container 里） -->
        <view class="body_container">
          <view style="height: 40rpx;"></view>

          <!-- 列表主体：每次切 tab 都会做一次淡入动画 -->
          <view class="body_list fade-list">
            <!-- tab = 新情报 -->
            <view
              v-if="activeTab === 'news'"
              class="news-box"
            >
              <!-- 轮播图（可以按需开启） -->
              <view
                style="position: relative;height: 250rpx;margin-bottom: 20rpx; display: none;"
              >
                <swiper
                  :interval="3000"
                  :duration="200"
                  class="banner_swiper"
                  indicator-active-color="#4cbbd0"
                  indicator-color="rgba(255,255,255,0.5)"
                >
                  <swiper-item
                    v-for="item in bannerList"
                    :key="item.id"
                    class="banner_swiper_item"
                  >
                    <view class="swiper-item">
                      <image
                        :src="item.banner"
                        mode="aspectFill"
                        style="width: 100%;height: 250rpx;"
                        @click="handleBannerClick(item)"
                      />
                    </view>
                  </swiper-item>

                  <swiper-item v-if="bannerList.length === 0">
                    <view class="empty-banner">
                      <image
                        src="/static/default-banner.jpg"
                        mode="aspectFill"
                        style="width: 100%;height: 250rpx;"
                      />
                    </view>
                  </swiper-item>
                </swiper>
              </view>

              <view
                v-for="item in newsList"
                :key="item.id"
                class="news-item"
                @tap="jump2saleNews(item)"
              >
                <view class="news-images">
                  <swiper
                    v-if="item.image_list && item.image_list.length > 0"
                    class="image-swiper"
                    :autoplay="item.imagesLoaded"
                    :circular="true"
                  >
                    <swiper-item
                      v-for="(img, idx) in item.image_list"
                      :key="idx"
                    >
                      <view class="image-container">
                        <image
                          :src="img"
                          mode="aspectFill"
                          class="swiper-image"
                          :class="{ loaded: item.imagesLoaded }"
                          @load="handleNewsImageLoad(item)"
                          @error="handleNewsImageError(item, idx)"
                        />
                        <view
                          v-if="!item.imagesLoaded"
                          class="loading-overlay"
                        >
                          <uni-icons
                            type="loop"
                            size="28"
                            color="rgb(185 185 185)"
                            class="loading-icon"
                          ></uni-icons>
                        </view>
                      </view>
                    </swiper-item>
                  </swiper>
                </view>

                <view class="news-content">
                  <text class="news-title">{{ item.title }}</text>
                  <text class="news-desc">{{ item.content }}</text>
                  <view class="news-footer">
                    <text class="brand-tag">{{ item.brand_name }}</text>
                    <text class="news-time">{{ formatTime(item.created_at) }}</text>
                  </view>
                </view>
              </view>
            </view>

            <!-- tab = 娃物图鉴（品牌列表） -->
            <view
              v-else-if="activeTab === 'brands'"
              class="brand_box"
            >
              <view class="filter-tabs">
                <view
                  v-for="(tab, index) in tabs"
                  :key="index"
                  class="tab-item"
                  :class="{ active: activeSearchType === tab.value }"
                  @click="handleTabClick(tab.value)"
                >
                  {{ tab.label }}
                </view>
              </view>

              <view class="brand_type_description" style="display: block;">
                <text v-if="activeSearchType === 1">
                  中国公司制作的BJD在打磨、分模线等工艺的处理上比较优秀，价格也比外社低很多。
                </text>
                <text v-else-if="activeSearchType === 2">
                  个人作者在贩售娃物前基本都是圈内玩家，在设计方面花的心思很多。
                </text>
                <text v-else-if="activeSearchType === 3">
                  国外娃社起步较早，风格设计也比较多样化。
                </text>
                <text v-else>全部品牌</text>
              </view>

              <view
                v-for="(item, index) in brandsList"
                :key="item.id || index"
              >
                <index-brand :brand="item"></index-brand>
              </view>
            </view>

            <!-- tab = 妆师毛娘：与 z-paging 联动 -->
            <view
              v-else-if="activeTab === 'hot'"
              class="hot-box"
            >
              <index-artist
                :list="hotList"
                :loading="hotLoading"
                @filter-change="handleArtistFilterChange"
              />
            </view>

            <!-- tab = 匿名树洞 -->
            <view
              v-else-if="activeTab === 'second'"
              class="treehole-box"
            >
              <!-- 发布按钮 -->
              <view class="publish-btn" @click="handlePublish">
                <uni-icons type="plusempty" size="30" color="#fff"></uni-icons>
              </view>

              <view
                v-for="item in treeholeList"
                :key="item.id"
                class="treehole-item"
                @tap="jump2treeholeDetail(item)"
              >
                <view
                  class="user-info"
                  @tap.stop="jump2userWhenNotAnonymous(item)"
                >
                  <image
                    v-if="item.avatar !== ''"
                    :src="item.avatar"
                    class="avatar"
                    mode="aspectFill"
                  />
                  <image
                    v-else
                    src="/static/noname.png"
                    class="avatar"
                    mode="scaleToFill"
                  />
                  <text class="username">
                    {{ item.is_anonymous ? '匿名用户' : item.author_name }}
                  </text>
                  <text class="time">{{ formatTime(item.created_at) }}</text>
                  <text class="cid"></text>
                </view>

                <text class="content">{{ item.content }}</text>

                <view
                  v-if="item.images && item.images.length > 0"
                  class="image-grid"
                >
                  <swiper
                    class="image-swiper"
                    :autoplay="item.imagesLoaded"
                    :circular="true"
                    :indicator-dots="item.images.length > 1"
                    :duration="300"
                  >
                    <swiper-item
                      v-for="(img, idx) in item.images"
                      :key="idx"
                    >
                      <view class="image-container">
                        <image
                          :src="img"
                          mode="aspectFill"
                          class="swiper-image"
                          :class="{ loaded: item.imagesLoaded }"
                          @tap.stop="previewImage(item.images, idx)"
                          @load="handleImageLoad(item)"
                          @error="handleImageError(item, idx)"
                        />
                        <view
                          v-if="!item.imagesLoaded"
                          class="loading-overlay"
                        >
                          <uni-icons
                            type="spinner-cycle"
                            size="28"
                            color="#4cbbd0"
                            class="loading-icon"
                          ></uni-icons>
                        </view>
                      </view>
                    </swiper-item>
                  </swiper>
                </view>

                <view class="action-bar">
                  <view class="action-item" @click="handleLike(item)">
                    <uni-icons
                      :type="item.has_liked ? 'hand-up-filled' : 'hand-up'"
                      size="18"
                      :color="item.has_liked ? '#ff4d4f' : '#666'"
                    ></uni-icons>
                    <text class="count">{{ item.like_count || 0 }}</text>
                  </view>
                  <view class="action-item">
                    <uni-icons type="chat" size="18" color="#666"></uni-icons>
                    <text class="count">{{ item.comment_count || 0 }}</text>
                  </view>
                  <view class="action-item" @click.stop="copyUrl(item)">
                    <uni-icons type="redo" size="18" color="#666"></uni-icons>
                    <text class="count">分享</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </z-paging>

      <!-- 回到顶部按钮：向下滚动超过一屏高度时显示 -->
      <view
        v-if="showBackTop"
        class="back-top-btn"
        @tap="handleBackTop"
      >
        <uni-icons type="arrow-up" size="24" color="#222"></uni-icons>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onLoad, onReady } from '@dcloudio/uni-app'
import { ref, computed } from 'vue'
import {
  websiteUrl,
  getUserInfo,
  global,
} from '../../common/config.js'

// 品牌卡片组件 & 妆师毛娘组件
import indexBrand from '@/components/index-brand/index-brand.vue'
import indexArtist from '@/components/index-artist/index-artist.vue'

const systemInfo = uni.getSystemInfoSync()
const windowHeight = systemInfo.windowHeight || 0

// 顶部占位高度（适配状态栏）
const navBarHeight = computed(() => {
  // #ifdef MP-WEIXIN
  const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
  const statusBarHeight = systemInfo.statusBarHeight || 32
  return menuButtonInfo.bottom + menuButtonInfo.top - 2 * statusBarHeight
  // #endif
  return 0
})

const headerHeight = computed(() => {
  // #ifdef MP-WEIXIN
  return navBarHeight.value + 'px'
  // #endif
  const statusBarHeight = systemInfo.statusBarHeight || 0
  return `${statusBarHeight}px`
})

const showLoadding = ref(false)

// 选中 tab
const activeTab = ref('news')

// 回到顶部按钮显示与否
const showBackTop = ref(false)

// z-paging 实例
const paging = ref(null)

// 各 tab 的数据
const newsList = ref([])
const brandsList = ref([])
const hotList = ref([])
const treeholeList = ref([])

// 妆师毛娘 loading
const hotLoading = ref(false)

// 妆师毛娘筛选条件
const artistFilter = ref({
  roleType: 'artist',
  status: 0,
  minPrice: '',
  maxPrice: '',
  accept2D: false,
  accept3D: false,
})

// banner
const bannerList = ref([])

// 品牌筛选 tab
const tabs = ref([
  { label: '中国娃社', value: 1 },
  { label: '个人作者', value: 2 },
  { label: '外国娃社', value: 3 },
])
const activeSearchType = ref(1)

// z-paging 绑定的 v-model，随 activeTab 切
const pagingList = computed({
  get() {
    switch (activeTab.value) {
      case 'news':
        return newsList.value
      case 'brands':
        return brandsList.value
      case 'hot':
        return hotList.value
      case 'second':
        return treeholeList.value
      default:
        return newsList.value
    }
  },
  set(val) {
    switch (activeTab.value) {
      case 'news':
        newsList.value = val
        break
      case 'brands':
        brandsList.value = val
        break
      case 'hot':
        hotList.value = val
        break
      case 'second':
        treeholeList.value = val
        break
    }
  },
})

// 切换 tab：切过去的时候重新 reload 当前 tab 数据
const switchTab = (tab) => {
  if (activeTab.value === tab) return
  activeTab.value = tab
  // 切 tab 时顺便隐藏回到顶部按钮
  showBackTop.value = false
  console.log('[switchTab]', tab)
  paging.value && paging.value.reload()
}

// z-paging 统一查询回调
const queryPaging = (pageNo, pageSize) => {
  console.log('[queryPaging]', 'tab=', activeTab.value, 'pageNo=', pageNo, 'pageSize=', pageSize)
  if (activeTab.value === 'news') {
    fetchNews(pageNo, pageSize)
  } else if (activeTab.value === 'brands') {
    fetchBrands(pageNo, pageSize)
  } else if (activeTab.value === 'second') {
    fetchTreehole(pageNo, pageSize)
  } else if (activeTab.value === 'hot') {
    fetchArtists(pageNo, pageSize)
  }
}

// 处理 z-paging 的滚动事件：超过一屏高度显示回到顶部按钮
const handlePagingScroll = (event) => {
  const detail = event?.detail || {}
  const scrollTop = typeof detail.scrollTop === 'number' ? detail.scrollTop : 0
  showBackTop.value = scrollTop > windowHeight
}

// 点击回到顶部
const handleBackTop = () => {
  if (paging.value && typeof paging.value.scrollToTop === 'function') {
    paging.value.scrollToTop(true)
  } else {
    uni.pageScrollTo({
      scrollTop: 0,
      duration: 300,
    })
  }
  showBackTop.value = false
}

// ==================== 公共方法 ====================
const formatTime = (timestamp) => {
  const date = new Date((timestamp || 0) * 1000)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const goSearch = () => {
  uni.navigateTo({
    url: '/pkg-common/search/search?tabs=1,2,3,4&mode=jump',
  })
}

// banner
const getArticles = () => {
  uni.request({
    url: websiteUrl.value + '/articles',
    data: {
      page: 1,
      page_size: 10,
      status: 1,
    },
    success: (res) => {
      if (res.data.status === 'success') {
        bannerList.value = res.data.data.list || []
      } else {
        bannerList.value = []
      }
    },
    fail: () => {
      bannerList.value = []
    },
  })
}

const handleBannerClick = (item) => {
  uni.navigateTo({
    url: `/pages/article_detail/article_detail?id=${item.id}`,
  })
}

const jump2saleNews = (item) => {
  uni.navigateTo({
    url:
      '/pkg-common/sale_news/sale_news?id=' +
      item.id +
      '&brand_id=' +
      item.brand_id,
  })
}

// ==================== 新情报列表 ====================
const fetchNews = (pageNo, pageSize) => {
  showLoadding.value = true
  uni.request({
    url: websiteUrl.value + '/sale-news',
    data: {
      page: pageNo,
      pageSize,
    },
    success: (res) => {
      const body = res.data || {}
      const data = body.data || {}
      const listRaw = data.news_list || []
      const list = listRaw.map((item) => {
        const imgs = item.image_list || []
        return {
          ...item,
          image_list: imgs,
          imagesLoaded: imgs.length === 0, // 没有图片直接认为加载完成
          loadCount: 0,
        }
      })

      const total = data.total
      console.log('total:', total)
      paging.value && paging.value.complete(list, total)

      // 兜底：3 秒后还没加载完的图片，强制结束 loading
      setTimeout(() => {
        newsList.value.forEach((it) => {
          if (!it.imagesLoaded) it.imagesLoaded = true
        })
      }, 3000)
    },
    fail: (err) => {
      console.error(err)
      uni.showToast({
        title: '加载失败',
        icon: 'none',
      })
      paging.value && paging.value.complete(false)
    },
    complete: () => {
      showLoadding.value = false
    },
  })
}

const handleNewsImageLoad = (item) => {
  if (!item.image_list || item.image_list.length === 0) {
    item.imagesLoaded = true
    return
  }
  item.loadCount = (item.loadCount || 0) + 1
  if (item.loadCount >= item.image_list.length) {
    item.imagesLoaded = true
  }
}

const handleNewsImageError = (item, idx) => {
  console.error(
    '新闻图片加载失败:',
    item.image_list && item.image_list[idx]
  )
  item.loadCount = (item.loadCount || 0) + 1
  if (!item.image_list || item.loadCount >= item.image_list.length) {
    item.imagesLoaded = true
  }
}

// ==================== 品牌列表（cursor + z-paging） ====================
const cursor = ref('')

const handleTabClick = (value) => {
  if (activeSearchType.value === value) {
    activeSearchType.value = null // 再点一次取消筛选
  } else {
    activeSearchType.value = value
  }
  cursor.value = ''
  // 品牌 tab 下，重新 reload
  if (activeTab.value === 'brands') {
    paging.value && paging.value.reload()
  }
}

const fetchBrands = (pageNo, pageSize) => {
  showLoadding.value = true
  const params = { pageSize }
  if (cursor.value) {
    params.cursor = cursor.value
  } else if (activeSearchType.value) {
    params.searchType = activeSearchType.value
  }

  uni.request({
    url: websiteUrl.value + '/brands-info-list',
    data: params,
    success: (res) => {
      if (res.data.status !== 'success') {
        uni.showToast({
          title: '加载失败',
          icon: 'none',
        })
        paging.value && paging.value.complete(false)
        return
      }
      const respData = res.data.data || {}
      const newData = respData.data || []
      const hasMore = !!respData.has_more
      cursor.value = respData.next_cursor || ''

      const list = newData
      // cursor 模式没有 total，这里造一个「还有下一页」的 total 传给 z-paging
      const total = pageNo * pageSize + (hasMore ? 1 : 0)
      paging.value && paging.value.complete(list, total)
    },
    fail: (err) => {
      console.error(err)
      uni.showToast({
        title: '网络错误',
        icon: 'none',
      })
      paging.value && paging.value.complete(false)
    },
    complete: () => {
      showLoadding.value = false
    },
  })
}

// ==================== 妆师毛娘列表（通过 z-paging 联动） ====================
const handleArtistFilterChange = (payload) => {
  // 记录筛选条件
  artistFilter.value = payload
  console.log('[handleArtistFilterChange]', payload)
  // 如果当前就在 hot tab，则重新加载
  if (activeTab.value === 'hot') {
    paging.value && paging.value.reload()
  }
}

const fetchArtists = (pageNo, pageSize) => {
  hotLoading.value = true

  const filter = artistFilter.value || {}
  const params = {
    page: pageNo,
    size: pageSize,
    artist_type: filter.roleType === 'hairstylist' ? 2 : 1, // 1=妆师, 2=毛娘
  }

  if (filter.status && filter.status !== 0) {
    params.status = filter.status
  }
  if (filter.minPrice) params.min_price = filter.minPrice
  if (filter.maxPrice) params.max_price = filter.maxPrice

  if (filter.roleType === 'artist') {
    if (filter.accept2D) params.accept_2d = 1
    if (filter.accept3D) params.accept_3d = 1
  }

  uni.request({
    url: `${websiteUrl.value}/brand-artist-list`,
    method: 'GET',
    data: params,
    success: (res) => {
      const data = res.data || {}
      if (data.status === 'success') {
        const list = data.data?.list || []
        const total = data.data?.total || 0
        // 把当前页数据交给 z-paging，它会自动合并到 hotList（v-model）
        paging.value && paging.value.complete(list, total)
      } else {
        uni.showToast({ title: data.msg || '获取数据失败', icon: 'none' })
        paging.value && paging.value.complete(false)
      }
    },
    fail: (e) => {
      console.error('获取妆师毛娘列表失败', e)
      uni.showToast({ title: '网络请求失败', icon: 'none' })
      paging.value && paging.value.complete(false)
    },
    complete: () => {
      hotLoading.value = false
    },
  })
}

// ==================== 树洞 ====================
const fetchTreehole = (pageNo, pageSize) => {
  showLoadding.value = true
  uni.request({
    url: websiteUrl.value + '/treehole-submissions',
    data: {
      page: pageNo,
      pageSize,
    },
    success: (res) => {
      const body = res.data || {}
      const raw = body.data?.submission_list || []
      const list = raw.map((item) => ({
        ...item,
        images: item.images || [],
        imagesLoaded: (item.images || []).length === 0,
        loadCount: 0,
      }))

      // 这里接口没给 total，就按「有无下一页」策略来：如果这一页 < pageSize，则认为没有更多
      const total = pageNo * pageSize + (list.length < pageSize ? 0 : 1)
      paging.value && paging.value.complete(list, total)

      setTimeout(() => {
        treeholeList.value.forEach((it) => {
          if (!it.imagesLoaded) it.imagesLoaded = true
        })
      }, 3000)
    },
    fail: (err) => {
      console.error(err)
      uni.showToast({
        title: '加载失败',
        icon: 'none',
      })
      paging.value && paging.value.complete(false)
    },
    complete: () => {
      showLoadding.value = false
    },
  })
}

const jump2treeholeDetail = (item) => {
  uni.navigateTo({
    url: '/pages/treehole_detail/treehole_detail?id=' + item.id,
  })
}

const handleImageLoad = (item) => {
  if (!item.images || item.images.length === 0) {
    item.imagesLoaded = true
    return
  }
  item.loadCount = (item.loadCount || 0) + 1
  if (item.loadCount >= item.images.length) {
    item.imagesLoaded = true
  }
}

const handleImageError = (item, idx) => {
  console.error('树洞图片加载失败', item.images && item.images[idx])
  item.loadCount = (item.loadCount || 0) + 1
  if (!item.images || item.loadCount >= item.images.length) {
    item.imagesLoaded = true
  }
}

const previewImage = (images, index) => {
  uni.previewImage({
    current: index,
    urls: images,
  })
}

const handlePublish = () => {
  if (!global.isLogin) {
    uni.showModal({
      title: '提示',
      content: '需要登录后才能发布树洞',
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({
            url: '/pages/login/login',
          })
        }
      },
    })
    return
  }
  uni.navigateTo({
    url: '/pages/treehole_publish/treehole_publish',
  })
}

const handleLike = (item) => {
  if (!global.isLogin) {
    uni.showToast({
      title: '请先登录',
      icon: 'none',
    })
    return
  }
  const token = uni.getStorageSync('token')
  if (!token) {
    uni.showToast({
      title: '请先登录',
      icon: 'none',
    })
    return
  }
  uni.request({
    url:
      websiteUrl.value +
      (item.has_liked ? '/with-state/unlike' : '/with-state/add-like'),
    method: 'POST',
    header: {
      Authorization: token,
    },
    data: {
      id: item.id,
      type: 5,
    },
    success: (res) => {
      if (res.data.status === 'success') {
        item.has_liked = !item.has_liked
        item.like_count += item.has_liked ? 1 : -1
      }
    },
  })
}

const copyUrl = (item) => {
  const url =
    'http://m.dogdogdoll.com/#/pages/treehole_detail/treehole_detail?id=' +
    item.id
  uni.setClipboardData({
    data: url,
    success() {
      uni.showToast({
        title: '复制链接成功',
        icon: 'none',
      })
    },
  })
}

const jump2userWhenNotAnonymous = (item) => {
  if (item.is_anonymous === 1) return
  uni.navigateTo({
    url: '/pages/user_page/user_page?uid=' + item.uid,
  })
}

// 服务器切换回调：刷新当前 tab
const handleServerChange = () => {
  console.log('[handleServerChange] reload current tab')
  paging.value && paging.value.reload()
}

// 初始化
onLoad(() => {
  getUserInfo()
  getArticles()
})

// 页面 ready 后再触发 z-paging 首次加载，避免 auto 时机问题
onReady(() => {
  console.log('[onReady] paging reload')
  paging.value && paging.value.reload()
})
</script>

<style lang="scss" scoped>
.body {
  position: relative;
  min-height: 100vh;
  /* 底层淡蓝色背景，用来当“边缘” */
  background: #d6e4f2;
}

/* 顶部占位 */
.header-placeholders {
  height: v-bind(headerHeight);
}

.index_header {
  padding: 0.46875rem;
  padding-bottom: 0.03125rem;
  color: #4cbbd0;
  display: block;
  /* 和底部容器同色系的渐变 */
  background: linear-gradient(180deg, #def9ff, #d6e4f2);

  .index_page_article {
    height: 180rpx;
    width: 100%;
    display: flex;
    justify-content: space-around;
    padding: 10rpx 0;
    margin-bottom: 20rpx;

    .swich_box {
      width: 150rpx;
      height: 160rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      transition: all 0.3s ease;
      border-radius: 30rpx;
      padding: 15rpx 0;

      image {
        width: 80rpx;
        height: 80rpx;
        display: block;
        margin-bottom: 15rpx;
        transition: all 0.3s ease;
      }

      text {
        font-size: 23rpx;
        font-weight: bold;
        transition: all 0.3s ease;
        color: #fff;
        text-align: center;
        display: block;
        width: 100%;
      }

      &.active {
        position: relative;
        bottom: 20rpx;
        background: #fff;
        border-radius: 40rpx;
        box-shadow: 0 0 10px #0000001a;

        text {
          color: #7ab6c6;
        }
      }
    }
  }
}

/**
 * 白色内容容器：
 * - 上边圆角
 * - 左右收窄一点，让底层淡蓝色露出来
 * - 轻微阴影，像一块卡片
 */
.body_container {
  border-radius: 40rpx 40rpx 0 0;
  overflow: hidden;
  background: #fff;
  /* 两侧各露出 20rpx 的淡蓝色边缘 */
  width: calc(100vw - 20rpx);
  margin: 0 auto;
}

/* 列表整体淡入动画 */
.body_list {
  position: relative;
  min-height: 110vh;
}

.fade-list {
  animation: listFadeIn 0.25s ease-out;
}

@keyframes listFadeIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 品牌筛选 tab */
.filter-tabs {
  display: flex;
  justify-content: space-around;
  padding: 20rpx 0;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 1;
}

.tab-item {
  padding: 10rpx 20rpx;
  border-radius: 30rpx;
  color: #aa9ab9;
  font-size: 26rpx;
  transition: all 0.3s;
  margin: 0 20rpx;
  height: 26rpx;
  line-height: 26rpx;

  &.active {
    background: linear-gradient(135deg, #97e7f7, #d5acd6);
    color: #fff;
  }
}

/* 这里改成 100%，不再用 100vw，避免撑出白容器宽度 */
.brand_box {
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 10rpx;
  width: 100%;
  padding: 0 15rpx;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
  box-shadow: 0 0px 10px #ffffff30;
}

/* 图透列表样式 */
.news-box {
  padding: 20rpx;
  padding-top: 0rpx;

  .news-item {
    margin-bottom: 30rpx;
    border-radius: 16rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
    display: flex;
    background: #fff;

    .news-images {
      display: inline-block;
      min-height: 250rpx;
      padding: 10rpx;
    }

    .image-swiper {
      width: 200rpx;

      .swiper-image {
        width: 100%;
        height: 100%;
        border-radius: 15rpx;
      }
    }

    .news-content {
      padding: 10rpx 20rpx 20rpx 20rpx;
      width: 420rpx;
      display: inline-block;
      position: relative;

      .news-title {
        font-size: 28rpx;
        color: #333;
        font-weight: bold;
        display: block;
        margin-bottom: 10rpx;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .news-desc {
        font-size: 23rpx;
        color: #666;
        line-height: 1.6;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
      }

      .news-footer {
        margin-top: 20rpx;
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: absolute;
        bottom: 20rpx;

        .brand-tag {
          background: linear-gradient(135deg, #97e7f7, #d5acd6);
          color: #fff;
          padding: 4rpx 12rpx;
          border-radius: 6rpx;
          font-size: 20rpx;
          margin-right: 15rpx;
        }

        .news-time {
          color: #999;
          font-size: 20rpx;
        }
      }
    }
  }
}

/* 热门 tab 外层容器样式（内部是 index-artist） */
.hot-box {
  padding: 20rpx;
}

/* 树洞 */
.treehole-box {
  padding: 20rpx;
  padding-top: 50rpx;
}

.treehole-item {
  background: #fff;
  border-radius: 16rpx;
  margin: 0 20rpx 30rpx;
  padding: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;

  .avatar {
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
    margin-right: 15rpx;
  }

  .cid {
    font-size: 24rpx;
    color: #666;
    margin-left: 20rpx;
  }

  .username {
    font-size: 24rpx;
    color: #333;
    margin-right: 60rpx;
    width: 250rpx;
    overflow: hidden;
    margin-left: 10rpx;
    margin-right: 40rpx;
    font-weight: 800;
    display: inline-block;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .time {
    font-size: 24rpx;
    color: #999;
  }
}

.content {
  font-size: 23rpx;
  color: #888;
  line-height: 1.6;
  margin-bottom: 30rpx;
  display: inline-block;
}

.image-grid {
  margin-bottom: 20rpx;

  .image-swiper {
    height: 400rpx;
    border-radius: 12rpx;
    overflow: hidden;

    .swiper-image {
      width: 100%;
      height: 100%;
    }
  }
}

.action-bar {
  display: flex;
  align-items: center;
  padding-top: 20rpx;
  border-top: 1rpx solid #eee;

  .action-item {
    display: flex;
    align-items: center;
    margin-right: 40rpx;

    .count {
      font-size: 24rpx;
      color: #666;
      margin-left: 8rpx;
    }
  }
}

.publish-btn {
  position: fixed;
  right: 40rpx;
  bottom: 280rpx;
  width: 100rpx;
  height: 100rpx;
  background: #4cbbd0;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 8rpx 20rpx rgba(76, 187, 208, 0.3);
  z-index: 999;
}

/* 回到顶部按钮 */
.back-top-btn {
  position: fixed;
  right: 40rpx;
  bottom: 260rpx;
  width: 90rpx;
  height: 90rpx;
  border-radius: 50%;
  background: #4cbbd0;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 8rpx 20rpx rgba(76, 187, 208, 0.3);
  z-index: 998;
}

/* 图片 loading 公共样式 */
.image-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.loading-icon {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.swiper-image {
  opacity: 0;
  transition: opacity 0.5s ease;

  &.loaded {
    opacity: 1;
  }
}

/* 假搜索框 */
.fake-search {
  width: 670rpx;
  height: 72rpx;
  margin: 12rpx 0 8rpx;
  padding: 0 24rpx;
  background: #f8f8f8;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  gap: 14rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.03);
}
.fake-search__placeholder {
  font-size: 26rpx;
  color: #9aa0a6;
}
.fake-search--hover {
  opacity: 0.9;
}

::-webkit-scrollbar {
  width: 0 !important;
  height: 0 !important;
  background-color: transparent !important;
  display: none !important;
}

/* 品牌描述 */
.brand_type_description {
  background: rgba(76, 187, 208, 0.05);
  border-radius: 12rpx;
  padding: 24rpx;
  margin: 20rpx 0;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4rpx;
    height: 70%;
    background: #4cbbd0;
    border-radius: 4rpx;
  }

  text {
    font-size: 24rpx;
    color: #7f8c8d;
    line-height: 1.6;
    display: block;
    padding-left: 16rpx;
    position: relative;
    text-align: justify;
  }
}
</style>
