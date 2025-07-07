"use strict";
const common_vendor = require("../../common/vendor.js");
const common_config = require("../../common/config.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "attitude-widget",
  props: {
    targetId: Number,
    type: Number,
    attitudeStatus: {
      type: Number,
      default: 0
    },
    attitudeCounts: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ["change"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const showPanel = common_vendor.ref(false);
    const currentStatus = common_vendor.ref(props.attitudeStatus);
    const currentCounts = common_vendor.ref({});
    const attitudeTypes = common_vendor.ref([
      {
        emoji: "😝",
        value: 1,
        label: "很有趣"
      },
      {
        emoji: "😨",
        value: 2,
        label: "这个..."
      },
      {
        emoji: "🤤",
        value: 3,
        label: "我也想要"
      },
      {
        emoji: "🤦‍♀️",
        value: 4,
        label: "难以直视"
      },
      {
        emoji: "🤡",
        value: 5,
        label: "谁的鼻子掉了?"
      }
    ]);
    common_vendor.watch(() => props.attitudeCounts, (newVal) => {
      attitudeTypes.value.forEach((t) => {
        currentCounts.value[t.value] = Number(newVal[t.value] ?? 0);
      });
      currentCounts.value = {
        ...currentCounts.value
      };
    }, {
      immediate: true,
      deep: true
    });
    const visibleGlobalCounts = common_vendor.computed(() => {
      return attitudeTypes.value.map((t) => ({
        ...t,
        count: currentCounts.value[t.value] || 0
      })).filter((t) => t.count > 0 || t.value === currentStatus.value).filter((t) => t.count > 0);
    });
    const togglePanel = () => {
      showPanel.value = !showPanel.value;
    };
    const handleAction = async (actionType) => {
      try {
        const token = common_vendor.index.getStorageSync("token");
        common_vendor.index.__f__("log", "at components/attitude-widget/attitude-widget.vue:130", token);
        if (!token) {
          common_vendor.index.showToast({
            title: "请先登录",
            icon: "none"
          });
          return;
        }
        const isActive = currentStatus.value === actionType;
        const apiUrl = `${common_config.websiteUrl}/with-state/attitude/${isActive ? "remove" : "add"}`;
        const res = await common_vendor.index.request({
          url: apiUrl,
          method: "POST",
          data: {
            target_id: props.targetId,
            type: props.type,
            action_type: actionType
          },
          header: {
            Authorization: token
          }
        });
        if (res.data.status === "success") {
          if (isActive) {
            currentCounts.value[actionType]--;
            currentStatus.value = 0;
          } else {
            if (currentStatus.value > 0) {
              currentCounts.value[currentStatus.value]--;
            }
            currentStatus.value = actionType;
            currentCounts.value[actionType] = (currentCounts.value[actionType] || 0) + 1;
          }
          emit("change", {
            status: currentStatus.value,
            counts: {
              ...currentCounts.value
            }
          });
          showPanel.value = false;
        }
      } catch (err) {
        common_vendor.index.__f__("log", "at components/attitude-widget/attitude-widget.vue:178", err);
        common_vendor.index.showToast({
          title: "操作失败",
          icon: "none"
        });
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: showPanel.value
      }, showPanel.value ? {
        b: common_vendor.o(togglePanel),
        c: common_vendor.o(() => {
        })
      } : {}, {
        d: common_vendor.f(visibleGlobalCounts.value, (action, k0, i0) => {
          return {
            a: common_vendor.t(action.emoji),
            b: common_vendor.t(action.count),
            c: action.value,
            d: currentStatus.value === action.value ? 1 : "",
            e: action.count > 0 ? 1 : ""
          };
        }),
        e: common_vendor.p({
          type: showPanel.value ? "arrowup" : "plus",
          size: "16",
          color: "#888"
        }),
        f: common_vendor.t(showPanel.value ? "收起" : "表态"),
        g: common_vendor.o(togglePanel),
        h: showPanel.value
      }, showPanel.value ? {
        i: common_vendor.f(attitudeTypes.value, (action, k0, i0) => {
          return {
            a: common_vendor.t(action.emoji),
            b: common_vendor.t(action.label),
            c: action.value,
            d: currentStatus.value === action.value ? 1 : "",
            e: common_vendor.o(($event) => handleAction(action.value), action.value)
          };
        })
      } : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f15d1ff3"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/attitude-widget/attitude-widget.js.map
