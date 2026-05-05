package models

import (
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type Role string

const (
	RoleAdmin    Role = "admin"
	RoleUser     Role = "user"
	RoleRepairer Role = "repairer"
)

type User struct {
	gorm.Model
	Username string `gorm:"uniqueIndex;not null" json:"username"`
	Password string `gorm:"not null" json:"-"`
	Name     string `json:"name"`
	Phone    string `json:"phone"`
	Email    string `json:"email"`
	Role     Role   `gorm:"default:user" json:"role"`
	Status   int    `gorm:"default:1" json:"status"`
}

func (u *User) SetPassword(password string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.Password = string(hashedPassword)
	return nil
}

func (u *User) CheckPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
	return err == nil
}
