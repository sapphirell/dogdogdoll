// 打包环境总开关。
// 以后只改 `envFileName`，不要再改 `config.js` 里的取值逻辑。
//
// 可选值：
// - `development` -> 读取 `.env.development`
// - `test`        -> 读取 `.env.test`
// - `production`  -> 读取 `.env.production`
//
// `allowSelectedServerOverride` 用来控制设备本地缓存的 `selectedServer`
// 是否允许覆盖当前环境里的默认后端地址。
export const BUILD_PROFILE = Object.freeze({
  envFileName: 'development', // 本地开发
  // envFileName: 'test',        // 测试环境
  // envFileName: 'production',  // 生产环境
  allowSelectedServerOverride: false
})
