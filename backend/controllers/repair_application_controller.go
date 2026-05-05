package controllers

import (
	"fmt"
	"houseRepair/config"
	"houseRepair/models"
	"houseRepair/utils"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func GetRepairApplications(c *gin.Context) {
	status := c.Query("status")
	keyword := c.Query("keyword")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	userID := c.GetUint("user_id")
	userRole := c.GetString("role")

	var applications []models.RepairApplication
	var total int64

	query := config.DB.Model(&models.RepairApplication{})

	if userRole == "user" {
		query = query.Where("user_id = ?", userID)
	}

	if userRole == "repairer" {
		query = query.Where("repairer_id = ?", userID)
	}

	if status != "" {
		query = query.Where("status = ?", status)
	}

	if keyword != "" {
		query = query.Joins("LEFT JOIN users ON users.id = repair_applications.user_id").
			Joins("LEFT JOIN houses ON houses.id = repair_applications.house_id").
			Where("repair_applications.application_number LIKE ? OR users.name LIKE ? OR houses.house_number LIKE ?", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	query.Offset(offset).Limit(pageSize).Order("created_at DESC").
		Preload("User").Preload("House").Preload("Repairer").Find(&applications)

	utils.Success(c, gin.H{
		"list":      applications,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func GetRepairApplicationByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequest(c, "无效的申报单ID")
		return
	}

	var application models.RepairApplication
	if err := config.DB.Preload("User").Preload("House").Preload("Repairer").First(&application, id).Error; err != nil {
		utils.NotFound(c, "申报单不存在")
		return
	}

	utils.Success(c, application)
}

func CreateRepairApplication(c *gin.Context) {
	var application models.RepairApplication
	if err := c.ShouldBindJSON(&application); err != nil {
		utils.BadRequest(c, "请求参数错误")
		return
	}

	userID := c.GetUint("user_id")
	application.UserID = userID
	application.ApplyTime = time.Now()
	application.Status = models.StatusPending
	application.ApplicationNumber = generateApplicationNumber()

	var user models.User
	if config.DB.First(&user, userID).Error == nil {
		application.ContactName = user.Name
		application.ContactPhone = user.Phone
	}

	if err := config.DB.Create(&application).Error; err != nil {
		utils.InternalError(c, "创建申报单失败")
		return
	}

	config.DB.Preload("User").Preload("House").First(&application, application.ID)
	utils.SuccessWithMessage(c, "申报成功", application)
}

func UpdateRepairApplication(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequest(c, "无效的申报单ID")
		return
	}

	var application models.RepairApplication
	if err := config.DB.First(&application, id).Error; err != nil {
		utils.NotFound(c, "申报单不存在")
		return
	}

	var updateData models.RepairApplication
	if err := c.ShouldBindJSON(&updateData); err != nil {
		utils.BadRequest(c, "请求参数错误")
		return
	}

	if updateData.RepairType != "" {
		application.RepairType = updateData.RepairType
	}
	if updateData.Description != "" {
		application.Description = updateData.Description
	}
	if updateData.ContactName != "" {
		application.ContactName = updateData.ContactName
	}
	if updateData.ContactPhone != "" {
		application.ContactPhone = updateData.ContactPhone
	}

	if err := config.DB.Save(&application).Error; err != nil {
		utils.InternalError(c, "更新申报单失败")
		return
	}

	utils.SuccessWithMessage(c, "更新成功", application)
}

func AssignRepairer(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequest(c, "无效的申报单ID")
		return
	}

	var application models.RepairApplication
	if err := config.DB.First(&application, id).Error; err != nil {
		utils.NotFound(c, "申报单不存在")
		return
	}

	var req struct {
		RepairerID uint `json:"repairer_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "请求参数错误")
		return
	}

	var repairer models.User
	if err := config.DB.Where("id = ? AND role = ?", req.RepairerID, models.RoleRepairer).First(&repairer).Error; err != nil {
		utils.BadRequest(c, "维修单位不存在")
		return
	}

	application.RepairerID = &req.RepairerID
	application.Status = models.StatusAssigned

	if err := config.DB.Save(&application).Error; err != nil {
		utils.InternalError(c, "派单失败")
		return
	}

	utils.SuccessWithMessage(c, "派单成功", application)
}

func UpdateApplicationStatus(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequest(c, "无效的申报单ID")
		return
	}

	var application models.RepairApplication
	if err := config.DB.First(&application, id).Error; err != nil {
		utils.NotFound(c, "申报单不存在")
		return
	}

	var req struct {
		Status string `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "请求参数错误")
		return
	}

	application.Status = models.RepairStatus(req.Status)
	if req.Status == string(models.StatusInProgress) {
		now := time.Now()
		application.ArrivalTime = &now
	}

	if err := config.DB.Save(&application).Error; err != nil {
		utils.InternalError(c, "更新状态失败")
		return
	}

	utils.SuccessWithMessage(c, "状态更新成功", application)
}

func DeleteRepairApplication(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequest(c, "无效的申报单ID")
		return
	}

	var application models.RepairApplication
	if err := config.DB.First(&application, id).Error; err != nil {
		utils.NotFound(c, "申报单不存在")
		return
	}

	if err := config.DB.Delete(&application).Error; err != nil {
		utils.InternalError(c, "删除申报单失败")
		return
	}

	utils.SuccessWithMessage(c, "删除成功", nil)
}

func generateApplicationNumber() string {
	now := time.Now()
	return fmt.Sprintf("WX%s%06d", now.Format("20060102"), int(now.UnixMilli())%1000000)
}
