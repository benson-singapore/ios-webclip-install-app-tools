package handlers

import (
	"fmt"
	"time"

	"ios-install-tools-go/backend/database"
	"ios-install-tools-go/backend/models"
	"ios-install-tools-go/backend/utils"

	"github.com/gofiber/fiber/v2"
)

// CreateUserRequest 创建用户请求
type CreateUserRequest struct {
	ID          string `json:"id" example:"user_001"`
	Email       string `json:"email" example:"user@example.com"`
	DisplayName string `json:"display_name" example:"John Doe"`
	IsAnonymous int    `json:"is_anonymous" example:"0"`
}

// UpdateUserRequest 更新用户请求
type UpdateUserRequest struct {
	Email       string `json:"email" example:"user@example.com"`
	DisplayName string `json:"display_name" example:"John Doe"`
	Status      *int   `json:"status" example:"1"`
}

// CreateUser 创建用户
// @Summary 创建用户
// @Description 创建新用户
// @Tags 用户管理
// @Accept json
// @Produce json
// @Param user body CreateUserRequest true "用户信息"
// @Success 200 {object} utils.Response{data=models.User}
// @Failure 400 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/users [post]
func CreateUser(c *fiber.Ctx) error {
	var req CreateUserRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if req.ID == "" {
		return utils.BadRequestResponse(c, "User ID is required")
	}

	now := time.Now().UnixMilli()
	user := models.User{
		ID:          req.ID,
		Email:       req.Email,
		DisplayName: req.DisplayName,
		IsAnonymous: req.IsAnonymous,
		CreatedAt:   now,
		UpdatedAt:   now,
		LastLoginAt: now,
		Status:      1,
	}

	if err := database.DB.Create(&user).Error; err != nil {
		return utils.InternalServerErrorResponse(c, fmt.Sprintf("Failed to create user: %v", err))
	}

	return utils.SuccessResponse(c, user)
}

// GetUser 获取用户详情
// @Summary 获取用户详情
// @Description 根据用户ID获取用户详情
// @Tags 用户管理
// @Accept json
// @Produce json
// @Param id path string true "用户ID"
// @Success 200 {object} utils.Response{data=models.User}
// @Failure 404 {object} utils.Response
// @Router /api/users/{id} [get]
func GetUser(c *fiber.Ctx) error {
	id := c.Params("id")

	var user models.User
	if err := database.DB.First(&user, "id = ?", id).Error; err != nil {
		return utils.NotFoundResponse(c, "User not found")
	}

	return utils.SuccessResponse(c, user)
}

// ListUsers 获取用户列表
// @Summary 获取用户列表
// @Description 获取所有用户列表，支持分页
// @Tags 用户管理
// @Accept json
// @Produce json
// @Param page query int false "页码" default(1)
// @Param page_size query int false "每页数量" default(10)
// @Param status query int false "用户状态" Enums(0, 1)
// @Success 200 {object} utils.Response{data=[]models.User}
// @Router /api/users [get]
func ListUsers(c *fiber.Ctx) error {
	page := c.QueryInt("page", 1)
	pageSize := c.QueryInt("page_size", 10)
	status := c.QueryInt("status", -1)

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	offset := (page - 1) * pageSize

	query := database.DB.Model(&models.User{})
	if status >= 0 {
		query = query.Where("status = ?", status)
	}

	var users []models.User
	var total int64

	query.Count(&total)
	if err := query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&users).Error; err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to fetch users")
	}

	return utils.SuccessResponse(c, fiber.Map{
		"users":     users,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

// UpdateUser 更新用户
// @Summary 更新用户
// @Description 更新用户信息
// @Tags 用户管理
// @Accept json
// @Produce json
// @Param id path string true "用户ID"
// @Param user body UpdateUserRequest true "用户信息"
// @Success 200 {object} utils.Response{data=models.User}
// @Failure 400 {object} utils.Response
// @Failure 404 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/users/{id} [put]
func UpdateUser(c *fiber.Ctx) error {
	id := c.Params("id")

	var req UpdateUserRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	var user models.User
	if err := database.DB.First(&user, "id = ?", id).Error; err != nil {
		return utils.NotFoundResponse(c, "User not found")
	}

	updates := make(map[string]interface{})
	if req.Email != "" {
		updates["email"] = req.Email
	}
	if req.DisplayName != "" {
		updates["display_name"] = req.DisplayName
	}
	if req.Status != nil {
		updates["status"] = *req.Status
	}
	updates["updated_at"] = time.Now().UnixMilli()

	if err := database.DB.Model(&user).Updates(updates).Error; err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to update user")
	}

	// 重新查询更新后的用户
	database.DB.First(&user, "id = ?", id)

	return utils.SuccessResponse(c, user)
}

// DeleteUser 删除用户
// @Summary 删除用户
// @Description 删除用户及其所有配置
// @Tags 用户管理
// @Accept json
// @Produce json
// @Param id path string true "用户ID"
// @Success 200 {object} utils.Response
// @Failure 404 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/users/{id} [delete]
func DeleteUser(c *fiber.Ctx) error {
	id := c.Params("id")

	var user models.User
	if err := database.DB.First(&user, "id = ?", id).Error; err != nil {
		return utils.NotFoundResponse(c, "User not found")
	}

	if err := database.DB.Delete(&user).Error; err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to delete user")
	}

	return utils.SuccessWithMessage(c, "User deleted successfully", nil)
}

// UpdateUserLoginTime 更新用户最后登录时间
// @Summary 更新用户最后登录时间
// @Description 更新用户最后登录时间
// @Tags 用户管理
// @Accept json
// @Produce json
// @Param id path string true "用户ID"
// @Success 200 {object} utils.Response
// @Failure 404 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/users/{id}/login [post]
func UpdateUserLoginTime(c *fiber.Ctx) error {
	id := c.Params("id")

	var user models.User
	if err := database.DB.First(&user, "id = ?", id).Error; err != nil {
		return utils.NotFoundResponse(c, "User not found")
	}

	now := time.Now().UnixMilli()
	if err := database.DB.Model(&user).Updates(map[string]interface{}{
		"last_login_at": now,
		"updated_at":    now,
	}).Error; err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to update login time")
	}

	return utils.SuccessWithMessage(c, "Login time updated successfully", nil)
}
