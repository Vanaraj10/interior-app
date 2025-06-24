package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Admin struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Username     string             `bson:"username" json:"username"`
	PasswordHash string             `bson:"passwordHash" json:"-"`
	CreatedAt    time.Time          `bson:"createdAt" json:"createdAt"`
}

type Worker struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Username     string             `bson:"username" json:"username"`
	PasswordHash string             `bson:"passwordHash" json:"-"`
	AdminID      primitive.ObjectID `bson:"adminId" json:"adminId"`
	Name         string             `bson:"name" json:"name"`
	CreatedAt    time.Time          `bson:"createdAt" json:"createdAt"`
}

type Project struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	WorkerID   primitive.ObjectID `bson:"workerId" json:"workerId"`
	AdminID    primitive.ObjectID `bson:"adminId" json:"adminId"`
	ClientName string             `bson:"clientName" json:"clientName"`
	Phone      string             `bson:"phone" json:"phone"`
	Address    string             `bson:"address" json:"address"`
	CreatedAt  time.Time          `bson:"createdAt" json:"createdAt"`
	HTML       string             `bson:"html" json:"html"`
	RawData    interface{}        `bson:"rawData,omitempty" json:"rawData,omitempty"`
}
