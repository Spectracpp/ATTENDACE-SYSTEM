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

## 5. Organization-User Management

### Add User to Organization
```http
POST /organizations/:orgId/users
Authorization: Bearer <admin_token>
Content-Type: application/json

{
    "email": "user@example.com",
    "role": "teacher",  // Options: admin, teacher, student, employee
    "department": "Computer Science",
    "employeeId": "EMP123"  // Optional
}

Response:
{
    "message": "User invited to organization",
    "invitation": {
        "id": "inv_123",
        "email": "user@example.com",
        "organization": "org_id",
        "role": "teacher",
        "status": "pending"
    }
}
```

### Accept Organization Invitation
```http
POST /organizations/invitations/:invitationId/accept
Authorization: Bearer <user_token>

Response:
{
    "message": "Invitation accepted",
    "organization": {
        "id": "org_id",
        "name": "Organization Name",
        "role": "teacher"
    }
}
```

### Set Primary Organization
```http
PUT /users/primary-organization
Authorization: Bearer <user_token>
Content-Type: application/json

{
    "organizationId": "org_id"
}

Response:
{
    "message": "Primary organization updated",
    "primaryOrganization": {
        "id": "org_id",
        "name": "Organization Name"
    }
}
```

### Get User's Organizations
```http
GET /users/organizations
Authorization: Bearer <user_token>

Response:
{
    "organizations": [
        {
            "id": "org_id",
            "name": "Organization Name",
            "role": "teacher",
            "status": "active",
            "department": "Computer Science",
            "employeeId": "EMP123",
            "joinedAt": "2025-02-14T00:22:16Z"
        }
    ],
    "primaryOrganization": {
        "id": "org_id",
        "name": "Organization Name"
    }
}
```

### Update User's Organization Role
```http
PUT /organizations/:orgId/users/:userId/role
Authorization: Bearer <admin_token>
Content-Type: application/json

{
    "role": "admin",
    "department": "IT",  // Optional
    "employeeId": "EMP124"  // Optional
}

Response:
{
    "message": "User role updated",
    "user": {
        "id": "user_id",
        "email": "user@example.com",
        "role": "admin",
        "department": "IT",
        "employeeId": "EMP124"
    }
}
```

### Remove User from Organization
```http
DELETE /organizations/:orgId/users/:userId
Authorization: Bearer <admin_token>

Response:
{
    "message": "User removed from organization"
}
```

### Get Organization Members
```http
GET /organizations/:orgId/users
Authorization: Bearer <admin_token>
Query Parameters:
- role (optional): Filter by role
- department (optional): Filter by department
- status (optional): Filter by status
- search (optional): Search by name or email

Response:
{
    "total": 100,
    "members": [
        {
            "id": "user_id",
            "firstName": "John",
            "lastName": "Doe",
            "email": "john@example.com",
            "role": "teacher",
            "department": "Computer Science",
            "employeeId": "EMP123",
            "status": "active",
            "joinedAt": "2025-02-14T00:22:16Z"
        }
    ]
}
```

## 6. Email Notifications

The system sends automated emails for various organization-related events:

### Invitation Email
- Sent when a user is invited to an organization
- Contains invitation token and acceptance link
- Expires after 7 days

### Welcome Email
- Sent after accepting organization invitation
- Contains role-specific information and next steps
- Links to dashboard and support

## 7. Organization Authorization

### Middleware Functions

1. **belongsToOrganization**
```javascript
// Checks if user is a member of the organization
app.use('/api/organizations/:orgId/*', belongsToOrganization);
```

2. **hasRole**
```javascript
// Checks if user has specific role(s)
app.use('/api/sessions', hasRole(['admin', 'teacher']));
```

3. **isAdmin**
```javascript
// Checks if user is an organization admin
app.use('/api/organizations/:orgId/settings', isAdmin);
```

4. **canMarkAttendance**
```javascript
// Checks if user can mark attendance
app.use('/api/attendance/mark', canMarkAttendance);
```

5. **canManageSessions**
```javascript
// Checks if user can manage sessions
app.use('/api/sessions/create', canManageSessions);
```

### Role Permissions Matrix

| Permission                  | Admin | Teacher | Student | Employee |
|----------------------------|-------|---------|---------|----------|
| Create Organization        | ✓     | ✗       | ✗       | ✗        |
| Invite Members             | ✓     | ✗       | ✗       | ✗        |
| Create Sessions            | ✓     | ✓       | ✗       | ✗        |
| Mark Attendance            | ✗     | ✗       | ✓       | ✓        |
| View Reports               | ✓     | ✓       | ✗       | ✗        |
| Manage Settings           | ✓     | ✗       | ✗       | ✗        |
| View Own Attendance        | ✗     | ✗       | ✓       | ✓        |

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

## Important Notes for Organization Management

1. **Role Hierarchy**:
   - `admin`: Full organization management access
   - `teacher`: Can create sessions and manage attendance
   - `student`: Can only mark their own attendance
   - `employee`: Similar to student role

2. **Organization Status**:
   - `active`: User can access organization features
   - `inactive`: User access is temporarily suspended
   - `pending`: Waiting for user to accept invitation

3. **Security Considerations**:
   - Only organization admins can invite new users
   - Users must verify email before joining organization
   - Users can belong to multiple organizations with different roles
   - Primary organization is used as default context

4. **Best Practices**:
   - Always check user's role and status before operations
   - Use department field for better organization
   - Keep employee IDs unique within organization
   - Handle invitation expiry appropriately

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

## Environment Variables

```env
# Email Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
EMAIL_FROM_NAME=QR Attendance System
EMAIL_FROM_ADDRESS=noreply@qrattendance.com
SUPPORT_EMAIL=support@qrattendance.com

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Organization Settings
DEFAULT_QR_EXPIRY=300
DEFAULT_LOCATION_RADIUS=100
MAX_MEMBERS_PER_ORG=1000
MAX_SESSIONS_PER_DAY=50
```

## Error Codes

### Organization-specific Error Codes
```json
{
    "ORG_001": "Organization not found",
    "ORG_002": "Invalid invitation token",
    "ORG_003": "Invitation expired",
    "ORG_004": "Member limit exceeded",
    "ORG_005": "Invalid role assignment",
    "ORG_006": "Duplicate organization code",
    "ORG_007": "Invalid organization settings"
}
```

## Best Practices

1. **Organization Management**
   - Use unique organization codes
   - Implement role-based access control
   - Regular cleanup of expired invitations
   - Audit important actions

2. **Email Notifications**
   - Use templates for consistency
   - Include clear call-to-action
   - Proper error handling
   - Rate limiting for invitations

3. **Security**
   - Validate organization membership
   - Check role permissions
   - Secure invitation tokens
   - Prevent privilege escalation

4. **Performance**
   - Cache organization settings
   - Batch member updates
   - Optimize member queries
   - Use indexes effectively
