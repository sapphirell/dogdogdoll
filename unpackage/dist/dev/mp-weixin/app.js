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
}
const _sfc_main = {
  onLaunch: function() {
    console.log("App Launch");
  },
  onShow: function() {
    console.log("App Show");
  },
  onHide: function() {
    console.log("App Hide");
  }
};
common_vendor.index.loadFontFace({
  family: "alimamamshuhei",
  source: 'url("https://images1.fantuanpu.com/font/AlimamaShuHeiTi-Bold.ttf")',
  success() {
    console.log("load font success");
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
