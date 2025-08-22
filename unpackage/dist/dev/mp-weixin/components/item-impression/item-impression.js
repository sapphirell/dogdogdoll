"use strict";
const common_vendor = require("../../common/vendor.js");
const common_config = require("../../common/config.js");
if (!Array) {
  const _easycom_common_modal2 = common_vendor.resolveComponent("common-modal");
  _easycom_common_modal2();
}
const _easycom_common_modal = () => "../common-modal/common-modal.js";
if (!Math) {
  _easycom_common_modal();
}
const _sfc_main = {
  __name: "item-impression",
  props: {
    target_id: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    goodsType: {
      type: Number,
      required: true
    }
  },
  setup(__props) {
    const props = __props;
    const impressions = common_vendor.ref([]);
    const defaultImpressionTitles = common_vendor.ref([]);
    const totalCount = common_vendor.ref(0);
    const newImpression = common_vendor.ref("");
    const modalVisible = common_vendor.ref(false);
    const userInfo = common_vendor.ref(null);
    const allImpressions = common_vendor.computed(() => {
      const existingMap = {};
      impressions.value.forEach((item) => {
        existingMap[item.content] = item;
      });
      const defaultItems = defaultImpressionTitles.value.map((title) => {
        if (existingMap[title]) {
          return {
            ...existingMap[title],
            isDefault: true
          };
        }
        return {
          content: title,
          count: 0,
          selected: false,
          isDefault: true
        };
      });
      const uniqueExisting = impressions.value.filter(
        (item) => !defaultImpressionTitles.value.includes(item.content)
      );
      const merged = [...defaultItems, ...uniqueExisting];
      return merged.sort((a, b) => b.count - a.count);
    });
    const fetchDefaultImpressions = async () => {
      try {
        let impressionType = 9;
        switch (props.goodsType) {
          case "整体":
            impressionType = 1;
            break;
          case "单头":
            impressionType = 2;
            break;
          case "娃衣":
            impressionType = 3;
            break;
          case "眼珠":
            impressionType = 4;
            break;
          case "假发":
            impressionType = 5;
            break;
          default:
            impressionType = 9;
        }
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl.value}/impression/default`,
          method: "GET",
          data: {
            type: impressionType
          }
        });
        if (res.statusCode === 200 && res.data.status === "success") {
          defaultImpressionTitles.value = res.data.data;
        } else {
          common_vendor.index.__f__("error", "at components/item-impression/item-impression.vue:160", "获取默认表态失败:", res.data);
          common_vendor.index.showToast({
            title: "获取默认表态失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at components/item-impression/item-impression.vue:167", "获取默认表态失败:", error);
        common_vendor.index.showToast({
          title: "获取默认表态失败",
          icon: "none"
        });
      }
    };
    const fetchImpressionData = async () => {
      try {
        userInfo.value = await common_config.asyncGetUserInfo();
        const countsRes = await common_vendor.index.request({
          url: `${common_config.websiteUrl.value}/impression/counts`,
          method: "GET",
          data: {
            target_id: parseInt(props.target_id, 10),
            type_id: parseInt(props.type, 10)
          }
        });
        const statusRes = await common_vendor.index.request({
          url: `${common_config.websiteUrl.value}/with-state/impression/status`,
          method: "GET",
          data: {
            target_id: parseInt(props.target_id, 10),
            type_id: parseInt(props.type, 10)
          },
          header: {
            Authorization: common_vendor.index.getStorageSync("token")
          }
        });
        if (countsRes.statusCode === 200 && countsRes.data.status === "success") {
          const countsData = countsRes.data.data;
          totalCount.value = countsData.reduce((sum, item) => sum + item.count, 0);
          const userSelected = statusRes.statusCode === 200 && statusRes.data.status === "success" ? statusRes.data.data.map((item) => item.id) : [];
          impressions.value = countsData.map((item) => ({
            ...item,
            selected: userSelected.includes(item.id)
          }));
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at components/item-impression/item-impression.vue:222", "获取表态数据失败:", error);
        common_vendor.index.showToast({
          title: "获取表态数据失败",
          icon: "none"
        });
      }
    };
    const handleImpressionClick = async (item) => {
      if (!userInfo.value) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        return;
      }
      try {
        const data = {
          target_id: parseInt(props.target_id, 10),
          type_id: parseInt(props.type, 10)
        };
        if (item.isDefault && !item.id) {
          data.content = item.content;
        } else {
          data.impression_id = item.id;
        }
        if (item.selected) {
          const res = await common_vendor.index.request({
            url: `${common_config.websiteUrl.value}/with-state/impression/remove`,
            method: "POST",
            header: {
              Authorization: common_vendor.index.getStorageSync("token"),
              "Content-Type": "application/json"
            },
            data: {
              impression_id: item.id
            }
          });
          if (res.statusCode === 200 && res.data.status === "success") {
            updateImpressionState(item, false);
          }
        } else {
          const res = await common_vendor.index.request({
            url: `${common_config.websiteUrl.value}/with-state/impression/add`,
            method: "POST",
            header: {
              Authorization: common_vendor.index.getStorageSync("token"),
              "Content-Type": "application/json"
            },
            data
          });
          if (res.statusCode === 200 && res.data.status === "success") {
            updateImpressionState(item, true, res.data.data.impression_id);
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at components/item-impression/item-impression.vue:291", "操作失败:", error);
        common_vendor.index.showToast({
          title: "操作失败",
          icon: "none"
        });
      }
    };
    const updateImpressionState = (item, isSelected, newId = null) => {
      const impressionIndex = impressions.value.findIndex(
        (imp) => imp.id === item.id || imp.content === item.content
      );
      if (impressionIndex === -1 && isSelected) {
        const newImpression2 = {
          id: newId,
          content: item.content,
          count: 1,
          selected: true
        };
        impressions.value = [...impressions.value, newImpression2];
        totalCount.value++;
        return;
      }
      if (impressionIndex !== -1) {
        const updatedImpressions = [...impressions.value];
        const updatedItem = { ...updatedImpressions[impressionIndex] };
        if (isSelected) {
          updatedItem.selected = true;
          updatedItem.count = (updatedItem.count || 0) + 1;
          if (newId)
            updatedItem.id = newId;
          totalCount.value++;
        } else {
          updatedItem.selected = false;
          updatedItem.count = Math.max(0, updatedItem.count - 1);
          totalCount.value--;
        }
        updatedImpressions[impressionIndex] = updatedItem;
        impressions.value = updatedImpressions;
      }
    };
    const showAddModal = () => {
      if (!userInfo.value) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        return;
      }
      newImpression.value = "";
      modalVisible.value = true;
    };
    const cancelAdd = () => {
      modalVisible.value = false;
    };
    const confirmAdd = async () => {
      if (!newImpression.value.trim()) {
        common_vendor.index.showToast({
          title: "请输入表态内容",
          icon: "none"
        });
        return;
      }
      try {
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl.value}/with-state/impression/add`,
          method: "POST",
          header: {
            Authorization: common_vendor.index.getStorageSync("token"),
            "Content-Type": "application/json"
          },
          data: {
            target_id: parseInt(props.target_id, 10),
            type_id: parseInt(props.type, 10),
            content: newImpression.value.trim()
          }
        });
        if (res.statusCode === 200 && res.data.status === "success") {
          impressions.value = [
            ...impressions.value,
            {
              id: res.data.data.impression_id,
              content: newImpression.value.trim(),
              count: 1,
              selected: true
            }
          ];
          totalCount.value++;
          modalVisible.value = false;
          common_vendor.index.showToast({
            title: "添加成功",
            icon: "success"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at components/item-impression/item-impression.vue:411", "添加表态失败:", error);
        common_vendor.index.showToast({
          title: "添加表态失败",
          icon: "none"
        });
      }
    };
    common_vendor.watch(() => [props.target_id, props.type], fetchImpressionData, {
      immediate: true
    });
    common_vendor.onMounted(() => {
      fetchDefaultImpressions();
      fetchImpressionData();
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(allImpressions.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item.content),
            b: common_vendor.t(item.count),
            c: item.count > 0 ? 1 : "",
            d: item.id || "default-" + item.content,
            e: common_vendor.n({
              "active": item.selected
            }),
            f: common_vendor.o(($event) => handleImpressionClick(item), item.id || "default-" + item.content)
          };
        }),
        b: common_vendor.o(showAddModal),
        c: common_vendor.o(confirmAdd),
        d: newImpression.value,
        e: common_vendor.o(($event) => newImpression.value = $event.detail.value),
        f: common_vendor.o(cancelAdd),
        g: common_vendor.o(confirmAdd),
        h: common_vendor.o(($event) => modalVisible.value = $event),
        i: common_vendor.p({
          visible: modalVisible.value,
          width: "80%",
          top: "30%"
        })
      };
    };
  }
};
wx.createComponent(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/item-impression/item-impression.js.map
