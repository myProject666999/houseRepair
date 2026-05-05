package main

import (
	"fmt"
	"houseRepair/config"
	"houseRepair/models"
	"houseRepair/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	gin.SetMode(gin.ReleaseMode)

	if err := config.InitDB(); err != nil {
		panic(fmt.Sprintf("数据库初始化失败: %v", err))
	}

	config.DB.AutoMigrate(
		&models.User{},
		&models.House{},
		&models.RepairApplication{},
		&models.RepairComplete{},
		&models.Maintenance{},
	)

	createDefaultAdmin()

	r := routes.SetupRouter()

	fmt.Println("服务器启动于 http://localhost:8080")
	r.Run(":8080")
}

func createDefaultAdmin() {
	var count int64
	config.DB.Model(&models.User{}).Where("role = ?", models.RoleAdmin).Count(&count)

	if count == 0 {
		admin := models.User{
			Username: "admin",
			Name:     "管理员",
			Role:     models.RoleAdmin,
			Status:   1,
		}
		admin.SetPassword("admin123")
		config.DB.Create(&admin)
		fmt.Println("默认管理员账号已创建: admin / admin123")
	}
}
