-- ============================================
-- iOS WebClip Manager - SQLite Database Schema
-- ============================================

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,                    -- 用户唯一标识 (对应 Firebase UID)
    created_at INTEGER NOT NULL,            -- 创建时间戳 (毫秒)
    updated_at INTEGER NOT NULL,            -- 更新时间戳 (毫秒)
    is_anonymous INTEGER DEFAULT 1,         -- 是否匿名用户 (1=是, 0=否)
    email TEXT,                             -- 用户邮箱 (可选)
    display_name TEXT,                      -- 显示名称 (可选)
    last_login_at INTEGER,                  -- 最后登录时间戳 (毫秒)
    status INTEGER DEFAULT 1                -- 用户状态 (1=正常, 0=禁用)
);

-- 用户表索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- 配置表 (WebClip 配置)
CREATE TABLE IF NOT EXISTS configs (
    id TEXT PRIMARY KEY,                    -- 配置唯一标识 (格式: conf_timestamp)
    user_id TEXT NOT NULL,                  -- 所属用户 ID
    name TEXT NOT NULL,                     -- 应用名称
    description TEXT,                       -- 应用描述
    url TEXT NOT NULL,                      -- 目标 URL
    icon_base64 TEXT,                       -- 图标 Base64 编码
    status INTEGER DEFAULT 1,               -- 配置状态 (1=启用, 0=禁用)
    created_at INTEGER NOT NULL,            -- 创建时间戳 (毫秒)
    updated_at INTEGER NOT NULL,            -- 更新时间戳 (毫秒)
    install_count INTEGER DEFAULT 0,        -- 安装次数统计
    last_install_at INTEGER,                -- 最后安装时间戳 (毫秒)
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 配置表索引
CREATE INDEX IF NOT EXISTS idx_configs_user_id ON configs(user_id);
CREATE INDEX IF NOT EXISTS idx_configs_status ON configs(status);
CREATE INDEX IF NOT EXISTS idx_configs_updated_at ON configs(updated_at);
CREATE INDEX IF NOT EXISTS idx_configs_user_status ON configs(user_id, status);

-- 安装日志表 (可选，用于追踪配置的安装记录)
CREATE TABLE IF NOT EXISTS install_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,   -- 自增主键
    config_id TEXT NOT NULL,                -- 配置 ID
    user_id TEXT NOT NULL,                  -- 用户 ID
    install_at INTEGER NOT NULL,            -- 安装时间戳 (毫秒)
    ip_address TEXT,                        -- 安装者 IP 地址
    user_agent TEXT,                        -- 用户代理字符串
    device_info TEXT,                       -- 设备信息 (可选)
    
    FOREIGN KEY (config_id) REFERENCES configs(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 安装日志表索引
CREATE INDEX IF NOT EXISTS idx_install_logs_config_id ON install_logs(config_id);
CREATE INDEX IF NOT EXISTS idx_install_logs_user_id ON install_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_install_logs_install_at ON install_logs(install_at);

-- ============================================
-- 示例数据插入 (可选)
-- ============================================

-- 插入示例用户
INSERT OR IGNORE INTO users (id, created_at, updated_at, is_anonymous, display_name, status) 
VALUES ('user_demo_001', strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000, 1, 'Demo User', 1);

-- 插入示例配置
INSERT OR IGNORE INTO configs (
    id, 
    user_id, 
    name, 
    description, 
    url, 
    status, 
    created_at, 
    updated_at
) VALUES (
    'conf_' || strftime('%s', 'now') || '000',
    'user_demo_001',
    '示例应用',
    '此配置由 iOS 管理后台生成',
    'https://example.com',
    1,
    strftime('%s', 'now') * 1000,
    strftime('%s', 'now') * 1000
);

-- ============================================
-- 常用查询示例
-- ============================================

-- 查询用户的所有启用配置
-- SELECT * FROM configs WHERE user_id = ? AND status = 1 ORDER BY updated_at DESC;

-- 查询配置详情及用户信息
-- SELECT c.*, u.display_name, u.email 
-- FROM configs c 
-- LEFT JOIN users u ON c.user_id = u.id 
-- WHERE c.id = ?;

-- 统计用户的配置数量
-- SELECT user_id, COUNT(*) as total, SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as enabled
-- FROM configs 
-- GROUP BY user_id;

-- 查询最近安装记录
-- SELECT il.*, c.name as config_name 
-- FROM install_logs il
-- LEFT JOIN configs c ON il.config_id = c.id
-- WHERE il.user_id = ?
-- ORDER BY il.install_at DESC
-- LIMIT 10;
