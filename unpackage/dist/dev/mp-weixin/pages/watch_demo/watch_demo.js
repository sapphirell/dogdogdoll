"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "watch_demo",
  setup(__props) {
    const person = common_vendor.ref({ name: "john", age: 18 });
    common_vendor.watch(() => person.value.name, (newVal, oldVal) => {
      common_vendor.index.__f__("log", "at pages/watch_demo/watch_demo.vue:14", "newVal", newVal);
      common_vendor.index.__f__("log", "at pages/watch_demo/watch_demo.vue:15", "oldVal", oldVal);
    }, { deep: true });
    return (_ctx, _cache) => {
      return {
        a: person.value.name,
        b: common_vendor.o(($event) => person.value.name = $event.detail.value),
        c: common_vendor.t(person.value.name)
      };
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/watch_demo/watch_demo.js.map
