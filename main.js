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


uni.loadFontFace({
	family: 'cutefont',
	source: `url("https://images1.fantuanpu.com/font/ry-super-less-rokk.ttf")`
})
uni.loadFontFace({
	family: 'alimamamshuhei',
	source: `url("https://images1.fantuanpu.com/font/AlimamaShuHeiTi-Bold.ttf")`
})


// #ifdef VUE3
import {
	createSSRApp
} from 'vue'
export function createApp() {
	const app = createSSRApp(App)
	return {
		app
	}
}
// #endif