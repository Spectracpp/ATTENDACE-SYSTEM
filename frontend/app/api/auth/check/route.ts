import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const token = cookies().get('token')?.value;
    
    if (!token) {
      console.log('Auth check: No token found');
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }

    console.log('Auth check: Token found, validating with backend...');

    // Make a request to your backend API to validate the token
    const apiResponse = await fetch('http://localhost:5000/api/auth/check', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('Auth check: Backend response status:', apiResponse.status);

    if (!apiResponse.ok) {
      return NextResponse.json(
        { message: 'Authentication failed' },
        { status: apiResponse.status }
      );
    }

    const data = await apiResponse.json();
    console.log('Auth check: User data retrieved:', data.user);

    return NextResponse.json({
      success: true,
      user: data.user,
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
