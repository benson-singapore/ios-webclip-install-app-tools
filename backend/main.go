package main

import (
	"log"
	"os"

	"ios-install-tools-go/backend/database"
	_ "ios-install-tools-go/backend/docs"
	"ios-install-tools-go/backend/routes"

	"github.com/gofiber/fiber/v2"
)

// @title iOS WebClip Manager API
// @version 1.0
// @description iOS WebClip 配置管理系统 API 文档
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.email support@example.com

// @license.name MIT
// @license.url https://opensource.org/licenses/MIT

// @host localhost:4000
// @BasePath /
// @schemes http https

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description 输入 "Bearer {token}" 格式的认证令牌

func main() {
	// 获取配置
	port := getEnv("PORT", "4000")
	dbPath := getEnv("DB_PATH", "./data/webclip.db")
	swaggerEnabled := getEnvBool("SWAGGER_ENABLED", true)

	// 初始化数据库
	log.Println("Initializing database...")
	if err := database.InitDatabase(dbPath); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	log.Println("Database initialized successfully")

	// 创建 Fiber 应用
	app := fiber.New(fiber.Config{
		AppName:      "iOS WebClip Manager API v1.0",
		ServerHeader: "Fiber",
		ErrorHandler: customErrorHandler,
	})

	// 设置路由
	routes.SetupRoutes(app, swaggerEnabled)

	// 启动服务器
	log.Printf("Server starting on port %s...", port)
	if swaggerEnabled {
		log.Printf("Swagger documentation: http://localhost:%s/swagger/index.html", port)
	} else {
		log.Println("Swagger documentation is disabled")
	}
	if err := app.Listen(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

// getEnv 获取环境变量，如果不存在则返回默认值
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

// getEnvBool 获取布尔环境变量，支持 true/false/1/0/yes/no/on/off
func getEnvBool(key string, defaultValue bool) bool {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}

	switch value {
	case "1", "true", "TRUE", "True", "yes", "YES", "on", "ON":
		return true
	case "0", "false", "FALSE", "False", "no", "NO", "off", "OFF":
		return false
	default:
		return defaultValue
	}
}

// customErrorHandler 自定义错误处理
func customErrorHandler(c *fiber.Ctx, err error) error {
	code := fiber.StatusInternalServerError
	message := "Internal Server Error"

	if e, ok := err.(*fiber.Error); ok {
		code = e.Code
		message = e.Message
	}

	return c.Status(code).JSON(fiber.Map{
		"code":    code,
		"message": message,
		"data":    nil,
	})
}
