# API 快速参考

## 基础信息

- **Base URL**: `http://localhost:3000`
- **响应格式**: JSON
- **成功状态码**: `code: 200`

## 统一响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

---

## 用户管理 API

### 1. 创建用户
```
POST /api/users
```
**请求体**:
```json
{
  "id": "user_001",
  "email": "user@example.com",
  "display_name": "John Doe",
  "is_anonymous": 0
}
```

### 2. 获取用户列表
```
GET /api/users?page=1&page_size=10&status=1
```

### 3. 获取用户详情
```
GET /api/users/:id
```

### 4. 更新用户
```
PUT /api/users/:id
```
**请求体**:
```json
{
  "email": "newemail@example.com",
  "display_name": "New Name",
  "status": 1
}
```

### 5. 删除用户
```
DELETE /api/users/:id
```

### 6. 更新登录时间
```
POST /api/users/:id/login
```

---

## 配置管理 API

### 1. 创建配置
```
POST /api/configs
```
**请求体**:
```json
{
  "user_id": "user_001",
  "name": "我的应用",
  "description": "应用描述",
  "url": "https://example.com",
  "icon_base64": "data:image/png;base64,...",
  "status": 1
}
```

### 2. 获取配置列表
```
GET /api/configs?user_id=user_001&status=1&page=1&page_size=10
```

### 3. 获取配置详情
```
GET /api/configs/:id
```

### 4. 更新配置
```
PUT /api/configs/:id
```
**请求体**:
```json
{
  "name": "新名称",
  "url": "https://newurl.com",
  "status": 1
}
```

### 5. 删除配置
```
DELETE /api/configs/:id
```

### 6. 切换配置状态
```
POST /api/configs/:id/toggle
```

### 7. 获取用户配置统计
```
GET /api/configs/stats/:user_id
```
**响应**:
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

---

## 安装日志 API

### 1. 创建安装日志
```
POST /api/install-logs
```
**请求体**:
```json
{
  "config_id": "conf_123",
  "user_id": "user_001",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "device_info": "iPhone 13 Pro"
}
```

### 2. 获取安装日志列表
```
GET /api/install-logs?config_id=conf_123&user_id=user_001&page=1&page_size=10
```

### 3. 获取安装日志详情
```
GET /api/install-logs/:id
```

### 4. 删除安装日志
```
DELETE /api/install-logs/:id
```

### 5. 获取安装统计
```
GET /api/install-logs/stats?config_id=conf_123&user_id=user_001
```
**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 150,
    "recent_logs": [...]
  }
}
```

---

## 其他接口

### 健康检查
```
GET /health
```
**响应**:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### Swagger 文档
```
GET /swagger/index.html
```

---

## 快速测试命令

### 创建用户
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"id":"user_001","email":"test@example.com","display_name":"Test User","is_anonymous":0}'
```

### 创建配置
```bash
curl -X POST http://localhost:3000/api/configs \
  -H "Content-Type: application/json" \
  -d '{"user_id":"user_001","name":"测试应用","url":"https://example.com","status":1}'
```

### 获取配置列表
```bash
curl http://localhost:3000/api/configs?user_id=user_001
```

### 创建安装日志
```bash
curl -X POST http://localhost:3000/api/install-logs \
  -H "Content-Type: application/json" \
  -d '{"config_id":"conf_123","user_id":"user_001","device_info":"iPhone 13"}'
```

---

## 错误码说明

| Code | 说明 |
|------|------|
| 200  | 成功 |
| 400  | 请求参数错误 |
| 404  | 资源不存在 |
| 500  | 服务器内部错误 |

---

## 分页参数

所有列表接口支持分页：
- `page`: 页码（默认：1）
- `page_size`: 每页数量（默认：10，最大：100）

**响应格式**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "page_size": 10
  }
}
```

---

## 时间戳说明

所有时间戳使用毫秒级 Unix 时间戳：
- `created_at`: 创建时间
- `updated_at`: 更新时间
- `last_login_at`: 最后登录时间
- `install_at`: 安装时间
- `last_install_at`: 最后安装时间

**示例**: `1714456789000` (2024-04-30 11:09:42)
