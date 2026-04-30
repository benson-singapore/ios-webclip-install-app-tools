package models

import "time"

// getCurrentTimestamp 获取当前时间戳（毫秒）
func getCurrentTimestamp() int64 {
	return time.Now().UnixMilli()
}
