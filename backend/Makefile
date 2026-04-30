.PHONY: help run build build-linux-amd64 clean test swagger install docker-build docker-build-local

help: ## 显示帮助信息
	@echo "可用命令："
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## 安装依赖
	go mod download
	go install github.com/swaggo/swag/cmd/swag@latest

run: ## 运行服务
	go run main.go

build: ## 编译项目
	go build -o bin/webclip-api main.go

clean: ## 清理编译文件
	rm -rf bin/
	rm -rf data/
	rm -rf docs/

test: ## 运行测试
	go test -v ./...

swagger: ## 生成 Swagger 文档
	swag init

dev: swagger run ## 开发模式（生成文档并运行）

docker-build: ## 构建 Docker 镜像
	$(MAKE) build-linux-amd64
	docker build --platform linux/amd64 -t tuangou-shop-backend:latest .

build-linux-amd64: ## 交叉编译 Linux amd64 二进制
	./scripts/build-linux-amd64.sh

docker-build-local: ## 本地编译并构建 Linux amd64 镜像
	./scripts/docker-build-local.sh

docker-run: ## 运行 Docker 容器
	docker run -d -p 3000:3000 -v $(PWD)/data:/app/data --name webclip-api webclip-api:latest

docker-stop: ## 停止 Docker 容器
	docker stop webclip-api
	docker rm webclip-api
