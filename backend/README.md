# Interior App Backend

This is the backend API for the Interior App, built with Go (Gin) and MongoDB. It supports admin and worker authentication, worker management, project (order) submission, and admin password management.

## Features
- Admin and Worker authentication (JWT)
- Admin can create, delete, and list workers
- Workers can submit project orders (HTML + client info)
- Admin can view all projects/orders under their workers
- Admin can change their password

---

## Setup

1. **Clone the repository**
2. **Install Go dependencies**
   ```sh
   go mod tidy
   ```
3. **Set environment variables** (or edit `config/db.go` for MongoDB URI)
   - `MONGODB_URI` (optional, defaults to local)
   - `JWT_SECRET` (optional, defaults to hardcoded string)
4. **Run the server**
   ```sh
   go run main.go
   ```
   The server runs on `http://localhost:8080`

---

## API Endpoints

### Authentication

#### Admin Login
- **POST** `/api/admin/login`
- **Request:**
  ```json
  { "username": "admin1", "password": "yourpassword" }
  ```
- **Response:**
  ```json
  { "token": "<JWT_TOKEN>" }
  ```

#### Worker Login
- **POST** `/api/worker/login`
- **Request:**
  ```json
  { "username": "worker1", "password": "yourpassword" }
  ```
- **Response:**
  ```json
  { "token": "<JWT_TOKEN>" }
  ```

---

### Worker Management (Admin only, requires Bearer token)

#### Create Worker
- **POST** `/api/workers`
- **Headers:** `Authorization: Bearer <ADMIN_JWT>`
- **Request:**
  ```json
  { "username": "worker1", "password": "pass123", "name": "Worker Name" }
  ```
- **Response:**
  ```json
  { "message": "Worker created" }
  ```

#### Delete Worker
- **DELETE** `/api/workers/:id`
- **Headers:** `Authorization: Bearer <ADMIN_JWT>`
- **Response:**
  ```json
  { "message": "Worker deleted" }
  ```

#### List Workers
- **GET** `/api/workers`
- **Headers:** `Authorization: Bearer <ADMIN_JWT>`
- **Response:**
  ```json
  [
    { "id": "...", "username": "worker1", "name": "Worker Name", ... }
  ]
  ```

---

### Project (Order) Management

#### Worker Submits Project
- **POST** `/api/projects`
- **Headers:** `Authorization: Bearer <WORKER_JWT>`
- **Request:**
  ```json
  {
    "clientName": "Client Name",
    "phone": "1234567890",
    "address": "Client Address",
    "html": "<html>...</html>",
    "rawData": { /* optional, original measurement data */ }
  }
  ```
- **Response:**
  ```json
  { "message": "Project saved" }
  ```

#### Admin Lists All Projects
- **GET** `/api/projects`
- **Headers:** `Authorization: Bearer <ADMIN_JWT>`
- **Response:**
  ```json
  [
    { "id": "...", "clientName": "...", "html": "...", ... }
  ]
  ```

#### Admin Gets Project Details
- **GET** `/api/projects/:id`
- **Headers:** `Authorization: Bearer <ADMIN_JWT>`
- **Response:**
  ```json
  { "id": "...", "clientName": "...", "html": "...", ... }
  ```

---

### Admin Password Change
- **PUT** `/api/admin/password`
- **Headers:** `Authorization: Bearer <ADMIN_JWT>`
- **Request:**
  ```json
  { "old_password": "oldpass", "new_password": "newpass" }
  ```
- **Response:**
  ```json
  { "message": "Password updated" }
  ```

---

## Error Responses
All error responses are JSON, e.g.:
```json
{ "error": "Error message here" }
```

---

## Notes
- Only you (the owner) can create new admins (directly in DB or via a protected script).
- All passwords are securely hashed (bcrypt).
- Use the JWT token from login in the `Authorization` header for all protected endpoints.
- The HTML for projects is generated on the frontend and stored as-is in MongoDB.

---
