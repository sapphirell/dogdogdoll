<template>
	<view>
		<input type="text" v-model="person.name"/>
		<text>{{person.name}}</text>
		<footer></footer>
	</view>
</template>

<script setup>
import {ref, watch} from "vue"
const person = ref({name: "john", age: 18})

watch(() => person.value.name, (newVal, oldVal) => {
	console.log("newVal", newVal)
	console.log("oldVal", oldVal)
}, {deep: true})
</script>

<style>

</style>
