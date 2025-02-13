# QR Code Attendance System API

A secure and scalable Node.js backend API for managing attendance using QR codes, with role-based access control and organization management.

## Features

- Secure QR code generation with expiration
- Role-based access control (user, admin, super_admin)
- Organization-specific permissions
- Location-based attendance verification
- Advanced attendance tracking and statistics
- JWT-based authentication with security features
- MongoDB database with optimized schemas
- Express.js REST API with validation

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- NPM or Yarn package manager

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000 # optional, defaults to 5000
JWT_SECRET=your-jwt-secret-key
```

## Running the Application

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

## API Endpoints

### Authentication

#### User Registration and Login

- **POST** `/api/auth/register` - Register a new user
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe"
  }
  ```

- **POST** `/api/auth/login` - Login user
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePass123!"
  }
  ```

### Organization Management

#### Create and Manage Organizations

- **POST** `/api/organizations` - Create new organization (Admin)
  ```json
  {
    "name": "Example Corp",
    "code": "EX-CORP",
    "type": "business",
    "settings": {
      "qrCodeExpiry": 5,
      "allowMultipleScans": false,
      "requireLocation": true
    }
  }
  ```

- **GET** `/api/organizations/:id` - Get organization details
- **PUT** `/api/organizations/:id` - Update organization settings
- **GET** `/api/organizations/:id/members` - List organization members

### QR Code Management

#### Generate and Manage QR Sessions

- **POST** `/api/qr/generate` - Generate new QR session (Admin)
  ```json
  {
    "organization": "org_id",
    "type": "attendance",
    "location": {
      "name": "Main Office",
      "coordinates": {
        "latitude": 37.7749,
        "longitude": -122.4194
      },
      "radius": 100
    },
    "metadata": {
      "eventName": "Daily Attendance",
      "description": "Regular office hours"
    }
  }
  ```

- **POST** `/api/qr/scan` - Scan QR code and mark attendance
  ```json
  {
    "sessionId": "session_id",
    "location": {
      "coordinates": {
        "latitude": 37.7749,
        "longitude": -122.4194
      }
    }
  }
  ```

#### View QR Sessions and Statistics

- **GET** `/api/qr/sessions` - List QR sessions (Admin)
  - Query params: `status`, `type`, `page`, `limit`

- **GET** `/api/qr/stats` - Get attendance statistics (Admin)
  - Query params: `startDate`, `endDate`

### Attendance Management

#### View and Manage Attendance

- **GET** `/api/attendance` - List attendance records
  - Query params: `startDate`, `endDate`, `status`

- **POST** `/api/attendance/:id/excuse` - Mark attendance as excused
  ```json
  {
    "reason": "Doctor's appointment",
    "attachments": [{
      "type": "document",
      "url": "https://example.com/doc.pdf"
    }]
  }
  ```

## Security Features

### Authentication and Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Organization-specific permissions
- Account locking after failed attempts
- Password strength requirements

### QR Code Security
- Time-based expiration
- Unique session IDs
- Location verification
- Single-use scanning (configurable)
- Device tracking

### Data Protection
- Password encryption using bcrypt
- Secure password reset flow
- Rate limiting on sensitive endpoints
- Input validation and sanitization
- CORS protection

## Database Models

### User Model
- Email and password authentication
- Role-based permissions
- Organization memberships
- Account status and security features
- Login tracking

### Organization Model
- Hierarchical structure
- Configurable settings
- Location management
- Subscription handling

### QR Session Model
- Time-based expiration
- Location validation
- Multiple session types
- Usage statistics
- Security settings

### Attendance Model
- Multiple status types
- Location tracking
- Device information
- Supporting documentation
- Statistical aggregation

## Error Handling

The API uses standard HTTP status codes and returns detailed error messages:

```json
{
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Rate Limiting

To prevent abuse, the API implements rate limiting:
- QR Generation: 60 requests per hour per organization
- Authentication: 5 failed attempts before temporary lockout
- General API: 1000 requests per hour per IP

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
