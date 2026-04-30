package handlers

import (
	"fmt"
	"time"

	"ios-install-tools-go/backend/database"
	"ios-install-tools-go/backend/models"
	"ios-install-tools-go/backend/utils"

	"github.com/gofiber/fiber/v2"
)

// CreateConfigRequest 创建配置请求
type CreateConfigRequest struct {
	ID          string `json:"id" example:"conf_1234567890"`
	UserID      string `json:"user_id" example:"user_001"`
	Name        string `json:"name" example:"我的应用"`
	Description string `json:"description" example:"此配置由 iOS 管理后台生成"`
	URL         string `json:"url" example:"https://example.com"`
	IconBase64  string `json:"icon_base64" example:"data:image/png;base64,..."`
	Status      int    `json:"status" example:"1"`
}

// UpdateConfigRequest 更新配置请求
type UpdateConfigRequest struct {
	Name        string `json:"name" example:"我的应用"`
	Description string `json:"description" example:"此配置由 iOS 管理后台生成"`
	URL         string `json:"url" example:"https://example.com"`
	IconBase64  string `json:"icon_base64" example:"data:image/png;base64,..."`
	Status      *int   `json:"status" example:"1"`
}

// CreateConfig 创建配置
// @Summary 创建配置
// @Description 创建新的 WebClip 配置
// @Tags 配置管理
// @Accept json
// @Produce json
// @Param config body CreateConfigRequest true "配置信息"
// @Success 200 {object} utils.Response{data=models.Config}
// @Failure 400 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/configs [post]
func CreateConfig(c *fiber.Ctx) error {
	var req CreateConfigRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if req.UserID == "" {
		return utils.BadRequestResponse(c, "User ID is required")
	}
	if req.Name == "" {
		return utils.BadRequestResponse(c, "Name is required")
	}
	if req.URL == "" {
		return utils.BadRequestResponse(c, "URL is required")
	}

	// 生成配置 ID（如果未提供）
	if req.ID == "" {
		req.ID = fmt.Sprintf("conf_%d", time.Now().UnixMilli())
	}

	now := time.Now().UnixMilli()
	config := models.Config{
		ID:          req.ID,
		UserID:      req.UserID,
		Name:        req.Name,
		Description: req.Description,
		URL:         req.URL,
		IconBase64:  req.IconBase64,
		Status:      req.Status,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	if err := database.DB.Create(&config).Error; err != nil {
		return utils.InternalServerErrorResponse(c, fmt.Sprintf("Failed to create config: %v", err))
	}

	return utils.SuccessResponse(c, config)
}

// GetConfig 获取配置详情
// @Summary 获取配置详情
// @Description 根据配置ID获取配置详情
// @Tags 配置管理
// @Accept json
// @Produce json
// @Param id path string true "配置ID"
// @Success 200 {object} utils.Response{data=models.Config}
// @Failure 404 {object} utils.Response
// @Router /api/configs/{id} [get]
func GetConfig(c *fiber.Ctx) error {
	id := c.Params("id")

	var config models.Config
	if err := database.DB.First(&config, "id = ?", id).Error; err != nil {
		return utils.NotFoundResponse(c, "Config not found")
	}

	return utils.SuccessResponse(c, config)
}

// ListConfigs 获取配置列表
// @Summary 获取配置列表
// @Description 获取配置列表，支持按用户ID和状态筛选
// @Tags 配置管理
// @Accept json
// @Produce json
// @Param user_id query string false "用户ID"
// @Param status query int false "配置状态" Enums(0, 1)
// @Param page query int false "页码" default(1)
// @Param page_size query int false "每页数量" default(10)
// @Success 200 {object} utils.Response{data=object}
// @Router /api/configs [get]
func ListConfigs(c *fiber.Ctx) error {
	userID := c.Query("user_id")
	status := c.QueryInt("status", -1)
	page := c.QueryInt("page", 1)
	pageSize := c.QueryInt("page_size", 10)

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	offset := (page - 1) * pageSize

	query := database.DB.Model(&models.Config{})
	if userID != "" {
		query = query.Where("user_id = ?", userID)
	}
	if status >= 0 {
		query = query.Where("status = ?", status)
	}

	var configs []models.Config
	var total int64

	query.Count(&total)
	if err := query.Offset(offset).Limit(pageSize).Order("updated_at DESC").Find(&configs).Error; err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to fetch configs")
	}

	return utils.SuccessResponse(c, fiber.Map{
		"configs":   configs,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

// UpdateConfig 更新配置
// @Summary 更新配置
// @Description 更新配置信息
// @Tags 配置管理
// @Accept json
// @Produce json
// @Param id path string true "配置ID"
// @Param config body UpdateConfigRequest true "配置信息"
// @Success 200 {object} utils.Response{data=models.Config}
// @Failure 400 {object} utils.Response
// @Failure 404 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/configs/{id} [put]
func UpdateConfig(c *fiber.Ctx) error {
	id := c.Params("id")

	var req UpdateConfigRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	var config models.Config
	if err := database.DB.First(&config, "id = ?", id).Error; err != nil {
		return utils.NotFoundResponse(c, "Config not found")
	}

	updates := make(map[string]interface{})
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Description != "" {
		updates["description"] = req.Description
	}
	if req.URL != "" {
		updates["url"] = req.URL
	}
	if req.IconBase64 != "" {
		updates["icon_base64"] = req.IconBase64
	}
	if req.Status != nil {
		updates["status"] = *req.Status
	}
	updates["updated_at"] = time.Now().UnixMilli()

	if err := database.DB.Model(&config).Updates(updates).Error; err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to update config")
	}

	// 重新查询更新后的配置
	database.DB.First(&config, "id = ?", id)

	return utils.SuccessResponse(c, config)
}

// DeleteConfig 删除配置
// @Summary 删除配置
// @Description 删除配置及其相关日志
// @Tags 配置管理
// @Accept json
// @Produce json
// @Param id path string true "配置ID"
// @Success 200 {object} utils.Response
// @Failure 404 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/configs/{id} [delete]
func DeleteConfig(c *fiber.Ctx) error {
	id := c.Params("id")

	var config models.Config
	if err := database.DB.First(&config, "id = ?", id).Error; err != nil {
		return utils.NotFoundResponse(c, "Config not found")
	}

	if err := database.DB.Delete(&config).Error; err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to delete config")
	}

	return utils.SuccessWithMessage(c, "Config deleted successfully", nil)
}

// ToggleConfigStatus 切换配置状态
// @Summary 切换配置状态
// @Description 启用或禁用配置
// @Tags 配置管理
// @Accept json
// @Produce json
// @Param id path string true "配置ID"
// @Success 200 {object} utils.Response{data=models.Config}
// @Failure 404 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/configs/{id}/toggle [post]
func ToggleConfigStatus(c *fiber.Ctx) error {
	id := c.Params("id")

	var config models.Config
	if err := database.DB.First(&config, "id = ?", id).Error; err != nil {
		return utils.NotFoundResponse(c, "Config not found")
	}

	newStatus := 1
	if config.Status == 1 {
		newStatus = 0
	}

	if err := database.DB.Model(&config).Updates(map[string]interface{}{
		"status":     newStatus,
		"updated_at": time.Now().UnixMilli(),
	}).Error; err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to toggle config status")
	}

	// 重新查询更新后的配置
	database.DB.First(&config, "id = ?", id)

	return utils.SuccessResponse(c, config)
}

// GetUserConfigStats 获取用户配置统计
// @Summary 获取用户配置统计
// @Description 获取用户的配置统计信息
// @Tags 配置管理
// @Accept json
// @Produce json
// @Param user_id path string true "用户ID"
// @Success 200 {object} utils.Response{data=object}
// @Router /api/configs/stats/{user_id} [get]
func GetUserConfigStats(c *fiber.Ctx) error {
	userID := c.Params("user_id")

	var total int64
	var enabled int64

	database.DB.Model(&models.Config{}).Where("user_id = ?", userID).Count(&total)
	database.DB.Model(&models.Config{}).Where("user_id = ? AND status = 1", userID).Count(&enabled)

	return utils.SuccessResponse(c, fiber.Map{
		"total":    total,
		"enabled":  enabled,
		"disabled": total - enabled,
	})
}
