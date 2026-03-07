<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

import { initLoginState } from '@/common/config.js'
import { initIMGlobalLifecycle, ensureIMConnected } from '@/common/im.js'

const PRIVACY_KEY = 'privacyAgreementStatus'
let imLifecycleInited = false
let privacyEventBound = false

function hasPrivacyAgreed() {
  try {
    if (uni.getStorageSync(PRIVACY_KEY) === 'agreed') return true
  } catch (e) {
    // ignore
  }

  try {
    if (typeof plus !== 'undefined' && plus.runtime && typeof plus.runtime.isAgreePrivacy === 'function') {
      const nativeAgreed = !!plus.runtime.isAgreePrivacy()
      if (nativeAgreed) {
        uni.setStorageSync(PRIVACY_KEY, 'agreed')
        return true
      }
    }
  } catch (e) {
    // ignore
  }
  return false
}

function startSdkAfterPrivacyAgreed() {
  if (!hasPrivacyAgreed()) return
  if (!imLifecycleInited) {
    initIMGlobalLifecycle()
    imLifecycleInited = true
  }
  ensureIMConnected()
}

onLaunch(() => {
  console.log('App Launch')
  // 应用启动时恢复登录状态
  initLoginState()
  startSdkAfterPrivacyAgreed()

  if (!privacyEventBound && typeof uni !== 'undefined' && typeof uni.$on === 'function') {
    privacyEventBound = true
    uni.$on('privacy-agreed', () => {
      startSdkAfterPrivacyAgreed()
    })
  }
  
})

onShow(() => {
  console.log('App Show')
  startSdkAfterPrivacyAgreed()
  setTimeout(() => {
  	  console.log("开始加载字体...")
  	  loadFonts()
  	  console.log("结束加载字体")
  },2000)
})

onHide(() => {
  console.log('App Hide')
})

function loadFonts() {
  // 加载第一个字体
  uni.loadFontFace({
    family: 'cutefont',
    // 根据平台选择路径，或者使用同一路径
    source: 'url("https://images1.fantuanpu.com/font/ry-super-less-rokk.ttf")',
    global: true,
    success() {
      console.log('字体cutefont加载成功')
    },
    fail(err) {
      console.log('字体cutefont加载失败', err)
    }
  })

  // // 加载第二个字体
  // uni.loadFontFace({
  //   family: 'alimamamshuhei',
  //   source: 'url("https://images1.fantuanpu.com/font/AlimamaShuHeiTi-Bold.ttf")',
  //   global: true,
  //   success() {
  //     console.log('字体alimamamshuhei加载成功')
  //   },
  //   fail(err) {
  //     console.log('字体alimamamshuhei加载失败', err)
  //   }
  // })
}
</script>

<style>
	/*每个页面公共css */
	@import 'common/font.css';

	:root {
		/* 全局建议色：用于主要操作按钮 */
		--app-recommend-color: #49caee;
		--app-recommend-color-press: #34bee4;
	}

	.backbody {
		background-color: #C0EDE9;
		height: 100vh;
	}
	
	
	/*  tab图标 */
/* 	.uni-tabbar .uni-tabbar__icon {
		width: 65rpx !important;
		height: 465rpx !important;
	} */
	.avatar {
		border-radius: 50%;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
	}

	.uni-page-head,
	.uni-tabbar {
		padding-top: 15px;
		/* background-color: rgb(168 168 168)!important; */
		/* background: linear-gradient(90deg, rgb(189 199 252 / 59%) 0%, rgba(192, 237, 233, 0.5) 100%); */
	}

	.uni-tabbar__icon {
		position: relative;
		bottom: 5px;
	}

	.font-alimamashuhei {
		font-family: "alimamamshuhei" !important;
	}
	
	.font-title {
		font-family: "title-font"!important;
	}
	
	.font-doll {
		font-family: "RenOuFangSong 16";
	}

	.font-cute {
		font-family: "cutefont";
	}
	
	/* 通用正文排版（提取自树洞正文） */
	.app-readable-text {
		font-size: 32rpx;
		color: #333333;
		line-height: 1.7;
		letter-spacing: 0.5rpx;
		word-break: break-all;
	}
	/* 兼容旧用法 */
	.common-text {
		font-size: 30rpx;
		color: #333333;
		line-height: 1.7;
		letter-spacing: 0.5rpx;
		word-break: break-all;
		margin-bottom: 24rpx;
	}

	.icon_image {
		width: 20px;
		height: 20px;
		padding: 2px;
	}

	.icon_inline_text {
		display: flex;
		/* 使用 Flexbox */
		align-items: flex-end;
		/* 底部对齐 */
	}

	.uni-tabbar-border {
		display: none;
		/*去除导航条border*/
	}

	uni-page-head {
		height: 60px;
	}

	.uni-page-head {
		background-color: rgb(255 255 255);
		color: rgb(0, 0, 0);
		padding-bottom: 15px;
		height: 60px;
		box-shadow: 0 0 15px #00000024;
	}

	text {
		color: #373737;
		font-size: 26rpx;
	}

	/* 头像裁剪框css */
	.bt-container {
		margin: 10px auto;
	}

	/* 文本只显示一行 超出变成省略号 */
	.one_line_text {
		white-space: nowrap;
		/* 禁止换行 */
		overflow: hidden;
		/* 隐藏超出内容 */
		text-overflow: ellipsis;
		/* 显示省略号 */
	}

	/* 高度设置为和宽度一样 */
	.square {

		height: auto;
		aspect-ratio: 1;
	}

	::-webkit-scrollbar {
		width: 0 !important;
		height: 0 !important;
		background-color: transparent !important;
		display: none !important;
	}
</style>
