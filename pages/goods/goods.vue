<template>
  <!-- 透明固定导航条 -->
  <zhouWei-navBar
    type="transparentFixed"
    :backState="1000"
    :homeState="2000"
    fontColor="#000"
    transparentFixedFontColor="#000"
    :scrollTop="scrollTop"
  >
    <!-- 顶部透明态：左侧返回 -->
    <template #transparentFixedLeft>
      <view class="nav-back-pill" @click="goBack" aria-label="返回">
        <uni-icons type="left" size="22" color="#000" />
      </view>
    </template>

    <!-- 顶部透明态：中间标题（商品名，超长省略） -->
    <template #transparentFixed>
      <text class="nav-title-ellipsis">
        {{ goods.name || goods.goods_name || '商品详情' }}
      </text>
    </template>

    <!-- 顶部透明态：右侧（根据场景区分） -->
    <template #transparentFixedRight>
      <!-- 非小程序：显示点赞；小程序：不显示 -->
      <view v-if="!isMpWeixin" class="nav-right-like" @tap="likeFn">
        <image
          class="nav-like-icon"
          :src="hasLike ? '/static/new-icon/like-fill.png' : '/static/new-icon/like.png'"
          mode="aspectFill"
        />
      </view>
    </template>

    <!-- 滚动出现的实底态：左侧返回 -->
    <template #left>
      <view class="nav-back-pill" @click="goBack" aria-label="返回">
        <uni-icons type="left" size="22" color="#000" />
      </view>
    </template>

    <!-- 滚动出现的实底态：中间内容（根据场景区分） -->
    <template #default>
      <!-- 场景1：微信小程序 -> 显示点赞按钮 -->
      <view
        v-if="isMpWeixin"
        class="nav-right-like"
        @tap="likeFn"
        style="margin-right: 0;"
      >
        <image
          class="nav-like-icon"
          :src="hasLike ? '/static/new-icon/like-fill.png' : '/static/new-icon/like.png'"
          mode="aspectFill"
        />
      </view>

      <!-- 场景2：非小程序 -> 显示品牌信息（恢复原逻辑） -->
      <block v-else>
        <view
          v-if="goods.goods_brand_name_image"
          class="nav-brand-wrap"
          @tap="jumpBrand(goods.brand_id)"
        >
          <image
            :src="goods.goods_brand_name_image"
            mode="heightFix"
            class="nav-brand-img"
          />
        </view>
        <text v-else class="nav-brand-name" @tap="jumpBrand(goods.brand_id)">
          {{ goods.brand_name || '品牌' }}
        </text>
      </block>
    </template>

    <!-- 实底态：右侧（根据场景区分） -->
    <template #right>
      <!-- 非小程序：显示点赞；小程序：空（因已移至中间） -->
      <view v-if="!isMpWeixin" class="nav-right-like" @tap="likeFn">
        <image
          class="nav-like-icon"
          :src="hasLike ? '/static/new-icon/like-fill.png' : '/static/new-icon/like.png'"
          mode="aspectFill"
        />
      </view>
    </template>
  </zhouWei-navBar>

  <!-- 页面主体 -->
  <view v-if="goods.name" class="goods-detail-container" :key="currentId">
    <meta name="theme-color" content="#F8F8F8"></meta>
    <view-logs />

    <!-- 顶部安全距离 + 导航条高度 占位，带波点背景 -->
    <view class="swiper-safe-bg" :style="{ height: topSafeSpacePx }"></view>

    <!-- 轮播图部分 -->
    <view class="swiper-container">
      <swiper
        :interval="3000"
        :duration="200"
        @change="onChange"
        class="banner-swiper"
        :style="{
          height: swiperHeight + 'px',
          'min-height': '200px',
          'max-height': maxHeight + 'px'
        }"
      >
        <block v-for="(item, key) in goods.goods_images" :key="key">
          <swiper-item class="swiper-item-container">
            <view class="swiper-item">
              <image
                :src="item"
                mode="widthFix"
                :class="'swiper-image-' + key"
                @load="onImageLoad(key)"
                @tap="viewFullImage(key)"
              ></image>
            </view>
          </swiper-item>
        </block>
      </swiper>

      <view class="swiper-index">
        <text style="color: #fff;">{{ swiperIndex }} / {{ goods.goods_images.length }}</text>
      </view>
    </view>

    <!-- 商品基本信息 -->
    <view class="goods-info">
      <view class="engage-panel">
        <view class="quick-actions">
          <view class="quick-btn quick-btn-stock" @tap="addToStock">
            <uni-icons type="plus" size="16" color="#4c6a8f"></uni-icons>
            <text class="quick-btn-text font-alimamashuhei">放入物品栏</text>
          </view>
          <view class="quick-btn quick-btn-wish" @tap="wishResale">
            <text class="quick-btn-badge font-title">{{ formatNumber(wishCount) }}</text>
            <uni-icons type="star" size="16" color="#7e5f4c"></uni-icons>
            <text class="quick-btn-text font-alimamashuhei">期望再贩</text>
          </view>
          <view class="quick-btn quick-btn-showcase" @tap="addToShowcase">
            <uni-icons type="vip" size="16" color="#4f5f86"></uni-icons>
            <text class="quick-btn-text font-alimamashuhei">加入展示柜</text>
          </view>
          <view class="quick-btn quick-btn-want" @tap="openWantPanel">
            <view class="quick-want-bubble font-alimamashuhei">试试新功能？</view>
            <image
              class="quick-like-icon"
              :src="hasLike ? '/static/new-icon/like-fill.png' : '/static/new-icon/like.png'"
              mode="aspectFill"
            />
            <text class="quick-btn-text font-alimamashuhei">想要</text>
          </view>
        </view>

        <view class="avg-score-box">
          <view class="avg-score-main">
            <text class="avg-score-title font-alimamashuhei">所有用户平均评分</text>
            <text class="avg-score-overall font-title">{{ overallAvgText }}</text>
          </view>
          <view class="avg-score-detail">
            <text class="avg-chip">外观 {{ appearanceAvgText }}</text>
            <text class="avg-chip">价格 {{ priceAvgText }}</text>
            <text class="avg-chip">质量 {{ qualityAvgText }}</text>
          </view>
        </view>
      </view>

      <view class="info-item">
        <text class="label font-title">名称</text>
        <image
          :src="goods.goods_name_image"
          mode="heightFix"
          class="img_info"
        ></image>
      </view>
      <view class="info-item" @click="selectType(goods.type)">
        <text class="label font-title">类型</text>
        <text class="value">{{ goods.type }}</text>
      </view>

      <view class="info-item info-item-price">
        <text class="label font-title">初贩定价</text>
		
        <view class="price-value-wrap">
          <image
            :src="goods.goods_price_image"
            v-if="goods.goods_price_image && resolvedMainPrice > 0"
            mode="heightFix"
            class="img_info"
          ></image>
          <text class="value" v-else-if="resolvedMainPrice > 0">
            {{ resolvedMainPrice }} {{ resolvedMainCurrency || goods.currency || '' }}
          </text>
          <view class="price-empty-wrap" v-else>
            <text class="value price-empty-text">暂无定价</text>
            <button class="price-supplement-btn font-alimamashuhei" @click="openPriceSupplementModal">
              补充信息
            </button>
          </view>

          <view class="price-note pending" v-if="pendingPriceSubmission">
            <text class="price-note-text">
              待审核补充：{{ pendingPriceSubmission.price }} {{ pendingPriceSubmission.currency || goods.currency || '' }}
            </text>
            <uni-icons
              type="help-filled"
              size="14"
              color="#9aa8ba"
              style="margin-left: 8rpx;"
              @click.stop="showPendingPriceTip"
            ></uni-icons>
          </view>

          <view class="price-note approved" v-if="approvedPriceSubmission">
            <image
              class="price-user-avatar"
              :src="approvedPriceSubmission.submit_avatar || 'https://images1.fantuanpu.com/home/default_avatar.jpg'"
              mode="aspectFill"
            />
            <text class="price-note-text">
              {{ approvedPriceSubmitterName }}
              补充：{{ approvedPriceSubmission.price }} {{ approvedPriceSubmission.currency || goods.currency || '' }}
            </text>
          </view>
        </view>
      </view>

      <view class="info-item">
        <text class="label font-title">初贩时间</text>
        <text class="value">
          {{ goods.sub_time1 > 0 ? formatTimestamp(goods.sub_time1) : '未知' }}
        </text>
      </view>

      <view class="info-item">
        <text class="label font-title">尺寸</text>
        <view class="value">
          <view v-if="goods.sizes && goods.sizes.length > 0">
            <view
              v-for="(group, index) in groupedSizes"
              :key="index"
              class="size-group"
            >
              <text
                class="size-category size-clickable"
                @tap.stop="selectSize(group.category)"
              >
                {{ group.category }}
              </text>
              <text v-if="group.details.length > 0" class="size-separator">：</text>
              <view v-if="group.details.length > 0" class="size-detail-list">
                <text
                  v-for="detail in group.details"
                  :key="`${group.category}-${detail}`"
                  class="size-details size-clickable"
                  @tap.stop="selectSize(detail)"
                >
                  {{ detail }}
                </text>
              </view>
            </view>
          </view>
          <view v-else class="size-fallback">
            <text
              v-if="goods.size"
              class="size-details size-clickable"
              @tap.stop="selectSize(goods.size)"
            >
              {{ goods.size }}
            </text>
            <text v-if="goods.size && goods.size_detail" class="size-separator"> / </text>
            <text
              v-if="goods.size_detail"
              class="size-details size-clickable"
              @tap.stop="selectSize(goods.size_detail)"
            >
              {{ goods.size_detail }}
            </text>
            <text v-if="!goods.size && !goods.size_detail" class="size-details">未知</text>
          </view>
        </view>
      </view>

      <view v-if="showBodySizeInfo" class="info-item">
        <text class="label font-title">可选体型</text>
        <text class="value">{{ goods.body_size || '未知' }}</text>
      </view>

      <view v-if="isHeadOrWholeGoods" class="info-item">
        <text class="label font-title">头围(cm)</text>
        <text class="value">{{ goods.head_circumference || '未填写' }}</text>
      </view>

      <view v-if="isHeadOrWholeGoods" class="info-item">
        <text class="label font-title">脖围(cm)</text>
        <text class="value">{{ goods.neck_circumference || '未填写' }}</text>
      </view>

      <view v-if="isHeadOrWholeGoods" class="info-item">
        <text class="label font-title">插口建议</text>
        <text class="value">{{ formatMultiSpecText(goods.socket_sizes) }}</text>
      </view>

      <view v-if="isHeadOrWholeGoods" class="info-item">
        <text class="label font-title">眼珠建议</text>
        <text class="value">{{ formatMultiSpecText(goods.eye_recommendations) }}</text>
      </view>

      <view class="info-item">
        <text class="label font-title">可选颜色</text>
        <text class="value">{{ goods.skin }}</text>
      </view>

      <view class="info-item">
        <text class="label font-title">制作方</text>
        <image
          @click="jumpBrand(goods.brand_id)"
          :src="goods.goods_brand_name_image"
          v-if="goods.goods_brand_name_image"
          mode="heightFix"
          class="img_info"
          style="background: rgb(169 231 255); padding: 0rpx 20rpx;"
        ></image>
      </view>

      <view class="info-item">
        <text class="label font-title">材质</text>
        <text class="value">{{ goods.doll_material }}</text>
      </view>

      <view class="info-item">
        <text class="label font-title">备注</text>
        <text class="value">{{ goods.desc_content || '暂无备注信息' }}</text>
      </view>
    </view>

    <view class="supplement-entry-card">
      <view class="supplement-entry-copy">
        <text class="supplement-entry-title font-alimamashuhei">发现词条信息不完整？</text>
        <text class="supplement-entry-desc">
          可补充或修改头围、脖围、插口、眼珠建议、材质、颜色、尺寸和图片，提交后进入审核。
        </text>
      </view>
      <button class="info-supplement-btn font-alimamashuhei" @click="openPriceSupplementModal">
        补充信息
      </button>
    </view>

    <view v-if="contributionLoading || contributionTotal > 0" class="contribution-section">
      <view class="section-header contribution-section-head">
        <text class="section-title">词条贡献人</text>
        <text class="contribution-count font-title">{{ contributionTotal }} 条</text>
      </view>
      <view v-if="contributionLoading" class="contribution-loading">
        <text class="font-title">加载中...</text>
      </view>
      <view
        v-for="item in contributionList"
        :key="item.id"
        class="contribution-card"
      >
        <view class="contribution-user-row">
          <image
            class="contribution-avatar"
            :src="item.submit_avatar || 'https://images1.fantuanpu.com/home/default_avatar.jpg'"
            mode="aspectFill"
          />
          <view class="contribution-user-main">
            <view class="contribution-user-top">
              <text class="contribution-name font-alimamashuhei">{{ item.submit_username || '匿名用户' }}</text>
              <text class="contribution-time font-title">{{ formatContributionTime(item.created_at) }}</text>
            </view>
            <text class="contribution-summary">{{ formatContributionSummary(item) }}</text>
          </view>
        </view>

        <view v-if="item.contribution_items && item.contribution_items.length" class="contribution-item-list">
          <view
            v-for="contribution in item.contribution_items"
            :key="`${item.id}-${contribution.key}`"
            class="contribution-item"
          >
            <text class="contribution-item-label font-title">{{ contribution.label }}</text>
            <text class="contribution-item-value">{{ contribution.value }}</text>
          </view>
        </view>

        <view v-if="item.reason" class="contribution-reason">
          <text class="contribution-reason-label font-title">原因</text>
          <text class="contribution-reason-text">{{ item.reason }}</text>
        </view>

        <view v-if="item.image_url_list && item.image_url_list.length" class="contribution-image-wrap">
          <text class="contribution-media-title font-title">补充图片</text>
          <scroll-view scroll-x class="contribution-image-scroll">
            <view class="contribution-image-row">
              <image
                v-for="url in item.image_url_list"
                :key="`${item.id}-${url}`"
                class="contribution-image"
                :src="url"
                mode="aspectFill"
                @tap="previewSupplementImages(item.image_url_list, url)"
              />
            </view>
          </scroll-view>
        </view>

        <view v-if="item.screenshot_url_list && item.screenshot_url_list.length" class="contribution-image-wrap">
          <text class="contribution-media-title font-title">佐证截图</text>
          <scroll-view scroll-x class="contribution-image-scroll">
            <view class="contribution-image-row">
              <image
                v-for="url in item.screenshot_url_list"
                :key="`${item.id}-proof-${url}`"
                class="contribution-image contribution-proof-image"
                :src="url"
                mode="aspectFill"
                @tap="previewSupplementImages(item.screenshot_url_list, url)"
              />
            </view>
          </scroll-view>
        </view>
      </view>

      <view v-if="contributionPageCount > 1" class="contribution-pager">
        <button class="contribution-page-btn" :disabled="!hasContributionPrev" @click="changeContributionPage('prev')">上一页</button>
        <text class="contribution-page-index font-title">{{ contributionPage }} / {{ contributionPageCount }}</text>
        <button class="contribution-page-btn is-primary" :disabled="!hasContributionNext" @click="changeContributionPage('next')">下一页</button>
      </view>
    </view>

    <!-- 贩售情报 -->
    <view
      class="sales-info"
      v-if="goods.goods_sales && goods.goods_sales.length > 0"
    >
      <text class="section-title">贩售情报</text>
      <view class="sales-list">
        <view
          v-for="(sale, index) in goods.goods_sales"
          :key="sale.id"
          class="sale-item"
        >
          <view class="sale-header">
            <view class="sale-type-wrap">
              <text class="sale-type">{{ sale.sale_type }}</text>
              <text v-if="isFuzzySaleMessage(sale)" class="sale-fuzzy-tag">模糊消息</text>
            </view>
            <text class="sale-price font-title">
              {{ getSalePriceDisplay(sale) }}
            </text>
          </view>
          <view class="sale-period font-title">
            <text>{{ getSaleStartDisplay(sale) }}</text>
            <text v-if="showSaleEndDisplay(sale)" class="separator">至</text>
            <text v-if="showSaleEndDisplay(sale)">
              {{ formatTimestamp(sale.sub_time_end) }}
            </text>
            <text v-else class="separator">{{ isFuzzySaleMessage(sale) ? '预计' : '开定' }}</text>
          </view>
          <view class="sale-size">
            <text>{{ sale.size }} · {{ sale.size_detail }}</text>
          </view>
          <view class="bill-action" @click="createBill(sale)">
            <uni-icons type="plus" size="16" color="#64c6dc"></uni-icons>
            <text>创建一个尾款账单</text>
          </view>
        </view>
      </view>
    </view>
    <view v-else class="no-sales">
      <text class="section-title">贩售情报</text>
      <text class="empty-text">暂无贩售信息</text>
    </view>

    <!-- 表态组件 -->
    <item-impression
      :key="currentId"
      :target_id="parseInt(currentId)"
      type="2"
      :goods-type="Number(goods.type) || 0"
    ></item-impression>

    <!-- 返图 -->
    <view class="collocation-section">
      <view class="section-header">
        <text class="section-title">返图参考</text>
        <view class="more-link" @tap="jump2collocation">
          <text>查看更多</text>
          <image src="../../static/right2.png"></image>
        </view>
      </view>

      <scroll-view scroll-x="true" class="collocation-list">
        <view
          v-for="collocation in collocationList.collocation_relation_list"
          :key="collocation.collocation_id"
          class="collocation-item"
          @tap="jump2collectionDetail(
            collocation.collocation_id,
            collocation.relation_origin
          )"
        >
          <image
            :src="getImageForList(collocation.image_urls)"
            mode="aspectFill"
          ></image>
        </view>
      </scroll-view>

      <view @tap="jump2collocation" class="upload-collocation">
        <text>返图帮助其它娃友?</text>
        <uni-icons
          type="upload"
          size="20"
          color="#ccc"
          style="margin-left: 10rpx;"
        ></uni-icons>
      </view>
    </view>

    <!-- 妆图展示 -->
    <view v-if="showFaceupSection" class="faceup-section">
      <view class="section-header">
        <text class="section-title">妆图展示</text>
        <view
          class="refresh-btn"
          :class="{ loading: faceupLoading }"
          @click="refreshFaceupList"
        >
          <text class="refresh-text">
            {{ faceupLoading ? '换一批中…' : '换一批' }}
          </text>
          <uni-icons
            v-if="!faceupLoading"
            type="refresh"
            size="16"
            color="#64c6dc"
            style="margin-left: 8rpx;"
          ></uni-icons>
        </view>
      </view>

      <view class="faceup-grid">
        <view
          v-for="(faceup, index) in faceupList"
          :key="index"
          class="faceup-card"
          @click="jump2faceup(faceup.id)"
        >
          <image
            :src="getFirstImage(faceup.face_up_image_urls)"
            mode="aspectFill"
            class="faceup-cover"
          ></image>
        </view>
      </view>

      <view
        class="faceup-empty"
        v-if="!faceupLoading && faceupList.length === 0"
      >
        暂无妆图～
      </view>
    </view>

    <!-- 评论区 -->
    <view class="comment-section">
      <comment-list
        :key="currentId"
        ref="commentListRef"
        :type="2"
        :relation-id="parseInt(currentId)"
        @reply="handleReplyComment"
      />
    </view>

    <!-- 输入框 -->
    <comment-input
      ref="commentInputRef"
      :reply-info="replyForItem"
      :target-id="parseInt(currentId)"
      @submit="handleCommentSubmit"
      @update:reply-info="(val) => (replyForItem = val)"
    />

    <common-modal
      :visible="priceSupplementVisible"
      @update:visible="val => (priceSupplementVisible = val)"
      top="10vh"
      width="700rpx"
    >
      <view class="price-supplement-modal">
        <text class="price-supplement-title">补充信息</text>
        <text class="price-supplement-desc">
          支持补充或修改价格、头围、脖围、插口、眼珠建议、材质、颜色、尺寸与图片。提交后会进入后台审核。
        </text>
        <view class="price-supplement-grid">
          <view class="supplement-field">
            <text class="supplement-field-label font-title">价格</text>
            <input
              v-model="priceSupplementPriceInput"
              class="price-supplement-input"
              type="number"
              placeholder="可选，整数价格"
              placeholder-class="price-placeholder"
            />
          </view>
          <view class="supplement-field">
            <text class="supplement-field-label font-title">币种</text>
            <input
              v-model="priceSupplementCurrencyInput"
              class="price-supplement-input"
              type="text"
              maxlength="12"
              placeholder="如 CNY / USD"
              placeholder-class="price-placeholder"
            />
          </view>
        </view>

        <view class="price-supplement-grid">
          <view class="supplement-field">
            <text class="supplement-field-label font-title">头围</text>
            <input
              v-model="priceSupplementHeadCircumferenceInput"
              class="price-supplement-input"
              type="text"
              :placeholder="`当前：${goods.head_circumference || '未填写'}`"
              placeholder-class="price-placeholder"
            />
          </view>
          <view class="supplement-field">
            <text class="supplement-field-label font-title">脖围</text>
            <input
              v-model="priceSupplementNeckCircumferenceInput"
              class="price-supplement-input"
              type="text"
              :placeholder="`当前：${goods.neck_circumference || '未填写'}`"
              placeholder-class="price-placeholder"
            />
          </view>
        </view>

        <view v-if="isHeadOrWholeGoods" class="supplement-field">
          <view class="supplement-field-head">
            <text class="supplement-field-label font-title">插口</text>
            <text class="supplement-current-text">当前：{{ formatMultiSpecText(goods.socket_sizes) }}</text>
          </view>
          <view class="supplement-chip-group">
            <view
              v-for="item in supplementSocketOptions"
              :key="`socket-${item}`"
              :class="['supplement-chip', { active: priceSupplementSocketSelections.includes(item) }]"
              @tap="toggleSupplementSocket(item)"
            >
              {{ item }}
            </view>
          </view>
        </view>

        <view v-if="isHeadOrWholeGoods" class="supplement-field">
          <view class="supplement-field-head">
            <text class="supplement-field-label font-title">眼珠建议</text>
            <text class="supplement-current-text">当前：{{ formatMultiSpecText(goods.eye_recommendations) }}</text>
          </view>
          <view class="supplement-chip-group">
            <view
              v-for="item in supplementEyeOptions"
              :key="`eye-${item}`"
              :class="['supplement-chip', { active: priceSupplementEyeSelections.includes(item) }]"
              @tap="toggleSupplementEye(item)"
            >
              {{ item }}
            </view>
          </view>
        </view>

        <view class="price-supplement-grid">
          <view class="supplement-field">
            <view class="supplement-field-head">
              <text class="supplement-field-label font-title">材质</text>
              <text class="supplement-current-text">当前：{{ goods.doll_material || '未填写' }}</text>
            </view>
            <picker :range="supplementMaterialOptions" :value="Math.max(0, supplementMaterialOptions.indexOf(priceSupplementDollMaterialInput))" @change="onSupplementMaterialChange">
              <view :class="['supplement-picker-trigger', { placeholder: !priceSupplementDollMaterialInput }]">
                {{ priceSupplementDollMaterialInput || (supplementMetaLoading ? '加载材质中...' : '请选择材质') }}
              </view>
            </picker>
          </view>
          <view class="supplement-field">
            <text class="supplement-field-label font-title">颜色</text>
            <input
              v-model="priceSupplementSkinInput"
              class="price-supplement-input"
              type="text"
              :placeholder="`当前：${goods.skin || '未填写'}`"
              placeholder-class="price-placeholder"
            />
          </view>
        </view>

        <view class="price-supplement-grid">
          <view class="supplement-field">
            <view class="supplement-field-head">
              <text class="supplement-field-label font-title">尺寸分类</text>
              <text class="supplement-current-text">当前：{{ goods.size || '未填写' }}</text>
            </view>
            <picker :range="supplementSizeCategoryOptions" :value="Math.max(0, supplementSizeCategoryOptions.indexOf(priceSupplementSizeCategoryInput))" @change="onSupplementSizeCategoryChange">
              <view :class="['supplement-picker-trigger', { placeholder: !priceSupplementSizeCategoryInput }]">
                {{ priceSupplementSizeCategoryInput || (supplementMetaLoading ? '加载尺寸中...' : '请选择尺寸分类') }}
              </view>
            </picker>
          </view>
          <view class="supplement-field">
            <view class="supplement-field-head">
              <text class="supplement-field-label font-title">尺寸详情</text>
              <text class="supplement-current-text">当前：{{ formatCurrentSizeText() }}</text>
            </view>
            <view v-if="priceSupplementSizeCategoryInput" class="supplement-chip-group">
              <view
                v-for="item in supplementSizeDetailOptions"
                :key="`size-detail-${item}`"
                :class="['supplement-chip', { active: priceSupplementSizeDetailSelections.includes(item) }]"
                @tap="toggleSupplementSizeDetail(item)"
              >
                {{ item }}
              </view>
            </view>
            <text v-else class="supplement-field-tip">请先选择尺寸分类，再选择对应尺寸详情。</text>
          </view>
        </view>

        <view class="supplement-uploader">
          <view class="supplement-uploader-head">
            <text class="supplement-field-label font-title">补充图片</text>
            <button class="supplement-upload-btn" :disabled="priceSupplementUploading" @click="uploadPriceSupplementAssets('image')">
              {{ priceSupplementUploading ? '上传中...' : '上传图片' }}
            </button>
          </view>
          <text class="supplement-field-tip">可补充新的商品图片，审核通过后会追加到商品图集中。</text>
          <scroll-view v-if="priceSupplementImageList.length" scroll-x class="supplement-preview-scroll">
            <view class="supplement-preview-row">
              <view
                v-for="(url, index) in priceSupplementImageList"
                :key="`supplement-image-${url}`"
                class="supplement-preview-item"
              >
                <image class="supplement-preview-image" :src="url" mode="aspectFill" @tap="previewSupplementImages(priceSupplementImageList, url)" />
                <view class="supplement-preview-remove" @tap.stop="removePriceSupplementAsset('image', index)">×</view>
              </view>
            </view>
          </scroll-view>
        </view>

        <view class="supplement-uploader">
          <view class="supplement-uploader-head">
            <text class="supplement-field-label font-title">截图</text>
            <button class="supplement-upload-btn is-light" :disabled="priceSupplementUploading" @click="uploadPriceSupplementAssets('screenshot')">
              {{ priceSupplementUploading ? '上传中...' : '上传截图' }}
            </button>
          </view>
          <text class="supplement-field-tip">可选填写，用于说明来源或佐证。</text>
          <scroll-view v-if="priceSupplementScreenshotList.length" scroll-x class="supplement-preview-scroll">
            <view class="supplement-preview-row">
              <view
                v-for="(url, index) in priceSupplementScreenshotList"
                :key="`supplement-proof-${url}`"
                class="supplement-preview-item"
              >
                <image class="supplement-preview-image" :src="url" mode="aspectFill" @tap="previewSupplementImages(priceSupplementScreenshotList, url)" />
                <view class="supplement-preview-remove" @tap.stop="removePriceSupplementAsset('screenshot', index)">×</view>
              </view>
            </view>
          </scroll-view>
        </view>

        <view class="supplement-field">
          <text class="supplement-field-label font-title">补充原因</text>
          <textarea
            v-model="priceSupplementReasonInput"
            class="price-supplement-textarea"
            maxlength="120"
            placeholder="可选填写，例如：官方直播提到、本人实测、商品页截图等"
            placeholder-class="price-placeholder"
          />
        </view>
        <view class="price-supplement-actions">
          <button class="price-supplement-cancel" @click="priceSupplementVisible = false">取消</button>
          <button
            class="price-supplement-confirm"
            :disabled="priceSupplementSubmitting"
            @click="submitPriceSupplement"
          >
            {{ priceSupplementSubmitting ? '提交中...' : '提交审核' }}
          </button>
        </view>
      </view>
    </common-modal>

    <common-modal :visible="wantPanelVisible" @update:visible="v => (wantPanelVisible = v)" top="20vh" width="720rpx">
      <view class="want-modal">
        <text class="want-modal-title font-alimamashuhei">标记为「想要」</text>
        <text class="want-modal-sub">填写打分和评论后可提交，至少填写一项。</text>

        <view class="want-score-row" v-for="cfg in goodsScoreConfigs" :key="`want-${cfg.key}`">
          <text class="want-score-label font-alimamashuhei">{{ cfg.label }}</text>
          <view class="want-rate-wrap">
            <uni-rate
              :value="goodsScoreDraft[cfg.key]"
              :max="10"
              :size="16"
              :margin="2"
              active-color="#e5ac62"
              color="#d9dee6"
              @change="onGoodsScoreChange(cfg.key, $event)"
            />
          </view>
          <text class="want-score-val font-title">
            {{ goodsScoreDraft[cfg.key] > 0 ? `${goodsScoreDraft[cfg.key]}分` : '未评' }}
          </text>
        </view>

        <textarea
          v-model.trim="wantComment"
          class="want-comment-input"
          maxlength="200"
          placeholder="写下你想要它的原因（可选）"
          placeholder-class="want-comment-ph"
        />
        <view class="want-actions">
          <button class="want-cancel-btn font-alimamashuhei" @click="wantPanelVisible = false">取消</button>
          <button
            class="want-submit-btn font-alimamashuhei"
            :disabled="!canSubmitWant || wantSubmitting"
            @click="submitWantPanel"
          >
            {{ wantSubmitting ? '提交中...' : '提交' }}
          </button>
        </view>
      </view>
    </common-modal>

    <view class="bottom-placeholder"></view>
  </view>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { onPageScroll, onLoad, onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import {
  asyncGetUserInfo,
  websiteUrl,
  global,
  getWindowTop,
  toPx
} from '../../common/config.js'
import {
  chooseImageList,
  getQiniuToken,
  uploadImageToQiniu
} from '../../common/image.js'
import {
  requestSizeMap,
  requestMaterialOptions,
  buildHeadSocketOptions,
  buildEyeRecommendationOptions,
  buildSizeCategoryOptions,
  buildSizeDetailOptions
} from '../../common/goods-meta.js'

const props = defineProps(['goods_id'])

/* ===== 环境判断 ===== */
const isMpWeixin = process.env.UNI_PLATFORM === 'mp-weixin'

/* ===== 透明导航：滚动联动 & 返回 ===== */
const scrollTop = ref(0)
onPageScroll(e => { scrollTop.value = e?.scrollTop || 0 })
function goBack () {
  const pages = getCurrentPages?.() || []
  if (pages.length > 1) uni.navigateBack({ delta: 1 })
  else uni.switchTab({ url: '/pages/index/index' })
}

/* ===== 顶部安全占位高度修正 ===== */
const NAV_HEIGHT_RPX = 100
const topSafeSpacePx = computed(() => {
  // 微信小程序：config.js 中的 getWindowTop 已包含状态栏+胶囊高度，直接使用
  if (isMpWeixin) {
    return toPx(getWindowTop())
  }
  // 其他端：getWindowTop 仅为状态栏高度，需加上自定义导航栏高度 (100rpx)
  return toPx(getWindowTop() + uni.upx2px(NAV_HEIGHT_RPX))
})

/* ===== 数据区 ===== */
const loading = ref(false)
const error = ref(false)
const errorMsg = ref('')

const commentListRef = ref(null)
const commentInputRef = ref(null)
let replyForItem = ref({})

let goods = ref({})
let swiperIndex = ref(1)

let hasLike = ref(false)
let collocationList = ref(false)
let wishLoading = ref(false)
let hasWish = ref(false)
let wishCount = ref(0)
const priceSupplementVisible = ref(false)
const priceSupplementSubmitting = ref(false)
const priceSupplementPriceInput = ref('')
const priceSupplementCurrencyInput = ref('')
const priceSupplementHeadCircumferenceInput = ref('')
const priceSupplementNeckCircumferenceInput = ref('')
const priceSupplementDollMaterialInput = ref('')
const priceSupplementSkinInput = ref('')
const priceSupplementSizeCategoryInput = ref('')
const priceSupplementReasonInput = ref('')
const priceSupplementImageList = ref([])
const priceSupplementScreenshotList = ref([])
const priceSupplementUploading = ref(false)
const priceSupplementSocketSelections = ref([])
const priceSupplementEyeSelections = ref([])
const priceSupplementSizeDetailSelections = ref([])
const supplementMetaLoading = ref(false)
const supplementSizeMap = ref({})
const supplementMaterialOptions = ref([])
const supplementSocketOptions = ref([])
const supplementEyeOptions = ref([])
const supplementSizeCategoryOptions = ref([])
const supplementMetaKey = ref('')

const swiperHeight = ref(400)
const imageHeights = ref([])
const maxHeight = ref(uni.upx2px(1000))

const faceupList = ref([])
const faceupLoading = ref(false)
const BODY_SIZE_VISIBLE_TYPES = Object.freeze(['单体', '单头', '整体'])
const HEAD_OR_WHOLE_TYPES = Object.freeze(['单头', '整体'])
const normalizedGoodsType = computed(() => String(goods.value?.type || '').trim())
const showBodySizeInfo = computed(() => BODY_SIZE_VISIBLE_TYPES.includes(normalizedGoodsType.value))
const isHeadOrWholeGoods = computed(() => HEAD_OR_WHOLE_TYPES.includes(normalizedGoodsType.value))
const showFaceupSection = computed(() => isHeadOrWholeGoods.value)
const pendingPriceSubmission = computed(() => goods.value?.pending_price_submission || null)
const approvedPriceSubmission = computed(() => goods.value?.approved_price_submission || null)
const contributionList = ref([])
const contributionLoading = ref(false)
const contributionPage = ref(1)
const contributionPageSize = 5
const contributionTotal = ref(0)
const contributionPageCount = computed(() => Math.max(1, Math.ceil(contributionTotal.value / contributionPageSize)))
const hasContributionPrev = computed(() => contributionPage.value > 1)
const hasContributionNext = computed(() => contributionPage.value < contributionPageCount.value)
const approvedPriceSubmitterName = computed(() => {
  const username = String(approvedPriceSubmission.value?.submit_username || '').trim()
  if (username) return username
  const nickname = String(approvedPriceSubmission.value?.submit_nickname || '').trim()
  if (nickname) return nickname
  return '用户'
})
const resolvedMainPrice = computed(() => {
  const firstSale = goods.value?.goods_sales?.[0]
  const saleAmount = Number(firstSale?.sub_amount || 0) + Number(firstSale?.fin_amount || 0)
  if (saleAmount > 0) return saleAmount
  const totalAmount = Number(goods.value?.total_amount || 0)
  if (totalAmount > 0) return totalAmount
  const approvedAmount = Number(approvedPriceSubmission.value?.price || 0)
  if (approvedAmount > 0) return approvedAmount
  return 0
})
const resolvedMainCurrency = computed(() => {
  const firstSale = goods.value?.goods_sales?.[0]
  return firstSale?.currency || goods.value?.currency || approvedPriceSubmission.value?.currency || ''
})
const supplementSizeDetailOptions = computed(() => buildSizeDetailOptions(supplementSizeMap.value, priceSupplementSizeCategoryInput.value))

const GOODS_SCORE_TYPE_MAP = Object.freeze({
  appearance: 101,
  price: 102,
  quality: 103
})

const goodsScoreConfigs = Object.freeze([
  { key: 'appearance', label: '外观' },
  { key: 'price', label: '价格' },
  { key: 'quality', label: '质量' }
])

const goodsScoreDraft = reactive({
  appearance: 0,
  price: 0,
  quality: 0
})

const goodsScoreOrigin = reactive({
  appearance: 0,
  price: 0,
  quality: 0
})

const wantPanelVisible = ref(false)
const wantComment = ref('')
const wantSubmitting = ref(false)
const scoreLoading = ref(false)

function normalizeGoodsScore (score) {
  const n = Number(score || 0)
  if (!Number.isFinite(n) || n <= 0) return 0
  return Math.max(1, Math.min(10, Math.round(n)))
}

function resetGoodsScoreState () {
  goodsScoreConfigs.forEach((cfg) => {
    goodsScoreDraft[cfg.key] = 0
    goodsScoreOrigin[cfg.key] = 0
  })
}

function onGoodsScoreChange (key, evt) {
  if (!GOODS_SCORE_TYPE_MAP[key]) return
  goodsScoreDraft[key] = normalizeGoodsScore(evt?.value)
}

const canSubmitWant = computed(() => {
  if (wantSubmitting.value) return false
  const hasAnyScore = goodsScoreConfigs.some((cfg) => Number(goodsScoreDraft[cfg.key] || 0) > 0)
  const hasComment = String(wantComment.value || '').trim().length > 0
  return hasAnyScore || hasComment
})

const scoreSummary = computed(() => goods.value?.score_summary || {})
const appearanceAvgText = computed(() => formatScoreText(scoreSummary.value?.appearance?.avg, scoreSummary.value?.appearance?.count))
const priceAvgText = computed(() => formatScoreText(scoreSummary.value?.price?.avg, scoreSummary.value?.price?.count))
const qualityAvgText = computed(() => formatScoreText(scoreSummary.value?.quality?.avg, scoreSummary.value?.quality?.count))
const overallAvgText = computed(() => formatScoreText(scoreSummary.value?.overall_avg, scoreSummary.value?.overall_count))

watch(
  () => priceSupplementSizeCategoryInput.value,
  () => {
    priceSupplementSizeDetailSelections.value = normalizeSelectableList(
      priceSupplementSizeDetailSelections.value,
      supplementSizeDetailOptions.value
    )
  }
)

function formatMultiSpecText(raw) {
  const txt = String(raw || '').trim()
  if (!txt) return '未填写'
  const list = txt
    .split(/[,\s，、;；|]+/g)
    .map(v => v.trim())
    .filter(Boolean)
  if (!list.length) return '未填写'
  return list.join('、')
}

function splitSupplementTextInput(raw) {
  const txt = String(raw || '').trim()
  if (!txt) return []
  return txt
    .split(/[,\s，、;；|]+/g)
    .map(v => v.trim())
    .filter(Boolean)
}

function uniqTrimmed(values = []) {
  const out = []
  const seen = new Set()
  ;(Array.isArray(values) ? values : []).forEach((raw) => {
    const v = String(raw || '').trim()
    if (!v || seen.has(v)) return
    seen.add(v)
    out.push(v)
  })
  return out
}

function normalizeSelectableList(raw, options = []) {
  const list = uniqTrimmed(Array.isArray(raw) ? raw : splitSupplementTextInput(raw))
  const optionSet = new Set(uniqTrimmed(options))
  if (!optionSet.size) return list
  return list.filter(v => optionSet.has(v))
}

function toggleSelection(listRef, value, options = []) {
  const val = String(value || '').trim()
  if (!val) return
  const next = normalizeSelectableList(listRef.value, options)
  const idx = next.indexOf(val)
  if (idx >= 0) next.splice(idx, 1)
  else next.push(val)
  listRef.value = next
}

function previewSupplementImages(urls, current = '') {
  const list = Array.isArray(urls) ? urls.filter(Boolean) : []
  if (!list.length) return
  uni.previewImage({
    current: current || list[0],
    urls: list
  })
}

function formatContributionTime(ts) {
  const num = Number(ts || 0)
  if (num <= 0) return '未知时间'
  return formatTimestamp(num)
}

function formatContributionSummary(item) {
  return String(item?.contribution_summary || '').trim() || '补充了词条信息'
}

function formatCurrentSizeText() {
  if (Array.isArray(goods.value?.sizes) && goods.value.sizes.length > 0) {
    return goods.value.sizes
      .map(item => {
        const category = String(item?.goods_size || '').trim()
        const detail = String(item?.size_detail || '').trim()
        if (category && detail) return `${category} ${detail}`
        return category || detail
      })
      .filter(Boolean)
      .join('、')
  }
  const category = String(goods.value?.size || '').trim()
  const detail = String(goods.value?.size_detail || '').trim()
  if (category && detail) return `${category} ${detail}`
  return category || detail || '未填写'
}

function resetPriceSupplementForm() {
  priceSupplementPriceInput.value = ''
  priceSupplementCurrencyInput.value = resolvedMainCurrency.value || goods.value.currency || ''
  priceSupplementHeadCircumferenceInput.value = ''
  priceSupplementNeckCircumferenceInput.value = ''
  priceSupplementDollMaterialInput.value = ''
  priceSupplementSkinInput.value = ''
  priceSupplementSizeCategoryInput.value = ''
  priceSupplementReasonInput.value = ''
  priceSupplementImageList.value = []
  priceSupplementScreenshotList.value = []
  priceSupplementSocketSelections.value = []
  priceSupplementEyeSelections.value = []
  priceSupplementSizeDetailSelections.value = []
}

async function ensureSupplementMetaLoaded(force = false) {
  const currentType = normalizedGoodsType.value || String(goods.value?.type || '').trim()
  const nextKey = `${currentType || 'default'}`
  if (!force && supplementMetaKey.value === nextKey && Object.keys(supplementSizeMap.value || {}).length) {
    return
  }
  supplementMetaLoading.value = true
  try {
    const [sizeMap, materialOptions] = await Promise.all([
      requestSizeMap(),
      requestMaterialOptions(currentType)
    ])
    supplementSizeMap.value = sizeMap || {}
    supplementMaterialOptions.value = uniqTrimmed(materialOptions)
    supplementSocketOptions.value = buildHeadSocketOptions(sizeMap)
    supplementEyeOptions.value = buildEyeRecommendationOptions(sizeMap)
    supplementSizeCategoryOptions.value = buildSizeCategoryOptions(sizeMap)
    priceSupplementSocketSelections.value = normalizeSelectableList(priceSupplementSocketSelections.value, supplementSocketOptions.value)
    priceSupplementEyeSelections.value = normalizeSelectableList(priceSupplementEyeSelections.value, supplementEyeOptions.value)
    priceSupplementSizeDetailSelections.value = normalizeSelectableList(priceSupplementSizeDetailSelections.value, supplementSizeDetailOptions.value)
    if (!supplementSizeCategoryOptions.value.includes(priceSupplementSizeCategoryInput.value)) {
      priceSupplementSizeCategoryInput.value = ''
      priceSupplementSizeDetailSelections.value = []
    }
    if (priceSupplementDollMaterialInput.value && !supplementMaterialOptions.value.includes(priceSupplementDollMaterialInput.value)) {
      priceSupplementDollMaterialInput.value = ''
    }
    supplementMetaKey.value = nextKey
  } finally {
    supplementMetaLoading.value = false
  }
}

function onSupplementMaterialChange(e) {
  const idx = Number(e?.detail?.value ?? -1)
  if (idx < 0) return
  priceSupplementDollMaterialInput.value = supplementMaterialOptions.value[idx] || ''
}

function onSupplementSizeCategoryChange(e) {
  const idx = Number(e?.detail?.value ?? -1)
  if (idx < 0) return
  priceSupplementSizeCategoryInput.value = supplementSizeCategoryOptions.value[idx] || ''
  priceSupplementSizeDetailSelections.value = normalizeSelectableList(priceSupplementSizeDetailSelections.value, supplementSizeDetailOptions.value)
}

function toggleSupplementSocket(size) {
  toggleSelection(priceSupplementSocketSelections, size, supplementSocketOptions.value)
}

function toggleSupplementEye(size) {
  toggleSelection(priceSupplementEyeSelections, size, supplementEyeOptions.value)
}

function toggleSupplementSizeDetail(size) {
  toggleSelection(priceSupplementSizeDetailSelections, size, supplementSizeDetailOptions.value)
}

function loadGoodsContributionPage(page = 1) {
  const goodsId = parseInt(currentId.value || 0)
  if (!goodsId) {
    contributionList.value = []
    contributionTotal.value = 0
    contributionPage.value = 1
    return
  }
  contributionLoading.value = true
  uni.request({
    url: `${websiteUrl.value}/goods/contribution-list`,
    method: 'GET',
    data: {
      goods_id: goodsId,
      page,
      page_size: contributionPageSize
    },
    success: (res) => {
      if (res?.data?.status !== 'success') {
        contributionList.value = []
        contributionTotal.value = 0
        return
      }
      const data = res?.data?.data || {}
      contributionList.value = Array.isArray(data.list) ? data.list : []
      contributionTotal.value = Number(data?.pagination?.total || 0)
      contributionPage.value = Number(data?.pagination?.page || page || 1)
    },
    fail: () => {
      contributionList.value = []
      contributionTotal.value = 0
    },
    complete: () => {
      contributionLoading.value = false
    }
  })
}

function changeContributionPage(direction) {
  if (direction === 'prev' && hasContributionPrev.value) {
    loadGoodsContributionPage(contributionPage.value - 1)
  } else if (direction === 'next' && hasContributionNext.value) {
    loadGoodsContributionPage(contributionPage.value + 1)
  }
}

async function uploadPriceSupplementAssets(kind = 'image') {
  if (priceSupplementUploading.value) return
  const targetList = kind === 'screenshot' ? priceSupplementScreenshotList : priceSupplementImageList
  const maxCount = kind === 'screenshot' ? 6 : 9
  const remain = maxCount - targetList.value.length
  if (remain <= 0) {
    uni.showToast({ title: kind === 'screenshot' ? '最多上传6张截图' : '最多上传9张图片', icon: 'none' })
    return
  }
  try {
    const files = await chooseImageList(remain)
    if (!files || !files.length) return
    priceSupplementUploading.value = true
    uni.showLoading({ title: '上传中' })
    for (let i = 0; i < files.length; i++) {
      const tokenData = await getQiniuToken()
      const uploadRes = await uploadImageToQiniu(files[i], tokenData.token, tokenData.path)
      if (uploadRes?.imageUrl) {
        targetList.value.push(uploadRes.imageUrl)
      }
    }
    uni.showToast({ title: '上传成功', icon: 'success' })
  } catch (err) {
    console.error('上传补充图片失败', err)
    uni.showToast({ title: '上传失败', icon: 'none' })
  } finally {
    priceSupplementUploading.value = false
    uni.hideLoading()
  }
}

function removePriceSupplementAsset(kind, index) {
  const targetList = kind === 'screenshot' ? priceSupplementScreenshotList : priceSupplementImageList
  targetList.value.splice(index, 1)
}

async function fetchMyVoteScoreByType (goodsId, voteType) {
  const token = uni.getStorageSync('token')
  if (!token || !goodsId || !voteType) return 0
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/my-vote-record?target_id=${goodsId}&type=${voteType}`,
      method: 'GET',
      header: { Authorization: token }
    })
    if (res?.data?.status !== 'success') return 0
    return normalizeGoodsScore(res?.data?.data?.score)
  } catch (_) {
    return 0
  }
}

async function loadMyGoodsScore (id) {
  const token = uni.getStorageSync('token')
  const gid = parseInt(id || currentId.value || 0)
  if (!token || !global.isLogin || !gid) {
    resetGoodsScoreState()
    return
  }

  scoreLoading.value = true
  try {
    const [appearance, price, quality] = await Promise.all([
      fetchMyVoteScoreByType(gid, GOODS_SCORE_TYPE_MAP.appearance),
      fetchMyVoteScoreByType(gid, GOODS_SCORE_TYPE_MAP.price),
      fetchMyVoteScoreByType(gid, GOODS_SCORE_TYPE_MAP.quality)
    ])

    goodsScoreDraft.appearance = appearance
    goodsScoreDraft.price = price
    goodsScoreDraft.quality = quality
    goodsScoreOrigin.appearance = appearance
    goodsScoreOrigin.price = price
    goodsScoreOrigin.quality = quality
  } finally {
    scoreLoading.value = false
  }
}

function formatScoreText (avg, count) {
  const n = Number(avg || 0)
  const c = Number(count || 0)
  if (c <= 0 || !Number.isFinite(n) || n <= 0) return '--'
  return `${n.toFixed(1)}分`
}

async function openWantPanel () {
  if (!global.isLogin || !uni.getStorageSync('token')) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  wantComment.value = ''
  await loadMyGoodsScore(currentId.value)
  wantPanelVisible.value = true
}

function postLikeOnceIfNeeded (goodsId, token) {
  if (hasLike.value) return Promise.resolve(true)
  return new Promise((resolve) => {
    uni.request({
      url: `${websiteUrl.value}/with-state/add-like`,
      method: 'POST',
      header: { Authorization: token },
      data: { id: goodsId, type: 1 },
      success: (res) => {
        const ok = res?.data?.status === 'success'
        if (ok) hasLike.value = true
        resolve(ok)
      },
      fail: () => resolve(false)
    })
  })
}

function postWantCommentIfNeeded (goodsId, token, content) {
  const c = String(content || '').trim()
  if (!c) return Promise.resolve(true)
  return new Promise((resolve) => {
    uni.request({
      url: `${websiteUrl.value}/with-state/add-comment`,
      method: 'POST',
      header: { Authorization: token },
      data: {
        content: c,
        type: 2,
        target_id: goodsId,
        origin: 1
      },
      success: (res) => resolve(res?.data?.status === 'success'),
      fail: () => resolve(false)
    })
  })
}

async function submitWantPanel () {
  if (wantSubmitting.value) return
  const token = uni.getStorageSync('token')
  const goodsId = parseInt(currentId.value)

  if (!global.isLogin || !token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  if (!goodsId) {
    uni.showToast({ title: '缺少商品ID', icon: 'none' })
    return
  }
  if (!canSubmitWant.value) {
    uni.showToast({ title: '请先填写评分或评论', icon: 'none' })
    return
  }

  const tasks = goodsScoreConfigs
    .map((cfg) => {
      const score = normalizeGoodsScore(goodsScoreDraft[cfg.key])
      if (score <= 0) return null
      return {
        key: cfg.key,
        score,
        type: GOODS_SCORE_TYPE_MAP[cfg.key]
      }
    })
    .filter(Boolean)

  wantSubmitting.value = true
  try {
    const [likeOk, commentOk] = await Promise.all([
      postLikeOnceIfNeeded(goodsId, token),
      postWantCommentIfNeeded(goodsId, token, wantComment.value)
    ])

    let scoreOk = true
    if (tasks.length > 0) {
      const scoreRespList = await Promise.all(tasks.map(task => uni.request({
        url: `${websiteUrl.value}/with-state/add-vote-score`,
        method: 'POST',
        header: { Authorization: token },
        data: {
          target_id: goodsId,
          type: task.type,
          score: task.score
        }
      })))
      scoreOk = !scoreRespList.find(resp => resp?.data?.status !== 'success')
    }

    if (!likeOk || !commentOk || !scoreOk) {
      uni.showToast({ title: '提交失败，请重试', icon: 'none' })
      return
    }

    tasks.forEach((task) => {
      goodsScoreOrigin[task.key] = task.score
    })

    if (commentListRef.value && typeof commentListRef.value.reloadList === 'function') {
      await commentListRef.value.reloadList()
    }

    wantPanelVisible.value = false
    wantComment.value = ''
    uni.showToast({ title: '已记录想要', icon: 'success' })
    getHasLike(goodsId)
    getGoods(goodsId)
    loadMyGoodsScore(goodsId)
  } catch (_) {
    uni.showToast({ title: '网络请求失败', icon: 'none' })
  } finally {
    wantSubmitting.value = false
  }
}

/* ===== 关键：按 ID 重新拉取 ===== */
const currentId = ref(String(props.goods_id || ''))
const lastGoodsId = ref(String(props.goods_id || ''))

function reloadById (id, reason = 'unknown') {
  const newId = String(id || '')
  if (!newId) {
    console.log('【商品】reloadById 失败：ID 为空，原因=', reason)
    return
  }
  console.log('【商品】准备按ID重新拉取，原因=', reason, ' ID=', newId)

  currentId.value = newId
  lastGoodsId.value = newId

  // 轻量重置视图状态，避免闪旧数据
  goods.value = {}
  faceupList.value = []
  imageHeights.value = []
  swiperIndex.value = 1
  swiperHeight.value = 400
  hasLike.value = false
  hasWish.value = false
  wishCount.value = 0
  contributionList.value = []
  contributionTotal.value = 0
  contributionPage.value = 1
  replyForItem.value = {}

  uni.showLoading({ title: '加载中' })
  getGoods(newId)
  getCollocation(newId)
  if (!uni.getStorageSync('token')) resetGoodsScoreState()
  asyncGetUserInfo().then(() => {
    getHasLike(newId)
    loadMyGoodsScore(newId)
  }).catch(() => {
    resetGoodsScoreState()
  })
  getWishInfo(newId)
}

/* ===== 小程序分享逻辑 ===== */
onShareAppMessage(() => {
  return {
    title: goods.value.name || goods.value.goods_name || '商品详情',
    path: `/pages/goods/goods?goods_id=${currentId.value}`,
    imageUrl: goods.value.goods_images?.[0] || ''
  }
})

onShareTimeline(() => {
  return {
    title: goods.value.name || goods.value.goods_name || '商品详情',
    query: `goods_id=${currentId.value}`,
    imageUrl: goods.value.goods_images?.[0] || ''
  }
})

/* ===== 请求函数（全部支持传入 id） ===== */
function getGoods (id = currentId.value) {
  uni.request({
    url: websiteUrl.value + '/goods?id=' + id,
    method: 'GET',
    timeout: 5000,
    success: (res) => {
      goods.value = res.data.data || {}
      console.log('【商品】详情加载完成：id=', id, ' name=', goods.value.name)
      loadGoodsContributionPage(1)
      getWishInfo(id)
      if (showFaceupSection.value) getFaceupList(id)
    },
    fail: () => uni.showToast({ title: '网络请求失败', icon: 'none' }),
    complete: () => uni.hideLoading()
  })
}

function getHasLike (id = currentId.value) {
  const token = uni.getStorageSync('token')
  if (!token) return
  uni.request({
    url: websiteUrl.value + '/with-state/hasLike?id=' + id + '&type=1',
    method: 'POST',
    header: { Authorization: token },
    success: (res) => {
      if (res.data.status === 'success') {
        hasLike.value = res.data.data.id > 0
      }
    }
  })
}

function getWishInfo (id = currentId.value) {
  const token = uni.getStorageSync('token')
  uni.request({
    url: websiteUrl.value + '/with-state/wish-info?goods_id=' + id,
    method: 'GET',
    header: token ? { Authorization: token } : {},
    success: (res) => {
      if (res.data.status === 'success') {
        hasWish.value = res.data.data.user_has_wished
        wishCount.value = res.data.data.wish_count
      }
    }
  })
}

function getCollocation (id = currentId.value) {
  uni.request({
    url: websiteUrl.value + '/goods-collocation?goods_id=' + id,
    method: 'GET',
    timeout: 5000,
    success: (res) => { collocationList.value = res.data.data },
    fail: () => uni.showToast({ title: '网络请求失败', icon: 'none' })
  })
}

const getFaceupList = async (id = currentId.value) => {
  if (!showFaceupSection.value) return
  faceupLoading.value = true
  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/rand-bjd-faceup?goods_id=${id}`,
      method: 'GET',
      timeout: 5000
    })
    if (res.data.status === 'success') {
      faceupList.value = res.data.data || []
    } else {
      uni.showToast({ title: res.data.msg || '获取妆图失败', icon: 'none' })
    }
  } catch {
    uni.showToast({ title: '网络请求失败', icon: 'none' })
  } finally {
    faceupLoading.value = false
  }
}
const refreshFaceupList = () => { if (!faceupLoading.value) getFaceupList() }
const getFirstImage = (s) => (s ? s.split(',')[0].trim() : '')
function jump2faceup (id) { uni.navigateTo({ url: '/pkg-common/artwork/artwork?id=' + id }) }

/* ===== 其它交互 ===== */
const groupedSizes = computed(() => {
  if (!goods.value.sizes || goods.value.sizes.length === 0) return []
  const groups = {}
  goods.value.sizes.forEach(i => {
    const cat = String(i.goods_size || '').trim()
    const detail = String(i.size_detail || '').trim()
    if (!cat) return
    if (!groups[cat]) groups[cat] = []
    if (detail && !groups[cat].includes(detail)) groups[cat].push(detail)
  })
  return Object.keys(groups).map(category => ({
    category,
    details: groups[category]
  }))
})

function onImageLoad (index) {
  const query = uni.createSelectorQuery()
  setTimeout(() => {
    query.select(`.swiper-image-${index}`).boundingClientRect(rect => {
      if (!rect) return
      imageHeights.value[index] = rect.height
      const valid = imageHeights.value.filter(h => h > 0)
      if (!valid.length) return
      const h = Math.max(...valid)
      swiperHeight.value = Math.min(h, maxHeight.value)
    }).exec()
  }, 20)
}
function jumpBrand (id) {
  uni.navigateTo({ url: '/pages/brand/brand?brand_id=' + id })
}
function onChange (e) { swiperIndex.value = e.detail.current + 1 }

function formatNumber (n) {
  if (!n || n < 0) return '0'
  if (n < 1000) return '' + n
  const k = Math.floor(n / 1000)
  return `${k}k+`
}

function isFuzzySaleMessage (sale) {
  const precise = Number(sale?.is_precise_msg)
  if (!Number.isNaN(precise) && precise === 1) return false

  const fuzzyType = Number(sale?.fuzzy_time_type || 0)
  if (fuzzyType > 0) return true
  if (String(sale?.display_price || sale?.fuzzy_price || '').trim()) return true
  const displayTime = String(sale?.display_time || '').trim()
  return /预计|待定|未定|上旬|中旬|下旬|年初|年中|年末/.test(displayTime)
}

function getSaleStartDisplay (sale) {
  if (!isFuzzySaleMessage(sale)) return formatTimestamp(sale?.sub_time)
  const display = String(sale?.display_time || '').trim()
  if (display) return display
  const ts = Number(sale?.sub_time || 0)
  return ts > 0 ? `预计 ${formatTimestamp(ts)}` : '时间待定'
}

function showSaleEndDisplay (sale) {
  return !isFuzzySaleMessage(sale) && Number(sale?.sub_time_end || 0) > 0
}

function getSalePriceDisplay (sale) {
  const display = String(sale?.display_price || sale?.fuzzy_price || '').trim()
  if (display) return display
  const total = Number(sale?.sub_amount || 0) + Number(sale?.fin_amount || 0)
  if (total > 0) {
    const currency = String(sale?.currency || '').trim()
    return currency ? `${total} ${currency}` : String(total)
  }
  return '待定'
}

function formatTimestamp (ts) {
  if (!ts || ts <= 0) return '未知'
  const d = new Date(ts * 1000)
  const p = n => ('' + n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

function viewFullImage (i) {
  const urls = goods.value.goods_images || []
  if (urls.length) {
    uni.previewImage({ current: urls[i], urls })
  }
}

function likeFn () {
  const id = parseInt(currentId.value)
  const token = uni.getStorageSync('token')
  if (!global.isLogin) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  const requestData = { id, type: 1 }
  const url = hasLike.value ? '/with-state/unlike' : '/with-state/add-like'
  uni.request({
    url: websiteUrl.value + url,
    method: 'POST',
    header: { Authorization: token },
    data: requestData,
    success: (res) => {
      if (res.data.status === 'success') {
        uni.showToast({ title: '操作成功', icon: 'success' })
        hasLike.value = !hasLike.value
        getHasLike(id)
        getGoods(id)
      } else {
        uni.showToast({ title: res.data.msg, icon: 'none' })
      }
    },
    fail: () => uni.showToast({ title: '网络请求失败', icon: 'none' })
  })
}

function jump2collocation () {
  const id = currentId.value
  uni.navigateTo({
    url:
      '/pages/collocation/collocation?goods_id=' +
      id +
      '&brand_id=' +
      goods.value.brand_id +
      '&goods_name=' +
      goods.value.name +
      '&brand_name=' +
      goods.value.brand_name +
      '&type=' +
      goods.value.type
  })
}
function jump2collectionDetail (id, origin) {
  uni.navigateTo({
    url:
      '/pages/collocation_share/collocation_share?collocation_id=' +
      id +
      '&origin=' +
      origin
  })
}
function getImageForList (s) {
  if (!s) return ''
  return s.split(',')[0].trim()
}
function wishResale () {
  if (wishLoading.value) return
  const token = uni.getStorageSync('token')
  if (!global.isLogin) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  wishLoading.value = true
  uni.request({
    url: websiteUrl.value + '/with-state/wish-restock',
    method: 'POST',
    header: { Authorization: token, 'Content-Type': 'application/json' },
    data: { goods_id: parseInt(currentId.value) },
    success: (res) => {
      if (res.data.status === 'success') {
        uni.showToast({ title: '许愿成功', icon: 'success' })
        hasWish.value = true
        wishCount.value = res.data.data.wish_count || wishCount.value + 1
      } else {
        uni.showToast({ title: res.data.msg || '许愿失败', icon: 'none' })
      }
    },
    fail: () => uni.showToast({ title: '网络请求失败', icon: 'none' }),
    complete: () => { wishLoading.value = false }
  })
}

async function openPriceSupplementModal () {
  if (!global.isLogin) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  resetPriceSupplementForm()
  await ensureSupplementMetaLoaded()
  priceSupplementVisible.value = true
}

function showPendingPriceTip () {
  uni.showToast({ title: '该价格由用户补充，可能不准确', icon: 'none' })
}

function submitPriceSupplement () {
  if (priceSupplementSubmitting.value) return

  const token = uni.getStorageSync('token')
  if (!token || !global.isLogin) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }

  const priceText = String(priceSupplementPriceInput.value || '').trim()
  let price = 0
  if (priceText) {
    price = parseInt(priceText, 10)
    if (!price || price <= 0) {
      uni.showToast({ title: '请输入正确的整数价格', icon: 'none' })
      return
    }
  }

  const payload = {
    goods_id: parseInt(currentId.value),
    price,
    currency: (priceSupplementCurrencyInput.value || '').trim(),
    head_circumference: (priceSupplementHeadCircumferenceInput.value || '').trim(),
    neck_circumference: (priceSupplementNeckCircumferenceInput.value || '').trim(),
    socket_sizes: [...priceSupplementSocketSelections.value],
    eye_recommendations: [...priceSupplementEyeSelections.value],
    doll_material: (priceSupplementDollMaterialInput.value || '').trim(),
    skin: (priceSupplementSkinInput.value || '').trim(),
    size_category: (priceSupplementSizeCategoryInput.value || '').trim(),
    size_details: [...priceSupplementSizeDetailSelections.value],
    image_urls: [...priceSupplementImageList.value],
    reason: (priceSupplementReasonInput.value || '').trim(),
    screenshot_urls: [...priceSupplementScreenshotList.value]
  }
  const hasAnyField = Boolean(
    payload.price > 0 ||
    payload.head_circumference ||
    payload.neck_circumference ||
    payload.socket_sizes.length ||
    payload.eye_recommendations.length ||
    payload.doll_material ||
    payload.skin ||
    payload.size_category ||
    payload.size_details.length ||
    payload.image_urls.length
  )
  if (!hasAnyField) {
    uni.showToast({ title: '请至少补充一项信息', icon: 'none' })
    return
  }

  priceSupplementSubmitting.value = true
  uni.request({
    url: websiteUrl.value + '/with-state/goods/info-supplement/submit',
    method: 'POST',
    header: {
      Authorization: token,
      'Content-Type': 'application/json'
    },
    data: payload,
    success: (res) => {
      if (res.data.status === 'success') {
        uni.showToast({ title: '补充信息已提交审核', icon: 'success' })
        priceSupplementVisible.value = false
        getGoods(currentId.value)
      } else {
        uni.showToast({ title: res.data.msg || '提交失败', icon: 'none' })
      }
    },
    fail: () => uni.showToast({ title: '网络请求失败', icon: 'none' }),
    complete: () => { priceSupplementSubmitting.value = false }
  })
}

/* 评论相关 */
const handleReplyComment = ({ parent, target }) => {
  const item = target ?? parent
  if (replyForItem.value.id === item.id) {
    replyForItem.value = {}
    return
  }
  replyForItem.value = item
  commentInputRef.value?.focusInput()
}

const handleCommentSubmit = (submitData) => {
  const token = uni.getStorageSync('token')
  if (!global.isLogin) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }

  const requestData = {
    content: submitData.content,
    origin: submitData.origin,
    target_id: parseInt(currentId.value),
    type: 2,
    image_url: submitData.image_url || '',
    association_id: submitData.association_id || 0,
    association_type: submitData.association_type || 0,
    is_anonymous: submitData.is_anonymous || 0,
    ...(replyForItem.value.id && {
      reply_id: replyForItem.value.id,
      reply_for: replyForItem.value.comment,
      reply_uid: replyForItem.value.user_id,
      parent_id:
        replyForItem.value.parent_id > 0
          ? replyForItem.value.parent_id
          : replyForItem.value.id
    })
  }

  const tempComment = {
    id: Date.now(),
    content: submitData.content,
    created_at: Math.floor(Date.now() / 1000),
    like_count: 0,
    reply_count: 0,
    is_liked: false,
    floor: 0,
    ...(submitData.is_anonymous
      ? {
          avatar:
            'https://images1.fantuanpu.com/home/default_avatar.jpg',
          username: '匿名用户',
          is_anonymous: 1
        }
      : {
          avatar: global.userInfo.avatar,
          username: global.userInfo.nickname,
          is_anonymous: 0
        }),
    ...(submitData.association_id && {
      association_id: submitData.association_id,
      association_type: submitData.association_type
    }),
    ...(submitData.image_url && { image_url: submitData.image_url }),
    ...(replyForItem.value.id && {
      reply_id: replyForItem.value.id,
      reply_for: replyForItem.value.comment,
      reply_uid: replyForItem.value.user_id,
      parent_id:
        replyForItem.value.parent_id > 0
          ? replyForItem.value.parent_id
          : replyForItem.value.id,
      reply_username: replyForItem.value.is_anonymous
        ? '匿名用户'
        : replyForItem.value.username
    })
  }

  if (!replyForItem.value.id) {
    commentListRef.value?.addNewComment(tempComment)
  } else if (replyForItem.value.parent_id === 0) {
    commentListRef.value?.addReplyComment({
      ...tempComment,
      parent_id: replyForItem.value.id
    })
  } else {
    commentListRef.value?.addReplyComment({
      ...tempComment,
      parent_id: replyForItem.value.parent_id
    })
  }

  uni.request({
    url: websiteUrl.value + '/with-state/add-comment',
    method: 'POST',
    header: { Authorization: token },
    data: requestData,
    success: (res) => {
      if (res.data.status === 'success') {
        const newComment = res.data.data
        const finalComment = {
          ...newComment,
          ...(submitData.is_anonymous
            ? {
                avatar:
                  'https://images1.fantuanpu.com/home/default_avatar.jpg',
                username: '匿名用户',
                is_anonymous: 1
              }
            : {
                avatar: global.userInfo.avatar,
                username: global.userInfo.nickname,
                is_anonymous: 0
              })
        }
        if (newComment.reply_uid && replyForItem.value.is_anonymous) {
          finalComment.reply_username = '匿名用户'
        }
        commentListRef.value?.updateTempComment(tempComment.id, finalComment)
        uni.showToast({ title: '评论成功', icon: 'success' })
      } else {
        commentListRef.value?.removeTempComment(tempComment.id)
        uni.showToast({ title: res.data.msg, icon: 'none' })
      }
    },
    fail: () => {
      commentListRef.value?.removeTempComment(tempComment.id)
      uni.showToast({ title: '网络请求失败', icon: 'none' })
    }
  })
}

// 放入物品栏（分包）
function addToStock () {
  const gid = parseInt(currentId.value)
  if (!gid) {
    uni.showToast({ title: '缺少商品ID', icon: 'none' })
    return
  }
  uni.navigateTo({
    url:
      `/pkg-stock/stock/account_book_form/account_book_form?goods_id=${gid}`
  })
}

// 加入展示柜（分包）
function addToShowcase () {
  const g = goods.value || {}
  if (!g.id || !g.name || !g.brand_id || !g.brand_name || !g.type) {
    uni.showToast({ title: '商品信息不完整', icon: 'none' })
    return
  }
  const params = {
    goods_id: g.id,
    goods_name: g.name,
    brand_id: g.brand_id,
    brand_name: g.brand_name,
    type: g.type
  }
  const q = Object.keys(params)
    .map(k => `${k}=${params[k]}`)
    .join('&')
  uni.navigateTo({
    url: `/pkg-stock/stock/showcase_form/showcase_form?${q}`
  })
}

// 创建尾款账单（分包）
function createBill (sale) {
  const params = {
    amount: sale.fin_amount,
    currency: sale.currency,
    name: goods.value.name,
    sale_id: sale.id
  }
  const q = Object.keys(params)
    .map(k => `${k}=${params[k]}`)
    .join('&')
  uni.navigateTo({
    url: `/pkg-stock/stock/bill_form/bill_form?${q}`
  })
}

/* ===== 初始化/路由变化兜底 ===== */
onLoad((options = {}) => {
  const idFromLoad = options?.goods_id || props.goods_id
  console.log('【商品】onLoad，检测到ID=', idFromLoad)
  reloadById(idFromLoad, 'onLoad')
})

onShow(() => {
  const pages = getCurrentPages?.() || []
  const top = pages[pages.length - 1]
  const idFromRoute = top?.options?.goods_id
  const newId = String(idFromRoute || props.goods_id || '')
  console.log('路径ID' + newId)
  if (newId && newId !== lastGoodsId.value) {
    console.log(
      '【商品】onShow 检测到ID变更：',
      lastGoodsId.value,
      '→',
      newId
    )
    reloadById(newId, 'onShow')
  } else {
    console.log(
      '【商品】onShow，无ID变化，跳过拉取（当前=',
      lastGoodsId.value,
      '）'
    )
    getWishInfo(currentId.value)
    getHasLike(currentId.value)
    loadMyGoodsScore(currentId.value)
  }
})

watch(
  () => props.goods_id,
  (val, old) => {
    const v = String(val || '')
    const o = String(old || '')
    if (v && v !== o) {
      console.log('【商品】props.goods_id 变化：', o, '→', v)
      reloadById(v, 'watch props.goods_id')
    }
  }
)

/* ============ 占位：你项目里的原逻辑可继续往里加 =========== */
function selectType (typeText) {
  const type = String(typeText || '').trim()
  if (!type) return
  const categories = encodeURIComponent(type)
  uni.navigateTo({ url: `/pkg-common/search/result?categories=${categories}` })
}

function selectSize (sizeText) {
  const size = String(sizeText || '').trim()
  if (!size) return
  const sizes = encodeURIComponent(size)
  uni.navigateTo({ url: `/pkg-common/search/result?sizes=${sizes}` })
}
</script>

<style lang="scss" scoped>
/* 顶部返回的小胶囊（导航条左右插槽复用） */
.nav-back-pill{
  height: 56rpx;
  padding: 0 18rpx;
  border-radius: 33rpx;
  background: rgba(255,255,255,.72);
  border: 2rpx solid rgba(0,0,0,.10);
  display: flex; align-items: center; justify-content: center;
  margin-left: 20rpx;
}

.nav-title-ellipsis{
  max-width: 50vw;
  font-size: 30rpx;
  font-weight: 600;
  color: #000;
  overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
}

/* nav 右侧关注区 */
.nav-right-like{
  width: 68rpx;
  height: 56rpx;
  border-radius: 33rpx;
  background: rgba(255,255,255,0.85);
  border: 2rpx solid rgba(0,0,0,0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}
.nav-like-icon{
  width: 38rpx;
  height: 38rpx;
}

.goods-detail-container {
  background-color: #f8f8f8;
  padding-bottom: 20px;
  font-size: 24rpx;
}

/* 顶部占位：安全距离 + 导航条高度，带波点背景 */
.swiper-safe-bg{
  width: 100%;
  background: #ffffff;
  background-image: radial-gradient(#c6c6c6 15%, #0000 0);
  background-size: 20rpx 20rpx;
}

/* 轮播图：不再用 margin-top，直接贴着 safe-bg 下方 */
.swiper-container {
  position: relative;
  background-color: #fff;
  border-radius: 0 0 20rpx 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
}
.banner-swiper { width: 100%; }
.swiper-item-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #ffffff;
  background-image: radial-gradient(#c6c6c6 15%, #0000 0);
  background-size: 20rpx 20rpx;
}
.swiper-item {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}
.swiper-index {
  position: absolute;
  bottom: 30rpx;
  right: 30rpx;
  background: rgba(0,0,0,0.4);
  padding: 6rpx 20rpx;
  border-radius: 30rpx;
  color: #fff;
  font-size: 24rpx;
}

/* 商品信息 */
.goods-info {
  background: #fff;
  border-radius: 20rpx;
  margin: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
  .info-item {
    display: flex;
    padding: 18rpx 0;
    border-bottom: none;
  }
  .label {
    width: 180rpx;
    font-size: 26rpx;
    color: #999;
    flex-shrink: 0;
  }
  .value {
    flex: 1;
    font-size: 26rpx;
    color: #333;
    word-break: break-all;
  }
  .brand { color: #64c6dc; font-weight: bold; }
}

.info-item-price{
  align-items: flex-start;
}

.price-value-wrap{
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10rpx;
}

.price-empty-wrap{
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.price-empty-text{
  color: #8b95a1;
}

.price-supplement-btn{
  margin: 0;
  padding: 0 22rpx;
  height: 56rpx;
  line-height: 56rpx;
  font-size: 22rpx;
  color: #fff;
  border-radius: 12rpx;
  background: var(--app-recommend-color);
  border: none;
}
.price-supplement-btn::after{
  border: none;
}

.supplement-entry-card{
  margin: 12rpx 20rpx 0;
  padding: 26rpx 28rpx;
  background: #ffffff;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  box-shadow: 0 4rpx 14rpx rgba(71, 93, 126, 0.05);
}
.supplement-entry-copy{
  min-width: 0;
  flex: 1;
}
.supplement-entry-title{
  display: block;
  font-size: 30rpx;
  color: #243047;
}
.supplement-entry-desc{
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.6;
  color: #7b8797;
}
.info-supplement-btn{
  flex-shrink: 0;
  margin: 0;
  min-width: 172rpx;
  height: 74rpx;
  line-height: 74rpx;
  padding: 0 22rpx;
  border-radius: 10rpx;
  background: var(--app-recommend-color);
  color: #fff;
  font-size: 28rpx;
}
.info-supplement-btn::after{
  border: none;
}

.price-note{
  display: flex;
  align-items: center;
  max-width: 100%;
  padding: 10rpx 14rpx;
  border-radius: 14rpx;
  box-sizing: border-box;
}
.price-note.pending{
  background: #f2f6fb;
}
.price-note.approved{
  background: #eefaf7;
  padding-right: 16rpx;
}
.price-note-text{
  font-size: 22rpx;
  color: #667487;
  line-height: 1.45;
}
.price-user-avatar{
  width: 34rpx;
  height: 34rpx;
  border-radius: 50%;
  margin-right: 10rpx;
  flex-shrink: 0;
}

.price-supplement-modal{
  width: 100%;
  background: #fff;
  border-radius: 26rpx;
  padding: 34rpx 30rpx 42rpx;
  padding-bottom: calc(42rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(42rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}
.price-supplement-title{
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #243047;
}
.price-supplement-desc{
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #7e8795;
  line-height: 1.5;
}
.price-supplement-input{
  width: 100%;
  height: 82rpx;
  background: #f7f9fc;
  border-radius: 16rpx;
  border: 1rpx solid #e6ebf2;
  padding: 0 24rpx;
  box-sizing: border-box;
  font-size: 28rpx;
  color: #2b3650;
}
.price-supplement-grid{
  margin-top: 20rpx;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18rpx;
}
.supplement-field{
  margin-top: 20rpx;
}
.supplement-field-head{
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}
.supplement-field-label{
  display: block;
  margin-bottom: 10rpx;
  font-size: 22rpx;
  color: #73829a;
}
.supplement-current-text{
  flex-shrink: 0;
  font-size: 22rpx;
  color: #9ca9bb;
}
.price-supplement-grid .supplement-field{
  margin-top: 0;
}
.supplement-field-tip{
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  line-height: 1.5;
  color: #93a0b2;
}
.supplement-picker-trigger{
  min-height: 82rpx;
  padding: 0 24rpx;
  border-radius: 16rpx;
  background: #f7f9fc;
  border: 1rpx solid #e6ebf2;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  font-size: 28rpx;
  color: #2b3650;
}
.supplement-picker-trigger.placeholder{
  color: #a3adba;
}
.supplement-chip-group{
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
}
.supplement-chip{
  min-width: 92rpx;
  height: 60rpx;
  padding: 0 20rpx;
  border-radius: 999rpx;
  background: #f4f7fb;
  border: 1rpx solid #e4ebf4;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #5d6b80;
}
.supplement-chip.active{
  background: rgba(73, 202, 238, 0.16);
  border-color: rgba(73, 202, 238, 0.42);
  color: #1f7590;
}
.supplement-uploader{
  margin-top: 22rpx;
  padding: 22rpx;
  border-radius: 20rpx;
  background: #f7fafe;
  border: 1rpx solid #e5edf7;
}
.supplement-uploader-head{
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}
.supplement-upload-btn{
  margin: 0;
  height: 60rpx;
  line-height: 60rpx;
  padding: 0 20rpx;
  border-radius: 14rpx;
  font-size: 24rpx;
  background: var(--app-recommend-color);
  color: #fff;
}
.supplement-upload-btn.is-light{
  background: #eaf6fb;
  color: #3c5b77;
}
.supplement-upload-btn::after{
  border: none;
}
.supplement-preview-scroll{
  margin-top: 14rpx;
  white-space: nowrap;
}
.supplement-preview-row{
  display: inline-flex;
  gap: 16rpx;
}
.supplement-preview-item{
  position: relative;
  width: 150rpx;
  height: 150rpx;
  border-radius: 18rpx;
  overflow: hidden;
  flex-shrink: 0;
  background: #eef3f8;
}
.supplement-preview-image{
  width: 100%;
  height: 100%;
}
.supplement-preview-remove{
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.58);
  color: #fff;
  font-size: 24rpx;
  line-height: 36rpx;
  text-align: center;
}
.price-supplement-textarea{
  width: 100%;
  min-height: 176rpx;
  padding: 22rpx 24rpx;
  background: #f7f9fc;
  border-radius: 16rpx;
  border: 1rpx solid #e6ebf2;
  box-sizing: border-box;
  font-size: 28rpx;
  line-height: 1.6;
  color: #2b3650;
}
.price-placeholder{
  color: #a3adba;
}
.price-supplement-actions{
  margin-top: 30rpx;
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
}
.price-supplement-cancel,
.price-supplement-confirm{
  flex: 1;
  margin: 0;
  height: 78rpx;
  line-height: 78rpx;
  border-radius: 39rpx;
  font-size: 28rpx;
}
.price-supplement-cancel{
  background: #f3f4f7;
  color: #56637a;
}
.price-supplement-confirm{
  background: var(--app-recommend-color);
  color: #fff;
}
.price-supplement-cancel::after,
.price-supplement-confirm::after{
  border: none;
}

.contribution-section{
  background:#fff;
  border-radius:20rpx;
  margin:20rpx;
  padding:30rpx;
  box-shadow:0 4rpx 12rpx rgba(0,0,0,0.05);
}
.contribution-section-head{
  margin-bottom: 6rpx;
}
.contribution-count{
  font-size: 24rpx;
  color: #8d9caf;
}
.contribution-loading{
  padding: 24rpx 0 4rpx;
  text-align: center;
  color: #97a5b8;
  font-size: 22rpx;
}
.contribution-card{
  margin-top: 24rpx;
  padding: 24rpx;
  border-radius: 20rpx;
  background: #f8fbff;
}
.contribution-user-row{
  display: flex;
  align-items: flex-start;
  gap: 18rpx;
}
.contribution-avatar{
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  flex-shrink: 0;
}
.contribution-user-main{
  min-width: 0;
  flex: 1;
}
.contribution-user-top{
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}
.contribution-name{
  min-width: 0;
  flex: 1;
  font-size: 28rpx;
  color: #243047;
}
.contribution-time{
  flex-shrink: 0;
  font-size: 22rpx;
  color: #91a0b5;
}
.contribution-summary{
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  line-height: 1.5;
  color: #5f6f85;
}
.contribution-item-list{
  margin-top: 18rpx;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}
.contribution-item{
  display: flex;
  align-items: flex-start;
  gap: 14rpx;
}
.contribution-item-label{
  flex-shrink: 0;
  min-width: 110rpx;
  font-size: 22rpx;
  color: #9ca9bb;
}
.contribution-item-value{
  flex: 1;
  font-size: 24rpx;
  line-height: 1.6;
  color: #384960;
}
.contribution-reason{
  margin-top: 18rpx;
  padding: 18rpx 20rpx;
  border-radius: 16rpx;
  background: rgba(73, 202, 238, 0.08);
}
.contribution-reason-label{
  display: block;
  font-size: 22rpx;
  color: #7f8ea6;
}
.contribution-reason-text{
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  line-height: 1.6;
  color: #3d4c62;
}
.contribution-image-wrap{
  margin-top: 18rpx;
}
.contribution-media-title{
  display: block;
  margin-bottom: 12rpx;
  font-size: 22rpx;
  color: #7f8ea6;
}
.contribution-image-scroll{
  white-space: nowrap;
}
.contribution-image-row{
  display: inline-flex;
  gap: 14rpx;
}
.contribution-image{
  width: 152rpx;
  height: 152rpx;
  border-radius: 18rpx;
  flex-shrink: 0;
  background: #eef3f8;
}
.contribution-proof-image{
  width: 120rpx;
  height: 152rpx;
}
.contribution-pager{
  margin-top: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18rpx;
}
.contribution-page-btn{
  min-width: 140rpx;
  height: 60rpx;
  line-height: 60rpx;
  margin: 0;
  padding: 0 24rpx;
  border-radius: 999rpx;
  background: #f2f5f9;
  color: #5a6780;
  font-size: 24rpx;
}
.contribution-page-btn.is-primary{
  background: rgba(73, 202, 238, 0.16);
  color: #17728d;
}
.contribution-page-btn[disabled]{
  opacity: 0.45;
}
.contribution-page-btn::after{
  border: none;
}
.contribution-page-index{
  font-size: 24rpx;
  color: #93a1b4;
}

/* 贩售情报 */
.sales-info,
.no-sales {
  background:#fff;
  border-radius:20rpx;
  margin:20rpx;
  padding:30rpx;
  box-shadow:0 4rpx 12rpx rgba(0,0,0,0.05);
  .section-title {
    display:block;
    font-size:28rpx;
    font-weight:bold;
    color:#5f6e83;
    margin-bottom:25rpx;
    padding-left:10rpx;
    border-left:8rpx solid #5f6e83;
  }
}
.sales-list {
  .sale-item {
    padding:20rpx 0;
    border-bottom: 1rpx solid #f5f5f5;
    &:last-child{border-bottom:none;}
  }
  .sale-header {
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin-bottom:12rpx;
  }
  .sale-type-wrap {
    display: flex;
    align-items: center;
    gap: 10rpx;
    min-width: 0;
  }
  .sale-type {
    font-size:26rpx;
    font-weight:bold;
    color:#333;
    background:#f0f9ff;
    padding:5rpx 12rpx;
    border-radius:8rpx;
  }
  .sale-fuzzy-tag {
    font-size: 20rpx;
    color: #fff;
    background: linear-gradient(90deg, rgba(241,153,74,.95), rgba(241,153,74,.72));
    border-radius: 999rpx;
    padding: 4rpx 12rpx;
    line-height: 1.2;
    white-space: nowrap;
  }
  .sale-price {
    font-size:26rpx;
    font-weight:bold;
    color:#ff6b6b;
  }
  .sale-period {
    display:flex;
    align-items:center;
    font-size:24rpx;
    color:#666;
    margin-bottom:12rpx;
    .separator { margin:0 12rpx; color:#ccc; }
  }
  .sale-size {
    font-size:24rpx;
    color:#888;
  }
}
.bill-action {
  display:flex;
  align-items:center;
  justify-content:flex-end;
  margin-top:15rpx;
  padding-top:15rpx;
  border-top:1rpx dashed #eee;
  text {
    font-size:24rpx;
    color:#64c6dc;
    margin-left:8rpx;
  }
  &:active { opacity:.7; }
}
.sale-item { padding:20rpx 0 15rpx; }
.empty-text {
  font-size:26rpx;
  color:#999;
  text-align:center;
  padding:30rpx 0;
  display:block;
}

/* 搭配参考 */
.collocation-section {
  background:#fff;
  border-radius:20rpx;
  margin:20rpx;
  padding:30rpx;
  box-shadow:0 4rpx 12rpx rgba(0,0,0,0.05);
  .section-header {
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin-bottom:25rpx;
  }
  .section-title {
    font-size:28rpx;
    font-weight:bold;
    color:#5f6e83;
  }
  .more-link {
    display:flex;
    align-items:center;
    color:#888;
    font-size:24rpx;
    image{
      width:25rpx;
      height:25rpx;
      margin-left:8rpx;
    }
  }
  .collocation-list {
    width:100%;
    white-space:nowrap;
    margin-top:15rpx;
    padding:8rpx 0;
  }
  .collocation-item {
    display:inline-block;
    width:200rpx;
    height:280rpx;
    border-radius:12rpx;
    overflow:hidden;
    margin-right:18rpx;
    box-shadow:0 4rpx 12rpx rgba(0,0,0,0.1);
    image{
      width:100%;
      height:100%;
    }
  }
  .upload-collocation {
    display:flex;
    align-items:center;
    justify-content:center;
    border:1rpx solid #eaeaea;
    border-radius:15rpx;
    padding:18rpx;
    margin-top:25rpx;
    text{
      color:#b8b8b8;
      font-size:24rpx;
    }
  }
}

/* 妆图展示 */
.faceup-section {
  background:#fff;
  border-radius:20rpx;
  margin:20rpx;
  padding:30rpx;
  box-shadow:0 4rpx 12rpx rgba(0,0,0,0.05);
  .section-header{
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin-bottom:25rpx;
  }
  .section-title{
    font-size:28rpx;
    font-weight:bold;
    color:#5f6e83;
    padding-left:10rpx;
    border-left:8rpx solid #5f6e83;
  }
  .refresh-btn{
    display:flex;
    align-items:center;
    padding:8rpx 16rpx;
    border-radius:30rpx;
    background:#eff6ff;
  }
  .refresh-text{
    color:#64c6dc;
    font-size:24rpx;
  }
  .refresh-btn.loading{ opacity:.6; }

  .faceup-grid{
    display:flex;
    flex-wrap:wrap;
    justify-content:space-between;
    row-gap:20rpx;
  }
  .faceup-card{
    width:48.5%;
    border-radius:12rpx;
    overflow:hidden;
    box-shadow:0 4rpx 12rpx rgba(0,0,0,.1);
    background:#fff;
  }
  .faceup-cover{
    width:100%;
    height:320rpx;
    display:block;
  }
  .faceup-title{
    padding:12rpx 14rpx;
    font-size:24rpx;
    color:#333;
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
    border-top:1rpx solid #f2f2f2;
  }
  .faceup-empty{
    text-align:center;
    color:#aaa;
    font-size:24rpx;
    padding-top:10rpx;
  }
}

/* 评论区 */
.comment-section {
  background:#fff;
  border-radius:20rpx;
  margin:20rpx;
  box-shadow:0 4rpx 12rpx rgba(0,0,0,0.05);
  font-size:24rpx;
}

/* 底部占位 */
.bottom-placeholder{
  width:100%;
  height:120rpx;
}
.img_info{
  height:42rpx;
  position:relative;
  left:-5rpx;
}

/* 互动区：物品栏 / 再贩 / 展示柜 / 评分 */
.engage-panel{
  margin: 8rpx 0 22rpx;
  padding: 12rpx;
  border-radius: 22rpx;
  background: #f8fafd;
}
.quick-actions{
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8rpx;
}
.quick-btn{
  min-height: 74rpx;
  border-radius: 12rpx;
  padding: 8rpx 4rpx;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  box-sizing: border-box;
  border: 1rpx solid #e6ebf2;
  background: #f2f5f9;
}
.quick-btn-stock{
  background: #eef3f8;
}
.quick-btn-wish{
  background: #f6f1ec;
}
.quick-btn-showcase{
  background: #f0f1f7;
}
.quick-btn-want{
  background: linear-gradient(180deg, #fff2f7 0%, #fbeaf1 100%);
  border-color: #f2c6d6;
}
.quick-want-bubble{
  position: absolute;
  left: 50%;
  top: -50rpx;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #fff9d8 0%, #ffe9f4 55%, #e8f4ff 100%);
  color: #5a4169;
  border: 1rpx solid #f5d3e2;
  border-radius: 999rpx;
  padding: 6rpx 18rpx;
  font-size: 17rpx;
  font-weight: 600;
  letter-spacing: 0.6rpx;
  line-height: 1.35;
  white-space: nowrap;
  box-shadow:
    0 8rpx 20rpx rgba(226, 130, 171, 0.26),
    0 0 0 3rpx rgba(255, 242, 248, 0.8);
  z-index: 4;
  animation: quickWantBubbleFloat 1.9s ease-in-out infinite, quickWantBubbleGlow 2.4s ease-in-out infinite;
}
.quick-want-bubble::before{
  content: 'NEW';
  position: absolute;
  top: -14rpx;
  right: -10rpx;
  height: 24rpx;
  line-height: 24rpx;
  padding: 0 8rpx;
  border-radius: 999rpx;
  background: #ff7ea6;
  color: #fff;
  font-size: 13rpx;
  font-weight: 700;
  box-shadow: 0 4rpx 10rpx rgba(255, 126, 166, 0.35);
}
.quick-want-bubble::after{
  content: '';
  position: absolute;
  left: 50%;
  bottom: -9rpx;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8rpx solid transparent;
  border-right: 8rpx solid transparent;
  border-top: 10rpx solid #ffeef6;
}
.quick-like-icon{
  width: 24rpx;
  height: 24rpx;
}
.quick-btn-text{
  font-size: 19rpx;
  color: #4d5b6f;
  line-height: 1.1;
}
.quick-btn-badge{
  position: absolute;
  top: 6rpx;
  right: 6rpx;
  min-width: 28rpx;
  padding: 0 8rpx;
  height: 28rpx;
  border-radius: 999rpx;
  background: #ecd6bf;
  color: #735943;
  font-size: 15rpx;
  line-height: 28rpx;
  text-align: center;
}
@keyframes quickWantBubbleFloat {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-6rpx); }
}
@keyframes quickWantBubbleGlow {
  0%, 100% {
    box-shadow:
      0 8rpx 20rpx rgba(226, 130, 171, 0.26),
      0 0 0 3rpx rgba(255, 242, 248, 0.8);
  }
  50% {
    box-shadow:
      0 10rpx 24rpx rgba(226, 130, 171, 0.34),
      0 0 0 6rpx rgba(255, 236, 245, 0.55);
  }
}

.avg-score-box{
  margin-top: 10rpx;
  border-radius: 12rpx;
  background: #ffffff;
  border: 1rpx solid #edf1f6;
  padding: 8rpx 10rpx;
}
.avg-score-main{
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.avg-score-title{
  font-size: 20rpx;
  color: #556378;
}
.avg-score-overall{
  font-size: 22rpx;
  color: #35445a;
}
.avg-score-detail{
  margin-top: 6rpx;
  display: flex;
  gap: 6rpx;
  flex-wrap: wrap;
}
.avg-chip{
  font-size: 18rpx;
  color: #6f7c8f;
  background: #f6f8fb;
  border-radius: 999rpx;
  padding: 4rpx 8rpx;
}

.want-modal{
  width: 100%;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx 24rpx 26rpx;
  box-sizing: border-box;
}
.want-modal-title{
  display: block;
  font-size: 28rpx;
  color: #2d3950;
  font-weight: 700;
}
.want-modal-sub{
  margin-top: 10rpx;
  display: block;
  font-size: 21rpx;
  color: #8591a3;
}
.want-score-row{
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 14rpx 0;
  border-bottom: 1rpx solid #eef2f7;
}
.want-score-row:first-of-type{
  margin-top: 10rpx;
}
.want-score-label{
  width: 78rpx;
  font-size: 24rpx;
  color: #4c5b72;
}
.want-rate-wrap{
  flex: 1;
  min-width: 0;
}
.want-score-val{
  margin-left: 2rpx;
  width: 64rpx;
  text-align: right;
  font-size: 22rpx;
  color: #66788f;
}
.want-comment-input{
  margin-top: 20rpx;
  width: 100%;
  min-height: 132rpx;
  padding: 16rpx 18rpx;
  box-sizing: border-box;
  border-radius: 12rpx;
  background: #f8f9fc;
  border: 1rpx solid #edf1f6;
  font-size: 23rpx;
  color: #37465d;
}
.want-comment-ph{
  color: #9eabba;
}
.want-actions{
  margin-top: 20rpx;
  display: flex;
  justify-content: flex-end;
  gap: 12rpx;
}
.want-cancel-btn,
.want-submit-btn{
  margin: 0;
  min-width: 138rpx;
  height: 56rpx;
  line-height: 56rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
}
.want-cancel-btn{
  background: #eef2f7;
  color: #617188;
}
.want-submit-btn{
  background: #27364f;
  color: #fff;
}
.want-cancel-btn::after,
.want-submit-btn::after{
  border: none;
}
.want-submit-btn[disabled]{
  opacity: .45;
}

.goods-info{
  margin-bottom:10rpx;
  .info-item:first-child{ padding-top:10rpx; }
}

/* 尺寸分组 */
.size-group { margin-bottom: 8rpx; }
.size-category {
  font-weight: bold;
  color: #333;
}
.size-details { color: #666; }
.size-detail-list {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
}
.size-detail-list .size-details + .size-details::before {
  content: '、';
  color: #8ea0b3;
  margin: 0 4rpx;
}
.size-fallback {
  display: inline-flex;
  align-items: center;
}
.size-separator {
  color: #8ea0b3;
}
.size-clickable {
  color: #4d7fa8;
  text-decoration: underline;
  text-decoration-color: rgba(77, 127, 168, 0.45);
}

/* 实底态的品牌图片（与 .img_info 视觉一致：蓝底+内边距） */
.nav-brand-wrap{
  background: rgb(169 231 255);
  padding: 0 20rpx;
  border-radius: 10rpx;
  display: inline-flex; align-items: center; height: 42rpx;
}
.nav-brand-img{ height: 42rpx; display: block; }
.nav-brand-name{
  font-size: 28rpx; font-weight: 600; color: #333;
  background: rgb(169 231 255); padding: 0 16rpx; border-radius: 10rpx;
}
</style>
