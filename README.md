# QR-Based Attendance System

A modern, scalable attendance management system using QR codes with multi-organization support.

## Features

### 1. Organization Management
- Multi-organization support
- Role-based access control (Admin, Teacher, Student, Employee)
- Department and employee ID management
- Organization-specific settings and policies

### 2. User Management
- Social login (Google, GitHub, Microsoft)
- Email verification
- Multi-organization membership
- Role-based permissions
- Profile management

### 3. Attendance Management
- QR code-based attendance marking
- Location validation
- Real-time attendance tracking
- Attendance reports and analytics
- Multiple verification methods (QR, Manual, Geo, Beacon)

### 4. Session Management
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

### 2. Role-Based Access Control
- **Admin**: Full organization management
  - Invite members
  - Manage settings
  - View all reports
- **Teacher**: Session management
  - Create attendance sessions
  - Monitor attendance
  - View class reports
- **Student/Employee**: Attendance marking
  - Scan QR codes
  - View own attendance
  - Update profile

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

## Technology Stack

### Backend
- Node.js & Express
- MongoDB with Mongoose
- JWT Authentication
- WebSocket for real-time updates
- Social OAuth integration

### Frontend
- Next.js (React)
- TypeScript
- Tailwind CSS
- PWA support
- Real-time updates with WebSocket

## Email Configuration

### 1. Required Environment Variables
```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
EMAIL_FROM_NAME=QR Attendance System
EMAIL_FROM_ADDRESS=noreply@qrattendance.com
SUPPORT_EMAIL=support@qrattendance.com
```

### 2. Email Templates
Located in `Backend/templates/emails/`:
- invitation.html
- welcome.html
- reset-password.html

### 3. Email Features
- HTML and plain text versions
- Responsive design
- Custom branding support
- Localization ready

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/qr-attendance-system.git
cd qr-attendance-system
```

2. Install dependencies
```bash
# Backend
cd Backend
npm install

# Frontend
cd ../Frontend
npm install
```

3. Set up environment variables
```bash
# Backend (.env)
cp .env.example .env
# Edit .env with your configurations

# Frontend (.env.local)
cp .env.example .env.local
# Edit .env.local with your configurations
```

4. Start development servers
```bash
# Backend
npm run dev

# Frontend
npm run dev
```

## Organization Setup Guide

### 1. Initial Setup
```bash
# Install email dependencies
npm install nodemailer
npm install email-templates

# Set up environment variables
cp .env.example .env
# Edit SMTP settings in .env
```

### 2. Create Organization
```javascript
// Example API call
const response = await fetch('/api/organizations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'My Organization',
    code: 'ORG123',
    type: 'education'
  })
});
```

### 3. Invite Members
```javascript
// Example API call
const response = await fetch('/api/organizations/${orgId}/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    email: 'user@example.com',
    role: 'teacher',
    department: 'Computer Science'
  })
});
```

## Best Practices

### 1. Organization Management
- Use meaningful organization codes
- Implement proper role hierarchy
- Regular cleanup of inactive users
- Monitor organization limits

### 2. Email Handling
- Use queue for bulk emails
- Implement retry mechanism
- Monitor email delivery
- Handle bounces properly

### 3. Security
- Validate all organization access
- Secure invitation tokens
- Rate limit operations
- Audit sensitive actions

### 4. Performance
- Cache organization data
- Optimize member queries
- Use appropriate indexes
- Batch operations

## Role-Based Features

### Admin
- Manage organization settings
- Invite and manage users
- Create and manage sessions
- View attendance reports
- Manage departments

### Teacher
- Create attendance sessions
- Monitor attendance
- Generate reports
- Manage assigned classes

### Student/Employee
- Mark attendance via QR code
- View attendance history
- Update profile
- Join multiple organizations

## Security Features

1. **Authentication**
   - JWT-based authentication
   - Social login options
   - Token refresh mechanism
   - Session management

2. **Authorization**
   - Role-based access control
   - Organization-level permissions
   - Resource-level access control
   - API route protection

3. **Data Protection**
   - Password hashing
   - Data encryption
   - Secure cookie handling
   - XSS protection

## API Documentation

Detailed API documentation is available in [API_DOCUMENTATION.md](./Backend/API_DOCUMENTATION.md)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@qrattendance.com or join our Slack channel.
