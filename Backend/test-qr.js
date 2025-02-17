const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let adminToken, userToken, organizationId;

const generateUniqueEmail = () => {
  return `test${Date.now()}@example.com`;
};

const generateUniqueEmployeeId = () => {
  return `EMP${Date.now()}`;
};

const test = async () => {
  try {
    // 1. Register Admin
    console.log('\n=== 1. Register Admin ===');
    const adminResponse = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Test Admin',
      email: generateUniqueEmail(),
      password: 'Admin@123',
      employeeId: generateUniqueEmployeeId(),
      phone: '1234567890',
      role: 'admin',
      adminCode: 'admin123',
      department: 'IT'
    });
    
    adminToken = adminResponse.data.token;
    console.log('Admin registered successfully');

    // 2. Register Regular User
    console.log('\n=== 2. Register Regular User ===');
    const userResponse = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Test User',
      email: generateUniqueEmail(),
      password: 'User@123',
      employeeId: generateUniqueEmployeeId(),
      phone: '9876543210',
      department: 'Sales'
    });
    
    userToken = userResponse.data.token;
    console.log('User registered successfully');

    // 3. Create Organization
    console.log('\n=== 3. Create Organization ===');
    const orgResponse = await axios.post(
      `${BASE_URL}/organizations`,
      {
        name: `Test Org ${Date.now()}`,
        code: `org-${Date.now()}`,
        type: 'business',
        settings: {
          maxQrScans: 3,
          allowMultipleScans: true,
          locationRadius: 100
        }
      },
      {
        headers: { Authorization: adminToken }
      }
    );
    
    organizationId = orgResponse.data.organization._id;
    adminToken = orgResponse.data.token; // Update admin token
    console.log(`Organization created with ID: ${organizationId}`);

    // 4. Add User to Organization
    console.log('\n=== 4. Add User to Organization ===');
    const addMemberResponse = await axios.post(
      `${BASE_URL}/organizations/${organizationId}/members`,
      {
        email: userResponse.data.user.email,
        role: 'member'
      },
      {
        headers: { Authorization: adminToken }
      }
    );
    
    userToken = addMemberResponse.data.token; // Update user token
    console.log('User added to organization successfully');

    // 5. Generate QR Code
    console.log('\n=== 5. Generate QR Code ===');
    const qrResponse = await axios.post(
      `${BASE_URL}/qr/generate/${organizationId}`,
      {
        type: 'daily',
        validityHours: 24,
        location: {
          type: 'Point',
          coordinates: [72.8777, 19.0760]
        },
        settings: {
          maxScans: 3,
          allowMultipleScans: true,
          locationRadius: 100
        }
      },
      {
        headers: { Authorization: adminToken }
      }
    );
    
    const qrCode = qrResponse.data.qrCode;
    console.log('QR Code generated successfully');

    // 6. Scan QR Code
    console.log('\n=== 6. Scan QR Code ===');
    const scanResponse = await axios.post(
      `${BASE_URL}/qr/scan/${organizationId}`,
      {
        qrData: JSON.stringify({
          id: qrCode._id,
          data: qrCode.data,
          org: organizationId
        }),
        location: {
          type: 'Point',
          coordinates: [72.8777, 19.0760]
        }
      },
      {
        headers: { Authorization: userToken }
      }
    );
    
    console.log('QR Code scanned successfully');

    // Try scanning again to test multiple scan prevention
    console.log('\n=== 7. Try Scanning Again ===');
    try {
      await axios.post(
        `${BASE_URL}/qr/scan/${organizationId}`,
        {
          qrData: JSON.stringify({
            id: qrCode._id,
            data: qrCode.data,
            org: organizationId
          }),
          location: {
            type: 'Point',
            coordinates: [72.8777, 19.0760]
          }
        },
        {
          headers: { Authorization: userToken }
        }
      );
      console.log('Second scan successful (multiple scans allowed)');
    } catch (error) {
      if (error.response.status === 400) {
        console.log('Second scan prevented as expected:', error.response.data.message);
      } else {
        throw error;
      }
    }

  } catch (error) {
    console.log('\n=== Error ===');
    if (error.response) {
      console.log('Error Response:', JSON.stringify(error.response.data, null, 2));
      console.log('Status Code:', error.response.status);
      if (error.response.data.errors) {
        console.log('Validation Errors:', JSON.stringify(error.response.data.errors, null, 2));
      }
    } else {
      console.log('Error:', error.message);
    }
  }
};

test();
