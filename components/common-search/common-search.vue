<!-- common-search -->
<template>
  <view style="width:100%">
    <view
      class="search_tab"
      :class="$attrs.class"
      :style="{ background: background || '#fff' }"
    >
      <image
        class="icon_image"
        src="../../static/search.png"
        v-if="!props.hiddenIcon && props.mode == 'jump'"
      ></image>

      <!-- 索引选择器（可关） -->
      <view v-if="showIndexSelector" class="index-selector">
        <picker
          mode="selector"
          :value="selectedIndex"
          :range="indexLabels"
          @change="handleIndexChange"
        >
          <view class="selector-content">
            <text>{{ currentIndexLabel }}</text>
          </view>
        </picker>

        <!-- 小气泡：点击切换（显示2秒） -->
        <view v-if="showTip" class="selector-tip">点击切换</view>
      </view>

      <input
        class="common_search_input"
        placeholder="可以模糊搜索 o( ❛ᴗ❛ )o …"
        v-model="searchTerm"
        @input="onSearchInput"
        :ignoreCompositionEvent="false"
      />
      <view class="search-info-tap" v-if="results.length > 0">
        <text v-if="results.length > 0 && searchTerm.length < 5 && !props.hideHintText"
          >拼音、缩写、别名都可以搜</text
        >
        <image class="icon_image" src="../../static/cancel.png" @tap="cancel"></image>
      </view>
    </view>

    <view style="position: relative;">
      <!-- 显示搜索结果 -->
      <scroll-view
        v-if="results.length > 0"
        class="search_results"
        style="height: 600rpx;"
        :style="{width: width}"
        scroll-y
      >
        <view
          class="close-associate result_item"
          @tap="closeAssociate"
          style="padding-top: 0;text-align: center;"
        >
          <text>关闭联想</text>
        </view>
        <view
          v-for="item in results"
          :key="item.id"
          class="result_item"
          @tap="onTap(item.id, item.name)"
        >
          {{ item.name }}
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { websiteUrl } from "../../common/config.js";

// ====== props（保持不变）======
const props = defineProps({
  mode: { type: String, default: 'jump', validator: v => ['jump', 'fill'].includes(v) },
  width: { type: String, default: '100%' },
  background: { type: String, default: '' },
  fontSize: { type: String, default: '' },
  hiddenIcon: { type: Boolean, default: false },
  showIndexSelector: { type: Boolean, default: false },
  indexOptions: {
    type: Array,
    default: () => [
      { label: "店铺", value: "" },
      { label: "妆师", value: "bjd_artist" },
      { label: "毛娘", value: "hairstylist" }
    ]
  },
  defaultIndex: { type: String, default: "" },
  hideHintText: { type: Boolean, default: false }
});
defineOptions({ inheritAttrs: false });

// ====== emits（保持不变）======
const emit = defineEmits(['select', 'close-associate', 'index-change']);

// ====== state ======
const searchTerm = ref('');
const results = ref([]);
const currentIndex = ref(props.defaultIndex || (props.indexOptions[0]?.value || ""));

// 小气泡 2 秒提示
const showTip = ref(false);
let tipTimer = null;

// ✅ 关键修复点：一次性抑制“选中后立刻再次搜索”
const suppressSearchOnce = ref(false);

// ✅ 输入请求防抖，避免抖动
let inputDebounceTimer = null;

// ====== tip 控制 ======
const triggerTip = () => {
  if (!props.showIndexSelector) return;
  clearTimeout(tipTimer);
  showTip.value = true;
  tipTimer = setTimeout(() => (showTip.value = false), 2000);
};
watch(() => props.showIndexSelector, (val) => { if (val) triggerTip(); });
onMounted(() => { if (props.showIndexSelector) triggerTip(); });
onUnmounted(() => {
  clearTimeout(tipTimer);
  clearTimeout(inputDebounceTimer);
});

// ====== 选择器派生 ======
const currentIndexLabel = computed(() => {
  const option = props.indexOptions.find(opt => opt.value === currentIndex.value);
  return option ? option.label : "选择类型";
});
const indexLabels = computed(() => props.indexOptions.map(opt => opt.label));
const selectedIndex = computed(() =>
  props.indexOptions.findIndex(opt => opt.value === currentIndex.value)
);

// ====== 关闭联想（保留原语义，同时抑制一次搜索）======
const closeAssociate = () => {
  results.value = [];
  suppressSearchOnce.value = true; // 防止立即又搜一遍
  emit('close-associate', searchTerm.value);
  emit('select', 0, searchTerm.value); // 清零ID
};

// ====== 切换索引 ======
const handleIndexChange = (e) => {
  const index = e.detail.value;
  currentIndex.value = props.indexOptions[index]?.value || "";
  emit('index-change', currentIndex.value);
  showTip.value = false;

  // 有词时重搜（若被一次性抑制则跳过）
  if (searchTerm.value.trim() !== '' && !suppressSearchOnce.value) {
    onSearchInput();
  } else {
    suppressSearchOnce.value = false; // 用过就复位
  }
};

// ====== 输入搜索（带防抖 + 抑制一次）======
const onSearchInput = async () => {
  // 选中后本次输入直接跳过，避免“关了又开”
  if (suppressSearchOnce.value) {
    suppressSearchOnce.value = false;
    return;
  }

  const kw = searchTerm.value.trim();
  if (kw === '') {
    results.value = [];
    emit('select', 0, ''); // 清空时也同步通知父级清零
    return;
  }

  // 输入时先把ID清空
  emit('select', 0, kw);

  clearTimeout(inputDebounceTimer);
  inputDebounceTimer = setTimeout(async () => {
    // 构建请求URL
    let url = `${websiteUrl.value}/search-brand?search=${encodeURIComponent(kw)}`;
    if (currentIndex.value) url += `&index=${currentIndex.value}`;

    try {
      const res = await uni.request({
        url,
        method: 'GET',
        header: { 'Content-Type': 'application/json' }
      });
      if (res.data?.status == "success") {
        results.value = res.data.data || [];
      } else {
        results.value = [];
      }
    } catch (error) {
      console.error('请求错误:', error);
      results.value = [];
    }
  }, 150);
};

// ====== 点选结果 ======
const onTap = (brandId, brandName) => {
  if (props.mode === 'jump') {
    uni.navigateTo({ url: `/pages/brand/brand?brand_id=${brandId}` });
  } else if (props.mode === 'fill') {
    // 1) 设定输入框文案
    searchTerm.value = brandName;
    // 2) 立刻关闭结果
    results.value = [];
    // 3) 通知父级已选择
    emit('select', brandId, brandName);
    // 4) 抑制紧随其后的 onSearchInput（一次）
    suppressSearchOnce.value = true;
  }
};

// 清空输入
function cancel() {
  searchTerm.value = '';
  results.value = [];
  // 清空也算一次“人为关闭”，抑制 onSearchInput 的即时触发
  suppressSearchOnce.value = true;
}
</script>

<style lang="less" scoped>
.search_tab {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 10px;
  width: 100%;
  position: relative;
  height: 72rpx;
  padding: 0 20rpx;

  .icon_image {
    width: 36rpx;
    height: 36rpx;
    margin-right: 16rpx;
  }

  .common_search_input {
    flex: 1;
    height: 100%;
    padding: 0;
    font-size: 23rpx;
  }

  /* 索引选择器 */
  .index-selector {
    position: relative;
    margin-right: 15rpx;

    .selector-content {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 20rpx;
      height: 60rpx;
      border-radius: 30rpx;
      font-size: 24rpx;
      color: white;
      transition: all 0.3s ease;

      &:active { transform: translateY(2rpx); }

      text { font-weight: 500; }
    }

    .selector-tip {
      position: absolute;
      top: 66rpx; left: 0;
      background: rgba(0, 0, 0, 0.8);
      color: #fff; font-size: 22rpx;
      padding: 10rpx 16rpx; border-radius: 10rpx;
      white-space: nowrap; box-shadow: 0 6rpx 18rpx rgba(0,0,0,0.15);
      animation: tipFade .2s ease both; z-index: 2;

      &:after {
        content: "";
        position: absolute; top: -10rpx; left: 22rpx;
        border-width: 6rpx; border-style: solid;
        border-color: transparent transparent rgba(0,0,0,0.8) transparent;
      }
    }
  }
}

@keyframes tipFade {
  from { opacity: 0; transform: translateY(-6rpx); }
  to   { opacity: 1; transform: translateY(0); }
}

.search_results {
  padding: 10px;
  background-color: #f8f8f8;
  border-radius: 5px;
  position: absolute;
  z-index: 120;
  box-shadow: 0 0 15px #0000002b;
  max-height: 400rpx;
  font-size: 22rpx;
  box-sizing: border-box;

  .result_item {
    font-size: 22rpx;
    padding: 15px 0;
    cursor: pointer;
    color: #333;
    border-bottom: 1px solid #ececec;

    &:last-child { border-bottom: none; }
    &:hover { color: #007aff; }
  }
}

.search-info-tap {
  display: flex;
  align-items: center;
  position: relative;
  margin-left: 10rpx;

  text {
    color: #fff;
    background: linear-gradient(135deg, #a494b2, #fad0c4);
    font-size: 20rpx;
    padding: 3px 5px;
    border-radius: 3px;
    font-weight: 900;
    position: relative;
    bottom: 0;
    margin-right: 8rpx;
  }

  .icon_image {
    width: 36rpx;
    height: 36rpx;
    margin-left: 0;
  }
}

.close-associate {
  text { font-size: 22rpx; color: #ccc; }
  &:active { background-color: #f0f0f0; }
}
</style>
