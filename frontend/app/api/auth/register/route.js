import { NextResponse } from 'next/server';

// Password validation function
const validatePassword = (password) => {
  if (!password) return false;
  if (password.length < 6) return false;
  if (!/(?=.*[a-z])/.test(password)) return false;
  if (!/(?=.*[A-Z])/.test(password)) return false;
  if (!/(?=.*\d)/.test(password)) return false;
  if (!/(?=.*[@$!%*?&])/.test(password)) return false;
  return true;
};

export async function POST(req) {
  try {
    const body = await req.json();
    console.log('Registration request received:', { 
      ...body,
      password: '***hidden***'
    });

    const { role, password, email } = body;

    // Validate role
    if (!role || !['user', 'admin'].includes(role)) {
      console.log('Invalid role specified:', role);
      return NextResponse.json(
        { success: false, message: 'Invalid role specified' },
        { status: 400 }
      );
    }

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      console.log('Invalid email format:', email);
      return NextResponse.json({
        success: false,
        message: 'Invalid email format',
        field: 'email'
      }, { status: 400 });
    }

    // Validate password format
    if (!validatePassword(password)) {
      console.log('Invalid password format');
      return NextResponse.json({
        success: false,
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        field: 'password'
      }, { status: 400 });
    }

    // Make request to backend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    console.log('Making request to backend:', `${backendUrl}/api/auth/register`);

    // If organizationId is provided but organizationName is not, try to fetch it
    let requestBody = {
      ...body,
      email: email.toLowerCase().trim(),
      password: password.trim(), // Trim password to match login behavior
      role: role
    };

    // If we have organizationId but no organizationName, we need to add it
    if (body.organizationId && !body.organizationName) {
      try {
        // Fetch organization details to get the name
        const orgResponse = await fetch(`${backendUrl}/api/organizations/${body.organizationId}`);
        if (orgResponse.ok) {
          const orgData = await orgResponse.json();
          if (orgData.success && orgData.organization) {
            requestBody.organizationName = orgData.organization.name;
            console.log('Added organization name:', orgData.organization.name);
          }
        }
      } catch (error) {
        console.error('Error fetching organization details:', error);
      }
    }

    const response = await fetch(`${backendUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
      console.log('Registration failed:', {
        status: response.status,
        message: data.message,
        field: data.field
      });

      return NextResponse.json({
        success: false,
        message: data.message || 'Registration failed',
        field: data.field
      }, { status: response.status });
    }

    console.log('Registration successful');

    // Return success response with token
    const res = NextResponse.json({
      success: true,
      message: 'Registration successful'
    });

    // Set token in cookie if provided
    if (data.token) {
      res.cookies.set('token', data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 24 * 60 * 60 // 24 hours
      });
    }

    return res;

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error during registration'
    }, { status: 500 });
  }
}
