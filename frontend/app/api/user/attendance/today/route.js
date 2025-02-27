import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Add timeout controller to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      // Get authentication token from cookies
      const cookieStore = await cookies();
      const token = cookieStore.get('token')?.value;
      
      const response = await fetch('http://localhost:5000/api/user/attendance/today', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        signal: controller.signal,
        cache: 'no-store' // Disable caching to always get fresh data
      });

      // Clear the timeout
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to check today's attendance: ${response.status}`);
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError) {
      // Clear the timeout if it's a fetch error
      clearTimeout(timeoutId);
      
      console.error('Error checking today\'s attendance:', fetchError);
      
      // Check if it's a network error or timeout
      if (fetchError.name === 'AbortError') {
        console.log('Request timed out, using fallback data');
      } else if (fetchError.message.includes('fetch')) {
        console.log('Network error, using fallback data');
      }
      
      // Return fallback data
      return NextResponse.json({
        success: true,
        message: 'Using fallback attendance data',
        marked: false
      });
    }
  } catch (error) {
    console.error('Unexpected error in today\'s attendance API route:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to check today\'s attendance',
      marked: false
    }, { status: 500 });
  }
}
