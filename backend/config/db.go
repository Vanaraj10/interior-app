package config

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"sync"

	_ "github.com/denisenkom/go-mssqldb"
)

var (
	db   *sql.DB
	once sync.Once
)

func ConnectAzureSQL() *sql.DB {
	server := "zyntriqtechnologies.database.windows.net"
	port := 1433
	user := "vj2303"
	password := os.Getenv("DB_PASS") // Replace with your actual password or use env var
	database := "interior"

	connString := fmt.Sprintf("server=%s;user id=%s;password=%s;port=%d;database=%s;encrypt=true;TrustServerCertificate=false;", server, user, password, port, database)

	var err error
	db, err = sql.Open("sqlserver", connString)
	if err != nil {
		log.Fatalf("Azure SQL connection error: %v", err)
	}
	if err = db.Ping(); err != nil {
		log.Fatalf("Azure SQL ping error: %v", err)
	}
	log.Println("Connected to Azure SQL!")
	return db
}

func GetDB() *sql.DB {
	once.Do(func() {
		var err error
		connString := "server=zyntriqtechnologies.database.windows.net;port=1433;user id=vj2303;password=Letmelive@123;database=interior;encrypt=true"
		db, err = sql.Open("sqlserver", connString)
		if err != nil {
			log.Fatalf("Failed to open Azure SQL connection: %v", err)
		}
		if err = db.Ping(); err != nil {
			log.Fatalf("Failed to connect to Azure SQL: %v", err)
		}
	})
	return db
}
