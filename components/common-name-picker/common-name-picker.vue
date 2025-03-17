<!-- components/MySelect.vue -->
<template>
	<div class="select-container" ref="containerRef">
		<div class="select-input" @click="toggleOpen">
			{{ selectedValue || placeholder }}
		</div>

		<transition name="slide-fade">
			<ul class="select-options" v-show="isOpen">
				<li v-for="(item, index) in dataList" :key="index" class="option-item" @click="selectItem(item)">
					{{ item }}
				</li>
			</ul>
		</transition>
	</div>
</template>

<script setup>
	import {
		ref,
		onMounted,
		onUnmounted
	} from 'vue'

	const props = defineProps({
		dataList: {
			type: Array,
			default: () => []
		},
		placeholder: {
			type: String,
			default: '请选择'
		}
	})

	const emit = defineEmits(['select'])

	const isOpen = ref(false)
	const selectedValue = ref('')
	const containerRef = ref(null)

	const toggleOpen = () => {
		isOpen.value = !isOpen.value
	}

	const selectItem = (item) => {
		selectedValue.value = item
		isOpen.value = false
		emit('select', item)
	}

	const handleClickOutside = (event) => {
		if (containerRef.value && !containerRef.value.contains(event.target)) {
			isOpen.value = false
		}
	}

	onMounted(() => {
		document.addEventListener('click', handleClickOutside)
	})

	onUnmounted(() => {
		document.removeEventListener('click', handleClickOutside)
	})
</script>

<style scoped>
	.select-container {
		position: relative;
		display: inline-block;
		font-family: Arial, sans-serif;
		width: 100%;
	}

	.select-input {
		padding: 8px 16px;
		/* border: 1px solid #dcdfe6; */
		border-radius: 4px;
		cursor: pointer;
		background-color: #fff;
		transition: border-color 0.3s;
	}

	.select-input:hover {
		/* border-color: #409eff; */
	}

	.select-options {
		position: absolute;
		top: 40px;
		left: 0;
		right: 0;
		max-height: 200px;
		margin: 0;
		padding: 0;
		list-style: none;
		background: #fff;
		border: 1px solid #e4e7ed;
		border-radius: 4px;
		box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
		overflow-y: auto;
		z-index: 1000;
	}

	.option-item {
		padding: 8px 12px;
		cursor: pointer;
		transition: background-color 0.3s;
	}

	.option-item:hover {
		background-color: #f5f7fa;
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