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
  "./pages/news/news.js";
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
}
const _sfc_main = {
  __name: "App",
  setup(__props) {
    return () => {
    };
  }
};
common_vendor.index.loadFontFace({
  family: "alimamamshuhei",
  source: 'url("https://images1.fantuanpu.com/font/AlimamaShuHeiTi-Bold.ttf")',
  success() {
    common_vendor.index.__f__("log", "at main.js:21", "load font success");
  }
});
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
