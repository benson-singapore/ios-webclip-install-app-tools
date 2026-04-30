package models

import "gorm.io/gorm"

// Config 配置表模型
type Config struct {
	ID            string `gorm:"primaryKey;type:text" json:"id"`
	UserID        string `gorm:"not null;type:text;index:idx_configs_user_id" json:"user_id"`
	Name          string `gorm:"not null;type:text" json:"name"`
	Description   string `gorm:"type:text" json:"description"`
	URL           string `gorm:"not null;type:text" json:"url"`
	IconBase64    string `gorm:"type:text" json:"icon_base64"`
	Status        int    `gorm:"default:1;index:idx_configs_status" json:"status"`
	CreatedAt     int64  `gorm:"not null" json:"created_at"`
	UpdatedAt     int64  `gorm:"not null;index:idx_configs_updated_at" json:"updated_at"`
	InstallCount  int    `gorm:"default:0" json:"install_count"`
	LastInstallAt int64  `json:"last_install_at"`
}

// TableName 指定表名
func (Config) TableName() string {
	return "configs"
}

// BeforeCreate GORM 钩子：创建前自动设置时间戳
func (c *Config) BeforeCreate(tx *gorm.DB) error {
	if c.CreatedAt == 0 {
		c.CreatedAt = getCurrentTimestamp()
	}
	if c.UpdatedAt == 0 {
		c.UpdatedAt = getCurrentTimestamp()
	}
	return nil
}

// BeforeUpdate GORM 钩子：更新前自动设置时间戳
func (c *Config) BeforeUpdate(tx *gorm.DB) error {
	c.UpdatedAt = getCurrentTimestamp()
	return nil
}
