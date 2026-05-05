package models

import (
	"time"
	"gorm.io/gorm"
)

type RepairComplete struct {
	gorm.Model
	ApplicationID    uint             `json:"application_id"`
	Application      RepairApplication `gorm:"foreignKey:ApplicationID" json:"application,omitempty"`
	RepairerID       uint             `json:"repairer_id"`
	Repairer         User             `gorm:"foreignKey:RepairerID" json:"repairer,omitempty"`
	RepairContent    string           `json:"repair_content"`
	RepairCost       float64          `json:"repair_cost"`
	MaterialsUsed    string           `json:"materials_used"`
	WorkHours        float64          `json:"work_hours"`
	CompleteTime     time.Time        `json:"complete_time"`
	QualityCheck     string           `json:"quality_check"`
	UserSatisfaction *int             `json:"user_satisfaction"`
	UserFeedback     string           `json:"user_feedback"`
}
