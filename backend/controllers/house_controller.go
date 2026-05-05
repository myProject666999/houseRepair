package controllers

import (
	"houseRepair/config"
	"houseRepair/models"
	"houseRepair/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetHouses(c *gin.Context) {
	keyword := c.Query("keyword")
	building := c.Query("building")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	userID := c.GetUint("user_id")
	userRole := c.GetString("role")

	var houses []models.House
	var total int64

	query := config.DB.Model(&models.House{})

	if userRole == "user" {
		query = query.Where("owner_id = ?", userID)
	}

	if keyword != "" {
		query = query.Where("house_number LIKE ? OR building LIKE ? OR owner_name LIKE ?", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}

	if building != "" {
		query = query.Where("building = ?", building)
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	query.Offset(offset).Limit(pageSize).Order("created_at DESC").Preload("Owner").Find(&houses)

	utils.Success(c, gin.H{
		"list":      houses,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func GetHouseByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequest(c, "无效的房屋ID")
		return
	}

	var house models.House
	if err := config.DB.Preload("Owner").First(&house, id).Error; err != nil {
		utils.NotFound(c, "房屋不存在")
		return
	}

	utils.Success(c, house)
}

func CreateHouse(c *gin.Context) {
	var house models.House
	if err := c.ShouldBindJSON(&house); err != nil {
		utils.BadRequest(c, "请求参数错误")
		return
	}

	var existingHouse models.House
	if config.DB.Where("house_number = ?", house.HouseNumber).First(&existingHouse).Error == nil {
		utils.BadRequest(c, "房号已存在")
		return
	}

	if house.OwnerID != nil {
		var user models.User
		if config.DB.First(&user, house.OwnerID).Error == nil {
			house.OwnerName = user.Name
			house.OwnerPhone = user.Phone
		}
	}

	if err := config.DB.Create(&house).Error; err != nil {
		utils.InternalError(c, "创建房屋失败")
		return
	}

	utils.SuccessWithMessage(c, "创建成功", house)
}

func UpdateHouse(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequest(c, "无效的房屋ID")
		return
	}

	var house models.House
	if err := config.DB.First(&house, id).Error; err != nil {
		utils.NotFound(c, "房屋不存在")
		return
	}

	var updateData models.House
	if err := c.ShouldBindJSON(&updateData); err != nil {
		utils.BadRequest(c, "请求参数错误")
		return
	}

	if updateData.Building != "" {
		house.Building = updateData.Building
	}
	if updateData.Unit != "" {
		house.Unit = updateData.Unit
	}
	if updateData.Floor != "" {
		house.Floor = updateData.Floor
	}
	if updateData.RoomNumber != "" {
		house.RoomNumber = updateData.RoomNumber
	}
	if updateData.Area != "" {
		house.Area = updateData.Area
	}
	if updateData.HouseType != "" {
		house.HouseType = updateData.HouseType
	}
	if updateData.OwnerName != "" {
		house.OwnerName = updateData.OwnerName
	}
	if updateData.OwnerPhone != "" {
		house.OwnerPhone = updateData.OwnerPhone
	}
	if updateData.OwnerID != nil {
		house.OwnerID = updateData.OwnerID
		var user models.User
		if config.DB.First(&user, updateData.OwnerID).Error == nil {
			house.OwnerName = user.Name
			house.OwnerPhone = user.Phone
		}
	}

	if err := config.DB.Save(&house).Error; err != nil {
		utils.InternalError(c, "更新房屋失败")
		return
	}

	utils.SuccessWithMessage(c, "更新成功", house)
}

func DeleteHouse(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequest(c, "无效的房屋ID")
		return
	}

	var house models.House
	if err := config.DB.First(&house, id).Error; err != nil {
		utils.NotFound(c, "房屋不存在")
		return
	}

	if err := config.DB.Delete(&house).Error; err != nil {
		utils.InternalError(c, "删除房屋失败")
		return
	}

	utils.SuccessWithMessage(c, "删除成功", nil)
}
