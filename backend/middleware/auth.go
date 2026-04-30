package middleware

import (
	"crypto/rand"
	"encoding/hex"
	"strings"
	"time"

	"ios-install-tools-go/backend/database"
	"ios-install-tools-go/backend/models"
	"ios-install-tools-go/backend/utils"

	"github.com/gofiber/fiber/v2"
)

// GenerateSessionToken 生成随机 session token
func GenerateSessionToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// CreateSession 创建新的 session
func CreateSession(userID, ipAddress, userAgent string) (*models.Session, error) {
	token, err := GenerateSessionToken()
	if err != nil {
		return nil, err
	}

	now := time.Now().UnixMilli()
	expiresAt := now + (7 * 24 * 60 * 60 * 1000) // 7天过期

	session := &models.Session{
		ID:        token[:16], // 使用前16个字符作为ID
		UserID:    userID,
		Token:     token,
		ExpiresAt: expiresAt,
		CreatedAt: now,
		IPAddress: ipAddress,
		UserAgent: userAgent,
	}

	if err := database.DB.Create(session).Error; err != nil {
		return nil, err
	}

	return session, nil
}

// ValidateSession 验证 session token
func ValidateSession(token string) (*models.Session, error) {
	var session models.Session
	if err := database.DB.Where("token = ?", token).First(&session).Error; err != nil {
		return nil, err
	}

	// 检查是否过期
	if time.Now().UnixMilli() > session.ExpiresAt {
		database.DB.Delete(&session)
		return nil, fiber.NewError(fiber.StatusUnauthorized, "Session expired")
	}

	return &session, nil
}

// DeleteSession 删除 session
func DeleteSession(token string) error {
	return database.DB.Where("token = ?", token).Delete(&models.Session{}).Error
}

// CleanExpiredSessions 清理过期的 sessions
func CleanExpiredSessions() error {
	now := time.Now().UnixMilli()
	return database.DB.Where("expires_at < ?", now).Delete(&models.Session{}).Error
}

// AuthRequired 认证中间件
func AuthRequired(c *fiber.Ctx) error {
	// 从 Authorization header 获取 token
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return utils.UnauthorizedResponse(c, "Missing authorization token")
	}

	// 支持 "Bearer <token>" 格式
	token := authHeader
	if strings.HasPrefix(authHeader, "Bearer ") {
		token = strings.TrimPrefix(authHeader, "Bearer ")
	}

	// 验证 session
	session, err := ValidateSession(token)
	if err != nil {
		return utils.UnauthorizedResponse(c, "Invalid or expired session")
	}

	// 将用户ID存储到 context 中
	c.Locals("user_id", session.UserID)
	c.Locals("session", session)

	return c.Next()
}

// OptionalAuth 可选认证中间件（不强制要求登录）
func OptionalAuth(c *fiber.Ctx) error {
	authHeader := c.Get("Authorization")
	if authHeader != "" {
		token := authHeader
		if strings.HasPrefix(authHeader, "Bearer ") {
			token = strings.TrimPrefix(authHeader, "Bearer ")
		}

		session, err := ValidateSession(token)
		if err == nil {
			c.Locals("user_id", session.UserID)
			c.Locals("session", session)
		}
	}

	return c.Next()
}

// GetCurrentUserID 从 context 获取当前用户ID
func GetCurrentUserID(c *fiber.Ctx) string {
	userID := c.Locals("user_id")
	if userID == nil {
		return ""
	}
	return userID.(string)
}
