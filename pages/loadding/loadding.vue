<template>
  <view-logs />
<view class="container">
    <comment-loadding
      ref="refresh" 
      @refresh="handleRefresh"
      :scrollHeight="`calc(100vh - ${statusBarHeight}px)`"
    >
      <view class="content">
        <view class="header">
          <text class="title">自定义下拉刷新演示</text>
        </view>
        
        <view class="card-list">
          <view v-for="(item, index) in dataList" :key="index" class="card">
            <view class="card-header">
              <image class="avatar" :src="item.avatar" mode="aspectFill"></image>
              <text class="name">{{ item.name }}</text>
            </view>
            <text class="card-content">{{ item.content }}</text>
            <text class="card-time">{{ item.time }}</text>
          </view>
        </view>
      </view>
    </comment-loadding>
  </view>
</template>

<script>
export default {
  data() {
    return {
      statusBarHeight: 0,
      dataList: [
        {
          id: 1,
          name: "张三",
          content: "今天天气真不错，适合户外运动！",
          time: "10:30",
          avatar: "https://randomuser.me/api/portraits/men/1.jpg"
        },
        {
          id: 2,
          name: "李四",
          content: "刚刚完成了一个重要的项目，庆祝一下！",
          time: "09:15",
          avatar: "https://randomuser.me/api/portraits/women/2.jpg"
        },
        {
          id: 3,
          name: "王五",
          content: "学习新技能真的很有成就感，继续加油！",
          time: "昨天 18:20",
          avatar: "https://randomuser.me/api/portraits/men/3.jpg"
        },
        {
          id: 4,
          name: "赵六",
          content: "分享一张今天拍的美景照片，大自然真神奇！",
          time: "昨天 16:45",
          avatar: "https://randomuser.me/api/portraits/women/4.jpg"
        },
        {
          id: 5,
          name: "钱七",
          content: "尝试了新的菜谱，味道超级棒！",
          time: "昨天 14:30",
          avatar: "https://randomuser.me/api/portraits/men/5.jpg"
        }
      ]
    };
  },
  onLoad() {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync();
    this.statusBarHeight = systemInfo.statusBarHeight;
  },
  methods: {
    handleRefresh() {
      // 模拟数据加载
      setTimeout(() => {
        // 添加新数据
        const newItem = {
          id: this.dataList.length + 1,
          name: `新用户${this.dataList.length + 1}`,
          content: `这是新刷出的内容 #${this.dataList.length + 1}`,
          time: "刚刚",
          avatar: `https://randomuser.me/api/portraits/${this.dataList.length % 2 === 0 ? 'men' : 'women'}/${this.dataList.length + 1}.jpg`
        };
        
        this.dataList.unshift(newItem);
        
        // 完成刷新
        this.$refs.refresh.finishRefresh();
      }, 1500);
    }
  }
};
</script>

<style>
/* 全局样式 */
page {
  background-color: #f8f8f8;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
}

.container {
  display: flex;
  flex-direction: column;
}

.header {
  padding: 20px 15px 15px;
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  border-radius: 0 0 20px 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 22px;
  font-weight: 600;
  color: white;
  text-align: center;
  display: block;
}

.content {
  padding: 15px;
}

.card-list {
  margin-top: 20px;
}

.card {
  background-color: #fff;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.card:active {
  transform: translateY(2px);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  margin-right: 10px;
}

.name {
  font-weight: 500;
  color: #333;
}

.card-content {
  display: block;
  font-size: 16px;
  line-height: 1.5;
  color: #444;
  margin-bottom: 10px;
}

.card-time {
  font-size: 12px;
  color: #999;
  display: block;
  text-align: right;
}
</style>
