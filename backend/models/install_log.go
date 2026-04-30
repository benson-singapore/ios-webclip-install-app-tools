package models

// InstallLog 安装日志表模型
type InstallLog struct {
	ID         int64  `gorm:"primaryKey;autoIncrement" json:"id"`
	ConfigID   string `gorm:"not null;type:text;index:idx_install_logs_config_id" json:"config_id"`
	UserID     string `gorm:"not null;type:text;index:idx_install_logs_user_id" json:"user_id"`
	InstallAt  int64  `gorm:"not null;index:idx_install_logs_install_at" json:"install_at"`
	IPAddress  string `gorm:"type:text" json:"ip_address"`
	UserAgent  string `gorm:"type:text" json:"user_agent"`
	DeviceInfo string `gorm:"type:text" json:"device_info"`
}

// TableName 指定表名
func (InstallLog) TableName() string {
	return "install_logs"
}
