<template>
	<view class="dot-wrapper-box" 
		  :style="'transform:translateX('+translateX+'px);width:'+dot_distance+'px;height:'+dot_distance+'px;'">
		
		<block v-for="(item,index) in resdata">
			<view class="dot-wrapper">
				<view class="dot" 
					  :class="index===currentIndex-2?'prew_2_dot':
							  index===currentIndex-1?'prew_1_dot':
							  index===currentIndex?'current-dot':
							  index===currentIndex+1?'next_1_dot':
							  index===currentIndex+2?'next_2_dot':''">
					
				</view>
			</view>
		</block>
	</view> 
</template>

<script>
	export default {
		name:"swiper-dynamic-bullets",
		props:{
			// 轮播图数据
			resdata:{
				type:Array
			},
			// 指示点的中心距离,相当于指示点之间的距离
			dot_distance:{
				type:[Number,String],
				default:20
			},
			// 当前指示点索引
			currentIndex:{
				type:[Number,String],
				default:0
			},
			// 指示点宽高
			dotWidth:{
				type:[Number,String],
				default:10
			}
		},
		data() {
			return {
				
			};
		},
		computed:{
			translateX(){
				return -(+this.currentIndex)*(+this.dot_distance) - (+this.dot_distance)/2
			}
		},
	}
</script>
 
<style lang="scss">
// 指示点外边框
	.dot-wrapper-box{
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: flex-start;
		bottom: 20px;
		// left: 50%;
		margin: 0 auto;
		// width: 30px;
		// height: 30px;
		transition: .3s;
	}
	.dot-wrapper{
		flex-shrink: 0;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.dot{
		border-radius: 50%;
		background-color: #FFFFFF;
		transition: .3s;
	}
	.prew_2_dot,.next_2_dot{
		width:4px;
		height: 4px;
	}
	.prew_1_dot,.next_1_dot{
		width:7px;
		height: 7px;
	}
	.current-dot{
		width:10px;
		height: 10px;
	}
</style>
