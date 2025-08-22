"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const common_image = require("../../../common/image.js");
const common_config = require("../../../common/config.js");
if (!Array) {
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_number_box2 = common_vendor.resolveComponent("uni-number-box");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_load_more2 + _easycom_uni_icons2 + _easycom_uni_number_box2 + _easycom_uni_popup2)();
}
const _easycom_uni_load_more = () => "../../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
const _easycom_uni_icons = () => "../../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_number_box = () => "../../../uni_modules/uni-number-box/components/uni-number-box/uni-number-box.js";
const _easycom_uni_popup = () => "../../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_load_more + _easycom_uni_icons + _easycom_uni_number_box + _easycom_uni_popup)();
}
const _sfc_main = {
  __name: "order_plane",
  setup(__props) {
    const tabs = [
      {
        label: "全部",
        value: "all"
      },
      {
        label: "进行中",
        value: "active"
      },
      {
        label: "未开始",
        value: "upcoming"
      },
      {
        label: "已结束",
        value: "inactive"
      }
    ];
    const activeTab = common_vendor.ref("all");
    const planList = common_vendor.ref([]);
    const currentPage = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const total = common_vendor.ref(0);
    const loading = common_vendor.ref(false);
    const submitting = common_vendor.ref(false);
    const loadingStatus = common_vendor.ref("more");
    const scrollHeight = common_vendor.ref(0);
    const popup = common_vendor.ref(null);
    const isEditMode = common_vendor.ref(false);
    const currentPlanId = common_vendor.ref(null);
    const uploading = common_vendor.ref(false);
    const uploadedCount = common_vendor.ref(0);
    const totalToUpload = common_vendor.ref(0);
    const uploadStatusText = common_vendor.ref("");
    const tierPicker = common_vendor.ref(null);
    const showTierPicker = common_vendor.ref(false);
    const showAddonPicker = common_vendor.ref(false);
    common_vendor.ref([]);
    common_vendor.ref([]);
    const tierOptions = common_vendor.ref([{
      label: "添加空白档位",
      value: "blank"
    }]);
    const addonOptions = common_vendor.ref([{
      label: "添加空白加购",
      value: "blank"
    }]);
    const formData = common_vendor.ref({
      artist_name: "",
      artist_type: 1,
      // 1: 妆师, 2: 毛娘
      order_type: 1,
      // 1: 长期接单, 2: 限时手速, 3: 限时抽选
      max_participants: 10,
      max_submissions_per_user: 1,
      open_date: "",
      open_time: "",
      close_date: "",
      close_time: "",
      images: [],
      order_config: {
        tiers: [],
        // 新增加购配置
        addons: []
      }
    });
    const artistTypes = [
      {
        value: 1,
        text: "妆师"
      }
      // {
      // 	value: 2,
      // 	text: '毛娘'
      // }
    ];
    const orderTypes = [
      {
        value: 1,
        text: "长期接单"
      },
      {
        value: 2,
        text: "限时手速"
      },
      {
        value: 3,
        text: "限时抽选"
      },
      {
        value: 4,
        text: "限时黑箱卡"
      },
      {
        value: 9,
        text: "关闭投递"
      }
    ];
    common_vendor.onMounted(() => {
      calcScrollHeight();
      fetchCommonConfigs();
      common_vendor.index.setNavigationBarTitle({
        title: "接单计划管理"
      });
    });
    common_vendor.onShow(() => {
      fetchPlanList(true);
    });
    common_vendor.watch(showTierPicker, (newVal) => {
      if (newVal) {
        popup.value.close();
        tierPicker.value.open();
      } else {
        tierPicker.value.close();
      }
    });
    common_vendor.watch(showAddonPicker, (newVal) => {
      if (newVal) {
        popup.value.close();
        addonPicker.value.open();
      } else {
        addonPicker.value.close();
      }
    });
    const fetchCommonConfigs = async () => {
      try {
        const tierRes = await common_vendor.index.request({
          url: common_config.websiteUrl.value + "/brand-manager/order-plane/common-tiers",
          method: "GET",
          header: {
            "Authorization": getAuthorization()
          }
        });
        if (tierRes.data.status === "success") {
          tierOptions.value = [
            {
              label: "添加空白档位",
              value: "blank"
            },
            ...tierRes.data.data.map((item) => ({
              label: item.title,
              value: item
            }))
          ];
        }
        const addonRes = await common_vendor.index.request({
          url: common_config.websiteUrl.value + "/brand-manager/order-plane/common-addons",
          method: "GET",
          header: {
            "Authorization": getAuthorization()
          }
        });
        if (addonRes.data.status === "success") {
          addonOptions.value = [
            {
              label: "添加空白加购",
              value: "blank"
            },
            ...addonRes.data.data.map((item) => ({
              label: item.title,
              value: item
            }))
          ];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/creator_base/order_plane/order_plane.vue:450", "获取默认配置失败:", error);
      }
    };
    const onTierPickerChange = (e) => {
      const index = e.detail.value;
      const option = tierOptions.value[index];
      if (option.value === "blank") {
        formData.value.order_config.tiers.push({
          title: "",
          price: 0,
          description: ""
        });
      } else {
        formData.value.order_config.tiers.push({
          ...option.value,
          price: parseFloat(option.value.price) || 0
        });
      }
    };
    const onAddonPickerChange = (e) => {
      const index = e.detail.value;
      const option = addonOptions.value[index];
      if (option.value === "blank") {
        formData.value.order_config.addons.push({
          title: "",
          price: 0,
          description: ""
        });
      } else {
        formData.value.order_config.addons.push({
          ...option.value,
          price: parseFloat(option.value.price) || 0
        });
      }
    };
    const calcScrollHeight = () => {
      const systemInfo = common_vendor.index.getSystemInfoSync();
      scrollHeight.value = systemInfo.windowHeight - 180;
    };
    const getAuthorization = () => {
      const token = common_vendor.index.getStorageSync("token") || "";
      return token;
    };
    const chooseAndUploadImages = async () => {
      try {
        const remaining = 9 - formData.value.images.length;
        if (remaining <= 0)
          return;
        const tempFilePaths = await common_image.chooseImageList(remaining);
        if (!tempFilePaths || tempFilePaths.length === 0)
          return;
        const qiniuData = await common_image.getQiniuToken();
        const token = qiniuData.token;
        const basePath = qiniuData.path;
        uploading.value = true;
        totalToUpload.value = tempFilePaths.length;
        uploadedCount.value = 0;
        const uploadedUrls = [];
        for (let i = 0; i < tempFilePaths.length; i++) {
          try {
            const filePath = tempFilePaths[i];
            uploadStatusText.value = `上传中 (${i + 1}/${tempFilePaths.length})`;
            uploadedCount.value = i + 1;
            const result = await common_image.uploadImageToQiniu(
              filePath,
              token,
              basePath
            );
            if (result && result.imageUrl) {
              uploadedUrls.push(result.imageUrl);
            }
          } catch (uploadError) {
            common_vendor.index.__f__("error", "at pages/creator_base/order_plane/order_plane.vue:663", `第 ${i + 1} 张图片上传失败:`, uploadError);
            common_vendor.index.showToast({
              title: `第 ${i + 1} 张图片上传失败`,
              icon: "none"
            });
          }
        }
        formData.value.images = [...formData.value.images, ...uploadedUrls];
        if (uploadedUrls.length > 0) {
          common_vendor.index.showToast({
            title: `成功上传 ${uploadedUrls.length} 张图片`,
            icon: "success"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/creator_base/order_plane/order_plane.vue:682", "图片选择或上传失败:", error);
        common_vendor.index.showToast({
          title: "图片上传失败: " + (error.message || "未知错误"),
          icon: "none"
        });
      } finally {
        uploading.value = false;
        uploadedCount.value = 0;
        totalToUpload.value = 0;
      }
    };
    const fetchPlanList = async (reset = false) => {
      if (loading.value)
        return;
      if (reset) {
        currentPage.value = 1;
        planList.value = [];
        loadingStatus.value = "more";
      }
      loading.value = true;
      loadingStatus.value = "loading";
      try {
        const res = await common_vendor.index.request({
          url: common_config.websiteUrl.value + "/brand-manager/order-plan/list",
          method: "GET",
          data: {
            page: currentPage.value,
            page_size: pageSize.value,
            status: activeTab.value
          },
          header: {
            "Authorization": getAuthorization()
          }
        });
        if (res.data.status === "success") {
          const data = res.data.data;
          const newList = data.list || [];
          total.value = data.total;
          const processedList = newList.map((plan) => {
            const images = typeof plan.images === "string" ? plan.images.split(",").filter((url) => url.trim() !== "") : plan.images || [];
            let orderConfig = {};
            try {
              orderConfig = plan.order_config ? JSON.parse(plan.order_config) : {};
            } catch (e) {
              common_vendor.index.__f__("error", "at pages/creator_base/order_plane/order_plane.vue:739", "解析 order_config 失败:", e);
            }
            return {
              ...plan,
              images,
              order_config: orderConfig
            };
          });
          if (reset) {
            planList.value = processedList;
          } else {
            planList.value = [...planList.value, ...processedList];
          }
          if (planList.value.length >= total.value) {
            loadingStatus.value = "noMore";
          } else {
            loadingStatus.value = "more";
            currentPage.value++;
          }
        } else {
          common_vendor.index.showToast({
            title: res.data.message || "获取列表失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.showToast({
          title: "网络错误",
          icon: "none"
        });
      } finally {
        loading.value = false;
      }
    };
    const loadMore = () => {
      if (loadingStatus.value === "noMore")
        return;
      fetchPlanList();
    };
    const switchTab = (tab) => {
      activeTab.value = tab;
      fetchPlanList(true);
    };
    const showAddDialog = () => {
      resetForm();
      isEditMode.value = false;
      popup.value.open();
    };
    const editPlan = (plan) => {
      var _a, _b;
      resetForm();
      isEditMode.value = true;
      currentPlanId.value = plan.id;
      formData.value = {
        artist_name: plan.artist_name,
        artist_type: plan.artist_type,
        order_type: plan.order_type,
        max_participants: plan.max_participants,
        max_submissions_per_user: plan.max_submissions_per_user,
        images: [...plan.images || []],
        order_config: {
          tiers: [...((_a = plan.order_config) == null ? void 0 : _a.tiers) || []],
          addons: [...((_b = plan.order_config) == null ? void 0 : _b.addons) || []]
        }
      };
      if (plan.open_time) {
        formData.value.open_date = formatDate(plan.open_time * 1e3, "yyyy-MM-dd");
        formData.value.open_time = formatDate(plan.open_time * 1e3, "HH:mm");
      }
      if (plan.close_time) {
        formData.value.close_date = formatDate(plan.close_time * 1e3, "yyyy-MM-dd");
        formData.value.close_time = formatDate(plan.close_time * 1e3, "HH:mm");
      }
      popup.value.open();
    };
    const resetForm = () => {
      formData.value = {
        artist_name: "",
        artist_type: 1,
        order_type: 1,
        max_participants: 10,
        max_submissions_per_user: 1,
        open_date: "",
        open_time: "",
        close_date: "",
        close_time: "",
        images: [],
        order_config: {
          tiers: [],
          // 确保addons有初始值
          addons: []
        }
      };
      currentPlanId.value = null;
      submitting.value = false;
    };
    const onOpenDateChange = (e) => {
      formData.value.open_date = e.detail.value;
    };
    const onOpenTimeChange = (e) => {
      formData.value.open_time = e.detail.value;
    };
    const onCloseDateChange = (e) => {
      formData.value.close_date = e.detail.value;
    };
    const onCloseTimeChange = (e) => {
      formData.value.close_time = e.detail.value;
    };
    const submitPlan = async () => {
      if (!formData.value.artist_name) {
        common_vendor.index.showToast({
          title: "请填写计划名称",
          icon: "none"
        });
        return;
      }
      if (!formData.value.open_date || !formData.value.open_time || !formData.value.close_date || !formData.value.close_time) {
        common_vendor.index.showToast({
          title: "请选择开始和结束时间",
          icon: "none"
        });
        return;
      }
      const openTime = (/* @__PURE__ */ new Date(`${formData.value.open_date} ${formData.value.open_time}`)).getTime() / 1e3;
      const closeTime = (/* @__PURE__ */ new Date(`${formData.value.close_date} ${formData.value.close_time}`)).getTime() / 1e3;
      if (closeTime <= openTime) {
        common_vendor.index.showToast({
          title: "结束时间必须晚于开始时间",
          icon: "none"
        });
        return;
      }
      const params = {
        artist_name: formData.value.artist_name,
        artist_type: formData.value.artist_type,
        order_type: formData.value.order_type,
        max_participants: formData.value.max_participants,
        max_submissions_per_user: formData.value.max_submissions_per_user,
        open_time: openTime,
        close_time: closeTime,
        images: formData.value.images,
        order_config: {
          // 确保价格是浮点数
          tiers: formData.value.order_config.tiers.map((tier) => ({
            ...tier,
            price: parseFloat(tier.price) || 0
          })),
          // 新增加购配置，确保价格是浮点数
          addons: formData.value.order_config.addons.map((addon) => ({
            ...addon,
            price: parseFloat(addon.price) || 0
          }))
        }
      };
      if (isEditMode.value) {
        params.id = currentPlanId.value;
      }
      submitting.value = true;
      try {
        const url = common_config.websiteUrl.value + (isEditMode.value ? "/brand-manager/order-plan/update" : "/brand-manager/order-plan/add");
        const method = "POST";
        const res = await common_vendor.index.request({
          url,
          method,
          data: params,
          header: {
            "Authorization": getAuthorization(),
            "Content-Type": "application/json"
          }
        });
        if (res.data.status === "success") {
          common_vendor.index.showToast({
            title: isEditMode.value ? "更新成功" : "添加成功",
            icon: "success"
          });
          popup.value.close();
          fetchPlanList(true);
        } else {
          common_vendor.index.showToast({
            title: res.data.message || (isEditMode.value ? "更新失败" : "添加失败"),
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/creator_base/order_plane/order_plane.vue:962", "提交失败:", error);
        common_vendor.index.showToast({
          title: "请求失败，请稍后重试",
          icon: "none"
        });
      } finally {
        submitting.value = false;
      }
    };
    const closeDialog = () => {
      popup.value.close();
    };
    const confirmDelete = (id) => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要删除该开单计划吗？",
        success: (res) => {
          if (res.confirm) {
            deletePlan(id);
          }
        }
      });
    };
    const deletePlan = async (id) => {
      try {
        const res = await common_vendor.index.request({
          url: common_config.websiteUrl.value + "/brand-manager/order-plan/delete?id=" + id,
          method: "POST",
          header: {
            "Authorization": getAuthorization(),
            "Content-Type": "application/json"
          }
        });
        if (res.data.status === "success") {
          common_vendor.index.showToast({
            title: "删除成功",
            icon: "success"
          });
          fetchPlanList(true);
        } else {
          common_vendor.index.showToast({
            title: res.data.message || "删除失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/creator_base/order_plane/order_plane.vue:1015", "删除失败:", error);
        common_vendor.index.showToast({
          title: "网络错误",
          icon: "none"
        });
      }
    };
    const removeImage = (index) => {
      formData.value.images.splice(index, 1);
    };
    const removeTier = (index) => {
      if (formData.value.order_config.tiers.length > 1) {
        formData.value.order_config.tiers.splice(index, 1);
      }
    };
    const removeAddon = (index) => {
      if (formData.value.order_config.addons.length > 1) {
        formData.value.order_config.addons.splice(index, 1);
      }
    };
    const onArtistTypeChange = (e) => {
      formData.value.artist_type = parseInt(e.detail.value) + 1;
    };
    const onOrderTypeChange = (e) => {
      const selectedIndex = parseInt(e.detail.value);
      formData.value.order_type = orderTypes[selectedIndex].value;
    };
    const getOrderTypeIndex = (type) => {
      return orderTypes.findIndex((item) => item.value === type);
    };
    const previewImages = (images, current) => {
      common_vendor.index.previewImage({
        current,
        urls: images,
        indicator: "number"
      });
    };
    const formatDate = (timestamp, format = "yyyy-MM-dd HH:mm") => {
      if (!timestamp)
        return "";
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      if (format === "yyyy-MM-dd") {
        return `${year}-${month}-${day}`;
      }
      if (format === "HH:mm") {
        return `${hours}:${minutes}`;
      }
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    };
    const getOrderTypeText = (type) => {
      const map = {
        1: "长期接单",
        2: "限时手速",
        3: "限时抽选",
        4: "限时黑箱卡",
        9: "关闭投递"
      };
      return map[type] || "未知类型";
    };
    const getStatusText = (plan) => {
      const now = Math.floor(Date.now() / 1e3);
      if (now < plan.open_time)
        return "未开始";
      if (now > plan.close_time)
        return "已结束";
      return "进行中";
    };
    const getStatusClass = (plan) => {
      const now = Math.floor(Date.now() / 1e3);
      if (now < plan.open_time)
        return "upcoming";
      if (now > plan.close_time)
        return "inactive";
      return "active";
    };
    return (_ctx, _cache) => {
      var _a, _b;
      return common_vendor.e({
        a: common_vendor.f(tabs, (tab, k0, i0) => {
          return {
            a: common_vendor.t(tab.label),
            b: tab.value,
            c: activeTab.value === tab.value ? 1 : "",
            d: common_vendor.o(($event) => switchTab(tab.value), tab.value)
          };
        }),
        b: loading.value
      }, loading.value ? {
        c: common_vendor.p({
          status: "loading"
        })
      } : planList.value.length > 0 ? {
        e: common_vendor.f(planList.value, (plan, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(plan.artist_name),
            b: common_vendor.t(getOrderTypeText(plan.order_type)),
            c: common_vendor.t(getStatusText(plan)),
            d: common_vendor.n(getStatusClass(plan)),
            e: common_vendor.o(($event) => editPlan(plan), plan.id),
            f: common_vendor.o(($event) => confirmDelete(plan.id), plan.id),
            g: plan.images && plan.images.length
          }, plan.images && plan.images.length ? {
            h: common_vendor.f(plan.images, (img, index, i1) => {
              return {
                a: index,
                b: img,
                c: common_vendor.o(($event) => previewImages(plan.images, index), index)
              };
            })
          } : {}, {
            i: "5ec69793-1-" + i0,
            j: common_vendor.t(plan.max_participants),
            k: common_vendor.t(plan.max_submissions_per_user),
            l: "5ec69793-2-" + i0,
            m: common_vendor.t(formatDate(plan.open_time * 1e3)),
            n: common_vendor.t(formatDate(plan.close_time * 1e3)),
            o: plan.order_config && plan.order_config.tiers && plan.order_config.tiers.length
          }, plan.order_config && plan.order_config.tiers && plan.order_config.tiers.length ? {
            p: common_vendor.f(plan.order_config.tiers, (tier, index, i1) => {
              return {
                a: common_vendor.t(tier.title),
                b: common_vendor.t(tier.price),
                c: common_vendor.t(tier.description),
                d: index
              };
            })
          } : {}, {
            q: plan.id
          });
        }),
        f: common_vendor.p({
          type: "person",
          size: "16",
          color: "#666"
        }),
        g: common_vendor.p({
          type: "calendar",
          size: "16",
          color: "#666"
        })
      } : {}, {
        d: planList.value.length > 0,
        h: !loading.value
      }, !loading.value ? common_vendor.e({
        i: loadingStatus.value === "loading"
      }, loadingStatus.value === "loading" ? {} : {}, {
        j: loadingStatus.value === "noMore" && planList.value.length !== 0
      }, loadingStatus.value === "noMore" && planList.value.length !== 0 ? {} : {}) : {}, {
        k: planList.value.length === 0 && !loading.value
      }, planList.value.length === 0 && !loading.value ? {
        l: common_assets._imports_0$12
      } : {}, {
        m: common_vendor.o(loadMore),
        n: scrollHeight.value + "px",
        o: common_vendor.p({
          type: "plusempty",
          size: "30",
          color: "#fff"
        }),
        p: common_vendor.o(showAddDialog),
        q: common_vendor.t(isEditMode.value ? "编辑开单计划" : "新增开单计划"),
        r: common_vendor.o(closeDialog),
        s: common_vendor.p({
          type: "closeempty",
          size: "24",
          color: "#999"
        }),
        t: formData.value.artist_name,
        v: common_vendor.o(($event) => formData.value.artist_name = $event.detail.value),
        w: common_vendor.t(((_a = artistTypes[formData.value.artist_type - 1]) == null ? void 0 : _a.text) || "请选择接单类型"),
        x: common_vendor.o(onArtistTypeChange),
        y: formData.value.artist_type,
        z: artistTypes,
        A: common_vendor.t(((_b = orderTypes.find((t) => t.value === formData.value.order_type)) == null ? void 0 : _b.text) || "请选择接单方式"),
        B: common_vendor.o(onOrderTypeChange),
        C: getOrderTypeIndex(formData.value.order_type),
        D: orderTypes,
        E: common_vendor.o(($event) => formData.value.max_participants = $event),
        F: common_vendor.p({
          min: 1,
          max: 1e3,
          modelValue: formData.value.max_participants
        }),
        G: common_vendor.o(($event) => formData.value.max_submissions_per_user = $event),
        H: common_vendor.p({
          min: 1,
          max: 10,
          modelValue: formData.value.max_submissions_per_user
        }),
        I: common_vendor.t(formData.value.open_date || "选择日期"),
        J: formData.value.open_date,
        K: common_vendor.o(onOpenDateChange),
        L: common_vendor.t(formData.value.open_time || "选择时间"),
        M: formData.value.open_time,
        N: common_vendor.o(onOpenTimeChange),
        O: common_vendor.t(formData.value.close_date || "选择日期"),
        P: formData.value.close_date,
        Q: common_vendor.o(onCloseDateChange),
        R: common_vendor.t(formData.value.close_time || "选择时间"),
        S: formData.value.close_time,
        T: common_vendor.o(onCloseTimeChange),
        U: uploading.value
      }, uploading.value ? {
        V: common_vendor.p({
          status: "loading"
        }),
        W: common_vendor.t(uploadedCount.value),
        X: common_vendor.t(totalToUpload.value)
      } : {}, {
        Y: common_vendor.f(formData.value.images, (img, index, i0) => {
          return {
            a: img,
            b: common_vendor.o(($event) => removeImage(index), index),
            c: "5ec69793-9-" + i0 + ",5ec69793-4",
            d: index
          };
        }),
        Z: common_vendor.p({
          type: "close",
          size: "18",
          color: "#fff"
        }),
        aa: formData.value.images.length < 9 && !uploading.value
      }, formData.value.images.length < 9 && !uploading.value ? {
        ab: common_vendor.p({
          type: "plusempty",
          size: "28",
          color: "#999"
        }),
        ac: common_vendor.o(chooseAndUploadImages)
      } : {}, {
        ad: tierOptions.value,
        ae: common_vendor.o(onTierPickerChange),
        af: common_vendor.f(formData.value.order_config.tiers, (tier, index, i0) => {
          return common_vendor.e(formData.value.order_config.tiers.length > 1 ? {
            a: common_vendor.o(($event) => removeTier(index), index),
            b: "5ec69793-11-" + i0 + ",5ec69793-4",
            c: common_vendor.p({
              type: "trash",
              size: "18",
              color: "#f56c6c"
            })
          } : {}, {
            d: tier.title,
            e: common_vendor.o(($event) => tier.title = $event.detail.value, index),
            f: tier.price,
            g: common_vendor.o(($event) => tier.price = $event.detail.value, index),
            h: tier.description,
            i: common_vendor.o(($event) => tier.description = $event.detail.value, index),
            j: index
          });
        }),
        ag: formData.value.order_config.tiers.length > 1,
        ah: addonOptions.value,
        ai: common_vendor.o(onAddonPickerChange),
        aj: common_vendor.f(formData.value.order_config.addons, (addon, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(index + 1)
          }, formData.value.order_config.addons.length > 1 ? {
            b: common_vendor.o(($event) => removeAddon(index), index),
            c: "5ec69793-12-" + i0 + ",5ec69793-4",
            d: common_vendor.p({
              type: "trash",
              size: "18",
              color: "#f56c6c"
            })
          } : {}, {
            e: addon.title,
            f: common_vendor.o(($event) => addon.title = $event.detail.value, index),
            g: addon.price,
            h: common_vendor.o(($event) => addon.price = $event.detail.value, index),
            i: addon.description,
            j: common_vendor.o(($event) => addon.description = $event.detail.value, index),
            k: index
          });
        }),
        ak: formData.value.order_config.addons.length > 1,
        al: common_vendor.t(submitting.value ? "提交中..." : "提交"),
        am: common_vendor.o(submitPlan),
        an: submitting.value,
        ao: common_vendor.sr(popup, "5ec69793-4", {
          "k": "popup"
        }),
        ap: common_vendor.p({
          type: "bottom"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-5ec69793"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/creator_base/order_plane/order_plane.js.map
