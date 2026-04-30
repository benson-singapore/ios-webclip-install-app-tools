package routes

import (
	"ios-install-tools-go/backend/handlers"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/swagger"
)

// SetupRoutes 设置所有路由
func SetupRoutes(app *fiber.App) {
	// 中间件
	app.Use(recover.New())
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
	}))

	// Swagger 文档
	app.Get("/swagger/*", swagger.HandlerDefault)

	// 健康检查
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"message": "Server is running",
		})
	})

	// API 路由组
	api := app.Group("/api")

	// 用户路由
	users := api.Group("/users")
	users.Post("/", handlers.CreateUser)
	users.Get("/", handlers.ListUsers)
	users.Get("/:id", handlers.GetUser)
	users.Put("/:id", handlers.UpdateUser)
	users.Delete("/:id", handlers.DeleteUser)
	users.Post("/:id/login", handlers.UpdateUserLoginTime)

	// 配置路由
	configs := api.Group("/configs")
	configs.Post("/", handlers.CreateConfig)
	configs.Get("/", handlers.ListConfigs)
	configs.Get("/:id", handlers.GetConfig)
	configs.Put("/:id", handlers.UpdateConfig)
	configs.Delete("/:id", handlers.DeleteConfig)
	configs.Post("/:id/toggle", handlers.ToggleConfigStatus)
	configs.Get("/stats/:user_id", handlers.GetUserConfigStats)

	// 安装日志路由
	logs := api.Group("/install-logs")
	logs.Post("/", handlers.CreateInstallLog)
	logs.Get("/", handlers.ListInstallLogs)
	logs.Get("/:id", handlers.GetInstallLog)
	logs.Delete("/:id", handlers.DeleteInstallLog)
	logs.Get("/stats", handlers.GetInstallStats)

	// 404 处理
	app.Use(func(c *fiber.Ctx) error {
		return c.Status(404).JSON(fiber.Map{
			"code":    404,
			"message": "Route not found",
			"data":    nil,
		})
	})
}
