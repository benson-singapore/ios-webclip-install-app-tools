package models

import "gorm.io/gorm"

// User 用户表模型
type User struct {
	ID          string `gorm:"primaryKey;type:text" json:"id"`
	CreatedAt   int64  `gorm:"not null" json:"created_at"`
	UpdatedAt   int64  `gorm:"not null" json:"updated_at"`
	IsAnonymous int    `gorm:"default:1" json:"is_anonymous"`
	Email       string `gorm:"type:text" json:"email"`
	DisplayName string `gorm:"type:text" json:"display_name"`
	LastLoginAt int64  `json:"last_login_at"`
	Status      int    `gorm:"default:1" json:"status"`
}

// TableName 指定表名
func (User) TableName() string {
	return "users"
}

// BeforeCreate GORM 钩子：创建前自动设置时间戳
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.CreatedAt == 0 {
		u.CreatedAt = getCurrentTimestamp()
	}
	if u.UpdatedAt == 0 {
		u.UpdatedAt = getCurrentTimestamp()
	}
	return nil
}

// BeforeUpdate GORM 钩子：更新前自动设置时间戳
func (u *User) BeforeUpdate(tx *gorm.DB) error {
	u.UpdatedAt = getCurrentTimestamp()
	return nil
}
