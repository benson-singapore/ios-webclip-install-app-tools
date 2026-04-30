package handlers

import (
	"time"

	"ios-install-tools-go/backend/database"
	"ios-install-tools-go/backend/models"
	"ios-install-tools-go/backend/utils"

	"github.com/gofiber/fiber/v2"
)

// CreateInstallLogRequest 创建安装日志请求
type CreateInstallLogRequest struct {
	ConfigID   string `json:"config_id" example:"conf_1234567890"`
	UserID     string `json:"user_id" example:"user_001"`
	IPAddress  string `json:"ip_address" example:"192.168.1.1"`
	UserAgent  string `json:"user_agent" example:"Mozilla/5.0..."`
	DeviceInfo string `json:"device_info" example:"iPhone 13 Pro"`
}

// CreateInstallLog 创建安装日志
// @Summary 创建安装日志
// @Description 记录配置安装日志
// @Tags 安装日志
// @Accept json
// @Produce json
// @Param log body CreateInstallLogRequest true "安装日志信息"
// @Success 200 {object} utils.Response{data=models.InstallLog}
// @Failure 400 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/install-logs [post]
func CreateInstallLog(c *fiber.Ctx) error {
	var req CreateInstallLogRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if req.ConfigID == "" {
		return utils.BadRequestResponse(c, "Config ID is required")
	}
	if req.UserID == "" {
		return utils.BadRequestResponse(c, "User ID is required")
	}

	// 自动获取 IP 地址（如果未提供）
	if req.IPAddress == "" {
		req.IPAddress = c.IP()
	}

	// 自动获取 User-Agent（如果未提供）
	if req.UserAgent == "" {
		req.UserAgent = c.Get("User-Agent")
	}

	now := time.Now().UnixMilli()
	log := models.InstallLog{
		ConfigID:   req.ConfigID,
		UserID:     req.UserID,
		InstallAt:  now,
		IPAddress:  req.IPAddress,
		UserAgent:  req.UserAgent,
		DeviceInfo: req.DeviceInfo,
	}

	if err := database.DB.Create(&log).Error; err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to create install log")
	}

	// 更新配置的安装次数和最后安装时间
	database.DB.Model(&models.Config{}).
		Where("id = ?", req.ConfigID).
		Updates(map[string]interface{}{
			"install_count":   database.DB.Raw("install_count + 1"),
			"last_install_at": now,
		})

	return utils.SuccessResponse(c, log)
}

// GetInstallLog 获取安装日志详情
// @Summary 获取安装日志详情
// @Description 根据日志ID获取安装日志详情
// @Tags 安装日志
// @Accept json
// @Produce json
// @Param id path int true "日志ID"
// @Success 200 {object} utils.Response{data=models.InstallLog}
// @Failure 404 {object} utils.Response
// @Router /api/install-logs/{id} [get]
func GetInstallLog(c *fiber.Ctx) error {
	id := c.Params("id")

	var log models.InstallLog
	if err := database.DB.First(&log, "id = ?", id).Error; err != nil {
		return utils.NotFoundResponse(c, "Install log not found")
	}

	return utils.SuccessResponse(c, log)
}

// ListInstallLogs 获取安装日志列表
// @Summary 获取安装日志列表
// @Description 获取安装日志列表，支持按配置ID和用户ID筛选
// @Tags 安装日志
// @Accept json
// @Produce json
// @Param config_id query string false "配置ID"
// @Param user_id query string false "用户ID"
// @Param page query int false "页码" default(1)
// @Param page_size query int false "每页数量" default(10)
// @Success 200 {object} utils.Response{data=object}
// @Router /api/install-logs [get]
func ListInstallLogs(c *fiber.Ctx) error {
	configID := c.Query("config_id")
	userID := c.Query("user_id")
	page := c.QueryInt("page", 1)
	pageSize := c.QueryInt("page_size", 10)

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	offset := (page - 1) * pageSize

	query := database.DB.Model(&models.InstallLog{})
	if configID != "" {
		query = query.Where("config_id = ?", configID)
	}
	if userID != "" {
		query = query.Where("user_id = ?", userID)
	}

	var logs []models.InstallLog
	var total int64

	query.Count(&total)
	if err := query.Offset(offset).Limit(pageSize).Order("install_at DESC").Find(&logs).Error; err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to fetch install logs")
	}

	return utils.SuccessResponse(c, fiber.Map{
		"logs":      logs,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

// DeleteInstallLog 删除安装日志
// @Summary 删除安装日志
// @Description 删除指定的安装日志
// @Tags 安装日志
// @Accept json
// @Produce json
// @Param id path int true "日志ID"
// @Success 200 {object} utils.Response
// @Failure 404 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/install-logs/{id} [delete]
func DeleteInstallLog(c *fiber.Ctx) error {
	id := c.Params("id")

	var log models.InstallLog
	if err := database.DB.First(&log, "id = ?", id).Error; err != nil {
		return utils.NotFoundResponse(c, "Install log not found")
	}

	if err := database.DB.Delete(&log).Error; err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to delete install log")
	}

	return utils.SuccessWithMessage(c, "Install log deleted successfully", nil)
}

// GetInstallStats 获取安装统计
// @Summary 获取安装统计
// @Description 获取配置的安装统计信息
// @Tags 安装日志
// @Accept json
// @Produce json
// @Param config_id query string false "配置ID"
// @Param user_id query string false "用户ID"
// @Success 200 {object} utils.Response{data=object}
// @Router /api/install-logs/stats [get]
func GetInstallStats(c *fiber.Ctx) error {
	configID := c.Query("config_id")
	userID := c.Query("user_id")

	query := database.DB.Model(&models.InstallLog{})
	if configID != "" {
		query = query.Where("config_id = ?", configID)
	}
	if userID != "" {
		query = query.Where("user_id = ?", userID)
	}

	var total int64
	query.Count(&total)

	// 获取最近的安装记录
	var recentLogs []models.InstallLog
	query.Order("install_at DESC").Limit(10).Find(&recentLogs)

	return utils.SuccessResponse(c, fiber.Map{
		"total":       total,
		"recent_logs": recentLogs,
	})
}
