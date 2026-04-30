# API 测试示例

本文档提供了 iOS WebClip Manager API 的测试示例。

## 基础 URL

```
http://localhost:3000
```

## 1. 健康检查

```bash
curl http://localhost:3000/health
```

**响应示例：**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

## 2. 用户管理 API

### 2.1 创建用户

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "id": "user_001",
    "email": "test@example.com",
    "display_name": "Test User",
    "is_anonymous": 0
  }'
```

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "user_001",
    "created_at": 1714456789000,
    "updated_at": 1714456789000,
    "is_anonymous": 0,
    "email": "test@example.com",
    "display_name": "Test User",
    "last_login_at": 1714456789000,
    "status": 1
  }
}
```

### 2.2 获取用户列表

```bash
curl http://localhost:3000/api/users?page=1&page_size=10
```

### 2.3 获取用户详情

```bash
curl http://localhost:3000/api/users/user_001
```

### 2.4 更新用户

```bash
curl -X PUT http://localhost:3000/api/users/user_001 \
  -H "Content-Type: application/json" \
  -d '{
    "display_name": "Updated User",
    "status": 1
  }'
```

### 2.5 删除用户

```bash
curl -X DELETE http://localhost:3000/api/users/user_001
```

## 3. 配置管理 API

### 3.1 创建配置

```bash
curl -X POST http://localhost:3000/api/configs \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_001",
    "name": "我的应用",
    "description": "这是一个测试应用",
    "url": "https://example.com",
    "icon_base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "status": 1
  }'
```

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "conf_1714456789000",
    "user_id": "user_001",
    "name": "我的应用",
    "description": "这是一个测试应用",
    "url": "https://example.com",
    "icon_base64": "data:image/png;base64,...",
    "status": 1,
    "created_at": 1714456789000,
    "updated_at": 1714456789000,
    "install_count": 0,
    "last_install_at": 0
  }
}
```

### 3.2 获取配置列表

```bash
# 获取所有配置
curl http://localhost:3000/api/configs

# 按用户ID筛选
curl http://localhost:3000/api/configs?user_id=user_001

# 按状态筛选
curl http://localhost:3000/api/configs?status=1

# 分页
curl http://localhost:3000/api/configs?page=1&page_size=10
```

### 3.3 获取配置详情

```bash
curl http://localhost:3000/api/configs/conf_1714456789000
```

### 3.4 更新配置

```bash
curl -X PUT http://localhost:3000/api/configs/conf_1714456789000 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "更新后的应用名称",
    "url": "https://newurl.com",
    "status": 1
  }'
```

### 3.5 切换配置状态

```bash
curl -X POST http://localhost:3000/api/configs/conf_1714456789000/toggle
```

### 3.6 获取用户配置统计

```bash
curl http://localhost:3000/api/configs/stats/user_001
```

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 10,
    "enabled": 8,
    "disabled": 2
  }
}
```

### 3.7 删除配置

```bash
curl -X DELETE http://localhost:3000/api/configs/conf_1714456789000
```

## 4. 安装日志 API

### 4.1 创建安装日志

```bash
curl -X POST http://localhost:3000/api/install-logs \
  -H "Content-Type: application/json" \
  -d '{
    "config_id": "conf_1714456789000",
    "user_id": "user_001",
    "ip_address": "192.168.1.100",
    "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)",
    "device_info": "iPhone 13 Pro"
  }'
```

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "config_id": "conf_1714456789000",
    "user_id": "user_001",
    "install_at": 1714456789000,
    "ip_address": "192.168.1.100",
    "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)",
    "device_info": "iPhone 13 Pro"
  }
}
```

### 4.2 获取安装日志列表

```bash
# 获取所有日志
curl http://localhost:3000/api/install-logs

# 按配置ID筛选
curl http://localhost:3000/api/install-logs?config_id=conf_1714456789000

# 按用户ID筛选
curl http://localhost:3000/api/install-logs?user_id=user_001

# 分页
curl http://localhost:3000/api/install-logs?page=1&page_size=10
```

### 4.3 获取安装日志详情

```bash
curl http://localhost:3000/api/install-logs/1
```

### 4.4 获取安装统计

```bash
# 全局统计
curl http://localhost:3000/api/install-logs/stats

# 按配置ID统计
curl http://localhost:3000/api/install-logs/stats?config_id=conf_1714456789000

# 按用户ID统计
curl http://localhost:3000/api/install-logs/stats?user_id=user_001
```

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 150,
    "recent_logs": [
      {
        "id": 150,
        "config_id": "conf_1714456789000",
        "user_id": "user_001",
        "install_at": 1714456789000,
        "ip_address": "192.168.1.100",
        "user_agent": "Mozilla/5.0...",
        "device_info": "iPhone 13 Pro"
      }
    ]
  }
}
```

### 4.5 删除安装日志

```bash
curl -X DELETE http://localhost:3000/api/install-logs/1
```

## 5. 完整测试流程

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"

echo "1. 创建用户"
curl -X POST $BASE_URL/api/users \
  -H "Content-Type: application/json" \
  -d '{"id":"user_test","email":"test@example.com","display_name":"Test User","is_anonymous":0}'

echo -e "\n\n2. 创建配置"
curl -X POST $BASE_URL/api/configs \
  -H "Content-Type: application/json" \
  -d '{"user_id":"user_test","name":"测试应用","description":"测试描述","url":"https://example.com","status":1}'

echo -e "\n\n3. 获取配置列表"
curl $BASE_URL/api/configs?user_id=user_test

echo -e "\n\n4. 创建安装日志"
curl -X POST $BASE_URL/api/install-logs \
  -H "Content-Type: application/json" \
  -d '{"config_id":"conf_1714456789000","user_id":"user_test","device_info":"iPhone 13"}'

echo -e "\n\n5. 获取统计信息"
curl $BASE_URL/api/configs/stats/user_test

echo -e "\n\n测试完成！"
```

## 6. 错误响应示例

### 400 Bad Request
```json
{
  "code": 400,
  "message": "Invalid request body",
  "data": null
}
```

### 404 Not Found
```json
{
  "code": 404,
  "message": "User not found",
  "data": null
}
```

### 500 Internal Server Error
```json
{
  "code": 500,
  "message": "Failed to create user: database error",
  "data": null
}
```

## 7. 使用 Postman

1. 导入 Swagger 文档：`http://localhost:3000/swagger/doc.json`
2. 或者手动创建请求集合
3. 设置环境变量 `base_url = http://localhost:3000`

## 8. 使用 HTTPie

```bash
# 安装 HTTPie
pip install httpie

# 创建用户
http POST localhost:3000/api/users id=user_001 email=test@example.com display_name="Test User" is_anonymous:=0

# 获取用户列表
http GET localhost:3000/api/users

# 创建配置
http POST localhost:3000/api/configs user_id=user_001 name="我的应用" url="https://example.com" status:=1
```
