package utils

import "github.com/gofiber/fiber/v2"

// Response 统一响应结构
type Response struct {
	Code    int         `json:"code" example:"200"`
	Message string      `json:"message" example:"success"`
	Data    interface{} `json:"data,omitempty"`
}

// SuccessResponse 成功响应
func SuccessResponse(c *fiber.Ctx, data interface{}) error {
	return c.JSON(Response{
		Code:    200,
		Message: "success",
		Data:    data,
	})
}

// SuccessWithMessage 成功响应（自定义消息）
func SuccessWithMessage(c *fiber.Ctx, message string, data interface{}) error {
	return c.JSON(Response{
		Code:    200,
		Message: message,
		Data:    data,
	})
}

// ErrorResponse 错误响应
func ErrorResponse(c *fiber.Ctx, code int, message string) error {
	return c.JSON(Response{
		Code:    code,
		Message: message,
		Data:    nil,
	})
}

// BadRequestResponse 400 错误
func BadRequestResponse(c *fiber.Ctx, message string) error {
	return c.JSON(Response{
		Code:    400,
		Message: message,
		Data:    nil,
	})
}

// NotFoundResponse 404 错误
func NotFoundResponse(c *fiber.Ctx, message string) error {
	return c.JSON(Response{
		Code:    404,
		Message: message,
		Data:    nil,
	})
}

// InternalServerErrorResponse 500 错误
func InternalServerErrorResponse(c *fiber.Ctx, message string) error {
	return c.JSON(Response{
		Code:    500,
		Message: message,
		Data:    nil,
	})
}

// UnauthorizedResponse 401 错误
func UnauthorizedResponse(c *fiber.Ctx, message string) error {
	return c.JSON(Response{
		Code:    401,
		Message: message,
		Data:    nil,
	})
}

// ForbiddenResponse 403 错误
func ForbiddenResponse(c *fiber.Ctx, message string) error {
	return c.JSON(Response{
		Code:    403,
		Message: message,
		Data:    nil,
	})
}
