"use strict";
const common_vendor = require("../../common/vendor.js");
const common_config = require("../../common/config.js");
if (!Array) {
  const _easycom_view_logs2 = common_vendor.resolveComponent("view-logs");
  const _easycom_uni_swipe_action_item2 = common_vendor.resolveComponent("uni-swipe-action-item");
  const _easycom_uni_swipe_action2 = common_vendor.resolveComponent("uni-swipe-action");
  (_easycom_view_logs2 + _easycom_uni_swipe_action_item2 + _easycom_uni_swipe_action2)();
}
const _easycom_view_logs = () => "../../components/view-logs/view-logs.js";
const _easycom_uni_swipe_action_item = () => "../../uni_modules/uni-swipe-action/components/uni-swipe-action-item/uni-swipe-action-item.js";
const _easycom_uni_swipe_action = () => "../../uni_modules/uni-swipe-action/components/uni-swipe-action/uni-swipe-action.js";
if (!Math) {
  (_easycom_view_logs + _easycom_uni_swipe_action_item + _easycom_uni_swipe_action)();
}
const _sfc_main = {
  __name: "message_list",
  setup(__props) {
    const messageList = common_vendor.ref([]);
    const unreadCount = common_vendor.ref(0);
    const page = common_vendor.ref(1);
    const isRefreshing = common_vendor.ref(false);
    const hasMore = common_vendor.ref(true);
    const loading = common_vendor.ref(false);
    const swipeOptions = (item) => {
      return [
        {
          text: "删除",
          style: {
            backgroundColor: "#dd524d"
          },
          data: {
            type: "delete",
            id: item.id
          }
        },
        {
          text: item.is_read ? "已读" : "标记已读",
          style: {
            backgroundColor: "#6fd0d4"
          },
          data: {
            type: "read",
            id: item.id
          }
        }
      ];
    };
    common_vendor.onMounted(async () => {
      await common_config.asyncGetUserInfo();
      fetchMessages();
      fetchUnreadCount();
      common_vendor.index.setNavigationBarTitle({
        title: "消息"
      });
    });
    const fetchMessages = async (isLoadMore = false) => {
      try {
        loading.value = true;
        const targetPage = isLoadMore ? page.value : 1;
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl.value}/with-state/user-messages?page=${targetPage}`,
          header: {
            Authorization: common_vendor.index.getStorageSync("token")
          }
        });
        if (res.data.status === "success") {
          const newMessages = res.data.data.message_list;
          if (isLoadMore) {
            messageList.value = [...messageList.value, ...newMessages];
          } else {
            messageList.value = newMessages;
          }
          hasMore.value = newMessages.length >= 10;
          page.value = targetPage + (hasMore.value ? 1 : 0);
        }
      } catch (error) {
        common_vendor.index.showToast({
          title: "消息加载失败",
          icon: "none"
        });
      } finally {
        loading.value = false;
        isRefreshing.value = false;
      }
    };
    const loadMore = () => {
      common_vendor.index.__f__("log", "at pages/message_list/message_list.vue:138", "触发加载更多", loading.value, hasMore.value);
      if (loading.value || !hasMore.value)
        return;
      fetchMessages(true);
    };
    const fetchUnreadCount = async () => {
      try {
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl.value}/with-state/unread-message-count`,
          header: {
            Authorization: common_vendor.index.getStorageSync("token")
          }
        });
        if (res.data.status === "success") {
          unreadCount.value = res.data.data.count;
        }
      } catch (error) {
        common_vendor.index.showToast({
          title: "未读数获取失败",
          icon: "none"
        });
      }
    };
    const handleSwipeClick = (e) => {
      const {
        type,
        id
      } = e.content.data;
      if (type === "delete") {
        showDeleteConfirm(id);
      } else if (type === "read") {
        markAsRead(id);
      }
    };
    const showDeleteConfirm = (messageId) => {
      common_vendor.index.showModal({
        title: "删除确认",
        content: "确定要删除这条消息吗？",
        success: (res) => {
          if (res.confirm) {
            deleteMessage(messageId);
          }
        }
      });
    };
    const deleteMessage = async (messageId) => {
      try {
        await common_vendor.index.request({
          url: `${common_config.websiteUrl.value}/with-state/delete-message`,
          method: "POST",
          header: {
            "Authorization": common_vendor.index.getStorageSync("token"),
            "Content-Type": "application/json"
          },
          data: {
            message_id: messageId
          }
        });
        messageList.value = messageList.value.filter((item) => item.id !== messageId);
        fetchUnreadCount();
        common_vendor.index.showToast({
          title: "删除成功"
        });
      } catch (error) {
        common_vendor.index.showToast({
          title: "删除失败",
          icon: "none"
        });
      }
    };
    const markAsRead = async (messageId) => {
      try {
        await common_vendor.index.request({
          url: `${common_config.websiteUrl.value}/with-state/mark-message-read`,
          method: "POST",
          header: {
            "Authorization": common_vendor.index.getStorageSync("token"),
            "Content-Type": "application/json"
          },
          data: {
            message_id: messageId
          }
        });
        const item = messageList.value.find((i) => i.id === messageId);
        if (item && !item.is_read) {
          item.is_read = 1;
          unreadCount.value--;
        }
      } catch (error) {
        common_vendor.index.showToast({
          title: "标记失败",
          icon: "none"
        });
      }
    };
    const gotoDetail = (id) => {
      common_vendor.index.navigateTo({
        url: `/pages/message_info/message_info?message_id=${id}`
      });
    };
    const formatTime = (timestamp) => {
      const date = new Date(timestamp * 1e3);
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(messageList.value, (item, k0, i0) => {
          return {
            a: item.cover_image,
            b: common_vendor.t(item.title),
            c: common_vendor.t(item.msg),
            d: !item.is_read ? 1 : "",
            e: common_vendor.t(formatTime(item.created_at)),
            f: common_vendor.o(($event) => gotoDetail(item.id), item.id),
            g: item.id,
            h: common_vendor.o(handleSwipeClick, item.id),
            i: "cb03c942-2-" + i0 + ",cb03c942-1",
            j: common_vendor.p({
              ["right-options"]: swipeOptions(item),
              threshold: 0.4
            })
          };
        }),
        b: loading.value
      }, loading.value ? {} : {}, {
        c: !hasMore.value
      }, !hasMore.value ? {} : {}, {
        d: common_vendor.o(loadMore)
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/message_list/message_list.js.map
