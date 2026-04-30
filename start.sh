#!/bin/bash

# iOS WebClip Manager - 快速启动脚本

echo "🚀 iOS WebClip Manager - 快速启动"
echo "=================================="
echo ""

# 检查是否在项目根目录
if [ ! -d "backend" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

# 进入后端目录
cd backend

# 检查 Go 是否安装
if ! command -v go &> /dev/null; then
    echo "❌ 错误：未检测到 Go，请先安装 Go 1.21+"
    exit 1
fi

echo "✅ Go 版本：$(go version)"
echo ""

# 检查依赖
echo "📦 检查依赖..."
if [ ! -f "go.sum" ]; then
    echo "📥 下载依赖..."
    go mod download
fi

# 创建数据目录
echo "📁 创建数据目录..."
mkdir -p data

# 检查 swag 是否安装
if ! command -v swag &> /dev/null; then
    echo "⚠️  未检测到 swag，正在安装..."
    go install github.com/swaggo/swag/cmd/swag@latest
fi

# 生成 Swagger 文档
echo "📝 生成 Swagger 文档..."
swag init

# 编译项目
echo "🔨 编译项目..."
go build -o bin/webclip-api main.go

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 编译成功！"
    echo ""
    echo "🎉 启动服务..."
    echo "=================================="
    echo "📍 API 服务：http://localhost:3000"
    echo "📚 Swagger 文档：http://localhost:3000/swagger/index.html"
    echo "💚 健康检查：http://localhost:3000/health"
    echo "=================================="
    echo ""
    
    # 运行服务
    ./bin/webclip-api
else
    echo "❌ 编译失败，请检查错误信息"
    exit 1
fi
