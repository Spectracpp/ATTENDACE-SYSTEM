# AttendEase API Documentation

## 🔑 Authentication Endpoints

### User Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}

Response: {
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "user" | "admin"
  },
  "token": "string"
}
```

### Admin Login
```http
POST /api/auth/admin/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "string",
  "email": "string",
  "password": "string",
  "organizationId": "string"
}
```

### Register Admin
```http
POST /api/auth/register/admin
Content-Type: application/json

{
  "name": "string",
  "email": "string",
  "password": "string",
  "organizationName": "string"
}
```

### Logout
```http
POST /api/auth/logout
```

## 👥 User Management

### Get User Profile
```http
GET /api/users/profile
Authorization: Bearer {token}

Response: {
  "id": "string",
  "name": "string",
  "email": "string",
  "role": "string",
  "organization": {
    "id": "string",
    "name": "string"
  }
}
```

### Update User Profile
```http
PUT /api/users/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "string",
  "email": "string",
  "currentPassword": "string",
  "newPassword": "string"
}
```

## 📍 Attendance Endpoints

### Mark Attendance
```http
POST /api/attendance/mark
Authorization: Bearer {token}
Content-Type: application/json

{
  "qrCode": "string",
  "location": {
    "latitude": number,
    "longitude": number
  }
}
```

### Get Attendance History
```http
GET /api/attendance/history
Authorization: Bearer {token}
Query Parameters:
  - startDate: string (YYYY-MM-DD)
  - endDate: string (YYYY-MM-DD)
  - page: number
  - limit: number
```

### Generate QR Code (Admin)
```http
POST /api/attendance/qr-code
Authorization: Bearer {token}
Content-Type: application/json

{
  "validityMinutes": number,
  "location": {
    "latitude": number,
    "longitude": number
  },
  "allowedRadius": number
}
```

## 🏢 Organization Endpoints

### Get Organization Details
```http
GET /api/organization
Authorization: Bearer {token}
```

### Update Organization (Admin)
```http
PUT /api/organization
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "string",
  "address": "string",
  "workingHours": {
    "start": "string",
    "end": "string"
  },
  "allowedRadius": number
}
```

### Get Organization Users (Admin)
```http
GET /api/organization/users
Authorization: Bearer {token}
Query Parameters:
  - page: number
  - limit: number
  - search: string
```

## 📊 Analytics Endpoints (Admin)

### Get Attendance Analytics
```http
GET /api/analytics/attendance
Authorization: Bearer {token}
Query Parameters:
  - startDate: string (YYYY-MM-DD)
  - endDate: string (YYYY-MM-DD)
```

### Get User Analytics
```http
GET /api/analytics/users
Authorization: Bearer {token}
Query Parameters:
  - period: "daily" | "weekly" | "monthly"
```

## 🔔 Notification Endpoints

### Get Notifications
```http
GET /api/notifications
Authorization: Bearer {token}
Query Parameters:
  - page: number
  - limit: number
```

### Mark Notification as Read
```http
PUT /api/notifications/{id}/read
Authorization: Bearer {token}
```

## ⚙️ Settings Endpoints

### Get Settings
```http
GET /api/settings
Authorization: Bearer {token}
```

### Update Settings
```http
PUT /api/settings
Authorization: Bearer {token}
Content-Type: application/json

{
  "notifications": {
    "email": boolean,
    "push": boolean
  },
  "theme": "light" | "dark",
  "language": "string"
}
```

## 🔄 Response Formats

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "string"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "string",
    "message": "string",
    "details": {}
  }
}
```

## 🔒 Authentication

All protected endpoints require a valid JWT token in the Authorization header:
```http
Authorization: Bearer {token}
```

## 📝 Notes

1. All timestamps are in ISO 8601 format
2. Pagination starts from page 1
3. Default page limit is 10 items
4. All coordinates are in decimal degrees
5. QR codes are valid for the specified duration only
