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
      
      if (!token) {
        // If no token is found, return fallback data with a warning
        console.warn('No authentication token found, using fallback data');
        return NextResponse.json(getFallbackData('No authentication token found'));
      }
      
      const response = await fetch('http://localhost:5000/api/user/organizations', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        signal: controller.signal,
        cache: 'no-store' // Disable caching to always get fresh data
      });

      // Clear the timeout
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`Failed to fetch user organizations: ${response.status}`);
        return NextResponse.json(getFallbackData(`Backend API error: ${response.status}`));
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error(`Non-JSON response received: ${text.substring(0, 100)}...`);
        return NextResponse.json(getFallbackData('Non-JSON response from backend'));
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError) {
      // Clear the timeout if it's a fetch error
      clearTimeout(timeoutId);
      
      console.error('Error fetching user organizations:', fetchError);
      
      // Check if it's a network error or timeout
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(getFallbackData('Request timed out'));
      } else {
        return NextResponse.json(getFallbackData(`Network error: ${fetchError.message}`));
      }
    }
  } catch (error) {
    console.error('Unexpected error in user organizations API route:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve user organizations',
      organizations: [] // Return empty array to prevent UI errors
    }, { status: 500 });
  }
}

// Helper function to return consistent fallback data
function getFallbackData(reason) {
  return {
    success: true,
    message: `Using fallback data: ${reason}`,
    organizations: [
      {
        _id: '1',
        name: 'Manav Rachna International University',
        type: 'Educational',
        members: [
          {
            user: {
              _id: 'user1',
              name: 'Current User'
            },
            role: 'Member'
          }
        ],
        joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: '2',
        name: 'Delhi Public School',
        type: 'Educational',
        members: [
          {
            user: {
              _id: 'user1',
              name: 'Current User'
            },
            role: 'Member'
          }
        ],
        joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  };
}
