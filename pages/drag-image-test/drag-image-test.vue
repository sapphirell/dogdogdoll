<template>
  <view style="min-height: 100vh;width: 100vw;">
    <!-- 基本使用 -->
    <shmily-drag-image v-if="list.length > 0" v-model="list" border-radius="20"></shmily-drag-image>

    <!-- 限定图片宽度 -->
    <!-- <shmily-drag-image v-model="list" :imageWidth="224"></shmily-drag-image> -->

    <!-- 限定列数 -->
    <!-- <shmily-drag-image v-model="list" :cols="3"></shmily-drag-image> -->

    <!-- 自定义添加、删除 -->
    <!-- <shmily-drag-image v-model="list" :addImage="addImage" :delImage="delImage"></shmily-drag-image> -->
    
    <!-- 对象数组 -->
    <!-- <shmily-drag-image v-model="lists" keyName="src" :addImage="addImages" :delImage="delImage"></shmily-drag-image> -->
  </view>
</template>

<script setup>
	import {
		ref,
		computed
	} from 'vue';
	import {
		onShow
	} from '@dcloudio/uni-app';
	import {
		websiteUrl,
		wechatSignLogin,
		getUserInfo,
		global,
		asyncGetUserInfo,
	} from "../../common/config.js";

	const list = ref([])
	function getAccountBookData(type) {
		console.log(global)
		if (!global.isLogin) {
			return
		}
		let token = uni.getStorageSync('token');
		let url = websiteUrl.value + '/with-state/account-book';
		if (type && type !== "全部") {
			url = websiteUrl.value + '/with-state/account-book?type=' + type;
		}
	
		// 获取账本数据 /with-state//account-book
		uni.request({
			url: url,
			method: 'GET',
			header: {
				'Authorization': token
			},
			success: (res) => {
			
				list.value = res.data.data.account_books
					console.log(list.value);
			},
			fail: (err) => {
				console.log(err);
			}
		});
	
	}
	  asyncGetUserInfo().then((userInfo) => {
		getAccountBookData()
	})
	
  // export default {
  //   data() {
  //     return {
  //       // 排序后的图片列表
  //       list: [
  //         'https://images1.fantuanpu.com/box/admin/81d4bbbf81e43991bdde32a1639c84cb',
  //         'https://images1.fantuanpu.com/box/admin/4645eb95356f785d8a48cd27f3bdbbce',
  //         'https://images1.fantuanpu.com/spd/log/2025_03_11/68a23eb9f741a49a6980d931035f0eb7.jpg',
		//   'https://images1.fantuanpu.com/box/admin/81d4bbbf81e43991bdde32a1639c84cb',
		//   'https://images1.fantuanpu.com/box/admin/4645eb95356f785d8a48cd27f3bdbbce',
		//   'https://images1.fantuanpu.com/spd/log/2025_03_11/68a23eb9f741a49a6980d931035f0eb7.jpg',
  //       ],
  //       lists: [
  //         {
  //           src: 'https://images1.fantuanpu.com/box/admin/81d4bbbf81e43991bdde32a1639c84cb',
  //         },
  //         {
  //           src: 'https://images1.fantuanpu.com/box/admin/4645eb95356f785d8a48cd27f3bdbbce',
  //         },
  //         {
  //           src: 'https://images1.fantuanpu.com/spd/log/2025_03_11/68a23eb9f741a49a6980d931035f0eb7.jpg',
  //         }, {
  //           src: 'https://images1.fantuanpu.com/box/admin/81d4bbbf81e43991bdde32a1639c84cb',
  //         },
  //         {
  //           src: 'https://images1.fantuanpu.com/box/admin/4645eb95356f785d8a48cd27f3bdbbce',
  //         },
  //         {
  //           src: 'https://images1.fantuanpu.com/spd/log/2025_03_11/68a23eb9f741a49a6980d931035f0eb7.jpg',
  //         },
  //       ],
  //     }
  //   },
  //   methods: {
  //     addImage() {
  //       console.log('addImage');
  //       // 将图片地址添加到图片列表
  //       this.list.push('https://web.shmily.ren/shmily-drag-image/static/4.jpg')
  //     },
  //     addImages() {
  //       console.log('addImages');
  //       // 将图片地址添加到图片列表
  //       this.lists.push({
  //         id: 4,
  //         src: 'https://web.shmily.ren/shmily-drag-image/static/4.jpg',
  //       })
  //     },
  //     delImage(done) {
  //       console.log('delImage');
  //       uni.showModal({
  //         content: '是否删除?',
  //         success: (res) => {
  //           if(res.confirm) {
  //             // 执行 done() 删除
  //             done()
  //           }
  //         }
  //       })
  //     },
  //   }
  // }
</script>

<style>

</style>
