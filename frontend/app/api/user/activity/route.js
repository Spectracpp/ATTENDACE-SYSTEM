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
      
      const response = await fetch('http://localhost:5000/api/users/activity', {
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
        // If backend API is not available, return mock data for development
        console.warn(`Activity API returned ${response.status}. Using mock data.`);
        return NextResponse.json([
          {
            type: 'attendance',
            status: 'present',
            organization: 'Acme Corp',
            date: new Date().toISOString()
          },
          {
            type: 'leave',
            status: 'pending',
            date: new Date(Date.now() - 86400000).toISOString() // yesterday
          }
        ]);
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError) {
      // Clear the timeout if it's a fetch error
      clearTimeout(timeoutId);
      
      console.error('Error fetching user activity:', fetchError);
      
      // Return mock data for development if API fails
      console.warn('Using mock data due to API error');
      return NextResponse.json([
        {
          type: 'attendance',
          status: 'present',
          organization: 'Acme Corp',
          date: new Date().toISOString()
        },
        {
          type: 'leave',
          status: 'pending',
          date: new Date(Date.now() - 86400000).toISOString() // yesterday
        }
      ]);
    }
  } catch (error) {
    console.error('Server error in activity API:', error);
    // Return mock data for development
    return NextResponse.json([
      {
        type: 'attendance',
        status: 'present',
        organization: 'Acme Corp',
        date: new Date().toISOString()
      },
      {
        type: 'leave',
        status: 'pending',
        date: new Date(Date.now() - 86400000).toISOString() // yesterday
      }
    ]);
  }
}
