<template>
  <view class="nav-placeholder" :style="{ height: headerPadPx }" />
</template>

<script setup>
import { ref, computed, watch, nextTick, getCurrentInstance, onMounted } from 'vue'
import { websiteUrl, getStatusBarHeight, getHeaderPlaceholderHeight, toPx } from '@/common/config.js'


/* 顶部占位高度 */
const headerPadPx = computed(() => toPx(getHeaderPlaceholderHeight()))



</script>

<style>

</style>