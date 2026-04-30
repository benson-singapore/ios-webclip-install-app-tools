# iOS WebClip Manager - 项目总览

## 项目简介

iOS WebClip Manager 是一个完整的 iOS WebClip 配置管理系统，包含前端管理界面和后端 API 服务。

## 技术栈

### 后端
- **Go 1.21** - 编程语言
- **Fiber v2** - 高性能 Web 框架
- **GORM** - ORM 框架
- **SQLite** - 嵌入式数据库
- **Swagger** - API 文档

### 前端
- **React** - UI 框架
- **Firebase** - 认证和数据存储
- **Tailwind CSS** - 样式框架

## 项目结构

```
ios-install-tools-go/
├── backend/                    # 后端 API 服务
│   ├── main.go                 # 主程序入口
│   ├── go.mod                  # Go 模块依赖
│   ├── database/               # 数据库相关
│   ├── models/                 # 数据模型
│   ├── handlers/               # 请求处理器
│   ├── routes/                 # 路由配置
│   ├── utils/                  # 工具函数
│   ├── docs/                   # Swagger 文档
│   ├── bin/                    # 编译输出
│   ├── data/                   # 数据库文件
│   ├── Dockerfile              # Docker 配置
│   ├── Makefile                # 构建脚本
│   └── README.md               # 后端文档
├── docs/                       # 文档和前端代码
│   ├── schema.sql              # 数据库建表语句
│   └── web.tsx                 # 前端 React 代码
└── README.md                   # 项目总览
```

## 快速开始

### 后端服务

1. **进入后端目录**
   ```bash
   cd backend
   ```

2. **安装依赖**
   ```bash
   go mod download
   ```

3. **生成 Swagger 文档**
   ```bash
   swag init
   ```

4. **运行服务**
   ```bash
   go run main.go
   ```
   
   或者编译后运行：
   ```bash
   go build -o bin/webclip-api main.go
   ./bin/webclip-api
   ```

5. **访问服务**
   - API 服务：http://localhost:3000
   - Swagger 文档：http://localhost:3000/swagger/index.html
   - 健康检查：http://localhost:3000/health

### 使用 Makefile

```bash
cd backend

# 查看所有可用命令
make help

# 安装依赖
make install

# 生成 Swagger 文档并运行
make dev

# 编译项目
make build

# 运行测试
make test

# 清理编译文件
make clean
```

## API 接口

### 统一响应格式

所有接口返回格式：

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

- `code`: 200 表示成功，其他值表示错误
- `message`: 响应消息
- `data`: 响应数据（可选）

### 主要接口

#### 用户管理
- `POST /api/users` - 创建用户
- `GET /api/users` - 获取用户列表
- `GET /api/users/:id` - 获取用户详情
- `PUT /api/users/:id` - 更新用户
- `DELETE /api/users/:id` - 删除用户

#### 配置管理
- `POST /api/configs` - 创建配置
- `GET /api/configs` - 获取配置列表
- `GET /api/configs/:id` - 获取配置详情
- `PUT /api/configs/:id` - 更新配置
- `DELETE /api/configs/:id` - 删除配置
- `POST /api/configs/:id/toggle` - 切换配置状态

#### 安装日志
- `POST /api/install-logs` - 创建安装日志
- `GET /api/install-logs` - 获取安装日志列表
- `GET /api/install-logs/stats` - 获取安装统计

详细的 API 文档请访问 Swagger UI。

## 数据库

### 数据表

1. **users** - 用户表
   - 存储用户基本信息
   - 支持匿名用户和邮箱用户

2. **configs** - 配置表
   - 存储 WebClip 配置信息
   - 包含应用名称、URL、图标等

3. **install_logs** - 安装日志表
   - 记录配置的安装历史
   - 包含 IP、设备信息等

详细的数据库结构请参考 `docs/schema.sql`。

## 部署

### Docker 部署（推荐）

```bash
cd backend

# 构建镜像
docker build -t webclip-api .

# 运行容器
docker run -d -p 3000:3000 -v $(pwd)/data:/app/data webclip-api
```

### 直接部署

```bash
cd backend

# 编译
go build -o webclip-api main.go

# 运行
./webclip-api
```

### 环境变量

- `PORT` - 服务端口（默认：3000）
- `DB_PATH` - 数据库文件路径（默认：./data/webclip.db）

## 开发指南

### 添加新接口

1. 在 `models/` 中定义数据模型
2. 在 `handlers/` 中实现处理函数
3. 在 `routes/routes.go` 中注册路由
4. 添加 Swagger 注释
5. 运行 `swag init` 更新文档

### 代码规范

- 使用 `gofmt` 格式化代码
- 为所有公开函数添加注释
- 为 API 接口添加 Swagger 注释
- 使用统一的响应格式

## 测试

```bash
cd backend

# 运行所有测试
go test -v ./...

# 运行特定包的测试
go test -v ./handlers
```

## 常见问题

### 1. 数据库文件在哪里？

默认在 `backend/data/webclip.db`，可通过环境变量 `DB_PATH` 修改。

### 2. 如何修改端口？

设置环境变量 `PORT=8080` 或在 `.env` 文件中配置。

### 3. Swagger 文档不显示？

确保已运行 `swag init` 生成文档，并且导入了 `_ "ios-install-tools-go/backend/docs"`。

### 4. 数据库迁移失败？

检查数据库文件权限，确保应用有读写权限。删除旧的数据库文件重新初始化。

## 许可证

MIT License

## 联系方式

如有问题或建议，请提交 Issue。
