# iOS WebClip Manager Backend

基于 Go 1.21 + Fiber v2 + GORM + SQLite 构建的 iOS WebClip 配置管理系统后端 API。

## 技术栈

- **Go 1.21** - 编程语言
- **Fiber v2** - 高性能 Web 框架
- **GORM** - ORM 框架
- **SQLite** - 嵌入式数据库
- **Swagger** - API 文档

## 项目结构

```
backend/
├── main.go                 # 主程序入口
├── go.mod                  # Go 模块依赖
├── .env.example            # 环境变量示例
├── database/               # 数据库相关
│   └── database.go         # 数据库初始化和连接
├── models/                 # 数据模型
│   ├── user.go             # 用户模型
│   ├── config.go           # 配置模型
│   ├── install_log.go      # 安装日志模型
│   └── utils.go            # 模型工具函数
├── handlers/               # 请求处理器
│   ├── user.go             # 用户相关接口
│   ├── config.go           # 配置相关接口
│   └── install_log.go      # 安装日志接口
├── routes/                 # 路由配置
│   └── routes.go           # 路由设置
└── utils/                  # 工具函数
    └── response.go         # 统一响应结构
```

## 快速开始

### 1. 安装依赖

```bash
cd backend
go mod download
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，根据需要修改配置
```

### 3. 生成 Swagger 文档（可选）

```bash
# 安装 swag 工具
go install github.com/swaggo/swag/cmd/swag@latest

# 生成 Swagger 文档
swag init
```

### 4. 运行服务

```bash
go run main.go
```

服务将在 `http://localhost:3000` 启动。

### 5. 访问 API 文档

打开浏览器访问：`http://localhost:3000/swagger/index.html`

## API 接口

### 统一响应格式

所有接口返回格式如下：

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

- `code`: 状态码，200 表示成功
- `message`: 响应消息
- `data`: 响应数据（可选）

### 用户管理 API

- `POST /api/users` - 创建用户
- `GET /api/users` - 获取用户列表
- `GET /api/users/:id` - 获取用户详情
- `PUT /api/users/:id` - 更新用户
- `DELETE /api/users/:id` - 删除用户
- `POST /api/users/:id/login` - 更新用户登录时间

### 配置管理 API

- `POST /api/configs` - 创建配置
- `GET /api/configs` - 获取配置列表
- `GET /api/configs/:id` - 获取配置详情
- `PUT /api/configs/:id` - 更新配置
- `DELETE /api/configs/:id` - 删除配置
- `POST /api/configs/:id/toggle` - 切换配置状态
- `GET /api/configs/stats/:user_id` - 获取用户配置统计

### 安装日志 API

- `POST /api/install-logs` - 创建安装日志
- `GET /api/install-logs` - 获取安装日志列表
- `GET /api/install-logs/:id` - 获取安装日志详情
- `DELETE /api/install-logs/:id` - 删除安装日志
- `GET /api/install-logs/stats` - 获取安装统计

## 数据库

项目使用 SQLite 作为数据库，数据库文件默认保存在 `./data/webclip.db`。

### 数据表

1. **users** - 用户表
2. **configs** - 配置表
3. **install_logs** - 安装日志表

详细的数据库结构请参考 `../docs/schema.sql`。

## 开发

### 编译

```bash
go build -o webclip-api main.go
```

### 运行编译后的程序

```bash
./webclip-api
```

### 环境变量

- `PORT` - 服务端口（默认：3000）
- `DB_PATH` - 数据库文件路径（默认：./data/webclip.db）

## 部署

### 使用 Docker（推荐）

```bash
# 构建镜像
docker build -t webclip-api .

# 运行容器
docker run -d -p 3000:3000 -v $(pwd)/data:/app/data webclip-api
```

### 直接部署

```bash
# 编译
go build -o webclip-api main.go

# 运行
./webclip-api
```

## 许可证

MIT License
