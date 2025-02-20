import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Create response that will clear the token cookie
    const response = NextResponse.json({ 
      success: true,
      message: 'Logged out successfully'
    });

    // Clear the token cookie
    response.cookies.delete('token');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to logout'
    }, { status: 500 });
  }
}
