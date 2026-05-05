package models

import (
	"time"
	"gorm.io/gorm"
)

type Maintenance struct {
	gorm.Model
	MaintenanceType string     `json:"maintenance_type"`
	HouseID         uint       `json:"house_id"`
	House           House      `gorm:"foreignKey:HouseID" json:"house,omitempty"`
	Description     string     `json:"description"`
	PlanDate        *time.Time `json:"plan_date"`
	ActualDate      *time.Time `json:"actual_date"`
	Cost            float64    `json:"cost"`
	Status          string     `gorm:"default:planned" json:"status"`
	Remark          string     `json:"remark"`
}
