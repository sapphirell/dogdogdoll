<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('App Launch')

  
})

onShow(() => {
  console.log('App Show')
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

  // 加载第二个字体
  uni.loadFontFace({
    family: 'alimamamshuhei',
    source: 'url("https://images1.fantuanpu.com/font/AlimamaShuHeiTi-Bold.ttf")',
    global: true,
    success() {
      console.log('字体alimamamshuhei加载成功')
    },
    fail(err) {
      console.log('字体alimamamshuhei加载失败', err)
    }
  })
}
</script>

<style>
	/*每个页面公共css */
	/* @import 'common/font.css'; */

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

	.font-cute {
		font-family: "cutefont";
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