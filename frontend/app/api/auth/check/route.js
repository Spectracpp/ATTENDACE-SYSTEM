import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Get token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
      console.log('No token found in cookies');
      return NextResponse.json({
        success: false,
        message: 'Not authenticated'
      }, { status: 401 });
    }

    // Make request to backend to verify token
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    console.log('Checking auth with backend:', `${backendUrl}/api/auth/check`);

    try {
      const response = await fetch(`${backendUrl}/api/auth/check`, {
        headers: {
          'Authorization': `Bearer ${token.value}`
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        console.log('Auth check failed:', {
          status: response.status
        });

        // Clear invalid token
        const res = NextResponse.json({
          success: false,
          message: 'Authentication failed'
        }, { status: 401 });

        res.cookies.delete('token');
        return res;
      }

      const data = await response.json();

      console.log('Auth check successful:', {
        email: data.user?.email,
        role: data.user?.role
      });

      return NextResponse.json({
        success: true,
        user: data.user
      });
    } catch (fetchError) {
      console.error('Fetch error during auth check:', fetchError);
      
      // Don't delete the token on network errors
      // This prevents logout on temporary network issues
      return NextResponse.json({
        success: false,
        message: 'Network error during authentication check'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error during auth check'
    }, { status: 500 });
  }
}
