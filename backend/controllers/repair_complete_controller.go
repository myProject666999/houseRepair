package controllers

import (
	"houseRepair/config"
	"houseRepair/models"
	"houseRepair/utils"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func GetRepairCompletes(c *gin.Context) {
	applicationID := c.Query("application_id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	userID := c.GetUint("user_id")
	userRole := c.GetString("role")

	var completes []models.RepairComplete
	var total int64

	query := config.DB.Model(&models.RepairComplete{})

	if userRole == "repairer" {
		query = query.Where("repairer_id = ?", userID)
	}

	if applicationID != "" {
		query = query.Where("application_id = ?", applicationID)
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	query.Offset(offset).Limit(pageSize).Order("created_at DESC").
		Preload("Application").Preload("Application.User").Preload("Application.House").
		Preload("Repairer").Find(&completes)

	utils.Success(c, gin.H{
		"list":      completes,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func GetRepairCompleteByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequest(c, "无效的记录ID")
		return
	}

	var complete models.RepairComplete
	if err := config.DB.Preload("Application").Preload("Application.User").Preload("Application.House").
		Preload("Repairer").First(&complete, id).Error; err != nil {
		utils.NotFound(c, "记录不存在")
		return
	}

	utils.Success(c, complete)
}

func CreateRepairComplete(c *gin.Context) {
	var complete models.RepairComplete
	if err := c.ShouldBindJSON(&complete); err != nil {
		utils.BadRequest(c, "请求参数错误")
		return
	}

	repairerID := c.GetUint("user_id")
	complete.RepairerID = repairerID
	complete.CompleteTime = time.Now()

	var application models.RepairApplication
	if err := config.DB.First(&application, complete.ApplicationID).Error; err != nil {
		utils.BadRequest(c, "申报单不存在")
		return
	}

	if application.Status != models.StatusInProgress {
		utils.BadRequest(c, "该申报单未处于维修中状态")
		return
	}

	if err := config.DB.Create(&complete).Error; err != nil {
		utils.InternalError(c, "创建维修完成记录失败")
		return
	}

	application.Status = models.StatusCompleted
	now := time.Now()
	application.CompleteTime = &now
	config.DB.Save(&application)

	config.DB.Preload("Application").Preload("Repairer").First(&complete, complete.ID)
	utils.SuccessWithMessage(c, "提交成功", complete)
}

func UpdateRepairComplete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequest(c, "无效的记录ID")
		return
	}

	var complete models.RepairComplete
	if err := config.DB.First(&complete, id).Error; err != nil {
		utils.NotFound(c, "记录不存在")
		return
	}

	var updateData models.RepairComplete
	if err := c.ShouldBindJSON(&updateData); err != nil {
		utils.BadRequest(c, "请求参数错误")
		return
	}

	if updateData.RepairContent != "" {
		complete.RepairContent = updateData.RepairContent
	}
	if updateData.RepairCost != 0 {
		complete.RepairCost = updateData.RepairCost
	}
	if updateData.MaterialsUsed != "" {
		complete.MaterialsUsed = updateData.MaterialsUsed
	}
	if updateData.WorkHours != 0 {
		complete.WorkHours = updateData.WorkHours
	}
	if updateData.QualityCheck != "" {
		complete.QualityCheck = updateData.QualityCheck
	}

	if err := config.DB.Save(&complete).Error; err != nil {
		utils.InternalError(c, "更新记录失败")
		return
	}

	utils.SuccessWithMessage(c, "更新成功", complete)
}

func SubmitFeedback(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequest(c, "无效的记录ID")
		return
	}

	var complete models.RepairComplete
	if err := config.DB.First(&complete, id).Error; err != nil {
		utils.NotFound(c, "记录不存在")
		return
	}

	var req struct {
		Satisfaction int    `json:"satisfaction"`
		Feedback     string `json:"feedback"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "请求参数错误")
		return
	}

	userID := c.GetUint("user_id")
	var application models.RepairApplication
	if err := config.DB.First(&application, complete.ApplicationID).Error; err != nil {
		utils.NotFound(c, "申报单不存在")
		return
	}

	if application.UserID != userID {
		utils.Forbidden(c, "您没有权限对此维修进行评价")
		return
	}

	complete.UserSatisfaction = &req.Satisfaction
	complete.UserFeedback = req.Feedback

	if err := config.DB.Save(&complete).Error; err != nil {
		utils.InternalError(c, "提交反馈失败")
		return
	}

	utils.SuccessWithMessage(c, "评价成功", complete)
}
