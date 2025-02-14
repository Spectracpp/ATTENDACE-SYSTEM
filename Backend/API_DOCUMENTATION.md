# QR-Based Attendance System API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require JWT authentication. Add the token to the Authorization header:
```
Authorization: Bearer <your_token>
```

## 1. Organization Management

### Create Organization
```http
POST /organizations
Authorization: Bearer <admin_token>
Content-Type: application/json

{
    "name": "Organization Name",
    "code": "ORG123",
    "description": "Organization description",
    "type": "education",  // Options: business, education, government, non-profit
    "settings": {
        "qrCodeExpiry": 5,  // minutes
        "allowMultipleScans": false,
        "requireLocation": true,
        "attendanceWindow": {
            "start": "09:00",
            "end": "17:00"
        }
    },
    "locations": [
        {
            "name": "Main Campus",
            "address": "123 Street",
            "coordinates": {
                "latitude": 12.9716,
                "longitude": 77.5946
            },
            "radius": 100  // meters
        }
    ]
}
```

## 2. User Management

### Register Regular User
```http
POST /users/register
Content-Type: application/json

{
    "firstName": "John",
    "lastName": "Doe",
    "email": "user@example.com",
    "password": "Password123"
}
```

### Register Admin
```http
POST /users/register-admin
Content-Type: application/json
admin-code: admin123  // Get this from backend team

{
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@example.com",
    "password": "Admin123"
}
```

### Login
```http
POST /users/login
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "Password123"
}

Response:
{
    "token": "jwt_token_here",
    "user": {
        "_id": "user_id",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "user"
    }
}
```

## 3. Session Management

### Create Session
```http
POST /sessions
Authorization: Bearer <admin_token>
Content-Type: application/json

{
    "organization": "organization_id",
    "name": "Morning Lecture",
    "type": "regular",  // Options: regular, event, meeting
    "description": "Morning lecture session",
    "date": "2025-02-14",
    "startTime": "09:00",
    "endTime": "10:00",
    "location": {
        "type": "Point",
        "coordinates": [77.5946, 12.9716]  // [longitude, latitude]
    },
    "settings": {
        "allowLateMarking": true,
        "qrRefreshInterval": 30,  // seconds
        "locationRadius": 100  // meters
    }
}
```

### Get Session QR Code
```http
GET /sessions/:sessionId/qr
Authorization: Bearer <admin_token>

Response:
{
    "sessionCode": "SESSION123",
    "qrCode": "base64_encoded_qr_code",
    "expiresIn": 300,  // seconds
    "refreshInterval": 30  // seconds
}
```

### List Sessions
```http
GET /sessions
Authorization: Bearer <admin_token>
```

## 4. Attendance Management

### Mark Attendance
```http
POST /attendance/mark
Authorization: Bearer <user_token>
Content-Type: application/json

{
    "qrCode": "scanned_qr_code",
    "location": {
        "type": "Point",
        "coordinates": [77.5946, 12.9716]  // [longitude, latitude]
    },
    "device": {
        "type": "mobile",  // Options: mobile, tablet, desktop
        "userAgent": "Mozilla/5.0...",
        "ip": "127.0.0.1"
    },
    "verificationMethod": "qr"  // Options: qr, manual, geo, beacon
}
```

### Get Session Attendance
```http
GET /sessions/:sessionId/attendance
Authorization: Bearer <admin_token>

Response:
{
    "total": 30,
    "present": 25,
    "late": 3,
    "absent": 2,
    "attendees": [
        {
            "user": {
                "_id": "user_id",
                "firstName": "John",
                "lastName": "Doe"
            },
            "status": "present",
            "markedAt": "2025-02-14T09:05:00Z"
        }
        // ...
    ]
}
```

### Get Attendance Statistics
```http
GET /organizations/:organizationId/attendance/stats
Authorization: Bearer <admin_token>
Query Parameters:
- sessionId (optional)
- startDate (optional)
- endDate (optional)

Response:
{
    "totalSessions": 10,
    "totalAttendees": 50,
    "averageAttendance": 85,
    "statusBreakdown": {
        "present": 80,
        "late": 15,
        "absent": 5
    }
}
```

## Important Notes for Frontend Implementation

1. **QR Code Handling**:
   - QR codes expire after the time specified in organization settings
   - Implement auto-refresh based on `refreshInterval`
   - Display countdown timer for QR code expiry

2. **Location Requirements**:
   - Check `organization.settings.requireLocation`
   - Request user's location before attendance marking if required
   - Ensure location accuracy is within the specified radius

3. **Error Handling**:
   - Handle 401 (Unauthorized) - redirect to login
   - Handle 403 (Forbidden) - show permission error
   - Handle 404 (Not Found) - show appropriate message
   - Handle 422 (Validation Error) - show field-specific errors

4. **Real-time Updates**:
   - Implement WebSocket connection for real-time attendance updates
   - Listen for QR code refresh events
   - Update attendance lists automatically

5. **Offline Support**:
   - Cache QR codes for offline scanning
   - Queue attendance marking requests if offline
   - Sync when connection is restored

6. **Security Considerations**:
   - Store JWT token securely
   - Clear token on logout
   - Don't store sensitive data in localStorage
   - Implement token refresh mechanism

## Environment Variables Needed
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=ws://localhost:5000
REACT_APP_QR_REFRESH_INTERVAL=30000
```

## Response Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 422: Validation Error
- 500: Server Error
