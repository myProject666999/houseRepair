package controllers

import (
	"houseRepair/config"
	"houseRepair/models"
	"houseRepair/utils"

	"github.com/gin-gonic/gin"
)

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type RegisterRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	Name     string `json:"name"`
	Phone    string `json:"phone"`
	Email    string `json:"email"`
	Role     string `json:"role"`
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "请求参数错误")
		return
	}

	var user models.User
	if err := config.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
		utils.Unauthorized(c, "用户名或密码错误")
		return
	}

	if !user.CheckPassword(req.Password) {
		utils.Unauthorized(c, "用户名或密码错误")
		return
	}

	if user.Status != 1 {
		utils.Forbidden(c, "账号已被禁用")
		return
	}

	token, err := utils.GenerateToken(&user)
	if err != nil {
		utils.InternalError(c, "生成令牌失败")
		return
	}

	utils.Success(c, gin.H{
		"token": token,
		"user":  user,
	})
}

func Register(c *gin.Context) {
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

	utils.SuccessWithMessage(c, "注册成功", user)
}

func GetCurrentUser(c *gin.Context) {
	userID := c.GetUint("user_id")

	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		utils.NotFound(c, "用户不存在")
		return
	}

	utils.Success(c, user)
}
