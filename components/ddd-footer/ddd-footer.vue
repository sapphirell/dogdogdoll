<template>
	<view class="footer">
		<text>被选中底部{{onSelect}}</text>
	</view>
</template>

<script setup>
const props = defineProps({
	onSelect: {
		type: String,
		default: ''
	}
})
console.log(props.onSelect) 
//onSelect是父组件传递过来的值,不可修改，是个单向数据流，如果想要修改需要
import {computed} from 'vue'
const onSelect = computed(() => {
	return props.onSelect + "@"
})
</script>

<!-- 加入scoped后css仅限于此组件 -->
<style lang="less" scoped>
.footer {
	background-color: rgba(255, 255, 255, 0);
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    bottom: 0px;
    width: 100vw;
}
</style>