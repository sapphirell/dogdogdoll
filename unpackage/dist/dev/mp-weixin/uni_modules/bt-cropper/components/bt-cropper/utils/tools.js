"use strict";
const common_vendor = require("../../../../../common/vendor.js");
const systemInfo = common_vendor.index.getSystemInfoSync();
function parseUnit(size) {
  if (typeof size == "number" || !isNaN(Number(size))) {
    return common_vendor.index.upx2px(size);
  } else if (typeof size === "string") {
    if (size.endsWith("rpx")) {
      return parseUnit(size.replace("rpx", ""));
    } else if (size.endsWith("px")) {
      return Number(size.replace("px", ""));
    } else if (size.endsWith("vw")) {
      return Number(size.replace("vw", "")) * systemInfo.screenWidth / 100;
    } else if (size.endsWith("vh")) {
      return Number(size.replace("vh", "")) * systemInfo.screenHeight / 100;
    }
  }
  return 0;
}
exports.parseUnit = parseUnit;
