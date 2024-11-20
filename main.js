import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false


App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// 加载alimama数黑体
uni.loadFontFace({
  family: 'alimamamshuhei',
  source: 'url("https://images1.fantuanpu.com/font/AlimamaShuHeiTi-Bold.ttf")',
  success() {
	  console.log('load font success')
  }
})

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif