import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, role } = body;

    console.log('Login attempt:', { email, role });

    // Make a request to your backend API
    const apiResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, role }),
    });

    console.log('Backend response status:', apiResponse.status);

    // Check if response is ok before trying to parse JSON
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      try {
        const errorData = JSON.parse(errorText);
        return NextResponse.json(
          { message: errorData.message || 'Login failed' },
          { status: apiResponse.status }
        );
      } catch (e) {
        return NextResponse.json(
          { message: 'Login failed: ' + errorText },
          { status: apiResponse.status }
        );
      }
    }

    const data = await apiResponse.json();
    console.log('Login successful, user data:', data.user);
    
    // Create response with the data
    const res = NextResponse.json({
      success: true,
      user: data.user,
      token: data.token // Include token in response for debugging
    });

    // Set cookies for token and role
    res.cookies.set({
      name: 'token',
      value: data.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    res.cookies.set({
      name: 'role',
      value: data.user.role,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return res;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
