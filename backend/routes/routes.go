package routes

import (
	"houseRepair/controllers"
	"houseRepair/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	api := r.Group("/api")
	{
		api.POST("/login", controllers.Login)
		api.POST("/register", controllers.Register)

		auth := api.Group("")
		auth.Use(middleware.AuthMiddleware())
		{
			auth.GET("/user/info", controllers.GetCurrentUser)
			auth.POST("/user/password", controllers.UpdatePassword)
			auth.PUT("/user/profile", controllers.UpdateProfile)

			auth.GET("/dashboard/stats", controllers.GetDashboardStats)

			admin := auth.Group("")
			admin.Use(middleware.RoleMiddleware("admin"))
			{
				admin.GET("/users", controllers.GetUsers)
				admin.GET("/users/:id", controllers.GetUserByID)
				admin.POST("/users", controllers.CreateUser)
				admin.PUT("/users/:id", controllers.UpdateUser)
				admin.DELETE("/users/:id", controllers.DeleteUser)

				admin.GET("/houses", controllers.GetHouses)
				admin.GET("/houses/:id", controllers.GetHouseByID)
				admin.POST("/houses", controllers.CreateHouse)
				admin.PUT("/houses/:id", controllers.UpdateHouse)
				admin.DELETE("/houses/:id", controllers.DeleteHouse)

				admin.GET("/applications", controllers.GetRepairApplications)
				admin.GET("/applications/:id", controllers.GetRepairApplicationByID)
				admin.POST("/applications/:id/assign", controllers.AssignRepairer)
				admin.DELETE("/applications/:id", controllers.DeleteRepairApplication)

				admin.GET("/maintenances", controllers.GetMaintenances)
				admin.GET("/maintenances/:id", controllers.GetMaintenanceByID)
				admin.POST("/maintenances", controllers.CreateMaintenance)
				admin.PUT("/maintenances/:id", controllers.UpdateMaintenance)
				admin.DELETE("/maintenances/:id", controllers.DeleteMaintenance)
			}

			user := auth.Group("")
			user.Use(middleware.RoleMiddleware("admin", "user"))
			{
				user.GET("/user/houses", controllers.GetHouses)
				user.GET("/user/applications", controllers.GetRepairApplications)
				user.GET("/user/applications/:id", controllers.GetRepairApplicationByID)
				user.POST("/user/applications", controllers.CreateRepairApplication)
				user.PUT("/user/applications/:id", controllers.UpdateRepairApplication)
			}

			repairer := auth.Group("")
			repairer.Use(middleware.RoleMiddleware("admin", "repairer"))
			{
				repairer.GET("/repairer/applications", controllers.GetRepairApplications)
				repairer.GET("/repairer/applications/:id", controllers.GetRepairApplicationByID)
				repairer.PUT("/repairer/applications/:id/status", controllers.UpdateApplicationStatus)

				repairer.GET("/repairer/completes", controllers.GetRepairCompletes)
				repairer.GET("/repairer/completes/:id", controllers.GetRepairCompleteByID)
				repairer.POST("/repairer/completes", controllers.CreateRepairComplete)
				repairer.PUT("/repairer/completes/:id", controllers.UpdateRepairComplete)
			}

			auth.POST("/completes/:id/feedback", controllers.SubmitFeedback)
		}
	}

	return r
}
