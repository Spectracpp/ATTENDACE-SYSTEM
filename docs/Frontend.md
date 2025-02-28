# Frontend Documentation 💻

## Overview

The Smart Attendance System frontend is built with Next.js 14 using the App Router, providing a modern, responsive interface for all user interactions. The application is styled with Tailwind CSS and features a dark theme by default.

## Project Structure 📂

```
frontend/
├── app/
│   ├── (routes)/
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   ├── organizations/
│   │   │   ├── qr-codes/
│   │   │   ├── reports/
│   │   │   └── users/
│   │   ├── dashboard/
│   │   ├── profile/
│   │   └── settings/
│   ├── api/
│   │   ├── auth/
│   │   ├── qr/
│   │   └── users/
│   └── context/
│       ├── AuthContext.jsx
│       ├── ThemeContext.jsx
│       └── OrganizationContext.jsx
├── components/
│   ├── Auth/
│   ├── Dashboard/
│   ├── Layout/
│   ├── QRCode/
│   ├── Reports/
│   ├── UI/
│   └── Users/
├── lib/
│   ├── api/
│   ├── hooks/
│   ├── utils/
│   └── validation/
├── public/
│   ├── assets/
│   ├── fonts/
│   └── images/
```

## Key Components 🧩

### QR Code Components

The QR code functionality is implemented through several key components:

#### 1. `GenerateQRModal.jsx`

This component handles the generation of new QR codes.

**Features:**
- Form for QR code generation with various options
- Organization selection
- Type selection (attendance, event, access)
- Validity period configuration
- Settings for multiple scans and location verification
- Error handling and validation
- Success feedback

**Code Sample:**
```jsx
// Generate QR code
const handleGenerateQR = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  
  try {
    // Format data for API
    const formattedData = {
      type: formData.type,
      organizationId: formData.organizationId,
      validFor: parseInt(formData.validFor) * (formData.validityUnit === 'hours' ? 3600 : 86400),
      settings: {
        allowMultipleScans: formData.allowMultipleScans,
        requireLocation: formData.requireLocation,
        locationRadius: parseInt(formData.locationRadius)
      }
    };
    
    const response = await generateQRCode(organizationId, formattedData);
    
    if (response.success) {
      toast.success('QR Code generated successfully!');
      
      // Make sure the QR code data is properly formatted
      const qrCodeData = response.qrCode || {};
      
      // Check for qrImage or imageUrl property
      const qrImageUrl = qrCodeData.qrImage || qrCodeData.imageUrl;
      
      if (qrImageUrl) {
        // Ensure the qrImage is a valid data URL
        if (!qrImageUrl.startsWith('data:image')) {
          console.error('Invalid QR code image format:', qrImageUrl.substring(0, 30) + '...');
          toast.error('QR code image format is invalid');
        } else {
          // Format the QR code data for consistent structure
          const formattedQRCode = {
            ...qrCodeData,
            qrImage: qrImageUrl,
            organization: {
              id: qrCodeData.organization?.id || qrCodeData.organizationId || organizationId,
              name: qrCodeData.organization?.name || 
                    qrCodeData.organizationName || 
                    organizations.find(org => org._id === organizationId)?.name || 'N/A'
            }
          };
          
          setGeneratedQRCode(formattedQRCode);
          setShowQRCodeModal(true);
          if (onSuccess) onSuccess(formattedQRCode);
        }
      } else {
        console.error('QR code image is missing:', qrCodeData);
        toast.error('QR code image is missing');
      }
    } else {
      toast.error(response.message || 'Failed to generate QR Code');
    }
  } catch (error) {
    console.error('Error generating QR code:', error);
    toast.error('Failed to generate QR Code');
  } finally {
    setIsLoading(false);
  }
};
```

#### 2. `ViewQRCodeModal.jsx`

This component displays QR codes and provides download functionality.

**Features:**
- QR code display with organization branding
- Download options (PNG, PDF, etc.)
- Copy to clipboard functionality
- Ability to share QR code
- Dynamic handling of different QR code data structures

**Helper Functions:**
```jsx
// Get QR image URL from various possible properties
const getQRImageUrl = () => {
  if (!qrCode) return null;
  
  // Try all possible properties for QR image
  return qrCode.qrImage || 
         qrCode.imageUrl || 
         (qrCode.qrCode && qrCode.qrCode.imageUrl) || 
         null;
};

// Get organization details from various possible properties
const getOrganizationDetails = () => {
  if (!qrCode) return { id: '', name: 'N/A' };
  
  // Try all possible organization data structures
  if (qrCode.organization && typeof qrCode.organization === 'object') {
    return {
      id: qrCode.organization.id || qrCode.organization._id || '',
      name: qrCode.organization.name || 'N/A'
    };
  }
  
  // Try alternative properties
  return {
    id: qrCode.organizationId || '',
    name: qrCode.organizationName || 'N/A'
  };
};

// Get QR code ID from various possible properties
const getQRCodeId = () => {
  if (!qrCode) return '';
  
  return qrCode._id || 
         qrCode.id || 
         (qrCode.qrCode && qrCode.qrCode.id) || 
         'unknown';
};
```

#### 3. `ScanQRCode.jsx`

This component handles QR code scanning for attendance tracking.

**Features:**
- Camera access for QR scanning
- Real-time scanning feedback
- Location verification
- Success/error notifications
- Offline detection and handling

### Authentication Components

#### 1. `LoginForm.jsx`

Handles user authentication.

**Features:**
- Email/password login
- Remember me functionality
- Forgot password link
- Form validation
- Error handling

#### 2. `RegisterForm.jsx`

Handles new user registration.

**Features:**
- Name, email, password fields
- Password strength indicator
- Terms and conditions checkbox
- Form validation

### Layout Components

#### 1. `Sidebar.jsx`

Main navigation sidebar.

**Features:**
- Role-based menu items
- Collapsible sections
- Active link highlighting
- Mobile responsiveness

#### 2. `Header.jsx`

Application header.

**Features:**
- User profile dropdown
- Notifications
- Quick actions
- Search functionality

## Context Providers 🔄

### AuthContext

Manages user authentication state.

**Features:**
- Login/logout functionality
- User data storage
- Token management
- Permission checking

```jsx
// Example of permission checking
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Usage example
const { user, hasPermission } = useAuth();
if (hasPermission('manage_qr_codes')) {
  // Show QR code management features
}
```

### OrganizationContext

Manages organization data and settings.

**Features:**
- Current organization selection
- Organization data fetching
- Organization settings

## API Integration 🔌

### QR Code API Functions

Located in `lib/api/qrcode.js`, these functions handle QR code related API calls.

#### Generate QR Code

```javascript
export async function generateQRCode(organizationId, data) {
  try {
    const response = await apiRequest('/qr/generate', {
      method: 'POST',
      data: {
        organizationId,
        ...data
      },
      timeout: 10000, // 10 second timeout
      retries: 1
    });
    
    return response;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return {
      success: false,
      message: error.message || 'Failed to generate QR code. Please try again.'
    };
  }
}
```

#### Get QR Codes

```javascript
export async function getQRCodes() {
  try {
    const response = await apiRequest('/qr', {
      timeout: 8000, // 8 second timeout
      retries: 2
    });
    
    // Check if the response indicates an error
    if (!response.success && response.error) {
      console.error('Error fetching QR codes:', response.message);
      return {
        success: false,
        message: response.message || 'Failed to fetch QR codes. Please try again.',
        qrCodes: [] // Return empty array to prevent UI errors
      };
    }
    
    return response;
  } catch (error) {
    console.error('Error fetching QR codes:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch QR codes. Please try again.',
      qrCodes: [] // Return empty array to prevent UI errors
    };
  }
}
```

## Pages 📄

### QR Codes Page

Located at `app/(routes)/admin/qr-codes/page.jsx`, this page displays all QR codes and provides management functionality.

**Features:**
- List of all QR codes
- Filtering and sorting options
- QR code status indicators
- Actions: view, download, copy, delete
- Pagination

**QR Code Management:**
```jsx
// Handle viewing a QR code
const handleViewQRCode = (qr) => {
  // Format QR code data for consistent structure
  const formattedQRCode = {
    ...qr,
    organization: qr.organization || {
      id: qr.organizationId || '',
      name: qr.organizationName || 'N/A'
    }
  };
  
  setSelectedQRCode(formattedQRCode);
  setShowQRCodeModal(true);
};

// Handle downloading a QR code
const handleDownloadQRCode = (qr) => {
  try {
    // Check if qr.qrImage or qr.imageUrl exists
    const qrImageUrl = qr.qrImage || qr.imageUrl;
    
    if (!qrImageUrl) {
      console.error('No QR code image found:', qr);
      toast.error('QR code image not available for download');
      return;
    }
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = qrImageUrl;
    link.download = `qr-code-${qr._id || 'download'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('QR code downloaded successfully');
  } catch (error) {
    console.error('Error downloading QR code:', error);
    toast.error('Failed to download QR code');
  }
};

// Handle copying QR code data
const handleCopy = (qrCode) => {
  try {
    // Determine what to copy - prefer URL, fallback to ID or data
    const textToCopy = qrCode.url || 
                       qrCode.data || 
                       (qrCode.qrImage || qrCode.imageUrl) || 
                       qrCode.sessionId || 
                       qrCode._id || 
                       JSON.stringify({
                         id: qrCode._id,
                         type: qrCode.type,
                         sessionId: qrCode.sessionId
                       });
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast.success('QR code data copied to clipboard');
    }).catch((error) => {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy QR code data');
    });
  } catch (error) {
    console.error('Error copying QR code data:', error);
    toast.error('Failed to copy QR code data');
  }
};
```

## State Management 🔄

The application uses React Context API for global state management, with hooks for component-specific state.

### API Request Handling

```javascript
// lib/api/request.js
export async function apiRequest(endpoint, options = {}) {
  const {
    method = 'GET',
    data = null,
    headers = {},
    timeout = 30000,
    retries = 0
  } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  
  const requestOptions = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    credentials: 'include' // Include cookies for authentication
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    requestOptions.body = JSON.stringify(data);
  }

  // Add timeout handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  requestOptions.signal = controller.signal;

  try {
    const response = await fetchWithRetry(url, requestOptions, retries);
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || 'Something went wrong',
        error: errorData.error
      };
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      return {
        success: false,
        message: 'Request timed out',
        error: 'timeout'
      };
    }
    
    return {
      success: false,
      message: error.message || 'Network error',
      error: error.toString()
    };
  }
}
```

## Error Handling ⚠️

The application implements comprehensive error handling:

1. **API Errors**: Handled through try/catch blocks and error responses
2. **Form Validation**: Client-side validation before submission
3. **Network Issues**: Detection and appropriate user feedback
4. **Authentication Errors**: Automatic redirection to login
5. **Permissions Errors**: UI guidance for insufficient permissions

## Responsive Design 📱

The application is fully responsive:

1. **Mobile-First Approach**: Designed for mobile screens first
2. **Tailwind Breakpoints**: Utilizing Tailwind's responsive classes
3. **Custom Media Queries**: For complex layout adjustments
4. **Touch-Friendly UI**: Large tap targets for mobile users
5. **Optimized Images**: Different image sizes for different devices

## Accessibility ♿

The application follows accessibility best practices:

1. **Semantic HTML**: Proper HTML elements for their intended purpose
2. **ARIA Attributes**: Where necessary for complex interactions
3. **Keyboard Navigation**: All functionality accessible via keyboard
4. **Color Contrast**: Meeting WCAG guidelines
5. **Screen Reader Support**: Text alternatives for visual elements

## Performance Optimization ⚡

Performance is optimized through:

1. **Code Splitting**: Using Next.js dynamic imports
2. **Image Optimization**: Using Next.js Image component
3. **Lazy Loading**: Components loaded only when needed
4. **Memoization**: React.memo for expensive components
5. **Debouncing**: For search inputs and other frequent events

## Testing 🧪

The application includes:

1. **Unit Tests**: For individual components and functions
2. **Integration Tests**: For component interactions
3. **E2E Tests**: For critical user flows
4. **Accessibility Tests**: For WCAG compliance
5. **Performance Tests**: For load times and responsiveness

---

© 2025 Smart Attendance System. All Rights Reserved.
