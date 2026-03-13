import devEnvRaw from '../.env.development?raw'
import prodEnvRaw from '../.env.production?raw'
import testEnvRaw from '../.env.test?raw'

// 把 .env 文本解析成普通对象，只保留 `KEY=value` 形式的配置项。
function parseEnvRaw(rawText) {
  const result = {}
  String(rawText || '')
    .split(/\r?\n/)
    .forEach((line) => {
      const text = String(line || '').trim()
      if (!text || text.startsWith('#')) return
      const eqIndex = text.indexOf('=')
      if (eqIndex <= 0) return
      const key = text.slice(0, eqIndex).trim()
      const value = text.slice(eqIndex + 1).trim()
      if (!key) return
      result[key] = value
    })
  return result
}

// 三套环境文件统一收口到这里，config.js 只按名称读取，不直接碰具体文件。
export const BUILD_ENV_MAP = Object.freeze({
  development: Object.freeze(parseEnvRaw(devEnvRaw)),
  production: Object.freeze(parseEnvRaw(prodEnvRaw)),
  test: Object.freeze(parseEnvRaw(testEnvRaw))
})

// 按当前打包环境取值，找到第一个非空配置就返回。
export function getBuildEnvValue(profileName, ...keys) {
  const profile = BUILD_ENV_MAP[String(profileName || '').trim().toLowerCase()] || {}
  for (const key of keys) {
    const value = profile[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}
