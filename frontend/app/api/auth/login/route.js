import { NextResponse } from 'next/server';

export async function GET() {
  // Redirect to /auth/login/user
  return NextResponse.redirect(new URL('/auth/login/user', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password, role = 'user' } = body; // Default role to 'user'

    // Log login attempt
    console.log('Frontend - Login attempt:', { 
      email, 
      role,
      hasPassword: !!password 
    });

    // Validate required fields
    if (!email || !password) {
      console.log('Frontend - Missing required fields:', { 
        email: !!email, 
        password: !!password,
        passwordLength: password?.length 
      });
      return NextResponse.json({
        success: false,
        message: 'Email and password are required'
      }, { status: 400 });
    }

    // Validate role
    if (!['user', 'admin'].includes(role)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid role specified'
      }, { status: 400 });
    }

    // Trim whitespace and validate
    const trimmedEmail = email.toLowerCase().trim();
    const trimmedPassword = password.trim();

    console.log('Frontend - Login details:', {
      email: trimmedEmail,
      role,
      passwordLength: trimmedPassword.length
    });

    // Make request to backend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    console.log('Frontend - Making request to backend:', `${backendUrl}/api/auth/login`);

    const response = await fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        email: trimmedEmail,
        password: trimmedPassword,
        role
      }),
      credentials: 'include', // Important: This allows cookies to be sent and received
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      console.log('Login failed:', {
        status: response.status,
        message: data.message,
        role
      });

      return NextResponse.json({
        success: false,
        message: data.message || 'Invalid email or password'
      }, { status: response.status });
    }

    // Get cookies from backend response
    const cookies = response.headers.get('set-cookie');
    console.log('Login successful:', {
      email: data.user.email,
      role: data.user.role,
      hasCookies: !!cookies
    });

    // Create response with user data and forward cookies
    const res = NextResponse.json({
      success: true,
      user: data.user
    });

    // Forward the cookies from the backend
    if (cookies) {
      res.headers.set('set-cookie', cookies);
    }

    return res;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error during login'
    }, { status: 500 });
  }
}
