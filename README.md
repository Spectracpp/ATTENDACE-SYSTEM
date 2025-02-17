# QR-Based Attendance System

A modern, scalable attendance management system using QR codes with multi-organization support.

## Features

### 1. Organization Management
- Multi-organization support
- Role-based access control (Admin, Teacher, Student, Employee)
- Department and employee ID management
- Organization-specific settings and policies
- Flexible member management with role-based permissions

### 2. User Management
- Social login (Google, GitHub, Microsoft)
- Email verification
- Multi-organization membership
- Role-based permissions
- Profile management
- Department-based organization

### 3. QR Code Management
- Dynamic QR code generation with expiration
- Location-based validation using Haversine formula
- Configurable scan limits and multiple scan settings
- Real-time QR code validation
- Animated QR code scanner interface
- Support for environment-facing cameras
- Geolocation tracking and validation

### 4. Attendance Management
- QR code-based attendance marking
- Location validation with configurable radius
- Real-time attendance tracking
- Attendance reports and analytics
- Multiple verification methods (QR, Manual, Geo, Beacon)

### 5. Session Management
- Create and manage attendance sessions
- QR code generation with automatic refresh
- Session-specific settings
- Real-time session monitoring

## Organization Features

### 1. Multi-Organization Support
- Users can belong to multiple organizations
- Different roles in each organization
- Organization-specific settings
- Primary organization selection
- Token refresh on organization changes

### 2. Role-Based Access Control
- **Admin**: Full organization management
  - Invite members
  - Manage settings
  - View all reports
  - Generate QR codes
  - Configure location settings
- **Teacher**: Session management
  - Create attendance sessions
  - Monitor attendance
  - View class reports
  - Generate and manage QR codes
- **Student/Employee**: Attendance marking
  - Scan QR codes
  - View own attendance
  - Update profile
  - Location-based verification

### 3. Department Management
- Organize users by department
- Department-specific reports
- Custom employee IDs
- Department-based filtering

### 4. Email Notifications
- Organization invitations
- Welcome emails
- Role-specific instructions
- Professional email templates

### 5. Security Features
- Role-based permissions
- Organization data isolation
- Secure invitation system
- Activity auditing
- Location-based validation
- QR code encryption
- Token-based authentication

## Technology Stack

### Backend
- Node.js & Express
- MongoDB with Mongoose
- JWT Authentication
- WebSocket for real-time updates
- Social OAuth integration
- Geolocation utilities
- QR code generation and validation

### Frontend
- Next.js (React)
- TypeScript
- Tailwind CSS
- PWA support
- Real-time updates with WebSocket
- Framer Motion for animations
- React QR Reader for QR scanning
- React Hot Toast for notifications
- Geolocation API integration

## Installation

### Backend Setup
1. Install dependencies:
```bash
cd Backend
npm install
```

2. Set up environment variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
ADMIN_CODE=your_admin_registration_code
```

3. Start the server:
```bash
npm start
```

### Frontend Setup
1. Install dependencies:
```bash
cd Frontend
npm install
```

2. Set up environment variables:
```env
REACT_APP_API_URL=http://localhost:5000
```

3. Start the development server:
```bash
npm start
```

## API Documentation

### QR Code Endpoints

#### Generate QR Code
```http
POST /api/qr/generate/:organizationId
```
Body:
```json
{
  "type": "daily",
  "validityHours": 24,
  "location": {
    "type": "Point",
    "coordinates": [longitude, latitude]
  },
  "settings": {
    "maxScans": 100,
    "allowMultipleScans": true,
    "locationRadius": 100
  }
}
```

#### Scan QR Code
```http
POST /api/qr/scan/:organizationId
```
Body:
```json
{
  "qrData": "encoded_qr_data",
  "location": {
    "type": "Point",
    "coordinates": [longitude, latitude]
  }
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
