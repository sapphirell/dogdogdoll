# uni-push 2.0 服务端模板（单发/批量/按条件/回执查询）

## 1. 已提供的模板文件

- 云函数入口（阿里云版）：`uniCloud-aliyun/cloudfunctions/push-dispatch/index.js`
- 云函数入口（支付宝云版）：`uniCloud-alipay/cloudfunctions/push-dispatch/index.js`
- 支持动作：
  - `single`：单个用户/单个 cid/单个别名
  - `batch`：批量用户或批量 cid
  - `condition`：按 `user_tag` 条件推送
  - `report`：按 `task_id` 查询推送结果（需对应权限）

## 2. 部署步骤

1. 在 HBuilderX 中右键上传并部署 `push-dispatch` 云函数到你的目标服务空间。  
   如果是阿里云空间，用 `uniCloud-aliyun` 目录；如果是支付宝云空间，用 `uniCloud-alipay` 目录。
2. 打开“云函数 URL 化”，得到 HTTP 地址。
3. 建议在云函数环境变量里设置 `PUSH_DISPATCH_SECRET`。
4. 你的业务后端（PHP/Go/Java）只负责调用这个 URL，不直接连厂商推送。

### 2.1 如果报错“uniCloud.getPushManager 由 uni-cloud-push 扩展库提供”

说明 `push-dispatch` 云函数没有依赖 `uni-cloud-push` 扩展库。可按以下方式修复：

1. 确认云函数目录下有 `package.json`，并包含：

```json
{
  "extensions": {
    "uni-cloud-push": {}
  }
}
```

2. 重新上传部署 `push-dispatch` 云函数。
3. 控制台函数详情页“扩展库”能看到 `uni-cloud-push` 后再重试推送。

## 3. HTTP 调用示例

### 3.1 单发（按 user_id）

```bash
curl -X POST "https://<your-cloud-function-url>" \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "<PUSH_DISPATCH_SECRET>",
    "action": "single",
    "user_id": "10001",
    "title": "系统通知",
    "content": "你有一条新消息",
    "payload": { "message_id": "123456" }
  }'
```

### 3.2 批量（按 user_ids）

```bash
curl -X POST "https://<your-cloud-function-url>" \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "<PUSH_DISPATCH_SECRET>",
    "action": "batch",
    "user_ids": ["10001", "10002", "10003"],
    "title": "活动提醒",
    "content": "你关注的品牌有更新",
    "payload": { "path": "/pages/message_list/message_list" }
  }'
```

### 3.3 条件推送（按 tag）

```bash
curl -X POST "https://<your-cloud-function-url>" \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "<PUSH_DISPATCH_SECRET>",
    "action": "condition",
    "user_tag": ["vip", "cn"],
    "platform": ["android"],
    "title": "会员通知",
    "content": "限时权益已开启",
    "payload": { "url": "https://m.dogdogdoll.com/#/pages/article_detail/article_detail?id=99" }
  }'
```

### 3.4 回执查询（按 task_id）

```bash
curl -X POST "https://<your-cloud-function-url>" \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "<PUSH_DISPATCH_SECRET>",
    "action": "report",
    "task_id": "<上次发送返回的taskId>"
  }'
```

## 4. payload 推荐字段（与你当前客户端兼容）

你当前 App 已支持以下点击跳转字段，后端发推时任选其一：

1. `message_id`：跳到消息详情页  
2. `path` / `route`：跳转 App 内页面（如 `/pages/goods/goods?goods_id=1001`）  
3. `url`：支持 H5 外链或 hash 链接  

## 5. 回执接口要不要做？

结论：**不是必须先做**，但建议做“查询型回执”。

1. 必须项：不需要额外 webhook 才能发推。`sendMessage` 本身会返回提交结果。  
2. 建议项：把发送返回的 `taskId` 落库，异步调用 `action=report` 查送达结果。  
3. 业务强依赖场景（例如红包、强提醒）：再加一层“客户端确认回执”，即 App 收到/点击后调用你的业务 API 记账。

## 6. 建议的最小落库字段

- `request_id`
- `task_id`
- `action`（single/batch/condition）
- `target_summary`（user_id/user_ids/user_tag）
- `title`
- `payload`
- `send_status`
- `report_status`
- `created_at`
