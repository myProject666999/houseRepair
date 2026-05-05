package controllers

import (
	"houseRepair/config"
	"houseRepair/models"
	"houseRepair/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetMaintenances(c *gin.Context) {
	status := c.Query("status")
	houseID := c.Query("house_id")
	keyword := c.Query("keyword")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	var maintenances []models.Maintenance
	var total int64

	query := config.DB.Model(&models.Maintenance{})

	if status != "" {
		query = query.Where("status = ?", status)
	}

	if houseID != "" {
		query = query.Where("house_id = ?", houseID)
	}

	if keyword != "" {
		query = query.Joins("LEFT JOIN houses ON houses.id = maintenances.house_id").
			Where("maintenances.maintenance_type LIKE ? OR houses.house_number LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	query.Offset(offset).Limit(pageSize).Order("created_at DESC").
		Preload("House").Find(&maintenances)

	utils.Success(c, gin.H{
		"list":      maintenances,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func GetMaintenanceByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequest(c, "无效的记录ID")
		return
	}

	var maintenance models.Maintenance
	if err := config.DB.Preload("House").First(&maintenance, id).Error; err != nil {
		utils.NotFound(c, "记录不存在")
		return
	}

	utils.Success(c, maintenance)
}

func CreateMaintenance(c *gin.Context) {
	var maintenance models.Maintenance
	if err := c.ShouldBindJSON(&maintenance); err != nil {
		utils.BadRequest(c, "请求参数错误")
		return
	}

	if maintenance.Status == "" {
		maintenance.Status = "planned"
	}

	if err := config.DB.Create(&maintenance).Error; err != nil {
		utils.InternalError(c, "创建维护记录失败")
		return
	}

	config.DB.Preload("House").First(&maintenance, maintenance.ID)
	utils.SuccessWithMessage(c, "创建成功", maintenance)
}

func UpdateMaintenance(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequest(c, "无效的记录ID")
		return
	}

	var maintenance models.Maintenance
	if err := config.DB.First(&maintenance, id).Error; err != nil {
		utils.NotFound(c, "记录不存在")
		return
	}

	var updateData models.Maintenance
	if err := c.ShouldBindJSON(&updateData); err != nil {
		utils.BadRequest(c, "请求参数错误")
		return
	}

	if updateData.MaintenanceType != "" {
		maintenance.MaintenanceType = updateData.MaintenanceType
	}
	if updateData.HouseID != 0 {
		maintenance.HouseID = updateData.HouseID
	}
	if updateData.Description != "" {
		maintenance.Description = updateData.Description
	}
	if updateData.PlanDate != nil {
		maintenance.PlanDate = updateData.PlanDate
	}
	if updateData.ActualDate != nil {
		maintenance.ActualDate = updateData.ActualDate
	}
	if updateData.Cost != 0 {
		maintenance.Cost = updateData.Cost
	}
	if updateData.Status != "" {
		maintenance.Status = updateData.Status
	}
	if updateData.Remark != "" {
		maintenance.Remark = updateData.Remark
	}

	if err := config.DB.Save(&maintenance).Error; err != nil {
		utils.InternalError(c, "更新维护记录失败")
		return
	}

	utils.SuccessWithMessage(c, "更新成功", maintenance)
}

func DeleteMaintenance(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequest(c, "无效的记录ID")
		return
	}

	var maintenance models.Maintenance
	if err := config.DB.First(&maintenance, id).Error; err != nil {
		utils.NotFound(c, "记录不存在")
		return
	}

	if err := config.DB.Delete(&maintenance).Error; err != nil {
		utils.InternalError(c, "删除维护记录失败")
		return
	}

	utils.SuccessWithMessage(c, "删除成功", nil)
}

func GetDashboardStats(c *gin.Context) {
	var userCount int64
	var houseCount int64
	var pendingCount int64
	var completedCount int64

	config.DB.Model(&models.User{}).Where("role = ?", models.RoleUser).Count(&userCount)
	config.DB.Model(&models.House{}).Count(&houseCount)
	config.DB.Model(&models.RepairApplication{}).Where("status IN ?", []string{string(models.StatusPending), string(models.StatusAssigned), string(models.StatusInProgress)}).Count(&pendingCount)
	config.DB.Model(&models.RepairApplication{}).Where("status = ?", models.StatusCompleted).Count(&completedCount)

	utils.Success(c, gin.H{
		"user_count":      userCount,
		"house_count":     houseCount,
		"pending_count":   pendingCount,
		"completed_count": completedCount,
	})
}
