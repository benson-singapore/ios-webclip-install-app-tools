package database

import (
	"fmt"
	"log"

	"ios-install-tools-go/backend/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// InitDatabase 初始化数据库连接
func InitDatabase(dbPath string) error {
	var err error

	// 打开 SQLite 数据库连接
	DB, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return fmt.Errorf("failed to connect database: %w", err)
	}

	log.Println("Database connected successfully")

	// 自动迁移数据库表结构
	err = DB.AutoMigrate(
		&models.User{},
		&models.Config{},
		&models.InstallLog{},
	)
	if err != nil {
		return fmt.Errorf("failed to migrate database: %w", err)
	}

	log.Println("Database migration completed")

	// 创建索引
	if err := createIndexes(); err != nil {
		return fmt.Errorf("failed to create indexes: %w", err)
	}

	log.Println("Database indexes created")

	return nil
}

// createIndexes 创建数据库索引
func createIndexes() error {
	// 用户表索引
	if err := DB.Exec("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)").Error; err != nil {
		return err
	}
	if err := DB.Exec("CREATE INDEX IF NOT EXISTS idx_users_status ON users(status)").Error; err != nil {
		return err
	}
	if err := DB.Exec("CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at)").Error; err != nil {
		return err
	}

	// 配置表索引
	if err := DB.Exec("CREATE INDEX IF NOT EXISTS idx_configs_user_id ON configs(user_id)").Error; err != nil {
		return err
	}
	if err := DB.Exec("CREATE INDEX IF NOT EXISTS idx_configs_status ON configs(status)").Error; err != nil {
		return err
	}
	if err := DB.Exec("CREATE INDEX IF NOT EXISTS idx_configs_updated_at ON configs(updated_at)").Error; err != nil {
		return err
	}
	if err := DB.Exec("CREATE INDEX IF NOT EXISTS idx_configs_user_status ON configs(user_id, status)").Error; err != nil {
		return err
	}

	// 安装日志表索引
	if err := DB.Exec("CREATE INDEX IF NOT EXISTS idx_install_logs_config_id ON install_logs(config_id)").Error; err != nil {
		return err
	}
	if err := DB.Exec("CREATE INDEX IF NOT EXISTS idx_install_logs_user_id ON install_logs(user_id)").Error; err != nil {
		return err
	}
	if err := DB.Exec("CREATE INDEX IF NOT EXISTS idx_install_logs_install_at ON install_logs(install_at)").Error; err != nil {
		return err
	}

	return nil
}

// GetDB 获取数据库实例
func GetDB() *gorm.DB {
	return DB
}
