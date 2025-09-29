<!-- components/associate-doll-input/associate-doll-input.vue -->
<template>
  <view class="assoc-wrap" @tap="openWizard">
    <view class="label">{{ label }}</view>
    <view class="box">
      <view class="left">
        <image v-if="value.brand_logo" :src="value.brand_logo" class="avatar"></image>
        <view v-else class="avatar ph"></view>
      </view>
      <view class="right">
        <view class="row1 ellipsis-1">
          <text v-if="value.brand_name">{{ value.brand_name }}</text>
          <text v-else class="muted">请选择品牌</text>
          <text v-if="value.goods_name" class="sep"> / </text>
          <text v-if="value.goods_name">{{ value.goods_name }}</text>
        </view>
        <view class="row2 muted ellipsis-1">
          <text v-if="value.goods_type || value.goods_price">
            {{ value.goods_type || '' }} {{ value.goods_price ? ('· ' + value.goods_price) : '' }}
          </text>
          <text v-else>点此搜索并关联</text>
        </view>
      </view>
      <view class="arrow">›</view>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Object, default: () => ({}) },
  label: { type: String, default: '关联娃头' }
})
const emit = defineEmits(['update:modelValue', 'change'])

const value = computed({
  get: () => props.modelValue || {},
  set: (v) => { emit('update:modelValue', v); emit('change', v) }
})

function openWizard () {
  uni.navigateTo({
    url: '/subpkg/associate/brand-pick/index',
    events: {
      // 最终从品牌页透传回来的结果
      onPicked: (payload) => { value.value = payload || {} }
    }
  })
}
</script>

<style scoped lang="less">
.assoc-wrap { padding: 16rpx 24rpx; background:#fff; border-radius:16rpx; }
.label { font-size: 24rpx; color:#909399; margin-bottom: 12rpx; }
.box{
  display:flex; align-items:center; gap:16rpx; background:#f7f8fa; border-radius:12rpx; padding: 16rpx;
  .left .avatar{ width: 92rpx; height:92rpx; border-radius:50%; background:#eef1f5; }
  .left .ph{ border:2rpx dashed #dcdfe6; }
  .right{ flex:1; min-width:0; }
  .row1{ font-size: 28rpx; color:#303133; }
  .row2{ font-size: 22rpx; margin-top:6rpx; }
  .muted{ color:#909399; }
  .sep{ color:#c0c4cc; margin:0 6rpx; }
  .arrow{ color:#c0c4cc; font-size: 44rpx; padding: 0 6rpx; }
}
.ellipsis-1{ overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
</style>
