package models

import (
	"time"
	"gorm.io/gorm"
)

type RepairStatus string

const (
	StatusPending    RepairStatus = "pending"
	StatusAssigned   RepairStatus = "assigned"
	StatusInProgress RepairStatus = "in_progress"
	StatusCompleted  RepairStatus = "completed"
	StatusClosed     RepairStatus = "closed"
)

type RepairApplication struct {
	gorm.Model
	ApplicationNumber string        `gorm:"uniqueIndex;not null" json:"application_number"`
	UserID            uint          `json:"user_id"`
	User              User          `gorm:"foreignKey:UserID" json:"user,omitempty"`
	HouseID           uint          `json:"house_id"`
	House             House         `gorm:"foreignKey:HouseID" json:"house,omitempty"`
	RepairType        string        `json:"repair_type"`
	Description       string        `json:"description"`
	ContactName       string        `json:"contact_name"`
	ContactPhone      string        `json:"contact_phone"`
	RepairerID        *uint         `json:"repairer_id"`
	Repairer          *User         `gorm:"foreignKey:RepairerID" json:"repairer,omitempty"`
	Status            RepairStatus  `gorm:"default:pending" json:"status"`
	ApplyTime         time.Time     `json:"apply_time"`
	ArrivalTime       *time.Time    `json:"arrival_time"`
	CompleteTime      *time.Time    `json:"complete_time"`
}
