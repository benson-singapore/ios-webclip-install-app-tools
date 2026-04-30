package models

// Session 会话模型
type Session struct {
	ID        string `gorm:"primaryKey;type:text" json:"id"`         // Session ID
	UserID    string `gorm:"type:text;not null;index" json:"user_id"` // 用户ID
	Token     string `gorm:"type:text;not null;uniqueIndex" json:"token"` // Session Token
	ExpiresAt int64  `gorm:"not null;index" json:"expires_at"`       // 过期时间戳（毫秒）
	CreatedAt int64  `gorm:"not null" json:"created_at"`             // 创建时间戳（毫秒）
	IPAddress string `gorm:"type:text" json:"ip_address"`            // IP地址
	UserAgent string `gorm:"type:text" json:"user_agent"`            // User-Agent
}

// TableName 指定表名
func (Session) TableName() string {
	return "sessions"
}
