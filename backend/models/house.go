package models

import "gorm.io/gorm"

type House struct {
	gorm.Model
	HouseNumber  string `gorm:"uniqueIndex;not null" json:"house_number"`
	Building     string `json:"building"`
	Unit         string `json:"unit"`
	Floor        string `json:"floor"`
	RoomNumber   string `json:"room_number"`
	Area         string `json:"area"`
	HouseType    string `json:"house_type"`
	OwnerName    string `json:"owner_name"`
	OwnerPhone   string `json:"owner_phone"`
	OwnerID      *uint  `json:"owner_id"`
	Owner        *User  `gorm:"foreignKey:OwnerID" json:"owner,omitempty"`
	Status       int    `gorm:"default:1" json:"status"`
}
