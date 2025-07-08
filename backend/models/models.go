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
