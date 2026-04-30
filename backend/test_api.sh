#!/bin/bash

# API 测试脚本

BASE_URL="http://localhost:3000"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 iOS WebClip Manager API 测试"
echo "=================================="
echo ""

# 检查服务是否运行
echo "📡 检查服务状态..."
if ! curl -s "$BASE_URL/health" > /dev/null; then
    echo -e "${RED}❌ 服务未运行，请先启动服务${NC}"
    echo "运行: ./start.sh 或 cd backend && go run main.go"
    exit 1
fi
echo -e "${GREEN}✅ 服务正常运行${NC}"
echo ""

# 测试健康检查
echo "1️⃣  测试健康检查"
echo "-----------------------------------"
RESPONSE=$(curl -s "$BASE_URL/health")
echo "$RESPONSE" | jq '.'
echo ""

# 创建测试用户
echo "2️⃣  创建测试用户"
echo "-----------------------------------"
USER_ID="user_test_$(date +%s)"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/users" \
  -H "Content-Type: application/json" \
  -d "{
    \"id\": \"$USER_ID\",
    \"email\": \"test@example.com\",
    \"display_name\": \"Test User\",
    \"is_anonymous\": 0
  }")
echo "$RESPONSE" | jq '.'

if echo "$RESPONSE" | jq -e '.code == 200' > /dev/null; then
    echo -e "${GREEN}✅ 用户创建成功${NC}"
else
    echo -e "${RED}❌ 用户创建失败${NC}"
fi
echo ""

# 获取用户列表
echo "3️⃣  获取用户列表"
echo "-----------------------------------"
RESPONSE=$(curl -s "$BASE_URL/api/users?page=1&page_size=5")
echo "$RESPONSE" | jq '.'
echo ""

# 获取用户详情
echo "4️⃣  获取用户详情"
echo "-----------------------------------"
RESPONSE=$(curl -s "$BASE_URL/api/users/$USER_ID")
echo "$RESPONSE" | jq '.'
echo ""

# 创建配置
echo "5️⃣  创建配置"
echo "-----------------------------------"
CONFIG_RESPONSE=$(curl -s -X POST "$BASE_URL/api/configs" \
  -H "Content-Type: application/json" \
  -d "{
    \"user_id\": \"$USER_ID\",
    \"name\": \"测试应用\",
    \"description\": \"这是一个测试应用配置\",
    \"url\": \"https://example.com\",
    \"status\": 1
  }")
echo "$CONFIG_RESPONSE" | jq '.'

CONFIG_ID=$(echo "$CONFIG_RESPONSE" | jq -r '.data.id')
if [ "$CONFIG_ID" != "null" ] && [ -n "$CONFIG_ID" ]; then
    echo -e "${GREEN}✅ 配置创建成功，ID: $CONFIG_ID${NC}"
else
    echo -e "${RED}❌ 配置创建失败${NC}"
fi
echo ""

# 获取配置列表
echo "6️⃣  获取配置列表"
echo "-----------------------------------"
RESPONSE=$(curl -s "$BASE_URL/api/configs?user_id=$USER_ID")
echo "$RESPONSE" | jq '.'
echo ""

# 获取配置详情
echo "7️⃣  获取配置详情"
echo "-----------------------------------"
RESPONSE=$(curl -s "$BASE_URL/api/configs/$CONFIG_ID")
echo "$RESPONSE" | jq '.'
echo ""

# 更新配置
echo "8️⃣  更新配置"
echo "-----------------------------------"
RESPONSE=$(curl -s -X PUT "$BASE_URL/api/configs/$CONFIG_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "更新后的应用名称",
    "description": "更新后的描述"
  }')
echo "$RESPONSE" | jq '.'
echo ""

# 切换配置状态
echo "9️⃣  切换配置状态"
echo "-----------------------------------"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/configs/$CONFIG_ID/toggle")
echo "$RESPONSE" | jq '.'
echo ""

# 创建安装日志
echo "🔟 创建安装日志"
echo "-----------------------------------"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/install-logs" \
  -H "Content-Type: application/json" \
  -d "{
    \"config_id\": \"$CONFIG_ID\",
    \"user_id\": \"$USER_ID\",
    \"ip_address\": \"192.168.1.100\",
    \"user_agent\": \"Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)\",
    \"device_info\": \"iPhone 13 Pro\"
  }")
echo "$RESPONSE" | jq '.'

LOG_ID=$(echo "$RESPONSE" | jq -r '.data.id')
if [ "$LOG_ID" != "null" ] && [ -n "$LOG_ID" ]; then
    echo -e "${GREEN}✅ 安装日志创建成功，ID: $LOG_ID${NC}"
else
    echo -e "${RED}❌ 安装日志创建失败${NC}"
fi
echo ""

# 获取安装日志列表
echo "1️⃣1️⃣  获取安装日志列表"
echo "-----------------------------------"
RESPONSE=$(curl -s "$BASE_URL/api/install-logs?config_id=$CONFIG_ID")
echo "$RESPONSE" | jq '.'
echo ""

# 获取安装统计
echo "1️⃣2️⃣  获取安装统计"
echo "-----------------------------------"
RESPONSE=$(curl -s "$BASE_URL/api/install-logs/stats?config_id=$CONFIG_ID")
echo "$RESPONSE" | jq '.'
echo ""

# 获取用户配置统计
echo "1️⃣3️⃣  获取用户配置统计"
echo "-----------------------------------"
RESPONSE=$(curl -s "$BASE_URL/api/configs/stats/$USER_ID")
echo "$RESPONSE" | jq '.'
echo ""

# 清理测试数据
echo "🧹 清理测试数据"
echo "-----------------------------------"
echo -e "${YELLOW}是否删除测试数据？(y/n)${NC}"
read -r CLEANUP

if [ "$CLEANUP" = "y" ] || [ "$CLEANUP" = "Y" ]; then
    # 删除安装日志
    if [ -n "$LOG_ID" ] && [ "$LOG_ID" != "null" ]; then
        curl -s -X DELETE "$BASE_URL/api/install-logs/$LOG_ID" > /dev/null
        echo "✅ 删除安装日志"
    fi
    
    # 删除配置
    if [ -n "$CONFIG_ID" ] && [ "$CONFIG_ID" != "null" ]; then
        curl -s -X DELETE "$BASE_URL/api/configs/$CONFIG_ID" > /dev/null
        echo "✅ 删除配置"
    fi
    
    # 删除用户
    curl -s -X DELETE "$BASE_URL/api/users/$USER_ID" > /dev/null
    echo "✅ 删除用户"
    
    echo -e "${GREEN}✅ 测试数据已清理${NC}"
else
    echo -e "${YELLOW}⚠️  保留测试数据${NC}"
    echo "用户ID: $USER_ID"
    echo "配置ID: $CONFIG_ID"
    echo "日志ID: $LOG_ID"
fi

echo ""
echo "=================================="
echo -e "${GREEN}✅ 测试完成！${NC}"
echo "=================================="
