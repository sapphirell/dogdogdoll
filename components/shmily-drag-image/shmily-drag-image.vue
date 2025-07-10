<template>
	<view class="con">
		<template v-if="viewWidth">
			<movable-area class="area" :style="{ height: areaHeight }" @mouseenter="mouseenter"
				@mouseleave="mouseleave">
				<movable-view v-for="(item, index) in imageList" :key="item.id" class="view" direction="all" :y="item.y"
					:x="item.x" :damping="40" :disabled="item.disable || !item.ready" @change="onChange($event, item)"
					@touchstart="onLongPressStart(item, $event)" @touchend="touchend(item)" @tap="go2editor(item.id)"
					@touchmove="onTouchMove($event, item)" :style="{
						width: viewWidth + 'px', 
						height: viewHeight + 'px', 
						'z-index': item.zIndex, 
						opacity: item.opacity 
					  }">
					<view class="area-con" :style="{
							  width: childWidth, 
							  height: childHeight, 
							  borderRadius: borderRadius + 'rpx',
							  transform: 'scale(' + item.scale + ')',
							  margin: itemMargin + 'px'
							}" :class="{ 'ready' : !item.disable && item.ready  }">
						<image class="pre-image" :src="getFirstImage(item.src)" mode="aspectFill"></image>
						<view class="info-container">
							<text class="name">{{ item.name }}</text>
							<!-- <text class="name">状态{{ item.disable || !item.ready }}</text> -->
							<text class="price">{{item.price}}</text>
							<text class="type">{{ item.type }}</text>
						</view>
					</view>
				</movable-view>
			</movable-area>
		</template>
	</view>
</template>

<script setup>
	import {
		ref,
		computed,
		watch,
		onMounted,
		nextTick,
		getCurrentInstance
	} from 'vue'

	import {
		websiteUrl,
		wechatSignLogin,
		getUserInfo,
		global,
		asyncGetUserInfo,
	} from "../../common/config.js";
	// 定义 props
	const props = defineProps({
		value: {
			type: Array,
			default: () => []
		},
		modelValue: {
			type: Array,
			default: () => []
		},
		keyName: {
			type: String,
			default: 'image_url' // 默认使用image_url作为图片字段
		},
		number: {
			type: Number,
			default: 6
		},
		imageWidth: {
			type: Number,
			default: 0
		},
		cols: {
			type: Number,
			default: 3
		},
		borderRadius: {
			type: String,
			default: 0
		},
		padding: {
			type: Number,
			default: 10
		},
		scale: {
			type: Number,
			default: 1.1
		},
		opacity: {
			type: Number,
			default: 0.7
		},
		// 新增：每个项目之间的边距
		itemMargin: {
			type: Number,
			default: 10
		},
		// 新增：图片与文字的比例
		imageRatio: {
			type: Number,
			default: 0.7 // 图片区域占总高度的70%
		}
	})

	// 定义 emits
	const emit = defineEmits(['input', 'update:modelValue'])

	// 响应式变量
	const imageList = ref([])
	const width = ref(0)
	const add = ref({
		x: 0,
		y: 0
	})
	const colsValue = ref(0)
	const viewWidth = ref(0)
	const viewHeight = ref(0) // 新增高度变量
	const tempItem = ref(null)
	const timer = ref(null)
	const changeStatus = ref(true)
	const preStatus = ref(true)
	const first = ref(true)
	const touchStartY = ref(0); // 触摸起始Y坐标
	const longPressTimer = ref(null);
	const isDragging = ref(false); // 全局拖拽状态

	// 计算属性
	const areaHeight = computed(() => {
		if (imageList.value.length < props.number) {
			return (Math.ceil((imageList.value.length + 1) / colsValue.value) * viewHeight.value) + 'px'
		}
		return (Math.ceil(imageList.value.length / colsValue.value) * viewHeight.value) + 'px'
	})

	// 调整内部容器宽度计算
	const childWidth = computed(() => {
		return (viewWidth.value - rpx2px(props.padding) * 2) + 'px'
	})
	// 新增：内部容器高度计算
	const childHeight = computed(() => {
		return (viewHeight.value - rpx2px(props.padding) * 2) + 'px'
	})
	// 方法
	const getSrc = (item) => {
		return props.keyName !== null ? item[props.keyName] : item
	}
	const getItemData = (item) => {
		return {
			id: item.id,
			src: getSrc(item),
			name: item.name,
			price: item.price,
			type: item.type
		}
	}


	const onChange = (e, item) => {
		if (!item) return
		item.oldX = e.detail.x
		item.oldY = e.detail.y
		if (e.detail.source === 'touch') {
			if (item.moveEnd) {
				item.offset = Math.sqrt(
					Math.pow(item.oldX - item.absX * viewWidth.value, 2) +
					Math.pow(item.oldY - item.absY * viewHeight.value, 2) // 使用viewHeight
				)
			}
			let x = Math.floor((e.detail.x + viewWidth.value / 2) / viewWidth.value)
			if (x >= colsValue.value) return
			let y = Math.floor((e.detail.y + viewHeight.value / 2) / viewHeight.value) // 使用viewHeight
			let index = colsValue.value * y + x

			if (item.index !== index && index < imageList.value.length) {
				changeStatus.value = false
				imageList.value.forEach(obj => {
					if (item.index > index && obj.index >= index && obj.index < item.index) {
						changeObj(obj, 1)
					} else if (item.index < index && obj.index <= index && obj.index > item.index) {
						changeObj(obj, -1)
					} else if (obj.id !== item.id) {
						obj.offset = 0
						obj.x = obj.oldX
						obj.y = obj.oldY
						setTimeout(() => {
							nextTick(() => {
								obj.x = obj.absX * viewWidth.value
								obj.y = obj.absY * viewHeight.value
							})
						}, 0)
					}
				})
				item.index = index
				item.absX = x
				item.absY = y
				if (!item.moveEnd) {
					setTimeout(() => {
						nextTick(() => {
							item.x = item.absX * viewWidth.value
							item.y = item.absY * viewHeight.value
						})
					}, 0)
				}
				sortList()
			}
		}
	}

	const changeObj = (obj, i) => {
		obj.index += i
		obj.offset = 0
		obj.x = obj.oldX
		obj.y = obj.oldY
		obj.absX = obj.index % colsValue.value
		obj.absY = Math.floor(obj.index / colsValue.value)
		setTimeout(() => {
			nextTick(() => {
				obj.x = obj.absX * viewWidth.value
				obj.y = obj.absY * viewHeight.value
			})
		}, 0)
	}
	// 长按开始拖拽
	const onLongPressStart = (item, e) => {
		// 记录触摸起始位置
		touchStartY.value = e.touches[0].clientY;

		// 清除之前的计时器
		if (longPressTimer.value) {
			clearTimeout(longPressTimer.value);
			longPressTimer.value = null;
		}

		// 遍历清除所有item的ready
		imageList.value.forEach(item => {
			item.ready = false
			item.disable = true
		})
		console.log("长按开始")

		// 设置长按计时器（500ms）
		longPressTimer.value = setTimeout(() => {
			console.log("长按成功！")
			uni.vibrateShort({
				success: () => {
					console.log('触感反馈');
				}
			});
			item.ready = true
			item.disable = false
			isDragging.value = true
			touchstart(item);
		}, 240);
	};

	const touchstart = (item, e) => {
		console.log("进入touchstart")
		imageList.value.forEach(v => {
			v.zIndex = v.index + 9
		})
		item.zIndex = 99
		item.moveEnd = true
		tempItem.value = item
		timer.value = setTimeout(() => {
			item.scale = props.scale
			item.opacity = props.opacity
			clearTimeout(timer.value)
			timer.value = null
		}, 200)
	}

	const touchend = (item) => {
		// previewImage(item)
		item.scale = 1
		item.opacity = 1
		item.x = item.oldX
		item.y = item.oldY
		item.offset = 0
		item.moveEnd = false

		// 遍历清除所有item的ready
		console.log("结束点击，清理ready")
		imageList.value.forEach(item => {
			item.ready = false
			item.disable = true
		})

		isDragging.value = false
		// 清除之前的计时器
		if (longPressTimer.value) {
			clearTimeout(longPressTimer.value);
			longPressTimer.value = null;
		}
		setTimeout(() => {
			nextTick(() => {
				item.x = item.absX * viewWidth.value
				item.y = item.absY * viewHeight.value
				tempItem.value = null
				changeStatus.value = true
			})
		}, 0)
	}
	// 获取第一张图片 - 修复路径问题
	const getFirstImage = (imageUrls) => {
		if (!imageUrls) return '';

		// 处理可能包含逗号分隔的多个URL
		const urls = imageUrls.split(',');
		const firstUrl = urls[0]?.trim() || '';

		// 如果是完整URL直接返回
		if (firstUrl.startsWith('http')) {
			return firstUrl;
		}

		// 默认返回空字符串
		return '';
	};


	const previewImage = (item) => {
		if (timer.value && preStatus.value && changeStatus.value && item.offset < 28.28) {
			clearTimeout(timer.value)
			timer.value = null
			const list = props.modelValue.length ? props.modelValue : props.value
			let srcList = list.map(v => getSrc(v))
			uni.previewImage({
				urls: srcList,
				current: item.src,
				success: () => {
					preStatus.value = false
					setTimeout(() => {
						preStatus.value = true
					}, 600)
				},
				fail: (e) => {
					console.log(e)
				}
			})
		} else if (timer.value) {
			clearTimeout(timer.value)
			timer.value = null
		}
	}

	const mouseenter = () => {
		//#ifdef H5
		imageList.value.forEach(v => {
			v.disable = false
		})
		//#endif
	}

	const mouseleave = () => {
		//#ifdef H5
		if (tempItem.value) {
			imageList.value.forEach(v => {
				v.disable = true
				v.zIndex = v.index + 9
				v.offset = 0
				v.moveEnd = false
				if (v.id === tempItem.value.id) {
					if (timer.value) {
						clearTimeout(timer.value)
						timer.value = null
					}
					v.scale = 1
					v.opacity = 1
					v.x = v.oldX
					v.y = v.oldY
					nextTick(() => {
						v.x = v.absX * viewWidth.value
						v.y = v.absY * viewHeight.value
						tempItem.value = null
					})
				}
			})
			changeStatus.value = true
		}
		//#endif
	}

	const onTouchMove = (e, item) => {
		// 如果正在拖拽，直接返回
		if (isDragging.value) return;

		// 计算移动距离
		const touchY = e.touches[0].clientY;
		const deltaY = Math.abs(touchY - touchStartY.value);

		// 如果垂直移动超过10px，取消长按计时器
		if (deltaY > 10 && longPressTimer.value) {
			clearTimeout(longPressTimer.value);
			longPressTimer.value = null;
		}
	};

	const delImageHandle = (item, index) => {
		imageList.value.splice(index, 1)
		imageList.value.forEach(obj => {
			if (obj.index > item.index) {
				obj.index -= 1
				obj.x = obj.oldX
				obj.y = obj.oldY
				obj.absX = obj.index % colsValue.value
				obj.absY = Math.floor(obj.index / colsValue.value)
				nextTick(() => {
					obj.x = obj.absX * viewWidth.value
					obj.y = obj.absY * viewHeight.value
				})
			}
		})
		add.value.x = (imageList.value.length % colsValue.value) * viewWidth.value
		add.value.y = Math.floor(imageList.value.length / colsValue.value) * viewHeight.value
		sortList()
	}



	const delImageMp = (item, index) => {
		//#ifdef MP
		delImageHandle(item, index)
		//#endif
	}


	//跳转到编辑
	function go2editor(id) {
		uni.navigateTo({
			url: '/pages/stock/account_book_form/account_book_form?account_book_id=' + id
		})
	}

	// 长按取消
	const onLongPressCancel = () => {
		if (longPressTimer.value) {
			clearTimeout(longPressTimer.value);
			longPressTimer.value = null;
		}
	};
	// 更新所有项目的位置（根据当前索引）
	const updateAllItemsPosition = () => {
		listItems.value.forEach(item => {
			// 根据新的索引计算网格位置
			const newAbsX = item.index % colsValue.value;
			const newAbsY = Math.floor(item.index / colsValue.value);

			// 确保位置精确对齐网格
			const targetX = newAbsX * viewWidth.value;
			const targetY = newAbsY * viewWidth.value;

			// 直接设置位置，不使用过渡
			item.x = targetX;
			item.y = targetY;
			item.originX = targetX;
			item.originY = targetY;
			item.absX = newAbsX;
			item.absY = newAbsY;
		});
	};


	const sortList = () => {
		const result = []
		const source = props.modelValue.length ? props.modelValue : props.value
		const list = [...imageList.value].sort((a, b) => a.index - b.index)

		for (let s of list) {
			const item = source.find(d => getSrc(d) === s.src)
			if (item) {
				result.push(item)
			} else {
				if (props.keyName !== null) {
					result.push({
						[props.keyName]: s.src
					})
				} else {
					result.push(s.src)
				}
			}
		}

		emit('input', result)
		emit('update:modelValue', result)
	}

	const addProperties = (item) => {
		const data = getItemData(item)
		const absX = imageList.value.length % colsValue.value
		const absY = Math.floor(imageList.value.length / colsValue.value)
		const x = absX * viewWidth.value
		const y = absY * viewHeight.value // 使用viewHeight计算y坐标

		imageList.value.push({
			...data,
			x,
			y,
			oldX: x,
			oldY: y,
			absX,
			absY,
			scale: 1,
			zIndex: 9,
			opacity: 1,
			index: imageList.value.length,
			id: guid(16),
			disable: false,
			offset: 0,
			moveEnd: false
		})

		add.value.x = (imageList.value.length % colsValue.value) * viewWidth.value
		add.value.y = Math.floor(imageList.value.length / colsValue.value) * viewHeight.value
	}

	const rpx2px = (v) => {
		return width.value * v / 750
	}

	const guid = (len = 32) => {
		const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
		const uuid = []
		const radix = chars.length
		for (let i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix]
		uuid.shift()
		return `u${uuid.join('')}`
	}

	// 初始化
	onMounted(() => {
		width.value = uni.getSystemInfoSync().windowWidth

		// 获取当前组件实例
		const instance = getCurrentInstance()

		// 使用 nextTick 确保元素已渲染
		nextTick(() => {
			const query = uni.createSelectorQuery().in(instance.proxy)
			query.select('.con').boundingClientRect(data => {
				if (!data) {
					console.error('未找到 .con 元素')
					return
				}

				colsValue.value = props.cols

				// 计算宽度（保持正方形）
				viewWidth.value = data.width / props.cols

				// 计算高度（宽度 + 文字区域高度）
				// 假设文字区域高度为图片区域的30%，整体高度为宽度的1.3倍
				viewHeight.value = viewWidth.value * 1.3

				if (props.imageWidth > 0) {
					viewWidth.value = rpx2px(props.imageWidth)
					viewHeight.value = viewWidth.value * 1.3 // 保持比例
					colsValue.value = Math.floor(data.width / viewWidth.value)
				}

				const list = props.modelValue.length ? props.modelValue : props.value
				list.forEach(item => {
					addProperties(item)
				})
				first.value = false
			}).exec()
		})
	})

	// 监听 value 和 modelValue 的变化
	watch(() => props.value, (n) => {
		if (!first.value && changeStatus.value) {
			updateImageList(n)
		}
	}, {
		deep: true
	})

	watch(() => props.modelValue, (n) => {
		if (!first.value && changeStatus.value) {
			updateImageList(n)
		}
	}, {
		deep: true
	})

	// 更新图片列表的公共方法
	const updateImageList = (newList) => {
		let flag = false
		for (let i = 0; i < newList.length; i++) {
			if (flag) {
				addProperties(getSrc(newList[i]))
				continue
			}
			if (imageList.value.length === i || imageList.value[i].src !== getSrc(newList[i])) {
				flag = true
				imageList.value.splice(i)
				addProperties(getSrc(newList[i]))
			}
		}
	}
</script>

<style lang="scss" scoped>
	.con {
		width: 100%;
		// padding: 30rpx;
		box-sizing: border-box;

		.area {
			width: 100%;
			position: relative;
			background-color: #fff;
			border-radius: 16rpx;
			overflow: hidden;


			.view {
				display: flex;
				justify-content: center;
				align-items: center;

				.ready {
					border: 3px solid #65c6d9;
					box-shadow: 0 0 5px #65c6d9;

				}

				.area-con {
					position: relative;
					overflow: hidden;
					background-color: #fff;
					box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
					display: flex;
					flex-direction: column;

					.pre-image {
						width: 100%;
						height: 85%;
						/* 图片区域占70% */
						display: block;
					}

					.info-container {
						padding: 8rpx;
						display: flex;
						flex-direction: column;
						height: 30%;
						/* 信息区域占30% */

						.name {
							font-size: 24rpx;
							font-weight: bold;
							overflow: hidden;
							text-overflow: ellipsis;
							white-space: nowrap;
							text-align: center;
						}

						.price {
							font-size: 26rpx;
							color: #e64340;
							margin-top: 4rpx;
							text-align: center;
							color: #ff9c9a;
							font-weight: 1000;
						}

						.type {
							position: absolute;
							top: 0;
							left: 0;
							background: rgba(105, 196, 226, 0.8);
							color: #fff;
							padding: 8rpx 18rpx;
							border-radius: 10rpx 0 10rpx 0;
							font-size: 24rpx;
							font-weight: 600;
						}

					}
				}
			}
		}
	}
</style>