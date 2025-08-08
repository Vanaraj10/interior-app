package models

import (
	"time"
)

type Admin struct {
	ID           int       `db:"id" json:"id"`
	Username     string    `db:"username" json:"username"`
	PasswordHash string    `db:"password_hash" json:"-"`
	CreatedAt    time.Time `db:"created_at" json:"createdAt"`
}

type Worker struct {
	ID           int       `db:"id" json:"id"`
	Username     string    `db:"username" json:"username"`
	PasswordHash string    `db:"password_hash" json:"-"`
	AdminID      int       `db:"admin_id" json:"adminId"`
	Name         string    `db:"name" json:"name"`
	Phone        string    `db:"phone" json:"phone"`
	CreatedAt    time.Time `db:"created_at" json:"createdAt"`
}

type Project struct {
	ID          int       `db:"id" json:"id"`
	ClientName  string    `db:"client_name" json:"clientName"`
	Phone       string    `db:"phone" json:"phone"`
	Address     string    `db:"address" json:"address"`
	HTML        string    `db:"html" json:"html"`
	RawData     string    `db:"raw_data" json:"rawData"`
	WorkerID    int       `db:"worker_id" json:"workerId"`
	AdminID     int       `db:"admin_id" json:"adminId"`
	IsCompleted bool      `db:"is_completed" json:"isCompleted"`
	CreatedAt   time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt   time.Time `db:"updated_at" json:"updatedAt"`
}

// Brand represents a cloth brand that can be managed by an admin
type Brand struct {
	ID          int       `db:"id" json:"id"`
	Name        string    `db:"name" json:"name"`
	Description string    `db:"description" json:"description"`
	LogoURL     string    `db:"logo_url" json:"logoUrl"`
	AdminID     int       `db:"admin_id" json:"adminId"`
	IsActive    bool      `db:"is_active" json:"isActive"`
	CreatedAt   time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt   time.Time `db:"updated_at" json:"updatedAt"`
}

// Folder represents a folder within a brand that contains cloths
type Folder struct {
	ID          int       `db:"id" json:"id"`
	Name        string    `db:"name" json:"name"`
	Description string    `db:"description" json:"description"`
	BrandID     int       `db:"brand_id" json:"brandId"`
	AdminID     int       `db:"admin_id" json:"adminId"`
	IsActive    bool      `db:"is_active" json:"isActive"`
	CreatedAt   time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt   time.Time `db:"updated_at" json:"updatedAt"`
}

// Cloth represents a cloth item that belongs to a folder
type Cloth struct {
	ID          int       `db:"id" json:"id"`
	Name        string    `db:"name" json:"name"`
	Rate        float64   `db:"rate" json:"rate"`
	Description string    `db:"description" json:"description"`
	ImageURL    string    `db:"image_url" json:"imageUrl"`
	FolderID    int       `db:"folder_id" json:"folderId"`
	BrandID     int       `db:"brand_id" json:"brandId"`
	AdminID     int       `db:"admin_id" json:"adminId"`
	IsActive    bool      `db:"is_active" json:"isActive"`
	CreatedAt   time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt   time.Time `db:"updated_at" json:"updatedAt"`
}
