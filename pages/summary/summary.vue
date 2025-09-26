<template>
  <common-page head_color="rgb(185 195 253)">
     <summary-tab v-if="active==='summary'"></summary-tab>
  </common-page>
</template>


<script setup>
import { ref } from 'vue'


const active = ref('summary')
</script>

<style lang="less" scoped>
.main-tab{
  display:flex;
  padding: 18rpx 30rpx 0;
  .tab{
    flex:1; text-align:center; padding: 24rpx 0; font-size: 32rpx; color:#666; position:relative;
    &.active{ color:#7dc3d3; font-weight:700; }
    .bar{ position:absolute; left:50%; transform:translateX(-50%); bottom:0; width: 92rpx; height: 8rpx; border-radius:4rpx; background:#7dc3d3;}
  }
}
.content-wrap{ min-height: 80vh; background:#f8faff; border-radius: 36rpx 36rpx 0 0; }
</style>
