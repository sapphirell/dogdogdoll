"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "index-brand",
  props: ["brand", "key"],
  setup(__props) {
    const props = __props;
    function jumpBrand() {
      common_vendor.index.navigateTo({
        url: "/pages/brand/brand?brand_id=" + props.brand.id
      });
    }
    function jumpGoods(id) {
      common_vendor.index.navigateTo({
        url: "/pages/goods/goods?goods_id=" + id
      });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.brand.logo_image
      }, __props.brand.logo_image ? {
        b: __props.brand.logo_image
      } : {}, {
        c: __props.brand.brand_name_image,
        d: common_vendor.t(__props.brand.country_name),
        e: common_vendor.t(__props.brand.type),
        f: common_vendor.t(__props.brand.total_goods),
        g: common_vendor.t(__props.brand.description),
        h: common_vendor.o(jumpBrand),
        i: common_vendor.f(__props.brand.goods, (doll, index, i0) => {
          return {
            a: doll.goods_images && doll.goods_images[0],
            b: common_vendor.t(doll.name),
            c: doll.id,
            d: common_vendor.o(($event) => jumpGoods(doll.id), doll.id)
          };
        }),
        j: __props.key
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-aa9d9d58"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/index-brand/index-brand.js.map
