<template>
	<view class="custom-select">
		<input v-model="inputValue" @click="toggleOpen" @input="callbackValue" placeholder="请选择或输入" class="select-input"
			:style="{ margin: margin }" />
		<transition name="slide-fade">
			<view v-if="isOpen" class="dropdown">
				<view v-for="item in filteredList" :key="item.id" @click="selectOption(item)" class="dropdown-item">
					{{ item.name }}
				</view>
			</view>
		</transition>
	</view>
</template>

<script setup>
	import {
		ref,
		computed
	} from 'vue';

	const props = defineProps({
		dataList: {
			type: Array,
			required: true,
		},
		margin: {
			type: String,
			default: '0',
		}
	});

	const emit = defineEmits(['select']);

	const inputValue = ref('');
	const isOpen = ref(false);
	// const filteredList = ref([...props.dataList]);
	
	// 使用 computed 动态计算 filteredList
	const filteredList = computed(() => {
	  return props.dataList.filter(item =>
	    item.name.toLowerCase().includes(inputValue.value.toLowerCase())
	  );
	});

	const callbackValue = () => {
		// 输入内容传递到父组件
		emit('select', 0, inputValue.value);
	};


	const toggleOpen = () => {
		isOpen.value = !isOpen.value
	}

	const selectOption = (item) => {
		inputValue.value = item.name;
		isOpen.value = false;
		emit('select', item.id, item.name);
	};
	
</script>

<style scoped>
	.custom-select {
		position: relative;
		
		/* width: 100%; */
	}

	.select-input {
		width: 100%;
		padding: 10px 15px;
		border-radius: 4px;
	}

	.dropdown {
		position: absolute;
		width: 100%;
		max-height: 200px;
		overflow-y: auto;
		/* border: 1px solid #f2f2f2; */
		border-radius: 4px;
		background-color: #fff;
		z-index: 1000;
		box-shadow: 0 0 10rpx #00000009;
	}

	.dropdown-item {
		padding: 8px;
		cursor: pointer;
	}

	.dropdown-item:hover {
		background-color: #f0f0f0;
	}

	/* 进入和离开动画 */
	.slide-fade-enter-active {
		transition: all 0.1s ease-out;
	}

	.slide-fade-leave-active {
		transition: all 0.1s cubic-bezier(1, 0.5, 0.8, 1);
	}

	.slide-fade-enter-from,
	.slide-fade-leave-to {
		transform: translateY(-10px);
		opacity: 0;
	}
</style>