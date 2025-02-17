const axios = require('axios');

async function testAuth() {
    const timestamp = Date.now();
    const userEmail = `testuser${timestamp}@example.com`;
    const adminEmail = `testadmin${timestamp}@example.com`;

    try {
        console.log('\n=== Testing User Registration ===');
        const userRegResponse = await axios.post('http://localhost:5000/api/auth/register', {
            name: 'Test User',
            email: userEmail,
            password: 'Test1234',
            phone: '1234567890',
            employeeId: `EMP${timestamp}`,
            role: 'user'
        });
        console.log('User Registration Response:', JSON.stringify(userRegResponse.data, null, 2));

        console.log('\n=== Testing User Login ===');
        const userLoginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: userEmail,
            password: 'Test1234',
            role: 'user'
        });
        console.log('User Login Response:', JSON.stringify(userLoginResponse.data, null, 2));

        console.log('\n=== Testing Admin Registration ===');
        const adminRegResponse = await axios.post('http://localhost:5000/api/auth/register', {
            name: 'Test Admin',
            email: adminEmail,
            password: 'Admin1234',
            phone: '9876543210',
            employeeId: `ADM${timestamp}`,
            department: 'IT',
            adminCode: 'admin123',
            role: 'admin'
        });
        console.log('Admin Registration Response:', JSON.stringify(adminRegResponse.data, null, 2));

        console.log('\n=== Testing Admin Login ===');
        const adminLoginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: adminEmail,
            password: 'Admin1234',
            role: 'admin'
        });
        console.log('Admin Login Response:', JSON.stringify(adminLoginResponse.data, null, 2));

    } catch (error) {
        console.error('\n=== Error ===');
        if (error.response) {
            console.error('Error Response:', JSON.stringify(error.response.data, null, 2));
            console.error('Status Code:', error.response.status);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testAuth();
