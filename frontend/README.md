# AttendEase - Modern Attendance Management System

A comprehensive attendance management system built with Next.js 14, featuring role-based access control, QR code-based attendance tracking, and geolocation verification.

## 🚀 Features

- **Modern Tech Stack**: Built with Next.js 14 using the App Router
- **Authentication**: Role-based access control (Admin/User)
- **QR Code Integration**: Generate and scan QR codes for attendance
- **Geolocation**: Location-based attendance verification
- **Real-time Updates**: Instant attendance status updates
- **Dark Mode**: Beautiful dark theme UI
- **Responsive Design**: Works on all devices
- **Toast Notifications**: User-friendly notifications

## 🛠 Tech Stack

- **Frontend Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **State Management**: React Context
- **Authentication**: JWT with HTTP-only cookies
- **UI Components**: 
  - Framer Motion (animations)
  - React Icons
  - React Hot Toast (notifications)
- **QR Code**: 
  - html5-qrcode (scanning)
  - qrcode.react (generation)

## 📁 Project Structure

```
frontend/
├── app/
│   ├── (authenticated)/    # Protected routes
│   │   ├── admin/         # Admin-only routes
│   │   ├── dashboard/     # User dashboard
│   │   └── settings/      # User settings
│   ├── (public)/          # Public routes
│   │   ├── auth/          # Authentication pages
│   │   └── layout.jsx     # Public layout
│   ├── api/               # API routes
│   └── context/           # React contexts
├── components/            # Reusable components
├── hooks/                # Custom hooks
└── public/              # Static assets
```

## 🚦 Getting Started

1. **Clone the repository**
```bash
git clone <repository-url>
cd ATTENDANCE-SYSTEM/frontend
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables**
Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. **Run the development server**
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔐 Authentication

The system supports two types of users:
- **Administrators**: Full system access
- **Users**: Limited access for attendance marking

Authentication routes:
- `/auth/login` - User login
- `/auth/login/admin` - Admin login
- `/auth/register` - User registration
- `/auth/register/admin` - Admin registration

## 📱 Features in Detail

### QR Code Attendance
- Admins can generate unique QR codes
- Users can scan QR codes to mark attendance
- Geolocation verification ensures presence

### Geolocation
- Automatic location detection
- Distance calculation from attendance point
- Location verification before marking attendance

### Role-based Access
- Admin Dashboard
  - User management
  - Attendance reports
  - Organization settings
- User Dashboard
  - Attendance marking
  - History view
  - Profile management

## 🎨 UI/UX Features

- Responsive design for all screen sizes
- Dark mode optimized
- Smooth animations with Framer Motion
- Toast notifications for user feedback
- Loading states and error handling
- Clean and modern interface

## 🔧 Configuration

The project uses various configuration files:
- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `jsconfig.json` - JavaScript path aliases

## 📚 API Documentation

The frontend communicates with a backend API:
- Authentication endpoints
- User management
- Attendance tracking
- Organization management
- Analytics and reporting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

This project is licensed under the MIT License.
