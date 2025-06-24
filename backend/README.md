# Interior Project Management Backend

This is the backend API for the Interior Project Management System, built with Go, Gin, and MongoDB. It provides authentication and project management endpoints for both admin and worker roles.

## Features
- JWT-based authentication for admin and workers
- Project CRUD operations
- Toggle project completion status (`isCompleted`) for both admin and worker
- Role-based access control
- MongoDB Atlas integration
- CORS enabled for frontend/mobile clients
- Ready for deployment on Railway (or any cloud platform)

## API Documentation

### Authentication

#### Admin Login
- **POST** `/api/admin/login`
- **Request Body:**
  ```json
  { "username": "admin1", "password": "yourpassword" }
  ```
- **Response:**
  ```json
  { "token": "<JWT_TOKEN>" }
  ```

#### Worker Login
- **POST** `/api/worker/login`
- **Request Body:**
  ```json
  { "username": "worker1", "password": "yourpassword" }
  ```
- **Response:**
  ```json
  { "token": "<JWT_TOKEN>" }
  ```

---

### Admin Endpoints (require Bearer token)

#### Create Worker
- **POST** `/api/admin/workers`
- **Headers:** `Authorization: Bearer <ADMIN_JWT>`
- **Request Body:**
  ```json
  { "username": "worker1", "password": "pass123", "name": "Worker Name" }
  ```
- **Response:**
  ```json
  { "message": "Worker created" }
  ```

#### Delete Worker
- **DELETE** `/api/admin/workers/:id`
- **Headers:** `Authorization: Bearer <ADMIN_JWT>`
- **Response:**
  ```json
  { "message": "Worker deleted" }
  ```

#### List Workers
- **GET** `/api/admin/workers`
- **Headers:** `Authorization: Bearer <ADMIN_JWT>`
- **Response:**
  ```json
  [
    { "id": "...", "username": "worker1", "name": "Worker Name", ... }
  ]
  ```

#### List Projects
- **GET** `/api/admin/projects`
- **Headers:** `Authorization: Bearer <ADMIN_JWT>`
- **Response:**
  ```json
  [
    { "id": "...", "clientName": "...", "isCompleted": false, ... }
  ]
  ```

#### Get Project by ID
- **GET** `/api/admin/projects/:id`
- **Headers:** `Authorization: Bearer <ADMIN_JWT>`
- **Response:**
  ```json
  { "id": "...", "clientName": "...", "isCompleted": false, ... }
  ```

#### Toggle Project Completion
- **PUT** `/api/admin/projects/:id/completed`
- **Headers:** `Authorization: Bearer <ADMIN_JWT>`
- **Request Body:**
  ```json
  { "isCompleted": true }
  ```
- **Response:**
  ```json
  { "success": true }
  ```

#### Change Admin Password
- **PUT** `/api/admin/password`
- **Headers:** `Authorization: Bearer <ADMIN_JWT>`
- **Request Body:**
  ```json
  { "old_password": "oldpass", "new_password": "newpass" }
  ```
- **Response:**
  ```json
  { "message": "Password updated" }
  ```

---

### Worker Endpoints (require Bearer token)

#### Create Project
- **POST** `/api/worker/projects`
- **Headers:** `Authorization: Bearer <WORKER_JWT>`
- **Request Body:**
  ```json
  {
    "clientName": "Client Name",
    "phone": "1234567890",
    "address": "Client Address",
    "html": "<html>...</html>",
    "rawData": { /* optional, original measurement data */ },
    "projectId": "optional-custom-id"
  }
  ```
- **Response:**
  ```json
  { "message": "Project saved" }
  ```

#### Toggle Project Completion
- **PUT** `/api/worker/projects/:id/completed`
- **Headers:** `Authorization: Bearer <WORKER_JWT>`
- **Request Body:**
  ```json
  { "isCompleted": true }
  ```
- **Response:**
  ```json
  { "success": true }
  ```

---

### Health Check
- **GET** `/api/health`
- **Response:**
  ```json
  { "status": "ok" }
  ```

---

## Error Responses
All error responses are JSON, e.g.:
```json
{ "error": "Error message here" }
```

---
