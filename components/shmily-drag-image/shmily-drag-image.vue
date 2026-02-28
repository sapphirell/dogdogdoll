<!-- shmily-drag-image -->
<template>
	<view class="con">
		<template v-if="viewWidth">
			<movable-area class="area" :style="{ height: areaHeight }" @mouseenter="mouseenter"
				@mouseleave="mouseleave">
				<movable-view
					v-for="(item, index) in imageList"
					:key="item.id"
					class="view"
					direction="all"
					:y="item.y"
					:x="item.x"
					:damping="40"
					:disabled="item.disable || !item.ready"
					@change="onChange($event, item)"
					@touchstart="onLongPressStart(item, $event)"
					@touchend="touchend(item)"
					@tap="handleItemClick(item)"
					@touchmove="onTouchMove($event, item)"
					:style="{
						width: viewWidth + 'px',
						height: viewHeight + 'px',
						'z-index': item.zIndex,
						opacity: item.opacity
					}"
				>
					<view
						class="area-con"
						:style="{
							width: childWidth,
							height: childHeight,
							borderRadius: borderRadius + 'rpx',
							transform: 'scale(' + item.scale + ')',
							margin: itemMargin + 'px'
						}"
						:class="{ 'ready': !item.disable && item.ready }"
					>
						<view v-if="props.showDelete" class="delete-btn" @click.stop="deleteImage(item)">
							<uni-icons type="clear" color="#9b9b9b" size="30"></uni-icons>
						</view>

						<!-- 使用 common-image 统一图片渲染与懒加载 -->
						<common-image
							class="pre-image"
							:src="getDisplayImg(item)"
							width="100%"
							height="85%"
							radius="0"
							mode="aspectFill"
							:lazy="true"
							:threshold="80"
						/>

						<view class="info-container" v-if="props.showItemInfo">
							<text class="name">{{ item.name }}</text>
							<text v-if="props.showPriceTag" class="price">{{ getDisplayPrice(item.price) }}</text>
							<text class="type">{{ item.type }}</text>
						</view>
						<view
							v-if="props.showSizeTag && item.sizeText"
							class="size-badge"
						>
							{{ item.sizeText }}
						</view>

						<view
							v-show="props.showPaymentTag && item.payStatus"
							class="pay-badge candy"
							:class="['s-' + (item.payStatus || 1)]"
						>
							{{ item._payText }}
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
		customClick: {
			type: Boolean,
			default: false
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
		},
		// 显示item的信息
		showItemInfo: {
			type: Boolean,
			default: true
		},
		showDelete: {
			type: Boolean,
			default: false
		},
		/* 付款状态标签（新增能力） */
		showPaymentTag: { type: Boolean, default: false },
		showSizeTag: { type: Boolean, default: true },
		showPriceTag: { type: Boolean, default: true },
		paymentField: { type: String, default: 'payment_status' },
		paymentMap: {
			type: Object,
			default: () => ({ 1: '全款', 2: '定金', 3: '未买' })
		}
	})

	// 定义 emits
	const emit = defineEmits(['input', 'update:modelValue', 'sort-change', 'delete', 'item-click']);

	// 响应式变量
	const imageList = ref([])
	const width = ref(0)
	const add = ref({ x: 0, y: 0 })
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

	const isMounted = ref(false); // 是否已挂载

	const instanceRef = ref(null); // 保存组件实例引用

	// 计算属性
	const areaHeight = computed(() => {
		if (imageList.value.length < props.number) {
			return (Math.ceil((imageList.value.length + 1) / colsValue.value) * viewHeight.value) + 'px'
		}
		return (Math.ceil(imageList.value.length / colsValue.value) * viewHeight.value) + 'px'
	})

	// 调整内部容器宽度计算
	const childWidth = computed(() => {
		// itemMargin 为 px，padding 为 rpx；两者都计入内部可用宽度，避免只出现左右无上下的错觉
		const widthPx = viewWidth.value - rpx2px(props.padding) * 2 - props.itemMargin * 2
		return Math.max(widthPx, 0) + 'px'
	})
	// 新增：内部容器高度计算
	const childHeight = computed(() => {
		// 与宽度一致，扣除上下 margin，保证行与行之间有稳定间距（padding=0 时也生效）
		const heightPx = viewHeight.value - rpx2px(props.padding) * 2 - props.itemMargin * 2
		return Math.max(heightPx, 0) + 'px'
	})

	// 删除图片方法
	const deleteImage = (item) => {
		// 触发 delete 事件，传递被删除图片的 ID
		emit('delete', item.id);

		// 组件内部也需要删除该图片
		const index = imageList.value.findIndex(img => img.id === item.id);
		if (index !== -1) {
			imageList.value.splice(index, 1);
			updateItemsPosition(); // 更新位置
			sortList(); // 更新数据
		}
	};

	// 方法
	const getSrc = (item) => {
		return props.keyName !== null ? item[props.keyName] : item
	}

	const getItemData = (item) => {
		const ps = item[props.paymentField] ?? item.payStatus ?? 1
		return {
			id: item.id,
			src: getSrc(item),
			name: item.name,
			price: item.display_price ?? item.price,
			type: item.type,
			sizeText: String(item.size || '').trim(),
			// 预计算，拖拽时不会变
			payStatus: ps,
			_payText: props.paymentMap?.[Number(ps)] || props.paymentMap?.[1] || '已全款'
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
					Math.pow(item.oldY - item.absY * viewHeight.value, 2)
				)
			}
			let x = Math.floor((e.detail.x + viewWidth.value / 2) / viewWidth.value)
			if (x >= colsValue.value) return
			let y = Math.floor((e.detail.y + viewHeight.value / 2) / viewHeight.value)
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

				// 移动数组元素到新位置
				moveItem(item, index);

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

	// 移动数组元素到新位置
	const moveItem = (item, newIndex) => {
		const oldIndex = imageList.value.findIndex(i => i.id === item.id);
		if (oldIndex === -1 || oldIndex === newIndex) return;

		// 移动元素到新位置
		imageList.value.splice(newIndex, 0, imageList.value.splice(oldIndex, 1)[0]);

		// 更新所有元素的 index
		imageList.value.forEach((item, idx) => {
			item.index = idx;
		});

		sortList();
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
		if (isDragging.value == true) {
			console.log("来自于拖拽的结束,上报排序事件")

			// 直接使用当前顺序的ID
			const sortedIds = imageList.value.map(item => item.id);

			emit('sort-change', sortedIds);
			console.log("排序后的ID", sortedIds)
		}

		isDragging.value = false
		// 清除之前的计时器
		if (longPressTimer.value) {
			clearTimeout(longPressTimer.value);
			longPressTimer.value = null;
		}
		// 修复：确保所有项目位置正确恢复
		setTimeout(() => {
			imageList.value.forEach(obj => {
				if (obj.ready) return; // 跳过当前拖拽项

				obj.x = obj.absX * viewWidth.value;
				obj.y = obj.absY * viewHeight.value;
				obj.offset = 0;
				obj.moveEnd = false;
			});

			// 当前拖拽项单独处理
			nextTick(() => {
				item.x = item.absX * viewWidth.value;
				item.y = item.absY * viewHeight.value;
				tempItem.value = null;
				changeStatus.value = true;
			});
		}, 50); // 稍作延迟确保渲染完成
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
			url: '/pkg-stock/account_book_form/account_book_form?account_book_id=' + id
		})
	}

	const handleItemClick = (item) => {
		// 触发自定义点击事件
		emit('item-click', item);

		// 如果未设置 customClick 属性，执行默认预览
		if (!props.customClick) {
			go2preview(item.id);
		}
	};

	function go2preview(id) {
		uni.navigateTo({
			url: '/pkg-stock/account_book_preview/account_book_preview?account_book_id=' + id
		})
	}

	// 长按取消
	const onLongPressCancel = () => {
		if (longPressTimer.value) {
			clearTimeout(longPressTimer.value);
			longPressTimer.value = null;
		}
	};

	// 更新所有项目的位置（根据当前索引）——（旧函数，未实际调用，保留原样）
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
				id: item.id,
				disable: false,
				offset: 0,
				moveEnd: false,
				ready: false
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
		instanceRef.value = getCurrentInstance(); // 在挂载时保存实例

		// 使用 nextTick 确保元素已渲染
		nextTick(() => {
			const query = uni.createSelectorQuery().in(instanceRef.value.proxy)
			query.select('.con').boundingClientRect(data => {
				if (!data) {
					console.error('未找到 .con 元素')
					return
				}

				colsValue.value = props.cols

				// 计算宽度（保持正方形）
				viewWidth.value = data.width / props.cols

				// 计算高度（宽度 + 文字区域高度）
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
			isMounted.value = true;
		})

	// 更新所有项目的位置（根据当前索引）
	const updateItemsPosition = () => {
		imageList.value.forEach((item, index) => {
			// 根据新的索引计算网格位置
			item.index = index;
			const newAbsX = index % colsValue.value;
			const newAbsY = Math.floor(index / colsValue.value);

			// 确保位置精确对齐网格
			item.x = newAbsX * viewWidth.value;
			item.y = newAbsY * viewHeight.value;
			item.oldX = item.x;
			item.oldY = item.y;
			item.absX = newAbsX;
			item.absY = newAbsY;
		});
	};

	const initViewSize = () => {
		return new Promise(resolve => {
			// 检查实例是否可用
			if (!instanceRef.value || !instanceRef.value.proxy) {
				console.warn('Component instance not available for selector query');
				return resolve();
			}

			const query = uni.createSelectorQuery().in(instanceRef.value.proxy);
			query.select('.con').boundingClientRect(data => {
				if (!data) return resolve();

				colsValue.value = props.cols;
				viewWidth.value = data.width / props.cols;
				viewHeight.value = viewWidth.value * 1.3;

				if (props.imageWidth > 0) {
					viewWidth.value = rpx2px(props.imageWidth);
					viewHeight.value = viewWidth.value * 1.3;
					colsValue.value = Math.floor(data.width / viewWidth.value);
				}
				resolve();
			}).exec();
		});
	};

	// 监听 value 和 modelValue 的变化
	watch(
		() => props.modelValue,
		(newVal) => {
			if (isDragging.value) return; // 拖动时忽略父组件回写，避免受控回拉
				if (isMounted.value) {
					nextTick(() => {
						initViewSize().then(() => {
							updateImageList(newVal);
						});
					});
				}
		},
		{
			deep: true,
			immediate: true
		}
	);

	// 更新图片列表的公共方法
	const updateImageList = (newList) => {
		// 保留原有位置信息
		const oldItems = imageList.value.reduce((map, item) => {
			map[item.id] = item;
			return map;
		}, {});

		// 重建列表，保留原有位置状态
		imageList.value = newList.map(item => {
			const existing = oldItems[item.id];
			if (existing) {
				return {
					...existing,
					...getItemData(item) // 更新可能变化的数据
				};
			}
			return createNewItem(item);
		});
		updateItemsPosition();
	};

	// 创建新项目的方法
	const createNewItem = (item) => {
		const data = getItemData(item);
		const absX = imageList.value.length % colsValue.value;
		const absY = Math.floor(imageList.value.length / colsValue.value);

		return {
			...data,
			x: absX * viewWidth.value,
			y: absY * viewHeight.value,
			oldX: absX * viewWidth.value,
			oldY: absY * viewHeight.value,
			absX,
			absY,
			scale: 1,
			zIndex: 9,
				opacity: 1,
				index: imageList.value.length,
				disable: false,
				offset: 0,
				moveEnd: false,
				ready: false
			};
		};

	/* ========= 图片兜底 / 文本清洗 ========= */
	const NO_IMG =
		'data:image/svg+xml;utf8,' +
		encodeURIComponent(
			`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
	      <rect width="100%" height="100%" fill="#e9ebef"/>
	      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
	        fill="#9aa0a6" font-size="40" font-family="Arial">No Image</text>
	    </svg>`
		)

	function normalizeFirstImage(s) {
		if (!s) return ''
		const first = String(s).split(',')[0].trim()
		const low = first.toLowerCase()
		if (!first || low.includes('/default') || low.endsWith('default.png') || low.includes('noimage')) return ''
		return first
	}

	function getDisplayImg(item) {
		const src = normalizeFirstImage(item.src)
		return src || NO_IMG
	}

	function getDisplayPrice(price) {
		if (price === null || price === undefined) return ''
		return String(price).replace(/【.*?】/g, '').trim()
	}

	/* 付款状态文本 */
	function getPaymentText(item) {
		const st = Number(item?.payStatus ?? 1)
		return props.paymentMap?.[st] || props.paymentMap?.[1] || '已全款'
	}
</script>

<style lang="scss" scoped>
.con { width: 100%; box-sizing: border-box; }
.area { width: 100%; position: relative; background-color: #fff; border-radius: 16rpx; overflow: hidden; }
.view { display: flex; justify-content: center; align-items: center; }
.ready { border: 3px solid #65c6d9; box-shadow: 0 0 5px #65c6d9; }

.area-con {
	min-width: 80px;
	min-height: 100px;
	position: relative;
	overflow: hidden;
	background-color: #fff;
	box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.08);
	display: flex;
	flex-direction: column;
}

.pre-image { width: 100%; height: 85%; display: block; }

.info-container {
  padding: 8rpx;
  display: flex;
  flex-direction: column;
  height: 30%;
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
    color: #ff9c9a;
    margin-top: 4rpx;
    text-align: center;
    font-weight: 1000;
  }
  .type {
    position: absolute;
    top: 8rpx;
    left: 8rpx;
    background: linear-gradient(135deg, #91c9ffa3, #7aa6ffa1);
    color: #fff;
    padding: 8rpx 18rpx;
    border-radius: 12rpx;
    font-size: 22rpx;
    font-weight: 700;
    box-shadow: 0 2rpx 8rpx rgba(122,166,255,.18);
  }
}

/* 糖果配色标签（新增） */
.pay-badge.candy{
  position: absolute;
  left: 8rpx;
  top: 56rpx;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 1rpx;
  transform: translateZ(0);
  opacity: 0.6;
}
.s-1{ background: linear-gradient(135deg, #e3e3e3, #d6ecdf); color: #686868; box-shadow: 0 2rpx 10rpx rgba(26,155,86,.18); }
.s-2{ background: linear-gradient(135deg,#ffe9d6,#ffd2ad); color: #686868; box-shadow: 0 2rpx 10rpx rgba(201,116,0,.18); }
.s-3{ background: linear-gradient(135deg,#ffe0ea,#ffc2d4); color: #686868; box-shadow: 0 2rpx 10rpx rgba(216,58,86,.18); }

.size-badge {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  padding: 6rpx 14rpx;
  border-radius: 18rpx;
  background: rgba(55, 73, 105, 0.78);
  color: #fff;
  font-size: 20rpx;
  line-height: 1.1;
  letter-spacing: 0.4rpx;
  z-index: 12;
}

/* 删除按钮 */
.delete-btn{
  position: absolute;
  top: 0rpx;
  right: 0rpx;
  border-radius: 50%;
  display:flex;
  justify-content:center;
  align-items:center;
  z-index:100;
  font-size:30rpx;
  cursor: pointer;
}
</style>
