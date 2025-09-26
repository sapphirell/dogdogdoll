<template>
  <view>
    <meta name="theme-color" content="#F8F8F8">
      <view-logs />
    </meta>

    <view v-if="!isEditable" class="edit-tip">
      <text>当前状态不可编辑</text>
    </view>

    <!-- 上传图片列表 -->
    <view style="width: 100%;overflow: hidden;">
      <scroll-view scroll-x="true" class="upload_box" ll-with-animation="true" :show-scrollbar="false">
        <view class="upload_item" v-for="(item, index) in uploadList" :key="index">
          <image :src="item" class="uploaded_image" @tap="viewFullImage(index)" mode="aspectFill" />
          <image v-if="isEditable" src="/static/cancel.png" class="close_icon" @tap="deleteImage(index)" />
        </view>

        <view class="uploadImageBox" style="background: #f8f8f8;" v-if="isEditable">
          <image
            src="/static/add2.png"
            class="upload_img"
            @tap="selectImage"
            style="width: 50px;height: 50px;margin: 25px;"
          />
        </view>
      </scroll-view>
    </view>

    <!-- 标题 -->
    <input
      v-model="name"
      type="text"
      :disabled="!isEditable"
      placeholder="请输入标题"
      style="padding: 10px;margin: 20px 15px 5px 15px;display: block;"
    />
    <view class="oneLine"></view>

    <!-- 描述 -->
    <textarea
      v-model="description"
      :disabled="!isEditable"
      placeholder="请输入描述"
      style="padding: 10px;margin:10px 15px 5px 15px;display: block;line-height: 28px;width: calc(100% - 50px);"
    ></textarea>
    <view class="oneLine"></view>

    <!-- ===== 人物设定（说明文字） ===== -->
    <view class="section-subtitle">人物设定</view>

    <!-- ===== 档案字段（出生日期 / 性别 / 性格 ） ===== -->
    <view class="card-block">
      <!-- 出生日期 -->
      <view class="form-row" :class="{ disabled: !isEditable }">
        <text class="label">出生日期</text>
        <picker
          mode="date"
          :disabled="!isEditable"
          :value="birthDate"
          @change="e => (birthDate = e.detail.value)"
        >
          <view class="picker-value" :class="{ placeholder: !birthDate }">
            {{ birthDate || '请选择出生日期' }}
          </view>
        </picker>
      </view>

      <!-- 性别 -->
      <view class="form-row" :class="{ disabled: !isEditable }">
        <text class="label">性别</text>
        <picker
          mode="selector"
          :range="genderOptions"
          range-key="label"
          :value="genderIndex"
          :disabled="!isEditable"
          @change="onGenderChange"
        >
          <view class="picker-value" :class="{ placeholder: genderIndex === -1 }">
            {{ genderIndex === -1 ? '请选择性别' : genderOptions[genderIndex].label }}
          </view>
        </picker>
      </view>

      <!-- 性格 -->
      <view class="form-row textarea" :class="{ disabled: !isEditable }">
        <text class="label">性格</text>
        <textarea
          v-model="personality"
          :disabled="!isEditable"
          placeholder="设定中的性格"
          class="input textarea-input"
          :maxlength="200"
        ></textarea>
      </view>
    </view>

    <!-- ===== 妆师（使用 common-search） ===== -->
    <view class="card-block">
      <view class="form-row" :class="{ disabled: !isEditable }" style="border-bottom:none;">
        <text class="label">妆师</text>
        <view style="flex:1;">
          <!-- ① 关闭索引选择器；② 可选隐藏提示文案（组件端若未实现会被忽略） -->
          <common-search
            v-if="isEditable"
            mode="fill"
            :showIndexSelector="false"
            defaultIndex="bjd_artist"
            background="#f8f8f8"
            :hideHintText="true"
            @select="onArtistSelect"
            @close-associate="onArtistClose"
            class="artist-search"
          />
          <!-- 只读时展示 -->
          <view v-else class="readonly-row">
            <text class="readonly-name">{{ makeupArtist || '（未填写）' }}</text>
          </view>
          <view class="mini-hint">
            选中即填入ID；若没有匹配，点“关闭联想”
          </view>
        </view>
      </view>
    </view>

    <!-- 关联触发 -->
    <view>
      <view class="relation-trigger" v-if="isEditable" @tap="showRelationPicker">
        <text class="placeholder">点击关联娃物</text>
        <image src="/static/right2.png" class="arrow-icon" />
      </view>
    </view>

    <view class="publish-detail">
      <text>* 展示您的宝宝们。</text>
      <text>* 不关联商品的展示柜不会出现在广场中。</text>
    </view>

    <!-- 相关列表 -->
    <view class="saveCollocationDataList">
      <view v-for="(item, index) in saveCollocationDataList" :key="index">
        <view class="saveCollocationDataItem">
          <image v-if="item.goods_image" :src="item.goods_image" mode="aspectFill" style="width: 70px;height: 70px;"></image>
          <text v-else class="no-image">?</text>
          <text class="info-tap" style="width: calc(100% - 120px);display: inline-block;">
            {{item.type}} {{item.brand_name}} - {{item.goods_name}}
          </text>
          <image src="/static/cancel.png" v-if="isEditable" class="close_icon" @tap="deleteCollcation(index)" />
        </view>
      </view>
    </view>

    <relation-picker
      v-model:visible="showSelectTab"
      :typeList="typeList"
      :goodsList="goodsList"
      @confirm="handleRelationConfirm"
      @cancel="handleRelationCancel"
    />

    <!-- ===== 底部操作（贴右） ===== -->
    <view class="footer">
      <text
        v-if="showDelete"
        class="delete-link"
        @tap="handleDelete"
      >删除</text>
      <button class="publish-btn" @click="submitForm">发表</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import {
  websiteUrl,
  image1Url,
  getScene,
} from "../../../common/config.js";
import {
  getQiniuToken,
  uploadImageToQiniu,
  chooseImageList,
} from "../../../common/image.js";

// 接收参数
const props = defineProps(["showcase_id"]);

const uploadList = ref([]);
const goodsList = ref([]);
const typeList = ref([]);
const showSelectTab = ref(false);

// ===== 档案字段 =====
const birthDate = ref("");                  // YYYY-MM-DD（前端展示用）
const gender = ref("");                     // 'male' | 'female' | 'other' | ''
const genderOptions = [
  { value: "male", label: "男" },
  { value: "female", label: "女" },
  { value: "other", label: "其他" },
];
const genderIndex = computed(() => {
  const idx = genderOptions.findIndex(g => g.value === gender.value);
  return idx >= 0 ? idx : -1;
});
const personality = ref("");                // 性格
const makeupArtist = ref("");               // 妆师名称
const makeupArtistBrandId = ref(0);         // 妆师品牌ID（选中填入；未命中=0）

// ===== 工具：性别/日期映射 =====
// 0=未知 1=男 2=女 3=其他
function toGenderInt(v) {
  if (!v) return undefined; // 不传则不更新
  switch (v) {
    case 'male': return 1;
    case 'female': return 2;
    case 'other': return 3;
    default: return 0;
  }
}
function toGenderStr(v) {
  if (v === 1) return 'male';
  if (v === 2) return 'female';
  if (v === 3) return 'other';
  return ''; // 未知或空 -> 不选
}
function dateToUnixSec(d) {
  if (!d) return undefined;
  const t = new Date(String(d).replace(/-/g, '/')); // iOS 兼容
  if (isNaN(t)) return undefined;
  return Math.floor(t.getTime() / 1000);
}
function unixSecToDate(s) {
  if (s === null || s === undefined) return "";
  const sec = Number(s);
  const ms = sec > 2147483647 ? sec : sec * 1000; // 兼容毫秒
  const d = new Date(ms);
  if (isNaN(d)) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const onGenderChange = (e) => {
  const idx = Number(e.detail.value);
  if (idx >= 0 && idx < genderOptions.length) {
    gender.value = genderOptions[idx].value;
  }
};

// 是否可编辑
const display = ref(-1); // 0=审核中
const isEditable = computed(() => [-1, 1, 3].includes(display.value));
const showDelete = computed(() => Number(props.showcase_id) > 0);

// 标题/正文
const name = ref("");
const description = ref("");

// 关联列表
const saveCollocationDataList = ref([]);

// ===== 商品信息 =====
function getGoodsInfo(id) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: websiteUrl.value + '/goods?id=' + id,
      method: 'GET',
      timeout: 5000,
      success: (res) => resolve(res.data),
      fail: (err) => {
        uni.showToast({ title: '网络请求失败', icon: 'none' });
        reject(err);
      },
      complete: () => uni.hideLoading()
    });
  });
}

// ===== 选择关联弹窗 =====
const handleRelationConfirm = (data) => {
  try {
    const relationData = {
      goods_id: data.goods.id || 0,
      goods_name: data.goods.name,
      goods_image: data.goods.image || '',
      brand_id: data.brand.id || 0,
      brand_name: data.brand.name || (data.isFuzzy ? '' : '未知品牌'),
      type: data.type || (data.isFuzzy ? '未知类型' : '')
    };
    const isExist = saveCollocationDataList.value.some(item =>
      (item.goods_id !== 0 && item.goods_id === relationData.goods_id) ||
      item.goods_name === relationData.goods_name
    );
    if (!isExist) {
      saveCollocationDataList.value.push(relationData);
    } else {
      uni.showToast({ title: '已存在相同关联项', icon: 'none' });
    }
  } catch (error) {
    uni.showToast({ title: '保存关联信息失败', icon: 'none' });
  }
};
const handleRelationCancel = () => {};
const showRelationPicker = () => { showSelectTab.value = true; };

// ===== 妆师搜索联动 =====
function onArtistSelect(id, name) {
  if (!isEditable.value) return;
  if (id && Number(id) > 0) {
    makeupArtistBrandId.value = Number(id);
    makeupArtist.value = name || "";
  } else {
    makeupArtist.value = name || "";
  }
}
function onArtistClose(currentInput) {
  if (!isEditable.value) return;
  makeupArtistBrandId.value = 0; // 关闭后ID清零
  makeupArtist.value = (currentInput || "").trim();
}

// ===== 获取详情 =====
async function getShowCaseInfo() {
  if (!props.showcase_id) return;

  try {
    const res = await uni.request({
      url: `${websiteUrl.value}/with-state/showcase-detail?id=${props.showcase_id}`,
      method: 'GET',
      header: { 'Authorization': uni.getStorageSync('token') },
    });

    const data = res.data.data;

    name.value = data.name || "";
    description.value = data.description || "";
    display.value = data.display;

    // 图片
    uploadList.value = data.image_urls ? data.image_urls.split(',').filter(Boolean) : [];

    // 关联
    if (data.relations) {
      saveCollocationDataList.value = data.relations.map(r => ({
        goods_id: r.relation_goods_id,
        goods_name: r.relation_goods_name,
        brand_id: r.relation_brand_id,
        brand_name: r.relation_brand_name,
        type: r.type,
        goods_image: r.relation_goods_image
      }));
    }

    // 新增字段回填（对齐后端字段）
    birthDate.value = (data.birth_at !== undefined && data.birth_at !== null) ? unixSecToDate(data.birth_at) : "";
    gender.value = toGenderStr(data.gender);
    personality.value = data.personality || "";
    makeupArtist.value = data.makeup_artist || "";
    makeupArtistBrandId.value = data.makeup_artist_id ? Number(data.makeup_artist_id) : 0;

  } catch (err) {
    uni.showToast({ title: '加载失败', icon: 'none' });
  }
}

// 预览
function viewFullImage(index) {
  uni.previewImage({ current: uploadList.value[index], urls: uploadList.value });
}

// 选图上传
async function selectImage() {
  try {
    const imagePaths = await chooseImageList(9);
    for (const path of imagePaths) {
      const tokenData = await getQiniuToken();
      await uploadImageToQiniu(path, tokenData.token, tokenData.path);
      uploadList.value.push(image1Url + tokenData.path);
    }
    uni.showToast({ title: `成功上传${imagePaths.length}张图片`, icon: 'success' });
  } catch (error) {
    uni.showToast({ title: '部分图片上传失败', icon: 'none' });
  }
}

// 删除
async function handleDelete() {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个展示吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const resp = await uni.request({
            url: `${websiteUrl.value}/with-state/delete-showcase?id=${props.showcase_id}`,
            method: 'POST',
            header: { 'Authorization': uni.getStorageSync('token') }
          });
          if (resp.data.status === "success") {
            uni.showToast({ title: '删除成功' });
            setTimeout(() => uni.navigateBack(), 800);
          } else {
            uni.showToast({ title: resp.data.msg || '删除失败', icon: 'none' });
          }
        } catch (err) {
          uni.showToast({ title: '删除失败', icon: 'none' });
        }
      }
    }
  });
}

// 提交
async function submitForm() {
  const token = uni.getStorageSync('token');
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    return;
  }
  if (!name.value.trim()) {
    uni.showToast({ title: '名字不能为空', icon: 'none' });
    return;
  }
  if (!description.value.trim()) {
    uni.showToast({ title: '描述不能为空', icon: 'none' });
    return;
  }
  if (uploadList.value.length === 0) {
    uni.showToast({ title: '请至少上传一张图片', icon: 'none' });
    return;
  }

  const scene = getScene();
  const genderVal = toGenderInt(gender.value);     // undefined/1/2/3
  const birthAtVal = dateToUnixSec(birthDate.value); // undefined 或 秒

  let postData = {
    name: name.value,
    description: description.value,
    image_urls: uploadList.value.join(','),
    origin: scene,
    relations: saveCollocationDataList.value.map(item => ({
      relation_goods_id: item.goods_id,
      relation_goods_name: item.goods_name,
      relation_brand_id: item.brand_id,
      relation_brand_name: item.brand_name,
      type: item.type,
      relation_origin: 2
    })),
    // 新增字段（与后端一致）
    personality: personality.value || "",
    makeup_artist: makeupArtist.value || "",
    makeup_artist_id: Number(makeupArtistBrandId.value) || 0
  };

  // 可选字段：仅在有值时发送，避免误覆盖
  if (typeof genderVal === 'number') postData.gender = genderVal;
  if (birthAtVal !== undefined) postData.birth_at = birthAtVal;

  try {
    let url = `${websiteUrl.value}/with-state/add-showcase`;
    if (props.showcase_id) {
      url = `${websiteUrl.value}/with-state/update-showcase`;
      postData = { ...postData, id: parseInt(props.showcase_id, 10) };
    }

    const res = await uni.request({
      url,
      method: 'POST',
      data: postData,
      header: {
        'Content-Type': 'application/json',
        'Authorization': uni.getStorageSync('token'),
      }
    });

    const resp = res.data || {};
    // 成功判断：兼容多种返回格式
    const ok = resp.status === 'success' || resp.code === 'success' || resp.code === 0 || resp.success === true;
    if (ok) {
      uni.showToast({ title: '提交成功' });
      setTimeout(() => uni.navigateBack(), 1000);
    } else {
      uni.showToast({ title: resp.msg || '提交失败', icon: 'none' });
    }
  } catch (err) {
    uni.showToast({ title: '提交失败', icon: 'none' });
  }
}

// 基础辅助
function getTypes() {
  uni.request({
    url: websiteUrl.value + '/goods-types',
    method: 'GET',
    timeout: 5000,
    success: (res) => { typeList.value = res.data.data || []; },
    fail: () => uni.showToast({ title: '网络请求失败', icon: 'none' })
  });
}

function deleteCollcation(index) {
  saveCollocationDataList.value.splice(index, 1);
}

function viewFull(index) {
  uni.previewImage({ current: uploadList.value[index], urls: uploadList.value });
}

function deleteImage(index) {
  uploadList.value.splice(index, 1);
}

// 标题
uni.setNavigationBarTitle({ title: '私养展示' });

onLoad(async (options) => {
  // 从搭配页带参数回填
  if (options.goods_id && options.goods_name && options.brand_id && options.brand_name && options.type) {
    let goodsImage = '';
    try {
      const goodsInfo = await getGoodsInfo(parseInt(options.goods_id));
      goodsImage = goodsInfo.data.goods_images?.[0] || '';
    } catch (error) {}
    saveCollocationDataList.value.push({
      brand_id: parseInt(options.brand_id, 10),
      goods_id: parseInt(options.goods_id, 10),
      brand_name: options.brand_name,
      goods_name: options.goods_name,
      goods_image: goodsImage,
      type: options.type
    });
  }
  getTypes();
  getShowCaseInfo();
});
</script>

<style lang="less" scoped>
.uploaded_image {
  width: 100px;
  height: 100px;
  margin-right: 10px;
}
.upload_box {
  width: 100%;
  white-space: nowrap;
  overflow-x: auto;
  display: block;
  margin-top: 15px;
  padding: 10px;
  margin-left: 10px;

  view {
    display: inline-block;
    vertical-align: top;
  }

  .upload_item {
    position: relative;
    width: 100px;
    margin-right: 10px;
    border-radius: 5px;
    overflow: hidden;

    .uploaded_image {
      width: 100px;
      height: 100px;
    }
    .close_icon {
      position: absolute;
      right: 0;
      top: 0;
      width: 20px;
      height: 20px;
    }
  }
}

/* 小节说明文字 */
.section-subtitle {
  color: #9a9a9a;
  font-size: 13px;
  margin: 8px 15px 0 15px;
}

.card-block {
  background: #fff;
  margin: 10px 15px 12px;
  border-radius: 12px;
  padding: 10px 12px;

  .form-row {
    display: flex;
    align-items: center;
    padding: 10px 4px;

    &.textarea {
      align-items: flex-start;
    }

    &:last-child {
      border-bottom: none;
    }

    &.disabled {
      opacity: 0.7;
    }

    .label {
      width: 80px;
      color: #666;
      font-size: 14px;
      flex-shrink: 0;
    }

    .input {
      flex: 1;
      padding: 8px 10px;
      background: #f8f8f8;
      border-radius: 8px;
    }

    .picker-value {
      flex: 1;
      padding: 8px 10px;
      background: #f8f8f8;
      border-radius: 8px;
    }
    .picker-value.placeholder {
      color: #999;
    }

    .textarea-input {
      min-height: 72px;
      line-height: 22px;
    }
  }
}

/* 妆师块 */
.artist-search { width: 100%; }
.mini-hint { margin-top: 6px; color: #999; font-size: 12px; }
.readonly-row .readonly-name { color: #333; }

/* 列表 */
.saveCollocationDataList {
  padding-bottom: 100px; /* 给底部按钮让位 */
  min-height: 300rpx;

  .saveCollocationDataItem {
    position: relative;
    background: #fafafa;
    width: 90vw;
    margin: 10px auto;

    .info-tap {
      position: absolute;
      bottom: 30px;
      margin-left: 10px;
    }

    .no-image {
      display: inline-block;
      width: 70px;
      height: 70px;
      bottom: 0px;
      margin-left: 0px;
      color: #fda7a7;
      font-size: 30px;
      text-align: center;
      line-height: 70px;
      font-weight: 1000;
    }

    .close_icon {
      width: 20px;
      height: 20px;
      position: absolute;
      bottom: 30px;
      right: 10px;
      margin-left: 10px;
      background: #fff;
      border-radius: 100%;
    }
  }
}

/* 底部操作：贴右 */
.footer {
  position: fixed;
  bottom: 0;
  left: 0; right: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end; /* 贴右 */
  gap: 12px;
  padding: 10px 16px env(safe-area-inset-bottom);
  background: #ffffffd9;
  backdrop-filter: blur(4px);
  border-top: 1px solid #eee;
}

.publish-btn {
  flex: 0 0 48%; /* 较短 */
  height: 44px;
  line-height: 44px;
  background: linear-gradient(135deg, #97e7f7, #d5acd6);
  color: #fff;
  font-size: 16px;
  text-align: center;
  border-radius: 18px;
  font-weight: 600;
  margin: auto 0;
}

.delete-link {
  flex: 0 0 auto;
  color: #999;
  font-size: 15px;
  padding: 6px 4px;
}

.oneLine {
  border-bottom: 1px solid #dadada;
  width: calc(100vw - 50px);
  margin: 0px 25px;
  box-sizing: border-box;
}

.edit-tip {
  padding: 10px;
  background: #fff3cd;
  color: #856404;
  text-align: center;
  font-size: 14px;
}

/* 关联娃物 */
.relation-trigger {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
  margin: 20rpx;

  .placeholder {
    flex: 1;
    color: #999;
    font-size: 28rpx;
  }

  .arrow-icon {
    width: 30rpx;
    height: 30rpx;
  }
}

/* 说明区增加上下间距 */
.publish-detail {
  margin: 30rpx 20rpx;
  text {
    display: block;
    color: #888;
    margin: 18rpx 40rpx;
  }
}
</style>
