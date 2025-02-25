# Smart Attendance System: Your Modern Attendance Solution 🌟

Welcome to our Smart Attendance System! We've created a modern, easy-to-use solution that makes tracking attendance a breeze using QR codes. Whether you're a school, college, business, or any organization, our system adapts to your needs.

## 🎯 What Makes Us Special?

### 📱 Easy Attendance Marking
- Just scan a QR code with your phone - no more paperwork!
- Works with your phone's camera - no special equipment needed
- Location-based verification ensures you're actually at the venue
- Quick and reliable - mark your attendance in seconds

### 🏢 Perfect for Any Organization
- **Schools & Colleges**: Track student attendance across classes
- **Businesses**: Monitor employee attendance with ease
- **Events**: Manage participant check-ins effortlessly
- **Government Offices**: Streamline attendance for employees
- **Training Centers**: Keep track of trainee attendance

### 👥 Different Roles for Different Needs

#### For Administrators
- Create and manage your organization
- Add departments and teams
- Invite staff and students
- Set attendance rules and policies
- View detailed reports and analytics
- Control who can do what with role-based permissions

#### For Teachers/Managers
- Generate QR codes for your classes/meetings
- Track who's present in real-time
- View attendance reports for your groups
- Send notifications to absent members
- Manage multiple sessions easily

#### For Students/Employees
- Mark attendance with a simple QR scan
- View your attendance history
- See your attendance percentage
- Get notifications about new sessions
- Request leave or explain absences

### 🛡️ Security & Privacy
- Secure login with email verification
- Option to use Google, GitHub, or Microsoft accounts
- QR codes that expire after use
- Location verification to prevent proxy attendance
- Your data is always protected and private

### 📊 Smart Reports & Analytics
- Daily, weekly, and monthly attendance reports
- Beautiful charts and graphs
- Export reports to Excel or PDF
- Automated attendance summaries
- Custom report generation

### ⚡ Cool Features

#### Smart QR Codes
- QR codes that change automatically
- Can't be reused after expiry
- Works only in the right location
- Prevents fake attendance

#### Location Magic
- Checks if you're actually at the venue
- Works with your phone's GPS
- Customizable radius for different venues
- Perfect for remote locations

#### Real-time Updates
- See who's present right now
- Instant attendance confirmation
- Live attendance count
- Immediate notifications

#### Easy Organization
- Create multiple departments
- Organize people into teams
- Set different rules for different groups
- Manage multiple venues

### 📱 Mobile Friendly
- Works perfectly on phones and tablets
- No app installation needed
- Opens right in your browser
- Fast and responsive design

### 🎨 Beautiful & Easy to Use
- Clean, modern interface
- Dark mode support
- Easy navigation
- Helpful tooltips and guides

## 🚀 Getting Started

1. **Create Your Organization**
   - Sign up as an administrator
   - Set up your organization details
   - Add your logo and customize settings

2. **Add Your Team**
   - Invite teachers/managers
   - Add students/employees
   - Organize them into departments

3. **Start Taking Attendance**
   - Generate QR codes for sessions
   - Share with your team
   - Track attendance in real-time

## 💡 Tips for Best Use

- Place QR codes in easily accessible locations
- Ensure good lighting for QR scanning
- Keep your phone's camera clean for better scanning
- Make sure location services are enabled
- Update your browser for best performance

## 🤝 Support

Need help? We're here for you!
- Detailed user guides
- Video tutorials
- Email support
- Quick response to issues
- Regular updates and improvements

## 🌟 Why Choose Us?

- **Save Time**: No more manual attendance taking
- **Reduce Errors**: Automated and accurate
- **Stay Organized**: Everything in one place
- **Be Flexible**: Works anywhere, anytime
- **Stay Secure**: Protected and private
- **Get Insights**: Detailed reports and analytics

Join thousands of organizations already using our Smart Attendance System to make their attendance management smarter, faster, and more efficient! 🚀

---

*Ready to modernize your attendance system? Get started today!*

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
