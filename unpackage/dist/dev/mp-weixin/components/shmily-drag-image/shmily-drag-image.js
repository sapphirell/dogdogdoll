"use strict";
const common_vendor = require("../../common/vendor.js");
require("../../common/config.js");
const _sfc_main = {
  __name: "shmily-drag-image",
  props: {
    value: {
      type: Array,
      default: () => []
    },
    modelValue: {
      type: Array,
      default: () => []
    },
    keyName: {
      type: String,
      default: "image_url"
      // 默认使用image_url作为图片字段
    },
    number: {
      type: Number,
      default: 6
    },
    imageWidth: {
      type: Number,
      default: 0
    },
    cols: {
      type: Number,
      default: 3
    },
    borderRadius: {
      type: String,
      default: 0
    },
    padding: {
      type: Number,
      default: 10
    },
    scale: {
      type: Number,
      default: 1.1
    },
    opacity: {
      type: Number,
      default: 0.7
    },
    // 新增：每个项目之间的边距
    itemMargin: {
      type: Number,
      default: 10
    },
    // 新增：图片与文字的比例
    imageRatio: {
      type: Number,
      default: 0.7
      // 图片区域占总高度的70%
    }
  },
  emits: ["input", "update:modelValue", "sort-change"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const imageList = common_vendor.ref([]);
    const width = common_vendor.ref(0);
    const add = common_vendor.ref({
      x: 0,
      y: 0
    });
    const colsValue = common_vendor.ref(0);
    const viewWidth = common_vendor.ref(0);
    const viewHeight = common_vendor.ref(0);
    const tempItem = common_vendor.ref(null);
    const timer = common_vendor.ref(null);
    const changeStatus = common_vendor.ref(true);
    common_vendor.ref(true);
    const first = common_vendor.ref(true);
    const touchStartY = common_vendor.ref(0);
    const longPressTimer = common_vendor.ref(null);
    const isDragging = common_vendor.ref(false);
    const isMounted = common_vendor.ref(false);
    const areaHeight = common_vendor.computed(() => {
      if (imageList.value.length < props.number) {
        return Math.ceil((imageList.value.length + 1) / colsValue.value) * viewHeight.value + "px";
      }
      return Math.ceil(imageList.value.length / colsValue.value) * viewHeight.value + "px";
    });
    const childWidth = common_vendor.computed(() => {
      return viewWidth.value - rpx2px(props.padding) * 2 + "px";
    });
    const childHeight = common_vendor.computed(() => {
      return viewHeight.value - rpx2px(props.padding) * 2 + "px";
    });
    const getSrc = (item) => {
      return props.keyName !== null ? item[props.keyName] : item;
    };
    const getItemData = (item) => {
      return {
        id: item.id,
        src: getSrc(item),
        name: item.name,
        price: item.price,
        type: item.type
      };
    };
    const onChange = (e, item) => {
      if (!item)
        return;
      item.oldX = e.detail.x;
      item.oldY = e.detail.y;
      if (e.detail.source === "touch") {
        if (item.moveEnd) {
          item.offset = Math.sqrt(
            Math.pow(item.oldX - item.absX * viewWidth.value, 2) + Math.pow(item.oldY - item.absY * viewHeight.value, 2)
            // 使用viewHeight
          );
        }
        let x = Math.floor((e.detail.x + viewWidth.value / 2) / viewWidth.value);
        if (x >= colsValue.value)
          return;
        let y = Math.floor((e.detail.y + viewHeight.value / 2) / viewHeight.value);
        let index = colsValue.value * y + x;
        if (item.index !== index && index < imageList.value.length) {
          changeStatus.value = false;
          imageList.value.forEach((obj) => {
            if (item.index > index && obj.index >= index && obj.index < item.index) {
              changeObj(obj, 1);
            } else if (item.index < index && obj.index <= index && obj.index > item.index) {
              changeObj(obj, -1);
            } else if (obj.id !== item.id) {
              obj.offset = 0;
              obj.x = obj.oldX;
              obj.y = obj.oldY;
              setTimeout(() => {
                common_vendor.nextTick$1(() => {
                  obj.x = obj.absX * viewWidth.value;
                  obj.y = obj.absY * viewHeight.value;
                });
              }, 0);
            }
          });
          moveItem(item, index);
          item.index = index;
          item.absX = x;
          item.absY = y;
          if (!item.moveEnd) {
            setTimeout(() => {
              common_vendor.nextTick$1(() => {
                item.x = item.absX * viewWidth.value;
                item.y = item.absY * viewHeight.value;
              });
            }, 0);
          }
          sortList();
        }
      }
    };
    const moveItem = (item, newIndex) => {
      const oldIndex = imageList.value.findIndex((i) => i.id === item.id);
      if (oldIndex === -1 || oldIndex === newIndex)
        return;
      imageList.value.splice(newIndex, 0, imageList.value.splice(oldIndex, 1)[0]);
      imageList.value.forEach((item2, idx) => {
        item2.index = idx;
      });
      sortList();
    };
    const changeObj = (obj, i) => {
      obj.index += i;
      obj.offset = 0;
      obj.x = obj.oldX;
      obj.y = obj.oldY;
      obj.absX = obj.index % colsValue.value;
      obj.absY = Math.floor(obj.index / colsValue.value);
      setTimeout(() => {
        common_vendor.nextTick$1(() => {
          obj.x = obj.absX * viewWidth.value;
          obj.y = obj.absY * viewHeight.value;
        });
      }, 0);
    };
    const onLongPressStart = (item, e) => {
      touchStartY.value = e.touches[0].clientY;
      if (longPressTimer.value) {
        clearTimeout(longPressTimer.value);
        longPressTimer.value = null;
      }
      imageList.value.forEach((item2) => {
        item2.ready = false;
        item2.disable = true;
      });
      common_vendor.index.__f__("log", "at components/shmily-drag-image/shmily-drag-image.vue:263", "长按开始");
      longPressTimer.value = setTimeout(() => {
        common_vendor.index.__f__("log", "at components/shmily-drag-image/shmily-drag-image.vue:267", "长按成功！");
        common_vendor.index.vibrateShort({
          success: () => {
            common_vendor.index.__f__("log", "at components/shmily-drag-image/shmily-drag-image.vue:270", "触感反馈");
          }
        });
        item.ready = true;
        item.disable = false;
        isDragging.value = true;
        touchstart(item);
      }, 240);
    };
    const touchstart = (item, e) => {
      common_vendor.index.__f__("log", "at components/shmily-drag-image/shmily-drag-image.vue:281", "进入touchstart");
      imageList.value.forEach((v) => {
        v.zIndex = v.index + 9;
      });
      item.zIndex = 99;
      item.moveEnd = true;
      tempItem.value = item;
      timer.value = setTimeout(() => {
        item.scale = props.scale;
        item.opacity = props.opacity;
        clearTimeout(timer.value);
        timer.value = null;
      }, 200);
    };
    const touchend = (item) => {
      item.scale = 1;
      item.opacity = 1;
      item.x = item.oldX;
      item.y = item.oldY;
      item.offset = 0;
      item.moveEnd = false;
      common_vendor.index.__f__("log", "at components/shmily-drag-image/shmily-drag-image.vue:306", "结束点击，清理ready");
      imageList.value.forEach((item2) => {
        item2.ready = false;
        item2.disable = true;
      });
      if (isDragging.value == true) {
        common_vendor.index.__f__("log", "at components/shmily-drag-image/shmily-drag-image.vue:312", "来自于拖拽的结束,上报排序事件");
        const sortedIds = imageList.value.map((item2) => item2.id);
        emit("sort-change", sortedIds);
      }
      isDragging.value = false;
      if (longPressTimer.value) {
        clearTimeout(longPressTimer.value);
        longPressTimer.value = null;
      }
      setTimeout(() => {
        imageList.value.forEach((obj) => {
          if (obj.ready)
            return;
          obj.x = obj.absX * viewWidth.value;
          obj.y = obj.absY * viewHeight.value;
          obj.offset = 0;
          obj.moveEnd = false;
        });
        common_vendor.nextTick$1(() => {
          item.x = item.absX * viewWidth.value;
          item.y = item.absY * viewHeight.value;
          tempItem.value = null;
          changeStatus.value = true;
        });
      }, 50);
    };
    const getFirstImage = (imageUrls) => {
      var _a;
      if (!imageUrls)
        return "";
      const urls = imageUrls.split(",");
      const firstUrl = ((_a = urls[0]) == null ? void 0 : _a.trim()) || "";
      if (firstUrl.startsWith("http")) {
        return firstUrl;
      }
      return "";
    };
    const mouseenter = () => {
    };
    const mouseleave = () => {
    };
    const onTouchMove = (e, item) => {
      if (isDragging.value)
        return;
      const touchY = e.touches[0].clientY;
      const deltaY = Math.abs(touchY - touchStartY.value);
      if (deltaY > 10 && longPressTimer.value) {
        clearTimeout(longPressTimer.value);
        longPressTimer.value = null;
      }
    };
    function go2preview(id) {
      common_vendor.index.navigateTo({
        url: "/pages/account_book_preview/account_book_preview?account_book_id=" + id
      });
    }
    const sortList = () => {
      const result = [];
      const source = props.modelValue.length ? props.modelValue : props.value;
      const list = [...imageList.value].sort((a, b) => a.index - b.index);
      for (let s of list) {
        const item = source.find((d) => getSrc(d) === s.src);
        if (item) {
          result.push(item);
        } else {
          if (props.keyName !== null) {
            result.push({
              [props.keyName]: s.src
            });
          } else {
            result.push(s.src);
          }
        }
      }
      emit("input", result);
      emit("update:modelValue", result);
    };
    const addProperties = (item) => {
      const data = getItemData(item);
      const absX = imageList.value.length % colsValue.value;
      const absY = Math.floor(imageList.value.length / colsValue.value);
      const x = absX * viewWidth.value;
      const y = absY * viewHeight.value;
      imageList.value.push({
        ...data,
        x,
        y,
        oldX: x,
        oldY: y,
        absX,
        absY,
        scale: 1,
        zIndex: 9,
        opacity: 1,
        index: imageList.value.length,
        id: item.id,
        disable: false,
        offset: 0,
        moveEnd: false
      });
      add.value.x = imageList.value.length % colsValue.value * viewWidth.value;
      add.value.y = Math.floor(imageList.value.length / colsValue.value) * viewHeight.value;
    };
    const rpx2px = (v) => {
      return width.value * v / 750;
    };
    const instanceRef = common_vendor.ref(null);
    common_vendor.onMounted(() => {
      width.value = common_vendor.index.getSystemInfoSync().windowWidth;
      instanceRef.value = common_vendor.getCurrentInstance();
      common_vendor.nextTick$1(() => {
        const query = common_vendor.index.createSelectorQuery().in(instanceRef.value.proxy);
        query.select(".con").boundingClientRect((data) => {
          if (!data) {
            common_vendor.index.__f__("error", "at components/shmily-drag-image/shmily-drag-image.vue:592", "未找到 .con 元素");
            return;
          }
          colsValue.value = props.cols;
          viewWidth.value = data.width / props.cols;
          viewHeight.value = viewWidth.value * 1.3;
          if (props.imageWidth > 0) {
            viewWidth.value = rpx2px(props.imageWidth);
            viewHeight.value = viewWidth.value * 1.3;
            colsValue.value = Math.floor(data.width / viewWidth.value);
          }
          const list = props.modelValue.length ? props.modelValue : props.value;
          list.forEach((item) => {
            addProperties(item);
          });
          first.value = false;
        }).exec();
      });
      isMounted.value = true;
    });
    const initViewSize = () => {
      return new Promise((resolve) => {
        if (!instanceRef.value || !instanceRef.value.proxy) {
          common_vendor.index.__f__("warn", "at components/shmily-drag-image/shmily-drag-image.vue:624", "Component instance not available for selector query");
          return resolve();
        }
        const query = common_vendor.index.createSelectorQuery().in(instanceRef.value.proxy);
        query.select(".con").boundingClientRect((data) => {
          if (!data)
            return resolve();
          colsValue.value = props.cols;
          viewWidth.value = data.width / props.cols;
          viewHeight.value = viewWidth.value * 1.3;
          if (props.imageWidth > 0) {
            viewWidth.value = rpx2px(props.imageWidth);
            viewHeight.value = viewWidth.value * 1.3;
            colsValue.value = Math.floor(data.width / viewWidth.value);
          }
          resolve();
        }).exec();
      });
    };
    common_vendor.watch(() => props.modelValue, (newVal) => {
      if (isMounted.value) {
        common_vendor.nextTick$1(() => {
          initViewSize().then(() => {
            updateImageList(newVal);
          });
        });
      }
    }, {
      deep: true
    });
    const updateImageList = (newList) => {
      const oldItems = imageList.value.reduce((map, item) => {
        map[item.id] = item;
        return map;
      }, {});
      imageList.value = newList.map((item) => {
        const existing = oldItems[item.id];
        if (existing) {
          return {
            ...existing,
            ...getItemData(item)
            // 更新可能变化的数据
          };
        }
        return createNewItem(item);
      });
    };
    const createNewItem = (item) => {
      const data = getItemData(item);
      const absX = imageList.value.length % colsValue.value;
      const absY = Math.floor(imageList.value.length / colsValue.value);
      return {
        ...data,
        x: absX * viewWidth.value,
        y: absY * viewHeight.value,
        oldX: absX * viewWidth.value,
        oldY: absY * viewHeight.value,
        absX,
        absY,
        scale: 1,
        zIndex: 9,
        opacity: 1,
        index: imageList.value.length,
        disable: false,
        offset: 0,
        moveEnd: false,
        ready: false
      };
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: viewWidth.value
      }, viewWidth.value ? {
        b: common_vendor.f(imageList.value, (item, index, i0) => {
          return {
            a: getFirstImage(item.src),
            b: common_vendor.t(item.name),
            c: common_vendor.t(item.price),
            d: common_vendor.t(item.type),
            e: "scale(" + item.scale + ")",
            f: !item.disable && item.ready ? 1 : "",
            g: item.id,
            h: item.y,
            i: item.x,
            j: item.disable || !item.ready,
            k: common_vendor.o(($event) => onChange($event, item), item.id),
            l: common_vendor.o(($event) => onLongPressStart(item, $event), item.id),
            m: common_vendor.o(($event) => touchend(item), item.id),
            n: common_vendor.o(($event) => go2preview(item.id), item.id),
            o: common_vendor.o(($event) => onTouchMove($event), item.id),
            p: item.zIndex,
            q: item.opacity
          };
        }),
        c: childWidth.value,
        d: childHeight.value,
        e: __props.borderRadius + "rpx",
        f: __props.itemMargin + "px",
        g: viewWidth.value + "px",
        h: viewHeight.value + "px",
        i: areaHeight.value,
        j: common_vendor.o(mouseenter),
        k: common_vendor.o(mouseleave)
      } : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-96f535cf"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/shmily-drag-image/shmily-drag-image.js.map
