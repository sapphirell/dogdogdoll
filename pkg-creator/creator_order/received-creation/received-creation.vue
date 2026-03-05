<template>
  <view class="redirect-page"></view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app'

onLoad((options) => {
  const query = ['tab=creations']
  if (options && options.plan_id) {
    query.push(`plan_id=${options.plan_id}`)
  }
  uni.redirectTo({
    url: `/pkg-creator/creator_order/received-list/received-list?${query.join('&')}`,
  })
})
</script>

<style lang="scss" scoped>
.redirect-page {
  min-height: 100vh;
  background: #f7f9fc;
}
</style>
