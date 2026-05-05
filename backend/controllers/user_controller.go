package controllers

import (
	"houseRepair/config"
	"houseRepair/models"
	"houseRepair/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

type UpdatePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required"`
}

type UpdateProfileRequest struct {
	Name  string `json:"name"`
	Phone string `json:"phone"`
	Email string `json:"email"`
}

func UpdatePassword(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req UpdatePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "请求参数错误")
		return
	}

	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		utils.NotFound(c, "用户不存在")
		return
	}

	if !user.CheckPassword(req.OldPassword) {
		utils.BadRequest(c, "原密码错误")
		return
	}

	if err := user.SetPassword(req.NewPassword); err != nil {
		utils.InternalError(c, "密码加密失败")
		return
	}

	if err := config.DB.Save(&user).Error; err != nil {
		utils.InternalError(c, "更新密码失败")
		return
	}

	utils.SuccessWithMessage(c, "密码修改成功", nil)
}

func UpdateProfile(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "请求参数错误")
		return
	}

	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		utils.NotFound(c, "用户不存在")
		return
	}

	if req.Name != "" {
		user.Name = req.Name
	}
	if req.Phone != "" {
		user.Phone = req.Phone
	}
	if req.Email != "" {
		user.Email = req.Email
	}

	if err := config.DB.Save(&user).Error; err != nil {
		utils.InternalError(c, "更新个人信息失败")
		return
	}

	utils.SuccessWithMessage(c, "个人信息修改成功", user)
}

func GetUsers(c *gin.Context) {
	role := c.Query("role")
	keyword := c.Query("keyword")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	var users []models.User
	var total int64

	query := config.DB.Model(&models.User{})

	if role != "" {
		query = query.Where("role = ?", role)
	}

	if keyword != "" {
		query = query.Where("username LIKE ? OR name LIKE ? OR phone LIKE ?", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&users)

	utils.Success(c, gin.H{
		"list":      users,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func GetUserByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequest(c, "无效的用户ID")
		return
	}

	var user models.User
	if err := config.DB.First(&user, id).Error; err != nil {
		utils.NotFound(c, "用户不存在")
		return
	}

	utils.Success(c, user)
}

func CreateUser(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "请求参数错误")
		return
	}

	var existingUser models.User
	if config.DB.Where("username = ?", req.Username).First(&existingUser).Error == nil {
		utils.BadRequest(c, "用户名已存在")
		return
	}

	user := models.User{
		Username: req.Username,
		Name:     req.Name,
		Phone:    req.Phone,
		Email:    req.Email,
	}

	if req.Role == "admin" {
		user.Role = models.RoleAdmin
	} else if req.Role == "repairer" {
		user.Role = models.RoleRepairer
	} else {
		user.Role = models.RoleUser
	}

	if err := user.SetPassword(req.Password); err != nil {
		utils.InternalError(c, "密码加密失败")
		return
	}

	if err := config.DB.Create(&user).Error; err != nil {
		utils.InternalError(c, "创建用户失败")
		return
	}

	utils.SuccessWithMessage(c, "创建成功", user)
}

func UpdateUser(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequest(c, "无效的用户ID")
		return
	}

	var user models.User
	if err := config.DB.First(&user, id).Error; err != nil {
		utils.NotFound(c, "用户不存在")
		return
	}

	var req struct {
		Name   string `json:"name"`
		Phone  string `json:"phone"`
		Email  string `json:"email"`
		Role   string `json:"role"`
		Status *int   `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "请求参数错误")
		return
	}

	if req.Name != "" {
		user.Name = req.Name
	}
	if req.Phone != "" {
		user.Phone = req.Phone
	}
	if req.Email != "" {
		user.Email = req.Email
	}
	if req.Role != "" {
		if req.Role == "admin" {
			user.Role = models.RoleAdmin
		} else if req.Role == "repairer" {
			user.Role = models.RoleRepairer
		} else {
			user.Role = models.RoleUser
		}
	}
	if req.Status != nil {
		user.Status = *req.Status
	}

	if err := config.DB.Save(&user).Error; err != nil {
		utils.InternalError(c, "更新用户失败")
		return
	}

	utils.SuccessWithMessage(c, "更新成功", user)
}

func DeleteUser(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequest(c, "无效的用户ID")
		return
	}

	var user models.User
	if err := config.DB.First(&user, id).Error; err != nil {
		utils.NotFound(c, "用户不存在")
		return
	}

	if err := config.DB.Delete(&user).Error; err != nil {
		utils.InternalError(c, "删除用户失败")
		return
	}

	utils.SuccessWithMessage(c, "删除成功", nil)
}
