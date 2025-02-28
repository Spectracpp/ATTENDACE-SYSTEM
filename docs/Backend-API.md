# Backend API Documentation 📚

## Overview

The Smart Attendance System API is built using Express.js and MongoDB. It provides all the necessary endpoints for authentication, QR code generation, attendance tracking, and reporting.

## Authentication 🔐

### User Registration

```
POST /api/auth/register
```

Register a new user in the system.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "yourpassword",
  "role": "user"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "_id": "60d21b4667d0d8992e610c85",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  },
  "token": "jwt-token-here"
}
```

### User Login

```
POST /api/auth/login
```

Authenticate a user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "yourpassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "_id": "60d21b4667d0d8992e610c85",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  },
  "token": "jwt-token-here"
}
```

## QR Code Management 📱

### Get All QR Codes

```
GET /api/qr
```

Fetch all QR codes (Admin only).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "qrCodes": [
    {
      "_id": "60d21b4667d0d8992e610c85",
      "sessionId": "qr-session-id",
      "qrImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhE...",
      "type": "attendance",
      "status": "active",
      "expiresAt": "2023-07-01T00:00:00.000Z",
      "organization": {
        "id": "60d21b4667d0d8992e610c85",
        "name": "Example Org"
      },
      "createdAt": "2023-06-01T00:00:00.000Z"
    }
  ]
}
```

### Generate QR Code

```
POST /api/qr/generate
```

Generate a new QR code for attendance tracking.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "type": "attendance",
  "organizationId": "60d21b4667d0d8992e610c85",
  "validFor": 86400,
  "settings": {
    "allowMultipleScans": false,
    "requireLocation": true,
    "locationRadius": 100
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "QR session created successfully",
  "qrCode": {
    "sessionId": "qr-session-id",
    "qrImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhE...",
    "expiresAt": "2023-07-01T00:00:00.000Z",
    "organization": {
      "id": "60d21b4667d0d8992e610c85",
      "name": "Example Org"
    }
  }
}
```

### Get QR Code History

```
GET /api/qr/history/:organizationId
```

Get QR code history for an organization.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `type` - Filter by QR code type (optional)
- `status` - Filter by status (optional)
- `limit` - Number of records to return (default: 10)
- `page` - Page number for pagination (default: 1)

**Response:**
```json
{
  "success": true,
  "total": 100,
  "page": 1,
  "limit": 10,
  "qrCodes": [
    {
      "_id": "60d21b4667d0d8992e610c85",
      "sessionId": "qr-session-id",
      "qrImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhE...",
      "type": "attendance",
      "status": "active",
      "expiresAt": "2023-07-01T00:00:00.000Z",
      "scans": 5,
      "createdAt": "2023-06-01T00:00:00.000Z"
    }
  ]
}
```

### Scan QR Code

```
POST /api/qr/scan/:sessionId
```

Record a QR code scan for attendance.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "location": {
    "latitude": 37.7749,
    "longitude": -122.4194
  },
  "deviceInfo": {
    "device": "iPhone",
    "browser": "Safari",
    "ip": "192.168.1.1"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance recorded successfully",
  "scan": {
    "_id": "60d21b4667d0d8992e610c85",
    "sessionId": "qr-session-id",
    "user": {
      "id": "60d21b4667d0d8992e610c85",
      "name": "John Doe"
    },
    "timestamp": "2023-06-01T12:00:00.000Z",
    "location": {
      "latitude": 37.7749,
      "longitude": -122.4194
    }
  }
}
```

## Organization Management 🏢

### Create Organization

```
POST /api/organizations
```

Create a new organization (Admin only).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "Example Organization",
  "description": "A sample organization",
  "address": {
    "street": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94105",
    "country": "USA"
  },
  "contactEmail": "contact@example.org",
  "contactPhone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Organization created successfully",
  "organization": {
    "_id": "60d21b4667d0d8992e610c85",
    "name": "Example Organization",
    "description": "A sample organization",
    "address": {
      "street": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "zipCode": "94105",
      "country": "USA"
    },
    "contactEmail": "contact@example.org",
    "contactPhone": "+1234567890",
    "createdBy": "60d21b4667d0d8992e610c85",
    "createdAt": "2023-06-01T00:00:00.000Z"
  }
}
```

## User Management 👥

### Get All Users

```
GET /api/users
```

Get all users (Admin only).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "_id": "60d21b4667d0d8992e610c85",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "organizations": [
        {
          "_id": "60d21b4667d0d8992e610c85",
          "name": "Example Organization"
        }
      ],
      "createdAt": "2023-06-01T00:00:00.000Z"
    }
  ]
}
```

## Attendance Reports 📊

### Get Attendance Report

```
GET /api/reports/attendance/:organizationId
```

Get attendance reports for an organization.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `startDate` - Start date for the report (YYYY-MM-DD)
- `endDate` - End date for the report (YYYY-MM-DD)
- `userId` - Filter by user (optional)
- `format` - Response format (json, csv, pdf) (default: json)

**Response:**
```json
{
  "success": true,
  "report": {
    "organization": {
      "id": "60d21b4667d0d8992e610c85",
      "name": "Example Organization"
    },
    "period": {
      "startDate": "2023-06-01",
      "endDate": "2023-06-30"
    },
    "totalAttendance": 150,
    "userAttendance": [
      {
        "user": {
          "id": "60d21b4667d0d8992e610c85",
          "name": "John Doe"
        },
        "count": 20,
        "attendancePercentage": 90.5,
        "details": [
          {
            "date": "2023-06-01",
            "status": "present",
            "scanTime": "2023-06-01T09:15:00.000Z"
          }
        ]
      }
    ]
  }
}
```

## Data Models 📝

### User Schema

```javascript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['user', 'admin', 'super_admin'], 
    default: 'user' 
  },
  organizations: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Organization' 
  }],
  profile: {
    avatar: String,
    phone: String,
    department: String,
    position: String
  },
  lastLogin: Date,
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  }
}, {
  timestamps: true
});
```

### QR Session Schema

```javascript
const qrSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['attendance', 'event', 'access'],
    default: 'attendance'
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'revoked'],
    default: 'active'
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  qrImage: {
    type: String,
    trim: true
  },
  settings: {
    allowMultipleScans: {
      type: Boolean,
      default: false
    },
    requireLocation: {
      type: Boolean,
      default: true
    },
    locationRadius: {
      type: Number,
      default: 100
    },
    maxScans: {
      type: Number,
      default: 0
    },
    lastScanAt: Date
  }
}, {
  timestamps: true
});
```

### Organization Schema

```javascript
const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  contactEmail: String,
  contactPhone: String,
  logo: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  settings: {
    attendancePolicy: {
      startTime: String,
      endTime: String,
      graceTime: Number,
      workingDays: {
        monday: Boolean,
        tuesday: Boolean,
        wednesday: Boolean,
        thursday: Boolean,
        friday: Boolean,
        saturday: Boolean,
        sunday: Boolean
      }
    }
  }
}, {
  timestamps: true
});
```

## Error Handling 🐞

All API endpoints follow a consistent error handling pattern:

```json
{
  "success": false,
  "message": "Error message describing what went wrong",
  "error": "Detailed error information (only in development mode)"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (client error)
- `401`: Unauthorized (missing or invalid authentication)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

## Rate Limiting 🚦

The API implements rate limiting to prevent abuse:

- Authentication endpoints: 10 requests per minute per IP
- QR code generation: 60 requests per hour per user
- QR code scanning: 120 requests per hour per user
- General API: 1000 requests per hour per IP

## Security Considerations 🛡️

- All passwords are hashed using bcrypt
- JWT tokens are signed with a secure secret key
- Sensitive routes are protected by middleware
- Input validation is performed on all endpoints
- Headers include security-related items (CORS, XSS protection, etc.)

---

© 2025 Smart Attendance System. All Rights Reserved.
