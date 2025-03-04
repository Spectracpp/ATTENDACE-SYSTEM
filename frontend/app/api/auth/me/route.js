import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Get the token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get('token');
    const role = cookieStore.get('role');

    if (!token?.value) {
      console.log('No token found in cookies');
      return NextResponse.json({
        success: false,
        message: 'Not authenticated'
      }, { status: 401 });
    }

    // Make request to backend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    console.log('Making request to backend:', `${backendUrl}/api/auth/check`);

    const response = await fetch(`${backendUrl}/api/auth/check`, {
      headers: {
        'Cookie': `token=${token.value}; role=${role?.value || ''}`
      },
      credentials: 'include',
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      console.log('Auth check failed:', {
        status: response.status,
        message: data.message
      });

      // Clear invalid token
      const res = NextResponse.json({
        success: false,
        message: data.message || 'Authentication failed'
      }, { status: response.status });

      // Clear cookies on auth failure
      res.cookies.delete('token');
      res.cookies.delete('role');
      
      return res;
    }

    console.log('Auth check successful:', {
      email: data.user.email,
      role: data.user.role
    });

    return NextResponse.json({
      success: true,
      user: data.user
    });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error during auth check'
    }, { status: 500 });
  }
}
