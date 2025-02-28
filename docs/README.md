# Smart Attendance System 🌟

![Smart Attendance System](https://via.placeholder.com/1200x630/0F172A/FFFFFF?text=Smart+Attendance+System "Smart Attendance System")

## 📋 Overview

The Smart Attendance System is a modern, robust solution for tracking attendance through QR codes. Built with Next.js 14 (frontend) and Express.js (backend), it offers a seamless experience for organizations of all sizes.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![made-with-nodejs](https://img.shields.io/badge/Made%20with-Node.js-339933.svg)](https://nodejs.org)
[![made-with-nextjs](https://img.shields.io/badge/Made%20with-Next.js-000000.svg)](https://nextjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B.svg)](https://www.mongodb.com/)

## ✨ Key Features

### QR Code Attendance System
- **Dynamic QR Generation**: Create secure, time-limited QR codes
- **Multi-format Support**: Download QR codes in various formats
- **Scan Tracking**: Comprehensive history of all scans
- **Multiple Device Support**: Works on all devices with a camera
- **Memory-optimized**: Efficient handling of QR images prevents memory issues

### User Management
- **Role-based Access Control**: Admin, manager, and user roles
- **Organization Management**: Create and manage multiple organizations
- **Invitation System**: Easily invite users to your organization
- **Profile Management**: User profile customization

### Security
- **JWT Authentication**: Secure token-based authentication
- **Permission System**: Granular control over user permissions
- **Data Encryption**: Sensitive data is always encrypted
- **Rate Limiting**: Protection against abuse and attacks

### Analytics & Reporting
- **Attendance Reports**: Generate detailed attendance reports
- **Export Options**: Export data to CSV/Excel/PDF
- **Visual Analytics**: Charts and graphs for attendance trends
- **Real-time Statistics**: Live updates of attendance data

## 🏗️ Architecture

The system is built using a modern microservices architecture:

```
┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │
│  Next.js 14     │◄────►│  Express.js API │◄────► MongoDB
│  Frontend       │      │  Backend        │
│                 │      │                 │
└─────────────────┘      └─────────────────┘
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/attendance-system.git
   cd attendance-system
   ```

2. **Setup Backend**
   ```bash
   cd Backend
   npm install
   cp .env.example .env
   # Configure your .env file with MongoDB connection and JWT secret
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local
   # Configure your .env.local file
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📚 Documentation

### API Documentation
For detailed API documentation, please refer to the [Backend README](./Backend/README.md).

### Frontend Documentation
For frontend documentation and component details, please refer to the [Frontend README](./frontend/README.md).

## 📱 Mobile Compatibility

The Smart Attendance System is fully responsive and works on:
- iOS Safari
- Android Chrome/Firefox
- All modern mobile browsers

## 🔒 Security Features

- **JWT Token Authentication**: Secure, stateless authentication
- **HTTP-Only Cookies**: Protection against XSS attacks
- **CORS Configuration**: Controlled resource sharing
- **Input Validation**: Protection against injection attacks
- **Rate Limiting**: Prevention of brute force attacks

## 🌈 User Roles & Permissions

| Feature | Admin | Manager | User |
|---------|-------|---------|------|
| Create Organization | ✅ | ❌ | ❌ |
| Manage Users | ✅ | ✅ | ❌ |
| Generate QR Codes | ✅ | ✅ | ❌ |
| Scan QR Codes | ✅ | ✅ | ✅ |
| View Reports | ✅ | ✅ | ✅* |
| Access Settings | ✅ | ✅ | ✅* |

*Limited access

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **State Management**: React Context API
- **Styling**: Tailwind CSS
- **UI Components**: Framer Motion, React Icons
- **QR Code**: QR Code libraries for generation and scanning
- **HTTP Client**: Axios

### Backend
- **Server**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT
- **Validation**: Express-validator
- **File Handling**: Multer
- **QR Code**: Node QR Code

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Contributors

Made with ❤️ by the Smart Attendance System Team

---

© 2025 Smart Attendance System. All Rights Reserved.
