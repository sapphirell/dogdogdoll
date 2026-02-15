<template>
  <view class="nav-deck-wrap">
    <swiper
      class="nav-deck-swiper"
      :current="current"
      :duration="duration"
      :circular="circular"
      @change="handleChange"
    >
      <swiper-item
        v-for="(card, idx) in normalizedCards"
        :key="card.key || idx"
      >
        <view class="deck-stack" @tap="handleTap(idx, card)">
          <view class="deck-shadow shadow-a"></view>
          <view class="deck-shadow shadow-b"></view>
          <view class="deck-card" :class="`skin-${card.skin || 'cyan'}`">
            <view class="deck-notch"></view>
            <text class="deck-badge font-alimamashuhei">{{ card.tag || '导航' }}</text>
            <view class="deck-title-row">
              <text class="deck-title font-alimamashuhei">{{ card.title || '未命名' }}</text>
              <view class="deck-go font-alimamashuhei">GO</view>
            </view>
            <text class="deck-desc font-alimamashuhei">{{ card.subtitle || '' }}</text>
            <view class="deck-thumbs">
              <image
                v-for="(thumb, thumbIdx) in card.images"
                :key="`${idx}-${thumbIdx}`"
                class="deck-thumb"
                :class="`thumb-${thumbIdx}`"
                :src="thumb"
                mode="aspectFill"
              />
            </view>
          </view>
        </view>
      </swiper-item>
    </swiper>

    <view v-if="showDots && normalizedCards.length > 1" class="deck-dots">
      <view
        v-for="(card, idx) in normalizedCards"
        :key="`${card.key || idx}-dot`"
        class="deck-dot"
        :class="{ active: current === idx }"
      ></view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // cards: [{ tag, title, subtitle, images: string[], key?, skin? }]
  cards: {
    type: Array,
    default: () => []
  },
  current: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number,
    default: 260
  },
  circular: {
    type: Boolean,
    default: true
  },
  showDots: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:current', 'change', 'tap'])

const fallbackThumbs = ['/static/new-icon/tab1.png', '/static/new-icon/tab2.png', '/static/new-icon/tab3.png']

const normalizedCards = computed(() => {
  return (props.cards || []).map((card = {}, idx) => {
    const images = Array.isArray(card.images) && card.images.length ? card.images : fallbackThumbs
    return {
      key: card.key || `card-${idx}`,
      tag: card.tag || '',
      title: card.title || '',
      subtitle: card.subtitle || '',
      skin: card.skin || 'cyan',
      images: images.slice(0, 3)
    }
  })
})

function handleChange (e) {
  const index = Number(e?.detail?.current || 0)
  const card = normalizedCards.value[index] || null
  emit('update:current', index)
  emit('change', { index, card })
}

function handleTap (index, card) {
  emit('tap', { index, card })
}
</script>

<style scoped>
.nav-deck-wrap {
  position: relative;
}

.nav-deck-swiper {
  height: 284rpx;
}

.deck-stack {
  position: relative;
  height: 264rpx;
  margin: 8rpx 8rpx 0;
}

.deck-shadow {
  position: absolute;
  left: 30rpx;
  right: 14rpx;
  border-radius: 30rpx;
  height: 228rpx;
  background: rgba(120, 148, 172, 0.2);
}

.shadow-a {
  bottom: 14rpx;
  transform: rotate(-4deg);
  opacity: 0.44;
}

.shadow-b {
  bottom: 10rpx;
  transform: rotate(4deg);
  opacity: 0.26;
}

.deck-card {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 18rpx;
  padding: 22rpx 22rpx 20rpx;
  border-radius: 30rpx 88rpx 30rpx 30rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.72);
  overflow: hidden;
  box-shadow: 0 14rpx 28rpx rgba(71, 98, 132, 0.16);
}

.deck-card.skin-cyan {
  background: linear-gradient(145deg, #c7f4ff, #b8e9f9 68%, #b3e5f4);
}

.deck-card.skin-pink {
  background: linear-gradient(145deg, #ffd8ef, #f6c8ea 68%, #efbde2);
}

.deck-card.skin-lime {
  background: linear-gradient(145deg, #f2ffcf, #e8f7b7 68%, #e2f0ab);
}

.deck-card.skin-violet {
  background: linear-gradient(145deg, #e4ddff, #d7ccff 68%, #cec0fb);
}

.deck-card.skin-blue {
  background: linear-gradient(145deg, #d6f0ff, #c7e6fb 68%, #bedef4);
}

.deck-card:active {
  transform: scale(0.985);
}

/* 圆角缺角 */
.deck-notch {
  display: none;
}

.deck-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 42rpx;
  padding: 0 16rpx;
  border-radius: 999rpx;
  background: rgba(35, 51, 70, 0.76);
  color: #f7feff;
  font-size: 22rpx;
  font-weight: 700;
}

.deck-title-row {
  margin-top: 10rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.deck-title {
  font-size: 40rpx;
  color: #1c2740;
  font-weight: 800;
  line-height: 1.12;
}

.deck-go {
  min-width: 96rpx;
  height: 48rpx;
  border-radius: 999rpx;
  background: #12161c;
  color: #d6ff71;
  font-size: 30rpx;
  line-height: 48rpx;
  text-align: center;
  letter-spacing: 1rpx;
  font-weight: 900;
}

.deck-desc {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #3f5871;
}

.deck-thumbs {
  position: absolute;
  right: 18rpx;
  bottom: 14rpx;
  width: 194rpx;
  height: 142rpx;
}

.deck-thumb {
  position: absolute;
  width: 96rpx;
  height: 126rpx;
  border-radius: 16rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.86);
  box-shadow: 0 10rpx 18rpx rgba(56, 79, 104, 0.2);
}

.deck-thumb.thumb-0 {
  right: 78rpx;
  bottom: 0;
  transform: rotate(-14deg);
  opacity: 0.92;
}

.deck-thumb.thumb-1 {
  right: 44rpx;
  bottom: 4rpx;
  transform: rotate(-4deg);
  opacity: 0.96;
}

.deck-thumb.thumb-2 {
  right: 10rpx;
  bottom: 6rpx;
  transform: rotate(8deg);
}

.deck-dots {
  margin-top: -4rpx;
  display: flex;
  justify-content: center;
  gap: 10rpx;
}

.deck-dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: rgba(95, 130, 166, 0.32);
  transition: width 0.2s ease, background 0.2s ease;
}

.deck-dot.active {
  width: 34rpx;
  border-radius: 999rpx;
  background: #6bc6de;
}
</style>
