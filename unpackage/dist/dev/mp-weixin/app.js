"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/homepage/homepage.js";
  "./pages/stock/stock.js";
  "./pages/mine/mine.js";
  "./pages/watch_demo/watch_demo.js";
  "./pages/goods/goods.js";
  "./pages/brand/brand.js";
  "./pages/calendar/calendar.js";
  "./pages/pop_croper/pop_croper.js";
  "./pages/setting/setting.js";
  "./pages/setting/password/password.js";
  "./pages/setting/tel_phone/tel_phone.js";
  "./pages/stock/account_book_form/account_book_form.js";
  "./pages/stock/showcase_form/showcase_form.js";
  "./pages/stock/bill_form/bill_form.js";
  "./pages/collocation/collocation.js";
  "./pages/collocation_share/collocation_share.js";
  "./pages/user_page/user_page.js";
  "./pages/message_list/message_list.js";
  "./pages/message_info/message_info.js";
  "./pages/register/register.js";
  "./pages/user_like/user_like.js";
  "./pages/collocation_square/collocation_square.js";
  "./pages/sale_news/sale_news.js";
  "./pages/treehole_publish/treehole_publish.js";
  "./pages/treehole_detail/treehole_detail.js";
  "./pages/reset_password/reset_password.js";
  "./pages/setting/username/username.js";
  "./pages/my_comment/my_comment.js";
  "./pages/my_collocation/my_collocation.js";
  "./pages/article_detail/article_detail.js";
  "./pages/loadding/loadding.js";
  "./pages/private/private.js";
  "./pages/permission/permission.js";
  "./pages/drag-image-test/drag-image-test.js";
  "./pages/account_book_preview/account_book_preview.js";
  "./pages/creator_base/creator_base.js";
  "./pages/creator_base/brand_edit/brand_edit.js";
  "./pages/creator_base/goods_list/goods_list.js";
  "./pages/creator_base/goods_editor/goods_editor.js";
  "./pages/creator_base/collocation_list/collocation_list.js";
  "./pages/creator_base/artist_info/artist_info.js";
  "./pages/creator_base/artist_setting/artist_setting.js";
  "./pages/artist_info/artist_info.js";
  "./pages/creator_base/set_showcase/set_showcase.js";
  "./pages/creator_base/faceup_editor/faceup_editor.js";
  "./pages/creator_base/order_plane/order_plane.js";
  "./pages/artwork/artwork.js";
  "./pages/creator_base/news/news.js";
}
const _sfc_main = {
  __name: "App",
  setup(__props) {
    common_vendor.onLaunch(() => {
      common_vendor.index.__f__("log", "at App.vue:5", "App Launch");
    });
    common_vendor.onShow(() => {
      common_vendor.index.__f__("log", "at App.vue:11", "App Show");
      setTimeout(() => {
        common_vendor.index.__f__("log", "at App.vue:13", "开始加载字体...");
        loadFonts();
        common_vendor.index.__f__("log", "at App.vue:15", "结束加载字体");
      }, 2e3);
    });
    common_vendor.onHide(() => {
      common_vendor.index.__f__("log", "at App.vue:20", "App Hide");
    });
    function loadFonts() {
      common_vendor.index.loadFontFace({
        family: "cutefont",
        // 根据平台选择路径，或者使用同一路径
        source: 'url("https://images1.fantuanpu.com/font/ry-super-less-rokk.ttf")',
        global: true,
        success() {
          common_vendor.index.__f__("log", "at App.vue:31", "字体cutefont加载成功");
        },
        fail(err) {
          common_vendor.index.__f__("log", "at App.vue:34", "字体cutefont加载失败", err);
        }
      });
    }
    return () => {
    };
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
