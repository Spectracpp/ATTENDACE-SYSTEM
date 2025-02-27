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
      
      // Make sure we're using the correct endpoint
      const response = await fetch('http://localhost:5000/api/users/profile', {
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
        throw new Error(`Failed to fetch user profile: ${response.status}`);
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError) {
      // Clear the timeout if it's a fetch error
      clearTimeout(timeoutId);
      
      console.error('Error fetching user profile:', fetchError);
      
      // Check if it's a network error or timeout
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timed out. Please try again.' },
          { status: 504 }
        );
      }
      
      // Return appropriate error response
      return NextResponse.json(
        { error: fetchError.message || 'Failed to fetch user profile' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Server error in profile API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    // Add timeout controller to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      // Get authentication token from cookies
      const cookieStore = await cookies();
      const token = cookieStore.get('token')?.value;
      
      // Parse request body
      const body = await request.json();
      
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      // Clear the timeout
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to update user profile: ${response.status}`);
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError) {
      // Clear the timeout if it's a fetch error
      clearTimeout(timeoutId);
      
      console.error('Error updating user profile:', fetchError);
      
      // Check if it's a network error or timeout
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timed out. Please try again.' },
          { status: 504 }
        );
      }
      
      // Return appropriate error response
      return NextResponse.json(
        { error: fetchError.message || 'Failed to update user profile' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Server error in profile API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
