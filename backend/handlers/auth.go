package handlers

import (
	"time"

	"ios-install-tools-go/backend/database"
	"ios-install-tools-go/backend/middleware"
	"ios-install-tools-go/backend/models"
	"ios-install-tools-go/backend/utils"

	"github.com/gofiber/fiber/v2"
)

// LoginRequest 登录请求
type LoginRequest struct {
	UserID   string `json:"user_id" example:"user_001"`
	Email    string `json:"email" example:"user@example.com"`
	Password string `json:"password" example:"password123"` // 可选：如果需要密码验证
}

// LoginResponse 登录响应
type LoginResponse struct {
	Token     string       `json:"token"`
	ExpiresAt int64        `json:"expires_at"`
	User      models.User  `json:"user"`
}

// Login 用户登录
// @Summary 用户登录
// @Description 用户登录并创建 session
// @Tags 认证
// @Accept json
// @Produce json
// @Param login body LoginRequest true "登录信息"
// @Success 200 {object} utils.Response{data=LoginResponse}
// @Failure 400 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Failure 404 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/auth/login [post]
func Login(c *fiber.Ctx) error {
	var req LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if req.UserID == "" && req.Email == "" {
		return utils.BadRequestResponse(c, "User ID or email is required")
	}

	// 查找用户
	var user models.User
	query := database.DB
	if req.UserID != "" {
		query = query.Where("id = ?", req.UserID)
	} else {
		query = query.Where("email = ?", req.Email)
	}

	if err := query.First(&user).Error; err != nil {
		return utils.NotFoundResponse(c, "User not found")
	}

	// 检查用户状态
	if user.Status != 1 {
		return utils.UnauthorizedResponse(c, "User account is disabled")
	}

	// 创建 session
	session, err := middleware.CreateSession(user.ID, c.IP(), c.Get("User-Agent"))
	if err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to create session")
	}

	// 更新用户最后登录时间
	now := time.Now().UnixMilli()
	database.DB.Model(&user).Updates(map[string]interface{}{
		"last_login_at": now,
		"updated_at":    now,
	})

	// 重新查询用户信息
	database.DB.First(&user, "id = ?", user.ID)

	return utils.SuccessResponse(c, LoginResponse{
		Token:     session.Token,
		ExpiresAt: session.ExpiresAt,
		User:      user,
	})
}

// Logout 用户登出
// @Summary 用户登出
// @Description 用户登出并删除 session
// @Tags 认证
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/auth/logout [post]
func Logout(c *fiber.Ctx) error {
	// 从 header 获取 token
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return utils.UnauthorizedResponse(c, "Missing authorization token")
	}

	token := authHeader
	if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
		token = authHeader[7:]
	}

	// 删除 session
	if err := middleware.DeleteSession(token); err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to logout")
	}

	return utils.SuccessWithMessage(c, "Logout successful", nil)
}

// GetCurrentUser 获取当前登录用户信息
// @Summary 获取当前用户信息
// @Description 获取当前登录用户的详细信息
// @Tags 认证
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} utils.Response{data=models.User}
// @Failure 401 {object} utils.Response
// @Failure 404 {object} utils.Response
// @Router /api/auth/me [get]
func GetCurrentUser(c *fiber.Ctx) error {
	userID := middleware.GetCurrentUserID(c)
	if userID == "" {
		return utils.UnauthorizedResponse(c, "Not authenticated")
	}

	var user models.User
	if err := database.DB.First(&user, "id = ?", userID).Error; err != nil {
		return utils.NotFoundResponse(c, "User not found")
	}

	return utils.SuccessResponse(c, user)
}

// RefreshSession 刷新 session
// @Summary 刷新 session
// @Description 刷新当前 session 的过期时间
// @Tags 认证
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} utils.Response{data=object}
// @Failure 401 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/auth/refresh [post]
func RefreshSession(c *fiber.Ctx) error {
	session := c.Locals("session")
	if session == nil {
		return utils.UnauthorizedResponse(c, "Not authenticated")
	}

	s := session.(*models.Session)
	
	// 延长过期时间
	now := time.Now().UnixMilli()
	newExpiresAt := now + (7 * 24 * 60 * 60 * 1000) // 再延长7天

	if err := database.DB.Model(s).Update("expires_at", newExpiresAt).Error; err != nil {
		return utils.InternalServerErrorResponse(c, "Failed to refresh session")
	}

	return utils.SuccessResponse(c, fiber.Map{
		"token":      s.Token,
		"expires_at": newExpiresAt,
	})
}
